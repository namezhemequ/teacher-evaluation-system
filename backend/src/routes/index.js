const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');

router.get('/health', (req, res) => {
  res.json({ code: 200, message: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;