<template>
  <div class="main-layout" ref="layoutRef">
    <!-- 背景 Canvas -->
    <canvas ref="bgCanvasRef" class="bg-canvas"></canvas>

    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }" ref="sidebarRef">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon" ref="logoIconRef">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <span v-show="!isCollapsed" class="logo-text">听课评测</span>
        </div>
        <button class="collapse-btn" @click="toggleSidebar"><el-icon :size="18"><Fold v-if="!isCollapsed"/><Expand v-else/></el-icon></button>
      </div>
      <nav class="sidebar-nav">
        <router-link v-for="(item,i) in menuItems" :key="item.path" :to="item.path" class="nav-item" :class="{active:isActive(item.path)}" :ref="el=>navItemRefs[i]=el">
          <el-icon :size="20"><component :is="item.icon"/></el-icon>
          <span v-show="!isCollapsed" class="nav-text">{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info" v-show="!isCollapsed">
          <el-avatar :size="36" :style="{background:'linear-gradient(135deg,#409EFF,#00C8FF)'}">{{ userStore.userInfo?.realName?.charAt(0)||'U' }}</el-avatar>
          <div class="user-detail"><span class="user-name">{{ userStore.userInfo?.realName }}</span><span class="user-role">{{ userStore.isAdmin?'管理员':'教师' }}</span></div>
        </div>
        <el-dropdown @command="handleCommand" trigger="click">
          <button class="logout-btn"><el-icon :size="20"><SwitchButton /></el-icon></button>
          <template #dropdown><el-dropdown-menu><el-dropdown-item command="logout"><el-icon><SwitchButton/></el-icon><span>退出登录</span></el-dropdown-item></el-dropdown-menu></template>
        </el-dropdown>
      </div>
    </aside>

    <div class="main-container">
      <header class="top-header">
        <div class="header-left">
          <h1 class="page-title" ref="pageTitleRef">{{ currentPageTitle }}</h1>
          <el-breadcrumb separator="·" class="breadcrumb"><el-breadcrumb-item :to="{path:'/dashboard'}">首页</el-breadcrumb-item><el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item></el-breadcrumb>
        </div>
        <div class="header-right">
          <div class="header-time">{{ currentTime }}</div>
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="header-user" ref="userBtnRef">
              <el-avatar :size="32" class="user-avatar">{{ userStore.userInfo?.realName?.charAt(0)||'U' }}</el-avatar>
              <span class="header-username">{{ userStore.userInfo?.realName }}</span>
              <el-icon><ArrowDown/></el-icon>
            </div>
            <template #dropdown><el-dropdown-menu><el-dropdown-item command="logout" divided><el-icon><SwitchButton/></el-icon><span>退出登录</span></el-dropdown-item></el-dropdown-menu></template>
          </el-dropdown>
        </div>
      </header>
      <main class="main-content" ref="contentRef">
        <router-view v-slot="{Component}">
          <transition @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave" :css="false" mode="out-in">
            <component :is="Component" :key="route.fullPath"/>
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../stores/user';
import { ElMessageBox } from 'element-plus';
import { Odometer, Document, Edit, Files, DataAnalysis, Fold, Expand, SwitchButton, ArrowDown } from '@element-plus/icons-vue';
import gsap from 'gsap';
import { useTechBackground } from '../composables/useTechBackground';

const router = useRouter(), route = useRoute(), userStore = useUserStore();
const isCollapsed = ref(false), currentTime = ref('');
const layoutRef = ref(null), sidebarRef = ref(null), logoIconRef = ref(null), navRef = ref(null);
const headerRef = ref(null), pageTitleRef = ref(null), contentRef = ref(null), timeRef = ref(null), userBtnRef = ref(null);
const navItemRefs = ref([]);
const bgCanvasRef = ref(null);
let ctx = null;

const menuItems = computed(() => {
  const items = [{ path: '/dashboard', label: '仪表盘', icon: 'Odometer' }];
  if (userStore.isAdmin) items.push({ path: '/plans', label: '计划管理', icon: 'Document' }, { path: '/records', label: '评课记录', icon: 'Files' }, { path: '/statistics', label: '统计分析', icon: 'DataAnalysis' });
  if (userStore.isTeacher) items.push({ path: '/my-evaluations', label: '我的评价', icon: 'Edit' });
  return items;
});
const pageTitles = { '/dashboard': '仪表盘', '/plans': '计划管理', '/my-evaluations': '我的评价', '/records': '评课记录', '/statistics': '统计分析' };
const currentPageTitle = computed(() => pageTitles[route.path] || '听课评测系统');
const isActive = p => route.path === p || route.path.startsWith(p + '/');
const toggleSidebar = () => { isCollapsed.value = !isCollapsed.value; };

const animateSidebarEntrance = () => nextTick(() => {
  const items = navItemRefs.value.filter(Boolean);
  if (!items.length) return;
  gsap.from(items, { x: -40, opacity: 0, duration: 0.45, stagger: 0.1, ease: 'power3.out', delay: 0.2 });
});

const onBeforeEnter = el => gsap.set(el, { opacity: 0, y: 16 });
const onEnter = (el, done) => gsap.to(el, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', onComplete: done });
const onLeave = (el, done) => gsap.to(el, { opacity: 0, y: -12, duration: 0.2, ease: 'power2.in', onComplete: done });

watch(isCollapsed, () => {
  const targets = '.logo-text,.nav-text,.user-info';
  gsap.to(targets, { opacity: isCollapsed.value ? 0 : 1, duration: isCollapsed.value ? 0.15 : 0.3, ease: isCollapsed.value ? 'power2.in' : 'power2.out', delay: isCollapsed.value ? 0 : 0.15 });
});

const handleCommand = async cmd => {
  if (cmd !== 'logout') return;
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' });
    if (contentRef.value) await gsap.to(contentRef.value, { opacity: 0, scale: 0.97, duration: 0.3, ease: 'power2.in' });
    userStore.logout(); router.push('/login');
  } catch (e) {}
};

const updateTime = () => { const n = new Date(); currentTime.value = n.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); };
let timer;
onMounted(() => {
  updateTime(); timer = setInterval(updateTime, 1000);
  useTechBackground(bgCanvasRef, { particleCount: 15, particleAlpha: 0.18, gridAlpha: 0.025 });
  ctx = gsap.context(animateSidebarEntrance, layoutRef.value);
});
onUnmounted(() => { clearInterval(timer); ctx?.revert(); });
</script>

