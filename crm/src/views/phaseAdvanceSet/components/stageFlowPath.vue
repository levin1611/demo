<!-- 阶段流程 -->
<template>
    <div
        v-loading="loading"
        class="stageFlowPath"
    >
        <stageFlowItem
            v-for="(item, index) in flowList"
            :key="item.id"
            v-model:itemData="flowList[index]"
            :itemIndex="index"
            :sortEndFuc="sortEndFuc"
            @addKeyEvt="handleAddKeyEvt(item)"
            @editKeyEvt="handleAddKeyEvt(item, $event)"
            @delKeyEvt="handleDelKeyEvt(item, $event)"
            @sortKeyEvt="handleStartSortKeyEvt(item)"
            @clickKeyInfo="handleClickKeyInfo(item, $event)"
            @updateKeyInfo="handleUpdateKeyInfo(item, $event)"
        ></stageFlowItem>
    </div>

    <!-- 新增编辑关键事件 -->
    <addKeyEvt
        v-model:dialogVisible="visible_addKeyEvt"
        :flowData="curFlowData"
        :evtData="curKeyEvtData"
        @saveSuccess="handleSaveKeyEvtSuccess"
    ></addKeyEvt>

    <!-- 删除关键事件 确认弹框 -->
    <confirmDialog
        v-model:visible="visible_delKeyEvt"
        :title="$t('deleteConfirm')"
        :tip-content="$t('opporStage.delKeyEvtTip')"
        @confirm="handleDelKeyEvtConfirm"
    ></confirmDialog>

    <!-- 编辑关键信息弹框 -->
    <el-popover
        ref="popRef"
        :visible="popShow"
        :virtual-ref="triggerRef"
        virtual-triggering
        trigger="click"
        placement="bottom-start"
        :width="popWidth"
        :height="390"
        popper-class="stageFlowPath-keyInfo-pop"
        @hide="handlePopClose"
    >
        <div>
            <div class="custom-Cascader">
                <div class="custom-Cascader-box">
                    <custom-cascader
                        v-model:checkList="curKeyInfoList"
                        ref="casRef"
                        :maxLevel="1"
                        :multiple="true"
                        @change-level="handleChangeLevel" 
                        :fieldsSource="fieldsSource"
                        @handle-click="handleClickOption">
                    </custom-cascader>
                </div>
            </div>
        </div>
    </el-popover>
</template>

<script setup>
import { ref, inject, nextTick, watch } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { getStageFlowData, delKeyEvt, saveKeyInfo, sortKeyEvt } from '@/api/stage';
import { findRelFilterFields } from '@/api/common.js'; // api请求
import stageFlowItem from '@/views/phaseAdvanceSet/components/stageFlowItem';
import addKeyEvt from '@/views/phaseAdvanceSet/components/addKeyEvt';
import customCascader from '@/components/customCascader.vue';

// props
const props = defineProps({
    // 当前选中业务对象类型
    curActionVal: {
        type: Number
    },
    // 是否 active
    isActive: {
        type: Boolean,
        default: true
    }
});

// 全局
// loading
const loading = ref(false);
// 获取业务对象基础信息
const currentSettingRow = inject('currentSettingRow');  

// 业务流程数据
const flowList = ref([]);
const getData = async () => {
    const res = await getStageFlowData({
        objectId: currentSettingRow.value.id,
        objectTypeId: props.curActionVal,
        opportunityTypeId: props.curActionVal
    });
    if (res.code === 10000) {
        flowList.value = Array.isArray(res.data) ? res.data : [];
    } else {
        flowList.value = [];
        ElMessage.error(res.message);
    }
};

