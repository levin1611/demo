<!-- 通用选项集列表 -->
<template>
    <div class="options-set">
        <!-- header -->
        <div class="options-set-header">
            <div class="options-set-header-left">
                <div class="options-set-title">通用选项集</div>
            </div>
            <div class="options-set-header-right">
                <el-button
                    type="primary"
                    @click="createOptions"
                >新建通用选项集</el-button>
            </div>
        </div>

        <el-table
            :data="tableData"
            stripe
            max-height="calc(100% - 106px)"
            height="100%"
            highlight-current-row
            :show-overflow-tooltip="{ showAfter: 500, width: 600 }"
            class="options-table"
        >
            <!-- 空数据插槽 -->
            <template #empty>
                <default-empty />
            </template>

            <!-- 表格列 -->
            <el-table-column
                label="名称"
                prop="displayName"
                width="200"
            ></el-table-column>
            <el-table-column
                label="程序识别名称"
                prop="apiKey"
                width="200"
            ></el-table-column>
            <el-table-column
                label="选项信息"
                prop="dataOptionsStr"
            ></el-table-column>
            <el-table-column
                label="操作"
                width="200"
                prop="operate"
            >
                 <!-- 角色列 -->
                <template
                    #default="{ row }"
                >
                    <el-link type="primary" @click="editOptions(row)">编辑</el-link>
                    <el-link type="primary" @click="checkInfo(row)">查看引用</el-link>
                    <el-link type="primary" v-if="row.type !== 0" @click="deleteOptions(row)">删除</el-link>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <pagenation
            layout="total, prev, pager, next, sizes"
            :queryConfig="pageNationParams"
            :pager-count="5"
            ref="pageNationRef"
            @changeBefore="beforeChangePage"
            @updateData="updateData"
        ></pagenation>

         <!-- 新建/编辑通用选项集 弹框 -->
         <EditOptions
            v-model:visible="visible_editOptions"
            :operate-type="curOperateType"
            :options-data="curRow"
            @operateSuccess="operateOptionsSuccess"
        ></EditOptions>
        <!-- 新建/编辑角色 弹框 -->
        <checkOptions
            v-model:visible="visible_checkOptions"
            :options-data="curRow"
            operateType="new"
        ></checkOptions>

        <!-- 删除角色确认 弹框 -->
        <confirmDialog
            v-model:visible="visible_deleteOptions"
            :loading="loading_deleteOptions"
            :title="$t('deleteConfirm')"
            tip-content="通用选项集删除后不能恢复，确认删除吗？"
            @confirm="confirm_deleteOptions"
        ></confirmDialog>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/pinia/modules/user.js';
import { prName } from '@/api/generalOptionsSet.js';
import EditOptions from './modal/editOptions.vue';
import checkOptions from './modal/checkOptions.vue';
import { deleteOption } from '@/api/generalOptionsSet.js';
import confirmDialog from '@/components/confirmDialog.vue';
import pagenation from '@/components/pagenation.vue';

const store = useUserStore();

// 页面高度
const pageHeight = ref('calc(100vh - 56px)');
// 弹框是否可见
const visible_editOptions = ref(false);
// 查看引用
const visible_checkOptions = ref(false);


// 删除角色 弹框
// 弹框显隐
let visible_deleteOptions = ref(false);

// 弹框 loading
let loading_deleteOptions = ref(false);

// 当前选中行
const curRow = ref({});
// 当前操作类型
let curOperateType = ref('');
// 当前正在操作的角色的数据
let curOptionsData = ref({});

const tableData = ref([]);
const pageNationRef = ref(null); // 分页组件实例

// 获取表格数据 loading
let tableLoading = ref(true);

onMounted(() => {
    // 请求第一页数据
    pageNationRef.value.handleCurrentChange(1);
})

const listQueryParams = ref({});
const pageNationParams = {
    url: '/v2-meta/v1/common-option/pageList',
    method: 'get',
    data: listQueryParams.value
};

// 分页请求前置处理
const beforeChangePage = () => {
    tableLoading.value = true;
};

// 分页数据请求完毕, 更新表格数据
function updateData(data) {
    console.log('--------', data)
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
const createOptions = () => {
    prName().then(res => {
        if(res.code === 10000) {
            curRow.value.apiKey = res.data;
            visible_editOptions.value = true;
            curOperateType.value = 'new';
        } else {
            ElMessage.error(res.messageShow);
        }
       
    })
}

// 编辑选项集
const editOptions = (row) => {
    curOperateType.value = 'edit';
    visible_editOptions.value = true;
    curRow.value = row;
    console.log(row);
}

// 操作选项成功
const operateOptionsSuccess = (data) => {
   // 新建成功
   if (['new'].includes(curOperateType.value)) {
        // 新建成功后, 回到第一页刷新表格显示最新通用选项集列表
        pageNationRef.value.handleCurrentChange(1);
    } else {
        pageNationRef.value.handleCurrentChange();
    }
    console.log(data)
}
// 查看引用
const checkInfo = (row) => {
    curRow.value = row;
    visible_checkOptions.value = true;
}

// 删除
const deleteOptions = (row) => {
    curRow.value = row;
    loading_deleteOptions.value = false;
    visible_deleteOptions.value = true;
}

// 删除角色 确认
const confirm_deleteOptions = () => {
    // 显示 loading
    loading_deleteOptions.value = true;
    deleteOption({
        id: curRow.value.id
    }).then(res => {
        if(res.code === 10000) {
            // 隐藏弹框
            visible_deleteOptions.value = false;
            // 取消 loading
            loading_deleteOptions.value = false;
            pageNationRef.value.handleCurrentChange();
        } else {
            // 取消 loading
            loading_deleteOptions.value = false;
            ElMessage.error(res.messageShow);
        }
    })
}

</script>
<style lang="scss" scoped>
@use '@/style/tablePage.scss' as tablePage;
.options-set {
    @include tablePage.tablePage();

    height: v-bind(pageHeight);
    &-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        &-left {
        }
        &-right {
            display: flex;
            align-items: center;
        }
    }
}

</style>
<style lang="scss">
.options-table {
    .xhl-el-popper {
        max-width: 600px;
    }
}
</style>