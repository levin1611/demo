const mail_window = {
    state: {
        // 筛选条件
        currentAccount: '', // 账号
        themeKey: '', // 主题
        currentPage: 1, // 跳转前处于哪一页
        pageSize: 15, // 分页查询条数
        selectedMailId: '', // 邮件系统选中邮件id
        selectedMailBoxType: '', // 邮件系统选中邮件所属箱（unreadBox(未读箱)、inbox(收件箱)、draftBox(草稿箱)、sentBox(已发箱)、dustbin(垃圾箱)、customerBox(客户箱)）
        replyMailType: '', // 邮件系统回复邮件类型（replyCurrent-回复、replyAll-回复全部、replyWithAttachment-回复全部带附件）   转发类型（forward-转发、forwardAsAtt-作为附件转发）
        mailEdit: false, // 是否是新建邮件
        allCrmEmail: [],
        allCrmContact: [],
        viewableCustomers: [],
        viewableCustomersFinished: false,
        mail_detail_params: {}
    },
    mutations: {
        set_mailWindow_detail_params(state, data) {
            state.mail_detail_params = data;
        },
        setCurrentAccount(state, data) {
            state.currentAccount = data;
        },
        setThemeKey(state, data) {
            state.themeKey = data;
        },
        setCurrentPage(state, data) {
            state.currentPage = data < 1 ? 1 : data;
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
        setAllCrmEmail(state, data) {
            state.allCrmEmail = data;
        },
        setAllCrmContact(state, data) {
            state.allCrmContact = data;
        },
        setViewableCustomers(state, data) {
            state.viewableCustomers = data;
            state.viewableCustomersFinished = true;
        }
    }
};

export default mail_window;
