<template>
  <div class="product-sort">
    <el-select
      v-model="currentSort"
      @change="handleSortChange"
      placeholder="排序方式"
      style="width: 150px;"
    >
      <el-option
        v-for="option in sortOptions"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      >
        <div class="sort-option">
          <el-icon v-if="option.icon">
            <component :is="option.icon" />
          </el-icon>
          <span>{{ option.label }}</span>
        </div>
      </el-option>
    </el-select>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  Sort, 
  SortUp, 
  SortDown, 
  Star, 
  Timer,
  TrendCharts
} from '@element-plus/icons-vue'

/**
 * 商品排序组件
 * 提供多种排序选项：默认、价格升序/降序、评分、销量等
 */

// Props 定义
const props = defineProps({
  /** 当前排序方式 */
  sortBy: {
    type: String,
    default: 'default'
  },
  /** 自定义排序选项 */
  customOptions: {
    type: Array,
    default: () => []
  },
  /** 是否显示图标 */
  showIcons: {
    type: Boolean,
    default: true
  }
})

// Emits 定义
const emit = defineEmits(['sort-change'])

// 响应式数据
const currentSort = ref(props.sortBy)

// 默认排序选项
const defaultSortOptions = [
  {
    value: 'default',
    label: '默认排序',
    icon: 'Sort',
    description: '按推荐程度排序'
  },
  {
    value: 'price-asc',
    label: '价格从低到高',
    icon: 'SortUp',
    description: '价格升序排列'
  },
  {
    value: 'price-desc',
    label: '价格从高到低',
    icon: 'SortDown',
    description: '价格降序排列'
  },
  {
    value: 'rating',
    label: '评分最高',
    icon: 'Star',
    description: '按评分从高到低排序'
  },
  {
    value: 'sales',
    label: '销量最高',
    icon: 'TrendCharts',
    description: '按销量从高到低排序'
  },
  {
    value: 'name',
    label: '按名称排序',
    icon: 'Sort',
    description: '按商品名称字母顺序排序'
  },
  {
    value: 'newest',
    label: '最新上架',
    icon: 'Timer',
    description: '按上架时间从新到旧排序'
  }
]

// 计算属性
const sortOptions = computed(() => {
  const options = props.customOptions.length > 0 
    ? props.customOptions 
    : defaultSortOptions
    
  return options.map(option => ({
    ...option,
    icon: props.showIcons ? getIconComponent(option.icon) : null
  }))
})

// 方法
const getIconComponent = (iconName) => {
  const iconMap = {
    Sort,
    SortUp,
    SortDown,
    Star,
    Timer,
    TrendCharts
  }
  return iconMap[iconName] || Sort
}

const handleSortChange = (value) => {
  currentSort.value = value
  emit('sort-change', value)
}

const getSortOptionLabel = (value) => {
  const option = sortOptions.value.find(opt => opt.value === value)
  return option ? option.label : '默认排序'
}

const getSortOptionDescription = (value) => {
  const option = sortOptions.value.find(opt => opt.value === value)
  return option ? option.description : ''
}

// 监听 props 变化
watch(() => props.sortBy, (newSort) => {
  currentSort.value = newSort
})

// 暴露方法给父组件
defineExpose({
  getSortOptionLabel,
  getSortOptionDescription,
  sortOptions
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.product-sort {
  .el-select {
    :deep(.el-input__wrapper) {
      border-radius: 8px;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: $primary-color;
      }
    }
    
    :deep(.el-input__inner) {
      font-size: $font-size-sm;
      color: $text-primary;
    }
  }
}

.sort-option {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  
  .el-icon {
    font-size: 16px;
    color: $text-secondary;
  }
  
  span {
    font-size: $font-size-sm;
    color: $text-primary;
  }
}

// 下拉选项样式
:deep(.el-select-dropdown) {
  .el-select-dropdown__item {
    padding: $spacing-sm $spacing-md;
    
    &:hover {
      background: rgba($primary-color, 0.05);
      color: $primary-color;
      
      .sort-option .el-icon {
        color: $primary-color;
      }
    }
    
    &.selected {
      background: rgba($primary-color, 0.1);
      color: $primary-color;
      font-weight: 600;
      
      .sort-option .el-icon {
        color: $primary-color;
      }
    }
  }
}

// 响应式适配
@include max-width($breakpoint-sm) {
  .product-sort {
    .el-select {
      width: 100% !important;
    }
  }
}

// 动画效果
.sort-option {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(2px);
  }
}
</style>