// 1:访客历史,2:网站留言,3:直接创建,4:聊天 5:线索来源 6:FB私信 7:FB评论
// import env from '../../build/env';
import URLs from '../../build/url';
import store from '../store';
import i18n from '@/locale';
import _ from 'lodash';
import { removeOpenedWindowList } from '@/utils/storage';
import { HANDLE_BUTTON_FUN } from '@/utils/authority';
// import Cookies from 'js-cookie';
// import $ from 'jquery';
export const COSTOMER_HISTORY = 1;
export const WEBSITE_MESSAGE = 2;
export const DIRECT_CREATE = 3;
export const MY_CHAT = 4;
export const CLUE_FROM = 5;
export const FACEBOOK_CHAT = 6;
export const FACEBOOK_COMMENT = 7;

const ajaxUrl = URLs.ajaxUrl;

// 返回数据状态
export const ERR_CODE = '1';

export const _my_keywords = 1;

// // 按钮权限判断
export const HANDLE_BUTTON = HANDLE_BUTTON_FUN;
// export function HANDLE_BUTTON(id, arr) {
//     let disable = true;
//     for (const item of arr) {
//         if (id === item.id) {
//             disable = false;
//             break;
//         }
//     }
//     return disable;
// }
// 权限按钮 id --- 提取自功能权限设置的权限树, 后续有变动要做出相应调整
export const BUTTON_IDS = {
    CRM: {
        id: 10629,
        clue: {
            // 查看
            id: 11124,
            // 导入数据
            import_data: 11133,
            // 导出数据
            export_data: 11134,
            // 编辑
            edit: 11126,
            // 侧滑详情中的【改变状态】
            change_status: 11128,
            // 退入公海
            go_sea: 11132,
            // 录入询盘
            enter_inquiry: 11129,
            // 侧滑详情中的【转移线索】
            shift_clue: 11131,
            // 添加线索备注
            add_remark: 11127,
            // 二维码名片
            qrcode: 11130,
            // 添加线索
            add_clue: 11125,
            // 批量转移
            transfer_batch: 11131,
            myCharge: 10700,
            myCreate: 11081,
            myChargeTran: 11080,
            myCreateTran: 11082
        },
        highseasClue: {
            export_data: 10716,
            batch_claim: 10718,
            add_remark: 10719,
            claim: 10720,
            import_data: 11084,
            add_clue: 11083
        },
        customer: {
            id: 10659,
            newCompany: 10741,
            documentEdit: {
                id: 10761,
                uploadDocument: 10762,
                deleteDocument: 10844
            },
            customerList: 10851,
            dataImport: {
                id: 10742,
                importData: 10743
            },
            dataExport: {
                id: 10744,
                documentDownload: 10745
            },
            edit: {
                id: 10746,
                share: 10813,
                transfer: 10814,
                throw: 10815,
                merge: 10916,
                batchTransfer: 10918,
                sendMail: 10995,
                editCustomer: 10747,
                newInquiry: 10748,
                batchThrowCompany: 11013,
                rebuildTimeline: 11055
            }
        },
        inquiry: {
            id: 10661,
            newCompany: 10802,
            dataImport: {
                id: 10803,
                importData: 10804
            },
            dataExport: {
                id: 10805,
                documentDownload: 10806
            },
            edit: {
                id: 10807,
                audienceOptimization: 10808,
                editInquiry: 10809,
                sendMail: 10810,
                newContact: 10811,
                inquiryFollowup: 10816,
                newTask: 10817,
                deleteTask: 10818,
                editTask: 10819,
                label: 10862,
                merge: 10913
            },
            documentEdit: {
                id: 10820,
                uploadDocument: 10821,
                deleteDocument: 10822,
                batchDownload: 10945,
                syncDocuments: 11051 // 线上id：11051 测试id：11054
            },
            inquiryList: 10854
        },
        contact: {
            id: 10866,
            contactList: 10877,
            edit: {
                id: 10878,
                editContact: 10879
            },
            dataExport: {
                id: 10871,
                documentDownload: 10872
            }
        },
        highSeas: {
            id: 10660,
            dataExport: {
                id: 10763,
                documentDownload: 10764
            },
            edit: {
                id: 10765,
                claimCustomer: 10767,
                batchClaimCustomer: 11011,
                batchDistributeCustomer: 11012
            },
            customerList: 10852
        },
        database: {
            person_disk: {
                id: 10964,
                create_folder: 10967,
                upload_file: 10968,
                change_name: 10969,
                share_file: 10970,
                delete: 10971,
                look: 10981,
                download: 10982
            },
            company_disk: {
                id: 10965,
                create_folder: 10972,
                upload_file: 10973,
                change_name: 10974,
                share_file: 10975,
                delete: 10976,
                look: 10983,
                download: 10984
            },
            share_disk: {
                id: 10966,
                create_folder: 10977,
                upload_file: 10978,
                change_name: 10979,
                delete: 10980,
                look: 10985,
                download: 10986
            }
        },
        // 阿里数据导入页面
        aliImportCRX: {
            viewMatchRel: 10992,
            changeMatchRel: 10993
        }
    },
    Mail: {
        download: 'button.email.download'
    },
    emailMarketing: {
        id: 11015,
        addressBook: {
            id: 11017,
            new: 11019,
            export: 11020,
            edit: 11021,
            del: 11022
        },
        activity: {
            id: 11016,
            del: 11018
        }
    },
    WhatsApp: {
        // 录入线索
        enterClue: 11058,
        // 录入客户
        enterCustomer: 11059,
        waApiSend: 11054,

        // 查看下属
        view_subordinates: 'button.communication.whatsappchat.lookhistoryaccount', // 线上环境
        // view_subordinates: 11038, // 测试环境
        // 导出联系人
        exportContact: 'button.communication.whatsappchat.export.contacts', // 线上环境

        viewWaStatment: 11103, // 线上环境
        // viewWaStatment: 11106, // 测试环境

        WhatsappManagement: {
            // 下属在线\离线
            offLineOrOnline: 'button.socialMedia.whatsappmanagement.chatmanage.accountstatus',
            // 聊天管理
            chatManagement: 'button.socialMedia.whatsappmanagement.chatmanage.chatmanage', // 线上环境

            // 重点关注
            keyAttention: 'button.socialmedia.whatsappmanagement.payclose',
            // 关键词汇
            keyWords: 'button.socialmedia.whatsappmanagement.keyvocabulary',
            // 转化关系
            conversionRelationship: 'button.socialmedia.whatsappmanagement.turnmanage',
            // 客户安全
            customerSafety: {
                id: 'button.socialmedia.whatsappmanagement.accountsafety.accountturn',
                // 按钮权限
                loginNewWA: 'button.socialmedia.whatsappmanagement.accountsafety.loginnewaccount', // 线上环境

                logOut: 'button.socialmedia.whatsappmanagement.accountsafety.quitlogin', // 线上环境

                goviewmsg: 'button.socialmedia.whatsappmanagement.accountsafety.lookmessage', // 线上环境

                transAccount: 'button.socialmedia.whatsappmanagement.accountsafety.accountturn', // 线上环境

                takeOff: 'button.socialmedia.whatsappmanagement.accountsafety.relievebinding' // 线上环境
            }
        },
        WhatsappSearch: {
            // 录入线索
            enterClue: 11060,
            // 录入客户
            enterCustomer: 11061
        },

        WA_Group_Btn_List: {
            personGroupSend: 11169, // 个人号群发
            ApiGroupSend: 11170 // API广告群发
        },

        // 智能物料
        smartMaterial: 10961
    },
    Cinnox: {
        // 录入线索
        enterClue: 11120,
        // 录入客户
        enterCustomer: 11121,
        // 录音转文字
        audioToText: 11122,
        // 录音下载
        downloadAudio: 11123
    },
    dataReport: {
        google: 10830,
        traffic: 10832,
        dialog: 10834,
        service: 10836,
        message: 10838,
        leads: 10840
    },
    Facebook: {
        chat: {
            // 录入线索
            enterClue: 11062,
            // 录入客户
            enterCustomer: 11063
        },
        leads: {
            // 录入线索
            enterClue: 10824,
            // 录入客户
            enterCustomer: 11068,
            remove: 10825,
            reset: 10826,
            export: 10828
        }
    },
    website: {
        myWebsite: {
            templateStation: 10952,
            customStation: 10954
        },
        SEO: {
            templateStation: 10952
        },
        visitorHistory: {
            exportData: 'button.websiteInteraction.visitorhistory.upload',
            // 录入线索
            enterClue: 10678,
            // 录入客户
            enterCustomer: 11067,
            remark: 'button.websiteInteraction.visitorhistory.edit.remark',
            visitorType: 'button.websiteInteraction.visitorhistory.edit.visitorkind'
        },
        websiteMsg: {
            // 录入线索
            enterClue: 10682,
            // 录入客户
            enterCustomer: 11066,
            remove: 10683,
            reset: 10684,
            remark: 'button.websiteInteraction.websitemessage.addremark',
            export: 'button.websiteInteraction.websitemessage.filedownload'
        },
        aiseo: {
            aiseolist: 11181,
            aiseocreate:11182,
            aiseodelete: 11183,
        }
    },
    WeChat: {
        // 企微菜单
        microenterprise: 11077,
        // 录入线索
        enterClue: 11086,
        // 录入客户
        enterCustomer: 11087
    },
    chat: {
        // 录入询盘
        enterClue: 11064,
        // 录入客户
        enterCustomer: 11065
    },
    systemSetting: {
        id: 10634,
        mailSetting: {
            id: 10607,
            untie: 11072
        },
        facebookSetting: {
            account: {
                bindCompanyPage: 'button.facebookbinding.accountbinding.bindingcompany',
                unBindCompanyPage: 'button.facebookbinding.accountbinding.unbundlecompany'
            },
            form: {
                bindCompanyLeads: 'button.facebookbinding.leadsbinding.bindingcompanyleads',
                unBindCompanyLeads: 'button.facebookbinding.leadsbinding.unbundlecompanyleads'
            }
        }
    },
    followUpRecord: {
        id: 11040,
        newFollowUp: 11041,
        followUpList: 11042,
        dataImport: 11043,
        dataExport: 11044
    },
    followUpPlan: {
        id: 11088,
        followUpPlanList: 11088,
        newPlan: 11089,
        editPlan: 11090,
        delPlan: 11091
    },
    // 企业 GPT
    enterpriseGPT: {
        enterpriseGPTPage: 11150,
        scene: {
            newScene: 11152,
            setScene: 11153
        },
        knowledgeBase: {
            page: 11154,
            tag: 11157,
            newTag: 11171,
            editTag: 11172,
            sortTag: 11173,
            deleteTag: 11174,
            moveFile: 11175,
            knowledgeMap: 11158,
            newFolder: 11159,
            editFolder: 11160,
            deleteFolder: 11161,
            importFile: 11176, // 上传文件
            stagedCleaningSettings: 11177, // 分段清洗设置
            recallTest: 11178, // 召回测试
            deleteFile: 11163,
            tagFile: 11164,
            addKeyword: 11165,
            deleteKeyword: 11166
        }
    }
};

