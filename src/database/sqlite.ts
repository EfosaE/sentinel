import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../../sentinel.db");

export const db = new DatabaseSync(dbPath);

// Run once at startup
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,

    -- Core relations
    user_id TEXT NOT NULL,
    recipient_id TEXT NOT NULL,

    -- Transaction data
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN',
    channel TEXT NOT NULL CHECK (
      channel IN ('WEB', 'MOBILE', 'API', 'USSD')
    ),
    transaction_type TEXT NOT NULL CHECK (
      transaction_type IN ('TRANSFER', 'WITHDRAWAL', 'PAYMENT', 'AIRTIME')
    ),

    -- Risk / KYC
    kyc_tier TEXT NOT NULL CHECK (
      kyc_tier IN ('TIER_0', 'TIER_1', 'TIER_2', 'TIER_3')
    ),
    account_age INTEGER NOT NULL,
    bvn_verified INTEGER NOT NULL CHECK (
      bvn_verified IN (0, 1)
    ),
    recipient_new INTEGER NOT NULL CHECK (
      recipient_new IN (0, 1)
    ),

    -- Device & Location
    device_fingerprint TEXT,
    location_country TEXT NOT NULL,
    location_state TEXT,
    location_ip TEXT,

    -- User behavior snapshot
    avg_transaction_amount REAL NOT NULL,
    daily_transaction_count INTEGER NOT NULL,
    daily_transaction_volume REAL NOT NULL,
    failed_transactions_last_24h INTEGER NOT NULL,
    total_transactions INTEGER NOT NULL,

    -- Time
    timestamp TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_user_id
    ON transactions(user_id);

  CREATE INDEX IF NOT EXISTS idx_transactions_timestamp
    ON transactions(timestamp);

  CREATE INDEX IF NOT EXISTS idx_transactions_recipient_id
    ON transactions(recipient_id);
`);
