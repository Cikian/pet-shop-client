<template>
  <div class="register-page">
    <div class="register-container">
      <!-- 左侧装饰区域 -->
      <div class="register-decoration">
        <div class="decoration-content">
          <h1 class="brand-title">加入我们</h1>
          <p class="brand-subtitle">开启您的购物之旅</p>
          <div class="decoration-graphic">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
          </div>
        </div>
      </div>

      <!-- 右侧注册表单 -->
      <div class="register-form-wrapper">
        <div class="register-form-container">
          <h2 class="form-title">注册</h2>
          <p class="form-subtitle">创建您的账号</p>

          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            class="register-form"
            @submit.prevent="handleRegister"
          >
            <!-- 用户名输入框 -->
            <el-form-item prop="userName">
              <el-input
                v-model="registerForm.userName"
                placeholder="用户名"
                size="large"
                clearable
                :prefix-icon="User"
              />
            </el-form-item>

            <!-- 邮箱输入框 -->
            <el-form-item prop="email">
              <el-input
                v-model="registerForm.email"
                placeholder="邮箱"
                size="large"
                clearable
                :prefix-icon="Message"
              />
            </el-form-item>

            <!-- 邮箱验证码输入框 -->
            <el-form-item prop="captcha">
              <div class="captcha-input-group">
                <el-input
                  v-model="registerForm.captcha"
                  placeholder="邮箱验证码"
                  size="large"
                  clearable
                  :prefix-icon="Key"
                  class="captcha-input"
                />
                <el-button
                  size="large"
                  class="captcha-button"
                  :disabled="captchaCountdown > 0 || !isEmailValid"
                  :loading="sendingCaptcha"
                  @click="handleSendCaptcha"
                >
                  {{ captchaButtonText }}
                </el-button>
              </div>
            </el-form-item>

            <!-- 密码输入框 -->
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="密码"
                size="large"
                show-password
                clearable
                :prefix-icon="Lock"
              />
            </el-form-item>

            <!-- 确认密码输入框 -->
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="确认密码"
                size="large"
                show-password
                clearable
                :prefix-icon="Lock"
              />
            </el-form-item>

            <!-- 可选字段：手机号 -->
            <el-form-item prop="phone">
              <el-input
                v-model="registerForm.phone"
                placeholder="手机号（可选）"
                size="large"
                clearable
                :prefix-icon="Phone"
              />
            </el-form-item>

            <!-- 可选字段：昵称 -->
            <el-form-item prop="nickname">
              <el-input
                v-model="registerForm.nickname"
                placeholder="昵称（可选）"
                size="large"
                clearable
                :prefix-icon="User"
              />
            </el-form-item>

            <!-- 可选字段：头像上传 -->
            <el-form-item prop="avatar" label="头像（可选）">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleAvatarChange"
                accept="image/*"
              >
                <img v-if="registerForm.avatar" :src="registerForm.avatar" class="avatar-preview" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="avatar-tip">点击上传头像</div>
            </el-form-item>

            <!-- 注册按钮 -->
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="register-button"
                :loading="loading"
                @click="handleRegister"
              >
                {{ loading ? '注册中...' : '注册' }}
              </el-button>
            </el-form-item>

            <!-- Google注册按钮（预留） -->
            <div class="divider">
              <span>或</span>
            </div>

            <el-button
              size="large"
              class="google-register-button"
              disabled
            >
              <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              使用 Google 注册（即将推出）
            </el-button>

            <!-- 登录链接 -->
            <div class="login-link">
              已有账号？
              <router-link to="/login" class="link">立即登录</router-link>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, Phone, Key, Plus } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 表单引用
const registerFormRef = ref(null)

// 加载状态
const loading = ref(false)
const sendingCaptcha = ref(false)

// 验证码倒计时
const captchaCountdown = ref(0)
let countdownTimer = null

// 注册表单数据
const registerForm = reactive({
  userName: '',
  email: '',
  captcha: '',
  password: '',
  confirmPassword: '',
  phone: '',
  nickname: '',
  avatar: ''
})

// 邮箱格式验证
const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      callback(new Error('请输入有效的邮箱地址'))
    } else {
      callback()
    }
  }
}

// 密码确认验证
const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 手机号验证（可选）
const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback() // 可选字段，为空时通过
  } else {
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(value)) {
      callback(new Error('请输入有效的手机号'))
    } else {
      callback()
    }
  }
}

// 表单验证规则
const registerRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, validator: validateEmail, trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入邮箱验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  phone: [
    { validator: validatePhone, trigger: 'blur' }
  ]
}

// 检查邮箱是否有效
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(registerForm.email)
})

// 验证码按钮文本
const captchaButtonText = computed(() => {
  if (captchaCountdown.value > 0) {
    return `${captchaCountdown.value}秒后重试`
  }
  return '发送验证码'
})

/**
 * 发送邮箱验证码
 */
