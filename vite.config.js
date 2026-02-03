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
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `media/[name]-[hash].${ext}`
          }
          if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(assetInfo.name)) {
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
  // 开发服务器优化
  server: {
    // 预热常用文件
    warmup: {
      clientFiles: [
        './src/views/Home.vue',
        './src/components/layout/AppLayout.vue',
        './src/components/layout/AppHeader.vue'
      ]
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
