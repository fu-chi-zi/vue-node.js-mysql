<template>
  <div class="profile-container">
    <el-card>
      <template #header>
        <span>个人中心</span>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="个人信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户名">
              {{ user?.username }}
            </el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag type="primary">管理员</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(user?.created_at) }}
            </el-descriptions-item>
            <el-descriptions-item label="最后登录">
              {{ formatDate(user?.last_login) || '未登录过' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="修改密码" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="120px"
            style="max-width: 500px"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleChangePassword" :loading="submitLoading">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../store/auth'
import { changePassword } from '../api/auth'

const authStore = useAuthStore()
const activeTab = ref('info')
const submitLoading = ref(false)
const passwordFormRef = ref(null)

const user = computed(() => authStore.user)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await changePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
        ElMessage.success('密码修改成功')
        passwordFormRef.value.resetFields()
      } catch (error) {
        ElMessage.error('密码修改失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

onMounted(async () => {
  try {
    await authStore.fetchUserInfo()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
})
</script>

<style scoped>
.profile-container {
  background: #fff;
  border-radius: 4px;
}
</style>

