const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EvaluationDimension = sequelize.define('EvaluationDimension', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  evaluationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'evaluation_id',
  },
  dimensionName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'dimension_name',
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comment: {
    type: DataTypes.TEXT,
  },
});

module.exports = EvaluationDimension;