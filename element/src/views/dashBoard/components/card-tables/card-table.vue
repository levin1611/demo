<template>
    <Card class="table_card _b_r" :body-style="bodyStyle">
        <!-- 首列 -->
        <div class="table_header _f _j_b">
            <div class="table_header_left _f _c _j_b">
                <!-- 标题 -->
                <span class="table_title">{{tableDetail.title}}
                    <HelpTip v-if="kind === 'followUpOverview'" :iconSize="14"
                             :title="$t('helpTip.customerFollowUpOverview')"></HelpTip>
                    <HelpTip v-else-if="kind === 'remind'" :iconSize="14"
                             :title="$t('helpTip.sleepReminderTip')"></HelpTip>
                    <HelpTip v-else-if="['mail', 'workload', 'todoList', 'keyAccount'].includes(kind)" :iconSize="14"
                             :title="$t(`helpTip.${kind}`)"></HelpTip>
                </span>


                <!-- 标题底部日期 -->
                <span class="table_date" v-if="!['todoList', 'target', 'targetOverview', 'followUpOverview', 'remind', 'workload', 'keyAccount', 'mail', 'business'].includes(kind)">{{startDate}} ~ {{endDate}}</span>
            </div>
            <div class="_f _j_b _a_c">
                <!-- 成交, 日期筛选 -->
                <div class="table_header_center" v-if="['target', 'targetOverview'].includes(kind)">
                    <!-- 成交金额 && 成交询盘Select-->
                    <Select v-model="targetType" size="small" class="target_type_select" @change="handleTypeChange" v-if="kind ==='target'">
                        <Option v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"></Option>
                    </Select>
                    <!-- 日期Select-->
                    <!-- <Select v-model="targetDate" size="small" class="target_date_select" @change="handleDateChange(targetDate)" v-if="kind ==='target'">
                        <Option v-for="item in dateOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"></Option>
                    </Select> -->
                    <div v-if="kind ==='target'"
                        class="table_header_right">
                        <CardFilter :cardType="kind"
                                filterType="dateMothe"
                                :filterValue="dateMotheDateRange"
                                @handleFilter="handleFilter"></CardFilter>
                    </div>
                </div>
                <!-- 新型筛选控件 -->
                <div v-if="['followUpOverview', 'remind', 'workload', 'keyAccount', 'mail', 'business'].includes(kind)"
                     class="table_header_right">
                    <CardFilter :cardType="kind"
                                :filterType="filterType"
                                :filterKey="filterKey"
                                :filterValue="dateRange"
                                @handleFilter="handleFilter"></CardFilter>
                </div>
                <!-- 个人/管理 视图切换 -->
                <div v-if="!['targetOverview', 'followUpOverview', 'remind'].includes(kind)"
                     class="table_header_right">
                    <Tabs type="card" v-model="activeTab" @tab-click="handleTabClick" class="table_header_tabs">
                        <TabPane name="personal">
                            <div slot="label" :class="`piwik_personal_${kind}`">
                                <span>{{$t('dashBoardV2.Table.personalView')}}</span>
                            </div>
                        </TabPane>
                        <TabPane name="manager">
                            <div slot="label" :class="`piwik_manager_${kind}`">
                                <span>{{$t('dashBoardV2.Table.manageView')}}</span>
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
                <!-- 下载 -->
                <div class="table_header_right" v-if="['workload','followUpOverview', 'remind', 'mail'].includes(kind)" style="margin-left: 20px">
                    <Tooltip :content="$t('dashBoardV2.Table.export')" effect="dark" placement="top">
                        <Icon class="cursor-pointer" :class="`piwik-${kind}-exportBtn`" color="#677F99" custom="custom-icon_xiazai" size="20" @click="downloadReport()"></Icon>
                    </Tooltip>
                </div>
            </div>
        </div>
        <!-- 个人视图 -->
        <div v-if="!['followUpOverview', 'remind'].includes(kind)"
             v-show="activeTab === 'personal'"
             v-loading="loading"
             class="personal_panel">
            <!-- chart -->
            <div v-if="!isSetgoal"
                 :ref="kind"
                 id="personal_panel"
                 :style="canvasStyle"></div>

            <!-- 无业绩目标提示 -->
            <span v-if="isSetgoal && kind === 'target'"
                  class="personal_panel_noData">该查询范围下没有业绩目标</span>
        </div>
        <!-- 管理视图 -->
        <div v-if="!['targetOverview', 'followUpOverview', 'remind'].includes(kind)"
             v-show="activeTab === 'manager'"
             v-loading="loading"
             class="table_body">
            <Table :data="tableData"
                   highlight-current-row
                   ref="table"
                   size="medium"
                   :height="kind === 'target' ? '300px' : '266px'"
                   :max-height="kind === 'target' ? '300px' : '266px'"
                   class="noBoxShadow-right noborder-table dashBoard_table tabmain"
                   :class="`tableScroll${kind}`"
                   v-if="refresh_table_flag"
                   v-tableLoadMore="loadData"
                   @mouseenter.native="ctrlScrollBar(0)"
                   @mouseleave.native="ctrlScrollBar(1)" >
                <TableColumn v-for="item in tableColumns"
                             :key="item.key"
                             :prop="item.key"
                             :label="item.title"
                             :align="item.align || 'center'"
                             :width="item.width"
                             :min-width="item.width || 64"
                             :show-overflow-tooltip="true"
                             :render-header="item.renderHeader">
                    <template slot-scope="scope">
                        <template v-if="redirectList.includes(item.key)">
                            <span class="hover-link" @click="jumpToDetail(item.key, scope.row.userId, scope.row.userName, scope.row)">
                                {{scope.row[item.key]===null ? 0 : scope.row[item.key]}}
                            </span>
                        </template>
                        <template v-else-if="['completedRate', 'replyRate'].includes(item.key)">
                            <span>{{scope.row[item.key]===null ? '0%' : `${scope.row[item.key]}%`}}</span>
                        </template>
                        <template v-else>{{scope.row[item.key]===null ? 0 : scope.row[item.key]}}</template>
                    </template>
                </TableColumn>
            </Table>
        </div>
        <!-- 底部'查看详情'按钮 -->
        <div class="check_detail hoverBtn"
             v-if="activeTab === 'manager' && ['business', 'keyAccount', 'mail'].includes(kind)"
             @click="redirectToDetail">
            {{$t('dashBoardV2.Table.seeDetail')}}
        </div>

        <div v-if="kind === 'followUpOverview' || kind === 'remind'"
             v-loading="loading"
             class="table_body">
            <Table v-if="refresh_table_flag"
                   :data="tableData"
                   highlight-current-row
                   ref="table"
                   size="medium"
                   height="266px"
                   max-height="266px"
                   class="noBoxShadow-right noborder-table dashBoard_table tabmain"
                   :class="`tableScroll${kind}`"
                   @mouseenter.native="ctrlScrollBar(0)"
                   @mouseleave.native="ctrlScrollBar(1)" >
                <TableColumn v-for="item in tableColumns"
                             :key="item.key"
                             :prop="item.key"
                             :label="item.title"
                             :align="item.align || 'center'"
                             :width="item.width"
                             :min-width="item.width || 64"
                             :show-overflow-tooltip="true"
                             :fixed="item.fixed"
                             :render-header="item.renderHeader">
                    <template slot-scope="scope">
                        <template v-if="item.key === 'companyName'">
                            <a @click.stop="viewCompany(scope.row.companyId)"
                               class="hover-link piwik_followUpOverview_viewCompany">{{ scope.row[item.key] }}</a>
                        </template>
                        <template v-else-if="(kind === 'remind' && item.key !== 'nonFollowupDays')">
                            <template v-if="scope.row.nonFollowupDays === $t('dashBoardV2.Table.' + ['8-14天未跟进'])">
                                <a @click.stop="jumpToDetail('myCustomer', userId, userName, scope)"
                                   class="hover-link piwik_unfollowedCustomerOverview_digital">{{ scope.row[item.key] ? scope.row[item.key] : '0' }}</a>
                            </template>
                            <template v-if="scope.row.nonFollowupDays === $t('dashBoardV2.Table.' + ['15-30天未跟进'])">
                                <a @click.stop="jumpToDetail('myCustomer', userId, userName, scope)"
                                   class="hover-link piwik_unfollowedCustomerOverview_digital">{{ scope.row[item.key] ? scope.row[item.key] : '0' }}</a>
                            </template>
                            <template v-if="scope.row.nonFollowupDays === $t('dashBoardV2.Table.' + ['31-60天未跟进'])">
                                <a @click.stop="jumpToDetail('myCustomer', userId, userName, scope)"
                                   class="hover-link piwik_unfollowedCustomerOverview_digital">{{ scope.row[item.key] ? scope.row[item.key] : '0' }}</a>
                            </template>
                            <template v-if="scope.row.nonFollowupDays === $t('dashBoardV2.Table.' + ['61-90天未跟进'])">
                                <a @click.stop="jumpToDetail('myCustomer', userId, userName, scope)"
                                   class="hover-link piwik_unfollowedCustomerOverview_digital">{{ scope.row[item.key] ? scope.row[item.key] : '0' }}</a>
                            </template>
                            <template v-if="scope.row.nonFollowupDays === $t('dashBoardV2.Table.' + ['>90天未跟进'])">
                                <a @click.stop="jumpToDetail('myCustomer', userId, userName, scope)"
                                   class="hover-link piwik_unfollowedCustomerOverview_digital">{{ scope.row[item.key] ? scope.row[item.key] : '0' }}</a>
                            </template>
                        </template>
                        <template v-else-if="item.formatter">
                            {{ (item.formatter)(scope.row) }}
                        </template>
                        <template v-else>
                            {{ scope.row[item.key] }}
                        </template>
                    </template>
                </TableColumn>
            </Table>

            <!-- 分页 -->
            <div class="text-right" v-if="kind !== 'remind'"  style="padding:11px 0px">
                <Page :page-size="pageSize"
                       small
                      :total="totalNum"
                      :current-page="curPage"
                      layout="total, prev, pager, next"
                      @current-change="$parent.changePage"></Page>
            </div>
        </div>
    </Card>
