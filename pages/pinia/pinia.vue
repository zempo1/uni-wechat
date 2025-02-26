<script setup>
	import { indexInfo } from '../../stores/modules/index.js';
	const info = indexInfo();
	info.setInfo('我是pinia');
</script>
<template>
  <view class="content">
  		<!-- 数据展示 -->
  		{{info.info}}
  	</view>
</template>
 
<style lang="scss" scoped>

</style>