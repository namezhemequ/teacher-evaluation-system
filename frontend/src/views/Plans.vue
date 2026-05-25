<template>
  <div class="plans-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">听课计划管理</h1>
        <p class="page-desc">创建和管理教师听课计划</p>
      </div>
      <el-button type="primary" size="large" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        创建计划
      </el-button>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">计划状态</label>
          <el-select v-model="filters.status" placeholder="全部状态" clearable size="large" style="width: 180px">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已完成" value="completed" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </div>
        <div class="filter-item">
          <label class="filter-label">科目</label>
          <el-select v-model="filters.subject" placeholder="全部科目" clearable size="large" style="width: 150px">
            <el-option label="语文" value="语文" />
            <el-option label="数学" value="数学" />
            <el-option label="英语" value="英语" />
            <el-option label="物理" value="物理" />
            <el-option label="化学" value="化学" />
          </el-select>
        </div>
        <div class="filter-actions">
          <el-button size="large" @click="resetFilters">重置</el-button>
          <el-button type="primary" size="large" @click="loadPlans">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-card">
      <el-table 
        :data="plans" 
        v-loading="loading"
        stripe
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="title" label="计划标题" min-width="200">
          <template #default="{ row }">
            <div class="title-cell">
              <span class="plan-title">{{ row.title }}</span>
              <span class="plan-subject" v-if="row.subject">{{ row.subject }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="被听课教师" width="120">
          <template #default="{ row }">
            <div class="teacher-cell">
              <el-avatar :size="28" class="teacher-avatar">
                {{ (row.teacherName || 'T').charAt(0) }}
              </el-avatar>
              <span>{{ row.teacherName || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="grade" label="年级" width="80" align="center" />
        <el-table-column prop="classroom" label="教室" width="80" align="center" />
        <el-table-column prop="observeDate" label="听课日期" width="120" align="center">
          <template #default="{ row }">
            <span class="date-cell" v-if="row.observeDate">{{ row.observeDate }}</span>
            <span class="empty-cell" v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="period" label="节次" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <span class="status-badge" :class="row.status">
              <span class="status-dot"></span>
              {{ statusText(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-cell">
              <el-tooltip content="编辑" placement="top">
                <el-button size="small" circle @click="editPlan(row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="发布" placement="top" v-if="row.status === 'draft'">
                <el-button type="success" size="small" circle @click="publishPlan(row)">
                  <el-icon><Promotion /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button type="danger" size="small" circle @click="deletePlan(row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          :page-count="Math.ceil(pagination.total / pagination.pageSize)"
          @current-change="loadPlans"
          layout="total, prev, pager, next"
          :background="true"
        />
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog 
      v-model="showDialog" 
      :title="isEditing ? '编辑计划' : '创建计划'" 
      width="560px"
      :close-on-click-modal="false"
      class="custom-dialog"
    >
      <el-form 
        ref="formRef" 
        :model="form" 
        :rules="rules" 
        label-position="top"
        class="plan-form"
      >
        <el-form-item label="计划标题" prop="title">
          <el-input 
            v-model="form.title" 
            placeholder="请输入计划标题"
            size="large"
          />
        </el-form-item>
        
        <div class="form-row">
          <el-form-item label="科目" prop="subject" class="form-col">
            <el-input v-model="form.subject" placeholder="如：数学" />
          </el-form-item>
          <el-form-item label="年级" prop="grade" class="form-col">
            <el-input v-model="form.grade" placeholder="如：高一" />
          </el-form-item>
        </div>
        
        <div class="form-row">
          <el-form-item label="被听课教师" prop="teacherName" class="form-col">
            <el-input v-model="form.teacherName" placeholder="教师姓名" />
          </el-form-item>
          <el-form-item label="教室" prop="classroom" class="form-col">
            <el-input v-model="form.classroom" placeholder="如：101" />
          </el-form-item>
        </div>
        
        <div class="form-row">
          <el-form-item label="听课日期" prop="observeDate" class="form-col">
            <el-date-picker 
              v-model="form.observeDate" 
              type="date" 
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="节次" prop="period" class="form-col">
            <el-input v-model="form.period" placeholder="如：第3节" />
          </el-form-item>
        </div>
      </el-form>
      
      <template #footer>
        <el-button size="large" @click="showDialog = false">取消</el-button>
        <el-button type="primary" size="large" :loading="submitting" @click="handleSubmit">
          {{ isEditing ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '../api';
import { Plus, Search, Edit, Delete, Promotion } from '@element-plus/icons-vue';

const loading = ref(false);
const submitting = ref(false);
const showDialog = ref(false);
const isEditing = ref(false);
const plans = ref([]);
const formRef = ref();
const editingId = ref(null);

const filters = reactive({
  status: '',
  subject: '',
});

const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
});

const form = ref({
  title: '',
  subject: '',
  grade: '',
  teacherName: '',
  classroom: '',
  observeDate: '',
  period: '',
});

const rules = {
  title: [{ required: true, message: '请输入计划标题', trigger: 'blur' }],
};

const statusText = (status) => {
  const map = {
    draft: '草稿',
    published: '已发布',
    completed: '已完成',
    archived: '已归档',
  };
  return map[status] || status;
};

const tableRowClassName = ({ rowIndex }) => {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
};

const loadPlans = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    };
    if (filters.status) params.status = filters.status;
    if (filters.subject) params.subject = filters.subject;
    
    const res = await api.plans.list(params);
    if (res.code === 200) {
      plans.value = res.data?.list || res.data || [];
      pagination.value.total = res.data.pagination.total;
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.status = '';
  filters.subject = '';
  pagination.value.page = 1;
  loadPlans();
};

const openCreateDialog = () => {
  isEditing.value = false;
  editingId.value = null;
  form.value = {
    title: '',
    subject: '',
    grade: '',
    teacherName: '',
    classroom: '',
    observeDate: '',
    period: '',
  };
  showDialog.value = true;
};

const editPlan = (row) => {
  isEditing.value = true;
  editingId.value = row.id;
  form.value = {
    title: row.title,
    subject: row.subject || '',
    grade: row.grade || '',
    teacherName: row.teacherName || '',
    classroom: row.classroom || '',
    observeDate: row.observeDate || '',
    period: row.period || '',
  };
  showDialog.value = true;
};

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  
  submitting.value = true;
  try {
    let res;
    if (isEditing.value) {
      res = await api.plans.update(editingId.value, form.value);
    } else {
      res = await api.plans.create(form.value);
    }
    
    if (res.code === 200) {
      ElMessage.success(isEditing.value ? '修改成功' : '创建成功');
      showDialog.value = false;
      loadPlans();
    }
  } catch (e) {
    console.error(e);
  } finally {
    submitting.value = false;
  }
};

const publishPlan = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要发布计划「${row.title}」吗？发布后教师可以开始评价。`,
      '发布确认',
      {
        confirmButtonText: '确定发布',
        cancelButtonText: '取消',
        type: 'info',
      }
    );
    
    const res = await api.plans.publish(row.id);
    if (res.code === 200) {
      ElMessage.success('发布成功');
      loadPlans();
    }
  } catch (e) {
    if (e !== 'cancel') console.error(e);
  }
};

const deletePlan = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除计划「${row.title}」吗？此操作不可撤销。`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      }
    );
    
    const res = await api.plans.delete(row.id);
    if (res.code === 200) {
      ElMessage.success('删除成功');
      loadPlans();
    }
  } catch (e) {
    if (e !== 'cancel') console.error(e);
  }
};

