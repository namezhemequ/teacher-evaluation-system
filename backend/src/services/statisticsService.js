const { Evaluation, Plan, User, EvaluationDimension } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

const getTrend = async (query) => {
  const { teacherId, startDate, endDate } = query;
  const where = { status: 'submitted' };
  const planWhere = {};

  if (teacherId) planWhere.teacherId = teacherId;
  if (startDate) where.submittedAt = { [Op.gte]: new Date(startDate) };
  if (endDate) {
    where.submittedAt = {
      ...(where.submittedAt || {}),
      [Op.lte]: new Date(endDate + ' 23:59:59'),
    };
  }

  const evaluations = await Evaluation.findAll({
    where,
    include: [{ model: Plan, where: Object.keys(planWhere).length > 0 ? planWhere : undefined }],
  });

  const trendMap = {};
  evaluations.forEach((e) => {
    if (e.submittedAt && e.overallScore) {
      const date = e.submittedAt.toISOString().split('T')[0];
      if (!trendMap[date]) trendMap[date] = { total: 0, count: 0 };
      trendMap[date].total += parseFloat(e.overallScore);
      trendMap[date].count += 1;
    }
  });

  const dates = Object.keys(trendMap).sort();
  const scores = dates.map((d) => +(trendMap[d].total / trendMap[d].count).toFixed(1));

  return { code: 200, data: { dates, scores } };
};

const getComparison = async (query) => {
  const { subject, classInfo } = query;
  const planWhere = {};
  if (subject) planWhere.subject = subject;
  if (classInfo) planWhere.classInfo = classInfo;

  const plans = await Plan.findAll({ where: planWhere });
  const planIds = plans.map((p) => p.id);

  const evaluations = await Evaluation.findAll({
    where: { planId: { [Op.in]: planIds }, status: 'submitted' },
    include: [{ model: Plan }],
  });

  const subjectScores = {};
  evaluations.forEach((e) => {
    const sub = e.Plan?.subject || '未知';
    if (!subjectScores[sub]) subjectScores[sub] = { total: 0, count: 0 };
    subjectScores[sub].total += parseFloat(e.overallScore || 0);
    subjectScores[sub].count += 1;
  });

  const labels = Object.keys(subjectScores);
  const data = labels.map((l) => +(subjectScores[l].total / subjectScores[l].count).toFixed(1));

  return { code: 200, data: { labels, data } };
};

const getDistribution = async () => {
  const dimensions = await EvaluationDimension.findAll();

  const distMap = {};
  dimensions.forEach((d) => {
    const name = d.dimensionName;
    if (!distMap[name]) distMap[name] = 0;
    distMap[name] += 1;
  });

  const dimensionNames = Object.keys(distMap);
  const counts = dimensionNames.map((d) => distMap[d]);

  return { code: 200, data: { dimensions: dimensionNames, counts } };
};

module.exports = { getTrend, getComparison, getDistribution };