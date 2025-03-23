<script setup>
import {apiPostNotice,apiPostNoticeRead,apiDeleteNotice} from '@/api/message.js'
import {formatDate} from '@/common/formatTime.js'

onLoad(()=>{
	if(uni.getStorageSync('unreadCount')===0){
		getCommentList()
	}
})
onShow(async ()=>{
	uni.setStorageSync('isRead',0)
	if(uni.getStorageSync('unreadCount')!==0){
		uni.showToast({
			title: '共有'+uni.getStorageSync('unreadCount')+'条未读消息',
			icon: 'none',
			duration: 2000,
		})
		noticeId.value = ''
		commentList.value = []
		await getCommentList()
		await noticeRead()
		uni.setStorageSync('isRead',1)
		uni.setStorageSync('unreadCount',0)
	}
})
onHide(()=>{
	uni.setStorageSync('isRead',0)
})
const noticeRead = async() =>{
	if (commentList.value.length === 0) return;
	const res = await apiPostNoticeRead({
		userId:uni.getStorageSync('userId'),
		time: commentList.value[0].time
	})
	// console.log(res);
}
const userName = ref(uni.getStorageSync('userName'))
// const replyPopup = ref();
// const replyContent = ref('');
// const popupVisible = ref(false);
// const currentReplyTo = ref(null);

const noticeId = ref('')
const limit = ref(5)
const noData = ref(false)
const commentList = ref([]);
const getCommentList = async() =>{
	const res = await apiPostNotice({
		userId:uni.getStorageSync('userId'),
		noticeId:noticeId.value,
		limit:limit.value
	})
	console.log(res)
	commentList.value = [...commentList.value,...res.data];
	if(limit.value>res.data.length) noData.value = true
	console.log(commentList.value);
}

const gotoPostContent = (postId,userName) =>{
	if(isLongTap.value) return;
	uni.navigateTo({
		url:'/pages/postContent/postContent?postId='+postId+'&userName='+userName,
	});
}
const isLongTap = ref(false)
const del = (item) =>{
	isLongTap.value=true;
	uni.showModal({
		title: '提示',
		content: '确定要清空所有信息吗？',
		confirmColor: '#5cc280',
		success: async (re) => {
			if (re.confirm) {
				const res = await apiDeleteNotice({
					userId:uni.getStorageSync('userId'),
					time: commentList.value[0].time
				})
				console.log(res);
				if(res.code===200){
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					})
					commentList.value=[]
					noData.value = false
					uni.setStorageSync('unreadCount',0)
				}
				
	        }		
		}
	})
	isLongTap.value=false;
}
const postOrComment = (type) =>{
	if(type===1){
		return '回复'
	}
	return '贴子'
}

const paging = ref()
const queryList = () =>{
	setTimeout(() =>{
		noData.value = false
			 apiPostNotice({
				userId:uni.getStorageSync('userId'),
				noticeId:'',
				limit:limit.value
			}).then(res=>{
				console.log(res);
				paging.value.complete(res.data);
				if(limit.value>res.data.length) noData.value = true
			}).catch(err=>{
				paging.value.complete(false);
			})
	},300)
}
const isRefreshing = ref(false);
const scrolltolower = async () => {
	if(noData.value || isRefreshing.value){
		return
	}
    console.log('触底加载帖子');
	noticeId.value=commentList.value[commentList.value.length-1].noticeId
	console.log(commentList.value);
	isRefreshing.value = true
	const res = await getCommentList()
	isRefreshing.value = false
};
</script>

<template>
	<z-paging ref="paging" v-model="commentList" refresher-only @onRefresh="queryList" >
		<template #refresher="{refresherStatus}">
			<custom-refresher :status="refresherStatus" />
		</template>
		<view class="container">
		  <!-- 楼主评论内容 -->
			<scroll-view scroll-y  style="height: calc(100vh);" @scroll="onScroll" @scrolltolower="scrolltolower">
			<view v-if="commentList.length === 0" class="empty-state">
				<image mode="widthFix" src="../../static/noData.png"></image>
				<text class="empty-text">还没有任何数据哦</text>
			</view>
		    <view v-else class="comment-item" v-for="(item, index) in commentList" :key="index" @tap="gotoPostContent(item.postId,item.postUserName)" @longtap="del(item)">
		      <view class="user-info">
		        <image :src="item.userAvatar" class="avatar"/>
		        <view class="info-content">
		          <text class="nickname" >{{item.userName}}</text>
					<view class="">
						<text class="time">评论了你的{{postOrComment(item.type)}} {{formatDate(item.time)}}</text>
					</view>
		        </view>
		      </view>
		      
		      <view class="comment-content">
		        <text class="comment-text">{{item.commentContent}}</text>
		        <image v-if="item.image" :src="item.image" class="content-image" mode="widthFix"/>
		        <view class="quoted-content" >
					<view v-if="item.type===1">
						<text class="quoted-userName">{{userName}}：</text>
						<text class="quoted-text">{{item.myCommentContent}}</text>
					</view>
					<view class="post-info" :class="{active:item.postImage===''|| item.postImage===null}">
						<view v-if="item.postImage!=='' && item.postImage!==null">
							<image :src="item.postImage" class="post-image" mode="aspectFit"></image>
						</view>
					  <view class="post-content" >
					  	<text class="post-author">{{item.postUserName}}：</text>
					  	<text class="post-title">{{item.postTitle}}</text>
					  </view>
					</view>
		        </view>
		      </view>
		    </view>
		  </scroll-view>
		</view>
	</z-paging>
  
</template>

<style lang="scss" scoped>
@import "@/common/empty.css";

.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
}

.comment-item {
  background-color: #fff;
  padding: 25rpx;
  margin: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.user-info {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    .avatar {
        width: 90rpx;
        height: 90rpx;
        border-radius: 50%;
        margin-right: 20rpx;
    }
    .info-content {
        display: flex;
        flex-direction: column;
	    .nickname {
	        font-size: 28rpx;
	        margin-bottom: 10rpx;
			color: #50a86f;
	    }
		.time {
		  display: block;
		  font-size: 24rpx;
		  color: #999;
		}
    }
}

.comment-content {
  // margin-left: 104rpx;
  margin-bottom: 20rpx;
}

.comment-text {
  font-size: 32rpx;
  color: #333;
}


.quoted-content {
  margin-top: 20rpx;
  padding: 24rpx;
  background-color: #f3f3f3;
  border-radius: 12rpx;
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.quoted-userName {
	font-size: 28rpx;
	color: #0893ce;
	font-weight: 600;
}

.quoted-text {
  font-size: 28rpx;
  color: #666;
}

.post-info {
  margin-top: 20rpx;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
}
.post-info.active{
	background-color: #f3f3f3;
}
// .post-content {
// 	background-color: #fff;
// }
.post-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
  margin-right: 10rpx;
  border: 1px solid #e3e3e3;
}

.post-author {
  font-size: 28rpx;
  color: #50a86f;
  margin-bottom: 8rpx;
}

.post-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}



</style>
