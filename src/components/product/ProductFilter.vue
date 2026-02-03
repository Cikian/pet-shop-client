<template>
  <div class="product-filter">
    <!-- 筛选按钮（移动端） -->
    <el-button 
      class="filter-toggle-btn d-md-none"
      @click="showFilterDrawer = true"
      type="primary"
      plain
    >
      <el-icon><Filter /></el-icon>
      筛选
      <el-badge 
        v-if="activeFiltersCount > 0" 
        :value="activeFiltersCount" 
        class="filter-badge"
      />
    </el-button>
    
    <!-- 桌面端筛选面板 -->
    <div class="filter-panel d-none d-md-block">
      <div class="filter-section">
        <label class="filter-label">分类</label>
        <el-select
          v-model="localFilters.category"
          placeholder="选择分类"
          clearable
          @change="handleFilterChange"
          style="width: 150px;"
        >
          <el-option
            v-for="category in categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          >
            <span>{{ category.name }}</span>
            <span class="category-count">({{ category.productCount }})</span>
          </el-option>
        </el-select>
      </div>
      
      <div class="filter-section">
        <label class="filter-label">价格范围</label>
        <el-slider
          v-model="priceRangeValue"
          range
          :min="priceRange.min"
          :max="priceRange.max"
          :step="10"
          :format-tooltip="formatPrice"
          @change="handlePriceChange"
          style="width: 200px;"
        />
      </div>
      
      <div class="filter-section">
        <label class="filter-label">评分</label>
        <el-rate
          v-model="localFilters.minRating"
          @change="handleFilterChange"
          show-text
          :texts="ratingTexts"
          clearable
        />
      </div>
      
      <div class="filter-section" v-if="availableTags.length > 0">
        <label class="filter-label">标签</label>
        <el-select
          v-model="localFilters.tags"
          placeholder="选择标签"
          multiple
          collapse-tags
          collapse-tags-tooltip
          @change="handleFilterChange"
          style="width: 200px;"
        >
          <el-option
            v-for="tag in availableTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </div>
      
      <div class="filter-section">
        <el-checkbox
          v-model="localFilters.inStock"
          @change="handleFilterChange"
        >
          仅显示有库存
        </el-checkbox>
      </div>
      
      <div class="filter-actions" v-if="activeFiltersCount > 0">
        <el-button size="small" @click="clearFilters">
          清除筛选 ({{ activeFiltersCount }})
        </el-button>
      </div>
    </div>
    
    <!-- 移动端筛选抽屉 -->
    <el-drawer
      v-model="showFilterDrawer"
      title="商品筛选"
      direction="btt"
      size="70%"
      class="filter-drawer"
    >
      <div class="mobile-filter-content">
        <!-- 分类筛选 -->
        <div class="mobile-filter-section">
          <h4 class="mobile-filter-title">商品分类</h4>
          <div class="category-grid">
            <div
              v-for="category in categories"
              :key="category.id"
              class="category-item"
              :class="{ active: localFilters.category === category.id }"
              @click="selectCategory(category.id)"
            >
              <el-icon><component :is="category.icon" /></el-icon>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-count">({{ category.productCount }})</span>
            </div>
          </div>
        </div>
        
        <!-- 价格筛选 -->
        <div class="mobile-filter-section">
          <h4 class="mobile-filter-title">价格范围</h4>
          <div class="price-range-container">
            <div class="price-inputs">
              <el-input
                v-model.number="priceRangeValue[0]"
                placeholder="最低价"
                @change="handlePriceChange"
                type="number"
              >
                <template #prepend>¥</template>
              </el-input>
              <span class="price-separator">-</span>
              <el-input
                v-model.number="priceRangeValue[1]"
                placeholder="最高价"
                @change="handlePriceChange"
                type="number"
              >
                <template #prepend>¥</template>
              </el-input>
            </div>
            <el-slider
              v-model="priceRangeValue"
              range
              :min="priceRange.min"
              :max="priceRange.max"
              :step="10"
              @change="handlePriceChange"
            />
          </div>
        </div>
        
        <!-- 评分筛选 -->
        <div class="mobile-filter-section">
          <h4 class="mobile-filter-title">商品评分</h4>
          <div class="rating-options">
            <div
              v-for="rating in [5, 4, 3, 2, 1]"
              :key="rating"
              class="rating-option"
              :class="{ active: localFilters.minRating === rating }"
              @click="selectRating(rating)"
            >
              <el-rate :model-value="rating" disabled />
              <span>{{ rating }}星及以上</span>
            </div>
          </div>
        </div>
        
        <!-- 标签筛选 -->
        <div class="mobile-filter-section" v-if="availableTags.length > 0">
          <h4 class="mobile-filter-title">商品标签</h4>
          <div class="tags-container">
            <el-tag
              v-for="tag in availableTags"
              :key="tag"
              :type="localFilters.tags.includes(tag) ? 'primary' : 'info'"
              :effect="localFilters.tags.includes(tag) ? 'dark' : 'plain'"
              @click="toggleTag(tag)"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        
        <!-- 库存筛选 -->
        <div class="mobile-filter-section">
          <el-checkbox
            v-model="localFilters.inStock"
            @change="handleFilterChange"
            size="large"
          >
            仅显示有库存商品
          </el-checkbox>
        </div>
      </div>
      
      <!-- 抽屉底部操作 -->
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="clearFilters" plain>
            清除筛选
          </el-button>
          <el-button type="primary" @click="applyFilters">
            应用筛选 ({{ activeFiltersCount }})
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Filter } from '@element-plus/icons-vue'

