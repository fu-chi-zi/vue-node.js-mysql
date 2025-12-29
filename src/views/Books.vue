<template>
  <div class="books-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索图书名称、作者或ISBN"
          :prefix-icon="Search"
          size="large"
          clearable
          @input="handleSearch"
        />
        <el-select
          v-model="filterCategory"
          placeholder="图书分类"
          size="large"
          clearable
          @change="handleSearch"
        >
          <el-option
            v-for="category in categories"
            :key="category"
            :label="category"
            :value="category"
          />
        </el-select>
        <el-select
          v-model="filterStatus"
          placeholder="图书状态"
          size="large"
          clearable
          @change="handleSearch"
        >
          <el-option label="可借阅" value="available" />
          <el-option label="已借出" value="borrowed" />
        </el-select>
      </div>
      <el-button type="primary" size="large" :icon="Plus" @click="handleAdd">
        添加图书
      </el-button>
    </div>

    <!-- 图书列表 -->
    <el-card class="table-card">
      <el-table
        :data="filteredBooks"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="isbn" label="ISBN" width="150" />
        <el-table-column prop="title" label="书名" min-width="200" show-overflow-tooltip />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publisher" label="出版社" width="150" show-overflow-tooltip />
        <el-table-column prop="publishDate" label="出版日期" width="120" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="location" label="位置" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'available' ? 'success' : 'warning'">
              {{ row.status === 'available' ? '可借阅' : '已借出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="handleView(row)">
              详情
            </el-button>
            <el-button text type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button text type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="ISBN" prop="isbn">
          <el-input v-model="formData.isbn" placeholder="请输入ISBN" />
        </el-form-item>
        <el-form-item label="书名" prop="title">
          <el-input v-model="formData.title" placeholder="请输入书名" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="formData.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="出版社" prop="publisher">
          <el-input v-model="formData.publisher" placeholder="请输入出版社" />
        </el-form-item>
        <el-form-item label="出版日期" prop="publishDate">
          <el-date-picker
            v-model="formData.publishDate"
            type="date"
            placeholder="请选择出版日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="formData.price"
            :min="0"
            :precision="2"
            :controls="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number
            v-model="formData.stock"
            :min="0"
            :controls="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="位置" prop="location">
          <el-input v-model="formData.location" placeholder="例如：A区-5架" />
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入图书简介"
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
      title="图书详情"
      width="600px"
    >
      <div v-if="currentBook" class="book-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ISBN">{{ currentBook.isbn }}</el-descriptions-item>
          <el-descriptions-item label="书名">{{ currentBook.title }}</el-descriptions-item>
          <el-descriptions-item label="作者">{{ currentBook.author }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ currentBook.category }}</el-descriptions-item>
          <el-descriptions-item label="出版社">{{ currentBook.publisher }}</el-descriptions-item>
          <el-descriptions-item label="出版日期">{{ currentBook.publishDate }}</el-descriptions-item>
          <el-descriptions-item label="价格">¥{{ currentBook.price }}</el-descriptions-item>
          <el-descriptions-item label="库存">{{ currentBook.stock }}</el-descriptions-item>
          <el-descriptions-item label="位置">{{ currentBook.location }}</el-descriptions-item>
          <el-descriptions-item label="借阅次数">{{ currentBook.borrowCount }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentBook.status === 'available' ? 'success' : 'warning'">
              {{ currentBook.status === 'available' ? '可借阅' : '已借出' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="简介" :span="2">
            {{ currentBook.description }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBookStore } from '../store/book'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

const bookStore = useBookStore()

const loading = ref(false)
const searchKeyword = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const dialogVisible = ref(false)
const detailVisible = ref(false)
const formRef = ref(null)
const currentBook = ref(null)
const isEdit = ref(false)

const categories = ['文学', '历史', '科学', '艺术', '哲学', '计算机', '经济', '心理学']

const formData = ref({
  isbn: '',
  title: '',
  author: '',
  category: '',
  publisher: '',
  publishDate: '',
  price: 0,
  stock: 0,
  location: '',
  description: ''
})

const rules = {
  isbn: [{ required: true, message: '请输入ISBN', trigger: 'blur' }],
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  publisher: [{ required: true, message: '请输入出版社', trigger: 'blur' }],
  publishDate: [{ required: true, message: '请选择出版日期', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  location: [{ required: true, message: '请输入位置', trigger: 'blur' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑图书' : '添加图书')

const filteredBooks = computed(() => {
  return bookStore.getBooks({
    keyword: searchKeyword.value,
    category: filterCategory.value,
    status: filterStatus.value
  })
})

const handleSearch = () => {
  // 搜索在computed中自动处理
}

const handleAdd = () => {
  isEdit.value = false
  formData.value = {
    isbn: '',
    title: '',
    author: '',
    category: '',
    publisher: '',
    publishDate: '',
    price: 0,
    stock: 0,
    location: '',
    description: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentBook.value = row
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleView = (row) => {
  currentBook.value = row
  detailVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这本图书吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    bookStore.deleteBook(row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        bookStore.updateBook(currentBook.value.id, formData.value)
        ElMessage.success('更新成功')
      } else {
        bookStore.addBook(formData.value)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped>
.books-page {
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

.search-bar .el-select {
  flex: 1;
}

.table-card {
  animation: fadeIn 0.6s ease 0.2s backwards;
}

.book-detail {
  padding: 20px 0;
}
</style>