// 关键事件 排序 end 回调
const sortEndFuc = (evt) => {
    // 取排序顺序
    const { newIndex, oldIndex } = evt;

    // 调整新数据
    const newTableData = curFlowData.value.opportunityStageEventListRespList.slice();
    newTableData.splice(newIndex, 0, ...newTableData.splice(oldIndex, 1));
    // 发送请求
    sortKeyEvt({
        idList: newTableData.map(v => v.id),
        objectId: currentSettingRow.value.id,
        objectTypeId: props.curActionVal,
        opportunityTypeId: props.curActionVal
    }).then(async res => {
        // 清空旧数据 - 避免数据更新后表格不更新
        const oldTableData = curFlowData.value.opportunityStageEventListRespList.slice();
        curFlowData.value.opportunityStageEventListRespList = [];
        await nextTick();

        if (res.code === 10000) {
            curFlowData.value.opportunityStageEventListRespList = newTableData;
        } else {
            // 失败, 恢复之前的排序
            curFlowData.value.opportunityStageEventListRespList = oldTableData;
            ElMessage.error(res.messageShow);
        }
    });
};

// 业务流程事件处理
// 添加/编辑关键事件
const handleAddKeyEvt = (flowItem, keyEvtData) => {
    visible_addKeyEvt.value = true;
    curFlowData.value = flowItem;
    curKeyEvtData.value = keyEvtData || {};
};
// 删除关键事件
const handleDelKeyEvt = (flowItem, keyEvtData) => {
    visible_delKeyEvt.value = true;
    curFlowData.value = flowItem;
    curKeyEvtData.value = keyEvtData;
};
// 排序关键事件 - 子组件开始拖动时触发, 结束时操作在 sortEndFuc 里
const handleStartSortKeyEvt = (flowItem) => {
    curFlowData.value = flowItem;
};
// 点击关键信息字段
const handleClickKeyInfo = (flowItem, itemRef) => {
    // pop 虚拟 trigger ref 处理
    triggerRef.value = itemRef;

    // 如果已经显示 pop + 外部触发 pop 的数据没有变更, 不用往下执行, return;
    if (popShow.value && flowItem.id === curFlowData.value.id) {
        return;
    }

    // 暂存当前操作的遍历项数据
    curFlowData.value = flowItem;
    // 更新选中项
    curKeyInfoList.value = (flowItem.keyFields || []).slice();

    // 显示下拉 pop
    popShow.value = true;
    // pop 清除旧数据
    casRef.value.clear();
    // pop 重新请求数据
    casRef.value.getData();
};
// 保存关键信息
const handleUpdateKeyInfo = async (flowItem, newVal, oldVal) => {
    curFlowData.value = flowItem;
    updateKeyInfo(newVal, oldVal);
};

// 弹框
// 添加/编辑关键事件
// visible
const visible_addKeyEvt = ref(false);
// 当前操作的阶段流程的数据
const curFlowData = ref({});
// 当前操作的关键事件内容
const curKeyEvtData = ref({});
// 保存关键事件成功
const handleSaveKeyEvtSuccess = (data) => {
    // 更新数据 + 所属阶段流程未分配赢率
    if (data.id) {
        const matchEvtData = curFlowData.value.opportunityStageEventListRespList.find(item => item.id === data.id);
        if (matchEvtData) {
            // 编辑

            curFlowData.value.notAssignedWinProbability = parseInt(curFlowData.value.notAssignedWinProbability) - (data.winProbability - parseInt(matchEvtData.winProbability));
            matchEvtData.name = data.name;
            matchEvtData.fileUsageFlag = data.fileUsageFlag;
            matchEvtData.winProbability = data.winProbability;
            matchEvtData.description = data.description;
        } else {
            // 新增
            curFlowData.value.opportunityStageEventListRespList.push(data);
            curFlowData.value.notAssignedWinProbability = parseInt(curFlowData.value.notAssignedWinProbability) - parseInt(data.winProbability);
        }
    }
};

// 删除关键事件
// visible
const visible_delKeyEvt = ref(false);
// 删除确认
const handleDelKeyEvtConfirm = async () => {
    const res = await delKeyEvt({
        id: curKeyEvtData.value.id
    });
    if (res.code === 10000) {
        visible_delKeyEvt.value = false;
        curFlowData.value.opportunityStageEventListRespList = curFlowData.value.opportunityStageEventListRespList.filter(item => item.id !== curKeyEvtData.value.id);
        curFlowData.value.notAssignedWinProbability = parseInt(curFlowData.value.notAssignedWinProbability) + parseInt(curKeyEvtData.value.winProbability);
    } else {
        ElMessage.error(res.message);
    }
};

