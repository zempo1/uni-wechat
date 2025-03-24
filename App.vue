<script>
	import {apiPostNotice} from '@/api/message.js'
	// WebSocket全局连接实例和配置
	const path = "wss://8.134.200.160:21611/ws?code="
	let ws = null
	let timeoutnum = null
	let closeType = 1
	
	// 初始化websocket链接
	const initWebpack = () => {
	  //实例
	  ws = uni.connectSocket({
	    url: path+uni.getStorageSync('userId'),
	    complete: () => {}
	  });
	  
	  //链接成功
	  ws.onOpen(() => {
	    console.log("连接成功", ws.readyState);
	  });
	  
	  //链接异常
	  ws.onError(() => {
	    console.log("出现错误");
	    reconnect(); //重连
	  });
	  
	  //链接断开
	  ws.onClose(() => {
	    console.log("连接关闭");
	    //断开链接时判断
	    if (closeType == 0) {
	      return;
	    }
	    reconnect(); //重连
	  });
	  
	  //后台返回消息
	  ws.onMessage((res) => {
		  uni.$emit('onWebSocketMessage', JSON.parse(res.data));
	  });
	};
	
	// 添加重连函数
	const reconnect = () => {
	  //防止重复链接
	  if (timeoutnum) {
	    clearTimeout(timeoutnum);
	  }
	  
	  timeoutnum = setTimeout(() => {
	    console.log('尝试重新连接...');
	    initWebpack(); //新连接
	  }, 3000); // 3秒后重连
	};
	
	// 导出WebSocket实例供其他页面使用
	uni.$ws = {
		instance: () => ws,
		close: () => {
			closeType = 0;
			if (ws) {
				ws.close();
			}
		},
		send: (data) => {
			if (ws && ws.readyState === 1) {
				ws.send({
					data: JSON.stringify(data)
				});
				return true;
			}
			return false;
		}
	};
	
	const getCommentList = async() =>{
		if(!uni.getStorageSync('userId')) return;
		if(uni.getStorageSync('unreadCount')===0 && uni.getStorageSync('isRead')===1){
			uni.removeTabBarBadge({
				index: 3
			})
			return ;
			console.log('在消息页面，不执行');
		}
		const res = await apiPostNotice({
			userId:uni.getStorageSync('userId'),
			noticeId:'',
			limit:20
		})
		// console.log(res)
		//未读消息的个数
		let lastCount = 0;
		let count = 0;
		res.data.forEach((item,index)=>{
			if(item.status == 0){
				count++
				if(index===res.data.length-1){
					uni.setStorageSync('unreadCount',count)
					uni.setTabBarBadge({
					  index: 3,
					  text: count.toString()
					})
				}
			}else{
				if(count!==0){
					console.log(count);
					uni.setStorageSync('unreadCount',count)
					uni.setTabBarBadge({
					  index: 3,
					  text:count.toString()
					})
				}
				return ;
			}
		})
	}
	export default {
		onLaunch: function() {
			console.log('App Launch')
			initWebpack()
			uni.setStorageSync('unreadCount',0)
			uni.setStorageSync('isRead',0)
			getCommentList();
			setInterval(()=>{
				getCommentList();
			},3000)
		},
		onShow: function() {
			console.log('App Show')
			// 先解绑之前的监听器
			uni.$off('onWebSocketMessage');
			// 重新绑定监听器
			uni.$on('onWebSocketMessage', (data) => {
			  console.log('收到消息:', data);
			  if (data.userId) {
			    let marketMessage = uni.getStorageSync('marketMessage') || [];
				//marketMessage是一个数组，数组里面是对象，对象里面有userId，如果data.userId在marketMessage里面，则不添加到marketMessage，但是要在缓存中找到这条信息并将marketMessage的content替换成data.content,否则添加
				if (marketMessage.some(item => item.userId === data.userId)) {
					  marketMessage.forEach((item,index)=>{
							if(item.userId===data.userId){
								marketMessage[index].content = data.content;
								marketMessage[index].isRead = 0;
							}
						})
				}else{
	  			    marketMessage.push({...data, isRead: 0});
				}
				// 更新未读消息状态
				uni.setStorageSync('marketUnRead', 1);
			    uni.setStorageSync('marketMessage', marketMessage);
			  }
			});
		},
		onHide: function() {
			console.log('App Hide')
			// 页面隐藏时解绑监听器
			uni.$off('onWebSocketMessage');
		}
	}
</script>

<style>
	/*每个页面公共css */
	.highlight {
	  color: red;
	  font-size: 30rpx;
	  font-weight: 700;
	  font-style: normal;
	}
	
	
</style>
