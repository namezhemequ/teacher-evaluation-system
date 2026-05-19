const jwt = require('jsonwebtoken');
const config = require('../config');
const { User, Role } = require('../models');

const login = async (username, password) => {
  const user = await User.findOne({
    where: { username },
    include: [{ model: Role, as: 'Role' }],
  });

  if (!user) {
    return { code: 1001, message: '用户不存在' };
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return { code: 1002, message: '密码错误' };
  }

  if (!user.isActive) {
    return { code: 401, message: '用户已被禁用' };
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.Role?.name || 'teacher' },
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
        role: user.Role?.name || 'teacher',
        department: user.department,
      },
    },
  };
};

const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [{ model: Role, as: 'Role' }],
  });

  if (!user) {
    return { code: 404, message: '用户不存在' };
  }

  return {
    code: 200,
    data: {
      id: user.id,
      username: user.username,
      realName: user.realName,
      role: user.Role?.name || 'teacher',
      permissions: user.Role?.permissions || [],
      department: user.department,
    },
  };
};

module.exports = { login, getProfile };