<template>
  <div class="login-page" ref="pageRef">
    <!-- 背景层 -->
    <div class="bg-layer" ref="bgLayerRef">
      <!-- 渐变光晕 -->
      <div class="bg-glow glow-1" ref="glow1Ref"></div>
      <div class="bg-glow glow-2" ref="glow2Ref"></div>
      <div class="bg-glow glow-3" ref="glow3Ref"></div>

      <!-- 几何网格 -->
      <div class="geometric-grid" ref="gridRef">
        <div class="grid-line" v-for="i in 8" :key="'h'+i" :style="{ top: (i * 12.5) + '%' }"></div>
        <div class="grid-line vertical" v-for="i in 8" :key="'v'+i" :style="{ left: (i * 12.5) + '%' }"></div>
      </div>

      <!-- 装饰学术图标 -->
      <div class="corner-deco deco-tl" ref="decoTLRef">
        <svg viewBox="0 0 60 60" fill="none"><path d="M30 8L8 19v22L30 52l22-11V19L30 8z" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><circle cx="20" cy="25" r="3" fill="currentColor" opacity="0.3"/><circle cx="40" cy="25" r="3" fill="currentColor" opacity="0.3"/><circle cx="30" cy="35" r="4" fill="currentColor" opacity="0.3"/><path d="M20 25h20" stroke="currentColor" stroke-width="1" opacity="0.2"/></svg>
      </div>
      <div class="corner-deco deco-tr" ref="decoTRRef">
        <svg viewBox="0 0 48 64" fill="none"><rect x="8" y="16" width="32" height="40" rx="2" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><line x1="16" y1="24" x2="32" y2="24" stroke="currentColor" stroke-width="1" opacity="0.2"/><line x1="16" y1="32" x2="28" y2="32" stroke="currentColor" stroke-width="1" opacity="0.2"/><line x1="16" y1="40" x2="30" y2="40" stroke="currentColor" stroke-width="1" opacity="0.2"/><path d="M8 56l16-16H8V56z" fill="currentColor" opacity="0.15"/></svg>
      </div>
      <div class="corner-deco deco-bl" ref="decoBLRef">
        <svg viewBox="0 0 56 56" fill="none"><circle cx="28" cy="28" r="20" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><circle cx="28" cy="28" r="8" stroke="currentColor" stroke-width="1" opacity="0.3"/><circle cx="28" cy="28" r="2" fill="currentColor" opacity="0.4"/><line x1="28" y1="8" x2="28" y2="20" stroke="currentColor" stroke-width="1" opacity="0.2"/><line x1="28" y1="36" x2="28" y2="48" stroke="currentColor" stroke-width="1" opacity="0.2"/><line x1="8" y1="28" x2="20" y2="28" stroke="currentColor" stroke-width="1" opacity="0.2"/><line x1="36" y1="28" x2="48" y2="28" stroke="currentColor" stroke-width="1" opacity="0.2"/></svg>
      </div>
      <div class="corner-deco deco-br" ref="decoBRRef">
        <svg viewBox="0 0 56 48" fill="none"><path d="M8 40V8h40v32c0 4-4 8-8 8H16c-4 0-8-4-8-8z" stroke="currentColor" stroke-width="1.5" opacity="0.4"/><path d="M20 16L32 28M32 16L20 28" stroke="currentColor" stroke-width="1" opacity="0.25"/><circle cx="28" cy="22" r="1.5" fill="currentColor" opacity="0.3"/></svg>
      </div>
    </div>

    <!-- 粒子画布 -->
    <canvas ref="canvasRef" class="particle-canvas"></canvas>

    <!-- 登录卡片（不变） -->
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
        
        <el-form ref="formRef" :model="form" :rules="rules" class="login-form" @submit.prevent="handleLogin">
          <el-form-item prop="username" class="form-item">
            <label class="form-label"><el-icon><User /></el-icon><span>用户名</span></label>
            <el-input v-model="form.username" placeholder="请输入用户名" size="large" :prefix-icon="User" @focus="onInputFocus" @blur="onInputBlur" />
          </el-form-item>
          <el-form-item prop="password" class="form-item">
            <label class="form-label"><el-icon><Lock /></el-icon><span>密码</span></label>
            <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large" show-password :prefix-icon="Lock" @keyup.enter="handleLogin" @focus="onInputFocus" @blur="onInputBlur" />
          </el-form-item>
          <el-form-item class="form-item">
            <el-button type="primary" size="large" :loading="loading" class="login-btn" ref="btnRef" @click="handleLogin">
              <span v-if="!loading">登 录</span><span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="login-tips" ref="tipsRef">
          <div class="tips-header"><el-icon><InfoFilled /></el-icon><span>测试账号</span></div>
          <div class="tips-grid">
            <div class="tip-item"><span class="tip-role admin">管理员</span><span class="tip-creds">admin / admin123</span></div>
            <div class="tip-item"><span class="tip-role teacher">教师</span><span class="tip-creds">teacher1 / teacher123</span></div>
          </div>
        </div>
      </div>
      <div class="login-footer"><p>© 2026 教师听课评课管理系统 v1.0</p></div>
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
const formRef = ref(), loading = ref(false);
const pageRef = ref(null), bgLayerRef = ref(null), canvasRef = ref(null);
const cardRef = ref(null), logoRef = ref(null), titleRef = ref(null), subtitleRef = ref(null), btnRef = ref(null), tipsRef = ref(null);
const gridRef = ref(null), glow1Ref = ref(null), glow2Ref = ref(null), glow3Ref = ref(null);
const decoTLRef = ref(null), decoTRRef = ref(null), decoBLRef = ref(null), decoBRRef = ref(null);
const titleCharRefs = ref([]);
const titleChars = '教师听课评课管理系统'.split('');
const form = ref({ username: '', password: '' });
const rules = { username: [{ required: true, message: '请输入用户名', trigger: 'blur' }], password: [{ required: true, message: '请输入密码', trigger: 'blur' }] };

