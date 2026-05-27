<template>
  <div class="records-page" ref="pageRef">
    <div class="page-header" ref="headerRef">
      <div><h1 class="page-title" ref="titleRef">评课记录</h1><p class="page-desc">查看和管理所有教师的听课评价记录</p></div>
      <div class="header-stats" ref="statsRef">
        <div class="stat-item"><span class="stat-value">{{ pagination.total }}</span><span class="stat-label">总记录</span></div>
        <div class="stat-item success"><span class="stat-value">{{ submittedCount }}</span><span class="stat-label">已提交</span></div>
        <div class="stat-item info"><span class="stat-value">{{ archivedCount }}</span><span class="stat-label">已归档</span></div>
      </div>
    </div>

    <div class="filter-card" ref="filterRef">
      <div class="filter-row">
        <div class="filter-item"><label class="filter-label">状态筛选</label><el-select v-model="filters.status" placeholder="全部状态" clearable size="large" style="width:160px"><el-option label="已提交" value="submitted"/><el-option label="已归档" value="archived"/></el-select></div>
        <div class="filter-actions"><el-button size="large" @click="resetFilters">重置</el-button><el-button type="primary" size="large" @click="loadRecords"><el-icon><Search /></el-icon>搜索</el-button></div>
      </div>
    </div>

    <div class="table-card" ref="tableRef">
      <el-table :data="records" v-loading="loading" stripe style="width:100%">
        <el-table-column type="index" label="#" width="60" align="center"/>
        <el-table-column label="计划标题" min-width="200"><template #default="{row}"><div class="title-cell"><span class="record-title">{{row.plan?.title||'未知计划'}}</span><span class="record-subject" v-if="row.plan?.subject">{{row.plan.subject}}</span></div></template></el-table-column>
        <el-table-column label="被听课教师" width="120" align="center"><template #default="{row}"><div class="teacher-cell"><el-avatar :size="32" class="teacher-avatar">{{(row.plan?.teacherName||'T').charAt(0)}}</el-avatar><span>{{row.plan?.teacherName||'-'}}</span></div></template></el-table-column>
        <el-table-column prop="overallScore" label="评分" width="140" align="center"><template #default="{row}"><div class="score-cell"><el-rate :model-value="parseFloat(row.overallScore)||0" disabled size="small" :colors="['#FCD34D','#FCD34D','#FCD34D']"/><span class="score-value">{{row.overallScore||'-'}}</span></div></template></el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center"><template #default="{row}"><span class="status-badge" :class="row.status"><span class="status-dot"></span>{{row.status==='submitted'?'已提交':'已归档'}}</span></template></el-table-column>
        <el-table-column prop="submittedAt" label="提交时间" width="160" align="center"><template #default="{row}"><span class="time-cell">{{formatDate(row.submittedAt)}}</span></template></el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right"><template #default="{row}"><div class="action-cell"><el-tooltip content="查看详情"><el-button size="small" circle @click="viewDetail(row)"><el-icon><View /></el-icon></el-button></el-tooltip><el-tooltip content="归档" v-if="row.status==='submitted'"><el-button type="warning" size="small" circle @click="archiveRecord(row)"><el-icon><FolderOpened /></el-icon></el-button></el-tooltip></div></template></el-table-column>
      </el-table>
      <div class="pagination-wrapper"><el-pagination v-model:current-page="pagination.page" :page-size="pagination.pageSize" :total="pagination.total" @current-change="loadRecords" layout="total,prev,pager,next" :background="true"/></div>
    </div>

    <el-dialog v-model="showDetail" title="评价详情" width="640px">
      <div v-if="currentRecord" class="detail-content">
        <div class="detail-section"><h4 class="detail-title"><el-icon><InfoFilled /></el-icon>基本信息</h4>
          <div class="info-grid"><div class="info-item"><span class="info-label">计划</span><span class="info-value">{{currentRecord.plan?.title||'-'}}</span></div><div class="info-item"><span class="info-label">被听课教师</span><span class="info-value">{{currentRecord.plan?.teacherName||'-'}}</span></div><div class="info-item"><span class="info-label">总分</span><span class="info-value score-highlight">{{currentRecord.overallScore||'-'}}分</span></div><div class="info-item"><span class="info-label">状态</span><span class="status-badge" :class="currentRecord.status">{{currentRecord.status==='submitted'?'已提交':'已归档'}}</span></div></div>
        </div>
        <div class="detail-section"><h4 class="detail-title"><el-icon><Star /></el-icon>维度评分</h4>
          <div class="dimensions-list"><div v-for="(dim,i) in currentRecord.dimensions" :key="i" class="dimension-item"><div class="dimension-info"><span class="dimension-name">{{dim.dimensionName}}</span><el-rate :model-value="parseFloat(dim.score)||0" disabled size="small"/></div><p class="dimension-comment" v-if="dim.comment">{{dim.comment}}</p></div></div>
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
const filters=ref({status:'',scoreRange:''});
const pagination=ref({page:1,pageSize:10,total:0});
const submittedCount=computed(()=>records.value.filter(r=>r.status==='submitted').length);
const archivedCount=computed(()=>records.value.filter(r=>r.status==='archived').length);
const formatDate=d=>{if(!d)return'-';return new Date(d).toLocaleString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})};
let ctx=null;

