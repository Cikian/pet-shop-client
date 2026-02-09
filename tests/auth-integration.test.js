import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import Login from '../src/views/Login.vue'
import Register from '../src/views/Register.vue'
import ElementPlus from 'element-plus'

// Mock the API modules
vi.mock('../src/api/auth', () => ({
  loginApi: vi.fn(),
  registerApi: vi.fn(),
  sendCaptchaApi: vi.fn()
}))

// Mock axios
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }))
    }
  }
})

import { loginApi, registerApi, sendCaptchaApi } from '../src/api/auth'

describe('Authentication Integration Tests', () => {
  let router
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'Home', component: { template: '<div>Home</div>' } },
        { path: '/login', name: 'Login', component: Login },
        { path: '/register', name: 'Register', component: Register }
      ]
    })
    
    vi.clearAllMocks()
  })

  describe('Login Page', () => {
    it('should render login form with all required fields', async () => {
      await router.push('/login')
      await router.isReady()

      const wrapper = mount(Login, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      // Check for form elements
      expect(wrapper.find('input[placeholder="用户名或邮箱"]').exists()).toBe(true)
      expect(wrapper.find('input[type="password"]').exists()).toBe(true)
      expect(wrapper.find('button').text()).toContain('登录')
    })

    it('should have a link to register page', async () => {
      await router.push('/login')
      await router.isReady()

      const wrapper = mount(Login, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      const registerLink = wrapper.find('a[href="/register"]')
      expect(registerLink.exists()).toBe(true)
    })

    it('should display Google login button (disabled)', async () => {
      await router.push('/login')
      await router.isReady()

      const wrapper = mount(Login, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      const googleButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('Google')
      )
      expect(googleButton).toBeDefined()
      expect(googleButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('Register Page', () => {
    it('should render register form with all required fields', async () => {
      await router.push('/register')
      await router.isReady()

      const wrapper = mount(Register, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      // Check for required form elements
      expect(wrapper.find('input[placeholder="用户名"]').exists()).toBe(true)
      expect(wrapper.find('input[placeholder="邮箱"]').exists()).toBe(true)
      expect(wrapper.find('input[placeholder="邮箱验证码"]').exists()).toBe(true)
      expect(wrapper.find('input[placeholder="密码"]').exists()).toBe(true)
      expect(wrapper.find('input[placeholder="确认密码"]').exists()).toBe(true)
    })

    it('should render optional fields', async () => {
      await router.push('/register')
      await router.isReady()

      const wrapper = mount(Register, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      // Check for optional form elements
      expect(wrapper.find('input[placeholder="手机号（可选）"]').exists()).toBe(true)
      expect(wrapper.find('input[placeholder="昵称（可选）"]').exists()).toBe(true)
    })

    it('should have captcha send button', async () => {
      await router.push('/register')
      await router.isReady()

      const wrapper = mount(Register, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      const captchaButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('发送验证码')
      )
      expect(captchaButton).toBeDefined()
    })

    it('should have a link to login page', async () => {
      await router.push('/register')
      await router.isReady()

      const wrapper = mount(Register, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      const loginLink = wrapper.find('a[href="/login"]')
      expect(loginLink.exists()).toBe(true)
    })

    it('should display Google register button (disabled)', async () => {
      await router.push('/register')
      await router.isReady()

      const wrapper = mount(Register, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      const googleButton = wrapper.findAll('button').find(btn => 
        btn.text().includes('Google')
      )
      expect(googleButton).toBeDefined()
      expect(googleButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('Router Integration', () => {
    it('should have correct route configuration for login', async () => {
      await router.push('/login')
      await router.isReady()

      expect(router.currentRoute.value.path).toBe('/login')
      expect(router.currentRoute.value.name).toBe('Login')
    })

    it('should have correct route configuration for register', async () => {
      await router.push('/register')
      await router.isReady()

      expect(router.currentRoute.value.path).toBe('/register')
      expect(router.currentRoute.value.name).toBe('Register')
    })
  })
})
