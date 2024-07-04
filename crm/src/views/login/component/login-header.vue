<!-- 顶部logo及切换语言按钮 -->
<template>
    <!-- 公司logo -->
    <div class="login-icon">
        <!-- 新窗口打开官网 -->
        <h1>
            <a :href="xhlUrl"><span class="custom custom-logo-zh-new"></span></a>
        </h1>
    </div>
    <div class="lang_box">
        <el-popover placement="top" ref="poptip" popper-class="login-icon-popover">
            <img style="width:150px;height:173px" :src="require('@/assets/images/appcode.png')" alt="">
            <template #reference>
                <span class="login__down-load-app">{{ lang }}</span>
            </template>
        </el-popover>
        <span class="login_chart" @click="changeLangBtn">{{langStore.lang === 'zh-CN' ? 'English' : '中文'}}</span>
    </div>
</template>
<script setup>
import { ref, reactive } from 'vue';
import { t, changeLang } from '@/locale';
import { useLocalStore } from '@/pinia/modules/local';
import { useI18n } from 'vue-i18n';

const langStore = useLocalStore();
console.log(333, t('login.DownloadLeadsCloud'));

const lang = ref();
lang.value = t('login.DownloadLeadsCloud');
const xhlUrl = 'https://www.leadscloud.com/'; // 跳转到官网的url
// en-US
// 更改语言
const changeLangBtn = () => {
    let lang = changeLang();
    langStore.$patch({
        lang
    });
};
</script>
<style lang="scss" scoped>
.login-icon {
    margin-left: 30px;
  // logo右侧的字体
  .custom {
    font-size: 34px;
    color: #FF752A;
    box-sizing: border-box;
  }
  h1 {
    padding: 0px;
    margin: 19px 0;
  }
}
.lang_box {
    font-size: 12px;
    margin-right: 30px;
    .login_chart {
      color: #333;
      font-size: 12px;
      line-height: 18px;
      cursor     : pointer;
      user-select: none;
    }
}
.login__down-load-app {
    // float: right;
    margin-right: 20px;
    padding: 4px 10px;
    color: #FF752A;
    background: #FFFFFF;
    border: 1px solid #FF752A;
    border-radius: 4px;
    font-size: 12px;
    line-height: 16px;
    display: inline-block;
    cursor: pointer;
    // &:hover{
    //   color: #2D63BC;
    // }
}
</style>
<style lang="scss">
.login-icon-popover {
    width: 175px!important;
}
</style>