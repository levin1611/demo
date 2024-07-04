<!-- 新建/编辑选项集 弹框 -->
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
    
        <!-- form -->
        <el-form
            :model="formData"
            ref="formRef"
            label-width="120px"
            label-position="left"
            :rules="formRules"
            class="demo-ruleForm"
        >
            <el-form-item
                prop="displayName"
                label="名称"
            >
                <el-input
                    v-model.trim="formData.displayName"
                    :placeholder="$t('placeholder', { name: '名称' })"
                    maxlength="50"
                    show-word-limit
                ></el-input>
            </el-form-item>
            <el-form-item
                prop="apiKey"
                label="程序识别名称"
            >
                <el-input
                    v-model.trim="formData.apiKey"
                    maxlength="100"
                    @input="inputApiKey"
                    :disabled="props.operateType === 'edit'"
                    show-word-limit
                ></el-input>
            </el-form-item>
            <el-form-item
                prop="notes"
                :label="$t('remark')"
            >
                <el-input
                    v-model.trim="formData.notes"
                    :placeholder="$t('placeholder', { name: '描述' })"
                    maxlength="1000"
                    show-word-limit
                    type="textarea"
                    :rows="5"
                ></el-input>
            </el-form-item>
            <el-form-item
                label="选项信息">
                    <optionsList
                    :options-list="optionsListData"
                    ref="optionsListRef"
                    @updateOptionsList="updateOptionsList"></optionsList>
            </el-form-item>
            <el-form-item>
                <el-checkbox v-model="formData.sortType">按选项名称排序保存</el-checkbox>
            </el-form-item>
        </el-form>

        <!-- footer -->
        <template #footer>
            <div class="dialog-footer">
                <!-- cancel -->
                <el-button
                    @click="closeDialog"
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
import { ref, reactive, computed, unref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Utils from '@/utils';
import { addOption, listOptionsSet, editOption } from '@/api/generalOptionsSet.js';
import { useUserStore } from '@/pinia/modules/user.js';
import useDialogCommon from '@/hooks/useDialogCommon';
import useElDialogLoading from '@/hooks/useElDialogLoading';
import optionsList from '../component/options-list.vue';
import {
    cloneDeep
} from 'lodash';
// 引入 i18n 方法
const { t } = useI18n();

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

// 取通用的 dialog 逻辑相关参数
const {
    dialogVisible,
    closeDialog
} = useDialogCommon(props, emits);

// 取 pinia 数据
const store = useUserStore();

// 全局变量
const loading = ref(false);

const optionsListData = ref([
    {name: '', systemOptionsName: '', status: true, colors: '#FF752A', create: true, edit: false},
])
let optionsListDataSource = [];

const handleData = (data) => {
    const _obj = cloneDeep(data)
    _obj.map((v, i) => {
        v.enabledFlag = v.enabledFlag ? 1 : 0;
        v.orderNum = i
    })
    return _obj;
}

const updateOptionsList = (list) => {
    console.log('------', list);
    optionsListDataSource = cloneDeep(list);
    optionsListDataSource.pop();
    console.log('------', optionsListDataSource);
}

// 处理 loading 逻辑
// 暂存 dialog DOM
let dialogEl;
// 取 dialog 组件 body ref
const dialogBodyRef = ref(null);

// 弹框标题
const title = computed(() => {
    switch (props.operateType) {
        case 'new':
            return '新建通用选项集';
        case 'edit':
            return '编辑通用选项集';
        default:
            return '';
    }
});

// 弹框打开关闭回调
// 弹框打开前
const handleOpen = () => {
    setTimeout(() => {
        console.log(props.optionsData)
    })
    
    // 处理 loading 逻辑
    // 如果之前没获取过 dialog DOM, 说明是首次 open
    if (!dialogEl) {
        // 获取 dialog DOM
        ({ dialogEl } = useElDialogLoading(dialogBodyRef, loading));
    }

    // 表单数据处理
    switch (props.operateType) {
        case 'edit':
            // 编辑选项集时，回显选项集数据
            formData.displayName = props.optionsData.displayName;
            formData.apiKey = props.optionsData.apiKey;
            formData.notes = props.optionsData.notes;
            formData.sortType = props.optionsData.sortType ? true : false;
            formData.type = props.optionsData.type;
            listOptionsSet({
                id: props.optionsData.id
            }).then(res => {
                if(res.code === 10000) {
                    res.data.map(v => {
                        v.enabledFlag = v.enabledFlag === 1 ? true : false;
                    })
                    optionsListDataSource = cloneDeep(res.data);
                    res.data.push(
                        {displayName: '', apiKey: '', enabledFlag: true, colors:'#FF752A', create: true, edit: false},
                    )
                    optionsListData.value = res.data;
                } else {
                    ElMessage.error(res.messageShow);
                }
            })
            break;
        default:
            // 新建选项集时，数据置空
            formData.displayName = '';
            formData.apiKey = props.optionsData.apiKey;
            formData.notes = '';
            formData.sortType = false;
            formData.type = 1;
            optionsListDataSource = [];
            optionsListData.value = [
                {displayName: '', apiKey: '', enabledFlag: true, colors:'#FF752A', create: true, edit: false},
            ]
            break;
    }
};
// 弹框关闭后
const handleClosed = () => {
    // 表单重置
    formRef.value?.resetFields();
};
// 排序
const optionsListRef = ref(null);

// 表单
const formRef = ref(null);
const formData = reactive({
    displayName: '',
    apiKey: '',
    notes: '',
    sortType: false, // 0默认按输入顺序，1按选项名称
    type: 1 // 0系统 1自定义的
});

const validApiKey = (rule, value, callback) => {
    const firstChar = value.charAt(0);
    if (/\d/.test(firstChar)) {
        callback(new Error('程序识别名称不能以数字开头'));
    } else {
        callback();
    }
};
const inputApiKey = () => {
    formData.apiKey = formData.apiKey.replace(/[^a-zA-Z0-9_]/g, '');
};
// 表单校验规则
const formRules = {
    displayName: [
        {
            required: true,
            message: t('emptyInputWarn', { name: '名称' }),
            trigger: 'blur'
        }
    ],
    apiKey: [
        { required: true, message: '请输入程序识别名称', trigger: 'blur'},
        { validator: validApiKey, trigger: 'blur'}
    ]
};



// footer
const submit = async () => {
    console.log(formData)
    const valid = await formRef.value.validate();;
    if (!valid) {
        return;
    }
    if(optionsListDataSource.length === 0) {
        ElMessage.error('选项数据不能为空');
        return
    }
    // 显示 loading
    loading.value = true;
    // 提交表单
    const params = {
        apiKey: formData.apiKey,
        dataOptions: handleData(optionsListDataSource),
        displayName: formData.displayName,
        sortType: formData.sortType ? 1 : 0, // 如果选中则按选项名称排序，不选中则按输入顺序排序
        type: props.operateType === 'new' ? 1 : formData.type, // 如果是新建则是自定义字段，编辑操作则取编辑前的值
        notes: formData.notes
    };
    if (props.operateType === 'new') {
        // 新建选项集
        const res = await addOption(params);
        if (res.code === 10000) {
            // 关闭弹框
            closeDialog();
            // 刷新列表
            emits('operateSuccess');
        } else {
            // 失败
            ElMessage.error(res.messageShow);
        }
    } else {
        // 编辑选项集
        params.id =props.optionsData?.id
        const res = await editOption(params);
        if (res.code === 10000) {
            // 成功
            // 关闭弹框
            closeDialog();
            // 刷新列表
            emits('operateSuccess');
        } else {
            // 失败
            ElMessage.error(res.messageShow);
        }
    }
    // 取消 loading
    loading.value = false;
};

watch(
    () => props.visible,
    (val) => {
        optionsListData.value = [];
    },
    {
        immediate: true
    }
);
</script>

<style lang="scss" scoped>
.editRole {
    &-tip {
        margin-bottom: 20px;
    }
}
</style>