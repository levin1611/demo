<!-- 新建/编辑选项集 弹框 -->
<template>
    <el-dialog
        v-model="dialogVisible"
        title="查看引用"
        width="800px"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @open="handleOpen"
        @closed="handleClosed"
        class="editRole"
    >

        <el-table
            :data="tableData"
            max-height="calc(100% - 106px)"
            stripe
            height="500px"
            highlight-current-row
            :show-overflow-tooltip="{ showAfter: 500 }"
            class="options-table"
            ref="optionsSetRef"
            row-key="optionsSetCode"
            fit
        >
            <!-- 空数据插槽 -->
            <template #empty>
                <default-empty />
            </template>  
            <el-table-column
                label="字段名称"
                prop="fieldName"
                width="180"
            ></el-table-column>
            <el-table-column
                label="业务对象名称"
                prop="objectName"
                width="180"
            ></el-table-column>
            <el-table-column
                label="字段类型"
                prop="dataType"
                width="180"
            >
            <template #default="{ row }">
                {{fieldsNamesMap[row.dataType]}}
            </template>
            </el-table-column>
            <el-table-column
                label="字段状态"
                prop="enableFlag"
            >
                <template #default="{ row }">
                    <el-switch
                        v-model="row.enableFlag"
                        @change="handleChange(row)"
                        inline-prompt
                        disabled
                        active-text="启用"
                        inactive-text="禁用"
                    />
                </template>
            </el-table-column>
        </el-table>
        <!-- footer -->
        <template #footer>
            <div class="dialog-footer">
                <!-- cancel -->
                <el-button
                    @click="closeDialog"
                    class="useBrandColor"
                >{{ $t('cancel') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import Utils from '@/utils';
import { useUserStore } from '@/pinia/modules/user.js';
import { viewReferences } from '@/api/generalOptionsSet.js';
import useDialogCommon from '@/hooks/useDialogCommon';
import { fieldsNamesMap } from '@/utils/filterConfig';
// 引入 i18n 方法
const { t } = useI18n();

// 接受外部传参
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    optionsData: {
        type: Object,
        default: () => ({})
    }
});
// 定义 emit
const emits = defineEmits([
    'update:visible',
    'update:optionsData',
    'operateSuccess'
]);

const tableData= ref([])

// 取通用的 dialog 逻辑相关参数
const {
    dialogVisible,
    closeDialog
} = useDialogCommon(props, emits);

// 取 pinia 数据
const store = useUserStore();

// 弹框打开前
const handleOpen = () => {
    viewReferences({
        id: props.optionsData.id
    }).then(res => {
        if(res.code === 10000) {
            res.data.forEach((v, i) => {
                v.enableFlag = (v.enableFlag && v.enableFlag >= 1) ? true : false;
            })
            tableData.value = res.data
        } else {
            ElMessage.error(res.messageShow);
        }
    })
};
// 弹框关闭前
const handleClosed = () => {
    
};



</script>

<style lang="scss" scoped>
</style>