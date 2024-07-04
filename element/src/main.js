import Vue from 'vue';
import i18n from '@/locale';
import './plugins/Element/element.js';
import './plugins/Element/element.scss';
import 'vxe-table/lib/style.css';
import './plugins/View-Design/view-design.js';
import 'view-design/dist/styles/iview.css';
import './styles/iviewIcons3Merge2/style.less';
import './styles/customFont/style.less';
import { router } from './router/index';
import { appRouter } from './router/router';
import store from './store';
import App from './App.vue';
import { HANDLE_EXIT } from '@/api/config';
import ElementLocale from 'element-ui/lib/locale';
import './styles/recoverCommon.scss'; // 引入修正样式进行基础覆盖
import { Message } from 'element-ui';
import { EventBus } from '@/utils/EventBus';
import Icon from '@/plugins/custom/icon';
import HelpTip from '@/plugins/custom/helpTip';
import commonApi from '@/api/newCommon';
import { VXETable, Column, Table, Tooltip } from 'vxe-table';
import aiToolBar from './views/ai-toolbar/toolbar';
Vue.use(VXETable).use(Column).use(Table).use(Tooltip);

Vue.component('Icon', Icon);
Vue.component('HelpTip', HelpTip);
Vue.prototype.$commonApi = commonApi;
Vue.prototype.bus = Vue.prototype.$EVENTBUS = EventBus;
Vue.prototype.$aiToolBar = aiToolBar;

ElementLocale.i18n((key, value) => i18n.t(key, value));

store.commit('switchLang', Vue.config.lang);

Vue.config.productionTip = false;
Vue.config.silent = true;

Vue.prototype.$rootRouter = router;
// 非法退出的监听和处理
HANDLE_EXIT();
// 非法退出的监听和处理结束
/* 全局捕获异常(目前只处理资源加载失败情况), 得在页面元素渲染之前加载好 */
// 参考: [一篇文章教你如何捕获前端错误](https://www.cnblogs.com/vivotech/p/11162672.html)
// 暂存"加载失败" Message 实例
let messageInstance;
window.addEventListener(
    'error',
    (event) => {
        if (event) {
            const target = event.target || event.srcElement;
            // 过滤掉 js error
            const isElementTarget = target instanceof HTMLElement;
            if (!isElementTarget) return;

            // 系统更新, 导致 chunk 加载失败, 给出提示, 并跳转到登录页
            let isChunkLoadFailed = false;
            if (target.tagName === 'SCRIPT') {
                const reg = new RegExp(`${window.location.origin}chunk(.*?).js`, 'gi');
                if (reg.test(`${target.src}`)) {
                    isChunkLoadFailed = true;
                }
            } else if (target.tagName === 'LINK') {
                const reg = new RegExp(`${window.location.origin}chunk(.*?).css`, 'gi');
                if (reg.test(`${target.href}`)) {
                    isChunkLoadFailed = true;
                }
            }
            if (isChunkLoadFailed) {
                if (!messageInstance) {
                    messageInstance = Message({
                        message: i18n.t('error_pageUpdated'),
                        type: 'error',
                        onClose: () => {
                            messageInstance = undefined;
                        },
                    });
                }
                return;
            }

            // 音频文件加载失败处理
            if (target.error && target.error.code === 4 && this.loadCount < 10) {
                const currentSrc = target.currentSrc;
                target.src = currentSrc;
                this.loadCount++;
            } else {
                // 不再处理
            }
        }
    // 设为true表示捕获阶段调用，会在元素的onerror前调用
    },
    true
);

// 检测地址栏是否通过 outlook 回调跳转过来的  关闭窗口
if (window.location.href.indexOf('closeFlag=1') !== -1) {
    window.opener = null;
    window.close();
}

// eslint-disable-next-line no-new
new Vue({
    el: '#app',
    router,
    store,
    i18n,
    render: (h) => h(App),
    mounted() {
    // 显示打开的页面的列表
        this.$store.commit('setOpenedList');
        this.$store.commit('initCachepage');
    },

    created() {
    // 每 60s 执行一次健康检查
        setInterval(() => {
            this.$store.commit('checkHealthFBUrl');
        }, 60000);

        const tagsList = [];
        appRouter.map((item) => {
            if (item.children.length <= 1) {
                tagsList.push(item.children[0]);
            } else {
                tagsList.push(...item.children);
            }
        });
        this.$store.commit('setTagsList', tagsList);
        this.$store.commit('setEventBus', this.bus); // 方便在store里调用Vue.use的相关组件
        // 这里代码不能改
        this.$EVENTBUS.$on('getElementZinx', () => {
            // element获取当前index层级
            this.$EVENTBUS.$emit('setzIndexelement', this.$store);
        });
    }
});

// 频繁切换组件后, this.$t 可能取不到 this 导致报错
// 定位邮件切换箱体内存泄漏问题时, 我是注释大块代码后在左侧目录快速切换箱体 50 次看看内存上升多少, 发现在这种情况下控制台经常报错"TypeError: Cannot read property '_t' of null", 这时内存有变化
// 搜了下, 找到一个回答 https://stackoverflow.com/questions/54666293/vue-i18n-cannot-read-property-t-of-undefined-at-proxy-vue-t
// 照着这个, 在 main.js 最底部加上了 'Vue.prototype._i18n = i18n;' , 提示语消失了, 不过之后又有出现, 只是频率降低很多, 有兴趣的可以继续看看
Vue.prototype._i18n = i18n;
