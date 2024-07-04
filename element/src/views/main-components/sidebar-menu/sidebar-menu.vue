<template>
    <div :style="{background: bgColor}"
         class="side-shrinkable-menu clear-menu-default" :class="{'click-forbidden-modal-common': forbiddenClick}">
        <slot name="top"></slot>
        <Menu :default-active="currentPageName"
              :unique-opened="true"
              collapse
              ref="sideMenu"
              @select="handleChange"
              class="side-menu side-collapse-menu">
            <template v-for="item in menuList.filter(item => item.path !== '/customs_data')">
                <MenuItem v-if="item.path === '/communication'" :key="item.id"
                            :index="item.children[0].name"
                            :disabled="forbidden"
                            @contextmenu.native.prevent
                            @click.native="handleClickLeft(item.children[0].name)"
                            @click.native.right="handleClickRight(item.children[0].name)"
                            :class="{'side-menu-item-active': activeRouteNames.includes(item.children[0].name)}">
                    <Badge :value="communicationCount" :max="99" :hidden="communicationCount <= 0">
                        <i :class="{unReadForQW:isShowQWunRead(item)}">
                                <Icon :key="item.id"
                                :custom="item.icon || item.icon"
                                :size="iconSize"
                                :class="item.class || item.class">
                                </Icon>
                        </i>
                        <span :key="'title' + item.id"
                                :title="itemTitle(item.children[0])"
                                :style="{display: menuExpand ? 'inline-block' : 'none'}"
                                class="layout-text">{{ itemTitle(item) }}</span>
                    </Badge>
                </MenuItem>
                <MenuItem v-else-if="item.children.length === 1 && !item.children[0].children && ['home', 'mail_home', 'index'].includes(item.children[0].path)"
                          :key="item.id"
                          :index="item.children[0].name"
                          :disabled="forbidden"
                          @contextmenu.native.prevent
                          @click.native="handleClickLeft(item.children[0].name)"
                          @click.native.right="handleClickRight(item.children[0].name)"
                          :class="{'side-menu-item-active': activeRouteNames.includes(item.children[0].name)}">
                    <i :class="{unReadForQW:isShowQWunRead(item)}">
                            <Icon :key="item.id"
                            :custom="item.children[0].icon || item.icon"
                            :size="iconSize"
                            :class="item.children[0].class || item.class">
                            </Icon>
                    </i>
                    <span :key="'title' + item.id"
                          :title="itemTitle(item.children[0])"
                          :style="{display: menuExpand ? 'inline-block' : 'none'}"
                          class="layout-text">{{ itemTitle(item.children[0]) }}</span>
                </MenuItem>
                <Submenu v-else
                         :key="item.id"
                         :index="item.name"
                         popper-class="side-collapse-menu-popper clear-menu-default"
                         ref="submenu"
                         :class="{'side-menu-item-active': activeRouteNames.includes(item.name)}">
                    <template slot="title">
                        <template v-if="item.path === '/websiteInteraction'">
                            <Badge :value="websiteInteractionCount" :max="99" :hidden="websiteInteractionCount <= 0">
                                <i :class="{unReadForQW:isShowQWunRead(item)}">
                                        <Icon :custom="item.icon"
                                        :size="iconSize"
                                        :class="item.class"></Icon>
                                </i>
                                 <span :title="itemTitle(item)"
                                    :style="{display: menuExpand ? 'inline-block' : 'none'}"
                                    class="layout-text">{{ itemTitle(item) }}</span>
                            </Badge>
                        </template>
                        <template v-else-if="item.path === '/socialMedia'">
                            <Badge :value="socialMediaCount" :max="99" :hidden="socialMediaCount <= 0">
                                <i :class="{unReadForQW:isShowQWunRead(item)}">
                                        <Icon :custom="item.icon"
                                        :size="iconSize"
                                        :class="item.class"></Icon>
                                </i>
                                 <span :title="itemTitle(item)"
                                    :style="{display: menuExpand ? 'inline-block' : 'none'}"
                                    class="layout-text">{{ itemTitle(item) }}</span>
                            </Badge>
                        </template>
                        <template v-else>
                             <i :class="{unReadForQW:isShowQWunRead(item)}">
                                        <Icon :custom="item.icon"
                                        :size="iconSize"
                                        :class="item.class"></Icon>
                                </i>
                             <span :title="itemTitle(item)"
                                :style="{display: menuExpand ? 'inline-block' : 'none'}"
                                class="layout-text">{{ itemTitle(item) }}</span>
                        </template>
                        <Icon custom="custom-menu-arrow-forward"
                              class="side-collapse-menu-arrow"></Icon>
                    </template>
                    <template v-for="child in item.children">
                        <MenuItem :key="child.id"
                                  :disabled="forbidden"
                                  :index="child.children && child.children.length  ? child.children[0].name : child.name"
                                  :style="{display:menuExpand ? 'flex':'none', 'padding-left': '55px'}"
                                  @contextmenu.native.prevent
                                  @click.native="handleClickLeft(child.children ? child.children[0].name : child.name)"
                                  @click.native.right="handleClickRight(child.children ? child.children[0].name : child.name)"
                                  @mouseenter.native="mouse(true)"
                                  @mouseleave.native="mouse(false)">
                            <span :key="child.id"
                                  :title="itemTitle(child)">{{ itemTitle(child) }}</span>
                        </MenuItem>
                    </template>
                </Submenu>
            </template>
        </Menu>
        <div v-if="forbiddenClick" class="click-forbidden-modal-common-child"></div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import { getQWunreadCount } from '@/api/qiyewx.js';
    export default {
        name: 'sidebarMenu',
        props: {
            forbiddenClick: {
                type: Boolean,
                default: false
            },
            forbidden: Boolean,
            menuExpand: {
                type: Boolean,
                default: false
            },
            menuList: {
                type: Array,
                required: true
            },
            theme: {
                type: String,
                default: 'dark',
                validator(val) {
                    return util.oneOf(val, ['dark', 'light']);
                }
            },
            beforePush: {
                type: Function
            }
        },
        data() {
            return {
                iconSize: 20
            };
        },
        computed: {
            ...mapState({
                bi_report_menu: 'bi_report_menu',
                currentPageName: state => state.app.currentPageName,
                lang: state => state.app.lang,
                // 当前路由 name 数组
                activeRouteNames: state => state.app.activeRouteNames,
                // 企微未读消息数量
                unReadMsgCount: state => state.microenterprise.unReadMsgCount,
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                fullName: state => state.fullName,
                allUnreadMails: state => state.mail.allUnreadMails, // 未读邮件
                fbChatUnread: state => state.facebook.fbChatUnread, // FB 私信未读数
                totalChatCount: state => state.totalChatCount, // 网站聊天
                // leads 未读数
                fbLeadsUnentry: state => state.facebook.fbLeadsUnentry,
                // 所有留言表单
                formList: state => state.website_msg.formList,
                // whatsapp未读数
                waUnreadObj: state => state.whatsapp.waUnreadObj
            }),
            ...mapGetters([
                'isContainsMenu',
                'WAUnreadCount'
            ]),
            bgColor() {
                return this.theme === 'dark' ? '#495060' : '#fff';
            },
            communicationCount() {
                let result = 0; // this.systemNoticeUnreadCount + this.letterUnreadCount;
                if (this.isContainsMenu('whatsapp_chat')) {
                    Object.values(this.waUnreadObj).forEach(item => {
                        result += item;
                    });
                }
                if (this.isContainsMenu('xhl_chat')) {
                    result += this.totalChatCount;
                }
                if (this.isContainsMenu('inbox')) {
                    result += this.fbChatUnread;
                }
                return result;
            },
            websiteInteractionCount() {
                let result = 0;
                if (this.isContainsMenu('website_message')) {
                    this.formList.forEach(item => {
                        result += item.count;
                    });
                }
                return result;
            },
            socialMediaCount() {
                let result = 0;
                if (this.isContainsMenu('fb_message')) {
                    result += this.fbLeadsUnentry;
                }
                return result;
            }
        },
        methods: {
            // 子目录 mouseenter/mouseleave 事件
            mouse(flag) {
                // 触发 menu 事件
                this.$emit(flag ? 'subMenuOpen' : 'subMenuClose');
            },
            // 鼠标左键点击目录
            handleClickLeft(path) {
                // 如果点击时没有同时点击 Control/Alt/Meta , 则退出流程(转由 menu select 处理)
                if (!this.forbidden) {
                    return false;
                }

                // 如果被点击的是数据迁移, 则退出流程
                if (path === 'dataMovement') {
                    this.$Message.warning(this.$t('menu.canNotOpenNewTab'));
                    return false;
                }

                // 否则新窗口打开
                this.openNewTab(path);
            },
            // 鼠标右键点击目录
            handleClickRight(path, e) {
                // 如果被点击的是数据迁移, 则退出流程
                if (path === 'dataMovement') {
                    this.$Message.warning(this.$t('menu.canNotOpenNewTab'));
                    return false;
                }

                // 否则新窗口打开
                this.openNewTab(path);
            },
            // 新窗口打开页面
            openNewTab(path) {
                if (this.bi_report_menu.hasOwnProperty(path)) {
                    // window.open(this.bi_report_menu[path]);
                    this.$stm.openNewWindow(this.bi_report_menu[path]);
                    // 下面是恢复菜单的active项
                    this.$nextTick(() => {
                        if (this.$refs.sideMenu) {
                            this.$refs.sideMenu.activeIndex = this.currentPageName;
                        }
                    });
                    return;
                }

                const targetUrl = this.$router.resolve({
                    name: path
                });
                // this.$stm.openNewWindow(targetUrl.href);
                window.open(targetUrl.href, '_blank');
            },
            // menu select 方法
            handleChange(name, params) {
                // 修正选中项
                if (this.$refs.sideMenu) {
                    this.$refs.sideMenu.activeIndex = this.currentPageName;
                }
                if (this.bi_report_menu.hasOwnProperty(name)) {
                    window.open(this.bi_report_menu[name]);
                    // // 下面是恢复菜单的active项
                    // this.$nextTick(() => {
                    //     if (this.$refs.sideMenu) {
                    //         this.$refs.sideMenu.activeIndex = this.currentPageName;
                    //     }
                    // });
                    return;
                }

                let willpush = true;
                if (this.beforePush !== undefined) {
                    if (!this.beforePush(name)) {
                        willpush = false;
                    }
                }
                if (willpush) {
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
                    this.$emit('clearGlobalSearch', name);
                }
            },
            itemTitle(item) {
                if (typeof item.title === 'object') {
                    return this.$t(item.title.i18n);
                } else {
                    return item.title;
                }
            },
            isShowQWunRead(item) {
                // 是否展示未读小红点
                if (!item || !item.name) return false;
                if (item.name === 'whatsapp_manage_home') return this.WAUnreadCount > 0;
                if (item) {
                    return (item.children[0] && item.children[0].name === 'whatsapp_microenterprise') && this.unReadMsgCount > 0;
                };
            }
        },
        mounted() {
        }
    };
</script>

<style lang="less">
    @import './styles/menu.less';
</style>
