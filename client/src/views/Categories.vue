<template>
  <div class="categories-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>
      </template>

      <el-table :data="categoryList" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="book_count" label="书籍数量" width="120" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
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
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="categoryForm.description"
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getCategoriesList, addCategory, updateCategory, deleteCategory } from '../api/categories'

const loading = ref(false)
const submitLoading = ref(false)
const categoryList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增分类')
const categoryFormRef = ref(null)
const isEdit = ref(false)
const currentCategoryId = ref(null)

const categoryForm = reactive({
  name: '',
  description: ''
})

const categoryRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await getCategoriesList()
    categoryList.value = res.data
  } catch (error) {
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增分类'
  dialogVisible.value = true
  resetCategoryForm()
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑分类'
  currentCategoryId.value = row.id
  Object.assign(categoryForm, {
    name: row.name,
    description: row.description || ''
  })
  dialogVisible.value = true
}

const handleDelete = (row) => {
  if (row.book_count > 0) {
    ElMessage.warning('该分类下还有书籍，无法删除')
    return
  }
  
  ElMessageBox.confirm('确定要删除这个分类吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCategory(row.id)
      ElMessage.success('删除成功')
      fetchCategories()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!categoryFormRef.value) return
  
  await categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          await updateCategory(currentCategoryId.value, categoryForm)
          ElMessage.success('更新成功')
        } else {
          await addCategory(categoryForm)
          ElMessage.success('添加成功')
        }
        
        dialogVisible.value = false
        fetchCategories()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDialogClose = () => {
  resetCategoryForm()
  categoryFormRef.value?.resetFields()
}

const resetCategoryForm = () => {
  Object.assign(categoryForm, {
    name: '',
    description: ''
  })
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.categories-container {
  background: #fff;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

