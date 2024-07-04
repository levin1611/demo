<!-- 新建全局搜索布局 -->
<template>
    <div class="globalSearchLayout">
        <!-- header -->
        <div class="globalSearchLayout-header">
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

        <div :style="{height: pageHeight}" class="globalSearchLayout-scroll-box">
            <!-- 布局名称 -->
            <div class="globalSearchLayout-layoutName">
                <span>{{ $t('layout.layoutName') }}</span>
                <el-input
                    v-model="layoutName"
                    maxlength="50"
                ></el-input>
            </div>

            <!-- 有权限数据 -->
            <div
                :key="`1_${refreshCheckKey}`"
                class="globalSearchLayout-block"
            >
                <p class="globalSearchLayout-title">{{ $t('layout.permanentData') }}</p>
                <customSort
                    :config="{ id: 'id', label: 'name', checked: 'checked' }"
                    :itemList="allPermanentData"
                    :defaultCheck="selectedPermanentDataIds"
                    :max="9"
                    :cloum="5"
                    ref="permanentDataCheckRef"
                ></customSort>
            </div>

            <!-- 无权限数据 -->
            <div
                :key="`2_${refreshCheckKey}`"
                class="globalSearchLayout-block"
            >
                <p class="globalSearchLayout-title">{{ $t('layout.unpripeData') }}</p>
                <customSort
                    :config="{ id: 'id', label: 'name', checked: 'checked' }"
                    :itemList="allUnpripeData"
                    :defaultCheck="selectedUnpripeDataIds"
                    :max="9"
                    :cloum="5"
                    ref="unpripeDataCheckRef"
                ></customSort>
            </div>
        </div>

        <footer>
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
        initData.selectedPermanentDataIds = JSON.parse(JSON.stringify(selectedPermanentDataIds.value));
        initData.selectedUnpripeDataIds = JSON.parse(JSON.stringify(selectedUnpripeDataIds.value));
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

    // 选择组件数据处理
    allPermanentData.value[0].checkMapLists = cloneDeep(data.authorizedlayoutFieldDto?.allFieldList || []).map(item => {
        item.disabled = (item.deleteConfigFlag === 0);
        return item;
    });
    selectedPermanentDataIds.value = (data.authorizedlayoutFieldDto?.selectedList || []).map((item) => item.id);
    allUnpripeData.value[0].checkMapLists = cloneDeep(data.unAuthorizedlayoutFieldDto?.allFieldList || []).map(item => {
        item.disabled = (item.deleteConfigFlag === 0);
        return item;
    });
    selectedUnpripeDataIds.value = (data.unAuthorizedlayoutFieldDto?.selectedList || []).map((item) => item.id);
    // 刷新选择组件
    refreshCheckKey.value++;

    return data;
};

// header
// 标题
const title = computed(() => {
    switch (props.operateType) {
        case 'new':
            return t('layout.createGlobalSearchLayout');
        case 'edit':
            return t('layout.editGlobalSearchLayout');
        case 'copy':
            return t('layout.copyGlobalSearchLayout');
        default:
            return '';
    }
});

// 刷新选择组件
let refreshCheckKey = ref(0);
// 有权限数据
// ref
const permanentDataCheckRef = ref(null);
// 所有有权限数据
let allPermanentData = ref([
    {
        // headTitle: t('layout.permanentData'),
        headTips: t('layout.selectShowFieldsMaxNum', { max: 9 }),
        checkMapLists: []
    }
]);
// 已选有权限数据
let selectedPermanentDataIds = ref([]);

// 无权限数据
// ref
const unpripeDataCheckRef = ref(null);
// 所有无权限数据
let allUnpripeData = ref([
    {
        // headTitle: t('layout.unpripeData'),
        headTips: t('layout.selectShowFieldsMaxNum', { max: 9 }),
        checkMapLists: []
    }
]);
// 已选无权限数据
let selectedUnpripeDataIds = ref([]);

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
        // 取选中字段数据 ids
        const allPermanentDataVal = (permanentDataCheckRef.value?.getCheckSourceData().normalResult || []).map(item => item.id);
        const allUnpripeDataVal = (unpripeDataCheckRef.value?.getCheckSourceData().normalResult || []).map(item => item.id);
        if (
            (JSON.stringify(initData.settingData) !== JSON.stringify(settingData.value))
            || (initData.layoutName !== layoutName.value)
            || (JSON.stringify(initData.selectedPermanentDataIds) !== JSON.stringify(allPermanentDataVal))
            || (JSON.stringify(initData.selectedUnpripeDataIds) !== JSON.stringify(allUnpripeDataVal))
        ) {
            return true;
        }
    }

    // 默认 false
    return false;
};

// 离开确认弹框
const visible_leaveConfirm = ref(false);
// 离开确认
const handleLeaveConfirm = async () => {
    // 离开页面时通知基座, 当前页面退出编辑状态
    setGlobalState({
        editingState: {
            value: false,
            proj: 'permSys',
            triggerCompo: 'globalSearchLayout',
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
            triggerCompo: 'globalSearchLayout',
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

    // 取选中字段数据
    const allPermanentDataVal = cloneDeep(permanentDataCheckRef.value?.getCheckSourceData().normalResult || []);
    allPermanentDataVal.forEach((item) => {
        item.authFlag = 1;
    });
    const allUnpripeDataVal = cloneDeep(unpripeDataCheckRef.value?.getCheckSourceData().normalResult || []);
    allUnpripeDataVal.forEach((item) => {
        item.authFlag = 0;
    });
    const selectFieldIds = allPermanentDataVal.concat(allUnpripeDataVal)
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
            triggerCompo: 'globalSearchLayout',
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
            triggerCompo: 'globalSearchLayout',
            evtType: 'onBeforeUnmount'
        }
    });
});
</script>

<style lang="scss" scoped>
.globalSearchLayout {
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