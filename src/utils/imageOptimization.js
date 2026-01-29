/**
 * 图片优化工具函数
 * 提供图片压缩、格式转换、尺寸调整等功能
 */

/**
 * 图片格式支持检测
 */
export const ImageFormats = {
  WEBP: 'webp',
  AVIF: 'avif',
  JPEG: 'jpeg',
  PNG: 'png'
}

/**
 * 检测浏览器是否支持指定图片格式
 * @param {string} format - 图片格式
 * @returns {Promise<boolean>} 是否支持
 */
export const supportsImageFormat = (format) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, 1, 1)
    
    canvas.toBlob((blob) => {
      resolve(blob !== null)
    }, `image/${format}`)
  })
}

/**
 * 获取最佳图片格式
 * @returns {Promise<string>} 最佳格式
 */
export const getBestImageFormat = async () => {
  // 按优先级检测格式支持
  const formats = [ImageFormats.AVIF, ImageFormats.WEBP, ImageFormats.JPEG]
  
  for (const format of formats) {
    if (await supportsImageFormat(format)) {
      return format
    }
  }
  
  return ImageFormats.JPEG // 默认格式
}

/**
 * 生成响应式图片URL
 * @param {string} baseUrl - 基础URL
 * @param {Object} options - 选项
 * @param {number} options.width - 宽度
 * @param {number} options.height - 高度
 * @param {string} options.format - 格式
 * @param {number} options.quality - 质量 (1-100)
 * @returns {string} 优化后的URL
 */
export const generateOptimizedImageUrl = (baseUrl, options = {}) => {
  const {
    width,
    height,
    format = 'auto',
    quality = 80
  } = options
  
  // 如果是外部URL或已经是优化过的URL，直接返回
  if (baseUrl.startsWith('http') && !baseUrl.includes('placeholder')) {
    return baseUrl
  }
  
  // 构建优化参数
  const params = new URLSearchParams()
  
  if (width) params.append('w', width.toString())
  if (height) params.append('h', height.toString())
  if (format !== 'auto') params.append('f', format)
  if (quality !== 80) params.append('q', quality.toString())
  
  // 如果没有参数，返回原URL
  if (params.toString() === '') {
    return baseUrl
  }
  
  // 添加参数到URL
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}${params.toString()}`
}

/**
 * 根据设备像素比生成srcset
 * @param {string} baseUrl - 基础URL
 * @param {Object} options - 选项
 * @param {number[]} options.widths - 宽度数组
 * @param {string} options.format - 格式
 * @param {number} options.quality - 质量
 * @returns {string} srcset字符串
 */
export const generateSrcSet = (baseUrl, options = {}) => {
  const {
    widths = [320, 640, 960, 1280, 1920],
    format = 'auto',
    quality = 80
  } = options
  
  return widths
    .map(width => {
      const url = generateOptimizedImageUrl(baseUrl, {
        width,
        format,
        quality
      })
      return `${url} ${width}w`
    })
    .join(', ')
}

/**
 * 生成sizes属性
 * @param {Object[]} breakpoints - 断点配置
 * @returns {string} sizes字符串
 */
export const generateSizes = (breakpoints = []) => {
  const defaultBreakpoints = [
    { maxWidth: 640, size: '100vw' },
    { maxWidth: 1024, size: '50vw' },
    { size: '33vw' }
  ]
  
  const points = breakpoints.length > 0 ? breakpoints : defaultBreakpoints
  
  return points
    .map(bp => {
      if (bp.maxWidth) {
        return `(max-width: ${bp.maxWidth}px) ${bp.size}`
      }
      return bp.size
    })
    .join(', ')
}

/**
 * 预加载关键图片
 * @param {string[]} urls - 图片URL数组
 * @param {Object} options - 选项
 * @param {string} options.as - 资源类型
 * @param {string} options.crossorigin - 跨域设置
 */
export const preloadImages = (urls, options = {}) => {
  const { as = 'image', crossorigin = 'anonymous' } = options
  
  urls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = as
    link.href = url
    if (crossorigin) {
      link.crossOrigin = crossorigin
    }
    document.head.appendChild(link)
  })
}

/**
 * 图片压缩
 * @param {File} file - 图片文件
 * @param {Object} options - 压缩选项
 * @param {number} options.maxWidth - 最大宽度
 * @param {number} options.maxHeight - 最大高度
 * @param {number} options.quality - 质量 (0-1)
 * @param {string} options.format - 输出格式
 * @returns {Promise<Blob>} 压缩后的图片
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'image/jpeg'
    } = options
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // 计算新尺寸
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }
      
      // 设置画布尺寸
      canvas.width = width
      canvas.height = height
      
      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height)
      
      // 转换为Blob
      canvas.toBlob(resolve, format, quality)
    }
    
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 获取图片信息
 * @param {string} url - 图片URL
 * @returns {Promise<Object>} 图片信息
 */
export const getImageInfo = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
        url: img.src
      })
    }
    
    img.onerror = reject
    img.src = url
  })
}

/**
 * 创建占位符图片
 * @param {Object} options - 选项
 * @param {number} options.width - 宽度
 * @param {number} options.height - 高度
 * @param {string} options.backgroundColor - 背景色
 * @param {string} options.textColor - 文字颜色
 * @param {string} options.text - 显示文字
 * @returns {string} Data URL
 */
export const createPlaceholder = (options = {}) => {
  const {
    width = 300,
    height = 200,
    backgroundColor = '#f5f5f5',
    textColor = '#cccccc',
    text = '加载中...'
  } = options
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = width
  canvas.height = height
  
  // 绘制背景
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)
  
  // 绘制文字
  ctx.fillStyle = textColor
  ctx.font = `${Math.min(width, height) / 10}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, width / 2, height / 2)
  
  return canvas.toDataURL()
}

