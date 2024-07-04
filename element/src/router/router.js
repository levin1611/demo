// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
    path: '/login',
    name: 'login',
    meta: {
        title: 'Login - 登录'
    },
    // component: resolve => require(['@/views/login/login.vue'], resolve)
};

// 注册页面
export const registerRouter = {
    path: '/register',
    name: 'register',
    meta: {
        title: 'Login - 登录'
    }
};

// 注册页面
export const gatePassDetailRouter = {
    path: '/gatePassDetail',
    name: 'gatePassDetail',
    meta: {
        title: 'Login - 登录'
    }
};

export const ForgetPwd = {
    path: '/login/forgetPwd',
    name: 'forgetPwd',
    meta: {
        title: 'Login - 忘记密码'
    },
    component: resolve => require(['@/views/login/forgetPwd.vue'], resolve)
};

export const setUpPwd = {
    path: '/login/setUpPwd',
    name: 'setUpPwd',
    meta: {
        title: 'Login - 重置密码'
    },
    component: resolve => require(['@/views/login/setUpNewPwd.vue'], resolve)
};

// cinnox授权登陆页面
export const authorizedLogin = {
    path: '/authorizedLogin',
    name: 'authorizedLogin',
    meta: {
        title: '询盘云授权登陆'
    },
    component: resolve => require(['@/views/login/authorizedLogin.vue'], resolve)
};

// export const writeMail = {
//     path: '/writeMail',
//     name: 'writeMail',
//     meta: {
//         title: '写邮件'
//     },
//     component: resolve => require(['@/views/mail/mail-home/components/write-mail/write-mail.vue'], resolve)
// };
export const mail = {
    path: '/mail',
    name: 'mailSinglePage',
    component: resolve => require(['@/views/mail/mail-home/mailSinglePage.vue'], resolve),
    children: [
        {
            path: 'writeMail',
            name: 'mailSinglePagewriteMail',
            title: '写邮件',
            component: resolve => require(['@/views/mail/mail-home/components/write-mail/write-mail.vue'], resolve)
        },
        {
            path: 'mailDetail',
            name: 'mailSinglePageMailDetail',
            title: '邮件详情',
            component: resolve => require(['@/views/mail/mail-home/components/MailDetail.vue'], resolve)
        }
    ]
};

// export const mailDetail = {
//     path: '/mailDetail',
//     name: 'mailDetail',
//     meta: {
//         title: '邮件详情'
//     },
//     component: resolve => require(['@/views/mail/mail-home/components/MailDetail.vue'], resolve)
// };

// export const timeRouter = {
//     path: '/time_line',
//     name: 'time_line',
//     meta: {
//         title: 'Login - 登录'
//     },
//     component: resolve => require(['@/views/main-components/timeline/index.vue'], resolve)
// }

// export const errorBrowser = {
//     path: '/browser',
//     name: 'browser',
//     meta: {
//         title: '浏览器不支持'
//     },
//     component: resolve => require(['@/views/browser/browser.vue'], resolve)
// };

