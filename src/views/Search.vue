<template>
  <div class="search-page">
    <!-- 搜索头部 -->
    <BreadcrumbNav
      :items="[{ label: '搜索结果' }]"
      :show-back-button="false"
    />
    
    <div class="search-header">
      <div class="container">
        
        <!-- 搜索框 -->
        <div class="search-input-container">
          <el-input
            v-model="searchQuery"
            placeholder="搜索商品..."
            size="large"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleClearSearch"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button 
                type="primary" 
                @click="handleSearch"
                :loading="searching"
              >
                搜索
              </el-button>
            </template>
          </el-input>
        </div>
        
        <!-- 搜索信息 -->
        <div class="search-info" v-if="currentKeyword">
          <div class="search-result-info">
            <span class="search-keyword">
              搜索 "<strong>{{ currentKeyword }}</strong>"
            </span>
            <span class="search-count">
              找到 <strong>{{ filteredProductsCount }}</strong> 件相关商品
            </span>
          </div>
          
          <!-- 搜索建议 -->
          <div class="search-suggestions" v-if="searchSuggestions.length > 0">
            <span class="suggestions-label">相关搜索：</span>
            <el-tag
              v-for="suggestion in searchSuggestions"
              :key="suggestion"
              @click="handleSuggestionClick(suggestion)"
              class="suggestion-tag"
              type="info"
              effect="plain"
            >
              {{ suggestion }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 搜索历史和热门搜索 -->
    <div class="search-extras" v-if="!currentKeyword || filteredProductsCount === 0">
      <div class="container">
        <div class="search-extras-grid">
          <!-- 搜索历史 -->
          <div class="search-history" v-if="searchHistory.length > 0">
            <div class="section-header">
              <h3 class="section-title">
                <el-icon><Clock /></el-icon>
                搜索历史
              </h3>
              <el-button 
                text 
                type="danger" 
                size="small"
                @click="clearSearchHistory"
              >
                清空历史
              </el-button>
            </div>
            <div class="history-tags">
              <el-tag
                v-for="(item, index) in searchHistory"
                :key="index"
                @click="handleHistoryClick(item)"
                @close="removeFromHistory(index)"
                closable
                class="history-tag"
                type="info"
                effect="plain"
              >
                {{ item }}
              </el-tag>
            </div>
          </div>
          
          <!-- 热门搜索 -->
          <div class="hot-searches">
            <div class="section-header">
              <h3 class="section-title">
                <el-icon><TrendCharts /></el-icon>
                热门搜索
              </h3>
            </div>
            <div class="hot-tags">
              <el-tag
                v-for="(item, index) in hotSearches"
                :key="item"
                @click="handleHotSearchClick(item)"
                class="hot-tag"
                :type="getHotTagType(index)"
                effect="plain"
              >
                <span class="hot-rank">{{ index + 1 }}</span>
                {{ item }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 搜索结果 -->
    <div class="search-results" v-if="currentKeyword">
      <div class="container">
        <!-- 无结果状态 -->
        <div v-if="filteredProductsCount === 0 && !loading" class="no-results">
          <el-empty 
            :image-size="120"
            description="没有找到相关商品"
          >
            <template #image>
              <el-icon size="120" color="#c0c4cc">
                <Search />
              </el-icon>
            </template>
            <div class="no-results-suggestions">
              <p>建议您：</p>
              <ul>
                <li>检查输入的关键词是否正确</li>
                <li>尝试更换关键词或使用更通用的词语</li>
                <li>浏览热门商品分类</li>
              </ul>
              <div class="quick-actions">
                <el-button @click="handleClearSearch">重新搜索</el-button>
                <el-button type="primary" @click="$router.push('/')">
                  返回首页
                </el-button>
              </div>
            </div>
          </el-empty>
        </div>
        
        <!-- 商品网格 -->
        <ProductGrid
          v-else
          :products="highlightedProducts"
          :categories="categories"
          :available-tags="availableTags"
          :price-range="priceRange"
          :filters="filters"
          :sort-by="sortBy"
          :search-keyword="currentKeyword"
          :total-count="filteredProductsCount"
          :current-page="currentPage"
          :page-size="pageSize"
          :has-more="hasMorePages"
          :loading="loading"
          :loading-more="loadingMore"
          :show-load-more="false"
          :show-pagination="true"
          :show-filter="true"
          :show-sort="true"
          @filter-change="handleFilterChange"
          @sort-change="handleSortChange"
          @page-change="handlePageChange"
          @size-change="handlePageSizeChange"
          @product-click="handleProductClick"
          @favorite-toggle="handleFavoriteToggle"
          @add-to-cart="handleAddToCart"
          @clear-filters="handleClearFilters"
        />
      </div>
    </div>
    
    <!-- 返回顶部按钮 -->
    <el-backtop :right="30" :bottom="80" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product.js'
import { useCartStore } from '@/stores/cart.js'
import ProductGrid from '@/components/product/ProductGrid.vue'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import { ElMessage } from 'element-plus'
import { 
  Search, 
  Clock, 
  TrendCharts 
} from '@element-plus/icons-vue'

/**
 * 搜索结果页面
 * 支持关键词搜索、搜索历史、热门搜索、关键词高亮等功能
 * 需求: 2.5
 */

// 路由和状态管理
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()

// 响应式数据
const searchQuery = ref('')
const currentKeyword = ref('')
const searching = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const searchHistory = ref([])
const hotSearches = ref([
  'iPhone', '笔记本', '运动鞋', '耳机', '背包',
  '手表', 'T恤', '键盘', '咖啡杯', '瑜伽垫'
])

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
  filters,
  sortBy
} = productStore

// 计算属性
const searchSuggestions = computed(() => {
  if (!currentKeyword.value) return []
  
  // 基于当前搜索关键词生成相关建议
  const keyword = currentKeyword.value.toLowerCase()
  const suggestions = new Set()
  
  // 从商品标签中提取相关建议
  products.forEach(product => {
    product.tags.forEach(tag => {
      if (tag.toLowerCase().includes(keyword) && tag !== currentKeyword.value) {
        suggestions.add(tag)
      }
    })
  })
  
  // 从商品名称中提取相关建议
  products.forEach(product => {
    const words = product.name.split(/\s+/)
    words.forEach(word => {
      if (word.toLowerCase().includes(keyword) && 
          word.toLowerCase() !== keyword && 
          word.length > 1) {
        suggestions.add(word)
      }
    })
  })
  
  return Array.from(suggestions).slice(0, 5)
})

const highlightedProducts = computed(() => {
  if (!currentKeyword.value) return paginatedProducts
  
  // 为搜索结果中的商品添加关键词高亮
  return paginatedProducts.map(product => ({
    ...product,
    highlightedName: highlightKeyword(product.name, currentKeyword.value),
    highlightedDescription: highlightKeyword(product.description, currentKeyword.value)
  }))
})

// 方法
const highlightKeyword = (text, keyword) => {
  if (!keyword || !text) return text
  
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
}

const getHotTagType = (index) => {
  if (index < 3) return 'danger'
  if (index < 6) return 'warning'
  return 'info'
}

const handleSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  searching.value = true
  try {
    // 更新当前搜索关键词
    currentKeyword.value = query
    
    // 添加到搜索历史
    addToSearchHistory(query)
    
    // 执行搜索
    productStore.searchProducts(query)
    
    // 更新URL
    await router.push({ 
      name: 'Search', 
      query: { q: query } 
    })
    
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请重试')
  } finally {
    searching.value = false
  }
}

