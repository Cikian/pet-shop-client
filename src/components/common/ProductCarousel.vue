<template>
  <div class="product-carousel">
    <div class="carousel-header">
      <h2 class="carousel-title">{{ title }}</h2>
      <p v-if="subtitle" class="carousel-subtitle">{{ subtitle }}</p>
    </div>
    
    <div class="carousel-container" ref="carouselContainer">
      <div 
        class="carousel-track" 
        ref="carouselTrack"
        :style="{ transform: `translateX(-${currentOffset}px)` }"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div 
          v-for="product in products" 
          :key="product.id"
          class="carousel-item"
        >
          <ProductCard 
            :product="product"
            @add-to-cart="handleAddToCart"
            @product-click="handleProductClick"
          />
        </div>
      </div>
    </div>

    <!-- 导航按钮 -->
    <button 
      class="carousel-nav carousel-prev" 
      @click="prevSlide"
      :disabled="!canGoPrev"
      v-show="showNavigation"
    >
      <el-icon><ArrowLeft /></el-icon>
    </button>
    <button 
      class="carousel-nav carousel-next" 
      @click="nextSlide"
      :disabled="!canGoNext"
      v-show="showNavigation"
    >
      <el-icon><ArrowRight /></el-icon>
    </button>

    <!-- 滚动指示器 -->
    <div class="carousel-indicators" v-if="showIndicators && totalPages > 1">
      <div 
        v-for="page in totalPages" 
        :key="page"
        class="indicator"
        :class="{ active: page - 1 === currentPage }"
        @click="goToPage(page - 1)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import ProductCard from '@/components/product/ProductCard.vue'

/**
 * 组件属性
 */
const props = defineProps({
  /** 商品数据 */
  products: {
    type: Array,
    default: () => []
  },
  /** 轮播标题 */
  title: {
    type: String,
    default: '推荐商品'
  },
  /** 轮播副标题 */
  subtitle: {
    type: String,
    default: ''
  },
  /** 每页显示的商品数量 */
  itemsPerPage: {
    type: Number,
    default: 4
  },
  /** 是否显示导航按钮 */
  showNavigation: {
    type: Boolean,
    default: true
  },
  /** 是否显示指示器 */
  showIndicators: {
    type: Boolean,
    default: true
  },
  /** 是否启用自动播放 */
  autoplay: {
    type: Boolean,
    default: false
  },
  /** 自动播放间隔（毫秒） */
  autoplayInterval: {
    type: Number,
    default: 5000
  }
})

/**
 * 组件事件
 */
const emit = defineEmits(['addToCart', 'productClick'])

// 响应式数据
const carouselContainer = ref(null)
const carouselTrack = ref(null)
const currentPage = ref(0)
const currentOffset = ref(0)
const itemWidth = ref(0)
const containerWidth = ref(0)
const autoplayTimer = ref(null)

// 触摸相关
const touchStartX = ref(0)
const touchEndX = ref(0)
const isDragging = ref(false)

/**
 * 计算总页数
 */
const totalPages = computed(() => {
  return Math.ceil(props.products.length / props.itemsPerPage)
})

/**
 * 是否可以向前翻页
 */
const canGoPrev = computed(() => {
  return currentPage.value > 0
})

/**
 * 是否可以向后翻页
 */
const canGoNext = computed(() => {
  return currentPage.value < totalPages.value - 1
})

/**
 * 计算当前页显示的商品
 */
const currentPageProducts = computed(() => {
  const start = currentPage.value * props.itemsPerPage
  const end = start + props.itemsPerPage
  return props.products.slice(start, end)
})

/**
 * 更新轮播尺寸
 */
const updateCarouselSize = () => {
  if (!carouselContainer.value) return
  
  containerWidth.value = carouselContainer.value.offsetWidth
  const gap = 16 // 间距
  itemWidth.value = (containerWidth.value - gap * (props.itemsPerPage - 1)) / props.itemsPerPage
  
  // 移动端适配
  if (containerWidth.value < 768) {
    itemWidth.value = containerWidth.value - 32 // 单列显示，留出边距
  } else if (containerWidth.value < 992) {
    itemWidth.value = (containerWidth.value - gap) / 2 // 双列显示
  }
  
  updateOffset()
}

/**
 * 更新偏移量
 */
const updateOffset = () => {
  const gap = 16
  currentOffset.value = currentPage.value * (itemWidth.value + gap) * props.itemsPerPage
}

/**
 * 下一页
 */
const nextSlide = () => {
  if (canGoNext.value) {
    currentPage.value++
    updateOffset()
  }
}

/**
 * 上一页
 */
