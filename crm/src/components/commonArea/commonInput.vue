<template>
    <el-input
        v-model="fieldItem.value"
        :disabled="fieldItem.readonlyFlag === 1"
        :type="type"
        :placeholder="props.placeholder ? `${$t('clue.pleaseEnter')}${fieldItem.displayName}` : ''"
        :maxlength="fieldItem?.maxTextLength"
        :show-word-limit="showWordLimit"
        @blur="blurInput"
        @input="limitInput"
    >
        <template v-slot:append v-if="$slots.append">
            <slot name="append"></slot>
        </template>
    </el-input>
</template>
<script setup>
import { toRefs, watch } from 'vue';
const props = defineProps({
    item: {
        type: Object,
        default: () => ({})
    },
    type: {
        type: String,
        default: 'text'
    },
    showWordLimit: {
        type: Boolean,
        default: false
    },
    filterItem: {
        type: Object,
        default: {}
    },
    placeholder: {
        type: Boolean,
        default: true
    },
});

const { item: fieldItem } = toRefs(props);

const emits = defineEmits(['blurInput', 'focus']);

const blurInput = () => {
    console.log(fieldItem.value)
    emits('blurInput', fieldItem.value, props.filterItem);
};

// 电话
const PHONNE_TYPES = new Set([3]);
// 邮箱
const MAIL_TYPES = new Set([4]);
//  实数 百分比类型
const REAL_TYPES = new Set([13, 14]);

const limitInput = () => {
    if (PHONNE_TYPES.has(fieldItem.value.dataType)) {
        fieldItem.value.value = fieldItem.value.value.replace(/[^0-9\-\+\(\)]/g, '');
    } else if (MAIL_TYPES.has(fieldItem.value.dataType)) {
        fieldItem.value.value = fieldItem.value.value.replace(/[^A-Za-z\d@_.-]/g, '');
    } else if (REAL_TYPES.has(fieldItem.value.dataType)) {
        // 移除非数字、非负号、非小数点的字符
        fieldItem.value.value = fieldItem.value.value.replace(/[^-.\d]/g, '');

        // 确保只有一个负号，并且只能在最前面输入
        fieldItem.value.value = fieldItem.value.value[0] === '-' ? 
            `-${fieldItem.value.value.slice(1).replace(/-+/g, '')}` : 
            fieldItem.value.value.replace(/-+/g, '');

        // 如果第一个字符是小数点或者第一个字符是负号并且第二个字符是小数点，前面添加0
        if (fieldItem.value.value[0] === '.' || (fieldItem.value.value[0] === '-' && fieldItem.value.value[1] === '.')) {
            fieldItem.value.value = `${fieldItem.value.value[0] === '-' ? '-' : ''}0${fieldItem.value.value.slice(fieldItem.value.value[0] === '-' ? 1 : 0)}`;
        }

        // 确保只有一个小数点
        fieldItem.value.value = fieldItem.value.value.replace(/(\..*)\./g, '$1');
    }
};
watch(
    () => props.item,
    (val) => {
        fieldItem.value = val.value;
    }
)
</script>