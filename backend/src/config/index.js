module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'teacher-evaluation-secret-key-2024',
  jwtExpiresIn: '7d',
};