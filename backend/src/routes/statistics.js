const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/trend', statisticsController.getTrend);
router.get('/comparison', statisticsController.getComparison);
router.get('/distribution', statisticsController.getDistribution);

module.exports = router;