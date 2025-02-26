<script setup>
    import {baseUrl} from '../../utils/request.js'
	import {deleteFile} from '../../api/file.js'
	import {apiPost} from '../../api/post.js'
    onShow(() => {
        uni.hideTabBar()
    })
	const popup = ref()
    const gotoHome = () => {
		//提示是否保留此次编辑
		popup.value.open()
    }
	const save = () =>{
		popup.value.close()
		uni.showTabBar()
		uni.switchTab({
		    url: '/pages/index/index'
		})
	}
    const cancel = () =>{
		popup.value.close()
		uni.showTabBar()
		uni.reLaunch({
		    url: '/pages/index/index'
		})
	}
    const formData = ref({
        title: '',
        content: ''
    })

    const rules = ref({
        title: {
            rules: [
                {
                    required: true,
                    errorMessage: ' 请输入标题',
					trigger: 'blur'
                },
                {
                    minLength: 5,
                    maxLength: 31,
                    errorMessage: '标题长度在5-31个字之间'
                }
            ]
        },
        content: {
            rules: [
                {
                    required: true,
                    errorMessage: '正文不能为空'
                },
				{
					maxLength:2000,
					errorMessage: '正文不能超过2000个字'
				}
            ]
        }
    })
	const arrPicture = ref([])
	//添加图片
    const addPicture = async (e) => {
		console.log(e);
		await uni.uploadFile({
			url: baseUrl + '/api/v1/community/post/image',
			method: 'post',
			header: {
				"Content-Type": "application/json" , 
			},
			filePath: e.tempFilePaths[0],
			name: 'image',
			formData: {
				userId: uni.getStorageSync('userId')
			},
			success: (res) => {
				console.log(JSON.parse(res.data));
			    let newarr = JSON.parse(res.data).data
				newarr.uuid = e.tempFiles[0].uuid;
				console.log(newarr);				
				arrPicture.value.push(newarr)
				console.log(arrPicture.value);
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
	//删除选择的图片
	const delPicture = async (e) =>{
		console.log(e);
		//根据uuid在arrPicture中找到对应的图片
		let index = arrPicture.value.findIndex(item => item.uuid === e.tempFile.uuid)
		console.log(arrPicture.value[index].imageUrl);
		const deleteRes = await deleteFile(arrPicture.value[index].imageUrl)
		console.log(deleteRes);
		//删除arrPicture中的图片
		arrPicture.value.splice(index, 1)
		console.log(arrPicture.value);
	}
	const topicArr = ['拼车','休闲','学习','运动','游戏','干饭','旅行','其他']
	const schoolArr = ['东莞理工学院','西校区','北校区','南校区']
	const schoolCodeArr = ['11819','11820','11821','11823']
	const index = ref(0)
	const schoolIndex = ref(0)
	const topic = ref(topicArr[0]);
	const school = ref(schoolArr[0]);
	const schoolCode=ref(schoolCodeArr[0])
	const pickTopic = (e) => {
		topic.value = topicArr[e.detail.value]
	}
	const pickSchool = (e) => {
		school.value = schoolArr[e.detail.value]
		schoolCode.value = schoolCodeArr[e.detail.value]
		console.log(schoolCode.value);
	}
    const valiForm = ref(null)
    const publish = async () => {
        console.log(formData.value);
        // 确保 valiForm 已经正确绑定
        if (valiForm.value) {
            valiForm.value.validate().then( async () => {
				//只保留arrPicture中的imageId
				arrPicture.value = arrPicture.value.map(item => item.imageId)
				console.log(arrPicture.value);
				const res=await apiPost({
						userId:uni.getStorageSync('userId'),
						title:formData.value.title,
						content:formData.value.content,
						tag:topic.value,
						schoolCode:schoolCode.value,
						images:arrPicture.value
					})
					console.log(res);
					formData.value.title = ''
					formData.value.content = ''
					index.value = 0
					schoolIndex.value = 0
					arrPicture.value = []
					uni.showToast({
							title: '发布成功',
							icon: 'success'
					})
					setTimeout(() => {
						uni.showTabBar()
						uni.switchTab({
							url: '/pages/index/index'
						})
					}, 300)

            }).catch((err) => {
                console.log("输入不合法:", err)
            });
        }
    }

</script>

<template>
    <view class="publishPost">
        <view><uni-icons type="closeempty" size="50rpx" @tap="gotoHome()"></uni-icons></view>
        <view style="font-weight: 700;margin-left: 50rpx;font-size: 36rpx;">贴子</view>
        <view><button class="btn" size="mini" @tap="publish()">发布</button></view>
    </view>
    <view>
        <uni-forms ref="valiForm" :rules="rules" :modelValue="formData" :border="true">
			<view>
				<uni-forms-item name="title">
				    <uni-easyinput
				        type="text"
				        confirm-type="done"
				        :input-border="false"
				        v-model="formData.title"
				        placeholder="请输入完整帖子标题(5-31个字)"
				    />
				</uni-forms-item>
			</view>
            <view class="main">
                <uni-forms-item name="content">
                    <uni-easyinput
                        type="textarea"
                        :auto-height="true"
                        :input-border="false"
                        v-model="formData.content"
                        placeholder="请输入正文"
						maxlength="2000"
                    />
                </uni-forms-item>
				<uni-forms-item name="avatar"  labelWidth="90">
					<uni-file-picker :value="arrPicture" limit="9" :maxSize="10" file-mediatype="image" :auto-upload="false" @select="addPicture" @delete="delPicture"></uni-file-picker>
				</uni-forms-item>
            </view>
        </uni-forms>
		<view class="topic">
			<text>#添加话题</text>
			<view class="pick">
				<picker @change="pickTopic" :value="index" :range="topicArr">
					<view style="color:orangered;">
					{{topic}}
					<uni-icons type="arrowright" size="24" style="vertical-align: middle;"></uni-icons>
					</view>
				</picker>
			</view>
		</view>
		<view class="school">
			<text>校区</text>
			<view class="pick">
				<picker @change="pickSchool" :value="schoolIndex" :range="schoolArr">
					<view style="color:orangered;">
					{{school}}
					<uni-icons type="arrowright" size="24" style="vertical-align: middle;"></uni-icons>
					</view>
				</picker>
			</view>
		</view>
    </view>
	<uni-popup ref="popup" type="center">
		<view class="pop-box">
			<view class="pop-content">是否保留此次编辑？</view>
			<view class="pop-btns">
				<button class="pop-btn1" @tap="cancel()">不保留</button>
				<button class="pop-btn2" @tap="save()">保留</button>
			</view>
		</view>
	</uni-popup>
</template>

<style lang="scss" scoped>
	
	:deep(.file-picker__box) {
           background-color: #e6e6e6;		
		}
	:deep(.file-picker__box-content){
	   margin: 0;
	   margin-right: 5rpx;
	}
    :deep(.icon-add) {
		background-color: #a4a4a6;
	}
    .publishPost {
        display: flex;
        justify-content: space-between;
        padding: 0 30rpx;
        align-items: center;
        margin-top: 15rpx;
        margin-bottom: 30rpx;
    }

    .main {
        padding: 0 20rpx;
    }

    .btn {
        width: 140rpx;
        height: 60rpx;
        background-color: #89abf4;
        color: #fff;
        font-weight: 700;
        font-size: 26rpx;
        border-radius: 30rpx;
        display: flex;
        align-items: center;
        justify-content: center;
    }
	.topic{
		padding: 30rpx 20rpx;
		padding-bottom: 10rpx;
		font-weight: 600;
		display: flex;
		justify-content: space-between;
	}
	.pick{
		flex: 1;
		text-align: right;
	}
	.school{
		padding: 30rpx 20rpx;
		padding-bottom: 10rpx;
		font-weight: 600;
		display: flex;
		justify-content: space-between;
	}
	.pop-box{
		background-color: #fff;
		width: 600rpx;
		height: 300rpx;
		border-radius: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		.pop-content{
			width: 100%;
			height: 190rpx;
			text-align: center;
			line-height: 190rpx;
			font-size: 34rpx;
			border-bottom: 1px solid #eee;
		}
		.pop-btns{
			width: 100%;
			height: 110rpx;
			display: flex;
			justify-content: space-around;
			align-items: center;
			font-weight: 600;
			.pop-btn1{
				width: 50%;
				height: 100%;
				line-height: 110rpx;
				font-size: 32rpx;
			}
			.pop-btn2{
				width: 50%;
				height: 100%;
				color: purple;
				line-height: 110rpx;
				font-size: 32rpx;
			}
		}
	}
	:deep(uni-button:after) {
		border-radius: 0;
	}
	:deep(uni-button) {
		border-radius: 0;
	}
</style>
