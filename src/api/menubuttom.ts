// 获取本地胶囊按钮信息
export const getMenuButton = () => {
  const menuButton: any = uni.getStorageSync('MenuButton')
  const top = menuButton.top + 'px'
  const height = menuButton.height + 'px'
  const left = menuButton.left - 30 + 'px'
  const width = menuButton.width + 50 + 'px'
  // 外边距和自身高度总高度
  const seViewHeight = menuButton.top + menuButton.height + 'px'
  return {
    top,
    height,
    left,
    width,
    seViewHeight
  }
}

// 定义一个接口 MerchanInfoType，用于描述商家信息的结构
interface MerchanInfoType {
  _id: string
  tradeName: string
  address: string
  initialPrice: number
  businessHours: string[]
  location: number[]
}

// 获取本地商家数据
export const getMerchanInfo = () => {
  // 从本地存储中获取商家信息对象，并解构出其中的各个属性
  const { _id, tradeName, address, initialPrice, businessHours, location } =
    uni.getStorageSync('merchantInfo')
  // 创建一个新的商家信息对象，并将解构出的属性赋值给新对象的对应属性
  const res: MerchanInfoType = {
    _id, // 商家的唯一标识符
    tradeName, // 商家的名称
    address, // 商家的地址
    initialPrice, // 商家的起送价格
    businessHours, // 商家的营业时间
    location // 商家的地理位置信息
  }
  return res
}
