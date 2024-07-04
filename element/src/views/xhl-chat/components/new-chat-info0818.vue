<template>
    <div style="height: 100%;overflow-y: hidden">
        <div v-if="currVisitorId"
             style="height: 100%;">
            <!-- <Tabs v-model="current_compo"
                  class="chat-info-tabs">
                <TabPane v-for="item in compo_list"
                         :key="item.key"
                         :name="item.key"
                         :label="item.title">
                    <span slot="label"
                          :class="`chat_detail_${item.key}`">{{ item.title }}</span>
                </TabPane>
            </Tabs> -->
            <Tabs v-model="current_mutual" class="mutual-tab">
                <TabPane v-for="item in mutual_list"
                         :key="item.key"
                         :name="item.key"
                         :label="item.title">
                </TabPane>
            </Tabs>
            <div style="height: calc(100% - 121px);overflow: auto;"
                 class="InfoList">
                    <component :is="current_mutual"
                               :companyId="''"
                               :type="'chat'"
                               :date="''"
                               :currentTab="initWebLine"
                               :fieldObj="fieldObj"
                               :visitorId="currVisitorId"></component>
                    <!-- <component v-else :is="current_mutual" :propsData="messagerData" :whatsAppRelatedInfo="whatsAppRelatedInfo" :little="true"></component> -->
 
            </div>
        </div>
    </div>
</template>

