const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(255),
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
});

module.exports = Role;