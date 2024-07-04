<template>
    <div v-loading="visitorDetailLoading" style="height: 100%;overflow-y: hidden">
        <div style="height: 100%;" v-if="mutual_list.length">
            <Tabs v-model="current_mutual" class="mutual-tab">
                <TabPane v-for="item in mutual_list"
                    :key="item.key"
                    :name="item.key"
                    :label="item.title">
                </TabPane>
            </Tabs>
            <div class="InfoList">
                    <component :is="current_mutual"
                        :companyId="''"
                        :type="type"
                        :from="from"
                        :date="''"
                        :currentTab="current_mutual"
                        :fieldObj="fieldObj"
                        :customerInfo="customerInfo"
                        :currAccountInfo="currAccountInfo"
                        :mailAddress="visitorMailAddress"
                        :visitorId="visitorMailId ? visitorMailId : visitorId"
                        :propsData="messagerData"
                        :visitorList="visitorList"
                        :whatsAppRelatedInfo="whatsAppRelatedInfo"
                        :little="true"
                        @noData="noData">
                    </component>
            </div>
        </div>
        <div class="component-wrap" v-else>
            <div class="no-data">
                <img src="@/svg/no-data.svg"
                        :alt="$t('crm.Table.customerColumnsNoData')">
                <p style="margin-top:30px;color:#000">{{ $t('crm.Table.customerColumnsNoData') }}</p>
            </div>
        </div>
    </div>
</template>

