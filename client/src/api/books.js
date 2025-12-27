import request from './request'

// 获取书籍列表
export const getBooksList = (params) => {
  return request({
    url: '/books/list',
    method: 'get',
    params
  })
}

// 获取书籍详情
export const getBookDetail = (id) => {
  return request({
    url: `/books/${id}`,
    method: 'get'
  })
}

// 新增书籍
export const addBook = (data) => {
  return request({
    url: '/books/add',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 编辑书籍
export const updateBook = (id, data) => {
  return request({
    url: `/books/${id}`,
    method: 'put',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除书籍
export const deleteBook = (id) => {
  return request({
    url: `/books/${id}`,
    method: 'delete'
  })
}

// 批量删除书籍
export const batchDeleteBooks = (ids) => {
  return request({
    url: '/books/batch-delete',
    method: 'post',
    data: { ids }
  })
}

