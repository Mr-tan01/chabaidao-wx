<template>
  <!-- 搜索区域子组件 -->
  <TopArea :distance="merchantDistance.distance" />
  <!-- 商品区域 -->
  <view class="order-menu">
    <!-- 左边 -->
    <scroll-view
      class="scroll-height-left"
      scroll-y
      enhanced
      enable-passive
      :show-scrollbar="false"
    >
      <view
        class="left-goods"
        :class="{ activeStyle: index === dynamiIdex }"
        v-for="(item, index) in allGoods"
        :key="index"
        @click="anchorConnection(item._id, index)"
      >
        <image :src="item.icon" mode="widthFix" />
        <text>{{ item.categoryName }}</text>
      </view>
    </scroll-view>
    <!-- 右边 -->
    <scroll-view
      class="scroll-height-right"
      scroll-y
      enhanced
      enable-passive
      :show-scrollbar="false"
      :scroll-into-view="subElementId"
      @scroll="scrollHeight"
    >
      <view
        class="item-goods"
        v-for="(item, index) in allGoods"
        :key="index"
        :id="`A${item._id}`"
      >
        <text class="category-title">{{ item.categoryName }}</text>
        <!-- 嵌套遍历 -->
        <view
          class="goods-infor"
          v-for="(item_a, index_a) in item.category"
          :key="index_a"
          @click="selectGoods(index, index_a, item._id, item_a._id)"
        >
          <image :src="item_a.goods_image" mode="aspectFill" />
          <view class="product-name">
            <text class="googs-name">{{ item_a.goods_name }}</text>
            <text class="googs-intro overflow-text">{{
              item_a.goods_describe
            }}</text>
            <view class="select-goods">
              <view class="goods-price">
                <text>¥{{ item_a.goods_price }}</text>
                <text>起</text>
              </view>
              <!-- 商品规格 -->
              <block v-if="item_a.goods_stock > 0">
                <view
                  class="select-quantity"
                  v-if="item_a.goods_stats.length > 0"
                >
                  <button>选规格</button>
                  <!-- 用户是否有加购 -->
                  <text v-if="item_a.quantity > 0">{{ item_a.quantity }}</text>
                </view>
                <view class="select-goods single-goods" v-else>
                  <image
                    src="/static/jian-goods.png"
                    mode="widthFix"
                    v-if="item_a.quantity > 0"
                    @click.stop="
                      addSingleProduct(
                        index,
                        index_a,
                        item._id,
                        item_a._id,
                        '001'
                      )
                    "
                  />
                  <text v-if="item_a.quantity > 0">{{ item_a.quantity }}</text>
                  <image
                    src="/static/jia-goods.png"
                    mode="widthFix"
                    @click.stop="
                      addSingleProduct(
                        index,
                        index_a,
                        item._id,
                        item_a._id,
                        '002'
                      )
                    "
                  />
                </view>
              </block>
              <view v-else>
                <button disabled>已售罄</button>
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- 使商品不被tabbar区域遮住 -->
      <view style="height: 400rpx"></view>
    </scroll-view>
  </view>
  <!-- 购物车区域子组件 -->
  <ShoppingCart />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import TopArea from './components/top-area.vue'
