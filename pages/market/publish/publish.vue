<script setup>
import {baseUrl} from '../../../utils/request.js'
import {deleteFile} from '../../../api/file.js'
import {addMarketPost} from '../../../api/market.js'
const gotoHome = () => {
    uni.reLaunch({
        url: '/pages/market/market'
    })
}

const value = ref(0)
const types = ref([
    {
        "text": "出售",
        "value": 0
    },
    {
        "text": "求购",
        "value": 1
    },
    {
        "text": "赠送",
        "value": 2
    }
])
const change = (e) => {
    console.log(e)
}
const formData = ref({
    content: '',
	price:'',
	type:'',
	phone:''
})
const rules = ref({
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
    },
	phone: {
	    rules: [
	        {
	            required: true,
	            errorMessage: ' 请输入手机号码',
				trigger: 'blur'
	        },
	        {
	            pattern :/^[1]([3-9])[0-9]{9}$/,
	            errorMessage: '请检查是否为中国大陆手机号',
				trigger: 'blur'
	        }
	    ]
	},
	price: {
	    rules: [
	        {
	            required: true,
	            errorMessage: ' 请输入价格',
				trigger: 'blur'
	        },
	        {
	            pattern :/^[0-9]+(.[0-9]{1,2})?$/,
	            errorMessage: '请检查是否为数字',
				trigger: 'blur'
	        }
	    ]
	}
})
const valiForm = ref(null)
const arrPicture = ref([])
//添加图片
    const addPicture = async (e) => {
		console.log(e);
		//加载中
		uni.showLoading({
				title: '上传中',
				mask: true
			})
		await uni.uploadFile({
			url: baseUrl + '/api/v1/bazaar/post/image',
			method: 'post',
			header: {
				"Content-Type": "multipart/form-data" , 
			},
			filePath: e.tempFilePaths[0],
			name: 'postImage',
			formData: {
				userId: uni.getStorageSync('userId')
			},
			success: (res) => {
				console.log(res.data);
				if(JSON.parse(res.data).code===50001){
					uni.showToast({
						title: '上传失败',
						icon: 'error'
					})
					return
				}
			    let newarr = JSON.parse(res.data).data
				newarr.uuid = e.tempFiles[0].uuid;
				console.log(newarr);				
				arrPicture.value.push(newarr)
				console.log(arrPicture.value);
				uni.hideLoading()
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
const publish = () =>{
	console.log(formData.value);
	valiForm.value.validate().then( async () => {
		//只保留arrPicture中的imageId
		arrPicture.value = arrPicture.value.map(item => item.imageId)
		console.log(arrPicture.value);
		const res = await addMarketPost({
			userId: uni.getStorageSync('userId'),
			content: formData.value.content,
			type: value.value,
			price: formData.value.price,
			images: arrPicture.value,
			contact: formData.value.phone,
			schoolCode:uni.getStorageSync('schoolCode'),
			title:'1',
			tags:[]
		})
		console.log(res);
		formData.value.content = ''
		formData.value.price = ''
		formData.value.phone = ''
		value.value = 0
		arrPicture.value = []
		uni.showToast({
		    title: '发布成功',
		    icon: 'success'
		})
		setTimeout(() => {
			uni.reLaunch({
			    url: '/pages/market/market'
			})
		}, 300)
		
	}).catch((errors) => {
	    console.log('验证失败', errors);
	})
}

</script>

<template>
	<view class="index">
		<view class="header">
		    <view><uni-icons type="closeempty" size="50rpx" @tap="gotoHome()"></uni-icons></view>
		    <view><button class="btn" size="mini" @tap="publish()">发布</button></view>
		</view>
		<view class="types">
			<uni-data-checkbox selectedColor="#4da36b" v-model="value" :localdata="types" @change="change"></uni-data-checkbox>
		</view>
		<uni-forms ref="valiForm" :rules="rules" :modelValue="formData" :border="true">
		    <view class="main">
		        <uni-forms-item name="content">
		            <uni-easyinput
		                type="textarea"
		                :auto-height="true"
		                :input-border="false"
		                v-model="formData.content"
		                placeholder="请描述您的商品"
						maxlength="1000"
		            />
		        </uni-forms-item>
			    <uni-forms-item name="avatar"  labelWidth="90">
			    	<uni-file-picker :value="arrPicture" :maxSize="10" limit="9" file-mediatype="image" :auto-upload="false" @select="addPicture" @delete="delPicture"></uni-file-picker>
			    </uni-forms-item>
				<uni-forms-item name="price">
					<view class="bottom">
						<text>价格</text>
						<view style="display: flex;">
							<input placeholder="￥0.00" v-model="formData.price" class="price" />
							<view class="arrow">></view>
						</view>
					</view>
				</uni-forms-item>
				<uni-forms-item name="phone">
					<view class="bottom">
						<text>联系方式</text>
						<view style="display: flex;">
							<input placeholder="请输入手机号码" v-model="formData.phone" class="phone" />
							<view class="arrow">></view>
						</view>
					</view>
				</uni-forms-item>
			</view>
		</uni-forms>
	</view>

</template>

<style lang="scss" scoped>
	:deep(.checklist-text span){
		font-size: 34rpx;
	}
	:deep(.uni-data-checklist .checklist-group .checklist-box .radio__inner){
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
	}
	:deep(.uni-data-checklist .checklist-group .checklist-box .radio__inner .radio__inner-icon){
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
	}
	:deep(.uni-easyinput__content){
		min-height: 380rpx;
		padding: 20rpx;
		border-radius: 15rpx;
		box-shadow: 0 0 10rpx rgba(0,0,0,0.1)
	}
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
.index {
	background-color: #f5f5f5;
	height: 130vh;
}
.header {
    display: flex;
    justify-content: space-between;
    padding: 0 30rpx;
    align-items: center;
    padding-top: 15rpx;
    margin-bottom: 15rpx;
}

.btn {
    width: 140rpx;
    height: 65rpx;
    background-color: #fce512;
    color: #000;
    font-weight: 700;
    font-size: 26rpx;
    border-radius: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}
.types{
	display: flex;
	justify-content: space-around;
	margin-bottom: 10rpx;
}
.main {
	padding: 0 20rpx;
}
.bottom{
	display: flex;
	justify-content: space-between;
	align-items: center;
	background-color: #fff;
	padding: 20rpx;
	border-radius: 15rpx 15rpx 0 0;
	box-shadow: 0 0 10rpx rgba(0,0,0,0.05);
	margin-bottom: 20rpx;
	text {
		font-weight: 700;
	}
	.price{
		font-size: 30rpx;
		color: #ff0000;
		text-align: right;
		padding-right: 10rpx;
	}
	.phone {
		font-size: 30rpx;
		text-align: right;
		padding-right: 10rpx;
	}
}

</style>
