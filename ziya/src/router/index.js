import Vue from 'vue';
import Router from 'vue-router';
//import index from '@/pages/index'
//路由懒加载
const index = () =>
    import ('@/pages/index1');

const work = () =>
    import ('@/pages/work');
Vue.use(Router);
//配置路由路径
const router = new Router({
    mode: 'history',
    routes: [{
        path: '/',
        name: 'index',
        component: index,
        beforeEnter: (to, from, next) => {
            next();
        }
    }, {
        path: '/works',
        name: 'works',
        component: work
    }]
});
//全局路由守卫
router.beforeEach((to, from, next) => {
    next();
});
// 全局后置钩子
router.afterEach((to, from) => {
    // ...
});
export default router