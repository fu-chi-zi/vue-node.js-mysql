import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 虚拟账号配置
const VIRTUAL_ACCOUNTS = {
  admin: {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: '系统管理员',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  // 登录
  const login = async (username, password) => {
    // 检查是否为虚拟账号
    const virtualAccount = VIRTUAL_ACCOUNTS[username]
    
    if (virtualAccount && virtualAccount.password === password) {
      // 虚拟账号登录
      const virtualToken = `virtual_token_${username}_${Date.now()}`
      const user = {
        id: 1,
        username: virtualAccount.username,
        name: virtualAccount.name,
        role: virtualAccount.role,
        avatar: virtualAccount.avatar
      }
      
      token.value = virtualToken
      userInfo.value = user
      
      localStorage.setItem('token', virtualToken)
      localStorage.setItem('userInfo', JSON.stringify(user))
      
      return { success: true, user }
    }
    
    // 这里可以添加真实的API调用
    throw new Error('用户名或密码错误')
  }

  // 退出登录
  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    isAuthenticated,
    login,
    logout
  }
})
