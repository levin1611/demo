<template>
    <div class="relate-input">
        <!-- 业务对象类型、只读、相关列表关联关系字段 -->
        <template v-if="['objectType', 'ownerId'].includes(item.apiKey) || item.readonlyFlag === 1 || (relationFieldId && createdBackfilledApikey === item.apiKey)">
            <el-input
                v-model="item.value"
                disabled
                type="text"
                :placeholder="`${$t('clue.pleaseChoose')}${item.displayName}`"
                class="disabled-input"
            />
            <span class="custom custom-add3" style="cursor: not-allowed;" size="22"></span>
        </template>
        <div v-else>
            <el-input
                v-model="item.value"
                :disabled="disabled"
                readonly
                type="text"
                :placeholder="`${$t('clue.pleaseChoose')}${item.displayName}`"
                :class="item.value ? 'fill-input' : ''"
                class="enable-input"
                @click="searchRelation"
            />
            <template v-if="createdBackfilledApikey !== item.apiKey">
                <span
                    :class="item.value ? 'disabled-icon' : ''"
                    class="custom custom-add3"
                    size="22"
                    @click="searchRelation"
                ></span>
                <span
                    :class="item.value ? 'empty-icon' : 'disabled-empty-icon'"
                    class="custom custom-shanchu1"
                    size="30"
                    @click.prevent="emptyValue"
                ></span>
            </template>
        </div>
    </div>
    <!-- 选择客户 modal -->
    <selectCustom
        v-model:dialogVisible="selectModalVisible"
        :fieldId="item.fieldId"
        :objectId="item.referenceObjectId"
        :objectApiKey="item.reObjIdApikey"
        :dataId="dataId"
        @selectData="selectData"
    />
</template>

<script setup>
import { ref, toRefs, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import selectCustom from '@/components/selectCustom.vue';
// 获取全局 scss 变量, 以获取 element-plus 的命名空间
import CSSVariables from '@/style/js.module.scss';

const { elnamespace } = CSSVariables;

const props = defineProps({
    item: {
        type: Object,
        default: () => ({})
    },
    createdBackfilledApikey: {
        type: String
    },
    relateBaseInfo: {
        type: Object
    },
    // 关联关系新建时需要（系统默认关联关系字段）
    relationFieldId: {
        type: Number
    },
    // 是否是商机新建联系人
    opportunityAddContacts: {
        type: Boolean
    },
    // 当前编辑的数据 id
    dataId: {
        type: Number
    },
    // 当前是编辑还是新建
    operation: {
        type: String
    },
    disabled: {
        type: Boolean
    }
});

const { t } = useI18n();

onMounted(() => {
    if (props.item.value) {
        item.value.value = props.item.value;
        item.value.valueId = props.item.valueId;
    }
});

const { item, createdBackfilledApikey, relateBaseInfo, relationFieldId, opportunityAddContacts, dataId, operation } = toRefs(props);

const emits = defineEmits(['blurInput', 'selectData', 'clearData']);
const selectData = (value, id) => {
    item.value.value = value;
    item.value.valueId = id;
    emits('selectData', {value, id})
    blurInput();
}

const blurInput = () => {
    emits('blurInput', item.value);
};

const selectModalVisible = ref(false);

// 字段 id
const fieldId = ref(0);
// 搜索关联关系
const searchRelation = () => {
    if (item.value.readonlyFlag === 1 || item.value.writeFlag === 0 || item.value.value || props.disabled) return;
    fieldId.value = item.value.fieldId;
    selectModalVisible.value = true;
};

// 清空值
const emptyValue = () => {
    item.value.valueId = '';
    item.value.value = '';
    emits('clearData')
    blurInput();
};

// 回填关联关系字段（相关列表新建）
const handleBackRelate = () => {
    const isApiKeyMatch = createdBackfilledApikey?.value === item.value.apiKey;
    const itemValue = item.value;

    // 特殊处理的情况：商机新建联系人要用固定的 apikey（'customer'）
    if (createdBackfilledApikey?.value === 'customer' && isApiKeyMatch && opportunityAddContacts?.value) {
        itemValue.valueId = relateBaseInfo.value.customer;
        itemValue.value = relateBaseInfo.value.customer_value;
        // 直接将字段强制改为只读(前端定义的，保存时需要过滤该字段)
        item.value.readonlyFlagCustomer = 1;
        return;
    }
    if (isApiKeyMatch) {
        itemValue.valueId = relateBaseInfo.value.auto_column_id;
        itemValue.value = relateBaseInfo.value.name;
        // 直接将字段强制改为只读(前端定义的，保存时需要过滤该字段)
        item.value.readonlyFlagCustomer = 1;
    }
};

onMounted(() => {
    handleBackRelate();
});
</script>
<style scoped lang="scss">
.custom-add3, .custom-shanchu1 {
    position: absolute;
    top: 10px;
    right: 10px;
    color: #A8ABB2;
    cursor: pointer;
}
.#{$elnamespace}-form-item__content {
    position: relative;
}
.relate-input {
    width: 300px;
    .enable-input {
        :deep(.#{$elnamespace}-input__wrapper) {
            background-color: #FFFFFF;
            .#{$elnamespace}-input__inner {
                cursor: pointer;
            }
        }
    }
    .enable-input.is-disabled {
        :deep(.#{$elnamespace}-input__wrapper) {
            background-color: var(--xhl-el-disabled-bg-color);
            box-shadow: 0 0 0 1px var(--xhl-el-disabled-border-color) inset;
        }
    }
    .fill-input {
        :deep(.#{$elnamespace}-input__wrapper) {
            background-color: #FFFFFF;
            .#{$elnamespace}-input__inner {
                -webkit-text-fill-color: #606266;
            }
        }
    }
    :deep(.#{$elnamespace}-input__suffix) {
        z-index: 9990;
    }
    .empty-icon, .disabled-empty-icon {
        display: none;
    }
    &:hover {
        .disabled-icon {
            display: none;
        }
        .empty-icon {
            display: block;
        }
    }
}
</style>