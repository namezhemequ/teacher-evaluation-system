const db = require('../utils/jsonDb');
const bcrypt = require('bcryptjs');

// 初始化默认数据
const initDefaultData = async () => {
  // 初始化角色
  if (db.count('roles') === 0) {
    db.bulkCreate('roles', [
      { id: 1, name: 'admin', description: '管理员', permissions: ['*'] },
      { id: 2, name: 'teacher', description: '教师', permissions: ['evaluation:read', 'evaluation:write'] },
    ]);
  }

  // 初始化用户
  if (db.count('users') === 0) {
    const hashedAdmin = await bcrypt.hash('admin123', 10);
    const hashedTeacher = await bcrypt.hash('teacher123', 10);
    db.bulkCreate('users', [
      { username: 'admin', password: hashedAdmin, realName: '系统管理员', roleId: 1, department: '教务处' },
      { username: 'teacher1', password: hashedTeacher, realName: '张三', roleId: 2, department: '数学组' },
      { username: 'teacher2', password: hashedTeacher, realName: '李四', roleId: 2, department: '语文组' },
    ]);
  }

  // 初始化计划
  if (db.count('plans') === 0) {
    db.bulkCreate('plans', [
      { title: '高一数学《函数的单调性》', subject: '数学', grade: '高一(1)班', teacherName: '王建国', classroom: 'A301', observeDate: '2026-05-20', period: '第2节', status: 'published', createdBy: 1 },
      { title: '高二物理《牛顿第二定律》', subject: '物理', grade: '高二(3)班', teacherName: '刘志强', classroom: 'B205', observeDate: '2026-05-21', period: '第3节', status: 'published', createdBy: 1 },
      { title: '高一语文《赤壁赋》', subject: '语文', grade: '高一(2)班', teacherName: '陈文静', classroom: 'C102', observeDate: '2026-05-22', period: '第1节', status: 'draft', createdBy: 1 },
      { title: '高三英语《阅读理解技巧》', subject: '英语', grade: '高三(1)班', teacherName: '赵明华', classroom: 'D401', observeDate: '2026-05-23', period: '第4节', status: 'published', createdBy: 1 },
    ]);
  }

  // 初始化评价
  if (db.count('evaluations') === 0) {
    const eval1 = db.create('evaluations', {
      planId: 1, evaluatorId: 2, overallScore: 4.4,
      overallComment: '王老师这节课整体表现优秀，教学思路清晰，重难点把握准确。',
      status: 'submitted', submittedAt: new Date('2026-05-20 14:30:00').toISOString()
    });
    db.bulkCreate('evaluationDimensions', [
      { evaluationId: eval1.id, dimensionName: '教学目标', score: 4, comment: '目标明确具体' },
      { evaluationId: eval1.id, dimensionName: '教学内容', score: 5, comment: '内容充实重点突出' },
      { evaluationId: eval1.id, dimensionName: '教学方法', score: 4, comment: '方法灵活多样' },
      { evaluationId: eval1.id, dimensionName: '教学效果', score: 4, comment: '效果良好' },
      { evaluationId: eval1.id, dimensionName: '教师素养', score: 5, comment: '教态自然亲切' },
    ]);

    const eval2 = db.create('evaluations', {
      planId: 2, evaluatorId: 3, overallScore: 4.2,
      overallComment: '刘老师实验设计巧妙，理论联系实际。',
      status: 'submitted', submittedAt: new Date('2026-05-21 10:15:00').toISOString()
    });
    db.bulkCreate('evaluationDimensions', [
      { evaluationId: eval2.id, dimensionName: '教学目标', score: 4, comment: '目标清晰' },
      { evaluationId: eval2.id, dimensionName: '教学内容', score: 4, comment: '内容完整' },
      { evaluationId: eval2.id, dimensionName: '教学方法', score: 5, comment: '实验教学很棒' },
      { evaluationId: eval2.id, dimensionName: '教学效果', score: 4, comment: '学生掌握良好' },
      { evaluationId: eval2.id, dimensionName: '教师素养', score: 4, comment: '专业素养高' },
    ]);

    const eval3 = db.create('evaluations', {
      planId: 4, evaluatorId: 2, overallScore: 4.6,
      overallComment: '赵老师阅读技巧讲解到位，学生反馈积极。',
      status: 'archived', submittedAt: new Date('2026-05-23 16:00:00').toISOString(),
      archivedAt: new Date('2026-05-24 09:00:00').toISOString()
    });
    db.bulkCreate('evaluationDimensions', [
      { evaluationId: eval3.id, dimensionName: '教学目标', score: 5, comment: '目标明确' },
      { evaluationId: eval3.id, dimensionName: '教学内容', score: 4, comment: '内容丰富' },
      { evaluationId: eval3.id, dimensionName: '教学方法', score: 5, comment: '技巧实用' },
      { evaluationId: eval3.id, dimensionName: '教学效果', score: 5, comment: '效果显著' },
      { evaluationId: eval3.id, dimensionName: '教师素养', score: 4, comment: '经验丰富' },
    ]);
  }
};

module.exports = { db, initDefaultData };
