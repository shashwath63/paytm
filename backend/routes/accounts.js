const express = require('express');
const mongoose = require('mongoose'); 
const { authMiddleware } = require('../middleware');
const { Account } = require("../db"); 

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    try {
        const account = await Account.findOne({ userId: req.userId });
        res.json({ balance: account.balance });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

router.post("/transfer", authMiddleware, async (req, res) => {
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        const { amount, to } = req.body;

        const account = await Account.findOne({ userId: req.userId }).session(session);
        if (!account || account.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const toAccount = await Account.findOne({ userId: to }).session(session);
        if (!toAccount) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Invalid account" });
        }

        await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
        await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

        await session.commitTransaction();
        res.json({ message: "Transfer successful" });
    } catch (error) {
        console.error(error);
        await session.abortTransaction(); // Abort transaction on error
        res.status(500).send("Server Error");
    }
});

module.exports = router;
