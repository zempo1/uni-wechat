<script setup>
import {getMarketPost,searchMarketPost} from '../../api/market.js'
import {getOtherUserInfo} from '@/api/user.js'
const hasUnreadMessage = ref(0)

onLoad(async ()=>{
	getPostList()
})
onShow(()=>{
	hasUnreadMessage.value = uni.getStorageSync('marketUnRead')
	console.log(hasUnreadMessage.value);
})
const postId = ref('')
const limit = ref(6)
const mySchoolCode = ref(uni.getStorageSync('schoolCode'))
const schoolCode = ref(uni.getStorageSync('schoolCode'))
const typeIndex = ref('')
const activeFilter = ref('全部')

const isClear = ref(false)
const resetSearch = () => {
	isSearch.value = false
  isClear.value = true; // 触发清除搜索框
  setTimeout(() => {
    isClear.value = false; // 延迟一段时间后恢复 false，确保清除动作被触发
  }, 100);
};
//监听Header组件选择校区
const changeSchool = (Code) =>{
	console.log('market',Code);
	resetSearch();
	schoolCode.value = Code
	postId.value = ''
	comPost.value = []
	noData.value = false
	getPostList()
	
}
//搜索
const getPostSearch = async () =>{
	const res = await searchMarketPost({
		query:query.value,
		offset:offset.value,
		limit:limit.value,
		schoolCode:schoolCode.value
	})
	console.log(res);
	// 提取 searchResult 数组中的 _formatted
	const formattedPosts = res.data.searchResult.map(item => item._formatted);
	console.log(formattedPosts);
	comPost.value = [...comPost.value,...formattedPosts];
	if(limit.value>res.data.searchResult.length) noData.value = true
	console.log(comPost.value);
}
const offset = ref(0)
const query = ref('')
const search = async (value) =>{
	console.log('market',value);
	query.value = value
	offset.value = 0
	isSearch.value = true
	comPost.value=[]
	noData.value=false
	getPostSearch()
}

