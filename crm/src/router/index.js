import { createRouter, createWebHashHistory } from 'vue-router';
// 导入路由对应关系
// import { menuList, routerTitle } from './routerMap';
// import { HANDLE_MENU_JSON } from './utils';
import { routes } from './router';


// 添加动态路由
// 格式化接口传回的参数
// let router_map = HANDLE_MENU_JSON(menuList);
// console.log([router_map]);



const router = createRouter({
    history: createWebHashHistory(),
    routes
});


router.beforeEach(async (to, from) => {
    // 修改标签名字
    if (to.name !== 'refresh') {
        // window.parent.document.title = routerTitle[to.name] || routerTitle.leads;
    }
    // return false;
});


export default router;