// import { TransactionEvent } from "../types/schema.js";

// export function mapRowToTransaction(row: unknown): TransactionEvent {
//   return {
//     id: row.id,
//     userId: row.user_id,
//     recipientId: row.recipient_id,
//     amount: row.amount,
//     currency: row.currency,
//     channel: row.channel,
//     transactionType: row.transaction_type,
//     kycTier: row.kyc_tier,
//     accountAge: row.account_age,
//     bvnVerified: Boolean(row.bvn_verified),
//     recipientNew: Boolean(row.recipient_new),
//     deviceFingerprint: row.device_fingerprint ?? undefined,
//     location: {
//       country: row.location_country,
//       state: row.location_state ?? undefined,
//       ipAddress: row.location_ip ?? undefined
//     },
//     userHistory: {
//       avgTransactionAmount: row.avg_transaction_amount,
//       dailyTransactionCount: row.daily_transaction_count,
//       dailyTransactionVolume: row.daily_transaction_volume,
//       failedTransactionsLast24h: row.failed_transactions_last_24h,
//       totalTransactions: row.total_transactions
//     },
//     timestamp: row.timestamp
//   };
// }