// 设置激活的筛选条件
const messageList = ref([])
const setActiveFilter =  (item,index) => {
	activeFilter.value = item;
	if(item==='我的消息'){
		//遍历缓存的marketMessage
		messageList.value=[]
		if(uni.getStorageSync('marketMessage')){
			uni.getStorageSync('marketMessage').forEach( async(message) => {
				console.log(message);
				const res = await getOtherUserInfo({
					userId: uni.getStorageSync('userId'),
					targetId: message.userId
				})
				console.log(res);
				//将res.data存入messageList的同时并加入一个content字段也存入messageList，content:message.content
				messageList.value.push({
						...res.data,
						content:message.content,
						isRead: message.isRead
					})
				console.log(messageList.value);
			})
		}
	}
	else{
		resetSearch();
		index-=1;
		console.log(item);
		console.log(index);
		if(index!==-1){
			typeIndex.value = index
		}else{
			typeIndex.value = ''
		}
		postId.value = ''
		comPost.value = []
		noData.value = false
		getPostList()
	}
}
const goToPublish = () => {
	uni.redirectTo({
		url: '/pages/market/publish/publish'
	})
}
const noData = ref(false)
const isRefreshing = ref(false)
const getPostList = async()=>{
	const res = await getMarketPost({
		userId:uni.getStorageSync('userId'),
		postId:postId.value,
		limit:limit.value,
		type:typeIndex.value,
		status:0,
		schoolCode:schoolCode.value
	})
	console.log(res);
	comPost.value = [...comPost.value,...res.data];
	if(limit.value>res.data.length) noData.value = true
	console.log(comPost.value);
}
const types=['出售','求购','免费赠送']
// 商品列表数据
const comPost = ref([]);
//计算价格
const calPrice = (price) => {
	if(price<10000){
		return price
	}else if(price<999999){
		return (price/10000).toFixed(1)+'w'
	}else{
		return (price/10000)+'+'
	}
}
const paging = ref()
const queryList = () =>{
	resetSearch();
	setTimeout(() =>{
		noData.value = false
			 getMarketPost({
				userId:uni.getStorageSync('userId'),
				postId:'',
				limit:limit.value,
				type:typeIndex.value,
				status:0,
				schoolCode:schoolCode.value
			}).then(res=>{
				console.log(res);
				paging.value.complete(res.data);
				console.log(paging.value);
			}).catch(err=>{
				paging.value.complete(false);
			})
	},300)
}
const isSearch = ref(false)//用于判断是否是搜索完的触底加载
const scrolltolower = async () =>{
	if(activeFilter.value!=='我的消息'){
		if(noData.value || isRefreshing.value){
			return
		}
		console.log('触底加载帖子');
		if(isSearch.value){ //搜索完的触底加载
			offset.value += limit.value;
			isRefreshing.value = true
			getPostSearch();
			isRefreshing.value = false
		}else{
			postId.value=comPost.value[comPost.value.length-1].tradePostId
			console.log(postId.value);
			isRefreshing.value = true
			const res = await getPostList()
			isRefreshing.value = false
		}
	}
	
}
const gotoMarketContent = (tradePostId) =>{
	console.log(tradePostId);
	uni.navigateTo({
		url:'/pages/market/marketContent/marketContent?tradePostId='+tradePostId
	})
}
const gotoChat = (item) =>{
	console.log(item);
	// 更新消息已读状态
	let marketMessage = uni.getStorageSync('marketMessage') || [];
	marketMessage = marketMessage.map(msg => {
		if (msg.userId === item.userId) {
			msg.isRead = 1;
		}
		return msg;
	});
	// 检查是否所有消息都已读
	const hasUnread = marketMessage.some(msg => msg.isRead === 0);
	uni.setStorageSync('marketUnRead', hasUnread ? 1 : 0);
	uni.setStorageSync('marketMessage', marketMessage);
	// 更新当前显示的消息列表
	messageList.value = messageList.value.map(msg => {
		if (msg.userId === item.userId) {
			msg.isRead = 1;
		}
		return msg;
	});
	// 跳转到聊天页面
	uni.navigateTo({
		url:'/pages/chat/chat?otherId='+item.userId+'&otherUserName='+item.userName+'&otherAvatar='+item.avatarUrl
	})
}
</script>

