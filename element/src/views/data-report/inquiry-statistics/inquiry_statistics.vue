<template>
    <Statistic
            :dimensionList="dimensionList"
            :quotaColumns="quotaColumns"
            :periodList="periodList"
            :authority="true"
            :reportUrl="'report/statisticsInquiry/getList'"
            :exportUrl="'report/statisticsInquiry/download'"></Statistic>
</template>

<script>
    import { mapState } from 'vuex';
    import Statistic from '../components/statistics';

    export default {
        name: 'inquiry_statistics',
        components: {
            Statistic
        },
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId'
            })
        },
        data() {
            return {
                dimensionList: [
                    {
                        value: 1,
                        title: this.$t('data_report.date'),
                        key: 'dimension',
                        filter: true,
                        sort: true,
                        orderBy: 1,
                        time: true
                    },
                    {
                        value: 2,
                        title: this.$t('data_report.sourceChannel'),
                        key: 'dimension',
                        filter: true,
                        orderBy: 1,
                        sort: true
                    },
                    {
                        value: 3,
                        title: this.$t('data_report.sourceWay'),
                        key: 'dimension',
                        filter: true,
                        orderBy: 1,
                        sort: true
                    },
                    // {value:4,title:'国家',key:'dimension',filter:true,sort:true,orderBy:1,sort:true},
                    {
                        value: 5,
                        title: this.$t('data_report.salesman'),
                        key: 'dimension',
                        filter: true,
                        orderBy: 1,
                        sort: true
                    },
                    {
                        value: 6,
                        title: this.$t('data_report.inquiryLevel'),
                        key: 'dimension',
                        filter: true,
                        orderBy: 1,
                        sort: true
                    }
                ], /* 所有维度列表 */
                quotaColumns: [
                    {
                        title: this.$t('data_report.inqCount'),
                        key: 'inquiryCount',
                        filter: false,
                        sort: true,
                        orderBy: 2
                    },
                    {
                        title: this.$t('data_report.followupCount'),
                        key: 'followupCount',
                        filter: false,
                        sort: true,
                        orderBy: 3
                    },
                    {
                        title: this.$t('data_report.followupCountAvg'),
                        key: 'followupCountAvg',
                        filter: false,
                        sort: true,
                        orderBy: 4
                    },
                    {
                        title: this.$t('data_report.inquiryAdvanceCount'),
                        key: 'inquiryAdvanceCount',
                        filter: false,
                        sort: true,
                        orderBy: 5
                    },
                    {
                        title: this.$t('data_report.inquiryAdvanceRate'),
                        key: 'inquiryAdvanceRate',
                        filter: false,
                        sort: true,
                        orderBy: 6
                    }
                ],
                periodList: [
                    { value: '1', label: this.$t('data_report.period_list.date'), key: 'dimension' },
                    { value: '2', label: this.$t('data_report.period_list.week'), key: 'dimension' },
                    { value: '3', label: this.$t('data_report.period_list.month'), key: 'dimension' },
                    { value: '4', label: this.$t('data_report.period_list.quarter'), key: 'dimension' },
                    { value: '5', label: this.$t('data_report.period_list.year'), key: 'dimension' }
                ]
            };
        },
        methods: {
            /* 改变统计周期 */
            changePeriod(data) {
                this.dimensionList[0] = { ...this.dimensionList[0], ...data };
            }
        }
    };
</script>

<style lang="less">
    @import '../css/statistic-report.less';
</style>