const animateEntrance=()=>nextTick(()=>{const tl=gsap.timeline({defaults:{ease:'power2.out'}});tl.from(titleRef.value,{y:-20,opacity:0,duration:0.4});tl.from(statsRef.value,{scale:0.8,opacity:0,duration:0.4,ease:'back.out(1.5)'},'-=0.2');tl.from(filterRef.value,{y:20,opacity:0,duration:0.4},'-=0.1');tl.from(tableRef.value,{y:30,opacity:0,duration:0.5},'-=0.1');});
const animateTableRows=()=>nextTick(()=>{const rows=document.querySelectorAll('.records-page .el-table__body tr');gsap.from(rows,{x:-20,opacity:0,duration:0.4,stagger:0.04,ease:'power3.out'});});

const loadRecords=async()=>{loading.value=true;try{const params={page:pagination.value.page,pageSize:pagination.value.pageSize};if(filters.value.status)params.status=filters.value.status;const res=await api.records.list(params);if(res.code===200){records.value=res.data?.list||res.data||[];pagination.value.total=res.data.total||records.value.length;}}catch(e){console.error(e)}finally{loading.value=false;animateTableRows();}};
const resetFilters=()=>{filters.value.status='';pagination.value.page=1;loadRecords();};
const viewDetail=async row=>{try{const res=await api.evaluations.getById(row.id);if(res.code===200){currentRecord.value=res.data;showDetail.value=true;}}catch(e){console.error(e)}};
const archiveRecord=async row=>{try{await ElMessageBox.confirm('确定归档这条评价？','归档确认',{confirmButtonText:'确定',cancelButtonText:'取消',type:'info'});const res=await api.evaluations.archive(row.id);if(res.code===200){ElMessage.success('归档成功');loadRecords();}}catch(e){if(e!=='cancel')console.error(e);}};

onMounted(()=>{ctx=gsap.context(animateEntrance,pageRef.value);loadRecords();});
onUnmounted(()=>ctx?.revert());
</script>

