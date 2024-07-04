<!-- 添加部门弹窗 -->
<template>
    <el-dialog 
        :width="800"
        :append-to-body="true"
        :close-on-click-modal="false"
        v-model="props.dialogVisible" class="custom-class-add89" status-icon
        @close="closeDialog()" :title="isEdit? '编辑成员' : $t('departmentAndMember.createUser')">
        <main class="add_form_main">
            <el-form :model="formParams"
                     :label-width="90"
                     ref="ruleFormRef"
                     label-position="left"
                     :rules="rules">
                <el-row :gutter="20">
                    <el-col  :span="12">
                        <el-form-item :label="$t('departmentAndMember.cnName')" prop="cnName">
                            <el-input
                                maxlength="50"
                                show-word-limit
                                placeholder="请输入姓名"
                                v-model.trim="formParams.cnName" autocomplete="off" />
                        </el-form-item>
                        <el-form-item :label="$t('departmentAndMember.email')" prop="email">
                            <el-input
                                show-word-limit
                                maxlength="50"
                                placeholder="请输入邮箱"
                                v-model.trim="formParams.email" autocomplete="off" />
                        </el-form-item>
                        <el-form-item :label="$t('departmentAndMember.department')" prop="departmentId">
                            <cetselect
                                :disabled="!isEdit || currentRow.isAdmin"
                                v-model:dataValue="formParams.departmentId"
                                :treeData="SSBM"
                                @cilckCurrDepartment="cilckCurrDepartment"
                                placeholder="请选择所属部门"
                            >

                            </cetselect>
                        </el-form-item>
                        <el-form-item :label="$t('departmentAndMember.SQJS')" >
                            <el-select
                                v-model="formParams.roleIds"
                                multiple
                                filterable
                                :disabled="currentRow.isAdmin"
                                collapse-tags
                                collapse-tags-tooltip
                                placeholder="请选择授权角色"
                                style="width: 100%"
                                class="custom_tag"
                            >
                                <el-option
                                    v-for="item in SQJEoptions"
                                    :key="item.id"
                                    :label="item.nameCn"
                                    :value="item.id"
                                />
                            </el-select>
                           
                        </el-form-item>
                        <el-form-item :label="$t('departmentAndMember.ZSZG')" >
                            <cetselectmuliple
                                v-model:dataValue="formParams.directLeaderIds"
                                :treeData="ZSZG"
                                :disabled="currentRow.isAdmin"
                                placeholder="请选择直属主管"
                            >
                            </cetselectmuliple>
                           
                        </el-form-item>
                        <!-- 新增字段 -->
                        <el-form-item label="出生日期" >
                            <el-date-picker
                                v-model="formParams.userBirthday"
                                type="date"
                                style="width: 100%"
                                value-format="x"
                                placeholder="请选择出生日期"
                            />
                           
                        </el-form-item>
                        <el-form-item label="入职日期" >
                            <el-date-picker
                                v-model="formParams.joinTime"
                                type="date"
                                style="width: 100%"
                                value-format="x"
                                placeholder="请选择入职日期"
                            />
                        </el-form-item>
                        <!-- <el-form-item label="币种" >
                            <el-select v-model="formParams.currency"  placeholder="请输入币种">
                                <el-option :label="item.currencyName"   :value="item.currencyNo" :key="item.currencyNo" v-for="item in currencyOptions"/>
                            </el-select>
                        </el-form-item> -->
                        <el-form-item label="QQ/MSN" >
                            <el-input
                                show-word-limit
                                maxlength="50"
                                placeholder="请输入QQ/MSN"
                                v-model.trim="formParams.im" autocomplete="off" />
                           
                        </el-form-item>
                       
                        <el-form-item :label="$t('departmentAndMember.jobLevel')" >
                            <el-select v-model="formParams.jobLevel" placeholder="请选择职级">
                                <el-option :label="item.attrName"   :value="item.id" :key="item.id" v-for="item in jobLevelOptions"/>
                            </el-select>
                        </el-form-item>
                     
                    </el-col>

                    <el-col :span="12" >
                        <el-form-item :label="$t('departmentAndMember.enName')" prop="enName">
                            <el-input
                                maxlength="50"
                                show-word-limit
                                placeholder="请输入英文名"
                                v-model="formParams.enName" autocomplete="off" />
                        </el-form-item>
                        <el-form-item :label="$t('departmentAndMember.mobile')" prop="mobile">
                            <el-input
                                show-word-limit
                                placeholder="请输入手机号"
                                v-model.trim="formParams.mobile" autocomplete="off" />
                        </el-form-item>
                        <el-form-item :label="$t('departmentAndMember.relationDept')">
                            <cetselectmuliple
                                v-model:dataValue="formParams.relatedDepartmentIds"
                                :treeData="XGBM"
                                :checkStrictly="true"
                                placeholder="请选择相关部门"

                            >
                            </cetselectmuliple>
                        </el-form-item>
                        <el-form-item :label="$t('departmentAndMember.employeeNo')">
                            <el-input
                                maxlength="50"
                                show-word-limit
                                placeholder="请输入员工编号"
                                v-model.trim="formParams.employeeNo" autocomplete="off" />
                        </el-form-item>

                        <el-form-item :label="$t('departmentAndMember.jobTitle')">
                            <el-select v-model="formParams.jobTitle"  placeholder="请选择职位">
                                <el-option :label="item.attrName"   :value="item.id" :key="item.id" v-for="item in jobTitleOptions"/>
                            </el-select>
                        </el-form-item>
                        <!-- 新增字段 -->
                        <el-form-item label="企业微信" >
                            <el-input
                                show-word-limit
                                maxlength="50"
                                placeholder="请输入企业微信"
                                v-model.trim="formParams.weChat" autocomplete="off" />
                           
                        </el-form-item>
                        <el-form-item label="微博" >
                            <el-input
                                show-word-limit
                                maxlength="50"
                                placeholder="请输入微博"
                                v-model.trim="formParams.weibo" autocomplete="off" />
                        </el-form-item>
                        <!-- <el-form-item label="语言编码" >
                            <el-input
                                show-word-limit
                                maxlength="50"
                                placeholder="请输入语言编码"
                                v-model.trim="formParams.languageCode" autocomplete="off" />
                        </el-form-item> -->
                        <!-- <el-form-item label="时区" >
                            <el-select v-model="formParams.timezone"  placeholder="请输入时区">
                                <el-option :label="item.attrName"   :value="item.id" :key="item.id" v-for="item in jobTitleOptions"/>
                            </el-select>
                        </el-form-item> -->
                       
                        <!-- <el-form-item label="Swift号" >
                            <el-input
                                show-word-limit
                                maxlength="50"
                                placeholder="请输入Swift号"
                                v-model.trim="formParams.swift" autocomplete="off" />
                        </el-form-item> -->
                        <el-form-item :label="$t('departmentAndMember.gender')">
                            <el-radio-group v-model="formParams.gender" class="ml-4">
                                <el-radio label="0" size="large">未知</el-radio>
                                <el-radio label="1" size="large">男</el-radio>
                                <el-radio label="2" size="large">女</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item :label="$t('departmentAndMember.remark')"  prop="remark">
                            <el-input
                                maxlength="1000"
                                show-word-limit
                                placeholder="请输入备注"
                                type="textarea"
                                v-model.trim="formParams.remark" autocomplete="off" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
        </main>
        <template #footer>
            <span class="dialog-footer">
                <el-button class="useBrandColor" @click="closeDialog()">{{$t('cancel')}}</el-button>
                <el-button type="primary" @click="submitForm(ruleFormRef)">
                    {{isEdit ? $t('save') : $t('confirm')}}
                </el-button>
            </span>
        </template>
    </el-dialog>
    <el-dialog
        v-model="secondConfirm"
        :append-to-body="true"
        width="30%"
    >
        <span>该成员账号将不再是之前部门的部门主管，并且在新部门中默认是普通成员</span>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="secondConfirm = false">{{$t('cancel')}}</el-button>
                <el-button type="primary" @click="setUserInfo">
                    {{$t('confirm')}}
                </el-button>
            </span>
        </template>
    </el-dialog>

