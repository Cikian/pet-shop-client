<template>
  <div class="product-page">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <div class="container">
        <el-breadcrumb separator="/" class="breadcrumb">
          <el-breadcrumb-item :to="{ name: 'Home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item 
            v-if="product?.category"
            :to="{ name: 'Category', params: { id: product.category } }"
          >
            {{ getCategoryName(product.category) }}
          </el-breadcrumb-item>
          <el-breadcrumb-item>{{ product?.name || '商品详情' }}</el-breadcrumb-item>
        </el-breadcrumb>
        
        <!-- 返回按钮 -->
        <div class="back-navigation">
          <el-button 
            type="text" 
            :icon="ArrowLeft" 
            @click="goBack"
            class="back-button"
          >
            返回
          </el-button>
        </div>
      </div>
    </div>

    <!-- 商品详情内容 -->
    <div class="product-content">
      <div class="container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="8" animated />
        </div>

        <!-- 商品不存在 -->
        <div v-else-if="!product" class="product-not-found">
          <el-empty 
            :image-size="120"
            description="商品不存在或已下架"
          >
            <template #image>
              <el-icon size="120" color="#c0c4cc">
                <Box />
              </el-icon>
            </template>
            <div class="not-found-actions">
              <el-button type="primary" @click="$router.push('/')">
                返回首页
              </el-button>
              <el-button @click="goBack">
                返回上一页
              </el-button>
            </div>
          </el-empty>
        </div>

        <!-- 商品详情 -->
        <div v-else class="product-detail">
          <div class="product-main">
            <!-- 商品图片 -->
            <div class="product-images">
              <div class="main-image">
                <LazyImage
                  :src="currentImage"
                  :alt="product.name"
                  fit="contain"
                  class="main-img"
                />
              </div>
              <div v-if="product.images && product.images.length > 1" class="image-thumbnails">
                <div
                  v-for="(image, index) in product.images"
                  :key="index"
                  class="thumbnail"
                  :class="{ active: currentImage === image }"
                  @click="currentImage = image"
                >
                  <LazyImage
                    :src="image"
                    :alt="`${product.name} ${index + 1}`"
                    fit="cover"
                    class="thumbnail-img"
                  />
                </div>
              </div>
            </div>

            <!-- 商品信息 -->
            <div class="product-info">
              <div class="product-header">
                <h1 class="product-title">{{ product.name }}</h1>
                <div class="product-meta">
                  <div class="rating">
                    <el-rate
                      :model-value="product.rating"
                      disabled
                      show-score
                      text-color="#ff9900"
                      score-template="{value} 分"
                    />
                    <span class="review-count">({{ product.reviewCount }} 评价)</span>
                  </div>
                  <div class="product-tags">
                    <el-tag
                      v-for="tag in product.tags"
                      :key="tag"
                      size="small"
                      type="info"
                      effect="plain"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
              </div>

              <div class="price-section">
                <div class="current-price">¥{{ product.price.toFixed(2) }}</div>
                <div v-if="product.originalPrice && product.originalPrice > product.price" class="original-price">
                  原价：¥{{ product.originalPrice.toFixed(2) }}
                </div>
                <div v-if="product.originalPrice && product.originalPrice > product.price" class="discount">
                  省 ¥{{ (product.originalPrice - product.price).toFixed(2) }}
                </div>
              </div>

              <div class="stock-section">
                <div class="stock-info">
                  <span class="stock-label">库存：</span>
                  <span 
                    class="stock-count"
                    :class="{ 'low-stock': product.stock < 10, 'out-of-stock': product.stock === 0 }"
                  >
                    {{ product.stock > 0 ? `${product.stock} 件` : '暂无库存' }}
                  </span>
                </div>
              </div>

              <div class="quantity-section">
                <div class="quantity-label">数量：</div>
                <el-input-number
                  v-model="selectedQuantity"
                  :min="1"
                  :max="product.stock"
                  :disabled="product.stock === 0"
                  size="large"
                />
              </div>

              <div class="action-section">
                <el-button
                  type="primary"
                  size="large"
                  :disabled="product.stock === 0"
                  @click="addToCart"
                  class="add-to-cart-btn"
                >
                  <el-icon><ShoppingCart /></el-icon>
                  {{ product.stock === 0 ? '暂无库存' : '加入购物车' }}
                </el-button>
                <el-button
                  size="large"
                  :icon="product.isFavorite ? StarFilled : Star"
                  @click="toggleFavorite"
                  class="favorite-btn"
                >
                  {{ product.isFavorite ? '已收藏' : '收藏' }}
                </el-button>
              </div>

              <div class="product-description">
                <h3>商品描述</h3>
                <p>{{ product.description }}</p>
              </div>
            </div>
          </div>

          <!-- 相关商品推荐 -->
          <div v-if="relatedProducts.length > 0" class="related-products">
            <h3 class="section-title">相关商品推荐</h3>
            <div class="related-grid">
              <ProductCard
                v-for="relatedProduct in relatedProducts"
                :key="relatedProduct.id"
                :product="relatedProduct"
                @click="viewProduct(relatedProduct.id)"
                @add-to-cart="handleAddToCart"
                @toggle-favorite="handleToggleFavorite"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 返回顶部按钮 -->
    <el-backtop :right="30" :bottom="80" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product.js'
