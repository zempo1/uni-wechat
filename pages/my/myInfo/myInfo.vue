<script setup>
import { ref} from 'vue';
import {getUserInfo,updateUserInfo,deleteUser } from '../../../api/user.js'
import { baseUrl } from '../../../utils/request.js';

const user = ref({
  userName: '',
  phone: '',
  avatar: '',
  gender: '',
  schoolCode: '',
  realName: '',
  signature:''
});
const userId = ref()
const genderArr = ['保密','男', '女'];
const schoolArr = ['东莞理工学院(松山湖校区)','东莞理工学院(莞城校区)','广东医科大学(湛江校区)','广东医科大学(东莞校区)','东莞职业技术学院(松山湖校区)','东莞职业技术学院(大岭山校区)','东莞职业技术学院(道滘校区)']
const schoolCodeArr = ['11819B','11819A','10571A','10571B','14263A','14263B','14263C']
const schoolIndex = ref();
const gender = ref();
const genderIndex = ref();
onLoad(async () => {
   // 获取用户信息
  userId.value = uni.getStorageSync('userId');
   console.log(userId.value);
   const userInfoResult = await getUserInfo(userId.value)
   console.log(userInfoResult);
   user.value.userName = userInfoResult.data.userName;
   user.value.avatar = userInfoResult.data.avatar;
   user.value.gender = userInfoResult.data.gender;
   user.value.phone = userInfoResult.data.phone
   //根据userInfoResult.data.schoolCode判断schoolCodeArr的索引
   if(userInfoResult.data.school){
	   for (let i = 0; i < schoolCodeArr.length; i++) {
	     if (schoolCodeArr[i] === userInfoResult.data.school.schoolCode) {
	       schoolIndex.value = i;
		   user.value.schoolCode = schoolCodeArr[schoolIndex.value];
	       break;
	     }
	   }
   }
   user.value.realName = userInfoResult.data.realName;
   genderIndex.value = user.value.gender;
   gender.value = genderArr[genderIndex.value];
});


const pickGender = (e) => {
  genderIndex.value = e.detail.value;
  user.value.gender = genderIndex.value;
  gender.value = genderArr[genderIndex.value];
};

const pickSchool = (e) => {
  schoolIndex.value = e.detail.value;
  user.value.schoolCode = schoolCodeArr[schoolIndex.value];
}
const onChooseAvatar = (e) => {
  console.log(e)
  //修改头像
  if (e.detail.avatarUrl) {
	uni.uploadFile({
		url: baseUrl + '/api/v1/user/avatar',
		method: 'POST',
		header: {
			"Content-Type": "application/json" , 
		},
		filePath: e.detail.avatarUrl,
		name: 'avatar',
		formData: {
			userId: userId.value,
		},
		success: (res =>{
			const resData = JSON.parse(res.data)
			console.log(resData);
			user.value.avatar = resData.data.avatarUrl;
		}),
		fail: (err => {
			console.log(err)
		})
	})
  } else {
    uni.showToast({
      title: '头像修改失败',
      icon: 'none'
    })
  }
}
const submit = async () => {
	if(user.value.schoolCode===''){
		uni.showToast({
			title: '请选择学校',
			icon: 'none'
		})
		return
	}
	
   const res = await updateUserInfo({
	    userId: userId.value,
		userName: user.value.userName,
		schoolCode: user.value.schoolCode,
		phone: user.value.phone,
		avatar: user.value.avatar,
		gender: user.value.gender,
		realName: user.value.realName,
		signature: user.value.signature
   })
   console.log(res);
   uni.setStorageSync('avatar', user.value.avatar);
   uni.setStorageSync('userName', user.value.userName);
   uni.setStorageSync('schoolCode', user.value.schoolCode);
   uni.showToast({
    title: '保存成功',
    icon: 'success'
  })
  setTimeout(() => {
	  uni.reLaunch({
	  	url: '/pages/my/my'
	  })
  },100)
}
const cancelUser = () => {
	uni.showModal({
		title: '注销账号',
		content: '注销账号将清空所有虚拟资产，是否继续？',
		confirmColor: '#e43d33',
		success: async (result) => {
			console.log(result);
			if (result.confirm) {
				const res = await deleteUser(userId.value)
				console.log(res);
				uni.clearStorageSync();
				uni.showToast({
					title: '注销成功',
					icon: 'success'
				})
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/my/my'
					})
				},100)
			}
		},
		fail: (err) => {
			console.log(err);
		}
	})
}
</script>

