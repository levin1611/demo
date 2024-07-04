<!-- 
    外部传入 columns, 与后端沟通 只返回业务字段相关的 组件添加首列与最后一列逻辑
    外部传入 tableData 表格数据
    外部传入 title 弹窗标题 直接传多语言标识'add' zh.js中的 add 即可
    外部传入 visible 控制弹窗显示隐藏
    保存后 $emit('handleSave', { 
        changedData: 修改可用用的值, { layoutId: row.layoutId, businessTypeId: columns.prop, status: status}
        tableData: 排序后的tableData,
        changedMembers: 修改后的成员 { layoutId: row.layoutId, changedMembers: changedMembers}
    }); 由外部执行保存和关闭弹窗操作
-->
<template>
    <el-dialog 
        :width="1000"
        :append-to-body="true"
        :close-on-click-modal="false"
        v-model="dialogVisible" 
        @close="closeDialog"
        class="layoutAllocation"
        :title="t('layout.distribute') + title">
        <main class="add_form_main">
            <div class="ayoutAllocationTips">{{tips}}</div>
            
            <el-table
                class="layoutAllocationTable"
                v-loading="tableLoading"
                :data="tableDataSort"
                height="400"
                :cell-class-name="cellClassName"
                :row-class-name="rowClassName"
                @cell-click="cellClick"
                @header-click="headerClick"
                show-overflow-tooltip
                :tooltip-options="{ appendTo: 'body' }"
            >
                <el-table-column
                    v-for="column in tableColumn"
                    :key="column.prop"
                    :prop="column.prop"
                    :label="column.label"
                    :formatter="column.formatter"
                    :width="column.width"
                    :min-width="column.width || 300"
                    :show-overflow-tooltip="['layoutName', 'members'].includes(column.prop)"
                >
                    <template #header>
                        <el-tooltip
                            :content="column.label"
                            placement="top"
                        >
                            <div class="columnHeader">{{column.label}}</div>
                        </el-tooltip>
                        
                    </template>
                    <template #default="{ row, $index }">
                        <span class="handle-drag" v-if="column.prop === 'layoutName'" :class="{ 'disabled-drag' : $index === tableDataLength }">
                            {{row[column.prop]}}
                        </span>
                        <div v-else-if="column.prop === 'members'" :class="{members : $index !== tableDataLength}">
                            <span>{{row[column.prop]}}</span>
                            <i v-if="$index !== tableDataLength" class="custom custom-profile-add" @click="setMembers(row, $index)"></i>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </main>
        <template #footer>
            <div class="flex-footer">
                <div class="handle-area">
                    <template v-if="columns.length > 2">
                        <span class="selectColor"></span><span>{{$t('layoutAllocation.selectedItems')}}{{selsectData.length}}</span>
                        <span class="changeColor"></span><span class="changItems">{{$t('layoutAllocation.changeItems')}}{{changedData.length}}</span>
                        <span>{{$t('layoutAllocation.settingTo')}}</span>
                        <el-select v-model="setVal" @change="handleSetVal" :placeholder="$t('selectPlaceholder')" style="width: 200px;margin-left:12px">
                            <el-option 
                                v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </div>
                <div class="dialog-footer">
                    <el-button class="useBrandColor" @click="closeDialog">{{$t('cancel')}}</el-button>
                    <el-button type="primary" @click="save">{{$t('save')}}</el-button>
                </div>
            </div>
        </template>
    </el-dialog>
    <el-dialog
        :width="800"
        :append-to-body="true"
        :close-on-click-modal="false"
        v-model="visibleMembers" 
        @close="closeMembersDialog" 
        title="适用成员">
        <main class="add_form_main">
            <applicableMember v-if="visibleMembers" ref="applicableMemberDom" :tabs="applicableMemberTabs" :defaultData="defaultData"></applicableMember>
        </main>
        <template #footer>
            <div class="dialog-footer">
                <!-- cancel -->
                <el-button
                    @click="closeMembersDialog"
                    class="useBrandColor"
                >{{ $t('cancel') }}</el-button>
                <!-- confirm -->
                <el-button
                    type="primary"
                    @click="confirm"
                >{{ $t('confirm') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, toRef, computed, onMounted, nextTick, onBeforeUnmount, toRaw } from 'vue';
import Sortable from 'sortablejs';
import applicableMember from '@/components/applicableMember/applicableMember.vue';
import { useI18n } from 'vue-i18n';
import { values } from 'lodash';
const { t } = useI18n();
const applicableMemberTabs = [
    {
        name: 'department',
        label: '部门',
        inputType: 'tree',
        type: 3
    },
    {
        name: 'subDepartments',
        label: '部门以及下级部门',
        inputType: 'tree',
        type: 5
    },
    {
        name: 'memberGroup',
        label: '成员组',
        inputType: 'select',
        type: 4
    },
    {
        name: 'roles',
        label: '角色',
        inputType: 'select',
        type: 2
    },
    {
        name: 'members',
        label: '成员',
        inputType: 'select',
        type: 1
    }
];
const statusFormatter = (row, column, cellValue, index) => {
    return cellValue === 1 ? t('layoutAllocation.appliance') : t('layoutAllocation.notApplicable');
};
// 处理适用成员显示
const splitObjectsitem = (obj, type) => {
    let result = '';
    applicableMemberTabs.forEach(item => {
        const dataList = type === 'object' ? obj[item.type] : obj.filter(v => v.type === item.type);
        if (dataList && dataList.length) {
            result += `${item.label}：`;
            result += dataList.map(item => item.name).join(','); 
            result += ';';
        }
    });
    return result;
};
const dialogVisible = defineModel('dialogVisible');
const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    tips: {
        type: String,
        default: ''
    },
    columns: {
        type: Array,
        default: () => [
            {
                'id': '8',
                'apiKey': null,
                'type': null,
                'name': '默认业务类型',
                'commonUseFlag': false,
                'packFlag': false,
                'requiredFlag': 0
            },
            {
                'id': '14',
                'apiKey': null,
                'type': null,
                'name': '国内客户',
                'commonUseFlag': false,
                'packFlag': false,
                'requiredFlag': 0
            },
            {
                'id': '15',
                'apiKey': null,
                'type': null,
                'name': '国外客户',
                'commonUseFlag': false,
                'packFlag': false,
                'requiredFlag': 0
            }
        ]
    },
    tableData: {
        type: Array,
        default: () => [
            {
                'layoutId': 18,
                'layoutName': '表单页布局1',
                'availableDevice': null,
                'defaultFlag': 0,
                'applicableMembers': null,
                '8': 0,
                '14': 0,
                '15': 0
            },
            {
                'layoutId': 5,
                'layoutName': '默认表单页布局',
                'availableDevice': null,
                'defaultFlag': 1,
                'applicableMembers': null,
                '8': 0,
                '14': 0,
                '15': 0
            }
        ]
    }
});
const emits = defineEmits(['handleSave']);
const setVal = ref(null);
const options = [
    { value: 1, label: t('layoutAllocation.appliance')},
    { value: 0, label: t('layoutAllocation.notApplicable')}
];
const tableDataLength = computed(() => props.tableData.length - 1);
// 复制表头 在首列和尾列增加项
const tableColumn = ref(props.columns);
tableColumn.value.unshift({ id: 'layoutName', name: props.title});
tableColumn.value.push({ id: 'members', name: '适用成员'});
tableColumn.value.forEach(item => {
    item.prop = item.id;
    item.label = item.name;
    if (item.id === 'layoutName') {
        item.width = 150;
    }
    if (!['layoutId', 'members'].includes(item.id)) {
        item.formatter = statusFormatter;
        item.width = 150;
    }
});
// 复制表格数据
const tableDataSort = ref(props.tableData);
if (tableDataSort.value.length) {
    tableDataSort.value.forEach(item => {
        item.members = item.applyMembers ? splitObjectsitem(item.applyMembers, 'object') : '';
    });
}

