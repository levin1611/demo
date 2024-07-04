<!-- 新建编辑 列表页 布局 -->
<template>
    <div
        v-loading="loading"
        class="tablePageLayout"
    >
        <!-- header -->
        <div class="tablePageLayout-header">
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

        <div :style="{height: pageHeight}" class="tablePageLayout-scroll-box">
            <!-- 布局名称 -->
            <div class="tablePageLayout-layoutName">
                <span>{{ $t('layout.layoutName') }}</span>
                <el-input
                    v-model="layoutName"
                    maxlength="50"
                ></el-input>
            </div>

            <!-- 设置汇总字段 -->
            <!-- 一期不做，隐藏 -->
            <div class="tablePageLayout-total-field tablePageLayout-block" style="display: none">
                <p class="tablePageLayout-title">{{ $t('layout.setSummaryField') }}</p>
                <div class="tablePageLayout-total-item" v-for="(v, i) in formData" :key="i">
                    <!-- 序号 -->
                    <span class="tablePageLayout-number">{{ i + 1 }}</span>

                    <!-- 选择字段 -->
                    <el-select
                        v-model="v.field"
                        class="field-item"
                        size="large"
                        style="width: 200px"
                    >
                        <el-option
                            v-for="field in fieldList"
                            :key="`${field.id}`"
                            :label="field.name"
                            :value="`${field.id}`"></el-option>
                    </el-select>

                    <!-- 选择汇总函数 -->
                    <el-select
                        v-model="v.type"
                        :placeholder="$t('layout.summaryFunc')"
                        class="field-item"
                        size="large"
                        style="width: 200px"
                    >
                        <el-option :label="$t('layout.SUM')" value="1"></el-option>
                        <el-option :label="$t('layout.AVG')" value="2"></el-option>
                    </el-select>

                    <!-- 删除按钮 -->
                    <span
                        @click="delData(i)"
                        class="custom custom-minus-cirlce"
                    ></span>
                </div>

                <!-- 添加按钮 -->
                <el-link class="tablePageLayout-total-addBtn" @click="addData">
                    <span class="custom custom-add1"></span>
                    <span>{{ $t('layout.addSummaryField') }}</span>
                </el-link>
            </div>

            <!-- 选择列表视图 -->
            <div
                :key="`1_${refreshCheckKey}`"
                class="tablePageLayout-block"
            >
                <customSort
                    :config="{ id: 'layoutId', label: 'layoutName', checked: 'checked' }"
                    :itemList="allViews"
                    :defaultCheck="selectedViewIds"
                    :cloum="5"
                    ref="viewCheckRef"
                    class="tablePageLayout-table"
                ></customSort>
            </div>

            <!-- 普通操作按钮 -->
            <div
                :key="`2_${refreshCheckKey}`"
                class="tablePageLayout-block"
            >
                <customSort
                    :config="{ id: 'id', label: 'name', checked: 'checked' }"
                    :itemList="allNormalBtns"
                    :defaultCheck="selectedNormalBtnIds"
                    :cloum="5"
                    ref="normalBtnCheckRef"
                    class="tablePageLayout-table"
                ></customSort>
            </div>

            <!-- 批量操作按钮 -->
            <!-- <div
                :key="`3_${refreshCheckKey}`"
                class="tablePageLayout-block"
            >
                <customSort
                    :config="{ id: 'id', label: 'name', checked: 'checked' }"
                    :itemList="allBatchBtns"
                    :defaultCheck="selectedBatchBtnIds"
                    ref="batchBtnCheckRef"
                    class="tablePageLayout-table"
                ></customSort>
            </div> -->
        </div>

        <!-- confirm -->
        <footer style="background: #fff;position: relative;z-index: 1;">
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
import { saveLayoutSet, getLayoutSet, getLayoutInitData, createLayout } from '@/api/layout';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';
import {customSort} from 'xhl_lib';
import confirmDialog from '@/components/confirmDialog.vue';
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
        initData.formData = JSON.parse(JSON.stringify(formData.value));
        initData.selectedViewIds = JSON.parse(JSON.stringify(selectedViewIds.value));
        initData.selectedNormalBtnIds = JSON.parse(JSON.stringify(selectedNormalBtnIds.value));
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

    // 汇总字段数据处理
    // fieldList.value = data.layoutFieldInfoList?.allFieldList || [];
    // formData.value = (data.summaryFields || []).map((item) => {
    //     const [field, type] = item.split('-');
    //     return { field, type };
    // });

    // 选择组件数据处理
    allViews.value[0].checkMapLists = cloneDeep(data.allViewDtoList || []);
    selectedViewIds.value = (data.viewDtoList || []);
    allNormalBtns.value[0].checkMapLists = cloneDeep(data.allNormalButtons || []);
    selectedNormalBtnIds.value = (data.normalButtons || []);
    // allBatchBtns.value[0].checkMapLists = cloneDeep(data.allBatchButtons || []);
    // selectedBatchBtnIds.value = (data.batchButtons || []);
    // 刷新选择组件
    refreshCheckKey.value++;

    return data;
};