</template>
  
<script setup>
import { reactive, ref, watch, toRefs, toRef, shallowRef, shallowReactive, toRaw, computed, onMounted} from 'vue';
import {getDepartmentDataTree} from '@/api/department.js';
import { setUserInfoByUserId, addUserInfo, getUserAttrInfoList, getImmediateSuperUserTree, getUserDirectManageList, getCurrencyTypes } from '@/api/members.js';
import {formateIdsByObject} from '@/views/members/hooks.js'; // 格式化表格数据
import { getAllRole } from '@/api/role.js'; // 角色相关api请求
import Utils from '@/utils/index.js';
import { t, changeLang } from '@/locale';
import { CODESTATE } from '@/https/codeConfig';


import { useUserStore } from '@/pinia/modules/user.js';

const store = useUserStore();

import { cetselect, cetselectmuliple } from 'xhl_lib';

import { useDepartmentTree } from '@/pinia/modules/departmentTree.js'; // 引入部门树相关的数据
const treeDataStore = useDepartmentTree();

const SourceWidthOutMembers = treeDataStore.SourceWidthOutMembers; // 没成员的树结构数据
let XGBM = reactive(JSON.parse(JSON.stringify(toRaw(SourceWidthOutMembers)))) ; // 相关部门渲染的数据
let SSBM = reactive(JSON.parse(JSON.stringify(toRaw(SourceWidthOutMembers)))) ; // 所属部门渲染的数据

