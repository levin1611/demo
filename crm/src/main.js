import './public-path';
import { createApp, ref } from 'vue';
import App from './App.vue';
import i18n from '@/locale';

import router from '@/router/index';

// 引入 element-plus
// import ElementPlus from 'element-plus';
// 引入 element-plus 样式
import 'element-plus/theme-chalk/src/index.scss';
// 定制修改 element 相关样式/css 变量
import '@/plugins/element-plus/element_global.scss';
// 定制修改 element-plus 组件 props 默认值等
import '@/plugins/element-plus/element_custom.js';

// 引入通用样式
import '@/style/global.scss';

import pinia from '@/pinia';
import useLocallang from 'xhl_lib/xhl-ui/tools/lang';
import setXhlElZIndex from 'xhl_lib/xhl-ui/tools/elementZindex.js';


// import pinia from '@/pinia';
import direction from '@/directives';
import base from '@/utils/base';
import actions from '@/micros/actions.js';
import VXETable from 'vxe-table';
import { useZIndex } from 'element-plus';

import 'vxe-table/lib/style.css';


let app = null;
function render_app(props) {
    if (props) actions.setActions(props);
    app = createApp(App);
    // app.config.warnHandler = (msg) => {};
    app.use(i18n).
        use(router).
        // use(ElementPlus).
        use(pinia).
        // useLocallang xhl_lib的多语言设置 需要传递一个 响应式ref
        use(useLocallang, ref('zh')).
        use(setXhlElZIndex, useZIndex()).
        use(direction).
        use(VXETable).
        use(base).mount('#permission_app_Id'); 
}

if (!window.__POWERED_BY_QIANKUN__) {
    render_app();
}

/**
 * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。
 * 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等。
 */
export async function bootstrap() {
    console.log('权限系统 app bootstraped');
}
  
/**
   * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
   */
export async function mount(props) {
    // props.onGlobalStateChange((state, prev) => {
    //     // state: 变更后的状态; prev 变更前的状态
    //     console.log(state, prev, '权限系统收到数据变化');
    // });
    console.log('权限系统 app mount', props);
    // props.setGlobalState({
    //     data: {
    //         type: 'handleLogin',
    //         content: {
    //             setUserName: '1111'
    //         }
    //     },
    // });
    render_app(props);
}
  
/**
   * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
   */
export async function unmount(props) {
    console.log('卸载权限系统');
    app.unmount();
    app = null;
}
  
/**
   * 可选生命周期钩子，仅使用 loadMicroApp 方式加载微应用时生效
   */
export async function update(props) {
    console.log('update props', props);
}
