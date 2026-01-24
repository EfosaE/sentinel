import express from "express";

import transactionRouter from "../routes/transactions.route.js";

const app = express();
app.use(express.json());
const port = "3000";

// ...existing code...

app.use("/api/v1/transactions", transactionRouter);

app.listen(port, () => {
  console.log(`Sentinel listening on port ${port}`);
});