</template>

<script>
    import util from '../../../../libs/util';
    import { mapState, mapGetters } from 'vuex';
    import { debounce } from 'lodash';
    import { exportExcel } from '@/api/dashBoard/dashBoardV2';
    import CardFilter from './card-filter.vue';

    export default {
        name: 'card-table',
        components: {
            CardFilter
        },
        props: [
            'tableDetail',
            'tableColumns',
            'bodyStyle',
            'isAdmin',
            'startDate',
            'endDate',
            'tableData',
            'loading',
            'canvasStyle',
            'kind',
            'isRefreshTable',
            'dateRange',
            'dataType',
            'totalNum',
            'pageSize',
            'curPage',
            'filterConObj'
        ],
        data() {
            return {
                activeTab: 'personal',
                showLoadingOpts: {
                    text: '数据加载中...',
                    color: '#fd7a35',
                    textColor: '#fd7a35',
                    maskColor: 'rgba(255, 255, 255, 1)',
                    zlevel: 0
                }, // echarts 加载数据or无数据时的展示
                myChart: null, // 图表实例
                chartOption: {},
                chartPieOption: {}, // 饼图配置项
                chartOverviewOption: {}, // 年度业绩柱状图+折线图配置项
                xAxisData: [],
                seriesData: [], // 柱状图数值
                pieData: [{
                    name: '业绩目标',
                    type: 'pie',
                    radius: ['0%', '80%'],
                    center: ['50%', '50%'],
                    data: [{
                        id: 'completed',
                        name: this.$t('dashBoardV2.Target.Completed'),
                        value: null,
                        itemStyle: {
                            color: '#325BCE',
                        }
                    }, {
                        id: 'undone',
                        name: this.$t('dashBoardV2.Target.Unfinished'),
                        value: null,
                        itemStyle: {
                            color: '#1FBFB1',
                        }
                    }],
                }], // 饼图数值
                refresh_table_flag: true,
                loadingTable: false,
                redirectList: [
                    'newClueCount',
                    'inquiryCount',
                    'transactionInquiryCount',
                    'sendMailCount',
                    'companyCount',
                    'highseasClueCount',
                    'newCompanyCount',
                    'newInquiryCount',
                    'highseasCompanyCount',
                    'receiveMailCount',
                    'replyMailCount',
                    'importantCompanyCount',
                    'unreadMailCount',
                    'pendingMailCount',
                    'retreatIntoHighSeasInquiryCount'], // 可以跳转的tableColumns数组
                emailList: [],
                yAxisMax: 100,
                yPercentMax: 100,
                myUserName: '',
                isBindMail: false, // 是否绑定邮箱
                isHaveRight: false, // 是否有查看下属邮件权限
                options: [
                    {
                        value: 1,
                        label: this.$t('dashBoardV2.Settings.dealtAmount')
                    },
                    {
                        value: 2,
                        label: this.$t('dashBoardV2.Settings.dealtInquiry')
                    }
                ],
                dateOptions: [
                    {
                        value: 'thisMonth',
                        label: this.$t('dashBoardV2.Select.thisMonth')
                    },
                    {
                        value: 'lastMonth',
                        label: this.$t('dashBoardV2.Select.lastMonth')
                    },
                    {
                        value: 'currentPeriod',
                        label: this.$t('dashBoardV2.Select.currentPeriod')
                    },
                    {
                        value: 'prevPeriod',
                        label: this.$t('dashBoardV2.Select.prevPeriod')
                    },
                    {
                        value: 'allYear',
                        label: this.$t('dashBoardV2.Select.allYear')
                    }
                ],
                targetType: 1,
                targetDate: 'thisMonth',
                timeRange: [],
                isSetgoal: false,
                completedRate: '',
                targetValue: null,

                filterType: '',
                filterKey: '',
                dateMotheDateRange: [new Date(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-01`).getTime(), new Date(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-01`).getTime()],
                downLoading: false,
                filterUserId: null
            };
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                orgId: state => state.enterpriseId,
                userName: state => state.userName,
                window_width: state => state.window_width
            }),
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ])
        },
        methods: {
            // 个人视图/管理视图 切换
            handleTabClick(tab) {
                this.updateAdmin(tab.name === 'personal' ? 0 : 1);
            },
            /* 绘制个人视图下的柱状图 */
            drawLine() {
                // 通过传入的tableColumns 获取到柱状图X轴的类目数据
                // echarts 配置项
                let myChartDom = this.$refs[this.kind];
                this.myChart = this.$echarts.init(myChartDom);
                this.myChart.off('click');
                this.myChart.showLoading(this.showLoadingOpts);
                let leftOffset;
                if (['business', 'keyAccount'].includes(this.kind)) {
                    leftOffset = '10%';
                } else if (['workload', 'mail'].includes(this.kind)) {
                    leftOffset = '8%';
                } else {
                    leftOffset = '5%';
                }
                /**
                 * 判断kind 是否等于mail 因为邮件的柱状图有两个y轴
                 * 双Y轴的情况下，yAxis变为数组，series数组长度为2
                 * */
                let mailData0 = [];
                let mailData1 = [];
                /**
                 * 这里这么处理是因为双Y轴的情况
                 * 通过传入null 来隐藏其中一个柱
                 * */
                // mailData0 = this.seriesData.slice(0, 3);
                // mailData0.push(null);
                // mailData1 = this.seriesData.slice(-1);
                // mailData1.unshift(null, null, null);
                let mailYAxis = [{
                    type: 'value',
                    axisLine: {
                        show: false
                    },
                    name: this.$t('dashBoardV2.Table.amounts'),
                    nameLocation: 'middle',
                    nameTextStyle: {
                        color: 'rgba(0,0,0,0.40)',
                        fontSize: 12
                    },
                    nameGap: 40,
                    max: this.yAxisMax,
                    min: 0,
                    interval: this.yAxisMax / 5,
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#D9D9D9'
                        }
                    },
                    axisLabel: {
                        color: 'rgba(0, 0, 0, 0.4)',
                        fontSize: 12
                    }
                }, {
                    type: 'value',
                    axisLine: {
                        show: false
                    },
                    name: this.$t('dashBoardV2.Table.mailReplyRate'),
                    nameLocation: 'middle',
                    nameTextStyle: {
                        color: 'rgba(0,0,0,0.40)',
                        fontSize: 12
                    },
                    nameGap: 40,
                    max: 100,
                    min: 0,
                    interval: 20,
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#D9D9D9'
                        }
                    },
                    axisLabel: {
                        color: 'rgba(0, 0, 0, 0.4)',
                        fontSize: 12,
                        formatter: '{value}%'
                    }
                }];
                let mailXAxis = [
                    {
                        type: 'category',
                        data: this.xAxisData.slice(0, 3),
                        axisLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        },
                        axisLabel: {
                            interval: 0
                        }
                    },
                    {
                        type: 'category',
                        data: this.xAxisData.slice(-1),
                        axisLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        },
                        axisLabel: {
                            interval: 0
                        }
                    }
                ];
                this.chartOption = {
                    tooltip: {
                        show: true,
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        },
                        formatter: function (params) {
                            return '';
                        }
                    },
                    xAxis: [{
                        type: 'category',
                        data: this.xAxisData,
                        axisLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        },
                        axisLabel: {
                            interval: 0
                        }
                    }],
                    yAxis: this.kind === 'mail' ? mailYAxis : {
                        type: 'value',
                        axisLine: {
                            show: false
                        },
                        name: this.$t('dashBoardV2.Table.amounts'),
                        nameLocation: 'middle',
                        nameTextStyle: {
                            color: 'rgba(0,0,0,0.40)',
                            fontSize: 12
                        },
                        nameGap: 40,
                        max: this.yAxisMax,
                        min: 0,
                        interval: this.yAxisMax / 5,
                        axisTick: {
                            show: false
                        },
                        splitLine: {
                            lineStyle: {
                                color: '#D9D9D9'
                            }
                        },
                        axisLabel: {
                            color: 'rgba(0, 0, 0, 0.4)',
                            fontSize: 12
                        }
                    },
                    grid: {
                        left: '10%',
                        right: this.kind === 'mail' ? '10%' : '3%',
                        bottom: '15%',
                        top: '10%'

                    },
                    series: this.kind === 'mail' ? [
                        {
                            data: this.seriesData,
                            type: 'bar',
                            cursor: 'pointer',
                            barWidth: 30,
                            label: {
                                show: true,
                                position: 'top',
                                distance: 4,
                                color: 'rgba(0,0,0,0.80)',
                                fontSize: 12
                            },
                            itemStyle: {
                                color: 'rgba(50,91,206,0.80)'
                            },
                            showAllSymbol: true
                        }
                        // {
                        //     data: mailData1,
                        //     type: 'bar',
                        //     cursor: 'pointer',
                        //     yAxisIndex: 1,
                        //     barWidth: 30,
                        //     label: {
                        //         show: true,
                        //         position: 'outside',
                        //         distance: 4,
                        //         color: 'rgba(0,0,0,0.80)',
                        //         fontSize: 12,
                        //         formatter: '{c}%'
                        //     },
                        //     itemStyle: {
                        //         color: 'rgba(50,91,206,0.80)'
                        //     },
                        //     barGap: '-100%',
                        //     showAllSymbol: true
                        // }
                    ] : [{
                        data: this.seriesData,
                        type: 'bar',
                        cursor: 'pointer',
                        barWidth: 30,
                        label: {
                            show: true,
                            position: 'top',
                            distance: 4,
                            color: 'rgba(0,0,0,0.80)',
                            fontSize: 12
                        },
                        itemStyle: {
                            color: 'rgba(50,91,206,0.80)'
                        },
                        showAllSymbol: true
                    }]
                };
                this.chartPieOption = {
                    legend: {
                        data: [this.$t('dashBoardV2.Target.Completed'), this.$t('dashBoardV2.Target.Unfinished')],
                        orient: 'vertical',
                        right: 20,
                        top: 'center',
                        bottom: 20,
                    },
                    tooltip: {
                        show: true,
                        formatter: params => {
                            // console.log('pie params', params);
                            if (params.name === '已完成' || params.name === 'Completed') {
                                return `${params.name}: ￥${params.value} <br />${this.$t('dashBoardV2.Target.goal')}: ￥${this.targetValue} <br /> ${this.$t('dashBoardV2.Target.CompletionRate')}: ${this.completedRate}`;
                            } else {
                                return `${params.name}: ￥${params.value} <br />${this.$t('dashBoardV2.Target.goal')}: ￥${this.targetValue}`;
                            }
                        }
                    },
                    grid: {
                        containLabel: true,
                        // width: '80%',
                        // height: '80%'
                        left: '5%',
                        right: '5%',
                        top: '10%',
                        bottom: '10%'
                    },
                    series: this.pieData
                };
                this.chartOverviewOption = {
                    tooltip: {
                        show: true,
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        },
                        // formatter: '{b0} <br/> {a0} : ￥{c0} <br /> {a1} : ￥{c1} <br /> {a2} : {c2}%'
                        formatter: (a0) => {
                            let str = `${a0[0].axisValueLabel} <br/>`;
                            if (a0[0]) {
                                str += `${a0[0].seriesName} : ￥${a0[0].value} <br />`;
                            }
                            if (a0[1]) {
                                str += `${a0[1].seriesName} : ￥${a0[1].value} <br />`;
                            }
                            if (a0[2]) {
                                str += `${a0[2].seriesName} : ${a0[2].value}%`;
                            }
                            return str;
                        }
                    },
                    legend: {
                        data: [this.$t('dashBoardV2.Target.Completed'), this.$t('dashBoardV2.Target.goal'), this.$t('dashBoardV2.Target.CompletionRate')],
                        bottom: 0
                    },
                    grid: {
                        containLabel: true,
                        // width: '80%',
                        // height: '80%'
                        left: '5%',
                        right: '5%',
                        top: '10%',
                        bottom: '10%'
                    },
                    xAxis: [{
                        type: 'category',
                        data: this.xAxisData,
                        axisLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        }
                    }],
                    yAxis: [
                        {
                            type: 'value',
                            name: Number(this.dataType) === 1 ? this.$t('dashBoardV2.Target.GoalPerYuan') : this.$t('dashBoardV2.Target.InquiryUnit'),
                            min: 0,
                            max: this.yAxisMax,
                            interval: this.yAxisMax / 5,
                            axisLine: {
                                show: false
                            },
                            axisTick: {
                                show: false
                            },
                            splitLine: {
                                lineStyle: {
                                    color: '#D9D9D9'
                                }
                            },
                            nameTextStyle: {
                                color: 'rgba(0,0,0,0.40)',
                                fontSize: 12
                            },
                            nameLocation: 'middle',
                            nameGap: 60
                        },
                        {
                            type: 'value',
                            name: this.$t('dashBoardV2.Target.CompletionRate'),
                            min: 0,
                            max: this.yPercentMax,
                            interval: this.yPercentMax / 5,
                            axisLabel: {
                                formatter: '{value}%'
                            },
                            axisLine: {
                                show: false
                            },
                            axisTick: {
                                show: false
                            },
                            splitLine: {
                                lineStyle: {
                                    color: '#D9D9D9'
                                }
                            },
                            nameTextStyle: {
                                color: 'rgba(0,0,0,0.40)',
                                fontSize: 12
                            },
                            nameLocation: 'middle',
                            nameGap: 60
                        }
                    ],
                    series: this.seriesData
                };
                // 绘制图表
                this.myChart.clear();
                this.isSetgoal = false;
                // this.myChart.setOption(this.kind === 'target' ? this.chartPieOption :this.chartOption);
                if (this.kind === 'target') {
                    this.myChart.setOption(this.chartPieOption);
                } else if (this.kind === 'targetOverview') {
                    this.myChart.setOption(this.chartOverviewOption);
                } else {
                    this.myChart.setOption(this.chartOption);
                }
                this.myChart.off('click');
                this.myChart.getZr().off('click');
                this.myChart.getZr().on('click', (params) => {
                    const pointInPixel = [params.offsetX, params.offsetY];
                    if (this.myChart.containPixel('grid', pointInPixel)) {
                        let xIndex = this.myChart.convertFromPixel({ seriesIndex: 0 }, [params.offsetX, params.offsexY])[0];
                        this.handleChartClick(xIndex);
                    }
                });
                this.myChart.hideLoading();
            },
            lineHides(opts) {
                opts.forEach(opt => {
                    if (opt === null) {
                        opt.itemStyle.normal.labelLine.show = false;
                        opt.itemStyle.normal.label.show = false;
                    }
                });
            },
            getPieData() {
                this.pieData[0].data.forEach(pie => {
                    if (pie.id === 'completed') {
                        this.$set(pie, 'value', this.tableData[0]['completed'] === null ? 0 : this.tableData[0]['completed']);
                    }
                    if (pie.id === 'undone') {
                        this.$set(pie, 'value', this.tableData[0]['undone'] === null ? 0 : this.tableData[0]['undone']);
                    }
                });
                // 增加判断逻辑 如果pieData中completed + undone === 0的情况下 表示未设置业绩目标
                const completed = this.pieData[0].data[0].value;
                const undone = this.pieData[0].data[1].value;
                this.completedRate = `${this.tableData[0]['completedRate']}%`;
                this.targetValue = this.tableData[0]['targetValue'];
                const isSet = this.tableData[0]['targetValue'];
                if (!isSet) {
                    // 替换之前的canvas
                    this.isSetgoal = true;
                } else {
                    this.isSetgoal = false;
                    this.$nextTick(() => {
                        this.drawLine();
                    });
                }
            },
            getOverviewData() {
                let months = [];
                let data1 = [];
                let data2 = [];
                let data3 = [];
                this.tableData.forEach(item => {
                    months.push(`${item['month']}月`);
                    data1.push(item['completed'] === null ? 0 : item['completed']);
                    data2.push(item['targetValue'] === null ? 0 : item['targetValue']);
                    data3.push(item['completedRate'] === null ? 0 : item['completedRate']);
                });
                this.xAxisData = this.$t('dashBoardV2.Target.months');
                let max1 = this.setYaxisMax(data1);
                let max2 = this.setYaxisMax(data2);
                this.yAxisMax = Math.max(max1, max2);
                this.yPercentMax = this.setYaxisMax(data3) < 100 ? 100 : this.setYaxisMax(data3);
                this.seriesData = [
                    {
                        name: this.$t('dashBoardV2.Target.Completed'),
                        type: 'bar',
                        data: data1,
                        itemStyle: {
                            color: '#325BCE'
                        }
                    },
                    {
                        name: this.$t('dashBoardV2.Target.goal'),
                        type: 'bar',
                        data: data2,
                        itemStyle: {
                            color: '#1FBFB1'
                        }
                    },
                    {
                        name: this.$t('dashBoardV2.Target.CompletionRate'),
                        type: 'line',
                        yAxisIndex: 1,
                        data: data3,
                        itemStyle: {
                            color: '#EE5943'
                        }
                    }
                ];
                this.$nextTick(() => {
                    this.drawLine();
                });
            },
            getxAxisData() {
                this.xAxisData = [];
                if (this.tableColumns.length) {
                    this.tableColumns.forEach(col => {
                        // 去掉负责人， 创建人， 账号等图标里不展示的字段， 其实都叫userName
                        const filter_keys = ['userName']; // 这里先用数组 如果以后需要过滤的字段增加的话 就不需要改数据类型了
                        if (!filter_keys.includes(col.key)) {
                            this.xAxisData.push({
                                id: col.key,
                                value: col.title,
                                textStyle: {
                                    fontSize: 12,
                                    color: 'rgba(0,0,0,0.80)'
                                }
                            });
                        }
                    });
                }
                this.getSeriesData();
            },
            getSeriesData() {
                this.seriesData = [];
                if (this.tableData.length) {
                    let obj = this.tableData[0];
                    this.myUserName = obj.userName;
                    this.xAxisData.forEach(item => {
                        for (let k in obj) {
                            if (item.id === k) {
                                this.seriesData.push(obj[k] === null ? 0 : obj[k]);
                            }
                        }
                    });
                    this.yAxisMax = this.setYaxisMax(this.seriesData);
                    this.$nextTick(() => {
                        this.drawLine();
                    });
                }
            },
            initChartsData() {
                // 个人视图下 获取数据
                /**
                 * 如果是饼图 走getPieData方法
                 * elseif targetoverview 走getoverview方法
                 * elseif followUpOverview 不请求数据, card-filter 触发筛选, 上层请求并传入 tableData
                 * else 走getxAxisdata()
                 * */
                switch (this.kind) {
                    case 'target':
                        this.getPieData();
                        break;
                    case 'targetOverview':
                        this.getOverviewData();
                        break;
                    case 'followUpOverview':
                        break;
                    case 'remind':
                        break;
                    default:
                        this.getxAxisData();
                }
            },
            updateAdmin(status) {
                this.xAxisData = [];
                this.seriesData = [];
                this.refresh_table_flag = false;
                this.$emit('updateAdmin', status);
                this.$nextTick(() => {
                    this.refresh_table_flag = true;
                });
            },
            async jumpToDetail(type, userId, userName, data) {
                /**
                 * @params userId  点击表格中某一行的用户id
                 * */
                let config;
                let dateArr = [this.startDate, this.endDate];
                let isHaveMailAuthority;
                switch (type) {
                    case 'inquiryCount':
                        // 跳转询盘 跳转之前先鉴权
                        if (this.isContainsMenu('myInquiry')) {
                            // 跳转
                            config = [
                                ['createTime', dateArr],
                                ['inquiryManagers', [{ label: userName, value: userId }]]
                            ];
                            localStorage.setItem('dashboard_inquiry_filters', JSON.stringify(config));
                            this.$stm.openNewWindow(this.$router.resolve({
                                name: 'myInquiry'
                            }).href);
                        } else {
                            this.$Message.warning(this.$t('globalSearch.haveNoPermissionMyInquiry'));
                        }
                        break;
                    case 'newClueCount':
                        // 跳转线索
                        if (this.isContainsMenu('my_clue')) {
                            config = [
                                ['createTime', dateArr],
                                // ['companyManagers', [{label: userName,value: userId}]],
                                ['createUser', [{ label: userName, value: userId }]]
                            ];
                            localStorage.setItem('dashboard_clue_filter', JSON.stringify(config));
                            localStorage.setItem('dashboard_clue_type', JSON.stringify(3));
                            this.$stm.openNewWindow(this.$router.resolve({
                                name: 'my_clue'
                            }).href);
                        } else {
                            this.$Message.warning(this.$t('globalSearch.haveNoPermissionMyClue'));
                        }
                        break;
                    case 'transactionInquiryCount':
                        if (this.isContainsMenu('myInquiry')) {
                            config = [
                                ['createTime', dateArr],
                                ['inquiryManagers', [{ label: userName, value: userId }]],
                                ['transactionStatus', true]
                            ];
                            localStorage.setItem('dashboard_inquiry_filters', JSON.stringify(config));
                            this.$stm.openNewWindow(this.$router.resolve({
                                name: 'myInquiry'
                            }).href);
                        } else {
                            this.$Message.warning(this.$t('globalSearch.haveNoPermissionMyInquiry'));
                        }
                        break;
                    case 'myCustomer':
                        let row = data.row;
                        let column = data.column;
                        let nonFollowupDays = row.nonFollowupDays;
                        if (this.isContainsMenu('myCustomer')) {
                            config = [
                                { key: 'cpClientType', val: column.label ==='空' ? -1 : column.label },
                                { key: 'iqFollowUp', val: -1 },
                                { key: 'cpCompanyManagers', val: Number(row.userId) },
                            ];

                            // 处理未跟进天数筛选条件
                            switch (nonFollowupDays) {
                                case this.$t('dashBoardV2.Table.' + ['8-14天未跟进']):
                                    config.push({ key: 'cpNotFollowedDays', val: 8, symbol: '$gte' });
                                    config.push({ key: 'cpNotFollowedDays', val: 14, symbol: '$lte' });
                                    break;
                                case this.$t('dashBoardV2.Table.' + ['15-30天未跟进']):
                                    config.push({ key: 'cpNotFollowedDays', val: 15, symbol: '$gte' });
                                    config.push({ key: 'cpNotFollowedDays', val: 30, symbol: '$lte' });
                                    break;
                                case this.$t('dashBoardV2.Table.' + ['31-60天未跟进']):
                                    config.push({ key: 'cpNotFollowedDays', val: 31, symbol: '$gte' });
                                    config.push({ key: 'cpNotFollowedDays', val: 60, symbol: '$lte' });
                                    break;
                                case this.$t('dashBoardV2.Table.' + ['61-90天未跟进']):
                                    config.push({ key: 'cpNotFollowedDays', val: 61, symbol: '$gte' });
                                    config.push({ key: 'cpNotFollowedDays', val: 90, symbol: '$lte' });
                                    break;
                                case this.$t('dashBoardV2.Table.' + ['>90天未跟进']):
                                    config.push({ key: 'cpNotFollowedDays', val: 90, symbol: '$gt' });
                                    break;
                            }

                            config.push({ key: 'customerViewValue', val: 1 });

                            localStorage.setItem('dashboard_customer_search_filters', JSON.stringify(config));
                            this.$stm.openNewWindow(this.$router.resolve({
                                name: 'myCustomer'
                            }).href);
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                        }
                        break;
                    case 'companyCount':
                        if (this.isContainsMenu('myCustomer')) {
                            config = [
                                ['cpCreateTime', dateArr],
                                ['cpCompanyManagers', [{ label: userName, value: userId }]],
                            ];
                            localStorage.setItem('dashboard_customer_filters', JSON.stringify(config));
                            this.$stm.openNewWindow(this.$router.resolve({
                                name: 'myCustomer'
                            }).href);
                        } else {
                            this.$Message.warning(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                        }
                        break;
                    case 'newCompanyCount':
                        if (this.isContainsMenu('myCustomer')) {
                            config = [
                                ['cpCreateTime', dateArr],
                                // ['companyManagers', [{label: userName,value: userId}]],
                                ['cpCreateUser', [{ label: userName, value: userId }]]
                            ];
                            localStorage.setItem('dashboard_customer_filters', JSON.stringify(config));
                            this.$stm.openNewWindow(this.$router.resolve({
                                name: 'myCustomer'
                            }).href);
                        } else {
                            this.$Message.warning(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                        }
                        break;
                    case 'newInquiryCount':
                        if (this.isContainsMenu('myInquiry')) {
                            config = [
                                ['createTime', dateArr],
                                // ['inquiryManagers', [{label: userName,value: userId}]],
                                ['createUser', [{ label: userName, value: userId }]]
                            ];
                            localStorage.setItem('dashboard_inquiry_filters', JSON.stringify(config));
                            this.$stm.openNewWindow(this.$router.resolve({
                                name: 'myInquiry'
                            }).href);
                        } else {
                            this.$Message.warning(this.$t('globalSearch.haveNoPermissionMyInquiry'));
                        }
                        break;
                    case 'highseasCompanyCount':
                        if (this.isContainsMenu('highseasCustomer')) {
                            config = [
                                ['cpCreateTime', dateArr],
                                ['cpCreateUser', [{ label: userName, value: userId }]]
                            ];
                            localStorage.setItem('dashboard_highSea_inquiry_filters', JSON.stringify(config));
                            this.$stm.openNewWindow(this.$router.resolve({
                                name: 'highseasCustomer'
                            }).href);
                        } else {
                            this.$Message.warning(this.$t('globalSearch.haveNoPermissionHighseasCustomer'));
                        }
                        break;
                    case 'importantCompanyCount':
                        if (this.isContainsMenu('myCustomer')) {
                            config = [
                                ['cpCreateTime', dateArr],
                                ['cpCompanyManagers', [{ label: userName, value: userId }]],
                                ['cpMarker', [{ value: 1, label: this.$t('crm.Table.corp_marked') }]]
                            ];
                            localStorage.setItem('dashboard_customer_filters', JSON.stringify(config));
                            this.$stm.openNewWindow(this.$router.resolve({
                                name: 'myCustomer'
                            }).href);
                        } else {
                            this.$Message.warning(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                        }
                        break;
                    case 'sendMailCount':
                        isHaveMailAuthority = await this.isHaveMailAuthority(userId);
                        // 在管理视图下 需要判断下属邮件权限
                        if (!isHaveMailAuthority) {
                            if (!this.isBindMail) {
                                this.$Message.warning(this.$t('dashBoardV2.tips.noBind'));
                            } else {
                                if (!this.isHaveRight) {
                                    this.$Message.warning(this.$t('dashBoardV2.tips.noRight'));
                                }
                            }
                            return false;
                        }
                        if (!this.isContainsMenu('mail')) {
                            this.$Message.warning(this.$t('dashBoardV2.tips.noMailMenu'));
                            return false;
                        }
                        localStorage.setItem('dashboard_mail_filters', JSON.stringify({
                            boxName: 'sentBox',
                            personId: userId,
                            personName: userName,
                            filterCons: [
                                {
                                    key: 'avatar',
                                    val: [
                                        { value: 1, label: this.$t('mail.public_customers') },
                                        { value: 2, label: this.$t('mail.my_customers') },
                                        { value: 3, label: this.$t('mail.other_customers') },
                                        { value: 4, label: this.$t('mail.public_leads') },
                                        { value: 5, label: this.$t('mail.my_leads') },
                                        { value: 6, label: this.$t('mail.other_leads') }
                                    ]
                                },
                                {
                                    key: 'date',
                                    val: this.dateRange
                                }
                            ]
                        }));
                        this.$stm.openNewWindow(this.$router.resolve({
                            name: 'mail_home'
                        }).href);
                        break;
                    case 'receiveMailCount':
                        isHaveMailAuthority = await this.isHaveMailAuthority(userId);
                        if (!isHaveMailAuthority) {
                            if (!this.isBindMail) {
                                this.$Message.warning(this.$t('dashBoardV2.tips.noBind'));
                            } else {
                                if (!this.isHaveRight) {
                                    this.$Message.warning(this.$t('dashBoardV2.tips.noRight'));
                                }
                            }
                            return false;
                        }
                        if (!this.isContainsMenu('mail')) {
                            this.$Message.warning(this.$t('dashBoardV2.tips.noMailMenu'));
                            return false;
                        }
                        localStorage.setItem('dashboard_mail_filters', JSON.stringify({
                            boxName: 'inbox',
                            personId: userId,
                            personName: userName,
                            filterCons: [
                                {
                                    key: 'avatar',
                                    val: [
                                        { value: 1, label: this.$t('mail.public_customers') },
                                        { value: 2, label: this.$t('mail.my_customers') },
                                        { value: 3, label: this.$t('mail.other_customers') },
                                        { value: 4, label: this.$t('mail.public_leads') },
                                        { value: 5, label: this.$t('mail.my_leads') },
                                        { value: 6, label: this.$t('mail.other_leads') }
                                    ]
                                },
                                {
                                    key: 'date',
                                    val: this.dateRange
                                }
                            ]
                        }));
                        this.$stm.openNewWindow(this.$router.resolve({
                            name: 'mail_home'
                        }).href);
                        break;
                    case 'replyMailCount':
                        isHaveMailAuthority = await this.isHaveMailAuthority(userId);
                        if (!isHaveMailAuthority) {
                            if (!this.isBindMail) {
                                this.$Message.warning(this.$t('dashBoardV2.tips.noBind'));
                            } else {
                                if (!this.isHaveRight) {
                                    this.$Message.warning(this.$t('dashBoardV2.tips.noRight'));
                                }
                            }
                            return false;
                        }
                        if (!this.isContainsMenu('mail')) {
                            this.$Message.warning(this.$t('dashBoardV2.tips.noMailMenu'));
                            return false;
                        }
                        localStorage.setItem('dashboard_mail_filters', JSON.stringify({
                            boxName: 'inbox',
                            personId: userId,
                            personName: userName,
                            filterCons: [
                                {
                                    key: 'avatar',
                                    personId: userId,
                                    val: [
                                        { value: 1, label: this.$t('mail.public_customers') },
                                        { value: 2, label: this.$t('mail.my_customers') },
                                        { value: 3, label: this.$t('mail.other_customers') },
                                        { value: 4, label: this.$t('mail.public_leads') },
                                        { value: 5, label: this.$t('mail.my_leads') },
                                        { value: 6, label: this.$t('mail.other_leads') }
                                    ]
                                },
                                {
                                    key: 'date',
                                    val: this.dateRange
                                },
                                {
                                    key: 'mailStatusFilter',
                                    val: [
                                        { value: 2, label: '已回复' }
                                    ]
                                }
                            ]
                        }));
                        this.$stm.openNewWindow(this.$router.resolve({
                            name: 'mail_home'
                        }).href);
                        break;
                    case 'unreadMailCount':
                        isHaveMailAuthority = await this.isHaveMailAuthority(userId);
                        if (!isHaveMailAuthority) {
                            if (!this.isBindMail) {
                                this.$Message.warning(this.$t('dashBoardV2.tips.noBind'));
                            } else {
                                if (!this.isHaveRight) {
                                    this.$Message.warning(this.$t('dashBoardV2.tips.noRight'));
                                }
                            }
                            return false;
                        }
                        if (!this.isContainsMenu('mail')) {
                            this.$Message.warning(this.$t('dashBoardV2.tips.noMailMenu'));
                            return false;
                        }
                        localStorage.setItem('dashboard_mail_filters', JSON.stringify({
                            boxName: 'unreadBox',
                            personId: userId,
                            personName: userName,
                            filterCons: [
                                {
                                    key: 'avatar',
                                    val: [
                                        { value: 1, label: this.$t('mail.public_customers') },
                                        { value: 2, label: this.$t('mail.my_customers') },
                                        { value: 3, label: this.$t('mail.other_customers') },
                                        { value: 4, label: this.$t('mail.public_leads') },
                                        { value: 5, label: this.$t('mail.my_leads') },
                                        { value: 6, label: this.$t('mail.other_leads') }
                                    ]
                                },
                                // {
                                //     key: 'personId',
                                //     val: userId
                                // }
                                {
                                    key: 'date',
                                    val: []
                                },
                            ]
                        }));
                        this.$stm.openNewWindow(this.$router.resolve({
                            name: 'mail_home'
                        }).href);
                        break;
                    case 'pendingMailCount':
                        isHaveMailAuthority = await this.isHaveMailAuthority(userId);
                        if (!isHaveMailAuthority) {
                            if (!this.isBindMail) {
                                this.$Message.warning(this.$t('dashBoardV2.tips.noBind'));
                            } else {
                                if (!this.isHaveRight) {
                                    this.$Message.warning(this.$t('dashBoardV2.tips.noRight'));
                                }
                            }
                            return false;
                        }
                        if (!this.isContainsMenu('mail')) {
                            this.$Message.warning(this.$t('dashBoardV2.tips.noMailMenu'));
                            return false;
                        }
                        localStorage.setItem('dashboard_mail_filters', JSON.stringify({
                            boxName: 'inbox',
                            personId: userId,
                            personName: userName,
                            filterCons: [
                                {
                                    key: 'avatar',
                                    val: [
                                        { value: 1, label: this.$t('mail.public_customers') },
                                        { value: 2, label: this.$t('mail.my_customers') },
                                        { value: 3, label: this.$t('mail.other_customers') },
                                        { value: 4, label: this.$t('mail.public_leads') },
                                        { value: 5, label: this.$t('mail.my_leads') },
                                        { value: 6, label: this.$t('mail.other_leads') }
                                    ]
                                },
                                {
                                    key: 'mailStatusFilter',
                                    val: [
                                        { value: 1, label: '未回复' }
                                    ]
                                },
                                {
                                    key: 'date',
                                    val: []
                                },
                            ]
                        }));
                        this.$stm.openNewWindow(this.$router.resolve({
                            name: 'mail_home'
                        }).href);
                        break;
                    case 'highseasClueCount':
                        if (this.isContainsMenu('common_sea_customer')) {
                            config = [
                                ['createTime', dateArr],
                                ['createUser', [{ label: userName, value: userName }]]
                            ];
                            localStorage.setItem('dashboard_highSea_clue_filters', JSON.stringify(config));
                            this.$stm.openNewWindow(this.$router.resolve({
                                name: 'common_sea_customer'
                            }).href);
                        } else {
                            this.$Message.warning(this.$t('globalSearch.haveNoPermissionHighseasCustomer'));
                        }
                        break;
                    case 'retreatIntoHighSeasInquiryCount':
                        // 跳转客户 跳转之前先鉴权
                        if (this.isContainsMenu('myCustomer')) {
                            config = [
                                ['cpCompanyManagers', [{ label: userName, value: userId }]]
                            ];
                            localStorage.setItem('dashboard_customer_filters', JSON.stringify(config));
                            // const retreatIntoHighSeasCompanys = data.retreatIntoHighSeasCompanys.length ? data.retreatIntoHighSeasCompanys.join(',') : '0';
                            // localStorage.setItem('retreatIntoHighSeasCompanys', 'retreatIntoHighSeasCompanys');
                            this.$stm.openNewWindow(this.$router.resolve({
                                name: 'myCustomer'
                            }).href);
                        } else {
                            this.$Message.warning(this.$t('globalSearch.haveNoPermissionMyInquiry'));
                        }
                        break;
                }
            },
            async isHaveMailAuthority(clickId) {
                const p1 = this.isHaveRightPromise(clickId);
                const p2 = this.isBindMailPromise(clickId);
                await Promise.all([p1, p2]).then(() => {
                });
                return this.isHaveRight && this.isBindMail;
            },
            isHaveRightPromise(clickId) {
                return new Promise((resolve) => {
                    if (Number(this.userId) === Number(clickId)) {
                        this.isHaveRight = true;
                        resolve(true);
                        return;
                    }
                    util.ajaxMail({
                        url: `/mail/mailAccount/leader/${this.orgId}/${this.userId}`,
                        method: 'get'
                    }).then(res => {
                        if (res.data.code === 1 && res.data.data) {
                            // debugger
                            const userList = res.data.data;
                            let ids = [];
                            let emails = [];
                            userList.forEach(user => {
                                ids.push(user.createUserId);
                                if (Number(user.createUserId) === clickId) {
                                    emails.push(user.emailAddress);
                                }
                            });
                            this.emailList = emails;
                            this.isHaveRight = ids.includes(`${clickId}`);
                            resolve();
                        } else {
                            // this.$Message.error('获取企业部门数据失败，请刷新后重试');
                            resolve();
                        }
                    });
                });
            },
            isBindMailPromise(clickId) {
                return new Promise((resolve) => {
                    util.ajaxMailJson({
                        url: `/mail/mailAccounts/user/${this.orgId}/${clickId}`,
                        method: 'get',
                        params: {
                            userId: this.userId // 登陆人的userid
                        }
                    }).then(res => {
                        if (res.data.code === 1) {
                            if (res.data.data.accountList.length) {
                                this.isBindMail = true;
                            } else {
                                this.isBindMail = false;
                            }
                            resolve();
                        } else {
                            this.isBindMail = false;
                            resolve();
                        }
                    });
                });
            },
            handleChartClick(xIndex) {
                /**
                 * 取绝对值是因为可能取到的index出现-0的情况 目前不清楚为啥
                 * 先加上绝对值
                 * */
                let index = Math.abs(xIndex);
                let type = this.xAxisData[index];
                this.jumpToDetail(type['id'], this.userId, this.myUserName, this.tableData[0]);
            },
            redirectToDetail() {
                switch (this.kind) {
                    case 'business':
                        window.open(this.$router.resolve({
                            name: 'myCustomer',
                        }).href, '_blank');
                        break;
                    case 'keyAccount':
                        window.open(this.$router.resolve({
                            name: 'myCustomer',
                        }).href, '_blank');
                        break;
                    case 'mail':
                        window.open(this.$router.resolve({
                            name: 'mail_home',
                        }).href, '_blank');
                        break;
                }
            },
            loadData() {
                this.$emit('loadData');
            },
            // 控制表格滚动条显隐, 0 显示, 1 隐藏
            ctrlScrollBar(flag) {
                try {
                    const dom = this.$refs.table.$el.querySelector('.el-table__body-wrapper');
                    if (flag === 0) {
                        dom.style.overflow = 'overlay';
                    } else {
                        dom.style.overflow = 'hidden';
                    }
                } catch (e) {
                    // console.error(e);
                }
            },
            handleTypeChange(val) {
                this.$emit('changePieType', val);
            },
            handleDateChange(val) {
                // this.$Message.success(val);
                let startDay = null;
                let endDay = null;
                let myDate = new Date;
                let myMonth = myDate.getMonth() + 1;
                let myYear = myDate.getFullYear();
                let curPeriod = Math.floor((myMonth % 3 === 0 ? (myMonth / 3) : (myMonth / 3 + 1)));
                let prevPeriod = curPeriod === 1 ? 1 : curPeriod - 1;
                let timeRange = [];
                let timeRangePrev = [];
                let timeRangeAnnual = [`${myYear}-01-01`, `${myYear}-12-31`];
                switch (curPeriod) {
                    case 1:
                        timeRange = [`${myYear}-01-01`, `${myYear}-03-31`];
                        timeRangePrev = [`${myYear}-01-01`, `${myYear}-03-31`];
                        break;
                    case 2:
                        timeRange = [`${myYear}-04-01`, `${myYear}-06-30`];
                        timeRangePrev = [`${myYear}-01-01`, `${myYear}-03-31`];
                        break;
                    case 3:
                        timeRange = [`${myYear}-07-01`, `${myYear}-09-30`];
                        timeRangePrev = [`${myYear}-04-01`, `${myYear}-06-30`];
                        break;
                    case 4:
                        timeRange = [`${myYear}-10-01`, `${myYear}-12-31`];
                        timeRangePrev = [`${myYear}-07-01`, `${myYear}-09-30`];
                        break;
                };
                switch (val) {
                    case 'thisMonth':
                        endDay = 0;
                        startDay = -29;
                        this.timeRange = [`${myYear}-${myMonth}-01`, this.getTimeByDayNum(endDay)];
                        break;
                    case 'lastMonth':
                        this.timeRange = this.getPreMonth();
                        break;
                    case 'currentPeriod':
                        this.timeRange = timeRange;
                        break;
                    case 'prevPeriod':
                        this.timeRange = timeRangePrev;
                        break;
                    case 'allYear':
                        this.timeRange = timeRangeAnnual;
                        break;
                };
                this.$emit('changePieDate', this.timeRange);
            },
            /**
             * 通过天数获取对应天数的时间，负数：多少天前, 正数：多少天后*/
            getTimeByDayNum (dayNum) {
                let d = new Date();
                d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * dayNum);
                let month = d.getMonth() + 1 > 10 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1);
                let day = d.getDate() >= 10 ? d.getDate(): '0' + (d.getDate());
                let time = d.getFullYear() + '-' + month + '-' + day;
                return time;
            },
            /**
             * 获取上一个月
             * */
            getPreMonth() {
                const d2 = new Date();
                const m = d2.getMonth();
                const time = d2.getFullYear() + '-' + m;
                // 上一个月的开始时间
                let monthStartDate = new Date(d2.getFullYear(), d2.getMonth() - 1, 1);
                // 上一月的结束时间
                let monthEndDate = new Date(d2.getFullYear(), d2.getMonth(), 0);
                const timeStart = Date.parse(monthStartDate);
                const timeEnd = Date.parse(monthEndDate);
                return [this.getDateToStr(timeStart), this.getDateToStr(timeEnd)];
            },
            getDateToStr(date) {
                date = new Date(date);
                let month = date.getMonth() + 1 >= 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
                let day = date.getDate() >= 10 ? date.getDate() : '0' + (date.getDate());
                let time = date.getFullYear() + '-' + month + '-' + day + ' ';
                return time;
            },
            /**
             * 获取seriesData后 判断其中最大数据
             * 大于10 返回数值比较大的数据且恰好是10的倍数以保证柱状图的美观性
             * 小于10 返回10
             * @param arr 传入的数组
             * @param referNum 设置的对比值 默认10
             * */
            setYaxisMax(arr, referNum = 10) {
                let maxNum = Math.max(...arr);
                if (maxNum > referNum) {
                    return Math.ceil(maxNum / 10) * 10;
                } else {
                    return referNum;
                }
            },

            // 处理 card filter
            handleFilter(filterCon) {
                const { filterKey, filterType, filterValue } = filterCon;
                console.log(filterCon)
                if (filterType === 'date') {
                    this.$emit('update:dateRange', filterValue);
                    this.$emit('cardFilter', filterCon);
                }
                if (filterType === 'dateMothe') {
                    const start = this.$options.filters.timeFormat(filterValue[0]);
                    // const end = this.$options.filters.timeFormat(filterValue[1]);
                    const endTime = new Date(filterValue[1]);
                    const endYear = endTime.getFullYear();
                    const endMonth = endTime.getMonth() + 1;
                    const end = this.$options.filters.timeFormat(new Date(endYear, endMonth, 0).getTime());
                    this.$emit('changePieDate', [start, end]);
                }
                if (filterType === 'users') {
                    this.filterUserId = filterCon.userId;
                    this.$emit('cardFilter', filterCon);
                }
            },
            // 跳转到客户详情页
            async viewCompany(companyId) {
                // 判断是否有"我的客户"页面权限
                if (!this.isContainsMenu('myCustomer')) {
                    // 没有"我的客户"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                    return;
                }

                // 查询该公司 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Customer',
                    id: companyId
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 公海客户, 检查是否有"公海客户"页面权限
                if (authorized === 'highseas') {
                    // 判断是否有"公海客户"页面权限
                    if (!this.isContainsMenu('highseasCustomer')) {
                        // 没有"公海客户"页面权限, 弹出提示
                        this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionHighseasCustomer'));
                        return false;
                    }
                }

                // 设置筛选参数到 localStorage , 带参数跳转
                const config = [
                    {
                        key: 'eventDate',
                        val: this.dateRange
                    },
                    {
                        key: 'customerViewValue',
                        val: 1
                    },
                    {
                        key: 'companyId',
                        val: companyId
                    }
                ];
                localStorage.setItem('dashboard_customer_search_filters', JSON.stringify(config));

                // 新窗口打开客户详情页
                window.open(this.$router.resolve({
                    name: 'myCustomer',
                }).href, '_blank');
            },

            // 给外部调用, 表格数据更新时, 维持之前的 scrollTop(不然的话 tableData 刷新表格也会回到顶部)
            keepOffset() {
                let preScrollTop = 0;
                if (this.$refs.table) {
                    preScrollTop = this.$refs.table.$el.querySelector('.el-table__body-wrapper').scrollTop;
                }
                setTimeout(() => {
                    if (this.$refs.table) {
                        this.$refs.table.$el.querySelector('.el-table__body-wrapper').scrollTop = preScrollTop;
                    }
                }, 0);
            },
            downloadReport() {
                // 邮件处理, 下载单独处理 + return
                if (this.kind === 'mail') {
                    this.downloadReport_mail();
                    return;
                }

                if (this.downLoading) {
                    this.$Message.error(this.$t('dashBoardV2.tips.downLoading'));
                    return;
                };
                if (['workload', 'followUpOverview'].includes(this.kind)) {
                    if (this.dateRange[0] && this.dateRange[1]) {
                        if ((new Date(this.dateRange[1]).getTime() - new Date(this.dateRange[0]).getTime()) >= (60 * 24 * 60 * 60 * 1000)) {
                            this.$Message.error(this.$t('dashBoardV2.tips.downDateTip'));
                            return;
                        }
                    } else {
                        this.$Message.error(this.$t('dashBoardV2.tips.downDateTip'));
                        return;
                    }
                }
                this.downLoading = true;
                this.$Message({
                    showClose: true,
                    message: this.$t('dashBoardV2.tips.downLoadTip'),
                    type: 'success',
                    duration: 2000
                });
                const data = {
                    orgId: this.orgId,
                    userId: this.userId
                };
                if (this.kind === 'workload') {
                    data.reportType = 4;
                    data.admin = 1;
                    data.startDate = this.$dym.timeFormat(this.dateRange[0]);
                    data.endDate = this.$dym.timeFormat(this.dateRange[1]);
                } else if (this.kind === 'followUpOverview') {
                    data.reportType = 6;
                    data.startDate = this.$dym.timeFormat(this.dateRange[0]);
                    data.endDate = this.$dym.timeFormat(this.dateRange[1]);
                } else if (this.kind === 'remind') {
                    data.reportType = 5;
                    data.userId = this.filterUserId;
                }
                exportExcel(data).then(res => {
                    if (res.code === '1') {
                        window.open(res.data);
                    } else {
                        this.$Message.error(res.message);
                    }
                    this.downLoading = false;
                }).catch(() => {
                    this.downLoading = false;
                });
            },
            // 下载邮件处理报告数据, 单独处理
            downloadReport_mail() {
                window.open(`${this.$util.ajaxUrl}/dashboard/report/getMailProcessStats/download?query=${encodeURIComponent(JSON.stringify(this.filterConObj || {}))}`);
            }
        },
        created() {
            /**
             * 如果当前月份是1月份 则时间筛选中去掉上一个月这个选项
             * 如果是Q1 则去掉上季度这个选项
             * 后续如果开放支持跨年筛选时
             * 可以去掉下面的代码
             * */
            const myMonth = new Date().getMonth() + 1;
            if (myMonth === 1) {
                this.dateOptions = this.dateOptions.filter(date => date.value !== 'lastMonth');
            };
            if ([1, 2, 3].includes(myMonth)) {
                this.dateOptions = this.dateOptions.filter(date => date.value !== 'prevPeriod');
            }

            if (this.kind === 'followUpOverview') {
                this.filterType = 'date';
                this.filterKey = 'eventDate';
                this.handleFilter({
                    filterKey: this.filterKey,
                    filterType: this.filterType,
                    filterValue: [(new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)).getTime(), (new Date()).getTime()]
                });
            }
            if (['workload', 'keyAccount', 'mail', 'business'].includes(this.kind)) {
                this.filterType = 'date';
                this.filterKey = 'eventDate';
                this.handleFilter({
                    filterKey: this.filterKey,
                    filterType: this.filterType,
                    filterValue: [(Date.now() - 3600 * 1000 * 24 * 29), Date.now()]
                });
            }
            if (this.kind === 'remind') {
                this.filterType = 'users';
                this.filterUserId = this.userId;
            }
        },
        mounted() {
            if (this.kind !== 'targetOverview') {
                this.ctrlScrollBar(1);
            }
        },
        watch: {
            tableData: {
                handler(val) {
                    if (val.length === 1) {
                        this.initChartsData();
                    } else if (this.kind === 'targetOverview') {
                        this.initChartsData();
                    }
                    this.refresh_table_flag = false;
                    this.$nextTick(() => {
                        this.refresh_table_flag = true;
                    });
                },
                deep: true,
                immediate: true
            },
            window_width(val) {
                if (this.myChart && this.myChart.resize) {
                    this.myChart.resize();
                }
            },
            dataType: {
                handler(val) {
                    this.targetType = val;
                }
            }
        }
    };
</script>

<style scoped lang="less">
    @import "../cardtables.less";
</style>
