<template>
    <Row
        class="fb-chat"
        :style="`height:${bodyHeight}px`"
        v-loading="fbChatLoading"
    >
        <Col :style="`width: ${littleDrawerVisible || chatVerbalList ? (menuExpand ? '61.1111%': '63.7777%' ) : '100%'}`"
            :span="
                chatBoxSpan
                    ? chatBoxSpan
                    : ((inquiryId || clueId) && showDetail) ||
                    littleDrawerVisible ||
                    chatVerbalList ||
                    locusSideStatus.length > 0
                    ? 14
                    : 24
            "
        >
            <chat-box
                ref="chatBox"
                :message-list="messageList"
                :adId="adId"
                :conversation-id="conversationId"
                :conversation="conversation"
                :page-avatar="pageAvatar"
                :nodealPageAvatar="nodealPageAvatar"
                :currentNodealCoversationAvatar="currentNodealCoversationAvatar"
                :page-id="pageId"
                :page-name="pageName"
                :binding-user-id="bindingUserId"
                :websocket-chat="websocketChat"
                :companyId="companyId"
                :inquiry_id="inquiryId"
                :clue_id="clueId"
                :showDetail="showDetail"
                @handleSendMessage="handleSendMessage"
                @updateConversationStatus="updateConversationStatus"
                @updateConversationClueStatus="updateConversationClueStatus"
                @updateRemark="updateRemark"
                @changeShowDetail="toggleShowLittleDrawer"
                @updateClueId="updateClueId"
                @get_cor_inquiry="get_cor_inquiry"
                @getInquiryIdByFaceBookId="getInquiryIdByFaceBookId"
                @getCompanyIdByClueId="getCompanyIdByClueId"
                :small-or-large="
                    (companyId || clueId) && showDetail ? 'small' : 'large'
                "
            ></chat-box>
        </Col>
        <!-- <Col :span="10" v-if="clueId && !inquiryId && showDetail">
            <clue-detail
                :clue-id="clueId"
                @changeShowDetail="changeShowDetail"
                originalType="Fb-chat"
            ></clue-detail>
        </Col>
        <Col :span="10" v-else-if="inquiryId && showDetail">
            <inquiry-detail
                :inquiryId="inquiryId"
                :companyId="companyId"
                @changeShowDetail="changeShowDetail"
                originalType="Fb-chat"
            ></inquiry-detail>
        </Col> -->
         <Col :span="10" style="width:35%" v-show="littleDrawerVisible">
            <littleDrawer 
                :visible="littleDrawerVisible"
                :id="conversationId"
                :currAccountInfo="conversation"
                :selectOptions="selectOptions"
                :corp_columns_authorized="corp_columns_authorized"
                :inquiry_columns_authorized="inquiry_columns_authorized"
                :contact_columns_authorized="contact_columns_authorized"
                type="journeyDetail"
                from="fb_chat"
                @littleDrawerHidden="littleDrawerHidden"
                @updateConversationStatus="updateConversationStatus"
                @updateConversationClueStatus="updateConversationClueStatus"
                @updateClueId="updateClueId"
            ></littleDrawer>
         </Col>
        <!-- <Col :span="9"
            v-if="locusSideStatus.length > 0"
            :style="`position: absolute;top: 0;right: 0; height: 100%; z-index: ${
                (inquiryId && showDetail) ||
                (clueId && !inquiryId && showDetail) ||
                chatVerbalList
                    ? '-1'
                    : 'auto'
            }`"
        >
             <Tabs v-if="locusSideList.length > 0" v-model="locusSideName" class="mutual-tab">
                <TabPane
                    v-for="item in locusSideList"
                    :key="item.key"
                    :name="item.key"
                    :label="item.value"
                >
                </TabPane>
            </Tabs>
           <component
                :is="locusSideName"
                :visitorList="visitorList"
                :whatsAppRelatedInfo="whatsAppRelatedInfo"
            ></component>
        </Col> -->
        <Col :span="10" 
            v-show="chatVerbalList"
            :style="`width: ${menuExpand ? '38%' : '36%'};height: 100%; position: relative;`"
        >
            <transition name="slide-fade">
                <short-cuts
                    @letShortcutsShow="shortCutsShow"
                    @verbalSelected="selVerbal"
                    :controVerbalIcon="controVerbalIcon"
                ></short-cuts>
            </transition>
        </Col>
    </Row>
</template>
<script>
import util from '@/libs/util';
import { mapState } from 'vuex';

import ChatBox from './components/ChatBox';
import shortCuts from '@/views/main-components/Shortcuts.vue';
// import ClueDetail from '@/views/main-components/tiny-detail/clue-detail/ClueDetail';
// import InquiryDetail from '@/views/main-components/tiny-detail/Inquiry-detail/InquiryDetail';
import LocusSide from '../components/LocusSide';
import WhatsAppRelatedRecords from '@/views/whatsapp-manage/components/whatsAppRelatedRecords.vue';
import littleDrawer from '@/views/main-components/little-drawer/little-drawer.vue';

export default {
    name: 'FbChat',
    props: {
        bindingUserId: {},
        conversation: {
            type: Object,
            default() {
                return {};
            }
        },
        conversationId: {
            type: String,
            default: '',
            required: true
        },
        pageAvatar: {
            type: String,
            default: '',
            required: true
        },
        nodealPageAvatar: {
            type: String,
            default: '',
            required: true
        },
        currentNodealCoversationAvatar: {
            type: String,
            default: '',
            required: true
        },
        pageId: {
            type: String,
            default: '',
            required: true
        },
        pageName: {
            type: String,
            default: ''
        },
        letChatLoading: {
            type: Boolean,
            default: false
        },
        websocketChat: {
            type: Object,
            default() {
                return {};
            }
        },
        selectOptions: {
            type: Object,
            default() {
                return {};
            }
        },
        // 客户表单数据
        corp_columns_authorized: {
            type: Object,
            default() {
                return {};
            }
        },
        // 联系人表单数据
        contact_columns_authorized: {
            type: Object,
            default() {
                return {};
            }
        },
        // 询盘表单数据
        inquiry_columns_authorized: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    components: {
        shortCuts,
        ChatBox,
        // ClueDetail,
        // InquiryDetail,
        LocusSide,
        WhatsAppRelatedRecords,
        littleDrawer
    },
    data() {
        return {
            // 弹窗新增
            littleDrawerVisible: false,
            controVerbalIcon: 0,
            verbalShow: false,
            fbChatLoading: true,
            messageList: [],
            adId: '',
            selectShortcuts: {},
            clueId: '',
            companyId: 0,
            chatBoxSpan: 0, // chatBox所占的span
            showDetail: false,

            /* 右上角显示询盘或操作 */
            show_operate: false,
            inquiryId: undefined,
            inquirySeqNumber: undefined,
            flag_inquiry_id_requested: false, // 询盘 ID 请求完成
            visitorList: [],
            locusSideStatus: [],
            whatsAppRelatedInfo: [],
            locusSideList: [],
            locusSideName: ''
        };
    },
    computed: {
        ...mapState({
            enterpriseId: (state) => state.enterpriseId,
            window_height: (state) => state.window_height,
            chatVerbalInfo: (state) => state.chatVerbalInfo,
            chatVerbalList: 'chatVerbalList',
            fbChatEmailAutoAssociate: state => state.facebook.fbChatEmailAutoAssociate,
            fbChatStatus: (state) => state.fbChatStatus,
            menuExpand: state => state.menuExpand
        }),
        bodyHeight() {
            const temp = this.window_height
                ? this.window_height - 60
                : document.body.clientHeight - 60;
            return temp > 200 ? temp : 200;
        }
    },
    methods: {
        // 获取facebook 和 主页关联关系
        getLocusSideStatus() {
            // if (this.conversationId && this.enterpriseId) {
            util.ajaxJson({
                url: `/crm/visitorRelation/getVisitorRelated/message`,
                method: 'get',
                params: {
                    orgId: this.enterpriseId,
                    messageIds: this.conversationId
                }
            })
            .then((res) => {

                if (Object.keys(res.data.data).length > 0) {
                    const tab = [];
                    Object.keys(res.data.data).forEach((item, index) => {
                        switch (item) {
                            case '1':
                                if (res.data.data[item].length > 0) {
                                    this.visitorList = res.data.data[
                                        item
                                    ].map((cItem) => ({
                                        key: cItem.targetId,
                                        value: cItem.visitorName
                                    }));
                                    tab.push('visitor');
                                }
                                break;
                            case '2':
                                break;
                            case '10':
                                if (res.data.data[item].length > 0) {
                                    this.whatsAppRelatedInfo = res.data.data[item].map(item => ({
                                        chatWaAccount: item.targetId,
                                        userBindWaAccount: item.userBindWaAccount
                                    }));
                                    tab.push('whatsapp');
                                }
                                break;

                            default:
                                break;
                        }
                    });
                    switch (tab[0]) {
                        case 'visitor':
                            this.locusSideName = 'LocusSide'
                            break;
                        case 'whatsapp':
                            this.locusSideName = 'WhatsAppRelatedRecords'
                            break;
                        default:
                            this.locusSideName = 'LocusSide'
                            break;
                    }
                    this.locusSideStatus = [...tab];

                    let result = []
                    if (tab.some((item) => item === 'visitor')) {
                            result.push({
                                value: this.$t('visitor_history.webInteract'),
                                key: 'LocusSide'
                            });
                    } else {
                        result = result.filter((item) => item.key !== 'LocusSide');
                    }
                    if (tab.some((item) => item === 'whatsapp')) {
                        result.push({
                            value: this.$t(
                                'visitor_history.whatsappInteraction'
                            ),
                            key: 'WhatsAppRelatedRecords'
                        });
                    } else {
                        result = result.filter(
                            (item) => item.key !== 'WhatsAppRelatedRecords'
                        );
                    }
                    this.locusSideList = [...result];
                    console.log('ccm', this.locusSideList)

                }
            })
            .catch((error) => {
                console.log('derek', error);
                this.$message.error(error);
            });
            // }
        },
        // 获取fb标签
        // getAdIdByPageIdAndConversationId() {
        //     util.ajaxInternational({
        //         url: '/social/getAdIdByPageIdAndConversationId',
        //         method: 'post',
        //         data: {
        //             pageId: this.pageId,
        //             conversationId: this.conversationId
        //         }
        //     }).then(response => {
        //         if (response.data.code === '1') {
        //             console.log('获取fb标签');
        //             this.adId = response.data.data
        //         }
        //     });
        // },
        // 获取点击的话术信息
        selVerbal(item) {
            this.$store.state.chatVerbalInfo.push(item.content.verbalContent);
        },
        // 控制话术开关
        shortCutsShow(val) {
            this.$store.state.chatVerbalList = val;
        },
        // 获取会话内容和备注
        getMessagesAndRemarks() {
            this.fbChatLoading = true;
            util.ajaxInternational({
                url: '/social/getMessagesAndRemarksByConversationId',
                method: 'post',
                data: {
                    conversationId: this.conversationId
                }
            }).then((response) => {
                if (response.data.code === '1') {
                    this.fbChatLoading = false;
                    const dataList = response.data.data.messages;
                    this.messageList = dataList.concat();
                }
            });
        },
        // 主动发送消息会话列表顺序改变
        handleSendMessage(val) {
            this.$emit('handleSendMessage', val);
        },
        // 根据线索id查客户id
        getCompanyIdByClueId() {
            util.ajax({
                url: '/crm/entityRelation/getCompanyIdByClueId?',
                method: 'post',
                data: {
                    orgId: this.enterpriseId,
                    clueId: this.clueId
                }
            }).then((response) => {
                if (response.data.code === '1') {
                    if (response.data.data.companyId) {
                        this.companyId = response.data.data.companyId;
                    }
                }
            });
        },

        // 通过conversationId获取询盘id
        getInquiryIdByFaceBookId() {
            util.ajaxJson({
                url: '/crm/auto/getinquiryIdByFaceBookId',
                method: 'post',
                params: {
                    orgId: this.enterpriseId,
                    targetType: 1,
                    targetId: this.conversationId
                }
            })
                .then((res) => {
                    if (res.data.code === '1') {
                        this.inquiryId = res.data.data[0];
                        this.$store.commit(
                            'setAssosiatedInquiryId',
                            res.data.data[0]
                        );
                    } else {
                        this.$store.commit('setAssosiatedInquiryId', '');
                    }
                })
                .catch((erro) => {
                    this.$store.commit('setAssosiatedInquiryId', '');
                });
        },
        // 获取与线索对应的询盘 Id 和 seqNumber , 如果有的话
        get_cor_inquiry() {
            this.inquiryId = undefined;
            this.inquirySeqNumber = undefined;
            this.flag_inquiry_id_requested = false;
            util.ajaxJson({
                url: '/crm/inquiry/getInquirySeqList',
                method: 'post',
                data: {
                    clueIdList: [this.clueId]
                }
            })
                .then((res) => {
                    if (res.data.code === '1') {
                        if (res.data.data[this.clueId]) {
                            this.inquirySeqNumber =
                                res.data.data[this.clueId].seqNumber;
                            this.inquiryId =
                                res.data.data[this.clueId].inquiryId;
                            this.$emit('changeChatCurrentStatus', 102);
                        }
                    } else {
                        this.$Message.error(
                            this.$t('clue.error_getClueStatus')
                        );
                    }
                    this.flag_inquiry_id_requested = true;
                })
                .catch((erro) => {
                    this.$Message.error(this.$t('clue.error_getClueStatus'));
                });
        },
        updateConversationStatus(status) {
            this.$store.state.chatVerbalList = false;
            this.$emit('updateConversationStatus', status);
        },
        updateConversationClueStatus(status) {
            this.$store.state.chatVerbalList = false;
            this.$emit('updateConversationClueStatus', status);
        },
        updateRemark(data) {
            this.$emit('updateRemark', data);
        },
        changeShowDetail(isShow) {
            console.log('changeShowDetail()');
            this.showDetail = isShow;
            if (isShow || this.locusSideStatus.length > 0) {
                this.chatBoxSpan = 0;
            } else {
                this.chatBoxSpan = 24;
            }
            /**
             * @Date: 2020-05-06 14:42:10
             * @LastEditors: niumkiki
             * @description: 修改fb聊天弹窗弹出逻辑
             * @param :
             * @return:
             */
            this.clueId = this.conversation.clue_id;
            if (this.clueId) {
                this.getCompanyIdByClueId();
                this.get_cor_inquiry();
            }
            this.getInquiryIdByFaceBookId();
        },
        /* 录入线索完成后更新clueId */
        updateClueId(id) {
            if (id) {
                this.clueId = id;
                this.get_cor_inquiry();
                this.$emit('updateCurrentConversation', this.clueId);
            }
        },
        onVisibilityChange() {
            // 不同浏览器 hidden 名称
            const hiddenProperty =
                'hidden' in document
                    ? 'hidden'
                    : 'webkitHidden' in document
                    ? 'webkitHidden'
                    : 'mozHidden' in document
                    ? 'mozHidden'
                    : null;
            if (!document[hiddenProperty]) {
                this.getMessagesAndRemarks();
                // this.getAdIdByPageIdAndConversationId()
                // 切换页面后获取当前对话的状态是否有改变
                if (this.clueId) {
                    this.getCompanyIdByClueId();
                    this.get_cor_inquiry();
                }
            } else {
                console.log('窗口切换了');
            }
        },
        // 小右侧框组件
        toggleShowLittleDrawer(){
            console.log('toggleShowLittleDrawertoggleShowLittleDrawertoggleShowLittleDrawer')
            this.littleDrawerVisible = !this.littleDrawerVisible;
        },
        littleDrawerHidden(val){
            // this.$store.state.chatView = true;
            this.littleDrawerVisible = val;
        },
    },
    created() {
        if (this.conversationId) {
            this.getMessagesAndRemarks();

            // this.getAdIdByPageIdAndConversationId()
            this.$store.commit('setAssosiatedInquiryId', '');
            if (
                this.conversation.clue_status &&
                this.conversation.clue_status !== 101 &&
                this.conversation.clue_status !== 102
            ) {
                // this.getLocusSideStatus();
                // this.clueId = this.conversation.clue_id;
                // if (this.clueId) {
                //     this.get_cor_inquiry();
                //     this.getCompanyIdByClueId();
                // }
                // this.getInquiryIdByFaceBookId();
            }
        }
        // 不同浏览器 hidden 名称
        const hiddenProperty =
            'hidden' in document
                ? 'hidden'
                : 'webkitHidden' in document
                ? 'webkitHidden'
                : 'mozHidden' in document
                ? 'mozHidden'
                : null;
        // 不同浏览器的事件名
        const visibilityChangeEvent = hiddenProperty.replace(
            /hidden/i,
            'visibilitychange'
        );
        document.addEventListener(
            visibilityChangeEvent,
            this.onVisibilityChange
        );
    },
    beforeDestroy() {
        // 不同浏览器 hidden 名称
        const hiddenProperty =
            'hidden' in document
                ? 'hidden'
                : 'webkitHidden' in document
                ? 'webkitHidden'
                : 'mozHidden' in document
                ? 'mozHidden'
                : null;
        // 不同浏览器的事件名
        const visibilityChangeEvent = hiddenProperty.replace(
            /hidden/i,
            'visibilitychange'
        );
        document.removeEventListener(
            visibilityChangeEvent,
            this.onVisibilityChange
        );
    },
    activated() {
        this.getMessagesAndRemarks();
    },
    watch: {
        conversationId: {
            handler(newVal, oldVal) {
                // if (oldVal !== newVal && newVal !== '' && this.conversation.clue_status &&
                // this.conversation.clue_status !== 101 &&
                // this.conversation.clue_status !== 102) {

                //     this.getLocusSideStatus();
                // }
                if (oldVal !== newVal && newVal !== '') {
                    this.littleDrawerVisible = true;
                    //this.getLocusSideStatus();
                }else{
                    this.littleDrawerVisible = false;
                }
            },
            immediate: true,
            deep: true
        },
        fbChatEmailAutoAssociate(val) {
            console.log('fbChatEmailAutoAssociate', val);
            if (val) {
                // this.getInquiryIdByFaceBookId();
                // this.updateConversationClueStatus(102);
                this.$store.commit('setFbChatEmailAutoAssociate', false);
            }
        },
        // conversationId() {
        //
        //     this.getMessagesAndRemarks();
        //     // this.getAdIdByPageIdAndConversationId()
        //     console.log('123');
        //     this.$store.commit('setAssosiatedInquiryId', '');
        //     if (
        //         this.conversation.clue_status === 101 ||
        //         this.conversation.clue_status === 102
        //     ) {
        //         this.clueId = this.conversation.clue_id;
        //         // if (this.clueId) {
        //         //     this.getCompanyIdByClueId();
        //         //     this.get_cor_inquiry();
        //         // }
        //         // this.getInquiryIdByFaceBookId();
        //     }
        //     if (this.conversation.clue_status &&
        //         this.conversation.clue_status !== 101 &&
        //         this.conversation.clue_status !== 102) {
        //         this.getLocusSideStatus();
        //     }
        // },
        letChatLoading(val) {
            this.fbChatLoading = val;
        },
        // locusSideStatus: {
        //     handler(val) {
        //
        //         if (val.length > 0) {
        //             ;
        //             let tab = [];
        //             if (val.some((item) => item === 'visitor')) {
        //                 tab.push({
        //                     value: this.$t('visitor_history.webInteract'),
        //                     key: 'LocusSide'
        //                 });
        //             } else {
        //                 tab = tab.filter((item) => item.key !== 'LocusSide');
        //             }
        //             if (val.some((item) => item === 'whatsapp')) {
        //                 tab.push({
        //                     value: this.$t(
        //                         'visitor_history.whatsappInteraction'
        //                     ),
        //                     key: 'whatsAppRelatedRecords'
        //                 });
        //             } else {
        //                 tab = tab.filter(
        //                     (item) => item.key !== 'whatsAppRelatedRecords'
        //                 );
        //             }
        //             console.log(tab)
        //
        //             this.locusSideList = tab;
        //         }
        //     },
        //     immediate: true,
        //     deep: true
        // }
    }
};
</script>
<style lang="less" scoped>
.fb-chat {
    .ivu-col {
        height: 100%;
    }
    /deep/ .followup-edit {
        display: none !important;
    }
    /deep/ .el-col-14 {
        border-right: 1px solid rgb(232, 232, 232);
    }
}

/deep/ .ivu-upload-drag:hover {
    border: none;
}

/deep/ .ivu-upload-drag {
    border: none !important;
}

.split-chat-info {
    position: absolute;
    top: 0;
    right: 0;
}

/deep/ .input-panel-bottom {
    display: flex;
    align-items: center;

    span:first-child {
        width: 30px;
    }

    .ivu-select {
        margin: 0 5px;
    }
}
.mutual-tab{
    padding: 10px 20px;
}
</style>
