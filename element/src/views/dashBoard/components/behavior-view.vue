<template>
    <!-- <Card class="table_card _b_r" body-style="height:376px;padding: 20px 30px;"></Card> -->
    <Card v-loading="loading" style="background: #fff;height: 475px;">
        <!-- 顶部按钮 -->
        <div style="text-align: right;">
            <div class="dashboard-title" style="display: inline-block;margin-right: 5px;float: left;">{{$t('dashBoardV2.Title.behaviorView')}}</div>
            <Select v-if="workBenchType==='allInquiry'"
                    v-model="followUp_users"
                    multiple
                    filterable
                    collapse-tags
                    @change="refresh_data"
                    class="workBenchFollowUp"
                    :placeholder="$t('crm.WorkBench.tip_departmentUser')"
                    style="width: 220px;text-align: left;margin-right: 16px;">
                <Option v-for="item in depart_users_list" :value="item.key + ''" :label="item.value"></Option>
            </Select>
            <!-- <Select v-model="followUp_status"
                    multiple
                    filterable
                    collapse-tags
                    class="workBenchFollowUp"
                    @change="refresh_data"
                    :placeholder="$t('crm.WorkBench.tip_followUpStatus')"
                    style="width:220px;text-align: left;margin-right: 16px;"> -->
                <!-- <OptionGroup :label="$t('crm.WorkBench.activated')">
                    <Option v-for="item in computed_followUpStatus_using"
                            :key="item.attrId"
                            :value="item.attrId"
                            :label="item.attrName"></Option>
                </OptionGroup>
                <OptionGroup :label="$t('crm.WorkBench.terminated')">
                    <Option v-for="item in computed_followUpStatus_disabled"
                            :key="item.attrId"
                            :value="item.attrId"
                            :label="item.attrName"></Option>
                </OptionGroup> -->
                <!--<Option v-for="item in status_list" :value="item.attrId" :label="item.attrName"></Option>-->
            <!-- </Select> -->
            <DatePicker v-model="date_value"
                        type="daterange"
                        :picker-options="date_limit"
                        value-format="yyyy-MM-dd"
                        size="small"
                        @change="refresh_data"
                        :placeholder="$t('crm.WorkBench.tip_selectDate')"
                        style="width: 220px;"></DatePicker>

            <!-- 其他筛选条件 -->
            <div class="table_header_right" style="float: right;">
                <slot></slot>
            </div>

            <!-- 个人/管理 视图切换 -->
            <div class="table_header_right" style="float: right;">
                <Tabs type="card" v-model="workBenchType" class="table_header_tabs">
                    <TabPane name="myInquiry">
                        <div slot="label">
                            <span>{{$t('dashBoardV2.Table.personalView')}}</span>
                        </div>
                    </TabPane>
                    <TabPane name="allInquiry">
                        <div slot="label">
                            <span>{{$t('dashBoardV2.Table.manageView')}}</span>
                        </div>
                    </TabPane>
                </Tabs>
            </div>
            <!-- <Button icon="ivu-icon ivu-icon-ios-search-strong"
                    circle
                    size="small"
                    @click="refresh_data"
                    class="piwik_crm_workBench_search_behavior workbench-filterButton"></Button> -->
        </div>

        <!-- chart -->
        <div ref="followUp_chart" style="width: 100%; height: 320px; background: #fff;"></div>
        <br>

        <!-- table -->
        <!-- <Table ref="table"
               :data="table_data"
                :height="table_height"
                :isCustom="true"
                :customEmptyText="$t('crm.Table.noData')"
                customEmptyButtonText=""
                :customClearMethod="clearFilterConditionByInitView"
               v-loading="loading"
               class="tabmain">
            <TableColumn v-for="item in table_columns"
                         :key="item.key"
                         :prop="item.key"
                         :label="item.title"
                         :width="item.width"
                         :min-width="item.width || 64"
                         :formatter="item.formatter"
                         :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <template v-if="item.key === 'inquiryNo'">
                        <span @click="jumpToInquiry(scope.row.inquiryId)"
                              class="mouse-on-inquiry-comName">{{ scope.row[item.key] }}</span>
                    </template>
                    <template v-else-if="item.key === 'companyName'">
                        <span v-if="scope.row.companyName"
                              @click="jumpToCustomer(scope.row.companyId)"
                              class="mouse-on-inquiry-comName">{{ scope.row[item.key] }}</span>
                        <span v-else></span>
                    </template>
                    <template v-else-if="item.formatter">{{ (item.formatter)(scope.row) }}</template>
                    <template v-else>{{ scope.row[item.key] }}</template>
                </template>
            </TableColumn>
        </Table> -->

        <!-- <div style="text-align: right; margin: 10px 0;">
            <Page :total="page_total"
                  :page-sizes="pageSizeOpts"
                  :current-page="page_no"
                  :page-size="page_size"
                  layout="total, prev, pager, next, sizes, jumper"
                  @size-change="pageSizeChange"
                  @current-change="change_page"></Page>
        </div> -->
    </Card>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import Utils from '@/utils';
    import resetInitComponents from '@/mixins/resetComponentViewData';
    import { WorkBench } from '@/api/crm/index';
    const { getBehaviorView, getBehaviorViewList, getUserObjListExcludeDelete, getDepartUserByUserId } = WorkBench;

    export default {
        mixins: [resetInitComponents],
        name: 'followUp-view',
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height',
                button_list: state => state.app.button_list,
                allUsers: state => state.crm.allUsers // 全部用户
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            computed_followUpStatus_using() {
                return this.status_list ? this.status_list.filter(item => item.isAvailable === 1) : [];
            },
            computed_followUpStatus_disabled() {
                return this.status_list ? this.status_list.filter(item => item.isAvailable !== 1) : [];
            },
            table_height() {
                let temp = this.window_height ? this.window_height - 216 : document.body.clientHeight - 216;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            }
        },
        // props: [
        //     'workBenchType'
        // ],
        data() {
            return {
                /* 全局 */
                loading: false,
                // 接口请求条件
                filterConObj: {},

                /* 顶部筛选 */
                followUp_users: [],
                depart_users_list: [],
                followUp_status: [],
                status_list: [],
                workBenchType: 'myInquiry',
                date_value: [(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).format('yyyy-MM-dd'), (new Date()).format('yyyy-MM-dd')],
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
                },
                all_depart_users_list: [], // 获取全部部门人员包括已离职人员

                /* 图表 */
                chart: null,
                chart_option: {
                    color: Utils.chartColors_80per,
                    // title: {
                    //     text: this.$t('crm.WorkBench.amount'),
                    //     textStyle: {
                    //         fontWeight: 'bolder'
                    //     },
                    //     top: '5%',
                    //     left: 'center'
                    // },
                    grid: {
                        left: '5%',
                        right: '5%',
                        top: '10%'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    legend: {
                        show: false
                    },
                    calculable: true,
                    xAxis: [
                        {
                            type: 'category',
                            axisTick: { show: false },
                            axisLabel: {
                                interval: 0,
                                color: 'rgba(0, 0, 0, .8)',
                                lineHeight: 16,
                                formatter: function(params) {
                                    params = params.substr(0, 12);
                                    let newParamsName = ''; // 拼接后的新字符串
                                    const paramsNameNumber = params.length; // 实际标签数
                                    const provideNumber = 4; // 每行显示的字数
                                    const rowNumber = Math.ceil(paramsNameNumber / provideNumber); // 如需换回，算出要显示的行数

                                    if (paramsNameNumber > provideNumber) {
                                        /** 循环每一行,p表示行 */
                                        for (let i = 0; i < rowNumber; i++) {
                                            let tempStr = ''; // 每次截取的字符串
                                            const start = i * provideNumber; // 截取位置开始
                                            const end = start + provideNumber; // 截取位置结束

                                            // 最后一行的需要单独处理

                                            if (i == rowNumber - 1) {
                                                tempStr = params.substring(start, paramsNameNumber);
                                            } else {
                                                tempStr = `${params.substring(start, end)}\n`;
                                            }
                                            newParamsName += tempStr;
                                        }
                                    } else {
                                        newParamsName = params;
                                    }
                                    return newParamsName;
                                }
                            }, // 强制显示所有标签
                            axisLine: {
                                lineStyle: {
                                    color: '#eff0f4',
                                    width: 2
                                }
                            },
                            data: []
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            axisLine: {
                                show: false
                            },
                            axisTick: {
                                show: false
                            },
                            axisLabel: {
                                margin: 20
                            },
                            splitLine: {
                                show: true,
                                lineStyle: {
                                    color: '#eff0f4',
                                    type: 'dashed'
                                }
                            }
                        }
                    ],
                    series: [
                        {
                            name: this.$t('crm.WorkBench.amount'),
                            type: 'bar',
                            barWidth: '35px',
                            data: [],
                            label: {
                                show: true,
                                position: 'insideTop',
                                padding: [-26, 0, 0, 0],
                                formatter: row => {
                                    // 传入的数据实际是 data.max
                                    // 这里进行判断, 当前 data < max / 12 时, 少加一个 \n , 配合 padding 让 label 显示到柱顶部
                                    const temp = row.data.split('.');
                                    const data = temp[0];
                                    // const max = temp[1];
                                    if (data !== 0) {
                                        return `\n${data}`;
                                        // return data * 12 > max ? `\n\n${data}` : `\n${data}`;
                                    } else {
                                        return '';
                                    }
                                }
                            }
                        }
                    ]
                },
                type_list: {
                    1: this.$t('crm.WorkBench.phone'),
                    2: this.$t('crm.WorkBench.Email'),
                    3: this.$t('crm.WorkBench.WhatsApp'),
                    16: this.$t('crm.WorkBench.instagram'),
                    4: this.$t('crm.WorkBench.Facebook'),
                    5: this.$t('crm.WorkBench.weChat'),
                    6: this.$t('crm.WorkBench.LinkedIn'),
                    7: this.$t('crm.WorkBench.Twitter'),
                    8: this.$t('crm.WorkBench.Message'),
                    9: this.$t('crm.WorkBench.exhibition'),
                    10: this.$t('crm.WorkBench.customerVisiting'),
                    11: this.$t('crm.WorkBench.visitCustomer'),
                    12: this.$t('crm.WorkBench.websiteInteraction'),
                    13: this.$t('crm.Html.Skype'),
                    14: this.$t('crm.Html.Line'),
                    15: this.$t('crm.Html.others')
                },

                /* 表格 */
                // all_users_list: [],
                table_data: [],
                table_columns: [
                    {
                        title: this.$t('crm.WorkBench.col_seqNumber'),
                        key: 'inquiryNo'
                    },
                    {
                        title: this.$t('crm.WorkBench.col_companyName'),
                        key: 'companyName'
                    },
                    {
                        title: this.$t('crm.WorkBench.col_followUpType'),
                        key: 'followupTypeName'
                        // formatter: row => {
                        //     return this.type_list[row.followupType];
                        // }
                    },
                    {
                        title: this.$t('crm.WorkBench.col_followUpContent'),
                        key: 'followupContent',
                        width: 200
                    },
                    {
                        title: this.$t('crm.WorkBench.col_followUpCreateUser'),
                        key: 'createUser'
                    },
                    {
                        title: this.$t('crm.WorkBench.col_followUpTime'),
                        key: 'followupTime'
                    }
                ],
                page_size: 10,
                pageSizeOpts: [10, 50, 100, 200],
                page_no: 1,
                page_total: 0
            };
        },
        methods: {
            handleTabClick() {},
            /* 全局 */
            async refresh_data() {
                this.loading = true;
                // 获取图表数据
                // 获取表格数据
                // await Promise.all([this.get_chart_data(), this.get_table_data()]);
                await this.get_chart_data();
                this.loading = false;
            },

            /* 图表 */
            get_chart_data() {
                const vm = this;
                return new Promise(resolve => {
                    const postData = {
                        orgId: vm.enterpriseId,
                        userId: vm.userId,
                        admin: vm.workBenchType === 'allInquiry' ? 1 : null,
                        saleIdList: vm.workBenchType === 'myInquiry' ? [`${vm.userId}`] : vm.followUp_users,
                        inquiryStateList: vm.followUp_status,
                        startTime: Array.isArray(vm.date_value) ? vm.date_value[0] : undefined,
                        endTime: Array.isArray(vm.date_value) ? vm.date_value[1] : undefined
                    };
                    getBehaviorView(postData).then(res => {
                        if (res.code === '1') {
                            this.filterConObj = postData;
                            vm.chart_option.xAxis[0].data = [];
                            vm.chart_option.series[0].data = [];
                            vm.chatData = res.data;
                            // 计算最大值
                            // const maxCount = Math.max(...res.data.data.map(item => item.count));
                            res.data.forEach(item => {
                                vm.chart_option.xAxis[0].data.push(item.followupTypeName);
                                // 传入 data.maxCount , 随后在 series.label.formatter 中进行处理后再展示
                                // vm.chart_option.series[0].data.push(`${item.count}.${maxCount}`);
                                vm.chart_option.series[0].data.push(`${item.count}`);
                            });
                            vm.chart.setOption(vm.chart_option);
                            vm.jumpLoading = true;
                            vm.chart.getZr().on('click', params => {
                                const pointInPixel = [params.offsetX, params.offsetY];
                                if (vm.chart.containPixel('grid', pointInPixel)) {
                                    // 点击第几个柱子
                                    const pointInGrid = vm.chart.convertFromPixel({ seriesIndex: 0 }, pointInPixel);
                                    // console.log(pointInGrid)
                                    // 也可以通过params.offsetY 来判断鼠标点击的位置是否是图表展示区里面的位置
                                    // 也可以通过name[xIndex] != undefined，name是x轴的坐标名称来判断是否还是点击的图表里面的内容
                                    // x轴数据的索引
                                    const xIndex = pointInGrid[0];
                                    // y轴数据的索引
                                    const yIndex = pointInGrid[1];
                                    // var a = dataAxis[yIndex];
                                    console.log(xIndex, yIndex, vm.chatData[Math.floor(xIndex)].status);
                                    if (!vm.chatData[Math.floor(xIndex)].status) return;
                                    // 校验是否有该条询盘管理权限
                                    if (this.isContainsMenu('followUpRecord')) {
                                        if (vm.jumpLoading) {
                                            localStorage.setItem('leadsCloud-followUpRecord-followup-type', JSON.stringify(vm.chatData[xIndex < 0 ? 0 : Math.floor(xIndex)]));
                                            localStorage.setItem('leadsCloud-followUpRecord-followup-time', JSON.stringify(this.date_value));
                                            localStorage.setItem('leadsCloud-followUpRecord-followup-createType', vm.workBenchType === 'allInquiry' ? 3 : 2);
                                            vm.jumpLoading = false;
                                            window.open(this.$router.resolve({
                                                name: 'followUpRecord'
                                            }).href, '_blank');
                                            setTimeout(() => {
                                                vm.jumpLoading = true;
                                            });
                                        };
                                    } else {
                                        this.$Message.error('您没有"跟进记录"页面访问权限, 请联系您的管理员开通');
                                    };
                                }
                            });
                        } else {
                            this.filterConObj = {};
                            vm.$Message.error(this.$t('crm.WorkBench.error_getChartData'));
                        }
                        resolve();
                    });
                });
            },

            /* 表格 */
            get_table_data() {
                const vm = this;
                return new Promise(resolve => {
                    getBehaviorViewList({
                        orgId: vm.enterpriseId,
                        userId: vm.userId,
                        admin: vm.workBenchType === 'allInquiry' ? 1 : null,
                        saleIdList: vm.workBenchType === 'myInquiry' ? [vm.userId] : vm.followUp_users,
                        inquiryStateList: vm.followUp_status,
                        startTime: Array.isArray(vm.date_value) ? vm.date_value[0] : undefined,
                        endTime: Array.isArray(vm.date_value) ? vm.date_value[1] : undefined,
                        pageNo: vm.page_no,
                        pageSize: vm.page_size
                    }).then(res => {
                        if (res.code === '1') {
                            vm.table_data = res.data.list;
                            vm.page_total = res.data.total;
                        } else {
                            vm.$Message.error(this.$t('crm.WorkBench.error_getTableData'));
                        }
                        resolve();
                    });
                });
            },
            // get_all_users_list() {
            //     util.ajax({
            //         url: '/cuss-login/getUserInfoList',
            //         method: 'post',
            //         data: {
            //             orgId: this.enterpriseId
            //         }
            //     }).then(response => {
            //         if (response.data.code === '1') {
            //             this.all_users_list = [];
            //             this.all_users_list = response.data.data;
            //         } else {
            //             this.$Message.error(this.$t('crm.WorkBench.error_getInquiryManagerList'));
            //         }
            //     });
            // },
            async change_page(after_no) {
                this.page_no = after_no;
                await this.get_table_data();
                // console.log(after_no);
            },
            // 改变每页条数
            pageSizeChange(pageSize) {
                this.page_no = 1;
                this.page_size = pageSize;
                this.refresh_data();
            },
            jumpToCustomer(id) {
                if (!this.isContainsMenu('myCustomer')) {
                    this.$Message.error(this.$t('crm.WorkBench.error_haveNoPermissionMyCustomer'));
                } else {
                    if (id) {
                        this.$viewCustomer(id);
                    } else {
                        this.$Message.error(this.$t('crm.WorkBench.error_companyId'));
                    }
                }
            },
            jumpToInquiry(id) {
                if (!this.isContainsMenu('myInquiry')) {
                    this.$Message.error(this.$t('crm.WorkBench.error_haveNoPermissionMyInquiry'));
                } else {
                    if (id) {
                        // this.$router.push({
                        //     name: 'myInquiry',
                        //     params: {
                        //         inquiryId: id,
                        //     }
                        // });

                        localStorage.setItem('leadsCloud-inquiryId', id);
                        window.open(this.$router.resolve({
                            name: 'myInquiry'
                        }).href, '_blank');
                    } else {
                        this.$Message.error(this.$t('crm.WorkBench.error_inquiryId'));
                    }
                }
            },

            /* 筛选 */
            get_depart_users_list() {
                getUserObjListExcludeDelete({
                    orgId: this.enterpriseId,
                    userId: this.userId
                }).then(response => {
                    this.depart_users_list = [];
                    this.depart_users_list = response.data;
                });
            },
            /** 获取全部部门人员，包括离职人员 */
            get_all_depart_users_list() {
                getDepartUserByUserId({
                    orgId: this.enterpriseId,
                    admin: 1,
                    userId: this.userId
                }).then(response => {
                    this.all_depart_users_list = [];
                    this.all_depart_users_list = response.data;
                });
            },
            get_followUp_status() {
                this.$commonApi.getFollowUpList({
                    orgId: this.enterpriseId,
                    typeId: 7
                }).then(response => {
                    if (response.code === '1') {
                        this.status_list = response.data;
                        this.status_list.unshift({
                            isAvailable: 1,
                            attrId: 0,
                            sort: 0,
                            typeId: 7,
                            attrName: this.$t('crm.UniSet.defaultFollowUpStatus_inquiry')
                        });
                    } else {
                        this.$Message.error(this.$t('crm.WorkBench.error_getFollowUpStatusList'));
                    }
                });
            }
        },
        created() {
            // this.get_all_depart_users_list();
            // if (this.workBenchType === 'allInquiry') {
            //     this.get_depart_users_list();
            // }
        },
        mounted() {
            this.chart = this.$echarts.init(this.$refs.followUp_chart);
            this.chart.setOption(this.chart_option);
            this.chart.resize();
            // this.get_all_users_list();
            this.get_followUp_status();
            this.refresh_data();
            if (this.workBenchType === 'allInquiry') {
                this.get_depart_users_list();
            }
        },
        deactivated() {
            if (this.chart && this.chart.dispose) {
                this.chart.dispose();
            }
        },
        watch: {
            workBenchType: {
                handler(val) {
                    if (val === 'allInquiry') {
                        this.followUp_users = [];
                        this.get_depart_users_list();
                    }
                    this.followUp_status = [];
                    this.date_value = [(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).format('yyyy-MM-dd'), (new Date()).format('yyyy-MM-dd')];
                    this.refresh_data();
                },
                // immediate: true
            },
            window_height() {
                if (this.chart.resize) {
                    this.chart.resize();
                }
            },
            // 当前图表的全部接口请求参数
            filterConObj: {
                handler(val) {
                    this.$emit('updateTableFilterConObj', val);
                }
            }
        }
    };
</script>

<style scoped lang="less">
@import "./cardtables.less";
    .dashboard-title {
        font-size: 20px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.8);
    }
    .tabmain {
        /deep/ table {
            width: 100% !important;
            font-size: 12px;

            .cell {
                overflow-y: auto;
                max-height: 100px;
            }
        }
    }
    .workBenchFollowUp {
        /deep/ span.el-tag:nth-child(1) {
            display: flex;
            align-items: center;
            >span {
                max-width: 73px;
                display: inline-block;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
    }

    .workbench-filterButton {
        padding: 7px 9px;

        /deep/ i {
            font-size: 16px;
        }
    }
</style>

<style lang="less">
    .mouse-on-inquiry-comName {
        color: #3b78de;
        cursor: pointer;
        &:hover {
            color: #2d63bc;
            text-decoration: underline;
        }
    }
</style>
