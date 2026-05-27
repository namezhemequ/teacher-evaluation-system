<template>
  <div class="login-page" ref="pageRef">
    <!-- 全屏 Canvas 背景层 -->
    <canvas ref="canvasRef" class="bg-canvas"></canvas>

    <!-- 卡片后脉冲光晕 -->
    <div class="pulse-glow" ref="pulseGlowRef"></div>

    <!-- 登录卡片 -->
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
            <el-button type="primary" size="large" :loading="loading" class="login-btn" ref="btnRef" @click="handleLogin" style="color:#FFFFFF!important">
              <span v-if="!loading" style="color:#FFFFFF!important;font-weight:700">登 录</span>
              <span v-else style="color:#FFFFFF!important;font-weight:700">登录中...</span>
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
      <div class="login-footer"><p>&copy; 2026 教师听课评课管理系统 v1.0</p></div>
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

// ── 基础 ──
const router = useRouter();
const userStore = useUserStore();
const formRef = ref();
const loading = ref(false);

// ── Refs ──
const pageRef = ref(null);
const canvasRef = ref(null);
const pulseGlowRef = ref(null);
const cardRef = ref(null);
const logoRef = ref(null);
const titleRef = ref(null);
const subtitleRef = ref(null);
const btnRef = ref(null);
const tipsRef = ref(null);
const titleCharRefs = ref([]);

// ── 表单 ──
const titleChars = '教师听课评课管理系统'.split('');
const form = ref({ username: '', password: '' });
const rules = { username: [{ required: true, message: '请输入用户名', trigger: 'blur' }], password: [{ required: true, message: '请输入密码', trigger: 'blur' }] };

// ── Canvas 全局状态 ──
let w, h, ctx, ctxG;
let mouseX = 0, mouseY = 0;
let isExploding = true;
let canvasRAF = null;
let ctxGInstance = null;
let glowTimeline = null;

// ==================== 光带系统 ====================
class Ribbon {
  constructor(i) {
    this.id = i;
    this.phase = Math.random() * Math.PI * 2;
    this.speed = 0.3 + Math.random() * 0.5;
    this.amplitude = 80 + Math.random() * 180;
    this.yOffset = (i + 0.5) * (h / 4.5);
    this.waveCount = 2 + Math.floor(Math.random() * 2);
    this.thickness = 1.5 + Math.random() * 2.5;
    this.alpha = 0.25 + Math.random() * 0.35;
    this.alphaExplosion = 0;
  }
  draw(time) {
    ctxG.save();
    ctxG.globalAlpha = isExploding ? this.alphaExplosion : this.alpha;
    const segs = 120;
    ctxG.beginPath();
    for (let j = 0; j <= segs; j++) {
      const t = j / segs;
      const px = t * w;
      let py = this.yOffset;
      for (let k = 1; k <= this.waveCount; k++) {
        py += Math.sin(t * Math.PI * 2 * k + this.phase + time * this.speed + k) * this.amplitude * 0.6 / k;
      }
      if (j === 0) ctxG.moveTo(px, py); else ctxG.lineTo(px, py);
    }
    const grad = ctxG.createLinearGradient(0, this.yOffset - 100, 0, this.yOffset + 100);
    grad.addColorStop(0, 'rgba(64,158,255,0)');
    grad.addColorStop(0.3, 'rgba(64,158,255,0.15)');
    grad.addColorStop(0.5, 'rgba(0,240,255,0.6)');
    grad.addColorStop(0.7, 'rgba(64,158,255,0.15)');
    grad.addColorStop(1, 'rgba(64,158,255,0)');
    ctxG.strokeStyle = grad;
    ctxG.lineWidth = this.thickness;
    ctxG.shadowColor = 'rgba(0,200,255,0.8)';
    ctxG.shadowBlur = 12;
    ctxG.stroke();
    ctxG.shadowBlur = 0;
    ctxG.restore();
  }
}

