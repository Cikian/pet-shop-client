import { getAction } from './http'

/**
 * 首页API模块
 * 提供首页相关数据接口，如轮播图等
 */

/**
 * 获取轮播图列表API
 * @returns {Promise<SlideItem[]>} 轮播图数据列表
 */
export const getSlideListApi = () => {
  return getAction('/home/slide')
}

/**
 * 获取首页推荐分类API
 * @returns {Promise<CategoryItem[]>} 推荐分类数据列表
 */
export const getHomeCategoriesApi = () => {
  return getAction('/home/cate')
}

/**
 * 获取首页精选推荐商品API
 * @returns {Promise<ProductItem[]>} 精选推荐商品列表
 */
export const getHomeRecommendApi = () => {
  return getAction('/home/recommend')
}

/**
 * 获取首页限时优惠商品API
 * @returns {Promise<ProductItem[]>} 限时优惠商品列表
 */
export const getHomeDiscountApi = () => {
  return getAction('/home/discount')
}
