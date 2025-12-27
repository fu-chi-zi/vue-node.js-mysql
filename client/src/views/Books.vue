<template>
  <div class="books-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>书籍管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增书籍
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="书名/作者/ISBN"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="分类">
            <el-select
              v-model="searchForm.categoryId"
              placeholder="请选择分类"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="cat in categories"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作栏 -->
      <div class="toolbar" v-if="selectedBooks.length > 0">
        <el-button type="danger" @click="handleBatchDelete">
          批量删除 ({{ selectedBooks.length }})
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table
        :data="bookList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="封面" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.cover"
              :src="getImageUrl(row.cover)"
              style="width: 60px; height: 80px; object-fit: cover"
              fit="cover"
            />
            <span v-else>无封面</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="书名" min-width="150" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="publisher" label="出版社" width="120" />
        <el-table-column prop="publish_date" label="出版日期" width="120" />
        <el-table-column prop="isbn" label="ISBN" width="150" />
        <el-table-column prop="category_name" label="分类" width="100" />
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'available' ? 'success' : 'danger'">
              {{ row.status === 'available' ? '可借' : '不可借' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="bookFormRef"
        :model="bookForm"
        :rules="bookRules"
        label-width="100px"
      >
        <el-form-item label="书名" prop="title">
          <el-input v-model="bookForm.title" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="bookForm.author" />
        </el-form-item>
        <el-form-item label="出版社" prop="publisher">
          <el-input v-model="bookForm.publisher" />
        </el-form-item>
        <el-form-item label="出版日期" prop="publishDate">
          <el-date-picker
            v-model="bookForm.publishDate"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="ISBN" prop="isbn">
          <el-input v-model="bookForm.isbn" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="bookForm.categoryId" style="width: 100%">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="bookForm.stock" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="bookForm.status" style="width: 100%">
            <el-option label="可借" value="available" />
            <el-option label="不可借" value="unavailable" />
          </el-select>
        </el-form-item>
        <el-form-item label="封面">
          <el-upload
            class="cover-uploader"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleCoverChange"
            :before-upload="beforeCoverUpload"
          >
            <img v-if="bookForm.cover || coverFile" :src="coverFile ? URL.createObjectURL(coverFile) : getImageUrl(bookForm.cover)" class="cover-image" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="bookForm.description"
            type="textarea"
            :rows="4"
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getBooksList, addBook, updateBook, deleteBook, batchDeleteBooks } from '../api/books'
import { getCategoriesList } from '../api/categories'
import { useAuthStore } from '../store/auth'

const authStore = useAuthStore()
const loading = ref(false)
const submitLoading = ref(false)
const bookList = ref([])
const categories = ref([])
const selectedBooks = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增书籍')
const bookFormRef = ref(null)
const isEdit = ref(false)
const currentBookId = ref(null)

const searchForm = reactive({
  keyword: '',
  categoryId: null
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const bookForm = reactive({
  title: '',
  author: '',
  publisher: '',
  publishDate: '',
  isbn: '',
  categoryId: null,
  stock: 0,
  status: 'available',
  cover: '',
  coverFile: null,
  description: ''
})

const bookRules = {
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  publisher: [{ required: true, message: '请输入出版社', trigger: 'blur' }],
  isbn: [{ required: true, message: '请输入ISBN', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

const coverFile = ref(null)

const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `http://localhost:3000${path}`
}

const fetchBooks = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const res = await getBooksList(params)
    bookList.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    ElMessage.error('获取书籍列表失败')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const res = await getCategoriesList()
    categories.value = res.data
  } catch (error) {
    ElMessage.error('获取分类列表失败')
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchBooks()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.categoryId = null
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增书籍'
  dialogVisible.value = true
  resetBookForm()
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑书籍'
  currentBookId.value = row.id
  Object.assign(bookForm, {
    title: row.title,
    author: row.author,
    publisher: row.publisher,
    publishDate: row.publish_date || '',
    isbn: row.isbn,
    categoryId: row.category_id,
    stock: row.stock,
    status: row.status,
    cover: row.cover || '',
    coverFile: null,
    description: row.description || ''
  })
  coverFile.value = null
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这本书吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteBook(row.id)
      ElMessage.success('删除成功')
      fetchBooks()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedBooks.value.length} 本书吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedBooks.value.map(book => book.id)
      await batchDeleteBooks(ids)
      ElMessage.success('批量删除成功')
      selectedBooks.value = []
      fetchBooks()
    } catch (error) {
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {})
}

const handleSelectionChange = (selection) => {
  selectedBooks.value = selection
}

const handlePageChange = () => {
  fetchBooks()
}

const handleSizeChange = () => {
  pagination.page = 1
  fetchBooks()
}

const handleSubmit = async () => {
  if (!bookFormRef.value) return
  
  await bookFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const formData = new FormData()
        // 添加表单字段
        formData.append('title', bookForm.title)
        formData.append('author', bookForm.author)
        formData.append('publisher', bookForm.publisher)
        if (bookForm.publishDate) formData.append('publishDate', bookForm.publishDate)
        formData.append('isbn', bookForm.isbn)
        formData.append('categoryId', bookForm.categoryId)
        formData.append('stock', bookForm.stock)
        formData.append('status', bookForm.status)
        if (bookForm.description) formData.append('description', bookForm.description)
        
        // 如果有新上传的封面文件，添加到formData
        if (coverFile.value) {
          formData.append('cover', coverFile.value)
        }

        if (isEdit.value) {
          await updateBook(currentBookId.value, formData)
          ElMessage.success('更新成功')
        } else {
          await addBook(formData)
          ElMessage.success('添加成功')
        }
        
        dialogVisible.value = false
        fetchBooks()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDialogClose = () => {
  resetBookForm()
  bookFormRef.value?.resetFields()
}

const resetBookForm = () => {
  Object.assign(bookForm, {
    title: '',
    author: '',
    publisher: '',
    publishDate: '',
    isbn: '',
    categoryId: null,
    stock: 0,
    status: 'available',
    cover: '',
    coverFile: null,
    description: ''
  })
  coverFile.value = null
}

const handleCoverChange = (file) => {
  coverFile.value = file.raw
}

const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

onMounted(() => {
  fetchBooks()
  fetchCategories()
})
</script>

<style scoped>
.books-container {
  background: #fff;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.toolbar {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.cover-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
  }

  :deep(.el-upload:hover) {
    border-color: #409eff;
  }
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.cover-image {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}
</style>

