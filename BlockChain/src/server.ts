import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import blockchainRoutes from "./routes/blockchain.routes";
import { connectRabbitMQ, receiveMinedBlocks } from "./rabbitmq";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use("/api", blockchainRoutes);

connectRabbitMQ().then(() => {
  receiveMinedBlocks();
});

app.listen(PORT, () => console.log(`Blockchain API running on http://localhost:${PORT}`));
