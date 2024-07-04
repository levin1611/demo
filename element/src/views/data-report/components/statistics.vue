<template>
    <Card class="statistic-report">
        <div class="header">
            <Dropdown @command="changeDimension" trigger="click">
                <span class="dimension">
                    {{lang === 'zh-CN'? `按${dimension.title}统计` : `Statistics By ${dimension.title}`}}
                    <Icon type="ios-arrow-down"></Icon>
                </span>
                <DropdownMenu slot="dropdown">
                    <DropdownItem v-for="(dimension,index) in dimensionList" :command="dimension.value" :key="index"
                                  :class="dimension.title =='销售人员'?'leadstatistics-viewsalespersondimensionsstatistics':''">{{dimension.title}}
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <div class="urlScreening" v-if="tabs.length>0" @click="showContent(true)">
                <Tooltip :content="tooltipMsg" placement="top" transfer max-width="400" :disabled="isDisabledTool">
                    <span>{{selectUrl}}</span>
                </Tooltip>
                <Icon custom="custom custom-table-filter" style="position: absolute;right: 8px;top: 7px;"></Icon>
            </div>
            <div class="checkbox_area" v-show="showContentArea">
                <div class="option-area">
                    <Checkbox
                        :indeterminate="indeterminate"
                        :value="checkAll"
                        @click.prevent.native="handleCheckAll">{{$t('data_report.allUrl')}}
                </Checkbox>
                <CheckboxGroup v-model="checkAllGroup" @change="checkAllGroupChange">
                    <Checkbox :label="item.matomoSiteId" :key="item.matomoSiteId" v-for="item in urlData">
                        <span>{{item.webSiteUrl}}</span>
                    </Checkbox>
                </CheckboxGroup>
                </div>
                <div class="functionBtn" style="text-align: right;padding-top: 3px;padding-right: 16px;">
                    <Button class="cencelallbox" type="minor"  size="small" @click="cancelSubmit">{{ $t('cancel') }}
                    </Button>
                    <Button class="submitSelect websitetrafficstatistics-filterdomainnames" type="success" size="small"
                            style="margin-left: 12px;" @click="submitContent">{{ $t('confirm') }}
                    </Button>
                </div>
            </div>
            <RadioGroup size='small' v-model="currentTab" @change="toggleTab" v-if="tabs.length>0" style="margin-left:10px;">
                <RadioButton class="radio-button-bordered" border v-for="(tab,index) in tabs" :key="index" :label="tab.value">{{tab.title}}</RadioButton>
            </RadioGroup>
            <DatePicker :editable="false" :picker-options="options" class="float-right date-picker"
                        v-model="date" type="daterange" style="width: 220px"
                        @change="changeDate"
                        start-placeholder="Select date"
                        end-placeholder="Select date"></DatePicker>
                        <!-- @click="exportData()" -->
            <div class="export-data float-right _btns_text_ml" >
                <!-- <Icon style="font-size:12px;" custom="custom-file-download"></Icon>&nbsp;{{$t('data_report.download')}} -->
                <Button type='text'
                    @click='exportData()'
                    icon="custom custom-file-download">
                    {{$t('data_report.download')}}
                </Button>
            </div>
        </div>
        <div class="table">
            <Table class="noborder-table" ref="table" :row-class-name="boldRow" :loading="loading"
                 :isCustom="true"
                       :customEmptyText="customEmptyTextLang"
                       :customEmptyButtonText="customEmptyButtonTextLang"
                       :customClearMethod="clearFilterConditionByInitView"
            :data="allData" :height="tableHeight">
                <TableColumn v-for="column in allColumns"
                         :key="column.key"
                         :label="column.title"
                         :prop="column.key"
                         :show-overflow-tooltip="true">
                        <template slot="header" slot-scope="scope" class="table-slot">
                            <div class="clear-float" style="display:flex;">
                                <span class="column-title overflow-hide">{{column.title}}
                                </span>
                                <span>
                                    <Icon class="arrow" v-show="orderBy===column.orderBy&&isDesc===0"
                                            type="md-arrow-dropup"/>
                                    <Icon class="arrow" v-show="orderBy===column.orderBy&&isDesc===1"
                                            type="md-arrow-dropdown"/>
                                </span>
                                <FilterBox
                                        v-if="column.sort || column.filter"
                                        :sort="column.sort"
                                        :filter="column.filter"
                                        :allList="allList"
                                        :columnValue="column.value"
                                        :columnType="column.orderBy"
                                        @updateList="getReportData"
                                        :orderBy.sync="orderBy"
                                        :period.sync="period"
                                        :query.sync="query"
                                        :periodList="periodList"
                                        @changeColumn="changeColumn"
                                        @changeQuery="changeQuery"
                                        :isDesc.sync="isDesc">
                                </FilterBox>
                            </div>
                        </template>
                </TableColumn>
            </Table>
            <div class="page-component">
                <Page :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                      :current-page="currentPage"
                      :page-size="pageSize"
                      :page-sizes="sizeOpts"
                      @current-change="changePage"
                      @size-change="changePageSize"/>
            </div>
        </div>
    </Card>
