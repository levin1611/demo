<!-- 新建/编辑角色 弹框 -->
<template>
    <el-dialog
        v-model="visible"
        :title="title"
        width="600px"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @open="handleOpen"
        @closed="handleClosed"
        class="editRole"
    >
        <!-- loading 用的无意义 div -->
        <div ref="dialogBodyRef"></div>

        <!-- tip -->
        <!-- 复制角色提示 -->
        <div
            v-if="operateType === 'copy'"
            class="editRole-tip"
        >{{ $t('role.tip_copyRole', { roleName: roleData.nameCn }) }}</div>
    
        <!-- form -->
        <el-form
            :model="formData"
            ref="formRef"
            label-width="80px"
            label-position="left"
            :rules="formRules"
        >
            <el-form-item
                prop="name"
                :label="$t('role.roleName')"
            >
                <el-input
                    v-model.trim="formData.name"
                    :placeholder="$t('placeholder', { name: $t('role.roleName') })"
                    maxlength="100"
                    show-word-limit
                ></el-input>
            </el-form-item>
            <el-form-item
                prop="remark"
                :label="$t('remark')"
            >
                <el-input
                    v-model.trim="formData.remark"
                    :placeholder="$t('placeholder', { name: $t('role.roleDescription') })"
                    maxlength="1000"
                    show-word-limit
                    type="textarea"
                    :rows="5"
                ></el-input>
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
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { addRole, copyRole, editRole, checkRepeatRoleName } from '@/api/role';
import { useUserStore } from '@/pinia/modules/user.js';
import useElDialogLoading from '@/hooks/useElDialogLoading';
// 引入 i18n 方法
const { t } = useI18n();

// 定义 model
const visible = defineModel('visible', { type: Boolean, default: false });
// 接受外部传参
const props = defineProps({
    operateType: {
        type: String,
        default: 'new'
    },
    roleData: {
        type: Object,
        default: () => ({})
    }
});
// 定义 emit
const emits = defineEmits([
    'update:roleData',
    'operateSuccess'
]);

// 取 pinia 数据
const store = useUserStore();

// 全局变量
const loading = ref(false);

// 处理 loading 逻辑
// 暂存 dialog DOM
let dialogEl;
// 取 dialog 组件 body ref
const dialogBodyRef = ref(null);

// 弹框标题
const title = computed(() => {
    switch (props.operateType) {
        case 'new':
            return t('role.createRole');
        case 'edit':
            return t('role.editRoleName');
        case 'copy':
            return t('role.copyRole');
        default:
            return '';
    }
});

// 弹框打开关闭回调
// 弹框打开前
const handleOpen = () => {
    // 处理 loading 逻辑
    // 如果之前没获取过 dialog DOM, 说明是首次 open
    if (!dialogEl) {
        // 获取 dialog DOM
        ({ dialogEl } = useElDialogLoading(dialogBodyRef, loading));
    }

    // 表单数据处理
    switch (props.operateType) {
        case 'edit':
        case 'copy':
            // 编辑/复制角色时，回显角色数据
            formData.name = props.roleData.nameCn;
            formData.remark = props.roleData.remark;
            break;
        default:
            // 新建角色时，数据置空
            formData.name = '';
            formData.remark = '';
            break;
    }
};
// 弹框关闭后
const handleClosed = () => {
    // 表单重置
    formRef.value?.resetFields();
};

// 表单
const formRef = ref(null);
const formData = reactive({
    name: '',
    remark: ''
});
// 表单校验相关
// 角色名称校验方法(查重)
const checkRoleName = (rule, value, callback) => {
    checkRepeatRoleName({
        id: props.roleData.id,
        orgId: store.orgId,
        userId: store.userId,
        nameCn: value,
        roleType: 2,
        operationType: props.operateType === 'copy' ? 1 : 0
    }).then(res => {
        if (res.code === 10000 && res.data) {
            // 查重通过
            callback();
        } else {
            // 查重不通过
            callback(new Error(t('role.tip_roleNameRepeat')));
        }
    });
};
// 表单校验规则
const formRules = {
    name: [
        {
            required: true,
            message: t('emptyInputWarn', { name: t('role.roleName') }),
            trigger: 'blur'
        },
        {
            validator: checkRoleName,
            trigger: 'blur'
        }
    ]
};

// footer
const submit = async () => {
    // 表单校验
    const valid = await formRef.value.validate();
    if (!valid) {
        return;
    }

    // 显示 loading
    loading.value = true;
    // 提交表单
    const params = {
        orgId: store.orgId,
        userId: store.userId,
        nameCn: formData.name,
        remark: formData.remark
    };
    if (props.operateType === 'new') {
        // 新建角色

        params.roleType = 2;
        const res = await addRole(params);
        if (res.code === 10000) {
            // 成功

            // 关闭弹框
            visible.value = false;
            // 刷新列表
            emits('operateSuccess');
        } else {
            // 失败

            ElMessage.error(res.message);
        }
    } else if (props.operateType === 'copy') {
        // 复制角色

        params.id = props.roleData.id;
        params.roleType = 2;
        const res = await copyRole(params);
        if (res.code === 10000) {
            // 成功

            // 关闭弹框
            visible.value = false;
            // 刷新列表
            emits('operateSuccess', res.data);
        } else {
            // 失败

            ElMessage.error(res.message);
        }
    } else {
        // 编辑角色

        params.id = props.roleData.id;
        const res = await editRole(params);
        if (res.code === 10000) {
            // 成功

            // 关闭弹框
            visible.value = false;
            // 刷新列表
            emits('operateSuccess', {
                nameCn: params.nameCn,
                remark: params.remark
            });
        } else {
            // 失败

            ElMessage.error(res.message);
        }
    }
    // 取消 loading
    loading.value = false;
};
</script>

<style lang="scss" scoped>
.editRole {
    &-tip {
        margin-bottom: 20px;
    }
}
</style>