<script>
    // import tinyDetail from '../../main-components/tiny-detail/company-detail/CompanyDetail.vue';
    import WebLine from '../../main-components/timeline/web-interaction/web-item-line.vue';
    import VisitorTrackLine from '@/views/xhl-chat/components/visitor-track-line.vue';
    import shortCuts from '@/views/main-components/Shortcuts.vue';
    import util from '../../../libs/util';
    import { mapState } from 'vuex';
    import FacebookInteractionInfo from '@/views/main-components/timeline/facebook-interaction/FacebookInteractionInfo'
    import whatsAppRelatedRecords from '@/views/whatsapp-manage/components/whatsAppRelatedRecords.vue';

    export default {
        components: {
            WebLine,
            VisitorTrackLine,
            shortCuts,
            FacebookInteractionInfo,
            whatsAppRelatedRecords
        },
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId',
                currVisitorId: 'currVisitorId',
                currCompanyId: 'currCompanyId',
                isShowTinyDetail: 'isShowTinyDetail',
                isShowVerbal: 'isShowVerbal',
                currClueId: 'currClueId',
                currVisitorType: 'currVisitorType',
                currInquiryId: 'currInquiryId',
                refreshCurrSession: 'refreshCurrSession'
            })
        },
        watch: {
            isShowTinyDetail(data) {
                if (data) {
                    this.$store.state.isShowVerbal = false;
                    /**
                     * @Description: 时间轴需要此数据, 加上请求
                     * @author 汤一飞
                     * @date 2020/6/6
                    */
                    if (this.currVisitorType === 'clueType') {
                        this.get_clue_short_info();
                    }
                }
            },
            isShowVerbal(data) {
                if (data) {
                    this.$store.state.isShowTinyDetail = false;
                }
            },
            // current_compo(val) {
            //     if (val === 'WebMutual') {
            //         this.$nextTick(() => {
            //             this.current_mutual = 'WebLine';
            //             this.getLocusSideStatus();
            //         });
            //     } else {
            //         this.current_mutual = '';
            //     }
            // },
            current_mutual(val) {
                if (val === 'WebLine') {
                    this.initWebLine = '';
                    this.$nextTick(() => {
                        this.initWebLine = 'web-line';
                    });
                } else if (val === 'FacebookInteractionInfo') {
                    this.getMessagerData();
                }
            },
            currVisitorId: {
                handler(val) {
                    this.refresh = false;
                    this.current_compo = 'VisitorTrackLine';
                    this.initWebLine = '';
                    this.$nextTick(() => {
                        this.refresh = true;
                    });
                },
                immediate: true
            },
            refreshCurrSession: {
                // 要求强制刷新, 则重新请求数据
                handler(val) {
                    this.refresh = false;
                    this.$nextTick(() => {
                        this.refresh = true;
                    });
                }
            },
            locusSideStatus: {
                handler(val) {
                    let tab = [{
                        key: 'WebLine',
                        title: this.$t('visitor_history.webInteract')
                    }];
                    if (val.some(item => item === 'messenger')) {
                        tab.push({
                            title: this.$t('visitor_history.facebookInteraction'),
                            key: 'FacebookInteractionInfo'
                        })
                    } else {
                        tab = tab.filter(item => item.key !== 'FacebookInteractionInfo')
                    }
                    if (val.some(item => item === 'whatsapp')) {
                        tab.push({
                            title: this.$t('visitor_history.whatsappInteraction'),
                            key: 'whatsAppRelatedRecords'
                        })
                    } else {
                        tab = tab.filter(item => item.key !== 'whatsAppRelatedRecords')
                    }
                    this.mutual_list = tab;
                }
            }
        },
        data() {
            return {
                controVerbalIcon: 0,
                currIndex: -1,
                browserTip: '',
                osInfoTip: '',
                fieldObj: {},
                visible: true,
                companyId: 2648,
                isShowSearch: false,
                verbalSort: 0, // 话术分类
                verbalSortListTemp: [],
                verbalSortList: [
                    {
                        id: 0,
                        name: this.$t('chat.All')
                    }
                ], // 话术分类列表
                refreshVerbal: false,
                verbalList: [],
                verbalListTemp: [],
                verbalListTemp2: [],
                verbalSearch: '', // 搜素话术
                showTrace: false,

                // 视图切换
                refresh: true, // 控制详情页刷新
                compo_list: [
                    {
                        key: 'VisitorTrackLine',
                        title: this.$t('chat.visitorTrack')
                    },
                    {
                        key: 'WebMutual',
                        title: this.$t('chat.chatInfo')
                    }
                ],
                mutual_list: [
                    {
                        key: 'WebLine',
                        title: this.$t('visitor_history.webInteract')
                    }
                ],
                current_mutual: 'WebLine',
                current_compo: 'WebMutual',
                initWebLine: '',
                locusSideStatus: [],
                messagerData: [],
                messagerIDs: [],
                whatsAppRelatedInfo: []
            };
        },
        activated() {
            this.locusSideStatus = [];
        },
        methods: {
            // 格式化messagerData
            formatMessagerData(data) {
                this.messagerData = data.map((item, index) => ({
                    title: 'Facebook私信',
                    setMessager: item.account.name,
                    getMessager: item.conversation.conversationName,
                    firstMessage: item.record[0].content,
                    remark: item.conversation.remark,
                    visitorStatus: item.conversation.clueStatus,
                    time: item.conversation.updateTime,
                    setImgUrl: item.account.avatar,
                    getImgUrl: item.conversation.conversationAvatar,
                    messagerContent: item.record,
                    messageShow: index === 0 ? true : false,
                    originURL: ''
                }))
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
                })
            },
            getLocusSideStatus() {
                util.ajaxJson({
                    url: `/crm/visitorRelation/getVisitorRelated/visitor`,
                    method: 'get',
                    params: {
                        orgId: this.orgId,
                        visitorIds: this.currVisitorId
                    }
                }).then(res => {
                    if (Object.keys(res.data.data).length > 0) {
                        const tab = [];
                        Object.keys(res.data.data).forEach((item, index) => {
                            switch (item) {
                                case '1':
                                    // res.data[item]
                                    break;
                                case '2':
                                    if (res.data.data[item].length > 0) {
                                        this.messagerIDs = res.data.data[item].map(cItem => cItem.targetId);
                                        tab.push('messenger');
                                    }
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
                        })
                        this.locusSideStatus = [...tab]
                    }

                }, error => {
                    this.$message.error(error);
                });
            },
            closeTiny() {
                this.$store.state.isShowTinyDetail = false;
            },
            handleRefresh() {
                this.verbal();
            },
            shortCutsShow(val) {
                this.$store.state.isShowVerbal = val;
            },
            closeVerbal() {
                this.$store.state.isShowVerbal = false;
            },
            switchView() {
                this.isShowSearch = true;
            },
            // 跳转到话术管理
            toProtalSet() {
                this.$router.push({
                    name: 'script_set',
                    params: {
                        contacts: 'verbal'
                    }
                });
            },
            // 话术
            verbal() {
                this.refreshVerbal = true;
                util.ajax({
                    url: '/cuss-login/config/getReply',
                    method: 'post',
                    data: {
                        orgId: this.orgId
                    }
                }).then(response => {
                    this.refreshVerbal = false;
                    if (response.data.code === '1') {
                        let sortList = [];
                        let List = [];
                        let data = response.data.data;
                        let L = data.length;
                        for (let i = 0; i < L; i++) {
                            let obj = {
                                id: data[i].id,
                                name: data[i].name
                            };
                            sortList.push(obj);
                            for (let j = 0; j < data[i].list.length; j++) {
                                List.push(data[i].list[j]);
                            }
                        }
                        this.verbalSortListTemp = this.verbalSortList.concat(sortList);
                        this.verbalListTemp = List;
                        this.verbalListTemp2 = List;
                        this.verbalList = data;
                    }
                });
            },
            searchTxt() {
                this.searchVerbal();
            },
            sortChange() {
                this.searchVerbal();
            },
            searchVerbal() {
                console.log(this.verbalSearch);
                console.log(this.verbalSort);
                let list = [];
                if (this.verbalSort == 0) {
                    let temp = this.verbalListTemp2.concat();
                    for (let i = 0; i < temp.length; i++) {
                        if ((temp[i].abbr.indexOf(this.verbalSearch) != -1) || (temp[i].name.indexOf(this.verbalSearch) != -1)) {
                            list.push(temp[i]);
                        }
                    }
                } else {
                    for (let i = 0; i < this.verbalList.length; i++) {
                        if (this.verbalList[i].id == this.verbalSort) {
                            for (let j = 0; j < this.verbalList[i].list.length; j++) {
                                if ((this.verbalList[i].list[j].abbr.indexOf(this.verbalSearch) != -1) || (this.verbalList[i].list[j].name.indexOf(this.verbalSearch) != -1)) {
                                    list.push(this.verbalList[i].list[j]);
                                }
                            }
                        }
                    }
                }
                this.verbalListTemp = list;
            },
            selVerbal(item) {
                let verbalIndex = this.$store.state.currVisitorId;
                // this.$store.state.msgToSentTemp[verbalIndex]=item.name;
                this.$store.state.msgToSentTemp[verbalIndex] = item.content.verbalContent;
                this.$store.state.msgToSentTemp = Object.assign({}, this.$store.state.msgToSentTemp);
            },
            /* 请求获得字段对应的信息 */
            getXSShow() {
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.orgId
                    }
                }).then(ret => {
                    if (ret.data.code === '1') {
                        this.fieldObj = ret.data.data.show;
                    }
                });
            },
            get_clue_short_info() {
                util.ajax({
                    url: '/form-cust/form/getSimpleColumnValue',
                    method: 'post',
                    data: {
                        id: this.currClueId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$store.commit('set_clue_short_info', response.data.data);
                    } else {
                        this.$Message.error('获取线索简略信息出错');
                    }
                });
            }
        },
        created() {
            this.verbal();
            this.getXSShow();
        }
    };
