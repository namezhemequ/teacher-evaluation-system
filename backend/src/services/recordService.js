const { Evaluation, Plan, User, EvaluationDimension } = require('../models');
const { Op } = require('sequelize');

const getRecords = async (query) => {
  const { teacherId, subject, startDate, endDate, status, page = 1, pageSize = 10 } = query;
  const where = {};
  const planWhere = {};

  if (teacherId) planWhere.teacherId = teacherId;
  if (subject) planWhere.subject = subject;
  if (startDate) planWhere.scheduledTime = { [Op.gte]: new Date(startDate) };
  if (endDate) {
    planWhere.scheduledTime = {
      ...(planWhere.scheduledTime || {}),
      [Op.lte]: new Date(endDate + ' 23:59:59'),
    };
  }
  if (status) where.status = status;

  const { rows, count } = await Evaluation.findAndCountAll({
    where,
    include: [
      {
        model: Plan,
        where: Object.keys(planWhere).length > 0 ? planWhere : undefined,
        include: [
          { model: User, as: 'teacher', attributes: ['id', 'realName', 'department'] },
        ],
      },
      { model: User, as: 'evaluator', attributes: ['id', 'realName'] },
      { model: EvaluationDimension, as: 'dimensions' },
    ],
    order: [['submittedAt', 'DESC']],
    limit: parseInt(pageSize),
    offset: (page - 1) * pageSize,
  });

  return {
    code: 200,
    data: { list: rows, pagination: { page: parseInt(page), pageSize: parseInt(pageSize), total: count } },
  };
};

module.exports = { getRecords };