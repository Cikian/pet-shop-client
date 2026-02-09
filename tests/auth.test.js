import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// Mock axios before importing anything that uses it
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

// Mock the API modules
vi.mock('../src/api/auth', () => ({
  loginApi: vi.fn(),
  registerApi: vi.fn(),
  sendCaptchaApi: vi.fn()
}))

import { useAuthStore } from '../src/stores/auth'
import { loginApi, registerApi, sendCaptchaApi } from '../src/api/auth'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

describe('Authentication Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with null/empty authentication state', () => {
      const authStore = useAuthStore()
      expect(authStore.accessToken).toBeNull()
      expect(authStore.user).toBeNull()
      expect(authStore.authorities).toEqual([])
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should have isLoggedIn getter return false initially', () => {
      const authStore = useAuthStore()
      expect(authStore.isLoggedIn).toBe(false)
    })
  })

  describe('Login Functionality', () => {
    it('should successfully login with valid credentials', async () => {
      const authStore = useAuthStore()
      const mockResponse = {
        accessToken: 'test-token-123',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          nickname: 'Test User'
        },
        authorities: ['USER', 'ADMIN']
      }

      // Mock the API response
      vi.mocked(loginApi).mockResolvedValue(mockResponse)

      await authStore.login('testuser', 'password123')

      expect(authStore.accessToken).toBe('test-token-123')
      expect(authStore.user).toEqual(mockResponse.user)
      expect(authStore.authorities).toEqual(['USER', 'ADMIN'])
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.isLoggedIn).toBe(true)
    })

    it('should clear auth state on login failure', async () => {
      const authStore = useAuthStore()

      // Mock the API to throw an error
      vi.mocked(loginApi).mockRejectedValue(new Error('Invalid credentials'))

      await expect(authStore.login('testuser', 'wrongpassword')).rejects.toThrow()

      expect(authStore.accessToken).toBeNull()
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('Register Functionality', () => {
    it('should successfully register with valid data', async () => {
      const authStore = useAuthStore()
      const mockResponse = {
        accessToken: 'new-token-456',
        user: {
          id: '2',
          username: 'newuser',
          email: 'new@example.com',
          nickname: 'New User'
        },
        authorities: ['USER']
      }

      vi.mocked(registerApi).mockResolvedValue(mockResponse)

      const registerData = {
        userName: 'newuser',
        email: 'new@example.com',
        captcha: '123456',
        password: 'password123'
      }

      await authStore.register(registerData)

      expect(authStore.accessToken).toBe('new-token-456')
      expect(authStore.user).toEqual(mockResponse.user)
      expect(authStore.authorities).toEqual(['USER'])
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should clear auth state on registration failure', async () => {
      const authStore = useAuthStore()

      vi.mocked(registerApi).mockRejectedValue(new Error('Email already exists'))

      const registerData = {
        userName: 'existinguser',
        email: 'existing@example.com',
        captcha: '123456',
        password: 'password123'
      }

      await expect(authStore.register(registerData)).rejects.toThrow()

      expect(authStore.accessToken).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('Token Management', () => {
    it('should update token correctly', () => {
      const authStore = useAuthStore()
      authStore.accessToken = 'old-token'
      
      authStore.updateToken('new-token')
      
      expect(authStore.accessToken).toBe('new-token')
    })

    it('should clear auth state on logout', () => {
      const authStore = useAuthStore()
      authStore.accessToken = 'test-token'
      authStore.user = { id: '1', username: 'testuser' }
      authStore.authorities = ['USER']
      authStore.isAuthenticated = true

      authStore.logout()

      expect(authStore.accessToken).toBeNull()
      expect(authStore.user).toBeNull()
      expect(authStore.authorities).toEqual([])
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should clear auth state with clearAuth method', () => {
      const authStore = useAuthStore()
      authStore.accessToken = 'test-token'
      authStore.user = { id: '1', username: 'testuser' }
      authStore.isAuthenticated = true

      authStore.clearAuth()

      expect(authStore.accessToken).toBeNull()
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('Getters', () => {
    it('should return correct user info', () => {
      const authStore = useAuthStore()
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        nickname: 'Test User'
      }
      authStore.user = mockUser

      expect(authStore.userInfo).toEqual(mockUser)
    })

    it('should return correct display name', () => {
      const authStore = useAuthStore()
      
      // Test with nickname
      authStore.user = { username: 'testuser', nickname: 'Test User' }
      expect(authStore.displayName).toBe('Test User')
      
      // Test without nickname
      authStore.user = { username: 'testuser' }
      expect(authStore.displayName).toBe('testuser')
      
      // Test with no user
      authStore.user = null
      expect(authStore.displayName).toBe('')
    })

    it('should check authority correctly', () => {
      const authStore = useAuthStore()
      authStore.authorities = ['USER', 'ADMIN']

      expect(authStore.hasAuthority('USER')).toBe(true)
      expect(authStore.hasAuthority('ADMIN')).toBe(true)
      expect(authStore.hasAuthority('SUPER_ADMIN')).toBe(false)
    })

    it('should return default avatar when user has no avatar', () => {
      const authStore = useAuthStore()
      authStore.user = { username: 'testuser' }

      expect(authStore.userAvatar).toBe('/default-avatar.png')
    })

    it('should return user avatar when available', () => {
      const authStore = useAuthStore()
      authStore.user = { username: 'testuser', avatar: 'https://example.com/avatar.jpg' }

      expect(authStore.userAvatar).toBe('https://example.com/avatar.jpg')
    })
  })

  describe('User Info Update', () => {
    it('should update user info correctly', () => {
      const authStore = useAuthStore()
      authStore.user = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        nickname: 'Old Nickname'
      }

      authStore.updateUserInfo({ nickname: 'New Nickname', phone: '1234567890' })

      expect(authStore.user.nickname).toBe('New Nickname')
      expect(authStore.user.phone).toBe('1234567890')
      expect(authStore.user.username).toBe('testuser') // Should preserve other fields
    })

    it('should not update when user is null', () => {
      const authStore = useAuthStore()
      authStore.user = null

      authStore.updateUserInfo({ nickname: 'New Nickname' })

      expect(authStore.user).toBeNull()
    })
  })

  describe('Email Captcha', () => {
    it('should send email captcha successfully', async () => {
      const authStore = useAuthStore()

      vi.mocked(sendCaptchaApi).mockResolvedValue({ success: true })

      await expect(authStore.sendEmailCaptcha('test@example.com')).resolves.not.toThrow()
    })

    it('should handle captcha send failure', async () => {
      const authStore = useAuthStore()

      vi.mocked(sendCaptchaApi).mockRejectedValue(new Error('Failed to send captcha'))

      await expect(authStore.sendEmailCaptcha('test@example.com')).rejects.toThrow()
    })
  })
})
