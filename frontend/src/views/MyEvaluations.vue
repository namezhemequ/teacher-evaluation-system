<template>
  <div class="evaluations-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">我的评价</h1>
        <p class="page-desc">查看和管理您的听课评价记录</p>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">状态筛选</label>
          <el-select v-model="filters.status" placeholder="全部状态" clearable size="large" style="width: 160px">
            <el-option label="待评价" value="pending" />
            <el-option label="已提交" value="submitted" />
          </el-select>
        </div>
        <div class="filter-actions">
          <el-button size="large" @click="resetFilters">重置</el-button>
          <el-button type="primary" size="large" @click="loadData">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
      </div>
    </div>

    <!-- 待评价计划 -->
    <div class="section" v-if="pendingPlans.length > 0">
      <h3 class="section-title">
        <el-icon><Clock /></el-icon>
        待评价 ({{ pendingPlans.length }})
      </h3>
      <div class="plans-grid">
        <div 
          v-for="plan in pendingPlans" 
          :key="plan.id"
          class="plan-card pending"
        >
          <div class="plan-header">
            <span class="plan-status">待评价</span>
          </div>
          <h4 class="plan-title">{{ plan.title }}</h4>
          <div class="plan-meta">
            <span v-if="plan.subject"><el-icon><Collection /></el-icon> {{ plan.subject }}</span>
            <span v-if="plan.teacherName"><el-icon><User /></el-icon> {{ plan.teacherName }}</span>
            <span v-if="plan.observeDate"><el-icon><Calendar /></el-icon> {{ plan.observeDate }}</span>
          </div>
          <div class="plan-actions">
            <el-button type="primary" @click="$router.push(`/evaluation/${plan.id}`)">
              填写评价
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 已提交评价 -->
    <div class="section">
      <h3 class="section-title">
        <el-icon><SuccessFilled /></el-icon>
        已提交评价 ({{ submittedEvaluations.length }})
      </h3>
      
      <div class="table-card" v-if="submittedEvaluations.length > 0">
        <el-table :data="submittedEvaluations" stripe v-loading="loading">
          <el-table-column type="index" label="#" width="60" align="center" />
          <el-table-column prop="Plan.title" label="计划标题" min-width="180">
            <template #default="{ row }">
              <span class="eval-title">{{ row.plan?.title || '未知计划' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="overallScore" label="评分" width="120" align="center">
            <template #default="{ row }">
              <div class="score-cell">
                <el-rate 
                  :model-value="parseFloat(row.overallScore) || 0" 
                  disabled 
                  size="small"
                />
                <span class="score-num">{{ row.overallScore || '-' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="submittedAt" label="提交时间" width="160" align="center">
            <template #default="{ row }">
              <span class="time-cell">{{ formatDate(row.submittedAt) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button size="small" text @click="viewDetail(row)">
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <el-empty v-else description="暂无已提交的评价" />
    </div>

    <!-- 详情对话框 -->
    <el-dialog v-model="showDetail" title="评价详情" width="560px">
      <div v-if="currentRecord" class="detail-content">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">计划</span>
            <span class="info-value">{{ currentRecord.Plan?.title }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">总分</span>
            <span class="info-value score">{{ currentRecord.overallScore }}分</span>
          </div>
        </div>
        
        <h4 class="detail-title">维度评分</h4>
        <div class="dimensions-list">
          <div v-for="(dim, index) in currentRecord.dimensions" :key="index" class="dim-item">
            <span class="dim-name">{{ dim.dimensionName }}</span>
            <el-rate :model-value="parseFloat(dim.score) || 0" disabled size="small" />
            <span class="dim-comment" v-if="dim.comment">{{ dim.comment }}</span>
          </div>
        </div>
        
        <h4 class="detail-title">总体评语</h4>
        <div class="overall-comment">{{ currentRecord.overallComment }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Search, Clock, Collection, User, Calendar, SuccessFilled } from '@element-plus/icons-vue';
import api from '../api';

const loading = ref(false);
const showDetail = ref(false);
const pendingPlans = ref([]);
const submittedEvaluations = ref([]);
const currentRecord = ref(null);
const filters = ref({ status: '' });

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleString('zh-CN');
};

const loadData = async () => {
  loading.value = true;
  try {
    const [plansRes, evalsRes] = await Promise.all([
      api.plans.list({ status: 'published', pageSize: 100 }),
      api.evaluations.getByPlan ? api.evaluations.getByPlan(0) : Promise.resolve({ code: 200, data: [] }),
    ]);
    
    if (plansRes.code === 200) {
      pendingPlans.value = plansRes.data.list || [];
    }
    
    // 模拟已提交数据
    submittedEvaluations.value = [];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value.status = '';
  loadData();
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

onMounted(loadData);
</script>

<style scoped>
.evaluations-page {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
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

.section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  margin: 0 0 16px 0;
}

.section-title .el-icon {
  color: #3B4BFF;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.plan-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #E2E8F0;
  transition: all 0.3s ease;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.plan-card.pending {
  border-color: rgba(245, 158, 11, 0.3);
  background: linear-gradient(135deg, #fff 0%, rgba(245, 158, 11, 0.02) 100%);
}

.plan-header {
  margin-bottom: 12px;
}

.plan-status {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.plan-title {
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  margin: 0 0 12px 0;
}

.plan-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.plan-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #64748B;
}

.plan-actions {
  display: flex;
  gap: 12px;
}

.table-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
}

.eval-title {
  font-weight: 500;
  color: #1E293B;
}

.score-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.score-num {
  font-size: 12px;
  font-weight: 600;
  color: #F59E0B;
}

.time-cell {
  font-size: 13px;
  color: #64748B;
}

.detail-content {
  padding: 8px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
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

.info-value.score {
  font-size: 18px;
  color: #F59E0B;
}

.detail-title {
  font-size: 14px;
  font-weight: 600;
  color: #1E293B;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #F1F5F9;
}

.dimensions-list {
  margin-bottom: 24px;
}

.dim-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #F8FAFC;
  border-radius: 10px;
  margin-bottom: 8px;
}

.dim-name {
  width: 80px;
  font-size: 13px;
  color: #475569;
}

.dim-comment {
  flex: 1;
  font-size: 12px;
  color: #94A3B8;
}

.overall-comment {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 16px;
  font-size: 14px;
  color: #475569;
  line-height: 1.7;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-actions {
    margin-left: 0;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>
