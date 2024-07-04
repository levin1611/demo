<!-- 配置标签-详细资料 dialog -->
<template>
    <el-dialog
        v-model="dialogVisible"
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
            <customSort></customSort>
        </template>

        <!-- footer -->
        <template #footer>
            <div class="dialog-footer">
                <!-- cancel -->
                <el-button
                    @click="closeDialog"
                    class="useBrandColor"
                >{{ $t('cancel') }}</el-button>
                <!-- save -->
                <el-button
                    type="primary"
                    :loading="confirmLoading"
                    @click="save"
                >{{ confirmBtnText || $t('save') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, toRefs, nextTick, watch } from 'vue';
import {customSort} from 'xhl_lib';

import { Search } from '@element-plus/icons-vue';
import useDialogCommon from '@/hooks/useDialogCommon';
import useElDialogLoading from '@/hooks/useElDialogLoading';
import { getAllFields, updateAvailableField } from '@/api/businessObjects.js';
import { CODESTATE } from '@/https/codeConfig';
import Sortable from 'sortablejs';
// 获取全局 scss 变量, 以获取 element-plus 的命名空间
import CSSVariables from '@/style/js.module.scss';
const { elnamespace } = CSSVariables;

const input = ref('');
// 搜索
const handleSearch = (e) => {
    console.error('handleSearch', e);
    if (e) {
        selectList.value = selectList.value.filter(item => item.label.includes(e));
    } else {
        geFieldstList();
    }
};

const checkAll = ref(false);
const isIndeterminate = ref(true);
const checkedCities = ref(['Shanghai', 'Beijing']);
// const cities = ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen'];
let cities = ['Shanghai', 'Beijing', 'Guangzhou', 'Shenzhen'];
cities = Array.from({ length: 100 }, () => cities[Math.floor(Math.random() * cities.length)]);

const handleCheckAllChange = (val) => {
    checkedCities.value = val ? cities : [];
    isIndeterminate.value = false;
};
const handleCheckedCitiesChange = (value) => {
    const checkedCount = value.length;
    checkAll.value = checkedCount === cities.length;
    isIndeterminate.value = checkedCount > 0 && checkedCount < cities.length;
};

// 接受外部传参
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    currentBizObjTypeRow: {
        type: Object,
        default: () => ({})
    }
});
// 定义 emit
const emits = defineEmits(['update:visible', 'save', 'cancel']);
// 取通用的 dialog 逻辑相关参数
const {
    dialogVisible,
    closeDialog
} = useDialogCommon(props, emits);
// 解构 props
const { currentBizObjTypeRow } = toRefs(props);

// loading
const confirmLoading = ref(false);

// // 处理 loading 逻辑
// // 暂存 dialog DOM
// let dialogEl;
// // 取 dialog 组件 body ref
// const dialogBodyRef = ref(null);
// // 弹框打开回调
// const handleOpen = () => {
//     // 如果之前没获取过 dialog DOM, 说明是首次 open
//     if (!dialogEl) {
//         // 获取 dialog DOM
//         ({ dialogEl } = useElDialogLoading(dialogBodyRef, confirmLoading));
//     }
// };

// 底部默认值 select
const value = ref('');
const options = [
    {
        value: 'Option1',
        label: 'Option1'
    },
    {
        value: 'Option2',
        label: 'Option2'
    },
    {
        value: 'Option3',
        label: 'Option3'
    },
    {
        value: 'Option4',
        label: 'Option4'
    },
    {
        value: 'Option5',
        label: 'Option5'
    }
];

// 右侧排序列表数据
const sortList = ref([
    {
        id: 0,
        name: '最多显示 10 个字符'
    },
    {
        id: 1,
        name: '最多显示 11 个字符'
    },
    {
        id: 2,
        name: '最多显示 12 个字符'
    },
    {
        id: 3,
        name: '最多显示 13 个字符'
    },
    {
        id: 4,
        name: '最多显示 14 个字符'
    },
    {
        id: 5,
        name: '最多显示 15 个字符'
    },
    {
        id: 6,
        name: '最多显示 16 个字符'
    },
    {
        id: 7,
        name: '最多显示 17 个字符'
    },
    {
        id: 8,
        name: '最多显示 18 个字符'
    }
]);
// 右侧排序等方法
const handledDelete = () => {
    console.error('handledDelete');
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
const onSortEnd = (evt) => {
    const oldIndex = evt.oldIndex;
    const newIndex = evt.newIndex;

    if (newIndex === oldIndex) return;

    // 拖拽后重新排序
    const newData = [...sortList.value];
    const currRow = newData.splice(oldIndex, 1)[0];
    newData.splice(newIndex, 0, currRow);
    sortList.value = newData;
    console.error('onSortEnd', evt, sortList.value);
};
watch(dialogVisible, (val) => {
    if (val) {
        nextTick(() => {
            // setSortable();
        });
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
    }
    .container-right {
        padding: 24px 24px 24px 12px;
        .srot-title {
            font-size: 12px;
            color: #606266;
            margin-bottom: 12px;
            line-height: 18px;
        }
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