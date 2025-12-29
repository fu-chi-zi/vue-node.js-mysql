<template>
  <div class="books-page">
    <div class="books-container">
      <!-- 左侧筛选栏 -->
      <aside class="filter-sidebar">
        <div class="filter-section">
          <h3 class="filter-title">内容分类</h3>
          
          <div class="category-list">
            <div 
              v-for="category in categories"
              :key="category"
              :class="['category-item', { active: selectedCategory === category }]"
              @click="handleCategoryChange(category)"
            >
              {{ category }}
            </div>
          </div>
        </div>

        <div class="filter-section">
          <div class="search-input">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索"
              :prefix-icon="Search"
              clearable
            />
          </div>
          
          <el-button 
            type="primary" 
            class="search-btn"
            :icon="Search"
            @click="handleSearch"
          >
            搜索
          </el-button>

          <el-button 
            class="reset-btn"
            @click="handleReset"
          >
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </aside>

      <!-- 右侧内容区 -->
      <main class="books-main">
        <!-- 头部操作栏 -->
        <div class="books-header">
          <h2 class="books-title">图书列表</h2>
          <div class="header-actions">
            <span class="book-count">共 {{ pagination.total }} 本图书</span>
            <el-button type="primary" :icon="Plus" @click="handleAdd">
              添加图书
            </el-button>
          </div>
        </div>

        <!-- 图书卡片网格 -->
        <div v-loading="loading" class="books-grid">
          <div 
            v-for="book in bookList" 
            :key="book.id" 
            class="book-card"
            @click="handleView(book)"
          >
            <div class="book-cover">
              <img 
                :src="book.cover || 'https://via.placeholder.com/200x280/667eea/ffffff?text=' + encodeURIComponent(book.title)" 
                :alt="book.title"
              />
              <div class="book-overlay">
                <el-button 
                  type="primary" 
                  size="small" 
                  circle 
                  :icon="View"
                  @click.stop="handleView(book)"
                />
                <el-button 
                  type="success" 
                  size="small" 
                  circle 
                  :icon="Edit"
                  @click.stop="handleEdit(book)"
                />
                <el-button 
                  type="danger" 
                  size="small" 
                  circle 
                  :icon="Delete"
                  @click.stop="handleDelete(book)"
                />
              </div>
            </div>
            
            <div class="book-info">
              <h4 class="book-title">{{ book.title }}</h4>
              <p class="book-author">{{ book.author }}</p>
              <div class="book-meta">
                <el-tag size="small" type="primary">{{ book.category }}</el-tag>
                <el-tag 
                  size="small" 
                  :type="book.status === 'available' ? 'success' : 'warning'"
                >
                  {{ book.status === 'available' ? '可借阅' : '已借出' }}
                </el-tag>
              </div>
              <div class="book-stats">
                <span><el-icon><Reading /></el-icon> {{ book.borrowCount }}次</span>
                <span><el-icon><Box /></el-icon> 库存 {{ book.stock }}</span>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="!loading && bookList.length === 0" class="empty-state">
            <el-empty description="暂无图书数据" />
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            :page-sizes="[12, 24, 48]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </main>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="ISBN" prop="isbn">
              <el-input v-model="formData.isbn" placeholder="请输入ISBN" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="书名" prop="title">
              <el-input v-model="formData.title" placeholder="请输入书名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="作者" prop="author">
              <el-input v-model="formData.author" placeholder="请输入作者" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%">
                <el-option
                  v-for="category in categories.slice(1)"
                  :key="category"
                  :label="category"
                  :value="category"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出版社" prop="publisher">
              <el-input v-model="formData.publisher" placeholder="请输入出版社" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出版日期" prop="publishDate">
              <el-date-picker
                v-model="formData.publishDate"
                type="date"
                placeholder="请选择出版日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number
                v-model="formData.price"
                :min="0"
                :precision="2"
                :controls="false"
                style="width: 100%"
                placeholder="请输入价格"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number
                v-model="formData.stock"
                :min="0"
                :controls="false"
                style="width: 100%"
                placeholder="请输入库存"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="位置" prop="location">
              <el-input v-model="formData.location" placeholder="例如：A区-5架" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="封面图片">
              <el-input v-model="formData.cover" placeholder="请输入图片URL（可选）" />
            </el-form-item>
          </el-col>
        </el-row>

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
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="图书详情"
      width="800px"
    >
      <div v-if="currentBook" class="book-detail">
        <div class="detail-content">
          <div class="detail-cover">
            <img 
              :src="currentBook.cover || 'https://via.placeholder.com/300x420/667eea/ffffff?text=' + encodeURIComponent(currentBook.title)" 
              :alt="currentBook.title"
            />
          </div>
          <div class="detail-info">
            <h2>{{ currentBook.title }}</h2>
            <p class="detail-author">作者：{{ currentBook.author }}</p>
            
            <el-descriptions :column="1" border>
              <el-descriptions-item label="ISBN">{{ currentBook.isbn }}</el-descriptions-item>
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
            </el-descriptions>

            <div class="detail-description">
              <h4>简介</h4>
              <p>{{ currentBook.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, View, Edit, Delete, Refresh, Reading, Box } from '@element-plus/icons-vue'
// 🔧 修复：使用 Store 替代 API（如果还没创建 API 文件）
import { useBookStore } from '../store/book'

// 使用 Store
const bookStore = useBookStore()

const loading = ref(false)
const submitLoading = ref(false)
const searchKeyword = ref('')
const selectedCategory = ref('全部')
const dialogVisible = ref(false)
const detailVisible = ref(false)
const formRef = ref(null)
const currentBook = ref(null)
const isEdit = ref(false)

const categories = ['全部', '童书', '小说', '文学', '艺术', '历史', '科学', '计算机', '经济', '心理学']

// 分页信息
const pagination = ref({
  page: 1,
  size: 12,
  total: 0
})

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
  cover: '',
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

// 使用 Store 获取图书列表
const bookList = computed(() => {
  let books = bookStore.getBooks({
    keyword: searchKeyword.value,
    category: selectedCategory.value === '全部' ? '' : selectedCategory.value
  })
  
  // 分页处理
  const start = (pagination.value.page - 1) * pagination.value.size
  const end = start + pagination.value.size
  pagination.value.total = books.length
  
  return books.slice(start, end)
})

// 分类切换
const handleCategoryChange = (category) => {
  selectedCategory.value = category
  pagination.value.page = 1
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
}

// 重置
const handleReset = () => {
  searchKeyword.value = ''
  selectedCategory.value = '全部'
  pagination.value.page = 1
}

// 分页
const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.page = 1
}

