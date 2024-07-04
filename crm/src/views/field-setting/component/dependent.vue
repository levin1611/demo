<template>
    <div class="field-dependent">
        <!-- header -->
        <div class="field-dependent-header">
            <div class="field-dependent-header-left">
                <div class="field-dependent-title"></div>
            </div>
            <div class="field-dependent-header-right">
                <el-button
                    v-if="!['department', 'staff'].includes(currentSettingRow.apiKey)"
                    type="primary"
                    @click="create"
                >新建字段依赖性</el-button>
            </div>
        </div>

        <el-table
            :data="tableData"
            stripe
            max-height="calc(100% - 106px)"
            height="100%"
            highlight-current-row
            :show-overflow-tooltip="{ showAfter: 500 }"
            class="options-table"
        >
            <!-- 空数据插槽 -->
            <template #empty>
                <default-empty />
            </template>

            <!-- 表格列 -->
            <el-table-column
                label="父字段"
                prop="parentFieldName"
                width="300"
            ></el-table-column>
            <el-table-column
                label="子字段"
                prop="childFieldName"
                width="300"
            ></el-table-column>
            <el-table-column
                label="操作"
                prop="operate"
            >
                 <!-- 角色列 -->
                <template
                    #default="{ row }"
                >
                    <el-link v-if="!['department', 'staff'].includes(currentSettingRow?.apiKey)" type="primary" @click="edit(row)">编辑</el-link>
                    <!-- <el-link type="primary" @click="exportData(row)">导出</el-link> -->
                    <el-link type="primary" @click="deleteRow(row)">删除</el-link>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <!-- <pagenation
            layout="total, prev, pager, next, sizes"
            :queryConfig="pageNationParams"
            :pager-count="5"
            ref="pageNationRef"
            @changeBefore="beforeChangePage"
            @updateData="updateData"
        ></pagenation> -->

         <!-- 新建/编辑字段依赖性 弹框 -->
         <editDependent
            v-model:visible="visible_edit"
            :operate-type="curOperateType"
            :options-data="curOptionsData"
            @operateSuccess="operateSuccess"
        ></editDependent>

        <!-- 删除字段依赖性确认 弹框 -->
        <confirmDialog
            v-model:visible="visible_delete"
            :loading="loading_delete"
            :title="$t('deleteConfirm')"
            tip-content="字段依赖性删除后不能恢复，确认删除吗？"
            @confirm="confirm_delete"
        ></confirmDialog>
    </div>
</template>
<script setup>
import { ref, onMounted, inject } from 'vue';
import { useUserStore } from '@/pinia/modules/user.js';
import editDependent from '../modal/editDependent.vue';
import confirmDialog from '@/components/confirmDialog.vue';
import { getRelationList, delOptionRelation } from '@/api/fieldsSetting.js';
const store = useUserStore();


// 当前选中的行
const currentSettingRow = inject('currentSettingRow');
console.log('当前选中对象：', currentSettingRow.value)

const pageNationRef = ref(null); // 分页组件实例

onMounted(() => {
    getData();
    // 新建成功后, 回到第一页刷新表格显示最新通用选项集列表
    // pageNationRef.value.handleCurrentChange(999999999);
})

const getData = () => {
    getRelationList({
        objectId: currentSettingRow.value.id, // 对象id
    }).then(res => {
        if(res.code === 10000) {
            tableData.value = res.data;
        } else {
            ElMessage.error(res.messageShow);
        }
    })
}

// 页面高度
const pageHeight = ref('calc(100vh - 200px)');
// 弹框是否可见
const visible_edit = ref(false);

// 删除角色 弹框
// 弹框显隐
let visible_delete = ref(false);

// 弹框 loading
let loading_delete = ref(false);

// 当前选中行
const curRow = ref({});
// 当前操作类型
let curOperateType = ref('');
// 当前正在操作的角色的数据
let curOptionsData = ref({});

const tableData = ref([]);

// 获取表格数据 loading
let tableLoading = ref(true);

// 分页配置
const pageNationParams = {
    url: '/v2-meta/fieldOptionRelation/getRelationList',
    method: 'post',
    data: {
        objectId: currentSettingRow.value.id, // 对象id
    }
};

// 分页请求前置处理
const beforeChangePage = () => {
    tableLoading.value = true;
};

// 分页数据请求完毕, 更新表格数据
function updateData(data) {
    tableData.value = handleTableData(data);
    // 取消 loading
    tableLoading.value = false;
}

// 处理表格数据
const handleTableData = (data) => {
    if (!Array.isArray(data)) {
        return [];
    }

    return data;
};

// 新建选项集
const create = () => {
    // 部分业务对象不支持此操作
    if (['department', 'staff'].includes(currentSettingRow.value.apiKey)) {
        return;
    }

    visible_edit.value = true;
    curOperateType.value = 'new';
}

// 编辑选项集
const edit = (row) => {
    visible_edit.value = true;
    curOperateType.value = 'edit';
    curOptionsData.value = row;
    console.log(row);
}

// 操作选项成功
const operateSuccess = (data) => {
    console.log(data)
    // 新建成功
    getData();
}

// 删除
const deleteRow = (row) => {
    curRow.value = row;
    loading_delete.value = false;
    visible_delete.value = true;
}

// 删除 确认
const confirm_delete = () => {
    // 显示 loading
    loading_delete.value = true;
    setTimeout(() => { 
        delOptionRelation({
            childFieldId: curRow.value.childFieldId,
            parentFieldId: curRow.value.parentFieldId,
            objectId: currentSettingRow.value.id, // 对象id
        }).then(res => {
            if(res.code === 10000) {
                getData();
                // 隐藏弹框
                visible_delete.value = false;
                // 取消 loading
                loading_delete.value = false;
            } else {
                ElMessage.error(res.messageShow);
            }
        })
    }, 500)
}

// 导出
const exportData = () => {}

</script>
<style lang="scss" scoped>
@use '@/style/tablePage.scss' as tablePage;
.field-dependent {
    @include tablePage.tablePage();

    height: v-bind(pageHeight);
    padding: 20px 0px 20px;
    &-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        margin-right: 20px;
        &-left {
        }
        &-right {
            display: flex;
            align-items: center;
        }
    }
}

</style>