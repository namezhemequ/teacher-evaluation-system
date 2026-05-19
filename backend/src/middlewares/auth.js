const jwt = require('jsonwebtoken');
const config = require('../config');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ code: 401, message: '未提供认证令牌' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ code: 401, message: '令牌无效或已过期' });
  }
};

const permissionMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole && req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '权限不足' });
    }
    next();
  };
};

module.exports = { authMiddleware, permissionMiddleware };