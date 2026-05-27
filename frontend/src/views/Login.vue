<template>
  <div class="login-page" ref="pageRef">
    <!-- 动态粒子背景 -->
    <canvas ref="canvasRef" class="particle-canvas"></canvas>
    
    <div class="login-container">
      <div class="login-card" ref="cardRef">
        <div class="login-header" ref="headerRef">
          <div class="logo-icon" ref="logoRef">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="login-title" ref="titleRef">
            <span v-for="(char, i) in titleChars" :key="i" class="title-char" :ref="el => titleCharRefs[i] = el">{{ char }}</span>
          </h1>
          <p class="login-subtitle" ref="subtitleRef">Teacher Observation & Evaluation System</p>
        </div>
        
        <el-form 
          ref="formRef" 
          :model="form" 
          :rules="rules" 
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username" class="form-item">
            <label class="form-label">
              <el-icon><User /></el-icon>
              <span>用户名</span>
            </label>
            <el-input 
              v-model="form.username" 
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
              ref="usernameInputRef"
              @focus="onInputFocus($event, 'username')"
              @blur="onInputBlur($event, 'username')"
            />
          </el-form-item>
          
          <el-form-item prop="password" class="form-item">
            <label class="form-label">
              <el-icon><Lock /></el-icon>
              <span>密码</span>
            </label>
            <el-input 
              v-model="form.password" 
              type="password" 
              placeholder="请输入密码"
              size="large"
              show-password
              :prefix-icon="Lock"
              @keyup.enter="handleLogin"
              @focus="onInputFocus($event, 'password')"
              @blur="onInputBlur($event, 'password')"
            />
          </el-form-item>
          
          <el-form-item class="form-item">
            <el-button 
              type="primary" 
              size="large"
              :loading="loading"
              class="login-btn"
              ref="btnRef"
              @click="handleLogin"
            >
              <span v-if="!loading">登 录</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="login-tips" ref="tipsRef">
          <div class="tips-header">
            <el-icon><InfoFilled /></el-icon>
            <span>测试账号</span>
          </div>
          <div class="tips-grid">
            <div class="tip-item">
              <span class="tip-role admin">管理员</span>
              <span class="tip-creds">admin / admin123</span>
            </div>
            <div class="tip-item">
              <span class="tip-role teacher">教师</span>
              <span class="tip-creds">teacher1 / teacher123</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="login-footer">
        <p>© 2026 教师听课评课管理系统 v1.0</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { ElMessage } from 'element-plus';
import { User, Lock, InfoFilled } from '@element-plus/icons-vue';
import gsap from 'gsap';

const router = useRouter();
const userStore = useUserStore();
const formRef = ref();
const loading = ref(false);

// Refs for GSAP targets
const pageRef = ref(null);
const canvasRef = ref(null);
const cardRef = ref(null);
const headerRef = ref(null);
const logoRef = ref(null);
const titleRef = ref(null);
const subtitleRef = ref(null);
const btnRef = ref(null);
const tipsRef = ref(null);
const usernameInputRef = ref(null);
const formItems = ref([]);
const titleCharRefs = ref([]);

const form = ref({ 
  username: '', 
  password: '' 
});

const titleChars = '教师听课评课管理系统'.split('');

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

let ctx = null;

// ---- GSAP 入场动画 ----
const animateEntrance = () => {
  nextTick(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    // Logo 缩放弹入
    tl.from(logoRef.value, {
      scale: 0,
      rotation: -180,
      duration: 0.8,
      ease: 'back.out(1.7)',
    });
    
    // 标题字符逐个弹入
    tl.from(titleCharRefs.value, {
      y: 30,
      opacity: 0,
      duration: 0.4,
      stagger: 0.04,
      ease: 'back.out(1.2)',
    }, '-=0.5');
    
    // 副标题淡入
    tl.from(subtitleRef.value, {
      y: 10,
      opacity: 0,
      duration: 0.5,
    }, '-=0.2');
    
    // 表单元素依次弹入
    const inputContainers = document.querySelectorAll('.login-form .form-item');
    tl.from(inputContainers, {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
    }, '-=0.1');
    
    // 登录按钮弹性弹入
    tl.from(btnRef.value?.$el || btnRef.value, {
      y: 30,
      opacity: 0,
      scale: 0.8,
      duration: 0.6,
      ease: 'back.out(1.7)',
    }, '-=0.2');
    
    // 提示区域淡入
    tl.from(tipsRef.value, {
      y: 20,
      opacity: 0,
      duration: 0.5,
    }, '-=0.1');
  });
};

// ---- 输入框焦点发光 ----
const onInputFocus = (e, name) => {
  const wrapper = e.target?.closest('.el-input__wrapper');
  if (wrapper) {
    gsap.to(wrapper, {
      boxShadow: '0 0 0 2px rgba(59, 75, 255, 0.4), 0 0 20px rgba(59, 75, 255, 0.15)',
      borderColor: '#3B4BFF',
      duration: 0.3,
      ease: 'power2.out',
    });
  }
};

const onInputBlur = (e, name) => {
  const wrapper = e.target?.closest('.el-input__wrapper');
  if (wrapper) {
    gsap.to(wrapper, {
      boxShadow: '0 0 0 0 rgba(59, 75, 255, 0)',
      borderColor: '#D1D5DB',
      duration: 0.3,
      ease: 'power2.out',
    });
  }
};

