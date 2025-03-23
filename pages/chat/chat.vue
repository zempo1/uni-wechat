<template>
	<view>
		<view class="wrap" >
			<view class="title">
				<view>{{ otherUserInfo.otherUserName }}</view>
			</view>
			<!-- 将普通view改为scroll-view -->
			<scroll-view 
				class="content_box" 
				id="box" 
				ref="scrollBox"
				scroll-y="true"
				@scrolltoupper="throttledScrollToUpper"
				upper-threshold="100"
				:scroll-top="scrollTop"
				:scroll-with-animation="enableAnimation">
				<!-- <view class="timer">2022-08-02 11:08:07</view> -->
				<view :class="item.userId === otherUserInfo.otherId ? 'userbox2' : 'userbox'" v-for="(item, index) in chatList"
					:key="item.messageId" :id='"item"+index'>
					<view :class="item.userId === otherUserInfo.otherId ? 'nameInfo2' : 'nameInfo'">
						<view style="font-size: 28rpx">{{ item.userId === otherUserInfo.otherId ?otherUserInfo.otherUserName:userName  }}</view>
						<view :class="item.userId === otherUserInfo.otherId  ? 'contentText2' : 'contentText'">
							{{ item.content }}
						</view>
					</view>
					<view>
						<image class="touxiang" :src="item.userId === otherUserInfo.otherId ? otherUserInfo.otherAvatar : userAvatar" />
					</view>
				</view>
			</scroll-view>
			<view class="bottom">
				<textarea name="输入框" id="1" cols="20" rows="5" class="areaBox" v-model="inputValue"></textarea>
				<button 
					@click="sendOut">发送</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { throttle } from '@/utils/throttle.js';
import {apiPostChat} from '@/api/message.js'
import {getOtherUserInfo} from '@/api/user.js'
// 数据定义
const chatList = ref([]); //聊天信息
const userName = ref(""); //自己用户名
const userId = ref('')//自己用户Id
const userAvatar = ref()//自己头像
const inputValue = ref(""); //输入内容
const scrollTop = ref(0); //滚动条距离顶部距离
const enableAnimation = ref(true); //是否启用滚动动画
const otherUserInfo = ref(null); //卖家用户信息

// 使用全局WebSocket实例
const ws = {
  value: uni.$ws
}; // 使用全局连接实例
const scrollBox = ref(null); //滚动容器引用
const isLongTap = ref(false); //是否长按
const isRefreshing = ref(false); //是否正在刷新加载历史消息
// 节流处理的滚动到顶部函数
const throttledScrollToUpper = throttle(() => {
  onScrollToUpper();
}, 300);

// 生命周期钩子
onMounted(() => {
  // 页面加载完成后执行
});

// 页面显示时执行
onShow(() => {
  getlishiList(); //获取历史记录
});

// 页面卸载前执行
onBeforeUnmount(() => {
  // 移除WebSocket消息监听
  uni.$off('onWebSocketMessage');
});

// 页面加载时执行
onLoad (async(option)=>{
	userId.value = uni.getStorageSync('userId') // 修复：移除多余的ref
	userAvatar.value = uni.getStorageSync('avatar') // 修复：移除多余的ref
	userName.value = uni.getStorageSync("userName");
	otherUserInfo.value=option
	console.log(otherUserInfo.value);
	
})

// 添加滚动到顶部的处理函数
const onScrollToUpper = () => {
  console.log('滚动到顶部了');
  // 如果聊天列表不为空且当前没有在刷新，获取第一条消息的ID和位置
  if (chatList.value.length > 0 && !isRefreshing.value) {
    isRefreshing.value = true; // 设置正在刷新状态
    messageId.value = chatList.value[0].messageId || '';
    // 暂时禁用滚动动画
    enableAnimation.value = false;
    // 使用uni-app的createSelectorQuery获取元素位置
    const query = uni.createSelectorQuery();
    query.select('#item0').boundingClientRect(data => {
      if (data) {
        // 记录第一条消息的位置
        const oldPosition = data.top;
        getlishiList(1, oldPosition);
      }
      isRefreshing.value = false; // 重置刷新状态
    }).exec();
  }
};

// 获取历史记录
const messageId = ref('');//上一次查询结果最后一条消息的id
const limit = ref(20)
const getlishiList = async (type, oldPosition) => {
    const res = await apiPostChat({
        userId: uni.getStorageSync('userId'),
        otherId: otherUserInfo.value.otherId,
        messageId: messageId.value,
        limit: limit.value
    })
    console.log('历史记录:', res);
    let a = res.data;
    a.reverse()
     chatList.value.unshift(...a)
	 console.log(chatList.value);
    if (type == 1) { //滚动到顶部触发方法会传入1
        // nextTick(() => {
        //     // 获取新的第一条消息位置
        //     const query = uni.createSelectorQuery();
        //     query.select(`#item${a.length}`).boundingClientRect(data => {
        //         if (data && oldPosition) {
        //             // 计算新的滚动位置
        //             const newScrollTop = data.top - oldPosition;
        //             scrollTop.value = newScrollTop;
        //             // 在下一个tick恢复滚动动画
        //             nextTick(() => {
        //                 enableAnimation.value = true;
        //             });
        //         }
        //     }).exec();
        // });
        return;
    }
    setPageScrollTo(); //滚动到最底部
};

