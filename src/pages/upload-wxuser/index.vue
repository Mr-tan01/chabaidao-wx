<template>
  <view class="user-avatar">
    <image :src="userInfo.avatar" mode="aspectFill" @click="uploadAvatar" />
  </view>
  <view class="user-nickname">
    <text>昵称</text>
    <input type="text" placeholder="请输入新昵称" v-model="userInfo.nickname" />
  </view>
  <button class="change-infor" @click="changeInfo">确认修改</button>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
import { uploadFileUrl, request } from '@/api/request'

const userInfo = reactive({
  nickname: '',
  avatar: '/static/logo.png'
})
// 取出本地用户信息
onLoad(() => {
  let getUserInfo = uni.getStorageSync('wxUserInfo') as {
    avatar: string
    nickname: string
  }
  if (getUserInfo) {
    userInfo.avatar = getUserInfo.avatar
    userInfo.nickname = getUserInfo.nickname
  }
})
// 上传头像
function uploadAvatar() {
  // 获取图片
  uni.chooseMedia({
    count: 1,
    mediaType: ['image'],
    success: (res) => {
      // 上传图片
      uni.uploadFile({
        url: uploadFileUrl,
        name: 'file',
        filePath: res.tempFiles[0].tempFilePath,
        success: (uploadRes) => {
          console.log(uploadRes)
          const imgUrl = JSON.parse(uploadRes.data) as { data: string }
          // 更新图片
          userInfo.avatar = imgUrl.data
        },
        fail: (uploadErr) => {
          uni.showToast({
            title: '上传失败',
            icon: 'error'
          })
        }
      })
    },
    fail: (err) => {
      uni.showToast({
        title: '上传失败',
        icon: 'error'
      })
    }
  })
}
// 修改用户信息
interface Fordata {
  avatar: string
  nickname: string
}
async function changeInfo() {
  uni.showLoading({
    title: '修改中',
    mask: true
  })
  const FormData: Fordata = {
    avatar: userInfo.avatar,
    nickname: userInfo.nickname
  }
  await request('/uploadWxUser', FormData, 'POST')
  let getUserInfo = uni.getStorageSync('wxUserInfo') as {
    avatar: string
    nickname: string
  }
  getUserInfo.avatar = userInfo.avatar
  getUserInfo.nickname = userInfo.nickname
  // 更新本地用户信息
  uni.setStorageSync('wxUserInfo', getUserInfo)
  uni.hideLoading()
  // 成功后返回上一页
  uni.navigateBack({ delta: 1 })
}
</script>

<style>
.user-avatar image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  margin: 35rpx auto;
}
.user-nickname {
  display: flex;
  align-items: center;
  padding: 20rpx;
}
.user-nickname input {
  flex: 1;
  padding: 20rpx;
  border-bottom: 1rpx solid #f6f6f6;
  margin-left: 15rpx;
}
.change-infor {
  padding: 20rpx 0;
  margin: 40rpx 20rpx 20rpx 20rpx;
  font-size: 30rpx;
  background-color: #214bd5;
  color: #ffffff;
}
</style>
