<template>
    <el-dialog
        v-model="props.visible"
        :title="props.title"
        :append-to-body="true"

        :close-on-click-modal="false"
        @close="onClose"
        :width="1000"
        top="80px"
    >
        <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="80px"
            label-position="left"
        >
            <div class="title">{{ $t('permRule.secondTitle.base') }}</div>
            <el-form-item :label="$t('permRule.buObj')">
                <el-input :value="props.curBizObj.entityName" disabled />
            </el-form-item>
            <el-form-item :label="$t('permRule.ruleName')" prop="ruleName">
                <el-input
                    v-model.trim="form.ruleName"
                    maxlength="100"
                    show-word-limit
                    :placeholder="$t('permRule.placeholder.ruleName')"
                />
            </el-form-item>
            <el-form-item :label="$t('remark')" prop="description">
                <el-input
                    v-model="form.description"
                    type="textarea"
                    maxlength="1000"
                    show-word-limit
                    :placeholder="$t('permRule.placeholder.remark')"
                />
            </el-form-item>
            <el-form-item :label="$t('permRule.ruleType')" prop="ruleType">
                <el-radio-group v-model="form.ruleType" :disabled="isEdit">
                    <el-radio :label="0">{{ $t('permRule.byType0') }}</el-radio>
                    <el-radio :label="1">{{ $t('permRule.byType1') }}</el-radio>
                </el-radio-group>
            </el-form-item>
            <div class="title m16">
                {{ $t('permRule.secondTitle.chooseShareData') }}
            </div>
            <el-row v-if="form.ruleType === 0">
                <el-form-item
                    label=" "
                    prop="fromScope1.dataRange"
                    label-width="auto"
                >
                    <el-select
                        v-model="form.fromScope1.dataRange"
                        :style="{ width: '150px' }"
                    >
                        <el-option
                            v-for="item in dataRangeOptions($t)"
                            :key="item.value"
                            :label="item.lable"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item
                    :label="$t('permRule.shareDataEnd')"
                    prop="fromScope1.itemId"
                    label-width="auto"
                    class="should-reverse remove-before"
                >
                    <el-tree-select
                        v-model="form.fromScope1.itemId"
                        :data="departmentTree"
                        node-key="id"
                        value-key="name"
                        :props="{ children: 'list', label: 'name' }"
                        :render-after-expand="false"
                        :show-checkbox="true"
                        check-on-click-node
                        :expand-on-click-node="false"
                        check-strictly
                        :style="{ width: '240px' }"
                        :placeholder="$t('permRule.placeholder.department')"
                    />
                </el-form-item>
            </el-row>
            <el-form-item class='scroll_elitem'>
                <all-purpose-filter
                    v-if="form.ruleType === 1"
                    :objectId="props.curBizObj.entityId"
                    :radioType="[1, 2, 3]"
                    :filterType='form.fromScope2?.filterType || 1'
                    :levelFields="false"
                    :fieldsSource="fieldsSource"
                    :dataSource="dataSource"
                    :expression="form.fromScope2.expression"
                    :filterData="conditions"
                    fieldsSelectorType="selectUserInfo"
                    ref="allPurposeFilterRef"
                   
                />
            </el-form-item>

            <div class="title">
                {{ $t('permRule.secondTitle.chooseSharePerson') }}
            </div>
            <el-row>
                <el-form-item
                    :label="$t('permRule.shareTo')"
                    prop="toScope.dataRange"
                    label-width="auto"
                >
                    <el-select
                        v-model="form.toScope.dataRange"
                        :style="{ width: '150px' }"
                    >
                        <el-option
                            v-for="item in dataRangeOptions($t)"
                            :key="item.value"
                            :label="item.lable"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item
                    :label="$t('permRule.sharePersonEnd')"
                    prop="toScope.itemId"
                    label-width="auto"
                    class="should-reverse remove-before"
                >
                    <el-tree-select
                        v-model="form.toScope.itemId"
                        :data="departmentTree"
                        node-key="id"
                        value-key="name"
                        :props="{ children: 'list', label: 'name' }"
                        :render-after-expand="false"
                        :show-checkbox="true"
                        check-on-click-node
                        :expand-on-click-node="false"
                        check-strictly
                        :style="{ width: '240px' }"
                        :placeholder="$t('permRule.placeholder.department')"
                    />
                </el-form-item>
            </el-row>

            <div class="title">
                {{ $t('permRule.secondTitle.permission') }}
            </div>
            <el-form-item
                :label="$t('permRule.functionOperate')"
                prop="permissionType"
            >
                <el-select v-model="form.permissionType">
                    <el-option
                        v-for="item in permissionTypeOptions($t)"
                        :key="item.value"
                        :label="item.lable"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('permRule.ruleStatus')" prop="ruleStatus">
                <el-radio-group v-model="form.ruleStatus">
                    <el-radio :label="1">{{
                        $t('permRule.ruleStatusOption.open')
                    }}</el-radio>
                    <el-radio :label="0">{{
                        $t('permRule.ruleStatusOption.close')
                    }}</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="onCancel">{{ $t('cancel') }}</el-button>
                <el-button type="primary" @click="onSave">
                    {{ $t('save') }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { reactive, ref, computed, toRefs, nextTick } from 'vue';
import { permissionTypeOptions, dataRangeOptions, emptyFormData } from './data';
import { useDepartmentTree } from '@/pinia/modules/departmentTree.js'; // 引入部门树相关的数据
import { fields4meta, findRelFilterFields, findRelFilterFieldsRange, findListViewFilterFields, findListViewFilterFieldsRange } from '@/api/common.js'; // api请求
import { watch } from 'vue';
import AllPurposeFilter from '@/components/allPurposeFilter.vue';
import { assign, cloneDeep } from 'lodash';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const filterTyperef = ref(1);
const conditions = ref([]);

const department = useDepartmentTree();
const departmentTree = computed(() => {
    const tree = cloneDeep(department.SourceWidthOutMembers);
    // 禁止选中公司
    // tree[0] && (tree[0].disabled = true);
    return tree;
});
if (!departmentTree.value.length) {
    await department.apiForGetData();
}

const props = defineProps({
    visible: Boolean,
    title: String,
    curBizObj: Object,
    data: Object
});
const emits = defineEmits(['save', 'close']);

const fieldsSource = ref({});
const dataSource = ref({});

const allPurposeFilterRef = ref();

const formRef = ref();
const form = ref(cloneDeep(emptyFormData));
const isEdit = computed(() => !!form.value.id);

const resetFormData = () => {
    form.value = cloneDeep(emptyFormData);
};

const rules = reactive({
    ruleName: [
        {
            required: true,
            message: t('permRule.rule.ruleName'),
            trigger: 'blur'
        }
    ],
    ruleType: [{ required: true }],
    'fromScope1.dataRange': [{ required: true }],
    'fromScope1.itemId': [
        {
            required: true,
            message: t('permRule.rule.department'),
            trigger: 'change'
        }
    ],
    'toScope.dataRange': [{ required: true }],
    'toScope.itemId': [
        {
            required: true,
            message: t('permRule.rule.department'),
            trigger: 'change'
        }
    ]
});

const onClose = () => {
    emits('close');
};

const onCancel = () => {
    onClose();
};

const handleFilterData = (obj) => {
    let _searchCondition = {};
    let conditions = [];
    _searchCondition.filterType = obj.filterType;
    _searchCondition.expression = obj.expression;
    let vertical = true;
    // if(obj.filterType > 0) {
    //     if(obj.condition.length > 0) {
    vertical = obj.condition.every(item => {
        if (!item.searchField?.id) {
            ElMessage.error('请选择检索字段');
            return false;
        }
        // 检索条件为空，则不做校验
        if (![12, 13].includes(item.matchType)) {
            // 条件是值
            if (item.condMode === 1) {
                // 校验检索字段的值
                // 如果是选择范围，则校验范围值
                if (item.matchType === 11) {
                    if ((!item.values[0] && typeof(item.values[0]) !== 'number') || (!item.values[1] && typeof(item.values[1]) !== 'number')) {
                        ElMessage.error('检索字段的值不完整');
                        return false;
                    }
                } else {
                    if (!item.values[0] && typeof(item.values[0]) !== 'number') {
                        ElMessage.error('请选择检索字段的值');
                        return false;
                    }
                }
                // if(item.matchType === 11 && ((!item.values[0] && typeof(item.values[0]) !== 'number') && (!item.values[1] || typeof(item.values[1]) !== 'number'))) {
                //     ElMessage.error('检索字段的值不完整');
                //     return false;
                // } else {
                //     if(!item.values[0] && typeof(item.values[0]) !== 'number') {
                //         ElMessage.error('请选择检索字段的值');
                //         return false;
                //     }
                // }
            } else if (item.condMode === 0) {
                // 条件是字段，校验检索字段的值
                if (!item.searchRange?.id) {
                    ElMessage.error('请选择检索字段的值');
                    return false;
                }
            }
        }
        if (item.searchRange) {
            item.searchRange.condMode = item.condMode;
            item.searchRange.values = item.condMode === 1 ? item.values : null;
        }
        conditions.push({
            matchType: item.matchType,
            searchField: item.searchField,
            searchRange: [item.searchRange]
        });
        return true;
    });
    //     } else {
    //         vertical = false;
    //         ElMessage.error('请添加检索条件');
    //     }
        
    // } else {
    //     vertical = true;
    // }
    
    _searchCondition.conditions = conditions;
    console.log('重组后的数据：', _searchCondition);
    return vertical ? _searchCondition : false;
};
const onSave = () => {
    // 验证
    formRef.value?.validate((valid) => {
        if (valid) {
            const data = {};
            if (form.value.ruleType === 1) {
                // console.log('-----', allPurposeFilterRef.value.getOriginalData())
                const resData = allPurposeFilterRef.value.getOriginalData();
                let searchCondition = handleFilterData(resData);
                if (!searchCondition) return;
                // data.conditions = resData.condition.map(item => {
                //     item.searchRange = [{
                //         values: item.values,
                //         condMode: item.condMode
                //     }];
                //     delete item.values;
                //     return item;
                // });
                // data.expression = resData.expression;
                // data.filterType = resData.filterType;
                form.value.fromScope2 = searchCondition;
            }
            // console.log('条件：', data)
            emits('save', form.value);
        } else {
            console.log('valid failed, pls check the form');
        }
    });
};

watch(
    () => props.data,
    () => {
        if (props.data) {
            // console.log(props.data,'props.value');
            assign(form.value, props.data);
            nextTick(() => {
                filterTyperef.value = form.value.fromScope2?.filterType || 1;
                // console.log(form.value.fromScope2, 'form.valueform.value', filterTyperef.value );
            });
        }
    },
    {immediate: true}
);

watch(
    () => props.visible,
    () => {
        if (!props.visible) {
            formRef.value?.resetFields();
            resetFormData();
        } else {
            form.value.entityKey = props.curBizObj.entityKey;
            nextTick(() => {
                conditions.value = form.value.fromScope2?.conditions;
            });
            fieldsSource.value = {
                methods: findListViewFilterFields,
                methodsName: 'findListViewFilterFields',
                data: {
                    objectId: props.curBizObj.entityId,
                    layer: 0,
                    usageType: 4
                }
            };
            dataSource.value = {
                methods: findListViewFilterFieldsRange,
                methodsName: 'findListViewFilterFieldsRange',
                data: {
                    objectId: props.curBizObj.entityId,
                    layer: 0,
                    usageType: 4
                }
            };
           
        }
    },
    {immediate: true}

);
</script>

<style lang="scss" scoped>
.title {
    font-size: 14px;
    font-weight: 500;
    line-height: 14px;
    margin-bottom: 20px;
}
.m16{
    margin-bottom: 10px;
}
.scroll_elitem{
   // max-height: 400px;
   // overflow: auto;
}
.should-reverse {
    flex-flow: row-reverse;
    gap: 10px;
    margin-left: 10px;
}

</style>

<style lang="scss">
.xhl-el-form .remove-before .xhl-el-form-item__label::before {
    display: none;
}
</style>
