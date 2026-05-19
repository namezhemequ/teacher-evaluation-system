const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  classInfo: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'class_info',
  },
  subject: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  teacherName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'teacher_name',
  },
  classroom: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  observeDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'observe_date',
  },
  period: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  grade: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'teacher_id',
  },
  evaluatorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'evaluator_id',
  },
  scheduledTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'scheduled_time',
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'completed', 'archived'),
    defaultValue: 'draft',
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'created_by',
  },
});

module.exports = Plan;
