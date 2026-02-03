<template>
  <Teleport to="body">
    <Transition name="network-status">
      <div 
        v-if="showStatus" 
        class="network-status"
        :class="statusClass"
      >
        <div class="status-content">
          <el-icon class="status-icon">
            <component :is="statusIcon" />
          </el-icon>
          <span class="status-text">{{ statusText }}</span>
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
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  Close, 
  Check, 
  Warning, 
  CircleCheck 
} from '@element-plus/icons-vue'

/**
 * 组件属性
 */
const props = defineProps({
  /** 是否自动检测网络状态 */
  autoDetect: {
    type: Boolean,
    default: true
  },
  /** 显示持续时间（毫秒），0表示不自动隐藏 */
  duration: {
    type: Number,
    default: 3000
  },
  /** 是否显示重试按钮 */
  showRetry: {
    type: Boolean,
    default: true
  }
})

/**
 * 组件事件
 */
const emit = defineEmits(['statusChange', 'retry'])

// 响应式数据
const isOnline = ref(navigator.onLine)
const showStatus = ref(false)
const retrying = ref(false)
const hideTimer = ref(null)

/**
 * 网络状态类型
 */
const statusType = computed(() => {
  if (!isOnline.value) return 'offline'
  return 'online'
})

/**
 * 状态样式类
 */
const statusClass = computed(() => {
  return `network-status--${statusType.value}`
})

/**
 * 状态图标
 */
const statusIcon = computed(() => {
  switch (statusType.value) {
    case 'offline':
      return Close
    case 'online':
      return Check
    default:
      return Warning
  }
})

/**
 * 状态文本
 */
const statusText = computed(() => {
  switch (statusType.value) {
    case 'offline':
      return '网络连接已断开'
    case 'online':
      return '网络连接已恢复'
    default:
      return '网络状态异常'
  }
})

/**
 * 是否显示重试按钮
 */
const showRetryButton = computed(() => {
  return props.showRetry && statusType.value === 'offline'
})

/**
 * 显示状态提示
 */
const showStatusNotification = () => {
  showStatus.value = true
  
  // 清除之前的定时器
  if (hideTimer.value) {
    clearTimeout(hideTimer.value)
    hideTimer.value = null
  }
  
  // 设置自动隐藏
  if (props.duration > 0) {
    hideTimer.value = setTimeout(() => {
      hideStatus()
    }, props.duration)
  }
}

/**
 * 隐藏状态提示
 */
const hideStatus = () => {
  showStatus.value = false
  if (hideTimer.value) {
    clearTimeout(hideTimer.value)
    hideTimer.value = null
  }
}

/**
 * 处理网络状态变化
 */
const handleOnline = () => {
  const wasOffline = !isOnline.value
  isOnline.value = true
  
  if (wasOffline) {
    showStatusNotification()
    emit('statusChange', {
      online: true,
      type: 'online'
    })
  }
}

const handleOffline = () => {
  isOnline.value = false
  showStatusNotification()
  emit('statusChange', {
    online: false,
    type: 'offline'
  })
}

/**
 * 处理重试
 */
const handleRetry = async () => {
  retrying.value = true
  
  try {
    // 尝试发送一个简单的网络请求来检测连接
    const response = await fetch('/favicon.ico', {
      method: 'HEAD',
      cache: 'no-cache'
    })
    
    if (response.ok) {
      isOnline.value = true
      hideStatus()
      emit('statusChange', {
        online: true,
        type: 'online'
      })
    }
  } catch (error) {
    console.warn('Network retry failed:', error)
  } finally {
    retrying.value = false
  }
  
  emit('retry')
}

/**
 * 手动设置网络状态
 */
const setNetworkStatus = (online) => {
  const changed = isOnline.value !== online
  isOnline.value = online
  
  if (changed) {
    showStatusNotification()
    emit('statusChange', {
      online,
      type: online ? 'online' : 'offline'
    })
  }
}

/**
 * 获取当前网络状态
 */
const getNetworkStatus = () => {
  return {
    online: isOnline.value,
    type: statusType.value
  }
}

// 生命周期
onMounted(() => {
  if (props.autoDetect) {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  }
})

onUnmounted(() => {
  if (props.autoDetect) {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
  
  if (hideTimer.value) {
    clearTimeout(hideTimer.value)
  }
})

// 暴露方法给父组件
defineExpose({
  setNetworkStatus,
  getNetworkStatus,
  showStatus: showStatusNotification,
  hideStatus
})
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.network-status {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  min-width: 300px;
  max-width: 500px;
  
  @media (max-width: $breakpoint-sm) {
    top: 10px;
    left: 10px;
    right: 10px;
    transform: none;
    min-width: auto;
    max-width: none;
  }
}

.status-content {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md $spacing-lg;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  
  @media (max-width: $breakpoint-sm) {
    padding: $spacing-sm $spacing-md;
  }
}

.status-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.status-text {
  flex: 1;
  font-size: $font-size-sm;
  font-weight: 500;
  
  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-xs;
  }
}

// 不同状态的样式
.network-status--offline {
  .status-content {
    background: rgba(255, 107, 107, 0.95);
    color: white;
    border: 1px solid rgba(255, 107, 107, 0.3);
  }
  
  .status-icon {
    color: white;
  }
}

.network-status--online {
  .status-content {
    background: rgba(81, 207, 102, 0.95);
    color: white;
    border: 1px solid rgba(81, 207, 102, 0.3);
  }
  
  .status-icon {
    color: white;
  }
}

// 过渡动画
.network-status-enter-active,
.network-status-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.network-status-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
  
  @media (max-width: $breakpoint-sm) {
    transform: translateY(-20px);
  }
}

.network-status-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
  
  @media (max-width: $breakpoint-sm) {
    transform: translateY(-20px);
  }
}

// 重试按钮样式
.el-button {
  --el-button-size: 24px;
  --el-button-padding: 4px 8px;
  
  &.is-loading {
    pointer-events: none;
  }
}
</style>