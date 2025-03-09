<script setup>
import { ref, onMounted, nextTick } from 'vue';
import {apigetPostList,apiPostLike,apiPostCollect} from '../../api/post.js'
import { login } from '../../api/user.js';
onLoad(()=>{
	userId.value = uni.getStorageSync('userId')
	getPostList()
	console.log(userId.value);
	console.log('刷新');
})

const gotoCommunityLife = () => {
    uni.navigateTo({
        url: '/pages/index/communityLife/communityLife'
    });
};
const gotoPostBar = () => {
    uni.navigateTo({
        url: '/pages/index/PostBar/PostBar'
    });
};
const activeFilter = ref('全部');
const scrollTop = ref(0);  // 用于记录滚动的位置
const oldScrollTop = ref(0)
const fixedTop = ref(false); // 判断是否固定
const showTopButton = ref(false); // 控制按钮显示状态
// 设置激活的筛选条件
const setActiveFilter = (item) => {
    activeFilter.value = item;
    console.log(item);
};

// 监听滚动事件
const onScroll = (e) => {
    oldScrollTop.value = e.detail.scrollTop;
    // 如果滚动位置超过一定值，固定"top"
    fixedTop.value = oldScrollTop.value > 200;
	showTopButton.value = oldScrollTop.value > 300; // 滚动超过300rpx显示按钮
};
//公告
const announcement = [
	'1、deepseek满血版上线莞工？！',
	'2、北街巴萨客着火！鼠鼠都被烧焦了',
	'3、开学啦！',
	'4、我头发怎么快掉光了'
]
//帖子数据
const post = ref([

]) 
const isStar=ref('star')
const isLike = ref(false)
const starNumber = ref(0)
const chatNumber = ref(0)
const favoriteCount = ref(0)
//获取当前时间
function formatTimestamp(timestamp) {
	console.log(timestamp);
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


// 点击收藏
const isStaring = ref(false)
const clickStar= async (item)=>{
	if(isStaring.value){
		return;
	}
	isStaring.value = true
	const res = await apiPostCollect({
		userId:uni.getStorageSync('userId'),
		postId:item.discussPostId,
	})
	console.log(res);
	if(res.code===200){
		setTimeout(() => {
			isStaring.value = false
			if(item.isFavorite===false){
				item.isFavorite = true
				item.favoriteCount++
			}else{
				item.isFavorite = false
				item.favoriteCount--
			}
		},300)
	}
}

// 点击点赞
let lastClickTime = 0; // 记录最后一次点赞的时间
const THROTTLE_TIME = 300; // 节流时间，单位是毫秒，比如1秒

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
            userId: userId.value,
            postId: item.discussPostId,
            likeTime: likeTime
        });
        console.log(res);

        // 根据当前状态切换点赞和取消点赞
        if (item.isLike === false) {
            item.isLike = true;
            item.likeCount++;
        } else {
            item.isLike = false;
            item.likeCount--;
        }
    } catch (error) {
        console.error('点赞失败:', error);
    }
};

// 点击评论
const popup = ref()

const newComment = ref('');

//查询帖子列表
const userId = ref()
const postId = ref('')
const limit = ref(5)
const noData = ref(false)
const isRefreshing = ref(false) //是否正在刷新帖子
const getPostList = async()=>{
	const res = await apigetPostList({
		userId:uni.getStorageSync('userId'),
		postId:postId.value,
		limit:limit.value,
		schoolCode:'11819'
	})
	console.log(res)
	post.value = [...post.value,...res.data];
	if(limit.value>res.data.length) noData.value = true
	console.log(post.value);
}
// 控制每个帖子文本是否展开
const expandedPostIds = ref(new Set());

// 判断是否展开
const isTextExpanded = (postId) => {
  return expandedPostIds.value.has(postId);
};