</template>
<script>
    import Vue from 'vue';
    import util from '@/libs/util.js';
    import { mapState } from 'vuex';
    import $ from 'jquery';
    import FilterBox from './filter-box';
    import resetInitComponents from '@/mixins/resetComponentViewData';

    export default {
        mixins: [resetInitComponents],
        name: 'statistics',
        components: {
            FilterBox
        },
        props: {
            urlData: Array,
            dimensionList: Array, /* 维度列表 */
            quotaColumns: Array, /* 除维度之外的 指标的表头 */
            reportUrl: String, /* 接口地址  */
            periodList: Array, /* 统计周期 */
            exportUrl: String, /* 下载接口地址 */
            tabs: { /* 切换单选框选项 */
                type: Array,
                default() {
                    return [];
                }
            },
            idData: {
                type: Array,
                default() {
                    return [];
                }
            },
            authority: {
                type: Boolean,
                default: false
            }, // 是否有权限限制
            urlObj: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height',
                window_width: 'window_width'
            }),
            allColumns() {
                const dimension = { ...this.dimension };
                if (dimension.time === true) {
                    dimension.title = this.getPeriodTitle(this.period);
                }
                const columns = [...this.quotaColumns];
                columns.unshift(dimension);
                return columns;
            },
            allData() {
                return this.lastData.concat(this.data);
            },
            tableHeight() {
                return this.window_height - 185;
            }
        },
        data() {
            return {
                lang: 'zh-CN',
                isDisabledTool: true,
                checkAllGroup: [],
                selectUrl: this.$t('data_report.allUrl'),
                showContentArea: false,
                indeterminate: false,
                checkAll: true,
                dimension: { ...this.dimensionList[0] },
                date: '',
                data: [],
                lastData: [], /* 每页最后一条 固定显示合计 */
                currentPage: 1, /* 当前页数 */
                pageSize: 20, /* 每页条数 */
                total: 0, /* 总页数 */
                sizeOpts: [20, 30, 40, 50],
                loading: false,
                options: {
                    shortcuts: [
                        {
                            text: this.$t('datepicker.today'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.yesterday'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24);
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.tswk'),
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
                            text: this.$t('datepicker.ltwk'),
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
                            text: this.$t('datepicker.tsmt'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(new Date(start.getFullYear(), start.getMonth(), 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.ltmt'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() - 24 * 60 * 60 * 1000);
                                start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.tsyr'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(new Date(start.getFullYear(), 0, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.ltyr'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(new Date(end.getFullYear(), 0, 1).getTime() - 24 * 60 * 60 * 1000);
                                start.setTime(new Date(start.getFullYear() - 1, 0, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.last7Days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.last14Days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 14);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.last30Days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.last90Days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.last150Days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 150);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.last365Days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
                                picker.$emit('pick', [start, end]);
                            }
                        }
                    ],
                    disabledDate(date) {
                        return date.valueOf() > Date.now() - 1 * 3600 * 24 * 1000;
                    }
                },
                orderBy: this.dimensionList[0].orderBy, /* 按什么排序 */
                isDesc: 1, /* 排序规则 */
                period: '2', /* 日期的统计周期 */
                allList: [], /* 当前维度有多少项 */
                query: [], /* 内容筛选条件 */
                currentTab: 0, /* 当前tab 切换流量统计访客类型  */
                sendmsg: [],
                tooltipMsg: '',
                postStringUrl: '',
                orgUrl: ''
            };
        },
        created() {
            const endtime = new Date();
            const starttime = new Date();
            (endtime.getTime() - endtime.getDay() * 24 * 60 * 60 * 1000) > (Date.now() - 1 * 3600 * 24 * 1000) ? endtime.setTime(Date.now() - 1 * 3600 * 24 * 1000) : endtime.setTime(endtime.getTime() - endtime.getDay() * 24 * 60 * 60 * 1000);
            starttime.setTime(starttime.getTime() - (starttime.getDay() + 6) * 24 * 60 * 60 * 1000);
            this.date = [starttime.format('yyyy-MM-dd'), endtime.format('yyyy-MM-dd')];
            this.getReportData();
        },
        /** 表格的表头slot根据表格内容的滚动条移动 */
        mounted() {
            this.lang = Vue.config.lang;
            // content_area urlScreening
            $(document).on('click', ':not(.urlScreening)', function() {
                document.onclick = null;
                $('.content_area').hide();
            });
            $('.urlScreening').click(function(event) {
                document.getElementsByClassName('urlScreening')[0].onclick = null;
                $('.content_area').show();
                // this.showContentArea = true;
                event.stopPropagation();
            });
            $('.content_area').click(function(event) {
                document.getElementsByClassName('content_area')[0].onclick = null;
                event.stopPropagation();
            });
            // $(".cencelallbox").click(function() {
            //     document.getElementsByClassName("cencelallbox")[0].onclick = null;
            //     $('.selectBox').hide();
            // });
            const tip = document.querySelector('.statistic-report .ivu-table-tip');
            const body = document.querySelector('.statistic-report .ivu-table-body');
            if (tip) {
                tip.onscroll = (event) => {
                    const title = document.querySelector('.statistic-report .ivu-table-title');
                    title.scrollLeft = event.target.scrollLeft;
                };
            }
            if (body) {
                body.onscroll = (event) => {
                    const title = document.querySelector('.statistic-report .ivu-table-title');
                    title.scrollLeft = event.target.scrollLeft;
                };
            }
        },
        watch: {
            dimension: {
                handler(value) {
                    this.$emit('changeDimension', { ...value });
                },
                deep: true
            },
            idData: {
                handler(value) {
                    this.checkAllGroup = value;
                    const urlString = value.join(',');
                    this.postStringUrl = urlString;
                    this.orgUrl = urlString;
                    this.getReportData();
                },
                deep: true
            }
        },
        methods: {
            showContent(data) {
                this.showContentArea = data;
            },
            cancelSubmit() {
                this.showContentArea = false;
            },
            submitContent() {
                if (this.checkAll == true) {
                    this.selectUrl = this.$t('data_report.allUrl');
                    const temp = this.checkAllGroup.join(',');
                    this.postStringUrl = temp;
                    this.isDisabledTool = true;
                } else {
                    if (this.checkAllGroup.length) {
                        let urlStr = '';
                        let urlabbr = '';
                        for (let i = 0; i < this.checkAllGroup.length; i++) {
                            const temp = this.checkAllGroup;
                            if (this.urlObj[temp[i]]) {
                                urlStr += `${this.urlObj[temp[i]]},`;
                            }
                        }
                        urlStr = urlStr.substring(0, urlStr.length - 1);
                        if (urlStr.toString().length > 24) {
                            urlabbr = `${urlStr.toString().slice(0, 23)}...`;
                            this.isDisabledTool = false;
                        } else {
                            urlabbr = urlStr;
                            this.isDisabledTool = true;
                        }
                        this.tooltipMsg = urlStr;
                        this.selectUrl = urlabbr;
                        const temp = this.checkAllGroup.join(',');
                        this.postStringUrl = temp;
                    } else {
                        this.selectUrl = this.$t('data_report.allUrl');
                        this.postStringUrl = this.orgUrl;
                        this.isDisabledTool = true;
                    }
                }

                this.getReportData();
                this.showContentArea = false;
            },
            handleCheckAll(data) {
                if (this.indeterminate) {
                    this.checkAll = false;
                } else {
                    this.checkAll = !this.checkAll;
                }
                this.indeterminate = false;

                if (this.checkAll) {
                    for (let i = 0; i < this.urlData.length; i++) {
                        this.checkAllGroup.push(this.urlData[i].matomoSiteId);
                    }
                } else {
                    this.checkAllGroup = [];
                }
            },
            checkAllGroupChange(data) {
                if (data.length === this.urlData.length) {
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
            getReportData() {
                let postData = {
                    statDimension: this.dimension.value === 1 ? Number(this.dimension.value + this.period) : this.dimension.value,
                    startDate: this.date[0] ? new Date(this.date[0]).format('yyyy-MM-dd') : '2018-03-01',
                    endDate: this.date[1] ? new Date(this.date[1]).format('yyyy-MM-dd') : new Date().format('yyyy-MM-dd'),
                    pageSize: this.pageSize,
                    pageNo: this.currentPage,
                    orgId: Number(this.orgId),
                    domainId: this.postStringUrl
                    // orderBy:this.orderBy,
                    // isDesc:this.isDesc,
                };
                if (this.tabs.length > 0) {
                    postData[this.tabs[0].key] = this.currentTab;
                }
                if (this.orderBy !== -1) {
                    postData = Object.assign(postData, {
                        orderBy: this.orderBy,
                        isDesc: this.isDesc
                    });
                }
                if (this.query.length > 0) {
                    postData.query = this.query;
                }
                if (this.authority) {
                    postData = Object.assign(postData, {
                        userId: this.userId
                    });
                }
                this.loading = true;
                util.ajaxJson({
                    url: this.reportUrl,
                    method: 'post',
                    data: postData
                }).then(async res => {
                    if (res.data.code == 1) {
                        /* 第一页加上合计 */
                        if (this.currentPage === 1 && res.data.data.sumObj) {
                            this.lastData[0] = res.data.data.sumObj;
                            this.lastData[0][this.dimension.key] = this.$t('data_report.total');
                        } else {
                            this.lastData = [];
                        }
                        this.total = res.data.data.total;
                        if (this.reportUrl == '/report/clueReport/getClueStatList') {
                            if (this.dimension.value == 4) {
                                const temp = res.data.data.list;
                                await this.dealData(temp);
                                this.data = temp;
                            } else {
                                this.data = res.data.data.list;
                            }
                        } else {
                            this.data = res.data.data.list;
                        }

                        this.allList = res.data.data.dimensionList;

                        this.loading = false;
                    } else {
                        this.total = 0;
                        this.data = [];
                        this.allList = [];
                        this.lastData = [];
                    }
                });
            },
            async dealData(temp) {
                for (let i = 0; i < temp.length; i++) {
                    if (temp[i].nation.includes('-')) {
                        const code = await this.changeCityCode(temp[i].nation);
                        const countryName = code;
                        temp[i].nation = countryName;
                    }
                }
                this.data = temp;
            },
            changeCityCode(obj) {
                return new Promise((resolve, reject) => {
                    util.ajax({
                        url: '/report/country/getDetailByCode',
                        method: 'get',
                        params: {
                            divCode: obj
                        }
                    }).then(res => {
                        if (res.data.code == 1) {
                            if (res.data.data.length) {
                                if (res.data.data.length == 2) {
                                    resolve(`${res.data.data[0].countryName}-${res.data.data[0].divisionCnname}-${res.data.data[1].divisionCnname}`);
                                } else {
                                    resolve(`${res.data.data[res.data.data.length - 1].countryName}-${res.data.data[res.data.data.length - 1].divisionCnname}`);
                                }
                            } else {
                                resolve(obj);
                            }
                        }
                    });
                });
            },
            exportData() {
                const postData = {
                    statDimension: this.dimension.value === 1 ? Number(this.dimension.value + this.period) : this.dimension.value,
                    startDate: this.date[0] ? new Date(this.date[0]).format('yyyy-MM-dd') : '2018-03-01',
                    endDate: this.date[1] ? new Date(this.date[1]).format('yyyy-MM-dd') : new Date().format('yyyy-MM-dd'),
                    pageSize: this.pageSize,
                    pageNo: this.currentPage,
                    orgId: Number(this.orgId)
                };
                let url = `${util.ajaxUrl}/${this.exportUrl}?statDimension=${postData.statDimension}&startDate=${postData.startDate}&endDate=${postData.endDate}&orgId=${postData.orgId}`;
                if (this.orderBy !== -1) {
                    url = `${url}&orderBy=${this.orderBy}&isDesc=${this.isDesc}`;
                }
                if (this.authority) {
                    url += `&userId=${this.userId}`;
                }
                if (this.query.length > 0) {
                    const query = encodeURIComponent(this.query);
                    url = `${url}&query=${query}`;
                }
                const a = document.createElement('a');
                const filename = '统计报告' + '.xlsx';
                a.href = url;
                a.download = filename;
                a.click();
            },
            /* 切换访客类型 */
            toggleTab(value) {
                console.log(value, 'value----------');
                this.currentPage = 1;
                this.getReportData();
            },
            boldRow(row, index) {
                if (this.currentPage === 1 && index === 0) {
                    return 'font-bold';
                } else {
                    return '';
                }
            },
            changeQuery(query) {
                this.query = [...query];
                this.currentPage = 1;
            },
            getPeriodTitle(period) {
                switch (period) {
                    case '1':
                        return this.$t('data_report.period_list.date');
                        break;
                    case '2':
                        return this.$t('data_report.period_list.week');
                        break;
                    case '3':
                        return this.$t('data_report.period_list.month');
                        break;
                    case '4':
                        return this.$t('data_report.period_list.quarter');
                        break;
                    case '5':
                        return this.$t('data_report.period_list.year');
                        break;
                }
            },
            changeDimension(name) {
                this.query = [];
                const dem = this.dimensionList.filter(item => {
                    return item.value === name;
                });
                this.dimension = { ...dem[0] };
                this.currentPage = 1;
                this.orderBy = -1;
                this.period = '2';
                this.getReportData();
            },
            changeDate() {
                // 清空日期选择时
                if (this.date === null) {
                    this.date = ['', ''];
                }
                this.currentPage = 1;
                this.getReportData();
            },
            changePage(page) {
                this.currentPage = page;
                this.getReportData();
                document.querySelector('.ivu-table-body').scrollTop = 0;
            },
            changePageSize(size) {
                this.pageSize = size;
                this.currentPage = 1;
                this.getReportData();
            },
            changeColumn({ key, title }) {
                this.dimension.key = key;
                // this.dimension.title = title
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

    .radio-button-bordered {
        &.is-focus {
            box-shadow: 0 0 0 2px rgba(66,133,244,.2);
            border-radius: 4px;
        }
        .el-radio-button__inner:hover {
            color: #4285f4;
        }
        .el-radio-button__orig-radio:checked+.el-radio-button__inner {
            background: #fff;
            border-color: #4285f4;
            box-shadow: -1px 0 0 0 #4285f4;
            color: #4285f4;
        }
    }
    .urlScreening {
        display: inline-block;
        width: 230px;
        height: 30px;
        border: 1px solid #cbd6e2;
        margin-left: 20px;
        padding-left: 5px;
        padding-top: 2px;
        border-radius: 4px;
        position: relative;
    }
    .checkbox_area {
        position: absolute;
        z-index: 99;
        left: 156px;
        min-width: 230px;
        padding: 10px;
        border-radius: 4px;
        box-shadow: 0 1px 6px rgba(0, 0, 0, .2);
        background-color: #fff;
        .option-area {
            max-height: 240px;
            overflow-y: scroll;
        }
        .el-checkbox {
            display: block;
        }
    }

    .content_area .ivu-checkbox-group-item, .ivu-switch {
        display: block;
    }

    .content_area .ivu-checkbox-wrapper {
        display: block;
    }

    // .statistic-report .header .ivu-dropdown {
    //   width: 135px;
    // }
</style>
