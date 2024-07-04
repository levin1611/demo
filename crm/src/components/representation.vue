<!-- 表达式组件 -->
<template>
    <div class="all-purpose-filter" style="padding-top: 12px">
        <div style="margin-bottom: 10px">
            <!-- <el-button class="useBrandColor" ref="buttonRefs"  @click="insetFields(0)">插入字段</el-button> -->
            <template v-if="props.types.includes(1)">
                <el-button ref="buttonRefs" v-for="(v, i) in item" :key="i" :class="v.cls" @click="insetFields(i)">{{v.label}}</el-button>
            </template>
            <el-dropdown
                v-if="props.types.includes(2)"
                @command="insertOperator"
                max-height="400"
                trigger="click">
                <el-button class="useBrandColor" style="margin-left: 12px;">
                    插入运算符
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item style="width: 150px" v-for="(v, i) in operatorList" :key="i" :command="v">{{v.label}}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
            </el-dropdown>
            <el-dropdown
                v-if="props.types.includes(3)"
                trigger="click"
                max-height="400"
                :hide-on-click="false"
                @visible-change="insertFunction">
                <el-button class="useBrandColor" style="margin-left: 12px;">插入函数</el-button>
                <template #dropdown>
                  <el-dropdown-menu ref="dropdownRefs">
                    <el-dropdown-item style="width: 150px" v-for="(v, i) in functionData" :key="i" :command="i" @mousemove="moveFunction(i)">
                        <div style="display: flex;justify-content: space-between;align-items: center;width: 100%;">
                            <span>{{v.label}}</span>
                            <span v-if="v.children" class="custom custom-a-Property1arrow-rightProperty2linear"></span>
                        </div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
            </el-dropdown>
            <el-button class="brandColor" type="primary" style="margin-left: 12px;" @click="grammarcheckBtn()">语法检查</el-button>
        </div>
        <el-popover
            :virtual-ref="textRef"
            :visible="hidePopover"
            trigger="click"
            placement="bottom"
            :width="popoverWidth"
            :height="400"
            popper-class="representation"
            virtual-triggering>
            <div v-click-outside="onClickOutside">
                <div class="custom-Cascader">
                    <div class="custom-Cascader-box">
                        <custom-cascader 
                            v-if="activeSelectItem === 0"
                            :maxLevel="props.maxLevel"
                            @change-level="changeLevel" 
                            :dataType="props.dataType"
                            fieldsCurrent="first"
                            :objectId="props.objectId"
                            :fieldsSource="props.fieldsSource"
                            ref="customCascaderRef"
                            @handle-click="changeOption">
                        </custom-cascader>
                        <div v-if="activeSelectItem === 1">
                            <el-scrollbar height="300px">
                                <el-cascader-panel :options="options" />
                            </el-scrollbar>
                        </div>
                    </div>
                </div>
            </div>
        </el-popover>
        <!-- 插入函数二级弹框 -->
        <el-popover
            v-if="showInsertFunction"
            virtual-triggering
            :virtual-ref="dropdownRefs"
            placement="right-start"
            popper-class="representation-function-card"
            :show-arrow="false"
            :offset="0"
            trigger="hover">
                <ul class="function-card-ul" style="width: 150px;" v-if="functionChildren.length > 0">
                    <li v-for="(v, i) in functionChildren" :key="i" @click="selectFunctionItem(v)">
                        <span>{{v.label}}</span>
                    </li>
                </ul>
        </el-popover>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted, nextTick, computed, unref } from 'vue';
import { ClickOutside as vClickOutside } from 'element-plus';
import customCascader from './customCascader.vue';

import { grammarcheck } from '@/api/common'

const emit = defineEmits(['handleClick', 'resetSelect']); 
const activeSelectItem = ref(0);

const item = [
    {label: '插入字段', cls: 'useBrandColor'}
];
// const customCascaderRef = ref();
const operatorList = [
    {label: '+加', value: '+'},
    {label: '-减', value: '-'},
    {label: '*乘', value: '*'},
    {label: '/除', value: '/'},
    {label: '**乘方', value: '**'},
    {label: '(左括号', value: '('},
    {label: ')右括号', value: ')'},
    {label: '+串联', value: '+'},
    {label: '==等于', value: '=='},
    {label: '!=不等于', value: '!='},
    {label: '<小于', value: '<'},
    {label: '>大于', value: '>'},
    {label: '<=小于等于', value: '<='},
    {label: '>=大于等于', value: '>='},
    {label: '&&与', value: '&&'},
    {label: '||或', value: '||'},
]

