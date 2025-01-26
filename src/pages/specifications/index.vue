<template>
  <view class="return-view">
    <!-- 自适应顶部高度与胶囊平行 -->
    <view :style="{ height: getMenuButton().top }"></view>
    <image src="/static/fanhui.png" mode="heightFix" @click="preVious" />
  </view>
  <block v-for="(item, index) in goodsData" :key="index">
    <!-- 商品详情图 -->
    <image class="goods-image" :src="item.goods_image" mode="aspectFill" />
    <view class="product-Info">
      <text>{{ item.goods_name }}</text>
      <text>{{ item.goods_describe }}</text>
    </view>
    <!-- 规格 -->
    <view
      class="specifications-view"
      v-for="(item_a, index_a) in item.goods_stats"
      :key="index_a"
    >
      <text class="specification-title">{{ item_a.name }}</text>
      <view class="select-specifications">
        <button
          v-for="(item_c, index_c) in item_a.subAttributes"
          :key="index_c"
          :class="{ selected: item_c._id === item_a.selected }"
          :disabled="item_c.disabled"
          @click="
            selectSpec(
              item_a,
              item_c._id,
              item_c.statsId,
              item_a._id,
              item_c.name
            )
          "
        >
          {{ item_c.name }}
        </button>
      </view>
    </view>
  </block>
  <!-- 加购 -->
  <view class="shopping-cart-area">
    <view class="select-goods price-padd">
      <view class="shopping-price">¥{{ goodsPrice }}</view>
      <view class="select-goods single-goods">
        <image
          src="/static/jian-goods.png"
          mode="widthFix"
          v-if="orderQuantity > 0"
          @click="minusQuantity"
        />
        <text v-if="orderQuantity > 0">{{ orderQuantity }}</text>
        <image
          src="/static/jia-goods.png"
          mode="widthFix"
          @click="addQuantity"
        />
      </view>
    </view>
    <!-- 展示sku -->
    <view class="selected-option">
      <text v-for="(item, index) in selectedSku" :key="index"
        >{{ item.sku.name }}/</text
      >
    </view>
    <block v-for="(item, index) in goodsData" :key="index">
      <button
        v-if="item.goods_stock > 0"
        :disabled="buttonStyle.disabled"
        :style="{
          'background-color': buttonStyle.back,
          color: buttonStyle.color
        }"
      >
        加入购物车
      </button>
      <button disabled v-else>已售罄</button>
    </block>
  </view>
  <!-- 不被加购按钮区域遮住 -->
  <view style="height: 300rpx"></view>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMenuButton, getMerchanInfo } from '@/api/menubuttom'
import type { Category, GoodsSku, Sku } from '@/types/ordersystem.d'
import { request } from '@/api/request'

// 商品分类id
const parentLevel = ref('')
// 商品id
const sublevel = ref('')
// 商品详细数据
const goodsData = ref<Category[]>([])
// 商品展示价格
const goodsPrice = ref(0)
// 存储该商品的sku列表数据
const skuListData = ref<GoodsSku[]>([])
// 选中的sku的对象_id
const sku_id = ref('')
// 接收上一个页面参数
onLoad(async (event) => {
  const res = JSON.parse(event?.goods || '{}') as {
    theGoods: Category
    fatherId: string
    sonId: string
  }
  // console.log(res)
  parentLevel.value = res.fatherId
  sublevel.value = res.sonId
  goodsData.value = [res.theGoods]
  goodsPrice.value = res.theGoods.goods_price
  // 获取该商品的sku数据列表
  const skuList = await request<GoodsSku[]>('/goods-sku-list', {
    _id: res.sonId
  })
  // console.log(skuList)
  skuListData.value = skuList.data
})

// 存储用户选中的sku属性
interface SkuData {
  _id: string
  sku: { name: string; statsId: string }
}
const selectedSku = ref<SkuData[]>([])
// 选择属性（规格，子属性对象_id,子属性的id，规格对象_id,子属性名称）
function selectSpec(
  item_a: Sku,
  selectedId: string,
  statsId: string,
  nameId: string,
  sonName: string
) {
  // 选择和取消选择
  item_a.selected = item_a.selected === selectedId ? '' : selectedId
  let index = selectedSku.value.findIndex((item) => item._id === nameId)
  if (item_a.selected) {
    // 选中
    let newSelection = {
      _id: nameId,
      sku: {
        name: sonName,
        statsId
      }
    }
    // 如果已经选中
    if (index > -1) {
      // 同一规格父属性下的替换
      selectedSku.value.splice(index, 1, newSelection)
    } else {
      selectedSku.value.push(newSelection)
    }
  } else {
    // 取消选中
    if (index > -1) {
      selectedSku.value.splice(index, 1)
    }
  }
  // console.log(selectedSku.value)
}

