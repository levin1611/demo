<template>
    <div class="audit">
        <div class="adgroup">
            <div class="table_wrap">
                <div style="margin: 15px 0">
                    <div style="display: inline-block">
                        <h2>
                            {{ $t('googleOptimize.willAudit') }}
                            <!-- 系统 tip -->
                            <stepsImage :imgSteps="imgSteps" type="crmSteps" :ref="modeRef">
                                <HelpTip :title="$t('helpTip.willAudit')" class="piwik_closeLoop_check"></HelpTip>
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
                    <DatePicker @change="changeDate" :picker-options="options2" v-model="datevalue" type="daterange"
                                placement="bottom-start" :placeholder="$t('datepickerHolder')"
                                :clearable="false"
                                value-format="yyyy-MM-dd"
                                style="width: 260px;height: 40px"></DatePicker>

                    <span class="_btns_text_ml">
                        <!-- 删除 -->
                        <Button v-show="showDelete"
                                type="text"
                                icon="ios-trash"
                                @click="deleteRow"
                                style="margin-right: 20px"
                                class="piwik_googleOptimizeAuditDeleteData">{{ $t('delete') }}</Button>
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

                                                <!-- 筛选条件项 -->
                                                <div class="conditionwrap">
                                                    <div v-for="(add, index) in conditionList"
                                                         class="conditionmain _f _r">
                                                        <!-- 筛选项 -->
                                                        <Select v-model="add.condition1"
                                                                size="small"
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
                                                                        :value="item.value">{{ item.label }}</Option>
                                                            </Select>

                                                            <!-- 添加条件 -->
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
                                                            <!-- 删除当前筛选 -->
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
                                            <!-- 底部按钮 -->
                                            <div style="margin-top: 10px;text-align: right"
                                                 class="btn clearfloat">
                                                <!-- 保存为常用检索 -->
                                                <Button type="primary"
                                                        size="small"
                                                        @click="saveSearch"
                                                        class="piwik_googleOptimizeAuditSaveCommonFilter">{{ $t('filter_box.save_common') }}</Button>
                                                <!-- 筛选 -->
                                                <Button type="primary"
                                                        size="small"
                                                        @click="search"
                                                        class="piwik_googleOptimizeAuditFilterData">{{ $t('filter_box.filter') }}</Button>
                                                <!-- 清空 -->
                                                <Button size="small"
                                                        @click="empty"
                                                        class="piwik_googleOptimizeAuditEmptyFilter">{{ $t('filter_box.empty') }}</Button>
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
                        <!-- 回传按钮 -->
                        <Button type="primary"
                                :loading="loading_passback"
                                @click="passBack"
                                style="margin-left: 20px"
                                class="piwik_googleOptimizeAuditPassBack">{{ $t('googleOptimize.passBack') }}</Button>
                    </span>

                    <!-- 筛选标签 -->
                    <FilterTags
                        :order_column="order_column"
                        :order_type="order_type"
                        :storageName_orderColumn="storageName_orderColumn"
                        :filterConObj.sync="config_tableFilter"
                        :langObj="langObj"
                        :minWidth="690"
                        :removeWidth="750"
                        ref="filterTags"
                        @emptySort="empty_sort"
                        @removeCon="remove_filter_tag"
                        style="margin: 0 15px;"></FilterTags>
                </div>
                <div class="table">
                    <!--          <can-edit-table-->
                    <!--            v-model="data1"-->
                    <!--            :screen-height="table_height"-->
                    <!--            :loading="loading"-->
                    <!--            :edit-incell="true"-->
                    <!--            :columns-list="tableColumns"-->
                    <!--            class="tabmain"-->
                    <!--            @on-cell-change="handleCellChange"-->
                    <!--            @get-id-from-child="getDetailById"-->
                    <!--            @selection="dataSelect">-->
                    <!--          </can-edit-table>-->
                    <Table v-if="refreshTable"
                           v-loading="loading"
                           class="tabmain noBoxShadow-right noborder-table"
                           :highlight-current-row="true"
                           ref="auditTable"
                           :isCustom="false"
                           :customEmptyText="customEmptyTextLang"
                           :customEmptyButtonText="customEmptyButtonTextLang"
                           :customClearMethod="clearFilterConditionByInitView"
                           :data="data1"
                           size="medium"
                           :height="table_height"
                           :row-key="getRowKey"
                           @row-click="getDetailById"
                           @select="dataSelect"
                           @select-all="dataSelect"
                           style="width: 100%">
                        <TableColumn
                                width="50"
                                align="center"
                                fixed
                                :reserve-selection="true"
                                type="selection">
                        </TableColumn>
                        <template v-for="item in tableColumns">
                            <TableColumn v-if="!item.children"
                                         :key="item.key"
                                         :prop="item.key"
                                         :label="item.title"
                                         :width="item.width"
                                         :render-header="item.renderHeader"
                                         :formatter="item.formatter?item.formatter:null"
                                         show-overflow-tooltip>
                            </TableColumn>
