<template>
    <div id="mailSinglePage" class="mail-home">
        <Container :style="((isCrmDetailFixed || littleDrawerMailDetailFixed) && !isFixed ? 'width:calc(100% - 400px);' : '')">
            <router-view
                ref="routerView"
                :content_height="content_height"
                :corp_columns_authorized="corp_columns_authorized"
                :inquiry_columns_authorized="inquiry_columns_authorized"
                :contact_columns_authorized="contact_columns_authorized"
                :mailInterForwardingTreeData="mailInterForwardingTreeData"
                :taskObj="taskObj"
                :showToggleMailDetail="false"
                :toRouterObj="toRouterObj"
                :mailModelVisible.sync="mailModelVisible"
                :authorized_button="authorized_button"
                @handleTaskModal="handleTaskModal"
                @handleClick="handleClick"
            >
            </router-view>
        </Container>
        <TaskModal
            v-if="taskModalShow"
            :visible.sync="modalShow"
            :type="modalType"
            :fromModule="fromModule"
            :taskObjProp="taskModalData"
            refreshMethodName="getMailTableData"
            @setTask="setTask"></TaskModal>
        <!-- 新增个人通讯录联系人 -->
        <AddContact
            :letAddModalShow="letAddModalShow"
            :newContactInfo="newContactInfo"
            :editContactInfo = "{}"
            @isAddModalShow="state=>letAddModalShow=state">
        </AddContact>
         <!-- 新建邮件收发信规则 -->
        <newRules
            v-if="newRulesModalShow"
            fromModal="mail"
            :mailAddress="newContactInfo.email"
            :letAddModalShow.sync="newRulesModalShow">
        </newRules>
        <!-- 录入线索模态框 -->
        <!-- <ClueModal
            v-model="inputClue"
            :title="$t('visitor_history.add_clue')"
            class="modal companydata"
            :delLoading="false"
            :json_data="json_data"
            saveClueClass="piwik-mail-enter-clue"
            saveClueAndInquiryClass="piwik-mail-enter-inquiry"
            okEnterInquiryClass="mail_inquirySubmit"
            :hide="enterpriseId + '' !== '1000' && enterpriseId + '' !== '1002'"
            type="mail"
            from="journeyDetail"
            @open_close="open_close"
            @on_cancle_clue="on_cancle_clue"
            @returnLeadsId="updateStatus"
            @updateInquiryStatus="updateStatus"
            >
        </ClueModal> -->
        <!-- 新建客户 -->
        <!-- <NewCompany :visible.sync="newCompanyShow"
            type="mail"
            :saleList="salesList"
            :json_data="json_data"
            :mailAddress="createCompanyAddress"
            WAAccount=""
            @returnUpdateStatus="updateStatus"
            @updateInquiryStatus="updateStatus"></NewCompany> -->
        <!--打开发送邮件页面-->
        <replyMailModal
                :visible.sync="replyMailVisible"
                :mailDetailMailEdit="mailDetailMailEdit"
                :mailDetailId="mailDetailId"
                :mailDetailReplyType="mailDetailReplyType"
                :createUserId="mailDetailCreateUserId"
                @sendMail="sendMail"
                ref="replyMailModal"
        ></replyMailModal>
    </div>
</template>

