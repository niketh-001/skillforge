const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

module.exports = router;