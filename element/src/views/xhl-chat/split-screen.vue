<template>
    <div class="chat-split-screen">
        <!-- 显示访客列表页时的顶部 -->
        <div v-if="currInterface === 'splitChatList'"
             style="margin: 20px 20px 12px 20px;"
             class="floating-window-header">
            <!-- 标题 -->
            <div class="floating-window-header-title">{{ $t('menu.xhl_chat') }}</div>
            <!-- 图标 -->
            <div class="floating-window-fix-icon">
                <!-- 钉住 -->
                <Tooltip v-if="!isFixed"
                         :content="$t('pin')">
                    <Icon custom="custom custom-float-window"
                          size="16"
                          @click.native="handleFixed"
                          class="piwik_ChatSplitFixed"/>
                </Tooltip>
                <!-- 取消钉住 -->
                <Tooltip v-else
                         :content="$t('unpin')">
                    <Icon custom="custom custom-fixed-window"
                          size="16"
                          @click.native="handleUnFixed"
                          class="piwik_ChatSplitUnFixed"/>
                </Tooltip>
                <!-- 关闭按钮 -->
                <Icon custom="custom custom-modal-close"
                      @click="handleWindowClose"
                      style="margin-left:20px;"
                      class="piwik_ChatSplitClose"></Icon>
            </div>
        </div>
        <!-- 访客列表 -->
        <div v-if="currInterface === 'splitChatList'"
             class="chat-split-list-container">
            <!-- 已下线提示 -->
            <Spin v-if="!isServerOnlineChecked"
                  fix>
                <!-- 已下线字样 -->
                <div style="font-size: 12px;color: rgba(0,0,0,0.80);">{{ $t('chat.offlineTip') }}</div>
            </Spin>
            <!-- 访客列表 -->
            <chat-list source="SplitScreen"
                       @switchInterface="handleSwitchInterface"></chat-list>
        </div>
        <!-- 访客对话 -->
        <chat-frame v-else-if="currInterface==='splitChatFrame'"
                    ref="chatFrame"
                    source="SplitScreen"
                    @switchInterface="handleSwitchInterface"
                    @switchInfo="handleInfo"
                    @changeStatus="changeStatus"></chat-frame>
        <!-- 访客历史 -->
        <Drawer :visible.sync="value1"
                size="380px"
                :modal="false"
                :modal-append-to-body="false"
                class-name="split-chat-info"
                @close="closeDrawer(false)">
            <!-- <div v-if="status != 2 && status != 102" style="height:100%"> -->
            <div style="height:100%">
                <div style="padding: 0 30px 5px 0;"
                     class="new-chat-info-top">
                    <span v-if="browser"
                          class="new-top-icon">
                        <Tooltip :content="browserTip">
                            <svg class="icon"
                                 aria-hidden="true">
                                <use :xlink:href="browser()"></use>
                            </svg>
                        </Tooltip>
                    </span>
                    <span v-if="osInfo"
                          class="new-top-icon">
                        <Tooltip :content="osInfoTip">
                            <svg class="icon"
                                 aria-hidden="true">
                                <use :xlink:href="osInfo()"></use>
                            </svg>
                        </Tooltip>
                    </span>
                    <span style="float: right;margin-right: 10px">IP:{{ ipAddress || $t('chat.notHave') }}</span>
                </div>
                <div style="height: calc(100% - 50px);overflow-y: scroll;">
                    <div class="new-chat-info-title clearfix">
                        <span style="float: left">{{ $t('chat.chatInfo') }}</span>
                        <span style="float: right">
                            <!-- 未录入，显示录入按钮 -->
                            <Icon v-if="status == 1"
                                  custom="custom custom-enter-clue"
                                  color="#FA8241"
                                  size="24"
                                  class="clue-btn"
                                  @click="enterClue"/>
                            <!-- 无关，不可点击 -->
                            <span v-else-if="status == 3">{{ $t('chat.nothingWith') }}</span>
                            <Tooltip v-else-if="status == 2"
                                     :content="$t('clue.clue')"
                                     placement="left"
                                     class="logo-btn">
                                    <Icon custom="custom custom-clue"
                                          size="20"
                                          @click="showCrmOrClue"
                                          style="cursor: pointer;"></Icon>
                            </Tooltip>
                            <Tooltip v-else-if="status==102"
                                     :content="$t('clue.inquiry')"
                                     placement="left"
                                     class="logo-btn">
                                    <Icon custom="custom custom-inquiry"
                                          size="20"
                                          @click="showCrmOrClue"
                                          style="cursor: pointer;">
                                    </Icon>
                            </Tooltip>
                        </span>
                    </div>
                    <div style="padding: 15px 10px 15px 30px;"
                         class="InfoList">
                        <web-line :type="'chat'"
                                  :currentTab="initWebLine"
                                  :companyId="''"
                                  :visitorId="currVisitorId"
                                  :date="''"></web-line>
                    </div>
                </div>
            </div>
        </Drawer>
        <!-- 线索/询盘详情 -->
        <Drawer :visible.sync="isShowTinyDetail"
                size="380px"
                :modal="false"
                :modal-append-to-body="false"
                class-name="split-chat-info"
                @close="closeCrmOrClueDetail(false)">
                <ClueDetail v-if="currVisitorType === 'clueType'"
                            from="xhl-chat"
                            originalType="xhl-chat"
                            :clueId="currClueId"></ClueDetail>
                <InquiryDetail v-else-if="currVisitorType === 'crmType'"
                               from="xhl-chat"
                               originalType="xhl-chat"
                               colSpan="24"
                               :inquiryId="currInquiryId"
                               :companyId="currCompanyId"></InquiryDetail>
        </Drawer>
    </div>
