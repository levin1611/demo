<template>
    <el-dialog
        v-model="dialogVisible"
        :title="title"
        width="800px"
        height="660px"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @open="handleOpen"
        @closed="handleClosed"
        class="editRole"
    >
        <!-- loading 用的无意义 div -->
        <div ref="dialogBodyRef"></div>
        <el-steps :space="400" :active="step" finish-status="success" process-status="process" align-center>
            <el-step title="选择依赖关系字段" />
            <el-step title="设置选项依赖关系" />
        </el-steps>
        <div class="edit-dependent">
            <el-form
                v-if="step === 1"
                :model="formData"
                ref="formRef"
                label-width="90px"
                label-position="left"
                :rules="formRules"
                class="demo-ruleForm"
            >
                <el-form-item
                    prop="parentName"
                    label="父字段"
                >
                    <el-select
                        v-model="formData.parentName"
                        class="fliter-item"
                        size="large"
                        @change="changeParent"
                        style="width: 300px">
                        <el-option  v-for="v in parentFields" :label="v.displayName" :value="v.id" :key="v.id" />
                    </el-select>
                </el-form-item>
                <el-form-item
                    prop="childerName"
                    label="子字段"
                >
                    <el-select
                        v-model="formData.childerName"
                        class="fliter-item"
                        size="large"
                        style="width: 300px">
                        <el-option  v-for="v in childFields" :label="v.displayName" :value="v.id" :key="v.id" :disabled="v.disabled" />
                    </el-select>
                </el-form-item>
            </el-form>
            <div v-if="step === 2" class="select-field-box">
                <div>
                    <span>父字段：{{parentNameLabel}}</span>
                    <div class="field-box">
                        <el-input
                            v-model="searchValue"
                            placeholder="请输入搜索关键词"
                            @input="searchParentData"
                            style="margin: 0px 8px;width: 219px;"
                        >
                            <template #suffix>
                                <el-icon class="el-input__icon">
                                    <i class="custom  custom-journey-search"></i>
                                </el-icon>
                            </template>
                        </el-input>
                        <el-scrollbar height="312px">
                            <ul class="field-box-ul">
                                <li @click="selectParents(v, i)" v-for="(v, i) in data" :key="i" :class="{active: currentIndex === i}">
                                    {{v.displayName}}
                                    <span v-if="v.selectedOptions?.length > 0">已选 {{v.selectedOptions?.length}}</span>
                                </li>
                            </ul>
                        </el-scrollbar>
                    </div>
                </div>
                <span class="custom custom-arrow1"></span>
                <div>
                    <span>子字段：{{childerNameLabel}}</span>
                    <div class="field-box">
                        <el-input
                            v-model="searchChildrenValue"
                            placeholder="请输入搜索关键词"
                            @input="searchChildrenData"
                            style="margin:0px 8px;width: 219px;"
                        >
                            <template #suffix>
                                <el-icon class="el-input__icon">
                                    <i class="custom  custom-journey-search"></i>
                                </el-icon>
                            </template>
                        </el-input>
                        <el-scrollbar height="312px">
                            <ul class="field-box-ul">
                                <li @click="selectChildern(v, i)" v-for="(v, i) in data1" :key="i" :class="{active: currentIndex1 === i}">{{v.displayName}}</li>
                            </ul>
                        </el-scrollbar>
                    </div>
                </div>
                <span class="custom custom-arrow1"></span>
                <div class="field-box" style="margin-top: 32px;">
                    <span class="field-box-title">已选值</span>
                    <el-scrollbar height="312px">
                        <ul class="field-box-ul">
                            <li v-for="(v, i) in curField.selectedOptions" :key="i">
                                {{v.displayName}}
                                <span @click="deleteselect(v, i)" class="custom custom-trash1"></span>
                            </li>
                        </ul>
                    </el-scrollbar>
                </div>
            </div>
        </div>
        <!-- footer -->
        <template #footer>
            <div class="dialog-footer">
                <!-- cancel -->
                <el-button
                    v-if="step === 1"
                    @click="closeDialog"
                    class="useBrandColor"
                >{{ $t('cancel') }}</el-button>
                <el-button
                    v-if="step === 1"
                    type="primary"
                    @click="nexStep"
                >下一步</el-button>
                 <!-- confirm -->
                <el-button
                    v-if="step === 2"
                    @click="step = 1"
                    class="useBrandColor"
                >上一步</el-button>
                <el-button
                    v-if="step === 2"
                    type="primary"
                    @click="submit"
                >{{ $t('confirm') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>
<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue';
import useDialogCommon from '@/hooks/useDialogCommon';
import { getAllParentField, getAllChildField, getFieldOptions, addOptionRelation, getRelationDetail, editOptionRelation } from '@/api/fieldsSetting.js';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const currentSettingRow = inject('currentSettingRow');
// 取通用的 dialog 逻辑相关参数

// 接受外部传参
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    operateType: {
        type: String,
        default: 'new'
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

// 步骤
const step = ref(1);
onMounted(() => {
    getData();
    switch (props.operateType) {
        case 'new':
            step.value = 1
        case 'edit':
            step.value = 2
        default:
            return '';
    }
})

const {
    dialogVisible,
    closeDialog
} = useDialogCommon(props, emits);

// 弹框标题
const title = computed(() => {
    switch (props.operateType) {
        case 'new':
            return '新建字段依赖性';
        case 'edit':
            return '编辑字段依赖性';
        default:
            return '';
    }
});

// 取 dialog 组件 body ref
const dialogBodyRef = ref(null);

// 表单
const formRef = ref(null);

const formData = ref({
    parentName: '',
    childerName: ''
});

// 表单校验规则
const formRules = {
    parentName: [
        {required: true, message: t('emptyInputWarn', { name: '父字段' }), trigger: 'blur'}
    ],
    childerName: [
        {required: true, message: t('emptyInputWarn', { name: '子字段' }), trigger: 'blur'}
    ]
};

// 搜索变量
const searchValue = ref('');

// 搜索变量
const searchChildrenValue = ref('');

let childrenSource = [];
let parentSource = [];

const searchParentData = () => {
    if(searchValue.value) {
        data.value = parentSource.filter(item => item.displayName.includes(searchValue.value))
    } else {
        data.value = parentSource
    }
   
}
const searchChildrenData = () => {
    if(searchChildrenValue.value) {
        data1.value = childrenSource.filter(item => item.displayName.includes(searchChildrenValue.value))
    } else {
        data1.value = childrenSource
    }
}
// -----------------------------------------搜索End

const parentFields = ref([]);
const childFields = ref([]);

const parentNameLabel = ref('');
const childerNameLabel = ref('');

const data = ref([])

const data1 = ref([])

const data2 = reactive([])
// 弹框打开关闭回调
// 弹框打开前
const handleOpen = () => {
    data.value = [];
    data1.value = [];
    searchValue.value = '';
    searchChildrenValue.value = '';
    childrenSource = [];
    parentSource = [];
    curField.value = {};
    currentIndex.value = -1;
    currentIndex1.value = -1
    parentNameLabel.value = props.optionsData?.parentFieldName;
    childerNameLabel.value = props.optionsData?.childFieldName;
    formData.value.parentName = '';
    formData.value.childerName = '';
    switch (props.operateType) {
        case 'new':
            step.value = 1;
            break;
        case 'edit':
            step.value = 2;
            formData.value.parentName = props.optionsData.parentFieldId;
            formData.value.childerName = props.optionsData.childFieldId;
            getRelationDetail({
                childFieldId: props.optionsData.childFieldId,
                parentFieldId: props.optionsData.parentFieldId,
                objectId: currentSettingRow.value.id, // 对象id
            }).then(res => {
                if(res.code === 10000) {
                    data.value = res.data.parentOptions;
                    data1.value = res.data.childOptions;
                    childrenSource = res.data.childOptions;
                    parentSource = res.data.parentOptions;
                    currentIndex.value = res.data.parentOptions.findIndex(v => v.selectedOptions.length > 0);
                    curField.value = res.data.parentOptions.find(v => v.selectedOptions.length > 0);
                    // curField.value.selectedOptions = _selectOption.selectedOptions
                } else {
                    ElMessage.error(res.message);
                }
            })
            break;
        default:
            step.value = 1;
            break;
    }
}

const currentIndex = ref(-1); // 父字段选中索引
const currentIndex1 = ref(-1); // 子字段选中索引
const currentIndex2 = ref(-1); // 子字段选中索引

// 弹框关闭后
const handleClosed = () => {
    // 表单重置
    formRef.value?.resetFields();
};

const getData = () => {
    getAllParentField({
        objectId: currentSettingRow.value.id, // 对象id
    }).then(res => {
        if(res.code === 10000) {
            parentFields.value = res.data;
        } else {
            ElMessage.error(res.message);
        }
    })
    getAllChildField({
        objectId: currentSettingRow.value.id, // 对象id
    }).then(res => {
        if(res.code === 10000) {
            childFields.value = res.data;
        } else {
            ElMessage.error(res.message);
        }
    })
}

const changeParent = () => {
    childFields.value.map(v => v.disabled = v.id === formData.value.parentName);
}

const nexStep = () => {
    formRef.value?.validate(async (valid) => {
        if (valid) {
            step.value = 2;
            parentNameLabel.value = parentFields.value.find(item => item.id === formData.value.parentName)?.displayName;
            childerNameLabel.value = childFields.value.find(item => item.id === formData.value.childerName)?.displayName;
            getFieldOptions({
                objectId: currentSettingRow.value.id,
                parentFieldId: formData.value.parentName,
                childFieldId: formData.value.childerName,
            }).then(res => {
                if(res.code === 10000) {
                    res.data.parentOptions.map(v => v.selectedOptions = [])
                    data.value = res.data.parentOptions;
                    data1.value = res.data.childOptions;
                    childrenSource = res.data.childOptions;
                    parentSource = res.data.parentOptions;
                } else {
                    ElMessage.error(res.message);
                }
            })
            // getAllParentField({
            //     objectId: currentSettingRow.value.id, // 对象id
            // }).then(res => {
            //     if(res.code === 10000) {
            //         res.data.map(v => v.selectedOptions = [])
            //         data.value = res.data;
            //     } else {
            //         ElMessage.error(res.message);
            //     }
            // })
            // getAllChildField({
            //     objectId: currentSettingRow.value.id,
            // }).then(res => {
            //     if(res.code === 10000) {
            //         res.data.map(v => v.selectedOptions = [])
            //         data1.value = res.data;
            //     } else {
            //         ElMessage.error(res.message);
            //     }
            // })
        }
    })
}

const curField = ref({}) // 当前选中的父字段
// 父字段点击
const selectParents = (v, index) => {
    curField.value = v;
    currentIndex.value = index;
}

// 子字段点击
const selectChildern = (v, i) =>{
    if(!curField.value?.selectedOptions) {
        return;
    }
    // 判断子字段是否已经选中
    const index = curField.value.selectedOptions.findIndex(item => item.id === v.id);
    // 已经选中, 则删除
    index > -1 && curField.value.selectedOptions.splice(index, 1);
    index === -1 && data1.value.splice(i, 1);
    curField.value.selectedOptions.push(v);
    currentIndex1.value = index
}

// 删除已选项
const deleteselect = (v, index) => {
    curField.value.selectedOptions.splice(index, 1);
    data1.value.unshift(v);
}

const submit = async () => {
    if(data.value.find((item, index) => item.selectedOptions?.length)) {
        let relationDetailList = [];
        data.value.forEach(item => {
            if(item.selectedOptions?.length) {
                let _ids = [];
                item.selectedOptions.forEach(v => {
                    _ids.push(v.id);
                })
                relationDetailList.push({
                    childOptionIds: _ids,
                    parentOptionId: item.id
                })
            }
        })
        console.log(relationDetailList);
        switch (props.operateType) {
            case 'new':
                addOptionRelation({
                    childFieldId: formData.value.childerName,
                    objectId: currentSettingRow.value.id,
                    parentFieldId: formData.value.parentName,
                    relationDetailList: relationDetailList
                }).then(res => {
                    if(res.code === 10000) {
                        closeDialog();
                        emits('operateSuccess');
                    } else {
                        ElMessage.error(res.messageShow);
                    }
                })
                break;
            case 'edit':
                editOptionRelation({
                    childFieldId: formData.value.childerName,
                    objectId: currentSettingRow.value.id,
                    parentFieldId: formData.value.parentName,
                    relationDetailList: relationDetailList
                }).then(res => {
                    if(res.code === 10000) {
                        closeDialog();
                        emits('operateSuccess');
                    } else {
                        ElMessage.error(res.messageShow);
                    }
                })
                break;
            default:
                break;
        }
        console.log('选中的字段', data.value);
    } else {
        ElMessage.error('请选择对应关系');
    }
}
</script>
<style lang="scss" scoped>
.edit-dependent {
    height: 400px;
    text-align: center;
    .demo-ruleForm{
        width: 400px;
        margin: 30px auto 0px;
    }
    .select-field-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        text-align: left;
        margin-top: 12px;
    }
    .field-box{
        border: 1px solid #E4E7ED;
        padding-top: 8px;
        width: 241px;
        margin-top: 8px;
        height: 360px;
        .field-box-title {
            padding-left: 12px;
        }
        .custom-arrow1 {
            font-size: 14px;
            color:#A8ABB2;
        }
        .field-box-ul {
            height: 288px;
            li{
                padding: 7px 12px;
                text-align: left;
                display: flex;
                justify-content: space-between;
                cursor: pointer;
                align-items: center;
                span{
                    color: #A8ABB2;
                }
                &:hover, &.active{
                    color: #4285F2;
                    background-color: #F5F7FA ;
                }
            }
        }
    }
}
</style>