/**
 * @fileoverview 模拟数据
 * 提供商品、分类等模拟数据，用于开发和测试
 */

/**
 * 模拟商品数据
 * @type {import('../types/index.js').Product[]}
 */
export const mockProducts = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    price: 7999,
    originalPrice: 8999,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400'
    ],
    category: 'electronics',
    rating: 4.8,
    reviewCount: 1234,
    description: '全新iPhone 15 Pro，搭载A17 Pro芯片，钛金属设计，专业级摄像系统。支持5G网络，拍照效果出色，是年轻人的首选智能手机。',
    stock: 50,
    tags: ['手机', '苹果', '5G', '拍照', '钛金属'],
    isFavorite: false,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    name: 'MacBook Air M2',
    price: 8999,
    originalPrice: 9999,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'
    ],
    category: 'electronics',
    rating: 4.9,
    reviewCount: 856,
    description: 'MacBook Air M2芯片，13.6英寸液体视网膜显示屏，轻薄便携。完美适合学生和职场新人，性能强劲，续航出色。',
    stock: 30,
    tags: ['笔记本', '苹果', 'M2', '轻薄', '学生'],
    isFavorite: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '3',
    name: '时尚运动鞋',
    price: 599,
    originalPrice: 799,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400'
    ],
    category: 'fashion',
    rating: 4.5,
    reviewCount: 432,
    description: '舒适透气的运动鞋，采用最新科技面料，适合日常穿着和运动。时尚设计，多种颜色可选，是年轻人的潮流首选。',
    stock: 100,
    tags: ['运动鞋', '时尚', '舒适', '透气', '潮流'],
    isFavorite: false,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: '4',
    name: '无线蓝牙耳机',
    price: 299,
    originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400'
    ],
    category: 'electronics',
    rating: 4.3,
    reviewCount: 678,
    description: '高品质无线蓝牙耳机，主动降噪功能，长续航设计。音质清晰，佩戴舒适，是音乐爱好者和通勤族的理想选择。',
    stock: 80,
    tags: ['耳机', '蓝牙', '降噪', '音乐', '通勤'],
    isFavorite: false,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: '5',
    name: '时尚背包',
    price: 199,
    originalPrice: 299,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=400',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400'
    ],
    category: 'fashion',
    rating: 4.4,
    reviewCount: 234,
    description: '多功能时尚背包，大容量设计，适合上班和旅行。防水面料，多个分层，既实用又时尚，是都市年轻人的必备单品。',
    stock: 60,
    tags: ['背包', '时尚', '大容量', '旅行', '防水'],
    isFavorite: false,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-21')
  },
  {
    id: '6',
    name: '智能手表',
    price: 1299,
    originalPrice: 1599,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400'
    ],
    category: 'electronics',
    rating: 4.6,
    reviewCount: 567,
    description: '智能手表，全天候健康监测，运动追踪，超长续航。支持多种运动模式，是健身爱好者和科技达人的完美选择。',
    stock: 40,
    tags: ['智能手表', '健康', '运动', '科技', '续航'],
    isFavorite: false,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: '7',
    name: '潮流T恤',
    price: 89,
    originalPrice: 129,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
      'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400'
    ],
    category: 'fashion',
    rating: 4.2,
    reviewCount: 189,
    description: '100%纯棉潮流T恤，舒适透气，印花设计时尚个性。多种尺码和颜色可选，是夏日必备的时尚单品。',
    stock: 150,
    tags: ['T恤', '潮流', '纯棉', '印花', '夏日'],
    isFavorite: false,
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-23')
  },
  {
    id: '8',
    name: '游戏机械键盘',
    price: 399,
    originalPrice: 499,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
    images: [
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
      'https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=400'
    ],
    category: 'electronics',
    rating: 4.7,
    reviewCount: 445,
    description: '专业游戏机械键盘，青轴手感，RGB背光，全键无冲。专为游戏玩家设计，提供极致的游戏体验。',
    stock: 25,
    tags: ['键盘', '机械', '游戏', 'RGB', '青轴'],
    isFavorite: false,
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-17')
  },
  {
    id: '9',
    name: '咖啡杯套装',
    price: 159,
    originalPrice: 199,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400',
    images: [
      'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
      'https://images.unsplash.com/photo-1572119865084-43c5d9b64025?w=400'
    ],
    category: 'home',
    rating: 4.1,
    reviewCount: 156,
    description: '精美陶瓷咖啡杯套装，包含4个咖啡杯和托盘。设计简约时尚，适合家庭使用或作为礼品赠送。',
    stock: 75,
    tags: ['咖啡杯', '陶瓷', '套装', '家居', '礼品'],
    isFavorite: false,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-24')
  },
  {
    id: '10',
    name: '瑜伽垫',
    price: 129,
    originalPrice: 179,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      'https://images.unsplash.com/photo-1506629905607-d405b7a82b8a?w=400'
    ],
    category: 'sports',
    rating: 4.5,
    reviewCount: 298,
    description: '专业瑜伽垫，环保TPE材质，防滑耐用。厚度适中，提供良好的缓冲和支撑，是瑜伽和健身的理想选择。',
    stock: 90,
    tags: ['瑜伽垫', '健身', 'TPE', '防滑', '环保'],
    isFavorite: false,
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-15')
  }
]

/**
 * 模拟分类数据
 * @type {import('../types/index.js').Category[]}
 */
