// 引入pinia方法
import {defineStore} from "pinia"
// 引入 ref
import { ref } from "vue"
// 定义一个store	
export const indexInfo = defineStore('index',()=>{
	// 定义一个数据信息
	const info = ref("")
	// 为数据赋值
	const setInfo =(value)=>{
		info.value = value
	}
	// 返回数据方法
	return{
		info,
		setInfo
	}
},{
	// 配置持久化信息     //由于小程序与网页使用的方法不同这里要配置一下
	persist:{
		storage:{
			getItem:uni.getStorageSync,
			setItem:uni.setStorageSync
		}
	}
})