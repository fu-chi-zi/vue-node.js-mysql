import { defineStore } from 'pinia'
import { ref } from 'vue'

// 生成虚拟数据
const generateMockBooks = () => {
  const categories = ['文学', '历史', '科学', '艺术', '哲学', '计算机', '经济', '心理学']
  const authors = ['鲁迅', '莫言', '余华', '路遥', '金庸', '王小波', '史铁生', '三毛']
  const publishers = ['人民文学出版社', '商务印书馆', '中华书局', '三联书店', '上海译文出版社']
  
  const books = []
  for (let i = 1; i <= 50; i++) {
    books.push({
      id: i,
      isbn: `978-7-${Math.floor(Math.random() * 90000 + 10000)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9 + 1)}`,
      title: `书籍名称 ${i}`,
      author: authors[Math.floor(Math.random() * authors.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      publisher: publishers[Math.floor(Math.random() * publishers.length)],
      publishDate: `${2015 + Math.floor(Math.random() * 9)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      price: (Math.random() * 80 + 20).toFixed(2),
      stock: Math.floor(Math.random() * 50) + 5,
      location: `${String.fromCharCode(65 + Math.floor(Math.random() * 5))}区-${Math.floor(Math.random() * 20) + 1}架`,
      status: Math.random() > 0.2 ? 'available' : 'borrowed',
      borrowCount: Math.floor(Math.random() * 200),
      description: '这是一本优秀的书籍，内容丰富，值得一读。',
      createdAt: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString()
    })
  }
  return books
}

export const useBookStore = defineStore('book', () => {
  const books = ref(generateMockBooks())

  // 获取所有图书
  const getBooks = (params = {}) => {
    let result = [...books.value]
    
    // 搜索过滤
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      result = result.filter(book => 
        book.title.toLowerCase().includes(keyword) ||
        book.author.toLowerCase().includes(keyword) ||
        book.isbn.includes(keyword)
      )
    }
    
    // 分类过滤
    if (params.category) {
      result = result.filter(book => book.category === params.category)
    }
    
    // 状态过滤
    if (params.status) {
      result = result.filter(book => book.status === params.status)
    }
    
    return result
  }

  // 获取图书详情
  const getBookById = (id) => {
    return books.value.find(book => book.id === id)
  }

  // 添加图书
  const addBook = (bookData) => {
    const newBook = {
      id: books.value.length + 1,
      ...bookData,
      borrowCount: 0,
      status: 'available',
      createdAt: new Date().toISOString()
    }
    books.value.push(newBook)
    return newBook
  }

  // 更新图书
  const updateBook = (id, bookData) => {
    const index = books.value.findIndex(book => book.id === id)
    if (index !== -1) {
      books.value[index] = { ...books.value[index], ...bookData }
      return books.value[index]
    }
    return null
  }

  // 删除图书
  const deleteBook = (id) => {
    const index = books.value.findIndex(book => book.id === id)
    if (index !== -1) {
      books.value.splice(index, 1)
      return true
    }
    return false
  }

  // 获取分类统计
  const getCategoryStats = () => {
    const stats = {}
    books.value.forEach(book => {
      stats[book.category] = (stats[book.category] || 0) + 1
    })
    return Object.entries(stats).map(([name, value]) => ({ name, value }))
  }

  // 获取热门图书
  const getPopularBooks = (limit = 10) => {
    return [...books.value]
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, limit)
  }

  return {
    books,
    getBooks,
    getBookById,
    addBook,
    updateBook,
    deleteBook,
    getCategoryStats,
    getPopularBooks
  }
})
