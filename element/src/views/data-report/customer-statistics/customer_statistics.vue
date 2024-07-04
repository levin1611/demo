<template>
    <Statistic
            :dimensionList="dimensionList"
            :quotaColumns="quotaColumns"
            :periodList="periodList"
            :authority="true"
            :reportUrl="'report/companyReport/getCompanyStatList'"
            :exportUrl="'report/companyReport/getCompanyStatListExcel'"></Statistic>
</template>

<script>
    import { mapState } from 'vuex';
    import Statistic from '../components/statistics';

    export default {
        name: 'customer_statistics',
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
                        key: 'weekIndex',
                        filter: true,
                        sort: true,
                        orderBy: 0,
                        time: true
                    },
                    {
                        value: 2,
                        title: this.$t('data_report.sourceChannel'),
                        key: 'sourceChannel',
                        filter: true,
                        sort: true,
                        orderBy: 0
                    },
                    // {value:4,title:'国家',key:'nation',filter:true,sort:true},
                    {
                        value: 5,
                        title: this.$t('data_report.salesman'),
                        key: 'saleName',
                        filter: true,
                        sort: true,
                        orderBy: 0
                    }
                    // {value:7,title:'跟进方式',key:'followupType',filter:true,sort:true},
                ], /* 所有维度列表 */
                quotaColumns: [
                    {
                        title: this.$t('data_report.customer_statistics.companyCount'),
                        key: 'companyCount',
                        filter: false,
                        sort: true,
                        orderBy: 1
                    },
                    {
                        title: this.$t('data_report.followupCount'),
                        key: 'followupCount',
                        filter: false,
                        sort: true,
                        orderBy: 2
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
                        orderBy: 3
                    },
                    {
                        title: this.$t('data_report.inquiryAdvanceRate'),
                        key: 'inquiryAdvanceRate',
                        filter: false,
                        sort: true,
                        orderBy: 5
                    }
                ],
                periodList: [
                    { value: '1', label: this.$t('data_report.period_list.date'), key: 'date' },
                    { value: '2', label: this.$t('data_report.period_list.week'), key: 'weekIndex' },
                    { value: '3', label: this.$t('data_report.period_list.month'), key: 'monthIndex' },
                    { value: '4', label: this.$t('data_report.period_list.quarter'), key: 'quarterIndex' },
                    { value: '5', label: this.$t('data_report.period_list.year'), key: 'yearIndex' }
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
