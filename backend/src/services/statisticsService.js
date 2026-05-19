const { db } = require('./jsonDbService');

const getTrend = async (params = {}) => {
  const evaluations = db.findAll('evaluations');
  
  // 按日期分组计算平均分
  const dateScores = {};
  evaluations.forEach(e => {
    if (e.submittedAt) {
      const date = e.submittedAt.split('T')[0];
      if (!dateScores[date]) {
        dateScores[date] = [];
      }
      dateScores[date].push(e.overallScore);
    }
  });

  const dates = Object.keys(dateScores).sort();
  const scores = dates.map(d => {
    const arr = dateScores[d];
    return parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1));
  });

  return { code: 200, data: { dates, scores } };
};

const getComparison = async (params = {}) => {
  const evaluations = db.findAll('evaluations');
  
  // 按学科分组
  const subjectScores = {};
  evaluations.forEach(e => {
    const plan = db.findById('plans', e.planId);
    if (plan) {
      const subject = plan.subject;
      if (!subjectScores[subject]) {
        subjectScores[subject] = [];
      }
      subjectScores[subject].push(e.overallScore);
    }
  });

  const subjects = Object.keys(subjectScores);
  const scores = subjects.map(s => {
    const arr = subjectScores[s];
    return parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1));
  });

  return { code: 200, data: { subjects, scores } };
};

const getDistribution = async () => {
  const evaluations = db.findAll('evaluations');
  
  const distribution = {
    excellent: 0,  // 4.5-5
    good: 0,       // 3.5-4.5
    fair: 0,       // 2.5-3.5
    poor: 0,       // < 2.5
  };

  evaluations.forEach(e => {
    const score = e.overallScore;
    if (score >= 4.5) distribution.excellent++;
    else if (score >= 3.5) distribution.good++;
    else if (score >= 2.5) distribution.fair++;
    else distribution.poor++;
  });

  return {
    code: 200,
    data: {
      labels: ['优秀(4.5-5)', '良好(3.5-4.5)', '一般(2.5-3.5)', '较差(<2.5)'],
      values: [distribution.excellent, distribution.good, distribution.fair, distribution.poor],
    },
  };
};

module.exports = { getTrend, getComparison, getDistribution };
