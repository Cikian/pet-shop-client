import { defineStore } from 'pinia'

/**
 * 购物车状态管理 Store
 * 管理购物车商品、数量、选择状态等功能
 * @typedef {import('../types/index.js').Product} Product
 * @typedef {import('../types/index.js').CartItem} CartItem
 * @typedef {import('../types/index.js').CartState} CartState
 */
export const useCartStore = defineStore('cart', {
  state: () => ({
    /** @type {CartItem[]} */
    items: [],
    /** @type {boolean} */
    isVisible: false,
    /** @type {boolean} */
    loading: false,
    /** @type {Object|null} */
    error: null
  }),
  
  getters: {
    /**
     * 购物车商品总数量
     * @returns {number} 总数量
     */
    totalCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    
    /**
     * 购物车商品总价格
     * @returns {number} 总价格
     */
    totalPrice: (state) => state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    
    /**
     * 已选中的商品
     * @returns {CartItem[]} 已选中商品列表
     */
    selectedItems: (state) => state.items.filter(item => item.selected),
    
    /**
     * 已选中商品的总价格
     * @returns {number} 已选中商品总价格
     */
    selectedTotalPrice: (state) => {
      return state.items
        .filter(item => item.selected)
        .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    },
    
    /**
     * 已选中商品的总数量
     * @returns {number} 已选中商品总数量
     */
    selectedTotalCount: (state) => {
      return state.items
        .filter(item => item.selected)
        .reduce((sum, item) => sum + item.quantity, 0)
    },
    
    /**
     * 检查商品是否在购物车中
     * @returns {function(string): boolean} 检查函数
     */
    isInCart: (state) => (productId) => {
      return state.items.some(item => item.product.id === productId)
    },
    
    /**
     * 获取购物车中商品的数量
     * @returns {function(string): number} 获取数量函数
     */
    getItemQuantity: (state) => (productId) => {
      const item = state.items.find(item => item.product.id === productId)
      return item ? item.quantity : 0
    }
  },
  
  actions: {
    /**
     * 添加商品到购物车
     * @param {Product} product - 商品信息
     * @param {number} quantity - 数量
     */
    addItem(product, quantity = 1) {
      const existingItem = this.items.find(item => item.product.id === product.id)
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({
          product,
          quantity,
          selected: true,
          addedAt: new Date()
        })
      }
      this.saveToLocalStorage()
    },
    
    /**
     * 从购物车移除商品
     * @param {string} productId - 商品ID
     */
    removeItem(productId) {
      const index = this.items.findIndex(item => item.product.id === productId)
      if (index > -1) {
        this.items.splice(index, 1)
        this.saveToLocalStorage()
      }
    },
    
    /**
     * 更新商品数量
     * @param {string} productId - 商品ID
     * @param {number} quantity - 新数量
     */
    updateQuantity(productId, quantity) {
      const item = this.items.find(item => item.product.id === productId)
      if (item) {
        if (quantity <= 0) {
          this.removeItem(productId)
        } else {
          item.quantity = quantity
          this.saveToLocalStorage()
        }
      }
    },
    
    /**
     * 清空购物车
     */
    clearCart() {
      this.items = []
      this.saveToLocalStorage()
    },
    
    /**
     * 切换商品选择状态
     * @param {string} productId - 商品ID
     */
    toggleItemSelection(productId) {
      const item = this.items.find(item => item.product.id === productId)
      if (item) {
        item.selected = !item.selected
        this.saveToLocalStorage()
      }
    },
    
    /**
     * 全选商品
     */
    selectAllItems() {
      this.items.forEach(item => {
        item.selected = true
      })
      this.saveToLocalStorage()
    },
    
    /**
     * 取消全选
     */
    unselectAllItems() {
      this.items.forEach(item => {
        item.selected = false
      })
      this.saveToLocalStorage()
    },
    
    /**
     * 切换购物车可见性
     */
    toggleCartVisibility() {
      this.isVisible = !this.isVisible
    },
    
    /**
     * 显示购物车
     */
    showCart() {
      this.isVisible = true
    },
    
    /**
     * 隐藏购物车
     */
    hideCart() {
      this.isVisible = false
    },
    
    /**
     * 批量添加商品到购物车
     * @param {Array<{product: Product, quantity: number}>} items - 商品列表
     */
    addMultipleItems(items) {
      items.forEach(({ product, quantity }) => {
        this.addItem(product, quantity)
      })
    },
    
    /**
     * 移除已选中的商品
     */
    removeSelectedItems() {
      this.items = this.items.filter(item => !item.selected)
      this.saveToLocalStorage()
    },
    
    /**
     * 保存到本地存储
     */
    saveToLocalStorage() {
      try {
        localStorage.setItem('mall-cart', JSON.stringify(this.items))
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error)
        this.error = {
          message: '购物车数据保存失败',
          type: 'storage',
          timestamp: new Date().toISOString(),
          retryable: true
        }
        throw error
      }
    },
    
    /**
     * 从本地存储加载
     */
    loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem('mall-cart')
        if (saved) {
          const items = JSON.parse(saved)
          // 验证数据结构
          if (Array.isArray(items)) {
            this.items = items.filter(item => 
              item && 
              item.product && 
              typeof item.quantity === 'number' && 
              typeof item.selected === 'boolean'
            ).map(item => ({
              ...item,
              addedAt: item.addedAt ? new Date(item.addedAt) : new Date()
            }))
          }
        }
        this.error = null // 清除之前的错误
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error)
        this.items = []
        this.error = {
          message: '购物车数据加载失败',
          type: 'storage',
          timestamp: new Date().toISOString(),
          retryable: true
        }
      }
    },
    
    /**
     * 初始化购物车，从本地存储加载数据
     */
    initialize() {
      this.loadFromLocalStorage()
    }
  }
})