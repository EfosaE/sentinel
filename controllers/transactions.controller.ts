import { Request, RequestHandler, Response } from "express";

import {
  TransactionEvent,
  TransactionEventSchema,
} from "../src/types/schema.js";
import { addNewTx, getAllTxs } from "../src/database/queries.js";
import { FraudStateType } from "../src/utils/state.js";
import { fraudAgent } from "../src/agent.js";

export const addNewTxRecord = (req: Request, res: Response) => {
  console.log("Received transaction:", req.body);
  try {
    // Basic runtime check (for demo, not full validation)
    const tx = req.body as Partial<TransactionEvent>;
    if (!tx.id || !tx.userId || !tx.recipientId) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required transaction fields" });
    }

    // Map TransactionEvent to SQL parameters in correct order
    const params = [
      tx.id ?? null,
      tx.userId ?? null,
      tx.recipientId ?? null,
      tx.amount ?? null,
      tx.currency ?? null,
      tx.channel ?? null,
      tx.transactionType ?? null,
      tx.kycTier ?? null,
      tx.accountAge ?? null,
      typeof tx.bvnVerified === "boolean" ? (tx.bvnVerified ? 1 : 0) : null,
      typeof tx.recipientNew === "boolean" ? (tx.recipientNew ? 1 : 0) : null,
      tx.deviceFingerprint ?? null,
      tx.location?.country ?? null,
      tx.location?.state ?? null,
      tx.location?.ipAddress ?? null,
      tx.userHistory?.avgTransactionAmount ?? null,
      tx.userHistory?.dailyTransactionCount ?? null,
      tx.userHistory?.dailyTransactionVolume ?? null,
      tx.userHistory?.failedTransactionsLast24h ?? null,
      tx.userHistory?.totalTransactions ?? null,
      tx.timestamp ?? null,
    ];

    const newTrx = addNewTx.get(...params);
    res.status(201).json({ success: true, data: newTrx });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const assessTransactionRisk = async (req: Request, res: Response) => {
  try {
    const parseResult = TransactionEventSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid transaction payload",
        details: parseResult.error.issues,
      });
    }
    const transaction = parseResult.data;
    const initialState: FraudStateType = {
      transaction,
      riskScore: 0,
      ruleFlags: [],
    };
    const config = {
      configurable: { thread_id: transaction.userId || "anonymous" },
    };
    const result = await fraudAgent.invoke(initialState, config);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const getUserTrxs: RequestHandler = (req, res) => {
  const { userId } = req.params;
  const { limit, offset } = req.query;

  res.json({
    userId,
    limit,
    offset,
  });
};

export const getAllTrxs: RequestHandler = (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    const transactions = getAllTxs.all(limit, offset);

    res.json({
      pagination: {
        limit,
        offset,
        count: transactions.length,
      },
      data: transactions,
    });
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};
