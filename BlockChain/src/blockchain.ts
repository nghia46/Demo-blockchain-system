import { query } from "./db";
import crypto from "crypto";
import type { Block } from "./models/block.model";
import type { Transaction } from "./models/transaction.model";
import { sendBlockToMiners } from "./rabbitmq";

const DIFFICULTY = 4;
const BLOCK_REWARD = 50;
const mempool: Transaction[] = [];

// Lấy block cuối cùng
async function getLastBlock(): Promise<Block | null> {
  const result = await query("SELECT * FROM blocks ORDER BY index DESC LIMIT 1");
  return result.rows.length ? result.rows[0] : null;
}

// Tạo block genesis nếu chưa có
async function createGenesisBlock() {
  const lastBlock = await getLastBlock();
  if (!lastBlock) {
    console.log("⛓️ Creating genesis block...");
    await query(
      "INSERT INTO blocks (index, previous_hash, timestamp, transactions, nonce, hash, miner) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [0, "0", Date.now(), JSON.stringify([]), 0, "genesis_hash", "system"]
    );
  }
}

// Tạo block mới và gửi đến miners
export async function createBlock(miner: string): Promise<Block> {
  await createGenesisBlock();

  const previousBlock = (await getLastBlock()) || { index: 0, hash: "genesis_hash" };

  const newBlock: Block = {
    index: previousBlock.index + 1,
    previousHash: previousBlock.hash,
    timestamp: Date.now(),
    transactions: [...mempool, { sender: "system", receiver: miner, amount: BLOCK_REWARD, fee: 0, timestamp: Date.now() }],
    nonce: 0,
    hash: "",
    miner,
  };

  sendBlockToMiners(newBlock);
  console.log(`📤 Sent block ${newBlock.index} to miners for mining`);

  mempool.length = 0;
  return newBlock;
}

// Thêm giao dịch vào mempool
export function addTransaction(tx: Transaction) {
  mempool.push(tx);
}

// Lấy blockchain từ database
export async function getBlockchain(): Promise<Block[]> {
  const result = await query("SELECT * FROM blocks ORDER BY index ASC");
  return result.rows;
}
