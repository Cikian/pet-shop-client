<template>
  <div class="hero-banner">
    <div class="banner-container" ref="bannerContainer">
      <div 
        class="banner-track" 
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div 
          v-for="(banner, index) in banners" 
          :key="banner.id"
          class="banner-slide"
          :style="{ backgroundColor: banner.backgroundColor }"
        >
          <div class="banner-content">
            <div class="banner-text" :style="{ color: banner.textColor }">
              <h2 class="banner-title">{{ banner.title }}</h2>
              <p class="banner-subtitle">{{ banner.subtitle }}</p>
              <el-button 
                v-if="banner.buttonText"
                type="primary"
                size="large"
                class="banner-button"
                @click="handleBannerClick(banner)"
              >
                {{ banner.buttonText }}
              </el-button>
            </div>
            <div class="banner-image">
              <LazyImage
                :src="banner.image"
                :alt="banner.title"
                :fallback="defaultBannerImage"
                :width="'100%'"
                :height="'100%'"
                :lazy="index === 0 ? false : true"
                :threshold="100"
                :show-placeholder-icon="true"
                :show-retry="true"
                :object-fit="'cover'"
                :border-radius="8"
                @load="handleImageLoad"
                @error="handleImageError"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导航按钮 -->
    <button 
      class="nav-button nav-prev" 
      @click="prevSlide"
      :disabled="banners.length <= 1"
    >
      <el-icon><ArrowLeft /></el-icon>
    </button>
    <button 
      class="nav-button nav-next" 
      @click="nextSlide"
      :disabled="banners.length <= 1"
    >
      <el-icon><ArrowRight /></el-icon>
    </button>

    <!-- 指示器 -->
    <div class="banner-indicators" v-if="banners.length > 1">
      <button
        v-for="(banner, index) in banners"
        :key="banner.id"
        class="indicator"
        :class="{ active: index === currentIndex }"
        @click="goToSlide(index)"
      >
        <span class="sr-only">跳转到第{{ index + 1}}张轮播图</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import LazyImage from '@/components/common/LazyImage.vue'

/**
 * 组件属性
 */
const props = defineProps({
  /** 轮播图数据 */
  banners: {
    type: Array,
    default: () => []
  },
  /** 自动播放间隔（毫秒） */
  autoplayInterval: {
    type: Number,
    default: 5000
  },
  /** 是否启用自动播放 */
  autoplay: {
    type: Boolean,
    default: true
  }
})

/**
 * 组件事件
 */
const emit = defineEmits(['bannerClick'])

const router = useRouter()

// 响应式数据
const currentIndex = ref(0)
const bannerContainer = ref(null)
const autoplayTimer = ref(null)

// 触摸相关
const touchStartX = ref(0)
const touchEndX = ref(0)
const isDragging = ref(false)

// 计算属性
const defaultBannerImage = computed(() => {
  return 'https://via.placeholder.com/400x250/667eea/ffffff?text=轮播图'
})

/**
 * 下一张轮播图
 */
const nextSlide = () => {
  if (props.banners.length <= 1) return
  currentIndex.value = (currentIndex.value + 1) % props.banners.length
}

/**
 * 上一张轮播图
 */
const prevSlide = () => {
  if (props.banners.length <= 1) return
  currentIndex.value = currentIndex.value === 0 
    ? props.banners.length - 1 
    : currentIndex.value - 1
}

/**
 * 跳转到指定轮播图
 */
const goToSlide = (index) => {
  if (index >= 0 && index < props.banners.length) {
    currentIndex.value = index
  }
}

/**
 * 开始自动播放
 */
const startAutoplay = () => {
  if (!props.autoplay || props.banners.length <= 1) return
  
  stopAutoplay()
  autoplayTimer.value = setInterval(() => {
    nextSlide()
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
 * 处理轮播图点击
 */
const handleBannerClick = (banner) => {
  emit('bannerClick', banner)
  
  if (banner.link) {
    if (banner.link.startsWith('http')) {
      window.open(banner.link, '_blank')
    } else {
      router.push(banner.link)
    }
  }
}

/**
 * 处理图片加载成功
 */
const handleImageLoad = (event) => {
  console.log('Banner image loaded:', event.src)
}

/**
 * 处理图片加载失败
 */
const handleImageError = (event) => {
  console.error('Banner image failed to load:', event.src)
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
    if (diff > 0) {
      nextSlide()
    } else {
      prevSlide()
    }
  }
  
  isDragging.value = false
  startAutoplay()
}

// 生命周期
onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})

// 鼠标悬停时暂停自动播放
const handleMouseEnter = () => {
  stopAutoplay()
}

const handleMouseLeave = () => {
  startAutoplay()
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.hero-banner {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  @media (max-width: $breakpoint-md) {
    height: 300px;
    border-radius: 8px;
  }
  
  @media (max-width: $breakpoint-sm) {
    height: 250px;
    border-radius: 6px;
  }
}

.banner-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.banner-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.banner-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  position: relative;
  background: $primary-gradient;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-xl;
  
  @media (max-width: $breakpoint-lg) {
    padding: 0 $spacing-lg;
  }
  
  @media (max-width: $breakpoint-md) {
    flex-direction: column;
    justify-content: center;
    text-align: center;
    padding: $spacing-lg;
  }
}

.banner-text {
  flex: 1;
  max-width: 500px;
  
  @media (max-width: $breakpoint-md) {
    max-width: 100%;
    margin-bottom: $spacing-lg;
  }
}

.banner-title {
  font-size: $font-size-3xl;
  font-weight: 700;
  margin: 0 0 $spacing-md 0;
  line-height: 1.2;
  
  @media (max-width: $breakpoint-lg) {
    font-size: $font-size-2xl;
  }
  
  @media (max-width: $breakpoint-md) {
    font-size: $font-size-xl;
  }
}

.banner-subtitle {
  font-size: $font-size-lg;
  margin: 0 0 $spacing-xl 0;
  opacity: 0.9;
  line-height: 1.5;
  
  @media (max-width: $breakpoint-md) {
    font-size: $font-size-base;
    margin-bottom: $spacing-lg;
  }
}

.banner-button {
  font-size: $font-size-base;
  padding: $spacing-md $spacing-xl;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: $breakpoint-sm) {
    padding: $spacing-sm $spacing-lg;
    font-size: $font-size-sm;
  }
}

.banner-image {
  flex: 0 0 auto;
  max-width: 400px;
  height: 250px;
  
  @media (max-width: $breakpoint-lg) {
    max-width: 300px;
    height: 200px;
  }
  
  @media (max-width: $breakpoint-md) {
    max-width: 250px;
    height: 150px;
  }
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: $text-primary;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 2;
  
  &:hover:not(:disabled) {
    background: white;
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  @media (max-width: $breakpoint-sm) {
    width: 40px;
    height: 40px;
    display: none; // 移动端隐藏导航按钮，使用触摸滑动
  }
}

.nav-prev {
  left: $spacing-lg;
}

.nav-next {
  right: $spacing-lg;
}

.banner-indicators {
  position: absolute;
  bottom: $spacing-lg;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: $spacing-sm;
  z-index: 2;
}

.indicator {
  width: 12px;
  height: 12px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.active {
    background: white;
    transform: scale(1.2);
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.8);
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// 添加鼠标悬停暂停自动播放的事件监听
.hero-banner:hover {
  .nav-button {
    opacity: 1;
  }
}
</style>