<script setup>
import { ref } from 'vue';
import {apiAnalyze,apiResult} from '@/api/ai.js';
import { marked } from 'marked';

// 分析结果
const githubAnalysisResult = ref('')
const zipAnalysisResult = ref('')
const resultFiles = ref('');
const activeTab = ref('github'); // 当前激活的标签：'github' 或 'zip'
const githubUsername = ref('');
const githubRepo = ref('');
const githubBranch = ref('');
const workFlowId = ref('');
const isAnalyzing = ref(false);
const zipUrl = ref('');
const isTabDisabled = ref(false);
const startAnalyze = async () => {
    isAnalyzing.value = true;
    isTabDisabled.value = true;
    if (activeTab.value === 'github') {
        if(!githubUsername.value){
            uni.showToast({
                title: 'GitHub用户名不能为空',
                icon: 'none'
            });
            isAnalyzing.value = false;
            isTabDisabled.value = false;
            return;
        }
        if(!githubRepo.value){
            uni.showToast({
                title: 'GitHub仓库名不能为空',
                icon: 'none'
            });
            isAnalyzing.value = false;
            isTabDisabled.value = false;
            return;
        }
        const res = await apiAnalyze({
            userId: uni.getStorageSync('userId'),
            username: githubUsername.value,
            repoName: githubRepo.value,
            branch: githubBranch.value,
        });
		console.log(res);
		if(res.code!==200) {
		    isAnalyzing.value = false;
		    isTabDisabled.value = false;
		    return;
		}
		workFlowId.value = res.data;
    } else {
        if (!zipUrl.value) {
            uni.showToast({
                title: '请输入项目zip文件URL',
                icon: 'none'
            });
            isAnalyzing.value = false;
            isTabDisabled.value = false;
            return;
        }
        const res = await apiAnalyze({
            userId: uni.getStorageSync('userId'),
            fileUrl: zipUrl.value
        });
		console.log(res);
		if(res.code!==200) {
		    isAnalyzing.value = false;
		    isTabDisabled.value = false;
		    return;
		}
		workFlowId.value = res.data;
    }
    startPolling();
};

const startPolling = () => {
    const timer = setInterval(async () => {
        try {
            const res = await apiResult(workFlowId.value);
            console.log(res);
            
            if (res.data.status === 'running') {
                
            } else if (res.data.status === 'succeeded') {
                clearInterval(timer);
                isAnalyzing.value = false;
                isTabDisabled.value = false;
                if (activeTab.value === 'github') {
                    githubAnalysisResult.value = res.data.result.text;
                    githubAnalysisResult.value = marked(githubAnalysisResult.value);
                } else {
                    zipAnalysisResult.value = res.data.result.text;
                    zipAnalysisResult.value = marked(zipAnalysisResult.value);
                }
                resultFiles.value = res.data.result.files;
                uni.showToast({
                    title: '分析完成',
                    icon: 'success'
                });
            } else {
                clearInterval(timer);
                isAnalyzing.value = false;
                isTabDisabled.value = false;
                uni.showToast({
                    title: res.data.status === 'failed' ? '分析失败' : res.data.status === 'stopped' ? '分析已停止' : '未知错误',
                    icon: res.data.status === 'failed' ? 'error' : 'none'
                });
            }
        } catch (error) {
            console.log(error);
            clearInterval(timer);
            isAnalyzing.value = false;
            isTabDisabled.value = false;
            uni.showToast({
                title: '获取进度失败',
                icon: 'none'
            });
        }
    }, 2000);
};
const downLoad = () =>{
	uni.showLoading({
			title:'加载中'
		})
		console.log(resultFiles.value);
	uni.downloadFile({
		url:resultFiles.value,
		success: (res) => {
			const filePath = res.tempFilePath
			uni.openDocument({
				filePath: filePath,
				showMenu: true,
				success: async (res) => {
					console.log('打开文档成功');
				},
				fail: (err) => {
					uni.showToast({
						icon:'none',
						title:"打开文档失败"
					})
				}
			});
			uni.hideLoading()
		},
		fail: (err) => {
			uni.showToast({
				icon:'none',
				title:"加载文档失败"
			})
		}
	})
}
const spikLink = (url) =>{
	uni.navigateTo({
		url: '/pages/webView/webView?url=' + url
	})
}
</script>

