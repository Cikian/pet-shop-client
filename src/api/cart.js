import { getAction, postAction } from './http.js'

export const addToCartApi = (params) => {
    return postAction('/cart', params)
}

export const getCartListApi = (params) => {
    return getAction('/cart/list', params)
}

