const baseUrl = 'http://8.134.200.160:20611';
// const baseUrl = 'http://4gi3rw.natappfree.cc';

export function request(config = {}) {
  let { url, data = {}, method = 'GET', header = {} } = config;

  // 拼接完整的 URL
  url = baseUrl + url;

  // 返回 Promise
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
          // 处理其他业务状态码
          uni.showToast({
            title: res.data.info || '请求失败',
            // content: res.data.message || '请求失败',
            icon: 'none'
          });
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