import { useCartStore } from '@/stores/cart.js'
import { useNavigationStore } from '@/stores/navigation.js'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  StarFilled, 
  Box 
} from '@element-plus/icons-vue'
import LazyImage from '@/components/common/LazyImage.vue'
import ProductCard from '@/components/product/ProductCard.vue'

/**
 * 商品详情页面
 * 显示商品详细信息，支持加入购物车、收藏等功能
 * 需求: 2.3, 3.1
 */

// 路由和状态管理
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const navigationStore = useNavigationStore()

// 响应式数据
const loading = ref(false)
const selectedQuantity = ref(1)
const currentImage = ref('')

// 计算属性
const productId = computed(() => route.params.id)
const product = computed(() => productStore.getProductById(productId.value))
const relatedProducts = computed(() => {
  if (!product.value) return []
  return productStore.getRelatedProducts(product.value.id, 4)
})

// 方法
const getCategoryName = (categoryId) => {
  const category = productStore.getCategoryById(categoryId)
  return category?.name || '未知分类'
}

const goBack = () => {
  // 使用导航store的智能返回逻辑
  const backRoute = navigationStore.getSmartBackRoute(route)
  router.push(backRoute)
}

const addToCart = () => {
  if (!product.value || product.value.stock === 0) {
    ElMessage.warning('商品暂无库存')
    return
  }

  if (selectedQuantity.value > product.value.stock) {
    ElMessage.warning('选择数量超过库存')
    return
  }

  cartStore.addItem(product.value, selectedQuantity.value)
  ElMessage.success(`已添加 ${selectedQuantity.value} 件商品到购物车`)
  
  // 记录购物流程
  navigationStore.trackShoppingFlow('add_to_cart', {
    productId: product.value.id,
    productName: product.value.name,
    quantity: selectedQuantity.value,
    price: product.value.price
  })
  
  // 更新商品库存（模拟）
  productStore.updateProductStock({
    [product.value.id]: product.value.stock - selectedQuantity.value
  })
}

const toggleFavorite = () => {
  if (!product.value) return
  
  productStore.toggleFavorite(product.value.id)
  ElMessage.success(
    product.value.isFavorite ? '已添加到收藏' : '已取消收藏'
  )
}

const viewProduct = (productId) => {
  router.push({ name: 'Product', params: { id: productId } })
}

const handleAddToCart = (relatedProduct) => {
  cartStore.addItem(relatedProduct)
  ElMessage.success('已添加到购物车')
}

const handleToggleFavorite = (relatedProduct) => {
  productStore.toggleFavorite(relatedProduct.id)
  ElMessage.success(
    relatedProduct.isFavorite ? '已添加到收藏' : '已取消收藏'
  )
}

const initializeProduct = async () => {
  loading.value = true
  try {
    // 确保商品数据已加载
    if (productStore.products.length === 0) {
      await productStore.initialize()
    }

    // 设置当前图片
    if (product.value) {
      currentImage.value = product.value.image
      // 重置数量选择
      selectedQuantity.value = 1
    }
  } catch (error) {
    console.error('初始化商品详情失败:', error)
    ElMessage.error('商品信息加载失败')
  } finally {
    loading.value = false
  }
}

// 监听路由参数变化
watch(() => route.params.id, async (newId) => {
  if (route.name === 'Product' && newId) {
    await initializeProduct()
  }
}, { immediate: false })

// 生命周期
onMounted(async () => {
  await initializeProduct()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.product-page {
  min-height: 100vh;
  background: $background;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-md;
  
  @include max-width($breakpoint-sm) {
    padding: 0 $spacing-sm;
  }
}

// 面包屑导航
.breadcrumb-container {
  background: $card-background;
  border-bottom: 1px solid $border-color;
  padding: $spacing-md 0;
  
  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .breadcrumb {
    :deep(.el-breadcrumb__item) {
      .el-breadcrumb__inner {
        color: $text-secondary;
        font-size: $font-size-sm;
        
        &:hover {
          color: $primary-color;
        }
      }
      
      &:last-child .el-breadcrumb__inner {
        color: $text-primary;
        font-weight: 500;
      }
    }
  }
  
  .back-navigation {
    .back-button {
      color: $primary-color;
      font-weight: 500;
      
      &:hover {
        background: rgba($primary-color, 0.1);
      }
    }
  }
}

// 商品内容
.product-content {
  padding: $spacing-xl 0;
}

.loading-container {
  padding: $spacing-xl;
}

.product-not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  
  .not-found-actions {
    display: flex;
    gap: $spacing-sm;
    justify-content: center;
    margin-top: $spacing-lg;
  }
}

// 商品详情
.product-detail {
  .product-main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-2xl;
    margin-bottom: $spacing-2xl;
    
    @include max-width($breakpoint-lg) {
      grid-template-columns: 1fr;
      gap: $spacing-xl;
    }
  }
}