<template>
	<z-paging ref="paging" v-model="comPost" refresher-only @onRefresh="queryList" >
		<template #refresher="{refresherStatus}">
			<custom-refresher :status="refresherStatus" />
		</template>
		<template #top style=" box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
		    <Header page="market" :clear="isClear"  @changeSchool="changeSchool" @search="search"></Header>
		    <view class="filter-bar">
		    	<view
		    	    v-for="(item, index) in ['全部', '出售', '求购', '免费赠送','我的消息']"
		    	    :key="index"
		    	    class="filter-item"
		    		:class="{active : activeFilter === item, 'has-message': item === '我的消息' && hasUnreadMessage}"
		    	    @tap="setActiveFilter(item,index)"
		    	>
		    	  <text>{{item}}</text>
		    	</view>
		    </view>
		</template>
		<scroll-view scroll-y style="height: 90vh;" @scrolltolower="scrolltolower">
			<view v-if="activeFilter!=='我的消息'">
				<view v-if="comPost.length === 0" class="empty-state">
				  <image mode="widthFix" src="../../static/noData.png"></image>
				  <text class="empty-text">还没有任何数据哦</text>
				  <button v-if="schoolCode===mySchoolCode" class="floating-button" @click="goToPublish"><img class="issue" src="../../static/issue.png" />我要发布</button>
				</view>
				<view v-else class="container">
					<view class="Index">
					    <!-- 瀑布流布局列表 -->
					    <view class="pubuBox">
					      <view class="pubuItem">
					        <view class="item-masonry" v-for="(item, index) in comPost" :key="index" @tap="gotoMarketContent(item.tradePostId)">
					          <image style="height: 450rpx;" v-if="item.image && item.image!=='null'" :src="item.image" mode="aspectFill"></image>
							  <view v-else class="noimg">
								  <rich-text space="nbsp" :nodes="item.content"></rich-text>
							  </view>
					          <view class="listtitle">
					            <!-- 这是没有高度的父盒子（下半部分） -->
					            <view class="listtitle1">
									<rich-text space="nbsp" :nodes="item.content"></rich-text>
								</view>
					            <view class="listtitle2">
					              <text class="listtitle2son">￥{{ calPrice(item.price) }}</text>
								  <view class="buy">{{types[item.type]}}</view>
					            </view>
					          </view>
					        </view>
					      </view>
					    </view>
					  </view>
					 <!-- 悬浮发布按钮 -->
					<button v-if="schoolCode===mySchoolCode" class="floating-button" @click="goToPublish"><img class="issue" src="../../static/issue.png" />我要发布</button>
				</view>
			</view>
			<!-- 我的消息 -->
			<view v-else class="message-container">
				<view v-if="messageList.length === 0" class="empty-state">
					<image mode="widthFix" src="../../static/noData.png"></image>
					<text class="empty-text">还没有任何消息哦</text>
				</view>
				<view v-else class="message-list">
					<view v-for="(item, index) in messageList" :key="index" class="message-item" :class="{'unread': item.isRead === 0}" @tap="gotoChat(item)">
						<image class="avatar" :src="item.avatarUrl || '../../static/avatar0.png'" mode="aspectFill"></image>
						<view class="message-content">
							<text class="username">{{item.userName}}</text>
							<text class="content">{{item.content}}</text>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</z-paging>
</template>

