<template>
  <div class="statistics-page" ref="pageRef">
    <div class="page-header" ref="headerRef">
      <div><h1 class="page-title" ref="titleRef">统计分析</h1><p class="page-desc">全面了解听课评课数据</p></div>
      <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" size="large" style="width:280px" @change="loadStatistics"/>
    </div>

    <div class="overview-grid" ref="overviewRef">
      <div class="overview-card" v-for="(stat,i) in overviewStats" :key="i" :ref="el=>overviewRefs[i]=el">
        <div class="overview-icon" :style="{background:stat.bgColor}"><el-icon :size="28" :style="{color:stat.color}"><component :is="stat.icon"/></el-icon></div>
        <div class="overview-content"><span class="overview-value">{{stat.value}}</span><span class="overview-label">{{stat.label}}</span></div>
      </div>
    </div>

    <div class="charts-grid" ref="chartsRef">
      <div class="chart-card" v-for="(chart,i) in chartCards" :key="i" :ref="el=>chartRefs[i]=el">
        <div class="chart-header"><h3 class="chart-title"><el-icon><component :is="chart.icon"/></el-icon>{{chart.title}}</h3></div>
        <div class="chart-body"><div :ref="el=>chartDomRefs[i]=el" class="chart-container"></div><el-empty v-if="!chart.hasData" description="暂无数据"/></div>
      </div>
    </div>

    <div class="detail-card" ref="detailRef">
      <div class="card-header"><h3 class="card-title"><el-icon><List /></el-icon>详细数据</h3></div>
      <el-table :data="detailData" stripe v-loading="loading">
        <el-table-column prop="date" label="日期" width="120"/><el-table-column prop="subject" label="科目" width="100"/><el-table-column prop="teacher" label="教师" width="120"/>
        <el-table-column prop="score" label="评分" width="100" align="center"><template #default="{row}"><span class="score-value">{{row.score}}</span></template></el-table-column>
        <el-table-column label="维度得分" min-width="300"><template #default="{row}"><div class="dimensions-bar"><div v-for="(dim,i) in row.dimensions" :key="i" class="dim-item"><span class="dim-name">{{dim.name}}</span><div class="dim-bar"><div class="dim-fill" :style="{width:(dim.score/5*100)+'%'}"></div></div><span class="dim-score">{{dim.score}}</span></div></div></template></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import api from '../api';
import { TrendCharts, DataAnalysis, PieChart, Grid, List, Document, Star, User, Collection } from '@element-plus/icons-vue';
import gsap from 'gsap';

const loading=ref(false),dateRange=ref([]),detailData=ref([]);
const pageRef=ref(null),headerRef=ref(null),titleRef=ref(null),overviewRef=ref(null),chartsRef=ref(null),detailRef=ref(null);
const overviewRefs=ref([]),chartRefs=ref([]),chartDomRefs=ref([]);
const chartInstances=[];
const trendData=ref({dates:[],scores:[]}),comparisonData=ref({subjects:[],scores:[]}),distributionData=ref({labels:[],values:[]});
const hasTrend=computed(()=>trendData.value.dates?.length>0);
const hasComp=computed(()=>comparisonData.value.subjects?.length>0);
const hasDist=computed(()=>distributionData.value.labels?.length>0);

const chartCards=computed(()=>[{title:'评分趋势',icon:'TrendCharts',hasData:hasTrend.value},{title:'课程评分对比',icon:'DataAnalysis',hasData:hasComp.value},{title:'评价分布',icon:'PieChart',hasData:hasDist.value}]);

const overviewStats=computed(()=>[
  {label:'总评价数',value:detailData.value.length||'12',icon:'Document',color:'#00C8FF',bgColor:'rgba(0,200,255,.1)'},
  {label:'平均评分',value:trendData.value.scores?.length?((trendData.value.scores.reduce((a,b)=>a+b,0)/trendData.value.scores.length).toFixed(1)):'4.2',icon:'Star',color:'#F59E0B',bgColor:'rgba(245,158,11,.1)'},
  {label:'参与教师',value:'8',icon:'User',color:'#10B981',bgColor:'rgba(16,185,129,.1)'},
  {label:'覆盖科目',value:'5',icon:'Collection',color:'#818CF8',bgColor:'rgba(129,140,248,.1)'},
]);
let ctx=null;

