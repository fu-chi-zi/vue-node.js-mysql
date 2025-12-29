<template>
  <div class="statistics-page">
    <!-- 概览卡片 -->
    <div class="overview-cards">
      <el-card class="overview-card" v-for="(item, index) in overviewData" :key="index">
        <div class="card-icon" :style="{ background: item.color }">
          <el-icon :size="28">
            <component :is="item.icon" />
          </el-icon>
        </div>
        <div class="card-content">
          <p class="card-label">{{ item.label }}</p>
          <h2 class="card-value">{{ item.value }}</h2>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 借阅趋势分析 -->
      <el-card class="chart-card full-width">
        <template #header>
          <div class="card-header">
            <h3>借阅趋势分析</h3>
            <el-radio-group v-model="trendPeriod" size="small" @change="updateTrendChart">
              <el-radio-button value="week">近一周</el-radio-button>
              <el-radio-button value="month">近一月</el-radio-button>
              <el-radio-button value="quarter">近三月</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div class="chart-container large" ref="trendChartRef"></div>
      </el-card>

      <!-- 图书分类统计 -->
      <el-card class="chart-card">
        <template #header>
          <h3>图书分类统计</h3>
        </template>
        <div class="chart-container" ref="categoryChartRef"></div>
      </el-card>

      <!-- 借阅状态分布 -->
      <el-card class="chart-card">
        <template #header>
          <h3>借阅状态分布</h3>
        </template>
        <div class="chart-container" ref="statusChartRef"></div>
      </el-card>

      <!-- 热门图书排行榜 -->
      <el-card class="chart-card">
        <template #header>
          <h3>热门图书排行榜 TOP 10</h3>
        </template>
        <div class="chart-container" ref="popularBooksChartRef"></div>
      </el-card>

      <!-- 读者类型分布 -->
      <el-card class="chart-card">
        <template #header>
          <h3>读者类型分布</h3>
        </template>
        <div class="chart-container" ref="readerTypeChartRef"></div>
      </el-card>

      <!-- 月度借阅统计 -->
      <el-card class="chart-card full-width">
        <template #header>
          <h3>月度借阅统计</h3>
        </template>
        <div class="chart-container large" ref="monthlyChartRef"></div>
      </el-card>
    </div>

    <!-- 数据表格 -->
    <el-card class="data-table-card">
      <template #header>
        <div class="card-header">
          <h3>详细数据报表</h3>
          <el-button type="primary" size="small" :icon="Download">
            导出数据
          </el-button>
        </div>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="图书统计" name="books">
          <el-table :data="bookStats" style="width: 100%">
            <el-table-column prop="category" label="分类" width="120" />
            <el-table-column prop="count" label="图书数量" width="120" />
            <el-table-column prop="totalStock" label="总库存" width="120" />
            <el-table-column prop="borrowCount" label="借阅次数" width="120" />
            <el-table-column prop="avgBorrow" label="平均借阅率" width="150">
              <template #default="{ row }">
                {{ row.avgBorrow }}%
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="读者统计" name="readers">
          <el-table :data="readerStats" style="width: 100%">
            <el-table-column prop="type" label="会员类型" width="120" />
            <el-table-column prop="count" label="人数" width="120" />
            <el-table-column prop="totalBorrow" label="总借阅量" width="120" />
            <el-table-column prop="avgBorrow" label="人均借阅" width="120">
              <template #default="{ row }">
                {{ row.avgBorrow }}本
              </template>
            </el-table-column>
            <el-table-column prop="activeRate" label="活跃率" width="120">
              <template #default="{ row }">
                {{ row.activeRate }}%
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBookStore } from '../store/book'
import { useReaderStore } from '../store/reader'
import { useBorrowStore } from '../store/borrow'
import * as echarts from 'echarts'
import { Download } from '@element-plus/icons-vue'

const bookStore = useBookStore()
const readerStore = useReaderStore()
const borrowStore = useBorrowStore()

