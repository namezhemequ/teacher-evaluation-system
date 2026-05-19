const authService = require('../services/authService');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '用户名和密码不能为空' });
    }
    const result = await authService.login(username, password);
    res.status(result.code === 200 ? 200 : 401).json(result);
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const result = await authService.getProfile(req.user.id);
    res.status(result.code === 200 ? 200 : 404).json(result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  res.json({ code: 200, message: '登出成功' });
};

module.exports = { login, getProfile, logout };