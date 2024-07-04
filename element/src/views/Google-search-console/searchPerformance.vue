<template>
    <div class="searchPerformance">
        <!-- title -->
        <div class="searchPerformance-header">
            <!-- 标题 -->
            <div class="searchPerformance-title">{{ $t('googleSearchConsole.SearchPerformance') }}</div>

            <!-- 文件导出 -->
            <Tooltip :content="$t('crm.Table.exportData')"
                     effect="dark"
                     placement="bottom">
                <Button type="text"
                        icon="custom custom-file-download"
                        @click="exportData"
                        class="googleSearchConsole-exportData"></Button>
            </Tooltip>
        </div>

        <!-- filter -->
        <div class="searchPerformance-filter">
            <!-- 搜索类型 -->
            <div>
                <span>{{ $t('googleSearchConsole.searchType') }}</span>
                <Select v-model="searchType"
                        filterable>
                    <Option v-for="item in searchTypeOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                    </Option>
                </Select>
            </div>

            <!-- 查询 -->
            <div>
                <span>{{ $t('googleSearchConsole.filter') }}</span>
                <Select v-model="queryLogic"
                        filterable>
                    <Option v-for="item in queryLogicOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                    </Option>
                </Select>
                <Input v-model="queryInput"
                       maxlength="200"
                       :placeholder="$t('tableFilter.tip_inputKeyWords')"></Input>
            </div>

            <!-- 网页 -->
            <div>
                <span>{{ $t('googleSearchConsole.webPage') }}</span>
                <Select v-model="webPageLogic"
                        filterable>
                    <Option v-for="item in webPageLogicOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                    </Option>
                </Select>
                <Input v-model="webPageInput"
                       maxlength="200"
                       :placeholder="$t('googleSearchConsole.tip_inputPage')"></Input>
            </div>

            <!-- 设备 -->
            <div>
                <span>{{ $t('googleSearchConsole.device') }}</span>
                <Select v-model="device"
                        filterable>
                    <Option v-for="item in deviceOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                    </Option>
                </Select>
            </div>
        </div>

        <!-- 手动控制图表 legend -->
        <div v-for="item in legendList"
             :key="item.name"
             @click="toggleLegendItem(item)"
             :class="{ 'searchPerformance-chart-legend__checked': item.checked, 'searchPerformance-chart-legend__disabled': (checkedLegendList.length === 1 && checkedLegendList[0] === item.name) }"
             class="searchPerformance-chart-legend">
            <div class="searchPerformance-chart-legend-header">
                <div class="searchPerformance-chart-legend-color"
                     :style="{ background: item.color }"></div>
                {{ item.lang }}
                <!-- tip -->
                <Tooltip :content="item.helpTip">
                    <Icon custom="custom-tip"
                          class="searchPerformance-chart-legend-helpTip"></Icon>
                </Tooltip>
            </div>
            <div class="searchPerformance-chart-legend-data">
                {{ statData[item.name] || '-' }}
            </div>
        </div>

        <!-- 图表 -->
        <div ref="chart"
             class="searchPerformance-chart"></div>

        <!-- 表格部分 -->
        <div class="searchPerformance-table-container">
            <!-- 表格 tabs -->
            <div class="searchPerformance-table-tabs">
                <Tabs v-model="currTab">
                    <TabPane v-for="item in tabList"
                             :key="item.name"
                             :name="item.name"
                             :label="item.label"></TabPane>
                </Tabs>
            </div>

            <!-- 表格 -->
            <div class="searchPerformance-table">
                <keep-alive>
                    <component :is="`${currTab}SearchEffect`"
                               :currSite="currSite"
                               :currSiteInvalid.sync="currSiteInvalid"
                               :filterDate="filterDate"
                               :currTab="currTab"
                               :searchType="searchType"
                               :dimensionFilters="dimensionFilters"
                               :checkedLegendList="checkedLegendList"></component>
                </keep-alive>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapGetters, mapState } from 'vuex';
    import { debounce } from 'lodash';
    import { searchConsole } from '@/api/google/index';
    import SearchEffect from '@/views/Google-search-console/table/searchEffect.vue';

    export default {
        name: 'searchPerformance',
        components: {
            querySearchEffect: SearchEffect,
            pageSearchEffect: SearchEffect,
            countrySearchEffect: SearchEffect,
            deviceSearchEffect: SearchEffect,
            searchAppearanceSearchEffect: SearchEffect,
            dateSearchEffect: SearchEffect
        },
        props: {
            currSite: {
                type: Object,
                default() {
                    return {};
                }
            },
            filterDate: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                window_width: 'window_width'
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            // 当前选中的图表指标的集合
            checkedLegendList() {
                return this.legendList.filter(item => item.checked).map(item => item.name);
            },
            // 筛选条件
            dimensionFilters() {
                const result = [];

                // 查询
                if (this.queryLogic && this.queryInput) {
                    result.push({
                        dimension: 'query',
                        operator: this.queryLogic,
                        expression: this.queryInput
                    });
                }

                // 网页
                if (this.webPageLogic && this.webPageInput) {
                    result.push({
                        dimension: 'page',
                        operator: this.webPageLogic,
                        expression: this.webPageInput
                    });
                }

                // 设备
                if (this.device) {
                    result.push({
                        dimension: 'device',
                        operator: 'equals',
                        expression: this.device
                    });
                }

                return result;
            }
        },
        data() {
            return {
                /* 全局 */
                // 当前选中站点被发现是已失效
                currSiteInvalid: false,
                // 绑定提示实例
                bindTip: null,

                /* filter */
                searchType: 'web',
                searchTypeOptions: [
                    { value: 'web', label: this.$t('googleSearchConsole.network') },
                    { value: 'image', label: this.$t('googleSearchConsole.picture') },
                    { value: 'video', label: this.$t('googleSearchConsole.video') },
                    { value: 'news', label: this.$t('googleSearchConsole.news') }
                ],
                queryLogic: '',
                queryLogicOptions: [
                    { value: 'contains', label: this.$t('crm.Table.con_include') },
                    { value: 'notContains', label: this.$t('crm.Table.con_exclude') },
                    { value: 'equals', label: this.$t('crm.Table.con_equal') }
                ],
                queryInput: '',
                webPageLogic: '',
                webPageLogicOptions: [
                    { value: 'contains', label: this.$t('crm.Table.con_include') },
                    { value: 'notContains', label: this.$t('crm.Table.con_exclude') },
                    { value: 'equals', label: this.$t('crm.Table.con_equal') }
                ],
                webPageInput: '',
                device: '',
                deviceOptions: [
                    { value: 'DESKTOP', label: this.$t('GA.desktopDevice') },
                    { value: 'MOBILE', label: this.$t('GA.mobileDevice') },
                    { value: 'TABLET', label: this.$t('GA.tablet') }
                ],

                /* chart */
                statData: {},
                legendList: [
                    {
                        name: 'ranking',
                        lang: this.$t('googleSearchConsole.avgRanking'),
                        helpTip: this.$t('googleSearchConsole.tip_ranking'),
                        color: '#325BCE',
                        checked: false
                    },
                    {
                        name: 'clicks',
                        lang: this.$t('googleSearchConsole.totalClicks'),
                        helpTip: this.$t('googleSearchConsole.tip_clicks'),
                        color: '#1FBFB1',
                        checked: true
                    },
                    {
                        name: 'impressions',
                        lang: this.$t('googleSearchConsole.totalImpressions'),
                        helpTip: this.$t('googleSearchConsole.tip_impressions'),
                        color: '#EE5943',
                        checked: true
                    },
                    {
                        name: 'clickRate',
                        lang: this.$t('googleSearchConsole.avgClickRate'),
                        helpTip: this.$t('googleSearchConsole.tip_clickRate'),
                        color: '#FFAEA2',
                        checked: false
                    }
                ],
                legendLang: {
                    ranking: this.$t('googleSearchConsole.ranking'),
                    clicks: this.$t('googleSearchConsole.clicks'),
                    impressions: this.$t('googleSearchConsole.impressions'),
                    clickRate: this.$t('googleSearchConsole.clickRate')
                },
                chart: null,
                chartData: [],
                chart_option: {
                    tooltip: {
                        trigger: 'axis',
                        formatter: (a0) => {
                            let str = `<div style="font-size: 16px;font-weight: 500;margin-bottom: 10px;">${a0[0].axisValueLabel}</div>`;
                            a0.forEach(item => {
                                str += `<div style="background: ${item.color};display: inline-block;width: 12px;height: 12px;border-radius: 4px;margin-right: 8px;position: relative;top: 0.5px;"></div>${this.legendLang[item.seriesName]} : `;
                                if (item.seriesName === 'clickRate') {
                                    str += `${(item.value * 100).toFixed(2)}% <br />`;
                                } else {
                                    str += `${item.value} <br />`;
                                }
                            });
                            return str;
                        }
                    },
                    legend: {
                        show: false,
                        selected: {
                            ranking: false,
                            clicks: true,
                            impressions: true,
                            clickRate: false
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        axisLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        },
                        data: []
                    },
                    yAxis: [
                        {
                            type: 'value',
                            id: 'ranking',
                            name: this.$t('googleSearchConsole.avgRanking'),
                            show: false,
                            position: 'left',
                            inverse: true,
                            nameLocation: 'start',
                            axisLine: {
                                show: false
                            },
                            axisLabel: {
                                show: true
                            },
                            axisTick: {
                                lineStyle: {
                                    opacity: 0
                                }
                            },
                            alignTicks: true
                        },
                        {
                            type: 'value',
                            id: 'clicks',
                            name: this.$t('googleSearchConsole.totalClicks'),
                            show: true,
                            position: 'left',
                            inverse: false,
                            axisLine: {
                                show: false
                            },
                            axisLabel: {
                                show: true
                            },
                            axisTick: {
                                lineStyle: {
                                    opacity: 0
                                }
                            },
                            alignTicks: true
                        },
                        {
                            type: 'value',
                            id: 'impressions',
                            name: this.$t('googleSearchConsole.totalImpressions'),
                            show: true,
                            position: 'right',
                            inverse: false,
                            axisLine: {
                                show: false
                            },
                            axisLabel: {
                                show: true
                            },
                            axisTick: {
                                lineStyle: {
                                    opacity: 0
                                }
                            },
                            alignTicks: true
                        },
                        {
                            type: 'value',
                            id: 'clickRate',
                            name: this.$t('googleSearchConsole.avgClickRate'),
                            show: false,
                            position: 'left',
                            inverse: false,
                            axisLine: {
                                show: false
                            },
                            axisLabel: {
                                show: true,
                                formatter(value, index) {
                                    return `${(value)}%`;
                                }
                            },
                            axisTick: {
                                lineStyle: {
                                    opacity: 0
                                }
                            },
                            alignTicks: true
                        }
                    ],
                    series: [
                        {
                            name: 'ranking',
                            type: 'line',
                            stack: 'ranking',
                            itemStyle: {
                                color: '#325BCE'
                            },
                            data: []
                        },
                        {
                            name: 'clicks',
                            type: 'line',
                            stack: 'clicks',
                            yAxisIndex: 1,
                            itemStyle: {
                                color: '#1FBFB1'
                            },
                            data: []
                        },
                        {
                            name: 'impressions',
                            type: 'line',
                            stack: 'impressions',
                            yAxisIndex: 2,
                            itemStyle: {
                                color: '#EE5943'
                            },
                            data: []
                        },
                        {
                            name: 'clickRate',
                            type: 'line',
                            stack: 'clickRate',
                            yAxisIndex: 3,
                            itemStyle: {
                                color: '#FFAEA2'
                            },
                            data: []
                        }
                    ]
                },

                /* tabs */
                currTab: 'query',
                tabList: [
                    {
                        name: 'query',
                        label: this.$t('googleSearchConsole.query')
                    },
                    {
                        name: 'page',
                        label: this.$t('googleSearchConsole.page')
                    },
                    {
                        name: 'country',
                        label: this.$t('googleSearchConsole.country')
                    },
                    {
                        name: 'device',
                        label: this.$t('googleSearchConsole.device')
                    },
                    {
                        name: 'searchAppearance',
                        label: this.$t('googleSearchConsole.searchAppearance')
                    },
                    {
                        name: 'date',
                        label: this.$t('googleSearchConsole.date')
                    }
                ]
            };
        },
        methods: {
            /* 全局 */
            // 点击跳转到 Google Search Console 绑定界面
            toBind() {
                if (this.isContainsMenu('google_search_console_bind')) {
                    // 校验通过, 新标签页打开线索详情
                    window.open(this.$router.resolve({
                        name: 'google_search_console_bind'
                    }).href, '_blank');
                } else {
                    this.$Message.warning(this.$t('googleSearchConsole.error_haveNoPermissionSearchConsoleBinding'));
                }
            },

            /* stat 统计数据 */
            getStatData() {
                // 清空旧数据
                this.statData = [];
                // 暂存 configId
                const configId = this.currSite.configId;
                searchConsole.getSearchPerformanceStatData({
                    orgId: this.enterpriseId,
                    configId: this.currSite.configId,
                    startDate: this.filterDate[0],
                    endDate: this.filterDate[1],
                    siteUrl: this.currSite.siteUrl,
                    type: this.searchType,
                    dimensionFilters: this.dimensionFilters
                }).then(res => {
                    // 如果请求期间站点已切换, 退出流程
                    if (this.currSite.configId !== configId) {
                        return;
                    }

                    if (res.code === '1' && Array.isArray(res.data) && res.data[0]) {
                        this.statData = this.handleStatData(res.data[0]);
                    } else if (res.code === '-100') {
                        // 站点失效

                        if (!this.currSiteInvalid) {
                            // 如果其他接口已发现此站点已失效, 则此处不重复做处理, 否则继续向下执行

                            // 标记当前站点已失效
                            this.currSiteInvalid = configId;
                        }
                    } else {
                        // 其他失败场景

                        this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    }
                }).catch(e => {
                    // 其他失败场景

                    console.error(e);
                    this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                });
            },
            handleStatData(data) {
                let {
                    clicks,
                    ctr: clickRate,
                    impressions,
                    position: ranking
                } = data;

                if (clickRate) {
                    clickRate = `${(clickRate * 100).toFixed(2)}%`;
                }
                if (ranking) {
                    ranking = ranking.toFixed(2);
                }

                return {
                    clicks,
                    clickRate,
                    impressions,
                    ranking
                };
            },
            // 切换指标是否勾选
            toggleLegendItem(item) {
                // 至少要勾选一个指标
                if (!item.checked || this.checkedLegendList.length > 1) {
                    item.checked = !item.checked;
                }
            },

            /* chart */
            getChartData() {
                // 暂存 configId
                const configId = this.currSite.configId;
                searchConsole.getSearchPerformanceChartData({
                    orgId: this.enterpriseId,
                    configId: this.currSite.configId,
                    startDate: this.filterDate[0],
                    endDate: this.filterDate[1],
                    siteUrl: this.currSite.siteUrl,
                    type: this.searchType,
                    dimensionFilters: this.dimensionFilters
                }).then(res => {
                    // 如果请求期间站点已切换, 退出流程
                    if (this.currSite.configId !== configId) {
                        return;
                    }

                    if (res.code === '1' && Array.isArray(res.data)) {
                        this.chartData = this.handleChartData(res.data);
                        const valueObj = Object.values(this.chartData);
                        this.chart.setOption({
                            xAxis: {
                                data: Object.keys(this.chartData)
                            },
                            series: this.chart_option.series.map(item => {
                                item.data = valueObj.map(valItem => {
                                    return valItem[item.name] || 0;
                                });
                                return item;
                            })
                        });
                    } else if (res.code === '-100') {
                        // 站点失效

                        if (!this.currSiteInvalid) {
                            // 如果其他接口已发现此站点已失效, 则此处不重复做处理, 否则继续向下执行

                            // 标记当前站点已失效
                            this.currSiteInvalid = configId;
                        }
                    } else {
                        // 其他失败场景

                        this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    }
                }).catch(e => {
                    // 其他失败场景

                    console.error(e);
                    this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                });
            },
            handleChartData(data) {
                const result = {};

                data.forEach(item => {
                    if (item.key) {
                        result[item.key] = {
                            clicks: item.clicks,
                            clickRate: item.ctr,
                            impressions: item.impressions,
                            ranking: Math.ceil(item.position)
                        };
                    }
                });

                return result;
            },

            // 刷新数据, 重绘图表
            refreshData() {
                this.getStatData();
                this.getChartData();
            },
            // 防抖刷新数据, 避免顶部筛选框输入频繁触发筛选
            debounce_refreshData: debounce(function() {
                this.refreshData();
            }, 300),

            // 文件下载
            exportData() {
                window.open(`${this.$util.internationalUrl}/oversea/googlesearch/download/list?query=${encodeURIComponent(JSON.stringify({
                    orgId: this.enterpriseId,
                    configId: this.currSite.configId,
                    startDate: this.filterDate[0],
                    endDate: this.filterDate[1],
                    siteUrl: this.currSite.siteUrl,
                    type: this.searchType,
                    dimensionFilters: this.dimensionFilters
                }))}`, '_blank');
            }
        },
        watch: {
            window_width: {
                handler(val) {
                    if (this.chart && this.chart.resize) {
                        this.chart.resize();
                    }
                }
            },
            // 选中 legend 发生变化时刷新图表
            checkedLegendList: {
                handler() {
                    if (this.chart) {
                        // 设置 legend 显隐
                        const legend = {};
                        this.legendList.forEach(item => {
                            legend[item.name] = item.checked;
                        });

                        // 控制多 Y 轴显隐
                        const yAxis = this.chart_option.yAxis;
                        if (this.checkedLegendList.length > 2) {
                            // 选中指标大于两项, 所有 y 轴都不显示了, 参照 Google search console 图标
                            yAxis.forEach(item => {
                                // 隐藏轴时要连 axisLabel 一起隐藏掉, 不然多条轴实际还在占位, 两侧显示空白, 压缩了图表显示面积
                                item.show = false;
                                item.axisLabel.show = false;
                            });
                        } else {
                            // 选中指标小于两项, 按先后顺序排列左右轴
                            const position = ['left', 'right'];
                            yAxis.forEach(item => {
                                if (legend[item.id] && position.length) {
                                    item.show = true;
                                    item.axisLabel.show = true;
                                    item.position = position.shift();
                                } else {
                                    item.show = false;
                                    item.axisLabel.show = false;
                                }
                            });
                        }

                        // 刷新图表
                        this.chart.setOption({
                            legend: {
                                selected: legend
                            },
                            yAxis
                        });
                    }
                }
            },
            'currSite.id': {
                handler(val) {
                    if (val) {
                        // 重置"当前站点是否已失效"信息
                        this.currSiteInvalid = false;
                        // 刷新数据
                        this.refreshData();
                    }
                }
            },
            // 当发现当前站点失效时, 弹出重新绑定提示框 + 查询站点绑定状态
            currSiteInvalid: {
                handler(val) {
                    if (val) {
                        // 调用后端接口查询站点绑定状态
                        searchConsole.checkSiteValidStatus({
                            id: val
                        });

                        // 弹出重新绑定提示框
                        if (this.bindTip) {
                            return;
                        }
                        const h = this.$createElement;
                        this.bindTip = this.$Message({
                            type: 'error',
                            duration: 0,
                            showClose: true,
                            dangerouslyUseHTMLString: true,
                            message: h('p', {
                                style: 'padding-right: 24px;font-size: 14px;line-height: 14px;'
                            }, [
                                h('span', this.$t('googleSearchConsole.error_siteInvalid1')),
                                h('a', {
                                    style: 'color: #3B78DE;cursor: pointer;',
                                    on: {
                                        click: () => {
                                            this.toBind();
                                        }
                                    }
                                }, 'Google Search Console'),
                                h('span', this.$t('googleSearchConsole.error_siteInvalid2'))
                            ])
                        });
                    } else {
                        if (this.bindTip) {
                            this.bindTip.close();
                            this.bindTip = null;
                        }
                    }
                }
            },
            filterDate() {
                this.refreshData();
            },
            searchType() {
                this.refreshData();
            },
            // 顶部筛选条件变化时触发数据更新
            dimensionFilters(val, oldVal) {
                if (JSON.stringify(val) !== JSON.stringify(oldVal)) {
                    this.debounce_refreshData();
                }
            }
        },
        mounted() {
            this.chart = this.$echarts.init(this.$refs.chart);
            this.chart.setOption(this.chart_option);
            this.refreshData();
        },
        destroyed() {
            // 清除图表实例
            if (this.chart && this.chart.dispose) {
                this.chart.dispose();
            }

            // 清除绑定提示
            if (this.bindTip) {
                this.bindTip.close();
                this.bindTip = null;
            }
        }
    };
