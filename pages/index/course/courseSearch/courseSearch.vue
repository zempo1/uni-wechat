<script setup>
	import {searchFile} from '@/api/file.js'
	import { ref } from 'vue'
	
	onLoad((option)=>{
		keyword.value = option.keyword
		getListSearch()
	})
	const scrollTop = ref(0)
	const keyword = ref('')
	const list = ref([])
	const getListSearch = async () =>{
		const res = await searchFile({
			query: keyword.value,
			limit: '',
			offset: 0,
			schoolCode:uni.getStorageSync('schoolCode')
		})
		const formattedPost = res.data.searchResult.map(item => item._formatted.courseName);
		//去除重复项
		const formattedPosts = [...new Set(formattedPost)];
		list.value = formattedPosts
	}
	
	// 跳转到课程资料页面
	const gotoMaterial = (course) => {
		// course为<em class="highlight">数据</em>库系统原理，去除em标签
		course = course.replace(/<em class="highlight">|<\/em>/g, '');
		uni.navigateTo({
			url: `/pages/index/material/material?course=${course}`,
		})
	}
</script>

<template>
	<view class="search-container">
		<scroll-view scroll-y :scroll-top="scrollTop" class="scroll-view" @scroll="onScroll" @scrolltolower="scrolltolower">
			<view v-if="list.length === 0" class="empty-state">
				<image mode="widthFix" src="../../../../static/noData.png" ></image>
				<text class="empty-text">暂无搜索结果</text>
			</view>
			<view v-else class="search-results">
				<view class="search-title">
					<text>搜索结果</text>
					<text class="result-count">({{ list.length }})</text>
				</view>
				<view class="course-list">
					<view 
						v-for="(item, index) in list" 
						:key="index" 
						class="course-card"
						@tap="gotoMaterial(item)"
					>
						<view class="course-content">
							<rich-text space="nbsp" class="course-name" :nodes="item"></rich-text>
							<uni-icons type="right" size="16" color="#999"></uni-icons>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<style lang="scss" scoped>
@import url("../../../../common/empty.css");
.search-container {
	height: 100vh;
	background-color: #f8f9fa;
	
	.scroll-view {
		height: 100%;
	}
	.search-results {
		padding: 30rpx;
		
		.search-title {
			margin-bottom: 30rpx;
			font-size: 34rpx;
			font-weight: bold;
			color: #333;
			padding-left: 20rpx;
			border-left: 8rpx solid #3c9cff;
			
			.result-count {
				color: #666;
				font-weight: normal;
				margin-left: 10rpx;
			}
		}
		
		.course-list {
			.course-card {
				background-color: #fff;
				border-radius: 16rpx;
				margin-bottom: 24rpx;
				box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
				transition: all 0.3s ease;
				border: 1px solid rgba(0, 0, 0, 0.03);
				
				&:active {
					transform: scale(0.98);
					background-color: #f0f7ff;
				}
				
				.course-content {
					padding: 30rpx;
					display: flex;
					justify-content: space-between;
					align-items: center;
					
					.course-name {
						font-size: 30rpx;
						color: #333;
						flex: 1;
						line-height: 1.5;
						
						:deep(.highlight) {
							color: #3c9cff;
							font-weight: bold;
						}
					}
				}
			}
		}
	}
}
</style>
