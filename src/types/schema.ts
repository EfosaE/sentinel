import * as z from "zod";

// Condition operators
export const ConditionOperatorSchema = z.enum([
  "EQUALS",
  "NOT_EQUALS",
  "GREATER_THAN",
  "LESS_THAN",
  "GREATER_THAN_OR_EQUAL",
  "LESS_THAN_OR_EQUAL",
  "IN",
  "NOT_IN",
  "CONTAINS",
  "BETWEEN",
]);

export type ConditionOperator = z.infer<typeof ConditionOperatorSchema>;

// Transaction event schema
export const TransactionEventSchema = z.object({
  accountAge: z.number(), // days since account creation
  amount: z.number(),
  bvnVerified: z.boolean(),
  channel: z.enum(["WEB", "MOBILE", "API", "USSD"]),
  currency: z.string().default("NGN"),
   deviceFingerprint: z.string().optional(),
  id: z.string(),
  kycTier: z.enum(["TIER_0", "TIER_1", "TIER_2", "TIER_3"]),
  location: z.object({
    country: z.string(),
    ipAddress: z.string().optional(),
    state: z.string().optional(),
  }),
  recipientId: z.string(),
  recipientNew: z.boolean(), // is this a new recipient?
  timestamp: z.iso.datetime(),
  transactionType: z.enum(["TRANSFER", "WITHDRAWAL", "PAYMENT", "AIRTIME"]),
  userHistory: z.object({
    avgTransactionAmount: z.number(),
    dailyTransactionCount: z.number(),
    dailyTransactionVolume: z.number(),
    failedTransactionsLast24h: z.number(),
    totalTransactions: z.number(),
  }),
  userId: z.string(),
});

export type TransactionEvent = z.infer<typeof TransactionEventSchema>;

// Rule condition
export const RuleConditionSchema = z.object({
  field: z
    .string()
    .describe(
      "Path to field in transaction object (e.g., 'amount', 'transaction.accountAge')",
    ),
  logicalOperator: z
    .enum(["AND", "OR"])
    .optional()
    .describe("How to combine with next condition"),
  operator: ConditionOperatorSchema,
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.any())]),
});

export type RuleCondition = z.infer<typeof RuleConditionSchema>;

// Individual risk rule
export const RiskRuleSchema = z.object({
  category: z.enum([
    "CBN_REGULATORY",
    "INTERNAL_POLICY",
    "AML_CTF",
    "ACCOUNT_SECURITY",
    "VELOCITY_CHECK",
    "BEHAVIORAL_ANOMALY",
  ]),
  conditions: z.array(RuleConditionSchema),
  description: z.string(),
  enabled: z.boolean().default(true),
  flagCode: z.string().describe("Unique code for this flag (e.g., 'CBN_001')"),
  id: z.string(),
  metadata: z.object({
    effectiveDate: z.string().optional(),
    lastUpdated: z.string(),
    regulatoryReference: z
      .string()
      .optional()
      .describe("CBN circular/regulation reference"),
    updatedBy: z.string(),
  }),
  name: z.string(),
  riskScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Points added to total risk score"),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
});

export type RiskRule = z.infer<typeof RiskRuleSchema>;

// Complete rulebook
export const RuleBookSchema = z.object({
  effectiveDate: z.string(),
  kycLimits: z.object({
    TIER_0: z.object({
      dailyLimit: z.number(),
      singleTransactionLimit: z.number(),
    }),
    TIER_1: z.object({
      dailyLimit: z.number(),
      singleTransactionLimit: z.number(),
    }),
    TIER_2: z.object({
      dailyLimit: z.number(),
      singleTransactionLimit: z.number(),
    }),
    TIER_3: z.object({
      dailyLimit: z.number(),
      singleTransactionLimit: z.number(),
    }),
  }),
  lastUpdated: z.string(),
  regulatoryFramework: z.object({
    cbnCirculars: z.array(z.string()).describe("Applicable CBN circulars"),
    internalPolicies: z.array(z.string()),
  }),
  rules: z.array(RiskRuleSchema),
  version: z.string(),
});

export type RuleBook = z.infer<typeof RuleBookSchema>;

// LLM Assessment Schema for structured output
export const LLMAssessmentSchema = z.object({
  concerningPatterns: z
    .array(z.string())
    .describe("List of concerning patterns identified"),
  confidenceScore: z
    .number()
    .min(0)
    .max(1)
    .describe("Confidence in this assessment (0-1)"),
  reasoning: z.string().describe("Detailed explanation of the risk assessment"),
  riskLevel: z
    .enum(["high", "medium", "low"])
    .describe("Overall risk assessment"),
});

export type LLMAssessment = z.infer<typeof LLMAssessmentSchema>;
