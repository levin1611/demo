// 不作为Main组件的子页面展示的页面单独写，如下
const ROUTER_LIST = {
    // WhatsApp 聊天
    // const UserDetails = () => import('./views/UserDetails.vue')
    indexHome: () => {
        return import(/* webpackChunkName: "indexHome" */'@/views/home/indexHome.vue');
    },
    departmentAndMember: () => {
        return import(/* webpackChunkName: "departmentAndMember" */'@/views/members/memberList.vue');
    },
    login: () => {
        return import(/* webpackChunkName: "login" */'@/views/login/loginPage.vue');
    },
    // 注册通行证
    register: () => {
        return import(/* webpackChunkName: "register" */'@/views/login/registerPage.vue');
    },
    // 通行证详情页
    gatePassDetail: () => {
        return import(/* webpackChunkName: "gatePassDetail" */'@/views/login/gatePassDetail.vue');
    },
    // 测试修改 element-plus 主题, 组件样式
    themeTest: () => {
        return import(/* webpackChunkName: "themeTest" */'@/views/home/themeTest.vue');
    },
    // 角色权限
    rolePermission: () => {
        return import(/* webpackChunkName: "rolePermission" */'@/views/role-permission/index.vue');
    },
    // 角色权限
    permissionRule: () => {
        return import(/* webpackChunkName: "permissionRule" */'@/views/permission-rule/index.vue');
    },
    // 公司概况
    company: () => {
        return import(/* webpackChunkName: "company" */'@/views/company/companyOverview.vue');
    },
    page1: () => {
        return import(/* webpackChunkName: "indexHome" */'@/views/home/indexHome.vue');
    },
    // 职级与职位
    memberRanksAndPositions: () => {
        return import(/* webpackChunkName: "memberRanksAndPositions" */'@/views/memberRanksAndPositions/memberRanksAndPositions');
    },
    // 布局设置
    layoutSet: () => {
        return import(/* webpackChunkName: "layoutSet" */'@/views/layoutSet/index.vue');
    },
    // 公司概况
    dragDropLayout: () => {
        return import(/* webpackChunkName: "rolePermission" */'@/components/dragDropLayout.vue');
    },
    // 通用选项集
    generalOptionsSet: () => {
        return import(/* webpackChunkName: "generalOptionsSet" */'@/views/general-optionsSet/index.vue');
    },
    fieldDependent: () => {
        return import(/* webpackChunkName: "fieldDependent" */'@/views/field-setting/index.vue');
    },
    // 关联关系表
    associationTable: () => {
        return import(/* webpackChunkName: "associationTable" */'@/views/association/associationTable.vue');
    },
    // 业务对象设置
    businessObject: () => {
        return import(/* webpackChunkName: "businessObject" */'@/views/business-object/index');
    },
    // 消息通知设置
    noticeSetting: () => {
        return import(/* webpackChunkName: "noticeSetting" */'@/views/noticeSetting/noticeSettingTable.vue');
    }
};


export const routes = [
    {
        path: '/systemSettings/home',
        name: 'permisssystem',
        component: ROUTER_LIST['indexHome']
    },
    {
        path: '/page1',
        name: 'page1',
        component: ROUTER_LIST['indexHome']
    },
    {
        path: '/systemSettings/organizational/optiondepartment',
        name: 'optiondepartment',
        component: ROUTER_LIST['addandeditdepartment']
    },
    {
        path: '/login',
        name: 'login',
        component: ROUTER_LIST['login']
    },
    {
        path: '/register',
        name: 'register',
        component: ROUTER_LIST['register']
    },
    {
        path: '/gatePassDetail',
        name: 'gatePassDetail',
        component: ROUTER_LIST['gatePassDetail']
    },
    {
        path: '/themeTest',
        name: 'themeTest',
        component: ROUTER_LIST['themeTest']
    },
    {
        path: '/systemSettings/organizational/departmentAndMember',
        name: 'departmentAndMember',
        component: ROUTER_LIST['departmentAndMember']
    },
    {
        path: '/systemSettings/organizational/deptuser',
        name: 'departmentAndMember2',
        component: ROUTER_LIST['departmentAndMember']
    },
    {
        path: '/systemSettings/organizational/rolePermission',
        name: 'rolePermission',
        component: ROUTER_LIST['rolePermission']
    },
    {
        path: '/systemSettings/organizational/permissionRule',
        name: 'permissionRule',
        component: ROUTER_LIST['permissionRule']
    },
    {
        path: '/systemSettings/organizational/custompermissionrules',
        name: 'permissionRule2',
        component: ROUTER_LIST['permissionRule']
    },
    {
        path: '/systemSettings/company',
        name: 'company',
        component: ROUTER_LIST['company']
    },
    {
        path: '/systemSettings/organizational/memberRanksAndPositions',
        name: 'memberRanksAndPositions',
        component: ROUTER_LIST['memberRanksAndPositions']
    },
    {
        path: '/systemSettings/organizational/leveljob',
        name: 'memberRanksAndPositions2',
        component: ROUTER_LIST['memberRanksAndPositions']
    },
    {
        path: '/systemSettings/organizational/layoutSet',
        name: 'layoutSet',
        component: ROUTER_LIST['layoutSet']
    },
    {
        path: '/systemSettings/businessObjectAndField/generalOptionsSet',
        name: 'generalOptionsSet',
        component: ROUTER_LIST['generalOptionsSet']
    },
    {
        path: '/systemSettings/generalOptionsSet/fieldDependent',
        name: 'fieldDependent',
        component: ROUTER_LIST['fieldDependent']
    },
    {
        path: '/systemSettings/businessObjectAndField/businessObject',
        name: 'businessObject',
        component: ROUTER_LIST['businessObject']
    },
    {
        path: '/systemSettings/fieldobj/setobj',
        name: 'businessObject2',
        component: ROUTER_LIST['businessObject']
    },
    {
        path: '/systemSettings/businessObjectAndField/associationTable',
        name: 'associationTable',
        component: ROUTER_LIST['associationTable']
    },
    {
        path: '/systemSettings/fieldobj/relationship',
        name: 'associationTable2',
        component: ROUTER_LIST['associationTable']
    },
    {
        path: '/systemSettings/noticeSetting',
        name: 'noticeSetting',
        component: ROUTER_LIST['noticeSetting']
    }
];

