/**
 * 移动端工具函数
 * 提供移动端特定的功能和优化
 */

/**
 * 检测是否为移动设备
 * @returns {boolean} 是否为移动设备
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 检测是否为触摸设备
 * @returns {boolean} 是否支持触摸
 */
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * 获取设备类型
 * @returns {string} 设备类型: 'mobile', 'tablet', 'desktop'
 */
export const getDeviceType = () => {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

/**
 * 防止移动端双击缩放
 * @param {HTMLElement} element - 目标元素
 */
export const preventDoubleClickZoom = (element) => {
  let lastTouchEnd = 0
  element.addEventListener('touchend', (event) => {
    const now = new Date().getTime()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  }, false)
}

/**
 * 触摸滑动检测
 * @param {HTMLElement} element - 目标元素
 * @param {object} callbacks - 回调函数 {onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown}
 * @param {number} threshold - 滑动阈值，默认50px
 */
export const addSwipeListener = (element, callbacks, threshold = 50) => {
  let startX = 0
  let startY = 0
  let endX = 0
  let endY = 0

  element.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
  }, { passive: true })

  element.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX
    endY = e.changedTouches[0].clientY
    handleSwipe()
  }, { passive: true })

  const handleSwipe = () => {
    const deltaX = endX - startX
    const deltaY = endY - startY
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // 水平滑动
    if (absDeltaX > absDeltaY && absDeltaX > threshold) {
      if (deltaX > 0 && callbacks.onSwipeRight) {
        callbacks.onSwipeRight()
      } else if (deltaX < 0 && callbacks.onSwipeLeft) {
        callbacks.onSwipeLeft()
      }
    }
    // 垂直滑动
    else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
      if (deltaY > 0 && callbacks.onSwipeDown) {
        callbacks.onSwipeDown()
      } else if (deltaY < 0 && callbacks.onSwipeUp) {
        callbacks.onSwipeUp()
      }
    }
  }

  // 返回清理函数
  return () => {
    element.removeEventListener('touchstart', () => {})
    element.removeEventListener('touchend', () => {})
  }
}

/**
 * 长按检测
 * @param {HTMLElement} element - 目标元素
 * @param {function} callback - 长按回调
 * @param {number} duration - 长按时长，默认500ms
 */
export const addLongPressListener = (element, callback, duration = 500) => {
  let timer = null
  let isLongPress = false

  const start = () => {
    isLongPress = false
    timer = setTimeout(() => {
      isLongPress = true
      callback()
    }, duration)
  }

  const end = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const cancel = () => {
    end()
    isLongPress = false
  }

  element.addEventListener('touchstart', start, { passive: true })
  element.addEventListener('touchend', end, { passive: true })
  element.addEventListener('touchcancel', cancel, { passive: true })
  element.addEventListener('touchmove', cancel, { passive: true })

  // 返回清理函数
  return () => {
    element.removeEventListener('touchstart', start)
    element.removeEventListener('touchend', end)
    element.removeEventListener('touchcancel', cancel)
    element.removeEventListener('touchmove', cancel)
    if (timer) {
      clearTimeout(timer)
    }
  }
}

/**
 * 优化移动端滚动性能
 * @param {HTMLElement} element - 滚动容器
 */
export const optimizeScrolling = (element) => {
  // 启用硬件加速
  element.style.transform = 'translateZ(0)'
  element.style.willChange = 'scroll-position'
  
  // iOS 平滑滚动
  element.style.webkitOverflowScrolling = 'touch'
  
  // 防止滚动穿透
  element.addEventListener('touchmove', (e) => {
    const target = e.target
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight
    const height = element.clientHeight
    
    if (scrollTop === 0 && e.touches[0].clientY > e.touches[0].clientY) {
      e.preventDefault()
    } else if (scrollTop + height >= scrollHeight && e.touches[0].clientY < e.touches[0].clientY) {
      e.preventDefault()
    }
  }, { passive: false })
}

/**
 * 移动端键盘适配
 * @param {function} onShow - 键盘显示回调
 * @param {function} onHide - 键盘隐藏回调
 */
export const handleMobileKeyboard = (onShow, onHide) => {
  const initialViewportHeight = window.innerHeight
  
  const handleResize = () => {
    const currentHeight = window.innerHeight
    const heightDiff = initialViewportHeight - currentHeight
    
    // 高度差超过150px认为是键盘弹出
    if (heightDiff > 150) {
      onShow && onShow(heightDiff)
    } else {
      onHide && onHide()
    }
  }
  
  window.addEventListener('resize', handleResize)
  
  // 返回清理函数
  return () => {
    window.removeEventListener('resize', handleResize)
  }
}

