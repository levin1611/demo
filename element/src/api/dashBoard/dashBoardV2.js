import { Request } from '../baseUtilAjax';

export const getSalesList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/cuss-login/getSaleUserList',
        data
    }).init(success, error, cbs);
};

export const getBusinessStats = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/report/getPerformanceStats',
        data
    }).init(success, error, cbs);
};

export const getWorkLoadStats = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/report/getWorkLoadStats',
        data
    }).init(success, error, cbs);
};

export const getKeyAcc = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/report/getImportantClientStats',
        data
    }).init(success, error, cbs);
};

export const getMailStats = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/report/getMailProcessStats',
        data
    }).init(success, error, cbs);
};

export const getTodayTaskList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/task/getCalendarList',
        data
    }).init(success, error, cbs);
};

export const getTaskDetail = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/crm/task/get',
        data
    }).init(success, error, cbs);
};

export const getStaffToDoList = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/report/getStaffToDoStats',
        data,
        cancelToken
    }).init(success, error, cbs);
};

export const getDashBoardConfig = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/dashboard/reportConfig/getReportConfig',
        params
    }, 'get').init(success, error, cbs);
};
export const getDashboardModule = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/dashboard/reportConfig/getDashboardModule',
        params
    }, 'get').init(success, error, cbs);
};

export const saveDashBoardConfig = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/reportConfig/saveReportConfig',
        data
    }).init(success, error, cbs);
};

/**
 * 业绩目标设置接口
 * */

// 获取业绩目标设置
export const getTargetSetting = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/performanceTargetSetting/get',
        data
    }).init(success, error, cbs);
};

// 保存业绩目标设置
export const saveTargetSetting = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/performanceTargetSetting/save',
        data
    }).init(success, error, cbs);
};

// 获取业绩目标报表数据
export const getTargetDetail = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/report/getPerformanceTargets',
        data
    }).init(success, error, cbs);
};

// 获取年度绩效报表数据
export const getAnnualPerformance = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/report/getPerformanceOverview',
        data
    }).init(success, error, cbs);
};

// 获取客户跟进情况概览数据
export const getFollowUpOverview = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/report/getCustomerFollowupOverview',
        data
    }).init(success, error, cbs);
};

// 获取沉睡客户提醒表格数据
export const getSleepReminder = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/report/getSleepingCustomerReminderStats',
        data
    }).init(success, error, cbs);
};

// 力新 销售不同跟进阶段的询盘统计
export const getDiffFollowupInquiryStats = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/report/getDiffFollowupInquiryStats',
        data
    }).init(success, error, cbs);
};

// 力新 销售不同跟进阶段的询盘统计
export const getClueAndInquiryStats = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/report/getClueAndInquiryStats',
        data
    }).init(success, error, cbs);
};

// 触点沟通, 数据导出
export const getTouchPointData = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJson',
        url: '/minor/waReport/getWaReport',
        data,
        cancelToken
    }).init(success, error, cbs);
};

// 触点沟通, 数据导出
export const exportTouchPointData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxWAJsonLongTime',
        url: '/minor/waReport/waReportExport',
        data
    }).init(success, error, cbs);
};
// 获取 数据概览
export const getDataOverview = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/workbench/dataOverview',
        data
    }).init(success, error, cbs);
};
// 获取 业绩完成情况
export const getPerformanceTargetsNew = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/workbench/getPerformanceTargetsNew',
        data,
        cancelToken
    }).init(success, error, cbs);
};
// 导出报表
export const exportExcel = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/reportDownload/exportExcel',
        data
    }).init(success, error, cbs);
};
// 获取 重点跟进询盘
export const getInquiryMarker = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/workbench/getInquiryMarker',
        data,
        cancelToken
    }).init(success, error, cbs);
};
// 获取 员工资源统计
export const getStaffResourceStat = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/workbench/getStaffResourceStat',
        data,
        cancelToken
    }).init(success, error, cbs);
};
// 获取 询盘分布统计
export const getInquiryDistribution = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/workbench/getInquiryDistribution',
        data,
        cancelToken
    }).init(success, error, cbs);
};
// 获取 询盘分布统计
export const getCompanyDistribution = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/workbench/getCompanyDistribution',
        data,
        cancelToken
    }).init(success, error, cbs);
};
// 获取 线索分布统计
export const getClueDistribution = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/workbench/getClueDistribution',
        data,
        cancelToken
    }).init(success, error, cbs);
};
// 获取 matomo 下所有网站
export const getAllMatomoSites = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/piwik/matomo/getSiteList',
        params
    }, 'get').init(success, error, cbs);
};

// 获取网站访问数据概览
export const getWebDataOverview = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/piwik/visit/overview/getStat',
        data
    }).init(success, error, cbs);
};

// 获取所有留言表单
export const getAllMsgForm = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/form-cust/template/getTemplateList',
        params
    }, 'get').init(success, error, cbs);
};

// 获取网站交互数据统计截止时间
export const getWebDataSyncTime = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/piwik/visit/getLastSynTime',
        params
    }, 'get').init(success, error, cbs);
};

// 下载网站流量数据
export const getWebsiteTrafficStatusData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/piwik/visit/traffic/getStatListAndTotal',
        data
    }).init(success, error, cbs);
};

// 下载网站流量数据
export const downloadWebsiteTrafficStatusData = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/piwik/visit/traffic/download',
        params
    }, 'get').init(success, error, cbs);
};

// 获取访客分析数据
export const getVisitorStatisticsData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/piwik/visitor/analysis/getStatList',
        data
    }).init(success, error, cbs);
};

// 下载网站流量分析数据
export const downloadVisitTrafficAnalysisData = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/piwik/visitor/analysis/download',
        params
    }, 'get').init(success, error, cbs);
};

// 获取留言状态数据
export const getMsgStatusData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/piwik/form/search/getStatList',
        data
    }).init(success, error, cbs);
};

// 获取留言页面数据
export const getMsgPageStatusData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/piwik/form/search/getStatList',
        data
    }).init(success, error, cbs);
};

// 下载留言页面数据
export const downloadMsgPageStatusData = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/piwik/form/search/download',
        params
    }, 'get').init(success, error, cbs);
};

export const getStatus = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/google/getStatus',
        data,
        cancelToken
    }).init(success, error, cbs);
};
// 获取全部客服
export const getAllCustomerService = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/piwik/customer/service/getNameList',
        params
    }, 'get').init(success, error, cbs);
};

// 获取客服工作情况数据
export const getServiceWorkData = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/piwik/customer/service/getStatList',
        data
    }).init(success, error, cbs);
};

// 获取客服工作情况数据
export const downloadServiceWorkData = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxInternationalJson',
        url: '/piwik/customer/service/download',
        params
    }, 'get').init(success, error, cbs);
};
// 获取 google营销转化表
export const getGoogleDashBoard = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/google/getGoogleDashBoard',
        data,
        cancelToken
    }).init(success, error, cbs);
};

export const getGoogleState = async (params = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxJson',
        url: '/dashboard/google/getGoogleState',
        params
    }, 'get').init(success, error, cbs);
};
