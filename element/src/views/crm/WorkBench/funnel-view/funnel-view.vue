<template>
    <div id="funnelView">
        <div class="screenArea">
            <Select v-show="workBenchType==='allInquiry'"
                    v-model="checkAllGroup"
                    multiple
                    filterable
                    size="small"
                    :placeholder="$t('crm.WorkBench.tip_departmentUser')"
                    style="width: 200px;text-align: left;">
                <Option v-for="(item, index) in salesmen" :value="item.key+''" :label="item.value" :key="index"></Option>
            </Select>
            <!-- <Poptip placement="bottom" v-show="workBenchType==='allInquiry'">
                <span class="sales-staff-flag">销售人员<Icon type="arrow-down-b" style="margin:0 5px"></Icon></span>
                <div slot="content" style="text-align:left">
                    <template>
                        <Checkbox style="margin-bottom:5px;"
                            :indeterminate="indeterminate"
                            :value="checkAll"
                            @click.prevent.native="handleCheckAll">
                            全选
                        </Checkbox>
                        <CheckboxGroup v-model="checkAllGroup" @on-change="checkAllGroupChange" class="checkboxgroup">
                            <Checkbox v-for="item in salesmen" :label="item.key">{{item.value}}</Checkbox>
                        </CheckboxGroup>
                    </template>
                </div>
            </Poptip> -->
            <DatePicker v-model="dateRange"
                        type="daterange"
                        value-format="yyyy-MM-dd"
                        :picker-options="date_limit"
                        unlink-panels
                        size="small"
                        :placeholder="$t('crm.WorkBench.tip_selectDate')"
                        style="width: 210px;"></DatePicker>
            <Button icon="ivu-icon ivu-icon-ios-search-strong"
                    circle
                    size="small"
                    @click="initChart"
                    class="piwik_crm_workBench_search_funnel workbench-filterButton"></Button>
        </div>
        <Card class="funnelBox"
              v-loading="funnelSpinShow"
              :element-loading-text="$t('crm.WorkBench.loading')"
              element-loading-spinner="ivu-icon ivu-icon-load-c">
            <div style="font-weight:700;font-size:16px">{{$t('crm.WorkBench.inquiryFunnelView')}}</div>
            <div id="funnelNode"></div>
        </Card>
        <Card class="funnelBox"
              style="float: right;"
              v-loading="columnSpinShow"
              :element-loading-text="$t('crm.WorkBench.loading')"
              element-loading-spinner="ivu-icon ivu-icon-load-c">
            <div style="font-weight:700;font-size:16px">{{$t('crm.WorkBench.closeInquiryReason')}}</div>
            <div id="columnNode"></div>
        </Card>
        <div style="display: none;" class="workbench-viewdistributionfunneldetails"></div>
    </div>
</template>

