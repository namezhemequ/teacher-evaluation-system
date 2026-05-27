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
          <h3 class="plan-title">{{ planInfo.title||'听课计划评价' }}</h3>
          <div class="plan-meta">
            <span v-if="planInfo.subject"><el-icon><Collection /></el-icon>{{planInfo.subject}}</span>
            <span v-if="planInfo.grade"><el-icon><OfficeBuilding /></el-icon>{{planInfo.grade}}</span>
            <span v-if="planInfo.teacherName"><el-icon><User /></el-icon>{{planInfo.teacherName}}</span>
            <span v-if="planInfo.classroom"><el-icon><Location /></el-icon>{{planInfo.classroom}}</span>
          </div>
        </div>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" class="evaluation-form">
        <div class="dimensions-section">
          <div class="section-header"><h2 class="section-title"><el-icon><Star /></el-icon>评价维度</h2><span class="section-tip">为每个维度打分（1-5星）</span></div>
          <div class="dimensions-grid" ref="dimsRef">
            <div v-for="(dim,index) in form.dimensions" :key="index" class="dimension-card" :ref="el=>dimRefs[index]=el">
              <div class="dimension-header"><span class="dimension-number">{{index+1}}</span><span class="dimension-name">{{dim.name}}</span></div>
              <div class="dimension-content">
                <el-rate v-model="dim.score" :max="5" show-text :texts="['很差','较差','一般','良好','优秀']" size="large" :colors="['#00C8FF','#00C8FF','#00C8FF','#00C8FF','#00C8FF']" @change="onRateChange" />
                <el-input v-model="dim.comment" type="textarea" :rows="2" :placeholder="`对「${dim.name}」的具体评价...`" />
              </div>
            </div>
          </div>
        </div>

        <div class="overall-section" ref="overallRef">
          <div class="section-header"><h2 class="section-title"><el-icon><ChatLineSquare /></el-icon>总体评语</h2></div>
          <el-form-item prop="overallComment"><el-input v-model="form.overallComment" type="textarea" :rows="5" placeholder="请详细描述这节课的优点和不足..."/></el-form-item>
        </div>

        <div class="submit-section" ref="submitRef">
          <el-button size="large" @click="$router.back()">取消</el-button>
          <el-button type="primary" size="large" :loading="submitting" class="submit-btn" ref="submitBtnRef" @click="submitEvaluation"><el-icon v-if="!submitting"><Check /></el-icon>{{submitting?'提交中...':'提交评价'}}</el-button>
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

const route=useRoute(),router=useRouter();
const planId=route.params.planId,submitting=ref(false),formRef=ref(),planInfo=ref({});
const pageRef=ref(null),headerRef=ref(null),titleRef=ref(null),planCardRef=ref(null),contentRef=ref(null),dimsRef=ref(null),overallRef=ref(null),submitRef=ref(null),submitBtnRef=ref(null);
const dimRefs=ref([]);
const form=reactive({dimensions:[{name:'教学目标',score:0,comment:''},{name:'教学内容',score:0,comment:''},{name:'教学方法',score:0,comment:''},{name:'教学效果',score:0,comment:''},{name:'教师素养',score:0,comment:''}],overallComment:''});
const rules={overallComment:[{required:true,message:'请输入总体评语',trigger:'blur'}]};
let ctx=null;

const animateEntrance=()=>nextTick(()=>{
  const tl=gsap.timeline({defaults:{ease:'power3.out'}});
  tl.from(titleRef.value,{y:-20,opacity:0,duration:.4});
  tl.from(planCardRef.value,{y:20,opacity:0,duration:.5},'-=.2');
  tl.from(dimsRef.value?.children,{x:-30,opacity:0,duration:.4,stagger:.1},'-=.1');
  tl.from(overallRef.value,{y:20,opacity:0,duration:.4},'-=.1');
  tl.from(submitBtnRef.value?.$el||submitBtnRef.value,{scale:.8,opacity:0,duration:.4,ease:'back.out(1.5)'},'-=.1');
});

const onRateChange=()=>{};

const loadPlanInfo=async()=>{if(!planId)return;try{const res=await api.plans.getById(planId);if(res.code===200)planInfo.value=res.data}catch(e){console.error(e)}};

const submitEvaluation=async()=>{
  const unrated=form.dimensions.filter(d=>d.score===0);
  if(unrated.length>0){ElMessage.warning(`请为「${unrated[0].name}」评分`);return}
  if(!(await formRef.value.validate().catch(()=>false)))return;
  submitting.value=true;
  try{
    const res=await api.evaluations.submit(planId,form);
    if(res.code===200){
      if(pageRef.value){
        const overlay=document.createElement('div');overlay.className='success-overlay';
        overlay.innerHTML='<div class="success-pop"><div class="success-glow"></div><span class="success-check">✓</span><p>评价提交成功！</p></div>';
        pageRef.value.appendChild(overlay);
        gsap.fromTo(overlay.querySelector('.success-glow'),{scale:0,opacity:0},{scale:2.5,opacity:.4,duration:.6,ease:'power2.out'});
        gsap.fromTo(overlay.querySelector('.success-check'),{scale:0,rotation:-180},{scale:1,rotation:0,duration:.6,ease:'back.out(2)',delay:.1});
        gsap.fromTo(overlay.querySelector('p'),{y:20,opacity:0},{y:0,opacity:1,duration:.4,delay:.3});
        await gsap.to(overlay,{opacity:0,duration:.3,delay:.5});
        overlay.remove();
      }
      ElMessage.success('评价提交成功！');router.push('/my-evaluations');
    }
  }catch(e){ElMessage.error('提交失败')}finally{submitting.value=false}
};

