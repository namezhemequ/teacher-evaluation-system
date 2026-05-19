const statisticsService = require('../services/statisticsService');

const getTrend = async (req, res, next) => {
  try {
    const result = await statisticsService.getTrend(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getComparison = async (req, res, next) => {
  try {
    const result = await statisticsService.getComparison(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getDistribution = async (req, res, next) => {
  try {
    const result = await statisticsService.getDistribution();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getTrend, getComparison, getDistribution };