// ---- 按钮脉冲波纹 ----
const animateBtnPulse = () => {
  if (!btnRef.value?.$el && !btnRef.value) return;
  const btn = btnRef.value.$el || btnRef.value;
  
  const ripple = document.createElement('span');
  ripple.className = 'btn-ripple';
  btn.appendChild(ripple);
  
  gsap.fromTo(ripple, {
    scale: 0,
    opacity: 0.6,
  }, {
    scale: 4,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    onComplete: () => ripple.remove(),
  });
};

// ---- 粒子背景 ----
const initParticles = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx2d = canvas.getContext('2d');
  
  let width, height;
  const particles = [];
  const particleCount = 60;
  
  const resize = () => {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
  };
  resize();
  window.addEventListener('resize', resize);
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.1,
    });
  }
  
  const animate = () => {
    ctx2d.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < 0 || p.x > width) p.speedX *= -1;
      if (p.y < 0 || p.y > height) p.speedY *= -1;
      
      ctx2d.beginPath();
      ctx2d.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx2d.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      ctx2d.fill();
    });
    requestAnimationFrame(animate);
  };
  animate();
};

// ---- 鼠标视差效果 ----
const handleMouseMove = (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  
  if (cardRef.value) {
    gsap.to(cardRef.value, {
      x: -x * 0.3,
      y: -y * 0.3,
      duration: 0.8,
      ease: 'power2.out',
    });
  }
  
  if (logoRef.value) {
    gsap.to(logoRef.value, {
      x: x * 0.6,
      y: y * 0.6,
      rotation: x * 0.1,
      duration: 0.6,
      ease: 'power2.out',
    });
  }
};

// ---- 登录逻辑 ----
const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  
  loading.value = true;
  try {
    const success = await userStore.login(form.value.username, form.value.password);
    if (success) {
      // 成功动画：卡片缩放消失
      if (cardRef.value) {
        await gsap.to(cardRef.value, {
          scale: 0.9,
          opacity: 0,
          duration: 0.4,
          ease: 'power3.in',
        });
      }
      ElMessage.success('登录成功，欢迎回来！');
      router.push('/dashboard');
    } else {
      // 失败抖动动画
      if (cardRef.value) {
        gsap.to(cardRef.value, {
          x: [0, -10, 10, -10, 10, 0],
          duration: 0.5,
          ease: 'power2.out',
        });
      }
      ElMessage.error('用户名或密码错误');
    }
  } catch (e) {
    if (cardRef.value) {
      gsap.to(cardRef.value, {
        x: [0, -10, 10, -10, 10, 0],
        duration: 0.5,
        ease: 'power2.out',
      });
    }
    ElMessage.error('登录失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  ctx = gsap.context(() => {
    initParticles();
    animateEntrance();
  }, pageRef.value);
  
  window.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  ctx?.revert();
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #312E81 100%);
  position: relative;
  overflow: hidden;
}

.particle-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 460px;
  padding: 20px;
}

.login-card {
  background: rgba(30, 41, 59, 0.75);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 
    0 25px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%);
  pointer-events: none;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #3B4BFF 0%, #818CF8 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(59, 75, 255, 0.35);
  position: relative;
}

.logo-icon::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.5), rgba(129, 140, 248, 0.2));
  z-index: -1;
}

.logo-icon svg {
  width: 36px;
  height: 36px;
  color: #fff;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #F1F5F9;
  margin-bottom: 8px;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.title-char {
  display: inline-block;
}

.login-subtitle {
  font-size: 12px;
  color: #94A3B8;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.login-form {
  margin-bottom: 32px;
}

.form-item {
  margin-bottom: 24px;
}

.form-item:last-child {
  margin-bottom: 0;
  margin-top: 32px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #CBD5E1;
}

.form-label .el-icon {
  color: #818CF8;
}

.login-btn {
  width: 100%;
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 14px !important;
  background: linear-gradient(135deg, #3B4BFF 0%, #6366F1 100%) !important;
  border: none !important;
  box-shadow: 0 4px 24px rgba(59, 75, 255, 0.45);
  position: relative;
  overflow: hidden;
  letter-spacing: 4px;
}

/* 按钮脉冲波纹 */
.btn-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.login-tips {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #94A3B8;
  margin-bottom: 16px;
}

.tips-header .el-icon {
  color: #818CF8;
}

.tips-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.tip-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(99, 102, 241, 0.08);
}

.tip-role {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  width: fit-content;
}

.tip-role.admin {
  background: rgba(59, 75, 255, 0.2);
  color: #818CF8;
}

.tip-role.teacher {
  background: rgba(16, 185, 129, 0.2);
  color: #34D399;
}

.tip-creds {
  font-size: 12px;
  color: #94A3B8;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
}

.login-footer {
  text-align: center;
  margin-top: 32px;
}

.login-footer p {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.6);
}

/* 深色主题下的输入框覆盖 */
:deep(.el-input__wrapper) {
  background: rgba(15, 23, 42, 0.6) !important;
  border: 1px solid rgba(99, 102, 241, 0.15) !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  transition: all 0.3s ease !important;
}

:deep(.el-input__inner) {
  color: #F1F5F9 !important;
}

:deep(.el-input__inner::placeholder) {
  color: #64748B !important;
}

:deep(.el-input__prefix) {
  color: #818CF8 !important;
}

:deep(.el-form-item__error) {
  color: #F87171;
}
</style>
