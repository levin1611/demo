<!-- 标签页组件设置  弹框 -->
<template>
    <el-dialog
        v-model="visible"
        :title="$t('layout.tabCompoSet', { name: props.curTabData.tagName })"
        width="1000px"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :destroy-on-close="true"
        @opened="handleOpen"
        @closed="handleClosed"
        class="tabCompoSet"
    >
        <!-- loading 用的无意义 div -->
        <div ref="dialogBodyRef"></div>

        <!-- 基础组件 -->
        <div class="h-115">
            <customSort
                :config="{ id: 'moduleType', label: 'moduleName', checked: 'checked' }"
                :itemList="compoList"
                :defaultCheck="selectedCompoIds"
                ref="compoCheckRef"
            ></customSort>
        </div>

        <!-- 业务列表 -->

        <!-- footer -->
        <template #footer>
            <div class="dialog-footer">
                <!-- cancel -->
                <el-button
                    @click="visible = false"
                    class="useBrandColor"
                >{{ $t('cancel') }}</el-button>
                <!-- save -->
                <el-button
                    type="primary"
                    @click="submit"
                >{{ $t('save') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, toRef, toRaw, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';
import useElDialogLoading from '@/hooks/useElDialogLoading';
import {customSort} from 'xhl_lib';
import { getLayoutCompoList } from '@/api/layout';

// 定义 model
const visible = defineModel('visible', { type: Boolean, default: false });
// 接受外部传参
const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    // 当前布局的 objectId , 用于请求全部可配置组件
    layoutObjectId: {
        type: String,
        default: ''
    },
    // 所有标签页数据
    allTabs: {
        type: Array,
        default: () => []
    },
    // 当前操作的标签页信息
    curTabData: {
        type: Object,
        default: () => ({})
    }
});
// 定义 emit
const emits = defineEmits([
    'update:loading',
    'save'
]);

const { t } = useI18n();

// 全局变量
// loading
const loading = toRef(props, 'loading');

// 处理 loading 逻辑
// 暂存 dialog DOM
let dialogEl;
// 取 dialog 组件 body ref
const dialogBodyRef = ref(null);

// 弹框打开关闭回调
// 弹框打开前
const handleOpen = () => {
    // 处理 loading 逻辑
    // 如果之前没获取过 dialog DOM, 说明是首次 open
    if (!dialogEl) {
        // 获取 dialog DOM
        ({ dialogEl } = useElDialogLoading(dialogBodyRef, loading));
    }
};
// 弹框关闭后
const handleClosed = () => {
    // 清除数据
    clearData();
};
// 清除数据
const clearData = () => {
    compoList.value = [];
    selectedCompoIds.value = [];
};

