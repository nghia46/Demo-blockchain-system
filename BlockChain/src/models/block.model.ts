import type { Transaction } from "./transaction.model";

export interface Block {
  index: number;           // Số thứ tự block
  previousHash: string;    // Hash của block trước
  timestamp: number;       // Thời gian tạo block
  transactions: Transaction[]; // Danh sách giao dịch
  nonce: number;           // Nonce dùng cho PoW
  hash: string;            // Hash của block
  miner: string;           // Miner nhận thưởng
}
