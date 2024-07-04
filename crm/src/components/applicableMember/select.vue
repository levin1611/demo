<template>
    <section class="scroll_list_check">
        <div class="list_item" 
             v-for="item in options" 
             :key="item.id" 
             v-show="item[propData.name].toLocaleUpperCase().includes(filterText.toLocaleUpperCase())"
             @click="toggleCheck(item)"> 
            <el-checkbox :model-value="item.check" :disabled="item.disabled" :label="item[propData.name]" size="large" />
        </div>
        <div v-show="!empty" class="empty_status">
            (空)
        </div>
    </section>
</template>
<script setup>
import { toRefs, computed, watch} from 'vue';
const props = defineProps({
    options: {
        default: () => {
            return [];
        }
    },
    filterText: {
        // 筛选字段
        default: ''
    },
    defaultcheckedkeys: {
        default: () => {
            return [];
        }
    },
    propData: {
        default: () => {
            return {
                name: 'name'
            };
        }
    },
    vest: {
        // 马甲
        default: ''
    }
});
const {filterText, options, defaultcheckedkeys, vest} = toRefs(props);
const emits = defineEmits([
    'checkChange'
]);
const empty = computed(() => options.value.find(ele => ele[props.propData.name].includes(filterText.value))); // 空的展示状态
function toggleCheck(item) {
    // 设置选中状态
    if(item.disabled) return;
    item.check = !item.check;
    checkChange(item);
}

function checkChange(item) {
    // 复选框被点击的时候调用
    emits('checkChange', {data: item, check: item.check});
}
const forMateIds = computed(() => {
    // 将vest_id 解析一下 取出 当前vest下选中的id并且回显
    let temp = [];
    defaultcheckedkeys.value.forEach(ele => {
        const vestAndId = ele.split('_');
        if (vestAndId[0] == vest.value) {
            temp.push(Number(vestAndId[1]));
        }
    });
    return temp;
});
watch([forMateIds, options], () => {
    options.value.forEach(item => {
        item.check = forMateIds.value.includes(item.id);
    });
}, {deep: true, immediate: true});

</script>
<style lang="scss">
  .scroll_list_check{
            max-height: 250px;
            overflow-y: auto;
            .empty_status{
                width: 100%;
                text-align: center;
                line-height: 32px;
                color: #606266;
                opacity: 0.8;
            }
        }
        .list_item{
                font-size: var(--el-font-size-base);
                padding: 0 32px 0 20px;
                position: relative;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                color: var(--el-text-color-regular);
                height: 34px;
                line-height: 34px;
                box-sizing: border-box;
                cursor: pointer;
                &:hover{
                    background: #f5f7fa;
                }
               
        }
</style>
<style lang="scss" scoped>
    :deep{
        .#{$elnamespace}-checkbox__label{
                color: #303133;
                font-weight: 400;
        }
    }
</style>