import amqp from "amqplib";
import crypto from "crypto";
import type { Block } from "./models/block.model";

const RABBITMQ_URL = "amqp://localhost";
const NEW_BLOCK_QUEUE = "new_blocks_queue";
const MINED_BLOCK_QUEUE = "mined_blocks_queue";

let channel: amqp.Channel;

async function connectRabbitMQ() {
  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue(NEW_BLOCK_QUEUE);
  await channel.assertQueue(MINED_BLOCK_QUEUE);
  console.log("🟢 Miner connected to RabbitMQ");
}

// Tính hash
function calculateHash(block: Block): string {
  return crypto
    .createHash("sha256")
    .update(
      block.index +
      block.previousHash +
      block.timestamp +
      JSON.stringify(block.transactions) +
      block.nonce
    )
    .digest("hex");
}

// Đào block
function mineBlock(block: Block): Block {
  while (!block.hash.startsWith("000")) {
    block.nonce++;
    block.hash = calculateHash(block);

    console.log(`⛏️ Nonce ${block.nonce} - Hash: ${block.hash}`);
  }
  return block;
}


// Nhận block từ queue và đào
async function startMining() {
  if (!channel) await connectRabbitMQ();
  channel.consume(NEW_BLOCK_QUEUE, async (msg) => {
    if (msg) {
      let block: Block = JSON.parse(msg.content.toString());
      console.log(`⛏️ Mining block ${block.index}...`);

      block = await mineBlock(block); // Chờ đào block có delay

      console.log(`✅ Block ${block.index} mined with nonce ${block.nonce}`);

      channel.sendToQueue(MINED_BLOCK_QUEUE, Buffer.from(JSON.stringify(block)));
      channel.ack(msg);
    }
  });
}


connectRabbitMQ().then(() => startMining());
