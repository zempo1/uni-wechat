<script setup>
import { ref } from 'vue';
import {apigetPostList} from '@/api/post.js'

const userId = ref('')
onLoad(()=>{
	userId.value = uni.getStorageSync('userId')
	getPostList()
	console.log('刷新');
})
const gotoPostContent = (postId,userAvatar,userName) =>{
	uni.navigateTo({
		//url拼接postId和userAvatar
		url:'/pages/postContent/postContent?postId='+postId+'&userAvatar='+userAvatar+'&userName='+userName,
	});
}
const activeFilter = ref('全部');
// 设置激活的筛选条件
const setActiveFilter = (item) => {
  activeFilter.value = item;
  console.log(item);
  if(item==='全部'){
	  tag.value=''
  }else{
	  tag.value=item
  }
  post.value = []
  noData.value = false
  postId.value = ''
  getPostList()
};

//查询帖子列表
const post = ref([])
const postId = ref('')
const limit = ref(10)
const tag = ref('')
const noData = ref(false)
const isRefreshing = ref(false) //是否正在刷新帖子
const getPostList = async()=>{
	const res = await apigetPostList({
		userId:uni.getStorageSync('userId'),
		postId:postId.value,
		limit:limit.value,
		schoolCode:'11819',
		tag:tag.value
	})
	console.log(res)
	post.value = [...post.value,...res.data];
	if(limit.value>res.data.length) noData.value = true
	console.log(post.value);
}
// 定义按钮对应的颜色
const buttonColors = {
  '全部': '#68e7a4',
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

const formatDate = (dateStr) => {
  const now = new Date();
  dateStr = dateStr.replace(" ", "T");
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`;
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
};

const scrollTop = ref(0);  // 用于记录滚动的位置
const fixedTop = ref(false); // 判断是否固定
const onScroll = (e) => {
    scrollTop.value = e.detail.scrollTop;
    // 如果滚动位置超过一定值，固定"top"
    fixedTop.value = scrollTop.value > 200;
};

//触底加载帖子
const scrolltolower = async () => {
	console.log(1);
	if(noData.value || isRefreshing.value){
		return
	}
    console.log('触底加载帖子');
	postId.value=post.value[post.value.length-1].discussPostId
	isRefreshing.value = true
	const res = await getPostList()
	isRefreshing.value = false
};

//插件z-paging的下拉刷新
const paging = ref()
const queryList = () =>{
	// console.log(pageNo,pageSize);
	setTimeout(() =>{
		noData.value = false
			 apigetPostList({
				userId:uni.getStorageSync('userId'),
				postId:'',
				limit:limit.value,
				schoolCode:'11819',
				tag:tag.value
			}).then(res=>{
				console.log(res);
				paging.value.complete(res.data);
				if(limit.value>res.data.length) noData.value = true
			}).catch(err=>{
				paging.value.complete(false);
			})
	},300)
}
</script>

<template>
	<z-paging ref="paging" v-model="post" refresher-only @onRefresh="queryList" >
		<template #refresher="{refresherStatus}">
		   <custom-refresher :status="refresherStatus" />
		</template>
		<view class="container">
			  <scroll-view scroll-y style="height: 100vh;" @scroll="onScroll" @scrolltolower="scrolltolower">
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
				<view class="main" v-for="item in post" :key="item.discussPostId" @tap="gotoPostContent(item.discussPostId,item.userAvatar,item.userName)">
						 <view class="mleft" :style="{background : buttonColors[item.tag]}">
						   <text class="vertical-text">{{item.tag}}</text>
						 </view>
						 <view class="mright" hover-class="post-card-hover">
						 	<view class="title">
						 		<text>{{item.title}}</text>
						 	</view>
							<view class="content">
								<text>{{item.content}}</text>
							</view>
							<view class="time">
								<text>{{ formatDate(item.createTime) }}</text>
							</view>
						 </view>
				</view>
				<view v-if="noData || post.length>0">
					<uni-load-more :status="noData?'noMore':'loading'"></uni-load-more>
				</view>
			  </scroll-view>
		</view>
	</z-paging>	
  
</template>

<style lang="scss" scoped>
.container {
  padding: 5rpx;
  box-sizing: border-box;
  background-color: #f5f5f5;
  height: 100%;
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
.post-card-hover {
 background-color: #eee;
}
.main{
	display: flex;
	padding: 10rpx 30rpx;
	transition: transform 0.1s ease-in-out;
	&:active{
		transform: scale(0.98);
	}
	.mleft{
		width: 15%;
		// height: 180rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 20rpx 0 0 20rpx;
		border: 1px solid #333;
		box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.1);
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
		// height: 180rpx;
		// line-height: 160rpx;
		border: 1px solid #333;
		box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.1);
		border-left: none;
		border-radius: 0 20rpx 20rpx 0;
		.title{
			//水平居中
			display: flex;
			justify-content: center;
			align-items: center;
	        padding: 10rpx;
			text{
				font-size: 30rpx;
				font-weight: 600;
				//超过一行显示省略号
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 1;
				overflow: hidden;
			}
		}
		.content{
		    padding: 10rpx 20rpx;
			font-size: 28rpx;
			text{
				//超过两行显示省略号
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
			}
		}
		.time{
			display: flex;
			justify-content: flex-end;
			align-items: center;
			padding: 10rpx 20rpx;
			font-size: 24rpx;
			color: #999999;
		}
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
