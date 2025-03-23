<script setup>
import { ref, onMounted } from 'vue';
import {getUserCollect} from '@/api/user.js'
import {apiPostDelete} from '@/api/post.js'
import {formatDate} from '@/common/formatTime.js'

onMounted(async () => {
  isRefreshing.value = true;
  loadMoreStatus.value = 'loading';
  getPost()
  isRefreshing.value = false;
  loadMoreStatus.value = 'noMore';
});


const loadMoreStatus = ref('more');

const tags = ['拼车', '拼单', '休闲', '学习', '运动','游戏','干饭','旅行','其他'];
const tagColors = {
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

const getTagColor = (tag) => {
  return tagColors[tag] || '#FFB6C1';
};

const posts = ref([]);
const limit = ref(5)
const postId = ref('')
const getPost = async () => {
	const res = await getUserCollect({
		userId: uni.getStorageSync('userId'),
		postId: postId.value,
		limit: limit.value
	});
	console.log(res);
	posts.value = [...posts.value,...res.data]
	if(limit.value>res.data.length) noData.value = true
	console.log(posts.value);
}

const isRefreshing = ref(false);
const noData = ref(false);
const loadMore = async () => {
  if (noData.value || isRefreshing.value) return;
  
  console.log('触底加载帖子');
  postId.value=posts.value[posts.value.length-1].discussPostId
  console.log(postId.value);
  isRefreshing.value = true
  const res = await getPost()
  isRefreshing.value = false
};


const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

const goToDetail = (post) => {
  const postId = post.discussPostId
  const userAvatar = post.userAvatar
  const userName = post.userName
  uni.navigateTo({
    url:'/pages/postContent/postContent?postId='+postId+'&userAvatar='+userAvatar+'&userName='+userName,
	events: {
		// 为指定事件添加监听器，获取被打开页面传送到当前页面的数据
		acceptLikeCount: (data) => {
			posts.value.forEach(item => {
				if (item.discussPostId === postId) {
					item.likeCount = data.data
				}
			})
		},
		acceptFavoriteCount: (data) => {
			// favoriteCount.value=data.data
			// console.log(favoriteCount.value,postId);
			//在post找到跟currentPostId一样的postId并将favoriteCount更新
			posts.value.forEach(item => {
				if (item.discussPostId === postId) {
					item.favoriteCount = data.data
				}
			})
		},
		acceptCommentCount: (data) => {
			posts.value.forEach(item => {
				if (item.discussPostId === postId) {
					item.commentCount = data.data
				}
			})
		}
	}
  });
}
   const paging = ref()
   const queryList = () =>{
   	setTimeout(() =>{
   		noData.value = false
   			 getUserCollect({
   				userId: uni.getStorageSync('userId'),
   				postId: '',
   				limit: limit.value
   			}).then(res=>{
   				console.log(res);
   				paging.value.complete(res.data);
   				console.log(paging.value);
   			}).catch(err=>{
   				paging.value.complete(false);
   			})
   	},300)
   }

</script>

<template>
  <z-paging ref="paging" v-model="posts" refresher-only @onRefresh="queryList" >
  	<template #refresher="{refresherStatus}">
  		<custom-refresher :status="refresherStatus" />
  	</template>
	<template #top style=" box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
		<view class="header">
		  <text class="header-title">我的收藏</text>
		</view>
	</template>
	<view class="container">
	  <scroll-view 
	    class="post-list" 
	    scroll-y 
	    @scrolltolower="loadMore"
	  >
	    <view v-if="posts.length === 0" class="empty-state">
	      <image mode="widthFix" src="../../../static/noData.png"></image>
	      <text class="empty-text">还没有收藏任何帖子哦</text>
	    </view>
	
	    <view v-else class="post-container">
	      <view 
	        v-for="post in posts" 
	        :key="post.discussPostId" 
	        class="post-card"
	        @click="goToDetail(post)"
	      >
	        <view class="post-header">
	          <view class="post-title-container">
					<view class="userinfo">
						<image class="avatar" :src="post.userAvatar || '../../static/avatar0.png'" mode="aspectFill"></image>
						<view class="username-time">
							<text class="username">{{post.userName}}</text>
						</view>
					</view>
					
	          </view>
				<view>
				  <text class="post-tag" :style="{ background: getTagColor(post.tag) }">{{ post.tag }}</text>
				</view>
	        </view>
			  <view style="margin-bottom: 10rpx;"><text class="post-title">{{ post.title }}</text></view>
	        <text class="post-content">{{ post.content }}</text>
	        
	        <view class="post-footer">
				  <text class="post-time">{{ formatDate(post.createTime) }}</text>
	          <view class="post-stats">
				  <view class="stat-item">
				    <uni-icons type="star-filled" size="18" :color="post.isFavorite ? '#fdc550' : '#8A8A8A'"></uni-icons>
				    <text class="stat-text" >{{ formatNumber(post.favoriteCount) }}</text>
				  </view>
	            <view class="stat-item">
	              <uni-icons type="chat-filled" size="18" color="#8A8A8A"></uni-icons>
	              <text class="stat-text">{{ formatNumber(post.commentCount) }}</text>
	            </view>
	            <view class="stat-item">
	              <uni-icons type="heart-filled" size="18" :color="post.isLiked ? '#FF6B6B' : '#8A8A8A'"></uni-icons>
	              <text class="stat-text">{{ formatNumber(post.likeCount) }}</text>
	            </view>
	          </view>
	        </view>
	      </view>
	
	      <view class="loading-state">
	         <uni-load-more :status="loadMoreStatus"></uni-load-more>
	      </view>
	    </view>
	  </scroll-view>
	</view>
  </z-paging>
  

</template>

<style lang="scss" scoped>
@import "@/common/empty.css";
page {
  height: 100%;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32rpx;
  background: linear-gradient(to bottom right, #46e769,20%, #8acfb2);
  border-bottom: 1px solid #F0F0F0;
  flex-shrink: 0;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.08);
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}


.post-list {
  flex: 1;
  overflow: auto;
}

.post-container {
  padding: 24rpx;
  height: 100%;
}

.post-card {
  background-color: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
  &:active {
    border: 1px solid #50a86f;
	transform: scale(0.98);
  }
}


.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.post-title-container {
  flex: 1;
  margin-right: 24rpx;
  display: flex;
  align-items: center;
}

.post-tag {
  font-size: 24rpx;
  color: #fff;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
}

.post-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.post-time {
  font-size: 24rpx;
  color: #999999;
  flex-shrink: 0;
}

.post-content {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.post-footer {
  border-top: 1px solid #F5F5F5;
  padding-top: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-stats {
  display: flex;
  justify-content: flex-end;
  gap: 40rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stat-text {
  font-size: 28rpx;
  color: #8A8A8A;
}

.loading-state {
  padding: 32rpx 0;
}
.userinfo{
	display: flex;
	align-items: center;
	.avatar{
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		margin-right: 15rpx;
	}
}
.username-time{
	display: flex;
	flex-direction: column;
	.username{
		font-size: 28rpx;
		padding-bottom: 8rpx;
		color: #50a86f;
		font-weight: 600;
	}
}
</style>

