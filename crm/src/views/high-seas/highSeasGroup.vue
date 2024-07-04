<!-- 公海设置 - 公海分组 -->
<template>
    <div class="highSeasGroup">
        <!-- header -->
        <div class="highSeasGroup-header">
            <!-- title -->
            <span class="highSeasGroup-title"></span> 

            <!-- 添加规则 -->
            <el-button
                type="primary"
                @click="handleAddRule"
            >{{ $t('highSeas.addRule') }}</el-button>
        </div>

        <!-- body -->
        <div class="highSeasGroup-body">
            <!-- table -->
            <el-table
                v-loading="tableLoading"
                :data="tableData"
                height="100%"
                max-height="calc(100% - 48px)"
                stripe
            >
                <!-- 普通列 -->
                <el-table-column
                    v-for="column in tableColumns"
                    :key="column.prop"
                    :prop="column.prop"
                    :label="$t(column.label)"
                    :min-width="column.width"
                    :formatter="column.formatter"
                    :show-overflow-tooltip="true"
                ></el-table-column>
                <!-- 操作列 -->
                <el-table-column
                    prop="operate"
                    :label="$t('operate')"
                    :width="200"
                    :min-width="100"
                >
                    <template
                        #default="{ row }"
                    >
                        <el-link
                            type="primary"
                            @click="handleEdit(row)"
                        >{{ $t('edit') }}</el-link>
                        <!-- <el-link
                            type="primary"
                            @click="handleSetMembers(row)"
                        >{{ $t('设置成员') }}</el-link> -->
                        <el-link
                            type="primary"
                            @click="handleSetFields(row)"
                        >{{ $t('成员字段') }}</el-link>
                        <el-link
                            type="primary"
                            @click="handleDelete(row)"
                        >{{ $t('delete') }}</el-link>
                    </template>
                </el-table-column>
            </el-table>

            <!-- page -->
            <pagenation
                ref="pageNationRef"
                :parameter="pageNationParams"
                @updateData="updateData"
                @changeBefore="beforeChangePage"
                class="highSeasGroup-pager"
            ></pagenation>
        </div>

        <!-- 新增编辑 -->
        <editHighSeasGroup
            v-if="visible_edit"
            v-model:visible="visible_edit"
            :ruleData="curRuleData"
            ref="newEditRef"
            @operateSuccess="handleOperateSuccess"
        ></editHighSeasGroup>

        <!-- 删除确认弹框 -->
        <confirmDialog
            v-model:visible="visible_delete"
            :title="$t('deleteConfirm')"
            :tip-content="$t('highSeas.tip_deleteGroup', { name: curRuleData.name })"
            @confirm="handleDeleteConfirm"
        ></confirmDialog>

        <!-- 设置成员 -->
        <memberSetting
            v-model:dialogVisible="visible_setMembers"
        ></memberSetting>

        <!-- 成员字段 -->
        <memberFields
            v-if="visible_setFields"
            v-model:visible="visible_setFields"
            :ruleData="curRuleData"
        ></memberFields>
    </div>

</template>

<script setup>
import { ref, inject, h, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getHighSeasGroupList, delHighSeasGroup, getHighSeasGroupDetail } from '@/api/highSeas.js';
import { pagenation } from 'xhl_lib';
import editHighSeasGroup from './modal/editHighSeasGroup.vue';
import confirmDialog from '@/components/confirmDialog.vue';
import memberSetting from './modal/memberSetting.vue';
import memberFields from './modal/memberFields.vue';

// inject
const currentSettingRow = inject('currentSettingRow');

// 全局
// 多语言
const { t } = useI18n();

// header
// 新建规则
const handleAddRule = () => {
    curRuleData.value = {};
    visible_edit.value = true;
};

