const { db } = require('./jsonDbService');

const getPlans = async (params = {}) => {
  let plans = db.findAll('plans');
  
  if (params.status) {
    plans = plans.filter(p => p.status === params.status);
  }
  if (params.subject) {
    plans = plans.filter(p => p.subject === params.subject);
  }
  if (params.grade) {
    plans = plans.filter(p => p.grade === params.grade);
  }
  
  // 添加创建者信息
  plans = plans.map(plan => {
    const creator = db.findById('users', plan.createdBy);
    return {
      ...plan,
      creator: creator ? { id: creator.id, realName: creator.realName } : null,
    };
  });
  
  return { code: 200, data: plans };
};

const getPlanById = async (id) => {
  const plan = db.findById('plans', id);
  if (!plan) {
    return { code: 404, message: '计划不存在' };
  }
  
  const creator = db.findById('users', plan.createdBy);
  const evaluations = db.findAll('evaluations', { planId: plan.id });
  
  return {
    code: 200,
    data: {
      ...plan,
      creator: creator ? { id: creator.id, realName: creator.realName } : null,
      evaluationCount: evaluations.length,
    },
  };
};

const createPlan = async (data, userId) => {
  const plan = db.create('plans', {
    ...data,
    status: 'draft',
    createdBy: userId,
  });
  return { code: 200, data: plan };
};

const updatePlan = async (id, data) => {
  const plan = db.update('plans', id, data);
  if (!plan) {
    return { code: 404, message: '计划不存在' };
  }
  return { code: 200, data: plan };
};

const publishPlan = async (id) => {
  const plan = db.update('plans', id, { status: 'published' });
  if (!plan) {
    return { code: 404, message: '计划不存在' };
  }
  return { code: 200, data: plan };
};

const deletePlan = async (id) => {
  const success = db.delete('plans', id);
  if (!success) {
    return { code: 404, message: '计划不存在' };
  }
  return { code: 200, message: '删除成功' };
};

module.exports = { getPlans, getPlanById, createPlan, updatePlan, publishPlan, deletePlan };
