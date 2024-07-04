export default {
    loopManage: 'Closed-Loop Optimization',
    googleAdvise: 'To maximize the effectiveness of smart bid strategies and provide sufficient data to machine learning algorithms to make informed bidding decisions, Google officially recommends "should receive at least 30 closed-loop data in the past 30 days.',
    closeLoopList: 'The following is a list of closed-loop data of Leadscloud received by each Google Ads conversion. ',
    closeLoopList12200: 'The following is a list of closed-loop data of XingGu received by each Google Ads conversion. ',
    audit: 'Review',
    manualBack: 'Manually Return ',
    passBack: 'Return',
    submitAudit: 'Submit',
    willAudit: 'Pending Review',

    //  表格
    visitorID: 'Visitor ID',
    conversionAction: 'Conversion action',
    revenueValue: 'Conversion Value',
    adsAccount: 'Ads Name',
    campaign: 'Compaign',
    adGroup: 'Ad Group Set',
    keyWord: 'Keyword',
    device: 'Device',
    matchType: 'Matchtype',
    sumbitPerson: 'Submitter',
    conversionTime: 'Conversion Window',
    conversionStatus: 'Status',
    gclidCreateDate: 'GCLID Create time',
    gclidExpireDate: 'GCLID Return Deadline',
    presentFollowup: 'Current Follow-up Status',
    presentUpload: 'Lastest Return',
    followup: 'Follow-up Status',
    // 回传状态及提示
    notConversion: 'Unreturned',
    conversionSuccess: 'Successful',
    conversionFail: 'Failed',
    conversionWarning: 'Please select return data~',
    conversionError: 'Failed to pass back',
    error_returnGoogleForGclidCreateTime: 'It has not been more than 6 hours since the gclid click was generated and cannot be returned. Please return the gclid after clicking more than 6 hours',
    conversionUploadError: 'Failed to pass back',
    status: 'Status',
    failReason: 'Reason for failure',

    // 当前跟进状态
    lead: 'Leads',
    inquiry: 'Inquiry',
    demandConfirm: '需求确认',
    successTest: '成交测试',
    successClient: '成交客户',
    submitAuditSuccess: 'Inquiry submitted to review',
    clueSubmitAuditSuccess: 'Clue submitted to review',
    auditSuccess: 'Submitted to review',
    failedToReturnTheLead: 'Failed to return the lead, please confirm whether the association between the follow-up status and the conversion action is normal',
    submitAuditFail: 'Submisson to review failed',
    submitManualBack: 'Inquiry submitted to manual back',
    clueSubmitManualBack: 'Clue submitted to manual back',
    conversionActionFirstly: 'Operation failure，please associate the transformation operation',
    // 操作数据
    deleteData: 'Deleted the ',
    updateData: 'Modified the ',
    rowData: 'row of data',
    updateSuccess: 'Successfully modified',
    remarkWarning: 'Remarks cannot be empty',
    remarkSuccess: 'Successfully remarked！',
    valueWarning: 'Value cannot be empty',
    deleteSuccess: 'Successfully deleted',
    deleteError: 'Failed to delete',

    // 设备及匹配方式
    computer: 'Computers',
    phone: 'Mobile Phones',
    pad: 'Tablets',

    exactMatch: 'Exact match',
    phraseMatch: 'Phrase match',
    broadMatch: 'Broad match',

    auditConfirm: 'Return confirmation',
    tip_auditConfirm_related: 'Only the data of the associated Ads account can be returned, and the data without Ads account cannot be returned. Click the [Confirm] button to start returning the data that meets the conditions.',
    tip_auditConfirm_noRelated: 'Please select a Google Ads account and click the [Confirm] button to complete the postback',
    label_adsAccount: 'Google Ads',
    error_emptyAuditAdsAccount: 'Please select a Google Ads account to return data',

    failReasonList: {
        UNSPECIFIED: 'UNSPECIFIED',
        UNKNOWN: 'UNKNOWN',
        TOO_MANY_CONVERSIONS_IN_REQUEST: 'TOO_MANY_CONVERSIONS_IN_REQUEST',
        UNPARSEABLE_GCLID: 'UNPARSEABLE_GCLID',
        CONVERSION_PRECEDES_EVENT: 'CONVERSION_PRECEDES_EVENT',
        EXPIRED_EVENT: 'EXPIRED_EVENT',
        TOO_RECENT_EVENT: 'TOO_RECENT_EVENT',
        EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
        UNAUTHORIZED_CUSTOMER: 'UNAUTHORIZED_CUSTOMER',
        INVALID_CONVERSION_ACTION: 'INVALID_CONVERSION_ACTION',
        TOO_RECENT_CONVERSION_ACTION: 'TOO_RECENT_CONVERSION_ACTION',
        CONVERSION_TRACKING_NOT_ENABLED_AT_IMPRESSION_TIME: 'CONVERSION_TRACKING_NOT_ENABLED_AT_IMPRESSION_TIME',
        EXTERNAL_ATTRIBUTION_DATA_SET_FOR_NON_EXTERNALLY_ATTRIBUTED_CONVERSION_ACTION: 'EXTERNAL_ATTRIBUTION_DATA_SET_FOR_NON_EXTERNALLY_ATTRIBUTED_CONVERSION_ACTION',
        EXTERNAL_ATTRIBUTION_DATA_NOT_SET_FOR_EXTERNALLY_ATTRIBUTED_CONVERSION_ACTION: 'EXTERNAL_ATTRIBUTION_DATA_NOT_SET_FOR_EXTERNALLY_ATTRIBUTED_CONVERSION_ACTION',
        ORDER_ID_NOT_PERMITTED_FOR_EXTERNALLY_ATTRIBUTED_CONVERSION_ACTION: 'ORDER_ID_NOT_PERMITTED_FOR_EXTERNALLY_ATTRIBUTED_CONVERSION_ACTION',
        ORDER_ID_ALREADY_IN_USE: 'ORDER_ID_ALREADY_IN_USE',
        DUPLICATE_ORDER_ID: 'DUPLICATE_ORDER_ID',
        TOO_RECENT_CALL: 'TOO_RECENT_CALL',
        EXPIRED_CALL: 'EXPIRED_CALL',
        CALL_NOT_FOUND: 'CALL_NOT_FOUND',
        CONVERSION_PRECEDES_CALL: 'CONVERSION_PRECEDES_CALL',
        CONVERSION_TRACKING_NOT_ENABLED_AT_CALL_TIME: 'CONVERSION_TRACKING_NOT_ENABLED_AT_CALL_TIME',
        UNPARSEABLE_CALLERS_PHONE_NUMBER: 'UNPARSEABLE_CALLERS_PHONE_NUMBER',
        CLICK_CONVERSION_ALREADY_EXISTS: 'CLICK_CONVERSION_ALREADY_EXISTS',
        CALL_CONVERSION_ALREADY_EXISTS: 'CALL_CONVERSION_ALREADY_EXISTS',
        DUPLICATE_CLICK_CONVERSION_IN_REQUEST: 'DUPLICATE_CLICK_CONVERSION_IN_REQUEST',
        DUPLICATE_CALL_CONVERSION_IN_REQUEST: 'DUPLICATE_CALL_CONVERSION_IN_REQUEST',
        CUSTOM_VARIABLE_NOT_ENABLED: 'CUSTOM_VARIABLE_NOT_ENABLED',
        CUSTOM_VARIABLE_VALUE_CONTAINS_PII: 'CUSTOM_VARIABLE_VALUE_CONTAINS_PII',
        INVALID_CUSTOMER_FOR_CLICK: 'INVALID_CUSTOMER_FOR_CLICK',
        INVALID_CUSTOMER_FOR_CALL: 'INVALID_CUSTOMER_FOR_CALL',
        CONVERSION_NOT_COMPLIANT_WITH_ATT_POLICY: 'CONVERSION_NOT_COMPLIANT_WITH_ATT_POLICY',
        CLICK_NOT_FOUND: 'CLICK_NOT_FOUND',
        INVALID_USER_IDENTIFIER: 'INVALID_USER_IDENTIFIER',
        EXTERNALLY_ATTRIBUTED_CONVERSION_ACTION_NOT_PERMITTED_WITH_USER_IDENTIFIER: 'EXTERNALLY_ATTRIBUTED_CONVERSION_ACTION_NOT_PERMITTED_WITH_USER_IDENTIFIER',
        UNSUPPORTED_USER_IDENTIFIER: 'UNSUPPORTED_USER_IDENTIFIER',
        GBRAID_WBRAID_BOTH_SET: 'GBRAID_WBRAID_BOTH_SET',
        UNPARSEABLE_WBRAID: 'UNPARSEABLE_WBRAID',
        UNPARSEABLE_GBRAID: 'UNPARSEABLE_GBRAID',
        EXTERNALLY_ATTRIBUTED_CONVERSION_TYPE_NOT_PERMITTED_WITH_BRAID: 'EXTERNALLY_ATTRIBUTED_CONVERSION_TYPE_NOT_PERMITTED_WITH_BRAID',
        ONE_PER_CLICK_CONVERSION_ACTION_NOT_PERMITTED_WITH_BRAID: 'ONE_PER_CLICK_CONVERSION_ACTION_NOT_PERMITTED_WITH_BRAID',
        CUSTOMER_DATA_POLICY_PROHIBITS_ENHANCED_CONVERSIONS: 'CUSTOMER_DATA_POLICY_PROHIBITS_ENHANCED_CONVERSIONS',
        CUSTOMER_NOT_ACCEPTED_CUSTOMER_DATA_TERMS: 'CUSTOMER_NOT_ACCEPTED_CUSTOMER_DATA_TERMS'
    }
};