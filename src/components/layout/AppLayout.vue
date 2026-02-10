<template>
  <div class="app-layout">
    <!-- 头部导航 -->
    <AppHeader />
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="content-container">
        <slot />
      </div>
    </main>
    
    <!-- 底部信息 -->
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
</script>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background);
}

.main-content {
    flex: 1;
    width: 100%;
    
    .content-container {
      width: 100%;
      padding: 0 1rem;
      min-height: calc(100vh - 64px - 200px); // 减去header和footer的大概高度

      @media (max-width: 768px) {
        padding: 0.75rem;
        min-height: calc(100vh - 56px - 180px);
      }

      @media (max-width: 480px) {
        padding: 0.5rem;
      }
    }
  }

// 响应式容器工具类
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 0 0.5rem;
  }
}

.container-fluid {
  width: 100%;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 0 0.5rem;
  }
}

// 响应式网格系统
.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -0.5rem;
}

.col {
  flex: 1;
  padding: 0 0.5rem;
}

.col-12 { flex: 0 0 100%; max-width: 100%; }
.col-11 { flex: 0 0 91.666667%; max-width: 91.666667%; }
.col-10 { flex: 0 0 83.333333%; max-width: 83.333333%; }
.col-9 { flex: 0 0 75%; max-width: 75%; }
.col-8 { flex: 0 0 66.666667%; max-width: 66.666667%; }
.col-7 { flex: 0 0 58.333333%; max-width: 58.333333%; }
.col-6 { flex: 0 0 50%; max-width: 50%; }
.col-5 { flex: 0 0 41.666667%; max-width: 41.666667%; }
.col-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
.col-3 { flex: 0 0 25%; max-width: 25%; }
.col-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
.col-1 { flex: 0 0 8.333333%; max-width: 8.333333%; }

// 平板响应式
@media (max-width: 768px) {
  .col-md-12 { flex: 0 0 100%; max-width: 100%; }
  .col-md-6 { flex: 0 0 50%; max-width: 50%; }
  .col-md-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
  .col-md-3 { flex: 0 0 25%; max-width: 25%; }
}

// 手机响应式
@media (max-width: 480px) {
  .col-sm-12 { flex: 0 0 100%; max-width: 100%; }
  .col-sm-6 { flex: 0 0 50%; max-width: 50%; }
}
</style>