<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div>
        <!-- 主属性 -->
        <template v-if="column.dataKey === 'customer'">
            <el-link
            type="primary"
                @click="showDetial">{{data[column.dataKey]}}</el-link>
        </template>
        <!-- whatsApp -->
        <template v-else-if="column.dataKey === 'whatsApp'">
            <el-link
                @click="showWhatsapp">{{data[column.dataKey]}}</el-link>
        </template>
        
       <template v-else>
            <!-- 网址 -->
            <template v-if="[5].includes(column.dataType)">
                <el-link
                    type="primary"
                    @click.stop="handleClick()">{{data[column.dataKey]}}</el-link>
            </template>
            <!-- 邮箱 -->
            <template v-else-if="[4].includes(column.dataType)">
                <el-link
                    @click="handleClick()">{{data[column.dataKey]}}</el-link>
            </template>
            <!-- 图片 -->
            <template v-else-if="[7].includes(column.dataType)">
                <el-link
                    @click="handleClick()">{{data[column.dataKey]}}</el-link>
            </template>
            <!-- 文件 -->
            <template v-else-if="[6].includes(column.dataType)">
                <el-link
                    @click="handleClick()">{{data[column.dataKey]}}</el-link>
            </template>
            <!--布尔 -->
            <template v-else-if="[10, 20].includes(column.dataType)">
                {{data[column.dataKey] ? '是' : '否'}}
            </template>
            <!--定位 -->
            <template v-else-if="[27].includes(column.dataType)">
                <el-link
                    @click="handleClick()">{{data[column.dataKey]}}</el-link>
            </template>
             <!--关联关系/引用/选项 -->
             <template v-else-if="[28, 29, 25, 26].includes(column.dataType)">
                <el-link
                    v-if="['objectType', 'staff', 'department'].includes(column.objApiKey)"
                    @click="handleClick()">{{data[column.dataKey + '_value']}}</el-link>

                    <span v-else>{{data[column.dataKey + '_value']}}</span>
            </template>
            <template v-else>
                {{data[column.dataKey]}}
            </template>
       </template>
    </div>
</template>
<script setup>
import { reactive, ref, isRef, toRefs, watch, useAttrs } from 'vue';
import { usePage } from '@/hooks/pagenation.js';

// 接受外部传参
const props = defineProps({
    column: {
        type: Object,
        default: () => ({})
    },
    data: {
        type: Object,
        default: () => ({})
    }
});

// 定义 emit
const emits = defineEmits([ 'showDetial', 'showWhatsapp', 'preview' ]);

// 接收非 props 传参, 方便在外部直接使用 el-pagination 的 props
const attrs = useAttrs();

const { column, data } = toRefs(props);

const showDetial = () => {
    emits('showDetial', { rowData: data });
}

const showWhatsapp = () => {
    emits('showWhatsapp');
}

const handleClick = () => {
    switch(column.dataType) {
        // 网址
        case 5:
            window.open(data[column.dataKey], '_blank');
            break;
        // 文件 
        case 6:
        // 图片 
        case 7:
            emits('preview', { rowData: data });
            break;
        // 关联关系 
        case 29:
        case 28:
            emits('showDetial', { rowData: data });
            break;
        default:
            break;
    }
}

</script>
<style lang="scss" scoped>
</style>