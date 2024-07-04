<template>
    <div class="cloud-push-homepage-wrapper">
        <div class="homepage-head">
<!--            <Tabs v-model="activeName" @tab-click="handleTabClick">-->
<!--                <TabPane label="全部" name="all"></TabPane>-->
<!--                <TabPane label="昨天" name="yesterday"></TabPane>-->
<!--                <TabPane label="近7天" name="week"></TabPane>-->
<!--                <TabPane label="近15天" name="fifteen"></TabPane>-->
<!--            </Tabs>-->
            <Menu mode="horizontal" class="portal-set-menu" :default-active="activeName" @select="handleTabClick">
                <MenuItem index="all">
                   {{$t('material.Tabs.all')}}
                </MenuItem>
                <MenuItem index="yesterday">
                    {{$t('material.Tabs.lastDay')}}
                </MenuItem>
                <MenuItem index="week">
                    {{$t('material.Tabs.last7Day')}}
                </MenuItem>
                <MenuItem index="fifteen">
                    {{$t('material.Tabs.last15Day')}}
                </MenuItem>
            </Menu>
            <div class="homepage-text">
                <span class="homepage-general">{{$t('material.Data.dataOverview')}}</span>
                <span class="homepage-time">{{$t('material.Data.endDate')}}{{currentTime}}</span>
            </div>
            <div class="homepage-data">
                <div class="homepage-data-item">
                    <div class="homepage-data-name">{{$t('material.Data.shares')}}</div>
                    <div class="homepage-data-num">{{shareCount}}</div>
                </div>
                <div class="homepage-data-item border">
                    <div class="homepage-data-name">{{$t('material.Data.views')}}</div>
                    <div class="homepage-data-num">{{pv}}</div>
                </div>
                <div class="homepage-data-item">
                    <div class="homepage-data-name">{{$t('material.Data.visitors')}}</div>
                    <div class="homepage-data-num">{{uv}}</div>
                </div>
            </div>
            <div class="homepage-data-line"></div>
            <div class="homepage-data-button">
                <Button type="primary" @click="toNew" class="homepage_new">{{$t('material.New.create')}}</Button>
                <div class="homepage-data-select" v-if="multipleSelection.length >= 1">
                    <span>已选中{{multipleSelection.length}}项</span>
                    <button class="homepage-data-delete" @click="deleteModal = true">{{$t('material.New.delete')}}</button>
                </div>
            </div>
            <div class="homepage-data-table">
                <div>
                    <div class="table_wrap">
                        <div class="table">
                       <!-- :customEmptyText="customEmptyTextLang"
                       :customEmptyButtonText="customEmptyButtonTextLang"
                       :customClearMethod="clearFilterConditionByInitView" -->
                            <Table class="tabmain"
                                   ref="table"
                                   size="medium"
                                   :isCustom="true"
                                   :height="table_height"
                                   highlight-current-row
                                   :data="data1"
                                   v-loading="loading"
                                   @sort-change="changesort"
                                   @selection-change="handleSelectionChange">
                                <TableColumn
                                        type="selection"
                                        width="55"
                                ></TableColumn>
                                <TableColumn v-for="item in columns1"
                                             :key="item.key"
                                             :prop="item.key"
                                             :label="item.title"
                                             :width="item.width"
                                             :min-width="item.width || 64"
                                             :formatter="item.formatter"
                                             :render-header="item.renderHeader"
                                             :show-overflow-tooltip="true">
                                    <template slot-scope="scope">
                                        <template v-if="item.formatter">
                                            {{(item.formatter)(scope.row) }}
                                        </template>
                                        <template  v-else-if="item.key === 'filename'">
                                           <span :style="{color : scope.row.fileDelete === 1 ? '#999999' : '#606266'}">{{scope.row[item.key] }}</span>
                                        </template>
                                        <template v-else>
                                            {{ scope.row[item.key] }}
                                        </template>
                                    </template>
                                </TableColumn>
                                <TableColumn :label="$t('material.New.operation')" width="120" >
                                    <template  slot-scope="scope">
                                        <!--pushStatus=2已推送-->
                                        <template v-if="scope.row.pushStatus === 2">
                                            <div  class="cloud-push-btn">
                                                <button class="cloud-push-button homepage_detail" size="mini" @click="toDetail(scope.row)">{{$t('material.New.details')}}</button>
                                                <button v-if="scope.row.fileDelete === 0" class="cloud-push-button homepage_share" size="mini" @click="toShare(scope.row)">{{$t('material.New.share')}}</button>
                                            </div>
                                        </template>
                                        <template v-else>
                                            <div  class="cloud-push-btn">
