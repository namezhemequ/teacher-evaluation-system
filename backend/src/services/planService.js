const { Plan, User, Evaluation } = require('../models');
const { Op } = require('sequelize');

const createPlan = async (data, userId) => {
  const plan = await Plan.create({
    ...data,
    createdBy: userId,
  });
  return { code: 200, data: plan };
};

const getPlans = async (query) => {
  const { page = 1, pageSize = 10, status, teacherId } = query;
  const where = {};
  if (status) where.status = status;
  if (teacherId) where.teacherId = teacherId;

  const { rows, count } = await Plan.findAndCountAll({
    where,
    include: [
      { model: User, as: 'teacher', attributes: ['id', 'realName', 'department'] },
      { model: User, as: 'evaluator', attributes: ['id', 'realName'] },
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(pageSize),
    offset: (page - 1) * pageSize,
  });

  return {
    code: 200,
    data: {
      list: rows,
      pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total: count },
    },
  };
};

const getPlanById = async (id) => {
  const plan = await Plan.findByPk(id, {
    include: [
      { model: User, as: 'teacher', attributes: ['id', 'realName', 'department'] },
      { model: User, as: 'evaluator', attributes: ['id', 'realName'] },
    ],
  });
  if (!plan) return { code: 404, message: '计划不存在' };
  return { code: 200, data: plan };
};

const updatePlan = async (id, data) => {
  const plan = await Plan.findByPk(id);
  if (!plan) return { code: 404, message: '计划不存在' };
  await plan.update(data);
  return { code: 200, data: plan };
};

const publishPlan = async (id) => {
  const plan = await Plan.findByPk(id);
  if (!plan) return { code: 404, message: '计划不存在' };
  if (plan.status !== 'draft') return { code: 409, message: '只能发布草稿状态的计划' };
  await plan.update({ status: 'published' });
  return { code: 200, data: plan };
};

const deletePlan = async (id) => {
  const plan = await Plan.findByPk(id);
  if (!plan) return { code: 404, message: '计划不存在' };
  await plan.destroy();
  return { code: 200, message: '删除成功' };
};

module.exports = { createPlan, getPlans, getPlanById, updatePlan, publishPlan, deletePlan };