<style lang="scss" scoped>
	.empty-state {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
	  padding-top: 160rpx;
	}
	
	// .empty-image {
	//   width: 320rpx;
	//   height: 320rpx;
	//   margin-bottom: 32rpx;
	// }
	
	.empty-text {
	  font-size: 28rpx;
	  color: #999999;
	  margin-bottom: 48rpx;
	}
	.container {
		padding: 5rpx;
		box-sizing: border-box;
		height: 100%;
		background-color: #f6f7fb;
	}
	.filter-bar {
	  display: flex;
	  align-items: center;
	  justify-content: space-around;
	  font-size: 28rpx;
	  margin-bottom: 15rpx;
	  padding: 0 15rpx 10rpx;
	}
	.filter-item{
	   padding: 0 27rpx;
	   padding-bottom: 10rpx;
	   color: #222;
	   transition: all 0.1s ease-in-out;
	   position: relative;
	}
	.filter-item:last-child::after {
	   content: '';
	   position: absolute;
	   top: -5rpx;
	   right: 10rpx;
	   width: 16rpx;
	   height: 16rpx;
	   background-color: #ff0000;
	   border-radius: 50%;
	   display: none;
	}
	.filter-item:last-child.has-message::after {
	   display: block;
	}

	.filter-item.active {
	  border-bottom: 2px solid rgb(11, 203, 136);
	  color: rgb(11, 203, 136);
	  font-weight: 600;
	  transform: scale(1.05);
	}
	
	
	.floating-button {
	  position: fixed;
	  bottom: 20rpx;
	  left: 50%;
	  transform: translateX(-50%);
	  width: 300rpx;
	  height: 80rpx;
	  display: flex; /* 使用 Flexbox */
	  align-items: center; /* 垂直居中 */
	  justify-content: center; /* 水平居中 */
	  background-color: rgb(89, 172, 128);
	  color: #fff;
	  font-size: 28rpx;
	  border-radius: 40rpx;
	  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.2);
	  z-index: 999;
	}
	.issue{
		width: 40rpx;
		height: 40rpx;
		margin-right: 10rpx;
		display: inline-block;
		vertical-align: middle; /* 确保图片垂直对齐 */
	}
	/* 瀑布流 */
	
	.pubuBox {
	  padding: 22rpx;
	  background-color: #f6f7fb;
	}
	
	.pubuItem {
	  // column-count: 2;
	  // column-gap: 20rpx;
	  display: grid;
	  grid-template-columns: repeat(2, 1fr);
	  gap: 20rpx;
	}
	
	.item-masonry {
	  box-sizing: border-box;
	  border-radius: 15rpx;
	  overflow: hidden;
	  background-color: #fff;
	  break-inside: avoid;
	  /*避免在元素内部插入分页符*/
	  box-sizing: border-box;
	  margin-bottom: 20rpx;
	  box-shadow: 0px 0px 28rpx 1rpx rgba(78, 101, 153, 0.14);
	}
	.noimg{
	   padding: 0 20rpx;
	   background-color: #deecdf;
	   height: 450rpx;
	   //文字居中显示
	   display: flex;
	   justify-content: center;
	   align-items: center;
	   text {
		   font-size: 30rpx;
		   //文字超过五行则隐藏显示省略号
		   text-overflow: -o-ellipsis-lastline;
		    overflow: hidden;
		    text-overflow: ellipsis;
		    display: -webkit-box;
		    -webkit-line-clamp: 6;
		    line-clamp: 6;
		    -webkit-box-orient: vertical;
	   }
	}
	.item-masonry image {
	  width: 100%;
	}
	
	.listtitle {
	  padding: 0 10rpx;
	  font-size: 26rpx;
	  padding-bottom: 22rpx;
	  display: flex;
	  flex-direction: column;
	  justify-content: center;
	  height: 140rpx;
	  .listtitle1 {
	    line-height: 39rpx;
	    text-overflow: -o-ellipsis-lastline;
	    overflow: hidden;
	    text-overflow: ellipsis;
	    display: -webkit-box;
	    -webkit-line-clamp: 2;
	    line-clamp: 2;
	    -webkit-box-orient: vertical;
	    min-height: 39rpx;
	    max-height: 78rpx;
	  }
	
	  .listtitle2 {
		display: flex;
		justify-content: space-between;
	    font-size: 32rpx;
	    line-height: 32rpx;
	    padding-top: 22rpx;
	
	    .listtitle2son {
	      font-size: 32rpx;
		  color: #ff0000;
		  font-weight: bold;
	    }
		.buy{
			 width: 120rpx;
			 height: 40rpx;
			 margin-right: 10rpx;
			 background-color: #5cc280;
			 color: #FFFFFF;
			 font-size: 26rpx;
			 text-align: center;
			 line-height: 40rpx;
			 border-radius: 10rpx;
		}
	  }
	}
	
	.Index {
	  width: 100%;
	  height: 100%;
	}
	
	/* 消息列表样式 */
	.message-container {
		padding: 20rpx;
		background-color: #f6f7fb;
		min-height: 100vh;
	}
	
	.message-list {
		background-color: #fff;
		border-radius: 20rpx;
		overflow: hidden;
	}
	
	.message-item {
		display: flex;
		padding: 30rpx;
		border-bottom: 1px solid #dedede;
		transition: all 0.3s ease;
		position: relative;
		
		&:active {
			background-color: #f9f9f9;
			transform: scale(0.98);
		}
		
		&:last-child {
			border-bottom: none;
		}
		
		&.unread::after {
			content: '';
			position: absolute;
			top: 15rpx;
			right: 15rpx;
			width: 16rpx;
			height: 16rpx;
			background-color: #ff0000;
			border-radius: 50%;
		}
	}
	
	.avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		margin-right: 20rpx;
		background-color: #f0f0f0;
	}
	
	.message-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}
	
	.username {
		font-size: 28rpx;
		font-weight: 500;
		color: #50a86f;
	}
	
	.content {
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
	}
</style>
