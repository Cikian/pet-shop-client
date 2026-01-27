import { defineStore } from 'pinia'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    categories: [],
    currentCategory: null,
    searchKeyword: '',
    sortBy: 'default',
    loading: false
  }),
  
  getters: {
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
        default:
          // 保持默认顺序
          break
      }
      
      return filtered
    }
  },
  
  actions: {
    async fetchProducts() {
      this.loading = true
      try {
        // 模拟API调用 - 实际项目中这里会是真实的API请求
        await new Promise(resolve => setTimeout(resolve, 500))
        // 这里会被实际的产品数据替换
        this.products = []
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        this.loading = false
      }
    },
    
    async fetchCategories() {
      this.loading = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 300))
        // 这里会被实际的分类数据替换
        this.categories = []
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        this.loading = false
      }
    },
    
    searchProducts(keyword) {
      this.searchKeyword = keyword
    },
    
    filterByCategory(categoryId) {
      this.currentCategory = categoryId
    },
    
    sortProducts(sortType) {
      this.sortBy = sortType
    },
    
    getProductById(id) {
      return this.products.find(product => product.id === id)
    }
  }
})