const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/', recordController.getRecords);

module.exports = router;
