<template>
    <div class="options-set-list">
        <!-- <el-table-v2
            :columns="columnsConfig"
            :data="tableData"
            :width="650"
            :row-class="rowClass"
            :height="247"
            ref="optionsSetTableRef"
            header-class="table-header"
            fixed
            class="options-table-table-v2"
            @scroll="handleScroll"
            v-loading="loading"
        >
            <template #empty>
                <default-empty />
            </template>
            <template v-slot:cell="{ column, rowData }">
                <template v-if="['apiKey', 'displayName'].includes(column.dataKey)">
                    <el-input v-if="rowData.create || rowData.edit" type="text" v-model="rowData.displayName" class="ipt" style="width:148px;"/>
                    <span v-else>{{rowData.displayName}}</span>
                </template>
                <template v-else-if="['enabledFlag'].includes(column.dataKey)">
                    <el-switch
                        v-model="rowData.enabledFlag"
                        @change="handleChange(rowData)"
                        inline-prompt
                        active-text="启用"
                        inactive-text="禁用"
                    />
                </template>
                <template v-else-if="['operate'].includes(column.dataKey)">
                    <span v-if="rowData.edit">
                        <el-link type="primary" @click="saveOptions(rowData, $index)">保存</el-link>
                        <el-link type="primary" @click="cancel(rowData)">取消</el-link>
                    </span>
                    <span v-else>
                        <span v-if="rowData.create">
                            <el-link type="primary" @click="createOptions(rowData, $index)">添加</el-link>
                            <el-link type="primary" @click="batchAddOptions(rowData)">批量添加</el-link>
                        </span>
                        <span v-else>
                            <el-link type="primary" @click="editOptions(rowData, $index)">编辑</el-link>
                            <el-link type="primary" @click="deleteOptions(rowData, $index)">删除</el-link>
                        </span>
                    </span>
                </template>
            </template>
        </el-table-v2> -->
        <el-table
            :data="tableData"
            max-height="calc(100% - 106px)"
            height="247"
            highlight-current-row
            :show-overflow-tooltip="{ showAfter: 500 }"
            class="options-table"
            ref="optionsSetRef"
            row-key="optionsSetCode"
            row-class-name="tableRowClassName"
            fit
            v-if="sortableStatus"
            v-loading="loading"
        >
            <template #empty>
                <default-empty />
            </template>

            <el-table-column
                label="选项名称"
                prop="displayName"
                width="180"
            >
                <template #default="{ row }">
                    <el-input v-if="row.create || row.edit" type="text" v-model="row.displayName" class="ipt" style="width:148px;"/>
                    <span v-else>{{row.displayName}}</span>
                </template>
            </el-table-column>
            <el-table-column
                label="程序识别名称"
                prop="apiKey"
                width="180"
            >
                <template #default="{ row }">
                    <el-input v-if="row.create || row.edit" type="text" v-model="row.apiKey" class="ipt" style="width:148px;"/>
                    <span v-else>{{row.apiKey}}</span>
                </template>
            </el-table-column>
            <el-table-column
                label="状态"
                width="80"
                prop="options"
            >
                <template #default="{ row }">
                    <el-switch
                        v-model="row.enabledFlag"
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
                width="180"
            >
                <template
                    #default="{ row, column, $index }"
                >   
                    <span v-if="row.edit">
                        <el-link type="primary" @click="saveOptions(row, $index)">保存</el-link>
                        <el-link type="primary" @click="cancel(row)">取消</el-link>
                    </span>
                    <span v-else>
                        <span v-if="row.create">
                            <el-link type="primary" @click="createOptions(row, $index)">添加</el-link>
                            <el-link type="primary" @click="batchAddOptions(row)">批量添加</el-link>
                        </span>
                        <span v-else>
                            <el-link type="primary" @click="editOptions(row, $index)">编辑</el-link>
                            <el-link type="primary" @click="deleteOptions(row, $index)">删除</el-link>
                        </span>
                    </span>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog
            v-model="dialogBatchVisible"
            title="批量添加"
            width="800px"
            :append-to-body="true"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            class="editRole"
        >
            <el-input
                v-model="batchAddValue"
                :placeholder="$t('fieldSet.pleaseEnter1')"
                type="textarea"
                :autosize="false"
                resize="none"
                class="batchAddValue"/>
            <!-- footer -->
            <template #footer>
                <div class="dialog-footer">
                    <!-- cancel -->
                    <el-button
                        @click="dialogBatchVisible = false"
                        class="useBrandColor"
                    >{{ $t('cancel') }}</el-button>
                    <!-- confirm -->
                    <el-button
                        type="primary"
                        @click="batchAddSubmit"
                    >{{ $t('confirm') }}</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useUserStore } from '@/pinia/modules/user.js';
