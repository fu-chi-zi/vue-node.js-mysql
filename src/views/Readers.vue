<template>
  <div class="readers-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索读者姓名、卡号或手机号"
          :prefix-icon="Search"
          size="large"
          clearable
          @input="handleSearch"
        />
        <el-select
          v-model="filterType"
          placeholder="会员类型"
          size="large"
          clearable
          @change="handleSearch"
        >
          <el-option label="学生" value="学生" />
          <el-option label="教师" value="教师" />
          <el-option label="普通会员" value="普通会员" />
          <el-option label="VIP会员" value="VIP会员" />
        </el-select>
        <el-select
          v-model="filterStatus"
          placeholder="账号状态"
          size="large"
          clearable
          @change="handleSearch"
        >
          <el-option label="正常" value="active" />
          <el-option label="禁用" value="inactive" />
        </el-select>
      </div>
      <el-button type="primary" size="large" :icon="Plus" @click="handleAdd">
        添加读者
      </el-button>
    </div>

    <!-- 读者列表 -->
    <el-card class="table-card">
      <el-table :data="filteredReaders" style="width: 100%" v-loading="loading">
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar" />
          </template>
        </el-table-column>
        <el-table-column prop="cardNumber" label="读者卡号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)" size="small">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="借阅信息" width="120">
          <template #default="{ row }">
            <span>{{ row.currentBorrow }}/{{ row.maxBorrow }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="joinDate" label="注册日期" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
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
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="formData.gender">
            <el-radio value="男">男</el-radio>
            <el-radio value="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="会员类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择会员类型" style="width: 100%">
            <el-option label="学生" value="学生" />
            <el-option label="教师" value="教师" />
            <el-option label="普通会员" value="普通会员" />
            <el-option label="VIP会员" value="VIP会员" />
          </el-select>
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="formData.idCard" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="入会日期" prop="joinDate">
          <el-date-picker
            v-model="formData.joinDate"
            type="date"
            placeholder="请选择入会日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="到期日期" prop="expireDate">
          <el-date-picker
            v-model="formData.expireDate"
            type="date"
            placeholder="请选择到期日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="最大借阅数" prop="maxBorrow">
          <el-input-number
            v-model="formData.maxBorrow"
            :min="1"
            :max="20"
            :controls="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="押金" prop="deposit">
          <el-input-number
            v-model="formData.deposit"
            :min="0"
            :precision="2"
            :controls="false"
            style="width: 100%"
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
      title="读者详情"
      width="600px"
    >
      <div v-if="currentReader" class="reader-detail">
        <div class="detail-header">
          <el-avatar :size="80" :src="currentReader.avatar" />
          <div class="detail-info">
            <h3>{{ currentReader.name }}</h3>
            <p>{{ currentReader.cardNumber }}</p>
          </div>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="性别">{{ currentReader.gender }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentReader.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱" :span="2">{{ currentReader.email }}</el-descriptions-item>
          <el-descriptions-item label="会员类型">{{ currentReader.type }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ currentReader.idCard }}</el-descriptions-item>
          <el-descriptions-item label="地址" :span="2">{{ currentReader.address }}</el-descriptions-item>
          <el-descriptions-item label="入会日期">{{ currentReader.joinDate }}</el-descriptions-item>
          <el-descriptions-item label="到期日期">{{ currentReader.expireDate }}</el-descriptions-item>
          <el-descriptions-item label="最大借阅数">{{ currentReader.maxBorrow }}</el-descriptions-item>
          <el-descriptions-item label="当前借阅">{{ currentReader.currentBorrow }}</el-descriptions-item>
          <el-descriptions-item label="累计借阅">{{ currentReader.borrowCount }}</el-descriptions-item>
          <el-descriptions-item label="押金">¥{{ currentReader.deposit }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentReader.status === 'active' ? 'success' : 'danger'">
              {{ currentReader.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useReaderStore } from '../store/reader'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

const readerStore = useReaderStore()

const loading = ref(false)
const searchKeyword = ref('')
const filterType = ref('')
const filterStatus = ref('')
const dialogVisible = ref(false)
const detailVisible = ref(false)
const formRef = ref(null)
const currentReader = ref(null)
const isEdit = ref(false)

const formData = ref({
  name: '',
  gender: '男',
  phone: '',
  email: '',
  type: '',
  idCard: '',
  address: '',
  joinDate: '',
  expireDate: '',
  maxBorrow: 5,
  deposit: 0
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  type: [{ required: true, message: '请选择会员类型', trigger: 'change' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }],
  joinDate: [{ required: true, message: '请选择入会日期', trigger: 'change' }],
  expireDate: [{ required: true, message: '请选择到期日期', trigger: 'change' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑读者' : '添加读者')

const filteredReaders = computed(() => {
  return readerStore.getReaders({
    keyword: searchKeyword.value,
    type: filterType.value,
    status: filterStatus.value
  })
})

const getTypeColor = (type) => {
  const colors = {
    '学生': 'primary',
    '教师': 'success',
    '普通会员': 'info',
    'VIP会员': 'warning'
  }
  return colors[type] || 'info'
}

const handleSearch = () => {
  // 搜索在computed中自动处理
}

const handleAdd = () => {
  isEdit.value = false
  const today = new Date()
  const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
  
  formData.value = {
    name: '',
    gender: '男',
    phone: '',
    email: '',
    type: '',
    idCard: '',
    address: '',
    joinDate: today.toISOString().split('T')[0],
    expireDate: nextYear.toISOString().split('T')[0],
    maxBorrow: 5,
    deposit: 0
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentReader.value = row
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleView = (row) => {
  currentReader.value = row
  detailVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这位读者吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    readerStore.deleteReader(row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        readerStore.updateReader(currentReader.value.id, formData.value)
        ElMessage.success('更新成功')
      } else {
        readerStore.addReader(formData.value)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped>
.readers-page {
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

.reader-detail {
  padding: 20px 0;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.detail-info h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.detail-info p {
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
