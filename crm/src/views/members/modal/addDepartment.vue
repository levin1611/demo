<!-- 添加部门弹窗 -->
<template>
    <el-dialog 
        :width="600"
        :modal="true"
        :append-to-body="true"

        :close-on-click-modal="false"
        v-model="props.dialogVisible" class="custom-class-add89" status-icon
        @close="closeDialog()" :title="isEdit? '编辑部门' : $t('departmentAndMember.createDepartment')">
        <main class="add_form_main">
            <el-form :model="formParams"
                     label-width="6em"
                     label-position="left"
                     ref="ruleFormRef"
                     :rules="rules">
                <el-form-item :label="$t('departmentAndMember.deptName')" prop="name">
                    <el-input
                        maxlength="50"
                        show-word-limit
                        placeholder="请输入部门名称"
                        v-model.trim="formParams.name" autocomplete="off" />
                </el-form-item>
                <el-form-item :label="$t('departmentAndMember.partDeptName')" prop="parentId">
                    <el-select v-model="formParams.parentId" placeholder="Please select a zone">
                        <el-option :label="item.name" v-for="item in parentOption" :key="item.id" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item :label="$t('departmentAndMember.deptType')" prop="type">
                    <el-select v-model="formParams.type"  placeholder="请选择部门类型">
                        <el-option label="普通部门" :value="0" />
                    </el-select>
                </el-form-item>

                <!-- 新增字段 -->
                <el-form-item label="部门分类">
                    <el-select v-model="formParams.specialType"  placeholder="请选择部门分类">
                        <el-option :label="item.name" v-for="item in specialTypeList" :key="item" :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="部门编码">
                    <el-input
                        maxlength="100"
                        show-word-limit
                        placeholder="请输入部门编码"
                        v-model.trim="formParams.departCode" autocomplete="off" />
                </el-form-item>


                <el-form-item :label="$t('departmentAndMember.deptManager')">
                    <el-select v-model="formParams.userIds"  filterable  placeholder="请选择部门主管">
                        <el-option :label="item.cnName" v-for="item in userIdsOptions" :key="item.id" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item prop="sortNo" :label="$t('departmentAndMember.sort')" class="noclear">
                    <el-input-number :min="0" :max="9999" :controls="false" v-model="formParams.sortNo" placeholder="排序（0～9999）">
                    </el-input-number>
                </el-form-item>
                <el-form-item :label="$t('departmentAndMember.remark')" prop="remark">
                    <el-input
                        maxlength="1000"
                        type="textarea"
                        placeholder="请输入备注"
                        validate-event
                        show-word-limit
                        v-model.trim="formParams.remark" autocomplete="off" />
                </el-form-item>
            </el-form>
        </main>
        <template #footer>
            <span class="dialog-footer resd">
                <el-button class="useBrandColor" @click="closeDialog()">{{$t('cancel')}}</el-button>
                <el-button type="primary" @click="submitForm(ruleFormRef)">
                    {{isEdit ? $t('save') : $t('confirm')}}
                </el-button>
            </span>
        </template>
    </el-dialog>

</template>
  
<script setup>
import { reactive, ref, watch, toRefs, toRef, shallowRef, shallowReactive, computed} from 'vue';
import { addDepartmentApi, departMentNameIsOk, editDepartmentApi, departmentUserNameList, departmentInfoListNoSub } from '@/api/department.js';
import { useUserStore } from '@/pinia/modules/user.js';

const store = useUserStore();
import { useDepartmentTree } from '@/pinia/modules/departmentTree.js'; // 引入部门树相关的数据
const treeDataStore = useDepartmentTree();
const treeSourceFloatMapWidthOutMembers = computed(() => treeDataStore.treeSourceFloatMapWidthOutMembers); // 部门树逻辑

