<template>
  <div class="error-boundary">
    <!-- 错误状态 -->
    <div v-if="hasError" class="error-content">
      <div class="error-icon">
        <el-icon size="64"><Warning /></el-icon>
      </div>
      
      <h3 class="error-title">{{ errorTitle }}</h3>
      <p class="error-message">{{ errorMessage }}</p>
      
      <!-- 错误详情（开发环境） -->
      <details v-if="showDetails && errorDetails" class="error-details">
        <summary>错误详情</summary>
        <pre>{{ errorDetails }}</pre>
      </details>
      
      <!-- 操作按钮 -->
      <div class="error-actions">
        <el-button 
          type="primary" 
          @click="handleRetry"
          :loading="retrying"
        >
          重试
        </el-button>
        <el-button 
          v-if="showReload"
          @click="handleReload"
        >
          刷新页面
        </el-button>
        <el-button 
          v-if="showGoBack"
          @click="handleGoBack"
        >
          返回上页
        </el-button>
      </div>
    </div>
    
    <!-- 正常内容 -->
    <slot v-else></slot>
  </div>
</template>

<script setup>
import { ref, onErrorCaptured, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Warning } from '@element-plus/icons-vue'

/**
 * 组件属性
 */
const props = defineProps({
  /** 错误标题 */
  title: {
    type: String,
    default: '出现了一些问题'
  },
  /** 错误消息 */
  message: {
    type: String,
    default: '页面加载失败，请稍后重试'
  },
  /** 是否显示重试按钮 */
  showRetry: {
    type: Boolean,
    default: true
  },
  /** 是否显示刷新页面按钮 */
  showReload: {
    type: Boolean,
    default: false
  },
  /** 是否显示返回按钮 */
  showGoBack: {
    type: Boolean,
    default: false
  },
  /** 是否显示错误详情 */
  showDetails: {
    type: Boolean,
    default: process.env.NODE_ENV === 'development'
  },
  /** 自定义重试函数 */
  onRetry: {
    type: Function,
    default: null
  }
})

/**
 * 组件事件
 */
const emit = defineEmits(['error', 'retry', 'reload', 'goBack'])

const router = useRouter()

// 响应式数据
const hasError = ref(false)
const error = ref(null)
const retrying = ref(false)

/**
 * 错误标题
 */
const errorTitle = computed(() => {
  if (error.value?.title) return error.value.title
  return props.title
})

/**
 * 错误消息
 */
const errorMessage = computed(() => {
  if (error.value?.message) return error.value.message
  return props.message
})

/**
 * 错误详情
 */
const errorDetails = computed(() => {
  if (!error.value) return null
  
  const details = []
  if (error.value.stack) details.push(`Stack: ${error.value.stack}`)
  if (error.value.componentStack) details.push(`Component Stack: ${error.value.componentStack}`)
  if (error.value.info) details.push(`Info: ${JSON.stringify(error.value.info, null, 2)}`)
  
  return details.join('\n\n')
})

/**
 * 捕获错误
 */
onErrorCaptured((err, instance, info) => {
  console.error('ErrorBoundary caught error:', err, info)
  
  hasError.value = true
  error.value = {
    message: err.message,
    stack: err.stack,
    componentStack: info,
    info: {
      componentName: instance?.$options.name || 'Unknown',
      timestamp: new Date().toISOString()
    }
  }
  
  emit('error', {
    error: err,
    instance,
    info
  })
  
  // 阻止错误继续传播
  return false
})

/**
 * 处理重试
 */
const handleRetry = async () => {
  retrying.value = true
  
  try {
    if (props.onRetry) {
      await props.onRetry()
    } else {
      // 默认重试逻辑：重置错误状态
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    hasError.value = false
    error.value = null
    emit('retry')
  } catch (retryError) {
    console.error('Retry failed:', retryError)
    error.value = {
      ...error.value,
      message: '重试失败，请稍后再试'
    }
  } finally {
    retrying.value = false
  }
}

/**
 * 处理页面刷新
 */
const handleReload = () => {
  emit('reload')
  window.location.reload()
}

/**
 * 处理返回上页
 */
const handleGoBack = () => {
  emit('goBack')
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

/**
 * 手动设置错误状态
 */
const setError = (errorInfo) => {
  hasError.value = true
  error.value = errorInfo
}

/**
 * 清除错误状态
 */
const clearError = () => {
  hasError.value = false
  error.value = null
}

// 暴露方法给父组件
defineExpose({
  setError,
  clearError,
  hasError: () => hasError.value
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.error-boundary {
  width: 100%;
  height: 100%;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: $spacing-2xl;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  @media (max-width: $breakpoint-md) {
    min-height: 300px;
    padding: $spacing-xl;
  }
}

.error-icon {
  color: $error-color;
  margin-bottom: $spacing-lg;
  
  .el-icon {
    font-size: 64px;
    
    @media (max-width: $breakpoint-md) {
      font-size: 48px;
    }
  }
}

.error-title {
  font-size: $font-size-xl;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 $spacing-md 0;
  
  @media (max-width: $breakpoint-md) {
    font-size: $font-size-lg;
  }
}

.error-message {
  font-size: $font-size-base;
  color: $text-secondary;
  margin: 0 0 $spacing-xl 0;
  max-width: 500px;
  line-height: 1.6;
  
  @media (max-width: $breakpoint-md) {
    font-size: $font-size-sm;
    margin-bottom: $spacing-lg;
  }
}

.error-details {
  width: 100%;
  max-width: 600px;
  margin-bottom: $spacing-xl;
  text-align: left;
  
  summary {
    cursor: pointer;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: $spacing-sm;
    
    &:hover {
      color: $primary-color;
    }
  }
  
  pre {
    background: #f8f9fa;
    border: 1px solid $border-color;
    border-radius: 6px;
    padding: $spacing-md;
    font-size: $font-size-xs;
    color: $text-secondary;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 200px;
    overflow-y: auto;
  }
}

.error-actions {
  display: flex;
  gap: $spacing-md;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (max-width: $breakpoint-sm) {
    flex-direction: column;
    width: 100%;
    max-width: 200px;
  }
}

// 不同类型的错误样式
.error-boundary {
  &.network-error {
    .error-icon {
      color: $warning-color;
    }
  }
  
  &.not-found-error {
    .error-icon {
      color: $text-secondary;
    }
  }
  
  &.permission-error {
    .error-icon {
      color: $error-color;
    }
  }
}

// 加载状态样式
.error-actions {
  .el-button.is-loading {
    pointer-events: none;
  }
}
</style>