<!--                            <TableColumn v-else-if="item.children" :label="item.title" :align="item.align">-->
<!--                                <template v-for="child in item.children">-->
<!--                                    <TableColumn :key="child.key"-->
<!--                                                 :prop="child.key"-->
<!--                                                 :label="child.title"-->
<!--                                                 :width="child.width"-->
<!--                                                 :min-width="child.minWidth"-->
<!--                                                 :align="child.align"-->
<!--                                                 show-overflow-tooltip-->
<!--                                                 :formatter="item.formatter?item.formatter:null">-->
<!--                                        <template slot-scope="{row}">-->
<!--                                            <span>{{ row[child.key] | filterAudit }}</span>-->
<!--                                        </template>-->
<!--                                    </TableColumn>-->
<!--                                </template>-->
<!--                            </TableColumn>-->
                        </template>
                    </Table>
                    <!--  这里就不引入newEditTable这个组件 由于element tablecolumn的问题 直接在这里渲染table          -->
                    <!-- @getIdFromChild="getDetailById" -->
                    <!--<Table border  :columns="tableColumns" :data="data1" :height="table_height" @on-selection-change="dataSelect"></Table>-->
                    <!-- 分页 -->
                    <div style="margin-right: 30px;overflow: hidden">
                        <Page :page-sizes="pagesizeopts"
                              :total="totalpage"
                              :current="curpage"
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
                :key="updateKey"
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

        <!-- 回传确认弹框 -->
<!--        <Modal :visible.sync="visible_auditConfirm"-->
<!--               :modal="false"-->
<!--               :title="$t('googleOptimize.willAudit')"-->
<!--               width="451px">-->
<!--            &lt;!&ndash; content &ndash;&gt;-->
<!--            <div>-->
<!--                <template v-if="isRelated">-->
<!--                    <div class="auditConfirm-tip">{{ $t('googleOptimize.tip_auditConfirm_related') }}</div>-->
<!--                </template>-->
<!--                <template v-else>-->
<!--                    <div class="auditConfirm-tip">{{ $t('googleOptimize.tip_auditConfirm_noRelated') }}</div>-->
<!--                    <div class="auditConfirm-select-container">-->
<!--                        <div class="auditConfirm-select-label">{{ $t('googleOptimize.label_adsAccount') }}</div>-->
<!--                        <Select v-model="auditAdsAccount"-->
<!--                                :multiple="true"-->
<!--                                class="auditConfirm-select">-->
<!--                            <Option v-for="item in adsAccountList"-->
<!--                                    :key="item.value"-->
<!--                                    :value="item.value"-->
<!--                                    :label="item.label"></Option>-->
<!--                        </Select>-->
<!--                    </div>-->
<!--                </template>-->
<!--            </div>-->

