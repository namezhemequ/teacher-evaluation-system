<template>
  <div class="plans-page" ref="pageRef">
    <div class="page-header" ref="headerRef">
      <div>
        <h1 class="page-title" ref="titleRef">听课计划管理</h1>
        <p class="page-desc">创建和管理教师听课计划</p>
      </div>
      <el-button type="primary" size="large" @click="openCreateDialog" ref="createBtnRef">
        <el-icon><Plus /></el-icon>
        创建计划
      </el-button>
    </div>

    <div class="filter-card" ref="filterRef">
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">计划状态</label>
          <el-select v-model="filters.status" placeholder="全部状态" clearable size="large" style="width: 180px">
            <el-option label="草稿" value="draft" /><el-option label="已发布" value="published" />
            <el-option label="已完成" value="completed" /><el-option label="已归档" value="archived" />
          </el-select>
        </div>
        <div class="filter-item">
          <label class="filter-label">科目</label>
          <el-select v-model="filters.subject" placeholder="全部科目" clearable size="large" style="width: 150px">
            <el-option v-for="s in ['语文','数学','英语','物理','化学','历史','生物']" :key="s" :label="s" :value="s" />
          </el-select>
        </div>
        <div class="filter-actions">
          <el-button size="large" @click="resetFilters">重置</el-button>
          <el-button type="primary" size="large" @click="loadPlans"><el-icon><Search /></el-icon>搜索</el-button>
        </div>
      </div>
    </div>

    <div class="table-card" ref="tableRef">
      <el-table :data="plans" v-loading="loading" stripe style="width: 100%">
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="title" label="计划标题" min-width="200">
          <template #default="{ row }">
            <div class="title-cell"><span class="plan-title">{{ row.title }}</span><span class="plan-subject" v-if="row.subject">{{ row.subject }}</span></div>
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="被听课教师" width="120">
          <template #default="{ row }"><div class="teacher-cell"><el-avatar :size="28" class="teacher-avatar">{{ (row.teacherName||'T').charAt(0) }}</el-avatar><span>{{ row.teacherName||'-' }}</span></div></template>
        </el-table-column>
        <el-table-column prop="grade" label="年级" width="80" align="center" />
        <el-table-column prop="classroom" label="教室" width="80" align="center" />
        <el-table-column prop="observeDate" label="听课日期" width="120" align="center"><template #default="{ row }"><span class="date-cell" v-if="row.observeDate">{{ row.observeDate }}</span><span v-else>-</span></template></el-table-column>
        <el-table-column prop="period" label="节次" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }"><span class="status-badge" :class="row.status"><span class="status-dot"></span>{{ statusText(row.status) }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-cell">
              <el-tooltip content="编辑"><el-button size="small" circle @click="editPlan(row)"><el-icon><Edit /></el-icon></el-button></el-tooltip>
              <el-tooltip content="发布" v-if="row.status==='draft'"><el-button type="success" size="small" circle @click="publishPlan(row)"><el-icon><Promotion /></el-icon></el-button></el-tooltip>
              <el-tooltip content="删除"><el-button type="danger" size="small" circle @click="deletePlan(row)"><el-icon><Delete /></el-icon></el-button></el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper"><el-pagination v-model:current-page="pagination.page" :page-size="pagination.pageSize" :total="pagination.total" @current-change="loadPlans" layout="total, prev, pager, next" :background="true" /></div>
    </div>

    <el-dialog v-model="showDialog" :title="isEditing?'编辑计划':'创建计划'" width="560px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="计划标题" prop="title"><el-input v-model="form.title" placeholder="请输入计划标题" size="large" /></el-form-item>
        <div class="form-row"><el-form-item label="科目" prop="subject" class="form-col"><el-input v-model="form.subject" placeholder="如：数学" /></el-form-item><el-form-item label="年级" prop="grade" class="form-col"><el-input v-model="form.grade" placeholder="如：高一" /></el-form-item></div>
        <div class="form-row"><el-form-item label="被听课教师" prop="teacherName" class="form-col"><el-input v-model="form.teacherName" placeholder="教师姓名" /></el-form-item><el-form-item label="教室" prop="classroom" class="form-col"><el-input v-model="form.classroom" placeholder="如：101" /></el-form-item></div>
        <div class="form-row"><el-form-item label="听课日期" prop="observeDate" class="form-col"><el-date-picker v-model="form.observeDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item><el-form-item label="节次" prop="period" class="form-col"><el-input v-model="form.period" placeholder="如：第3节" /></el-form-item></div>
      </el-form>
      <template #footer><el-button size="large" @click="showDialog=false">取消</el-button><el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">{{ isEditing?'保存':'创建' }}</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '../api';
