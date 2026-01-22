/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { RiskRule, RuleBook, RuleCondition, TransactionEvent } from "../types/schema.js";

// ============================================================================
// SIMULATED RULEBOOK (Based on CBN regulations and typical fintech policies)
// ============================================================================

export const NIGERIAN_FINTECH_RULEBOOK: RuleBook = {
  effectiveDate: "2026-01-01",
  kycLimits: {
    TIER_0: { dailyLimit: 0, singleTransactionLimit: 0 }, // Not allowed
    TIER_1: { dailyLimit: 50000, singleTransactionLimit: 50000 },
    TIER_2: { dailyLimit: 200000, singleTransactionLimit: 200000 },
    TIER_3: { dailyLimit: 1000000, singleTransactionLimit: 1000000 },
  },
  lastUpdated: "2026-01-15",
  regulatoryFramework: {
    cbnCirculars: [
      "PSM/DIR/PUB/CIR/01/037 - Guidelines on Electronic Banking",
      "FPR/DIR/GEN/CIR/07/010 - KYC Requirements",
      "BSD/DIR/GEN/LAB/11/021 - AML/CFT Regulations",
    ],
    internalPolicies: [
      "FraudPrevention-Policy-v3.2",
      "TransactionMonitoring-SOP-v2.0",
    ],
  },
  rules: [
    // CBN REGULATORY RULES
    {
      category: "CBN_REGULATORY",
      conditions: [
        {
          field: "amount",
          logicalOperator: "AND",
          operator: "GREATER_THAN",
          value: 0, // This will be checked dynamically against tier limits
        },
      ],
      description: "CBN mandated single transaction limits based on KYC tier",
      enabled: true,
      flagCode: "CBN_001_TIER_LIMIT_EXCEEDED",
      id: "rule_001",
      metadata: {
        effectiveDate: "2020-10-01",
        lastUpdated: "2026-01-10",
        regulatoryReference: "FPR/DIR/GEN/CIR/07/010",
        updatedBy: "compliance@fintech.ng",
      },
      name: "KYC Tier Single Transaction Limit",
      riskScore: 100,
      severity: "CRITICAL",
    },
    {
      category: "CBN_REGULATORY",
      conditions: [
        {
          field: "bvnVerified",
          logicalOperator: "AND",
          operator: "EQUALS",
          value: false,
        },
        {
          field: "amount",
          operator: "GREATER_THAN",
          value: 10000,
        },
      ],
      description: "Transactions from accounts without BVN verification",
      enabled: true,
      flagCode: "CBN_002_BVN_UNVERIFIED",
      id: "rule_002",
      metadata: {
        lastUpdated: "2026-01-10",
        regulatoryReference: "BSD/DIR/GEN/LAB/11/021",
        updatedBy: "compliance@fintech.ng",
      },
      name: "Unverified BVN Transaction",
      riskScore: 80,
      severity: "CRITICAL",
    },
    // INTERNAL POLICY RULES
    {
      category: "INTERNAL_POLICY",
      conditions: [
        {
          field: "accountAge",
          logicalOperator: "AND",
          operator: "LESS_THAN",
          value: 7,
        },
        {
          field: "amount",
          operator: "GREATER_THAN",
          value: 100000,
        },
      ],
      description:
        "Account less than 7 days old attempting high value transaction",
      enabled: true,
      flagCode: "POL_003_NEW_ACCOUNT_HIGH_VALUE",
      id: "rule_003",
      metadata: {
        lastUpdated: "2026-01-10",
        updatedBy: "risk@fintech.ng",
      },
      name: "New Account High Value Transaction",
      riskScore: 35,
      severity: "HIGH",
    },
    {
      category: "INTERNAL_POLICY",
      conditions: [
        {
          field: "amount",
          operator: "GREATER_THAN",
          value: 50000,
        },
      ],
      description: "Transaction during unusual hours (11PM - 5AM WAT)",
      enabled: true,
      flagCode: "POL_004_ODD_HOURS",
      id: "rule_004",
      metadata: {
        lastUpdated: "2026-01-10",
        updatedBy: "risk@fintech.ng",
      },
      name: "Odd Hours Transaction",
      riskScore: 15,
      severity: "MEDIUM",
    },
    {
      category: "ACCOUNT_SECURITY",
      conditions: [
        {
          field: "recipientNew",
          logicalOperator: "AND",
          operator: "EQUALS",
          value: true,
        },
        {
          field: "amount",
          operator: "GREATER_THAN",
          value: 200000,
        },
      ],
      description: "First-time recipient with high transaction amount",
      enabled: true,
      flagCode: "SEC_005_NEW_RECIPIENT_HIGH_AMT",
      id: "rule_005",
      metadata: {
        lastUpdated: "2026-01-10",
        updatedBy: "risk@fintech.ng",
      },
      name: "New Recipient High Amount",
      riskScore: 20,
      severity: "MEDIUM",
    },
    // AML/CTF RULES
    {
      category: "AML_CTF",
      conditions: [
        {
          field: "userHistory.dailyTransactionCount",
          logicalOperator: "AND",
          operator: "GREATER_THAN",
          value: 5,
        },
        {
          field: "amount",
          operator: "BETWEEN",
          value: [400000, 500000], // Just below ₦500k threshold
        },
      ],
      description: "Multiple transactions just below reporting threshold",
      enabled: true,
      flagCode: "AML_006_STRUCTURING",
      id: "rule_006",
      metadata: {
        lastUpdated: "2026-01-10",
        regulatoryReference: "BSD/DIR/GEN/LAB/11/021",
        updatedBy: "compliance@fintech.ng",
      },
      name: "Structuring Detection",
      riskScore: 45,
      severity: "HIGH",
    },
    // VELOCITY CHECKS
    {
      category: "VELOCITY_CHECK",
      conditions: [
        {
          field: "userHistory.dailyTransactionVolume",
          operator: "GREATER_THAN",
          value: 0, // Checked dynamically
        },
      ],
      description: "User exceeded typical daily transaction volume by 300%",
      enabled: true,
      flagCode: "VEL_007_DAILY_VOLUME_SPIKE",
      id: "rule_007",
      metadata: {
        lastUpdated: "2026-01-10",
        updatedBy: "risk@fintech.ng",
      },
      name: "Daily Transaction Volume Exceeded",
      riskScore: 30,
      severity: "HIGH",
    },
    {
      category: "ACCOUNT_SECURITY",
      conditions: [
        {
          field: "userHistory.failedTransactionsLast24h",
          operator: "GREATER_THAN",
          value: 3,
        },
      ],
      description: "Multiple failed transaction attempts in 24 hours",
      enabled: true,
      flagCode: "SEC_008_MULTIPLE_FAILED",
      id: "rule_008",
      metadata: {
        lastUpdated: "2026-01-10",
        updatedBy: "risk@fintech.ng",
      },
      name: "Multiple Failed Attempts",
      riskScore: 25,
      severity: "HIGH",
    },
    // BEHAVIORAL ANOMALY
    {
      category: "BEHAVIORAL_ANOMALY",
      conditions: [
        {
          field: "amount",
          operator: "GREATER_THAN",
          value: 0, // Checked dynamically against avg
        },
      ],
      description: "Transaction amount exceeds user's average by 500%",
      enabled: true,
      flagCode: "BEH_009_AMOUNT_ANOMALY",
      id: "rule_009",
      metadata: {
        lastUpdated: "2026-01-10",
        updatedBy: "risk@fintech.ng",
      },
      name: "Amount Anomaly Detection",
      riskScore: 25,
      severity: "MEDIUM",
    },
    {
      category: "INTERNAL_POLICY",
      conditions: [
        {
          field: "location.country",
          operator: "NOT_EQUALS",
          value: "NG",
        },
      ],
      description: "Transaction from outside Nigeria",
      enabled: true,
      flagCode: "POL_010_FOREIGN_TXN",
      id: "rule_010",
      metadata: {
        lastUpdated: "2026-01-10",
        updatedBy: "risk@fintech.ng",
      },
      name: "Foreign Transaction",
      riskScore: 20,
      severity: "MEDIUM",
    },
    {
      category: "INTERNAL_POLICY",
      conditions: [
        {
          field: "transactionType",
          logicalOperator: "AND",
          operator: "EQUALS",
          value: "WITHDRAWAL",
        },
        {
          field: "amount",
          operator: "GREATER_THAN",
          value: 500000,
        },
      ],
      description: "Large withdrawal transactions require additional scrutiny",
      enabled: true,
      flagCode: "POL_011_LARGE_WITHDRAWAL",
      id: "rule_011",
      metadata: {
        lastUpdated: "2026-01-10",
        updatedBy: "risk@fintech.ng",
      },
      name: "Large Cash Withdrawal",
      riskScore: 20,
      severity: "MEDIUM",
    },
  ],
  version: "2.1.0",
};

