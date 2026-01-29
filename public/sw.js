/**
 * Service Worker for Online Mall
 * 提供离线缓存和网络优化功能
 */

const CACHE_NAME = 'online-mall-v1.0.0'
const STATIC_CACHE_NAME = 'online-mall-static-v1.0.0'
const DYNAMIC_CACHE_NAME = 'online-mall-dynamic-v1.0.0'
const IMAGE_CACHE_NAME = 'online-mall-images-v1.0.0'

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // CSS 文件会在构建时生成，这里使用通配符匹配
  // JS 文件会在构建时生成，这里使用通配符匹配
]

// 需要缓存的关键页面
const CACHE_PAGES = [
  '/',
  '/category',
  '/cart',
  '/search'
]

// 需要缓存的 API 端点（模拟数据）
const CACHE_APIS = [
  '/api/products',
  '/api/categories'
]

// 图片缓存策略配置
const IMAGE_CACHE_CONFIG = {
  maxEntries: 100,
  maxAgeSeconds: 30 * 24 * 60 * 60 // 30天
}

/**
 * Service Worker 安装事件
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker 安装中...')
  
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('缓存静态资源')
        return cache.addAll(STATIC_ASSETS.concat(CACHE_PAGES))
      }),
      
      // 跳过等待，立即激活
      self.skipWaiting()
    ])
  )
})

/**
 * Service Worker 激活事件
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker 激活中...')
  
  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== IMAGE_CACHE_NAME &&
              cacheName !== CACHE_NAME
            ) {
              console.log('删除旧缓存:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // 立即控制所有客户端
      self.clients.claim()
    ])
  )
})

/**
 * 网络请求拦截
 */
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // 只处理同源请求
  if (url.origin !== location.origin) {
    return
  }
  
  // 根据请求类型选择不同的缓存策略
  if (request.destination === 'image') {
    // 图片资源：缓存优先策略
    event.respondWith(handleImageRequest(request))
  } else if (isApiRequest(request)) {
    // API 请求：网络优先策略
    event.respondWith(handleApiRequest(request))
  } else if (isPageRequest(request)) {
    // 页面请求：缓存优先策略
    event.respondWith(handlePageRequest(request))
  } else if (isStaticAsset(request)) {
    // 静态资源：缓存优先策略
    event.respondWith(handleStaticAssetRequest(request))
  }
})

/**
 * 处理图片请求 - 缓存优先策略
 */
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE_NAME)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      // 缓存命中，返回缓存的图片
      return cachedResponse
    }
    
    // 缓存未命中，从网络获取
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // 网络请求成功，缓存图片
      await cache.put(request, networkResponse.clone())
      
      // 清理过期的图片缓存
      await cleanImageCache(cache)
    }
    
    return networkResponse
  } catch (error) {
    console.warn('图片请求失败:', error)
    
    // 返回默认占位图片
    return new Response(
      createPlaceholderImage(),
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache'
        }
      }
    )
  }
}

/**
 * 处理 API 请求 - 网络优先策略
 */
async function handleApiRequest(request) {
  try {
    // 尝试从网络获取最新数据
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // 网络请求成功，更新缓存
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      await cache.put(request, networkResponse.clone())
      return networkResponse
    }
    
    throw new Error('Network response not ok')
  } catch (error) {
    console.warn('API 网络请求失败，尝试使用缓存:', error)
    
    // 网络失败，尝试从缓存获取
    const cache = await caches.open(DYNAMIC_CACHE_NAME)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      // 添加离线标识头
      const response = cachedResponse.clone()
      response.headers.set('X-Served-From', 'cache')
      return response
    }
    
    // 缓存也没有，返回离线响应
    return createOfflineResponse(request)
  }
}

/**
 * 处理页面请求 - 缓存优先策略
 */
async function handlePageRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      // 缓存命中，后台更新缓存
      updateCacheInBackground(request, cache)
      return cachedResponse
    }
    
    // 缓存未命中，从网络获取
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.warn('页面请求失败:', error)
    
    // 返回离线页面
    return createOfflinePage()
  }
}