// 商品图片
.product-images {
  .main-image {
    background: $card-background;
    border-radius: 12px;
    padding: $spacing-lg;
    margin-bottom: $spacing-md;
    border: 1px solid $border-color;
    
    .main-img {
      width: 100%;
      height: 400px;
      
      @include max-width($breakpoint-sm) {
        height: 300px;
      }
    }
  }
  
  .image-thumbnails {
    display: flex;
    gap: $spacing-sm;
    overflow-x: auto;
    padding: $spacing-xs 0;
    
    .thumbnail {
      flex-shrink: 0;
      width: 80px;
      height: 80px;
      border-radius: 8px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: hidden;
      
      &:hover {
        border-color: $primary-color;
        transform: scale(1.05);
      }
      
      &.active {
        border-color: $primary-color;
        box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
      }
      
      .thumbnail-img {
        width: 100%;
        height: 100%;
      }
    }
  }
}

// 商品信息
.product-info {
  .product-header {
    margin-bottom: $spacing-lg;
    
    .product-title {
      font-size: $font-size-2xl;
      font-weight: 600;
      color: $text-primary;
      margin: 0 0 $spacing-md 0;
      line-height: 1.3;
      
      @include max-width($breakpoint-sm) {
        font-size: $font-size-xl;
      }
    }
    
    .product-meta {
      .rating {
        display: flex;
        align-items: center;
        gap: $spacing-sm;
        margin-bottom: $spacing-sm;
        
        .review-count {
          color: $text-secondary;
          font-size: $font-size-sm;
        }
      }
      
      .product-tags {
        display: flex;
        flex-wrap: wrap;
        gap: $spacing-xs;
      }
    }
  }
  
  .price-section {
    background: linear-gradient(135deg, rgba($primary-color, 0.1) 0%, rgba($accent-color, 0.1) 100%);
    padding: $spacing-lg;
    border-radius: 12px;
    margin-bottom: $spacing-lg;
    
    .current-price {
      font-size: 32px;
      font-weight: 700;
      color: $accent-color;
      margin-bottom: $spacing-xs;
    }
    
    .original-price {
      font-size: $font-size-base;
      color: $text-secondary;
      text-decoration: line-through;
      margin-bottom: $spacing-xs;
    }
    
    .discount {
      font-size: $font-size-sm;
      color: $success-color;
      font-weight: 600;
    }
  }
  
  .stock-section {
    margin-bottom: $spacing-lg;
    
    .stock-info {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      
      .stock-label {
        color: $text-secondary;
        font-weight: 500;
      }
      
      .stock-count {
        font-weight: 600;
        color: $success-color;
        
        &.low-stock {
          color: $warning-color;
        }
        
        &.out-of-stock {
          color: $error-color;
        }
      }
    }
  }
  
  .quantity-section {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-xl;
    
    .quantity-label {
      font-weight: 500;
      color: $text-primary;
    }
  }
  
  .action-section {
    display: flex;
    gap: $spacing-md;
    margin-bottom: $spacing-xl;
    
    .add-to-cart-btn {
      flex: 1;
      height: 48px;
      font-size: $font-size-base;
      font-weight: 600;
      border-radius: 24px;
      
      .el-icon {
        margin-right: $spacing-xs;
      }
    }
    
    .favorite-btn {
      height: 48px;
      padding: 0 $spacing-lg;
      border-radius: 24px;
      border: 1px solid $border-color;
      
      &:hover {
        border-color: $primary-color;
        color: $primary-color;
      }
    }
    
    @include max-width($breakpoint-sm) {
      flex-direction: column;
      
      .favorite-btn {
        flex: 1;
      }
    }
  }
  
  .product-description {
    h3 {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $text-primary;
      margin: 0 0 $spacing-md 0;
    }
    
    p {
      color: $text-secondary;
      line-height: 1.6;
      margin: 0;
    }
  }
}

// 相关商品
.related-products {
  .section-title {
    font-size: $font-size-xl;
    font-weight: 600;
    color: $text-primary;
    margin: 0 0 $spacing-lg 0;
    text-align: center;
  }
  
  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: $spacing-lg;
    
    @include max-width($breakpoint-sm) {
      grid-template-columns: repeat(2, 1fr);
      gap: $spacing-md;
    }
  }
}

// 动画效果
.product-detail {
  @include fade-in();
}

.product-images {
  @include slide-up();
  animation-delay: 0.1s;
}

.product-info {
  @include slide-up();
  animation-delay: 0.2s;
}

.related-products {
  @include fade-in();
  animation-delay: 0.3s;
}
</style>