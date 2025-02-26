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