<template>
    <el-dialog 
        :width="800"
        :close-on-click-modal="false"
        append-to-body
        v-model="dialogVisible" 
        @close="closeDialog" 
        :title="$t(title)">
        <main class="add_form_main">
            <el-form :model="ruleForm"
                     :label-width="145"
                     label-position="left"
                     ref="ruleFormRef"
                     :rules="rules">
                <el-form-item :label="ruleForm.type === 1 ? $t('duplicationCheckingRule.fieldName1') : $t('duplicationCheckingRule.formName1')" prop="ruleName">
                    <el-input v-model="ruleForm.ruleName" @blur="ruleForm.ruleName = ruleForm.ruleName.trim()" show-word-limit maxlength="50"/>
                </el-form-item>
                <el-form-item :label="$t('duplicationCheckingRule.fieldName2')" prop="apiKey">
                    <el-input
                        v-model="ruleForm.apiKey"
                        @input="inputApiKey"
                        show-word-limit
                        maxlength="100"
                        :disabled="props.id !== ''"/>
                </el-form-item>
                <!-- 线索那有个开关、后端接口没有该字段，默认是开启，先注释在这 -->
                <!-- <el-form-item :label="$t('duplicationCheckingRule.fieldName4')">
                    <el-switch
                        v-model="ruleForm.enableFlag"
                        width="50"
                        inline-prompt
                        :active-text="$t('enabled')"
                    />
                </el-form-item> -->
                <el-form-item :label="$t('duplicationCheckingRule.fieldName3')">
                    <el-input
                        v-model="ruleForm.notes"
                        maxlength="400"
                        show-word-limit
                        type="textarea"
                        :autosize="false"
                        resize="none"
                        :rows="3"/>
                </el-form-item>
                <div>
                    <p><b>{{$t('duplicationCheckingRule.setRuletip')}}</b></p> 
                    <div style="max-height: 200px; overflow: auto; padding-bottom: 10px;">
                        <allPurposeFilter
                            ref="allPurposeFilterDom"
                            type="range"
                            :rangeRadioType="rangeRadioType"
                            :objectId="objectId"
                            :levelFields="false"
                            :fieldsSource="fieldsSource"
                            :filterType="filterType"
                            :filterData="conditions"
                            :expression="expression"></allPurposeFilter>
                    </div>
                </div> 
                <el-form-item :label="$t('duplicationCheckingRule.fieldName6')">
                    <el-input
                        v-model="ruleForm.errorMsg"
                        show-word-limit
                        type="textarea"
                        :autosize="false"
                        resize="none"
                        :rows="3"
                        maxlength="200"/>
                </el-form-item>
            </el-form>
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
import { repeatRule, editRepeatRule, getApiKey, getRepeatRule, getDuplicationCheckFields } from '@/api/duplicationCheckingRule.js'; // 角色相关api请求
import allPurposeFilter from '@/components/allPurposeFilter.vue';
const props = defineProps(['id', 'objectId']);
const dialogVisible = defineModel('dialogVisible');
const emit = defineEmits(['updateListData']);
const { t } = useI18n();
const title = computed(() => props.id ? (ruleForm.type === 1 ? 'duplicationCheckingRule.edit1' : 'duplicationCheckingRule.edit') : 'duplicationCheckingRule.add');
const ruleFormRef = ref(null);
const allPurposeFilterDom = ref(null);

const fieldsSource = ref({
    methods: getDuplicationCheckFields,
    data: {
        objectId: props.objectId
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
const ruleForm = reactive({
    ruleName: '',
    apiKey: '',
    // enableFlag: true,
    notes: '',
    errorMsg: '',
    type: 0
});
const rules = reactive({
    ruleName: [
        { required: true, message: t('duplicationCheckingRule.errorTip1'), trigger: 'blur' }
    ],
    apiKey: [
        { required: true, message: t('duplicationCheckingRule.errorTip2'), trigger: 'blur'},
        { validator: validApiKey, trigger: 'blur'}
    ]
});
const rangeRadioType = computed(() => ruleForm.type === 1 ? [2] : [1, 2, 3]);
const filterType = ref(1);
const conditions = ref([]);
const expression = ref('');
const inputApiKey = () => {
    ruleForm.apiKey = ruleForm.apiKey.replace(/[^a-zA-Z0-9_]/g, '');
};
const getKey = () => {
    getApiKey({
        objectId: props.objectId
    }).then(res => {
        if (res.code == 10000) {
            ruleForm.apiKey = res.data;
        }
    });
};
const getRuleData = () => {
    getRepeatRule(props.id).then(res => {
        if (res.code == 10000) {
            const fieldInfo = res.data;
            for (let key in ruleForm) {
                ruleForm[key] = fieldInfo[key];
            }
            conditions.value = JSON.parse(fieldInfo.conditions);
            filterType.value = fieldInfo.conditionFlag;
            expression.value = fieldInfo.expression;
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
const closeDialog = () => {
    dialogVisible.value = false;
};
const submitForm = async (formEl) => {
    if (!formEl) return;
    await formEl.validate((valid) => {
        if (valid) {
            const data = Object.assign({}, ruleForm);
            data.apiKey = data.apiKey.replace(/\s+/g, '');
            const resData = allPurposeFilterDom.value.getOriginalData();
            console.log('条件：', resData);
            if (resData.condition.length === 0) {
                ElMessage.error('请添加查重规则条件');
                return;
            }
            data.conditionFlag = resData.filterType;
            let isComplete = false;
            data.conditions = resData.condition.map(item => {
                if (!item.searchField || !item.searchField.id) {
                    isComplete = true;
                }
                if (!item.searchRange || !item.searchRange.length) {
                    isComplete = true;
                }
                if (!item.value) {
                    isComplete = true;
                }
                return {
                    searchField: item.searchField,
                    matchType: item.value,
                    searchRange: item.searchRange
                };
            });
            if (isComplete) {
                ElMessage.error('查重规则条件不完整，请补充完整');
                return;
            }
            data.expression = resData.expression;
            data.objectId = props.objectId;
            if (props.id) {
                data.id = props.id;
                editRepeatRule(data).then(res => {
                    if (res.code === 10000) {
                        emit('updateListData');
                        ElMessage.success(res.messageShow);
                        closeDialog();
                    } else {
                        ElMessage.error(res.messageShow);
                    }
                });
            } else {
                repeatRule(data).then(res => {
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