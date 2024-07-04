import { useDebounceFn } from '@vueuse/core';
import CSSVariables from '@/style/js.module.scss';
const { elnamespace } = CSSVariables;

// 表单滚动加载数据 hooks
export default function useScrollableTableData(tableDom, tableLoading, queryData) {
    // 防抖
    const scrollBehavior = useDebounceFn((e) => {
        // do something
        handleScroll(e);
    }, 400);

    // 滚动行为
    function handleScroll(e) {
        // 只有在滚动方向为 'down' 时，才执行后面的代码
        if (e.deltaY > 0) {
            const scrollContainer = tableDom.value.$refs.bodyWrapper.querySelector(`.${elnamespace}-scrollbar__wrap`);
            const { clientHeight, scrollTop, scrollHeight } = scrollContainer;
            if (scrollTop > 0 && clientHeight + scrollTop === scrollHeight) {
                if (tableLoading && tableLoading.value) return;
                queryData('more');
            }
        }
    }

    return {
        scrollBehavior
    };
}