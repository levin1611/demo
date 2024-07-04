<template>
    <div>
        <component
                :is="view"
                :ref="view"
                :id="id"
                @handleView="handleView"
        ></component>
    </div>
</template>
<script>
    import tableList from './components/tableList.vue';
    import newMarketing from './components/newMarketing.vue';
    import marketingReport from './components/report/index.vue';
    export default {
        props: [],
        components: { tableList, newMarketing, marketingReport },
        data() {
            if (this.$route.params && (this.$route.params.view || this.$route.params.data)) {
                localStorage.setItem('routeParams', JSON.stringify(this.$route.params));
            }
            return {
                view: (this.$route.params && this.$route.params.view) || 'tableList',
                id: null
            };
        },
        computed: {
        },
        created() {
        },
        mounted() {
        },
        methods: {
            handleView(v, id) {
                this.view = v;
                if (v === 'newMarketing' || v === 'marketingReport') {
                    this.id = id;
                }
            }
        },
        watch: {},
        beforeRouteLeave(to, from, next) {
            if (this.view === 'newMarketing') {
                this.$refs[this.view].$refs.footerOperate.handleCancel();
            } else {
                next();
            }
        },
        destroyed() {
            this.$store.commit('set_mail_edm_config', {});
            this.$store.commit('set_mail_edm_sort', '');
            this.$store.commit('set_mail_edm_sortType', '');
            this.$store.commit('setEdmCurrentPage', 1);
            this.$store.commit('setMarketingTitle', 2);
        }
    };
</script>
<style lang="less" scoped>

</style>
