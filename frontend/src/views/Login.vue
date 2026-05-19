<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="login-title">教师听课评课管理系统</h1>
          <p class="login-subtitle">Teacher Observation & Evaluation System</p>
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
            />
          </el-form-item>
          
          <el-form-item class="form-item">
            <el-button 
              type="primary" 
              size="large"
              :loading="loading"
              class="login-btn"
              @click="handleLogin"
            >
              <span v-if="!loading">登 录</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="login-tips">
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { ElMessage } from 'element-plus';
import { User, Lock, InfoFilled } from '@element-plus/icons-vue';

const router = useRouter();
const userStore = useUserStore();
const formRef = ref();
const loading = ref(false);

const form = ref({ 
  username: '', 
  password: '' 
});

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  
  loading.value = true;
  try {
    const success = await userStore.login(form.value.username, form.value.password);
    if (success) {
      ElMessage.success('登录成功，欢迎回来！');
      router.push('/dashboard');
    } else {
      ElMessage.error('用户名或密码错误');
    }
  } catch (e) {
    ElMessage.error('登录失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 20s ease-in-out infinite;
}

.shape-1 {
  width: 600px;
  height: 600px;
  background: #fff;
  top: -200px;
  right: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: #fff;
  bottom: -100px;
  left: -100px;
  animation-delay: -5s;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: #fff;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -20px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(10px, 10px) scale(1.02); }
}

.login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 440px;
  padding: 20px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #3B4BFF 0%, #667eea 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(59, 75, 255, 0.3);
}

.logo-icon svg {
  width: 36px;
  height: 36px;
  color: #fff;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 13px;
  color: #94A3B8;
  letter-spacing: 1px;
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
  color: #475569;
}

.form-label .el-icon {
  color: #3B4BFF;
}

.login-btn {
  width: 100%;
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 14px !important;
  background: linear-gradient(135deg, #3B4BFF 0%, #5B6BFF 100%) !important;
  border: none;
  box-shadow: 0 4px 16px rgba(59, 75, 255, 0.4);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 75, 255, 0.5);
}

.login-btn:active {
  transform: translateY(0);
}

.login-tips {
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #E2E8F0;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #64748B;
  margin-bottom: 16px;
}

.tips-header .el-icon {
  color: #3B4BFF;
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
  background: #fff;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
}

.tip-role {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  width: fit-content;
}

.tip-role.admin {
  background: rgba(59, 75, 255, 0.1);
  color: #3B4BFF;
}

.tip-role.teacher {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.tip-creds {
  font-size: 12px;
  color: #64748B;
  font-family: 'SF Mono', Monaco, monospace;
}

.login-footer {
  text-align: center;
  margin-top: 32px;
}

.login-footer p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}
</style>