// 切换文本展开和收起状态
const toggleText = (postId) => {
  if (expandedPostIds.value.has(postId)) {
    expandedPostIds.value.delete(postId);
  } else {
    expandedPostIds.value.add(postId);
  }
};

// 截取文本到指定长度
const truncatedText = (text, length = 100) => {
  return text.slice(0,length)
};

const previewImage = (image) =>{
	console.log(image);
	uni.previewImage({
		urls:[image]
	})
}
//触底加载帖子
const scrolltolower = async () => {
	if(noData.value || isRefreshing.value){
		return
	}
    console.log('触底加载帖子');
	postId.value=post.value[post.value.length-1].discussPostId
	console.log(postId.value);
	isRefreshing.value = true
	const res = await getPostList()
	isRefreshing.value = false
};
//跳转到帖子详情
const currentPostId = ref()
const gotoPostContent = (postId,userAvatar,userName) =>{
	currentPostId.value = postId
	uni.navigateTo({
		//url拼接postId和userAvatar
		url:'/pages/postContent/postContent?postId='+postId+'&userAvatar='+userAvatar+'&userName='+userName,
		events: {
			// 为指定事件添加监听器，获取被打开页面传送到当前页面的数据
			acceptLikeCount: (data) => {
				post.value.forEach(item => {
					if (item.discussPostId === currentPostId.value) {
						item.likeCount = data.data
					}
				})
			},
			acceptFavoriteCount: (data) => {
				favoriteCount.value=data.data
				console.log(favoriteCount.value,currentPostId.value);
				//在post找到跟currentPostId一样的postId并将favoriteCount更新
				post.value.forEach(item => {
					if (item.discussPostId === currentPostId.value) {
						item.favoriteCount = favoriteCount.value
					}
				})
			},
			acceptIsLike: (data) =>{
				post.value.forEach(item =>{
					if(item.discussPostId === currentPostId.value){
						item.isLike = data.data
					}
				})
			},
			acceptIsFavorite: (data) =>{
				post.value.forEach(item =>{
					if(item.discussPostId === currentPostId.value){
						item.isFavorite = data.data
					}
				})
			}
		}
	});
}
//插件z-paging的下拉刷新
const paging = ref()
const queryList = () =>{
	// console.log(pageNo,pageSize);
	setTimeout(() =>{
		noData.value = false
			 apigetPostList({
				userId:uni.getStorageSync('userId'),
				postId:'',
				limit:limit.value,
				schoolCode:'11819'
			}).then(res=>{
				console.log(res);
				paging.value.complete(res.data);
				if(limit.value>res.data.length) noData.value = true
				isLiking.value = false
				isStaring.value = false
			}).catch(err=>{
				paging.value.complete(false);
			})
	},300)
}
const isLaunching = ref(false); // 触发火箭动画
const onTop = () =>{
	 isLaunching.value = true; // 触发火箭动画
	 setTimeout(() => {
	    scrollTop.value = oldScrollTop.value;
	    nextTick(() => {
	      scrollTop.value = 0;
	    });
	
	    // 火箭动画结束后重置状态
	    setTimeout(() => {
	      isLaunching.value = false;
	    }, 600);
	  }, 100);
}
</script>