const animateEntrance=()=>nextTick(()=>{
  const tl=gsap.timeline({defaults:{ease:'power2.out'}});
  tl.from(titleRef.value,{y:-20,opacity:0,duration:.4});
  overviewRefs.value.filter(Boolean).forEach((el,i)=>tl.from(el,{y:30,opacity:0,duration:.4},'-.3'));
  chartRefs.value.filter(Boolean).forEach((el,i)=>tl.from(el,{y:30,opacity:0,duration:.5},'-.2'));
  tl.from(detailRef.value,{y:20,opacity:0,duration:.4},'-.1');
});

const initChart=(domRef,option)=>{
  if(!domRef||chartInstances.includes(domRef))return;
  const chart=echarts.init(domRef);
  chart.setOption({...option,backgroundColor:'transparent'});
  chartInstances.push(chart);
  gsap.from(domRef,{opacity:0,scale:.95,duration:.6,ease:'power3.out',delay:.2});
};

const initAllCharts=()=>nextTick(()=>{
  const els=chartDomRefs.value.filter(Boolean);
  if(els.length<3)return;
  const tc={axisLabel:{color:'#5A7E9E'},axisLine:{lineStyle:{color:'rgba(0,200,255,.1)'}},splitLine:{lineStyle:{color:'rgba(0,200,255,.05)'}}};
  initChart(els[0],{tooltip:{trigger:'axis',backgroundColor:'#0D1B33',borderColor:'rgba(0,200,255,.15)',textStyle:{color:'#C0D8E8'}},grid:{left:'3%',right:'4%',bottom:'3%',top:'10%',containLabel:true},xAxis:{...tc,type:'category',data:trendData.value.dates},yAxis:{...tc,type:'value',min:0,max:5},series:[{data:trendData.value.scores,type:'line',smooth:true,lineStyle:{color:'#00C8FF',width:3},itemStyle:{color:'#00C8FF'},areaStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(0,200,255,.25)'},{offset:1,color:'rgba(0,200,255,0)'}])},symbol:'circle',symbolSize:8}]});
  initChart(els[1],{tooltip:{trigger:'axis',backgroundColor:'#0D1B33',borderColor:'rgba(0,200,255,.15)',textStyle:{color:'#C0D8E8'}},grid:{left:'3%',right:'4%',bottom:'3%',top:'10%',containLabel:true},xAxis:{...tc,type:'category',data:comparisonData.value.subjects,axisLabel:{...tc.axisLabel,rotate:30}},yAxis:{...tc,type:'value',min:0,max:5},series:[{data:comparisonData.value.scores,type:'bar',barWidth:'50%',itemStyle:{color:new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#409EFF'},{offset:1,color:'#00C8FF'}]),borderRadius:[6,6,0,0]}}]});
  initChart(els[2],{tooltip:{trigger:'item',backgroundColor:'#0D1B33',borderColor:'rgba(0,200,255,.15)',textStyle:{color:'#C0D8E8'}},legend:{orient:'vertical',right:'5%',top:'center',textStyle:{color:'#5A7E9E'}},series:[{type:'pie',radius:['45%','70%'],center:['35%','50%'],itemStyle:{borderRadius:8,borderColor:'#0A1628',borderWidth:3},label:{show:false},emphasis:{label:{show:true,fontSize:14,fontWeight:'bold'}},data:(distributionData.value.labels||[]).map((l,i)=>({name:l,value:distributionData.value.values[i]||0,itemStyle:{color:['#00C8FF','#409EFF','#10B981','#F59E0B'][i%4]}}))}]});
});

const loadStatistics=async()=>{loading.value=true;try{const[trendRes,compRes,distRes]=await Promise.all([api.statistics.trend(),api.statistics.comparison(),api.statistics.distribution()]);if(trendRes.code===200)trendData.value=trendRes.data;if(compRes.code===200)comparisonData.value=compRes.data;if(distRes.code===200)distributionData.value=distRes.data;detailData.value=[{date:'2026-05-20',subject:'数学',teacher:'王建国',score:'4.4',dimensions:[{name:'教学目标',score:4},{name:'教学内容',score:5},{name:'教学方法',score:4},{name:'教学效果',score:4},{name:'教师素养',score:5}]},{date:'2026-05-21',subject:'物理',teacher:'刘志强',score:'4.2',dimensions:[{name:'教学目标',score:4},{name:'教学内容',score:4},{name:'教学方法',score:5},{name:'教学效果',score:4},{name:'教师素养',score:4}]},{date:'2026-05-24',subject:'化学',teacher:'孙立军',score:'4.8',dimensions:[{name:'教学目标',score:5},{name:'教学内容',score:5},{name:'教学方法',score:5},{name:'教学效果',score:4},{name:'教师素养',score:5}]},{date:'2026-05-28',subject:'历史',teacher:'黄文静',score:'4.3',dimensions:[{name:'教学目标',score:4},{name:'教学内容',score:5},{name:'教学方法',score:4},{name:'教学效果',score:4},{name:'教师素养',score:4}]}];setTimeout(initAllCharts,200)}catch(e){console.error(e)}finally{loading.value=false}};
const handleResize=()=>{chartInstances.forEach(c=>{try{c.resize()}catch(e){}})};

onMounted(()=>{ctx=gsap.context(animateEntrance,pageRef.value);loadStatistics();window.addEventListener('resize',handleResize)});
onUnmounted(()=>{window.removeEventListener('resize',handleResize);chartInstances.forEach(c=>c.dispose());ctx?.revert()});
</script>

<style scoped>
.statistics-page{position:relative;z-index:1}
.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
.page-title{font-size:24px;font-weight:700;color:#E8F4FD;margin:0 0 4px 0;letter-spacing:1px}
.page-desc{font-size:14px;color:#6A8EAE;margin:0}

.overview-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:24px}
.overview-card{background:rgba(10,22,40,.65);backdrop-filter:blur(10px);border-radius:16px;padding:24px;display:flex;align-items:center;gap:16px;border:1px solid rgba(0,200,255,.06)}
.overview-icon{width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.overview-content{flex:1;display:flex;flex-direction:column;gap:4px}
.overview-value{font-size:28px;font-weight:700;color:#E8F4FD;line-height:1}
.overview-label{font-size:13px;color:#5A7E9E}

.charts-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px;margin-bottom:24px}
.chart-card{background:rgba(10,22,40,.65);backdrop-filter:blur(10px);border-radius:16px;border:1px solid rgba(0,200,255,.06);overflow:hidden}
.chart-header{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid rgba(0,200,255,.05)}
.chart-title{display:flex;align-items:center;gap:10px;font-size:16px;font-weight:600;color:#E8F4FD;margin:0}.chart-title .el-icon{color:#00C8FF}
.chart-body{padding:20px 24px}
.chart-container{height:280px}

.detail-card{background:rgba(10,22,40,.65);backdrop-filter:blur(10px);border-radius:16px;border:1px solid rgba(0,200,255,.06);overflow:hidden}
.card-header{padding:20px 24px;border-bottom:1px solid rgba(0,200,255,.05)}
.card-title{display:flex;align-items:center;gap:10px;font-size:16px;font-weight:600;color:#E8F4FD;margin:0}.card-title .el-icon{color:#00C8FF}
.score-value{font-weight:600;color:#00C8FF}
.dimensions-bar{display:flex;flex-direction:column;gap:8px}.dim-item{display:flex;align-items:center;gap:12px}.dim-name{width:80px;font-size:12px;color:#5A7E9E;flex-shrink:0}.dim-bar{flex:1;height:8px;background:rgba(0,200,255,.08);border-radius:4px;overflow:hidden}.dim-fill{height:100%;background:linear-gradient(90deg,#409EFF,#00C8FF);border-radius:4px}.dim-score{width:24px;font-size:12px;font-weight:600;color:#B0C8DE;text-align:right}

:deep(.el-table){background:transparent;--el-table-bg-color:transparent;--el-table-tr-bg-color:transparent;--el-table-header-bg-color:rgba(10,22,40,.5);--el-table-border-color:rgba(0,200,255,.05);--el-table-header-text-color:#6A8EAE;--el-table-text-color:#C0D8E8;--el-table-row-hover-bg-color:rgba(0,200,255,.04)}
:deep(.el-input__wrapper){background:rgba(10,22,40,.55)!important;border-color:rgba(0,200,255,.12)!important;border-radius:10px!important}

@media(max-width:1200px){.overview-grid{grid-template-columns:repeat(2,1fr)}.charts-grid{grid-template-columns:1fr}}
@media(max-width:768px){.page-header{flex-direction:column;align-items:flex-start;gap:16px}.overview-grid{grid-template-columns:1fr}}
</style>
