<template>
    <div>
        <component
                :is="view"
                :ref="view"
                :triggerObjectValue="triggerObjectValue"
                :ruleId="ruleId"
                @handleView="handleView"
        ></component>
    </div>
</template>
<script>
    import tableList from './automated_allocation.vue';
    import automaticAllocationRules from './automatic_allocation_rules.vue';
    export default {
        props: [],
        components: { tableList, automaticAllocationRules },
        data() {
            return {
                view: 'tableList',
                id: null,
                triggerObjectValue: '', // 触发对象
                ruleId: ''
            };
        },
        computed: {
        },
        created() {
        },
        mounted() {
        },
        methods: {
            handleView(v, triggerObjectValue, id) {
                this.view = v;
                this.triggerObjectValue = triggerObjectValue;
                this.ruleId = id;
            }
        },
        watch: {}
    };
</script>
<style lang="less" scoped>

</style>
