<template>
  <el-drawer
    v-model="visible"
    title="购物车"
    :size="drawerSize"
    direction="rtl"
    :before-close="handleClose"
    class="cart-drawer"
  >
    <template #header="{ titleId, titleClass }">
      <div class="cart-drawer__header">
        <h2 :id="titleId" :class="titleClass" class="drawer-title">
          <el-icon><ShoppingCart /></el-icon>
          购物车
        </h2>
        <div class="cart-count" v-if="cartStore.totalCount > 0">
          {{ cartStore.totalCount }}件商品
        </div>
      </div>
    </template>

    <div class="cart-drawer__content">
      <!-- 空购物车状态 -->
      <div v-if="cartStore.items.length === 0" class="empty-cart">
        <div class="empty-icon">
          <el-icon size="64"><ShoppingCartFull /></el-icon>
        </div>
        <h3 class="empty-title">购物车是空的</h3>
        <p class="empty-desc">快去挑选心仪的商品吧~</p>
        <el-button type="primary" @click="goShopping" class="go-shopping-btn">
          去购物
        </el-button>
      </div>

      <!-- 购物车商品列表 -->
      <div v-else class="cart-content">
        <div class="cart-items">
          <CartItem
            v-for="item in cartStore.items"
            :key="item.product.id"
            :item="item"
            @toggle-selection="handleToggleSelection"
            @update-quantity="handleUpdateQuantity"
            @remove-item="handleRemoveItem"
            @toggle-favorite="handleToggleFavorite"
          />
        </div>

        <!-- 购物车汇总 -->
        <div class="cart-summary-wrapper">
          <CartSummary
            :items="cartStore.items"
            :selected-items="cartStore.selectedItems"
            @select-all="handleSelectAll"
            @unselect-all="handleUnselectAll"
            @clear-selected="handleClearSelected"
            @checkout="handleCheckout"
          />
        </div>
      </div>
    </div>

    <!-- 底部快捷操作 -->
    <template #footer v-if="cartStore.items.length > 0">
      <div class="cart-drawer__footer">
        <div class="quick-actions">
          <el-button @click="handleClearCart" type="text" class="clear-all-btn">
            清空购物车
          </el-button>
          <div class="total-info">
            <span class="selected-count">已选{{ cartStore.selectedTotalCount }}件</span>
            <span class="total-price">¥{{ cartStore.selectedTotalPrice.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElDrawer, ElIcon, ElButton, ElMessageBox, ElMessage } from 'element-plus'
import { ShoppingCart, ShoppingCartFull } from '@element-plus/icons-vue'
import { useCartStore } from '../../stores/cart'
import CartItem from './CartItem.vue'
import CartSummary from './CartSummary.vue'

/**
 * 购物车抽屉组件
 */

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'checkout'])

const router = useRouter()
const cartStore = useCartStore()

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const drawerSize = computed(() => {
  // 根据屏幕尺寸调整抽屉大小
  if (window.innerWidth < 768) {
    return '100%'
  } else if (window.innerWidth < 1200) {
    return '60%'
  } else {
    return '480px'
  }
})

// 监听购物车可见性状态
watch(() => cartStore.isVisible, (newValue) => {
  visible.value = newValue
})

watch(visible, (newValue) => {
  cartStore.isVisible = newValue
})

// 事件处理
const handleClose = () => {
  cartStore.hideCart()
}

const handleToggleSelection = (productId, selected) => {
  cartStore.toggleItemSelection(productId)
}

const handleUpdateQuantity = (productId, quantity) => {
  cartStore.updateQuantity(productId, quantity)
}

const handleRemoveItem = async (productId) => {
  try {
    await ElMessageBox.confirm(
      '确定要从购物车中移除这件商品吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    cartStore.removeItem(productId)
    ElMessage.success('商品已移除')
  } catch {
    // 用户取消删除
  }
}

const handleToggleFavorite = (productId) => {
  // 这里应该调用商品store的收藏功能
  // 暂时只显示消息
  ElMessage.info('收藏功能开发中...')
}

const handleSelectAll = () => {
  cartStore.selectAllItems()
}

const handleUnselectAll = () => {
  cartStore.unselectAllItems()
}

const handleClearSelected = async () => {
  if (cartStore.selectedItems.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的${cartStore.selectedTotalCount}件商品吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    cartStore.removeSelectedItems()
    ElMessage.success('选中商品已删除')
  } catch {
    // 用户取消删除
  }
}

const handleClearCart = async () => {
  if (cartStore.items.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      '确定要清空购物车吗？此操作不可恢复。',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    cartStore.clearCart()
    ElMessage.success('购物车已清空')
  } catch {
    // 用户取消清空
  }
}

const handleCheckout = (checkoutData) => {
  // 关闭购物车抽屉
  cartStore.hideCart()
  
  // 触发结算事件
  emit('checkout', checkoutData)
  
  // 这里可以跳转到结算页面
  // router.push('/checkout')
  ElMessage.success('跳转到结算页面...')
}

const goShopping = () => {
  cartStore.hideCart()
  router.push('/')
}
</script>

<style lang="scss" scoped>
.cart-drawer {
  :deep(.el-drawer__header) {
    padding: 20px 24px;
    border-bottom: 1px solid var(--el-border-color-light);
    margin-bottom: 0;
  }

  :deep(.el-drawer__body) {
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  :deep(.el-drawer__footer) {
    padding: 16px 24px;
    border-top: 1px solid var(--el-border-color-light);
    margin-top: auto;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .drawer-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .cart-count {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      background: var(--el-color-primary-light-9);
      padding: 4px 12px;
      border-radius: 12px;
    }
  }

  &__content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .empty-cart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 40px 24px;
      text-align: center;

      .empty-icon {
        color: var(--el-text-color-placeholder);
        margin-bottom: 16px;
      }

      .empty-title {
        font-size: 18px;
        color: var(--el-text-color-primary);
        margin: 0 0 8px 0;
      }

      .empty-desc {
        color: var(--el-text-color-secondary);
        margin: 0 0 24px 0;
      }

      .go-shopping-btn {
        background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-dark-2) 100%);
        border: none;
      }
    }

    .cart-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .cart-items {
        flex: 1;
        overflow-y: auto;
        padding: 16px 24px;

        // 自定义滚动条
        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: var(--el-fill-color-light);
          border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb {
          background: var(--el-border-color);
          border-radius: 3px;

          &:hover {
            background: var(--el-border-color-dark);
          }
        }
      }

      .cart-summary-wrapper {
        padding: 0 24px 16px;
        border-top: 1px solid var(--el-border-color-light);
        background: var(--el-bg-color-page);
      }
    }
  }

  &__footer {
    .quick-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .clear-all-btn {
        color: var(--el-color-danger);
        padding: 0;

        &:hover {
          color: var(--el-color-danger-dark-2);
        }
      }

      .total-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;

        .selected-count {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }

        .total-price {
          font-size: 18px;
          font-weight: 600;
          color: var(--el-color-danger);
        }
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .cart-drawer {
    :deep(.el-drawer__header) {
      padding: 16px 20px;
    }

    &__content {
      .cart-content {
        .cart-items {
          padding: 12px 20px;
        }

        .cart-summary-wrapper {
          padding: 0 20px 12px;
        }
      }
    }

    :deep(.el-drawer__footer) {
      padding: 12px 20px;
    }
  }
}
</style>