<template>
  <div class="product-grid-container">
    <!-- 筛选和排序工具栏 -->
    <div class="toolbar" v-if="showToolbar">
      <div class="toolbar-left">
        <ProductFilter 
          v-if="showFilter"
          :filters="filters"
          :categories="categories"
          :available-tags="availableTags"
          :price-range="priceRange"
          @filter-change="handleFilterChange"
        />
      </div>
      
      <div class="toolbar-right">
        <ProductSort 
          v-if="showSort"
          :sort-by="sortBy"
          @sort-change="handleSortChange"
        />
        
        <!-- 视图切换 -->
        <div class="view-toggle" v-if="showViewToggle">
          <el-button-group>
            <el-button 
              :type="viewMode === 'grid' ? 'primary' : 'default'"
              @click="setViewMode('grid')"
              size="small"
            >
              <el-icon><Grid /></el-icon>
            </el-button>
            <el-button 
              :type="viewMode === 'list' ? 'primary' : 'default'"
              @click="setViewMode('list')"
              size="small"
            >
              <el-icon><List /></el-icon>
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    
    <!-- 结果统计 -->
    <div class="results-info" v-if="showResultsInfo">
      <span class="results-count">
        共找到 <strong>{{ totalCount }}</strong> 件商品
      </span>
      <span v-if="currentCategory" class="current-filter">
        分类：{{ getCategoryName(currentCategory) }}
      </span>
      <span v-if="searchKeyword" class="current-filter">
        搜索：{{ searchKeyword }}
      </span>
    </div>
    
    <!-- 商品网格 -->
    <div 
      class="product-grid"
      :class="[
        `view-${viewMode}`,
        `columns-${columns}`,
        { 'loading': loading }
      ]"
    >
      <!-- 加载状态 -->
      <template v-if="loading">
        <div 
          v-for="n in skeletonCount" 
          :key="`skeleton-${n}`"
          class="product-skeleton"
        >
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="image" style="width: 100%; height: 200px;" />
              <div style="padding: 16px;">
                <el-skeleton-item variant="h3" style="width: 80%;" />
                <el-skeleton-item variant="text" style="width: 60%; margin-top: 8px;" />
                <el-skeleton-item variant="text" style="width: 40%; margin-top: 8px;" />
              </div>
            </template>
          </el-skeleton>
        </div>
      </template>
      
      <!-- 商品列表 -->
      <template v-else-if="products.length > 0">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          :show-all-tags="viewMode === 'list'"
          @click="handleProductClick"
          @favorite-toggle="handleFavoriteToggle"
          @add-to-cart="handleAddToCart"
        />
      </template>
      
      <!-- 空状态 -->
      <div v-else class="empty-state">
        <el-empty 
          :image-size="120"
          description="暂无商品"
        >
          <template #image>
            <el-icon size="120" color="#c0c4cc">
              <Box />
            </el-icon>
          </template>
          <el-button type="primary" @click="clearFilters">
            清除筛选条件
          </el-button>
        </el-empty>
      </div>
    </div>
    
    <!-- 分页 -->
    <div class="pagination-container" v-if="showPagination && totalCount > 0">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="pageSizes"
        :total="totalCount"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 加载更多按钮（无限滚动模式） -->
    <div class="load-more-container" v-if="showLoadMore && hasMore">
      <el-button 
        type="primary" 
        :loading="loadingMore"
        @click="loadMore"
        size="large"
      >
        {{ loadingMore ? '加载中...' : '加载更多' }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import ProductCard from './ProductCard.vue'
import ProductFilter from './ProductFilter.vue'
import ProductSort from './ProductSort.vue'
import { 
  Grid, 
  List, 
  Box 
} from '@element-plus/icons-vue'

/**
 * 商品网格组件
 * 支持网格/列表视图切换、筛选、排序、分页等功能
 */

// Props 定义
const props = defineProps({
  /** 商品列表 */
  products: {
    type: Array,
    default: () => []
  },
  /** 分类列表 */
  categories: {
    type: Array,
    default: () => []
  },
  /** 可用标签 */
  availableTags: {
    type: Array,
    default: () => []
  },
  /** 价格范围 */
  priceRange: {
    type: Object,
    default: () => ({ min: 0, max: 10000 })
  },
  /** 当前筛选条件 */
  filters: {
    type: Object,
    default: () => ({})
  },
  /** 当前排序方式 */
  sortBy: {
    type: String,
    default: 'default'
  },
  /** 当前分类 */
  currentCategory: {
    type: String,
    default: null
  },
  /** 搜索关键词 */
  searchKeyword: {
    type: String,
    default: ''
  },
  /** 总数量 */
  totalCount: {
    type: Number,
    default: 0
  },
  /** 当前页码 */
  currentPage: {
    type: Number,
    default: 1
  },
  /** 每页数量 */
  pageSize: {
    type: Number,
    default: 12
  },
  /** 可选每页数量 */
  pageSizes: {
    type: Array,
    default: () => [12, 24, 36, 48]
  },
  /** 是否有更多数据 */
  hasMore: {
    type: Boolean,
    default: false
  },
  /** 加载状态 */
  loading: {
    type: Boolean,
    default: false
  },
  /** 加载更多状态 */
  loadingMore: {
    type: Boolean,
    default: false
  },
  /** 网格列数 */
  columns: {
    type: Number,
    default: 4
  },
  /** 是否显示工具栏 */
  showToolbar: {
    type: Boolean,
    default: true
  },
  /** 是否显示筛选器 */
  showFilter: {
    type: Boolean,
    default: true
  },
  /** 是否显示排序器 */
  showSort: {
    type: Boolean,
    default: true
  },
  /** 是否显示视图切换 */
  showViewToggle: {
    type: Boolean,
    default: true
  },
  /** 是否显示结果信息 */
  showResultsInfo: {
    type: Boolean,
    default: true
  },
  /** 是否显示分页 */
  showPagination: {
    type: Boolean,
    default: true
  },
  /** 是否显示加载更多 */
  showLoadMore: {
    type: Boolean,
    default: false
  },
  /** 骨架屏数量 */
  skeletonCount: {
    type: Number,
    default: 12
  }
})

// Emits 定义
const emit = defineEmits([
  'filter-change',
  'sort-change',
  'page-change',
  'size-change',
  'load-more',
  'product-click',
  'favorite-toggle',
  'add-to-cart',
  'clear-filters'
])

// 响应式数据
const viewMode = ref('grid') // 'grid' | 'list'

// 计算属性
const responsiveColumns = computed(() => {
  // 根据屏幕尺寸自动调整列数
  if (viewMode.value === 'list') return 1
  return Math.min(props.columns, 4)
})

// 方法
const setViewMode = (mode) => {
  viewMode.value = mode
}

const handleFilterChange = (filters) => {
  emit('filter-change', filters)
}

const handleSortChange = (sortBy) => {
  emit('sort-change', sortBy)
}

const handleSizeChange = (size) => {
  emit('size-change', size)
}

const handleCurrentChange = (page) => {
  emit('page-change', page)
}

const loadMore = () => {
  emit('load-more')
}

const handleProductClick = (product) => {
  emit('product-click', product)
}

const handleFavoriteToggle = (product) => {
  emit('favorite-toggle', product)
}

const handleAddToCart = (product) => {
  emit('add-to-cart', product)
}

const clearFilters = () => {
  emit('clear-filters')
}

const getCategoryName = (categoryId) => {
  const category = props.categories.find(cat => cat.id === categoryId)
  return category ? category.name : categoryId
}

// 监听响应式变化
watch(() => props.currentPage, () => {
  // 页面变化时滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

// 生命周期
onMounted(() => {
  // 根据屏幕尺寸设置默认视图模式
  const updateViewMode = () => {
    if (window.innerWidth < 768) {
      viewMode.value = 'list'
    }
  }
  
  updateViewMode()
  window.addEventListener('resize', updateViewMode)
  
  return () => {
    window.removeEventListener('resize', updateViewMode)
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.product-grid-container {
  width: 100%;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
  padding: $spacing-md;
  background: $card-background;
  border-radius: 8px;
  @include card-shadow(1);
  
  @include max-width($breakpoint-md) {
    flex-direction: column;
    gap: $spacing-md;
    align-items: stretch;
  }
}

.toolbar-left {
  flex: 1;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  
  @include max-width($breakpoint-md) {
    justify-content: space-between;
  }
}

.view-toggle {
  .el-button-group {
    .el-button {
      padding: $spacing-xs $spacing-sm;
    }
  }
}

.results-info {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
  font-size: $font-size-sm;
  color: $text-secondary;
  
  .results-count {
    strong {
      color: $primary-color;
      font-weight: 600;
    }
  }
  
  .current-filter {
    padding: $spacing-xs $spacing-sm;
    background: $primary-light;
    color: white;
    border-radius: 4px;
    font-size: $font-size-xs;
  }
  
  @include max-width($breakpoint-sm) {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-xs;
  }
}

.product-grid {
  display: grid;
  gap: $spacing-lg;
  margin-bottom: $spacing-xl;
  
  // 网格视图
  &.view-grid {
    &.columns-1 {
      grid-template-columns: 1fr;
    }
    
    &.columns-2 {
      grid-template-columns: repeat(2, 1fr);
      
      @include max-width($breakpoint-sm) {
        grid-template-columns: 1fr;
      }
    }
    
    &.columns-3 {
      grid-template-columns: repeat(3, 1fr);
      
      @include max-width($breakpoint-md) {
        grid-template-columns: repeat(2, 1fr);
      }
      
      @include max-width($breakpoint-sm) {
        grid-template-columns: 1fr;
      }
    }
    
    &.columns-4 {
      grid-template-columns: repeat(4, 1fr);
      
      @include max-width($breakpoint-lg) {
        grid-template-columns: repeat(3, 1fr);
      }
      
      @include max-width($breakpoint-md) {
        grid-template-columns: repeat(2, 1fr);
      }
      
      @include max-width($breakpoint-sm) {
        grid-template-columns: 1fr;
      }
    }
  }
  
  // 列表视图
  &.view-list {
    grid-template-columns: 1fr;
    gap: $spacing-md;
    
    :deep(.product-card) {
      display: flex;
      flex-direction: row;
      height: 200px;
      
      .product-image-container {
        width: 200px;
        height: 100%;
        flex-shrink: 0;
      }
      
      .product-info {
        flex: 1;
        padding: $spacing-md;
      }
      
      .product-actions {
        padding: $spacing-md;
        display: flex;
        align-items: flex-end;
        
        .add-to-cart-btn {
          width: auto;
          min-width: 120px;
        }
      }
      
      @include max-width($breakpoint-sm) {
        flex-direction: column;
        height: auto;
        
        .product-image-container {
          width: 100%;
          height: 200px;
        }
      }
    }
  }
  
  &.loading {
    .product-skeleton {
      background: $card-background;
      border-radius: 12px;
      overflow: hidden;
      @include card-shadow(1);
    }
  }
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  
  .el-empty {
    padding: $spacing-xl;
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: $spacing-xl;
  
  .el-pagination {
    @include max-width($breakpoint-sm) {
      .el-pagination__sizes,
      .el-pagination__jump {
        display: none;
      }
    }
  }
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: $spacing-xl;
}

// 动画效果
.product-grid {
  :deep(.product-card) {
    @include fade-in();
    
    @for $i from 1 through 12 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 0.1}s;
      }
    }
  }
}

// 响应式优化
@include max-width($breakpoint-sm) {
  .toolbar {
    padding: $spacing-sm;
    margin-bottom: $spacing-md;
  }
  
  .product-grid {
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }
  
  .results-info {
    padding: 0 $spacing-sm;
    margin-bottom: $spacing-sm;
  }
}
</style>