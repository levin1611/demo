<template>
    <el-dialog 
        :width="800"
        top="12vh"
        :close-on-click-modal="false"
        append-to-body
        v-model="dialogVisible" 
        @close="closeDialog" 
        :title="$t(title)">
        <main class="add_form_main">
            <div class="ruleFormBox">
                <el-form :model="ruleForm"
                         :label-width="145"
                         label-position="left"
                         ref="ruleFormRef"
                         :rules="rules">
                    <el-form-item :label="$t('clueConversion.conditionformName1')" prop="ruleName">
                        <el-input v-model="ruleForm.ruleName" @blur="ruleForm.ruleName = ruleForm.ruleName.trim()" show-word-limit maxlength="50"/>
                    </el-form-item>
                    <!-- 程序识别名称 -->
                    <el-form-item :label="$t('fieldSet.formName2')" prop="apiKey">
                        <el-input v-model="ruleForm.apiKey" show-word-limit :maxlength="100" :disabled="id !== ''" @input="inputApiKey"/>
                    </el-form-item>
                    <el-form-item :label="$t('clueConversion.mappingfieldName4')">
                        <el-input
                            v-model="ruleForm.notes"
                            maxlength="400"
                            show-word-limit
                            type="textarea"
                            :autosize="false"
                            resize="none"
                            :rows="3"/>
                    </el-form-item>
                    <el-form-item :label="$t('clueConversion.mappingfieldName5')">
                        <el-switch
                            v-model="ruleForm.enableFlag"
                            width="50"
                            inline-prompt
                            :active-text="$t('enabled')"
                            :inactive-text="$t('bizObject.disable')"
                        /> 
                    </el-form-item>
                    <el-form-item :label="$t('clueConversion.condition')" prop="checkCondition">
                        <el-input
                            ref="checkConditionDom"
                            v-model="ruleForm.checkCondition"
                            type="textarea"
                            show-word-limit
                            :autosize="false"
                            resize="none"
                            :rows="3"
                            @blur="checkConditionBlur"
                            maxlength="5000"/>
                        <representation 
                            :usageType="4"
                            :maxLevel="4"
                            :fieldsSource="fieldsSource"
                            @changeObject="changeObject"
                            :objectId="props.objectId"
                            :grammarString="ruleForm.checkCondition"
                            @handle-click="changeCheckCondition"></representation>
                    </el-form-item>
                    <el-form-item :label="$t('clueConversion.conditionformName2')" prop="errorMsg">
                        <el-input
                            v-model="ruleForm.errorMsg"
                            type="textarea"
                            show-word-limit
                            :autosize="false"
                            resize="none"
                            :rows="3"
                            maxlength="200"/>
                    </el-form-item>
                </el-form>
            </div>
            
        </main>
        <template #footer>
            <span class="dialog-footer">
                <el-button class="useBrandColor" @click="closeDialog">{{$t('cancel')}}</el-button>
                <el-button type="primary" @click="submitForm(ruleFormRef)">
                    {{props.id ? $t('save') : $t('confirm')}}
                </el-button>
            </span>
        </template>
    </el-dialog>
