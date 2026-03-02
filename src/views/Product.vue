<template>
    <div class="product-page">
        <div class="breadcrumb-container">
            <div class="container">
                <el-breadcrumb separator="/" class="breadcrumb">
                    <el-breadcrumb-item :to="{ name: 'Home' }">首页</el-breadcrumb-item>
                    <el-breadcrumb-item v-if="product?.category"
                        :to="{ name: 'Category', params: { id: product.category } }">
                        {{ getCategoryName(product.category) }}
                    </el-breadcrumb-item>
                    <el-breadcrumb-item>{{ product?.name || '商品详情' }}</el-breadcrumb-item>
                </el-breadcrumb>

                <div class="back-navigation">
                    <el-button type="text" :icon="ArrowLeft" @click="goBack" class="back-button">
                        返回
                    </el-button>
                </div>
            </div>
        </div>

        <div class="product-content">
            <div class="container">
                <div v-if="loading" class="loading-container">
                    <el-skeleton :rows="8" animated />
                </div>

                <div v-else-if="!product" class="product-not-found">
                    <el-empty :image-size="120" description="商品不存在或已下架">
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

                <div v-else class="product-detail">
                    <div class="product-main">
                        <div class="product-images">
                            <div class="main-image">
                                <LazyImage :src="currentImage" :alt="product.name" fit="contain" class="main-img" />
                            </div>
                            <div v-if="product.images && product.images.length > 1" class="image-thumbnails">
                                <div v-for="(image, index) in product.images" :key="index" class="thumbnail"
                                    :class="{ active: currentImage === image }" @click="currentImage = image">
                                    <LazyImage :src="image" :alt="`${product.name} ${index + 1}`" fit="cover"
                                        class="thumbnail-img" />
                                </div>
                            </div>
                        </div>

                        <div class="product-info">
                            <div class="product-header">
                                <h1 class="product-title">{{ product.name }}</h1>
                                <div class="product-meta">
                                    <div class="rating">
                                        <el-rate :model-value="product.rating" disabled show-score text-color="#ff9900"
                                            score-template="{value} 分" />
                                        <span class="review-count">({{ product.reviewCount }} 评价)</span>
                                    </div>
                                    <div class="product-tags">
                                        <el-tag v-for="tag in product.tags" :key="tag" size="small" type="info"
                                            effect="plain">
                                            {{ tag }}
                                        </el-tag>
                                    </div>
                                </div>
                            </div>

                            <div class="price-section">
                                <div class="current-price">¥{{ displayPrice.toFixed(2) }}</div>
                                <div v-if="product.originalPrice && product.originalPrice > displayPrice"
                                    class="original-price">
                                    原价：¥{{ product.originalPrice.toFixed(2) }}
                                </div>
                                <div v-if="product.originalPrice && product.originalPrice > displayPrice"
                                    class="discount">
                                    省 ¥{{ (product.originalPrice - displayPrice).toFixed(2) }}
                                </div>
                            </div>

                            <div class="specs-section" v-if="product.specs && product.specs.length">
                                <div v-for="spec in product.specs" :key="spec.name" class="spec-row">
                                    <div class="spec-label">{{ spec.name }}</div>
                                    <div class="spec-values">
                                        <button v-for="val in spec.values" :key="val" class="spec-item-btn" :class="{
                                            'is-active': selectedSpecs[spec.name] === val,
                                            'is-disabled': isOptionDisabled(spec.name, val)
                                        }" :disabled="isOptionDisabled(spec.name, val)" @click="handleSpecSelect(spec.name, val)">
                                            {{ val }}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="stock-section">
                                <div class="stock-info">
                                    <span class="stock-label">库存：</span>
                                    <span class="stock-count"
                                        :class="{ 'low-stock': displayStock < 10, 'out-of-stock': displayStock === 0 }">
                                        {{ displayStock > 0 ? `${displayStock} 件` : '暂无库存' }}
                                    </span>
                                </div>
                            </div>

                            <div class="quantity-section">
                                <div class="quantity-label">数量：</div>
                                <el-input-number v-model="selectedQuantity" :min="1" :max="displayStock || 1"
                                    :disabled="displayStock === 0" size="large" />
                            </div>

                            <div class="action-section">
                                <el-button type="primary" size="large"
                                    :disabled="!isAllSpecsSelected || displayStock === 0" @click="addToCart"
                                    class="add-to-cart-btn">
                                    <el-icon>
                                        <ShoppingCart />
                                    </el-icon>
                                    {{ displayStock === 0 ? '暂无库存' : (isAllSpecsSelected ? '加入购物车' : '请选择规格') }}
                                </el-button>
                                <el-button size="large" :icon="product.isFavorite ? StarFilled : Star"
                                    @click="toggleFavorite" class="favorite-btn">
                                    {{ product.isFavorite ? '已收藏' : '收藏' }}
                                </el-button>
                            </div>

                            <div class="product-description">
                                <h3>商品描述</h3>
                                <p>{{ product.description }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="related-products">
                        <h3 class="section-title">相关商品推荐</h3>
                        <div class="related-grid">
                            <div class="no-related-products">
                                <p>暂无相关商品推荐</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <el-backtop :right="30" :bottom="80" />
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product.js'
import { useCartStore } from '@/stores/cart.js'
import { useNavigationStore } from '@/stores/navigation.js'
import { productApi } from '@/api/product.js'
import { ElMessage } from 'element-plus'
import {
    ArrowLeft,
    ShoppingCart,
    Star,
    StarFilled,
    Box
} from '@element-plus/icons-vue'
import LazyImage from '@/components/common/LazyImage.vue'

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
const product = ref(null)

// --- SKU 核心逻辑 ---
const selectedSpecs = reactive({}) // { "形状": "L形" }
const pathDict = ref({}) // 路径字典，用于计算禁用状态

// 计算属性
const productId = computed(() => route.params.id)

// 是否选完了所有规格
const isAllSpecsSelected = computed(() => {
    if (!product.value?.specs) return true
    return product.value.specs.every(s => selectedSpecs[s.name])
})

// 查找匹配的 SKU 对象
const currentSku = computed(() => {
    if (!isAllSpecsSelected.value || !product.value?.skus) return null
    return product.value.skus.find(sku => {
        return sku.specs.every(s => selectedSpecs[s.key] === s.value)
    })
})

// 动态显示价格
const displayPrice = computed(() => {
    return currentSku.value ? currentSku.value.price : (product.value?.price || 0)
})

// 动态显示库存
const displayStock = computed(() => {
    return currentSku.value ? currentSku.value.stock : (product.value?.stock || 0)
})

// --- SKU 算法方法 ---

// 构建路径字典 (Power Set)
const buildPathDict = (skus) => {
    const dict = {}
    skus.forEach(sku => {
        if (sku.stock <= 0) return
        const tokens = sku.specs.map(s => `${s.key}:${s.value}`)
        // 获取子集
        const subsets = [[]]
        for (const token of tokens) {
            const size = subsets.length
            for (let i = 0; i < size; i++) {
                subsets.push([...subsets[i], token])
            }
        }
        subsets.forEach(subset => {
            if (subset.length === 0) return
            const key = subset.sort().join(';')
            dict[key] = true
        })
    })
    return dict
}

// 检查某个按钮是否应禁用
const isOptionDisabled = (specName, specValue) => {
    if (!product.value) return false
    // 模拟选中当前项后的路径组合
    const nextSelect = { ...selectedSpecs, [specName]: specValue }
    const tokens = Object.keys(nextSelect)
        .filter(k => nextSelect[k])
        .map(k => `${k}:${nextSelect[k]}`)

    const queryKey = tokens.sort().join(';')
    return !pathDict.value[queryKey]
}

const handleSpecSelect = (specName, specValue) => {
    if (selectedSpecs[specName] === specValue) {
        selectedSpecs[specName] = null
    } else {
        selectedSpecs[specName] = specValue
    }
}

// --- 基础业务逻辑 ---

const getCategoryName = (categoryId) => {
    const category = productStore.getCategoryById(categoryId)
    return category?.name || '未知分类'
}

const goBack = () => {
    const backRoute = navigationStore.getSmartBackRoute(route)
    router.push(backRoute)
}

const addToCart = () => {
    if (!product.value || displayStock.value === 0) {
        ElMessage.warning('商品暂无库存')
        return
    }

    if (!isAllSpecsSelected.value) {
        ElMessage.warning('请选择完整的商品规格')
        return
    }

    // 构建加入购物车的数据
    const cartItem = {
        ...product.value,
        price: displayPrice.value,
        skuId: currentSku.value?.id,
        skuName: currentSku.value?.specs.map(s => s.value).join(' ')
    }

    cartStore.addItem(cartItem, selectedQuantity.value)
    ElMessage.success(`已添加商品到购物车`)
}

const toggleFavorite = () => {
    if (!product.value) return
    product.value.isFavorite = !product.value.isFavorite
    ElMessage.success(product.value.isFavorite ? '已添加到收藏' : '已取消收藏')
}

const initializeProduct = async () => {
    loading.value = true
    try {
        const productData = await productApi.getProductDetail(productId.value)
        const allImages = [productData.mainImg, ...productData.images]

        // 初始化规格选中状态
        if (productData.specs) {
            productData.specs.forEach(s => selectedSpecs[s.name] = null)
            // 生成路径图
            pathDict.value = buildPathDict(productData.skus)
        }

        product.value = {
            ...productData,
            id: productData.id,
            name: productData.name,
            description: productData.description,
            image: productData.mainImg,
            images: allImages,
            category: productData.categoryId,
            price: productData.price,
            originalPrice: productData.originalPrice,
            stock: productData.stock,
            rating: productData.score,
            reviewCount: 0,
            tags: productData.tags,
            isFavorite: false,
            specs: productData.specs,
            skus: productData.skus
        }

        // 默认选中逻辑：选中第一个 SKU 的规格
        if (productData.skus && productData.skus.length > 0) {
            const defaultSku = productData.skus[0]
            defaultSku.specs.forEach(s => {
                selectedSpecs[s.key] = s.value
            })
        }

        currentImage.value = product.value.image
        selectedQuantity.value = 1
    } catch (error) {
        console.error('初始化失败:', error)
        ElMessage.error('商品信息加载失败')
    } finally {
        loading.value = false
    }
}

watch(() => route.params.id, async (newId) => {
    if (route.name === 'Product' && newId) {
        await initializeProduct()
    }
})

onMounted(initializeProduct)
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

/* 保持原有所有样式不动 */
.product-page {
    min-height: 100vh;
    background: $background;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 $spacing-md;
}

.breadcrumb-container {
    background: $card-background;
    border-bottom: 1px solid $border-color;
    padding: $spacing-md 0;

    .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .breadcrumb :deep(.el-breadcrumb__item) .el-breadcrumb__inner {
        color: $text-secondary;
        font-size: $font-size-sm;
    }
}

.product-content {
    padding: $spacing-xl 0;
}

.product-detail .product-main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-2xl;
    margin-bottom: $spacing-2xl;
}

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
        }
    }

    .image-thumbnails {
        display: flex;
        gap: $spacing-sm;
        overflow-x: auto;

        .thumbnail {
            flex-shrink: 0;
            width: 80px;
            height: 80px;
            border-radius: 8px;
            border: 2px solid transparent;
            cursor: pointer;
            overflow: hidden;
        }

        .thumbnail.active {
            border-color: $primary-color;
        }
    }
}