let ctx = null, mouseX = 0, mouseY = 0, particleRAF = null, glowTween = null;

// ====== 粒子系统（Canvas + 鼠标斥力） ======
const initParticles = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx2d = canvas.getContext('2d');
  let w, h;
  const particles = [];
  const COUNT = 45;

  const resize = () => { w = canvas.offsetWidth; h = canvas.offsetHeight; canvas.width = w * devicePixelRatio; canvas.height = h * devicePixelRatio; ctx2d.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); };
  resize();
  window.addEventListener('resize', resize);

  const colors = ['rgba(129,140,248,', 'rgba(59,75,255,', 'rgba(199,210,254,', 'rgba(99,102,241,', 'rgba(165,180,252,'];
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 3 + 0.8,
      baseVx: (Math.random() - 0.5) * 0.25, baseVy: -(Math.random() * 0.5 + 0.15),
      vx: 0, vy: 0,
      opacity: Math.random() * 0.5 + 0.15,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  const animate = () => {
    ctx2d.clearRect(0, 0, w, h);
    particles.forEach(p => {
      const dx = mouseX - p.x, dy = mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const forceDist = 150;
      let fx = 0, fy = 0;
      if (dist < forceDist && dist > 0) {
        const force = (1 - dist / forceDist) * 1.5;
        fx = -(dx / dist) * force; fy = -(dy / dist) * force;
      }
      p.vx = p.baseVx + fx; p.vy = p.baseVy + fy;
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;

      ctx2d.beginPath();
      ctx2d.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx2d.fillStyle = p.color + p.opacity + ')';
      ctx2d.fill();
    });
    particleRAF = requestAnimationFrame(animate);
  };
  animate();
};

// ====== 光晕呼吸动画 ======
const animateGlowBreathing = () => {
  glowTween = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 0.3 });
  glowTween.to(glow1Ref.value, { opacity: 0.6, scale: 1.15, duration: 4, ease: 'sine.inOut' }, 0);
  glowTween.to(glow2Ref.value, { opacity: 0.5, scale: 1.1, x: 30, y: -20, duration: 5, ease: 'sine.inOut' }, 0.8);
  glowTween.to(glow3Ref.value, { opacity: 0.4, scale: 1.2, x: -20, y: 30, duration: 6, ease: 'sine.inOut' }, 1.5);
};

// ====== 网格呼吸 ======
const animateGridBreathing = () => {
  gsap.to('.grid-line', {
    opacity: 0.15,
    duration: 3,
    ease: 'sine.inOut',
    stagger: { each: 0.3, repeat: -1, yoyo: true },
  });
};

