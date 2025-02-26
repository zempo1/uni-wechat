<template>
	<view class="waterfall">
		<view class="wt-left wt-list">
			<view class="wt-item" v-for="(good,index) in LeftList" :key="index" @click="ToDetail(good.id)">
				<view class="item-img">
					<image :src="good.image" mode='widthFix' ></image>
				</view>
				<!-- 介绍部分 -->
				<view class="introduce-section">
					<text class="title">{{good.name}}</text>
					<view class="tags-box">
						<text>点击量：{{good.click_num}}</text>
						<text>收藏量：{{good.fav_num}}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="vt-right wt-list">
			<view class="wt-item" v-for="(good,index) in RightList" :key="index" @click="ToDetail(good.id)">
				<view class="item-img">
					<image :src="good.image" mode='widthFix' ></image>
				</view>
				<!-- 介绍部分 -->
				<view class="introduce-section">
					<text class="title">{{good.name}}</text>
					<view class="tags-box">
						<text>点击量：{{good.click_num}}</text>
						<text>收藏量：{{good.fav_num}}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'

	// 总商品数据列表
	var goodList = ref([{
			"id": 1,
			"name": "商品一",
			"image": "../../static/微信图片_20231020224507.jpg",
			"click_num": 22,
			"fav_num": 33
		}, {
			"id": 2,
			"name": "商品二哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈",
			"image": "https://tse1-mm.cn.bing.net/th/id/OIP-C.MvBGMoOpeauMHajCOjdKvQHaJQ?pid=ImgDet&rs=1",
			"click_num": 22,
			"fav_num": 33
		}, {
			"id": 3,
			"name": "商品三",
			"image": "https://tse1-mm.cn.bing.net/th/id/OIP-C.MvBGMoOpeauMHajCOjdKvQHaJQ?pid=ImgDet&rs=1",
			"click_num": 888,
			"fav_num": 888
		}, {
			"id": 4,
			"name": "商品四",
			"image": "https://tse1-mm.cn.bing.net/th/id/OIP-C.MvBGMoOpeauMHajCOjdKvQHaJQ?pid=ImgDet&rs=1",
			"click_num": 888,
			"fav_num": 888
		},
		{
			"id": 5,
			"name": "商品五",
			"image": "../../static/微信图片_20231020224507.jpg",
			"click_num": 888,
			"fav_num": 888
		},
		{
			"id": 6,
			"name": "商品六",
			"image": "../../static/微信图片_20231020224507.jpg",
			"click_num": 22,
			"fav_num": 33
		}
	])
	// 左侧数据列表
	var LeftList = ref([])
	// 右侧数据列表
	var RightList = ref([])
    const leftHight = ref(0)
	const rightHight = ref(0)
	// 将商品信息列表分为左侧右侧两个部分
	for (let i = 0; i < goodList.value.length;i++) {
			
			if (i % 2 === 0) {
				LeftList.value.push(goodList.value[i])
			} else {
				RightList.value.push(goodList.value[i])
			}
		}
	

	// 点击商品 跳转详情
	function ToDetail(id) {
		console.log("点击了商品", id)
	}

</script>

<style>
	.waterfall {
		display: flex;
		flex-direction: row;
		width: 740rpx;
		justify-content: center;
		overflow: hidden;
		margin-left: 10rpx;

	}


	.wt-list {
		width: 360rpx;
		display: flex;
		flex-direction: column;
		margin-right: 10rpx;
	}

	.wt-item {
		margin-bottom: 15rpx;
		background-color: #ffffff;
	}

	.item-img image {
		width: 100%;
	}

	/* 商品介绍 */
	.introduce-section {
		background: #ffffff;
		padding: 20rpx 30rpx;
		height: 120rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		border-bottom: 1px solid #000;
	}

	.introduce-section .title {
		font-size: 32rpx;
		color: #303133;
	/* 	height: 50rpx;
		line-height: 50rpx; */
		text-overflow: -o-ellipsis-lastline;
		 overflow: hidden;
		 text-overflow: ellipsis;
		 display: -webkit-box;
		 -webkit-line-clamp: 2;
		 line-clamp: 2;
		 -webkit-box-orient: vertical;
	}

	.introduce-section .tags-box {
		display: flex;
		align-items: center;
		height: 30rpx;
		font-size: 24rpx;
		color: #909399;
	}
</style>
