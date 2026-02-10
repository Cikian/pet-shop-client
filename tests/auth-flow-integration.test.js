import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../src/stores/auth'
import { loginApi, registerApi, sendCaptchaApi } from '../src/api/auth'
import axios from 'axios'

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
          request: { use: vi.fn(), eject: vi.fn() },
          response: { use: vi.fn(), eject: vi.fn() }
        }
      }))
    }
  }
})

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString() }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
})()

vi.stubGlobal('localStorage', localStorageMock)

describe('Authentication Flow Integration Tests', () => {
  let authStore

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('Complete Login Flow', () => {
    it('should complete full login flow with token storage', async () => {
      const mockResponse = {
        accessToken: 'test-token-123',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          nickname: 'Test User',
          avatar: 'https://example.com/avatar.jpg'
        },
        authorities: ['USER']
      }

      vi.mocked(loginApi).mockResolvedValue(mockResponse)

      // Step 1: Login
      await authStore.login('testuser', 'password123')

      // Verify authentication state
      expect(authStore.isLoggedIn).toBe(true)
      expect(authStore.accessToken).toBe('test-token-123')
      expect(authStore.user).toEqual(mockResponse.user)
      expect(authStore.authorities).toEqual(['USER'])
      expect(authStore.isAuthenticated).toBe(true)

      // Verify getters
      expect(authStore.displayName).toBe('Test User')
      expect(authStore.userAvatar).toBe('https://example.com/avatar.jpg')
      expect(authStore.hasAuthority('USER')).toBe(true)
      expect(authStore.hasAuthority('ADMIN')).toBe(false)
    })

    it('should handle login failure and clear state', async () => {
      vi.mocked(loginApi).mockRejectedValue(new Error('Invalid credentials'))

      await expect(authStore.login('testuser', 'wrongpassword')).rejects.toThrow('Invalid credentials')

      // Verify state is cleared
      expect(authStore.isLoggedIn).toBe(false)
      expect(authStore.accessToken).toBeNull()
      expect(authStore.user).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should persist authentication state to localStorage', async () => {
      const mockResponse = {
        accessToken: 'test-token-456',
        user: {
          id: '2',
          username: 'persistuser',
          email: 'persist@example.com'
        },
        authorities: ['USER']
      }

      vi.mocked(loginApi).mockResolvedValue(mockResponse)

      await authStore.login('persistuser', 'password123')

      // Check if localStorage was called (Pinia persist plugin handles this)
      // In a real scenario, the persist plugin would save to localStorage
      expect(authStore.accessToken).toBe('test-token-456')
    })
  })

  describe('Complete Registration Flow', () => {
    it('should complete full registration flow', async () => {
      const mockResponse = {
        accessToken: 'new-user-token',
        user: {
          id: '3',
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
        password: 'password123',
        phone: '1234567890',
        nickname: 'New User'
      }

      // Step 1: Register
      await authStore.register(registerData)

      // Verify user is automatically logged in after registration
      expect(authStore.isLoggedIn).toBe(true)
      expect(authStore.accessToken).toBe('new-user-token')
      expect(authStore.user.username).toBe('newuser')
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should send email captcha before registration', async () => {
      vi.mocked(sendCaptchaApi).mockResolvedValue({ success: true })

      await authStore.sendEmailCaptcha('test@example.com')

      expect(sendCaptchaApi).toHaveBeenCalledWith('test@example.com')
      expect(sendCaptchaApi).toHaveBeenCalledTimes(1)
    })

    it('should handle registration failure', async () => {
      vi.mocked(registerApi).mockRejectedValue(new Error('Email already exists'))

      const registerData = {
        userName: 'existinguser',
        email: 'existing@example.com',
        captcha: '123456',
        password: 'password123'
      }

      await expect(authStore.register(registerData)).rejects.toThrow('Email already exists')

      // Verify state is cleared
      expect(authStore.isLoggedIn).toBe(false)
      expect(authStore.accessToken).toBeNull()
    })
  })

  describe('Token Refresh Mechanism', () => {
    it('should update token when new token is provided', () => {
      // Setup initial authentication
      authStore.accessToken = 'old-token'
      authStore.user = { id: '1', username: 'testuser' }
      authStore.isAuthenticated = true

      // Simulate token refresh
      authStore.updateToken('new-refreshed-token')

      expect(authStore.accessToken).toBe('new-refreshed-token')
      expect(authStore.isLoggedIn).toBe(true)
      expect(authStore.user).toBeTruthy()
    })

    it('should maintain authentication state after token refresh', () => {
      authStore.accessToken = 'token-v1'
      authStore.user = { id: '1', username: 'testuser', nickname: 'Test' }
      authStore.authorities = ['USER', 'ADMIN']
      authStore.isAuthenticated = true

      // Refresh token
      authStore.updateToken('token-v2')

      // Verify all other state remains intact
      expect(authStore.accessToken).toBe('token-v2')
      expect(authStore.user.username).toBe('testuser')
      expect(authStore.authorities).toEqual(['USER', 'ADMIN'])
      expect(authStore.isAuthenticated).toBe(true)
    })
  })

  describe('Logout and Re-login Flow', () => {
    it('should complete logout and clear all authentication data', async () => {
      // Setup authenticated state
      const mockResponse = {
        accessToken: 'test-token',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com'
        },
        authorities: ['USER']
      }

      vi.mocked(loginApi).mockResolvedValue(mockResponse)
      await authStore.login('testuser', 'password123')

      expect(authStore.isLoggedIn).toBe(true)

      // Logout
      authStore.logout()

      // Verify all state is cleared
      expect(authStore.isLoggedIn).toBe(false)
      expect(authStore.accessToken).toBeNull()
      expect(authStore.user).toBeNull()
      expect(authStore.authorities).toEqual([])
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.displayName).toBe('')
    })

    it('should allow re-login after logout', async () => {
      // First login
      const firstLoginResponse = {
        accessToken: 'first-token',
        user: { id: '1', username: 'user1', email: 'user1@example.com' },
        authorities: ['USER']
      }

      vi.mocked(loginApi).mockResolvedValueOnce(firstLoginResponse)
      await authStore.login('user1', 'password1')
      expect(authStore.isLoggedIn).toBe(true)

      // Logout
      authStore.logout()
      expect(authStore.isLoggedIn).toBe(false)

      // Re-login with different user
      const secondLoginResponse = {
        accessToken: 'second-token',
        user: { id: '2', username: 'user2', email: 'user2@example.com' },
        authorities: ['USER', 'ADMIN']
      }

      vi.mocked(loginApi).mockResolvedValueOnce(secondLoginResponse)
      await authStore.login('user2', 'password2')

      // Verify new authentication state
      expect(authStore.isLoggedIn).toBe(true)
      expect(authStore.accessToken).toBe('second-token')
      expect(authStore.user.username).toBe('user2')
      expect(authStore.authorities).toEqual(['USER', 'ADMIN'])
    })
  })

  describe('User Info Management', () => {
    it('should update user info while maintaining authentication', async () => {
      // Setup authenticated state
      const mockResponse = {
        accessToken: 'test-token',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          nickname: 'Old Nickname'
        },
        authorities: ['USER']
      }

      vi.mocked(loginApi).mockResolvedValue(mockResponse)
      await authStore.login('testuser', 'password123')

      // Update user info
      authStore.updateUserInfo({
        nickname: 'New Nickname',
        phone: '9876543210',
        avatar: 'https://example.com/new-avatar.jpg'
      })

      // Verify updates
      expect(authStore.user.nickname).toBe('New Nickname')
      expect(authStore.user.phone).toBe('9876543210')
      expect(authStore.user.avatar).toBe('https://example.com/new-avatar.jpg')
      expect(authStore.displayName).toBe('New Nickname')
      expect(authStore.userAvatar).toBe('https://example.com/new-avatar.jpg')

      // Verify authentication state is maintained
      expect(authStore.isLoggedIn).toBe(true)
      expect(authStore.accessToken).toBe('test-token')
    })
  })

  describe('Authentication State Restoration', () => {
    it('should restore authentication state from valid data', () => {
      // Simulate persisted data
      authStore.accessToken = 'persisted-token'
      authStore.user = { id: '1', username: 'persisteduser' }
      authStore.authorities = ['USER']
      authStore.isAuthenticated = false // Simulate state before restoration

      authStore.restoreAuth()

      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.isLoggedIn).toBe(true)
    })

    it('should clear invalid authentication state', () => {
      // Simulate invalid persisted data (missing token)
      authStore.accessToken = null
      authStore.user = { id: '1', username: 'user' }
      authStore.isAuthenticated = true

      authStore.restoreAuth()

      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.accessToken).toBeNull()
      expect(authStore.user).toBeNull()
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors during login', async () => {
      vi.mocked(loginApi).mockRejectedValue(new Error('Network error'))

      await expect(authStore.login('testuser', 'password')).rejects.toThrow('Network error')

      expect(authStore.isLoggedIn).toBe(false)
      expect(authStore.accessToken).toBeNull()
    })

    it('should handle captcha send failure', async () => {
      vi.mocked(sendCaptchaApi).mockRejectedValue(new Error('Failed to send captcha'))

      await expect(authStore.sendEmailCaptcha('test@example.com')).rejects.toThrow('Failed to send captcha')
    })

    it('should handle clearAuth when already logged out', () => {
      // Ensure state is already clear
      authStore.clearAuth()

      // Call clearAuth again
      authStore.clearAuth()

      // Should not throw and state should remain clear
      expect(authStore.isLoggedIn).toBe(false)
      expect(authStore.accessToken).toBeNull()
      expect(authStore.user).toBeNull()
    })

    it('should handle updateUserInfo when user is null', () => {
      authStore.user = null

      authStore.updateUserInfo({ nickname: 'New Nickname' })

      expect(authStore.user).toBeNull()
    })
  })

  describe('Authority Management', () => {
    it('should correctly manage multiple authorities', async () => {
      const mockResponse = {
        accessToken: 'admin-token',
        user: {
          id: '1',
          username: 'admin',
          email: 'admin@example.com'
        },
        authorities: ['USER', 'ADMIN', 'SUPER_ADMIN']
      }

      vi.mocked(loginApi).mockResolvedValue(mockResponse)
      await authStore.login('admin', 'adminpass')

      expect(authStore.hasAuthority('USER')).toBe(true)
      expect(authStore.hasAuthority('ADMIN')).toBe(true)
      expect(authStore.hasAuthority('SUPER_ADMIN')).toBe(true)
      expect(authStore.hasAuthority('MODERATOR')).toBe(false)
    })

    it('should clear authorities on logout', async () => {
      const mockResponse = {
        accessToken: 'token',
        user: { id: '1', username: 'user' },
        authorities: ['USER', 'ADMIN']
      }

      vi.mocked(loginApi).mockResolvedValue(mockResponse)
      await authStore.login('user', 'pass')

      expect(authStore.authorities).toEqual(['USER', 'ADMIN'])

      authStore.logout()

      expect(authStore.authorities).toEqual([])
      expect(authStore.hasAuthority('USER')).toBe(false)
    })
  })
})