// 基础组件/业务对象选择
// 取选择组件 ref
const compoCheckRef = ref(null);
// 所有 基础组件/业务对象 集合, 选择组件用
const compoList = ref([]);
// 所有选中的 基础组件/业务对象 id 集合, 选择组件用, 不包括 disable 状态选中
const selectedCompoIds = ref([]);
// 原始数据 所有 基础组件/业务对象
let allComposData = [];
// 获取所有基础组件/业务对象数据
const getAllCompoList = async () => {
    // loading
    emits('update:loading', true);
    // 清空旧数据
    allComposData = [];
    // 请求数据
    const res = await getLayoutCompoList({
        objectId: props.layoutObjectId
    });
    if (res.code === 10000 && (Array.isArray(res.data))) {
        allComposData = res.data;
    }
    // 处理数据
    handleComposData(cloneDeep(allComposData));
    // 取消 loading
    emits('update:loading', false);
};
// 格式化组件列表和选中数据
const handleComposData = (allComposData) => {
    // 所有已选 组件/业务对象 id
    const tmpSelCompoIds = [];
    // 业务对象数据集合
    const bizObjList = allComposData.find(compo => compo.moduleType === 10)?.objectList || [];
    // 统一业务对象和基础组件的属性名, 方便勾选组件统一处理
    bizObjList.forEach(item => {
        item.moduleType = `obj_${item.fieldId}`;
        item.moduleName = item.listName;
    });
    // 遍历所有 tab , 当前 tab 的 moduleList 的数据默认选中, 其他 tab 的默认 disabled
    props.allTabs.forEach(tab => {
        // 标识遍历项是否是当前编辑的 tab
        const isCurTab = (tab === props.curTabData);
        if (Array.isArray(tab.moduleList)) {
            tab.moduleList.forEach(item => {
                if (item.moduleType === 10) {
                    // 业务对象

                    // 获取当前 tab 下的业务对象对应的标准业务对象数据
                    const objItem = bizObjList.find(i => i.fieldId === (item.fieldId || item.relationFieldId));
                    if (objItem) {
                        // 默认选中
                        objItem.checked = true;
                        if (isCurTab) {
                            // 当前 tab , 默认选中
                            tmpSelCompoIds.push(objItem.moduleType);
                        } else {
                            // 其他 tab , 默认 disabled
                            objItem.disabled = true;
                        }
                    }
                } else {
                    // 基础组件

                    // 获取当前 tab 下的组件对应的标准基础组件数据
                    const compoItem = allComposData.find(compo => compo.moduleType === item.moduleType);
                    if (compoItem) {
                        // 默认选中
                        compoItem.checked = true;
                        if (isCurTab) {
                            // 当前 tab , 默认选中
                            tmpSelCompoIds.push(compoItem.moduleType);
                        } else {
                            // 其他 tab , 默认 disabled
                            compoItem.disabled = true;
                        }
                    }
                }
            });
        }
    });
    // 全部组件处理
    const tmpCompoList = [
        // 组件
        {
            headTitle: t('layout.baseCompo'),
            checkMapLists: allComposData.filter(item => item.moduleType !== 10)
        }
    ];
    if (bizObjList.length > 0) {
        // 业务对象
        tmpCompoList.push({
            headTitle: t('layout.relevantList'),
            checkMapLists: bizObjList
        });
    }
    compoList.value = tmpCompoList;
    // 选中组件处理
    selectedCompoIds.value = tmpSelCompoIds;
};

// footer
// 点击提交按钮
const submit = async () => {
    // 组装待保存数据
    // 待保存数据
    const savingSetData = {
        moduleList: []
    };

    // 取选中组件数据
    // 选中组件 id 暂存
    const selCompoIds = toRaw(compoCheckRef.value?.getCheckData().normalResult || []);
    const selCompoData = [];
    // 暂存业务对象数据集合
    const bizObjList = allComposData.find(compo => compo.moduleType === 10)?.objectList || [];
    // 遍历选中组件 id , 现有组件数据不变
    selCompoIds.forEach(id => {
        if (/^obj_/.test(`${id}`)) {
            // 业务对象

            // 检查当前 tab 下是否已存在该业务对象
            const existObj = props.curTabData.moduleList.find(item => item.moduleType === 10 && `obj_${item.fieldId || item.relationFieldId}` === id);
            // 存在, 则直接使用原业务对象; 否则, 使用请求得到的标准业务对象
            if (existObj) {
                selCompoData.push(toRaw(existObj));
            } else {
                const newObj = bizObjList.find(item => `obj_${item.fieldId}` === id);
                if (newObj) {
                    newObj.moduleType = 10;
                    selCompoData.push(newObj);
                }
            }
        } else {
            // 基础组件

            // 检查当前 tab 下是否已存在该组件
            const existCompo = props.curTabData.moduleList.find(item => `${item.moduleType}` === `${id}`);
            // 存在, 则直接使用原组件; 否则, 使用请求得到的标准组件
            if (existCompo) {
                selCompoData.push(toRaw(existCompo));
            } else {
                const newCompo = allComposData.find(item => `${item.moduleType}` === `${id}`);
                if (newCompo) {
                    selCompoData.push(newCompo);
                }
            }
        }
    });
    // 赋值选中组件数据
    savingSetData.moduleList = selCompoData;

    // 传给父组件保存
    emits('save', savingSetData);
};

// open 回调不触发, opened 回调里处理数据会导致页面闪烁, 因此监听 visible: true 来处理数据
watch(
    () => visible.value,
    (val) => {
        if (val) {
            // 组件数据处理
            getAllCompoList();
        }
    },
    {
        immediate: true
    }
);
</script>

<style lang="scss" scoped>
.tabCompoSet {
}
</style>