<script>
    import Vue from 'vue';
    import { insertScript } from '@/utils/staticDatas';
    import base from '@/utils/base';
    import util from '@/libs/util';
    import Cookies from 'js-cookie';
    import { updateOpenedWindowList, removeOpenedWindowList } from '@/utils/storage';
    // import TaskModal from '@/views/crm/Detail/Components/Modal/taskModals';
    import AddContact from '@/views/mail/mail-settings/modal/add_contact';
    import newRules from '@/views/mail/mail-settings/modal/new_rules';
    // import ClueModal from '@/views/main-components/enter-clue/enter-clue';
    // import NewCompany from '@/views/clue-manage/Detail/Components/Modal/newCompany';
    import replyMailModal from '@/views/main-components/timeline/Components/replyMailModal';
    import { mapState } from 'vuex';
    import { clearAllInfo } from '@/utils/safe';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';

    export default {
        name: 'mailSinglePage',
        components: {
            // TaskModal,
            AddContact,
            newRules,
            // ClueModal,
            // NewCompany,
            replyMailModal
        },
        computed: {
            ...mapState({
                userId: 'userId',
                userName: 'userName',
                enterpriseId: 'enterpriseId',
                mailReadingMode: state => state.mail.mailReadingMode,
                unreadCount: state => state.mailUnread,
                currentPage: state => state.mail.currentPage,
                ws_receive_mail: state => state.mail.ws_receive_mail,
                currentPersonId: state => state.mail.currentPersonId,
                subordinatesMailUnread: state => state.mail.subordinatesMailUnread,
                allUnreadMails: state => state.mail.allUnreadMails,
                currentUnreadMails: state => state.mail.currentUnreadMails,
                window_height: state => state.window_height,
                allMailToDoCount: state => state.mail.allMailToDoCount,
                selectedMailBoxType: state => state.mail.selectedMailBoxType,
                currentAccount: state => state.mail.currentAccount,
                newReceiveMails: state => state.mail.newReceiveMails,
                salesList: state => state.crm.salesList,
                isFixed: 'isFixed',
                isCrmDetailFixed: 'isCrmDetailFixed',
                littleDrawerMailDetailFixed: 'littleDrawerMailDetailFixed',
                // main相关
                WS: state => state.socket.WS,
                websocketMsgMain: state => state.socket.websocketMsgMain,
                windowOpenTimeStamp: state => state.app.windowOpenTimeStamp,
                quickSendMailVisible: state => state.mail.quickSendMailVisible,
                button_list: state => state.app.button_list
            }),
            // 按钮权限
            authorized_button() {
                const id = BUTTON_IDS.Mail.download;
                return {
                    download: !HANDLE_BUTTON(id, this.button_list)
                };
            }
        },
        watch: {
            websocketMsgMain: {
                handler(msgData) {
                    if (msgData) {
                        if (msgData.type === 'hasSameAccountLogin') {
                            // websocket 通知: 当前账号在其他标签页登录
                            if (!['10171', '1001', '10194', '11741', '11800', '12009', '11688'].includes(`${this.enterpriseId}`)) {
                                this.$Message.warning({
                                    message: this.$t('MultiterminalLoginTip'),
                                    duration: 10000,
                                    closable: true
                                });
                                // 追加错误信息到 localStorage , 跳转到登录页之后打印错误信息, 并清除此 localStorage
                                let quitReason = localStorage.getItem('quitUnexpectedlyReason') || '';
                                quitReason += 'hasSameAccountLogin;';
                                localStorage.setItem('quitUnexpectedlyReason', quitReason);

                                this.logoutServiceOK();
                            }
                        }
                    }
                }
            },
            quickSendMailVisible: {
                handler(val) {
                    if (val) {
                        this.mailDetailMailEdit = '';
                        this.mailDetailId = '';
                        this.mailDetailCreateUserId = '';
                        this.mailDetailReplyType = '';
                        this.replyMailVisible = true;
                    }
                }
            },
            replyMailVisible: {
                handler(val) {
                    if (!val) {
                        this.$store.commit('setQuickSendMailVisible', false);
                    }
                }
            }
        },
        data() {
            return {
                publicPath: process.env.BASE_URL,
                content_height: '0px',
                replyMailVisible: false,
                mailDetailMailEdit: '',
                mailDetailId: '',
                mailDetailReplyType: '',
                mailDetailCreateUserId: '',
                mailModelVisible: false,
                email_id: null,
                groupBoxId: '',
                toRouterObj: null, // 要跳转去的路由name
                // TaskModal相关
                taskObj: null,
                taskModalShow: false,
                modalShow: false,
                taskModalData: null,
                fromModule: '',
                modalType: 'newTask', // showTask（详情）、newTask（新建）、editTask（编辑）
                letAddModalShow: false, // 新建个人通讯录联系人
                newContactInfo: {},
                newRulesModalShow: false, // 新建收发件规则
                // 录入线索相关
                inputClue: false,
                json_data: {},
                templateId: '',
                // 录入客户相关
                newCompanyShow: false,
                createCompanyAddress: '',
                // crm 相关
                corp_columns_authorized: {},
                contact_columns_authorized: {},
                inquiry_columns_authorized: {},
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
                /* 内部转发相关 */
                mailInterForwardingTreeData: [] // 经处理之后得到的最终企业部门树
            };
        },
        methods: {
            saveUserIdInStorage: function() {
                const userId = Cookies.get('userId');
                // const accId = Cookies.get('accId');
                // const userName = Cookies.get('userName');
                // const fullName = decodeURI(Cookies.get('fullName'));
                const enterpriseId = Cookies.get('enterpriseId');
                // let relatedAccounts = Cookies.get('relatedAccounts');
                // this.$store.commit('setUserName', userName);
                // this.$store.commit('setFullName', fullName);
                this.$store.commit('setUserId', {
                    userId: userId
                });
                this.$store.commit('setEnterpriseId', enterpriseId);
                if (localStorage.getItem('current_tenant')) {
                    const currentTenant = JSON.parse(localStorage.getItem('current_tenant'));
                    this.$store.commit('setUserName', currentTenant.nickName);
                    this.$store.commit('setFullName', currentTenant.nickName);
                }
                // if (relatedAccounts) {
                //     relatedAccounts = parseArray(relatedAccounts);
                //     if (Array.isArray(relatedAccounts)) {
                //         this.$store.commit('setRelatedAccounts', relatedAccounts);
                //     }
                // }
                // 如果要设置特殊值，务必在自己的模块里设置局部变量，以免污染全局
                this.$store.commit('setHasChatAuthority', true);
            },
            /* 点击写信按钮的回调 */
            writeMail() {
                this.replyMailVisible = true;
                if (this.$refs.routerView && this.$refs.routerView.littleDrawerHidden) {
                    this.$refs.routerView.littleDrawerHidden();
                }
                this.$store.commit('setMailEdit', false);
            },
            handleTaskModal(params) {
                this.taskModalShow = false;
                this.modalShow = false;
                this.$nextTick(() => {
                    this.taskModalShow = true;
                    this.$nextTick(() => {
                        this.modalType = params.modalType;
                        this.fromModule = params.fromModule;
                        this.taskModalData = params.taskModalData;
                        this.modalShow = true;
                    });
                });
            },
            getMailTableData() {
                if (this.fromModule !== 'writeMail' && this.$refs.routerView.refreshDataList) {
                    this.$refs.routerView.refreshDataList(this.taskModalData.relatObjId);
                }
            },
            setTask(data) {
                this.taskObj = data;
            },
            /* 获取线索表单字段 */
            getXSShow() {
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        this.templateId = res.data.data.template.id;
                    }
                });
            },
            // 获取crm授权字段
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
                        if (this.corp_columns_authorized.default) {
                            this.corp_columns_authorized.default.forEach(item => {
                                if (this.lang_company.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_company[item.storageName];
                                }
                            });
                        }
                        if (this.contact_columns_authorized.default) {
                            this.contact_columns_authorized.default.forEach(item => {
                                if (this.lang_contact.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_contact[item.storageName];
                                }
                            });
                        }
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
            // 小人头 或 little-drawer弹窗按钮功能
            handleClick(params) {
                if (params.clickType === 'writeMail') {
                    if (params.newMailInfo) {
                        this.mailDetailMailEdit = '';
                        this.mailDetailId = '';
                        this.mailDetailCreateUserId = '';
                        this.mailDetailReplyType = '';
                        const emails = [{
                            receiverName: params.newMailInfo.nickName || '',
                            receiveMailAddress: params.newMailInfo.mailAddress || '',
                            followUpId: params.newMailInfo.followUpId ? params.newMailInfo.followUpId : '',
                            followUpType: params.newMailInfo.followUpType ? params.newMailInfo.followUpType : ''
                        }];
                        localStorage.setItem('leadsCloud-sendMail-contacts', JSON.stringify(emails));
                    } else {
                        this.mailDetailMailEdit = params.mailEdit;
                        this.mailDetailId = params.mailId;
                        this.mailDetailCreateUserId = params.createUserId;
                        this.mailDetailReplyType = params.replyType;
                    }
                    // const emails = [{
                    //     receiverName: params.newMailInfo.nickName || '',
                    //     receiveMailAddress: params.newMailInfo.mailAddress || '',
                    //     followUpId: params.newMailInfo.followUpId ? params.newMailInfo.followUpId : '',
                    //     followUpType: params.newMailInfo.followUpType ? params.newMailInfo.followUpType : ''
                    // }];
                    // localStorage.setItem('leadsCloud-sendMail-contacts', JSON.stringify(emails));
                    this.replyMailVisible = true;
                    // this.writeMail();
                } else if (params.clickType === 'createContent') {
                    this.createContent(params.newMailInfo);
                } else if (params.clickType === 'createRule') {
                    this.createRule(params.newMailInfo);
                } else if (params.clickType === 'createNewClue') {
                    this.createClue(params.newMailInfo);
                } else if (params.clickType === 'createNewCompany') {
                    this.createCompany(params.newMailInfo);
                }
            },
            sendMail() {
                setTimeout(() => {
                    this.$refs.routerView.mailDetailinit();
                }, 500);
            },
            // 创建联系人
            createContent(currAccountInfo) {
                this.newContactInfo = {
                    email: currAccountInfo.mailAddress,
                    name: currAccountInfo.nickName
                };
                this.letAddModalShow = true;
            },
            // 新建收发件规则
            createRule(currAccountInfo) {
                this.newContactInfo = {
                    email: currAccountInfo.mailAddress,
                    name: currAccountInfo.nickName
                };
                this.newRulesModalShow = true;
            },
            // 关掉录入线索模态框
            open_close(data) {
                this.inputClue = data.close;
            },
            // 取消录入线索
            on_cancle_clue(data) {
                this.inputClue = data.close;
            },
            createClue(data) {
                this.inputClue = false;
                this.json_data = {
                    templateId: this.templateId,
                    enterpriseId: this.enterpriseId,
                    source: 3,
                    userId: this.userId,
                    userName: this.userName,
                    a10010: data.mailAddress,
                    a1009: data.nickName,
                    id: data.mailId
                };
                this.$nextTick(() => {
                    this.inputClue = true;
                });
            },
            createCompany(data) {
                this.newCompanyShow = false;
                this.json_data = {
                    nickName: data.nickName
                };
                this.$nextTick(() => {
                    this.newCompanyShow = true;
                });
                this.createCompanyAddress = data.mailAddress;
            },
            updateStatus(clueId, status) {
                this.$refs.routerView.getAllContactsStatus();
            },
            /* 获取内部转发的企业人员信息 --- 为全部企业人员中排除掉离职的部分 */
            getDepartmentUserTreeData() {
                this.$commonApi.getDepartmentUserTree({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    relationType: 1 // 只查直属部门
                }).then(res => {
                    if (res.code === 10000) {
                        this.mailInterForwardingTreeData = this.$dym.extend(res.data, true);
                        localStorage.setItem('mailInterForwardingTreeData', JSON.stringify(this.mailInterForwardingTreeData));
                        console.log(this.mailInterForwardingTreeData);
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.departmentErr'));
                    }
                });
                // util.ajaxJson({
                //     url: '/new-privilege/user/departmentUserTreeData',
                //     method: 'post',
                //     data: {
                //         departmentId: 0,
                //         orgId: this.enterpriseId,
                //         pageNo: 1,
                //         pageSize: 2000
                //     }
                // }).then(({ data }) => {
                //     if (data.code === '1') {
                //         this.mailInterForwardingTreeData = data.data.list;
                //         localStorage.setItem('mailInterForwardingTreeData', JSON.stringify(this.mailInterForwardingTreeData));
                //     } else {
                //         this.$Message.error(this.$t('authority.userManagement.departmentErr'));
                //     }
                // });
            },
            // 写信后的无感刷新
            handleUpdateTableData(params) {
                if (this.view && this.$refs.routerView && this.$refs.routerView.handleUpdateTableData) {
                    this.$refs.routerView.handleUpdateTableData({ ...params });
                }
            },
            // main 相关逻辑
            // visibilitychange 事件监听
            onVisibilityChange() {
                // 不同浏览器 hidden 名称
                const hiddenProperty = 'hidden' in document ? 'hidden' : 'webkitHidden' in document ? 'webkitHidden' : 'mozHidden' in document ? 'mozHidden' : null;
                this.$store.commit('setIsHidden', document[hiddenProperty]);
            },
            // 初始化 storage 监听器相关
            onStorageChange() {
                // 设置当前 window 开启时间
                this.$store.commit('setWindowOpenTimeStamp', Date.now());

                // 初始化存入当前时间戳到 localStorage
                updateOpenedWindowList(this.windowOpenTimeStamp);

                // 每隔 1s 就把自己当前的时间戳放到数组最后一位, 避免其他标签页意外关闭后仍存在于 localStorage 中导致提醒失效
                this.$store.commit('clearTimerUpdateSeq');
                this.$store.commit('setTimerUpdateSeq', setInterval(() => {
                    updateOpenedWindowList(this.windowOpenTimeStamp);
                }, 1000));

                // 初始化 storage 监听器
                window.addEventListener('storage', this.onStorageFunc);
            },
            // storage 监听函数
            onStorageFunc(e) {
                // 页面个数变化
                if (e.key === 'openedWindowList') {
                    const newValue = e.newValue ? JSON.parse(e.newValue) : '';
                    const oldValue = e.oldValue ? JSON.parse(e.oldValue) : '';
                    // 如果有询盘云标签页关闭
                    if (newValue.length < oldValue.length) {
                        /* 用于因为关闭了其它tab页,导致触发多端登录状态改变时（onloginportschange）判断当前页面是否退出聊天 */
                        this.$store.commit('setIsAllowToOffLine', false);
                    }
                }

                // 当其它标签页主动切换聊天在线、离线状态时
                if (e.key === 'chatStampList') {
                    if (e.newValue) {
                        if (e.newValue.indexOf('on') > -1) {
                            /* 其它tab登录了聊天,让当前页面的聊天处于登录状态 */
                            console.error('触发上下线方法, 事件类型: onStorageFunc, chatStampList on', e.newValue);
                            this.$refs.personDropdown.isOnline(true, 0);
                        }
                        this.$store.commit('setIsAllowToOffLine', true);
                    }

                    return;
                }

                // 标签页退出
                if (e.key === 'XHLLogin') {
                    // 有一个标签页退出，所有都得退出
                    if (e.newValue === 'LOGOUT') {
                        /**
                         * @Description: 【ID1009310】乐达定制需求--跳转新标签页切换账户，账户会自动退出
                         * 乐达美业定制需求, 集团下有多个企业时可直接切换关联账号查看不同企业的数据
                         * 多个标签页时, 新标签页切换账号, 其他页面发现 cookie 和 vuex 状态不匹配, 会退回到登录页修改了 XHLLogin 值, 于是所有标签页都触发此处方法退出询盘云
                         * 为避免这种情况, 此处增加判断 --- 如果有关联账号 + 当前 Cookie 中的值和 vuex 中的值一致, 则不退出询盘云
                         * @author 汤一飞
                         * @date 2021/1/20
                        */
                        if (this.relatedAccounts) {
                            if (Cookies.get('enterpriseId') &&
                                `${Cookies.get('enterpriseId')}` === `${this.enterpriseId}` &&
                                Cookies.get('userId') &&
                                `${Cookies.get('userId')}` === `${this.userId}`) {
                                return;
                            }
                        }

                        // this.seeUserOnline();
                    }

                    return;
                }

                // 发生点击事件, 停止标题闪动
                if (e.key === 'xhlWindowClick') {
                    if (e.newValue !== '0') {
                        // 停止页面标题闪动消息提示
                        window.parent.document.title = this.sourceDocumentTitle;
                        this.$store.commit('changeNewRemindFlag', false);
                    }

                    return;
                }
            },
            seeUserOnline() {
                const accId = Cookies.get('accId');
                if (accId) {
                    util.ajaxInternational({
                        url: '/visitor-chat/server/isMyselfOnlineByAccid',
                        method: 'post',
                        data: {
                            accid: accId
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            // this.getAllEnterpriseService();
                        } else {
                            this.logoutServiceOK();
                        }
                    });
                } else {
                    this.logoutServiceOK();
                }
            },
            logoutServiceOK() {
                const userId = Cookies.get('userId');

                if (userId) {
                    util.ajax({
                        url: '/cuss-login/logout',
                        method: 'post',
                        data: {
                            userId: userId
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            // 移除localStorage的超管权限
                            localStorage.removeItem('isSuperAdmin');

                            this.$Message.closeAll();
                            this.$Notice.closeAll();
                            this.$store.commit('updateChatViewStatus', true);
                            this.$store.commit('resetChat');
                            this.$store.commit('confirmNotChatWithOther', false);
                            this.$store.commit('clearOpenedSubmenu');
                            this.$store.commit('clearAllTags');
                            // 重置数据迁移的变量
                            this.$store.commit('cleanDataMovement');
                            this.$store.commit('logout', this);
                            // 关闭 websocket 链接
                            this.$store.commit('closeWS');
                            this.$Message.success(this.$t('main.logoutSuccess'));
                            this.$router.push({
                                name: 'login'
                            });
                        } else {
                            this.$Message.warning(this.$t('main.logoutFail'));
                        }
                        clearAllInfo();
                    });
                } else {
                    this.$store.commit('resetChat');
                    // 关闭 websocket 链接
                    this.$store.commit('closeWS');
                    this.$router.push({
                        name: 'login'
                    });
                    clearAllInfo();
                }
                // clearAllInfo();
            },
            // 取消事件监听
            offStorageChange() {
                // 清除更新数组定时器
                this.$store.commit('clearTimerUpdateSeq');
                // 取消事件监听
                window.removeEventListener('storage', this.onStorageFunc);
                // 清除数据
                removeOpenedWindowList(this.windowOpenTimeStamp);
                // 设置当前 window 开启时间为 0 (默认值)
                this.$store.commit('setWindowOpenTimeStamp', 0);
            },
            /* 格式化日期 */
            dateformat() {
                // eslint-disable-next-line no-extend-native
                Date.prototype.format = function(fmt) {
                    const o = {
                        'M+': this.getMonth() + 1, // 月份
                        'd+': this.getDate(), // 日
                        'h+': this.getHours(), // 小时
                        'm+': this.getMinutes(), // 分
                        's+': this.getSeconds(), // 秒
                        'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
                        S: this.getMilliseconds() // 毫秒
                    };
                    if (/(y+)/.test(fmt)) {
                        fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()
                        }`).substr(4 -
                            RegExp.$1.length));
                    }
                    for (const k in o) {
                        if (new RegExp(`(${k})`).test(fmt)) {
                            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
                                ? (o[k])
                                : ((`00${o[k]}`).substr((`${o[k]}`).length)));
                        }
                    }
                    return fmt;
                };
            }
        },
        created() {
            this.saveUserIdInStorage();
            Vue.use(base);
            // 不阻塞的放上面
            insertScript(`${this.publicPath}iconfont.js`, true, false, 'high');
            // 阻塞的放下面
            insertScript(`${this.publicPath}twemoji.min.js`, true, true, 'high');
            // 监听 storage 变化
            this.onStorageChange();
            // 监听浏览器 visibilitychange 事件, 当前标签页可见状态变更时触发相应代码
            // 不同浏览器 hidden 名称
            const hiddenProperty = 'hidden' in document ? 'hidden' : 'webkitHidden' in document ? 'webkitHidden' : 'mozHidden' in document ? 'mozHidden' : null;
            // 不同浏览器的 visibilitychange 事件名
            const visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
            // 开始监听
            document.addEventListener(visibilityChangeEvent, this.onVisibilityChange);

            // this.$store.dispatch('getCRMFieldAPI');
            // 获取crm 授权字段
            // this.get_columns_authorized();
            // this.getXSShow();
            // 获取全部销售人员 线索弹窗录询盘用
            // this.$store.dispatch('getSalesList');
            // 获取 下拉选项数据 子组件有用到 更新下
            // this.$store.dispatch('getSelectOptions');
            // 获取自定义文件夹
            this.$store.dispatch('getFolders');
            // const buttonList = JSON.parse(localStorage.getItem('BUTTONS'));
            // this.$store.commit('set_button_list', buttonList);
            // 从 localStorage 获取授权目录列表原始数据
            const menuList = JSON.parse(localStorage.getItem('roleMenu'));
            // 处理原始数据, 更新 vuex menuList (平铺数组), 更新 vuex roleMenu (原始数据)并存入 localStorage , 更新 vuex router_map (添加动态路由 + 给左侧目录使用)
            this.$store.commit('set_menu_list', menuList);
            // 连接 websocket
            if (!this.WS) {
                this.$store.dispatch('initSocket');
            }
            if (localStorage.getItem('mailInterForwardingTreeData')) {
                this.mailInterForwardingTreeData = JSON.parse(localStorage.getItem('mailInterForwardingTreeData'));
            } else {
                this.getDepartmentUserTreeData();
            }
        },
        beforeDestroy() {
            // 取消 storage 事件监听
            this.offStorageChange();
            // 去除监听浏览器 visibilitychange 事件
            // 不同浏览器 hidden 名称
            const hiddenProperty = 'hidden' in document ? 'hidden' : 'webkitHidden' in document ? 'webkitHidden' : 'mozHidden' in document ? 'mozHidden' : null;
            // 不同浏览器的 visibilitychange 事件名
            const visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
            // 去除监听
            document.removeEventListener(visibilityChangeEvent, this.onVisibilityChange);
        },
        destroyed() {
        },
        mounted() {
            this.dateformat();
            window.onresize = () => {
                this.$store.commit('set_window_height', document.documentElement.clientHeight - 10);
                this.$store.commit('set_window_width', document.documentElement.clientWidth);
                this.content_height = `${document.documentElement.clientHeight - 56}px`;
            };
            window.onresize();
            if (this.$refs.routerView && this.$refs.routerView.getTags) {
                this.$refs.routerView.getTags();
            }
        },
        beforeRouteLeave(to, from, next) {
            if (this.view !== 'WriteMail') {
                if (this.mailModelVisible) {
                    const { name, params } = to;
                    this.toRouterObj = { name, params };
                    this.$refs.WriteMail.handleCancel();
                } else {
                    next();
                }
            } else if (this.toRouterObj && to.name === this.toRouterObj.name && !this.WriteMailModel) {
                next();
            } else if (to.name === 'login') {
                next();
            }
        }
    };
</script>

<style lang="less">
    @import "../../main.less";
    @import "../../crm/Detail/Components/less/detailPage";
    @import url(./mail-home.less);
    #mailSinglePage{
        height: 100%;
        font-size: 14px;
        .el-container{
            height: 100%;
            position: relative;
            overflow-x: auto;
        }
    }
</style>
