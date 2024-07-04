<!-- 新建编辑 列表视图 布局 -->
<template>
    <div
        v-loading="loading"
        class="tablePageView"
    >
        <!-- header -->
        <div class="tablePageView-header">
            <!-- 标题 + 返回 -->
            <span
                @click="goBack"
                class="cursor-pointer"
            >
                <!-- 图标 -->
                <!-- <svg
                    aria-hidden="true"
                    class="svg-icon"
                >
                    <use xlink:href="#custom-back"></use>
                </svg> -->
                <span class="custom custom-arrow-left" style="font-size: 24px;"></span>
                <el-divider
                    direction="vertical"
                    class="mx-3"
                ></el-divider>
                <span>{{ title }}</span>
            </span>
        </div>

        <div :style="{height: pageHeight}" class="tablePageView-scroll-box">
            <!-- 布局名称 -->
            <div class="tablePageView-layoutName">
                <span>{{ $t('layout.viewName') }}</span>
                <el-input
                    v-model="layoutName"
                    maxlength="50"
                ></el-input>
            </div>

            <!-- 检索条件 -->
            <div class="tablePageView-total-field tablePageView-block">
                <p class="tablePageView-title">{{ $t('layout.searchCondition') }}</p>
                <allPurposeFilter
                    ref="setFilter"
                    :filterData="filterData.conditions"
                    :filterType="filterData.filterType"
                    :expression="filterData.expression"
                    :levelFields="false"
                    fieldsSelectorType="selectUserInfo"
                    :dataSource="dataSource"
                    :fieldsSource="fieldsSource"
                >
                </allPurposeFilter>
            </div>

            <!-- 显示字段 -->
            <div class="tablePageView-block">
                <p class="tablePageView-title">{{ $t('layout.displayField') }}</p>
                <customSort
                    :key="refreshCheckKey"
                    :config="{ id: 'id', label: 'name', checked: 'checked' }"
                    :itemList="allFields"
                    :defaultCheck="normalFieldIds"
                    :defaultCheckFreeze="freezeFieldIds"
                    :showFreeze="true"
                    :cloum="5"
                    ref="fieldCheckRef"
                ></customSort>
            </div>

            <!-- 排序规则 -->
            <div class="tablePageView-sortRule">
                <span>{{ $t('layout.sortRule') }}</span>
                <!-- 字段选择 -->
                <el-select
                    v-model="sortField"
                    class="field-item"
                    size="large"
                    style="width: 200px"
                >
                    <el-option
                        v-for="field in fieldList"
                        :key="field.id"
                        :label="field.name"
                        :value="field.id"></el-option>
                </el-select>
                <!-- 升序降序 -->
                <el-radio-group v-model="ascending">
                    <el-radio :label="0" size="large">{{ $t('asc') }}</el-radio>
                    <el-radio :label="1" size="large">{{ $t('desc') }}</el-radio>
                </el-radio-group>
            </div>
        </div>

        <footer style="background: #fff;position: relative;z-index: 1;">
            <!-- confirm -->
            <el-button
                type="primary"
                @click="submit"
            >{{ $t('save') }}</el-button>
            <el-button
                @click="goBack"
                class="useBrandColor"
            >{{ $t('cancel') }}</el-button>
        </footer>
    </div>

    <!-- 离开确认 弹框 -->
    <confirmDialog
        v-model:visible="visible_leaveConfirm"
        :title="$t('leaveConfirm')"
        :tip-content="$t('role.tip_leaveRoleDetail')"
        @confirm="handleLeaveConfirm"
        @cancel="handleLeaveCancel"
    ></confirmDialog>
</template>

<script setup>
import { ref, computed, inject, unref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useUserStore } from '@/pinia/modules/user';
import { useI18n } from 'vue-i18n';
import { saveLayoutSet, getLayoutSet, getLayoutInitData, createLayout } from '@/api/layout';
import { cloneDeep } from 'lodash';
import {customSort} from 'xhl_lib';

