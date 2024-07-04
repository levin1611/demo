
import echarts from '@/sdk/echarts';
import store from '@/store';
import staticDatas from '@/utils/staticDatas'; // 公共基除业务代码注册在原型上 静态数据
import dynamicDatas from '@/utils/dynamicDatas'; // 处理动态数据公共方法欢迎 添加 注意解耦
import _lodash from 'lodash';
import resetMessage from '@/libs/resetMessage';
import util from '@/libs/util';
import { ERR_CODE } from '@/api/config';
import { router } from '@/router/index';

import * as qiniu from 'qiniu-js';
import RecipientPoptip from '@/views/mail/mail-home/components/recipientPoptip';
import SenderPoptip from '@/views/mail/mail-home/components/senderPoptip';
import SynchronousPoptip from '@/views/mail/mail-home/components/SynchronousPoptip';
import FilterBox from '@/views/main-components/filter-box';
import TooltipAuto from '@/views/main-components/tooltipAuto';
import stepVtour from '@/steps/base';
import stepVtourModal from '@/steps/baseModal';
import stepsImage from '@/steps/steps-image';
import fileNameIcon from '@/components/file-name-icon';
import countryAreaSelect from '@/components/countryAreaSelect';
import xhlSelect from '@/components/xhl-select';
import dialogModal from '@/views/mail-components/common/dialogModal';
import commonUserSelect from '@/views/main-components/commonUserSelect/commonUserSelect.vue';
import CrmInputArea from '@/views/crm/Detail/Components/Modal/fixed-modal-form/crm-input-area';
import filters from '@/utils/filters';

