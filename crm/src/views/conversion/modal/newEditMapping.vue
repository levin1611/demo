<template>
    <el-dialog 
        :width="900"
        top="10vh"
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
                    <!-- * 映射关系名称 -->
                    <el-form-item :label="$t('clueConversion.mappingfieldName1')" prop="ruleName">
                        <el-input v-model="ruleForm.ruleName" show-word-limit maxlength="50"/>
                    </el-form-item>
                    <!-- 程序识别名称 -->
                    <el-form-item :label="$t('fieldSet.formName2')" prop="apiKey">
                        <el-input v-model="ruleForm.apiKey" show-word-limit :maxlength="100" :disabled="id !== ''" @input="inputApiKey"/>
                    </el-form-item>
                    <!-- 描述 -->
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
                    <el-form-item :label="$t('clueConversion.mappingformName1')">
                        <allPurposeFilter
                            ref="allPurposeFilterDom"
                            :fieldsSource="fieldsSource"
                            :dataSource="dataSource"
                            :objectId="objectId"
                            @changeObject="changeObject"
                            :maxLevel="4"
                            :filterType="filterType"
                            :filterData="conditions"
                            :expression="expression"></allPurposeFilter>
                    </el-form-item>
                    <el-form-item :label="$t('clueConversion.mappingformName2')">
                        <el-table
                            class="optionTable"
                            :data="clueFeilds"
                            height="40vh"
                            :tooltip-options="{showAfter: 500}"
                        >
                            <el-table-column
                                v-for="column in columns"
                                :key="column.prop"
                                :prop="column.prop"
                                :label="$t(column.label)"
                                :width="column.width"
                                :show-overflow-tooltip="['clue'].includes(column.prop)"
                            >
                                <template #default="{ row }">
                                    <template v-if="column.prop === 'customerFeildId'">
                                        <el-select size="small" v-model="row.customerFeildId" :placeholder="$t('placeholder_select')" @change="changeField(row, column.prop)">
                                            <el-option v-for="item in customerFeilds" :key="item.id" :label="item.displayName" :value="item.id"></el-option>
                                        </el-select>
                                    </template>
                                    <template v-else-if="column.prop === 'contactFeildId'">
                                        <el-select size="small" v-model="row.customerFeildId" :placeholder="$t('placeholder_select')" @change="changeField(row, column.prop)">
                                            <el-option v-for="item in contactFeilds" :key="item.id" :label="item.displayName" :value="item.id"></el-option>
                                        </el-select>
                                    </template>
                                    <template v-else-if="column.prop === 'opportunityId'">
                                        <el-select size="small" v-model="row.opportunityId" :placeholder="$t('placeholder_select')" @change="changeField(row, column.prop)">
                                            <el-option v-for="item in opportunityFeilds" :key="item.id" :label="item.displayName" :value="item.id"></el-option>
                                        </el-select>
                                    </template>
                                </template>
                            </el-table-column>
                        </el-table>
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
import { findRelFilterFields, findRelFilterFieldsRange } from '@/api/common.js'; // api请求
import { queryObjFieldList } from '@/api/fieldsSetting.js'; // api请求

import allPurposeFilter from '@/components/allPurposeFilter.vue';
const props = defineProps({
    id: {
        type: String,
        default: ''
    },
    objectId: {
        type: String || Number,
        default: 1357
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
const title = computed(() => props.id ? 'clueConversion.editMapping ' : 'clueConversion.addMapping');
const emit = defineEmits(['updateListData']);
const { t } = useI18n();
const ruleFormRef = ref(null);
const allPurposeFilterDom = ref(null);
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

const filterType = ref(0);
const conditions = ref([]);
const expression = ref('');
// 查找范围 传个allPurposeFilter的参数 左侧字段列表
const fieldsSource = ref({
    methods: findRelFilterFields,
    methodsName: 'findRelFilterFields',
    data: {
        objectId: props.objectId,
        prefix: '',
        layer: 0
    }
});
// 查找范围 传个allPurposeFilter的参数 右侧字段列表
const dataSource = ref({
    methods: findRelFilterFieldsRange,
    methodsName: 'findRelFilterFieldsRange',
    data: {
        objectId: props.objectId,
        prefix: '',
        layer: 0
    }
});
// 关联关系 查找范围组件内操作 重新赋值
const changeObject = (data) => {
    fieldsSource.value.data.objectId = data.id;
    fieldsSource.value.data.prefix = data.apiKey;
};
const customerFeilds = ref([]);
const contactFeilds = ref([]);
const opportunityFeilds = ref([]);
const clueFeilds = ref([]);
const columns = ref([
    {
        label: 'clueConversion.clue',
        prop: 'displayName',
        width: ''
    },
    {
        label: 'clueConversion.customer',
        prop: 'customerFeildId',
        width: ''
    },
    {
        label: 'clueConversion.contact',
        prop: 'contactFeildId',
        width: ''
    },
    {
        label: 'clueConversion.opportunity',
        prop: 'opportunityId',
        width: ''
    }
]);

const inputApiKey = () => {
    ruleForm.apiKey = ruleForm.apiKey.replace(/[^a-zA-Z0-9_]/g, '');
};
const getAllFieldList = () => {
    queryObjFieldList({
        objectId: props.objectId
    }).then(res => {
        if (res.code === 10000) {
            clueFeilds.value = [].concat(res.data.customField, res.data.systemField).map(item => {
                item.customerFeildId = '';
                item.contactFeildId = '';
                item.opportunityId = '';
                return item;
            });
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
}
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
            const resData = allPurposeFilterDom.value.getOriginalData();
            console.log(resData);
            data.filterType = resData.filterType;
            if (resData.filterType > 0) {
                let isComplete = false;
                data.conditions = resData.condition.map((item) => {
                    if (item.searchRange && item.condMode !== undefined) {
                        item.searchRange.condMode = item.condMode;
                        item.searchRange.values = item.condMode === 1 ? null : item.values;
                    }
                    if (!item.searchField || !item.searchField.id) {
                        isComplete = true;
                    }
                    if (![12, 13].includes(item.matchType)) {
                        if (item.condMode === 1 && (!item.searchRange || !item.searchRange.id)) {
                            isComplete = true;
                        }
                        if (item.condMode === 0) {
                            if (item.matchType === 11) {
                                if ((!item.values[0] && typeof(item.values[0]) !== 'number') || (!item.values[1] && typeof(item.values[1]) !== 'number')) {
                                    isComplete = true;
                                }
                            } else {
                                if (!item.values[0] && typeof(item.values[0]) !== 'number') {
                                    isComplete = true;
                                }
                            }
                        }
                    }
                    return {
                        searchField: item.searchField,
                        matchType: item.matchType,
                        searchRange: item.searchRange ? [item.searchRange] : null
                    };
                });
                if (isComplete) {
                    ElMessage.error('设置条件不完整，请补充完整');
                    return;
                }
                data.expression = resData.expression;
            } else {
                data.conditions = null;
                data.expression = '';
            }
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
        // max-height: calc(100vh - 300px);
    }
}
</style>