// 根据 getMenu 请求返回的 menu 数组, 得到全量目录路由数组( main 目录数组 + 设置目录数组)
// import { useUserStore } from '@/pinia/modules/user';
import { ROUTER_LIST, ICON_OBJ } from './routerMap';
// const store = useUserStore();

export function HANDLE_MENU_JSON(menuList) {
    return menuList;
    // let routerChildren = menuList.map(item => {
    //     if (item.path) {
    //         // 暂存对象
    //         let obj = {
    //             meta: {}
    //         };
    //         switch (item.path) {
    //             case 'system_settings':
    //                 if (item.children) {
    //                     obj = {
    //                         path: '/systemSettings',
    //                         name: 'systemSettings',
    //                         title: {
    //                             i18n: 'menu.system_settings'
    //                         },
    //                         icon: 'custom custom-menu-setting',
    //                         component: import('@/layouts/admin.vue'),
    //                         children: item.children.map(child_item => {
    //                             let child_obj = {
    //                                 meta: {
    //                                     id: child_item.id
    //                                 }
    //                             };
    //                             child_obj.icon = `custom custom-${ICON_OBJ[child_item.path]}`;
    //                             if (child_item.children) {
    //                                 child_obj.path = child_item.path;
    //                                 child_obj.name = child_item.path;
    //                                 child_obj.title = {
    //                                     i18n: 'menu.' + child_item.path
    //                                 };
    //                                 child_obj.component = import('@/views/main-components/parent-view');
    //                                 child_obj.children = child_item.children.map(child_next_item => {
    //                                     return {
    //                                         meta: {
    //                                             id: child_next_item.id
    //                                         },
    //                                         path: child_next_item.path,
    //                                         name: child_next_item.path,
    //                                         title: {
    //                                             i18n: 'menu.' + child_next_item.path
    //                                         },
    //                                         component: ROUTER_LIST[child_next_item.path]
    //                                     };
    //                                 });
    //                             } else {
    //                                 child_obj.path = child_item.path;
    //                                 child_obj.name = child_item.path;
    //                                 // if (child_item.path === "authority") {
    //                                 //     child_obj.redirect = {
    //                                 //         name: 'authority_list'
    //                                 //     };
    //                                 //     // child_obj.children = [
    //                                 //         // {
    //                                 //         //     path: 'authority-list',
    //                                 //         //     title: '管理列表',
    //                                 //         //     name: 'authority-list',
    //                                 //         //     component: (resolve) => require(['@/views/authority/authority-list.vue')
    //                                 //         // },
    //                                 //         // {
    //                                 //         //     path: 'user-management',
    //                                 //         //     title: '部门与用户管理',
    //                                 //         //     name: 'user-management',
    //                                 //         //     component: (resolve) => require(['@/views/authority/user-management/user-management.vue')
    //                                 //         // },
    //                                 //         // {
    //                                 //         //     path: 'functional-permissions',
    //                                 //         //     title: '功能权限设置',
    //                                 //         //     name: 'functional-permissions',
    //                                 //         //     component: (resolve) => require(['@/views/authority/functional-permissions/functional-permissions.vue')
    //                                 //         // },
    //                                 //         // {
    //                                 //         //     path: 'administrative-authority',
    //                                 //         //     title: '管理权限设置',
    //                                 //         //     name: 'administrative-authority',
    //                                 //         //     component: (resolve) => require(['@/views/authority/administrative-authority/administrative-authority.vue')
    //                                 //         // },
    //                                 //         // {
    //                                 //         //     path: 'field-permissions',
    //                                 //         //     title: '字段权限设置',
    //                                 //         //     name: 'field-permissions',
    //                                 //         //     component: (resolve) => require(['@/views/authority/field-permissions/field-permissions.vue')
    //                                 //         // }
    //                                 //     // ]
    //                                 // }
    //                                 child_obj.title = {
    //                                     i18n: 'menu.' + child_item.path
    //                                 };
    //                                 child_obj.component = ROUTER_LIST[child_item.path];
    //                             }

    //                             return child_obj;
    //                         })
    //                     };
    //                 } else {
    //                     obj = null;
    //                 }
    //                 break;
    //             case 'websiteInteraction':
    //                 obj.path = `/${item.path}`;
    //                 obj.icon = `custom custom-${ICON_OBJ[item.path]}`;
    //                 obj.component = import('@/layouts/admin.vue');
    //                 if (item.children) {
    //                     obj.name = item.path;
    //                     obj.title = { i18n: 'menu.' + item.path };
    //                     obj.meta.id = item.id;
    //                     obj.children = item.children.map(child_item => {
    //                         let child_obj = {
    //                             meta: {
    //                                 id: child_item.id
    //                             }
    //                         };
    //                         child_obj.path = child_item.path;
    //                         child_obj.name = child_item.path;
    //                         child_obj.title = {i18n: 'menu.' + child_item.path};
    //                         child_obj.component = ROUTER_LIST[child_item.path];
    //                         if (child_item.path === 'website_manager') {
    //                             // util
    //                             //     .ajax({
    //                             //         url: util.AutomaticSiteUrl + "/trunk/site/count"
    //                             //     })
    //                             util
    //                                 .ajaxAMP({
    //                                     url: '/trunk/site/count'
    //                                 })
    //                                 .then(response => {
    //                                     if (response.data.data === null) {
    //                                         return false;
    //                                     }
    //                                     if (response.data.data.total > 0) {
    //                                         store.state.showWitchComponent = 'myWebsite';
    //                                         store.state.TemplateStationNum = response.data.data.total;
    //                                     } else {
    //                                         util.ajaxWebSite2({
    //                                             url: `/wp-json/wp/v2/getweburl/${  store.state.enterpriseId }`,
    //                                             method: 'get'
    //                                         })
    //                                             .then(response => {
    //                                                 // if (Array.isArray(response.data.result) &&response.data.result.length > 0) {
    //                                                 //     store.state.showWitchComponent = "myWebsite";
    //                                                 // } else {
    //                                                 //     store.state.showWitchComponent = "guidePage";
    //                                                 // }
    //                                                 store.state.showWitchComponent = 'myWebsite';
    //                                             });
    //                                     }
    //                                 });
    //                         }
    //                         return child_obj;
    //                     });
    //                 } else {
    //                     obj = null;
    //                 }
    //                 break;
    //             case 'home':
    //                 obj.path = 'home';
    //                 obj.icon = 'custom custom-menu-dashBoard';
    //                 obj.title = {i18n: 'menu.dashBoard'};
    //                 obj.name = 'home';
    //                 obj.component = () => import(/* webpackChunkName: "about" */'@/views/home/indexHome.vue');
    //                 // obj.children = [
    //                 //     {
    //                 //         path: 'home',
    //                 //         title: {i18n: 'menu.dashBoard'},
    //                 //         name: 'home',
    //                 //         // component: import('@/views/dashBoard/index.vue')
    //                 //         component: import('@/views/home/indexHome.vue')
    //                 //     }
    //                 // ];
    //                 break;
    //             case 'mail':
    //                 obj.path = 'page1';
    //                 obj.name = 'page1';
    //                 obj.icon = 'custom custom-menu-mail';
    //                 obj.title = {
    //                     i18n: 'menu.mail_home'
    //                 };
    //                 obj.component = () => import(/* webpackChunkName: "about" */'@/views/pages1/index.vue');
    //                 obj.children = [];
    //                 // obj.name = 'mail_home';
    //                 // obj.component = import('@/layouts/admin.vue');
    //                 // obj.children = [
    //                 //     {
    //                 //         path: 'mail_home',
    //                 //         title: {
    //                 //             i18n: 'menu.mail_home'
    //                 //         },
    //                 //         name: 'mail_home',
    //                 //         // component: import('@/views/mail/mail-home/mail-home.vue')
    //                 //     }
    //                 // ];
    //                 break;
    //             case 'page2':
    //                 obj.path = `/${item.path}`;
    //                 obj.icon = `custom custom-${ICON_OBJ[item.path]}`;
    //                 obj.name = `${item.path}`;
    //                 // obj.component = import('@/layouts/admin.vue');
    //                 obj.component = () => import(/* webpackChunkName: "about" */'@/views/pages2/index.vue');
    //                 obj.title = {
    //                     i18n: 'menu.' + item.path
    //                 };
    //                 obj.children = [];
    //                 // if (item.children) {
    //                 //     obj.meta.id = item.id;
    //                 //     const arr = [];
    //                 //     item.children.forEach(child_item => {
    //                 //         let child_obj = {
    //                 //             meta: {
    //                 //                 id: child_item.id
    //                 //             }
    //                 //         };
    //                 //         child_obj.path = child_item.path;
    //                 //         child_obj.name = child_item.path;
    //                 //         child_obj.title = {
    //                 //             i18n: 'menu.' + child_item.path
    //                 //         };
    //                 //         child_obj.component = ROUTER_LIST[child_item.path];
    //                 //         if (child_item.path === 'whatsapp_chat') {
    //                 //             // 需要给whatsapp聊天做进一步的权限判断(之前是判断title,改为判断id)
    //                 //             // 11038(线上环境)、11039(测试环境)
    //                 //             const chatPermissionArr = [11038, 11039];
    //                 //             if (child_item.children && child_item.children.some((child_child_item) => chatPermissionArr.includes(child_child_item.id))) {
    //                 //                 arr.push(child_obj);
    //                 //             }
    //                 //         } else {
    //                 //             arr.push(child_obj);
    //                 //         }
    //                 //     });
    //                 //     obj.children = arr;
    //                 // }
    //                 break;
    //             case 'enterpriseGPT':
    //                 obj.path = `/${item.path}`;
    //                 obj.icon = `custom custom-${ICON_OBJ[item.path]}`;
    //                 obj.name = `${item.path}_home`;
    //                 obj.component = import('@/layouts/admin.vue');
    //                 obj.title = {
    //                     i18n: 'menu.' + item.path
    //                 };
    //                 if (item.children) {
    //                     obj.meta.id = item.id;
    //                     const arr = [];
    //                     item.children.forEach(child_item => {
    //                         let child_obj = {
    //                             meta: {
    //                                 id: child_item.id
    //                             }
    //                         };
    //                         child_obj.path = child_item.path;
    //                         child_obj.name = child_item.path;
    //                         child_obj.title = {
    //                             i18n: 'menu.' + child_item.path
    //                         };
    //                         child_obj.component = ROUTER_LIST[child_item.path];

    //                         // 特殊处理 --- 产品要求, 企业 GPT 页面, 知识库页面, 需要判断按钮权限
    //                         switch (child_item.path) {
    //                             case 'enterpriseGPT':
    //                                 if (child_item.children && child_item.children.some((child_child_item) => child_child_item.id === 11150)) {
    //                                     arr.push(child_obj);
    //                                 }
    //                                 break;
    //                             case 'knowledgeBase':
    //                                 if (child_item.children && child_item.children.some((child_child_item) => child_child_item.id === 11154)) {
    //                                     arr.push(child_obj);
    //                                 }
    //                                 break;
    //                             default:
    //                                 arr.push(child_obj);
    //                         }
    //                     });
    //                     obj.children = arr;
    //                 } else {
    //                     obj.children = [{
    //                         meta: {
    //                             id: item.id,
    //                         },
    //                         title: {
    //                             i18n: 'menu.' + item.path
    //                         },
    //                         path: 'index',
    //                         name: item.path,
    //                         component: ROUTER_LIST[item.path]
    //                     }];
    //                 }

    //                 break;
    //             default:
    //                 obj.path = `/${item.path}`;
    //                 obj.icon = `custom custom-${ICON_OBJ[item.path]}`;
    //                 obj.name = `${item.path}_home`;
    //                 obj.component = import('@/layouts/admin.vue');
    //                 obj.title = {
    //                     i18n: 'menu.' + item.path
    //                 };
    //                 if (item.path === 'my_clue' && item.title === '线索管理') {
    //                     console.log('store', item);
    //                     obj.title = {
    //                         i18n: 'menu.clue_manage'
    //                     };
    //                 }
    //                 if (item.children) {
    //                     obj.meta.id = item.id;
    //                     obj.children = item.children.map(child_item => {
    //                         let child_obj = {
    //                             meta: {
    //                                 id: child_item.id
    //                             }
    //                         };
    //                         child_obj.path = child_item.path;
    //                         child_obj.name = child_item.path;
    //                         child_obj.title = {
    //                             i18n: 'menu.' + child_item.path
    //                         };
    //                         child_obj.component = ROUTER_LIST[child_item.path];
    //                         return child_obj;
    //                     });
    //                 } else {
    //                     if(item.path === 'my_clue' && item.title === '线索管理') {
    //                         obj.children = [{
    //                             meta: {
    //                                 id: item.id,
    //                             },
    //                             title: {
    //                                 i18n: 'menu.clue_manage'
    //                             },
    //                             path: 'index',
    //                             name: item.path,
    //                             component: ROUTER_LIST[item.path]
    //                         }];
    //                     } else {
    //                         obj.children = [{
    //                             meta: {
    //                                 id: item.id,
    //                             },
    //                             title: {
    //                                 i18n: 'menu.' + item.path
    //                             },
    //                             path: 'index',
    //                             name: item.path,
    //                             component: ROUTER_LIST[item.path]
    //                         }];
    //                     }

    //                 }
    //         }
    //         // 返回结果
    //         return obj;
    //     }
    // }).filter(item => item);
    // let routersArr = {
    //     path: '/',
    //     name: 'admin',
    //     component: () => import(/* webpackChunkName: "about" */'@/layouts/admin.vue'),
    //     children: routerChildren
    // };
    // return routersArr;
}