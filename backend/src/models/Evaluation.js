const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Evaluation = sequelize.define('Evaluation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  planId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'plan_id',
  },
  evaluatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'evaluator_id',
  },
  overallScore: {
    type: DataTypes.DECIMAL(3, 1),
    field: 'overall_score',
  },
  overallComment: {
    type: DataTypes.TEXT,
    field: 'overall_comment',
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'archived'),
    defaultValue: 'draft',
  },
  submittedAt: {
    type: DataTypes.DATE,
    field: 'submitted_at',
  },
  archivedAt: {
    type: DataTypes.DATE,
    field: 'archived_at',
  },
});

module.exports = Evaluation;