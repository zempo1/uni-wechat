<script setup>
	//监听Header组件选择校区
	const changeSchool = (schoolCode) =>{
		console.log('communityLife',schoolCode);
	}
	const search = (query) =>{
		console.log('communityLife',query);
	}
	const skipLick = () =>{
		let url = 'https://mp.weixin.qq.com/s/mOcXasnbwotr4AJsW-IU-g';
		uni.navigateTo({
				url: '/pages/webView/webView?url=' + url
			})
	}
</script>

<template>
	<view class="container">
		<!-- <Header page="communityLife" @changeSchool="changeSchool" @search="search"></Header> -->
		<view class="banner">
			<swiper indicator-dots indicator-color="rgba(255,255,255,0.5)"
			indicator-active-color="#fff" autoplay circular>
				<swiper-item v-for="item in 3">
					<image @tap="skipLick()" src="/static/微信图片_20231020224507.jpg" mode="aspectFill"></image>
				</swiper-item>
			</swiper>
		</view>
		<view class="btns">
			<view class="btn">社团风采</view>
			<view class="btn">社团分类</view>
		</view>
		<view class="bottom">
			<view class="btn">精彩活动</view>
			<view class="btn">分享推荐</view>
		</view>
	</view>
</template>

<style lang="scss" scoped>
	.container{
		.banner{
			width: 750rpx;
			padding: 30rpx 0;
	
			swiper{
				width: 750rpx;
				height: 340rpx;
			    swiper-item{
					width: 100%;
					height: 100%;
					padding: 0 30rpx;
					box-sizing: border-box;
					image{
						width: 100%;
						height: 100%;
						border-radius: 10rpx;
				    }
				}
			}
		}
	}
	.btns{
		display:flex;
		justify-content: space-around;
		margin-top: 30rpx;
		padding: 20rpx 0;
	}
	.btn{
		width: 250rpx;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		border: 2px solid #cacaca;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 10rpx rgba(87, 184, 122,0.2);
		font-weight: 600;
		background: linear-gradient(to bottom right, #46e769,20%, #8acfb2);
	}
	.bottom{
		display:flex;
		justify-content: space-around;
		margin-top: 25rpx;
	}
</style>