onMounted(loadPlans);
</script>

<style scoped>
.plans-page {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

/* 筛选卡片 */
.filter-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);
}

.filter-row {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 13px;
  font-weight: 500;
  color: #64748B;
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

/* 表格卡片 */
.table-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.02);
}

/* 表格单元格样式 */
.title-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.plan-title {
  font-weight: 600;
  color: #1E293B;
}

.plan-subject {
  font-size: 12px;
  color: #64748B;
  background: #F1F5F9;
  padding: 2px 8px;
  border-radius: 4px;
  width: fit-content;
}

.teacher-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.teacher-avatar {
  background: linear-gradient(135deg, #3B4BFF 0%, #667eea 100%);
  color: #fff;
  font-size: 12px;
}

.date-cell {
  color: #475569;
  font-weight: 500;
}

.empty-cell {
  color: #CBD5E1;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge.draft {
  background: #F1F5F9;
  color: #64748B;
}

.status-badge.draft .status-dot {
  background: #94A3B8;
}

.status-badge.published {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.status-badge.published .status-dot {
  background: #10B981;
}

.status-badge.completed {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.status-badge.completed .status-dot {
  background: #F59E0B;
}

.status-badge.archived {
  background: rgba(99, 102, 241, 0.1);
  color: #6366F1;
}

.status-badge.archived .status-dot {
  background: #6366F1;
}

.action-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* 分页 */
.pagination-wrapper {
  padding: 20px 24px;
  border-top: 1px solid #F1F5F9;
}

/* 表单 */
.plan-form {
  padding: 8px 0;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-col {
  flex: 1;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #475569;
  padding-bottom: 8px !important;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  border-radius: 10px !important;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-actions {
    margin-left: 0;
    justify-content: flex-end;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
