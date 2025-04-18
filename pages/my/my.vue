<script setup>
import { ref } from 'vue'
import { login, getUserInfo,logout,updateUserInfo} from '../../api/user.js'
import { baseUrl } from '../../utils/request.js'
const popup = ref()
const isGetAvatar = ref(false)
const avatar = ref()
const nickname = ref()
const userId = ref('')
const user = ref({
  nickname: uni.getStorageSync('userName'),
  avatar: uni.getStorageSync('avatar')
})
const loginResultCopy = ref()
const handleLogin = async () => {
	//登录成功后再点击头像不会弹出登录框
  if(!uni.getStorageSync('refreshToken')){
	  uni.showLoading({
	  	title: '加载中'
	  })
	  try{
		  // 微信登录获取 code
		  const loginRes = await new Promise((resolve, reject) => {
		    uni.login({
		      provider: 'weixin',
		      success: resolve,
		      fail: reject
		    })
		  })
		  console.log(loginRes.code)
		  // 调用 login 接口，获取 userId
		  const loginResult = await login(loginRes.code)
		  console.log(loginResult);
		  userId.value = loginResult.data.userId
		  loginResultCopy.value = loginResult.data
		  uni.hideLoading()
		  //如果已经有数据则直接登录
		  if(loginResult.data.userName && loginResult.data.avatar){
			  user.value.nickname = loginResult.data.userName
			   user.value.avatar = loginResult.data.avatar
			   userId.value = loginResult.data.userId
			   uni.setStorageSync('userName',loginResult.data.userName)
			   uni.setStorageSync('avatar',loginResult.data.avatar)
			   uni.setStorageSync('userId',loginResult.data.userId)
			   uni.setStorageSync('refreshToken',loginResult.data.refreshToken)
			   uni.setStorageSync('accessToken',loginResult.data.accessToken)
			   //存入学校代号
			   uni.setStorageSync('schoolCode',loginResult.data.school.schoolCode)
			   uni.setStorageSync('isAdmin',loginResult.data.isAdmin) //是否为管理员
			   uni.showToast({
			    title: '登录成功',
			    icon: 'none'
			   })
		  }
		  //否则弹出登录框
		  else{
			    popup.value.open()
			    uni.hideTabBar()
		  }
	  }catch(err){
		  console.error('Error:', err)
		  uni.showToast({
		    title: '登录失败，请重试',
		    icon: 'none'
		  })
	  }
    }
}

const submit = async () => {
  if (!avatar.value) {
    uni.showToast({
      title: '请选择头像',
      icon: 'none'
    })
    return
  }
  if (!nickname.value) {
    uni.showToast({
      title: '请输入昵称',
      icon: 'none'
    })
    return
  }

	//上传头像图片
	console.log(userId.value);
	console.log(avatar.value);
	uni.uploadFile({
		url: baseUrl + '/api/v1/user/avatar',
		method: 'POST',
		header: {
			"Content-Type": "application/json" , 
		},
		filePath: avatar.value,
		name: 'avatar',
		formData: {
			userId: userId.value,
		},
		success: async (res) => {
			console.log(res);
				const resData = JSON.parse(res.data)
				console.log(resData);
				//上传头像和昵称到后端
				const updateUserInfoRes = await updateUserInfo({
					userId: userId.value,
					userName: nickname.value,
					schoolCode:'',
					realName:'',
					phone:'',
					avatar: resData.data.avatarUrl,
					gender: 0,
					signature:''
				})
				console.log(updateUserInfoRes);
				//将图片存入本地
				uni.setStorageSync('avatar',resData.data.avatarUrl)
				user.value.avatar = avatar.value
				//将昵称和token存入本地
				uni.setStorageSync('accessToken',loginResultCopy.value.accessToken)
				uni.setStorageSync('refreshToken',loginResultCopy.value.refreshToken)
				uni.setStorageSync('userId',userId.value)
				uni.setStorageSync('userName',nickname.value)
				user.value.nickname = nickname.value
				uni.showToast({
				  title: '登录成功',
				  icon: 'success'
				})
				uni.showModal({
					title:'提示',
				    content:'个人信息暂未完善，请前往补充个人信息',
					confirmText: '前往完善',
					showCancel: false,
					confirmColor: '#5cc280',
				    success: async (result) =>{
				        if(result.confirm){
				      	   gotoMyInfo()
				        }
				    },
					fail: (err) => {
						console.error('Error:', err)
					}
				})
			},
			fail: (err) => {
				console.log(err)
			}
	})
	
    popup.value.close()
    setTimeout(() => {
      uni.showTabBar()
    }, 300)
  } 

