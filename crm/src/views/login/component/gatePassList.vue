<!-- 注册成功之后的通行证列表，loginPage子组件 -->
<template>
    <div class="pass-list">
        <h3 class="pass-list-title">欢迎！</h3>
        <p  class="pass-list-subtitle">您的账号属于多个公司，请选择要登录的公司</p>
        <el-scrollbar height="300px">
            <ul class="pass-list-box">
                <!-- <template v-for="(v, i) in accountDetailData.userRelatedOrgDtoList" :key="i"> -->
                <template v-for="(v, i) in passList.userRelatedOrgDtoList" :key="i">
                    <li :class="{active: activeCurrent === i}" @click="jumpToHome(v, i)">
                        <span class="pass-list-pic-box">
                            <span class="pass-list-pic" :class="{active: activeCurrent === i}">{{v.orgName.substr(0,1)}}</span>
                            <span>{{v.orgName}}</span>
                        </span>
                        <span v-if="activeCurrent === i" class="custom custom-tick-circle"></span>
                    </li>
                </template>
            </ul>
        </el-scrollbar>
    </div>
</template>
<script setup>
import { ref, reactive, watch } from 'vue';
import { loginSuccess } from '@/utils/common';
import { useRouter } from 'vue-router';
import actions from '@/micros/actions.js';
import { useUserStore } from '@/pinia/modules/user';
import { routes } from '@/router/router';
const router = useRouter();

// props 接收
const props = defineProps({
    accountDetailData: {
        type: Object,
        default: () => ({})
    }
});

const passList = ref([]);

watch(
    () => props.accountDetailData,
    (val) => {
        if (val) {
            passList.value = val;
        }
    },
    {
        immediate: true
    }
);

const activeCurrent = ref(-1);

// 获取租户token，并跳转到首页
const jumpToHome = (item, i) => {
    loginSuccess(item, passList.value, () => {
        activeCurrent.value = i;
        router.push({
            path: '/',
            query: {url: '/systemSettings/company'}
        });
    });
    console.log('跳转到详情页', item.orgId);
};


</script>
<style lang="scss" scoped>
.pass-list {
    &-title{
        font-size: 20px;
        margin: 12px 0 0;
    }
    &-subtitle{
        font-size: 14px;
        color: #606266;
        margin: 8px 0 20px;
    }
    &-pic-box{
        display: flex;
        align-items: center;
    }
    &-pic {
        font-size: 16px;
        height: 42px;
        width: 42px;
        display: inline-block;
        margin-right: 8px;
        border-radius: 42px;
        text-align: center;
        line-height: 42px;
        font-weight: 500;
        color: #fff;
        background: #4285F2;
        &.active{
            color: #4285F2;
            background: #fff;
        }
    }
    &-box{
        margin: 0;
        padding: 0;
        li {
            margin: 0;
            padding: 0;
            list-style: none;
            height: 58px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            margin-bottom: 2px;
            font-size: 16px;
            background-color: #F5F7FA;
            cursor: pointer;
            .custom-tick-circle {
                font-size: 20px;
            }
            &:hover{
                background-color: #E1E7EE;
            }
            &.active{
                background-color: #4285F2;
                color: #fff;
            }
        }
    }
}
</style>