import { tryOnBeforeUnmount } from '@vueuse/core';
import Sortable from 'sortablejs';
import { column } from './config.js';
import {
    cloneDeep
} from 'lodash';

const store = useUserStore();

const columnsConfig = ref([
    {
        key: 'displayName',
        dataKey: 'displayName',
        title: '选项名称',
        width: 180
    },
    {
        key: 'apiKey',
        dataKey: 'apiKey',
        title: '程序识别名称',
        width: 180
    },
    {
        key: 'enabledFlag',
        dataKey: 'enabledFlag',
        title: '状态',
        width: 80
    },
    {
        key: 'operate',
        dataKey: 'operate',
        title: '操作',
        width: 180
    }
]);
console.log(columnsConfig.value)

// 接受外部传参
const props = defineProps({
    optionsList: {
        type: Object,
        default: () => ({})
    }
});

const tableData = ref([]);

let currentRow = ref({}); // 当前点击的 表格行
const rowClass = ({rowData, rowIndex}) => {
    if (rowData.id === (currentRow.value && currentRow.value.id)) {
        return 'activeRow';
    } else if (rowIndex % 2 !== 0) {
        return 'stripe_dark';
    }
};
// 定义 emit
const emits = defineEmits([
    'updateOptionsList'
]);

const optionsSetRef = ref(null);
const optionsSetTableRef = ref(null);
const sortableStatus = ref(true);
// 当前编辑项
let selectOptionsRow = {};

// 批量添加多行文本框
const batchAddValue = ref('');
const dialogBatchVisible = ref(false);

const loading = ref(true);

// 保存批量添加
const batchAddSubmit = () => {
    let str_array = batchAddValue.value?.split(/[(\r\n)\r\n]+/);
    if((tableData.value.length - 1) + str_array.length > 1000) {
        ElMessage.error('选项值不能超过1000个');
        return
    }
    str_array.forEach((item, i) => { // 删除空项
        const flag = tableData.value.some((v, index) => v.displayName === item.trim());
        let rowKey = 1;
        if (!flag) {
            const arr = tableData.value.map((item) => Number(item.apiKey)).filter((item) => !isNaN(item));
            tableData.value.forEach((item, index) => {
                if (item.apiKey && !isNaN(Number(item.apiKey)) && arr.includes(rowKey)) {
                    rowKey++;
                }
            });
            if (item === "") {
                str_array.splice(i, 1);
            } else {
                tableData.value.splice(tableData.value.length - 1, 0, {displayName: item.trim(), apiKey: rowKey.toString(), colors:'#FF752A', enabledFlag: true, create: false, edit: false})
            }
        }
      
    })
    // 设置滚动条位置
    const scroll = optionsSetRef.value.scrollBarRef;
    // 设置表格滚动的位置
    nextTick(() => {
        optionsSetRef.value.setScrollTop(scroll.wrapRef.querySelector('.xhl-el-scrollbar__view').offsetHeight);
    })
    dialogBatchVisible.value = false;
    emits('updateOptionsList', tableData.value);
    console.log(str_array);
}
// 批量添加
const batchAddOptions = () => {
    dialogBatchVisible.value = true;
    batchAddValue.value = '';
}

// 列表排序
const onSortEnd = (evt) => {
    const { newIndex, oldIndex } = evt
    console.log(newIndex, oldIndex)
    let _tableData = cloneDeep(tableData.value);
    _tableData.splice(newIndex, 0, ..._tableData.splice(oldIndex, 1));
    tableData.value = [];
    // sortableStatus.value = false;
    nextTick(() => {
        tableData.value = _tableData;
        emits('updateOptionsList', tableData.value);
    })
};

// 预定义色值
const predefineColors = [
    '#71A3F5', '#40D9B3', '#50D4DF', '#9C8CF2', '#FF985F', '#FFCD43', '#40CEFE', '#7388B6', '#5BBA7E', '#EF7267'
]

onMounted(() => {
    nextTick(() => {
        createSortable();
    })
})