// header
// 标题
const title = computed(() => {
    switch (props.operateType) {
        case 'new':
            return t('layout.createTablePageLayout');
        case 'edit':
            return t('layout.editTablePageLayout');
        case 'copy':
            return t('layout.copyTablePageLayout');
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
        // 取选中视图数据
        const allSelViews = unref(viewCheckRef.value?.getCheckData().normalResult || []);
        // 取选中按钮数据
        const allSelNormalBtns = unref(normalBtnCheckRef.value?.getCheckData().normalResult || []);
        if (
            (JSON.stringify(initData.settingData) !== JSON.stringify(settingData.value))
            || (initData.layoutName !== layoutName.value)
            || (JSON.stringify(initData.formData) !== JSON.stringify(formData.value))
            || (JSON.stringify(initData.selectedViewIds) !== JSON.stringify(allSelViews))
            || (JSON.stringify(initData.selectedNormalBtnIds) !== JSON.stringify(allSelNormalBtns))
        ) {
            return true;
        }
    }

    // 默认 false
    return false;
};

// 所有可选字段
const fieldList = ref([]);
// 汇总字段
const formData = ref([
    {field: '', type: ''}
]);
// 添加汇总字段
const addData = () => {
    // 最多设置 5 个汇总字段
    if (formData.value.length === 5) {
        ElMessage.warning(t('layout.maximumSummaryFields'));
        return;
    }

    formData.value.push({field: '', type: ''});
};
// 删除汇总字段
const delData = (i) => {
    if (!formData.value.length) {
        return;
    }

    formData.value.splice(i, 1);
};

// 刷新选择组件
let refreshCheckKey = ref(0);
// 列表视图
// ref
const viewCheckRef = ref(null);
// 所有视图
let allViews = ref([
    {
        headTitle: t('layout.selectListView'),
        checkMapLists: []
    }
]);
// 已选视图
let selectedViewIds = ref([]);

// 普通操作按钮
// ref
const normalBtnCheckRef = ref(null);
// 所有普通操作按钮
let allNormalBtns = ref([
    {
        headTitle: t('layout.normalBtns'),
        headTips: t('layout.showOperateBtnMaxNum', { max: 3 }),
        checkMapLists: []
    }
]);
// 已选普通操作按钮
let selectedNormalBtnIds = ref([]);

// 离开确认弹框
const visible_leaveConfirm = ref(false);
// 离开确认
const handleLeaveConfirm = async () => {
    // 离开页面时通知基座, 当前页面退出编辑状态
    setGlobalState({
        editingState: {
            value: false,
            proj: 'permSys',
            triggerCompo: 'tablePageLayout',
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
            triggerCompo: 'tablePageLayout',
            evtType: 'leaveCancel'
        }
    });
};

// // 批量操作按钮
// // ref
// const batchBtnCheckRef = ref(null);
// // 所有批量操作按钮
// let allBatchBtns = ref([
//     {
//         headTitle: t('layout.batchBtns'),
//         headTips: t('layout.showOperateBtnMaxNum', { max: 3 }),
//         checkMapLists: []
//     }
// ]);
// // 已选批量操作按钮
// let selectedBatchBtnIds = ref([]);

// 保存
const submit = async () => {
    // 数据有效性校验
    // 布局名称空值校验
    if (!layoutName.value.trim()) {
        ElMessage.error(t('mustInputWarn', { name: t('layout.layoutName') }));
        return;
    }
    // 汇总字段为空校验
    // if (formData.value.some(item => !item.type || !item.field)) {
    //     ElMessage.error(t('layout.summaryFieldIncludeEmptyInput'));
    //     return;
    // }

    // 取汇总字段
    // let allSummaryFields = formData.value.map(item => {
    //     return `${item.field}-${item.type}`;
    // });

    // 取选中视图数据
    const allSelViews = unref(viewCheckRef.value?.getCheckData().normalResult || []);
    // 选中视图为空校验
    if (!allSelViews.length) {
        ElMessage.error(t('placeholder_select', { name: t('layout.listView') }));
        return;
    }
    // 取选中按钮数据
    const allSelNormalBtns = unref(normalBtnCheckRef.value?.getCheckData().normalResult || []);
    // const allSelBatchBtns = unref(batchBtnCheckRef.value?.getCheckData().normalResult || []);

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
        // summaryFields: allSummaryFields, // 汇总字段
        selectedViews: allSelViews, // 选中视图
        normalButtons: allSelNormalBtns, // 普通按钮
        // batchOpsButtons: allSelBatchBtns // 批量操作按钮
        batchOpsButtons: [] // 批量操作按钮
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
        emits('operateSuccess', postData);
        // 关闭当前页, 返回上一级
        goBack(true);
    } else {
        // 保存失败

        ElMessage.error(res.messageShow);
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
            triggerCompo: 'tablePageLayout',
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
            triggerCompo: 'tablePageLayout',
            evtType: 'onBeforeUnmount'
        }
    });
});
</script>

<style lang="scss" scoped>
.tablePageLayout {
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

        .#{$elnamespace}-input {
            width: 500px;
            margin-left: 58px;
        }

        &::before {
            content: "*";
            color: var(--#{$elnamespace}-color-danger);
            margin-right: 4px;
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

    &-total-item{
        margin-bottom: 12px;
    }
    &-total-addBtn{
        display: inline-block;
        color: #3B78DE;
        margin-top: 8px;
        margin-left: 19px;
        cursor: pointer;
    }
    &-number{
        margin-right: 12px;
    }

    ::v-deep &-tabpane {
        background: #FFF;
    }
}
</style>