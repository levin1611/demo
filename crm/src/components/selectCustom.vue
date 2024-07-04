<template>
    <el-dialog
        v-model="dialogVisible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        top="10vh"
        width="1000"
        class="select-custom-dialog"
    >
        <template #header>
            <div class="select-custom-title">
                <span>{{ $t('clue.' + titleMap[props.objectApiKey]) }}</span>
            </div>
        </template>
        <!-- body -->
        <template #default>
            <div style="background:#fff;overflow: hidden;padding-left: 20px;">
                <customfilter
                    v-if="dialogVisible"
                    ref="customfilterRef"
                    :paramList="paramList"
                    @toggleEl="toggleEl"
                    @valueChange="valueChange"
                    :outerZIndex="currentZIndex"
                />
            </div>
            <el-table
                v-loading="tableLoading"
                :data="tableData"
                :tooltip-options="{ showAfter: 500 }"
                @sort-change="sortMethod"
                style="height: calc(100% - 50px);"
                class="select-custom-table showOverflowTooltip"
                height="450"
            >
                <!-- radio -->
                <el-table-column width="40px">
                    <template #default="scope">
                        <el-radio v-model="tableRadio" :value="scope.row.id" @change="clickRadio(scope.row)">&nbsp;</el-radio>
                    </template>
                </el-table-column>
                <el-table-column
                    v-for="(column, columnIndex) in columns"
                    :key="column.prop"
                    :prop="column.prop"
                    :label="$t(column.label)"
                    :min-width="column.width"
                    :sortable="dataTypeMap[column.dataType] ? 'custom' : false"
                >
                    <template #default="{row, $index}">
                        <!-- :style="column.apiKey === 'name' ? 'color: #303133!important;' : ''" -->
                       <template v-if="column.dataType === 9">
                            <span v-if="row[column.apiKey]" 
                                :ref="el => currentBtnRefs['refs' + '_' + $index + '_' + columnIndex] = el" 
                                class="linkUrl" 
                                @mousemove="handleClickCurrentBtn($index, row, column, columnIndex)" 
                                @click.stop="stopEvent" 
                                @mouseleave="hideCurrentPopoverFun($index, row, column, columnIndex)">
                                {{ row[column.apiKey] }}
                            </span>
                            <span v-else>-</span>
                        </template> 
                        <template v-else>
                            <displayField
                                :fieldSet="column"
                                :fieldVal="row"
                                :showTooltip="true"
                                :outerZIndex="currentZIndex"
                                @fieldClick="handleFieldClick"
                            />
                        </template>
                        
                        
                    </template>
                </el-table-column>
            </el-table>
        </template>

        <!-- footer -->
        <template #footer>
            <div class="dialog-footer">
                <pagenation
                    ref="pageNationRef"
                    @updateData="updateData"
                    @changeBefore="beforeChangePage"
                    :parameter="api_config"
                    :layout="'total, jumper, sizes, prev, pager, next'"
                    :outerZIndex="currentZIndex"
                />
                <div style="display: flex;">
                    <el-button
                        @click="dialogVisible=false"
                        class="useBrandColor"
                    >{{ $t('cancel') }}</el-button>
                    <el-button
                        type="primary"
                        @click="confirm"
                    >{{ $t('confirm') }}</el-button>
                </div>
            </div>
        </template>
    </el-dialog>
</template>
<script setup>
import { ref, watch, toRefs, nextTick, computed, inject } from 'vue';
import { relFieldQueryBizDataList, getRelDataQueryBizDataList, queryObjTypeList } from '@/api/clue';
import { queryOptionByFieldIds, getNewusers } from '@/api/common.js';
import { dataTypeMap } from '@/utils/filterConfig'; // 筛选类型配置
import { CODESTATE } from '@/https/codeConfig';
import { customfilter, pagenation, displayField } from 'xhl_lib';
import { useZIndex } from 'element-plus';
// 获取全局 scss 变量, 以获取 element-plus 的命名空间
import { useUserStore } from '@/pinia/modules/user.js';
import { useI18n } from 'vue-i18n';
import CSSVariables from '@/style/js.module.scss';
import { useDepartmentTree } from '@/pinia/modules/departmentTree.js'; // 引入部门树相关的数据
import { getDepartmentDataTree } from '@/api/department.js';

