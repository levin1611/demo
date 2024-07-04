<template>
    <div>
        <div class="adgroup">
            <div class="table_wrap">
                <!-- 标题 + 提示文本 -->
                <div style="margin-bottom: 10px" class="_boxSizing _padRowL10">
                    <h2>
                        {{ $t('googleOptimize.loopManage') }}
                        <!-- 系统 tip -->
                        <HelpTip :title="$t('helpTip.loopManage')"></HelpTip>
                    </h2>
                    <div style="line-height: 25px;margin: 10px 0 0 0;font-size: 12px;">
                        <p>{{$t('googleOptimize.googleAdvise')}}{{['12200'].includes(enterpriseId) ? $t('googleOptimize.closeLoopList12200') : $t('googleOptimize.closeLoopList')}}</p>
                    </div>
                </div>

                <!-- 转化操作 -->
<!--                <div class="loop-btn" style="margin-bottom: 10px">-->
<!--                    <Button v-for="(item,index) in optimizeList" style="font-size:12px" :class="{_warningActive: indexType===index}"-->
<!--                            :type="indexType===index? 'warning':'text'" :ghost="indexType===index? true:false"-->
<!--                            @click="loopType(index,item.conversionId)">{{item.conversionName}}-->
<!--                    </Button>-->
<!--                </div>-->

                <!-- 筛选标签 + 右侧按钮 -->
                <div class="datewrap">
                    <span class="_btns_text_ml">
                        <!-- 右上角筛选 -->
                        <Poptip width="540"
                                trigger="click"
                                placement="bottom-end"
                                class="condition">
                            <!-- trigger -->
                            <Button slot="reference"
                                    type="text"
                                    icon="custom custom-table-filter"
                                    :style="filtering ? 'color:#4285f4' : ''">{{ $t('website.condition') }}</Button>
                            <!-- content -->
                            <div style="overflow: hidden">
                                <!-- 筛选类型切换 -->
                                <div class="filter-top">
                                    <Tabs v-model="selected_filter_tab"
                                          class="full-tab">
                                        <TabPane name="search"
                                                 :label="$t('crm.Table.search')"></TabPane>
                                        <TabPane name="searchCommon"
                                                 :label="$t('crm.Table.searchComment')"></TabPane>
                                    </Tabs>
                                </div>
                                <!-- 筛选面板 -->
                                <div>
                                    <!-- 自定义检索 -->
                                    <div v-show="selected_filter_tab === 'search'">
                                        <div style="padding: 0 15px;">
                                            <!-- 筛选名称 -->
                                            <div style="margin-bottom: 15px">
                                                <div class="filter-tips">{{ $t('filter_box.filter_name') }}</div>
                                                <Input v-model="custom_search_name"
                                                       :placeholder="$t('retrieval')"
                                                       style="width: 486px"></Input>
                                            </div>
                                            <!-- 筛选条件 -->
                                            <div>
                                                <div class="filter-tips">{{ $t('filter_box.filter_con') }}</div>

                                                <!-- 筛选条件 -->
                                                <div class="conditionwrap">
                                                    <div v-for="(add, index) in conditionList"
                                                         :key="index"
                                                         class="conditionmain _f _r">
                                                        <!-- 筛选项 -->
                                                        <Select v-model="add.condition1"
                                                                size="small"
                                                                :filterable="true"
                                                                @change="handleChangeCon1(index)"
                                                                style="width:120px;margin-right:12px;float:left;">
                                                            <Option v-for="item in add.conditionList1"
                                                                    :key="item.value"
                                                                    :value="item.value"
                                                                    :label="item.label"></Option>
                                                        </Select>
                                                        <!-- 筛选条件 -->
                                                        <Select v-model="add.condition2"
                                                                size="small"
                                                                @change="handleChangeCon2(index)"
                                                                style="width:90px;margin-right:12px;float:left;">
                                                            <Option v-for="item in add.conditionList2"
                                                                    :key="item.value"
                                                                    :value="item.value"
                                                                    :label="item.label"></Option>
                                                        </Select>
                                                        <!-- 筛选值 -->
                                                        <div style="margin-bottom:10px;">
                                                            <!-- 文本型 -->
                                                            <Input v-if="add.inputType === 'string'"
                                                                   v-model="add.condition3"
                                                                   size="small"
                                                                   :placeholder="$t('website.keywordHolder')"
                                                                   style="width:220px;margin-right:5px;"></Input>
                                                            <!-- 日期型 -->
                                                            <!-- 使用v-show避免日期选择框定位问题 -->
                                                            <span v-show="add.inputType === 'dateRange'">
                                                                <DatePicker v-model="add.condition3"
                                                                            type="daterange"
                                                                            size="small"
                                                                            placement="bottom-end"
                                                                            :placeholder="$t('crm.Table.tip_selectTime')"
                                                                            ref="dateRange"
                                                                            style="width: 200px;margin-right:5px;"></DatePicker>
                                                            </span>
                                                            <!-- 使用v-show避免日期选择框定位问题 -->
                                                            <span v-show="add.inputType === 'date'">
                                                                <DatePicker v-model="add.condition3"
                                                                            type="date"
                                                                            size="small"
                                                                            placement="bottom-end"
                                                                            :placeholder="$t('crm.Table.tip_selectTime')"
                                                                            ref="date"
                                                                            style="width: 200px;margin-right:5px;"></DatePicker>
                                                            </span>
                                                            <!-- 选择型 -->
                                                            <Select v-if="add.inputType === 'select'"
                                                                    v-model="add.condition3"
                                                                    size="small"
                                                                    style="width: 220px;margin-right:5px;">
                                                                <Option v-for="item in add.conditionList3"
                                                                        :key="item.value"
                                                                        :value="item.value"
                                                                        :label="item.label"></Option>
                                                            </Select>

                                                            <!-- 首个条件后, 显示添加条件 按钮-->
                                                            <span v-if="index === 0"
                                                                  @click="addCon">
                                                                <!-- <Icon type="plus-circled"
                                                                      size="15"
                                                                      color="#FA8241"
                                                                      style='cursor:pointer;display:inline-block;'></Icon> -->
                                                                <Icon
                                                                    size="15"
                                                                    class="custom custom-add-circle"
                                                                    style='cursor:pointer;display:inline-block;'></Icon>
                                                            </span>
                                                            <!-- 否则, 显示删除当前筛选按钮 -->
                                                            <span v-else
                                                                  @click="removeCon(index)">
                                                                <!-- <Icon type="minus-circled"
                                                                      size="15"
                                                                      color="#FA8241"
                                                                      style='cursor:pointer;display:inline-block;'></Icon> -->
                                                                <Icon
                                                                      size="15"
                                                                      class="custom custom-reduce-circle"
                                                                      style='cursor:pointer;display:inline-block;'></Icon>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- 底部按钮 -->
                                        <div style="margin-top: 10px;text-align: right"
                                             class="btn clearfloat">
                                            <!-- 保存为常用检索 -->
                                            <Button type="primary"
                                                    size="small"
                                                    @click="saveSearch"
                                                    class="piwik_googleOptimizeSaveCommonFilter">{{ $t('filter_box.save_common') }}</Button>
                                            <!-- 筛选 -->
                                            <Button type="primary"
                                                    size="small"
                                                    @click="search"
                                                    class="piwik_googleOptimizeFilterData">{{ $t('filter_box.filter') }}</Button>
                                            <!-- 清空 -->
                                            <Button size="small"
                                                    @click="empty"
                                                    class="piwik_googleOptimizeEmptyFilter">{{ $t('website.empty') }}</Button>
                                        </div>
                                    </div>
                                    <!-- 常用检索 -->
                                    <div v-show="selected_filter_tab === 'searchCommon'">
                                        <p class="filter-tips">{{ $t('filter_box.common_filter') }}</p>
                                        <div class="commentwrap">
                                            <div v-for="item in list_commonSearch"
                                                 :key="item.id"
                                                 @click="searchCommon(item)"
                                                 :style="id_selected_commonSearch === item.id ? 'color:#fda359' : ''"
                                                 class="eachlist">
                                                <span class="listtitle">{{ item.searchName }}</span>
                                                <span @click.stop="delete_commonSearch(item.id, item.searchName)"
                                                      class="removelist">×</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Poptip>

                        <!-- 待审核 -->
                        <Button type="primary"
                                @click="toAudit"
                                style="margin-left: 20px">{{ $t('googleOptimize.audit') }}</Button>
                        <!-- 手动回传 -->
                        <Button type="primary"
                                @click="toPassBack">{{ $t('googleOptimize.manualBack') }}</Button>
                    </span>
                    <!-- 筛选标签 -->
                    <FilterTags
                            :order_column="order_column"
                            :order_type="order_type"
                            :storageName_orderColumn="storageName_orderColumn"
                            :filterConObj.sync="config_tableFilter"
                            :langObj="langObj"
                            :width="600"
                            @emptySort="empty_sort"
                            @removeCon="remove_filter_tag"
                            @change_filter_tag="change_filter_tag"></FilterTags>
                </div>

                <!-- 表格 + 分页 -->
                <div class="table">
                    <Table class="tabmain"
                           :loading="loading"
                           ref="table"
                           size="medium"
                           :height="table_height"
                           :isCustom="true"
                           :customEmptyText="customEmptyTextLang"
                           customEmptyButtonText=""
                           :customClearMethod="clearFilterConditionByInitView"
                           highlight-current-row
                           @row-click="getDetailById"
                           :data="tableData">
                        <TableColumn v-for="item in tableColumns"
                                     :key="item.key"
                                     :prop="item.key"
                                     :label="item.title"
                                     :width="item.width"
                                     :min-width="item.width || 64"
                                     :formatter="item.formatter"
                                     :render-header="item.renderHeader"
                                     :show-overflow-tooltip="true">
                            <template slot-scope="scope">
                                <template v-if="item.formatter">{{(item.formatter)(scope.row) }}</template>
                                <template v-else>{{ scope.row[item.key] }}</template>
                            </template>
                        </TableColumn>
                    </Table>
                    <!-- 分页 -->
                    <div style="margin-right: 30px;overflow: hidden">
                        <Page :page-size="pageSize"
                              :page-sizes="pageSizeOpts"
                              :total="totalPage"
                              :current-page="currPage"
                              layout="total, prev, pager, next, sizes, jumper, ->"
                              ref="pages"
                              @current-change="changePage"
                              @size-change="sizeChange"
                              class="pageWrap-right"></Page>
                    </div>
                </div>
            </div>
        </div>

        <VisitorDetail
            ref="visitorDetails"
            :type="'google'"
            :row="currentRow"
            :timeLine="timeLine"
            :index="currentIndex"
            :showDetail.sync="showDetail"
            @changeRowData="changeRowData">
        </VisitorDetail>

        <!-- 删除常用检索 -->
        <Modal :visible.sync="deleteCommonSearchVisible"
               :title="$t('editSure')"
               width="500px"
               :append-to-body="true"
               :modal-append-to-body="false">
            <Spin v-if="loading_deleteCommonSearch"
                  fix></Spin>
            <div style="margin-bottom:20px;">
                {{ `${$t('editSureTip1')}${deleteCommonSearchName}${$t('editSureTip2')}` }}
            </div>
            <div slot="footer">
                <Button size="small"
                        @click="cancelDel_commonSearch">{{ $t('cancel') }}</Button>
                <Button size="small"
                        type="primary"
                        @click="sureDel_commonSearch">{{ $t('confirm') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import FilterTags from '@/views/main-components/filter-tags';
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import VisitorDetail from '@/views/visitor-history/components/visitor-detail';
    import resetInitComponents from '@/mixins/resetComponentViewData';
    import { googleAdsBind } from '@/api/google/index';
    const { getGoogleAdsAccountList, getConversionList } = googleAdsBind;

    export default {
        mixins: [resetInitComponents],
        name: 'loop_manage',
        components: {
            FilterTags,
            VisitorDetail
        },
        props: [
            'showField'
        ],
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                window_height: 'window_height'
            }), // 从 vuex 中获取属性
            table_height() {
                let temp = this.window_height ? this.window_height - 291 : document.documentElement.clientHeight - 301;
                temp += 50;
                console.log('table-height', temp);
                return temp > 200 ? temp : 200;
            },
            /* 右上角筛选条件处理结果 */
            computed_sqlList_tableFilter() {
                return Object.entries(this.sqlList_tableFilter).map(([key, val]) => {
                    const temp = {};
                    // 数组型 - 日期型 - 字符串型/国家地区
                    if (val.hasOwnProperty('$or')) {
                        temp.$or = val.$or;
                    } else if (val.hasOwnProperty('$and')) {
                        const timeArr = val.$and;
                        if (timeArr[0] && timeArr[1] && timeArr[0][key].$gte && timeArr[1][key].$lte) {
                            timeArr[0][key].$gte = this.$options.filters.timeFormat(timeArr[0][key].$gte);
                            timeArr[1][key].$lte = `${this.$options.filters.timeFormat(timeArr[1][key].$lte)} 23:59:59.999`;
                        }
                        temp.$and = timeArr;
                        // temp['$and'] = val['$and'];
                    } else {
                        temp[key] = val;
                    }
                    return temp;
                });
            }
        },
        data() {
            return {
                currentIndex: -1,
                showDetail: false,
                onLineTime: '2019-06-01 00:00:00', // 上线时间--晚 // 1559318400000
                timeLine: '',
                /* 筛选 */
                order_column: '',
                order_type: '',
                config_tableFilter: {
                    visitorId: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    conversionAction: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型, string / date / select / countryArea
                        query: [], // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: [] // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    revenueValue: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    adsAccount: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'select', // 筛选类型, string / date / select / countryArea
                        query: [], // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: [] // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    campaign: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    adgroup: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    keyword: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    device: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    matchType: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    sumbitPerson: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    conversionTime: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型, string / date / select / countryArea
                        query: [], // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    // conversionStatus: {
                    //     sort: false, // 是否允许排序
                    //     filter: true, // 是否允许筛选
                    //     filterType: 'string', // 筛选类型, string / date / select / countryArea
                    //     query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                    //     allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    // }
                },
                langObj: {
                    // 默认字段
                    visitorId: this.$t('googleOptimize.visitorID'),
                    conversionAction: this.$t('googleOptimize.conversionAction'),
                    revenueValue: this.$t('googleOptimize.revenueValue'),
                    adsAccount: this.$t('googleOptimize.adsAccount'),
                    campaign: this.$t('googleOptimize.campaign'),
                    adgroup: this.$t('googleOptimize.adGroup'),
                    keyword: this.$t('googleOptimize.keyWord'),
                    device: this.$t('googleOptimize.device'),
                    matchType: this.$t('googleOptimize.matchType'),
                    sumbitPerson: this.$t('googleOptimize.sumbitPerson'),
                    conversionTime: this.$t('googleOptimize.conversionTime'),
                    // conversionStatus: this.$t('googleOptimize.conversionStatus')
                },
                // 表头筛选条件
                sqlList_tableFilter: {},
                storageName_orderColumn: '',
                queryData: {
                    $and: []
                },

                indexType: 0, // 当前选择优化类型
                currOptimizeId: '', // 当前选择优化类型id
                currentRow: {}, // 当前行数据
                loading: false, // 加载图标
                tableColumns: [
                    { title: this.$t('googleOptimize.visitorID'), key: 'visitorId', width: 210 },
                    { title: this.$t('googleOptimize.conversionAction'), key: 'conversionAction', width: 210 },
                    { title: this.$t('googleOptimize.revenueValue'), key: 'revenueValue', width: 150 },
                    // {
                    //     title: this.$t('googleOptimize.adsAccount'),
                    //     key: 'adsAccount',
                    //     width: 150
                    //     // formatter: row => {
                    //     //     return `${row.adsAccount}-${row.customerId}`;
                    //     // }
                    // },
                    { title: this.$t('googleOptimize.campaign'), key: 'campaign', width: 150 },
                    { title: this.$t('googleOptimize.adGroup'), key: 'adgroup', width: 150 },
                    { title: this.$t('googleOptimize.keyWord'), key: 'keyword', width: 150 },
                    {
                        title: this.$t('googleOptimize.device'),
                        key: 'device',
                        width: 150,
                        formatter: row => {
                            if (row.device === 'c') {
                                return this.$t('googleOptimize.computer');
                            } else if (row.device === 'm') {
                                return this.$t('googleOptimize.phone');
                            } else if (row.device === 't') {
                                return this.$t('googleOptimize.pad');
                            }
                        }
                    },
                    {
                        title: this.$t('googleOptimize.matchType'),
                        key: 'matchType',
                        width: 150,
                        formatter: row => {
                            if (row.matchType === 'e') {
                                return this.$t('googleOptimize.exactMatch');
                            } else if (row.matchType === 'p') {
                                return this.$t('googleOptimize.phraseMatch');
                            } else if (row.matchType === 'b') {
                                return this.$t('googleOptimize.broadMatch');
                            }
                        }
                    },
                    { title: this.$t('googleOptimize.sumbitPerson'), key: 'sumbitPerson', width: 150 },
                    {
                        title: this.$t('googleOptimize.conversionTime'),
                        key: 'conversionTime',
                        width: 150,
                        formatter: row => {
                            return new Date(row.conversionTime).format('yyyy-MM-dd hh:mm');
                        }
                    },
                    // {
                    //     title: this.$t('googleOptimize.conversionStatus'),
                    //     key: 'conversionStatus',
                    //     width: 100,
                    //     formatter: row => {
                    //         if (row.conversionStatus === 0) {
                    //             return this.$t('googleOptimize.notConversion');
                    //         } else if (row.conversionStatus === 1) {
                    //             return this.$t('googleOptimize.conversionSuccess');
                    //         } else if (row.conversionStatus === 2) {
                    //             return this.$t('googleOptimize.conversionFail');
                    //         }
                    //     }
                    // }
                ], // 表格列名称
                tableData: [],
                totalPage: 0,
                currPage: 1,
                pageSize: 10,
                pageSizeOpts: [10, 20, 30, 50],
                // 转化类型列表
                optimizeList: [],
                // ads 账户列表
                adsAccountList: [],

                /* 右上角筛选 */
                // 右上角检索通用
                searchData: [],
                saveSearchLoading: false, // 检索
                // 切换自定义检索/常用检索
                filtering: false, // 右上角筛选是否在筛选状态
                selected_filter_tab: 'search', // 检索 or 常用检索
                // 自定义检索
                custom_search_name: '', // 自定义检索名称
                conditionList1: [
                    { value: 'visitorID', label: this.$t('googleOptimize.visitorID') },
                    { value: 'conversionAction', label: this.$t('googleOptimize.conversionAction') },
                    { value: 'revenueValue', label: this.$t('googleOptimize.revenueValue') },
                    // { value: 'adsAccount', label: this.$t('googleOptimize.adsAccount') },
                    { value: 'campaign', label: this.$t('googleOptimize.campaign') },
                    { value: 'adGroup', label: this.$t('googleOptimize.adGroup') },
                    { value: 'keyWord', label: this.$t('googleOptimize.keyWord') },
                    { value: 'device', label: this.$t('googleOptimize.device') },
                    { value: 'matchType', label: this.$t('googleOptimize.matchType') },
                    { value: 'sumbitPerson', label: this.$t('googleOptimize.sumbitPerson') },
                    { value: 'conversionTime', label: this.$t('googleOptimize.conversionTime') },
                    // { value: 'conversionStatus', label: this.$t('googleOptimize.conversionStatus') }
                ], // 筛选字段：字段列表
                conditionList2: [
                    { value: '$eq', label: this.$t('filter_box.equal') },
                    { value: '$nq', label: this.$t('filter_box.unequal') },
                    { value: '$regex', label: this.$t('filter_box.contain') },
                    { value: '$nregex', label: this.$t('filter_box.not_contain') }
                ],
                conditionList: [],
                // 常用检索
                columnType: 15, // 字段所属模块 1客户2联系人3询盘4公海客户5线索6公海线索7fbleads8权限部门用户管理9功能权限管理10访客历史11网站留言12产品管理13Google Ads绑定14聊天界面设置-话术设置15Google营销-闭环优化管理
                list_commonSearch: [], // 常用检索列表
                id_selected_commonSearch: -1, // 当前常用检索 id
                common_conditions: [], // 当前常用检索项的检索数据
                // 删除常用检索确认弹窗
                loading_deleteCommonSearch: false,
                deleteCommonSearchVisible: false,
                deleteCommonSearchId: '',
                deleteCommonSearchName: ''
            };
        },
        created() {
            this.addCon();
            this.getTemplateList();
            // this.getAllAdsAccount();
            this.init_filter_table();
            this.timeLine = new Date(this.onLineTime).getTime();
            this.tableColumns = this.tableColumns.map((col, index) => {
                const headSet = this.config_tableFilter[col.key];
                if (headSet && (headSet.sort || headSet.filter)) {
                    col.show_filter_content = false;
                    col.filtering = false;
                    col.renderHeader = this.renderHeader_filter(index);
                }
                return col;
            });
            this.get_commonSearch();
        },
        // mounted() {
        //     this.tableColumns = this.tableColumns.map((col, index) => {
        //         if (this.config_tableFilter.hasOwnProperty(col.key)) {
        //             col.show_filter_content = false;
        //             col.filtering = false;
        //             col.renderHeader = this.renderHeader_filter(index);
        //         }
        //         return col;
        //     });
        // },
        activated() { /* keep-alive  生命周期函数每次进入页面都有 不管是否缓存了组件 */
            // window.onresize = () => {
            //   this.table_height = document.body.clientHeight - 380
            //   let autoTemp=(document.body.clientHeight-300)+'px'
            //   document.getElementById('clueBody').style.height=autoTemp
            // }; // 屏幕大小改变的时候改变图表大小
        },
        deactivated() {
            this.showDetail = false;
        },
        methods: {
            // 前往审核页面
            toAudit() {
                this.$emit('update:showField', 1);
            },
            toPassBack() {
                this.$emit('update:showField', 2);
            },
            loopType(index, id) {
                console.log(index);
                console.log(id);
                this.indexType = index;
                this.currOptimizeId = id;
                this.currPage = 1;
                this.refreshData();
            },

            /* 表格 + 分页 */
            // 打开详情页
            getDetailById(row, column, event) {
                // 复制数据, 不弹出详情页
                const explorer = window.navigator.userAgent;
                let selector = '';
                if (explorer.indexOf('MSIE') >= 0 || explorer.indexOf('Opera') >= 0) {
                    const selected = document.selection.createRange();
                    selector = selected.text;
                } else {
                    selector = window.getSelection();
                }
                if (selector.type === 'Range') {
                    return;
                }

                // 否则弹出详情页
                this.currentRow = row;
                this.showDetail = true;
            },
            // 更新表格数据
            changeRowData({ row, key, value, index, clueId }) {
                console.log('改变列表数据=====', row, key, value, index, clueId, this.$refs);
                this.$refs.editTable.thisTableData[index][key] = value;
                this.$refs.editTable.edittingStore[index][key] = value;
                this.$set(this.editIncellData[index], 'crmStatus', value);
                this.$set(row, key, value);
                console.log(value);
            },
            /* 加载转化类型列表 */
            async getTemplateList() {
                getConversionList({
                    orgId: this.enterpriseId,
                    isAll: 1
                }).then(res => {
                    if (res.code === '1') {
                        const data = res.data;
                        // this.$store.commit('update_associated_followUpStatus_list', data);

                        this.optimizeList = data.map(item => {
                            const {
                                conversionId: value,
                                conversionName: label
                            } = item;

                            return {
                                ...item,
                                value,
                                label
                            };
                        });

                        this.setSelectOptions('conversionAction', this.optimizeList);

                        // const List = data;
                        // if (List.length > 0) {
                        //     this.currOptimizeId = List[0].conversionId;
                        // }
                    } else {
                        // this.$store.commit('update_associated_followUpStatus_list', false);
                        this.loading = false;
                    }
                    // this.init_filter_table();
                });
            },
            /* 刷新表格数据 */
            refreshData() {
                this.loading = true;
                const jsonData = {
                    orgId: this.enterpriseId,
                    // conversionId: this.currOptimizeId,
                    pageSize: this.pageSize,
                    pageNo: this.currPage,
                    orderColumn: this.order_column,
                    orderType: this.order_type,
                    query: this.queryData.$and.length ? JSON.stringify(this.queryData) : undefined
                };
                util.ajax({
                    url: '/crm/conversionRecord/getList',
                    method: 'post',
                    data: jsonData
                }).then(response => {
                    this.loading = false;
                    if (response.data.code == 1) {
                        if (!response.data.data.list) {
                            this.tableData = [];
                            this.totalPage = 0;
                        } else {
                            this.tableData = this.handleData(response.data.data.list);
                            this.totalPage = response.data.data.total;
                        }
                    } else {
                        this.tableData = [];
                        this.totalPage = 0;
                    }
                }).catch(error => {
                    this.loading = false;
                    this.tableData = [];
                    this.totalPage = 0;
                });
            },
            // 数据处理
            handleData(data) {
                return data.map(item => {
                    const {
                        conversionName: conversionAction,
                        adsCustomerName: adsAccount
                    } = item;

                    return {
                        ...item,
                        conversionAction,
                        adsAccount
                    };
                });
            },
            /* 改变每页条数 */
            sizeChange(size) {
                this.pageSize = size;
                /* 如果当前不是第一页 重置为第一页 会自动触发 changepage */
                if (this.currPage !== 1) {
                    this.currPage = 1;
                } else {
                    this.loading = true;
                    this.refreshData();
                }
            },
            /* 改变页码 */
            changePage(page) {
                this.tableData = [];
                this.loading = true;
                this.currPage = page;
                this.refreshData();
            },

            /* 表头筛选相关 */
            // filterTags 组件内部修改筛选值后触发的方法, 由下方的 updateList 改造而成
            change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    const column = this.tableColumns.find(item => item.key === key);
                    if (column) {
                        // 判断是否有值, 调整 sqlList
                        const con = column.fieldType === 'custom' ? key : this.getSearchCon(key);
                        if (temp.query.length) {
                            const result = {};
                            switch (temp.filterType) {
                                case 'string':
                                    this.$set(this.sqlList_tableFilter, con, {
                                        $regex: temp.query
                                    });
                                    break;
                                case 'select':
                                    switch (con) {
                                        // 单独发送的字段在最外层, 方便 merge_query_list , 否则用 $or: [筛选条件...]
                                        case 'companyManagers':
                                            result.$regex = temp.query.map(item => item.value);
                                            break;
                                        default:
                                            // 表头筛选中只能有单个选项值的(单选型字段 + 创建人这种表格才有的字段)属性, 筛选时使用 $eq 等于, 其他用 $regex 包含
                                            let type = '$regex';
                                            switch (key) {
                                                case 'clientType':
                                                case 'starLevel':
                                                case 'scale':
                                                case 'createUser':
                                                case 'marker':
                                                    type = '$eq';
                                                    break;
                                                default:
                                                    if (column.fieldType === 'custom' && column.colType === 'select') {
                                                        type = '$eq';
                                                    }
                                            }
                                            result.$or = temp.query.map(item => {
                                                const temp = {};
                                                temp[con] = {};
                                                temp[con][type] = item.value;
                                                return temp;
                                            });
                                    }

                                    this.$set(this.sqlList_tableFilter, con, result);
                                    break;
                                case 'countryArea':
                                    this.$set(this.sqlList_tableFilter, con, {
                                        $regex: temp.query[0].replace('unknown', '') // [code, name]
                                    });
                                    break;
                                case 'date':
                                    if (temp.query[0] && temp.query[1]) {
                                        result.$and = [];

                                        const start = {};
                                        start[con] = {};
                                        start[con].$gte = temp.query[0];
                                        result.$and.push(start);

                                        const end = {};
                                        end[con] = {};
                                        end[con].$lte = temp.query[1];
                                        result.$and.push(end);

                                        this.$set(this.sqlList_tableFilter, con, result);
                                    } else {
                                        this.config_tableFilter[key].query = [];
                                        this.$delete(this.sqlList_tableFilter, con);
                                    }
                                    break;
                            }
                            this.tableColumns = this.tableColumns.map((item, index) => {
                                if (item.key === key) {
                                    item.filtering = true;
                                }
                                return item;
                            });
                        } else {
                            this.$delete(this.sqlList_tableFilter, con);
                            this.tableColumns = this.tableColumns.map((item, index) => {
                                if (item.key === key) {
                                    item.filtering = false;
                                }
                                return item;
                            });
                        }

                        this.merge_query_list();
                        this.currPage = 1;
                        this.refreshData();
                    } else {
                        this.remove_filter_tag(key);
                    }
                } else {
                    this.remove_filter_tag(key);
                }
            },
            // 初始化筛选条件
            init_filter_table() {
                const day1 = Date.now() - 6 * 24 * 60 * 60 * 1000;
                const timeRange = [day1, Date.now()].map(item => {
                    return this.$options.filters.timeFormat(item);
                });
                console.log('timeRange', timeRange);
                const initial_filter_cons = new Map([
                    ['conversionTime', [(`${timeRange[0]} 00:00:00`), (`${timeRange[1]} 23:59:59`)]]
                ]);

                // this.order_column = 'leaveTime' // 排序字段在数据库中的数据名
                // this.order_type = 'desc' // 排序类型
                // this.storageName_orderColumn = 'leaveTime', // 排序字段
                this.tableColumns = this.tableColumns.map(col => {
                    if (this.config_tableFilter.hasOwnProperty(col.key)) {
                        col.filtering = initial_filter_cons.get(col.key) ? this.init_filter(col.key, initial_filter_cons.get(col.key)) : false;
                    }
                    return col;
                });
                this.merge_query_list();
                this.currPage = 1;
                this.refreshData();
            },
            // 设定初始筛选条件
            init_filter(key, val) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    this.$set(this.config_tableFilter[key], 'query', val);
                    console.log('111');
                    const con = this.getSearchCon(key);
                    if (val.length) {
                        const result = {};
                        // 根据不同的类型处理查询sqlList_tableFilter
                        switch (temp.filterType) {
                            case 'string':
                                this.$set(this.sqlList_tableFilter, con, {
                                    $regex: val
                                });
                                break;
                            case 'select':
                                switch (con) {
                                    case 'companyManagers':
                                        result.$regex = val.map(item => item.value);
                                        break;
                                    default:
                                        result.$or = val.map(item => {
                                            const temp = {};
                                            temp[con] = {};
                                            temp[con].$regex = item.value;
                                            return temp;
                                        });
                                }

                                this.$set(this.sqlList_tableFilter, con, result);
                                break;
                            case 'countryArea':
                                this.$set(this.sqlList_tableFilter, con, {
                                    $regex: val[0].replace('unknown', '') // [code, name]
                                });
                                break;
                            case 'date':
                                if (val[0] && val[1]) {
                                    result.$and = [];

                                    const start = {};
                                    start[con] = {};
                                    start[con].$gte = val[0];
                                    result.$and.push(start);

                                    const end = {};
                                    end[con] = {};
                                    end[con].$lte = val[1];
                                    result.$and.push(end);


                                    this.$set(this.sqlList_tableFilter, con, result);
                                } else {
                                    this.config_tableFilter[key].query = [];
                                    this.$delete(this.sqlList_tableFilter, con);
                                }
                                break;
                        }
                        return true;
                    } else {
                        this.$delete(this.sqlList_tableFilter, con);
                        return false;
                    }
                } else {
                    return false;
                }
            },
            // 返回字段筛选渲染函数
            renderHeader_filter(colIndex) {
                return h => {
                    const column = this.tableColumns[colIndex];
                    /* DOM */
                    // 标题
                    const title = h('div', {
                        attrs: {
                            title: column.title
                        },
                        class: 'table-filter-title'
                    }, column.title);
                    // 排序组件
                    let order_column = this.getSearchCon(column.key);
                    if (order_column === 'create_user_id') {
                        order_column = 'create_user';
                    }
                    const sortIcons = h('span', {
                        class: {
                            'table-sort-icon-container': true
                        }
                    }, [
                        h('Icon', {
                            class: {
                                on: this.order_column === order_column && this.order_type === 'asc'
                            },
                            props: {
                                type: 'md-arrow-dropup'
                            }
                            // nativeOn: {
                            //     click: () => {
                            //         if (this.order_column === order_column && this.order_type === 'asc') {
                            //             this.order_column = '';
                            //             this.order_type = '';
                            //         } else {
                            //             this.order_column = order_column;
                            //             this.order_type = 'asc';
                            //         }
                            //         this.refreshData ();
                            //     }
                            // }
                        }),
                        h('Icon', {
                            class: {
                                on: this.order_column === order_column && this.order_type === 'desc'
                            },
                            props: {
                                type: 'md-arrow-dropdown'
                            }
                            // nativeOn: {
                            //     click: () => {
                            //         if (this.order_column === order_column && this.order_type === 'desc') {
                            //             this.order_column = '';
                            //             this.order_type = '';
                            //         } else {
                            //             this.order_column = order_column;
                            //             this.order_type = 'desc';
                            //         }
                            //         this.refreshData ();
                            //     }
                            // }
                        })
                    ]);
                    // 筛选组件
                    const filterPop = h('FilterBox', {
                        props: Object.assign({
                            showPopper: this.tableColumns[colIndex].show_filter_content,
                            filtering: this.tableColumns[colIndex].filtering,
                            columnKey: column.key,
                            columnCon: order_column,
                            order_type: this.order_type,
                            order_column: this.order_column,
                            storageName_orderColumn: this.storageName_orderColumn,
                            columnType: this.columnType
                        }, this.config_tableFilter[column.key]),
                        on: {
                            updateList: () => {
                                const temp = this.config_tableFilter[column.key];
                                if (temp) {
                                    /* 处理筛选 */
                                    // 判断是否有值, 调整 sqlList
                                    const con = this.getSearchCon(column.key);
                                    if (temp.query.length) {
                                        const result = {};
                                        switch (temp.filterType) {
                                            case 'string':
                                                this.$set(this.sqlList_tableFilter, con, {
                                                    $regex: temp.query
                                                });
                                                break;
                                            case 'select':
                                                switch (con) {
                                                    case 'companyManagers':
                                                        result.$eq = temp.query.map(item => item.value);
                                                        break;
                                                    default:
                                                        result.$or = temp.query.map(item => {
                                                            const temp = {};
                                                            temp[con] = {};
                                                            temp[con].$eq = item.value;
                                                            return temp;
                                                        });
                                                }

                                                this.$set(this.sqlList_tableFilter, con, result);
                                                break;
                                            case 'countryArea':
                                                this.$set(this.sqlList_tableFilter, con, {
                                                    $regex: temp.query[0].replace('unknown', '') // [code, name]
                                                });
                                                break;
                                            case 'date':
                                                result.$and = [];

                                                const start = {};
                                                start[con] = {};
                                                start[con].$gte = temp.query[0];
                                                result.$and.push(start);

                                                const end = {};
                                                end[con] = {};
                                                end[con].$lte = temp.query[1];
                                                result.$and.push(end);

                                                this.$set(this.sqlList_tableFilter, con, result);
                                                break;
                                        }
                                        this.tableColumns = this.tableColumns.map((item, index) => {
                                            if (index === colIndex) {
                                                item.filtering = true;
                                            }
                                            return item;
                                        });
                                    } else {
                                        this.$delete(this.sqlList_tableFilter, con);
                                        this.tableColumns = this.tableColumns.map((item, index) => {
                                            if (index === colIndex) {
                                                item.filtering = false;
                                            }
                                            return item;
                                        });
                                    }

                                    /* 刷新列表 */
                                    this.merge_query_list();
                                    this.currPage = 1;
                                    this.refreshData();
                                }
                            },
                            'update:showPopper': (val) => {
                                this.tableColumns = this.tableColumns.map((item, index) => {
                                    if (index === colIndex) {
                                        item.show_filter_content = val;
                                    } else if (val) {
                                        item.show_filter_content = false;
                                    }
                                    return item;
                                });
                            },
                            'update:query': (val) => {
                                if (this.config_tableFilter[column.key]) {
                                    this.$set(this.config_tableFilter[column.key], 'query', val);
                                }
                            },
                            'update:order_column': (val) => {
                                this.order_column = val;
                            },
                            'update:order_type': (val) => {
                                this.order_type = val;
                            },
                            'update:storageName_orderColumn': (val) => {
                                this.storageName_orderColumn = val;
                            }
                        }
                    });

                    /* 返回 DOM */
                    return h('div', {
                        class: 'table-filter-container'
                    }, [title, (this.order_column === order_column && this.order_type) ? sortIcons : undefined, column.hasOwnProperty('show_filter_content') ? filterPop : undefined]);
                };
            },
            empty_sort() {
                // 清空
                this.order_column = '';
                this.order_type = '';

                // 刷新
                this.currPage = 1;
                this.refreshData();
            },
            // close tag 时去掉对应的筛选条件并刷新
            remove_filter_tag(key) {
                // 清空筛选条件
                const temp = this.config_tableFilter[key];
                if (temp) {
                    switch (temp.filterType) {
                        case 'string':
                            temp.query = '';
                            break;
                        case 'select':
                        case 'countryArea':
                        case 'date':
                            temp.query = [];
                            break;
                    }
                    this.$set(this.config_tableFilter, key, temp);
                }

                // 设置表格 filtering 为 false , 并从表头筛选条件对象中去掉对应筛选项
                const index = this.tableColumns.findIndex(item => item.key === key);
                if (index !== -1) {
                    const col = this.tableColumns[index];
                    col.filtering = false;
                    this.$set(this.tableColumns, index, col);

                    this.$delete(this.sqlList_tableFilter, this.getSearchCon(key));
                }

                this.merge_query_list();
                this.currPage = 1;
                this.refreshData();
            },
            // 合并表头筛选和右上角筛选
            merge_query_list() {
                // 右上角筛选框优先级更高, a 为检索/常用检索条件, b 为表头检索条件
                const b = this.computed_sqlList_tableFilter;
                let a = [];
                switch (this.filtering) {
                    case 'search':
                        a = this.searchData;
                        break;
                    case 'searchCommon':
                        a = this.common_conditions;
                        break;
                }

                this.$set(this.queryData, '$and', a.concat(b));
            },
            // 获取所有 ads 账户列表, 做下拉筛选用
            getAllAdsAccount() {
                getGoogleAdsAccountList({
                    orgId: this.enterpriseId
                }).then(res => {
                    if (res.code === '1') {
                        // 处理表格数据
                        let dataList = res.data.content;
                        if (Array.isArray(dataList)) {
                            dataList = dataList.map(item => {
                                return {
                                    value: item.clientCustomerId,
                                    label: item.adsCustomerName
                                };
                            });
                        }

                        // 赋值
                        this.adsAccountList = dataList;

                        // 更新下拉筛选选项数据
                        this.setSelectOptions('adsAccount', this.adsAccountList);
                    }
                });
            },
            // 设置下拉筛选的选项
            setSelectOptions(columnKey, optionList) {
                if (this.config_tableFilter.hasOwnProperty(columnKey)) {
                    const temp = this.config_tableFilter[columnKey];

                    if (temp.filterType === 'select') {
                        temp.allList = optionList.slice();
                        this.$set(this.config_tableFilter, columnKey, temp);
                    }
                }
            },

            /* 右上角筛选 - 自定义检索 */
            // 根据第一选择筛选项设定第二筛选项的下拉框值
            handleChangeCon1(index) {
                const filterKey = this.conditionList[index].condition1;
                switch (filterKey) {
                    // 时间类
                    case 'conversionTime':
                        this.conditionList[index].conditionList2 = [
                            {
                                value: 'dateRange',
                                label: this.$t('crm.Table.con_periodOfTime')
                            },
                            {
                                value: '$lte',
                                label: this.$t('crm.Table.con_lessThan')
                            },
                            {
                                value: '$gte',
                                label: this.$t('crm.Table.con_greaterThan')
                            }
                        ];
                        this.conditionList[index].condition2 = 'dateRange';
                        this.conditionList[index].inputType = 'dateRange';
                        this.conditionList[index].condition3 = [];
                        break;
                    // 选项类
                    // 转化操作
                    // 广告账户
                    case 'conversionAction':
                    case 'adsAccount':
                        this.conditionList[index].conditionlist2 = [
                            {
                                value: '$eq',
                                label: this.$t('filter_box.equal')
                            },
                            {
                                value: '$nq',
                                label: this.$t('filter_box.unequal')
                            }
                        ];
                        this.conditionList[index].condition2 = '$eq';
                        this.conditionList[index].inputType = 'select';
                        this.conditionList[index].condition3 = '';
                        this.conditionList[index].conditionList3 = this.config_tableFilter[filterKey] ? (this.config_tableFilter[filterKey].allList || []).slice() : [];
                        break;
                    default:
                        this.conditionList[index].inputType = 'string';
                        this.conditionList[index].conditionList2 = this.conditionList2.slice();
                        this.conditionList[index].condition2 = '$eq';
                        this.conditionList[index].condition3 = '';
                        break;
                }
            },
            handleChangeCon2(index) {
                switch (this.conditionList[index].condition1) {
                    // 时间类
                    case 'conversionTime':
                        this.conditionList[index].inputType = 'date';
                        this.conditionList[index].condition3 = '';
                        if (this.conditionList[index].condition2 === 'dateRange') {
                            this.conditionList[index].inputType = 'dateRange';
                            this.conditionList[index].condition3 = [];
                        }
                        break;
                    // 其他
                    default:
                        this.conditionList[index].condition3 = '';
                }
            },
            addCon() {
                this.conditionList.push({
                    condition1: '',
                    conditionList1: this.conditionList1.slice(),
                    condition2: '',
                    conditionList2: this.conditionList2.slice(),
                    condition3: '',
                    conditionList3: [],
                    inputType: 'string'
                });
            },
            removeCon(index) {
                this.conditionList.splice(index, 1);
            },
            // 根据字段 key 获取字段在数据库中的名称, 以供后端查询
            getSearchCon(key) {
                console.log(key, 'key');
                switch (key) {
                    case 'visitorId':
                        return 'visitor_id';
                    case 'conversionAction':
                        return 'conversion_id';
                    case 'revenueValue':
                        return 'revenue_value';
                    case 'adsAccount':
                        return 'customer_id';
                    case 'campaign':
                        return 'campaign';
                    case 'adGroup':
                        return 'adgroup';
                    case 'keyWord':
                        return 'keyword';
                    case 'device':
                        return 'device';
                    case 'matchType':
                        return 'match_type';
                    case 'sumbitPerson':
                        return 'sumbit_person';
                    case 'conversionTime':
                        return 'conversion_time';
                    // case 'conversionStatus':
                    //     return 'conversion_status';
                    default:
                        return key;
                }
            },
            // 格式化检索数据
            getSearchValue(con1, con2, con3) {
                // 判断检索条件是否存在
                const searchCon = this.getSearchCon(con1);
                if (!searchCon) {
                    return {};
                }

                // 格式化数据
                const result = {};
                const temp = {};
                switch (con2) {
                    case 'dateRange':
                        if (Array.isArray(con3) && con3.length === 2) {
                            const tempObj1 = {}; // 暂存对象
                            const tempObj2 = {};
                            tempObj1[searchCon] = {};
                            tempObj1[searchCon].$gte = this.$options.filters.timeFormat(con3[0]);
                            tempObj2[searchCon] = {};
                            tempObj2[searchCon].$lte = `${this.$options.filters.timeFormat(con3[1])} 23:59:59.999`;
                            result.$and = [tempObj1, tempObj2];
                        }
                        break;
                    default:
                        temp[con2] = con3;
                        result[searchCon] = temp;
                }

                // 返回结果
                return result;
            },
            // 清空自定义检索条件
            empty() {
                this.id_selected_commonSearch = -1;
                this.common_conditions = [];
                this.searchData = [];
                this.conditionList = [];
                this.addCon();
                this.filtering = false;
                this.merge_query_list();
                this.currPage = 1;
                this.refreshData();
            },
            // 触发自定义检索
            search() {
                // 检测是否有筛选项为空
                if (!this.conditionList.length || !this.conditionList.every(item => item.condition1 !== '' && item.condition2 !== '' && item.condition3 !== '')) {
                    this.$Message.info(this.$t('website.searchTip'));
                    return;
                }

                // 格式化筛选条件数据
                this.searchData = this.conditionList.map(item => this.getSearchValue(item.condition1, item.condition2, item.condition3));

                // 进行筛选
                this.filtering = 'search';
                this.id_selected_commonSearch = -1;
                this.merge_query_list();
                this.currPage = 1;
                this.refreshData();
            },
            // 保存为常用检索
            saveSearch() {
                // 筛选名称不能为空
                if (this.custom_search_name.trim() === '') {
                    this.$Message.info(this.$t('website.detection'));
                    return;
                }
                // 筛选名称不能重复
                if (this.list_commonSearch.some(item => item.searchName === this.custom_search_name)) {
                    this.$Message.info(this.$t('crm.Table.error_sameCommonSearchName'));
                    return;
                }
                // 检测是否有筛选项为空
                if (!this.conditionList.length || !this.conditionList.every(item => item.condition1 !== '' && item.condition2 !== '' && item.condition3 !== '')) {
                    this.$Message.info(this.$t('crm.Table.info_saveEmptyConditions'));
                    return;
                }

                // 处理要保存的数据
                const conditions = this.conditionList.map(item => this.getSearchValue(item.condition1, item.condition2, item.condition3));

                // 发送保存请求
                this.saveSearchLoading = true;
                util.ajaxJson({
                    url: '/crm/commonSearch/saveCommonSearch',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        type: this.columnType,
                        userId: this.userId,
                        searchContent: JSON.stringify(conditions),
                        searchName: this.custom_search_name
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.get_commonSearch();
                        this.$Message.success(this.$t('crm.Table.success_save'));
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_save'));
                        this.saveSearchLoading = false;
                    }
                }).catch(error => {
                    this.$Message.error(this.$t('crm.Table.error_save'));
                    this.saveSearchLoading = false;
                });
            },

            /* 右上角筛选 - 常用检索 */
            // 点击常用检索项检索
            searchCommon(item) {
                if (item.searchContent) {
                    this.filtering = 'searchCommon';
                    this.id_selected_commonSearch = item.id;
                    this.common_conditions = this.$options.filters.parseArray(item.searchContent);
                    this.merge_query_list();
                    this.currPage = 1;
                    this.refreshData();
                } else {
                    this.$Message.error(this.$t('crm.Table.error_getCommonSearchItem'));
                }
            },
            // 获取常用检索列表
            get_commonSearch() {
                this.saveSearchLoading = true;
                util.ajaxJson({
                    url: '/crm/commonSearch/getCommonSearchList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        type: this.columnType,
                        userId: this.userId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.list_commonSearch = res.data.data;
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getCommonSearchList'));
                    }
                    this.saveSearchLoading = false;
                }).catch(error => {
                    this.saveSearchLoading = false;
                    this.$Message.error(this.$t('crm.Table.error_getCommonSearchList'));
                });
            },
            // 弹出删除常用检索提示框
            delete_commonSearch(id, searchName) {
                this.deleteCommonSearchVisible = true;
                this.deleteCommonSearchId = id;
                this.deleteCommonSearchName = searchName;
            },
            // 取消删除常用检索
            cancelDel_commonSearch() {
                this.deleteCommonSearchVisible = false;
                this.deleteCommonSearchId = '';
                this.deleteCommonSearchName = '';
            },
            // 确认删除常用检索项
            sureDel_commonSearch() {
                this.loading_deleteCommonSearch = true;
                const id = this.deleteCommonSearchId;
                util.ajaxJson({
                    url: '/crm/commonSearch/deleteCommonSearch',
                    method: 'get',
                    params: {
                        id
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.list_commonSearch = this.list_commonSearch.filter(item => item.id !== id);
                        this.$Message.success(this.$t('crm.UniSet.success_delete'));
                        this.cancelDel_commonSearch();

                        // 如果被删除的常用检索刚好是当前正在检索的常用检索, 则清空常用检索, 重新刷新
                        if (this.id_selected_commonSearch === id && this.filtering === 'searchCommon') {
                            this.id_selected_commonSearch = -1;
                            this.filtering = false;
                            this.merge_query_list();
                            this.currPage = 1;
                            this.refreshData();
                        }
                    } else {
                        this.$Message.error(this.$t('crm.UniSet.error_delete'));
                    }
                    this.loading_deleteCommonSearch = false;
                }).catch(error => {
                    this.$Message.error(this.$t('crm.UniSet.error_delete'));
                    this.loading_deleteCommonSearch = false;
                });
            }
        }
    };