<template>
  <view class="container">
    <view class="herder">
      <text style="font-size: 50rpx;">个人中心</text>
    </view>

    <!-- 功能列表 -->
    <view class="menu">
      <view class="menu-item" >
        <h1>昵称</h1>
		<input type="userName" placeholder="请输入昵称" v-model="user.userName" class="userName" />
		<view class="arrow">></view>
      </view>
      <view class="menu-item" >
		<view class="left">
		    <h1>头像</h1>
		    <text style="font-size: 24rpx;color: #929292;">为保持展示效果，请上传1:1尺寸头像</text>
		</view> 
		<view class="right">
			<button class="avatar" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
				<image class="img" :src="user.avatar || '../../../static/avatar0.png'" mode="aspectFill"></image>
			</button>
			<view class="arrow">></view>
		</view>
      </view>
	  <view class="menu-item">
	  	<h1>性别</h1>
		<view class="pick">
			<picker @change="pickGender" :value="genderIndex" :range="genderArr">
				<view class="arrow">
					{{gender}} >
				</view>
			</picker>
		</view>
	  </view>
	  
      <view class="menu-item" >
        <h1>手机号</h1>
		<view style="display: flex;">
			<input placeholder="请输入手机号" v-model="user.phone" class="phone" />
			<view class="arrow">></view>
		</view>
      </view>
	  <view class="menu-item" >
	    <h1>真实姓名</h1>
	  		<view style="display: flex;">
	  			<input placeholder="请输入真实姓名" v-model="user.realName" class="phone" />
	  			<view class="arrow">></view>
	  		</view>
	  </view>
	 <view class="menu-item">
	 	<h1 style="color: red;">认证学校 *</h1>
	 		<view class="pick">
	 			<picker @change="pickSchool" :value="schoolIndex" :range="schoolArr">
					<view class="arrow" v-if="user.schoolCode!==null && schoolIndex==null">
						<text style="color: red;">请选择学校 ></text>
					</view>
	 				<view class="arrow" v-else>
	 					{{schoolArr[schoolIndex]}} >
	 				</view>
	 			</picker>
	 		</view>
	 </view>
      <view class="menu-item" >
       <view class="left">
           <h1>注销账号</h1>
           <text style="font-size: 24rpx;color: #929292;">注销账号将清空所有虚拟资产</text>
       </view> 
        <view @tap="cancelUser()" class="arrow" style="color: red;">申请注销 ></view>
      </view>
	  <view class="menu-item">
	  	<h1>隐私规则说明</h1>
		<view class="arrow">></view>
	  </view>
	  <view class="submit">
	  	<button class="btn" @tap="submit">保存</button>
	  </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  height: 100vh;
}
.herder {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 35rpx 20rpx;
  background-color: #ffffff;
  color: #333333;
  font-weight: 700;

}

/* 菜单列表 */
.menu {
  margin-top: 20rpx;
  background-color: #ffffff;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 20rpx;
  border-bottom: 1px solid #eeeeee;
  .right{
	  display: flex;
	  align-items: center;
  }
}
.pick{
	flex: 1;
	text-align: right;
}
.menu-item:last-child {
  border-bottom: none;
}

.arrow {
   font-size: 30rpx;
   color: #6a6a6a;
}
.userName{
	font-size: 30rpx;
	color: #6a6a6a;
	flex: 1;
	text-align: right;
	padding-right: 10rpx;
}
.avatar {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  margin-right: 10rpx;
  padding: 0;
  background-color: #eeeeee;
}
.img{
	width: 100%;
	height: 100%;
	border-radius: 50%;
}
.phone{
	font-size: 30rpx;
	color: #6a6a6a;
	text-align: right;
	padding-right: 10rpx;
}
.submit{
	width: 100%;
}
.btn {
	background-color: #89abf4;
}

</style>