const handleSendCaptcha = async () => {
  if (!isEmailValid.value) {
    ElMessage.warning('请先输入有效的邮箱地址')
    return
  }

  try {
    sendingCaptcha.value = true
    
    // 调用发送验证码API
    await authStore.sendEmailCaptcha(registerForm.email)
    
    ElMessage.success('验证码已发送到您的邮箱')
    
    // 开始60秒倒计时
    startCountdown()
  } catch (error) {
    console.error('Send captcha error:', error)
    const errorMessage = error.response?.data?.message || error.message || '发送验证码失败，请稍后重试'
    ElMessage.error(errorMessage)
  } finally {
    sendingCaptcha.value = false
  }
}

/**
 * 开始倒计时
 */
const startCountdown = () => {
  captchaCountdown.value = 60
  
  countdownTimer = setInterval(() => {
    captchaCountdown.value--
    
    if (captchaCountdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

/**
 * 处理头像上传
 */
const handleAvatarChange = (file) => {
  // 创建本地预览URL
  const reader = new FileReader()
  reader.onload = (e) => {
    registerForm.avatar = e.target.result
  }
  reader.readAsDataURL(file.raw)
  
  // 实际项目中，这里应该上传到服务器并获取URL
  // 目前只做本地预览
}

/**
 * 处理注册
 */
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    // 验证表单
    await registerFormRef.value.validate()

    loading.value = true

    // 准备注册数据
    const registerData = {
      userName: registerForm.userName,
      email: registerForm.email,
      captcha: registerForm.captcha,
      password: registerForm.password
    }

    // 添加可选字段
    if (registerForm.phone) {
      registerData.phone = registerForm.phone
    }
    if (registerForm.nickname) {
      registerData.nickname = registerForm.nickname
    }
    if (registerForm.avatar) {
      registerData.avatar = registerForm.avatar
    }

    // 调用注册API
    await authStore.register(registerData)

    // 注册成功提示
    ElMessage.success('注册成功！即将跳转到首页...')

    // 延迟2-3秒后跳转到首页
    setTimeout(() => {
      router.push('/')
    }, 2500)
  } catch (error) {
    console.error('Register error:', error)
    
    // 显示错误信息
    const errorMessage = error.response?.data?.message || error.message || '注册失败，请检查输入信息'
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}

// 组件卸载时清除定时器
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: $spacing-lg;
}

.register-container {
  display: flex;
  width: 100%;
  max-width: 1100px;
  background: $card-background;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

// 左侧装饰区域
.register-decoration {
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
.register-form-wrapper {
  flex: 1;
  padding: $spacing-2xl;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  max-height: 100vh;

  @media (max-width: $breakpoint-sm) {
    padding: $spacing-lg;
  }
}

.register-form-container {
  width: 100%;
  max-width: 450px;
  padding: $spacing-md 0;
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

.register-form {
  :deep(.el-form-item) {
    margin-bottom: $spacing-md;
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

// 验证码输入组
.captcha-input-group {
  display: flex;
  gap: $spacing-sm;
  width: 100%;

  .captcha-input {
    flex: 1;
  }

  .captcha-button {
    flex-shrink: 0;
    min-width: 120px;
    border-radius: 12px;
    font-size: $font-size-sm;
    background: $primary-gradient;
    border: none;
    color: white;
    transition: all 0.3s ease;

    &:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba($primary-color-rgb, 0.3);
    }

    &:disabled {
      background: $border-color;
      color: $text-secondary;
      cursor: not-allowed;
    }
  }
}

// 头像上传
.avatar-uploader {
  :deep(.el-upload) {
    border: 2px dashed $border-color;
    border-radius: 12px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: $primary-color;
    }
  }
}

.avatar-preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 10px;
}

.avatar-uploader-icon {
  font-size: 32px;
  color: $text-secondary;
}

.avatar-tip {
  font-size: $font-size-xs;
  color: $text-secondary;
  margin-top: $spacing-xs;
}

.register-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: $font-size-base;
  font-weight: 600;
  background: $primary-gradient;
  border: none;
  transition: all 0.3s ease;
  margin-top: $spacing-md;

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

.google-register-button {
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

.login-link {
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
  .register-container {
    border-radius: 16px;
  }

  .register-form-wrapper {
    padding: $spacing-xl;
  }
}

@media (max-width: $breakpoint-sm) {
  .register-page {
    padding: $spacing-md;
  }

  .register-container {
    border-radius: 12px;
  }

  .form-title {
    font-size: $font-size-xl;
  }

  .register-button,
  .google-register-button {
    height: 44px;
  }

  .captcha-input-group {
    .captcha-button {
      min-width: 100px;
      font-size: $font-size-xs;
    }
  }

  .avatar-uploader {
    :deep(.el-upload) {
      width: 100px;
      height: 100px;
    }
  }

  .avatar-preview {
    width: 100px;
    height: 100px;
  }
}
</style>
