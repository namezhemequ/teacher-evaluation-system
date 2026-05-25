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
      { title: '高二化学《化学反应速率》', subject: '化学', grade: '高二(2)班', teacherName: '孙立军', classroom: 'E301', observeDate: '2026-05-24', period: '第2节', status: 'published', createdBy: 1 },
      { title: '高一英语《定语从句》', subject: '英语', grade: '高一(3)班', teacherName: '周晓燕', classroom: 'F205', observeDate: '2026-05-25', period: '第3节', status: 'published', createdBy: 1 },
      { title: '高三数学《导数的应用》', subject: '数学', grade: '高三(2)班', teacherName: '吴建国', classroom: 'G102', observeDate: '2026-05-26', period: '第1节', status: 'draft', createdBy: 1 },
      { title: '初二物理《光的折射》', subject: '物理', grade: '初二(1)班', teacherName: '郑志强', classroom: 'H401', observeDate: '2026-05-27', period: '第4节', status: 'published', createdBy: 1 },
      { title: '高一历史《辛亥革命》', subject: '历史', grade: '高一(4)班', teacherName: '黄文静', classroom: 'I301', observeDate: '2026-05-28', period: '第2节', status: 'published', createdBy: 1 },
      { title: '高二生物《遗传与变异》', subject: '生物', grade: '高二(4)班', teacherName: '林晓峰', classroom: 'J205', observeDate: '2026-05-29', period: '第3节', status: 'draft', createdBy: 1 },
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

    // 新增评价数据
    const eval4 = db.create('evaluations', {
      planId: 5, evaluatorId: 3, overallScore: 4.8,
      overallComment: '孙老师实验演示精彩，学生参与度高，课堂氛围活跃。',
      status: 'submitted', submittedAt: new Date('2026-05-24 14:30:00').toISOString()
    });
    db.bulkCreate('evaluationDimensions', [
      { evaluationId: eval4.id, dimensionName: '教学目标', score: 5, comment: '目标清晰可达' },
      { evaluationId: eval4.id, dimensionName: '教学内容', score: 5, comment: '内容充实有深度' },
      { evaluationId: eval4.id, dimensionName: '教学方法', score: 5, comment: '实验教学引人入胜' },
      { evaluationId: eval4.id, dimensionName: '教学效果', score: 4, comment: '学生理解透彻' },
      { evaluationId: eval4.id, dimensionName: '教师素养', score: 5, comment: '专业功底扎实' },
    ]);

    const eval5 = db.create('evaluations', {
      planId: 6, evaluatorId: 2, overallScore: 4.0,
      overallComment: '周老师语法讲解清晰，但练习环节可以更丰富。',
      status: 'submitted', submittedAt: new Date('2026-05-25 10:15:00').toISOString()
    });
    db.bulkCreate('evaluationDimensions', [
      { evaluationId: eval5.id, dimensionName: '教学目标', score: 4, comment: '目标基本达成' },
      { evaluationId: eval5.id, dimensionName: '教学内容', score: 4, comment: '内容安排合理' },
      { evaluationId: eval5.id, dimensionName: '教学方法', score: 3, comment: '方法较为单一' },
      { evaluationId: eval5.id, dimensionName: '教学效果', score: 4, comment: '大部分学生掌握' },
      { evaluationId: eval5.id, dimensionName: '教师素养', score: 5, comment: '教态自然大方' },
    ]);

    const eval6 = db.create('evaluations', {
      planId: 8, evaluatorId: 3, overallScore: 4.5,
      overallComment: '郑老师光学实验设计巧妙，理论与实践结合紧密。',
      status: 'submitted', submittedAt: new Date('2026-05-27 16:00:00').toISOString()
    });
    db.bulkCreate('evaluationDimensions', [
      { evaluationId: eval6.id, dimensionName: '教学目标', score: 5, comment: '目标明确具体' },
      { evaluationId: eval6.id, dimensionName: '教学内容', score: 4, comment: '内容科学准确' },
      { evaluationId: eval6.id, dimensionName: '教学方法', score: 5, comment: '实验探究式教学' },
      { evaluationId: eval6.id, dimensionName: '教学效果', score: 4, comment: '学生兴趣浓厚' },
      { evaluationId: eval6.id, dimensionName: '教师素养', score: 4, comment: '讲解深入浅出' },
    ]);

    const eval7 = db.create('evaluations', {
      planId: 9, evaluatorId: 2, overallScore: 4.3,
      overallComment: '黄老师历史课生动有趣，史料运用恰当，学生印象深刻。',
      status: 'submitted', submittedAt: new Date('2026-05-28 11:00:00').toISOString()
    });
    db.bulkCreate('evaluationDimensions', [
      { evaluationId: eval7.id, dimensionName: '教学目标', score: 4, comment: '目标定位准确' },
      { evaluationId: eval7.id, dimensionName: '教学内容', score: 5, comment: '史料丰富翔实' },
      { evaluationId: eval7.id, dimensionName: '教学方法', score: 4, comment: '启发式教学' },
      { evaluationId: eval7.id, dimensionName: '教学效果', score: 4, comment: '学生参与积极' },
      { evaluationId: eval7.id, dimensionName: '教师素养', score: 4, comment: '语言生动形象' },
    ]);

    const eval8 = db.create('evaluations', {
      planId: 1, evaluatorId: 3, overallScore: 4.1,
      overallComment: '王老师板书工整，但课堂互动可以更多。',
      status: 'submitted', submittedAt: new Date('2026-05-20 16:30:00').toISOString()
    });
    db.bulkCreate('evaluationDimensions', [
      { evaluationId: eval8.id, dimensionName: '教学目标', score: 4, comment: '目标明确' },
      { evaluationId: eval8.id, dimensionName: '教学内容', score: 4, comment: '重点突出' },
      { evaluationId: eval8.id, dimensionName: '教学方法', score: 3, comment: '互动较少' },
      { evaluationId: eval8.id, dimensionName: '教学效果', score: 4, comment: '学生基本掌握' },
      { evaluationId: eval8.id, dimensionName: '教师素养', score: 5, comment: '板书规范美观' },
    ]);
  }
};

module.exports = { db, initDefaultData };
