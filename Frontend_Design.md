# 教师听课评测系统 - 前端设计说明文档

## 一、设计理念

整体采用**现代 SaaS 后台风格**，以**靛蓝色（#3B4BFF）**为主色调，搭配毛玻璃效果、柔和阴影、大圆角和细腻过渡动画，营造专业、清爽、现代的操作体验。

---

## 二、颜色系统

### 2.1 CSS 变量定义表

```css
:root {
  /* 主色系 - 靛蓝 */
  --primary:       #3B4BFF;
  --primary-light: #5B6BFF;
  --primary-dark:  #2B3BDF;
  --primary-bg:    rgba(59, 75, 255, 0.08);
  --primary-glow:  rgba(59, 75, 255, 0.25);

  /* 辅助色 */
  --warning:       #F59E0B;  /* 琥珀 - 警告/强调 */
  --success:       #10B981;  /* 翠绿 - 成功/完成 */
  --danger:        #EF4444;  /* 红色 - 危险/删除 */
  --info:          #6366F1;  /* 紫色 - 信息提示 */

  /* 背景色 */
  --bg-page:       #F8FAFC;  /* 页面底色 (极淡蓝灰) */
  --bg-card:       #FFFFFF;  /* 卡片背景 (纯白) */

  /* 边框色 */
  --border:        #E2E8F0;  /* 主边框 */
  --border-light:  #F1F5F9;  /* 浅边框分隔线 */

  /* 文字色 */
  --text-primary:   #1E293B; /* 主文字 (深蓝灰) */
  --text-secondary: #64748B; /* 次文字 (灰蓝) */
  --text-muted:     #94A3B8; /* 弱化文字 (浅灰蓝) */
}
```

### 2.2 使用场景速查

| 颜色 | 使用场景 |
|------|----------|
| `#3B4BFF` | 主按钮、链接、激活态、图表主色 |
| `#F59E0B` | 待评价状态、警告提示、评分星标 |
| `#10B981` | 已完成状态、成功提示 |
| `#EF4444` | 删除按钮、错误提示 |
| `#6366F1` | 统计图表辅助色 |
| `#F8FAFC` | 页面大背景 |
| `#FFFFFF` | 卡片、表格、对话框背景 |
| `#1E293B` | 标题、正文文字 |
| `#64748B` | 副标题、标签文字 |

---

## 三、圆角规范

| 等级 | 值 | 场景 |
|------|-----|------|
| `--radius-sm` | 8px | 标签、小按钮、输入框内 |
| `--radius-md` | 12px | 标准按钮、导航项、Logo图标 |
| `--radius-lg` | 16px | 卡片、表格卡片、对话框内容 |
| `--radius-xl` | 20px | 欢迎横幅、大型对话框 |
| `--radius-full` | 9999px | 头像、状态徽章、分页器按钮 |

**原则**: 外层容器用大圆角（16-20px），内层元素用小圆角（8-12px），形成层次对比。

---

## 四、阴影规范

| 等级 | 值 | 场景 |
|------|-----|------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.02)` | 极轻微，分隔线用 |
| `--shadow-md` | `0 4px 20px rgba(0,0,0,0.04)` | 卡片 hover、常规卡片 |
| `--shadow-lg` | `0 8px 30px rgba(0,0,0,0.08)` | 对话框、弹出层 |
| `--shadow-glow` | `0 0 20px rgba(59,75,255,0.25)` | 主色发光，焦点状态 |

**原则**: 所有阴影使用低不透明度黑色，多用扩散半径（blur），避免生硬投影。

---

## 五、动画效果

### 5.1 全局过渡动画

```css
--transition:      all 0.2s ease;   /* 快速交互（hover、focus） */
--transition-slow: all 0.3s ease;   /* 较慢过渡（展开、切换） */
```

### 5.2 Vue Transition（全局注册）

#### `fade` — 淡入淡出
- **时长**: 0.2s
- **进入**: opacity 0 → 1
- **离开**: opacity 1 → 0
- **场景**: 对话框、抽屉、提示消息

#### `slide` — 滑动淡入
- **时长**: 0.3s
- **进入**: opacity 0 + translateY(+20px) → opacity 1 + translateY(0)
- **离开**: opacity 1 → 0 + translateY(-20px)
- **场景**: 页面切换、列表项出现

### 5.3 页面级动画

#### `fadeIn` / `slideUp`（Dashboard 统计卡片）
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
```
- 统计卡片使用 `animation-delay` 实现逐个错开出现效果
- 每个卡片延迟 `index * 0.1s`

