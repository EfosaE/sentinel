// ============================================================================
// RULE-BASED RISK SCORING NODE (Now Dynamic)
// ============================================================================
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GraphNode } from "@langchain/langgraph";

import { LLMAssessmentSchema, RuleBook } from "../types/schema.js";
import { TransactionEvent } from "../types/schema.js";
import { evaluateRule, NIGERIAN_FINTECH_RULEBOOK } from "./rule-engine.js";
import { FraudAgentState } from "./state.js";

const rulebook: RuleBook = NIGERIAN_FINTECH_RULEBOOK;

export const applyRiskRules: GraphNode<typeof FraudAgentState> = (
  state,
  config,
) => {
  const { transaction } = state;
  let totalScore = 0;
  const triggeredFlags: string[] = [];

  // Evaluate each rule
  for (const rule of rulebook.rules) {
    const triggered = evaluateRule(
      transaction as TransactionEvent,
      rule,
      rulebook,
    );

    if (triggered) {
      totalScore += rule.riskScore;
      triggeredFlags.push(rule.flagCode);
    }
  }

  return {
    riskScore: Math.min(totalScore, 100),
    ruleFlags: triggeredFlags,
  };
};

export const draftAssessment: GraphNode<typeof FraudAgentState> = async (
  state,
  config,
) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY environment variable is not set");
  }

  const model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: "gemini-2.5-flash-lite",
    temperature: 0, // Lower temperature is usually better for tool calling
  });

  const structuredLLM = model.withStructuredOutput(LLMAssessmentSchema);

  const transaction = state.transaction as TransactionEvent;

  const prompt = `You are a fraud detection expert for a Nigerian fintech company. Analyze this transaction for potential fraud risk.

Transaction Details:
- Amount: ₦${transaction.amount.toLocaleString()}
- Type: ${transaction.transactionType}
- Channel: ${transaction.channel}
- KYC Tier: ${transaction.kycTier}
- BVN Verified: ${transaction.bvnVerified ? "Yes" : "No"}
- Account Age: ${transaction.accountAge.toLocaleString()} days
- Time: ${transaction.timestamp}
- Location: ${transaction.location.state ?? "Unknown"}, ${transaction.location.country}
- New Recipient: ${transaction.recipientNew ? "Yes" : "No"}
- User's Average Transaction: ₦${transaction.userHistory.avgTransactionAmount.toLocaleString()}
- Failed Transactions (24h): ${transaction.userHistory.failedTransactionsLast24h.toLocaleString()}
- Daily Transaction Count: ${transaction.userHistory.dailyTransactionCount.toLocaleString()}

Rule-Based Risk Score: ${state.riskScore as string}/100
Flags Raised: ${(state.ruleFlags as string[]).join(", ") || "None"}

Consider Nigerian fintech fraud patterns:
- SIM swap attacks (especially with unverified BVN)
- Account takeover
- Money mule activity
- Romance/investment scams
- Structuring to avoid AML thresholds
- New account fraud
- Unusual transaction patterns for the Nigerian market

Provide your risk assessment.`;

  const assessment = await structuredLLM.invoke(prompt);

  return {
    llmAssessment: assessment.riskLevel,
    llmConcerns: assessment.concerningPatterns,
    llmReasoning: assessment.reasoning,
  };
};

// ============================================================================
// DECISION NODE
// ============================================================================

export const makeDecision: GraphNode<typeof FraudAgentState> = (state) => {
  const { llmAssessment, riskScore, ruleFlags } = state;

  let decision: "ALLOW" | "BLOCK" | "REVIEW";

  // Critical flags always block
const hasCriticalFlag: boolean = (ruleFlags as string[]).some(
    (flag: string) => flag.includes("CBN_001") || flag.includes("CBN_002"),
);

  if (hasCriticalFlag) {
    decision = "BLOCK";
  }
  // High confidence block
  else if (riskScore as number >= 80 || llmAssessment === "high") {
    decision = "BLOCK";
  }
  // Manual review needed
  else if (riskScore as number >= 40 || llmAssessment === "medium") {
    decision = "REVIEW";
  }
  // LLM override check
  else if (riskScore as number >= 25 && llmAssessment === "low") {
    decision = "REVIEW";
  }
  // Allow transaction
  else {
    decision = "ALLOW";
  }

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const summary = `Transaction ${decision}: Risk Score=${riskScore}, LLM Assessment=${llmAssessment}, Flags=[${(ruleFlags as string[]).join(", ") || "None"}]`;

  return {
    finalDecision: decision,
    summary,
  };
};
