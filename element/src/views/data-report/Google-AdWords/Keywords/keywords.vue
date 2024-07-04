<template>
    <div class="adgroup">
<!--        <h1 class="title">{{ $t('GA.report_keywords') }}</h1>-->
        <div class="table_wrap">
            <div class="datewrap">
                <DatePicker v-model="datevalue"
                            type="daterange"
                            :picker-options="options2"
                            :clearable="false"
                            :placeholder="$t('GA.tip_selectDate')"
                            size="small"
                            @change="changeDate"
                            style="width: 240px"></DatePicker>
                <span>
                    <Button class="table-filter-item" v-if="authorized_export" type="text" icon="custom custom-file-download" @click="exportData()">{{ $t('GA.exportData') }}</Button>
                    <Poptip width="400" placement="bottom">
                        <Button class="table-filter-item" type="text"  slot="reference" icon=" custom custom-table-filter" @click="conditionshow()">{{ $t('GA.filter') }}</Button>
                        <div>
                            <div class="condition">
                                <h3>{{ $t('GA.searchCondition') }}</h3>
                                <div class="conditionmain">
                                    <Select v-model="condition1" style="width:120px;margin-right:15px;float:left;" size="small" @change="changecon1()">
                                        <Option v-for="item in conditionlist1" :value="item.value" :key="item.value" :label="item.label"></Option>
                                    </Select>
                                    <Select v-model="condition2" style="width:90px;margin-right:15px;float:left;" size="small">
                                        <Option v-for="item in conditionlist2" :value="item.value" :key="item.value" :label="item.label"></Option>
                                    </Select>
                                    <div style="margin-bottom:10px;">
                                        <Input v-model="condition3" size="small" :placeholder="$t('GA.tip_addKeywords')" style="width:100px;margin-right:5px;"></Input>
                                        <span @click="addclick()">
                                            <!-- <Icon type="plus-circled" size="15" color="#FA8241" style='cursor:pointer;display:inline-block;'></Icon> -->
                                            <Icon size="15" class="custom custom-add-circle" style='cursor:pointer;display:inline-block;'></Icon>
                                        </span>
                                    </div>
                                </div>
                                <div class="conditionwrap">
                                    <div v-for="(add,index) in addcondition" class="conditionmain">
                                        <Select v-model="add.condition1" style="width:120px;margin-right:15px;float:left;" size="small" @change="addchangecon1(index)">
                                            <Option v-for="item in add.conditionlist1" :value="item.value" :key="item.value" :label="item.label"></Option>
                                        </Select>
                                        <Select v-model="add.condition2" style="width:90px;margin-right:15px;float:left;" size="small">
                                            <Option v-for="item in add.conditionlist2" :value="item.value" :key="item.value" :label="item.label"></Option>
                                        </Select>
                                        <div style="margin-bottom:10px;">
                                            <Input v-model="add.condition3" size="small" :placeholder="$t('GA.tip_addKeywords')" style="width:100px;margin-right:5px;"></Input>
                                            <span @click="removeclick(index)">
                                                <!-- <Icon type="minus-circled" size="15" color="#FA8241" style='cursor:pointer;display:inline-block;'></Icon> -->
                                                <Icon  size="15" class="custom custom-reduce-circle" style='cursor:pointer;display:inline-block;'></Icon>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="btn" style="margin-left:140px;">
                                <Button type="primary" size="small" style="width:50px;" @click="searchdata()">{{ $t('GA.search') }}</Button>
                                <Button type="primary" ghost size="small" style="width:50px;" @click="empty()">{{ $t('GA.clear') }}</Button>
                            </div>
                        </div>
                    </Poptip>
                    <Poptip width="140" placement="bottom">
                        <Button class="table-filter-item" type="text"  slot="reference"  icon="custom custom-more">{{ $t('GA.editColumns') }}</Button>
                        <div>
                            <Checkbox
                                    :indeterminate="indeterminate"
                                    :value="checkAll"
                                    @click.prevent.native="handleCheckAll" style="margin-bottom:5px;">{{ $t('GA.selectAll') }}</Checkbox>
                            <Checkbox-group v-model="currentGroups"
                                            @change="changegroups"
                                            class="checkboxgroup">
                                <Checkbox v-for="item in allGroups"
                                          :key="item"
                                          :label="item">{{ item }}</Checkbox>
                            </Checkbox-group>
                        </div>
                    </Poptip>
                </span>
            </div>
            <div class="table">
                <!-- <Table @on-sort-change="changesort" ref="table" :columns="table_columns" :data="data1" :loading="loading" class="tabmain" height="400"></Table> -->
                <Table :data="data1"
                       v-loading="loading"
                       :height="table_height"
                       ref="table"
                       @sort-change="changesort"
                       class="tabmain">
                        <TableColumn
                            v-for="item in table_columns"
                            :min-width="item.width"
                            :key="item.key"
                            :prop="item.key"
                            sortable
                            show-overflow-tooltip
                            :label="item.title">
                        </TableColumn>
                </Table>
                <div style="margin: 10px 10px 0;overflow: hidden">
                    <div class="pagewrap">
                        <!-- <Page :page-size-opts="pagesizeopts" @on-page-size-change="pagesizechange" :total="totalpage" :current="curpage" @on-change="changePage" show-total show-sizer show-elevator placement="top"></Page> -->
                        <Page
                            :page-sizes="pagesizeopts"
                            :page-size="pagesize"
                            :current-page="curpage"
                            layout="total, prev, pager, next, sizes, jumper"
                            :total="totalpage"
                            ref="pages"
                            style="display:inline-block"
                            :placement="'top'"
                            @size-change="pagesizechange"
                            @current-change="changePage">
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
    import exportExcel from '@/mixins/exportExcel.js';
    import { mapState } from 'vuex';
    import { adsReport } from '@/api/google/index';
    const { getAdsReport } = adsReport;

    export default {
        name: 'keywords',
        mixins: [exportExcel],
        props: {
            authorized_export: Boolean,
            adsAccountId: String
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                window_height: 'window_height'
            }),
            table_height() {
                let temp = this.window_height ? this.window_height- 248 : document.body.clientHeight- 248;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            }
        },
        data() {
            return {
                loading: true, // 加载图标
                table_columns: [], // 表格列名称
                all_columns: [
                    {
                        title: this.$t('GA.keywords'),
                        key: 'keyword',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.adGroup'),
                        key: 'adgroup',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.adSeries'),
                        key: 'adseries',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.matchType'),
                        key: 'matchway',
                        width: 110,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.keywordsStatus'),
                        key: 'keystatus',
                        width: 130,
                        sortable: true
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
                        key: 'averagecpc',
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
                        key: 'costperconversion',
                        width: 170,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.conversionRate'),
                        key: 'conversionrate',
                        width: 100,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.averagePosition'),
                        key: 'averageposition',
                        width: 110,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.firstPageCpc'),
                        key: 'firstPageCpc',
                        width: 130,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.topOfPageCpc'),
                        key: 'topOfPageCpc',
                        width: 130,
                        sortable: true
                    }
                ], // 表格全部列
                data1: [],
                alldata1: [],
                status: '',
                model1: '',
                pagenum: 1,
                totalpage: 0,
                reportdata: [],
                allreportdata: [], // 所有数据
                curpage: 1,
                pagesize: 10,
                maxpagenum: 1,
                pagesizeopts: [10, 20, 30, 50],
                datevalue: [],
                options2: {
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
                    this.$t('GA.keywords'),
                    this.$t('GA.adGroup'),
                    this.$t('GA.adSeries'),
                    this.$t('GA.matchType'),
                    this.$t('GA.keywordsStatus'),
                    this.$t('GA.cost'),
                    this.$t('GA.impressions'),
                    this.$t('GA.clicks'),
                    this.$t('GA.ctr'),
                    this.$t('GA.averageCpc'),
                    this.$t('GA.conversions'),
                    this.$t('GA.costPerConversion'),
                    this.$t('GA.conversionRate'),
                    this.$t('GA.averagePosition'),
                    this.$t('GA.firstPageCpc'),
                    this.$t('GA.topOfPageCpc')
                ],
                currentGroups: [],
                indeterminate: false,
                checkAll: true,
                condition1: '',
                conditionlist1: [
                    {
                        value: this.$t('GA.keywords'),
                        label: this.$t('GA.keywords')
                    },
                    {
                        value: this.$t('GA.adGroup'),
                        label: this.$t('GA.adGroup')
                    },
                    {
                        value: this.$t('GA.adSeries'),
                        label: this.$t('GA.adSeries')
                    },
                    {
                        value: this.$t('GA.matchType'),
                        label: this.$t('GA.matchType')
                    },
                    {
                        value: this.$t('GA.keywordsStatus'),
                        label: this.$t('GA.keywordsStatus')
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
                        value: this.$t('GA.firstPageCpc'),
                        label: this.$t('GA.firstPageCpc')
                    },
                    {
                        value: this.$t('GA.topOfPageCpc'),
                        label: this.$t('GA.topOfPageCpc')
                    }
                ],
                condition2: '',
                conditionlist2: [
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
                addcondition: [],
                startDate: '',
                endDate: '',
                searchkey: '',
                searchcon: '',
                searchval: '',
                reportdata1: [],
                filtershow: false,
                exportdata: [],
                matchtype: ''
            };
        },
        created: function() {
            /* 初始化获取最近7天的数据表格 */
            this.currentGroups = this.allGroups.slice();
            this.table_columns = this.all_columns;
            const endtime = new Date();
            const starttime = new Date();
            endtime.setTime(endtime.getTime() - 3600 * 1000 * 24);
            starttime.setTime(starttime.getTime() - 3600 * 1000 * 24 * 30);
            this.datevalue = [starttime, endtime];
            this.startDate = starttime.format('yyyy-MM-dd');
            this.endDate = endtime.format('yyyy-MM-dd');
            getAdsReport({
                orgId: this.enterpriseId,
                reportType: 4,
                displayType: 1,
                startDate: this.startDate,
                endDate: this.endDate,
                clientCustomerId: this.adsAccountId
            }).then(res => {
                this.loading = false;
                this.allreportdata = Array.isArray(res.data) ? res.data : [];
                this.totalpage = this.allreportdata.length;
                this.maxpagenum = Math.ceil(this.allreportdata.length / this.pagesize);
                this.initdata();
                this.alldata1 = _.orderBy(this.alldata1, 'cost', 'desc');
                this.changePage(1);
            });
        },
        methods: {
            /* 初始化数据 */
            initdata() {
                for (let i = 0; i < this.allreportdata.length; i++) {
                    switch (this.allreportdata[i].status) {
                        case 'unknown':
                            this.status = this.$t('GA.unknown');
                            break;
                        case 'enabled':
                            this.status = this.$t('GA.enabled');
                            break;
                        case 'paused':
                            this.status = this.$t('GA.suspend');
                            break;
                        case 'removed':
                            this.status = this.$t('GA.remove');
                            break;
                        default:
                            break;
                    }
                    switch (this.allreportdata[i].keywordMatchType) {
                        case 'Exact':
                            this.keytype = this.$t('GA.matchTypeType.EXACT');
                            break;
                        case 'Phrase':
                            this.keytype = this.$t('GA.matchTypeType.PHRASE');
                            break;
                        case 'Broad':
                            this.keytype = this.$t('GA.matchTypeType.BROAD');
                            break;
                        default:
                            this.keytype = this.allreportdata[i].keywordMatchType;
                            break;
                    }
                    this.alldata1.push({
                        keyword: this.allreportdata[i].criteria,
                        adgroup: this.allreportdata[i].adGroupName,
                        adseries: this.allreportdata[i].campaignName,
                        matchway: this.keytype,
                        keystatus: this.status,
                        cost: parseFloat(parseFloat(this.allreportdata[i].cost / 1000000).toFixed(2)),
                        impressions: parseFloat(this.allreportdata[i].impressions),
                        clicks: parseFloat(this.allreportdata[i].clicks),
                        ctr: parseFloat(this.allreportdata[i].ctr),
                        averagecpc: parseFloat(parseFloat(this.allreportdata[i].averageCpc / 1000000).toFixed(2)),
                        conversions: parseFloat(this.allreportdata[i].conversions),
                        costperconversion: parseFloat(parseFloat(this.allreportdata[i].costPerConversion / 1000000).toFixed(2)),
                        conversionrate: parseFloat(this.allreportdata[i].conversionRate),
                        averageposition: utils.toFloat(this.allreportdata[i].averagePosition),
                        firstPageCpc: utils.toFloat(this.allreportdata[i].firstPageCpc),
                        topOfPageCpc: utils.toFloat(this.allreportdata[i].topOfPageCpc)
                    });
                }
            },
            /* 改变每页条数 */
            pagesizechange(pagesize) {
                console.log(pagesize);
                this.pagesize = pagesize;
                this.data1 = [];
                this.curpage = 1;
                this.maxpagenum = Math.ceil(this.alldata1.length / pagesize);
                this.changecontent(0, this.pagesize);
            },
            /* 当前页显示内容 */
            changecontent(pagenumstart, pagenumend) {
                if (!this.alldata1.length) {
                    this.data1 = [];
                    return;
                }
                for (let i = pagenumstart; i < pagenumend; i++) {
                    this.alldata1[i] && this.data1.push(this.alldata1[i]);
                }
            },
            /* 改变页码 */
            changePage(pagenum) {
                this.data1 = [];
                if (pagenum < this.maxpagenum) {
                    this.changecontent((pagenum - 1) * this.pagesize, pagenum * this.pagesize);
                } else {
                    if (this.alldata1.length % this.pagesize == 0) {
                        this.changecontent((pagenum - 1) * this.pagesize, pagenum * this.pagesize);
                    } else {
                        this.changecontent((pagenum - 1) * this.pagesize, (pagenum - 1) * this.pagesize + this.alldata1.length % this.pagesize);
                    }
                }
                this.curpage = pagenum;
            },
            /* 改变日期 */
            changeDate(date) {
                console.log(date);
                this.loading = true;
                if (!date) {
                    this.startDate = '';
                    this.endDate = '';
                } else {
                    this.startDate = new Date(date[0]).format('yyyy-MM-dd');
                    this.endDate = new Date(date[1]).format('yyyy-MM-dd');
                }
                getAdsReport({
                    orgId: this.enterpriseId,
                    reportType: 4,
                    displayType: 1,
                    startDate: this.startDate,
                    endDate: this.endDate,
                    clientCustomerId: this.adsAccountId
                }).then(res => {
                    this.loading = false;
                    this.allreportdata = Array.isArray(res.data) ? res.data : [];
                    this.totalpage = this.allreportdata.length;
                    this.maxpagenum = Math.ceil(this.allreportdata.length / this.pagesize);
                    this.alldata1 = [];
                    //                    for(var i=0;i<this.allreportdata.length;i++){
                    //                        switch(this.allreportdata[i].adGroupStatus){
                    //                            case 'unknown':
                    //                                this.status='未知';
                    //                                break;
                    //                            case 'enabled':
                    //                                this.status='启用';
                    //                                break;
                    //                            case 'paused':
                    //                                this.status='暂停';
                    //                                break;
                    //                            case 'removed':
                    //                                this.status='移除';
                    //                                break;
                    //                        }
                    //                        this.alldata1.push(
                    //                            {
                    //                                'adgroup':this.allreportdata[i].adGroupName,
                    //                                'status':this.status,
                    //                                'adseries':this.allreportdata[i].campaignName,
                    //                                'cost':parseFloat(parseFloat(this.allreportdata[i].cost/1000000).toFixed(2)),
                    //                                'impressions':parseFloat(this.allreportdata[i].impressions),
                    //                                'clicks':parseFloat(this.allreportdata[i].clicks),
                    //                                'ctr':parseFloat(this.allreportdata[i].ctr),
                    //                                'averagecpc':parseFloat(parseFloat(this.allreportdata[i].averageCpc/1000000).toFixed(2)),
                    //                                'conversions':parseFloat(this.allreportdata[i].conversions),
                    //                                'costperconversion':parseFloat(parseFloat(this.allreportdata[i].costPerConversion/1000000).toFixed(2)),
                    //                                'conversionrate':parseFloat(this.allreportdata[i].conversionRate),
                    //                                'averageposition':parseFloat(this.allreportdata[i].averagePosition)
                    //                            }
                    //                        )
                    //                    }
                    this.initdata();
                    this.alldata1 = _.orderBy(this.alldata1, 'cost', 'desc');
                    this.changePage(1);
                });
            },
            exportData() {
                const that = this;
                console.log(this.$refs.table);
                const excel = this.exportExcel(this.$refs.table.$el, `${that.$t('GA.report_keywords')}.xlsx`);
                if (excel) {
                    console.log(excel);
                    // this.$notify.success('导出成功');
                }
                // const that = this;
                // this.$refs.table.exportCsv({
                //     filename: that.$t('GA.report_keywords'),
                //     columns: that.table_columns.map(item => {
                //         item.title = `\t${item.title}`;
                //         return item;
                //     }),
                //     data: that.alldata1.map(item => {
                //         Object.keys(item).forEach(key => item[key] = `\t${item[key]}`);
                //         return item;
                //     }),
                //     quoted: true
                // });
            },
            changegroups(selcol) {
                this.table_columns = [];
                let flag = 0;
                let index = 0;
                for (let i = 0; i < this.all_columns.length; i++) {
                    for (let j = 0; j < selcol.length; j++) {
                        if (this.all_columns[i].title == selcol[j]) {
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
                //                localStorage['adgroupcol']=selcol;
                //                localStorage['adgroupsel']=this.table_columns;
                //                console.log(this.table_columns);
                //                console.log(localStorage['adgroupsel']);
                //                console.log(localStorage['adgroupsel'].split(','));
                if (selcol.length === this.all_columns.length) {
                    this.indeterminate = false;
                    this.checkAll = true;
                } else if (selcol.length > 0) {
                    this.indeterminate = true;
                    this.checkAll = false;
                } else {
                    this.indeterminate = false;
                    this.checkAll = false;
                }
            },
            /* 全选列 */
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
            },
            changecon1() {
                switch (this.condition1) {
                    case this.$t('GA.keywords'):
                    case this.$t('GA.adGroup'):
                    case this.$t('GA.adSeries'):
                    case this.$t('GA.matchType'):
                    case this.$t('GA.keywordsStatus'):
                        this.conditionlist2 = [
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
                    case this.$t('GA.firstPageCpc'):
                    case this.$t('GA.topOfPageCpc'):
                        this.conditionlist2 = [
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
            addclick() {
                this.addcondition.push({
                    condition1: '',
                    conditionlist1: this.conditionlist1.slice(),
                    condition2: '',
                    conditionlist2: [
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
            addchangecon1(index) {
                switch (this.addcondition[index].condition1) {
                    case this.$t('GA.keywords'):
                    case this.$t('GA.adGroup'):
                    case this.$t('GA.adSeries'):
                    case this.$t('GA.matchType'):
                    case this.$t('GA.keywordsStatus'):
                        this.addcondition[index].conditionlist2 = [
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
                    case this.$t('GA.firstPageCpc'):
                    case this.$t('GA.topOfPageCpc'):
                        this.addcondition[index].conditionlist2 = [
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
            removeclick(index) {
                this.addcondition.splice(index, 1);
            },
            /* 筛选字段-检索 */
            searchdata() {
                this.loading = true;
                getAdsReport({
                    orgId: this.enterpriseId,
                    reportType: 4,
                    displayType: 1,
                    startDate: this.startDate,
                    endDate: this.endDate,
                    clientCustomerId: this.adsAccountId
                }).then(res => {
                    /* 加载图标 */
                    this.loading = false;
                    this.allreportdata = Array.isArray(res.data) ? res.data : [];
                    this.totalpage = this.allreportdata.length;
                    this.maxpagenum = Math.ceil(this.allreportdata.length / this.pagesize);
                    this.alldata1 = [];
                    console.log(this.allreportdata);
                    //                    for(var i=0;i<this.allreportdata.length;i++){
                    //                        switch(this.allreportdata[i].adGroupStatus){
                    //                            case 'unknown':
                    //                                this.status='未知';
                    //                                break;
                    //                            case 'enabled':
                    //                                this.status='启用';
                    //                                break;
                    //                            case 'paused':
                    //                                this.status='暂停';
                    //                                break;
                    //                            case 'removed':
                    //                                this.status='移除';
                    //                                break;
                    //                        }
                    //                        this.alldata1.push(
                    //                            {
                    //                                'adgroup':this.allreportdata[i].adGroupName,
                    //                                'status':this.status,
                    //                                'adseries':this.allreportdata[i].campaignName,
                    //                                'cost':parseFloat(parseFloat(this.allreportdata[i].cost/1000000).toFixed(2)),
                    //                                'impressions':parseFloat(this.allreportdata[i].impressions),
                    //                                'clicks':parseFloat(this.allreportdata[i].clicks),
                    //                                'ctr':parseFloat(this.allreportdata[i].ctr),
                    //                                'averagecpc':parseFloat(parseFloat(this.allreportdata[i].averageCpc/1000000).toFixed(2)),
                    //                                'conversions':parseFloat(this.allreportdata[i].conversions),
                    //                                'costperconversion':parseFloat(parseFloat(this.allreportdata[i].costPerConversion/1000000).toFixed(2)),
                    //                                'conversionrate':parseFloat(this.allreportdata[i].conversionRate),
                    //                                'averageposition':parseFloat(this.allreportdata[i].averagePosition)
                    //                            }
                    //                        )
                    //                    }
                    this.initdata();
                    this.alldata1 = _.orderBy(this.alldata1, 'cost', 'desc');
                    if (this.alldata1.length != 0) {
                        if (this.condition1 != '' && this.condition2 != '' && this.condition3 != '') {
                            this.conditiongroup(this.condition1, this.condition2, this.condition3);
                        }
                        this.addcondition.forEach(item => {
                            if (item.condition1 && item.condition2 && item.condition3) {
                                this.conditiongroup(item.condition1, item.condition2, item.condition3);
                            }
                        });
                        this.totalpage = this.alldata1.length;
                        this.maxpagenum = Math.ceil(this.alldata1.length / this.pagesize);
                        this.changePage(1);
                    } else {
                        this.data1 = [];
                    }

                    //                    this.data1=this.reportdata;
                    //                    this.allreportdata=this.reportdata;
                });
            },
            /* 字段条件组合 */
            conditiongroup(con1, con2, con3) {
                this.reportdata1 = [];
                switch (con1) {
                    case this.$t('GA.keywords'):
                        this.keysearch('keyword', con2, con3);
                        break;
                    case this.$t('GA.adGroup'):
                        //                        switch(con2){
                        //                            case this.$t('GA.con_include'):
                        //                                for(var i=0;i<this.alldata1.length;i++){
                        //                                    if(this.alldata1[i].adgroup.indexOf(con3)!=-1){
                        //                                        this.reportdata1.push(this.alldata1[i]);
                        //                                    }
                        //                                }
                        //                                break;
                        //                            case this.$t('GA.con_exclude'):
                        //                                for(var i=0;i<this.alldata1.length;i++){
                        //                                    if(this.alldata1[i].adgroup.indexOf(con3)==-1){
                        //                                        this.reportdata1.push(this.alldata1[i]);
                        //                                    }
                        //                                }
                        //                                break;
                        //                            default:
                        //                                break;
                        //                        }
                        this.keysearch('adgroup', con2, con3);
                        break;
                    case this.$t('GA.adSeries'):
                        //                        switch(con2){
                        //                            case this.$t('GA.con_include'):
                        //                                for(var i=0;i<this.alldata1.length;i++){
                        //                                    if(this.alldata1[i].adseries.indexOf(con3)!=-1){
                        //                                        this.reportdata1.push(this.alldata1[i]);
                        //                                    }
                        //                                }
                        //                                break;
                        //                            case this.$t('GA.con_exclude'):
                        //                                for(var i=0;i<this.alldata1.length;i++){
                        //                                    if(this.alldata1[i].adseries.indexOf(con3)==-1){
                        //                                        this.reportdata1.push(this.alldata1[i]);
                        //                                    }
                        //                                }
                        //                                break;
                        //                            default:
                        //                                break;
                        //                        }
                        this.keysearch('adseries', con2, con3);
                        break;
                    case this.$t('GA.matchType'):
                        this.keysearch('matchway', con2, con3);
                        break;
                    case this.$t('GA.keywordsStatus'):
                        this.keysearch('keystatus', con2, con3);
                        break;
                    case this.$t('GA.cost'):
                        this.numsearch('cost', con2, con3);
                        break;
                    case this.$t('GA.impressions'):
                        this.numsearch('impressions', con2, con3);
                        break;
                    case this.$t('GA.clicks'):
                        this.numsearch('clicks', con2, con3);
                        break;
                    case this.$t('GA.ctr'):
                        this.numsearch('ctr', con2, con3);
                        break;
                    case this.$t('GA.averageCpc'):
                        this.numsearch('averagecpc', con2, con3);
                        break;
                    case this.$t('GA.conversions'):
                        this.numsearch('conversions', con2, con3);
                        break;
                    case this.$t('GA.costPerConversion'):
                        this.numsearch('costperconversion', con2, con3);
                        break;
                    case this.$t('GA.conversionRate'):
                        this.numsearch('conversionrate', con2, con3);
                        break;
                    case this.$t('GA.averagePosition'):
                        this.numsearch('averageposition', con2, con3);
                        break;
                    case this.$t('GA.firstPageCpc'):
                        this.numsearch('firstPageCpc', con2, con3);
                        break;
                    case this.$t('GA.topOfPageCpc'):
                        this.numsearch('topOfPageCpc', con2, con3);
                        break;
                    default:
                        break;
                }
                this.alldata1 = this.reportdata1;
            },
            keysearch(key, con2, con3) {
                switch (con2) {
                    case this.$t('GA.con_include'):
                        this.alldata1.forEach(item => {
                            const val = item ? (item[key] || '') : '';
                            if (val.includes(con3)) {
                                this.reportdata1.push(item);
                            }
                        });
                        break;
                    case this.$t('GA.con_exclude'):
                        this.alldata1.forEach(item => {
                            const val = item ? (item[key] || '') : '';
                            if (!val.includes(con3)) {
                                this.reportdata1.push(item);
                            }
                        });
                        break;
                    default:
                        break;
                }
            },
            numsearch(key, con2, con3) {
                if (isNaN(con3) == false) {
                    switch (con2) {
                        case this.$t('GA.con_lessThan'):
                            for (var i = 0; i < this.alldata1.length; i++) {
                                if (parseFloat(this.alldata1[i][key]) < parseFloat(con3)) {
                                    this.reportdata1.push(this.alldata1[i]);
                                }
                            }
                            break;
                        case this.$t('GA.con_lessOrEqual'):
                            for (var i = 0; i < this.alldata1.length; i++) {
                                if (parseFloat(this.alldata1[i][key]) <= parseFloat(con3)) {
                                    this.reportdata1.push(this.alldata1[i]);
                                }
                            }
                            break;
                        case this.$t('GA.con_equal'):
                            for (var i = 0; i < this.alldata1.length; i++) {
                                if (parseFloat(this.alldata1[i][key]) == parseFloat(con3)) {
                                    this.reportdata1.push(this.alldata1[i]);
                                }
                            }
                            break;
                        case this.$t('GA.con_greaterOrEqual'):
                            for (var i = 0; i < this.alldata1.length; i++) {
                                if (parseFloat(this.alldata1[i][key]) >= parseFloat(con3)) {
                                    this.reportdata1.push(this.alldata1[i]);
                                }
                            }
                            break;
                        case this.$t('GA.con_greaterThan'):
                            for (var i = 0; i < this.alldata1.length; i++) {
                                if (parseFloat(this.alldata1[i][key]) > parseFloat(con3)) {
                                    this.reportdata1.push(this.alldata1[i]);
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
                this.addcondition = [];
            },
            conditionshow() {
                if (this.filtershow) {
                    this.filtershow = false;
                } else {
                    this.filtershow = true;
                }
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
                    this.alldata1 = _.orderBy(this.alldata1, a.prop, order);
                } else {
                    this.alldata1 = _.orderBy(this.alldata1, 'cost', 'desc');
                }
                this.changePage(1);
            }
        }
    };
</script>

<style scoped>
    .title{
        font-size:18px;
        color:#333333;
        line-height:60px;
    }
    .datewrap .table-filter-item {
        padding: 10px;
    }
    /*.pagewrap{*/
    /*position:absolute;*/
    /*left:50%;*/
    /*transform:translate(-50%,0);*/
    /*margin-bottom:20px;*/
    /*}*/
    .pagewrap {
        width: 100%;
        text-align: center;
    }
    .datewrap{
        margin-bottom:15px;
    }
    .datewrap>span{
        float:right;
        position:relative;
    }
    .condition>h3{
        margin-bottom:10px;
    }
    .conditionmain>div{
        width:125px;
        display:inline-block;
    }
    .conditionwrap{
        max-height:136px;
        overflow:auto;
    }
    ::-webkit-scrollbar
    {
        width: 4px;
        height: 10px;
        background-color: #c9c9c9;
    }
    ::-webkit-scrollbar-track
    {
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
        border-radius: 2px;
        background-color: #c9c9c9;
    }
    ::-webkit-scrollbar-thumb
    {
        border-radius: 5px;
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
        background-color: #fc8b2f;
    }
</style>
<style>
    .ivu-checkbox-group {
        white-space: normal;
    }
    /*.tabmain>.ivu-table td,.tabmain>.ivu-table th{*/
    /*text-align:center;*/
    /*}*/
    .tabmain>.ivu-table th{
        font-size:14px;
    }
    /*.tabmain>.ivu-table tbody tr:hover td{*/
    /*    background:#f8f8f9;*/
    /*    color:#FA8241;*/
    /*}*/
    .checkboxgroup>label{
        display:block;
        margin-bottom:5px;
    }
    .conditionmain>.ivu-select .ivu-select-dropdown{
        max-height:140px;
    }
    .tabmain>ivu-table .ivu-table-body table ::-webkit-scrollbar {
        width: 4px;
        height: 10px;
        background-color: #c9c9c9;
    }
    .tabmain>ivu-table .ivu-table-body table ::-webkit-scrollbar-track
    {
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
        border-radius: 2px;
        background-color: #c9c9c9;
    }
    .tabmain>ivu-table .ivu-table-body table ::-webkit-scrollbar-thumb
    {
        border-radius: 5px;
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
        background-color: #fc8b2f;
    }
</style>
