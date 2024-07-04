<template>
    <keep-alive :include="Cachepage">
        <router-view ref="child"/>
    </keep-alive>
</template>
<script>
    export default {
        name: 'ParentView',
        data() {
            return {
                cacheChaildName: ''
            };
        },
        computed: {
            Cachepage() {
                return this.$store.state.app.cachePage;
            }
        }
    };
</script>
