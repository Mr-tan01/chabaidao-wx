export const requestUrl: string = 'http://127.0.0.1:7001'
const requestAddress = requestUrl + '/api/wx'
export const uploadFileUrl = requestUrl + '/api/admin/uploadFile'

// 取出本地缓存用户token
import { Base64 } from 'js-base64'
function getToken(): string {
  const token: string = uni.getStorageSync('wxUserInfo').user_Token || ''
  // 因为后端是Basic格式
  const base64Token = Base64.encode(token + ':')
  return 'Basic ' + base64Token
}

// 定义一个泛型接口 Data，用于表示包含数据、错误信息和消息的通用数据结构
interface Data<T> {
  // data: T 表示数据部分，类型为泛型 T，可以根据实际情况指定具体类型
  data: T
  error: any
  msg: string
}

export const request = <T>(
  url: string,
  data: object = {},
  method: 'GET' | 'POST' = 'GET'
) => {
  return new Promise<Data<T>>((resolve, reject) => {
    uni.request({
      url: requestAddress + url,
      method,
      data,
      header: { Authorization: getToken() },
      // 返回的数据是不确定类型的，所以不需要进行类型断言
      success: (res) => {
        const status = res.statusCode
        // 根据不同的状态码进行不同的处理
        switch (status) {
          case 200:
            resolve(res.data as Data<T>)
            break
          case 404:
            console.error('接口不存在')
            // 调用 Promise 的 reject 方法，表示 Promise 被拒绝
            // 参数 '404' 表示拒绝的原因，通常是一个错误码或错误信息
            reject('404')
            break
          case 401:
            // 未登录状态则保留当前页跳转到登录页
            uni.navigateTo({ url: '/pages/login/index' })
            console.error('没有权限')
            reject('401')
            break
          case 500:
          case 501:
          case 503:
            uni.showToast({
              title: '服务器异常',
              icon: 'none'
            })
            console.error('服务器错误')
            reject('出现异常错误')
            break
          case 400:
            console.error((res.data as Data<T>).msg)
            reject('400')
            break
          case 422:
            uni.showToast({
              title: (res.data as Data<T>).msg,
              icon: 'none'
            })
            console.error(422)
            reject('422')
            break
        }
      },
      fail: (err: any) => {
        uni.showToast({
          title: err,
          icon: 'none'
        })
        reject('400')
      }
    })
  })
}
