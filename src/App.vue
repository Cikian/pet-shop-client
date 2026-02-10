<template>
  <!-- 登录和注册页面不使用布局 -->
  <template v-if="isAuthPage">
    <router-view />
  </template>
  
  <!-- 其他页面使用标准布局 -->
  <AppLayout v-else>
    <router-view />
    <!-- 离线状态提示 -->
    <OfflineStatus />
  </AppLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import OfflineStatus from '@/components/common/OfflineStatus.vue'
import { useMobile } from '@/composables/useMobile.js'
import { useNavigationStore } from '@/stores/navigation.js'

// 初始化移动端优化
const mobile = useMobile()
const navigationStore = useNavigationStore()
const route = useRoute()

// 判断是否是认证页面（登录/注册）
const isAuthPage = computed(() => {
  return route.name === 'Login' || route.name === 'Register'
})

onMounted(() => {
  // 初始化导航状态
  navigationStore.initialize()
  
  // 移动端性能优化
  if (mobile.isMobileDevice.value) {
    // 预加载关键资源
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = '/src/components/product/ProductCard.vue'
    document.head.appendChild(link)
    
    // 优化移动端滚动
    document.body.style.overscrollBehavior = 'none'
  }
})
</script>

<style>
#app {
  font-family: 'Inter', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

/* 移动端优化样式 */
@media (max-width: 768px) {
  #app {
    /* 优化移动端渲染 */
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