const sourceData = [
    {value: '1', label: '联系人', children: [
        {value: '1', label: '联系人一', children: [
            {value: '1', label: '1-1', children: [
                {value: '1', label: '2-1', children: [
                    {value: '1', label: '3-1'},
                    {value: '2', label: '3-2'}
                ]},
                {value: '2', label: '2-2'}
            ]},
            {value: '2', label: '1-2'}
        ]},
        {value: '2', label: '联系人二', children: [
            {value: '1', label: '选项一', children: [
                {value: '1', label: '选项一-1'},
                {value: '2', label: '选项二-2', children: [
                    {value: '1', label: '选项一-1-1'},
                    {value: '2', label: '选项二-1-2'}
                ]}
            ]},
            {value: '2', label: '选项二'}
        ]}
    ]},
    {value: '2', label: '客户', children: [
        {value: '1', label: '客户一', children: [
            {value: '1', label: '客户子字段一'},
            {value: '2', label: '客户子字段二'}
        ]},
        {value: '2', label: '客户二', children: [
            {value: '1', label: '选项一'},
            {value: '2', label: '选项二'}
        ]}
    ]}
]

const options = []

const functionData = [
    {label:'日期时间', value: '1', children: [
        {label:'DATE', value: 'DATE(year,month,day)'},
        {label:'DATEVALUE', value: 'DATEVALUE(expression)'},
        {label:'TODAY', value: 'TODAY()'},
        {label:'DATETIMEVALUE', value: 'DATETIMEVALUE(expression)'},
        {label:'DATETIME', value: 'DATETIME(date,time)'},
        {label:'NOW', value: 'NOW()'},
        {label:'NOETIME', value: 'NOWTIME()'},
        {label:'TIMEVALUE', value: 'TIMEVALUE(expression)'},
        {label:'DAY', value: 'DAY(date)'},
        {label:'MONTH', value: 'MONTH(date)'},
        {label:'YEAR', value: 'YEAR(date)'},
        {label:'HOUR', value: 'HOUR(time)'},
        {label:'MINUTE', value: 'MINUTE(time)'},
        {label:'SECOND', value: 'SECOND(time)'},
        {label:'MILLISECOND', value: 'MILLISECOND(time)'},
        {label:'WEEKDAY', value: 'WEEKDAY(date)'},
        {label:'WEEKNUM', value: 'WEEKNUM(date, firstDay)'},
        {label:'DAYOFYEAR', value: 'DAYOFYEAR(date)'},
        {label:'ADDMONTHS', value: 'ADDMONTHS(date, number)'}
    ]},
    {label:'逻辑', value: '2', children: [
        {label:'CASE', value: 'CASE(expression, value1, result1, value2, result2,…,else_result)'},
        {label:'IF', value: 'IF(logical_test, value_if_true, value_if_false)'},
        {label:'ISNULL', value: 'ISNULL(expression)'},
        {label:'ISNUMBER', value: 'ISNUMBER(Text)'},
        {label:'NOT', value: 'NOT(logical)'},
        {label:'NULLVALUE', value: 'NULLVALUE(expression, substitute_expression)'},
        {label:'OR', value: 'OR(logical1,logical2,…)'},
        {label:'AND', value: 'AND(booleanExp1,booleanExp2,booleanExp3......)'}
    ]},
    {label:'数学', value: '3', children: [
        {label:'ABS', value: 'ABS(number)'},
        {label:'CEILING', value: 'CEILING(number)'},
        {label:'MAX', value: 'MAX(number,number,…)'},
        {label:'MIN', value: 'MIN(number,number,…)'},
        {label:'LN', value: 'LN(number)'},
        {label:'LOG', value: 'LOG(number)'},
        {label:'MOD', value: 'MOD(number,divisor)'},
        {label:'ROUND', value: 'ROUND(number,num_digits)'},
        {label:'SQRT', value: 'SQRT(number)'},
        {label:'FLOOR', value: 'FLOOR(number)'},
        {label:'RAND', value: 'RAND(length)'},
        {label:'RANDBETWEEN', value: 'RANDBETWEEN(min,max)'}
    ]},
    {label:'文本', value: '4', children: [
        {label:'BEGINS', value: 'BEGINS(text, compare_text)'},
        {label:'CONTAINS', value: 'CONTAINS(text, compare_text)'},
        {label:'FIND', value: 'FIND(search_text, text [, start_num])'},
        // {label:'INCLUDES', value: 'INCLUDES(multiselect_picklist_field, text_literal)'},
        {label:'ISPICKVAL', value: 'ISPICKVAL(picklist_field, text_literal)'},
        {label:'LEFT', value: 'LEFT(text, num_chars)'},
        {label:'LEN', value: 'LEN(text)'},
        {label:'LOWER', value: 'LOWER(text)'},
        {label:'LPAD', value: 'LPAD(text, padded_length [, pad_string])'},
        {label:'MID', value: 'MID(text, start_num, num_chars)'},
        {label:'RIGHT', value: 'RIGHT(text, num_chars)'},
        {label:'RPAD', value: 'RPAD(text, padded_length [, pad_string])'},
        {label:'SUBSTITUTE', value: 'SUBSTITUTE(text, old_text, new_text)'},
        {label:'TEXT', value: 'TEXT(value)'},
        {label:'TRIM', value: 'TRIM(text)'},
        {label:'UPPER', value: 'UPPER(text)'},
        {label:'VALUE', value: 'VALUE(text)'},
        {label:'PINYIN', value: 'PINYIN(text)'},
        {label:'PINYINFIRSTLETTER', value: 'PINYINFIRSTLETTER(text)'},
        {label:'FILECOUNT', value: 'FILECOUNT(Image/File)'}
    ]}
]

