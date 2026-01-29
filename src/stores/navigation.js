import { defineStore } from 'pinia'

/**
 * 导航状态管理 Store
 * 管理页面导航历史、面包屑、返回逻辑等
 */
export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    /** @type {Array<{name: string, params: object, query: object, title: string, timestamp: number}>} */
    history: [],
    /** @type {number} */
    maxHistoryLength: 20,
    /** @type {string|null} */
    previousRoute: null,
    /** @type {boolean} */
    canGoBack: false
  }),
  
  getters: {
    /**
     * 获取导航历史记录
     * @returns {Array} 历史记录
     */
    navigationHistory: (state) => state.history,
    
    /**
     * 获取上一个页面信息
     * @returns {object|null} 上一个页面
     */
    previousPage: (state) => {
      return state.history.length > 1 ? state.history[state.history.length - 2] : null
    },
    
    /**
     * 获取当前页面信息
     * @returns {object|null} 当前页面
     */
    currentPage: (state) => {
      return state.history.length > 0 ? state.history[state.history.length - 1] : null
    },
    
    /**
     * 是否可以返回上一页
     * @returns {boolean} 是否可以返回
     */
    canNavigateBack: (state) => {
      return state.history.length > 1 || state.canGoBack
    },
    
    /**
     * 获取面包屑路径
     * @returns {function} 生成面包屑的函数
     */
    getBreadcrumbPath: (state) => (currentRoute) => {
      const breadcrumbs = [{ label: '首页', to: { name: 'Home' } }]
      
      switch (currentRoute.name) {
        case 'Category':
          if (currentRoute.params.id) {
            breadcrumbs.push({ 
              label: '商品分类', 
              to: { name: 'Category' } 
            })
          } else {
            breadcrumbs.push({ label: '所有分类' })
          }
          break
          
        case 'Product':
          // 如果有分类信息，添加分类面包屑
          const productCategory = currentRoute.meta?.category
          if (productCategory) {
            breadcrumbs.push({
              label: '商品分类',
              to: { name: 'Category' }
            })
            breadcrumbs.push({
              label: productCategory.name,
              to: { name: 'Category', params: { id: productCategory.id } }
            })
          }
          breadcrumbs.push({ label: '商品详情' })
          break
          
        case 'Search':
          breadcrumbs.push({ label: '搜索结果' })
          break
          
        case 'Cart':
          breadcrumbs.push({ label: '购物车' })
          break
          
        default:
          break
      }
      
      return breadcrumbs
    }
  },
  
  actions: {
    /**
     * 添加页面到导航历史
     * @param {object} route - 路由信息
     */
    addToHistory(route) {
      const historyItem = {
        name: route.name,
        params: { ...route.params },
        query: { ...route.query },
        title: route.meta?.title || route.name,
        timestamp: Date.now(),
        fullPath: route.fullPath
      }
      
      // 避免重复添加相同页面
      const lastItem = this.history[this.history.length - 1]
      if (lastItem && lastItem.fullPath === historyItem.fullPath) {
        return
      }
      
      this.history.push(historyItem)
      
      // 限制历史记录长度
      if (this.history.length > this.maxHistoryLength) {
        this.history = this.history.slice(-this.maxHistoryLength)
      }
      
      // 更新返回状态
      this.canGoBack = this.history.length > 1
    },
    
    /**
     * 移除最后一个历史记录
     */
    removeLastHistory() {
      if (this.history.length > 0) {
        this.history.pop()
        this.canGoBack = this.history.length > 1
      }
    },
    
    /**
     * 清空导航历史
     */
    clearHistory() {
      this.history = []
      this.canGoBack = false
    },
    
    /**
     * 设置上一个路由
     * @param {string} routeName - 路由名称
     */
    setPreviousRoute(routeName) {
      this.previousRoute = routeName
    },
    
    /**
     * 获取智能返回路由
     * @param {object} currentRoute - 当前路由
     * @returns {object} 返回路由信息
     */
    getSmartBackRoute(currentRoute) {
      // 优先使用历史记录
      const previousPage = this.previousPage
      if (previousPage && previousPage.name !== currentRoute.name) {
        return {
          name: previousPage.name,
          params: previousPage.params,
          query: previousPage.query
        }
      }
      
      // 根据当前页面类型智能返回
      switch (currentRoute.name) {
        case 'Product':
          // 商品详情页返回到分类页或首页
          if (currentRoute.meta?.category) {
            return {
              name: 'Category',
              params: { id: currentRoute.meta.category.id }
            }
          }
          return { name: 'Home' }
          
        case 'Category':
          return { name: 'Home' }
          
        case 'Search':
          return { name: 'Home' }
          
        case 'Cart':
          // 购物车返回到上一个购物页面或首页
          const shoppingPages = ['Home', 'Category', 'Product', 'Search']
          const lastShoppingPage = this.history
            .slice()
            .reverse()
            .find(item => shoppingPages.includes(item.name))
          
          if (lastShoppingPage) {
            return {
              name: lastShoppingPage.name,
              params: lastShoppingPage.params,
              query: lastShoppingPage.query
            }
          }
          return { name: 'Home' }
          
        default:
          return { name: 'Home' }
      }
    },
    
    /**
     * 记录用户购物流程
     * @param {string} action - 操作类型
     * @param {object} data - 操作数据
     */
    trackShoppingFlow(action, data = {}) {
      const flowItem = {
        action,
        data,
        timestamp: Date.now(),
        route: this.currentPage?.name
      }
      
      // 这里可以添加用户行为分析逻辑
      console.log('Shopping flow:', flowItem)
      
      // 可以发送到分析服务
      this.sendAnalytics(flowItem)
    },
    
    /**
     * 发送分析数据
     * @param {object} data - 分析数据
     */
    sendAnalytics(data) {
      // 模拟发送分析数据
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics:', data)
      }
      
      // 实际项目中可以集成 Google Analytics, 百度统计等
      // gtag('event', data.action, { ...data.data })
    },
    
    /**
     * 获取用户购物路径分析
     * @returns {object} 购物路径分析
     */
    getShoppingPathAnalysis() {
      const pathAnalysis = {
        totalPages: this.history.length,
        uniquePages: new Set(this.history.map(item => item.name)).size,
        averageTimePerPage: 0,
        mostVisitedPages: {},
        conversionFunnel: {
          home: 0,
          category: 0,
          product: 0,
          cart: 0
        }
      }
      
      // 统计页面访问次数
      this.history.forEach(item => {
        pathAnalysis.mostVisitedPages[item.name] = 
          (pathAnalysis.mostVisitedPages[item.name] || 0) + 1
        
        // 转化漏斗统计
        if (item.name === 'Home') pathAnalysis.conversionFunnel.home++
        else if (item.name === 'Category') pathAnalysis.conversionFunnel.category++
        else if (item.name === 'Product') pathAnalysis.conversionFunnel.product++
        else if (item.name === 'Cart') pathAnalysis.conversionFunnel.cart++
      })
      
      // 计算平均停留时间
      if (this.history.length > 1) {
        const totalTime = this.history[this.history.length - 1].timestamp - this.history[0].timestamp
        pathAnalysis.averageTimePerPage = Math.round(totalTime / this.history.length / 1000) // 秒
      }
      
      return pathAnalysis
    },
    
    /**
     * 保存导航状态到本地存储
     */
    saveToLocalStorage() {
      try {
        const dataToSave = {
          history: this.history.slice(-10), // 只保存最近10条记录
          previousRoute: this.previousRoute
        }
        localStorage.setItem('mall-navigation', JSON.stringify(dataToSave))
      } catch (error) {
        console.error('Failed to save navigation to localStorage:', error)
      }
    },
    
    /**
     * 从本地存储加载导航状态
     */
    loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem('mall-navigation')
        if (saved) {
          const data = JSON.parse(saved)
          if (data.history && Array.isArray(data.history)) {
            this.history = data.history
            this.canGoBack = this.history.length > 1
          }
          if (data.previousRoute) {
            this.previousRoute = data.previousRoute
          }
        }
      } catch (error) {
        console.error('Failed to load navigation from localStorage:', error)
      }
    },
    
    /**
     * 初始化导航状态
     */
    initialize() {
      this.loadFromLocalStorage()
    }
  }
})