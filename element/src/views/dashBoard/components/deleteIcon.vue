<template>
    <div v-if="isConfig && !isOpenAddModal" @click="removeFromDashBoard" class="hoverBtn">
<!--        <Icon custom="custom-delete-component" size="36" @click="removeFromDashBoard"></Icon>-->
        <svg class="custom" aria-hidden="true" style="width: 36px; height: 36px;display: block; z-index: 999">
            <use xlink:href="#custom-delete-component"></use>
        </svg>
    </div>
</template>

<script>
    export default {
        name: 'deleteIcon',
        props: ['id'],
        computed: {
            isConfig() {
                // return this.$store.state.dashboard.isConfiguring;
                return false;
            },
            isOpenAddModal() {
                return this.$store.state.dashboard.isShowAddModal;
            }
        },
        methods: {
            removeFromDashBoard() {
                this.$emit('removeFromDashBoard');
            }
        }
    };
</script>

<style scoped lang="less">
    .hoverBtn {
        cursor: pointer;
    }
</style>
