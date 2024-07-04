<!-- 通用的 confirm dialog -->
<template>
    <el-dialog
        v-model="visible"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :width="width"
        @open="handleOpen"
        @close="handleClose"
        ref="dialogRef"
        class="confirmDialog"
    >
        <!-- body -->
        <template #default>
            <div ref="dialogBodyRef">{{ tipContent }}</div>
        </template>

        <!-- footer -->
        <template
            v-if="footerBtns.length"
            #footer>
            <div class="dialog-footer">
                <!-- cancel -->
                <el-button
                    v-if="footerBtns.includes('cancel')"
                    @click="visible = false"
                    class="useBrandColor"
                >{{ $t('cancel') }}</el-button>
                <!-- confirm -->
                <el-button
                    v-if="footerBtns.includes('confirm')"
                    type="primary"
                    @click="confirm"
                >{{ confirmBtnText || $t('confirm') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, toRef } from 'vue';
import useElDialogLoading from '@/hooks/useElDialogLoading';

// 定义 model
const visible = defineModel('visible', { type: Boolean, default: false });
// 接受外部传参
const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    // 显示内容
    tipContent: {
        type: String,
        default: ''
    },
    // 底部按钮
    footerBtns: {
        type: Array,
        default() {
            return ['confirm', 'cancel'];
        }
    },
    confirmBtnText: {
        type: String
    },
    width: {
        type: String,
        default: '500px'
    }
});
// 定义 emit
const emits = defineEmits(['confirm', 'cancel']);

// 处理 loading 逻辑
// 暂存 dialog DOM
let dialogEl;
// 取 dialog 组件 body ref
const dialogBodyRef = ref(null);
// 弹框打开回调
const handleOpen = () => {
    // 如果之前没获取过 dialog DOM, 说明是首次 open
    if (!dialogEl) {
        // 获取 dialog DOM
        ({ dialogEl } = useElDialogLoading(dialogBodyRef, toRef(props, 'loading')));
    }
};
// 弹框关闭回调
const handleClose = () => {
    emits('cancel');
};

// footer
const confirm = async () => {
    // 确认按钮点击事件
    // 触发 confirm 事件
    emits('confirm');
};
</script>

<style lang="scss" scoped>
.confirmDialog {
}
</style>