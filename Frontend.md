# 教师听课评课管理系统前端技术文档

## 组件结构设计

### 组件树结构
```
App
└── MainLayout (布局组件)
    ├── Sidebar (侧边导航)
    ├── Header (顶部栏)
    └── Content (内容区)
        ├── LoginView (登录页)
        ├── DashboardView (仪表盘)
        ├── PlanManageView (计划管理)
        │   ├── PlanList (计划列表)
        │   └── PlanFormDialog (计划表单弹窗)
        ├── EvaluationView (评价填写)
        │   ├── EvaluationForm (评价表单)
        │   └── DimensionInput (维度输入组件)
        ├── RecordView (评课记录)
        │   ├── RecordList (记录列表)
        │   └── RecordDetailDrawer (记录详情抽屉)
        └── StatisticsView (统计分析)
            ├── TrendChart (趋势图)
            ├── ComparisonChart (对比图)
            └── DistributionChart (分布图)
```

### 组件职责划分
- **布局组件**：`MainLayout`, `Sidebar`, `Header` - 应用骨架、导航、用户信息展示
- **页面组件**：`*View`系列 - 对应路由页面，负责数据获取与页面级逻辑
- **功能组件**：`PlanList`, `EvaluationForm`等 - 封装特定业务功能，可复用
- **通用组件**：`StatusTag`, `ScoreInput`等 - 基础UI组件，无业务逻辑

### 组件命名规范
- 文件名：PascalCase，如`PlanList.vue`
- 组件名：PascalCase，与文件名一致
- 事件名：kebab-case，如`plan-created`
- Props：camelCase，如`planId`

### 组件复用策略
- **高复用组件**：`DataTable`(封装分页、筛选)、`SearchForm`(通用搜索)、`StatusTag`(状态标签)
- **业务组件库**：在`components/common`下建立基础组件库，在`components/business`下建立业务组件库
- **组合式API**：将可复用的逻辑（如数据获取、表单验证）提取为Composables

## 状态管理方案

### 状态结构设计
```javascript
// store/index.js
{
  user: { // 用户状态
    token: '',
    info: null, // {id, name, role}
    permissions: []
  },
  plan: { // 计划状态
    list: [],
    currentPlan: null,
    filters: {}
  },
  evaluation: { // 评价状态
    currentForm: null, // 当前填写的表单
    draft: {}, // 草稿数据
    submitting: false
  },
  global: { // 全局状态
    loading: false,
    error: null,
    notifications: []
  }
}
```

### 状态管理工具选型
- **Pinia**：官方推荐，TypeScript支持好，模块化清晰
- **持久化**：使用`pinia-plugin-persistedstate`插件
- **异步处理**：在Actions中处理API调用

### 状态更新流程
1. **用户操作** → 组件触发Action
2. **Action** → 调用API，处理异步
3. **API响应** → 根据结果提交Mutation（直接修改State）
4. **State更新** → 响应式更新视图

### 状态持久化方案
- **用户Token**：localStorage，长期保持
- **表单草稿**：sessionStorage，会话保持
- **用户偏好**：localStorage，如侧边栏折叠状态

## 路由设计

### 路由结构规划
```javascript
// router/index.js
const routes = [
  { path: '/login', component: 'LoginView' },
  {
    path: '/',
    component: 'MainLayout',
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', component: 'DashboardView', meta: { roles: ['admin', 'teacher'] } },
      { path: 'plan', component: 'PlanManageView', meta: { roles: ['admin'] } },
      { path: 'evaluation/:planId', component: 'EvaluationView', meta: { roles: ['teacher'] } },
      { path: 'record', component: 'RecordView', meta: { roles: ['admin'] } },
      { path: 'statistics', component: 'StatisticsView', meta: { roles: ['admin'] } }
    ]
  }
]
```

### 路由守卫设计
- **全局前置守卫**：检查登录状态（Token有效性）
- **路由独享守卫**：`beforeEnter`检查角色权限
- **组件内守卫**：`beforeRouteLeave`提示表单未保存

### 路由参数设计
- **动态路由**：`/evaluation/:planId` - 评价页面需要计划ID
- **查询参数**：`/record?status=archived&page=1` - 列表页筛选与分页
- **命名路由**：便于编程式导航

## 样式方案

### 样式框架选择
- **UI组件库**：Element Plus - 提供丰富的后台管理组件
- **CSS预处理器**：Sass/SCSS - 支持变量、嵌套、混合
- **原子化CSS**：可考虑Tailwind CSS（可选）

### 样式组织方式
```
styles/
├── variables.scss  // Element Plus主题变量覆盖
├── mixins.scss     // 公用混合宏
├── common.scss     // 重置样式、基础样式
└── components.scss // 组件特定样式
```

### 响应式设计方案
- **断点设置**：Element Plus默认断点（xs/sm/md/lg/xl）
- **布局策略**：使用Flexbox/Grid，侧边栏可折叠
- **组件适配**：表格横向滚动、表单布局调整、图表尺寸自适应

## 用户体验优化

### 加载状态处理
- **全局加载**：使用`<el-loading>`指令覆盖全屏
- **局部加载**：在按钮、表格等组件上使用`loading`属性
- **骨架屏**：列表页、详情页使用骨架屏占位

### 错误提示设计
- **表单错误**：Element Plus表单验证，错误信息在输入框下方显示
- **接口错误**：使用`ElMessage.error()`全局提示
- **页面级错误**：404、403等错误页面，带返回首页链接

### 操作反馈机制
- **成功操作**：`ElMessage.success()`提示
- **危险操作**：`ElMessageBox.confirm()`二次确认
- **异步操作**：按钮加载状态 + 结果提示

## 表单验证与错误处理

### 表单验证规则
```javascript
// 评价表单验证规则示例
const evaluationRules = {
  scores: [
    { required: true, message: '请填写评分', trigger: 'blur' },
    { type: 'number', min: 1, max: 5, message: '评分需在1-5之间', trigger: 'blur' }
  ],
  comment: [
    { required: true, message: '请填写评语', trigger: 'blur' },
    { min: 10, max: 500, message: '评语长度在10-500字符', trigger: 'blur' }
  ]
}
```

### 错误消息设计
- **即时验证**：失焦时验证，不阻塞输入
- **提交验证**：提交时验证所有字段，高亮错误字段
- **错误汇总**：表单顶部显示错误数量汇总

### 表单提交流程
1. 前端验证 → 2. 确认提示 → 3. 提交请求 → 4. 处理响应 → 5. 跳转/重置

## 响应式设计

### 断点设置
```scss
$breakpoints: (
  'xs': 576px,
  'sm': 768px,
  'md': 992px,
  'lg': 1200px,
  'xl': 1920px
);
```

### 组件响应式策略
- **导航菜单**：小屏幕折叠为汉堡菜单
- **数据表格**：小屏幕横向滚动，隐藏次要列
- **表单布局**：从多列变为单列布局
- **图表**：根据容器宽度自动调整尺寸

### 移动端适配方案
- **视口设置**：`<meta name="viewport" content="width=device-width, initial-scale=1">`
- **触摸优化**：增大点击区域，使用`touch-action`属性
- **性能优化**：减少重绘重排，使用`will-change`属性