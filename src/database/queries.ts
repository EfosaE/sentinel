import { db } from "./sqlite.js";

// Book operations
const addNewTx = db.prepare(`
  INSERT INTO transactions (
    id,
    user_id,
    recipient_id,
    amount,
    currency,
    channel,
    transaction_type,
    kyc_tier,
    account_age,
    bvn_verified,
    recipient_new,
    device_fingerprint,
    location_country,
    location_state,
    location_ip,
    avg_transaction_amount,
    daily_transaction_count,
    daily_transaction_volume,
    failed_transactions_last_24h,
    total_transactions,
    timestamp
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  RETURNING id, user_id, amount, currency, channel, timestamp
`);

const getUserTxs = db.prepare(`
  SELECT *
  FROM transactions
  WHERE user_id = ?
  ORDER BY timestamp DESC
  LIMIT ? OFFSET ?
`);

const getAllTxs = db.prepare(`
  SELECT *
  FROM transactions
  ORDER BY timestamp DESC
  LIMIT ? OFFSET ?
`);

// const rows = getUserTxs.all(userId, 20, 0); // page size 20


export { addNewTx, getUserTxs, getAllTxs };