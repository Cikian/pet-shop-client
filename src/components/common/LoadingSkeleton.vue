<template>
  <div class="loading-skeleton" :class="skeletonClass">
    <!-- 商品卡片骨架屏 -->
    <div v-if="type === 'product-card'" class="skeleton-product-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-price"></div>
        <div class="skeleton-rating"></div>
        <div class="skeleton-button"></div>
      </div>
    </div>

    <!-- 商品列表骨架屏 -->
    <div v-else-if="type === 'product-list'" class="skeleton-product-list">
      <div 
        v-for="i in count" 
        :key="i" 
        class="skeleton-product-card"
      >
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-price"></div>
          <div class="skeleton-rating"></div>
          <div class="skeleton-button"></div>
        </div>
      </div>
    </div>

    <!-- 分类网格骨架屏 -->
    <div v-else-if="type === 'category-grid'" class="skeleton-category-grid">
      <div 
        v-for="i in count" 
        :key="i" 
        class="skeleton-category-item"
      >
        <div class="skeleton-category-icon"></div>
        <div class="skeleton-category-name"></div>
      </div>
    </div>

    <!-- 轮播图骨架屏 -->
    <div v-else-if="type === 'banner'" class="skeleton-banner">
      <div class="skeleton-banner-image"></div>
      <div class="skeleton-banner-indicators">
        <div v-for="i in 3" :key="i" class="skeleton-indicator"></div>
      </div>
    </div>

    <!-- 购物车项骨架屏 -->
    <div v-else-if="type === 'cart-item'" class="skeleton-cart-item">
      <div class="skeleton-cart-image"></div>
      <div class="skeleton-cart-content">
        <div class="skeleton-cart-title"></div>
        <div class="skeleton-cart-price"></div>
        <div class="skeleton-cart-controls"></div>
      </div>
    </div>

    <!-- 通用文本骨架屏 -->
    <div v-else-if="type === 'text'" class="skeleton-text">
      <div 
        v-for="i in count" 
        :key="i" 
        class="skeleton-line"
        :style="{ width: getLineWidth(i) }"
      ></div>
    </div>

    <!-- 默认矩形骨架屏 -->
    <div v-else class="skeleton-rect" :style="rectStyle"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * 组件属性
 */
const props = defineProps({
  /** 骨架屏类型 */
  type: {
    type: String,
    default: 'rect',
    validator: (value) => [
      'product-card', 
      'product-list', 
      'category-grid', 
      'banner', 
      'cart-item', 
      'text', 
      'rect'
    ].includes(value)
  },
  /** 数量（用于列表类型） */
  count: {
    type: Number,
    default: 3
  },
  /** 宽度（用于矩形类型） */
  width: {
    type: [String, Number],
    default: '100%'
  },
  /** 高度（用于矩形类型） */
  height: {
    type: [String, Number],
    default: '20px'
  },
  /** 是否启用动画 */
  animated: {
    type: Boolean,
    default: true
  },
  /** 自定义类名 */
  customClass: {
    type: String,
    default: ''
  }
})

/**
 * 骨架屏样式类
 */
const skeletonClass = computed(() => {
  return [
    {
      'skeleton-animated': props.animated
    },
    props.customClass
  ]
})

/**
 * 矩形骨架屏样式
 */
const rectStyle = computed(() => {
  return {
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height
  }
})

/**
 * 获取文本行宽度
 */
const getLineWidth = (index) => {
  const widths = ['100%', '80%', '60%', '90%', '70%']
  return widths[index % widths.length]
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.loading-skeleton {
  .skeleton-base {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    border-radius: 4px;
  }
}

.skeleton-animated {
  .skeleton-base,
  .skeleton-image,
  .skeleton-title,
  .skeleton-price,
  .skeleton-rating,
  .skeleton-button,
  .skeleton-category-icon,
  .skeleton-category-name,
  .skeleton-banner-image,
  .skeleton-indicator,
  .skeleton-cart-image,
  .skeleton-cart-title,
  .skeleton-cart-price,
  .skeleton-cart-controls,
  .skeleton-line,
  .skeleton-rect {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// 商品卡片骨架屏
.skeleton-product-card {
  background: white;
  border-radius: 12px;
  padding: $spacing-md;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .skeleton-image {
    width: 100%;
    height: 200px;
    border-radius: 8px;
    background: #f0f0f0;
    margin-bottom: $spacing-md;
  }
  
  .skeleton-content {
    .skeleton-title {
      height: 20px;
      background: #f0f0f0;
      border-radius: 4px;
      margin-bottom: $spacing-sm;
    }
    
    .skeleton-price {
      height: 18px;
      width: 60%;
      background: #f0f0f0;
      border-radius: 4px;
      margin-bottom: $spacing-sm;
    }
    
    .skeleton-rating {
      height: 16px;
      width: 80%;
      background: #f0f0f0;
      border-radius: 4px;
      margin-bottom: $spacing-md;
    }
    
    .skeleton-button {
      height: 36px;
      background: #f0f0f0;
      border-radius: 6px;
    }
  }
}

// 商品列表骨架屏
.skeleton-product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-lg;
  
  @media (max-width: $breakpoint-md) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: $spacing-md;
  }
  
  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
  }
}

// 分类网格骨架屏
.skeleton-category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: $spacing-lg;
  
  @media (max-width: $breakpoint-md) {
    gap: $spacing-md;
  }
}

.skeleton-category-item {
  text-align: center;
  padding: $spacing-lg;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .skeleton-category-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #f0f0f0;
    margin: 0 auto $spacing-md auto;
  }
  
  .skeleton-category-name {
    height: 16px;
    background: #f0f0f0;
    border-radius: 4px;
  }
}

// 轮播图骨架屏
.skeleton-banner {
  position: relative;
  
  .skeleton-banner-image {
    width: 100%;
    height: 400px;
    background: #f0f0f0;
    border-radius: 12px;
    
    @media (max-width: $breakpoint-md) {
      height: 250px;
    }
    
    @media (max-width: $breakpoint-sm) {
      height: 200px;
    }
  }
  
  .skeleton-banner-indicators {
    display: flex;
    justify-content: center;
    gap: $spacing-sm;
    margin-top: $spacing-md;
    
    .skeleton-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #f0f0f0;
    }
  }
}

// 购物车项骨架屏
.skeleton-cart-item {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-md;
  background: white;
  border-radius: 8px;
  
  .skeleton-cart-image {
    width: 80px;
    height: 80px;
    background: #f0f0f0;
    border-radius: 6px;
    flex-shrink: 0;
  }
  
  .skeleton-cart-content {
    flex: 1;
    
    .skeleton-cart-title {
      height: 18px;
      background: #f0f0f0;
      border-radius: 4px;
      margin-bottom: $spacing-sm;
    }
    
    .skeleton-cart-price {
      height: 16px;
      width: 50%;
      background: #f0f0f0;
      border-radius: 4px;
      margin-bottom: $spacing-sm;
    }
    
    .skeleton-cart-controls {
      height: 32px;
      width: 120px;
      background: #f0f0f0;
      border-radius: 4px;
    }
  }
}

// 文本骨架屏
.skeleton-text {
  .skeleton-line {
    height: 16px;
    background: #f0f0f0;
    border-radius: 4px;
    margin-bottom: $spacing-sm;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

// 矩形骨架屏
.skeleton-rect {
  background: #f0f0f0;
  border-radius: 4px;
}
</style>