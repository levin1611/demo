<template>
    <Statistic
            :dimensionList="dimensionList"
            :quotaColumns="quotaColumns"
            :periodList="periodList"
            :authority="true"
            :reportUrl="'/report/clueReport/getClueStatList'"
            :exportUrl="'/report/clueReport/getClueStatListExcel'"></Statistic>
</template>
<script>
    import { mapState } from 'vuex';
    import Statistic from '../components/statistics';

    export default {
        name: 'leads_statistics',
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
                    // {value:2,title:'询盘等级 '},
                    {
                        value: 2,
                        title: this.$t('data_report.sourceChannel'),
                        key: 'sourceChannel',
                        filter: true,
                        sort: true,
                        orderBy: 0
                    },
                    {
                        value: 3,
                        title: this.$t('data_report.sourceWay'),
                        key: 'sourceWay',
                        filter: true,
                        sort: true,
                        orderBy: 0
                    },
                    {
                        value: 4,
                        title: this.$t('data_report.nation'),
                        key: 'nation',
                        filter: true,
                        sort: true,
                        orderBy: 0
                    },
                    {
                        value: 5,
                        title: this.$t('data_report.salesman'),
                        key: 'saleName',
                        filter: true,
                        sort: true,
                        orderBy: 0
                    }
                    // {value:5,title:'销售人员'},
                    // {value:6,title:'询盘等级'},
                ], /* 所有维度列表 */
                quotaColumns: [
                    { title: this.$t('data_report.clueCount'), key: 'clueCount', filter: false, sort: true, orderBy: 1 },
                    {
                        title: this.$t('data_report.inqCount'),
                        key: 'inquiryCount',
                        filter: false,
                        sort: true,
                        orderBy: 2
                    },
                    {
                        title: this.$t('data_report.leads_statistics.garbageClueCount'),
                        key: 'garbageClueCount',
                        filter: false,
                        sort: true,
                        orderBy: 3
                    },
                    {
                        title: this.$t('data_report.leads_statistics.followupClueCount'),
                        key: 'followupClueCount',
                        filter: false,
                        sort: true,
                        orderBy: 4
                    },
                    {
                        title: this.$t('data_report.leads_statistics.timelyFollowupClueCount'),
                        key: 'timelyFollowupClueCount',
                        filter: false,
                        sort: true,
                        orderBy: 5
                    },
                    {
                        title: this.$t('data_report.leads_statistics.clueConversionRate'),
                        key: 'clueConversionRate',
                        filter: false,
                        sort: true,
                        orderBy: 6
                    },
                    {
                        title: this.$t('data_report.leads_statistics.garbageClueRate'),
                        key: 'garbageClueRate',
                        filter: false,
                        sort: true,
                        orderBy: 7
                    },
                    {
                        title: this.$t('data_report.leads_statistics.timelyFollowupClueRate'),
                        key: 'timelyFollowupClueRate',
                        filter: false,
                        sort: true,
                        orderBy: 8
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
    // eslint-disable-next-line no-extend-native
    Date.prototype.format = function(fmt) {
        const o = {
            'M+': this.getMonth() + 1, // 月份
            'd+': this.getDate(), // 日
            'h+': this.getHours(), // 小时
            'm+': this.getMinutes(), // 分
            's+': this.getSeconds(), // 秒
            'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
            S: this.getMilliseconds() // 毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()
            }`).substr(4 -
                RegExp.$1.length));
        }
        for (const k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
                    ? (o[k])
                    : ((`00${o[k]}`).substr((`${o[k]}`).length)));
            }
        }
        return fmt;
    };
</script>
<style lang="less">
    @import '../css/statistic-report.less';
</style>
