<template>
    <div class="lazy-image" :class="imageClass" :style="containerStyle" ref="containerRef">
        <div v-if="!loaded && !error" class="image-placeholder" :style="placeholderStyle">
            <div v-if="loading" class="loading-content">
                <el-icon class="loading-icon">
                    <Loading />
                </el-icon>
                <div class="loading-text">加载中...</div>
            </div>
            <div v-else class="placeholder-content">
                <el-icon v-if="showPlaceholderIcon" class="placeholder-icon">
                    <Picture />
                </el-icon>
                <div v-if="showPlaceholderText" class="placeholder-text">{{ placeholderText }}</div>
            </div>
        </div>

        <div v-if="error" class="image-error" :style="placeholderStyle">
            <div class="error-content">
                <el-icon class="error-icon">
                    <PictureFilled />
                </el-icon>
                <div class="error-text">{{ errorText }}</div>
                <el-button v-if="showRetry" size="small" @click="handleRetry" :loading="retrying">重试</el-button>
            </div>
        </div>

        <img v-if="currentSrc" v-show="loaded && !error" :src="currentSrc" :alt="alt" :class="imgClass"
            :style="imgStyle" @load="handleLoad" @error="handleError" ref="imgRef" />

    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Picture, PictureFilled, Loading } from '@element-plus/icons-vue'

const props = defineProps({
    src: { type: String, required: true },
    fallback: { type: String, default: '' },
    alt: { type: String, default: '' },
    width: { type: [String, Number], default: 'auto' },
    height: { type: [String, Number], default: 'auto' },
    lazy: { type: Boolean, default: true },
    threshold: { type: Number, default: 100 },
    placeholderColor: { type: String, default: '#f5f5f5' },
    placeholderText: { type: String, default: '' },
    errorText: { type: String, default: '图片加载失败' },
    showPlaceholderIcon: { type: Boolean, default: true },
    showPlaceholderText: { type: Boolean, default: false },
    showRetry: { type: Boolean, default: true },
    showTransition: { type: Boolean, default: true },
    objectFit: {
        type: String,
        default: 'cover',
        validator: (v) => ['fill', 'contain', 'cover', 'none', 'scale-down'].includes(v)
    },
    borderRadius: { type: [String, Number], default: '0' },
    customClass: { type: String, default: '' }
})

const emit = defineEmits(['load', 'error', 'retry'])

const containerRef = ref(null)
const imgRef = ref(null)
const loaded = ref(false)
const loading = ref(false)
const error = ref(false)
const retrying = ref(false)
const currentSrc = ref('')
const observer = ref(null)

const containerStyle = computed(() => ({
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    borderRadius: typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius
}))

const placeholderStyle = computed(() => ({
    backgroundColor: props.placeholderColor,
    borderRadius: typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius
}))

const imgStyle = computed(() => ({
    objectFit: props.objectFit,
    borderRadius: typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius
}))

const imgClass = computed(() => ['lazy-img', { 'img-loaded': loaded.value }])
const imageClass = computed(() => [
    props.customClass,
    {
        'lazy-image--loading': loading.value,
        'lazy-image--loaded': loaded.value,
        'lazy-image--error': error.value
    }
])

const startLoading = () => {
    if (loaded.value || loading.value) return
    loading.value = true
    error.value = false
    currentSrc.value = props.src
}

const handleLoad = () => {
    loading.value = false
    loaded.value = true
    error.value = false
    emit('load', { src: currentSrc.value })
}

const handleError = () => {
    // 如果当前是主图加载失败，且有备用图，且还没尝试过备用图
    if (props.fallback && currentSrc.value !== props.fallback) {
        currentSrc.value = props.fallback
        return // 继续尝试加载 fallback
    }

    loading.value = false
    error.value = true
    emit('error', { src: currentSrc.value })
}

const handleRetry = async () => {
    retrying.value = true
    reset()
    await nextTick()
    startLoading()
    retrying.value = false
    emit('retry', { src: props.src })
}

const initObserver = () => {
    if (!props.lazy) {
        startLoading()
        return
    }

    observer.value = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            startLoading()
            observer.value?.disconnect()
        }
    }, { rootMargin: `${props.threshold}px` })

    if (containerRef.value) observer.value.observe(containerRef.value)
}

const reset = () => {
    loaded.value = false
    loading.value = false
    error.value = false
    currentSrc.value = ''
    if (observer.value) observer.value.disconnect()
}

watch(() => props.src, () => {
    reset()
    nextTick(() => initObserver())
})

onMounted(() => initObserver())
onUnmounted(() => observer.value?.disconnect())

defineExpose({ retry: handleRetry, reset })
</script>

<style lang="scss" scoped>
// 假设变量已定义，若报错请替换为具体数值
$spacing-sm: 8px;
$spacing-md: 16px;
$primary-color: #409eff;
$error-color: #f56c6c;

.lazy-image {
    position: relative;
    display: inline-block;
    overflow: hidden;
    background-color: #f5f5f5; // 基础底色
    vertical-align: middle;
}

.image-placeholder,
.image-loading,
.image-error {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
}

.placeholder-content,
.loading-content,
.error-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-md;
}

.loading-icon {
    font-size: 24px;
    color: $primary-color;
    animation: spin 1s linear infinite;
}

.lazy-img {
    display: block;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.4s ease-in-out;

    &.img-loaded {
        opacity: 1;
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

// 移除 overlay 相关的样式，因为它通常是灰色遮罩的罪魁祸首</style>