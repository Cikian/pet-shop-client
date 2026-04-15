<template>
  <div class="cart-page">
    <div class="cart-wrapper">
      <!-- 页面头部 -->
      <header class="cart-header">
        <div class="header-content">
          <div class="title-section">
            <div class="icon-wrapper">
              <el-icon class="cart-icon"><ShoppingCart /></el-icon>
            </div>
            <div class="title-info">
              <h1 class="page-title">我的购物车</h1>
              <p class="page-subtitle">已选择 {{ selectedCount }} 件商品，共 {{ totalCount }} 件</p>
            </div>
          </div>
          <el-button 
            v-if="cartList.length > 0"
            @click="goShopping" 
            class="back-shop-btn"
          >
            <el-icon><ArrowLeft /></el-icon>
            继续购物
          </el-button>
        </div>
      </header>

      <!-- 主要内容区 -->
      <main class="cart-main">
        <div v-loading="loading" class="cart-content">
          <!-- 空状态 -->
          <transition name="fade" mode="out-in">
            <div v-if="!loading && cartList.length === 0" class="empty-state">
              <div class="empty-illustration">
                <div class="empty-icon-wrapper">
                  <el-icon class="empty-icon"><ShoppingCartFull /></el-icon>
                </div>
                <div class="empty-decoration"></div>
              </div>
              <h2 class="empty-title">购物车空空如也</h2>
              <p class="empty-description">快去挑选心仪的商品吧~</p>
              <div class="empty-actions">
                <el-button type="primary" size="large" @click="goShopping" class="go-shop-btn">
                  <el-icon><ShoppingBag /></el-icon>
                  去逛逛
                </el-button>
              </div>
            </div>

            <!-- 购物车列表 -->
            <div v-else class="cart-list-container">
              <!-- 商品列表 -->
              <div class="products-section">
                <div class="section-header">
                  <div class="header-row">
                    <div class="col-checkbox">
                      <el-checkbox 
                        :model-value="isAllSelected" 
                        @change="handleSelectAll"
                        :indeterminate="isIndeterminate"
                        class="select-all"
                      >
                        全选
                      </el-checkbox>
                    </div>
                    <div class="col-info">商品信息</div>
                    <div class="col-price">单价</div>
                    <div class="col-quantity">数量</div>
                    <div class="col-total">小计</div>
                    <div class="col-action">操作</div>
                  </div>
                </div>

                <transition-group name="list" tag="div" class="products-list">
                  <div 
                    v-for="item in cartList" 
                    :key="item.id"
                    class="product-card"
                    :class="{ 'selected': item.selected }"
                  >
                    <div class="card-row">
                      <div class="col-checkbox">
                        <el-checkbox 
                          :model-value="item.selected"
                          @change="(val) => handleToggleSelection(item.id, val)"
                        />
                      </div>
                      
                      <div class="col-info" @click="viewProductDetail(item.productId)">
                        <div class="product-image-wrapper">
                          <el-image 
                            :src="item.mainImg" 
                            :alt="item.productName"
                            fit="cover"
                            class="product-image"
                          >
                            <template #placeholder>
                              <div class="image-placeholder">
                                <el-icon><Picture /></el-icon>
                              </div>
                            </template>
                          </el-image>
                          <div class="image-overlay">
                            <span>查看详情</span>
                          </div>
                        </div>
                        <div class="product-details">
                          <h3 class="product-name">{{ item.productName }}</h3>
                          <div class="product-sku">
                            <el-tag size="small" class="sku-tag">{{ item.skuName }}</el-tag>
                          </div>
                          <div class="product-meta">
                            <span class="meta-label">商品编号：</span>
                            <span class="meta-value">{{ item.productId }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="col-price">
                        <div class="price-wrapper">
                          <span class="current-price">¥{{ item.price.toFixed(2) }}</span>
                          <span v-if="item.originalPrice > item.price" class="original-price">
                            ¥{{ item.originalPrice.toFixed(2) }}
                          </span>
                          <el-tag v-if="item.originalPrice > item.price" size="small" type="danger" class="discount-tag">
                            省{{ (item.originalPrice - item.price).toFixed(2) }}
                          </el-tag>
                        </div>
                      </div>

                      <div class="col-quantity">
                        <el-input-number 
                          v-model="item.quantity"
                          :min="1"
                          :max="99"
                          size="small"
                          controls-position="right"
                          @change="(val) => handleUpdateQuantity(item.id, val)"
                          class="quantity-input"
                        />
                      </div>

                      <div class="col-total">
                        <div class="total-price">
                          ¥{{ (item.price * item.quantity).toFixed(2) }}
                        </div>
                      </div>

                      <div class="col-action">
                        <el-button 
                          type="text" 
                          @click="handleRemoveItem(item.id)" 
                          class="remove-btn"
                        >
                          <el-icon><Delete /></el-icon>
                          删除
                        </el-button>
                      </div>
                    </div>
                  </div>
                </transition-group>
              </div>

              <!-- 结算栏 -->
              <div class="checkout-section">
                <div class="checkout-card">
                  <div class="checkout-header">
                    <h3 class="checkout-title">订单摘要</h3>
                  </div>
                  
                  <div class="checkout-body">
                    <div class="summary-row">
                      <span class="summary-label">已选商品</span>
                      <span class="summary-value">{{ selectedCount }} 件</span>
                    </div>
                    <div class="summary-row">
                      <span class="summary-label">商品总额</span>
                      <span class="summary-value price-highlight">¥{{ totalPrice.toFixed(2) }}</span>
                    </div>
                    <div class="summary-row">
                      <span class="summary-label">优惠减免</span>
                      <span class="summary-value discount">-¥0.00</span>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="summary-row total-row">
                      <span class="summary-label">应付总额</span>
                      <div class="total-amount">
                        <span class="currency">¥</span>
                        <span class="amount">{{ totalPrice.toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="checkout-footer">
                    <el-button 
                      type="primary" 
                      size="large"
                      :disabled="selectedCount === 0"
                      @click="handleCheckout"
                      class="checkout-btn"
                    >
                      立即结算
                      <el-icon class="btn-icon"><ArrowRight /></el-icon>
                    </el-button>
                    <p class="checkout-tip">
                      <el-icon><InfoFilled /></el-icon>
                      结算前请确认商品信息
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ElIcon, ElButton, ElCheckbox, ElImage, ElInputNumber, ElTag, ElMessage, ElMessageBox 
} from 'element-plus'
import { 
  ShoppingCart, ShoppingCartFull, ShoppingBag, Picture, Delete, ArrowLeft, ArrowRight, InfoFilled 
} from '@element-plus/icons-vue'
import { getCartListApi } from '@/api/cart'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const loading = ref(false)
const cartList = ref([])
const pagination = ref({
  pageNo: 1,
  pageSize: 10,
  total: 0,
  pages: 1
})

const isAllSelected = computed(() => {
  return cartList.value.length > 0 && cartList.value.every(item => item.selected)
})

const isIndeterminate = computed(() => {
  const selectedCount = cartList.value.filter(item => item.selected).length
  return selectedCount > 0 && selectedCount < cartList.value.length
})

const selectedCount = computed(() => {
  return cartList.value.filter(item => item.selected).length
})

const totalCount = computed(() => {
  return cartList.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalPrice = computed(() => {
  return cartList.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const fetchCartList = async () => {
  loading.value = true
  try {
    const result = await getCartListApi({
      pageNo: pagination.value.pageNo,
      pageSize: pagination.value.pageSize
    })
    
    if (result && result.records) {
      cartList.value = result.records.map(item => ({
        ...item,
        selected: false
      }))
      pagination.value = {
        pageNo: result.current || 1,
        pageSize: result.size || 10,
        total: result.total || 0,
        pages: result.pages || 1
      }
      
      const totalQty = cartList.value.reduce((sum, item) => sum + item.quantity, 0)
      cartStore.updateTotalCount(totalQty)
    }
  } catch (error) {
    console.error('获取购物车列表失败:', error)
    ElMessage.error(error.message || '获取购物车列表失败')
  } finally {
    loading.value = false
  }
}

const handleSelectAll = (selected) => {
  cartList.value.forEach(item => {
    item.selected = selected
  })
}

const handleToggleSelection = (id, selected) => {
  const item = cartList.value.find(item => item.id === id)
  if (item) {
    item.selected = selected
  }
}

const handleUpdateQuantity = (id, quantity) => {
  const item = cartList.value.find(item => item.id === id)
  if (item) {
    item.quantity = quantity
  }
}

const handleRemoveItem = async (id) => {
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
    const index = cartList.value.findIndex(item => item.id === id)
    if (index > -1) {
      cartList.value.splice(index, 1)
      const totalQty = cartList.value.reduce((sum, item) => sum + item.quantity, 0)
      cartStore.updateTotalCount(totalQty)
    }
    ElMessage.success('商品已移除')
  } catch {
    // 用户取消删除
  }
}

const handleCheckout = () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  ElMessage.success('跳转到结算页面...')
}

const goShopping = () => {
  router.push('/')
}

const viewProductDetail = (productId) => {
  router.push(`/product/${productId}`)
}

onMounted(() => {
  fetchCartList()
})
</script>

<style lang="scss" scoped>
.cart-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0 0 40px;
}

.cart-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ========== 页面头部 ========== */
.cart-header {
  padding: 40px 0 32px;
  animation: slideDown 0.6s ease-out;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title-section {
    display: flex;
    align-items: center;
    gap: 20px;

    .icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
      animation: pulse 2s ease-in-out infinite;

      .cart-icon {
        font-size: 28px;
        color: white;
      }
    }

    .title-info {
      .page-title {
        font-size: 32px;
        font-weight: 700;
        color: #1a202c;
        margin: 0 0 6px 0;
        letter-spacing: -0.5px;
      }

      .page-subtitle {
        font-size: 14px;
        color: #718096;
        margin: 0;
      }
    }
  }

  .back-shop-btn {
    height: 44px;
    padding: 0 24px;
    border-radius: 12px;
    font-weight: 500;
    transition: all 0.3s;
    border: 2px solid #e2e8f0;
    background: white;
    color: #4a5568;

    &:hover {
      border-color: #667eea;
      color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .el-icon {
      margin-right: 6px;
    }
  }
}

/* ========== 主要内容区 ========== */
.cart-main {
  .cart-content {
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    min-height: 600px;
  }
}

/* ========== 空状态 ========== */
.empty-state {
  padding: 100px 24px;
  text-align: center;
  animation: fadeIn 0.8s ease-out;

  .empty-illustration {
    position: relative;
    display: inline-block;
    margin-bottom: 32px;

    .empty-icon-wrapper {
      width: 160px;
      height: 160px;
      margin: 0 auto;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 2;

      .empty-icon {
        font-size: 80px;
        color: #a0aec0;
      }
    }

    .empty-decoration {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea30 0%, #764ba230 100%);
      z-index: 1;
      animation: float 3s ease-in-out infinite;
    }
  }

  .empty-title {
    font-size: 24px;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 12px 0;
  }

  .empty-description {
    font-size: 16px;
    color: #a0aec0;
    margin: 0 0 40px 0;
  }

  .empty-actions {
    .go-shop-btn {
      height: 52px;
      padding: 0 40px;
      border-radius: 14px;
      font-size: 16px;
      font-weight: 600;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
      transition: all 0.3s;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
      }

      .el-icon {
        margin-right: 8px;
        font-size: 18px;
      }
    }
  }
}

/* ========== 商品列表 ========== */
.cart-list-container {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 0;
}

.products-section {
  border-right: 1px solid #e2e8f0;

  .section-header {
    background: #f7fafc;
    border-bottom: 2px solid #e2e8f0;
    padding: 0;

    .header-row {
      display: grid;
      grid-template-columns: 60px 1fr 140px 140px 140px 100px;
      gap: 20px;
      align-items: center;
      padding: 20px 32px;
      font-weight: 600;
      color: #4a5568;
      font-size: 14px;

      .col-checkbox {
        .select-all {
          :deep(.el-checkbox__label) {
            font-weight: 600;
          }
        }
      }
    }
  }

  .products-list {
    .product-card {
      border-bottom: 1px solid #edf2f7;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: white;
      animation: slideIn 0.4s ease-out;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: #fafbfc;
        transform: translateX(4px);
      }

      &.selected {
        background: linear-gradient(90deg, #f0f4ff 0%, #ffffff 100%);
        border-left: 4px solid #667eea;
      }

      .card-row {
        display: grid;
        grid-template-columns: 60px 1fr 140px 140px 140px 100px;
        gap: 20px;
        align-items: center;
        padding: 24px 32px;

        .col-checkbox {
          display: flex;
          justify-content: center;
        }

        .col-info {
          cursor: pointer;
          display: flex;
          gap: 20px;
          align-items: center;
          transition: all 0.3s;

          &:hover {
            .product-image-wrapper {
              transform: scale(1.05);
              box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);

              .image-overlay {
                opacity: 1;
              }
            }
          }

          .product-image-wrapper {
            position: relative;
            width: 120px;
            height: 120px;
            border-radius: 12px;
            overflow: hidden;
            flex-shrink: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

            .product-image {
              width: 100%;
              height: 100%;
            }

            .image-placeholder {
              width: 100%;
              height: 100%;
              background: #f7fafc;
              display: flex;
              align-items: center;
              justify-content: center;

              .el-icon {
                font-size: 40px;
                color: #cbd5e0;
              }
            }

            .image-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(102, 126, 234, 0.9);
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: opacity 0.3s;
              color: white;
              font-weight: 600;
              font-size: 14px;
            }
          }

          .product-details {
            flex: 1;
            min-width: 0;

            .product-name {
              font-size: 16px;
              font-weight: 600;
              color: #2d3748;
              margin: 0 0 12px 0;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              line-height: 1.5;
            }

            .product-sku {
              margin-bottom: 10px;

              .sku-tag {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                font-weight: 500;
                padding: 2px 10px;
              }
            }

            .product-meta {
              font-size: 12px;
              color: #a0aec0;

              .meta-label {
                font-weight: 500;
              }
            }
          }
        }

        .col-price {
          .price-wrapper {
            display: flex;
            flex-direction: column;
            gap: 6px;
            align-items: flex-start;

            .current-price {
              font-size: 20px;
              font-weight: 700;
              color: #f56565;
            }

            .original-price {
              font-size: 14px;
              color: #a0aec0;
              text-decoration: line-through;
            }

            .discount-tag {
              background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
              border: none;
              font-weight: 600;
            }
          }
        }

        .col-quantity {
          .quantity-input {
            width: 120px;

            :deep(.el-input__wrapper) {
              border-radius: 8px;
              box-shadow: 0 0 0 1px #e2e8f0 inset;
              transition: all 0.3s;

              &:hover {
                box-shadow: 0 0 0 1px #667eea inset;
              }
            }
          }
        }

        .col-total {
          .total-price {
            font-size: 20px;
            font-weight: 700;
            color: #2d3748;
          }
        }

        .col-action {
          .remove-btn {
            color: #a0aec0;
            font-size: 14px;
            transition: all 0.3s;
            padding: 8px 12px;
            border-radius: 8px;

            .el-icon {
              margin-right: 4px;
            }

            &:hover {
              color: #f56565;
              background: #fff5f5;
            }
          }
        }
      }
    }
  }
}

