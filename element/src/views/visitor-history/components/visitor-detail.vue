<template>
    <div>
        <Drawer
            :visible.sync="visible"
            size="75%"
            :withHeader="false"
            :modal="false"
            :append-to-body="true"
            class="drawer-show-main-header drawer-close-button-moveUp visitor-detail"
            @open="toggle_drawer(true)"
            @close="toggle_drawer(false)">
                <!-- <template>
                    <i class="custom custom-drawer-detail-close"></i>
                </template> -->
                <a @click.stop="toggle_drawer(false)" class="drawer-close-button">
                    <Icon custom="custom-drawer-detail-close"></Icon>
                </a>
                <div class="visitor-timeline" >
                    <div class="header clearfloat" style="padding: 20px;">
                        <i
                            class="custom custom-visitor-history"
                            size="46"
                            style="font-size:40px;color: #4b6bc8; float: left;margin-right: 10px;">
                        </i>
                        <div style="display: inline-block;height:40px;">
                            <div>
                                <h3 class="title" style="float:left"> {{simpleInfo.visitorName}}</h3>
                                <div style="color: rgba(0,0,0,.6);overflow:hidden;textOverflow:ellipsis;whitSpace:nowrap;float:left" :title="rowData.remark">
                                    <span>{{rowData.remark?(rowData.remark.length>25?rowData.remark.slice(0,26) + " ...":rowData.remark):""}}</span>
                                    <!-- <Icon custom="custom custom-remark-edit"></Icon> -->
                                </div>
                                <div style="clear:both;"></div>
                            </div>
                            <p style="color:rgba(0,0,0,.6);">ID:{{rowData.visitorId}}</p>
                        </div>
                        <!-- <span v-if="authorized_button['enterClue'] && type!=='google'" v-show="status==='1'" @click.stop="enterClue()"
                            class="enter" style="margin-left: 15px;margin-top: 3px;font-size:12px;">
                            <i class="custom custom-import"></i>&nbsp; {{$t('visitor_history.enter')}}
                        </span> -->
                        <!-- 网站留言 -->
                        <template v-if="['webMsg', 'visitorHistory'].includes(type)">
                            <crmArchiveStatus style="float: right;margin-right: 10px;" @showDetail="openCrm" :status="row.crmStatus"></crmArchiveStatus>
                            <!-- <Dropdown
                                style="float: right;margin-right: 10px;"
                                v-if="status!= 101 && status!= 102 && status != 2"
                                :disabled="(status==101||status==102)?true:false"
                                 trigger="click"
                                 @command="changeStatus">
                                <div class="frame-status">
                                    {{ statusLabel  }}
                                    <Icon type="ios-arrow-down"></Icon>
                                </div>
                                <DropdownMenu slot="dropdown" class="handle-status-dropdown-menu">
                                    <DropdownItem
                                        v-show="item.value!=101 && item.value!=102"
                                        v-for="item in statusOptionsWebmsg"
                                        :key="item.value" :command="item.value"
                                        :disabled="status === item.value"
                                    >
                                        {{ item.label }}
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <Tooltip ref='openCrmBtn' placement="left" :content="$t('clue.clue')" v-if="status==101||status ==2" class="logo-btn" >
                                <i class="custom custom-clue" style="font-size:30px"  @click="openCrm()" ></i>
                            </Tooltip>
                            <Tooltip ref='openCrmBtn' placement="left" :content="$t('clue.inquiry')" v-if="status==102" class="logo-btn">
                                <i class="custom custom-inquiry" style="font-size:30px"  @click="openCrm()"  ></i>
                            </Tooltip> -->
                            <!-- <Button @click="openCrm()" class="primary-btn his-btn" v-if="status==='101'" type="primary">{{$t('website.Tooltip4')}}</Button> -->
                        </template>
                        <!-- <template v-else-if="type == 'visitorHistory'">
                            <crmArchiveStatus style="float: right;margin-right: 10px;" @showDetail="openCrm" :status="row.status"></crmArchiveStatus>
                            <Dropdown
                                style="float: right;margin-right: 10px;"
                                v-if="status!=2 && status!=102"
                                :disabled="(status==2||status==102) ?true:false"
                                 trigger="click"
                                 @command="changeStatus">
                                <div class="frame-status">
                                    {{ statusLabel  }}
                                    <Icon type="ios-arrow-down"></Icon>
                                </div>
                                <DropdownMenu slot="dropdown" class="handle-status-dropdown-menu">
                                    <DropdownItem
                                        v-show="item.value!=2&&item.value!=102"
                                        v-for="item in statusOptions"
                                        :key="item.value" :command="item.value"
                                        :disabled="status === item.value"
                                    >
                                        {{ item.label }}
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <Tooltip ref='openCrmBtn' placement="left" :content="$t('clue.clue')" v-if="status==2">
                                <span class="logo-btn">
                                    <i class="custom custom-clue" style="font-size:30px"  @click="openCrm()"  ></i>
                                </span>
                            </Tooltip>
                            <Tooltip ref='openCrmBtn' placement="left" :content="$t('clue.inquiry')" v-if="status==102" class="logo-btn" >
                                <span class="logo-btn">
                                    <i class="custom custom-inquiry" style="font-size:30px"  @click="openCrm()" ></i>
                                </span>
                            </Tooltip>
                            <Button @click="openCrm()" class="primary-btn his-btn" v-if="status==='2'" type="primary">{{$t('website.Tooltip4')}}</Button>
                        </template> -->
                        <template v-else-if="type == 'google'">
                            <crmArchiveStatus style="float: right;margin-right: 10px;" @showDetail="openCrm" :status="row.crmStatus"></crmArchiveStatus>
                            <!-- <span
                                class="visitor-select"
                                v-if="status!=2 && status!=102">
                                    {{statusString}}
                            </span>
                            <Tooltip ref='openCrmBtn' placement="left" :content="$t('clue.clue')" v-if="status==2" >
                                <span class="logo-btn">
                                    <i class="custom custom-clue" style="font-size:30px"  @click="openCrm()"  ></i>
                                </span>
                            </Tooltip>
                            <Tooltip ref='openCrmBtn' placement="left" :content="$t('clue.inquiry')" v-if="status==102" class="logo-btn" >
                                <i class="custom custom-inquiry" style="font-size:30px"  @click="openCrm()" ></i>
                            </Tooltip> -->
                        </template>
                        <Row style="margin-top: 8px">
                            <Col :span="5">
                                <div class="product-item">{{$t('visitor_history.firstVisitTime')}}</div>
                                <div class="product-item-data">{{firstVisitTime | timeFormat("DateTime")}}</div>
                            </Col>
                            <Col :span="5">
                                <div class="product-item">{{$t('visitor_history.nearest_create_time')}}</div>
                                <div class="product-item-data">{{ (rowData.firstVisitTime || rowData.createTime) | timeFormat("DateTime")}}</div>
                            </Col>
                            <Col :span="3">
                                <div class="product-item">{{$t('visitor_history.visit_times')}}</div>
                                <div class="product-item-data"> {{visitTimes}} </div>
                            </Col>
                            <Col :span="3">
                                <div class="product-item">{{$t('visitor_history.leave_message_count')}}</div>
                                <div class="product-item-data"> {{leaveMessageCount}} </div>
                                <!-- <div class="product-item-data">{{rowData.leaveMessageCount}}</div> -->
                            </Col>
                            <Col :span="4" v-if="simpleInfo.visitorChatCount != undefined">
                                <div class="product-item">{{$t('visitor_history.visitor_chat_count')}}</div>
                                <div class="product-item-data">{{simpleInfo.visitorChatCount}}</div>
                            </Col>
                            <Col :span="4" v-if="simpleInfo.serverChatCount != undefined">
                                <div class="product-item">{{$t('visitor_history.service_chat_count')}}</div>
                                <div class="product-item-data">{{simpleInfo.serverChatCount}}</div>
                            </Col>
                        </Row>
                    </div>
                    <div class="hr-block"></div>
                    <div class="mutual-box InfoList" style="padding: 10px 30px 0px;overflow:hidden">
                        <Tabs v-model="currentMutual">
                            <TabPane
                                v-for="item in mutualTabList"
                                :key="item.name"
                                :label="item.label"
                                :name="item.name">
                            </TabPane>
                        </Tabs>
                        <component v-if="currentMutual !== 'webInteract'" style="height:calc(100vh - 300px);overflow-y:auto"
                                   :is="currentMutual"
                                   :currentTab="currentMutual"
                                   :propsData="messagerData"
                                   :mailAddress="mailAddress"
                                   :customerInfo="customerInfo"
                                   :whatsAppRelatedInfo="whatsAppRelatedInfo"></component>
                    </div>
                    <div style="padding:0px 30px 10px;" v-if="currentMutual === 'webInteract'">
                        <Tabs v-model="current_compo" class="second-tab">
                            <TabPane
                                v-for="item in tabList"
                                :key="item.name"
                                :label="item.label"
                                :name="item.name">
                            </TabPane>
                        </Tabs>
                        <keep-alive>
                            <!--current_compo：组件名称、visitorInfo：访客信息详情-->
                            <component
                                :is="current_compo"
                                :row="rowData"
                                :simpleInfo='simpleInfo'
                                :timeLine="timeLine"
                                :fieldObj="fieldObj"
                                @getVisitTimes="getVisitTimes"
                                @getFirstVisitTime="getFirstVisitTime">
                            </component>
                        </keep-alive>
                        <Button type="primary" id="CopyUrl"  style="display: none;"></Button>
                    </div>
                    <ClueModal
                        v-model="inputClue"
                        :title="$t('visitor_history.add_clue')"
                        class="modal companydata"
                        :delLoading="false"
                        :json_data="json_data"
                        :createCustomer.sync="createCustomer"
                        :saveClueClass="type=='visitorHistory'?'visitor-history-save-clue':'webMsg-save-clue'"
                        :saveClueAndInquiryClass="type=='visitorHistory'?'visitor-history-save-clue-and-inquiry':'webMsg-save-clue-and-inquiry'"
                        :okEnterInquiryClass="type=='visitorHistory'?'visitor-history-clue-to-inquiry':'webMsg-clue-to-inquiry'"
                        :hide="enterpriseId + '' !== '1000' && enterpriseId + '' !== '1002'"
                        :type="type"
                        @open_close="open_close"
                        @on_cancle_clue="on_cancle_clue"
                        @returnLeadsId="updateStatus">
                    </ClueModal>
                </div>
        </Drawer>
        <littleDrawer
            :visible="littleDrawerVisible"
            :currAccountInfo="currAccountInfo"
            :wrapWith="'75%'"
            :from="type"
            @handleClick="handleClick"
            @littleDrawerHidden="littleDrawerHidden"
            @emitFreshLeadsCLoudsStatus="emitFreshLeadsCLoudsStatus"
        ></littleDrawer>
        <!-- <CRMDrawerList
            :disabled="true"
            :visible.sync="show_inquiry_detail"
            :id.sync="inquiryId"
            :type="'inquiry'"
            originalType="visitorHistory"
            :colSpan="12"
            :corp_columns_authorized="corp_columns_authorized"
            :contact_columns_authorized="contact_columns_authorized"
            :inquiry_columns_authorized="inquiry_columns_authorized"
            >
        </CRMDrawerList>
        <ClueDrawerList
            :showClueStatus="true"
            :disabled="true"
            :visible.sync="show_clue_detail"
            :type="'others'"
            originalType="visitorHistory"
            :clueId.sync="clueId"
            :listType="2"
            :corp_columns_authorized="corp_columns_authorized"
            :contact_columns_authorized="contact_columns_authorized"
            :inquiry_columns_authorized="inquiry_columns_authorized"
            >
        </ClueDrawerList> -->
    </div>