onMounted(()=>{if(!planId){ElMessage.error('计划ID无效');router.push('/my-evaluations');return}loadPlanInfo();ctx=gsap.context(animateEntrance,pageRef.value)});
onUnmounted(()=>ctx?.revert());
</script>

<style scoped>
.evaluation-page{max-width:900px;margin:0 auto;position:relative;z-index:1}
.page-header{display:flex;align-items:flex-start;gap:20px;margin-bottom:32px}
.back-btn{margin-top:4px;color:#5A8EAE;font-size:14px}
.page-title{font-size:24px;font-weight:700;color:#E8F4FD;margin:0 0 4px 0;letter-spacing:1px}
.page-desc{font-size:14px;color:#6A8EAE;margin:0}

.plan-info-card{display:flex;align-items:flex-start;gap:20px;background:linear-gradient(135deg,#0D2B4A,#1A4A6E);border-radius:20px;padding:28px;margin-bottom:32px;color:#E8F4FD;box-shadow:0 0 40px rgba(0,200,255,.15);border:1px solid rgba(0,200,255,.12)}
.plan-icon{width:64px;height:64px;background:rgba(0,200,255,.15);border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.plan-title{font-size:20px;font-weight:600;margin:0 0 12px 0}
.plan-meta{display:flex;flex-wrap:wrap;gap:20px}.plan-meta span{display:flex;align-items:center;gap:6px;font-size:14px;opacity:.85}

.evaluation-form{background:rgba(10,22,40,.7);backdrop-filter:blur(10px);border-radius:20px;border:1px solid rgba(0,200,255,.08);padding:32px}
.section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
.section-title{display:flex;align-items:center;gap:10px;font-size:18px;font-weight:600;color:#E8F4FD;margin:0}.section-title .el-icon{color:#00C8FF}
.section-tip{font-size:13px;color:#5A7E9E}
.dimensions-section{margin-bottom:40px}
.dimensions-grid{display:flex;flex-direction:column;gap:20px}
.dimension-card{background:rgba(10,22,40,.5);border-radius:16px;padding:24px;border:1px solid rgba(0,200,255,.06)}
.dimension-header{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.dimension-number{width:28px;height:28px;background:linear-gradient(135deg,#409EFF,#00C8FF);color:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;box-shadow:0 0 10px rgba(0,200,255,.3)}
.dimension-name{font-size:16px;font-weight:600;color:#C0D8E8}
.dimension-content{display:flex;flex-direction:column;gap:16px}
.overall-section{margin-bottom:32px}
.submit-section{display:flex;justify-content:center;gap:16px;padding-top:24px;border-top:1px solid rgba(0,200,255,.06)}
.submit-btn{min-width:160px;height:52px;font-size:16px;font-weight:600;border-radius:12px!important;background:linear-gradient(135deg,#409EFF,#00C8FF)!important;border:none!important;box-shadow:0 0 30px rgba(0,200,255,.35);position:relative;overflow:hidden}
.submit-btn::after{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(255,255,255,.2) 0%,transparent 60%);opacity:0;transition:opacity .3s}
.submit-btn:hover::after{opacity:1}

:deep(.el-input__wrapper),:deep(.el-textarea__inner){background:rgba(10,22,40,.55)!important;border-color:rgba(0,200,255,.12)!important;border-radius:12px!important;color:#C0D8E8!important}
:deep(.el-rate__icon){font-size:28px!important;margin-right:8px!important;filter:drop-shadow(0 0 6px rgba(0,200,255,.3))}
:deep(.el-rate__text){color:#6A8EAE!important;margin-left:12px}

.success-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(10,22,40,.85);pointer-events:none}
.success-pop{text-align:center;position:relative}
.success-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:100px;height:100px;border-radius:50%;background:radial-gradient(circle,rgba(0,200,255,.6) 0%,transparent 70%)}
.success-check{font-size:48px;color:#00C8FF;text-shadow:0 0 30px rgba(0,200,255,.5);position:relative;z-index:1}
.success-pop p{color:#E8F4FD;font-size:18px;margin-top:12px;font-weight:600}

@media(max-width:768px){.plan-info-card{flex-direction:column;align-items:center;text-align:center}.plan-meta{justify-content:center}.evaluation-form{padding:20px}.submit-section{flex-direction:column}.submit-btn{width:100%}}
</style>