import allPurposeFilter from '@/components/allPurposeFilter.vue';
import confirmDialog from '@/components/confirmDialog.vue';
import { findListViewFilterFields, findListViewFilterFieldsRange } from '@/api/common'
import { setGlobalState } from '@/utils/common';

// 定义 model
const visible = defineModel('visible', { type: Boolean, default: false });
// 接受外部传参
const props = defineProps({
    operateType: {
        type: String,
        default: 'new'
    },
    layoutData: {
        type: Object,
        default: () => ({})
    },
    layoutConfig: {
        type: Object,
        default: () => ({})
    }
});
// 定义 emit
const emits = defineEmits([
    'update:layoutData',
    'operateSuccess'
]);
// 页面高度
const pageHeight = ref('calc(100vh - 168px)');

// 接收对象列表传参, 当前选中的对象
const currentSettingRow = inject('currentSettingRow');

// 翻译
const { t } = useI18n();

// 取 pinia 数据
const store = useUserStore();

// 全局变量
const loading = ref(false);

const fieldsSource = ref({
    methods: findListViewFilterFields,
    data: {
        objectId: currentSettingRow.value.id
    }
})

const dataSource = ref({
    methods: findListViewFilterFieldsRange,
    data: {
        objectId: currentSettingRow.value.id
    }
})

// 获取布局设置
// 保存所有初始数据
let initData = null;
// 保存设置数据
const settingData = ref({});
// 获取设置数据
const getSettings = async () => {
    // 显示 loading
    loading.value = true;

    // 发送请求
    let res;
    if (props.operateType === 'new') {
        // 新建布局

        // 获取初始空白数据
        res = await getLayoutInitData({
            layoutType: props.layoutConfig.layoutType,
            objectId: currentSettingRow.value.id
        });
    } else if (props.layoutData.layoutId) {
        // 编辑/复制 布局

        // 获取现有数据
        res = await getLayoutSet({
            id: props.layoutData.layoutId
        });
    }
    // 结果处理
    if (res && res.code === 10000) {
        settingData.value = handleData(res.data);
        // 暂存初始数据, 用于新建时对比数据看是否有修改
        initData = {};
        initData.settingData = JSON.parse(JSON.stringify(settingData.value));
        initData.layoutName = layoutName.value;
        // initData.filterData = JSON.parse(JSON.stringify(filterData.value));
        initData.normalFieldIds = JSON.parse(JSON.stringify(normalFieldIds.value));
        initData.freezeFieldIds = JSON.parse(JSON.stringify(freezeFieldIds.value));
        initData.sortField = sortField.value;
        initData.ascending = ascending.value;
    } else {
        // 请求失败

        initData = null;
        ElMessage.error(res.message);
    }

    // 取消 loading
    loading.value = false;
};
// 处理设置数据
const handleData = (data) => {
    if (!data) return {};
    
    // 处理布局名称
    if (data.layoutName) {
        switch (props.operateType) {
            case 'new':
                layoutName.value = '';
                break;
            case 'copy':
                layoutName.value = `${data.layoutName}1`;
                break;
            case 'edit':
            default:
                layoutName.value = data.layoutName;
        }
        // 字符上限 50
        layoutName.value = layoutName.value.trim().slice(0, 50);
    }

    // 检索条件数据处理
    filterData.value = data.searchCondition || {};

    // 展示字段数据处理
    allFields.value[0].checkMapLists = cloneDeep(data.layoutFieldInfoList?.allFieldList || []).map(item => {
        item.disabled = (item.deleteConfigFlag === 0);
        return item;
    });
    normalFieldIds.value = (data.layoutFieldInfoList?.selectedList || []).filter(item => !item.frozenFlag).map((item) => item.id);
    freezeFieldIds.value = (data.layoutFieldInfoList?.selectedList || []).filter(item => item.frozenFlag).map((item) => item.id);
    // 刷新选择组件
    refreshCheckKey.value++;

    // 排序规则数据处理
    // 图片, 文件, 多选, 地理定位, 引用 类型字段不支持排序
    fieldList.value = (data.layoutFieldInfoList?.allFieldList || []).filter((item) => ![6, 7, 26, 27, 30, 33].includes(item.dataType));
    if(data.layoutFieldInfoList?.allFieldList.find(v => v.id === data.sortField)) { 
        ascending.value = Number.isInteger(data.ascending) ? data.ascending : 1;
        sortField.value = data.sortField || '';
    } else {
        sortField.value = data.layoutFieldInfoList?.allFieldList.find(v => v.apiKey === 'createdTime').id;
        ascending.value = 1;
    }
    // sortField.value = data.sortField || '';
    // ascending.value = Number.isInteger(data.ascending) ? data.ascending : 1;

    return data;
};

