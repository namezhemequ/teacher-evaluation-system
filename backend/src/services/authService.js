const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { db } = require('./jsonDbService');

const login = async (username, password) => {
  const user = db.findOne('users', { username });

  if (!user) {
    return { code: 1001, message: '用户不存在' };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { code: 1002, message: '密码错误' };
  }

  const role = db.findById('roles', user.roleId);

  const token = jwt.sign(
    { id: user.id, username: user.username, role: role?.name || 'teacher' },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    code: 200,
    data: {
      token,
      userInfo: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        role: role?.name || 'teacher',
        department: user.department,
      },
    },
  };
};

const getProfile = async (userId) => {
  const user = db.findById('users', userId);

  if (!user) {
    return { code: 404, message: '用户不存在' };
  }

  const role = db.findById('roles', user.roleId);

  return {
    code: 200,
    data: {
      id: user.id,
      username: user.username,
      realName: user.realName,
      role: role?.name || 'teacher',
      permissions: role?.permissions || [],
      department: user.department,
    },
  };
};

module.exports = { login, getProfile };