/**
 * 商品筛选组件
 * 支持按分类、价格、评分、标签等条件筛选商品
 */

// Props 定义
const props = defineProps({
  /** 当前筛选条件 */
  filters: {
    type: Object,
    default: () => ({
      category: null,
      minPrice: null,
      maxPrice: null,
      minRating: null,
      tags: [],
      inStock: false
    })
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
  }
})

// Emits 定义
const emit = defineEmits(['filter-change'])

// 响应式数据
const showFilterDrawer = ref(false)
const localFilters = ref({ ...props.filters })
const priceRangeValue = ref([
  props.filters.minPrice || props.priceRange.min,
  props.filters.maxPrice || props.priceRange.max
])

// 评分文本
const ratingTexts = ['极差', '失望', '一般', '满意', '惊喜']

// 计算属性
const activeFiltersCount = computed(() => {
  let count = 0
  if (localFilters.value.category) count++
  if (localFilters.value.minPrice !== null || localFilters.value.maxPrice !== null) count++
  if (localFilters.value.minRating) count++
  if (localFilters.value.tags && localFilters.value.tags.length > 0) count++
  if (localFilters.value.inStock) count++
  return count
})

// 方法
const formatPrice = (value) => {
  return `¥${value}`
}

const handleFilterChange = () => {
  emit('filter-change', { ...localFilters.value })
}

const handlePriceChange = () => {
  localFilters.value.minPrice = priceRangeValue.value[0]
  localFilters.value.maxPrice = priceRangeValue.value[1]
  handleFilterChange()
}

const selectCategory = (categoryId) => {
  if (localFilters.value.category === categoryId) {
    localFilters.value.category = null
  } else {
    localFilters.value.category = categoryId
  }
  handleFilterChange()
}

const selectRating = (rating) => {
  if (localFilters.value.minRating === rating) {
    localFilters.value.minRating = null
  } else {
    localFilters.value.minRating = rating
  }
  handleFilterChange()
}

const toggleTag = (tag) => {
  const tags = [...(localFilters.value.tags || [])]
  const index = tags.indexOf(tag)
  
  if (index > -1) {
    tags.splice(index, 1)
  } else {
    tags.push(tag)
  }
  
  localFilters.value.tags = tags
  handleFilterChange()
}

