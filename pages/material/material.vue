<script setup>
    import {getFileList,viewFile} from '@/api/file.js'
	
	onLoad(()=>{
		getList()
	})
	const list = ref([])
	const fileId = ref('')
	const limit = ref(5)
	const sortType = ref(0)
	const noData = ref(false)
	const getList = async () =>{
		const res = await getFileList({
			userId:uni.getStorageSync('userId'),
			fileId:fileId.value,
			limit:limit.value,
			sortType:sortType.value,
			courseName:''
		})
		console.log(res);
		list.value = [...list.value,...res.data]
		if(limit.value>res.data.length) noData.value = true
		console.log(list.value);
	}
	const activeFilter = ref(0);
	// 设置激活的筛选条件
	const setActiveFilter = (item) => {
	    activeFilter.value = item;
	    console.log(item);
		sortType.value = item
		fileId.value = ''
		list.value=[]
		getList()
	};
	
	//判断文件类型
	const judgeType = (fileName) => {
		const type = fileName.split('.')[1]
		if(type === 'pdf'){
			return '../../static/pdf.png'
		}else if(type === 'doc' || type === 'docx'){
			return '../../static/word.png'
		}
	}
	//计算文件大小
	const calFileSize = (size) =>{
		//传过来的size是byte，根据大小计算成kb或mb
		if(size<1024){
				return size+'B'
			}else if(size<1024*1024){
				return (size/1024).toFixed(0)+'KB'
			}else{
				return (size/(1024*1024)).toFixed(0)+'MB'
			}
	}
	//计算浏览量
	const calReadCount = (count) =>{
		if(count<1000){
			return count
		}else if(count<10000){
			return (count/1000).toFixed(1)+'k'
		}else{
			returb (count/10000).toFixed(1)+'w'
		}
	}
	//打开资料
	const openFile = (fileUrl,fileId) =>{
		uni.showLoading({
				title:'加载中'
			})
		uni.downloadFile({
			url:fileUrl,
			success: (res) => {
				const filePath = res.tempFilePath
				uni.openDocument({
					filePath: filePath,
					showMenu: true,
					success: async (res) => {
						console.log('打开文档成功');
						const res2 = await viewFile({
							userId: uni.getStorageSync('userId'),
							fileId:fileId
						})
						console.log(res2);
					},
					fail: (err) => {
						uni.showToast({
							icon:'none',
							title:"打开文档失败"
						})
					}
				});
				uni.hideLoading()
			},
			fail: (err) => {
				uni.showToast({
					icon:'none',
					title:"加载文档失败"
				})
			}
		})
	}
	const keyword = ref('')
	
	const search = () => {
		console.log(keyword.value)
	}

	const isRefreshing = ref(false)
	const scrolltolower = async () =>{
		if(noData.value || isRefreshing.value){
			return
		}
		console.log('触底加载帖子');
		fileId.value=list.value[list.value.length-1].fileId
		console.log(fileId.value);
		isRefreshing.value = true
		const res = await getList()
		isRefreshing.value = false
	}
   const paging = ref()
   const queryList = () =>{
   	setTimeout(() =>{
   		noData.value = false
   			 getFileList({
   				userId: uni.getStorageSync('userId'),
   				fileId:'',
   				limit:limit.value,
   				sortType:sortType.value,
   				courseName:''
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
	<z-paging ref="paging" v-model="list" refresher-only @onRefresh="queryList" >
		<template #refresher="{refresherStatus}">
			<custom-refresher :status="refresherStatus" />
		</template>
		<template #top style=" box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
			<uni-search-bar
			  radius="5"
			  v-model="keyword"
			  placeholder="请输入关键词"
			  clearButton="auto"
			  cancelButton="none"
			  @confirm="search"
			/>
			<view class="tabs">
				<view class="tab" :class="{ active: activeFilter === 0 }" @tap="setActiveFilter(0)">
					<text>默认</text>
				</view>
				<view class="tab" :class="{ active: activeFilter === 1 }" @tap="setActiveFilter(1)">
					<text>下载量倒序</text>
				</view>
				<view class="tab" :class="{ active: activeFilter === 2 }" @tap="setActiveFilter(2)">
					<text>下载量升序</text>
				</view>
			</view>
		</template>
		<view class="container">
			<scroll-view scroll-y style="height: 100vh;" @scrolltolower="scrolltolower">
				<view class="content">
					<view v-for="(item, index) in list" :key="index" class="file-item"  @tap="openFile(item.fileUrl,item.fileId)">
						<view class="left">
							<image  :src="judgeType(item.fileName)" class="file-icon" mode="aspectFill" />
						</view>
					    <view class="file-info">
					        <text class="file-name">{{ item.fileName }}</text>
							<view class="bottom">
								<text class="file-size">文件大小：{{calFileSize(item.fileSize)}}</text>
								<text class="file-Count">浏览量：{{calReadCount(item.downloadCount)}}</text>
							</view>
					       
					    </view>
					</view>
				</view>
			</scroll-view>
		</view>
		
		
	</z-paging>
</template>

<style lang="scss" scoped>
.container{
	background-color: #f5f5f5;
}
.tabs {
    display: flex;
    justify-content: space-around;
    background-color: #fff;
    padding: 20rpx 0;
    border-bottom: 2px solid #ddd;
    position: relative;
}

.tab {
    font-size: 30rpx;
    padding: 5rpx 20rpx;
    color: #888;
    position: relative;
    transition: color 0.3s ease-in-out, transform 0.3s ease-in-out;
}

/* 选中的tab文字上移 */
.tab.active text {
    color: #0bcb88;
	font-weight: 600;
    display: inline-block;
    transform: translateY(-6rpx);
    transition: transform 0.3s ease-in-out;
}

/* 选中tab的底部边框 */
.tab.active::after {
    content: "";
    position: absolute;
    bottom: -2px; /* 确保边框仍然位于tab原来的位置 */
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #0bcb88;
}

.content {
  flex: 1;
  padding: 25rpx;
  height: 100%;
}
.file-item {
    background-color: #FFFFFF;
    border-radius: 25rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
	transition: transform 0.2s ease-in-out;
	&:active{
		transform: scale(0.98);
		border: 1px solid #333;
	}
    .left{
	    height: 100%;
		width: 180rpx;
		 display: flex;
		 justify-content: center;
		 align-items: center;
		 flex-shrink: 0;
	    .file-icon {
	        height: 90rpx;
	  	    width: 80rpx;
			padding: 40rpx 30rpx;
			object-fit: contain;
	    }
    }
    .file-info {
        display: flex;
        flex-direction: column;
		margin-right: 30rpx;
	    .file-name {
	        font-size: 30rpx;
	        font-weight: 600;
			color: #333;
	        margin-bottom: 10rpx;
	    }
		.bottom{
			display: flex;
			justify-content: space-between;
			align-items: center;
			flex-wrap: wrap;
			width: 100%;
		}
	    .file-size {
	        font-size: 27rpx;
	        color: #666;
	    }
		.file-Count {
	        font-size: 27rpx;
	        color: #666;
	    }
    }
}



</style>