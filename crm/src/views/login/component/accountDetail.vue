<template>
    <div class="account-detail">
        <el-card class="box-card">
            <el-row v-if="passInfo !== '{}'">
                <el-col :span="14">
                    <p class="info-title" style="margin-bottom: 10px">通行证详情</p>
                    <el-row class="account-detail-box-row">
                        <p>通行证 ID：<span>{{passInfo.accountInfoDto.larkId}}</span></p>
                    </el-row>
                    <el-row  class="account-detail-box-row">
                        <template v-if="!isEditName">
                            <el-tooltip
                                effect="dark"
                                :content="userName"
                                :disabled="isShowTooltip"
                                show-after="500"
                                placement="top"
                            >
                                <p @mouseover="onMouseOver('refName')" class="account-detail-box-row-username">用户名：<span ref="refName">{{userName}}</span></p>
                            </el-tooltip>
                            <p class="operate">
                                <el-link @click="editUserName(passInfo.accountInfoDto.username)">编辑</el-link>
                            </p>
                        </template>
                        <template v-else>
                            <span>用户名：</span>
                            <div>
                                <el-input
                                    class="custom-editUserName-input" 
                                    v-model="userName"
                                    type="text"
                                    :maxlength="50"
                                    :placeholder="$t('login.accountNamePlaceholder')"></el-input>
                                <p style="color: #EA4335;font-size: 12px;position: absolute;">{{errorMsgForUserName}}</p>
                            </div>
                            
                            <p class="operate">
                                <el-link @click="saveEditUserName">保存</el-link>
                                <el-link @click="cancelEditUserName(passInfo.accountInfoDto.username)">取消</el-link>
                            </p>
                        </template>
                    </el-row>
                    <el-row  class="account-detail-box-row">
                        <el-tooltip
                            effect="dark"
                            :content="passInfo.accountInfoDto.email"
                            :disabled="isShowTooltip"
                            show-after="500"
                            placement="top"
                        >
                            <p class="account-detail-box-row-username" @mouseover="onMouseOver('refEmail')">邮箱：<span ref="refEmail">{{passInfo.accountInfoDto.email}}</span></p>
                        </el-tooltip>
                        <p class="operate">
                            <el-link  @click="showEditDialog('email')">更换</el-link>
                        </p>
                    </el-row>
                    <el-row  class="account-detail-box-row" >
                        <p>手机号：<span>{{passInfo.accountInfoDto.mobile}}</span></p>
                        <p class="operate">
                            <el-link  @click="showEditDialog('phone')">更换</el-link>
                        </p>
                    </el-row>
                    <el-row  class="account-detail-box-row">
                        <p>密码：<span>*******</span></p>
                        <p class="operate">
                            <el-link  @click="showEditDialog('password')">编辑</el-link>
                        </p>
                    </el-row>
                </el-col>
                <el-col :span="10">
                    <p class="info-title">关联租户</p>
                    <el-scrollbar height="280px">
                        <div @click="jumpToHome(v)" class="relevancy-account" v-for="(v, i) in passInfo.userRelatedOrgDtoList" :key="i">
                            <span class="relevancy-account-title">{{v.orgName}}</span>
                            <p>{{v.orgId}}<span class="custom custom-a-Property1arrow-rightProperty2linear"></span></p> 
                        </div>
                    </el-scrollbar>
                <!-- <el-input></el-input> -->
                </el-col>
            </el-row>
            <el-row style="position: absolute;bottom: 40px; right: 60px;">
                <el-button  class="useBrandColor" @click="logoutBtn">退出登录</el-button>
            </el-row>
        </el-card>
        <!-- 编辑邮箱、手机号、密码 -->
        <EditInfo
            v-model:visible="visible_editInfo"
            :account-detail-data="passInfo"
            :edit-type="editType"
            @refresh="getAccountDetail"
            @logout="logoutBtn"
        ></EditInfo>
    </div>
</template>
<script setup>
import { ref, reactive, watch } from 'vue';
import EditInfo from '../modal/editInfo.vue';
import { passByLarkId, logout, updateUsername } from '@/api/login';
import { accountCheckRepeat } from '@/api/common';
import Cookies from 'js-cookie';
import { loginSuccess } from '@/utils/common';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/pinia/modules/user';
const store = useUserStore();

const router = useRouter();

// 用户名输入框绑定变量
const userName = ref('');
// props 接收
const props = defineProps({
    larkId: {
        type: String
    }
});
// 通行证详细信息
const passInfo = ref({
    accountInfoDto: {
        mobile: '',
        larkId: '',
        username: '',
        email: ''
    },
    userRelatedOrgDtoList: []
});

// 修改信息类型
const editType = ref('');

const refName = ref(null);
const refEmail = ref(null);
const isShowTooltip = ref(true);