</template>

<script>
    import chatList from './components/chat-list.vue';
    import chatFrame from '@/views/xhl-chat/components/chat-frame.vue';
    // import chatInfo from '@/views/xhl-chat/components/new-chat-info.vue';
    import ClueDetail from '@/views/main-components/tiny-detail/clue-detail/ClueDetail';
    import InquiryDetail from '@/views/main-components/tiny-detail/Inquiry-detail/InquiryDetail';
    import webLine from '@/views/main-components/timeline/web-interaction/web-line.vue';
    import { mapState } from 'vuex';

    export default {
        name: 'splitScreen',
        components: {
            chatList,
            chatFrame,
            // chatInfo,
            ClueDetail,
            InquiryDetail,
            webLine
        },
        props: {
            isFixed: {}
        },
        computed: {
            ...mapState({
                currInterface: state => state.currInterface,
                currVisitorId: state => state.currVisitorId,
                ipAddress: state => state.visitorBaseInfo.ipAddress,
                orgId: 'enterpriseId',
                currClueId: 'currClueId',
                currInquiryId: 'currInquiryId',
                currCompanyId: 'currCompanyId',
                currVisitorType: 'currVisitorType',
                isShowTinyDetail: 'isShowTinyDetail',
                isServerOnlineChecked: 'isServerOnlineChecked'
            })
        },
        data() {
            return {
                browserTip: '',
                osInfoTip: '',
                status: '1',
                value1: false,
                isEnterClue: false,
                isEnterInquiry: false,
                // currInterface:'splitChatList',
                isShortcutsShow: false,
                initWebLine: ''
            };
        },
        methods: {
            /**
             * @Date: 2020-04-30 18:20:51
             * @LastEditors: niumkiki
             * @description: 修改--分屏弹窗显示逻辑
             * @param :
             * @return:
             */
            changeStatus(status) {
                console.log('changeStatus', status);
                this.status = status;
            },
            enterClue() {
                this.$refs.chatFrame.changeModel();
            },
            showCrmOrClue() {
                this.$refs.chatFrame.showCrm();
            },
            closeCrmOrClueDetail() {
                this.$store.state.isShowTinyDetail = false;
            },
            closeDrawer() {
                this.value1 = false;
            },
            getIP() {
                return this.$store.state.visitorBaseInfo.ipAddress || this.$t('chat.notHave');
            },
            browser() {
                switch (this.$store.state.visitorBaseInfo.browser) {
                    case 'AO':
                    case 'AS':
                    case 'BR':
                    case 'CC':
                    case 'CD':
                    case 'CF':
                    case 'CH':
                    case 'CI':
                    case 'CM':
                    case 'CN':
                    case 'CP':
                    case 'CR':
                    case 'IR':
                    case 'PT':
                        this.browserTip = 'chrome';
                        return '#custom-chrome';
                    case '36':
                    case '3B':
                        this.browserTip = '360';
                        return '#custom-360';
                    case 'MF':
                    case 'SF':
                    case 'SA':
                        this.browserTip = 'safari';
                        return '#custom-safari';
                    case 'WF':
                    case 'SX':
                    case 'PX':
                    case 'MB':
                    case 'FM':
                    case 'FF':
                    case 'FE':
                    case 'FB':
                    case 'EI':
                    case 'CU':
                        this.browserTip = 'firefox';
                        return '#custom-Firefox';
                    case 'OP':
                    case 'OO':
                    case 'ON':
                    case 'OM':
                    case 'OI':
                        this.browserTip = 'opera';
                        return '#custom-opera';
                    case 'IE':
                    case 'IM':
                        this.browserTip = 'IE';
                        return '#custom-IE';
                    case 'BD':
                    case 'BS':
                        this.browserTip = 'Baidu';
                        return '#custom-baidu';
                    default:
                        this.browserTip = '';
                        return '';
                }
            },
            osInfo() {
                /* 'Windows'、'Android'、 'iPhone'、'IPad'、'Mac'、'Lunix'、'Unix' */
                switch (this.$store.state.visitorBaseInfo.osInfo) {
                    case 'WCE':
                    case 'WIN':
                    case 'WIO':
                    case 'WMO':
                    case 'WPH':
                    case 'WRT':
                        this.osInfoTip = 'Windows';
                        return '#custom-windows';
                    case 'AND':
                    case 'CYN':
                    case 'MCD':
                    case 'MLD':
                    case 'REM':
                    case 'RZD':
                    case 'YNS':
                        this.osInfoTip = 'Android';
                        return '#custom-android';
                    case 'IOS':
                        this.osInfoTip = 'IOS';
                        return '#custom-ios';
                    default:
                        this.osInfoTip = '';
                        return '';
                }
            },
            handleFixed() {
                this.$emit('changeFixState', true);
            },
            handleUnFixed() {
                this.$emit('changeFixState', false);
            },
            handleWindowClose() {
                this.$store.commit('setNotChattingWithUnreadCollect', []);
                this.$emit('windowClose');
            },
            handleSwitchInterface(val) {
                console.log('page');
                console.log(val);
                this.$store.commit('updateCurrInterface', val);
            },
            handleInfo(status) {
                this.status = status;
                this.value1 = true;
            }
        },
        watch: {
            currInterface(val) {
            },
            value1: {
                handler(val) {
                    if (val) {
                        // 显示访客历史详情 drawer 时, 重新请求访客历史数据
                        this.initWebLine = '';
                        this.$nextTick(() => {
                            this.initWebLine = 'web-line';
                        });
                    }
                }
            },
            isServerOnlineChecked: {
                handler(val) {
                    if (!val) {
                        // 显示聊天列表
                        this.$store.commit('updateCurrInterface', 'splitChatList');
                        // 重置当前聊天的未读消息
                        if (this.$store.state.nim) {
                            this.$store.state.nim.setCurrSession('');
                        }
                        // 关闭详情页
                        this.closeCrmOrClueDetail();
                        this.closeDrawer();
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style>
    @import "./components/new-chat-info.css";

    .chat-split-screen {
        height: calc(100vh - 60px);
    }

    .chat-split-screen .ivu-drawer-content {
        top: 0 !important;
    }

    .chat-split-list-container {
        position: relative;
        height: calc(100% - 36px);
    }

    .split-chat-info .ivu-drawer-close {
        right: 10px;
        top: 18px;
    }

    .split-chat-info .ivu-drawer-body {
        height: 100% !important;
        overflow-y: hidden !important;
    }
</style>
