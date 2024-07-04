<template>
    <div>
        <keep-alive>
            <component
                :is="view"
                :ref="view"
                :query="query"
                @handleView="handleView"
            ></component>
        </keep-alive>
    </div>
</template>
<script>
    import addressList from './address-list';
    import emailList from './email-list';
    export default {
        props: [],
        components: { addressList, emailList },
        data() {
            return {
                view: 'addressList',
                query: {}
            };
        },
        computed: {
        },
        created() {
        },
        mounted() {},
        methods: {
            handleView(v) {
                this.view = v.com;
                this.query = v.query;
                if (v.com == 'emailList') {
                    setTimeout(res => {
                        this.$refs[v.com].refreshData();
                    });
                }
            }
        },
        watch: {}
        // beforeRouteLeave(to, from, next) {
        //     if (this.view === 'newMarketing') {
        //         this.$refs[this.view].$refs.footerOperate.handleCancel();
        //     } else {
        //         next();
        //     }
        // }
    };
</script>
<style lang="less" scoped>

</style>
