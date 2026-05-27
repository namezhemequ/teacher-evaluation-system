<template>
  <div class="records-page" ref="pageRef">
    <div class="page-header" ref="headerRef">
      <div><h1 class="page-title" ref="titleRef">评课记录</h1><p class="page-desc">查看和管理所有教师的听课评价记录</p></div>
      <div class="header-stats" ref="statsRef">
        <div class="stat-item"><span class="stat-value">{{pagination.total}}</span><span class="stat-label">总记录</span></div>
        <div class="stat-item success"><span class="stat-value">{{submittedCount}}</span><span class="stat-label">已提交</span></div>
        <div class="stat-item info"><span class="stat-value">{{archivedCount}}</span><span class="stat-label">已归档</span></div>
      </div>
    </div>

    <div class="filter-card" ref="filterRef">
      <div class="filter-row">
        <div class="filter-item"><label>状态</label><el-select v-model="filters.status" placeholder="全部" clearable size="large" style="width:160px"><el-option label="已提交" value="submitted"/><el-option label="已归档" value="archived"/></el-select></div>
        <div class="filter-actions"><el-button size="large" @click="resetFilters">重置</el-button><el-button type="primary" size="large" @click="loadRecords"><el-icon><Search /></el-icon>搜索</el-button></div>
      </div>
    </div>

    <div class="table-card" ref="tableRef">
      <el-table :data="records" v-loading="loading" stripe style="width:100%">
        <el-table-column type="index" label="#" width="60" align="center"/>
        <el-table-column label="计划标题" min-width="200"><template #default="{row}"><div class="title-cell"><span class="record-title">{{row.plan?.title||'未知计划'}}</span><span class="record-subject" v-if="row.plan?.subject">{{row.plan.subject}}</span></div></template></el-table-column>
        <el-table-column label="教师" width="120" align="center"><template #default="{row}"><div class="teacher-cell"><el-avatar :size="32" class="teacher-avatar">{{(row.plan?.teacherName||'T').charAt(0)}}</el-avatar><span>{{row.plan?.teacherName||'-'}}</span></div></template></el-table-column>
        <el-table-column label="评分" width="140" align="center"><template #default="{row}"><div class="score-cell"><el-rate :model-value="parseFloat(row.overallScore)||0" disabled size="small" :colors="['#00C8FF','#00C8FF','#00C8FF']"/><span class="score-value">{{row.overallScore||'-'}}</span></div></template></el-table-column>
        <el-table-column label="状态" width="100" align="center"><template #default="{row}"><span class="status-badge" :class="row.status"><span class="status-dot"></span>{{row.status==='submitted'?'已提交':'已归档'}}</span></template></el-table-column>
        <el-table-column label="提交时间" width="160" align="center"><template #default="{row}"><span class="time-cell">{{formatDate(row.submittedAt)}}</span></template></el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right"><template #default="{row}"><div class="action-cell">
          <el-tooltip content="详情"><el-button size="small" circle @click="viewDetail(row)"><el-icon><View /></el-icon></el-button></el-tooltip>
          <el-tooltip content="归档" v-if="row.status==='submitted'"><el-button type="warning" size="small" circle @click="archiveRecord(row)"><el-icon><FolderOpened /></el-icon></el-button></el-tooltip>
        </div></template></el-table-column>
      </el-table>
      <div class="pagination-wrapper"><el-pagination v-model:current-page="pagination.page" :page-size="pagination.pageSize" :total="pagination.total" @current-change="loadRecords" layout="total,prev,pager,next" :background="true"/></div>
    </div>

    <el-dialog v-model="showDetail" title="评价详情" width="640px" class="tech-dialog">
      <div v-if="currentRecord" class="detail-content">
        <div class="detail-section"><h4 class="detail-title"><el-icon><InfoFilled /></el-icon>基本信息</h4>
          <div class="info-grid"><div class="info-item"><span class="info-label">计划</span><span class="info-value">{{currentRecord.plan?.title||'-'}}</span></div><div class="info-item"><span class="info-label">教师</span><span class="info-value">{{currentRecord.plan?.teacherName||'-'}}</span></div><div class="info-item"><span class="info-label">总分</span><span class="info-value score-highlight">{{currentRecord.overallScore||'-'}}分</span></div><div class="info-item"><span class="info-label">状态</span><span class="status-badge" :class="currentRecord.status">{{currentRecord.status==='submitted'?'已提交':'已归档'}}</span></div></div>
        </div>
        <div class="detail-section"><h4 class="detail-title"><el-icon><Star /></el-icon>维度评分</h4>
          <div class="dimensions-list"><div v-for="(dim,i) in currentRecord.dimensions" :key="i" class="dimension-item"><div class="dimension-info"><span class="dimension-name">{{dim.dimensionName}}</span><el-rate :model-value="parseFloat(dim.score)||0" disabled size="small" :colors="['#00C8FF','#00C8FF','#00C8FF']"/></div><p class="dimension-comment" v-if="dim.comment">{{dim.comment}}</p></div></div>
        </div>
        <div class="detail-section"><h4 class="detail-title"><el-icon><ChatLineSquare /></el-icon>总体评语</h4><div class="overall-comment">{{currentRecord.overallComment||'暂无评语'}}</div></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '../api';
