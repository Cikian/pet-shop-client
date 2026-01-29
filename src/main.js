import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import './style.css'
import './styles/index.scss'
import { 
  preloadRoutes, 
  preloadImages, 
  monitorFirstScreenPerformance 
} from './utils/performance'
import { registerServiceWorker } from './utils/serviceWorker'

const app = createApp(App)
const pinia = createPinia()

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化性能监控
monitorFirstScreenPerformance()

// 注册 Service Worker（仅在生产环境）
if (import.meta.env.PROD) {
  registerServiceWorker().then(registration => {
    if (registration) {
      console.log('Service Worker 注册成功，离线功能已启用')
    }
  }).catch(error => {
    console.warn('Service Worker 注册失败:', error)
  })
}

// 预加载关键路由（在首页加载完成后）
router.afterEach((to) => {
  if (to.name === 'Home') {
    // 预加载常用页面
    preloadRoutes(['Category', 'Cart', 'Search'])
    
    // 预加载关键图片（示例）
    preloadImages([
      '/images/hero-banner-1.jpg',
      '/images/hero-banner-2.jpg',
      '/images/category-electronics.jpg',
      '/images/category-fashion.jpg'
    ])
  }
})

// 初始化应用状态
async function initializeApp() {
  // 初始化购物车数据（从本地存储加载）
  const { useCartStore } = await import('./stores/cart')
  const cartStore = useCartStore()
  cartStore.initialize()
  
  // 初始化商品数据
  const { useProductStore } = await import('./stores/product')
  const productStore = useProductStore()
  await productStore.initialize()
}

// 启动应用
initializeApp().then(() => {
  app.mount('#app')
}).catch(error => {
  console.error('Failed to initialize app:', error)
  app.mount('#app') // 即使初始化失败也要挂载应用
})
