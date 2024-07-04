let config = {
    sdk: 'NIM_Web_SDK_v6.8.0.js',

    // 资源路径根目录，为了方便用户部署在二级以上URL路径上
    resourceUrl: 'http://yx-web.nos.netease.com/webdoc/h5',
    // 用户logo地址
    logo: 'http://yx-web.nos.netease.com/webdoc/h5/im/logo.png',
    // 默认用户头像
    defaultUserIcon: 'http://yx-web.nos.netease.com/webdoc/h5/im/default-icon.png',
    // 系统通知图标
    noticeIcon: 'http://yx-web.nos.netease.com/webdoc/h5/im/notice-icon.png',
    // 我的手机图标
    myPhoneIcon: 'http://yx-web.nos.netease.com/webdoc/h5/im/my-phone.png',
    // 本地消息显示数量，会影响性能
    localMsglimit: 36,
    /**
     * @description 配置显示在浏览器标签的title
     */
    title: 'iView-admin',
    /**
     * @description token在Cookie中存储的天数，默认1天
     */
    cookieExpires: 1,
    /**
     * @description 是否使用国际化，默认为false
     *              如果不使用，则需要在路由中给需要在菜单中展示的路由设置meta: {title: 'xxx'}
     *              用来在菜单中显示文字
     */
    useI18n: true
};

const env = 'online';

let appConfig = {
    // 用户的appkey
    // 用于在web demo中注册账号异步请求demo 服务器中使用
    // test: {
    //   appkey: 'fe416640c8e8a72734219e1847ad2547',
    //   postUrl: 'https://apptest.netease.im'
    // },
    online: {
        appkey: '216ec91d0f9c962dd8134033c9a5aa22',
        postUrl: 'https://app.netease.im'
    }
};

config = Object.assign(config, appConfig[env]);

export default config;


