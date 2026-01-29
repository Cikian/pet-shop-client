import { defineStore } from 'pinia'
import { 
  mockProducts, 
  mockCategories, 
  updateCategoryProductCounts,
  getFeaturedProducts,
  getOnSaleProducts,
  searchProducts,
  getProductsByCategory
} from '../data/mockData.js'

/**
 * 商品状态管理 Store
 * 管理商品数据、分类、搜索、筛选和排序功能
 * @typedef {import('../types/index.js').Product} Product
 * @typedef {import('../types/index.js').Category} Category
 * @typedef {import('../types/index.js').ProductFilter} ProductFilter
 * @typedef {import('../types/index.js').SortOption} SortOption
 */
export const useProductStore = defineStore('product', {
  state: () => ({
    /** @type {Product[]} */
    products: [],
    /** @type {Category[]} */
    categories: [],
    /** @type {string|null} */
    currentCategory: null,
    /** @type {string} */
    searchKeyword: '',
    /** @type {SortOption} */
    sortBy: 'default',
    /** @type {boolean} */
    loading: false,
    /** @type {string|null} */
    error: null,
    /** @type {ProductFilter} */
    filters: {
      minPrice: null,
      maxPrice: null,
      minRating: null,
      tags: [],
      inStock: false
    },
    /** @type {number} */
    currentPage: 1,
    /** @type {number} */
    pageSize: 12,
    /** @type {boolean} */
    hasMore: true
  }),
  
  getters: {
    /**
     * 获取分页后的商品列表
     * @returns {Product[]} 当前页的商品
     */
    paginatedProducts: (state) => {
      const filtered = state.filteredProducts
      const startIndex = (state.currentPage - 1) * state.pageSize
      const endIndex = startIndex + state.pageSize
      return filtered.slice(startIndex, endIndex)
    },
    
    /**
     * 获取总页数
     * @returns {number} 总页数
     */
    totalPages: (state) => {
      return Math.ceil(state.filteredProducts.length / state.pageSize)
    },
    
    /**
     * 是否有更多页面
     * @returns {boolean} 是否有更多页面
     */
    hasMorePages: (state) => {
      return state.currentPage < state.totalPages
    },
    
    /**
     * 获取分页信息
     * @returns {PaginationData} 分页信息
     */
    paginationInfo: (state) => {
      return {
        page: state.currentPage,
        pageSize: state.pageSize,
        total: state.filteredProducts.length,
        totalPages: state.totalPages
      }
    },
    /**
     * 获取筛选后的商品列表
     * @returns {Product[]} 筛选后的商品
     */
    filteredProducts: (state) => {
      let filtered = [...state.products]
      
      // 按分类筛选
      if (state.currentCategory) {
        filtered = filtered.filter(product => product.category === state.currentCategory)
      }
      
      // 按关键词搜索
      if (state.searchKeyword) {
        const keyword = state.searchKeyword.toLowerCase()
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(keyword) ||
          product.description.toLowerCase().includes(keyword) ||
          product.tags.some(tag => tag.toLowerCase().includes(keyword))
        )
      }
      
      // 价格筛选
      if (state.filters.minPrice !== null) {
        filtered = filtered.filter(product => product.price >= state.filters.minPrice)
      }
      if (state.filters.maxPrice !== null) {
        filtered = filtered.filter(product => product.price <= state.filters.maxPrice)
      }
      
      // 评分筛选
      if (state.filters.minRating !== null) {
        filtered = filtered.filter(product => product.rating >= state.filters.minRating)
      }
      
      // 标签筛选
      if (state.filters.tags && state.filters.tags.length > 0) {
        filtered = filtered.filter(product => 
          state.filters.tags.some(tag => 
            product.tags.some(productTag => 
              productTag.toLowerCase().includes(tag.toLowerCase())
            )
          )
        )
      }
      
      // 库存筛选
      if (state.filters.inStock) {
        filtered = filtered.filter(product => product.stock > 0)
      }
      
      // 排序
      switch (state.sortBy) {
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
      
      return filtered
    },
    
    /**
     * 按分类分组的商品
     * @returns {Object<string, Product[]>} 分组后的商品
     */
    productsByCategory: (state) => {
      const grouped = {}
      state.categories.forEach(category => {
        grouped[category.id] = state.products.filter(product => product.category === category.id)
      })
      return grouped
    },
    
    /**
     * 推荐商品（评分高的商品）
     * @returns {Product[]} 推荐商品列表
     */
    featuredProducts: (state) => {
      return getFeaturedProducts(8)
    },
    
    /**
     * 促销商品（有原价的商品）
     * @returns {Product[]} 促销商品列表
     */
    onSaleProducts: (state) => {
      return getOnSaleProducts(6)
    },
    
    /**
     * 获取当前筛选条件的商品总数
     * @returns {number} 商品总数
     */
    filteredProductsCount: (state) => {
      return state.filteredProducts.length
    },
    
    /**
     * 获取所有可用的标签
     * @returns {string[]} 标签列表
     */
    availableTags: (state) => {
      const tags = new Set()
      state.products.forEach(product => {
        product.tags.forEach(tag => tags.add(tag))
      })
      return Array.from(tags).sort()
    },
    
    /**
     * 获取价格范围
     * @returns {{min: number, max: number}} 价格范围
     */
    priceRange: (state) => {
      if (state.products.length === 0) return { min: 0, max: 0 }
      const prices = state.products.map(p => p.price)
      return {
        min: Math.min(...prices),
        max: Math.max(...prices)
      }
    }
  },
  
  actions: {
    /**
     * 获取商品数据
     * @returns {Promise<void>}
     */
    async fetchProducts() {
      this.loading = true
      this.error = null
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 模拟网络错误（5%概率）
        if (Math.random() < 0.05) {
          throw new Error('Network error: Failed to fetch products')
        }
        
        this.products = [...mockProducts]
        // 更新分类商品数量
        this.updateCategoryProductCounts()
      } catch (error) {
        this.error = {
          message: error.message || 'Failed to fetch products',
          type: 'network',
          timestamp: new Date().toISOString(),
          retryable: true
        }
        console.error('Failed to fetch products:', error)
        throw error // 重新抛出错误以便组件处理
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 获取分类数据
     * @returns {Promise<void>}
     */
    async fetchCategories() {
      this.loading = true
      this.error = null
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // 模拟网络错误（3%概率）
        if (Math.random() < 0.03) {
          throw new Error('Network error: Failed to fetch categories')
        }
        
        this.categories = updateCategoryProductCounts()
      } catch (error) {
        this.error = {
          message: error.message || 'Failed to fetch categories',
          type: 'network',
          timestamp: new Date().toISOString(),
          retryable: true
        }
        console.error('Failed to fetch categories:', error)
        throw error // 重新抛出错误以便组件处理
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 设置页面大小
     * @param {number} size - 每页商品数量
     */
    setPageSize(size) {
      this.pageSize = Math.max(1, size)
      this.currentPage = 1 // 重置到第一页
    },
    
    /**
     * 跳转到指定页面
     * @param {number} page - 页码
     */
    goToPage(page) {
      const maxPage = this.totalPages
      this.currentPage = Math.max(1, Math.min(page, maxPage))
    },
    
    /**
     * 下一页
     */
    nextPage() {
      if (this.hasMorePages) {
        this.currentPage++
      }
    },
    
    /**
     * 上一页
     */
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    
    /**
     * 加载更多商品（无限滚动）
     * @returns {Product[]} 新加载的商品
     */
    loadMore() {
      if (this.hasMorePages) {
        this.nextPage()
        return this.paginatedProducts
      }
      return []
    },
    
    /**
     * 重置分页
     */
    resetPagination() {
      this.currentPage = 1
      this.hasMore = true
    },
    
    /**
     * 搜索商品
     * @param {string} keyword - 搜索关键词
     */
    searchProducts(keyword) {
      this.searchKeyword = keyword
      this.currentCategory = null // 搜索时清除分类筛选
      this.resetPagination() // 重置分页
    },
    
    /**
     * 按分类筛选商品
     * @param {string|null} categoryId - 分类ID
     */
    filterByCategory(categoryId) {
      this.currentCategory = categoryId
      this.searchKeyword = '' // 分类筛选时清除搜索关键词
      this.resetPagination() // 重置分页
    },
    
    /**
     * 设置商品排序方式
     * @param {SortOption} sortType - 排序类型
     */
    sortProducts(sortType) {
      this.sortBy = sortType
      this.resetPagination() // 重置分页
    },
    
    /**
     * 设置价格筛选
     * @param {number|null} minPrice - 最低价格
     * @param {number|null} maxPrice - 最高价格
     */
    setPriceFilter(minPrice, maxPrice) {
      this.filters.minPrice = minPrice
      this.filters.maxPrice = maxPrice
      this.resetPagination() // 重置分页
    },
    
    /**
     * 设置评分筛选
     * @param {number|null} minRating - 最低评分
     */
    setRatingFilter(minRating) {
      this.filters.minRating = minRating
      this.resetPagination() // 重置分页
    },
    
    /**
     * 设置标签筛选
     * @param {string[]} tags - 标签列表
     */
    setTagsFilter(tags) {
      this.filters.tags = tags || []
      this.resetPagination() // 重置分页
    },
    
    /**
     * 设置库存筛选
     * @param {boolean} inStock - 是否只显示有库存的商品
     */
    setStockFilter(inStock) {
      this.filters.inStock = inStock
      this.resetPagination() // 重置分页
    },
    
    /**
     * 清除所有筛选条件
     */
    clearFilters() {
      this.currentCategory = null
      this.searchKeyword = ''
      this.sortBy = 'default'
      this.filters = {
        minPrice: null,
        maxPrice: null,
        minRating: null,
        tags: [],
        inStock: false
      }
      this.resetPagination() // 重置分页
    },
    
    /**
     * 根据ID获取商品
     * @param {string} id - 商品ID
     * @returns {Product|undefined} 商品信息
     */
    getProductById(id) {
      return this.products.find(product => product.id === id)
    },
    
    /**
     * 根据ID获取分类
     * @param {string} id - 分类ID
     * @returns {Category|undefined} 分类信息
     */
    getCategoryById(id) {
      return this.categories.find(category => category.id === id)
    },
    
    /**
     * 更新分类商品数量
     */
    updateCategoryProductCounts() {
      this.categories.forEach(category => {
        category.productCount = this.products.filter(product => product.category === category.id).length
      })
    },
    
    /**
     * 初始化商品数据
     * @returns {Promise<void>}
     */
    async initialize() {
      await Promise.all([
        this.fetchProducts(),
        this.fetchCategories()
      ])
    },
    
    /**
     * 切换商品收藏状态
     * @param {string} productId - 商品ID
     */
    toggleFavorite(productId) {
      const product = this.getProductById(productId)
      if (product) {
        product.isFavorite = !product.isFavorite
        // 这里可以添加持久化逻辑
        this.saveToLocalStorage()
      }
    },
    
    /**
     * 获取收藏的商品
     * @returns {Product[]} 收藏商品列表
     */
    getFavoriteProducts() {
      return this.products.filter(product => product.isFavorite)
    },
    
    /**
     * 批量更新商品库存
     * @param {Object<string, number>} stockUpdates - 库存更新数据 {productId: newStock}
     */
    updateProductStock(stockUpdates) {
      Object.entries(stockUpdates).forEach(([productId, newStock]) => {
        const product = this.getProductById(productId)
        if (product) {
          product.stock = Math.max(0, newStock)
        }
      })
      this.saveToLocalStorage()
    },
    
    /**
     * 保存到本地存储
     */
    saveToLocalStorage() {
      try {
        const dataToSave = {
          products: this.products,
          favorites: this.products.filter(p => p.isFavorite).map(p => p.id)
        }
        localStorage.setItem('mall-products', JSON.stringify(dataToSave))
      } catch (error) {
        console.error('Failed to save products to localStorage:', error)
      }
    },
    
    /**
     * 从本地存储加载
     */
    loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem('mall-products')
        if (saved) {
          const data = JSON.parse(saved)
          if (data.favorites && Array.isArray(data.favorites)) {
            // 恢复收藏状态
            this.products.forEach(product => {
              product.isFavorite = data.favorites.includes(product.id)
            })
          }
        }
      } catch (error) {
        console.error('Failed to load products from localStorage:', error)
      }
    },

    /**
     * 获取商品统计信息
     * @returns {Object} 统计信息
     */
    getProductStats() {
      const stats = {
        totalProducts: this.products.length,
        totalCategories: this.categories.length,
        averagePrice: 0,
        averageRating: 0,
        outOfStockCount: 0,
        onSaleCount: 0
      }

      if (this.products.length > 0) {
        const totalPrice = this.products.reduce((sum, p) => sum + p.price, 0)
        const totalRating = this.products.reduce((sum, p) => sum + p.rating, 0)
        
        stats.averagePrice = Math.round(totalPrice / this.products.length)
        stats.averageRating = Math.round((totalRating / this.products.length) * 10) / 10
        stats.outOfStockCount = this.products.filter(p => p.stock === 0).length
        stats.onSaleCount = this.products.filter(p => p.originalPrice && p.originalPrice > p.price).length
      }

      return stats
    },

    /**
     * 批量操作商品
     * @param {string[]} productIds - 商品ID列表
     * @param {string} action - 操作类型 ('favorite', 'unfavorite', 'updateStock')
     * @param {*} payload - 操作参数
     */
    batchUpdateProducts(productIds, action, payload = null) {
      productIds.forEach(productId => {
        const product = this.getProductById(productId)
        if (product) {
          switch (action) {
            case 'favorite':
              product.isFavorite = true
              break
            case 'unfavorite':
              product.isFavorite = false
              break
            case 'updateStock':
              if (typeof payload === 'number') {
                product.stock = Math.max(0, payload)
              }
              break
          }
        }
      })
      this.saveToLocalStorage()
    },

    /**
     * 获取相关商品推荐
     * @param {string} productId - 商品ID
     * @param {number} limit - 推荐数量限制
     * @returns {Product[]} 相关商品列表
     */
    getRelatedProducts(productId, limit = 4) {
      const product = this.getProductById(productId)
      if (!product) return []

      // 基于分类和标签的相关性推荐
      const related = this.products
        .filter(p => p.id !== productId)
        .map(p => {
          let score = 0
          
          // 同分类加分
          if (p.category === product.category) score += 3
          
          // 共同标签加分
          const commonTags = p.tags.filter(tag => product.tags.includes(tag))
          score += commonTags.length
          
          // 价格相近加分
          const priceDiff = Math.abs(p.price - product.price)
          const priceRange = product.price * 0.5 // 50%价格范围
          if (priceDiff <= priceRange) score += 1
          
          return { product: p, score }
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.product)

      return related
    }
  }
})