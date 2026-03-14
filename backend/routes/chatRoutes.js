const express = require("express");
const Message = require("../models/Message");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Save message
router.post("/", auth, async (req, res) => {
  const { receiver, text } = req.body;

  const message = await Message.create({
    sender: req.user.id,
    receiver,
    text
  });

  res.json(message);
});

// Get chat history
router.get("/:userId", auth, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user.id, receiver: req.params.userId },
      { sender: req.params.userId, receiver: req.user.id }
    ]
  }).sort({ createdAt: 1 });

  res.json(messages);
});

module.exports = router;