<script>
    // import tinyDetail from '../../main-components/tiny-detail/company-detail/CompanyDetail.vue';
    // import WebLine from '@/views/main-components/timeline/web-interaction/web-item-line.vue';
    import VisitorTrackLine from '@/views/xhl-chat/components/visitor-track-line.vue';
    import WebInteraction from '@/views/facebook/inbox/components/LocusSide';
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import FacebookInteractionInfo from '@/views/main-components/timeline/facebook-interaction/visitor-FacebookInteractionInfo';
    import Mail from '@/views/main-components/timeline/mail/visitor-mail';
    import whatsAppRelatedRecords from '@/views/whatsapp-manage/components/visitor-whatsApp-line.vue';

    export default {
        name: 'visitor-timeLine',
        props: ['visitorId', 'customerInfo', 'type', 'from', 'currAccountInfo', 'fieldObj'],
        components: {
            // WebLine,
            WebInteraction, // 多条webLine
            VisitorTrackLine,
            FacebookInteractionInfo,
            whatsAppRelatedRecords,
            Mail
        },
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId'
            })
        },
        watch: {
            visitorId: {
                handler(val) {
                    this.visitorDetailLoading = true;
                    this.visitorMailId = '';
                    this.visitorMailAddress = '';
                    this.getLocusSideStatus();
                },
                immediate: true
            },
            current_mutual: {
                handler(val) {
                    if (val === 'FacebookInteractionInfo') {
                        this.getMessagerData();
                    }
                },
                immediate: true
            },
            refreshCurrSession: {
                // 要求强制刷新, 则重新请求数据
                handler(val) {
                    // this.refresh = false;
                    // this.$nextTick(() => {
                    //     this.refresh = true;
                    // });
                }
            }
        },
        data() {
            return {
                // 视图切换
                visitorDetailLoading: true, // 控制详情页刷新
                mutual_list: [], // 访客 动态下的 tab 列表
                current_mutual: 'WebInteraction', // 当前选中的 tab
                visitorMailId: '',
                visitorList: [],
                messagerData: [],
                messagerIDs: [],
                webInteractionRelatedInfo: [], // 当前WhatsApp账号关联的网站交互信息
                facebookInteractionRelatedInfo: [], // 当前WhatsApp账号关联的Facebook交互信息
                whatsAppRelatedInfo: [], // 当前WhatsApp账号关联的其他WhatsApp信息
                visitorMailAddress: ''
            };
        },
        activated() {
        },
        methods: {
            // 格式化messagerData
            formatMessagerData(data) {
                this.messagerData = data.map((item, index) => ({
                    title: 'Facebook私信',
                    eventAction: this.from === 'fb_chat' ? 'conversation' : 'comment',
                    contactsName: item.account.name,
                    eventTime: item.conversation.updateTime,
                    eventContent: item.record[0].content,
                    eventCustomVar: {
                        conversationName: item.account.name,
                        pageName: item.conversation.conversationName,
                        conversationId: item.conversation.conversationId,
                        eventContent: item.record[0].content
                    },
                    setMessager: item.account.name,
                    getMessager: item.conversation.conversationName,
                    firstMessage: item.record[0].content,
                    remark: item.conversation.remark,
                    visitorStatus: item.conversation.clueStatus,
                    time: item.conversation.updateTime,
                    setImgUrl: item.account.avatar,
                    getImgUrl: item.conversation.conversationAvatar,
                    messagerContent: item.record,
                    messageShow: index === 0,
                    originURL: ''
                }));
            },
            getMessagerData() {
                util.ajaxInternationalJson({
                    url: '/social/facebookChat/getConversationWithRecord',
                    method: 'get',
                    params: {
                        conversationIds: this.messagerIDs.join(',')
                    }
                }).then(res => {
                    this.formatMessagerData(res.data.data);
                });
            },
            // 获取动态tab 下的时间轴tab
            getLocusSideStatus() {
                if (this.from === 'xhl_chat') {
                    this.mutual_list = [];
                    // this.current_mutual = 'WebInteraction';
                    util.ajaxJson({
                        url: '/crm/visitorRelation/getVisitorRelated/visitor',
                        method: 'get',
                        params: {
                            orgId: this.orgId,
                            visitorIds: this.visitorId
                        }
                    }).then(res => {
                        if (Object.keys(res.data.data).length) {
                            const data = res.data.data;
                            Object.keys(data).forEach((item, index) => {
                                const obj = {};
                                switch (item) {
                                    case '1':
                                        obj.key = 'WebInteraction';
                                        obj.title = this.$t('visitor_history.webInteract');
                                        obj.type = item;
                                        if (data[item].length) {
                                            this.visitorList = data[item].map((cItem) => ({
                                                key: cItem.targetId,
                                                value: cItem.visitorName
                                            }));
                                        }
                                        break;
                                    case '2':
                                        this.messagerIDs = data[item].map(cItem => cItem.targetId);
                                        obj.key = 'FacebookInteractionInfo';
                                        obj.title = this.$t('visitor_history.facebookInteraction');
                                        obj.type = item;
                                        break;
                                    case '7':
                                        this.visitorMailAddress = data[item].map(cItem => cItem.targetId).join(',');
                                        obj.key = 'Mail';
                                        obj.title = this.$t('timeLine.mail');
                                        obj.type = item;
                                        break;
                                    case '10':
                                        obj.key = 'whatsAppRelatedRecords';
                                        obj.title = this.$t('visitor_history.whatsappInteraction');
                                        obj.type = item;
                                        if (data[item].length > 0) {
                                            this.whatsAppRelatedInfo = data[item].map(cItem => ({
                                                chatWaAccount: cItem.targetId,
                                                userBindWaAccount: cItem.userBindWaAccount
                                            }));
                                        }
                                        break;
                                    default:
                                        break;
                                }
                                this.mutual_list.push(obj);
                            });
                            this.visitorDetailLoading = false;
                            if (this.mutual_list.length) {
                                this.current_mutual = this.mutual_list[0].key;
                            }
                        } else {
                            this.mutual_list = [{
                                key: 'WebInteraction',
                                title: this.$t('visitor_history.webInteract'),
                                type: '1'
                            }];
                            this.visitorList = [
                                {
                                    key: this.visitorId,
                                    value: this.customerInfo.title
                                }
                            ];
                            this.current_mutual = this.mutual_list[0].key;
                            this.visitorDetailLoading = false;
                        }
                    });
                } else if (this.from === 'whatsApp') {
                    this.mutual_list = [];
                    this.current_mutual = 'WebInteraction';
                    util.ajax({
                        url: '/crm/visitorRelation/getVisitorRelated/whatsapp',
                        method: 'GET',
                        params: {
                            toWaAccount: this.currAccountInfo.chatWaAccount ? this.currAccountInfo.chatWaAccount : this.currAccountInfo.contactWaAccount,
                            waBindAccount: this.currAccountInfo.userBindWaAccount,
                            orgId: this.orgId
                        }
                    }).then(res => {
                        this.visitorDetailLoading = false;
                        this.visitorDetailTabs = [];
                        if (res.data.code === '1') {
                            const data = res.data.data;
                            if (Object.keys(data).length) {
                                for (const key in data) {
                                    const obj = {};
                                    if (Object.prototype.hasOwnProperty.call(data, key)) {
                                        switch (key) {
                                            case '1':
                                                obj.key = 'WebInteraction';
                                                obj.title = this.$t('visitor_history.webInteract');
                                                obj.type = key;
                                                if (data[key].length) {
                                                    this.webInteractionRelatedInfo = data[key].map(item => ({
                                                        key: item.targetId,
                                                        value: item.visitorName
                                                    }));
                                                }
                                                break;
                                            case '2':
                                                obj.key = 'FacebookInteractionInfo';
                                                obj.title = this.$t('visitor_history.facebookInteraction');
                                                obj.type = key;
                                                this.messagerIDs = data[key].map(cItem => cItem.targetId);
                                                break;
                                            case '7':
                                                this.visitorMailAddress = data[item].map(cItem => cItem.targetId).join(',');
                                                obj.key = 'Mail';
                                                obj.title = this.$t('timeLine.mail');
                                                obj.type = item;
                                                break;
                                            case '10':
                                                obj.key = 'whatsAppRelatedRecords';
                                                obj.title = this.$t('visitor_history.whatsappInteraction');
                                                obj.type = key;
                                                if (data[key].length) {
                                                    this.whatsAppRelatedInfo = data[key].map(item => ({
                                                        chatWaAccount: item.targetId,
                                                        userBindWaAccount: item.userBindWaAccount
                                                    }));
                                                }
                                                break;
                                        }
                                        this.mutual_list.push(obj);
                                    }
                                }
                                if (this.mutual_list.length) {
                                    this.current_mutual = this.visitorDetailTabs[0].key;
                                }
                            } else {
                                this.mutual_list = [
                                    {
                                        key: 'whatsAppRelatedRecords',
                                        title: this.$t('visitor_history.whatsappInteraction'),
                                        type: '10'
                                    }
                                ];
                                this.whatsAppRelatedInfo = [
                                    {
                                        chatWaAccount: this.currAccountInfo.chatWaAccount ? this.currAccountInfo.chatWaAccount : this.currAccountInfo.contactWaAccount,
                                        userBindWaAccount: this.currAccountInfo.userBindWaAccount
                                    }
                                ];
                                this.current_mutual = this.mutual_list[0].key;
                                // this.$emit('noData','visitor-timeLine')
                            }
                        } else {
                            this.mutual_list = [
                                {
                                    key: 'whatsAppRelatedRecords',
                                    title: this.$t('visitor_history.whatsappInteraction'),
                                    type: '10'
                                }
                            ];
                            this.whatsAppRelatedInfo = [
                                {
                                    chatWaAccount: this.currAccountInfo.chatWaAccount ? this.currAccountInfo.chatWaAccount : this.currAccountInfo.contactWaAccount,
                                    userBindWaAccount: this.currAccountInfo.userBindWaAccount
                                }
                            ];
                            this.current_mutual = this.mutual_list[0].key;
                            // data[item].map(cItem => ({
                            //                     chatWaAccount: cItem.targetId,
                            //                     userBindWaAccount: cItem.userBindWaAccount
                            //                 }));
                            // this.$emit('noData','visitor-timeLine')
                        }
                    }).catch(err => {
                        this.$emit('noData', 'visitor-timeLine')
                    });
                } else if (this.from === 'mail' || this.from === 'mail_detail') {
                    this.mutual_list = [
                        {
                            key: 'Mail',
                            title: this.$t('timeLine.mail'),
                            type: '7'
                        }
                    ];
                    this.current_mutual = 'WebInteraction';
                    util.ajaxJson({
                        url: '/crm/visitorRelation/getVisitorRelated/email',
                        method: 'get',
                        params: {
                            orgId: this.orgId,
                            emails: this.currAccountInfo.mailAddress
                        }
                    }).then((res) => {
                        this.visitorDetailLoading = false;
                        if (res.data.code === '1') {
                            const data = res.data.data;
                            if (Object.keys(data).length) {
                                Object.keys(data).forEach((item, index) => {
                                    const obj = {};
                                    switch (item) {
                                        case '1':
                                            obj.key = 'WebInteraction';
                                            obj.title = this.$t('visitor_history.webInteract');
                                            obj.type = item;
                                            if (data[item].length) {
                                                this.visitorList = data[item].map((cItem) => ({
                                                    key: cItem.targetId,
                                                    value: cItem.visitorName
                                                }));
                                            }
                                            break;
                                        case '2':
                                            this.messagerIDs = data[item].map(cItem => cItem.targetId);
                                            obj.key = 'FacebookInteractionInfo';
                                            obj.title = this.$t('visitor_history.facebookInteraction');
                                            obj.type = item;
                                            break;
                                        case '7':
                                            this.visitorMailAddress = data[item].map(cItem => cItem.targetId).join(',');
                                            break;
                                        case '10':
                                            obj.key = 'whatsAppRelatedRecords';
                                            obj.title = this.$t('visitor_history.whatsappInteraction');
                                            obj.type = item;
                                            if (data[item].length > 0) {
                                                this.whatsAppRelatedInfo = data[item].map(item => ({
                                                    chatWaAccount: item.targetId,
                                                    userBindWaAccount: item.userBindWaAccount
                                                }));
                                            }
                                            break;

                                        default:
                                            break;
                                    }
                                    this.mutual_list.push(obj);
                                });
                                this.mutual_list = this.mutual_list.filter(item => item.key);
                                if (this.mutual_list.length) {
                                    this.current_mutual = this.mutual_list[0].key;
                                }
                            } else {
                                if (this.mutual_list.length) {
                                    this.current_mutual = this.mutual_list[0].key;
                                }
                                // this.$emit('noData','visitor-timeLine');
                            }
                        } else {
                            // this.$emit('noData','visitor-timeLine');
                        }
                    }).catch((error) => {
                        this.$emit('noData', 'visitor-timeLine');
                    });
                } else if (this.from === 'fb_chat' || this.from === 'fb_comment') {
                    this.mutual_list = [];
                    this.current_mutual = 'WebInteraction';
                    util.ajaxJson({
                        url: '/crm/visitorRelation/getVisitorRelated/message',
                        method: 'get',
                        params: {
                            orgId: this.orgId,
                            messageIds: this.visitorId
                        }
                    }).then((res) => {
                        this.visitorDetailLoading = false;
                        if (res.data.code === '1') {
                            const data = res.data.data;
                            if (Object.keys(data).length) {
                                Object.keys(data).forEach((item, index) => {
                                    const obj = {};
                                    switch (item) {
                                        case '1':
                                            obj.key = 'WebInteraction';
                                            obj.title = this.$t('visitor_history.webInteract');
                                            obj.type = item;
                                            if (data[item].length) {
                                                this.visitorList = data[item].map((cItem) => ({
                                                    key: cItem.targetId,
                                                    value: cItem.visitorName
                                                }));
                                            }
                                            break;
                                        case '2':
                                            this.messagerIDs = data[item].map(cItem => cItem.targetId);
                                            obj.key = 'FacebookInteractionInfo';
                                            obj.title = this.$t('visitor_history.facebookInteraction');
                                            obj.type = item;
                                            break;
                                        case '7':
                                            this.visitorMailAddress = data[item].map(cItem => cItem.targetId).join(',');
                                            obj.key = 'Mail';
                                            obj.title = this.$t('timeLine.mail');
                                            obj.type = item;
                                            break;
                                        case '10':
                                            obj.key = 'whatsAppRelatedRecords';
                                            obj.title = this.$t('visitor_history.whatsappInteraction');
                                            obj.type = item;
                                            if (data[item].length > 0) {
                                                this.whatsAppRelatedInfo = data[item].map(item => ({
                                                    chatWaAccount: item.targetId,
                                                    userBindWaAccount: item.userBindWaAccount
                                                }));
                                            }
                                            break;

                                        default:
                                            break;
                                    }
                                    this.mutual_list.push(obj);
                                });
                                if (this.mutual_list.length) {
                                    this.current_mutual = this.mutual_list[0].key;
                                }
                            } else {
                                this.$emit('noData', 'visitor-timeLine');
                            }
                        } else {
                            this.$emit('noData', 'visitor-timeLine');
                        }
                    }).catch((error) => {
                        this.$emit('noData','visitor-timeLine');
                    });
                }
            },
            noData() {
                this.$emit('noData', 'visitor-timeLine');
            }
        },
        created() {
        }
    };
