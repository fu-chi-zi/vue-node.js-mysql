import request from './request'

// 获取分类列表
export const getCategoriesList = () => {
  return request({
    url: '/categories/list',
    method: 'get'
  })
}

// 新增分类
export const addCategory = (data) => {
  return request({
    method: 'post',
    data
  })
}

// 编辑分类
export const updateCategory = (id, data) => {
  return request({
    url: `/categories/${id}`,
    method: 'put',
    data
  })
}

// 删除分类
export const deleteCategory = (id) => {
  return request({
    url: `/categories/${id}`,
    method: 'delete'
  })
}

