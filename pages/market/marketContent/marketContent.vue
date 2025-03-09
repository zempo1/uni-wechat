<script setup>
	import {getMarketPostDetail,delMarketPost,finishMarketPost} from '@/api/market.js'
	import {getOtherUserInfo} from '@/api/user.js'
	const tradePostId = ref()
	const comPost = ref([])
	const posterId = ref()
	const userId = ref(uni.getStorageSync('userId'))
	const types=['出售','求购','赠送']
	onLoad( async (option)=>{
		tradePostId.value = option.tradePostId
		const res = await getMarketPostDetail({
			userId: uni.getStorageSync('userId'),
			postId: tradePostId.value
		})
		console.log(res);
		const res2 = await getOtherUserInfo({
			userId: uni.getStorageSync('userId'),
			targetId: res.data.userId
		})
		console.log(res2);
		comPost.value = res.data
		comPost.value.userName = res2.data.userName,
		comPost.value.userAvatar = res2.data.avatarUrl
		posterId.value = res.data.userId
	})
	
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
	const previewImage = (index) => {
		uni.previewImage({
			urls: comPost.value.images,
			current: index
		})
	}
	//点击菜单
	const popup = ref()
	const openDel = () =>{
		popup.value.open()
	}
	const del = () =>{
		uni.showModal({
			title: '提示',
			content: '确定要删除该帖子吗？',
			success: async (re) => {
				if (re.confirm) {
					const res = await delMarketPost({
						userId: uni.getStorageSync('userId'),
						postId: tradePostId.value
					})
					console.log(res);
					if(res.code===200){
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						})
						popup.value.close()
						//返回上一页
						setTimeout(() => {
							uni.reLaunch({
								url:'/pages/market/market'
							})
						}, 300)
						
					}
	            }		
			}	
		})			
	}
	const changeStatus = () =>{
		uni.showModal({
			title: '提示',
			content: '确定已经完成交易？',
			success: async (re) => {
				if (re.confirm) {
					const res = await finishMarketPost({
						userId: uni.getStorageSync('userId'),
						postId: tradePostId.value
					})
					console.log(res);
					if(res.code===200){
						uni.showToast({
							title: '修改成功',
							icon: 'success'
						})
						popup.value.close()
						//返回上一页
						setTimeout(() => {
							uni.reLaunch({
								url:'/pages/market/market'
							})
						}, 300)
						
					}
	            }		
			}	
		})			
	}
	const popClose = () =>{
		popup.value.close()
	}
</script>

<template>
	<view class="container">
		<view class="content-wrap">
			<!-- 内容部分 -->
			<view class="header">
				<view class="left">
					<image class="avatar" :src="comPost.userAvatar || '../../../static/avatar0.png'" mode="aspectFill"></image>
					<view class="username-time">
						<view class="username-status">
							<text class="username">{{comPost.userName}}</text>
							<view v-if="comPost.status===1" class="status"><text>已完成交易</text></view>
						</view>
						<text class="time">{{formatDate(comPost.createTime)}}</text>
					</view>
				</view>
				<view class="right" v-if="posterId===userId" @tap="openDel()">
					<uni-icons type="more-filled" color="#333" size="30"></uni-icons>
				</view>
			</view>
			<view class="price-tag">
				<view class="price">
					<text>￥{{comPost.price}}</text>
				</view>
				<view class="tag">
					{{types[comPost.type]}}
				</view>
			</view>
			
			<view class="content">
				<text user-select="true">{{comPost.content}}</text>
			</view>
			<view class="imageBox" v-if="comPost.images && comPost.images.length > 1" >
				<view class="image-grid" v-for="(item,index) in comPost.images" :key="index">
					 <image :src="item" mode="aspectFill" class="image" @tap="previewImage(index)"></image>
				</view>
			</view>
			<view v-if="comPost.images && comPost.images.length === 1" class="imageBox1">
				<image :src="comPost.images" mode="widthFix" class="image1" @tap="previewImage(index)"></image>
			</view>
			<view class="phone">
				<text>联系方式:{{comPost.contact}}</text>
			</view>
		</view>
	</view>
	<uni-popup ref="popup" type="bottom" border-radius="8rpx 8rpx 0 0"  >
		<view class="pop-contain">
			<view v-if="comPost.status!==1" class="del" style="border-bottom: 2rpx solid #e6e6e6;" @tap="changeStatus()">
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

<style lang="scss" scoped>
	page{
		height:100%;
	}
.container {
  min-height: 100%;
  background-color: #f8f8f8;
  padding: 24rpx;
}

.content-wrap {
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.header {
	display: flex;
	justify-content: space-between;
	// margin: 20rpx 0;
	padding: 20rpx;
	.left{
		display: flex;
		align-items: center;
	}
	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 20rpx;
	}
	.username-time{
		display: flex;
		flex-direction: column;
		.username-status {
		  display: flex;
		  align-items: center;
		  .status{
			    margin-left: 10rpx;
			    padding: 4rpx 12rpx;
			    border-radius: 6rpx;
				background-color: rgba(76, 175, 80, 0.1);
				color: #4caf50;	
				text{
					 text-decoration: line-through;
					 font-size: 26rpx
				}
		    }
		}
		.username{
			font-size: 28rpx;
			padding-bottom: 8rpx;
			color: #50a86f;
			font-weight: 600;
		}
		.time{
			font-size: 26rpx;
			color: #999999;
			margin-top: 5rpx;
		}
	}
}
.price-tag{
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10rpx 20rpx;
	.price{
		text{
			font-size: 40rpx;
			color: #ff0000;
		}
	}
	.tag{
		width: 80rpx;
		height:40rpx;
		margin-right: 10rpx;
		text-align: center;
		line-height: 40rpx;
		 padding: 8rpx 20rpx;
		  background-color: rgba(76, 175, 80, 0.2);
		  color: #4caf50;
		  font-size: 28rpx;
		  border-radius: 10rpx;
	}
}

.content{
	margin: 10rpx 0;
	padding: 20rpx;
	font-size: 32rpx;
	border-bottom: 1px solid #eee;
}
/* 图片九宫格布局 */
.imageBox {
    margin: 20rpx 0;
    padding: 0 20rpx;
    display: grid;
    grid-template-columns: repeat(2,1fr);
    gap: 8rpx;
    .image-grid{
	    height: 320rpx;
		border-radius: 8rpx;
		overflow: hidden;
	    .image{
	        width: 100%;
			height: 100%;
	    }
    } 
}
.imageBox1{
	padding: 0 20rpx;
    .image1{
		// width: 100%;
	}
}
.phone{
	display: flex;
	justify-content: center;
	padding: 20rpx;
	margin-top: 30rpx;
	text{
		font-size: 34rpx;
		font-weight: 600;
	}
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
