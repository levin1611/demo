<!-- 公海分组 设置成员 弹框 -->
<template>
    <el-dialog
        v-model="visible"
        :title="$t('highSeas.setMembers')"
        width="660px"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @open="handleOpen"
        @closed="handleClosed"
        class="setGroupMember"
    >
        <!-- loading 用的无意义 div -->
        <div ref="dialogBodyRef"></div>
    
        <!-- form -->
        <el-form
            ref="formRef"
            :model="formData"
            label-width="80px"
            label-position="left"
        >
            <!-- 分组成员 -->
            <el-form-item
                :label="$t('highSeas.groupMembers')"
                :error="showError.members ? $t('emptyInputWarn', { name: $t('highSeas.groupMembers') }) : false"
                required
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
                :error="showError.departments ? $t('emptyInputWarn', { name: $t('highSeas.groupDepartments') }) : false"
                required
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
        </el-form>

        <!-- footer -->
        <template #footer>
            <div class="dialog-footer">
                <!-- cancel -->
                <el-button
                    @click="visible = false"
                    class="useBrandColor"
                >{{ $t('cancel') }}</el-button>
                <!-- confirm -->
                <el-button
                    type="primary"
                    @click="submit"
                >{{ $t('confirm') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, inject, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { updateHighSeasGroupMembers } from '@/api/highSeas';
import useElDialogLoading from '@/hooks/useElDialogLoading';
import applicableMember from '@/components/applicableMember/applicableMember.vue';

// inject
const currentSettingRow = inject('currentSettingRow');
// model
const visible = defineModel('visible', { type: Boolean, default: false });
// prosp
const props = defineProps({
    ruleData: {
        type: Object,
        default: () => ({})
    }
});
// emits
const emits = defineEmits([
    'operateSuccess'
]);

// 全局
// loading
const loading = ref(false);
// 多语言
const { t } = useI18n();

// 处理 loading 逻辑
// 暂存 dialog DOM
let dialogEl;
// 取 dialog 组件 body ref
const dialogBodyRef = ref(null);

// 弹框打开关闭回调
// 弹框打开前
const handleOpen = () => {
    // 处理 loading 逻辑
    // 如果之前没获取过 dialog DOM, 说明是首次 open
    if (!dialogEl) {
        // 获取 dialog DOM
        ({ dialogEl } = useElDialogLoading(dialogBodyRef, loading));
    }

    // 销毁旧初始化成员选择组件
    initFlag.value = false;

    // 初始化表单数据
    const tmpFormData = JSON.parse(JSON.stringify(initFormData));
    // 回显规则数据 + 其他根据类型变动的数据
    tmpFormData.members = props.ruleData.members || [];
    tmpFormData.departments = props.ruleData.departments || [];
    // 表单数据赋值
    formData.value = tmpFormData;
    // 初始化成员选择组件
    nextTick(() => {
        initFlag.value = true;
    });
};
// 弹框关闭后
const handleClosed = () => {
    // 数据清空
    // 表单校验项清空
    formRef.value?.clearValidate();
    // 错误提示清空
    showError.value = {};
    // 重置选择组件 tabs 数据 --- 选择组件会往这上面加数据, 如果不清空, 组件检查到有数据就不会调接口请求数据了
    memberSelTabs = [
        {
            name: 'members',
            label: '成员',
            inputType: 'select',
            type: 1
        }
    ];
    departmentSelTabs = [
        {
            name: 'department',
            label: '部门',
            inputType: 'select',
            type: 3
        }
    ];
};

// 表单
// ref
const formRef = ref(null);
// 表单数据
const formData = ref({});
// 表单初始数据
const initFormData = {
    members: [],
    departments: []
};
// 是否显示成员部门的错误提示
const showError = ref({});
// 成员
// 成员选择组件是否可加载标识
const initFlag = ref(false);
// 成员选择组件 ref
const memberSelRef = ref(null);
// 成员选择组件 tabs
let memberSelTabs = [
    {
        name: 'members',
        label: '成员',
        inputType: 'select',
        type: 1
    }
];
// 部门
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
const submit = async () => {
    // 取成员数据 + 校验
    let checkData = memberSelRef.value.getCheckData();
    let middleData = checkData.reduce((acc, item) => {
        if (!acc.has(item.type)) {
            acc.set(item.type, {
                memberType: item.type,
                idList: []
            });
        }
        acc.get(item.type).idList.push(item.id);
        return acc;
    }, new Map());
    const members = Array.from(middleData.values());
    // 数据为空校验
    if (!members.length) {
        showError.value.members = true;
        return;
    }

    // 取部门数据 + 校验
    checkData = departmentSelRef.value.getCheckData();
    middleData = checkData.reduce((acc, item) => {
        if (!acc.has(item.type)) {
            acc.set(item.type, {
                memberType: item.type,
                idList: []
            });
        }
        acc.get(item.type).idList.push(item.id);
        return acc;
    }, new Map());
    const departments = Array.from(middleData.values());
    // 数据为空校验
    if (!departments.length) {
        showError.value.departments = true;
        return;
    }

    // 显示 loading
    loading.value = true;
    // 发送请求
    const postData = {
        id: props.ruleData.id,
        objectApiKey: currentSettingRow.value.apiKey, // 所属业务对象的 api_key, 线索（lead）或者客户（customer）
        members, // 成员
        departments // 部门
    };
    const res = await updateHighSeasGroupMembers(postData);
    if (res.code === 10000) {
        // 成功

        // 关闭弹框
        visible.value = false;
        // 刷新列表
        emits('operateSuccess', postData);
    } else {
        // 失败

        ElMessage.error(res.message);
    }
    // 取消 loading
    loading.value = false;
};
</script>

<style lang="scss">
.setGroupMember {
}
</style>