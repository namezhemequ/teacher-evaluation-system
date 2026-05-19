const { Evaluation, EvaluationDimension, Plan, User } = require('../models');

const submitEvaluation = async (planId, evaluatorId, data) => {
  const plan = await Plan.findByPk(planId);
  if (!plan) return { code: 404, message: '计划不存在' };

  const existing = await Evaluation.findOne({
    where: { planId, evaluatorId },
  });
  if (existing && existing.status === 'submitted') {
    return { code: 3001, message: '评价已提交' };
  }

  const evaluation = await Evaluation.create({
    planId,
    evaluatorId,
    overallComment: data.overallComment,
    status: 'submitted',
    submittedAt: new Date(),
  });

  if (data.dimensions && data.dimensions.length > 0) {
    const dimensions = data.dimensions.map((d) => ({
      evaluationId: evaluation.id,
      dimensionName: d.dimensionName || d.name,
      score: parseFloat(d.score) || 0,
      comment: d.comment || '',
    }));
    await EvaluationDimension.bulkCreate(dimensions);
  }

  let totalScore = 0;
  if (data.dimensions && data.dimensions.length > 0) {
    const scores = data.dimensions.map(d => parseFloat(d.score) || 0);
    totalScore = (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1);
  }
  await evaluation.update({ overallScore: totalScore });

  return { code: 200, data: evaluation };
};

const getEvaluationByPlan = async (planId) => {
  const evaluations = await Evaluation.findAll({
    where: { planId },
    include: [
      { model: User, as: 'evaluator', attributes: ['id', 'realName'] },
      { model: EvaluationDimension, as: 'dimensions' },
    ],
  });
  return { code: 200, data: evaluations };
};

const getEvaluationById = async (id) => {
  const evaluation = await Evaluation.findByPk(id, {
    include: [
      { model: User, as: 'evaluator', attributes: ['id', 'realName'] },
      { model: EvaluationDimension, as: 'dimensions' },
      { model: Plan },
    ],
  });
  if (!evaluation) return { code: 404, message: '评价不存在' };
  return { code: 200, data: evaluation };
};

const archiveEvaluation = async (id) => {
  const evaluation = await Evaluation.findByPk(id);
  if (!evaluation) return { code: 404, message: '评价不存在' };
  await evaluation.update({ status: 'archived', archivedAt: new Date() });
  return { code: 200, data: evaluation };
};

module.exports = { submitEvaluation, getEvaluationByPlan, getEvaluationById, archiveEvaluation };