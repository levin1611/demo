// el-dialog 使用 loading
// el-dialog 直接使用 loading 无效, 需要在 open 时获取 DOM 元素, 然后使用 el-loading 服务
import useGetElDialogDom from '@/hooks/useGetElDialogDom';
import useElLoadingInstance from '@/hooks/useElLoadingInstance';

// 注意, 需要在 el-dialog 的 opened 或 open 回调中使用
// 如果是 v-if 控制 el-dialog, 则在 open 回调不会触发, opened 回调正常
const useElDialogLoading = (dialogBodyRef, loading, otherLoadingSet = {}) => {
    // 获取弹框本身元素
    const { dialogEl } = useGetElDialogDom(dialogBodyRef);

    // dialog DOM 未获取到, 则返回空
    if (!dialogEl) {
        return {};
    }

    // 使用 loading 服务
    const { loadingInstance } = useElLoadingInstance(Object.assign({
        target: dialogEl,
        fullScreen: false
    }, otherLoadingSet), loading);

    return { dialogEl, loadingInstance };
};

export default useElDialogLoading;