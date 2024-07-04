<template>
    <!-- 单选下拉选择 -->
    <el-popover
        placement="bottom"
        trigger="click"
        width="250px"
        @hide="hide"
        popper-class="customInputTreePop"
    >
        <!-- // 修改输入框的样式 -->
        <template #reference>
            <div class="custominput" ref="customInputNode">
                <el-input v-model="inputVal"
                          :clearable="false"
                          readonly
                          :placeholder="placeholder"> 
                    <template #suffix>
                        <el-icon class="el-input__icon">
                            <i class="custom  custom-arrow"></i>
                        </el-icon>
                    </template>
                </el-input>
                <span class="lable_name">{{name}}</span>
                <span class="delete" @click.stop="resetValue">
                    <i class="custom  custom-close-circle"></i>
                </span>
            </div>
        </template>

        <!-- // 树选择部分 -->
        <div class="tree_select_area">
            <customtree 
                ref="customTreeNode"
                wrap-height="300"
                :data="renderTree" 
                :currentClickKeys="propInputData"
                :showSearch="filterType"
                :show-checkbox = 'showCheckBox'
                @nodeClick="nodeClick"
            />
        </div>
    </el-popover>
</template>

<script setup>
import {ref, onMounted, reactive, computed, unref, isRef, toRefs, shallowReactive} from 'vue';

// 接受外部传参
const props = defineProps({
    placeholder: {
        type: String,
        default: ''
    },
    name: {
        type: String, 
        default: ''
    },
    width: {
        type: String, 
        default: 'auto'
    },
    paddingLeft: {
        type: String, 
        default: '11px'
    },
    filterType: {
        type: String, 
        default: ''
    },
    from: {
        type: String, 
        default: ''
    },
    // 底部按钮
    propInputData: {
        type: String,
        default: ''
    },
    renderTree: {
        type: Array,
        default() {
            return [];
        }
    },
    showCheckBox: {
        type: Boolean,
        default: false
    }
});
const { propInputData, renderTree, filterType } = toRefs(props);
const emits = defineEmits(['emitParams', 'update:propInputData', 'resetValue']);
import customtree from '@/components/customTree/customTree.vue'; // 树组件
import { flattenObjectArray } from '@/utils/dataProcess.js'; // 数组扁平

import { watch } from 'vue';
const customTreeNode = ref(null); // 树子组件的实例
const flattedTreeData = computed(() => flattenObjectArray(renderTree.value, 'list'));

const paddLeft = props.name ? `${props.name.length + 1}em` : props.paddingLeft;
const fontSize = '14px';
const customWidth = props.width || '200px';
const inputVal = ref('');
let selectedItem = {} ; // 树中被选中的数据


function nodeClick({ data, node, treenode, event }) {
 
    selectedItem = data;
}
// 在popver关闭的时候
function hide() {
    
    // console.log(customTreeNode.value.treeRef.getCurrentKey());
    emits('update:propInputData', customTreeNode.value.treeRef.getCurrentKey() || selectedItem.id);
    
}

// 根据传入的数据 设置 input显示的值
function setValueInput(id) {
    // 设置input回显的值
    let inputValStr = '';
    if (id) {
        const item = flattedTreeData.value.find(item => item.id == id);
        if (item) {
            inputValStr += `${item.name}`;
        }
    }
   
   
    // 给input负值
    inputVal.value = inputValStr;
}

// 筛选条件 重置为空
function resetValue() {
    emits('resetValue');
    emits('update:propInputData', '');
    emits('emitParams');


}
watch(propInputData, (v) => {
    setValueInput(v);
}, {immediate: true});

watch(inputVal, (v) => {
    emits('emitParams', selectedItem.id);
});
</script>


<style scoped lang="scss">


 .custominput{
    position: relative;
    font-size: v-bind(fontSize);
    width: v-bind(customWidth);
    :deep{
        .#{$elnamespace}-input__wrapper{
            padding-left: v-bind(paddLeft);
        }
    
    }
    .lable_name{
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 0.5em;
    }
    .delete{
        position: absolute;
        right: 0;
        top: 0;
        transform: translate(50%,-50%);
        cursor: pointer;
        display: none;
        .custom-close-circle{
            font-size: 16px;
        }
    }
    &:hover{
        .delete{
            display: block;
        }
    }
    .tree_select_area{
        width: 100%;
        overflow-x: auto;
    }
 }
 
</style>
<style lang="scss"> 
   .customInputTreePop{
    // 修改popover的弹窗样式
     
    }
</style>