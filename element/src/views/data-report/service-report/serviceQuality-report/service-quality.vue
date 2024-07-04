<template>
    <Card class="clue-report-survey" style="overflow-y: scroll">
        <Spin v-show="loading" fix></Spin>
        <div class='clearfix'>
            <div style="float: left;">
                <h2 class='account-head-title'>
                    {{$t('serviceReport.serviceQuality')}}
                </h2>
            </div>
            <div style="float: right;">
                <DatePicker @change="changeDate" type="daterange" :clearable="true" :options="dateOption"
                            placement="bottom-end" placeholder="Select date"
                            style="width: 220px;height:40px;" v-model="dateValue"></DatePicker>
            </div>
            <div class='switch-chart' @click="changeChart" style="display: inline-block;">
                <template v-if="showLineChart">
                    <Icon type="pie-graph"></Icon>
                    {{$t('serviceReport.pieChart')}}
                </template>
                <template v-else>
                    <Icon type="ios-pulse-strong"></Icon>
                    {{$t('serviceReport.lineGraph')}}
                </template>
            </div>
            <div style="float: right;display: inline-block;width: 100px;" v-show="!showLineChart">
                <Select v-model="pieDataType" :placeholder="$t('serviceReport.switch')" @change="changePieDataType">
                    <Option v-if="item.title!=$t('serviceReport.serviceName')" v-for=" (item,index) in allTableColumns"
                            :value="item.key" :label="item.title"></Option>
                    <!-- <Option value="inqCount" label="询盘数"></Option>
                    <Option value="inqRate" label="询盘转化率"></Option> -->
                </Select>
            </div>
        </div>
        <!-- 图 -->
        <div>
            <div style="margin: 14px;" class="xpy-shadow">
                <div ref="clue_location_chart" style="height: 380px;"></div>
            </div>
        </div>
        <!-- 表格 -->
        <div class="table_wrap">
            <div class="operateWrap clearfix">
                <span><Button v-if="authorized_export" type="text" customIcon="custom-file-download" @click="exportData">{{$t('serviceReport.download')}}</Button></span>
                <span>
                    <Poptip>
                        <Button slot="reference" type="text" customIcon="custom-more" style="margin-right: 20px">{{$t('serviceReport.modifyField')}}</Button>
                        <div>
                            <Checkbox
                                    :indeterminate="indeterminate"
                                    :value="checkAll"
                                    @click.prevent.native="handleCheckAll" style="margin-bottom: 5px;">{{$t('serviceReport.totalSelection')}}</Checkbox>
                            <CheckboxGroup v-model="allGroup" @change="changeGroups" class="checkboxgroup">
                                <Checkbox :label="item.title"
                                          v-for="item in allTableColumns">{{ item.title }}</Checkbox>
                            </CheckboxGroup>
                        </div>
                    </Poptip>
                </span>
            </div>
            <div class="table" style="margin: 14px;">
                <!--<Table
                        @on-sort-change="changeSort"
                        ref="table"
                        :columns="tableColumns"
                        :data="tableData"
                        :loading="loading"
                        :height="table_height"
                        class="tabmain"></Table>-->
                <Table class="tabmain noBoxShadow-right noborder-table"
                       ref="table"
                       :height="table_height"
                       :data="tableData"
                       highlight-current-row
                       style="width: 100%">
                    <template>
                        <TableColumn v-for="item in tableColumns"
                                     :prop="item.key"
                                     :key="item.key"
                                     :label="item.title"
                                     :width="item.width"
                                     show-overflow-tooltip>
                        </TableColumn>
                    </template>
                </Table>
                <div style="margin: 10px;text-align: right">
                    <div>
                        <Page :page-sizes="pageSizeOpts" ref="pages" :total="totalPage" :current-page="curPage"
                              :page-size="pageSize"
                              @current-change="changePage" @size-change="pageSizeChange"
                              layout='prev, pager, next,sizes, jumper, ->, total'></Page>
                    </div>
                </div>
            </div>
        </div>
    </Card>
</template>

