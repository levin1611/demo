<template>
    <div class="login">
        <div class="login-container">
            <div class="login-top">
                <login-header></login-header>
            </div>
            <!-- 登录注册表单 -->
            <div class="login-body" v-if="!showDetail">
                <!-- 左侧轮播图 -->
                <div class="carousel-box">
                    <div class="swiper-container" @mouseenter="enterSwiper" @mouseleave="leaveSwiper">
                        <div class="swiper-wrapper">
                            <div class="swiper-slide" v-for="(item,index) in swiper_img" :key="index">
                                <img :src="item.img" alt="" draggable="false">
                            </div>
                        </div>
                    </div>
                </div>
                <register-new-account v-show="isNewAccount" :account-info="accountInfo" :past-due="pastDue" @show-detail="handleShowDetail"></register-new-account>
                <register-existing-account v-show="!isNewAccount" :account-info="accountInfo" :past-due="pastDue" @show-detail="handleShowDetail"></register-existing-account>
            </div>
            <!-- 通行证详情弹框 -->
            <account-detail :lark-id="larkIdForDetail" v-else></account-detail>
            <!-- 底部 -->
            <div class="login-bottom">
                <login-footer></login-footer>
            </div>
            <el-dialog
                width="500"
                height="240"
                class="edit-dialog custom-class-add89"
                append-to-body
                :show-close="false"
                v-model="pastDueVisible">
                <div class="pastDue-body">
                    <p class="pastDue-icon"><span class="custom custom-fasongshibai"></span></p>
                    <p>链接已失效，请联系管理员重新发送链接</p>
                </div>
                <template #footer>
                    <div class="footer-box">
                        <el-button type="primary" @click="pastDueVisible = false">知道了</el-button>
                    </div>
                </template>
            </el-dialog>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { useBrowserLocation } from '@vueuse/core';
import Swiper from 'swiper';
import accountDetail from './component/accountDetail.vue';
import '../../../node_modules/swiper/css/swiper.min.css';
import { t } from '@/locale';
import { accountByMD5Str } from '@/api/common';
import { getHashParams } from '@/utils/dataProcess';
import registerNewAccount from './component/registerNewAccount.vue';
import registerExistingAccount from './component/registerExistingAccount.vue';
import loginHeader from './component/login-header.vue';
import loginFooter from './component/login-footer.vue';
import gatePassList from './component/gatePassList.vue';

import { userpass, signRsa } from '@/utils/safe';

import { useUserStore } from '@/pinia/modules/user';
const store = useUserStore();
const accountInfo = ref({});
// const accountDetailData = ref({}); // 存储详情页数据
// 是否已有通行证，如果是已有通行证则进行通行证激活流程
const isNewAccount = ref(true);

const pastDue = ref(false); // 是否过期
const pastDueVisible = ref(false); // 是否过期弹框显示与隐藏
console.log(signRsa.encrypted('aaa'));

const MD5Value = getHashParams(useBrowserLocation().value.hash); // 存储MD5值

onMounted(() => {
    // 通过邮件链接中MD5值获取账号信息，用来赋值给电话邮件输入框
    accountByMD5Str({
        value: MD5Value
    }).then((res) => {
        if (res.code === 10000) {
            pastDue.value = false;
            accountInfo.value = res.data;
            isNewAccount.value = (res.data && res.data.larkId) ? false : true;
        } else if (res.code === 10118) {
            pastDue.value = true;
            pastDueVisible.value = true;
        } else {
            console.log(res.message);
        }
    });
});
// 轮播图
const swiper_img = [
    {
        img: require('@/assets/images/swiper3.png'),
        href: 'javascript:;'
    }
];
const swiperLogin = new Swiper('.swiper-container', {
    // 分页器
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    // 自动轮播
    autoplay: true,
    // 播放速度
    speed: 1000,
    // 允许触摸滑动
    allowTouchMove: false,
    // 连续播放 在第三张播放到第一张时,点击第二个分页器,会向左跳转,感觉像是有4张图片
    // loop: true,
    // 轮播图点击事件
    on: {
        click: function() {
            console.log('你点了Swiper');
        }
    }
});

// 显示详情页
const showDetail = ref(false);
// 显示详情页
const larkIdForDetail = ref('');

// 显示详情页
const handleShowDetail = (larkId) => {
    showDetail.value = true;
    // accountDetailData.value = passInfo;
    larkIdForDetail.value = larkId;
    console.log(3333, larkId);
};
const enterSwiper = () => {};
const leaveSwiper = () => {};
console.log(222);
</script>
<style lang="scss" scoped>
@import './login-page.scss';
@import './form-login.scss';
.float-right{
    float: right;
}
.margin-bottom-10 {
    margin-bottom: 10px;
}
.forgetPwd{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 34px;
    .rememberText {
        margin-left: 5px;
    }
}
.phone-input {
    height: 42px;
    margin-bottom: 7px;
}
.pastDue-body {
    color: #EA4335;
    text-align: center;
    p{
        padding: 0;
        margin: 0;
        font-size: 18px;
        font-weight: 500;
    }
    .pastDue-icon {
        span {
            font-size: 32px;
            margin-bottom: 24px;
        }
    }
}
</style>
<style lang="scss">
.custom-class-add89 {
   .#{$elnamespace}-dialog__header{
        position: relative;
        height: unset;
        width: unset;
   }
}
</style>