export function evaluateCondition(
  transaction: TransactionEvent,
  condition: RuleCondition,
): boolean {
  // Get value from transaction using field path
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const fieldValue = getNestedValue(transaction, condition.field);

  switch (condition.operator) {
    case "BETWEEN":
      if (Array.isArray(condition.value) && condition.value.length === 2) {
        return (
          Number(fieldValue) >= Number(condition.value[0]) &&
          Number(fieldValue) <= Number(condition.value[1])
        );
      }
      return false;
    case "CONTAINS":
      return String(fieldValue).includes(String(condition.value));
    case "EQUALS":
      return fieldValue === condition.value;
    case "GREATER_THAN":
      return Number(fieldValue) > Number(condition.value);
    case "GREATER_THAN_OR_EQUAL":
      return Number(fieldValue) >= Number(condition.value);
    case "IN":
      return (
        Array.isArray(condition.value) && condition.value.includes(fieldValue)
      );
    case "LESS_THAN":
      return Number(fieldValue) < Number(condition.value);
    case "LESS_THAN_OR_EQUAL":
      return Number(fieldValue) <= Number(condition.value);
    case "NOT_EQUALS":
      return fieldValue !== condition.value;
    case "NOT_IN":
      return (
        Array.isArray(condition.value) && !condition.value.includes(fieldValue)
      );
    default:
      return false;
  }
}