<!--                                                <button class="cloud-push-button" size="mini" @click="toDetail(scope.row)">查看详情</button>-->
                                                <button class="cloud-push-button homepage_edit" size="mini" @click="toEdit(scope.row)">{{$t('material.New.edit')}}</button>
                                                <button class="cloud-push-button homepage_priview" size="mini" @click="toPreview(scope.row)">{{$t('material.New.preview')}}</button>
                                                <button v-if="scope.row.fileDelete === 0" class="cloud-push-button homepage_share" size="mini" @click="toShare(scope.row)">{{$t('material.New.share')}}</button>
                                            </div>
                                        </template>
                                    </template>
                                </TableColumn>
                            </Table>
                            <div class="main-footer-page">
                                <Page :page-sizes="pagesizeopts"
                                      ref="pages" :total="totalpage"
                                      :current-page="curpage"
                                      :page-size="pagesize"
                                      @current-change="changePage"
                                      @size-change="sizeChange"
                                      layout='total, prev, pager, next, sizes, jumper, ->'></Page>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!--预览弹窗-->
        <CloudPushPreview ref="childPreview" :prviewVisible.sync="previewModel" @changePreviewModel="getMsg"></CloudPushPreview>
        <!--确认删除弹窗-->
        <Modal title="确认操作"
               :visible.sync="deleteModal"
               :modal-append-to-body="false"
               width="30%"
               >
            <span>确认将已勾选数据删除么？删除后已分享页将无法访问</span>
            <span slot="footer" class="dialog-footer">
                <Button @click="deleteModal = false">{{$t('material.Btn.cancel')}}</Button>
                <Button type="primary" class="homepage_delete" @click="deleteConfirm">{{$t('material.Btn.confirm')}}</Button>
            </span>
        </Modal>
        <Modal title="系统提示"
               :visible.sync="tipsModal"
               :modal-append-to-body="false"
               width="30%"
               :before-close="handleClose">
            <span>操作成功。</span>
            <span slot="footer" class="dialog-footer">
                <Button type="primary" @click="tipsConfirm">{{$t('material.Btn.confirm')}}</Button>
            </span>
        </Modal>
        <!-- 分享 -->
        <OnekyeShare ref="child" :dialogVisible.sync="dialogVisible" @changeShareModel="getMsgShare" @toRefreshPage="getShareBack"></OnekyeShare>
        <!-- 查看详情 -->
        <CloudPushDetails :detailVisible.sync="detailVisible" :id.sync="rowId" @changeDetailModel="getMsgDetail"></CloudPushDetails>
    </div>
</template>

