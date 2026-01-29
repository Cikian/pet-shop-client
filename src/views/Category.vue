<template>
  <div class="category-page">
    <!-- 页面头部 -->
    <BreadcrumbNav
      :items="breadcrumbItems"
      :title="currentCategoryName"
      :description="currentCategory?.description"
      :title-icon="currentCategory?.icon"
    />
    
    <!-- 分类导航 -->
    <div class="category-nav" v-if="categories.length > 0">
      <div class="container">
        <div class="category-tabs">
          <div 
            class="category-tab"
            :class="{ active: !currentCategoryId }"
            @click="selectCategory(null)"
          >
            <span>全部</span>
            <span class="tab-count">({{ totalProductsCount }})</span>
          </div>
          <div
            v-for="category in categories"
            :key="category.id"
            class="category-tab"
            :class="{ active: currentCategoryId === category.id }"
            @click="selectCategory(category.id)"
          >
            <el-icon v-if="category.icon">
              <component :is="category.icon" />
            </el-icon>
            <span>{{ category.name }}</span>
            <span class="tab-count">({{ category.productCount }})</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="category-content">
      <div class="container">
        <!-- 商品网格组件 -->
        <ProductGrid
          :products="paginatedProducts"
          :categories="categories"
          :available-tags="availableTags"
          :price-range="priceRange"
          :filters="filters"
          :sort-by="sortBy"
          :current-category="currentCategoryId"
          :search-keyword="searchKeyword"
          :total-count="filteredProductsCount"
          :current-page="currentPage"
          :page-size="pageSize"
          :has-more="hasMorePages"
          :loading="loading"
          :loading-more="loadingMore"
          :show-load-more="paginationMode === 'infinite'"
          :show-pagination="paginationMode === 'pagination'"
          @filter-change="handleFilterChange"
          @sort-change="handleSortChange"
          @page-change="handlePageChange"
          @size-change="handlePageSizeChange"
          @load-more="handleLoadMore"
          @product-click="handleProductClick"
          @favorite-toggle="handleFavoriteToggle"
          @add-to-cart="handleAddToCart"
          @clear-filters="handleClearFilters"
        />
        
        <!-- 无限滚动触发器 -->
        <div 
          v-if="paginationMode === 'infinite' && hasMorePages && !loading"
          ref="infiniteScrollTrigger"
          class="infinite-scroll-trigger"
        >
          <el-button 
            v-if="!autoLoadMore"
            type="primary" 
            :loading="loadingMore"
            @click="handleLoadMore"
            size="large"
          >
            {{ loadingMore ? '加载中...' : '加载更多商品' }}
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 返回顶部按钮 -->
    <el-backtop :right="30" :bottom="80" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product.js'
import { useCartStore } from '@/stores/cart.js'
import ProductGrid from '@/components/product/ProductGrid.vue'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import { ElMessage } from 'element-plus'

/**
 * 商品分类页面
 * 支持分类筛选、商品展示、分页/无限滚动等功能
 * 需求: 2.1, 2.4
 */

// 路由和状态管理
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()

// 响应式数据
const loading = ref(false)
const loadingMore = ref(false)
const paginationMode = ref('pagination') // 'pagination' | 'infinite'
const autoLoadMore = ref(false) // 是否自动加载更多
const infiniteScrollTrigger = ref(null)
const intersectionObserver = ref(null)

// 从路由参数获取分类ID
const currentCategoryId = computed(() => route.params.id || null)

// 从 store 获取数据
const {
  products,
  categories,
  filteredProducts,
  paginatedProducts,
  filteredProductsCount,
  availableTags,
  priceRange,
  currentPage,
  pageSize,
  hasMorePages,
  totalPages,
  filters,
  sortBy,
  searchKeyword
} = productStore

// 计算属性
const currentCategory = computed(() => {
  if (!currentCategoryId.value) return null
  return productStore.getCategoryById(currentCategoryId.value)
})

const currentCategoryName = computed(() => {
  if (!currentCategoryId.value) return '所有商品'
  return currentCategory.value?.name || '未知分类'
})

