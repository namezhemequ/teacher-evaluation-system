<template>
  <div class="evaluation-page" ref="pageRef">
    <div class="page-header" ref="headerRef">
      <el-button text @click="$router.back()" class="back-btn"><el-icon><ArrowLeft /></el-icon>返回</el-button>
      <div><h1 class="page-title" ref="titleRef">评价表填写</h1><p class="page-desc">请认真完成每个维度的评价</p></div>
    </div>

    <div class="evaluation-content" ref="contentRef">
      <div class="plan-info-card" ref="planCardRef">
        <div class="plan-icon"><el-icon :size="32"><Document /></el-icon></div>
        <div class="plan-details">
          <h3 class="plan-title">{{ planInfo.title || '听课计划评价' }}</h3>
          <div class="plan-meta">
            <span v-if="planInfo.subject"><el-icon><Collection /></el-icon>{{ planInfo.subject }}</span>
            <span v-if="planInfo.grade"><el-icon><OfficeBuilding /></el-icon>{{ planInfo.grade }}</span>
            <span v-if="planInfo.teacherName"><el-icon><User /></el-icon>{{ planInfo.teacherName }}</span>
            <span v-if="planInfo.classroom"><el-icon><Location /></el-icon>{{ planInfo.classroom }}</span>
          </div>
        </div>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" class="evaluation-form" ref="formElRef">
        <div class="dimensions-section">
          <div class="section-header"><h2 class="section-title"><el-icon><Star /></el-icon>评价维度</h2><span class="section-tip">为每个维度打分（1-5星）</span></div>
          <div class="dimensions-grid" ref="dimsRef">
            <div v-for="(dim, index) in form.dimensions" :key="index" class="dimension-card" :ref="el=>dimRefs[index]=el">
              <div class="dimension-header"><span class="dimension-number">{{ index+1 }}</span><span class="dimension-name">{{ dim.name }}</span></div>
              <div class="dimension-content">
                <el-rate v-model="dim.score" :max="5" show-text :texts="['很差','较差','一般','良好','优秀']" size="large" :colors="['#FCD34D','#FCD34D','#FCD34D','#FCD34D','#FCD34D']" @change="onRateChange" />
                <el-input v-model="dim.comment" type="textarea" :rows="2" :placeholder="`对「${dim.name}」的具体评价...`" />
              </div>
            </div>
          </div>
        </div>

        <div class="overall-section" ref="overallRef">
          <div class="section-header"><h2 class="section-title"><el-icon><ChatLineSquare /></el-icon>总体评语</h2><span class="section-tip">请给出整体评价和建议</span></div>
          <el-form-item prop="overallComment"><el-input v-model="form.overallComment" type="textarea" :rows="5" placeholder="请详细描述这节课的优点和不足..." /></el-form-item>
        </div>

        <div class="submit-section" ref="submitRef">
          <el-button size="large" @click="$router.back()">取消</el-button>
          <el-button type="primary" size="large" :loading="submitting" class="submit-btn" ref="submitBtnRef" @click="submitEvaluation"><el-icon v-if="!submitting"><Check /></el-icon>{{ submitting?'提交中...':'提交评价' }}</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import api from '../api';
import { ArrowLeft, Document, Collection, OfficeBuilding, User, Location, Star, ChatLineSquare, Check } from '@element-plus/icons-vue';
import gsap from 'gsap';

const route = useRoute(), router = useRouter();
const planId = route.params.planId, submitting = ref(false), formRef = ref(), planInfo = ref({});
const pageRef = ref(null), headerRef = ref(null), titleRef = ref(null), planCardRef = ref(null), contentRef = ref(null), dimsRef = ref(null), overallRef = ref(null), submitRef = ref(null), submitBtnRef = ref(null);
const dimRefs = ref([]);
const form = reactive({ dimensions: [{name:'教学目标',score:0,comment:''},{name:'教学内容',score:0,comment:''},{name:'教学方法',score:0,comment:''},{name:'教学效果',score:0,comment:''},{name:'教师素养',score:0,comment:''}], overallComment: '' });
const rules = { overallComment: [{ required: true, message: '请输入总体评语', trigger: 'blur' }] };
let ctx = null;

const animateEntrance = () => nextTick(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from(titleRef.value, { y: -20, opacity: 0, duration: 0.4 });
  tl.from(planCardRef.value, { y: 20, opacity: 0, duration: 0.5 }, '-=0.2');
  tl.from(dimsRef.value?.children, { x: -30, opacity: 0, duration: 0.4, stagger: 0.1 }, '-=0.1');
  tl.from(overallRef.value, { y: 20, opacity: 0, duration: 0.4 }, '-=0.1');
  tl.from(submitBtnRef.value?.$el || submitBtnRef.value, { scale: 0.8, opacity: 0, duration: 0.4, ease: 'back.out(1.5)' }, '-=0.1');
});

const onRateChange = () => {}; // placeholder for GSAP number animation