<script>
    import util from '@/libs/util';
    import _ from 'lodash';
    import { mapState } from 'vuex';

    export default {
        props: {
            authorized_export: Boolean
        },
        data() {
            return {
                /* 全局 */
                dateValue: [],
                dateOption: {
                    shortcuts: [
                        {
                            text: this.$t('traffic.today'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('traffic.yesterday'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24);
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('traffic.week'),
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
                            text: this.$t('traffic.lastWeek'),
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
                            text: this.$t('traffic.month'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(new Date(start.getFullYear(), start.getMonth(), 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('traffic.lastMonth'),
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
                        return date.valueOf() > Date.now() - 1 * 3600 * 24 * 1000;
                    }
                },
                loading: true,
                // screenWidth: document.body.clientWidth,
                locationData: {}, // 请求得到的原始数据
                /* 图表 */
                showLineChart: true,
                showLoadingOpts: {
                    text: 'loading',
                    color: '#fd7a35',
                    textColor: '#fd7a35',
                    maskColor: 'rgba(255, 255, 255, 1)',
                    zlevel: 0
                },
                clueLocationChart: {},
                lineChart: {},
                lineChartOption: {
                    title: {
                        // text: 'TOP 10',
                        padding: 10,
                        textStyle: {
                            fontStyle: 'italic'
                        }
                    },
                    grid: {
                        left: '8%',
                        right: '8%',
                        top: '20%'
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter: (params) => {
                            let res = `${this.$t('serviceReport.service')} ${this.$t('serviceReport.count')}<br/>${params[0].axisValue}<br/>`;
                            params.forEach((item, index) => {
                                if (item.seriesName.indexOf(this.$t('serviceReport.conversionRate')) != -1) {
                                    item.value = `${(item.value * 10000 / 100).toFixed(2)}%`;
                                }
                                res += `${item.marker + item.seriesName}:${item.value}<br/>`;
                            });
                            return res;
                        }
                    },
                    color: ['#FA8241', '#caf268', '#51b7a2', '#6289c9', '#e88bc6', '#90c1ae', '#4fdfe8', '#f1ce7f', '#fec3c2', '#ff4367'],
                    legend: {
                        show: true,
                        top: '30',
                        data: []
                    },
                    xAxis: {
                        type: 'category',
                        data: []
                    },
                    yAxis: [
                        {
                            show: true,
                            type: 'value',
                            name: this.$t('serviceReport.count'),
                            position: 'left',
                            min: 0
                        }
                    ],
                    series: []
                },
                pieChart: {},
                pieChartOption: {
                    color: ['#FA8241', '#caf268', '#51b7a2', '#6289c9', '#e88bc6', '#90c1ae', '#4fdfe8', '#f1ce7f', '#fec3c2', '#ff4367'],
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b} : {c} ({d}%)'
                    },
                    legend: {
                        data: [],
                        right: '10%',
                        top: '10%',
                        bottom: '10%',
                        orient: 'vertical'
                    },
                    series: [
                        {
                            name: this.$t('serviceReport.serviceQ'),
                            type: 'pie',
                            radius: '55%',
                            center: ['50%', '60%'],
                            data: [],
                            itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                },
                pieDataType: 'count', // 饼图显示的数据类型
                /* 表格 */
                // table_height: window.screen.height - 450,
                tableColumns: [
                    {
                        title: this.$t('serviceReport.serviceName'),
                        key: 'sortName',
                        width: 100
                    },
                    {
                        title: this.$t('serviceReport.avgServercount'),
                        key: 'avgServercount',
                        sortable: true,
                        width: 180
                    },
                    {
                        title: this.$t('serviceReport.sumOnline'),
                        key: 'sumOnline',
                        sortable: true,
                        width: 180
                    },
                    {
                        title: this.$t('serviceReport.count'),
                        key: 'count',
                        sortable: true,
                        width: 100
                    },
                    {
                        title: this.$t('serviceReport.avgDialog'),
                        key: 'avgDialog',
                        width: 180,
                        sortable: true
                    },
                    {
                        title: this.$t('serviceReport.avgVisitorcount'),
                        key: 'avgVisitorcount',
                        width: 180,
                        sortable: true
                    },
                    {
                        title: this.$t('serviceReport.avgOnline'),
                        key: 'avgOnline',
                        width: 180,
                        sortable: true
                    },
                    {
                        title: this.$t('serviceReport.sumDialog'),
                        key: 'sumDialog',
                        width: 180,
                        sortable: true
                    }
                ],
                allTableColumns: [
                    {
                        title: this.$t('serviceReport.serviceName'),
                        key: 'sortName'
                    },
                    {
                        title: this.$t('serviceReport.avgServercount'),
                        key: 'avgServercount',
                        sortable: true
                    },
                    {
                        title: this.$t('serviceReport.sumOnline'),
                        key: 'sumOnline',
                        sortable: true
                    },
                    {
                        title: this.$t('serviceReport.count'),
                        key: 'count',
                        sortable: true
                    },
                    {
                        title: this.$t('serviceReport.avgDialog'),
                        key: 'avgDialog',
                        sortable: true
                    },
                    {
                        title: this.$t('serviceReport.avgVisitorcount'),
                        key: 'avgVisitorcount',
                        sortable: true
                    },
                    {
                        title: this.$t('serviceReport.avgOnline'),
                        key: 'avgOnline',
                        sortable: true
                    },
                    {
                        title: this.$t('serviceReport.sumDialog'),
                        key: 'sumDialog',
                        sortable: true
                    }
                ],
                allTableData: [],
                tableData: [],
                pageSizeOpts: [10, 20, 30, 50],
                pageNum: 1,
                totalPage: 0,
                curPage: 1,
                pageSize: 10,
                maxPageNum: 1,
                indeterminate: false,
                checkAll: true,
                allGroup: [this.$t('serviceReport.avgDialog'), this.$t('serviceReport.avgOnline'), this.$t('serviceReport.avgServercount'), this.$t('serviceReport.avgVisitorcount'), this.$t('serviceReport.count'), this.$t('serviceReport.serviceName'), this.$t('serviceReport.sumDialog'), this.$t('serviceReport.sumOnline')]
            };
        },
        computed: {
            ...mapState([
                'enterpriseId',
                'window_width',
                'window_height'
            ]),
            table_height() {
                const temp = this.window_height ? this.window_height - 450 : document.body.clientHeight - 450;
                return temp > 200 ? temp : 200;
            },
            pieDataTypeCn: function() {
                switch (this.pieDataType) {
                    case 'avgServercount':
                        return this.$t('serviceReport.avgServercount');
                    case 'sumOnline':
                        return this.$t('serviceReport.sumOnline');
                    case 'count':
                        return this.$t('serviceReport.count');
                    case 'avgDialog':
                        return this.$t('serviceReport.avgDialog');
                    case 'avgVisitorcount':
                        return this.$t('serviceReport.avgVisitorcount');
                    case 'avgOnline':
                        return this.$t('serviceReport.avgOnline');
                    case 'sumDialog':
                        return this.$t('serviceReport.sumDialog');
                }
            }
        },
        methods: {
            dateFormat() { /* 向date对象添加格式化日期的函数 */
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
                        fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()}`).substr(4 -
                            RegExp.$1.length));
                    }
                    for (const k in o) {
                        if (new RegExp(`(${k})`).test(fmt)) {
                            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
                                : ((`00${o[k]}`).substr((`${o[k]}`).length)));
                        }
                    }
                    return fmt;
                };
            },
            getLocationData: function() {
                util.ajax({
                    url: '/report/cusserver/getQualityList',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        startDate: this.dateValue[0] ? this.dateValue[0].format('yyyy-MM-dd') : '2018-03-01',
                        endDate: this.dateValue[1] ? this.dateValue[1].format('yyyy-MM-dd') : new Date().format('yyyy-MM-dd')
                    }
                }).then(response => {
                    this.loading = false;
                    if (response.data.code === '1') {
                        this.locationData = response.data.data;
                        this.changeChart(false);
                        this.allTableData = this.locationData.list;
                        this.allTableData = this.allTableData.map((item, i) => {
                            const obj = {};
                            for (const key in item) {
                                if (key.indexOf('Rate') != -1) {
                                    obj[key] = `${(item[key] * 10000 / 100).toFixed(2)}%`;
                                } else {
                                    obj[key] = item[key];
                                }
                            }
                            return obj;
                        });
                        this.totalPage = this.allTableData.length;
                        this.maxPageNum = Math.ceil(this.allTableData.length / this.pageSize);
                        if (this.pageNum < this.maxPageNum) {
                            this.changeContent(0, this.pageSize);
                        } else {
                            this.changeContent(0, this.allTableData.length);
                        }
                    }
                });
            },
            changeDate: function() {
                this.loading = true;
                this.curPage = 1;
                this.$refs.pages.currentPage = 1;
                this.getLocationData();
            },
            changeChart: function(val) {
                this.clueLocationChart.clear();
                if (val) {
                    this.showLineChart = !this.showLineChart;
                }
                this.showLineChart ? this.setLineOption() : this.setPieOption();
            },
            setLineOption: function() {
                this.lineChartOption.xAxis.data = this.locationData.lineList.date; // 日期时间轴数据确定
                const lineMap = new Map(this.locationData.lineList.series.map(item => {
                    return [item.name, item.data];
                })); // 把折线图数据的 ['国家', dataArr] 对应起来,方便查找
                let tempPieData = this.locationData.list; // 暂存饼图总数数据
                tempPieData = tempPieData.filter(item => {
                    return item.sortName !== this.$t('serviceReport.other') && item.sortName.trim().length;
                }); // 剔除不合格数据
                if (tempPieData.length > 10) {
                    tempPieData.sort((a, b) => {
                        return b.count - a.count;
                    });
                    tempPieData = tempPieData.splice(0, 10);
                } // 剩余合格数据超过 10 个则只取 top 10
                this.lineChartOption.series = tempPieData.map(item => {
                    return {
                        name: item.sortName,
                        type: 'line',
                        yAxisIndex: 0,
                        data: lineMap.get(item.sortName)
                    };
                }); // 遍历名称和数量均符合要求的筛选后数组,对每一项 map.get 获取按日数据,格式化为 series 格式
                this.lineChartOption.legend.data = this.lineChartOption.series.map(item => {
                    return item.name;
                });
                this.clueLocationChart.setOption(this.lineChartOption);
            },
            setPieOption: function() {
                const type = this.pieDataType || 'count'; // 暂存饼图显示数据类型
                let tempPieData = this.locationData.list; // 暂存饼图所有数据
                const othersData = {
                    sum: 0,
                    sortName: this.$t('serviceReport.allOther')
                }; // 单独把 "其他" 数据提取出来
                tempPieData = tempPieData.filter(item => {
                    if (item.sortName !== this.$t('serviceReport.other') && item.sortName.trim().length) {
                        return true;
                    }
                    othersData.sum += item[type];
                }); // 剔除不合格数据,同时把不合格数据累加到 othersData.sum
                tempPieData.sort((a, b) => {
                    return b[type] - a[type];
                }); // 将合格数据排序
                if (tempPieData.length > 10) {
                    tempPieData = tempPieData.splice(0, 10);
                } // 将除了 "未知" 和 "top10 国家" 的其他国家全部数据加起来,同时改变了 tempPieData
                if (tempPieData.length !== this.locationData.list) {
                    othersData[type] = othersData.sum;
                    tempPieData.push(othersData);
                } // 如果当前有不合格数据,则把 othersData 格式化后加入到 tempPieData
                this.pieChartOption.legend.data = tempPieData.map(item => {
                    return item.sortName;
                }); // 赋值饼图 legend
                this.pieChartOption.series[0].data = tempPieData.map(item => {
                    return {
                        name: item.sortName,
                        value: item[type]
                    };
                }); // 赋值饼图数据
                const title = '';

                if (type === 'inqRate' || type === 'clueRate') {
                    this.pieChartOption.tooltip.formatter = params => {
                        return `${this.$t('serviceReport.serviceQ')}: ${this.pieDataTypeCn}<br>${params.name} : ${(params.value * 100).toFixed(2)}%`;
                    };
                } else {
                    this.pieChartOption.tooltip.formatter = `${this.$t('serviceReport.serviceQ')}: ${this.pieDataTypeCn}` + '<br/>{b} : {c} ({d}%)';
                }
                this.clueLocationChart.setOption(this.pieChartOption);
            },
            changePieDataType: function() {
                const arr = ['avgDialog', 'avgOnline', 'avgServercount', 'avgVisitorcount', 'count', 'sortName', 'sumDialog', 'sumOnline'];
                if (arr.indexOf(this.pieDataType) === -1) {
                    this.$Message.error(this.$t('serviceReport.reset'));
                    this.pieDataType = 'count';
                }
                this.setPieOption();
            },
            changeSort: function(a) {
                this.allTableData = _.orderBy(this.allTableData, a.key, a.order);
                // this.changePage(1);
            },
            changePage: function(page) {
                this.tableData = [];
                if (page < this.maxPageNum) {
                    this.changeContent((page - 1) * this.pageSize, page * this.pageSize);
                } else {
                    if (this.allTableData.length % this.pageSize === 0) {
                        this.changeContent((page - 1) * this.pageSize, page * this.pageSize);
                    } else {
                        this.changeContent((page - 1) * this.pageSize, (page - 1) * this.pageSize + this.allTableData.length % this.pageSize);
                    }
                }
                this.curPage = page;
            }, // 改变页面
            pageSizeChange(value) { /* 改变每页条数 */
                this.tableData = [];
                this.curPage = 1;
                this.pageSize = value;
                this.$refs.pages.currentPage = 1;
                this.maxPageNum = Math.ceil(this.allTableData.length / this.pageSize);
                this.changePage(1);
            },
            changeContent: function(pageNumStart, pageNumEnd) {
                this.tableData = [];
                for (let i = pageNumStart; i < pageNumEnd; i++) {
                    this.tableData.push(this.allTableData[i]);
                }
            }, // 当前页显示内容
            exportData() {
                import('@/libs/Export2Excel').then(excel => {
                    let tHeader = [];
                    let filterVal = [];
                    this.tableColumns.map(item => {
                        tHeader.push(item.title);
                        filterVal.push(item.key);
                    })
                    const list = this.tableData;  //把data里的tableData存到list
                    const data = this.formatJson(filterVal, list);
                    excel.export_json_to_excel({
                        header: tHeader,
                        data,
                        filename: this.$t('serviceReport.serviceQuality')
                    })
                    // this.downloadLoading = false
                });
            },
            formatJson(filterVal, jsonData) {
                return jsonData.map(v => filterVal.map(j => v[j]))
            },
            handleCheckAll() {
                this.indeterminate ? this.checkAll = false : this.checkAll = !this.checkAll;
                this.indeterminate = false;
                if (this.checkAll) {
                    this.allGroup = [this.$t('serviceReport.avgDialog'), this.$t('serviceReport.avgOnline'), this.$t('serviceReport.avgServercount'), this.$t('serviceReport.avgVisitorcount'), this.$t('serviceReport.count'), this.$t('serviceReport.serviceName'), this.$t('serviceReport.sumDialog'), this.$t('serviceReport.sumOnline')];
                    this.tableColumns = this.allTableColumns;
                } else {
                    this.allGroup = [];
                    this.tableColumns = [];
                }
            },
            changeGroups: function(selCol) {
                this.tableColumns = [];
                let flag = 0;
                for (let i = 0; i < this.allTableColumns.length; i++) {
                    for (let j = 0; j < selCol.length; j++) {
                        if (this.allTableColumns[i].title === selCol[j]) {
                            flag = 1;
                            break;
                        }
                    }
                    if (flag) {
                        this.tableColumns.push(this.allTableColumns[i]);
                        flag = 0;
                    }
                }
                if (selCol.length === this.allTableColumns.length) {
                    this.indeterminate = false;
                    this.checkAll = true;
                } else if (selCol.length > 0) {
                    this.indeterminate = true;
                    this.checkAll = false;
                } else {
                    this.indeterminate = false;
                    this.checkAll = false;
                }
            }
        },
        created() {
            this.dateFormat();
            // this.screenWidth = window.screenWidth;
            const endTime = new Date();
            const startTime = new Date();
            endTime.setTime(endTime.getTime() - 3600 * 1000 * 24 * 1);
            startTime.setTime(startTime.getTime() - 3600 * 1000 * 24 * 7);
            this.dateValue = [startTime, endTime];
            this.getLocationData();
        },
        mounted() {
            // window.onresize = () => {
            //     window.screenWidth = document.body.clientWidth;
            //     this.screenWidth = window.screenWidth;
            // }; // 屏幕大小改变的时候改变图表大小
            this.clueLocationChart = this.$echarts.init(this.$refs.clue_location_chart);
        },
        beforeDestroy() {
            if (this.clueLocationChart && this.clueLocationChart.dispose) {
                this.clueLocationChart.dispose();
            }
        },
        activated() {
            if (this.clueLocationChart.resize) {
                this.clueLocationChart.resize();
            }
        },
        watch: {
            window_width() {
                if (this.clueLocationChart.resize) {
                    this.clueLocationChart.resize();
                }
            }
        }
    };
</script>

<style lang="less" scoped>
    .pagewrap {
        float: right;
        margin: 0 20px 20px 0;
        position: absolute;
        left: 50%;
        transform: translate(-50%)
    }

    .operateWrap {
        margin-bottom: 15px;

        > span {
            float: right;
        }
    }

    .xpy-shadow {
        background-color: #fff;
        -webkit-box-shadow: 0 0 4px rgba(0, 0, 0, 0.13);
        -moz-box-shadow: 0 0 4px rgba(0, 0, 0, 0.13);
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.13);
    }

    .clue-report-survey {
        .clearfix::after { /* 清除浮动 */
            content: "";
            display: block;
            clear: both;
        }

        .switch-chart {
            float: right;
            height: 32px;
            line-height: 32px;
            color: #b8b8b8;
            margin: 0 26px;
            cursor: pointer;

            .ivu-icon {
                font-size: 18px;
            }
        }

        .chart-type-line-one {
            height: 192px;
            /*background-color: lightblue;*/
        }

        .chart-type-line-header {
            clear: both;
            display: flex;
            background-color: #ffffff;
        }

        /* 图例处伸缩布局 */

        .chart-type-select-data {
            height: 110px;
            flex: 1;
            /*background-color: orangered;*/
            float: left;
        }

        .chart-type-select-data-name {
            margin: 30px 20px 5px;
            //   background-color: yellowgreen;
            text-align: center;
        }

        .chart-type-select-data-value {
            font-size: 28px;
            /*background-color: blueviolet;*/
            margin: 0 20px;
            text-align: center;
        }

        .chart-type-select-time-interval {
            float: right;
            margin: 35px 45px 35px 0px;
            position: relative;
        }

        .chart-type-select-time-interval-group {
            width: 72px;
            height: 88px;
            background-color: #ffffff;
            position: absolute;
            top: 25px;
            left: -55px;
            z-index: 99999;
            -webkit-box-shadow: 0 0 4px rgba(0, 0, 0, .13);
            -moz-box-shadow: 0 0 4px rgba(0, 0, 0, .13);
            box-shadow: 0 0 4px rgba(0, 0, 0, .13);
        }
    }

    .tabmain {
        table {
            width: 100% !important;
        }

        /deep/ .ivu-table {
            td {
                /*text-align: center;*/
            }

            th {
                /*text-align: center;*/
                font-size: 14px;
            }

            /*tbody tr:hover td {*/
            /*    background: #f8f8f9;*/
            /*    color: #FA8241;*/
            /*}*/
        }
    }

    .checkboxgroup > label {
        display: block;
        margin-bottom: 5px;
    }
</style>
