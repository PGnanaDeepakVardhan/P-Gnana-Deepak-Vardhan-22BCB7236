const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const jwt = require('jsonwebtoken');

// Middleware to protect routes
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });

  try {
    const decoded = jwt.verify(token, 'yourSecretKey');
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(403).json({ msg: 'Invalid token' });
  }
};

// 🔽 Create
router.post('/', verifyToken, async (req, res) => {
  const todo = new Todo({
    userId: req.userId,
    text: req.body.text
  });
  const saved = await todo.save();
  res.status(201).json(saved);
});

// 📥 Read All
router.get('/', verifyToken, async (req, res) => {
  const todos = await Todo.find({ userId: req.userId });
  res.json(todos);
});

// ✏️ Update
router.put('/:id', verifyToken, async (req, res) => {
  const updated = await Todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  res.json(updated);
});

// ❌ Delete
router.delete('/:id', verifyToken, async (req, res) => {
  await Todo.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.json({ msg: 'Todo deleted' });
});

module.exports = router;