const jobTitleOptions = ref([]); // 职位的 下拉选项
const jobLevelOptions = ref([]); // 职级的 下拉选项
const secondConfirm = ref(false); // 是否打开二次确认弹窗
const props = defineProps(['dialogVisible', 'currentSelectMember', 'currentRow']);
const {currentRow} = props; // 结构
const SQJEoptions = ref([]); // 授权角色的选项
const emit = defineEmits(['update:dialogVisible', 'addMembersEmits']);
const ruleFormRef = ref(); // form表单的组件实例
const isEdit = currentRow && currentRow.oprateType == 'editInfo'; // 编辑操作
const currencyOptions = ref([]); // 币种选项
let ZSZG = ref([]) ; // 直属主管
await getSSBMByPost(); // 查询所属部门

let formParams = reactive({ // form表单要提交的参数
    cnName: '', // 中文名称
    email: '', // 邮箱
    departmentId: props.currentSelectMember, // 所属部门
    directLeaderIds: [], // 直属主管
    jobLevel: '', // 职级
    gender: '0', // 性别
    enName: '', // 英文名字
    mobile: '', // 手机号
    relatedDepartmentIds: [], // 相关部门
    employeeNo: '', // 员工编号
    jobTitle: '', // 职位
    remark: '', // 备注
    roleIds: [], // 授权角色
    userBirthday: undefined,
    joinTime: undefined,
    im: undefined,
    weChat: undefined,
    weibo: undefined,
    languageCode: undefined,
    timezone: undefined,
    // currency: undefined,
    swift: undefined
});

// 校验规则
// 手机号检验规则
const validePhone = (rule, value, callback) => {
    // 判断输入框是否为空或者输入框长度是否为11
    if (!value || value.length !== 11) {
        // 如果为空或者长度不为11，则报错，提示错误信息
        callback(new Error(t('per_setting.err_phoneFormat')));
    } else {
        // 获取正则表达式
        const telReg = Utils.regExp.tell;
        // 判断输入框是否符合正则表达式
        if (!telReg.test(value)) {
            // 如果不符合，则报错，提示错误信息
            callback(new Error(t('per_setting.err_phoneFormat')));
        } else {
            // 如果符合，则通过验证
            callback();
        }
    }
};
// 校验邮箱
const valideVerificationeEmail = async (rule, value, callback) => {
    // 获取正则表达式
    const telReg = Utils.regExp.fullEmail;
    // 判断输入框是否符合正则表达式
    if (!telReg.test(value)) {
        // 如果不符合，则报错，提示错误信息
        callback(new Error('请输入正确的邮箱'));
    } else {
        // 如果符合，则通过验证
        callback();
    }
};
const rules = {
    // form表单校验规则
    cnName: [
        { required: true, message: '名称不能为空', trigger: 'blur' }
    ],
    enName: [
        { required: true, message: '名称不能为空', trigger: 'blur' }
    ],
    mobile: [
        // { required: true, message: '手机号不能为空', trigger: 'blur' }
        { validator: validePhone, trigger: 'blur', required: true }

    ],
    email: [
        // { required: true, message: '邮箱不能为空', trigger: 'blur' }
        { validator: valideVerificationeEmail, trigger: 'blur', required: true}

    ],
    departmentId: [
        { required: true, message: '所属部门不能为空', trigger: 'change' }
    ],
    remark: [
        { max: 1000, message: '长度不能超过1000', trigger: 'change' }
    ]
};
const submitForm = async (formEl) => {
    console.log(formParams);
    // 提交表单 新增部门
    // 校验通过则提交
    if (!formEl) return;
    await formEl.validate((valid, fields) => {
        if (valid) {
            // 编辑模式 currentRow.managerDept 有值就代表是部门主管
            if (isEdit && currentRow && currentRow.managerDept && (currentRow.departmentId != formParams.departmentId)) {
                // 是部门主管  所属部门发生变化 弹出二级确认弹窗
                secondConfirm.value = true;
            } else {
                setUserInfo();
            }
        } else {
            console.log('error submit!', fields);
        }
    });
};
 
