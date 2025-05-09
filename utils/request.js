// const baseUrl = 'http://8.134.200.160:80';
const baseUrl = 'https://aseubel.xyz'
export function request(config = {}) {
  let { url, data = {}, method = 'GET', header = {} } = config;

  // 拼接完整的 URL
  url = baseUrl + url;

  //返回 Promise
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      data,
      method,
      header,
      success: (res) => {
        if ( res.data.code === 200) {
          // 请求成功并且业务状态码为 200
          resolve(res.data);
        } else {
			if(!uni.getStorageSync('refreshToken')){
				uni.showModal({
					title:'提示',
				    content:'请先登录才能使用此功能',
					showCancel: false,
					confirmText: '去登录',
					confirmColor: '#5cc280',
				    success: async (result) =>{
				        if(result.confirm){
				      	    uni.switchTab({
				      	    	url:'/pages/my/my'
				      	    })
				        }
				    },
					fail: (err) => {
						console.error('Error:', err)
						uni.showToast({
						  title: '请重试',
						  icon: 'none'
						}) 
					}
				})
			}
          //处理其他业务状态码
          // uni.showToast({
          //   title: res.data.info || '请求失败',
          //   icon: 'none'
          // });
          reject(res.data);
        }
      },
      fail: (err) => {
        // 处理网络请求失败
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}
//暴露baseUrl
export { baseUrl };