// ====== 入场动画 ======
const animateEntrance = () => {
  nextTick(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(logoRef.value, { scale: 0, rotation: -180, duration: 0.8, ease: 'back.out(1.7)' });
    tl.from(titleCharRefs.value, { y: 30, opacity: 0, duration: 0.4, stagger: 0.04, ease: 'back.out(1.2)' }, '-=0.5');
    tl.from(subtitleRef.value, { y: 10, opacity: 0, duration: 0.5 }, '-=0.2');
    const inputs = document.querySelectorAll('.login-form .form-item');
    tl.from(inputs, { y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, '-=0.1');
    tl.from(btnRef.value?.$el || btnRef.value, { y: 30, opacity: 0, scale: 0.8, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.2');
    tl.from(tipsRef.value, { y: 20, opacity: 0, duration: 0.5 }, '-=0.1');
  });
};

// ====== 焦点发光 ======
const onInputFocus = (e) => {
  const wrapper = e.target?.closest('.el-input__wrapper');
  if (wrapper) gsap.to(wrapper, { boxShadow: '0 0 0 2px rgba(64,158,255,0.5), 0 0 24px rgba(64,158,255,0.2)', borderColor: '#409EFF', duration: 0.3, ease: 'power2.out' });
};
const onInputBlur = (e) => {
  const wrapper = e.target?.closest('.el-input__wrapper');
  if (wrapper) gsap.to(wrapper, { boxShadow: '0 0 0 0 rgba(64,158,255,0)', borderColor: 'rgba(99,102,241,0.15)', duration: 0.3, ease: 'power2.out' });
};

// ====== 鼠标视差 ======
const handleMouseMove = (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  const x = (e.clientX / window.innerWidth - 0.5) * 20;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;

  // 卡片视差
  gsap.to(cardRef.value, { x: -x * 0.3, y: -y * 0.3, duration: 0.8, ease: 'power2.out' });
  // Logo 视差
  gsap.to(logoRef.value, { x: x * 0.7, y: y * 0.7, rotation: x * 0.1, duration: 0.6, ease: 'power2.out' });
  // 背景层整体视差
  gsap.to(bgLayerRef.value, { x: x * 0.15, y: y * 0.15, duration: 1.2, ease: 'power1.out' });
  // 四角装饰视差
  gsap.to(decoTLRef.value, { x: x * 0.5, y: y * 0.5, duration: 0.8, ease: 'power2.out' });
  gsap.to(decoTRRef.value, { x: -x * 0.5, y: y * 0.5, duration: 0.8, ease: 'power2.out' });
  gsap.to(decoBLRef.value, { x: x * 0.5, y: -y * 0.5, duration: 0.8, ease: 'power2.out' });
  gsap.to(decoBRRef.value, { x: -x * 0.5, y: -y * 0.5, duration: 0.8, ease: 'power2.out' });
};

// ====== 登录逻辑 ======
const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  loading.value = true;
  try {
    const success = await userStore.login(form.value.username, form.value.password);
    if (success) {
      gsap.to(cardRef.value, { scale: 0.9, opacity: 0, duration: 0.4, ease: 'power3.in' });
      ElMessage.success('登录成功，欢迎回来！');
      router.push('/dashboard');
    } else {
      gsap.to(cardRef.value, { x: [0,-10,10,-10,10,0], duration: 0.5, ease: 'power2.out' });
      ElMessage.error('用户名或密码错误');
    }
  } catch (e) {
    gsap.to(cardRef.value, { x: [0,-10,10,-10,10,0], duration: 0.5, ease: 'power2.out' });
    ElMessage.error('登录失败，请稍后重试');
  } finally { loading.value = false; }
};

onMounted(() => {
  ctx = gsap.context(() => {
    initParticles();
    animateGlowBreathing();
    animateGridBreathing();
    animateEntrance();
  }, pageRef.value);
  window.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  ctx?.revert();
  if (particleRAF) cancelAnimationFrame(particleRAF);
  glowTween?.kill();
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<style scoped>
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0C1322 0%, #15223B 30%, #1E3050 60%, #203D6E 100%); position: relative; overflow: hidden; }

/* ====== 背景层 ====== */
.bg-layer { position: fixed; inset: 0; z-index: 0; pointer-events: none; }

/* 渐变光晕 */
.bg-glow { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; }
.glow-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(64,158,255,0.25) 0%, transparent 70%); top: -15%; left: -10%; }
.glow-2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(59,75,255,0.2) 0%, transparent 70%); bottom: -10%; right: -8%; }
.glow-3 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%); top: 40%; left: 55%; }