async function setUserInfo() {
    // const currencyName = currencyOptions.value.find(ele => ele.currencyNo == formParams.currency);
    // 新增/编辑部门信息
    const data = {
        userId: store.userId,
        orgId: store.orgId,
        operatorId: store.userId,
        ...formParams
        // currencyName: currencyName?.currencyName
        
    };
    let response = null;
    // 编辑 与 新增逻辑判断
    response = isEdit ? await setUserInfoByUserId(data) : await addUserInfo(data);
    if ( response.code == 10000) {
        emit('addMembersEmits');
        if (isEdit) {
            ElMessage.success('成员信息保存成功');
        } else {
            ElMessage.success('成员新建成功，请到邮箱点击链接完成账号注册');
        }
        closeDialog();
    } else {
        ElMessage(response.messageShow);
    }
 
}
function closeDialog() {
    // 关闭modal弹窗
    emit('update:dialogVisible', false);
}


function setXGBMDisabled() {
    // 设置相关部门的禁用
    unDisaleTree(XGBM); // 解除部门树的禁用
    if (!formParams.departmentId) return;
    disbaleTree(XGBM, formParams.departmentId); // 设置部门树禁用
}


function setSSBMDisabled() {
    unDisaleTree(SSBM); // 解除所属部门树的禁止点击
    if (!formParams.relatedDepartmentIds.length) return;
    formParams.relatedDepartmentIds.forEach(id => {
        disbaleTree(SSBM, id); // 设置所属部门树的禁止点击
    });
}
function disbaleTree(array, id) {
    array.forEach((item) => {
        // item.disabled = false;
        if (item.id == id) {
            item.disabled = true;
        }
        // if (item.disabled && Array.isArray(item.list)) {
        //     item.list.forEach(ele => {
        //         ele.disabled = true;
        //     });
        // }
        if (Array.isArray(item.list) && item.list.length) {
            disbaleTree(item.list, id); // 如果当前元素也是数组，则递归调用自身
        } 
    });
}
function disbaleTreeByEmpty(array, deptManageIds) {
    array.forEach((item) => {
        if (deptManageIds && deptManageIds.includes(item.id)) {
            // 将当前所选部门的默认主管禁用
            item.disabled = true;
        }
        if (item.infoType == 0 && item.list.length == 0) {
            // 没有子集 并且不是成员的 则禁止选择
            item.disabled = true;
        } else if (Array.isArray(item.list) && item.list.length) {
            disbaleTreeByEmpty(item.list, deptManageIds); // 如果当前元素也是数组，则递归调用自身
        } 
    });
}
function cilckCurrDepartment(data) {
    // 所属主管当前选中的主管发生变化
    console.log('当前选中的部门主管', data);
    if (!isEdit) {
        // 如果是新建
        formParams.directLeaderIds = data.deptManageIds ? data.deptManageIds : [];
    } 
    getPartDataOfTree(data);
    // 设置相关部门的禁用
    setXGBMDisabled();
}

function getZSZGBySSBM(data) {
    // 根据所属部门查询直属主管并且回填
    getUserDirectManageList({
        'orgId': store.orgId, 
        'operatorId': store.userId, 
        'id': currentRow && currentRow.id,
        departmentId: data.id, 
        'relatedDepartmentIds': formParams.relatedDepartmentIds
    }).then(res => {
        // console.log(res.data, 'ddd');
        if (res.code == CODESTATE.SUCCESS) {
            formParams.directLeaderIds = res.data.map(ele => ele.userId);
        } else {
            formParams.directLeaderIds = [];
        }
    });
}

watch((computed(() => formParams.relatedDepartmentIds)), (v) => {
    // console.log('相关部门变化，禁用对应的所属部门', v);
    setSSBMDisabled();
    
});
function unDisaleTree(array) {
    array?.forEach((item) => {
        item.disabled = false;
        if (Array.isArray(item.list) && item.list.length) {
            unDisaleTree(item.list); // 如果当前元素也是数组，则递归调用自身
        } 
    });
}

// 获取职位列表
const getAttrInfoList = (type) => {
    getUserAttrInfoList({
        orgId: store.orgId,
        type // 职级:1 职位:2
    }).then(res => {
        if (res.code == CODESTATE.SUCCESS) {
            if (type == 2) {
                // 职位
                jobTitleOptions.value = res.data;
            } else if (type == 1) {
                // 职级
                jobLevelOptions.value = res.data;
            }
        } else {
            ElMessage.error(res.messageShow);
        }
    }).catch(err => {
        console.error(err);
        ElMessage.error(err.messageShow);
    });
};