const loadPlanInfo = async () => { if (!planId) return; try { const res = await api.plans.getById(planId); if (res.code===200) planInfo.value = res.data; } catch(e) { console.error(e); } };

const submitEvaluation = async () => {
  const unrated = form.dimensions.filter(d => d.score===0);
  if (unrated.length>0) { ElMessage.warning(`请为「${unrated[0].name}」评分`); return; }
  if (!(await formRef.value.validate().catch(()=>false))) return;
  submitting.value = true;
  try {
    const res = await api.evaluations.submit(planId, form);
    if (res.code===200) {
      // 成功庆祝动画
      if (pageRef.value) {
        const successEl = document.createElement('div');
        successEl.className = 'success-overlay';
        successEl.innerHTML = '<div class="success-pop">✅<br/>评价提交成功！</div>';
        pageRef.value.appendChild(successEl);
        await gsap.fromTo(successEl.querySelector('.success-pop'), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' });
        await gsap.to(successEl, { opacity: 0, duration: 0.3, delay: 0.5 });
        successEl.remove();
        ElMessage.success('评价提交成功！');
        router.push('/my-evaluations');
      } else {
        ElMessage.success('评价提交成功！');
        router.push('/my-evaluations');
      }
    }
  } catch(e) { ElMessage.error('提交失败'); } finally { submitting.value = false; }
};

onMounted(() => {
  if (!planId) { ElMessage.error('计划ID无效'); router.push('/my-evaluations'); return; }
  loadPlanInfo();
  ctx = gsap.context(animateEntrance, pageRef.value);
});
onUnmounted(() => ctx?.revert());
</script>

<style scoped>
.evaluation-page { max-width: 900px; margin: 0 auto; }
.page-header { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 32px; }
.back-btn { margin-top: 4px; color: #94A3B8; font-size: 14px; }
.page-title { font-size: 24px; font-weight: 700; color: #F1F5F9; margin: 0 0 4px 0; letter-spacing: 1px; }
.page-desc { font-size: 14px; color: #94A3B8; margin: 0; }
.plan-info-card { display: flex; align-items: flex-start; gap: 20px; background: linear-gradient(135deg,#3B4BFF,#6366F1); border-radius: 20px; padding: 28px; margin-bottom: 32px; color:#fff; box-shadow: 0 8px 32px rgba(59,75,255,0.3); }
.plan-icon { width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.plan-title { font-size: 20px; font-weight: 600; margin: 0 0 12px 0; }
.plan-meta { display: flex; flex-wrap: wrap; gap: 20px; } .plan-meta span { display: flex; align-items: center; gap: 6px; font-size: 14px; opacity: 0.9; }
.evaluation-form { background: rgba(30,41,59,0.7); border-radius: 20px; border: 1px solid rgba(99,102,241,0.1); padding: 32px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.section-title { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 600; color: #F1F5F9; margin: 0; }
.section-title .el-icon { color: #818CF8; }
.section-tip { font-size: 13px; color: #64748B; }
.dimensions-section { margin-bottom: 40px; }
.dimensions-grid { display: flex; flex-direction: column; gap: 20px; }
.dimension-card { background: rgba(15,23,42,0.5); border-radius: 16px; padding: 24px; border: 1px solid rgba(99,102,241,0.08); }
.dimension-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.dimension-number { width: 28px; height: 28px; background: linear-gradient(135deg,#3B4BFF,#818CF8); color:#fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; }
.dimension-name { font-size: 16px; font-weight: 600; color: #E2E8F0; }
.dimension-content { display: flex; flex-direction: column; gap: 16px; }
.overall-section { margin-bottom: 32px; }
.submit-section { display: flex; justify-content: center; gap: 16px; padding-top: 24px; border-top: 1px solid rgba(99,102,241,0.1); }
.submit-btn { min-width: 160px; height: 52px; font-size: 16px; font-weight: 600; border-radius: 12px!important; background: linear-gradient(135deg,#3B4BFF,#6366F1)!important; border: none!important; box-shadow: 0 4px 20px rgba(59,75,255,0.4); }
:deep(.el-input__wrapper), :deep(.el-textarea__inner), :deep(.el-select__wrapper) { background: rgba(15,23,42,0.6)!important; border-color: rgba(99,102,241,0.15)!important; border-radius: 12px!important; color: #E2E8F0!important; }
:deep(.el-rate__icon) { font-size: 28px!important; margin-right: 8px!important; }
:deep(.el-rate__text) { color: #94A3B8!important; margin-left: 12px; }
.success-overlay { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; background: rgba(15,23,42,0.8); pointer-events: none; }
.success-pop { font-size: 32px; color: #34D399; text-align: center; font-weight: 700; }
@media(max-width:768px){ .plan-info-card { flex-direction:column; align-items:center; text-align:center; } .plan-meta { justify-content:center; } .evaluation-form { padding:20px; } .submit-section { flex-direction:column; } .submit-btn { width:100%; } }
</style>
