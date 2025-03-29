import { request } from "../utils/request"

export const apiAnalyze = (data = {}) => {
	return request({
		url: '/api/v1/util/analyze',
		method: 'post',
		data,
		header: {
			'Authorization': uni.getStorageSync('accessToken')
		}
	})
}
export const apiResult = (workFlowId) => {
	return request({
		url: `/api/v1/util/result/${workFlowId}`,
		header: {
			'Authorization': uni.getStorageSync('accessToken')
		}
	})
}