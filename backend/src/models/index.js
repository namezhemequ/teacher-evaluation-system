const sequelize = require('../config/database');
const Role = require('./Role');
const User = require('./User');
const Plan = require('./Plan');
const Evaluation = require('./Evaluation');
const EvaluationDimension = require('./EvaluationDimension');

Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

Plan.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });
Plan.belongsTo(User, { as: 'evaluator', foreignKey: 'evaluatorId' });
Plan.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

Evaluation.belongsTo(Plan, { foreignKey: 'planId' });
Evaluation.belongsTo(User, { as: 'evaluator', foreignKey: 'evaluatorId' });
Plan.hasMany(Evaluation, { foreignKey: 'planId' });

Evaluation.hasMany(EvaluationDimension, { foreignKey: 'evaluationId', as: 'dimensions', onDelete: 'CASCADE' });
EvaluationDimension.belongsTo(Evaluation, { foreignKey: 'evaluationId' });

module.exports = {
  sequelize,
  Role,
  User,
  Plan,
  Evaluation,
  EvaluationDimension,
};