import { request } from "../utils/request" 
//查询社区通知信息
export const apiPostNotice = (data={}) =>{
	return request({
		url: '/api/v1/community/notice',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
	})
}
//标记通知信息为已读
export const apiPostNoticeRead = (data={}) =>{
	return request({
		url: '/api/v1/community/notice',
		method: 'PUT',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
	})
}
//删除通知信息
export const apiDeleteNotice = (data={}) =>{
	return request({
		url: '/api/v1/community/notice',
		method: 'DELETE',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
	})
}
//查询集市的聊天信息记录
export const apiPostChat = (data={}) =>{
	return request({
		url: '/api/v1/message/',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
	})
}