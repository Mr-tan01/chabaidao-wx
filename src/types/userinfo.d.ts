// 用户登录信息类型
export type UserInfo = {
  avatar: string
  nickname: string
  user_Token: string
  _id: string
}
// 收获地址类型
export type Address = {
  address: string
  defaultAddress: boolean
  detailedAddress: string
  mobile: string
  name: string
  _id: string
}

// 聊天消息类型
export type MessageData = {
  avatar: string
  message: string
  messagetype: string
  nickname: string
  userid: string
}
