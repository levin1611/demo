<!-- 通行证详情页面 -->
<template>
    <div class="login">
        <div class="login-container">
            <div class="login-top">
                <login-header></login-header>
            </div>
            <!-- 通行证详情弹框 -->
            <account-detail :larkId="larkId"></account-detail>
            <!-- 底部 -->
            <div class="login-bottom">
                <login-footer></login-footer>
            </div>
        </div>
    </div>
</template>
<script setup>
import loginHeader from './component/login-header.vue';
import loginFooter from './component/login-footer.vue';
import accountDetail from './component/accountDetail.vue';
import { ref, reactive, watch } from 'vue';
import { useBrowserLocation } from '@vueuse/core';
import { getHashParams } from '@/utils/dataProcess';
import { passByLarkId } from '@/api/login';
const accountDetailData = ref({});

const larkId = getHashParams(useBrowserLocation().value.hash);
// passByLarkId({
//     // larkId: '5e1bcdf5fa01406b817eb78e1f80a386'
//     larkId: getHashParams(useBrowserLocation().value.hash)
// }).then(res => {
//     console.log(res);
//     if (res.code === 10000) {
//         accountDetailData.value = res.data;
//     } else {
//         console.log('查询失败');
//     }
// });
</script>
<style lang="scss" scoped>
@import './login-page.scss';
.float-right{
    float: right;
}
.margin-bottom-10 {
    margin-bottom: 10px;
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