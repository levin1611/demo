<!-- 阶段推进设置, 添加/编辑关键事件 -->
<template>
    <el-dialog 
        v-model="dialogVisible"
        v-loading="loading"
        :width="660"
        :title="$t(evtData.id ? 'opporStage.editKeyEvt' : 'opporStage.addKeyEvt')"
        append-to-body
        @close="closeDialog" 
        class="addKeyEvt"
    >
        <!-- 数据表单 -->
        <el-form
            :model="formData"
            :rules="formRules"
            :label-width="130"
            label-position="left"
            ref="formRef"
            class="addKeyEvt-form"
        >
            <!-- 事件名称 -->
            <el-form-item
                prop="name"
                :label="$t('opporStage.evtName')"
            >
                <el-input
                    v-model="formData.name"
                    show-word-limit
                    :maxlength="50"
                />
            </el-form-item>
            <!-- 赢率 -->
            <el-form-item
                prop="winProbability"
                :label="$t('opporStage.winProbability')"
            >
                <el-input-number
                    v-model="formData.winProbability"
                    :min="0"
                    :max="allMaxWinProbability"
                />
                <!-- tip -->
                <span>{{ $t('opporStage.winProbabilitySuffixTip', { percent: flowData.notAssignedWinProbability }) }}</span>
            </el-form-item>
            <!-- 上传文档 -->
            <el-form-item
                prop="uploadDoc"
                :label="$t('opporStage.uploadDoc')"
            >
                <!-- 可以上传 -->
                <el-checkbox-group
                    v-model="formData.uploadDoc"
                >
                    <el-checkbox
                        :value="1"
                        :label="$t('opporStage.canUpload')"
                        @click="handleClickCheck(1)"
                    ></el-checkbox>
                    <!-- 必须上传 -->
                    <el-checkbox
                        :value="2"
                        @click="handleClickCheck(2)"
                        :label="$t('opporStage.mustUpload')"
                    ></el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <!-- 备注 -->
            <el-form-item
                prop="description"
                :label="$t('remark')"
            >
                <el-input
                    v-model="formData.description"
                    type="textarea"
                    maxlength="1000"
                    show-word-limit
                    :rows="3"
                ></el-input>
            </el-form-item>
        </el-form>

        <!-- footer -->
        <template #footer>
            <span class="dialog-footer">
                <el-button
                    @click="closeDialog"
                    class="useBrandColor"
                >{{ $t('cancel') }}</el-button>
                <el-button
                    type="primary"
                    @click="submitForm(formRef)"
                >
                    {{ evtData.id ? $t('save') : $t('confirm') }}
                </el-button>
            </span>
        </template>
    </el-dialog>
</template> 

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { saveKeyEvt, editKeyEvt } from '@/api/stage';

// model
const dialogVisible = defineModel('dialogVisible');
// props
const props = defineProps({
    // 流程数据
    flowData: {
        type: Object,
        default: () => ({})
    },
    // 关键事件数据
    evtData: {
        type: Object,
        default: () => ({})
    }
});
// emits
const emits = defineEmits(['saveSuccess']);

// 全局
// loading
const loading = ref(false);
// 多语言
const { t } = useI18n();
// 数据处理
const handleData = (data) => {
    // 表单数据
    const tmpFormData = {
        name: data.name || '',
        winProbability: /^\d+$/.test(`${data.winProbability}`) ? parseInt(data.winProbability) : 0,
        uploadDoc: data.fileUsageFlag ? [data.fileUsageFlag, data.fileUsageFlag - 1] : [],
        description: data.description || ''
    };
    // 最大赢率
    allMaxWinProbability.value = (Math.max(props.flowData.notAssignedWinProbability, 0) || 0) + tmpFormData.winProbability;
    // 表单数据赋值
    formData.value = tmpFormData;
};

// 表单
const formRef = ref(null);
const formData = ref({
    name: '',
    winProbability: 0,
    uploadDoc: [],
    description: ''
});
// 允许输入的最大赢率
const allMaxWinProbability = ref(0);
const formRules = {
    name: [
        { required: true, message: t('opporStage.evtNameInputTip'), trigger: 'blur' }
    ]
};
// 上传文档选项选择
const handleClickCheck = (val) => {
    // 等 checkbox-group 更新后再处理
    setTimeout(() => {
        // 勾选"必须上传"时, 联动勾选"可以上传"
        if (val === 2 && formData.value.uploadDoc.includes(2)) {
            formData.value.uploadDoc = [1, 2];
            return;
        }

        // 取消"可以上传"时, 联动取消勾选"必须上传"
        if (val === 1 && !formData.value.uploadDoc.includes(1)) {
            formData.value.uploadDoc = [];
        }
    }, 0);

    // 否则, checkbox-group 正常处理勾选逻辑
};

// 保存
const submitForm = async (formEl) => {
    if (!formEl) return;

    // 去除前后空格再校验
    formData.value.name = formData.value.name.trim();
    formData.value.description = formData.value.description.trim();

    // 校验 + 请求
    await formEl.validate((valid) => {
        if (valid) {
            // 数据格式化
            const postData = {
                id: props.evtData.id,
                stageId: props.flowData.id,
                name: formData.value.name,
                description: formData.value.description
            };
            postData.winProbability = Number.isInteger(formData.value.winProbability) ? formData.value.winProbability : 0;
            postData.fileUsageFlag = Math.max(0, ...formData.value.uploadDoc);

            // 前端校验未分配赢率
            if (postData.winProbability > (Number(props.flowData.notAssignedWinProbability) || 0) + (Number(props.evtData.winProbability) || 0)) {
                ElMessage.error(t('opporStage.evtWinProbabilityOverTip'));
                return;
            }

            // loading
            loading.value = true;

            // 发送请求
            const api = postData.id ? editKeyEvt : saveKeyEvt;
            api(postData).then(res => {
                if (res.code === 10000) {
                    ElMessage.success(res.messageShow);
                    emits('saveSuccess', res.data || postData);
                    closeDialog();
                } else {
                    ElMessage.error(res.messageShow);
                }
                loading.value = false;
            });
        }
    });
};
// 关闭弹窗
const closeDialog = () => {
    dialogVisible.value = false;
};

// 监听弹框开关, 执行
watch(
    () => dialogVisible.value,
    (val) => {
        if (val) {
            handleData(props.evtData);
        }
    },
    {
        immediate: true
    }
);
</script>

<style lang="scss" scoped>
.addKeyEvt {
}
</style>