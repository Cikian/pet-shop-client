import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页', requiresAuth: false }
  },
  {
    path: '/category/:id?',
    name: 'Category',
    component: () => import('@/views/Category.vue'),
    meta: { title: '商品分类', requiresAuth: true },
    props: true
  },
  {
    path: '/product/:id',
    name: 'Product',
    component: () => import('@/views/Product.vue'),
    meta: { title: '商品详情', requiresAuth: true },
    props: true,
    beforeEnter: (to, from, next) => {
      // 验证商品ID格式
      if (to.params.id && !/^[a-zA-Z0-9-_]+$/.test(to.params.id)) {
        next({ name: 'Home' })
      } else {
        next()
      }
    }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart.vue'),
    meta: { title: '购物车', requiresAuth: true }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue'),
    meta: { title: '搜索结果', requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/demo',
    name: 'ProductDemo',
    component: () => import('@/views/ProductDemo.vue'),
    meta: { title: '商品组件演示', requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/Home.vue'),
    meta: { title: '页面未找到', requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 路由切换时的滚动行为
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局前置守卫 - 设置页面标题、加载状态和认证检查
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 在线商城`
  }
  
  // 添加页面加载状态
  if (typeof window !== 'undefined') {
    document.body.classList.add('page-loading')
  }
  
  // 认证检查
  const { useAuthStore } = await import('@/stores/auth.js')
  const authStore = useAuthStore()
  
  // 如果需要认证但用户未登录，跳转到登录页
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  // 如果已登录用户访问登录页或注册页，跳转到首页
  if ((to.name === 'Login' || to.name === 'Register') && authStore.isLoggedIn) {
    next({ name: 'Home' })
    return
  }
  
  next()
})

// 全局后置钩子 - 移除加载状态和记录导航历史
router.afterEach((to, from) => {
  // 移除页面加载状态
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      document.body.classList.remove('page-loading')
    }, 100)
  }
  
  // 记录导航历史（延迟导入避免循环依赖）
  import('@/stores/navigation.js').then(({ useNavigationStore }) => {
    const navigationStore = useNavigationStore()
    navigationStore.addToHistory(to)
    navigationStore.saveToLocalStorage()
    
    // 记录购物流程
    const shoppingActions = {
      'Home': 'visit_home',
      'Category': 'browse_category',
      'Product': 'view_product',
      'Search': 'search_products',
      'Cart': 'view_cart'
    }
    
    const action = shoppingActions[to.name]
    if (action) {
      navigationStore.trackShoppingFlow(action, {
        route: to.name,
        params: to.params,
        query: to.query,
        from: from.name
      })
    }
  })
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  // 可以在这里添加错误上报逻辑
})

export default router