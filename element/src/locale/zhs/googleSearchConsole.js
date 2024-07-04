export default {
    siteProperty: '站点',
    dateRange: '日期',
    PageIndexing: '索引编制',
    SearchPerformance: '搜索效果',
    Sitemaps: '站点地图',

    error_getSiteList: '获取站点失败',
    error_noSite: '未绑定站点',

    title_PageIndexing: '网页索引编制',
    lastUpdateTime: '上次更新时间',

    notIndexed: '未被编入索引',
    indexed: '已被编入索引',

    tip_notIndexed: 'Google 未将这些网址编入索引。这可能是您有意为之；但也可能表示出现了错误。请查看下表中的问题，确定是否需要修正这些网址。',
    tip_indexed: 'Google 已将这些网址编入索引。',

    searchType: '搜索类型',
    reason: '原因',
    source: '来源',
    webPage: '网页',
    tip_inputPage: '请输入网址',

    source_default: '',
    source_1: '网站',
    source_2: 'Google 系统',

    noIndexedReason_default: '',
    noIndexedReason_1: '服务器错误 (5xx)',
    noIndexedReason_2: '重定向错误',
    noIndexedReason_3: '网址已被 robots.txt 屏蔽',
    noIndexedReason_4: '被“noindex”标记排除了',
    noIndexedReason_5: '软 404',
    noIndexedReason_6: '由于会返回“未授权的请求”(401) 错误而被屏蔽',
    noIndexedReason_7: '未找到 (404)',
    noIndexedReason_8: '由于禁止访问 (403) 而被屏蔽',
    noIndexedReason_9: '网址因遇到其他 4xx 问题而被屏蔽',
    noIndexedReason_10: '重复网页（用户未选定规范网页）',
    noIndexedReason_11: '被网页移除工具屏蔽',
    noIndexedReason_12: '已抓取 - 尚未编入索引',
    noIndexedReason_13: '已发现 - 尚未编入索引',
    noIndexedReason_14: '备用网页（有适当的规范标记）',
    noIndexedReason_15: '重复网页（Google 选择的规范网页与用户指定的不同）',
    noIndexedReason_16: '网页会自动重定向',
    noIndexedReason_17: 'Google 无法识别此网址',

    notIndexedReason: '网页未被编入索引的原因',
    notIndexedUrl: '未被编入索引的网址',
    indexedUrl: '已被编入索引的网址',

    url: '网址',
    lastCrawlTime: '上次抓取时间',

    filter: '查询',
    network: '网络',
    picture: '图片',
    video: '视频',
    news: '新闻',

    query: '查询数',
    page: '网页',
    country: '国家/地区',
    device: '设备',
    searchAppearance: '搜索结果呈现',
    date: '日期',

    avgRanking: '平均排名',
    totalClicks: '点击次数',
    totalImpressions: '展示次数',
    avgClickRate: '平均点击率',

    popularQueries: '热门查询',
    clicks: '点击次数',
    impressions: '展示次数',
    clickRate: '点击率',
    ranking: '排名',

    tip_ranking: '平均排名是指您的网站在搜索结果中的平均排名（由系统使用每当您的网站在搜索结果中出现时的最高排名计算得出）。',
    tip_clicks: '总点击次数是指用户通过点击相应链接转到您的网站的次数，其计算方式取决于搜索结果的类型。',
    tip_impressions: '总展示次数是指用户在搜索结果中看到指向您网站的链接的次数。对于图片和其他搜索结果类型，该值的计算方法会有所不同，具体取决于相应结果是否被滚动到了用户的视野范围内。',
    tip_clickRate: '平均点击率是指带来点击的展示所占的百分比。',

    addNewSitemap: '添加新的站点地图',
    placeholder_addNewSitemap: '输入站点地图网址',
    submittedSitemaps: '已提交的站点地图',

    sitemap: '站点地图',
    type: '类型',
    lastReadTime: '上次读取时间',
    status: '状态',
    discoveredPages: '已发现的网页',
    discoveredVideos: '已发现的视频',
    autoCommitCycle: '自动提交周期',
    sitemapIndex: '站点地图索引',
    RSS: 'RSS',
    Atom: 'Atom',
    unknown: '未知',
    success: '成功',
    haveError: '含有错误',
    unableToCrawl: '无法抓取',
    fail: '失败',

    submitSitemap: '提交站点地图',

    discoveredPagesCount: '已发现的网页总数',
    discoveredVideosCount: '已发现的视频总数',
    sitemapProcessingStatus: '站点地图处理状态',

    success_editAutoCommitCycle: '站点地图自动提交周期设置成功',
    error_editAutoCommitCycle: '站点地图自动提交周期设置失败，请重试',
    success_submitSitemap: 'Google 站点地图提交成功',
    error_submitSitemap: 'Google 站点地图提交失败，请确认绑定状态是否有效',

    readSitemaps: '已读取的站点地图',

    error_siteInvalid1: '您的账号或者站点可能失效，请到 ',
    error_siteInvalid2: ' 绑定页面重新绑定',
    tip_noValidSite1: '当前未绑定 Google Search Console 站点，或者已绑定的站点均已失效\n请到',
    tip_noValidSite2: '绑定页面，进行绑定站点',
    error_haveNoPermissionSearchConsoleBinding: '您没有Google Search Console 绑定的页面权限，请联系管理员开通'
};
