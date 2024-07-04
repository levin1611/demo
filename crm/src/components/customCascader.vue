<template>
    <div style="height:340px" v-for="(item, index) in childrenItem" :key="index" ref="levelRef">
        <el-input
        v-model="searchValue[index]"
        placeholder="搜索"
        class="search-input"
        :suffix-icon="Search"
        @change="searchInput(index, item)"
        />
        <el-scrollbar height="300px">
            <ul class="custom-Cascader-ul">
                <li v-for="(v, i) in item" :key="i" :class="{active: i.active || checkListIdMap.has(v.id)}"  @click="changeChildren(i, index, v)">
                    <!-- 多选 checkbox -->
                    <el-checkbox
                        v-if="props.multiple"
                        :model-value="checkListIdMap.has(v.id)"
                        @click.stop="toggleCheck(v)"
                        class="custom-Cascader-checkbox"
                    >
                    </el-checkbox>

                    <el-tooltip
                        effect="dark"
                        :content="v.displayName"
                        show-after="500"
                        placement="bottom"
                        >
                        <span class="custom-displayName">{{v.displayName}}</span>
                    </el-tooltip>
                    <!-- 如果达到最大层级就不允许点击了 关联关系类型才可以向下级查询-->
                   
                    <span v-if="index < props.maxLevel && v.penetrate" class="custom custom-a-Property1arrow-rightProperty2linear"></span>
                </li>
            </ul>
        </el-scrollbar>
    </div>
</template>
<script setup>
import { ref, watch, onMounted, unref, inject, computed } from 'vue';
import { Search } from '@element-plus/icons-vue'
import { fields4meta } from '@/api/common';

// model
// 多选, 选中项数组
const checkList = defineModel('checkList', { type: Array, default: () => [] });
// props
const props = defineProps({
    maxLevel: {
        type: Number,
        default: 5
    },
    dataType: String, // 场景中对应的数据类型，仅使用场景0,3时需要该参数		
    fieldsCurrent: {
        type: String,
        default: 'first'
    }, 	
    fieldsSource: Object,
    dataSource: Object,
    usageType: Number,
    // 多选
    multiple: Boolean
});

const searchValue = ref([]); // 搜索项
const childrenItem = ref([]); // 子项
const selectItem = ref([]); // 选中项
const selectString = ref(''); // 选中项字符串
const emit = defineEmits(['changeLevel', 'handleClick']); 
let treeSource = [];
const levelRef = ref(null);

const clear = () => {
    // 清空选中样式
    (levelRef.value && levelRef.value.length) && levelRef.value[0].querySelectorAll('li').forEach((v, i) => {
        v.classList.remove('active')
    })
    searchValue.value = [];
    selectItem.value = [];
    selectString.value = '';
    childrenItem.value = [];
   
}
const getData = (prefix = '') => {
    console.log('23232323', props)
    let requestSource = props.fieldsCurrent === 'first' ? props.fieldsSource : props.dataSource;
    requestSource.methods(requestSource.data).then(res => {
        if(res.code === 10000) {
            childrenItem.value = [];
            if(res.data && res.data.length > 0) {
                // 如果长度等于0，则不进行赋值操作
                childrenItem.value[0] = res.data;
                treeSource[0] = res.data;
            }
            console.log('childrenItem', childrenItem.value, res.data);
            emit('changeLevel', childrenItem.value.length, childrenItem.value);
        }
    })
}
// const objectItem = ref(props.objectItem);
console.log('-----', props)

