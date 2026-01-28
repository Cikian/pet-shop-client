import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/category/:id?',
    name: 'Category',
    component: () => import('@/views/Category.vue'),
    meta: { title: '商品分类' },
    props: true
  },
  {
    path: '/product/:id',
    name: 'Product',
    component: () => import('@/views/Product.vue'),
    meta: { title: '商品详情' },
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
    meta: { title: '购物车' }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search.vue'),
    meta: { title: '搜索结果' }
  },
  {
    path: '/demo',
    name: 'ProductDemo',
    component: () => import('@/views/ProductDemo.vue'),
    meta: { title: '商品组件演示' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/Home.vue'),
    meta: { title: '页面未找到' }
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

// 全局前置守卫 - 设置页面标题和加载状态
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 在线商城`
  }
  
  // 添加页面加载状态
  if (typeof window !== 'undefined') {
    document.body.classList.add('page-loading')
  }
  
  next()
})

// 全局后置钩子 - 移除加载状态
router.afterEach((to, from) => {
  // 移除页面加载状态
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      document.body.classList.remove('page-loading')
    }, 100)
  }
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  // 可以在这里添加错误上报逻辑
})

export default router