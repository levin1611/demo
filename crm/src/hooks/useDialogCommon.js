// 封装 dialog 的通用逻辑
import { ref, watch } from 'vue';

const useDialogCommon = (props, emits) => {
    // 标记当前 dialog 是否显示
    let dialogVisible = ref(false);
    // 关闭 dialog
    function closeDialog(cb) {
        dialogVisible.value = false;
        emits('cancel');
        if (typeof cb === 'function') {
            // cb是一个函数
            cb();
        }
    }

    // 监听外部 visible 的变化, 更新内部 visible
    watch(
        () => props.visible,
        (val) => {
            dialogVisible.value = val;
        },
        { immediate: true }
    );
    // 监听内部 visible 的变化, 更新外部 visible
    watch(
        dialogVisible,
        (val) => {
            emits('update:visible', val);
        }
    );

    return {
        dialogVisible,
        closeDialog
    };
};

export default useDialogCommon;