#### `cardEnter`（Plans/统计页面卡片）
```css
@keyframes cardEnter {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### 5.4 组件级动画

| 组件 | 动画 | 详情 |
|------|------|------|
| **按钮** | hover 上浮 + 阴影加深 | `translateY(-1px)`, box-shadow 变深 |
| **卡片** | hover 上浮 4px | `translateY(-4px)`, 阴影从 md→lg |
| **输入框** | focus 双光环 | `0 0 0 2px primary, 0 0 0 4px primary-bg` |
| **星级评分** | hover 放大 | 星星 `scale(1.2)`, 选中态 `scale(1.15)` |
| **导航项** | 平移动画 | 左移 4px (translateX(4px)) |
| **菜单折叠** | 宽度过渡 | sidebar 200px ↔ 80px, 0.3s ease |
| **统计图** | resize 防抖 | 窗口缩放时 ECharts resize, 100ms 防抖 |

### 5.5 交互反馈

| 元素 | 效果 |
|------|------|
| 导航激活 | 左侧 3px 靛蓝色竖条 + 白色文字 |
| 表格行 hover | 背景变 `#F8FAFC` |
| 状态徽章 | 半透明彩色背景 + 圆角 10px |
| 对话框遮罩 | 毛玻璃 `backdrop-filter: blur(4px)` |
| 加载态 | 90% 白色遮罩 + spinner |
| 计划卡片 | hover 边框变靛蓝 + 浮起效果 |

---

## 六、布局规范

### 6.1 页面级布局

```
┌─────────────────────────────────────┐
│  MainLayout                          │
│  ┌──────────┬──────────────────────┐│
│  │ Sidebar  │  Header              ││
│  │          │──────────────────────││
│  │  导航菜单  │  <router-view />     ││
│  │          │  padding: 24px 32px  ││
│  └──────────┴──────────────────────┘│
└─────────────────────────────────────┘
```

| 属性 | 侧边栏 | 内容区 |
|------|--------|--------|
| 宽度 | 240px (折叠 80px) | flex: 1 |
| 背景 | 深色渐变 `#1E293B → #334155` | `#F8FAFC` |
| 内边距 | - | 24px 32px |

### 6.2 内容区布局模式

#### 统计卡片网格（Dashboard）
```
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 24px;
```

#### 双列内容网格（Dashboard 下半部）
```
grid-template-columns: 1fr 320px;
gap: 24px;
```

#### 计划卡片网格（Plans 页面）
```
grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
gap: 24px;
```

#### 统计图表网格（Statistics 页面）
```
grid-template-columns: repeat(2, 1fr);
gap: 24px;
```

### 6.3 响应式断点

| 断点 | 效果 |
|------|------|
| ≤ 1200px | 统计卡片 4→2 列，双列→单列 |
| ≤ 768px | 统计卡片 2→1 列，欢迎区垂直排列 |
| ≤ 640px | 计划卡片 480px→100%，快捷操作 3→1 列 |

---

## 七、组件设计详解

### 7.1 登录页 (Login)