// ==================== 粒子系统 ====================
class Particle {
  constructor(explode = false) {
    this.reset(explode);
  }
  reset(explode) {
    if (explode) {
      const cx = w / 2, cy = h / 2;
      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 600;
      this.x = cx + Math.cos(angle) * dist;
      this.y = cy + Math.sin(angle) * dist;
      this.vx = Math.cos(angle) * dist * 0.015;
      this.vy = Math.sin(angle) * dist * 0.015;
    } else {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.4 - 0.4;
    }
    this.r = 1.5 + Math.random() * 4;
    this.alpha = 0.3 + Math.random() * 0.7;
    this.color = ['rgba(64,158,255,', 'rgba(0,240,255,', 'rgba(129,180,255,', 'rgba(200,230,255,'][Math.floor(Math.random() * 4)];
    this.trail = [];
    this.maxTrail = 4 + Math.floor(Math.random() * 6);
  }
  update() {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) this.trail.shift();
    this.x += this.vx; this.y += this.vy;
    if (this.x < -20) this.x = w + 20; if (this.x > w + 20) this.x = -20;
    if (this.y < -20) this.y = h + 20; if (this.y > h + 20) { this.y = -20; this.x = Math.random() * w; }
  }
  draw(ctxG) {
    // 拖尾
    if (this.trail.length > 1) {
      ctxG.beginPath();
      ctxG.moveTo(this.trail[0].x, this.trail[0].y);
      for (let i = 1; i < this.trail.length; i++) ctxG.lineTo(this.trail[i].x, this.trail[i].y);
      ctxG.strokeStyle = this.color + (this.alpha * 0.3) + ')';
      ctxG.lineWidth = this.r * 0.6;
      ctxG.lineCap = 'round';
      ctxG.stroke();
    }
    // 主体光晕
    const glow = ctxG.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3);
    glow.addColorStop(0, this.color + this.alpha + ')');
    glow.addColorStop(0.4, this.color + (this.alpha * 0.3) + ')');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctxG.beginPath();
    ctxG.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
    ctxG.fillStyle = glow;
    ctxG.fill();
    // 核心亮点
    ctxG.beginPath();
    ctxG.arc(this.x, this.y, this.r * 0.5, 0, Math.PI * 2);
    ctxG.fillStyle = 'rgba(255,255,255,' + (this.alpha * 0.9) + ')';
    ctxG.fill();
  }
}

// ==================== 涟漪 ====================
class Ripple {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.radius = 0;
    this.maxRadius = 80 + Math.random() * 120;
    this.alpha = 0.6;
  }
  update() {
    this.radius += 2.5;
    this.alpha -= 0.012;
    return this.alpha > 0 && this.radius < this.maxRadius;
  }
  draw(ctxG) {
    ctxG.beginPath();
    ctxG.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctxG.strokeStyle = 'rgba(0,200,255,' + this.alpha + ')';
    ctxG.lineWidth = 1.5;
    ctxG.shadowColor = 'rgba(0,200,255,' + this.alpha + ')';
    ctxG.shadowBlur = 8;
    ctxG.stroke();
    ctxG.shadowBlur = 0;
  }
}

// ==================== 技术网格 + 扫描线 ====================
const drawTechGrid = (time) => {
  const perspectiveY = h * 0.55;
  const step = 40;
  const rows = 18, cols = 22;
  ctxG.save();
  ctxG.globalAlpha = 0.06;
  ctxG.strokeStyle = '#409EFF';
  ctxG.lineWidth = 0.6;
  ctxG.beginPath();
  for (let r = 0; r <= rows; r++) {
    const py = perspectiveY + r * step;
    const scale = (py - perspectiveY) / (h + 200 - perspectiveY);
    const left = w / 2 - (w / 2) * scale;
    const right = w / 2 + (w / 2) * scale;
    ctxG.moveTo(left, py); ctxG.lineTo(right, py);
  }
  ctxG.stroke();

  // 扫描线
  const scanY = ((time * 0.8) % (h + 400)) - 200;
  const scanScale = (scanY - perspectiveY) / (h + 200 - perspectiveY);
  const scanLeft = w / 2 - (w / 2) * scanScale;
  const scanRight = w / 2 + (w / 2) * scanScale;
  if (scanY > perspectiveY - 100) {
    const glow = ctxG.createLinearGradient(scanLeft, scanY, scanRight, scanY);
    glow.addColorStop(0, 'rgba(0,200,255,0)');
    glow.addColorStop(0.3, 'rgba(0,200,255,0.15)');
    glow.addColorStop(0.5, 'rgba(0,240,255,0.3)');
    glow.addColorStop(0.7, 'rgba(0,200,255,0.15)');
    glow.addColorStop(1, 'rgba(0,200,255,0)');
    ctxG.globalAlpha = 0.4;
    ctxG.strokeStyle = glow;
    ctxG.lineWidth = 2;
    ctxG.shadowColor = 'rgba(0,200,255,0.6)';
    ctxG.shadowBlur = 10;
    ctxG.beginPath();
    ctxG.moveTo(scanLeft, scanY); ctxG.lineTo(scanRight, scanY);
    ctxG.stroke();
    ctxG.shadowBlur = 0;
  }
  ctxG.restore();
};

