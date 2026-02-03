<template>
  <Transition name="offline-banner">
    <div 
      v-if="!isOnline" 
      class="offline-banner"
      :class="bannerClass"
    >
      <div class="offline-content">
        <el-icon class="offline-icon">
          <Connection />
        </el-icon>
        <div class="offline-text">
          <div class="offline-title">网络连接不可用</div>
          <div class="offline-message">{{ offlineMessage }}</div>
        </div>
        <el-button 
          v-if="showRetryButton"
          size="small" 
          type="primary" 
          @click="handleRetry"
          :loading="retrying"
        >
          重试
        </el-button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Connection } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'
import { watchNetworkStatus, checkNetworkStatus } from '@/utils/serviceWorker'

/**
 * 组件属性
 */
const props = defineProps({
  /** 是否显示重试按钮 */
  showRetryButton: {
    type: Boolean,
    default: true
  },
  /** 自定义离线消息 */
  customMessage: {
    type: String,
    default: ''
  },
  /** 横幅位置 */
  position: {
    type: String,
    default: 'top',
    validator: (value) => ['top', 'bottom'].includes(value)
  },
  /** 是否自动隐藏 */
  autoHide: {
    type: Boolean,
    default: false
  },
  /** 自动隐藏延迟（毫秒） */
  autoHideDelay: {
    type: Number,
    default: 5000
  }
})

/**
 * 组件事件
 */
const emit = defineEmits(['online', 'offline', 'retry'])

// 响应式数据
const isOnline = ref(navigator.onLine)
const retrying = ref(false)
const networkCleanup = ref(null)
const autoHideTimer = ref(null)

/**
 * 离线消息
 */
const offlineMessage = computed(() => {
  if (props.customMessage) {
    return props.customMessage
  }
  
  return '您当前处于离线状态，部分功能可能无法使用'
})

/**
 * 横幅样式类
 */
const bannerClass = computed(() => {
  return [
    `offline-banner--${props.position}`,
    {
      'offline-banner--auto-hide': props.autoHide
    }
  ]
})

/**
 * 处理网络状态变化
 */
const handleNetworkChange = ({ online }) => {
  const wasOnline = isOnline.value
  isOnline.value = online
  
  if (online && !wasOnline) {
    // 从离线恢复到在线
    console.log('网络连接已恢复')
    
    ElNotification({
      title: '网络已连接',
      message: '网络连接已恢复，您可以正常使用所有功能',
      type: 'success',
      duration: 3000
    })
    
    emit('online')
    clearAutoHideTimer()
  } else if (!online && wasOnline) {
    // 从在线变为离线
    console.log('网络连接已断开')
    
    ElNotification({
      title: '网络连接断开',
      message: '检测到网络连接中断，将使用缓存数据',
      type: 'warning',
      duration: 5000
    })
    
    emit('offline')
    startAutoHideTimer()
  }
}

/**
 * 处理重试
 */
const handleRetry = async () => {
  retrying.value = true
  
  try {
    // 等待一段时间模拟重试过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 检查网络状态
    const status = checkNetworkStatus()
    isOnline.value = status.online
    
    if (status.online) {
      ElNotification({
        title: '重试成功',
        message: '网络连接已恢复',
        type: 'success',
        duration: 3000
      })
    } else {
      ElNotification({
        title: '重试失败',
        message: '网络仍然不可用，请检查网络设置',
        type: 'error',
        duration: 3000
      })
    }
    
    emit('retry', { online: status.online })
  } catch (error) {
    console.error('重试失败:', error)
    
    ElNotification({
      title: '重试失败',
      message: '网络检查失败，请稍后再试',
      type: 'error',
      duration: 3000
    })
  } finally {
    retrying.value = false
  }
}

/**
 * 开始自动隐藏计时器
 */
const startAutoHideTimer = () => {
  if (!props.autoHide) return
  
  clearAutoHideTimer()
  
  autoHideTimer.value = setTimeout(() => {
    // 这里可以添加自动隐藏逻辑
    console.log('离线横幅自动隐藏')
  }, props.autoHideDelay)
}

/**
 * 清除自动隐藏计时器
 */
const clearAutoHideTimer = () => {
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value)
    autoHideTimer.value = null
  }
}

// 生命周期
onMounted(() => {
  // 初始化网络状态
  const status = checkNetworkStatus()
  isOnline.value = status.online
  
  // 监听网络状态变化
  networkCleanup.value = watchNetworkStatus(handleNetworkChange)
  
  // 如果初始状态是离线，启动自动隐藏计时器
  if (!isOnline.value) {
    startAutoHideTimer()
  }
  
  console.log('离线状态组件已初始化，当前网络状态:', status)
})

onUnmounted(() => {
  // 清理网络状态监听
  if (networkCleanup.value) {
    networkCleanup.value()
  }
  
  // 清理计时器
  clearAutoHideTimer()
})

// 暴露方法给父组件
defineExpose({
  isOnline: () => isOnline.value,
  retry: handleRetry,
  checkStatus: () => checkNetworkStatus()
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.offline-banner {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  &.offline-banner--top {
    top: 0;
  }
  
  &.offline-banner--bottom {
    bottom: 0;
  }
}

.offline-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md $spacing-lg;
  gap: $spacing-md;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: $breakpoint-md) {
    padding: $spacing-sm $spacing-md;
    gap: $spacing-sm;
  }
}

.offline-icon {
  font-size: 20px;
  flex-shrink: 0;
  
  @media (max-width: $breakpoint-sm) {
    font-size: 18px;
  }
}

.offline-text {
  flex: 1;
  min-width: 0;
}

.offline-title {
  font-weight: 600;
  font-size: $font-size-base;
  margin-bottom: 2px;
  
  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-sm;
  }
}

.offline-message {
  font-size: $font-size-sm;
  opacity: 0.9;
  line-height: 1.4;
  
  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-xs;
  }
}

// 过渡动画
.offline-banner-enter-active,
.offline-banner-leave-active {
  transition: all 0.3s ease;
}

.offline-banner-enter-from {
  &.offline-banner--top {
    transform: translateY(-100%);
  }
  
  &.offline-banner--bottom {
    transform: translateY(100%);
  }
  
  opacity: 0;
}

.offline-banner-leave-to {
  &.offline-banner--top {
    transform: translateY(-100%);
  }
  
  &.offline-banner--bottom {
    transform: translateY(100%);
  }
  
  opacity: 0;
}

// 自动隐藏样式
.offline-banner--auto-hide {
  animation: auto-hide-pulse 2s ease-in-out infinite;
}

@keyframes auto-hide-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

// 响应式调整
@media (max-width: $breakpoint-sm) {
  .offline-content {
    flex-direction: column;
    text-align: center;
    gap: $spacing-xs;
  }
  
  .offline-text {
    order: -1;
  }
}

// 深色模式支持
@media (prefers-color-scheme: dark) {
  .offline-banner {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
  }
}

// 高对比度模式支持
@media (prefers-contrast: high) {
  .offline-banner {
    background: #d32f2f;
    border: 2px solid #ffffff;
  }
  
  .offline-title,
  .offline-message {
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }
}

// 减少动画模式支持
@media (prefers-reduced-motion: reduce) {
  .offline-banner-enter-active,
  .offline-banner-leave-active {
    transition: opacity 0.1s ease;
  }
  
  .offline-banner-enter-from,
  .offline-banner-leave-to {
    transform: none;
  }
  
  .offline-banner--auto-hide {
    animation: none;
  }
}
</style>