<template>
    <Statistic
            :dimensionList="dimensionList"
            :quotaColumns="quotaColumns"
            :periodList="periodList"
            :reportUrl="'report/formReport/getFormStatList'"
            :exportUrl="'report/formReport/getFormStatListExcel'"></Statistic>
</template>
<script>
    import util from '@/libs/util.js';
    import {mapState} from 'vuex';
    import FilterBox from '../components/filter-box';
    import Statistic from '../components/statistics';

    export default {
        name: 'message_statistics',
        components: {
            FilterBox,
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
                        orderBy: 0,
                        time: true
                    },
                    {
                        value: 2,
                        title: this.$t('data_report.sourceChannel'),
                        key: 'dimension',
                        filter: true,
                        sort: true,
                        orderBy: 0
                    },
                    {
                        value: 10,
                        title: this.$t('data_report.timeQuantum'),
                        key: 'dimension',
                        filter: true,
                        sort: true,
                        orderBy: 0
                    }
                ], /* 所有维度列表 */
                quotaColumns: [
                    {
                        title: this.$t('data_report.message_statistics.messageCount'),
                        key: 'messageCount',
                        filter: false,
                        sort: true,
                        orderBy: 1
                    },
                    {
                        title: this.$t('data_report.message_statistics.unrelatedMessageCount'),
                        key: 'unrelatedMessageCount',
                        filter: false,
                        sort: true,
                        orderBy: 2
                    },
                    {
                        title: this.$t('data_report.message_statistics.messageClueCount'),
                        key: 'clueCount',
                        filter: false,
                        sort: true,
                        orderBy: 3
                    },
                    {
                        title: this.$t('data_report.message_statistics.leaveInquiryCount'),
                        key: 'inquiryCount',
                        filter: false,
                        sort: true,
                        orderBy: 4
                    },
                    {
                        title: this.$t('data_report.message_statistics.messageRate'),
                        key: 'messageRate',
                        filter: false,
                        sort: true,
                        orderBy: 5
                    },
                    {
                        title: this.$t('data_report.message_statistics.clueRate'),
                        key: 'clueRate',
                        filter: false,
                        sort: true,
                        orderBy: 6
                    },
                    {
                        title: this.$t('data_report.message_statistics.timelyClueCount'),
                        key: 'timelyClueCount',
                        filter: false,
                        sort: true,
                        orderBy: 7
                    },
                    {
                        title: this.$t('data_report.message_statistics.timelyRate'),
                        key: 'timelyRate',
                        filter: false,
                        sort: true,
                        orderBy: 8
                    }
                ],
                periodList: [
                    {value: '1', label: this.$t('data_report.period_list.date'), key: 'dimension'},
                    {value: '2', label: this.$t('data_report.period_list.week'), key: 'dimension'},
                    {value: '3', label: this.$t('data_report.period_list.month'), key: 'dimension'},
                    {value: '4', label: this.$t('data_report.period_list.quarter'), key: 'dimension'},
                    {value: '5', label: this.$t('data_report.period_list.year'), key: 'dimension'}
                ]
            };
        },
        methods: {
            /* 改变统计周期 */
            changePeriod(data) {
                this.dimensionList[0] = {...this.dimensionList[0], ...data};
            }
        }
    };
    Date.prototype.format = function(fmt) {
        let o = {
            'M+': this.getMonth() + 1, // 月份
            'd+': this.getDate(), // 日
            'h+': this.getHours(), // 小时
            'm+': this.getMinutes(), // 分
            's+': this.getSeconds(), // 秒
            'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
            'S': this.getMilliseconds() // 毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()
            }`).substr(4 -
                RegExp.$1.length));
        }
        for (let k in o) {
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
