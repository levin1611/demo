<template>
    <Drawer :visible="visible"
            :append-to-body="false"
            :show-close="false"
            :modal="false"
            :with-header="false"
            size="380px"
            class="main-drawer" :class="{'clear-overflowhidden': forbiddenmousever}">
        <!-- 正体 -->
            <div id="v-step-menu-appcenter"  :class="{'click-forbidden-modal-common':forbiddenmousever}" :data-count="allUnreadCount"
                @mouseenter="toggleAppCenter(true)"
                @mouseleave="toggleAppCenter(false)"
                class="app-module-list" >
                <!-- 标题 -->
                <div v-if="!isWAPersonalEdition"
                     class="floating-window-header"
                    style="margin-bottom: 0;">
                    <div class="floating-window-header-title">{{ $t('menu.appCenter') }}</div>
                </div>
                <!-- 系统设置 -->
                <div v-if="!isWAPersonalEdition"
                     class="app-module" id="v-step-menu-appcenter-sysem">
                    <div class="app-module-container">
                        <!-- 图标 -->
                        <img :src="`${publicPath}image/setting.svg`"
                             @click="openSystemSettings"
                             class="app-module-icon piwik_app-center-settings"/>
                        <br>
                        <!-- 底部标题 -->
                        <span @click="openSystemSettings"
                              class="app-module-title piwik_app-center-settings">{{ $t('menu.system_settings') }}</span>
                    </div>
                </div>
                <!-- 我的任务 -->
                <!-- <div v-if="!isWAPersonalEdition"
                     class="app-module">
                    <div class="app-module-container">
                        <Badge :value="taskUnreadCount"
                            :max="99"
                            :hidden="taskUnreadCount <= 0">
                            <img :src="`${publicPath}image/myTask.svg`"
                                 @click="openNotice('taskNotice')"
                                 class="app-module-icon piwik_app-center-task"/>
                        </Badge>
                        <br>
                        <span @click="openNotice('taskNotice')"
                              class="app-module-title piwik_app-center-task">{{ $t('noticeWindow.taskNotice') }}</span>
                    </div>
                </div> -->
                <!-- 系统通知 -->
                <div v-if="!isWAPersonalEdition"
                     class="app-module">
                    <div class="app-module-container">
                        <!-- 图标 -->
                        <Badge :value="systemNoticeUnreadCount"
                                :max="99"
                                :hidden="systemNoticeUnreadCount <= 0">
                            <img :src="`${publicPath}image/notification.svg`"
                                 @click="openNotice('systemNotice')"
                                 class="app-module-icon piwik_app-center-notice"/>
                        </Badge>
                        <br>
                        <!-- 底部标题 -->
                        <span @click="openNotice('systemNotice')"
                              class="app-module-title piwik_app-center-notice">{{ $t('noticeWindow.systemNotice') }}</span>
                    </div>
                </div>
                <!-- 站内信 -->
                <!-- <div class="app-module">
                    <div class="app-module-container">
                        <Badge :value="letterUnreadCount"
                               :max="99"
                               :hidden="letterUnreadCount <= 0">
                            <img :src="`${publicPath}image/stationLetter.svg`"
                                 @click="openNotice('stationLetter')"
                                 class="app-module-icon piwik_app-center-letters"/>
                        </Badge>
                        <br>
                        <span @click="openNotice('stationLetter')"
                              class="app-module-title piwik_app-center-letters">{{ $t('noticeWindow.stationLetter') }}</span>
                    </div>
                </div> -->
                 <!-- 企微管理 -->
                 <!-- <div v-if="isContainsMenu('whatsapp_microenterprise')"
                     class="app-module" >
                    <div class="app-module-container" @click="openQwHelpDOC">
                        <img :src="`${publicPath}image/help_qw.png`"
                        height="30"
                             @click=""
                             class="app-module-icon "/>
                        <br>
                        <span @click=""
                              class="app-module-title">{{ $t('menu.whatsapp_microenterprise') }}</span>
                    </div>
                </div> -->
                <!-- 网站留言 -->
                <!-- <div v-if="isContainsMenu('website_message') && !isWAPersonalEdition"
                    class="app-module">
                    <div class="app-module-container">
                        <img v-if="unProcessMsgCount === 0"
                             :src="`${publicPath}image/websiteMsg.svg`"
                             @click="jumpTo('website_message')"
                             class="app-module-icon main-jump-to-webMsg"/>
                        <Poptip v-else
                                width="190"
                                trigger="hover"
                                placement="bottom"
                                popper-class="no-padding"
                                ref="poptip"
                                @show="handlePopShow"
                                @hide="handlePopHide">
                            <Badge slot="reference"
                                :value="unProcessMsgCount"
                                :max="99"
                                :hidden="unProcessMsgCount <= 0">
                                <img :src="`${publicPath}image/websiteMsg.svg`"
                                     @click="jumpTo('website_message')"
                                     class="app-module-icon main-jump-to-webMsg"/>
                            </Badge>
                            <div class="websiteMsg-formList-container">
                                <p class="websiteMsg-formList-title">{{ $t('menu.web_message') }}</p>
                                <ul class="websiteMsg-formList cursor-pointer">
                                    <li v-for="form in haveCountFormList"
                                        @click="jumpTo('website_message', { formId: form.id })"
                                        class="main-jump-to-webMsg">
                                        <p class="form-name">{{ form.cname }}</p>
                                        <p class="form-count">{{ form.count }}</p>
                                    </li>
                                </ul>
                            </div>
                        </Poptip>
                        <br>
                        <span @click="jumpTo('website_message')"
                              class="app-module-title main-jump-to-webMsg">{{ $t('menu.web_message') }}</span>
                    </div>
                </div> -->
                <!-- Facebook Leads -->
                <!-- <div v-if="isContainsMenu('fb_message') && !isWAPersonalEdition"
                    class="app-module">
                    <div class="app-module-container">
                        <Badge :value="fbLeadsUnentry"
                            :max="99"
                            :hidden="fbLeadsUnentry <= 0">
                            <img :src="`${publicPath}image/FacebookLeads.svg`"
                                 @click="jumpTo('fb_message', { type: 'noDispose'})"
                                 class="app-module-icon main-jump-to-leads"/>
                        </Badge>
                        <br>
                        <span @click="jumpTo('fb_message', { type: 'noDispose'})"
                              class="app-module-title main-jump-to-leads">Facebook Leads</span>
                    </div>
                </div> -->
            <div v-if="forbiddenmousever" class="click-forbidden-modal-common-child"></div>
            </div>
    </Drawer>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'app-center',
        props: [
            'forbiddenmousever'
        ],
        computed: {
            ...mapState({
                // 应用中心 drawer 显隐控制
                appCenterVisible: state => state.app.appCenterVisible,
                // leads 未读数
                fbLeadsUnentry: state => state.facebook.fbLeadsUnentry,
                // 所有留言表单
                formList: state => state.website_msg.formList,
                // 任务提醒未读数
                taskUnreadCount: state => state.app.taskUnreadCount,
                // 系统通知未读数
                systemNoticeUnreadCount: state => state.app.systemNoticeUnreadCount,
                // 站内信未读数
                letterUnreadCount: state => state.app.letterUnreadCount
            }),
            ...mapGetters([
                'isContainsMenu',
                'isWAPersonalEdition'
            ]),
            // 有未处理留言的留言表单
            haveCountFormList() {
                return this.formList.filter(form => form.count > 0);
            },
            // 未处理留言总数
            unProcessMsgCount() {
                let count = 0;
                this.formList.forEach(item => {
                    count += item.count;
                });
                return count;
            },
            // 所有未读消息总数
            allUnreadCount() {
                // 计算得到应用中心未读消息总条数
                let result = this.taskUnreadCount + this.systemNoticeUnreadCount + this.letterUnreadCount;
                if (this.isContainsMenu('fb_message')) {
                    result += this.fbLeadsUnentry;
                }
                if (this.isContainsMenu('website_message')) {
                    result += this.unProcessMsgCount;
                }
                // 更新数据到 vuex
                this.$store.commit('setNoticeUnread', {
                    type: 'allUnreadCount',
                    count: result
                });
                return result;
            }
        },
        data() {
            return {
                // 全局
                // 静态资源文件地址
                publicPath: process.env.BASE_URL,
                // 直接控制 drawer 显隐
                visible: false,

                // 网站留言
                // 网站留言 poptip 显隐状态
                popShow: false,
                timeOut: null
            };
        },
        methods: {
            // 应用中心显隐切换
            toggleAppCenter(visible) {
                if (this.forbiddenmousever) return false;
                this.$store.commit('changeAppCenterVisible', visible);
            },
            // 打开企微帮助中心文档
            openQwHelpDOC() {
                window.open(`https://www.yuque.com/help.leadscloud/faq_guide/zrb3axypvnker9ag?singleDoc#`)
            },
            // 跳转到系统设置页面
            openSystemSettings() {
                if (this.forbiddenmousever) return false;
                const routerMap = this.$store.state.app.router_map || [];
                const f = routerMap.filter(item => item.name === 'systemSettings');
                // const f = routerMap.filter(item => item.name === 'permisssystem');
                const config = f.length ? f[0].children : f;
                const item = this.$dym.getDefalutRouteName(config);
                if (item) {
                    this.$nextTick(function() {
                        const targetUrl = this.$router.resolve({
                            name: item.name
                        });
                        // window.open(targetUrl.href, '_blank');
                        this.$stm.openNewWindow(targetUrl.href);
                    });
                }
            },

            // 打开 任务/系统通知/站内信 分屏
            openNotice(type) {
                this.$emit('openNoticeScreen', type);
            },

            // 跳转到 Google / FB Leads 界面
            jumpTo(name, params) {
                // 关闭 drawer
                this.visible = false;
                this.$store.commit('changeAppCenterVisible', false);
                if (this.$refs.poptip) {
                    this.$refs.poptip.doClose();
                }
                // 如果要跳转的页面就是当前页, 则先跳转到空白页, 再正常跳转, 避免报错
                if (this.$route.name === name) {
                    // 跳转到 refresh 中转页, 中转页根据传入 params 带参数跳转到指定 name
                    this.$router.push({
                        name: 'refresh',
                        params: Object.assign({
                            name
                        }, params)
                    });
                    return;
                }

                // 否则直接跳转到目标页
                this.$router.push({
                    name,
                    params
                });
            },

            // 网站留言 poptip 显示/隐藏
            handlePopShow() {
                this.popShow = true;
            },
            handlePopHide() {
                this.popShow = false;
                // 延时判断是否需要隐藏 drawer
                setTimeout(() => {
                    if (!this.appCenterVisible && !this.popShow) {
                        this.visible = false;
                    }
                }, 400);
            }
        },
        created() {
            // 各种获取消息通知数量
        },
        watch: {
            appCenterVisible: {
                handler(val) {
                    if (val) {
                        // this.visible = true;
                        this.timeOut = setTimeout(() => {
                            this.visible = true;
                        }, 500);
                    } else {
                        // 延时判断是否需要隐藏 drawer
                        setTimeout(() => {
                            if (!this.appCenterVisible && !this.popShow) {
                                this.visible = false;
                                clearTimeout(this.timeOut);
                            }
                        }, 400);
                    }
                }
            }
        }
    };
