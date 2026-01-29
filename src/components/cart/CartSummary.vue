<template>
  <div class="cart-summary">
    <div class="cart-summary__header">
      <h3 class="summary-title">订单汇总</h3>
      <div class="item-count">共{{ totalCount }}件商品</div>
    </div>

    <div class="cart-summary__content">
      <!-- 商品金额明细 -->
      <div class="summary-row">
        <span class="label">商品总价</span>
        <span class="value">¥{{ totalPrice.toFixed(2) }}</span>
      </div>

      <div class="summary-row" v-if="selectedCount !== totalCount">
        <span class="label">已选商品 ({{ selectedCount }}件)</span>
        <span class="value">¥{{ selectedTotalPrice.toFixed(2) }}</span>
      </div>

      <!-- 运费 -->
      <div class="summary-row">
        <span class="label">
          运费
          <el-tooltip content="满99元免运费" placement="top">
            <el-icon class="info-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </span>
        <span class="value" :class="{ 'free-shipping': isShippingFree }">
          {{ isShippingFree ? '免费' : `¥${shippingFee.toFixed(2)}` }}
        </span>
      </div>

      <!-- 优惠券 -->
      <div class="summary-row coupon-row" @click="showCouponDialog = true">
        <span class="label">
          <el-icon><Ticket /></el-icon>
          优惠券
        </span>
        <span class="value coupon-value">
          {{ selectedCoupon ? `-¥${selectedCoupon.discount.toFixed(2)}` : '选择优惠券' }}
          <el-icon><ArrowRight /></el-icon>
        </span>
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 合计 -->
      <div class="summary-row total-row">
        <span class="label">合计</span>
        <span class="value total-price">¥{{ finalPrice.toFixed(2) }}</span>
      </div>

      <!-- 节省金额 -->
      <div class="savings" v-if="totalSavings > 0">
        已为您节省 ¥{{ totalSavings.toFixed(2) }}
      </div>
    </div>

    <div class="cart-summary__actions">
      <!-- 全选控制 -->
      <div class="select-all">
        <el-checkbox 
          :model-value="isAllSelected" 
          @change="toggleSelectAll"
          :indeterminate="isIndeterminate"
        >
          全选
        </el-checkbox>
        <el-button 
          type="text" 
          size="small" 
          @click="clearSelected"
          v-if="selectedCount > 0"
          class="clear-selected"
        >
          删除选中
        </el-button>
      </div>

      <!-- 结算按钮 -->
      <el-button 
        type="primary" 
        size="large" 
        :disabled="selectedCount === 0"
        @click="checkout"
        class="checkout-btn"
      >
        结算 ({{ selectedCount }})
      </el-button>
    </div>

    <!-- 优惠券选择对话框 -->
    <el-dialog
      v-model="showCouponDialog"
      title="选择优惠券"
      width="400px"
      :before-close="handleCouponDialogClose"
    >
      <div class="coupon-list">
        <div 
          v-for="coupon in availableCoupons" 
          :key="coupon.id"
          class="coupon-item"
          :class="{ 'coupon-item--selected': selectedCoupon?.id === coupon.id }"
          @click="selectCoupon(coupon)"
        >
          <div class="coupon-info">
            <div class="coupon-title">{{ coupon.name }}</div>
            <div class="coupon-desc">{{ coupon.description }}</div>
            <div class="coupon-condition">满{{ coupon.minAmount }}元可用</div>
          </div>
          <div class="coupon-discount">
            <span class="discount-amount">¥{{ coupon.discount }}</span>
          </div>
        </div>
        <div 
          class="coupon-item"
          :class="{ 'coupon-item--selected': !selectedCoupon }"
          @click="selectCoupon(null)"
        >
          <div class="coupon-info">
            <div class="coupon-title">不使用优惠券</div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showCouponDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmCoupon">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElCheckbox, ElButton, ElDivider, ElTooltip, ElIcon, ElDialog } from 'element-plus'
import { QuestionFilled, Ticket, ArrowRight } from '@element-plus/icons-vue'

/**
 * 购物车汇总组件
 * @typedef {import('../../types/index.js').CartItem} CartItem
 */

const props = defineProps({
  /** @type {CartItem[]} */
  items: {
    type: Array,
    default: () => []
  },
  /** @type {CartItem[]} */
  selectedItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'select-all',
  'unselect-all', 
  'clear-selected',
  'checkout'
])

// 响应式数据
const showCouponDialog = ref(false)
const selectedCoupon = ref(null)
const tempSelectedCoupon = ref(null)

// 模拟优惠券数据
const availableCoupons = ref([
  {
    id: '1',
    name: '新用户专享',
    description: '首次购买立减',
    discount: 20,
    minAmount: 100
  },
  {
    id: '2', 
    name: '满减优惠',
    description: '购物满减',
    discount: 50,
    minAmount: 300
  },
  {
    id: '3',
    name: '限时特惠',
    description: '限时优惠券',
    discount: 30,
    minAmount: 200
  }
])