// 非法退出监听和处理
export function HANDLE_EXIT() {
    let mouse_X = 0;
    // $(window).on('beforeunload',function(){return'Your own message goes here...';});
    function get_mouse_pos_x(ev) {
        // console.log('get_mouse_pos_x');
        ev = ev || window.event;
        // console.log(ev.pageX);
        if (ev.pageX || ev.pageY) {
            mouse_X = ev.pageX;
        }
        mouse_X = ev.clientX + document.body.scrollLeft - document.body.clientLeft;
    }

    document.onmousemove = _.debounce(get_mouse_pos_x, 300);

    function ajax() {
        const ajaxData = {
            type: arguments[0].type || 'GET',
            url: arguments[0].url ? ajaxUrl + arguments[0].url : '',
            async: arguments[0].async || 'true',
            data: arguments[0].data || null,
            dataType: arguments[0].dataType || 'text',
            contentType: arguments[0].contentType || 'application/x-www-form-urlencoded',
            beforeSend: arguments[0].beforeSend || function() {
            },
            success: arguments[0].success || function() {
            },
            error: arguments[0].error || function() {
            }
        };
        ajaxData.beforeSend();
        const xhr = createxmlHttpRequest();
        xhr.responseType = ajaxData.dataType;
        xhr.open(ajaxData.type, ajaxData.url, ajaxData.async);
        xhr.setRequestHeader('Content-Type', ajaxData.contentType);
        xhr.send(convertData(ajaxData.data));
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    ajaxData.success(xhr.response);
                } else {
                    ajaxData.error();
                }
            }
        };
    }

    function createxmlHttpRequest() {
        if (window.ActiveXObject) {
            return new ActiveXObject('Microsoft.XMLHTTP');
        } else if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
    }

    function convertData(data) {
        if (typeof data === 'object') {
            let convertResult = '';
            for (const c in data) {
                convertResult += `${c}=${data[c]}&`;
            }
            convertResult = convertResult.substring(0, convertResult.length - 1);
            return convertResult;
        } else {
            return data;
        }
    }

    let want_refresh = 'no';
    document.onkeydown = function(e) {
        e = e || window.event;
        if ((e.ctrlKey && e.keyCode === 82) || e.keyCode === 116) {
            want_refresh = 'yes';
        }
    };
    window.addEventListener('beforeunload', function(e) {
        console.log('config');

        // 关闭定时更新时间戳数组定时器
        store.commit('clearTimerUpdateSeq');
        // 关闭页面前, 从 storage 中去掉当前 windowOpenTimeStamp
        removeOpenedWindowList(store.state.app.windowOpenTimeStamp);

        if (mouse_X < 190) want_refresh = 'yes';
        if (want_refresh !== 'yes') {
            // 关闭浏览器
            /* function getCookie(name) {
                let arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
                if (arr = document.cookie.match(reg)) {
                    return unescape(arr[2]);
                }
                else {
                    return null;
                }
            }

            let accid = getCookie("accId");
            let userId = getCookie('userId');
            let timeStampList= JSON.parse(localStorage.timeStampList);
            //只有当关闭的是最后一个页面时才退出聊天
            if (timeStampList.length<1 && accid) {
                ajax({
                    type: "POST",
                    url: "/server/updateEnterpriseidServiceOnlineStatusNew",
                    dataType: "json",
                    async: false,
                    data: {"accid": accid, "operateSource": "front-end-close-web-logout", "onlineFlag": 0},
                });

                ajax({
                    type: "POST",
                    url: "/server/inputLoggerInfoForDebug",
                    dataType: "json",
                    async: false,
                    data: {"eventName": "account logout", "type": "", "from": accid, "remark": accid + "关闭聊天"},
                });

                ajax({
                    type: "POST",
                    url: "/cuss-login/logout",
                    dataType: "json",
                    async: false,
                    data: {"userId": userId},
                });

                Cookies.remove('isServerOnline');
            } */

        } else {
            // 刷新浏览器
            want_refresh = 'no';
        }
        // 点击取消时，发送失焦事件
        // setTimeout(() => {
        //     this.inputFlag = true;
        //     console.log('定时器222', this.inputFlag);
        // }, 3000);
        // this.inputFlag = false;
        // console.log('111', this.inputFlag);
        // e = e || window.event;
        // // 兼容IE8和Firefox 4之前的版本
        // if (e) {
        //     e.returnValue = '关闭提示';
        // }

        // // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
        // return '关闭提示';
        // index.html beforeunload 事件迁移过来
        localStorage.removeItem('leadsCloud-clueId');
        localStorage.removeItem('leadsCloud-companyId');
        localStorage.removeItem('leadsCloud-inquiryId');
        localStorage.removeItem('leadsCloud-contactId');
        localStorage.removeItem('leadsCloud-workBench_type');
        localStorage.removeItem('leadsCloud-workBench_number_type');
        localStorage.removeItem('leadsCloud-screenDate');
        localStorage.removeItem('leadsCloud-followUpId');
        localStorage.removeItem('leadsCloud-saleIdList');
        localStorage.removeItem('leadsCloud-sendMail-contacts');
        localStorage.removeItem('leadsCloud-timeLine-mailDetail');
        localStorage.removeItem('leadsCloud-mailModal-previewMailId');
        // localStorage.removeItem('leadsCloud-FBLeadsId');
        // localStorage.removeItem('leadsCloud-VisitorHistoryId');

        // 弹出关闭提醒弹框: 处于聊天页面 或 写邮件页面 或 seo新建文章页面
        if (location.hash.indexOf('xhl_chat') !== -1 || location.hash.indexOf('writeMail') !== -1 || store.state.seo.switchComponent === 'seo-gen') {
            e = e || window.event;
            // 兼容IE8和Firefox 4之前的版本
            e.preventDefault();
            if (e) {
                e.returnValue = '关闭提示';
            }
            // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
            return '关闭提示';
        }
    });
    // window.onbeforeunload = function(event) {
    //     console.log('config');
    //     if (localStorage.timeStampList) {
    //         let timeStampList = JSON.parse(localStorage.timeStampList);
    //         timeStampList.forEach((item, index) => {
    //             if (item === store.state.websocketTimeStamp) {
    //                 timeStampList.splice(index, 1);
    //                 localStorage.setItem('timeStampList', JSON.stringify(timeStampList));
    //             }
    //         });
    //     }
    //     if (mouse_X < 190) want_refresh = 'yes';
    //     if (want_refresh !== 'yes') {
    //         // 关闭浏览器
    //         /* function getCookie(name) {
    //             let arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    //             if (arr = document.cookie.match(reg)) {
    //                 return unescape(arr[2]);
    //             }
    //             else {
    //                 return null;
    //             }
    //         }

    //         let accid = getCookie("accId");
    //         let userId = getCookie('userId');
    //         let timeStampList= JSON.parse(localStorage.timeStampList);
    //         //只有当关闭的是最后一个页面时才退出聊天
    //         if (timeStampList.length<1 && accid) {
    //             ajax({
    //                 type: "POST",
    //                 url: "/server/updateEnterpriseidServiceOnlineStatusNew",
    //                 dataType: "json",
    //                 async: false,
    //                 data: {"accid": accid, "operateSource": "front-end-close-web-logout", "onlineFlag": 0},
    //             });

    //             ajax({
    //                 type: "POST",
    //                 url: "/server/inputLoggerInfoForDebug",
    //                 dataType: "json",
    //                 async: false,
    //                 data: {"eventName": "account logout", "type": "", "from": accid, "remark": accid + "关闭聊天"},
    //             });

    //             ajax({
    //                 type: "POST",
    //                 url: "/cuss-login/logout",
    //                 dataType: "json",
    //                 async: false,
    //                 data: {"userId": userId},
    //             });

    //             Cookies.remove('isServerOnline');
    //         } */

    //     } else {
    //         // 刷新浏览器
    //         want_refresh = 'no';
    //     }

    // };
