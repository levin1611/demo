<template>
    <div id="main" class="app-main">
        <router-view></router-view>
        <!-- 一级页面的微前端容器 比如登录页面 -->
        <div id="firstlevelpageWrap"></div>
    </div>
</template>

<script>
    import { startQiankunServe, qiankunAppStatus } from '@/micros';
    import { childRules } from '@/micros/childRules.js'; // 引入子应用激活规则

    export default {
        computed: {},
        data() {
            return {
                // theme: this.$store.state.app.themeColor
            };
        },
        created() {
        },
        methods: {
        },
        mounted() {
            console.error('app mounted');
            // 当前页匹配的子应用, 需要在 Main.vue 外挂载, 则在此处启动qiankun , 否则统一在 Main.vue 中启动

            // 遍历子应用配置, 如果 container 和路径匹配, 则启动qiankun
            // 以及, location.href.replace(/#.*$/, ''); 跳转登录页时, 也要启动 app
            childRules.some(item => {
                if (item.container === '#firstlevelpageWrap') {
                    const url = location.href;
                    if (!location.hash || location.hash === '#/' || url.includes(item.entry) || item.rule.some(i => url.includes(i))) {
                        startQiankunServe('App.vue');
                        return true;
                    }
                }
            });

            // 未登录时直接访问页面, 导致跳转登录页时, qiankun 未启动, 设置延时判断是否需要启动
            setTimeout(() => {
                if (!qiankunAppStatus) {
                    console.log('%c 乾坤 未启动, App.vue 负责重启!', 'color:green');
                    startQiankunServe('App.vue');
                }
            }, 1000);
        }
    };
</script>

<style>
    html, body {
        width: 100%;
        height: 100%;
        background: #f0f0f0;
        font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
    }

    body {
        overflow-y: hidden;
    }

    .app-main {
        background: #f2f3f5;
        width: 100%;
        height: 100%;
    }

    .xpy-shadow {
        background-color: #fff;
        -webkit-box-shadow: 0 0 4px rgba(0, 0, 0, .13);
        -moz-box-shadow: 0 0 4px rgba(0, 0, 0, .13);
        box-shadow: 0 0 4px rgba(0, 0, 0, .13);
    }
</style>
