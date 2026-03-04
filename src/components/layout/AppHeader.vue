<template>
  <transition name="header-fade">
    <header 
      class="app-header" 
      :class="{ 'header-hidden': !isHeaderVisible }"
    >
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
          <!-- 用户认证区域 -->
          <div class="auth-wrapper">
            <!-- 已登录状态 -->
            <div v-if="isLoggedIn" class="user-info">
              <el-dropdown @command="handleUserCommand" trigger="click">
                <div class="user-trigger">
                  <el-avatar 
                    :src="userInfo?.avatar" 
                    :size="32"
                    class="user-avatar"
                  >
                    <el-icon><User /></el-icon>
                  </el-avatar>
                  <span class="user-nickname">{{ userInfo?.nickname || userInfo?.username }}</span>
                  <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">
                      <el-icon><User /></el-icon>
                      个人中心
                    </el-dropdown-item>
                    <el-dropdown-item command="orders">
                      <el-icon><Document /></el-icon>
                      我的订单
                    </el-dropdown-item>
                    <el-dropdown-item divided command="logout">
                      <el-icon><SwitchButton /></el-icon>
                      退出登录
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            
            <!-- 未登录状态 -->
            <div v-else class="auth-links">
              <router-link to="/login" class="auth-link">登录</router-link>
              <span class="auth-divider">/</span>
              <router-link to="/register" class="auth-link">注册</router-link>
            </div>
          </div>

          <!-- 购物车图标 -->
          <div class="cart-wrapper">
            <router-link to="/cart" class="cart-trigger">
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
        
        <!-- 移动端用户菜单 -->
        <div v-if="isLoggedIn" class="mobile-nav-divider"></div>
        <div v-if="isLoggedIn" class="mobile-nav-item">
          <a @click="handleUserCommand('profile')">个人中心</a>
        </div>
        <div v-if="isLoggedIn" class="mobile-nav-item">
          <a @click="handleUserCommand('orders')">我的订单</a>
        </div>
        <div v-if="isLoggedIn" class="mobile-nav-item">
          <a @click="handleUserCommand('logout')">退出登录</a>
        </div>
        
        <!-- 移动端未登录状态 -->
        <div v-if="!isLoggedIn" class="mobile-nav-divider"></div>
        <div v-if="!isLoggedIn" class="mobile-nav-item">
          <router-link to="/login" @click="closeMobileMenu">登录</router-link>
        </div>
        <div v-if="!isLoggedIn" class="mobile-nav-item">
          <router-link to="/register" @click="closeMobileMenu">注册</router-link>
        </div>
      </div>
    </header>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { 
  Search, 
  ShoppingCart, 
  Shop, 
  Menu, 
  User,
  ArrowDown,
  Document,
  SwitchButton
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

// 响应式数据
const searchKeyword = ref('')
const showMobileMenu = ref(false)
const isHeaderVisible = ref(true)
const lastScrollTop = ref(0)
const isHomePage = ref(false)

// 计算属性
const cartCount = computed(() => cartStore.totalCount)
const isLoggedIn = computed(() => authStore.isLoggedIn)
const userInfo = computed(() => authStore.userInfo)

// 检测当前是否在首页
const checkIfHomePage = () => {
  const currentRoute = router.currentRoute.value
  isHomePage.value = currentRoute.path === '/'
}

// 滚动事件处理
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  
  if (isHomePage.value) {
    if (scrollTop === 0) {
      // 滚动到最顶部，隐藏导航栏
      isHeaderVisible.value = false
    } else if (scrollTop > lastScrollTop.value) {
      // 向下滚动，显示导航栏
      isHeaderVisible.value = true
    }
  } else {
    // 非首页始终显示导航栏
    isHeaderVisible.value = true
  }
  
  lastScrollTop.value = scrollTop
}

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

const handleCheckout = (checkoutData) => {
  // 处理结算逻辑
  console.log('结算数据:', checkoutData)
  ElMessage.success('跳转到结算页面...')
}

