import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const fetchBooksFromAPI = async () => {
  //发送请求，拿到书籍数据
  try {
    const {data} = await axios.get('http://127.0.0.1:3006/api/book');
    // 请求成功：打印返回数据
    console.log('GET请求成功', data.data);
    return data.data || []
  } catch (error) {
    // 请求失败：捕获异常
    console.error('GET请求失败', error.message);
    return []
  }
}

export const useBookStore = defineStore('book', () => {
  const books = ref([])
  const loading = ref(false)

  // 加载图书数据
  const fetchBooks = async () => {
    if (loading.value) return
    loading.value = true
    try {
      const data = await fetchBooksFromAPI()
      books.value = Array.isArray(data) ? data : []
    } catch (error) {
      console.error('加载图书失败:', error)
      books.value = []
    } finally {
      loading.value = false
    }
  }

  // 获取所有图书
  const getBooks = (params = {}) => {
    // 确保 books.value 是数组
    if (!Array.isArray(books.value)) {
      return []
    }
    let result = [...books.value]
    console.log(result)
    // 搜索过滤
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      result = result.filter(book => 
        (book.book_name && book.book_name.toLowerCase().includes(keyword)) ||
        (book.author && book.author.toLowerCase().includes(keyword)) ||
        (book.book_no && book.book_no.includes(keyword))
      )
    }
    
    // 分类过滤
    if (params.category) {
      result = result.filter(book => book.category === params.category)
    }
    
    // 状态过滤
    if (params.status) {
      result = result.filter(book => book.book_status === params.status)
    }
    
    return result
  }

  // 获取图书详情
  const getBookById = (id) => {
    if (!Array.isArray(books.value)) {
      return null
    }
    return books.value.find(book => book.id === id)
  }

  // 根据图书编号获取图书
  const getBookByNo = (bookNo) => {
    if (!Array.isArray(books.value)) {
      return null
    }
    return books.value.find(book => book.book_no === bookNo)
  }

  // 根据图书名称获取图书（用于模糊匹配）
  const getBookByName = (bookName) => {
    if (!Array.isArray(books.value)) {
      return null
    }
    return books.value.find(book => 
      book.book_name && (
        book.book_name.includes(bookName) || 
        bookName.includes(book.book_name)
      )
    )
  }

  // 添加图书
  const addBook = async (bookData) => {
    try {
      const {data} = await axios.post('http://127.0.0.1:3006/api/book', bookData);
      // 请求成功：打印返回数据
      console.log('添加请求成功', data.data);
      // 重新加载图书列表
      await fetchBooks()
      return data.data
    } catch (error) {
      // 请求失败：捕获异常
      console.error('添加图书失败', error.message);
      throw error
    }
  }

  // 更新图书
  const updateBook = (id, bookData) => {
    if (!Array.isArray(books.value)) {
      return null
    }
    const index = books.value.findIndex(book => book.id === id)
    if (index !== -1) {
      books.value[index] = { ...books.value[index], ...bookData }
      return books.value[index]
    }
    return null
  }

  // 删除图书
  const deleteBook = async (id) => {
    try {
      const {data} = await axios.delete('http://127.0.0.1:3006/api/deleteBook', {
        params: {
          id: id
        }
      });
      // 请求成功：打印返回数据
      console.log('删除请求成功', data.data);
      // 重新加载图书列表
      await fetchBooks()
      return data.data
    } catch (error) {
      // 请求失败：捕获异常
      console.error('删除图书失败', error.message);
      throw error
    }
  }

  // 获取分类统计
  const getCategoryStats = () => {
    if (!Array.isArray(books.value)) {
      return []
    }
    const stats = {}
    books.value.forEach(book => {
      if (book.category) {
        stats[book.category] = (stats[book.category] || 0) + 1
      }
    })
    return Object.entries(stats).map(([name, value]) => ({ name, value }))
  }

  return {
    books,
    loading,
    fetchBooks,
    getBooks,
    getBookById,
    getBookByNo,
    getBookByName,
    addBook,
    updateBook,
    deleteBook,
    getCategoryStats
  }
})