<script>
    /* eslint-disable no-prototype-builtins */
    import util from '@/libs/util';
    import Utils from '@/utils';
    import _ from 'lodash';
    import { mapState } from 'vuex';
    import CloudPushPreview from './cloudPushPreview';
    import OnekyeShare from './onekyeShare';
    import CloudPushDetails from './cloudPushDetails';
    export default {
        name: 'cloundPushHomepage',
        components: {
            CloudPushPreview,
            OnekyeShare,
            CloudPushDetails
        },
        props: [
            'showField',
            'hasChatAuthority'
        ],
        data() {
            return {
                activeName: 'all',
                currentIndex: -1,
                showDetail: false,
                onLineTime: '2019-06-01 00:00:00', // 上线时间--晚 // 1559318400000
                timeLine: '',
                /* 筛选 */
                order_column: '',
                order_type: '',
                config_tableFilter: {
                    title: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    filename: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    pushStatus: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: [
                            {
                                value: 2,
                                label: '已推送'
                            },
                            {
                                value: 1,
                                label: '未推送'
                            }
                        ]
                    },
                    createTime: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型, string / date / select / countryArea
                        query: [], // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    shareCount: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    }

                },

                // 表头筛选条件
                sqlList_tableFilter: {},
                storageName_orderColumn: '',
                queryData: {
                    $and: []
                },

                indexType: 0, // 当前选择优化类型
                json_data: {},
                currOptimizeId: '', // 当前选择优化类型id
                msgIndex: '', // 当前行
                currentUrl: '', // 当前留言 网页url
                currentId: '', // 当前留言id
                currentProj: '', // 当前访客id
                currentRow: {}, // 当前行数据
                Email: '',
                seqNumber: '', // 线索编号
                emailModal: false, // 邮箱验证弹框
                saleList: [], // 销售列表
                saleName: '',
                saleId: '',
                source: 2, // 线索来源 1:访客历史,2:网站留言,3:直接创建,4:聊天
                clueModal: false, // 线索框状态
                delLoading: false, // 弹出框loading
                inputType: 'string', // 判断是否需要改变筛选条件 Input 为日期选择框
                nextCompanyId: '',
                middledata: [],
                // table_height: document.body.clientHeight-380,
                uploadImgList: [],
                urlImgList: [],
                uploadList: [],
                urlList: [],
                imgName: '',
                loading: true, // 加载图标
                columns1: [
                    { title: this.$t('material.tableLabel.shareTitle'), key: 'title', width: 210 },
                    {
                        title: this.$t('material.New.shareFiles'), key: 'filename', width: 210
                    },
                    {
                        title: this.$t('material.New.size'),
                        key: 'size',
                        width: 150,
                        formatter: row => {
                            const result = Number(row.size);
                            if (isNaN(result)) {
                                return row.size;
                            } else {
                                const kiloByte = (result / 1024).toFixed(2);
                                if (kiloByte < 1) {
                                    return `${result}B`;
                                }
                                const megaByte = (kiloByte / 1024).toFixed(2);
                                if (megaByte < 1) {
                                    return `${kiloByte}KB`;
                                }
                                const gigaByte = (megaByte / 1024).toFixed(2);
                                if (gigaByte < 1) {
                                    return `${megaByte}MB`;
                                }
                                const teraByte = (gigaByte / 1024).toFixed(2);
                                if (teraByte < 1) {
                                    return `${gigaByte}GB`;
                                }
                            }
                        }
                    },
                    {
                        title: this.$t('material.New.status'),
                        key: 'pushStatus',
                        width: 150,
                        formatter: row => {
                            if (row.pushStatus === 2) {
                                return '已推送';
                            } else {
                                return '未推送';
                            }
                        }
                    },
                    {    title: this.$t('material.New.createTime'), key: 'createTime', width: 150 },
                    { title: this.$t('material.New.shares'), key: 'shareCount', width: 120 }
                ], // 表格列名称
                allcolumns: [], // 表格全部列
                data1: [],
                alldata1: [],
                status: '',
                List: [
                    {
                        value: '10条/页',
                        label: '10条/页'
                    },
                    {
                        value: '20条/页',
                        label: '20条/页'
                    },
                    {
                        value: '30条/页',
                        label: '30条/页'
                    },
                    {
                        value: '50条/页',
                        label: '50条/页'
                    }
                ], // 页面容量
                pagenum: 1,
                perpagenum: '20条/页',
                totalpage: 0,
                templateList: [], // 线索模板列表
                curpage: 1,
                pagesize: 10,
                maxpagenum: 1,
                pagesizeopts: [10, 20, 30, 50],
                datevalue: [],
                options2: {
                    // 禁用时间
                    disabledDate(date) {
                        return '';
                    }
                },
                indeterminate: false,
                checkAll: true,
                condition1: '',
                // 筛选字段：字段列表
                condition2: '',
                condition3: '',
                addcondition: [],
                startDate: '',
                endDate: '',
                isChecked: true,
                filterTerm: true, // 检索
                value: '',
                commentsearchlist: [],
                formModel: '', // 选中的表单
                optimizeList: [], // 转化类型列表
                filterCon: '',
                searchData: [],
                orderType: '', // orderType
                currentTime: '',
                previewModel: false,
                multipleSelection: [],
                deleteModal: false,
                tipsModal: false,
                dialogVisible: false,
                detailVisible: false,
                shareCount: 0,
                pv: 0,
                uv: 0,
                rowId: ''
            };
        },
        created() {
            // 分享统计
            this.getShareCloud();
            this.timeLine = new Date(this.onLineTime).getTime();
            this.columns1 = this.columns1.map((col, index) => {
                if (this.config_tableFilter.hasOwnProperty(col.key)) {
                    col.show_filter_content = false;
                    col.filtering = false;
                    col.renderHeader = this.renderHeader_filter(index);
                }
                return col;
            });
            this.init_filter_table();
            this.currentTime = `${new Date().format('hh:mm:ss')}`;
            this.getPageSize();
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                window_height: state => state.window_height
            }), // 从 vuex 中获取属性
            table_height() {
                const temp = this.window_height ? this.window_height - 400 : document.body.clientHeight - 400;
                return temp > 200 ? temp : 200;
            },

            /* 右上角筛选条件处理结果 */
            computed_addCondition() {
                return this.addCondition.filter(item => (item.condition1 && item.condition2 && ((item.condition3 && item.condition3.length) || item.condition3 instanceof Date || (typeof item.condition3 === 'number' && !isNaN(item.condition3))))).map(item => {
                    const temp = {};
                    const con = this.computedGetSearchCon(item.condition1);
                    const type = this.getSearchType(item.condition2);
                    switch (item.inputType) {
                        case 'string':
                        case 'number':
                        case 'boolean':
                        case 'countryArea':
                        case 'date':
                            temp[con] = {};
                            if (item.inputType === 'countryArea') {
                                temp[con][type === '$ne' ? '$nregex' : '$regex'] = this.$options.filters.timeFormat(item.condition3).replace('unknown', '');
                            } else {
                                temp[con][type] = this.$options.filters.timeFormat(item.condition3);
                            }
                            if (type === '$gt') {
                                temp[con][type] = `${temp[con][type]} 23:59:59`;
                            }
                            return temp;
                        case 'select':
                            temp[con] = {};
                            temp[con][type] = item.condition3;
                            return temp;
                        case 'dateRange':
                            temp.$and = [];
                            const start = {};
                            start[con] = {};
                            start[con].$gte = item.condition3[0];
                            temp.$and.push(start);
                            const end = {};
                            end[con] = {};
                            end[con].$lte = item.condition3[1];
                            temp.$and.push(end);
                            return temp;
                        case 'array':
                            switch (con) {
                                case 'companyManagers':
                                    temp[con] = {};
                                    temp[con].$eq = item.condition3;
                                    break;
                                default:
                                    temp.$or = item.condition3.map(val => {
                                        const temp = {};
                                        temp[con] = {};
                                        temp[con][type] = val;
                                        return temp;
                                    });
                            }
                            return temp;
                    }
                }).filter(item => !(!item || item === ''));
            },
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
                    } else {
                        temp[key] = val;
                    }
                    return temp;
                });
            }
        },
        methods: {
            // filterTags 组件内部修改筛选值后触发的方法, 由下方的 updateList 改造而成
            change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    const column = this.columns1.find(item => item.key === key);
                    if (column) {
                        // 判断是否有值, 调整 sqlList
                        const con = column.fieldType === 'custom' ? key : this.getSearchCon(key);
                        console.log('con2', con);
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
                            this.columns1 = this.columns1.map((item, index) => {
                                if (item.key === key) {
                                    item.filtering = true;
                                }
                                return item;
                            });
                        } else {
                            this.$delete(this.sqlList_tableFilter, con);
                            this.columns1 = this.columns1.map((item, index) => {
                                if (item.key === key) {
                                    item.filtering = false;
                                }
                                return item;
                            });
                        }

                        this.merge_query_list();
                        this.curpage = 1;
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
                this.merge_query_list();
            },
            // 设定初始筛选条件
            init_filter(key, title, val) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    this.$set(this.config_tableFilter[key], 'query', val);
                    const con = this.getSearchCon(title);
                    console.log('con', con);
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

            /* 加载列表 */
            getTemplateList() {
                console.log('getTemplateList');
                const data = {
                    orderType: this.order_type || 'asc',
                    orderColumn: this.order_column || 'id', // 排序字段
                    page: this.curpage,
                    pageNumber: this.pagesize,
                    day: this.activeName
                };
                util.ajax233({
                    url: '/push/getList',
                    method: 'post',
                    data: data
                }).then(res => {
                    if (res.data.code === '1') {
                        this.optimizeList = res.data.data.list;
                        const List = res.data.data.list;
                        if (List.length > 0) {
                            this.init_filter_table();
                        }
                    } else {
                        this.$Message.error(res.data.message);
                    }
                });
            },
            // 获取分享统计数据
            getShareCloud() {
                const data = {
                    day: this.activeName
                };
                util.ajax233({
                    url: '/shareRecord/getStatistics',
                    method: 'post',
                    data: data
                }).then(res => {
                    if (res.data.code === '1') {
                        const data = res.data.data;
                        this.shareCount = data.shareCount;
                        this.pv = data.pv;
                        this.uv = data.uv;
                    } else {
                        this.$Message.error(res.data.message);
                    }
                });
            },
            handleData(dataList) {
                const emailReg = Utils.regExp.fullEmail;
                const telReg = new RegExp('^([\+]|(00))?[0-9]{7,13}$');
                dataList = dataList.map((item, index) => {
                    if (item.editTime) {
                        item.editTime = new Date(item.editTime).format('yyyy-MM-dd hh:mm:ss');
                    } else {
                        item.editTime = new Date(item.createTime).format('yyyy-MM-dd hh:mm:ss');
                    }
                    if (['1000', '1002'].includes(String(this.enterpriseId))) {
                        for (const key in item) {
                            item[`b${key}`] = item[key];
                        }
                    } else {
                        for (const key in item) {
                            if (item[key]) {
                                const newKey = `b${key}`;
                                if (key.indexOf('a100') !== -1) { /* 表单字段中 */
                                    if (emailReg.test(item[key])) { /* 检测是邮箱格式 */
                                        const emailArr = item[key].split('@');
                                        emailArr[0] = '****';
                                        item[newKey] = emailArr.join('@');
                                    } else if (telReg.test(item[key].replace(/\s/g, ''))) { /* 去掉字符串中空格 检测是电话 */
                                        item[newKey] = `${item[key].slice(0, -4)}****`;
                                    } else {
                                        item[newKey] = item[key];
                                    }
                                }
                            }
                        }
                    }
                    return item;
                });
            },
            /* 刷新表格数据 */
            refreshData() {
                this.loading = true;
                const data = {
                    orderType: this.order_type,
                    orderColumn: this.order_column, // 排序字段
                    page: this.curpage,
                    pageNumber: this.pagesize,
                    query: this.queryData.$and.length ? JSON.stringify(this.queryData) : undefined,
                    day: this.activeName
                };
                util.ajax233({
                    url: '/push/getList',
                    method: 'post',
                    data: data
                }).then(res => {
                    if (res.data.code === '1') {
                        if (res.data.data !== null) {
                            this.data1 = res.data.data.list;
                            console.log('data1', this.data1);
                            this.totalpage = res.data.data.total;
                        } else {
                            this.data1 = [];
                            this.totalpage = 0;
                        }
                    } else {
                        this.data1 = [];
                        this.totalpage = 0;
                        this.$Message.error(res.data.message);
                    }
                    this.loading = false;
                });
            },
            /* 当前页显示内容 */
            changecontent(pagenumstart, pagenumend) {
                this.data1 = [];
                for (let i = pagenumstart; i < pagenumend; i++) {
                    this.data1.push(this.alldata1[i]);
                }
            },
            /* 改变页码 */
            changePage(page) {
                this.data1 = [];
                this.loading = true;
                this.curpage = page;
                this.refreshData();
            },
            /* 改变日期 */
            changeDate(date) {
                this.loading = true;
                this.startDate = date[0];
                this.endDate = date[1];
                this.refreshData();
            },
            start() {
                this.$Loading.start();
            },
            finish() {
                this.$Loading.finish();
            },
            error() {
                this.$Loading.error();
            },
            /* 筛选字段-获取检索类型 */
            getSearchCon(str) {
                console.log(str, 'str');
                switch (str) {
                    case '分享标题':
                    case 'title':
                        return 'title';
                        break;
                    case '分享文件':
                    case 'filename':
                        return 'filename';
                        break;
                    case '大小':
                    case 'size':
                        return 'size';
                        break;
                    case '状态':
                    case 'pushStatus':
                        return 'pushStatus';
                        break;
                    case '创建时间':
                    case 'createTime':
                        return 'createTime';
                        break;
                    case '分享次数':
                    case 'shareCount':
                        return 'shareCount';
                        break;
                    default:
                        return str;
                        break;
                }
            },
            /* 筛选字段-检索 */
            searchdata() {
                let flag = false; // 可检索标志，为 true 时才可检索
                this.searchData = []; // 搜索条件集合，这里的结构比较复杂
                let updateTimes = ''; // 时间段类型数据，在发送时单独一字段
                this.isSearching = -1;
                // 判断是否能进行筛选，需满足条件：无空属性，无重复检索类型
                if (this.condition1 !== '' && this.condition2 !== '' &&
                    this.condition3 !== '') { // 如果最基本的三属性都不为空
                    flag = this.addcondition.every(item => {
                        if (item.condition1 !== '' &&
                            item.condition2 !== '' && item !== '') {
                            return true;
                        }
                    }); // 那么检测是否 addcondition 所有属性都不为空
                    if (!flag) {
                        this.$Message.info(this.$t('website.searchTip'));
                    }
                } else { // 基本三属性有空则提示不能为空
                    this.$Message.info(this.$t('website.searchTip'));
                }

                if (flag) { // 可筛选
                    let timeFlag = false;

                    let tempObj = {}; // 暂存对象
                    let searchCon = this.getSearchCon(this.condition1); // 检索类型

                    if (searchCon === 'create_time') { // 时间段类型，不写在 query 中
                        timeFlag = true;
                        updateTimes = this.condition3.map(item => {
                            return item.format('yyyy-MM-dd');
                        }).join(',');
                    } else { // 否则在 query 中填入格式数据
                        tempObj[searchCon] = {};
                        switch (this.condition2) {
                            case this.$t('filter_box.contain'):
                                tempObj[searchCon].$regex = this.condition3;
                                break;
                            case this.$t('filter_box.not_contain'):
                                tempObj[searchCon].$nregex = this.condition3;
                                break;
                            case this.$t('filter_box.equal'):
                                tempObj[searchCon].$eq = this.condition3;
                                break;
                            case this.$t('filter_box.unequal'):
                                tempObj[searchCon].$ne = this.condition3;
                                break;
                            case this.$t('filter_box.gt'):
                                tempObj[searchCon].$gt = this.condition3;
                                break;
                            case this.$t('filter_box.gte'):
                                tempObj[searchCon].$gte = this.condition3;
                                break;
                            case this.$t('filter_box.lt'):
                                tempObj[searchCon].$lt = this.condition3;
                                break;
                            case this.$t('filter_box.lte'):
                                tempObj[searchCon].$lte = this.condition3;
                                break;
                        } // 格式化数据
                        this.searchData.push(tempObj); // 填入发送数据
                    }
                    for (const item of this.addcondition) { // 遍历附加筛选条件
                        tempObj = {}; // 暂存对象
                        searchCon = this.getSearchCon(item.condition1); // 检索类型

                        if (searchCon === 'create_time') { // 时间段类型，不写在 query 中
                            if (timeFlag === true) {
                                this.$Message.error(this.$t('website.searchTip1'));
                                flag = false;
                                break;
                            } else {
                                timeFlag = true;
                                updateTimes = item.condition3.map(item => {
                                    return item.format('yyyy-MM-dd');
                                }).join(',');
                            }
                        } else {
                            tempObj[searchCon] = {};
                            switch (item.condition2) {
                                case this.$t('filter_box.contain'):
                                    tempObj[searchCon].$regex = item.condition3;
                                    break;
                                case this.$t('filter_box.equal'):
                                    tempObj[searchCon].$eq = item.condition3;
                                    break;
                                case this.$t('filter_box.unequal'):
                                    tempObj[searchCon].$ne = item.condition3;
                                    break;
                                case this.$t('filter_box.gt'):
                                    tempObj[searchCon].$gt = item.condition3;
                                    break;
                                case this.$t('filter_box.gte'):
                                    tempObj[searchCon].$gte = item.condition3;
                                    break;
                                case this.$t('filter_box.lt'):
                                    tempObj[searchCon].$lt = item.condition3;
                                    break;
                                case this.$t('filter_box.lte'):
                                    tempObj[searchCon].$lte = item.condition3;
                                    break;
                            } // 格式化数据
                            this.searchData.push(tempObj);
                        }
                    }
                }

                if (flag) {
                    this.filtering = 'search';
                    this.merge_query_list();
                    this.curpage = 1;
                    this.refreshData();
                } else {
                    this.$Message.info(this.$t('crm.Table.info_searchEmptyConditions'));
                }
            },
            /* 清空检索条件 */
            empty() {
                this.condition1 = '';
                this.condition2 = '';
                this.condition3 = '';
                this.inputType = 'string';
                this.addcondition = [];
                this.filterCon = '';

                this.filtering = false;

                this.merge_query_list();
                this.curpage = 1;
                this.refreshData();
            },
            changesort(a) {
                this.alldata1 = _.orderBy(this.alldata1, a.key, a.order);
                this.changePage(1);
            },
            filter1() {
                this.isChecked = true;
                this.filterTerm = true;
            },
            filter2() {
                this.isChecked = false;
                this.filterTerm = false;
            },
            /* 格式化中英文到 sql 查询所需格式 */
            // 获取检索字段名称对应的数据库字段名
            computedGetSearchCon(str) {
                switch (str) {
                    case '分享标题':
                        return 'title';
                    case '分享文件':
                        return 'filename';
                    case '大小':
                        return 'size';
                    case '状态':
                        return 'pushStatus';
                    case '创建时间':
                        return 'createTime';
                    case '分享次数':
                        return 'shareCount';
                    default:
                        return str;
                }
            },
            // 返回字段筛选渲染函数
            renderHeader_filter(colIndex) {
                return h => {
                    const column = this.columns1[colIndex];
                    /* DOM */
                    // 标题
                    const title = h('div', {
                        style: {
                            display: 'inline'
                        }
                    }, column.title);
                    // 排序组件
                    let order_column = this.computedGetSearchCon(column.title);
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
                        }),
                        h('Icon', {
                            class: {
                                on: this.order_column === order_column && this.order_type === 'desc'
                            },
                            props: {
                                type: 'md-arrow-dropdown'
                            }
                        })
                    ]);
                    // 筛选组件
                    const filterPop = h('FilterBox', {
                        props: Object.assign({
                            showPopper: this.columns1[colIndex].show_filter_content,
                            filtering: this.columns1[colIndex].filtering,
                            columnKey: column.key,
                            columnCon: order_column,
                            order_type: this.order_type,
                            order_column: this.order_column,
                            storageName_orderColumn: this.storageName_orderColumn,
                            dateOptions: this.options2
                        }, this.config_tableFilter[column.key]),
                        on: {
                            updateList: () => {
                                const temp = this.config_tableFilter[column.key];
                                if (temp) {
                                    /* 处理筛选 */
                                    // 判断是否有值, 调整 sqlList
                                    const con = this.computedGetSearchCon(column.title);
                                    console.log('con1', con);
                                    if (temp.query.length) {
                                        const result = {};
                                        switch (temp.filterType) {
                                            case 'string':
                                                // 分享次数用eq
                                                if (con === 'shareCount') {
                                                    this.$set(this.sqlList_tableFilter, con, {
                                                        $eq: temp.query
                                                    });
                                                } else {
                                                    this.$set(this.sqlList_tableFilter, con, {
                                                        $regex: temp.query
                                                    });
                                                }
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
                                        this.columns1 = this.columns1.map((item, index) => {
                                            if (index === colIndex) {
                                                item.filtering = true;
                                            }
                                            return item;
                                        });
                                    } else {
                                        this.$delete(this.sqlList_tableFilter, con);
                                        this.columns1 = this.columns1.map((item, index) => {
                                            if (index === colIndex) {
                                                item.filtering = false;
                                            }
                                            return item;
                                        });
                                    }

                                    /* 刷新列表 */
                                    this.merge_query_list();
                                    this.curpage = 1;
                                    // 列排序
                                    this.refreshData();
                                }
                            },
                            'update:showPopper': (val) => {
                                this.columns1 = this.columns1.map((item, index) => {
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
                        style: {
                            position: 'relative'
                        }
                    }, [title, (this.order_column === order_column && this.order_type) ? sortIcons : undefined, column.hasOwnProperty('show_filter_content') ? filterPop : undefined]);
                };
            },
            empty_sort() {
                // 清空
                this.order_column = '';
                this.order_type = '';

                // 刷新
                this.curpage = 1;
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
                const index = this.columns1.findIndex(item => item.key === key);
                if (index !== -1) {
                    const col = this.columns1[index];
                    col.filtering = false;
                    this.$set(this.columns1, index, col);

                    this.$delete(this.sqlList_tableFilter, this.getSearchCon(col.title));
                }

                this.merge_query_list();
                this.curpage = 1;
                this.refreshData();
            },
            // 合并表头筛选和右上角筛选
            merge_query_list() {
                // 右上角筛选框优先级更高, a 为检索/常用检索条件, b 为表头检索条件
                let b = this.computed_sqlList_tableFilter;
                let a = [];
                switch (this.filtering) {
                    case 'search':
                        a = this.searchData;
                        break;
                    case 'searchCommon':
                        a = this.common_conditions;
                        break;
                }

                // 处理负责人筛选, 优先使用右上角检索条件
                const subUserIds_a = a.filter(item => item.hasOwnProperty('companyManagers'));
                const subUserIds_b = b.filter(item => item.hasOwnProperty('companyManagers'));
                // 如果都有"负责人"筛选, 只取前者第一项, 否则取后者第一项或空数组
                const con_subUserIds = subUserIds_a[0] || subUserIds_b[0];
                if (con_subUserIds) {
                    this.subUserIds = con_subUserIds.companyManagers.$eq.join(',');
                } else {
                    this.subUserIds = '';
                }
                a = a.filter(item => !item.hasOwnProperty('companyManagers'));
                b = b.filter(item => !item.hasOwnProperty('companyManagers'));

                this.$set(this.queryData, '$and', a.concat(b));
            },
            handleTabClick(tab) {
                console.log(tab);
                this.activeName = tab;
                this.curpage = 1;
                this.getShareCloud();
                // tab切换列表联动刷新
                this.refreshData();
                if (tab === 'all') {
                    this.options2 = {
                        disabledDate(date) {
                            return '';
                        }
                    };
                } else if (tab === 'yesterday') {
                    this.options2 = {
                        disabledDate(date) {
                            const beforeyes = Date.now() - 2 * 24 * 60 * 60 * 1000;
                            const yestoday = Date.now() - 1 * 24 * 60 * 60 * 1000;
                            return date.valueOf() > yestoday || date.valueOf() < beforeyes;
                        }
                    };
                } else if (tab === 'week') {
                    this.options2 = {
                        disabledDate(date) {
                            const week = Date.now() - 7 * 24 * 60 * 60 * 1000;
                            const today = Date.now();
                            return date.valueOf() > today || date.valueOf() < week;
                        }
                    };
                } else if (tab === 'fifteen') {
                    this.options2 = {
                        disabledDate(date) {
                            const halfmonths = Date.now() - 15 * 24 * 60 * 60 * 1000;
                            const today = Date.now();
                            return date.valueOf() > today || date.valueOf() < halfmonths;
                        }
                    };
                }
            },
            handleSelectionChange(val) {
                console.log('val', val);
                this.multipleSelection = val;
            },
            // 批量删除
            deleteConfirm() {
                this.deleteModal = false;
                const ids = this.multipleSelection.map(item => item.id);
                const data = {
                    ids: ids
                };
                util.ajax233({
                    url: '/push/delete',
                    method: 'post',
                    data: data
                }).then(res => {
                    if (res.data.code === '1') {
                        this.tipsModal = true;
                    } else {
                        this.$Message.error(res.data.message);
                    }
                });
            },
            tipsConfirm() {
                this.handleClose();
            },
            handleClose() {
                this.tipsModal = false;
                this.refreshData();
            },
            toNew() {
                this.$emit('update:id', 0);
                this.$emit('update:showField', 1);
            },
            toDetail(row) {
                this.rowId = row.id;
                this.detailVisible = true;
                // this.$emit('update:id', row.id);
                // this.$emit('update:queryData', this.queryData);
                // this.$emit('update:showField', 2);
            },
            toEdit(row) {
                this.$emit('update:id', row.id);
                this.$emit('update:showField', 1);
            },
            toPreview(row) {
                this.previewModel = true;
                // 传预览接口参数
                // this.rowData = row;
                // console.log('0000000')
                this.$refs.childPreview.getPrviewRowMsg(row);
            },
            toShare(row) {
                this.dialogVisible = true;
                this.$refs.child.getshareMsg(row.id, this.hasChatAuthority);
            },
            getMsg(data) {
                this.previewModel = data;
            },
            getMsgShare(data) {
                this.dialogVisible = data;
            },
            getMsgDetail(data) {
                this.detailVisible = data;
            },
            // 监听OnekyeShare组件里各个弹窗关闭后，刷新表格
            getShareBack(data) {
                this.refreshData();
            },
            getPageSize() {
                util.ajaxJson({
                    url: '/crm/userconfig/get',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        key: 'cloundPushHomepage'
                    }
                }).then(res => {
                    console.log('获取getPage的结果为', res.data);
                    if (res.data.code === '1') {
                        if (res.data.data.value === null) {
                            this.pagesize = 10;
                            this.addPageSize();
                        } else {
                            console.log(res.data.data);
                            const size = parseInt(res.data.data.value);
                            this.pagesize = size;
                            this.refreshData();
                        }
                    } else {
                        this.pagesize = 10;
                    }
                }).catch((e) => {
                });
            },
            /* 添加PageSize */
            addPageSize() {
                console.log('pagesize', this.pagesize);
                util.ajaxJson({
                    url: '/crm/userconfig/add',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        key: 'cloundPushHomepage',
                        value: this.pagesize.toString()
                    }
                }).then(res => {
                    console.log('pagesize 保存结果', res.data);
                }).catch((e) => {
                });
            },
            /* 改变每页条数 */
            sizeChange(pagesize) {
                this.curPage = 1;
                this.pagesize = pagesize;
                util.ajaxJson({
                    url: '/crm/userconfig/update',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        key: 'cloundPushHomepage',
                        value: pagesize.toString()
                    }
                }).then(res => {
                    console.log('update的结果为', res.data);
                }).catch((e) => {
                });
                this.loading = true;
                this.refreshData();
            }
        }
    };
