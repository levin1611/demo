<template>
    <div class="field-dependent">
        <!-- header -->
        <div class="field-dependent-header">
            <div class="field-dependent-header-left">
                <div class="field-dependent-title">自定义字段</div>
            </div>
            <div class="field-dependent-header-right">
                <el-popover
                    placement="bottom-end"
                    :width="420"
                    effect="dark"
                    :popper-options="{modifiers: [{ name: 'arrow', options: { padding: 10 }}]}"
                    trigger="click"
                >
                    <template #reference>
                        <span class="custom custom-Tips"></span>
                    </template>
                    <div>
                        当前还可添加：<br />
                        文本、邮箱、自动编号、计算-文本：{{residueCount?.string320Avail}}个<br />
                        文本域：{{residueCount?.textAvail}}个<br />
                        电话：{{residueCount?.string128Avail}}个<br />
                        多选、文件、图片：{{residueCount?.bigintArrayAvail}}个<br />
                        网址：{{residueCount?.string3000Avail}}个<br />
                        日期、计算-日期：{{residueCount?.dateAvail}}个<br />
                        日期时间、计算-日期时间：{{residueCount?.datetimeAvail}}个<br />
                        百分比类型、实数类型、计算-百分比、计算-实数、计算-汇总累计：{{residueCount?.doubleAvail}}个<br />
                        多币种、单币种、计算-币种：{{residueCount?.jsonbAvail}}个<br />
                        单选、关联关系、主子明细、引用数据、整数：{{residueCount?.bigintAvail}}个<br />
                        布尔、计算-布尔：{{residueCount?.smallintAvail}}个<br />
                        地理定位：{{residueCount?.pointAvail}}个
                    </div>
                </el-popover>
                
                <el-button
                    v-if="!['department', 'staff'].includes(currentSettingRow.apiKey)"
                    type="primary"
                    @click="create"
                >添加自定义字段</el-button>
            </div>
        </div>

        <el-table
            :data="customField"
            stripe
            highlight-current-row
            :tooltip-options="{ appendTo: 'body' }"
            :show-overflow-tooltip="{ showAfter: 500 }"
            class="options-table"
        >
            <!-- 空数据插槽 -->
            <template #empty>
                暂无数据
            </template>

            <!-- 表格列 -->
            <el-table-column
                label="字段名称"
                prop="displayName"
                width="400"
            ></el-table-column>
            <el-table-column
                label="字段类型"
                prop="dataTypeName"
                width="160"
            ></el-table-column>
            <el-table-column
                label="程序识别名称"
                prop="apiKey"
                width="200"
            ></el-table-column>
            <el-table-column
                label="状态"
                prop="enableFlagBoolean"
                v-if="!['department', 'staff'].includes(currentSettingRow?.apiKey)"
                width="120"
            >
                <template #default="{ row }">
                    <el-switch
                        v-model="row.enableFlagBoolean"
                        :disabled="row.enableFlag === 2"
                        @change="handleChange(row)"
                        inline-prompt
                        active-text="启用"
                        inactive-text="禁用"
                    />
                </template>
            </el-table-column>
            <el-table-column
                label="操作"
                prop="operate"
            >
                 <!-- 角色列 -->
                <template
                    #default="{ row }"
                >
                    <el-link v-if="!['department', 'staff'].includes(currentSettingRow?.apiKey)" type="primary" @click="edit(row)">编辑</el-link>
                    <el-link type="primary" @click="deleteRow(row)">删除</el-link>
                </template>
            </el-table-column>
        </el-table>
        <div class="field-dependent-header" style="margin-top: 20px">
            <div class="field-dependent-header-left">
                <div class="field-dependent-title">系统标准字段</div>
            </div>
        </div>
        <el-table
            :data="systemField"
            stripe
            highlight-current-row
            :tooltip-options="{ appendTo: 'body' }"
            :show-overflow-tooltip="{ showAfter: 500 }"
            class="options-table"
        >
            <!-- 空数据插槽 -->
            <template #empty>
                暂无数据
            </template>

            <!-- 表格列 -->
            <el-table-column
                label="字段名称"
                prop="displayName"
                width="400"
            ></el-table-column>
            <el-table-column
                label="字段类型"
                prop="dataTypeName"
                width="160"
            ></el-table-column>
            <el-table-column
                label="程序识别名称"
                prop="apiKey"
                :width="!['department', 'staff'].includes(currentSettingRow?.apiKey)? 200 : null"
            ></el-table-column>
            <el-table-column
                label="状态"
                prop="enableFlagBoolean"
                v-if="!['department', 'staff'].includes(currentSettingRow?.apiKey)"
                width="120"
            >
                <template #default="{ row }">
                    <el-switch
                        v-model="row.enableFlagBoolean"
                        @change="handleChange(row)"
                        :disabled="row.enableFlag === 2"
                        inline-prompt
                        active-text="启用"
                        inactive-text="禁用"
                    />
                </template>
            </el-table-column>
            <el-table-column
                label="操作"
                prop="operate"
                v-if="!['department', 'staff'].includes(currentSettingRow?.apiKey)"
            >
                 <!-- 角色列 -->
                <template
                    #default="{ row }"
                >
                    <el-link  v-if="!['department', 'staff'].includes(currentSettingRow?.apiKey)" type="primary" @click="edit(row)">编辑</el-link>
                </template>
            </el-table-column>
        </el-table>

        <!-- 删除角色确认 弹框 -->
        <confirmDialog
            v-model:visible="visible_delete"
            :loading="loading_delete"
            :title="$t('deleteConfirm')"
            tip-content="字段删除后不能恢复，确认删除吗？"
            @confirm="confirm_delete"
        ></confirmDialog>
        
        <fieldModal v-if="visible_edit" v-model:dialogVisible="visible_edit" :id="editId" :editType="editType" @updataList="getData"></fieldModal>
    </div>