/* 几何网格 */
.geometric-grid { position: absolute; inset: 0; transform: perspective(800px) rotateX(60deg) scale(2.2); }
.grid-line { position: absolute; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent 5%, rgba(100,140,200,0.12) 20%, rgba(64,158,255,0.08) 50%, rgba(100,140,200,0.12) 80%, transparent 95%); }
.grid-line.vertical { top: 0; bottom: 0; width: 1px; height: auto; background: linear-gradient(180deg, transparent 5%, rgba(100,140,200,0.12) 20%, rgba(64,158,255,0.08) 50%, rgba(100,140,200,0.12) 80%, transparent 95%); }

/* 装饰图标 */
.corner-deco { position: absolute; color: rgba(100,140,200,0.5); filter: drop-shadow(0 0 12px rgba(64,158,255,0.3)); }
.corner-deco svg { width: 100%; height: 100%; }
.deco-tl { top: 40px; left: 60px; width: 70px; height: 70px; }
.deco-tr { top: 50px; right: 80px; width: 56px; height: 74px; }
.deco-bl { bottom: 60px; left: 80px; width: 64px; height: 64px; }
.deco-br { bottom: 50px; right: 60px; width: 64px; height: 56px; }

/* 粒子画布 */
.particle-canvas { position: fixed; inset: 0; z-index: 1; pointer-events: none; }

/* ====== 登录卡片（不变） ====== */
.login-container { position: relative; z-index: 10; width: 100%; max-width: 460px; padding: 20px; }
.login-card { background: rgba(30,41,59,0.75); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); border: 1px solid rgba(99,102,241,0.15); border-radius: 24px; padding: 48px 40px; box-shadow: 0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05); position: relative; overflow: hidden; }
.login-card::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle at 30% 20%, rgba(99,102,241,0.08) 0%, transparent 50%); pointer-events: none; }
.login-header { text-align: center; margin-bottom: 40px; }
.logo-icon { width: 64px; height: 64px; margin: 0 auto 20px; background: linear-gradient(135deg, #3B4BFF 0%, #818CF8 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 32px rgba(59,75,255,0.35); position: relative; }
.logo-icon::after { content: ''; position: absolute; inset: -2px; border-radius: 18px; background: linear-gradient(135deg, rgba(99,102,241,0.5), rgba(129,140,248,0.2)); z-index: -1; }
.logo-icon svg { width: 36px; height: 36px; color: #fff; }
.login-title { font-size: 24px; font-weight: 700; color: #F1F5F9; margin-bottom: 8px; letter-spacing: 2px; text-shadow: 0 2px 8px rgba(0,0,0,0.3); }
.title-char { display: inline-block; }
.login-subtitle { font-size: 12px; color: #94A3B8; letter-spacing: 2px; }
.login-form { margin-bottom: 32px; }
.form-item { margin-bottom: 24px; }
.form-item:last-child { margin-bottom: 0; margin-top: 32px; }
.form-label { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 14px; font-weight: 500; color: #CBD5E1; }
.form-label .el-icon { color: #818CF8; }
.login-btn { width: 100%; height: 52px; font-size: 16px; font-weight: 600; border-radius: 14px!important; background: linear-gradient(135deg, #3B4BFF 0%, #6366F1 100%)!important; border: none!important; box-shadow: 0 4px 24px rgba(59,75,255,0.45); letter-spacing: 4px; }
.login-tips { background: rgba(15,23,42,0.5); border-radius: 16px; padding: 20px; border: 1px solid rgba(99,102,241,0.1); }
.tips-header { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: #94A3B8; margin-bottom: 16px; }
.tips-header .el-icon { color: #818CF8; }
.tips-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.tip-item { display: flex; flex-direction: column; gap: 4px; padding: 12px; background: rgba(30,41,59,0.6); border-radius: 10px; border: 1px solid rgba(99,102,241,0.08); }
.tip-role { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; width: fit-content; }
.tip-role.admin { background: rgba(59,75,255,0.2); color: #818CF8; }
.tip-role.teacher { background: rgba(16,185,129,0.2); color: #34D399; }
.tip-creds { font-size: 12px; color: #94A3B8; font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; }
.login-footer { text-align: center; margin-top: 32px; }
.login-footer p { font-size: 12px; color: rgba(148,163,184,0.6); }

::deep(.el-input__wrapper) { background: rgba(15,23,42,0.6)!important; border: 1px solid rgba(99,102,241,0.15)!important; border-radius: 12px!important; box-shadow: none!important; }
::deep(.el-input__inner) { color: #F1F5F9!important; }
::deep(.el-input__inner::placeholder) { color: #64748B!important; }
::deep(.el-input__prefix) { color: #818CF8!important; }
::deep(.el-form-item__error) { color: #F87171; }
</style>
