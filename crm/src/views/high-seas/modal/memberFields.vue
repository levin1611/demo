<!-- 公海分组 - 设置显示字段 -->
<template>
    <el-dialog
        v-model="visible"
        :title="$t('highSeas.setVisibleFields')"
        width="954"
        height="688"
        append-to-body
        class="setGroupFields"
    >
        <div style="height: 480px">
            <customSort
                :key="refreshCheckKey"
                :config="{ id: 'id', label: 'name', checked: 'checked' }"
                :itemList="allFields"
                :defaultCheck="normalFieldIds"
                :defaultCheckFreeze="freezeFieldIds"
                :showFreeze="true"
                :cloum="5"
                ref="fieldCheckRef"
            ></customSort>
        </div>

        <template #footer>
            <div class="footer-box">
                <el-button
                    @click="visible = false"
                    class="useBrandColor"
                >{{ $t('cancel') }}</el-button>
                <!-- confirm -->
                <el-button
                    type="primary"
                    @click="submit"
                >{{ $t('save') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, inject, unref } from 'vue';
import { useI18n } from 'vue-i18n';
import { updateHighSeasGroupFields, getAllHighSeasGroupFields } from '@/api/highSeas';
import { cloneDeep } from 'lodash';
import { customSort } from 'xhl_lib';

// inject
const currentSettingRow = inject('currentSettingRow');
// model
const visible = defineModel('visible', { type: Boolean, default: false });
// props
const props = defineProps({
    ruleData: {
        type: Object,
        default: () => ({})
    }
});

// 翻译
const { t } = useI18n();

// 全局变量
const loading = ref(false);

// 获取字段数据
const getFields = async () => {
    // 显示 loading
    loading.value = true;

    // 发送请求
    const res = await getAllHighSeasGroupFields({
        objectId: currentSettingRow.value.id,
        groupId: props.ruleData.id
    });
    // 结果处理
    if (res && res.code === 10000) {
        handleData(res.data);
    } else {
        // 请求失败

        ElMessage.error(res.messageShow);
    }

    // 取消 loading
    loading.value = false;
};
// 处理设置数据
const handleData = (data) => {
    if (!data) return {};

    // 展示字段数据处理
    allFields.value[0].checkMapLists = cloneDeep(data.layoutFieldInfoList?.allFieldList || []).map(item => {
        item.disabled = (item.deleteConfigFlag === 0);
        return item;
    });
    normalFieldIds.value = (data.layoutFieldInfoList?.selectedList || []).filter(item => !item.frozenFlag).map((item) => item.id);
    freezeFieldIds.value = (data.layoutFieldInfoList?.selectedList || []).filter(item => item.frozenFlag).map((item) => item.id);
    // 刷新选择组件
    refreshCheckKey.value++;

    return data;
};

// 展示字段
// 刷新选择组件
let refreshCheckKey = ref(0);
// ref
const fieldCheckRef = ref(null);
// 所有展示字段
let allFields = ref([
    {
        checkMapLists: []
    }
]);
// 非冻结列展示字段 ids
const normalFieldIds = ref([]);
// 冻结列展示字段 ids
const freezeFieldIds = ref([]);

// 保存
const submit = async () => {
    // 取选中显示字段 - 冻结字段 + 非冻结字段
    const { freezeResult = [], normalResult = [] } = unref(fieldCheckRef.value?.getCheckSourceData() || {});
    // 取选中字段数据
    const frozenFields = freezeResult.map(i => i.id);
    const nonFrozenFields = normalResult.map(i => i.id);
    // 选中字段为空校验
    if (!frozenFields.length && !nonFrozenFields.length) {
        ElMessage.error(t('placeholder_select', { name: t('layout.displayField') }));
        return;
    }

    // 显示 loading
    loading.value = true;
    // 发送请求
    let postData = {
        id: props.ruleData.id,
        frozenFields,
        nonFrozenFields
    };
    const res = await updateHighSeasGroupFields(postData);
    // 结果处理
    if (res && res.code === 10000) {
        ElMessage.success(t('saveSuccess'));

        // 关闭当前页, 返回上一级
        visible.value = false;
    } else {
        // 保存失败
        ElMessage.error(res.messageShow);
    }

    // 取消 loading
    loading.value = false;
};

// 获取字段数据
getFields();
</script>

<style lang="scss" scoped>
.setGroupFields {
}
</style>