<!--            &lt;!&ndash; footer &ndash;&gt;-->
<!--            <div slot="footer">-->
<!--                <Button @click="visible_auditConfirm = false">{{ $t('cancel') }}</Button>-->
<!--                <Button type="primary"-->
<!--                        @click="passBack">{{ $t('confirm') }}</Button>-->
<!--            </div>-->
<!--        </Modal>-->
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import resetInitComponents from '@/mixins/resetComponentViewData';
    import closeLoopCheck from '@/steps/img-steps/closeLoopCheck-mixins';
    import VisitorDetail from '@/views/visitor-history/components/visitor-detail.vue';
    import FilterTags from '@/views/main-components/filter-tags';
    import { audit, googleAdsBind } from '@/api/google/index';
    const { checkRelation, getGoogleUploadFailReasonList } = audit;
    const { getGoogleAdsAccountList, getConversionList } = googleAdsBind;

    export default {
        mixins: [resetInitComponents, closeLoopCheck],
        name: 'audit',
        components: {
            VisitorDetail,
            FilterTags
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                window_height: 'window_height',
                allSelectOptions: state => state.crm.selectOptions
            }), // 从 vuex 中获取属性
            table_height() {
                const temp = this.window_height ? this.window_height - 230 : document.documentElement.clientHeight - 240;
                return temp > 200 ? temp : 200;
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
        filters: {
            filterAudit(val) {
                let value = '--';
                let useRevenueValue = 1;
                if (val) {
                    value = val.split(';')[0];
                    useRevenueValue = val.split(';')[1];
                }

                // 待审核表格, 转化价值这一列, 下面的子列, 默认值改为 '--' , 确定提交过了的还是按现有逻辑显示价值
                // 后端说这个值为 5 时就是没提交过待审核
                if (`${useRevenueValue}` === '5') {
                    return '--';
                } else {
                    return value;
                }
            }
        },
        mounted() {
            this.checkModeIsRead();
        },
        data() {
            return {
                refreshTable: true,
                currentIndex: -1,
                onLineTime: '2019-06-01 00:00:00', // 上线时间--晚 // 1559318400000
                timeLine: '',
                showDetail: false,

                showDelete: false,
                selections: [], // 已选项数据
                currentRow: {}, // 当前行数据
                loading: false, // 加载图标
                loading_passback: false,
                tableColumns: [
                    { title: this.$t('googleOptimize.visitorID'), key: 'visitorId', width: 180 },
                    { title: this.$t('googleOptimize.presentFollowup'), key: 'presentFollowup', width: 170 },
                    { title: this.$t('googleOptimize.conversionAction'), key: 'conversionAction', width: 210 },
                    { title: this.$t('googleOptimize.revenueValue'), key: 'revenueValue', width: 150 },
                    { title: this.$t('googleOptimize.adsAccount'), key: 'adsAccount', width: 170 },
                    {
                        title: this.$t('googleOptimize.status'),
                        key: 'status',
                        width: 150,
                        formatter: row => {
                            if (`${row.status}` === '1') {
                                return this.$t('googleOptimize.notConversion');
                            } else {
                                return this.$t('googleOptimize.conversionUploadError');
                            }
                        }
                    },
                    {
                        title: this.$t('googleOptimize.failReason'),
                        key: 'failReason',
                        width: 250,
                        formatter: row => {
                            if (row.failReason) {
                                return this.$t(`googleOptimize.failReasonList.${row.failReason}`);
                            } else {
                                return '';
                            }
                        }
                    },
                    { title: this.$t('googleOptimize.gclidExpireDate'), key: 'gclidExpireDate', width: 160 },
                    { title: this.$t('googleOptimize.gclidCreateDate'), key: 'gclidCreateDate', width: 160 },
                    { title: this.$t('googleOptimize.sumbitPerson'), key: 'presentSumbitPerson', width: 100 }
                ], // 表格列名称
                data1: [],
                totalpage: 0,
                curpage: 1,
                pagesize: 10,
                pagesizeopts: [10, 20, 30, 50],
                datevalue: [],
                options2: {
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
                                start.setTime(start.getTime() - 3600 * 1000 *
                                    24);
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.tswk'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() -
                                    (start.getDay() - 1) * 24 * 60 *
                                    60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.ltwk'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(end.getTime() - end.getDay() * 24 *
                                    60 * 60 * 1000);
                                start.setTime(start.getTime() -
                                    (start.getDay() + 6) * 24 * 60 *
                                    60 * 1000);
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
                                end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() -
                                    24 * 60 * 60 * 1000);
                                start.setTime(new Date(start.getFullYear(), start.getMonth() -
                                    1, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        }
                    ],
                    disabledDate(date) {
                        return date.valueOf() > Date.now();
                    }
                },
                startDate: '',
                endDate: '',

                /* 选项型筛选相关数据 */
                // 转化类型列表
                optimizeList: [],

                /* 表头筛选 */
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
                        filter: false, // 是否允许筛选
                        filterType: 'select', // 筛选类型, string / date / select / countryArea
                        blank: true, // 增加选项-空(未填写)
                        query: [], // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: [] // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    revenueValue: {
                        sort: false, // 是否允许排序
                        filter: false, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    adsAccount: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型, string / date / select / countryArea
                        blank: true, // 增加选项-空(未填写)
                        query: [], // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: [] // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    presentFollowup: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型, string / date / select / countryArea
                        query: [], // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: [] // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    presentSumbitPerson: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'users', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    gclidCreateDate: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型, string / date / select / countryArea
                        query: [], // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    gclidExpireDate: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型, string / date / select / countryArea
                        query: [], // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    status: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型, string / date / select / countryArea
                        query: [], // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: [
                            {
                                value: 1,
                                label: this.$t('googleOptimize.notConversion')
                            },
                            {
                                value: 0,
                                label: this.$t('googleOptimize.conversionUploadError')
                            }
                        ] // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    failReason: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型, string / date / select / countryArea
                        blank: true, // 增加选项-空(未填写)
                        query: [], // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: [] // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    }
                },
                order_column: '',
                order_type: '',
                storageName_orderColumn: '',
                langObj: {
                    visitorId: this.$t('googleOptimize.visitorID'),
                    presentSumbitPerson: this.$t('googleOptimize.sumbitPerson'),
                    gclidCreateDate: this.$t('googleOptimize.gclidCreateDate'),
                    gclidExpireDate: this.$t('googleOptimize.gclidExpireDate'),
                    adsAccount: this.$t('googleOptimize.adsAccount'),
                    presentFollowup: this.$t('googleOptimize.presentFollowup'),
                    conversionAction: this.$t('googleOptimize.conversionAction'),
                    revenueValue: this.$t('googleOptimize.revenueValue'),
                    status: this.$t('googleOptimize.status'),
                    failReason: this.$t('googleOptimize.failReason')
                },
                // 表头筛选条件
                sqlList_tableFilter: {},
                queryData: {
                    $and: []
                },

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
                    { value: 'visitorId', label: this.$t('googleOptimize.visitorID') },
                    { value: 'presentSumbitPerson', label: this.$t('googleOptimize.sumbitPerson') },
                    { value: 'gclidCreateDate', label: this.$t('googleOptimize.gclidCreateDate') },
                    { value: 'gclidExpireDate', label: this.$t('googleOptimize.gclidExpireDate') },
                    { value: 'adsAccount', label: this.$t('googleOptimize.adsAccount') },
                    { value: 'presentFollowup', label: this.$t('googleOptimize.presentFollowup') },
                    { value: 'conversionAction', label: this.$t('googleOptimize.conversionAction') },
                    { value: 'revenueValue', label: this.$t('googleOptimize.revenueValue') },
                    { value: 'status', label: this.$t('googleOptimize.status') },
                    { value: 'failReason', label: this.$t('googleOptimize.failReason') }
                ], // 筛选字段：字段列表
                conditionList2: [
                    { value: '$eq', label: this.$t('filter_box.equal') },
                    { value: '$nq', label: this.$t('filter_box.unequal') },
                    { value: '$regex', label: this.$t('filter_box.contain') },
                    { value: '$nregex', label: this.$t('filter_box.not_contain') }
                ],
                conditionList: [],
                // 常用检索
                columnType: 17, // 字段所属模块 1客户2联系人3询盘4公海客户5线索6公海线索7fbleads8权限部门用户管理9功能权限管理10访客历史11网站留言12产品管理13Google Ads绑定14聊天界面设置-话术设置15Google营销-闭环优化管理16Google营销-手动回传17Google营销-待审核
                list_commonSearch: [], // 常用检索列表
                id_selected_commonSearch: -1, // 当前常用检索 id
                common_conditions: [], // 当前常用检索项的检索数据
                // 删除常用检索确认弹窗
                loading_deleteCommonSearch: false,
                deleteCommonSearchVisible: false,
                deleteCommonSearchId: '',
                deleteCommonSearchName: '',

                // 回传确认弹框
                visible_auditConfirm: false,
                // 选中的数据中是否有已关联数据
                isRelated: false,
                // 所有绑定的 Ads 账户
                adsAccountList: [],
                // 选中数据中没有已关联数据时, 选择 ads 账户回传
                auditAdsAccount: [],
                updateKey: ''
            };
        },
        created() {
            this.addCon();
            // this.getTemplateList();
            this.getAllAdsAccount();
            this.getFailReasonList();
            // 获取 CRM 下拉选项, 取 followup 做跟进状态下拉筛选
            this.$store.dispatch('getSelectOptions');

            // 配置表格筛选
            this.handleConfigureTableFilter();

            /* 初始化获取最近7天的数据表格 */
            // this.getColumnList();
            const endtime = new Date();
            const starttime = new Date();
            this.timeLine = new Date(this.onLineTime).getTime();
            starttime.setTime(starttime.getTime() - 3600 * 1000 * 24 * 6);
            this.datevalue = [starttime, endtime];
            this.startDate = starttime.format('yyyy-MM-dd');
            this.endDate = endtime.format('yyyy-MM-dd');
            this.refreshData_filter();
            this.get_commonSearch();
        },
        activated() { /* keep-alive  生命周期函数每次进入页面都有 不管是否缓存了组件 */
            // window.onresize = () => {
            //   this.table_height = document.body.clientHeight - 270
            //   let autoTemp=(document.body.clientHeight-300)+'px'
            //   document.getElementById('clueBody').style.height=autoTemp
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
                this.editIncellData.forEach(ele => {
                    if (ele.acctId === row.acctId) {
                        this.$set(ele, key, value);
                    }
                });
               
                // this.$set(row, key, value);
                // console.log(value);
            },
            // 返回
            goBack() {
                this.$emit('update:showField', 0);
            },
            deleteRow() {
                const ids = this.selections.join(',');
                util.ajax({
                    url: '/crm/conversionAudit/delete',
                    method: 'get',
                    params: {
                        ids: ids, // 当前选中的行数据id,传字符串,逗号间隔开
                        orgId: this.enterpriseId// 组织机构编码
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$Message.success(this.$t('googleOptimize.deleteSuccess'));
                        this.showDelete = false;
                        this.selections = [];
                        this.refreshData();
                    } else {
                        this.$Message.error(this.$t('googleOptimize.deleteError'));
                    }
                });
            },
            dataSelect(selection) {
                console.log('dataSelect', selection);
                this.showDelete = selection.length !== 0;
                const arr = [];
                for (const i in selection) {
                    arr.push(selection[i].id);
                }
                this.selections = arr;
            },
            // 回传之前判断是否有 ads 账户
            // beforePassBack() {
            //     // 选中项数量校验
            //     if (!this.selections.length) {
            //         this.$Message.info(this.$t('googleOptimize.conversionWarning'));
            //         return;
            //     }
            //
            //     // 判断
            //     checkRelation({
            //         ids: this.selections.join(','), // 当前选中的行数据id,传字符串,逗号间隔开
            //         orgId: this.enterpriseId// 组织机构编码
            //     }).then(res => {
            //         if (res.code === '1') {
            //             this.isRelated = res.data;
            //             this.visible_auditConfirm = true;
            //         }
            //     });
            // },
            // 真正的回传
            passBack() {
                if (this.selections.length > 0) {
                    // // 当选中数据没有关联 google ads 账户时, 校验手动选择的 ads 账户是否为空
                    // if (!this.isRelated && !this.auditAdsAccount.length) {
                    //     this.$Message.error(this.$t('googleOptimize.error_emptyAuditAdsAccount'));
                    //     return;
                    // }

                    const ids = this.selections.join(',');
                    this.loading_passback = true;
                    util.ajax({
                        url: '/crm/conversionAudit/upload',
                        method: 'get',
                        params: {
                            ids: ids, // 当前选中的行数据id,传字符串,逗号间隔开
                            orgId: this.enterpriseId // 组织机构编码
                            // customerId: this.auditAdsAccount.join(',')
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.$Message.success(this.$t('googleOptimize.passBack') + this.$t('googleOptimize.conversionSuccess'));
                            this.showDelete = false;
                        } else if (response.data.code === '2') {
                            this.$Message.success(this.$t('googleOptimize.conversionActionFirstly'));
                        } else {
                            if (response.data.message && response.data.message.includes('The click associated with the given identifier or iOS URL parameter occurred less than 6 hours ago')) {
                                this.$Message.error(this.$t('googleOptimize.error_returnGoogleForGclidCreateTime'));
                            } else {
                                this.$Message.error(this.$t('googleOptimize.conversionError'));
                            }
                        }
                        this.loading_passback = false;
                        this.selections = [];
                        this.refreshData_filter();
                        // this.visible_auditConfirm = false;
                    }).catch(error => {
                        console.error(error);
                        this.loading_passback = false;
                        this.$Message.error(this.$t('googleOptimize.conversionError'));
                        // this.visible_auditConfirm = false;
                    });
                } else {
                    this.$Message.info(this.$t('googleOptimize.conversionWarning'));
                    // this.visible_auditConfirm = false;
                }
            },
            /* 获取表头 */
            // getColumnList() {
            //     this.loading = true;
            //     util.ajax({
            //         url: '/crm/conversionAudit/getAttrs',
            //         method: 'get',
            //         params: {
            //             orgId: this.enterpriseId
            //         }
            //     }).then(response => {
            //         if (response.data.code === '1') {
            //             const columnList = {
            //                 title: this.$t('googleOptimize.revenueValue'),
            //                 align: 'center',
            //                 children: []
            //             };
            //             const groupTemp = [];
            //             const showList = response.data.data;
            //             for (const key in showList) {
            //                 groupTemp.push(showList[key].attrName);
            //                 console.log(showList[key].attrName);
            //                 const temp = showList[key].editable === '1';
            //                 if (showList[key].title) {
            //                     columnList.children.push({
            //                         title: showList[key].title,
            //                         key: `${showList[key].attrId}`,
            //                         align: 'center',
            //                         minWidth: 110,
            //                         editable: true
            //                     });
            //                 }
            //             }
            //             // table表头
            //             this.tableColumns.push(columnList);
            //             console.log('>>>>>>>>>>?>?>?>>?>?>', this.tableColumns);
            //             this.refreshData();
            //         }
            //     });
            // },
            // 处理表格接口返回的数据
            handleData(dataList) {
                return dataList.map((item, index) => {
                    // const List = item.followups;
                    // for (const i in List) {
                    //     const key = List[i].processId;
                    //     // item[key]=List[i].value+';'+List[i].useRevenueValue
                    //     item[key] = `${List[i].value};${List[i].useRevenueValue}`;
                    // }

                    const {
                        conversionName: conversionAction,
                        value: revenueValue,
                        adsCustomerName: adsAccount,
                        uploadState: status,
                        uploadFailType: failReason
                    } = item;
                    return {
                        ...item,
                        conversionAction,
                        revenueValue,
                        adsAccount,
                        status,
                        failReason
                    };
                });
            },
            /* 刷新表格数据 */
            refreshData() {
                this.refreshTable = false;
                this.loading = true;
                const jsonData = {
                    startDate: this.startDate || '',
                    endDate: this.endDate || '',
                    orgId: this.enterpriseId,
                    needAudit: 1, // 1 待审核界面数据  2手动回传提交审核数据
                    pageSize: this.pagesize,
                    pageNo: this.curpage,
                    query: this.queryData.$and.length ? JSON.stringify(this.queryData) : undefined
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
                            this.data1 = this.handleData(response.data.data.list);
                            this.totalpage = response.data.data.total;
                        }
                    }
                    this.$nextTick(() => {
                        this.refreshTable = true;
                    });
                }).catch(error => {
                    this.loading = false;
                    this.$nextTick(() => {
                        this.refreshTable = true;
                    });
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
                    this.refreshData_filter();
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
                this.refreshData_filter();
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
                    } else {
                        // this.$store.commit('update_associated_followUpStatus_list', false);
                        this.loading = false;
                    }
                });
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
            // 获取 Google 回传失败类型, 做下拉筛选用
            getFailReasonList() {
                getGoogleUploadFailReasonList({
                    orgId: this.enterpriseId
                }).then(res => {
                    if (res.code === '1') {
                        // 处理表格数据
                        let dataList = res.data || [];
                        if (Array.isArray(dataList)) {
                            dataList = dataList.map(item => {
                                return {
                                    value: item,
                                    label: this.$t(`googleOptimize.failReasonList.${item}`)
                                };
                            });
                        }

                        // 更新下拉筛选选项数据
                        this.setSelectOptions('failReason', dataList);
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
                    case 'gclidCreateDate':
                    case 'gclidExpireDate':
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
                    case 'presentFollowup':
                    case 'status':
                    case 'failReason':
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
                    // 默认
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
                    case 'gclidCreateDate':
                    case 'gclidExpireDate':
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
            /* 添加检索条件 */
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
            /* 删除检索条件 */
            removeCon(index) {
                this.conditionList.splice(index, 1);
            },
            /* 筛选字段-获取检索类型 */
            getSearchCon(key) {
                switch (key) {
                    case 'visitorId':
                        return 'visitorId';
                    case 'presentSumbitPerson':
                        return 'presentSumbitPersonId';
                    case 'gclidCreateDate':
                        return 'gclidCreateDate';
                    case 'gclidExpireDate':
                        return 'gclidExpireDate';
                    case 'adsAccount':
                        return 'customerId';
                    case 'presentFollowup':
                        return 'presentFollowupId';
                    case 'conversionAction':
                        return 'conversionId';
                    case 'revenueValue':
                        return 'revenueValue';
                    case 'status':
                        return 'uploadState';
                    case 'failReason':
                        return 'uploadFailType';
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
            /* 筛选字段-检索 */
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
                this.curpage = 1;
                this.refreshData_filter();
            },
            /* 清空检索条件 */
            empty() {
                this.id_selected_commonSearch = -1;
                this.common_conditions = [];
                this.searchData = [];
                this.conditionList = [];
                this.addCon();
                this.filtering = false;
                this.curpage = 1;
                this.refreshData_filter();
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
                // 检查筛选各条件是否都不为空
                const flag = this.conditionList.some(item => {
                    if (item.condition1 !== '' && item.condition2 !== '' && item.condition3 !== '') {
                        conditionList.push({
                            con1: item.condition1,
                            con2: item.condition2,
                            con3: item.condition3
                        });
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
                    this.curpage = 1;
                    this.refreshData_filter();
                } else {
                    this.$Message.error(this.$t('crm.Table.error_getCommonSearchItem'));
                }
            }, // 点击常用检索项检索
            handleCellChange(val, index, key) {
                console.log(val[index]);
                const id = val[index].id;
                const Text = val[index][key];
                console.log(Text);
                if (!Text) {
                    this.$Message.success(this.$t('googleOptimize.valueWarning'));
                    return false;
                }
                util.ajax({
                    url: '/crm/conversionAudit/updateDifferentValue',
                    method: 'post',
                    data: {
                        id: id,
                        orgId: this.enterpriseId,
                        value: Text,
                        processId: key
                    }
                }).then(response => {
                    if (response.data.code == 1) {
                        this.$Message.success(this.$t('googleOptimize.updateSuccess'));
                    }
                });
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
                            this.curpage = 1;
                            this.refreshData_filter();
                        }
                    } else {
                        this.$Message.error(this.$t('crm.UniSet.error_delete'));
                    }
                    this.loading_deleteCommonSearch = false;
                }).catch(error => {
                    this.$Message.error(this.$t('crm.UniSet.error_delete'));
                    this.loading_deleteCommonSearch = false;
                });
            },

            /* 表头筛选 */
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
                    const sortIcons = h('span', {
                        class: {
                            'table-sort-icon-container': true
                        }
                    }, [
                        h('Icon', {
                            class: {
                                'icon-custom-on': true,
                                'icon-custom-on-active': this.order_column === column.key && this.order_type === 'asc'
                            },
                            props: {
                                type: 'md-arrow-dropup'
                            }
                        }),
                        h('Icon', {
                            class: {
                                'icon-custom-on': true,
                                'icon-custom-on-active': this.order_column === column.key && this.order_type === 'desc'
                            },
                            props: {
                                type: 'md-arrow-dropdown'
                            }
                        })
                    ]);
                    // 筛选组件
                    const filterPop = h('FilterBox', {
                        props: Object.assign({
                            showPopper: this.tableColumns[colIndex].show_filter_content,
                            filtering: this.tableColumns[colIndex].filtering,
                            columnKey: column.key,
                            columnCon: column.key,
                            order_type: this.order_type,
                            order_column: this.order_column,
                            storageName_orderColumn: this.storageName_orderColumn
                        }, this.config_tableFilter[column.key]),
                        on: {
                            updateList: () => {
                                const temp = this.config_tableFilter[column.key];
                                if (temp) {
                                    // 判断是否有值, 调整 sqlList
                                    const con = this.getSearchCon(column.key);

                                    if (temp.query.length || typeof temp.query === 'number') {
                                        const result = {};
                                        switch (temp.filterType) {
                                            case 'string':
                                                this.$set(this.sqlList_tableFilter, con, {
                                                    $regex: temp.query
                                                });
                                                break;
                                            case 'number':
                                                this.$set(this.sqlList_tableFilter, con, {
                                                    $eq: temp.query
                                                });
                                                break;
                                            case 'select':
                                            case 'users':
                                                result.$or = temp.query.map(item => {
                                                    const temp = {};
                                                    temp[con] = {};
                                                    item.value === null ? temp[con].$null = -1 : temp[con]['$eq'] = item.value;
                                                    return temp;
                                                });

                                                this.$set(this.sqlList_tableFilter, con, result);
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
                                                    this.config_tableFilter[column.key].query = [];
                                                    this.$delete(this.sqlList_tableFilter, con);
                                                }
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

                                    // 刷新列表
                                    this.refreshData_filter();
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
                    }, [
                        title,
                        (this.order_column === column.key && this.order_type) ? sortIcons : undefined,
                        column.hasOwnProperty('show_filter_content') ? filterPop : undefined
                    ]);
                };
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
                        case 'date':
                        case 'select':
                        case 'selectSingle':
                        case 'countryArea':
                        case 'users':
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

                    this.$delete(this.sqlList_tableFilter, this.getSearchCon(col.key));
                }

                this.refreshData_filter();
            },
            // 删掉 sort tag
            empty_sort() {
                // 清空
                this.order_column = '';
                this.order_type = '';

                // 刷新
                this.refreshData_filter();
            },
            // 配置表头筛选
            handleConfigureTableFilter() {
                this.tableColumns.forEach((col, index) => {
                    const headSet = this.config_tableFilter[col.key];
                    if (headSet && (headSet.sort || headSet.filter)) {
                        col.show_filter_content = false;
                        col.filtering = false;
                        col.renderHeader = this.renderHeader_filter(index);
                    }
                    this.$set(this.tableColumns, index, col);
                });
            },
            // 处理检索条件
            merge_query_list() {
                // 右上角筛选框优先级更高, a 为检索/常用检索条件, b 为表头检索条件
                const b = this.computed_sqlList_tableFilter;
                let a = [];

                // 处理检索/常用检索数据
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
            // 检索并刷新表格
            refreshData_filter() {
                this.merge_query_list();
                this.curPage = 1;
                this.refreshData();
            }
        },
        watch: {
            refreshTable() {
                this.selections = [];
            },
            allSelectOptions: {
                handler(val) {
                    if (val && Array.isArray(val.followUp)) {
                        // CRM 设置中的跟进状态选项
                        // 去掉此通用方法给跟进状态选项手动加的"询盘"根基暂停(attrId 为 0), 避免和下方转化有关的"询盘"'跟进状态'冲突
                        let optionList = val.followUp.filter(item => item.attrId).map(({ attrId, attrName }) => {
                            return {
                                value: attrId,
                                label: attrName
                            };
                        });
                        // 其他"线索", "高价值流量"等'跟进状态'
                        const otherOptions = [
                            {
                                value: -20,
                                label: this.$t('crm.UniSet.defaultFollowUpStatus_inquiry')
                            },
                            {
                                value: -1,
                                label: this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry')
                            },
                            {
                                value: -30,
                                label: this.$t('crm.UniSet.defaultFollowUpStatus_highValue')
                            },
                            {
                                value: -25,
                                label: this.$t('crm.UniSet.defaultFollowUpStatus_clue')
                            }
                        ];
                        optionList = otherOptions.concat(optionList);

                        // 更新下拉筛选选项数据
                        this.setSelectOptions('presentFollowup', optionList);
                    }
                }
            }
        }
    };
</script>

<style scoped lang="less">

    .audit /deep/ .el-table thead.is-group th{
        background: #FFFFFF;
    }
    .audit /deep/ .el-table__fixed{
        box-shadow: none;
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

    .color {
        margin-top: 10px;
        margin-left: 125px;
        margin-bottom: 10px;
    }

    .demo-spin-container {
        display: inline-block;
        width: 100%;
        height: 400px;
        position: absolute;
        top: 50px;
        left: 0;
    }
    .auditConfirm-select-container {
        display: flex;
    }

    .auditConfirm-select {
        flex: 1;
    }
</style>

<style>
    /*表单始终铺满界面*/
    .tabmain table {
        width: 100% !important;
    }
    .checkboxgroup > label {
        display: block;
        margin-bottom: 5px;
    }
</style>
