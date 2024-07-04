
// 不作为Main组件的子页面展示的页面单独写，如下
const routes = [{
    path: '/',
    name: 'admin',
    component: import('@/layouts/admin.vue'),
    children: [
        {
            path: '/home',
            name: 'Home',
            meta: {
                title: '首页'
            },
            component: import('@/views/home/indexHome.vue')
        },
        {
            path: '/pages1',
            name: 'pages1',
            meta: {
                title: 'pages1'
            },
            component: import('@/views/pages1/index.vue')
        },
        {
            path: '/pages2',
            name: 'pages2',
            meta: {
                title: 'pages2'
            },
            component: import('@/views/pages2/index.vue')
        }
    ]
},
{
    path: '/login',
    name: 'login',
    meta: {
        title: 'Login - 登录'
    },
    component: import('@/views/login/login.vue')
}];

// 所有上面定义的路由都要写在下面的routers里
export const routers = routes;