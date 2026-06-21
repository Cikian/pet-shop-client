/**
 * [已废弃] 商品相关 API 模块
 * ⚠️ 新代码不要再使用此模块。商品详情、加入购物车等请求
 * 请直接在 views/Product.vue（或其他页面组件）内通过
 * api/http.js 的 getAction/postAction 发起，URL 定义放在
 * 组件顶部的 urls 对象里。
 */
import { getAction } from './http.js'

export const productApi = {
  getProductDetail: (productId) => getAction(`/goods/detail/${productId}`)
}

export default productApi
