<!-- 选项值设置 dialog -->
<template>
    <el-dialog
        v-model="visible"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        width="1000"
        class="option-value-modal-dialog"
    >
        <template #title>
            <div class="option-value-modal-title">{{ $t('bizObject.optionValueSettings') }}</div>
        </template>
        <!-- body -->
        <template #default>
            <el-row class="option-value-container" v-loading="dataLoading">
                <el-col :span="18" class="container-left">
                    <div class="top-title">
                        <span>{{ $t('bizObject.optionValue') }}</span>
                        <el-input
                            v-model="searchInput"
                            :placeholder="$t('bizObject.pleaseEnterKeyword')"
                            clearable
                            :suffix-icon="Search"
                            class="search-input"
                        />
                    </div>
                    <div>
                        <el-checkbox
                            v-model="checkAll"
                            :indeterminate="isIndeterminate"
                            @change="handleCheckAll"
                        >
                            {{ $t('bizObject.selectAll') }}
                        </el-checkbox
                        >
                        <el-checkbox-group
                            v-model="checkedList"
                            @change="handleCheckedOptionsListChange"
                        >
                            <el-checkbox
                                v-for="item in optionsValueList"
                                :key="item.id"
                                :label="item.id"
                                v-show="searchInput ? item.displayName.includes(searchInput) : true"
                            >
                                <template v-if="item.displayName.replace(/[^\x00-\xff]/gi, '--').length > 16">
                                    <el-tooltip :content="item.displayName" placement="bottom" :show-after="500" :hide-after="0">
                                        <div class="option-value-name">{{ item.displayName }}</div>
                                    </el-tooltip>
                                </template>
                                <template v-else>
                                    <div class="option-value-name">{{ item.displayName }}</div>
                                </template>
                            </el-checkbox>
                        </el-checkbox-group>
                    </div>
                </el-col>
                <el-col :span="6" class="container-right">
                    <div srot-title>{{ $t('bizObject.selected') }}</div>
                    <div class="sort-container">
                        <div class="sort-item" v-for="item in optionsValueSortList" :key="item.id">
                            <span class="custom custom-yidong"></span>
                            <span class="item-name">{{ item.displayName }}</span>
                            <span v-if="!multiple ? defaultOption!==item.id : !defaultOption.includes(item.id)" @click="handledDelete(item.id)" class="custom custom-trash1"></span>
                        </div>
                    </div>
                </el-col>
            </el-row>
            <div class="default-container">
                <span class="default-tip">{{ $t('bizObject.defaultValue') }}</span>
                <el-select
                    v-model="defaultOption"
                    placeholder="Select"
                    size="large"
                    style="width: 240px"
                    :multiple="multiple"
                    clearable
                >
                    <el-option
                        v-for="item in optionsValueSortList"
                        :key="item.id"
                        :label="item.displayName"
                        :value="item.id"
                    />
                </el-select>
            </div>
        </template>

        <!-- footer -->
        <template #footer>
            <div class="dialog-footer">
                <el-button
                    @click="visible=false"
                    class="useBrandColor"
                >{{ $t('cancel') }}</el-button>
                <el-button
                    type="primary"
                    :loading="confirmLoading"
                    @click="confirm"
                >{{ $t('save') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { cloneDeep } from 'lodash';
import { getObjTypeOptionField, saveObjTypeOptionFieldInfo } from '@/api/businessObjects';
import { CODESTATE } from '@/https/codeConfig';
import Sortable from 'sortablejs';
import { useI18n } from 'vue-i18n';
// 获取全局 scss 变量, 以获取 element-plus 的命名空间
import CSSVariables from '@/style/js.module.scss';
// 多语言
const { t } = useI18n();
const { elnamespace } = CSSVariables;

const emits = defineEmits(['confirm']);

// 备份所有选项值
const optionsValueListBackup = ref([]);

// 搜索
const searchInput = ref('');
const handleSearch = (e) => {
    // optionsValueList.value = optionsValueListBackup.value.filter(item => item.displayName.includes(e));
};

// 全选
const checkAll = ref(false);
// 半选状态
const isIndeterminate = ref(false);
// 选择的选项值
const checkedList = ref([]);
// 全选
const handleCheckAll = (val) => {
    const processItems = (items, isChecked) => {
        return items.filter(item => {
            if (item.displayName.includes(searchInput.value)) {
                item.checked = isChecked;
            }
            return item.displayName.includes(searchInput.value);
        }).map(item => item.id);
    };

    if (!val) {
        if (searchInput.value) {
            const list = processItems(optionsValueList.value, false);
            checkedList.value = checkedList.value.filter(item => !list.includes(item));
        } else {
            checkedList.value = [];
        }
    } else {
        if (searchInput.value) {
            const list = processItems(optionsValueList.value, true);
            checkedList.value = checkedList.value.concat(list);
        } else {
            checkedList.value = optionsValueList.value.map(item => {
                item.checked = true;
                return item.id;
            });
        }
    }

    isIndeterminate.value = false;
    // 右侧排序的选项值
    checkedList.value.forEach(checkedId => {
        const item = optionsValueListBackup.value.find(item => item.id === checkedId);
        if (item && !optionsValueSortList.value.some(existingItem => existingItem.id === item.id)) {
            optionsValueSortList.value.push(item);
        }
    });

    if (!val) {
        const uncheckedItems = optionsValueListBackup.value.filter(item => !checkedList.value.includes(item.id));
        uncheckedItems.forEach(item => {
            const index = optionsValueSortList.value.findIndex(existingItem => existingItem.id === item.id);
            if (index !== -1) {
                optionsValueSortList.value.splice(index, 1);
            }
        });
    }

    clearDefaultOption();
};
const handleCheckedOptionsListChange = (value) => {
    const sortBacked = cloneDeep(optionsValueListBackup.value);
    const checkedCount = value.length;
    checkAll.value = checkedCount === optionsValueList.value.length;
    isIndeterminate.value = checkedCount > 0 && checkedCount < optionsValueList.value.length;
    // 去除 value 中id 与optionsValueSortList的 id 重复的情况
    const array2 = optionsValueSortList.value.map(item => item.id);

    const difference = value.filter(x => !array2.includes(x));

    // 右侧排序的选项值
    difference.forEach(checkedId => {
        const item = optionsValueListBackup.value.find(item => item.id === checkedId);
        if (item) {
            optionsValueSortList.value.push(item);
        }
    });

    const uncheckedItems = array2.filter(id => !value.includes(id));
    uncheckedItems.forEach(uncheckedId => {
        const index = optionsValueSortList.value.findIndex(item => item.id === uncheckedId);
        if (index !== -1) {
            optionsValueSortList.value.splice(index, 1);
        }
    });

    clearDefaultOption();
};

// 接受外部传参
const visible = defineModel('visible');

// loading
const confirmLoading = ref(false);

// 底部默认值 select
const defaultOption = ref('');
// 当前是多选还是单选
const multiple = ref(false);

// 右侧排序的选项值
const optionsValueSortList = ref([]);
// 清空默认的 select
const clearDefaultOption = () => {
    if (!multiple.value) {
        if (defaultOption.value && !checkedList.value.includes(defaultOption.value)) {
            defaultOption.value = '';
        }
    } else {
        defaultOption.value = defaultOption.value.filter(item => checkedList.value.includes(item));
    }
};
// 右侧排序删除方法
const handledDelete = (id) => {
    optionsValueSortList.value = optionsValueSortList.value.filter(item => item.id !== id);
    checkedList.value = optionsValueSortList.value.map(item => item.id);
    clearDefaultOption();
};
// 设置拖拽
const sortableRef = ref(null);
const setSortable = () => {
    if (sortableRef.value) {
        sortableRef.value.destroy();
    }
    const sortableContainer = document.querySelector('.container-right .sort-container');
    sortableRef.value = Sortable.create(sortableContainer, {
        // handle: '.handle-drag', // 指定拖拽的元素才能拖动父元素
        // filter: '.disabled-drag', // 指定不可拖动的元素
        animation: 120,
        onEnd: onSortEnd
    });
   
};
const onSortEnd = ({ newIndex, oldIndex }) => {
    if (newIndex === oldIndex) return;

    // 拖拽后重新排序
    const newData = [...optionsValueSortList.value];
    const currRow = newData.splice(oldIndex, 1)[0];
    newData.splice(newIndex, 0, currRow);
    optionsValueSortList.value = [];
    nextTick(() => {
        optionsValueSortList.value = newData;
    });
};

// 加个loading 效果
const dataLoading = ref(false);
// 处理数据
const handleData = (data) => {
    checkedList.value = []; // 清空左侧选中的选项值

    data.forEach(({id, defaultFlag, enableFlag}) => {
        if (defaultFlag === 1) {
            if (multiple.value) {
                defaultOption.value.push(id); // 默认选项值
            } else {
                defaultOption.value = id; // 默认选项值
            }
            isIndeterminate.value = true; // 全选的半选状态
        }
        if (enableFlag === 1) {
            checkedList.value.push(id);
        }
    });

    return data.map(item => {
        item.checked = item.enableFlag === 1;
        return item;
    });
};
// 选项值相关
const optionsValueList = ref([]);
const currentOptionValue = defineModel('currentOptionValue');
// 获取选项值列表
const getTypeOptionList = (row) => {
    dataLoading.value = true;
    getObjTypeOptionField({
        id: currentOptionValue.value.id,
        commonOptionId: currentOptionValue.value.commonOptionId
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            const { defaultOptions, usedOptions } = res.data;
            // 左侧选项值
            optionsValueList.value = handleData(defaultOptions);
            const checkedCount = checkedList.value.length;
            checkAll.value = checkedCount === optionsValueList.value.length;
            isIndeterminate.value = checkedCount > 0 && checkedCount < optionsValueList.value.length;
            // 克隆一份数据, 方便前端进行搜索
            optionsValueListBackup.value = cloneDeep(defaultOptions);
            // 右侧排序的选项值
            optionsValueSortList.value = usedOptions.filter(item => item.enableFlag === 1);
        } else {
            ElMessage.error(res.messageShow);
        }
        dataLoading.value = false;
    }).catch(err => {
        console.error(err);
        ElMessage.error(err.messageShow);
        dataLoading.value = false;
    });
};

// 保存
const confirm = () => {
    confirmLoading.value = true;
    const ensureArray = value => Array.isArray(value) ? value : value ? [value] : [];
    const data = {
        id: currentOptionValue.value.id,
        usedOptions: optionsValueSortList.value.map(item => item.id),
        defaultOption: ensureArray(defaultOption.value)
    };

    saveObjTypeOptionFieldInfo(data).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            ElMessage.success(t('saveSuccess'));
            visible.value = false;
            // 触发 confirm 事件
            emits('confirm');
        } else {
            ElMessage.error(res.messageShow);
        }
    }).catch(err => {
        console.error(err);
        ElMessage.error(err.messageShow);
    }).finally(() => {
        confirmLoading.value = false;
    });
};
const initData = () => {
    optionsValueList.value = [];
    checkedList.value = [];
    optionsValueSortList.value = [];
    defaultOption.value = '';
    searchInput.value = '';
    checkAll.value = false;
    isIndeterminate.value = false;
};
watch(visible, (val) => {
    if (val) {
        nextTick(() => {
            // 25 单选 26 多选
            multiple.value = currentOptionValue.value.dataType === 26;
            defaultOption.value = multiple.value ? [] : '';
            setSortable();
            getTypeOptionList();
        });
    } else {
        initData();
    }
});
</script>

