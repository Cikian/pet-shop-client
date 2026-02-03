<template>
  <div class="home">
    <!-- 网络状态监控 -->
    <NetworkStatus />
    
    <!-- 错误边界 -->
    <ErrorBoundary 
      :show-retry="true"
      :show-reload="true"
      :on-retry="handleRetry"
      @error="handleError"
    >
      <!-- 轮播图 -->
      <section class="hero-section">
        <LoadingSkeleton 
          v-if="bannersLoading" 
          type="banner" 
          :animated="true"
        />
        <HeroBanner 
          v-else
          :banners="banners"
          :autoplay="true"
          :autoplay-interval="5000"
          @banner-click="handleBannerClick"
        />
      </section>

      <!-- 商品分类 -->
      <section class="category-section">
        <LoadingSkeleton 
          v-if="categoriesLoading" 
          type="category-grid" 
          :count="6"
          :animated="true"
        />
        <CategoryGrid 
          v-else
          :categories="categories"
          :columns="3"
          @category-click="handleCategoryClick"
        />
      </section>

      <!-- 推荐商品 -->
      <section class="featured-section">
        <div class="section-header">
          <h2 class="section-title">精选推荐</h2>
          <p class="section-subtitle">为你精心挑选的优质商品</p>
        </div>
        
        <LoadingSkeleton 
          v-if="productsLoading" 
          type="product-list" 
          :count="4"
          :animated="true"
        />
        <ProductCarousel 
          v-else
          :products="featuredProducts"
          title=""
          subtitle=""
          :items-per-page="4"
          :show-navigation="true"
          :show-indicators="true"
          @add-to-cart="handleAddToCart"
          @product-click="handleProductClick"
        />
      </section>

      <!-- 促销商品 -->
      <section class="sale-section">
        <div class="section-header">
          <h2 class="section-title">限时优惠</h2>
          <p class="section-subtitle">错过就要等下次了</p>
        </div>
        
        <LoadingSkeleton 
          v-if="productsLoading" 
          type="product-list" 
          :count="4"
          :animated="true"
        />
        <ProductCarousel 
          v-else
          :products="saleProducts"
          title=""
          subtitle=""
          :items-per-page="4"
          :show-navigation="true"
          :show-indicators="true"
          :autoplay="true"
          :autoplay-interval="6000"
          @add-to-cart="handleAddToCart"
          @product-click="handleProductClick"
        />
      </section>
    </ErrorBoundary>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import HeroBanner from '@/components/common/HeroBanner.vue'
import CategoryGrid from '@/components/common/CategoryGrid.vue'
import ProductCarousel from '@/components/common/ProductCarousel.vue'
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import NetworkStatus from '@/components/common/NetworkStatus.vue'
import { mockBanners, getFeaturedProducts, getOnSaleProducts, updateCategoryProductCounts } from '@/data/mockData'

const router = useRouter()
const cartStore = useCartStore()
const productStore = useProductStore()

// 响应式数据
const banners = ref([])
const categories = ref([])
const featuredProducts = ref([])
const saleProducts = ref([])
const bannersLoading = ref(true)
const categoriesLoading = ref(true)
const productsLoading = ref(true)

// 计算属性
const isLoading = computed(() => {
  return bannersLoading.value || categoriesLoading.value || productsLoading.value
})

/**
 * 处理轮播图点击
 */
const handleBannerClick = (banner) => {
  console.log('Banner clicked:', banner)
  ElMessage.success(`点击了轮播图: ${banner.title}`)
}

/**
 * 处理分类点击
 */
const handleCategoryClick = (category) => {
  console.log('Category clicked:', category)
  router.push({
    name: 'Category',
    params: { id: category.id }
  })
  ElMessage.success(`选择了分类: ${category.name}`)
}

/**
 * 处理添加到购物车
 */
const handleAddToCart = (product) => {
  try {
    cartStore.addItem(product, 1)
    ElMessage.success(`${product.name} 已添加到购物车`)
  } catch (error) {
    console.error('Failed to add to cart:', error)
    ElMessage.error('添加到购物车失败，请重试')
  }
}

