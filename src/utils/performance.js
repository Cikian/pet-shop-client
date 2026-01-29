/**
 * 性能优化工具模块
 * 提供预加载、性能监控和优化功能
 */

/**
 * 预加载关键路由组件
 * @param {Array} routes - 需要预加载的路由名称数组
 */
export function preloadRoutes(routes = []) {
  if (typeof window === 'undefined') return

  // 在空闲时间预加载路由组件
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      routes.forEach(routeName => {
        preloadRoute(routeName)
      })
    })
  } else {
    // 降级方案：使用setTimeout
    setTimeout(() => {
      routes.forEach(routeName => {
        preloadRoute(routeName)
      })
    }, 2000)
  }
}

/**
 * 预加载单个路由组件
 * @param {string} routeName - 路由名称
 */
function preloadRoute(routeName) {
  const routeMap = {
    'Category': () => import('@/views/Category.vue'),
    'Product': () => import('@/views/Product.vue'),
    'Cart': () => import('@/views/Cart.vue'),
    'Search': () => import('@/views/Search.vue')
  }

  if (routeMap[routeName]) {
    routeMap[routeName]().catch(err => {
      console.warn(`预加载路由 ${routeName} 失败:`, err)
    })
  }
}

/**
 * 预加载关键图片资源
 * @param {Array} imageUrls - 图片URL数组
 */
export function preloadImages(imageUrls = []) {
  if (typeof window === 'undefined') return

  imageUrls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = url
    document.head.appendChild(link)
  })
}

/**
 * 监控首屏加载性能
 */
export function monitorFirstScreenPerformance() {
  if (typeof window === 'undefined') return

  // 监控 LCP (Largest Contentful Paint)
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      console.log('LCP (首屏最大内容绘制时间):', lastEntry.startTime, 'ms')
      
      // 如果LCP超过2.5秒，记录警告
      if (lastEntry.startTime > 2500) {
        console.warn('首屏加载时间过长，建议优化')
      }
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] })
  }

  // 监控 FCP (First Contentful Paint)
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        console.log('FCP (首次内容绘制时间):', entry.startTime, 'ms')
      })
    })
    
    observer.observe({ entryTypes: ['paint'] })
  }

  // 监控页面加载完成时间
  window.addEventListener('load', () => {
    const loadTime = performance.now()
    console.log('页面完全加载时间:', loadTime, 'ms')
    
    // 记录性能指标到本地存储（用于分析）
    const perfData = {
      loadTime,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    }
    
    try {
      const existingData = JSON.parse(localStorage.getItem('performance_data') || '[]')
      existingData.push(perfData)
      
      // 只保留最近10次的性能数据
      if (existingData.length > 10) {
        existingData.splice(0, existingData.length - 10)
      }
      
      localStorage.setItem('performance_data', JSON.stringify(existingData))
    } catch (error) {
      console.warn('保存性能数据失败:', error)
    }
  })
}

/**
 * 获取性能数据
 * @returns {Array} 性能数据数组
 */
export function getPerformanceData() {
  try {
    return JSON.parse(localStorage.getItem('performance_data') || '[]')
  } catch (error) {
    console.warn('读取性能数据失败:', error)
    return []
  }
}

/**
 * 优化图片加载
 * @param {HTMLImageElement} img - 图片元素
 * @param {string} src - 图片源地址
 * @param {Object} options - 配置选项
 */
export function optimizeImageLoading(img, src, options = {}) {
  const {
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
    errorPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yPC90ZXh0Pjwvc3ZnPg==',
    fadeIn = true
  } = options

  // 设置占位符
  img.src = placeholder
  
  // 创建新的图片对象用于预加载
  const newImg = new Image()
  
  newImg.onload = () => {
    // 图片加载成功，替换源地址
    img.src = src
    
    // 添加淡入效果
    if (fadeIn) {
      img.style.opacity = '0'
      img.style.transition = 'opacity 0.3s ease-in-out'
      
      // 强制重绘后设置透明度
      requestAnimationFrame(() => {
        img.style.opacity = '1'
      })
    }
  }
  
  newImg.onerror = () => {
    // 图片加载失败，显示错误占位符
    img.src = errorPlaceholder
  }
  
  // 开始加载图片
  newImg.src = src
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}