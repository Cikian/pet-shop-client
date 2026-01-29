<template>
  <div class="cart-page">
    <div class="cart-container">
      <!-- 页面标题 -->
      <BreadcrumbNav
        :items="[{ label: '购物车' }]"
        title="我的购物车"
        :title-icon="ShoppingCart"
        :show-back-button="true"
        back-button-text="继续购物"
        :custom-back-handler="goShopping"
      />

      <!-- 空购物车状态 -->
      <div v-if="cartStore.items.length === 0" class="empty-cart">
        <div class="empty-content">
          <div class="empty-icon">
            <el-icon size="120"><ShoppingCartFull /></el-icon>
          </div>
          <h2 class="empty-title">购物车是空的</h2>
          <p class="empty-desc">还没有添加任何商品，快去挑选心仪的商品吧~</p>
          <div class="empty-actions">
            <el-button type="primary" size="large" @click="goShopping">
              立即购物
            </el-button>
            <el-button @click="viewHistory">
              查看浏览历史
            </el-button>
          </div>
        </div>
      </div>

      <!-- 购物车内容 -->
      <div v-else class="cart-content">
        <div class="cart-main">
          <!-- 购物车头部操作栏 -->
          <div class="cart-header">
            <div class="select-all">
              <el-checkbox 
                :model-value="cartStore.items.length > 0 && cartStore.selectedItems.length === cartStore.items.length" 
                @change="handleSelectAll"
                :indeterminate="cartStore.selectedItems.length > 0 && cartStore.selectedItems.length < cartStore.items.length"
              >
                全选 ({{ cartStore.items.length }})
              </el-checkbox>
            </div>
            <div class="header-actions">
              <el-button 
                type="text" 
                @click="handleClearSelected"
                v-if="cartStore.selectedItems.length > 0"
                class="clear-selected"
              >
                删除选中 ({{ cartStore.selectedItems.length }})
              </el-button>
              <el-button 
                type="text" 
                @click="handleClearCart"
                class="clear-all"
              >
                清空购物车
              </el-button>
            </div>
          </div>

          <!-- 购物车商品列表 -->
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
        </div>

        <!-- 购物车侧边栏汇总 -->
        <div class="cart-sidebar">
          <CartSummary
            :items="cartStore.items"
            :selected-items="cartStore.selectedItems"
            @select-all="handleSelectAll"
            @unselect-all="handleUnselectAll"
            @clear-selected="handleClearSelected"
            @checkout="handleCheckout"
          />

          <!-- 推荐商品 -->
          <div class="recommended-products">
            <h3 class="recommend-title">为您推荐</h3>
            <div class="recommend-list">
              <div 
                v-for="product in recommendedProducts" 
                :key="product.id"
                class="recommend-item"
                @click="viewProduct(product.id)"
              >
                <el-image
                  :src="product.image"
                  :alt="product.name"
                  fit="cover"
                  class="recommend-image"
                />
                <div class="recommend-info">
                  <div class="recommend-name">{{ product.name }}</div>
                  <div class="recommend-price">¥{{ product.price.toFixed(2) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElIcon, ElBreadcrumb, ElBreadcrumbItem, ElButton, ElCheckbox, ElImage, ElMessageBox, ElMessage } from 'element-plus'
import { ShoppingCart, ShoppingCartFull } from '@element-plus/icons-vue'
import { useCartStore } from '../stores/cart'
import { useProductStore } from '../stores/product'
import { CartItem, CartSummary } from '../components/cart'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'

/**
 * 购物车页面组件
 */

const router = useRouter()
const cartStore = useCartStore()
const productStore = useProductStore()

// 计算属性
const recommendedProducts = computed(() => {
  // 获取推荐商品（排除购物车中已有的商品）
  const cartProductIds = cartStore.items.map(item => item.product.id)
  return productStore.products
    .filter(product => !cartProductIds.includes(product.id))
    .slice(0, 4)
})

// 生命周期
onMounted(() => {
  // 初始化购物车数据
  cartStore.initialize()
  // 获取商品数据用于推荐
  if (productStore.products.length === 0) {
    productStore.fetchProducts()
  }
})

// 事件处理
const handleSelectAll = (selected) => {
  if (selected) {
    cartStore.selectAllItems()
  } else {
    cartStore.unselectAllItems()
  }
}

const handleUnselectAll = () => {
  cartStore.unselectAllItems()
}

const handleToggleSelection = (productId) => {
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
  ElMessage.info('收藏功能开发中...')
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
  // 这里可以跳转到结算页面
  console.log('结算数据:', checkoutData)
  ElMessage.success('跳转到结算页面...')
}

const goShopping = () => {
  router.push('/')
}

const viewHistory = () => {
  ElMessage.info('浏览历史功能开发中...')
}

const viewProduct = (productId) => {
  router.push(`/product/${productId}`)
}
</script>

<style lang="scss" scoped>
.cart-page {
  min-height: 100vh;
  background: var(--el-bg-color-page);
  padding: 20px 0;

  .cart-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .page-header {
    margin-bottom: 24px;

    .page-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 28px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 8px 0;
    }

    .breadcrumb {
      color: var(--el-text-color-secondary);
    }
  }

  .empty-cart {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;

    .empty-content {
      text-align: center;
      max-width: 400px;

      .empty-icon {
        color: var(--el-text-color-placeholder);
        margin-bottom: 24px;
      }

      .empty-title {
        font-size: 24px;
        color: var(--el-text-color-primary);
        margin: 0 0 12px 0;
      }

      .empty-desc {
        color: var(--el-text-color-secondary);
        margin: 0 0 32px 0;
        line-height: 1.6;
      }

      .empty-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
      }
    }
  }

  .cart-content {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 24px;
    align-items: start;

    .cart-main {
      .cart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--el-bg-color);
        padding: 16px 20px;
        border-radius: 12px;
        margin-bottom: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .select-all {
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          gap: 16px;

          .clear-selected {
            color: var(--el-color-warning);
          }

          .clear-all {
            color: var(--el-color-danger);
          }
        }
      }

      .cart-items {
        // CartItem 组件的样式已在组件内部定义
      }
    }

    .cart-sidebar {
      position: sticky;
      top: 20px;

      .recommended-products {
        margin-top: 24px;
        background: var(--el-bg-color);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .recommend-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin: 0 0 16px 0;
        }

        .recommend-list {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .recommend-item {
            display: flex;
            gap: 12px;
            padding: 8px;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.3s;

            &:hover {
              background: var(--el-fill-color-light);
            }

            .recommend-image {
              width: 60px;
              height: 60px;
              border-radius: 6px;
              flex-shrink: 0;
            }

            .recommend-info {
              flex: 1;

              .recommend-name {
                font-size: 14px;
                color: var(--el-text-color-primary);
                margin-bottom: 4px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }

              .recommend-price {
                font-size: 16px;
                font-weight: 600;
                color: var(--el-color-danger);
              }
            }
          }
        }
      }
    }
  }
}

// 移动端适配
@media (max-width: 1024px) {
  .cart-page {
    .cart-content {
      grid-template-columns: 1fr;
      gap: 16px;

      .cart-sidebar {
        position: static;
        order: -1;
      }
    }
  }
}

@media (max-width: 768px) {
  .cart-page {
    padding: 16px 0;

    .cart-container {
      padding: 0 16px;
    }

    .page-header {
      .page-title {
        font-size: 24px;
      }
    }

    .cart-content {
      .cart-main {
        .cart-header {
          flex-direction: column;
          gap: 12px;
          align-items: stretch;

          .header-actions {
            justify-content: space-between;
          }
        }
      }
    }
  }
}
</style>