/**
 * 图片懒加载观察器
 */
export class ImageLazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    }
    
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    )
    
    this.loadedImages = new Set()
  }
  
  /**
   * 观察图片元素
   * @param {HTMLElement} element - 图片元素
   */
  observe(element) {
    this.observer.observe(element)
  }
  
  /**
   * 停止观察图片元素
   * @param {HTMLElement} element - 图片元素
   */
  unobserve(element) {
    this.observer.unobserve(element)
  }
  
  /**
   * 处理交叉观察
   * @param {IntersectionObserverEntry[]} entries - 观察条目
   */
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !this.loadedImages.has(entry.target)) {
        this.loadImage(entry.target)
        this.loadedImages.add(entry.target)
        this.observer.unobserve(entry.target)
      }
    })
  }
  
  /**
   * 加载图片
   * @param {HTMLElement} element - 图片元素
   */
  loadImage(element) {
    const src = element.dataset.src
    const srcset = element.dataset.srcset
    
    if (src) {
      element.src = src
    }
    
    if (srcset) {
      element.srcset = srcset
    }
    
    element.classList.add('loaded')
    
    // 触发自定义事件
    element.dispatchEvent(new CustomEvent('lazyload', {
      detail: { src, srcset }
    }))
  }
  
  /**
   * 销毁观察器
   */
  destroy() {
    this.observer.disconnect()
    this.loadedImages.clear()
  }
}

/**
 * 默认图片懒加载实例
 */
export const defaultLazyLoader = new ImageLazyLoader()

/**
 * 图片缓存管理
 */
export class ImageCache {
  constructor(maxSize = 50) {
    this.cache = new Map()
    this.maxSize = maxSize
  }
  
  /**
   * 获取缓存的图片
   * @param {string} url - 图片URL
   * @returns {Promise<HTMLImageElement>|null} 缓存的图片
   */
  get(url) {
    return this.cache.get(url) || null
  }
  
  /**
   * 缓存图片
   * @param {string} url - 图片URL
   * @returns {Promise<HTMLImageElement>} 图片元素
   */
  set(url) {
    if (this.cache.has(url)) {
      return this.cache.get(url)
    }
    
    const promise = new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
    
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(url, promise)
    return promise
  }
  
  /**
   * 清除缓存
   */
  clear() {
    this.cache.clear()
  }
  
  /**
   * 获取缓存大小
   * @returns {number} 缓存大小
   */
  size() {
    return this.cache.size
  }
}

/**
 * 默认图片缓存实例
 */
export const defaultImageCache = new ImageCache()