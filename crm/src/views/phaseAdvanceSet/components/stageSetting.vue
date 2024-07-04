<!-- 阶段设置 -->
<template>
    <div class="stageSetting">
        <div class="stageSetting-new">
            <el-button type="primary" @click="showAddForm">添加阶段</el-button>
        </div>
        <el-table
            style="overflow: auto"
            :data="tableData"
            stripe
            :max-height="tHeightComputed"
            highlight-current-row
            :cell-class-name="isWinner"
            :row-class-name="rowClass"
            :show-overflow-tooltip="{ showAfter: 500, width: 600 }"
            class="options-table"
            ref="optionsSetRef"
        >
            <template #empty>
                <default-empty />
            </template>
            <el-table-column
                width="40"
            >
                <i class="custom custom-yidong" style="cursor: move;"></i>
            </el-table-column>
            <el-table-column
                label="排序（拖动调整）"
                prop="sortNum"
                width="200"
            >
                <template #default="{ row }">
                    <span v-if="row.apiKey === 'lose'" style="color: #303133">-</span>
                    <span v-else>{{row.sortNum !== null ? row.sortNum : '-'}}</span>
                </template>
            </el-table-column>
            <el-table-column
                label="阶段名称"
                prop="name"
                width="300"
            >
                <template #default="{ row }">
                    <el-input v-if="row.edit" v-model="stageName" placeholder="销售阶段名称" maxlength="50" style="width:200px"/>
                    <span v-else>{{ row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column
                label="所属状态"
                prop="stageStatus"
                width="200"
            >
                <template #default="{ row }">
                    <el-select
                        v-if="row.edit && row.apiKey !== 'lose'"
                        v-model="row.stageStatus"
                        placeholder="所属状态"
                        clearable
                        style="width:120px"
                    >

                        <el-option v-for="(item, index) in statusList" :key="index" :label="item.displayName" :value="item.id"/>
                        <!-- <el-option label="赢单" :value="2" /> -->
                    </el-select>
                    <div  v-else>
                        <span>{{row.displayName}}</span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column
                label="赢率"
                prop="winProbability"
                width="200"
            >
                <template #default="{ row }">
                    <el-input-number step="1" step-strictly :controls="false" v-if="row.edit && row.apiKey !== 'lose'" v-model="winProbability" placeholder="赢率" style="width:160px"/>
                    <span v-else>{{ Number(row.winProbability).toFixed(0) + '%' }}</span>
                </template>
            </el-table-column>
            <el-table-column
                label="操作"
                prop="operate"
            >
                <template
                    #default="{ row, column, $index }"
                >   
                    <template v-if="!row.edit">
                        <el-link type="primary" @click="editRow(row, $index)">编辑</el-link>
                        <el-link v-if="row.deleteConfigFlag !== 0" type="primary" @click="deleteRow(row, $index)">删除</el-link>
                    </template>
                    <template v-else>
                        <el-link type="primary" @click="saveRow(row, $index)">保存</el-link>
                        <el-link type="primary" @click="cancleRow(row, $index)">取消</el-link>
                    </template>
                    
                </template>
            </el-table-column>
        </el-table>
        <div class="addFormStage" v-if="showAddStage">
            <el-form :inline="true" :model="formStage" :rules="formRuls" ref="formStageRef">
                <el-form-item prop="name">
                    <el-input v-model="formStage.name" placeholder="销售阶段名称" maxlength="50" style="width:200px"/>
                </el-form-item>
                <el-form-item>
                    <el-select
                      v-model="formStage.stageStatus"
                      placeholder="状态"
                      clearable
                      style="width:120px"
                    >
                        <el-option  v-for="(item, index) in statusList" :label="item.displayName" :value="item.id" :key="index"/>
                      
                      <!-- <el-option label="进行中" :value="1" />
                      <el-option label="赢单" :value="2" /> -->
                      <!-- <el-option label="输单" :value="3" /> -->
                    </el-select>
                </el-form-item>
                <el-form-item prop="winProbability">
                    <el-input-number step="1" step-strictly :controls="false" v-model="formStage.winProbability" placeholder="赢率" style="width:116px;margin-right: 8px"/>%
                </el-form-item>
                <el-form-item>
                    <el-link type="primary" @click="addStage()">保存</el-link>
                    <el-link type="primary" @click="calcel()">取消</el-link>
                </el-form-item>
            </el-form>
        </div>
        <!-- 删除角色确认 弹框 -->
        <confirmDialog
            v-model:visible="visible_deleteOptions"
            :loading="loading_deleteOptions"
            :title="$t('deleteConfirm')"
            tip-content="阶段删除后无法撤销，确认删除该阶段吗？"
            @confirm="confirm_deleteOptions"
        ></confirmDialog>
    </div>
</template>
<script setup>
import { ref, onMounted, nextTick, watch, inject, computed } from 'vue';
import Sortable from 'sortablejs';
import confirmDialog from '@/components/confirmDialog.vue';
import { saveStage, updateStage, queryList, deleteList, sortList, deleteCheck, getStatusOptionDetail } from '@/api/phaseAdvanceSet'
import { useTableHeight } from '@/hooks/tableHeight.js';
const { tHeight, height } = useTableHeight(280); // 表格高度
import {
    cloneDeep
} from 'lodash';
import { ElMessage } from 'element-plus';

// props 接收
const props = defineProps({
    curActionVal: {
        type: Number
    }
});

const tHeightComputed = computed(() => {
    return tHeight.value;
});
// 接收父组件传, 当前选中的行
const currentSettingRow = inject('currentSettingRow');

const tableData = ref([]); // 表格数据
// const sortableStatus = ref(true); // 排序状态
const optionsSetRef = ref(null); // 表格ref
const optionsSortRef = ref(null); // 表格ref
const loading = ref(false); // 加载状态

const statusList = ref([]);
onMounted(async () => {
    // nextTick(() => {
    //     createSortable();
    // })
    getStatusOptionDetail({
        objectApiKey: 'salesStage',
        apiKey: 'status'
    }).then(res => {
        statusList.value = res.data.filter(v => v.apiKey !== 'lose');
        formStage.value.stageStatus = statusList.value[0]?.id
    })
});

const handelData = (data) => {
    return data?.map((v, i) => ({
        ...v,
        edit: false
    }))
}
//  查询列表接口
const getData = () => {
    
    return queryList({
        // objectId:  currentSettingRow.value.id,
        opportunityTypeId: props.curActionVal
        // objectTypeId: props.curActionVal
    }).then(res => {
        console.log(res)
        if(res.code === 10000) {
            tableData.value = handelData(res.data);
            // optionsSetRef.value.destroy();
            setTimeout(() => {
                createSortable();
            })
        }
    })
}

// 创建排序表格
const createSortable = () => {
    const scroll = optionsSetRef.value.scrollBarRef;
    optionsSortRef.value = Sortable.create(scroll.wrapRef.querySelector('tbody'), {
        animation: 150,
        onEnd: onSortEnd,
        filter: '.filtered'
    });
}

// 列表排序
const onSortEnd = (evt) => {
    const { newIndex, oldIndex } = evt;
    console.log(evt)
    let _tableData = cloneDeep(tableData.value);
    if(newIndex >= tableData.value.length - 1 || tableData.value[oldIndex].apiKey === 'lose') {
        console.log(tableData.value)
        tableData.value = [];
        nextTick(() => {
            tableData.value = _tableData;
        })
        return
    };
    _tableData.splice(newIndex, 0, ..._tableData.splice(oldIndex, 1));
    // sortableStatus.value = false;
    nextTick(() => {
        tableData.value = [];
        sortList({
            idList: _tableData.map(v =>  {
                if(v.apiKey !== 'lose') {
                    return v.id;
                }
            }).splice(0, _tableData.length - 1),
            objectId: currentSettingRow.value.id,
            opportunityTypeId: props.curActionVal
        }).then(res => {
            if(res.code === 10000) {
                getData();
                // tableData.value = _tableData;
            } else {
                ElMessage.error(res.messageShow);
            }
        })
    })
};

const isWinner = ({row, columnIndex}) => {
    if(row.apiKey === 'lose') {
        return 'cloumnCls'
    } else {
        return '';
    }
}
// 删除角色 弹框
let curRow = {};
const deleteRow = (row, index) => {
    deleteCheck({
        id: row.id,
        objectId: currentSettingRow.value.id,
        opportunityTypeId: props.curActionVal,
        stageStatus: row.stageStatus,
        apiKey: row.apiKey
    }).then(res => {
        if(res.code === 10000) {
            curRow = row;
            visible_deleteOptions.value = true;
        } else {
            ElMessage.error(res.messageShow);
        }
    })
   
}
// 弹框显隐
let visible_deleteOptions = ref(false);
// 弹框 loading
let loading_deleteOptions = ref(false);
// 删除 确认
const confirm_deleteOptions = () => {
    visible_deleteOptions.value = false;
    // 显示 loading
    loading_deleteOptions.value = true;
    deleteList({
        id: curRow.id,
        stageStatus: curRow.stageStatus,
        opportunityTypeId: props.curActionVal,
        objectId: currentSettingRow.value.id,
    }).then(res => {
        if(res.code === 10000) {
            // 隐藏弹框
            visible_deleteOptions.value = false;
            // 取消 loading
            loading_deleteOptions.value = false;
            getData();
        } else {
            loading_deleteOptions.value = false;
            ElMessage.error(res.messageShow);
        }
    })
}
// 添加阶段
const showAddStage = ref(false);
const formStage = ref({
    name: '',
    stageStatus: statusList.value[0]?.id,
    winProbability: ''
})
const showAddForm = () => {
    if(tableData.value.length > 50) {
        ElMessage.error('最多添加50个阶段');
        return;
    }
    showAddStage.value = true;
}
const formStageRef = ref();
const formRuls = ref({
    // name: [
    //     { required: true, message: '请填写阶段名称', trigger: 'blur' },
    //     { max: 50, message: '阶段名称最多50个字符', trigger: 'blur' }
    // ],
    // winProbability: [
    //     { required: true, message: '请输入赢率', trigger: 'blur' }
    // ]
})
const addStage = (data) => {
    if(!formStage.value.stageStatus) {
        ElMessage.error('请选择所属状态');
        return;
    }
    if(formStage.value.name.trim() === '') {
        ElMessage.error('请填写阶段名称');
        return;
    }
    if(formStage.value.name.trim().length > 50) {
        ElMessage.error('阶段名称最多50个字符');
        return;
    }
    if(formStage.value.winProbability < 0 || formStage.value.winProbability > 100) {
        ElMessage.error('赢率必须为0-100的整数');
        return;
    }
    formStageRef.value.validate((valid) => {
        if(valid) {
            saveStage({
                name: formStage.value.name,
                objectId: currentSettingRow.value.id,
                opportunityTypeId: props.curActionVal,
                opportunityTypeId: props.curActionVal,
                stageStatus: formStage.value.stageStatus, 
                winProbability:  formStage.value.winProbability
            }).then(async res => {
                if(res.code === 10000) {
                    showAddStage.value = false;
                    formStage.value = {
                        name: '',
                        stageStatus: statusList.value[0].id,
                        winProbability: ''
                    }
                    await getData();
                    let wrapper = optionsSetRef.value.scrollBarRef.wrapRef.querySelector('tbody');
                    optionsSetRef.value.scrollTo(0, wrapper.scrollHeight);
                } else {
                    ElMessage.error(res.messageShow);
                }
            })
        }
    })
}
const calcel = () => {
    showAddStage.value = false;
}

// 编辑阶段
const winProbability = ref('');
const stageName = ref('');
const editRow = (row, index) => {
    winProbability.value = row.winProbability
    stageName.value = row.name;
    row.edit = true;
}
const cancleRow = (row, index) => {
    row.edit = false;
}
const saveRow = (row, index) => {
    if(!row.stageStatus) {
        ElMessage.error('请选择所属状态');
        return;
    }
    if(row.name.trim() === '') {
        ElMessage.error('请填写阶段名称');
        return;
    }
    if(row.name.trim().length > 50) {
        ElMessage.error('阶段名称最多50个字符');
        return;
    }
    updateStage({
        id: row.id,
        name: stageName.value,
        objectId: currentSettingRow.value.id,
        opportunityTypeId: props.curActionVal,
        stageStatus: row.stageStatus, 
        winProbability:  winProbability.value,
        sortNum: row.sortNum,
        apiKey: row.apiKey
    }).then(async res => {
        if(res.code === 10000) {
            await getData();
            showAddStage.value = false;
            row.edit = false;
        } else {
            ElMessage.error(res.messageShow);
        }
    })
}

const rowClass = ({rowData, rowIndex}) => {
    if(rowData?.apiKey === 'lose') {
        return 'filtered'
    }
}
watch(
    () => props.curActionVal,
    async (val) => {
        if (val) {
            // getData();
            await getData();
            showAddStage.value = false;
            setTimeout(() => {
                createSortable();
            }, 1000)
        }
    },
    {
        immediate: true
    }
);
</script>
<style lang="scss" scoped>
.stageSetting {
    ::v-deep .cloumnCls {
        color: #C4C4C4;
    }
    .stageSetting-new {
        padding-right: 24px;
        display: flex;
        justify-content: flex-end;
    }
    .addFormStage {
        margin-top: 7px;
        .#{$elnamespace}-form--inline .#{$elnamespace}-form-item {
            margin-right: 20px;
        }
    }
}

.dragIcon{
    cursor: move;
}
</style>