const tableSortable = ref(null);
const selsectData = ref([]);
const changedData = ref([]);
const changedMembers = ref([]);
const currentRow = ref(null);
const currentRowIndex = ref(null);
const tableLoading = ref(false);
const visibleMembers = ref(false);
const applicableMemberDom = ref(null);
const defaultData = ref([]);

// 设置拖拽
const setSortable = () => {
    if (tableSortable.value) {
        tableSortable.value.destroy();
    }
    const layoutAllocationTable = document.querySelector('.layoutAllocationTable .xhl-el-table__body-wrapper tbody');
    tableSortable.value = Sortable.create(layoutAllocationTable, {
        group: {
            name: 'id',
            pull: false,
            put: false
        },
        handle: '.handle-drag',
        filter: '.disabled-drag',
        animation: 120,
        onEnd: onSortEnd
    });
   
};
// 拖拽结束
const onSortEnd = ({ newIndex, oldIndex }) => {
    if (newIndex === oldIndex) return;
    if (newIndex === tableDataLength.value) {
        newIndex = tableDataLength.value - 1;
    }
    // 拖拽后重新排序
    const newData = [...tableDataSort.value];
    const currRow = newData.splice(oldIndex, 1)[0];
    newData.splice(newIndex, 0, currRow);
    tableDataSort.value = [];
    nextTick(() => {
        tableDataSort.value = newData;
    });
};
onMounted(() => {
    nextTick(() => {
        setSortable();
    });
});
// 单元格选中
const cellClick = (row, column, cell, event) => {
    if (column.property === 'members') return;
    if (row.defaultFlag === 1) return;
    resetSetVal();
    console.log(column.property);
    if (column.property === 'layoutName') {
        let count = 0;
        selsectData.value.forEach(item => {
            if (item.layoutId === row.layoutId) count++;
        });
        console.log(count);
        console.log(props.columns.length);
        if (count === (props.columns.length - 2)) {
            const selsectDatas = selsectData.value.filter(item => item.layoutId !== row.layoutId);
            selsectData.value = selsectDatas;
        } else {
            props.columns.forEach(item => {
                if (!['layoutName', 'members'].includes(item.prop)) {
                    const index = selsectData.value.findIndex(items => items.layoutId === row.layoutId && items.businessTypeId === item.prop);
                    if (index === -1) {
                        selsectData.value.push({ layoutId: row.layoutId, businessTypeId: item.prop, status: row[item.prop]});
                    }
                }
            });
        }
        return;
    }
    if (cell.classList.contains('cell-selected')) {
        const index = selsectData.value.findIndex(item => item.layoutId === row.layoutId && item.businessTypeId === column.property);
        selsectData.value.splice(index, 1);
    } else {
        const obj = {layoutId: row.layoutId, businessTypeId: column.property, status: row[column.property]};
        selsectData.value.push(obj);
    }
};
// 表头选中
const headerClick = (column, event) => {
    if (['layoutName', 'members'].includes(column.property)) return;
    resetSetVal();
    let count = 0;
    selsectData.value.forEach(item => {
        if (item.businessTypeId === column.property) count++;
    });
    if (count === tableDataLength.value) {
        const selsectDatas = selsectData.value.filter(item => item.businessTypeId !== column.property);
        selsectData.value = selsectDatas;
    } else {
        props.tableData.forEach(item => {
            if (![1].includes(item.defaultFlag)) {
                const index = selsectData.value.findIndex(items => items.layoutId === item.layoutId && items.businessTypeId === column.property);
                if (index === -1) {
                    selsectData.value.push({ layoutId: item.layoutId, businessTypeId: column.property, status: item[column.property]});
                }
                
            }
        });
    }
};
// 单元格设置class
const cellClassName = ({ row, column, rowIndex, columnIndex}) => {
    if (selsectData.value.length > 0) {
        for (let i = 0; i < selsectData.value.length; i++) {
            if (selsectData.value[i].layoutId === row.layoutId && selsectData.value[i].businessTypeId === column.property) {
                return 'cell-selected';
            }
        }
    }
    if (changedData.value.length > 0) {
        for (let i = 0; i < changedData.value.length; i++) {
            if (changedData.value[i].layoutId === row.layoutId && changedData.value[i].businessTypeId === column.property) {
                return 'cell-isUpdate';
            }
        }
    }
};
// 表格行设置class
const rowClassName = ({ row, rowIndex }) => {
    if (rowIndex === (tableDataLength.value)) {
        return 'table-disable';
    }
};
// footer 重置selsect值
const resetSetVal = () => {
    setVal.value = null;
};
// 修改值逻辑
const handleSetVal = (val) => {
    const oldSeletctData = [];
    selsectData.value.forEach((item, index) => {
        if (item.status !== val) {
            item.status = val;
            tableDataSort.value.forEach(datas => {
                if (datas.layoutId === item.layoutId) {
                    datas[item.businessTypeId] = val;
                }
            });
            const index = changedData.value.findIndex(items => items.layoutId === item.layoutId && items.businessTypeId === item.businessTypeId);
            if (index !== -1) {
                changedData.value.splice(index, 1, item);
            } else {
                changedData.value.push(item);
            }
        } else {
            oldSeletctData.push(item);
        }
    });
    selsectData.value = oldSeletctData;
};
// 设置成员逻辑
const setMembers = (row, index) => {
    currentRow.value = row;
    currentRowIndex.value = index;
    defaultData.value = objectToArray(currentRow.value.applyMembers);
    visibleMembers.value = true;
};
// 对象转换成数组
const objectToArray = (obj) => {
    let result = [];
    if (obj) {
        Object.values(obj).forEach(values => {
            // const values = toRaw(obj[key]);
            result = result.concat(values);
        });
    }
    return result;
};
// 设置成员保存
const confirm = () => {
    const memberData = applicableMemberDom.value.getCheckData();
    const index = changedMembers.value.findIndex(item => item.layoutId === currentRow.value.layoutId);
    tableDataSort.value[currentRowIndex.value].applyMembers = memberData;
    tableDataSort.value[currentRowIndex.value].members = splitObjectsitem(memberData, 'array');
    const Obj = {
        layoutId: currentRow.value.layoutId,
        changedMembers: memberData
    };
    if (index !== -1) {
        changedMembers.value.splice(index, 1, Obj);
    } else {
        changedMembers.value.push(Obj);
    }
    closeMembersDialog();
};
// 关闭设置成员弹窗
const closeMembersDialog = () => {
    visibleMembers.value = false;
};
// 保存逻辑
const save = () => {
    emits('handleSave', { changedData: changedData.value, tableData: tableDataSort.value, changedMembers: changedMembers.value});
};
// 关闭弹窗
const closeDialog = () => {
    dialogVisible.value = false;
};
// 组件卸载是清除拖拽组件
onBeforeUnmount(() => {
    if (tableSortable.value) {
        tableSortable.value.destroy();
        tableSortable.value = null;
    }
});
</script>

