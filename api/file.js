import { request } from "../utils/request" 

//删除文件
export const deleteFile = (filePath) => {
    return request({
        url: `/api/v1/file/delete?filePath=${encodeURIComponent(filePath)}`,
        method: 'DELETE',
    })
}
//查询文件列表
export const getFileList = (data={}) => {
    return request({
        url: '/api/v1/file/list',
        data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
    })
}
//浏览文件、增加下载次数
export const viewFile = (data={}) => {
    return request({
        url: '/api/v1/file/browse',
        method: 'put',
		data,
		header: {
		    'Authorization': uni.getStorageSync('accessToken')
		}
    })
}