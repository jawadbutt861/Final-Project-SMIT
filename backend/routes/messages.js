const router = require('express').Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Get conversation between two users
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    }).sort('createdAt');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const message = await Message.create({
      sender: req.user.id,
      receiver: req.body.receiverId,
      text: req.body.text
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all chat contacts for current user
router.get('/contacts/list', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    }).populate('sender', 'name').populate('receiver', 'name');

    const contactMap = new Map();
    messages.forEach(m => {
      const other = m.sender._id.toString() === req.user.id ? m.receiver : m.sender;
      contactMap.set(other._id.toString(), other);
    });

    res.json(Array.from(contactMap.values()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