</script>

<style lang="less">
    @import '~@/views/main-components/floating-window/notice-window/components/less/notice.less';
</style>

<style scoped lang="less">
    .app-module-list {
        padding: 10px;
        height: 100%;
        background-color: #fcfdfe;
    }

    .app-module {
        display: inline-block;
        width: 50%;
        height: 104px;
        position: relative;

        &-container {
            position: absolute;
            bottom: 0;
            width: 100%;
            text-align: center;
        }

        &-icon {
            cursor: pointer;
        }

        &-title {
            font-size: 14px;
            color: rgba(0,0,0,0.80);
            letter-spacing: 0;
            line-height: 22px;
            cursor: pointer;
        }
    }

    .websiteMsg-formList-container {
        max-height: 50vh;
        overflow-y: auto;
        padding: 10px 0 15px 0;
        font-size: 12px;

        .websiteMsg-formList-title {
            font-weight: 700;
            padding: 6px 20px;
        }

        .websiteMsg-formList {
            list-style: none;

            li {
                display: flex;
                align-items: center;
                padding: 6px 20px;

                &:hover {
                    background-color: #F3F4F7;
                }

                .form-name {
                    flex: 1;
                    max-width: 80%;
                    padding-right: 5px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .form-count {
                    text-align: right;
                }
            }
        }
    }
     .floating-window {
        &-header {
            height: 24px;
            line-height: 24px;
            margin: 20px 10px;
            color: rgba(0, 0, 0, 0.6);

            &-title {
                font-size: 16px;
                // color: rgba(0,0,0,0.80);
                color: #2d2f2e;
                font-weight: 500;
                float: left;
            }
        }
    }
</style>
