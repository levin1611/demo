<!-- 头部标题和重要信息设置 弹框 -->
<template>
    <el-dialog
        v-model="visible"
        :title="$t('layout.compoSet_relevantList')"
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
                ref="fieldCheckRef"
            ></customSort>
        </div>
        <section class="parmas_wrap">
            <div class="params" >
                <div class="label_title">
                    排序规则
                </div>
                <el-select 
                    v-model="sortField" 
                    style="width: 200px;margin-right: 20px;"
                    placeholder="请选择">
                    <el-option :label="item.name" :value="item.id" v-for="item in sortFieldOptions" :key="item.id"/>
                </el-select>
                <el-radio-group 
                    
                    v-model="sortType">
                    <el-radio :label="0" size="large">升序</el-radio>
                    <el-radio :label="1" size="large">降序</el-radio>
                </el-radio-group>
            </div>

            <div class="params" >
                <div class="label_title">
                    展示方式
                </div>
                <el-radio-group 
                    v-model="showType">
                    <el-radio :label="0" size="large">卡片（适合较少数据量的展示，字段显示前四个）</el-radio>
                    <el-radio :label="1" size="large">表格（适合较多数据量的展示，显示全部字段）</el-radio>
                </el-radio-group>
           
            </div>
        </section>

        <!-- 操作按钮 -->
        <!-- <div class="h-50">
            <customSort
                :config="{ id: 'id', label: 'name', checked: 'checked' }"
                :itemList="allButtons"
                :defaultCheck="selectedButtonIds"
                ref="buttonCheckRef"
            ></customSort>
        </div> -->

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
import { cloneDeep } from 'lodash';
import useElDialogLoading from '@/hooks/useElDialogLoading';
import {customSort} from 'xhl_lib';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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

// 全局变量
// loading
const loading = toRef(props, 'loading');
const sortField = ref(); // 排序字段 
let sortFieldOptions = ref([]); // 排序字段选项
const sortType = ref(0); // 排序方式0:升序 1:降序
const showType = ref(0); // 展示方式 0 卡片 1表格

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
const handleFieldsData = ({ headerAllFields, headerSelectedFields}) => {
    // 全部字段处理
    const tmpAllFields = [
        {
            headTitle: t('layout.showFields'),
            checkMapLists: cloneDeep(Array.isArray(headerAllFields) ? headerAllFields : []).map(item => {
                item.disabled = (item.deleteConfigFlag === 0);
                return item;
            })
        }
    ];
    sortFieldOptions.value = (headerAllFields || []).filter((item) => ![6, 7, 26, 27, 30, 33].includes(item.dataType));
    allFields.value = tmpAllFields;

    // 选中字段处理
    selectedFieldIds.value = Array.isArray(headerSelectedFields) ? headerSelectedFields : [] ;

};

const handleSortAndLayout = (data) => {
    sortField.value = data.sortField || data.sortFieldId;
    sortType.value = data.sortType;
    showType.value = data.showType;
    
};
// 操作按钮
// 取排序组件
const buttonCheckRef = ref(null);
// 所有选中按钮 id 集合
const selectedButtonIds = ref([]);
// 所有按钮
const allButtons = ref([]);
// 计算操作按钮数据
const handleButtonsData = ({ headerAllButtons, headerCommonButtons }) => {
    // 全部按钮处理
    allButtons.value = [
        {
            headTitle: t('layout.operateBtn'),
            headTips: t('layout.showOperateBtnMaxNum', { max: 4 }),
            checkMapLists: cloneDeep(Array.isArray(headerAllButtons) ? headerAllButtons : []).map(item => {
                item.disabled = (item.deleteConfigFlag === 0);
                return item;
            })
        }
    ];

    // 选中按钮处理
    // selectedButtonIds.value = cloneDeep(Array.isArray(headerCommonButtons) ? headerCommonButtons : []);
};

// footer
// 点击提交按钮
const submit = async () => {
    // 组装待保存数据
    // 待保存数据
    const savingSetData = {
        headerSelectedFields: [],
        headerCommonButtons: [],
        headerMoreButtons: [],
        showType: showType.value,
        sortField: sortField.value,
        sortType: sortType.value
    };

    // 取选中字段
    savingSetData.headerSelectedFields = unref(fieldCheckRef.value?.getCheckData().normalResult || []);
    // 取选中按钮
    const allSelButtonIds = unref(buttonCheckRef.value?.getCheckData().normalResult || []);
    savingSetData.headerCommonButtons = allSelButtonIds.slice(0, 3); // 前三个按钮放外面
    savingSetData.headerMoreButtons = allSelButtonIds.slice(3); // 后面的放到"更多"

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
            // handleButtonsData(props.settings);
            // 处理排序方式
            handleSortAndLayout(props.settings);
        }
    },
    {
        immediate: true
    }
);
</script>

<style lang="scss" scoped>
.parmas_wrap{
    padding: 12px 0;
    .params{
        display: flex;
        align-items: center;
        .label_title{
            margin-right: 20px;
        }
        margin-bottom: 5px;
    }
}
</style>
