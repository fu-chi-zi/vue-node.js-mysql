import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useBookStore } from './book'
import { useReaderStore } from './reader'

// 生成虚拟借阅记录
const generateMockBorrows = () => {
  const borrows = []
  const statuses = ['borrowing', 'returned', 'overdue']
  
  for (let i = 1; i <= 80; i++) {
    const borrowDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
    const dueDate = new Date(borrowDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    let returnDate = null
    if (status === 'returned') {
      returnDate = new Date(borrowDate.getTime() + Math.floor(Math.random() * 25) * 24 * 60 * 60 * 1000)
    }
    
    borrows.push({
      id: i,
      bookId: Math.floor(Math.random() * 50) + 1,
      readerId: Math.floor(Math.random() * 30) + 1,
      borrowDate: borrowDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      returnDate: returnDate ? returnDate.toISOString().split('T')[0] : null,
      status: status,
      renewCount: Math.floor(Math.random() * 2),
      fine: status === 'overdue' ? Math.floor(Math.random() * 50) : 0,
      note: '',
      createdAt: borrowDate.toISOString()
    })
  }
  return borrows
}

export const useBorrowStore = defineStore('borrow', () => {
  const borrows = ref(generateMockBorrows())
  const bookStore = useBookStore()
  const readerStore = useReaderStore()

  // 获取所有借阅记录（含关联信息）
  const getBorrows = (params = {}) => {
    let result = [...borrows.value].map(borrow => {
      const book = bookStore.getBookById(borrow.bookId)
      const reader = readerStore.getReaderById(borrow.readerId)
      return {
        ...borrow,
        bookTitle: book?.title || '未知图书',
        bookAuthor: book?.author || '',
        readerName: reader?.name || '未知读者',
        readerCard: reader?.cardNumber || ''
      }
    })
    
    // 搜索过滤
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      result = result.filter(borrow => 
        borrow.bookTitle.toLowerCase().includes(keyword) ||
        borrow.readerName.toLowerCase().includes(keyword) ||
        borrow.readerCard.toLowerCase().includes(keyword)
      )
    }
    
    // 状态过滤
    if (params.status) {
      result = result.filter(borrow => borrow.status === params.status)
    }
    
    // 日期过滤
    if (params.startDate) {
      result = result.filter(borrow => borrow.borrowDate >= params.startDate)
    }
    if (params.endDate) {
      result = result.filter(borrow => borrow.borrowDate <= params.endDate)
    }
    
    return result
  }

  // 获取借阅详情
  const getBorrowById = (id) => {
    const borrow = borrows.value.find(b => b.id === id)
    if (!borrow) return null
    
    const book = bookStore.getBookById(borrow.bookId)
    const reader = readerStore.getReaderById(borrow.readerId)
    
    return {
      ...borrow,
      book,
      reader
    }
  }

  // 创建借阅记录
  const createBorrow = (borrowData) => {
    const borrowDate = new Date()
    const dueDate = new Date(borrowDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const newBorrow = {
      id: borrows.value.length + 1,
      ...borrowData,
      borrowDate: borrowDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      returnDate: null,
      status: 'borrowing',
      renewCount: 0,
      fine: 0,
      createdAt: new Date().toISOString()
    }
    
    borrows.value.push(newBorrow)
    
    // 更新图书状态
    const book = bookStore.getBookById(borrowData.bookId)
    if (book) {
      bookStore.updateBook(book.id, { 
        stock: book.stock - 1,
        status: book.stock - 1 === 0 ? 'borrowed' : 'available'
      })
    }
    
    // 更新读者借阅数
    const reader = readerStore.getReaderById(borrowData.readerId)
    if (reader) {
      readerStore.updateReader(reader.id, {
        currentBorrow: reader.currentBorrow + 1,
        borrowCount: reader.borrowCount + 1
      })
    }
    
    return newBorrow
  }

  // 归还图书
  const returnBook = (id) => {
    const index = borrows.value.findIndex(b => b.id === id)
    if (index !== -1) {
      const borrow = borrows.value[index]
      const returnDate = new Date().toISOString().split('T')[0]
      
      // 计算罚款
      let fine = 0
      const today = new Date()
      const due = new Date(borrow.dueDate)
      if (today > due) {
        const overdueDays = Math.floor((today - due) / (1000 * 60 * 60 * 24))
        fine = overdueDays * 0.5 // 每天0.5元
      }
      
      borrows.value[index] = {
        ...borrow,
        returnDate,
        status: 'returned',
        fine
      }
      
      // 更新图书库存
      const book = bookStore.getBookById(borrow.bookId)
      if (book) {
        bookStore.updateBook(book.id, {
          stock: book.stock + 1,
          status: 'available',
          borrowCount: book.borrowCount + 1
        })
      }
      
      // 更新读者借阅数
      const reader = readerStore.getReaderById(borrow.readerId)
      if (reader) {
        readerStore.updateReader(reader.id, {
          currentBorrow: Math.max(0, reader.currentBorrow - 1)
        })
      }
      
      return borrows.value[index]
    }
    return null
  }

  // 续借
  const renewBorrow = (id) => {
    const index = borrows.value.findIndex(b => b.id === id)
    if (index !== -1) {
      const borrow = borrows.value[index]
      if (borrow.renewCount >= 2) {
        throw new Error('已达到最大续借次数')
      }
      
      const newDueDate = new Date(borrow.dueDate)
      newDueDate.setDate(newDueDate.getDate() + 30)
      
      borrows.value[index] = {
        ...borrow,
        dueDate: newDueDate.toISOString().split('T')[0],
        renewCount: borrow.renewCount + 1
      }
      
      return borrows.value[index]
    }
    return null
  }

  // 获取借阅趋势数据
  const getBorrowTrend = (days = 30) => {
    const trend = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const count = borrows.value.filter(b => b.borrowDate === dateStr).length
      const returnCount = borrows.value.filter(b => b.returnDate === dateStr).length
      
      trend.push({
        date: dateStr,
        borrow: count,
        return: returnCount
      })
    }
    
    return trend
  }

  // 获取状态统计
  const getStatusStats = () => {
    const stats = {
      borrowing: 0,
      returned: 0,
      overdue: 0
    }
    
    borrows.value.forEach(borrow => {
      stats[borrow.status] = (stats[borrow.status] || 0) + 1
    })
    
    return Object.entries(stats).map(([name, value]) => ({ name, value }))
  }

  return {
    borrows,
    getBorrows,
    getBorrowById,
    createBorrow,
    returnBook,
    renewBorrow,
    getBorrowTrend,
    getStatusStats
  }
})
