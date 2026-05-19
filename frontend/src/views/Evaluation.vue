<template>
  <div class="evaluation-page">
    <div class="page-header">
      <el-button text @click="$router.back()" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <div class="header-info">
        <h1 class="page-title">评价表填写</h1>
        <p class="page-desc">请认真完成每个维度的评价</p>
      </div>
    </div>

    <div class="evaluation-content">
      <!-- 计划信息卡片 -->
      <div class="plan-info-card">
        <div class="plan-icon">
          <el-icon :size="32"><Document /></el-icon>
        </div>
        <div class="plan-details">
          <h3 class="plan-title">{{ planInfo.title || '听课计划评价' }}</h3>
          <div class="plan-meta">
            <span v-if="planInfo.subject">
              <el-icon><Collection /></el-icon>
              {{ planInfo.subject }}
            </span>
            <span v-if="planInfo.grade">
              <el-icon><OfficeBuilding /></el-icon>
              {{ planInfo.grade }}
            </span>
            <span v-if="planInfo.teacherName">
              <el-icon><User /></el-icon>
              {{ planInfo.teacherName }}
            </span>
            <span v-if="planInfo.classroom">
              <el-icon><Location /></el-icon>
              {{ planInfo.classroom }}
            </span>
          </div>
        </div>
      </div>

      <!-- 评价表单 -->
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        class="evaluation-form"
      >
        <!-- 评价维度 -->
        <div class="dimensions-section">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><Star /></el-icon>
              评价维度
            </h2>
            <span class="section-tip">请为每个维度打分（1-5星）</span>
          </div>

          <div class="dimensions-grid">
            <div 
              v-for="(dim, index) in form.dimensions" 
              :key="index"
              class="dimension-card"
            >
              <div class="dimension-header">
                <span class="dimension-number">{{ index + 1 }}</span>
                <span class="dimension-name">{{ dim.name }}</span>
              </div>
              <div class="dimension-content">
                <el-rate 
                  v-model="dim.score"
                  :max="5"
                  show-text
                  :texts="['很差', '较差', '一般', '良好', '优秀']"
                  size="large"
                  :colors="['#FCD34D', '#FCD34D', '#FCD34D', '#FCD34D', '#FCD34D']"
                  @change="() => {}"
                />
                <el-input
                  v-model="dim.comment"
                  type="textarea"
                  :rows="2"
                  :placeholder="`对「${dim.name}」的具体评价...`"
                  class="dimension-comment"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 总体评语 -->
        <div class="overall-section">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><ChatLineSquare /></el-icon>
              总体评语
            </h2>
            <span class="section-tip">请给出整体评价和建议</span>
          </div>
          
          <el-form-item prop="overallComment" class="overall-form-item">
            <el-input
              v-model="form.overallComment"
              type="textarea"
              :rows="5"
              placeholder="请详细描述这节课的优点和不足，给出改进建议..."
              class="overall-textarea"
            />
          </el-form-item>
        </div>

        <!-- 提交按钮 -->
        <div class="submit-section">
          <el-button size="large" @click="$router.back()">
            取消
          </el-button>
          <el-button 
            type="primary" 
            size="large"
            :loading="submitting"
            class="submit-btn"
            @click="submitEvaluation"
          >
            <el-icon v-if="!submitting"><Check /></el-icon>
            {{ submitting ? '提交中...' : '提交评价' }}
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import api from '../api';
import { 
  ArrowLeft, Document, Collection, OfficeBuilding, 
  User, Location, Star, ChatLineSquare, Check 
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const planId = route.params.planId;
const submitting = ref(false);
const formRef = ref();
const planInfo = ref({});

const form = reactive({
  dimensions: [
    { name: '教学目标', score: 0, comment: '' },
    { name: '教学内容', score: 0, comment: '' },
    { name: '教学方法', score: 0, comment: '' },
    { name: '教学效果', score: 0, comment: '' },
    { name: '教师素养', score: 0, comment: '' },
  ],
  overallComment: '',
});

const rules = {
  overallComment: [{ required: true, message: '请输入总体评语', trigger: 'blur' }],
};

const loadPlanInfo = async () => {
  if (!planId) return;
  try {
    const res = await api.plans.getById(planId);
    if (res.code === 200) {
      planInfo.value = res.data;
    }
  } catch (e) {
    console.error(e);
  }
};

const submitEvaluation = async () => {
  // 验证所有维度都已评分
  const unratedDimensions = form.dimensions.filter(d => d.score === 0);
  if (unratedDimensions.length > 0) {
    ElMessage.warning(`请为「${unratedDimensions[0].name}」评分`);
    return;
  }

  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    const res = await api.evaluations.submit(planId, form);
    if (res.code === 200) {
      ElMessage.success('评价提交成功！');
      router.push('/my-evaluations');
    }
  } catch (e) {
    ElMessage.error('提交失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  if (!planId) {
    ElMessage.error('计划ID无效');
    router.push('/my-evaluations');
  }
  loadPlanInfo();
});
</script>