export const page404 = {
    path: '*',
    meta: {
        title: '404-页面不存在'
    },
    name: 'error-404',
    component: resolve => require(['@/views/error-page/404.vue'], resolve)
};
export const page403 = {
    path: '/403',
    name: 'error-403',
    meta: {
        title: '403-权限不足'
    },
    component: resolve => require(['@/views/error-page/403.vue'], resolve)
};
export const page500 = {
    path: '/500',
    meta: {
        title: '500-服务端错误'
    },
    name: 'error-500',
    component: resolve => require(['@/views/error-page/500.vue'], resolve)
};
export const indexRouter = {
    path: '/crm',
    meta: {
        title: '仪表盘'
    },
    name: 'crm_home',
    component: resolve => require(['@/views/Main.vue'], resolve),
    children: [
        {
            path: 'myCustomer',
            title: '用户列表',
            name: 'myCustomer',
            component: resolve => require(['@/views/crm/Table/myCustomer.vue'], resolve)
        }
    ]
};

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
    path: '/',
    name: 'otherRouter',
    // redirect: '/home_index',
    component: resolve => require(['@/views/Main.vue'], resolve),
    children: [
        {
            path: 'personal-set',
            title: '个人设置',
            name: 'set',
            component: resolve => require(['@/views/personal-set/set.vue'], resolve)
        },
        {
            path: 'refresh',
            meta: {
                title: ''
            },
            name: 'refresh',
            component: resolve => require(['@/views/main-components/refresh.vue'], resolve)
        },
        {
            path: 'global-search',
            name: 'global-search',
            title: { i18n: 'globalSearch.title' },
            component: resolve => require(['@/views/main-components/global-search-results.vue'], resolve)
        },
        {
            path: 'companyDetail',
            name: 'companyDetail',
            title: { i18n: 'menu.companyDetail' },
            component: resolve => require(['@/views/crm/Detail/companyDetail.vue'], resolve)
        }
        // {
        //     path: 'message',
        //     title: {i18n: 'menu.msgCenter'},
        //     name: 'message',
        //     component: resolve => require(['@/views/message'], resolve)
        // },
        // {
        //     path: 'AMP_bind',
        //     title: 'AMP绑定',
        //     name: 'AMP_bind',
        //     component: resolve => require(['@/views/systemSettings/form-setting/AMP_bind/AMP_bind.vue'], resolve)
        // },
        // {
        //     path: 'WriteMail',
        //     title: '写信',
        //     name: 'WriteMail',
        //     component: resolve => require(['@/views/mail/mail-home/components/write-mail/write-mail.vue'], resolve)
        // },
        // 权限子页面
        // {
        //     path: 'user-management',
        //     title: {i18n: 'authority.userManagement.title'},
        //     name: 'user-management',
        //     component: (resolve) => require(['@/views/authority/user-management/user-management.vue'], resolve)
        // },
        // {
        //     path: 'functional-permissions',
        //     title: {i18n: 'authority.functionalPermis.title'},
        //     name: 'functional-permissions',
        //     component: (resolve) => require(['@/views/authority/functional-permissions/functional-permissions.vue'], resolve)
        // },
        // {
        //     path: 'administrative-authority',
        //     title: {i18n: 'authority.adminPermis.title'},
        //     name: 'administrative-authority',
        //     component: (resolve) => require(['@/views/authority/administrative-authority/administrative-authority.vue'], resolve)
        // },
        // {
        //     path: 'field-permissions',
        //     title: {i18n: 'authority.fieldPermis.title'},
        //     name: 'field-permissions',
        //     component: (resolve) => require(['@/views/authority/field-permissions/field-permissions.vue'], resolve)
        // }
    ]
};