const trendChartRef = ref(null)
const categoryChartRef = ref(null)
const statusChartRef = ref(null)
const popularBooksChartRef = ref(null)
const readerTypeChartRef = ref(null)
const monthlyChartRef = ref(null)

const trendPeriod = ref('month')
const activeTab = ref('books')

// 概览数据
const overviewData = computed(() => {
  const books = bookStore.books
  const readers = readerStore.readers
  const borrows = borrowStore.borrows
  
  return [
    {
      label: '图书总量',
      value: books.length,
      icon: 'Reading',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      label: '总库存',
      value: books.reduce((sum, book) => sum + book.stock, 0),
      icon: 'Box',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      label: '读者总数',
      value: readers.length,
      icon: 'User',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      label: '借阅总量',
      value: borrows.length,
      icon: 'Document',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      label: '当前借阅',
      value: borrows.filter(b => b.status === 'borrowing').length,
      icon: 'Clock',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      label: '逾期未还',
      value: borrows.filter(b => b.status === 'overdue').length,
      icon: 'Warning',
      color: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'
    }
  ]
})

// 图书统计数据
const bookStats = computed(() => {
  const stats = {}
  bookStore.books.forEach(book => {
    if (!stats[book.category]) {
      stats[book.category] = {
        category: book.category,
        count: 0,
        totalStock: 0,
        borrowCount: 0
      }
    }
    stats[book.category].count++
    stats[book.category].totalStock += book.stock
    stats[book.category].borrowCount += book.borrowCount
  })
  
  return Object.values(stats).map(item => ({
    ...item,
    avgBorrow: item.count > 0 ? ((item.borrowCount / item.count) * 10).toFixed(1) : 0
  }))
})

// 读者统计数据
const readerStats = computed(() => {
  const stats = {}
  readerStore.readers.forEach(reader => {
    if (!stats[reader.type]) {
      stats[reader.type] = {
        type: reader.type,
        count: 0,
        totalBorrow: 0,
        activeCount: 0
      }
    }
    stats[reader.type].count++
    stats[reader.type].totalBorrow += reader.borrowCount
    if (reader.status === 'active') {
      stats[reader.type].activeCount++
    }
  })
  
  return Object.values(stats).map(item => ({
    ...item,
    avgBorrow: item.count > 0 ? (item.totalBorrow / item.count).toFixed(1) : 0,
    activeRate: item.count > 0 ? ((item.activeCount / item.count) * 100).toFixed(1) : 0
  }))
})

// 更新借阅趋势图
const updateTrendChart = () => {
  const days = trendPeriod.value === 'week' ? 7 : trendPeriod.value === 'month' ? 30 : 90
  const trendData = borrowStore.getBorrowTrend(days)
  initTrendChart(trendData)
}

// 初始化借阅趋势图
const initTrendChart = (trendData) => {
  if (!trendChartRef.value) return
  
  const chart = echarts.init(trendChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['借阅量', '归还量'],
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.map(d => d.date.slice(5)),
      axisLine: {
        lineStyle: {
          color: '#e1e8ed'
        }
      },
      axisLabel: {
        color: '#7f8c8d'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#7f8c8d'
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '借阅量',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.borrow),
        itemStyle: {
          color: '#3498db'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(52, 152, 219, 0.4)' },
            { offset: 1, color: 'rgba(52, 152, 219, 0.05)' }
          ])
        }
      },
      {
        name: '归还量',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.return),
        itemStyle: {
          color: '#27ae60'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(39, 174, 96, 0.4)' },
            { offset: 1, color: 'rgba(39, 174, 96, 0.05)' }
          ])
        }
      }
    ]
  }
  
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

// 初始化分类图表
const initCategoryChart = () => {
  if (!categoryChartRef.value) return
  
  const chart = echarts.init(categoryChartRef.value)
  const categoryData = bookStore.getCategoryStats()
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: categoryData,
        color: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7']
      }
    ]
  }
  
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