const totalProductsCount = computed(() => {
  return products.length
})

// 面包屑导航项
const breadcrumbItems = computed(() => {
  const items = []
  if (!currentCategoryId.value) {
    items.push({ label: '所有分类' })
  }
  return items
})

// 方法
const selectCategory = async (categoryId) => {
  if (categoryId === currentCategoryId.value) return
  
  // 更新路由
  if (categoryId) {
    await router.push({ name: 'Category', params: { id: categoryId } })
  } else {
    await router.push({ name: 'Category' })
  }
}

const handleFilterChange = (newFilters) => {
  productStore.filters = { ...newFilters }
  productStore.resetPagination()
}

const handleSortChange = (newSortBy) => {
  productStore.sortProducts(newSortBy)
}

const handlePageChange = (page) => {
  productStore.goToPage(page)
  scrollToTop()
}

const handlePageSizeChange = (size) => {
  productStore.setPageSize(size)
  scrollToTop()
}

const handleLoadMore = async () => {
  if (loadingMore.value || !hasMorePages) return
  
  loadingMore.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟加载延迟
    productStore.nextPage()
  } catch (error) {
    console.error('加载更多商品失败:', error)
    ElMessage.error('加载失败，请重试')
  } finally {
    loadingMore.value = false
  }
}

const handleProductClick = (product) => {
  router.push({ name: 'Product', params: { id: product.id } })
}

const handleFavoriteToggle = (product) => {
  productStore.toggleFavorite(product.id)
  ElMessage.success(
    product.isFavorite ? '已添加到收藏' : '已取消收藏'
  )
}

const handleAddToCart = (product) => {
  cartStore.addItem(product)
  ElMessage.success('已添加到购物车')
}

const handleClearFilters = () => {
  productStore.clearFilters()
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const setupInfiniteScroll = () => {
  if (!infiniteScrollTrigger.value || !autoLoadMore.value) return
  
  intersectionObserver.value = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && hasMorePages && !loadingMore.value) {
        handleLoadMore()
      }
    },
    {
      rootMargin: '100px'
    }
  )
  
  intersectionObserver.value.observe(infiniteScrollTrigger.value)
}

const cleanupInfiniteScroll = () => {
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect()
    intersectionObserver.value = null
  }
}

