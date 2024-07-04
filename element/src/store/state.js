/* 内存数据状态 */

export default {
    // wa群发任务发送成功后,更新群发列表页面的数据
    updateWAGroupList: '',
    // whatsapp群组消息发送modal显示的阈值
    wAGroupSendVisible: false,
    wAGroupSendAccount: [], // // whatsapp群消息发送需要的号码
    wAGroupSendallChecked: undefined, // whatsapp群消息发送是不是全选
    ElementZindex: 3000, // 全局element层级
    isUpgrade: false, // 系统是否正在升级
    translateShow: false, // 聊天分屏翻译是否显示翻译框
    isFixed: false, // 分屏窗口是否被钉住的标识
    littleDrawerMailDetailFixed: false,
    isCrmDetailFixed: false,
    homeName: 'home_index', // 默认打开的首页的路由name值，默认为home_index
    qiniuHttp: 'https://content.leadscloud.com/',
    qiniuUrl: 'content.leadscloud.com',
    eventBus: null,
    relatedAccounts: [], // 当前账号关联的其他账号
    userId: '',
    enterpriseId: null,
    userName: '',
    fullName: '',
    // 是否fb客服
    isFbService: false,
    // 是否已设置 FB 客服
    hadSetIsFbService: false,
    // 是否WABA客服
    IsWabaService: false,
    // 当前用户是否是超管权限
    isSuperAdmin: false,
    hasChatAuthority: false,
    clueId: '', /* 我的线索跳到线索详情页的时候获取的ID */
    dataList: '', /* 线索详情当前页的所有消息 */
    companyId: '', // 公司ID，区别于enterpriseId
    comseaClueId: '', // 公海线索当前页
    comseaDataList: '',
    autoAssosaiteFbChatFromName: '',
    assosiatedFbCommentInquiryId: '',
    assosiatedFbCommentorAndPostId: '',
    fbChatInquiry: '',
    fbChatStatus: '',
    visitorOnlineStatus: [], // 访客在线状态
    // 系统通知
    noticeUnread: 0,
    mailUnread: 0,
    // 聊天相关
    // 正在加载中
    isLoading: true,
    // 操作是否是刷新页面，刷新初始没有nim实例，会导致时序问题
    isRefresh: true,
    // 全屏显示的原图
    isFullscreenImgShow: false,
    fullscreenImgSrc: '',
    // 全屏轮播组件相关
    isFullCarouselShow: false,
    fullCarouselProps: {},
    // 全局的"wa 回复框"相关
    globalWaReplyModalProps: {},
    // 组件分享后,调用一次页面的方法
    afterShare: false,
    // 控制预览组件显示的阈值
    showFilePreview: false,
    // 第一个预览的id
    firstFileId: null,
    // 文件储存的文件夹: 1个人文件、2公司文件、3共享文件
    fileStorageFolder: '',
    // 文件预览的文件列表
    dataBaseFileList: [],
    // 当前的文件夹(person/company)
    currentFolderLabel: null,
    // 跟进记录上传的预览
    followUpFile: {},
    // 聊天时页面 title 闪动
    newRemindFlag: '',
    // 切页动画 forward，backward
    transitionName: 'forward',
    // fb聊天,评论话术
    chatVerbalInfo: [],
    commentVerbalInfo: [],
    // fb评论二级话术
    commentSecondVerbalInfo: [],
    // IM相关
    // NIM SDK 实例
    nim: null,
    // 登录账户ID
    userUID: null,
    AccId: null,
    // 用户名片
    myInfo: {},
    // 好友/黑名单/陌生人名片, 数据结构如：{cid: {attr: ...}, ...}
    userInfos: {},
    // 用户订阅的事件同步, 数据结构如：{cid: {typeid: {...}, ...}, ...}
    userSubscribes: {},

    // 好友列表
    friendslist: [],
    // 机器人列表
    robotslist: [],
    // 用于判定帐号是否是robots
    robotInfos: {},
    robotInfosByNick: {},
    // 黑名单列表
    blacklist: [],
    // 禁言列表
    // mutelist: [],

    // teamlist: [],
    // 群自身的属性，数据结构如：{tid: {attr: ...}, ...}
    // teamAttrs: {},
    // 群对象的成员列表，数据结构如：{tid: {members: [...], ...}, ...}
    // teamMembers: {},
    // 是否第一次初始化聊天
    isFirstInitSDK: true,
    // 消息列表
    msgs: {}, // 以sessionId作为key
    msgsMap: {}, // 以idClient作为key，诸如消息撤回等的消息查找
    // 会话列表
    chattingList: {}, // 正在聊天列表
    onlineList: {}, // 在线列表
    offlineList: {}, // 离线列表
    sessionlist: [],
    sessionMap: {},
    // 当前会话ID（即当前聊天列表，只有单聊群聊采用，可用于判别）
    currTarget: {},
    currSessionId: null, // 访客的accId
    currVisitorId: null,
    // "我"(当前客服)为最近接待客服且在线的访客 visitorId
    myVisitorIds: [],
    currSessionName: null,
    currSign: '', // 当前对象备注，使用的是个人信息的sign字段
    currAvatar: null,
    currSessionMsgs: [],
    currHistorySessionMsgs: [],
    // 用于在 updateVisitorSessionList 时判断当前是否要刷新(正在聊天就要刷新)
    refreshCurrSession: false,
    // 是否有更多历史消息，用于上拉加载更多
    noMoreHistoryMsgs: {},
    // 继续对话的机器人id
    continueRobotAccid: '',

    // 系统消息
    sysMsgs: [],
    customSysMsgs: [],
    sysMsgUnread: {
        total: 0
    },
    customSysMsgUnread: 0,

    // 临时变量
    // 缓存需要获取的用户信息账号,如searchUser
    searchedUsers: [],
    // 缓存需要获取的群组账号
    searchedTeams: [],

    // 聊天室相关
    // 聊天室sdk实例
    chatroomInsts: {},
    chatroomInfos: {},
    // 聊天室分房间消息集合
    chatroomMsgs: {},
    // 当前聊天室实例及id
    currChatroom: null,
    currChatroomId: null,
    currChatroomMsgs: [],
    currChatroomInfo: {},
    // 聊天室成员列表
    currChatroomMembers: [],
    // 访客正在输入中
    visitorInputStatus: false,
    inputIngVisitorId: '',
    /**
     * @Date: 2020-04-24 15:10:07
     * @LastEditors: niumkiki
     * @description: 访客正在输入的信息集合
     * @param :
     * {
            inputIngVisitorId: '', // 访客id
            inputingContent: '', // 输入内容
            isInput: false, //是否正在输入
            accId: '' // 对应Accid
        }
     * @return:
     */
    visitorInputInfos: [],
    // 访客轨迹
    personTrackList: {},
    currPersonTrackList: [],
    currPersonTrackListTemp: [],
    // 访客订阅
    personSubscribes: {},
    personSubscribesList: [],
    // 缓存需要获取的用户信息账号
    person: {},
    personList: {},
    // 是否正在聊天
    isChatting: {},
    // 是否显示话术
    isShowVerbal: false,
    chatVerbalList: false,
    commentVerbalList: false,
    verbal: {},
    // 聊天框草稿
    msgDraft: {},
    // 话术
    msgToSentTemp: {},
    // 聊天访客信息相关
    visitorSessionInfo: new Map(),
    visitorBaseInfo: {},
    browserInfo: '',
    browserIcon: '',
    systemInfo: '',
    systemIcon: '',
    visitorIp: '',
    // 聊天访客信息相关
    AllVisitorType: [],
    CurrVisitorType: '',
    // 聊天界面状态
    chatView: true,
    clueModal: false,
    // 是否开启访客提醒
    isNoticeNewVisitor: true,
    visitorNoticeList: [],
    isWindowFocus: false,
    domsgNotificationItems: [],
    // 转接
    chatTransfer: false,
    transferComfir: false,
    transferInfo: {},
    isChatWithOther: {},
    ChatWithOtherTip: '该访客正在和其他客服聊天，不可访问',
    notChatWithOther: false,
    /**
     * @Description: 将 disableChat 从 Boolean 改为 Object , { visitorId: Boolean 或 cancelFunc }
     * @author 汤一飞
     * @date 2020/5/15
    */
    disableChat: {},
    flagToInput: false,
    startFlagArr: [],
    syncRouter: [],
    // 是否连接SDK
    isSDKconnect: true,
    // 匹配浏览器设置table的高度
    clipHeight: 0,
    // document.documentElement.clientHeight
    window_height: 0,
    window_width: 0,
    isShowTinyDetail: false,
    currCompanyId: 0,
    currClueId: 0,
    currVisitorType: '', // 当前访客录入状态
    currInquiryId: '', // 当前询盘id
    isAddToBlackSuccess: null,
    // 产品管理
    productShow: 'list',
    isShowAddBlackModal: false,
    // 是的已经勾选了在线（是否已经登录聊天）
    isServerOnlineChecked: false,
    // 聊天未读消息总数
    totalChatCount: 0,
    // 是否刷新在线客服列表，接收到离线消息或点击在（离）线》客服在（离）线》改变状态》刷新在线客服列表
    isReloadServerList: -1,
    // 客服在线列表
    serviceList: [],
    // 多端登录 false为有其它端退出聊天
    LoginPorts: null,
    isSwitchChatState: '',
    // 当SDK断开连接或重新连接时，修改客服状态;
    SDKCallbackState: 'connect',
    // 是否有抽屉正在显示
    crm_drawer_show: false,
    clue_drawer_show: false,
    leads_drawer_show: false,
    product_drawer_show: false,
    visitor_drawer_show: false,
    adsSet_drawer_show: false,
    // 网页标题
    sourceDocumentTitle: '询盘云管理系统',
    // 聊天多端登录状态发生改变时（离线），当前页面是否退出聊天
    isAllowToOffLine: true,
    biHttp: 'http://bi.leadscloud.com',
    bi_report_menu: {
        watch_bi_report: 'http://bi.leadscloud.com/bi?proc=0&action=viewerManager ',
        create_bi_report: 'http://bi.leadscloud.com/bi?proc=0&action=editor&browserType=chrome'
    },
    // 聊天分屏所处的界面
    currInterface: 'splitChatList',
    // Facebook分屏所处的界面
    FacebookSplitShowList: true,
    // true：直接更新列表 false：只做过滤
    updateListOrFilter: true,
    // 分屏时点击了非正在聊天有未读数的会话
    notChattingWithUnreadCollect: [],
    /* 自助建站 */
    // true: 全屏展示预览模板模态框
    isShowFullTemplateModal: false,
    // 预览模板路径
    FullTemplatePath: '',
    // 定制站列表总数
    WPStationNum: 0,
    // 模板站列表总数
    TemplateStationNum: 0,
    // 网站管理显示哪个组件
    showWitchComponent: 'myWebsite',
    // 创建了一个精品站
    isCreateSite: false,
    // 保存线索简略信息
    clue_short_info: {},
    // 台州柏森客户 客户列表页多加一个字段 ‘自增编号’
    // myCustomerShowNumbering: ['10849', '11076'],
    // 左侧菜单是展开还是关闭
    menuExpand: true,
    isHidden: false,

    // 若客服处于在线状态并且超过5分钟网络断开，则客服自动下线，避免遗漏访客消息
    autoLogoutChat: false,

    // 调用健康检查接口获取到的访问速度最快的 wa url
    healthWAUrl: '',
    // 调用健康检查接口获取到的访问速度最快的 fb url
    healthFBUrl: '',

    // 当前询盘云版本(目前就一个 wa 个人版)
    version: '',

    // 客户定制版本, 相关配置
    customEditionConfig: {
        customFor_11729: {
            routeTitle: '富怡天成客户管理系统',
            logoUrl: `${process.env.BASE_URL}image/11729_logo.svg`,
            logoUrl_text: `${process.env.BASE_URL}image/11729_logo_text.svg`,
            logoUrl_icon: `${process.env.BASE_URL}image/11729_logo_icon.svg`
        },
        customFor_11802: {
            routeTitle: '铧铖贸易营销数字化管理平台',
            logoUrl: `${process.env.BASE_URL}image/11802_logo.png`,
            logoUrl_text: `${process.env.BASE_URL}image/11802_logo_text.svg`,
            logoUrl_icon: `${process.env.BASE_URL}image/11802_logo_icon.svg`,
            loginBgUrl: `${process.env.BASE_URL}image/11802_loginBg.png`
        },
        customFor_12200: {
            routeTitle: '星谷管理系统',
            logoUrl: `${process.env.BASE_URL}image/12200_logo.png`,
            logoUrl_icon: `${process.env.BASE_URL}image/12200_logo.png`
        }
    },
    // 自动翻译-收信开关状态
    autoTranslateStatusRecive: false,
    // 自动翻译-目标语种
    autoTranslatetargetLang: 'zh_CN',
    // 自动翻译-不需要翻译的语种
    autoTranslateNoTArr: ['zh_CN'],
    // 自动翻译-发信翻译开关
    autoTranslateStatusSend: false,
    // 当前wa会话保存的翻译语种
    isInNotNeeDTranslateArr: '',
    // 剩余字符数
    autoTranslateCharactCount: 0,
    // 主应用路有跳转时, 存储跳转信息
    jumpingRouterInfo: null
};
