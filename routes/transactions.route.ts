import { Router } from "express";
import {
  addNewTxRecord,
  assessTransactionRisk,
  getAllTrxs,
  getUserTrxs,
} from "../controllers/transactions.controller.js";

const transactionRouter = Router();

transactionRouter.route("/analyse").post(assessTransactionRisk);
transactionRouter.route("/:userId").get(getUserTrxs);
transactionRouter.route("/all/:page/:pageSize").get((req, res) => {
  // Placeholder for getting all transactions with pagination
  res.send("Get all transactions with pagination");
});

transactionRouter.route("/").get(getAllTrxs).post(addNewTxRecord);
export default transactionRouter;
