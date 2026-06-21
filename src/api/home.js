/**
 * [已废弃] 首页 API 模块
 * ⚠️ 新代码不要再使用此模块。首页轮播图/分类/精选推荐等请求
 * 请直接在 views/Home.vue 组件内通过 api/http.js 的 getAction 发起，
 * URL 定义放在组件顶部的 urls 对象里。
 */
import { getAction } from './http'

export const getSlideListApi = () => getAction('/home/slide')
export const getHomeCategoriesApi = () => getAction('/home/cate')
export const getHomeRecommendApi = () => getAction('/home/recommend')
export const getHomeDiscountApi = () => getAction('/home/discount')
