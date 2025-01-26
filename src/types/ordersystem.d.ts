// 计算用户和商家距离请求类型
export type Distance = {
  distance: string
}

// 商品sku子属性请求类型
export type SubAttributes = {
  disabled: boolean
  name: string
  selected: string
  statsId: string
  _id: string
}
// 商品sku父属性请求类型
export type Sku = {
  disabled: boolean
  name: string
  selected: string
  _id: string
  subAttributes: SubAttributes[]
}
// 商品请求类型
export type Category = {
  category_id: string
  goods_describe: string
  goods_image: string
  goods_name: string
  goods_price: number
  goods_sales: number
  goods_stock: number
  quantity: number
  _id: string
  goods_stats: Sku[]
}
// 分类和商品请求类型
export type AllGoods = {
  categoryName: string
  icon: string
  _id: string
  category: Category[]
}

// 商品sku列表请求类型
export type GoodsSku = {
  goods_id: string
  price: number
  stock: number
  _id: string
  skuId: string[]
  specs: string[]
}