// 监听库存是否充足，不足则禁用最后一个按钮
watch(
  selectedSku,
  (newVal) => {
    if (newVal.length >= goodsData.value[0].goods_stats.length - 1) {
      // 重置所有属性为可选
      resetOption()
      // 查询库存小于等于0的
      skuListData.value.forEach((item) => {
        if (item.stock <= 0) {
          let skuValueIds = item.skuId
          const mostValuesSelection =
            skuValueIds.filter((id) =>
              newVal.some((selection) => selection.sku.statsId === id)
            ).length >=
            goodsData.value[0].goods_stats.length - 1
          if (mostValuesSelection) {
            const remainingValueId = skuValueIds.find(
              (id) => !newVal.some((selection) => selection.sku.statsId === id)
            )
            goodsData.value[0].goods_stats.forEach((itm) => {
              itm.subAttributes.forEach((value) => {
                if (value.statsId === remainingValueId) {
                  value.disabled = true
                }
              })
            })
          }
        }
      })
    } else {
      // 重置所有属性为可选
      resetOption()
    }
    // 查询选中属性的sku价格
    if (newVal.length === goodsData.value[0].goods_stats.length) {
      const statsIds = newVal.map((item) => item.sku.statsId)
      const result = skuListData.value.find((sku) =>
        statsIds.every((item) => sku.skuId.includes(item))
      )
      goodsPrice.value = result?.price ?? 0
      // 存储用户选中的id，用于提交购物车查找进行库存计算
      sku_id.value = result?._id ?? ''
    } else {
      goodsPrice.value = goodsPrice.value
    }
  },
  { deep: true }
)

// 重置所有属性为可选
function resetOption() {
  goodsData.value[0].goods_stats.forEach((itm) => {
    itm.subAttributes.forEach((value) => {
      value.disabled = false
    })
  })
}

// 加入购物车的商品数量
const orderQuantity = ref(0)
// 减数量
function minusQuantity() {
  // 判断用户选中情况才能进行加减
  const isLengthMatch =
    selectedSku.value.length === goodsData.value[0].goods_stats.length
  if (isLengthMatch) {
    orderQuantity.value -= 1
  } else {
    uni.showToast({
      title: '请选择完整规格',
      icon: 'none'
    })
  }
}
// 加数量
function addQuantity() {
  // 判断用户选中情况才能进行加减
  const isLengthMatch =
    selectedSku.value.length === goodsData.value[0].goods_stats.length
  if (isLengthMatch) {
    orderQuantity.value += 1
  } else {
    uni.showToast({
      title: '请选择完整规格',
      icon: 'none'
    })
  }
}

// 提交购物车,得到css属性给视图层
const buttonStyle = computed(() => {
  // 判断是否可以进行提交
  if (goodsData.value.length > 0 && goodsData.value[0].goods_stats.length) {
    const isLengthMatch =
      selectedSku.value.length === goodsData.value[0].goods_stats.length
    // 如果已经选中规格，并且数量大于0，则可以提交
    if (isLengthMatch && orderQuantity.value > 0) {
      return {
        disabled: false,
        back: '#214bd5',
        color: '#ffffff'
      }
    } else {
      return {
        disabled: true,
        back: 'none',
        color: 'none'
      }
    }
  } else {
    if (orderQuantity.value > 0) {
      return {
        disabled: false,
        back: '#214bd5',
        color: '#ffffff'
      }
    } else {
      return {
        disabled: true,
        back: 'none',
        color: 'none'
      }
    }
  }
})

// 返回上一页
function preVious() {
  uni.navigateBack({
    delta: 1
  })
}
</script>

<style>
/* 选中属性加上样式 */
.selected {
  background-color: #214bd5 !important;
  color: #ffffff;
}
.return-view {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}
.return-view image {
  height: v-bind('getMenuButton().height');
  margin-left: 20rpx;
}
.goods-image {
  width: 100%;
  height: 550rpx;
}
.product-Info text {
  padding: 20rpx 20rpx 0 20rpx;
}
.product-Info text:nth-child(1) {
  font-size: 45rpx;
}
.product-Info text:nth-child(2) {
  font-size: 25rpx;
  line-height: 1.5;
}
/* 选择规格 */
.specifications-view {
  padding: 35rpx 20rpx 0 20rpx;
}
.specification-title {
  font-size: 28rpx;
  font-weight: bold;
  font-family: serif;
}
.select-specifications {
  display: flex;
  flex-wrap: wrap;
}
.select-specifications button {
  background-color: #ecf0f5;
  border-radius: 10rpx;
  padding: 10rpx 20rpx;
  font-size: 26rpx;
  margin: 20rpx 20rpx 0 0;
}
/* 底部购物车 */
.shopping-cart-area {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 68rpx;
  border-top: 1rpx solid #f5f5f5;
}
.price-padd {
  padding: 30rpx 20rpx;
}
.shopping-price {
  font-size: 40rpx;
  font-weight: bold;
}
.select-goods {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.single-goods image {
  width: 45rpx;
}
.single-goods text {
  font-size: 26rpx;
  padding: 0 27rpx;
}
.selected-option {
  display: flex;
  flex-wrap: wrap;
  padding: 0 20rpx;
  font-size: 25rpx;
  color: #979797;
}
.selected-option text {
  padding: 0 10rpx 10rpx 0;
}
.shopping-cart-area button {
  margin: 10rpx 20rpx;
  font-size: 30rpx;
  padding: 25rpx 0;
}
</style>
