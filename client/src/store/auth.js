import { defineStore } from 'pinia'
import { login, getCurrentUser } from '../api/auth'

// 虚拟账号配置（用于前端测试）
const VIRTUAL_ACCOUNTS = {
  admin: {
    password: 'admin123',
    role: 'admin',
    username: 'admin'
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user') || 'null')
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || ''
  },

  actions: {
    // 虚拟密码代理：检查是否为虚拟账号
    checkVirtualAccount(username, password) {
      const account = VIRTUAL_ACCOUNTS[username]
      if (account && account.password === password) {
        // 生成虚拟token
        const virtualToken = `virtual_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const userInfo = {
          id: 1,
          username: account.username,
          role: account.role,
          lastLogin: new Date().toISOString()
        }
        return {
          success: true,
          token: virtualToken,
          user: userInfo
        }
      }
      return null
    },

    async loginAction(loginForm) {
      // 先检查虚拟账号
      const virtualResult = this.checkVirtualAccount(loginForm.username, loginForm.password)
      if (virtualResult) {
        // 虚拟账号登录成功
        this.token = virtualResult.token
        this.user = virtualResult.user
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        return { success: true, data: virtualResult }
      }

      // 非虚拟账号，发送真实请求
      try {
        const response = await login(loginForm)
        // 如果后端返回了数据，处理响应
        if (response?.data) {
          this.token = response.data.token || response.data.data?.token
          this.user = response.data.user || response.data.data?.user
          if (this.token) {
            localStorage.setItem('token', this.token)
          }
          if (this.user) {
            localStorage.setItem('user', JSON.stringify(this.user))
          }
        }
        return { success: true, data: response?.data }
      } catch (error) {
        // 处理错误
        throw error
      }
    },

    async fetchUserInfo() {
      // 如果是虚拟账号，直接返回已存储的用户信息
      if (this.token?.startsWith('virtual_token_')) {
        return { success: true, data: this.user }
      }

      // 否则发送真实请求
      try {
        const response = await getCurrentUser()
        if (response?.data) {
          this.user = response.data.user || response.data.data
          if (this.user) {
            localStorage.setItem('user', JSON.stringify(this.user))
          }
        }
        return { success: true, data: response?.data }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },

    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
})

