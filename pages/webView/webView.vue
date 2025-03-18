<script setup>
	const url =ref('')
	onLoad((option)=>{
		url.value = decodeURIComponent(option.url)
	})
</script>

<template>
	<web-view :src="url"></web-view>
</template>

<style lang="scss" scoped>
	
</style>
