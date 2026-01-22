// import express from "express";
import { FraudStateType } from "./utils/state.js";
import { fraudAgent } from "./agent.js";
import { TransactionEvent } from "./types/schema.js";

// const app = express();
// const port = "3000";

// Example high-risk transaction
export const exampleHighRiskTransaction: TransactionEvent = {
  id: "txn_123456",
  amount: 450000, // Just below structuring threshold
  currency: "NGN",
  timestamp: new Date("2026-01-21T23:30:00Z").toISOString(),
  userId: "user_abc",
  accountAge: 3,
  recipientId: "recipient_xyz",
  recipientNew: true,
  transactionType: "TRANSFER",
  channel: "MOBILE",
  location: {
    state: "Lagos",
    country: "NG",
    ipAddress: "102.89.32.10",
  },
  deviceFingerprint: "device_fingerprint_123",
  userHistory: {
    avgTransactionAmount: 50000,
    totalTransactions: 15,
    failedTransactionsLast24h: 4,
    dailyTransactionCount: 6,
    dailyTransactionVolume: 2500000,
  },
  kycTier: "TIER_1",
  bvnVerified: false,
};

// Test with an urgent billing issue
const initialState: FraudStateType = {
  transaction: exampleHighRiskTransaction,
  riskScore: 0,
  ruleFlags: [],
};

// Run with a thread_id for persistence
const config = { configurable: { thread_id: "customer_123" } };
const result = await fraudAgent.invoke(initialState, config);
console.log(result);

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });
