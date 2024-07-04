import {
    otherRouter,
    appRouter
} from '@/router/router';
import util from '@/libs/util';
import i18n from '@/locale';
import Vue from 'vue';
import { HANDLE_MENU_JSON, router, resetRouter } from '../../router';
import {
    Message
} from 'element-ui';
import { googleAdsBind } from '@/api/google/index';
const { getConversionListFromGoogle, getConversionListFromLeadsCloud } = googleAdsBind;

const app = {
    state: {
        companyInformation: null, // 公司信息
        isModeRead: true,
        cachePage: [],
        lang: 'zh-CN',
        isFullScreen: false,
        openedSubmenuArr: [], // 要展开的菜单数组
        menuTheme: 'light', // 主题
        themeColor: '',
        pageOpenedList: [],
        currentPageName: '',
        activeRouteNames: [], // 当前路由树上所有路由的 name
        floatWindowType: '',
        tempFloatWindowType: '',
        usedGuidanceObj: { // 使用指南
            // cinnox
            calling_sms: {
                usedGuidance: 'https://www.yuque.com/help.leadscloud/faq_guide/lbvsg4uri23s40ds'
            }
        }, // 面包屑数组
        currentPath: [], // 面包屑数组
        routers: [
            otherRouter,
            ...appRouter
        ],
        tagsList: [...otherRouter.children],
        dontCache: ['text-editor', 'artical-publish'], // 在这里定义你不想要缓存的页面的name属性值(参见路由配置router.js)
        button_list: [],
        // 工商联想数据状态
        business_state: false,
        // 联系地址图标显示状态
        isShowLocation: false,
        // 权限菜单
        roleMenu: [], // getMenu 接口返回的原始 menuList 数据
        router_map: [], // 处理 menuList 得到的 sidebar-menu 数据
        menu_list: [], // 平铺开的 menuList
        is_marketing_station: false,
        special_name: null,
        systemNoticeFlag: true,
        taskNoticeFlag: true,

        // 已关联的客户跟进状态列表
        associated_followUpStatus_list: [],

        replyNoticeData: false,

        // 显示升级提醒
        showUpgradeTip: false,
        upgradeTip: '',

        // 显示应用中心
        appCenterVisible: false,
        // 应用中心全部未读数
        allUnreadCount: 0,
        // 任务提醒未读数
        taskUnreadCount: 0,
        // 系统通知未读数
        systemNoticeUnreadCount: 0,
        // 站内信未读数
        letterUnreadCount: 0,

        // 当前 window 开启时间(进入 Main.vue 时间, 默认或离开时为 0)
        windowOpenTimeStamp: 0,

        // 定时更新当前页面 windowOpenTimeStamp 到时间戳数组末尾
        timer_updateSeq: null
    },
    mutations: {
        updateIsModeRead(state, val) {
            state.isModeRead = val;
        },
        setTagsList(state, list) {
            state.tagsList.push(...list);
        },
        changeMenuTheme(state, theme) {
            state.menuTheme = theme;
        },
        changeMainTheme(state, mainTheme) {
            state.themeColor = mainTheme;
        },
        addOpenSubmenu(state, name) {
            if (name) {
                let hasThisName = false;
                let isEmpty = false;
                if (name.length === 0) {
                    isEmpty = true;
                }
                if (state.openedSubmenuArr.indexOf(name) > -1) {
                    hasThisName = true;
                }
                if (!hasThisName && !isEmpty) {
                    state.openedSubmenuArr.push(name);
                }
            }
        },
        closePage(state, name) {
            state.cachePage.forEach((item, index) => {
                if (item === name) {
                    state.cachePage.splice(index, 1);
                }
            });
            sessionStorage.cachePage = JSON.stringify(state.cachePage);
        },
        initCachepage(state) {
            if (sessionStorage.cachePage) {
                state.cachePage = JSON.parse(sessionStorage.cachePage);
            }
        },
        removeTag(state, name) {
            state.pageOpenedList.map((item, index) => {
                if (item.name === name) {
                    state.pageOpenedList.splice(index, 1);
                }
            });
        },
        pageOpenedList(state, get) {
            const openedPage = state.pageOpenedList[get.index];
            if (get.argu) {
                openedPage.argu = get.argu;
            }
            if (get.query) {
                openedPage.query = get.query;
            }
            state.pageOpenedList.splice(get.index, 1, openedPage);
            sessionStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
        },
        orderTags(state, name) {
            console.log(name);
            // 自定义主页后，重新排列tags顺序，把主页放在第一位
            // if (state.pageOpenedList[0] && state.pageOpenedList[0].name !== name) state.pageOpenedList.shift()
            const homeTagIndex = state.pageOpenedList.findIndex(item => item.name === name);
            console.log(homeTagIndex);
            if (homeTagIndex > 0) {
                const homeTag = state.pageOpenedList.splice(homeTagIndex, 1)[0];
                state.pageOpenedList.unshift(homeTag);
            }
            sessionStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
        },
        clearAllTags(state) {
            state.pageOpenedList.splice(1);
            state.cachePage = [];
            sessionStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
            sessionStorage.cachePage = JSON.stringify(state.cachePage);
        },
        clearOtherTags(state, vm) {
            const currentName = vm.$route.name;
            let currentIndex = 0;
            state.pageOpenedList.forEach((item, index) => {
                if (item.name === currentName) {
                    currentIndex = index;
                } else if (item.children && item.children.length) {
                    if (item.children.some(item => {
                        return item.name === currentName;
                    })) {
                        currentIndex = index;
                    }
                }
            });
            if (currentIndex === 0) {
                state.pageOpenedList.splice(1);
            } else {
                state.pageOpenedList.splice(currentIndex + 1);
                state.pageOpenedList.splice(1, currentIndex - 1);
            }
            const newCachepage = state.cachePage.filter(item => {
                return item === currentName;
            });
            state.cachePage = newCachepage;
            sessionStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
            sessionStorage.cachePage = JSON.stringify(state.cachePage);
        },
        refreshPage(state, name) {
            state.cachePage.forEach((item, index) => {
                if (item === name) {
                    state.cachePage.splice(index, 1);
                }
            });
        },
        setOpenedList(state) {
            state.pageOpenedList = sessionStorage.pageOpenedList ? JSON.parse(sessionStorage.pageOpenedList) : [];
        },
        setCurrentPath(state, pathArr) {
            state.currentPath = pathArr;
        },
        setCurrentPageName(state, name) {
            state.currentPageName = name;
        },
        // 更新当前路由 name 数组
        setActiveRouteNames(state, routeObj) {
            state.activeRouteNames = routeObj.matched.map(item => item.name);
        },
        setFloatWindowType(state, name) {
            state.floatWindowType = name;
        },
        setTempFloatWindowType(state, name) {
            state.tempFloatWindowType = name;
        },
        switchLang(state, lang) {
            state.lang = lang;
            Vue.config.lang = lang;
            i18n.locale = lang;
        },
        clearOpenedSubmenu(state) {
            state.openedSubmenuArr.length = 0;
        },
        increateTag(state, tagObj) {
            if (!util.oneOf(tagObj.name, state.dontCache)) {
                state.cachePage.push(tagObj.name);
                sessionStorage.cachePage = JSON.stringify(state.cachePage);
            }
            state.pageOpenedList.push(tagObj);
            sessionStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
        },
        set_special_name(state, name) {
            state.special_name = name;
        },
        // 处理 getMenu 返回的 menuList
        set_menu_list(state, arr) {
            // // 先屏蔽 10110 以外的"屏蔽 IP 设置"目录
            // const excludePathArr = ['block_ip_address'];
            // function filterMenu(arr) {
            //     arr.some((item, index) => {
            //         if (excludePathArr.includes(item.path)) {
            //             console.error(item);
            //             arr.splice(index, 1);
            //             console.error(arr);
            //             return true;
            //         } else {
            //             if (Array.isArray(item.children) && item.children.length) {
            //                 filterMenu(item.children);
            //             }
            //         }
            //     });
            // }

            // 原始数据, 存入 vuex roleMenu , 存入 localStorage roleMenu
            state.roleMenu = arr;
            localStorage.setItem('roleMenu', JSON.stringify(arr));
            // 处理原始数据, 得到真正要给 sidebar-menu 使用的目录列表, 存入 vuex router_map
            state.router_map = HANDLE_MENU_JSON(arr);

            // 清除原路由
            resetRouter();
            // 动态添加路由
            router.addRoutes(state.router_map);
            // 清除关联账户登录标识
            setTimeout(() => {
                localStorage.removeItem('relatedLogin');
            }, 1000);

            // 平铺数组, 把所有 children 提出到最外层
            // 暂存数组
            const all_comments = [];
            // 递归平铺方法
            function unfold(arr) {
                arr.forEach(item => {
                    const temp = Object.assign({}, item);
                    if (Array.isArray(temp.children) && temp.children.length) {
                        const children = temp.children.slice();
                        delete temp.children;
                        all_comments.push(temp);
                        unfold(children);
                    } else {
                        all_comments.push(temp);
                    }
                });
            }
            // 执行递归
            unfold(arr);
            // 保存
            state.menu_list = all_comments;
        },
        set_marketing_station(state, val) {
            state.is_marketing_station = val;
        },
        set_button_list(state, arr) {
            state.button_list = arr;
        },
        // 设置工商数据联想状态
        set_business_state(state, val) {
            state.business_state = val;
        },
        // 设置工商数据联想状态
        set_show_location(state, val) {
            state.isShowLocation = val;
        },
        changeSystemNoticeFlag(state) {
            state.systemNoticeFlag = !state.systemNoticeFlag;
        },
        changeTaskNoticeFlag(state) {
            state.taskNoticeFlag = !state.taskNoticeFlag;
        },
        // 获取有关联跟进状态的转化操作列表
        get_associated_followUpStatus_list(state, orgId) {
            if (orgId) {
                // 同时请求 google 平台和询盘云数据库的转化列表, 再合并数据, 以保证数据是最新的
                util.axios.all([getConversionListFromGoogle({ orgId, isAll: 1 }), getConversionListFromLeadsCloud({ orgId, isAll: 1 })]).then(util.axios.spread((...responses) => {
                    // 有 followupId 的主体请求不能请求失败, 失败则直接退出流程
                    if (responses[1].code !== '1') {
                        return;
                    }

                    // 带有 followupId 的询盘云数据库的转化操作列表数据
                    const followups = responses[1].data || [];

                    // 如果 Google 转化数据请求失败, 则直接使用询盘云数据库的数据
                    if (responses[0].code !== '1') {
                        // 为避免请求 Google 最新数据失败时的数据把请求成功时的数据覆盖, 此处改为: 无值时才更新数据为询盘云数据库存的数据
                        if (!state.associated_followUpStatus_list.length) {
                            state.associated_followUpStatus_list = followups;
                        }
                        return;
                    }

                    // 否则, 合并两者数据, 保证数据是最新的
                    // 目前只用于保证 useRevenueValue 和 defaultRevenueValue 无误
                    const conversionList = responses[0].data || [];
                    followups.forEach(follow => {
                        conversionList.some(item => {
                            if (`${follow.conversionId}` === `${item.id}` && `${follow.customerId}` === `${item.customerId}`) {
                                if (item.alwaysUseDefaultRevenueValue === true && item.defaultRevenueValue === 0) {
                                    // 不使用价值
                                    follow.useRevenueValue = 3;
                                } else if (item.alwaysUseDefaultRevenueValue === true) {
                                    // 使用相同价值
                                    follow.useRevenueValue = 1;
                                    follow.defaultRevenueValue = item.defaultRevenueValue;
                                } else if (item.alwaysUseDefaultRevenueValue === false) {
                                    // 使用不同价值
                                    follow.useRevenueValue = 2;
                                    follow.defaultRevenueValue = item.defaultRevenueValue;
                                }
                            }
                        });
                    });
                    state.associated_followUpStatus_list = followups;
                })).catch(error => {
                    console.error('获取已关联跟进状态的转化操作数据失败');
                    console.error(error);
                });
            } else {
                // Message.error('企业ID为空, 获取与 GOOGLE 关联的客户跟进状态列表失败, 可能导致 GOOGLE 优化不可用');
            }
        },
        update_associated_followUpStatus_list(state, value) {
            state.associated_followUpStatus_list = value;
        },

        setReplyNoticeData(state, data) {
            state.replyNoticeData = data || false;
        },
        // 恢复升级提示相关数据为初始值
        initUpgradeTipData(state) {
            state.showUpgradeTip = false;
            state.upgradeTip = '';
        },

        /* 应用中心 */
        // 应用中心显隐
        changeAppCenterVisible(state, visible) {
            state.appCenterVisible = visible;
        },
        // 设置提醒未读数 单项/总和
        setNoticeUnread(state, obj) {
            state[obj.type] = obj.count;
        },

        setAllFields(state, data) {
            state.allFields = data;
        },

        // 设置当前 window 开启时间(进入 Main.vue 时间, 默认或离开时为 0)
        setWindowOpenTimeStamp(state, data) {
            state.windowOpenTimeStamp = data;
        },

        // 存放定时器 id (定时更新当前页面时间戳到 localStorage 时间戳数组末尾)
        setTimerUpdateSeq(state, data) {
            state.timer_updateSeq = data;
        },
        // 清除定时器
        clearTimerUpdateSeq(state) {
            clearInterval(state.timer_updateSeq);
            state.timer_updateSeq = null;
        },
        setCompanyInformation(state, val) {
            state.companyInformation = val;
        }
    },
    actions: {
        /** 获取公司信息 */
        getCompanyInformation({ commit }) {
            const data = {
                orgId: this.state.enterpriseId
            };
            this._vm.$commonApi.getCompanyInformation(data).then(response => {
                commit('setCompanyInformation', response.data);
            });
        },
        // 获取系统升级配置信息
        updateUpgradeTip({ rootState, state }) {
            util.ajaxJson({
                url: '/new-privilege/tip/recent',
                method: 'get',
                params: {
                }
            }).then(res => {
                if (res.status === 200) {
                    // 请求升级提醒相关数据, 得到配置数组
                    let tipSettings = res.data || [];

                    // 遍历提醒数组, 得到需要的配置数据
                    // 当前时间戳
                    const nowStamp = Date.now();
                    // 筛选出当前时间戳在升级提醒设置数组时间范围内的设置
                    tipSettings = tipSettings.filter(item => nowStamp >= item.startTime && nowStamp <= item.endTime);
                    if (tipSettings.length) {
                        // 得到最大的 endTime
                        const maxEndTime = Math.max(...tipSettings.map(item => item.endTime));
                        // 筛选得到 endTime 为 maxEndTime 的设置数组
                        tipSettings = tipSettings.filter(item => item.endTime === maxEndTime);
                        // 按 startTime 从大到小排序设置数组
                        tipSettings = tipSettings.sort((a, b) => b.startTime - a.startTime);
                    }
                    // 得到最终所需设置
                    const setting = tipSettings[0];

                    // 如果没有该设置, 则退出操作流程
                    if (!setting) {
                        return;
                    }

                    // 取设置中的数据
                    const upgradeTip = setting.content || ''; // 提示语
                    const startTime = setting.startTime || 0; // 显示提示语时间戳
                    const endTime = setting.endTime || 0; // 显示提示语时间戳

                    // 获取 localStorage 中之前存入的数据
                    const prev_upgradeTip = localStorage.getItem('xhl_upgradeTip') || '';
                    const prev_startTime = parseInt(localStorage.getItem('xhl_upgradeTipStartTime') || 0);
                    const prev_endTime = parseInt(localStorage.getItem('xhl_upgradeTipEndTime') || 0);
                    const closeUpgradeTipTime = JSON.parse(localStorage.getItem('xhl_closeUpgradeTipTime')) || {};

                    // 获取当前用户上次关闭 tip 时间
                    let lastClosedTime = closeUpgradeTipTime[rootState.userId];

                    // 检验配置信息是否有变动
                    if (prev_upgradeTip !== upgradeTip || prev_startTime !== startTime || prev_endTime !== endTime) {
                        // 有变动则重新设置 lastClosedTime , 再次提醒用户
                        lastClosedTime = false;
                    }

                    // 如果发现 lastClosedTime 有值, 则需要检查是否再次提醒用户
                    if (lastClosedTime) {
                        // 如果该用户之前点击关闭升级提醒的时间戳不在升级提示时间戳数组范围内
                        if (lastClosedTime < startTime || lastClosedTime > endTime) {
                            // 则重新设置 lastClosedTime , 再次提醒用户
                            lastClosedTime = false;
                        }
                    }

                    // 检查是否需要显示升级提醒
                    // 如果 lastClosedTime 为 false 或 null
                    if (!lastClosedTime) {
                        // 如果当前时间戳在升级提示时间戳范围内
                        if (nowStamp >= startTime && nowStamp <= endTime) {
                            // 则显示升级提示
                            state.upgradeTip = upgradeTip;
                            state.showUpgradeTip = true;
                        }
                    }

                    // 更新 localStorage
                    localStorage.setItem('xhl_upgradeTip', upgradeTip);
                    localStorage.setItem('xhl_upgradeTipStartTime', `${startTime}`);
                    localStorage.setItem('xhl_upgradeTipEndTime', `${endTime}`);
                    localStorage.setItem('xhl_closeUpgradeTipTime', JSON.stringify(closeUpgradeTipTime));
                }
            });
        },
        // 用户关闭升级提示
        closeUpgradeTip({ rootState, state }) {
            state.showUpgradeTip = false;

            // 更新 localStorage
            const closeUpgradeTipTime = JSON.parse(localStorage.getItem('xhl_closeUpgradeTipTime')) || {};
            closeUpgradeTipTime[rootState.userId] = Date.now();
            localStorage.setItem('xhl_closeUpgradeTipTime', JSON.stringify(closeUpgradeTipTime));
        }
    },
    getters: {
        // 目录平铺数组中是否包含指定 path 目录
        isContainsMenu: state => name => state.menu_list.some(item => item.path === name),
        // 检验是否有 CRM 数据访问权限(公司, 询盘. 联系人)
        isHaveAuthority: (state, getters, rootState) => obj => {
            // 处理参数
            let url = '';
            const params = {
                userId: rootState.userId,
                orgId: rootState.enterpriseId
            };
            switch (obj.type) {
                case 'Customer':
                    url = '/crm/mailbox/isHaveAuthorityByCompanyId';
                    params.companyId = obj.id;
                    break;
                case 'Inquiry':
                    url = '/crm/mailbox/isHaveAuthority';
                    params.inquiryId = obj.id;
                    break;
                case 'Contact':
                    url = '/crm/mailbox/isHaveAuthorityForContacts';
                    params.contactsId = obj.id;
                    break;
                case 'Clue':
                    url = '/form-cust/form/isHaveAuthority';
                    params.clueId = obj.id;
                    break;
            }

            // 发送请求
            return util.ajax({
                url,
                method: 'get',
                params
            }).then(res => {
                if (res.data.code === '1') {
                    switch (`${res.data.data}`) {
                        // 有权限
                        case '1':
                            return true;
                        // 已退入公海(公海所有人都有权限)
                        case '2':
                            return 'highseas';
                        // 已被合并
                        case '3':
                            Message.warning(i18n.t(`crm.Modal.error_Jump${obj.type}Merged`));
                            return false;
                        // 该账号没有管理权限
                        default:
                            Message.error(i18n.t(`crm.Modal.error_Jump${obj.type}HaveNoPermission`));
                            return false;
                    }
                } else {
                    // 请求失败
                    Message.error(i18n.t('mail.writeLetter.addContactModal.requestErrorTip'));
                    return false;
                }
            }).catch(error => {
                // 请求失败
                console.error(error);
                Message.error(i18n.t('mail.writeLetter.addContactModal.requestErrorTip'));
                return false;
            });
        }
    }
};

export default app;
