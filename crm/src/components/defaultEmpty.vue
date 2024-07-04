// 默认的空状态组件
<template>
    <el-empty
        :image="image"
        :image-size="354"
        :description="props.description"
    >
        <slot></slot>
    </el-empty>
</template>

<script setup>
// 引入 i18n
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import image from '@/assets/images/nodata.png';

const props = defineProps({
    description: {
        default: () => {
            return '暂无数据';
        }
    }
});
// 引入 publicPath
const publicPath = process.env.BASE_URL;
</script>