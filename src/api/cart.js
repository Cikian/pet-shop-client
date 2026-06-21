/**
 * [已废弃] 购物车 API 模块
 * ⚠️ 新代码不要再使用此模块。购物车列表 / 添加商品等请求
 * 请直接在 views/Cart.vue / views/Product.vue 等页面组件内
 * 通过 api/http.js 的 getAction/postAction 发起，URL 定义
 * 放在组件顶部的 urls 对象里。
 */
import { getAction, postAction } from './http.js'

export const addToCartApi = (params) => postAction('/cart', params)
export const getCartListApi = (params) => getAction('/cart/list', params)
