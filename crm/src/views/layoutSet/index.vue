<!-- 布局设置 -->
<template>
    <!-- 布局列表 -->
    <div
        v-show="!visible_editLayout"
        v-loading="loading"
        class="layoutSet"
    >
        <template v-for="item in tableConfigList">
            <layout-table
                v-if="allLayoutData[item.layoutType]"
                :key="item.key"
                :config="item"
                :layoutData="allLayoutData[item.layoutType]"
                @distributeLayout="handleDistributeLayout"
                @createLayout="handleCreateLayout"
                @editLayout="handleEditLayout"
                @copyLayout="handleCopyLayout"
                @deleteLayout="handleDeleteLayout"
            ></layout-table>
        </template>

        <!-- 删除布局确认 弹框 -->
        <confirmDialog
            v-model:visible="visible_deleteLayout"
            :loading="loading_deleteLayout"
            :title="$t('deleteConfirm')"
            :tip-content="$t('layout.tip_deleteLayout')"
            @confirm="confirm_deleteLayout"
        ></confirmDialog>
    </div>

    <!-- 新建/编辑布局 -->
    <Teleport to="#permSys-teleport-container">
        <div
            v-if="visible_editLayout && editLayoutCompo"
            class="absolute inset-0 z-10"
        >
            <component
                :is="editLayoutCompo"
                v-model:visible="visible_editLayout"
                :operateType="curOperateType"
                :bizObjConfig="currentSettingRow"
                :layoutConfig="curLayoutConfig"
                :layoutData="curLayoutData"
                @operateSuccess="handleOperateSuccess"
            ></component>
        </div>
    </Teleport>

    <!-- 分配布局 -->
    <layoutAllocation
        v-if="layoutAllocationVisible"
        :columns="layoutAllocationColumns"
        :tableData="layoutAllocationTableData"
        :tips="layoutAllocationTips"
        v-model:dialogVisible="layoutAllocationVisible"
        @handleSave="handleLayoutAllocationSave"
        :title="layoutAllocationTitle"></layoutAllocation>
</template>

