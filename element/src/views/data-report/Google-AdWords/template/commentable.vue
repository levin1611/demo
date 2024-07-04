<template>
    <div class="table_wrap">
        <div class="datewrap">
            <DatePicker @on-change="changeDate" :clearable="true"
                :picker-options="options2"
                :value="datevalue"
                format="yyyy-MM-dd" type="daterange"
                placement="bottom-start" :placeholder="$t('GA.tip_selectDate')"
                style="width: 200px"></DatePicker>
            <span>
                <Button type="text" icon="funnel" @click="conditionshow()">{{ $t('GA.filter') }}</Button>
                <div class="filtercol" v-show="filtershow">
                    <div class="extensiondevice">
                        <h3>{{ $t('GA.extensionDevice') }}</h3>
                        <Checkbox
                                :indeterminate="indeterminate1"
                                :value="checkAll1"
                                @click.prevent.native="handleCheckAll1"
                                class="alldevice">{{ $t('GA.all') }}</Checkbox>
                        <CheckboxGroup v-model="checkAllGroup1"
                                       @change="checkAllGroupChange1">
                            <Checkbox v-for="item in allDeviceType"
                                      :key="item"
                                      :label="item"></Checkbox>
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
                            <CheckboxGroup v-model="checkAllGroup2"
                                           @change="checkAllGroupChange2">
                                        <Checkbox v-for="item in allAdNetworkType"
                                                  :key="item"
                                                  :label="item"></Checkbox>
                            </CheckboxGroup>
                        </div>
                    </div>
                    <div class="condition">
                        <h3>{{ $t('GA.searchCondition') }}</h3>
                        <div class="conditionmain">
                            <Select v-model="condition1" style="width:120px;margin-right:15px;float:left;" size="small" @on-change="changecon1()">
                                <Option v-for="item in conditionlist1" :value="item.value" :key="item.value">{{ item.label }}</Option>
                            </Select>
                            <Select v-model="condition2" style="width:90px;margin-right:15px;float:left;" size="small">
                                <Option v-for="item in conditionlist2" :value="item.value" :key="item.value">{{ item.label }}</Option>
                            </Select>
                            <div style="margin-bottom:10px;">
                                <Input v-model="condition3" size="small" :placeholder="$t('GA.tip_addKeywords')" style="width:100px;margin-right:5px;"></Input>
                                <span @click="addclick()">
                                    <!-- <Icon type="plus-circled" size="15" color="#FA8241" style='cursor:pointer;display:inline-block;'></Icon> -->
                                    <Icon  size="15" class="custom custom-add-circle"  style='cursor:pointer;display:inline-block;'></Icon>
                                </span>
                            </div>
                        </div>
                        <div class="conditionwrap">
                            <div v-for="(add,index) in addcondition" class="conditionmain">
                                <Select v-model="add.condition1" style="width:120px;margin-right:15px;float:left;" size="small" @on-change="addchangecon1(index)">
                                    <Option v-for="item in add.conditionlist1" :value="item.value" :key="item.value">{{ item.label }}</Option>
                                </Select>
                                <Select v-model="add.condition2" style="width:90px;margin-right:15px;float:left;" size="small">
                                    <Option v-for="item in add.conditionlist2" :value="item.value" :key="item.value">{{ item.label }}</Option>
                                </Select>
                                <div style="margin-bottom:10px;">
                                    <Input v-model="add.condition3" size="small" :placeholder="$t('GA.tip_addKeywords')" style="width:100px;margin-right:5px;"></Input>
                                    <span @click="removeclick(index)">
                                        <!-- <Icon type="minus-circled" size="15" color="#FA8241" style='cursor:pointer;display:inline-block;'></Icon> -->
                                        <Icon size="15" class="custom custom-reduce-circle" style='cursor:pointer;display:inline-block;'></Icon>
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
                <Button type="text" icon="navicon-round" @click="changecol">{{ $t('GA.editColumns') }}</Button>
                <div class="changecol" v-show="changecolshow">
                    <Checkbox
                            :indeterminate="indeterminate"
                            :value="checkAll"
                            @click.prevent.native="handleCheckAll" style="margin-bottom:5px;">{{ $t('GA.selectAll') }}</Checkbox>
                    <Checkbox-group v-model="allgroup" @on-change="changegroups" class="checkboxgroup">
                        <Checkbox :label="$t('GA.adGroup')">{{ $t('GA.adGroup') }}</Checkbox>
                        <Checkbox :label="$t('GA.status')">{{ $t('GA.status') }}</Checkbox>
                        <Checkbox :label="$t('GA.adSeries')">{{ $t('GA.adSeries') }}</Checkbox>
                        <Checkbox :label="$t('GA.cost')">{{ $t('GA.cost') }}</Checkbox>
                        <Checkbox :label="$t('GA.impressions')">{{ $t('GA.impressions') }}</Checkbox>
                        <Checkbox :label="$t('GA.clicks')">{{ $t('GA.clicks') }}</Checkbox>
                        <Checkbox :label="$t('GA.ctr')">{{ $t('GA.ctr') }}</Checkbox>
                        <Checkbox :label="$t('GA.averageCpc')">{{ $t('GA.averageCpc') }}</Checkbox>
                        <Checkbox :label="$t('GA.conversions')">{{ $t('GA.conversions') }}</Checkbox>
                        <Checkbox :label="$t('GA.costPerConversion')">{{ $t('GA.costPerConversion') }}</Checkbox>
                        <Checkbox :label="$t('GA.conversionRate')">{{ $t('GA.conversionRate') }}</Checkbox>
                        <Checkbox :label="$t('GA.averagePosition')">{{ $t('GA.averagePosition') }}</Checkbox>
                    </Checkbox-group>
                </div>
                <Button type="text" icon="arrow-down-c" @click="exportData()">{{ $t('GA.exportData') }}</Button>
            </span>
        </div>
        <div class="table">
            <Table @on-sort-change="changesort" ref="table" :columns="columns1" :data="data1" :loading="loading" class="tabmain" height="400"></Table>
            <div style="margin: 10px;overflow: hidden">
                <div class="pagewrap">
                    <Page :page-sizes="pagesizeopts" @on-page-size-change="pagesizechange" :total="totalpage" :current="curpage" @on-change="changePage" show-total show-sizer show-elevator placement="top"></Page>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import util from '../../../../libs/util';
    import _ from 'lodash';

    export default {
        name: 'commentable',
        data() {
            return {
                loading: true,
                columns1: [
                    {
                        title: this.$t('GA.adGroup'),
                        key: 'adgroup',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.status'),
                        key: 'status',
                        width: 100,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.adSeries'),
                        key: 'adseries',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.cost'),
                        key: 'cost',
                        width: 150,
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
                        width: 100,
                        sortable: true
                    }
                ],
                allcolumns: [
                    {
                        title: this.$t('GA.adGroup'),
                        key: 'adgroup',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.status'),
                        key: 'status',
                        width: 100,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.adSeries'),
                        key: 'adseries',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: this.$t('GA.cost'),
                        key: 'cost',
                        width: 150,
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
                        width: 100,
                        sortable: true
                    }
                ],
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
                                start.setTime(start.getTime() - (start.getDay() - 1) * 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('GA.lastWeek'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(end.getTime() - end.getDay() * 24 * 60 * 60 * 1000);
                                start.setTime(start.getTime() - (start.getDay() + 6) * 24 * 60 * 60 * 1000);
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
                enterpriseId: 0,
                allgroup: [this.$t('GA.adGroup'), this.$t('GA.status'), this.$t('GA.adSeries'), this.$t('GA.cost'), this.$t('GA.impressions'), this.$t('GA.clicks'), this.$t('GA.ctr'), this.$t('GA.averageCpc'), this.$t('GA.conversions'), this.$t('GA.costPerConversion'), this.$t('GA.conversionRate'), this.$t('GA.averagePosition')],
                indeterminate: false,
                checkAll: true,
                changecolshow: false,
                indeterminate1: false,
                checkAll1: true,
                allDeviceType: [this.$t('GA.computer'), this.$t('GA.mobileDevice'), this.$t('GA.tablet'), this.$t('GA.deviceType.CONNECTED_TV')],
                checkAllGroup1: [this.$t('GA.computer'), this.$t('GA.mobileDevice'), this.$t('GA.tablet'), this.$t('GA.deviceType.CONNECTED_TV')],
                device: 'UNKNOWN,DESKTOP,HIGH_END_MOBILE,TABLET,CONNECTED_TV',
                indeterminate2: false,
                checkAll2: true,
                allAdNetworkType: [this.$t('GA.searchNet'), this.$t('GA.adNet'), this.$t('GA.YouTubeSearch'), this.$t('GA.YouTubeVideo'), this.$t('GA.adNetworkType.MIXED')],
                checkAllGroup2: [this.$t('GA.searchNet'), this.$t('GA.adNet'), this.$t('GA.YouTubeSearch'), this.$t('GA.YouTubeVideo'), this.$t('GA.adNetworkType.MIXED')],
                network: 'SEARCH,CONTENT,YOUTUBE_SEARCH,YOUTUBE_WATCH,MIXED',
                condition1: '',
                conditionlist1: [
                    {
                        value: this.$t('GA.adGroup'),
                        label: this.$t('GA.adGroup')
                    },
                    {
                        value: this.$t('GA.status'),
                        label: this.$t('GA.status')
                    },
                    {
                        value: this.$t('GA.adSeries'),
                        label: this.$t('GA.adSeries')
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
                exportdata: []
            };
        },
        created: function() {
            /* 初始化获取最近7天的数据表格 */
            this.enterpriseId = this.$store.state.enterpriseId;
            const endtime = new Date();
            const starttime = new Date();
            endtime.setTime(endtime.getTime() - 3600 * 1000 * 24 * 1);
            starttime.setTime(starttime.getTime() - 3600 * 1000 * 24 * 7);
            this.datevalue = [starttime, endtime];
            this.startDate = starttime.format('yyyy-MM-dd');
            this.endDate = endtime.format('yyyy-MM-dd');
            util.ajaxInternational({
                url: '/oversea/adsReport/getReport',
                method: 'post',
                data: {
                    orgId: this.enterpriseId,
                    reportType: 3,
                    displayType: 1,
                    startDate: this.startDate,
                    endDate: this.endDate
                }
            }).then(response => {
                this.loading = false;
                this.allreportdata = Array.isArray(response.data.data) ? response.data.data : [];
                this.totalpage = this.allreportdata.length;
                this.maxpagenum = Math.ceil(this.allreportdata.length / this.pagesize);
                for (let i = 0; i < this.allreportdata.length; i++) {
                    switch (this.allreportdata[i].adGroupStatus) {
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
                    }
                    this.alldata1.push({
                        adgroup: this.allreportdata[i].adGroupName,
                        status: this.status,
                        adseries: this.allreportdata[i].campaignName,
                        cost: parseFloat(parseFloat(this.allreportdata[i].cost / 1000000).toFixed(2)),
                        impressions: parseFloat(this.allreportdata[i].impressions),
                        clicks: parseFloat(this.allreportdata[i].clicks),
                        ctr: parseFloat(this.allreportdata[i].ctr),
                        averagecpc: parseFloat(parseFloat(this.allreportdata[i].averageCpc / 1000000).toFixed(2)),
                        conversions: parseFloat(this.allreportdata[i].conversions),
                        costperconversion: parseFloat(parseFloat(this.allreportdata[i].costPerConversion / 1000000).toFixed(2)),
                        conversionrate: parseFloat(this.allreportdata[i].conversionRate),
                        averageposition: parseFloat(this.allreportdata[i].averagePosition)
                    });
                }
                this.alldata1 = _.orderBy(this.alldata1, 'cost', 'desc');
                this.changePage(1);
            });
        },
        methods: {
            /* 改变每页条数 */
            pagesizechange(pagesize) {
                console.log(pagesize);
                this.pagesize = pagesize;
                this.data1 = [];
                this.curpage = 1;
                this.maxpagenum = Math.ceil(this.alldata1.length / pagesize);
                //                if(this.pagenum<this.maxpagenum){
                console.log(this.pagesize);
                this.changecontent(0, this.pagesize);
                //                }else{
                //                    this.changecontent(0,this.alldata1.length);
                //                }
            },
            /* 当前页显示内容 */
            changecontent(pagenumstart, pagenumend) {
                for (let i = pagenumstart; i < pagenumend; i++) {
                    //                    switch(this.reportdata[i].adGroupStatus){
                    //                        case 'unknown':
                    //                            this.status='未知';
                    //                            break;
                    //                        case 'enabled':
                    //                            this.status='启用';
                    //                            break;
                    //                        case 'paused':
                    //                            this.status='暂停';
                    //                            break;
                    //                        case 'removed':
                    //                            this.status='移除';
                    //                            break;
                    //                    }
                    this.alldata1[i] && this.data1.push(this.alldata1[i]
                        //                        {
                        //                            'adgroup':this.reportdata[i].adGroupName,
                        //                            'status':this.status,
                        //                            'adseries':this.reportdata[i].campaignName,
                        //                            'cost':parseFloat(this.reportdata[i].cost/1000000).toFixed(2),
                        //                            'impressions':parseFloat(this.reportdata[i].impressions),
                        //                            'clicks':parseFloat(this.reportdata[i].clicks),
                        //                            'ctr':parseFloat(this.reportdata[i].ctr),
                        //                            'averagecpc':parseFloat(this.reportdata[i].averageCpc/1000000).toFixed(2),
                        //                            'conversions':parseFloat(this.reportdata[i].conversions),
                        //                            'costperconversion':parseFloat(this.reportdata[i].costPerConversion/1000000).toFixed(2),
                        //                            'conversionrate':parseFloat(this.reportdata[i].conversionRate),
                        //                            'averageposition':parseFloat(this.reportdata[i].averagePosition)
                        //                        }
                    );
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
                this.loading = true;
                this.startDate = date[0];
                this.endDate = date[1];
                util.ajaxInternational({
                    url: '/oversea/adsReport/getReport',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        reportType: 3,
                        displayType: 1,
                        startDate: date[0],
                        endDate: date[1]
                    }
                }).then(response => {
                    this.loading = false;
                    this.allreportdata = Array.isArray(response.data.data) ? response.data.data : [];
                    this.totalpage = this.allreportdata.length;
                    this.maxpagenum = Math.ceil(this.allreportdata.length / this.pagesize);
                    this.alldata1 = [];
                    for (let i = 0; i < this.allreportdata.length; i++) {
                        switch (this.allreportdata[i].adGroupStatus) {
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
                        }
                        this.alldata1.push({
                            adgroup: this.allreportdata[i].adGroupName,
                            status: this.status,
                            adseries: this.allreportdata[i].campaignName,
                            cost: parseFloat(parseFloat(this.allreportdata[i].cost / 1000000).toFixed(2)),
                            impressions: parseFloat(this.allreportdata[i].impressions),
                            clicks: parseFloat(this.allreportdata[i].clicks),
                            ctr: parseFloat(this.allreportdata[i].ctr),
                            averagecpc: parseFloat(parseFloat(this.allreportdata[i].averageCpc / 1000000).toFixed(2)),
                            conversions: parseFloat(this.allreportdata[i].conversions),
                            costperconversion: parseFloat(parseFloat(this.allreportdata[i].costPerConversion / 1000000).toFixed(2)),
                            conversionrate: parseFloat(this.allreportdata[i].conversionRate),
                            averageposition: parseFloat(this.allreportdata[i].averagePosition)
                        });
                    }
                    this.alldata1 = _.orderBy(this.alldata1, 'cost', 'desc');
                    this.changePage(1);
                });
            },
            exportData() {
                const that = this;
                //                for(var i=0;i<this.reportdata.length;i++){
                //                    switch(this.reportdata[i].adGroupStatus){
                //                        case 'unknown':
                //                            this.status='未知';
                //                            break;
                //                        case 'enabled':
                //                            this.status='启用';
                //                            break;
                //                        case 'paused':
                //                            this.status='暂停';
                //                            break;
                //                        case 'removed':
                //                            this.status='移除';
                //                            break;
                //                    }
                //                    this.exportdata.push({
                //                        'adgroup':this.reportdata[i].adGroupName,
                //                        'status':this.status,
                //                        'adseries':this.reportdata[i].campaignName,
                //                        'cost':parseFloat(this.reportdata[i].cost),
                //                        'impressions':parseFloat(this.reportdata[i].impressions),
                //                        'clicks':parseFloat(this.reportdata[i].clicks),
                //                        'ctr':parseFloat(this.reportdata[i].ctr),
                //                        'averagecpc':parseFloat(this.reportdata[i].averageCpc),
                //                        'conversions':parseFloat(this.reportdata[i].conversions),
                //                        'costperconversion':parseFloat(this.reportdata[i].costPerConversion),
                //                        'conversionrate':parseFloat(this.reportdata[i].conversionRate),
                //                        'averageposition':parseFloat(this.reportdata[i].averagePosition)
                //                    })
                //                }
                console.log(this.alldata1);
                this.$refs.table.exportCsv({
                    filename: 'The original data',
                    columns: that.columns1.map(item => {
                        item.title = `\t${item.title}`;
                        return item;
                    }),
                    data: that.alldata1.map(item => {
                        Object.keys(item).forEach(key => item[key] = `\t${item[key]}`);
                        return item;
                    }),
                    quoted: true
                });
            },
            changegroups(selcol) {
                this.columns1 = [];
                let flag = 0;
                let index = 0;
                for (let i = 0; i < this.allcolumns.length; i++) {
                    for (let j = 0; j < selcol.length; j++) {
                        if (this.allcolumns[i].title == selcol[j]) {
                            flag = 1;
                            index = i;
                            break;
                        }
                    }
                    if (flag) {
                        this.columns1.push(this.allcolumns[i]);
                        flag = 0;
                    }
                }
                //                localStorage['adgroupcol']=selcol;
                //                localStorage['adgroupsel']=this.columns1;
                //                console.log(this.columns1);
                //                console.log(localStorage['adgroupsel']);
                //                console.log(localStorage['adgroupsel'].split(','));
                if (selcol.length === this.allcolumns.length) {
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
            handleCheckAll() {
                if (this.indeterminate) {
                    this.checkAll = false;
                } else {
                    this.checkAll = !this.checkAll;
                }
                this.indeterminate = false;

                if (this.checkAll) {
                    this.allgroup = [this.$t('GA.adGroup'), this.$t('GA.status'), this.$t('GA.adSeries'), this.$t('GA.cost'), this.$t('GA.impressions'), this.$t('GA.clicks'), this.$t('GA.ctr'), this.$t('GA.averageCpc'), this.$t('GA.conversions'), this.$t('GA.costPerConversion'), this.$t('GA.conversionRate'), this.$t('GA.averagePosition')];
                    this.columns1 = this.allcolumns;
                } else {
                    this.allgroup = [];
                    this.columns1 = [];
                }
            },
            changecol() {
                if (this.changecolshow) {
                    this.changecolshow = false;
                } else {
                    this.changecolshow = true;
                }
            },
            /* 推广设备全选 */
            handleCheckAll1() {
                if (this.indeterminate1) {
                    this.checkAll1 = false;
                } else {
                    this.checkAll1 = !this.checkAll1;
                }
                this.indeterminate1 = false;

                if (this.checkAll1) {
                    this.checkAllGroup1 = this.allDeviceType.slice();
                    this.device = 'UNKNOWN,DESKTOP,HIGH_END_MOBILE,TABLET,CONNECTED_TV';
                    //                    this.columns1=this.allcolumns;
                } else {
                    this.checkAllGroup1 = [];
                    this.device = 'UNKNOWN';
                    //                    this.columns1=[];
                }
            },
            /* 推广设备单选 */
            checkAllGroupChange1(selcol) {
                if (selcol.length === this.allDeviceType.length) {
                    this.indeterminate1 = false;
                    this.checkAll1 = true;
                } else if (selcol.length > 0) {
                    this.indeterminate1 = true;
                    this.checkAll1 = false;
                } else {
                    this.indeterminate1 = false;
                    this.checkAll1 = false;
                }
                const devicearray = ['UNKNOWN'];
                if (selcol.indexOf(this.$t('GA.computer')) != -1) {
                    devicearray.push('DESKTOP');
                }
                if (selcol.indexOf(this.$t('GA.mobileDevice')) != -1) {
                    devicearray.push('HIGH_END_MOBILE');
                }
                if (selcol.indexOf(this.$t('GA.tablet')) != -1) {
                    devicearray.push('TABLET');
                }
                if (selcol.indexOf(this.$t('GA.deviceType.CONNECTED_TV')) != -1) {
                    devicearray.push('CONNECTED_TV');
                }
                this.device = devicearray.join();
            },
            /* 投放网络全选 */
            handleCheckAll2() {
                if (this.indeterminate2) {
                    this.checkAll2 = false;
                } else {
                    this.checkAll2 = !this.checkAll2;
                }
                this.indeterminate2 = false;

                if (this.checkAll2) {
                    this.checkAllGroup2 = this.allAdNetworkType.slice();
                    this.network = 'SEARCH,CONTENT,YOUTUBE_SEARCH,YOUTUBE_WATCH,MIXED';
                    //                    this.columns1=this.allcolumns;
                } else {
                    this.checkAllGroup2 = [];
                    this.network = '';
                    //                    this.columns1=[];
                }
            },
            /* 投放网络单选 */
            checkAllGroupChange2(selcol) {
                if (selcol.length === this.allAdNetworkType.length) {
                    this.indeterminate2 = false;
                    this.checkAll2 = true;
                } else if (selcol.length > 0) {
                    this.indeterminate2 = true;
                    this.checkAll2 = false;
                } else {
                    this.indeterminate2 = false;
                    this.checkAll2 = false;
                }
                const networkarray = [];
                if (selcol.indexOf(this.$t('GA.searchNet')) != -1) {
                    networkarray.push('SEARCH');
                }
                if (selcol.indexOf(this.$t('GA.adNet')) != -1) {
                    networkarray.push('CONTENT');
                }
                if (selcol.indexOf(this.$t('GA.YouTubeSearch')) != -1) {
                    networkarray.push('YOUTUBE_SEARCH');
                }
                if (selcol.indexOf(this.$t('GA.YouTubeVideo')) != -1) {
                    networkarray.push('YOUTUBE_WATCH');
                }
                if (selcol.indexOf(this.$t('GA.adNetworkType.MIXED')) != -1) {
                    networkarray.push('MIXED');
                }
                this.network = networkarray.join();
            },
            changecon1() {
                switch (this.condition1) {
                    case this.$t('GA.adGroup'):
                    case this.$t('GA.status'):
                    case this.$t('GA.adSeries'):
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
                    conditionlist1: [
                        {
                            value: this.$t('GA.adGroup'),
                            label: this.$t('GA.adGroup')
                        },
                        {
                            value: this.$t('GA.status'),
                            label: this.$t('GA.status')
                        },
                        {
                            value: this.$t('GA.adSeries'),
                            label: this.$t('GA.adSeries')
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
                    condition3: ''
                });
            },
            addchangecon1(index) {
                switch (this.addcondition[index].condition1) {
                    case this.$t('GA.adGroup'):
                    case this.$t('GA.status'):
                    case this.$t('GA.adSeries'):
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
                util.ajaxInternational({
                    url: '/oversea/adsReport/getReport',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        reportType: 3,
                        displayType: 1,
                        startDate: this.startDate,
                        endDate: this.endDate,
                        device: this.device,
                        network: this.network
                    }
                }).then(response => {
                    /* 加载图标 */
                    this.loading = false;
                    this.allreportdata = Array.isArray(response.data.data) ? response.data.data : [];
                    this.totalpage = this.allreportdata.length;
                    this.maxpagenum = Math.ceil(this.allreportdata.length / this.pagesize);
                    this.alldata1 = [];
                    console.log(this.allreportdata);
                    for (let i = 0; i < this.allreportdata.length; i++) {
                        switch (this.allreportdata[i].adGroupStatus) {
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
                        }
                        this.alldata1.push({
                            adgroup: this.allreportdata[i].adGroupName,
                            status: this.status,
                            adseries: this.allreportdata[i].campaignName,
                            cost: parseFloat(parseFloat(this.allreportdata[i].cost / 1000000).toFixed(2)),
                            impressions: parseFloat(this.allreportdata[i].impressions),
                            clicks: parseFloat(this.allreportdata[i].clicks),
                            ctr: parseFloat(this.allreportdata[i].ctr),
                            averagecpc: parseFloat(parseFloat(this.allreportdata[i].averageCpc / 1000000).toFixed(2)),
                            conversions: parseFloat(this.allreportdata[i].conversions),
                            costperconversion: parseFloat(parseFloat(this.allreportdata[i].costPerConversion / 1000000).toFixed(2)),
                            conversionrate: parseFloat(this.allreportdata[i].conversionRate),
                            averageposition: parseFloat(this.allreportdata[i].averagePosition)
                        });
                    }
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
                    case this.$t('GA.adGroup'):
                        switch (con2) {
                            case this.$t('GA.con_include'):
                                for (var i = 0; i < this.alldata1.length; i++) {
                                    if (this.alldata1[i].adgroup.indexOf(con3) != -1) {
                                        this.reportdata1.push(this.alldata1[i]);
                                    }
                                }
                                break;
                            case this.$t('GA.con_exclude'):
                                for (var i = 0; i < this.alldata1.length; i++) {
                                    if (this.alldata1[i].adgroup.indexOf(con3) == -1) {
                                        this.reportdata1.push(this.alldata1[i]);
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                        break;
                    case this.$t('GA.status'):
                        switch (con2) {
                            case this.$t('GA.con_include'):
                                for (var i = 0; i < this.alldata1.length; i++) {
                                    //                                    switch(this.alldata1[i].adGroupStatus){
                                    //                                        case 'unknown':
                                    //                                            this.status='未知';
                                    //                                            break;
                                    //                                        case 'enabled':
                                    //                                            this.status='启用';
                                    //                                            break;
                                    //                                        case 'paused':
                                    //                                            this.status='暂停';
                                    //                                            break;
                                    //                                        case 'removed':
                                    //                                            this.status='移除';
                                    //                                            break;
                                    //                                    }
                                    if (this.alldata1[i].status.indexOf(con3) != -1) {
                                        this.reportdata1.push(this.alldata1[i]);
                                    }
                                }
                                break;
                            case this.$t('GA.con_exclude'):
                                for (var i = 0; i < this.alldata1.length; i++) {
                                    if (this.alldata1[i].status.indexOf(con3) == -1) {
                                        this.reportdata1.push(this.alldata1[i]);
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                        break;
                    case this.$t('GA.adSeries'):
                        switch (con2) {
                            case this.$t('GA.con_include'):
                                for (var i = 0; i < this.alldata1.length; i++) {
                                    if (this.alldata1[i].adseries.indexOf(con3) != -1) {
                                        this.reportdata1.push(this.alldata1[i]);
                                    }
                                }
                                break;
                            case this.$t('GA.con_exclude'):
                                for (var i = 0; i < this.alldata1.length; i++) {
                                    if (this.alldata1[i].adseries.indexOf(con3) == -1) {
                                        this.reportdata1.push(this.alldata1[i]);
                                    }
                                }
                                break;
                            default:
                                break;
                        }
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
                    default:
                        break;
                }
                this.alldata1 = this.reportdata1;
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
    .changecol {
        position: absolute;
        background: #fff;
        border: 1px solid #ccc;
        top:35px;
        left:75px;
        z-index:999;
        border-radius:4px;
        -webkit-box-shadow: 0 0 4px rgba(0,0,0,.13);
        -moz-box-shadow: 0 0 4px rgba(0,0,0,.13);
        box-shadow: 0 0 4px rgba(0,0,0,.13);
        padding:15px 10px 10px 15px;
    }
    .changecol:after {
        position: absolute;
        display: inline-block;
        top: -4px;
        left: 75px;
        width: 0;
        height: 0;
        content: '';
        border-style: solid;
        border-width: 5px;
        border-color: #fff #fff transparent transparent;
        transform: rotate(-45deg);
        z-index:999;
        border-radius:2px;
        background-color: #fff;
        -webkit-box-shadow: 2px -2px 2px rgba(0,0,0,.13);
        -moz-box-shadow: 2px -2px 2px rgba(0,0,0,.13);
        box-shadow: 2px -2px 2px rgba(0,0,0,.13);
    }
    .filtercol{
        width:400px;
        position: absolute;
        background: #fff;
        border: 1px solid #ccc;
        top:35px;
        left:-140px;
        z-index:999;
        border-radius:4px;
        -webkit-box-shadow: 0 0 4px rgba(0,0,0,.13);
        -moz-box-shadow: 0 0 4px rgba(0,0,0,.13);
        box-shadow: 0 0 4px rgba(0,0,0,.13);
        padding:15px 10px 10px 15px;
    }
    .filtercol:after{
        position: absolute;
        display: inline-block;
        top: -4px;
        left: 190px;
        width: 0;
        height: 0;
        content: '';
        border-style: solid;
        border-width: 5px;
        border-color: #fff #fff transparent transparent;
        transform: rotate(-45deg);
        z-index:999;
        border-radius:2px;
        background-color: #fff;
        -webkit-box-shadow: 2px -2px 2px rgba(0,0,0,.13);
        -moz-box-shadow: 2px -2px 2px rgba(0,0,0,.13);
        box-shadow: 2px -2px 2px rgba(0,0,0,.13);
    }
    .onnetwork{
        overflow:hidden;
    }
    .extensiondevice>h3,.onnetwork>h3{
        float:left;
        margin-right:30px;
    }
    .extensiondevice label,.onnetwork label{
        margin-bottom:10px;
    }
    .alldevice,.allnetwork{
        float:left;
        margin:2px 15px 0 0;
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
</style>

<style>
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
</style>