// 滚动条默认滚动到最底部 - 修改为适用于scroll-view的方法
const setPageScrollTo = () => {
  nextTick(() => {
    // 使用一个随机值强制更新滚动位置
    const randomValue = Date.now();
    scrollTop.value = randomValue;
    
    console.log('设置滚动到底部', randomValue);
  });
};

// 发送消息
const sendOut = () => {
  if (!inputValue.value.trim()) {
    uni.showToast({
      title: '请输入内容',
      icon: 'none'
    });
    return;
  }
  console.log(inputValue.value);
  // 使用全局WebSocket实例发送消息
  ws.value.send({
    toUserId: otherUserInfo.value.otherId,
    type: 'text',
    content: inputValue.value
  });
  console.log('发送成功');
  chatList.value.push({
    content: inputValue.value,
    toUserId: otherUserInfo.value.otherId,
    userId: userId.value,
  });
  
  inputValue.value = ''; //点击发送后清空输入框
  
  // 确保消息添加到列表后再滚动
  setPageScrollTo(); //滚动到最底部
};

// 监听WebSocket消息
uni.$on('onWebSocketMessage', (data) => {
  console.log('收到消息:', data);
  chatList.value.push(data); // 把消息添加到信息列表渲染
  setPageScrollTo(); // 滚动到最底部
});

// 暴露页面生命周期钩子给uni-app使用
defineExpose({
  onLoad
});
</script>
<style scoped>
	.wrap {
		height: 100vh;
		width: 100%;
		position: relative;
		display: flex;
		flex-direction: column;
		background-color: #f5f5f5;
		
	}

	.touxiang {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		flex-shrink: 0;
		border: 2rpx solid #ffffff;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
	}

	.areaBox {
		height: 70rpx;
		background-color: #ffffff;
		border-radius: 35rpx;
		padding: 0 30rpx;
		flex: 1;
		margin-right: 20rpx;
		font-size: 28rpx;
	}

	.title {
		height: 88rpx;
		width: 100%;
		background-color: #ffffff;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 32rpx;
		font-weight: 500;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
		position: relative;
		z-index: 1;
	}

	.bottom {
		min-height: 110rpx;
		width: 100%;
		background-color: #ffffff;
		position: fixed;
		bottom: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15rpx 30rpx;
		box-sizing: border-box;
		box-shadow: 0 -2rpx 4rpx rgba(0, 0, 0, 0.05);
	}

	.bottom button {
		background-color: #5abf53;
		color: #fff;
		padding: 0 30rpx;
		height: 65rpx;
		line-height: 65rpx;
		font-size: 28rpx;
	}

	.content_box {
		height: calc(100vh - 198rpx);
		padding: 30rpx;
		box-sizing: border-box;
		background-color: #f5f5f5;
       
	}

	.timer {
		text-align: center;
		color: #999999;
		font-size: 24rpx;
		margin: 20rpx 0;
	}

	/* 发送的信息样式 */
	.userbox {
		width: 100%;
		display: flex;
		margin-bottom: 30rpx;
		padding-right: 10rpx;
		box-sizing: border-box;
	}

	.nameInfo {
		flex: 1;
		margin-right: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.nameInfo view:first-child {
		color: #666666;
		font-size: 24rpx;
		margin-bottom: 8rpx;
	}

	.contentText {
		background-color: #95ec69;
		color: #000000;
		display: inline-block;
		border-radius: 14rpx 4rpx 14rpx 14rpx;
		max-width: 70%;
		padding: 16rpx 24rpx;
		white-space: normal;
		word-break: break-all;
		font-size: 28rpx;
		line-height: 1.4;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
	}

	/* 接收的信息样式 */
	.userbox2 {
		width: 100%;
		display: flex;
		flex-direction: row-reverse;
		margin-bottom: 30rpx;
		padding-left: 10rpx;
		box-sizing: border-box;
	}

	.nameInfo2 {
		flex: 1;
		margin-left: 20rpx;
	}

	.nameInfo2 view:first-child {
		color: #666666;
		font-size: 24rpx;
		margin-bottom: 8rpx;
	}

	.contentText2 {
		background-color: #ffffff;
		color: #333333;
		display: inline-block;
		border-radius: 4rpx 14rpx 14rpx 14rpx;
		max-width: 70%;
		padding: 16rpx 24rpx;
		white-space: normal;
		word-break: break-all;
		font-size: 28rpx;
		line-height: 1.4;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
	}
</style>

