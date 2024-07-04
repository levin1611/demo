<template>
    <Drawer :visible="isDrawerShow"
            v-show="floatWindowType"
            size="400px"
            :modal="false"
            :mask="false"
            :wrapperClosable="false"
            :show-close="false"
            :append-to-body="true"
            @close="handleClose"
            class="main-drawer">
        <!-- FB -->
        <fb-inbox-window
               v-if="!onlyHelpCenter"
               v-show="floatWindowType==='inbox'"
               :float-window-type="floatWindowType"
               :update="update"
               :is-fixed="isFixed"
               @changeFixState="changeFixState"
               @drawerClosable="val=>drawerClosable=val"
               @windowClose="handleDrawerClose">
        </fb-inbox-window>

        <!-- 聊天 -->
        <chat-split-screen
                v-if="!onlyHelpCenter"
                ref="chatSplitScreen"
                v-show="floatWindowType==='xhl_chat'"
                :is-fixed="isFixed"
                @changeFixState="changeFixState"
                @drawerClosable="val=>drawerClosable=val"
                @windowClose="handleDrawerClose">
        </chat-split-screen>
        <!-- 邮件 -->
        <MailWindow v-if="floatWindowType==='mail_home'"
                    :is-fixed="isFixed"
                    :update="update"
                    :windowType="floatWindowType"
                    @changeFixState="changeFixState"
                    @windowClose="handleDrawerClose"></MailWindow>

        <!-- 任务通知 -->
        <TaskNotice v-if="!onlyHelpCenter"
                    v-show="floatWindowType === 'taskNotice'"
                    :isDrawerShow="isDrawerShow"
                    :floatWindowType="floatWindowType"
                    @windowClose="handleDrawerClose"></TaskNotice>

        <!-- 系统通知 -->
        <SystemNotice v-if="!onlyHelpCenter"
                      v-show="floatWindowType === 'systemNotice'"
                      :isDrawerShow="isDrawerShow"
                      :floatWindowType="floatWindowType"
                      @windowClose="handleDrawerClose"></SystemNotice>

        <!-- 站内信 -->
        <StationLetter v-if="!onlyHelpCenter"
                       v-show="floatWindowType === 'stationLetter'"
                       :isDrawerShow="isDrawerShow"
                       :floatWindowType="floatWindowType"
                       @windowClose="handleDrawerClose"></StationLetter>

        <!-- 帮助中心 -->
        <HelpCenter v-show="floatWindowType === 'help'"
                    :isFullHeight="isFullHeight"
                    @windowClose="handleDrawerClose"></HelpCenter>
    </Drawer>
</template>

