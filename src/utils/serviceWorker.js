/**
 * Service Worker 注册和管理工具
 */

/**
 * 注册 Service Worker
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('当前浏览器不支持 Service Worker')
    return null
  }

  try {
    console.log('正在注册 Service Worker...')
    
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })

    console.log('Service Worker 注册成功:', registration)

    // 监听 Service Worker 状态变化
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      
      if (newWorker) {
        console.log('发现新的 Service Worker')
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // 有新版本可用
              console.log('新版本可用，建议刷新页面')
              showUpdateNotification()
            } else {
              // 首次安装完成
              console.log('Service Worker 首次安装完成')
              showInstallNotification()
            }
          }
        })
      }
    })

    // 监听 Service Worker 消息
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)

    return registration
  } catch (error) {
    console.error('Service Worker 注册失败:', error)
    return null
  }
}

/**
 * 处理 Service Worker 消息
 */
function handleServiceWorkerMessage(event) {
  const { type, payload } = event.data

  switch (type) {
    case 'CACHE_STATUS':
      console.log('缓存状态:', payload)
      break
      
    case 'CACHE_CLEARED':
      console.log('缓存已清理')
      break
      
    default:
      console.log('收到 Service Worker 消息:', event.data)
  }
}

/**
 * 显示更新通知
 */
function showUpdateNotification() {
  // 这里可以集成 Element Plus 的通知组件
  if (window.ElNotification) {
    window.ElNotification({
      title: '发现新版本',
      message: '应用有新版本可用，是否立即更新？',
      type: 'info',
      duration: 0,
      showClose: true,
      customClass: 'sw-update-notification',
      onClick: () => {
        window.location.reload()
      }
    })
  } else {
    // 降级方案：使用原生确认框
    if (confirm('应用有新版本可用，是否立即更新？')) {
      window.location.reload()
    }
  }
}

/**
 * 显示安装通知
 */
function showInstallNotification() {
  if (window.ElNotification) {
    window.ElNotification({
      title: '离线功能已启用',
      message: '应用现在可以在离线状态下使用部分功能',
      type: 'success',
      duration: 3000
    })
  }
}

/**
 * 获取缓存状态
 */
export async function getCacheStatus() {
  if (!navigator.serviceWorker.controller) {
    return null
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel()
    
    messageChannel.port1.onmessage = (event) => {
      if (event.data.type === 'CACHE_STATUS') {
        resolve(event.data.payload)
      }
    }

    navigator.serviceWorker.controller.postMessage(
      { type: 'GET_CACHE_STATUS' },
      [messageChannel.port2]
    )
  })
}

/**
 * 清理所有缓存
 */
export async function clearAllCaches() {
  if (!navigator.serviceWorker.controller) {
    return false
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel()
    
    messageChannel.port1.onmessage = (event) => {
      if (event.data.type === 'CACHE_CLEARED') {
        resolve(true)
      }
    }

    navigator.serviceWorker.controller.postMessage(
      { type: 'CLEAR_CACHE' },
      [messageChannel.port2]
    )
  })
}

/**
 * 检查网络状态
 */
export function checkNetworkStatus() {
  return {
    online: navigator.onLine,
    connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection
  }
}

/**
 * 监听网络状态变化
 */
export function watchNetworkStatus(callback) {
  const handleOnline = () => callback({ online: true })
  const handleOffline = () => callback({ online: false })

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // 返回清理函数
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

/**
 * 预缓存关键资源
 */
export async function precacheResources(resources = []) {
  if (!('caches' in window)) {
    console.warn('当前浏览器不支持 Cache API')
    return false
  }

  try {
    const cache = await caches.open('precache-v1')
    await cache.addAll(resources)
    console.log('预缓存资源成功:', resources)
    return true
  } catch (error) {
    console.error('预缓存资源失败:', error)
    return false
  }
}

/**
 * 获取缓存大小估算
 */
export async function getCacheSize() {
  if (!('storage' in navigator && 'estimate' in navigator.storage)) {
    return null
  }

  try {
    const estimate = await navigator.storage.estimate()
    return {
      quota: estimate.quota,
      usage: estimate.usage,
      usagePercentage: ((estimate.usage / estimate.quota) * 100).toFixed(2)
    }
  } catch (error) {
    console.error('获取存储信息失败:', error)
    return null
  }
}

/**
 * 检查是否支持离线功能
 */
export function isOfflineSupported() {
  return (
    'serviceWorker' in navigator &&
    'caches' in window &&
    'fetch' in window
  )
}

/**
 * 获取 Service Worker 状态
 */
export function getServiceWorkerStatus() {
  if (!('serviceWorker' in navigator)) {
    return 'not_supported'
  }

  const registration = navigator.serviceWorker.controller
  
  if (!registration) {
    return 'not_registered'
  }

  if (registration.state === 'activated') {
    return 'active'
  }

  return registration.state
}

/**
 * 强制更新 Service Worker
 */
export async function updateServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    
    if (registration) {
      await registration.update()
      console.log('Service Worker 更新检查完成')
      return true
    }
    
    return false
  } catch (error) {
    console.error('Service Worker 更新失败:', error)
    return false
  }
}

/**
 * 卸载 Service Worker
 */
export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    
    if (registration) {
      const result = await registration.unregister()
      console.log('Service Worker 卸载结果:', result)
      return result
    }
    
    return false
  } catch (error) {
    console.error('Service Worker 卸载失败:', error)
    return false
  }
}