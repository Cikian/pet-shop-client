<template>
    <div class="home">
        <NetworkStatus />

        <ErrorBoundary :show-retry="true" :show-reload="true" :on-retry="handleRetry" @error="handleError">
            <section class="hero-section">
                <LoadingSkeleton v-if="bannersLoading" type="banner" :animated="true" />
                <Slideshow v-else :banners="banners" :interval="autoplayInterval" @click="handleBannerClick" />
            </section>

            <section class="category-section">
                <LoadingSkeleton v-if="categoriesLoading" type="category-grid" :count="6" :animated="true" />
                <CategoryGrid v-else :categories="categories" :columns="3" @category-click="handleCategoryClick" />
            </section>

            <section class="featured-section">
                <div class="section-header">
                    <h2 class="section-title">精选推荐</h2>
                    <p class="section-subtitle">为你精心挑选的优质商品</p>
                </div>

                <LoadingSkeleton v-if="productsLoading" type="product-list" :count="4" :animated="true" />
                <ProductCarousel v-else :products="featuredProducts" title="" subtitle="" :items-per-page="4"
                    :show-navigation="true" :show-indicators="true" @add-to-cart="handleAddToCart"
                    @product-click="handleProductClick" />
            </section>

            <section class="sale-section">
                <div class="section-header">
                    <h2 class="section-title">限时优惠</h2>
                    <p class="section-subtitle">错过就要等下次了</p>
                </div>

                <LoadingSkeleton v-if="productsLoading" type="product-list" :count="4" :animated="true" />
                <ProductCarousel v-else :products="saleProducts" title="" subtitle="" :items-per-page="4"
                    :show-navigation="true" :show-indicators="true" :autoplay="true" :autoplay-interval="6000"
                    @add-to-cart="handleAddToCart" @product-click="handleProductClick" />
            </section>
        </ErrorBoundary>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'

// 引入你刚刚保存的新组件
import Slideshow from '@/components/common/Slideshow.vue'

import CategoryGrid from '@/components/common/CategoryGrid.vue'
import ProductCarousel from '@/components/common/ProductCarousel.vue'
import LoadingSkeleton from '@/components/common/LoadingSkeleton.vue'
import ErrorBoundary from '@/components/common/ErrorBoundary.vue'
import NetworkStatus from '@/components/common/NetworkStatus.vue'

import { getSlideListApi, getHomeCategoriesApi, getHomeRecommendApi, getHomeDiscountApi } from '@/api/home'

const router = useRouter()
const cartStore = useCartStore()
const productStore = useProductStore()

// 响应式数据
const banners = ref([])
const categories = ref([])
const featuredProducts = ref([])
const saleProducts = ref([])
const bannersLoading = ref(true)
const categoriesLoading = ref(true)
const productsLoading = ref(true)
const autoplayInterval = ref(5000)

/**
 * 加载轮播图数据
 */
const loadBanners = async () => {
    try {
        bannersLoading.value = true
        const slideList = await getSlideListApi()

        const filteredSlides = slideList.filter(slide =>
            slide.status !== false && slide.delFlag !== true
        )

        const sortedSlides = filteredSlides.sort((a, b) => a.sortOrder - b.sortOrder)

        // 映射数据以匹配 Slideshow.vue 的 Props
        banners.value = sortedSlides.map((slide, index) => {
            // 为宠物用品设置一组柔和的主题色循环
            const themeColors = ['#FFCF81', '#74B9FF', '#A29BFE', '#55E6C1'];
            const bgColors = ['#FFF9F0', '#F0F7FF', '#F5F4FF', '#F0FFF9'];

            return {
                id: slide.id,
                title: slide.title || '精选好物',
                subtitle: slide.description || '给毛孩子更好的陪伴',
                image: slide.displayImg || slide.mainImg,
                tag: slide.tag || '宠物推荐',
                buttonText: slide.btnText || '立即查看',
                // 链接跳转逻辑
                link: slide.productId ? `/product/${slide.productId}` : (slide.categoryId ? `/category/${slide.categoryId}` : null),
                // 注入主题色和背景色
                themeColor: themeColors[index % themeColors.length],
                backgroundColor: bgColors[index % bgColors.length]
            }
        })
    } catch (error) {
        console.error('Failed to load banners:', error)
        if (error.status !== 401) {
            ElMessage.error('轮播图加载失败')
        }
        banners.value = []
    } finally {
        bannersLoading.value = false
    }
}

/**
 * 处理轮播图点击
 */
const handleBannerClick = (banner) => {
    if (banner.link) {
        router.push(banner.link)
    } else {
        ElMessage.info(`查看: ${banner.title}`)
    }
}

// ... 保持其他处理函数不变 (handleCategoryClick, handleAddToCart, 等)

const handleCategoryClick = (category) => {
    router.push({ name: 'Category', params: { id: category.id } })
}

const handleAddToCart = (product) => {
    try {
        cartStore.addItem(product, 1)
        ElMessage.success(`${product.name} 已添加到购物车`)
    } catch (error) {
        ElMessage.error('添加到购物车失败')
    }
}

const handleProductClick = (product) => {
    router.push({ name: 'Product', params: { id: product.id } })
}

const handleError = (errorInfo) => {
    ElMessage.error('页面加载出现问题')
}

const handleRetry = async () => {
    await initializeData()
}

const loadCategories = async () => {
    try {
        categoriesLoading.value = true
        const response = await getHomeCategoriesApi()
        console.log('API Response:', response)
        categories.value = response.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            image: category.imgUrl,
            status: category.status,
            onHome: category.onHome,
            delFlag: category.delFlag
        }))
    } catch (error) {
        console.error('Failed to load categories:', error)
        categories.value = []
    } finally {
        categoriesLoading.value = false
    }
}

const loadProducts = async () => {
    try {
        productsLoading.value = true
        const [recommendResponse, discountResponse] = await Promise.all([
            getHomeRecommendApi(),
            getHomeDiscountApi()
        ])
        featuredProducts.value = (recommendResponse || []).map(product => ({
            ...product,
            image: product.mainImg,
            rating: product.score,
            reviewCount: 0
        }))
        saleProducts.value = (discountResponse || []).map(product => ({
            ...product,
            image: product.mainImg,
            rating: product.score,
            reviewCount: 0
        }))
    } catch (error) {
        console.error('Failed to load products:', error)
        featuredProducts.value = []
        saleProducts.value = []
    } finally {
        productsLoading.value = false
    }
}

const initializeData = async () => {
    await Promise.allSettled([loadBanners(), loadCategories(), loadProducts()])
}

onMounted(() => {
    initializeData()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.home {
    min-height: 100vh;
    background: $background;
}

.hero-section {
    width: 100%;
    padding: 0; // 移除内边距让轮播图背景铺满
    margin-bottom: $spacing-2xl;

    @media (max-width: $breakpoint-md) {
        margin-bottom: $spacing-xl;
    }
}

// 保持其他样式不变...
.category-section {
    max-width: 1200px;
    margin: 0 auto $spacing-2xl auto;
    padding: 0 $spacing-lg;
}

.featured-section {
    max-width: 1200px;
    margin: 0 auto $spacing-2xl auto;
    padding: 0 $spacing-lg;
}

.sale-section {
    max-width: 1200px;
    margin: 0 auto $spacing-2xl auto;
    padding: 0 $spacing-lg;
}

.section-header {
    text-align: center;
    margin-bottom: $spacing-xl;
}

.section-title {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $text-primary;
}

.section-subtitle {
    font-size: $font-size-base;
    color: $text-secondary;
}
</style>