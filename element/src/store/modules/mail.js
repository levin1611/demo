import util from '@/libs/util';
import mailCommon from '@/api/mail/common.js';
import i18n from '@/locale';
import Vue from 'vue';

const mail = {
    state: {
        // 筛选条件
        config_tableFilter: {},
        // 三栏模式下的筛选条件
        config_split_tableFilter: {},
        sort: '',
        sortType: '',
        edm_config_tableFilter: {},
        edm_sort: '',
        edm_sortType: '',
        currentAccount: [], // 部门树筛选选中的邮件箱账号
        currentCustomerAccount: '', // 客户箱账号
        themeKey: '', // 搜索关键字
        searchType: '0', // 1收件人/发件人/主题  2正文  3附件
        currentPage: 1, // 跳转前处于哪一页
        edmCurrentPage: 1, // edm列表条赚钱处于哪一页
        marketingTitle: 2, // 营销活动页面的 我的营销活动 or 全部营销活动 状态
        pageSize: 15, // 分页查询条数
        selectedMailId: '', // 邮件系统选中邮件id
        selectedMailBoxType: '', // 邮件系统选中邮件所属箱（unreadBox(未读箱)、inbox(收件箱)、draftBox(草稿箱)、sentBox(已发箱)、dustbin(垃圾箱)、customerBox(客户箱)）
        replyMailType: '', // 邮件系统回复邮件类型（replyCurrent-回复、replyAll-回复全部、replyWithAttachment-回复全部带附件）   转发类型（forward-转发、forwardAsAtt-作为附件转发）
        mailEdit: false, // 是否是新建邮件
        tagList: [], // 标签列表
        mailTagList: [], // 当前登录账号的标签列表
        customFolders: [], // 自定义文件夹列表
        allCrmEmail: [],
        allCrmContact: [],
        viewableCustomers: [],
        viewableCustomersFinished: false,
        mail_detail_params: {},
        ws_receive_mail: 0,
        currentPersonId: '',
        currentInputInfo: '',
        currentAccountIds: [], // 邮箱部门树中选中的用户id
        currentSelectedIndex: 0,
        subordinatesMailUnread: 0,
        beforeCheckInfo: [],
        // 当前账户所有邮箱的未读信息
        allUnreadMails: 0,
        // 当前账户当前查看分类的未读信息
        currentUnreadMails: 0,
        allMailToDoCount: 0, // 待处理箱  待处理数
        toDoUnReadCount: 0, // 待处理箱 未读数
        starBoxUnReadCount: 0, // 星标箱未读数
        junkUnReadCount: 0, // 垃圾箱未读数
        inboxUnReadCount: 0, // 收件箱未读数
        deleteUnReadCount: 0, // 已删除箱未读数
        distributionBoxCount: 0, // 待处理箱  待处理数
        distributionBoxUnReadCount: 0, // 待处理箱 未读数
        labelUnReadCount: {}, // 标签未读数
        customBoxUnReadCount: {}, // 自定义文件夹

        generalFields: [], // 邮箱设置--客户分类规则数据
        selectCustomerInquiryId: 0, // 客户箱选中的询盘id

        downloadingMailIds: [], // 当前正在打包下载的邮件id集合
        saveWithWhich: '', // 用于区分写信页面底部的存草稿按钮和"离开确认弹窗"的存草稿按钮
        isMailInvalid: false, // 当前用户绑定的邮箱账号是否失效

        mailReadingMode: '', // 邮件阅读模式, 值为 1 (跳转至邮件详情页查看) 或 2(列表页右侧预览查看)
        mailTitleDisplayInformationValue: '',
        // 分发给邮件系统处理的最新一条 websocket message
        websocketMsgMail: null,

        // 写信页面富文本编辑器 content_style 配置中会影响邮件内容渲染的样式
        tinymce_contentStyle: '<style>div { line-height:1.5; margin: 0;word-break: break-word!important;} html,body{height:auto!important;} pre{ white-space: pre-wrap; } p{ margin: 0;}</style>',
        // 本次登录询盘云后, 新收到的邮件, 分箱体, 格式为 { 绑定邮箱: { 箱体: [邮件 ID] } }
        newReceiveMails: {},
        quickSendMailVisible: false,
        time_zone: [
            {
                label: i18n.t('mail.utc_add1'),
                value: 420
            },
            {
                label: i18n.t('mail.utc_add2'),
                value: 360
            },
            {
                label: i18n.t('mail.utc_add3'),
                value: 300
            },
            {
                label: i18n.t('mail.utc_add4'),
                value: 240
            },
            {
                label: i18n.t('mail.utc_add5'),
                value: 180
            },
            {
                label: i18n.t('mail.utc_add6'),
                value: 120
            },
            {
                label: i18n.t('mail.utc_add7'),
                value: 60
            },
            {
                label: i18n.t('mail.utc_add8'),
                value: 0
            },
            {
                label: i18n.t('mail.utc_add9'),
                value: -60
            },
            {
                label: i18n.t('mail.utc_add10'),
                value: -120
            },
            {
                label: i18n.t('mail.utc_1'),
                value: 540
            },
            {
                label: i18n.t('mail.utc_2'),
                value: 600
            },
            {
                label: i18n.t('mail.utc_3'),
                value: 660
            },
            {
                label: i18n.t('mail.utc_4'),
                value: 720
            },
            {
                label: i18n.t('mail.utc_5'),
                value: 780
            },
            {
                label: i18n.t('mail.utc_6'),
                value: 840
            },
            {
                label: i18n.t('mail.utc_7'),
                value: 900
            },
            {
                label: i18n.t('mail.utc_8'),
                value: 960
            },
            {
                label: i18n.t('mail.utc_9'),
                value: 1020
            },
            {
                label: i18n.t('mail.utc_10'),
                value: 1080
            }
        ],
        copyAttachmentStatus: false,
        writeMailModalVisible: false,
        toRouterObj: null,
        mailTemplateModalVisible: false,
        sendMailUrl: 'https://hkend01.leadscloud.com/mailhk/saveMail',
        departmentPeople: []
    },
    mutations: {
        set_currentUnreadMails(state, data) {
            state.currentUnreadMails = data;
        },
        set_allUnreadMails(state, data) {
            state.allUnreadMails = data;
        },
        set_beforeCheckInfo(state, data) {
            state.beforeCheckInfo = data;
        },
        set_subordinatesMailUnread(state, data) {
            state.subordinatesMailUnread = data;
        },
        set_currentSelectedIndex(state, data) {
            state.currentSelectedIndex = data;
        },
        set_currentInputInfo(state, data) {
            state.currentInputInfo = data;
        },
        set_currentPersonId(state, data) {
            state.currentPersonId = data;
        },
        set_ws_receive_mail(state, data) {
            state.ws_receive_mail = data;
        },
        set_mail_detail_params(state, data) {
            state.mail_detail_params = data;
        },
        set_mail_config(state, data) {
            state.config_tableFilter = data;
        },
        set_split_mail_config(state, data) {
            state.config_split_tableFilter = data;
        },
        set_mail_sort(state, data) {
            state.sort = data;
        },
        set_mail_sortType(state, data) {
            state.sortType = data;
        },
        set_mail_edm_config(state, data) {
            state.edm_config_tableFilter = data;
        },
        set_mail_edm_sort(state, data) {
            state.edm_sort = data;
        },
        set_mail_edm_sortType(state, data) {
            state.edm_sortType = data;
        },
        setCurrentCustomerAccount(state, data) {
            state.currentCustomerAccount = data;
        },
        setCurrentAccount(state, data) {
            state.currentAccount = Array.isArray(data) ? data : [];
        },
        setSearchType(state, data) {
            state.searchType = data;
        },
        setThemeKey(state, data) {
            state.themeKey = data;
        },
        setCurrentPage(state, data) {
            state.currentPage = data < 1 ? 1 : data;
        },
        setEdmCurrentPage(state, data) {
            state.edmCurrentPage = data < 1 ? 1 : data;
        },
        setMarketingTitle(state, data) {
            state.marketingTitle = data;
        },
        setPageSize(state, data) {
            state.pageSize = data;
        },
        setSelectedMailId(state, data) {
            state.selectedMailId = data;
        },
        setReplyMailType(state, data) {
            state.replyMailType = data;
        },
        setSelectMailBoxType(state, data) {
            state.selectedMailBoxType = data;
        },
        setMailEdit(state, data) {
            state.mailEdit = data;
        },
        setTagList(state, data) {
            state.tagList = data;
        },
        setMailTagList(state, data) {
            state.mailTagList = data;
        },
        setCustomFolders(state, data) {
            state.customFolders = data;
        },
        setAllCrmEmail(state, data) {
            state.allCrmEmail = data;
        },
        setAllCrmContact(state, data) {
            state.allCrmContact = data;
        },
        setViewableCustomers(state, data) {
            state.viewableCustomers = data;
            state.viewableCustomersFinished = true;
        },
        setGeneralFields(state, data) {
            state.generalFields = data;
        },
        setSelectCustomerInquiryId(state, data) {
            state.selectCustomerInquiryId = data;
        },
        setDownloadingMailIds(state, data) {
            if (state.downloadingMailIds.length) {
                const downloadingMailIdIndex = state.downloadingMailIds.indexOf(data);
                if (downloadingMailIdIndex === -1) {
                    state.downloadingMailIds.push(data);
                } else {
                    state.downloadingMailIds.splice(downloadingMailIdIndex, 1);
                }
            } else {
                state.downloadingMailIds.push(data);
            }
        },
        setCurrentAccountIds(state, data) {
            state.currentAccountIds = data;
        },
        setSaveWithWhich(state, data) {
            state.saveWithWhich = data;
        },
        setMailInvalid(state, data) {
            state.isMailInvalid = data;
        },
        setAllMailToDoCount(state, data) {
            state.allMailToDoCount = data;
        },
        setToDoUnReadCount(state, data) {
            state.toDoUnReadCount = data;
        },
        setStarBoxUnReadCount(state, data) {
            state.starBoxUnReadCount = data;
        },
        setJunkUnReadCount(state, data) {
            state.junkUnReadCount = data;
        },
        setInboxUnReadCount(state, data) {
            state.inboxUnReadCount = data;
        },
        setDeleteUnReadCount(state, data) {
            state.deleteUnReadCount = data;
        },
        setLabelUnReadCount(state, data) {
            state.labelUnReadCount = data;
        },
        setCustomBoxUnReadCount(state, data) {
            state.customBoxUnReadCount = data;
        },
        setDistributionBoxCount(state, data) {
            state.distributionBoxCount = data;
        },
        setDistributionBoxUnReadCount(state, data) {
            state.distributionBoxUnReadCount = data;
        },
        // 设置邮件阅读模式
        setMailReadingMode(state, data) {
            state.mailReadingMode = data;
        },
        // 建档客户头像列显示内容设置
        setMailTitleDisplayInformationValue(state, data) {
            state.mailTitleDisplayInformationValue = data;
        },
        // 设置分发给邮件系统处理的最新一条 websocket message
        setWebsocketMsgMail(state, data) {
            state.websocketMsgMail = data;
        },
        // 更新新收邮件数据
        // 更新时机: 1. 收件时, 更新收信数据; 2. 邮件已读时, 从收信数据中去掉该邮件 ID; 3. 箱体/表格页切换时, 清空整个箱体 4. 退出登录时, 清空收信数据
        updateNewReceiveMails(state, obj) {
            // 存放临时变量
            const temp = JSON.parse(JSON.stringify(state.newReceiveMails));
            let mailAccounts = [];

            // 根据传入数据 type 的不同, 更新 newReceiveMails
            switch (obj.type) {
                case 'update':
                    // 新收邮件, 更新
                    Object.entries(obj.data).forEach(([email, countObj]) => {
                        if (temp[email]) {
                            Object.entries(countObj).forEach(([boxType, mailIdArr]) => {
                                temp[email][boxType] = [...new Set(mailIdArr.concat(temp[email][boxType] || []))];
                            });
                        } else {
                            temp[email] = countObj;
                        }
                    });
                    state.newReceiveMails = temp;
                    break;
                case 'removeRead':
                    // 邮件已读, 从数组中清空已读邮件
                    Object.entries(temp).forEach(([email, countObj]) => {
                        Object.entries(countObj).forEach(([boxType, mailIdArr]) => {
                            temp[email][boxType] = mailIdArr.filter(id => !obj.data.find(item => `${item}` === `${id}`));
                        });
                    });
                    state.newReceiveMails = temp;
                    break;
                case 'removeBox':
                    // 箱体切换, 从数组中清空选中邮箱账号的整个箱体的新收邮件 id 数组
                    mailAccounts = state.currentAccount.includes(i18n.t('mail.accountPlh')) ? [] : state.currentAccount;
                    Object.entries(temp).forEach(([email, countObj]) => {
                        if (Array.isArray(mailAccounts) && mailAccounts.length) {
                            if (mailAccounts.includes(email)) {
                                delete countObj[obj.data];
                            }
                        } else {
                            delete countObj[obj.data];
                        }
                    });
                    state.newReceiveMails = temp;
                    break;
                case 'restore':
                    // 从 localStorage 中恢复 newReceiveMails
                    try {
                        const storageValue = localStorage.getItem('leadsCloud-newReceiveMails');
                        state.newReceiveMails = storageValue ? JSON.parse(storageValue) : state.newReceiveMails;
                    } catch (e) {}
                    break;
                case 'clear':
                    // 清空 newReceiveMails
                    state.newReceiveMails = {};
                    break;
            }

            // 存储数据到 localStorage , 避免刷新后数据消失
            localStorage.setItem('leadsCloud-newReceiveMails', JSON.stringify(state.newReceiveMails));
        },
        // 快速发邮件弹窗状态
        setQuickSendMailVisible(state, data) {
            state.quickSendMailVisible = data;
        },
        // 复制附件后的状态变化，用于在写信页面复制附件
        setCopyAttachmentStatus(state, data) {
            state.copyAttachmentStatus = data;
        },
        // 子应用写信时触发此变量 阻止主应用的路由跳转
        setWriteMailModalVisible(state, data) {
            state.writeMailModalVisible = data;
        },
        setToRouterObj(state, data) {
            state.toRouterObj = data;
        },
        // 子应用写信时触发此变量 阻止主应用的路由跳转
        setMailTemplateModalVisible(state, data) {
            state.mailTemplateModalVisible = data;
        },
        setDepartmentPeople(state, data) {
            state.departmentPeople = data;
        }
    },
    getters: {
        // 当前选中邮箱账号的"新收邮件"统计数据
        currentAccountNewReceiveMailIdObj: (state) => {
            // 获取当前选中的邮箱
            const mailAccounts = state.currentAccount.includes(i18n.t('mail.accountPlh')) ? [] : state.currentAccount;
            // 暂存邮箱对应的统计数据
            let countObjList = [];

            if (Array.isArray(mailAccounts) && mailAccounts.length) {
                // 如果选中了特定邮箱, 筛选出特定邮箱的统计数据加入数组中
                Object.entries(state.newReceiveMails).forEach(([email, countObj]) => {
                    if (mailAccounts.includes(email)) {
                        countObjList.push(countObj);
                    }
                });
            } else {
                // 否则取所有的统计数据
                countObjList = Object.values(state.newReceiveMails);
            }

            // 合并统计数据, 得到最终结果并返回
            if (countObjList.length === 0) {
                return {};
            }
            /**
             * 新收邮件统计数据，子应用计算函数无法监听到getters方法的实时数据变化
             * 放到全局状态监听
             * 解决：子应用消息推送完不刷新页面的问题
            */
            Vue.prototype.$setGlobalState({
                globalStateNewMailData: Object.values(countObjList).reduce((a, b) => {
                    const temp = JSON.parse(JSON.stringify(a));
                    Object.entries(b).forEach(([boxType, mailIdList]) => {
                        if (Array.isArray(temp[boxType])) {
                            temp[boxType] = temp[boxType].concat(mailIdList);
                        } else {
                            temp[boxType] = mailIdList;
                        }
                    });
                    return temp;
                })
            });
            // reduce 需要初始值, 所以数组不能为空
            return Object.values(countObjList).reduce((a, b) => {
                const temp = JSON.parse(JSON.stringify(a));
                Object.entries(b).forEach(([boxType, mailIdList]) => {
                    if (Array.isArray(temp[boxType])) {
                        temp[boxType] = temp[boxType].concat(mailIdList);
                    } else {
                        temp[boxType] = mailIdList;
                    }
                });
                return temp;
            });
        }
    },
    actions: {
        /** 获取未读箱个数 */
        getUnreadMail({ rootState, commit, state }) {
            /**
             * @Description: 获取邮件未读数的接口更改。
             *                后端说接口有报警currentUserId为空的情况，但前端测试未复现。
             *                因此此处与后端沟通，当currentPersonId无值时，默认传参为当前询盘云登录用户id
             *                后续以待观察。
             * @author 杨娣
             * @date 2020/6/2
            */
            util.ajaxMailJson({
                url: '/mail/noReadCountWithAccounts',
                method: 'POST',
                data: {
                    accountIds: state.currentAccount[0] === '全部' || state.currentAccount[0] === 'All' || state.currentPersonId !== rootState.userId ? [] : state.currentAccount,
                    currentUserId: state.currentPersonId ? state.currentPersonId : rootState.userId,
                    currentLoginUserId: rootState.userId,
                    orgId: rootState.enterpriseId
                }
            }).then(res => {
                if (res.data.code === 1) {
                    let currentPersonIdUnread = 0;
                    let currentUserIdUnread = 0;
                    /* 如果currentAccount为空，说明部门数此时选择的是全部 */
                    if (!state.currentAccount.length || state.currentAccount[0] === '全部' || state.currentAccount[0] === 'All') {
                        currentPersonIdUnread = res.data.data.currentLoginUserNoReadCount;
                    } else {
                        currentPersonIdUnread = res.data.data.currentUserNoReadCount;
                    }
                    currentUserIdUnread = res.data.data.currentLoginUserNoReadCount;
                    if (state.currentPersonId === rootState.userId) {
                        commit('setMailUnread', currentPersonIdUnread);
                    } else {
                        commit('set_subordinatesMailUnread', currentPersonIdUnread);
                    }
                    commit('set_allUnreadMails', currentUserIdUnread);
                    // 待处理箱 待处理邮件数
                    commit('setAllMailToDoCount', res.data.data.currentUserToDoMailCount);
                    // 待处理箱 未读邮件数
                    commit('setToDoUnReadCount', res.data.data.toDoUnReadCount);
                    // 星标箱未读数
                    commit('setStarBoxUnReadCount', res.data.data.starBoxUnReadCount);
                    // 垃圾箱未读数
                    commit('setJunkUnReadCount', res.data.data.junkUnReadCount);
                    // 收件箱未读数
                    commit('setInboxUnReadCount', res.data.data.inboxUnReadCount);
                    // 已删除箱未读数
                    commit('setDeleteUnReadCount', res.data.data.deleteUnReadCount);
                    // 标签未读数
                    commit('setLabelUnReadCount', res.data.data.labelUnReadCount);
                    // 自定义文件夹未读数
                    commit('setCustomBoxUnReadCount', res.data.data.customBoxUnReadCount);
                    // 待分配箱 待分配邮件数
                    commit('setDistributionBoxCount', res.data.data.distributionBoxCount);
                    // 待分配箱 未读邮件数
                    commit('setDistributionBoxUnReadCount', res.data.data.distributionBoxUnReadCount);
                    
                }
            });
        },
        getFolders({ rootState, state }) {
            util.ajaxMail({
                url: `/mail/mailBoxTypes/${rootState.userId}`,
                method: 'GET'
            }).then(response => {
                if (response.data.code === 1) {
                    state.customFolders = response.data.data || [
                        {
                            boxTypeName: i18n.$t('timeLine.noData'),
                            id: -1
                        }
                    ];
                }
            });
        },
        // 保存邮件阅读模式
        saveMailReadingMode({ rootState, commit, state }, { value, id }) {
            return new Promise(resolve => {
                util.ajaxJson({
                    url: '/mail/generalSetting/updateMailReadingMode',
                    method: 'PUT',
                    data: {
                        enterpriseId: rootState.enterpriseId,
                        id,
                        updateUserId: rootState.userId,
                        mailReadingMode: value
                    }
                }).then(response => {
                    if (response.data.code === 1) {
                        commit('setMailReadingMode', value);
                        resolve(true);
                    } else {
                        console.error('设置邮件阅读模式失败');
                        resolve(false);
                    }
                }).catch(error => {
                    console.error('设置邮件阅读模式失败');
                    resolve(false);
                });
            });
        },
        // 更新未读邮件数
        updateAllUnreadMails({ commit, rootState }) {
            util.ajaxMailJson({
                url: '/mail/mailBoxsAndLabel',
                method: 'POST',
                data: {
                    enterpriseId: rootState.enterpriseId,
                    createUserId: rootState.userId,
                    accountId: '',
                    accountIds: [],
                    mailBoxTypeId: '0',
                    mailReadFlag: '0',
                    sendStartDate: '',
                    sendEndDate: '',
                    subject: '',
                    page: 0,
                    size: undefined,
                    sort: '',
                    direction: 'desc'
                }
            }).then(response => {
                commit('set_allUnreadMails', response.data.data.totalElements);
            });
        },
        // 处理 websocket 推送过来的关于 mail 的消息
        receiveWSMsg_mail({ state, commit, dispatch }, msgData) {
            switch (msgData.messageType) {
                case 'receiveMailMessage':
                    dispatch('updateAllUnreadMails');
                    commit('set_ws_receive_mail', state.ws_receive_mail + 1);

                    switch (msgData.operateType) {
                        case 'interForward':
                            // 如果是内部转发的邮件
                            dispatch('otherNotice', {
                                originalObj: msgData,
                                fromNick: i18n.t('main.noticeNick'),
                                text: msgData.notifyMessage ? `使用IMAP协议收件失败,请点击通知跳转网址${msgData.notifyMessage}进行第三方客户端收件授权操作!` : `${msgData.fromUserName}内部转发了${msgData.mailCount}封邮件给你`,
                                tip: i18n.t('main.noticeType2'),
                                type: 3,
                                url: msgData.notifyMessage ? msgData.notifyMessage : undefined
                            });
                            break;
                        case 'autoInterForward':
                            // 自动转发提醒逻辑
                            if (msgData.autoForwardingType === 1) {
                                // 客户提醒逻辑
                                dispatch('otherNotice', {
                                    originalObj: msgData,
                                    fromNick: i18n.t('main.noticeNick'),
                                    text: `${msgData.companyName}的${msgData.contactsName}给${msgData.fullName}发送了邮件【${msgData.mailSubject}】`,
                                    tip: i18n.t('main.noticeType2'),
                                    type: 3
                                });
                            } else {
                                // 线索提醒逻辑
                                dispatch('otherNotice', {
                                    originalObj: msgData,
                                    fromNick: i18n.t('main.noticeNick'),
                                    text: `${msgData.contactsName}给${msgData.fullName}发送了邮件【${msgData.mailSubject}】`,
                                    tip: i18n.t('main.noticeType2'),
                                    type: 3
                                });
                            }
                            break;
                        case 'mailReceiveSendRule':
                            // 执行规则提醒逻辑
                            dispatch('otherNotice', {
                                originalObj: msgData,
                                fromNick: i18n.t('main.noticeNick'),
                                text: `${msgData.notifyMessage}`,
                                tip: '历史邮件的收发信规则执行结果',
                                type: 3
                            });
                            break;
                        case 'receiveNotNotice':
                            break;
                        case 'distributionMailNotice':
                            if (msgData.mailCount > 0) {
                                dispatch('otherNotice', {
                                    originalObj: msgData,
                                    fromNick: i18n.t('main.noticeNick'),
                                    text: `接收到${msgData.mailCount}封分发邮件`,
                                    tip: '分发邮件',
                                    type: 3
                                });
                            }
                            break;
                        default:
                            if (msgData.notifyMessage || msgData.mailCount > 0) {
                                dispatch('otherNotice', {
                                    originalObj: msgData,
                                    fromNick: i18n.t('main.noticeNick'),
                                    text: msgData.notifyMessage ? `使用IMAP协议收件失败,请点击通知跳转网址${msgData.notifyMessage}进行第三方客户端收件授权操作!` : `收到${msgData.mailCount}封邮件`,
                                    tip: i18n.t('main.noticeType2'),
                                    type: 3,
                                    url: msgData.notifyMessage ? msgData.notifyMessage : undefined
                                });
                            }
                    }

                    // 更新"新收邮件未读数统计数据"
                    if (msgData.newMailDetail) {
                        commit('updateNewReceiveMails', {
                            type: 'update',
                            data: msgData.newMailDetail
                        });
                    }
                    break;
                case 'sendMailMessage':
                    /* 此处除判断邮件为发送失败状态外，还需要判断邮件是普通邮件 or 群发单显邮件 */
                    if (msgData.messageCode === 0 && msgData.mailGroupSendingSingleShowFlag === 0) {
                        commit('changeSystemNoticeFlag');
                        dispatch('otherNotice', {
                            originalObj: msgData,
                            fromNick: i18n.t('main.noticeNick'),
                            text: msgData.message,
                            tip: i18n.t('main.failSend'),
                            type: 5
                        });
                    } else if (msgData.messageCode === 2) {
                        /* 邮箱失效，触发强提示 */
                        commit('setMailInvalid', true);
                    }
                    break;
                case 'openMailTraceNotice':
                    dispatch('otherNotice', {
                        originalObj: msgData,
                        fromNick: i18n.t('main.noticeNick'),
                        text: msgData.text,
                        tip: '邮件已打开',
                        type: 3
                    });
                    break;
                case 'batchDoRuleNotice':
                    // 自动分配 手动执行规则提醒
                    dispatch('otherNotice', {
                        originalObj: msgData,
                        fromNick: i18n.t('main.noticeNick'),
                        text: msgData.text,
                        tip: '手动执行规则',
                        type: 3
                    });
                    break;
    }
            commit('setWebsocketMsgMail', msgData);
        },
        getMailUrl({ rootState, state }) {
            return mailCommon.getMailUrl({
                userId: rootState.userId,
                orgId: rootState.enterpriseId
            }).then(res => {
                if (res.code === 1) {
                    localStorage.setItem('XHLMailUrl', JSON.stringify(res.data));
                } else {
                    localStorage.setItem('XHLMailUrl', JSON.stringify({
                        receiveMail: 0,
                        sendMail: {}
                    }));
                }
            }).catch(error => {
                localStorage.setItem('XHLMailUrl', JSON.stringify({
                    receiveMail: 0,
                    sendMail: {}
                }));
            });
        },
        getMailLeaderAccount({ rootState, commit, state }) {
            util.ajaxMail({
                url: `/mail/mailAccount/leader/${rootState.enterpriseId}/${rootState.userId}`,
                method: 'get'
            }).then(res => {
                if (res.data.code === 1) {
                    commit('setDepartmentPeople', res.data.data);
                }
            });
        }
    }
};

export default mail;