const treeDataStore = useDepartmentTree();
const SourceWidthOutMembers = computed(() => treeDataStore.SourceWidthOutMembers); // 没有部门成员的树数据
const SourceWidthMembers = computed(() => treeDataStore.SourceWidthMembers); // 有部门成员的树数据
// 多语言
const { t } = useI18n();
// 取 pinia 数据
const store = useUserStore();
const { elnamespace } = CSSVariables;
const { currentZIndex } = useZIndex();
const props = defineProps({
    objectId: Number,
    fieldId: Number,
    objectApiKey: String,
    objectTypeId: Number, // 线索转化时用到查询关联列表
    customerInfoId: [Number, String], // 转化时只搜索当前线索的关联数据
    operation: String, // 表示：新建，编辑，转化
    dataId: Number // 当前编辑的数据 id
});

const emits = defineEmits(['selectData']); 

// radio
const tableRadio = ref(null);
// customerName
const customerName = ref('');
const customfilterRef = ref(null);
// 选中方法
const clickRadio = (row) => {
    tableRadio.value = row.id;
    customerName.value = row.name;
};

const { fieldId, objectId, objectTypeId, customerInfoId, operation, dataId } = toRefs(props);

const dialogVisible = defineModel('dialogVisible');

// 要渲染的筛选数组
const paramList = ref({});

const titleMap = {
    'lead': 'selectClue',
    'customer': 'selectCustomer',
    'staff': 'staff',
    'contact': 'selectContact',
    'touchPointContact': 'selectTouchPoint',
    'marketingCampaign': 'marketingCampaign',
    'opportunity': 'selectBusiness',
    'followUpObject': 'selectFollowUpObject'
};
const tableData = ref([]);
const columns = ref([]);

// 自定义排序
const sortMethod = ({ order, prop }) => {
    Object.assign(listQueryParams.value, {
        sort: {
            fieldId: prop,
            type: order === 'ascending' ? 0 : order === 'descending' ? 1 : -1
        }
    });

    pageNationRef.value.handleCurrentChange(1);
};

const listQueryParams = ref({
    page: true
});
const api_config = ref({
    methods: ['convert', 'followUpRecord'].includes(operation?.value) ? getRelDataQueryBizDataList : relFieldQueryBizDataList,
    data: listQueryParams.value
});

// 处理表格数据
const handleItem = (item) => {
    const newObj = {};
    for (let key in item) {
        if (key.endsWith('_value')) {
            newObj[key] = item[key];
        } else {
            const newKey = `${key}_value`;
            if (!newObj.hasOwnProperty(newKey)) {
                newObj[newKey] = item[key];
            }
        }
    }
    return {
        ...item,
        id: item.auto_column_id || '',
        duplicateFlag: item.auto_column_duplicate_flag || '',
        objectId: item.auto_column_object_id || '',
        objectTypeId: item.auto_column_object_type_id || '',
        orgId: item.auto_column_org_id || '',
        ...newObj
    };
};
const handleData = (data) => {
    return data.map(handleItem);
};
// 处理表格数据
const handleFilterSelectData = (data) => {
    return data.map((item) => {
        return {
            id: item.auto_column_id || item.id,
            displayName: item.name || item.cnName || item.enName
        };
    });
};