import { Search, View, FolderOpened, InfoFilled, Star, ChatLineSquare } from '@element-plus/icons-vue';
import gsap from 'gsap';

const loading=ref(false),showDetail=ref(false),records=ref([]),currentRecord=ref(null);
const pageRef=ref(null),headerRef=ref(null),titleRef=ref(null),statsRef=ref(null),filterRef=ref(null),tableRef=ref(null);
const filters=ref({status:''});
const pagination=ref({page:1,pageSize:10,total:0});
const submittedCount=computed(()=>records.value.filter(r=>r.status==='submitted').length);
const archivedCount=computed(()=>records.value.filter(r=>r.status==='archived').length);
const formatDate=d=>{if(!d)return'-';return new Date(d).toLocaleString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})};
let ctx=null;

const animateEntrance=()=>nextTick(()=>{const tl=gsap.timeline({defaults:{ease:'power2.out'}});tl.from(titleRef.value,{y:-20,opacity:0,duration:.4});tl.from(statsRef.value,{scale:.8,opacity:0,duration:.4,ease:'back.out(1.5)'},'-=.2');tl.from(filterRef.value,{y:20,opacity:0,duration:.4},'-.1');tl.from(tableRef.value,{y:30,opacity:0,duration:.5},'-.1')});
const animateRows=()=>nextTick(()=>{const rows=document.querySelectorAll('.records-page .el-table__body tr');gsap.from(rows,{x:-16,opacity:0,duration:.35,stagger:.04,ease:'power3.out'})});

const loadRecords=async()=>{loading.value=true;try{const p={page:pagination.value.page,pageSize:pagination.value.pageSize};if(filters.value.status)p.status=filters.value.status;const res=await api.records.list(p);if(res.code===200){records.value=res.data?.list||res.data||[];pagination.value.total=res.data.total||records.value.length}}catch(e){console.error(e)}finally{loading.value=false;animateRows()}};
const resetFilters=()=>{filters.value.status='';pagination.value.page=1;loadRecords()};
const viewDetail=async r=>{try{const res=await api.evaluations.getById(r.id);if(res.code===200){currentRecord.value=res.data;showDetail.value=true}}catch(e){console.error(e)}};
const archiveRecord=async r=>{try{await ElMessageBox.confirm('确定归档这条评价？','归档确认',{confirmButtonText:'确定',cancelButtonText:'取消',type:'info'});const res=await api.evaluations.archive(r.id);if(res.code===200){ElMessage.success('归档成功');loadRecords()}}catch(e){if(e!=='cancel')console.error(e)}};

onMounted(()=>{ctx=gsap.context(animateEntrance,pageRef.value);loadRecords()});
onUnmounted(()=>ctx?.revert());
</script>

