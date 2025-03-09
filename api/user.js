import { request } from "../utils/request" 
// 登录
export const login = (code) =>{
	return request({
		url: '/api/v1/user/login',
		method: 'post',
		data: {
				code
		    }
	})
}
// 登出
export const logout = (userId) =>{
	return request({
		url: '/api/v1/user/logout',
		method: 'post',
		data :{
			userId
		}
	})
}
//注销账号
export const deleteUser = (userId) =>{
	return request({
		url: `/api/v1/user/cancel?userId=${encodeURIComponent(userId)}`,
		method: 'delete'
	})
}
// 查询用户信息
export const getUserInfo = (userId) => {
	return request({
		url: '/api/v1/user/info',
		data: {
				userId
		    },
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
	})
}
//修改用户信息
export const updateUserInfo = (data={}) => {
	return request({
		url: '/api/v1/user/info',
		method: 'put',
		data
	})
}
//查询用户发布的讨论贴
export const getUserDiscuss = (data={}) => {
	return request({
		url: '/api/v1/user/post/community',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
	})
}
//查询用户收藏的帖子
export const getUserCollect = (data={}) => {
	return request({
		url: '/api/v1/user/post/favorite',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
	})
}
//查询用户发布的集市帖子
export const getUserMarket = (data={}) => {
	return request({
		url: '/api/v1/user/post/trade',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
	})
}
//查询其他用户信息
export const getOtherUserInfo = (data={}) => {
	return request({
		url: '/api/v1/user/other/info',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
	})
}