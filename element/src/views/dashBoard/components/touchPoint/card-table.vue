<!--
此页面目前是在 card-tables/card-table.vue 基础上改的, 去掉多余代码(只保留 todoList 图表相关内容)
目前纯粹是为了快速上线, 所以没做多的修改
之后应该会把这里的图表和表格部分也拆开(目前隐藏掉的图表还是用的 todoList 的图表, 之后放开要删掉大部分代码自己重新写), 让外部的 index.vue 控制
名字可能也会改下
-->
<template>
    <Card :body-style="{ height: '376px' }"
          class="table_card _b_r">
        <!-- 首列 -->
        <div class="table_header _f _j_b">
            <div class="table_header_left _f _c _j_b">
                <!-- 标题 -->
                <span class="table_title">{{ $t('dashBoardV2.Title.touchPoint') }}
                    <HelpTip :title="$t('helpTip.touchPoint')" :iconSize="14"></HelpTip>
                </span>
            </div>
            <div class="_f _j_b">
                <!-- 触点渠道类型筛选 -->
                <!--                <Select v-model="channelType"-->
                <!--                        size="small"-->
                <!--                        class="target_type_select"-->
                <!--                        @change="handleChannelChange">-->
                <!--                    <Option v-for="item in channelOptions"-->
                <!--                            :key="item.value"-->
                <!--                            :label="item.label"-->
                <!--                            :value="item.value"></Option>-->
                <!--                </Select>-->

                <!-- 导出 -->
                <Tooltip :content="$t('BriefCase.filePreview.download')"
                         effect="dark"
                         placement="bottom">
                    <Button type="text"
                            icon="custom custom-file-download"
                            :loading="exporting"
                            @click="handleExportData"
                            class="touchPoint-download-btn"></Button>
                </Tooltip>

                <!-- 新型筛选控件 -->
                <div class="table_header_right">
                    <CardFilter cardType="touchPoint"
                                :filterType="filterType"
                                :filterKey="filterKey"
                                :filterValue="dateRange"
                                @handleFilter="handleFilter"></CardFilter>
                </div>

                <!-- 趋势视图/列表视图 切换 -->
