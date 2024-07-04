<!-- 头部标题和重要信息设置 弹框 -->
<template>
    <el-dialog
        v-model="visible"
        :title="$t('layout.headTitleAndImportantInfoSet')"
        width="1000px"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @opened="handleOpen"
        @closed="handleClosed"
        class="headerInfoSet"
    >
        <!-- loading 用的无意义 div -->
        <div ref="dialogBodyRef"></div>

        <!-- 展示字段 -->
        <div class="h-75">
            <customSort
                :config="{ id: 'id', label: 'name', checked: 'checked' }"
                :itemList="allFields"
                :defaultCheck="selectedFieldIds"
                :max="5"
                ref="fieldCheckRef"
            ></customSort>
        </div>

        <!-- 操作按钮 -->
        <div class="h-50">
            <customSort
                :config="{ id: 'id', label: 'name', checked: 'checked' }"
                :itemList="allButtons"
                :defaultCheck="selectedButtonIds"
                ref="buttonCheckRef"
            ></customSort>
        </div>

        <!-- footer -->
        <template #footer>
            <div class="dialog-footer">
                <!-- cancel -->
                <el-button
                    @click="visible = false"
                    class="useBrandColor"
                >{{ $t('cancel') }}</el-button>
                <!-- save -->
                <el-button
                    type="primary"
                    @click="submit"
                >{{ $t('save') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, toRef, unref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';
import useElDialogLoading from '@/hooks/useElDialogLoading';
import {customSort} from 'xhl_lib';


// 定义 model
const visible = defineModel('visible', { type: Boolean, default: false });
// 接受外部传参
const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    settings: {
        type: Object,
        default: () => ({})
    }
});
// 定义 emit
const emits = defineEmits([
    'update:loading',
    'update:settings',
    'save'
]);

const { t } = useI18n();

// 全局变量
// loading
const loading = toRef(props, 'loading');

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
};
// 弹框关闭后
const handleClosed = () => {
    // 清除数据
    clearData();
};
// 清除数据
const clearData = () => {
    allFields.value = [];
    selectedFieldIds.value = [];
    allButtons.value = [];
    selectedButtonIds.value = [];
};

// 展示字段
// 取排序组件
const fieldCheckRef = ref(null);
// 所有选中字段 id 集合
const selectedFieldIds = ref([]);
// 所有字段
const allFields = ref([]);
// 计算展示字段数据
const handleFieldsData = ({ headerAllFields, headerTitleFieldId, headerFields }) => {
    // 全部字段处理
    const tmpAllFields = [
        {
            headTitle: t('layout.showFields'),
            headTips: t('layout.selectShowFieldsMaxNum', { max: 5 }),
            checkMapLists: cloneDeep(
                Array.isArray(headerAllFields)
                    ? headerAllFields.filter((item) => `${item.id}` !== `${headerTitleFieldId}`)
                    : []
            )
        }
    ];
    allFields.value = tmpAllFields;

    // 选中字段处理
    selectedFieldIds.value = cloneDeep(Array.isArray(headerFields) ? headerFields : []);
};

// 操作按钮
// 取排序组件
const buttonCheckRef = ref(null);
// 所有选中按钮 id 集合
const selectedButtonIds = ref([]);
// 所有按钮
const allButtons = ref([]);
// 计算操作按钮数据
const handleButtonsData = ({ headerAllButtons, headerCommonButton, headerMoreButton }) => {
    // 全部按钮处理
    allButtons.value = [
        {
            headTitle: t('layout.operateBtn'),
            headTips: t('layout.showOperateBtnMaxNum', { max: 3 }),
            checkMapLists: cloneDeep(Array.isArray(headerAllButtons) ? headerAllButtons : [])
        }
    ];

    // 选中按钮处理
    selectedButtonIds.value = (Array.isArray(headerCommonButton) ? headerCommonButton : []).concat((Array.isArray(headerMoreButton) ? headerMoreButton : []));
};

// footer
// 点击提交按钮
const submit = async () => {
    // 组装待保存数据
    // 待保存数据
    const savingSetData = {
        headerFields: [],
        headerCommonButton: [],
        headerMoreButton: []
    };

    // 取选中字段
    savingSetData.headerFields = unref(fieldCheckRef.value?.getCheckData().normalResult || []);
    // 取选中按钮
    const allSelButtonIds = unref(buttonCheckRef.value?.getCheckData().normalResult || []);
    savingSetData.headerCommonButton = allSelButtonIds.slice(0, 3); // 前三个按钮放外面
    savingSetData.headerMoreButton = allSelButtonIds.slice(3); // 后面的放到"更多"

    // 传给父组件保存
    emits('save', savingSetData);
};

// open 回调不触发, opened 回调里处理数据会导致页面闪烁, 因此监听 visible: true 来处理数据
watch(
    () => visible.value,
    (val) => {
        if (val) {
            // 字段数据处理
            handleFieldsData(props.settings);
            // 按钮数据处理
            handleButtonsData(props.settings);
        }
    },
    {
        immediate: true
    }
);
</script>

<style lang="scss" scoped>
.headerInfoSet {
}
</style>