// header
// 标题
const title = computed(() => {
    switch (props.operateType) {
        case 'new':
            return t('layout.createTablePageView');
        case 'edit':
            return t('layout.editTablePageView');
        case 'copy':
            return t('layout.copyTablePageView');
        default:
            return '';
    }
});

// 布局名称
const layoutName = ref('');
// 返回
const goBack = (force) => {
    // 如果要求强制返回, 则直接返回
    if (force === true) {
        visible.value = false;
        return;
    }

    // 新建布局时, 返回时需要判断数据是否有修改, 未保存则弹出提示框提示保存
    if (checkDataIsChanged()) {
        visible_leaveConfirm.value = true;
        return;
    }

    // 其他情况, 正常返回
    visible.value = false;
};
// 检查数据是否有变更
const checkDataIsChanged = () => {
    // 新建布局时, 判断数据是否有修改
    if (props.operateType === 'new' && initData) {
        // 取选中显示字段 - 冻结字段 + 非冻结字段
        const { freezeResult = [], normalResult = [] } = unref(fieldCheckRef.value?.getCheckSourceData() || {});
        // 取选中字段 id
        const normalFields = normalResult.map(item => item.id);
        const freezeFields = freezeResult.map(item => item.id);
        const filterParams = setFilter.value.getOriginalData();
        if (
            (JSON.stringify(initData.settingData) !== JSON.stringify(settingData.value))
            || (initData.layoutName !== layoutName.value)
            || (filterParams.filterType > 0 || filterParams.condition.length > 0)
            || (JSON.stringify(initData.normalFieldIds) !== JSON.stringify(normalFields))
            || (JSON.stringify(initData.freezeFieldIds) !== JSON.stringify(freezeFields))
            || (initData.sortField !== sortField.value)
            || (initData.ascending !== ascending.value)
        ) {
            return true;
        }
    }

    // 默认 false
    return false;
};

// 检索条件
// ref
const setFilter = ref(null);
const filterData = ref({});

// 展示字段
// 刷新选择组件
let refreshCheckKey = ref(0);
// ref
const fieldCheckRef = ref(null);
// 所有展示字段
let allFields = ref([
    {
        // headTitle: t('layout.displayField'),
        checkMapLists: []
    }
]);
// 非冻结列展示字段 ids
const normalFieldIds = ref([]);
// 冻结列展示字段 ids
const freezeFieldIds = ref([]);

// 排序规则
// 所有可选排序字段
const fieldList = ref([]);
// 排序字段 id
const sortField = ref('');
// 排序方式, 0 升序, 1 降序
const ascending = ref(1);