// 非法退出监听和处理结束
}

// 高级筛选范围选项
export const TOP_FILTER_ITEM = {
    text: [
        {
            value: '$eq',
            label: i18n.t('crm.Table.con_equal'),
            childrenType: 'string'
        },
        {
            value: '$ne',
            label: i18n.t('crm.Table.con_unequal'),
            childrenType: 'string'
        },
        {
            value: '$regex',
            label: i18n.t('crm.Table.con_include'),
            childrenType: 'string'
        },
        {
            value: '$nregex',
            label: '不包含',
            childrenType: 'string'
        },
        {
            value: '$null',
            label: '为空',
            childrenType: 'null'
        },
        {
            value: '$nnull',
            label: '不为空',
            childrenType: 'nnull'
        }
    ],
    textsocialNetwork: [
        {
            value: '$regex',
            label: i18n.t('crm.Table.con_include'),
            childrenType: 'string'
        },
        {
            value: '$nregex',
            label: i18n.t('crm.Table.con_exclude'),
            childrenType: 'string'
        },
        {
            value: '$null',
            label: '为空',
            childrenType: 'null'
        },
        {
            value: '$nnull',
            label: '不为空',
            childrenType: 'nnull'
        }
    ],
    // 单选、人员单选、部门单选
    select: [
        {
            value: '$eq',
            label: i18n.t('crm.Table.con_equal'),
            childrenType: 'select'
        },
        {
            value: '$ne',
            label: i18n.t('crm.Table.con_unequal'),
            childrenType: 'select'
        },
        {
            value: '$in',
            label: '等于任意',
            childrenType: 'array'
        },
        {
            value: '$nin',
            label: '不等于任意',
            childrenType: 'array'
        },
        {
            value: '$null',
            label: '为空',
            childrenType: 'null'
        },
        {
            value: '$nnull',
            label: '不为空',
            childrenType: 'nnull'
        }
    ],
    // 是否、男女选项
    boolean: [
        {
            value: '$eq',
            label: i18n.t('crm.Table.con_equal'),
            childrenType: 'booleanSelect'
        },
        {
            value: '$ne',
            label: i18n.t('crm.Table.con_unequal'),
            childrenType: 'booleanSelect'
        },
        {
            value: '$in',
            label: '等于任意',
            childrenType: 'booleanMultSelect'
        },
        {
            value: '$nin',
            label: '不等于任意',
            childrenType: 'booleanMultSelect'
        },
        {
            value: '$null',
            label: '为空',
            childrenType: 'null'
        },
        {
            value: '$nnull',
            label: '不为空',
            childrenType: 'nnull'
        }
    ],
    // 人员多选
    MultSelectUser: [
        {
            value: '$eq',
            label: i18n.t('crm.Table.con_equal'),
            childrenType: 'array'
        },
        {
            value: '$ne',
            label: i18n.t('crm.Table.con_unequal'),
            childrenType: 'array'
        },
        {
            value: '$regex',
            label: '包含任意',
            childrenType: 'array'
        },
        {
            value: '$nregex',
            label: '不包含任意',
            childrenType: 'array'
        },
        {
            value: '$andregex',
            label: '包含全部',
            childrenType: 'array'
        },
        {
            value: '$andnregex',
            label: '不包含全部',
            childrenType: 'array'
        },
        {
            value: '$null',
            label: '为空',
            childrenType: 'null'
        },
        {
            value: '$nnull',
            label: '不为空',
            childrenType: 'nnull'
        }
    ],
    MultSelect: [
        // {
        //     value: '$eq',
        //     label: i18n.t('crm.Table.con_equal'),
        //     childrenType: 'array'
        // },
        // {
        //     value: '$ne',
        //     label: i18n.t('crm.Table.con_unequal'),
        //     childrenType: 'array'
        // },
        {
            value: '$regex',
            label: '包含任意',
            childrenType: 'array'
        },
        {
            value: '$nregex',
            label: '不包含任意',
            childrenType: 'array'
        },
        {
            value: '$andregex',
            label: '包含全部',
            childrenType: 'array'
        },
        // {
        //     value: '$andnregex',
        //     label: '不包含全部',
        //     childrenType: 'array'
        // },
        {
            value: '$null',
            label: '为空',
            childrenType: 'null'
        },
        {
            value: '$nnull',
            label: '不为空',
            childrenType: 'nnull'
        }
    ],
    // 数字
    number: [
        {
            value: '$range',
            label: '范围',
            childrenType: 'numberRange'
        },
        // 等于
        {
            value: '$eq',
            label: i18n.t('crm.Table.con_equal'),
            childrenType: 'number'
        },
        // 不等于
        {
            value: '$ne',
            label: i18n.t('crm.Table.con_unequal'),
            childrenType: 'number'
        },
        // 大于
        {
            value: '$gt',
            label: i18n.t('crm.Table.con_greaterThan'),
            childrenType: 'number'
        },
        // 大于等于
        {
            value: '$gte',
            label: i18n.t('crm.Table.con_greaterOrEqual'),
            childrenType: 'number'
        },
        // 小于
        {
            value: '$lt',
            label: i18n.t('crm.Table.con_lessThan'),
            childrenType: 'number'
        },
        // 小于等于
        {
            value: '$lte',
            label: i18n.t('crm.Table.con_lessOrEqual'),
            childrenType: 'number'
        },
        {
            value: '$null',
            label: '为空',
            childrenType: 'null'
        },
        {
            value: '$nnull',
            label: '不为空',
            childrenType: 'nnull'
        }
    ],
    // 时间+日期、日期
    dateRange: [
        // {
        //     value: '$eq',
        //     label: i18n.t('crm.Table.con_equal'),
        //     childrenType: 'dateTime'
        // },
        {
            value: '$range',
            label: '范围',
            childrenType: 'dateRange'
        },
        {
            value: '$lt',
            label: '早于',
            childrenType: 'date'
        },
        {
            value: '$gt',
            label: '晚于',
            childrenType: 'date'
        },
        {
            value: '$null',
            label: '为空',
            childrenType: 'null'
        },
        {
            value: '$nnull',
            label: '不为空',
            childrenType: 'nnull'
        }
    ],
    contrySelect: [
        {
            value: '$eq',
            label: i18n.t('crm.Table.con_include'),
            childrenType: 'countryArea'
        },
        {
            value: '$ne',
            label: i18n.t('crm.Table.con_exclude'),
            childrenType: 'countryArea'
        },
        // {
        //     value: '$in',
        //     label: '等于任意',
        //     childrenType: 'countryArea'
        // },
        // {
        //     value: '$nin',
        //     label: '不等于任意',
        //     childrenType: 'countryArea'
        // },
        {
            value: '$null',
            label: '为空',
            childrenType: 'null'
        },
        {
            value: '$nnull',
            label: '不为空',
            childrenType: 'nnull'
        }
    ],
    // 公海规则、公海分组处的国家地区筛选值
    settingContrySelect: [
        {
            value: '$eq',
            label: i18n.t('crm.Table.con_equal'),
            childrenType: 'countryArea'
        },
        {
            value: '$ne',
            label: i18n.t('crm.Table.con_unequal'),
            childrenType: 'countryArea'
        },
        {
            value: '$in',
            label: i18n.t('highSeasSetting.equalToAny'),
            childrenType: 'countryArea'
        },
        {
            value: '$nin',
            label: i18n.t('highSeasSetting.notEqualToAny'),
            childrenType: 'countryArea'
        },
        {
            value: '$null',
            label: '为空',
            childrenType: 'null'
        },
        {
            value: '$nnull',
            label: '不为空',
            childrenType: 'nnull'
        }
    ],
    // 部门选项
    departmentSelect: [
        // {
        //     value: '$eq',
        //     label: i18n.t('crm.Table.con_equal'),
        //     childrenType: 'department'
        // },
        // {
        //     value: '$ne',
        //     label: i18n.t('crm.Table.con_unequal'),
        //     childrenType: 'department'
        // },
        {
            value: '$regex',
            label: '包含任意',
            childrenType: 'department'
        },
        {
            value: '$nregex',
            label: '不包含任意',
            childrenType: 'department'
        },
        {
            value: '$andregex',
            label: '包含全部',
            childrenType: 'department'
        },
        {
            value: '$andnregex',
            label: '不包含全部',
            childrenType: 'department'
        },
        {
            value: '$null',
            label: '为空',
            childrenType: 'null'
        },
        {
            value: '$nnull',
            label: '不为空',
            childrenType: 'nnull'
        }
    ]
};