const props = defineProps(['dialogVisible', 'currentNodeData']);
const emit = defineEmits(['update:dialogVisible', 'addDepartmentEmits']);
const isEdit = props.currentNodeData && props.currentNodeData.oprateType == 'edit'; // 是不是编辑模式
const ruleFormRef = ref(); // form表单的组件实例
let userIdsOptions = ref([]); // 部门主管的下拉选择列表
let specialTypeList = [{
    name: '内部部门',
    value: 1
},
{
    name: '外部部门',
    value: 0
}];
let parentOption = ref([]);
const formParams = reactive({ // form表单要提交的参数
    name: '', // 名称
    parentId: props.currentNodeData.id, // 父级部门
    type: 0, // 部门类型 type 0普通部门 1 单位
    userIds: '', // 部门主管
    sortNo: 0, // 排序
    remark: '',
    specialType: undefined,
    departCode: undefined
});
if (isEdit) {
    // 如果是编辑 则回显带过来的数据
    const { name, type, sortNo, remark, parentId, id, deptManageIds, specialType, departCode} = props.currentNodeData;
    formParams.name = name;
    formParams.type = type;
    formParams.sortNo = sortNo;
    formParams.remark = remark;
    formParams.parentId = parentId;
    formParams.id = id;
    // 新增字段
    formParams.specialType = specialType;
    formParams.departCode = departCode;
    departmentUserNameList({
        userId: store.userId,
        orgId: store.orgId,
        id: id
    }).then(res => {
        userIdsOptions.value = res.data;
        if (deptManageIds && deptManageIds.length) {
            formParams.userIds = Number(deptManageIds.toString());
        }
    });
    getParentOption();
} else {
    // 新建部门的时候查询父级部门选项
    parentOption.value = treeSourceFloatMapWidthOutMembers.value;

}


const rules = {
    // form表单校验规则
    name: [
        { required: true, message: '名称不能为空', trigger: 'blur' },
        {validator: valiPartName, trigger: 'blur'}
    ],
    parentId: [
        { required: true, message: '父级部门不能为空', trigger: 'change' }
    ],
    type: [
        { required: true, message: '部门类型不能为空', trigger: 'change' }
    ],
    remark: [
        { max: 1000, message: '长度不能超过1000', trigger: 'change' }
    ],
    sortNo: [
        { required: true, message: '排序不能为空', trigger: 'blur' }
    ]
};
const submitForm = async (formEl) => {
    // 提交表单 新增部门
    // 校验通过则提交
    if (!formEl) return;
    await formEl.validate((valid, fields) => {
        if (valid) {
            setDepartment();
        } else {
            console.log('error submit!', fields);
        }
    });
};
 
async function setDepartment() {
    // 新增/编辑部门信息
    const data = {
        userId: store.userId,
        orgId: store.orgId,
        ...formParams,
        userIds: [formParams.userIds],
        sortNo: formParams.sortNo || 0
    };
    if (data.id == data.parentId) {
        ElMessage('部门与父级部门不能为同一个');
        return;
    }
    let response = null;
    // 编辑 与 新增逻辑判断
    response = isEdit ? await editDepartmentApi(data) : await addDepartmentApi(data);
    if ( response.code == 10000) {
        emit('addDepartmentEmits');
        ElMessage('部门信息保存成功');
        closeDialog();
    } else {
        ElMessage(response.messageShow);
    }
 
}
function closeDialog() {
    // 关闭modal弹窗
    emit('update:dialogVisible', false);
}
async function valiPartName(rule, value, callback) {
    // 校验名称字段是否重复
    // console.log(rule, value);
    const responce = await new Promise((reslove, reject) => {
        departMentNameIsOk({
            userId: store.userId,
            orgId: store.orgId,
            name: value,
            id: isEdit ? props.currentNodeData.id : null // 如果是编辑需要传递一下部门id
        }).then(res => {
            reslove(res.data); // false 就代表没有重复 true 就是重复
        });
    });
    !responce ? true : callback('此名称已存在');
}

function getParentOption() {
    // 编辑部门的时候查询父级部门选项
    departmentInfoListNoSub({
            userId: store.userId,
            orgId: store.orgId,
            id: props.currentNodeData.id  // 如果是编辑需要传递一下部门id
    }).then(res => {
    if ( res.code == 10000) {
        parentOption.value = res.data;
    } else {
        Elmessage.warning('查询父级部门选项失败，请稍后重试')
    }
    })
}

</script>
  
<style scoped lang="scss">
@import 'el_form'; 
:deep {
    .noclear{
        .#{$elnamespace}-input__clear{
            display: none;
        }
    }
   
} 
</style>
<style lang="scss">
.custom-class-add89 {
   .#{$elnamespace}-dialog__header{
        position: relative;
        height: unset;
        width: unset;
   }
}
</style>

  