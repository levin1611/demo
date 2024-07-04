<style lang="less">
    @import './404.less';
</style>

<template>
    <div v-show="!hidden"
         class="error404">
        <div class="error404-body-con">
            <div class="error404-body-con-title">
                <img src="../../svg/404.svg" alt="">
            </div>
            <div class="error404-body-con-tip">
                <span class="error404-body-con-message">很抱歉，您要访问的页面不存在！</span>
                <Button @click="goHome"
                        style="width: 80px;height:30px;line-height: 28px;border-radius: 15px;margin-left: 20px;padding: 0;"
                        type="primary">{{$t('errorPage.returnBack')}}
                </Button>
            </div>
            <!-- <div class="error404-btn-con">
                <Button @click="goHome" size="large" style="width: 200px;" type="text">{{$t('errorPage.returnBack')}}</Button>
                <Button @click="backPage" size="large" style="width: 200px;margin-left: 40px;" type="primary">{{$t('errorPage.pageUp')}}</Button>
            </div> -->
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Error404',
        data() {
            return {
                hidden: true
            };
        },
        methods: {
            backPage() {
                this.$router.go(-1);
            },
            goHome() {
                this.$router.push({
                    name: 'home_index'
                });
            }
        },
        created() {
            /**
             * @Description: 切换关联账号时, 可能出现切换账号前有页面权限, 切换后无权限, 页面变为 404
             * 于是在切换关联账号完成后 + 自动刷新页面前, 设置 localStorage . 在 set_menu_list 得到正确的 router_map 后再延时置空(避免其他情况进入 404 也执行此逻辑)
             * 若进入到 404 页面时检测到 localStorage 中相应的值, 则隐藏 404 页面, 跳转到首页
             * @author 汤一飞
             * @date 2021/1/21
            */
            this.hidden = localStorage.getItem('relatedLogin') || false;
            localStorage.removeItem('relatedLogin');
            if (this.hidden) {
                this.goHome();
            }
        }
    };
</script>