// ==================== 渲染主循环 ====================
let ribbons = [], particles = [], ripples = [];
let startTime = 0, lastRippleTime = 0;

const initCanvas = () => {
  const canvas = canvasRef.value;
  ctxG = canvas.getContext('2d');
  const resize = () => {
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    ctxG.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  // 光带
  ribbons = Array.from({ length: 4 }, (_, i) => new Ribbon(i));
  // 粒子
  particles = Array.from({ length: 80 }, () => new Particle(true));
  ripples = [];
  startTime = performance.now();

  const render = (now) => {
    const time = (now - startTime) / 1000;
    const explodedTime = Math.min(time / 2, 1);

    ctxG.clearRect(0, 0, w, h);

    // 渐变底色
    const bg = ctxG.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.8);
    bg.addColorStop(0, '#0d1b33');
    bg.addColorStop(0.5, '#0a1628');
    bg.addColorStop(1, '#060e1c');
    ctxG.fillStyle = bg;
    ctxG.fillRect(0, 0, w, h);

    // 技术网格 + 扫描线
    drawTechGrid(time);

    // 光带
    ctxG.save();
    if (isExploding) ctxG.globalAlpha = explodedTime;
    ribbons.forEach(r => { r.alphaExplosion = explodedTime; r.draw(time); });
    ctxG.restore();

    // 粒子
    particles.forEach(p => {
      if (isExploding && time < 3) {
        p.vx *= 0.98;
        p.vy *= 0.98;
      }
      p.update();
      p.draw(ctxG);
    });
    // 粒子爆炸后持续补充
    if (time > 2.5 && isExploding) {
      isExploding = false;
      particles.forEach(p => { p.vx = (Math.random() - 0.5) * 0.5; p.vy = -(Math.random() * 0.6); });
    }

    // 涟漪
    ripples = ripples.filter(r => r.update());
    ripples.forEach(r => r.draw(ctxG));

    // 鼠标位置指示器
    const mxDist = 120;
    const mxGlow = ctxG.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, mxDist);
    mxGlow.addColorStop(0, 'rgba(0,200,255,0.05)');
    mxGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctxG.fillStyle = mxGlow;
    ctxG.beginPath();
    ctxG.arc(mouseX, mouseY, mxDist, 0, Math.PI * 2);
    ctxG.fill();

    canvasRAF = requestAnimationFrame(render);
  };
  canvasRAF = requestAnimationFrame(render);
};

// ==================== 鼠标交互 ====================
const handleMouseMove = (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  // 涟漪频率控制
  const now = performance.now();
  if (now - lastRippleTime > 80) {
    ripples.push(new Ripple(mouseX, mouseY));
    lastRippleTime = now;
    if (ripples.length > 15) ripples.shift();
  }
  // 卡片视差
  const x = (e.clientX / window.innerWidth - 0.5) * 24;
  const y = (e.clientY / window.innerHeight - 0.5) * 24;
  if (cardRef.value) {
    gsap.to(cardRef.value, { x: -x * 0.25, y: -y * 0.25, rotationX: -y * 0.3, rotationY: x * 0.3, duration: 1, ease: 'power2.out' });
  }
  if (logoRef.value) {
    gsap.to(logoRef.value, { x: x * 0.5, y: y * 0.5, duration: 0.7, ease: 'power2.out' });
  }
  // 脉冲光晕跟随鼠标微弱偏移
  if (pulseGlowRef.value) {
    gsap.to(pulseGlowRef.value, { x: x * 0.15, y: y * 0.15, duration: 1.5, ease: 'power1.out' });
  }
};

