// 购物车商品数据类型
export type CartItem = {
  // 分类id
  fatherId: string
  // 商品id
  sonId: string
  // 商品名称
  goods_name: string
  goods_image: string
  goods_id: string
  goodsPrice: number
  // 商品数量
  goodsQuantity: number
  // 商品总价
  totalPrice: number
  // 商品规格
  sku: string[]
  // 商品规格id
  skuIdArr: string[]
  // sku对象唯一id
  sku_id: string
  // 判断有没有规格的商品
  homePage?: boolean
}

// 确认订单用户选择的收货地址类型
export type ReceiverAddress = {
  address: string
  detailedAddress: string
  mobile: string
  name: string
}

// 自提订单类型
export type SelfPickupOrder = {
  orderType: string
  userMobile: string
  productOrder: CartItem[]
}
// 外卖订单类型
export type OutdoorDining = {
  orderType: string
  receiverAddress: ReceiverAddress[]
  productOrder: CartItem[]
}

// 我的订单列表类型
export type UserOrderList = {
  orderType: string
  paymentPrice: number
  productOrderCount: number
  _id: string
  productOrder: CartItem[]
}
// 订单详情类型
export type UserOrderDetails = {
  oerderTime: string
  orderNumber: string
  orderType: '1'
  paymentPrice: number
  takeMealCode: number
  _id: string
  productOrder: CartItem[]
  receiverAddress: ReceiverAddress[]
}