import ShoppingCart from './components/shopping-cart.vue'
import { request } from '@/api/request'
import type { Distance, AllGoods } from '@/types/ordersystem.d'
import type { CartItem } from '@/types/cart'
import { getCartStatus } from '@/store/index'
const cartStore = getCartStatus()
//#region
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
      allGoodsData()
    },
    fail: (err) => {
      // console.log(err)
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
// 获取所有分类和商品
const allGoods = ref<AllGoods[]>([])
async function allGoodsData() {
  const res = await request('/all-goods')
  // console.log(res)
  allGoods.value = res.data as AllGoods[]
  setTimeout(() => {
    itemGoodsHeigh()
  }, 900)
}
//#endregion

// 计算右边每个分类高度
const itemHeight = ref<number[]>([])
function itemGoodsHeigh() {
  let totalHeight = 0
  const query = uni.createSelectorQuery()
  // 获取匹配选择器的所有节点
  query.selectAll('.item-goods').boundingClientRect()
  query.exec((heightDate: { height: number }[][]) => {
    // console.log(heightDate)
    // 计算出各分类商品高度存入数组
    heightDate[0].forEach((item) => {
      totalHeight += Number(item.height.toFixed(2))
      itemHeight.value.push(totalHeight)
    })
  })
  // console.log(itemHeight.value)
}

// 左边分类滚动指定商品
const dynamiIdex = ref(0)
const subElementId = ref('')
function anchorConnection(id: string, index: number) {
  // 点击背景色切换
  dynamiIdex.value = index
  // 滚动到指定商品
  subElementId.value = `A${id}`
  // 重复点击商品时，重复触发
  setTimeout(() => {
    subElementId.value = ''
  }, 200)
}
// 右边商品滚动指定分类
function scrollHeight(event: { detail: { scrollTop: number } }) {
  // console.log(event)
  const scrollTop = Number(event.detail.scrollTop.toFixed(2))
  // console.log(scrollTop)
  // 判断滚动距离
  if (scrollTop >= itemHeight.value[dynamiIdex.value]) {
    //下拉判断
    dynamiIdex.value += 1
  } else if (scrollTop < itemHeight.value[dynamiIdex.value - 1]) {
    //上拉判断
    dynamiIdex.value -= 1
  }
}

// 点击进入详情页
function selectGoods(
  index: number,
  index_a: number,
  fatherId: string,
  sonId: string
) {
  const theGoods = allGoods.value[index].category[index_a]
  const str = JSON.stringify({ theGoods, fatherId, sonId })
  uni.navigateTo({
    // 传递商品相关参数
    url: `/pages/specifications/index?goods=` + str
  })
}

// 对没有规格的商品进行加减数量
function addSingleProduct(
  index: number,
  index_a: number,
  fatherId: string,
  sonId: string,
  type: string
) {
  if (type === '001') {
    allGoods.value[index].category[index_a].quantity--
  } else {
    allGoods.value[index].category[index_a].quantity++
  }
  const theGoods = allGoods.value[index].category[index_a]
  const item: CartItem = {
    // 分类id
    fatherId,
    // 商品id
    sonId,
    // 商品名称
    goods_name: theGoods.goods_name,
    goods_image: theGoods.goods_image,
    goods_id: theGoods._id,
    goodsPrice: theGoods.goods_price,
    // 商品数量
    goodsQuantity: theGoods.quantity,
    // 商品总价
    totalPrice: 0,
    // 商品规格
    sku: [],
    // 商品规格id
    skuIdArr: [],
    // sku对象唯一id
    sku_id: '',
    // true标识为从下单页提交到购物车
    homePage: true
  }
  // 提交
  getCartStatus().addToCart(item)
}
// 监听购物车加减变化，而改变下单页加减变化
watch(
  () => cartStore.cartItems.map((item) => item.goodsQuantity),
  (newVal, oldVal): void => {
    for (let i = 0; i < newVal.length; i++) {
      if (newVal[i] !== oldVal[i]) {
        // console.log(cartStore.cartItems[i])
        var changedItem = cartStore.cartItems[i]
      }
    }
    // 购物车为空则不再执行'
    if (cartStore.cartItems.length <= 0) return
    // 这里找出相同商品，取出父级id和子级id、价格
    let goodsPrice = 0
    let fatherId = ''
    let sonId = ''
    cartStore.cartItems.forEach((item) => {
      // 如果是相同商品不同规格的话，则不同规格数量相加
      if (changedItem && item.goods_id === changedItem.goods_id) {
        goodsPrice += item.goodsQuantity
        fatherId = item.fatherId
        sonId = item.sonId
      }
    })
    // 根据当前点击的商品父级id和子级id查找下标进行更新
    let parentIndex = allGoods.value.findIndex((item) => item._id === fatherId)
    if (parentIndex >= 0) {
      const category = allGoods.value[parentIndex].category
      const childIndex = category.findIndex((item) => item._id === sonId)
      // 更新对应商品数量
      allGoods.value[parentIndex].category[childIndex].quantity =
        // @ts-ignore
        goodsPrice
    }
  }
)
// 监听如果清空购物车，将当前页面商品数量重置为0
watch(
  () => cartStore.cartItems,
  (newVal) => {
    if (newVal.length <= 0) {
      if (allGoods.value.length > 0) {
        allGoods.value.forEach((item) => {
          item.category.forEach((item_a) => {
            item_a.quantity = 0
          })
        })
      }
    }
  }
)
</script>

<style>
/* 商品区域 */
.order-menu {
  display: flex;
}
/* 左边商品分类滚动 */
.scroll-height-left {
  height: 100vh;
  width: 175rpx;
  background-color: #f8f8f8;
  position: fixed;
  left: 0;
}
.left-goods {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 25rpx;
  padding: 15rpx 0;
}
.left-goods image {
  width: 65rpx;
}
.left-goods title {
  padding-top: 10rpx;
  color: #777777;
}
.activeStyle {
  background-color: antiquewhite;
}
/* 右边商品 */
.scroll-height-right {
  flex: 1;
  padding: 0 20rpx;
  height: 100vh;
  position: fixed;
  right: 0;
  left: 175rpx;
  width: auto;
}
.item-goods {
  padding-top: 35rpx;
}
.category-title {
  font-weight: bold;
}
.goods-infor {
  display: flex;
  align-items: center;
  padding-top: 35rpx;
}
.goods-infor image {
  width: 170rpx;
  height: 170rpx;
  border-radius: 15rpx;
}
.product-name {
  flex: 1;
  padding-left: 15rpx;
}
.googs-name {
  font-weight: bold;
  font-size: 29rpx;
}
.googs-intro {
  line-height: 1.4;
  color: #b8b8b8;
  font-size: 25rpx;
  margin: 13rpx 0;
}
.select-goods {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.goods-price {
  display: flex;
  flex: 1;
}
.goods-price text:nth-child(1) {
  font-size: 30rpx;
  font-weight: bold;
  padding-right: 10rpx;
}
.goods-price text:nth-child(2) {
  font-size: 24rpx;
  color: #b8b8b8;
  align-self: flex-end;
}
.select-quantity {
  position: relative;
}
.select-quantity button {
  font-size: 28rpx;
  line-height: inherit;
  background-color: #214bd5;
  color: #ffffff;
  padding: 5rpx 20rpx;
  border-radius: 40rpx;
}
.select-quantity text {
  position: absolute;
  top: -7rpx;
  right: 0;
  background: bisque;
  border-radius: 50%;
  width: 30rpx;
  height: 30rpx;
  font-size: 18rpx;
  text-align: center;
  line-height: 30rpx;
}
.single-goods image {
  width: 45rpx;
}
.single-goods text {
  font-size: 26rpx;
  width: 63rpx;
  text-align: center;
}
</style>
