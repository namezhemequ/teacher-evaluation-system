<template>
  <div class="statistics-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">统计分析</h1>
        <p class="page-desc">全面了解听课评课数据</p>
      </div>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="large"
          style="width: 280px"
          @change="loadStatistics"
        />
      </div>
    </div>

    <!-- 概览卡片 -->
    <div class="overview-grid">
      <div class="overview-card" v-for="(stat, index) in overviewStats" :key="index">
        <div class="overview-icon" :style="{ background: stat.bgColor }">
          <el-icon :size="28" :style="{ color: stat.color }">
            <component :is="stat.icon" />
          </el-icon>
        </div>
        <div class="overview-content">
          <span class="overview-value">{{ stat.value }}</span>
          <span class="overview-label">{{ stat.label }}</span>
        </div>
        <div class="overview-trend" v-if="stat.trend">
          <el-icon><Top /></el-icon>
          <span>{{ stat.trend }}</span>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 评分趋势 -->
      <div class="chart-card trend-chart">
        <div class="chart-header">
          <h3 class="chart-title">
            <el-icon><TrendCharts /></el-icon>
            评分趋势
          </h3>
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-dot" style="background: #3B4BFF"></span>
              平均分
            </span>
          </div>
        </div>
        <div class="chart-body">
          <div ref="trendChartRef" class="chart-container"></div>
          <el-empty v-if="!hasTrendData" description="暂无趋势数据" />
        </div>
      </div>

      <!-- 课程对比 -->
      <div class="chart-card comparison-chart">
        <div class="chart-header">
          <h3 class="chart-title">
            <el-icon><DataAnalysis /></el-icon>
            课程评分对比
          </h3>
        </div>
        <div class="chart-body">
          <div ref="comparisonChartRef" class="chart-container"></div>
          <el-empty v-if="!hasComparisonData" description="暂无对比数据" />
        </div>
      </div>

      <!-- 维度分布 -->
      <div class="chart-card distribution-chart">
        <div class="chart-header">
          <h3 class="chart-title">
            <el-icon><PieChart /></el-icon>
            评价维度分布
          </h3>
        </div>
        <div class="chart-body">
          <div ref="distributionChartRef" class="chart-container"></div>
          <el-empty v-if="!hasDistributionData" description="暂无分布数据" />
        </div>
      </div>

      <!-- 科目占比 -->
      <div class="chart-card subject-chart">
        <div class="chart-header">
          <h3 class="chart-title">
            <el-icon><Grid /></el-icon>
            科目分布
          </h3>
        </div>
        <div class="chart-body">
          <div ref="subjectChartRef" class="chart-container"></div>
          <el-empty v-if="!hasSubjectData" description="暂无科目数据" />
        </div>
      </div>
    </div>

    <!-- 详细数据表 -->
    <div class="detail-card">
      <div class="card-header">
        <h3 class="card-title">
          <el-icon><List /></el-icon>
          详细数据
        </h3>
      </div>
      <el-table :data="detailData" stripe v-loading="loading">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="subject" label="科目" width="100" />
        <el-table-column prop="teacher" label="教师" width="120" />
        <el-table-column prop="score" label="评分" width="100" align="center">
          <template #default="{ row }">
            <span class="score-value">{{ row.score }}</span>
          </template>
        </el-table-column>
        <el-table-column label="维度得分" min-width="300">
          <template #default="{ row }">
            <div class="dimensions-bar">
              <div 
                v-for="(dim, index) in row.dimensions" 
                :key="index"
                class="dim-item"
              >
                <span class="dim-name">{{ dim.name }}</span>
                <div class="dim-bar">
                  <div class="dim-fill" :style="{ width: (dim.score / 5 * 100) + '%' }"></div>
                </div>
                <span class="dim-score">{{ dim.score }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import * as echarts from 'echarts';
import api from '../api';
import { TrendCharts, DataAnalysis, PieChart, Grid, List, Top } from '@element-plus/icons-vue';

const loading = ref(false);
const dateRange = ref([]);
const detailData = ref([]);

// 图表引用
const trendChartRef = ref(null);
const comparisonChartRef = ref(null);
const distributionChartRef = ref(null);
const subjectChartRef = ref(null);

let trendChart = null;
let comparisonChart = null;
let distributionChart = null;
let subjectChart = null;

// 数据状态
const trendData = ref({ dates: [], scores: [] });
const comparisonData = ref({ labels: [], data: [] });
const distributionData = ref({ dimensions: [], counts: [] });
const subjectData = ref({ subjects: [], counts: [] });

// 数据存在性判断
const hasTrendData = computed(() => trendData.value.dates?.length > 0);
const hasComparisonData = computed(() => comparisonData.value.labels?.length > 0);
const hasDistributionData = computed(() => distributionData.value.dimensions?.length > 0);
const hasSubjectData = computed(() => subjectData.value.subjects?.length > 0);

// 概览统计
const overviewStats = computed(() => [
  {
    label: '总评价数',
    value: '12',
    icon: 'Document',
    color: '#3B4BFF',
    bgColor: 'rgba(59, 75, 255, 0.1)',
    trend: '+3',
  },
  {
    label: '平均评分',
    value: '4.2',
    icon: 'Star',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  {
    label: '参与教师',
    value: '8',
    icon: 'User',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
  {
    label: '覆盖科目',
    value: '5',
    icon: 'Collection',
    color: '#6366F1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
  },
]);

// 初始化图表
const initCharts = () => {
  // 评分趋势图
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value);
    trendChart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#E2E8F0',
        textStyle: { color: '#1E293B' },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: trendData.value.dates || [],
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisLabel: { color: '#64748B' },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 5,
        splitLine: { lineStyle: { color: '#F1F5F9' } },
        axisLabel: { color: '#64748B' },
      },
      series: [{
        data: trendData.value.scores || [],
        type: 'line',
        smooth: true,
        lineStyle: { color: '#3B4BFF', width: 3 },
        itemStyle: { color: '#3B4BFF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 75, 255, 0.3)' },
            { offset: 1, color: 'rgba(59, 75, 255, 0)' },
          ]),
        },
        symbol: 'circle',
        symbolSize: 8,
      }],
    });
  }

  // 课程对比图
  if (comparisonChartRef.value) {
    comparisonChart = echarts.init(comparisonChartRef.value);
    comparisonChart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#E2E8F0',
        textStyle: { color: '#1E293B' },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: comparisonData.value.labels || [],
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisLabel: { color: '#64748B', rotate: 30 },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 5,
        splitLine: { lineStyle: { color: '#F1F5F9' } },
        axisLabel: { color: '#64748B' },
      },
      series: [{
        data: comparisonData.value.data || [],
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3B4BFF' },
            { offset: 1, color: '#667eea' },
          ]),
          borderRadius: [6, 6, 0, 0],
        },
      }],
    });
  }

  // 维度分布图
  if (distributionChartRef.value) {
    distributionChart = echarts.init(distributionChartRef.value);
    distributionChart.setOption({
      tooltip: {
        trigger: 'item',
        backgroundColor: '#fff',
        borderColor: '#E2E8F0',
        textStyle: { color: '#1E293B' },
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#64748B' },
      },
      series: [{
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 3,
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
        },
        data: (distributionData.value.dimensions || []).map((d, i) => ({
          name: d,
          value: distributionData.value.counts[i] || 0,
          itemStyle: {
            color: ['#3B4BFF', '#10B981', '#F59E0B', '#6366F1', '#EF4444'][i % 5],
          },
        })),
      }],
    });
  }

  // 科目分布图
  if (subjectChartRef.value) {
    subjectChart = echarts.init(subjectChartRef.value);
    subjectChart.setOption({
      tooltip: {
        trigger: 'item',
        backgroundColor: '#fff',
        borderColor: '#E2E8F0',
        textStyle: { color: '#1E293B' },
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#64748B' },
      },
      series: [{
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        roseType: 'radius',
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 3,
        },
        label: { show: false },
        data: (subjectData.value.subjects || []).map((s, i) => ({
          name: s,
          value: subjectData.value.counts[i] || 0,
          itemStyle: {
            color: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'][i % 5],
          },
        })),
      }],
    });
  }
};

