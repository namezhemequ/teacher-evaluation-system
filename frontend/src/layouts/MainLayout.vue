<template>
  <div class="main-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span v-show="!isCollapsed" class="logo-text">听课评测</span>
        </div>
        <button class="collapse-btn" @click="isCollapsed = !isCollapsed">
          <el-icon :size="18">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <el-icon :size="20">
            <component :is="item.icon" />
          </el-icon>
          <span v-show="!isCollapsed" class="nav-text">{{ item.label }}</span>
          <span v-show="!isCollapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
        </router-link>
      </nav>
      
      <div class="sidebar-footer">
        <div class="user-info" v-show="!isCollapsed">
          <el-avatar :size="36" :style="{ background: 'rgba(255,255,255,0.2)' }">
            {{ userStore.userInfo?.realName?.charAt(0) || 'U' }}
          </el-avatar>
          <div class="user-detail">
            <span class="user-name">{{ userStore.userInfo?.realName }}</span>
            <span class="user-role">{{ userStore.isAdmin ? '管理员' : '教师' }}</span>
          </div>
        </div>
        <el-dropdown @command="handleCommand" trigger="click">
          <button class="logout-btn">
            <el-icon :size="20"><SwitchButton /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </aside>
    
    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 顶部栏 -->
      <header class="top-header">
        <div class="header-left">
          <h1 class="page-title">{{ currentPageTitle }}</h1>
          <el-breadcrumb separator="·" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <div class="header-time">{{ currentTime }}</div>
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="header-user">
              <el-avatar :size="32" class="user-avatar">
                {{ userStore.userInfo?.realName?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="header-username">{{ userStore.userInfo?.realName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      
      <!-- 内容区 -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/user';
import { ElMessageBox } from 'element-plus';
import { 
  Odometer, Document, Edit, Files, DataAnalysis, 
  Fold, Expand, SwitchButton, ArrowDown, User, InfoFilled 
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const isCollapsed = ref(false);
const currentTime = ref('');

const menuItems = computed(() => {
  const items = [
    { path: '/dashboard', label: '仪表盘', icon: 'Odometer' },
  ];
  if (userStore.isAdmin) {
    items.push(
      { path: '/plans', label: '计划管理', icon: 'Document' },
      { path: '/records', label: '评课记录', icon: 'Files' },
      { path: '/statistics', label: '统计分析', icon: 'DataAnalysis' }
    );
  }
  if (userStore.isTeacher) {
    items.push({ path: '/my-evaluations', label: '我的评价', icon: 'Edit' });
  }
  return items;
});

const pageTitles = {
  '/dashboard': '仪表盘',
  '/plans': '计划管理',
  '/my-evaluations': '我的评价',
  '/records': '评课记录',
  '/statistics': '统计分析',
};

const currentPageTitle = computed(() => pageTitles[route.path] || '听课评测系统');

const isActive = (path) => route.path === path || route.path.startsWith(path + '/');

const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm(
        '确定要退出登录吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info',
          customClass: 'confirm-dialog',
        }
      );
      userStore.logout();
      router.push('/login');
    } catch (e) {
      // 取消操作
    }
  }
};

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

let timer;
onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
  background: #F8FAFC;
}

/* 侧边栏 */
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1E293B 0%, #334155 100%);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar.collapsed {
  width: 72px;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3B4BFF 0%, #667eea 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-icon svg {
  width: 24px;
  height: 24px;
  color: #fff;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}

.collapse-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.sidebar.collapsed .collapse-btn {
  display: none;
}

/* 导航菜单 */
.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 12px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: #3B4BFF;
  border-radius: 0 4px 4px 0;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.nav-badge {
  background: #EF4444;
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: auto;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 14px;
}

.sidebar.collapsed .nav-item.active::before {
  display: none;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.user-detail {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.logout-btn {
  width: 36px;
  height: 36px;
  background: rgba(239, 68, 68, 0.2);
  border: none;
  border-radius: 10px;
  color: #FCA5A5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  color: #fff;
}

/* 主内容区 */
.main-container {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.sidebar.collapsed ~ .main-container {
  margin-left: 72px;
}

/* 顶部栏 */
.top-header {
  height: 72px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
}

.breadcrumb {
  font-size: 12px;
}

.breadcrumb :deep(.el-breadcrumb__inner) {
  color: #94A3B8;
}

.breadcrumb :deep(.el-breadcrumb__separator) {
  color: #CBD5E1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-time {
  font-size: 13px;
  color: #64748B;
  padding: 6px 12px;
  background: #F1F5F9;
  border-radius: 8px;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: #F8FAFC;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-user:hover {
  background: #F1F5F9;
}

.user-avatar {
  background: linear-gradient(135deg, #3B4BFF 0%, #667eea 100%);
  color: #fff;
  font-weight: 600;
}

.header-username {
  font-size: 14px;
  font-weight: 500;
  color: #1E293B;
}

/* 内容区 */
.main-content {
  flex: 1;
  padding: 32px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 响应式 */
@media (max-width: 1024px) {
  .sidebar {
    width: 72px;
  }
  
  .main-container {
    margin-left: 72px;
  }
  
  .logo-text,
  .nav-text,
  .nav-badge,
  .user-info {
    display: none !important;
  }
  
  .collapse-btn {
    display: none !important;
  }
  
  .nav-item {
    justify-content: center;
    padding: 14px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .main-container {
    margin-left: 0;
  }
}
</style>