// 这个只是tags的配置，用作面包屑
export const appRouter = [
    {
        title: { i18n: 'menu.dashBoard' },
        children: [
            {
                title: { i18n: 'menu.dashBoard' },
                name: 'home_index'
            }
        ]
    }, // 仪表盘
    {
        title: { i18n: 'menu.crm' },
        children: [
            {
                title: { i18n: 'menu.followuprecordManage' },
                name: 'followuprecordManage'
            },
            {
                title: { i18n: 'menu.touchPoint' },
                name: 'touchPoint'
            },
            {
                title: { i18n: 'menu.clueManage' },
                name: 'clueManage'
            },
            {
                title: { i18n: 'menu.opportunityManage' },
                name: 'opportunityManage'
            },
            {
                title: { i18n: 'menu.myCustomer' },
                name: 'customerManage'
            },
            {
                title: { i18n: 'menu.highseasCustomer' },
                name: 'customerhighsea'
            },
            {
                title: { i18n: 'menu.common_sea_customer' },
                name: 'leadhighsea'
            },
            {
                title: { i18n: 'menu.touchPointContact' },
                name: 'touchPointContact'
            },
            {
                title: { i18n: 'menu.highseasCustomer' },
                name: 'highseasCustomer'
            },
            {
                title: { i18n: 'menu.myInquiry' },
                name: 'myInquiry'
            },
            {
                title: { i18n: 'menu.contactManage' },
                name: 'contactManage'
            },
            {
                title: { i18n: 'menu.companyDetail' },
                name: 'companyDetail'
            },
            {
                title: { i18n: 'menu.dataMovement' },
                name: 'dataMovement'
            },
            {
                title: { i18n: 'menu.aliImportCRX' },
                name: 'aliImportCRX'
            },
            {
                title: { i18n: 'menu.customerCheck' },
                name: 'customerCheck'
            },
            {
                title: { i18n: 'menu.followUpRecord' },
                name: 'followUpRecord'
            },
            {
                title: { i18n: 'menu.followUpPlan' },
                name: 'followUpPlan'
            }
        ]
    }, // CRM
    {
        title: { i18n: 'menu.mail_home' },
        children: [
            {
                title: { i18n: 'menu.mail_home' },
                name: 'mail_home'
            }
        ]
    }, // 邮件
    {
        title: {
            i18n: 'menu.calling_sms',
            // 操作指南
            tag: [
                {
                    title: { i18n: 'menu.usersGuidance' },
                    genre: 'calling_sms',
                    type: 'usedGuidance',
                    id: 0
                }
            ]
        },
        children: [
            {
                title: { i18n: 'menu.calling_sms' },
                name: 'calling_sms'
            }
        ]
    }, // sms面包屑
    {
        title: { i18n: 'menu.whatsapp_microenterprise', tag: 'menu.wa_xsmf' },

        children: [
            {
                title: { i18n: 'menu.whatsapp_microenterprise' },
                name: 'whatsapp_microenterprise'
            }
        ]
    }, // 企微管理面包屑
    {
        title: { i18n: 'menu.communication' },
        children: [
            {
                title: { i18n: 'menu.whatsapp_chat' },
                name: 'whatsapp_chat'
            },
            {
                title: { i18n: 'menu.xhl_chat' },
                name: 'xhl_chat'
            },
            {
                title: { i18n: 'menu.inbox' },
                name: 'inbox'
            }
        ]
    }, // 沟通
    {
        title: { i18n: 'menu.socialMedia' },
        children: [
            {
                title: { i18n: 'menu.whatsapp_management' },
                name: 'whatsapp_management'
            },
            {
                title: { i18n: 'menu.fb_message' },
                name: 'fb_message'
            }
        ]
    }, // 社媒营销
    {
        title: { i18n: 'menu.briefcase' },
        children: [
            {
                title: { i18n: 'menu.database' },
                name: 'database'
            },
            {
                title: { i18n: 'menu.cloud_push' },
                name: 'cloud_push'
            },
            {
                title: { i18n: 'menu.access_record' },
                name: 'access_record'
            },
            {
                title: { i18n: 'portal_set.script_set' },
                name: 'script_set'
            }
        ]
    }, // 智能物料
    {
        title: { i18n: 'menu.websiteInteraction' },
        children: [
            {
                title: { i18n: 'menu.website_manager' },
                name: 'website_manager'
            },
            {
                title: { i18n: 'menu.xhl_chat' },
                name: 'xhl_chat'
            },
            {
                title: { i18n: 'menu.visitor_history' },
                name: 'visitor_history'
            },
            {
                title: { i18n: 'menu.website_message' },
                access: 'form',
                name: 'website_message'
            },
            {
                title: { i18n: 'menu.google_search_console' },
                access: 'google_search_console',
                name: 'google_search_console'
            },
            {
                title: { i18n: 'menu.autoGenArticle' },
                access: 'autoGenArticle',
                name: 'autoGenArticle'
            },
            {
                title: { i18n: 'menu.aiseo' },
                name: 'aiseo'
            }
        ]
    }, // 网站
    {
        title: { i18n: 'menu.email_marketing' },
        children: [
            {
                title: { i18n: 'menu.marketing_activities' },
                name: 'marketing_activities'
            },
            {
                title: { i18n: 'menu.address_book' },
                name: 'address_book'
            }
        ]
    }, // 邮件营销
    {
        title: { i18n: 'menu.seo' },
        children: [
            {
                title: { i18n: 'menu.seo' },
                name: 'seo'
            }
        ]
    }, // SEO
    {
        title: { i18n: 'menu.facebook' },
        children: [
            {
                title: { i18n: 'menu.social_reporting' },
                name: 'social_reporting'
            },
            {
                title: { i18n: 'menu.one_key_release' },
                name: 'one_key_release'
            },
            {
                title: { i18n: 'menu.homepage_dynamic' },
                name: 'homepage_dynamic'
            }
        ]
    }, // Facebook
    {
        title: { i18n: 'menu.system_settings' },
        children: [
            {
                title: { i18n: 'menu.authority' },
                name: 'authority'
            },
            {
                title: { i18n: 'menu.mail_set' },
                name: 'mail_set'
            },
            {
                title: { i18n: 'menu.company_mail_magage' },
                name: 'company_mail_magage'
            },
            {
                name: 'google_binding',
                title: { i18n: 'menu.google_binding' },
                children: [
                    {
                        title: { i18n: 'menu.google_ads_binding' },
                        name: 'google_ads_binding'
                    },
                    {
                        title: { i18n: 'menu.google_analytics_bind' },
                        name: 'google_analytics_bind'
                    }
                ]
            },
            {
                title: { i18n: 'menu.integration' },
                name: 'integration'
            },
            {
                title: { i18n: 'menu.distribution' },
                name: 'distribution'
            },
            {
                title: { i18n: 'menu.portal_set' },
                name: 'portal_set'
            },
            {
                title: { i18n: 'menu.business_params_set' },
                name: 'business_params_set'
            },
            {
                title: { i18n: 'menu.whatsapp_setting' },
                name: 'whatsapp_setting'
            },
            {
                title: { i18n: 'menu.languages_set' },
                name: 'languages_set'
            },
            {
                title: { i18n: 'menu.block_ip_address' },
                name: 'block_ip_address'
            },
            {
                title: { i18n: 'menu.AMP_bind' },
                name: 'AMP_bind'
            },
            {
                title: { i18n: 'menu.product_setting' },
                name: 'product_setting'
            },
            {
                name: 'fieldSettings',
                title: { i18n: 'menu.fieldSettings' },
                children: [
                    {
                        title: { i18n: 'menu.inquirySetting' },
                        name: 'inquirySetting'
                    },
                    {
                        title: { i18n: 'menu.set_clue' },
                        name: 'set_clue'
                    },
                    {
                        title: { i18n: 'menu.form_setting' },
                        name: 'form_setting'
                    }
                ]
            },
            {
                name: 'fieldAttribute',
                title: { i18n: 'menu.fieldAttribute' },
                children: [
                    {
                        title: { i18n: 'menu.universalSetting' },
                        name: 'universalSetting'
                    },
                    {
                        title: { i18n: 'menu.universal_setting' },
                        name: 'universal_setting'
                    }
                ]
            },
            {
                name: 'facebookBinding',
                title: { i18n: 'menu.facebookBinding' },
                children: [
                    {
                        title: { i18n: 'menu.account_binding' },
                        name: 'account_binding'
                    },
                    {
                        title: { i18n: 'menu.ad_account_binding' },
                        name: 'ad_account_binding'
                    },
                    {
                        title: { i18n: 'menu.form_bind' },
                        name: 'form_bind'
                    },
                    {
                        title: { i18n: 'menu.fb_distribution' },
                        name: 'fb_distribution'
                    }
                ]
            },
            {
                name: 'autoSettings',
                title: { i18n: 'menu.autoSettings' },
                children: [
                    {
                        title: { i18n: 'menu.notice_setting' },
                        name: 'notice_setting'
                    },
                    {
                        title: { i18n: 'menu.automated_allocation' },
                        name: 'automated_allocation'
                    },
                    {
                        title: { i18n: 'menu.automated_mail' },
                        name: 'automated_mail'
                    }
                ]
            },
            {
                title: { i18n: 'menu.company_overview' },
                name: 'company_overview'
            },
            {
                title: { i18n: 'menu.highSeasSetting' },
                name: 'highSeasSetting'
            },
            {
                title: { i18n: 'menu.set_up_shared_domain_name' },
                name: 'set_up_shared_domain_name'
            }
        ]
    }, // 系统设置
    {
        title: { i18n: 'per_setting.personalSetting' },
        children: [
            {
                title: { i18n: 'per_setting.personalSetting' },
                name: 'set'
            },
            {
                title: { i18n: 'menu.my_name_card' },
                name: 'my_name_card'
            }
        ]
    }, // 个人设置
    {
        title: { i18n: 'menu.enterpriseGPT' },
        children: [
            {
                title: { i18n: 'menu.enterpriseGPT' },
                name: 'enterpriseGPT'
            },
            {
                title: { i18n: 'menu.knowledgeBase' },
                name: 'knowledgeBase'
            },
            {
                title: { i18n: 'menu.usageRecord' },
                name: 'usageRecord'
            },
            {
                title: { i18n: 'menu.bill' },
                name: 'bill'
            }
        ]
    } // 企业 GPT
];

// 所有上面定义的路由都要写在下面的routers里
export const routers = [
    // writeMail,
    // mailDetail,
    mail,
    loginRouter,
    registerRouter,
    otherRouter,
    ForgetPwd,
    setUpPwd,
    authorizedLogin,
    // timeRouter,
    page500,
    page403,
    page404,
    registerRouter,
    indexRouter,
    gatePassDetailRouter
    // errorBrowser
];
