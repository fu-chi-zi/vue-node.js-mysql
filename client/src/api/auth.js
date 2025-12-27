import request from './request'

// 登录
export const login = (data) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

// 获取当前用户信息
export const getCurrentUser = () => {
  return request({
    url: '/auth/me',
    method: 'get'
  })
}

// 修改密码
export const changePassword = (data) => {
  return request({
    url: '/auth/change-password',
    method: 'post',
    data
  })
}

