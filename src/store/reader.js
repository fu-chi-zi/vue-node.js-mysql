import { defineStore } from 'pinia'
import { ref } from 'vue'

// 生成虚拟读者数据
const generateMockReaders = () => {
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二']
  const types = ['学生', '教师', '普通会员', 'VIP会员']
  const genders = ['男', '女']
  
  const readers = []
  for (let i = 1; i <= 30; i++) {
    const joinDate = new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
    readers.push({
      id: i,
      cardNumber: `R${String(i).padStart(6, '0')}`,
      name: names[Math.floor(Math.random() * names.length)] + i,
      gender: genders[Math.floor(Math.random() * genders.length)],
      phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      email: `reader${i}@example.com`,
      type: types[Math.floor(Math.random() * types.length)],
      idCard: `${Math.floor(Math.random() * 900000 + 100000)}${Math.floor(Math.random() * 90000000 + 10000000)}`,
      address: `某市某区某街道${i}号`,
      joinDate: joinDate.toISOString().split('T')[0],
      expireDate: new Date(joinDate.getFullYear() + 1, joinDate.getMonth(), joinDate.getDate()).toISOString().split('T')[0],
      status: Math.random() > 0.1 ? 'active' : 'inactive',
      borrowCount: Math.floor(Math.random() * 50),
      maxBorrow: Math.random() > 0.5 ? 5 : 10,
      currentBorrow: Math.floor(Math.random() * 3),
      deposit: Math.random() > 0.5 ? 200 : 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      createdAt: joinDate.toISOString()
    })
  }
  return readers
}

export const useReaderStore = defineStore('reader', () => {
  const readers = ref(generateMockReaders())

  // 获取所有读者
  const getReaders = (params = {}) => {
    let result = [...readers.value]
    
    // 搜索过滤
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      result = result.filter(reader => 
        reader.name.toLowerCase().includes(keyword) ||
        reader.cardNumber.toLowerCase().includes(keyword) ||
        reader.phone.includes(keyword)
      )
    }
    
    // 类型过滤
    if (params.type) {
      result = result.filter(reader => reader.type === params.type)
    }
    
    // 状态过滤
    if (params.status) {
      result = result.filter(reader => reader.status === params.status)
    }
    
    return result
  }

  // 获取读者详情
  const getReaderById = (id) => {
    return readers.value.find(reader => reader.id === id)
  }

  // 根据学号获取读者
  const getReaderByStudentNo = (studentNo) => {
    return readers.value.find(reader => reader.cardNumber === studentNo || reader.id === studentNo)
  }

  // 添加读者
  const addReader = (readerData) => {
    const newReader = {
      id: readers.value.length + 1,
      cardNumber: `R${String(readers.value.length + 1).padStart(6, '0')}`,
      ...readerData,
      borrowCount: 0,
      currentBorrow: 0,
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${readers.value.length + 1}`,
      createdAt: new Date().toISOString()
    }
    readers.value.push(newReader)
    return newReader
  }

  // 更新读者
  const updateReader = (id, readerData) => {
    const index = readers.value.findIndex(reader => reader.id === id)
    if (index !== -1) {
      readers.value[index] = { ...readers.value[index], ...readerData }
      return readers.value[index]
    }
    return null
  }

  // 删除读者
  const deleteReader = (id) => {
    const index = readers.value.findIndex(reader => reader.id === id)
    if (index !== -1) {
      readers.value.splice(index, 1)
      return true
    }
    return false
  }

  // 获取读者类型统计
  const getTypeStats = () => {
    const stats = {}
    readers.value.forEach(reader => {
      stats[reader.type] = (stats[reader.type] || 0) + 1
    })
    return Object.entries(stats).map(([name, value]) => ({ name, value }))
  }

  // 获取活跃读者
  const getActiveReaders = (limit = 10) => {
    return [...readers.value]
      .filter(reader => reader.status === 'active')
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, limit)
  }

  return {
    readers,
    getReaders,
    getReaderById,
    getReaderByStudentNo,
    addReader,
    updateReader,
    deleteReader,
    getTypeStats,
    getActiveReaders
  }
})
