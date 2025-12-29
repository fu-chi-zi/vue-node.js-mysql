<template>
  <div class="borrows-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索图书、读者名称或卡号"
          :prefix-icon="Search"
          size="large"
          clearable
          @input="handleSearch"
        />
        <el-select
          v-model="filterStatus"
          placeholder="借阅状态"
          size="large"
          clearable
          @change="handleSearch"
        >
          <el-option label="借阅中" value="borrowing" />
          <el-option label="已归还" value="returned" />
          <el-option label="已逾期" value="overdue" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="large"
          value-format="YYYY-MM-DD"
          @change="handleSearch"
        />
      </div>
      <el-button type="primary" size="large" :icon="Plus" @click="handleAdd">
        新增借阅
      </el-button>
    </div>

    <!-- 借阅列表 -->
    <el-card class="table-card">
      <el-table :data="filteredBorrows" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="借阅ID" width="100" />
        <el-table-column prop="bookTitle" label="图书名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="bookAuthor" label="作者" width="120" />
        <el-table-column prop="readerName" label="借阅人" width="100" />
        <el-table-column prop="readerCard" label="读者卡号" width="120" />
        <el-table-column prop="borrowDate" label="借阅日期" width="120" />
        <el-table-column prop="dueDate" label="应还日期" width="120" />
        <el-table-column prop="returnDate" label="归还日期" width="120">
          <template #default="{ row }">
            {{ row.returnDate || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="renewCount" label="续借次数" width="100" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'borrowing'"
              text
              type="success"
              size="small"
              @click="handleReturn(row)"
            >
              归还
            </el-button>
            <el-button
              v-if="row.status === 'borrowing' && row.renewCount < 2"
              text
              type="primary"
              size="small"
              @click="handleRenew(row)"
            >
              续借
            </el-button>
            <el-button text type="primary" size="small" @click="handleView(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增借阅对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="新增借阅"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="选择图书" prop="bookId">
          <el-select
            v-model="formData.bookId"
            placeholder="请选择图书"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="book in availableBooks"
              :key="book.id"
              :label="`${book.title} - ${book.author}`"
              :value="book.id"
            >
              <div class="book-option">
                <span>{{ book.title }}</span>
                <span class="book-stock">库存: {{ book.stock }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择读者" prop="readerId">
          <el-select
            v-model="formData.readerId"
            placeholder="请选择读者"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="reader in activeReaders"
              :key="reader.id"
              :label="`${reader.name} (${reader.cardNumber})`"
              :value="reader.id"
            >
              <div class="reader-option">
                <span>{{ reader.name }} - {{ reader.cardNumber }}</span>
                <span class="reader-borrow">{{ reader.currentBorrow }}/{{ reader.maxBorrow }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="formData.note"
            type="textarea"
            :rows="3"
            placeholder="请输入备注（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="借阅详情"
      width="600px"
    >
      <div v-if="currentBorrow" class="borrow-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="借阅ID">{{ currentBorrow.id }}</el-descriptions-item>
          <el-descriptions-item label="图书名称">{{ currentBorrow.bookTitle }}</el-descriptions-item>
          <el-descriptions-item label="作者">{{ currentBorrow.bookAuthor }}</el-descriptions-item>
          <el-descriptions-item label="读者姓名">{{ currentBorrow.readerName }}</el-descriptions-item>
          <el-descriptions-item label="读者卡号">{{ currentBorrow.readerCard }}</el-descriptions-item>
          <el-descriptions-item label="借阅日期">{{ currentBorrow.borrowDate }}</el-descriptions-item>
          <el-descriptions-item label="应还日期">{{ currentBorrow.dueDate }}</el-descriptions-item>
          <el-descriptions-item label="归还日期">{{ currentBorrow.returnDate || '未归还' }}</el-descriptions-item>
          <el-descriptions-item label="续借次数">{{ currentBorrow.renewCount }}</el-descriptions-item>
          <el-descriptions-item label="罚款金额">¥{{ currentBorrow.fine }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentBorrow.status)">
              {{ getStatusText(currentBorrow.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ currentBorrow.note || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBookStore } from '../store/book'
import { useReaderStore } from '../store/reader'
import { useBorrowStore } from '../store/borrow'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

const bookStore = useBookStore()
const readerStore = useReaderStore()
const borrowStore = useBorrowStore()

const loading = ref(false)
const searchKeyword = ref('')
const filterStatus = ref('')
const dateRange = ref([])
const dialogVisible = ref(false)
const detailVisible = ref(false)
const formRef = ref(null)
const currentBorrow = ref(null)

const formData = ref({
  bookId: null,
  readerId: null,
  note: ''
})

const rules = {
  bookId: [{ required: true, message: '请选择图书', trigger: 'change' }],
  readerId: [{ required: true, message: '请选择读者', trigger: 'change' }]
}

// 可借阅的图书（库存>0）
const availableBooks = computed(() => {
  return bookStore.books.filter(book => book.stock > 0)
})

// 活跃的读者
const activeReaders = computed(() => {
  return readerStore.readers.filter(reader => 
    reader.status === 'active' && reader.currentBorrow < reader.maxBorrow
  )
})

const filteredBorrows = computed(() => {
  let params = {
    keyword: searchKeyword.value,
    status: filterStatus.value
  }
  
  if (dateRange.value && dateRange.value.length === 2) {
    params.startDate = dateRange.value[0]
    params.endDate = dateRange.value[1]
  }
  
  return borrowStore.getBorrows(params)
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

const handleSearch = () => {
  // 搜索在computed中自动处理
}

const handleAdd = () => {
  formData.value = {
    bookId: null,
    readerId: null,
    note: ''
  }
  dialogVisible.value = true
}

const handleView = (row) => {
  currentBorrow.value = row
  detailVisible.value = true
}

const handleReturn = (row) => {
  ElMessageBox.confirm('确定要归还这本图书吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const result = borrowStore.returnBook(row.id)
    if (result) {
      if (result.fine > 0) {
        ElMessage.warning(`归还成功，逾期罚款：¥${result.fine}`)
      } else {
        ElMessage.success('归还成功')
      }
    }
  }).catch(() => {})
}

const handleRenew = (row) => {
  ElMessageBox.confirm('确定要续借这本图书吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    try {
      borrowStore.renewBorrow(row.id)
      ElMessage.success('续借成功，借期延长30天')
    } catch (error) {
      ElMessage.error(error.message)
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      borrowStore.createBorrow(formData.value)
      ElMessage.success('借阅成功')
      dialogVisible.value = false
    }
  })
}

onMounted(async () => {
  // 加载借阅数据
  await borrowStore.fetchBorrows()
})
</script>

<style scoped>
.borrows-page {
  animation: fadeIn 0.6s ease;
}

.page-header {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
}

.search-bar {
  flex: 1;
  display: flex;
  gap: 12px;
}

.search-bar .el-input {
  flex: 2;
}

.search-bar .el-select,
.search-bar .el-date-picker {
  flex: 1;
}

.table-card {
  animation: fadeIn 0.6s ease 0.2s backwards;
}

.book-option,
.reader-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.book-stock,
.reader-borrow {
  font-size: 12px;
  color: var(--text-secondary);
}

.borrow-detail {
  padding: 20px 0;
}
</style>
