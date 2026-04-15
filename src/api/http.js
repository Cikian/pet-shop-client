import axios from 'axios'

/**
 * HTTP客户端封装
 * 提供统一的axios实例配置和请求/响应拦截器
 */

// 创建axios实例
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:18500/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 请求拦截器
 * 自动添加Bearer token到Authorization请求头
 */
http.interceptors.request.use(
  config => {
    // 从localStorage获取accessToken
    const authData = localStorage.getItem('mall-auth')
    if (authData) {
      try {
        const auth = JSON.parse(authData)
        if (auth.accessToken) {
          config.headers.Authorization = `Bearer ${auth.accessToken}`
        }
      } catch (error) {
        console.error('Failed to parse auth data:', error)
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 处理new-token、提取result字段、401错误处理
 */
http.interceptors.response.use(
  response => {
    // 检查是否有新token
    const newToken = response.headers['new-token']
    if (newToken) {
      // 更新localStorage中的token
      const authData = localStorage.getItem('mall-auth')
      if (authData) {
        try {
          const auth = JSON.parse(authData)
          auth.accessToken = newToken
          localStorage.setItem('mall-auth', JSON.stringify(auth))
          
          // 如果使用了Pinia store，也更新store中的token
          // 注意：这里不能直接导入useAuthStore，因为会造成循环依赖
          // 实际的store更新会在store的action中处理
        } catch (error) {
          console.error('Failed to update token:', error)
        }
      }
    }
    
    // 提取result字段
    if (response.data && response.data.result !== undefined) {
      return response.data.result
    }
    
    return response.data
  },
  error => {
    // 401未授权错误处理
    if (error.response && error.response.status === 401) {
      // 清除认证状态
      localStorage.removeItem('mall-auth')
      
      // 只有在需要认证的页面才跳转到登录页
      // 首页等公开页面即使API返回401也不跳转
      const currentPath = window.location.pathname
      const publicPaths = ['/', '/login', '/register', '/demo']
      const isPublicPath = publicPaths.includes(currentPath) || currentPath.startsWith('/product/')
      
      if (!isPublicPath && currentPath !== '/login') {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
      }
    }
    
    // 返回标准化的错误信息
    const errorMessage = error.response?.data?.message || error.message || '请求失败'
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    })
  }
)

/**
 * GET请求封装
 * @param {string} url - 请求URL
 * @param {Object} params - 查询参数
 * @returns {Promise} 请求Promise
 */
export const getAction = (url, params) => {
  return http.get(url, { params })
}

/**
 * POST请求封装
 * @param {string} url - 请求URL
 * @param {Object} data - 请求体数据
 * @returns {Promise} 请求Promise
 */
export const postAction = (url, data) => {
  return http.post(url, data)
}

/**
 * PUT请求封装
 * @param {string} url - 请求URL
 * @param {Object} data - 请求体数据
 * @returns {Promise} 请求Promise
 */
export const putAction = (url, data) => {
  return http.put(url, data)
}

/**
 * DELETE请求封装
 * @param {string} url - 请求URL
 * @param {Object} params - 查询参数
 * @returns {Promise} 请求Promise
 */
export const deleteAction = (url, params) => {
  return http.delete(url, { params })
}

export default http