<template>
   <z-paging ref="paging" v-model="post" refresher-only @onRefresh="queryList" >
	   <template #refresher="{refresherStatus}">
		   <custom-refresher :status="refresherStatus" />
	   </template>
	   <view class="index">
	   	  <scroll-view scroll-y :scroll-top="scrollTop" style="height: calc(100vh);" @scroll="onScroll" @scrolltolower="scrolltolower">
	   	        <view class="header">
	   	            <view class="btn" @tap="gotoPostBar()">帖吧</view>
	   	            <view class="btn" @tap="gotoCommunityLife()">社团生活</view>
	   	        </view>
	   	        <!-- 固定的 top 区域 -->
	   	        <view class="top" :class="{ fixed: fixedTop }">
	   	            <view class="announce">
	   	                <view class="left">
	   	                    <text>本公</text>
	   	                    <text>校告</text>
	   	                </view>
	   	                <view class="right">
	   	                    <swiper vertical autoplay interval="2700" duration="2000" circular>
	   	                        <swiper-item v-for="item in announcement" >
	   	                            <text class="announceText">{{item}}</text>
	   	                        </swiper-item>
	   	                    </swiper>
	   	                </view>
	   	            </view>
	   	            <!-- 类别 -->
	   	            <view class="category">
	   	                <view
	   	                    v-for="(item, index) in ['全部', '精选', '校园动态', '校园活动','学分汇总']"
	   	                    :key="index"
	   	                    class="filter-item"
	   	                    :class="{ active: activeFilter === item }"
	   	                    @tap="setActiveFilter(item)"
	   	                >
	   	                    <transition name="slide-fade">
	   	                        <view v-if="activeFilter === item"><text>{{ item }}</text></view>
	   	                        <view v-else><text>{{ item }}</text></view>
	   	                    </transition>
							
	   	                </view>
	   	            </view>
	   	        </view>
	   	        <!-- 内容部分 -->		
	   	        <view class="main" v-for="item in post" :key="item.discussPostId" @tap="gotoPostContent(item.discussPostId,item.userAvatar,item.userName)" >
	   	  		    <view class="userinfo">
	   	  		    	<image class="avatar" :src="item.userAvatar || '../../static/avatar0.png'" mode="aspectFill"></image>
	   	  		    	<view class="userName-title">
	   	  		    		<view class="userName"><text>{{item.userName}}</text></view>
	   	  		    		<text class="title">{{item.title}}</text>
	   	  		    	</view>
	   	  		    </view>
	   	  		    <view class="content" >
	   	  		    	<text v-if="isTextExpanded(item.discussPostId) || item.content.length <= 100" >{{ item.content }}</text>
	   	  		    	<text v-else>{{ truncatedText(item.content) }}...</text>
	   	  		    	<view v-if="item.content.length>100" class="toggle-btn" @tap.stop="toggleText(item.discussPostId)">
	   	  		    	    <text>{{ isTextExpanded(item.discussPostId) ? '收起' : '展开' }}</text>
	   	  		        </view>
	   	  		    </view>
	   	  		    <!-- 显示图片 -->
	   	  		    <view class="images" v-if="item.image" >
	   	  		    	<image :src="item.image" mode="widthFix" class="image-item" @tap.stop="previewImage(item.image)"></image>
	   	  		    </view>
	   	  		    <!-- 底部信息 -->
	   	            <view class="bottom">
	   	                <view class="topicBox">
							<text class="topic">#{{item.tag}}</text>
						</view>
	   	                <view class="actions">
	   	  		    	    <view class="star">
	   	  		    	    	<uni-icons v-if="!item.isFavorite" type="star" size="50rpx" @tap.stop="clickStar(item)">
	   	  		    	    		<text style="font-size: 26rpx;">{{item.favoriteCount}}</text>
	   	  		    	    	</uni-icons>
								<uni-icons v-else type="star-filled" size="50rpx" color="#fdc550" @tap.stop="clickStar(item)">
									<text style="font-size: 26rpx;">{{item.favoriteCount}}</text>
								</uni-icons>
	   	  		    	    </view>
	   	                    <view class="chat">
	   	                        <uni-icons type="chat" size="50rpx"  @tap="gotoPostContent(item.discussPostId,item.userAvatar,item.userName)">
	   	  		    	    		<text style="font-size: 26rpx;">{{item.commentCount}}</text>
	   	  		    	    	</uni-icons>
	   	                    </view>
	   	  		    	    <view class="heart">
	   	  		    	    	<uni-icons v-if="!item.isLike" type="heart" size="48rpx" @tap.stop="clickHeart(item)">
	   	  		    	    		<text style="font-size: 25rpx;">{{item.likeCount}}</text>
	   	  		    	    	</uni-icons>
								<uni-icons v-else type="heart-filled" color="#ff5050" size="48rpx" @tap.stop="clickHeart(item)">
									<text style="font-size: 25rpx;">{{item.likeCount}}</text>
								</uni-icons>
	   	  		    	    </view>
	   	                </view>
	   	            </view>
	   	  		    <!-- 评论区域 -->
	   	  		    <view class="comments" v-if="item.comments.length>0" @tap="gotoPostContent(item.discussPostId,item.userAvatar,item.userName)">
	   	  		        <view v-for="(comment, index) in item.comments" :key="index">
	   	  		            <text class="comment-user">{{ comment.userName }}：</text>
	   	  		            <text class="comment-text">{{ comment.content }}</text>
	   	  		        </view>
				    
	   	  		        <!-- 超过 3 条时显示 "共 n 条评论" -->
	   	  		        <view v-if="item.commentCount > 3" class="more-comments">
	   	  		            共 {{ item.commentCount }} 条回复>
	   	  		        </view>
	   	  		    </view>
	   	        </view>
				<view v-if="noData || post.length>0">
					<uni-load-more :status="noData?'noMore':'loading'"></uni-load-more>
				</view>
				<view class="float" @tap="onTop()" :style="{ opacity: showTopButton ? 1 : 0 }">
					<view class="item"><image class="huojian" src="../../static/火箭.png" :class="{ launching: isLaunching }"></image></view>
				</view>
	   	    </scroll-view>
			
	   </view>
   </z-paging>
   <uni-popup ref="popup" type="bottom" border-radius="8rpx 8rpx 0 0" >
   	<view class="popup-content">
   		<textarea class="popup-input" auto-height maxlength="500" focus="true" placeholder="请输入内容" />
   		<button class="popup-button" @tap="submitComment">发送</button>
   	</view>
   </uni-popup>