const cancel = () => {
  popup.value.close()
  setTimeout(() => {
    uni.showTabBar()
  }, 300)
}

const onChooseAvatar = (e) => {
  console.log(e)
  if (e.detail.avatarUrl) {
    avatar.value = e.detail.avatarUrl
    isGetAvatar.value = true

  } else {
    uni.showToast({
      title: '头像授权失败',
      icon: 'none'
    })
  }
}
const gotoMyInfo = () => {
  uni.navigateTo({
    url: '/pages/my/myInfo/myInfo'
  })
}
const gotoMyFavorite = () =>{
	uni.navigateTo({
		url: '/pages/my/myFavorite/myFavorite'
	})
}
const gotoMyPost = () => {
	uni.navigateTo({
		url: '/pages/my/myPost/myPost'
	})
}
const gotoMyMarket = () =>{
	uni.navigateTo({
		url:'/pages/my/myMarket/myMarket'
	})
}
const loginOut = () => {
	if(!uni.getStorageSync('refreshToken')){
		uni.showToast({
		  title: '请先登录',
		  icon: 'none'
		})
		return
	}
    uni.showModal({
    	title:'提示',
	    content:'确定要退出登录吗?',
		confirmColor: '#5cc280',
	    success: async (result) =>{
	        if(result.confirm){
	      	    //调用退出登录接口
	      	    const res = await logout(userId.value);
	      	    console.log(res);
	      	    uni.showToast({
	      	      title: '退出成功',
	      	      icon: 'success'
	      	    })
				uni.removeStorageSync('accessToken')
				uni.removeStorageSync('refreshToken')
				uni.removeStorageSync('userId')
				uni.removeStorageSync('userName')
				uni.removeStorageSync('avatar')
				uni.removeStorageSync('schoolCode')
				uni.removeStorageSync('isAdmin')
	      	    user.value.avatar = ''
	      	    user.value.nickname = ''
	        }
	    },
		fail: (err) => {
			console.error('Error:', err)
			uni.showToast({
			  title: '退出失败，请重试',
			  icon: 'none'
			})
		}
    })
}
onLoad(()=>{
	user.value.avatar = uni.getStorageSync('avatar')
	user.value.nickname = uni.getStorageSync('userName')
})
onShow(()=>{
	if(uni.getStorageSync('refreshToken')){
		if(!uni.getStorageSync('schoolCode')){
			uni.showModal({
				title:'提示',
			    content:'学校校区暂未认证，请前往完善',
				confirmText: '前往完善',
				showCancel: false,
				confirmColor: '#5cc280',
			    success: async (result) =>{
			        if(result.confirm){
			      	   gotoMyInfo()
			        }
			    },
				fail: (err) => {
					console.error('Error:', err)
				}
			})
		}
	}
})
</script>