<script setup>
import { ref, inject, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { getAllLayout, deleteLayout, layoutListByType, configLayoutPermissions } from '@/api/layout';
import { useUserStore } from '@/pinia/modules/user.js';
import layoutTable from '@/views/layoutSet/components/layoutTable';
import detailPageLayout from '@/views/layoutSet/detailPageLayout';
import tablePageLayout from '@/views/layoutSet/tablePageLayout';
import tablePageView from '@/views/layoutSet/tablePageView';
import searchDataLayout from '@/views/layoutSet/searchDataLayout';
import globalSearchLayout from '@/views/layoutSet/globalSearchLayout';
import formPageLayout from '@/views/layoutSet/formPageLayout';
import layoutAllocation from '@/components/layoutAllocation';

// 组件 options
defineOptions({
    name: 'layout-index'
});

// 取当前显示的语种
const { t } = useI18n();

// 接收父组件传, 当前选中的行
const currentSettingRow = inject('currentSettingRow');
// console.log('-------', currentSettingRow.value.id)

// 取 pinia 数据
const store = useUserStore();

// 全局
const loading = ref(false);

// 表格列表配置
const tableConfigList = ref([]);
tableConfigList.value = [
    {
        key: 'detailPageLayout',
        layoutType: 0,
        title: t('layout.detailPageLayout'),
        btnList: ['new', 'edit', 'delete', 'copy', 'distribute'],
        lang: {
            new: t('layout.createDetailPageLayout'),
            distribute: t('layout.distributeDetailPageLayout')
        }
    }, // 详情页布局
    {
        key: 'formPageLayout',
        layoutType: 1,
        title: t('layout.formPageLayout'),
        btnList: ['new', 'edit', 'delete', 'copy', 'distribute'],
        lang: {
            new: t('layout.createFormPageLayout'),
            distribute: t('layout.distributeFormPageLayout')
        }
    }, // 表单页布局
    {
        key: 'tablePageLayout',
        layoutType: 2,
        title: t('layout.tablePageLayout'),
        btnList: ['new', 'edit', 'delete', 'copy', 'distribute'],
        lang: {
            new: t('layout.createTablePageLayout'),
            distribute: t('layout.distributeTablePageLayout')
        }
    }, // 列表页布局
    {
        key: 'tablePageView',
        layoutType: 3,
        title: t('layout.tablePageView'),
        btnList: ['new', 'edit', 'delete', 'copy'],
        lang: {
            new: t('layout.createTablePageView'),
            distribute: t('layout.distributeTablePageView')
        }
    }, // 列表页视图
    {
        key: 'searchDataLayout',
        layoutType: 4,
        title: t('layout.searchDataLayout'),
        btnList: ['new', 'edit', 'delete', 'copy', 'distribute'],
        lang: {
            new: t('layout.createSearchLayout'),
            distribute: t('layout.distributeSearchLayout')
        }
    }, // 查找数据布局
    // {
    //     key: 'globalSearchLayout',
    //     layoutType: 7,
    //     title: t('layout.globalSearchLayout'),
    //     btnList: ['new', 'edit', 'delete', 'copy', 'distribute'],
    //     lang: {
    //         new: t('layout.createGlobalSearchLayout'),
    //         distribute: t('layout.distributeGlobalSearchLayout')
    //     }
    // }, // 全局搜索布局
    {
        key: 'checkRepeatLayout',
        layoutType: 5,
        title: t('layout.checkRepeatLayout'),
        btnList: ['new', 'edit', 'delete', 'copy', 'distribute'],
        lang: {
            new: t('layout.createCheckRepeatLayout'),
            distribute: t('layout.distributeCheckRepeatLayout')
        }
    }, // 查重布局
    { 
        key: 'suspectedRepeatLayout',
        layoutType: 6,
        title: t('layout.suspectedRepeatLayout'),
        btnList: ['new', 'edit', 'delete', 'copy', 'distribute'],
        lang: {
            new: t('layout.createSuspectedRepeatLayout'),
            distribute: t('layout.distributeSuspectedRepeatLayout')
        }
    } // 疑似重复布局
];
// 表格列配置
// 全部表格列配置, 通过 appliedTo 和 notAppliedTo 控制各个表格分别显示哪些列
const allColumns = [
    {
        label: t('layout.layoutName'),
        prop: 'layoutName',
        width: 200,
        notAppliedTo: ['tablePageView']
    },
    {
        label: t('layout.viewName'),
        prop: 'layoutName',
        width: 200,
        appliedTo: ['tablePageView']
    },
    // {
    //     label: t('layout.applicableTerminal'),
    //     prop: 'availableDevice',
    //     width: 240,
    //     appliedTo: ['detailPageLayout', 'formPageLayout', 'tablePageLayout']
    // },
    {
        label: t('layout.searchCondition'),
        prop: 'searchCondition',
        width: 240,
        appliedTo: ['tablePageView']
    },
    {
        label: t('operate'),
        prop: 'operate'
    }
];
// 设置各表格的表格列 + 其他数据
tableConfigList.value.forEach(item => {
    // 按钮配置, 部分业务对象不支持按钮操作
    if (['department', 'staff'].includes(currentSettingRow.value.apiKey)) {
        item.btnList = [];
    }

    // 表格列配置
    const tmpColumns = JSON.parse(JSON.stringify(allColumns));
    item.columns = tmpColumns.filter(col => (!col.appliedTo || col.appliedTo.includes(item.key)) && (!col.notAppliedTo || !col.notAppliedTo.includes(item.key)));
    // 宽度调整, 操作列保持对齐
    if (item.columns.length === 2) {
        item.columns[0].width = 440;
    }
});

// 表格数据
const allLayoutData = ref({});
// 获取数据
const getLayoutData = () => {
    // 显示 loading
    loading.value = true;

    getAllLayout({
        orgId: store.orgId,
        userId: store.userId,
        objectId: currentSettingRow.value.id
    }).then((res) => {
        if (res.code === 10000) {
            // 请求成功

            // 更新表格数据
            allLayoutData.value = handleData(res.data);
        } else {
            // 请求失败

            // 清空表格数据
            allLayoutData.value = [];
            // 提示错误信息
            ElMessage.error(res.message);
        }

        // 取消 loading
        loading.value = false;
    });
};
// 处理数据
const handleData = (data) => {
    const result = {};
    data.forEach(item => {
        result[item.layoutType] = item;
    });

    return result;
};

// 事件处理
// 当前正在操作的布局的数据
const curLayoutData = ref({});
// 当前正在操作的布局类型配置
const curLayoutConfig = ref({});
// 当前操作类型
const curOperateType = ref('');
const layoutAllocationTips = ref(''); // 布局分配弹窗提示
const layoutAllocationColumns = ref([]);
const layoutAllocationTableData = ref([]);
// 分配布局
const handleDistributeLayout = (tableConfig) => {
    // 更新当前操作信息
    curOperateType.value = 'distribute';
    curLayoutConfig.value = tableConfig;
    layoutAllocationTitle.value = curLayoutConfig.value.title;
    layoutAllocationTips.value = [0, 1].includes(curLayoutConfig.value.layoutType) ? t('layoutAllocation.tips') : t('layoutAllocation.tips1');
    layoutListByType({
        layoutType: curLayoutConfig.value.layoutType,
        objectId: currentSettingRow.value.id
    }).then(res => {
        if (res.code === 10000) {
            layoutAllocationColumns.value = res.data.businessTypeList || [];
            layoutAllocationTableData.value = res.data.layoutDetailListMap || [];
            layoutAllocationVisible.value = true;
        } else {
            ElMessage.error(res.messageShow);
        }
    });
    // 组件显隐处理
};
// 分配布局保存
const handleLayoutAllocationSave = (data) => {
    const { changedData, tableData, changedMembers} = data;
    console.log(changedData, tableData, changedMembers);
    const applyMembersList = [];
    const applicableMemberTabs = [1, 2, 3, 4, 5];
    changedMembers.forEach(item => {
        const {layoutId, changedMembers} = item;
        const memberIdTypeList = [];
        applicableMemberTabs.forEach(tabs => {
            const idList = changedMembers.filter(member => member.type === tabs).map(member => member.id);
            if (idList.length) {
                memberIdTypeList.push({
                    memberType: tabs,
                    idList
                });
            }
        });
        applyMembersList.push({
            layoutId,
            memberIdTypeList
        });
    });
    console.log(applyMembersList);
    configLayoutPermissions({
        layoutType: curLayoutConfig.value.layoutType,
        objectId: currentSettingRow.value.id,
        applyBizTypeList: changedData,
        applyMembersList,
        sortLayoutIds: tableData.map(item => item.layoutId)
    }).then(res => {
        if (res.code === 10000) {
            ElMessage.success('分配成功');
            layoutAllocationVisible.value = false;
        } else {
            ElMessage.error(res.messageShow);
        }
    });
};
// 创建布局
const handleCreateLayout = (tableConfig) => {
    // 更新当前操作信息
    curOperateType.value = 'new';
    curLayoutConfig.value = tableConfig;
    console.log(tableConfig, curLayoutConfig.value.layoutType);

    // 组件显隐处理
    visible_editLayout.value = true;
};
// 编辑布局
const handleEditLayout = (tableConfig, rowData) => {
    // 更新当前操作信息
    curOperateType.value = 'edit';
    curLayoutConfig.value = tableConfig;
    curLayoutData.value = rowData;

    // 组件显隐处理
    visible_editLayout.value = true;
};
// 复制布局
const handleCopyLayout = (tableConfig, rowData) => {
    // 更新当前操作信息
    curOperateType.value = 'copy';
    curLayoutConfig.value = tableConfig;
    curLayoutData.value = rowData;

    // 组件显隐处理
    visible_editLayout.value = true;
};
// 删除布局
const handleDeleteLayout = (tableConfig, data) => {
    // 更新当前操作信息
    curOperateType.value = 'delete';
    curLayoutConfig.value = tableConfig;
    curLayoutData.value = data;

    // 组件显隐处理
    loading_deleteLayout.value = false;
    visible_deleteLayout.value = true;
};

// 删除布局 弹框
// 弹框显隐
let visible_deleteLayout = ref(false);
// 弹框 loading
let loading_deleteLayout = ref(false);
// 删除布局 确认
const confirm_deleteLayout = () => {
    // 显示 loading
    loading_deleteLayout.value = true;

    // 发送请求
    deleteLayout({
        id: curLayoutData.value.layoutId
    }).then((res) => {
        if (res.code === 10000) {
            // 删除成功

            // 删除成功后, 刷新表格
            getLayoutData();
            // 隐藏弹框
            visible_deleteLayout.value = false;
        } else {
            // 删除失败

            ElMessage.error(res.message);
        }

        // 取消 loading
        loading_deleteLayout.value = false;
    });
};

// 新建编辑
// 当前新建编辑布局所使用的组件
const editLayoutCompo = computed(() => {
    switch (curLayoutConfig.value.layoutType) {
        case 0: // 详情页
            return detailPageLayout;
        case 1: // 表单
            return formPageLayout;
        case 2: // 列表
            return tablePageLayout;
        case 3: // 列表视图
            return tablePageView;
        case 4: // 查找数据
        case 5: // 疑似重复
        case 6: // 查重
            return searchDataLayout;
        case 7: // 全局搜索
            return globalSearchLayout;
        default:
            return undefined;
    }
});
// 组件显隐
const visible_editLayout = ref(false);
// 操作成功
const handleOperateSuccess = (data, resData) => {
    // 新建/复制 成功后, 刷新表格
    if (['new', 'copy'].includes(curOperateType.value)) {
        getLayoutData();
        return;
    }

    // 编辑 成功后, 更新表格名称
    if (['edit'].includes(curOperateType.value)) {
        curLayoutData.value.layoutName = data.layoutName;
        // 列表页视图, 更新检索条件
        if (curLayoutConfig.value.layoutType === 3) {
            curLayoutData.value.searchCondition = resData;
        }
        return;
    }
};

// 分配布局 弹框
const layoutAllocationVisible = ref(false); // 布局分配弹窗是否可见
const layoutAllocationTitle = ref(''); // 布局分配弹窗标题

// 获取数据
getLayoutData();
</script>

<style lang="scss" scoped>
.layoutSet {
    // padding: 12px 24px 0;

    ::v-deep .layoutTable {
        &:not(:last-child) {
            margin-bottom: 20px;
        }
    }
}
</style>