const initializePage = async () => {
  loading.value = true
  try {
    // 确保数据已加载
    if (products.length === 0) {
      await productStore.initialize()
    }
    
    // 根据路由参数设置分类筛选
    if (currentCategoryId.value) {
      productStore.filterByCategory(currentCategoryId.value)
    } else {
      productStore.filterByCategory(null)
    }
    
    // 设置分页模式（可以根据设备类型或用户偏好设置）
    const isMobile = window.innerWidth < 768
    paginationMode.value = isMobile ? 'infinite' : 'pagination'
    autoLoadMore.value = isMobile
    
  } catch (error) {
    console.error('初始化分类页面失败:', error)
    ElMessage.error('页面加载失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

// 监听路由变化
watch(() => route.params.id, async (newId) => {
  if (route.name === 'Category') {
    await initializePage()
  }
}, { immediate: false })

// 监听分页模式变化
watch(paginationMode, async (newMode) => {
  await nextTick()
  if (newMode === 'infinite' && autoLoadMore.value) {
    setupInfiniteScroll()
  } else {
    cleanupInfiniteScroll()
  }
})

// 生命周期
onMounted(async () => {
  await initializePage()
  
  // 设置无限滚动
  await nextTick()
  if (paginationMode.value === 'infinite' && autoLoadMore.value) {
    setupInfiniteScroll()
  }
  
  // 监听窗口大小变化
  const handleResize = () => {
    const isMobile = window.innerWidth < 768
    const newMode = isMobile ? 'infinite' : 'pagination'
    if (newMode !== paginationMode.value) {
      paginationMode.value = newMode
      autoLoadMore.value = isMobile
    }
  }
  
  window.addEventListener('resize', handleResize)
  
  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    cleanupInfiniteScroll()
  })
})

onUnmounted(() => {
  cleanupInfiniteScroll()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.category-page {
  min-height: 100vh;
  background: $background;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-md;
  
  @include max-width($breakpoint-sm) {
    padding: 0 $spacing-sm;
  }
}

// 页面头部
.category-header {
  background: $card-background;
  border-bottom: 1px solid $border-color;
  padding: $spacing-lg 0;
  
  .breadcrumb {
    margin-bottom: $spacing-md;
    
    :deep(.el-breadcrumb__item) {
      .el-breadcrumb__inner {
        color: $text-secondary;
        font-size: $font-size-sm;
        
        &:hover {
          color: $primary-color;
        }
      }
      
      &:last-child .el-breadcrumb__inner {
        color: $text-primary;
        font-weight: 500;
      }
    }
  }
  
  .category-info {
    .category-title {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      font-size: $font-size-2xl;
      font-weight: 600;
      color: $text-primary;
      margin: 0 0 $spacing-sm 0;
      
      .category-icon {
        font-size: 28px;
        color: $primary-color;
      }
      
      @include max-width($breakpoint-sm) {
        font-size: $font-size-xl;
        
        .category-icon {
          font-size: 24px;
        }
      }
    }
    
    .category-description {
      color: $text-secondary;
      font-size: $font-size-base;
      margin: 0;
      line-height: 1.5;
    }
  }
}

// 分类导航
.category-nav {
  background: $card-background;
  border-bottom: 1px solid $border-color;
  padding: $spacing-md 0;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .category-tabs {
    display: flex;
    gap: $spacing-sm;
    overflow-x: auto;
    padding-bottom: $spacing-xs;
    
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: $border-color;
      border-radius: 2px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: $primary-color;
      border-radius: 2px;
    }
  }
  
  .category-tab {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background: $background;
    border: 1px solid $border-color;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    font-size: $font-size-sm;
    
    &:hover {
      border-color: $primary-color;
      background: rgba($primary-color, 0.05);
      transform: translateY(-1px);
    }
    
    &.active {
      background: $primary-color;
      border-color: $primary-color;
      color: white;
      
      .tab-count {
        color: rgba(white, 0.8);
      }
    }
    
    .el-icon {
      font-size: 16px;
    }
    
    .tab-count {
      font-size: $font-size-xs;
      color: $text-light;
      font-weight: 500;
    }
  }
}

// 主要内容
.category-content {
  padding: $spacing-xl 0;
  min-height: 60vh;
}

// 无限滚动触发器
.infinite-scroll-trigger {
  display: flex;
  justify-content: center;
  padding: $spacing-xl 0;
  
  .el-button {
    min-width: 200px;
    height: 48px;
    font-size: $font-size-base;
    border-radius: 24px;
  }
}

// 响应式适配
@include max-width($breakpoint-md) {
  .category-header {
    padding: $spacing-md 0;
  }
  
  .category-nav {
    padding: $spacing-sm 0;
    
    .category-tab {
      padding: $spacing-xs $spacing-sm;
      font-size: $font-size-xs;
      
      .el-icon {
        font-size: 14px;
      }
    }
  }
  
  .category-content {
    padding: $spacing-lg 0;
  }
}

@include max-width($breakpoint-sm) {
  .category-header {
    .category-info {
      .category-title {
        font-size: $font-size-lg;
      }
      
      .category-description {
        font-size: $font-size-sm;
      }
    }
  }
  
  .infinite-scroll-trigger {
    padding: $spacing-lg 0;
    
    .el-button {
      width: 100%;
      max-width: 300px;
    }
  }
}

// 动画效果
.category-tab {
  @include fade-in();
  
  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.05}s;
    }
  }
}

.category-info {
  @include slide-up();
}

// 加载状态
.category-content {
  &.loading {
    opacity: 0.7;
    pointer-events: none;
  }
}

// 优化滚动性能
.category-nav {
  will-change: transform;
}

.infinite-scroll-trigger {
  will-change: transform;
}
</style>