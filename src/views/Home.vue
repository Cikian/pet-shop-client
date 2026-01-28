<template>
  <div class="home">
    <!-- 轮播图 -->
    <section class="hero-section">
      <HeroBanner 
        :banners="banners"
        :autoplay="true"
        :autoplay-interval="5000"
        @banner-click="handleBannerClick"
      />
    </section>

    <!-- 商品分类 -->
    <section class="category-section">
      <CategoryGrid 
        :categories="categories"
        :columns="3"
        @category-click="handleCategoryClick"
      />
    </section>

    <!-- 推荐商品 -->
    <section class="featured-section">
      <ProductCarousel 
        :products="featuredProducts"
        title="精选推荐"
        subtitle="为你精心挑选的优质商品"
        :items-per-page="4"
        :show-navigation="true"
        :show-indicators="true"
        @add-to-cart="handleAddToCart"
        @product-click="handleProductClick"
      />
    </section>

    <!-- 促销商品 -->
    <section class="sale-section">
      <ProductCarousel 
        :products="saleProducts"
        title="限时优惠"
        subtitle="错过就要等下次了"
        :items-per-page="4"
        :show-navigation="true"
        :show-indicators="true"
        :autoplay="true"
        :autoplay-interval="6000"
        @add-to-cart="handleAddToCart"
        @product-click="handleProductClick"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import HeroBanner from '@/components/common/HeroBanner.vue'
import CategoryGrid from '@/components/common/CategoryGrid.vue'
import ProductCarousel from '@/components/common/ProductCarousel.vue'
import { mockBanners, getFeaturedProducts, getOnSaleProducts, updateCategoryProductCounts } from '@/data/mockData'

const router = useRouter()
const cartStore = useCartStore()
const productStore = useProductStore()

// 响应式数据
const banners = ref([])
const categories = ref([])
const featuredProducts = ref([])
const saleProducts = ref([])

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
  ElMessage.success(`选择了分类: ${category.name}`)
}

/**
 * 处理添加到购物车
 */
const handleAddToCart = (product) => {
  cartStore.addItem(product, 1)
  ElMessage.success(`${product.name} 已添加到购物车`)
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
 * 初始化页面数据
 */
const initializeData = async () => {
  try {
    // 加载轮播图数据
    banners.value = mockBanners.filter(banner => banner.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)

    // 加载分类数据
    await productStore.fetchCategories()
    categories.value = updateCategoryProductCounts()
      .filter(category => category.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)

    // 加载推荐商品
    featuredProducts.value = getFeaturedProducts(8)

    // 加载促销商品
    saleProducts.value = getOnSaleProducts(6)

  } catch (error) {
    console.error('Failed to initialize home data:', error)
    ElMessage.error('页面数据加载失败')
  }
}

// 生命周期
onMounted(() => {
  initializeData()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

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

// 响应式调整
@media (max-width: $breakpoint-sm) {
  .category-section,
  .featured-section,
  .sale-section {
    padding: 0 $spacing-sm;
  }
}
</style>