// 关键信息 popover 相关
// pop ref
const popRef = ref();
// pop visible
const popShow = ref(false);
// pop width
const popWidth = ref(150);
// pop trigger 虚拟 ref
const triggerRef = ref();
// pop 编辑中的关键信息列表
const curKeyInfoList = ref([]);
// pop 内部 custom-cascader ref
const casRef = ref(null);
// pop cas 需要的数据接口配置
const fieldsSource = {
    methods: findRelFilterFields,
    methodsName: 'findRelFilterFields',
    data: {
        objectId: currentSettingRow.value.id,
        prefix: '',
        layer: 0
    }
};
// pop cas 切换层级
const handleChangeLevel = (n, list) => {
    // 展示多层级时对应增加 pop 宽度
    popWidth.value = 150 * n;
};
// pop cas 点击选项 --- 目前点击有子级的数据, 点击 checkbox , 不会触发此事件
const handleClickOption = (item, valueString, levelIndex = 0) => {
    // 点击不带子级的数据后, 多余的层级数据会清空, 此时调整 pop width , 避免右侧显示空白
    popWidth.value = (levelIndex + 1) * 150;
};
// pop close , 关闭时检查是否需要保存
const handlePopClose = async () => {
    const oldVal = curFlowData.value.keyFields;
    const newVal = curKeyInfoList.value;
    console.error(oldVal);
    console.error(newVal);

    // 关键信息有变化, 调接口更新数据
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        updateKeyInfo(newVal, oldVal);
    }
};
// 更新关键信息
const updateKeyInfo = async (newVal, oldVal) => {
    const idList = newVal.map(item => item.apiKeyValue);
    const res = await saveKeyInfo({
        stageId: curFlowData.value.id,
        keyFields: idList
    });
    if (res.code === 10000) {
        curFlowData.value.keyFields = idList;
    } else {
        ElMessage.error(res.message);
        curFlowData.value.keyFields = oldVal.map(item => item.apiKeyValue);
    }
};
// pop cas 点击外部关闭 pop
onClickOutside(
    popRef,
    (e) => {
        nextTick(() => {
            // 关闭弹框
            popShow.value = false;
            // 重置 width
            popWidth.value = 150;
        });
    },
    {
        ignore: ['.stageFlowPath-keyInfo-pop', '.stageFlowItem-keyInfo-select']
    }
);

// 监听业务对象类型变化, 重新请求数据
watch(
    () => [
        props.curActionVal,
        props.isActive
    ],
    () => {
        if (props.curActionVal && props.isActive) {
            getData();
        }
    },
    {
        immediate: true
    }
);
</script>

<style lang="scss" scoped>
.stageFlowPath {
    padding-bottom: 26px;
}

.custom-Cascader {
    font-size: 14px;

    &-box {
        background: #fff;
        display: flex;
        box-shadow: 0 1px 4px 0 #EAEAEA;
    }

    &-ul {
        width: 149px;
        border-right: 1px solid #E5E7ED;
        padding: 8px 0px;
        height: 390px;

        li {
            display: flex;
            justify-content: space-between;
            padding: 4px 12px;
            display: flex;
            align-items: center;
            cursor: pointer;

            &:hover{
                background-color: var(--#{$elnamespace}-dropdown-menuItem-hover-fill);
                color: var(--#{$elnamespace}-dropdown-menuItem-hover-color)
            }

            &.active{
                background: #F4F8FB;
                span {
                    color: #4285F2;
                }
            }

            .custom {
                color: #A8ABB2;
            }
        }
    }
}
</style>

<style lang="scss">
.#{$elnamespace}-popper.stageFlowPath-keyInfo-pop {
    padding-left: 0px;
    padding-right: 0px;
}
</style>