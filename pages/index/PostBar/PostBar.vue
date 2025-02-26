<script setup>
import { ref } from 'vue';

const activeFilter = ref('全部');

// 设置激活的筛选条件
const setActiveFilter = (item) => {
  activeFilter.value = item;
  console.log(item);
};

// 定义按钮对应的颜色
const buttonColors = {
  '全部': '#4CAF50',
  '拼车': 'linear-gradient(to top,#FF4081,#ffc0ab)',
  '拼单': 'linear-gradient(to top,#FF9800,#ffdc8c)',
  '休闲': 'linear-gradient(to top,#2196F3,#99d4fb)',
  '学习': 'linear-gradient(to top,#9C27B0,#e7aeff)',
  '运动': 'linear-gradient(to top,#07cb73,#0aff91)',
  '游戏': 'linear-gradient(to top,#8BC34A,#b9f55d)',
  '干饭': 'linear-gradient(to top,#dfc833,#e9ff86)',
  '旅行': 'linear-gradient(to top,#FF5722,#ffb870)',
  '其他': 'linear-gradient(to top,#9E9E9E,#c6c6c6)',
};
const scrollTop = ref(0);  // 用于记录滚动的位置
const fixedTop = ref(false); // 判断是否固定
const onScroll = (e) => {
    scrollTop.value = e.detail.scrollTop;
    // 如果滚动位置超过一定值，固定"top"
    fixedTop.value = scrollTop.value > 150;
};

</script>

<template>
  <view class="container">
	  <scroll-view scroll-y style="height: calc(100vh);" @scroll="onScroll">
	     <view class="top" :class="{ fixed: fixedTop }">
		  	<Header page="PostBar"></Header>
		  	<view class="btns">
		  	  <view class="filter-item" :class="{ active: activeFilter === '全部' }" :style="{ backgroundColor: activeFilter === '全部' ? buttonColors['全部'] : '' }" @tap="setActiveFilter('全部')">全部</view>
		  	  <view
		  	    v-for="(item, index) in ['拼车', '拼单', '休闲', '学习']" 
		  	    :key="index" 
		  	    class="filter-item"
		  	    :class="{ active: activeFilter === item }"
		  	    :style="{ background: activeFilter === item ? buttonColors[item] : '' }"
		  	    @tap="setActiveFilter(item)">
		  	    <view class="left" :style="{ background: buttonColors[item] }"></view>
		  	    <view class="right">{{ item }}</view>
		  	  </view>
		  	</view>
		  	<view class="bottomBtns">
		  	  <view 
		  	    v-for="(item, index) in ['运动', '游戏', '干饭', '旅行', '其他']" 
		  	    :key="index" 
		  	    class="filter-item"
		  	    :class="{ active: activeFilter === item }"
		  	    :style="{ background: activeFilter === item ? buttonColors[item] : '' }"
		  	    @tap="setActiveFilter(item)">
		  	    <view class="left" :style="{ background: buttonColors[item] }"></view>
		  	    <view class="right">{{ item }}</view>
		  	  </view>
		  	</view>
		  </view>
		<view class="main" v-for="item in 10">
				 <view class="mleft" :style="{background : buttonColors[activeFilter]}">
				   <text class="vertical-text">{{activeFilter}}</text>
				 </view>
				 <view class="mright">
				 	内容
				 </view>
		</view>
	  </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  padding: 5rpx;
  box-sizing: border-box;
}

.container .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.btns {
  display: flex;
  justify-content: space-around;
  margin: 10rpx 0;
}

.bottomBtns {
  display: flex;
  justify-content: space-around;
  margin: 25rpx 0;
}

.filter-item {
  display: flex;
  width: 120rpx;
  height: 60rpx;
  border: 1px solid #000;
  border-radius: 10rpx;
  font-size: 28rpx;
  justify-content: center;
  align-items: center;

  position: relative;
}

.filter-item .left {
  width: 20%; /* 使左侧颜色区域占据按钮的30% */
  height: 100%;
  border-radius: 10rpx 0 0 10rpx;
}

.filter-item .right {
  flex-grow: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.filter-item.active .right {
  color: #fff;
  padding-right: 15rpx;
}

.filter-item.active {
  color: #fff;
  border-radius: 10rpx;
}
.main{
	display: flex;
	padding: 10rpx 30rpx;
	.mleft{
		width: 15%;
		height: 160rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 15rpx 0 0 15rpx;
		border: 1px solid #333333;
		border-right: none;
		.vertical-text {
			letter-spacing: 20rpx;
			margin-top: 20rpx;
			color: #fff;
			font-weight: 600;
			font-size: 34rpx;
			writing-mode: vertical-rl;//文字竖直排列	
		}
	}
	.mright{
		width: 85%;
		height: 160rpx;
		line-height: 160rpx;
		border: 1px solid #333333;
		border-left: none;
		border-radius: 0 15rpx 15rpx 0;
	}
}
.top {
    position: relative;
    background-color: #fff;  /* 确保背景颜色 */
    z-index: 1;
    transition: top 0.3s ease; /* 添加平滑过渡 */
}

.top.fixed {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 999;  /* 确保它位于其他内容之上 */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
</style>