<template>
  <view class="container">
    <!-- 顶部个人信息 -->
    <view class="profile" @tap="handleLogin">
      <view class="profile-info">
        <image class="avatar" :src="user.avatar || '../../static/avatar0.png'" mode="aspectFill"></image>
        <view class="login-text">{{user.nickname||'点击登录/注册'}}</view>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu">
        <view @tap="gotoMyInfo()" class="menu-item" hover-class="hover">
			<view class="left">
				<uni-icons type="person-filled" size="22" color="#2bc192"></uni-icons>
				<view class="text">个人信息</view>
			</view>
			<view class="right">
				<view class="arrow">&#x203A;</view>
			</view>
        </view>
        <view class="menu-item" hover-class="hover" @tap="gotoMyFavorite()">
			<view class="left">
				<uni-icons type="star-filled" size="22" color="#2bc192"></uni-icons>
				<view class="text">记录与收藏</view>
			</view>
            <view class="arrow">&#x203A;</view>
        </view>
        <view class="menu-item" hover-class="hover" @tap="gotoMyPost()">
			<view class="left">
				<uni-icons type="chat-filled" size="22" color="#2bc192"></uni-icons>
				<view class="text">我的帖子</view>
			</view>
            <view class="arrow">&#x203A;</view>
        </view>
		<view class="menu-item" hover-class="hover" @tap="gotoMyMarket()">
			<view class="left">
				<uni-icons type="cart-filled" size="22" color="#2bc192"></uni-icons>
				<view class="text">我的集市</view>
			</view>
		    <view class="arrow">&#x203A;</view>
		</view>
	</view>
	<view class="menu">
        <view class="menu-item" hover-class="hover">
			<view class="left">
				<uni-icons type="headphones" size="22" color="#2bc192"></uni-icons>
				<view class="text">建议与反馈</view>
			</view>
            <view class="arrow">&#x203A;</view>
			<button open-type="contact"></button>
        </view>
        <view class="menu-item" hover-class="hover" @tap="loginOut()">
			<view class="left">
				<uni-icons type="minus-filled" size="22" color="#2bc192"></uni-icons>
				<view class="text">退出登录</view>
			</view>
            <view class="arrow">&#x203A;</view>
        </view>
    </view>

  
	
	<uni-popup ref="popup" type="bottom" :mask-click="false" background-color="#fff1f6" border-radius="10px 10px 0 0">
		<view class="pop_tip">请输入你的昵称和头像</view>
		<button class="pop_avatar" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
			<image class="pop_img" v-if="isGetAvatar" :src="avatar"></image>
			<view v-else>获取头像</view>
		</button>
		 <input class="pop_nickname" placeholder="请输入你的昵称" type="nickname" v-model="nickname" />
		 <view class="pop_btn">
			<button class="btn" @tap="cancel()">取消</button>
		 	<button class="btn_log" @tap="submit()">确认</button>
		 </view>
		
	</uni-popup>
		
  </view>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  height: 100vh;
  
}
.hover {
	background-color: #f5f5f5;
}
/* 顶部个人信息区域 */
.profile {
  background:
  linear-gradient(to bottom,transparent,#f5f5f5),
  linear-gradient(to right, #17ff7f,#68cbdf);
  height: 140rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #ffffff;
}

.login-text {
  margin-left: 20rpx;
  font-size: 36rpx;
}

/* 菜单列表 */
.menu {
  width: 700rpx;
  margin: 0 auto;
  margin-top: 20rpx;
  border: 1px solid #eee;
  border-radius: 18rpx;
  box-shadow: 0 0 30rpx rgba(0,0,0,0.05);
  background-color: #ffffff;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1px solid #eee;
  font-size: 32rpx;
  height: 70rpx;
  position: relative;
  .left{
	  display: flex;
	  align-items: center;
	  .text{
		  margin-left: 10rpx;
		  color: #555;
		  margin-bottom: 2rpx;
	  }
  }
  .arrow {
    font-size: 40rpx;
    color: #aaa;
  }
  button{
	  position: absolute;
	  top: 0;
	  left: 0;
	  height: 102rpx;
	  width: 100%;
	  opacity: 0;
  }
}

.menu-item:last-child {
  border-bottom: none;
}


.pop_tip{
	font-size: 33rpx;
	color: gray;
	text-align: center;
	padding: 20rpx;
}
.pop_avatar{
	width: 175rpx;
	height: 175rpx;
	border-radius: 50%;
	background:gainsboro;
	font-size: 29rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0;
}
.pop_img{
	width: 100%;
	height: 100%;
	border-radius: 50%;
}
.pop_nickname{
	width: 350rpx;
	font-size: 33rpx;
	color: gray;
	border: 1px solid gray;
	text-align: center;
	padding: 20rpx;
	margin: 35rpx auto;
}
.pop_btn{
	display: flex;
	margin-bottom: 35rpx;
}
.btn {
	width: 50%;
}
.btn_log{
	width: 50%;
	background-color: yellowgreen;
	color: white
}
</style>
