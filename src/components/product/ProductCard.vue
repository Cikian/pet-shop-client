<template>
  <div class="product-card" @click="handleCardClick">
    <!-- 商品图片区域 -->
    <div class="product-image-container">
      <LazyImage
        :src="product.image"
        :alt="product.name"
        :fallback="defaultImage"
        :width="'100%'"
        :height="'100%'"
        :lazy="true"
        :threshold="50"
        :show-placeholder-icon="true"
        :show-retry="true"
        :object-fit="'cover'"
        :border-radius="0"
        class="product-image"
        @load="handleImageLoad"
        @error="handleImageError"
      />
      
      <!-- 折扣标签 -->
      <div v-if="hasDiscount" class="discount-badge">
        {{ discountPercentage }}% OFF
      </div>
      
      <!-- 收藏按钮 -->
      <button 
        class="favorite-btn"
        :class="{ 'is-favorite': product.isFavorite }"
        @click.stop="toggleFavorite"
        :aria-label="product.isFavorite ? '取消收藏' : '收藏商品'"
      >
        <el-icon>
          <StarFilled v-if="product.isFavorite" />
          <Star v-else />
        </el-icon>
      </button>
    </div>
    
    <!-- 商品信息区域 -->
    <div class="product-info">
      <!-- 商品名称 -->
      <h3 class="product-name" :title="product.name">
        {{ product.name }}
      </h3>
      
      <!-- 商品价格 -->
      <div class="product-price">
        <span class="current-price">¥{{ formatPrice(product.price) }}</span>
        <span v-if="product.originalPrice" class="original-price">
          ¥{{ formatPrice(product.originalPrice) }}
        </span>
      </div>
      
      <!-- 商品评分 -->
      <div class="product-rating">
        <el-rate 
          v-model="product.rating" 
          disabled 
          show-score 
          text-color="#ff9900"
          score-template="{value}"
          :max="5"
          size="small"
        />
        <span class="review-count">({{ product.reviewCount }})</span>
      </div>
      
      <!-- 商品标签 -->
      <div class="product-tags" v-if="product.tags && product.tags.length > 0">
        <el-tag 
          v-for="tag in displayTags" 
          :key="tag" 
          size="small" 
          type="info"
          effect="plain"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>
    
    <!-- 操作按钮区域 -->
    <div class="product-actions">
      <el-button 
        type="primary" 
        size="default"
        :disabled="product.stock === 0"
        @click.stop="addToCart"
        class="add-to-cart-btn"
      >
        <el-icon><ShoppingCartFull /></el-icon>
        {{ product.stock === 0 ? '缺货' : '加入购物车' }}
      </el-button>
    </div>
    
    <!-- 库存状态 -->
    <div v-if="product.stock <= 5 && product.stock > 0" class="stock-warning">
      仅剩 {{ product.stock }} 件
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart.js'
import { useProductStore } from '@/stores/product.js'
import { ElMessage } from 'element-plus'
import { 
  Star, 
  StarFilled, 
  ShoppingCartFull 
} from '@element-plus/icons-vue'
import LazyImage from '@/components/common/LazyImage.vue'

/**
 * 商品卡片组件
 * 显示商品基本信息，支持收藏、加入购物车等操作
 */

// Props 定义
const props = defineProps({
  /** @type {import('@/types/index.js').Product} */
  product: {
    type: Object,
    required: true
  },
  /** 是否显示完整标签 */
  showAllTags: {
    type: Boolean,
    default: false
  },
  /** 最大显示标签数量 */
  maxTags: {
    type: Number,
    default: 2
  }
})

// Emits 定义
const emit = defineEmits(['click', 'favorite-toggle', 'add-to-cart'])

// 组合式 API
const router = useRouter()
const cartStore = useCartStore()
const productStore = useProductStore()

// 计算属性
const hasDiscount = computed(() => {
  return props.product.originalPrice && props.product.originalPrice > props.product.price
})

const discountPercentage = computed(() => {
  if (!hasDiscount.value) return 0
  return Math.round(((props.product.originalPrice - props.product.price) / props.product.originalPrice) * 100)
})

const displayTags = computed(() => {
  if (!props.product.tags) return []
  if (props.showAllTags) return props.product.tags
  return props.product.tags.slice(0, props.maxTags)
})

const defaultImage = computed(() => {
  return 'https://via.placeholder.com/300x300/f5f5f5/cccccc?text=暂无图片'
})

// 方法
const formatPrice = (price) => {
  return price.toLocaleString('zh-CN')
}

const handleCardClick = () => {
  emit('click', props.product)
  router.push(`/product/${props.product.id}`)
}

const toggleFavorite = () => {
  productStore.toggleFavorite(props.product.id)
  emit('favorite-toggle', props.product)
  
  const message = props.product.isFavorite ? '已取消收藏' : '已添加到收藏'
  ElMessage({
    message,
    type: 'success',
    duration: 2000
  })
}

