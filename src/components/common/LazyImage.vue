<template>
  <div 
    class="lazy-image" 
    :class="imageClass"
    :style="containerStyle"
    ref="containerRef"
  >
    <!-- 占位符 -->
    <div 
      v-if="!loaded && !error" 
      class="image-placeholder"
      :style="placeholderStyle"
    >
      <div class="placeholder-content">
        <el-icon v-if="showPlaceholderIcon" class="placeholder-icon">
          <Picture />
        </el-icon>
        <div v-if="showPlaceholderText" class="placeholder-text">
          {{ placeholderText }}
        </div>
      </div>
    </div>

    <!-- 加载中状态 -->
    <div 
      v-if="loading" 
      class="image-loading"
      :style="placeholderStyle"
    >
      <div class="loading-content">
        <el-icon class="loading-icon">
          <Loading />
        </el-icon>
        <div class="loading-text">加载中...</div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div 
      v-if="error" 
      class="image-error"
      :style="placeholderStyle"
    >
      <div class="error-content">
        <el-icon class="error-icon">
          <PictureFilled />
        </el-icon>
        <div class="error-text">{{ errorText }}</div>
        <el-button 
          v-if="showRetry"
          size="small" 
          @click="handleRetry"
          :loading="retrying"
        >
          重试
        </el-button>
      </div>
    </div>

    <!-- 实际图片 -->
    <img
      v-show="loaded && !error"
      :src="currentSrc"
      :alt="alt"
      :class="imgClass"
      :style="imgStyle"
      @load="handleLoad"
      @error="handleError"
      ref="imgRef"
    />

    <!-- 渐进式加载效果 -->
    <Transition name="image-fade">
      <div 
        v-if="loaded && !error && showTransition" 
        class="image-overlay"
      />
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Picture, PictureFilled, Loading } from '@element-plus/icons-vue'

/**
 * 组件属性
 */
const props = defineProps({
  /** 图片源地址 */
  src: {
    type: String,
    required: true
  },
  /** 备用图片地址 */
  fallback: {
    type: String,
    default: ''
  },
  /** 图片描述 */
  alt: {
    type: String,
    default: ''
  },
  /** 图片宽度 */
  width: {
    type: [String, Number],
    default: 'auto'
  },
  /** 图片高度 */
  height: {
    type: [String, Number],
    default: 'auto'
  },
  /** 是否启用懒加载 */
  lazy: {
    type: Boolean,
    default: true
  },
  /** 懒加载阈值（像素） */
  threshold: {
    type: Number,
    default: 100
  },
  /** 占位符背景色 */
  placeholderColor: {
    type: String,
    default: '#f5f5f5'
  },
  /** 占位符文本 */
  placeholderText: {
    type: String,
    default: ''
  },
  /** 错误文本 */
  errorText: {
    type: String,
    default: '图片加载失败'
  },
  /** 是否显示占位符图标 */
  showPlaceholderIcon: {
    type: Boolean,
    default: true
  },
  /** 是否显示占位符文本 */
  showPlaceholderText: {
    type: Boolean,
    default: false
  },
  /** 是否显示重试按钮 */
  showRetry: {
    type: Boolean,
    default: true
  },
  /** 是否显示过渡动画 */
  showTransition: {
    type: Boolean,
    default: true
  },
  /** 图片适应方式 */
  objectFit: {
    type: String,
    default: 'cover',
    validator: (value) => ['fill', 'contain', 'cover', 'none', 'scale-down'].includes(value)
  },
  /** 图片圆角 */
  borderRadius: {
    type: [String, Number],
    default: '0'
  },
  /** 自定义类名 */
  customClass: {
    type: String,
    default: ''
  }
})

/**
 * 组件事件
 */
const emit = defineEmits(['load', 'error', 'retry'])

// 响应式数据
const containerRef = ref(null)
const imgRef = ref(null)
const loaded = ref(false)
const loading = ref(false)
const error = ref(false)
const retrying = ref(false)
const inView = ref(false)
const currentSrc = ref('')
const observer = ref(null)

/**
 * 容器样式
 */