</script>
<style scoped lang="less">
    .main-body{
        padding: 0;
    }
.cloud-push-homepage-wrapper{
    height: 100%;
    background-color: #f4f5f8;
    .homepage-head{
        background-color: #FFFFFF;
        /deep/ .el-menu-item{
            font-family: PingFangSC-Regular;
            font-size: 14px;
            color: rgba(0,0,0,0.60);
        }
        /deep/ .el-tabs__item.is-active {
            font-family: PingFangSC-Medium;
            font-size: 14px;
            color: #FA8241;
            letter-spacing: 0;
            line-height: 22px;
        }
        .google-ads-binding {
            height: 100%;
        }
        .is-active {
            font-weight: 700;
            color: #fa8241 !important;
        }

        .el-menu-item {
            padding: 0 !important;
            margin: 0 40px 0 0;
        }

            .el-menu--horizontal {
                height: 37px;
                line-height: 30px;
                border-bottom: 1px solid #f0f0f0;
                margin-bottom: 16px;

                .el-menu-item {
                    height: 37px;
                    line-height: 30px;
                }
            }
        .homepage-text{
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            .homepage-general{
                font-size: 14px;
                color: rgba(0,0,0,0.80);
                letter-spacing: 0;
                line-height: 18px;
            }
            .homepage-time{
                font-family: PingFangSC-Regular;
                font-size: 12px;
                color: rgba(0,0,0,0.60);
                letter-spacing: 0;
                line-height: 18px;
            }
        }
        .homepage-data{
            display: flex;
            flex-direction: row;
            justify-content: center;
            .homepage-data-item{
                padding: 0 120px;
                margin: 20px 0;
                display: flex;
                flex-direction: column;
                .homepage-data-name{
                    font-family: PingFangSC-Regular;
                    font-size: 12px;
                    color: rgba(0,0,0,0.80);
                    letter-spacing: 0;
                    text-align: center;
                    line-height: 18px;
                }
                .homepage-data-num{
                    font-family: Avenir-Medium;
                    font-size: 32px;
                    color: rgba(0,0,0,0.80);
                    letter-spacing: 0;
                    text-align: center;
                    line-height: 48px;
                }
            }
            .border{
                border-left: 1px solid #EAEAEA;
                border-right: 1px solid #EAEAEA;
            }
        }
        .homepage-data-line{
            background-color: #f4f5f8!important;
            height: 10px;
            width: calc(100% + 60px);
            margin-left: -30px;
        }
        .homepage-data-button{
            /*text-align: right;*/
            margin: 13px 0;
            display: flex;
            flex-direction: row-reverse;
            justify-content: space-between;
            align-items: center;
            .homepage-data-select{
                .homepage-data-delete{
                    margin-left: 20px;
                    background: #FFFFFF;
                    border: none;
                    color: #3B78DE;
                }
            }
        }
    }
}
    .table_wrap p {
        color: rgba(0, 0, 0, 0.6);
    }
    .cloud-push-btn {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        .cloud-push-button {
            background: inherit;
            border: none;
            color: #3B78DE;
        }
    }
    .is-plain{
        color: #fc8c30;
        background: #fff4ea;
        border-color: #fed1ac;
        background-color: white;
    }
</style>
