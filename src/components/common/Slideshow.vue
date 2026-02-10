<template>
    <div class="carousel-wrapper" v-if="banners.length > 0">
        <div class="carousel-viewport" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
            <div class="carousel-track" :style="{
                transform: `translateX(-${currentIndex * 100}%)`,
                background: `linear-gradient(to bottom, #f8f9fa 0%, #f8f9fa 15%, ${currentBanner.backgroundColor || '#FFF9F0'} 45%, ${currentBanner.backgroundColor || '#FFF9F0'} 100%)`
            }">
                <div v-for="(banner, index) in banners" :key="banner.id || index" class="slide-item"
                    :class="{ active: currentIndex === index }">
                    <div class="slide-content">
                        <div class="image-section">
                            <div class="polaroid-card">
                                <img :src="banner.image" :alt="banner.title" class="product-img">
                                <div class="card-label">Sweet Life 🐾</div>
                            </div>
                        </div>

                        <div class="info-section">
                            <transition name="slide-up">
                                <div v-if="currentIndex === index">
                                    <span class="tag" :style="{ background: banner.themeColor || '#FFCF81' }">
                                        {{ banner.tag || '精选推荐' }}
                                    </span>
                                    <h2 class="title">{{ banner.title }}</h2>
                                    <p class="subtitle">{{ banner.subtitle }}</p>
                                    <button class="action-btn" @click="handleBannerClick(banner)"
                                        :style="{ background: '#333' }">
                                        {{ banner.buttonText || '立即购买' }}
                                    </button>
                                </div>
                            </transition>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pagination">
                <span v-for="(_, i) in banners" :key="i" class="dot" :class="{ active: currentIndex === i }"
                    :style="{ background: currentIndex === i ? (currentBanner.themeColor || '#FFCF81') : '#ddd' }"
                    @click="goTo(i)"></span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    banners: { type: Array, default: () => [] },
    interval: { type: Number, default: 5000 }
})

const emit = defineEmits(['click'])
const currentIndex = ref(0)
let timer = null
let touchStartX = 0

const currentBanner = computed(() => props.banners[currentIndex.value] || {})

// 自动播放逻辑
const startTimer = () => {
    stopTimer()
    if (props.banners.length > 1) {
        timer = setInterval(() => {
            currentIndex.value = (currentIndex.value + 1) % props.banners.length
        }, props.interval)
    }
}

const stopTimer = () => {
    if (timer) clearInterval(timer)
}

const goTo = (i) => {
    currentIndex.value = i
    startTimer()
}

// 触摸滑动逻辑
const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX
    stopTimer()
}

const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX
    const delta = touchStartX - touchEndX
    if (Math.abs(delta) > 50) {
        if (delta > 0) {
            currentIndex.value = (currentIndex.value + 1) % props.banners.length
        } else {
            currentIndex.value = (currentIndex.value - 1 + props.banners.length) % props.banners.length
        }
    }
    startTimer()
}

const handleBannerClick = (banner) => {
    emit('click', banner)
}

onMounted(() => startTimer())
onUnmounted(() => stopTimer())
</script>

<style lang="scss" scoped>
.carousel-wrapper {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    position: relative;
    /* 全屏模式通常不需要圆角，如需圆角可改为 0 */
    border-radius: 0px;
}

.carousel-viewport {
    width: 100%;
    height: 100%;
    position: relative;
    /* 配合页面导航栏位移，根据实际 Header 高度调整 */
    top: -64px;
}

.carousel-track {
    display: flex;
    width: 100%;
    height: 100%;
    /* 渐变过渡平滑化 */
    transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), background 0.8s ease-in-out;
}

.slide-item {
    flex: 0 0 100%;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 10%;
    /* 必须透明以显示 track 的渐变背景 */
    background: transparent;
}

.slide-content {
    display: flex;
    align-items: center;
    gap: 60px;
    max-width: 1100px;
    width: 100%;
    /* 调整由于 viewport 位移带来的视觉中心偏差 */
    padding-top: 64px;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 30px;
        text-align: center;
    }
}

/* 拍立得效果 */
.image-section {
    flex-shrink: 0;

    .polaroid-card {
        background: white;
        padding: 12px 12px 40px 12px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        transform: rotate(-2deg);
        animation: float 4s ease-in-out infinite;

        .product-img {
            width: 320px;
            height: 420px;
            object-fit: cover;
            border-radius: 2px;
            display: block;

            @media (max-width: 992px) {
                width: 260px;
                height: 340px;
            }
        }

        .card-label {
            position: absolute;
            bottom: 12px;
            left: 50%;
            transform: translateX(-50%);
            font-family: 'Courier New', Courier, monospace;
            color: #bbb;
            font-size: 14px;
            letter-spacing: 1px;
        }
    }
}

/* 文案部分 */
.info-section {
    flex: 1;

    .tag {
        display: inline-block;
        padding: 6px 16px;
        color: white;
        border-radius: 50px;
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 20px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }

    .title {
        font-size: 4rem;
        color: #222;
        line-height: 1.1;
        margin-bottom: 20px;
        font-weight: 800;

        @media (max-width: 768px) {
            font-size: 2.5rem;
        }
    }

    .subtitle {
        font-size: 1.2rem;
        color: #555;
        margin-bottom: 40px;
        max-width: 400px;
        line-height: 1.6;

        @media (max-width: 768px) {
            margin-left: auto;
            margin-right: auto;
        }
    }

    .action-btn {
        padding: 16px 45px;
        border: none;
        color: white;
        border-radius: 50px;
        font-weight: bold;
        font-size: 16px;
        cursor: pointer;
        transition: 0.3s;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);

        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }
    }
}

/* 分页器 */
.pagination {
    position: absolute;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;
    z-index: 10;

    .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        cursor: pointer;
        transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        background: rgba(0, 0, 0, 0.1);

        &.active {
            width: 30px;
            border-radius: 5px;
        }
    }
}

/* 动画 */
@keyframes float {

    0%,
    100% {
        transform: rotate(-2deg) translateY(0);
    }

    50% {
        transform: rotate(1deg) translateY(-15px);
    }
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from {
    opacity: 0;
    transform: translateY(40px);
}

.slide-up-leave-to {
    opacity: 0;
    transform: translateY(-40px);
}
</style>