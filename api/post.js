import { request } from "../utils/request" 

//查询首页帖子列表
export const apigetPostList = (data={}) =>{
	return request({
		url: '/api/v1/community/post',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
	})
}
//发布帖子
export const apiPost = (data={}) =>{
	return request({
		url: '/api/v1/community/post',
		method: 'post',
		data
	})
}
//点赞帖子
export const apiPostLike = (data={}) =>{
	return request({
		url: '/api/v1/community/post/like',
		method: 'put',
		data
	})
}
//收藏帖子
export const apiPostCollect = (data={}) =>{
	return request({
		url: '/api/v1/community/post/favorite',
		method: 'put',
		data
	})
}
//查询帖子详情
export const apiPostDetail = (data={}) =>{
	return request({
		url: '/api/v1/community/post/detail',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
	})
}
//评论帖子
export const apiPostComment = (data={}) =>{
	return request({
		url: '/api/v1/community/comment/post',
		method: 'post',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
	})
}
//回复评论
export const apiCommentReply = (data={}) =>{
	return request({
		url: '/api/v1/community/comment/reply',
		method: 'post',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
	})
}
//查询帖子评论列表
export const apiPostCommentList = (data={}) =>{
	return request({
		url: '/api/v1/community/post/comment',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
	})
}
//查询帖子子评论列表
export const apiPostCommentChildList = (data={}) =>{
	return request({
		url: '/api/v1/community/comment/sub',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
	})
}
//点赞评论
export const apiCommentLike = (data={}) =>{
	return request({
		url: '/api/v1/community/comment/like',
		method: 'put',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
	})
}
//删除帖子
export const apiPostDelete = (data={}) =>{
	return request({
		url: '/api/v1/community/post',
		method: 'delete',
		data:JSON.stringify(data),
		header: {
		    'Authorization': uni.getStorageSync('accessToken'),
			'Content-Type': 'application/json'
		}
	})
}
//删除评论
export const apiCommentDelete = (data={}) =>{
	return request({
		url: '/api/v1/community/comment',
		method: 'delete',
		data:JSON.stringify(data),
		header: {
		    'Authorization': uni.getStorageSync('accessToken'),
			'Content-Type': 'application/json'
		}
	})
}