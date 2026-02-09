<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧装饰区域 -->
      <div class="login-decoration">
        <div class="decoration-content">
          <h1 class="brand-title">欢迎回来</h1>
          <p class="brand-subtitle">登录享受更多购物乐趣</p>
          <div class="decoration-graphic">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-form-wrapper">
        <div class="login-form-container">
          <h2 class="form-title">登录</h2>
          <p class="form-subtitle">使用您的账号登录</p>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            @submit.prevent="handleLogin"
          >
            <!-- 用户名/邮箱输入框 -->
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="用户名或邮箱"
                size="large"
                clearable
                :prefix-icon="User"
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <!-- 密码输入框 -->
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="密码"
                size="large"
                show-password
                clearable
                :prefix-icon="Lock"
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <!-- 记住我和忘记密码 -->
            <div class="form-options">
              <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
              <a href="#" class="forgot-password">忘记密码？</a>
            </div>

            <!-- 登录按钮 -->
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-button"
                :loading="loading"
                @click="handleLogin"
              >
                {{ loading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>

            <!-- Google登录按钮（预留） -->
            <div class="divider">
              <span>或</span>
            </div>

            <el-button
              size="large"
              class="google-login-button"
              disabled
            >
              <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              使用 Google 登录（即将推出）
            </el-button>

            <!-- 注册链接 -->
            <div class="register-link">
              还没有账号？
              <router-link to="/register" class="link">立即注册</router-link>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref(null)

// 加载状态
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    { min: 3, message: '用户名至少3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ]
}

/**
 * 处理登录
 */
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    // 验证表单
    await loginFormRef.value.validate()

    loading.value = true

    // 调用登录API
    await authStore.login(loginForm.username, loginForm.password)

    // 登录成功提示
    ElMessage.success('登录成功！')

    // 跳转到目标页面或首页
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    console.error('Login error:', error)
    
    // 显示错误信息
    const errorMessage = error.response?.data?.message || error.message || '登录失败，请检查用户名和密码'
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: $spacing-lg;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  background: $card-background;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

// 左侧装饰区域
.login-decoration {
  flex: 1;
  background: $primary-gradient;
  padding: $spacing-2xl;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  @media (max-width: $breakpoint-md) {
    display: none;
  }
}

.decoration-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
}

.brand-title {
  font-size: $font-size-3xl;
  font-weight: 700;
  margin-bottom: $spacing-md;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.brand-subtitle {
  font-size: $font-size-lg;
  opacity: 0.9;
  margin-bottom: $spacing-xl;
}

.decoration-graphic {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;

  &.circle-1 {
    width: 100px;
    height: 100px;
    top: 0;
    left: 0;
    animation-delay: 0s;
  }

  &.circle-2 {
    width: 150px;
    height: 150px;
    top: 50px;
    right: 0;
    animation-delay: 2s;
  }

  &.circle-3 {
    width: 80px;
    height: 80px;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    animation-delay: 4s;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

// 右侧表单区域
.login-form-wrapper {
  flex: 1;
  padding: $spacing-2xl;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: $breakpoint-sm) {
    padding: $spacing-lg;
  }
}

.login-form-container {
  width: 100%;
  max-width: 400px;
}

.form-title {
  font-size: $font-size-2xl;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.form-subtitle {
  font-size: $font-size-base;
  color: $text-secondary;
  margin-bottom: $spacing-xl;
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: $spacing-lg;
  }

  :deep(.el-input__wrapper) {
    border-radius: 12px;
    padding: $spacing-sm $spacing-md;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    &.is-focus {
      box-shadow: 0 4px 12px rgba($primary-color-rgb, 0.2);
    }
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;

  :deep(.el-checkbox__label) {
    color: $text-secondary;
  }
}

.forgot-password {
  color: $primary-color;
  text-decoration: none;
  font-size: $font-size-sm;
  transition: color 0.3s ease;

  &:hover {
    color: $primary-dark;
  }
}

.login-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: $font-size-base;
  font-weight: 600;
  background: $primary-gradient;
  border: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba($primary-color-rgb, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
}

.divider {
  position: relative;
  text-align: center;
  margin: $spacing-lg 0;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 45%;
    height: 1px;
    background: $border-color;
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
  }

  span {
    background: $card-background;
    padding: 0 $spacing-md;
    color: $text-secondary;
    font-size: $font-size-sm;
  }
}

.google-login-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: $font-size-base;
  border: 2px solid $border-color;
  background: white;
  color: $text-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  transition: all 0.3s ease;

  &:not(:disabled):hover {
    border-color: $primary-color;
    color: $primary-color;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.google-icon {
  flex-shrink: 0;
}

.register-link {
  text-align: center;
  margin-top: $spacing-lg;
  color: $text-secondary;
  font-size: $font-size-sm;

  .link {
    color: $primary-color;
    text-decoration: none;
    font-weight: 600;
    margin-left: $spacing-xs;
    transition: color 0.3s ease;

    &:hover {
      color: $primary-dark;
      text-decoration: underline;
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-md) {
  .login-container {
    border-radius: 16px;
  }

  .login-form-wrapper {
    padding: $spacing-xl;
  }
}

@media (max-width: $breakpoint-sm) {
  .login-page {
    padding: $spacing-md;
  }

  .login-container {
    border-radius: 12px;
  }

  .form-title {
    font-size: $font-size-xl;
  }

  .login-button,
  .google-login-button {
    height: 44px;
  }
}
</style>
