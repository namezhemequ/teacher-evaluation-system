const { db } = require('./jsonDbService');

const getRecords = async (params = {}) => {
  let evaluations = db.findAll('evaluations');
  
  // 过滤条件
  if (params.status) {
    evaluations = evaluations.filter(e => e.status === params.status);
  }
  if (params.evaluatorId) {
    evaluations = evaluations.filter(e => e.evaluatorId === parseInt(params.evaluatorId));
  }
  if (params.planId) {
    evaluations = evaluations.filter(e => e.planId === parseInt(params.planId));
  }

  // 添加关联信息
  const records = evaluations.map(e => {
    const plan = db.findById('plans', e.planId);
    const evaluator = db.findById('users', e.evaluatorId);
    const dimensions = db.findAll('evaluationDimensions', { evaluationId: e.id });
    
    return {
      id: e.id,
      planId: e.planId,
      overallScore: e.overallScore,
      overallComment: e.overallComment,
      status: e.status,
      submittedAt: e.submittedAt,
      archivedAt: e.archivedAt,
      plan: plan ? {
        id: plan.id,
        title: plan.title,
        subject: plan.subject,
        grade: plan.grade,
        teacherName: plan.teacherName,
        classroom: plan.classroom,
        observeDate: plan.observeDate,
        period: plan.period,
      } : null,
      evaluator: evaluator ? {
        id: evaluator.id,
        realName: evaluator.realName,
      } : null,
      dimensions: dimensions.map(d => ({
        dimensionName: d.dimensionName,
        score: d.score,
        comment: d.comment,
      })),
    };
  });

  return { code: 200, data: { list: records, total: records.length } };
};

module.exports = { getRecords };