// ==================== 入场动画 ====================
const animateEntrance = () => {
  nextTick(() => {
    // 脉冲光晕入场
    gsap.fromTo(pulseGlowRef.value, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' });

    // 脉冲呼吸
    glowTimeline = gsap.timeline({ repeat: -1, yoyo: true });
    glowTimeline.to(pulseGlowRef.value, { scale: 1.1, opacity: 0.8, duration: 3, ease: 'sine.inOut' });
    glowTimeline.to(pulseGlowRef.value, { scale: 1, opacity: 1, duration: 3, ease: 'sine.inOut' }, '+=0.5');

    // 卡片入场
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.3 });
    tl.from(logoRef.value, { scale: 0, rotation: -180, duration: 0.8, ease: 'back.out(1.7)' });
    tl.from(titleCharRefs.value, { y: 30, opacity: 0, duration: 0.35, stagger: 0.04, ease: 'back.out(1.2)' }, '-=0.4');
    tl.from(subtitleRef.value, { y: 10, opacity: 0, duration: 0.4 }, '-=0.2');
    const inputs = document.querySelectorAll('.login-form .form-item');
    tl.from(inputs, { y: 40, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.1');
    tl.from(btnRef.value?.$el || btnRef.value, { y: 30, opacity: 0, scale: 0.8, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.15');
    tl.from(tipsRef.value, { y: 20, opacity: 0, duration: 0.4 }, '-=0.1');
  });
};

// ==================== 输入框焦点 ====================
const onInputFocus = (e) => {
  const wrapper = e.target?.closest('.el-input__wrapper');
  if (wrapper) gsap.to(wrapper, { boxShadow: '0 0 0 2px rgba(0,200,255,0.5), 0 0 30px rgba(0,200,255,0.25)', borderColor: '#00C8FF', duration: 0.3, ease: 'power2.out' });
};
const onInputBlur = (e) => {
  const wrapper = e.target?.closest('.el-input__wrapper');
  if (wrapper) gsap.to(wrapper, { boxShadow: '0 0 0 0 rgba(0,200,255,0)', borderColor: 'rgba(99,102,241,0.15)', duration: 0.3, ease: 'power2.out' });
};

// ==================== 登录逻辑 ====================
const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  loading.value = true;
  try {
    const success = await userStore.login(form.value.username, form.value.password);
    if (success) {
      gsap.to(cardRef.value, { scale: 0.88, opacity: 0, rotationY: 10, duration: 0.5, ease: 'power3.in' });
      ElMessage.success('登录成功，欢迎回来！');
      router.push('/dashboard');
    } else {
      gsap.to(cardRef.value, { keyframes: [{ x: -8 }, { x: 8 }, { x: -6 }, { x: 6 }, { x: -3 }, { x: 3 }, { x: 0 }], duration: 0.45, ease: 'power2.out' });
      ElMessage.error('用户名或密码错误');
    }
  } catch (e) {
    gsap.to(cardRef.value, { keyframes: [{ x: -8 }, { x: 8 }, { x: -6 }, { x: 6 }, { x: -3 }, { x: 3 }, { x: 0 }], duration: 0.45, ease: 'power2.out' });
    ElMessage.error('登录失败，请稍后重试');
  } finally { loading.value = false; }
};

// ==================== 生命周期 ====================
let gsapCtx = null;

onMounted(() => {
  gsapCtx = gsap.context(() => {
    initCanvas();
    animateEntrance();
  }, pageRef.value);
  window.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  gsapCtx?.revert();
  if (canvasRAF) cancelAnimationFrame(canvasRAF);
  if (glowTimeline) glowTimeline.kill();
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<style scoped>
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }

/* Canvas 背景 */
.bg-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }

/* 脉冲光晕（卡片后方） */
.pulse-glow { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 350px; height: 350px; border-radius: 50%;
  background: radial-gradient(circle, rgba(64,158,255,0.1) 0%, rgba(64,158,255,0.03) 40%, transparent 100%);
  z-index: 1; pointer-events: none; }

/* 登录卡片 */
.login-container { position: relative; z-index: 2; width: 100%; max-width: 460px; padding: 20px; perspective: 1000px; }
.login-card { background: rgba(20,30,52,0.78); backdrop-filter: blur(28px) saturate(200%); -webkit-backdrop-filter: blur(28px) saturate(200%);
  border: 1px solid rgba(0,200,255,0.18); border-radius: 24px; padding: 48px 40px;
  box-shadow: 0 0 80px rgba(0,150,255,0.12), 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04);
  position: relative; overflow: hidden; transform-style: preserve-3d; }
.login-card::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(circle at 30% 20%, rgba(0,200,255,0.06) 0%, transparent 60%); pointer-events: none; }
.login-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,200,255,0.3), rgba(64,158,255,0.4), rgba(0,200,255,0.3), transparent); }

