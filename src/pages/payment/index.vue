<template>
  <!-- 自提订单 -->
  <view class="pay-view" v-if="pagePlaceOrder().orderType == '1'">
    <view class="merchant-address">
      <text>{{ getMerchanInfo().tradeName }}</text>
    </view>
    <text class="datail-address">{{ getMerchanInfo().address }}</text>
    <view class="user-phone">
      <text>联系电话</text>
      <input type="number" placeholder="请输入联系电话" v-model="mobile" />
    </view>
  </view>
  <!-- 外卖订单 -->
  <view class="pay-view" v-if="pagePlaceOrder().orderType == '2'">
    <view
      class="merchant-address"
      v-if="addressStore.addressItems.length <= 0"
      @click="selectAddress"
    >
      <text>选择收货地址</text>
      <image src="/static/jiantou-right.png" mode="widthFix" />
    </view>
    <view
      class="select-address"
      v-else
      v-for="(item, index) in addressStore.addressItems"
      :key="index"
      @click="selectAddress"
    >
      <text>{{ item.address }}</text>
      <text class="user-detail-address">{{ item.detailedAddress }}</text>
      <view class="select-user">
        <text>{{ item.name }}</text>
        <text>{{ item.mobile }}</text>
      </view>
    </view>
    <view class="user-phone delivery">
      <text>{{ getMerchanInfo().tradeName }}</text>
      <text>订单由商家自己配送</text>
    </view>
  </view>
  <!-- 订单详情 -->
  <view class="pay-view">
    <view
      class="item-order"
      v-for="(item, index) in cartStore.cartItems"
      :key="index"
    >
      <image :src="item.goods_image" mode="aspectFill" />
      <view class="order-speci">
        <text>{{ item.goods_name }}</text>
        <text>{{ item.sku.length > 0 ? item.sku.join('/') : '' }}</text>
        <text>x{{ item.goodsQuantity }}</text>
      </view>
      <view class="order-price">¥{{ item.totalPrice }}</view>
    </view>
  </view>
  <!-- 支付 -->
  <view class="initiate-payment">
    <text>待支付¥{{ cartStore.paymentPrice }}</text>
    <button @click="wxPayment">支付</button>
  </view>
  <!-- 防遮罩 -->
  <view style="height: 200rpx"></view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getMerchanInfo } from '@/api/menubuttom'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/api/request'
import type { Address } from '@/types/userinfo'
import type {
  ReceiverAddress,
  SelfPickupOrder,
  OutdoorDining
} from '@/types/cart'
import { receiverAddress, pagePlaceOrder, getCartStatus } from '@/store'
const addressStore = receiverAddress()
const cartStore = getCartStatus()

// 自提订单的用户手机号码
const mobile = ref('')

// 获取用户的默认收货地址
onLoad(async () => {
  const res = await request<ReceiverAddress[]>('/default-address')
  // console.log(res)
  if (res.data.length > 0) {
    addressStore.uploadAddress(res.data[0])
  }
})

// 选择收货地址
function selectAddress() {
  uni.navigateTo({ url: '/pages/select-address/index' })
}

// 提交订单
async function wxPayment() {
  uni.showLoading({
    title: '支付中',
    mask: true
  })
  // 外卖还是自提
  if (pagePlaceOrder().orderType == '1') {
    // 自提
    const orderData: SelfPickupOrder = {
      orderType: pagePlaceOrder().orderType,
      userMobile: mobile.value,
      productOrder: cartStore.cartItems
    }
    await request('/selfpickup-order', orderData, 'POST')
  } else {
    // 外卖
    const orderData: OutdoorDining = {
      orderType: pagePlaceOrder().orderType,
      receiverAddress: addressStore.addressItems,
      productOrder: cartStore.cartItems
    }
    await request('/outdoor-order', orderData, 'POST')
  }
  // 清空购物车和收货地址
  addressStore.addressItems = []
  cartStore.cartItems = []
  uni.hideLoading()
  // 跳转我的订单
  uni.switchTab({ url: '/pages/orders/index' })
}
</script>

<style>
page {
  background-color: #f9fafa;
}
.merchant-address {
  display: flex;
  align-items: center;
  font-size: 35rpx;
  font-weight: bold;
  padding: 20rpx 0;
}
.merchant-address image {
  width: 25rpx;
  margin-left: 10rpx;
}
.detail-address {
  color: #6b6f7b;
  font-size: 28rpx;
  padding-bottom: 20rpx;
}
.user-phone {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  font-size: 28rpx;
  border-top: 1rpx solid #f2f2f2;
}
.user-phone input {
  flex: 1;
  margin-left: 15rpx;
}
.iphone-style {
  padding: 5rpx;
}
.item-order {
  padding: 20rpx 0 !important;
}
/* 外卖订单 */
.delivery text:nth-child(1) {
  color: #a5a5a5;
}
.delivery text:nth-child(2) {
  color: #e8504a;
}

/* 发起支付 */
.initiate-payment {
  background-color: #fefefe;
  padding: 20rpx 20rpx 68rpx 20rpx;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.initiate-payment button {
  background-color: #214bd5;
  border-radius: 40rpx;
  color: #ffffff;
  font-size: 35rpx;
  padding: 15rpx 90rpx;
}
.initiate-payment text {
  font-size: 35rpx;
  font-weight: bold;
}
</style>