<style lang="scss">
    .layoutAllocation {
        .ayoutAllocationTips {
            margin-bottom: 12px;
            font-size: 14px;
            line-height: 22px;
            white-space: pre;
        }
        .#{$elnamespace}-table .cell {
            height: 24px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        .cell-selected {
            background: rgba(66, 133, 242, 0.5);
        }
        .cell-isUpdate {
            background: rgba(234, 67, 53, 0.5);
        }
        .#{$elnamespace}-table--enable-row-hover .#{$elnamespace}-table__body tr:hover > td.#{$elnamespace}-table__cell.cell-selected {
            background: rgba(66, 133, 242, 0.5);
        }
        .members {
            display: flex;
            align-items: center;
            justify-content: space-between;
            span {
                width: calc(100% - 30px);
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            .custom {
                font-size: 24px;
                color: rgba(66, 133, 242, 1);
                cursor: pointer;
            }
        }
        .handle-drag {
            margin: 0;
            cursor: move;
        }
        .table-disable {
            color: #C0C4CC;
            .handle-drag { 
                cursor: default;
            }
        }
        .flex-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .handle-area {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                width: 75%;
                font-size: 14px;
                .selectColor {
                    width: 16px;
                    height: 16px;
                    background: #4285F2;
                    margin-right: 3px;
                }
                .changeColor {
                    width: 16px;
                    height: 16px;
                    background: #EA4335;
                    margin-left: 20px;
                    margin-right: 3px;
                }
                .changItems {
                    margin-right: 20px;
                    color: #EA4335;
                }
            }
        }
        .columnHeader {
            display: inline-block;
            max-width: 100%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }
    
</style>