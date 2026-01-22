// export interface FraudState {
//   finalDecision?: "ALLOW" | "BLOCK" | "REVIEW";
//   llmAssessment?: "high" | "low" | "medium";
//   riskScore: number; // numeric score
//   ruleFlags: string[]; // e.g. ["NEW_ACCOUNT", "ODD_HOUR"]
//   summary?: string;
//   transaction: TransactionEvent;
// }

// export interface TransactionEvent {
//   amount: number;
//   channel: "card" | "transfer" | "ussd";
//   deviceId?: string;
//   ipLocation?: string;
//   receiverAccountAgeDays: number;
//   receiverBank: string;
//   senderAccountAgeDays: number;
//   senderBank: string;
//   senderCustomerId: string;
//   timestamp: string; // ISO 8601 format
//   transactionId: string;
// }
