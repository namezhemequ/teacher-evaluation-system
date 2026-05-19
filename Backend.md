# 教师听课评课管理系统后端技术文档

## API接口设计

### API结构规划
采用RESTful风格，以资源为中心进行URL设计。所有接口统一返回JSON格式，包含状态码、消息和数据。

**基础URL**: `/api/v1`
**主要资源端点**:
- `/auth` - 认证相关
- `/plans` - 听课计划
- `/evaluations` - 课堂评价
- `/records` - 评课记录
- `/statistics` - 统计数据

### 接口命名规范
- 使用名词复数形式表示资源集合
- 使用HTTP方法语义：GET（查询）、POST（创建）、PUT（更新）、DELETE（删除）
- 嵌套资源使用路径参数，如 `/plans/{planId}/evaluations`

### 请求/响应格式
**通用响应结构**:
```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": "2023-10-01T12:00:00Z"
}
```

**分页响应结构**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

**认证请求头**: `Authorization: Bearer {token}`

### 错误码设计

| 错误码 | 含义 | 说明 |
|--------|------|------|
| 200 | 成功 | 请求成功 |
| 400 | 参数错误 | 请求参数验证失败 |
| 401 | 未认证 | Token无效或过期 |
| 403 | 无权限 | 用户无操作权限 |
| 404 | 资源不存在 | 请求的资源不存在 |
| 500 | 服务器错误 | 内部服务器错误 |

### 主要接口详情

#### 认证接口
| 方法 | 路径 | 说明 | 参数 | 返回值 |
|------|------|--------|
| POST | /auth/login | 用户登录 | {username, password} | {token, userInfo} |
| POST | /auth/logout | 用户登出 | - | - |
| GET | /auth/profile | 获取用户信息 | - | {id, name, role, permissions} |

#### 听课计划接口
| 方法 | 路径 | 说明 | 参数 | 返回值 |
|------|------|--------|
| GET | /plans | 获取计划列表 | {page, pageSize, status, teacherId} | Plan[] |
| POST | /plans | 创建计划 | {title, classInfo, subject, teacherId, scheduledTime} | Plan |
| GET | /plans/{id} | 获取计划详情 | - | Plan |
| PUT | /plans/{id} | 更新计划 | {title, classInfo, subject, teacherId, scheduledTime, status} | Plan |
| DELETE | /plans/{id} | 删除计划 | - | - |

#### 评价接口
| 方法 | 路径 | 说明 | 参数 | 返回值 |
|------|--------|
| GET | /plans/{planId}/evaluations | 获取计划下评价列表 | - | Evaluation[] |
| POST | /plans/{planId}/evaluations | 提交评价 | {dimensions: [{name, score, comment}], overallComment} | Evaluation |
| GET | /evaluations/{id} | 获取评价详情 | - | Evaluation |
| PUT | /evaluations/{id}/status | 更新评价状态 | {status: 'archived'} | Evaluation |

#### 统计接口
| 方法 | 路径 | 说明 | 参数 | 返回值 |
|------|--------|
| GET | /statistics/trend | 教师评分趋势 | {teacherId, startDate, endDate} | TrendData |
| GET | /statistics/comparison | 课程评价对比 | {subject, classInfo} | ComparisonData |
| GET | /statistics/distribution | 评价维度分布 | {dimensionName} | DistributionData |

## 数据库设计

### 数据库选型
使用MySQL 8.0关系型数据库，支持事务处理，保证数据一致性。

### 表结构设计

#### 用户表 (users)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  real_name VARCHAR(50) NOT NULL,
  role_id INT NOT NULL,
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

#### 角色表 (roles)
```sql
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  permissions JSON NOT NULL
);
```

