const { db } = require('./jsonDbService');

const submitEvaluation = async (planId, data, evaluatorId) => {
  const plan = db.findById('plans', planId);
  if (!plan) {
    return { code: 404, message: '计划不存在' };
  }

  // 计算总分
  let totalScore = 0;
  if (data.dimensions && data.dimensions.length > 0) {
    const scores = data.dimensions.map(d => parseFloat(d.score) || 0);
    totalScore = parseFloat((scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1));
  }

  const evaluation = db.create('evaluations', {
    planId: parseInt(planId),
    evaluatorId: evaluatorId,
    overallScore: totalScore,
    overallComment: data.overallComment || '',
    status: 'submitted',
    submittedAt: new Date().toISOString(),
  });

  // 保存维度评分
  if (data.dimensions && data.dimensions.length > 0) {
    const dimensions = data.dimensions.map(d => ({
      evaluationId: evaluation.id,
      dimensionName: d.dimensionName || d.name || '',
      score: parseFloat(d.score) || 0,
      comment: d.comment || '',
    }));
    db.bulkCreate('evaluationDimensions', dimensions);
  }

  return { code: 200, data: evaluation };
};

const getEvaluationByPlan = async (planId) => {
  const evaluations = db.findAll('evaluations', { planId: parseInt(planId) });
  
  return {
    code: 200,
    data: evaluations.map(e => {
      const evaluator = db.findById('users', e.evaluatorId);
      const dimensions = db.findAll('evaluationDimensions', { evaluationId: e.id });
      return {
        ...e,
        evaluator: evaluator ? { id: evaluator.id, realName: evaluator.realName } : null,
        dimensions: dimensions.map(d => ({
          id: d.id,
          name: d.dimensionName,
          dimensionName: d.dimensionName,
          score: d.score,
          comment: d.comment,
        })),
      };
    }),
  };
};

const getEvaluationById = async (id) => {
  const evaluation = db.findById('evaluations', id);
  if (!evaluation) {
    return { code: 404, message: '评价不存在' };
  }

  const evaluator = db.findById('users', evaluation.evaluatorId);
  const plan = db.findById('plans', evaluation.planId);
  const dimensions = db.findAll('evaluationDimensions', { evaluationId: evaluation.id });

  return {
    code: 200,
    data: {
      ...evaluation,
      evaluator: evaluator ? { id: evaluator.id, realName: evaluator.realName } : null,
      plan: plan || null,
      dimensions: dimensions.map(d => ({
        id: d.id,
        name: d.dimensionName,
        dimensionName: d.dimensionName,
        score: d.score,
        comment: d.comment,
      })),
    },
  };
};

const archiveEvaluation = async (id) => {
  const evaluation = db.findById('evaluations', id);
  if (!evaluation) {
    return { code: 404, message: '评价不存在' };
  }

  const updated = db.update('evaluations', id, {
    status: 'archived',
    archivedAt: new Date().toISOString(),
  });

  return { code: 200, data: updated };
};

module.exports = { submitEvaluation, getEvaluationByPlan, getEvaluationById, archiveEvaluation };