/**
 * 处理商品点击
 */
const handleProductClick = (product) => {
  router.push({
    name: 'Product',
    params: { id: product.id }
  })
}

/**
 * 处理错误
 */
const handleError = (errorInfo) => {
  console.error('Home page error:', errorInfo)
  ElMessage.error('页面加载出现问题，请刷新重试')
}

/**
 * 处理重试
 */
const handleRetry = async () => {
  try {
    await initializeData()
    ElMessage.success('重新加载成功')
  } catch (error) {
    console.error('Retry failed:', error)
    ElMessage.error('重试失败，请稍后再试')
    throw error
  }
}

/**
 * 加载轮播图数据
 */
const loadBanners = async () => {
  try {
    bannersLoading.value = true
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    banners.value = mockBanners.filter(banner => banner.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  } catch (error) {
    console.error('Failed to load banners:', error)
    ElMessage.error('轮播图加载失败')
    throw error
  } finally {
    bannersLoading.value = false
  }
}

/**
 * 加载分类数据
 */
const loadCategories = async () => {
  try {
    categoriesLoading.value = true
    await productStore.fetchCategories()
    
    categories.value = updateCategoryProductCounts()
      .filter(category => category.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  } catch (error) {
    console.error('Failed to load categories:', error)
    ElMessage.error('分类数据加载失败')
    throw error
  } finally {
    categoriesLoading.value = false
  }
}

/**
 * 加载商品数据
 */
const loadProducts = async () => {
  try {
    productsLoading.value = true
    await productStore.fetchProducts()
    
    // 加载推荐商品
    featuredProducts.value = getFeaturedProducts(8)
    
    // 加载促销商品
    saleProducts.value = getOnSaleProducts(6)
  } catch (error) {
    console.error('Failed to load products:', error)
    ElMessage.error('商品数据加载失败')
    throw error
  } finally {
    productsLoading.value = false
  }
}

/**
 * 初始化页面数据
 */
const initializeData = async () => {
  try {
    // 并行加载数据以提高性能
    await Promise.allSettled([
      loadBanners(),
      loadCategories(),
      loadProducts()
    ])
  } catch (error) {
    console.error('Failed to initialize home data:', error)
    throw error
  }
}

// 生命周期
onMounted(() => {
  initializeData()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.home {
  min-height: 100vh;
  background: $background;
}

.hero-section {
  margin-bottom: $spacing-2xl;
  
  @media (max-width: $breakpoint-md) {
    margin-bottom: $spacing-xl;
  }
}

.category-section {
  max-width: 1200px;
  margin: 0 auto $spacing-2xl auto;
  padding: 0 $spacing-lg;
  
  @media (max-width: $breakpoint-md) {
    margin-bottom: $spacing-xl;
    padding: 0 $spacing-md;
  }
}

.featured-section,
.sale-section {
  max-width: 1200px;
  margin: 0 auto $spacing-2xl auto;
  padding: 0 $spacing-lg;
  
  @media (max-width: $breakpoint-md) {
    margin-bottom: $spacing-xl;
    padding: 0 $spacing-md;
  }
}

.sale-section {
  margin-bottom: 0; // 最后一个section不需要底部间距
}

.section-header {
  text-align: center;
  margin-bottom: $spacing-xl;
  
  @media (max-width: $breakpoint-md) {
    margin-bottom: $spacing-lg;
  }
}

.section-title {
  font-size: $font-size-2xl;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 $spacing-sm 0;
  
  @media (max-width: $breakpoint-md) {
    font-size: $font-size-xl;
  }
}

.section-subtitle {
  font-size: $font-size-base;
  color: $text-secondary;
  margin: 0;
  
  @media (max-width: $breakpoint-md) {
    font-size: $font-size-sm;
  }
}

// 响应式调整
@media (max-width: $breakpoint-sm) {
  .category-section,
  .featured-section,
  .sale-section {
    padding: 0 $spacing-sm;
  }
}
</style>