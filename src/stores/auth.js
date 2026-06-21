import { defineStore } from 'pinia'

/**
 * 认证状态管理 Store（系统级状态）
 * 仅管理用户登录状态、token、权限等系统相关内容
 * 具体的登录/注册等业务请求由各页面组件直接通过 api/http.js 发起
 * 页面请求拿到响应后，调用 setAuth() 将状态同步到此 store
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    user: null,
    authorities: [],
    isAuthenticated: false
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && !!state.accessToken,
    userInfo: (state) => state.user,
    hasAuthority: (state) => (authority) => {
      return state.authorities.includes(authority)
    },
    displayName: (state) => {
      if (!state.user) return ''
      return state.user.nickname || state.user.username || ''
    },
    userAvatar: (state) => {
      if (!state.user || !state.user.avatar) {
        return '/default-avatar.png'
      }
      return state.user.avatar
    }
  },

  actions: {
    /**
     * 设置认证状态：由各业务页面（登录/注册页）在请求成功后调用
     * @param {Object} response - 后端返回的认证响应数据
     * @param {string} [response.accessToken] - 访问令牌
     * @param {Object} [response.user] - 用户信息
     * @param {string[]} [response.authorities] - 权限列表
     */
    setAuth(response) {
      if (!response) return
      if (response.accessToken) this.accessToken = response.accessToken
      if (response.user) this.user = response.user
      if (response.authorities) this.authorities = response.authorities
      this.isAuthenticated = !!(this.accessToken && this.user)
    },

    /**
     * 退出登录（只清除状态，不做业务请求）
     */
    logout() {
      this.clearAuth()
    },

    /**
     * 更新 token（由响应拦截器检测到新 token 后调用）
     */
    updateToken(newToken) {
      this.accessToken = newToken
    },

    /**
     * 从本地存储恢复状态：由 Pinia persist 插件在初始化后调用
     */
    restoreAuth() {
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
     */
    updateUserInfo(userData) {
      if (this.user) {
        this.user = { ...this.user, ...userData }
      }
    }
  },

  // Pinia persist 插件配置
  persist: {
    key: 'mall-auth',
    storage: localStorage,
    paths: ['accessToken', 'user', 'authorities', 'isAuthenticated']
  }
})
