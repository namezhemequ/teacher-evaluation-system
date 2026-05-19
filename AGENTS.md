# AGENTS.md — 教师听课评课管理系统 AI 编码规则文档

## 最高优先规则
1.  **启动前置审核**：在开始任何编码、拆分任务、编写实现或调用外部AI工具前，必须首先完整审核本项目全部7份文档：`PRD.md`、`Frontend.md`、`Backend.md`、`API.md`、`task.md`、`context_state.md`、`AGENTS.md`。
2.  **处理审核修订**：若上述任意文档中存在“审核修订记录”或“审核修订”章节，必须依据修订记录重新整合、编排相关文档内容（如接口变更、任务顺序调整、术语统一等），确保所有文档基于最新共识。
3.  **禁止跳过**：在完成文档整合与规划前，不得直接进入编码阶段，也不得忽略修订记录继续执行。
4.  **响应指令**：当用户在AI编程工具中输入“了解项目规则，查看 AGENTS.md 文档”时，必须立即执行本规则，再开始后续引导。

## 项目概述
本项目旨在开发一个“教师听课评课管理系统”的Web应用原型。项目背景是为学校教学管理提供数字化工具，以规范听课评课流程、沉淀教学数据、促进教师专业成长。核心目标是实现听课评课流程的线上化、标准化与数据化，提升管理效率，提供客观的教学评估依据。系统需覆盖用户登录、权限控制、数据增删改查、条件查询、状态流转、基础统计及至少三类图表输出等核心能力。

## 技术栈
- **前端**：Vue 3, Element Plus, Vue Router, Pinia, Axios, ECharts
- **后端**：Node.js, Express, Sequelize (ORM), JWT (jsonwebtoken), bcrypt
- **数据库**：MySQL 8.0
- **构建与部署**：Vite, Nginx
- **测试**：Jest (后端单元测试), Vitest (前端单元测试), Cypress (端到端测试)

## 项目结构
```
teacher-evaluation-system/
├── frontend/               # Vue 3 前端项目
│   ├── src/
│   │   ├── api/            # Axios 封装与接口调用
│   │   ├── assets/         # 静态资源
│   │   ├── components/     # 可复用组件 (common/, business/)
│   │   ├── composables/    # 组合式函数
│   │   ├── layouts/        # 布局组件
│   │   ├── router/         # 路由配置与守卫
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── styles/         # 全局样式
│   │  └── views/          # 页面级组件
│   └── ...
├── backend/                # Node.js + Express 后端项目
│   ├── src/
│   │   ├── config/         # 数据库、JWT等配置
│   │   ├── controllers/    # 控制器层
│   │   ├── middlewares/    # 中间件 (认证、权限、错误处理)
│   │   ├── models/         # Sequelize 数据模型
│   │   ├── routes/         # 路由定义
│   │   ├── services/       # 业务逻辑层
│   │   └── utils/          # 工具函数
│   └── ...
├── database/               # 数据库初始化脚本与迁移文件
├── docs/                   # 项目文档 (PRD, 设计等)
└── nginx/                  # Nginx 配置文件
```

## API 契约摘要
- **认证方式**：JWT Bearer Token。客户端在请求头中携带 `Authorization: Bearer <token>`。
- **基础 URL**：`/api/v1`
- **核心接口列表**：
    - **认证**：`POST /auth/login` (登录), `GET /auth/profile` (获取用户信息)
    - **计划管理**：`POST /plans` (创建), `PUT /plans/{id}/publish` (发布), `GET /plans` (列表查询)
    - **评价提交**：`POST /plans/{planId}/evaluations` (提交评价), `GET /evaluations/{id}` (详情)
    - **记录归档**：`GET /records` (多条件查询), `PUT /records/{id}/archive` (归档)
    - **统计分析**：`GET /statistics/trend` (趋势), `GET /statistics/comparison` (对比), `GET /statistics/distribution` (分布)

## 任务执行指南
- **执行顺序**：严格按照 `task.md` 中的任务编号顺序执行（T-01 → T-10）。依赖关系如下：
    - T-01 (初始化) → T-02 (数据库) → T-03 (认证) → T-04 (前端布局) → T-05 (计划API) → T-06 (评价模块) → T-07 (记录模块) → T-08 (统计模块) → T-09 (测试) → T-10 (部署)。