const clearFilters = () => {
  localFilters.value = {
    category: null,
    minPrice: null,
    maxPrice: null,
    minRating: null,
    tags: [],
    inStock: false
  }
  priceRangeValue.value = [props.priceRange.min, props.priceRange.max]
  handleFilterChange()
}

const applyFilters = () => {
  showFilterDrawer.value = false
  handleFilterChange()
}

// 监听 props 变化
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
  priceRangeValue.value = [
    newFilters.minPrice || props.priceRange.min,
    newFilters.maxPrice || props.priceRange.max
  ]
}, { deep: true })

watch(() => props.priceRange, (newRange) => {
  if (!localFilters.value.minPrice && !localFilters.value.maxPrice) {
    priceRangeValue.value = [newRange.min, newRange.max]
  }
}, { deep: true })

// 生命周期
onMounted(() => {
  // 确保初始值正确
  if (!localFilters.value.tags) {
    localFilters.value.tags = []
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.product-filter {
  .filter-toggle-btn {
    width: 100%;
    position: relative;
    
    .filter-badge {
      position: absolute;
      top: -8px;
      right: -8px;
    }
  }
}

.filter-panel {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  flex-wrap: wrap;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  
  .filter-label {
    font-size: $font-size-sm;
    color: $text-secondary;
    white-space: nowrap;
    min-width: 60px;
  }
}

.filter-actions {
  margin-left: auto;
}

.category-count {
  color: $text-light;
  font-size: $font-size-xs;
  margin-left: $spacing-xs;
}

// 移动端抽屉样式
.filter-drawer {
  :deep(.el-drawer__body) {
    padding: 0;
  }
}

.mobile-filter-content {
  padding: $spacing-lg;
  height: 100%;
  overflow-y: auto;
}

.mobile-filter-section {
  margin-bottom: $spacing-xl;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.mobile-filter-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 $spacing-md 0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: $spacing-sm;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md;
  border: 1px solid $border-color;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: $primary-color;
    background: rgba($primary-color, 0.05);
  }
  
  &.active {
    border-color: $primary-color;
    background: rgba($primary-color, 0.1);
    color: $primary-color;
  }
  
  .el-icon {
    font-size: 24px;
    margin-bottom: $spacing-xs;
  }
  
  .category-name {
    font-size: $font-size-sm;
    font-weight: 500;
    text-align: center;
  }
  
  .category-count {
    font-size: $font-size-xs;
    color: $text-light;
    margin-top: $spacing-xs;
  }
}

.price-range-container {
  .price-inputs {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;
    
    .el-input {
      flex: 1;
    }
    
    .price-separator {
      color: $text-secondary;
      font-weight: 500;
    }
  }
}

.rating-options {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.rating-option {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm;
  border: 1px solid $border-color;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: $primary-color;
    background: rgba($primary-color, 0.05);
  }
  
  &.active {
    border-color: $primary-color;
    background: rgba($primary-color, 0.1);
    color: $primary-color;
  }
  
  span {
    font-size: $font-size-sm;
  }
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}

.drawer-footer {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-lg;
  border-top: 1px solid $border-color;
  
  .el-button {
    flex: 1;
  }
}

// 响应式适配
@include max-width($breakpoint-sm) {
  .mobile-filter-content {
    padding: $spacing-md;
  }
  
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .category-item {
    padding: $spacing-sm;
    
    .el-icon {
      font-size: 20px;
    }
    
    .category-name {
      font-size: $font-size-xs;
    }
  }
  
  .drawer-footer {
    padding: $spacing-md;
  }
}

// 动画效果
.category-item,
.rating-option,
.tag-item {
  @include fade-in();
}

.mobile-filter-section {
  @include slide-up();
  
  @for $i from 1 through 6 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.1}s;
    }
  }
}
</style>