</script>

<style lang="less" scoped>
    .mutual-tab{
        // padding: 0 15px;
        /deep/ .el-tabs__header {
            margin-top: 0px;
            border-bottom: none;
        }

        /deep/ .el-tabs__nav-wrap {
            height: 32px;
            line-height: 32px;
            overflow: inherit;
        }

        /deep/ .el-tabs__nav .el-tabs__item {
            padding: 3px 15px 3px 0;
            font-size: 13px;
            line-height: 40px;
            outline: none;
            vertical-align: middle;
            &:active {
                color: #4285F4 !important;
                outline: none;
            }

            &:hover {
                color: #4285F4 !important;

                .custom-menu-arrow {
                    color: #4285F4 !important;
                }
            }

            &.is-active {
                color: #4285F4;
                outline: none;
                i {
                    color: #4285F4 !important;
                }
            }
        }

        /deep/ .el-tabs__active-bar {
            display: none;
        }

        /deep/ .el-tabs__nav-wrap:after {
            display: none;
        }
    }
    .InfoList{
        height: calc(100% - 50px);
        overflow-y: auto;
    }
    .InfoList /deep/ .timeline-item {
        margin-right: 0;
    }

    .InfoList /deep/ .ivu-timeline-item-content {
        padding: 1px 1px 10px 19px;
    }

    .InfoList /deep/ .ivu-timeline-item-head-custom {
        margin: 0;
        padding: 0;
    }

    .InfoList /deep/ .ivu-timeline-item {
        padding: 0;
    }
    .verbal-block {
        position: absolute;
        top: 125px;
        left: 0;
        right: 0;
        bottom: 0;
        overflow-y: auto;
    }

    .verbal {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 99;
        background-color: #ffffff;
    }

    .verbal-top {
        height: 53px;
        line-height: 53px;
        padding: 0 15px;
    }

    .verbal-list {
        cursor: pointer;
        padding: 10px 15px;
        border-bottom: 1px solid #dbdbdb;
    }

    .verbal-list:hover {
        color: #FA8241;
    }

    .verbal-list-active {
        color: #FA8241;
    }

    #chat-info-title {
        height: 52px;
        border-bottom: 1px solid #d2d2d2;
    }

    #chat-info-title li {
        text-align: center;
        width: 32%;
        height: 52px;
        line-height: 52px;
        display: inline-block;
        cursor: pointer;
    }

    .show-this span {
        width: 47px;
        height: 7px;
        border-radius: 3px;
        background-color: #FA8241;
        display: block;
        margin: auto;
        margin-top: -3px;
    }
</style>
