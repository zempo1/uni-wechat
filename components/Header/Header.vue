<script setup>
	const props = defineProps(['page','clear','onlyMyschool'])
	const placeholder = ref('全部校区')
	onLoad(()=>{
		// if(props.page==='PostBar'){
			for(let i =0 ;i<schoolCodeArr.length;i++){
				if(schoolCodeArr[i]===uni.getStorageSync('schoolCode')){
					placeholder.value = schoolArr[i];
					break;
				}
			}
		// }
	})
    const searchQuery = ref('')
    const selectSchool = ref('')
	const schoolArr = ['莞工(松山湖)','莞工(莞城)','广东医科(湛江)','广东医科(东莞)','东职院(松山湖)','东职院(大岭山)','东职院(道滘)']
	const schoolCodeArr = ['11819B','11819A','10571A','10571B','14263A','14263B','14263C']
	const emit = defineEmits([
		'changeSchool',
		'search'
	])
    const options = ref([
    	{ value: '11819B', text: '莞工(松山湖)' },
    	{ value: '11819A', text: '莞工(莞城)' },
    	{ value: '10571A', text: '广东医科(湛江)' },
		{ value: '10571B', text: '广东医科(东莞)' },
    	{ value: '14263A', text: '东职院(松山湖)' },
    	{ value: '14263B', text: '东职院(大岭山)' },
    	{ value: '14263C', text: '东职院(道滘)' }
    ])
	// 监听 clear 变化，清空搜索框
	watch(() => props.clear, (newVal) => {
	  if (newVal) {
	    searchQuery.value = ''; // 清空搜索框
	  }
	});
	// 监听 onlyMyschool 变化
	// watch(() => props.onlyMyschool, (newVal) => {
	//   if(newVal){
	// 	 //选择校区已选择的文字变成本校
	// 	  selectSchool.value= uni.getStorageSync('schoolCode');
	//   }else{
	// 	  //选择校区已选择的文字变回全部校区
	// 	  selectSchool.value= '';
	// 	  placeholder.value = '全部校区'
	//   }
	// });
	// 选择校区时触发的事件
	const onSelectChange = (e) => {
		console.log(e)
		// if(props.page==='market'){
		// 	emit('changeSchool',e);
		// }
		// else if(props.page==='communityLife'){
		// 	console.log(props.page);
		// }
		// else if(props.page==='PostBar'){
		// 	emit('changeSchool',e);
		// }
		emit('changeSchool',e);
	}
	// 搜索时触发的事件
	const onSearch = (e) => {
		console.log(e.value)
		emit('search',e.value);
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
			    :placeholder="placeholder"
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
	  flex: 0.65;
	}
	.uni-select {
		flex: 0.35;
	  margin-right: 20rpx; 
	}
</style>