</script>

<style scoped lang="less">
    .table_wrap p {
        color: rgba(0, 0, 0, 0.6);
    }

    .loop-btn /deep/ .el-button {
        font-size: 14px;
        /*border-bottom: 1px solid #cbd6e2;
        border-left: 1px solid transparent;
        border-top: 1px solid transparent;
        border-right: 1px solid transparent;*/
        border-radius: 0;
        border: none;
    }

    .loop-btn /deep/ .el-button--warning {
      /*border-bottom: 1px solid #fa6340;*/
        background-color: #FFFFFF;
        padding-left: 10px;
        padding-right: 10px;
      &>span {
        display: inline-block;
        height: 100%;
        color: #FA8241;
        border-bottom: 2px solid #FA8241;
        line-height: 33px;
      }
    //   &:focus, &hover {
    //     box-shadow: none;
    //   }
    }

    .loop-btn /deep/ .el-button--text {
        padding: 10px;
        color: rgba(0, 0, 0, 0.6);
    }

    .appoint-sale {
        height: 68px;
        background-color: #f0f0f0;
        line-height: 68px;
        padding-left: 32px;
    }

    .clue-label {
        width: 100px;
        display: inline-block;
        margin-right: 20px;
        text-align: right;
    }

    .clue-item {
        display: inline-block;
    }

    .grade {
        width: 236px;
        display: inline-block;
        position: relative;
    }

    .wrap {
        float: left;
        margin-bottom: 20px;
        &:last-child {
            margin-bottom: 0;
        }
    }

    .customFieldTextarea {
        width: 100% !important;
        height: auto !important;
        clear: left;
    }

    .title {
        font-size: 18px;
        color: #333333;
        line-height: 60px;
    }

    .pagewrap {
        /*float: right;*/
        text-align: center;
        position: absolute;
        left: 50%;
        transform: translate(-50%)
    }

    .datewrap > span {
        float: right;
        position: relative;
        margin-bottom: 15px;
    }