function getPartDataOfTree(data) {
    // 查询部分树数据 数据中排出所属部门和相关部门的数据
    let selectId = [];
    if (isEdit && currentRow && currentRow.id) {
        selectId.push(currentRow.id);
    }
    getImmediateSuperUserTree({
        userId: store.userId,
        orgId: store.orgId, 
        selectUserId: selectId,
        id: formParams.departmentId
    }).then((res) => {
        ZSZG.value = extend(res.data);
        if (data) {
            // 有部门deptManageIds 需要禁用 对应的id
            disbaleTreeByEmpty(ZSZG.value, data.deptManageIds);
            
        }
        if (isEdit) {
            // 编辑模式 回填 直属主管
            getZSZGBySSBM(data);
        }

        
    });
}
function extend(origin) {
    // false  浅拷贝
    let obj = {};
    // 数组对象
    if (origin instanceof Array) {
        // 数组  obj 就得是数组
        obj = [];
    }
    // if (origin !== null && typeof origin === 'object' && origin.infoType == 1 ) return;
    

    for (let key in origin) {
        let value = origin[key];
        obj[key] = (typeof value === 'object' && value !== null) ? extend(value) : value;
    }
    // 返回的数据中 userList是成员的数据， list则是部门的数据 那就将 userlist添加到list后面组成全部的数据
    if (obj.userList && obj.userList.length) {
        obj.list = obj.list.concat(obj.userList);
    }
    if (obj instanceof Array) {
        obj = obj.filter(ele => ele != undefined);
    }
    return obj;
}
function getEditInfo() {
    // 回填写编辑的信息
    if (isEdit) {
        const {cnName, email, departmentId, jobLevel, 
            directLeaders, gender, enName, mobile, 
            relatedDepartmentIds, roles, 
            relatedDepartments, employeeNo, jobTitle, 
            remark, roleIds, id, userBirthday,
            joinTime,
            im, weChat, weibo, languageCode,
            timezone, currency, swift} = currentRow;
        formParams.cnName = cnName;
        formParams.email = email;
        // formParams.directLeaderIds = formateIdsByObject(directLeaders);
        formParams.departmentId = departmentId;
        formParams.jobLevel = jobLevel ? Number(jobLevel) : '';
        formParams.gender = String(gender);
        formParams.enName = enName;
        formParams.mobile = mobile;
        formParams.relatedDepartmentIds = formateIdsByObject(relatedDepartments);
        formParams.employeeNo = employeeNo;
        formParams.jobTitle = jobTitle ? Number(jobTitle) : '';
        formParams.remark = remark;
        formParams.roleIds = formateIdsByObject(roles);
        formParams.id = id;
        // 新增字段
        formParams.userBirthday = userBirthday,
        formParams.joinTime = joinTime;
        formParams.im = im,
        formParams.weChat = weChat,
        formParams.weibo = weibo,
        formParams.languageCode = languageCode,
        formParams.timezone = timezone,
        // formParams.currency = currency,
        formParams.swift = swift;
    }
}

function getCurrencyTypesMethods() {
    // 查询所有币种
    getCurrencyTypes().then(res => {
        console.log(res);
        currencyOptions.value = res.data;
    });
}

async function getSSBMByPost() {
    if(!isEdit) return;
    // 编辑模式查询 相关部门
    let selectId = [];
    if (currentRow && currentRow.id) {
        selectId.push(currentRow.id);
    }
    let res =  await getDepartmentDataTree({
            userId: store.userId,
            orgId: store.orgId,
            selectUserId: selectId
    })
    SSBM = reactive(res.data);
    return Promise.resolve('ok')
    // console.log(res);
}
onMounted(async () => {
    setSSBMDisabled(); // 设置所属部门的禁选
    getAttrInfoList(1);
    getAttrInfoList(2);
    getAllRole({
        userId: store.userId,
        orgId: store.orgId,
        flag: 3,
        pageFlag: false
    }).then(res => {
        // console.log(res);
        SQJEoptions.value = res.data;
        if (!isEdit) {
            // 如果是新建 默认回填普通成员
            formParams.roleIds = [res.data.find(ele => ele.nameCn == '普通成员').id];
        }
    });
    // getCurrencyTypesMethods();
    getEditInfo();
    
});
 

</script>
  
<style scoped lang="scss">
@import 'el_form'; 

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

  