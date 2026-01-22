import { StateSchema } from "@langchain/langgraph";
import * as z from "zod";

import { TransactionEventSchema } from "../types/schema.js";

export const FraudStateSchema = z.object({
  finalDecision: z.enum(["ALLOW", "BLOCK", "REVIEW"]).optional(),
  llmAssessment: z.enum(["high", "medium", "low"]).optional(),
  llmConcerns: z.array(z.string()).optional(),
  llmReasoning: z.string().optional(),
  riskScore: z.number().min(0).max(100).default(0),
  ruleFlags: z.array(z.string()).default([]),
  summary: z.string().optional(),
  transaction: TransactionEventSchema,
});

// Fraud State Schema
export const FraudAgentState = new StateSchema(FraudStateSchema.shape);


export type FraudStateType = z.infer<typeof FraudStateSchema>;

