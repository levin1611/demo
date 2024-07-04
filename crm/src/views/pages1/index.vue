<template>
    <div ref="aaa">1{{t('menu.dashBoard')}}</div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
// 局部调用多语言
import { t } from '@/locale';

const aaa = ref(null);

onMounted(() => {
    console.log(222, aaa.value);
});

</script>