// table
// loading
const tableLoading = ref(false);
// 表格列
const tableColumns = [
    {
        label: 'highSeas.groupName',
        prop: 'name',
        width: 150
    },
    {
        label: 'highSeas.groupDataManager',
        prop: 'userNames',
        width: 150,
        formatter: (row) => {
            // 过滤得到管理员列表
            const allUsers = row.idAndNameDtoList || [];
            const managerList = allUsers.filter(item => item.type === 1 && item.isManager);

            // 无值, 不显示
            if (!managerList.length) {
                return '-';
            }

            // 有值, tooltip 显示管理员名称
            const managerNames = managerList.map(item => item.name).join(',');
            return h(ElTooltip, {
                content: managerNames,
                placement: 'top'
            }, [
                h('span', managerNames)
            ]);
        }
    },
    {
        label: 'highSeas.defaultGroupDataManager',
        prop: 'managerName',
        width: 150
    },
    {
        label: 'description',
        prop: 'description',
        width: 55,
        formatter: (row, column, cellValue) => {
            // 无值, 不显示
            if (!cellValue) {
                return '-';
            }

            // 有值, tooltip 显示内容
            return h(ElTooltip, {
                content: cellValue,
                placement: 'top',
                popperClass: 'whitespace-break-spaces'
            }, [
                h('span', {
                    class: 'custom custom-message-text1'
                })
            ]);
        }
    }
];
// 表格数据
const tableData = ref([]);
// 刷新单条数据
const refreshSingleData = async (id) => {
    // 检查 id 是否存在于列表
    const rowIndex = tableData.value.findIndex(item => item.id === id);
    if (rowIndex === -1) {
        return;
    }

    // 存在, 请求接口得到最新数据
    tableLoading.value = true;
    const res = await getHighSeasGroupDetail({
        id
    });
    if (res.code === 10000) {
        // 替换掉之前的数据
        tableData.value.splice(rowIndex, 1, res.data);
    } else {
        ElMessage.error(res.messageShow);
    }
    tableLoading.value = false;
};
// 编辑操作
const handleEdit = (row) => {
    curRuleData.value = row;
    visible_edit.value = true;
};
// 设置成员
const handleSetMembers = () => {
    visible_setMembers.value = true;
};
// 设置可见字段
const handleSetFields = (row) => {
    curRuleData.value = row;
    visible_setFields.value = true;
};
// 删除操作
const handleDelete = (row) => {
    curRuleData.value = row;
    visible_delete.value = true;
};
// 分页
// 分页 ref
const pageNationRef = ref(null);
// 分页参数
const pageNationParams = {
    methods: getHighSeasGroupList,
    data: {
        objectApiKey: currentSettingRow.value.apiKey
    }
};
// 处理分页接口数据返回
const updateData = (data) => {
    tableData.value = Array.isArray(data) ? data : [];
    tableLoading.value = false;
};
// 分页修改页码前处理
const beforeChangePage = () => {
    tableLoading.value = true;
};

// dialog 新增编辑
// visible
const visible_edit = ref(false);
// 编辑中数据
const curRuleData = ref({});
// 操作成功处理
const handleOperateSuccess = (postData, resData) => {
    if (postData.id) {
        // 编辑

        // 刷新被编辑的单条数据
        refreshSingleData(postData.id);
    } else {
        // 新建

        // 根据接口返回的数据总条数, 计算得到最大页码
        const total = resData;
        const pageSize = pageNationRef.value.pageSize;
        let maxPage;
        if (Number.isInteger(total) && Number.isInteger(pageSize)) {
            maxPage = Math.ceil(total / pageSize);
        }
        // 跳到最后一页(无值则刷新当前页)
        pageNationRef.value.handleCurrentChange(maxPage);
    }
};

// dialog 删除
// visible
const visible_delete = ref(false);
// 删除确认
const handleDeleteConfirm = () => {
    delHighSeasGroup({ id: curRuleData.value.id }).then(res => {
        if (res.code === 10000) {
            // 关闭弹框
            visible_delete.value = false;
            // 删掉旧数据
            tableData.value.splice(tableData.value.findIndex(item => item.id === curRuleData.value.id), 1);
            // 如果没数据了, 刷新当前页
            if (!tableData.value.length) {
                pageNationRef.value.handleCurrentChange();
            }
        } else {
            ElMessage.error(res.messageShow);
        }
    });
};

// dialog 设置成员
const visible_setMembers = ref(false);

// dialog 设置可见字段
// visible
const visible_setFields = ref(false);

// 初始化获取数据
onMounted(() => {
    pageNationRef.value.handleCurrentChange(1);
});
</script>

<style lang="scss" scoped>
.highSeasGroup {
    height: 100%;
    display: flex;
    flex-direction: column;

    &-header {
        padding: 0 20px 4px;
        display: flex;
        align-items: center;
    }

    &-title {
        flex: 1;
    }

    &-body {
        flex: 1;
    }

    :deep {
        .highSeasGroup-pager {
            margin-right: 24px;
        }
    }
}
</style>
