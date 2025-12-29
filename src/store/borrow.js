import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useBookStore } from './book'
import { useReaderStore } from './reader'
import axios from 'axios'

// 从API获取借阅记录
const fetchBorrowsFromAPI = async () => {
  try {
    const {data} = await axios.get('http://127.0.0.1:3006/api/bookBorrow');
    // 请求成功：打印返回数据
    console.log('借书记录请求成功', data.data);
    return data.data || []
  } catch (error) {
    // 请求失败：捕获异常
    console.error('GET请求失败', error.message);
    return []
  }
}

export const useBorrowStore = defineStore('borrow', () => {
  const borrows = ref([])
  const loading = ref(false)
  const bookStore = useBookStore()
  const readerStore = useReaderStore()

  // 加载借阅数据
  const fetchBorrows = async () => {
    if (loading.value) return
    loading.value = true
    try {
      const data = await fetchBorrowsFromAPI()
      borrows.value = Array.isArray(data) ? data : []
    } catch (error) {
      console.error('加载借阅记录失败:', error)
      borrows.value = []
    } finally {
      loading.value = false
    }
  }

  // 获取所有借阅记录（含关联信息）- 同步版本
  const getBorrows = (params = {}) => {
    // 确保 borrows.value 是数组
    if (!Array.isArray(borrows.value)) {
      return []
    }
    
    let result = borrows.value.map(borrow => {
      // 尝试通过book_info查找图书（可能是书名或book_no）
      const book = bookStore.getBookByName(borrow.book_info) || 
                   bookStore.getBookByNo(borrow.book_info) ||
                   bookStore.getBookById(borrow.book_info)
      const reader = readerStore.getReaderByStudentNo(borrow.student_no) ||
                     readerStore.getReaderById(borrow.student_no)
      return {
        ...borrow,
        bookTitle: book?.book_name || borrow.book_info || '未知图书',
        bookAuthor: book?.author || '',
        readerName: reader?.name || borrow.student_name || '未知读者',
        readerCard: reader?.cardNumber || borrow.student_no || ''
      }
    })
    
    // 搜索过滤
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      result = result.filter(borrow => 
        (borrow.book_info && borrow.book_info.toLowerCase().includes(keyword)) ||
        (borrow.student_name && borrow.student_name.toLowerCase().includes(keyword)) ||
        (borrow.student_no && borrow.student_no.toLowerCase().includes(keyword))
      )
    }
    
    // 状态过滤
    // if (params.status) {
    //   result = result.filter(borrow => borrow.status === params.status)
    // }
    
    // 日期过滤
    if (params.startDate) {
      result = result.filter(borrow => borrow.borrow_time >= params.startDate)
    }
    if (params.endDate) {
      result = result.filter(borrow => borrow.return_time <= params.endDate)
    }
    
    return result
  }

  // 获取借阅详情
  // const getBorrowById = (id) => {
  //   const borrow = borrows.value.find(b => b.id === id)
  //   if (!borrow) return null
    
  //   const book = bookStore.getBookById(borrow.bookId)
  //   const reader = readerStore.getReaderById(borrow.readerId)
    
  //   return {
  //     ...borrow,
  //     book,
  //     reader
  //   }
  // }

  // 创建借阅记录
  const createBorrow = async (borrowData) => {
    try {
      const {data} = await axios.get('http://127.0.0.1:3006/api/lendingStudent',{
        params:{
          student_no: borrowData.student_no || '',
          class_name: borrowData.class_name || '',
          student_name: borrowData.student_name || '',
          book_info: borrowData.book_info || ''
        }
      });
      // 请求成功：打印返回数据
      console.log('借书记录请求成功', data.data);
      
      // 更新本地借阅列表
      await fetchBorrows()
      
      return data.data
    } catch (error) {
      // 请求失败：捕获异常
      console.error('GET请求失败', error.message);
      throw error
    }
    
    // 更新图书状态（如果需要）
    // const book = bookStore.getBookByName(borrowData.book_info) || 
    //              bookStore.getBookByNo(borrowData.book_info)
    // if (book) {
    //   bookStore.updateBook(book.id, { 
    //     book_status: 1 // 已借出
    //   })
    // }
    
    // 更新读者借阅数（如果需要）
    // const reader = readerStore.getReaderByStudentNo(borrowData.student_no)
    // if (reader) {
    //   readerStore.updateReader(reader.id, {
    //     currentBorrow: reader.currentBorrow + 1,
    //     borrowCount: reader.borrowCount + 1
    //   })
    // }
  }

  // 归还图书
  const returnBook = async (id) => {
    const index = borrows.value.findIndex(b => b.id === id)
    if (index !== -1) {
      const borrow = borrows.value[index]
      const returnDate = new Date().toISOString().split('T')[0]
      
      // 计算罚款
      // let fine = 0
      // const today = new Date()
      // const due = new Date(borrow.dueDate)
      // if (today > due) {
      //   const overdueDays = Math.floor((today - due) / (1000 * 60 * 60 * 24))
      //   fine = overdueDays * 0.5 // 每天0.5元
      // }
      
      // 更新借阅记录（如果需要调用API）
      // borrows.value[index] = {
      //   ...borrow,
      //   return_time: returnDate,
      //   status: 'returned',
      //   fine
      // }
      
      // 更新图书状态（如果需要）
      // const book = bookStore.getBookByName(borrow.book_info) || 
      //              bookStore.getBookByNo(borrow.book_info)
      // if (book) {
      //   bookStore.updateBook(book.id, {
      //     book_status: 0 // 在库
      //   })
      // }
      
      // 更新读者借阅数（如果需要）
      // const reader = readerStore.getReaderByStudentNo(borrow.student_no)
      // if (reader) {
      //   readerStore.updateReader(reader.id, {
      //     currentBorrow: Math.max(0, reader.currentBorrow - 1)
      //   })
      // }
      
      // 刷新借阅列表
      await fetchBorrows()
      
      return borrows.value.find(b => b.id === id)
    }
    return null
  }

  // 续借
  // const renewBorrow = (id) => {
  //   const index = borrows.value.findIndex(b => b.id === id)
  //   if (index !== -1) {
  //     const borrow = borrows.value[index]
  //     if (borrow.renewCount >= 2) {
  //       throw new Error('已达到最大续借次数')
  //     }
      
  //     const newDueDate = new Date(borrow.dueDate)
  //     newDueDate.setDate(newDueDate.getDate() + 30)
      
  //     borrows.value[index] = {
  //       ...borrow,
  //       dueDate: newDueDate.toISOString().split('T')[0],
  //       renewCount: borrow.renewCount + 1
  //     }
      
  //     return borrows.value[index]
  //   }
  //   return null
  // }

  // 获取借阅趋势数据
  const getBorrowTrend = (days = 30) => {
    if (!Array.isArray(borrows.value)) {
      return []
    }
    
    const trend = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // 使用实际的字段名 borrow_time 和 return_time
      const count = borrows.value.filter(b => {
        if (!b.borrow_time) return false
        const borrowDate = new Date(b.borrow_time).toISOString().split('T')[0]
        return borrowDate === dateStr
      }).length
      
      const returnCount = borrows.value.filter(b => {
        if (!b.return_time) return false
        const returnDate = new Date(b.return_time).toISOString().split('T')[0]
        return returnDate === dateStr
      }).length
      
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
    if (!Array.isArray(borrows.value)) {
      return []
    }
    
    const stats = {
      borrowing: 0,
      returned: 0,
      overdue: 0
    }
    
    borrows.value.forEach(borrow => {
      // 根据 return_time 判断状态：有 return_time 为已归还，否则为借阅中
      if (borrow.return_time) {
        stats.returned++
      } else {
        stats.borrowing++
        // 可以添加逾期判断逻辑
        // if (borrow.due_time && new Date() > new Date(borrow.due_time)) {
        //   stats.overdue++
        // }
      }
    })
    
    return Object.entries(stats).map(([name, value]) => ({ name, value }))
  }

  return {
    borrows,
    loading,
    fetchBorrows,
    getBorrows,
    // getBorrowById,
    createBorrow,
    returnBook,
    getBorrowTrend,
    getStatusStats
  }
})
