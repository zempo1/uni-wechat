import { request } from "../utils/request" 

//删除文件
export const deleteFile = (filePath) => {
    return request({
        url: `/api/v1/file/delete?filePath=${encodeURIComponent(filePath)}`,
        method: 'DELETE',
    })
}