</script>

<style lang="less">
    @import "new-chat-info.css";
    .ivu-scroll-container {
        overflow-y: auto;
    }

    .info-btn {
        background-color: #59d8d6;
        border-radius: 2px;
        padding: 0 5px;
        color: #fff;

    }

    .remark-div {
        margin-top: 10px;
    }

    .remark-div, .sort-div {
        margin-bottom: 15px;
        padding: 0 15px;
    }

    .remark-btn {
        color: #FA8241;
        border: 1px solid #FA8241;
    }

    .sort-btn {
        color: #51b7a3;
        border: 1px solid #51b7a3;
    }

    .remark-btn, .sort-btn {
        text-align: center;
        line-height: 30px;
        cursor: pointer;
        width: 17%;
        height: 30px;
        background-color: #ffffff;
        border-radius: 3px;
        float: right;
    }

    .browser-icon, .system-icon {
        width: 17px;
        height: 17px;
        float: left;
        margin: 10px 5px;
        cursor: pointer;
    }

    .browserwrap, .systemwrap {
        float: left;
        position: relative;
    }

    .visitor-ip {
        float: right;
        line-height: 36px;
    }

    .browsertips, .systemtips {
        border: 1px solid #eeeeee;
        -webkit-box-shadow: 0 0 4px rgba(0, 0, 0, .13);
        -moz-box-shadow: 0 0 4px rgba(0, 0, 0, .13);
        box-shadow: 0 0 4px rgba(0, 0, 0, .13);
    }

    .browsertips, .systemtips {
        display: none;
        padding: 0 10px;
        height: 33px;
        position: absolute;
        top: 1px;
        left: 35px;
        z-index: 999;
        font-size: 12px;
        color: #828282;
        text-align: center;
        line-height: 33px;
        border-radius: 2px;
        background: #fff;
    }

    .browserwrap:hover .browsertips, .systemwrap:hover .systemtips {
        display: block;
    }

    #chat-info-detail {
        width: 100%;
        position: absolute;
        top: 260px;
        bottom: 30px;
        overflow-y: auto;
        padding: 10px 0;
        word-wrap: break-word;
        word-break: break-all;
        padding: 0 15px;
    }

    .time-tips {
        width: 180px;
        text-align: center;
        padding: 2px 0;
        background-color: #ffffff;
        position: absolute;
        left: 50%;
        top: 3px;
        margin-left: -90px;
        font-size: 14px;
        color: #717171;
    }

    .track-top {
        margin-bottom: 5px;
        display: flex;
        justify-content: space-between;
    }

    .track-time {
        color: #999999;
    }

    .track-title {
        background-color: #FFECE2;
        color: #FA8241;
        padding: 0 5px;
        border-radius: 4px;
    }

    .track-url {
        color: #d1d1d1;
    }

    .chat-info-tabs .el-tabs__item {
        height: auto;
        line-height: 1;
        padding: 15px !important;
        font-weight: 700;
    }
</style>

<style lang="less" scoped>
    .mutual-tab{
        // padding: 0 15px;
        /deep/ .el-tabs__header {
            border-bottom: none;
        }

        /deep/ .el-tabs__nav-wrap {
            height: 32px;
            line-height: 32px;
            overflow: inherit;
        }

        /deep/ .el-tabs__nav .el-tabs__item {
            padding: 3px 30px 3px 0;
            font-size: 13px;
            line-height: 40px;
            outline: none;
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