</template>

<script>
    import util from '@/libs/util.js';
    import { mapState, mapGetters } from 'vuex';
    import VisitorLine from './timeline';
    import ClueModal from '../../main-components/enter-clue/enter-clue';
    import { MY_CHAT } from '../../../api/config.js';
    // import CRMDrawerList from '@/views/crm/Detail/CRMDrawerList';
    // import ClueDrawerList from '@/views/clue-manage/Detail/ClueDrawerList';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import visitorFrom from './visitorFrom.vue';
    import visitorChat from './visitorChat.vue';
    import visitorTrace from './visitorTrace.vue';
    import { changeStatusPiwik } from '../api/visitor_piwik';
    import { changeStatusOld } from '../api/visitor_old';
    import FacebookInteractionInfo from '@/views/main-components/timeline/facebook-interaction/FacebookInteractionInfo';
    import whatsAppRelatedRecords from '@/views/whatsapp-manage/components/whatsAppRelatedRecords.vue';
    import Mail from '@/views/main-components/timeline/mail/visitor-mail';
    import littleDrawer from '@/views/main-components/little-drawer/little-drawer.vue';
    import crmArchiveStatus from '@/views/main-components/crmArchiveStatus';

    export default {
        props: {
            type: String,
            showDetail: {
                type: Boolean,
                default: false
            },
            row: {
                type: Object,
                default() {
                    return {};
                }
            },
            index: {
                type: Number,
                default: -1
            },

            timeLine: {
                type: Number
            }
        },
        components: {
            VisitorLine,
            ClueModal,
            // CRMDrawerList,
            // ClueDrawerList,
            visitorFrom,
            visitorChat,
            visitorTrace,
            FacebookInteractionInfo,
            whatsAppRelatedRecords,
            Mail,
            littleDrawer,
            crmArchiveStatus
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                button_list: state => state.app.button_list,
                is_marketing_station: state => state.app.is_marketing_station
            }), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu'
            ]),
            authorized_button() {
                const visitorHistory = BUTTON_IDS.website.visitorHistory;
                const websiteMsg = BUTTON_IDS.website.websiteMsg;
                return {
                    enterClueVisitor: !HANDLE_BUTTON(visitorHistory.enterClue, this.button_list),
                    enterClueWebsite: !HANDLE_BUTTON(websiteMsg.enterClue, this.button_list),
                    enterCustomerVisitor: !HANDLE_BUTTON(visitorHistory.enterCustomer, this.button_list),
                    enterCustomerWebsite: !HANDLE_BUTTON(websiteMsg.enterCustomer, this.button_list)
                };
            },
            statusLabel() {
                let options = [];
                if (this.type === 'visitorHistory') {
                    options = this.statusOptions;
                } else if (this.type === 'webMsg') {
                    options = this.statusOptionsWebmsg;
                }
                const statusObj = options.find(item => item.value === this.status);
                return statusObj ? statusObj.label : 'unknown';
            }
        },
        data() {
            return {
                // 直接创建客户
                createCustomer: false,

                statusString: '',
                changeLabel: '',
                leaveMessageCount: 0, // 留言数量
                simpleInfo: {},
                /* 多语言 */
                lang_contact: {
                    nickName: this.$t('crm.Modal.contact_nickName'),
                    jobTitle: this.$t('crm.Modal.contact_jobTitle'),
                    email: this.$t('crm.Modal.contact_email'),
                    phone: this.$t('crm.Modal.contact_phone'),
                    jobGrade: this.$t('crm.Modal.contact_jobGrade'),
                    socialNetworkingPlatform: this.$t('crm.Modal.contact_socialNetworkingPlatform'),
                    birthday: this.$t('crm.Modal.contact_birthday'),
                    gender: this.$t('crm.Modal.contact_gender'),
                    picture: this.$t('crm.Modal.contact_picture'),
                    remark: this.$t('crm.Modal.contact_remark')
                },
                lang_inquiry: {
                    productCategory: this.$t('crm.Modal.inq_productCategory'),
                    demandProducts: this.$t('crm.Modal.inq_demandProducts'),
                    inquiryScore: this.$t('crm.Modal.inq_inquiryScore'),
                    label: this.$t('crm.Modal.inq_label'),
                    sourceChannel: this.$t('crm.Modal.inq_sourceChannel'),
                    sourceWay: this.$t('crm.Modal.inq_sourceWay'),
                    grouping: this.$t('crm.Modal.inq_grouping'),
                    followUp: this.$t('crm.Modal.inq_followUp'),
                    estimatedInquiryAmount: this.$t('crm.Detail.inq_estimatedInquiryAmount'),
                    remark: this.$t('crm.Modal.inq_remark')
                },
                lang_company: {
                    companyName: this.$t('crm.Modal.corp_companyName'),
                    starLevel: this.$t('crm.Modal.corp_starLevel'),
                    shortName: this.$t('crm.Modal.corp_shortName'),
                    countryArea: this.$t('crm.Modal.corp_countryArea'),
                    mainProduct: this.$t('crm.Modal.corp_mainProduct'),
                    scale: this.$t('crm.Modal.corp_scale'),
                    clientType: this.$t('crm.Modal.corp_clientType'),
                    homePage: this.$t('crm.Modal.corp_homePage'),
                    phone: this.$t('crm.Modal.corp_phone'),
                    fax: this.$t('crm.Modal.corp_fax'),
                    contactAddress: this.$t('crm.Modal.corp_contactAddress'),
                    relatedCompany: this.$t('crm.Modal.corp_relatedCompany'),
                    companyPicture: this.$t('crm.Modal.corp_companyPicture'),
                    companyRemark: this.$t('crm.Modal.corp_companyRemark'),
                    companySourceWay: this.$t('crm.Table.col_customerSource')
                },
                visible: false,
                status: '',
                statusOptions: [
                    { label: this.$t('website.notEnter'), value: '1', disabled: false },
                    { label: this.$t('website.Tooltip2'), value: '3', disabled: false },
                    { label: this.$t('clue.clue'), value: '2', disabled: true },
                    { label: this.$t('clue.inquiry'), value: '102', disabled: true }
                ],
                statusOptionsWebmsg: [
                    { label: this.$t('clue.unfollowed'), value: '1', disabled: false },
                    { label: this.$t('clue.clue'), value: '101', disabled: false },
                    { label: this.$t('clue.inquiry'), value: '102', disabled: false },
                    { label: this.$t('website.Tooltip2'), value: '100', disabled: false },
                    { label: this.$t('clue.secondConsultation'), value: '103', disabled: false }
                ],
                json_data: {},
                templateId: '',
                inputClue: false,
                visitorType: '',
                fieldObj: {},

                // 以下为客户详情所需参数
                show_inquiry_detail: false,
                inquiryId: '',
                corp_columns_authorized: {}, // 公司所有字段
                contact_columns_authorized: {}, // 联系人所有字段
                inquiry_columns_authorized: {}, // 询盘所有字段
                whatsAppRelatedInfo: [],

                // 以下为线索详情所需参数
                clueId: '',
                show_clue_detail: false,

                current_compo: 'VisitorLine',
                tabList: [
                    {
                        label: this.$t('visitor_history.all'),
                        name: 'VisitorLine'
                    },
                    {
                        label: this.$t('visitor_history.visitorChat'),
                        name: 'visitorChat'
                    },
                    {
                        label: this.$t('visitor_history.visitorFrom'),
                        name: 'visitorFrom'
                    },
                    {
                        label: this.$t('visitor_history.visitorTrace'),
                        name: 'visitorTrace'
                    }
                ],
                currentMutual: 'webInteract',
                mutualTabList: [
                    {
                        label: this.$t('visitor_history.webInteract'),
                        name: 'webInteract'
                    }
                ],
                // 访问次数
                visitTimes: '',
                firstVisitTime: '',
                locusSideStatus: [],
                messagerData: [],
                messagerIDs: [],
                customerInfo: {
                    title: ''
                },
                mailAddress: '',
                rowData: {},
                littleDrawerVisible: false,
                currAccountInfo: null
            };
        },
        activated() {
            this.locusSideStatus = [];
        },
        methods: {
            // ============================================================接口
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
            // 获取facebook 和 主页关联关系
            getLocusSideStatus() {
                util.ajaxJson({
                    url: '/crm/visitorRelation/getVisitorRelated/visitor',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        visitorIds: this.row.visitorId || this.row.proj
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
                                    if (res.data.data[item].length) {
                                        this.messagerIDs = res.data.data[item].map(cItem => cItem.targetId);
                                        tab.push('messenger');
                                    }
                                    break;
                                case '7':
                                    if (res.data.data[item].length) {
                                        this.mailAddress = res.data.data[item].map(cItem => cItem.targetId).join(',');
                                        tab.push('Mail');
                                    }
                                    break;
                                case '10':
                                    if (res.data.data[item].length) {
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
                        this.locusSideStatus = [...tab];
                    } else {
                        this.locusSideStatus = [];
                    }
                }, error => {
                    this.$Message.error(error);
                });
            },
            // 获取访客状态
            getStatusByVisitorId() {
                util.ajaxInternationalJson({
                    url: '/piwikRead/visitorInfo/getStatusByVisitorId',
                    method: 'get',
                    params: {
                        visitorId: this.row.visitorId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.status = res.data.data.toString();
                        const temp = this.statusOptions.find(item => {
                            return item.value === this.status;
                        });
                        this.statusString = temp.label;
                    } else {
                        this.$Message.error(res.data.message);
                    }
                });
            },
            /* 获取 CRM 授权字段 */
            get_columns_authorized() {
                util.ajax({
                    url: '/crm/columnConfig/getFields',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        parentId: 0
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                            // 暂存所有默认字段和自定义字段
                        const defaultFields = response.data.data && Array.isArray(response.data.data.default) ? response.data.data.default : [];
                        const customFields = response.data.data && Array.isArray(response.data.data.custom) ? response.data.data.custom : [];
                        // 筛选得到公司/询盘/联系人授权字段
                        this.$set(this.corp_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 1));
                        this.$set(this.corp_columns_authorized, 'custom', customFields.filter(col => col.parentId === 1));
                        this.$set(this.contact_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 2));
                        this.$set(this.contact_columns_authorized, 'custom', customFields.filter(col => col.parentId === 2));
                        this.$set(this.inquiry_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 3));
                        this.$set(this.inquiry_columns_authorized, 'custom', customFields.filter(col => col.parentId === 3));

                        // 公司系统默认字段 多语言配配置
                        if (this.corp_columns_authorized.default) {
                            this.corp_columns_authorized.default.forEach(item => {
                                if (this.lang_company.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_company[item.storageName];
                                }
                            });
                        }
                        // 联系人系统默认字段 多语言配配置
                        if (this.contact_columns_authorized.default) {
                            this.contact_columns_authorized.default.forEach(item => {
                                if (this.lang_contact.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_contact[item.storageName];
                                }
                            });
                        }
                        // 线索系统默认字段 多语言配配置
                        if (this.inquiry_columns_authorized.default) {
                            this.inquiry_columns_authorized.default.forEach(item => {
                                if (this.lang_inquiry.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_inquiry[item.storageName];
                                }
                            });
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                    }
                }).catch(erro => {
                    this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                });
            },
            // ============================================================
            // 获取访客次数
            getVisitTimes(val) {
                this.visitTimes = val;
            },
            // 获取访客首次开始访问事件
            getFirstVisitTime(val) {
                if (val) {
                    this.firstVisitTime = val;
                } else {
                    this.firstVisitTime = this.rowData.createTime;
                }
            },
            // 显示状态发生变化时触发
            toggle_drawer(val, en) {
                if (JSON.stringify(this.rowData) !== '{}') {

                    this.bus.$emit('shrinkMenu', val);
                }
                if (!val) {
                    this.closeDrawer();
                }
            },
            // 关掉详情页
            closeDrawer() {
                this.$emit('update:showDetail', false);
                this.inputClue = false;
            },
            /* 以下为录入线索相关 */

            // 录入线索
            async enterClue(createCustomer) {
                if (createCustomer) {
                    this.createCustomer = createCustomer;
                }
                if (this.type === 'visitorHistory') {
                    this.json_data = Object.assign({}, this.rowData, {
                        proj: this.rowData.visitorId,
                        sourceUrl: this.rowData.firstVisitorAddress,
                        templateId: this.templateId,
                        enterpriseId: this.enterpriseId,
                        userId: this.userId,
                        userName: this.userName,
                        serviceName: this.rowData.receptionServer,
                        serviceId: this.rowData.receptionServerAccid,
                        source: MY_CHAT
                    });
                } else {
                    // 除了访客历史之外的地方调用组件还是使用 表格传递的数据row
                    this.json_data = Object.assign({}, this.row, {
                        enterpriseId: this.enterpriseId,
                        userId: this.userId,
                        userName: this.userName,
                        source: 2,
                        serviceName: this.simpleInfo.receptionServer,
                        serviceId: this.simpleInfo.receptionServerAccid
                    });
                    // if (this.type === 'webMsg') { // 迁移网站留言 获取 是否录入地方
                    //     const crmStatus = visitInfo.crmStatus;
                    //     this.status = (!crmStatus || !['1', '2', '3', '102'].some(v => v === crmStatus)) ? '1' : crmStatus;
                    // }
                }

                this.inputClue = true;
            },
            // 关掉录入线索模态框
            open_close(data) {
                this.inputClue = data.close;
            },
            // 取消录入线索
            on_cancle_clue(data) {
                this.inputClue = data.close;
                this.createCustomer = data.close;
            },
            getXSShow() {
                util.ajax({
                    /* 获取线索表单字段 */
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        this.templateId = res.data.data.template.id;
                        this.fieldObj = res.data.data.show;
                    }
                });
            },
            // 获取访客状态
            getStatus() {
                // if (this.type === 'webMsg') return false; // 将网站的status 迁移到 getVisitorInfo 地方去
                if (Number(this.rowData.crmStatus) === 1 || this.rowData.crmStatus == null) {
                    this.status = '1';
                    // if (this.type === 'visitorHistory' || this.type === 'google') {
                    //     this.statusString = this.$t('website.notEnter');
                    // } else {
                    //     this.statusString = this.$t('website.unfollowed');
                    // }
                    if (this.type === 'google') {
                        this.getStatusByVisitorId();
                    }
                } else {
                    this.status = this.rowData.crmStatus.toString();
                    // 后端查到是5时 先按1 未建档处理
                    if (this.status === '5') {
                        this.status = '1';
                    }
                    if (this.type === 'google') {
                        this.getStatusByVisitorId();
                    }
                    // if (this.type === 'google') {
                    //     this.getStatusByVisitorId();
                    // } else if (this.type === 'visitorHistory') {
                    //     const temp = this.statusOptions.find(item => {
                    //         return item.value === this.status;
                    //     });
                    //     this.statusString = temp.label;
                    // } else {
                    //     const temp = this.statusOptionsWebmsg.find(item => {
                    //         return item.value === this.status;
                    //     });
                    //     this.statusString = temp.label;
                    // }
                }
            },
            // 修改访客状态弹窗显示
            changeStatus(status) {
                let options = [];
                let flag = '';
                if (this.type === 'visitorHistory') {
                    options = this.statusOptions;
                    flag = '访客状态';
                } else if (this.type === 'webMsg') {
                    options = this.statusOptionsWebmsg;
                    flag = '网站留言';
                }
                const statusObj = options.find(item => item.value === status);
                statusObj && this.$confirm(
                    `${this.$t('visitor_history.confirm_to')}${flag}${this.$t('visitor_history.set')}【${statusObj.label}】?`,
                    this.$t('visitor_history.confirm_change'),
                    {
                        showClose: true
                    }
                ).then(() => {
                    this.changeToNotEnterOrIrrelevant(status);
                });
            },
            // 确认修改状态(未录入，无关)
            async changeToNotEnterOrIrrelevant(status) {
                if (this.type === 'visitorHistory') {
                    const visitorId = this.rowData.visitorId; // 访客id
                    const orgId = this.enterpriseId; // 企业id
                    const originalVisitorStatus = this.rowData.crmStatus || ''; // 访客原状态
                    const visitorStatus = status; // 访客修改后状态  1.未录入 2.已录入3.无关 默认是未录入 默认1未录入
                    const visitorClueId = ''; // 访客被录入到线索后的线索id
                    const updateUserId = this.userId; // 录入人id

                    const crmStatus = status;
                    const sourceCrmStatus = this.rowData.crmStatus;

                    let resData;
                    if (this.rowData.piwikFlag) {
                        resData = await changeStatusPiwik({
                            visitorId,
                            orgId,
                            originalVisitorStatus,
                            visitorStatus,
                            visitorClueId,
                            updateUserId
                        });
                    } else { // 旧接口
                        resData = await changeStatusOld({ visitorId, crmStatus, crmTargetId: '', sourceCrmStatus });
                    }
                    // if (resData.code === '1') {
                    //     switch (status) {
                    //         case '1':
                    //             this.$Message.success(`访客状态${this.$t('visitor_history.reset_success')}`);
                    //             break;
                    //         case '2':
                    //             break;
                    //         case '3':
                    //             this.$Message.success(`访客状态${this.$t('visitor_history.trash_success')}`);
                    //             break;
                    //     }
                    //     this.$emit('changeRowData', {
                    //         row: this.rowData,
                    //         key: 'crmStatus',
                    //         value: status
                    //         // index: this.index
                    //     });
                    //     // 更新"updatedId" , 触发访客历史表格页刷新
                    //     this.$store.commit('visitor_history/setUpdatedId', null);
                    //     this.$nextTick(() => {
                    //         this.$store.commit('visitor_history/setUpdatedId', visitorId);
                    //     });
                    // }
                }
                // 修改网站留言的状态
                this.changeOk_msg(status);
            },
            // 从网站留言跳转过来时的修改状态方法
            changeOk_msg(status) {
                const id = this.row.id;
                util.ajax({
                    url: '/form-cust/form/updateColumnValueStatus',
                    method: 'post',
                    data: {
                        id,
                        status: Number(status)
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        // switch (Number(status)) {
                        //     case 1:
                        //         /* 状态更改为未录入 */
                        //         this.$Message.success(`留言状态${this.$t('visitor_history.unfollowed_success')}`);
                        //         break;
                        //     case 100:
                        //         /* 状态更改为无关 */
                        //         this.$Message.success(`留言状态${this.$t('visitor_history.trash_success')}`);
                        //         break;
                        //     case 103:
                        //         /* 状态更改为二次咨询 */
                        //         this.$Message.success(`留言状态${this.$t('visitor_history.twiceAsk_succsee')}`);
                        //         break;
                        //     default:
                        //         break;
                        // }
                        // 有网站留言目录时, 更新 formList 给 Main.vue 用
                        if (this.isContainsMenu('website_message')) {
                            this.$store.dispatch('website_msg/getFormList');
                        }
                        // this.$emit('changeRowData', {
                        //     row: this.rowData,
                        //     key: 'crmStatus',
                        //     value: Number(status)
                        //     // index: this.index
                        // });
                        // // 更新"updatedId" , 触发网站留言表格页刷新
                        // this.$store.commit('website_msg/setUpdatedId', null);
                        // this.$nextTick(() => {
                        //     this.$store.commit('website_msg/setUpdatedId', id);
                        // });
                    }
                });
            },
            // ================================================================== 改变
            updateStatus(clueId, status) {
                // console.log('录入成功改变状态', clueId, status);
                this.clueId = clueId;
                this.status = status;
                // 从网站留言跳转过来时, 调用接口更改状态
                // 看代码发现, type 为访客历史时也有调用接口, 但是是在 enter-clue.vue 的 returnUpdateStatus 中调用的
                // if (this.type === 'webMsg') {
                //     this.status = status;
                //     const id = this.row.id;
                //     util.ajax({
                //         url: '/form-cust/form/updateColumnValueStatus',
                //         method: 'post',
                //         data: {
                //             id,
                //             status: status
                //         }
                //     }).then(res => {
                //         if (res.data.code !== '1') {
                //             this.$Message.error(res.data.message);
                //         }
                //     });
                // }
                // 刷新表格页
                // setTimeout(() => {
                    if (this.type === 'webMsg') {
                        const id = this.row.id;
                        // 更新"updatedId" , 触发网站留言表格页刷新
                        this.$store.commit('website_msg/setUpdatedId', null);
                        this.$nextTick(() => {
                            this.$store.commit('website_msg/setUpdatedId', id);
                        });
                    }
                    if (this.type === 'visitorHistory') {
                        // 更新"updatedId" , 触发访客历史表格页刷新
                        this.$store.commit('visitor_history/setUpdatedId', null);
                        this.$nextTick(() => {
                            this.$store.commit('visitor_history/setUpdatedId', this.row.visitorId);
                        });
                    }
                    // 改变表格页数据
                    this.$emit('changeRowData', {
                        row: this.rowData,
                        key: 'crmStatus',
                        value: status,
                        // index: this.index,
                        clueId: clueId
                    });
                // 因为录入询盘后立即查询状态 查询的询盘状态没有改变所有加一个2秒延迟 具体解决方法还要看后端
                // },2000)
                // this.openCrm();
            },

            getCrmPrivilege(data) {
                return new Promise((resolve, reject) => {
                    util.ajax({
                        url: 'crm/inquiry/getFormOrInquiryDetailInfo',
                        method: 'get',
                        params: {
                            type: data.type,
                            id: data.id[0],
                            userId: this.userId,
                            orgId: this.enterpriseId
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            return resolve(res.data.data);
                        }
                    });
                });
            },
            openCrm(type) {
                if (this.littleDrawerVisible && !type) return;
                // if ([1].includes(this.row.crmStatus) && !this.row.contactProfileInfoDto.touchPointContactId) {
                //     this.$Message.error('没有对应的触点联系人');
                //     return;
                // }
                localStorage.setItem('openSlideBarForWA', true);
                this.currAccountInfo = this.row.contactProfileInfoDto;
                this.littleDrawerVisible = false;
                this.$nextTick(() => {
                    this.littleDrawerVisible = true;
                });
                // const openCrmBtn = this.$refs.openCrmBtn;
                // if (openCrmBtn) {
                //     if (Array.isArray(openCrmBtn)) {
                //         openCrmBtn.forEach(item => {
                //             item.$el.blur();
                //         });
                //     } else {
                //         openCrmBtn.$el.blur();
                //     }
                // }

                // util.ajax({
                //     url: '/crm/inquiry/getInquiryIdByVisitorId',
                //     method: 'get',
                //     params: {
                //         orgId: this.enterpriseId,
                //         visitorId: this.row.visitorId
                //     }
                // }).then(async res => {
                //     if (res.data.code === '1') {
                //         this.visitorType = res.data.data.type;
                //         // 如果是访客历史模块，增加权限判断
                //         if (this.type === 'visitorHistory') {
                //             const isHavePrivilegeToOpenCrm = await this.getCrmPrivilege(res.data.data);
                //             if (!isHavePrivilegeToOpenCrm) {
                //                 this.$Message.error(this.$t('visitor_history.haveNoPrivilege'));
                //                 return;
                //             }
                //         }
                //         if (res.data.data.type === 2) {
                //             this.$store.state.currClueId = res.data.data.id[0];
                //             this.clueId = res.data.data.id[0];
                //             this.showClue();
                //         } else if (res.data.data.type === 1) {
                //             this.inquiryId = res.data.data.id[0];
                //             this.showCompany();
                //         }
                //     }
                // });
            },
            handleClick() {

            },
            littleDrawerHidden() {
                localStorage.removeItem('openSlideBarForWA');
                this.littleDrawerVisible = false;
            },
            emitFreshLeadsCLoudsStatus(data) {
                this.$set(this.row, 'contactProfileInfoDto', data);
                this.$set(this.row, 'crmStatus', data.status);
                if (this.row.status) {
                    this.$set(this.row, 'status', data.status);
                }
                this.changeToNotEnterOrIrrelevant(data.status);
            },
            showCompany() {
                this.show_clue_detail = false;
                this.show_inquiry_detail = false;
                this.$nextTick(() => {
                    this.show_inquiry_detail = true;
                });
            },
            showClue(clueId, type) {
                this.show_inquiry_detail = false;
                this.show_clue_detail = false;
                this.$nextTick(() => {
                    this.show_clue_detail = true;
                });
            },

            // 绑定给当前所处的 DOM (single-page) 的点击事件, 点击表格条目以外的操作将关闭最上一层 drawer --- 感觉没啥用
            click_blank(e) {
                let boo = true;

                let temp_el = e.target;

                while (!temp_el.classList.contains('single-page')) {
                    if (temp_el.classList.contains('el-table__row') || temp_el.classList.contains('visitor-detail')) {
                        boo = false;
                        break;
                    } else {
                        temp_el = temp_el.parentElement;
                    }
                }
                if (boo) {
                    this.visible = false;
                    this.$emit('update:showDetail', false);
                }
            },

            getFormByVisitorId() {
                // console.log('获取留言信息');
                util.ajax({
                    url: '/form-cust/form/getColumnValueListByVisitorId',
                    method: 'post',
                    data: {
                        visitorId: this.row.visitorId
                    }
                }).then(ret => {
                    // console.log('ret', ret);
                    if (ret.data.code === '1') {
                        this.leaveMessageCount = ret.data.data.length;
                    } else {
                        this.leaveMessageCount = 0;
                    }
                });
            },

            getInfoById() {
                this.customerInfo.title = '';
                util.ajaxInternational({
                    url: '/piwikRead/visitorInfo/getVisitorInfo',
                    method: 'get',
                    params: {
                        visitorId: this.row.visitorId || this.row.proj
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.simpleInfo = response.data.data || {};

                        this.customerInfo.title = this.simpleInfo.visitorName;
                        // 如果是访客历史页面进来的则使用接口查询的数据展示rowdata
                        // 否则就使用表格传入的row展示rowdata
                        if (this.type === 'visitorHistory') {
                            this.rowData = response.data.data || {};
                        } else {
                            this.rowData = this.row;
                        }
                        // if (this.type === 'webMsg') { // 迁移网站留言 获取 是否录入地方
                        //     const crmStatus = this.simpleInfo.crmStatus;
                        //     this.status = (!crmStatus || !['1', '2', '3', '102'].some(v => v === crmStatus)) ? '1' : crmStatus;
                        // }
                        // this.getLocusSideStatus();
                    } else {
                        this.rowData = this.row;
                        this.$Message.error(response.data.message);
                    }
                    if (localStorage.getItem('openSlideBarForWA')) {
                        this.openCrm('new');
                    } else {
                        this.littleDrawerVisible = false;
                    }
                    // this.getStatus();
                });
            }
        },
        created() {
            if (this.type === 'webMsg') {
                this.tabList = [
                    {
                        label: this.$t('visitor_history.all'),
                        name: 'VisitorLine'
                    },
                    {
                        label: this.$t('visitor_history.visitorFrom'),
                        name: 'visitorFrom'
                    },
                    {
                        label: this.$t('visitor_history.visitorChat'),
                        name: 'visitorChat'
                    },
                    {
                        label: this.$t('visitor_history.visitorTrace'),
                        name: 'visitorTrace'
                    }
                ];
            }
            this.getXSShow();
            // 获取 crm
            // this.get_columns_authorized();
            // 获取 下拉选项数据 CRMDrawerList和ClueDrawerList弹窗组件中的子组件有用到，在此调用下
            // this.$store.dispatch('getSelectOptions');
            // 获取全部销售人员 新增线索弹框有用到，在此调用下
            this.$store.dispatch('getSalesList');
        },
        mounted() {
        },
        beforeDestroy() {
            if (document.getElementsByClassName('single-page')[0]) {
                document.getElementsByClassName('single-page')[0].removeEventListener('click', this.click_blank);
            }
        },
        watch: {
            showDetail: {
                handler(val) {
                    this.visible = val;
                    // this.toggle_drawer(val, 'main');
                    if (document.getElementsByClassName('single-page')[0]) {
                        if (val) {
                            document.getElementsByClassName('single-page')[0].addEventListener('click', this.click_blank);
                        } else {
                            document.getElementsByClassName('single-page')[0].removeEventListener('click', this.click_blank);
                        }
                    }
                },
                immediate: true
            },
            row: {
                handler: function(val) {
                    if (Object.keys(val).length) {
                        this.littleDrawerVisible = false;
                        this.current_compo = 'VisitorLine';
                        this.show_clue_detail = false;
                        this.show_inquiry_detail = false;
                        this.mutualTabList = [{
                            name: 'webInteract',
                            label: this.$t('visitor_history.webInteract')
                        }];
                        this.currentMutual = 'webInteract';
                        this.getInfoById();
                        this.getFormByVisitorId();
                    }
                },
                immediate: true,
                deep: true
            },
            visible: {
                handler(val) {
                    if (val) {
                        this.$store.commit('set_visitor_drawer_show', true);
                        if (localStorage.getItem('openSlideBarForWA')) {
                            this.openCrm('new');
                        } else {
                            this.littleDrawerVisible = false;
                        }
                    } else {
                        this.littleDrawerVisible = false;
                        this.$store.commit('set_visitor_drawer_show', false);
                    }
                },
                immediate: true
            },
            locusSideStatus: {
                handler(val) {
                    // this.mutualTabList = [];
                    let tab = [{
                        name: 'webInteract',
                        label: this.$t('visitor_history.webInteract')
                    }];
                    if (val.some(item => item === 'messenger')) {
                        tab.push({
                            label: this.$t('visitor_history.facebookInteraction'),
                            name: 'FacebookInteractionInfo'
                        })
                    } else {
                        tab = tab.filter(item => item.name !== 'FacebookInteractionInfo')
                    }
                    if (val.some(item => item === 'whatsapp')) {
                        tab.push({
                            label: this.$t('visitor_history.whatsappInteraction'),
                            name: 'whatsAppRelatedRecords'
                        })
                    } else {
                        tab = tab.filter(item => item.name !== 'whatsAppRelatedRecords')
                    }
                    if (val.some(item => item === 'Mail')) {
                        tab.push({
                            label: this.$t('timeLine.mail'),
                            name: 'Mail'
                        })
                    } else {
                        tab = tab.filter(item => item.name !== 'Mail')
                    }
                    this.mutualTabList = tab;
                }
            },
            currentMutual: {
                handler(val) {
                    if (val === 'FacebookInteractionInfo') {
                        this.getMessagerData();
                    }
                }
            }
        }
    };
</script>

<style lang="less">
    .visitor-detail .ivu-drawer-body {
        overflow:hidden;

    }

    .visitor-timeline {
        .logo-btn {
            float:right;
            margin-right:20px;
            &:hover {
                cursor:pointer;
            }
        }
    }
    @import './visitor-detail.less';

    .more-width {
        width:85px !important;
    }
</style>

<style lang="less" scoped>
.second-tab{
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
</style>
