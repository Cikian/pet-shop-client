/**
 * @fileoverview 商城数据类型定义
 * 定义商品、分类、购物车等核心数据结构
 */

/**
 * 商品数据接口
 * @typedef {Object} Product
 * @property {string} id - 商品唯一标识符
 * @property {string} name - 商品名称
 * @property {number} price - 商品价格
 * @property {number} [originalPrice] - 商品原价（用于显示折扣）
 * @property {string} image - 商品主图片URL
 * @property {string[]} images - 商品图片列表
 * @property {string} category - 商品分类ID
 * @property {number} rating - 商品评分 (0-5)
 * @property {number} reviewCount - 评价数量
 * @property {string} description - 商品描述
 * @property {number} stock - 库存数量
 * @property {string[]} tags - 商品标签列表
 * @property {boolean} [isFavorite] - 是否收藏
 * @property {Date} [createdAt] - 创建时间
 * @property {Date} [updatedAt] - 更新时间
 */

/**
 * 商品分类数据接口
 * @typedef {Object} Category
 * @property {string} id - 分类唯一标识符
 * @property {string} name - 分类名称
 * @property {string} icon - 分类图标名称（Element Plus图标）
 * @property {string} image - 分类展示图片URL
 * @property {number} productCount - 该分类下的商品数量
 * @property {string} [description] - 分类描述
 * @property {number} [sortOrder] - 排序权重
 * @property {boolean} [isActive] - 是否启用
 */

/**
 * 购物车商品项数据接口
 * @typedef {Object} CartItem
 * @property {Product} product - 商品信息
 * @property {number} quantity - 商品数量
 * @property {boolean} selected - 是否选中（用于结算）
 * @property {Date} [addedAt] - 添加到购物车的时间
 */

/**
 * 购物车状态数据接口
 * @typedef {Object} CartState
 * @property {CartItem[]} items - 购物车商品列表
 * @property {boolean} isVisible - 购物车是否可见（侧滑状态）
 */

/**
 * 轮播图数据接口
 * @typedef {Object} Banner
 * @property {string} id - 轮播图唯一标识符
 * @property {string} title - 轮播图标题
 * @property {string} subtitle - 轮播图副标题
 * @property {string} image - 轮播图图片URL
 * @property {string} [link] - 点击跳转链接
 * @property {string} [buttonText] - 按钮文字
 * @property {string} [backgroundColor] - 背景颜色
 * @property {string} [textColor] - 文字颜色
 * @property {boolean} [isActive] - 是否启用
 * @property {number} [sortOrder] - 排序权重
 */

/**
 * 商品筛选条件接口
 * @typedef {Object} ProductFilter
 * @property {string} [category] - 分类筛选
 * @property {string} [keyword] - 搜索关键词
 * @property {number} [minPrice] - 最低价格
 * @property {number} [maxPrice] - 最高价格
 * @property {number} [minRating] - 最低评分
 * @property {string[]} [tags] - 标签筛选
 * @property {boolean} [inStock] - 是否有库存
 */

/**
 * 商品排序选项
 * @typedef {'default'|'price-asc'|'price-desc'|'rating'|'name'|'sales'} SortOption
 */

/**
 * API响应基础接口
 * @typedef {Object} ApiResponse
 * @property {boolean} success - 请求是否成功
 * @property {string} [message] - 响应消息
 * @property {*} [data] - 响应数据
 * @property {number} [code] - 响应状态码
 */

/**
 * 分页数据接口
 * @typedef {Object} PaginationData
 * @property {number} page - 当前页码
 * @property {number} pageSize - 每页数量
 * @property {number} total - 总数量
 * @property {number} totalPages - 总页数
 */

/**
 * 商品列表响应接口
 * @typedef {Object} ProductListResponse
 * @property {Product[]} products - 商品列表
 * @property {PaginationData} pagination - 分页信息
 * @property {ProductFilter} filters - 当前筛选条件
 */

/**
 * 用户数据接口
 * @typedef {Object} User
 * @property {string} id - 用户唯一标识符
 * @property {string} username - 用户名
 * @property {string} nickname - 昵称
 * @property {string} avatar - 头像URL
 * @property {string} birthday - 生日
 * @property {number} sex - 性别 (0: 未知, 1: 男, 2: 女)
 * @property {string} email - 邮箱
 * @property {string} phone - 手机号
 * @property {string} userSource - 用户来源
 * @property {number} status - 状态
 * @property {string} lastLoginTime - 最后登录时间
 * @property {string} lastLoginIp - 最后登录IP
 * @property {string} createTime - 创建时间
 */

/**
 * 认证响应接口
 * @typedef {Object} AuthResponse
 * @property {string} accessToken - 访问令牌
 * @property {string|null} refreshToken - 刷新令牌
 * @property {string} tokenType - 令牌类型
 * @property {number|null} expiresIn - 过期时间（秒）
 * @property {User} user - 用户信息
 * @property {string[]} authorities - 权限列表
 */

/**
 * 登录请求接口
 * @typedef {Object} LoginRequest
 * @property {string} username - 用户名或邮箱
 * @property {string} password - 密码
 */

/**
 * 注册请求接口
 * @typedef {Object} RegisterRequest
 * @property {string} userName - 用户名
 * @property {string} email - 邮箱
 * @property {string} captcha - 邮箱验证码
 * @property {string} password - 密码
 * @property {string} [phone] - 手机号（可选）
 * @property {string} [nickname] - 昵称（可选）
 * @property {string} [avatar] - 头像URL（可选）
 */

/**
 * API标准响应接口
 * @typedef {Object} ApiStandardResponse
 * @template T
 * @property {boolean} success - 请求是否成功
 * @property {string} message - 响应消息
 * @property {number} code - 响应状态码
 * @property {T} result - 响应数据
 * @property {number} timestamp - 时间戳
 */

// 导出类型定义（用于JSDoc引用）
export const Types = {
  /** @type {Product} */
  Product: {},
  /** @type {Category} */
  Category: {},
  /** @type {CartItem} */
  CartItem: {},
  /** @type {CartState} */
  CartState: {},
  /** @type {Banner} */
  Banner: {},
  /** @type {ProductFilter} */
  ProductFilter: {},
  /** @type {SortOption} */
  SortOption: 'default',
  /** @type {ApiResponse} */
  ApiResponse: {},
  /** @type {PaginationData} */
  PaginationData: {},
  /** @type {ProductListResponse} */
  ProductListResponse: {},
  /** @type {User} */
  User: {},
  /** @type {AuthResponse} */
  AuthResponse: {},
  /** @type {LoginRequest} */
  LoginRequest: {},
  /** @type {RegisterRequest} */
  RegisterRequest: {},
  /** @type {ApiStandardResponse} */
  ApiStandardResponse: {}
}