.product-info {
    .product-header .product-title {
        font-size: $font-size-2xl;
        font-weight: 600;
        color: $text-primary;
        margin-bottom: $spacing-md;
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
        }

        .original-price {
            text-decoration: line-through;
            color: $text-secondary;
        }
    }

    /* 【新增内容配套样式】规格选择器样式 - 延续你的风格 */
    .specs-section {
        margin-bottom: $spacing-lg;

        .spec-row {
            margin-bottom: $spacing-md;

            .spec-label {
                font-weight: 500;
                color: $text-secondary;
                margin-bottom: $spacing-xs;
                font-size: $font-size-sm;
            }

            .spec-values {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
        }
    }

    /* 规格按钮自定义样式，保持圆角和配色统一 */
    .spec-item-btn {
        padding: 8px 16px;
        border-radius: 20px;
        /* 延续 action-section 的圆角风格 */
        border: 1px solid $border-color;
        background: $card-background;
        color: $text-primary;
        font-size: $font-size-sm;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover:not(:disabled) {
            border-color: $primary-color;
            color: $primary-color;
        }

        &.is-active {
            background: $primary-color;
            border-color: $primary-color;
            color: #fff;
            font-weight: 600;
        }

        &.is-disabled {
            background: #f5f7fa;
            color: #c0c4cc;
            border-style: dashed;
            cursor: not-allowed;
        }
    }

    .stock-section {
        margin-bottom: $spacing-lg;

        .stock-label {
            color: $text-secondary;
        }

        .stock-count {
            font-weight: 600;
            color: $success-color;
        }
    }

    .quantity-section {
        display: flex;
        align-items: center;
        gap: $spacing-md;
        margin-bottom: $spacing-xl;
    }

    .action-section {
        display: flex;
        gap: $spacing-md;
        margin-bottom: $spacing-xl;

        .add-to-cart-btn {
            flex: 1;
            height: 48px;
            border-radius: 24px;
            font-weight: 600;
        }

        .favorite-btn {
            height: 48px;
            border-radius: 24px;
        }
    }
}

/* 原有动画 */
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
</style>