<style scoped>
.records-page { max-width: 100%; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 700; color: #F1F5F9; margin: 0 0 4px 0; letter-spacing: 1px; }
.page-desc { font-size: 14px; color: #94A3B8; margin: 0; }
.header-stats { display: flex; gap: 16px; }
.stat-item { background: rgba(30,41,59,0.7); border: 1px solid rgba(99,102,241,0.1); border-radius: 12px; padding: 12px 20px; text-align: center; min-width: 90px; }
.stat-item.success { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.2); }
.stat-item.info { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.2); }
.stat-value { display: block; font-size: 24px; font-weight: 700; color: #E2E8F0; }
.stat-item.success .stat-value { color: #34D399; } .stat-item.info .stat-value { color: #818CF8; }
.stat-label { font-size: 12px; color: #94A3B8; }
.filter-card { background: rgba(30,41,59,0.7); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(99,102,241,0.1); }
.filter-row { display: flex; align-items: flex-end; gap: 20px; } .filter-item { display: flex; flex-direction: column; gap: 8px; } .filter-label { font-size: 13px; color: #94A3B8; } .filter-actions { display: flex; gap: 12px; margin-left: auto; }
.table-card { background: rgba(30,41,59,0.7); border-radius: 16px; border: 1px solid rgba(99,102,241,0.1); overflow: hidden; }
.title-cell { display: flex; flex-direction: column; gap: 4px; } .record-title { font-weight: 600; color: #E2E8F0; } .record-subject { font-size: 12px; color: #818CF8; background: rgba(99,102,241,0.1); padding: 2px 8px; border-radius: 4px; width: fit-content; }
.teacher-cell { display: flex; flex-direction: column; align-items: center; gap: 6px; color: #CBD5E1; } .teacher-avatar { background: linear-gradient(135deg,#3B4BFF,#818CF8)!important; color:#fff!important; font-size:12px; }
.score-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; } .score-value { font-size: 14px; font-weight: 600; color: #FBBF24; }
.status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; } .status-dot { width:6px;height:6px;border-radius:50%;background:currentColor; }
.status-badge.submitted { background: rgba(16,185,129,0.1); color: #34D399; } .status-badge.archived { background: rgba(129,140,248,0.1); color: #818CF8; }
.time-cell { font-size: 13px; color: #94A3B8; }
.action-cell { display: flex; gap: 8px; justify-content: center; }
.pagination-wrapper { padding: 20px 24px; border-top: 1px solid rgba(99,102,241,0.1); }
.detail-content { padding: 8px 0; } .detail-section { margin-bottom: 28px; } .detail-section:last-child { margin-bottom: 0; }
.detail-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; color: #E2E8F0; margin: 0 0 16px 0; padding-bottom: 12px; border-bottom: 1px solid rgba(99,102,241,0.1); }
.detail-title .el-icon { color: #818CF8; }
.info-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; } .info-item { display: flex; flex-direction: column; gap: 4px; } .info-label { font-size: 12px; color: #64748B; } .info-value { font-size: 14px; font-weight: 500; color: #CBD5E1; }
.score-highlight { color: #FBBF24; font-size: 18px; }
.dimensions-list { display: flex; flex-direction: column; gap: 16px; } .dimension-item { background: rgba(15,23,42,0.5); border-radius: 12px; padding: 16px; } .dimension-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; } .dimension-name { font-weight: 500; color: #E2E8F0; } .dimension-comment { font-size: 13px; color: #94A3B8; margin: 0; }
.overall-comment { background: rgba(15,23,42,0.5); border-radius: 12px; padding: 20px; font-size: 14px; color: #CBD5E1; line-height: 1.8; }
:deep(.el-table) { background: transparent; --el-table-bg-color:transparent; --el-table-tr-bg-color:transparent; --el-table-header-bg-color:rgba(15,23,42,0.5); --el-table-border-color:rgba(99,102,241,0.08); --el-table-header-text-color:#94A3B8; --el-table-text-color:#CBD5E1; --el-table-row-hover-bg-color:rgba(99,102,241,0.06); --el-table-striped-row-bg-color:rgba(99,102,241,0.03); }
:deep(.el-input__wrapper), :deep(.el-select__wrapper) { background: rgba(15,23,42,0.6)!important; border-color: rgba(99,102,241,0.15)!important; }
@media(max-width:768px){ .page-header { flex-direction:column; gap:20px; } .header-stats { width:100%; justify-content:space-between; } .filter-row { flex-direction:column; align-items:stretch; } .filter-actions { margin-left:0; justify-content:flex-end; } .info-grid { grid-template-columns:1fr; } }
</style>