</script>

<style lang="less" scoped>
    .searchPerformance {
        background: #FFF;
        padding: 20px;

        &-header {
            margin-bottom: 12px;
            display: flex;
        }

        &-title {
            font-weight: 600;
            font-size: 16px;
            line-height: 24px;
            color: #333;
            flex: 1;
        }

        &-exportBtn {
            display: inline-block;
            line-height: 0;
            padding: 8px;
            border: 1px solid #A0B7CE;
            border-radius: 4px;
            cursor: pointer;
        }

        &-filter {
            display: flex;
            color: #333;

            & > div {
                display: flex;
                align-items: center;
                white-space: nowrap;

                &:not(:first-child) {
                    margin-left: 30px;
                }

                > div {
                    &:not(:first-child) {
                        margin-left: 20px;
                    }
                }
            }
        }

        &-chart-legend {
            display: inline-flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 14px 34px 10px;
            min-width: 160px;
            margin-top: 18px;
            cursor: pointer;
            position: relative;

            &__checked {
                background: #F4F4F4;
            }

            &__disabled {
                cursor: not-allowed;
            }

            &-header {
                margin-bottom: 8px;
                font-size: 14px;
                line-height: 22px;
                color: rgba(0, 0, 0, 0.8);
            }

            &-color {
                display: inline-block;
                width: 12px;
                height: 12px;
                border-radius: 4px;
                margin-right: 8px;
                position: relative;
                top: 0.5px;
            }

            &-helpTip {
                position: absolute;
                right: 13px;
                top: 18px;
            }

            &-data {
                font-size: 28px;
                line-height: 30px;
                color: #000;
            }
        }

        &-chart {
            width: 100%;
            height: 300px;
            margin-bottom: 15px;
        }

        &-table-tabs {
            /deep/ .el-tabs__nav-wrap::after {
                height: 1px;
            }
        }
    }
</style>
