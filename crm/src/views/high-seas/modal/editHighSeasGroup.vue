<!-- 公海设置 - 自动退回规则 - 排除规则 - 新增编辑规则弹框 -->
<template>
    <el-dialog 
        v-model="visible"
        v-loading="loading"
        :title="$t(title)"
        :width="800"
        top="12vh"
        :close-on-click-modal="false"
        append-to-body
        @close="closeDialog"
        class="editHighSeasGroup"
    >
        <!-- body -->
        <div class="editHighSeasGroup-body">
            <el-form
                :model="formData"
                :rules="formRules"
                :label-width="145"
                label-position="left"
                ref="formRef"
                class="editHighSeasGroup-form"
            >
                <!-- 规则名称 -->
                <el-form-item
                    prop="name"
                    :label="$t('highSeas.groupName')"
                >
                    <el-input
                        v-model="formData.name"
                        show-word-limit
                        maxlength="300"
                        :placeholder="$t('placeholder')"
                        @blur="formData.name = formData.name.trim()"
                    ></el-input>
                </el-form-item>
                <!-- 程序识别名称 -->
                <el-form-item
                    prop="apiKey"
                    :label="$t('highSeas.programSignName')"
                >
                    <el-input
                        v-model="formData.apiKey"
                        :disabled="Boolean(ruleData.id)"
                        show-word-limit
                        maxlength="100"
                        :placeholder="$t('placeholder')"
                        @blur="formData.apiKey = formData.apiKey.trim()"
                    ></el-input>
                </el-form-item>
                <!-- 分组数据管理员 -->
                <el-form-item
                    prop="managerList"
                    :label="$t('highSeas.groupDataManager')"
                >
                    <!-- 选择成员 -->
                    <applicableMember
                        v-if="initFlag"
                        ref="managerSelRef"
                        :tabs="memberSelTabs"
                        activeTabProp="members"
                        :defaultData="formData.managerList"
                        @emitLoadingDone="handleMemberLoaded"
                        @delSelItem="handleManagerSelOver"
                        @after-leave="handleManagerSelOver"
                    ></applicableMember>
                </el-form-item>
                <!-- 分组数据负责人 -->
                <el-form-item
                    prop="managerId"
                    :label="$t('highSeas.groupDataPrincipal')"
                >
                    <el-select
                        v-model="formData.managerId"
                        :placeholder="$t('placeholder_select')"
                        filterable
                    >
                        <!-- 空数据插槽 -->
                        <template #empty>{{ $t('highSeas.needGroupDataManagerTip') }}</template>

                        <el-option
                            v-for="user in formData.managerList"
                            :key="user.id"
                            :label="user.name"
                            :value="user.id"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <!-- 分组成员 -->
                <el-form-item
                    :label="$t('highSeas.groupMembers')"
                >
                    <!-- 选择成员 -->
                    <applicableMember
                        v-if="initFlag"
                        ref="memberSelRef"
                        :tabs="memberSelTabs"
                        activeTabProp="members"
                        :defaultData="formData.members"
                    ></applicableMember>
                </el-form-item>
                <!-- 分组部门 -->
                <el-form-item
                    :label="$t('highSeas.groupDepartments')"
                >
                    <!-- 选择成员 -->
                    <applicableMember
                        v-if="initFlag"
                        ref="departmentSelRef"
                        :tabs="departmentSelTabs"
                        activeTabProp="department"
                        :defaultData="formData.departments"
                    ></applicableMember>
                </el-form-item>
                <!-- 更改分组规则 -->
                <el-form-item
                    prop="memberReturnFlag"
                    :label="$t('highSeas.allowUpdateGroupByRule')"
                >
                    <el-checkbox
                        v-model="formData.memberReturnFlag"
                        :true-value="1"
                        :false-value="0"
                        :label="$t('highSeas.allowOtherUserTranferInto')"
                    /> 
                </el-form-item>
                <!-- 描述 -->
                <el-form-item
                    prop="description"
                    :label="$t('description')"
                >
                    <el-input
                        v-model="formData.description"
                        type="textarea"
                        show-word-limit
                        maxlength="2000"
                        :placeholder="$t('placeholder')"
                        @blur="formData.description = formData.description.trim()"
                    ></el-input>
                </el-form-item>
            </el-form>
        </div>

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
                >{{ ruleData.id ? $t('save') : $t('confirm') }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { getHighSeasGroupDetail, addHighSeasGroup, updateHighSeasGroup } from '@/api/highSeas.js';

// inject
const currentSettingRow = inject('currentSettingRow');
// model
const visible = defineModel('visible');
// props
const props = defineProps({
    ruleData: {
        type: Object,
        default: () => ({})
    }
});
// emits
const emit = defineEmits(['operateSuccess']);

// 全局
// loading
const loading = ref(false);
// 多语言
const { t } = useI18n();

// 数据获取
const getData = async () => {
    loading.value = true;
    const res = await getHighSeasGroupDetail({
        id: props.ruleData.id
    });
    if (res.code === 10000) {
        handleData(res.data);
        initFlag.value = true;
    } else {
        ElMessage.error(res.messageShow);
    }
    loading.value = false;
};
// 解析接口返回数据
const handleData = (data) => {
    formData.value.name = data.name || '';
    formData.value.apiKey = data.apiKey || '';
    const managerList = [];
    const departments = [];
    const members = [];
    props.ruleData.idAndNameDtoList.forEach(item => {
        if (item.type === 1) {
            item.isManager ? managerList.push(item) : members.push(item);
        } else if (item.type === 3) {
            departments.push(item);
        }
    });
    formData.value.managerList = managerList;
    formData.value.managerId = data.managerId || '';
    formData.value.members = members || [];
    formData.value.departments = departments || [];
    formData.value.memberReturnFlag = data.memberReturnFlag || 0;
    formData.value.description = data.description || '';
};

// title
const title = computed(() => props.ruleData.id ? 'highSeas.editHighSeasGroup' : 'highSeas.addHighSeasGroup');

// form
// 表单 ref
const formRef = ref(null);
// 表单数据
const formData = ref({
    name: '', // 公海分组的名称
    apiKey: '', // 程序识别名称
    managerList: [], // 分组管理员
    managerId: '', // 分组数据负责人
    members: [], // 分组成员
    departments: [], // 分组部门
    memberReturnFlag: 0, // 是否允许非本组成员退回数据, 0-否, 1-是
    description: '' // 描述信息
});
// 表单校验规则
const formRules = {
    name: [
        { required: true, message: t('emptyInputWarn', { name: t('highSeas.groupName') }), trigger: 'blur' }
    ],
    apiKey: [
        { required: true, message: t('emptyInputWarn', { name: t('highSeas.programSignName') }), trigger: 'blur' }
    ],
    managerList: [
        { required: true, message: t('emptyInputWarn', { name: t('highSeas.groupDataManager') }), trigger: 'blur' }
    ],
    managerId: [
        { required: true, message: t('emptyInputWarn', { name: t('highSeas.groupDataPrincipal') }), trigger: 'change' }
    ],
    memberReturnFlag: [
        { required: true }
    ]
};
// 分组数据管理员
// 成员选择组件是否可加载标识
const initFlag = ref(false);
// 成员选择组件 ref
const managerSelRef = ref(null);
// 成员选择组件 tabs
let memberSelTabs = [
    {
        name: 'members',
        label: '成员',
        inputType: 'select',
        type: 1
    }
];
// 成员选择组件 数据请求完毕 -- 本来是后端只给 id , 所以前端拿到用户列表后匹配下显示用户名字, 但现在直接都返回了, 好像没必要要这个了
const handleMemberLoaded = () => {
    formData.value.managerList = formData.value.managerList.map(item => {
        const member = (memberSelTabs[0].data || []).find(user => user.id === item.id);
        return member || item;
    });
    handleManagerSelOver();
};
// 成员选择完毕
const handleManagerSelOver = async () => {
    // 暂存老数据 length
    const oldManagerListLength = formData.value.managerList.length;

    // 取成员数据
    formData.value.managerList = await new Promise((resolve) => {
        setTimeout(() => {
            resolve(managerSelRef.value.getCheckData());
        }, 0);
    });

    // 已选成员数据中不包含数据负责人, 则去掉原数据负责人
    if (formData.value.managerId && !formData.value.managerList.find(i => i.id === formData.value.managerId)) {
        formData.value.managerId = '';
        // 执行表单校验, 显示错误信息
        formRef.value.validateField('managerId', () => {});
    }

    // 执行表单校验
    if (oldManagerListLength === 0 && formData.value.managerList.length === 0) {
        // 如果操作前后成员数据都为空, 则不用执行表单校验 --- 主要是避免新建时就直接显示错误信息了
    } else {
        formRef.value.validateField('managerList', () => {});
    }
};
// 分组成员
// 成员选择组件 ref
const memberSelRef = ref(null);
// 分组部门
// 部门选择组件 ref
const departmentSelRef = ref(null);
// 部门选择组件 tabs
let departmentSelTabs = [
    {
        name: 'department',
        label: '部门',
        inputType: 'select',
        type: 3
    }
];

// footer
// 关闭弹窗
const closeDialog = () => {
    visible.value = false;
};
// 提交表单
const submitForm = async (formEl) => {
    if (!formEl) return;

    await formEl.validate(async (valid) => {
        // 表单校验
        if (!valid) {
            return;
        }

        // 取分组成员数据
        const members = memberSelRef.value.getCheckData();

        // 取分组部门数据
        const departments = departmentSelRef.value.getCheckData();

        // 数据拼装
        const postData = {
            objectId: currentSettingRow.value.id,
            objectApiKey: currentSettingRow.value.apiKey, // 所属业务对象的 api_key, 线索（lead）或者客户（customer）
            id: props.ruleData.id,
            name: formData.value.name.trim(), // 公海分组的名称
            memberReturnFlag: formData.value.memberReturnFlag, // 是否允许非本组成员退回数据, 0-否, 1-是
            apiKey: props.ruleData.id ? undefined : formData.value.apiKey, // 程序识别名称
            memberIdTypeList: [
                {
                    memberType: 1, // 成员类型, 1-用户, 2-角色, 3-部门
                    idList: formData.value.managerList.map(i => i.id),
                    identity: 1 // 0:表示普通成员，1:表示分组管理员
                }, // 管理员
                {
                    memberType: 1, // 成员类型, 1-用户, 2-角色, 3-部门
                    idList: members.map(i => i.id)
                }, // 成员
                {
                    memberType: 3, // 成员类型, 1-用户, 2-角色, 3-部门
                    idList: departments.map(i => i.id)
                } // 部门
            ].filter(item => item.idList.length), // 部门用户数据
            managerId: formData.value.managerId, // 分组数据负责人
            description: formData.value.description.trim() // 描述信息
        };

        // 接口请求
        loading.value = true;
        const res = await (postData.id ? updateHighSeasGroup : addHighSeasGroup)(postData);
        // 返回结果处理
        if (res.code === 10000) {
            // 操作成功, 通知父组件做后续处理
            emit('operateSuccess', postData, res.data);

            ElMessage.success(t('operateSuccess'));
            closeDialog();
        } else {
            ElMessage.error(res.messageShow);
        }
        loading.value = false;
    });
};

// 初始化请求
// 编辑规则时
if (props.ruleData.id) {
    // 获取分组数据
    getData();
} else {
    initFlag.value = true;
}
</script>

<style lang="scss" scoped>
.editHighSeasGroup {
    &-body {
        overflow-y: auto;
        margin: 0 -12px;
    }

    &-form {
        padding: 0 12px;
        height: 100%;
        max-height: 500px;
    }
}
</style>