import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCartStore } from '../src/stores/cart'
import { useProductStore } from '../src/stores/product'
import { getPaginatedProducts } from '../src/data/mockData'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

describe('Cart Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
  })

  it('should initialize with empty cart', () => {
    const cartStore = useCartStore()
    expect(cartStore.items).toEqual([])
    expect(cartStore.totalCount).toBe(0)
    expect(cartStore.totalPrice).toBe(0)
  })

  it('should add item to cart', () => {
    const cartStore = useCartStore()
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg'
    }

    cartStore.addItem(mockProduct, 2)

    expect(cartStore.items).toHaveLength(1)
    expect(cartStore.items[0].product).toEqual(mockProduct)
    expect(cartStore.items[0].quantity).toBe(2)
    expect(cartStore.items[0].selected).toBe(true)
    expect(cartStore.totalCount).toBe(2)
    expect(cartStore.totalPrice).toBe(200)
  })

  it('should update quantity when adding existing item', () => {
    const cartStore = useCartStore()
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg'
    }

    cartStore.addItem(mockProduct, 1)
    cartStore.addItem(mockProduct, 2)

    expect(cartStore.items).toHaveLength(1)
    expect(cartStore.items[0].quantity).toBe(3)
    expect(cartStore.totalCount).toBe(3)
  })

  it('should remove item from cart', () => {
    const cartStore = useCartStore()
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg'
    }

    cartStore.addItem(mockProduct, 2)
    cartStore.removeItem('1')

    expect(cartStore.items).toHaveLength(0)
    expect(cartStore.totalCount).toBe(0)
    expect(cartStore.totalPrice).toBe(0)
  })

  it('should clear cart', () => {
    const cartStore = useCartStore()
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg'
    }

    cartStore.addItem(mockProduct, 2)
    cartStore.clearCart()

    expect(cartStore.items).toHaveLength(0)
    expect(cartStore.totalCount).toBe(0)
  })

  it('should save to localStorage when items change', () => {
    const cartStore = useCartStore()
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg'
    }

    cartStore.addItem(mockProduct, 1)

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'mall-cart',
      expect.stringContaining('"id":"1"')
    )
  })
})

describe('Product Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with empty products and categories', () => {
    const productStore = useProductStore()
    expect(productStore.products).toEqual([])
    expect(productStore.categories).toEqual([])
    expect(productStore.loading).toBe(false)
  })

  it('should fetch products successfully', async () => {
    const productStore = useProductStore()
    
    await productStore.fetchProducts()
    
    expect(productStore.products.length).toBeGreaterThan(0)
    expect(productStore.loading).toBe(false)
    expect(productStore.products[0]).toHaveProperty('id')
    expect(productStore.products[0]).toHaveProperty('name')
    expect(productStore.products[0]).toHaveProperty('price')
  })

  it('should fetch categories successfully', async () => {
    const productStore = useProductStore()
    
    await productStore.fetchCategories()
    
    expect(productStore.categories.length).toBeGreaterThan(0)
    expect(productStore.loading).toBe(false)
    expect(productStore.categories[0]).toHaveProperty('id')
    expect(productStore.categories[0]).toHaveProperty('name')
  })

  it('should filter products by search keyword', async () => {
    const productStore = useProductStore()
    await productStore.fetchProducts()
    
    productStore.searchProducts('iPhone')
    
    const filtered = productStore.filteredProducts
    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.every(product => 
      product.name.toLowerCase().includes('iphone') ||
      product.description.toLowerCase().includes('iphone') ||
      product.tags.some(tag => tag.toLowerCase().includes('iphone'))
    )).toBe(true)
  })

  it('should filter products by category', async () => {
    const productStore = useProductStore()
    await productStore.fetchProducts()
    
    productStore.filterByCategory('electronics')
    
    const filtered = productStore.filteredProducts
    expect(filtered.every(product => product.category === 'electronics')).toBe(true)
  })

  it('should sort products by price', async () => {
    const productStore = useProductStore()
    await productStore.fetchProducts()
    
    productStore.sortProducts('price-asc')
    
    const filtered = productStore.filteredProducts
    for (let i = 1; i < filtered.length; i++) {
      expect(filtered[i].price).toBeGreaterThanOrEqual(filtered[i - 1].price)
    }
  })

  it('should get product by id', async () => {
    const productStore = useProductStore()
    await productStore.fetchProducts()
    
    const product = productStore.getProductById('1')
    
    expect(product).toBeDefined()
    expect(product.id).toBe('1')
  })

  it('should handle pagination correctly', async () => {
    const productStore = useProductStore()
    await productStore.fetchProducts()
    
    // Set page size to 3 for testing
    productStore.setPageSize(3)
    
    expect(productStore.pageSize).toBe(3)
    expect(productStore.currentPage).toBe(1)
    expect(productStore.paginatedProducts.length).toBeLessThanOrEqual(3)
    expect(productStore.totalPages).toBeGreaterThan(1)
  })

  it('should navigate pages correctly', async () => {
    const productStore = useProductStore()
    await productStore.fetchProducts()
    
    productStore.setPageSize(3)
    const totalPages = productStore.totalPages
    
    // Go to next page
    productStore.nextPage()
    expect(productStore.currentPage).toBe(2)
    
    // Go to previous page
    productStore.prevPage()
    expect(productStore.currentPage).toBe(1)
    
    // Go to specific page
    productStore.goToPage(totalPages)
    expect(productStore.currentPage).toBe(totalPages)
  })

  it('should reset pagination when filtering', async () => {
    const productStore = useProductStore()
    await productStore.fetchProducts()
    
    productStore.setPageSize(3)
    productStore.nextPage()
    expect(productStore.currentPage).toBe(2)
    
    // Filter should reset pagination
    productStore.filterByCategory('electronics')
    expect(productStore.currentPage).toBe(1)
    
    // Search should reset pagination
    productStore.nextPage()
    productStore.searchProducts('iPhone')
    expect(productStore.currentPage).toBe(1)
  })

  it('should provide correct pagination info', async () => {
    const productStore = useProductStore()
    await productStore.fetchProducts()
    
    productStore.setPageSize(5)
    const paginationInfo = productStore.paginationInfo
    
    expect(paginationInfo).toHaveProperty('page')
    expect(paginationInfo).toHaveProperty('pageSize')
    expect(paginationInfo).toHaveProperty('total')
    expect(paginationInfo).toHaveProperty('totalPages')
    expect(paginationInfo.pageSize).toBe(5)
    expect(paginationInfo.total).toBeGreaterThan(0)
  })
})

