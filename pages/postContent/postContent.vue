<script setup>
import { nextTick, onMounted,getCurrentInstance } from 'vue';
import {apiPostDetail,apiPostCommentList,apiPostCollect,apiPostLike,apiPostComment,apiCommentLike} from '../../api/post.js'
import {baseUrl} from '../../utils/request.js'
import {deleteFile} from '@/api/file.js'
    const postId = ref()
	const userAvatar = ref()
	const userName = ref()
	
	onLoad(async (option)=>{
		console.log(option);
		postId.value = option.postId
		userAvatar.value = option.userAvatar
		userName.value = option.userName
		getPostList();
		getPostCommentList();
	})
	onUnload(()=>{
		// getOpenerEventChannel()是uni自带的一个方法,返回一个对象
		const instance = getCurrentInstance().proxy
		const eventChannel = instance.getOpenerEventChannel();
		//通过监听上个页面的uni.navigateTo的events中定义的事件传递参数
		eventChannel.emit('acceptLikeCount', {
			 data: post.value.likeCount
		});
		eventChannel.emit('acceptFavoriteCount', {
			 data: post.value.favoriteCount
		});
		eventChannel.emit('acceptIsFavorite', {
			data: post.value.isFavorite
		});
		eventChannel.emit('acceptIsLike',{
			data: post.value.isLike
		});
	})
	//查询帖子数据
	const getPostList = async()=>{
		const res = await apiPostDetail({
			userId: uni.getStorageSync('userId'),
			postId: postId.value
		})
		console.log(res);
		post.value = res.data;
	}
	//查询帖子评论
	const noData = ref(false)
	const isRefreshing = ref(false) //是否正在刷新帖子
	const commentId = ref('')
	const limit = ref(5)
	const getPostCommentList = async()=>{
		const res = await apiPostCommentList({
			userId: uni.getStorageSync('userId'),
			postId: postId.value,
			commentId: commentId.value,
			limit: limit.value,
			sortType: sortTypeIndex.value
		})
		console.log(res);
		comments.value = res.data
	}
	//截取评论时间
	const formatTime = (time) =>{
		const now = new Date(); // 获取当前时间
		time = time.replace(" ", "T");
		const timeDate = new Date(time); // 将传入的时间字符串转换为 Date 对象
		const diffInSeconds = Math.floor((now - timeDate) / 1000); // 计算时间差，单位为秒
		const diffInMinutes = Math.floor(diffInSeconds / 60); // 计算时间差，单位为分钟
		const diffInHours = Math.floor(diffInSeconds / 3600); // 计算时间差，单位为小时
		if(diffInMinutes < 1){
			return '刚刚'
		}else if (diffInMinutes < 60) {
		    // 如果时间差小于 60 分钟，显示 "n分钟前"
		    return `${diffInMinutes}分钟前`;
		} else if (diffInHours < 24) {
	        // 如果时间差小于 24 小时，显示 "n小时前"
	        return `${diffInHours}小时前`;
		}else if(diffInHours < 48 ){
		    //显示昨天
		    return '昨天'
	    }else {
	       //time为 "2025-02-16T14:35:00",截取掉后面的分钟和秒数，只保留年月日如2025-02-16
		    return time.replace(/T(\d{2}:\d{2}:\d{2})$/, ''); // 去掉时间部分，得到 "2025-02-16"
	    }
	}
	//帖子数据
	const post = ref(
		{
			discussPostId:'0',
			avatar:'../../static/avatar0.png',
			username:'张三',
			title:'帖子标题',
			content:'帖子内容啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
			likeCount:0,
			images:[
				'../../static/微信图片_20231020224507.jpg',
				'../../static/logo.png',
				'../../static/tabBar/publish.png',
				'../../static/微信图片_20231020224507.jpg',
				'../../static/微信图片_20231020224507.jpg',
				'../../static/微信图片_20231020224507.jpg',
				'../../static/微信图片_20231020224507.jpg',
				'../../static/微信图片_20231020224507.jpg',
			],
			commentCount:0,
			comments: [
			   { id: 1, comments:[
				   { id: 1, comments:[], avatar:'../../static/avatar0.png', username: '百香果', "createTime": "2025-01-27", text: '厉害厉害',likeCount:0 },
				   { id: 2, comments:[], avatar:'../../static/avatar0.png', username: '雇员', "createTime": "2025-01-27", text: '哈哈',likeCount:0 },
				   { id: 3, comments:[], avatar:'../../static/avatar0.png', username: '雇员2', "createTime": "2025-01-27", text: '啊啊',likeCount:0 },
				   { id: 4, comments:[], avatar:'../../static/avatar0.png', username: '雇员3', "createTime": "2025-01-27", text: '好的',likeCount:0 },
				   { id: 5, comments:[], avatar:'../../static/avatar0.png', username: '雇员4', "createTime": "2025-01-27", text: '嗯嗯',likeCount:0 },
			      ],
				avatar:'../../static/avatar0.png',username: '猎猎', text: ' 改变就在今天', "createTime": "2025-01-27",likeCount:0},
			   { id: 2, comments:[], avatar:'../../static/avatar0.png', username: '百香果在鬼屋大叫', "createTime": "2025-01-27", text: '厉害厉害',likeCount:0 },
			   { id: 3, comments:[],avatar:'../../static/avatar0.png', username: '涂涂', text: '我也', "createTime": "2025-01-27",likeCount:0 },
		       { id: 4 ,comments:[],avatar:'../../static/avatar0.png', username: '啊', text:'超出', "createTime": "2025-01-27",likeCount:0}
			 ],
		},
	)
	const comments = ref([])
	const previewImage = (index) => {
		uni.previewImage({
			urls: post.value.images,
			current: index
		})
	}
	const starNumber = ref(0)
	const favoriteCount = ref(1)
	// 点击收藏
	const isStaring = ref(false)
	const clickStar= async ()=>{
		if(isStaring.value){
			return;
		}
		isStaring.value = true
		const res = await apiPostCollect({
			userId:uni.getStorageSync('userId'),
			postId:postId.value,
		})
		console.log(res);
		if(res.code===200){
			setTimeout(() => {
				isStaring.value = false
				if(post.value.isFavorite===false){
					post.value.isFavorite = true
					post.value.favoriteCount++
				}else{
					post.value.isFavorite = false
					post.value.favoriteCount--
				}
			},300)
		}
	}