</template>

<style lang="scss" scoped>
.index {
    background-color: #f5f5f5;
    height: 100%;
	font-size: 28rpx;
   .float{
	   position: fixed;
	   right: 30rpx;
	   bottom: 25rpx;
	    transition: opacity 0.4s ease-in-out;
	   .item{
		    width: 105rpx;
		    height: 105rpx;
		    background-color: #5cc280;
		    opacity: 0.9;
		    border-radius: 50%;
		    display: flex;
		    justify-content: center;
		    align-items: center;
		    color: #fff;
		    font-size: 28rpx;
		    border: 1px solid #eee;
		    box-shadow: 0 5rpx 10rpx rgba(0, 0, 0, 0.2);
		    transition: transform 0.2s ease-in-out;
			.huojian{
				width: 50rpx;
				height: 50rpx;
				 transition: transform 0.6s ease-in-out, opacity 0.6s ease-in-out;
			}
			 /* 火箭升空动画 */
			    .launching {
			      transform: translateY(-700rpx) scale(0.5);
			      opacity: 0;
			    }
	   }
	   &:active .item {
	       transform: scale(0.8);
	     }
   }
}

.header {
    display: flex;
    justify-content: space-around;
    padding: 20rpx 0;
    background-color: #fff;
}

.btn {
	margin-top: 20rpx;
    width: 250rpx;
    height: 100rpx;
    line-height: 100rpx;
    text-align: center;
    border-radius: 20rpx;
	color: #fff;
	box-shadow: 0 4rpx 10rpx rgba(87, 184, 122,0.2);
    font-weight: 600;
    // background: linear-gradient(to top right, #57b87a, #b5f9c8);
	background: linear-gradient(to bottom right, #46e769,20%, #8acfb2);
	transition: transform 0.2s ease-in-out;
	//按住按钮后缩小
	&:active {
	    transform: scale(0.9);
	  }
}

.announce {
    display: flex;
    padding: 20rpx 30rpx;
	
}

.left {
    width: 15%;
    height: 100rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(to top right, #d52c29, #ff7637);
    border-radius: 15rpx 0 0 15rpx;
    border: 2px solid #f48480;
    border-right: none;
}

.right {
    width: 85%;
    height: 100rpx;
    line-height: 100rpx;
    border: 2px solid #f48480;
    border-left: none;
    border-radius: 0 15rpx 15rpx 0;
    swiper {
        height: 100%;
        swiper-item {
            padding-left: 10rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
			.announceText{
				font-size: 28rpx;
				color: red;
			}
        }
    }
}

.category {
    display: flex;
    justify-content: space-around;
    padding: 15rpx 0;
}

.filter-item {
    padding: 15rpx 15rpx;
    font-size: 28rpx;
    height: 28rpx;
    line-height: 28rpx;
	transition: all 0.3s ease-in-out;
}

.filter-item.active {
    color: #fff;
    background-color: #5cc280;
    border-radius: 10rpx;
	 transform: translateY(-7rpx); /* 选中的项上移 */
	 box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}
/* 滑动+渐变 过渡动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.4s ease-in-out;
}


/* 让"校园十大"区域固定 */
.top {
    position: relative;
    background-color: #fff;  /* 确保背景颜色 */
    z-index: 1;
    transition: top 0.3s ease; /* 添加平滑过渡 */
}

.top.fixed {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 999;  /* 确保它位于其他内容之上 */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.main {
    padding: 20rpx;
	border-radius: 20rpx;
	margin: 18rpx;
	background-color: #fff;
	box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}
.userinfo{
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}
.avatar{
	width: 100rpx;
	height: 100rpx;
	margin-right: 10rpx;
	border-radius: 50%;
	background-color: #e1f8d9;
	object-fit: cover; /* 保持图片比例 */
	flex-shrink: 0; /* 防止头像被压缩 */
}
.userName-title{
	display: flex;
	flex-direction: column;
	.userName{
		font-size: 27rpx;
		color: #000;
		padding-bottom: 8rpx;
	}
	.title{
		font-size: 28rpx;
		font-weight: 600;
	}
}
.content{
    padding: 10rpx 0;
	font-size: 30rpx;
	.toggle-btn {
	  color: #59ac80;
	  cursor: pointer;
	  font-size: 28rpx;
	  margin-top: 10rpx;
	}
}
.images{
	display: flex;
	flex-wrap: wrap;
	margin-top: 10rpx;
	image{
		width: 50%;
		height: 200rpx;
		margin-right: 1%;
		margin-bottom: 1%;
		border-radius: 10rpx;
	}
}
.bottom{
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 20rpx;
	.topicBox{
		background-color: #00ff7f;
		border-radius: 20rpx;
		padding: 5rpx 15rpx;
		opacity: 0.8;
		.topic{
			font-size: 28rpx;
		}
	}
}
.actions{
	display: flex;
	.star,.chat{
		margin-right: 50rpx;
	}
	.heart{
		margin-right: 15rpx;
	}
}

.comments {
	margin-top: 10rpx;
    background: #f7f7f7;
    padding: 20rpx 10rpx;
    border-radius: 10rpx;
}

.comment-user {
    color: #333;
	font-size: 28rpx;
}
.comment-text{
	font-size: 28rpx;
}
.more-comments {
    color: #6c6c6c;
    margin-top: 5rpx;
	font-size: 28rpx;
}

.popup-content {
    display: flex;
	justify-content: space-between;
    align-items: center;
    padding: 30rpx 20rpx;
	background-color: #fff;
}

.popup-input {
    flex: 1;
    padding: 15rpx;
    border: 1px solid #ccc;
    border-radius: 10rpx;
}

.popup-button {
    margin-left: 10rpx;
	font-size: 30rpx;
	color: #52ad72;
	background-color: #fff;
}
</style>
