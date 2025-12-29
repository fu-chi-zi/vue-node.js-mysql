<template>
  <div class="books-page">
    <div class="books-container">
      <!-- 左侧筛选栏 -->
      <aside class="filter-sidebar">
        <div class="filter-section">
          <h3 class="filter-title">内容分类</h3>
          
          <div class="category-list">
            <div 
              v-for="category in categoriesWithCount"
              :key="category.name"
              :class="['category-item', { active: selectedCategory === category.name }]"
              @click="handleCategoryChange(category.name)"
            >
              <span class="category-name">{{ category.name }}</span>
              <span v-if="category.count > 0" class="category-count">{{ category.count }}</span>
            </div>
          </div>
        </div>

        <div class="filter-section">
          <div class="search-input">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索书名、作者、ISBN"
              :prefix-icon="Search"
              clearable
              @keyup.enter="handleSearch"
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
            class="book-card-wrapper"
          >
            <!-- 书籍卡片 -->
            <div class="book-card">
              <div class="book-cover">
                <img 
                  :src="getBookCover(book)" 
                  :alt="book.title"
                  @error="handleImageError"
                />
              </div>
              
              <div class="book-content">
                <div class="book-info">
                  <h4 class="book-title" :title="book.title">{{ book.title }}</h4>
                  <p class="book-author">{{ book.author }}</p>
                  
                  <div class="book-tags">
                    <el-tag size="small" type="primary">{{ book.category }}</el-tag>
                    <el-tag 
                      size="small" 
                      :type="book.status === 'available' ? 'success' : 'warning'"
                    >
                      {{ book.status === 'available' ? '可借阅' : '已借出' }}
                    </el-tag>
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

                <div class="book-actions">
                  <el-button 
                    type="primary" 
                    size="small" 
                    :icon="View"
                    @click="toggleDetail(book.id)"
                  >
                    {{ expandedBookId === book.id ? '收起' : '详情' }}
                  </el-button>
                  <el-button 
                    type="success" 
                    size="small" 
                    :icon="Edit"
                    @click="handleEdit(book)"
                  >
                    编辑
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small" 
                    :icon="Delete"
                    @click="handleDelete(book)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 展开的详情区域 -->
            <transition name="expand">
              <div v-if="expandedBookId === book.id" class="book-detail-expand">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="ISBN">{{ book.isbn }}</el-descriptions-item>
                  <el-descriptions-item label="出版社">{{ book.publisher }}</el-descriptions-item>
                  <el-descriptions-item label="出版日期">{{ book.publishDate }}</el-descriptions-item>
                  <el-descriptions-item label="价格">¥{{ book.price }}</el-descriptions-item>
                  <el-descriptions-item label="位置">{{ book.location }}</el-descriptions-item>
                  <el-descriptions-item label="借阅次数">{{ book.borrowCount }}次</el-descriptions-item>
                  <el-descriptions-item label="简介" :span="2">
                    {{ book.description || '暂无简介' }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </transition>
          </div>

          <!-- 空状态 -->
          <div v-if="!loading && bookList.length === 0" class="empty-state">
            <div class="empty-content">
              <div class="empty-icon">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <rect x="40" y="30" width="120" height="160" rx="8" fill="#e8eaed"/>
                  <rect x="50" y="40" width="100" height="120" rx="4" fill="#fff"/>
                  <line x1="60" y1="60" x2="140" y2="60" stroke="#ccc" stroke-width="3"/>
                  <line x1="60" y1="80" x2="140" y2="80" stroke="#ccc" stroke-width="3"/>
                  <line x1="60" y1="100" x2="140" y2="100" stroke="#ccc" stroke-width="3"/>
                  <line x1="60" y1="120" x2="120" y2="120" stroke="#ccc" stroke-width="3"/>
                </svg>
              </div>
              <h3>暂无图书数据</h3>
              <p v-if="selectedCategory !== '全部'">当前分类下没有图书，试试其他分类吧</p>
              <p v-else-if="searchKeyword">未找到相关图书，试试其他关键词</p>
              <p v-else>还没有添加任何图书</p>
              <el-button 
                v-if="selectedCategory === '全部' && !searchKeyword" 
                type="primary" 
                :icon="Plus" 
                @click="handleAdd"
                style="margin-top: 16px"
              >
                添加第一本图书
              </el-button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="bookList.length > 0 || pagination.total > 0" class="pagination-wrapper">
          <el-pagination
            :page-sizes="[10, 20, 30, 50]"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, View, Edit, Delete, Refresh, Reading, Box } from '@element-plus/icons-vue'
import { useBookStore } from '../store/book'

// 使用 Store
const bookStore = useBookStore()

const loading = ref(false)
const submitLoading = ref(false)
const searchKeyword = ref('')
const selectedCategory = ref('全部')
const dialogVisible = ref(false)
const formRef = ref(null)
const currentBook = ref(null)
const isEdit = ref(false)
const expandedBookId = ref(null)

const categories = ['全部', '童书', '小说', '文学', '艺术', '历史', '科学', '计算机', '经济', '心理学']

