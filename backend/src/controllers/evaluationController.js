const evaluationService = require('../services/evaluationService');

const submitEvaluation = async (req, res, next) => {
  try {
    const result = await evaluationService.submitEvaluation(
      req.params.planId,
      req.user.id,
      req.body
    );
    res.status(result.code === 200 ? 200 : result.code === 3001 ? 409 : 404).json(result);
  } catch (error) {
    next(error);
  }
};

const getEvaluationsByPlan = async (req, res, next) => {
  try {
    const result = await evaluationService.getEvaluationByPlan(req.params.planId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getEvaluationById = async (req, res, next) => {
  try {
    const result = await evaluationService.getEvaluationById(req.params.id);
    res.status(result.code === 200 ? 200 : 404).json(result);
  } catch (error) {
    next(error);
  }
};

const archiveEvaluation = async (req, res, next) => {
  try {
    const result = await evaluationService.archiveEvaluation(req.params.id);
    res.status(result.code === 200 ? 200 : 404).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { submitEvaluation, getEvaluationsByPlan, getEvaluationById, archiveEvaluation };