/* ========== 结算区域 ========== */
.checkout-section {
  background: #f7fafc;
  padding: 32px;

  .checkout-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    position: sticky;
    top: 24px;

    .checkout-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 24px;

      .checkout-title {
        font-size: 20px;
        font-weight: 700;
        color: white;
        margin: 0;
      }
    }

    .checkout-body {
      padding: 24px;

      .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        font-size: 15px;

        .summary-label {
          color: #718096;
        }

        .summary-value {
          color: #2d3748;
          font-weight: 500;

          &.price-highlight {
            color: #f56565;
            font-size: 18px;
          }

          &.discount {
            color: #48bb78;
          }
        }
      }

      .summary-divider {
        height: 1px;
        background: #e2e8f0;
        margin: 16px 0;
      }

      .total-row {
        .summary-label {
          font-size: 16px;
          font-weight: 600;
          color: #4a5568;
        }

        .total-amount {
          display: flex;
          align-items: baseline;

          .currency {
            font-size: 20px;
            color: #f56565;
            margin-right: 2px;
          }

          .amount {
            font-size: 32px;
            font-weight: 700;
            color: #f56565;
            letter-spacing: -1px;
          }
        }
      }
    }

    .checkout-footer {
      padding: 24px;
      background: #f7fafc;
      border-top: 1px solid #e2e8f0;

      .checkout-btn {
        width: 100%;
        height: 56px;
        border-radius: 12px;
        font-size: 18px;
        font-weight: 600;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        transition: all 0.3s;

        &:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 36px rgba(102, 126, 234, 0.5);
        }

        &:disabled {
          background: #cbd5e0;
          box-shadow: none;
          cursor: not-allowed;
        }

        .btn-icon {
          margin-left: 8px;
          font-size: 20px;
        }
      }

      .checkout-tip {
        margin: 16px 0 0 0;
        font-size: 13px;
        color: #a0aec0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;

        .el-icon {
          font-size: 16px;
        }
      }
    }
  }
}

