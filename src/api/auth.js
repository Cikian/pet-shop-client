import { postAction } from './http'

/**
 * 认证API模块
 * 提供登录、注册、验证码发送等认证相关接口
 */

/**
 * 用户登录API
 * @param {string} username - 用户名或邮箱
 * @param {string} password - 密码
 * @returns {Promise<AuthResponse>} 认证响应数据
 */
export const loginApi = (username, password) => {
  return postAction('/v1/auth/login', { username, password })
}

/**
 * 用户注册API
 * @param {Object} registerData - 注册数据
 * @param {string} registerData.userName - 用户名
 * @param {string} registerData.email - 邮箱
 * @param {string} registerData.captcha - 邮箱验证码
 * @param {string} registerData.password - 密码
 * @param {string} [registerData.phone] - 手机号（可选）
 * @param {string} [registerData.nickname] - 昵称（可选）
 * @param {string} [registerData.avatar] - 头像URL（可选）
 * @returns {Promise<AuthResponse>} 认证响应数据
 */
export const registerApi = (registerData) => {
  return postAction('/v1/auth/register', registerData)
}

/**
 * 发送邮箱验证码API
 * @param {string} email - 邮箱地址
 * @returns {Promise} 发送结果
 */
export const sendCaptchaApi = (email) => {
  return postAction('/v1/auth/captcha', { email })
}
