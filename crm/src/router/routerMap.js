import i18n from '@/locale';

// 路由使用的组件
export const ROUTER_LIST = {
    permission_home: (resolve) => {
        // todo here MKT3.2.5 更新界面
        import('@/views/home/indexHome.vue').then((module) => {
            resolve(module);
        });
    }
};

// 目录使用的 icon
export const ICON_OBJ = {
 
};

// 页面切换时替换标签页 title (切换到 refresh 页面不替换)
export const routerTitle = {
  
};

export const menuList = [
    {
        'path': '/permission_home',
        component: ROUTER_LIST['permission_home'],
        'icon': '仪表盘',
        'id': 10606, 
        'href': '/permission_home', 
        'title': '仪表盘', 
        'spread': false
    }
];