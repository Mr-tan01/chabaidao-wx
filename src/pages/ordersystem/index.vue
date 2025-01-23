<template>
  <!-- 搜索区域子组件 -->
  <TopArea :distance="merchantDistance.distance" />
  <!-- 商品区域 -->
  <view>商品</view>
  <!-- 购物车区域子组件 -->
  <ShoppingCart />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import TopArea from './components/top-area.vue'
import ShoppingCart from './components/shopping-cart.vue'
import { request } from '@/api/request'
import type { Distance } from '@/types/ordersystem'

onLoad(() => {
  // 开始定位
  location()
})

// 定位
function location() {
  uni.getLocation({
    type: 'wgs84',
    success: (res) => {
      // console.log(res)
      rangeQuery(res.latitude, res.longitude)
    },
    fail: (err) => {
      console.log(err)
      locationHint()
    }
  })
}
// 未授权定位提示
function locationHint() {
  uni.showModal({
    title: '地址位置未授权',
    content: '请开启定位权限才可以下单',
    success: (res) => {
      // 打开手机权限设置
      uni.openSetting({
        success: (setRes) => {
          // 判断用户是否同意授权返回布尔值
          if (setRes.authSetting['scope.userLocation']) {
            // 用户授权成功开始定位
            location()
          } else {
            // 未授权定位提示
            locationHint()
          }
        }
      })
    },
    fail: (err) => {
      // 未授权定位提示
      locationHint()
    }
  })
}
// 获取计算距离
const merchantDistance = ref({ distance: '' })
async function rangeQuery(latitube: number, longitude: number) {
  // 调用计算距离接口
  const res = await request<Distance>('/distance-calculator', {
    latitube,
    longitude
  })
  // console.log(res)
  merchantDistance.value.distance = res.data.distance
}
</script>

<style></style>
