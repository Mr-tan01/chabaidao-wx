<template>
  <!-- 底部购物车 -->
  <view class="to-checkout" v-if="cartData.payMentPrice > 0">
    <view class="product-quantity" @click="showCart = true">
      <text>{{ cartData.getCartCount }}</text>
      <image src="/static/gouwuche.png" mode="widthFix" />
    </view>
    <view class="checkout-price">合计¥{{ cartData.payMentPrice }}</view>
    <button @click="gotoResult" v-if="pagePlaceOrder().orderType == '1'">
      去结算
    </button>
    <button
      @click="gotoResult"
      v-else
      :disabled="
        cartData.payMentPrice >= getMerchanInfo().initialPrice ? false : true
      "
    >
      {{
        cartData.payMentPrice >= getMerchanInfo().initialPrice
          ? '去结算'
          : `差¥${liFtingPrice}起送`
      }}
    </button>
  </view>
  <!-- 遮罩层 -->
  <view class="popup-cart" v-show="showCart" @click="showCart = false"></view>
  <!-- 购物车里的详细商品 -->
  <view class="cart-shadow" v-show="showCart">
    <view class="delete-cart">
      <image src="/static/shanchu.png" mode="widthFix" @click="deleGoods" />
    </view>
    <!-- 商品列表 -->
    <view
      class="item-cart-goods"
      v-for="(item, index) in cartData.cartItem"
      :key="index"
    >
      <image class="item-goods-img" :src="item.goods_image" mode="aspectFill" />
      <view class="item-goods-speci">
        <text>{{ item.goods_name }}</text>
        <text>{{ item.sku.length > 0 ? item.sku.join('/') : '' }}</text>
        <text>¥{{ item.goodsPrice }}</text>
      </view>
      <view class="select-goods single-goods">
        <image
          src="/static/jian-goods.png"
          mode="widthFix"
          @click="minusQuantity(index)"
        />
        <text>{{ item.goodsQuantity }}</text>
        <image
          src="/static/jia-goods.png"
          mode="widthFix"
          @click="addQuantity(index)"
        />
      </view>
    </view>
  </view>
  <!-- 是否打烊 -->
  <view class="close-up-shop" v-if="closeTime"
    >店铺已打烊 营业时间{{ getMerchanInfo().businessHours.join('-') }}</view
  >
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getCartStatus, pagePlaceOrder } from '@/store/index'
import { getMerchanInfo } from '@/api/menubuttom'
import Decimal from 'decimal.js'
import { onLoad } from '@dcloudio/uni-app'
import moment from 'moment'
// 使用中国区语言
moment.locale('zh-cn')

const cartStore = getCartStatus()
// 监听购物车数据变化
const cartData = computed(() => {
  // console.log(cartStore.cartItems)
  // 当商品减为0时进行删除商品
  cartStore.removeEmptyArrays()
  // 如果购物车为空则隐藏购物车
  if (cartStore.cartItems.length <= 0) {
    showCart.value = false
  }
  return {
    getCartCount: cartStore.getCartCount, // 购物车数量
    payMentPrice: cartStore.paymentPrice, // 购物车支付总价
    cartItem: cartStore.cartItems // 购物车商品
  }
})

// 购物车显示和隐藏
const showCart = ref(false)

// 清空购物车
const deleGoods = () => {
  cartStore.cartItems = []
  showCart.value = false
}

// 减商品数量
function minusQuantity(index: number) {
  // $path 多个字段进行批量更新
  cartStore.$patch((val) => {
    val.cartItems[index].goodsQuantity--
    val.cartItems[index].totalPrice =
      val.cartItems[index].goodsQuantity * val.cartItems[index].goodsPrice
  })
}
// 加商品数量
function addQuantity(index: number) {
  cartStore.$patch((val) => {
    val.cartItems[index].goodsQuantity++
    val.cartItems[index].totalPrice =
      val.cartItems[index].goodsQuantity * val.cartItems[index].goodsPrice
  })
}

// 外卖差多少起送
const liFtingPrice = computed(() => {
  // 起送价
  const num1 = new Decimal(getMerchanInfo().initialPrice)
  // console.log(num1)
  // 支付总价
  const num2 = new Decimal(cartData.value.payMentPrice)
  // console.log(num2)
  return Number(num1.minus(num2).toString())
})

// 是否打烊
const closeTime = ref(false)
onLoad(() => {
  // 起始时间
  const openingTime = moment(getMerchanInfo().businessHours[0], 'HH:mm:ss')
  // 结束时间
  const closingTime = moment(getMerchanInfo().businessHours[1], 'HH:mm:ss')
  // 是否之间，返回布尔值
  const is = moment().isBetween(openingTime, closingTime, undefined, '[]')
  closeTime.value = is ? false : true
})

// 跳转下单页面
function gotoResult() {
  uni.navigateTo({
    url: '/pages/payment/index'
  })
}
</script>

<style>
/* 底部购物车 */
.to-checkout {
  height: 110rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  padding: 0 20rpx;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
}
.product-quantity {
  position: relative;
  width: 80rpx;
}
.product-quantity image {
  width: 80rpx;
}
.product-quantity text {
  font-size: 18rpx;
  position: absolute;
  top: 0;
  right: 0;
  color: #ffffff;
  width: 32rpx;
  height: 32rpx;
  line-height: 32rpx;
  text-align: center;
  border-radius: 50%;
  background-color: #8ad842;
}
.checkout-price {
  flex: 1;
  font-size: 35rpx;
  font-weight: bold;
  padding: 0 30rpx;
}
.to-checkout button {
  background-color: #214bd5;
  border-radius: 15rpx;
  color: #ffffff;
  font-size: 35rpx;
  padding: 15rpx 60rpx;
}
/* 弹出购物车 */
.popup-cart {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 9;
  display: flex;
  align-items: flex-end;
}
.cart-shadow {
  position: fixed;
  bottom: 110rpx;
  left: 0;
  right: 0;
  background-color: #fefefe;
  width: 100%;
  max-height: 760rpx;
  overflow-y: auto;
  z-index: 99;
  animation: slide-up 0.3s ease;
}
@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
.delete-cart {
  display: flex;
  justify-content: flex-end;
  padding: 20rpx;
}
.delete-cart image {
  width: 36rpx;
}
.item-cart-goods {
  display: flex;
  align-items: center;
  padding: 20rpx;
}
.item-goods-img {
  width: 130rpx;
  height: 130rpx;
  border-radius: 10rpx;
}
.item-goods-speci {
  flex: 1;
  padding: 0 15rpx;
  font-size: 28rpx;
}
.item-goods-speci text:nth-child(1) {
  font-weight: bold;
}
.item-goods-speci text:nth-child(2) {
  font-size: 25rpx;
  padding: 10rpx 0;
}
.item-goods-speci text:nth-child(3) {
  font-weight: bold;
}
/* 打烊 */
.close-up-shop {
  background-color: #b8b8b8;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  height: 110rpx;
  line-height: 110rpx;
  z-index: 999;
}
</style>