// 初始化状态图表
const initStatusChart = () => {
  if (!statusChartRef.value) return
  
  const chart = echarts.init(statusChartRef.value)
  const statusData = borrowStore.getStatusStats()
  
  const statusNames = {
    borrowing: '借阅中',
    returned: '已归还',
    overdue: '已逾期'
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: '65%',
        center: ['50%', '50%'],
        data: statusData.map(item => ({
          name: statusNames[item.name] || item.name,
          value: item.value
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          formatter: '{b}\n{c} ({d}%)'
        },
        color: ['#3498db', '#27ae60', '#e74c3c']
      }
    ]
  }
  
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

// 初始化热门图书图表
const initPopularBooksChart = () => {
  if (!popularBooksChartRef.value) return
  
  const chart = echarts.init(popularBooksChartRef.value)
  const popularBooks = bookStore.getPopularBooks(10)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#f0f0f0'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: popularBooks.map(b => b.title).reverse(),
      axisLine: {
        lineStyle: {
          color: '#e1e8ed'
        }
      },
      axisLabel: {
        color: '#7f8c8d',
        formatter: function(value) {
          return value.length > 10 ? value.substring(0, 10) + '...' : value
        }
      }
    },
    series: [
      {
        type: 'bar',
        data: popularBooks.map(b => b.borrowCount).reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ]),
          borderRadius: [0, 4, 4, 0]
        },
        barWidth: '60%'
      }
    ]
  }
  
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

// 初始化读者类型图表
const initReaderTypeChart = () => {
  if (!readerTypeChartRef.value) return
  
  const chart = echarts.init(readerTypeChartRef.value)
  const typeData = readerStore.getTypeStats()
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: '65%',
        center: ['50%', '50%'],
        data: typeData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          formatter: '{b}\n{c}人'
        },
        color: ['#3498db', '#27ae60', '#f39c12', '#e74c3c']
      }
    ]
  }
  
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

// 初始化月度统计图
const initMonthlyChart = () => {
  if (!monthlyChartRef.value) return
  
  const chart = echarts.init(monthlyChartRef.value)
  
  // 生成近12个月数据
  const months = []
  const borrowData = []
  const returnData = []
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
    borrowData.push(Math.floor(Math.random() * 50) + 30)
    returnData.push(Math.floor(Math.random() * 50) + 25)
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['借阅量', '归还量'],
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: {
        lineStyle: {
          color: '#e1e8ed'
        }
      },
      axisLabel: {
        color: '#7f8c8d'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#7f8c8d'
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '借阅量',
        type: 'bar',
        data: borrowData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '归还量',
        type: 'bar',
        data: returnData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#43e97b' },
            { offset: 1, color: '#38f9d7' }
          ]),
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  }
  
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

onMounted(() => {
  updateTrendChart()
  initCategoryChart()
  initStatusChart()
  initPopularBooksChart()
  initReaderTypeChart()
  initMonthlyChart()
})
</script>

<style scoped>
.statistics-page {
  animation: fadeIn 0.6s ease;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  animation: slideIn 0.5s ease-out backwards;
  transition: all 0.3s ease;
}

.overview-card:nth-child(1) { animation-delay: 0s; }
.overview-card:nth-child(2) { animation-delay: 0.1s; }
.overview-card:nth-child(3) { animation-delay: 0.2s; }
.overview-card:nth-child(4) { animation-delay: 0.3s; }
.overview-card:nth-child(5) { animation-delay: 0.4s; }
.overview-card:nth-child(6) { animation-delay: 0.5s; }

.overview-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

.chart-card {
  animation: fadeIn 0.6s ease 0.3s backwards;
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.chart-container {
  height: 320px;
  width: 100%;
}

.chart-container.large {
  height: 400px;
}

.data-table-card {
  animation: fadeIn 0.6s ease 0.5s backwards;
}
</style>
