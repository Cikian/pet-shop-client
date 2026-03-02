import { getAction } from './http.js'

/**
 * 商品相关 API
 */
export const productApi = {
  /**
   * 获取商品详情
   * @param {string} productId - 商品ID
   * @returns {Promise} 商品详情数据
   */
  getProductDetail: (productId) => {
    return getAction(`/goods/detail/${productId}`)
  }
}

export default productApi