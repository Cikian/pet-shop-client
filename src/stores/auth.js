import { defineStore } from 'pinia'
import { loginApi, registerApi, sendCaptchaApi } from '../api/auth'

/**
 * 认证状态管理 Store
 * 管理用户登录、注册、权限和认证状态
 * @typedef {import('../types/index.js').User} User
 * @typedef {import('../types/index.js').AuthResponse} AuthResponse
 * @typedef {import('../types/index.js').RegisterRequest} RegisterRequest
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    /** @type {string|null} */
    accessToken: null,
    /** @type {User|null} */
    user: null,
    /** @type {string[]} */
    authorities: [],
    /** @type {boolean} */
    isAuthenticated: false
  }),
  
  getters: {
    /**
     * 检查用户是否已登录
     * @returns {boolean} 是否已登录
     */
    isLoggedIn: (state) => state.isAuthenticated && !!state.accessToken,
    
    /**
     * 获取用户信息
     * @returns {User|null} 用户信息
     */
    userInfo: (state) => state.user,
    
    /**
     * 检查用户是否拥有指定权限
     * @returns {function(string): boolean} 权限检查函数
     */
    hasAuthority: (state) => (authority) => {
      return state.authorities.includes(authority)
    },
    
    /**
     * 获取用户显示名称
     * @returns {string} 用户显示名称
     */
    displayName: (state) => {
      if (!state.user) return ''
      return state.user.nickname || state.user.username || ''
    },
    
    /**
     * 获取用户头像
     * @returns {string} 用户头像URL
     */
    userAvatar: (state) => {
      if (!state.user || !state.user.avatar) {
        return '/default-avatar.png' // 默认头像
      }
      return state.user.avatar
    }
  },
  
  actions: {
    /**
     * 用户登录
     * @param {string} username - 用户名或邮箱
     * @param {string} password - 密码
     * @returns {Promise<AuthResponse>} 认证响应
     */
    async login(username, password) {
      try {
        const response = await loginApi(username, password)
        
        // 存储认证信息
        this.accessToken = response.accessToken
        this.user = response.user
        this.authorities = response.authorities || []
        this.isAuthenticated = true
        
        return response
      } catch (error) {
        // 清除认证状态
        this.clearAuth()
        throw error
      }
    },
    
    /**
     * 用户注册
     * @param {RegisterRequest} registerData - 注册数据
     * @returns {Promise<AuthResponse>} 认证响应
     */
    async register(registerData) {
      try {
        const response = await registerApi(registerData)
        
        // 注册成功后自动登录
        this.accessToken = response.accessToken
        this.user = response.user
        this.authorities = response.authorities || []
        this.isAuthenticated = true
        
        return response
      } catch (error) {
        // 清除认证状态
        this.clearAuth()
        throw error
      }
    },
    
    /**
     * 发送邮箱验证码
     * @param {string} email - 邮箱地址
     * @returns {Promise<void>}
     */
    async sendEmailCaptcha(email) {
      try {
        await sendCaptchaApi(email)
      } catch (error) {
        console.error('Failed to send email captcha:', error)
        throw error
      }
    },
    
    /**
     * 用户登出
     */
    logout() {
      this.clearAuth()
      
      // 可以在这里调用登出API（如果后端需要）
      // await logoutApi()
    },
    
    /**
     * 更新访问令牌
     * @param {string} newToken - 新的访问令牌
     */
    updateToken(newToken) {
      this.accessToken = newToken
    },
    
    /**
     * 从本地存储恢复认证状态
     * 此方法由Pinia持久化插件自动调用
     */
    restoreAuth() {
      // 验证恢复的数据是否有效
      if (this.accessToken && this.user) {
        this.isAuthenticated = true
      } else {
        this.clearAuth()
      }
    },
    
    /**
     * 清除认证状态
     */
    clearAuth() {
      this.accessToken = null
      this.user = null
      this.authorities = []
      this.isAuthenticated = false
    },
    
    /**
     * 更新用户信息
     * @param {Partial<User>} userData - 要更新的用户数据
     */
    updateUserInfo(userData) {
      if (this.user) {
        this.user = {
          ...this.user,
          ...userData
        }
      }
    },
    
    /**
     * 检查Token是否即将过期
     * @param {number} thresholdMinutes - 阈值（分钟）
     * @returns {boolean} 是否即将过期
     */
    isTokenExpiringSoon(thresholdMinutes = 5) {
      // 这里需要根据实际的token结构来实现
      // 如果token是JWT，可以解析payload获取过期时间
      // 简化实现：假设token有效期为1小时
      return false
    }
  },
  
  // 配置Pinia持久化插件
  persist: {
    key: 'mall-auth',
    storage: localStorage,
    paths: ['accessToken', 'user', 'authorities', 'isAuthenticated']
  }
})
