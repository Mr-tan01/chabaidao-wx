<template>
  <view class="search-view">
    <view class="search-input">
      <image src="/static/sousuo.png" mode="widthFix" />
      <input
        type="text"
        placeholder="搜索商品"
        placeholder-class="input-color"
        v-model="keyword"
        focus
        confirm-type="search"
        @confirm="searchData"
        @input="inputRrigger"
      />
    </view>
  </view>
  <view style="height: 70rpx"></view>
  <!-- 搜索商品列表 -->
  <view class="secrch-goods" v-for="(item, index) in goodsData" :key="index">
    <image :src="item.goods_image" mode="aspectFill" />
    <view class="search-goods-name">
      <text>{{ item.goods_name }}</text>
      <text>{{ item.goods_price }}</text>
    </view>
    <button
      v-if="item.goods_stock > 0"
      @click="selectGoods(item.category_id, item._id, item)"
    >
      加购
    </button>
    <button v-else>已售罄</button>
  </view>
  <!-- 公用提示组件 -->
  <Tips :noData="noData"></Tips>
  <view style="height: 200rpx"></view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { request } from '@/api/request'
import type { Category } from '@/types/ordersystem'
import { onReachBottom } from '@dcloudio/uni-app'
import Tips from '../component/tips.vue'

const keyword = ref('')
const page = ref(1)
const noData = ref(false)
// 键盘搜索
function searchData() {
  page.value = 1
  triggerSearch()
}

// 开始搜索
const goodsData = ref<Category[]>([])
async function triggerSearch() {
  if (keyword.value.trim() === '') {
    return
  }
  const res = await request<Category[]>('/search-goods', {
    keyword: keyword.value,
    page: page.value
  })
  // console.log(res)
  // 上拉刷新将数组合并
  goodsData.value = [...goodsData.value, ...res.data]
  // 搜索是否为空
  if (page.value === 1) {
    noData.value = res.data.length > 0 ? false : true
  }
}

// 键盘输入
function inputRrigger() {
  // 如果用户再次输入其他词则清空上一次列表商品
  goodsData.value = keyword.value.trim() === '' ? [] : goodsData.value
}

// 上拉加载
onReachBottom(() => {
  page.value++
  // 触发搜索
  triggerSearch()
})

// 去详情页加购
function selectGoods(fatherId: string, sonId: string, theGoods: Category) {
  const str = JSON.stringify({ theGoods, fatherId, sonId })
  uni.navigateTo({
    // 传递商品相关参数
    url: `/pages/specifications/index?goods=` + str
  })
}
</script>

<style>
.search-view {
  background-color: #ffffff;
  height: 70rpx;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
  padding-right: 20rpx;
  padding-bottom: 10rpx;
}
.search-input input {
  height: 70rpx;
}
.secrch-goods {
  display: flex;
  margin: 20rpx;
}
.secrch-goods image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 15rpx;
}
.search-goods-name {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 20rpx;
}
.search-goods-name text:nth-child(1) {
  font-weight: bold;
  font-size: 29rpx;
}
.search-goods-name text:nth-child(2) {
  font-size: 24rpx;
  font-weight: bold;
}
.secrch-goods button {
  margin: 0;
  align-self: flex-end;
  font-size: 28rpx;
  background-color: #214bd5;
  color: #ffffff;
  padding: 5rpx 20rpx;
}
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #b8b8b8;
  padding-top: 200rpx;
}
.no-data image {
  width: 300rpx;
}
</style>