// 获取字段及数据
const updateParamList = (item, additionalProps) => {
    if (dataTypeMap[item.dataType]) {
        paramList.value[item.apiKey] = {
            ...item,
            ...paramList.value[item.apiKey],
            ...additionalProps
        };
    }
};
const createParam = (item, options) => {
    return {
        Value: null,
        type: dataTypeMap[item.dataType],
        placeholder: `${t('clue.pleaseEnter')}${ item.name}`,
        apiKey: item.apiKey,
        dataType: item.dataType,
        name: item.label,
        id: item.id,
        ...options
    };
};
const handleFilters = () => {
    // 添加筛选条件、设置框的所有字段
    columns.value.forEach(item => {
        let options = {};
        if (!['name', 'ownerId', 'createdTime', 'createdUser'].includes(item.apiKey)) {
            if (item.apiKey === 'dimDepart') {
                options = {
                    type: 'tree',
                    renderTree: SourceWidthOutMembers.value,
                    filterType: 'select'
                };
            } else {
                options = {
                    placeholder: item.name,
                    splaceholder: `${t('clue.pleaseChoose')}${item.name}`,
                    eplaceholder: `${t('clue.pleaseChoose')}${item.name}`,
                    OptionName: 'displayName'
                };
            }
        } else {
            if (['ownerId', 'createdUser'].includes(item.apiKey)) {
                options = {
                    type: 'tree',
                    name: item.name,
                    placeholder: `${t('clue.pleaseChoose')}${item.name}`,
                    renderTree: SourceWidthMembers.value,
                    filterType: 'select',
                    onlyUser: 'onlyUser'
                };
            } else {
                options = {
                    notRemovable: item.apiKey === 'name'
                };
            }
        }
        updateParamList(item, createParam(item, options));
    });

    nextTick(() => {
        customfilterRef.value.setNotRemovable();
    });
};
const tableLoading = ref(false);
const updateData = (data, res) => {
    tableData.value = handleData(data);
    tableLoading.value = false;
    // 处理表头
    if (!columns.value?.length) {
        columns.value = handleFilterFields(res.selectedList);
        // 处理顶部筛选器
        handleFilters();
    }
};
const beforeChangePage = () => {
    // 如果是编辑（比如线索）时
    if (operation?.value === 'edit') {
        Object.assign(listQueryParams.value, {
            excludeDataId: operation?.value === 'edit' ? dataId?.value : undefined // 编辑时排除当前数据
        });
    }
    // 如果是线索转化、跟进记录
    if (['convert', 'followUpRecord'].includes(operation?.value)) {
        Object.assign(listQueryParams.value, {
            // 只有联系人及商机才需要该参数
            customerInfoId: customerInfoId?.value || undefined, // 转化时只搜索当前线索的关联数据
            objectId: objectId.value || undefined,
            objectTypeId: objectTypeId?.value || undefined
        });
    }

    Object.assign(listQueryParams.value, {
        fieldId: fieldId?.value
    });

    tableLoading.value = true;
};

// 筛选
const toggleEl = async (menu) => {
    // 如果是布尔类型
    let seleteOptionsRes = [];
    let res = {};
    if (['contact', 'infoUpdatedUser', 'updatedUser', 'convertUser', 'formerManager'].includes(paramList.value[menu].apiKey)) {
        res = await getNewusers({
            userId: store.userId,
            orgId: store.orgId
        });
        if (res.code === CODESTATE.SUCCESS) {
            seleteOptionsRes = handleFilterSelectData(res.data.list || res.data);
        } else {
            ElMessage.error(res.messageShow);
        }
    } else if (['createdUser'].includes(paramList.value[menu].apiKey)) {
        res = await getDepartmentDataTree({
            userId: store.userId,
            orgId: store.orgId
        });
        if (res.code === CODESTATE.SUCCESS) {
            seleteOptionsRes = handleFilterSelectData(res.data.list || res.data);
        } else {
            ElMessage.error(res.messageShow);
        }
    } else {
        switch (paramList.value[menu].dataType) {
            case 10:
            case 20:
                seleteOptionsRes = [{
                    id: 0,
                    displayName: '否'
                }, {
                    id: 1,
                    displayName: '是'
                }];
                break;
            case 28:
            case 29:
                if (['dimDepart', 'ownerId'].includes(paramList.value[menu].apiKey)) return;
                // 如果是线索类型字段，需要调另外一个接口
                if (paramList.value[menu].apiKey === 'objectType') {
                    res = await queryObjTypeList({
                        objectId: objectId.value
                    });
                } else {
                    if (['convert', 'followUpRecord'].includes(operation?.value)) {
                        res = await getRelDataQueryBizDataList({
                            fieldId: paramList.value[menu].id
                        });
                    } else {
                        res = await relFieldQueryBizDataList({
                            fieldId: paramList.value[menu].id
                        });
                    }
                }
                if (res.code === CODESTATE.SUCCESS) {
                    seleteOptionsRes = handleFilterSelectData(res.data.list || res.data);
                } else {
                    ElMessage.error(res.messageShow);
                }
                break;
            default:
                if (paramList.value[menu].type === 'select') {
                    res = await queryOptionByFieldIds({
                        objectId: objectId.value,
                        fieldIds: [paramList.value[menu].id]
                    });
                    if (res.code === CODESTATE.SUCCESS) {
                        seleteOptionsRes = res.data;
                    } else {
                        ElMessage.error(res.messageShow);
                    }
                }
                
                break;
        }
    }
    paramList.value[menu].options = [...seleteOptionsRes || [], ...[{id: 'nullCond', displayName: '空（未填写）'}]];
};
// 筛选器触发的方法
const valueChange = (data) => {
    tableLoading.value = true;

    let _obj = [];
    Object.keys(data).forEach(key => {
        if ((data[key].Value && !Array.isArray(data[key].Value)) || (Array.isArray(data[key].Value) && data[key].Value.length > 0)) {
            _obj.push({
                apiKey: data[key].apiKey, 
                fieldId: data[key].id, 
                values: Array.isArray(data[key].Value) ? data[key].Value.reduce((pre, cur, index) => {
                    if (cur !== 'nullCond') {
                        pre.push(cur);
                    }
                    return pre;
                }, []) : [data[key].Value],
                displayName: data[key].name,
                nullCond: data[key].type === 'select' && Boolean(data[key].Value.find(v => v === 'nullCond'))
            });
        }
    });
    listQueryParams.value.conditions = _obj;
    pageNationRef.value.handleCurrentChange(1);
};

