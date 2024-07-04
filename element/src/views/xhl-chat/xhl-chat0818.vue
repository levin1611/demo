<template>
    <div class="top-height" style="position: relative;">
        <div class="top-height">
            <Row class="fullwindow">
                <!-- 左侧聊天列表 -->
                <Col :span="6"
                     style="position: relative"
                     class="top-height">
                    <Spin fix v-show="isSDKconnect">
                        <div v-if="notConnect && hasChatAuthority">
                            <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
                            <div>{{$t('chat.loading')}}</div>
                        </div>
                        <div v-else style="font-size: 12px;color: rgba(0,0,0,0.80);">
                            <div v-if="hasChatAuthority">{{$t('chat.onlineTip')}}<br>
                                <span class="switch-chat-online" @click="switchChatState">{{$t('chat.onlineTip1')}}</span>
                            </div>
                            <div v-else>{{$t('chat.onlineTip2')}}</div>
                        </div>
                    </Spin>
                    <chat-list source="FullScreen"></chat-list>
                </Col>
                <Col :span="18"
                     style="position: relative"
                     class="top-height">
                    <!-- 聊天框 -->
                    <Col v-show="chatViewStatus2"
                        :span="littleDrawerVisible ? 14 : 24"
                        :style="`width: ${littleDrawerVisible || isShowVerbal ? (menuExpand ? '61.1111%': '63.7777%' ) : '100%'}`"
                        style="position: relative"
                        class="top-height main-style">
                        <chat-frame 
                            source="FullScreen"
                            @toggleShowLittleDrawer="toggleShowLittleDrawer"
                        ></chat-frame>
                    </Col>
                    <!-- 访客信息 -->
                    <Col v-show="littleDrawerVisible || isShowVerbal"
                        :span="10" :style="`width: ${menuExpand ? '38%' : '36%'}`"
                        class="top-height chat-info">
                        <littleDrawer 
                            :visible="littleDrawerVisible"
                            :id="currVisitorId"
                            :selectOptions="selectOptions"
                            :corp_columns_authorized="corp_columns_authorized"
                            :inquiry_columns_authorized="inquiry_columns_authorized"
                            :contact_columns_authorized="contact_columns_authorized"
                            type="journeyDetail"
                            from="xhl_chat"
                            @littleDrawerHidden="littleDrawerHidden"
                        ></littleDrawer>
                        <transition name="slide-fade" v-show="isShowVerbal">
                            <!--全屏时话术-->
                            <short-cuts
                                v-show="isShowVerbal"
                                :controVerbalIcon="controVerbalIcon"
                                @letShortcutsShow="shortCutsShow"
                                @verbalSelected="selVerbal"
                                content_height="100%"
                            ></short-cuts>
                        </transition>
                    </Col>
                    <!-- <Col
                        :span="10"
                        style="width:38%"
                        class="top-height chat-info">
                        
                    </Col> -->
                                            
                    <!-- 无聊天时显示的空白界面 -->
                    <Col v-show="chatViewStatus"
                        :span="24"
                        style="border-left: 1px solid #e8e8e8;position: relative"
                        class="top-height">
                        <div class="init-chat">
                            <svg class="login-svg-icon" style="width: 200px;height: 90px" aria-hidden="true">
                                <use xlink:href="#custom-main-logo"></use>
                            </svg>
                            <p>{{chatView}}{{$t('chat.tip')}}</p>
                        </div>
                    </Col>
                </Col>
            </Row>
        </div>
        <Modal
                :visible.sync="chatTransfer"
                :title="$t('chat.TransferTittle')"
                width="500"
                :show-close="false"
                :close-on-click-modal="false"
                :close-on-press-escape="false"
                :append-to-body="true"
                :modal-append-to-body="false"
                class="modal companydata">
            <div>{{ transferInfo }} {{ acceptTimeCount }}s...</div>
            <div slot="footer">
                <Button @click="refuseTransfer">{{$t('chat.refuseBtn')}}</Button>
                <Button type="primary" @click="acceptTransfer">{{$t('chat.acceptBtn')}}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import chatList from './components/chat-list.vue';
    import chatFrame from './components/chat-frame.vue';
    import chatInfo from './components/new-chat-info0818.vue';
    import littleDrawer from '@/views/main-components/little-drawer/little-drawer.vue';
    import Spin from '../main-components/spin/spin.vue';
    import store from '@/store';
    import util from '../../libs/util';
    import Cookies from 'js-cookie';
    import shortCuts from '@/views/main-components/Shortcuts.vue';
    import { mapState } from 'vuex';

    export default {
        name: 'xhl_chat',
        components: {
            chatList,
            chatFrame,
            chatInfo,
            Spin,
            shortCuts,
            littleDrawer
        },
        computed: {
            ...mapState({
                isSwitchChatState: state => state.isSwitchChatState,
                isReloadServerList: state => state.isReloadServerList,
                userId: state => state.userId,
                orgId: state => state.enterpriseId,
                currVisitorId: state => state.currVisitorId,
                isShowVerbal: 'isShowVerbal',
                menuExpand: state => state.menuExpand
                
            }),
            isSDKconnect() {
                if (this.$store.state.isServerOnlineChecked) {
                    this.notConnect = true;
                    this.$store.state.chatView = true;
                    if (!this.hasChatAuthority) {
                        return true;
                    } else {
                        return this.$store.state.isSDKconnect;
                    }
                } else {
                    this.notConnect = false;
                    this.$store.state.chatView = true;
                    return true;
                }
            },
            // 接收转接通知的提示框
            chatTransfer() {
                if (this.$store.state.chatTransfer) {
                    // 计时器
                    this.setAcceptTime();
                }
                return this.$store.state.chatTransfer;
            },
            chatView() {
                const hour = new Date().getHours();
                if (hour >= 0 && hour < 6) {
                    return this.$t('chat.tip1');
                } else if (hour >= 6 && hour < 9) {
                    return this.$t('chat.tip1');
                } else if (hour >= 9 && hour < 12) {
                    return this.$t('chat.tip3');
                } else if (hour >= 12 && hour < 14) {
                    return this.$t('chat.tip4');
                } else if (hour >= 14 && hour < 17) {
                    return this.$t('chat.tip5');
                } else if (hour >= 17 && hour < 19) {
                    return this.$t('chat.tip6');
                } else {
                    return this.$t('chat.tip7');
                }
            },
            chatViewStatus() {
                console.log(`chatView=${this.$store.state.chatView}`);
                if (this.$store.state.chatView) {
                    this.$store.state.currVisitorId = null;
                }
                return this.$store.state.chatView;
            },
            chatViewStatus2(){
                return !this.$store.state.chatView;
            },
            transferInfo() {
                const data = this.$store.state.transferInfo;
                return `${this.$t('openBracket')}${data.callTransferServerName}${this.$t('chat.transferTxt')}${data.customerName}${this.$t('chat.transferTxt1')}`;
            }
        },
        watch:{
            currVisitorId: {
                handler(val) {
                    if(val){
                        this.littleDrawerVisible = true;
                    }else{
                        this.littleDrawerVisible = false;
                    }
                    // this.refresh = false;
                    // this.current_compo = 'VisitorTrackLine';
                    // this.initWebLine = '';
                    // this.$nextTick(() => {
                    //     this.refresh = true;
                    // });
                },
                immediate: true
            },
            littleDrawerVisible(val){
                console.log(val)
            }
        },
        /** keep-alive  生命周期函数每次进入页面都有 不管是否缓存了组件 */
        activated() {},
        data() {
            return {
                controVerbalIcon: 0,
                littleDrawerVisible: false,
                notConnect: true,
                isOpenPhotogallery: false,
                imgEvent: {},
                acceptTimeCount: '',
                acceptTimer: null,
                hasChatAuthority: true,
                // 录入询盘所需字段
                /* 对接权限系统 */
                corp_columns_authorized: {}, // 公司所有字段
                contact_columns_authorized: {}, // 联系人所有字段
                inquiry_columns_authorized: {}, // 询盘所有字段
                selectOptions:{}
            };
        },
        created: function() {
            this.getAllVisitorType();
            this.getCrmFields();
            this.init();
            // 获取正在聊天cookie
            if (Cookies.get('notChatWithOther')) {
                this.$store.commit('confirmNotChatWithOther', true);
            }
        },
        methods: {
            switchChatState() {
                this.$store.state.isSwitchChatState = 'Login';
            },
            img_open_close(data) {
                this.$store.commit('setIsFullscreenImgShow', data);
            },
            init() {
                util.ajax({
                    url: `/new-privilege/user/get?id=${this.userId}`,
                    method: 'POST'
                }).then(res => {
                    if (res.data.code === '1' && res.data.data) {
                        this.hasChatAuthority = res.data.data.canChat === 1;
                        // 当没有聊天权限（开启聊天的过程中权限被修改的情况），且客服在线时，需退出聊天
                        if (!this.hasChatAuthority && this.$store.state.isServerOnlineChecked) {
                            //                            this.isOnline(false,1,1);
                            this.$store.state.isSwitchChatState = 'Logout';
                        }
                    }
                });
            },
            setAcceptTime() {
                const TIME_COUNT = 15;
                if (!this.acceptTimer) {
                    this.acceptTimeCount = TIME_COUNT;
                    console.log('this.acceptTimeCount', this.acceptTimeCount);
                    this.acceptTimer = setInterval(() => {
                        if (this.acceptTimeCount > 0 && this.acceptTimeCount <= TIME_COUNT) {
                            this.acceptTimeCount--;
                        } else {
                            //                            this.$Message.error('对方可能不在，请稍后再试~')
                            this.$store.state.chatTransfer = false;
                            clearInterval(this.acceptTimer);
                            this.acceptTimer = null;
                        }
                    }, 1000);
                }
            },
            /* 获取企业下所有分类 */
            getAllVisitorType() {
                util.ajaxInternational({
                    url: '/server/getAllVisitorType',
                    method: 'post',
                    data: {
                        enterpriseId: this.$store.state.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$store.commit('updateAllVisitorType', response.data.data);
                    }
                });
            },
            // 接受转接
            async acceptTransfer() {
                const content = this.$store.state.transferInfo;
                await util.ajaxInternational({
                    url: '/visitor/receivedTransfer',
                    method: 'post',
                    data: {
                        callTransferServerAccId: content.callTransferServerAccId,
                        receivedTransferServerAccId: content.receivedTransferServerAccId,
                        receivedTransferServerName: content.receivedTransferServerName,
                        visitorAccid: content.visitorAccid,
                        visitorId: content.visitorId,
                        visitorName: content.customerName,
                        callTransferServerName: content.callTransferServerName
                    }
                });
                // 获得转接游客的聊天记录
                this.$store.dispatch('getTransferHistoryMsgs', {
                    visitorId: content.visitorId,
                    visitorAccid: content.visitorAccid,
                    visitorName: content.customerName,
                    callTransferServerName: content.callTransferServerName
                });
                // 标记这个游客正在聊天
                this.$store.commit('updataIsChatting', {
                    account: content.visitorAccid,
                    type: 1
                });
                // 订阅该访客
                this.$store.commit('subscribeEvent', content.visitorAccid);
                /**
                 * @Description: 因为 isChatWithOther 不再使用, 所以把下面这段注释了
                 * @author 汤一飞
                 * @date 2020/5/13
                */
                // 标记这个游客没有和其它人聊天
                // this.$store.commit('updateChatWithOtherList', {
                //     account: content.visitorAccid,
                //     status: false
                // });
                // 接受转接后,给该访客发送自定义消息,使其订阅自己
                store.commit('sendCustomSysMsgForSubscribesLogin', { account: content.visitorAccid });
                // 更新对话列表
                this.$store.dispatch('updateSessionList', true);
                this.$store.state.chatTransfer = false;
                clearInterval(this.acceptTimer);
                this.acceptTimer = null;
                this.$store.commit('setDisableChat', {
                    visitorId: content.visitorId,
                    flag: false
                });
                this.$store.commit('setFlagToInput', true);
            },
            // 拒绝转接
            refuseTransfer() {
                const content = this.$store.state.transferInfo;
                util.ajaxInternational({
                    url: '/visitor/refuseTransfer',
                    method: 'post',
                    data: {
                        callTransferServerAccId: content.callTransferServerAccId,
                        receivedTransferServerAccId: content.receivedTransferServerAccId,
                        visitorAccid: content.visitorAccid,
                        visitorId: content.visitorId,
                        visitorName: content.customerName,
                        callTransferServerName: content.callTransferServerName
                    }
                });
                this.$store.state.chatTransfer = false;
                clearInterval(this.acceptTimer);
                this.acceptTimer = null;
            },
            cancel() {
                this.$store.commit('setIsFullscreenImgShow', false);
            },
            toggleShowLittleDrawer(){
                this.littleDrawerVisible = !this.littleDrawerVisible;
            },
            littleDrawerHidden(val){
                // this.$store.state.chatView = true;
                this.littleDrawerVisible = val;
            },
            getCrmFields(){
                // 获取所有授权字段 + 筛选出公司/询盘/联系人授权字段 
                util.ajax({
                    url: '/crm/columnConfig/getFields',
                    method: 'get',
                    params: {
                        orgId: this.orgId,
                        userId: this.userId,
                        parentId: 0
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        // 暂存所有默认字段和自定义字段
                        const defaultFields = res.data.data && Array.isArray(res.data.data.default) ? res.data.data.default : [];
                        const customFields = res.data.data && Array.isArray(res.data.data.custom) ? res.data.data.custom : [];
                        // 筛选得到公司/询盘/联系人授权字段
                        this.$set(this.corp_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 1));
                        this.$set(this.corp_columns_authorized, 'custom', customFields.filter(col => col.parentId === 1));
                        this.$set(this.contact_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 2));
                        this.$set(this.contact_columns_authorized, 'custom', customFields.filter(col => col.parentId === 2));
                        this.$set(this.inquiry_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 3));
                        this.$set(this.inquiry_columns_authorized, 'custom', customFields.filter(col => col.parentId === 3));

                        // 默认字段加上必须要有的字段
                        if (Array.isArray(this.corp_columns_authorized.default)) {
                            // 如果没有公司名, 把公司名加进来
                            if (this.corp_columns_authorized.default.every(item => item.storageName !== 'companyName')) {
                                this.corp_columns_authorized.default.unshift({
                                    cname: this.$t('crm.Modal.corp_companyName'),
                                    colType: 'text',
                                    mustInput: 1,
                                    storageName: 'companyName',
                                    manually: true // 此属性表示: 本来没有权限, 是前端手动加上的
                                });
                            }
                        }
                        if (Array.isArray(this.inquiry_columns_authorized.default)) {
                            // 如果没有产品分类, 把公司名加进来
                            if (this.inquiry_columns_authorized.default.every(item => item.storageName !== 'productCategory')) {
                                this.inquiry_columns_authorized.default.unshift({
                                    cname: this.$t('crm.Modal.inq_productCategory'),
                                    colType: 'selectMultiple',
                                    mustInput: 1,
                                    storageName: 'productCategory',
                                    manually: true // 此属性表示: 本来没有权限, 是前端手动加上的
                                });
                            }
                        }
                        if (Array.isArray(this.contact_columns_authorized.default)) {
                            // 如果没有邮箱, 把公司名加进来
                            if (this.contact_columns_authorized.default.every(item => item.storageName !== 'email')) {
                                this.contact_columns_authorized.default.unshift({
                                    cname: this.$t('crm.Modal.contact_email'),
                                    colType: 'email',
                                    mustInput: 1,
                                    storageName: 'email',
                                    manually: true, // 此属性表示: 本来没有权限, 是前端手动加上的
                                    isOnlyRead:2
                                });
                            }
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                    }
                });
            },
            // 新建获取属性列表
            getSelectOptions() {
                return util.ajax({
                    url: '/crm/attr/getField',
                    method: 'post',
                    data: {
                        orgId: this.orgId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.selectOptions = response.data.data;
                        this.selectOptions.followUp ? this.selectOptions.followUp.unshift({
                            isAvailable: 1,
                            attrId: 0,
                            sort: 0,
                            typeId: 7,
                            attrName: this.$t('crm.UniSet.defaultFollowUpStatus_inquiry')
                        }) : undefined;
                        this.$set(this.selectOptions, 'label', this.selectOptions.tag || []);
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getSelectOptions'));
                    }
                });
            },
            shortCutsShow(val) {
                this.$store.state.isShowVerbal = val;
            },
            selVerbal(item) {
                console.log(item)
                let verbalIndex = this.$store.state.currVisitorId;
                // this.$store.state.msgToSentTemp[verbalIndex]=item.name;
                this.$store.state.msgToSentTemp[verbalIndex] = item.content.verbalContent;
                this.$store.state.msgToSentTemp = Object.assign({}, this.$store.state.msgToSentTemp);
            },
            
        },
        beforeDestroy() {
            if (this.acceptTimer) {
                clearInterval(this.acceptTimer);
                this.acceptTimer = null;
            }
            this.$store.state.isShowVerbal = false;
            if (this.$store.state.nim) {
                this.$store.state.nim.setCurrSession('');
            }
        },
        beforeRouteEnter(to, from, next) {
            // 停止页面标题闪动消息提示
            localStorage.setItem('xhlWindowClick', Date.now());
            window.parent.document.title = store.state.sourceDocumentTitle;
            store.commit('changeNewRemindFlag', false);
            next();
        }
    };
</script>
<style>
    .init-chat {
        width: 200px;
        height: 200px;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: -100px;
        margin-left: -100px;
        text-align: center;
        color: #999999;
    }

    .chat-info {
        position: relative;
    }

    .top-height, .top-height .ivu-card-body {
        height: 100%;
        padding: 0px;
    }

    .fullwindow {
        height: 100%;
        background-color: #ffffff;
    }

    .main-style {
        overflow-x: hidden;
        border-left: 1px solid #e8e8e8;
        border-right: 1px solid #e8e8e8;
    }

    .switch-chat-online {
        color: #3b78de;
        cursor: pointer;
    }

    .switch-chat-online:hover {
        color: #2d63bc;
        text-decoration: underline;
    }
</style>
