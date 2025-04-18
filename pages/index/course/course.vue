<script setup>
	import { ref } from 'vue'
	import {getCourseList,searchFile} from '@/api/file.js'
	
	const courseList = ref([])//课程专业列表
	const selectedMajor = ref('')//选择的专业
	const majorScrollTop = ref(0)
	const courseScrollTop = ref(0)
	
	onLoad(()=>{
		getList()
	})
	const getList = async () =>{
		const res = await getCourseList({
			userId: uni.getStorageSync('userId'),
		})
		courseList.value = res.data
		if(courseList.value.length > 0) {
			selectedMajor.value = courseList.value[0].majorName
		}
	}
	
	const selectMajor = (majorName) => {
		selectedMajor.value = majorName
	}
	
	const getCurrentCourses = () => {
		const major = courseList.value.find(item => item.majorName === selectedMajor.value)
		return major ? major.courseNames : []
	}
	
	//搜索
	const keyword = ref('')
	const search =  () => {
		uni.navigateTo({
			url: `/pages/index/course/courseSearch/courseSearch?keyword=${keyword.value}`,
		})
	}
	
	const gotoMaterial = (course) => {
		uni.navigateTo({
			url: `/pages/index/material/material?course=${course}`,
		})
	}

</script>

<template>
	<view class="course-container">
		<template #top style=" box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
			<uni-search-bar
			  radius="5"
			  v-model="keyword"
			  placeholder="请输入关键词"
			  bgColor="#eee"
			  clearButton="auto"
			  cancelButton="none"
			  :radius="100"
			  @confirm="search"
			/>
		</template>
		
		<view class="content">
			<!-- 左侧专业列表 -->
			<scroll-view scroll-y class="major-list" :scroll-top="majorScrollTop" @scroll="onMajorScroll">
				<view
					v-for="item in courseList"
					:key="item.majorName"
					class="major-item"
					:class="{ active: selectedMajor === item.majorName }"
					@click="selectMajor(item.majorName)"
				>
					{{ item.majorName }}
				</view>
			</scroll-view>
			
			<!-- 右侧课程列表 -->
			<scroll-view scroll-y class="course-list" :scroll-top="courseScrollTop" @scroll="onCourseScroll">
				<view
					v-for="(course, index) in getCurrentCourses()"
					:key="index"
					class="course-item"
					@tap="gotoMaterial(course)"
				>
					{{ course }}
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<style lang="scss" scoped>
.course-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	
	.content {
		flex: 1;
		display: flex;
		margin-top: 20rpx;
		overflow: hidden;
		
		.major-list {
			width: 200rpx;
			height: 100%;
			background-color: #f5f5f5;
			border-radius: 0 8rpx 8rpx 0;
			
			
			.major-item {
				padding: 30rpx 20rpx;
				font-size: 28rpx;
				color: #9a9696;
				border-bottom: 1px solid #eee;
				transition: all 0.3s;
				
				&.active {
					background-color: #07A17F;
					color: #F8F8F8;
					font-weight: bold;
				}
			}
		}
		
		.course-list {
			flex: 1;
			height: 100%;
			background-color: #fff;
			padding: 20rpx;
			.course-item {
				padding: 30rpx;
				font-size: 28rpx;
				color: #333;
				background-color: #e8f4e8;
				margin-bottom: 20rpx;
				border-radius: 15rpx;
			}
		}
	}
}
</style>
