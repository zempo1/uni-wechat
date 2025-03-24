<script setup>
import { nextTick, onMounted,getCurrentInstance } from 'vue';
import {onShareAppMessage} from '@dcloudio/uni-app'
import {getOtherUserInfo} from '@/api/user.js'
import {apiPostDetail,apiPostCommentList,apiPostCollect,apiPostLike,apiPostComment,apiCommentLike,apiPostCommentChildList,apiCommentReply,apiCommentDelete} from '../../api/post.js'
import {baseUrl} from '../../utils/request.js'
import {deleteFile} from '@/api/file.js'
import {formatTimestamp,formatDate} from '@/common/formatTime.js'
    const postId = ref()
	const userAvatar = ref()
	const userName = ref()
	
	onLoad(async (option)=>{
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
		eventChannel.emit('acceptCommentCount',{
			data: post.value.commentCount
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
		//获取发帖者头像
		const res2 = await getOtherUserInfo({
			userId: uni.getStorageSync('userId'),
			targetId: res.data.userId
		})
		console.log(res2);
		userAvatar.value = res2.data.avatarUrl
	}
	//查询帖子评论
	const noData = ref(false)
	const isRefreshing = ref(false) //是否正在刷新帖子
	const commentId = ref('')
	const limit = ref(5)
	const comments = ref([])
	const getPostCommentList = async()=>{
		const res = await apiPostCommentList({
			userId: uni.getStorageSync('userId'),
			postId: postId.value,
			commentId: commentId.value,
			limit: limit.value,
			sortType: sortTypeIndex.value
		})
		console.log(res);
		if(limit.value>res.data.length) noData.value = true
		comments.value = [...comments.value,...res.data];
		console.log(comments.value);
	}
	//帖子数据
	const post = ref([])
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
  comments.value=[]
  commentId.value=''
  noData.value = false
  getPostCommentList();
}
//点赞评论
const clickCommentHeart = async (item,type) =>{
	console.log(item);
	console.log(type);//1为点赞评论，0为点赞子评论
	const currentTime = new Date().getTime();
	if (currentTime - lastClickTime < THROTTLE_TIME) {
	    return;
	}
	lastClickTime = currentTime;
	const likeTime = formatTimestamp(currentTime);
	console.log(likeTime);
	if(type==='1'){
		const res = await apiCommentLike({
			userId:uni.getStorageSync('userId'),
			commentId:item.commentId,
			likeTime:likeTime,
			postId:postId.value
		})
		console.log(res);
	}else{
		console.log(commentCopy.value.commentId);
		const res = await apiCommentLike({
			userId:uni.getStorageSync('userId'),
			commentId:item.commentId,
			likeTime:likeTime,
			postId:postId.value,
			rootId: commentCopy.value.commentId
		})
		console.log(res);
	}
	// 根据当前状态切换点赞和取消点赞
	if (item.isLike === false) {
	    item.isLike = true;
	    item.likeCount++;
	} else {
	    item.isLike = false;
	    item.likeCount--;
	}
}
//点赞楼主的评论
	const clickBuilderHeart = async () =>{
		console.log(commentCopy.value);
		const currentTime = new Date().getTime();
		if (currentTime - lastClickTime < THROTTLE_TIME) {
		    return;
		}
		lastClickTime = currentTime;
		const likeTime = formatTimestamp(currentTime);
		console.log(likeTime);
		const res = await apiCommentLike({
			userId:uni.getStorageSync('userId'),
			commentId:commentCopy.value.commentId,
			likeTime:likeTime,
			postId:postId.value
		})
		console.log(res);
		// 根据当前状态切换点赞和取消点赞
		if (commentCopy.value.isLike === false) {
		    commentCopy.value.isLike = true;
		    commentCopy.value.likeCount++;
		} else {
		    commentCopy.value.isLike = false;
		    commentCopy.value.likeCount--;
		}
	}
	//评论详情触底加载更多
    const scrolltolower = async () =>{
		if(noData.value || isRefreshing.value){
			return
		}
		console.log('触底加载帖子');
		commentId.value=comments.value[comments.value.length-1].commentId
		console.log(commentId.value);
		if(sortTypeIndex.value===2){
			const likeCount = comments.value[comments.value.length-1].likeCount//最后一条评论的点赞数
			console.log(likeCount);
			isRefreshing.value = true
			const res = await apiPostCommentList({
				userId: uni.getStorageSync('userId'),
				postId: postId.value,
				commentId: commentId.value,
				limit: limit.value,
				sortType: sortTypeIndex.value,
				likeCount:likeCount
			})
			console.log(res);
			if(limit.value>res.data.length) noData.value = true
			comments.value = [...comments.value,...res.data];
			isRefreshing.value = false
		}else{
			isRefreshing.value = true
			getPostCommentList();
			isRefreshing.value = false
		}
		
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
	const imageId = ref([])
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
				imageId.value.push(JSON.parse(res.data).data.imageId)
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
		const res = await deleteFile(imageId.value[0])
		console.log(res);
	}
	const content = ref('')
	//点击发送
	const send = async () =>{
		const currentTime = new Date().getTime();
		const commentTime = formatTimestamp(currentTime);
		console.log(commentTime);
		const res = await apiPostComment({
			userId:uni.getStorageSync('userId'),
			postId:postId.value,
			content:content.value,
			images:imageId.value,
			commentTime:commentTime
		})
		console.log(res);
		content.value = ''
		imageId.value = []
		popup.value.close()
		comments.value=[]
		commentId.value = ''
		isFocus.value = false
		uni.showToast({
			title: '发布成功',
			icon: 'none'
		})
		getPostCommentList()
	}
	//编辑评论的图片样式
	const imageStyles = reactive({
	  width: 44,
	  height: 36,
	  
	});
	//点击评论查看全部评论
	const popupOpenComment = ref()
	const commentCopy = ref({})//点击评论查看评论详情楼主的评论
	const commentTime = ref()
	const childComments = ref([])
	const childCommentLimit = ref(5)
	const childCommentId = ref('')
	const getPostCommentChildList = async (item) =>{
		const res = await apiPostCommentChildList({
			userId: uni.getStorageSync('userId'),
			rootId:item.commentId,
			commentId: childCommentId.value,
			limit: childCommentLimit.value,
			sortType: 1
		})
		console.log(res);
		if(limit.value>res.data.length) noDataChild.value = true
		childComments.value = [...childComments.value,...res.data];
	}
	const replayTo = ref() //回复哪条评论
	const openComment = async (item) =>{
		//如果触发长按则不触发点击
		if(isLongTap.value) {
			isLongTap.value = false
			return
		}
		console.log(item);
		placeholder.value='发布一条友善的评论'
		replayTo.value = item.commentId //默认为回复楼主的评论
		childComments.value = []
		commentCopy.value = item
		console.log('图片',commentCopy.value);
		console.log(commentCopy.value.images.length);
		commentTime.value = formatDate(item.commentTime)
		getPostCommentChildList(item)
		popupOpenComment.value.open()
	}
	//关闭评论查看所有评论
	const closeComment = () =>{
		popupOpenComment.value.close()
		replyContent.value=''
		childCommentId.value = ''
		noDataChild.value=false
	}
	//点击遮罩层关闭查看所有评论
	const maskClickChild = () =>{
		childCommentId.value=''
		noDataChild.value=false
	}
	//子评论详情触底加载更多
	const isRefreshingChild = ref(false)
	const noDataChild = ref(false)
	const popScrolltolower = async () =>{
		console.log(noDataChild.value);
		if(noDataChild.value || isRefreshingChild.value){
			return
		}
		console.log('触底加载子评论');
		childCommentId.value = childComments.value[childComments.value.length-1].commentId
		console.log(childCommentId.value);
		isRefreshingChild.value = true
		getPostCommentChildList(commentCopy.value);
		isRefreshingChild.value = false
	}

	//回复评论
	const placeholder = ref('发布一条友善的评论')
	const clickReply = (item) =>{
		//如果触发长按则不触发点击
		if(isLongTap.value) {
			isLongTap.value = false
			return
		}
		console.log(item);
		replayTo.value = item.commentId //点击子评论回复子评论
		uni.setStorageSync('replayTo',replayTo.value)
		console.log('replayTo',replayTo.value);
		placeholder.value = `回复${item.userName}`
		nextTick(() =>{
			isFocus.value = true
		})
		
	}
	//子评论输入框失去焦点
	const blur = () =>{
		console.log('失去焦点');
		placeholder.value='发布一条友善的评论'
		replayTo.value = commentCopy.value.commentId //变为回复楼主的评论
		isFocus.value = false
	}
	const replyContent = ref()//评论内容
	//查看子评论点击发送评论
	const sendReply = async () =>{
		console.log(commentCopy.value.commentId);
		replayTo.value = uni.getStorageSync('replayTo')
		console.log(replayTo.value);
		if(!replyContent.value){
			uni.showToast({
				title: '评论内容不能为空',
				icon: 'none'
			})
			return
		}
		const currentTime = new Date().getTime();
		const commentTime = formatTimestamp(currentTime);
		const res = await apiCommentReply({
			userId:uni.getStorageSync('userId'),
			postId:postId.value,
			replyTo:replayTo.value,
			rootId: commentCopy.value.commentId,
			content:replyContent.value,
			commentTime:commentTime
		})
		console.log(res);
		uni.removeStorageSync('replayTo')
		placeholder.value='发布一条友善的评论'
		replayTo.value = commentCopy.value.commentId //变为回复楼主的评论
		isFocus.value = false
		//同步更新数据
		const commentIndex = comments.value.findIndex(item => item.commentId === commentCopy.value.commentId);
		if (commentIndex !== -1) {
		    // 直接将新回复添加到该评论的 `replyList` 中
			comments.value[commentIndex].userName = uni.getStorageSync('userName')
		    comments.value[commentIndex].replyCount += 1; // 更新回复数量
			// if(comments.value[commentIndex].replyCount<4)
			comments.value[commentIndex].replyList.push({userName:uni.getStorageSync('userName'),content:replyContent.value,commentId:res.data.commentId});
			console.log('comments',comments.value);
		}
		closeComment()
		uni.showToast({
			title: '发布成功',
			icon: 'none'
		})
	
	}
	//查看评论图片
	const previewCommentImage = (image) =>{
		console.log(image);
		uni.previewImage({
			urls:[image]
		})
	}
	
	const popupDel = ref()
	const isLongTap = ref()//是否触发长按
	const isShowDel = ref(false)//是否显示删除按钮
	//点击长按触发弹窗的遮罩层
	const maskClickLongtap = () =>{
		isShowDel.value = false
	}
	const copyContent = ref()
	const delCommentId = ref()
	const type = ref('')
	const longtap = (item,t) =>{
		console.log(item)
		type.value = t
		console.log(type.value);//'1'为评论长按，'0'为子评论长按
		copyContent.value = item.content
		delCommentId.value = item.commentId
		if(item.userId === uni.getStorageSync('userId')) isShowDel.value=true;
		isLongTap.value = true
		popupDel.value.open()
	}
	//删除评论
	const del = async () =>{
		//是否删除
		uni.showModal({
				title: '提示',
				content: '确定删除该评论吗？',
				confirmColor: '#5cc280',
				success: async function (re) {
					if (re.confirm) {
						if(type.value==='1'){
							const res = await apiCommentDelete({
								userId:uni.getStorageSync('userId'),
								commentId:delCommentId.value,
								postId:postId.value
							})
							console.log(res);
							//同步更新数据
							const commentIndex = comments.value.findIndex(item => item.commentId === delCommentId.value);
							//将删除的评论同步去除
							if(commentIndex !== -1){
								comments.value.splice(commentIndex, 1);
							}
						}else{
							const res = await apiCommentDelete({
								userId:uni.getStorageSync('userId'),
								commentId:delCommentId.value,
								postId:postId.value,
								rootId:commentCopy.value.commentId
							})
							console.log(res);
							//同步更新数据
							const commentIndex = childComments.value.findIndex(item => item.commentId === delCommentId.value);
							console.log('commentIndex',commentIndex);
							if(commentIndex !== -1){
								childComments.value.splice(commentIndex, 1);
								//comments的replayList也同步删除
								const commentIndex1 = comments.value.findIndex(item => item.commentId === commentCopy.value.commentId);
									if (commentIndex1 !== -1) {
										comments.value[commentIndex1].replyCount -= 1; // 更新回复数量
										if(comments.value[commentIndex1].replyCount<4){
											console.log('commentIndex1',commentIndex1,'delCommentId',delCommentId.value);
											const delIndex = comments.value[commentIndex1].replyList.findIndex(item => item.commentId === delCommentId.value);
											console.log('delIndex',delIndex);
												if (delIndex !== -1) {
													comments.value[commentIndex1].replyList.splice(delIndex, 1);
												}
										}
									}
							}
						}
						
						uni.showToast({
							title: '删除成功',
							icon: 'none'
						})
						popupDel.value.close()
						
					}
				}
			});
	}
	const copy = () =>{
		uni.setClipboardData({
			data:copyContent.value,//要被复制的内容
			success:()=>{//复制成功的回调函数
				uni.showToast({//提示
				    title:'复制成功',
				    icon: 'none'
				})
			}
		});
	}
	const popLongtapClose = () =>{
		popupDel.value.close()
	}
	//转发给好友
	onShareAppMessage((e)=>{
		return {
			title: 'Z共享',
			url:'/pages/postContent/postContent?postId='+postId.value+'&userAvatar='+userAvatar.value+'&userName='+userName.value,
		}
	})
</script>

<template>
	<view class="container">
		<!-- 内容部分 -->
		<scroll-view scroll-y style="height: 100vh;" @scrolltolower="scrolltolower">
		<view class="header">
			<image class="avatar" :src="userAvatar || '../../static/avatar0.png'" mode="aspectFill"></image>
			<view class="username-time">
				<text class="username">{{userName}}</text>
				<text class="time">{{formatDate(post.createTime)}}</text>
			</view>
		</view>
		<view class="title">
			<text user-select="true">{{post.title}}</text>
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
		    <!-- 帖子评论区域 -->
			<view class="comment" v-for="(item,index) in comments" :key="index" @tap="openComment(item)" >
				<view class="header"  @longtap="longtap(item,'1')">
					<view class="userinfo">
						<image class="avatar" :src="item.userAvatar || '../../static/avatar0.png'" mode="aspectFill"></image>
						<view class="username-time">
							<text class="username">{{item.userName}}</text>
							<text class="time">{{formatDate(item.commentTime)}}</text>
						</view>
					</view>
					<view class="heart">
						<uni-icons v-if="!item.isLike" type="heart" size="48rpx" @tap.stop="clickCommentHeart(item,'1')">
							<text style="font-size: 25rpx;">{{item.likeCount}}</text>
						</uni-icons>
						<uni-icons v-else type="heart-filled" color="#ff5050" size="48rpx" @tap.stop="clickCommentHeart(item,'1')">
							<text style="font-size: 25rpx;">{{item.likeCount}}</text>
						</uni-icons>
					</view>
				</view>
				<view class="comment-text">
					<!-- 该帖子的评论 -->
					<view @longtap="longtap(item,'1')">
						<view style="margin-bottom: 15rpx;font-size: 34rpx;" >
							<text style="font-size: 34rpx;">{{item.content}}</text>
						</view>					
						<view class="post-images" v-if="item.images.length" >
						    <image @tap.stop="previewCommentImage(item.images[0])" :src="item.images[0]" mode="aspectFill" class="post-image"></image>
						</view>
					</view>
					<!-- 回复评论的评论 -->
					<view class="reply" v-if="item.replyList.length>0">
						<view v-for="item2 in item.replyList.slice(0,3)" >
							<text class="reply-user">{{item2.userName}}：</text>
							<text class="reply-text">{{item2.content}}</text>
						</view>
						<!-- 超过 3 条时显示 "共 n 条评论" -->
						<view v-if="item.replyCount > 3" class="more-comments">
						    查看全部 {{ item.replyCount }} 条回复>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view v-if="noData || childComments.length>0" style="padding: 20rpx;">
			<uni-load-more :status="noData?'noMore':'loading'"></uni-load-more>
		</view>
		<view v-if="noData" style="display: flex;justify-content: center;">
			<image style="height: 100%;" mode="widthFix" src="../../static/noData.png"></image>
		</view>
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
				<textarea class="input" v-model="content" auto-height maxlength="500" :show-confirm-bar="false" :cursor-spacing="110" :focus="isFocus" placeholder="发一条友善的评论" />
			</view>
			<view class="pop-btn-box">
				<view class="img">
					<uni-file-picker :value="imageId" limit="1"  :maxSize="8" :imageStyles="imageStyles" file-mediatype="image" @select="addPicture" @delete="delPicture">
						<uni-icons type="image" size="40"></uni-icons>
					</uni-file-picker>
				</view>
				<view class="send">
					<button class="btn" @tap="send()">发送</button>
				</view>
			</view>
		</view>
	</uni-popup>
	<uni-popup ref="popupOpenComment" background-color="#fff" type="bottom" border-radius="15rpx 15rpx 0 0" @maskClick="maskClickChild">
		<scroll-view scroll-y style="height: 1080rpx;" @scrolltolower="popScrolltolower">
		    <view class="popComment-contain">
				<view class="top">
					<view><uni-icons @tap="closeComment()" type="closeempty" size="50rpx"></uni-icons></view>
					<text class="top-title">评论详情</text>
				</view>
				<view class="commentTop">
					<view class="header">
						<view class="userinfo">
							<image class="avatar" :src="commentCopy.userAvatar || '../../static/avatar0.png'" mode="aspectFill"></image>
							<view class="username-time">
								<text class="username">{{commentCopy.userName}}</text>
								<text class="time">{{commentTime}}</text>
							</view>
						</view>
						<view class="heart">
							<uni-icons v-if="!commentCopy.isLike" type="heart" size="48rpx" @tap="clickBuilderHeart()">
								<text style="font-size: 25rpx;">{{commentCopy.likeCount}}</text>
							</uni-icons>
							<uni-icons v-else type="heart-filled" color="#ff5050" size="48rpx" @tap="clickBuilderHeart()">
								<text style="font-size: 25rpx;">{{commentCopy.likeCount}}</text>
							</uni-icons>
						</view>
					</view>
					<view class="comment-text" style="margin-bottom: 15rpx;font-size: 34rpx;">
						<text user-select>{{commentCopy.content}}</text>
					</view>
					<view class="post-images" v-if="commentCopy.images?.length>0" style="margin-left: 110rpx;" >
					    <image @tap="previewCommentImage(commentCopy.images[0])" :src="commentCopy.images[0]" mode="aspectFill" class="post-image"></image>
					</view>
				</view>
				<!-- 子评论列表 -->
				<view class="comment" v-for="(item,index) in childComments" :key="index" @tap="clickReply(item)" @longtap="longtap(item,'0')">
					<view class="header" style="padding: 20rpx;">
						<view class="userinfo">
							<image class="avatar" :src="item.userAvatar || '../../static/avatar0.png'" mode="aspectFill"></image>
							<view class="username-time">
								<text class="username">{{item.userName}}</text>
								<text class="time">{{formatDate(item.commentTime)}}</text>
							</view>
						</view>
						<view class="heart">
							<uni-icons v-if="!item.isLike" type="heart" size="48rpx" @tap.stop="clickCommentHeart(item,'0')">
								<text style="font-size: 25rpx;">{{item.likeCount}}</text>
							</uni-icons>
							<uni-icons v-else type="heart-filled" color="#ff5050" size="48rpx" @tap.stop="clickCommentHeart(item,'0')">
								<text style="font-size: 25rpx;">{{item.likeCount}}</text>
							</uni-icons>
						</view>
					</view>
					<view class="pop-comment-text">
						<text v-if="item.replyTo===commentCopy.commentId" style="margin-bottom: 15rpx;font-size: 34rpx;">{{item.content}}</text>
						<text v-else style="margin-bottom: 15rpx;font-size: 34rpx;">回复 <text style="color: #50a86f;">@{{item.replyToName}}</text>：{{item.content}}</text>
					</view>
				</view>
				<view v-if="noDataChild || comments.length>0" style="padding: 20rpx;">
					<uni-load-more :status="noDataChild?'noMore':'loading'"></uni-load-more>
				</view>
				<!-- 底部发布评论 -->
				<view class="bottom">
					<view class="pop-comment-inputBox">
						<view class="comment-input">
							<textarea class="comment-textarea" v-model="replyContent" @blur="blur" :focus="isFocus" auto-height maxlength="500" :show-confirm-bar="false" :cursor-spacing="110" :placeholder="placeholder"></textarea>
						</view>
						<text class="comment-btn" @tap="sendReply()">发送</text>
					</view>
				</view>
			</view>
		</scroll-view>
	</uni-popup>
	<uni-popup ref="popupDel" type="bottom" border-radius="8rpx 8rpx 0 0"  @maskClick="maskClickLongtap" >
		<view class="pop-contain">
			<view class="del" style="border-bottom: 2rpx solid #e6e6e6;" @tap="copy()">
				<uni-icons type="wallet" size="22" color="#666"></uni-icons>
				<text>复制</text>
			</view>
			<view v-if="isShowDel" class="del" @tap="del()">
				<uni-icons type="trash" size="22" color="red"></uni-icons>
				<text>删除</text>
			</view>
			<view class="cancel" @tap="popLongtapClose()"><text>取消</text></view>
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
	.username-time {
		display: flex;
		flex-direction: column;
		.username {
			font-size: 28rpx;
			margin-bottom: 10rpx;
			color: #50a86f;
			font-weight: 600;
		}
		.time {
			font-size: 26rpx;
			color: #999999;
		}
	}
}
.title{
	font-size: 32rpx;
	font-weight: 600;
	padding: 0 20rpx;
	
}
.content{
	margin: 10rpx 0;
	padding: 20rpx;
	font-size: 32rpx;
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
		border-radius: 12rpx;
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
.post-images {
  margin-bottom: 10rpx;
}

.post-image {
  width: 250rpx;
  height: 220rpx;
  border-radius: 12rpx;
  background-color: #f5f5f5;
}
.reply{
	background: #f3f3f3;
	padding: 15rpx 10rpx;
	font-size: 28rpx;
	border-radius: 5rpx;
	.reply-user{
		color: #666;
		font-weight: 600;
	}
}
.more-comments{
	color: #50a86f;
	font-size: 26rpx;
	font-weight: 600;
	padding-top: 10rpx;
}
.popComment-contain{
	height: 1090rpx;
	.top{
		display: flex;
		align-items: center;
		border-bottom: 1px solid #e6e6e6;
		padding: 20rpx;
		position: fixed;
		top: 0;
		width: 100%;
		background-color: #fff;
		.top-title{
			font-size: 30rpx;
			margin-left: 234rpx;
		}
	}
	.commentTop{
		margin-top: 70rpx;
		padding: 20rpx 0rpx;
		border-bottom: 30rpx solid #e6e6e6;
		.header{
			display: flex;
			justify-content: space-between;
		}
		.comment-text{
			margin-left: 110rpx;
		}
	}
	.pop-comment-text{
		padding: 10rpx;
		margin-left: 100rpx;
	}
	.bottom {
		position: fixed;
		width: 100%;
		bottom: 0;
		background-color: #fff;
		.pop-comment-inputBox{
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx 20rpx;
			.comment-input{
				border: 1rpx solid #ccc;
				background-color: #eeeeef;
				border-radius:40rpx;
				padding: 15rpx 20rpx;
				font-size: 26rpx;
				.comment-textarea{
					width: 540rpx;
				}
			}
			.comment-btn{
				width: 110rpx;
				height: 60rpx;
				line-height: 60rpx;
				border-radius: 10rpx;
			    padding: 5rpx;
				text-align: center;
				background-color: #55b376;
				color: #fff;
				font-size: 28rpx;
			}
		}
	}
}
.pop-contain{
	background-color: #fff;
	.del{
		padding: 30rpx 20rpx;
		border-bottom: 10rpx solid #e6e6e6;
		display: flex;
		align-items: center;
		text{
			font-size: 32rpx;
			margin-left: 20rpx;
			vertical-align: middle;
		}
	}
	.cancel{
		padding: 30rpx 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		text{
			font-size: 34rpx;
		}
	}
}
</style>