describe('Mock Data Utilities', () => {
  it('should return paginated products correctly', () => {
    const result = getPaginatedProducts({
      page: 1,
      pageSize: 3
    })
    
    expect(result).toHaveProperty('products')
    expect(result).toHaveProperty('pagination')
    expect(result).toHaveProperty('filters')
    expect(result.products.length).toBeLessThanOrEqual(3)
    expect(result.pagination.page).toBe(1)
    expect(result.pagination.pageSize).toBe(3)
    expect(result.pagination.total).toBeGreaterThan(0)
  })

  it('should filter and paginate products by category', () => {
    const result = getPaginatedProducts({
      page: 1,
      pageSize: 5,
      category: 'electronics'
    })
    
    expect(result.products.every(product => product.category === 'electronics')).toBe(true)
    expect(result.filters.category).toBe('electronics')
  })

  it('should search and paginate products by keyword', () => {
    const result = getPaginatedProducts({
      page: 1,
      pageSize: 5,
      keyword: 'iPhone'
    })
    
    expect(result.products.every(product => 
      product.name.toLowerCase().includes('iphone') ||
      product.description.toLowerCase().includes('iphone') ||
      product.tags.some(tag => tag.toLowerCase().includes('iphone'))
    )).toBe(true)
    expect(result.filters.keyword).toBe('iPhone')
  })

  it('should get product statistics', async () => {
    const productStore = useProductStore()
    await productStore.fetchProducts()
    
    const stats = productStore.getProductStats()
    
    expect(stats).toHaveProperty('totalProducts')
    expect(stats).toHaveProperty('totalCategories')
    expect(stats).toHaveProperty('averagePrice')
    expect(stats).toHaveProperty('averageRating')
    expect(stats).toHaveProperty('outOfStockCount')
    expect(stats).toHaveProperty('onSaleCount')
    expect(stats.totalProducts).toBeGreaterThan(0)
    expect(stats.averagePrice).toBeGreaterThan(0)
    expect(stats.averageRating).toBeGreaterThan(0)
  })

  it('should get related products', async () => {
    const productStore = useProductStore()
    await productStore.fetchProducts()
    
    const related = productStore.getRelatedProducts('1', 3)
    
    expect(Array.isArray(related)).toBe(true)
    expect(related.length).toBeLessThanOrEqual(3)
    expect(related.every(p => p.id !== '1')).toBe(true)
  })

  it('should batch update products', async () => {
    const productStore = useProductStore()
    await productStore.fetchProducts()
    
    // Batch favorite products
    productStore.batchUpdateProducts(['1', '2'], 'favorite')
    
    const product1 = productStore.getProductById('1')
    const product2 = productStore.getProductById('2')
    
    expect(product1.isFavorite).toBe(true)
    expect(product2.isFavorite).toBe(true)
  })
})