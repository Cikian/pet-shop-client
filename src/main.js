import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import App from './App.vue'
import './style.css'
import './styles/index.scss'

const app = createApp(App)
const pinia = createPinia()

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)

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
