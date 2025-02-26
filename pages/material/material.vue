<script setup>

	const keyword = ref('')
    const list = ref([])
	for(let i=0;i<40;i++){
		list.value.push(i)
	}
	const search = () => {
		console.log(keyword.value)
	}
	const scrolltolower = () => {
		console.log('触底')
	}
    const queryList = () =>{
		console.log(1);
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
		</template>
		<scroll-view scroll-y style="height: 100vh;" @scrolltolower="scrolltolower">
			<view class="list">
				<view class="item" v-for="item in list" :key="item">{{item}}</view>
			</view>
		</scroll-view>
		
	</z-paging>
</template>

<style lang="scss" scoped>

</style>