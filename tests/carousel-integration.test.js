import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import Home from '../src/views/Home.vue'
import HeroBanner from '../src/components/common/HeroBanner.vue'
import ElementPlus from 'element-plus'

// Mock the API modules
vi.mock('../src/api/home', () => ({
  getSlideListApi: vi.fn()
}))

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

import { getSlideListApi } from '../src/api/home'

describe('Carousel Integration Tests', () => {
  let router
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'Home', component: Home },
        { path: '/product/:id', name: 'Product', component: { template: '<div>Product</div>' } },
        { path: '/category/:id', name: 'Category', component: { template: '<div>Category</div>' } }
      ]
    })
    
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Carousel Data Loading', () => {
    it('should load carousel data from API on mount', async () => {
      const mockSlideData = [
        {
          id: '1',
          productId: 'prod-1',
          sortOrder: 1,
          name: 'Banner 1',
          description: 'Description 1',
          displayImg: 'https://example.com/display1.jpg',
          mainImg: 'https://example.com/main1.jpg',
          categoryId: 'cat-1',
          status: true,
          delFlag: false
        },
        {
          id: '2',
          productId: 'prod-2',
          sortOrder: 2,
          name: 'Banner 2',
          description: 'Description 2',
          displayImg: 'https://example.com/display2.jpg',
          mainImg: 'https://example.com/main2.jpg',
          categoryId: 'cat-2',
          status: true,
          delFlag: false
        }
      ]

      vi.mocked(getSlideListApi).mockResolvedValue(mockSlideData)

      await router.push('/')
      await router.isReady()

      const wrapper = mount(Home, {
        global: {
          plugins: [router, pinia, ElementPlus],
          stubs: {
            LazyImage: {
              template: '<img :src="src" :alt="alt" />',
              props: ['src', 'alt']
            }
          }
        }
      })

      await flushPromises()

      // Verify API was called
      expect(getSlideListApi).toHaveBeenCalledTimes(1)

      // Wait for loading to complete
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      // Verify banners are loaded
      expect(wrapper.vm.banners).toHaveLength(2)
      expect(wrapper.vm.bannersLoading).toBe(false)
    })

    it('should handle API failure gracefully', async () => {
      vi.mocked(getSlideListApi).mockRejectedValue(new Error('API Error'))

      await router.push('/')
      await router.isReady()

      const wrapper = mount(Home, {
        global: {
          plugins: [router, pinia, ElementPlus],
          stubs: {
            LazyImage: {
              template: '<img :src="src" :alt="alt" />',
              props: ['src', 'alt']
            }
          }
        }
      })

      await flushPromises()
      await wrapper.vm.$nextTick()

      // Verify banners array is empty on error
      expect(wrapper.vm.banners).toEqual([])
      expect(wrapper.vm.bannersLoading).toBe(false)
    })

    it('should show loading skeleton while loading', async () => {
      vi.mocked(getSlideListApi).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([]), 1000))
      )

      await router.push('/')
      await router.isReady()

      const wrapper = mount(Home, {
        global: {
          plugins: [router, pinia, ElementPlus],
          stubs: {
            LazyImage: {
              template: '<img :src="src" :alt="alt" />',
              props: ['src', 'alt']
            }
          }
        }
      })

      // Initially should show loading skeleton
      expect(wrapper.vm.bannersLoading).toBe(true)
      expect(wrapper.findComponent({ name: 'LoadingSkeleton' }).exists()).toBe(true)
    })
  })

  describe('Image Display Logic', () => {
    it('should prioritize displayImg over mainImg', async () => {
      const mockSlideData = [
        {
          id: '1',
          productId: 'prod-1',
          sortOrder: 1,
          name: 'Banner 1',
          description: 'Description 1',
          displayImg: 'https://example.com/display.jpg',
          mainImg: 'https://example.com/main.jpg',
          categoryId: 'cat-1',
          status: true,
          delFlag: false
        }
      ]

      vi.mocked(getSlideListApi).mockResolvedValue(mockSlideData)

      await router.push('/')
      await router.isReady()

      const wrapper = mount(Home, {
        global: {
          plugins: [router, pinia, ElementPlus],
          stubs: {
            LazyImage: {
              template: '<img :src="src" :alt="alt" />',
              props: ['src', 'alt']
            }
          }
        }
      })

      await flushPromises()
      await wrapper.vm.$nextTick()

      // Verify displayImg is used
      expect(wrapper.vm.banners[0].image).toBe('https://example.com/display.jpg')
    })

    it('should use mainImg when displayImg is null', async () => {
      const mockSlideData = [
        {
          id: '1',
          productId: 'prod-1',
          sortOrder: 1,
          name: 'Banner 1',
          description: 'Description 1',
          displayImg: null,
          mainImg: 'https://example.com/main.jpg',
          categoryId: 'cat-1',
          status: true,
          delFlag: false
        }
      ]

      vi.mocked(getSlideListApi).mockResolvedValue(mockSlideData)

      await router.push('/')
      await router.isReady()

      const wrapper = mount(Home, {
        global: {
          plugins: [router, pinia, ElementPlus],
          stubs: {
            LazyImage: {
              template: '<img :src="src" :alt="alt" />',
              props: ['src', 'alt']
            }
          }
        }
      })

      await flushPromises()
      await wrapper.vm.$nextTick()

      // Verify mainImg is used when displayImg is null
      expect(wrapper.vm.banners[0].image).toBe('https://example.com/main.jpg')
    })

    it('should filter out items with status false', async () => {
      const mockSlideData = [
        {
          id: '1',
          productId: 'prod-1',
          sortOrder: 1,
          name: 'Active Banner',
          description: 'Description',
          displayImg: 'https://example.com/display1.jpg',
          mainImg: 'https://example.com/main1.jpg',
          categoryId: 'cat-1',
          status: true,
          delFlag: false
        },
        {
          id: '2',
          productId: 'prod-2',
          sortOrder: 2,
          name: 'Inactive Banner',
          description: 'Description',
          displayImg: 'https://example.com/display2.jpg',
          mainImg: 'https://example.com/main2.jpg',
          categoryId: 'cat-2',
          status: false,
          delFlag: false
        }
      ]

      vi.mocked(getSlideListApi).mockResolvedValue(mockSlideData)

      await router.push('/')
      await router.isReady()

      const wrapper = mount(Home, {
        global: {
          plugins: [router, pinia, ElementPlus],
          stubs: {
            LazyImage: {
              template: '<img :src="src" :alt="alt" />',
              props: ['src', 'alt']
            }
          }
        }
      })

      await flushPromises()
      await wrapper.vm.$nextTick()

      // Should only have 1 banner (status: true)
      expect(wrapper.vm.banners).toHaveLength(1)
      expect(wrapper.vm.banners[0].title).toBe('Active Banner')
    })

    it('should filter out items with delFlag true', async () => {
      const mockSlideData = [
        {
          id: '1',
          productId: 'prod-1',
          sortOrder: 1,
          name: 'Valid Banner',
          description: 'Description',
          displayImg: 'https://example.com/display1.jpg',
          mainImg: 'https://example.com/main1.jpg',
          categoryId: 'cat-1',
          status: true,
          delFlag: false
        },
        {
          id: '2',
          productId: 'prod-2',
          sortOrder: 2,
          name: 'Deleted Banner',
          description: 'Description',
          displayImg: 'https://example.com/display2.jpg',
          mainImg: 'https://example.com/main2.jpg',
          categoryId: 'cat-2',
          status: true,
          delFlag: true
        }
      ]

      vi.mocked(getSlideListApi).mockResolvedValue(mockSlideData)

      await router.push('/')
      await router.isReady()

      const wrapper = mount(Home, {
        global: {
          plugins: [router, pinia, ElementPlus],
          stubs: {
            LazyImage: {
              template: '<img :src="src" :alt="alt" />',
              props: ['src', 'alt']
            }
          }
        }
      })

      await flushPromises()
      await wrapper.vm.$nextTick()

      // Should only have 1 banner (delFlag: false)
      expect(wrapper.vm.banners).toHaveLength(1)
      expect(wrapper.vm.banners[0].title).toBe('Valid Banner')
    })
  })

  describe('Sorting Functionality', () => {
    it('should sort banners by sortOrder in ascending order', async () => {
      const mockSlideData = [
        {
          id: '3',
          productId: 'prod-3',
          sortOrder: 3,
          name: 'Third Banner',
          description: 'Description 3',
          displayImg: 'https://example.com/display3.jpg',
          mainImg: 'https://example.com/main3.jpg',
          categoryId: 'cat-3',
          status: true,
          delFlag: false
        },
        {
          id: '1',
          productId: 'prod-1',
          sortOrder: 1,
          name: 'First Banner',
          description: 'Description 1',
          displayImg: 'https://example.com/display1.jpg',
          mainImg: 'https://example.com/main1.jpg',
          categoryId: 'cat-1',
          status: true,
          delFlag: false
        },
        {
          id: '2',
          productId: 'prod-2',
          sortOrder: 2,
          name: 'Second Banner',
          description: 'Description 2',
          displayImg: 'https://example.com/display2.jpg',
          mainImg: 'https://example.com/main2.jpg',
          categoryId: 'cat-2',
          status: true,
          delFlag: false
        }
      ]

      vi.mocked(getSlideListApi).mockResolvedValue(mockSlideData)

      await router.push('/')
      await router.isReady()

      const wrapper = mount(Home, {
        global: {
          plugins: [router, pinia, ElementPlus],
          stubs: {
            LazyImage: {
              template: '<img :src="src" :alt="alt" />',
              props: ['src', 'alt']
            }
          }
        }
      })

      await flushPromises()
      await wrapper.vm.$nextTick()

      // Verify banners are sorted by sortOrder
      expect(wrapper.vm.banners).toHaveLength(3)
      expect(wrapper.vm.banners[0].title).toBe('First Banner')
      expect(wrapper.vm.banners[1].title).toBe('Second Banner')
      expect(wrapper.vm.banners[2].title).toBe('Third Banner')
      expect(wrapper.vm.banners[0].sortOrder).toBe(1)
      expect(wrapper.vm.banners[1].sortOrder).toBe(2)
      expect(wrapper.vm.banners[2].sortOrder).toBe(3)
    })
  })

  describe('HeroBanner Component', () => {
    it('should render banner with correct data', () => {
      const mockBanners = [
        {
          id: '1',
          title: 'Test Banner',
          subtitle: 'Test Subtitle',
          image: 'https://example.com/test.jpg',
          link: '/product/1',
          buttonText: '查看详情',
          backgroundColor: '#667eea',
          textColor: '#ffffff'
        }
      ]

      const wrapper = mount(HeroBanner, {
        props: {
          banners: mockBanners,
          autoplay: false
        },
        global: {
          plugins: [router, ElementPlus],
          stubs: {
            LazyImage: {
              template: '<img :src="src" :alt="alt" />',
              props: ['src', 'alt', 'fallback', 'width', 'height', 'lazy', 'threshold', 'showPlaceholderIcon', 'showRetry', 'objectFit', 'borderRadius']
            }
          }
        }
      })

      // Verify banner content is rendered
      expect(wrapper.find('.banner-title').text()).toBe('Test Banner')
      expect(wrapper.find('.banner-subtitle').text()).toBe('Test Subtitle')
      expect(wrapper.find('.banner-button').text()).toBe('查看详情')
    })

    it('should show empty state when no banners', () => {
      const wrapper = mount(HeroBanner, {
        props: {
          banners: [],
          autoplay: false
        },
        global: {
          plugins: [router, ElementPlus]
        }
      })

      // Verify empty state is shown
      expect(wrapper.find('.hero-banner-empty').exists()).toBe(true)
      expect(wrapper.find('.empty-text').text()).toBe('暂无轮播图内容')
    })

    it('should navigate slides with next/prev buttons', async () => {
      const mockBanners = [
        {
          id: '1',
          title: 'Banner 1',
          subtitle: 'Subtitle 1',
          image: 'https://example.com/1.jpg',
          link: '/product/1',
          buttonText: '查看详情'
        },
        {
          id: '2',
          title: 'Banner 2',
          subtitle: 'Subtitle 2',
          image: 'https://example.com/2.jpg',
          link: '/product/2',
          buttonText: '查看详情'
        }
      ]

      const wrapper = mount(HeroBanner, {
        props: {
          banners: mockBanners,
          autoplay: false
        },
        global: {
          plugins: [router, ElementPlus],
          stubs: {
            LazyImage: {
              template: '<img :src="src" :alt="alt" />',
              props: ['src', 'alt', 'fallback', 'width', 'height', 'lazy', 'threshold', 'showPlaceholderIcon', 'showRetry', 'objectFit', 'borderRadius']
            }
          }
        }
      })

      // Initial state
      expect(wrapper.vm.currentIndex).toBe(0)

      // Click next button
      await wrapper.find('.nav-next').trigger('click')
      expect(wrapper.vm.currentIndex).toBe(1)

      // Click prev button
      await wrapper.find('.nav-prev').trigger('click')
      expect(wrapper.vm.currentIndex).toBe(0)
    })

    it('should navigate to specific slide via indicators', async () => {
      const mockBanners = [
        { id: '1', title: 'Banner 1', image: 'https://example.com/1.jpg' },
        { id: '2', title: 'Banner 2', image: 'https://example.com/2.jpg' },
        { id: '3', title: 'Banner 3', image: 'https://example.com/3.jpg' }
      ]

      const wrapper = mount(HeroBanner, {
        props: {
          banners: mockBanners,
          autoplay: false
        },
        global: {
          plugins: [router, ElementPlus],
          stubs: {
            LazyImage: {
              template: '<img :src="src" :alt="alt" />',
              props: ['src', 'alt', 'fallback', 'width', 'height', 'lazy', 'threshold', 'showPlaceholderIcon', 'showRetry', 'objectFit', 'borderRadius']
            }
          }
        }
      })

      // Click on third indicator
      const indicators = wrapper.findAll('.indicator')
      await indicators[2].trigger('click')
      expect(wrapper.vm.currentIndex).toBe(2)

      // Click on first indicator
      await indicators[0].trigger('click')
      expect(wrapper.vm.currentIndex).toBe(0)
    })

    it('should emit bannerClick event when button is clicked', async () => {
      const mockBanners = [
        {
          id: '1',
          title: 'Test Banner',
          subtitle: 'Test Subtitle',
          image: 'https://example.com/test.jpg',
          link: '/product/1',
          buttonText: '查看详情'
        }
      ]

      const wrapper = mount(HeroBanner, {
        props: {
          banners: mockBanners,
          autoplay: false
        },
        global: {
          plugins: [router, ElementPlus],
          stubs: {
            LazyImage: {
              template: '<img :src="src" :alt="alt" />',
              props: ['src', 'alt', 'fallback', 'width', 'height', 'lazy', 'threshold', 'showPlaceholderIcon', 'showRetry', 'objectFit', 'borderRadius']
            }
          }
        }
      })

      await wrapper.find('.banner-button').trigger('click')

      // Verify event was emitted
      expect(wrapper.emitted('bannerClick')).toBeTruthy()
      expect(wrapper.emitted('bannerClick')[0][0]).toEqual(mockBanners[0])
    })

    it('should disable navigation buttons when only one banner', () => {
      const mockBanners = [
        {
          id: '1',
          title: 'Single Banner',
          image: 'https://example.com/single.jpg'
        }
      ]

      const wrapper = mount(HeroBanner, {
        props: {
          banners: mockBanners,
          autoplay: false
        },
        global: {
          plugins: [router, ElementPlus],
          stubs: {
            LazyImage: {
              template: '<img :src="src" :alt="alt" />',
              props: ['src', 'alt', 'fallback', 'width', 'height', 'lazy', 'threshold', 'showPlaceholderIcon', 'showRetry', 'objectFit', 'borderRadius']
            }
          }
        }
      })

      // Verify navigation buttons are disabled
      expect(wrapper.find('.nav-prev').attributes('disabled')).toBeDefined()
      expect(wrapper.find('.nav-next').attributes('disabled')).toBeDefined()
    })

    it('should not show indicators when only one banner', () => {
      const mockBanners = [
        {
          id: '1',
          title: 'Single Banner',
          image: 'https://example.com/single.jpg'
        }
      ]

      const wrapper = mount(HeroBanner, {
        props: {
          banners: mockBanners,
          autoplay: false
        },
        global: {
          plugins: [router, ElementPlus],
          stubs: {
            LazyImage: {
              template: '<img :src="src" :alt="alt" />',
              props: ['src', 'alt', 'fallback', 'width', 'height', 'lazy', 'threshold', 'showPlaceholderIcon', 'showRetry', 'objectFit', 'borderRadius']
            }
          }
        }
      })

      // Verify indicators are not shown
      expect(wrapper.find('.banner-indicators').exists()).toBe(false)
    })
  })

  describe('Responsive Layout', () => {
    it('should render banner with responsive classes', () => {
      const mockBanners = [
        {
          id: '1',
          title: 'Responsive Banner',
          image: 'https://example.com/responsive.jpg'
        }
      ]

      const wrapper = mount(HeroBanner, {
        props: {
          banners: mockBanners,
          autoplay: false
        },
        global: {
          plugins: [router, ElementPlus],
          stubs: {
            LazyImage: {
              template: '<img :src="src" :alt="alt" />',
              props: ['src', 'alt', 'fallback', 'width', 'height', 'lazy', 'threshold', 'showPlaceholderIcon', 'showRetry', 'objectFit', 'borderRadius']
            }
          }
        }
      })

      // Verify responsive structure exists
      expect(wrapper.find('.hero-banner').exists()).toBe(true)
      expect(wrapper.find('.banner-container').exists()).toBe(true)
      expect(wrapper.find('.banner-content').exists()).toBe(true)
    })
  })
})
