<!-- 编辑 一般成员私池上限 弹框 -->
<template>
    <el-dialog
        v-model="visible"
        :title="t('privatePool.setPrivatePoolLimit')"
        width="500px"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @open="handleOpen"
        @closed="handleClosed"
        class="editGeneralMember"
    >
        <!-- loading 用的无意义 div -->
        <div ref="dialogBodyRef"></div>

        <!-- form -->
        <!-- radio group -->
        <el-radio-group v-model="formData.limitedFlag">
            <el-radio :label="0">{{ $t('unlimited') }}</el-radio>
            <el-radio :label="1">{{ $t('privatePool.objLimit', { name: currentSettingRow.displayName }) }}
                <el-input-number
                    v-model="formData.maxCapacity"
                    :min="0"
                    :max="2147483647"
                ></el-input-number>
            </el-radio>
        </el-radio-group>

        <!-- footer -->
        <template #footer>
            <div class="dialog-footer">
                <!-- cancel -->
                <el-button
                    @click="visible = false"
                    class="useBrandColor"
                >{{ $t('cancel') }}</el-button>
                <!-- confirm -->
                <el-button
                    type="primary"
                    @click="submit"
                >{{ $t('confirm') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { updateHighSeasConfig } from '@/api/highSeas';
import useElDialogLoading from '@/hooks/useElDialogLoading';

// inject
const currentSettingRow = inject('currentSettingRow');
// model
const visible = defineModel('visible', { type: Boolean, default: false });
const limitedFlag = defineModel('limitedFlag');
const maxCapacity = defineModel('maxCapacity');

// 全局
// loading
const loading = ref(false);
// 多语言
const { t } = useI18n();

// 处理 loading 逻辑
// 暂存 dialog DOM
let dialogEl;
// 取 dialog 组件 body ref
const dialogBodyRef = ref(null);

// 弹框打开关闭回调
// 弹框打开前
const handleOpen = () => {
    // 处理 loading 逻辑
    // 如果之前没获取过 dialog DOM, 说明是首次 open
    if (!dialogEl) {
        // 获取 dialog DOM
        ({ dialogEl } = useElDialogLoading(dialogBodyRef, loading));
    }

    // 表单数据处理
    formData.value.limitedFlag = limitedFlag.value;
    formData.value.maxCapacity = maxCapacity.value;
};
// 弹框关闭后
const handleClosed = () => {
};

// 表单
// 表单数据
const formData = ref({
    limitedFlag: 0,
    maxCapacity: 0
});

// footer
const submit = async () => {
    // 显示 loading
    loading.value = true;
    // 提交表单
    const params = {
        objectId: currentSettingRow.value.id,
        limitedFlag: formData.value.limitedFlag,
        maxCapacity: formData.value.maxCapacity
    };
    const res = await updateHighSeasConfig(params);
    if (res.code === 10000) {
        // 成功

        // 关闭弹框
        visible.value = false;
        // 更新外部数据
        limitedFlag.value = params.limitedFlag;
        maxCapacity.value = params.maxCapacity;
    } else {
        // 失败

        ElMessage.error(res.message);
    }
    // 取消 loading
    loading.value = false;
};
</script>

<style lang="scss">
.editGeneralMember {
    .#{$elnamespace}-radio-group {
        align-items: normal;
        flex-direction: column;
    }
}
</style>