// 用户菜单命令处理
const handleUserCommand = async (command) => {
  closeMobileMenu()
  
  switch (command) {
    case 'profile':
      ElMessage.info('个人中心功能开发中...')
      // router.push('/profile')
      break
      
    case 'orders':
      ElMessage.info('订单管理功能开发中...')
      // router.push('/orders')
      break
      
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 执行登出
        authStore.logout()
        ElMessage.success('已退出登录')
        
        // 如果当前页面需要认证，跳转到首页
        const currentRoute = router.currentRoute.value
        if (currentRoute.meta.requiresAuth) {
          router.push('/')
        }
      } catch (error) {
        // 用户取消登出
        console.log('取消登出')
      }
      break
      
    default:
      break
  }
}

// 生命周期钩子
onMounted(() => {
  checkIfHomePage()
  // 初始检查滚动位置
  if (isHomePage.value && window.pageYOffset === 0) {
    isHeaderVisible.value = false
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 监听路由变化
watch(
  () => router.currentRoute.value.path,
  () => {
    checkIfHomePage()
    // 路由变化时重新检查滚动位置
    if (isHomePage.value && window.pageYOffset === 0) {
      isHeaderVisible.value = false
    } else {
      isHeaderVisible.value = true
    }
  }
)
</script>

<style lang="scss" scoped>
/* 导航栏过渡动画 */
.header-fade-enter-active,
.header-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.header-fade-enter-from,
.header-fade-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.app-header {
  background: var(--card-background);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease-in-out;

  &.header-hidden {
    opacity: 0;
    transform: translateY(-100%);
    pointer-events: none;
  }

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

    .auth-wrapper {
      display: flex;
      align-items: center;
      
      @media (max-width: 768px) {
        display: none; // 移动端在菜单中显示
      }

      .user-info {
        .user-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 44px;

          &:hover {
            background: var(--background);
          }

          .user-avatar {
            flex-shrink: 0;
          }

          .user-nickname {
            font-weight: 500;
            color: var(--text-primary);
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            
            @media (max-width: 992px) {
              display: none;
            }
          }

          .dropdown-icon {
            color: var(--text-secondary);
            font-size: 12px;
            transition: transform 0.3s ease;
          }

          &:hover .dropdown-icon {
            transform: rotate(180deg);
          }
        }
      }

      .auth-links {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;

        .auth-link {
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          transition: all 0.3s ease;
          min-height: 44px;
          display: flex;
          align-items: center;

          &:hover {
            color: var(--primary-color);
            background: rgba(var(--primary-color-rgb), 0.1);
          }

          &.router-link-active {
            color: var(--primary-color);
            background: rgba(var(--primary-color-rgb), 0.1);
          }
        }

        .auth-divider {
          color: var(--text-light);
          font-weight: 300;
        }
      }
    }

    .cart-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      .cart-trigger {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-primary);
        padding: 0.5rem;
        border-radius: 8px;
        transition: all 0.3s ease;
        cursor: pointer;
        text-decoration: none;
        min-height: 44px;
        min-width: 44px;

        &:hover {
          background: var(--background);
          color: var(--primary-color);
        }
        
        @media (max-width: 768px) {
          &:active {
            transform: scale(0.95);
            background: var(--background);
          }
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
        min-height: 44px;
        min-width: 44px;
        
        &:active {
          transform: scale(0.95);
        }
      }
    }
  }

  .mobile-nav {
    display: none;
    background: var(--card-background);
    border-top: 1px solid var(--border-color);
    padding: 1rem 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    @media (max-width: 768px) {
      display: block;
    }

    .mobile-nav-divider {
      height: 1px;
      background: var(--border-color);
      margin: 0.5rem 1.5rem;
    }

    .mobile-nav-item {
      padding: 0;

      a {
        color: var(--text-primary);
        text-decoration: none;
        font-weight: 500;
        display: block;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid transparent;
        transition: all 0.3s ease;
        position: relative;
        min-height: 44px; // 增大触摸区域
        display: flex;
        align-items: center;
        cursor: pointer;

        &:hover,
        &.router-link-active {
          color: var(--primary-color);
          background: rgba(var(--primary-color-rgb), 0.05);
          border-left: 3px solid var(--primary-color);
        }
        
        &:active {
          background: rgba(var(--primary-color-rgb), 0.1);
          transform: scale(0.98);
        }
        
        // 添加触摸反馈动画
        &::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(var(--primary-color-rgb), 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.3s ease, height 0.3s ease;
        }
        
        &:active::after {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>