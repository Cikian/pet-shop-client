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
