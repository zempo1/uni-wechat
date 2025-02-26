<script setup>
	const props = defineProps(['page'])
    const searchQuery = ref('')
    const selectSchool = ref('')
    const options = ref([
    	{ value: '1', text: '校区1' },
    	{ value: '2', text: '校区2' },
    	{ value: '3', text: '校区3' }
    ])
	// 选择校区时触发的事件
	const onSelectChange = (e) => {
		console.log(e)
	}
	// 搜索时触发的事件
	const onSearch = (e) => {
		console.log(e)
		if(props.page==='market'){
			console.log(props.page);
		}
		else if(props.page==='communityLife'){
			console.log(props.page);
		}
		else if(props.page==='PostBar'){
			console.log(props.page);
		}
	}
</script>

<template>
		<view class="header">
		      <!-- 搜索框 -->
		      <uni-search-bar
		        v-model="searchQuery"
		        @confirm="onSearch"
		        placeholder="搜索"
				radius="100"
				bgColor="#EEEEEE"
				clear-button="none"
				cancelButton="none"
		        class="search-bar"
		      />
			  <!-- 选择校区 -->
			  <uni-data-select
			    v-model="selectSchool"
			    :localdata="options"
			    placeholder="全部校区"
			    @change="onSelectChange"
				:clear="false"
				class="uni-select"
			  ></uni-data-select>
		</view>
</template>


<style lang="scss">
	 .header {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  margin-bottom: 10rpx;
	}
	.search-bar {
	  flex: 1;
	}
	.uni-select {
	  margin-right: 20rpx; 
	}
</style>