<script>
    import Utils from '@/utils';
    import { mapState } from 'vuex';
    import G2 from '@antv/g2';
    import { View } from '@antv/data-set';
    import { WorkBench } from '@/api/crm/index';
    const { getUserObjListExcludeDelete, getFunnelView, getCloseReason } = WorkBench;

    export default {
        name: 'funnelView',
        props: {
            workBenchType: String
        },
        data() {
            return {
                funnelOptions: {},
                columnOptions: {},
                colors: Utils.chartColors_90per,
                indeterminate: false,
                salesmen: [], // 销售人员列表
                checkAll: true,
                checkAllGroup: [],
                dateRange: [], // 选择的日期
                funnelData: [],
                funnelSpinShow: true,
                funnelchart: null,
                columnSpinShow: true,
                columnChart: null,
                followUpId: 0,
                date_limit: {
                    shortcuts: [
                        {
                            text: this.$t('crm.WorkBench.today'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.WorkBench.yesterday'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24);
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.WorkBench.recent7days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 6);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.WorkBench.recent14days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 13);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.WorkBench.recent30days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 29);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.WorkBench.thisWeek'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                let dayNo = start.getDay();
                                dayNo = dayNo ? dayNo - 1 : 6;
                                start.setTime(start.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.WorkBench.lastWeek'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                let dayNo = start.getDay();
                                dayNo = dayNo || 7;
                                end.setTime(end.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                start.setTime(end.getTime() - 6 * 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.WorkBench.thisMonth'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(new Date(start.getFullYear(), start.getMonth(), 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.WorkBench.lastMonth'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() - 24 * 60 * 60 * 1000);
                                start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        }
                    ],
                    disabledDate(date) {
                        return date.getTime() > Date.now() || date.getTime() < (new Date('2017-12-31')).getTime();
                    }
                }
            };
        },
        computed: {
            ...mapState([
                'enterpriseId',
                'userId'
            ]) // 从 vuex 中获取属性
        },
        methods: {
            initChart() {
                this.getFunnelData();
                this.getColumnData();
            },
            /** 根据用户获取该用户同一部门下所有用户列表 */
            getDepartUser() {
                getUserObjListExcludeDelete({
                    orgId: this.enterpriseId,
                    userId: this.userId
                }).then(response => {
                    if (response.code == '1') {
                        const dataList = response.data;
                        this.salesmen = dataList;
                        // this.checkAllGroup = this.salesmen.map(item => {
                        //     return item.key;
                        // });
                        this.initChart();
                    }
                });
            },
            /** 获取询盘漏斗数据 */
            getFunnelData() {
                this.funnelSpinShow = true;
                if (this.funnelchart) {
                    this.funnelchart.destroy();
                }
                this.funnelData = [];
                getFunnelView({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    admin: this.workBenchType === 'allInquiry' ? 1 : null,
                    saleIdList: this.workBenchType === 'allInquiry' ? this.checkAllGroup : [`${this.userId}`],
                    startTime: Array.isArray(this.dateRange) ? this.dateRange[0] : undefined,
                    endTime: Array.isArray(this.dateRange) ? this.dateRange[1] : undefined
                }).then(response => {
                    if (response.code === '1') {
                        this.funnelSpinShow = false;
                        const dataList = response.data;
                        const dataChange = [];
                        for (let i = 0; i < dataList.length; i++) {
                            let sum = 0;
                            // 这个代码是以前的,图形显示 '上大下小'
                            // for (let j = i; j < dataList.length; j++) {
                            //     sum += dataList[j].count;
                            // }
                            // 产品要求,图形最好可以显示为 '上小下大'
                            sum += dataList[i].count;
                            dataChange.push({
                                action: dataList[i].inquiryState,
                                pv: sum,
                                count: dataList[i].count,
                                id: dataList[i].inquiryStateId
                            });
                        }
                        this.funnelData = dataChange;
                        let data = this.funnelData;
                        const dv = new View().source(data);
                        dv.transform({
                            type: 'percent',
                            field: 'pv',
                            dimension: 'action',
                            as: 'percent'
                        });
                        data = dv.rows;
                        this.funnelchart = new G2.Chart({
                            container: 'funnelNode',
                            forceFit: true,
                            height: 400,
                            padding: [20, 100, 20, 20]
                        });
                        const funnelchart = this.funnelchart;
                        const that = this;
                        funnelchart.source(data, {
                            percent: {
                                nice: false
                            }
                        });
                        funnelchart.axis(false);
                        funnelchart.legend(false);

                        funnelchart.tooltip({
                            showTitle: false,
                            itemTpl: '<li data-index={index} style="margin-bottom:4px;">' + '<span style="background-color:{color};" class="g2-tooltip-marker"></span>' + '{name}<br/>' + '<span style="padding-left: 16px">{key}：{count}</span><br/>' + '</li>'
                        });
                        funnelchart.coord('rect').transpose().scale(1, -1);
                        funnelchart.intervalSymmetric().position('action*percent').shape('funnel').color('action', that.colors).label(
                            'action*count', function(action, count) {
                                return `${action} ${count}`;
                            },
                            {
                                offset: 35,
                                labelLine: {
                                    lineWidth: 1,
                                    stroke: 'rgba(0, 0, 0, 0.15)'
                                },
                                textStyle: {
                                    cursor: 'pointer'
                                }
                            }
                        ).tooltip('action*count', function(action, count) {
                            return {
                                name: action,
                                key: that.$t('crm.WorkBench.inquiryNumber'),
                                count: count
                            };
                        }).style({
                            cursor: 'pointer'
                        });
                        // data.forEach(function(obj) {
                        //   // 中间标签文本
                        //   chart.guide().text({
                        //     top: true,
                        //     position: {
                        //       action: obj.action,
                        //       percent: 'median'
                        //     },
                        //     content: parseInt(obj.percent * 100) + '%', // 显示的文本内容
                        //     style: {
                        //       fill: '#fff',
                        //       fontSize: '12',
                        //       textAlign: 'center',
                        //       shadowBlur: 2,
                        //       shadowColor: 'rgba(0, 0, 0, .45)'
                        //     }
                        //   });
                        // });
                        funnelchart.render();
                        funnelchart.forceFit();
                        funnelchart.on('interval:click', ev => {
                            const data = ev.data;
                            if (data) {
                                that.followUpState = data._origin.action;
                                that.followUpId = data._origin.id;
                                that.jumpToInquiry();
                            }
                        });
                        funnelchart.on('label:click', e => {
                            console.log(e);
                            if (e && e.data) {
                                const data = e.data;
                                that.followUpState = data.action;
                                that.followUpId = data.id;
                                that.jumpToInquiry();
                            }
                        });
                        // }
                    }
                });
            },
            /** 获取询盘关闭原因数据 */
            getColumnData() {
                this.columnSpinShow = true;
                if (this.columnChart) {
                    this.columnChart.destroy();
                }
                getCloseReason({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    admin: this.workBenchType === 'allInquiry' ? 1 : null,
                    saleIdList: this.workBenchType === 'allInquiry' ? this.checkAllGroup : [`${this.userId}`],
                    startTime: Array.isArray(this.dateRange) ? this.dateRange[0] : undefined,
                    endTime: Array.isArray(this.dateRange) ? this.dateRange[1] : undefined
                }).then(response => {
                    if (response.code == '1') {
                        this.columnSpinShow = false;
                        const dataList = response.data;
                        const data = [];
                        let maxCount = 0;
                        for (const item of dataList) {
                            if (item.count > maxCount) {
                                maxCount = item.count;
                            }
                            data.push({
                                closeReason: item.closeReason,
                                count: item.count
                            });
                        }
                        this.columnChart = new G2.Chart({
                            container: 'columnNode',
                            forceFit: true,
                            height: 400,
                            padding: [20, 20, 40, 'auto']
                        });
                        const columnChart = this.columnChart;
                        const that = this;
                        columnChart.source(data);

                        // 根据最大值判断间隔
                        let tickInterval = 0;
                        const mi = String(maxCount).length - 1;
                        tickInterval = Math.pow(10, mi);

                        columnChart.scale('count', {
                            tickInterval: tickInterval
                        });
                        columnChart.interval().position('closeReason*count').color('closeReason', this.colors).tooltip('count', function(count) {
                            return {
                                name: that.$t('crm.WorkBench.closedInquiryNumber'),
                                count: count
                            };
                        });
                        columnChart.tooltip({
                            // showTitle: false,
                            itemTpl: '<span style="padding-left: 16px">{name}：{count}</span><br/>' + '</li>'
                        });
                        columnChart.render();
                        columnChart.forceFit();
                    }
                });
            },
            handleCheckAll() {
                if (this.indeterminate) {
                    this.checkAll = false;
                } else {
                    this.checkAll = !this.checkAll;
                }
                this.indeterminate = false;

                if (this.checkAll) {
                    this.checkAllGroup = this.salesmen.map(item => {
                        return `${item.key}`;
                    });
                } else {
                    this.checkAllGroup = [];
                }
                this.initChart();
            },
            checkAllGroupChange(data) {
                this.initChart();
                if (data.length === this.salesmen.length) {
                    this.indeterminate = false;
                    this.checkAll = true;
                } else if (data.length > 0) {
                    this.indeterminate = true;
                    this.checkAll = false;
                } else {
                    this.indeterminate = false;
                    this.checkAll = false;
                }
            },
            /** 点击跳转到询盘 */
            jumpToInquiry() {
                // 手动创建一个元素, 尝试解决图标上无法加追踪 class 的问题
                const temp = document.getElementsByClassName('workbench-viewdistributionfunneldetails')[0];
                if (temp) {
                    temp.click();
                }

                // console.log(this.followUpId);
                // this.$router.push({
                //     name: 'myInquiry',
                //     params: {
                //         workBench_type: this.workBenchType,
                //         screenDate:this.dateRange,
                //         followUpId:this.followUpId,
                //         saleIdList:this.workBenchType==='allInquiry'?this.checkAllGroup:[this.userId+'']
                //     }
                // })
                // 简单询盘处理如果有类似问题联系杨洋进行工厂处理
                const randomId = this.$dym.Rnum(8);
                // target 模块所要更新的key 参照 myInquiry checkRouteParams
                localStorage.setItem(`matchTargetChangeKeys${randomId}`, JSON.stringify([
                    'workBench_type',
                    'screenDate',
                    'followUpId',
                    'saleIdList'
                ]));
                // --------------------------------------------------------- split
                localStorage.setItem(`leadsCloud-workBench_type${randomId}`, this.workBenchType);
                localStorage.setItem(`leadsCloud-screenDate${randomId}`, JSON.stringify(this.dateRange));
                localStorage.setItem(`leadsCloud-followUpId${randomId}`, this.followUpId);
                localStorage.setItem(`leadsCloud-saleIdList${randomId}`, JSON.stringify(this.workBenchType === 'allInquiry' ? this.checkAllGroup : [`${this.userId}`]));
                window.open(this.$router.resolve({
                    name: 'myInquiry',
                    query: {
                        i: randomId,
                        k: `matchTargetChangeKeys${randomId}` // 定义要更新的取的listKey名
                    }
                }).href, '_blank');
            }
        },
        created() {
        },
        mounted() {
            this.getDepartUser();
        },
        watch: {
            workBenchType() {
                this.checkAllGroup = [];
                this.initChart();
            }
        }
    };
</script>

<style scoped lang="less">
    .workbench-filterButton {
        padding: 7px 9px;

        /deep/ i {
            font-size: 16px;
        }
    }
</style>

<style lang="less">
    #funnelView {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: rgba(0, 0, 0, 0.8);

        .screenArea {
            text-align: right;
            margin-bottom: 20px;

            .sales-staff-flag {
                cursor: pointer;

                &:hover {
                    color: #FA8241;
                }
            }

            .ivu-poptip-popper {
                min-width: 90px;

                .ivu-poptip-content {
                    position: absolute;
                }
            }
        }

        .funnelBox {
            display: inline-block;
            text-align: center;
            width: 49%;
            min-height: 400px;
            overflow: auto;

            .demo-spin-icon-load {
                animation: ani-demo-spin 1s linear infinite;
            }
        }

        .checkboxgroup > label {
            display: block;
            margin-bottom: 5px;
            max-width: 120px;
            word-break: break-all;
        }
    }
</style>