// const activeItem = ref(0);
// const changeObject = (index, children) => {
//     // 点击第一级，给第二级赋值，并更改popover宽度
//     activeItem.value = index;
//     childrenItem.value = [];
//     childrenItem.value[0] = children;
//     treeSource[0] = children;
//     emit('changeLevel', childrenItem.value.length);
//     console.log(childrenItem.value);
// }
/**
 * 
 * @param {*} activeIndex 当前选中的索引
 * @param {*} levelIndex 当前选中项的层级
 * @param {*} item 当前选中项
*/
const changeChildren = (activeIndex, levelIndex, item) => {
     // 如果不存在上一级objectId，且可穿透下一级，则直接返回
     if(!item.referenceObjectId && item.penetrate) {
        return;
    }
    // 点击当前层级之后，删除下一级及之后的所有层级
    childrenItem.value.splice(levelIndex + 1, childrenItem.value.length - levelIndex - 1);
    // 添加选中项
    selectItem.value[levelIndex] = item;

    console.log('选中项', (childrenItem.value.length > props.maxLevel), !item.penetrate)
    // 当前层级大于最大层级时不操作
    if((childrenItem.value.length > props.maxLevel) || !item.penetrate) {
        selectItem.value.forEach((v,i) => selectString.value += `${i > 0 ? '.' : ''}${v.apiKeyValue}`)
        emit('handleClick',selectItem, selectString.value, levelIndex);
        // 当前层级大于最大层级时，不进行赋值操作
        return;
    } 

    // 如果是关联关系类型，则可以点击查询下一层级
    if(item.penetrate) {
        console.log('关联关系类型:', item)
        let requestSource = props.fieldsCurrent === 'first' ? props.fieldsSource : props.dataSource;
        console.log('requestSource', requestSource)
        let data = {}
        // {
        //     objectId: item.objectId,
        //     layer: childrenItem.value.length - 1,
        //     usageType: requestSource.data.usageType,
        //     referenceObjectId: item.referenceObjectId,
        //     dataType: item.dataType
        // }
        if(['findRelFilterFields', 'findRelFilterFieldsRange'].includes(requestSource.methodsName)) {
            data = {
                objectId: item.referenceObjectId,
                namePrefix: item.displayName,
                prefix: item.apiKeyValue,
            }
        }
        if(['fields4meta'].includes(requestSource.methodsName)) {
            data = {
                objectId: item.referenceObjectId,
                layer: childrenItem.value.length,
                usageType: requestSource.data.usageType,
                referenceObjectId: (requestSource.data.usageType === 0 && [28, 29].includes(item.dataType)) ? item.referenceObjectId : undefined,
                dataType: [0, 3].includes(requestSource.data.usageType) ? requestSource.data.dataType : undefined
            }
        }
        requestSource.methods(data).then(res => {
            if(res.code === 10000) {
                if(res.data && res.data.length > 0) {
                    // 点击本级只有给下一级赋值，并更改popover宽度
                    childrenItem.value[levelIndex + 1] = res.data;
                    treeSource[levelIndex + 1] = res.data;
                } else {
                    selectItem.value.forEach((v,i) => selectString.value += `${i > 0 ? '.' : ''}${v.apiKeyValue}`)
                    emit('handleClick', selectItem, selectString.value);
                }
                // 添加选中样式
                levelRef.value[levelIndex].querySelectorAll('li').forEach((v, i) => {
                    v.classList.remove('active')
                    if(i === activeIndex) {
                        v.classList.add('active')
                    }
                })
                emit('changeLevel', childrenItem.value.length, childrenItem.value);
            }
        })
    }
    
}
// 搜索
const searchInput = (index, item) => {
    if (searchValue.value[index].trim() === '') {
        childrenItem.value[index] = treeSource[index];
    } else {
        const foundItem = treeSource[index].filter(v => v.displayName.includes(searchValue.value[index].toUpperCase()) || v.displayName.includes(searchValue.value[index].toLowerCase()));
        if (foundItem) {
            childrenItem.value[index] = foundItem
        } else {

        }
    }
}

// 计算属性, 多选 选中项 id map, { 选中项 id : 选中项在数组中的顺序 }
const checkListIdMap = computed(() => {
    const result = new Map();
    checkList.value.forEach((i, index) => result.set(i.id, index));
    return result;
});
// 点击选项 checkbox 切换勾选状态
const toggleCheck = (item) => {
    const index = checkListIdMap.value.get(item.id);
    if (index !== undefined) {
        checkList.value.splice(index, 1);
    } else {
        checkList.value.push(item);
    }
};

defineExpose({
    clear,
    getData
});
</script>
<style lang="scss" scoped>
.custom-Cascader {
    font-size: 14px;
    &-box{
        background: #fff;
        display: flex;
        box-shadow: 0 1px 4px 0 #EAEAEA;
    }
    .search-input {
        width: 126px;
        margin: 10px 11px 0px;
        :deep {
            .#{$elnamespace}-input__suffix-inner {
                cursor: pointer;
            }
        }
    }
    &-ul{
        width: 150px;
        border-right: 1px solid #E5E7ED;
        padding: 8px 0px;
        max-height: 390px;
        .custom-displayName {
            width: 100%;
            display: inline-block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        li{
            padding: 4px 12px;
            display: flex;
            align-items: center;
            cursor: pointer;
            &:hover{
                background-color: var(--xhl-el-dropdown-menuItem-hover-fill);
                color: var(--xhl-el-dropdown-menuItem-hover-color)
            }
            &.active, &:hover{
                background: #F4F8FB;
                span {
                    color: #4285F2;
                }
            }
            display: flex;
            justify-content: space-between;
            .custom {
                color: #A8ABB2;
            }
        }
    }
}
</style>

<style lang="scss" scoped>
.custom-Cascader-checkbox {
    margin-right: 4px;
}
</style>

