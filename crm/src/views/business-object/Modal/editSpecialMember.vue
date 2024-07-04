<!-- 新建/编辑 特殊成员私池上限规则 弹框 -->
<template>
    <el-dialog
        v-model="visible"
        :title="title"
        width="660px"
        :append-to-body="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        @open="handleOpen"
        @closed="handleClosed"
        class="editSpecialMember"
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
            <!-- 人员范围 -->
            <el-form-item
                :label="$t('privatePool.memberScope')"
                :error="showError ? $t('emptyInputWarn', { name: $t('privatePool.memberScope') }) : false"
                required
            >
                <!-- 选择成员 -->
                <applicableMember
                    v-if="initFlag"
                    ref="applicableMemberDom"
                    :tabs="applicableMemberTabs"
                    activeTabProp="members"
                    :defaultData="formData.idAndNameDtoList"
                    :listApi="getSpecialMemberSelectListData"
                    :listApiParams="applicableMemberApiParams"
                ></applicableMember>
            </el-form-item>
            <!-- 上限数量 -->
            <el-form-item
                :label="$t('privatePool.limitCount')"
                required
            >
                <!-- radio group -->
                <el-radio-group v-model="formData.limitedFlag">
                    <el-radio :label="0">{{ $t('unlimited') }}</el-radio>
                    <el-radio :label="1">{{ $t('privatePool.objLimit', { name: currentSettingRow.displayName }) }}
                        <el-input-number
                            v-model="formData.maxCapacity"
                            :min="0"
                            :max="2147483647"
                        ></el-input-number>
                    </el-radio>
                </el-radio-group>
            </el-form-item>
            <!-- 包含自建 -->
            <el-checkbox
                v-model="formData.newObjectFlag"
                :true-value="1"
                :false-value="0"
                :label="$t('privatePool.includeSelfBuildObj', { name: currentSettingRow.displayName })"
            ></el-checkbox>
            <br>
            <!-- 包含已成交 -->
            <el-checkbox
                v-model="formData.conversionObjectFlag"
                :true-value="1"
                :false-value="0"
                :label="$t('privatePool.includeTransactCustomer')"
            ></el-checkbox>
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
import { addSpecialMemberRule, editSpecialMemberRule, getSpecialMemberSelectListData } from '@/api/privatePool';
import useElDialogLoading from '@/hooks/useElDialogLoading';
import applicableMember from '@/components/applicableMember/applicableMember.vue';

// inject
const currentSettingRow = inject('currentSettingRow');
// model
const visible = defineModel('visible', { type: Boolean, default: false });
// prosp
const props = defineProps({
    operateType: {
        type: String,
        default: 'new'
    },
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

// 弹框标题
const title = ref('');

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
    if (props.operateType === 'edit') {
        tmpFormData.idAndNameDtoList = (props.ruleData.idAndNameDtoList || []);
        tmpFormData.limitedFlag = props.ruleData.limitedFlag;
        tmpFormData.maxCapacity = props.ruleData.maxCapacity;
        tmpFormData.newObjectFlag = props.ruleData.newObjectFlag;
        tmpFormData.conversionObjectFlag = props.ruleData.conversionObjectFlag;
        applicableMemberApiParams.value = { seaRuleId: props.ruleData.id };
        title.value = t('privatePool.editLimitRule');
    } else {
        applicableMemberApiParams.value = {};
        title.value = t('privatePool.addLimitRule');
    }
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
    showError.value = false;
    // 重置人员选择组件 tabs 数据 --- 选择组件会往这上面加数据, 如果不清空, 组件检查到有数据就不会调接口请求数据了
    applicableMemberTabs = [
        {
            name: 'members',
            label: '成员',
            inputType: 'select',
            type: 1
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
    idAndNameDtoList: [],
    limitedFlag: 1,
    maxCapacity: 0,
    newObjectFlag: 1,
    conversionObjectFlag: 1
};
// 成员范围
// 成员选择组件是否可加载标识
const initFlag = ref(false);
// 成员选择组件 ref
const applicableMemberDom = ref(null);
// 成员选择组件 tabs
let applicableMemberTabs = [
    {
        name: 'members',
        label: '成员',
        inputType: 'select',
        type: 1
    }
];
// 成员选择组件 数据 api 
const applicableMemberApiParams = ref({});
// 是否显示成员范围的错误提示
const showError = ref(false);

// footer
const submit = async () => {
    // 取人员范围数据
    const checkData = applicableMemberDom.value.getCheckData();
    const memberIdTypeMap = checkData.reduce((acc, item) => {
        if (!acc.has(item.type)) {
            acc.set(item.type, {
                memberType: item.type,
                idList: []
            });
        }
        acc.get(item.type).idList.push(item.id);
        return acc;
    }, new Map());

    const memberIdTypeList = Array.from(memberIdTypeMap.values());

    // 数据为空校验
    if (!memberIdTypeList.length) {
        showError.value = true;
        return;
    }

    // 显示 loading
    loading.value = true;
    // 发送请求
    const postData = {
        id: props.ruleData.id,
        objectId: currentSettingRow.value.id,
        objectApiKey: currentSettingRow.value.apiKey, // 所属业务对象的 api_key, 线索（lead）或者客户（customer）
        memberIdTypeList, // 人员范围
        limitedFlag: formData.value.limitedFlag, // 是否限制私池上限，0-不限制，1-限制
        maxCapacity: formData.value.maxCapacity, // 上限数量，默认 0
        newObjectFlag: formData.value.newObjectFlag, // 是否包含新建对象，0-不包含，1-包含
        conversionObjectFlag: formData.value.conversionObjectFlag // 是否包含转化（或成交）对象，0-不包含，1-包含
    };
    const res = await (props.operateType === 'new' ? addSpecialMemberRule : editSpecialMemberRule)(postData);
    if (res.code === 10000) {
        // 成功

        // 关闭弹框
        visible.value = false;
        // 刷新列表
        emits('operateSuccess', Object.assign(postData, { idAndNameDtoList: checkData }));
    } else {
        // 失败

        ElMessage.error(res.message);
    }
    // 取消 loading
    loading.value = false;
};
</script>

<style lang="scss">
.editSpecialMember {
    .#{$elnamespace}-radio-group {
        align-items: normal;
        flex-direction: column;
    }
}
</style>