import { Request } from '@/api/baseUtilAjax';

// 获取二维码
export const getWaLoginQrCode = async (params = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWA',
        url: '/whatsapp/waUserBind/getQrCode',
        params,
        cancelToken
    }, 'get').init(success, error, cbs);
};

// 重新获取二维码时,发送删除认证信息的请求
export const delAuthInfo = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWA',
        url: '/whatsapp/waUserBind/delAuthInfo',
        params
    }, 'post').init(success, error, cbs);
};

// 获取 WA 账号信息
export const getWaUserBind = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWA',
        url: '/whatsapp/waUserBind/getWaUserBind',
        params
    }, 'get').init(success, error, cbs);
};

// 获取 userId 登录的所有 WA 账号信息
export const getAllLoggedAccount = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/maxLogin/getOnlineWhatsapp',
        data
    }).init(success, error, cbs);
};

// 获取 WA 账号 uuid
export const getLastestWaType = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWA',
        url: '/whatsapp/waUserBind/getLastestWaType',
        params
    }, 'get').init(success, error, cbs);
};

// 获取 WA 账号头像
export const getWAAccountAvatar = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/whatsapp/contact/updateAvatar',
        data
    }).init(success, error, cbs);
};

// 获取 WA 关联的 CRM 数据
export const getWACRMStatus = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crm/visitorRelation/getStatusByTargetIdList',
        data
    }).init(success, error, cbs);
};

// 设置"超管是否开启'查看下属'功能"
export const setWAViewSub = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/new-privilege/org/updateRole',
        data
    }).init(success, error, cbs);
};

// wa 查看下属, 获取下属部门信息
export const getWaManageDepartments = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/new-privilege/department/getWaManageDepartments',
        params
    }, 'get').init(success, error, cbs);
};

// wa 查看下属, 获取下属用户信息
export const getWaDepartmentMember = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/new-privilege/department/getWaDepartmentMember',
        params
    }, 'get').init(success, error, cbs);
};

// 获取下属 WA 账号信息
export const getWaUserSubordinates = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWA',
        url: '/whatsapp/waUserBind/getWaUserSubordinates',
        params
    }, 'get').init(success, error, cbs);
};

// 获取群组检索结果
export const getGroupChatLink = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/xdd-plugin/whatsappGroupChatLink/getGroupChatLink',
        data
    }).init(success, error, cbs);
};

// 导出群组检索结果
export const groupChatLinkExport = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crawler/whatsappGroupChatLink/groupChatLinkExport',
        data
    }).init(success, error, cbs);
};

// 群组检索自动加群
export const automaticGroup = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crawler/whatsappGroupChatLink/automaticGroup',
        data
    }).init(success, error, cbs);
};

// 获取加群日志
export const getAutomaticGroupRecords = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/crawler/whatsappGroupChatLink/getAutomaticGroupRecords',
        data
    }).init(success, error, cbs);
};
// wa 获取最新同步时间
export const getLastPushTime = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/whatsapp/chatRecordsPlugin/getLastPushTime',
        data
    }).init(success, error, cbs);
};

// 获取号码检索结果
export const getWaNumberData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/xdd-plugin/reptile/member/list',
        data
    }).init(success, error, cbs);
};

// 多选导出号码
export const waNumberExport = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/xdd-plugin/reptile/member/export',
        data
    }).init(success, error, cbs);
};

// 更新号码检索列表备注
export const waNumberUpdateRemark = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/xdd-plugin/reptile/member/updateRemark',
        data
    }).init(success, error, cbs);
};

// wa 号码有效性查询
export const waNumberCheckValid = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/whatsapp/waUserBind/validityCheck',
        data
    }).init(success, error, cbs);
};

// wa 号码有效性查询 2 (此接口只需要 orgId 和 wa 账号即可, 不需要像上面的接口一样要求 wa 账号登录中)
export const waNumberValidCheck = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/whatsapp/waUserBind/validityCheck',
        data
    }).init(success, error, cbs);
};

// WhatsApp删除/撤回接口
export const deleteMessage = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/whatsapp/chatRecords/deleteMessage',
        data
    }).init(success, error, cbs);
};

// WhatsApp删除/撤回接口
export const transferWAConversation = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/whatsapp/chatList/privateChat',
        data
    }).init(success, error, cbs);
};

// // WhatsApp删除/撤回接口
// export const getLastReplyTimeStamp = async (data = {}, success = null, error = null, cbs = []) => {
//     return new Request({
//         utilKey: 'ajaxInternationalJson',
//         url: '',
//         data
//     }).init(success, error, cbs);
// };

// 一下两个是WhatsApp设置相关
// 1. 查询消息提醒设置
export const getReminderSettings = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/whatsapp/chatRecords/getReminderSettings',
        data
    }).init(success, error, cbs);
};

// 2. 更新消息提醒设置
export const updateReminderSettings = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/whatsapp/chatRecords/updateReminderSettings',
        data
    }).init(success, error, cbs);
};

// 获取当前wa账号对应的标签数据
export const getAccountLabel = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/whatsapp/contactUserLabel/getAccountLabel',
        data
    }).init(success, error, cbs);
};

// 获取当前wa账号对应的标签数据
export const saveLabelModify = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/whatsapp/contactUserLabel/labelModify',
        data
    }).init(success, error, cbs);
};

// 保存消息翻译内容
export const saveTranslateMsg = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/translateMessage/saveTranslateMessage',
        data
    }).init(success, error, cbs);
};

