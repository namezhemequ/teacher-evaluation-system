const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.RAILWAY_ENVIRONMENT) {
  // Railway 环境使用内存 SQLite（避免 GLIBC 兼容问题）
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  });
} else {
  // 本地开发使用文件 SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  });
}

module.exports = sequelize;