<script>
    import FbInboxWindow from './fb-inbox-window/fb-inbox-window';
    import chatSplitScreen from '@/views/xhl-chat/split-screen.vue';
    import MailWindow from './mail-window/mail-home';
    import TaskNotice from './notice-window/taskNotice';
    import SystemNotice from './notice-window/systemNotice';
    import StationLetter from './notice-window/stationLetter';
    import HelpCenter from '@/views/main-components/help-center/help-center';
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'FloatingWindow',
        props: {
            isDrawerShow: {},
            isFixed: {},
            floatWindowType: {
                type: String,
                default: ''
            },
            // 是否没有 Drawer 顶部的 top: 60px
            isFullHeight: {
                type: Boolean,
                default: false
            },
            // 是否只有 helpCenter
            onlyHelpCenter: {
                type: Boolean,
                default: false
            }
        },
        components: {
            FbInboxWindow,
            chatSplitScreen,
            MailWindow,
            TaskNotice,
            SystemNotice,
            StationLetter,
            HelpCenter
        },
        computed: {
            ...mapState({
                tempFloatWindowType: state => state.app.tempFloatWindowType,
                orgId: 'enterpriseId',
                userId: 'userId'
            }),
            ...mapGetters([
                'drawer_show'
            ])
        },
        data() {
            return {
                windowTitle: '',
                update: false
            };
        },
        methods: {
            handleDrawerClose() {
                this.$emit('isFixed', false);
                this.$emit('changeDrawerShow', false);
            },
            changeFixState(val) {
                this.$emit('isFixed', val);
            },
            handleClose() {
                this.$emit('changeDrawerShow', false);
            }
        },
        watch: {
            /**
             * @Description: 去掉 isTop
             * 之前项目使用的是 iview 框架, 用 isTop 和 z-index 实现"分屏和侧滑页谁后出现谁显示在另一个上面"
             * 现在 element 框架默认就是这么实现的, 且 z-index 和 iview 框架不一致, 所以注释掉 isTop 和 z-index 相关代码
             * @author 汤一飞
             * @date 2020/5/6
            */
            floatWindowType(val) {
                this.update = true;
                setTimeout(() => {
                    this.update = false;
                    // this.isTop = true;
                });
                if (val === 'xhl_chat') {
                    this.$refs.chatSplitScreen.closeCrmOrClueDetail();
                    this.$refs.chatSplitScreen.closeDrawer();
                }
            },
            isDrawerShow(val) {
                this.update = val;
                /**
                 * @Description: 此处的 $emit('changeDrawerShow', true) , 可能导致页面中有 drawer 时退出重登系统后, 未点击分屏分屏也显示, 并且分屏是白屏状态
                 * 注: 之前没加 "&& this.floatWindowType", 加了这个好像解决了
                 * 注: 白屏是因为登录系统时, 前端先打开分屏 drawer 再关闭, 来触发 drawer 内部的方法, 执行更新未读数角标等操作
                 * @author 汤一飞
                 * @date 2020/5/6
                */
                /**
                 * @Date: 2020-05-13 18:21:38
                 * @LastEditors: niumkiki
                 * @description: 聊天小屏如果显示了访客详情页,关闭小屏时,详情页也需要关闭,否则重新点开会报错
                 *               如果isDrawerShow变为false,且floatWindowType是xhl_chat
                 * @param :
                 * @return:
                 */
                if (!val) {
                    if (this.tempFloatWindowType === 'xhl_chat') {
                        this.$refs.chatSplitScreen.closeCrmOrClueDetail();
                        this.$refs.chatSplitScreen.closeDrawer();
                    }
                }
                // if (val) {
                //     this.isTop = true;
                // } else {
                //     // 此代码是为了解决---先显示分屏, 再显示侧滑页情况下, 外部点击顶部按钮想再次显示分屏, 但点击两次才能打开分屏
                //     // 原因: 被打开的分屏因侧滑页后出现, 层级关系在其之上而隐藏, 用户想点击顶部该分屏图标想重新展示该分屏, 但第一次点击图标会执行 is_drawer_show = !is_drawer_show 把隐藏起来的分屏关掉
                //     if (!this.isTop && this.drawer_show && this.floatWindowType) {
                //         this.$emit('changeDrawerShow', true);
                //     }
                // }
            }
            // drawer_show: {
            //     handler(val) {
            //         if (this.isDrawerShow) {
            //             this.isTop = !val;
            //         }
            //     }
            // },
            // isTop: {
            //     handler(val) {
            //         // 本来只要下面这段的, 但不知道为啥不起作用了(猜测 z-index 原因?), 给顶部 Drawer 加上 transfer 才奏效
            //
            //         // 参照 custom.less 里的 @zindex-drawer: 1000 设定, 过高可能导致分屏内部 transfer 的组件被遮挡
            //         const dom = document.querySelector('.main-drawer');
            //         if (dom) {
            //             dom.style.zIndex = val ? 1001 : 'auto';
            //         }
            //         // document.querySelector('.main-drawer').style.display = val ? 'block' : 'none';
            //     }
            // }
        },
        created() {
        }
    };
</script>

<style scoped>
    .main-drawer >>> .el-drawer {
        overflow-y: scroll;
    }
</style>

<style lang="less">
    @import url('./floating-window.less');
    .main-drawer .el-drawer__header {
        display: none;;
    }
    .main-drawer > .el-drawer__body {
        overflow-x: hidden;
    }
</style>