const handleClearSearch = () => {
  searchQuery.value = ''
  currentKeyword.value = ''
  productStore.searchProducts('')
  router.push({ name: 'Search' })
}

const handleSuggestionClick = (suggestion) => {
  searchQuery.value = suggestion
  handleSearch()
}

const handleHistoryClick = (historyItem) => {
  searchQuery.value = historyItem
  handleSearch()
}

const handleHotSearchClick = (hotSearch) => {
  searchQuery.value = hotSearch
  handleSearch()
}

const addToSearchHistory = (query) => {
  // 移除重复项
  const index = searchHistory.value.indexOf(query)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  
  // 添加到开头
  searchHistory.value.unshift(query)
  
  // 限制历史记录数量
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }
  
  // 保存到本地存储
  saveSearchHistory()
}

const removeFromHistory = (index) => {
  searchHistory.value.splice(index, 1)
  saveSearchHistory()
}

const clearSearchHistory = () => {
  searchHistory.value = []
  saveSearchHistory()
  ElMessage.success('搜索历史已清空')
}

const saveSearchHistory = () => {
  try {
    localStorage.setItem('mall-search-history', JSON.stringify(searchHistory.value))
  } catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

const loadSearchHistory = () => {
  try {
    const saved = localStorage.getItem('mall-search-history')
    if (saved) {
      searchHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
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

const initializeSearch = async () => {
  loading.value = true
  try {
    // 确保数据已加载
    if (products.length === 0) {
      await productStore.initialize()
    }
    
    // 从URL参数获取搜索关键词
    const query = route.query.q
    if (query) {
      searchQuery.value = query
      currentKeyword.value = query
      productStore.searchProducts(query)
      addToSearchHistory(query)
    }
    
  } catch (error) {
    console.error('初始化搜索页面失败:', error)
    ElMessage.error('页面加载失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

// 监听路由查询参数变化
watch(() => route.query.q, (newQuery) => {
  if (route.name === 'Search') {
    if (newQuery) {
      searchQuery.value = newQuery
      currentKeyword.value = newQuery
      productStore.searchProducts(newQuery)
    } else {
      searchQuery.value = ''
      currentKeyword.value = ''
      productStore.searchProducts('')
    }
  }
})

// 生命周期
onMounted(async () => {
  // 加载搜索历史
  loadSearchHistory()
  
  // 初始化搜索
  await initializeSearch()
  
  // 聚焦搜索框
  await nextTick()
  const searchInput = document.querySelector('.search-input input')
  if (searchInput && !currentKeyword.value) {
    searchInput.focus()
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.search-page {
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

// 搜索头部
.search-header {
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
  
  .search-input-container {
    margin-bottom: $spacing-lg;
    
    .search-input {
      max-width: 600px;
      
      :deep(.el-input__wrapper) {
        border-radius: 25px;
        box-shadow: 0 2px 12px rgba($primary-color, 0.1);
        
        &:hover {
          box-shadow: 0 4px 20px rgba($primary-color, 0.15);
        }
        
        &.is-focus {
          box-shadow: 0 4px 20px rgba($primary-color, 0.2);
        }
      }
      
      :deep(.el-input-group__append) {
        .el-button {
          border-radius: 0 25px 25px 0;
          padding: 0 $spacing-lg;
        }
      }
    }
  }
  
  .search-info {
    .search-result-info {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      margin-bottom: $spacing-md;
      
      .search-keyword {
        font-size: $font-size-base;
        color: $text-primary;
        
        strong {
          color: $primary-color;
        }
      }
      
      .search-count {
        font-size: $font-size-sm;
        color: $text-secondary;
        
        strong {
          color: $primary-color;
          font-weight: 600;
        }
      }
      
      @include max-width($breakpoint-sm) {
        flex-direction: column;
        align-items: flex-start;
        gap: $spacing-xs;
      }
    }
    
    .search-suggestions {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      flex-wrap: wrap;
      
      .suggestions-label {
        font-size: $font-size-sm;
        color: $text-secondary;
        white-space: nowrap;
      }
      
      .suggestion-tag {
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.05);
          color: $primary-color;
          border-color: $primary-color;
        }
      }
    }
  }
}

// 搜索扩展功能
.search-extras {
  padding: $spacing-xl 0;
  
  .search-extras-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-xl;
    
    @include max-width($breakpoint-md) {
      grid-template-columns: 1fr;
      gap: $spacing-lg;
    }
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;
    
    .section-title {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      font-size: $font-size-lg;
      font-weight: 600;
      color: $text-primary;
      margin: 0;
      
      .el-icon {
        color: $primary-color;
      }
    }
  }
  
  .history-tags,
  .hot-tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }
  
  .history-tag,
  .hot-tag {
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba($primary-color, 0.2);
    }
  }
  
  .hot-tag {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    
    .hot-rank {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      background: currentColor;
      color: white;
      border-radius: 50%;
      font-size: $font-size-xs;
      font-weight: bold;
    }
  }
}

// 搜索结果
.search-results {
  padding: $spacing-xl 0;
  min-height: 60vh;
}

.no-results {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  
  .el-empty {
    padding: $spacing-xl;
  }
  
  .no-results-suggestions {
    text-align: left;
    margin-top: $spacing-lg;
    
    p {
      font-weight: 600;
      color: $text-primary;
      margin-bottom: $spacing-sm;
    }
    
    ul {
      list-style: none;
      padding: 0;
      margin: 0 0 $spacing-lg 0;
      
      li {
        position: relative;
        padding-left: $spacing-md;
        margin-bottom: $spacing-xs;
        color: $text-secondary;
        font-size: $font-size-sm;
        
        &::before {
          content: '•';
          position: absolute;
          left: 0;
          color: $primary-color;
          font-weight: bold;
        }
      }
    }
    
    .quick-actions {
      display: flex;
      gap: $spacing-sm;
      justify-content: center;
    }
  }
}

// 关键词高亮样式
:deep(.search-highlight) {
  background: linear-gradient(120deg, rgba($primary-color, 0.2) 0%, rgba($accent-color, 0.2) 100%);
  color: $primary-color;
  font-weight: 600;
  padding: 1px 2px;
  border-radius: 2px;
}

// 响应式适配
@include max-width($breakpoint-md) {
  .search-header {
    padding: $spacing-md 0;
    
    .search-input-container {
      margin-bottom: $spacing-md;
    }
  }
  
  .search-extras {
    padding: $spacing-lg 0;
  }
  
  .search-results {
    padding: $spacing-lg 0;
  }
}

@include max-width($breakpoint-sm) {
  .search-header {
    .search-input-container {
      .search-input {
        :deep(.el-input-group__append) {
          .el-button {
            padding: 0 $spacing-md;
            font-size: $font-size-sm;
          }
        }
      }
    }
    
    .search-info {
      .search-suggestions {
        .suggestions-label {
          width: 100%;
          margin-bottom: $spacing-xs;
        }
      }
    }
  }
  
  .search-extras {
    .section-header {
      .section-title {
        font-size: $font-size-base;
      }
    }
  }
}

// 动画效果
.search-info {
  @include slide-up();
}

.search-extras {
  .search-history,
  .hot-searches {
    @include fade-in();
    
    &:nth-child(1) { animation-delay: 0.1s; }
    &:nth-child(2) { animation-delay: 0.2s; }
  }
}

.history-tag,
.hot-tag,
.suggestion-tag {
  @include fade-in();
  
  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.05}s;
    }
  }
}

// 加载状态
.search-results {
  &.loading {
    opacity: 0.7;
    pointer-events: none;
  }
}
</style>