// 删除消息翻译内容
export const deleteTranslateMsg = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/translateMessage/deleteTranslateMessage',
        data
    }).init(success, error, cbs);
};

// 获取 wa 会话的图片/视频资源, 轮播展示
export const getMediaList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/stir/getStirPicture',
        data
    }).init(success, error, cbs);
};

// wa 数据采集 - 网址链接列表, 获取表格数据
export const getWaLinkData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/xdd-plugin/reptile/waUrl/task/pageList',
        data
    }).init(success, error, cbs);
};

// wa 数据采集 - 任务列表, 获取表格数据
export const getWaTaskData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/xdd-plugin/reptile/task/taskPageList',
        data
    }).init(success, error, cbs);
};


// 群发任务列表-获取任务列表接口
export const getGroupTaskList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/grouptask/getGroupTaskList',
        data
    }).init(success, error, cbs);
};

// 群发任务列表-获取任务详情接口
export const getGroupTaskDetails = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/grouptask/getGroupTaskDetails',
        data
    }).init(success, error, cbs);
};
// 群发规则获取关键词列表
export const getWabaKWlist = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/keywordConfig/getKeywordConfig',
        params: data
    }, 'get').init(success, error, cbs);
};
// 添加群发规则关键词
export const setWabaKWlist = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/keywordConfig/saveKeyword',
        data
    }).init(success, error, cbs);
};
// 删除关键词
export const deleteWabaKWlist = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/keywordConfig/deleteKeywordConfig',
        params: data
    }, 'get').init(success, error, cbs);
};

// 修改群发规则关键词
export const editWabaKWlist = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/keywordConfig/updateKeywordConfig',
        data
    }).init(success, error, cbs);
};

// 修改群发规则联系人列表
export const connectWabalist = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/limitContacts/getLimitContacts',
        params: data
    }, 'get').init(success, error, cbs);
};

// 修改群发规则联系人列表
export const deletetWabalist = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/limitContacts/deleteContacts',
        params: data
    }, 'get').init(success, error, cbs);
};

export const openConfig = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/keywordConfig/openConfig',
        params: data
    }, 'get').init(success, error, cbs);
};

export const TemplateList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/grouptask/getTemplateList',
        params: data
    }, 'get').init(success, error, cbs);
};

export const sendTemplateTobackEnd = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/whatsapp/grouptask/groupSend',
        data
    }).init(success, error, cbs);
};
// 生成阿里 oss 文件的附件下载链接(修改 content-disposition 临时生成下载附件 url)
export const generateOSSDownloadUrl = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWA',
        url: '/whatsapp/oss/generateDownloadUrl',
        data
    }).init(success, error, cbs);
};


// 获取 wa 消息发送失败原因
export const getWaMsgSendErrInfo = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWA',
        url: '/minor/waba/errorMsg/get',
        params
    }, 'get').init(success, error, cbs);
};
// wa侧边栏优化根据wa号码 查询有权限的线索和客户
export const getWaCrmDetail = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/es/api/esData/searchListByWhatsapp',
        data: data
    }).init(success, error, cbs);
};
// 翻译记忆查询
export const getTranslateMemory = (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxHkJson',
        url: '/social/sessionlanguageconfig/getLanguage',
        data
    }).init(success, error, cbs);
};
// 设置翻译记忆
export const setTranslateMemory = (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxHkJson',
        url: '/social/sessionlanguageconfig/save',
        data
    }).init(success, error, cbs);
};
// 根据消息id 查询 对话列表中的最后一条消息对应的字典
export const getNickNameByMsgId = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/whatsapp/chatRecords/getNickName',
        data: data
    }).init(success, error, cbs);
};

// 获取 wa 个人版登录二维码
export const getWAPersonalEditionLoginQrCode = async (params = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAPersonalEdition',
        url: '/whatsapp/person/getPersonalQrCode',
        params,
        cancelToken
    }, 'get').init(success, error, cbs);
};

// 检查 wa 个人版登录情况
export const WAPersonalEditionLoginCheck = async (params = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAPersonalEdition',
        url: '/whatsapp/person/personalLoginCheck',
        params,
        cancelToken
    }, 'get').init(success, error, cbs);
};

// 向后端发送输入框文本内容
export const broadcastChatContent = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/chat/broadcastChatContent',
        data,
        cancelToken
    }, 'post').init(success, error, cbs);
};

// 向后端发送清除输入框文本内容请求
export const deleteBroadcastChatContent = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/chat/deleteBroadcastChatContent',
        data,
        cancelToken
    }, 'post').init(success, error, cbs);
};
// 群发任务列表-查询群发余额
export const getAccountConfigbalance = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWA',
        url: '/minor/api/account/getAccountConfig',
        data
    }).init(success, error, cbs);
};

// 个人版群发
export const groupMessage = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAFormDataLongTime',
        url: 'minor/proVersion/groupMessage',
        data
    }).init(success, error, cbs);
};

// 个人版群发-获取任务时间
export const computingTime = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: 'minor/proVersion/computingTime',
        data
    }).init(success, error, cbs);
};

// 个人版群发-获取任务时间
export const selectAllQuantities = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        // url: 'http://192.168.72.179:8086/minor/proVersion/computingTime',
        url: 'minor/proVersion/selectAllQuantities',
        data
    }).init(success, error, cbs);
};