</template>
<script setup>
import { ref, onMounted, inject } from 'vue';
import { useUserStore } from '@/pinia/modules/user.js';
import { queryObjFieldList, deleteBizObjField, changeObjFieldStatus } from '@/api/fieldsSetting.js';
import { getCustomFieldCount } from '@/api/fieldModal'
import { fieldsNamesMap } from '@/utils/filterConfig';

import confirmDialog from '@/components/confirmDialog.vue';
import fieldModal from '@/views/field-setting/modal/fieldModal.vue';
import { useI18n } from 'vue-i18n';
const store = useUserStore();

const { t } = useI18n();
// 当前选中的行
const currentSettingRow = inject('currentSettingRow');
console.log('当前选中对象：', currentSettingRow.value);
const residueCount = ref({});


onMounted(() => {
    getData();
    getCustomFieldCount({
        objectId: currentSettingRow.value.id
    }).then(res => {
        if (res.code === 10000) {
            console.log(res.data);
            residueCount.value = res.data;
        } else {
            ElMessage.error(res.messageShow);
        }
    })
})

// 页面高度
const pageHeight = ref('calc(100vh -180px)');
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

const customField = ref([]); // 自定义字段
const systemField = ref([]); // 系统标椎字段

// 获取表格数据 loading
let tableLoading = ref(true);

const editId = ref('');
const editType = ref('');
// 新建选项集
const create = () => {
    // 部分业务对象不支持此操作
    if (['department', 'staff'].includes(currentSettingRow.value.apiKey)) {
        return;
    }

    visible_edit.value = true;
    editId.value = '';
    editType.value = '';
};

// 编辑选项集
const edit = (row) => {
    editId.value = `${row.id}`;
    editType.value = `${row.dataType}`;
    visible_edit.value = true;
};

// 操作选项成功
const operateSuccess = (data) => {
    console.log(data)
}

// 删除
const deleteRow = (row) => {
    curRow.value = row;
    loading_delete.value = false;
    visible_delete.value = true;
}

const getData = () => {
    queryObjFieldList({
        objectId: currentSettingRow.value.id, // 对象id
    }).then(res => {
        if(res.code === 10000) {
            customField.value = handleData(res.data.customField);
            systemField.value = handleData(res.data.systemField);
        } else {
            ElMessage.error(res.messageShow);
        }
    })
}

// 处理数据
const handleData = data => data.map(item => ({
    ...item,
    enableFlagBoolean: Boolean(item.enableFlag),
    dataTypeName: fieldsNamesMap[item.dataType],
}));

// 删除角色 确认
const confirm_delete = () => {
    // 显示 loading
    loading_delete.value = true;
    deleteBizObjField({
        fieldId: curRow.value.id,
        objId: currentSettingRow.value.id,
    }).then(res => {
        if(res.code === 10000) {
            // 隐藏弹框
            visible_delete.value = false;
            // 取消 loading
            loading_delete.value = false;
            // 刷新列表
            getData();
        } else {
            loading_delete.value = false;
            ElMessage.error(res.messageShow);
        }
    })
}
const handleChange = (row) => {
    // 显示 loading
    loading_delete.value = true;
    changeObjFieldStatus({
        id: row.id,
        objectId: row.objectId,
        enableFlag: row.enableFlag === 1 ? 0 : 1
    }).then(res => {
        if(res.code === 10000) {
            // 取消 loading
            loading_delete.value = false;
            // 刷新列表
            getData();
        } else {
            ElMessage.error(res.messageShow);
        }
    })
}


</script>
<style lang="scss" scoped>
@use '@/style/tablePage.scss' as tablePage;
.field-dependent {
    @include tablePage.tablePage();

    height: v-bind(pageHeight);
    padding: 12px 0px 50px;
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
            .custom-Tips{
                font-size: 14px;
                color: #606266;
                margin-right: 20px;
                cursor: pointer;
            }
        }
        
    }
}

</style>
<style lang="scss">
.field-dependent {
    .xhl-el-table {
        .xhl-el-table__cell {
            padding: 9px 0;
        }
    }
}
</style>
<style scoped lang="scss">
.field-dependent {
    &-title {
        font-size: 15px;
    }
}
</style>