/*    .condition /deep/ .el-button--text {
        color: rgba(0, 0, 0, 0.8);
    }

    .condition /deep/ .el-button--text:hover {
        color: #4285f4;
    }*/

    .onnetwork {
        overflow: hidden;
    }

    .extensiondevice > h3, .onnetwork > h3 {
        float: left;
        margin-right: 30px;
    }

    .extensiondevice label, .onnetwork label {
        margin-bottom: 10px;
    }

    .alldevice, .allnetwork {
        float: left;
        margin: 2px 15px 0 0;
    }

    .condition > h3 {
        margin-bottom: 10px;
    }

    .conditionmain > div {
        width: 250px;
        display: inline-block;
    }

    .conditionwrap {
        max-height: 136px;
        overflow: auto;
    }

    .filter-top {
        height: 40px;
        border-bottom: 1px solid #d0cece;
        margin-bottom: 15px;
    }

    .filter-top-li {
        display: inline-block;
        width: 181px;
        text-align: center;
        line-height: 40px;
        font-size: 14px;
        font-weight: bold;
        color: #908f8f;
        cursor: pointer;
    }

    .filter-checked {
        /*color: #414040;*/
      color: #fb8b2f;
    }

    .filter-checked span {
        width: 47px;
        height: 2px;
        border-radius: 3px;
        background-color: #fb8b2f;
        display: block;
        margin: auto;
        margin-top: -2px;
    }

    .filter-tips {
        margin-bottom: 10px;
        font-size: 14px;
        color: #535353;
    }

    .commentwrap {
        max-height: 136px;
        margin-bottom: 10px;
        overflow-y: auto;
    }

    .eachlist {
        height: 36px;
        cursor: pointer;
    }

    .eachlist:hover {
        background: #f7f7f8;
    }

    .eachlist .listtitle {
        line-height: 36px;
        margin-left: 10px;
    }

    .eachlist .removelist {
        font-size: 18px;
        position: absolute;
        right: 10px;
    }

    .eachlist .removelist:hover {
        color: #fb8b2f;
    }

    .newcustome {
        float: right;
        background: #51b7a3;
        border-color: #51b7a3;
    }

    .table .title {
        font-size: 14px;
        font-weight: bold;
    }

    .table /deep/ table {
        width: 100% !important;
        .ivu-table-cell {
            overflow-y: auto;
            max-height: 100px;
            color: rgba(0, 0, 0, 0.8);
        }
    }

    .inputwrap1 {
        height: 38px;
        border-radius: 2px;
        float: left;
        /*position: relative;*/
    }

    .picwrap1 {
        float: left;
        width: 188px;
        height: 32px;
        border: 1px solid #dbdbdb;
        border-radius: 2px;
        margin: 2px 0 0 5px;
    }

    .addmark {
        color: #fc8b2f;
        text-align: center;
        margin-left: 300px;
        cursor: pointer;
    }

    .demo-spin-container {
        display: inline-block;
        width: 100%;
        height: 400px;
        position: absolute;
        top: 50px;
        left: 0;
    }
