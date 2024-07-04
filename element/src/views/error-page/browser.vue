<template>
    <div>
        <div class="main">
            <img src="../../../static/img/less-than-ie-10.png" alt="">
            <div class="sorry"> {{$t('errorPage.sorry')}}</div>
            <p class="text">{{$t('errorPage.browserTxt')}}</p>
            <p class="text">{{$t('errorPage.browserTxt1')}}
                <a href="https://www.google.cn/intl/zh-CN/chrome/browser/desktop/">{{$t('errorPage.browserTxt2')}}</a>
                {{$t('errorPage.browserTxt3')}}<a href="http://www.chromeliulanqi.com">http://www.chromeliulanqi.com</a>
            </p>
        </div>
    </div>
</template>
<script>
    export default {
        data() {
            return {}
        }
    }
</script>
<style scoped>
    .main {
        margin-top: 150px;
        height:50%;
        text-align: center;
    }

    .sorry {
        font-size: 32px;
        font-weight: bolder;
        color: #717172;
    }

    .text {
        font-size: 14px;
        color: #717172;
    }

    a {
        color: #FA8241;
    }
</style>