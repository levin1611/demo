import { registerMicroApps, addGlobalUncaughtErrorHandler, start } from 'qiankun';
import { apps } from './apps';
const whiteListHost = ['//api.map.baidu.com', '//maponline0.bdimg.com', '//bqq.gtimg.com', '//t.gdt.qq.com', '//api-automatic-site.leadscloud.com', '//admin.qidian.qq.com', '//wa03.leadscloud.com/'];

registerMicroApps(apps, { // 全局的微应用的生命周期钩子
    beforeLoad: (app) => {
        // console.log('before load ================', app);
        return Promise.resolve();
    },
    afterMount: (app) => {
        // console.log('after mount ================', app);
        return Promise.resolve();
    }
});

// 全局的未捕获异常处理器，捕捉微应用的报错信息
addGlobalUncaughtErrorHandler((event) => {
    console.error(event);
    const { message: msg } = event;
    if (msg && msg.includes('died in status LOADING_SOURCE_CODE')) {
        console.error('微应用加载时，请检查应用是否可运行');
        // 加载失败后再次起一次
        qiankunAppStatus = false;
        startQiankunServe();
    }
});
export let qiankunAppStatus = false; // 记录乾坤的启动状态
export function startQiankunServe(fileName){
    if(!qiankunAppStatus){
        console.log('%c 启动乾坤app，当前函数调用的位置是在'+fileName, 'color:green')

        start({
            prefetch: true,
            excludeAssetFilter: (uri) => {
                return whiteListHost.some((path) => {
                    return uri.indexOf(path) !== -1;
                });
            },
            async fetch(url, ...args) {
                // if (url === 'http://to-be-replaced.js') {
                //     return {
                //         async text() {
                //             return '';
                //         }
                //     };
                // }
                return window.fetch(url, ...args);
            }
        });
        qiankunAppStatus = true;
    }else{
        console.log('%c 乾坤app已经启动 不需要再次启动', 'color:green')
    }

}