import { Plus, Search, Edit, Delete, Promotion } from '@element-plus/icons-vue';
import gsap from 'gsap';

const loading = ref(false), submitting = ref(false), showDialog = ref(false), isEditing = ref(false), plans = ref([]), formRef = ref(), editingId = ref(null);
const pageRef = ref(null), headerRef = ref(null), titleRef = ref(null), createBtnRef = ref(null), filterRef = ref(null), tableRef = ref(null);
const filters = reactive({ status: '', subject: '' });
const pagination = ref({ page: 1, pageSize: 10, total: 0 });
const form = ref({ title: '', subject: '', grade: '', teacherName: '', classroom: '', observeDate: '', period: '' });
const rules = { title: [{ required: true, message: '请输入计划标题', trigger: 'blur' }] };
const statusText = s => ({ draft: '草稿', published: '已发布', completed: '已完成', archived: '已归档' }[s] || s);

let ctx = null;

const animateEntrance = () => {
  nextTick(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.from(titleRef.value, { y: -20, opacity: 0, duration: 0.4 });
    tl.from(createBtnRef.value?.$el || createBtnRef.value, { scale: 0.8, opacity: 0, duration: 0.4, ease: 'back.out(1.5)' }, '-=0.2');
    tl.from(filterRef.value, { y: 20, opacity: 0, duration: 0.4 }, '-=0.1');
    tl.from(tableRef.value, { y: 30, opacity: 0, duration: 0.5 }, '-=0.1');
  });
};

const animateTableRows = () => {
  nextTick(() => {
    const rows = document.querySelectorAll('.plans-page .el-table__body tr');
    gsap.from(rows, { x: -20, opacity: 0, duration: 0.4, stagger: 0.04, ease: 'power3.out' });
  });
};

const loadPlans = async () => {
  loading.value = true;
  try {
    const params = { page: pagination.value.page, pageSize: pagination.value.pageSize };
    if (filters.status) params.status = filters.status;
    if (filters.subject) params.subject = filters.subject;
    const res = await api.plans.list(params);
    if (res.code === 200) { plans.value = res.data?.list || res.data || []; pagination.value.total = res.data.total || plans.value.length; }
  } catch (e) { console.error(e); } finally { loading.value = false; animateTableRows(); }
};
const resetFilters = () => { filters.status = ''; filters.subject = ''; pagination.value.page = 1; loadPlans(); };
const openCreateDialog = () => { isEditing.value = false; editingId.value = null; form.value = { title: '', subject: '', grade: '', teacherName: '', classroom: '', observeDate: '', period: '' }; showDialog.value = true; };
const editPlan = row => { isEditing.value = true; editingId.value = row.id; form.value = { title: row.title, subject: row.subject||'', grade: row.grade||'', teacherName: row.teacherName||'', classroom: row.classroom||'', observeDate: row.observeDate||'', period: row.period||'' }; showDialog.value = true; };
const handleSubmit = async () => { if (!(await formRef.value.validate().catch(() => false))) return; submitting.value = true; try { const res = isEditing.value ? await api.plans.update(editingId.value, form.value) : await api.plans.create(form.value); if (res.code===200) { ElMessage.success(isEditing.value?'修改成功':'创建成功'); showDialog.value = false; loadPlans(); } } catch(e) { console.error(e); } finally { submitting.value = false; } };
const publishPlan = async row => { try { await ElMessageBox.confirm(`确定发布「${row.title}」？`,'发布确认',{ confirmButtonText:'确定发布', cancelButtonText:'取消', type:'info' }); const res = await api.plans.publish(row.id); if (res.code===200) { ElMessage.success('发布成功'); loadPlans(); } } catch(e) { if (e!=='cancel') console.error(e); } };
const deletePlan = async row => { try { await ElMessageBox.confirm(`确定删除「${row.title}」？`,'删除确认',{ confirmButtonText:'删除', cancelButtonText:'取消', type:'warning' }); const res = await api.plans.delete(row.id); if (res.code===200) { ElMessage.success('删除成功'); loadPlans(); } } catch(e) { if (e!=='cancel') console.error(e); } };

