<!-- 详细信息设置 弹框 -->
<template>
    <el-dialog
        v-model="visible"
        :title="$t('layout.compoSet_detailInfo')"
        width="800px"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @opened="handleOpen"
        @closed="handleClosed"
        class="detailInfoSet"
    >
        <!-- loading 用的无意义 div -->
        <div ref="dialogBodyRef"></div>

        <!-- 功能 form -->
        <el-form
            :model="formData"
            ref="formRef"
            label-width="140px"
            label-position="left"
        >
            <!-- 快捷编辑 -->
            <!-- <el-form-item
                prop="allowQuickEdit"
                :label="$t('layout.quickEdit')"
            >
                <el-checkbox
                    v-model="formData.allowQuickEdit"
                    :true-label="1"
                    :false-label="0"
                >{{ $t('layout.allowQuickEdit') }}</el-checkbox>
            </el-form-item> -->
            <!-- 隐藏空值字段 -->
            <!-- <el-form-item
                :label="$t('layout.hideNullField')"
            >
                <!~~ 网页端 ~~>
                <el-checkbox
                    v-model="formData.hiddenNullForWeb"
                    :true-label="1"
                    :false-label="0"
                >{{ $t('layout.web') }}</el-checkbox>
                <!~~ 移动端 ~~>
                <el-checkbox
                    v-model="formData.hiddenNullForApp"
                    :true-label="1"
                    :false-label="0"
                >{{ $t('layout.mobile') }}</el-checkbox>
            </el-form-item>-->
            <!-- 字段展示列数 -->
            <el-form-item
                prop="showColumn"
                :label="$t('layout.fieldShowCols')"
            >
                <el-radio-group v-model="formData.showColumn">
                    <el-radio :label="1">{{ $t('layout.singleCol') }}</el-radio>
                    <el-radio :label="2">{{ $t('layout.multipleCol') }}</el-radio>
                </el-radio-group>
                <!-- <el-select
                    v-model="formData.showColumn"
                    :placeholder="$t('placeholder_select', { name: '' })"
                    class="w-75"
                >
                    <el-option
                        v-for="num in 5"
                        :key="num"
                        :label="$t('layout.colNum', { num })"
                        :value="num"
                    ></el-option>
                </el-select> -->
            </el-form-item>
        </el-form>

        <!-- 字段信息设置表 -->
        <div class="detailInfoSet-fields">
            <!-- 标题 -->
            <div class="detailInfoSet-fields-header">
                <span class="detailInfoSet-fields-title">{{ $t('layout.fieldInfoSet') }}</span>
                <span class="detailInfoSet-fields-tip">{{ $t('layout.tip_fieldInfoSet') }}</span>
            </div>

            <!-- 通用拖拽表格组件 -->
            <dragDropLayout
                :key="refreshTableKey"
                :allFieldList="allFields"
                :selectedList="selFields"
                :showHandleObject="{ showCommonlyUsed: false }"
                ref="tableRef"
                class="detailInfoSet-fields-table"
            ></dragDropLayout>
        </div>

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
import { ref, toRef, unref, watch } from 'vue';
import { cloneDeep } from 'lodash';
import { useI18n } from 'vue-i18n';
import useElDialogLoading from '@/hooks/useElDialogLoading';
import dragDropLayout from '@/components/dragDropLayout.vue';

// 定义 model
const visible = defineModel('visible', { type: Boolean, default: false });
// 接受外部传参
const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    operateType: {
        type: String,
        default: 'new'
    },
    settings: {
        type: Object,
        default: () => ({})
    }
});
// 定义 emit
const emits = defineEmits([
    'update:loading',
    'update:settings',
    'save'
]);

// 多语言
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
    // 表单重置
    formRef.value?.resetFields();
};

// 表单
const formRef = ref(null);
const formData = ref({
    // allowQuickEdit: 0,
    // hiddenNullForWeb: 0,
    // hiddenNullForApp: 0,
    // 字段展示列数 1：单列 2：多列
    showColumn: 2
});

// 表格
const tableRef = ref(null);
// 刷新表格
let refreshTableKey = ref(0);
// 所有字段
let allFields = ref([]);
// 已选字段
let selFields = ref([]);

// footer
// 点击提交按钮
const submit = async () => {
    // 组装待保存数据
    // 字段列表
    const selectFieldIds = unref(tableRef.value.getSelectList());
    // 选中字段为空校验
    if (!selectFieldIds.length) {
        ElMessage.error(t('placeholder_select', { name: t('layout.displayField') }));
        return;
    }
    // 选中字段合法性校验
    const errFlag = selectFieldIds.some(item => {
        // 分割线字段校验
        if (`${item.id}` === '-99') {
            // 取前后空格
            item.name = (item.name || '').trim();
            // 名称为空校验
            if (!item.name.length) {
                ElMessage.error(t('layout.dividerNameMustInput'));
                return true;
            }
            // 名称超长校验
            if (item.name.length > 50) {
                ElMessage.error(t('layout.dividerNameOverLength'));
                return true;
            }
        }
    });
    // 校验未通过, return
    if (errFlag) return;

    // 待保存数据
    const savingSetData = Object.assign({
        selectFieldIds
    }, formData.value);

    // 传给父组件保存
    emits('save', savingSetData);
};

// open 回调不触发, opened 回调里处理数据会导致页面闪烁, 因此监听 visible: true 来处理数据
watch(
    () => visible.value,
    (val) => {
        if (val) {
            // 表单数据处理
            // formData.value.allowQuickEdit = props.settings.allowQuickEdit;
            // formData.value.hiddenNullForWeb = props.settings.hiddenNullForWeb;
            // formData.value.hiddenNullForApp = props.settings.hiddenNullForApp;
            formData.value.showColumn = props.settings.showColumn === 1 ? 1 : 2;

            // 表格数据处理
            allFields.value = cloneDeep(props.settings.layoutFieldDto?.allFieldList || []);
            selFields.value = cloneDeep(props.settings.layoutFieldDto?.selectedList || []);
            // 刷新排序组件
            refreshTableKey.value++;
        }
    },
    {
        immediate: true
    }
);
</script>

<style lang="scss">
.detailInfoSet {
    &-fields {
        &-header {
            margin-bottom: 10px;
        }

        &-title {
            color: #303033;
            font-weight: var(--#{$elnamespace}-font-weight-primary);
        }

        &-tip {
            margin-left: 12px;
            font-size: var(--#{$elnamespace}-font-size-extra-small);
        }

        &-table {
            height: 365px;
        }
    }

    .#{$elnamespace}-dialog__title {
        color: #303033;
    }

    .#{$elnamespace}-form {
        .#{$elnamespace}-form-item__label {
            padding-left: 0;
        }
    }
}
</style>
