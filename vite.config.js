import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *; @use "@/styles/mixins.scss" as *;`
      }
    }
  },
  build: {
    // 代码分割优化
    rollupOptions: {
      output: {
        // 手动分割代码块
        manualChunks: {
          // Vue 核心库
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // Element Plus UI库
          'element-vendor': ['element-plus', '@element-plus/icons-vue'],
          // 工具库
          'utils': ['@/utils/imageOptimization.js']
        },
        // 优化chunk文件名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // 兼容处理：防范在新版 Rollup 中 assetInfo.name 偶发性缺失导致的 split 报错
          const fileName = assetInfo.name || ''
          const info = fileName.split('.')
          const ext = info[info.length - 1]

          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(fileName)) {
            return `media/[name]-[hash].${ext}`
          }
          if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(fileName)) {
            return `images/[name]-[hash].${ext}`
          }
          if (ext === 'css') {
            return `css/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        }
      }
    },
    // 启用压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除console.log
        drop_console: true,
        // 移除debugger
        drop_debugger: true
      }
    },
    // 生成source map用于调试
    sourcemap: false,
    // 设置chunk大小警告限制
    chunkSizeWarningLimit: 1000
  },
  // 开发服务器优化与代理配置
  server: {
    host: '0.0.0.0', // 允许局域网内的其他设备访问你的前端网页
    // 预热常用文件
    warmup: {
      clientFiles: [
        './src/views/Home.vue',
        './src/components/layout/AppLayout.vue',
        './src/components/layout/AppHeader.vue'
      ]
    },
    // 跨域代理配置
    proxy: {
      // 当请求路径以 /api 开头时，命中此代理规则
      '/api': {
        target: 'http://192.168.18.39:18500', // 目标后端接口服务
        changeOrigin: true,                  // 改变请求源（Origin），使后端服务器误以为是同源请求，从而绕过 403 限制
        // 如果你的真实后端接口中确实包含 /api（例如 http://192.168.18.39:18500/api/home/slide）
        // 则不需要配置 rewrite。保持当前状态即可。
      }
    }
  },
  // 依赖预构建优化
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
      '@element-plus/icons-vue'
    ]
  }
})
