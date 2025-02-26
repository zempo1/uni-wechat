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