//获取当前时间
function formatTimestamp(timestamp) {
    const date = new Date(timestamp); // 将时间戳转换为 Date 对象
    const year = date.getFullYear();  // 获取年份
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 获取月份，注意要 +1，且格式化为2位数
    const day = String(date.getDate()).padStart(2, '0'); // 获取日期，格式化为2位数
    const hours = String(date.getHours()).padStart(2, '0'); // 获取小时，格式化为2位数
    const minutes = String(date.getMinutes()).padStart(2, '0'); // 获取分钟，格式化为2位数
    const seconds = String(date.getSeconds()).padStart(2, '0'); // 获取秒，格式化为2位数

    // 拼接成目标格式
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
let lastClickTime = 0; // 记录最后一次点赞的时间
const THROTTLE_TIME = 300; // 节流时间，单位是毫秒，比如1秒
// 点击点赞帖子
const clickHeart = async (item) => {
    const currentTime = new Date().getTime();
    // 如果距离上次点击时间小于节流时间，则不执行点赞
    if (currentTime - lastClickTime < THROTTLE_TIME) {
        console.log('操作太频繁，请稍后再试');
        return;
    }

    // 更新最后点击时间
    lastClickTime = currentTime;

    const likeTime = formatTimestamp(currentTime);
    console.log(likeTime);

    try {
        const res = await apiPostLike({
            userId: uni.getStorageSync('userId'),
            postId: postId.value,
            likeTime: likeTime
        });
        console.log(res);
        // 根据当前状态切换点赞和取消点赞
        if (post.value.isLike === false) {
            post.value.isLike = true;
            post.value.likeCount++;
        } else {
            post.value.isLike = false;
            post.value.likeCount--;
        }
    } catch (error) {
        console.error('点赞失败:', error);
    }
};

// 响应式数据，保存当前选中的排序类型
const sortType = ref('hot')
const sortTypeIndex = ref(2)
// 设置排序类型的方法
function setSortType(type,index) {
	const currentTime = new Date().getTime();
	if (currentTime - lastClickTime < THROTTLE_TIME) {
	    console.log('操作太频繁，请稍后再试');
	    return;
	}
	lastClickTime = currentTime;
  sortType.value = type
  sortTypeIndex.value=index
  getPostCommentList();
}
//点赞评论
const clickCommentHeart = async (item) =>{
	const currentTime = new Date().getTime();
	if (currentTime - lastClickTime < THROTTLE_TIME) {
	    return;
	}
	lastClickTime = currentTime;
	const likeTime = formatTimestamp(currentTime);
	console.log(likeTime);
	const res = await apiCommentLike({
		userId:uni.getStorageSync('userId'),
		commentId:item.commentId,
		likeTime:likeTime
	})
	console.log(res);
	// 根据当前状态切换点赞和取消点赞
	if (item.isLike === false) {
	    item.isLike = true;
	    item.likeCount++;
	} else {
	    item.isLike = false;
	    item.likeCount--;
	}
}
    const scrolltolower = () =>{
		console.log('触底了')
	}
	//点击下面评论弹出评论框并自动获取焦点
	const popup = ref()
	const isFocus = ref(false)
	const clickChat = () =>{
		popup.value.open()
		nextTick(() =>{
			isFocus.value = true
		})
	}
	const maskClick = () =>{
		isFocus.value = false
	}
	//
	const imageUrl = ref([])
    const addPicture = async (e) =>{
		console.log(e);
		await uni.uploadFile({
			url: baseUrl + '/api/v1/community/comment/image',
			method: 'post',
			header: {
				"Content-Type": "application/json" , 
				"Authorization": uni.getStorageSync('accessToken')
			},
			filePath: e.tempFilePaths[0],
			name: 'image',
			formData: {
				userId: uni.getStorageSync('userId')
			},
			success: (res) => {
				console.log(JSON.parse(res.data));
				imageUrl.value.push(JSON.parse(res.data).data.imageUrl)
			},
			fail: (err) => {
				console.log(err);
				uni.showToast({
					title: '上传失败,请重新上传',
					icon: 'error'
				})
			}
		})
	}
	const delPicture = async (e) =>{
		const res = await deleteFile(imageUrl.value[0])
		console.log(res);
	}
	const content = ref('')
	//点击发送
	const send = async () =>{
		const res = await apiPostComment({
			userId:uni.getStorageSync('userId'),
			postId:postId.value,
			content:content.value,
			imageUrl:imageUrl.value
		})
		console.log(res);
		content.value = ''
		imageUrl.value = []
		popup.value.close()
		getPostCommentList()
	}
	//评论的图片样式
	const imageStyles = reactive({
	  width: 44,
	  height: 36,
	  
	});
</script>

<template>
	<view class="container">
		<!-- 内容部分 -->
		<scroll-view scroll-y style="height: 100vh;" @scrolltolower="scrolltolower">
		<view class="header">
			<image class="avatar" :src="userAvatar || '../../static/avatar0.png'" mode="aspectFill"></image>
			<view class="username-title">
				<text class="username">{{userName}}</text>
				<text class="title">{{post.title}}</text>
			</view>
		</view>
		<view class="content">
			<text user-select="true">{{post.content}}</text>
		</view>
		<view class="imageBox" v-if="post.images && post.images.length > 1" >
			<view class="image-grid" v-for="(item,index) in post.images" :key="index">
				 <image :src="item" mode="aspectFill" class="image" @tap="previewImage(index)"></image>
			</view>
		</view>
		<view v-if="post.images && post.images.length === 1" class="imageBox1">
			<image :src="post.images" mode="widthFix" class="image1" @tap="previewImage(index)"></image>
		</view>
		<view class="actions">
			<view class="star">
				<uni-icons v-if="!post.isFavorite" type="star" size="50rpx" @tap.stop="clickStar()">
					<text style="font-size: 26rpx;">{{post.favoriteCount}}</text>
				</uni-icons>
				<uni-icons v-else type="star-filled" size="50rpx" color="#fdc550" @tap.stop="clickStar()">
					<text style="font-size: 26rpx;">{{post.favoriteCount}}</text>
				</uni-icons>
			</view>
			<view class="heart">
				<uni-icons v-if="!post.isLike" type="heart" size="48rpx" @tap.stop="clickHeart()">
					<text style="font-size: 25rpx;">{{post.likeCount}}</text>
				</uni-icons>
				<uni-icons v-else type="heart-filled" color="#ff5050" size="48rpx" @tap.stop="clickHeart()">
					<text style="font-size: 25rpx;">{{post.likeCount}}</text>
				</uni-icons>
			</view>
		</view>
		<view class="comments">
			<view class="types">
				<h1 style="font-weight: 600;font-size: 35rpx;">全部评论</h1>
				<view class="sort-buttons">
				        <view 
				          :class="['sort-btn', { active: sortType === 'hot' }]" 
				          @tap="setSortType('hot',2)"
				        >
				          <text>热门</text>
				        </view>
				        <view 
				          :class="['sort-btn', { active: sortType === 'asc' }]" 
				          @tap="setSortType('asc',0)"
				        >
				          <text>正序</text>
				        </view>
				        <view 
				          :class="['sort-btn', { active: sortType === 'desc' }]" 
				          @tap="setSortType('desc',1)"
				        >
				          <text>倒序</text>
				        </view>
				</view>
			</view>
			<view class="comment" v-for="(item,index) in comments" :key="index">
				<view class="header">
					<view class="userinfo">
						<image class="avatar" :src="item.userAvatar || '../../static/avatar0.png'" mode="aspectFill"></image>
						<view class="username-time">
							<text class="username">{{item.userName}}</text>
							<text class="time">{{formatTime(item.commentTime)}}</text>
						</view>
					</view>
					<view class="heart">
						<uni-icons v-if="!item.isLike" type="heart" size="48rpx" @tap="clickCommentHeart(item)">
							<text style="font-size: 25rpx;">{{item.likeCount}}</text>
						</uni-icons>
						<uni-icons v-else type="heart-filled" color="#ff5050" size="48rpx" @tap="clickCommentHeart(item)">
							<text style="font-size: 25rpx;">{{item.likeCount}}</text>
						</uni-icons>
					</view>
				</view>
				<view class="comment-text">
					<!-- 该帖子的评论 -->
					<view style="margin-bottom: 15rpx;font-size: 34rpx;">
						<text>{{item.content}}</text>
					</view>
					<!-- 回复评论的评论 -->
					<!-- <view class="reply" v-if="item.comments.length>0">
						<view v-for="item2 in item.comments" >
							<view class="header">
									<view class="userinfo">
										<image class="avatar" :src="item2.avatar || '../../static/avatar0.png'" mode="aspectFill"></image>
										<view class="username-time">
											<text class="username">{{item2.username}}</text>
											<text class="time">{{item2.createTime}}</text>
										</view>
									</view>
									<view class="heart">
										<uni-icons :type="isHeart" size="25" @tap="clickHeart()">
											<text style="font-size: 25rpx;">{{item2.likeCount}}</text>
										</uni-icons>
									</view>
							</view>
							<view class="comment-text" >
							  {{item2.text}}
							</view>
						</view> -->
						<!-- 超过 3 条时显示 "共 n 条评论" -->
						<!-- <view v-if="item.comments.length > 3" class="more-comments">
						    展开 {{ item.comments.length }} 条回复>
						</view> -->
					<!-- </view> -->
				</view>
			</view>
		</view>
		<view class="foot"></view>
		</scroll-view>
	</view>
	<!-- 底部发布评论 -->
	<view class="bottom">
		<view class="input-box" @tap="clickChat()">
			<view class="input">
				<text>发一条友善的评论</text>
			</view>
			<button class="btn">发送</button>
		</view>
	</view>
	<uni-popup ref="popup" type="bottom" border-radius="8rpx 8rpx 0 0" @maskClick="maskClick">
		<view class="bottom">
			<view class="pop-input-box">
				<textarea class="input" v-model="content" auto-height maxlength="500" :show-confirm-bar="false" :cursor-spacing="105" :focus="isFocus" placeholder="发一条友善的评论" />
			</view>
			<view class="pop-btn-box">
				<view class="img">
					<uni-file-picker limit="1"  :maxSize="8" :imageStyles="imageStyles" file-mediatype="image" @select="addPicture" @delete="delPicture">
						<uni-icons type="image" size="40"></uni-icons>
					</uni-file-picker>
				</view>
				<view class="send">
					<button class="btn" @tap="send()">发送</button>
				</view>
			</view>
		</view>
	</uni-popup>
</template>

<style lang="scss" scoped>
.container {
	height: 100vh;
	background-color: #fff;
}
.header {
	display: flex;
	align-items: center;
	// margin: 20rpx 0;
	padding: 20rpx;
	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-right: 20rpx;
	}
	.username-title {
		display: flex;
		flex-direction: column;
		.username {
			font-size: 28rpx;
			margin-bottom: 10rpx;
			color: #50a86f;
			font-weight: 600;
		}
		.title {
			font-size: 34rpx;
			font-weight: 600;
			color: #000;
		}
	}
}
.bottom {
	position: fixed;
	width: 100%;
	bottom: 0;
	background-color: #fff;
	.input-box {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		
		.btn {
			margin-left: 10rpx;
			text-align: center;
			background-color: #55b376;
			color: #fff;
			border-radius: 10rpx;
			font-size: 28rpx;
		}
	}
}
.input {
	flex: 1;
	height: 40rpx;
	border: 1rpx solid #ccc;
	background-color: #eeeeef;
	border-radius:40rpx;
	padding: 15rpx 20rpx;
	font-size: 26rpx;
	text {
		text-align: center;
		line-height: 40rpx;
		color: gray;
		font-size: 26rpx;
		padding-left: 10rpx;
	}
}
.pop-input-box{
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx;
}
.pop-btn-box{
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 20rpx;
	margin-bottom: 40rpx;
	.img{
		margin-left: 30rpx;
	}
	.btn{
		text-align: center;
		background-color: #55b376;
		color: #fff;
		border-radius: 40rpx;
		font-size: 28rpx;
	}
}
.content{
	margin: 10rpx 0;
	padding: 20rpx;
	font-size: 32rpx;
}
/* 图片九宫格布局 */
.imageBox {
    margin-bottom: 10px;
    padding: 0 20rpx;
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 8rpx;
    .image-grid{
	    height: 250rpx;
		border-radius: 8rpx;
		overflow: hidden;
	    .image{
	        width: 100%;
			height: 100%;
	    }
    } 
}
.imageBox1{
	padding: 0 20rpx;
    .image1{
		// width: 100%;
	}
}
.actions{
	display: flex;
	justify-content: flex-end;
	align-items: center;
	margin-top: 40rpx;
	padding: 20rpx;
	.star{
		margin-right: 50rpx;
	}
	.heart{
		margin-right: 25rpx;
	}
}
.comments{
	padding: 20rpx;
	border-top: 2px solid #e6e6e6;
	border-bottom: 1px solid #e6e6e6;
	box-shadow: #ccc;
	border-radius: 20rpx;
	.types{
		display: flex;
		justify-content: space-between;
		align-items: center;
		.sort-buttons {
		  display: flex;
		  background-color: #f0f0f0;
		  border-radius: 30rpx;
		}
		
		.sort-btn {
		  padding: 5rpx 15rpx;
		  background-color: #f0f0f0;
		  border-radius: 30rpx;
		  font-size: 28rpx;
		  color: #333;
		  font-size: 28rpx;
		  text {
			  padding: 10rpx;
		  }
		}
		
		.sort-btn.active {
		  background-color: #50a86f;
		  color: white;
		  font-size: 28rpx
		}
	}
}
.foot{
	background-color: #f5f5f5;
	height: 200rpx;
}
.comment{;
	border-bottom: 2px solid #e6e6e6;
	padding-bottom: 15rpx;
	.header{
		display: flex;
		justify-content: space-between;
		padding: 20rpx 0rpx;
	}
}
.comment:last-child{
	border-bottom: none;
}
.userinfo{
	display: flex;
	align-items: center;
	.avatar{
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		margin-right: 15rpx;
	}
}
.username-time{
	display: flex;
	flex-direction: column;
	.username{
		font-size: 27rpx;
		padding-bottom: 8rpx;
		color: #50a86f;
		font-weight: 600;
	}
	.time{
		font-size: 24rpx;
	}
}
.comment-text{
	margin-left: 90rpx;
}
.reply{
	background: #f3f3f3;
	padding: 15rpx 10rpx;
	font-size: 27rpx;
}
.more-comments{
	color: #50a86f;
	font-size: 26rpx;
	font-weight: 600;
	padding-top: 10rpx;
}

</style>