export default {
    install(Vue) {
        Vue.prototype.ERR_CODE = ERR_CODE;
        Vue.prototype.$echarts = echarts;
        Vue.prototype.$stm = staticDatas;
        Vue.prototype.$dym = dynamicDatas;
        Vue.prototype.$_ = _lodash;
        Vue.prototype.$resetMessage = resetMessage;
        Vue.prototype.$util = util;


        Vue.component('stepVtour', stepVtour);
        Vue.component('stepVtourModal', stepVtourModal);
        Vue.component('stepsImage', stepsImage);
        Vue.component('RecipientPoptip', RecipientPoptip);
        Vue.component('SenderPoptip', SenderPoptip);
        Vue.component('SynchronousPoptip', SynchronousPoptip);
        Vue.component('FilterBox', FilterBox);
        Vue.component('TooltipAuto', TooltipAuto);
        Vue.component('fileNameIcon', fileNameIcon);
        Vue.component('CountryAreaSelect', countryAreaSelect);
        Vue.component('xhlSelect', xhlSelect);
        // 全局弹框提示组件（提醒、二次确认）
        Vue.component('dialogModal', dialogModal);
        Vue.component('commonUserSelect', commonUserSelect);
        Vue.component('CrmInputArea', CrmInputArea);

        /* 全局过滤器 */
        Object.keys(filters).forEach(key => {
            Vue.filter(key, filters[key]);
        });


        // crm 保存日志
        /**
         * @Description: 保存询盘日志改为由后端处理。此处注释保存询盘日志的接口调用
         * @author 杨娣
         * @date 2020/6/11
         */
        Vue.prototype.$saveLog = function(params, type) {
            // 系统通知的一些变量
            let send_notice_obj = {};
            let newManager = [];

            switch (params.operateType) {
                case 1:
                    /* 如果不是合并公司而是新增公司,那么要发一次公司日志 */
                    if ((params.operateModule === 1) && params.companyCurrentObj) {
                        // 初始化发送提醒数据对象
                        send_notice_obj = {
                            orgId: params.enterpriseId,
                            userId: params.userId,
                            fullname: params.fullName,
                            relationObjType: '3', // 1线索，2询盘，3客户，4跟进记录
                            effectActionType: '1', // 1创建，2编辑，3转移，4分享
                            companyId: params.companyId,
                            company: {
                                id: params.companyId
                            }
                        };

                        // 暂存保存日志数据对象
                        const tempNewValue = {};

                        // 保存日志时按按多语言属性名 或 自定义字段的 storageName 保存, 方便查看日志时的多语言化
                        let keyObj = {
                            companyName: 'corp_companyName',
                            starLevel: 'corp_starLevel',
                            shortName: 'corp_shortName',
                            countryArea: 'corp_countryArea',
                            mainProduct: 'corp_mainProduct',
                            scale: 'corp_scale',
                            clientType: 'corp_clientType',
                            homePage: 'corp_homePage',
                            phone: 'corp_phone',
                            fax: 'corp_fax',
                            contactAddress: 'corp_contactAddress',
                            relatedCompany: 'corp_relatedCompany',
                            companyPicture: 'corp_companyPicture',
                            companyRemark: 'corp_companyRemark',
                            mark: 'corp_mark'
                        };
                        if (this.corp_item_custom) {
                            keyObj = Object.assign(keyObj, ...this.corp_item_custom.map(item => {
                                const temp = {};
                                temp[item.storageName] = item.storageName;
                                return temp;
                            }));
                        }

                        // 发送日志和提醒的数据对象存入数据
                        Object.keys(keyObj).forEach(key => {
                            if (params.companyCurrentObj[key] && !(params.companyCurrentObj[key] instanceof Array && params.companyCurrentObj[key].length === 0)) {
                                tempNewValue[keyObj[key]] = params.companyCurrentObj[key];
                                send_notice_obj.company[key] = params.companyCurrentObj[key];
                            }
                        });
                        // 发送公司新增日志
                        // util.ajaxJson({
                        //     url: '/crm/logs/saveInquiryLogs',
                        //     method: 'post',
                        //     data: {
                        //         operateType: 1,
                        //         operateModule: 1,
                        //         newValue: JSON.stringify(tempNewValue),
                        //         companyId: params.companyId,
                        //         targetId: params.companyId,
                        //         enterpriseId: params.enterpriseId,
                        //         operator: store.state.fullName
                        //     }
                        // }).then(response => {});

                        // 发送提醒
                        send_notice(send_notice_obj);
                    }

                    /* 如果新增询盘则加入询盘判断 */
                    if (params.operateModule !== 2) {
                        // 初始化发送提醒数据对象
                        send_notice_obj = {
                            orgId: params.enterpriseId,
                            userId: params.userId,
                            fullname: params.fullName,
                            relationObjType: '2', // 1线索，2询盘，3客户，4跟进记录
                            effectActionType: '1', // 1创建，2编辑，3转移，4分享
                            inquiryId: params.inquiryId,
                            inquiry: {
                                id: params.inquiryId
                            }
                        };

                        // 暂存保存日志数据对象
                        const tempNewValue = {};

                        // 保存日志时按按多语言属性名 或 自定义字段的 storageName 保存, 方便查看日志时的多语言化
                        let keyObj = {
                            productCategory: 'inq_productCategory',
                            demandProducts: 'inq_demandProducts',
                            inquiryScore: 'inq_inquiryScore',
                            sourceChannel: 'inq_sourceChannel',
                            sourceWay: 'inq_sourceWay',
                            grouping: 'inq_grouping',
                            followUp: 'inq_followUp',
                            remark: 'inq_remark',
                            transactionTime: 'transactionTime',
                            transactionMoney: 'transactionMoney',
                            // estimatedInquiryAmount: 'estimated_inquiry_Amount',
                            transactionInfo: 'transactionInfo',
                            mainContact: 'mainContact'
                        };
                        if (this.inquiry_item_custom) {
                            keyObj = Object.assign(keyObj, ...this.inquiry_item_custom.map(item => {
                                const temp = {};
                                temp[item.storageName] = item.storageName;
                                return temp;
                            }));
                        }

                        // 发送日志和提醒的数据对象存入数据
                        Object.keys(keyObj).forEach(key => {
                            if (params.currentObj[key] && !(params.currentObj[key] instanceof Array && params.currentObj[key].length === 0)) {
                                tempNewValue[keyObj[key]] = params.currentObj[key];
                                send_notice_obj.inquiry[key] = params.currentObj[key];
                            }
                        });

                        // 标签单独处理
                        if (params.currentObj.label !== '[]') {
                            tempNewValue.inq_label = params.currentObj.label;
                        }

                        // 发送新增询盘日志
                        // util.ajaxJson({
                        //     url: '/crm/logs/saveInquiryLogs',
                        //     method: 'post',
                        //     data: {
                        //         operateType: 1,
                        //         operateModule: 3,
                        //         newValue: JSON.stringify(tempNewValue),
                        //         inquiryId: params.inquiryId,
                        //         targetId: params.inquiryId,
                        //         enterpriseId: params.enterpriseId,
                        //         operator: store.state.fullName
                        //     }
                        // }).then(response => {});

                        // 发送提醒
                        send_notice(send_notice_obj);
                    }

                    /* 根据联系人是否已存在,进行不同的记录新增联系人日志 */
                    // 初始化发送提醒数据对象
                    const tempNewValue = {};

                    // 保存日志时按按多语言属性名 或 自定义字段的 storageName 保存, 方便查看日志时的多语言化
                    let keyObj = {
                        nickName: 'contact_nickName',
                        jobTitle: 'contact_jobTitle',
                        email: 'contact_email',
                        phone: 'contact_phone',
                        jobGrade: 'contact_jobGrade',
                        birthday: 'contact_birthday',
                        gender: 'contact_gender',
                        picture: 'contact_picture',
                        remark: 'contact_remark'
                    };
                    if (this.contact_item_custom) {
                        keyObj = Object.assign(keyObj, ...this.contact_item_custom.map(item => {
                            const temp = {};
                            temp[item.storageName] = item.storageName;
                            return temp;
                        }));
                    }

                    // 根据联系人是合并的还是新增的发送不同的日志
                    if (params.mergedContactId) {
                        util.ajax({
                            url: '/crm/contacts/get',
                            method: 'get',
                            params: {
                                id: params.mergedContactId
                            }
                        }).then(response => {
                            if (response.data.code === '1') {
                                Object.keys(keyObj).forEach(key => {
                                    if (response.data.data[key] && !(response.data.data[key] instanceof Array && response.data.data[key].length === 0)) {
                                        tempNewValue[keyObj[key]] = response.data.data[key];
                                    }
                                });

                                // 社交网络单独处理
                                if (response.data.data.socialNetworkingPlatform !== '[]') {
                                    tempNewValue.contact_socialNetworkingPlatform = response.data.data.socialNetworkingPlatform;
                                }

                                // util.ajaxJson({
                                //     url: '/crm/logs/saveInquiryLogs',
                                //     method: 'post',
                                //     data: {
                                //         operateType: 1,
                                //         operateModule: 2,
                                //         newValue: JSON.stringify(tempNewValue),
                                //         inquiryId: params.inquiryId,
                                //         targetId: params.mergedContactId,
                                //         enterpriseId: params.enterpriseId,
                                //         operator: store.state.fullName
                                //     }
                                // }).then(response => {});
                            }
                        });
                    } else if (params.contactId) {
                        Object.keys(keyObj).forEach(key => {
                            if (params.contactCurrentObj[key] && !(params.contactCurrentObj[key] instanceof Array && params.contactCurrentObj[key].length === 0)) {
                                tempNewValue[keyObj[key]] = params.contactCurrentObj[key];
                            }
                        });

                        // 社交网络单独处理
                        if (params.contactCurrentObj.socialNetworkingPlatform !== '[]') {
                            tempNewValue.contact_socialNetworkingPlatform = params.contactCurrentObj.socialNetworkingPlatform;
                        }

                        // 发送新增联系人日志
                        // util.ajaxJson({
                        //     url: '/crm/logs/saveInquiryLogs',
                        //     method: 'post',
                        //     data: {
                        //         operateType: 1,
                        //         operateModule: 2,
                        //         newValue: JSON.stringify(tempNewValue),
                        //         contactsId: params.contactId,
                        //         targetId: params.contactId,
                        //         enterpriseId: params.enterpriseId,
                        //         operator: store.state.fullName
                        //     }
                        // }).then(response => {});
                    }
                    break; // 新增
                case 2:
                    // 初始化发送提醒数据对象
                    send_notice_obj = {
                        orgId: params.enterpriseId,
                        userId: params.userId,
                        fullname: params.fullName,
                        effectActionType: '2' // 1创建，2编辑，3转移，4分享
                    };

                    // 存放所有更改的属性
                    const changedObject = {};

                    // 检查改动前后值是否不同, return true 代表不同
                    function checkDuplicate(prev, after) {
                        const isEmpty_prev = [null, '', undefined].findIndex(item => item === prev) !== -1 || (Array.isArray(prev) && prev.length === 0);
                        const isEmpty_after = [null, '', undefined].findIndex(item => item === after) !== -1 || (Array.isArray(after) && after.length === 0);
                        return (!(isEmpty_prev && isEmpty_after)) && prev !== after && JSON.stringify(prev) !== JSON.stringify(after) && JSON.stringify(prev) !== after && prev !== JSON.stringify(after);
                    }

                    // 编辑对象: 公司/询盘/联系人
                    if (type === 'company') {
                        // 提醒相关属性存入
                        send_notice_obj.relationObjType = '3';
                        send_notice_obj.companyId = params.companyId;
                        send_notice_obj.company = {
                            id: params.companyId
                        };

                        // 保存日志时按按多语言属性名 或 自定义字段的 storageName 保存, 方便查看日志时的多语言化
                        let keyObj = {
                            companyName: 'corp_companyName',
                            starLevel: 'corp_starLevel',
                            shortName: 'corp_shortName',
                            countryArea: 'corp_countryArea',
                            mainProduct: 'corp_mainProduct',
                            scale: 'corp_scale',
                            clientType: 'corp_clientType',
                            homePage: 'corp_homePage',
                            phone: 'corp_phone',
                            fax: 'corp_fax',
                            contactAddress: 'corp_contactAddress',
                            relatedCompany: 'corp_relatedCompany',
                            companyPicture: 'corp_companyPicture',
                            companyRemark: 'corp_companyRemark',
                            mark: 'corp_mark'
                        };
                        if (this.corp_item_custom) {
                            keyObj = Object.assign(keyObj, ...this.corp_item_custom.map(item => {
                                const temp = {};
                                temp[item.storageName] = item.storageName;
                                return temp;
                            }));
                        }

                        // 发送日志和提醒的数据对象存入数据
                        Object.keys(keyObj).forEach(key => {
                            if (checkDuplicate(params.prevObj[key], params.currentObj[key])) {
                                changedObject[keyObj[key]] = [params.prevObj[key], params.currentObj[key]];
                                send_notice_obj.company[key] = params.currentObj[key];
                            }
                        });
                        // 注意, 目前是保存日志时只保存已更改数据, 但是提醒要求必须传公司名称, 规模, 客户类型, 无论更改与否
                        ['companyName', 'scale', 'clientType'].forEach(item => {
                            send_notice_obj.company[item] = params.currentObj[item];
                        });
                    } else {
                        // 根据类型 询盘/联系人 匹配不同的 keyObj
                        let keyObj = {};
                        switch (params.operateModule) {
                            case 2:
                                keyObj = {
                                    nickName: 'contact_nickName',
                                    jobTitle: 'contact_jobTitle',
                                    email: 'contact_email',
                                    phone: 'contact_phone',
                                    jobGrade: 'contact_jobGrade',
                                    birthday: 'contact_birthday',
                                    gender: 'contact_gender',
                                    picture: 'contact_picture',
                                    remark: 'contact_remark',
                                    socialNetworkingPlatform: 'contact_socialNetworkingPlatform'
                                };
                                if (this.contact_item_custom) {
                                    keyObj = Object.assign(keyObj, ...this.contact_item_custom.map(item => {
                                        const temp = {};
                                        temp[item.storageName] = item.storageName;
                                        return temp;
                                    }));
                                }
                                break; // 联系人信息
                            case 3:
                                send_notice_obj.relationObjType = '2';
                                send_notice_obj.inquiryId = params.inquiryId;
                                send_notice_obj.inquiry = {
                                    id: params.inquiryId
                                };

                                // 此处直接去掉了 label: '标签',标签变化检测单独拿出来
                                if (type !== 'label') {
                                    keyObj = {
                                        productCategory: 'inq_productCategory',
                                        demandProducts: 'inq_demandProducts',
                                        inquiryScore: 'inq_inquiryScore',
                                        sourceChannel: 'inq_sourceChannel',
                                        sourceWay: 'inq_sourceWay',
                                        grouping: 'inq_grouping',
                                        followUp: 'inq_followUp',
                                        remark: 'inq_remark',
                                        transactionTime: 'transactionTime',
                                        transactionMoney: 'transactionMoney',
                                        transactionInfo: 'transactionInfo',
                                        mainContact: 'mainContact'
                                    };

                                    if (this.inquiry_item_custom) {
                                        keyObj = Object.assign(keyObj, ...this.inquiry_item_custom.map(item => {
                                            const temp = {};
                                            temp[item.storageName] = item.storageName;
                                            return temp;
                                        }));
                                    }
                                }

                                // 询盘标签单独处理,同时,传入 currentObj 和 prevObj 时已去除标签的 id 属性,不会出现相同的标签因为 id 不同而存入 changedObject ,当然,顺序的变化会被记录
                                if (params.currentObj.label || params.prevObj.label) {
                                    if (params.currentObj.label.length === params.prevObj.label.length) {
                                        // 如果两者都是字符串且相等, 不用比较直接退出
                                        if (params.currentObj.label === params.prevObj.label) {
                                            break;
                                        }

                                        // 否则将两者视作数组进行比较
                                        try {
                                            params.currentObj.label = Array.isArray(params.currentObj.label) ? params.currentObj.label : JSON.parse(params.currentObj.label);
                                            params.prevObj.label = Array.isArray(params.prevObj.label) ? params.prevObj.label : JSON.parse(params.prevObj.label);
                                            params.currentObj.label.some((item, index) => {
                                                if (item.attrId !== params.prevObj.label[index].attrId) {
                                                    changedObject.inq_label = [params.prevObj.label, params.currentObj.label];
                                                    // send_notice_obj.inquiry.label 不是筛选条件, 不需要传
                                                    return true;
                                                }
                                            });
                                        } catch (e) {
                                            console.error(e);
                                            console.error('比较标签出错');
                                            console.error(params.currentObj.label, params.prevObj.label);
                                        }
                                    } else {
                                        changedObject.inq_label = [params.prevObj.label, params.currentObj.label];
                                    }
                                }
                                break; // 询盘信息
                        }

                        // 发送日志和提醒的数据对象存入数据
                        Object.keys(keyObj).forEach(key => {
                            if (checkDuplicate(params.prevObj[key === 'followUp' ? 'followUpId' : key], params.currentObj[key === 'followUp' ? 'followUpId' : key])) {
                                changedObject[keyObj[key]] = [params.prevObj[key], params.currentObj[key]];
                                if (send_notice_obj.hasOwnProperty('inquiry')) {
                                    send_notice_obj.inquiry[key] = params.currentObj[key];
                                }
                            }
                        });
                    }

                    // 如果有改动, 则保存日志 + 发送通知
                    if (Object.keys(changedObject).length) {
                        // util.ajaxJson({
                        //     url: '/crm/logs/saveInquiryLogs',
                        //     method: 'post',
                        //     data: Object.assign({
                        //         operateType: 2,
                        //         operateModule: params.operateModule,
                        //         newValue: JSON.stringify(changedObject),
                        //         targetId: params.targetId,
                        //         enterpriseId: params.enterpriseId,
                        //         operator: store.state.fullName
                        //     }, type === 'company'
                        //         ? { companyId: params.companyId }
                        //         : type === 'contact'
                        //             ? { contactsId: params.contactId }
                        //             : { inquiryId: params.inquiryId })
                        // }).then(response => {});

                        // 联系人不发通知
                        if (send_notice_obj.relationObjType) {
                            send_notice(send_notice_obj);
                        }
                    }
                    break; // 编辑
                case 3:
                case 4:
                case 5:
                    // util.ajaxJson({
                    //     url: '/crm/logs/saveInquiryLogs',
                    //     method: 'post',
                    //     data: {
                    //         operateType: params.operateType,
                    //         operateModule: 5,
                    //         inquiryId: params.inquiryId,
                    //         newValue: JSON.stringify(params.currentObj),
                    //         targetId: params.inquiryId,
                    //         enterpriseId: params.enterpriseId,
                    //         operator: store.state.fullName
                    //     }
                    // }).then(response => {});
                    break; // 上传/下载/删除都只涉及到文档,统一处理了
                case 6:
                    // util.ajaxJson({
                    //     url: '/crm/logs/saveInquiryLogs',
                    //     method: 'post',
                    //     data: {
                    //         operateType: 6,
                    //         operateModule: 1,
                    //         companyId: params.companyId,
                    //         targetId: params.targetId,
                    //         enterpriseId: params.enterpriseId,
                    //         operator: store.state.fullName
                    //     }
                    // }).then(response => {});
                    break; // 认领,暂时不弄
                case 7:
                    // util.ajaxJson({
                    //     url: '/crm/logs/saveInquiryLogs',
                    //     method: 'post',
                    //     data: {
                    //         operateType: 7,
                    //         operateModule: 3,
                    //         inquiryId: params.inquiryId,
                    //         targetId: params.targetId,
                    //         enterpriseId: params.enterpriseId,
                    //         operator: store.state.fullName
                    //     }
                    // }).then(response => {});
                    break; // 投入公海,暂时不弄
                case 8:
                    if (!params.inquiryId) {
                        return false;
                    }
                    // 初始化发送提醒数据对象
                    send_notice_obj = {
                        orgId: params.enterpriseId,
                        userId: params.userId,
                        fullname: params.fullName,
                        relationObjType: '4', // 1线索，2询盘，3客户，4跟进记录
                        effectActionType: '1', // 1创建，2编辑，3转移，4分享
                        inquiryId: params.inquiryId,
                        followUp: {
                            followupId: params.followUpId,
                            inquiryId: params.inquiryId,
                            companyName: params.companyName,
                            seqNumber: params.seqNumber
                        }
                    };

                    // 保存日志数据
                    const followUp_newValue = {};

                    // 保存日志时按按多语言属性名 或 自定义字段的 storageName 保存, 方便查看日志时的多语言化
                    const followUpKeys = {
                        followUpTime: 'followUpTime',
                        followUpContent: 'followUpContent',
                        initiatorID: 'initiatorID',
                        initiatorName: 'initiatorName',
                        contactID: 'contactID',
                        contactName: 'contactName',
                        communicationChannel: 'communicationChannel',
                        followUpPictures: 'followUpPictures'
                    };

                    // 发送日志和提醒的数据对象存入数据
                    Object.keys(followUpKeys).map(key => {
                        if (params.currentObj[key] && !(params.currentObj[key] instanceof Array && params.currentObj[key].length === 0)) {
                            followUp_newValue[followUpKeys[key]] = params.currentObj[key];
                            send_notice_obj.followUp[key] = params.currentObj[key];
                        }
                    });

                    // 发送提醒要求的数据格式和日志的数据格式不一样, 替换过来, 并增加一些提醒对象特有的数据
                    send_notice_obj.followUp.createTime = send_notice_obj.followUp.followUpTime;
                    send_notice_obj.followUp.createUser = send_notice_obj.followUp.initiatorID;
                    send_notice_obj.followUp.followupType = send_notice_obj.followUp.communicationChannel;
                    send_notice_obj.followUp.followupContent = send_notice_obj.followUp.followUpContent;
                    send_notice_obj.followUp.seqNumber = params.seqNumber;
                    send_notice_obj.followUp.companyName = params.companyName;

                    // 保存日志
                    // util.ajaxJson({
                    //     url: '/crm/logs/saveInquiryLogs',
                    //     method: 'post',
                    //     data: {
                    //         operateType: 8,
                    //         operateModule: 8,
                    //         inquiryId: params.inquiryId,
                    //         newValue: JSON.stringify(followUp_newValue),
                    //         targetId: params.inquiryId,
                    //         enterpriseId: params.enterpriseId,
                    //         operator: store.state.fullName
                    //     }
                    // }).then(response => {});

                    // 发送通知
                    send_notice(send_notice_obj);
                    break; // 新增跟进记录
                case 9:
                    // 初始化发送提醒数据对象
                    send_notice_obj = {
                        orgId: params.enterpriseId,
                        userId: params.userId,
                        fullname: params.fullName,
                        effectActionType: '3' // 1创建，2编辑，3转移，4分享
                    };
                    switch (params.operateModule) {
                        case 1:
                            send_notice_obj.companyId = params.id;
                            send_notice_obj.company = {
                                id: params.id
                            };
                            // 1线索，2询盘，3客户，4跟进记录
                            send_notice_obj.relationObjType = '3';
                            break; // 客户信息
                        case 3:
                            send_notice_obj.inquiryId = params.id;
                            send_notice_obj.inquiry = {
                                id: params.id
                            };
                            // 1线索，2询盘，3客户，4跟进记录
                            send_notice_obj.relationObjType = '2'; // 询盘信息
                    }

                    // 保存日志数据
                    const transfer_newValue = {};

                    // 保存日志时按按多语言属性名, 方便查看日志时的多语言化
                    const transferKeys = {
                        manager_beforeChange: 'manager_beforeChange',
                        manager_afterChange: 'manager_afterChange',
                        transferClueSync: 'transferClueSync'
                    };

                    // 存入日志数据
                    Object.keys(transferKeys).map(key => {
                        if (params.currentObj[key] && !(params.currentObj[key] instanceof Array && params.currentObj[key].length === 0)) {
                            transfer_newValue[transferKeys[key]] = params.currentObj[key];
                        }
                    });

                    // 取出 newManager
                    try {
                        newManager = Object.keys(params.currentObj.manager_afterChange).filter(item => !params.currentObj.manager_beforeChange.hasOwnProperty(item));
                    } catch (e) {
                        console.log('系统通知报错: 转移询盘');
                        console.log(e);
                    }

                    // 保存日志
                    // util.ajaxJson({
                    //     url: '/crm/logs/saveInquiryLogs',
                    //     method: 'post',
                    //     data: {
                    //         operateType: 9,
                    //         operateModule: 3,
                    //         inquiryId: params.inquiryId,
                    //         newValue: JSON.stringify(transfer_newValue),
                    //         targetId: params.inquiryId,
                    //         enterpriseId: params.enterpriseId,
                    //         operator: store.state.fullName
                    //     }
                    // }).then(response => {});

                    // 发送提醒
                    send_notice(send_notice_obj, newManager);
                    break; // 转移询盘/客户
                case 10:
                    // 初始化发送提醒数据对象
                    send_notice_obj = {
                        orgId: params.enterpriseId,
                        userId: params.userId,
                        fullname: params.fullName,
                        effectActionType: '4' // 1创建，2编辑，3转移，4分享
                    };
                    switch (params.operateModule) {
                        case 1:
                            send_notice_obj.companyId = params.id;
                            send_notice_obj.company = {
                                id: params.id
                            };
                            // 1线索，2询盘，3客户，4跟进记录
                            send_notice_obj.relationObjType = '3';
                            break; // 客户信息
                        case 3:
                            send_notice_obj.inquiryId = params.id;
                            send_notice_obj.inquiry = {
                                id: params.id
                            };
                            // 1线索，2询盘，3客户，4跟进记录
                            send_notice_obj.relationObjType = '2'; // 询盘信息
                    }

                    // 保存日志数据
                    const share_newValue = {};

                    // 保存日志时按按多语言属性名, 方便查看日志时的多语言化
                    const shareKeys = {
                        manager_beforeChange: 'manager_beforeChange',
                        manager_afterChange: 'manager_afterChange'
                    };

                    // 存入日志数据
                    Object.keys(shareKeys).map(key => {
                        if (params.currentObj[key] && !(params.currentObj[key] instanceof Array && params.currentObj[key].length === 0)) {
                            share_newValue[shareKeys[key]] = params.currentObj[key];
                        }
                    });

                    // 取出 newManager
                    try {
                        const tempBefore = Object.assign({}, params.currentObj.manager_beforeChange);
                        const tempAfter = Object.assign({}, params.currentObj.manager_afterChange);
                        Object.keys(tempBefore).forEach(item => {
                            delete tempAfter[item];
                        });
                        newManager = Object.keys(tempAfter);
                    } catch (e) {
                        console.log('系统通知报错: 分享询盘');
                        console.log(e);
                    }

                    // 保存日志
                    // util.ajaxJson({
                    //     url: '/crm/logs/saveInquiryLogs',
                    //     method: 'post',
                    //     data: {
                    //         operateType: 10,
                    //         operateModule: 3,
                    //         inquiryId: params.inquiryId,
                    //         newValue: JSON.stringify(share_newValue),
                    //         targetId: params.inquiryId,
                    //         enterpriseId: params.enterpriseId,
                    //         operator: store.state.fullName
                    //     }
                    // }).then(response => {});

                    // 发送提醒
                    send_notice(send_notice_obj, newManager);
                    break; // 分享询盘/询盘
                case 11:
                    if (!params.inquiryId) {
                        return false;
                    }
                    // 初始化发送提醒数据对象
                    send_notice_obj = {
                        orgId: params.enterpriseId,
                        userId: params.userId,
                        fullname: params.fullName,
                        relationObjType: '4', // 1线索，2询盘，3客户，4跟进记录
                        effectActionType: '2', // 1创建，2编辑，3转移，4分享
                        inquiryId: params.inquiryId
                    };

                    // 存放所有更改的属性
                    const followUp_changedObject = {};

                    // 保存日志时按按多语言属性名 或 自定义字段的 storageName 保存, 方便查看日志时的多语言化
                    const editfollowUpKeys = {
                        followUpTime: 'followUpTime',
                        followUpContent: 'followUpContent',
                        communicationChannel: 'communicationChannel',
                        followUpPictures: 'followUpPictures'
                    };

                    // 发送日志和提醒的数据对象存入数据
                    console.log(params.currentObj);
                    console.log(params.prevObj);
                    Object.keys(editfollowUpKeys).forEach(key => {
                        if (params.currentObj[key] !== params.prevObj[key] && JSON.stringify(params.currentObj[key]) !== JSON.stringify(params.prevObj[key])) {
                            followUp_changedObject[editfollowUpKeys[key]] = [params.prevObj[key], params.currentObj[key]];
                        }
                    });

                    // 如果有改动, 则保存日志
                    if (Object.keys(followUp_changedObject).length) {
                        // 保存日志
                        // util.ajaxJson({
                        //     url: '/crm/logs/saveInquiryLogs',
                        //     method: 'post',
                        //     data: {
                        //         operateType: 11,
                        //         operateModule: 8,
                        //         inquiryId: params.inquiryId,
                        //         newValue: JSON.stringify(followUp_changedObject),
                        //         targetId: params.inquiryId,
                        //         enterpriseId: params.enterpriseId,
                        //         operator: store.state.fullName
                        //     }
                        // }).then(response => {});
                    }
                    break; // 编辑跟进记录
                default:
                    console.error('发送日志信息时出现操作类型错误!');
                    this.$Message.error(this.$t('crm.Table.errorOccurred'));
            }
        };

        // $deepClone 为简单的深拷贝, 参数代表是否拷贝原型链上的数据
        // 另有复杂的深拷贝 见 https://yanhaijing.com/javascript/2018/10/10/clone-deep/
        // 另有极简深拷贝 JSON.parse(JSON.stringify(obj))
        // 下面还有后来发现但没使用的 iview assist.js 的深拷贝方法
        /** @建议使用lodash注册的cloneDeep方法使用见上述 */
        Vue.prototype.$deepClone = function(obj, inherit = true) {
            // 先检测是不是数组和Object
            // let isArr = Object.prototype.toString.call(obj) === '[object Array]';
            const isArr = Array.isArray(obj);
            const isJson = Object.prototype.toString.call(obj) === '[object Object]';
            if (isArr) {
                // 克隆数组
                const newObj = [];
                for (let i = 0; i < obj.length; i++) {
                    newObj[i] = this.$deepClone(obj[i]);
                }
                return newObj;
            } else if (isJson) {
                // 克隆Object
                const newObj = {};
                if (inherit) {
                    for (const i in obj) {
                        newObj[i] = this.$deepClone(obj[i]);
                    }
                } else {
                    Object.keys(obj).forEach(key => {
                        newObj[key] = this.$deepClone(obj[key]);
                    });
                }
                return newObj;
            }
            // 不是引用类型直接返回
            return obj;
        };

        // function deepCopy(data) {
        //     const t = typeOf(data);
        //     let o;

        //     if (t === 'array') {
        //         o = [];
        //     } else if (t === 'object') {
        //         o = {};
        //     } else {
        //         return data;
        //     }

        //     if (t === 'array') {
        //         for (let i = 0; i < data.length; i++) {
        //             o.push(deepCopy(data[i]));
        //         }
        //     } else if (t === 'object') {
        //         for (const i in data) {
        //             o[i] = deepCopy(data[i]);
        //         }
        //     }
        //     return o;
        // }

        Vue.prototype.$qiniuUpload = async function(file, key, putExtra, config, ownToken) {
            function getToken() {
                return new Promise((resolve, reject) => {
                    util.oldAjax({
                        url: '/file-sys/api/uptoken',
                        method: 'post'
                    }).then(response => {
                        resolve(response.data ? response.data.uptoken : false);
                    }).catch(error => {
                        console.log(error);
                        resolve(false);
                    });
                });
            }
            const token = ownToken || await getToken();
            if (!token) {
                this.$Message.warning(this.$t('error_getUploadToken'));
                return undefined;
            }
            // if (file.type === 'text/plain') {
            //     // putExtra['Content-Type'] = 'application/json;UFT-8';
            // }
            return qiniu.upload(file, key, token, putExtra, config);
        };

        // 函数节流
        Vue.prototype.$throttle = function(func, wait = 250, mustRun = 250) {
            let timeout;
            let startTime = new Date();
            return function() {
                const context = this;
                const args = arguments;
                const curTime = new Date();

                clearTimeout(timeout);
                // 如果达到了规定的触发时间间隔，触发 handler
                if (curTime - startTime >= mustRun) {
                    func.apply(context, args);
                    startTime = curTime;
                    // 没达到触发间隔，重新设定定时器
                } else {
                    timeout = setTimeout(() => {
                        func.apply(context, args);
                    }, wait);
                }
            };
        };
        // 函数防抖
        Vue.prototype.$debounce = function(func, wait = 250, executeBefore = false) {
            let timeout;
            let executed = false;

            return function() {
                const context = this;
                const args = arguments;

                // 判断是否要求先触发 func
                if (executeBefore && !executed) {
                    func.apply(context, args);
                    executed = true;
                }

                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (!executeBefore) {
                        func.apply(context, args);
                    }
                    executed = false;
                }, wait);
            };
        };

        // 复制表格单元格内容
        Vue.prototype.$copyTableCellValue = function(e) {
            // 用于复制内容的元素
            const _input = document.createElement('input');
            // 要复制的内容
            let text = '';

            // 从当前元素开始向上遍历祖先树直到查找到绑定此事件的元素(视作根元素)
            let currentNode = e.target;
            while (currentNode) {
                // 已遍历到根元素, 停止继续执行
                if (currentNode === e.currentTarget) {
                    break;
                }

                if (currentNode.tagName === 'TD') {
                    // 遍历到"表格单元格", 取单元格内容并停止执行
                    text = currentNode.innerText;
                    break;
                } else {
                    // 未遍历到"表格单元格", 继续向上查找
                    currentNode = currentNode.parentElement;
                }
            }

            // 有可复制内容
            if (text) {
                // 将待复制内容赋值给 input 元素选中并赋值
                _input.setAttribute('value', text);
                document.body.appendChild(_input);
                _input.select();
                if (document.execCommand('Copy')) {
                    Vue.prototype.$Message.success({
                        message: Vue.prototype.$t('crm.Modal.success_copy'),
                        duration: 1000
                    });
                } else {
                    Vue.prototype.$Message.error({
                        message: Vue.prototype.$t('crm.Modal.error_copy'),
                        duration: 1000
                    });
                }
                document.body.removeChild(_input);
            }
        };

        // 跳转到联系人页面
        Vue.prototype.$viewContact = function(id, target) {
            // 新窗口打开联系人详情页
            localStorage.setItem('leadsCloud-contactId', id);
            window.open(router.resolve({
                name: 'myContact'
            }).href, '_blank');
        };

        // 跳转到客户详情页
        Vue.prototype.$viewCustomer = function(id, target) {
            // localStorage.setItem('leadsCloud-companyId', id);
            // window.open(this.$router.resolve({
            //     name: 'myCustomer'
            // }).href, target || '_blank');
            if (target && target === '_self') {
                window.open(router.resolve({
                    name: 'companyDetail',
                    query: {
                        companyId: id
                    }
                }).href, target || '_blank');
            } else {
                staticDatas.openNewWindow(router.resolve({
                    name: 'companyDetail',
                    query: {
                        companyId: id
                    }
                }).href);
            }
        };

        // 跳转到公海客户详情页
        Vue.prototype.$viewHighSeasCustomer = function(id, target) {
            // localStorage.setItem('leadsCloud-companyId', id);
            // window.open(this.$router.resolve({
            //     name: 'highseasCustomer'
            // }).href, target || '_blank');

            window.open(router.resolve({
                name: 'companyDetail',
                query: {
                    companyId: id
                }
            }).href, target || '_blank');
        };
        Vue.prototype.$composedPath = (e) => {
            // 当前有直接return
            const pathArr = e.path || (e.composedPath && e.composedPath()); // 优先判断 Event.composedPath() 方法是否为空数组
            if ((pathArr || []).length) {
                return pathArr;
            }
            // 不存在则遍历target节点
            let target = e.target;
            e.path = [];
            while (target.parentNode !== null) {
                e.path.push(target);
                target = target.parentNode;
            }
            // 最后在add进去 document 与 window对象
            e.path.push(document, window);
            return e.path;
        };
        // crm 操作提醒
        async function send_notice(obj, newManager) {
            newManager = Array.isArray(newManager) ? newManager : [];
            const temp = {};
            ['inquiry', 'company', 'followUp'].forEach(type => {
                if (obj.hasOwnProperty(type)) {
                    temp[type] = {};
                    Object.keys(obj[type]).forEach(key => {
                        if (Array.isArray(obj[type][key])) {
                            temp[type][key] = JSON.stringify(obj[type][key]);
                        } else {
                            temp[type][key] = obj[type][key];
                        }
                    });
                }
            });
            const res_getNoticeBody = await util.ajaxJson({
                url: '/rule/message/invoking',
                method: 'post',
                data: Object.assign(obj, temp)
            });
            if (Array.isArray(res_getNoticeBody.data.data)) {
                // 后台返回的格式为, 模板字符串 + 要提示的用户,
                // 提示用户(recipientType)分为四大类
                // 0 : 后台直接传指定的用户, 数组
                // 1 : 新增负责人
                // 2 : 询盘/客户负责人
                // 4 : 其他负责人(去掉自己)
                // 除 0 外, 其他三项可多选, 多选就是它们代表的数字相加

                // 如果需要发给负责人 / 其他负责人, 则需要请求负责人
                let allManagers = [];
                // 如果自动化规则中有要用到负责人的, 根据被操作对象类型的不同请求不同的负责人数据
                if (res_getNoticeBody.data.data.some(item => item.recipientType > 1)) {
                    switch (obj.relationObjType) {
                        case '1': // 线索
                            break;
                        case '2': // 询盘
                        case '4': // 跟进记录
                            // 目前只有询盘跟进记录才记日志, 跟进记录也用询盘的负责人来通知
                            const get_inquiryManagers = await util.ajax({
                                url: '/crm/inquiry/getManagerList',
                                method: 'post',
                                data: {
                                    inquiryId: obj.inquiryId
                                }
                            });
                            if (get_inquiryManagers.data.code === '1') {
                                allManagers = Object.keys(get_inquiryManagers.data.data);
                            } else {
                                // this.$Message.error('');
                            }
                            break;
                        case '3': // 客户
                            const get_companyManagers = await util.ajax({
                                url: '/crm/company/getUserIdList',
                                method: 'get',
                                params: {
                                    companyId: obj.companyId
                                }
                            });
                            if (get_companyManagers.data.code === '1') {
                                allManagers = Array.isArray(get_companyManagers.data.data) ? get_companyManagers.data.data : [];
                            } else {
                                // this.$Message.error('');
                            }
                    }
                }
                // 只要执行的自动化规则相关用户选择包含负责人部门主管，单独执行此段代码
                if (res_getNoticeBody.data.data.some(item => item.recipientDeptManager === 1)) {
                    switch (obj.relationObjType) {
                        case '1': // 线索
                            break;
                        case '2': // 询盘
                        case '4': // 跟进记录
                            // 目前只有询盘跟进记录才记日志, 跟进记录也用询盘的负责人来通知
                            if (!allManagers.length) {
                                const get_inquiryManagers = await util.ajax({
                                    url: '/crm/inquiry/getManagerList',
                                    method: 'post',
                                    data: {
                                        inquiryId: obj.inquiryId
                                    }
                                });
                                if (get_inquiryManagers.data.code === '1') {
                                    allManagers = Object.keys(get_inquiryManagers.data.data);
                                } else {
                                    // this.$Message.error('');
                                }
                            }
                            break;
                        case '3': // 客户
                            if (!allManagers.length) {
                                const get_companyManagers = await util.ajax({
                                    url: '/crm/company/getUserIdList',
                                    method: 'get',
                                    params: {
                                        companyId: obj.companyId
                                    }
                                });
                                if (get_companyManagers.data.code === '1') {
                                    allManagers = Array.isArray(get_companyManagers.data.data) ? get_companyManagers.data.data : [];
                                } else {
                                    // this.$Message.error('');
                                }
                            }
                    }
                }

                // 拼接提醒字符串
                res_getNoticeBody.data.data.forEach(item => {
                    let userIds = [];
                    const managerUserIds = item.recipientDeptManager === 1 ? allManagers : [];

                    switch (item.recipientType) {
                        case 0:
                            // 后端直接发
                            userIds = item.recipientList;
                            break;
                        case 1:
                            // 新增负责人
                            userIds = newManager;
                            break;
                        case 2:
                        case 6:
                            // 负责人
                            userIds = allManagers;
                            break;
                        case 3:
                        case 7:
                            // 新增 + 负责人
                            userIds = allManagers.concat(newManager);
                            break;
                        case 4:
                            // 其他负责人
                            userIds = obj.userId ? allManagers.filter(id => `${id}` !== `${obj.userId}`) : allManagers;
                            break;
                        case 5:
                            // 新增 + 其他
                            userIds = obj.userId ? allManagers.filter(id => `${id}` !== `${obj.userId}`) : allManagers;
                            userIds = userIds.concat(newManager);
                            break;
                    }

                    userIds = [...new Set(userIds)].map(item => `${item}`);
                    // 发送给银真
                    if (userIds.length > 0 || managerUserIds.length > 0) {
                        util.ajaxJson({
                            url: '/new-privilege/msgRemind/save',
                            method: 'post',
                            data: {
                                userIdList: userIds, // 接收人userId
                                orgId: obj.orgId, // 企业id
                                remindContent: item.remindContent, // 提醒内容
                                relationObjType: item.relationObjType, // 关联对象
                                seqId: item.seqId, // 询盘/线索/客户id
                                isGongHai: item.isGongHai,
                                managerUserIds // 选择负责人部门主管需要此参数
                            }
                        }).then(res => {
                            if (res.data.code === '1') {
                                if (res.data.data.length > 0) {
                                    store.dispatch('sendWSMsg', Object.assign({
                                        userIds: item.recipientDeptManager === 1 ? res.data.data : userIds, // 选择负责人部门主管使用save返回数据
                                        text: item.remindContent,
                                        messageType: 'systemNotice'
                                    }, obj));
                                }
                            }
                        });
                    }
                });
            }
        }
    }
};
// 触发 gtag 事件 --- 不挂载在 Vue.protoType 上, 避免子项目调用失败
export const triggerGtag = function(eventCategory, eventName) {
    // console.error(eventCategory, eventName);
    // gtag('event', 'purchase', {
    //     currency: 'USD',
    //     value: 1,
    //     items: [
    //         {
    //             item_name: `前端-${eventName}`,
    //             item_category: eventCategory,
    //             price: 1,
    //             quantity: 1
    //         }
    //     ]
    // });
};
