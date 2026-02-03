<template>
  <div class="product-demo">
    <div class="container">
      <h1>商品展示组件演示</h1>
      
      <!-- 商品网格演示 -->
      <div class="demo-section">
        <h2>商品网格组件</h2>
        <ProductGrid
          :products="products"
          :categories="categories"
          :available-tags="availableTags"
          :price-range="priceRange"
          :filters="filters"
          :sort-by="sortBy"
          :current-category="currentCategory"
          :search-keyword="searchKeyword"
          :total-count="totalCount"
          :current-page="currentPage"
          :page-size="pageSize"
          :loading="loading"
          @filter-change="handleFilterChange"
          @sort-change="handleSortChange"
          @page-change="handlePageChange"
          @size-change="handleSizeChange"
          @product-click="handleProductClick"
          @favorite-toggle="handleFavoriteToggle"
          @add-to-cart="handleAddToCart"
          @clear-filters="handleClearFilters"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductStore } from '@/stores/product.js'
import { useCartStore } from '@/stores/cart.js'
import { ProductGrid } from '@/components/product'
import { ElMessage } from 'element-plus'

// 使用 stores
const productStore = useProductStore()
const cartStore = useCartStore()

// 响应式数据
const loading = ref(false)
const filters = ref({
  category: null,
  minPrice: null,
  maxPrice: null,
  minRating: null,
  tags: [],
  inStock: false
})
const sortBy = ref('default')
const currentCategory = ref(null)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(12)

// 计算属性
const products = computed(() => productStore.paginatedProducts)
const categories = computed(() => productStore.categories)
const availableTags = computed(() => productStore.availableTags)
const priceRange = computed(() => productStore.priceRange)
const totalCount = computed(() => productStore.filteredProductsCount)

// 方法
const handleFilterChange = (newFilters) => {
  filters.value = { ...newFilters }
  
  // 应用筛选到 store
  if (newFilters.category) {
    productStore.filterByCategory(newFilters.category)
    currentCategory.value = newFilters.category
  }
  
  if (newFilters.minPrice !== null || newFilters.maxPrice !== null) {
    productStore.setPriceFilter(newFilters.minPrice, newFilters.maxPrice)
  }
  
  if (newFilters.minRating !== null) {
    productStore.setRatingFilter(newFilters.minRating)
  }
  
  if (newFilters.tags && newFilters.tags.length > 0) {
    productStore.setTagsFilter(newFilters.tags)
  }
  
  if (newFilters.inStock) {
    productStore.setStockFilter(newFilters.inStock)
  }
}

const handleSortChange = (newSortBy) => {
  sortBy.value = newSortBy
  productStore.sortProducts(newSortBy)
}

const handlePageChange = (page) => {
  currentPage.value = page
  productStore.goToPage(page)
}

const handleSizeChange = (size) => {
  pageSize.value = size
  productStore.setPageSize(size)
}

const handleProductClick = (product) => {
  ElMessage.info(`点击了商品: ${product.name}`)
}

const handleFavoriteToggle = (product) => {
  ElMessage.success(`${product.isFavorite ? '已收藏' : '已取消收藏'}: ${product.name}`)
}

const handleAddToCart = (product) => {
  ElMessage.success(`已添加到购物车: ${product.name}`)
}

const handleClearFilters = () => {
  filters.value = {
    category: null,
    minPrice: null,
    maxPrice: null,
    minRating: null,
    tags: [],
    inStock: false
  }
  sortBy.value = 'default'
  currentCategory.value = null
  searchKeyword.value = ''
  productStore.clearFilters()
}

// 生命周期
onMounted(async () => {
  loading.value = true
  try {
    await productStore.initialize()
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.product-demo {
  min-height: 100vh;
  background: $background;
  padding: $spacing-xl 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-md;
}

h1 {
  text-align: center;
  color: $text-primary;
  margin-bottom: $spacing-xl;
  font-size: $font-size-3xl;
  font-weight: 700;
}

.demo-section {
  margin-bottom: $spacing-2xl;
  
  h2 {
    color: $text-primary;
    margin-bottom: $spacing-lg;
    font-size: $font-size-2xl;
    font-weight: 600;
    border-bottom: 2px solid $primary-color;
    padding-bottom: $spacing-sm;
  }
}

@include max-width($breakpoint-md) {
  .container {
    padding: 0 $spacing-sm;
  }
  
  h1 {
    font-size: $font-size-2xl;
  }
  
  .demo-section h2 {
    font-size: $font-size-xl;
  }
}
</style>