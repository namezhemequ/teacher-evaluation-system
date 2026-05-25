<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h2 class="welcome-title">
          您好，{{ userStore.userInfo?.realName }}！
        </h2>
        <p class="welcome-subtitle">{{ welcomeMessage }}</p>
      </div>
      <div class="welcome-time">
        <div class="time-icon">
          <el-icon :size="24"><Clock /></el-icon>
        </div>
        <span>{{ currentDate }}</span>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div 
        v-for="(stat, index) in statsCards" 
        :key="index"
        class="stat-card"
        :class="stat.type"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="stat-icon">
          <el-icon :size="28"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
        <div class="stat-trend" v-if="stat.trend">
          <el-icon><TrendCharts /></el-icon>
          <span>{{ stat.trend }}</span>
        </div>
      </div>
    </div>

    <!-- 图表与列表区域 -->
    <div class="content-grid">
      <!-- 最近评价 -->
      <div class="card recent-evaluations">
        <div class="card-header">
          <h3 class="card-title">
            <el-icon><Document /></el-icon>
            最近评价
          </h3>
          <router-link to="/records" class="card-action" v-if="userStore.isAdmin">
            查看全部
            <el-icon><ArrowRight /></el-icon>
          </router-link>
          <router-link to="/my-evaluations" class="card-action" v-else>
            我的评价
            <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        <div class="card-body">
          <el-table 
            :data="recentEvaluations" 
            style="width: 100%"
            :show-header="true"
            stripe
            v-loading="loading"
          >
            <el-table-column prop="Plan.title" label="计划标题" min-width="180">
              <template #default="{ row }">
                <div class="plan-cell">
                  <span class="plan-title">{{ row.Plan?.title || '未知计划' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="overallScore" label="评分" width="100" align="center">
              <template #default="{ row }">
                <div class="score-cell">
                  <el-rate 
                    :model-value="parseFloat(row.overallScore) || 0" 
                    disabled 
                    size="small"
                    :colors="['#FCD34D', '#FCD34D', '#FCD34D']"
                  />
                  <span class="score-num">{{ row.overallScore || '-' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <span class="status-badge" :class="row.status">
                  {{ row.status === 'submitted' ? '已提交' : row.status === 'archived' ? '已归档' : row.status }}
                </span>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!loading && recentEvaluations.length === 0" description="暂无数据" />
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="card quick-actions-card">
        <div class="card-header">
          <h3 class="card-title">
            <el-icon><Lightning /></el-icon>
            快捷操作
          </h3>
        </div>
        <div class="card-body">
          <div class="actions-grid">
            <router-link 
              v-for="action in quickActions" 
              :key="action.path"
              :to="action.path"
              class="action-item"
            >
              <div class="action-icon" :style="{ background: action.bgColor }">
                <el-icon :size="24" :style="{ color: action.color }">
                  <component :is="action.icon" />
                </el-icon>
              </div>
              <span class="action-label">{{ action.label }}</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- 评分分布 -->
      <div class="card score-distribution">
        <div class="card-header">
          <h3 class="card-title">
            <el-icon><PieChart /></el-icon>
            评分分布
          </h3>
        </div>
        <div class="card-body">
          <div ref="distributionChartRef" class="chart-container"></div>
          <el-empty v-if="!hasDistributionData" description="暂无评分数据" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '../stores/user';
import api from '../api';
import * as echarts from 'echarts';
import { 
  Clock, TrendCharts, Document, Lightning, PieChart, 
  ArrowRight, Calendar, EditPen, Files, DataAnalysis, Plus 
} from '@element-plus/icons-vue';

const userStore = useUserStore();
const loading = ref(false);
const recentEvaluations = ref([]);
const distributionChartRef = ref(null);
let distributionChart = null;

const currentDate = computed(() => {
  const now = new Date();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weekdays[now.getDay()]}`;
});

const welcomeMessage = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return '上午好！新的一天从积极评价开始';
  if (hour < 18) return '下午好！继续加油';
  return '晚上好！一天的工作辛苦了';
});

const stats = ref({
  todayPlans: 0,
  pendingEvaluations: 0,
  completedEvaluations: 0,
  avgScore: 0,
});

const hasDistributionData = computed(() => stats.value.completedEvaluations > 0);

const statsCards = computed(() => [
  {
    label: '今日计划',
    value: stats.value.todayPlans,
    icon: 'Calendar',
    type: 'primary',
    trend: null,
  },
  {
    label: '待评价',
    value: stats.value.pendingEvaluations,
    icon: 'EditPen',
    type: 'warning',
    trend: null,
  },
  {
    label: '已完成',
    value: stats.value.completedEvaluations,
    icon: 'Files',
    type: 'success',
    trend: stats.value.completedEvaluations > 0 ? '+' + stats.value.completedEvaluations : null,
  },
  {
    label: '平均分',
    value: stats.value.avgScore || '-',
    icon: 'TrendCharts',
    type: 'info',
    trend: null,
  },
]);

const quickActions = computed(() => {
  if (userStore.isAdmin) {
    return [
      { path: '/plans', label: '创建计划', icon: 'Plus', color: '#3B4BFF', bgColor: 'rgba(59, 75, 255, 0.1)' },
      { path: '/records', label: '查看记录', icon: 'Files', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
      { path: '/statistics', label: '统计分析', icon: 'DataAnalysis', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
    ];
  }
  return [
    { path: '/my-evaluations', label: '填写评价', icon: 'EditPen', color: '#3B4BFF', bgColor: 'rgba(59, 75, 255, 0.1)' },
    { path: '/dashboard', label: '我的记录', icon: 'Files', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  ];
});

const initDistributionChart = () => {
  if (!distributionChartRef.value) return;
  
  distributionChart = echarts.init(distributionChartRef.value);
  const completed = stats.value.completedEvaluations;
  const pending = stats.value.pendingEvaluations;
  
  distributionChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: {
        color: '#64748B',
        fontSize: 13,
      },
    },
    series: [
      {
        name: '评价状态',
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 3,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
        data: [
          { value: completed, name: '已完成', itemStyle: { color: '#10B981' } },
          { value: pending, name: '待评价', itemStyle: { color: '#F59E0B' } },
        ],
      },
    ],
  });
};

const loadData = async () => {
  loading.value = true;
  try {
    const [plansRes, recordsRes] = await Promise.all([
      api.plans.list({ pageSize: 100 }),
      api.records.list({ pageSize: 5 }),
    ]);
    
    if (plansRes?.code === 200) {
      const plans = plansRes.data?.list || plansRes.data || [];
      stats.value.todayPlans = plans.filter(p => p.status === 'published').length;
      stats.value.pendingEvaluations = plans.filter(p => p.status === 'published').length;
    }
    
    if (recordsRes?.code === 200) {
      const records = recordsRes.data?.list || recordsRes.data || [];
      recentEvaluations.value = records;
      const completed = records.filter(r => r.status === 'submitted' || r.status === 'archived');
      stats.value.completedEvaluations = completed.length;
      if (completed.length > 0) {
        const total = completed.reduce((sum, r) => sum + parseFloat(r.overallScore || 0), 0);
        stats.value.avgScore = (total / completed.length).toFixed(1);
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

let resizeTimer;
const handleResize = () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    distributionChart?.resize();
  }, 100);
};

onMounted(() => {
  loadData().then(() => {
    setTimeout(initDistributionChart, 100);
  });
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  distributionChart?.dispose();
});
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 欢迎区域 */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #3B4BFF 0%, #5B6BFF 50%, #667eea 100%);
  border-radius: 20px;
  padding: 32px 40px;
  margin-bottom: 32px;
  color: #fff;
  box-shadow: 0 8px 32px rgba(59, 75, 255, 0.3);
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.welcome-subtitle {
  font-size: 15px;
  opacity: 0.9;
}

.welcome-time {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.2);
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
}

.time-icon {
  opacity: 0.9;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #E2E8F0;
  transition: all 0.3s ease;
  animation: slideUp 0.5s ease both;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card.primary .stat-icon {
  background: rgba(59, 75, 255, 0.1);
  color: #3B4BFF;
}

.stat-card.warning .stat-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.stat-card.success .stat-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.stat-card.info .stat-icon {
  background: rgba(99, 102, 241, 0.1);
  color: #6366F1;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1E293B;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #64748B;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #10B981;
  background: rgba(16, 185, 129, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}

/* 内容网格 */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  grid-template-rows: auto auto;
  gap: 24px;
}

.card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #F1F5F9;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
}

.card-title .el-icon {
  color: #3B4BFF;
}

.card-action {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #64748B;
  text-decoration: none;
  transition: color 0.2s ease;
}

.card-action:hover {
  color: #3B4BFF;
}

.card-body {
  padding: 20px 24px;
}

/* 最近评价 */
.recent-evaluations {
  grid-row: span 2;
}

.plan-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.plan-title {
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
  color: #F59E0B;
  font-weight: 600;
}

.status-badge {
  padding: 4px 10px;
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

/* 快捷操作 */
.quick-actions-card {
  height: fit-content;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 12px;
  background: #F8FAFC;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.action-item:hover {
  background: #F1F5F9;
  transform: translateY(-2px);
}

.action-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-label {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
}

/* 评分分布 */
.score-distribution {
  height: fit-content;
}

.chart-container {
  height: 200px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .recent-evaluations {
    grid-row: auto;
  }
}

@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    padding: 24px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