- **依赖关系**：后置任务必须等待其所有前置依赖任务状态更新为“COMPLETED”后方可开始。
- **验收标准**：每个任务完成后，必须核对 `task.md` 中该任务列出的所有验收标准项，确保全部满足。

## 开发规则

### 代码规范
- **风格**：遵循 ESLint + Prettier 配置。后端使用 StandardJS风格，前端使用 Vue 官方风格指南。
- **命名**：
    - 文件/目录：`kebab-case` (前端视图组件可使用 `PascalCase.vue`)
    - 变量/函数：`camelCase`
    - 常量/枚举：`UPPER_SNAKE_CASE`
    - 数据库表/字段：`snake_case`
- **注释**：关键业务逻辑、复杂函数、API接口必须使用JSDoc或标准注释格式说明功能、参数和返回值。

### 安全要求
- **输入验证**：所有用户输入（请求体、参数）必须在后端进行严格验证与清洗，防止SQL注入、XSS攻击。
- **认证授权**：所有非公开API必须通过JWT中间件验证。关键操作需校验用户角色与数据权限（如教师只能操作自己的评价）。
- **数据加密**：用户密码必须使用 `bcrypt` 进行哈希加盐存储。敏感信息在传输和存储时需考虑加密。

### 测试要求
- **单元测试**：核心业务逻辑（Service层）、工具函数需编写单元测试，覆盖率不低于70%。
- **集成测试**：对关键API接口（如登录、提交评价、统计查询）进行集成测试，验证接口契约与业务逻辑正确性。

## ContextState 更新规则
**重要：每次完成一个任务后，必须按以下步骤更新 `context_state.md` 文件：**

1.  **更新状态**：将已完成任务的状态从 `PENDING` 或 `IN_PROGRESS` 更新为 `COMPLETED`。
2.  **记录时间**：在任务的“完成时间”列填写当前日期时间（格式：`YYYY-MM-DD HH:MM`）。
3.  **更新进度**：重新计算并更新“已完成任务数”和“完成百分比”。
4.  **确定下一步**：根据任务依赖关系，在“下一步行动”部分明确指出下一个应执行的任务及其依赖前提。
5.  **记录问题**：若任务执行中遇到任何问题或阻碍，在“遇到的问题”部分进行记录，并简要说明解决方案或当前状态。
6.  **添加变更记录**：在文件末尾的“变更记录”表格中，新增一行，记录本次更新的时间、更新内容（如“完成 T-01: xxx，下一步执行 T-02: xxx”）和更新人（可写“AI助手”）。

## 文档引用
本项目开发过程必须参考以下7份文档，它们共同构成项目知识库：
1.  `PRD.md` — 产品需求文档
2.  `Frontend.md` — 前端技术文档
3.  `Backend.md` — 后端技术文档
4.  `API.md` — API 接口契约文档
5.  `task.md` — 开发任务清单
6.  `context_state.md` — 项目状态追踪文档（每次完成任务后必须更新此文件）
7.  `AGENTS.md` — 本文件（AI 编码规则，最高优先级）

## 执行流程
1.  **启动检查**：执行“最高优先规则”，审核全部文档，处理任何修订记录。
2.  **理解需求**：阅读 `PRD.md`，掌握项目目标、功能需求与验收标准。
3.  **熟悉方案**：阅读 `Frontend.md` 和 `Backend.md`，了解技术架构、组件设计与状态管理。
4.  **明确接口**：阅读 `API.md`，牢记接口路径、参数、响应格式及认证方式。
5.  **了解任务**：阅读 `task.md`，明确当前任务清单、顺序及依赖。
6.  **检查状态**：阅读 `context_state.md`，确认当前项目进度与下一步行动。
7.  **执行开发**：严格按照任务顺序和依赖关系，逐个完成开发任务。
8.  **更新状态**：每完成一个任务，立即按上述规则更新 `context_state.md`。
9.  **循环迭代**：重复步骤6-8，直至所有任务完成。

## CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

Tradeoff: These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.
- Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.