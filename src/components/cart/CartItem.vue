<template>
  <div class="cart-item" :class="{ 'cart-item--selected': item.selected }">
    <!-- 选择框 -->
    <div class="cart-item__checkbox">
      <el-checkbox 
        :model-value="item.selected" 
        @change="toggleSelection"
        size="large"
      />
    </div>

    <!-- 商品图片 -->
    <div class="cart-item__image">
      <el-image
        :src="item.product.image"
        :alt="item.product.name"
        fit="cover"
        lazy
        class="product-image"
      >
        <template #error>
          <div class="image-error">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </el-image>
    </div>

    <!-- 商品信息 -->
    <div class="cart-item__info">
      <h4 class="product-name">{{ item.product.name }}</h4>
      <div class="product-tags" v-if="item.product.tags && item.product.tags.length">
        <el-tag 
          v-for="tag in item.product.tags.slice(0, 2)" 
          :key="tag" 
          size="small" 
          type="info"
        >
          {{ tag }}
        </el-tag>
      </div>
      <div class="product-rating">
        <el-rate 
          :model-value="item.product.rating" 
          disabled 
          size="small"
          show-score
        />
        <span class="review-count">({{ item.product.reviewCount }})</span>
      </div>
    </div>

    <!-- 价格信息 -->
    <div class="cart-item__price">
      <div class="current-price">¥{{ item.product.price.toFixed(2) }}</div>
      <div 
        v-if="item.product.originalPrice && item.product.originalPrice > item.product.price" 
        class="original-price"
      >
        ¥{{ item.product.originalPrice.toFixed(2) }}
      </div>
    </div>

    <!-- 数量控制 -->
    <div class="cart-item__quantity">
      <el-input-number
        :model-value="item.quantity"
        @change="updateQuantity"
        :min="1"
        :max="item.product.stock"
        size="small"
        controls-position="right"
      />
      <div class="stock-info">库存{{ item.product.stock }}件</div>
    </div>

    <!-- 小计 -->
    <div class="cart-item__subtotal">
      <div class="subtotal-price">¥{{ subtotal.toFixed(2) }}</div>
    </div>

    <!-- 操作按钮 -->
    <div class="cart-item__actions">
      <el-button 
        type="text" 
        size="small" 
        @click="toggleFavorite"
        :icon="item.product.isFavorite ? 'StarFilled' : 'Star'"
      >
        {{ item.product.isFavorite ? '已收藏' : '收藏' }}
      </el-button>
      <el-button 
        type="text" 
        size="small" 
        @click="removeItem"
        class="remove-btn"
      >
        删除
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElCheckbox, ElImage, ElTag, ElRate, ElInputNumber, ElButton, ElIcon } from 'element-plus'
import { Picture, Star, StarFilled } from '@element-plus/icons-vue'

/**
 * 购物车商品项组件
 * @typedef {import('../../types/index.js').CartItem} CartItem
 */

const props = defineProps({
  /** @type {CartItem} */
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'toggle-selection',
  'update-quantity', 
  'remove-item',
  'toggle-favorite'
])

// 计算小计
const subtotal = computed(() => {
  return props.item.product.price * props.item.quantity
})

// 切换选择状态
const toggleSelection = (selected) => {
  emit('toggle-selection', props.item.product.id, selected)
}

// 更新数量
const updateQuantity = (quantity) => {
  if (quantity && quantity > 0) {
    emit('update-quantity', props.item.product.id, quantity)
  }
}

// 移除商品
const removeItem = () => {
  emit('remove-item', props.item.product.id)
}

// 切换收藏状态
const toggleFavorite = () => {
  emit('toggle-favorite', props.item.product.id)
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 12px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  &--selected {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  &__checkbox {
    margin-right: 16px;
  }

  &__image {
    width: 80px;
    height: 80px;
    margin-right: 16px;
    border-radius: 8px;
    overflow: hidden;

    .product-image {
      width: 100%;
      height: 100%;
    }

    .image-error {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: var(--el-fill-color-light);
      color: var(--el-text-color-placeholder);
    }
  }

  &__info {
    flex: 1;
    margin-right: 16px;

    .product-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 8px 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .product-tags {
      margin-bottom: 8px;

      .el-tag {
        margin-right: 8px;
      }
    }

    .product-rating {
      display: flex;
      align-items: center;
      gap: 8px;

      .review-count {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  &__price {
    width: 100px;
    text-align: right;
    margin-right: 16px;

    .current-price {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-color-danger);
    }

    .original-price {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      text-decoration: line-through;
      margin-top: 4px;
    }
  }

  &__quantity {
    width: 120px;
    margin-right: 16px;

    .stock-info {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-align: center;
      margin-top: 4px;
    }
  }

  &__subtotal {
    width: 100px;
    text-align: right;
    margin-right: 16px;

    .subtotal-price {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-color-danger);
    }
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .remove-btn {
      color: var(--el-color-danger);

      &:hover {
        color: var(--el-color-danger-dark-2);
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    align-items: stretch;
    padding: 16px;

    &__checkbox {
      position: absolute;
      top: 16px;
      left: 16px;
      margin-right: 0;
    }

    &__image {
      width: 60px;
      height: 60px;
      margin: 0 0 12px 40px;
    }

    &__info {
      margin-right: 0;
      margin-bottom: 12px;
      padding-left: 40px;
    }

    &__price,
    &__quantity,
    &__subtotal {
      width: auto;
      margin-right: 0;
      margin-bottom: 12px;
      text-align: left;
    }

    &__actions {
      flex-direction: row;
      justify-content: space-between;
    }
  }
}
</style>