<style scoped>
.main-layout { display: flex; min-height: 100vh; background: #0A1628; position: relative; }
.bg-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }

/* 侧边栏 */
.sidebar { width: 260px; background: rgba(10,22,40,0.92); backdrop-filter: blur(16px); display: flex; flex-direction: column; transition: width 0.35s cubic-bezier(.4,0,.2,1); position: fixed; left: 0; top: 0; bottom: 0; z-index: 100; border-right: 1px solid rgba(0,200,255,0.08); }
.sidebar.collapsed { width: 72px; }
.sidebar-header { padding: 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,200,255,0.08); }
.logo { display: flex; align-items: center; gap: 12px; }
.logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg,#409EFF,#00C8FF); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 20px rgba(0,200,255,0.3); }
.logo-icon svg { width: 24px; height: 24px; color: #fff; }
.logo-text { font-size: 18px; font-weight: 700; color: #E8F4FD; letter-spacing: 1px; text-shadow: 0 0 15px rgba(0,200,255,0.3); }
.collapse-btn { width: 32px; height: 32px; background: rgba(0,200,255,0.08); border: 1px solid rgba(0,200,255,0.12); border-radius: 8px; color: rgba(0,200,255,0.6); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.collapse-btn:hover { background: rgba(0,200,255,0.15); color: #00C8FF; border-color: rgba(0,200,255,0.25); }

.sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 13px 16px; color: rgba(176,200,230,0.55); text-decoration: none; border-radius: 12px; margin-bottom: 4px; position: relative; }
.nav-item:hover { background: rgba(0,200,255,0.06); color: #D0E8FF; }
.nav-item.active { background: rgba(0,200,255,0.1); color: #E0F0FF; }
.nav-item.active::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 3px; height: 24px; background: #00C8FF; border-radius: 0 3px 3px 0; box-shadow: 0 0 16px rgba(0,200,255,0.5), 0 0 32px rgba(0,200,255,0.2); }
.nav-text { font-size: 14px; font-weight: 500; }

.sidebar-footer { padding: 16px; border-top: 1px solid rgba(0,200,255,0.08); display: flex; align-items: center; justify-content: space-between; }
.user-info { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
.user-detail { display: flex; flex-direction: column; min-width: 0; }
.user-name { font-size: 14px; font-weight: 500; color: #D0E8FF; }
.user-role { font-size: 12px; color: rgba(136,180,220,0.6); }
.logout-btn { width: 36px; height: 36px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.15); border-radius: 10px; color: #FCA5A5; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.logout-btn:hover { background: rgba(239,68,68,0.2); color: #FECACA; }

.sidebar.collapsed .nav-item { justify-content: center; padding: 14px; }
.sidebar.collapsed .nav-item.active::before { display: none; }

/* 主内容区 */
.main-container { flex: 1; margin-left: 260px; display: flex; flex-direction: column; min-height: 100vh; transition: margin-left .35s cubic-bezier(.4,0,.2,1); position: relative; z-index: 1; }
.sidebar.collapsed ~ .main-container { margin-left: 72px; }

/* 顶部栏 */
.top-header { height: 72px; background: rgba(10,22,40,0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(0,200,255,0.06); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; position: sticky; top: 0; z-index: 50; }
.page-title { font-size: 20px; font-weight: 600; color: #E8F4FD; margin: 0; letter-spacing: 1px; }
.breadcrumb { font-size: 12px; }
.breadcrumb :deep(.el-breadcrumb__inner) { color: #5A7E9E; } .breadcrumb :deep(.el-breadcrumb__separator) { color: #3A5E7E; }
.header-right { display: flex; align-items: center; gap: 20px; }
.header-time { font-size: 13px; color: #6A8EAE; padding: 6px 14px; background: rgba(0,200,255,0.04); border: 1px solid rgba(0,200,255,0.06); border-radius: 8px; }
.header-user { display: flex; align-items: center; gap: 10px; padding: 6px 14px; background: rgba(0,200,255,0.04); border: 1px solid rgba(0,200,255,0.06); border-radius: 10px; cursor: pointer; }
.header-user:hover { background: rgba(0,200,255,0.08); }
.user-avatar { background: linear-gradient(135deg,#409EFF,#00C8FF)!important; color: #fff!important; font-weight: 600; }
.header-username { font-size: 14px; font-weight: 500; color: #B0D0E8; }

.main-content { flex: 1; padding: 32px; max-width: 1400px; width: 100%; margin: 0 auto; position: relative; z-index: 1; }

@media(max-width:1024px){ .sidebar{width:72px}.main-container{margin-left:72px}.logo-text,.nav-text,.user-info{display:none!important}.collapse-btn{display:none!important}.nav-item{justify-content:center;padding:14px} }
@media(max-width:768px){ .sidebar{transform:translateX(-100%)}.main-container{margin-left:0} }
</style>