export const mockCategories = [
  {
    id: 'electronics',
    name: '数码电子',
    icon: 'Smartphone',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300',
    productCount: 5,
    description: '最新数码产品，智能设备，电子配件',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'fashion',
    name: '时尚服饰',
    icon: 'ShoppingBag',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300',
    productCount: 3,
    description: '潮流服装，时尚配饰，个性穿搭',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'home',
    name: '家居生活',
    icon: 'House',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300',
    productCount: 1,
    description: '家居用品，生活必需品，装饰摆件',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'sports',
    name: '运动户外',
    icon: 'Trophy',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
    productCount: 1,
    description: '运动器材，户外装备，健身用品',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'beauty',
    name: '美妆护肤',
    icon: 'MagicStick',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300',
    productCount: 0,
    description: '化妆品，护肤品，美容工具',
    sortOrder: 5,
    isActive: true
  },
  {
    id: 'books',
    name: '图书文具',
    icon: 'Reading',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300',
    productCount: 0,
    description: '图书杂志，文具用品，学习用品',
    sortOrder: 6,
    isActive: true
  }
]

/**
 * 根据分类ID获取该分类下的商品数量
 * @param {string} categoryId - 分类ID
 * @returns {number} 商品数量
 */
export function getProductCountByCategory(categoryId) {
  return mockProducts.filter(product => product.category === categoryId).length
}

/**
 * 更新分类的商品数量
 * @returns {import('../types/index.js').Category[]} 更新后的分类数据
 */
export function updateCategoryProductCounts() {
  return mockCategories.map(category => ({
    ...category,
    productCount: getProductCountByCategory(category.id)
  }))
}

/**
 * 获取推荐商品（评分高于4.5的商品）
 * @param {number} limit - 限制数量
 * @returns {import('../types/index.js').Product[]} 推荐商品列表
 */
export function getFeaturedProducts(limit = 8) {
  return mockProducts
    .filter(product => product.rating >= 4.5)
    .slice(0, limit)
}

/**
 * 获取促销商品（有原价的商品）
 * @param {number} limit - 限制数量
 * @returns {import('../types/index.js').Product[]} 促销商品列表
 */
export function getOnSaleProducts(limit = 6) {
  return mockProducts
    .filter(product => product.originalPrice && product.originalPrice > product.price)
    .slice(0, limit)
}

/**
 * 根据关键词搜索商品
 * @param {string} keyword - 搜索关键词
 * @returns {import('../types/index.js').Product[]} 搜索结果
 */
export function searchProducts(keyword) {
  if (!keyword) return mockProducts
  
  const lowerKeyword = keyword.toLowerCase()
  return mockProducts.filter(product => 
    product.name.toLowerCase().includes(lowerKeyword) ||
    product.description.toLowerCase().includes(lowerKeyword) ||
    product.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  )
}

/**
 * 根据分类筛选商品
 * @param {string} categoryId - 分类ID
 * @returns {import('../types/index.js').Product[]} 筛选结果
 */
export function getProductsByCategory(categoryId) {
  if (!categoryId) return mockProducts
  return mockProducts.filter(product => product.category === categoryId)
}

/**
 * 模拟轮播图数据
 * @type {import('../types/index.js').Banner[]}
 */
export const mockBanners = [
  {
    id: '1',
    title: '新年大促销',
    subtitle: '全场商品5折起，限时优惠不容错过',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
    link: '/category/electronics',
    buttonText: '立即抢购',
    backgroundColor: '#667eea',
    textColor: '#ffffff',
    isActive: true,
    sortOrder: 1
  },
  {
    id: '2',
    title: '时尚新品上市',
    subtitle: '潮流服饰，彰显个性，做最时尚的自己',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
    link: '/category/fashion',
    buttonText: '查看详情',
    backgroundColor: '#ff6b6b',
    textColor: '#ffffff',
    isActive: true,
    sortOrder: 2
  },
  {
    id: '3',
    title: '智能生活',
    subtitle: '科技改变生活，智能设备让生活更便捷',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&h=400&fit=crop',
    link: '/category/electronics',
    buttonText: '探索更多',
    backgroundColor: '#51cf66',
    textColor: '#ffffff',
    isActive: true,
    sortOrder: 3
  },
  {
    id: '4',
    title: '运动健身',
    subtitle: '健康生活从运动开始，专业装备助你一臂之力',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=400&fit=crop',
    link: '/category/sports',
    buttonText: '开始运动',
    backgroundColor: '#ffd43b',
    textColor: '#2c3e50',
    isActive: true,
    sortOrder: 4
  }
]

/**
 * 获取分页商品数据
 * @param {Object} options - 分页选项
 * @param {number} options.page - 页码（从1开始）
 * @param {number} options.pageSize - 每页数量
 * @param {string} [options.category] - 分类筛选
 * @param {string} [options.keyword] - 搜索关键词
 * @param {string} [options.sortBy] - 排序方式
 * @returns {import('../types/index.js').ProductListResponse} 分页结果
 */
export function getPaginatedProducts(options = {}) {
  const {
    page = 1,
    pageSize = 12,
    category = null,
    keyword = '',
    sortBy = 'default'
  } = options

  let filtered = [...mockProducts]

  // 分类筛选
  if (category) {
    filtered = filtered.filter(product => product.category === category)
  }

  // 关键词搜索
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase()
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(lowerKeyword) ||
      product.description.toLowerCase().includes(lowerKeyword) ||
      product.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
    )
  }

  // 排序
  switch (sortBy) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating)
      break
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'sales':
      filtered.sort((a, b) => b.reviewCount - a.reviewCount)
      break
    default:
      // 保持默认顺序
      break
  }

  // 分页
  const total = filtered.length
  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const products = filtered.slice(startIndex, endIndex)

  return {
    products,
    pagination: {
      page,
      pageSize,
      total,
      totalPages
    },
    filters: {
      category,
      keyword,
      sortBy
    }
  }
}