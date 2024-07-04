<template>
    <div class="account-panel">
        <div class='clearfix'>
<!--            <div style='float: left; '>-->
<!--                <h1 class='title'>-->
<!--                    {{ $t('GA.report_adSeries') }}-->
<!--                </h1>-->
<!--            </div>-->
            <div style="float: right;vertical-align: middle;">
                <DatePicker v-model="date_value"
                            type="daterange"
                            :options="date_options"
                            :clearable="false"
                            size="small"
                            :placeholder="$t('GA.tip_selectDate')"
                            @change="change_date"
                            style="width: 240px"></DatePicker>
            </div>
        </div>
        <div class="account-body">
            <div class="account-body-content">
                <div class="account-body-chat-type-line">
                    <div class="account-body-chat-type-line-head">
                        <div class="account-body-chat-type-line-head-select"></div>
                        <div class="account-body-chat-type-line-head-select"></div>
                        <div class="account-body-chat-type-line-head-select"></div>
                        <div class="account-body-chat-type-line-head-select"></div>
                        <div class="account-body-chat-type-line-head-time"></div>
                    </div>
                </div>
            </div>
            <Row justify="center" align="middle" :gutter="16" class-name="chartRow">
                <Col :span="24" class='clearfix'>
                    <div class="xpy-shadow" style="position: relative;">
                        <Spin fix v-if="chart_loading"></Spin>
                        <div class="chart-type-line-header clearfix ">
                            <div class="chart-type-select-data" v-for="(item, index) in chartOneSeries"
                                 :class="{'chart-one-series-active':item.active}"
                                 @click="chartOneSeriesClick($event, index)">
                                <div class="chart-type-select-data-name">
                                    <div class="square-color" :style="{background: item.color}"></div>
                                    <Select v-model="item.model" style="width:150px;float: left;"
                                            @change="chartOneSeriesChange($event, index)"
                                            :ref="`chartOneSeriesSelect${index}`" size="small"
                                            :class="{'chart-one-series-active':item.active}">
                                        <Option v-for="option in ChartSeriesList" :value="option.value"
                                                :label="option.name"
                                                :key="option.value">
                                        </Option>
                                    </Select>
                                </div>
                                <div class="chart-type-select-data-value">
                                    {{computeChartOneSeriesOverview(index)}}
                                </div>
                            </div>
                            <div class="chart-type-select-time-interval">
                                <!-- <div @click="clickTimeSelectIcon ">
                                    <Icon type="ios-clock-outline" :size="20"></Icon>
                                </div> -->
                                <Poptip
                                    placement="bottom"
                                    width="180"
                                    trigger="click">
                                        <Icon type="ios-clock-outline" :size="20" slot="reference"></Icon>
                                        <div class="chart-type-select-time-interval-group"
                                            ref="selectGroupDiv">
                                            <div class="time-interval-checkbox-div"
                                                @click="timeIntervalCheckboxChange('day',$event)">
                                                <label class="time-interval-checkbox-label">
                                                    <span class='time-interval-checkbox-span'>{{ $t('GA.period_day') }}</span>
                                                    <Checkbox v-model="timeIntervalCheckboxList.day"></Checkbox>
                                                </label>
                                            </div>
                                            <div class="time-interval-checkbox-div"
                                                @click="timeIntervalCheckboxChange('week',$event)">
                                                <label class="time-interval-checkbox-label">
                                                    <span class='time-interval-checkbox-span'>{{ $t('GA.period_week') }} </span>
                                                    <Checkbox v-model="timeIntervalCheckboxList.week"></Checkbox>
                                                </label>
                                            </div>
                                            <div class="time-interval-checkbox-div"
                                                @click="timeIntervalCheckboxChange('moon',$event)">
                                                <label class="time-interval-checkbox-label">
                                                    <span class='time-interval-checkbox-span'>{{ $t('GA.period_month') }} </span>
                                                    <Checkbox v-model="timeIntervalCheckboxList.moon"></Checkbox>
                                                </label>
                                            </div>
                                        </div>
                                </Poptip>

                            </div>
                        </div>
                        <div ref="my_chart_one" id="my-chart-one" style="width:100%;height: 192px; display: inline-block"
                             class="clearfix"></div>
                    </div>
                </Col>
            </Row>
        </div>
        <div class="table_wrap">
            <div class="datewrap">
                <span>
                    <Button class="table-filter-item" v-if="authorized_export" type="text" icon="custom custom-file-download" @click="export_table_data">{{ $t('GA.exportData') }}</Button>
                    <Poptip width="400" placement="bottom">
                        <Button class="table-filter-item" slot="reference" type="text" icon="custom custom-table-filter" @click="conditionShow">{{ $t('GA.filter') }}</Button>
                        <div>
                            <div class="extensiondevice">
                                <h3>{{ $t('GA.extensionDevice') }}</h3>
                                <Checkbox
                                        :indeterminate="indeterminate1"
                                        :value="checkAll1"
                                        @click.prevent.native="handleCheckAll1"
                                        class="alldevice">{{ $t('GA.all') }}</Checkbox>
                                <CheckboxGroup v-model="selectedDevice"
                                               @change="checkAllGroupChange1">
                                    <Checkbox v-for="item in deviceTypes"
                                              :key="item"
                                              :label="item">{{ $t(lang_deviceTypes[item]) }}</Checkbox>
                                </CheckboxGroup>
                            </div>
                            <div class="onnetwork">
                                <h3>{{ $t('GA.displayNetwork') }}</h3>
                                <div style="float:left;width:285px">
                                    <Checkbox
                                            :indeterminate="indeterminate2"
                                            :value="checkAll2"
                                            @click.prevent.native="handleCheckAll2"
                                            class="allnetwork">{{ $t('GA.all') }}</Checkbox>
                                    <CheckboxGroup v-model="selectedAdNetwork"
                                                   @change="checkAllGroupChange2">
                                        <Checkbox v-for="item in adNetworkTypes"
                                                  :key="item"
                                                  :label="item">{{ $t(lang_adNetworkTypes[item]) }}</Checkbox>
                                    </CheckboxGroup>
                                </div>
                            </div>
                            <div class="condition">
                                <h3>{{ $t('GA.searchCondition') }}</h3>
                                <div class="conditionmain">
                                    <Select v-model="condition1" style="width:120px;margin-right:15px;float:left;"
                                            size="small" @change="changeCon1()">
                                        <Option v-for="item in conditionList1" :value="item.value" :key="item.value">{{ item.label }}</Option>
                                    </Select>
                                    <Select v-model="condition2" style="width:90px;margin-right:15px;float:left;"
                                            size="small">
                                        <Option v-for="item in conditionList2" :value="item.value" :key="item.value">{{ item.label }}</Option>
                                    </Select>
                                    <div style="margin-bottom:10px;">
                                        <Input v-model="condition3" size="small" :placeholder="$t('GA.tip_addKeywords')"
                                            style="width:100px;margin-right:5px;"></Input>
                                        <span @click="addClick()">
                                            <!-- <Icon type="plus-circled" size="15" color="#FA8241"
                                                style='cursor:pointer;display:inline-block;'></Icon> -->
                                            <Icon class="custom custom-add-circle" size="15"
                                                style='cursor:pointer;display:inline-block;'></Icon>
                                        </span>
                                    </div>
                                </div>
                                <div class="conditionwrap">
                                    <div v-for="(add,index) in addCondition" class="conditionmain">
                                        <Select v-model="add.condition1" style="width:120px;margin-right:15px;float:left;"
                                                size="small" @change="addChangeCon1(index)">
                                            <Option v-for="item in add.conditionList1" :value="item.value"
                                                    :key="item.value">{{ item.label }}</Option>
                                        </Select>
                                        <Select v-model="add.condition2" style="width:90px;margin-right:15px;float:left;"
                                                size="small">
                                            <Option v-for="item in add.conditionList2" :value="item.value"
                                                    :key="item.value">{{ item.label }}</Option>
                                        </Select>
                                        <div style="margin-bottom:10px;">
                                            <Input v-model="add.condition3" size="small"
                                                :placeholder="$t('GA.tip_addKeywords')"
                                                style="width:100px;margin-right:5px;"></Input>
                                            <span @click="removeClick(index)">
                                                <!-- <Icon type="minus-circled" size="15" color="#FA8241"
                                                    style='cursor:pointer;display:inline-block;'></Icon> -->
                                                <Icon class="custom custom-reduce-circle" size="15"
                                                    style='cursor:pointer;display:inline-block;'></Icon>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="btn" style="margin-left:140px;">
                                <Button type="primary" size="small" style="width:50px;" @click="search_data">{{ $t('GA.search') }}</Button>
                                <Button type="primary" ghost size="small" style="width:50px;" @click="empty">{{ $t('GA.clear') }}</Button>
                            </div>
                        </div>
                    </Poptip>
                    <Poptip width="140" placement="bottom">
                        <Button class="table-filter-item" type="text" slot="reference" icon="custom custom-more" @click="changeCol">{{ $t('GA.editColumns') }}</Button>
                        <div>
                            <Checkbox
                                    :indeterminate="indeterminate"
                                    :value="checkAll"
                                    @click.prevent.native="handleCheckAll" style="margin-bottom:5px;">{{ $t('GA.selectAll') }}</Checkbox>
                            <Checkbox-group v-model="currentGroups"
                                            @change="changeGroups"
                                            class="checkboxgroup">
                                <Checkbox v-for="item in allGroups"
                                          :key="item"
                                          :label="item">{{ item }}</Checkbox>
                            </Checkbox-group>
                        </div>
                    </Poptip>
                </span>
                <div style="clear:both"></div>
            </div>
            <div class="table">
                <!-- <Table @on-sort-change="change_sort" ref="table" :columns="table_columns" :data="table_data"
                       :loading="table_loading"
                       class="tabmain" height="400"></Table> -->
                <Table :data="table_data"
                       v-loading="table_loading"
                       ref="table"
                       @sort-change="changesort"
                       class="tabmain">
                    <TableColumn v-for="item in table_columns"
                                 :key="item.key"
                                 :prop="item.key"
                                 :min-width="item.width"
                                 :formatter="item.formatter"
                                 sortable
                                 show-overflow-tooltip
                                 :label="item.title"></TableColumn>
                </Table>
                <div style="margin: 10px 10px 0;overflow: hidden">
                    <div class="pagewrap">
                        <!--<div>-->
                        <!-- <Page :page-size-opts="page_size_opts" @on-page-size-change="change_page_size"
                              :total="total_num"
                              :current="current_page" @on-change="change_page" show-total show-sizer show-elevator
                              placement="top"></Page> -->
                        <Page
                            :page-sizes="page_size_opts"
                            :page-size="page_size"
                            :current-page="current_page"
                            layout="total, prev, pager, next, sizes, jumper"
                            :total="total_num"
                            ref="pages"
                            style="display:inline-block"
                            :placement="'top'"
                            @size-change="change_page_size"
                            @current-change="change_page">
                        </Page>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import utils from '@/utils';
    import _ from 'lodash';
    import { mapState } from 'vuex';
    import exportExcel from '@/mixins/exportExcel.js';
    import { adsReport } from '@/api/google/index';
    const { getAdsReport } = adsReport;

    export default {
        name: 'adSeries',
        mixins: [exportExcel],
        props: {
            authorized_export: Boolean,
            adsAccountId: String
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                window_width: 'window_width',
                deviceTypes: state => state.google.deviceTypes,
                lang_deviceTypes: state => state.google.lang_deviceTypes,
                adNetworkTypes: state => state.google.adNetworkTypes,
                lang_adNetworkTypes: state => state.google.lang_adNetworkTypes,
                lang_campaignStatus: state => state.google.lang_campaignStatus
            })
        },
        data() {
            return {
                date_value: [],
                start_date: '',
                end_date: '',
                chartOneAjaxData: [],
                chartOneFormatData: {},
                chartOneOption: {},
                adSeriesChart: {},
                chartOneSeries: [
                    {
                        index: 0,
                        model: 'clicks',
                        active: true,
                        color: '#f08833'
                    },
                    {
                        index: 1,
                        model: 'impressions',
                        active: true,
                        color: '#51b7a2'
                    },
                    {
                        index: 2,
                        model: 'averageCpc',
                        active: true,
                        color: '#6289c9'
                    },
                    {
                        index: 3,
                        model: 'cost',
                        active: true,
                        color: '#caf268'
                    }
                ],
                ChartSeriesList: [
                    {
                        value: 'impressions',
                        name: this.$t('GA.impressions')
                    },
                    // {
                    //     value: 'averagePosition',
                    //     name: this.$t('GA.averagePosition')
                    // },
                    {
                        value: 'averageCpc',
                        name: this.$t('GA.averageCpc')
                    },
                    {
                        value: 'clicks',
                        name: this.$t('GA.clicks')
                    },
                    {
                        value: 'costPerConversion',
                        name: this.$t('GA.costPerConversion')
                    },
                    {
                        value: 'conversions',
                        name: this.$t('GA.conversions')
                    },
                    {
                        value: 'cost',
                        name: this.$t('GA.cost')
                    },
                    {
                        value: 'ctr',
                        name: this.$t('GA.ctr')
                    },
                    {
                        value: 'conversionRate',
                        name: this.$t('GA.conversionRate')
                    }
                ],
                ChartOneSeriesList: '',
                selectTimeIntervalGroupShow: false,
                selectTimeIntervalGroupShowCount: 0,
                timeIntervalCheckboxList: {
                    day: true,
                    week: false,
                    moon: false
                },
                timeIntervalCheckboxValueList: {
                    day: 1,
                    week: 11,
                    moon: 12
                },
                reportTimeInterval: 11,
                seriesTransfer: {
                    date: this.$t('GA.date'),
                    device: this.$t('GA.device'),
                    adNetworkType1: this.$t('GA.adNetwork'),
                    campaignId: this.$t('GA.campaignId'),
                    campaignName: this.$t('GA.campaignName'),
                    adGroupId: this.$t('GA.adGroupId'),
                    adGroupName: this.$t('GA.adGroupName'),
                    adGroupStatus: this.$t('GA.adGroupStatus'),
                    criteria: this.$t('GA.criteria'),
                    id: this.$t('GA.id'),
                    shortHeadline: this.$t('GA.shortHeadline'),
                    countryCriteriaId: this.$t('GA.countryCriteriaId'),
                    cost: this.$t('GA.cost'),
                    impressions: this.$t('GA.impressions'),
                    clicks: this.$t('GA.clicks'),
                    conversions: this.$t('GA.conversions'),
                    ctr: this.$t('GA.ctr'),
                    averageCpc: this.$t('GA.averageCpc'),
                    costPerConversion: this.$t('GA.costPerConversion'),
                    conversionRate: this.$t('GA.conversionRate'),
                    averagePosition: this.$t('GA.averagePosition'),
                    query: this.$t('GA.searchTerms')
                },
                chart_loading: true, // 图表加载图标
                table_loading: true, // 表格加载图标
                table_columns: [], // 表格列名称
                all_columns: [
                    {
                        title: this.$t('GA.adSeries'),
                        key: 'campaignName',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.status'),
                        key: 'campaignStatus',
                        width: 130,
                        sortable: true,
                        formatter: row => {
                            const translateStr = this.lang_campaignStatus[row.campaignStatus];
                            return translateStr ? this.$t(translateStr) : row.campaignStatus;
                        }
                    },
                    {
                        title: this.$t('GA.cost'),
                        key: 'cost',
                        width: 100,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.impressions'),
                        key: 'impressions',
                        width: 110,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.clicks'),
                        key: 'clicks',
                        width: 110,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.ctr'),
                        key: 'ctr',
                        width: 100,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.averageCpc'),
                        key: 'averageCpc',
                        width: 170,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.conversions'),
                        key: 'conversions',
                        width: 110,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.costPerConversion'),
                        key: 'costPerConversion',
                        width: 170,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.conversionRate'),
                        key: 'conversionRate',
                        width: 100,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.averagePosition'),
                        key: 'averagePosition',
                        width: 110,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.device'),
                        key: 'device',
                        width: 110,
                        sortable: true,
                        formatter: row => {
                            const translateStr = this.lang_deviceTypes[row.device];
                            return translateStr ? this.$t(translateStr) : row.device;
                        }
                    },
                    {
                        title: this.$t('GA.adNetwork'),
                        key: 'adNetworkType1',
                        width: 110,
                        sortable: true,
                        formatter: row => {
                            const translateStr = this.lang_adNetworkTypes[row.adNetworkType1];
                            return translateStr ? this.$t(translateStr) : row.adNetworkType1;
                        }
                    }
                ], // 表格全部列
                table_data: [],
                page_no: 1,
                total_num: 0,
                all_table_data: [], // 所有数据
                current_page: 1,
                page_size: 10,
                max_page_num: 1,
                page_size_opts: [10, 20, 30, 50],
                date_options: {
                    shortcuts: [
                        {
                            text: this.$t('GA.today'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('GA.yesterday'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24);
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('GA.thisWeek'),
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
                            text: this.$t('GA.lastWeek'),
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
                            text: this.$t('GA.thisMonth'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(new Date(start.getFullYear(), start.getMonth(), 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('GA.lastMonth'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() - 24 * 60 * 60 * 1000);
                                start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        }
                    ]
                },
                allGroups: [
                    this.$t('GA.adSeries'),
                    this.$t('GA.status'),
                    this.$t('GA.cost'),
                    this.$t('GA.impressions'),
                    this.$t('GA.clicks'),
                    this.$t('GA.ctr'),
                    this.$t('GA.averageCpc'),
                    this.$t('GA.conversions'),
                    this.$t('GA.costPerConversion'),
                    this.$t('GA.conversionRate'),
                    this.$t('GA.averagePosition'),
                    this.$t('GA.device'),
                    this.$t('GA.adNetwork')
                ],
                currentGroups: [],
                indeterminate: false,
                checkAll: true,
                indeterminate1: false,
                checkAll1: true,
                selectedDevice: [],
                indeterminate2: false,
                checkAll2: true,
                selectedAdNetwork: [],
                condition1: '',
                conditionList1: [
                    {
                        value: this.$t('GA.adSeries'),
                        label: this.$t('GA.adSeries')
                    },
                    {
                        value: this.$t('GA.status'),
                        label: this.$t('GA.status')
                    },
                    {
                        value: this.$t('GA.cost'),
                        label: this.$t('GA.cost')
                    },
                    {
                        value: this.$t('GA.impressions'),
                        label: this.$t('GA.impressions')
                    },
                    {
                        value: this.$t('GA.clicks'),
                        label: this.$t('GA.clicks')
                    },
                    {
                        value: this.$t('GA.ctr'),
                        label: this.$t('GA.ctr')
                    },
                    {
                        value: this.$t('GA.averageCpc'),
                        label: this.$t('GA.averageCpc')
                    },
                    {
                        value: this.$t('GA.conversions'),
                        label: this.$t('GA.conversions')
                    },
                    {
                        value: this.$t('GA.costPerConversion'),
                        label: this.$t('GA.costPerConversion')
                    },
                    {
                        value: this.$t('GA.conversionRate'),
                        label: this.$t('GA.conversionRate')
                    },
                    {
                        value: this.$t('GA.averagePosition'),
                        label: this.$t('GA.averagePosition')
                    },
                    {
                        value: this.$t('GA.device'),
                        label: this.$t('GA.device')
                    },
                    {
                        value: this.$t('GA.adNetwork'),
                        label: this.$t('GA.adNetwork')
                    }
                ],
                condition2: '',
                conditionList2: [
                    {
                        value: this.$t('GA.con_lessThan'),
                        label: this.$t('GA.con_lessThan')
                    },
                    {
                        value: this.$t('GA.con_lessOrEqual'),
                        label: this.$t('GA.con_lessOrEqual')
                    },
                    {
                        value: this.$t('GA.con_equal'),
                        label: this.$t('GA.con_equal')
                    },
                    {
                        value: this.$t('GA.con_greaterOrEqual'),
                        label: this.$t('GA.con_greaterOrEqual')
                    },
                    {
                        value: this.$t('GA.con_greaterThan'),
                        label: this.$t('GA.con_greaterThan')
                    }
                ],
                condition3: '',
                addCondition: [],
                reportData1: [],
                filterShow: false
            };
        },
        methods: {
            /* 全局 */
            getAjaxData(index) {
                getAdsReport({
                    orgId: this.enterpriseId,
                    reportType: 2,
                    startDate: this.start_date,
                    endDate: this.end_date,
                    displayType: index,
                    clientCustomerId: this.adsAccountId
                }).then(res => {
                    if (res.data) {
                        // 顶部图表数据处理
                        if ([1, 11, 12].includes(index)) {
                            this.chart_loading = false;
                            this.chartOneAjaxData = [];
                            const resData = res.data;

                            // 先做数据补零处理, 把接口没返回的空白日期也补上空白数据, 避免影响后续数据计算, 图表展示
                            // 定义不带日期周期(日/周/月)的空白模板数据
                            const blankObj = {
                                accountCurrencyCode: 'CNY',
                                ctr: '0%',
                                conversions: 0,
                                cost: 0,
                                averageCpc: 0,
                                campaignId: '',
                                clicks: 0,
                                averagePosition: ' --',
                                impressions: 0,
                                costPerConversion: 0,
                                conversionRate: '0%',
                                adNetworkType1: '',
                                campaignStatus: '',
                                campaignName: '',
                                device: ''
                            };
                            // 定义存放空白数据的变量
                            const allBlankData = [];
                            // 从用户选择的起始日期到结束日期, 以"天"为 step 开始遍历
                            let startTime = new Date(this.start_date).getTime();
                            const endTime = new Date(this.end_date).getTime();
                            const dayStep = 24 * 60 * 60 * 1000;
                            while (startTime <= endTime) {
                                const today = new Date(startTime);
                                switch (index) {
                                    case 1:
                                        // 周期为"日"
                                        // 直接 push
                                        allBlankData.push(Object.assign({ date: this.$options.filters.timeFormat(today) }, blankObj));
                                        break;
                                    case 11:
                                        // 周期为"周"
                                        // 按后端数据逻辑, 是返回的"周一"的日期, getDay 判断通过后 push
                                        if (today.getDay() === 1) {
                                            allBlankData.push(Object.assign({ week: this.$options.filters.timeFormat(today) }, blankObj));
                                        }
                                        break;
                                    case 12:
                                        // 周期为"月"
                                        // getDate 判断通过后 push
                                        if (today.getDate() === 1) {
                                            allBlankData.push(Object.assign({ month: this.$options.filters.timeFormat(today) }, blankObj));
                                        }
                                        break;
                                }
                                // step 步进, 进入下个循环
                                startTime += dayStep;
                            }

                            // 以接口返回的数据替换掉相应的空白数据
                            let periodAttr = 'date';
                            if (index === 11) {
                                periodAttr = 'week';
                            } else if (index === 12) {
                                periodAttr = 'month';
                            }

                            // 填入接口数据
                            allBlankData.forEach((dataItem, index) => {
                                // 在接口数据中查找当前时间周期的数据
                                const matchDataList = resData.filter(item => item[periodAttr] === dataItem[periodAttr]);
                                if (matchDataList.length) {
                                    // 同一周期多个数据, 将可直接累加的数据累加
                                    const result = matchDataList.reduce((a, b) => {
                                        // 展示次数, 点击次数, 转化次数, 花费; 可直接累加
                                        ['impressions', 'clicks', 'conversions', 'cost'].forEach(key => {
                                            a[key] = Number(a[key] || 0) + Number(b[key] || 0);
                                        });
                                        return a;
                                    });
                                    // 处理计算属性
                                    // “点击率”：点击次数/展示次数 * 100 %
                                    result.ctr = `${result.impressions ? Number((result.clicks * 100 / result.impressions).toFixed(2)) : 0}%`;
                                    // “平均每次点击费用”：费用/点击次数
                                    result.averageCpc = result.clicks ? Number((result.cost / 1000000 / result.clicks).toFixed(2)) : 0;
                                    // “平均每次转化费用”：费用/转化次数
                                    result.costPerConversion = result.conversions ? Number((result.cost / 1000000 / result.conversions).toFixed(2)) : 0;
                                    // “转化率”：转化次数/点击次数 * 100 %
                                    result.conversionRate = `${result.clicks ? Number((result.conversions * 100 / result.clicks).toFixed(2)) : 0}%`;

                                    // 返回结果
                                    allBlankData[index] = result;
                                }
                            });

                            // 得到最终结果
                            this.chartOneAjaxData = allBlankData;

                            // 格式化数据
                            this.formatChartOneData(index);
                        }

                        // 下方表格数据处理
                        if (index === 2) {
                            this.table_loading = false;
                            this.all_table_data = Array.isArray(res.data) ? res.data : [];
                            this.initData();
                            this.all_table_data = _.orderBy(this.all_table_data, 'cost', 'desc');
                            this.total_num = this.all_table_data.length;
                            this.max_page_num = Math.ceil(this.all_table_data.length / this.page_size);
                            if (this.page_no < this.max_page_num) {
                                this.changeContent(0, this.page_size);
                            } else {
                                this.changeContent(0, this.all_table_data.length);
                            }
                        }
                    }
                });
            }, // 获取 Chart 和 Table 的数据
            initData() {
                this.all_table_data = this.all_table_data.map(item => {
                    // 返回数据
                    return Object.assign(item, {
                        campaignStatus: item.campaignStatus,
                        cost: parseFloat(parseFloat(item.cost / 1000000).toFixed(2)),
                        impressions: parseFloat(item.impressions),
                        clicks: parseFloat(item.clicks),
                        ctr: parseFloat(item.ctr),
                        averageCpc: parseFloat(parseFloat(item.averageCpc / 1000000).toFixed(2)),
                        conversions: parseFloat(item.conversions),
                        costPerConversion: parseFloat(parseFloat(item.costPerConversion / 1000000).toFixed(2)),
                        conversionRate: parseFloat(item.conversionRate),
                        averagePosition: utils.toFloat(item.averagePosition),
                        device: item.device,
                        adNetworkType1: item.device
                    });
                });
            }, // 初始化 Table 数据
            change_date(date) {
                console.log(date);
                this.chart_loading = true;
                this.table_loading = true;
                if (!date) {
                    this.start_date = '';
                    this.end_date = '';
                } else {
                    // this.start_date = date[0];
                    // this.end_date = date[1];
                    this.start_date = new Date(date[0]).format('yyyy-MM-dd');
                    this.end_date = new Date(date[1]).format('yyyy-MM-dd');
                }
                this.getAjaxData(1);
                this.getAjaxData(2);
            }, // 日期变换

            /* Chart */
            formatChartOneData(index) {
                // 当前选择的时间周期属性
                let periodAttr = 'date';
                if (index === 11) {
                    periodAttr = 'week';
                } else if (index === 12) {
                    periodAttr = 'month';
                }

                if (this.chartOneAjaxData.length) {
                    // 暂存排序后的接口原始数据
                    const ajaxData = _.orderBy(this.chartOneAjaxData, [periodAttr], ['asc']);
                    // 暂存格式化结果数据
                    const resultData = {};

                    // 初始化数据 + 填入基本数据
                    this.ChartSeriesList.forEach(seriesItem => {
                        // 暂存指标属性名
                        const key = seriesItem.value;
                        // 暂存结果数据
                        const valObj = {
                            total: 0,
                            valueList: [],
                            valueListNumber: [],
                            maxValue: 0,
                            percentValueList: []
                        };

                        ajaxData.forEach(dataItem => {
                            // 暂存当前指标原始数据
                            let val = dataItem[key];
                            // 处理数据, 存入原始 value 和 数值型 value
                            if (key === 'cost') {
                                // "花费"单位不一样, 特殊处理
                                val = Number(val) / 1000000;
                                valObj.valueList.push(Number(val.toFixed(2)));
                                valObj.valueListNumber.push(val);
                                valObj.total += val;
                            } else if (['impressions', 'clicks', 'conversions'].includes(key)) {
                                // 处理可直接累加的数据
                                // 无小数, 不需要四舍五入
                                valObj.valueList.push(val);
                                valObj.valueListNumber.push(Number(val));
                                valObj.total += Number(val);
                            } else if (['ctr', 'conversionRate'].includes(key)) {
                                // 处理百分比数据, 数值数据去掉百分号
                                // 之前已进行四舍五入
                                valObj.valueList.push(val);
                                valObj.valueListNumber.push(Number(val.replace('%', '')));
                            } else {
                                // 处理其他数据
                                // 有小数, 需要四舍五入下
                                valObj.valueList.push(Number(val.toFixed(2)));
                                valObj.valueListNumber.push(Number(val));
                            }
                        });

                        // 赋值结果数据
                        resultData[key] = valObj;
                    });
                    // 计算每类指标的最大值 + 每条数据的该指标相对于指标最大值的百分比, 用于实际显示图表(避免不同指标数量级差距太大导致图标看不出起伏)
                    for (const key in resultData) {
                        resultData[key].maxValue = _.max(resultData[key].valueListNumber);
                        resultData[key].percentValueList = resultData[key].valueListNumber.map(x => x / resultData[key].maxValue);
                    }
                    // 处理计算数据的 total 值
                    // “点击率”：点击次数/展示次数 * 100 %
                    resultData.ctr.total = `${resultData.impressions.total ? Number((resultData.clicks.total * 100 / resultData.impressions.total).toFixed(2)) : 0}%`;
                    // “平均每次点击费用”：费用/点击次数
                    resultData.averageCpc.total = resultData.clicks.total ? Number((resultData.cost.total / resultData.clicks.total).toFixed(2)) : 0;
                    // “平均每次转化费用”：费用/转化次数
                    resultData.costPerConversion.total = resultData.conversions.total ? Number((resultData.cost.total / resultData.conversions.total).toFixed(2)) : 0;
                    // “转化率”：转化次数/点击次数 * 100 %
                    resultData.conversionRate.total = `${resultData.clicks.total ? Number((resultData.conversions.total * 100 / resultData.clicks.total).toFixed(2)) : 0}%`;
                    // 费用, total 数据可能不为整数, 计算数据计算完毕后 toFixed 一下
                    resultData.cost.total = Number(resultData.cost.total.toFixed(2));

                    // 赋值最终结果
                    this.chartOneFormatData = resultData;

                    // 配置图表数据
                    if ([1, 11, 12].includes(index)) {
                        this.setChartOneOption(ajaxData.map(dataItem => dataItem[periodAttr]), this.chartOneFormatData.clicks.percentValueList, this.chartOneFormatData.impressions.percentValueList, this.chartOneFormatData.averageCpc.percentValueList, this.chartOneFormatData.cost.percentValueList);
                    }
                } else {
                    this.chartOneFormatData = {};
                    this.setChartOneOption([], [], [], [], []);
                }

                // 显示图表
                if (!this.adSeriesChart.setOption) {
                    this.adSeriesChart = this.$echarts.init(this.$refs.my_chart_one);
                }
                this.adSeriesChart.clear();
                this.adSeriesChart.setOption(this.chartOneOption);
            }, // 格式化已请求到的数据,设置 Option ,绘制 Chart
            setChartOneOption(xAxisData, seriesOneData, seriesTwoData, seriesThreeData, seriesFourData) {
                const that = this;
                const _loadsh = _;
                this.chartOneOption = {
                    backgroundColor: '#fff',
                    grid: {
                        x: '5%',
                        y: '5%',
                        y2: '10%'
                    },
                    legend: {
                        show: false,
                        data: [this.$t('GA.clicks'), this.$t('GA.impressions'), this.$t('GA.averageCpc'), this.$t('GA.cost')]
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter: function(params) {
                            let res = `${params[0].axisValue}<br>`;
                            for (let i = 0; i < params.length; i++) {
                                res += `<span style=" vertical-align: middle;">
                                        <div style="display: inline-block;height: 8px;width: 8px;border-radius: 50%;background-color: ${params[i].color}"></div>
                                        ${params[i].seriesName} : ${that.chartOneFormatData[_loadsh.find(that.ChartSeriesList, ['name', params[i].seriesName]).value].valueList[params[i].dataIndex]}
                                    </span>
                                    <br>`;
                            }
                            return res;
                        }
                    },
                    xAxis: [
                        {

                            type: 'category',
                            data: xAxisData,
                            axisTick: {
                                alignWithLabel: true
                            }
                        }
                    ],
                    yAxis: {
                        show: false,
                        type: 'value',
                        axisLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        }
                    },
                    series: [
                        {
                            type: 'line',
                            name: this.$t('GA.clicks'),
                            showSymbol: false,
                            lineStyle: {
                                normal: {
                                    color: '#fc8e34'
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#fc8e34'
                                }
                            },
                            data: seriesOneData
                        },
                        {
                            name: this.$t('GA.impressions'),
                            type: 'line',
                            showSymbol: false,
                            lineStyle: {
                                normal: {
                                    color: '#51b7a2'
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#51b7a2'
                                }
                            },
                            data: seriesTwoData
                        },
                        {
                            name: this.$t('GA.averageCpc'),
                            type: 'line',
                            showSymbol: false,
                            lineStyle: {
                                normal: {
                                    color: '#6289C9'
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#6289C9'
                                }
                            },
                            data: seriesThreeData
                        },
                        {
                            name: this.$t('GA.cost'),
                            type: 'line',
                            showSymbol: false,
                            lineStyle: {
                                normal: {
                                    color: '#caf268'
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#caf268'
                                }
                            },
                            data: seriesFourData
                        }
                    ]
                };
            }, // 设置 Option
            computeChartOneSeriesOverview(index) {
                if (typeof (this.chartOneFormatData[this.chartOneSeries[index].model]) === 'undefined') {
                    return;
                }
                return this.chartOneFormatData[this.chartOneSeries[index].model].total;
            }, // 显示 Chart 四个可点击的 DIV 上的数字
            chartOneSeriesClick(e, index) {
                if (this.chartOneSeries[index].active) {
                    if (this.$refs[`chartOneSeriesSelect${index}`][0].$el.contains(e.target)) {
                        return;
                    }

                    // 所有同名的 series 都取消 active
                    const seriesModel = this.chartOneSeries[index].model;
                    this.chartOneSeries.forEach(seriesItem => {
                        if (seriesItem.model === seriesModel) {
                            seriesItem.active = false;
                        }
                    });

                    // 图表隐藏数据
                    this.adSeriesChart.dispatchAction({
                        type: 'legendUnSelect',
                        name: this.seriesTransfer[this.chartOneSeries[index].model]
                    });
                } else {
                    // 所有同名的 series 都 active
                    const seriesModel = this.chartOneSeries[index].model;
                    this.chartOneSeries.forEach(seriesItem => {
                        if (seriesItem.model === seriesModel) {
                            seriesItem.active = true;
                        }
                    });

                    // 图表显示数据
                    this.adSeriesChart.dispatchAction({
                        type: 'legendSelect',
                        name: this.seriesTransfer[this.chartOneSeries[index].model]
                    });

                    e.preventDefault();
                    e.stopPropagation();
                }
            }, // Chart 上四个 DIV 的点击事件方法
            chartOneSeriesChange(value, index) {
                this.chartOneSeries[index].model = value;
                this.chartOneOption.legend.data[index] = this.seriesTransfer[value];
                this.chartOneOption.series[index].name = this.seriesTransfer[value];
                this.chartOneOption.series[index].data = this.chartOneFormatData[value].percentValueList;
                this.adSeriesChart.setOption(this.chartOneOption);
            }, // Chart 上四 DIV 上的 Select 的 change 事件方法
            clickTimeSelectIcon() {
                this.selectTimeIntervalGroupShow = true;
                if (this.selectTimeIntervalGroupShowCount === 0) {
                    this.selectTimeIntervalGroupShowCount++;
                    document.addEventListener('click', this.onClickFunc);
                }
            }, // 点击右上角时钟图标
            timeIntervalCheckboxChange(check, e) {
                this.selectTimeIntervalGroupShow = false;
                if (this.timeIntervalCheckboxList[check]) {
                    e.preventDefault();
                    return;
                }
                this.chart_loading = true;
                this.getAjaxData(this.timeIntervalCheckboxValueList[check]);
                Object.keys(this.timeIntervalCheckboxList).map(item => {
                    this.timeIntervalCheckboxList[item] = false;
                    if (item === check) {
                        this.timeIntervalCheckboxList[item] = true;
                        this.reportTimeInterval = this.timeIntervalCheckboxValueList[item];
                    }
                });
            }, // 按日、周、月切换
            /* Table */
            change_page_size(page_size) {
                console.log('change_page_size', page_size);
                this.page_size = page_size;
                this.table_data = [];
                this.current_page = 1;
                this.max_page_num = Math.ceil(this.all_table_data.length / page_size);
                this.changeContent(0, this.page_size);
            }, // 改变每页条数
            changeContent(pageNumStart, pageNumEnd) {
                if (!this.all_table_data.length) {
                    this.table_data = [];
                    return;
                }
                this.table_data = [];
                for (let i = pageNumStart; i < pageNumEnd; i++) {
                    this.all_table_data[i] && this.table_data.push(this.all_table_data[i]);
                }
            }, // 当前页显示内容
            change_page(page_no) {
                this.table_data = [];
                if (page_no < this.max_page_num) {
                    this.changeContent((page_no - 1) * this.page_size, page_no * this.page_size);
                } else {
                    if (this.all_table_data.length % this.page_size == 0) {
                        this.changeContent((page_no - 1) * this.page_size, page_no * this.page_size);
                    } else {
                        this.changeContent((page_no - 1) * this.page_size, (page_no - 1) * this.page_size + this.all_table_data.length % this.page_size);
                    }
                }
                this.current_page = page_no;
            }, // 改变页码
            export_table_data() {
                const that = this;
                console.log(this.$refs.table);
                const excel = this.exportExcel(this.$refs.table.$el, `${that.$t('GA.report_adSeries')}.xlsx`);
                if (excel) {
                    console.log(excel);
                    // this.$notify.success('导出成功');
                }
                // const that = this;
                // this.$refs.table.exportCsv({
                //     filename: this.$t('GA.report_adSeries'),
                //     columns: that.table_columns.map(item => {
                //         item.title = `\t${item.title}`;
                //         return item;
                //     }),
                //     data: that.table_data.map(item => {
                //         Object.keys(item).forEach(key => item[key] = `\t${item[key]}`);
                //         return item;
                //     }),
                //     quoted: true
                // });
            }, // 导出表格
            changeGroups(selCol) {
                this.table_columns = [];
                let flag = 0;
                let index = 0;
                for (let i = 0; i < this.all_columns.length; i++) {
                    for (let j = 0; j < selCol.length; j++) {
                        if (this.all_columns[i].title == selCol[j]) {
                            flag = 1;
                            index = i;
                            break;
                        }
                    }
                    if (flag) {
                        this.table_columns.push(this.all_columns[i]);
                        flag = 0;
                    }
                }
                if (selCol.length === this.all_columns.length) {
                    this.indeterminate = false;
                    this.checkAll = true;
                } else if (selCol.length > 0) {
                    this.indeterminate = true;
                    this.checkAll = false;
                } else {
                    this.indeterminate = false;
                    this.checkAll = false;
                }
            },
            handleCheckAll() {
                if (this.indeterminate) {
                    this.checkAll = false;
                } else {
                    this.checkAll = !this.checkAll;
                }
                this.indeterminate = false;

                if (this.checkAll) {
                    this.currentGroups = this.allGroups.slice();
                    this.table_columns = this.all_columns;
                } else {
                    this.currentGroups = [];
                    this.table_columns = [];
                }
            }, // 全选列
            changeCol() {
                if (this.filterShow) {
                    this.filterShow = false;
                }
            }, // 单选列
            handleCheckAll1() {
                if (this.indeterminate1) {
                    this.checkAll1 = false;
                } else {
                    this.checkAll1 = !this.checkAll1;
                }
                this.indeterminate1 = false;

                if (this.checkAll1) {
                    this.selectedDevice = this.deviceTypes.slice();
                } else {
                    this.selectedDevice = [];
                }
            }, // 推广设备全选
            checkAllGroupChange1(selCol) {
                if (selCol.length === this.deviceTypes.length) {
                    this.indeterminate1 = false;
                    this.checkAll1 = true;
                } else if (selCol.length > 0) {
                    this.indeterminate1 = true;
                    this.checkAll1 = false;
                } else {
                    this.indeterminate1 = false;
                    this.checkAll1 = false;
                }
            }, // 推广设备单选
            handleCheckAll2() {
                if (this.indeterminate2) {
                    this.checkAll2 = false;
                } else {
                    this.checkAll2 = !this.checkAll2;
                }
                this.indeterminate2 = false;

                if (this.checkAll2) {
                    this.selectedAdNetwork = this.adNetworkTypes.slice();
                } else {
                    this.selectedAdNetwork = [];
                }
            }, // 投放网络全选
            checkAllGroupChange2(selCol) {
                if (selCol.length === this.adNetworkTypes.length) {
                    this.indeterminate2 = false;
                    this.checkAll2 = true;
                } else if (selCol.length > 0) {
                    this.indeterminate2 = true;
                    this.checkAll2 = false;
                } else {
                    this.indeterminate2 = false;
                    this.checkAll2 = false;
                }
            }, // 投放网络单选
            changeCon1() {
                switch (this.condition1) {
                    case this.$t('GA.adSeries'):
                    case this.$t('GA.status'):
                    case this.$t('GA.device'):
                    case this.$t('GA.adNetwork'):
                        this.conditionList2 = [
                            {
                                value: this.$t('GA.con_include'),
                                label: this.$t('GA.con_include')
                            },
                            {
                                value: this.$t('GA.con_exclude'),
                                label: this.$t('GA.con_exclude')
                            }
                        ];
                        break;
                    case this.$t('GA.cost'):
                    case this.$t('GA.impressions'):
                    case this.$t('GA.clicks'):
                    case this.$t('GA.ctr'):
                    case this.$t('GA.averageCpc'):
                    case this.$t('GA.conversions'):
                    case this.$t('GA.costPerConversion'):
                    case this.$t('GA.conversionRate'):
                    case this.$t('GA.averagePosition'):
                        this.conditionList2 = [
                            {
                                value: this.$t('GA.con_lessThan'),
                                label: this.$t('GA.con_lessThan')
                            },
                            {
                                value: this.$t('GA.con_lessOrEqual'),
                                label: this.$t('GA.con_lessOrEqual')
                            },
                            {
                                value: this.$t('GA.con_equal'),
                                label: this.$t('GA.con_equal')
                            },
                            {
                                value: this.$t('GA.con_greaterOrEqual'),
                                label: this.$t('GA.con_greaterOrEqual')
                            },
                            {
                                value: this.$t('GA.con_greaterThan'),
                                label: this.$t('GA.con_greaterThan')
                            }
                        ];
                        break;
                    default:
                        break;
                }
            },
            addClick() {
                this.addCondition.push({
                    condition1: '',
                    conditionList1: this.conditionList1.slice(),
                    condition2: '',
                    conditionList2: [
                        {
                            value: this.$t('GA.con_lessThan'),
                            label: this.$t('GA.con_lessThan')
                        },
                        {
                            value: this.$t('GA.con_lessOrEqual'),
                            label: this.$t('GA.con_lessOrEqual')
                        },
                        {
                            value: this.$t('GA.con_equal'),
                            label: this.$t('GA.con_equal')
                        },
                        {
                            value: this.$t('GA.con_greaterOrEqual'),
                            label: this.$t('GA.con_greaterOrEqual')
                        },
                        {
                            value: this.$t('GA.con_greaterThan'),
                            label: this.$t('GA.con_greaterThan')
                        }
                    ],
                    condition3: ''
                });
            },
            addChangeCon1(index) {
                switch (this.addCondition[index].condition1) {
                    case this.$t('GA.adSeries'):
                    case this.$t('GA.status'):
                    case this.$t('GA.device'):
                    case this.$t('GA.adNetwork'):
                        this.addCondition[index].conditionList2 = [
                            {
                                value: this.$t('GA.con_include'),
                                label: this.$t('GA.con_include')
                            },
                            {
                                value: this.$t('GA.con_exclude'),
                                label: this.$t('GA.con_exclude')
                            }
                        ];
                        break;
                    case this.$t('GA.cost'):
                    case this.$t('GA.impressions'):
                    case this.$t('GA.clicks'):
                    case this.$t('GA.ctr'):
                    case this.$t('GA.averageCpc'):
                    case this.$t('GA.conversions'):
                    case this.$t('GA.costPerConversion'):
                    case this.$t('GA.conversionRate'):
                    case this.$t('GA.averagePosition'):
                        this.addCondition[index].conditionList2 = [
                            {
                                value: this.$t('GA.con_lessThan'),
                                label: this.$t('GA.con_lessThan')
                            },
                            {
                                value: this.$t('GA.con_lessOrEqual'),
                                label: this.$t('GA.con_lessOrEqual')
                            },
                            {
                                value: this.$t('GA.con_equal'),
                                label: this.$t('GA.con_equal')
                            },
                            {
                                value: this.$t('GA.con_greaterOrEqual'),
                                label: this.$t('GA.con_greaterOrEqual')
                            },
                            {
                                value: this.$t('GA.con_greaterThan'),
                                label: this.$t('GA.con_greaterThan')
                            }
                        ];
                        break;
                    default:
                        break;
                }
            },
            removeClick(index) {
                this.addCondition.splice(index, 1);
            },
            search_data() {
                this.table_loading = true;
                getAdsReport({
                    orgId: this.enterpriseId,
                    reportType: 2,
                    displayType: 2,
                    startDate: this.start_date,
                    endDate: this.end_date,
                    device: this.selectedDevice.join(','),
                    network: this.selectedAdNetwork.join(','),
                    clientCustomerId: this.adsAccountId
                }).then(res => {
                    this.table_loading = false;
                    this.all_table_data = Array.isArray(res.data) ? res.data : [];
                    this.initData();
                    this.all_table_data = _.orderBy(this.all_table_data, 'cost', 'desc');
                    this.total_num = this.all_table_data.length;
                    this.max_page_num = Math.ceil(this.all_table_data.length / this.page_size);
                    if (this.all_table_data.length) {
                        if (this.condition1.trim() && this.condition2.trim() && this.condition3.trim()) {
                            this.conditionGroup(this.condition1, this.condition2, this.condition3);
                        }
                        this.addCondition.forEach(item => {
                            if (item.condition1 && item.condition2 && item.condition3) {
                                this.conditionGroup(item.condition1, item.condition2, item.condition3);
                            }
                        });
                        this.total_num = this.all_table_data.length;
                        this.max_page_num = Math.ceil(this.all_table_data.length / this.page_size);
                        this.change_page(1);
                    } else {
                        this.table_data = [];
                    }
                });
            }, // 筛选字段-检索
            conditionGroup(con1, con2, con3) {
                this.reportData1 = [];
                switch (con1) {
                    case this.$t('GA.adSeries'):
                        this.keySearch('campaignName', con2, con3);
                        break;
                    case this.$t('GA.status'):
                        this.keySearch('campaignStatus', con2, con3);
                        break;
                    case this.$t('GA.device'):
                        this.keySearch('device', con2, con3);
                        break;
                    case this.$t('GA.adNetwork'):
                        this.keySearch('adNetworkType1', con2, con3);
                        break;
                    case this.$t('GA.cost'):
                        this.numSearch('cost', con2, con3);
                        break;
                    case this.$t('GA.impressions'):
                        this.numSearch('impressions', con2, con3);
                        break;
                    case this.$t('GA.clicks'):
                        this.numSearch('clicks', con2, con3);
                        break;
                    case this.$t('GA.ctr'):
                        this.numSearch('ctr', con2, con3);
                        break;
                    case this.$t('GA.averageCpc'):
                        this.numSearch('averageCpc', con2, con3);
                        break;
                    case this.$t('GA.conversions'):
                        this.numSearch('conversions', con2, con3);
                        break;
                    case this.$t('GA.costPerConversion'):
                        this.numSearch('costPerConversion', con2, con3);
                        break;
                    case this.$t('GA.conversionRate'):
                        this.numSearch('conversionRate', con2, con3);
                        break;
                    case this.$t('GA.averagePosition'):
                        this.numSearch('averagePosition', con2, con3);
                        break;
                    default:
                        break;
                }
                this.all_table_data = this.reportData1;
            }, // 字段条件组合
            keySearch(key, con2, con3) {
                switch (con2) {
                    case this.$t('GA.con_include'):
                        this.all_table_data.forEach(item => {
                            const val = item ? (item[key] || '') : '';
                            if (val.includes(con3)) {
                                this.reportData1.push(item);
                            }
                        });
                        break;
                    case this.$t('GA.con_exclude'):
                        this.all_table_data.forEach(item => {
                            const val = item ? (item[key] || '') : '';
                            if (!val.includes(con3)) {
                                this.reportData1.push(item);
                            }
                        });
                        break;
                    default:
                        break;
                }
            },
            numSearch(key, con2, con3) {
                if (isNaN(con3) == false) {
                    switch (con2) {
                        case this.$t('GA.con_lessThan'):
                            for (let i = 0; i < this.all_table_data.length; i++) {
                                if (parseFloat(this.all_table_data[i][key]) < parseFloat(con3)) {
                                    this.reportData1.push(this.all_table_data[i]);
                                }
                            }
                            break;
                        case this.$t('GA.con_lessOrEqual'):
                            for (let i = 0; i < this.all_table_data.length; i++) {
                                if (parseFloat(this.all_table_data[i][key]) <= parseFloat(con3)) {
                                    this.reportData1.push(this.all_table_data[i]);
                                }
                            }
                            break;
                        case this.$t('GA.con_equal'):
                            for (let i = 0; i < this.all_table_data.length; i++) {
                                if (parseFloat(this.all_table_data[i][key]) == parseFloat(con3)) {
                                    this.reportData1.push(this.all_table_data[i]);
                                }
                            }
                            break;
                        case this.$t('GA.con_greaterOrEqual'):
                            for (let i = 0; i < this.all_table_data.length; i++) {
                                if (parseFloat(this.all_table_data[i][key]) >= parseFloat(con3)) {
                                    this.reportData1.push(this.all_table_data[i]);
                                }
                            }
                            break;
                        case this.$t('GA.con_greaterThan'):
                            for (let i = 0; i < this.all_table_data.length; i++) {
                                if (parseFloat(this.all_table_data[i][key]) > parseFloat(con3)) {
                                    this.reportData1.push(this.all_table_data[i]);
                                }
                            }
                            break;
                        default:
                            break;
                    }
                } else {
                    alert(this.$t('GA.error_illegalNum'));
                }
            },
            empty() {
                this.condition1 = '';
                this.condition2 = '';
                this.condition3 = '';
                this.addCondition = [];
            },
            conditionShow() {
                this.filterShow = !this.filterShow;
            },
            changesort(a) {
                let order;
                switch (a.order) {
                    case 'descending':
                        order = 'desc';
                        break;
                    case 'ascending':
                        order = 'asc';
                        break;
                }
                if (order) {
                    this.all_table_data = _.orderBy(this.all_table_data, a.prop, order);
                } else {
                    this.all_table_data = _.orderBy(this.all_table_data, 'cost', 'desc');
                }
                this.change_page(1);
            },
            onClickFunc(e) {
                if (!this.$refs.selectGroupDiv) {
                    return;
                }
                if (!this.$refs.selectGroupDiv.contains(e.target)) {
                    this.selectTimeIntervalGroupShow = false;
                }
            }
        },
        created() {
            this.currentGroups = this.allGroups.slice();
            this.table_columns = this.all_columns;
            this.start_date = (new Date((Date.now() - 3600 * 1000 * 24 * 30))).format('yyyy-MM-dd');
            this.end_date = (new Date((Date.now() - 3600 * 1000 * 24))).format('yyyy-MM-dd');
            this.date_value = [this.start_date, this.end_date];
        },
        mounted() {
            this.selectedDevice = this.deviceTypes.slice();
            this.selectedAdNetwork = this.adNetworkTypes.slice();
            this.getAjaxData(1);
            this.getAjaxData(2);
        },
        activated() {
            if (this.adSeriesChart.resize) {
                this.adSeriesChart.resize();
            }
        },
        beforeDestroy() {
            if (this.adSeriesChart && this.adSeriesChart.dispose) {
                this.adSeriesChart.dispose();
            }
            document.removeEventListener('click', this.onClickFunc);
        },
        watch: {
            window_width() {
                if (this.adSeriesChart.resize) {
                    this.adSeriesChart.resize();
                }
            }
        }
    };
</script>

<style scoped lang="less">
    @import "../table";
    @import "../fullChart";
</style>
