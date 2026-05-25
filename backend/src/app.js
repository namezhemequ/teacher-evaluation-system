require('dotenv').config();
// 设置数据版本 - 修改此值将自动创建新的数据文件
process.env.DATA_VERSION = process.env.DATA_VERSION || '3';

const express = require('express');
const cors = require('cors');
const { initDefaultData } = require('./services/jsonDbService');

const app = express();

app.use(cors());
app.use(express.json());

// 路由
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plans');
const evaluationRoutes = require('./routes/evaluations');
const recordRoutes = require('./routes/records');
const statisticsRoutes = require('./routes/statistics');

app.use('/api/v1', indexRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1', evaluationRoutes);
app.use('/api/v1/records', recordRoutes);
app.use('/api/v1/statistics', statisticsRoutes);

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ code: 500, message: err.message || 'Internal server error' });
});

const config = require('./config');

const startServer = async () => {
  try {
    // 初始化默认数据
    await initDefaultData();
    console.log('Database initialized');
    
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