const prevSlide = () => {
  if (canGoPrev.value) {
    currentPage.value--
    updateOffset()
  }
}

/**
 * 跳转到指定页
 */
const goToPage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page
    updateOffset()
  }
}

/**
 * 开始自动播放
 */
const startAutoplay = () => {
  if (!props.autoplay || totalPages.value <= 1) return
  
  stopAutoplay()
  autoplayTimer.value = setInterval(() => {
    if (canGoNext.value) {
      nextSlide()
    } else {
      goToPage(0) // 回到第一页
    }
  }, props.autoplayInterval)
}

/**
 * 停止自动播放
 */
const stopAutoplay = () => {
  if (autoplayTimer.value) {
    clearInterval(autoplayTimer.value)
    autoplayTimer.value = null
  }
}

/**
 * 处理添加到购物车
 */
const handleAddToCart = (product) => {
  emit('addToCart', product)
}

/**
 * 处理商品点击
 */
const handleProductClick = (product) => {
  emit('productClick', product)
}

/**
 * 触摸开始
 */
const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
  isDragging.value = true
  stopAutoplay()
}

/**
 * 触摸移动
 */
const handleTouchMove = (e) => {
  if (!isDragging.value) return
  e.preventDefault()
}

/**
 * 触摸结束
 */
const handleTouchEnd = (e) => {
  if (!isDragging.value) return
  
  touchEndX.value = e.changedTouches[0].clientX
  const diff = touchStartX.value - touchEndX.value
  const threshold = 50 // 滑动阈值
  
  if (Math.abs(diff) > threshold) {
    if (diff > 0 && canGoNext.value) {
      nextSlide()
    } else if (diff < 0 && canGoPrev.value) {
      prevSlide()
    }
  }
  
  isDragging.value = false
  startAutoplay()
}

/**
 * 处理窗口大小变化
 */
const handleResize = () => {
  updateCarouselSize()
}

// 生命周期
onMounted(async () => {
  await nextTick()
  updateCarouselSize()
  startAutoplay()
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  stopAutoplay()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.product-carousel {
  position: relative;
  width: 100%;
}

.carousel-header {
  text-align: center;
  margin-bottom: $spacing-xl;
  
  @media (max-width: $breakpoint-md) {
    margin-bottom: $spacing-lg;
  }
}

.carousel-title {
  font-size: $font-size-2xl;
  font-weight: 700;
  color: $text-primary;
  margin: 0 0 $spacing-sm 0;
  
  @media (max-width: $breakpoint-md) {
    font-size: $font-size-xl;
  }
}

.carousel-subtitle {
  font-size: $font-size-base;
  color: $text-secondary;
  margin: 0;
  
  @media (max-width: $breakpoint-md) {
    font-size: $font-size-sm;
  }
}

.carousel-container {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.carousel-track {
  display: flex;
  gap: $spacing-md;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: $breakpoint-md) {
    gap: $spacing-sm;
  }
}

.carousel-item {
  flex: 0 0 auto;
  width: calc(25% - 12px); // 4列布局，减去间距
  
  @media (max-width: $breakpoint-lg) {
    width: calc(33.333% - 11px); // 3列布局
  }
  
  @media (max-width: $breakpoint-md) {
    width: calc(50% - 8px); // 2列布局
  }
  
  @media (max-width: $breakpoint-sm) {
    width: 100%; // 1列布局
  }
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  color: $text-primary;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  &:hover:not(:disabled) {
    background: white;
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  @media (max-width: $breakpoint-md) {
    width: 40px;
    height: 40px;
  }
  
  @media (max-width: $breakpoint-sm) {
    display: none; // 移动端隐藏导航按钮
  }
}

.carousel-prev {
  left: -24px;
  
  @media (max-width: $breakpoint-lg) {
    left: -20px;
  }
}

.carousel-next {
  right: -24px;
  
  @media (max-width: $breakpoint-lg) {
    right: -20px;
  }
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: $spacing-sm;
  margin-top: $spacing-lg;
  
  @media (max-width: $breakpoint-sm) {
    margin-top: $spacing-md;
  }
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $border-color;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.active {
    background: $primary-color;
    transform: scale(1.2);
  }
  
  &:hover {
    background: $primary-light;
  }
}

// 空状态样式
.carousel-empty {
  text-align: center;
  padding: $spacing-2xl;
  color: $text-secondary;
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: $spacing-md;
    opacity: 0.5;
  }
  
  .empty-text {
    font-size: $font-size-base;
    margin: 0;
  }
}

// 加载状态样式
.carousel-loading {
  .carousel-item {
    .product-card {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 12px;
      height: 300px;
    }
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
</style>