const sortEl = ref();
const handleScroll = () => {
    // if(optionsSetRef.value) {
    //     optionsSetRef.value.destroy();
    //     nextTick(() => {
    //         createSortable();
    //     });
    // }
}
const createSortable = () => {
    const scroll = optionsSetRef.value.scrollBarRef;
    optionsSetRef.value = Sortable.create(scroll.wrapRef.querySelector('tbody'), {
        group: {
            pull: false,
            put: false
        },
        animation: 150,
        onEnd: onSortEnd
    });
    // const scroll = document.querySelector('.options-table-table-v2 .xhl-el-table-v2__body .xhl-el-table-v2__row').parentNode
    // optionsSetRef.value = Sortable.create(scroll, {
    //     group: {
    //         pull: false,
    //         put: false
    //     },
    //     animation: 150,
    //     onEnd: onSortEnd,
    //     onAdd: (evt) => {
    //         console.log('add')
    //         // 添加一行
    //     }
    // });

}

// 获取表格数据 loading
let tableLoading = ref(true);

// 添加一条新的选项信息
const createOptions = (row, rowIndex) => {
    if(tableData.value.length > 1000) {
        ElMessage.error('选项值不能超过1000个');
        return
    }
    console.log(row, tableData.value)
    const flagDisplayName = tableData.value.some((item, index) => item.displayName === row.displayName.trim() && index !== rowIndex);
    if (flagDisplayName) {
        ElMessage.error('选项名称重复');
        return;
    }
    const flagApiKey = tableData.value.some((item, index) => item.apiKey === row.apiKey && index !== rowIndex);
    if (flagApiKey) {
        ElMessage.error('程序识别名称重复');
        return;
    }
    if(row.displayName.trim() === '') {
        ElMessage.error('请输入选项名称');
        return
    };
    if (!row.apiKey) {
        let rowKey = 1;
        const arr = tableData.value.map((item) => Number(item.apiKey)).filter((item) => !isNaN(item));
        console.log(arr);
        tableData.value.forEach((item, index) => {
            if (item.apiKey && !isNaN(Number(item.apiKey)) && arr.includes(rowKey)) {
                rowKey++;
            }
        });
        row.apiKey = rowKey.toString();
    }
    // 更改为新建状态
    row.create = false;
    // 添加一行
    tableData.value.push({displayName: '', apiKey: '', colors:'#FF752A', enabledFlag: true, create: true, edit: false});
    emits('updateOptionsList', tableData.value);
    // 设置滚动条位置
    const scroll = optionsSetRef.value.scrollBarRef;
    // 设置表格滚动的位置
    nextTick(() => {
        optionsSetRef.value.setScrollTop(scroll.wrapRef.querySelector('.xhl-el-scrollbar__view').offsetHeight);
    })
}

// 编辑选项信息
const editOptions = (row) => {
    selectOptionsRow = JSON.parse(JSON.stringify(row));
    row.edit = true;
}

// 保存编辑信息
const saveOptions= (row, rowIndex) => {
    if (row.displayName.trim() && row.apiKey) {
        const flagDisplayName = tableData.value.some((item, index) => item.displayName === row.displayName.trim() && index !== rowIndex);
        if (flagDisplayName) {
            ElMessage.error('选项名称重复');
            return;
        }
        const flagApiKey = tableData.value.some((item, index) => item.apiKey === row.apiKey && index !== rowIndex);
        if (flagApiKey) {
            ElMessage.error('程序识别名称重复');
            return;
        }
        row.edit = false;
        emits('updateOptionsList', tableData.value);
    } else {
        ElMessage.error('请填写选项名称/程序识别名称');
    }
    
}

// 取消编辑
const cancel = (row) => {
    row.displayName = selectOptionsRow.displayName;
    row.apiKey = selectOptionsRow.apiKey;
    row.enabledFlag = selectOptionsRow.enabledFlag;
    row.edit = false;
    selectOptionsRow = {}
}

// 删除选项
const deleteOptions = (row, index) => {
    tableData.value.splice(index, 1)
    emits('updateOptionsList', tableData.value);
}

// 启用、禁用
const handleChange = () => {
    emits('updateOptionsList', tableData.value);
}
// 按名称排序
// let sourceData = [];
let sortableFlag = false;
let sourceData = [];

watch(
    () => props.optionsList,
    (val) => {
        tableData.value = val;
        sourceData = cloneDeep(val);
        if (val.length > 0) {
            loading.value = false;
        } else {
            loading.value = true;
        }
    },
    {
        immediate: true
    }
);
</script>
<style lang="scss" scoped>
.tableRowClassName {
    cursor: move;
}
.batchAddValue {
    width: 100%;
    height: 500px;
    :deep {
        .#{$elnamespace}-textarea__inner {
            height: 100%;
        }
    }
}

</style>