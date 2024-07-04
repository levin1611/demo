<template>
    <div>
        <div class="adgroup">
            <div class="table_wrap">
                <div style="margin: 15px 0">
                    <div style="display: inline-block">
                        <h2>
                            {{ $t('googleOptimize.manualBack') }}
                            <!-- 系统 tip -->
                            <stepsImage :imgSteps="imgSteps" :ref="modeRef">
                                <HelpTip :title="$t('helpTip.manualBack')" class="piwik_closeLoop_reback"></HelpTip>
                            </stepsImage>
                        </h2>
                    </div>
                    <div style="display: inline-block;height: 30px;line-height: 30px;margin-left: 20px;color: #FA8241;cursor: pointer"
                         @click="goBack">
                        <Icon type="ios-arrow-back" size="20"/>
                        {{$t('back')}}
                    </div>
                </div>
                <div class="datewrap">
                    <span class="_btns_text_ml">
                        <!-- 删除 -->
                        <Button v-show="showDelete" icon="ios-trash" type="text">{{$t('delete')}}</Button>
                        <!-- 右上角筛选 -->
                        <Poptip width="540"
                                trigger="click"
                                placement="bottom-end"
                                class="condition">
                            <!-- trigger -->
                            <Button slot="reference"
                                    type="text"
                                    icon="custom custom-table-filter"
                                    :style="filtering ? 'color:#4285f4' : ''">&nbsp;&nbsp;&nbsp;{{ $t('website.condition') }}</Button>
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
                                                <!-- 默认第一项筛选 -->
                                                <div class="conditionmain  _f _r">
                                                    <!-- 筛选项 -->
                                                    <Select v-model="condition1"
                                                            size="small"
                                                            @change="changecon1"
                                                            style="width:120px;margin-right:12px;float:left;">
                                                        <Option v-for="item in conditionlist1"
                                                                :value="item">{{ item }}</Option>
                                                    </Select>
                                                    <!-- 筛选条件 -->
                                                    <Select v-model="condition2"
                                                            size="small"
                                                            style="width:90px;margin-right:12px;float:left;">
                                                        <Option v-for="item in conditionlist2"
                                                                :value="item.value">{{ item.label }}</Option>
                                                    </Select>
                                                    <!-- 筛选值 -->
                                                    <div style="margin-bottom:10px;">
                                                        <!-- 文本型 -->
                                                        <Input v-if="inputType === 'string'"
                                                               v-model="condition3"
                                                               size="small"
                                                               :placeholder="$t('website.keywordHolder')"
                                                               style="width:220px;margin-right:5px;"></Input>
                                                        <!-- 日期型 -->
                                                        <DatePicker v-else-if="inputType === 'date'"
                                                                    v-model="condition3"
                                                                    type="daterange"
                                                                    format="yyyy-MM-dd"
                                                                    placement="bottom-end"
                                                                    :placeholder="$t('datepickerHolder')"
                                                                    size="small"
                                                                    style="width: 220px;margin-right:5px;"></DatePicker>
                                                        <!-- 选择型 -->
                                                        <Select v-else-if="inputType === 'select'"
                                                                v-model="condition3"
                                                                size="small"
                                                                style="width: 220px;margin-right:5px;">
                                                            <Option v-for="item in conditionlist3"
                                                                    :value="item.value">{{ item.label }}</Option>
                                                        </Select>
                                                        <!-- 添加条件 -->
                                                        <span @click="addclick">
                                                            <!-- <Icon type="plus-circled"
                                                                  size="15"
                                                                  color="#FA8241"
                                                                  style='cursor:pointer;display:inline-block;'></Icon> -->
                                                            <Icon
                                                                  size="15"
                                                                  class="custom custom-add-circle"
                                                                  style='cursor:pointer;display:inline-block;'></Icon>
                                                        </span>
                                                    </div>
                                                </div>
                                                <!-- 之后添加的筛选 -->
                                                <div class="conditionwrap">
                                                    <div v-for="(add, index) in addcondition"
                                                         class="conditionmain _f _r">
                                                        <!-- 筛选项 -->
                                                        <Select v-model="add.condition1"
                                                                size="small"
                                                                @change="addchangecon1(index)"
                                                                style="width:120px;margin-right:12px;float:left;">
                                                            <Option v-for="item in add.conditionlist1"
                                                                    :value="item">{{ item }}</Option>
                                                        </Select>
                                                        <!-- 筛选条件 -->
                                                        <Select v-model="add.condition2"
                                                                size="small"
                                                                style="width:90px;margin-right:12px;float:left;">
                                                            <Option v-for="item in add.conditionlist2"
                                                                    :value="item.value">{{ item.label }}</Option>
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
                                                            <DatePicker v-else-if="add.inputType === 'date'"
                                                                        v-model="add.condition3"
                                                                        type="daterange"
                                                                        format="yyyy-MM-dd"
                                                                        placement="bottom-end"
                                                                        :placeholder="$t('datepickerHolder')"
                                                                        size="small"
                                                                        style="width: 220px;margin-right:5px;"></DatePicker>
                                                            <!-- 选择型 -->
                                                            <Select v-else-if="add.inputType === 'select'"
                                                                    v-model="add.condition3"
                                                                    size="small"
                                                                    style="width: 220px;margin-right:5px;">
                                                                <Option v-for="item in add.conditionlist3"
                                                                        :key="item.value"
                                                                        :value="item.value">{{ item.label }}</Option>
                                                            </Select>
                                                            <!-- 删除当前筛选 -->
                                                            <span @click="removeclick(index)">
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
                                            <!-- 底部按钮 -->
                                            <div style="margin-top: 10px;text-align: right"
                                                 class="btn clearfloat">
                                                <!-- 保存为常用检索 -->
                                                <Button type="primary"
                                                        size="small"
                                                        @click="saveSearch"
                                                        class="piwik_googleOptimizePassBackSaveCommonFilter">{{ $t('filter_box.save_common') }}</Button>
                                                <!-- 筛选 -->
                                                <Button type="primary"
                                                        size="small"
                                                        @click="searchdata"
                                                        class="piwik_googleOptimizePassBackFilterData">{{ $t('filter_box.filter') }}</Button>
                                                <!-- 清空 -->
                                                <Button size="small"
                                                        @click="empty"
                                                        class="piwik_googleOptimizePassBackEmptyFilter">{{ $t('filter_box.empty') }}</Button>
                                            </div>
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
                        <!-- 提交审核 -->
                        <Button type="primary"
                                @click="passBack"
                                style="margin-left: 20px"
                                class="piwik_googleOptimizePassBackSubmitAudit">{{$t('googleOptimize.submitAudit')}}</Button>
                    </span>
                    <!-- 筛选标签 -->
                    <FilterTags :order_column="order_column"
                                :order_type="order_type"
                                :storageName_orderColumn="storageName_orderColumn"
                                :filterConObj.sync="config_tableFilter"
                                :langObj="lang_company"
                                :width="600"
                                @emptySort="empty_sort"
                                @removeCon="remove_filter_tag"
                                @change_filter_tag="change_filter_tag">
                    </FilterTags>
                </div>
                <div class="table">
                    <!--                    <can-edit-table-->
                    <!--                            v-model="data1"-->
                    <!--                            :screen-height="table_height"-->
                    <!--                            :loading="loading"-->
                    <!--                            :edit-incell="true"-->
                    <!--                            :columns-list="computed_currentColumns"-->
                    <!--                            @on-cell-change="handleCellChange"-->
                    <!--                            @get-id-from-child="getDetailById"-->
                    <!--                            class="tabmain">-->
                    <!--                    </can-edit-table>-->
                    <!--  这里就不引入newEditTable这个组件 由于element tablecolumn的问题 直接在这里渲染table          -->
                    <Table v-loading="loading"
                           class="tabmain noBoxShadow-right noborder-table"
                           :highlight-current-row="true"
                           ref="passBackTable"
                           :data="data1"
                           size="medium"
                           :row-key="getRowKey"
                           :height="table_height"
                           @row-click="getDetailById"
                           style="width: 100%"
                           :isCustom="true"
                           :customEmptyText="$t('crm.Table.noData')"
                           customEmptyButtonText=""
                           :customClearMethod="clearFilterConditionByInitView"
                           @select="dataSelect"
                           @select-all="handleSelectAll">
                        <TableColumn
                                width="50"
                                align="center"
                                fixed
                                :reserve-selection="true"
                                type="selection">
                        </TableColumn>
                        <template v-for="item in columns1">
                            <TableColumn :key="item.id"
                                         :prop="item.key"
                                         :label="item.title"
                                         :width="item.width"
                                         :render-header="item.renderHeader"
                                         :fdrmatter="item.formatter ? item.formatter : null"
                                         show-overflow-tooltip>
                            </TableColumn>
                        </template>
                    </Table>
                    <!-- 分页 -->
                    <div style="margin-right: 30px;overflow: hidden">
                        <Page :page-sizes="pagesizeopts"
                              :total="totalpage"
                              :current-page="curpage"
                              @size-change="sizeChange"
                              @current-change="changePage"
                              layout="total, prev, pager, next, sizes, jumper"
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
    import VisitorDetail from '@/views/visitor-history/components/visitor-detail';
    import FilterTags from '@/views/main-components/filter-tags';
    import util from '@/libs/util';
    import Utils from '@/utils';

    import {
        mapState
    } from 'vuex';
    import resetInitComponents from '@/mixins/resetComponentViewData';
    import closeLoopPassBack from '@/steps/img-steps/closeLoopPassBack-mixins';

    export default {
        mixins: [resetInitComponents, closeLoopPassBack],
        name: 'pass_back',
        components: {
            FilterTags,
            VisitorDetail
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                window_height: 'window_height'
            }), // 从 vuex 中获取属性
            table_height() {
                const temp = this.window_height ? this.window_height - 229 : document.documentElement.clientHeight - 239;
                return temp > 200 ? temp : 200;
            },
            // 为表格列数组添加上左侧多选框
            computed_currentColumns() {
                return [
                    {
                        title: this.$t('checkbox'),
                        key: 'checkbox',
                        width: 30,
                        tooltip: false,
                        renderHeader: h => {
                            const ids_selected = this.selected_users.map(item => item.id);
                            return h('Checkbox', {
                                props: {
                                    value: this.data1.length !== 0 && this.data1.every(item => ids_selected.includes(item.id))
                                },
                                style: {
                                    'margin-left': '-12px',
                                    'margin-right': '0',
                                    display: 'table'
                                },
                                on: {
                                    'on-change': (val) => {
                                        if (val) {
                                            this.data1.forEach(item => {
                                                this.selected_users.push(item);
                                            });
                                        } else {
                                            this.selected_users = this.selected_users.filter(item => !ids_selected.includes(item.id));
                                        }
                                        this.dataSelect(this.selected_users);
                                    }
                                }
                            });
                        },
                        formatter: (h, params) => {
                            return h('Checkbox', {
                                props: {
                                    value: this.selected_users.find(item => item.id === params.row.id) !== undefined
                                },
                                style: {
                                    'margin-left': '-12px',
                                    'margin-right': '0',
                                    display: 'table'
                                },
                                on: {
                                    'on-change': (val) => {
                                        if (val) {
                                            this.selected_users.push(params.row);
                                        } else {
                                            this.selected_users = this.selected_users.filter(item => item.id !== params.row.id);
                                        }
                                        this.dataSelect(this.selected_users);
                                    }
                                }
                            });
                        }
                    }
                ].concat(this.columns1);
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
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    gclidCreateDate: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    gclidExpireDate: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    presentFollowup: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    }
                    // 'presentUpload': {
                    // 	sort: false, // 是否允许排序
                    // 	filter: true, // 是否允许筛选
                    // 	filterType: 'string', // 筛选类型, string / date / select / countryArea
                    // 	query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                    // 	allList: null, // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    // },
                },
                lang_company: {
                    // 默认字段
                    visitorId: '访客ID',
                    gclidCreateDate: this.$t('googleOptimize.gclidCreateDate'),
                    gclidExpireDate: this.$t('googleOptimize.gclidExpireDate'),
                    presentFollowup: '当前跟进状态'
                    // 'presentUpload': '最近一次回传的转化',
                },
                // 表头筛选条件
                sqlList_tableFilter: {},
                storageName_orderColumn: '',
                queryData: {
                    $and: []
                },
                showDelete: false,
                selections: [], // 已选项数据
                currentRow: {}, // 当前行数据
                loading: false, // 加载图标
                columns1: [
                    {
                        title: this.$t('googleOptimize.visitorID'),
                        key: 'visitorId',
                        width: 260
                    },
                    {
                        title: this.$t('googleOptimize.gclidCreateDate'),
                        key: 'gclidCreateDate',
                        width: 210
                    },
                    {
                        title: this.$t('googleOptimize.gclidExpireDate'),
                        key: 'gclidExpireDate',
                        width: 210
                    },
                    {
                        title: this.$t('googleOptimize.followup'),
                        key: 'presentFollowup'
                    }
                ], // 表格列名称
                allcolumns: [], // 表格全部列
                data1: [],
                totalpage: 0,

                curpage: 1,
                pagesize: 10,

                pagesizeopts: [10, 20, 30, 50],
                selected_users: [],

                /* 右上角筛选 */
                // 右上角检索通用
                searchData: [],
                saveSearchLoading: false, // 检索
                // 切换自定义检索/常用检索
                filtering: false, // 右上角筛选是否在筛选状态
                selected_filter_tab: 'search', // 检索 or 常用检索
                // 自定义检索
                custom_search_name: '', // 自定义检索名称
                inputType: 'string', // 判断是否需要改变筛选条件 Input 为日期选择框
                condition1: '',
                conditionlist1: [
                    this.$t('googleOptimize.visitorID'),
                    this.$t('googleOptimize.gclidCreateDate'),
                    this.$t('googleOptimize.gclidExpireDate'),
                    this.$t('googleOptimize.followup')
                    // this.$t('googleOptimize.presentUpload')
                ], // 筛选字段：字段列表
                condition2: '',
                conditionlist2: [
                    {
                        value: this.$t('filter_box.equal'),
                        label: this.$t('filter_box.equal')
                    },
                    {
                        value: this.$t('filter_box.unequal'),
                        label: this.$t('filter_box.unequal')
                    },
                    {
                        value: this.$t('filter_box.contain'),
                        label: this.$t('filter_box.contain')
                    },
                    {
                        value: this.$t('filter_box.not_contain'),
                        label: this.$t('filter_box.not_contain')
                    }
                ],
                condition3: '',
                conditionlist3: [
                    {
                        value: 1,
                        label: this.$t('website.label1')
                    },
                    {
                        value: 2,
                        label: this.$t('website.label2')
                    },
                    {
                        value: 3,
                        label: this.$t('website.label3')
                    },
                    {
                        value: 4,
                        label: this.$t('website.label4')
                    },
                    {
                        value: 5,
                        label: this.$t('website.label5')
                    }
                ],
                addcondition: [],
                // 常用检索
                columnType: 16, // 字段所属模块 1客户2联系人3询盘4公海客户5线索6公海线索7fbleads8权限部门用户管理9功能权限管理10访客历史11网站留言12产品管理13Google Ads绑定14聊天界面设置-话术设置15Google营销-闭环优化管理16Google营销-手动回传
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
            this.get_commonSearch();
        },
        mounted() {
            this.checkModeIsRead();
        },
        activated() { /* keep-alive  生命周期函数每次进入页面都有 不管是否缓存了组件 */
            // window.onresize = () => {
            //     this.table_height = document.body.clientHeight - 270
            //     let autoTemp=(document.body.clientHeight-300)+'px'
            //     document.getElementById('clueBody').style.height=autoTemp
            // }; // 屏幕大小改变的时候改变图表大小
        },
        deactivated() {
            this.showDetail = false;
        },
        methods: {
            getRowKey(row) {
                return row.id;
            },
            // 时间线相关
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
            changeRowData({ row, key, value, index, clueId }) {
                console.log('改变列表数据=====', row, key, value, index, clueId, this.$refs);
                this.$refs.editTable.thisTableData[index][key] = value;
                this.$refs.editTable.edittingStore[index][key] = value;
                this.$set(this.editIncellData[index], 'crmStatus', value);
                this.$set(row, key, value);
                console.log(value);
            },
            // 获取检索条件对应的 sql 条件
            getSearchType(str) {
                switch (str) {
                    case this.$t('filter_box.contain'):
                        return '$regex';
                    case this.$t('filter_box.equal'):
                        return '$eq';
                    // case this.$t('filter_box.unequal'):
                    //     return '$ne';
                    case this.$t('filter_box.gt'):
                        return '$gt';
                    case this.$t('filter_box.gte'):
                        return '$gte';
                    case this.$t('filter_box.lt'):
                        return '$lt';
                    case this.$t('filter_box.lte'):
                        return '$lte';
                    default:
                        return str;
                }
            },
            /* 格式化中英文到 sql 查询所需格式 */
            // 获取检索字段名称对应的数据库字段名
            computedGetSearchCon(str) {
                switch (str) {
                    case this.$t('googleOptimize.visitorID'):
                        return 'visitorId';
                    case this.$t('googleOptimize.gclidCreateDate'):
                        return 'gclidCreateDate';
                    case this.$t('googleOptimize.gclidExpireDate'):
                        return 'gclidExpireDate';
                    case this.$t('googleOptimize.followup'):
                        return 'presentFollowup';
                    // case this.$t('googleOptimize.presentUpload'):
                    // 	return 'presentUpload';
                    default:
                        return str;
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
                    ['gclidCreateDate', [(`${timeRange[0]} 00:00:00`), (`${timeRange[1]} 23:59:59`)]]
                ]);
                // this.order_column = 'leaveTime' // 排序字段在数据库中的数据名
                // this.order_type = 'desc' // 排序类型
                // this.storageName_orderColumn = 'leaveTime', // 排序字段
                this.columns1 = this.columns1.map(col => {
                    if (this.config_tableFilter.hasOwnProperty(col.key)) {
                        col.filtering = initial_filter_cons.get(col.key) ? this.init_filter(col.key, col.title, initial_filter_cons.get(col.key)) : false;
                    }
                    return col;
                });
                this.merge_query_list();
                this.curpage = 1;
                this.refreshData();
            },
            // 设定初始筛选条件
            init_filter(key, title, val) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    this.$set(this.config_tableFilter[key], 'query', val);
                    console.log(this.$set(this.config_tableFilter[key], 'query', val), '!!!!!');
                    const con = this.getSearchCon(title);
                    console.log(con, 'con');
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
            // filterTags 组件内部修改筛选值后触发的方法, 由下方的 updateList 改造而成
            change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    const column = this.columns1.find(item => item.key === key);
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
            empty_sort() {
                // 清空
                this.order_column = '';
                this.order_type = '';

                // 刷新
                this.curpage = 1;
                this.refreshData();
            },
            computed_sqlList_tableFilter() {
                return Object.entries(this.sqlList_tableFilter).map(([key, val]) => {
                    const temp = {};
                    // 数组型 - 日期型 - 字符串型/国家地区
                    if (val.hasOwnProperty('$or')) {
                        temp.$or = val.$or;
                    } else if (val.hasOwnProperty('$and')) {
                        // temp['$and'] = val['$and'];
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
            },
            merge_query_list() {
                // 右上角筛选框优先级更高, a 为检索/常用检索条件, b 为表头检索条件
                const b = this.computed_sqlList_tableFilter();
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
            // 返回字段筛选渲染函数
            renderHeader_filter(colIndex) {
                return h => {
                    const column = this.columns1[colIndex];
                    /* DOM */
                    // 标题
                    const title = h('div', {
                        attrs: {
                            title: column.title
                        },
                        class: 'table-filter-title'
                    }, column.title);
                    // 排序组件
                    let order_column = this.computedGetSearchCon(column.title);
                    if (order_column === 'create_user_id') {
                        order_column = 'create_user';
                    }
                    const sortIcons = h('span', {
                        class: {
                            'ivu-table-sort': true
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
                            showPopper: this.columns1[colIndex].show_filter_content,
                            filtering: this.columns1[colIndex].filtering,
                            columnKey: column.key,
                            columnCon: order_column,
                            order_type: this.order_type,
                            order_column: this.order_column,
                            storageName_orderColumn: this.storageName_orderColumn
                        }, this.config_tableFilter[column.key]),
                        on: {
                            updateList: () => {
                                const temp = this.config_tableFilter[column.key];
                                if (temp) {
                                    /* 处理筛选 */
                                    console.log(temp);
                                    // 判断是否有值, 调整 sqlList
                                    const con = this.computedGetSearchCon(column.title);
                                    console.log(con);
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
                        class: 'table-filter-container'
                    }, [title, (this.order_column === order_column && this.order_type) ? sortIcons : undefined, column.hasOwnProperty('show_filter_content') ? filterPop : undefined]);
                };
            },
            // close tag 时去掉对应的筛选条件并刷新
            remove_filter_tag(key) {
                console.log('key', key);
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
            // 返回
            goBack() {
                this.$emit('update:showField', 0);
            },
            handleSelectAll(selection) {
                this.dataSelect(selection);
            },
            dataSelect(selection) {
                console.log('selection', selection);
                // this.showDelete = selection.length === 0 ? false : true
                const arr = [];
                for (const i in selection) {
                    arr.push(selection[i].id);
                }
                this.selections = arr;
            },
            passBack() {
                if (this.selections.length > 0) {
                    const idList = this.selections.join(',');

                    util.ajax({
                        url: '/crm/conversionAudit/updateNeedAudit',
                        method: 'get',
                        params: {
                            ids: idList, // 当前选中的行数据id
                            orgId: this.enterpriseId // 组织机构编码
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            if (response.data.data.successCount < response.data.data.sumCount) {
                                this.$Message.success(this.$t('googleOptimize.partAuditSuccess'));
                                this.merge_query_list();
                                const tempKeys = Object.keys(response.data.data.failData);
                                const jsonData = {
                                    orgId: this.enterpriseId,
                                    userId: this.userId,
                                    needAudit: 2, // 1 待审核界面数据  2手动回传提交审核数据
                                    query: this.queryData.$and.length ? JSON.stringify(this.queryData) : undefined,
                                    pageSize: this.pagesize,
                                    pageNo: this.curpage
                                };
                                util.ajax({
                                    url: '/crm/conversionAudit/getAuditList',
                                    method: 'post',
                                    data: jsonData
                                }).then(response => {
                                    this.loading = false;
                                    if (response.data.code == 1) {
                                        if (!response.data.data.list) {
                                            this.data1 = [];
                                            this.totalpage = 0;
                                        } else {
                                            this.data1 = response.data.data.list;
                                            //              this.handleData(this.data1)
                                            this.totalpage = response.data.data.total;
                                        }
                                        this.selected_users = [];
                                        console.log('433', this.selected_users, this.data1);
                                        const temp = [];
                                        tempKeys.forEach(tempItem => {
                                            this.data1.forEach(item => {
                                                if (tempItem === item.visitorId) {
                                                    temp.push(item);
                                                }
                                            });
                                        });
                                        this.selected_users = temp;
                                        this.dataSelect(this.selected_users);
                                    }
                                });
                            } else {
                                this.selections = [];
                                this.selected_users = [];
                                this.$refs.passBackTable.clearSelection();
                                this.$Message.success(this.$t('googleOptimize.auditSuccess'));
                                this.refreshData();
                            }
                        } else if (response.data.code === '2') {
                            this.$Message.success(this.$t('googleOptimize.conversionActionFirstly'));
                        } else {
                            this.$Message.error(this.$t('googleOptimize.submitAuditFail'));
                        }
                    });
                } else {
                    this.$Message.info(this.$t('googleOptimize.conversionWarning'));
                }
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
                                if (key.indexOf('a100') != -1) { /* 表单字段中 */
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
                const jsonData = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    needAudit: 2, // 1 待审核界面数据  2手动回传提交审核数据
                    pageSize: this.pagesize,
                    pageNo: this.curpage,
                    orderColumn: this.order_column,
                    orderType: this.order_type,
                    query: this.queryData.$and.length ? JSON.stringify(this.queryData) : undefined
                };
                util.ajax({
                    url: '/crm/conversionAudit/getAuditList',
                    method: 'post',
                    data: jsonData
                }).then(response => {
                    this.loading = false;
                    if (response.data.code === '1') {
                        if (!response.data.data.list) {
                            this.data1 = [];
                            this.totalpage = 0;
                        } else {
                            this.data1 = response.data.data.list;
                            this.totalpage = response.data.data.total;
                            // this.handleData(this.data1);
                        }
                    }
                }).catch(error => {
                    this.loading = false;
                });
            },

            /* 改变每页条数 */
            sizeChange(size) {
                this.pagesize = size;
                /* 如果当前不是第一页 重置为第一页 会自动触发 changepage */
                if (this.curpage !== 1) {
                    this.curpage = 1;
                } else {
                    this.loading = true;
                    this.refreshData();
                }
            },
            /* 改变页码 */
            changePage(page) {
                this.data1 = [];
                this.loading = true;
                this.curpage = page;
                this.refreshData();
            },
            /* 根据第一选择筛选项设定第二筛选项的下拉框值 */
            changecon1() {
                switch (this.condition1) {
                    // 时间类
                    case this.$t('googleOptimize.gclidCreateDate'):
                    case this.$t('googleOptimize.gclidExpireDate'):
                        this.inputType = 'date';
                        this.conditionlist2 = [
                            {
                                value: this.$t('filter_box.daterange'),
                                label: this.$t('filter_box.daterange')
                            }
                        ];
                        this.condition2 = this.$t('filter_box.daterange');
                        this.condition3 = [];
                        break;
                    default:
                        this.inputType = 'string';
                        this.conditionlist2 = [
                            {
                                value: this.$t('filter_box.equal'),
                                label: this.$t('filter_box.equal')
                            },
                            {
                                value: this.$t('filter_box.unequal'),
                                label: this.$t('filter_box.unequal')
                            },
                            {
                                value: this.$t('filter_box.contain'),
                                label: this.$t('filter_box.contain')
                            },
                            {
                                value: this.$t('filter_box.not_contain'),
                                label: this.$t('filter_box.not_contain')
                            }
                        ];
                        this.condition2 = this.$t('filter_box.equal');
                        this.condition3 = '';
                        break;
                }
            },
            /* 同上，新增筛选条件的相应方法 */
            addchangecon1(index) {
                switch (this.addcondition[index].condition1) {
                    // 时间类
                    case this.$t('googleOptimize.gclidCreateDate'):
                    case this.$t('googleOptimize.gclidExpireDate'):
                        this.addcondition[index].inputType = 'date';
                        this.addcondition[index].conditionlist2 = [
                            {
                                value: this.$t('filter_box.daterange'),
                                label: this.$t('filter_box.daterange')
                            }
                        ];
                        this.addcondition[index].condition2 = this.$t('filter_box.daterange');
                        this.addcondition[index].condition3 = [];
                        break;
                    default:
                        this.addcondition[index].inputType = 'string';
                        this.addcondition[index].conditionlist2 = [
                            {
                                value: this.$t('filter_box.equal'),
                                label: this.$t('filter_box.equal')
                            },
                            {
                                value: this.$t('filter_box.unequal'),
                                label: this.$t('filter_box.unequal')
                            },
                            {
                                value: this.$t('filter_box.contain'),
                                label: this.$t('filter_box.contain')
                            },
                            {
                                value: this.$t('filter_box.not_contain'),
                                label: this.$t('filter_box.not_contain')
                            }
                        ];
                        this.addcondition[index].condition2 = this.$t('filter_box.equal');
                        this.addcondition[index].condition3 = '';
                        break;
                }
            },
            /* 添加检索条件 */
            addclick() {
                this.addcondition.push({
                    condition1: '',
                    conditionlist1: this.conditionlist1,
                    condition2: '',
                    conditionlist2: [{
                                         value: this.$t('filter_box.equal'),
                                         label: this.$t('filter_box.equal')
                                     },
                                     {
                                         value: this.$t('filter_box.unequal'),
                                         label: this.$t('filter_box.unequal')
                                     },
                                     {
                                         value: this.$t('filter_box.contain'),
                                         label: this.$t('filter_box.contain')
                                     },
                                     {
                                         value: this.$t('filter_box.not_contain'),
                                         label: this.$t('filter_box.not_contain')
                                     }
                    ],
                    condition3: '',
                    conditionlist3: [{
                                         value: 1,
                                         label: this.$t('website.label1')
                                     },
                                     {
                                         value: 2,
                                         label: this.$t('website.label2')
                                     },
                                     {
                                         value: 3,
                                         label: this.$t('website.label3')
                                     },
                                     {
                                         value: 4,
                                         label: this.$t('website.label4')
                                     },
                                     {
                                         value: 5,
                                         label: this.$t('website.label5')
                                     }
                    ],
                    inputType: 'string'
                });
            },
            /* 删除检索条件 */
            removeclick(index) {
                this.addcondition.splice(index, 1);
            },
            /* 筛选字段-获取检索类型 */
            getSearchCon(str) {
                switch (str) {
                    case this.$t('googleOptimize.visitorID'):
                    case 'visitorID':
                        return 'visitorId';
                        break;
                    case this.$t('googleOptimize.gclidCreateDate'):
                    case 'gclidCreateDate':
                        return 'gclidCreateDate';
                        break;
                    case this.$t('googleOptimize.gclidExpireDate'):
                    case 'gclidExpireDate':
                        return 'gclidExpireDate';
                        break;
                    case this.$t('googleOptimize.followup'):
                    case 'presentFollowup':
                        return 'presentFollowup';
                        break;
                    default:
                        return str;
                        break;
                }
            },
            // 格式化检索数据
            getSearchValue(con1, con2, con3) {
                const searchCon = this.getSearchCon(con1); // 检索类型
                if (!searchCon) {
                    return {};
                }
                let result = {};
                const temp = {};
                switch (con2) {
                    case this.$t('filter_box.contain'):
                        temp.$regex = con3;
                        result[searchCon] = temp;
                        break;
                    case this.$t('filter_box.not_contain'):
                        temp.$nregex = con3;
                        result[searchCon] = temp;
                        break;
                    case this.$t('filter_box.equal'):
                        temp.$eq = con3;
                        result[searchCon] = temp;
                        break;
                    case this.$t('filter_box.unequal'):
                        temp.$ne = con3;
                        result[searchCon] = temp;
                        break;
                    case this.$t('filter_box.gt'):
                        temp.$gt = con3;
                        result[searchCon] = temp;
                        break;
                    case this.$t('filter_box.gte'):
                        temp.$gte = con3;
                        result[searchCon] = temp;
                        break;
                    case this.$t('filter_box.lt'):
                        temp.$lt = con3;
                        result[searchCon] = temp;
                        break;
                    case this.$t('filter_box.lte'):
                        temp.$lte = con3;
                        result[searchCon] = temp;
                        break;
                    case this.$t('filter_box.daterange'):
                        if (Array.isArray(con3) && con3[0] && con3[1]) {
                            temp.$and = [];

                            const start = {};
                            start[searchCon] = {};
                            start[searchCon].$gte = this.$options.filters.timeFormat(con3[0]);
                            temp.$and.push(start);

                            const end = {};
                            end[searchCon] = {};
                            end[searchCon].$lte = `${this.$options.filters.timeFormat(con3[1])} 23:59:59.999`;
                            temp.$and.push(end);
                        }
                        result = temp;
                } // 格式化数据
                return result;
            },
            /* 筛选字段-检索 */
            searchdata() {
                let flag = false; // 可检索标志，为 true 时才可检索
                this.searchData = []; // 搜索条件集合，这里的结构比较复杂
                let updateTimes = ''; // 时间段类型数据，在发送时单独一字段
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
                        updateTimes = this.condition3.map(item => { return item.format('yyyy-MM-dd'); }).join(',');
                    } else { // 否则在 query 中填入格式数据
                        tempObj = this.getSearchValue(this.condition1, this.condition2, this.condition3); // 格式化检索数据
                        this.searchData.push(tempObj); // 填入发送数据
                    }
                    for (const item of this.addcondition) { // 遍历附加筛选条件
                        searchCon = this.getSearchCon(item.condition1); // 检索类型

                        if (searchCon === 'create_time') { // 时间段类型，不写在 query 中
                            if (timeFlag === true) {
                                this.$Message.error(this.$t('website.searchTip1'));
                                flag = false;
                                break;
                            } else {
                                timeFlag = true;
                                updateTimes = item.condition3.map(item => { return item.format('yyyy-MM-dd'); }).join(',');
                            }
                        } else {
                            tempObj = this.getSearchValue(item.condition1, item.condition2, item.condition3); // 格式化检索数据
                            this.searchData.push(tempObj); // 填入发送数据
                        }
                    }
                }

                if (flag) {
                    this.filtering = 'search';
                    this.id_selected_commonSearch = -1;
                    this.merge_query_list();
                    this.curpage = 1;
                    this.refreshData();
                } else {
                    this.$Message.info(this.$t('crm.Table.info_searchEmptyConditions'));
                }
            },
            /* 清空检索条件 */
            empty() {
                this.id_selected_commonSearch = -1;
                this.common_conditions = [];
                this.searchData = [];
                this.condition1 = '';
                this.condition2 = '';
                this.condition3 = '';
                this.inputType = 'string';
                this.addcondition = [];
                this.filtering = false;
                this.merge_query_list();
                this.curpage = 1;
                this.refreshData();
            },
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
                const conditionList = []; // 暂存数组
                const types = []; // 检索条件类型数组
                // 检查第一项筛选各条件是否都不为空
                if (this.condition1 !== '' && this.condition2 !== '' && this.condition3 !== '') {
                    conditionList.push({
                        con1: this.condition1,
                        con2: this.condition2,
                        con3: this.condition3
                    });
                    types.push(this.condition1);
                } else {
                    this.$Message.info(this.$t('website.detection1'));
                    return;
                }
                // 检查其余筛选各条件是否都不为空
                const flag = this.addcondition.some(item => {
                    if (item.condition1 !== '' && item.condition2 !== '' && item.condition3 !== '') {
                        conditionList.push({
                            con1: item.condition1,
                            con2: item.condition2,
                            con3: item.condition3
                        });
                        types.push(item.condition1);
                    } else {
                        this.$Message.info(this.$t('website.detection1'));
                        return true;
                    }
                });
                if (flag) {
                    this.$Message.info(this.$t('website.detection1'));
                    return;
                }
                // 筛选条件是否不为空
                if (conditionList.length === 0) {
                    this.$Message.info(this.$t('crm.Table.info_saveEmptyConditions'));
                    return;
                }
                // 处理要保存的数据
                const conditions = []; // 要发送的数据
                for (const item of conditionList) {
                    const tempObj = this.getSearchValue(item.con1, item.con2, item.con3); // 格式化检索数据
                    conditions.push(tempObj);
                }
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
            }, // 保存为常用检索
            searchCommon(item) {
                if (item.searchContent) {
                    this.filtering = 'searchCommon';
                    this.id_selected_commonSearch = item.id;
                    this.common_conditions = this.$options.filters.parseArray(item.searchContent);
                    this.merge_query_list();
                    this.curpage = 1;
                    this.refreshData();
                } else {
                    this.$Message.error(this.$t('crm.Table.error_getCommonSearchItem'));
                }
            }, // 点击常用检索项检索
            handleCellChange(val, index, key) {
                const id = val[index].id;
                const Text = val[index][key];
                console.log(Text);
                if (!Text) {
                    this.$Message.success(this.$t('googleOptimize.remarkWarning'));
                    return false;
                }
                util.ajax({
                    url: '/form-cust/form/updateColumnValueRemark',
                    method: 'post',
                    data: {
                        id: id,
                        remark: Text
                    }
                }).then(response => {
                    if (response.data.code == 1) {
                        this.$Message.success(this.$t('googleOptimize.remarkSuccess'));
                    }
                });
                //                this.updateTranslation(id,key,translatedText,-1)
                //            this.$Message.success('修改了第' + (index + 1) + ' 行列名为 ' + key + ' 的数据');
            },

            /* 常用检索 */
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
                            this.curpage = 1;
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

    .condition /deep/ .ivu-btn-text {
        color: rgba(0, 0, 0, 0.8);
    }

    .condition /deep/ .ivu-btn-text:hover {
        color: #4285f4;
    }
    .filtercol {
        width: 400px;
        position: absolute;
        background: #fff;
        border: 1px solid #ccc;
        top: 35px;
        left: -140px;
        z-index: 999;
        border-radius: 4px;
        -webkit-box-shadow: 0 0 4px rgba(0, 0, 0, .13);
        -moz-box-shadow: 0 0 4px rgba(0, 0, 0, .13);
        box-shadow: 0 0 4px rgba(0, 0, 0, .13);
        padding: 15px 10px 10px 15px;
    }

    .filtercol:after {
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
        z-index: 999;
        border-radius: 2px;
        background-color: #fff;
        -webkit-box-shadow: 2px -2px 2px rgba(0, 0, 0, .13);
        -moz-box-shadow: 2px -2px 2px rgba(0, 0, 0, .13);
        box-shadow: 2px -2px 2px rgba(0, 0, 0, .13);
    }

    .onnetwork {
        overflow: hidden;
    }

    .extensiondevice > h3,
    .onnetwork > h3 {
        float: left;
        margin-right: 30px;
    }

    .extensiondevice label,
    .onnetwork label {
        margin-bottom: 10px;
    }

    .alldevice,
    .allnetwork {
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
    /*td:hover div.ivu-table-cell span{*/
    /*text-overflow:inherit;*/
    /*overflow: visible;*/
    /*white-space: pre-line;*/
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
    /*td:hover div.ivu-table-cell span{*/
    /*    text-overflow:inherit;*/
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