const addToCart = () => {
  if (props.product.stock === 0) {
    ElMessage.warning('商品已售罄')
    return
  }
  
  cartStore.addItem(props.product, 1)
  emit('add-to-cart', props.product)
  
  ElMessage({
    message: '已添加到购物车',
    type: 'success',
    duration: 2000
  })
}

const handleImageLoad = (event) => {
  console.log('Product image loaded:', event.src)
}

const handleImageError = (event) => {
  console.error('Product image failed to load:', event.src)
  ElMessage.warning('商品图片加载失败')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.product-card {
  background: $card-background;
  border-radius: 12px;
  overflow: hidden;
  @include card-shadow(1);
  @include hover-lift(4px);
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    .product-image :deep(.lazy-img) {
      transform: scale(1.05);
    }
    
    .add-to-cart-btn {
      transform: translateY(0);
      opacity: 1;
    }
  }
}

.product-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: $background;
  
  @include min-width($breakpoint-md) {
    height: 240px;
  }
  
  .product-image {
    width: 100%;
    height: 100%;
  }
}

.discount-badge {
  position: absolute;
  top: $spacing-sm;
  left: $spacing-sm;
  background: $accent-color;
  color: white;
  padding: $spacing-xs $spacing-sm;
  border-radius: 4px;
  font-size: $font-size-xs;
  font-weight: 600;
  z-index: 2;
}

.favorite-btn {
  position: absolute;
  top: $spacing-sm;
  right: $spacing-sm;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
  
  &:hover {
    background: white;
    transform: scale(1.1);
  }
  
  &.is-favorite {
    color: $accent-color;
    background: rgba($accent-color, 0.1);
    
    &:hover {
      background: rgba($accent-color, 0.2);
    }
  }
  
  .el-icon {
    font-size: 18px;
  }
}

.product-info {
  padding: $spacing-md;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.product-name {
  font-size: $font-size-base;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
  @include text-ellipsis(2);
  line-height: 1.4;
  min-height: 2.8em;
}

.product-price {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  
  .current-price {
    font-size: $font-size-lg;
    font-weight: 700;
    color: $accent-color;
  }
  
  .original-price {
    font-size: $font-size-sm;
    color: $text-light;
    text-decoration: line-through;
  }
}

.product-rating {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  
  .review-count {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  
  .el-tag {
    font-size: $font-size-xs;
  }
}

.product-actions {
  padding: 0 $spacing-md $spacing-md;
  
  .add-to-cart-btn {
    width: 100%;
    @include gradient-button();
    transform: translateY(4px);
    opacity: 0.8;
    transition: all 0.3s ease;
    
    &:disabled {
      background: $text-light !important;
      cursor: not-allowed;
      transform: none;
      opacity: 0.6;
      
      &:hover {
        transform: none;
      }
    }
  }
}

.stock-warning {
  position: absolute;
  bottom: $spacing-sm;
  right: $spacing-sm;
  background: $warning-color;
  color: $text-primary;
  padding: $spacing-xs $spacing-sm;
  border-radius: 4px;
  font-size: $font-size-xs;
  font-weight: 500;
  z-index: 2;
}

// 响应式适配
@include max-width($breakpoint-sm) {
  .product-card {
    // 移动端触摸优化
    &:active {
      transform: scale(0.98);
    }
    
    .product-image-container {
      height: 160px;
    }
    
    .product-info {
      padding: $spacing-sm;
      gap: $spacing-xs;
    }
    
    .product-name {
      font-size: $font-size-sm;
      min-height: 2.4em;
    }
    
    .product-price .current-price {
      font-size: $font-size-base;
    }
    
    .product-rating {
      :deep(.el-rate) {
        --el-rate-icon-size: 12px;
      }
      
      .review-count {
        font-size: $font-size-xs;
      }
    }
    
    .product-actions {
      padding: 0 $spacing-sm $spacing-sm;
      
      .add-to-cart-btn {
        height: 36px;
        font-size: $font-size-sm;
        padding: 0 $spacing-sm;
        
        // 增大触摸区域
        position: relative;
        
        &::before {
          content: '';
          position: absolute;
          top: -8px;
          left: -8px;
          right: -8px;
          bottom: -8px;
          background: transparent;
        }
      }
    }
    
    .favorite-btn {
      width: 32px;
      height: 32px;
      
      // 增大触摸区域
      &::before {
        content: '';
        position: absolute;
        top: -8px;
        left: -8px;
        right: -8px;
        bottom: -8px;
        background: transparent;
      }
      
      .el-icon {
        font-size: 16px;
      }
    }
  }
}

// 超小屏幕优化
@include max-width(480px) {
  .product-card {
    .product-image-container {
      height: 140px;
    }
    
    .product-name {
      @include text-ellipsis(2);
      min-height: 2.2em;
    }
    
    .product-tags {
      .el-tag {
        font-size: 10px;
        padding: 2px 6px;
      }
    }
  }
}

// 加载状态
.product-card.loading {
  .product-image {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
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