import express from "express";
import { getBlockchain, createBlock } from "../blockchain";

const router = express.Router();

router.get("/blocks", async (req, res) => {
  const blockchain = await getBlockchain();
  res.json(blockchain);
});

// Nhận yêu cầu đào block
router.post("/mine", async (req:any, res:any) => {
  const { miner } = req.body;
  if (!miner) return res.status(400).json({ error: "Miner address required" });

  const newBlock = await createBlock(miner);
  res.json({ message: `Block ${newBlock.index} sent to miners`, block: newBlock });
});

export default router;
