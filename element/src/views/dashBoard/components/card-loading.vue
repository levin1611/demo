<template>
    <div class="loading" v-loading="true">
    </div>
</template>

<script>
    export default {
        name: 'card-loading'
    }
</script>

<style scoped lang="less">
    .loading {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 9999;
        width: 100vw;
        height: 100vh;
    }
</style>
