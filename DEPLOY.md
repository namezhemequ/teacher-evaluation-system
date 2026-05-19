# 教师听课评课管理系统 - 部署指南

## 方案一：Vercel + Railway（推荐，最简单）

### 1. 部署后端到 Railway

1. 访问 [railway.app](https://railway.app)，用 GitHub 登录
2. 点击 **New Project** → **Deploy from GitHub repo**
3. 选择本仓库
4. Railway 会自动检测 Node.js 项目，等待部署完成
5. 部署后在 Settings → Variables 添加：
   ```
   JWT_SECRET = your_random_secret_key_here
   ```
6. 复制 Railway 给你的后端 URL（如：`https://teacher-eval.railway.app`）

### 2. 配置后端 CORS

Railway 部署后需要允许前端域名访问。在 `backend/src/app.js` 中已有 CORS 配置，Railway 会自动设置。

### 3. 部署前端到 Vercel

1. 访问 [vercel.com](https://vercel.com)，用 GitHub 登录
2. 点击 **Add New** → **Project**
3. 导入本仓库
4. **Framework Preset** 选择 `Vite`
5. **Build Command** 填 `npm run build`
6. **Output Directory** 填 `dist`
7. 在 Environment Variables 添加：
   ```
   VITE_API_BASE = https://your-railway-url.railway.app/api/v1
   ```
8. 点击 Deploy

### 4. 更新前端 API 地址

创建 `frontend/vite.config.js`：
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
```

创建 `frontend/.env.production`：
```
VITE_API_BASE = https://your-railway-url.railway.app/api/v1
```

---

## 方案二：使用 Docker 部署到任意服务器

### 构建镜像

```bash
# 后端
cd backend
docker build -t teacher-eval-backend .

# 前端（需要先修改API地址）
cd frontend
docker build -t teacher-eval-frontend .
```

### 运行

```bash
# 后端
docker run -p 3000:3000 -e JWT_SECRET=xxx teacher-eval-backend

# 前端（需要nginx）
docker run -p 80:80 teacher-eval-frontend
```

---

## 测试部署

部署完成后访问：
- 前端地址：Vercel 提供的 URL（如 `https://teacher-eval.vercel.app`）
- 后端地址：Railway 提供的 URL（如 `https://teacher-eval.railway.app`）
- API 测试：`https://teacher-eval.railway.app/api/v1/plans`

默认账号：
- 管理员：`admin` / `admin123`
- 教师：`teacher1` / `teacher123`
