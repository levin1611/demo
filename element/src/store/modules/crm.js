import util from '@/libs/util';
import i18n from '@/locale';
import {
    Message
} from 'element-ui';
import { router } from '@/router/index';

const crm = {
    state: {
        // 全部销售人员
        salesList: [],
        // 全部人员
        allUsers: [],
        // 全部下拉列表项
        selectOptions: {},
        // 获取跟进方式
        followUpType: [],
        resetAutoMapping: false, // 重置映射
        customsShow: false,
        taskChangeObj: null,
        // 是否允许重录录入
        allowMerge: '',
        // 公司名称去重方式
        uniqTypeCompanyName: '1',
        showUniq: {},
        socialPlatformIds: [], // 社交平台需要查重的字段选项id集合
        // 控制fb时间轴回复按钮的显示
        fbReplyShow: false,
        fbUnreadStatus: false,
        clearfbUnreadFlag: false,
        clearfromSendButton: false,
        files: [],
        isClear: false,
        clearSelected: false,
        filesSucc: [], // 映射成功的文件
        customerNum: 0,
        inquiryNum: 0,
        contactNum: 0,
        percent: 0, // 映射进度
        fileToMods: {}, // 用户上传文件对应的模块
        fieldsInFiles: [], // 上传文件中的字段
        fieldMappingData: {}, // 文件映射数据
        fieldsSelected: [], // 选中的字段
        /* 资料库控制 */
        parentId: 0, // 控制文件夹以及父级
        /* 资料库弹窗控制 */
        isDeleteFlag: false,
        /* 字段长度限制 */
        corp_field_long_limit: {
            companyName: {
                lang: 'crm.fieldLimit.companyName',
                limit: 300
            },
            shortName: {
                lang: 'crm.fieldLimit.shortName',
                limit: 100
            },
            mainProduct: {
                lang: 'crm.fieldLimit.mainProduct',
                limit: 50
            },
            clientType: {
                lang: 'crm.fieldLimit.clientType',
                limit: 50
            },
            countryArea: {
                lang: 'crm.fieldLimit.countryArea',
                limit: 50
            },
            scale: {
                lang: 'crm.fieldLimit.scale',
                limit: 50
            },
            homePage: {
                lang: 'crm.fieldLimit.homePage',
                limit: 200
            },
            fax: {
                lang: 'crm.fieldLimit.fax',
                limit: 20
            },
            phone: {
                lang: 'crm.fieldLimit.corpPhone',
                limit: 20
            },
            relatedCompany: {
                lang: 'crm.fieldLimit.relatedCompany',
                limit: 100
            },
            // companyPicture: {
            //     lang: 'crm.fieldLimit.companyPicture',
            //     limit: 500
            // },
            contactAddress: {
                lang: 'crm.fieldLimit.contactAddress',
                limit: 300
            },
            companyRemark: {
                lang: 'crm.fieldLimit.companyRemark',
                limit: 100
            }
        },
        contact_field_long_limit: {
            nickName: {
                lang: 'crm.fieldLimit.nickName',
                limit: 300
            },
            jobTitle: {
                lang: 'crm.fieldLimit.jobTitle',
                limit: 100
            },
            birthday: {
                lang: 'crm.fieldLimit.birthday',
                limit: 50
            },
            email: {
                lang: 'crm.fieldLimit.email',
                limit: 256
            },
            phone: {
                lang: 'crm.fieldLimit.phone',
                limit: 100
            },
            whatsApp: {
                lang: 'crm.fieldLimit.whatsApp',
                limit: 50
            },
            instagram: {
                lang: 'crm.fieldLimit.instagram',
                limit: 50
            },
            // gender: {
            //     lang: 'crm.fieldLimit.gender',
            //     limit: 2
            // },
            jobGrade: {
                lang: 'crm.fieldLimit.jobGrade',
                limit: 50
            },
            socialNetworkingPlatform: {
                lang: 'crm.fieldLimit.socialNetworkingPlatform',
                limit: 500
            },
            // picture: {
            //     lang: 'crm.fieldLimit.picture',
            //     // limit: 50
            // },
            remark: {
                lang: 'crm.fieldLimit.contactRemark',
                limit: 500
            }
        },
        inquiry_field_long_limit: {
            productCategory: {
                lang: 'crm.fieldLimit.productCategory',
                limit: 500
            },
            demandProducts: {
                lang: 'crm.fieldLimit.demandProducts',
                limit: 300
            },
            // label: {
            //     lang: 'crm.fieldLimit.label',
            //     limit:
            // },
            // inquiryScore: {
            //     lang: 'crm.fieldLimit.inquiryScore',
            //     limit: 6
            // },
            sourceWay: {
                lang: 'crm.fieldLimit.sourceWay',
                limit: 50
            },
            sourceChannel: {
                lang: 'crm.fieldLimit.sourceChannel',
                limit: 50
            },
            grouping: {
                lang: 'crm.fieldLimit.grouping',
                limit: 50
            },
            followUp: {
                lang: 'crm.fieldLimit.followUp',
                limit: 100
            },
            transactionMoney: {
                lang: 'crm.fieldLimit.transactionMoney',
                limit: 100
            },
            transactionInfo: {
                lang: 'crm.fieldLimit.transactionInfo',
                limit: 100
            },
            remark: {
                lang: 'crm.fieldLimit.remark',
                limit: 500
            }
        },
        fieldLimit: {
            crmCompany: {},
            crmContacts: {},
            crmInquiry: {}
        },
        downloadingInquiryIds: [], // 当前正在打包下载的邮件id集合
        // 新客户详情页
        companyId: null,
        highSeasGroupId: '', // 公海分组筛选id
        show_task_notice_detail: false,
        rebuild_timeline_flag: false,
        email_duplicate_check: true,
        isDashboardjumping: false
    },
    mutations: {
        // 设置公海分组筛选id
        setHighSeasGroupId(state, data) {
            state.highSeasGroupId = data;
        },
        cleanDataMovement(state) {
            state.files = [];
            state.filesSucc = [];
            state.filesFailed = [];
            state.customerNum = 0;
            state.inquiryNum = 0;
            state.contactNum = 0;
            state.fileToMods = {};
            state.fieldsInFiles = [];
            state.fieldMappingData = {};
            state.percent = 0;
            state.fieldsSelected = [];
            state.resetAutoMapping = false;
        },
        setCustomsShow(state, data) {
            state.customsShow = data;
        },
        setfbReplyShow(state, data) {
            state.fbReplyShow = data;
        },
        setTaskChangeObj(state, data) {
            state.taskChangeObj = data;
        },
        setUploadedFiles(state, data) {
            state.files = data;
            // localStorage.setItem('files', JSON.stringify(data));
        },
        setAllowMerge(state, data) {
            state.allowMerge = data;
        },
        setUniqTypeCompanyName(state, data) {
            state.uniqTypeCompanyName = data;
        },
        setShowUniq(state, data) {
            state.showUniq = Object.assign(state.showUniq, data);
        },
        setSocialPlatformIds(state, data) {
            state.socialPlatformIds = data;
        },
        setDownloadingInquiryIds(state, data) {
            if (data >= 0) {
                state.downloadingInquiryIds.push(data);
            } else {
                state.downloadingInquiryIds = state.downloadingInquiryIds.filter(item => item !== (0 - data));
            }
        },
        updateFieldMappingData(state, data) {
            let fileName = Object.keys(data)[0];
            if (state.fieldMappingData.hasOwnProperty(fileName)) {
                state.fieldMappingData[fileName] = Object.assign(state.fieldMappingData[fileName], data[fileName]);
            } else {
                state.fieldMappingData = Object.assign(state.fieldMappingData, data);
            }
        },
        setFieldMappingData(state, data) {
            state.fieldMappingData = Object.assign({}, data);
        },
        setParentId(state, data) {
            state.parentId = data;
        },
        setFieldLimit(state, data) {
            state.fieldLimit = Object.assign(state.fieldLimit, data);
        },
        setPercent(state, data) {
            state.percent = data;
        },
        setFilesSucc(state, data) {
            state.filesSucc = data;
        },
        setSalesList(state, data) {
            state.salesList = data;
        },
        setAllUsers(state, data) {
            state.allUsers = data;
        },
        setFollowUpType(state, data) {
            state.followUpType = data;
        },
        setSelectOptions(state, data) {
            state.selectOptions = data;
        },
        setShowTaskNoticeDetail(state, data) {
            // state.show_task_notice_detail = !this.state.show_task_notice_detail;
        },
        setRebuildTimelineNotice(state, data) {
            state.rebuild_timeline_flag = data;
        },
        set_email_duplicate_check(state, data) {
            state.email_duplicate_check = data;
        },
        setDashboardjumping(state, data) {
            state.isDashboardjumping = data;
        }
    },
    actions: {
        /**
         * @Description: 点击预提醒通知时需要先请求接口判断该询盘当前的状态是否是公海，是跳转到公海管理，否跳转到询盘管理
         * @author mayuanzhi
         * @date 2020/6/11
         */
        judgmentInquiry({ state }, id) {
            return new Promise((resolve, reject) => {
                util.ajax({
                    url: '/crm/inquiry/get',
                    method: 'get',
                    params: {
                        id: id
                    }
                }).then(response => {
                    resolve(response.data);
                }).catch(err => {
                    reject();
                });
            });
        },
        async handleJumpToTestDetail({ rootState, state }, val) {
            // 方案一：跳转工作台
            // const href = window.location.origin + window.location.pathname + router.resolve({
            //     name: 'home_index'
            // }).href;
            // window.open(href, '_blank');
            // 邮件跳转
            if (val.textObj.relatObjType === 2) {
                const mailId = JSON.parse(val.textObj.relatObjDescription).mailId;
                const createUserId = JSON.parse(val.textObj.relatObjDescription).mailCreateUserId;
                /* 跳转前要进行功能权限以及邮件是否被彻底删除的校验 */
                util.ajaxMailJson({
                    url: '/mail/mailDetail',
                    method: 'GET',
                    params: {
                        userId: rootState.userId,
                        orgId: rootState.enterpriseId,
                        id: mailId,
                        createUserId: createUserId || rootState.userId
                    },
                    timeout: 60000
                }).then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data.mailDraftFlag) {
                            const obj = {};
                            obj.mailEdit = true;
                            obj.mailId = mailId;
                            obj.selectedMailBoxType = 'draftBox';
                            localStorage.setItem('leadsCloud-writeMailData', JSON.stringify(obj));
                            const forwardMailDetail = Object.assign(res.data.data, { id: mailId, from: 'globalSearch' });
                            localStorage.setItem('leadsCloud-currentPersonId', res.data.data.createUserId);
                            const href = window.location.origin + window.location.pathname + router.resolve({
                                name: 'mail_home'
                            }).href;
                            localStorage.setItem('leadsCloud-timeLine-mailDetail', JSON.stringify(forwardMailDetail));
                            window.open(href, '_blank');
                        } else {
                            if (createUserId && `${createUserId}` !== `${this.state.userId}`) {
                                const currentInputInfo = rootState.mail.departmentPeople.filter(item => item.createUserId === `${createUserId}`);
                                if (currentInputInfo.length) {
                                    const currentAccount = currentInputInfo.map(item => item.emailAddress);
                                    const jumpMailHome = JSON.stringify({ currentInputInfo: currentInputInfo[0].fullname, currentAccount: currentAccount });
                                    localStorage.setItem('leadsCloud-jumpMailHome', jumpMailHome);
                                } else {
                                    Message.error('此邮件负责人没有设置"允许上级查看邮件"权限');
                                    return;
                                }
                            }
                            const forwardMailDetail = Object.assign(res.data.data, { id: mailId, from: 'globalSearch' });
                            localStorage.setItem('leadsCloud-currentPersonId', res.data.data.createUserId);
                            const href = window.location.origin + window.location.pathname + router.resolve({
                                name: 'mail_home'
                            }).href;
                            localStorage.setItem('leadsCloud-timeLine-mailDetail', JSON.stringify(forwardMailDetail));
                            window.open(href, '_blank');
                        }
                    } else {
                        Message.error(i18n.t('globalSearch.mailBeDeleted'));
                    }
                });
            } else if (val.textObj.relatObjType === 1) {
                // 校验是否有该条询盘管理权限
                const companyId = JSON.parse(val.textObj.relatObjDescription).companyId;
                const authorized = await this.getters.isHaveAuthority({
                    type: 'Customer',
                    id: companyId
                });
                if (!authorized) return;
                if (authorized === 'highseas') {
                    Message.warning(i18n.t('crm.Modal.error_JumpInquiryInHighseas'));
                    return;
                }
                // 校验通过, 新标签页打开询盘详情
                // localStorage.setItem('leadsCloud-inquiryId', inquiryId);
                window.open(router.resolve({
                    name: 'companyDetail',
                    query: {
                        companyId: companyId
                    }
                }).href, '_blank');
            } else {}
        }
    },
    getters: {
        getClearSelected: state => {
            return state.clearSelected;
        },
        getIsClear: state => {
            return state.isClear;
        },
        // 字段长度校验
        check_length_default: state => (limit, data) => {
            let limitObj = {};
            switch (limit) {
                case 'corp_field_long_limit':
                    limitObj = state.fieldLimit.crmCompany;
                    break;
                case 'contact_field_long_limit':
                    limitObj = state.fieldLimit.crmContacts;
                    break;
                case 'inquiry_field_long_limit':
                    limitObj = state.fieldLimit.crmInquiry;
                    break;
                default:
                    break;
            }
            return Object.entries(data).some(([key, value]) => {
                if (limitObj && limitObj[key] && limitObj[key].usableLength) {
                    if (state[limit] && state[limit][key] && value && value.length > limitObj[key].usableLength) {
                        Message.error(`【${i18n.t(state[limit][key].lang)}】  ${i18n.t('crm.fieldLimit.error_overLength')}`);
                        return true;
                    }
                }
            });
        },
        check_length_custom: state => (limit, customColumns, data) => {
            let limitObj = {};
            switch (limit) {
                case 'corp_item_custom':
                    limitObj = state.fieldLimit.crmCompany;
                    break;
                case 'contact_item_custom':
                    limitObj = state.fieldLimit.crmContacts;
                    break;
                case 'inquiry_item_custom':
                    limitObj = state.fieldLimit.crmInquiry;
                    break;
                default:
                    break;
            }

            const type_long = ['a1001', 'a1002', 'a1003', 'a1006', 'a1007', 'a10020', 'a10024', 'a10027', 'a10028', 'a10031', 'a10034', 'a10035', 'a10039', 'a10041', 'a10042', 'a10043', 'a10044', 'a10045', 'a10046', 'a10047', 'a10048', 'a10049', 'a10050'];
            return customColumns.some(item => {
                if (limitObj && limitObj[item.storageName] && limitObj[item.storageName].usableLength) {
                    let maxLength;
                    if (limitObj[item.storageName].typeLength) {
                        const obj = JSON.parse(limitObj[item.storageName].typeLength);
                        maxLength = item.colType === 'text' ? obj.text : obj.textarea;
                    } else {
                        maxLength = limitObj[item.storageName].usableLength;
                    }
                    if (type_long.includes(item.storageName)) {
                        if (data[item.storageName] && data[item.storageName].length > maxLength) {
                            Message.error(`【${item.cname}】  ${i18n.t('crm.fieldLimit.error_overLength')}`);
                            return true;
                        }
                    } else {
                        if (data[item.storageName] && data[item.storageName].length > maxLength) {
                            Message.error(`【${item.cname}】  ${i18n.t('crm.fieldLimit.error_overLength')}`);
                            return true;
                        }
                    }
                }
            });
        },
        // 给授权字段加上字段长度上限属性
        contact_items: state => contact_columns_authorized => {
            /** 获取字段上限 */
            const fieldLimit = state.fieldLimit.crmContacts;
            const contactlist = ['nickName', 'email', 'jobGrade', 'jobTitle', 'phone', 'whatsApp', 'instagram', 'socialNetworkingPlatform', 'birthday', 'gender', 'remark', 'picture'];
            /* 存放顺序数组 */
            // 存放 colOrder 正常的字段名
            let arr_haveNoColOrder = [];
            // 存放 colOrder 正常的字段名
            let arr_sort = [];
            // 存放 colOrder 1000 或重复的 colOrder
            const arr_renew = [];

            /* 存放字段 */
            let arr_default = [];
            let arr_custom = [];

            /* 处理默认字段 */
            if (Array.isArray(contact_columns_authorized.default)) {
                // 有 colOrder 则放入 arr_sort , 重复则把后者放入 arr_renew , 无则放入 arr_haveNoColOrder
                arr_default = contact_columns_authorized.default.map(item => {
                    if (item.colOrder) {
                        if (arr_sort[item.colOrder]) {
                            arr_renew.push(item.storageName);
                        } else {
                            arr_sort[item.colOrder] = item.storageName;
                        }
                    } else {
                        arr_haveNoColOrder.push(item.storageName);
                    }

                    // 添上类型
                    item.fieldType = 'default';
                    // 加上输入上限
                    item.maxLength = fieldLimit[item.storageName] ? fieldLimit[item.storageName].usableLength : 0;
                    return item;
                });
            }

            /* 延续字段设置的逻辑, 一旦发现有默认字段 colOrder 为空, 则默认字段不参与排序, 全部顺序展示 */
            if (arr_haveNoColOrder.length) {
                arr_sort = [];
                arr_haveNoColOrder = arr_default.map(item => item.storageName);

                // 把授权默认字段按默认字段顺序排列
                arr_haveNoColOrder = contactlist.filter(item => arr_haveNoColOrder.includes(item));
            }

            /* 处理自定义字段 */
            if (Array.isArray(contact_columns_authorized.custom)) {
                arr_custom = contact_columns_authorized.custom.filter(item => item.isShow === 1).map(item => {
                    if (`${item.colOrder}` === '1000' || !item.colOrder) {
                        arr_renew.push(item.storageName);
                    } else {
                        if (arr_sort[item.colOrder]) {
                            arr_renew.push(item.storageName);
                        } else {
                            arr_sort[item.colOrder] = item.storageName;
                        }
                    }

                    item.fieldType = 'custom';
                    // 加上输入上限
                    // 自定义字段优先使用typeLength
                    if (fieldLimit[item.storageName].typeLength) {
                        const obj = JSON.parse(fieldLimit[item.storageName].typeLength);
                        item.maxLength = item.colType === 'text' ? obj.text : obj.textarea;
                    } else {
                        item.maxLength = fieldLimit[item.storageName] ? fieldLimit[item.storageName].usableLength : 0;
                    }
                    return item;
                });
            }

            /* 字段排序 */
            const arr_all = arr_default.concat(arr_custom);
            return arr_haveNoColOrder
                .concat(arr_sort.filter(item => !(!item || item === '')), arr_renew)
                .map(item => arr_all.find(col => item === col.storageName))
                .filter(item => !(!item || item === ''))
                .map(v => {
                    return {
                        ...v,
                        formMap: `contact_${v.storageName}`
                    };
                });
        },
        inquiry_items: state => inquiry_columns_authorized => {
            /** 获取字段上限 */
            const fieldLimit = state.fieldLimit.crmInquiry;
            const inquiryList = ['productCategory', 'demandProducts', 'label', 'inquiryScore', 'grouping', 'sourceChannel', 'sourceWay', 'followUp', 'remark'];
            /* 存放顺序数组 */
            // 存放 colOrder 正常的字段名
            let arr_haveNoColOrder = [];
            // 存放 colOrder 正常的字段名
            let arr_sort = [];
            // 存放 colOrder 1000 或重复的 colOrder
            const arr_renew = [];

            /* 存放字段 */
            let arr_default = [];
            let arr_custom = [];

            /* 处理默认字段 */
            if (Array.isArray(inquiry_columns_authorized.default)) {
                // 有 colOrder 则放入 arr_sort , 重复则把后者放入 arr_renew , 无则放入 arr_haveNoColOrder
                arr_default = inquiry_columns_authorized.default.map(item => {
                    if (item.colOrder) {
                        if (arr_sort[item.colOrder]) {
                            arr_renew.push(item.storageName);
                        } else {
                            arr_sort[item.colOrder] = item.storageName;
                        }
                    } else {
                        arr_haveNoColOrder.push(item.storageName);
                    }

                    // 添上类型
                    item.fieldType = 'default';
                    // 加上输入上限
                    item.maxLength = fieldLimit[item.storageName] ? fieldLimit[item.storageName].usableLength : 0;
                    return item;
                });
            }
            /* 延续字段设置的逻辑, 一旦发现有默认字段 colOrder 为空, 则默认字段不参与排序, 全部顺序展示 */
            if (arr_haveNoColOrder.length) {
                arr_sort = [];
                arr_haveNoColOrder = arr_default.map(item => item.storageName);

                // 把授权默认字段按默认字段顺序排列
                arr_haveNoColOrder = inquiryList.filter(item => arr_haveNoColOrder.includes(item));
            }

            /* 处理自定义字段 */
            if (Array.isArray(inquiry_columns_authorized.custom)) {
                arr_custom = inquiry_columns_authorized.custom
                    .filter(item => item.isShow === 1)
                    .map(item => {
                        if (`${item.colOrder}` === '1000' || !item.colOrder) {
                            arr_renew.push(item.storageName);
                        } else {
                            if (arr_sort[item.colOrder]) {
                                arr_renew.push(item.storageName);
                            } else {
                                arr_sort[item.colOrder] = item.storageName;
                            }
                        }

                        item.fieldType = 'custom';
                        // 加上输入上限
                        // 自定义字段优先使用typeLength
                        if (fieldLimit[item.storageName] && fieldLimit[item.storageName].typeLength) {
                            const obj = JSON.parse(fieldLimit[item.storageName].typeLength);
                            item.maxLength = item.colType === 'text' ? obj.text : obj.textarea;
                        } else {
                            item.maxLength = fieldLimit[item.storageName] ? fieldLimit[item.storageName].usableLength : 0;
                        }
                        return item;
                    });
            }

            /* 字段排序 */
            const arr_all = arr_default.concat(arr_custom);
            return arr_haveNoColOrder
                .concat(
                    arr_sort.filter(item => !(!item || item === '')),
                    arr_renew
                )
                .map(item => arr_all.find(col => item === col.storageName))
                .filter(item => !(!item || item === '')).map(v => {
                    return {
                        ...v,
                        formMap: `inquiry_${v.storageName}`
                    };
                });
        },
        corp_items: state => corp_columns_authorized => {
            /** 获取字段上限 */
            const fieldLimit = state.fieldLimit.crmCompany;
            const customerList = ['companyName', 'shortName', 'mainProduct', 'clientType', 'starLevel', 'companySourceWay', 'countryArea', 'scale', 'homePage', 'fax', 'phone', 'contactAddress', 'relatedCompany', 'companyRemark', 'companyPicture'];
            /* 存放顺序数组 */
            // 存放 colOrder 正常的字段名
            let arr_haveNoColOrder = [];
            // 存放 colOrder 正常的字段名
            let arr_sort = [];
            // 存放 colOrder 1000 或重复的 colOrder
            const arr_renew = [];

            /* 存放字段 */
            let arr_default = [];
            let arr_custom = [];

            /* 处理默认字段 */
            if (Array.isArray(corp_columns_authorized.default)) {
                // 有 colOrder 则放入 arr_sort , 重复则把后者放入 arr_renew , 无则放入 arr_haveNoColOrder
                arr_default = corp_columns_authorized.default.map(item => {
                    if (item.colOrder) {
                        if (arr_sort[item.colOrder]) {
                            arr_renew.push(item.storageName);
                        } else {
                            arr_sort[item.colOrder] = item.storageName;
                        }
                    } else {
                        arr_haveNoColOrder.push(item.storageName);
                    }

                    // 添上类型
                    item.fieldType = 'default';
                    // 加上输入上限
                    item.maxLength = fieldLimit[item.storageName] ? fieldLimit[item.storageName].usableLength : 0;
                    return item;
                });
            }

            /* 延续字段设置的逻辑, 一旦发现有默认字段 colOrder 为空, 则默认字段不参与排序, 全部顺序展示 */
            if (arr_haveNoColOrder.length) {
                arr_sort = [];
                arr_haveNoColOrder = arr_default.map(item => item.storageName);

                // 把授权默认字段按默认字段顺序排列
                arr_haveNoColOrder = customerList.filter(item => arr_haveNoColOrder.includes(item));
            }

            /* 处理自定义字段 */
            if (Array.isArray(corp_columns_authorized.custom)) {
                arr_custom = corp_columns_authorized.custom
                    .filter(item => item.isShow === 1)
                    .map(item => {
                        if (`${item.colOrder}` === '1000' || !item.colOrder) {
                            arr_renew.push(item.storageName);
                        } else {
                            if (arr_sort[item.colOrder]) {
                                arr_renew.push(item.storageName);
                            } else {
                                arr_sort[item.colOrder] = item.storageName;
                            }
                        }

                        item.fieldType = 'custom';
                        // 加上输入上限
                        // 自定义字段优先使用typeLength
                        if (fieldLimit[item.storageName].typeLength) {
                            const obj = JSON.parse(fieldLimit[item.storageName].typeLength);
                            item.maxLength = item.colType === 'text' ? obj.text : obj.textarea;
                        } else {
                            item.maxLength = fieldLimit[item.storageName] ? fieldLimit[item.storageName].usableLength : 0;
                        }
                        return item;
                    });
            }

            /* 字段排序 */
            const arr_all = arr_default.concat(arr_custom);
            return arr_haveNoColOrder
                .concat(
                    arr_sort.filter(item => !(!item || item === '')),
                    arr_renew
                )
                .map(item => arr_all.find(col => item === col.storageName))
                .filter(item => !(!item || item === '')).map(v => {
                    return {
                        ...v,
                        formMap: `company_${v.storageName}`
                    };
                });
        }
    }
};

export default crm;
