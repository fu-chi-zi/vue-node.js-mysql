<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <!-- 左侧装饰面板 -->
      <div class="auth-left-panel">
        <img 
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="图书馆背景" 
          class="panel-background"
        >
        <div class="panel-content">
          <!-- Logo图标 -->
          <div class="logo-container">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="panel-title">开启智慧图书管理</h3>
          <p class="panel-description">高效、便捷、智能的图书馆后台管理解决方案</p>
          
          <!-- 特色功能列表 -->
          <div class="feature-list">
            <div v-for="feature in features" :key="feature.id" class="feature-item">
              <div class="feature-icon-wrapper">
                <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11L12 14L22 4" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="feature-text">{{ feature.name }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧登录表单 -->
      <div class="auth-right-panel">
        <!-- 移动端Logo -->
        <div class="mobile-header">
          <svg class="mobile-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h2 class="mobile-title">图书馆管理系统</h2>
        </div>

        <div class="form-container">
          <h3 class="form-title">欢迎回来!</h3>
          <p class="form-subtitle">请登录您的账户以继续</p>
          
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="rules"
            class="login-form"
          >
            <el-form-item prop="username">
              <label class="form-label">用户名</label>
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                size="large"
                prefix-icon="User"
                class="form-input"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <label class="form-label">密码</label>
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                prefix-icon="Lock"
                show-password
                class="form-input"
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <div class="form-options">
              <el-checkbox v-model="rememberMe" class="remember-checkbox">
                记住我
              </el-checkbox>
              <a href="#" class="forgot-link">忘记密码?</a>
            </div>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                @click="handleLogin"
                class="submit-button"
              >
                {{ loading ? '登录中...' : '登 录' }}
              </el-button>
            </el-form-item>
          </el-form>
          
        
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const loginFormRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const features = [
  { id: 1, name: '图书借阅管理' },
  { id: 2, name: '读者信息管理' },
  { id: 3, name: '数据统计分析' }
]

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await authStore.login(loginForm.username, loginForm.password)
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        ElMessage.error(error.message || '登录失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&family=Noto+Serif+SC:wght@400;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #fef5f0 0%, #fef2f0 100%);
  font-family: 'Noto Sans SC', sans-serif;
}

.auth-container {
  display: flex;
  max-width: 1100px;
  width: 100%;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(255, 147, 123, 0.15);
  border: 1px solid #ffe5dc;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 左侧面板 - 粉橙渐变 */
.auth-left-panel {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 48px;
  text-align: center;
  background: linear-gradient(135deg, #ff9a76 0%, #ff6b9d 50%, #c64f8a 100%);
  color: white;
}

.panel-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.12;
}

.panel-content {
  position: relative;
  z-index: 10;
}

.logo-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 90px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  margin-bottom: 30px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.logo-icon {
  width: 50px;
  height: 50px;
  color: #ff6b9d;
}

.panel-title {
  font-size: 32px;
  font-weight: 700;
  font-family: 'Noto Serif SC', serif;
  margin-bottom: 16px;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.panel-description {
  font-size: 16px;
  opacity: 0.95;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.7;
  max-width: 400px;
  margin: 0 auto;
}

.feature-list {
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: left;
  max-width: 340px;
  margin-left: auto;
  margin-right: auto;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 14px;
  color: white;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.22);
  transform: translateX(8px);
}

.feature-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 20px;
  height: 20px;
  color: #ff6b9d;
}

.feature-text {
  font-weight: 500;
  font-size: 15px;
}

/* 右侧表单面板 */
.auth-right-panel {
  flex: 1;
  padding: 60px 48px;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mobile-header {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
}

.mobile-logo {
  width: 44px;
  height: 44px;
  color: #ff6b9d;
}

.mobile-title {
  font-size: 22px;
  font-weight: 600;
  font-family: 'Noto Serif SC', serif;
  color: #2d3748;
}

.form-container {
  max-width: 420px;
  margin: 0 auto;
  width: 100%;
}

.form-title {
  font-size: 32px;
  font-weight: 700;
  font-family: 'Noto Serif SC', serif;
  color: #2d3748;
  text-align: center;
  margin-bottom: 10px;
}

.form-subtitle {
  text-align: center;
  color: #718096;
  margin-bottom: 40px;
  font-size: 15px;
}

.login-form {
  margin-top: 32px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 10px;
}

.form-input :deep(.el-input__wrapper) {
  padding: 14px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(255, 107, 157, 0.08);
  border: 2px solid #ffe5f0;
  background: #ffffff;
  transition: all 0.3s;
}

.form-input :deep(.el-input__wrapper:hover) {
  border-color: #ffb3d1;
}

.form-input :deep(.el-input__wrapper.is-focus) {
  border-color: #ff6b9d;
  box-shadow: 0 0 0 4px rgba(255, 107, 157, 0.12);
}

.form-input :deep(.el-input__inner) {
  color: #2d3748;
  font-size: 15px;
}

.form-input :deep(.el-input__inner::placeholder) {
  color: #a0aec0;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  margin-top: 8px;
  font-size: 14px;
}

.remember-checkbox {
  color: #718096;
}

.remember-checkbox :deep(.el-checkbox__label) {
  color: #4a5568;
  font-weight: 500;
}

.remember-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #ff6b9d;
  border-color: #ff6b9d;
}

.forgot-link {
  color: #ff6b9d;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.forgot-link:hover {
  color: #ff4d85;
  text-decoration: underline;
}

.submit-button {
  width: 100%;
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff9a76 0%, #ff6b9d 100%);
  border: none;
  box-shadow: 0 4px 14px rgba(255, 107, 157, 0.3);
  transition: all 0.3s;
  letter-spacing: 1px;
}

.submit-button:hover {
  background: linear-gradient(135deg, #ff8866 0%, #ff5a8d 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 157, 0.4);
}

.submit-button:active {
  transform: translateY(0);
}

.demo-account {
  margin-top: 28px;
  padding: 14px 20px;
  background: #fff5f8;
  border: 1px solid #ffd4e5;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #d63384;
  font-size: 13px;
  font-weight: 500;
}

.demo-icon {
  font-size: 18px;
  color: #ff6b9d;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .auth-left-panel {
    display: none;
  }
}

@media (max-width: 768px) {
  .auth-wrapper {
    padding: 16px;
  }

  .auth-right-panel {
    padding: 40px 28px;
  }

  .mobile-header {
    display: flex;
  }

  .form-title {
    font-size: 26px;
  }

  .form-subtitle {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .auth-right-panel {
    padding: 32px 20px;
  }

  .form-container {
    max-width: 100%;
  }

  .form-title {
    font-size: 24px;
  }
}
</style>