export function evaluateRule(
  transaction: TransactionEvent,
  rule: RiskRule,
  rulebook: RuleBook
): boolean {
  if (!rule.enabled) return false;

  // Handle special dynamic checks
  if (rule.id === "rule_001") {
    // KYC tier limit check
    const tierLimit = rulebook.kycLimits[transaction.kycTier].singleTransactionLimit;
    return transaction.amount > tierLimit;
  }

  if (rule.id === "rule_007") {
    // Daily volume spike check
    const avgDaily = transaction.userHistory.avgTransactionAmount * 
                     transaction.userHistory.dailyTransactionCount;
    return transaction.userHistory.dailyTransactionVolume > avgDaily * 3;
  }

  if (rule.id === "rule_009") {
    // Amount anomaly check
    const threshold = transaction.userHistory.avgTransactionAmount * 5;
    return transaction.amount > threshold;
  }

  if (rule.id === "rule_004") {
    // Odd hours check
    const hour = new Date(transaction.timestamp).getUTCHours() + 1; // WAT = UTC+1
    const isOddHour = hour >= 23 || hour < 5;
    return isOddHour && evaluateCondition(transaction, rule.conditions[0]);
  }

  // Evaluate all conditions
  let result = true;
  for (let i = 0; i < rule.conditions.length; i++) {
    const condition = rule.conditions[i];
    const conditionResult = evaluateCondition(transaction, condition);

    if (i === 0) {
      result = conditionResult;
    } else {
      const prevCondition = rule.conditions[i - 1];
      if (prevCondition.logicalOperator === "AND") {
        result = result && conditionResult;
      } else if (prevCondition.logicalOperator === "OR") {
        result = result || conditionResult;
      }
    }
  }

  return result;
}


function getNestedValue(obj: any, path: string): any {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return path.split(".").reduce((current, key) => current?.[key], obj);
}