#### 听课计划表 (plans)
```sql
CREATE TABLE plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  class_info VARCHAR(100) NOT NULL,
  subject VARCHAR(50) NOT NULL,
  teacher_id INT NOT NULL,
  evaluator_id INT NOT NULL,
  scheduled_time DATETIME NOT NULL,
  status ENUM('draft', 'published', 'completed', 'archived') DEFAULT 'draft',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id),
  FOREIGN KEY (evaluator_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### 评价记录表 (evaluations)
```sql
CREATE TABLE evaluations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  plan_id INT NOT NULL,
  evaluator_id INT NOT NULL,
  overall_score DECIMAL(3,1),
  overall_comment TEXT,
  status ENUM('draft', 'submitted', 'archived') DEFAULT 'draft',
  submitted_at TIMESTAMP NULL,
  archived_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES plans(id),
  FOREIGN KEY (evaluator_id) REFERENCES users(id)
);
```

#### 评价维度表 (evaluation_dimensions)
```sql
CREATE TABLE evaluation_dimensions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  evaluation_id INT NOT NULL,
  dimension_name VARCHAR(100) NOT NULL,
  score INT NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE
);
```

### 索引设计
```sql
-- 用户表索引
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_department ON users(department);

-- 计划表索引
CREATE INDEX idx_plans_teacher ON plans(teacher_id);
CREATE INDEX idx_plans_evaluator ON plans(evaluator_id);
CREATE INDEX idx_plans_status ON plans(status);
CREATE INDEX idx_plans_scheduled_time ON plans(scheduled_time);

-- 评价表索引
CREATE INDEX idx_evaluations_plan ON evaluations(plan_id);
CREATE INDEX idx_evaluations_evaluator ON evaluations(evaluator_id);
CREATE INDEX idx_evaluations_status ON evaluations(status);
CREATE INDEX idx_evaluations_submitted_at ON evaluations(submitted_at);
```

### 数据关系设计
- **用户-角色**: 多对一关系，一个角色可分配给多个用户
- **计划-用户**: 多对一关系，计划关联被听课教师和听课教师
- **评价-计划**: 多对一关系，一个计划可有多条评价记录
- **评价-维度**: 一对多关系，一条评价包含多个评分维度

## 中间件配置

### 认证中间件
使用JWT进行身份认证，中间件实现：
```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ code: 401, message: '未提供认证令牌' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ code: 401, message: '令牌无效或已过期' });
  }
};

// 权限校验中间件
const permissionMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole && req.user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '权限不足' });
    }
    next();
  };
};
```

### 日志中间件
使用Winston进行日志记录：
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 请求日志中间件
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
};
```

### 错误处理中间件
```javascript
const errorHandler = (err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      code: 400,
      message: '数据验证失败',
      errors: err.errors
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      code: 401,
      message: '未授权访问'
    });
  }

  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  });
};
```

## 部署说明

### 部署环境要求

| 组件 | 版本要求 | 用途 |
|------|----------|------|
| Node.js | 18.x LTS | 运行时环境 |
| MySQL | 8.0+ | 数据库 |
| Nginx | 1.20+ | 反向代理 |
| PM2 | 5.x | 进程管理 |

### 部署步骤

1. **环境准备**
```bash

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo apt install mysql-server
sudo mysql_secure_installation

sudo apt install nginx
```

2. **项目部署**
```bash

git clone <repository-url>
cd teacher-evaluation-system

npm install --production

cp .env.example .env

npm run db:init

npm run build

pm2 start ecosystem.config.js
```

3. **Nginx配置**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/teacher-evaluation/dist;
        try_files $uri $uri/ /index.html;
    }

    # API反向代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 环境变量配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| NODE_ENV | 运行环境 | production |
| PORT | 服务端口 | 3000 |
| DB_HOST | 数据库主机 | localhost |
| DB_PORT | 数据库端口 | 3306 |
| DB_NAME | 数据库名 | teacher_evaluation |
| DB_USER | 数据库用户 | root |
| DB_PASSWORD | 数据库密码 | your_password |
| JWT_SECRET | JWT密钥 | your-secret-key |
| JWT_EXPIRES_IN | Token有效期 | 7d |
| LOG_LEVEL | 日志级别 | info |