.login-header { text-align: center; margin-bottom: 40px; }
.logo-icon { width: 64px; height: 64px; margin: 0 auto 20px;
  background: linear-gradient(135deg, #409EFF 0%, #00C8FF 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 40px rgba(0,200,255,0.4), 0 8px 24px rgba(0,150,255,0.3); position: relative; }
.logo-icon::after { content: ''; position: absolute; inset: -2px; border-radius: 18px;
  background: linear-gradient(135deg, rgba(0,200,255,0.5), rgba(64,158,255,0.3)); z-index: -1; }
.logo-icon svg { width: 36px; height: 36px; color: #fff; }
.login-title { font-size: 24px; font-weight: 700; color: #EDF2F7; margin-bottom: 8px; letter-spacing: 2px; }
.title-char { display: inline-block; }
.login-subtitle { font-size: 12px; color: #88A4C8; letter-spacing: 2px; }
.login-form { margin-bottom: 32px; }
.form-item { margin-bottom: 24px; }
.form-item:last-child { margin-bottom: 0; margin-top: 32px; }
.form-label { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 14px; font-weight: 500; color: #B0C4DE; }
.form-label .el-icon { color: #5EA8E8; }
.login-btn { width: 100% !important; height: 52px !important; font-size: 17px !important; font-weight: 700 !important;
  border-radius: 14px !important;
  background: linear-gradient(135deg, #409EFF 0%, #00C8FF 100%) !important; border: none !important;
  box-shadow: 0 0 40px rgba(0,200,255,0.5), 0 4px 20px rgba(0,100,200,0.35) !important; letter-spacing: 6px;
  position: relative; z-index: 5;
  color: #FFFFFF !important;
  --el-button-text-color: #FFFFFF;
  --el-button-hover-text-color: #FFFFFF;
  --el-button-active-text-color: #FFFFFF; }
.login-btn :deep(*) { color: #FFFFFF !important; }
.login-btn :deep(.el-button__text) { color: #FFFFFF !important; font-weight: 700 !important; }
.login-tips { background: rgba(15,23,42,0.5); border-radius: 16px; padding: 20px; border: 1px solid rgba(0,200,255,0.1); }
.tips-header { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; color: #88A4C8; margin-bottom: 16px; }
.tips-header .el-icon { color: #5EA8E8; }
.tips-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.tip-item { display: flex; flex-direction: column; gap: 4px; padding: 12px; background: rgba(20,30,52,0.6); border-radius: 10px; border: 1px solid rgba(0,200,255,0.08); }
.tip-role { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; width: fit-content; }
.tip-role.admin { background: rgba(64,158,255,0.2); color: #5EA8E8; }
.tip-role.teacher { background: rgba(16,185,129,0.2); color: #34D399; }
.tip-creds { font-size: 12px; color: #88A4C8; font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; }
.login-footer { text-align: center; margin-top: 32px; }
.login-footer p { font-size: 12px; color: rgba(136,164,200,0.5); }

/* Element Plus 输入框覆盖 */
:deep(.el-input__wrapper) { background: rgba(10,20,40,0.65)!important; border: 1px solid rgba(0,200,255,0.12)!important; border-radius: 12px!important; box-shadow: none!important; }
:deep(.el-input__inner) { color: #E2E8F0!important; }
:deep(.el-input__inner::placeholder) { color: #5A6E88!important; }
:deep(.el-input__prefix) { color: #5EA8E8!important; }
:deep(.el-form-item__error) { color: #F87171; }
</style>