onMounted(() => { ctx = gsap.context(animateEntrance, pageRef.value); loadPlans(); });
onUnmounted(() => ctx?.revert());
</script>

<style scoped>
.plans-page { max-width: 100%; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 700; color: #F1F5F9; margin: 0 0 4px 0; letter-spacing: 1px; }
.page-desc { font-size: 14px; color: #94A3B8; margin: 0; }
.filter-card { background: rgba(30,41,59,0.7); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(99,102,241,0.1); }
.filter-row { display: flex; align-items: flex-end; gap: 20px; flex-wrap: wrap; }
.filter-item { display: flex; flex-direction: column; gap: 8px; }
.filter-label { font-size: 13px; font-weight: 500; color: #94A3B8; }
.filter-actions { display: flex; gap: 12px; margin-left: auto; }
.table-card { background: rgba(30,41,59,0.7); border-radius: 16px; border: 1px solid rgba(99,102,241,0.1); overflow: hidden; }
.title-cell { display: flex; flex-direction: column; gap: 4px; }
.plan-title { font-weight: 600; color: #E2E8F0; }
.plan-subject { font-size: 12px; color: #818CF8; background: rgba(99,102,241,0.1); padding: 2px 8px; border-radius: 4px; width: fit-content; }
.teacher-cell { display: flex; align-items: center; gap: 8px; color: #CBD5E1; }
.teacher-avatar { background: linear-gradient(135deg,#3B4BFF,#818CF8)!important; color:#fff!important; font-size:12px; }
.date-cell { color: #CBD5E1; font-weight: 500; }
.status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; }
.status-badge.draft { background: rgba(148,163,184,0.1); color: #94A3B8; } .status-badge.draft .status-dot { background: #94A3B8; }
.status-badge.published { background: rgba(16,185,129,0.1); color: #34D399; } .status-badge.published .status-dot { background: #34D399; }
.status-badge.completed { background: rgba(245,158,11,0.1); color: #FBBF24; } .status-badge.completed .status-dot { background: #FBBF24; }
.status-badge.archived { background: rgba(129,140,248,0.1); color: #818CF8; } .status-badge.archived .status-dot { background: #818CF8; }
.action-cell { display: flex; gap: 8px; justify-content: center; }
.pagination-wrapper { padding: 20px 24px; border-top: 1px solid rgba(99,102,241,0.1); }
.form-row { display: flex; gap: 16px; } .form-col { flex: 1; }
:deep(.el-table) { background: transparent; color: #CBD5E1; --el-table-bg-color: transparent; --el-table-tr-bg-color: transparent; --el-table-header-bg-color: rgba(15,23,42,0.5); --el-table-border-color: rgba(99,102,241,0.08); --el-table-header-text-color: #94A3B8; --el-table-text-color: #CBD5E1; --el-table-row-hover-bg-color: rgba(99,102,241,0.06); --el-table-striped-row-bg-color: rgba(99,102,241,0.03); }
:deep(.el-input__wrapper), :deep(.el-select__wrapper) { background: rgba(15,23,42,0.6)!important; border-color: rgba(99,102,241,0.15)!important; border-radius: 10px!important; }
:deep(.el-input__inner), :deep(.el-select input) { color: #CBD5E1!important; }
@media(max-width:768px){ .page-header { flex-direction:column; align-items:flex-start; gap:16px; } .filter-row { flex-direction:column; align-items:stretch; } .filter-actions { margin-left:0; justify-content:flex-end; } .form-row { flex-direction:column; gap:0; } }
</style>
