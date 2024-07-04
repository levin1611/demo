import Vue from 'vue';
import util from '@/libs/util';
import i18n from '@/locale';
import VueRouter from 'vue-router';
import Cookies from 'js-cookie';
import { childRules } from '../micros/childRules.js'; // 引入子应用激活规则
// import mainVue from '@/views/Main.vue';
const mainVue =  resolve => require(['@/views/Main.vue'], resolve)
import {
    routers
} from './router';
import store from '../store';
import { Message } from 'element-ui';
import { initialState } from '@/micros/actions';

Vue.use(VueRouter);

// 目录使用的 icon
const ICON_OBJ = {
    product: 'menu-product-management',
    googleMarketing: 'menu-google-marketing',
    facebook: 'menu-Facebook',
    websiteInteraction: 'menu-webInteraction',
    facebookInteraction: 'menu-fb-interaction',
    clue_manage: 'menu-leads-management',
    crm: 'menu-CRM',
    customs_data: 'menu-customs-data',
    data_report: 'menu-data-report',
    system_settings: 'menu-setting',
    bi_report: 'menu-BI',
    whatsapp_manage: 'menu-WhatsApp',
    briefcase: 'menu-cloudPush',
    googleAds: 'menu-googleAds',
    email_marketing: 'EDMyingxiao',
    seo: 'menu-seo',

    website_manager: 'menu-webInteraction',
    xhl_chat: 'liaotianshezhi',
    website_message: 'wangzhanliuyan',
    google_search_console: 'menu-googleAds',
    visitor_history: 'fangkelishi',
    whatsapp_chat: 'menu-WhatsApp',
    my_clue: 'xiansuoguanli',

    // 系统设置
    company_overview: 'menu-corpOverview',
    company: 'gongsigaikuang',
    authority: 'menu-authSettings',
    organizational: 'zuzhijiagou',
    fieldSettings: 'menu-fieldSettings',
    universalSetting: 'menu-fieldAttrSettings',
    highSeasSetting: 'menu-highSeasSettings',
    mail_set: 'menu-mail',
    whatsapp_setting: 'menu-WhatsApp',
    set_up_shared_domain_name: 'menu-cloudPush',
    portal_set: 'menu-chatSettings',
    google_binding: 'menu-googleAds',
    facebookBinding: 'menu-Facebook',
    autoSettings: 'menu-autoSettings',
    business_params_set: 'menu-BI',
    goalSetting: 'yejimubiao',
    abnormal_setting: 'yichangmingxi', // 异动设置
    company_mail_magage: 'qiyeyouxiangguanli',
    whatsapp_microenterprise: 'zhudaohang_qiyeweixin',
    calling_sms: 'a-daohangtonghua-duanxinnormal',
    autoGenArticle: 'menu-autoSettings',
    openApi: 'OpenAPI',
    enterpriseGPT: 'a-AIguoduanniu',
    aiToolbar: 'a-AIguoduanniu',
    businessObjectAndField: 'businessObjectAndField',
    communication: 'goutong',
    socialMedia: 'shemei',
    form: 'biaodanshezhi',
    noticeSetting: 'tongzhishezhi'
};
export const ROUTER_LIST = {
    website_manager: (resolve) => {
        // todo here MKT3.2.5 更新界面
        import('@/views/word-press/site-management.vue').then((module) => {
            resolve(module);
        });
    },
    seo: (resolve) => {
        import('@/views/seo-subject/index.vue').then((module) => {
            resolve(module);
        });
    },
    xhl_chat: (resolve) => {
        import('@/views/xhl-chat/xhl-chat.vue').then((module) => {
            resolve(module);
        });
    },
    visitor_history: (resolve) => {
        import('@/views/visitor-history/visitor_history.vue').then((module) => {
            resolve(module);
        });
    },
    website_message: (resolve) => {
        import('@/views/website-message/website-msg.vue').then((module) => {
            resolve(module);
        });
    },
    my_clue: (resolve) => {
        // if(Cookies.get('enterpriseId')=='1001'||Cookies.get('enterpriseId')==EnterpriseId){
        // if(Cookies.get('enterpriseId')==EnterpriseId){
        import('@/views/clue-manage/Table/myClue.vue').then((module) => {
            resolve(module);
        });
        // }else{
        //     import('@/views/clue-manage/clue/clue.vue').then((module) => {
        //         resolve(module)
        //     })
        // }
    },
    common_sea_customer: (resolve) => {
        // if(Cookies.get('enterpriseId')=='1001'||Cookies.get('enterpriseId')==EnterpriseId){
        // if(Cookies.get('enterpriseId')==EnterpriseId){
        import('@/views/clue-manage/Table/highseasClue.vue').then((module) => {
            resolve(module);
        });
        // }else{
        //     import('@/views/clue-manage/comseacustomer/comseacustomer.vue').then((module) => {
        //         resolve(module)
        //     })
        // }
    },
    set_clue: (resolve) => {
        import('@/views/clue-manage/clue-set/clue-set.vue').then((module) => {
            resolve(module);
        });
    },
    workBench: (resolve) => {
        import('@/views/crm/WorkBench/workBench.vue').then((module) => {
            resolve(module);
        });
    },
    customerCheck: (resolve) => {
        import('@/views/crm/Table/customerCheck.vue').then((module) => {
            resolve(module);
        });
    },
    myCustomer: (resolve) => {
        import('@/views/crm/Table/myCustomer.vue').then((module) => {
            resolve(module);
        });
    },
    highseasCustomer: (resolve) => {
        // if(Cookies.get('enterpriseId')=='1001'||Cookies.get('enterpriseId')==EnterpriseId){
        import('@/views/crm/Table/highseasCustomer.vue').then((module) => {
            resolve(module);
        });
        // }else{
        //     import('@/views/crm/HighseasCustomer/highseasCustomer.vue').then((module) => {
        //     // import('@/views/crm/Table/highseasCustomer.vue').then((module) => {
        //         resolve(module)
        //     })
        // }
    },
    myInquiry: (resolve) => {
        import('@/views/crm/Table/myInquiry.vue').then((module) => {
            resolve(module);
        });
    },
    myContact: (resolve) => {
        import('@/views/crm/Table/myContact.vue').then((module) => {
            resolve(module);
        });
    },
    dataMovement: (resolve) => {
        //todo here
        import('@/views/crm/Table/dataMovement.vue').then((module) => {
            resolve(module);
        });
    },
    followUpRecord: (resolve) => {
        //todo here
        import('@/views/crm/Table/followUpRecord.vue').then((module) => {
            resolve(module);
        });
    },
    followUpPlan: (resolve) => {
        //todo here
        import('@/views/crm/Table/followUpPlan.vue').then((module) => {
            resolve(module);
        });
    },
    aliImportCRX: (resolve) => {
        import('@/views/crm/AliImportCRX/aliImportCRX.vue').then((module) => {
            resolve(module);
        });
    },
    set_up_shared_domain_name: (resolve) => {
        import('@/views/crm/Briefcase/setUpSharedDomainName.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    database: (resolve) => {
        import('@/views/crm/Briefcase/database.vue').then((module) => {
            resolve(module);
        });
    },
    cloud_push: (resolve) => {
        import('@/views/crm/Briefcase/cloudPush.vue').then((module) => {
            resolve(module);
        });
    },
    access_record: (resolve) => {
        import('@/views/crm/Briefcase/accessRecord.vue').then((module) => {
            resolve(module);
        });
    },
    inquirySetting: (resolve) => {
        import('@/views/crm/InquirySetting/inquirySetting.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    universalSetting: (resolve) => {
        import('@/views/crm/UniversalSetting/universalSetting.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    // mail_home: (resolve) => {
    //     import('@/views/mail/mail-home').then((module) => {
    //         resolve(module)
    //     })
    // },
    // mail: (resolve) => {
    //     import('@/views/mail/mail-home').then((module) => {
    //         resolve(module)
    //     })
    // },
    // mail_set: (resolve) => {
    //     import('@/views/mail/mail-settings').then((module) => {
    //         resolve(module)
    //     })
    // },
    //企业邮件管理设置
    company_mail_magage: (resolve) => {
        import(
            '@/views/systemSettings/company_mail_magage/company_mail_magage.vue'
        ).then((module) => {
            resolve(module);
        });
    },
    social_reporting: (resolve) => {
        import('@/views/facebook/social-reporting/Socialreporting.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    account_binding: (resolve) => {
        import('@/views/facebook/account-binding/Accountbinding.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    ad_account_binding: (resolve) => {
        import(
            '@/views/facebook/ad-account-binding/ad_account_binding.vue'
        ).then((module) => {
            resolve(module);
        });
    },
    one_key_release: (resolve) => {
        import('@/views/facebook/onekey-release/Onekeyrelease.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    homepage_dynamic: (resolve) => {
        import('@/views/facebook/homepage-dynamic/Homepagedynamic.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    inbox: (resolve) => {
        import('@/views/facebook/inbox/Inbox.vue').then((module) => {
            resolve(module);
        });
    },
    form_bind: (resolve) => {
        import('@/views/facebook/form-bind/form-bind.vue').then((module) => {
            resolve(module);
        });
    },
    fb_message: (resolve) => {
        import('@/views/facebook/fb-message/fb_message.vue').then((module) => {
            resolve(module);
        });
    },
    // b2b_platform: (resolve) => {
    //     import('@/views/b2b-platform').then((module) => {
    //         resolve(module)
    //     })
    // },
    google_ad_words: (resolve) => {
        import('@/views/data-report/Google-AdWords/googleAdWords.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    // ad: (resolve) => {
    //     import('@/views/data-report/Google-AdWords/Ad/ad.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    // account: (resolve) => {
    //     import('@/views/data-report/Google-AdWords/Account/account.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    // ad_series: (resolve) => {
    //     import('@/views/data-report/Google-AdWords/AdSeries/adSeries.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    // ad_group: (resolve) => {
    //     import('@/views/data-report/Google-AdWords/AdGroup/adGroup.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    // comment_able: (resolve) => {
    //     import('@/views/data-report/Google-AdWords/template/commentable.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    // keywords: (resolve) => {
    //     import('@/views/data-report/Google-AdWords/Keywords/keywords.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    // search_terms: (resolve) => {
    //     import('@/views/data-report/Google-AdWords/SearchTerms/searchTerms.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    // territory: (resolve) => {
    //     import('@/views/data-report/Google-AdWords/territory/territory.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    // traffic: (resolve) => {
    //     import('@/views/data-report/Traffic/traffic.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    inquiry_statistics: (resolve) => {
        import(
            '@/views/data-report/inquiry-statistics/inquiry_statistics.vue'
        ).then((module) => {
            resolve(module);
        });
    },
    leads_statistics: (resolve) => {
        import(
            '@/views/data-report/leads-statistics/leads_statistics.vue'
        ).then((module) => {
            resolve(module);
        });
    },
    customer_statistics: (resolve) => {
        import(
            '@/views/data-report/customer-statistics/customer_statistics.vue'
        ).then((module) => {
            resolve(module);
        });
    },
    traffic_statistics: (resolve) => {
        import(
            '@/views/data-report/website-traffic-statistics/traffic_statistics.vue'
        ).then((module) => {
            resolve(module);
        });
    },
    message_statistics: (resolve) => {
        import(
            '@/views/data-report/message-statistics/message_statistics.vue'
        ).then((module) => {
            resolve(module);
        });
    },
    conversation_statistics: (resolve) => {
        import(
            '@/views/data-report/conversation-statistics/conversation_statistics.vue'
        ).then((module) => {
            resolve(module);
        });
    },
    // dialog_report: (resolve) => {
    //     import('@/views/data-report/dialog-report/dialog-report.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    service_report: (resolve) => {
        import('@/views/data-report/service-report/service-report.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    // message_report: (resolve) => {
    //     import('@/views/data-report/message-report/message-report.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    // clue_report: (resolve) => {
    //     import('@/views/data-report/clue-report/clue-report.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    // customs_data: (resolve) => {
    //     import('@/views/customs-data/customs-data.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    // station_letters: (resolve) => {
    //     import('@/views/letters').then((module) => {
    //         resolve(module)
    //     })
    // },
    google_ads_binding: (resolve) => {
        // import('@/views/systemSettings/google-binding/google-ads-binding/GoogleAdsBinding.vue').then((module) => {
        import(
            '@/views/systemSettings/google-binding/google-ads-binding/index.vue'
        ).then((module) => {
            resolve(module);
        });
    },
    google_analytics_bind: (resolve) => {
        import(
            '@/views/systemSettings/google-binding/google-analytics-binding/index.vue'
        ).then((module) => {
            resolve(module);
        });
    },
    distribution: (resolve) => {
        import('@/views/systemSettings/distribution/distribution.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    fb_distribution: (resolve) => {
        import(
            '@/views/systemSettings/fb-distribution/fb-distribution.vue'
        ).then((module) => {
            resolve(module);
        });
    },
    notice_setting: (resolve) => {
        import('@/views/systemSettings/system_notice/notice-setting.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    automated_allocation: (resolve) => {
        import('@/views/systemSettings/automated_allocation/index.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    automated_mail: (resolve) => {
        import('@/views/systemSettings/automated_mail/automated_mail.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    portal_set: (resolve) => {
        import('@/views/systemSettings/portalSet/portalSet.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    business_params_set: (resolve) => {
        import(
            '@/views/systemSettings/business-params-set/business_params_set.vue'
        ).then((module) => {
            resolve(module);
        });
    },
    business_association_settings: (resolve) => {
        import(
            '@/views/systemSettings/business_association_settings/business_association_settings.vue'
        ).then((module) => {
            resolve(module);
        });
    },
    // WhatsApp设置改成了WhatsApp api 群发规则,注掉这个代码
    // whatsapp_setting: (resolve) => {
    //     import('@/views/systemSettings/whatsapp-setting/whatsapp-setting.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    languages_set: (resolve) => {
        import('@/views/language-set/editable-table.vue').then((module) => {
            resolve(module);
        });
    },
    block_ip_address: (resolve) => {
        import('@/views/systemSettings/portalSet/ipBlackList/ipBlackList').then(
            (module) => {
                resolve(module);
            }
        );
    },
    form: (resolve) => {
        import(
            '@/views/systemSettings/form-setting/form-setting-container.vue'
        ).then((module) => {
            resolve(module);
        });
    },
    // // AMP_bind: (resolve) => {
    // //     import('@/views/systemSettings/form-setting/AMP_bind/AMP_bind.vue').then((module) => {
    // //         resolve(module)
    // //     })
    // // },
    chat_code: (resolve) => {
        import('@/views/systemSettings/portalSet/chatCode/chatCode').then(
            (module) => {
                resolve(module);
            }
        );
    },
    // service_online: (resolve) => {
    //     import('@/views/systemSettings/portalSet/serviceOnline/serviceOnline').then((module) => {
    //         resolve(module)
    //     })
    // },
    // service_offline: (resolve) => {
    //     import('@/views/systemSettings/portalSet/serviceOffline/serviceOffline').then((module) => {
    //         resolve(module)
    //     })
    // },
    script_set: (resolve) => {
        import('@/views/systemSettings/portalSet/verbal/verbal').then(
            (module) => {
                resolve(module);
            }
        );
    },

    // // authority: (resolve) => {
    // //     import('@/views/authority/authority.vue').then((module) => {
    // //         resolve(module)
    // //     })
    // // },
    //
    authority: (resolve) => {
        import('@/views/authority/authority-list.vue').then((module) => {
            resolve(module);
        });
    },
    //
    // audiences: (resolve) => {
    //     import('@/views/Google-optimize/audiences/audiences.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    close_loop: (resolve) => {
        import('@/views/Google-optimize/close-loop/close-loop.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    select_template: (resolve) => {
        import('@/views/word-press/select-template/select-template.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    // product: (resolve) => {
    //     import('@/views/product/product.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    // product_setting: (resolve) => {
    //     import('@/views/systemSettings/product-setting/product-setting.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    // // user_management: (resolve) => {
    // //     import('@/views/authority/user-management/user-management.vue').then((module) => {
    // //         resolve(module)
    // //     })
    // // },
    // // functional_permissions: (resolve) => {
    // //     import('@/views/authority/functional-permissions/functional-permissions.vue').then((module) => {
    // //         resolve(module)
    // //     })
    // // },
    // // administrative_authority: (resolve) => {
    // //     import('@/views/authority/administrative-authority/administrative-authority.vue').then((module) => {
    // //         resolve(module)
    // //     })
    // // },
    // // field_permissions: (resolve) => {
    // //     import('@/views/authority/field-permissions/field-permissions.vue').then((module) => {
    // //         resolve(module)
    // //     })
    // // },
    company_overview: (resolve) => {
        import('@/views/company-overview/company-overview.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    highSeasSetting: (resolve) => {
        import(
            '@/views/systemSettings/high-seas-setting/highSeasSetting.vue'
        ).then((module) => {
            resolve(module);
        });
    },
    // whatsapp_chat: (resolve) => {
    //     import('@/views/whatsapp-manage/index.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    // whatsapp_search: (resolve) => {
    //     import('@/views/whatsapp-search/whatsapp-search.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    // whatsapp_group_tasklist: (resolve) => {
    //     import('@/views/whatsapp-group-log/index.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    goalSetting: (resolve) => {
        import('@/views/systemSettings/goal-setting/goal-setting.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    marketing_activities: (resolve) => {
        import('@/views/email-marketing/marketing-activities/index.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    // abnormal_details: (resolve) => {
    //     import('@/views/systemSettings/abnormal_setting/abnormalDetails.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    // abnormal_notification: (resolve) => {
    //     import('@/views/systemSettings/abnormal_setting/abnormal_notification.vue').then((module) => {
    //         resolve(module)
    //     })
    // },
    address_book: (resolve) => {
        import('@/views/email-marketing/email-address/index.vue').then(
            (module) => {
                resolve(module);
            }
        );
    },
    // whatsapp_group_send_rule:(resolve)=>{
    //     import('@/views/systemSettings/whatsapp-setting/whatsapp_group_send_rule.vue').then((module) => {
    //         resolve(module)
    //     })
    // }
    google_search_console: (resolve) => {
        import('@/views/Google-search-console/index.vue').then((module) => {
            resolve(module);
        });
    },
    google_search_console_bind: (resolve) => {
        import(
            '@/views/systemSettings/google-binding/google-search-console-binding/index.vue'
        ).then((module) => {
            resolve(module);
        });
    },
    autoGenArticle: (resolve) => {
        import('@/views/autoGenArticle/index.vue').then((module) => {
            resolve(module);
        });
    },
    openApi: (resolve) => {
        import('@/views/systemSettings/openApi/index.vue').then((module) => {
            resolve(module);
        });
    },
    aiToolbar: (resolve) => {
        import('@/views/ai-toolbar/settings/index.vue').then((module) => {
            resolve(module);
        });
    },
    communication: (resolve) => {
        import('@/views/communication/index.vue').then((module) => {
            resolve(module);
        });
    }
};

// 根据 getMenu 请求返回的 menu 数组, 得到全量目录路由数组( main 目录数组 + 设置目录数组)
export function HANDLE_MENU_JSON(json) {
    return json.map(item => {
        if (item.path) {
            // 暂存对象
            let obj = {
                meta: {}
            };
            switch (item.path) {
                case 'system_settings':
                    if (item.children) {
                        obj = {
                            path: '/systemSettings',
                            name: 'systemSettings',
                            title: {
                                i18n: 'menu.system_settings'
                            },
                            icon: 'custom custom-menu-setting',
                            component: mainVue,
                            children: item.children.map(child_item => {
                                let child_obj = {
                                    meta: {
                                        id: child_item.id
                                    }
                                };
                                child_obj.icon = `custom custom-${ICON_OBJ[child_item.path]}`;
                                if (child_item.children && child_item.children.length) {
                                    child_obj.path = child_item.path;
                                    child_obj.name = child_item.path;
                                    child_obj.title = {
                                        i18n: 'menu.' + child_item.path
                                    };
                                    child_obj.component = resolve => require(['@/views/main-components/parent-view'], resolve);
                                    child_obj.children = child_item.children.map(child_next_item => {
                                        return {
                                            meta: {
                                                id: child_next_item.id
                                            },
                                            path: child_next_item.path,
                                            name: child_next_item.path,
                                            title: {
                                                i18n: 'menu.' + child_next_item.path
                                            },
                                            component: ROUTER_LIST[child_next_item.path]
                                        };
                                    })
                                } else {
                                    child_obj.path = child_item.path;
                                    child_obj.name = child_item.path;
                                    child_obj.title = {
                                        i18n: 'menu.' + child_item.path
                                    };
                                    child_obj.component = ROUTER_LIST[child_item.path];
                                }

                                return child_obj;
                            })
                        }
                    } else {
                        obj = null;
                    }
                        break;
                case 'home':
                    obj.path = '/';
                    obj.icon = 'custom custom-menu-dashBoard';
                    obj.title = { i18n: 'menu.dashBoard' };
                    obj.name = 'home';
                    obj.component = (resolve) =>
                        require(['@/views/Main.vue'], resolve);
                    obj.children = [
                        {
                            path: 'home',
                            title: { i18n: 'menu.dashBoard' },
                            name: 'home_index',
                            component: (resolve) =>
                                require([
                                    '@/views/dashBoard/testIndex.vue'
                                ], resolve)
                        }
                    ];
                    break;
                case 'communication':
                    obj.path = `/${item.path}`;
                    obj.icon = `custom custom-${ICON_OBJ[item.path]}`;
                    obj.title = {
                        i18n: 'menu.' + item.path
                    };
                    obj.name = `${item.path}_home`;
                    obj.component = (resolve) => require(['@/views/Main.vue'], resolve);
                    const arr = JSON.parse(JSON.stringify(item.children));
                    obj.children = [
                        {
                            path: '',
                            title: {
                                i18n: 'menu.communication_home'
                            },
                            name: arr[0].path,
                            component: resolve => require(['@/views/communication/index.vue'], resolve)
                        }
                    ]
                    if (arr) {
                        obj.meta.id = item.id;
                        obj.children[0].children = arr.map((child_item) => {
                            let child_obj = {
                                meta: {
                                    id: child_item.id
                                }
                            };
                            child_obj.path = child_item.path;
                            child_obj.name = child_item.path;
                            child_obj.title = {
                                i18n: 'menu.' + child_item.path
                            };
                            child_obj.component = ROUTER_LIST[child_item.path];
                            return child_obj;
                        });
                    }
                    break;
                case 'mail':
                    obj.path = '/';
                    obj.icon = 'custom custom-menu-mail';
                    obj.title = {
                        i18n: 'menu.mail_home'
                    };
                    //obj.name = 'mail_home';
                    obj.component = (resolve) =>
                        require(['@/views/Main.vue'], resolve);
                    obj.children = [
                        {
                            path: 'mail_home',
                            title: {
                                i18n: 'menu.mail_home'
                            },
                            name: 'mail_home'
                            // component: resolve => require(['@/views/mail/mail-home/mail-home.vue'], resolve)
                        }
                    ];
                    break;
                case 'whatsapp_manage':
                    obj.path = `/${item.path}`;
                    obj.icon = `custom custom-${ICON_OBJ[item.path]}`;
                    obj.name = `${item.path}_home`;
                    obj.component = (resolve) =>
                        require(['@/views/Main.vue'], resolve);
                    obj.title = {
                        i18n: 'menu.' + item.path
                    };
                    if (item.children) {
                        obj.meta.id = item.id;
                        const arr = [];
                        item.children.forEach((child_item) => {
                            let child_obj = {
                                meta: {
                                    id: child_item.id
                                }
                            };
                            child_obj.path = child_item.path;
                            child_obj.name = child_item.path;
                            child_obj.title = {
                                i18n: 'menu.' + child_item.path
                            };
                            child_obj.component =
                                ROUTER_LIST[child_item.path];
                            if (child_item.path === 'whatsapp_chat') {
                                // 需要给whatsapp聊天做进一步的权限判断(之前是判断title,改为判断id)
                                // 11038(线上环境)、11039(测试环境)
                                const chatPermissionArr = [11038, 11039];
                                if (
                                    child_item.children &&
                                    child_item.children.some(
                                        (child_child_item) =>
                                            chatPermissionArr.includes(
                                                child_child_item.id
                                            )
                                    )
                                ) {
                                    arr.push(child_obj);
                                }
                            } else {
                                arr.push(child_obj);
                            }
                        });
                        obj.children = arr;
                    } else {
                        obj.children = [
                            {
                                meta: {
                                    id: item.id
                                },
                                title: {
                                    i18n: 'menu.' + item.path
                                },
                                path: 'index',
                                name: item.path,
                                component: ROUTER_LIST[item.path]
                            }
                        ];
                    }

                    break;
                case 'enterpriseGPT':
                    obj.path = `/${item.path}`;
                    obj.icon = `custom custom-${ICON_OBJ[item.path]}`;
                    obj.name = `${item.path}_home`;
                    obj.component = (resolve) =>
                        require(['@/views/Main.vue'], resolve);
                    obj.title = {
                        i18n: 'menu.' + item.path
                    };
                    if (item.children) {
                        obj.meta.id = item.id;
                        const arr = [];
                        item.children.forEach((child_item) => {
                            let child_obj = {
                                meta: {
                                    id: child_item.id
                                }
                            };
                            child_obj.path = child_item.path;
                            child_obj.name = child_item.path;
                            child_obj.title = {
                                i18n: 'menu.' + child_item.path
                            };
                            child_obj.component =
                                ROUTER_LIST[child_item.path];

                            // 特殊处理 --- 产品要求, 企业 GPT 页面, 知识库页面, 需要判断按钮权限
                            switch (child_item.path) {
                                case 'enterpriseGPT':
                                    if (
                                        child_item.children &&
                                        child_item.children.some(
                                            (child_child_item) =>
                                                child_child_item.id ===
                                                11150
                                        )
                                    ) {
                                        arr.push(child_obj);
                                    }
                                    break;
                                case 'knowledgeBase':
                                    if (
                                        child_item.children &&
                                        child_item.children.some(
                                            (child_child_item) =>
                                                child_child_item.id ===
                                                11154
                                        )
                                    ) {
                                        arr.push(child_obj);
                                    }
                                    break;
                                default:
                                    arr.push(child_obj);
                            }
                        });
                        obj.children = arr;
                    } else {
                        obj.children = [
                            {
                                meta: {
                                    id: item.id
                                },
                                title: {
                                    i18n: 'menu.' + item.path
                                },
                                path: 'index',
                                name: item.path,
                                component: ROUTER_LIST[item.path]
                            }
                        ];
                    }

                    break;
                default:
                    obj.path = `/${item.path}`;
                    obj.icon = `custom custom-${ICON_OBJ[item.path]}`;
                    obj.name = `${item.path}_home`;
                    obj.component = (resolve) =>
                        require(['@/views/Main.vue'], resolve);
                    obj.title = {
                        i18n: 'menu.' + item.path
                    };
                    if (
                        item.path === 'my_clue' &&
                        item.title === '线索管理'
                    ) {
                        console.log('store', item);
                        obj.title = {
                            i18n: 'menu.clue_manage'
                        };
                    }
                    if (item.children) {
                        obj.meta.id = item.id;
                        obj.children = item.children.map((child_item) => {
                            let child_obj = {
                                meta: {
                                    id: child_item.id
                                }
                            };
                            child_obj.path = child_item.path;
                            child_obj.name = child_item.path;
                            child_obj.title = {
                                i18n: 'menu.' + child_item.path
                            };
                            child_obj.component =
                                ROUTER_LIST[child_item.path];
                            return child_obj;
                        });
                    } else {
                        if (
                            item.path === 'my_clue' &&
                            item.title === '线索管理'
                        ) {
                            obj.children = [
                                {
                                    meta: {
                                        id: item.id
                                    },
                                    title: {
                                        i18n: 'menu.clue_manage'
                                    },
                                    path: 'index',
                                    name: item.path,
                                    component: ROUTER_LIST[item.path]
                                }
                            ];
                        } else {
                            obj.children = [
                                {
                                    meta: {
                                        id: item.id
                                    },
                                    title: {
                                        i18n: 'menu.' + item.path
                                    },
                                    path: 'index',
                                    name: item.path,
                                    component: ROUTER_LIST[item.path]
                                }
                            ];
                        }
                    }
            }
            // 返回结果
            return obj;
        }
    })
    .filter((item) => item);
}

// 页面切换时替换标签页 title (切换到 refresh 页面不替换)
const routerTitle = {
    leads: i18n.t('leads'),
    // home: i18n.t('menu.home'),
    home_index: i18n.t('menu.dashBoard'),
    xhl_chat: i18n.t('menu.xhl_chat'),
    visitor_history: i18n.t('menu.visitor_history'),
    website_message: i18n.t('menu.website_message'),
    clueManage: i18n.t('menu.clue_manage'),
    common_sea_customer: i18n.t('menu.common_sea_customer'),
    set_clue: i18n.t('menu.set_clue'),
    workBench: i18n.t('menu.workBench'),
    customerCheck: i18n.t('menu.customerCheck'),
    customerManage: i18n.t('menu.myCustomer'),
    customerhighsea: i18n.t('menu.highseasCustomer'),
    leadhighsea: i18n.t('menu.common_sea_customer'),
    highseasCustomer: i18n.t('menu.highseasCustomer'),
    myInquiry: i18n.t('menu.myInquiry'),
    contactManage: i18n.t('menu.myContact'),
    dataMovement: i18n.t('menu.dataMovement'),
    aliImportCRX: i18n.t('menu.aliImportCRX'),
    set_up_shared_domain_name: i18n.t('menu.set_up_shared_domain_name'),
    my_name_card: i18n.t('menu.my_name_card'),
    database: i18n.t('menu.database'),
    cloud_push: i18n.t('menu.cloud_push'),
    access_record: i18n.t('menu.access_record'),
    inquirySetting: i18n.t('menu.inquirySetting'),
    universalSetting: i18n.t('menu.universalSetting'),
    mail_home: i18n.t('menu.mail_home'),
    mail: i18n.t('menu.mail'),
    mailSinglePageMailDetail: i18n.t('menu.mailDetail'),
    mail_set: i18n.t('menu.mail_set'),
    social_reporting: i18n.t('menu.social_reporting'),
    account_binding: i18n.t('menu.account_binding'),
    ad_account_binding: i18n.t('menu.ad_account_binding'),
    one_key_release: i18n.t('menu.one_key_release'),
    homepage_dynamic: i18n.t('menu.homepage_dynamic'),
    inbox: i18n.t('menu.inbox'),
    form_bind: i18n.t('menu.form_bind'),
    fb_message: i18n.t('menu.fb_message'),
    b2b_platform: i18n.t('menu.b2b_platform'),
    integration: i18n.t('menu.integration'),
    google_ad_words: i18n.t('menu.google_ad_words'),
    ad: i18n.t('menu.ad'),
    account: i18n.t('menu.account'),
    ad_series: i18n.t('menu.ad_series'),
    ad_group: i18n.t('menu.ad_group'),
    // comment_able: i18n.t('menu.comment_able'),
    keywords: i18n.t('menu.keywords'),
    search_terms: i18n.t('menu.search_terms'),
    territory: i18n.t('menu.territory'),
    traffic: i18n.t('menu.traffic'),
    inquiry_statistics: i18n.t('menu.inquiry_statistics'),
    leads_statistics: i18n.t('menu.leads_statistics'),
    customer_statistics: i18n.t('menu.customer_statistics'),
    traffic_statistics: i18n.t('menu.traffic_statistics'),
    message_statistics: i18n.t('menu.message_statistics'),
    conversation_statistics: i18n.t('menu.conversation_statistics'),
    dialog_report: i18n.t('menu.dialog_report'),
    service_report: i18n.t('menu.service_report'),
    message_report: i18n.t('menu.message_report'),
    clue_report: i18n.t('menu.clue_report'),
    customs_data: i18n.t('menu.customs_data'),
    // station_letters: i18n.t('menu.station_letters'),
    google_ads_binding: i18n.t('menu.google_ads_binding'),
    google_analytics_bind: i18n.t('menu.google_analytics_bind'),
    distribution: i18n.t('menu.distribution'),
    fb_distribution: i18n.t('menu.fb_distribution'),
    notice_setting: i18n.t('menu.notice_setting'),
    automated_allocation: i18n.t('menu.automated_allocation'),
    automated_mail: i18n.t('menu.automated_mail'),
    portal_set: i18n.t('menu.portal_set'),
    business_params_set: i18n.t('menu.business_params_set'),
    whatsapp_setting: i18n.t('menu.whatsapp_setting'),
    languages_set: i18n.t('menu.languages_set'),
    block_ip_address: i18n.t('menu.block_ip_address'),
    form_setting: i18n.t('menu.form_setting'),
    universal_setting: i18n.t('menu.universal_setting'),
    authority: i18n.t('menu.authority'),
    // audiences: i18n.t('menu.audiences'),
    close_loop: i18n.t('menu.close_loop'),
    product: i18n.t('menu.product'),
    product_setting: i18n.t('menu.product_setting'),
    company_overview: i18n.t('menu.company_overview'),
    whatsapp_manage: i18n.t('menu.whatsapp_manage'),
    whatsapp_chat: i18n.t('menu.whatsapp_chat'),
    whatsapp_search: i18n.t('menu.whatsapp_search'),
    whatsapp_group_tasklist: i18n.t('menu.whatsapp_group_tasklist'),
    whatsapp_management: i18n.t('menu.whatsapp_management'),
    website_manager: i18n.t('menu.website_manager'),
    AMP_bind: i18n.t('menu.AMP_bind'),
    highSeasSetting: i18n.t('menu.highSeasSetting'),
    set: i18n.t('per_setting.personalSetting'),
    globalSearch: i18n.t('globalSearch.title'),
    chat_code: i18n.t('portal_set.chat_set'),
    service_online: i18n.t('portal_set.service_online'),
    service_offline: i18n.t('portal_set.service_offline'),
    script_set: i18n.t('portal_set.script_set'),
    writeMail: i18n.t('letters.WriteLetter'),
    email_marketing: i18n.t('menu.email_marketing'),
    marketing_activities: i18n.t('menu.marketing_activities'),
    address_book: i18n.t('menu.address_book'),
    abnormal_details: i18n.t('menu.abnormal_details'),
    seo: i18n.t('menu.seo'),
    companyDetail: i18n.t('menu.companyDetail'),
    goalSetting: i18n.t('menu.goalSetting'),
    followUpRecord: i18n.t('menu.followUpRecord'),
    company_mail_magage: i18n.t('menu.company_mail_magage'),
    whatsapp_group_send_rule: i18n.t('menu.whatsapp_group_send_rule'),
    followUpPlan: i18n.t('menu.followUpPlan'),
    google_search_console: i18n.t('menu.google_search_console'),
    google_search_console_bind: i18n.t('menu.google_search_console_bind'),
    whatsapp_microenterprise: i18n.t('menu.whatsapp_microenterprise'),
    calling_sms: i18n.t('menu.calling_sms'),
    autoGenArticle: i18n.t('menu.autoGenArticle'),
    openApi: i18n.t('menu.openApi'),
    enterpriseGPT: i18n.t('menu.enterpriseGPT'),
    knowledgeBase: i18n.t('menu.knowledgeBase'),
    usageRecord: i18n.t('menu.usageRecord'),
    bill: i18n.t('menu.bill'),
    aiToolbar: i18n.t('menu.aiToolbar'),
    opportunityManage: i18n.t('menu.opportunityManage'),
    touchPointContact: i18n.t('menu.touchPointContact'),
    followuprecordManage: i18n.t('menu.followuprecordManage'),
    noticeSetting: i18n.t('menu.noticeSetting')
};

let router_map = [];
if (localStorage.getItem('roleMenu')) {
    let menu = JSON.parse(localStorage.getItem('roleMenu'));
    router_map = HANDLE_MENU_JSON(menu);
}
// 路由配置
let routes = [...routers];
const HOST = window.location.host;
// 当前在 wa 个人版页面, 设置登录页为 wa 个人版登录页
if (/^(www\.)?wsmate\.com$/.test(HOST)) {
    // 替换登录页
    routes = routers.filter((route) => route.name !== 'login');
    routes.unshift(WALoginRouter);

    // 设置当前系统版本为 wa 个人版
    store.commit('setVersion', 'WAPersonalEdition');

    // 修改页面 title 为个人版
    routerTitle.login = i18n.t('waPersonalEdition');
} else if (/seashelllogistics\.leadscloud\.com$/.test(HOST)) {
    // 设置当前系统版本为 xx 客户定制版
    store.commit('setVersion', 'customFor_11729');
    // 修改页面 title 为个人版
    routerTitle.login = routerTitle.leads = i18n.t(
        store.state.customEditionConfig['customFor_11729'].routeTitle
    );
} else if (/hcyy\.leadscloud\.com$/.test(HOST)) {
    // 设置当前系统版本为 xx 客户定制版
    store.commit('setVersion', 'customFor_11802');
    // 修改页面 title 为个人版
    routerTitle.login = routerTitle.leads = i18n.t(store.state.customEditionConfig['customFor_11802'].routeTitle);
}else if (/singo\.leadscloud\.com$/.test(HOST)) {
    // 设置当前系统版本为 xx 客户定制版
    store.commit('setVersion', 'customFor_12200');
    // 修改页面 title 为个人版
    routerTitle.login = routerTitle.leads = store.state.customEditionConfig['customFor_12200'].routeTitle;
}

const RouterConfig = {
    // mode: 'history',
    routes
};
export const router = new VueRouter(RouterConfig);
router.addRoutes(router_map);

// 至多停止运行 N 秒, 除非 callback 提前完成请求
function sleepAtMost(ms, callback) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
        if (callback) {
            callback(resolve);
        }
    });
}

router.beforeEach(async (to, from, next) => {
    let ruleMap = childRules
        .map((ele) => {
            return ele.rule.map((item) => {
                return item.substring(1);
            });
        })
        .reduce(function (a, b) {
            return a.concat(b);
        });

    const map2 = ruleMap.find(function (ele) {
        return to.path.indexOf(ele) != -1;
    });
    if (!map2) {
        // 不是要跳转微应用取加载loading
        if (document.querySelector('#mask_child_loading')) {
            document.querySelector('#mask_child_loading').remove();
        }
    }

    // 没有任一健康检查 url
    if (!store.state.healthWAUrl || !store.state.healthFBUrl) {
        // 进行健康检查, 至多等待 2s , 到时间没请求完成就还是用默认的请求地址
        await sleepAtMost(2000, (resolveFunc) => {
            if (!store.state.healthFBUrl) {
                store.commit('checkHealthFBUrl', resolveFunc);
            }

            // 因为 CDN 线路(wa03)目前有问题, 阿里 CDN 可能造成丢包, 所以去掉 WA url 健康检查, 直接由 FB 健康检查完成对 杭州线路, 香港线路 的健康检查后赋值 wa url
            // if (!store.state.healthWAUrl) {
            //     store.commit('checkHealthWAUrl', resolveFunc);
            // }
        });
    }

    // 记录主应用跳转信息
    const { name, params } = to;
    store.commit('setJumpingRouterInfo', { name, params });

    // 邮件模块, 显示写信弹窗时, 禁止路由跳转, 由写信二次确认弹框确定是否跳转
    if (
        store.state.mail.writeMailModalVisible ||
        store.state.mail.mailTemplateModalVisible
    ) {
        store.state.mail.toRouterObj = { name, params };
        return;
    }

    // AI 模块, 显示场景设置弹窗时, 禁止路由跳转, 由场景设置二次确认弹框确定是否跳转
    if (store.state.ai.sceneSetPageVisible) {
        return;
    }

    // 微前端项目通用功能: 内容编辑中, 禁止基座路由跳转, 由子项目自己弹出二次确认弹框确定是否跳转
    if (initialState.editingState.value) {
        if (typeof initialState.editingState.beforeLeaveCb === 'function') {
            // 如果子应用传了回调函数, 执行回调

            // 暂存回调函数返回结果
            const block = await initialState.editingState.beforeLeaveCb();

            // 如果回调函数执行完毕要求阻塞, 则 return
            if (block) {
                return;
            }
        } else {
            // 默认阻塞, return

            return;
        }
    }

    if (to.name !== 'refresh') {
        // if(store.state.app.is_marketing_station && to.name === 'my_clue') {
        //     window.parent.document.title = i18n.t('menu.clue_manage');
        // } else {
        //     window.parent.document.title = routerTitle[to.name] || routerTitle.leads;
        // }
        window.parent.document.title =
            routerTitle[to.name] || routerTitle.leads;
    }
    // 存储更新后端标签页顶部 title 到 vuex
    store.state.sourceDocumentTitle = window.parent.document.title;

    /* if (!Cookies.get('token') && to.name !== 'login') { // 判断是否已经登录且前往的页面不是登录页

     }else if(!Cookies.get('token') && to.name === 'login'){

     }
     else if (Cookies.get('token') && to.name === 'login') { // 判断是否已经登录且前往的是登录页
       store.dispatch('google_analytics', {
         page:'home_index',
         url:'home'
       })
     }
     else {
       store.dispatch('google_analytics', {
         page:to.name,
         url:to.path
       })
     }*/

    const homePage = Cookies.get('HOMEPAGE');
    switch (to.name) {
        case 'authorizedLogin':
        case 'forgetPwd':
        case 'setUpPwd':
        case 'enterpriseGPT':
        case 'knowledgeBase':
        case 'usageRecord':
        case 'register':   
        case 'bill':
            setTimeout(() => {
                next();
            }, 0);
            break;
        case 'mail_home':
            //重置在邮件界面的vuex参数
            store.commit('setCurrentAccount', []);
            store.commit('set_subordinatesMailUnread', 0);
            store.commit('set_currentInputInfo', '');
            store.commit('set_currentPersonId', '');
            store.commit('set_currentSelectedIndex', 0);
            store.commit('set_beforeCheckInfo', []);
            setTimeout(() => {
                next();
                console.log('延迟跳转生效，解决刷新微应用项目 演示错乱问题');
            }, 0);
            break;
        case 'login':
            // 从 wa 个人版退出登录, 应当跳转到 wsmate 网址
            if (
                store.getters.isWAPersonalEdition &&
                !/^(www\.)?wsmate\.com$/.test(window.location.host)
            ) {
                localStorage.setItem('XHLLogin', 'LOGOUT');
                window.open('https://www.wsmate.com/#/login', '_self');
                return;
            }

            if (to.params.force === 'true') {
                // 之前 jump_to_login 方法, 为了导航到 login 界面时强制显示登录页(而不是因为已存在的 token 直接进入系统), 加的 force 相关逻辑
                // 现在 jump_to_login 改为刷新登录页了, 此属性暂时不用了, 先留着看看以后有没有别的地方要用

                next();
            } else if (Cookies.get('token')) {
                next({
                    name: homePage
                });
            } else {
                next();
            }
            break;
        case 'home':
            if (Cookies.get('token')) {
                if (homePage !== 'home') {
                    next({
                        name: homePage
                    });
                } else {
                    setTimeout(() => {
                        next({
                            name: 'home_index'
                        });
                    }, 0);
                }
            } else {
                next({
                    name: 'login'
                });
            }
            break;
        case 'locking':
            if (Cookies.get('locking') === '0') {
                next(false);
            } else {
                next();
            }
            break;
        case 'myCustomer':
            if (localStorage.getItem('leadsCloud-companyId')) {
                util.ajax({
                    url: 'crm/mailbox/isHaveAuthorityByCompanyId',
                    method: 'get',
                    params: {
                        userId: store.state.userId || Cookies.get('userId'),
                        orgId:
                            store.state.enterpriseId ||
                            Cookies.get('enterpriseId'),
                        companyId: localStorage.getItem('leadsCloud-companyId')
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        switch (res.data.data + '') {
                            case '1':
                                // ViewUI.LoadingBar.start();
                                next();
                                break;
                            case '2':
                                localStorage.removeItem('leadsCloud-companyId');
                                Message.warning(
                                    i18n.t(
                                        'crm.Modal.error_JumpCustomerInHighseas'
                                    )
                                );
                                break;
                            case '3':
                                localStorage.removeItem('leadsCloud-companyId');
                                Message.warning(
                                    i18n.t('crm.Modal.error_JumpCustomerMerged')
                                );
                                break;
                            // 该账号没有管理权限
                            default:
                                localStorage.removeItem('leadsCloud-companyId');
                                Message.warning(
                                    i18n.t(
                                        'crm.Modal.error_JumpCustomerHaveNoPermission'
                                    )
                                );
                        }
                    } else {
                        localStorage.removeItem('leadsCloud-companyId');
                        Message.error(
                            i18n.t(
                                'crm.Modal.error_JumpCustomerHaveNoPermission'
                            )
                        );
                    }
                });
            } else {
                setTimeout(() => {
                    next();
                    console.log('延迟跳转生效，myContact');
                }, 0);
            }
            break;
        case 'myInquiry':
            if (localStorage.getItem('leadsCloud-inquiryId')) {
                util.ajax({
                    url: 'crm/mailbox/isHaveAuthority',
                    method: 'get',
                    params: {
                        userId: store.state.userId || Cookies.get('userId'),
                        orgId:
                            store.state.enterpriseId ||
                            Cookies.get('enterpriseId'),
                        inquiryId: localStorage.getItem('leadsCloud-inquiryId')
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        switch (res.data.data + '') {
                            case '1':
                                // ViewUI.LoadingBar.start();
                                next();
                                break;
                            case '2':
                                localStorage.removeItem('leadsCloud-inquiryId');
                                Message.warning(
                                    i18n.t(
                                        'crm.Modal.error_JumpInquiryInHighseas'
                                    )
                                );
                                break;
                            case '3':
                                localStorage.removeItem('leadsCloud-inquiryId');
                                Message.warning(
                                    i18n.t('crm.Modal.error_JumpInquiryMerged')
                                );
                                break;
                            // 该账号没有管理权限
                            default:
                                localStorage.removeItem('leadsCloud-inquiryId');
                                Message.warning(
                                    i18n.t(
                                        'crm.Modal.error_JumpInquiryHaveNoPermission'
                                    )
                                );
                        }
                    } else {
                        localStorage.removeItem('leadsCloud-inquiryId');
                        Message.error(
                            i18n.t(
                                'crm.Modal.error_JumpInquiryHaveNoPermission'
                            )
                        );
                    }
                });
            } else {
                setTimeout(() => {
                    next();
                }, 0);
            }
            break;
        case 'myContact':
            if (localStorage.getItem('leadsCloud-contactId')) {
                util.ajax({
                    url: 'crm/mailbox/isHaveAuthorityForContacts',
                    method: 'get',
                    params: {
                        userId: store.state.userId || Cookies.get('userId'),
                        orgId:
                            store.state.enterpriseId ||
                            Cookies.get('enterpriseId'),
                        contactsId: localStorage.getItem('leadsCloud-contactId')
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        switch (res.data.data + '') {
                            case '1':
                            case '2':
                                // ViewUI.LoadingBar.start();
                                next();
                                break;
                            /**
                             * @Description: 公海管理联系人也允许跳转
                             * @author mayuanzhi
                             * @date 2020/4/29
                             */
                            // case '2':
                            //     localStorage.removeItem('leadsCloud-contactId');
                            //     Message.warning(i18n.t('crm.Modal.error_JumpContactInHighseas'));
                            //     break;
                            case '3':
                                localStorage.removeItem('leadsCloud-contactId');
                                Message.warning(
                                    i18n.t('crm.Modal.error_JumpContactMerged')
                                );
                                break;
                            // 该账号没有管理权限
                            default:
                                localStorage.removeItem('leadsCloud-contactId');
                                Message.warning(
                                    i18n.t(
                                        'crm.Modal.error_JumpContactHaveNoPermission'
                                    )
                                );
                        }
                    } else {
                        localStorage.removeItem('leadsCloud-contactId');
                        Message.error(
                            i18n.t(
                                'crm.Modal.error_JumpContactHaveNoPermission'
                            )
                        );
                    }
                });
            } else {
                setTimeout(() => {
                    next();
                }, 0);
            }
            break;
        case 'my_clue':
            if (localStorage.getItem('leadsCloud-clueId')) {
                util.ajax({
                    url: 'form-cust/form/isHaveAuthority',
                    method: 'get',
                    params: {
                        userId: store.state.userId || Cookies.get('userId'),
                        orgId:
                            store.state.enterpriseId ||
                            Cookies.get('enterpriseId'),
                        clueId: localStorage.getItem('leadsCloud-clueId')
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        switch (res.data.data + '') {
                            case '1':
                                // ViewUI.LoadingBar.start();
                                next();
                                break;
                            case '2':
                                localStorage.removeItem('leadsCloud-clueId');
                                Message.warning(
                                    i18n.t('crm.Modal.error_JumpClueInHighseas')
                                );
                                break;
                            // 该账号没有管理权限
                            default:
                                localStorage.removeItem('leadsCloud-clueId');
                                Message.warning(
                                    i18n.t(
                                        'crm.Modal.error_JumpClueHaveNoPermission'
                                    )
                                );
                        }
                    } else {
                        localStorage.removeItem('leadsCloud-clueId');
                        Message.error(
                            i18n.t('crm.Modal.error_JumpClueHaveNoPermission')
                        );
                    }
                });
            } else {
                setTimeout(() => {
                    next();
                }, 0);
            }
            break;
        case 'whatsapp_microenterprise':
            // 进入企业微信之前调用登录接口获取cookie发送给插件的background
            // 暂时注释 登录逻辑改为在插件里登录
            // util.ajaxJson({
            // url: '/qiyewx/user/login',
            // method: 'post',
            // data: {
            //     orgId: store.state.enterpriseId,
            //     userId: store.state.userId,
            //     realname: store.state.fullName,
            //     password: store.state.userName,
            //     username:store.state.userName,
            // }
            // }).then(res =>{
            //     // console.log(res);
            //     const seCookieForIfram = new CustomEvent('setCookieForIframe', {detail: JSON.stringify(res) });
            //     document.body.dispatchEvent(seCookieForIfram);
            //     next();
            // })
            next();
            break;
        default:
            // 带 waLoginUuid 跳转 refresh 页面时, 忽略 cookie 进入页面 --- refresh 内部自己处理 wa 个人版登录逻辑
            if (
                to.name === 'refresh' &&
                window.location.href.includes('waLoginUuid')
            ) {
                setTimeout(() => {
                    next();
                }, 0);
                return;
            }

            // 正常逻辑
            if (Cookies.get('locking') === '1') {
                next({
                    replace: true,
                    name: 'locking'
                });
            } else if (!Cookies.get('token')) {
                next({
                    name: 'login'
                });
            } else {
                // setTimeout(() => {
                    next(true);
                // }, 0);
            }
    }
});
const readyCallback = (res) => {
    console.log(res);
}
const errorCallback = (err) => {
    console.log(err);
}
router.onReady(readyCallback, [errorCallback])
router.onError(errorCallback)
// 路由跳转后钩子
router.afterEach((to) => {
    // // 跳转后清空跳转信息
    // store.commit('setJumpingRouterInfo', null);
    util.openNewPage(router.app, to.name, to.params, to.query);
    // ViewUI.LoadingBar.finish();
    window.scrollTo(0, 0);

    // 跳转到 404 页面
    if (to.name === 'error-404') {
        switch (location.hash) {
            case '#/websiteInteraction/visitor_history':
                Message.error(
                    i18n.t('crm.Modal.error_haveNoPermissionVisitorHistory')
                );
                break;
            case '#/websiteInteraction/website_message':
                Message.error(
                    i18n.t('globalSearch.dashBoardHaveNoPermissionWebsiteMsg')
                );
                break;
        }
    }
});

// 清空动态路由方法, 防止 addRoutes 重复添加路由
export function resetRouter() {
    const newRouter = new VueRouter(RouterConfig);
    router.matcher = newRouter.matcher;
}