// 分页信息
const pagination = ref({
  page: 1,
  size: 10,
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

// 计算每个分类的图书数量
const categoriesWithCount = computed(() => {
  const allBooks = bookStore.getBooks({
    keyword: searchKeyword.value
  })
  
  return categories.map(category => {
    if (category === '全部') {
      return {
        name: category,
        count: allBooks.length
      }
    }
    
    const count = allBooks.filter(book => book.category === category).length
    return {
      name: category,
      count
    }
  })
})

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

// 生成图书封面
const getBookCover = (book) => {
  if (book.cover && book.cover.trim()) {
    return book.cover
  }
  
  // 根据分类生成不同颜色的渐变背景
  const categoryColors = {
    '童书': ['FF6B9D', 'C44569'],
    '小说': ['667EEA', '764BA2'],
    '文学': ['F093FB', 'F5576C'],
    '艺术': ['4FACFE', '00F2FE'],
    '历史': ['43E97B', '38F9D7'],
    '科学': ['FA709A', 'FEE140'],
    '计算机': ['30CFD0', '330867'],
    '经济': ['A8EDEA', 'FED6E3'],
    '心理学': ['FFD26F', '3677FF']
  }
  
  const colors = categoryColors[book.category] || ['667EEA', '764BA2']
  const encodedTitle = encodeURIComponent(book.title.substring(0, 10))
  
  return `https://via.placeholder.com/200x280/${colors[0]}/${colors[1]}?text=${encodedTitle}`
}

// 图片加载失败处理
const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/200x280/667EEA/FFFFFF?text=No+Cover'
}

// 切换详情展开/收起
const toggleDetail = (bookId) => {
  if (expandedBookId.value === bookId) {
    expandedBookId.value = null
  } else {
    expandedBookId.value = bookId
  }
}

// 分类切换
const handleCategoryChange = (category) => {
  selectedCategory.value = category
  pagination.value.page = 1
  expandedBookId.value = null // 切换分类时收起详情
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  expandedBookId.value = null // 搜索时收起详情
}

// 重置
const handleReset = () => {
  searchKeyword.value = ''
  selectedCategory.value = '全部'
  pagination.value.page = 1
  expandedBookId.value = null
}

// 分页
const handleSizeChange = (size) => {
  pagination.value.size = size
  pagination.value.page = 1
  expandedBookId.value = null
}

const handlePageChange = (page) => {
  pagination.value.page = page
  expandedBookId.value = null
  // 滚动到顶部
  document.querySelector('.books-main')?.scrollTo({ top: 0, behavior: 'smooth' })
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

// 删除图书
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这本图书吗？此操作不可撤销。', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    bookStore.deleteBook(row.id)
    ElMessage.success('删除成功')
    expandedBookId.value = null
  }).catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      
      try {
        if (isEdit.value) {
          bookStore.updateBook(currentBook.value.id, formData.value)
          ElMessage.success('更新成功')
        } else {
          bookStore.addBook(formData.value)
          ElMessage.success('添加成功')
        }
        
        dialogVisible.value = false
      } catch (error) {
        ElMessage.error('操作失败，请重试')
      } finally {
        submitLoading.value = false
      }
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
  flex-shrink: 0;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #606266;
  font-size: 14px;
}

.category-item:hover {
  background: #f5f7fa;
}

.category-item.active {
  background: #2c3e50;
  color: white;
  font-weight: 500;
}

.category-name {
  flex: 1;
}

.category-count {
  min-width: 24px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.25);
  font-size: 12px;
  line-height: 20px;
  text-align: center;
  font-weight: 600;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-input {
  width: 100%;
}

.search-btn,
.reset-btn {
  width: 100%;
}

.reset-btn {
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
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.books-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8eaed;
}

.books-title {
  font-size: 20px;
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
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding: 4px;
}

.book-card-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0;
  animation: slideIn 0.5s ease;
}

.book-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  gap: 20px;
  padding: 16px;
}

.book-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.book-cover {
  flex-shrink: 0;
  width: 140px;
  height: 196px;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.book-info {
  flex: 1;
}

.book-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
}

.book-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.book-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.stat-item .el-icon {
  color: #909399;
}

.book-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

/* 展开的详情区域 */
.book-detail-expand {
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
  padding: 16px;
  margin-top: -12px;
  border: 1px solid #e8eaed;
  border-top: none;
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  width: 200px;
  height: 200px;
  margin: 0 auto 24px;
  opacity: 0.5;
}

.empty-content h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 8px;
}

.empty-content p {
  font-size: 14px;
  color: #909399;
  margin-bottom: 16px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 24px;
  margin-top: 16px;
  border-top: 1px solid #e8eaed;
}

/* 响应式 */
@media (max-width: 1200px) {
  .books-container {
    flex-direction: column;
    height: auto;
  }
  
  .filter-sidebar {
    width: 100%;
  }
  
  .category-list {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .category-item {
    flex: 0 0 auto;
  }
}

@media (max-width: 768px) {
  .book-card {
    flex-direction: column;
  }
  
  .book-cover {
    width: 100%;
    height: 240px;
  }
  
  .book-actions {
    flex-direction: column;
  }
  
  .book-actions .el-button {
    width: 100%;
  }
}
</style>