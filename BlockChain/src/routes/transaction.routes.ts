import express from "express";
import { addTransaction } from "../blockchain";
import type { Transaction } from "../models/transaction.model";

const router = express.Router();

// API tạo giao dịch mới
router.post("/transaction", (req: any, res: any) => {
  const { sender, receiver, amount, fee } = req.body;

  if (!sender || !receiver || amount <= 0 || fee < 0) {
    return res.status(400).json({ error: "Invalid transaction data" });
  }

  const transaction: Transaction = {
    sender,
    receiver,
    amount,
    fee,
    timestamp: Date.now(),
  };
  addTransaction(transaction);
  res.json({ message: "Transaction added", transaction });
});

export default router;