<style scoped>
.evaluation-page {
  max-width: 900px;
  margin: 0 auto;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 32px;
}

.back-btn {
  margin-top: 4px;
  color: #64748B;
  font-size: 14px;
}

.back-btn:hover {
  color: #3B4BFF;
}

.header-info {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1E293B;
  margin: 0 0 4px 0;
}

.page-desc {
  font-size: 14px;
  color: #64748B;
  margin: 0;
}

/* 计划信息卡片 */
.plan-info-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  background: linear-gradient(135deg, #3B4BFF 0%, #5B6BFF 100%);
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 32px;
  color: #fff;
  box-shadow: 0 8px 32px rgba(59, 75, 255, 0.25);
}

.plan-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.plan-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.plan-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.plan-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  opacity: 0.9;
}

/* 评价表单 */
.evaluation-form {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #E2E8F0;
  padding: 32px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
}

.section-title .el-icon {
  color: #3B4BFF;
}

.section-tip {
  font-size: 13px;
  color: #94A3B8;
}

/* 评价维度 */
.dimensions-section {
  margin-bottom: 40px;
}

.dimensions-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dimension-card {
  background: #F8FAFC;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #E2E8F0;
  transition: all 0.2s ease;
}

.dimension-card:hover {
  border-color: #3B4BFF;
  box-shadow: 0 4px 16px rgba(59, 75, 255, 0.08);
}

.dimension-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.dimension-number {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #3B4BFF 0%, #667eea 100%);
  color: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.dimension-name {
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
}

.dimension-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dimension-comment {
  margin-top: 8px;
}

:deep(.el-rate) {
  height: auto;
}

:deep(.el-rate__icon) {
  font-size: 28px !important;
  margin-right: 8px !important;
  transition: transform 0.2s ease;
}

:deep(.el-rate__icon:hover) {
  transform: scale(1.2);
}

:deep(.el-rate__text) {
  font-size: 14px;
  color: #64748B;
  margin-left: 12px;
}

/* 总体评语 */
.overall-section {
  margin-bottom: 32px;
}

.overall-textarea :deep(.el-textarea__inner) {
  border-radius: 12px;
  padding: 16px;
  font-size: 15px;
  line-height: 1.7;
  resize: none;
}

:deep(.el-form-item__error) {
  font-size: 12px;
  padding-top: 4px;
}

/* 提交按钮 */
.submit-section {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #F1F5F9;
}

.submit-btn {
  min-width: 160px;
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px !important;
}

/* 响应式 */
@media (max-width: 768px) {
  .evaluation-page {
    padding: 0 16px;
  }
  
  .plan-info-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .plan-meta {
    justify-content: center;
  }
  
  .evaluation-form {
    padding: 20px;
  }
  
  .submit-section {
    flex-direction: column;
  }
  
  .submit-btn {
    width: 100%;
  }
}
</style>