// 计算属性
const totalCount = computed(() => {
  return props.items.reduce((sum, item) => sum + item.quantity, 0)
})

const selectedCount = computed(() => {
  return props.selectedItems.reduce((sum, item) => sum + item.quantity, 0)
})

const totalPrice = computed(() => {
  return props.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
})

const selectedTotalPrice = computed(() => {
  return props.selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
})

const shippingFee = computed(() => {
  return selectedTotalPrice.value >= 99 ? 0 : 10
})

const isShippingFree = computed(() => {
  return selectedTotalPrice.value >= 99
})

const couponDiscount = computed(() => {
  if (!selectedCoupon.value) return 0
  if (selectedTotalPrice.value < selectedCoupon.value.minAmount) return 0
  return selectedCoupon.value.discount
})

const finalPrice = computed(() => {
  return Math.max(0, selectedTotalPrice.value + shippingFee.value - couponDiscount.value)
})

const totalSavings = computed(() => {
  const originalPrice = props.selectedItems.reduce((sum, item) => {
    const original = item.product.originalPrice || item.product.price
    return sum + original * item.quantity
  }, 0)
  return originalPrice - selectedTotalPrice.value + couponDiscount.value + (isShippingFree.value ? 10 : 0)
})

const isAllSelected = computed(() => {
  return props.items.length > 0 && props.selectedItems.length === props.items.length
})

const isIndeterminate = computed(() => {
  return props.selectedItems.length > 0 && props.selectedItems.length < props.items.length
})

// 方法
const toggleSelectAll = (selected) => {
  if (selected) {
    emit('select-all')
  } else {
    emit('unselect-all')
  }
}

const clearSelected = () => {
  emit('clear-selected')
}

const checkout = () => {
  if (selectedCount.value === 0) return
  emit('checkout', {
    items: props.selectedItems,
    totalPrice: selectedTotalPrice.value,
    shippingFee: shippingFee.value,
    couponDiscount: couponDiscount.value,
    finalPrice: finalPrice.value,
    coupon: selectedCoupon.value
  })
}

const selectCoupon = (coupon) => {
  tempSelectedCoupon.value = coupon
}

const confirmCoupon = () => {
  selectedCoupon.value = tempSelectedCoupon.value
  showCouponDialog.value = false
}

const handleCouponDialogClose = () => {
  tempSelectedCoupon.value = selectedCoupon.value
  showCouponDialog.value = false
}
</script>

<style lang="scss" scoped>
.cart-summary {
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .summary-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0;
    }

    .item-count {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }

  &__content {
    margin-bottom: 24px;

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 14px;

      .label {
        color: var(--el-text-color-regular);
        display: flex;
        align-items: center;
        gap: 4px;

        .info-icon {
          font-size: 12px;
          color: var(--el-text-color-placeholder);
          cursor: help;
        }
      }

      .value {
        color: var(--el-text-color-primary);
        font-weight: 500;

        &.free-shipping {
          color: var(--el-color-success);
        }
      }

      &.coupon-row {
        cursor: pointer;
        padding: 8px;
        border-radius: 6px;
        transition: background-color 0.3s;

        &:hover {
          background: var(--el-fill-color-light);
        }

        .label {
          color: var(--el-color-primary);
        }

        .coupon-value {
          color: var(--el-color-primary);
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }

      &.total-row {
        font-size: 16px;
        font-weight: 600;

        .total-price {
          color: var(--el-color-danger);
          font-size: 20px;
        }
      }
    }

    .savings {
      text-align: right;
      font-size: 12px;
      color: var(--el-color-success);
      margin-top: 8px;
    }
  }

  &__actions {
    .select-all {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .clear-selected {
        color: var(--el-color-danger);
      }
    }

    .checkout-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-dark-2) 100%);
      border: none;

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, var(--el-color-primary-light-3) 0%, var(--el-color-primary) 100%);
      }

      &:disabled {
        background: var(--el-color-info-light-5);
      }
    }
  }
}

// 优惠券列表样式
.coupon-list {
  max-height: 300px;
  overflow-y: auto;

  .coupon-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    &--selected {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    .coupon-info {
      flex: 1;

      .coupon-title {
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
      }

      .coupon-desc {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 4px;
      }

      .coupon-condition {
        font-size: 12px;
        color: var(--el-text-color-placeholder);
      }
    }

    .coupon-discount {
      .discount-amount {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-color-danger);
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .cart-summary {
    padding: 16px;
    margin-top: 16px;

    &__header {
      .summary-title {
        font-size: 16px;
      }
    }

    &__content {
      .summary-row {
        &.total-row {
          .total-price {
            font-size: 18px;
          }
        }
      }
    }

    &__actions {
      .checkout-btn {
        height: 44px;
        font-size: 14px;
      }
    }
  }
}
</style>