</style>

<style>
    .tabmain .ivu-table-column-center:hover .show-edit-btn {
        display: block !important;
        margin-left: -10px !important;
    }

    /*表单始终铺满界面*/
    .tabmain table {
        width: 100% !important;
    }

    /* 超出部分隐藏 */
    div.ivu-table-cell span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* 超出部分显示 */
    /*td:hover div.ivu-table-cell span {*/
    /*    text-overflow: inherit;*/
    /*    overflow: visible;*/
    /*    white-space: pre-line;*/
    /*}*/
</style>

<style>
    /* 超出部分隐藏 */
    div.ivu-table-cell span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* 超出部分显示 */
    /*td:hover div.ivu-table-cell span {*/
    /*    text-overflow: inherit;*/
    /*    overflow: visible;*/
    /*    white-space: pre-line;*/
    /*}*/

    .tabmain table {
        width: 100% !important;
    }

    /*.tabmain > .ivu-table td, .tabmain > .ivu-table th {*/
    /*text-align: center;*/
    /*}*/

    .tabmain > .ivu-table th {
        font-size: 14px;
    }

    /*.tabmain > .ivu-table tbody tr:hover td {*/
    /*    background: #f8f8f9;*/
    /*    color: #FA8241;*/
    /*}*/

    .checkboxgroup > label {
        display: block;
        margin-bottom: 5px;
    }

    .conditionmain > .ivu-select .ivu-select-dropdown {
        max-height: 140px;
    }

    .color > ul > li .ivu-icon {
        margin: -2px 0 0 2px;
        line-height: 1 !important;
    }

    .inputwrap1 > .ivu-auto-complete.ivu-select.ivu-select-single .ivu-input-icon {
        right: 30px;
    }
</style>