<style lang="scss" scoped>
.option-value-modal-dialog {
    .option-value-modal-title {
        font-size: 16px;
        font-weight: 500;
    }
    .option-value-container {
        border-top: 1px solid #E4E7ED;
        border-bottom: 1px solid #E4E7ED;
        margin-bottom: 12px;
        .#{$elnamespace}-checkbox-group {
            display: grid;
            grid-template-columns: repeat(4, 25%);
            grid-template-rows: repeat(auto-fill, 30px);
            max-height: 370px;
            overflow-y: auto;
        }
    }
    .container-left {
        border-right: 1px solid #E4E7ED;
        .top-title {
            display: flex;
            justify-content: space-between;
            padding: 12px 12px 12px 0;
            margin-bottom: 4px;
            & > span {
                font-size: 14px;
                font-weight: 500;
                color: #303033;
            }
            .#{$elnamespace}-input {
                width: 240px;
                height: 32px;
            }
        }
        .option-value-name {
            line-height: 16px;
            width: 140px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: normal;
        }
    }
    .container-right {
        padding: 20px 24px 24px 12px;
        .srot-title {
            font-size: 12px;
            color: #606266;
            margin-bottom: 12px;
            line-height: 18px;
        }
        .sort-container {
            max-height: 420px;
            overflow-x: auto;
            .sort-item {
                display: flex;
                align-items: center;
                height: 30px;
                padding: 0px 6px;
                cursor: move;
                .item-name {
                    display: inline-block;
                    width: 140px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    color: #303033;
                }
                &:hover {
                    background-color: #F5F7FA;
                }
                span:nth-child(1) {
                    margin-right: 8px;
                }
                span:nth-child(3) {
                    margin-left: auto;
                }
                .custom-trash1 {
                    cursor: pointer;
                    font-size: 16px;
                }
            }
        }
    }
    .default-container {
        .default-tip {
            font-size: 14px;
            font-weight: 500;
            color: #303033;
            margin-right: 30px;
        }
    }
    .search-input {
        width: 240px;
        // margin-bottom: 16px;
    }
}
</style>