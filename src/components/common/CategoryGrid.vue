<template>
  <div class="category-grid">
    <div class="category-header">
      <h2 class="category-title">商品分类</h2>
      <p class="category-subtitle">发现更多精彩商品</p>
    </div>
    
    <div class="category-container">
      <div 
        v-for="category in categories" 
        :key="category.id"
        class="category-item"
        @click="handleCategoryClick(category)"
      >
        <div class="category-image">
          <img :src="category.image" :alt="category.name" />
          <div class="category-overlay">
            <el-icon class="category-icon">
              <component :is="getIconComponent(category.icon)" />
            </el-icon>
          </div>
        </div>
        
        <div class="category-info">
          <h3 class="category-name">{{ category.name }}</h3>
          <p class="category-count">{{ category.productCount }} 件商品</p>
          <p v-if="category.description" class="category-desc">
            {{ category.description }}
          </p>
        </div>
        
        <div class="category-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowRight, 
  Iphone, 
  ShoppingBag, 
  House, 
  Trophy, 
  MagicStick, 
  Reading 
} from '@element-plus/icons-vue'

/**
 * 组件属性
 */
const props = defineProps({
  /** 分类数据 */
  categories: {
    type: Array,
    default: () => []
  },
  /** 每行显示的分类数量 */
  columns: {
    type: Number,
    default: 3
  }
})

/**
 * 组件事件
 */
const emit = defineEmits(['categoryClick'])

const router = useRouter()

/**
 * 图标组件映射
 */
const iconComponents = {
  Smartphone: Iphone,
  ShoppingBag,
  House,
  Trophy,
  MagicStick,
  Reading
}

/**
 * 获取图标组件
 */
const getIconComponent = (iconName) => {
  return iconComponents[iconName] || Iphone
}

/**
 * 处理分类点击
 */
const handleCategoryClick = (category) => {
  emit('categoryClick', category)
  
  // 跳转到分类页面
  router.push({
    name: 'Category',
    params: { id: category.id }
  })
}

/**
 * 计算网格样式
 */
const gridStyle = computed(() => ({
  '--columns': props.columns
}))
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.category-grid {
  width: 100%;
}

.category-header {
  text-align: center;
  margin-bottom: $spacing-2xl;
  
  @media (max-width: $breakpoint-md) {
    margin-bottom: $spacing-xl;
  }
}

.category-title {
  font-size: $font-size-2xl;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 $spacing-sm 0;
  
  @media (max-width: $breakpoint-md) {
    font-size: $font-size-xl;
  }
}

.category-subtitle {
  font-size: $font-size-base;
  color: $text-secondary;
  margin: 0;
  
  @media (max-width: $breakpoint-md) {
    font-size: $font-size-sm;
  }
}

.category-container {
  display: grid;
  grid-template-columns: repeat(var(--columns, 3), 1fr);
  gap: $spacing-lg;
  
  @media (max-width: $breakpoint-lg) {
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-md;
  }
  
  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
    gap: $spacing-sm;
  }
}

.category-item {
  background: $card-background;
  border-radius: 16px;
  padding: $spacing-lg;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    border-color: $primary-light;
    
    .category-image {
      transform: scale(1.05);
      
      .category-overlay {
        opacity: 1;
      }
    }
    
    .category-arrow {
      transform: translateX(4px);
      color: $primary-color;
    }
  }
  
  &:active {
    transform: translateY(-4px);
  }
  
  @media (max-width: $breakpoint-md) {
    padding: $spacing-md;
    border-radius: 12px;
    
    &:hover {
      transform: translateY(-4px);
    }
  }
}

.category-image {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: $spacing-md;
  transition: transform 0.3s ease;
  
  @media (max-width: $breakpoint-md) {
    height: 100px;
    border-radius: 8px;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-icon {
  font-size: 32px;
  color: white;
  
  @media (max-width: $breakpoint-md) {
    font-size: 24px;
  }
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 $spacing-xs 0;
  
  @media (max-width: $breakpoint-md) {
    font-size: $font-size-base;
  }
}

.category-count {
  font-size: $font-size-sm;
  color: $primary-color;
  font-weight: 500;
  margin: 0 0 $spacing-xs 0;
}

.category-desc {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-arrow {
  position: absolute;
  top: $spacing-lg;
  right: $spacing-lg;
  color: $text-light;
  transition: all 0.3s ease;
  font-size: 16px;
  
  @media (max-width: $breakpoint-md) {
    top: $spacing-md;
    right: $spacing-md;
    font-size: 14px;
  }
}

// 添加加载状态样式
.category-item.loading {
  .category-image {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    
    img {
      opacity: 0;
    }
  }
  
  .category-name,
  .category-count,
  .category-desc {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    color: transparent;
    border-radius: 4px;
  }
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// 响应式网格调整
@media (max-width: $breakpoint-xl) {
  .category-container {
    --columns: 2;
  }
}

@media (max-width: $breakpoint-md) {
  .category-container {
    --columns: 2;
  }
}

@media (max-width: $breakpoint-sm) {
  .category-container {
    --columns: 1;
  }
}
</style>