/* ========== 动画 ========== */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.8;
  }
}

/* ========== 列表过渡动画 ========== */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ========== 淡入淡出动画 ========== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ========== 响应式设计 ========== */
@media (max-width: 1200px) {
  .cart-list-container {
    grid-template-columns: 1fr;
  }

  .products-section {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }

  .checkout-section {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .cart-page {
    padding: 0 0 24px;
  }

  .cart-wrapper {
    padding: 0 16px;
  }

  .cart-header {
    padding: 24px 0 20px;

    .title-section {
      .icon-wrapper {
        width: 44px;
        height: 44px;

        .cart-icon {
          font-size: 22px;
        }
      }

      .title-info {
        .page-title {
          font-size: 24px;
        }
      }
    }
  }

  .products-section {
    .section-header {
      .header-row {
        grid-template-columns: 40px 1fr 100px 100px;
        gap: 12px;
        padding: 16px 20px;

        .col-price,
        .col-total {
          display: none;
        }
      }
    }

    .products-list {
      .product-card {
        .card-row {
          grid-template-columns: 40px 1fr;
          gap: 16px;
          padding: 20px;

          .col-checkbox {
            grid-row: 1;
            grid-column: 1;
          }

          .col-info {
            grid-row: 1;
            grid-column: 2;

            .product-image-wrapper {
              width: 80px;
              height: 80px;
            }
          }

          .col-price {
            grid-row: 2;
            grid-column: 1 / span 2;
            justify-self: flex-start;
          }

          .col-quantity {
            grid-row: 3;
            grid-column: 1 / span 2;
            justify-self: flex-start;
          }

          .col-total {
            grid-row: 4;
            grid-column: 1 / span 2;
            justify-self: flex-start;

            .total-price {
              font-size: 24px;
              color: #f56565;
            }
          }

          .col-action {
            grid-row: 2;
            grid-column: 2;
            justify-self: flex-end;
            align-self: flex-start;
          }
        }
      }
    }
  }

  .checkout-section {
    .checkout-card {
      .checkout-body {
        .total-row {
          .total-amount {
            .amount {
              font-size: 28px;
            }
          }
        }
      }

      .checkout-footer {
        .checkout-btn {
          height: 48px;
          font-size: 16px;
        }
      }
    }
  }
}
</style>
