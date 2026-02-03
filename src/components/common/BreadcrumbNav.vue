<template>
  <div class="breadcrumb-nav">
    <div class="container">
      <div class="breadcrumb-content">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/" class="breadcrumb">
          <el-breadcrumb-item :to="{ name: 'Home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item
            v-for="(item, index) in breadcrumbItems"
            :key="index"
            :to="item.to"
          >
            {{ item.label }}
          </el-breadcrumb-item>
        </el-breadcrumb>
        
        <!-- 返回按钮 -->
        <div v-if="showBackButton" class="back-navigation">
          <el-button 
            type="text" 
            :icon="ArrowLeft" 
            @click="goBack"
            class="back-button"
          >
            {{ backButtonText }}
          </el-button>
        </div>
      </div>
      
      <!-- 页面标题和描述 -->
      <div v-if="title || description" class="page-header">
        <h1 v-if="title" class="page-title">
          <el-icon v-if="titleIcon" class="title-icon">
            <component :is="titleIcon" />
          </el-icon>
          {{ title }}
        </h1>
        <p v-if="description" class="page-description">
          {{ description }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

/**
 * 通用面包屑导航组件
 * 提供统一的页面导航和返回功能
 */

const props = defineProps({
  /**
   * 面包屑项目列表
   * @type {Array<{label: string, to?: object}>}
   */
  items: {
    type: Array,
    default: () => []
  },
  
  /**
   * 页面标题
   */
  title: {
    type: String,
    default: ''
  },
  
  /**
   * 页面描述
   */
  description: {
    type: String,
    default: ''
  },
  
  /**
   * 标题图标
   */
  titleIcon: {
    type: [String, Object],
    default: null
  },
  
  /**
   * 是否显示返回按钮
   */
  showBackButton: {
    type: Boolean,
    default: true
  },
  
  /**
   * 返回按钮文本
   */
  backButtonText: {
    type: String,
    default: '返回'
  },
  
  /**
   * 自定义返回逻辑
   */
  customBackHandler: {
    type: Function,
    default: null
  }
})

const router = useRouter()

// 计算属性
const breadcrumbItems = computed(() => {
  return props.items.filter(item => item.label)
})

// 方法
const goBack = () => {
  if (props.customBackHandler) {
    props.customBackHandler()
  } else {
    // 默认返回逻辑
    if (window.history.length > 1) {
      router.go(-1)
    } else {
      router.push({ name: 'Home' })
    }
  }
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;
@use '@/styles/mixins' as *;

.breadcrumb-nav {
  background: $card-background;
  border-bottom: 1px solid $border-color;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 $spacing-md;
    
    @include max-width($breakpoint-sm) {
      padding: 0 $spacing-sm;
    }
  }
  
  .breadcrumb-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-md 0;
    
    @include max-width($breakpoint-sm) {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-sm;
    }
  }
  
  .breadcrumb {
    :deep(.el-breadcrumb__item) {
      .el-breadcrumb__inner {
        color: $text-secondary;
        font-size: $font-size-sm;
        transition: color 0.3s ease;
        
        &:hover {
          color: $primary-color;
        }
      }
      
      &:last-child .el-breadcrumb__inner {
        color: $text-primary;
        font-weight: 500;
      }
    }
  }
  
  .back-navigation {
    .back-button {
      color: $primary-color;
      font-weight: 500;
      padding: $spacing-xs $spacing-sm;
      border-radius: 6px;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba($primary-color, 0.1);
        transform: translateX(-2px);
      }
    }
  }
  
  .page-header {
    padding: $spacing-lg 0 $spacing-md 0;
    
    .page-title {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      font-size: $font-size-2xl;
      font-weight: 600;
      color: $text-primary;
      margin: 0 0 $spacing-sm 0;
      
      .title-icon {
        font-size: 28px;
        color: $primary-color;
      }
      
      @include max-width($breakpoint-sm) {
        font-size: $font-size-xl;
        
        .title-icon {
          font-size: 24px;
        }
      }
    }
    
    .page-description {
      color: $text-secondary;
      font-size: $font-size-base;
      margin: 0;
      line-height: 1.5;
      
      @include max-width($breakpoint-sm) {
        font-size: $font-size-sm;
      }
    }
  }
}

// 动画效果
.breadcrumb-nav {
  @include slide-down();
}

.breadcrumb {
  @include fade-in();
  animation-delay: 0.1s;
}

.back-navigation {
  @include fade-in();
  animation-delay: 0.2s;
}

.page-header {
  @include slide-up();
  animation-delay: 0.3s;
}
</style>