<template>
    <view class="ai-container">
        <!-- 功能提示 -->
        <view class="tip-text">
            文件分析生成readme.md文件，填写GitHub用户名和仓库名（分支不填则默认主分支）或填写项目zip压缩包下载url。无法解析doc等二进制文件
        </view>
        
        <!-- 切换按钮 -->
        <view class="tab-group">
            <view 
                class="tab-item" 
                :class="{ active: activeTab === 'github', disabled: isTabDisabled && activeTab !== 'github' }" 
                @click="!isTabDisabled && activeTab !== 'github' && (activeTab = 'github')"
            >
                Github
            </view>
            <view 
                class="tab-item" 
                :class="{ active: activeTab === 'zip', disabled: isTabDisabled && activeTab !== 'zip' }" 
                @click="!isTabDisabled && activeTab !== 'zip' && (activeTab = 'zip')"
            >
                项目zip
            </view>
        </view>
        
        <!-- Github输入框组 -->
        <view v-if="activeTab === 'github'" class="input-group">
            <uni-easyinput
                v-model="githubUsername"
                placeholder="请输入GitHub用户名"
                clearable
            />
            <uni-easyinput
                v-model="githubRepo"
                placeholder="请输入GitHub仓库名"
                clearable
            />
            <uni-easyinput
                v-model="githubBranch"
                placeholder="请输入仓库分支（选填）"
                clearable
            />
        </view>

        <!-- Zip输入框组 -->
        <view v-if="activeTab === 'zip'" class="input-group">
            <uni-easyinput
                v-model="zipUrl"
                placeholder="请输入项目zip文件URL"
                clearable
            />
            <view class="tip-link">
                获取项目zip文件URL可前往：<text user-select="true" class="link" @tap="spikLink(`https://f.8tool.club/`)" >https://f.8tool.club/</text>
            </view>
        </view>

        <!-- 开始生成按钮 -->
        <button 
            v-if="!isAnalyzing" 
            class="generate-btn" 
            @click="startAnalyze"
        >
            开始生成
        </button>

        <!-- 进度条 -->
        <view v-if="isAnalyzing" class="progress-container">
            <progress 
                :percent="50" 
                active 
                stroke-width="8" 
                activeColor="linear-gradient(90deg, #46e769 0%, #8acfb2 50%, #46e769 100%)" 
                backgroundColor="#EBEBEB"
                class="shining-progress"
            />
            <view class="loading-tip">正在加载中，大概耗时20秒，请不要离开页面</view>
        </view>

        <!-- 分析结果展示区域 -->
        <view v-if="(activeTab === 'github' && githubAnalysisResult) || (activeTab === 'zip' && zipAnalysisResult)" class="result-container">
            <mp-html :content="activeTab === 'github' ? githubAnalysisResult : zipAnalysisResult" :selectable="true" />
            <button 
                v-if="resultFiles" 
                class="view-files-btn" 
                @tap="downLoad()"
            >
                查看完整分析结果(有效期5min)
            </button>
        </view>
    </view>
</template>

<style lang="scss" scoped>
.ai-container {
    padding: 40rpx;
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    box-sizing: border-box;
    
    .tip-text {
        font-size: 28rpx;
        color: #4a5568;
        line-height: 1.6;
        margin-bottom: 40rpx;
        padding: 20rpx;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 12rpx;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
        backdrop-filter: blur(10px);
    }
    
    .tab-group {
        display: flex;
        gap: 20rpx;
        margin-bottom: 40rpx;
        padding: 8rpx;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 16rpx;
        box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
        
        .tab-item {
            flex: 1;
            padding: 20rpx 30rpx;
            border-radius: 12rpx;
            background-color: rgba(245, 245, 245, 0.8);
            color: #666;
            font-size: 28rpx;
            text-align: center;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            
            &.active {
                background: linear-gradient(120deg, #46e769, #8acfb2);
                color: #fff;
                box-shadow: 0 4rpx 12rpx rgba(70, 231, 105, 0.3);
                transform: translateY(-2rpx);
            }
            
            &.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        }
    }
    
    .input-group {
        display: flex;
        flex-direction: column;
        gap: 24rpx;
        margin-bottom: 40rpx;
        padding: 30rpx;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 16rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(10px);

        :deep(.uni-easyinput__content) {
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 12rpx;
            border: 2rpx solid rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;

            &:focus-within {
                border-color: #46e769;
                box-shadow: 0 0 0 2rpx rgba(70, 231, 105, 0.2);
            }
        }
    }

    .generate-btn {
        width: 100%;
        height: 88rpx;
        line-height: 88rpx;
        text-align: center;
        background: linear-gradient(120deg, #46e769, #8acfb2);
        color: #fff;
        border-radius: 44rpx;
        font-size: 32rpx;
        font-weight: 600;
        border: none;
        margin-top: 40rpx;
        box-shadow: 0 6rpx 20rpx rgba(70, 231, 105, 0.3);
        transition: all 0.3s ease;

        &:active {
            opacity: 0.8;
        }
    }

    .progress-container {
        margin-top: 40rpx;
        padding: 30rpx;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 16rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(10px);

        .shining-progress {
            position: relative;
            overflow: hidden;
            margin-bottom: 20rpx;
            
            &::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.5), transparent);
                animation: shine 1s ease-in-out infinite;
            }
        }

        .loading-tip {
            text-align: center;
            font-size: 26rpx;
            color: #666;
            margin-top: 16rpx;
        }

        @keyframes shine {
            to {
                left: 100%;
            }
        }
    }

    .result-container {
        margin-top: 40rpx;
        padding: 40rpx;
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 16rpx;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(10px);

        :deep(p) {
            line-height: 1.8;
            color: #2d3748;
            margin-bottom: 16rpx;
        }

        :deep(pre) {
            background-color: #f7fafc;
            padding: 20rpx;
            border-radius: 8rpx;
            margin: 16rpx 0;
            overflow-x: auto;
        }
        

        .view-files-btn {
            margin-top: 40rpx;
            width: 100%;
            height: 88rpx;
            line-height: 88rpx;
            text-align: center;
            background: linear-gradient(120deg, #46e769, #8acfb2);
            color: #fff;
            border-radius: 44rpx;
            font-size: 32rpx;
            font-weight: 600;
            border: none;
            box-shadow: 0 6rpx 20rpx rgba(70, 231, 105, 0.3);
            transition: all 0.3s ease;

            &:active {
                opacity: 0.8;
            }
        }
    }
}
.tip-link {
    font-size: 26rpx;
    color: #718096;
    margin-top: 16rpx;
    padding: 16rpx;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 8rpx;
    
    .link {
        color: #409eff;
        text-decoration: underline;
    }
}
</style>


