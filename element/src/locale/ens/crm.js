export default {
    Table: {
        inquiry: 'Inquiry',
        customer: 'customers',
        noData: 'No data',
        noFilterData: 'No matching data under the current filtering conditions',
        noFilterDataButton: 'Restore the default filter conditions',
        customerColumnsNoData: 'No data',
        /* 我的询盘 */
        viewList: 'list',
        viewCard: 'Split screen view',
        // 顶部下拉框
        myInquiry: 'My Inquiry',
        allInquiry: 'All Inquiry',
        errorOccurred: 'An error occurred',
        module_DetailInfo: 'Company Information',
        module_ContactList: 'Contact',
        module_Documents: 'Document',
        module_Task: 'Task',
        // 按钮
        selected: 'Selected',
        item_customer: 'customer',
        item_customers: 'customers',
        item_customer_withName: '',
        item_customers_withName: '',
        item_clue: 'clue',
        item_clues: 'clues',
        item_inquiry: 'inquiry',
        item_inquiries: 'inquiries',
        item_group: 'group',
        item_groups: 'groups',
        item_inquiry_withName: '',
        item_inquiries_withName: '',
        item_user: 'user',
        item_users: 'users',
        item_role: 'role',
        item_roles: 'roles',
        merge: 'Merge',
        newCompany: 'Add',
        importData: 'Import',
        filter: 'Filter',
        exportData: 'Download',
        audienceOptimization: 'Audience optimization',
        batchEdit: 'Batch edit',
        bulkSending: 'Separate',
        sendWhatsApp: 'Send WhatsApp',
        batchTransfer: 'Batch Transfer',
        batchThrow: 'Batch Transfer to Public Customers',
        sendAll: 'Send All',
        primaryContact: 'Primary Contact',
        selectContactBoxTip1: 'Qualified contacts',
        selectContactBoxTip2: 'in total',
        selectContactBoxTip_email: 'No eligible contacts',
        selectContactBoxTip_whatsApp: 'No eligible contacts',
        // 检索
        saveSearch: 'Save as a customized filter',
        search: 'Filter',
        searchComment: 'Common Filter',
        searchCommon: 'Common Filter',
        searchName: 'Filter Name',
        tip_customSearch: 'Customized Filter',
        searchCondition: 'Filter Conditions',
        tip_addKeywords: 'Add keywords',
        tip_inputNumber: 'Please enter the number',
        tip_selectTime: 'Please select time',
        activated: 'Enabled',
        terminated: 'Not Enabled',
        GoogleMachineLearning: 'Google Machine Learning',
        GoogleAudienceOptimization: 'Google audience optimization',
        FacebookAudienceOptimization: 'Facebook audience optimization',
        GoogleToAudit: 'Google back to audit',
        GoogleIsLearning: 'Google is  learning',
        FacebookIsLearning: 'Facebook is learning',
        clear: 'Clear',
        con_equal: 'equal to',
        con_unequal: 'not equal to',
        con_include: 'include',
        con_exclude: 'not include',
        con_lessThan: 'less than',
        con_greaterThan: 'greater than',
        con_lessOrEqual: 'less than or equal to',
        con_greaterOrEqual: 'greater or equal to',
        con_periodOfTime: 'period',

        // 时间
        today: 'Today',
        yesterday: 'Yesterday',
        recent7days: 'Last 7 days',
        recent14days: 'Last 14 days',
        recent30days: 'Last 30 days',
        thisWeek: 'This Week',
        lastWeek: 'Last Week',
        thisMonth: 'This Month',
        lastMonth: 'Last Month',
        thisSeason: 'This quarter',
        lastSeason: 'Last quarter',

        // 修改字段
        editColumns: 'Display Column',
        selectAll: 'Select all',

        // 表格
        col_customerNumber: 'Customer number',
        col_number: 'NO.',
        col_seqNumber: 'Inquiry ID',
        col_companyName: 'Company Name',
        col_corpShortName: 'Company Abbreviation',
        col_productCategory: 'Product Categories',
        col_label: 'Label',
        col_demandProducts: 'Demand',
        col_sourceChannel: 'Source Channel',
        col_sourceWay: 'Source Mode',
        col_inquiryManagers: 'Sales Rep.',
        col_status: 'Optimization Status',
        col_followUp: 'Follow-up Status',
        col_followUpCount: 'Follow-up Frequency',
        col_touchCount: 'Customer Reach',
        col_grouping: 'Inquiry Grade',
        col_remark: 'Demand Note',
        col_createTime: 'Creation Time',
        col_updateTime: 'Last Updated Time',
        col_notFollowedDays: 'Number of not followed days',
        col_lastFollowup: 'Recent updates',
        col_lastFollowupTime: 'Recent follow-up time',
        col_lastGiveupTime: 'Time of last retreat to public pool',
        col_mostRecentlyObtainedTime: 'Recently obtained time',
        col_customerSource: 'Customer source',
        col_lastTransactionTime: 'Latest transaction time',
        col_transactionInquiryNO: 'Number of transaction inquiries',
        col_inflowintoTheOpenSea: 'Expected date of inflow into the high seas',
        col_transactionInquiryAmount: 'Transaction inquiry amount',
        getTableColumnOrder: 'Failed to get fields order, the table shows all items by default',
        error_getCommonSearchItem: 'No terms detected',
        error_sameCommonSearchName: 'Duplicate name, please change',
        error_getCommonSearchList: 'Failed to get common filter',
        corp_marked: 'Marked',
        corp_unmark: 'Unmarked',
        total: 'Total',
        page: '',

        // 编辑字段模态框
        title_editColumns: 'Edit display fields',
        hidingColumns: 'Hidden fields',
        showingColumns: 'Displayed fields',
        saveShowingColumns: 'Save Settings',
        success_saveShowingColumns: 'Saved field order successfully',
        error_saveShowingColumns: 'Failed to save field order',

        // 弹出提示
        error_reSearchTip: 'The child filter cannot match the parent filter. Please add the condition and try again',
        error_getTableColumns: 'Failed to get form field',
        error_getSelectOptions: 'Failed to request dropdown option field!',
        error_getInquiryTableData: 'Failed to get inquiry list',
        error_save: 'Failed to save',
        error_getManagerList: 'Failed to get the list of sales rep.',
        error_emptySearchName: 'Please fill in the Search Name',
        error_searchNameLength: 'The maximum length of the Search Name is 50 characters',
        info_onlyOneUpdateTime: 'The Last Updated Time can only be one filter condition',
        info_onlyOneBirthday: 'The birthday can only be one filter condition',
        info_onlyOneEmail: 'The E-mail can only be one filter condition',
        info_onlyOneInquiryManagers: 'The sales rep. can only be one filter condition',
        info_onlyOneStatus: 'The Optimization Status can only be one filter condition',
        info_saveEmptyConditions: 'The Filter Conditions cannot be empty',
        info_searchEmptyConditions: 'Filter condition cannot be empty',
        success_save: 'Saved successfully',
        info_save_partially: 'Partially saved successfully',
        error_mergeInquiryBelong: 'Data cannot be merged for not belong to the same customer',
        error_mergeInquiryLength: 'Please select two inquiries for merging',
        error_audienceOverLength: 'Only a maximum of 500 inquiry can be returned at a time, please re-select the data to be returned.',

        // 详情页要用
        info_lastInquiry: 'This is the last inquiry on this page, please return to the form page and click the next page button.',
        info_firstInquiry: 'This is the first inquiry on this page, please reture to the form page and click the previous page button.',


        /* 我的客户 */

        // 顶部下拉框
        /**
         * myCustomer组件（直接搜就能搜到）中的28行和29行：
         * 三元判断这样写的：title_topFilter==='我的客户'||title_topFilter==='My Customers'
         * 如若修改此处的内容，组件中也应修改
         */
        myCustomer: 'My Customers',
        allCustomer: 'All Customers',
        empty: 'Empty (not filled)',
        // 检索
        con_is: 'Yes',
        con_not: 'No',
        con_nolimit: 'No limit',
        // 表格
        col_shortName: 'Abbreviation',
        col_starLevel: 'Customer Rank',
        col_country: 'Country',
        col_scale: 'Scale',
        col_clientType: 'Customer Type',
        col_mainProduct: 'Main Products',
        col_companyManagers: 'Sales Rep.',
        col_companyManagerDepartments: 'Owner department',
        col_marker: 'Key Mark',

        // 弹出提示
        error_getCompanyTableData: 'Failed to get company list',
        error_companyId: 'Company ID error',
        error_mergeCompanyLength: 'Please select two customers for merging',
        error_transferCountryAreaCode: 'Failed to convert country/region field code to text',

        // 详情页要用
        info_lastCompany: 'This is the last customer on this page, please return to the form page and click the next page button.',
        info_firstCompany: 'This is the first customer on this page, please reture to the form page and click the previous page button.',


        /* 公海管理 */

        // 顶部下拉框
        highseasCustomer: 'Public Pool',

        col_lastGiveupReason: 'Reasons for returning to the public pool recently',
        autoGiveup: 'Automatically return into the public pool',


        /* 联系人 */

        // 顶部下拉框
        myContact: 'My Contacts',
        allContact: 'All Contacts',

        col_nickName: 'Name',
        col_jobTitle: 'Position',
        col_email: 'E-mail',
        col_phone: 'Phone',
        col_jobGrade: 'Occupation Class',
        col_socialNetworkingPlatform: 'Social Platforms',
        col_birthday: 'Birthday',
        col_gender: 'Gender',
        col_picture: 'Contact Picture',
        col_contactRemark: 'Contact Note',
        col_reason: 'Reason for returning to public pool',
        error_getContactTableData: 'Failed to get contact list',

        operate: 'Operation',

        /* 批量操作 */
        batchThrowCustomersLimit: 'You can only select up to 100 customers for a single batch return to the public',
        batchClaimCustomersLimit: 'You can only select up to 100 customers for a single batch claim',
        batchDistributeCustomersLimit: 'You can only select up to 100 customers in a single batch allocation',
        // 最近跟进动态 whatsApp 消息类型提示
        col_whatsapp_message_type2: 'image',
        col_whatsapp_message_type3: 'document',
        col_whatsapp_message_type4: 'video',
        col_whatsapp_message_type5: 'audio',
        col_whatsapp_message_type6: 'contact',
        col_whatsapp_message_type9: '模板消息',
        col_qiwei_message_type2: 'image',
        col_qiwei_message_type3: 'document',
        col_qiwei_message_type4: 'video',
        col_qiwei_message_type5: 'link',
        col_qiwei_message_type6: 'image',
        col_qiwei_message_type7: 'business card',
        col_qiwei_message_type8: 'Applets',
        col_qiwei_message_type9: 'audio',
        col_qiwei_message_type10: 'video number',
        col_qiwei_message_type10000: 'system information',
        // 权限报错
        system_fields_cannotEdit: 'System fields cannot be edited through the list',
        no_editing_rights: 'No field edit permission',
        cannot_edit_followUp: '\'Follow-up Status\' cannot be edited through the list',
        system_fields_cannotEdit_company: '\'Company Name\' cannot be edited through the list. ',
        system_fields_cannotEdit_socialNetworkingPlatform: '\'Social Platform\' cannot be edited through the list. ',
        system_fields_cannotEdit_phone: '\'Phone\' cannot be edited through the list. ',
        system_fields_cannotEdit_whatsApp: '\'WhatsApp\' cannot be edited through the list. ',
        publisher: 'All Publishers',
        contactsName: 'All Contacts',
        myCreate: 'Created',
        myCreateTran: 'Created and to be transformed',
        myChargeTran: 'Responsible for and to be converted',
        myCharge: 'Responsible for',
        inquiryMarker: 'Key mark',
        allfollowUpPlan: 'All Follow up Plan',
        myFollowUpPlan: 'I executed',
        myCreateFollowUpPlan: 'I Created',
        subordinateFollowUpPlan: 'Executed by subordinates',
        customSearchTip1: '符合下列',
        customSearchTip2: '条件',
        all: 'all',
        anyone: '任意一项'
    },
    Detail: {
        /* 我的询盘 */

        // 按钮
        editInquiry: 'Edit',
        transferInquiry: 'Transfer',
        sendMail: 'Send Email',
        viewInquiryLog: 'Inquiry Log',
        newContact: 'Add Contact',
        shareInquiry: 'Share',
        throwInquiry: 'Transfer To Public Customers',
        addInquiryLabel: 'Label',
        sendMessenger: 'send Messenger',

        // 自定义字段
        customInfoField: 'Customized Field',

        // 询盘信息条目
        inquiryManagers: 'Sales Rep.',
        inquiryStatus: 'Leads status',
        inq_seqNumber: 'Inquiry ID',
        inq_productCategory: 'Product Categories',
        inq_demandProducts: 'Demand',
        inq_grouping: 'Inquiry Grade',
        inq_sourceChannel: 'Source Channel',
        inq_sourceWay: 'Source Mode',
        inq_label: 'Label',
        inq_inquiryScore: 'Inquiry Score',
        inq_followUp: 'Follow-up Status',
        inq_remark: 'Demand Note',
        inq_estimatedInquiryAmount: 'Estimated Inquiry Amount',

        // 公司信息条目
        corp_companyId: 'Company ID',
        corp_companyName: 'Company Name',
        corp_shortName: 'Abbreviation',
        corp_scale: 'Scale',
        corp_mainProduct: 'Main Products',
        corp_clientType: 'Customer Type',
        corp_country: 'Country / Region',
        corp_homePage: 'Company Website',
        corp_phone: 'Landline',
        corp_fax: 'Fax',
        corp_contactAddress: 'Contact Address',
        corp_relatedCompany: 'Related Companies',
        corp_companyPicture: 'Photo of Company',
        corp_companyRemark: 'Company Note',
        corp_mark: 'Mark',
        corp_starLevel: 'Star Level',

        // 动态组件
        inquiryFollowUp: 'Follow-up Record',
        contactInfo: 'Contact Information',
        schedule: 'Tasks',
        relatedDocuments: 'Related Documents',
        inquiryOrigin: 'Inquiry Source',

        // 弹出提示
        error_getInquiryInfo: 'Failed to get inquiry information',
        error_getOwnerCompany: 'Failed to get company information of this inquiry',
        error_deleteLabel: 'Failed to delete label',


        /* 我的客户 */

        // 按钮
        customData: 'Customs Data',
        editCompany: 'Edit',
        addInquiry: 'Add Inquiry',
        addInquiryNew: 'Add Inquiry',
        writeMail: '写邮件',
        viewCompanyLog: 'Company Log',
        remarkFun: 'Key Mark',
        transferCompany: 'Transfer',
        shareCompany: 'Share',
        unfollow: 'Unfollow',
        throwCompany: 'Transfer To Public Customers',
        changeManagers: 'Change Responsible Person',
        unfollowTip: 'No eligible customers',
        unfollowText: '',
        unfollowText1: ' customers have been selected, of which ',
        unfollowText2: ' meet the criteria. Are you sure to cancel the follow-up?',
        // 弹出提示
        error_getCompanyInfo: 'Failed to get company information',
        error_getSubordinateInquiry: 'Failed to get subordinate inquiry',
        error_addMarker: 'Failed to mark',
        success_addMarker: 'Marked successfully',
        success_removeMarker: 'Canceled successfully',
        error_getInquiryManagerList: 'Failed to get the sales rep. in charge of this inquiry',
        error_getThrowReasonList: 'Failed to get reason list for transfering to the Public Customers',

        // modal 文本
        modal_tips: 'Prompt',
        modal_return: 'Return',
        modal_remain: 'Stay on this page',
        modal_noInquiry: 'You don\'t have permission to view this company\'s inquiry<br> whether to return to the list page',
        success_editTable: 'Operation successful',
        error_editTable: 'Operation failed',

        /* 公海管理 */

        // 按钮
        claimCustomer: 'Claim Customers',
        highseasRecord: 'Public Customers Record',

        // 弹出提示
        haveNoAuthorityClaim: 'You are not a "sales" role and cannot claim customers',
        error_getInquiryLabel: 'Failed to get current inquiry label',
        error_getSalesList: 'Failed to get sales rep. list',

        /* 联系人 */
        editContact: 'Edit',

        // 弹出提示
        error_getContactInfo: 'Failed to get contact information',

        /* WhatsApp 导入 */
        importWhatsApp: 'Upload info from WhatsApp',
        info_waitImport: 'Please wait for the last upload to complete',
        success_import: 'Successfully uploaded',
        error_import: 'Failes to upload'
    },
    WorkBench: {

        /* 工作台 */

        // 顶部数字

        personalView: 'Personal View',
        managerView: 'Management View',
        todayInquiry: 'Inquiries (Today)',
        weekInquiry: 'Inquiries (This Week)',
        monthInquiry: 'Inquiries (This Month)',
        recent7DaysInquiry: 'Unfollowed Inquiries (Last 7 Days)',

        // 动态组件
        task: 'Tasks',
        funnelView: 'Funnel View',
        behaviorView: 'Behavior View',

        // 弹出提示
        error_getInquiryNumber: 'Failed to get inquiry number',
        errorOccurred: 'An error occurred',
        error_haveNoPermissionMyInquiry: 'You don\'t have access to the "My Inquiries" page, can\'t jump to this page',
        error_haveNoPermissionAllInquiry: 'You don\'t have access to the "All Inquiries" page, can\'t jump to this page',
        error_haveNoPermissionHighSeasCustomer: 'You don\'t have access to the "Public Pool" page, can\'t jump to this page',
        error_haveNoPermissionMyCustomer: 'You don\'t have access to the "Customers" page, can\'t jump to this page',
        error_haveNoPermissionAllCustomer: 'You don\'t have access to the "All Customers" page, can\'t jump to this page',

        /* 任务 */

        participants: 'Participant',
        recentTask: 'Recent Tasks',
        overdueTask: 'Expired Tasks',

        // 日历组件

        selectAll: 'Select all',
        locale: 'en',
        noTask: 'No Task',
        newTask: 'Add Task',
        saleName: 'Sales Rep.',
        allTask: 'All Tasks',
        finishedTask: 'Done',
        unfinishedTask: 'unDone',


        /* 漏斗视图 */

        tip_departmentUser: 'Department staff',
        tip_selectDate: 'Select Date',
        loading: 'Loading',

        // 时间
        today: 'Today',
        yesterday: 'Yesterday',
        recent7days: 'Last 7 days',
        recent14days: 'Last 14 days',
        recent30days: 'Last 30 days',
        thisWeek: 'This Week',
        lastWeek: 'Last Week',
        thisMonth: 'This Month',
        lastMonth: 'Last Month',

        // 漏斗
        inquiryFunnelView: 'Inquiry Distribution Funnel',
        inquiryNumber: 'Inquiry Number',

        // 询盘关闭原因
        closeInquiryReason: 'Reason For Closing Inquiry',
        closedInquiryNumber: 'Number of closed inquiries',


        /* 行为视图 */

        tip_followUpStatus: 'Follow-up Status',
        activated: 'Enabled',
        terminated: 'Not Enabled',

        // 图表
        amount: 'Number',

        // 沟通渠道
        phone: 'Phone',
        Email: 'Email',
        WhatsApp: 'WhatsApp',
        instagram: 'Instagram',
        Facebook: 'Facebook',
        weChat: 'Wechat',
        LinkedIn: 'LinkedIn',
        Twitter: 'Twitter',
        Message: 'Note',
        exhibition: 'Exhibition',
        customerVisiting: 'Customer Visit',
        visitCustomer: 'Visit Customer',
        websiteInteraction: 'Website Interaction',
        Line: 'Line',
        Skype: 'Skype',
        others: 'Others',

        // 表格
        col_seqNumber: 'Inquiry ID',
        col_companyName: 'Company Name',
        col_followUpType: 'Type of Follow-up Record',
        col_followUpContent: 'Content',
        col_followUpCreateUser: 'Creator',
        col_followUpTime: 'Follow-Up Time',

        // 弹出提示
        error_getChartData: 'Failed to get chart data',
        error_getTableData: 'Failed to get form data',
        error_getInquiryManagerList: 'Failed to get the sales rep. in charge of this inquiry',
        error_companyId: 'Company ID error',
        error_inquiryId: 'Inquiry ID error',
        error_getFollowUpStatusList: 'Failed to get Follow-Up Status list'
    },
    Modal: {
        /* 新建公司 */

        // 标题
        title_newCompany: 'Add Company Information',
        title_contact: 'Contact',
        title_inquiry: 'Inquiry Information',
        title_company: 'Company Information',

        // 联系人
        contact_nickName: 'Name',
        contact_jobTitle: 'Position',
        contact_email: 'E-mail',
        uniq: 'Duplicates Checking',
        cancelMerge: 'Change',
        contact_phone: 'Phone',
        contact_jobGrade: 'Occupation Class',
        contact_socialNetworkingPlatform: 'Social Platforms',
        contact_birthday: 'Birthday',
        tip_selectDate: 'Select Date',
        contact_gender: 'Gender',
        male: 'Male',
        female: 'Female',
        contact_picture: 'Contact Picture',
        contact_remark: 'Contact Note',
        contact_whatsApp: 'WhatsApp',
        contact_instagram: 'Instagram',

        // 询盘
        inq_productCategory: 'Product Categories',
        inq_demandProducts: 'Demand',
        inq_inquiryScore: 'Inquiry Score',
        inq_label: 'Label',
        inq_sourceChannel: 'Source Channel',
        inq_sourceWay: 'Source Mode',
        inq_grouping: 'Inquiry Grade',
        inq_followUp: 'Follow-up Status',
        inq_remark: 'Demand Note',
        inq_estimatedInquiryAmount: 'Estimated Inquiry Amount',
        tip_remark: 'The maximum length of this field is 20000 bytes.',
        transactionTime: 'Turnover time',
        transactionMoney: 'Turnover',
        transactionInfo: 'Turnover info',


        // 公司
        corp_companyName: 'Company Name',
        corp_starLevel: 'Star Level',
        corp_shortName: 'Abbreviation',
        corp_countryArea: 'Country / Region',
        corp_mainProduct: 'Main Products',
        corp_scale: 'Scale',
        corp_clientType: 'Customer Type',
        corp_homePage: 'Company Website',
        corp_phone: 'Landline',
        corp_fax: 'Fax',
        corp_contactAddress: 'Contact Address',
        corp_relatedCompany: 'Related Companies',
        corp_companyPicture: 'Photo of Company',
        corp_companyRemark: 'Note',
        corp_mark: 'Mark',
        corp_companySourceWay: 'Customer source',

        // modal 按钮
        modal_ok: 'Confirm',
        modal_cancel: 'Cancel',
        modal_start: '开始',

        // 弹出提示
        error_whatsAppLength: 'WhatsApp fields are too long, with a maximum of 50 characters allowed',
        error_whatsAppFormat: 'WhatsApp format does not meet the requirements, please change and try again',
        error_emptyEmail: 'Email can not be empty',
        error_emailFormat: 'Incorrect mailbox format',
        error_emptyNickName: 'Name can not be empty',
        error_emptyProductCategory: 'Product Classification cannot be empty',
        error_emptyCompanyName: 'Company Name cannot be empty',
        error_noneUserInfo: 'Contact information is coming quickly, please check later',
        error_remarkLength: 'The maximum length of this field is 20000 bytes.',
        error_canNotBeEmpty: 'Can not be empty',
        error_ruleNameRepeated: 'The name of the automated rule cannot be repeated',
        error_existedCompanyNameNeedMerge: 'This company name already exists, please change <br> or click Duplicates Checking button to merge into the existing company',
        error_existedCompanyNameNeedAllowMerge: 'This company name already exists, please change<br> or set to allow duplicates in Common Settings',
        error_existedEmailNeedMerge: 'This email already exists, please change<br> or click Duplicates Checking button to merge into the existing contacts',
        error_existedEmailNeedAllowMerge: 'This mailbox already exists, please change the mailbox information<br> or complete the information in the existing contact',
        error_existedPhoneNeedAllowMerge: 'This phone number already exists in the CRM system, please check and change<br> or set to allow duplicates in Common Settings',
        error_enterpriseColleagueMail: 'This is the mailbox of a corporate colleague and cannot be entered',
        success_newCompany: 'Added successfully',
        error_newCompany: 'Failed to add',
        info_waitUploadDocument: 'Please wait for the complete uploading',
        info_waitUpload: 'Please wait for the previous image to be uploaded.',
        info_uploadLengthLimit5: 'Can only save 5 images',
        info_uploadLengthLimit9: 'Can only save 9 images',
        file_uploadLengthLimit9: 'You can upload up to 9 files',
        error_uploadImage: 'Failed to uploadimage, please refresh and try again！',
        error_formatUploadImage: 'Please upload an image format file!',
        success_uniqMail: 'No duplicate Mailbox',
        success_uniqEmailSuffix: 'No duplicate Mailbox suffix',
        success_uniqPhoneNumber: 'No duplicate Phone Number',
        success_uniqWhatsApp: 'No duplicate WhatsApp',
        success_uniqInstagram: 'No duplicate Instagram',
        success_uniqCompanyName: 'No duplicate Company Name',
        success_uniqSocialPlatforms: 'Not repeating',
        error_noEmailToUniq: 'Please enter E-mail',
        error_noPhoneToUniq: 'Please enter phone number',
        error_noWhatsAppToUniq: 'Please enter WhatsApp',
        error_noInstagramToUniq: 'Please enter Instagram',
        error_mustInput: 'Failed to get whether default field is required to be filled',
        info_companyPictureUploading: 'Company image has not been uploaded yet',
        info_contactPictureUploading: 'Contact image has not been uploaded yet',
        info_inquiryDocumentsUploading: 'Document has not been uploaded yet',
        info_canOnlyUpload: 'Can only upload',
        info_NumberOfPicture: 'images',
        file_canOnlyUpload: 'You can upload up to',
        file_NumberOfPicture: 'files',


        /* 新建询盘 */

        // 标题
        title_newInquiry: 'Add inquiry',

        // 弹出提示
        success_newInquiry: 'Added successfully',
        error_newInquiry: 'Failed to add',
        repetition_newInquiry: 'The clue has been recorded as an inquiry and cannot be repeated',
        beBeing_newInquiry: 'The clue is being recorded as an inquiry by others and cannot be recorded repeatedly',


        /* 新建联系人 */

        // 标题
        title_newContact: 'Add Contact',

        // 弹出提示
        success_newContact: 'Added successfully',
        error_newContact: 'Failed to add',


        /* 编辑公司 */

        // 标题
        title_editCompany: 'Edit Company Information',

        // 弹出提示
        error_existedCompanyName: 'This company name already exists',
        success_editCompany: 'Saved Successfully',
        error_editCompany: 'Failed to save',
        error_countryAreaFormat: 'The format of Country/region field is wrong',


        /* 编辑询盘 */

        // 标题
        title_editInquiry: 'Edit Inquiry Information',

        // 弹出提示
        success_editInquiry: 'Saved Successfully',
        error_editInquiry: 'Failed to save',
        error_editMailUnfinished: 'Please edit the email address first',


        /* 编辑联系人 */

        // 标题
        title_editContact: 'Edit Contact Information',

        // 弹出提示
        success_editContact: 'Saved Successfully',
        error_editContact: 'Failed to save',


        /* 公司名去重 */

        // 标题
        title_uniqCompany: 'Duplicates Checking',
        legend_uniqCompanyTable: 'The current company name already exists',
        legend_uniqCompanyLinkTable: 'The current company name is the same as the company name of the following customers. If you need to create a new contact under an existing customer, please select the customer and click [New Contact under Customer]',

        // modal 按钮
        modal_merge: 'Incorporate',

        // 表格
        tip_noRepeat: 'No duplicate',
        highseasCustomer: 'Public Pool',
        createTime: 'Creation Time',
        managers: 'Sales Rep.',

        // 弹出提示
        error_notAllowMerge: 'Please set to allow duplicates in Common Settings first',
        error_noSelectedCompany: 'Please select the company to be merged first',
        info_companyMergedTip: 'The merged company will adopt the existing company information, and current entered information has no valid value.',
        error_selectedCompany: 'Check the company for errors',


        /* 邮箱去重 */

        // 标题
        title_uniqEmail: 'Inquiries associated with this mailbox',
        title_uniqEmail_fixed: 'Email rechecking',
        legend_uniqEmailTable: 'The current mailbox and the following contact mailbox are repeated',
        legend_uniqEmailLinkTable: 'The current E-mail and the E-mail of the following contact are the same. If you need to associate to an existing contact, please select the contact and click [Associate an existing contact]',

        // 表格
        highseasInquiry: 'Public',

        // 弹出提示
        error_getEmailRelated: 'Failed to get data associated with this mailbox',
        info_emailMergedTip: 'The merged contact will adopt the existing contact information, and current entered information has no valid value.',

        /* 邮箱后缀去重 */
        // 弹出提示
        error_getEmailSuffixRelated: 'Failed to get data associated with this mailbox suffix',

        /* 电话去重 */
        // 标题
        title_uniqPhone: 'Inquiries associated with this phone',
        title_uniqPhone_fixed: 'Inquiries associated with this phone',
        legend_uniqPhoneTable: 'The current phone number is repeated with the following contact person',
        legend_uniqPhoneLinkTable: 'The current phone number and the phone number of the following contact are the same. If you need to associate to an existing contact, please select the contact and click [Associate an existing contact]',
        // 表格
        tip_noRelatedInquiry: 'No associated inquiry',
        // 弹出提示
        error_getPhoneRelated: 'Failed to get data associated with this phone',
        // modal 按钮
        modal_close: 'Close',

        /* WhatsApp 去重 */
        // 标题
        title_uniqWhatsApp: 'Inquiries associated with this WhatsApp',
        title_uniqWhatsApp_fixed: 'Inquiries associated with this WhatsApp',
        legend_uniqWATable: 'The current WhatsApp is repeated with the following contact person',
        legend_uniqWALinkTable: 'The current WhatsApp and the WhatsApp of the following contact are the same. If you need to associate to an existing contact, please select the contact and click [Associate an existing contact]',
        // 弹出提示
        error_getWhatsAppRelated: 'Failed to get data associated with this WhatsApp',

        /* Instagram 去重 */
        // 标题
        title_uniqInstagram: 'Inquiries associated with this Instagram',
        title_uniqInstagram_fixed: 'Inquiries associated with this Instagram',
        legend_uniqInsTable: 'The current Instagram is repeated with the following contact person',
        legend_uniqInsLinkTable: 'The current Instagram and the Instagram of the following contact are the same. If you need to associate to an existing contact, please select the contact and click [Associate an existing contact]',
        // 社交平台 查重
        legend_uniqSocialPlatformTable: 'The current $socialPlatform and the following contact $socialPlatform are duplicates',
        title_uniqSocialPlatform_fixed: '$socialPlatform Duplicate Check',
        // 弹出提示
        error_getInstagramRelated: 'Failed to get data associated with this Instagram',


        /* 邮箱后缀去重 */

        // 标题
        title_uniqEmailSuffix: 'Mailbox suffix check',
        legend_uniqEmailSuffixTable: 'The current mailbox suffix [$field] already exists, please complete the information under existing customers',
        legend_uniqEmailSuffixLinkTable: 'This email suffix [$field] already exists, please select the customer in the email check result and create a new contact',

        /* 公司日志 */

        // 标题
        title_companyLog: 'Company Log',

        // 表格
        attrName: 'Attribute name',
        attrValue: 'Attribute value',
        changedItem: 'Change item',
        beforeChange: 'Before change',
        afterChange: 'After change',
        operate_add: 'Add',
        operate_new: 'Add',
        operate_edit: 'Edit',
        tip_canCopy: 'Click to copy current content',

        // 弹出提示
        error_getCompanyLog: 'Failed to get company log',
        error_logType: 'Failed to get log type',
        info_noDetailInfo: 'No details',
        success_copy: 'Content has been copied to the clipboard',
        error_copy: 'Failed to copy, please copy manually',


        /* 询盘日志 */

        // 标题
        title_inquiryLog: 'Inquiry Log',

        // 表格
        documentName: 'File name',
        operate_delete: 'Delete',
        operate_upload: 'Upload',
        operate_download: 'Download',
        operate_claim: 'Claim',
        operate_claimInquiry: 'Claim an inquiry from the public pool',
        operate_claimCustomer: 'Claim a customer from the public pool',
        operate_distributeCustomer: '分配客户',
        customer_journey: 'Customer journey',
        rebuild: 'rebuild',
        operate_throw: 'Transfer to the Public Customers',
        operate_transfer: 'Transfer',
        operate_share: 'Share',
        operate_merge_inquiry: 'Merge Inquiry',
        operate_merge_company: 'Merge Company',
        module_company: 'Company Information',
        module_contact: 'Contact Information',
        module_inquiry: 'Inquiry Information',
        module_document: 'Inquiry Document',
        module_schedule: 'Schedule',
        module_followUp: 'Follow-up Record',
        mail_followUp: 'Mail Record',
        module_transactionData: 'Transaction data',

        // 弹出提示
        error_getInquiryLog: 'Failed to get inquiry log',

        // 主要联系人
        mainContact: 'Main contact',
        nickName: 'Main contact',
        tip_changeMainContact: 'Contacts only allow one primary contact to be set up. Do you want to confirm the changes?',
        info_mainContactChanging: 'The main contact is being modified, please wait',

        // 主询盘
        mainInquiry: 'Main inquiry',
        tip_changeMainInquiry: 'Are you sure you want to modify the current inquiry as the customer\'s main inquiry?',
        info_mainInquiryChanging: 'The main inquiry is being modified, please wait',

        // 退入公海
        returnPublicReason: 'Reason for returning to public',
        returnPublicDetails: 'Details of returning to public',

        // 旅程重建
        operator_user: 'Operator',
        operationTime: 'Operation time',

        /* 联系人日志 */

        // 标题
        title_contactLog: 'Contact Log',


        /* 导入数据 */

        // 标题
        title_importData: 'Import',

        // 缓冲提示
        spin_importing: 'Importing',

        // 上传文件
        prepareData: 'Prepare data to be imported according to the format of the data template',
        downloadTemplate: 'Download Data Template',
        selectFile: 'Select the file to import',
        addFile: 'Attachment',
        notice: 'Attention',
        fileFormatRequirement: 'Please enter data according to the template and don\'t modify the template file suffix and file format. Currently, only files with Excel2007 and above.xlsx suffixes are supported.',
        hint: 'Prompt',
        importTip: 'The importing process is not visible. Refresh to view importing condition.',
        fileSizeRequirement: 'File you want to import should be less than 1MB',
        detailInfo: 'Details',
        cancelUpload: 'Upload operation has been canceled',

        // modal 按钮
        modal_save: 'Save',

        // 弹出提示
        error_fileOutSize: 'File you want to upload should be less than 1MB',
        error_fileFormat: 'Wrong file format, please upload correct format Excel file',
        error_queryProcess: 'Failed to inquire importing progress(inquire every 5s)',

        /* 转移客户 */

        // 标题
        title_transferCompany: 'Transfer Customer',
        more: 'More',

        // 弹出提示
        success_transferCompany: 'Transferred customer successfully',
        error_existedSaleOfCompany: 'is already the Sales Rep. of the customer, failed to transfer',
        error_transferCompany: 'Failed to transfer customer',
        warning_companyInfoChange: 'The person in charge of this customer has changed, please refresh the page and try again',


        /* 转移询盘 */

        // 标题
        title_transferInquiry: 'Transfer Inquiry',
        transferred: 'transferred',
        to: 'to',
        you: 'you',

        transferTo: 'Transfer to',
        transferClueSync: 'Synchronous transfer leads',
        retainOthers: 'Retain other Sales Rep',

        // 弹出提示
        success_transferInquiry: 'Transferred inquiry successfully',
        error_transferInquiry: 'Failed to transfer inquiry',
        error_transferClueSync: 'Failed to transfer leads synchronously',
        error_noTransferTo: 'Please select sales rep. to transfer to',
        error_existedSaleOfInquiry: 'is already the Sales Rep. of the inquiry, failed to transfer',
        warning_inquiryInfoChange: 'The person in charge of this inquiry has changed, please refresh the page and try again',

        /* 分享客户 */

        // 标题
        title_shareCompany: 'Share Customer',

        // 弹出提示
        success_shareCompany: 'Shared customer successfully',
        error_shareCompany: 'Failed to share customer',

        /* 分享询盘 */

        // 标题
        title_shareInquiry: 'Share Inquiry',

        shareTo: 'Share with',

        // 弹出提示
        success_shareInquiry: 'Shared inquiry successfully',
        error_shareInquiry: 'Failed to share inquiry',
        error_noShareTo: 'Please select sales rep. to share with',

        /* 取消跟进 */
        // 标题
        title_unfollow: 'Unfollow',
        // 弹出提示
        areyYouSureToCancelFollowUpOfselected: 'Are you sure to cancel follow-up of selected',
        customers: 'customers?',
        // 成功取消跟进 x 个客户 的提示信息
        successfullyUnfollow: 'Successfully unfollow',
        customer: 'customers',
        /* 退入公海 */

        // 标题
        title_throw: 'Transfer To Public Customers',

        throwConfirm: 'Are you sure to <span>transfer it to the Public Customers</span>?',
        throwReason: 'Reasons for retreating to the Public Customers',
        details: 'Details',

        // 弹出提示
        success_throw: 'Transferred to the Public Customers successfully',
        error_throw: 'Failed to transfer it to the Public Customers',
        error_noThrowReason: 'Please choose reason to transfer to the Public Customers',


        /* 公海记录 */

        // 标题
        title_highseasRecord: 'Public Customers Record',

        inquiry: 'Inquiry',


        /* 关闭询盘 */

        // 标题
        title_closeInquiry: 'Close Inquiry',
        haveNoInquiryId: 'error inquiry id',
        haveNoFollowUpId: 'error follow-up Status id',

        closeReason: 'Reason for closing',

        // 弹出提示
        error_getCloseInquiryReasonList: 'Failed to get closing reason list',
        success_closeInquiry: 'Closed inquiry successfully',
        error_closeInquiry: 'Failed to close inquiry',


        /* 询盘关闭日志 */

        // 标题
        title_viewCloseLog: 'Inquiry closing record',

        hasNoCloseLog: 'This inquiry has no closing record',

        // 弹出提示
        error_getCloseInquiryLog: 'Failed to get inquiry closing record',


        /* 发送邮件 */

        // 标题
        title_sendMail: 'Select contact',

        // 弹出提示
        success_beforeJumpToMail: 'Saved successfully, will jump to email-composing interface',
        error_beforeJumpToMail: 'Please select mailbox first. If there is no optional email, please try to refresh the page or contact customer service.',
        error_getContactList: 'Failed to get contact list',


        /* 任务 */

        // 标题
        title_newTask: 'Add Task',
        cancleTask: '取消任务',
        title_editTask: 'Edit Task',
        title_showTask: 'Task Details',
        createTaskSync: 'set the reminder time to',
        task_name: 'Name',
        task_endTime: 'Deadline',
        task_createTime: 'Creation time',
        task_remindTime: 'Reminder Time',
        noRemind: 'No reminder',
        onTimeToRemind: 'On Time Reminder',
        fiveMinutesInAdvance: '5 Minutes In Advance',
        fifteenMinutesInAdvance: '15 Minutes In Advance',
        thirtyMinutesInAdvance: '30 Minutes In Advance',
        oneHoursInAdvance: '1 Hour In Advance',
        towHoursInAdvance: '2 Hour In Advance',
        oneDayInAdvance: '1 Day In Advance',
        tip_searchCompanyName: 'Please enter company name',
        task_participants: 'Participant',
        task_relatedInquiry: 'Associated Inquiry',
        task_relatedEmail: 'Associated email',
        remindTips: 'If the email has been replied or the other party has replied, the task will be automatically marked as completed',
        task_repeat: 'Repeated',
        noRepeat: 'non-repeated',
        task_repeatTime: 'Repeat Time',
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        Sunday: 'Sunday',
        Monday: 'Monday',
        Tuesday: 'Tuesday',
        Wednesday: 'Wednesday',
        Thursday: 'Thursday',
        Friday: 'Friday',
        Saturday: 'Saturday',
        tip_ifDaysLessThan31: 'When the number of days in the month is less than 31, automatically takes the last day of the month.',
        task_endCondition: 'Ending Condition',
        neverEnd: 'Never End',
        endDate: 'Ending Date',
        task_detailDesc: 'Details',
        relationObj: 'Associated object',
        emailObject: 'email',
        clueObject: 'inquiry',
        errorOccurred: 'An error occurred',

        // modal 按钮
        modal_taskStatusToFinished: 'Marked As Done',
        modal_taskStatusToUnfinished: 'Mark As Undone',
        modal_delete: 'Delete',

        // modal 文本
        modal_deleteTask: 'Delete Task',
        modal_deleteTaskContent: 'Are you sure to delete this task?',

        // 弹出提示
        error_taskName: 'Please choose correct task name',
        error_taskEndTime: 'Please choose correct deadline',
        error_taskRemindTime: 'Please choose correct reminder time',
        error_emptyTaskParticipants: 'Please select participants',
        error_taskParticipantsError: 'Failed to get participant data',
        error_taskParticipantsWithoutSelf: 'You must add yourself to the task',
        error_taskRelatedInquiry: 'Please select correct associated inquiry',
        error_taskEndDate: 'Please select correct ending date',
        error_taskEndDate_compare_taskEndTime: 'The correct ending date should be before the correct deadline',
        error_taskRepeatTime: 'Please choose correct repeat time',
        error_getTaskParticipants: 'An error occurred while requesting task participant',
        success_changeTaskStatus: 'Changed Task Status successfully',
        error_changeTaskStatus: 'Failed to change Task Status',
        success_newTask: 'Task added successfully',
        error_newTask: 'Failed to add task',
        success_editTask: 'Saved successfully',
        error_editTask: 'Failed to save',
        success_deleteTask: 'Deleted task successfully',
        error_deleteTask: 'Failed to delete task',
        error_companyId: 'Company ID error',
        error_inquiryId: 'Inquiry ID error',
        error_getSubordinateInquiry: 'Failed to get subordinate inquiry',
        error_haveNoPermissionMyContact: 'You don\'t have access to the "My Contacts" page, can\'t jump to this page',
        error_haveNoPermissionAllContact: 'You don\'t have access to the "All Contacts" page, can\'t jump to this page',
        error_haveNoPermissionMyInquiry: 'You don\'t have access to the "My Inquiries" page, can\'t jump to this page',
        error_haveNoPermissionAllInquiry: 'You don\'t have access to the "All Inquiries" page, can\'t jump to this page',
        error_haveNoPermissionMyCustomer: 'You don\'t have access to the "Customers" page, can\'t jump to this page',
        error_haveNoPermissionAllCustomer: 'You don\'t have access to the "All Customers" page, can\'t jump to this page',
        error_haveNoPermissionHighseasCustomer: 'You don\'t have access to the "Public Pool" page, can\'t jump to this page',

        /* 受众优化 */

        title_audienceOptimization: 'Audience optimization',
        grouping: 'Category',
        tip_select: 'Please select…',

        // 弹出提示
        error_unboundedBoth: 'Please bind Facebook or Google account first',
        info_unboundedGoogle: 'You do not bind Google account, can only do Facebook optimization',
        info_unboundedFB: 'You do not bind Facebook account, can only do Google optimization',
        error_unboundedFB: 'You do not bind Facebook account',
        error_getData: 'No data requested under this entry',
        error_requestNoData: 'Failed to get data',
        error_unboundFBAccount: 'Please bind your Facebook personal account before performing other related operations',
        error_selectGrouping: 'Please select at least one audience group',
        error_selectContact: 'Please select at least one contact',
        success_uploadGroupingBoth: 'Uploaded Google and Facebook audience successfully',
        info_uploadGroupingGoogle: 'Uploaded Google audience successfully, and failed to upload Facebook audience',
        info_uploadGroupingFB: 'Uploaded Facebook audience successfully, and failed to upload Google audience',
        error_uploadGrouping: 'Failed to upload audience',
        success_uploadGroupingOnlyGoogle: 'Uploaded Google audience successfully',
        error_uploadGroupingOnlyGoogle: 'Failed to upload Google audience',
        success_uploadGroupingOnlyFB: 'Uploaded Facebook audience successfully',
        error_uploadGroupingOnlyFB: 'Failed to upload Facebook audience',
        error_valueFormatError: 'Please enter a right positive number',
        success_uploadGoogle: 'Return data to Google successfully',
        error_uploadGoogle: 'Failed to return data to Google',
        error_alreadyUploadGoogle: 'The client has been submitted for review or has been sent back to Google in the current follow-up status and cannot be submitted again',
        success_manualBack: 'Inquiry has been submitted to manual return',
        cluesuccess_manualBack: 'Clue has been submitted to manual return',
        /* 添加标签 */

        // 标题
        title_addLabel: 'Add Tag',

        labelType: 'Tag Type',
        custom: 'Customize',
        fold: 'Collapse',
        customLabel: 'Customized Tag',
        add: 'Add',

        // 弹出提示
        error_getInquiryLabel: 'Failed to get current inquiry label',
        error_emptyLabelName: 'Label name is empty. Please enter label name and try again.',
        error_duplicateLabelName: 'This label name already exists, please correct and try again.',
        success_newCustomLabel: 'Added customized tag successfully',
        error_newCustomLabel: 'Failed to add customized tag',
        success_addLabel: 'Added tag successfully',
        error_addLabel: 'Failed to add tag',

        /* 认领客户 */

        // 标题
        title_claimCustomer: 'Claim Customer',
        title_claimCustomer_new: 'Claim Customer',

        confirmClaimCustomer: 'Are you sure to claim this customer?',

        // 弹出提示
        success_claimCustomer: 'Claimed customer successfully',
        error_claimCustomer: 'Failed to claim customer',
        /* 分配客户 */
        title_distributeCustomer: 'Assign customer',
        // 弹出提示
        success_distributeCustomer: '分配客户成功！',
        error_distributeCustomer: '分配客户失败！',


        /* 原日志部分(Log) */

        manager: 'principal',
        manager_beforeChange: 'Sales Rep. (before change)',
        manager_afterChange: 'Sales Rep. (after change)',
        empty_fullname: '[Null]',
        success: 'Success',
        error: 'Error',

        // 跟进记录
        companyName: 'Associated customer',
        createUser: 'Founder',
        followUpTime: 'Follow-Up Time',
        followUpContent: 'Follow-up Content',
        initiatorID: 'Founder ID',
        initiatorName: 'Founder Nickname',
        contactID: 'Contact ID',
        contactName: 'Contact Nickname',
        creationMethod: 'Creation method',
        communicationChannel: 'Follow-Up Mode',
        followUpPictures: 'Attachment',
        followUpAttachment: 'Image',
        imageUploading: 'Image has not been uploaded yet',
        fileUoloading: 'The attachment has not been uploaded yet',
        site: 'Location',


        /* 跳转询盘/客户 */
        error_JumpCustomerHaveNoPermission: 'You currently do not have permission to view this customer',
        error_JumpInquiryHaveNoPermission: 'You currently do not have permission to view this inquiry',
        error_JumpContactHaveNoPermission: 'You currently do not have permission to view this contact',
        error_JumpClueHaveNoPermission: 'You currently do not have permission to view this lead',
        error_JumpCustomerInHighseas: 'This customer is a public customer, can\'t jump',
        error_JumpInquiryInHighseas: 'This inquiry is a public inquiry, can\'t jump',
        error_JumpContactInHighseas: 'This contact is a public contact, can\'t jump',
        error_JumpClueInHighseas: 'This lead is a public lead, can\'t jump',
        error_JumpClueInHighseas1: 'This lead is a public lead, can\'t jump',
        error_JumpCustomerMerged: 'This company has been merged, can\'t jump',
        error_JumpInquiryMerged: 'This inquiry has been merged, can\'t jump',
        error_JumpContactMerged: 'This contact has been merged, can\'t jump',
        error_viewMailWhenCustomerInHighseas: 'This customer is a public customer, can\'t view details',
        error_viewMailWhenInquiryInHighseas: 'This inquiry is a public inquiry, can\'t view details',
        error_viewMailWhenContactInHighseas: 'This contact is a public inquiry, can\'t view details',
        error_viewMailWhenClueInHighseas: 'This lead is a public lead, can\'t view details',
        error_viewMailWhenCustomerMerged: 'This company has been merged, can\'t view details',
        error_viewMailWhenInquiryMerged: 'This inquiry has been merged, can\'t view details',
        error_viewMailWhenContactMerged: 'This contact has been merged, can\'t view details',


        /* 回传 Google */
        inquiryValue: 'Inquiry value',
        tip_inputInquiryValue: 'Please enter the inquiry value',
        title_returnInquiry: 'Return inquiry',
        returnInquiryToGoogleOrNot: 'Whether to return this inquiry to Google?',
        success_audit: 'Inquiry has been submitted for review',
        success_passBack: 'Inquiry has been submitted to manual return',
        again_submit: 'It already exists in manual return',

        /* 合并 客户/询盘/联系人 */
        title_mergeCustomer: 'Merge customer',
        title_mergeInquiry: 'Merge inquiry',
        tip_mergeCustomer: 'Please select retained information after merging, the earliest create time wil be retained in the merged record. After nerging, the inquiry, contacts, and dynamics of the original customer are all superimposed and migrated to the main record.',
        tip_mergeInquiry: 'Please select retained information after merging, the earliest create time wil be retained in the merged record. After nerging, the The dynamics, contacts, tasks, documents, and responsible person information under the original inquiry are superimposed and migrated to the main record.',
        mainRecord: 'Main recording',

        // 提示
        success_merge: 'Successfully merged',
        error_merge: 'Failed to merge',


        /* 添加产品 */
        inquiryProduct: 'Inquiry details',
        addProduct: 'Add product',
        addedProduct: 'Added',
        kind: 'types products',
        totalAmount: 'Total Price',
        selectProduct: 'Please select product',
        tip_inputSearchedProductName: 'Please type product name',
        selectChildProduct: 'Select a subproduct of a configurable product',
        info_inputProductName: 'Please type product name!',


        error_get_all_fields_for_newCreate: 'Failed to get the field, please refresh the page and try again',

        // 线索录询盘手动关联 - 关联已有联系人
        linkExistedContact: 'Associate existing contacts',
        linkConfirm: 'Associate',
        error_selectExistedContacts: 'Please select an existing contact to be linked!',
        success_linkContact: 'Associated to existing contact successfully',
        error_linkContact: 'Failed to existing contact successfully',
        info_enterUniqContact: 'This $field already exists, please complete the information in the existing contacts',
        info_enterUniqContactLink: 'This $field already exists, you can associate to an existing contact at the check result of $field',
        info_enterUniqEmailSuffix: 'The current mailbox suffix [$field] already exists, please complete the information under existing customers',
        info_enterUniqEmailSuffixLink: 'This email suffix [$field] already exists, please select the customer in the email check result and create a new contact',
        info_enterUniqSocialPlatformLink: '$fieldName: $fieldVal already exists, please complete the information in the existing contacts',

        // 线索录询盘手动关联 - 客户下新增联系人
        linkNewContact: 'Create contact',
        error_selectExistedCompany: 'Please select company!',
        linkExistedInquiry: 'Associate to existing inquiry',
        linkTo: 'Associate to',
        error_selectExistedInquiry: 'Please select the inquiry to be associated with the contact!',
        info_enterUniqCompanyName: 'This company name already exists, please complete the information in the existing customer',
        info_enterUniqCompanyNameLink: 'This company name already exists, please select the customer in the customer check result and create a new contact',

        /* 批量操作弹出提示 */
        batchClaimAllowanceTip1: 'The remaining amount of customers you can  claim is ',
        batchClaimAllowanceTip2: 'Are you sure to claim customers in turn?',
        batchClaimAllowanceTip3: 'The final number of claimable customers is determined by your customer limit rule',
        batchDistributeTip1: 'has a remaining customer margin of ',
        batchDistributeTip2: 'are you sure to assign customer to him in turn?',
        batchDistributeTip3: 'The final number of customers that can be allocated is determined by the customer upper limit rule of the account',
        batchDistributeTip4: 'has no limit on the number of customers that can be owned. Are you sure to assign customers to him in turn?',
        batchClaimCount: 'Claim a total of ',
        batchDistributeCount: 'Distribute a total of ',
        item: 'items',
        batchOperateSuccess: ' succeed',
        batchOperateError: 'and fail',
        batchOperateFailReason1: 'The former person in charge cannot claim for 5 days',
        batchOperateFailReason2: 'The maximum number of customers that can be owned has been reached',
        batchOperateFailReason3: 'The customer has been claimed by others',
        saleEmptyWarning: 'The person in charge cannot be empty',
        // 批量编辑相关
        batchEditTitle: 'Batch edit attribute',
        batchEditLabel1: 'Selected customer: ',
        batchEditLabel1_1: 'Selected inquiry: ',
        batchEditLabel2: 'Updated properties: ',
        batchEditLabel3: 'The updated property value is: ',
        downloadFailureRecord: 'Download failure record'
    },
    Html: {
        /* 询盘跟进 */

        // 无权限提示
        tip_haveNoPermission: 'You currently have no permission to view this module',

        // 添加跟进记录
        tip_addFollowUp: 'Write down follow-up record here...',
        followUpTime: 'Follow-Up Time',
        tip_selectDate: 'Select Date',
        communicationChannel: 'Communication Channel',
        contact: 'Contact',
        createTaskSync: 'Create a quick task at the same time, set the reminder time to',
        custom: 'Customize',
        date: 'date',
        oneDayLater: '1 day later',
        twoDaysLater: '2 day later',
        threeDaysLater: '3 day later',
        fourDaysLater: '4 day later',
        fiveDaysLater: '5 day later',
        submit: 'submit',
        loading: 'Please wait',

        // 筛选跟进记录
        cancelFilter: 'Cancel',
        initiator: 'sponsor',

        // 访问型跟进记录
        customerVisited: 'Customer visited',
        visitTime: 'Visit Time',
        createTime: 'Creation Time',
        talk: 'dialogue',
        noTalkToday: 'No conversation Today',
        message: 'Message',
        visitorId: 'Visitor Id',
        messageUrl: 'Message Page',
        noMessageToday: 'No Message Today',
        track: 'Trajectory',
        noTrackToday: 'No Track Today',
        info: 'Information',
        remark: 'Note',
        initialVisitTime: 'First Visit Time',
        leaveTime: 'Leaving Time',
        initialVisitUrl: 'First Visit Url',
        visitSource: 'Access Source',
        haveTalked: 'If Chated',
        visitorChatCount: 'Total Message Number Of Visitor',
        IPPosition: 'Ip Position',
        receptionServer: 'Customer Service',
        title: 'Title',
        browser: 'Browser',
        browserVersion: 'Browser Version',
        screenResolution: 'Screen Resolution',
        noInfoToday: 'No Information Today',

        // 邮件型跟进记录
        sender: 'Sender',
        recipient: 'Recipient',
        subject: 'Theme',
        sendTime: 'Time',
        size: 'Size',
        attachment: 'Attachment',
        viewAttachment: 'View Attachments',
        batchDownload: 'Batch Download',
        download: 'Download',
        preview: 'Preview',

        noInquiryFollowUp: 'No follow-up record',

        // 沟通渠道
        phone: 'Phone',
        Email: 'Email',
        WhatsApp: 'WhatsApp',
        instagram: 'Instagram',
        Facebook: 'Facebook',
        weChat: 'Wechat',
        LinkedIn: 'LinkedIn',
        Twitter: 'Twitter',
        Message: 'Note',
        exhibition: 'Exhibition',
        customerVisiting: 'Customer Visit',
        visitCustomer: 'Visit Customer',
        websiteInteraction: 'Website Interaction',
        Line: 'Line',
        Skype: 'Skype',
        others: 'Others',

        // 时间
        today: 'Today',
        yesterday: 'Yesterday',
        recent7days: 'Last 7 days',
        recent14days: 'Last 14 days',
        recent30days: 'Last 30 days',
        thisWeek: 'This Week',
        lastWeek: 'Last Week',
        thisMonth: 'This Month',
        lastMonth: 'Last Month',

        // 弹出提示
        error_getInquiryManagerList: 'Failed to get the sales rep. in charge of this inquiry',
        error_getManuallyFollowUpList: 'Failed to get manually filled records',
        error_getMailFollowUpList: 'Failed to get mail-type records',
        error_getInquiryContactList: 'Failed to get contact list',
        error_emptyFollowUpContent: 'Please fill in the follow-up content',
        error_emptyDateAndTime: 'Please select date and time',
        error_DateAndTime: 'Follow up time should be less than the current time',
        error_emptyCommunicationChannel: 'Please select communication channel',
        error_emptyContact: 'Please select contact',
        error_followUpTime: 'Wrong time, please select correct time and try again',
        success_saveFollowUp: 'Successfully saved follow-up record',
        error_saveFollowUp: 'Failed to save a record',
        success_createFollowUpTask: 'Added task successfully',
        error_createFollowUpTask: 'Failed to add follow-up task',
        error_getMailDetail: 'Failed to get mail details',
        error_previewFormat: 'Previewing such files is not supported at this time',
        confirm_submitFollowUp: 'Submit onfirmation ?',
        tip_submitFollowUpUploading: 'The image is still being uploaded. Whether to continue to submit follow-up records ?',

        // 快速任务
        followUpTaskName: 'Follow-up task',
        new: 'Add',


        /* 联系人信息 */

        contactInfo: 'Contact Information',

        // 联系人
        contact_nickName: 'Name',
        contact_jobTitle: 'Position',
        contact_email: 'E-mail',
        uniq: 'Duplicates Checking',
        cancelMerge: 'Change',
        contact_phone: 'Phone',
        contact_jobGrade: 'Occupation Class',
        contact_socialNetworkingPlatform: 'Social Platforms',
        contact_birthday: 'Birthday',
        contact_gender: 'Gender',
        male: 'Male',
        female: 'Female',
        contact_picture: 'Contact Picture',
        contact_remark: 'Contact Note',
        contact_whatsApp: 'WhatsApp',
        contact_instagram: 'Instagram',

        operate_edit: 'Edit',

        // 弹出提示
        error_getContactList: 'Failed to get contact list',


        /* 日程计划 */

        newTask: 'Add Task',
        taskEndTime: 'Deadline',
        participants: 'Participant',
        errorOccurred: 'An error occurred',
        taskName: 'Name',
        taskDetails: 'Task Details',

        // modal 文本
        sign: 'Mark',
        cancelSign: 'Unmark',
        modal_signTaskToFinished: 'Are you sure to mark this task as done?',
        modal_signTaskToUnfinished: 'Are you sure to mark this task as undone',
        modal_ok: 'Confirm',
        modal_cancel: 'Cancel',
        delete: 'Delete',
        modal_deleteTaskContent: 'Are you sure to delete this task?',

        // 提示文本
        success_changeTaskStatus: 'Changed Task Status successfully',
        error_changeTaskStatus: 'Failed to change Task Status',
        error_deleteTask: 'Failed to delete task',


        /* 相关文档 */

        tip_inputFileName: 'Please enter file name',
        tip_selectTime: 'Please select time',
        uploadDocument: 'Upload',
        uploader: 'Uploader',
        time: 'Time',
        nothing: 'No Documents',
        earlier: 'Earlier',
        newFolder: 'New folder',
        move: 'Move',
        moveTo: 'Move to',
        rootDirectory: 'Root directory',
        rename: 'Rename',
        selectAll: 'Select All',
        syncToDocument: 'Sync to document',
        syncTo: 'Sync to',
        sync: 'Sync',
        sendTo: 'Send to',
        startEndTime: 'Start and end time',
        documentName: 'Document name',
        sendReceiveType: 'Send / receive type',
        batchSyncToDocument: 'Batch sync to document',
        deleteFolderTip: 'Are you sure to delete the folder and the contained files?',
        selectDirectoryTip: 'Please select a directory to move',

        // modal 按钮
        modal_close: 'Close',

        // 提示文本
        info_uploadLimit: 'Only 10 files can be uploaded at a time. The first 10 files will be uploaded.',
        info_permittedFormatTip: 'Only support to preview Office files, PDF files, TXT files and images',
        error_existedFileName: 'The current file name already exists in system, please change name first.',
        error_saveFile: 'Failed to save file',
        error_deleteFile: 'Failed to delete file',
        error_getFileList: 'Failed to get file list',
        error_noFiles: 'No files!',


        /* 询盘来源 */
        noInquiryOrigin: 'Inquiry created manually in CRM does not have related attribute of the "Inquiry Source"',

        firstVisitorAddress: 'First Visit Url',
        ipAddress: 'IP Address',
        ipLocation: 'Ip Position',
        serviceName: 'Customer service',
        createUser: 'Creator',
        saleName: 'Sales Rep.',
        seqNumber: 'Lead ID',
        firstVisitTime: 'Time to Start Visiting',
        lang: 'Language',

        createWay: 'Created through',
        visitor_history: 'History',
        web_msg: 'Website message',
        direct_create: 'direct-created',
        web_conversation: 'Website conversation',
        fb_leads: 'FB leads',
        fb_msg: 'Facebook message',
        fb_comment: 'Facebook comment',
        ins_dialog: 'Instagram message',
        ins_comment: 'Instagram comment',
        leadsId: 'Lead ID',
        adId: 'Ad ID',
        FBName: 'FB form name',
        leadsCreateTime: 'FB Leads Create Time',

        /* 跟进状态 */

        openInquiry: 'Open Inquiry',
        closeInquiry: 'Close Inquiry',
        error_inoperable: 'Inoperable',

        title_change_followUp: 'Inquiry follow-up status change',
        title_edit_clinchData: 'Complete transaction information',

        change_followUp_from: 'Do you want to change this inquiry\'s follow-up status from',
        change_followUp_to: 'to',

        // 弹出提示
        error_getFollowUpStatusList: 'Failed to get Follow-Up Status list',
        error_waitForChange: 'Please wait for the last follow-up status change to be completed',
        error_openInquiry: 'Failed to open Inquiry',
        success_changeFollowUpStatus: 'Changed follow-up status successfully',
        error_changeFollowUpStatus: 'Failed to change follow-up status',
        error_highseasInqCannotOperate: 'It is a public inquiry, can not be operated',
        error_saveClinchData: 'Failed to save turnover data',
        empty_transactionTime: 'Turnover time can not be empty',
        theClueidacquisitionFailed: 'The network is abnormal, and the Clueid acquisition failed.',

        /* 操作记录 */


        /* 询盘明细 */
        productName: 'Product Name',
        productPrice: 'Product Price',
        productCount: 'Product Number',
        salesUnitPrice: 'Unit Price',
        discount: 'Discount',
        totalPrice: 'Total Price',
        error_getInquiryProduct: 'Failed to request inquiry details',
        error_getExchange: 'Failed to request exchange rate',
        error_currencyUnit: 'Wrong currency unit, cannot request exchange rate',


        /* 顶部筛选 */
        add_child_search: 'Create sub-filter',
        confirm_edit_search_recursively: 'When the upper level filter condition is modified, the sublevel filter condition will be modified too, whether to modify?',
        confirm_delete_search_recursively: 'The sub-filter condition will be deleted after deleting the upper level filter condition， whether to continue?',
        tip_cannot_filter_when_check_all: 'When check "All" ,can only save the filter, can not be filtered',
        error_save_existed_search: 'Customized filter already exists，failed to save.',
        error_sort_search: 'Failed to adjust common Filter order',
        cannot_save_existed: ' already exists, can not save.',
        followUpBoxTip: 'The current follow-up method location is required, please fill in the mobile terminal and select the location',
        followUpBoxTip1Title: 'Keep the content',
        followUpBoxTip1: 'The follow-up method is changed. Do you want to keep the edited follow-up content?',
        followUpBoxTip2: 'Follow-up content should be no less than',
        followUpBoxTip3: 'words',
        followUpBoxTip4: 'Please upload picture',
        followUpBoxTip5: 'Please upload attachment',
        followUpBoxTip1ConfirmButton: 'Keep',
        followUpBoxTip1CancelButton: 'Not keep'
    },
    InqSet: {
        // 标题
        title_inquirySetting: 'Field Management',
        title_company: 'Company Information',
        title_contact: 'Contact',
        title_inquiry: 'Inquiry Information',

        editField: 'Edit Field',
        addField: 'Add Field',
        addCustomField: 'Add Customized Field',
        customField: 'Customized Field',
        draggable: 'Adjust the order of the fields by dragging',

        // 联系人
        contact_nickName: 'Name',
        contact_email: 'E-mail',
        contact_jobTitle: 'Position',
        contact_jobGrade: 'Occupation Class',
        contact_phone: 'Phone',
        contact_socialNetworkingPlatform: 'Social Platforms',
        contact_birthday: 'Birthday',
        tip_selectDate: 'Select Date',
        contact_gender: 'Gender',
        male: 'Male',
        female: 'Female',
        contact_remark: 'Contact Note',
        contact_picture: 'Contact Picture',
        contact_whatsApp: 'WhatsApp',
        contact_instagram: 'Instagram',

        // 询盘
        inq_productCategory: 'Product Categories',
        inq_demandProducts: 'Demand',
        inq_label: 'Label',
        inq_inquiryScore: 'Inquiry Score',
        inq_grouping: 'Inquiry Grade',
        inq_sourceChannel: 'Source Channel',
        inq_sourceWay: 'Source Mode',
        inq_followUp: 'Follow-up Status',
        inq_remark: 'Demand Note',


        // 公司
        corp_companyName: 'Company Name',
        corp_shortName: 'Abbreviation',
        corp_mainProduct: 'Main Products',
        corp_clientType: 'Customer Type',
        corp_starLevel: 'Star Level',
        corp_countryArea: 'Country / Region',
        corp_scale: 'Scale',
        corp_homePage: 'Company Website',
        corp_fax: 'Fax',
        corp_phone: 'Landline',
        corp_contactAddress: 'Contact Address',
        corp_relatedCompany: 'Related Companies',
        corp_companyPicture: 'Photo of Company',
        corp_companyRemark: 'Note',
        corp_formerHead: 'Former Sales Rep.', // 前负责人
        corp_leadLevel: 'lead level',
        corp_autoSeq: 'Customer number',

        // modal 按钮
        modal_ok: 'Confirm',
        modal_cancel: 'Cancel',

        // modal
        mustInput: 'Required',
        fieldType: 'Field Type',
        fieldName: 'Field Name',
        textInput: 'Textbox',
        textArea: 'Textfield',
        longTextArea: 'Long Textfield',
        error_overTypes: 'The number of text fieldS has reached the upper limit and cannot be added.',
        selectSingle: 'Single Selection',
        selectMultiple: 'Single Multiple',
        date: 'date',
        defaultValue: 'Prompt',
        selectItemsContent: 'Content',
        dateType: 'Date Type',
        time: 'Time',
        tip_noTip: 'No Prompt',
        deleteTile: 'Delete confirmation',
        deleteTip: 'Do you want to delete this field? After the field is deleted, the field information cannot be viewed on the CRM interface. You can enable the field at <Deprecated Field>.',
        deleteTip1: '] has been used by the lead template. After the field is deleted, the field information cannot be viewed in the CRM and the lead module. You can enable the field at <Deprecated Field>.<br><br>Do you want to delete this field?',
        deleteTip2: '] has been used by the clue template and the form template',
        deleteTip3: 'After the field is deleted, the information of the field cannot be viewed and synchronized in the CRM, clue, website message and Facebook leads module. The field can be enabled at the < deprecated field >.<br><br>Do you want to delete this field?',
        deleteTip4: 'Because the form needs to contain at least one field, the form template',
        deleteTip5: 'has only one field',
        deleteTip6: 'so this field cannot be deleted. Please modify the form template before deleting.',

        // 弹出提示
        info_waitForChange: 'Please wait for last switch to complete',
        success_changeMustInput: 'Changed required status successfully',
        error_changeMustInput: 'Failed to change required status',
        error_canNotChangeMustInput: 'Changing the required status is not supported',
        error_params: 'Parameter error',
        success_deleteField: 'Deleted field successfully',
        error_deleteField: 'Failed to delete field',
        success_restoreField: 'Restored field successfully',
        error_restoreField: 'Failed to restore field',
        error_fieldCountLimit: 'The maximum number of customized fields (including deleted fields) for a single module is 50',
        success_addField: 'Added field successfully',
        error_addField: 'Failed to add field',
        success_editField: 'Edited field successfully',
        error_editField: 'Failed to edit field',
        error_fieldName: 'Field name is required',
        currency_symbol: '$',
        changeRequiredTip: 'Tip: To ensure that you have available contact information, please check at least one of email, phone, instagram, WhatsApp, and social platforms as required',
        changeRequired: 'Please check at least one of email, phone, instagram, WhatsApp, and social platforms as required'

    },
    UniSet: {
        /* 通用设置 */

        universalSetting: 'Common Settings',
        clientType: 'Customer Type',
        scale: 'Scale',
        socialPlatform: 'Social Platforms',
        productCategory: 'Product Categories',
        grouping: 'Inquiry Grade',
        sourceChannel: 'Source Channel',
        sourceWay: 'Source Mode',
        followUp: 'Follow-up Status',
        setting_label: 'Label',
        throwReason: 'Reasons for transfering to the Public Customers',
        repeatRule: 'Repeating rules',
        closeReason: 'Reason For Closing Inquiry',
        visitorType: 'Visitor Category Settings',
        autoCreateInquiry: '自动创建询盘规则',
        error_getOptionList: 'Failed to get option list',
        tip_unSortOption: 'The replaced option is either fixed or deactivated and does not participate in sorting!',
        error_sortOption: 'Failed to adjust field order',
        cannot_edit: 'Cannot be edited and deleted',


        /* 客户类型 */

        // 操作
        new: 'Add',
        edit: 'Edit',
        delete: 'Delete',
        setDefaultValue: 'Set default',
        setsuccStage: 'Set turnover stage',
        choosesuccStage: 'Select turnover stage',
        tip_editClientType: '* If the public pool rules are not activated or not used, please ignore this prompt;<br>* If the current option is used in the rules, customers who meet the latest option content after the option is edited will automatically return to the public pool according to the rules',
        // modal 按钮
        modal_ok: 'Confirm',
        modal_cancel: 'Cancel',

        // 弹出提示
        error_getClientTypeList: 'Failed to get customer types list',
        tryLater: '<br>Please try again later',
        success_add: 'Added successfully',
        error_add: 'Failed to add',
        success_edit: 'Saved successfully',
        error_edit: 'Failed to save',
        success_delete: 'Deleted successfully',
        error_delete: 'Failed to delete',
        error_contentRepeat: 'Content cannot be repeated',
        success_set_closingStage: 'Set [Closing stage] successfully',
        error_set_closingStage: 'Failed to set [Closing stage]',
        success_set_defaultValue: 'Set default successfully',
        error_set_defaultValue: 'Failed to set default',
        success_set_emptyDefaultValue: 'No option selected, there is  no default value for this field!',

        /* 规模 */

        title_scale: 'Scale',

        // 弹出提示
        error_getScaleList: 'Failed to get customer types list',


        /* 社交平台 */

        // 弹出提示
        error_getSocialNetworkingPlatformList: 'Failed to get social platform list',


        /* 产品分类 */

        // 弹出提示
        error_getProductCategoryList: 'Failed to get product category list',
        error_deleteDefaultValue: 'This option has been set as the default value and does not support disabling',
        error_setDisabledOptionDefaultValue: 'This option is disabled and cannot be set to the default',


        /* 分组 */

        // 弹出提示
        error_getGroupingList: 'Failed to get Inquiry Grade list',


        /* 来源渠道 */

        // 弹出提示
        error_getSourceChannelList: 'Failed to get source channel list',


        /* 来源方式 */

        // 弹出提示
        error_getSourceWayList: 'Failed to get Source Mode list',


        /* 跟进状态 */

        // 默认跟进状态
        defaultFollowUpStatus_inquiry: 'Inquiry',
        defaultFollowUpStatus_closeInquiry: 'Close Inquiry',
        defaultFollowUpStatus_empty: 'Empty',
        defaultFollowUpStatus_clue: 'Clue',
        defaultFollowUpStatus_highValue: 'High value traffic',

        UnChangeable: 'Cannot be changed',
        terminated: 'Not Enabled',
        notice: 'Attention',
        tip_editFollowUpStatus: 'Modifying this option will update historical data synchronously, please be cautious',

        // 弹出提示
        success_editStatus: 'Saved successfully',
        error_editStatus: 'Failed to save',
        error_getFollowUpStatusList: 'Failed to get Follow-Up Status list',
        info_deleteBeforeUnbind: 'This follow-up status is already associated with a Google conversion. Please unlink first.',


        /* 标签 */

        // 弹出提示
        error_getLabelList: 'Failed to get tag list',
        error_emptyLabelName: 'Label name is empty. Please enter label name and try again.',
        error_duplicateLabelName: 'This label name already exists, please correct and try again.',


        /* 扔入公海原因 */

        // 弹出提示
        error_getThrowReasonList: 'Failed to get reason list for transfering to the Public Customers',

        /* 重复规则 */

        // table
        allowed: 'allow',
        notAllowed: 'Not allow',
        uniq: 'Check Duplicates',
        notUniq: 'Not Check Duplicates',
        uniqFuzzy: 'Fuzzy Check',
        uniqPrecise: 'Precise check',
        email: 'E-mail',
        phone: 'Phone',
        weChat: 'Wechat',
        companyName: 'Company Name',
        mergeOperate: 'Whether to allow repeated entry',
        requestError: 'Request error',
        emailSuffix: 'Mailbox suffix',
        excludeEmailSuffix: 'Exclude suffix',

        // 排除邮箱后缀弹框
        title_excludeEmailSuffix: 'Exclude the following mailbox suffixes',
        systemAutoExclude: 'The system automatically excludes',
        manualExclude: 'Manually exclude',
        info_repeatEmailSuffix: 'The mailbox suffix already exists, adding failed',
        info_illegalEmailSuffix: 'Email suffix format is wrong, adding failed',

        // 弹出提示
        success_editRepeatRule: 'Modified successfully',
        error_editRepeatRule: 'Failed to modify',
        success_editUniqRule: 'Duplicate checking rule modified successfully',
        error_editUniqRule: 'Failed to modify',

        /* 询盘关闭原因 */

        // 弹出提示
        error_getCloseInquiryReasonList: 'Failed to get closing reason list',

        /* 自动创建询盘规则 */
        title_autoCreateInquiry: '网站订单自动创建询盘规则',
        remark_autoCreateInquiry: '由网站订单创建的询盘负责人默认为公海，自动进入公海管理',
        defaultManager: '默认负责人',
        error_emptyDefaultManager: '默认负责人不能为空',
        error_getAutoCreateInquirySetting: '请求网站订单自动创建询盘规则失败, 请刷新重试',
        // 跟进方式
        addFollowUpMode: 'Add follow-Up Mode',
        followUpMode: 'Follow-Up Mode',
        contentTemplate: 'Content template',
        locationPunch: 'Location punch',
        required: 'Required',
        pleaseEnter: 'Please enter',
        keyWords: 'Key words',
        followUpModeFormLable1: 'content not less than',
        followUpModeFormLable2: 'words',
        followUpModeFormLable3: 'Customer contact address within',
        followUpModeFormLable4: 'meters',
        followUpModeFormLable5: 'image',
        followUpModeFormLable6: 'Attachment',
        followUpModeFormLable1Tip: 'Please enter the range of follow-up content not less than the number of words: 1-2000',
        followUpModeFormLable3Tip: 'Please enter the location punching range: 50-1000'
    },
    newDetail: {
        col_clientId: 'Customer ID',
        col_shortName: 'Abbreviation',
        col_clientType: 'Customer Type',
        col_countryArea: 'Country / Region',
        col_companyManagers: 'Sales Rep.',
        col_homePage: 'Company Website',
        col_contactAddress: 'Contact Address',
        col_companyName: 'Company Name',
        col_productCategory: 'Product Categories',
        col_inquiryManagers: 'Sales Rep.',
        col_grouping: 'Inquiry Grade',
        col_inquiryScore: 'Inquiry Score',
        col_nickName: 'Name',
        col_email: 'E-mail',
        col_phone: 'Phone',
        col_contactManagers: 'Sales Rep.',
        col_socialNetworkingPlatform: 'Social Platforms',
        module_inOutGoingMail: '往来邮件',
        module_callRecords: 'Call records',
        module_FollowUp: 'Dynamics',
        module_DetailInfo: 'Details',
        module_ContactList: 'Contact',
        module_InquiryList: 'Inquiry',
        module_Documents: 'Document',
        module_Task: 'Task',
        module_CommunicationAccessories: 'Communication appendix',
        module_mail: 'E-mail',
        module_WhatsApp: 'WhatsApp',
        module_InquiryProduct: 'Inquiry Details',
        tip_FollowUp: 'Follow-up content',

        error_getSubordinateInquiry: 'Failed to get subordinate inquiry',
        error_getSubordinateContact: 'Failed to get subordinate contact',
        error_getCompanyBriefInfo: 'Get a error to request customer brief message',
        error_getInquiryBriefInfo: 'Get a error to request inquiry brief message',
        error_getContactBriefInfo: 'Get a error to request contact brief message',
        error_urlRequest: 'Page error, unable to determine what details are currently requested',
        error_paramsRequest: 'Page error, unable to determine what details are currently requested',
        error_noMenuAuthority: 'You do not have view rights for this module',
        error_noContactsMenuAuthority: 'You do not have permission to view the contact management page, please contact your administrator to activate!',
        error_noHighseasCustomerMenuAuthority: 'You do not have permission to view the Public Pool page, please contact your administrator to activate!',

        title_editCustomer: 'Edit',
        title_signCustomer: 'Key Mark customer',
        title_signInquiry: 'Key Mark inquiry',
        mainInquiry: 'Main inquiry',
        addContact: 'Add Contact',
        addLabels: 'Add labels',
        inquiryLog: 'Inquiry Log',
        noResult: 'No result',
        title_scanQRCode: 'Scan the QR code to add the contact to the address book',
        openMore: 'Expand details',
        customerJourney: 'Customer journey',
        tip_timeLineSearch: 'Search email',
        advanceFilter: 'filtering',
        documentUploadTime: 'Document upload date',
        documentTitle: 'File name',
        tip_documentTitle: 'Please enter the file name',
        title_viewInquiry: 'Click to enter the details page',
        viewMore: 'View details>',
        inquiryDetailInfo: ' Inquiry details',
        markAsUncompleted: 'Mark incomplete',
        haveNoAuthorityClaim: 'You are not a "sales" role and cannot claim customers',
        sureRebuildJourney: 'Are you sure to rebuild the journey',
        journeyRebuildTip: 'Confirmation journey rebuild will:',
        journeyRebuildTipContent: 'Synchronize email information to the journey based on the current person in charge and customer contact emails (historical person in charge and contact emails will not be synchronized)',
        journeyRebuildingTip: 'Please wait a few minutes while rebuilding the customer journey.',
        JourneyRebuildComplete: 'Journey rebuild complete',
        JourneyRebuild: 'Journey rebuild',
        rebuilding: 'rebuilding...'
    },
    fieldLimit: {
        // 全局
        error_overLength: 'The length exceeds the limit, failed to request',

        // 询盘设置
        cname: 'Field Name',
        option: 'Content',
        colDefaultValue: 'Prompt',

        companyName: 'Company Name',
        shortName: 'Abbreviation',
        scale: 'Scale',
        mainProduct: 'Main Products',
        clientType: 'Customer Type',
        countryArea: 'Country / Region',
        homePage: 'Company Website',
        corpPhone: 'Landline',
        fax: 'Fax',
        contactAddress: 'Contact Address',
        relatedCompany: 'Related Companies',
        companyPicture: 'Photo of Company',
        companyRemark: 'Company Note',

        nickName: 'Name',
        jobTitle: 'Position',
        email: 'E-mail',
        phone: 'Phone',
        whatsApp: 'WhatsApp',
        instagram: 'Instagram',
        jobGrade: 'Occupation Class',
        socialNetworkingPlatform: 'Social Platforms',
        birthday: 'Birthday',
        gender: 'Gender',
        picture: 'Contact Picture',
        contactRemark: 'Contact Note',

        productCategory: 'Product Categories',
        demandProducts: 'Demand',
        grouping: 'Inquiry Grade',
        sourceChannel: 'Source Channel',
        sourceWay: 'Source Mode',
        label: 'Label',
        inquiryScore: 'Inquiry Score',
        followUp: 'Follow-up Status',
        transactionMoney: 'Turnover',
        transactionInfo: 'Turnover info',
        remark: 'Demand Note'
    },
    aliImport: {
        dataImportPlugin: 'Data Import Plugin',
        downloadPlugin: 'Plug-in installation and use',
        downloadPluginGuide: '1. Enter the <strong>Chrome</strong> web application store to search for "<strong>LeadsCloud</strong>", find and install the latest version of the <strong>Chrome</strong> browser plug-in "<a href="https://chrome.google.com/webstore/search/%E8%AF%A2%E7%9B%98%E4%BA%91?hl=en-US" target="_blank" class="piwik_download_ali_plugin">[LeadsCloud Smart Assistant]</a>" , Make sure the plugin is <strong>[enabled]</strong>.<br/>' +
            `<img src="${process.env.BASE_URL}image/aliImportCRX.png"/><br/>` +
            '2. After opening the <strong>customer/inquiry</strong> details page of Alibaba International Station, click the <strong>[Inquiry Cloud Smart Assistant]</strong> browser plug-in icon to expand the data import pop-up window.<br/>' +
            '3. The inquiry content will be automatically backfilled according to the field matching relationship. Click the <strong>[Import]</strong> button to import the data into the inquiry cloud CRM system.',
        downloadPluginRemark: 'Note: This plugin is only available for Chrome browser',
        fieldMatch: 'Field matching',
        aliInquiryField: 'Alibaba inquiry field',
        leadscloudClueField: 'Leadscloud Lead Template Fields',
        fieldInvalided: 'Matching relationship has expired',
        error_validateRelation: 'Some matching relationships are detected to be invalid, please reset or clear the matching relationships before saving',
        leaveConfirm: 'Confirm To Leave',
        leaveTip: 'Are you sure to leave? The field mapping relationship you edited has not been saved. Do you want to save and then leave?',
        leaveDirectly: 'Leave directly',
        leaveAfterSave: 'Save and leave',

        // 阿里字段多语言
        tradeId: 'Inquiry ID',
        productTitle: 'Product name',
        productImg: 'Product image',
        buyerName: 'Name',
        potentialScore: 'Potential score',
        registerDate: 'Registration time',
        country: 'Registration area',
        companyName: 'Company name',
        companyWebsite: 'Company website',
        email: 'E-mail',
        mobileNumber: 'Cell phone',
        phoneNumber: 'Landline',
        importanceLevel: 'Purchasing intention',
        categorys: 'Purchase category',
        annualProcurement: 'Annual purchase',
        marketingGroups: 'Customer group',
        pageNotes: 'Follow-up record',
        productViewCount: 'Product Views',
        validInquiryCount: 'Number of valid inquiries/responses',
        validRfqCount: 'Effective RFQ number',
        loginDays: 'Landing days',
        spamInquiryMarkedBySupplierCount: 'Number of garbage inquiries',
        addedToBlacklistCount: 'Number of blacklisted',
        preferredIndustries: 'Most frequently purchased industry',
        latestInquiryProducts: 'Recently Inquired Products',
        totalOrderCount: 'Total number of orders',
        totalOrderVolume: 'Total amount of orders',
        tradeSupplierCount: 'Number of trading suppliers',
        // 客户通
        companyInfo1: 'Company Name',
        companyInfo2: 'Country / Region',
        companyInfo3: 'Official Website',
        companyInfo4: 'Fax',
        companyInfo5: 'Business address',
        manageInfo1: 'Customer phase',
        manageInfo2: 'Customer groups',
        manageInfo3: 'Purchase intention',
        manageInfo4: 'Purchased categories',
        manageInfo5: 'Customer source',
        manageInfo6: 'Business type',
        manageInfo7: 'Annual purchase amount',
        manageInfo8: 'Registration Time',
        manageInfo9: 'Time created',
        manageInfo10: 'Notes',
        contactInfo1: 'Name',
        contactInfo2: 'Email',
        contactInfo3: 'Identity',
        contactInfo4: 'Mobile',
        contactInfo5: 'Work Number',
        contactInfo6: 'Social account-Linkedin',
        contactInfo7: 'Social account-Facebook',
        contactInfo8: 'Social account-Skype',
        contactInfo9: 'Social account-WhatsApp',
        contactInfo10: 'Social account-WeChat',
        contactInfo11: 'Position',
        contactInfo12: 'Sex',
        contactInfo13: 'Notes',
        tab_aliCustomer: 'Alibaba customer field matching',
        tab_aliCRX: 'Inquiry field matching',
        tab_aliSales: 'Alibaba salesman matching',
        aliCustomerField: 'Alibaba customer field',
        leadsCloudCrm: 'Leadscloud field',
        aliSales: ' Alibaba International Station salesman',
        leadsCloudSales: 'Leadscloud Staff',
        aliCustomerT1: 'Company information',
        aliCustomerT2: 'Customer information',
        aliCustomerT3: 'Contact person',
        social: 'Social account',
        aliSalesHolder: 'Please enter the salesman name'
    },
    checkRepeat: {
        checkBtn: 'Customer Check',
        owner: 'Owner',
        createDate: 'Create date',
        placeholder: 'Search company name, customer number, email, phone, WhatsApp, Instagram, social platform information',
        searchReultText: 'Search results',
        searchReultText1: 'Display up to 20 pieces of data',
        newCustomer: 'New customers',
        searchReultTip: 'No customers found related to',
        searchReultTip_: '',
        searchReultTip1: 'You can do the following',
        searchReultTip2: 'Change the keyword and recheck',
        searchReultTip3: '可进行以下操作'
    },
    followUpRecord: {
        allFollowUpRecord: 'All follow-up',
        myFollowUpRecord: 'Created by me',
        subordinateFollowUp: 'Created by subordinates',
        followingUp: 'Following up',
        followUpContent: 'Follow-up content',
        associatedCustomers: 'Associated customer',
        createUser: 'Founder',
        followUpStatus: 'Follow-Up Mode',
        updateTime: 'Updated Time',
        followUpTime: 'Follow-Up Time',
        createTime: 'Creation Time',
        followUpObject: 'Follow-up object',
        newFollowUpRecord: 'Add follow-up',
        editFollowUpRecord: 'Edit follow-up',
        select: 'Select',
        selectCompanytitle: 'Select associated customer',
        companyPlaceholder: 'Please enter customer name',
        followupContentPlaceholder: 'Please enter Follow-up content',
        tips_selectCompany: 'Please select associated customer',
        address: 'Location'
    },
    followUpPlan: {
        newFollowUpPlan: 'Create Follow up Plan',
        editFollowUpPlan: 'Edit Follow up Plan',
        deleteFollowUpTip: 'Are you sure to delete the follow-up plan?',
        planInfo: 'Follow up Plan information',
        planName: 'Follow up Plan Name',
        planStartDate: 'Start date',
        planEndDate: 'End date',
        startDate: 'By date',
        executor: 'Executor',
        followUpRoute: 'Follow up Route',
        followUpLog: 'Operation Log',
        progressRate: 'Schedule',
        writeFollowUp: 'Write follow-up',
        planNamePlaceolder: 'Please enter a follow-up plan name',
        startDatePlaceolder: 'Please select a start and end date',
        planContent: 'Plan Description',
        addCustomers: 'Add',
        clearAll: 'Clear All',
        mapPage1: 'Page ',
        mapPage2: '',
        listPlanStatus1: 'To begin',
        listPlanStatus2: 'In progress',
        listPlanStatus3: 'Completed',
        listPlanStatus4: 'Overdue',
        addPlanSuccess: 'Successfully created follow-up plan',
        addPlanError: 'Create follow-up plan failed',
        editPlanSuccess: 'Successfully edited follow-up plan',
        editPlanError: 'Editing follow-up plan failed',
        operateType1: 'Create Follow up Plan',
        operateType2: 'Edit Follow up Plan',
        operateType3: 'Complete follow-up',
        operateType4: 'Update follow-up plan status Overdue',
        operateType5: 'Update follow-up plan status Completed',
        authorityTip: 'You do not have permission to edit this customer',
        planDetail: 'Plan Description',
        executeUsers: 'Executor',
        followUpStartTime: 'Start date',
        followUpEndTime: 'End date',
        followUpPlanName: 'Plan Name',
        relevanceCompany: 'Associated customer'
    }

};
