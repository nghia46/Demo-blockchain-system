import amqp from "amqplib";
import { query } from "./db";

const RABBITMQ_URL = "amqp://localhost";
const NEW_BLOCK_QUEUE = "new_blocks_queue";
const MINED_BLOCK_QUEUE = "mined_blocks_queue";

let channel: amqp.Channel;

async function connectRabbitMQ() {
  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue(NEW_BLOCK_QUEUE);
  await channel.assertQueue(MINED_BLOCK_QUEUE);
  console.log("🟢 Connected to RabbitMQ");
}

// Gửi block mới đến miners
async function sendBlockToMiners(block: any) {
  if (!channel) await connectRabbitMQ();
  channel.sendToQueue(NEW_BLOCK_QUEUE, Buffer.from(JSON.stringify(block)));
  console.log(`📤 Sent block ${block.index} to miners`);
}

// Nhận block đã đào từ miners
async function receiveMinedBlocks() {
  if (!channel) await connectRabbitMQ();
  channel.consume(MINED_BLOCK_QUEUE, async (msg) => {
    if (msg) {
      const minedBlock = JSON.parse(msg.content.toString());
      console.log(`📥 Received mined block ${minedBlock.index}`);


      
      // Lưu block đã đào vào database


      await query(
        "INSERT INTO blocks (index, previous_hash, timestamp, transactions, nonce, hash, miner) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          minedBlock.index,
          minedBlock.previousHash,
          minedBlock.timestamp,
          JSON.stringify(minedBlock.transactions),
          minedBlock.nonce,
          minedBlock.hash,
          minedBlock.miner
        ]
      );

      console.log(`✅ Block ${minedBlock.index} added to blockchain`);
      channel.ack(msg);
    }
  });
}

export { connectRabbitMQ, sendBlockToMiners, receiveMinedBlocks };
