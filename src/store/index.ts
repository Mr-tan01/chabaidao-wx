import { defineStore } from 'pinia'
import type { CartItem, ReceiverAddress } from '@/types/cart'
import Decimal from 'decimal.js'

// 购物车数据状态管理
export const getCartStatus = defineStore('shoppingcart', {
  state: () => ({
    cartItems: [] as CartItem[]
  }),
  getters: {
    // 计算购物车里的合计总价
    paymentPrice(): number {
      // 将单个商品总价进行累加
      const res = this.cartItems.reduce(
        (subtotal, goodsItem) => subtotal + goodsItem.totalPrice,
        0
      )
      return Number(new Decimal(res).toFixed(2))
    },
    // 计算购物车有多少商品
    getCartCount(): number {
      const res = this.cartItems.reduce(
        (subtotal, goodsItem) => subtotal + goodsItem.goodsQuantity,
        0
      )
      return res
    }
  },
  actions: {
    // 商品详情页里提交商品到购物车
    addToCart(item: CartItem) {
      // 判断是否有重复商品提交，如果有，则只更新数量和总价
      const existingItem = this.cartItems.find((cartItem) => {
        return (
          cartItem.goods_id === item.goods_id && item.sku_id === cartItem.sku_id
        )
      })
      // 商品出现重复，只更新数量和总价
      if (existingItem) {
        // 更新数量，判断是那个页面提交的购物车，true为下单页，false为详情页
        if (item.homePage) {
          existingItem.goodsQuantity = item.goodsQuantity
        } else {
          existingItem.goodsQuantity += item.goodsQuantity
        }
        const num1 = new Decimal(existingItem.goodsPrice)
        const num2 = new Decimal(existingItem.goodsQuantity)
        // 计算总价
        const totalPrice = Number(num1.times(num2).toString())
        // 更新总价
        existingItem.totalPrice = totalPrice
      } else {
        // 商品没有重复，直接添加到购物车
        const num1 = new Decimal(item.goodsPrice)
        const num2 = new Decimal(item.goodsQuantity)
        // 计算总价
        const totalPrice = Number(num1.times(num2).toString())
        item.totalPrice = totalPrice
        // 没有重复则直接添加新对象商品
        this.cartItems.push(item)
      }
    },
    // 找出购物车里数量为0的商品，并删除
    removeEmptyArrays() {
      this.cartItems.forEach((item, index) => {
        if (item.goodsQuantity === 0) {
          this.cartItems.splice(index, 1)
        }
      })
    }
  }
})

// 首页轮播推荐商品跳转到点单页面，找到该商品去下单
interface Goodsis {
  categoryId: string
  goodsId: string
}
export const pageGoodsId = defineStore('pageGoodsId', {
  state: () => ({
    goodsId: [] as Goodsis[]
  }),
  actions: {
    uploadGoodsId(item: Goodsis) {
      this.goodsId = [item]
    }
  }
})

// 存储首页用户选择的配送类型
export const pagePlaceOrder = defineStore('pagePlaceOrder', {
  state: () => ({
    // 默认外卖
    orderType: '2'
  })
})

// 存储用户选中的收货地址
export const receiverAddress = defineStore('receiverAddress', {
  state: () => ({
    addressItems: [] as ReceiverAddress[]
  }),
  actions: {
    uploadAddress(item: ReceiverAddress) {
      this.addressItems = [item]
    }
  }
})
