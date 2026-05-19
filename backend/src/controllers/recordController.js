const recordService = require('../services/recordService');

const getRecords = async (req, res, next) => {
  try {
    const result = await recordService.getRecords(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecords };