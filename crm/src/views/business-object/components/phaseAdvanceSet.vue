<template>
    <div>
        <phaseAdvanceSet :activeItem="props.activeItem"></phaseAdvanceSet>
    </div>
</template>
<script setup>
import { ref, onMounted, inject, watch } from 'vue';
import phaseAdvanceSet from '@/views/phaseAdvanceSet/index.vue'
const props = defineProps({
    activeItem: {
        type: Number
    }
});
</script>
<style lang="scss" scoped>
</style>