<!--                <div class="table_header_right">-->
<!--                    <Tabs :value="viewType"-->
<!--                          type="card"-->
<!--                          @tab-click="handleTabClick"-->
<!--                          class="table_header_tabs">-->
<!--                        <TabPane name="trend">-->
<!--                            <div slot="label">-->
<!--                                <span>{{ $t('dashBoardV2.Table.trendView') }}</span>-->
<!--                            </div>-->
<!--                        </TabPane>-->
<!--                        <TabPane name="list">-->
<!--                            <div slot="label">-->
<!--                                <span>{{ $t('dashBoardV2.Table.listView') }}</span>-->
<!--                            </div>-->
<!--                        </TabPane>-->
<!--                    </Tabs>-->
<!--                </div>-->
            </div>
        </div>

        <!-- 趋势视图 -->
        <div v-show="viewType === 'trend'"
             v-loading="loading"
             class="trend_panel">
            <!-- chart -->
            <div ref="chartView"
                 style="height: 300px;"></div>
        </div>

        <!-- 列表视图 -->
        <div v-show="viewType === 'list'"
             v-loading="loading"
             class="table_body">
            <Table :data="tableData"
                   highlight-current-row
                   ref="table"
                   size="medium"
                   height="266px"
                   max-height="266px"
                   class="noBoxShadow-right noborder-table dashBoard_table tabmain"
                   @mouseenter.native="ctrlScrollBar(0)"
                   @mouseleave.native="ctrlScrollBar(1)">
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
                        <!-- 特殊处理列 -->
                        <!-- 业务员, 可点击跳转 -->
                        <template v-if="item.key === 'userName'">
                            <a @click.stop="jumpTo(scope.row)"
                               class="hover-link">{{ scope.row[item.key] }}</a>
                        </template>

                        <!-- 正常列 -->
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
            <div style="padding:11px 0"
                 class="text-right">
                <Page :page-size="pageSize"
                      small
                      :total="totalNum"
                      :current-page="curPage"
                      layout="total, prev, pager, next"
                      @current-change="changePage"></Page>
            </div>
        </div>
    </Card>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import { getTouchPointData, exportTouchPointData } from '@/api/dashBoard/dashBoardV2';
    import util from '@/libs/util';
    import CardFilter from '@/views/dashBoard/components/card-tables/card-filter.vue';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';

    export default {
        name: 'card-table',
        components: {
            CardFilter
        },
        props: [
            'viewType',
            'dateRange'
        ],
        data() {
            return {
                /* 全局 */
                loading: true,
                // axios 取消请求
                cancelFunc: null,
                // 筛选
                filterType: '',
                filterKey: '',
                // 导出
                exporting: false,

                /* 表格 */
                tableColumns: [
                    {
                        key: 'userName',
                        title: this.$t('dashBoardV2.Table.salesMan'),
                        align: 'left',
                        width: 80
                    },
                    {
                        key: 'contactCount',
                        title: this.$t('dashBoardV2.Table.contactTotal'),
                        align: 'left',
                        width: 80
                    },
                    {
                        key: 'newContactCount',
                        title: this.$t('dashBoardV2.Table.newContactCount'),
                        align: 'left',
                        width: 80
                    },
                    {
                        key: 'followUpContactsCount',
                        title: this.$t('dashBoardV2.Table.followUpContactCount'),
                        align: 'left',
                        width: 80
                    },
                    {
                        key: 'sendMessageCount',
                        title: this.$t('dashBoardV2.Table.sendMsgCount'),
                        align: 'left',
                        width: 80
                    },
                    {
                        key: 'receiveMessageCount',
                        title: this.$t('dashBoardV2.Table.receiveMsgCount'),
                        align: 'left',
                        width: 80
                    }
                ],
                tableData: [],
                curPage: 1,
                pageSize: 10,
                totalNum: 0,

                /* 图表 */
                // 图表实例
                myChart: null,
                chartOption: {},
                xAxisData: [],
                // 柱状图数值
                seriesData: [],
                yAxisMax: 100
            };
        },
        computed: {
            ...mapState({
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                enterpriseId: 'enterpriseId',
                window_width: 'window_width',
                button_list: state => state.app.button_list
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            // 按钮权限集合
            authorized_button() {
                return {
                    view_subordinates: !HANDLE_BUTTON(BUTTON_IDS.WhatsApp.view_subordinates, this.button_list)
                };
            }
        },
        methods: {
            /* 全局 */
            // 趋势视图/列表视图 切换
            handleTabClick(tab) {
                this.$emit('update:viewType', tab.name);
            },
            // 处理 card filter
            handleFilter(filterCon) {
                const { filterKey, filterType, filterValue } = filterCon;

                // 日期型筛选
                if (filterType === 'date') {
                    this.$emit('update:dateRange', filterValue);
                    this.$nextTick(() => {
                        this.changePage(1);
                    });
                }

                // 用户型筛选
                if (filterType === 'users') {
                    // 暂无
                }
            },
            // 获取表格/列表数据
            async getData() {
                this.loading = true;
                const that = this;
                const startDate = this.$options.filters.timeFormat(this.dateRange[0]);
                const endDate = this.$options.filters.timeFormat(this.dateRange[1]);
                const data = {
                    admin: this.viewType === 'trend' ? 0 : 1,
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    size: this.pageSize,
                    page: this.curPage,
                    createTimeStart: startDate,
                    createTimeEnd: endDate
                };
                // 取消上次请求准备重新请求, 准备发送新情求
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }

                // 发送新请求
                const res = await getTouchPointData(data, new util.axios.CancelToken(function executor(c) {
                    // An executor function receives a cancel function as a parameter
                    that.cancelFunc = c;
                }));
                // 请求成功, 处理数据
                if (`${res.code}` === '1') {
                    this.tableData = res.data.data || [];
                    this.totalNum = res.data.total;
                    if (this.viewType === 'trend') {
                        this.initChartsData();
                    }
                }

                // 如果不是主动取消请求, 则取消 loading
                if (!util.axios.isCancel(res)) {
                    this.loading = false;
                }
            },
            // 导出数据
            handleExportData() {
                if (this.exporting) {
                    return;
                }

                // 处理请求数据
                const startDate = this.$options.filters.timeFormat(this.dateRange[0]);
                const endDate = this.$options.filters.timeFormat(this.dateRange[1]);
                const postData = {
                    admin: this.viewType === 'trend' ? 0 : 1,
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    createTimeStart: startDate,
                    createTimeEnd: endDate
                };

                this.exporting = true;
                // 发送请求
                exportTouchPointData(postData).then(res => {
                    if (res.code === 1) {
                        // 导出

                        window.open(res.data, '_blank');
                    } else {
                        this.$Message.error(this.$t('crm.Html.errorOccurred'));
                    }
                    this.exporting = false;
                }).catch(error => {
                    console.error(error);
                    this.$Message.error(this.$t('crm.Html.errorOccurred'));
                    this.exporting = false;
                });
            },

            /* 表格 */
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
            // 翻页
            async changePage(index) {
                this.curPage = index;
                this.getData();
            },
            // 跳转到其他模块, 目前仅有 wa , 后续加入其他模块后代码需调整
            jumpTo(rowData) {
                const { userId, userName: fullName, whatsappAccount } = rowData;
                if (!userId) {
                    this.$Message.error(this.$t('crm.Modal.errorOccurred'));
                    return;
                }

                // 没有 wa 账号绑定, 无法跳转
                if (!whatsappAccount) {
                    this.$Message.error(this.$t('dashBoardV2.tips.waAccountNotBind'));
                    return;
                }

                // 不是查看自己的 wa + 没有查看下属权限, 无法跳转
                if (`${userId}` !== `${this.userId}` && !this.authorized_button.view_subordinates) {
                    this.$Message.error(this.$t('dashBoardV2.tips.haveNoPermissionViewSub'));
                    return;
                }

                localStorage.setItem('dashBoard-touchPoint-jump', JSON.stringify({
                    whatsappAccount,
                    userId,
                    fullName
                }));

                window.open(this.$router.resolve({
                    name: 'whatsapp_chat'
                }).href, '_blank');
            },

            /* 图表 */
            drawLine() {
                // 通过传入的tableColumns 获取到柱状图X轴的类目数据
                // echarts 配置项
                const myChartDom = this.$refs.chartView;
                if (!myChartDom) {
                    return;
                }
                this.myChart = this.$echarts.init(myChartDom);
                this.myChart.off('click');
                this.myChart.showLoading({
                    text: '数据加载中...',
                    color: '#fd7a35',
                    textColor: '#fd7a35',
                    maskColor: 'rgba(255, 255, 255, 1)',
                    zlevel: 0
                });
                this.chartOption = {
                    tooltip: {
                        show: true,
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        },
                        formatter: function(params) {
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
                    yAxis: {
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
                        nameGap: 36,
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
                        right: '3%',
                        bottom: '15%',
                        top: '10%'

                    },
                    series: [{
                        data: this.seriesData,
                        type: 'bar',
                        cursor: 'pointer',
                        barWidth: 30,
                        label: {
                            show: true,
                            position: 'outside',
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
                // 绘制图表
                this.myChart.clear();
                this.myChart.setOption(this.chartOption);
                this.myChart.off('click');
                this.myChart.getZr().off('click');
                this.myChart.hideLoading();
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
                    const obj = this.tableData[0];
                    this.xAxisData.forEach(item => {
                        for (const k in obj) {
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
                // 趋势视图下 获取数据
                this.getxAxisData();
            },
            /**
             * 获取seriesData后 判断其中最大数据
             * 大于10 返回数值比较大的数据且恰好是10的倍数以保证柱状图的美观性
             * 小于10 返回10
             * @param arr 传入的数组
             * @param referNum 设置的对比值 默认10
             * */
            setYaxisMax(arr, referNum = 10) {
                const maxNum = Math.max(...arr);
                if (maxNum > referNum) {
                    return Math.ceil(maxNum / 10) * 10;
                } else {
                    return referNum;
                }
            }
        },
        created() {
            // 初始化, 设置筛选最近一个月数据
            this.filterType = 'date';
            this.filterKey = 'eventDate';
            this.handleFilter({
                filterKey: this.filterKey,
                filterType: this.filterType,
                filterValue: [(Date.now() - 3600 * 1000 * 24 * 29), Date.now()]
            });
        },
        mounted() {
            this.ctrlScrollBar(1);
        },
        watch: {
            viewType: {
                handler(val) {
                    this.tableData = [];
                    if (val === 'trend') {
                        this.xAxisData = [];
                        this.seriesData = [];
                    }
                    this.curPage = 1;
                    this.getData();
                }
            },
            window_width() {
                if (this.myChart && this.myChart.resize) {
                    this.myChart.resize();
                }
            }
        }
    };
</script>

<style scoped lang="less">
    @import "../cardtables.less";
    .trend_panel {
        position: relative;
        height: 100%;

        &_noData {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }

    .touchPoint-download-btn {
        //margin: 0 8px 0 20px;
        //height: 30px;
        padding: 0 8px;
        border: 1px solid #ABBFD5;
        border-radius: 4px;
    }
</style>