const loadStatistics = async () => {
  loading.value = true;
  try {
    const [trendRes, comparisonRes, distributionRes] = await Promise.all([
      api.statistics.trend(),
      api.statistics.comparison(),
      api.statistics.distribution(),
    ]);
    
    if (trendRes.code === 200) {
      trendData.value = trendRes.data;
    }
    if (comparisonRes.code === 200) {
      comparisonData.value = comparisonRes.data;
    }
    if (distributionRes.code === 200) {
      distributionData.value = distributionRes.data;
    }
    
    // 模拟详细数据
    detailData.value = [
      {
        date: '2026-05-18',
        subject: '数学',
        teacher: '王老师',
        score: '4.5',
        dimensions: [
          { name: '教学目标', score: 4 },
          { name: '教学内容', score: 5 },
          { name: '教学方法', score: 4 },
          { name: '教学效果', score: 5 },
          { name: '教师素养', score: 4 },
        ],
      },
      {
        date: '2026-05-17',
        subject: '语文',
        teacher: '李老师',
        score: '4.2',
        dimensions: [
          { name: '教学目标', score: 4 },
          { name: '教学内容', score: 4 },
          { name: '教学方法', score: 5 },
          { name: '教学效果', score: 4 },
          { name: '教师素养', score: 4 },
        ],
      },
    ];
    
    // 初始化图表
    setTimeout(initCharts, 100);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const handleResize = () => {
  trendChart?.resize();
  comparisonChart?.resize();
  distributionChart?.resize();
  subjectChart?.resize();
};

onMounted(() => {
  loadStatistics();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  comparisonChart?.dispose();
  distributionChart?.dispose();
  subjectChart?.dispose();
});
</script>

<style scoped>
.statistics-page {
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

/* 概览卡片 */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.overview-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #E2E8F0;
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.overview-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.overview-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.overview-value {
  font-size: 28px;
  font-weight: 700;
  color: #1E293B;
  line-height: 1;
}

.overview-label {
  font-size: 13px;
  color: #64748B;
}

.overview-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #10B981;
  background: rgba(16, 185, 129, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}

/* 图表网格 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.chart-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #F1F5F9;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
}

.chart-title .el-icon {
  color: #3B4BFF;
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748B;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.chart-body {
  padding: 20px 24px;
}

.chart-container {
  height: 280px;
}

/* 详细数据表 */
.detail-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
}

.card-header {
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

.score-value {
  font-weight: 600;
  color: #F59E0B;
}

.dimensions-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dim-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dim-name {
  width: 80px;
  font-size: 12px;
  color: #64748B;
  flex-shrink: 0;
}

.dim-bar {
  flex: 1;
  height: 8px;
  background: #F1F5F9;
  border-radius: 4px;
  overflow: hidden;
}

.dim-fill {
  height: 100%;
  background: linear-gradient(90deg, #3B4BFF, #667eea);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.dim-score {
  width: 24px;
  font-size: 12px;
  font-weight: 600;
  color: #1E293B;
  text-align: right;
}

/* 响应式 */
@media (max-width: 1200px) {
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