const handleFilterData = (obj) => {
    let _searchCondition = {};
    let conditions = [];
    _searchCondition.filterType = obj.filterType;
    _searchCondition.expression = obj.expression;
    let vertical = true;
    // if(obj.filterType > 0) {
    //     if(obj.condition.length > 0) {
    vertical = obj.condition.every(item => {
        if(!item.searchField?.id) {
            ElMessage.error('请选择检索字段');
            return false;
        }
        // 检索条件为空，则不做校验
        if(![12, 13].includes(item.matchType)) {
            // 条件是值
            if(item.condMode === 1) {
                // 校验检索字段的值
                // 如果是选择范围，则校验范围值
                if(item.matchType === 11) {
                    if((!item.values[0] && typeof(item.values[0]) !== 'number') || (!item.values[1] && typeof(item.values[1]) !== 'number')) {
                        ElMessage.error('检索字段的值不完整');
                        return false;
                    }
                    if(item.values[0] > item.values[1]) {
                        return false;
                    }
                } else {
                    if(!item.values[0] && typeof(item.values[0]) !== 'number') {
                        ElMessage.error('请选择检索字段的值');
                        return false;
                    }
                }
            } else if(item.condMode === 0) {
                // 条件是字段，校验检索字段的值
                if(!item.searchRange?.id) {
                    ElMessage.error('请选择检索字段的值');
                    return false;
                }
            }
        }
        if(item.searchRange) {
            item.searchRange.condMode = item.condMode;
            item.searchRange.values =  item.condMode === 1 ? item.values :  null
        }
        conditions.push({
            matchType: item.matchType,
            searchField: item.searchField,
            searchRange: [item.searchRange]
        })
        return true;
    })
    //     } else {
    //         vertical = false;
    //         ElMessage.error('请添加检索条件');
    //     }
        
    // } else {
    //     vertical = true;
    // }
    
    _searchCondition.conditions = conditions;
    console.log('重组后的数据：', _searchCondition)
    return vertical ? _searchCondition : false
}

// 离开确认弹框
const visible_leaveConfirm = ref(false);
// 离开确认
const handleLeaveConfirm = async () => {
    // 离开页面时通知基座, 当前页面退出编辑状态
    setGlobalState({
        editingState: {
            value: false,
            proj: 'permSys',
            triggerCompo: 'tablePageView',
            evtType: 'leaveConfirm'
        }
    });

    // 等一会儿, 基座可能需要路由跳转
    await nextTick();

    // 强制返回
    goBack(true);
};
// 取消离开
const handleLeaveCancel = () => {
    // 取消离开页面时通知基座
    setGlobalState({
        editingState: {
            value: true,
            proj: 'permSys',
            triggerCompo: 'tablePageView',
            evtType: 'leaveCancel'
        }
    });
};

// 保存
const submit = async () => {
    let obj = setFilter.value.getOriginalData()
    let searchCondition = handleFilterData(obj);
    if(!searchCondition) return;
    // 布局名称空值校验
    if (!layoutName.value.trim()) {
        ElMessage.error(t('mustInputWarn', { name: t('layout.viewName') }));
        return;
    }

    // 取选中显示字段 - 冻结字段 + 非冻结字段
    const { freezeResult = [], normalResult = [] } = unref(fieldCheckRef.value?.getCheckSourceData() || {});
    // 取选中字段数据
    const selectFieldIds = cloneDeep(freezeResult).map(i => (i.frozenFlag = true) && i).concat(cloneDeep(normalResult).map(i => (i.frozenFlag = false) || i));
    // 选中字段为空校验
    if (!selectFieldIds.length) {
        ElMessage.error(t('placeholder_select', { name: t('layout.displayField') }));
        return;
    }

    // 取检索条件数据
    // // const searchConditionVal = setFilter.value.getFilterValue();
    // const searchConditionVal = {};

    // 显示 loading
    loading.value = true;
    // 发送请求
    let res;
    let postData = {
        orgId: store.orgId,
        userId: store.userId,
        id: props.layoutData.layoutId,
        layoutName: layoutName.value.trim().slice(0, 50),
        objectId: currentSettingRow.value.id,
        selectFieldIds,
        searchCondition,
        sortField: sortField.value,
        ascending: ascending.value
    };
    if (['new', 'copy'].includes(props.operateType)) {
        // 新建/复制布局

        // 所有布局设置数据 -- 后端说新建布局时数据里有 id 不影响
        postData = Object.assign({}, settingData.value, postData);

        // 创建布局
        res = await createLayout(postData);
    } else {
        // 编辑布局

        // 只保存布局名称, 其他布局设置的数据由各自的编辑框保存
        res = await saveLayoutSet(postData);
    }
    // 结果处理
    if (res && res.code === 10000) {
        ElMessage.success(t('saveSuccess'));

        // 发送操作成功事件给上一级别
        emits('operateSuccess', postData, res.data);
        // 关闭当前页, 返回上一级
        goBack(true);
    } else {
        // 保存失败
        ElMessage.error({
            dangerouslyUseHTMLString: true,
            message: '<div style="line-height: 18px;text-align:center">' + res.messageShow.replace(/\r\n/g,'<br>') + '</div>'
        });
    }

    // 取消 loading
    loading.value = false;
};