const confirm = () => {
    if (tableRadio.value) {
        dialogVisible.value = false;
        emits('selectData', customerName.value, tableRadio.value);
    } else {
        ElMessage.warning('请选择一条数据');
    }
};

// 处理表头筛选字段
const handleFilterFields = data => {
    return data.map(item => {
        return {
            ...item,
            label: item.name,
            prop: item.id,
            width: '120'
        };
    });
};

const initData = () => {
    tableLoading.value = false;
    tableRadio.value = null;
    tableData.value = [];
    columns.value = [];
    paramList.value = {};
    listQueryParams.value = {
        page: true
    };
    api_config.value = {
        methods: ['convert', 'followUpRecord'].includes(operation?.value) ? getRelDataQueryBizDataList : relFieldQueryBizDataList,
        data: listQueryParams.value
    };
};

// 点击列表项，执行对应交互，比如显示文件，显示多币种等，处理方法再最上层组件中，，通过eventBus触发显示
const bus = inject('$bus')

// 文件字段点击
const handleFieldClick = (item) => {
    console.log('123', item)
    bus.emit('displayFieldClickEventBus', item)
}
// { fieldSet: field, fieldVal: rowData, fieldRef }
const currentBtnRefs = ref([]);
// 货币字段点击
const handleClickCurrentBtn = ($index, row, column, columnIndex) => {
    bus.emit('displayFieldClickEventBus', {
        fieldSet: column,
        fieldVal: row,
        fieldRef: currentBtnRefs.value['refs' + '_' + $index + '_' + columnIndex]
    })
}
const stopEvent = () => {}
const hideCurrentPopoverFun = ($index, row, column, columnIndex) => {
    bus.emit('displayFieldClickHideEventBus', {
        fieldSet: column,
        fieldVal: row,
        fieldRef: currentBtnRefs.value['refs' + '_' + $index + '_' + columnIndex]
    });
}

const pageNationRef = ref(null); // 分页组件实例
watch(dialogVisible, (val) => {
    if (val) {
        nextTick(() => {
            pageNationRef.value.handleCurrentChange(1);
        });
    } else {
        initData();
    }
});
</script>
<style lang="scss" scoped>
.select-custom-dialog {
    height: 660px;
    .select-custom-title {
        color: #303033;
        font-size: 16px;
        font-weight: 500;
        line-height: 24px;
    }
}
.dialog-footer {
    display: flex;
    justify-content: flex-end;
    :deep(.page_right) {
        margin-top: 0;
        justify-content: flex-start;
    }
}
</style>
<style lang="scss">
.select-custom-dialog {
    .#{$elnamespace}-dialog__header {
        padding-bottom: 6px;
    }
}
.select-custom-table {
    .#{$elnamespace}-table__cell {
        padding: 5.5px 0;
    }
    .#{$elnamespace}-table__cell .cell {
        white-space: nowrap;
    }
    .linkText {
        color: #303133;
    }
}
</style>