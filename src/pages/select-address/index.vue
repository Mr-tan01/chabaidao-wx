<template>
  <text class="manage" @click="manageAddress = !manageAddress">{{
    manageAddress ? '完成' : '管理'
  }}</text>
  <view class="address-view" v-for="(item, index) in userAddress" :key="index">
    <view class="address-flex" @click="selectAddress(item)">
      <view class="select-address">
        <text>{{ item.address }}</text>
        <text class="user-detail-address">{{ item.detailedAddress }}</text>
        <view class="select-user">
          <text>{{ item.name }}</text>
          <text>{{ item.mobile }}</text>
        </view>
      </view>
      <text class="default-address" v-if="item.defaultAddress">默认</text>
    </view>
    <view class="address-flex setting" v-if="manageAddress">
      <text @click="setDefault(index, item._id)">设为默认</text>
      <text @click="deleteAddress(index, item._id)">删除</text>
    </view>
  </view>
  <button class="add-button" @click="subMit">添加地址</button>
  <!-- 空收货地址提示 -->
  <Tips :noData="noData" :tips="tips"></Tips>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { request } from '@/api/request'
import type { Address } from '@/types/userinfo'
import Tips from '../component/tips.vue'

// 获取地址
const userAddress = ref<Address[]>([])
onShow(async () => {
  const res = await request<Address[]>('/get-user-address')
  // console.log(res)
  userAddress.value = res.data
})

// 点击管理还是完成
const manageAddress = ref(false)
// 设置默认收货地址
interface Id {
  _id: string
}
async function setDefault(index: number, _id: string) {
  const queryId: Id = {
    _id
  }
  await request('/set-default-address', queryId)
  // 更新默认地址标识
  userAddress.value.forEach((item) => (item.defaultAddress = false))
  userAddress.value[index].defaultAddress = true
}
// 删除收货地址
async function deleteAddress(index: number, _id: string) {
  const queryId: Id = {
    _id
  }
  await request('/delete-user-address', queryId)
  // 移除选中的地址
  userAddress.value.splice(index, 1)
}
// 监听地址变化
const noData = ref(false)
const tips = ref('暂无收货地址，请添加收货地址')
watch(
  userAddress,
  (newVal) => {
    // 如果为空地址则进行提示
    noData.value = newVal.length > 0 ? false : true
    if (newVal.length <= 0) {
      // 重置管理按钮
      manageAddress.value = false
    }
  },
  { deep: true }
)

// 添加地址
function subMit() {
  uni.navigateTo({
    url: '/pages/add-address/index'
  })
}

// 下单选择地址
import { receiverAddress } from '@/store'
const addressStore = receiverAddress()
function selectAddress(item: Address) {
  addressStore.uploadAddress({
    address: item.address,
    detailedAddress: item.detailedAddress,
    name: item.name,
    mobile: item.mobile
  })
  uni.navigateBack({ delta: 1 })
}
</script>

<style>
page {
  background-color: #f5f5f5;
}
.manage {
  text-align: right;
  padding: 20rpx 20rpx 0 0;
}
.address-view {
  background-color: #fefefe;
  padding: 0 20rpx;
  border-radius: 10rpx;
  margin: 20rpx;
}
.address-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.address-view image {
  width: 40rpx;
}
.default-address {
  color: #777777;
}
.setting {
  padding: 20rpx 0;
  border-top: 1rpx solid #f2f2f2;
  color: #777777;
  font-size: 28rpx;
}
</style>
