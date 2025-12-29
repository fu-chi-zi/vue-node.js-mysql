<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div
        v-for="(stat, index) in stats"
        :key="stat.title"
        class="stat-card"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="stat-icon" :style="{ background: stat.gradient }">
          <el-icon :size="32">
            <component :is="stat.icon" />
          </el-icon>
        </div>
        <div class="stat-content">
          <p class="stat-label">{{ stat.title }}</p>
          <h3 class="stat-value">{{ stat.value }}</h3>
          <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
            <el-icon>
              <component :is="stat.trend > 0 ? 'Top' : 'Bottom'" />
            </el-icon>
            <span>{{ Math.abs(stat.trend) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-row">
      <!-- 借阅趋势图 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <h3>借阅趋势</h3>
            <el-radio-group v-model="trendDays" size="small" @change="updateTrendData">
              <el-radio-button :value="7">7天</el-radio-button>
              <el-radio-button :value="30">30天</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div class="chart-container" ref="trendChartRef"></div>
      </el-card>

      <!-- 图书分类统计 -->
      <el-card class="chart-card">
        <template #header>
          <h3>图书分类统计</h3>
        </template>
        <div class="chart-container" ref="categoryChartRef"></div>
      </el-card>
    </div>

    <!-- 热门图书排行 -->
    <el-card class="popular-books-card">
      <template #header>
        <div class="card-header">
          <h3>热门图书排行榜</h3>
          <el-button text type="primary" @click="$router.push('/books')">
            查看更多
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>
      <div class="popular-books-list">
        <div
          v-for="(book, index) in popularBooks"
          :key="book.id"
          class="book-item"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <div class="book-rank" :class="`rank-${index + 1}`">
            {{ index + 1 }}
          </div>
          <div class="book-info">
            <h4 class="book-title">{{ book.title }}</h4>
            <p class="book-meta">{{ book.author }} · {{ book.category }}</p>
          </div>
          <div class="book-stats">
            <div class="stat-item">
              <el-icon><Reading /></el-icon>
              <span>{{ book.borrowCount }}次</span>
            </div>
            <div class="stat-item">
              <el-icon><Box /></el-icon>
              <span>库存 {{ book.stock }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 最近借阅记录 -->
    <el-card class="recent-borrows-card">
      <template #header>
        <div class="card-header">
          <h3>最近借阅记录</h3>
          <el-button text type="primary" @click="$router.push('/borrows')">
            查看全部
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>
      <el-table :data="recentBorrows" style="width: 100%">
        <el-table-column prop="bookTitle" label="图书名称" min-width="200" />
        <el-table-column prop="readerName" label="借阅人" width="120" />
        <el-table-column prop="borrowDate" label="借阅日期" width="120" />
        <el-table-column prop="dueDate" label="应还日期" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBookStore } from '../store/book'
import { useReaderStore } from '../store/reader'
import { useBorrowStore } from '../store/borrow'
import * as echarts from 'echarts'

const bookStore = useBookStore()
const readerStore = useReaderStore()
const borrowStore = useBorrowStore()

const trendChartRef = ref(null)
const categoryChartRef = ref(null)
const trendDays = ref(30)

// 统计数据
const stats = computed(() => [
  {
    title: '图书总数',
    value: bookStore.books.length,
    icon: 'Reading',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    trend: 12.5
  },
  {
    title: '读者总数',
    value: readerStore.readers.length,
    icon: 'User',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    trend: 8.3
  },
  {
    title: '借阅中',
    value: borrowStore.getBorrows({ status: 'borrowing' }).length,
    icon: 'Document',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    trend: -3.2
  },
  {
    title: '今日借阅',
    value: borrowStore.getBorrows({ 
      startDate: new Date().toISOString().split('T')[0] 
    }).length,
    icon: 'TrendCharts',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    trend: 15.7
  }
])

// 热门图书
const popularBooks = computed(() => {
  return bookStore.getPopularBooks(10)
})

// 最近借阅
const recentBorrows = computed(() => {
  return borrowStore.getBorrows()
    .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
    .slice(0, 8)
})

const getStatusType = (status) => {
  const types = {
    borrowing: 'primary',
    returned: 'success',
    overdue: 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    borrowing: '借阅中',
    returned: '已归还',
    overdue: '已逾期'
  }
  return texts[status] || '未知'
}

// 更新趋势数据
const updateTrendData = () => {
  const trendData = borrowStore.getBorrowTrend(trendDays.value)
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
        type: 'shadow'
      }
    },
    legend: {
      data: ['借阅', '归还'],
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
        name: '借阅',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.borrow),
        itemStyle: {
          color: '#3498db'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(52, 152, 219, 0.3)' },
            { offset: 1, color: 'rgba(52, 152, 219, 0.05)' }
          ])
        }
      },
      {
        name: '归还',
        type: 'line',
        smooth: true,
        data: trendData.map(d => d.return),
        itemStyle: {
          color: '#27ae60'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(39, 174, 96, 0.3)' },
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
      top: 'center',
      icon: 'circle'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
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
            fontSize: 16,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: categoryData,
        color: [
          '#667eea',
          '#764ba2',
          '#f093fb',
          '#f5576c',
          '#4facfe',
          '#00f2fe',
          '#43e97b',
          '#38f9d7'
        ]
      }
    ]
  }
  
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

onMounted(() => {
  updateTrendData()
  initCategoryChart()
})
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.6s ease;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  animation: slideIn 0.5s ease-out backwards;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
}

.stat-trend.up {
  color: var(--success-color);
}

.stat-trend.down {
  color: var(--danger-color);
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

.chart-card {
  animation: fadeIn 0.6s ease 0.2s backwards;
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
  height: 300px;
  width: 100%;
}

.popular-books-card,
.recent-borrows-card {
  animation: fadeIn 0.6s ease 0.4s backwards;
  margin-bottom: 30px;
}

.popular-books-list {
  display: grid;
  gap: 16px;
}

.book-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  transition: all 0.3s ease;
  animation: slideIn 0.5s ease-out backwards;
}

.book-item:hover {
  background: #e8f4f8;
  transform: translateX(4px);
}

.book-rank {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.book-rank.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

.book-rank.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  color: #fff;
}

.book-rank.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #e5a85c 100%);
  color: #fff;
}

.book-info {
  flex: 1;
  min-width: 0;
}

.book-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-meta {
  font-size: 13px;
  color: var(--text-secondary);
}

.book-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
}

.stat-item .el-icon {
  font-size: 16px;
}
</style>