const containerStyle = computed(() => {
  const style = {}
  
  if (props.width !== 'auto') {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  
  if (props.height !== 'auto') {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  
  return style
})

/**
 * 占位符样式
 */
const placeholderStyle = computed(() => {
  return {
    backgroundColor: props.placeholderColor,
    borderRadius: typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius
  }
})

/**
 * 图片样式
 */
const imgStyle = computed(() => {
  return {
    objectFit: props.objectFit,
    borderRadius: typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius
  }
})

/**
 * 图片类名
 */
const imgClass = computed(() => {
  return [
    'lazy-img',
    {
      'img-loaded': loaded.value
    }
  ]
})

/**
 * 容器类名
 */
const imageClass = computed(() => {
  return [
    {
      'lazy-image--loading': loading.value,
      'lazy-image--loaded': loaded.value,
      'lazy-image--error': error.value
    },
    props.customClass
  ]
})

/**
 * 开始加载图片
 */
const startLoading = () => {
  if (loading.value || loaded.value) return
  
  loading.value = true
  error.value = false
  currentSrc.value = props.src
}

/**
 * 处理图片加载成功
 */
const handleLoad = () => {
  loading.value = false
  loaded.value = true
  error.value = false
  
  emit('load', {
    src: currentSrc.value,
    element: imgRef.value
  })
}

/**
 * 处理图片加载失败
 */
const handleError = () => {
  loading.value = false
  error.value = true
  
  // 尝试使用备用图片
  if (props.fallback && currentSrc.value !== props.fallback) {
    currentSrc.value = props.fallback
    error.value = false
    loading.value = true
    return
  }
  
  emit('error', {
    src: currentSrc.value,
    element: imgRef.value
  })
}

/**
 * 处理重试
 */
const handleRetry = async () => {
  retrying.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    loaded.value = false
    error.value = false
    startLoading()
    
    emit('retry', {
      src: props.src
    })
  } finally {
    retrying.value = false
  }
}

/**
 * 创建 Intersection Observer
 */
const createObserver = () => {
  if (!props.lazy || !containerRef.value) return
  
  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          inView.value = true
          startLoading()
          observer.value?.unobserve(entry.target)
        }
      })
    },
    {
      rootMargin: `${props.threshold}px`
    }
  )
  
  observer.value.observe(containerRef.value)
}

/**
 * 销毁 Observer
 */
const destroyObserver = () => {
  if (observer.value) {
    observer.value.disconnect()
    observer.value = null
  }
}

/**
 * 重置状态
 */
const reset = () => {
  loaded.value = false
  loading.value = false
  error.value = false
  retrying.value = false
  currentSrc.value = ''
}

// 监听 src 变化
watch(() => props.src, (newSrc) => {
  if (newSrc) {
    reset()
    if (!props.lazy) {
      startLoading()
    } else {
      nextTick(() => {
        createObserver()
      })
    }
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  if (!props.lazy) {
    startLoading()
  } else {
    createObserver()
  }
})

onUnmounted(() => {
  destroyObserver()
})

// 暴露方法给父组件
defineExpose({
  retry: handleRetry,
  reset,
  isLoaded: () => loaded.value,
  isLoading: () => loading.value,
  hasError: () => error.value
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.lazy-image {
  position: relative;
  display: inline-block;
  overflow: hidden;
  background: #f5f5f5;
  
  &.lazy-image--loading {
    .image-placeholder {
      opacity: 0.7;
    }
  }
  
  &.lazy-image--loaded {
    .image-placeholder,
    .image-loading {
      opacity: 0;
      pointer-events: none;
    }
  }
  
  &.lazy-image--error {
    .image-placeholder,
    .image-loading {
      display: none;
    }
  }
}

.image-placeholder,
.image-loading,
.image-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.placeholder-content,
.loading-content,
.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
  text-align: center;
  padding: $spacing-md;
}

.placeholder-icon,
.loading-icon,
.error-icon {
  font-size: 24px;
  color: #ccc;
  
  @media (max-width: $breakpoint-sm) {
    font-size: 20px;
  }
}

.loading-icon {
  color: $primary-color;
  animation: spin 1s linear infinite;
}

.error-icon {
  color: $error-color;
}

.placeholder-text,
.loading-text,
.error-text {
  font-size: $font-size-xs;
  color: #999;
  margin: 0;
  
  @media (max-width: $breakpoint-sm) {
    font-size: 10px;
  }
}

.error-text {
  color: $error-color;
  margin-bottom: $spacing-sm;
}

.lazy-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
  
  &.img-loaded {
    opacity: 1;
  }
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 2;
}

// 过渡动画
.image-fade-enter-active,
.image-fade-leave-active {
  transition: opacity 0.5s ease;
}

.image-fade-enter-from,
.image-fade-leave-to {
  opacity: 1;
}

.image-fade-enter-to,
.image-fade-leave-from {
  opacity: 0;
}

// 旋转动画
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式调整
@media (max-width: $breakpoint-sm) {
  .placeholder-content,
  .loading-content,
  .error-content {
    padding: $spacing-sm;
    gap: 4px;
  }
}

// 不同尺寸的占位符
.lazy-image {
  &.size-small {
    .placeholder-icon,
    .loading-icon,
    .error-icon {
      font-size: 16px;
    }
    
    .placeholder-text,
    .loading-text,
    .error-text {
      font-size: 10px;
    }
  }
  
  &.size-large {
    .placeholder-icon,
    .loading-icon,
    .error-icon {
      font-size: 32px;
    }
    
    .placeholder-text,
    .loading-text,
    .error-text {
      font-size: $font-size-sm;
    }
  }
}
</style>