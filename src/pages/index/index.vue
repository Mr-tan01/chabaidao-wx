<template>
  <!-- 顶部轮播图 -->
  <view class="swiper-view">
    <swiper
      class="swiper-img"
      autoplay
      circular
      :current="currentIndex"
      @change="changeCurrent"
    >
      <swiper-item v-for="(item, index) in swiperList" :key="index">
        <image
          :src="item.carouselImages"
          mode="aspectFill"
          @click="recommendGoods(item.categoryId, item.goodsId)"
        />
      </swiper-item>
    </swiper>
    <!-- 自定义指示点 -->
    <view class="indicator">
      <text
        :class="{ 'select-text': index == currentIndex }"
        v-for="(item, index) in swiperList"
        :key="index"
      ></text>
    </view>
  </view>
  <!-- 到店和外卖选择 -->
  <view class="buy-btn">
    <view
      v-for="(item, index) in orderAction"
      :key="index"
      @click="routerOder(item.orderType)"
    >
      <image :src="item.icon" mode="widthFix" />
      <text>{{ item.text }}</text>
    </view>
  </view>
  <!-- 广告区域 -->
  <view class="advertisement">
    <image
      :src="item"
      mode="aspectFill"
      v-for="(item, index) in adAction"
      :key="index"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '@/api/request'
import type { SwiperItem } from '@/types/index'

// 顶部轮播图
const swiperList = ref<SwiperItem[]>()

onLoad(async () => {
  const res = await request<SwiperItem[]>('/get-swiper')
  swiperList.value = res.data
})
// 指示点初始状态
const currentIndex = ref(0)
// 自定义指示点的滚动下标值
function changeCurrent(event: { detail: { current: number } }) {
  currentIndex.value = event.detail.current
}

// 到店和外卖选择
const orderAction = ref([
  {
    icon: '/static/daodian.png',
    text: '到店自取',
    // 标识到店自取
    orderType: '1'
  },
  {
    icon: '/static/waimai.png',
    text: '外卖',
    orderType: '2'
  }
])

// 广告区域
const adAction = ref([
  'http://ge.thexxdd.cn/kecheng-chabaidao/banner001.jpg',
  'http://ge.thexxdd.cn/kecheng-chabaidao/banner002.jpg'
])

// 推荐图跳转到商品详情页
import { pageGoodsId, pagePlaceOrder } from '@/store/index'
function recommendGoods(categoryId: string, goodsId: string) {
  uni.switchTab({ url: '/pages/ordersystem/index' })
  pageGoodsId().uploadGoodsId({ categoryId, goodsId })
}

// 选择配送类型
function routerOder(orderType: string) {
  uni.switchTab({ url: '/pages/ordersystem/index' })
  // 修改配送类型
  pagePlaceOrder().$patch((val) => {
    val.orderType = orderType
  })
}
</script>

<style>
page {
  background-color: #f1f1f1;
}
.swiper-view {
  height: 800rpx;
  position: relative;
}
.swiper-img,
image {
  height: 800rpx;
  width: 100%;
}
.indicator {
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 20rpx;
  left: 35rpx;
}
.indicator text {
  width: 35rpx;
  height: 8rpx;
  background: aqua;
  border-radius: 6rpx;
  margin: 5rpx;
}
.select-text {
  background: chartreuse !important;
}
/* 到店自取，外卖 */
.buy-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.buy-btn view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fefefe;
  border-radius: 30rpx;
  width: 50%;
  height: 260rpx;
  margin: 20rpx;
}
.buy-btn image {
  width: 150rpx;
}
.buy-btn text {
  font-size: 37rpx;
  font-weight: bold;
  padding-top: 10rpx;
}
/* 广告 */
.advertisement {
  margin: 20rpx;
}
.advertisement image {
  width: 100%;
  height: 220rpx;
  border-radius: 10rpx;
  display: block;
  margin: 20rpx 0;
}
</style>
