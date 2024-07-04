<template>
    <el-dialog 
        :width="800"
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
                    <el-form-item :label="$t('validationRule.formName1')" prop="ruleName">
                        <el-input v-model="ruleForm.ruleName" @blur="ruleForm.ruleName = ruleForm.ruleName.trim()" show-word-limit maxlength="50"/>
                    </el-form-item>
                    <el-form-item :label="$t('validationRule.fieldName2')" prop="apiKey">
                        <el-input
                            v-model="ruleForm.apiKey"
                            @input="inputApiKey"
                            show-word-limit
                            maxlength="100"
                            :disabled="props.id !== ''"/>
                    </el-form-item>
                    <el-form-item :label="$t('validationRule.fieldName4')">
                        <el-switch
                            v-model="ruleForm.enableFlag"
                            width="50"
                            inline-prompt
                            :active-text="$t('enabled')"
                        /> 
                    </el-form-item>
                    <!-- <el-form-item>
                        <template #label>
                            <span class="specialLabel">{{ $t('validationRule.formName2') }}</span>
                        </template>
                        <el-checkbox v-model="ruleForm.triggerRuleFlag" size="large" style="margin-right: 20px"/>
                        <el-tooltip
                            placement="bottom-start"
                            popper-class="max-w-300"
                            trigger="hover"
                            :content="$t('validationRule.tips')"
                        >
                            <i class="custom custom-tip"></i>
                        </el-tooltip>
                    </el-form-item> -->
                    
                    <el-form-item :label="$t('validationRule.fieldName3')">
                        <el-input v-model="ruleForm.notes" maxlength="400" show-word-limit/>
                    </el-form-item>
                    <el-form-item :label="$t('validationRule.formName3')" prop="checkCondition">
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
                    <el-form-item :label="$t('validationRule.formName4')" prop="errorMsg">
                        <el-input v-model="ruleForm.errorMsg" type="textarea" show-word-limit :autosize="false" resize="none" :rows="3" maxlength="200"/>
                    </el-form-item>
                    <el-form-item >
                        <template #label>
                            <span class="specialLabel">{{$t('validationRule.formName5')}}</span>
                        </template>
                        <el-radio-group v-model="ruleForm.errorMsgPosition">
                            <el-radio :label="0">{{$t('validationRule.radioLabel1')}}</el-radio>
                            <el-radio :label="1">{{$t('validationRule.radioLabel2')}}</el-radio>
                        </el-radio-group>
                        <el-select
                            v-model="ruleForm.errorField"
                            :disabled="ruleForm.errorMsgPosition === 0"
                            :placeholder="$t('selectPlaceholder')"
                            style="width: 220px; margin-left:10px"
                        >
                            <el-option
                                v-for="item in fieldOptions"
                                :key="item.id"
                                :label="item.displayName"
                                :value="item.apiKey"
                            />
                        </el-select>
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
import { addCheckRule, editCheckRule, getApiKey, getCheckRule } from '@/api/validationRuleList.js'; // 角色相关api请求
import { fields4meta, findRelFilterFields } from '@/api/common.js'; // api请求
import { queryObjFieldList } from '@/api/fieldsSetting.js'; // api请求

import representation from '@/components/representation.vue';
const props = defineProps(['id', 'objectId']);
const dialogVisible = defineModel('dialogVisible');
const title = computed(() => props.id ? 'validationRule.edit' : 'validationRule.add');
const emit = defineEmits(['updateListData']);
const { t } = useI18n();
const ruleFormRef = ref(null);
const validApiKey = (rule, value, callback) => {
    const firstChar = value.charAt(0);
    if (/\d/.test(firstChar)) {
        callback(new Error('程序识别名称不能以数字开头'));
    } else {
        callback();
    }
};
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

const inputApiKey = () => {
    ruleForm.apiKey = ruleForm.apiKey.replace(/[^a-zA-Z0-9_]/g, '');
};
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

// 错误提示语显示位置 的字段
const fieldOptions = ref([]);
const getAllFieldList = () => {
    queryObjFieldList({
        objectId: props.objectId
    }).then(res => {
        if (res.code === 10000) {
            fieldOptions.value = [].concat(res.data.customField, res.data.systemField);
        } else {
            ElMessage.error(res.messageShow);
        }
    });
};
getAllFieldList();
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
    getCheckRule(props.id).then(res => {
        if (res.code == 10000) {
            const fieldInfo = res.data;
            for (let key in ruleForm) {
                ruleForm[key] = fieldInfo[key];
            }
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
            if (data.errorMsgPosition === 1 && !data.errorField) {
                ElMessage.error(t('validationRule.errorTip5'));
                return;
            }
            data.apiKey = data.apiKey.replace(/\s+/g, '');
            data.enableFlag = data.enableFlag ? 1 : 0;
            // data.triggerRuleFlag = data.triggerRuleFlag ? 1 : 0;
            data.objectId = props.objectId;
            if (props.id) {
                data.id = props.id;
                editCheckRule(data).then(res => {
                    if (res.code === 10000) {
                        emit('updateListData');
                        ElMessage.success(res.messageShow);
                        closeDialog();
                    } else {
                        ElMessage.error(res.messageShow);
                    }
                });
            } else {
                addCheckRule(data).then(res => {
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