const props = defineProps({
    maxLevel: {
        type: Number,
        default: 5
    },
    // 1: 插入字段；2：插入运算符；3、插入公式
    types: {
        type: Array,
        default: [1,2,3]
    },
    dataType: String, // 场景中对应的数据类型，仅使用场景0,3时需要该参数	
    objectId: String, // 对象id，第一层请传当前对象ID
    usageType: Number, // 使用场景，0-字段默认值，1-自动编号(插入字段)，2-自动编号(插入公式)，3-计算类字段，4-校验规则
    grammarString: String, // 父组件生成的公式字符串，用于语法检查
    fieldsSource: Object,
    dataSource: Object
});

const objectItem = ref(sourceData);

const textRef = ref();
const buttonRefs = ref([]);
const hidePopover = ref(false);
const popoverWidth = ref(150);
const popoverHeight = ref(470);

const insetFields = (index) => {
    console.log('显示选择字段框', objectItem.value)
    textRef.value = buttonRefs.value[index];

    hidePopover.value = true;
    customCascaderRef.value.clear();
    customCascaderRef.value.getData();

    activeSelectItem.value = index;
    if(index === 1) {
        popoverHeight.value = 470;
        popoverWidth.value = 150;
    }
    if(index === 2) {
        popoverWidth.value = 150 * 2;
    }
}

const customCascaderRef = ref();

const onClickOutside  = () => {
    nextTick(() => {
        popoverWidth.value = 150;
        hidePopover.value = false;
    })
}

// 切换层级
const changeLevel = (n) => {
    console.log(n);
    popoverWidth.value = 150 * n;
}

// 函数子集
const functionChildren = ref([]);


// 函数子集
const selectFunction = ref([]);
// 点击函数下拉项
const moveFunction= (index) => {
    functionChildren.value = functionData[index].children;
}
// 二级popover 的 ref
const dropdownRefs = ref();
// 二级popover 是否显示隐藏
const showInsertFunction = ref(false);

// 下拉项改变
const insertFunction = () => {
    showInsertFunction.value = !showInsertFunction.value
    functionChildren.value = [];
}

// 插入运算符
const insertOperator = (item) => {
    console.log(item);
    emit('handleClick', {
        item,
        valueString: item.value,
        type: 2
    })
}

// 确定插入函数
const selectFunctionItem = (item) => {
    selectFunction.value = item;
    console.log(item)
    emit('handleClick', {
        item,
        valueString: item.value,
        type: 3
    })
}

// 修改字段选项
const changeOption = (item, valueString) => {
    console.log(111, valueString)
    emit('handleClick', {
        item,
        valueString: valueString,
        type: 1
    })
    nextTick(() => {
        popoverWidth.value = 150;
        onClickOutside();
        hidePopover.value = false;
    })
    customCascaderRef.value.clear();
}

// 语法检查
const grammarcheckBtn = () => {
    grammarcheck({
        checkCondition: props.grammarString,
        dataType: props.dataType,
        objectId: props.objectId,
        usageType: props.usageType
    }).then(res => {
        if(res.code === 10000) {
            ElMessage.success('语法正确');
        } else {
            ElMessage.error({
                dangerouslyUseHTMLString: true,
                message: '<div style="line-height: 18px;text-align:center">' + res.messageShow.replace(/\n/g,'<br>') + '</div>'
            });
        }
    })
}
</script>
<style lang="scss" scoped>
.all-purpose-filter{
    position: relative;
    .xhl-el-popper[data-popper-placement^=right]>.xhl-el-popper__arrow{
        display: none;
    }
    .function-listItem{
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }
}
.custom-Cascader {
    font-size: 14px;
    &-box{
        background: #fff;
        display: flex;
    }
    &-ul{
        width: 149px;
        border-right: 1px solid #E5E7ED;
        padding: 8px 0px;
        max-height: 390px;
        li{
            padding: 4px 12px;
            display: flex;
            align-items: center;
            cursor: pointer;
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
.function-card {
    display: inline-block;
    border-radius: 4px;
    position: absolute;
    left: 236px;
    &-ul{
        width: 149px;
        border-right: 1px solid #E5E7ED;
        padding: 8px 0px;
        background-color: #fff;
        float: left;
        max-height: 300px;
        overflow-y: scroll;
        li{
            padding: 4px 12px;
            display: flex;
            align-items: center;
            cursor: pointer;
            font-size: 14px;
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
<style lang="scss">
.xhl-el-popper.representation, .xhl-el-popper.representation-function-card {
    padding-left: 0px;
    padding-right: 0px;   
}
</style>