// el-dialog 懒渲染, 需要在 open 时(opened 或 open 回调)获取 DOM 元素

import { ref } from 'vue';
// 获取全局 scss 变量, 以获取 element-plus 的命名空间
import CSSVariables from '@/style/js.module.scss';
const { elnamespace } = CSSVariables;

// 获取弹框本身元素
const useGetElDialogDom = (elRef) => {
    // 弹框本身 DOM 元素
    let dialogEl;
    if (!dialogEl) {
        dialogEl = ref(elRef).value.closest(`.${elnamespace}-dialog`);
    }

    return { dialogEl };
};

export default useGetElDialogDom;