const onMouseOver = (type) => {
    let parentWidth = 0;
    let contentWidth = 0;
    if(type === 'refName') {
        parentWidth = refName.value.parentNode.offsetWidth;
        contentWidth = refName.value.offsetWidth;
    } else {
        parentWidth = refEmail.value.parentNode.offsetWidth;
        contentWidth = refEmail.value.offsetWidth;
    }
    // 判断是否开启 tooltip 功能，如果溢出显示省略号，则子元素的宽度势必短于父元素的宽度
    if (contentWidth > parentWidth - 50) {
        isShowTooltip.value = false;
    } else {
        isShowTooltip.value = true;
    }
};

passByLarkId({
    larkId: props.larkId
}).then(res => {
    console.log(res);
    if (res.code === 10000) {
        passInfo.value = res.data;
        userName.value = res.data.accountInfoDto.username;
    } else {
        console.log('查询失败');
    }
});
    

// 编辑【邮箱】【手机号】【密码】弹框
const visible_editInfo = ref(false);
const showEditDialog = (type) => {
    visible_editInfo.value = true;
    editType.value = type;
};


// 编辑姓名
const isEditName = ref(false);

// 点击修改【用户名】按钮
const editUserName = (val) => {
    userName.value = val;
    isEditName.value = true;
    errorMsgForUserName.value = '';
};
// 用户名报错信息
const errorMsgForUserName = ref('');
// 用户名保存按钮
const saveEditUserName = async () => {
    if (!userName.value.trim()) {
        errorMsgForUserName.value = '用户名不能为空';
        return;
    }
    updateUsername({
        larkId: passInfo.value.accountInfoDto.larkId,
        username: userName.value.trim()
    }).then(res => {
        if (res.code === 10000 && res.data) {
            isEditName.value = false;
            getAccountDetail();
            errorMsgForUserName.value = '';
            ElMessage.success('用户名修改成功');
        } else {
            errorMsgForUserName.value = res.messageShow;
        }
    });
};
// 编辑用户名取消按钮
const cancelEditUserName = (val) => {
    userName.value = val;
    isEditName.value = false;
    errorMsgForUserName.value = '';
};

// 更新页面数据
const getAccountDetail = () => {
    console.log('更新页面数据');
    passByLarkId({
        larkId: passInfo.value.accountInfoDto.larkId
    }).then(res => {
        console.log(res);
        if (res.code === 10000) {
            passInfo.value = res.data;
            Cookies.set('accountToken', res.data.accountToken);
        } else {
            console.log('查询失败');
        }
    });
};

const logoutBtn = () => {
    console.log('退出登录');
    logout({
        token: Cookies.get('accessToken')
    }).then(res => {
        console.log(res);
        if (res.code === 10000) {
            console.log(res.data);
            Cookies.remove('accessToken');
            Cookies.remove('accessTokenStepOne');
            Cookies.remove('refreshToken');
            Cookies.remove('token');
            Cookies.remove('userId');
            Cookies.remove('enterpriseId');
            localStorage.removeItem('current_tenant');
            localStorage.removeItem('xhl_account_data');
            // if (!localStorage.getItem('xhl_remember_me')) {
            //     localStorage.removeItem('accountData');
            // }
            store.$patch({
                orgId: '',
                userId: '',
                accessToken: '',
                larkId: ''
            });
            router.replace('login');
        }
    });
};

// 获取租户token，并跳转到首页
const jumpToHome = (item, i) => {
    console.log(item);
    loginSuccess(item, passInfo.value, () => {
        router.push({
            path: '/',
            query: {url: '/systemSettings/company'}
        });
    });
    console.log('跳转到详情页', item.orgId);
};
</script>
<style lang="scss" scoped>
.account-detail {
    .box-card{
        height: 480px;
        width: 970px;
        float: left;
        padding: 30px 40px;
        box-sizing: border-box;
        position: relative;
        border-radius: 12px;
        .#{$elnamespace}-row{
            color: #606266;
            display: flex;
            justify-content: space-between;
            &.account-detail-box-row{
                align-items: center;
                margin-bottom: 0px;
                height: 40px;
            }
            .account-detail-box-row-username {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                width: 360px; 
            }
            
            span{
                color: #303133;
                font-size: 14px;
            }
            .#{$elnamespace}-link {
                color: #{$textlinkColor};
                font-size: 14px;
            }
        }
        .operate {
            width: 120px;
        }
        p{
            margin: 0px;
            padding: 0px;
        }
        .info-title {
            font-size: 20px;
            font-weight: 600;
            line-height: 24px;
            margin-bottom: 24px;
            color: #303133;
        }
        .custom-editUserName-input{
            width: 300px; 
        }
    }
    
    .relevancy-account {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        background: #F5F7FA;
        margin-bottom: 2px;
        padding: 12px 25px;
        height: 58px;
        border-radius: 4px;
        box-sizing: border-box;
        cursor: pointer;
        span.custom-a-Property1arrow-rightProperty2linear {
            color: #A8ABB2;
            font-size: 14px;
            margin-left: 14px;
        }
        span {
            font-size: 14px;
            color: #606266;
        }
        p{
            padding: 0px;
            margin: 0px;
            font-size: 14px;
        }
    }
}
</style>