const handlePageChange = (page) => {
  pagination.value.page = page
}

// 添加图书
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
    cover: '',
    description: ''
  }
  dialogVisible.value = true
}

// 编辑图书
const handleEdit = (row) => {
  isEdit.value = true
  currentBook.value = row
  formData.value = { ...row }
  dialogVisible.value = true
}

// 查看详情
const handleView = (row) => {
  currentBook.value = row
  detailVisible.value = true
}

// 删除图书
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

// 提交表单
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

onMounted(() => {
  // 初始化数据已在 computed 中处理
})
</script>

<style scoped>
.books-page {
  animation: fadeIn 0.6s ease;
}

.books-container {
  display: flex;
  gap: 24px;
  height: calc(100vh - 140px);
}

/* 左侧筛选栏 */
.filter-sidebar {
  width: 280px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: #5a5e66;
  font-size: 14px;
}

.category-item:hover {
  background: #f5f7fa;
  color: #409eff;
}

.category-item.active {
  background: #2c3e50;
  color: white;
  font-weight: 500;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-input {
  margin-bottom: 8px;
}

.search-btn {
  width: 100%;
}

.reset-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* 右侧内容区 */
.books-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.books-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.books-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.book-count {
  color: #909399;
  font-size: 14px;
}

/* 图书网格 */
.books-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
  padding: 4px;
}

.book-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.5s ease;
}

.book-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.book-cover {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.book-card:hover .book-cover img {
  transform: scale(1.05);
}

.book-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.book-card:hover .book-overlay {
  opacity: 1;
}

.book-info {
  padding: 16px;
}

.book-title {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.book-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.book-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* 分页 */
.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  padding: 20px 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 详情对话框 */
.book-detail {
  padding: 20px 0;
}

.detail-content {
  display: flex;
  gap: 32px;
}

.detail-cover {
  flex-shrink: 0;
  width: 300px;
  height: 420px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.detail-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-info {
  flex: 1;
}

.detail-info h2 {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.detail-author {
  font-size: 16px;
  color: #909399;
  margin-bottom: 24px;
}

.detail-description {
  margin-top: 24px;
}

.detail-description h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.detail-description p {
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 1200px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .books-container {
    flex-direction: column;
    height: auto;
  }
  
  .filter-sidebar {
    width: 100%;
  }
  
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }
  
  .detail-content {
    flex-direction: column;
  }
  
  .detail-cover {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }
}
</style>