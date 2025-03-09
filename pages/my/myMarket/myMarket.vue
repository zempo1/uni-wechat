<script setup>
import { ref, onMounted } from 'vue';
import {getUserMarket} from '@/api/user.js'
import {delMarketPost,finishMarketPost} from '@/api/market.js'


onMounted(async () => {
  isRefreshing.value = true;
  loadMoreStatus.value = 'loading';
  getPost()
  isRefreshing.value = false;
  loadMoreStatus.value = 'noMore';
});
const activeFilter = ref(-1);
// 设置激活的筛选条件
const setActiveFilter = (item) => {
    activeFilter.value = item;
    console.log(item);
	if(item===-1){
		status.value=''
	}else{
		status.value=item
	}
	posts.value=[]
	getPost()
};
const loadMoreStatus = ref('more');

const types=['出售','求购','免费赠送']

const posts = ref([]);
const limit = ref(5)
const postId = ref('')
const type = ref('')
const status = ref('')
const getPost = async () => {
	const res = await getUserMarket({
		userId: uni.getStorageSync('userId'),
		postId: postId.value,
		limit: limit.value,
		type: type.value,
		status: status.value
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

const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

const goToDetail = (tradePostId) => {
    uni.navigateTo({
        url: `/pages/market/marketContent/marketContent?tradePostId=${tradePostId}`,
      });
}
//点击菜单
const popup = ref()
const currentPostId = ref()
const currentPostStatus = ref()
const openDel = (postId,status) =>{
	popup.value.open()
	currentPostId.value = postId
	currentPostStatus.value = status
	console.log(currentPostId.value);
}
	const changeStatus = () =>{
		uni.showModal({
			title: '提示',
			content: '确定已经完成交易？',
			success: async (re) => {
				if (re.confirm) {
					const res = await finishMarketPost({
						userId: uni.getStorageSync('userId'),
						postId: currentPostId.value
					})
					console.log(res);
					if(res.code===200){
						uni.showToast({
							title: '修改成功',
							icon: 'success'
						})
						posts.value = posts.value.filter(item => item.tradePostId !== currentPostId.value)
						popup.value.close()
					}
	            }		
			}	
		})			
	}
const del = () =>{
	uni.showModal({
		title: '提示',
		content: '确定要删除该帖子吗？',
		success: async (re) => {
			if (re.confirm) {
				const res = await delMarketPost({
					userId: uni.getStorageSync('userId'),
					postId: currentPostId.value
				})
				console.log(res);
				if(res.code===200){
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
					posts.value = posts.value.filter(item => item.tradePostId !== currentPostId.value)
					popup.value.close()
				}
            }		
		}	
	})			
}
const popClose = () =>{
	popup.value.close()
}
 const paging = ref()
   const queryList = () =>{
   	setTimeout(() =>{
   		noData.value = false
   			 getUserMarket({
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
			  <text class="header-title">我的集市</text>
			</view>
			<view class="types">
				<view class="type"  :class="{ active: activeFilter === -1 }" @tap="setActiveFilter(-1)">
					<text>全部</text>
				</view>
				<view class="type"  :class="{ active: activeFilter === 0 }" @tap="setActiveFilter(0)">
					<text>交易中</text>
				</view>
				<view class="type"  :class="{ active: activeFilter === 1 }" @tap="setActiveFilter(1)">
					<text>已下架</text>
				</view>
			</view>
		</template>
	<view class="container">
		<scroll-view 
		  class="post-list" 
		  scroll-y 
		  @scrolltolower="loadMore"
		>
		  <view v-if="posts.length === 0" class="empty-state">
		    <!-- <image class="empty-image" :src="emptyImageUrl" mode="aspectFit"></image> -->
		    <text class="empty-text">还没有发布任何帖子哦</text>
		  </view>
		
		  <view v-else class="post-container">
		    <view 
		      v-for="post in posts" 
		      :key="post.tradePostId" 
		      class="post-card"
		      @click="goToDetail(post.tradePostId)"
		      hover-class="post-card-hover"
		    >
		      <view class="post-header">
		        <text class="post-type">{{types[post.type]}}</text>
				<view>
					<uni-icons type="bars" size="21" @tap.stop="openDel(post.tradePostId,post.status)"></uni-icons>
				</view>
		      </view>
		      <view class="post-main">
		      	<view class="post-images" v-if="post.image && post.image.length">
		      	      <image
		      	        :src="post.image"
		      	        mode="aspectFill"
		      	        class="post-image"
		      	      ></image>
		      	</view>
				<text class="post-content">{{ post.content }}</text>
		      </view>
		      
		      <view class="post-footer">
				  <text class="post-time">{{ formatDate(post.createTime) }}</text>
		          <text class="price">￥{{post.price}}</text>
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
   	 	<view v-if="currentPostStatus===0" class="del" style="border-bottom: 2rpx solid #e6e6e6;" @tap="changeStatus()">
   	 		<text>设置为交易已完成</text>
   	 	</view>
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
  background-color: #f5f5f5;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100%;
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

.types {
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 20rpx 0;
	padding-top: 25rpx;
	background-color: #f5f5f5;
	flex-shrink: 0;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.type{
	width: 100rpx;
	padding: 10rpx;
	text-align: center;
	font-size: 28rpx;
	 height: 40rpx;
	line-height: 40rpx;
	border-radius: 10rpx;
	transition: all 0.3s ease-in-out;
	position: relative;
	
}
.type.active {
	// background: linear-gradient(to bottom right, #46e769,20%, #8acfb2);
	background-color: #60cb86;
	border-radius: 10rpx;
	transform: translateY(-8rpx); /* 选中的项上移*/
	box-shadow: 0px 10rpx 20rpx rgba(0, 0, 0, 0.2);
	text{
		font-size: 28rpx;
		color: #fff;
	}
}

.post-list {
  flex: 1;
  overflow: auto;
}

.post-container {
  padding: 10rpx 24rpx;
  height:100%;
}

.post-card {
  background-color: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.post-card-hover {
  background-color: #f3f3f3;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}


.post-type {
   // width: 80rpx;
   height:40rpx;
   text-align: center;
   line-height: 40rpx;
   padding: 8rpx 20rpx;
   background-color: rgba(76, 175, 80, 0.2);
   color: #4caf50;
   font-size: 26rpx;
   border-radius: 10rpx;
}

.post-time {
  font-size: 26rpx;
  color: #999999;
  flex-shrink: 0;
}
.post-main {
	display: flex;
	align-items: center;
}
.post-content {
  font-size: 28rpx;
  margin-left: 10rpx;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  margin-bottom: 24rpx;
  
}
.post-images {
  display: flex;
  // gap: 16rpx;
  margin-bottom: 24rpx;
}

.post-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  background-color: #f5f5f5;
}
.post-footer {
  border-top: 1px solid #F5F5F5;
  padding-top: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .price{
	  font-size: 38rpx;
	  color: #ff0000;
  }
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

