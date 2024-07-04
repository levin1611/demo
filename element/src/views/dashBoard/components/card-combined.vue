<template>
    <!-- 仪表盘实现拖拽 card-whatsApp card-world-time 两个组件要作为一体来拖拽 因此合并为此组件 -->
    <div class="_b_r">
        <WA style="margin-bottom: 15px;"/>
        <ExchangeRate/>
        <deleteIcon @removeFromDashBoard="removeFromDashBoard" style="position: absolute;bottom: 0px; right: 0px"/>
    </div>
</template>

<script>
    import WA from './card-whatsApp';
    import ExchangeRate from './exchange-rate';
    import deleteIcon from './deleteIcon';
    export default {
        name: 'card-combined',
        components: {
            WA,
            ExchangeRate,
            deleteIcon
        },
        methods: {
            removeFromDashBoard() {
                this.$emit('removeFromDashBoard', 'WAWT');
            }
        },
        computed: {
            isConfig() {
                return this.$store.state.dashboard.isConfiguring;
            }
        }
    };
</script>

<style scoped lang="less">
    .b-r {
        border-radius: 8px;
    }
</style>
