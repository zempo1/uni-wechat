<script setup>
import { ref, onMounted } from 'vue';
import {getUserDiscuss} from '@/api/user.js'
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
	const res = await getUserDiscuss({
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

const goToDetail = (postId) => {
	if(isLongTap.value){
		isLongTap.value = false
			return
	}
  const userAvatar = uni.getStorageSync('avatar');
  const userName = uni.getStorageSync('userName');
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
//点击菜单
const popup = ref()
const delPostId = ref()
const isLongTap = ref(false)
const schoolCode = ref()
const openDel = (post) =>{
	console.log(post);
	popup.value.open()
	isLongTap.value = true
	delPostId.value = post.discussPostId
	schoolCode.value = post.schoolCode
	console.log(delPostId.value);
}
const del = () =>{
	uni.showModal({
		title: '提示',
		content: '确定要删除该帖子吗？',
		confirmColor: '#5cc280',
		success: async (re) => {
			if (re.confirm) {
				const res = await apiPostDelete({
					userId: uni.getStorageSync('userId'),
					postId: delPostId.value,
					schoolCode: schoolCode.value
				})
				console.log(res);
				if(res.code===200){
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
					posts.value = posts.value.filter(item => item.discussPostId !== delPostId.value)
					popup.value.close()
				}
            }		
		}	
	})			
}
const popClose = () =>{
	popup.value.close()
	isLongTap.value = false
}
  const paging = ref()
   const queryList = () =>{
   	setTimeout(() =>{
   		noData.value = false
   			 getUserDiscuss({
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
				<text class="header-title">我的帖子</text>
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
			      <text class="empty-text">还没有发布任何帖子哦</text>
			    </view>
			
			    <view v-else class="post-container">
			      <view 
			        v-for="post in posts" 
			        :key="post.discussPostId" 
			        class="post-card"
			        @click="goToDetail(post.discussPostId)"
					@longtap="openDel(post)"
			      >
			        <view class="post-header">
			          <view class="post-title-container">
			            <text class="post-tag" :style="{ background: getTagColor(post.tag) }">{{ post.tag }}</text>
			            <text class="post-title">{{ post.title }}</text>
			          </view>
						<view class="bars">
							<uni-icons type="bars" size="18" @tap.stop="openDel(post)"></uni-icons>
						</view>
			        </view>
			        
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
	<uni-popup ref="popup" type="bottom" border-radius="8rpx 8rpx 0 0"  >
		<view class="pop-contain">
			<view class="del" @tap="del()">
				<uni-icons type="trash" size="22" color="red"></uni-icons>
				<text>删除</text>
			</view>
			<view class="cancel" @tap="popClose()"><text>取消</text></view>
		</view>
	</uni-popup>
  
</template>

<style lang="scss">
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
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease-in-out;
  position: relative;
  &:active::before {
  	transform: scaleX(1);
  }
  &:active {
    transform: scale(0.98);
  }
}
.post-card::before{
	content: '';
	 position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 6rpx;
	background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.5), transparent);
	transform: scaleX(0);
	 transition: transform 0.3s ease;
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
  min-width: 0; // 关键：防止 flex 项目撑开
  .post-tag {
    font-size: 24rpx;
    color: #fff;
    padding: 4rpx 16rpx;
    border-radius: 8rpx;
    margin-right: 16rpx;
	  flex-shrink: 0; // 不允许缩小
	  min-width: 55rpx; // 给定一个合理的最小宽度
	  max-width: 60rpx; // 限制最大宽度，避免超长
	  text-align: center;
  }
  
  .post-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #333333;
      flex-shrink: 1;  // 允许它收缩
      max-width: calc(100% - 80rpx); // 防止挤压菜单栏
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
  }
}
.bars{
	flex-shrink: 0;  // 防止被挤压
	  width: 35rpx;  // 设置固定宽度
	  display: flex;
	  justify-content: center;
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

// .stat-text.liked {
//   color: #FF6B6B;
// }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 160rpx;
}

.empty-image {
  width: 320rpx;
  height: 320rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 48rpx;
}

.loading-state {
  padding: 32rpx 0;
}
.pop-contain{
	background-color: #fff;
	.del{
		padding: 30rpx 20rpx;
		border-bottom: 10rpx solid #e6e6e6;
		display: flex;
		align-items: center;
		justify-content: center;
		text{
			font-size: 32rpx;
			margin-left: 5rpx;
			vertical-align: middle;
		}
	}
	.cancel{
		padding: 30rpx 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		text{
			font-size: 34rpx;
		}
	}
}
</style>

