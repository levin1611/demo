import util from '@/libs/util';
import i18n from '@/locale';
import { router } from '@/router/index';
import { Message } from 'element-ui';

export default {
    state: {
        formBindView: 'FormTable',
        currentIndex: null,
        tableData: [],
        tableDataGone: [],
        facebookForm: {},
        leadscloudClue: {}, /* 线索模板 */
        leadscloudForm: {}, /* fb表单模板 */
        leadscloudList: [],
        loading: false, /* fb表单列表 是否loading */
        fbchat_btns: {
            // 录入线索
            enterClue: {
                development: 11062,
                production: 11062
            },
            // 录入客户
            enterCustomer: {
                development: 11063,
                production: 11063
            }
        },
        leads_btns: {
            // 录入线索
            'enterClue': {
                'development': 10824,
                'production': 10824
            },
            // 录入客户
            'enterCustomer': {
                'development': 11068,
                'production': 11068
            },
            'remove': {
                'development': 10825,
                'production': 10825
            },
            'reset': {
                'development': 10826,
                'production': 10826
            },
            'export': {
                'development': 10828,
                'production': 10828
            }
        },
        // "Facebook 主页已失效"状态
        isFBInvalid: false,
        // Facebook Leads未录入数,
        fbLeadsUnentry: 0,
        // Facebook收件箱未读数
        fbChatUnread: 0,
        fbChatEmailAutoAssociate: false,
        assosiatedInquiryId: '',
        // 分发给 facebook 处理的最新一条 websocket message
        websocketMsgFB: null,
        facebookReadStatus: null, // facebook私信已读未读标识
        // fb 客服列表
        fbServiceList: [],
        // 点击通知跳转到收件箱打开到指定对话
        fbJumpConversationData: {}
    },
    mutations: {
        /* 设置facebook私信已读未读标识 */
        setFacebookReadStatus(state, data) {
            state.facebookReadStatus = data;
        },
        /* 设置当前绑定数据的原始索引 */
        setCurrentIndex(state, data) {
            state.currentIndex = data;
        },
        /* 切换页面视图 */
        setFormBindView(state, data) {
            state.formBindView = data;
        },
        // 设置"Facebook 主页已失效"状态
        setIsFBInvalid(state, data) {
            state.isFBInvalid = data;
        },
        setFbLeadsUnentry(state, data) {
            state.fbLeadsUnentry = data;
        },
        setFbChatUnread(state, data) {
            state.fbChatUnread = data;
        },
        setFbChatEmailAutoAssociate(state, data) {
            state.fbChatEmailAutoAssociate = data;
        },
        setAssosiatedInquiryId(state, data) {
            state.assosiatedInquiryId = data;
        },
        // 设置分发给 facebook 处理的最新一条 websocket message
        setWebsocketMsgFB(state, data) {
            state.websocketMsgFB = data;
        },
        // 设置 Facebook 客服列表
        setFbServiceList(state, data) {
            state.fbServiceList = data;
        },
        // 设置要跳转到 FB 收件箱打开的对话的数据
        setFbJumpConversationData(state, data) {
            state.fbJumpConversationData = data;
        }
    },
    actions: {
        /* 初始化表格数据 */
        getTableData({ state, rootState }) {
            state.loading = true;
            util.ajaxInternationalJson({
                url: '/social/form/getFaceForms2',
                method: 'post',
                data: {
                    orderColumn: '',
                    orderType: 'desc',
                    homePageType: 2, // 0-个人主页，1-公司主页，2-全部
                    query: '',
                    pageNo: '',
                    pageSize: '',
                    startDate: '',
                    endDate: '',
                    providerId: 'facebook',
                    userId: rootState.userId,
                    orgId: rootState.enterpriseId
                }
            })
                .then(response => {
                    state.loading = false;
                    if (response.data.code === '1') {
                        let result = response.data.data;
                        state.tableData = result.data.map((item, index) => {
                            item.displayTime = new Date(item.formCreateTime).toLocaleDateString() + new Date(item.formCreateTime).toLocaleTimeString();
                            item.index = index + 1;
                            return item;
                        });
                        state.tableDataGone = state.tableData;
                    }
                });
        },
        /* 通过表单id获取表单字段 */
        getFacebookFormById({ commit, state, rootState, dispatch }) {
            util
                .ajaxInternationalJson({
                    url: '/social/form/getQuestion',
                    method: 'get',
                    params: {
                        userId: state.tableData[state.currentIndex].userId,
                        providerId: 'facebook',
                        id: state.tableData[state.currentIndex].id
                    }
                })
                .then(response => {
                    if (response.data.code === '1') {
                        let flag = true;
                        for (let key in response.data.data) {
                            flag = false;
                        }
                        if (flag) { /* 是个空对象 */
                            rootState.eventBus.$Notice.warning({
                                title: i18n.t('facebook.bindForm.no_leads'),
                                desc: i18n.t('facebook.bindForm.bind_again')
                            });
                        }
                        state.facebookForm = response.data.data;
                    }
                });
        },
        isEmptyObject(context, obj) { /* 判断一个对象是否为空 */
            for (let key in obj) {
                return false;
            }
            return true;
        },
        saveLog({ state, rootState, commit, dispatch }, content) {
            util.ajaxInternationalJson({
                url: '/social/operateLog/saveOperateLog',
                method: 'post',
                data: {
                    orgId: Number(rootState.enterpriseId),
                    content,
                    operateUserId: rootState.userId,
                    operateUser: rootState.userName
                }
            });
        },
        /* 更新数据绑定状态 */
        updateBindState({state, rootState, commit, dispatch}) {
            util
                .ajaxInternationalJson({
                    url: '/social/form/updateBind',
                    method: 'post',
                    params: {
                        userId: state.tableData[state.currentIndex].userId,
                        providerId: 'facebook',
                        id: state.tableData[state.currentIndex].id
                    }
                })
                .then(response => {
                    if (response.data.code === '1') {
                        rootState.eventBus.$Notice.success({
                            title: i18n.t('facebook.bindForm.status_update')
                        });
                        state.tableData[state.currentIndex].bindingFlag = 1;
                        commit('setFormBindView', 'FormTable');
                        dispatch('synFacebookAnswer');
                    }
                });
        },
        /* 同步表单答案 */
        synFacebookAnswer({ state, rootState, commit }) {
            util
                .ajaxInternationalJson({
                    url: '/social/form/syncFaceAnswer',
                    method: 'get',
                    params: {
                        userId: state.tableData[state.currentIndex].userId,
                        providerId: 'facebook'
                    }
                });
        },
        // 处理 websocket 推送过来的关于 facebook 的消息
        receiveWSMsg_facebook({ state, commit, dispatch }, msgData) {
            if (msgData.messageType) {
                switch (msgData.messageType) {
                    case 'facebookMessagingRead':
                        commit('setFacebookReadStatus', msgData);
                        break;
                    case 'facebookChatMessage':
                        // 推送Facebook聊天消息(2)
                        commit('setFbChatUnread', state.fbChatUnread + 1);

                        switch (msgData.attachmentsType) {
                            case 'text':
                                if (msgData.messageText) {
                                    dispatch('otherNotice', {
                                        originalObj: msgData,
                                        fromNick: msgData.recipientName,
                                        text: msgData.messageText,
                                        tip: i18n.t('main.noticeType'),
                                        type: 1,
                                        currentPath: router.currentRoute.name
                                    });
                                }
                                break;
                            case 'image':
                                dispatch('otherNotice', {
                                    originalObj: msgData,
                                    fromNick: msgData.recipientName,
                                    text: i18n.t('main.noticeText'),
                                    tip: i18n.t('main.noticeType'),
                                    type: 1
                                });
                                break;
                            case 'file':
                                dispatch('otherNotice', {
                                    originalObj: msgData,
                                    fromNick: msgData.recipientName,
                                    text: i18n.t('main.noticeText1'),
                                    tip: i18n.t('main.noticeType'),
                                    type: 1
                                });
                                break;
                            default:
                                dispatch('otherNotice', {
                                    originalObj: msgData,
                                    fromNick: msgData.recipientName,
                                    text: i18n.t('main.noticeText2'),
                                    tip: i18n.t('main.noticeType'),
                                    type: 1
                                });
                        }
                        break;
                    case 'facebookCommentMessage':
                        // 推送Facebook评论消息(3)
                        dispatch('otherNotice', {
                            originalObj: msgData,
                            fromNick: msgData.recipientName,
                            text: i18n.t('main.noticeText3'),
                            tip: i18n.t('main.noticeType1'),
                            type: 1,
                            currentPath: router.currentRoute.name
                        });
                        break;
                    case 'facebookClueCount':
                        // 推送Facebook同步leads消息(6)
                        /* FB Leads的未录入数量是否需要增加 msgData.unPublicSeaCount有值说明需要增加 反之不需要 */
                        if (msgData.unPublicSeaCount) {
                            commit('setFbLeadsUnentry', state.fbLeadsUnentry + msgData.unPublicSeaCount);
                        }

                        dispatch('otherNotice', {
                            originalObj: msgData,
                            fromNick: i18n.t('main.noticeNick1'),
                            text: `${msgData.facebookClueCount}条Facebook线索`,
                            tip: i18n.t('main.noticeType3'),
                            type: 6
                        });
                        break;
                    case 'facebookAssignCustomerService':
                        // FB 对话接待客服变更提醒

                        let txt;
                        if (msgData.beforeUserId) {
                            txt = i18n.t('fbDistribution.allocatedNoticeTxt')
                                .replace('$conversationName', msgData.conversationName)
                                .replace('$beforeUserName', msgData.beforeUserName)
                                .replace('$afterUserName', msgData.afterUserName)
                                .replace('$operatorName', msgData.operatorName);
                        } else {
                            txt = i18n.t('fbDistribution.allocatedNoticeTxt_noPrev')
                                .replace('$conversationName', msgData.conversationName)
                                .replace('$afterUserName', msgData.afterUserName)
                                .replace('$operatorName', msgData.operatorName);
                        }
                        dispatch('otherNotice', {
                            originalObj: msgData,
                            fromNick: 'facebookAssignCustomer',
                            text: txt,
                            tip: i18n.t('fbDistribution.allocatedNoticeTip'),
                            type: 17,
                            currentPath: router.currentRoute.name
                        });
                        break;
                }
            } else if (msgData.bePushedMessageType === '10') {
                if (msgData.msgType == 4) {
                    // msgType：1对话2网站留言3fbLeads4fb私信5fb评论
                    // 给有fb账号的人推送自动关联消息(10,"sendAutoAassociationMessageOther")
                    commit('setFbChatEmailAutoAssociate', true);
                    commit('setAssosiatedInquiryId', msgData.inquiryId);
                }
            }

            // 设置分发给 facebook 处理的最新一条 websocket message
            commit('setWebsocketMsgFB', msgData);
        },
        // 跳转收件箱逻辑
        handleJumpToFbInbox({ state, rootState, commit, dispatch }, data) {
            // 解构取值
            const { pageId, conversationId } = data;

            // 参数校验
            if (!(pageId && conversationId)) {
                Message.error(i18n.t('crm.InqSet.error_params'));
                console.error(`参数错误, 跳转收件箱失败, pageId: ${pageId}, conversationId: ${conversationId}`);
                return;
            }

            // 跳转收件箱之前先校验要跳转到的主页是否存在
            util.ajaxInternational({
                url: '/social/getBrandPage',
                method: 'post',
                data: {
                    userId: rootState.userId,
                    orgId: rootState.enterpriseId
                }
            }).then(response => {
                if (response.data.code === '1' && response.data.data.length) {
                    // 计算得到主页列表
                    const dataList = response.data.data;
                    const companyPageList = [];
                    const brandPageList = [];
                    let allPageList = [];
                    for (const item of dataList) {
                        // homePageType为1是公司主页
                        if (item.homePageType === 1) {
                            companyPageList.push(item);
                        } else {
                            brandPageList.push(item);
                        }
                    }
                    if (rootState.isFbService) {
                        allPageList = companyPageList.concat(brandPageList);
                    } else {
                        allPageList = brandPageList;
                    }

                    // 判断主页列表中是否有要跳转的主页, 有才能跳转
                    const tmpIndex = allPageList.findIndex(item => `${item.userId}` === `${pageId}`);
                    if (tmpIndex !== -1) {
                        // 有匹配主页, 跳转到 FB 收件箱页面打开指定主页的猪腚会话

                        commit('setFbJumpConversationData', {
                            pageId: pageId,
                            conversationId: conversationId
                        });

                        // 如果当前不在 FB 收件箱页面, 主动跳转到 FB 收件箱页面
                        if (router.currentRoute.name !== 'inbox') {
                            router.push({
                                name: 'inbox'
                            });
                        }
                    } else {
                        // 未匹配到主页, 跳转失败, 弹出提示

                        Message.error(i18n.t('inbox.fbPageAccessStatusTip'));
                        console.error(`未找到对应主页, 无法切换, 传入 pageId 为: ${pageId}`);
                    }
                }
            });
        }
    },
    getters: {
        /* 通过日期条件检索列表数据 */
        filterTableByDate: (state) => ({name, dateRange}) => {
            state.tableDataGone = state.tableDataGone.filter(item => {
                dateRange[0] = new Date(dateRange[0]);
                dateRange[0] = new Date(dateRange[0].toLocaleDateString());
                dateRange[1] = new Date(dateRange[1]);
                dateRange[1].setHours(24);
                dateRange[1] = new Date(dateRange[1].toLocaleDateString());
                let d = new Date(item[name]);
                return d > dateRange[0] && d < dateRange[1];
            });
        },
        /* 通过数字检索列表数据 */
        filterTableByNumber: (state) => ({name, value, operate}) => {
            state.tableDataGone = state.tableDataGone.filter(item => {
                let n = item[name];
                value = Number(value);
                return operate === '>=' ? (n >= value) : (n <= value);
            });
        },
        /* 通过关键字检索列表数据（区分大小写英文） */
        filterTableByKeyword: (state) => ({name, value}) => {
            state.tableDataGone = state.tableDataGone.filter(item => {
                return item[name].indexOf(value) > -1;
            });
        },
        /* 检索列表数据入口 */
        filterTable: (state, getters) => (searchItem) => {
            state.tableDataGone = state.tableData;
            searchItem.forEach(item => {
                if (item.name === 'formCreateTime') {
                    getters.filterTableByDate(item);
                } else if (item.name === 'leadsCount') {
                    getters.filterTableByNumber(item);
                } else {
                    getters.filterTableByKeyword(item);
                }
            });
        }
    }
};
