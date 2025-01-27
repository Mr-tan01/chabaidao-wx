import { defineStore } from 'pinia'
import type { CartItem } from '@/types/cart'
import Decimal from 'decimal.js'

export const getCartStatus = defineStore('shoppingcart', {
  state: () => ({
    cartItems: [] as CartItem[]
  }),
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
        // 更新数量
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
    }
  }
})
