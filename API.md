# 教师听课评课管理系统 API 接口契约文档

## API 设计规范
- **RESTful API 命名规范**：以资源为中心，使用名词复数形式。
- **版本控制策略**：`/api/v1`
- **认证方案**：JWT Bearer Token
- **统一响应格式**：`{ code, message, data }`

## 接口列表

### 用户认证模块
| 方法 | 路径 | 功能描述 | 核心请求参数 | 响应示例 |
|------|------|----------|--------------|
| POST | `/api/v1/auth/login` | 用户登录，获取Token和用户信息 | `{ username, password }` | `{ code: 200, message: "success", data: { token: "xxx", userInfo: { id, name, role } } }` |
| GET | `/api/v1/auth/profile` | 获取当前登录用户信息 | - | `{ code: 200, message: "success", data: { id, name, role, permissions } }` |
| POST | `/api/v1/auth/logout` | 用户登出 | - | `{ code: 200, message: "success", data: null }` |

### 业务核心模块
| 方法 | 路径 | 功能描述 | 核心请求参数 | 响应示例 |
|------|--------------|----------|
| POST | `/api/v1/plans` | 管理员创建听课计划 | `{ title, classInfo, subject, teacherId, scheduledTime }` | `{ code: 200, message: "success", data: { id, title, status: "draft" } }` |
| PUT | `/api/v1/plans/{id}/publish` | 管理员发布听课计划 | - | `{ code: 200, message: "success", data: { id, status: "published" } }` |
| GET | `/api/v1/plans` | 获取听课计划列表（分页、筛选） | `{ page, pageSize, status, teacherId }` | `{ code: 200, message: "success", data: { list: [], pagination: {} } }` |
| GET | `/api/v1/plans/{planId}/evaluations` | 获取指定计划下的评价列表 | - | `{ code: 200, message: "success", data: [{ id, teacherName, overallScore }] }` |
| POST | `/api/v1/plans/{planId}/evaluations` | 教师提交课堂评价表 | `{ dimensions: [{name, score, comment}], overallComment }` | `{ code: 200, message: "success", data: { id, status: "submitted" } }` |
| GET | `/api/v1/evaluations/{id}` | 获取评价表详情 | - | `{ code: 200, message: "success", data: { dimensions, overallComment, submitTime } }` |
| GET | `/api/v1/records` | 管理员查询评课记录（多条件） | `{ teacherId, subject, startDate, endDate, status }` | `{ code: 200, message: "success", data: { list: [] } }` |
| PUT | `/api/v1/records/{id}/archive` | 管理员归档评课记录 | - | `{ code: 200, message: "success", data: { id, status: "archived" } }` |
| GET | `/api/v1/statistics/trend` | 获取教师评分趋势数据 | `{ teacherId, startDate, endDate }` | `{ code: 200, message: "success", data: { dates: [], scores: [] } }` |
| GET | `/api/v1/statistics/comparison` | 获取课程评价对比数据 | `{ subject, classInfo }` | `{ code: 200, message: "success", data: { labels: [], data: [] } }` |
| GET | `/api/v1/statistics/distribution` | 获取评价维度分布数据 | `{ dimensionName }` | `{ code: 200, message: "success", data: { dimensions: [], counts: [] } }` |

### 系统管理模块
| 方法 | 路径 | 功能描述 | 核心请求参数 | 响应示例 |
|------|----------|--------------|----------|
| GET | `/api/v1/users` | 管理员获取用户列表 | `{ role, keyword }` | `{ code: 200, message: "success", data: { list: [] } }` |
| PUT | `/api/v1/users/{id}/status` | 管理员启用/禁用用户 | `{ isActive }` | `{ code: 200, message: "success", data: { id, isActive } }` |

## 错误码设计
| 错误码 | 含义 | 说明 |
|--------|------|
| 200 | 成功 | 请求成功 |
| 400 | 参数错误 | 请求参数验证失败 |
| 401 | 未认证 | Token无效或过期 |
| 403 | 无权限 | 用户无操作权限 |
| 404 | 资源不存在 | 请求的资源不存在 |
| 409 | 冲突 | 资源状态冲突（如计划已发布） |
| 500 | 服务器错误 | 内部服务器错误 |
| 1001 | 用户不存在 | 登录用户不存在 |
| 1002 | 密码错误 | 用户密码错误 |
| 2001 | 计划不存在 | 听课计划不存在 |
| 3001 | 评价已提交 | 评价表不可重复提交 |