/**
 * 移动端安全区域适配
 * @returns {object} 安全区域信息
 */
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement)
  
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
  }
}

/**
 * 设置移动端视口
 */
export const setupMobileViewport = () => {
  // 设置视口元标签
  let viewport = document.querySelector('meta[name="viewport"]')
  if (!viewport) {
    viewport = document.createElement('meta')
    viewport.name = 'viewport'
    document.head.appendChild(viewport)
  }
  
  viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
  
  // 设置安全区域CSS变量
  if (CSS.supports('padding: env(safe-area-inset-top)')) {
    document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)')
    document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)')
    document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)')
    document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)')
  }
}

/**
 * 移动端性能优化
 */
export const optimizeMobilePerformance = () => {
  // 禁用移动端选择文本
  document.body.style.webkitUserSelect = 'none'
  document.body.style.userSelect = 'none'
  
  // 禁用移动端长按菜单
  document.body.style.webkitTouchCallout = 'none'
  
  // 优化点击延迟
  document.body.style.touchAction = 'manipulation'
  
  // 启用硬件加速
  document.body.style.transform = 'translateZ(0)'
}

/**
 * 移动端图片懒加载优化
 * @param {HTMLImageElement} img - 图片元素
 * @param {string} src - 图片源
 * @param {string} placeholder - 占位图
 */
export const optimizeMobileImage = (img, src, placeholder) => {
  // 设置占位图
  img.src = placeholder
  
  // 创建新图片对象预加载
  const newImg = new Image()
  newImg.onload = () => {
    img.src = src
    img.classList.add('loaded')
  }
  
  // 根据设备像素比选择合适的图片
  const devicePixelRatio = window.devicePixelRatio || 1
  if (devicePixelRatio > 1) {
    // 高分辨率设备使用2x图片
    newImg.src = src.replace(/\.(jpg|jpeg|png|webp)$/i, '@2x.$1')
  } else {
    newImg.src = src
  }
}

/**
 * 移动端手势识别
 * @param {HTMLElement} element - 目标元素
 * @returns {object} 手势识别器
 */
export const createGestureRecognizer = (element) => {
  let startTime = 0
  let startX = 0
  let startY = 0
  let currentX = 0
  let currentY = 0
  let isMoving = false
  
  const callbacks = {
    onTap: null,
    onDoubleTap: null,
    onLongPress: null,
    onSwipe: null,
    onPinch: null
  }
  
  let lastTap = 0
  let longPressTimer = null
  
  element.addEventListener('touchstart', (e) => {
    startTime = Date.now()
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
    currentX = startX
    currentY = startY
    isMoving = false
    
    // 长按检测
    longPressTimer = setTimeout(() => {
      if (!isMoving && callbacks.onLongPress) {
        callbacks.onLongPress(e)
      }
    }, 500)
  }, { passive: true })
  
  element.addEventListener('touchmove', (e) => {
    currentX = e.touches[0].clientX
    currentY = e.touches[0].clientY
    
    const deltaX = Math.abs(currentX - startX)
    const deltaY = Math.abs(currentY - startY)
    
    if (deltaX > 10 || deltaY > 10) {
      isMoving = true
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        longPressTimer = null
      }
    }
  }, { passive: true })
  
  element.addEventListener('touchend', (e) => {
    const endTime = Date.now()
    const duration = endTime - startTime
    const deltaX = currentX - startX
    const deltaY = currentY - startY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
    
    // 点击检测
    if (!isMoving && duration < 300) {
      const now = Date.now()
      if (now - lastTap < 300 && callbacks.onDoubleTap) {
        callbacks.onDoubleTap(e)
      } else if (callbacks.onTap) {
        callbacks.onTap(e)
      }
      lastTap = now
    }
    
    // 滑动检测
    if (isMoving && distance > 50 && callbacks.onSwipe) {
      const direction = Math.abs(deltaX) > Math.abs(deltaY) 
        ? (deltaX > 0 ? 'right' : 'left')
        : (deltaY > 0 ? 'down' : 'up')
      
      callbacks.onSwipe({
        direction,
        distance,
        deltaX,
        deltaY,
        duration
      })
    }
  }, { passive: true })
  
  return {
    on: (event, callback) => {
      callbacks[event] = callback
    },
    off: (event) => {
      callbacks[event] = null
    },
    destroy: () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer)
      }
      // 移除事件监听器
      element.removeEventListener('touchstart', () => {})
      element.removeEventListener('touchmove', () => {})
      element.removeEventListener('touchend', () => {})
    }
  }
}