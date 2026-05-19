const planService = require('../services/planService');

const createPlan = async (req, res, next) => {
  try {
    const result = await planService.createPlan(req.body, req.user.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getPlans = async (req, res, next) => {
  try {
    const result = await planService.getPlans(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getPlanById = async (req, res, next) => {
  try {
    const result = await planService.getPlanById(req.params.id);
    res.status(result.code === 200 ? 200 : 404).json(result);
  } catch (error) {
    next(error);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const result = await planService.updatePlan(req.params.id, req.body);
    res.status(result.code === 200 ? 200 : 404).json(result);
  } catch (error) {
    next(error);
  }
};

const publishPlan = async (req, res, next) => {
  try {
    const result = await planService.publishPlan(req.params.id);
    res.status(result.code === 200 ? 200 : result.code).json(result);
  } catch (error) {
    next(error);
  }
};

const deletePlan = async (req, res, next) => {
  try {
    const result = await planService.deletePlan(req.params.id);
    res.status(result.code === 200 ? 200 : 404).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { createPlan, getPlans, getPlanById, updatePlan, publishPlan, deletePlan };