/**
 * 处理静态资源请求 - 缓存优先策略
 */
async function handleStaticAssetRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.warn('静态资源请求失败:', error)
    throw error
  }
}

/**
 * 后台更新缓存
 */
async function updateCacheInBackground(request, cache) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      await cache.put(request, networkResponse)
    }
  } catch (error) {
    console.warn('后台缓存更新失败:', error)
  }
}

/**
 * 清理图片缓存
 */
async function cleanImageCache(cache) {
  const keys = await cache.keys()
  
  if (keys.length > IMAGE_CACHE_CONFIG.maxEntries) {
    // 删除最旧的缓存项
    const keysToDelete = keys.slice(0, keys.length - IMAGE_CACHE_CONFIG.maxEntries)
    await Promise.all(keysToDelete.map(key => cache.delete(key)))
  }
}

/**
 * 判断是否为 API 请求
 */
function isApiRequest(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith('/api/') || 
         CACHE_APIS.some(api => url.pathname.includes(api))
}

/**
 * 判断是否为页面请求
 */
function isPageRequest(request) {
  return request.mode === 'navigate' || 
         request.destination === 'document' ||
         request.headers.get('accept')?.includes('text/html')
}

/**
 * 判断是否为静态资源
 */
function isStaticAsset(request) {
  const url = new URL(request.url)
  const extension = url.pathname.split('.').pop()
  
  return ['js', 'css', 'woff', 'woff2', 'ttf', 'eot'].includes(extension)
}

/**
 * 创建占位图片
 */
function createPlaceholderImage() {
  return `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#999" text-anchor="middle" dy=".3em">
        图片加载失败
      </text>
    </svg>
  `
}

/**
 * 创建离线 API 响应
 */
function createOfflineResponse(request) {
  const url = new URL(request.url)
  
  // 根据不同的 API 端点返回不同的离线数据
  if (url.pathname.includes('/products')) {
    return new Response(
      JSON.stringify({
        success: false,
        message: '网络连接不可用，请检查网络设置',
        data: [],
        offline: true
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Served-From': 'offline'
        }
      }
    )
  }
  
  return new Response(
    JSON.stringify({
      success: false,
      message: '网络连接不可用',
      offline: true
    }),
    {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'X-Served-From': 'offline'
      }
    }
  )
}

/**
 * 创建离线页面
 */
function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>离线模式 - 在线商城</title>
      <style>
        body {
          font-family: 'Inter', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
          margin: 0;
          padding: 0;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          color: #2c3e50;
        }
        .offline-container {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          max-width: 400px;
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          color: #ff6b6b;
        }
        .offline-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .offline-message {
          color: #7f8c8d;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        .retry-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .retry-button:hover {
          background: #5a6fd8;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">📱</div>
        <h1 class="offline-title">网络连接不可用</h1>
        <p class="offline-message">
          抱歉，当前网络连接不可用。<br>
          请检查您的网络设置后重试。
        </p>
        <button class="retry-button" onclick="window.location.reload()">
          重新加载
        </button>
      </div>
    </body>
    </html>
  `
  
  return new Response(offlineHTML, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'X-Served-From': 'offline'
    }
  })
}

/**
 * 消息处理 - 用于与主线程通信
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage({ type: 'CACHE_STATUS', payload: status })
      })
      break
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' })
      })
      break
      
    default:
      console.warn('未知的消息类型:', type)
  }
})

/**
 * 获取缓存状态
 */
async function getCacheStatus() {
  const cacheNames = await caches.keys()
  const status = {}
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    status[cacheName] = keys.length
  }
  
  return status
}

/**
 * 清理所有缓存
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
}

/**
 * 定期清理过期缓存
 */
setInterval(async () => {
  try {
    const imageCache = await caches.open(IMAGE_CACHE_NAME)
    await cleanImageCache(imageCache)
  } catch (error) {
    console.warn('定期清理缓存失败:', error)
  }
}, 60 * 60 * 1000) // 每小时清理一次