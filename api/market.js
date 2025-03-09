import { request } from "../utils/request";

//查询集市列表
export const getMarketPost = (data={}) =>{
	return request({
		url: '/api/v1/bazaar/post',
		data
	})
}
//发布集市帖子
export const addMarketPost = (data={}) =>{
	return request({
		url: '/api/v1/bazaar/post',
		method: 'post',
		data
	})
}
//查询帖子详情
export const getMarketPostDetail = (data={}) =>{
	return request({
		url: '/api/v1/bazaar/post/detail',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
	})
}
//删除帖子
export const delMarketPost = (data={}) =>{
	return request({
		url: '/api/v1/bazaar/post',
		method: 'delete',
		data:JSON.stringify(data),
		header: {
		    'Authorization': uni.getStorageSync('accessToken'),
		}
	})
}
//完成交易
export const finishMarketPost = (data={}) =>{
	return request({
		url: '/api/v1/bazaar/post/complete',
		method: 'put',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken'),
		}
	})
}