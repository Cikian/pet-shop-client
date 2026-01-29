import { ref, onMounted, onUnmounted } from 'vue'
import { 
  isMobile, 
  isTouchDevice, 
  getDeviceType,
  addSwipeListener,
  addLongPressListener,
  handleMobileKeyboard,
  setupMobileViewport,
  optimizeMobilePerformance
} from '@/utils/mobile.js'

/**
 * 移动端功能组合式函数
 * 提供移动端检测、触摸交互、性能优化等功能
 */
export function useMobile() {
  // 响应式状态
  const isMobileDevice = ref(false)
  const isTouch = ref(false)
  const deviceType = ref('desktop')
  const orientation = ref('portrait')
  const keyboardVisible = ref(false)
  const safeAreaInsets = ref({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  })

  // 检测设备信息
  const detectDevice = () => {
    isMobileDevice.value = isMobile()
    isTouch.value = isTouchDevice()
    deviceType.value = getDeviceType()
  }

  // 检测屏幕方向
  const detectOrientation = () => {
    orientation.value = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  }

  // 处理屏幕方向变化
  const handleOrientationChange = () => {
    detectOrientation()
    // 延迟执行以确保尺寸更新完成
    setTimeout(() => {
      deviceType.value = getDeviceType()
    }, 100)
  }

  // 处理窗口大小变化
  const handleResize = () => {
    deviceType.value = getDeviceType()
    detectOrientation()
  }

  // 键盘处理
  let keyboardCleanup = null
  const setupKeyboardHandling = () => {
    if (isMobileDevice.value) {
      keyboardCleanup = handleMobileKeyboard(
        (heightDiff) => {
          keyboardVisible.value = true
          document.body.style.paddingBottom = `${heightDiff}px`
        },
        () => {
          keyboardVisible.value = false
          document.body.style.paddingBottom = ''
        }
      )
    }
  }

  // 添加触摸反馈
  const addTouchFeedback = (element) => {
    if (!element || !isTouch.value) return

    element.classList.add('touch-feedback')
    
    const handleTouchStart = () => {
      element.classList.add('touching')
    }
    
    const handleTouchEnd = () => {
      element.classList.remove('touching')
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true })

    // 返回清理函数
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchEnd)
      element.classList.remove('touch-feedback', 'touching')
    }
  }

  // 添加滑动手势
  const addSwipeGesture = (element, callbacks, threshold = 50) => {
    if (!element || !isTouch.value) return null
    return addSwipeListener(element, callbacks, threshold)
  }

  // 添加长按手势
  const addLongPress = (element, callback, duration = 500) => {
    if (!element || !isTouch.value) return null
    return addLongPressListener(element, callback, duration)
  }

  // 防止双击缩放
  const preventZoom = (element) => {
    if (!element || !isMobileDevice.value) return

    let lastTouchEnd = 0
    const handleTouchEnd = (event) => {
      const now = new Date().getTime()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    }

    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }

  // 优化滚动性能
  const optimizeScroll = (element) => {
    if (!element) return

    // 启用硬件加速
    element.style.transform = 'translateZ(0)'
    element.style.willChange = 'scroll-position'
    
    // iOS 平滑滚动
    element.style.webkitOverflowScrolling = 'touch'
    
    // 防止滚动穿透
    const handleTouchMove = (e) => {
      const scrollTop = element.scrollTop
      const scrollHeight = element.scrollHeight
      const height = element.clientHeight
      
      if (scrollTop === 0 && e.touches[0].clientY > e.touches[0].clientY) {
        e.preventDefault()
      } else if (scrollTop + height >= scrollHeight && e.touches[0].clientY < e.touches[0].clientY) {
        e.preventDefault()
      }
    }

    element.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      element.removeEventListener('touchmove', handleTouchMove)
    }
  }

  // 获取安全区域信息
  const updateSafeAreaInsets = () => {
    const style = getComputedStyle(document.documentElement)
    safeAreaInsets.value = {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
    }
  }

  // 初始化移动端优化
  const initializeMobile = () => {
    if (typeof window === 'undefined') return

    detectDevice()
    detectOrientation()
    updateSafeAreaInsets()

    if (isMobileDevice.value) {
      setupMobileViewport()
      optimizeMobilePerformance()
      setupKeyboardHandling()
    }
  }

  // 生命周期
  onMounted(() => {
    initializeMobile()
    
    // 监听事件
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
  })

  onUnmounted(() => {
    // 清理事件监听器
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleOrientationChange)
    
    // 清理键盘处理
    if (keyboardCleanup) {
      keyboardCleanup()
    }
  })

  return {
    // 状态
    isMobileDevice,
    isTouch,
    deviceType,
    orientation,
    keyboardVisible,
    safeAreaInsets,
    
    // 方法
    detectDevice,
    detectOrientation,
    addTouchFeedback,
    addSwipeGesture,
    addLongPress,
    preventZoom,
    optimizeScroll,
    updateSafeAreaInsets,
    
    // 工具函数
    isMobile: () => isMobileDevice.value,
    isTablet: () => deviceType.value === 'tablet',
    isDesktop: () => deviceType.value === 'desktop',
    isPortrait: () => orientation.value === 'portrait',
    isLandscape: () => orientation.value === 'landscape'
  }
}

/**
 * 移动端手势识别组合式函数
 */
export function useGestures(element) {
  const gestures = ref({
    tap: null,
    doubleTap: null,
    longPress: null,
    swipe: null
  })

  const addGesture = (type, callback) => {
    gestures.value[type] = callback
  }

  const removeGesture = (type) => {
    gestures.value[type] = null
  }

  onMounted(() => {
    if (!element.value) return

    let startTime = 0
    let startX = 0
    let startY = 0
    let currentX = 0
    let currentY = 0
    let isMoving = false
    let lastTap = 0
    let longPressTimer = null

    const handleTouchStart = (e) => {
      startTime = Date.now()
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      currentX = startX
      currentY = startY
      isMoving = false

      // 长按检测
      if (gestures.value.longPress) {
        longPressTimer = setTimeout(() => {
          if (!isMoving) {
            gestures.value.longPress(e)
          }
        }, 500)
      }
    }

    const handleTouchMove = (e) => {
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
    }

    const handleTouchEnd = (e) => {
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
        if (now - lastTap < 300 && gestures.value.doubleTap) {
          gestures.value.doubleTap(e)
        } else if (gestures.value.tap) {
          gestures.value.tap(e)
        }
        lastTap = now
      }

      // 滑动检测
      if (isMoving && distance > 50 && gestures.value.swipe) {
        const direction = Math.abs(deltaX) > Math.abs(deltaY) 
          ? (deltaX > 0 ? 'right' : 'left')
          : (deltaY > 0 ? 'down' : 'up')

        gestures.value.swipe({
          direction,
          distance,
          deltaX,
          deltaY,
          duration
        })
      }
    }

    element.value.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.value.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.value.addEventListener('touchend', handleTouchEnd, { passive: true })

    onUnmounted(() => {
      if (element.value) {
        element.value.removeEventListener('touchstart', handleTouchStart)
        element.value.removeEventListener('touchmove', handleTouchMove)
        element.value.removeEventListener('touchend', handleTouchEnd)
      }
      if (longPressTimer) {
        clearTimeout(longPressTimer)
      }
    })
  })

  return {
    addGesture,
    removeGesture
  }
}