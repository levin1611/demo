<template>
    <Statistic
            :dimensionList="dimensionList"
            :quotaColumns="quotaColumns"
            :periodList="periodList"
            :reportUrl="'report/chatStatistics/getStatistics'"
            :exportUrl="'report/chatStatistics/download'"></Statistic>
</template>

<script>
    import { mapState } from 'vuex';
    import Statistic from '../components/statistics';

    export default {
        name: 'conversation_statistics',
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
                        width: 120,
                        value: 1,
                        title: this.$t('data_report.date'),
                        key: 'dimension',
                        filter: true,
                        sort: true,
                        orderBy: 2,
                        time: true
                    },
                    {
                        width: 120,
                        value: 10,
                        title: this.$t('data_report.timeQuantum'),
                        key: 'dimension',
                        filter: true,
                        sort: true,
                        orderBy: 2
                    },
                    {
                        width: 120,
                        value: 16,
                        title: this.$t('data_report.customerServiceStaff'),
                        key: 'dimension',
                        filter: true,
                        sort: true,
                        orderBy: 2
                    }
                ], /* 所有维度列表 */
                quotaColumns: [
                    {
                        width: 160,
                        title: this.$t('data_report.conversation_statistics.onlineTimeCount'),
                        key: 'onlineTimeCount',
                        filter: false,
                        sort: true,
                        orderBy: 3
                    },
                    {
                        width: 160,
                        title: this.$t('data_report.conversation_statistics.onlineTimeDupCount'),
                        key: 'onlineTimeDupCount',
                        filter: false,
                        sort: true,
                        orderBy: 4
                    },
                    {
                        width: 100,
                        title: this.$t('data_report.conversation_statistics.onlineRate'),
                        key: 'onlineRate',
                        filter: false,
                        sort: true,
                        orderBy: 5
                    },
                    {
                        width: 120,
                        title: this.$t('data_report.conversation_statistics.visitorCount'),
                        key: 'visitorCount',
                        filter: false,
                        sort: true,
                        orderBy: 6
                    },
                    {
                        width: 120,
                        title: this.$t('data_report.conversation_statistics.visitorMsgCount'),
                        key: 'visitorMsgCount',
                        filter: false,
                        sort: true,
                        orderBy: 7
                    },
                    {
                        width: 140,
                        title: this.$t('data_report.conversation_statistics.avgVisitorMsgCount'),
                        key: 'avgVisitorMsgCount',
                        filter: false,
                        sort: true,
                        orderBy: 8
                    },
                    {
                        width: 130,
                        title: this.$t('data_report.conversation_statistics.chatClueCount'),
                        key: 'clueCount',
                        filter: false,
                        sort: true,
                        orderBy: 9
                    },
                    {
                        width: 130,
                        title: this.$t('data_report.conversation_statistics.chatSucRate'),
                        key: 'chatSucRate',
                        filter: false,
                        sort: true,
                        orderBy: 10
                    },
                    // {width:90,title:'遗漏数',key:'missingCount',filter:false,sort:true,orderBy:11},
                    // {width:90,title:'遗漏率',key:'missingRate',filter:false,sort:true,orderBy:11},
                    {
                        width: 130,
                        title: this.$t('data_report.conversation_statistics.chatInquiryCount'),
                        key: 'inquiryCount',
                        filter: false,
                        sort: true,
                        orderBy: 13
                    },
                    {
                        width: 130,
                        title: this.$t('data_report.leads_statistics.garbageClueCount'),
                        key: 'rubClueCount',
                        filter: false,
                        sort: true,
                        orderBy: 14
                    },
                    {
                        width: 130,
                        title: this.$t('data_report.leads_statistics.followupClueCount'),
                        key: 'floClueCount',
                        filter: false,
                        sort: true,
                        orderBy: 15
                    },
                    {
                        width: 130,
                        title: this.$t('data_report.leads_statistics.clueConversionRate'),
                        key: 'clueRevRate',
                        filter: false,
                        sort: true,
                        orderBy: 16
                    },
                    {
                        width: 130,
                        title: this.$t('data_report.conversation_statistics.invalidClueRate'),
                        key: 'uselessClueRate',
                        filter: false,
                        sort: true,
                        orderBy: 17
                    },
                    {
                        width: 130,
                        title: this.$t('data_report.message_statistics.timelyClueCount'),
                        key: 'floCount',
                        filter: false,
                        sort: true,
                        orderBy: 18
                    },
                    {
                        width: 130,
                        title: this.$t('data_report.message_statistics.timelyRate'),
                        key: 'floRate',
                        filter: false,
                        sort: true,
                        orderBy: 19
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
