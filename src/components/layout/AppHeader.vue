<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo区域 -->
      <div class="header-logo">
        <router-link to="/" class="logo-link">
          <div class="logo">
            <el-icon class="logo-icon"><Shop /></el-icon>
            <span class="logo-text">在线商城</span>
          </div>
        </router-link>
      </div>

      <!-- 搜索框区域 -->
      <div class="header-search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品..."
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #suffix>
            <el-button 
              type="primary" 
              :icon="Search" 
              @click="handleSearch"
              class="search-button"
            />
          </template>
        </el-input>
      </div>

      <!-- 右侧功能区域 -->
      <div class="header-actions">
        <!-- 购物车图标 -->
        <div class="cart-wrapper">
          <router-link to="/cart" class="cart-link">
            <el-badge :value="cartCount" :hidden="cartCount === 0" class="cart-badge">
              <el-icon class="cart-icon"><ShoppingCart /></el-icon>
            </el-badge>
            <span class="cart-text">购物车</span>
          </router-link>
        </div>

        <!-- 移动端菜单按钮 -->
        <div class="mobile-menu">
          <el-button 
            type="text" 
            :icon="Menu" 
            @click="toggleMobileMenu"
            class="mobile-menu-button"
          />
        </div>
      </div>
    </div>

    <!-- 移动端导航菜单 -->
    <div v-show="showMobileMenu" class="mobile-nav">
      <div class="mobile-nav-item">
        <router-link to="/" @click="closeMobileMenu">首页</router-link>
      </div>
      <div class="mobile-nav-item">
        <router-link to="/category" @click="closeMobileMenu">分类</router-link>
      </div>
      <div class="mobile-nav-item">
        <router-link to="/cart" @click="closeMobileMenu">购物车</router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { Search, ShoppingCart, Shop, Menu } from '@element-plus/icons-vue'

const router = useRouter()
const cartStore = useCartStore()

// 响应式数据
const searchKeyword = ref('')
const showMobileMenu = ref(false)

// 计算属性
const cartCount = computed(() => cartStore.totalCount)

// 方法
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      name: 'Search',
      query: { q: searchKeyword.value.trim() }
    })
  }
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}
</script>

<style lang="scss" scoped>
.app-header {
  background: var(--card-background);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid var(--border-color);

  .header-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    height: 64px;
    gap: 1rem;

    @media (max-width: 768px) {
      padding: 0 0.75rem;
      height: 56px;
    }
  }

  .header-logo {
    flex-shrink: 0;

    .logo-link {
      text-decoration: none;
      color: inherit;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 1.25rem;
      color: var(--primary-color);

      .logo-icon {
        font-size: 1.5rem;
      }

      .logo-text {
        @media (max-width: 480px) {
          display: none;
        }
      }
    }
  }

  .header-search {
    flex: 1;
    max-width: 500px;
    margin: 0 1rem;

    @media (max-width: 768px) {
      margin: 0 0.5rem;
    }

    @media (max-width: 480px) {
      margin: 0 0.25rem;
    }

    .search-input {
      :deep(.el-input__wrapper) {
        border-radius: 24px;
        padding-right: 0;
      }

      :deep(.el-input__suffix) {
        padding-right: 4px;
      }
    }

    .search-button {
      border-radius: 20px;
      padding: 8px 12px;
      min-width: auto;
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;

    .cart-wrapper {
      .cart-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-primary);
        text-decoration: none;
        padding: 0.5rem;
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          background: var(--background);
          color: var(--primary-color);
        }

        .cart-icon {
          font-size: 1.5rem;
        }

        .cart-text {
          font-weight: 500;
          
          @media (max-width: 768px) {
            display: none;
          }
        }
      }

      .cart-badge {
        :deep(.el-badge__content) {
          background: var(--accent-color);
          border-color: var(--accent-color);
        }
      }
    }

    .mobile-menu {
      display: none;

      @media (max-width: 768px) {
        display: block;
      }

      .mobile-menu-button {
        font-size: 1.5rem;
        color: var(--text-primary);
      }
    }
  }

  .mobile-nav {
    display: none;
    background: var(--card-background);
    border-top: 1px solid var(--border-color);
    padding: 1rem 0;

    @media (max-width: 768px) {
      display: block;
    }

    .mobile-nav-item {
      padding: 0.75rem 1rem;

      a {
        color: var(--text-primary);
        text-decoration: none;
        font-weight: 500;
        display: block;
        padding: 0.5rem 0;
        border-bottom: 1px solid transparent;
        transition: all 0.3s ease;

        &:hover,
        &.router-link-active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }
      }
    }
  }
}
</style>