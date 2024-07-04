<!-- 设置布局 dialog -->
<template>
    <el-dialog
        v-model="dialogVisible"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        width="500"
        class="set-layout-dialog"
    >
        <template #title>
            <div class="title">{{ $t('bizObject.setLayout') }}</div>
        </template>
        <!-- body -->
        <template #default>
            <el-form
                :model="ruleForm"
                :rules="rules"
            >
                <el-form-item
                    :label="$t('bizObject.detailsPageLayout')"
                    prop="layoutList1"
                    class="layout-form-item"
                >
                    <el-checkbox-group
                        v-model="ruleForm.layoutList1"
                    >
                        <span
                            v-for="item in layoutList1"
                            :key="item.layoutId"
                        >
                            <el-checkbox
                                name="type"
                                :disabled="item.defaultFlag === 1"
                                :label="item.layoutId"
                            >
                                <template v-if="item.layoutName.replace(/[^\x00-\xff]/gi, '--').length > 20">
                                    <el-tooltip
                                        :content="item.layoutName"
                                        placement="top"
                                        :show-after="500"
                                        :hide-after="0"
                                    >
                                        {{ item.layoutName }}
                                    </el-tooltip>
                                </template>
                                <template v-else>
                                    {{ item.layoutName }}
                                </template>
                            </el-checkbox>
                        </span>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item
                    :label="$t('bizObject.formPageLayout')"
                    prop="layoutList2"
                    class="layout-form-item"
                >
                    <el-checkbox-group
                        v-model="ruleForm.layoutList2"
                    >
                        <span
                            v-for="item in layoutList2"
                            :key="item.layoutId"
                        >
                            <el-checkbox
                                name="type"
                                :disabled="item.defaultFlag === 1"
                                :label="item.layoutId"
                            >
                                <template v-if="item.layoutName.replace(/[^\x00-\xff]/gi, '--').length > 20">
                                    <el-tooltip
                                        :content="item.layoutName"
                                        placement="top"
                                        :show-after="500"
                                        :hide-after="0"
                                    >
                                        {{ item.layoutName }}
                                    </el-tooltip>
                                </template>
                                <template v-else>
                                    {{ item.layoutName }}
                                </template>
                            </el-checkbox>
                        </span>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>
        </template>

        <!-- footer -->
        <template #footer>
            <div class="dialog-footer">
                <!-- 取消 -->
                <el-button
                    @click="cancel"
                    class="useBrandColor"
                >{{ $t('cancel') }}</el-button>
                <!-- 确定 -->
                <el-button
                    type="primary"
                    @click="confirm"
                >{{ confirmBtnText || $t('confirm') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, toRefs, reactive, watch } from 'vue';
import { layoutByBusinessTypeId, editLayoutByBusinessTypeId } from '@/api/businessObjects.js';
import { CODESTATE } from '@/https/codeConfig';
import { useUserStore } from '@/pinia/modules/user.js';
import { useI18n } from 'vue-i18n';
// 获取全局 scss 变量, 以获取 element-plus 的命名空间
import CSSVariables from '@/style/js.module.scss';
const { elnamespace } = CSSVariables;
// 多语言
const { t } = useI18n();
// 取 pinia 数据
const store = useUserStore();
// 接受外部传参
const props = defineProps({
    currentBizObjTypeRow: {
        type: Object,
        default: () => ({})
    },
    // 业务对象数据
    bizObjConfig: {
        type: Object,
        default: () => ({})
    }
});

const { currentBizObjTypeRow } = toRefs(props);

// 接收父组件传, 当前选中的行
const dialogVisible = defineModel('dialogVisible');

// footer
const cancel = () => {
    dialogVisible.value = false;
};
// 确认按钮点击事件
const confirm = () => {
    editLayoutByBizTypeId();
};

const ruleForm = ref({
    layoutList1: [],
    layoutList2: []
});

const rules = reactive({
    layoutList1: [
        {
            required: true,
            message: '',
            trigger: 'change'
        }
    ],
    layoutList2: [
        {
            required: true,
            message: '',
            trigger: 'change'
        }
    ]
});

// 布局列表
const layoutList1 = ref([]);
const layoutList2 = ref([]);

// 处理布局列表
const handleLayoutList = (data) => {
    const handleItem = (item, layoutList, layoutListInRuleForm) => {
        layoutList.value.push(item);
        // 默认布局和选中布局
        if (item.defaultFlag === 1 || item.selectedFlag === 1) {
            layoutListInRuleForm.push(item.layoutId);
        }
    };

    data.forEach(item => {
        if (item.layoutType === 0) {
            handleItem(item, layoutList1, ruleForm.value.layoutList1);
        }
        if (item.layoutType === 1) {
            handleItem(item, layoutList2, ruleForm.value.layoutList2);
        }
    });
};

// 根据业务对象类型 id 获取布局
const getLayoutByBusinessTypeId = () => {
    layoutByBusinessTypeId({
        businessTypeId: currentBizObjTypeRow.value.id,
        objectId: props.bizObjConfig.id
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            handleLayoutList(res.data);
        } else {
            ElMessage.error(res.messageShow);
        }
    }).catch(err => {
        console.error('根据业务对象类型 id 获取布局', err);
        ElMessage.error(err.messageShow);
    });
};

// 根据业务对象类型 id 编辑布局
const editLayoutByBizTypeId = () => {
    editLayoutByBusinessTypeId({
        businessTypeId: currentBizObjTypeRow.value.id,
        layoutIds: ruleForm.value.layoutList1.concat(ruleForm.value.layoutList2)
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            ElMessage.success(t('saveSuccess'));
        } else {
            ElMessage.error(res.messageShow);
        }
        dialogVisible.value = false;
    }).catch(err => {
        console.error('根据业务对象类型 id 编辑布局', err);
        ElMessage.error(err.messageShow);
    });
};

const initData = () => {
    layoutList1.value = [];
    layoutList2.value = [];
    ruleForm.value.layoutList1 = [];
    ruleForm.value.layoutList2 = [];
};

// 监听 dialogVisible 变化
watch(dialogVisible, (val) => {
    if (val) {
        getLayoutByBusinessTypeId();
    } else {
        initData();
    }
});
</script>

<style lang="scss" scoped>
.set-layout-dialog {
    .#{$elnamespace}-dialog__header {
        padding: 24px 24px 12px 24px;
    }
    .title {
        color: #303033;
        font-size: 16px;
        font-weight: 500;
        line-height: 24px;
    }
    .layout-form-item {
        .#{$elnamespace}-checkbox-group {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(2, 50%);
            .#{$elnamespace}-checkbox {
                :deep(.#{$elnamespace}-checkbox__label) {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    span {
                        display: inline-block;
                        max-width: 310px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }
            }
        }
    }
}
</style>
<style lang="scss">
.set-layout-dialog {
    .#{$elnamespace}-scrollbar {
        height: 440px;
        overflow-y: auto;
    }
}
</style>