</template> 
<script setup>
import { ref, reactive, toRef, computed, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { addConversionRule, editConversionRule, getApiKey, getConversionRule } from '@/api/conversion.js'; // 角色相关api请求
import { fields4meta, findRelFilterFields } from '@/api/common.js'; // api请求
import { queryObjFieldList } from '@/api/fieldsSetting.js'; // api请求

import representation from '@/components/representation.vue';
const props = defineProps({
    id: {
        type: String || Number,
        default: ''
    },
    objectId: {
        type: String || Number,
        default: ''
    }
});
const validApiKey = (rule, value, callback) => {
    const firstChar = value.charAt(0);
    if (/\d/.test(firstChar)) {
        callback(new Error('程序识别名称不能以数字开头'));
    } else {
        callback();
    }
};
const dialogVisible = defineModel('dialogVisible');
const title = computed(() => props.id ? 'clueConversion.editCondition' : 'clueConversion.addCondition');
const emit = defineEmits(['updateListData']);
const { t } = useI18n();
const ruleFormRef = ref(null);
const ruleForm = reactive({
    ruleName: '',
    apiKey: '',
    enableFlag: true,
    // triggerRuleFlag: false,
    notes: '',
    checkCondition: '',
    errorMsg: '',
    errorMsgPosition: 0,
    errorField: ''
});
const rules = reactive({
    ruleName: [
        { required: true, message: t('validationRule.errorTip1'), trigger: 'blur' }
    ],
    apiKey: [
        { required: true, message: t('validationRule.errorTip2'), trigger: 'blur'},
        { validator: validApiKey, trigger: 'blur'}
    ],
    checkCondition: [ 
        { required: true, message: t('validationRule.errorTip3'), trigger: 'blur'}
    ], 
    errorMsg: [
        { required: true, message: t('validationRule.errorTip4'), trigger: 'blur'}
    ]
});

const fieldsSource = ref({
    methods: fields4meta,
    methodsName: 'fields4meta',
    data: {
        objectId: props.objectId,
        prefix: '',
        usageType: 4,
        layer: 0
    }
});
const inputApiKey = () => {
    ruleForm.apiKey = ruleForm.apiKey.replace(/[^a-zA-Z0-9_]/g, '');
};
// 获取新增时的apiKey
const getKey = () => {
    getApiKey({
        objectId: props.objectId
    }).then(res => {
        if (res.code == 10000) {
            ruleForm.apiKey = res.data;
        }
    });
};
// 获取规则详情
const getRuleData = () => {
    getConversionRule(props.id).then(res => {
        if (res.code == 10000) {
            const fieldInfo = res.data;
            for (let key in ruleForm) {
                ruleForm[key] = fieldInfo[key];
            }
            ruleForm.errorField = ruleForm.errorField ? Number(ruleForm.errorField) : '';
            if (ruleForm.errorMsgPosition === 0) {
                ruleForm.errorField = '';
            }
            ruleForm.enableFlag = fieldInfo.enableFlag === 1;
            // ruleForm.triggerRuleFlag = fieldInfo.triggerRuleFlag === 1;
        } else {
            ElMessage.error(res.messageShow);
            closeDialog();
        }
    });
};
if (props.id) {
    getRuleData();
} else {
    getKey();
}
// 校验条件设置相关
const checkConditionDom = ref(null);
const checkConditionSelectionStart = ref(null);
const checkConditionSelectionEnd = ref(null);
// 校验条件textarea光标位置
const checkConditionBlur = (e) => {
    const textareaDom = e.target;
    checkConditionSelectionStart.value = textareaDom.selectionStart;
    checkConditionSelectionEnd.value = textareaDom.selectionEnd;
};
// 设置校验条件字段
const changeCheckCondition = (data) => {
    console.log(data);
    if (checkConditionSelectionEnd.value > checkConditionSelectionStart.value) {
        ruleForm.checkCondition = (ruleForm.checkCondition.slice(0, checkConditionSelectionStart.value) + data.valueString + ruleForm.checkCondition.slice(checkConditionSelectionStart.value)).slice(0, 1000);
    } else {
        ruleForm.checkCondition = ruleForm.checkCondition.slice(0, checkConditionSelectionStart.value) + data.valueString + ruleForm.checkCondition.slice(checkConditionSelectionStart.value).slice(0, 1000);
    }
    // 使用nextTick不能够设置focus，所以使用setTimeout了
    setTimeout(() => {
        checkConditionDom.value.focus();
        const start = checkConditionSelectionStart.value + data.valueString.length;
        checkConditionDom.value.textarea.setSelectionRange(start, start);
    }, 200);
};
// 关闭新增 编辑弹窗
const closeDialog = () => {
    dialogVisible.value = false;
};
// 提交表单
const submitForm = async (formEl) => {
    if (!formEl) return;
    await formEl.validate((valid) => {
        if (valid) {
            const data = Object.assign({}, ruleForm);
            data.ruleName = data.ruleName.trim();
            data.apiKey = data.apiKey.replace(/\s+/g, '');
            data.enableFlag = data.enableFlag ? 1 : 0;
            // data.triggerRuleFlag = data.triggerRuleFlag ? 1 : 0;
            data.objectId = props.objectId;
            if (props.id) {
                data.id = props.id;
                editConversionRule(data).then(res => {
                    if (res.code === 10000) {
                        emit('updateListData');
                        ElMessage.success(res.messageShow);
                        closeDialog();
                    } else {
                        ElMessage.error(res.messageShow);
                    }
                });
            } else {
                addConversionRule(data).then(res => {
                    if (res.code === 10000) {
                        emit('updateListData');
                        ElMessage.success(res.messageShow);
                        closeDialog();
                    } else {
                        ElMessage.error(res.messageShow);
                    }
                });
            }
            
        }
    });
};
</script>
<style lang="scss" scoped>
.specialLabel {
    white-space: break-spaces;
    line-height: 22px;
}
.add_form_main {
    overflow-y: auto;
    margin: 0 -12px;
    .ruleFormBox {
        padding: 0 12px;
        height: 100%;
        max-height: 500px;
    }
}
</style>