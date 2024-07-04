/**
 * 注册自定指令到全局
 */
import resize from './resize';
import scrollWheel from './scrollWheel';
import tableLoadMore from './tableLoadMore';
import outerScroll from './outerScroll';
import inputFocus from './inputFocus';
import dialogDrag from './dialogDrag';


const directives = {
    resize,
    scrollWheel,
    tableLoadMore,
    outerScroll,
    fo: inputFocus,
    dialogDrag
};

export default {
    install(app) {
        // 遍历 directives 对象的每一个 key
        Object.keys(directives).forEach((key) => {
            // 将 directives 对象中对应的 value 绑定到 app 的指令上
            app.directive(key, directives[key]);
        });
    }
};