<style scoped>
.records-page{position:relative;z-index:1}
.page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
.page-title{font-size:24px;font-weight:700;color:#E8F4FD;margin:0 0 4px 0;letter-spacing:1px}
.page-desc{font-size:14px;color:#6A8EAE;margin:0}
.header-stats{display:flex;gap:16px}
.stat-item{background:rgba(10,22,40,.7);border:1px solid rgba(0,200,255,.08);border-radius:12px;padding:12px 20px;text-align:center;min-width:90px}
.stat-item.success{background:rgba(0,200,255,.06);border-color:rgba(0,200,255,.15)}
.stat-item.info{background:rgba(64,158,255,.06);border-color:rgba(64,158,255,.15)}
.stat-value{display:block;font-size:24px;font-weight:700;color:#D0E8FF}.stat-item.success .stat-value{color:#00C8FF}.stat-item.info .stat-value{color:#409EFF}
.stat-label{font-size:12px;color:#5A7E9E}

.filter-card{background:rgba(10,22,40,.65);backdrop-filter:blur(10px);border:1px solid rgba(0,200,255,.08);border-radius:16px;padding:24px;margin-bottom:24px}
.filter-row{display:flex;align-items:flex-end;gap:20px}.filter-item{display:flex;flex-direction:column;gap:8px}.filter-item label{font-size:13px;color:#6A8EAE}.filter-actions{display:flex;gap:12px;margin-left:auto}

.table-card{background:rgba(10,22,40,.65);backdrop-filter:blur(10px);border:1px solid rgba(0,200,255,.08);border-radius:16px;overflow:hidden}
.title-cell{display:flex;flex-direction:column;gap:4px}.record-title{font-weight:600;color:#D0E8FF}.record-subject{font-size:12px;color:#409EFF;background:rgba(0,200,255,.08);padding:2px 8px;border-radius:4px;width:fit-content}
.teacher-cell{display:flex;flex-direction:column;align-items:center;gap:6px;color:#B0C8DE}.teacher-avatar{background:linear-gradient(135deg,#409EFF,#00C8FF)!important;color:#fff!important;font-size:12px}
.score-cell{display:flex;flex-direction:column;align-items:center;gap:4px}.score-value{font-size:14px;font-weight:600;color:#00C8FF}
.status-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:500}.status-dot{width:6px;height:6px;border-radius:50%;background:currentColor}
.status-badge.submitted{background:rgba(0,200,255,.1);color:#00C8FF}.status-badge.archived{background:rgba(129,140,248,.1);color:#818CF8}
.time-cell{font-size:13px;color:#6A8EAE}
.action-cell{display:flex;gap:8px;justify-content:center}
.pagination-wrapper{padding:20px 24px;border-top:1px solid rgba(0,200,255,.06)}

.detail-content{padding:8px 0}.detail-section{margin-bottom:28px}.detail-section:last-child{margin-bottom:0}
.detail-title{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:#D0E8FF;margin:0 0 16px 0;padding-bottom:12px;border-bottom:1px solid rgba(0,200,255,.08)}.detail-title .el-icon{color:#00C8FF}
.info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.info-item{display:flex;flex-direction:column;gap:4px}.info-label{font-size:12px;color:#5A7E9E}.info-value{font-size:14px;font-weight:500;color:#B0C8DE}
.score-highlight{color:#00C8FF;font-size:18px}
.dimensions-list{display:flex;flex-direction:column;gap:16px}.dimension-item{background:rgba(10,22,40,.5);border-radius:12px;padding:16px}.dimension-info{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.dimension-name{font-weight:500;color:#C0D8E8}.dimension-comment{font-size:13px;color:#6A8EAE;margin:0}
.overall-comment{background:rgba(10,22,40,.5);border-radius:12px;padding:20px;font-size:14px;color:#B0C8DE;line-height:1.8}

:deep(.el-table){background:transparent;--el-table-bg-color:transparent;--el-table-tr-bg-color:transparent;--el-table-header-bg-color:rgba(10,22,40,.5);--el-table-border-color:rgba(0,200,255,.05);--el-table-header-text-color:#6A8EAE;--el-table-text-color:#C0D8E8;--el-table-row-hover-bg-color:rgba(0,200,255,.04);--el-table-striped-row-bg-color:rgba(0,200,255,.02)}
:deep(.el-input__wrapper),:deep(.el-select__wrapper){background:rgba(10,22,40,.55)!important;border-color:rgba(0,200,255,.12)!important;border-radius:10px!important}
:deep(.el-dialog){background:rgba(10,22,40,.95)!important;border:1px solid rgba(0,200,255,.12)!important;border-radius:20px!important}

@media(max-width:768px){.page-header{flex-direction:column;gap:20px}.header-stats{width:100%;justify-content:space-between}.filter-row{flex-direction:column;align-items:stretch}.filter-actions{margin-left:0;justify-content:flex-end}.info-grid{grid-template-columns:1fr}}
</style>
