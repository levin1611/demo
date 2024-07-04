<template>
    <div class="little-detail drawer-close-button-moveUp">
        <!-- 自定义头部内容 -->
        <div class="drawer_header">
            <!-- 自定义关闭按钮 -->
            <a @click="visibleChange(false)"
                class="drawer-close-button">
                <Icon custom="custom-drawer-detail-close"></Icon>
            </a>
        </div>
        <div style="height: calc(100% - 34px); overflow-y: auto;">
            <detailWrap :selectedChatInfo="selectedChatInfo" :from="from" @emitFreshLeadsCLoudsStatus="emitFreshLeadsCLoudsStatus"></detailWrap>
        </div>
    </div>
</template>

<script>
    import detailWrap from '@/views/main-components/detailWrap/index';
    export default {
        name: 'littleDetail',
        components: {
            detailWrap
        },
        props: [
            'selectedChatInfo', // 传过来的选中当前人的对象，包含当前人的id和其它信息
            'from' // 记录从哪个组件调用
        ],
        computed: {
        },
        data() {
            return {
            };
        },
        methods: {
            visibleChange(val) {
                this.$emit('changeShowDetail', val);
            },
            emitFreshLeadsCLoudsStatus(data) {
                this.$emit('emitFreshLeadsCLoudsStatus', data);
            }
        },
        beforeDestroy() {
        },
        watch: {
        }
    };
</script>
<style lang="less" scoped>
    .little-detail {
        position: relative;
        height: calc(100vh - 110px);
        .drawer_header{
            height: 30px;
            // background: #fff;
            position: relative;
            top: 0;
            width: 100%;
            z-index: 9;
        }
    }
</style>
