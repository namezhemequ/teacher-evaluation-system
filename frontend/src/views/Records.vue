<template>
  <div class="records-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">评课记录</h1>
        <p class="page-desc">查看和管理所有教师的听课评价记录</p>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-value">{{ pagination.total }}</span>
          <span class="stat-label">总记录</span>
        </div>
        <div class="stat-item success">
          <span class="stat-value">{{ submittedCount }}</span>
          <span class="stat-label">已提交</span>
        </div>
        <div class="stat-item info">
          <span class="stat-value">{{ archivedCount }}</span>
          <span class="stat-label">已归档</span>
        </div>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">状态筛选</label>
          <el-select v-model="filters.status" placeholder="全部状态" clearable size="large" style="width: 160px">
            <el-option label="已提交" value="submitted" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </div>
        <div class="filter-item">
          <label class="filter-label">评分范围</label>
          <el-select v-model="filters.scoreRange" placeholder="全部" clearable size="large" style="width: 160px">
            <el-option label="90分以上" value="high" />
            <el-option label="80-90分" value="mid" />
            <el-option label="80分以下" value="low" />
          </el-select>
        </div>
        <div class="filter-actions">
          <el-button size="large" @click="resetFilters">重置</el-button>
          <el-button type="primary" size="large" @click="loadRecords">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-card">
      <el-table 
        :data="records" 
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column label="计划标题" min-width="200">
          <template #default="{ row }">
            <div class="title-cell">
              <span class="record-title">{{ row.plan?.title || '未知计划' }}</span>
              <span class="record-subject" v-if="row.plan?.subject">{{ row.plan.subject }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="被听课教师" width="120" align="center">
          <template #default="{ row }">
            <div class="teacher-cell">
              <el-avatar :size="32" class="teacher-avatar">
                {{ (row.plan?.teacherName || 'T').charAt(0) }}
              </el-avatar>
              <span>{{ row.plan?.teacherName || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="overallScore" label="评分" width="140" align="center">
          <template #default="{ row }">
            <div class="score-cell">
              <el-rate 
                :model-value="parseFloat(row.overallScore) || 0" 
                disabled 
                size="small"
                :colors="['#FCD34D', '#FCD34D', '#FCD34D']"
              />
              <span class="score-value">{{ row.overallScore || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <span class="status-badge" :class="row.status">
              <span class="status-dot"></span>
              {{ row.status === 'submitted' ? '已提交' : '已归档' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="submittedAt" label="提交时间" width="160" align="center">
          <template #default="{ row }">
            <span class="time-cell">{{ formatDate(row.submittedAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-cell">
              <el-tooltip content="查看详情" placement="top">
                <el-button size="small" circle @click="viewDetail(row)">
                  <el-icon><View /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="归档" placement="top" v-if="row.status === 'submitted'">
                <el-button type="warning" size="small" circle @click="archiveRecord(row)">
                  <el-icon><FolderOpened /></el-icon>
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
          @current-change="loadRecords"
          layout="total, prev, pager, next"
          :background="true"
        />
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog 
      v-model="showDetail" 
      title="评价详情" 
      width="640px"
      class="detail-dialog"
    >
      <div v-if="currentRecord" class="detail-content">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4 class="detail-title">
            <el-icon><InfoFilled /></el-icon>
            基本信息
          </h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">计划</span>
              <span class="info-value">{{ currentRecord.Plan?.title || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">被听课教师</span>
              <span class="info-value">{{ currentRecord.Plan?.teacherName || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">总分</span>
              <span class="info-value score-highlight">{{ currentRecord.overallScore || '-' }}分</span>
            </div>
            <div class="info-item">
              <span class="info-label">状态</span>
              <span class="status-badge" :class="currentRecord.status">
                {{ currentRecord.status === 'submitted' ? '已提交' : '已归档' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 维度评分 -->
        <div class="detail-section">
          <h4 class="detail-title">
            <el-icon><Star /></el-icon>
            维度评分
          </h4>
          <div class="dimensions-list">
            <div 
              v-for="(dim, index) in currentRecord.dimensions" 
              :key="index"
              class="dimension-item"
            >
              <div class="dimension-info">
                <span class="dimension-name">{{ dim.dimensionName }}</span>
                <el-rate 
                  :model-value="parseFloat(dim.score) || 0" 
                  disabled 
                  size="small"
                />
              </div>
              <p class="dimension-comment" v-if="dim.comment">{{ dim.comment }}</p>
            </div>
          </div>
        </div>

        <!-- 总体评语 -->
        <div class="detail-section">
          <h4 class="detail-title">
            <el-icon><ChatLineSquare /></el-icon>
            总体评语
          </h4>
          <div class="overall-comment">
            {{ currentRecord.overallComment || '暂无评语' }}
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '../api';
import { Search, View, FolderOpened, InfoFilled, Star, ChatLineSquare } from '@element-plus/icons-vue';

const loading = ref(false);
const showDetail = ref(false);
const records = ref([]);
const currentRecord = ref(null);
const filters = ref({
  status: '',
  scoreRange: '',
});

const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
});

const submittedCount = computed(() => 
  records.value.filter(r => r.status === 'submitted').length
);

const archivedCount = computed(() => 
  records.value.filter(r => r.status === 'archived').length
);

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const loadRecords = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    };
    if (filters.value.status) params.status = filters.value.status;
    
    const res = await api.records.list(params);
    if (res.code === 200) {
      records.value = res.data?.list || res.data || [];
      pagination.value.total = res.data.pagination.total;
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value.status = '';
  filters.value.scoreRange = '';
  pagination.value.page = 1;
  loadRecords();
};

const viewDetail = async (row) => {
  try {
    const res = await api.evaluations.getById(row.id);
    if (res.code === 200) {
      currentRecord.value = res.data;
      showDetail.value = true;
    }
  } catch (e) {
    console.error(e);
  }
};

const archiveRecord = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要归档这条评价记录吗？归档后仍可查看。`,
      '归档确认',
      {
        confirmButtonText: '确定归档',
        cancelButtonText: '取消',
        type: 'info',
      }
    );
    
    const res = await api.evaluations.archive(row.id);
    if (res.code === 200) {
      ElMessage.success('归档成功');
      loadRecords();
    }
  } catch (e) {
    if (e !== 'cancel') console.error(e);
  }
};

onMounted(loadRecords);
</script>

<style scoped>
.records-page {
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
  align-items: flex-start;
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

.header-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 12px 20px;
  text-align: center;
  min-width: 90px;
}

.stat-item.success {
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.2);
}

.stat-item.info {
  background: rgba(99, 102, 241, 0.05);
  border-color: rgba(99, 102, 241, 0.2);
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1E293B;
}

.stat-item.success .stat-value {
  color: #10B981;
}

.stat-item.info .stat-value {
  color: #6366F1;
}

.stat-label {
  font-size: 12px;
  color: #64748B;
}

/* 筛选卡片 */
.filter-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid #E2E8F0;
}

.filter-row {
  display: flex;
  align-items: flex-end;
  gap: 20px;
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
}

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-title {
  font-weight: 600;
  color: #1E293B;
}

.record-subject {
  font-size: 12px;
  color: #64748B;
  background: #F1F5F9;
  padding: 2px 8px;
  border-radius: 4px;
  width: fit-content;
}

.teacher-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.teacher-avatar {
  background: linear-gradient(135deg, #3B4BFF 0%, #667eea 100%);
  color: #fff;
  font-size: 12px;
}

.score-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.score-value {
  font-size: 14px;
  font-weight: 600;
  color: #F59E0B;
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

.status-badge.submitted {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.status-badge.archived {
  background: rgba(99, 102, 241, 0.1);
  color: #6366F1;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.time-cell {
  font-size: 13px;
  color: #64748B;
}

.action-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.pagination-wrapper {
  padding: 20px 24px;
  border-top: 1px solid #F1F5F9;
}

/* 详情对话框 */
.detail-content {
  padding: 8px 0;
}

.detail-section {
  margin-bottom: 28px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1E293B;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #F1F5F9;
}

.detail-title .el-icon {
  color: #3B4BFF;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #94A3B8;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #1E293B;
}

.score-highlight {
  color: #F59E0B;
  font-size: 18px;
}

.dimensions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dimension-item {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 16px;
}

.dimension-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.dimension-name {
  font-weight: 500;
  color: #1E293B;
}

.dimension-comment {
  font-size: 13px;
  color: #64748B;
  margin: 0;
  line-height: 1.6;
}

.overall-comment {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 20px;
  font-size: 14px;
  color: #475569;
  line-height: 1.8;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .header-stats {
    width: 100%;
    justify-content: space-between;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-actions {
    margin-left: 0;
    justify-content: flex-end;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
