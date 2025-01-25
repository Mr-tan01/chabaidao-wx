<template>
  <view class="search-view">
    <!-- 自适应顶部高度与胶囊平行 -->
    <view :style="{ height: getMenuButton().top }"></view>
    <!-- 搜索框区域 -->
    <view class="search-input">
      <image src="/static/sousuo.png" mode="widthFix" />
      <input placeholder="搜索商品" placeholder-class="input-color" disabled />
    </view>
    <!-- 标题区域 -->
    <view class="merchant-store">
      <view class="address-view">
        <image src="/static/xing.png" mode="widthFix" />
        <!-- 商家名称 -->
        <text> {{ getMerchanInfo().tradeName }} </text>
        <text> 外卖到家 </text>
      </view>
      <view class="distance-view">
        <image src="/static/weizhi.png" mode="widthFix" />
        <text> 商家距离你{{ distance }} </text>
      </view>
    </view>
  </view>
  <!-- 整个搜索区域高度自适应 -->
  <view :style="{ height: spacingHeight }"></view>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { getMenuButton, getMerchanInfo } from '@/api/menubuttom'
import { onLoad } from '@dcloudio/uni-app'

// 获取该页面指定元素的高度
const spacingHeight = ref('')
const instance = getCurrentInstance()
onLoad(() => {
  const query: any = uni.createSelectorQuery().in(instance)
  query
    .select('.search-view') // 选择元素节点
    .boundingClientRect((rect: { height: number }) => {
      // console.log(rect)
      spacingHeight.value = rect.height + 'px'
    })
    .exec()
})

// 接收父组件距离值
// 使用 withDefaults 函数为 defineProps 提供默认值
withDefaults(
  defineProps<{
    distance: string
  }>(),
  {
    distance: '0米'
  }
)
</script>

<style>
/* 顶部搜索框 */
.search-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9;
  background-color: #ffffff;
}
.search-input {
  height: v-bind('getMenuButton().height');
  width: v-bind('getMenuButton().left');
}
.search-input input {
  height: v-bind('getMenuButton().height');
}
/*  距离和配送范围 */
.merchant-store {
  height: 150rpx;
  font-size: 35rpx;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 20rpx;
}
.merchant-store view {
  display: flex;
  align-items: center;
  padding: 10rpx 0;
}
.address-view text {
  padding: 0 10rpx;
}
.address-view text:nth-child(2) {
  flex: 1;
}
.address-view image {
  width: 30rpx;
}
.distance-view image {
  width: 27rpx;
}
.distance-view text {
  font-size: 28rpx;
  color: #999999;
  font-weight: initial;
  padding-left: 15rpx;
}
</style>