- **背景**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` 紫蓝渐变全屏
- **装饰**: 浮动圆形元素，`animation: float 6s ease-in-out infinite`
- **卡片**: 白色 `border-radius: 20px`, `box-shadow-lg`
- **表单**: Element Plus 组件覆盖，圆角 12px

### 7.2 主布局 (MainLayout)

- **侧边栏**: 深色渐变背景，Logo 使用 `linear-gradient(135deg, #3B4BFF, #667eea)` 图标
- **顶部栏**: 毛玻璃效果 `backdrop-filter: blur(10px)`, 白色半透明 `rgba(255,255,255,0.8)`
- **内容区**: padding 24px 32px, 最小高度 calc(100vh - 64px)

### 7.3 仪表盘 (Dashboard)

- 欢迎横幅: 靛蓝渐变 + 白色文字 + 发光阴影
- 统计卡片: 左侧彩色图标 + 右侧大数字 + hover 上浮
- 最近评价表格: 评分用 Star 组件 + 状态徽章
- 评分分布: ECharts 环形饼图，翠绿/琥珀双色
- 快捷操作: 3 列图标网格，灰色圆角按钮

### 7.4 计划管理 (Plans)

- 顶部搜索栏: flex 水平排列筛选条件
- 计划卡片: 白色圆角卡片，左侧彩色边条区分学科
- 状态徽章: 不同颜色区分草稿/已发布/已归档
- 操作按钮: 文字按钮 + 弹出菜单

### 7.5 评价页面 (Evaluation)

- 表单区域: 白色卡片包裹
- 5 维度评分: `el-rate` 星级组件，每项带文字说明
- 综合评语: `el-input type="textarea"` 多行文本
- 底部操作: flex 水平居中排列的提交/取消按钮

### 7.6 统计页面 (Statistics)

- 概览卡片: 4 列统计数字
- 趋势图: ECharts 折线图，渐变色填充
- 对比图: ECharts 柱状图，靛蓝/翠绿双色
- 分布图: ECharts 饼图，环形设计

---

## 八、间距体系

遵循 **4px 基准**的间距系统：

| 名称 | 值 | 场景 |
|------|-----|------|
| xs | 4px | 图标与文字间距 |
| sm | 8px | 标签内边距、小间距 |
| md | 16px | 卡片内边距、元素间距 |
| lg | 24px | 区块间距、网格 gap |
| xl | 32px | 页面 padding、大区块间距 |
| 2xl | 48px | 页面顶部间距 |

---

## 九、字体规范

| 层级 | 字号 | 字重 | 场景 |
|------|------|------|------|
| H1 | 28px | 700 | 欢迎标题 |
| H2 | 22px | 600 | 页面主标题 |
| H3 | 16px | 600 | 卡片标题 |
| Body | 14px | 400 | 正文、表格内容 |
| Small | 12-13px | 400-500 | 辅助文字、标签 |
| Stats | 32px | 700 | 统计数字 |

字体栈: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`

---

## 十、图表配色（ECharts）

```javascript
const chartColors = {
  primary:  '#3B4BFF',
  success:  '#10B981',
  warning:  '#F59E0B',
  info:     '#6366F1',
  purple:   '#8B5CF6',
  cyan:     '#06B6D4',
  pink:     '#EC4899',
};
```

---

## 十一、文件结构

```
frontend/src/
├── api/
│   └── index.js          # Axios 封装（拦截器、Token）
├── components/           # 可复用组件
├── layouts/
│   └── MainLayout.vue    # 主布局（侧边栏+顶部栏）
├── router/
│   └── index.js          # 路由配置 + 守卫
├── stores/
│   └── user.js           # Pinia 用户状态
├── styles/
│   └── global.css        # 全局样式 + CSS变量 + Element Plus 覆盖
├── views/
│   ├── Login.vue         # 登录页
│   ├── Dashboard.vue     # 仪表盘
│   ├── Plans.vue         # 计划管理
│   ├── Evaluation.vue    # 评价填写
│   ├── MyEvaluations.vue # 我的评价
│   ├── Records.vue       # 评课记录
│   └── Statistics.vue    # 统计分析
└── main.js               # 入口文件
```

---

## 十二、开发约定

1. **颜色**: 始终使用 CSS 变量，禁止硬编码颜色值
2. **圆角**: 外层大圆角（16px+），内层小圆角（8-12px）
3. **阴影**: 低不透明度、大扩散半径，不超 3 级
4. **动画**: 优先 `transition: all 0.2s/0.3s ease`，复杂动画用 `@keyframes`
5. **间距**: 基于 4px 倍数，使用 `gap` 代替 `margin` 做间距
6. **响应式**: 使用 `grid-template-columns: repeat(auto-fill, minmax(...))` 自适应
7. **按钮**: 主操作使用渐变色 + 内阴影高光
