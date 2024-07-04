<!-- 新建编辑【查找数据列表】【疑似重复】【查重】布局 -->
<template>
    <div
        v-loading="loading"
        class="searchDataLayout"
    >
        <!-- header -->
        <div class="searchDataLayout-header">
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

        <div :style="{height: pageHeight}" class="searchDataLayout-scroll-box">
            <!-- 布局名称 -->
            <div class="searchDataLayout-layoutName">
                <span>{{ $t('layout.layoutName') }}</span>
                <el-input
                    v-model="layoutName"
                    maxlength="50"
                ></el-input>
            </div>

            <!-- 展示字段 -->
            <div class="searchDataLayout-block">
                <p class="searchDataLayout-title">{{ $t('layout.displayField') }}</p>
                <customSort
                    :key="refreshCheckKey"
                    :config="{ id: 'id', label: 'name', checked: 'checked' }"
                    :itemList="allFields"
                    :defaultCheck="selectedFieldIds"
                    :max="props.layoutConfig.layoutType === 4 ? undefined : 9"
                    :cloum="5"
                    ref="fieldCheckRef"
                    class="searchDataLayout-table"
                ></customSort>
            </div>

            <!-- 排序规则 -->
            <div class="searchDataLayout-sortRule">
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
// 接收对象列表传参, 当前选中的对象
const currentSettingRow = inject('currentSettingRow');

// 页面高度
const pageHeight = ref('calc(100vh - 168px)');

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
        initData.selectedFieldIds = JSON.parse(JSON.stringify(selectedFieldIds.value));
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

    // 展示字段数据处理
    allFields.value[0].checkMapLists = cloneDeep(data.layoutFieldInfoList?.allFieldList || []).map(item => {
        item.disabled = (item.deleteConfigFlag === 0);
        return item;
    });
    selectedFieldIds.value = (data.layoutFieldInfoList?.selectedList || []).map((item) => item.id);
    // 刷新选择组件
    refreshCheckKey.value++;

    // 排序规则数据处理
    // 图片, 文件, 多选, 地理定位, 引用 类型字段不支持排序
    fieldList.value = (data.layoutFieldInfoList?.allFieldList || []).filter((item) => ![6, 7, 26, 27, 30, 33].includes(item.dataType));
    sortField.value = data.sortField || '';
    ascending.value = Number.isInteger(data.ascending) ? data.ascending : 1;

    return data;
};

// header
// 标题
const title = computed(() => {
    switch (props.layoutConfig.layoutType) {
        case 4: // 查找数据布局
            switch (props.operateType) {
                case 'new':
                    return t('layout.createSearchDataLayout');
                case 'edit':
                    return t('layout.editSearchDataLayout');
                case 'copy':
                    return t('layout.copySearchDataLayout');
                default:
                    return '';
            }
        case 5: // 查重布局
            switch (props.operateType) {
                case 'new':
                    return t('layout.createCheckRepeatLayout');
                case 'edit':
                    return t('layout.editCheckRepeatLayout');
                case 'copy':
                    return t('layout.copyCheckRepeatLayout');
                default:
                    return '';
            }
        case 6: // 疑似重复布局
            switch (props.operateType) {
                case 'new':
                    return t('layout.createSuspectedRepeatLayout');
                case 'edit':
                    return t('layout.editSuspectedRepeatLayout');
                case 'copy':
                    return t('layout.copySuspectedRepeatLayout');
                default:
                    return '';
            }
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
        // 取选中显示字段 ids
        const selectFieldIds = unref(fieldCheckRef.value?.getCheckSourceData().normalResult || []).map(item => item.id);
        if (
            (JSON.stringify(initData.settingData) !== JSON.stringify(settingData.value))
            || (initData.layoutName !== layoutName.value)
            || (JSON.stringify(initData.selectedFieldIds) !== JSON.stringify(selectFieldIds))
            || (initData.sortField !== sortField.value)
            || (initData.ascending !== ascending.value)
        ) {
            return true;
        }
    }

    // 默认 false
    return false;
};

// 展示字段
// 刷新选择组件
let refreshCheckKey = ref(0);
// ref
const fieldCheckRef = ref(null);
// 所有展示字段
let allFields = ref([
    {
        // headTitle: t('layout.displayField'),
        headTips: props.layoutConfig.layoutType === 4 ? '' : t('layout.selectShowFieldsMaxNum', { max: 9 }),
        checkMapLists: []
    }
]);
// 已选展示字段
let selectedFieldIds = ref([]);

// 排序规则
// 所有可选排序字段
const fieldList = ref([]);
// 排序字段 id
const sortField = ref('');
// 排序方式, 0 升序, 1 降序
const ascending = ref(1);

// 离开确认弹框
const visible_leaveConfirm = ref(false);
// 离开确认
const handleLeaveConfirm = async () => {
    // 离开页面时通知基座, 当前页面退出编辑状态
    setGlobalState({
        editingState: {
            value: false,
            proj: 'permSys',
            triggerCompo: 'searchDataLayout',
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
            triggerCompo: 'searchDataLayout',
            evtType: 'leaveCancel'
        }
    });
};

// 保存
const submit = async () => {
    // 布局名称空值校验
    if (!layoutName.value.trim()) {
        ElMessage.error(t('mustInputWarn', { name: t('layout.layoutName') }));
        return;
    }

    // 取选中显示字段
    const selectFieldIds = unref(fieldCheckRef.value?.getCheckSourceData().normalResult || []);
    // 选中字段为空校验
    if (!selectFieldIds.length) {
        ElMessage.error(t('placeholder_select', { name: t('layout.displayField') }));
        return;
    }

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
        sortField: sortField.value,
        ascending: ascending.value,
        selectFieldIds
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
            triggerCompo: 'searchDataLayout',
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
            triggerCompo: 'searchDataLayout',
            evtType: 'onBeforeUnmount'
        }
    });
});
</script>

<style lang="scss" scoped>
.searchDataLayout {
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

    &-table {
        height: 520px;
        width: 750px;
    }
}
</style>