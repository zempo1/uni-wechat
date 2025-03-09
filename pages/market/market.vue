<script setup>
import {getMarketPost} from '../../api/market.js'
onLoad(async ()=>{
	getPostList()
})
const postId = ref('')
const limit = ref(6)
const typeIndex = ref('')
const activeFilter = ref('全部')
const change = (e) =>{
	// if(e.detail.value[0]==='1'){
	// 	status.value = 0
	// }else{
	// 	status.value = ''
	// }
	
}
// 设置激活的筛选条件
const setActiveFilter = (item,index) => {
	activeFilter.value = item;
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
		status:0
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
	setTimeout(() =>{
		noData.value = false
			 getMarketPost({
				userId:uni.getStorageSync('userId'),
				postId:'',
				limit:limit.value,
				type:'',
				status:0
			}).then(res=>{
				console.log(res);
				paging.value.complete(res.data);
				console.log(paging.value);
			}).catch(err=>{
				paging.value.complete(false);
			})
	},300)
}
const scrolltolower = async () =>{
	if(noData.value || isRefreshing.value){
		return
	}
	console.log('触底加载帖子');
	postId.value=comPost.value[comPost.value.length-1].tradePostId
	console.log(postId.value);
	isRefreshing.value = true
	const res = await getPostList()
	isRefreshing.value = false
}
const gotoMarketContent = (tradePostId) =>{
	console.log(tradePostId);
	uni.navigateTo({
		url:'/pages/market/marketContent/marketContent?tradePostId='+tradePostId
	})
}
</script>

<template>
	<z-paging ref="paging" v-model="comPost" refresher-only @onRefresh="queryList" >
		<template #refresher="{refresherStatus}">
			<custom-refresher :status="refresherStatus" />
		</template>
		<template #top style=" box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
		    <Header page="market"></Header>
		    <view class="filter-bar">
		    	<view
		    	    v-for="(item, index) in ['全部', '出售', '求购', '免费赠送']"
		    	    :key="index"
		    	    class="filter-item"
		    		:class="{active : activeFilter === item}"
		    	    @tap="setActiveFilter(item,index)"
		    	>
		    	  <text>{{item}}</text>
		    	</view>
		    	<view class="filter-bar-right">
					<checkbox-group @change="change">
						<checkbox :value="1" style="transform:scale(0.7);"></checkbox>
						<text>只看本校</text>
					</checkbox-group>
		    	</view>
		    </view>
		</template>
		<scroll-view scroll-y style="height: 100vh;" @scrolltolower="scrolltolower">
			<view class="container">
				<view class="Index">
				    <!-- 瀑布流布局列表 -->
				    <view class="pubuBox">
				      <view class="pubuItem">
				        <view class="item-masonry" v-for="(item, index) in comPost" :key="index" @tap="gotoMarketContent(item.tradePostId)">
				          <image style="height: 450rpx;" v-if="item.image" :src="item.image" mode="aspectFill"></image>
						  <view v-else class="noimg">
							  <text>{{item.content}}</text>
						  </view>
				          <view class="listtitle">
				            <!-- 这是没有高度的父盒子（下半部分） -->
				            <view class="listtitle1">{{ item.content }}</view>
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
				<button class="floating-button" @click="goToPublish"><img class="issue" src="../../static/issue.png" />我要发布</button>
			</view>
		</scroll-view>
	</z-paging>
</template>

<style lang="scss" scoped>
	.container {
		padding: 5rpx;
		box-sizing: border-box;
		height: 100%;
		background-color: #f6f7fb;
	}
	.filter-bar {
	  display: flex;
	  align-items: center;
	  font-size: 26rpx;
	  margin-bottom: 15rpx;
	  padding: 0 15rpx 10rpx;
	}
	.filter-item{
	   padding: 0 27rpx;
	   padding-bottom: 10rpx;
	   transition: color 0.2s ease-in-out, transform 0.2s ease-in-out;
	}
	.filter-bar-right {
	    margin-left: auto;
	    padding: 0 27rpx;
	}
	.filter-item.active {
	  border-bottom: 2px solid rgb(11, 203, 136);
	  color: rgb(11, 203, 136);
	  transform: translateY(-4rpx);
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
			 background-color: #59ac80;
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
</style>