// 监听 visible 以处理 open close 回调
watch(
    () => visible.value,
    (val) => {
        if (val) {
            // 获取布局设置
            getSettings();
        }
    },
    {
        immediate: true
    }
);

// 进入页面时通知基座, 当前页面处于编辑状态, 基座路由跳转需要
onMounted(() => {
    setGlobalState({
        editingState: {
            value: true,
            proj: 'permSys',
            triggerCompo: 'tablePageView',
            evtType: 'onMounted',
            beforeLeaveCb: () => {
                if (checkDataIsChanged()) {
                    // 弹出离开确认框
                    visible_leaveConfirm.value = true;

                    // 阻止基座路由跳转
                    return true;
                }

                // 默认不阻止基座路由跳转
                return false;
            }
        }
    });
});

// 离开页面时通知基座, 当前页面退出编辑状态, 基座路由跳转需要
onBeforeUnmount(() => {
    setGlobalState({
        editingState: {
            value: false,
            proj: 'permSys',
            triggerCompo: 'tablePageView',
            evtType: 'onBeforeUnmount'
        }
    });
});
</script>

<style lang="scss" scoped>
.tablePageView {
    background: var(--#{$elnamespace}-bg-color-page);
    padding: 20px 0 0 30px;
    background: #fff;
    font-size: 14px;
    &-header {
        margin: 0 20px 16px 0;
        display: flex;
        font-size: 18px;
        font-weight: 500;

        span {
            font-weight: var(--#{$elnamespace}-font-weight-primary);
        }

        &-right {
            flex: 1;
            text-align: right;
        }
    }

    &-layoutName {
        background: #FFF;
        padding: 8px 12px 8px 0;
        margin-left: -9.6px;

        .#{$elnamespace}-input{
            width: 500px;
            margin-left: 58px;
        }

        &::before {
            content: "*";
            color: var(--#{$elnamespace}-color-danger);
            margin-right: 4px;
        }
    }
    &-sortRule {
        background: #FFF;
        padding: 8px 12px 8px 0;

        > span {
            font-weight: var(--#{$elnamespace}-font-weight-primary);
        }

        .#{$elnamespace}-select {
            width: 500px;
            margin-left: 58px;
        }
    }
    &-block {
        color: #303033;
        padding: 8px 0;
        max-width: 1135px;
    }
    .field-item {
        margin-right: 12px;
    }
    &-total-field {
        .custom-minus-cirlce{
            font-size: 20px;
            color: #EA4335;
        }
    }
    &-scroll-box{
        overflow-y: scroll;
        padding: 0 0 12px 9.6px;
        margin-left: -9.6px;
    }

    &-title {
        margin-bottom: 12px;
        font-weight: var(--#{$elnamespace}-font-weight-primary);

        span{
            font-size: 12px;
            color: #606266;
        }
    }

    ::v-deep &-tabpane {
        background: #FFF;
    }
}
</style>