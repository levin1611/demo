<!-- 配置可用字段 dialog -->
<template>
    <el-dialog
        v-model="dialogVisible"
        v-loading="dataLoading"
        @open="handleOpen"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        width="1000"
        class="configure-available-fields-dialog"
    >
        <template #title>
            <div class="configure-available-fields-dialog-title">{{ $t('bizObject.configureAvailableFields') }}</div>
        </template>
        <!-- body -->
        <template #default>
            <div ref="dialogBodyRef">
                <el-input
                    v-model="input"
                    :placeholder="$t('bizObject.searchFields')"
                    clearable
                    :suffix-icon="Search"
                    @change="handleSearch"
                    class="search-input"
                />
                <template v-if="selectList.length">
                    <el-checkbox-group
                        v-model="selectedList"
                        class="check-group-conteiner"
                    >
                        <span v-for="item in selectList" :key="item.value">
                            <el-checkbox
                                :label="item.value"
                                :disabled="item.predefinedFlag"
                            >
                                <template v-if="item.label.replace(/[^\x00-\xff]/gi, '--').length > 19">
                                    <el-tooltip
                                        :content="item.label"
                                        placement="top"
                                        :show-after="500"
                                        :hide-after="0"
                                    >
                                        <div>{{ item.label }}</div>
                                    </el-tooltip>
                                </template>
                                <template v-else>
                                    <div>{{ item.label }}</div>
                                </template>
                            </el-checkbox>
                        </span>
                    </el-checkbox-group>
                </template>
                <template v-else>
                    <el-empty style="height: 420px;" description="没有数据" />
                </template>
            </div>
        </template>

        <!-- footer -->
        <template #footer>
            <div class="dialog-footer">
                <!-- cancel -->
                <el-button
                    @click="closeDialog"
                    class="useBrandColor"
                >{{ $t('cancel') }}</el-button>
                <!-- confirm -->
                <el-button
                    type="primary"
                    :loading="confirmLoading"
                    @click="confirm"
                >{{ confirmBtnText || $t('confirm') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, toRefs, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';
import useDialogCommon from '@/hooks/useDialogCommon';
import useElDialogLoading from '@/hooks/useElDialogLoading';
import { getAllFields, updateAvailableField } from '@/api/businessObjects.js';
import { CODESTATE } from '@/https/codeConfig';
import { useUserStore } from '@/pinia/modules/user.js';
import { useI18n } from 'vue-i18n';
// 多语言
const { t } = useI18n();
// 取 pinia 数据
const store = useUserStore();
const input = ref('');
// 搜索
const handleSearch = (e) => {
    geFieldstList(e);
};

// 选中的字段列表
const selectedList = ref([]);
// 所有字段列表
const selectList = ref([]);

// 接受外部传参
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    currentBizObjTypeRow: {
        type: Object,
        default: () => ({})
    }
});
// 定义 emit
const emits = defineEmits(['update:visible', 'confirm', 'cancel']);
// 取通用的 dialog 逻辑相关参数
const {
    dialogVisible,
    closeDialog
} = useDialogCommon(props, emits);
// 解构 props
const { currentBizObjTypeRow } = toRefs(props);

// loading
const confirmLoading = ref(false);

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
        ({ dialogEl } = useElDialogLoading(dialogBodyRef, confirmLoading));
    }
};

// footer
const confirm = async () => {
    confirmLoading.value = true;
    // 确认按钮点击事件
    updateAvailableField({
        orgId: store.orgId,
        objectId: currentBizObjTypeRow.value.objectId,
        objectTypeId: currentBizObjTypeRow.value.id,
        selected: selectedList.value
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            ElMessage.success(t('bizObject.configureSuccessfully'));
            // 触发 confirm 事件
            emits('confirm');
        } else {
            ElMessage.error(res.messageShow);
        }
        confirmLoading.value = false;
    }).catch(err => {
        confirmLoading.value = false;
        console.error(err);
        ElMessage.error(err.messageShow);
    });
};

// loading
const dataLoading = ref(false);
// 处理数据
const handleData = data => data.map(item => {
    if (item.usageFlag === 1) {
        selectedList.value.push(item.fieldId);
    }
    return ({
        id: item.fieldId,
        value: item.fieldId,
        label: item.displayName,
        predefinedFlag: item.editFlag === 0 // 禁用标识
    });
});
// 获取配置可用字段列表
const geFieldstList = (nameQuery) => {
    const queryObj = {
        orgId: store.orgId,
        objectId: currentBizObjTypeRow.value.objectId,
        objectTypeId: currentBizObjTypeRow.value.id
    };
    if (nameQuery) {
        queryObj.nameQuery = nameQuery;
    }
    dataLoading.value = true;
    getAllFields(queryObj).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            const { data } = res;
            selectList.value = handleData(data);
        } else {
            ElMessage.error(res.messageShow);
        }
        dataLoading.value = false;
    }).catch(err => {
        dataLoading.value = false;
        console.error(err);
        ElMessage.error(err.messageShow);
    });
};
watch(dialogVisible, (val) => {
    if (val) {
        input.value = '';
        selectList.value = [];
        selectedList.value = [];
        geFieldstList();
    }
});
</script>

<style lang="scss" scoped>
.configure-available-fields-dialog {
    .search-input {
        width: 240px;
        margin-top: 4px;
        margin-bottom: 16px;
    }
    .check-group-conteiner {
        display: grid;
        grid-template-columns: repeat(5, 20%);
        grid-template-rows: repeat(auto-fill, 30px);
        height: 420px;
        max-height: 420px;
        overflow-y: auto;
        div {
            max-width: 140px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}
</style>