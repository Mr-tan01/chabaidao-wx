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
