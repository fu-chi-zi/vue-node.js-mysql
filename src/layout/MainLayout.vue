<template>
  <div class="main-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="logo-section">
        <div class="logo-icon">
          <el-icon :size="32"><Reading /></el-icon>
        </div>
        <transition name="fade">
          <h1 v-show="!isCollapsed" class="logo-text">图书馆系统</h1>
        </transition>
      </div>

      <nav class="nav-menu">
        <router-link
          v-for="route in menuRoutes"
          :key="route.path"
          :to="route.path"
          class="nav-item"
          :class="{ active: $route.path === route.path }"
        >
          <el-icon :size="20">
            <component :is="route.meta.icon" />
          </el-icon>
          <transition name="fade">
            <span v-show="!isCollapsed" class="nav-text">{{ route.meta.title }}</span>
          </transition>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="collapse-btn" @click="toggleCollapse">
          <el-icon :size="20">
            <DArrowLeft v-if="!isCollapsed" />
            <DArrowRight v-else />
          </el-icon>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 顶部栏 -->
      <header class="header">
        <div class="header-left">
          <h2 class="page-title">{{ currentPageTitle }}</h2>
        </div>
        <div class="header-right">
          <div class="user-info" @click="showUserMenu = !showUserMenu">
            <el-avatar :size="36" :src="authStore.userInfo?.avatar" />
            <span class="user-name">{{ authStore.userInfo?.name }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          
          <!-- 用户菜单 -->
          <transition name="fade">
            <div v-if="showUserMenu" class="user-menu" @click.stop>
              <div class="menu-item" @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                <span>退出登录</span>
              </div>
            </div>
          </transition>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isCollapsed = ref(false)
const showUserMenu = ref(false)

const menuRoutes = computed(() => {
  return router.options.routes
    .find(r => r.path === '/')
    ?.children.filter(r => r.meta?.title) || []
})

const currentPageTitle = computed(() => {
  return route.meta?.title || '首页'
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('退出登录成功')
  router.push('/login')
}

// 点击外部关闭用户菜单
const handleClickOutside = (e) => {
  if (showUserMenu.value && !e.target.closest('.user-info')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

/* 侧边栏样式 */
.sidebar {
  width: 260px;
  background: var(--primary-color);
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 80px;
}

.logo-section {
  padding: 30px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.nav-menu {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: white;
  border-radius: 0 4px 4px 0;
  transition: height 0.3s ease;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active::before {
  height: 60%;
}

.nav-text {
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background 0.3s ease;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 主容器样式 */
.main-container {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.sidebar.collapsed ~ .main-container {
  margin-left: 80px;
}

/* 顶部栏样式 */
.header {
  height: 70px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.3s ease;
}

.user-info:hover {
  background: var(--bg-primary);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 160px;
  overflow: hidden;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.menu-item:hover {
  background: var(--bg-primary);
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}
</style>
