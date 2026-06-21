/**
 * [已废弃] 认证 API 模块
 * ⚠️ 新代码不要再使用此模块。登录/注册/发送验证码等请求
 * 请直接在对应页面组件内通过 api/http.js 的 getAction/postAction 发起，
 * URL 定义放在对应页面组件顶部的 urls 对象里。
 * 所有请求/响应仍然会经过 api/http.js 中配置的请求/响应拦截器。
 */
import { postAction } from './http'

export const loginApi = (username, password) => {
  return postAction('/v1/auth/login', { username, password })
}

export const registerApi = (registerData) => {
  return postAction('/v1/auth/register', registerData)
}

export const sendCaptchaApi = (email) => {
  return postAction('/v1/auth/captcha', { email })
}
