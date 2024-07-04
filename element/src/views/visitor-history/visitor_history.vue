<template>
    <!-- 重构版 -->
    <div class="main-body visitor-history"
         :class="{'visitor-history__hasDashBoardFilterCon': dashBoardFilterCon}" @click="hidelayer()">
        <!-- 如果有仪表盘筛选条件, 顶部固定显示提示语 -->
        <div v-if="dashBoardFilterCon"
             class="useDashBoardFilterConTip">{{ $t('visitor_history.tip_canOnlyUseDashBoardFilterCon') }}</div>

        <Row class="datewrap">
            <template v-if="selectedVisitors.length && isAiCompany !== undefined" >
                <div style="display:inline-block;height:43px">
                    {{ $t('crm.Table.selected') }}
                    <span style="font-weight: bolder;">{{ selectedVisitors.length }}</span>
                    {{ selectedVisitors.length > 1 ? $t('crm.Table.item_clues') : $t('crm.Table.item_clue') }}
                    <Button  type="text" @click="passBack()" class="visitor-history-pass-back">{{$t('googleOptimize.passBack')}}</Button>
                </div>
                <span>
                    <Button
                        type="text"
                        @click="clearSelectedVisitors">
                            <Icon type="md-close" size="18"></Icon>
                    </Button>
                </span>
            </template>
            <div v-else style="line-height: 1;">
                <div style="margin-right:20px;line-height:normal;display:inline-block; font-weight:500; font-size:16px;vertical-clign:middle;color:#2d2f2e">{{ $t('visitor_history.allVisitor') }}</div>

                <!-- 仪表盘筛选条件 -->
                <div v-if="dashBoardFilterCon"
                     class="other-filter-tags-container">
                    <Tag closable
                         @close="removeDashBoardFilterCon">{{ $t('visitor_history.dashBoardFilterCon') }}</Tag>
                </div>

                <!-- 筛选标签 -->
                <FilterTags
                    :order_column="order_column"
                    :order_type="order_type"
                    :storageName_orderColumn="storageName_orderColumn"
                    :filterConObj.sync="config_tableFilter"
                    :langObj="lang_visitor_history"
                    :removeble="removeble"
                    :width="600"
                    :dateOptions="filterDateOptions"
                    @onChangeTime="onChangeTime"
                    @removeCon="remove_filter_tag"
                    @change_filter_tag="change_filter_tag"
                    @emptySort="empty_sort"
                    class="filter-tags-container"
                ></FilterTags>
                <!-- 右上角筛选 + 文件下載 -->
                <span style="float:right;position:relative;">
                    <Poptip width="540" placement="bottom-end" trigger="click"
                            :disabled="dashBoardFilterCon">
                        <Button
                            slot="reference"
                            type="text"
                            icon="custom custom-table-filter"
                            :disabled="dashBoardFilterCon"
                            :style="filtering?'color:#4285f4;padding: 5px 20px 6px;':'padding: 5px 20px 6px;'">
                                {{$t('filter_box.filter_field')}}
                        </Button>
                        <div>
                            <div style="padding: 0 10px 10px 10px">
                                <div>
                                    <div>
                                        <div class="filter-tips">{{$t('filter_box.filter_con')}}</div>
                                        <div class="conditionmain" v-for="(add, index) in addCondition" :key="index">
                                            <Select
                                                v-model="add.condition1"
                                                style="width:120px;margin-right:15px;float:left;"
                                                size="small"
                                                @on-open-change="handleRepeat(index)"
                                                @change="addChangeCon1($event,index)">
                                                    <Option
                                                        v-for="item in add.conditionList1"
                                                        :value="item.value"
                                                        :key="item.value"
                                                        :disabled="item.disabledR">
                                                            {{ item.label }}
                                                    </Option>
                                            </Select>
                                            <Select
                                                v-model="add.condition2"
                                                style="width:90px;margin-right:15px;float:left;"
                                                size="small"
                                                :ref="`selMiddle${index}`">
                                                <Option v-for="item in add.conditionList2" :value="item.value" :key="item.value">{{ item.label }}
                                                </Option>
                                            </Select>
                                            <div style="margin-bottom:10px;">
                                                <template v-if="add.inputType === 'string'">
                                                    <Input
                                                        v-model="add.condition3"
                                                        size="small"
                                                        :placeholder="$t('crm.Table.tip_addKeywords')"
                                                        class="condition3"></Input>
                                                </template>
                                                <template v-else-if="add.inputType === 'number'">
                                                    <InputNumber
                                                        :min="0"
                                                        v-model="add.condition3"
                                                        size="small"
                                                        :placeholder="$t('crm.Table.tip_inputNumber')"
                                                        class="condition3">
                                                    </InputNumber>
                                                </template>
                                                <!-- 使用v-show避免日期选择框定位问题 -->
                                                <span v-show="add.inputType === 'dateRange'">
                                                    <DatePicker
                                                        v-model="add.condition3"
                                                        format="yyyy-MM-dd"
                                                        type="daterange"
                                                        placement="bottom-end"
                                                        :placeholder="$t('crm.Table.tip_selectTime')"
                                                        @focus="changeDateR(index)"
                                                        :picker-options="dateOptionR"
                                                        size="small"
                                                        class="condition3"></DatePicker>
                                                </span>
                                                <!-- 使用v-show避免日期选择框定位问题 -->
                                                <span v-show="add.inputType === 'date'">
                                                    <DatePicker
                                                        v-model="add.condition3"
                                                        format="yyyy-MM-dd"
                                                        type="date"
                                                        placement="bottom-end"
                                                        :placeholder="$t('crm.Table.tip_selectTime')"
                                                        size="small"
                                                        class="condition3"></DatePicker>
                                                </span>
                                                <template v-if="add.inputType === 'select'">
                                                    <Select
                                                        v-model="add.condition3"
                                                        filterable
                                                        size="small"
                                                        class="manager-select condition3">
                                                        <Option v-for="item in add.conditionList3"
                                                            :value="item.value"
                                                            :label="item.label"
                                                            :key="item.value + index"></Option>
                                                    </Select>
                                                </template>
                                                <template v-else-if="add.inputType === 'array'">
                                                    <Select
                                                        v-model="add.condition3"
                                                        multiple
                                                        filterable
                                                        size="small"
                                                        class="array-select condition3">
                                                        <Option v-for="item in add.conditionList3"
                                                                :value="item.value"
                                                                :label="item.label"
                                                                :key="item.label + index"></Option>
                                                    </Select>
                                                </template>
                                            </div>
                                            <!-- 右侧新增/删除按钮 -->
                                            <template v-if="index === 0">
                                                <span @click="addClick()">
                                                    <!-- <Icon type="plus-circled" size="15" color="#FA8241"
                                                            style='cursor:pointer;display:inline-block;'></Icon> -->
                                                    <Icon  size="15" class="custom custom-add-circle"
                                                            style='cursor:pointer;display:inline-block;'></Icon>
                                                </span>
                                            </template>
                                            <template v-else>
                                                <span @click="removeClick(index)">
                                                    <!-- <Icon type="minus-circled" size="15" color="#FA8241"
                                                        style='cursor:pointer;display:inline-block;'></Icon> -->
                                                    <Icon size="15" class="custom custom-reduce-circle"
                                                        style='cursor:pointer;display:inline-block;'></Icon>
                                                </span>
                                            </template>
                                        </div>

                                    </div>
                                    <div class="btn _f _j_e" style="margin-top: 10px">
                                        <Button type="primary" size="small" :loading="SearchLoading"  @click.stop="searchData()">
                                            <span v-if="!SearchLoading">{{$t('filter_box.filter')}}</span>
                                        </Button>
                                        <Button size="small" @click.stop="empty()">{{$t('filter_box.empty')}}</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Poptip>
                    <Poptip placement="bottom-end" trigger="hover">
                        <Button
                            slot="reference"
                            v-if="authorized_button['exportData']"
                            style="padding-right:0;padding-left:0;"
                            type="text"
                            icon="custom custom-file-download"
                            @click="exportData">
                                {{$t('filter_box.export_data')}}
                        </Button>
                        <div style="white-space: normal;width:180px">
                            <p>{{$t('filter_box.one_day')}}</p>
                        </div>
                    </Poptip>
                </span>
            </div>
        </Row>
        <Row>
            <!-- 列表相关 -->
            <Col :span="24">
                <div class="edittable-table-height-con">
                    <Table v-if="refreshColumnFlag"
                           v-loading="loading"
                           :data="editIncellData"
                           :height="table_height"
                           :highlight-current-row="true"
                           :row-key="getRowKey"
                           :isCustom="true"
                           :customEmptyText="customEmptyTextLang"
                           :customEmptyButtonText="customEmptyButtonTextLang"
                           :customClearMethod="clearFilterConditionByInitView"
                           :header-cell-class-name="headerCellClass"
                           :border="true"
                           ref="visitorTable"
                           @row-click='clickRow'
                           @select-all="handleSelectAll"
                           @select="handleSelectionChange"
                           @mousemove.native="handleTableColHover"
                           @mousedown.native="handleTableColResizeStart"
                           @header-dragend="handleTableColResizeEnd"
                           class="tabmain noBoxShadow-right noborder-table resizable-table">
                            <TableColumn
                                width="50"
                                align="center"
                                fixed
                                :reserve-selection="true"
                                type="selection">
                            </TableColumn>
                            <!-- 序号 -->
                            <TableColumn type="index"
                                         width="80"
                                         :label="$t('visitor_history.index')"
                                         :resizable="false"></TableColumn>
                            <template v-for="item in currentColumns">
                                <TableColumn
                                    v-if="!item.customSettings"
                                    :key="item.key"
                                    :fixed ="item.fixed"
                                    :align="item.align"
                                    :prop="item.key"
                                    :label="item.title"
                                    :width="item.width"
                                    :min-width="item.minWidth"
                                    :render-header="item.renderHeader"
                                    :formatter="item.formatter?item.formatter:null"
                                    show-overflow-tooltip>
                                </TableColumn>
                                <!-- :min-width="item.minWidth" -->
                                <TableColumn
                                    v-else-if="item.key === 'remark'"
                                    :prop="item.key"
                                    :label="item.title"
                                    :width="item.width"
                                    :render-header="item.renderHeader"
                                    :align="item.align"
                                    :key="item.key"
                                    class-name="web-remark">
                                    <template slot-scope="scope">
                                        <Row :gutter="10">
                                            <Tooltip v-if="scope.row.remark && scope.row.remark.length > 6"
                                                     :content="scope.row.remark"
                                                     placement="top">
                                                <Col :span="21">{{ scope.row.remark.slice(0, 6) + '...' }}</Col>
                                            </Tooltip>
                                            <Col v-else
                                                 :span="21">{{ scope.row.remark }}</Col>
                                            <Col v-if="authorized_button['remark']"
                                                 :span="3"
                                                 :offset="scope.row.remark ? 0 : 21">
                                                <span @click="clickEditIcon(scope.row, scope.$index)">
                                                    <i class="show-edit-btn custom custom-edit"
                                                       style="font-size: 12px"></i>
                                                </span>
                                            </Col>
                                        </Row>
                                    </template>
                                </TableColumn>
                                <TableColumn
                                    v-else-if="item.key === 'visitorType'"
                                    :prop="item.key"
                                    :label="item.title"
                                    :width="item.width"
                                    :align="item.align"
                                    :render-header="item.renderHeader"
                                    :key="item.key">
                                        <template slot-scope="scope">
                                            <Select v-model="scope.row.visitorType"
                                                    :disabled="!authorized_button['visitorType']"
                                                    size="mini"
                                                    placeholder="请选择"
                                                    @change="changeVisitorType(scope)">
                                                <Option
                                                    v-for="item in visitorTypeList"
                                                    :key="item.name"
                                                    :label="item.name"
                                                    :value="item.name">
                                                </Option>
                                            </Select>
                                        </template>
                                </TableColumn>
                            </template>
                            <!-- <TableColumn
                                width="40"
                                fixed="right"
                                align="center"
                                :resizable="false"
                                class-name="no-padding-cell">
                                    <template slot="header" slot-scope="scope">
                                        <i class="custom custom-table-edit-columns" style="font-size: 18px" @click="visible_edit_columns = true"></i>
                                    </template>
                            </TableColumn> -->
                    </Table>
                </div>
                <!-- 分页 -->
                <div style="margin-right: 30px;overflow: hidden;">
                    <Page
                        :page-sizes="pageSizeOpts"
                        :page-size="pageSize"
                        :current-page="currentPage"
                        layout="total, prev, pager, next, sizes, jumper"
                        :total="totalPage"
                        ref="pages"
                        :placement="'top'"
                        @size-change="pageSizeChange"
                        @current-change="changePage"
                        class="pageWrap-right">
                    </Page>
                </div>
                <!-- </div> -->
            </Col>
        </Row>
        <!-- 删除常用检索 -->
        <Modal
            :visible.sync="deleteCommonSearchVisible"
            :title="$t('editSure')"
            width="500px"
            :append-to-body="true"
            :modal-append-to-body="false">
                <div style="margin-bottom:20px;">
                    {{`${this.$t('editSureTip1')}${deleteCommonSearchName}${$t('editSureTip2')}`}}
                </div>
                <div slot="footer">
                    <Button
                        size="small"
                        @click="cancelDel_commonSearch">{{ $t('cancel') }}</Button>
                    <Button
                        size="small"
                        type="primary"
                        @click="sureDel_commonSearch">{{ $t('confirm') }}</Button>
                </div>
        </Modal>
        <EditColumns
            :visible.sync="visible_edit_columns"
            :columnType="columnType"
            :id.sync="id_column_show_order"
            :allColumns="allColumns"
            :allGroup="allGroup"
            :group.sync="group">
        </EditColumns>
        <!-- 编辑备注 -->
        <Modal
            :visible.sync="editRemarkVisible"
            :title="$t('visitor_history.remark')"
            width="400px"
            :append-to-body="true"
            :modal-append-to-body="false">
                <div style="margin-bottom:20px;">
                    <Input v-model="editRemark"
                        type="textarea"
                        :rows="3"
                        :placeholder="$t('authority.adminPermis.enter_some')"></Input>
                </div>
                <div slot="footer">
                    <Button
                        size="small"
                        @click="cancleChangeRemark">{{ $t('cancel') }}</Button>
                    <Button
                        size="small"
                        type="primary"
                        :loading="isChangeSucc"
                        @click="sureChangeRemark">{{ $t('confirm') }}</Button>
                </div>
        </Modal>

        <VisitorDetail
            ref="visitorDetails"
            :type="'visitorHistory'"
            :row="currentRow"
            :timeLine="timeLine"
            :key="updateKey"
            :showDetail.sync="showDetail"
            @changeRowData="changeRowData">
        </VisitorDetail>

        <Button type="primary" id="CopyUrl"  style="display: none;"
                v-clipboard:copy="currUrl"
                v-clipboard:success="onCopy"
                v-clipboard:error="onError">
        </Button>
    </div>
</template>

<script>
    import Vue from 'vue';
    import util from '@/libs/util';
    import i18n from '@/locale';
    import { getVisitorTypeListPiwik } from './api/visitor_piwik.js';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import './css/visitor.css';
    import { mapState } from 'vuex';
    import VisitorDetail from './components/visitor-detail.vue';
    import FilterTags from '@/views/main-components/filter-tags';
    import EditColumns from '@/views/crm/Table/Components/Modal/editColumns';
    // import TopRightCournerSearch from '@/views/main-components/top-right-corner-search.vue';
    import resetInitComponents from '@/mixins/resetComponentViewData';
    import tableColResize from '@/mixins/tableColResize';

    export default {
        mixins: [resetInitComponents, tableColResize],
        name: 'visitor_history',
        components: {
            VisitorDetail,
            FilterTags,
            EditColumns
            // TopRightCournerSearch
        },
        data() {
            return {
                // 增加删除常用检索弹窗
                deleteCommonSearchVisible: false,
                deleteCommonSearchId: '',
                deleteCommonSearchName: '',
                refreshColumnFlag: true,
                SearchLoading: false,
                saveSearchLoading: false,
                selected_filter_tab: 'search', // 检索 or 常用检索
                editIndex: -1,
                editRow: '',
                editRemark: '',
                isChangeSucc: false,
                popoverId: '',
                editRemarkVisible: false,
                // 设置是piwik调的筛选借口是piwik还是询盘云本身的，最初是的话是piwik，也就是true
                isPiwikFlag: true,
                allchecked: false,
                allCheckedPageList: [],
                selectedVisitors: [], // 选中的visitor
                currentVisitor: [], // 当前页的visitor值
                isAiCompany: false, // 是否是需要调AI数据的公司
                companyOpenTime: '', // 公司开始使用系统时间
                isNewCompany: false, // 该公司使用系统时间在6月1号之后

                /* 表格 */
                loading: true,
                // editIncellColumns: [], // 展示的表格表头信息
                editIncellData: [], // 所有的表格数据
                allColumns: [], // 展示的表格表头信息
                datevalue: [], // 时间数组

                // 分页信息
                totalPage: 0,
                currentPage: 1,
                pageSize: 20,
                pageSizeOpts: [20, 50, 100],

                /* 日期选择 访客历史没有使用，不知道要不要去掉 */
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
                        }
                    ],
                    disabledDate(date) {
                        return date.valueOf() > Date.now();
                    }
                },

                /* 多语言 */
                lang_visitor_history: {
                    index: `${this.$t('index')}`,
                    // 默认字段
                    visitorId: this.$t('visitor_history.visitor_id'),
                    remark: this.$t('visitor_history.remark'),
                    visitorType: this.$t('visitor_history.visitor_type'),
                    visitorTypeId: this.$t('visitor_history.visitor_type'),
                    visitorName: this.$t('visitor_history.visitor_name'),
                    ipLocation: this.$t('visitor_history.ip_location'),
                    receptionServer: this.$t('visitor_history.service_name'),
                    visitorChatCount: this.$t('visitor_history.visitor_chat_count'),
                    serverChatCount: this.$t('visitor_history.service_chat_count'),
                    createTime: this.$t('visitor_history.create_time'),
                    leaveTime: this.$t('visitor_history.leave_time'),
                    // recentVisitSource: this.$t('visitor_history.recent_visit_source'),
                    // recentFirstVisitorAddress: this.$t('visitor_history.recent_first_visit_address'),
                    // firstVisitSource: this.$t('visitor_history.first_visit_source'),
                    // firstVisitorAddress: this.$t('visitor_history.first_visitor_address'),
                    visitSource: this.$t('visitor_history.source'),
                    firstVisitorAddress: this.$t('visitor_history.first_visit_address'),
                    crmStatus: this.$t('visitor_history.status'),
                    trafficSource: this.$t('visitor_history.traffic_source'),
                    visitValue: this.$t('visitor_history.visit_value'),
                    visitorsMd5: '', // 与时间有关, 需要手动替换
                    interactionVisitorsMd5: this.$t('visitor_history.googleAdsRelatedVisitorsWithInteraction')
                },
                /* 筛选 */
                order_column: '', // 排序字段在数据库中的数据名
                order_type: '', // 排序类型
                storageName_orderColumn: '', // 排序字段
                queryData: {
                    $and: []
                },
                removeble: false,
                // trafficSourceList: [
                //     this.$t('visitor_history.ad_google'),
                //     this.$t('visitor_history.ad_facebook'),
                //     this.$t('visitor_history.ad_yandex'),
                //     this.$t('visitor_history.ad_other'),
                //     this.$t('visitor_history.email_marketing'),
                //     this.$t('visitor_history.ad_cloudshare'),
                //     this.$t('visitor_history.search_engine'),
                //     this.$t('visitor_history.social_network'),
                //     this.$t('visitor_history.other_referrals'),
                //     this.$t('visitor_history.direct_access')
                // ],
                trafficSourceList: [
                    {
                        title: this.$t('visitor_history.ad_google'),
                        id: 1
                    },
                    {
                        title: this.$t('visitor_history.ad_facebook'),
                        id: 2
                    },
                    {
                        title: this.$t('visitor_history.ad_yandex'),
                        id: 9
                    },
                    {
                        title: this.$t('visitor_history.ad_other'),
                        id: 3
                    },
                    {
                        title: this.$t('visitor_history.email_marketing'),
                        id: 4
                    },
                    {
                        title: this.$t('visitor_history.ad_cloudshare'),
                        id: 10,
                        expand: false,
                        parentId: 0,
                        checked: true,
                        children: [
                            {
                                title: this.$t('visitor_history.cloudshare_facebook'),
                                id: 101
                            },
                            {
                                title: this.$t('visitor_history.cloudshare_messenger'),
                                id: 102
                            },
                            {
                                title: this.$t('visitor_history.cloudshare_whatsApp'),
                                id: 103
                            },
                            {
                                title: this.$t('visitor_history.cloudshare_email'),
                                id: 104
                            },
                            {
                                title: this.$t('visitor_history.cloudshare_other'),
                                id: 105
                            }
                        ]
                    },
                    {
                        title: this.$t('visitor_history.search_engine'),
                        id: 5
                    },
                    {
                        title: this.$t('visitor_history.social_network'),
                        id: 6
                    },
                    {
                        title: this.$t('visitor_history.other_referrals'),
                        id: 7
                    },
                    {
                        title: this.$t('visitor_history.direct_access'),
                        id: 8
                    }
                ],
                trafficSourceListRight: [
                    {
                        label: this.$t('visitor_history.ad_google'),
                        value: 1
                    },
                    {
                        label: this.$t('visitor_history.ad_facebook'),
                        value: 2
                    },
                    {
                        label: this.$t('visitor_history.ad_yandex'),
                        value: 9
                    },
                    {
                        label: this.$t('visitor_history.ad_other'),
                        value: 3
                    },
                    {
                        label: this.$t('visitor_history.email_marketing'),
                        value: 4
                    },
                    // 增加智能物料分类
                    // {
                    //     label: this.$t('visitor_history.ad_cloudshare'),
                    //     value: 10
                    // },
                    {
                        label: this.$t('visitor_history.ad_cloudshare_facebook'),
                        value: 101
                    },
                    {
                        label: this.$t('visitor_history.ad_cloudshare_messenger'),
                        value: 102
                    },
                    {
                        label: this.$t('visitor_history.ad_cloudshare_whatsApp'),
                        value: 103
                    },
                    {
                        label: this.$t('visitor_history.ad_cloudshare_email'),
                        value: 104
                    },
                    {
                        label: this.$t('visitor_history.ad_cloudshare_other'),
                        value: 105
                    },
                    {
                        label: this.$t('visitor_history.search_engine'),
                        value: 5
                    },
                    {
                        label: this.$t('visitor_history.social_network'),
                        value: 6
                    },
                    {
                        label: this.$t('visitor_history.other_referrals'),
                        value: 7
                    },
                    {
                        label: this.$t('visitor_history.direct_access'),
                        value: 8
                    }
                ],
                // // 1.未录入 2 线索 102 询盘 3无关
                // crmStatusList: [
                //     { label: this.$t('mail.untreatedDocumented'), value: 0 },
                //     { label: this.$t('mail.clue'), value: 1 },
                //     { label: this.$t('mail.contact'), value: 2 },
                //     { label: this.$t('mail.customer'), value: 3 }
                //     // { value: 1, label: this.$t('website.notEnter') },
                //     // { value: 3, label: this.$t('website.Tooltip2') },
                //     // { value: 2, label: this.$t('clue.clue') },
                //     // { value: 102, label: this.$t('clue.inquiry') }
                // ],
                // 表头筛选
                config_tableFilter: {
                    // 把 createTime 放最前面, 清除 md5 筛选时重置时间筛选就会把时间筛选条件放在最前面
                    createTime: {
                        sort: true,
                        filter: true,
                        filterType: 'date',
                        query: [],
                        allList: null,
                        dateOptions: {
                            shortcuts: [
                                {
                                    text: this.$t('crm.Table.today'),
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        picker.$emit('pick', [start, end]);
                                    }
                                },
                                {
                                    text: this.$t('crm.Table.yesterday'),
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        start.setTime(start.getTime() - 3600 * 1000 * 24);
                                        end.setTime(end.getTime() - 3600 * 1000 * 24);
                                        picker.$emit('pick', [start, end]);
                                    }
                                },
                                {
                                    text: this.$t('crm.Table.thisWeek'),
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
                                    text: this.$t('crm.Table.lastWeek'),
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
                                    text: this.$t('crm.Table.thisMonth'),
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        start.setTime(new Date(start.getFullYear(), start.getMonth(), 1).getTime());
                                        picker.$emit('pick', [start, end]);
                                    }
                                },
                                {
                                    text: this.$t('crm.Table.lastMonth'),
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() - 24 * 60 * 60 * 1000);
                                        start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                                        picker.$emit('pick', [start, end]);
                                    }
                                }
                            ]
                        }
                    },
                    visitorId: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    remark: {
                        sort: true,
                        filter: true,
                        filterType: 'string',
                        query: '',
                        allList: null
                    },
                    visitorName: {
                        sort: true,
                        filter: true,
                        filterType: 'string',
                        query: '',
                        allList: null
                    },
                    visitorType: {
                        sort: true,
                        filter: true,
                        filterType: 'select',
                        query: [],
                        allList: []
                    },
                    visitorTypeId: {
                        sort: true,
                        filter: true,
                        filterType: 'select',
                        query: [],
                        allList: []
                    },
                    ipLocation: {
                        sort: true,
                        filter: true,
                        filterType: 'string',
                        query: '',
                        allList: null
                    },
                    receptionServer: {
                        sort: true,
                        filter: true,
                        filterType: 'select',
                        query: [],
                        serverAccId: [],
                        allList: []
                    },
                    // 'visitorChatCount':{
                    //     sort: true,
                    //     filter: true,
                    //     filterType: 'Number',
                    //     query: '',
                    //     allList: null,
                    // },
                    // 'serverChatCount':{
                    //     sort: true,
                    //     filter: true,
                    //     filterType: 'Number',
                    //     query: '',
                    //     allList: null,
                    // },
                    visitorChatCount: {
                        sort: true,
                        filter: true,
                        filterType: 'string',
                        query: '',
                        allList: null
                    },
                    serverChatCount: {
                        sort: true,
                        filter: true,
                        filterType: 'string',
                        query: '',
                        allList: null
                    },
                    leaveTime: {
                        sort: true,
                        filter: true,
                        filterType: 'date',
                        query: [],
                        allList: null,
                        dateOptions: {
                            shortcuts: [
                                {
                                    text: this.$t('crm.Table.today'),
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        picker.$emit('pick', [start, end]);
                                    }
                                },
                                {
                                    text: this.$t('crm.Table.yesterday'),
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        start.setTime(start.getTime() - 3600 * 1000 * 24);
                                        end.setTime(end.getTime() - 3600 * 1000 * 24);
                                        picker.$emit('pick', [start, end]);
                                    }
                                },
                                {
                                    text: this.$t('crm.Table.thisWeek'),
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
                                    text: this.$t('crm.Table.lastWeek'),
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
                                    text: this.$t('crm.Table.thisMonth'),
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        start.setTime(new Date(start.getFullYear(), start.getMonth(), 1).getTime());
                                        picker.$emit('pick', [start, end]);
                                    }
                                },
                                {
                                    text: this.$t('crm.Table.lastMonth'),
                                    onClick(picker) {
                                        const end = new Date();
                                        const start = new Date();
                                        end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() - 24 * 60 * 60 * 1000);
                                        start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                                        picker.$emit('pick', [start, end]);
                                    }
                                }
                            ]
                        }
                    },
                    // recentVisitSource: {
                    //     sort: true,
                    //     filter: true,
                    //     filterType: 'string',
                    //     query: '',
                    //     allList: null
                    // },
                    // recentFirstVisitorAddress: {
                    //     sort: true,
                    //     filter: true,
                    //     filterType: 'string',
                    //     query: '',
                    //     allList: null
                    // },
                    // firstVisitSource: {
                    //     sort: true,
                    //     filter: true,
                    //     filterType: 'string',
                    //     query: '',
                    //     allList: null
                    // },
                    visitSource: {
                        sort: true,
                        filter: true,
                        filterType: 'string',
                        query: '',
                        allList: null
                    },
                    firstVisitorAddress: {
                        sort: true,
                        filter: true,
                        filterType: 'string',
                        query: '',
                        allList: null
                    },
                    crmStatus: {
                        sort: true,
                        filter: true,
                        filterType: 'select',
                        query: [],
                        allList: []
                    },
                    trafficSource: {
                        sort: true,
                        filter: true,
                        // filterType: 'select',
                        filterType: 'trafficSource',
                        // filterType: 'selectSingle',
                        query: [],
                        allList: []
                    },
                    visitValue: {
                        sort: true,
                        filter: true,
                        filterType: 'string',
                        query: '',
                        allList: null
                    },
                    interactionVisitorsMd5: {
                        sort: false,
                        filter: false,
                        filterType: 'noVal',
                        query: '',
                        allList: null
                    },
                    visitorsMd5: {
                        sort: false,
                        filter: false,
                        filterType: 'noVal',
                        query: '',
                        allList: null
                    }
                }, // 筛选配置
                sqlList_tableFilter: {}, // 表头筛选条件
                params: {},
                dateOptions: {
                    disabledDate(date) {
                        return date.valueOf() >= Date.now();
                    }
                },
                dateOptionR: {
                    disabledDate(date) {
                        return date.valueOf() >= Date.now();
                    }
                },
                filterDateOptions: {},
                timeReference: [],

                /*  右上角筛选 */
                searchName: '', // 检索名称
                disabledR: false,

                /* 右上角筛选 */
                custom_search_name: '',
                list_commonSearch: [],
                conditionList1: [
                    {
                        value: this.$t('visitor_history.visitor_id'),
                        label: this.$t('visitor_history.visitor_id'),
                        type: 'input',
                        disabledR: false,
                        inputType: 'string'
                    },
                    {
                        value: this.$t('visitor_history.visitor_type'),
                        label: this.$t('visitor_history.visitor_type'),
                        disabledR: false,
                        inputType: 'select'
                    },
                    {
                        value: this.$t('visitor_history.visitor_name'),
                        label: this.$t('visitor_history.visitor_name'),
                        type: 'input',
                        disabledR: false,
                        inputType: ''
                    },
                    {
                        value: this.$t('visitor_history.ip_location'),
                        label: this.$t('visitor_history.ip_location'),
                        type: 'input',
                        disabledR: false,
                        inputType: 'string'
                    },
                    {
                        value: this.$t('visitor_history.service_name'),
                        label: this.$t('visitor_history.service_name'),
                        type: 'input',
                        disabledR: false,
                        inputType: 'select'
                    },
                    {
                        value: this.$t('visitor_history.visitor_chat_count'),
                        label: this.$t('visitor_history.visitor_chat_count'),
                        type: 'input',
                        disabledR: false,
                        inputType: 'number'
                    },
                    {
                        value: this.$t('visitor_history.service_chat_count'),
                        label: this.$t('visitor_history.service_chat_count'),
                        type: 'input',
                        disabledR: false,
                        inputType: 'number'
                    },
                    {
                        value: this.$t('visitor_history.create_time'),
                        label: this.$t('visitor_history.create_time'),
                        type: 'input',
                        disabledR: false,
                        inputType: 'dateRange'
                    },
                    {
                        value: this.$t('visitor_history.leave_time'),
                        label: this.$t('visitor_history.leave_time'),
                        disabledR: false,
                        inputType: 'dateRange'
                    },
                    // {
                    //     value: this.$t('visitor_history.recent_visit_source'),
                    //     label: this.$t('visitor_history.recent_visit_source'),
                    //     disabledR: false,
                    //     inputType: 'string'
                    // },
                    // {
                    //     value: this.$t('visitor_history.recent_first_visit_address'),
                    //     label: this.$t('visitor_history.recent_first_visit_address'),
                    //     disabledR: false,
                    //     inputType: 'string'
                    // },
                    // {
                    //     value: this.$t('visitor_history.first_visit_source'),
                    //     label: this.$t('visitor_history.first_visit_source'),
                    //     disabledR: false,
                    //     inputType: 'string'
                    // },
                    // {
                    //     value: this.$t('visitor_history.first_visitor_address'),
                    //     label: this.$t('visitor_history.first_visitor_address'),
                    //     disabledR: false,
                    //     inputType: 'string'
                    // },
                    {
                        value: this.$t('visitor_history.source'),
                        label: this.$t('visitor_history.source'),
                        disabledR: false,
                        inputType: 'string'
                    },
                    {
                        value: this.$t('visitor_history.first_visit_address'),
                        label: this.$t('visitor_history.first_visit_address'),
                        disabledR: false,
                        inputType: 'string'
                    },
                    {
                        value: this.$t('visitor_history.remark'),
                        label: this.$t('visitor_history.remark'),
                        disabledR: false,
                        inputType: 'string'
                    },
                    {
                        value: this.$t('visitor_history.status'),
                        label: this.$t('visitor_history.status'),
                        disabledR: false,
                        inputType: 'select'
                    },
                    {
                        value: this.$t('visitor_history.traffic_source'),
                        label: this.$t('visitor_history.traffic_source'),
                        disabledR: false,
                        inputType: 'select'
                    },
                    {
                        value: this.$t('visitor_history.visit_value'),
                        label: this.$t('visitor_history.visit_value'),
                        disabledR: false,
                        inputType: 'number'
                    }
                ],
                conditionList2: [
                    {
                        value: this.$t('filter_box.lt'),
                        label: this.$t('filter_box.lt')
                    },
                    {
                        value: this.$t('filter_box.lte'),
                        label: this.$t('filter_box.lte')
                    },
                    {
                        value: this.$t('filter_box.equal'),
                        label: this.$t('filter_box.equal')
                    },
                    {
                        value: this.$t('filter_box.gte'),
                        label: this.$t('filter_box.gte')
                    },
                    {
                        value: this.$t('filter_box.gt'),
                        label: this.$t('filter_box.gt')
                    }
                ],
                addCondition: [],
                common_conditions: [], // 常用检索
                common_searchContent: [],
                condition1: '', // 检索条件字段
                condition2: '', // 检索条件逻辑
                // conditionList3:[],
                condition3: '',
                id_selected_commonSearch: -1,
                filtering: false, /* 显示是否是检索状态 */
                filteringType: 'search',
                isSearching: -1,
                historySearch: [], // 常用检索展示表格的数据
                searchItem: [], // 所有的检索条件
                // inputType:true,
                isInput: true, // 是否需要改变为日期输入框
                // inputType1:true,
                selectOptions: {},

                // =============================================
                /* 修改字段 */
                visible_edit_columns: false,
                columnType: 10, // 字段所属模块 1客户2联系人3询盘4公海客户5线索6公海线索7fbleads8权限部门用户管理9功能权限管理 10访客历史
                id_column_show_order: undefined,
                group: [],
                // 保存到后端的字段属性, 目前只有 width
                fieldStyle: {},
                currentColumns: [],

                showDetail: false,
                isOpenPhotogallery: false,
                imgEvent: null,
                // showArrowBtn:false,
                // arrowBtn:false,
                showDialog: true, // 显示对话
                showInfo: false, // 显示信息
                showTrace: false, // 显示轨迹
                timeTemp: '',
                screenH: '', // 屏幕高度
                tableHeight: document.body.clientHeight - 210,
                tableWidth: 1560,
                oldTableWidth: 0, // 没有打开细节侧栏的时候表格的宽度
                tableData: [], // 当前页展示信息

                filtercolshow: false,
                inputClue: false,
                savingClue: false,
                currUrl: '加载中...', /* 拷贝的网址 */
                status: '',
                model1: '',
                reportdata: [],
                searchContent: '',
                indeterminate: false,
                checkAll: true,
                changecolshow: false,
                indeterminate1: false,
                checkAll1: true,
                checkAllGroup1: ['计算机', '移动设备', '平板电脑'],
                indeterminate2: false,
                checkAll2: true,
                checkAllGroup2: ['购物', '视频', '搜索网络', '通用应用', '展示广告网络'],
                x: 0, /* 录入线索的弹窗  拖拽时鼠标距离弹窗的距离 */
                y: 0,
                customerServices: [], /* 销售列表 */
                cluefields: [], /* 线索信息 */
                templateId: '',
                currentUrl: '',

                saleId: '', /* 销售名字 */
                saleName: '',
                delLoading: false,
                colObj: {},
                modalLoading: true, /* 录入线索对话框 点击确定加载 */
                accId: '', /* 筛选的客服人员的id */
                currentRow: {},
                // ============================数据
                serverList: [], // 客服列表
                visitorTypeList: [], // 访客类型列表
                visitorId: '', // 访客id
                // onLineTime:'2019-05-10 00:00:00', //上线时间--早
                onLineTime: '2019-06-01 00:00:00', // 上线时间--晚 // 1559318400000
                timeLine: '',
                timeNow: '',
                tableSearch: [],
                updateKey: '',

                // 仪表盘跳转的筛选条件
                dashBoardFilterCon: null,
                // 从仪表盘跳转带过来的 md5 筛选条件
                interactionVisitorsMd5: '',
                visitorsMd5: ''
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                updatedId: state => state.visitor_history.updatedId,
                button_list: state => state.app.button_list,
                window_height: 'window_height',
                window_width: 'window_width',
                fullName: state => state.fullName,
                healthFBUrl: state => state.healthFBUrl
            }), // 从 vuex 中获取属性
            authorized_button() {
                const buttonIds = BUTTON_IDS.website.visitorHistory;
                return {
                    exportData: !HANDLE_BUTTON(buttonIds.exportData, this.button_list),
                    enterClue: !HANDLE_BUTTON(buttonIds.enterClue, this.button_list),
                    remark: !HANDLE_BUTTON(buttonIds.remark, this.button_list),
                    visitorType: !HANDLE_BUTTON(buttonIds.visitorType, this.button_list)
                };
            },
            table_height() {
                let temp = this.window_height ? this.window_height - 190 : document.body.clientHeight - 190;
                if (temp < 200) {
                    temp = 200;
                }
                // 转 element-ui 时, 表格样式错误, 加上这句后解决, 具体错误原因暂时未看
                temp += this.loading ? 1 : 0;
                return temp;
            },
            // 筛选sql语句
            computed_sqlList_tableFilter() {
                return Object.entries(this.sqlList_tableFilter).map(([key, val]) => {
                    const temp = {};
                    // 数组型 - 日期型 - 字符串型/国家地区
                    if (val.hasOwnProperty('$or')) {
                        temp.$or = val.$or;
                    } else if (val.hasOwnProperty('$and')) {
                        temp.$and = val.$and;
                    } else {
                        temp[key] = val;
                    }
                    return temp;
                });
            },
            /* 右上角筛选条件处理结果 */
            computed_addCondition() {
                const result = this.addCondition.filter(item => (item.condition1 && item.condition2 && ((item.condition3 && item.condition3.length) || item.condition3 instanceof Date || (typeof item.condition3 === 'number' && !isNaN(item.condition3))))).map(item => {
                    const temp = {};
                    let con = this.handleSearchConP(item.condition1);
                    const type = this.getSearchType(item.condition2);
                    if (con === 'visitorType') {
                        con = 'visitorTypeId';
                    }

                    switch (item.inputType) {
                        case 'string':
                        case 'number':
                        case 'boolean':
                        case 'countryArea':
                        case 'date':
                        case 'select':
                            if (con === 'receptionServer') {
                                this.serverAccId = [item.condition3];
                                return {
                                    serverAccId: this.serverAccId
                                };
                            } else {
                                temp.$or = [];
                                const re = {};
                                re[con] = {};

                                if (item.inputType === 'countryArea') {
                                    re[con][type === '$ne' ? '$nregex' : '$regex'] = item.condition3.replace('unknown', '');
                                } else {
                                    re[con][type] = item.condition3;
                                }
                                temp.$or.push(re);
                                return temp;
                            }
                        case 'dateRange':
                            temp.$and = [];
                            const start = {};
                            start[con] = {};
                            start[con].$gte = `${this.$options.filters.timeFormat(new Date(item.condition3[0]).getTime())} 00:00:00`;
                            temp.$and.push(start);
                            const end = {};
                            end[con] = {};
                            end[con].$lte = `${this.$options.filters.timeFormat(new Date(item.condition3[1]).getTime())} 23:59:59`;
                            temp.$and.push(end);
                            return temp;
                    }
                }).filter(item => !(!item || item === ''));
                return result;
            },
            allGroup() {
                return this.allColumns.map(item => item.key);
            },
            // 列表有无时间筛选的flag， 初始化时设置为true
            tableTimeFilterFlag() {
                if (!this.config_tableFilter.createTime.query.length && !this.config_tableFilter.leaveTime.query.length) {
                    return false;
                } else if (this.config_tableFilter.createTime.query.length > 0) {
                    return this.config_tableFilter.createTime;
                } else {
                    return this.config_tableFilter.leaveTime;
                }
            },
            // 右上角有无时间筛选的flag， 初始化时设置为false
            rightTimeFilterFlag() {
                // 处理时间问题
                const timeData = this.addCondition.find(item => {
                    return (item.condition1 === this.$t('visitor_history.create_time') || item.condition1 === this.$t('visitor_history.leave_time'));
                });
                return timeData;
            }
        },
        async created() {
            // 处理仪表盘跳转逻辑
            const dashBoardFilterCon = localStorage.getItem('dashboard_visitorHistory_filter');
            if (dashBoardFilterCon) {
                localStorage.removeItem('dashboard_visitorHistory_filter');
                this.dashBoardFilterCon = dashBoardFilterCon;
            }

            this.dateformat();
            this.timeLine = new Date(this.onLineTime).getTime();
            this.timeNow = new Date().getTime();
            const starttime = new Date();
            starttime.setTime(starttime.getTime());
            this.datevalue = [`${starttime.format('yyyy-MM-dd')} 00:00:00`, `${new Date().format('yyyy-MM-dd')} 23:59:59`];
            // 数据初始化--第一次登陆，没有筛选记录时
            this.initTable();
        },
        async mounted() {
            // this.get_commonSearch();
            this.screenH = `${document.body.clientHeight - 262}px`;
            if (this.tableWidth >= window.screen.width) {
                this.tableWidth = window.screen.width - 150;
            }
            this.addCondition = [
                {
                    condition1: '',
                    conditionList1: this.$deepClone(this.conditionList1),
                    condition2: '',
                    conditionList2: this.$deepClone(this.conditionList2),
                    condition3: '',
                    conditionList3: [],
                    inputType: 'string'
                }
            ];

            /* 配置表格显示项 */
            // this.getFieldOrderList();
            this.handleConfigureTableFilter();

            // 获取公司开始使用系统时间 及 6月1号之前有没有数据
            const companyData = await this.getCompanySituation();
            const oldDataLength = await this.enterpriseVisitorsTotalNew();
            this.companyOpenTime = new Date(companyData.data.openDateTime).valueOf();
            // 6月1号之前没有数据 且 公司开始使用时间晚于6月1号
            if (oldDataLength.data === 0 && this.companyOpenTime >= this.timeLine) {
                this.isNewCompany = true;
            } else {
                this.isNewCompany = false;
            }
            // 处理公海线索及我的线索跳转来的逻辑
            if (localStorage.getItem('leadsCloud-VisitorHistoryId')) {
                this.getDeatidByvistiorId(localStorage.getItem('leadsCloud-VisitorHistoryId'));
                localStorage.removeItem('leadsCloud-VisitorHistoryId');
            }
        },
        deactivated() {
            this.showDetail = false;
        },
        methods: {
            // 根据id显示侧滑
            getDeatidByvistiorId(id) {
                this.currentRow = { visitorId: id };
                this.showDetail = true;
            },
            // 获取显示的表格字段
            getFieldOrderList() {
                util.ajaxJson({
                    url: '/crm/commonField/getFieldOrderList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        type: this.columnType
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        if (response.data.data) {
                            // 解构数据
                            const { id, showField, fieldStyle } = response.data.data;
                            this.id_column_show_order = id;

                            // 处理字段顺序
                            if (typeof showField === 'string') {
                                const fields = showField.split(',');
                                this.group = fields.filter(item => this.allGroup.includes(item));
                            } else {
                                this.group = this.allGroup.slice();
                            }

                            // 处理字段宽度
                            this.fieldStyle = fieldStyle ? JSON.parse(fieldStyle) : {};
                            Object.entries(this.fieldStyle).forEach(([fieldKey, fieldObj]) => {
                                const column = this.allColumns.find(item => item.key === fieldKey);
                                if (column && fieldObj.width) {
                                    column.width = fieldObj.width;
                                }
                            });
                        } else {
                            // 如果之前没有保存，则显示所有表格字段
                            this.group = this.allGroup.slice();
                        }
                    } else {
                        this.$Message({
                            message: this.$t('crm.Table.getTableColumnOrder'),
                            type: 'error'
                        });
                        this.group = this.allGroup.slice();
                    }
                });
            },
            /* 多选 */
            getRowKey(row) {
                return row.visitorId + this.$dym.Rnum();
            },
            // 表格表头单元格 class 方法
            headerCellClass({ column }) {
                const result = [];
                // 如果可调整列宽, 则设置相应 class
                if (column.resizable) {
                    result.push('resizable-col');
                }

                // 有 tip 提示的 column , 指定特殊 class , 修改 cell 的 padding 以容纳 tip 和筛选按钮
                if (['trafficSource'].includes(column.property)) {
                    const filterSet = this.config_tableFilter[column.property];
                    if (filterSet && filterSet.filter) {
                        result.push('hasTipAndFilterCell');
                    }
                }

                return result.join(' ');
            },
            handleSelectionChange(selection, row) {
                if (selection.length > 0) {
                    this.selectedVisitors = selection.map(item => {
                        return {
                            visitorId: item.visitorId,
                            gclid: item.gclid
                        };
                    });
                } else {
                    this.selectedVisitors = [];
                }
            },
            // 全选
            handleSelectAll(selection) {
                if (selection.length > 0) {
                    this.selectedVisitors = selection.map(item => {
                        return {
                            visitorId: item.visitorId,
                            gclid: item.gclid
                        };
                    });
                } else {
                    this.selectedVisitors = [];
                }
            },
            // 清空多选
            clearSelectedVisitors() {
                this.$refs.visitorTable.clearSelection();
                this.selectedVisitors = [];
                // this.allchecked = false;
                // this.allCheckedPageList = [];
            },

            /* AI-google回传 */
            // 判断是否是AI公司
            judgeIsAICompany() {
                return new Promise((resolve, reject) => {
                    util.ajaxInternationalJson({
                        url: '/piwikRead/visitorHistory/getShowEnterprise',
                        method: 'get'
                    }).then(res => {
                        if (res.data.code === '1') {
                            resolve(res.data.data);
                        } else {
                            this.isAiCompany = undefined;
                        }
                    }).catch(error => {
                        console.log(error);
                        this.isAiCompany = undefined;
                    });
                });
            },

            /* 回传 */
            // 获取Google绑定的list
            getGoogleList() {
                return new Promise((resolve, reject) => {
                    util.ajax({
                        url: '/crm/conversionRelation/getList',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            isAll: 1
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            // this.$store.commit('update_associated_followUpStatus_list', res.data.data);
                            resolve(res.data.data);
                        } else {
                            this.$Message.error(this.$t('visitor_history.transferErro'));
                            // this.$store.commit('update_associated_followUpStatus_list', false);
                            resolve(null);
                        }
                    }).catch(error => {
                        this.$Message.error(this.$t('visitor_history.transferErro'));
                        // this.$store.commit('update_associated_followUpStatus_list', false);
                        console.log(error);
                        resolve(null);
                    });
                });
            },
            // 获取gclid数组
            getGclidByVisitorIdList(highValue) {
                const visitorIdList = this.selectedVisitors.map(item => {
                    return item.visitorId;
                });
                return new Promise((resolve, reject) => {
                    util.ajaxInternationalJson({
                        url: '/server/getGclidByVisitorIdList',
                        method: 'POST',
                        data: {
                            visitorIdList
                        }
                    }).then(res => {
                        // 如果有包含有gclid，确定是不是全部都有？-- 现在的逻辑是一个访客id对应1个gclid，后续估计要改成1对多的关系
                        if (res.data.code === '1' && res.data.data.length > 0) {
                            const tempArr = res.data.data.map(item => {
                                const temp = {};
                                temp.orgId = this.enterpriseId;
                                temp.gclid = item.gclid;
                                temp.visitorId = item.visitorId;
                                temp.gclidCreateDate = item.createTime;
                                temp.presentSumbitPerson = this.fullName;
                                temp.presentSumbitPersonId = this.userId;
                                temp.presentFollowup = highValue.followup;
                                temp.presentFollowupId = highValue.followupId;
                                temp.presentNeedAudit = 1;
                                temp.customerId = highValue.customerId;
                                temp.adsCustomerName = highValue.adsCustomerName;
                                return {
                                    audit: temp,
                                    conversionId: highValue.conversionId,
                                    useRevenueValue: highValue.useRevenueValue,
                                    value: highValue.value ? highValue.value : 0
                                };
                            });
                            let isAllContainGclid = false;
                            if (res.data.data.length === visitorIdList.length) {
                                isAllContainGclid = true;
                            } else {
                                isAllContainGclid = false;
                            }
                            this.saveAuditList(tempArr, isAllContainGclid);
                            resolve(true);
                        } else {
                            // 全部都没有gclid
                            this.$Message({
                                message: this.$t('visitor_history.withoutGclid'),
                                type: 'error'
                            });
                            resolve(false);
                        }
                    }).catch(error => {
                        console.log(error);
                        if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                            this.$Message({
                                message: this.$t('visitor_history.withoutGclid'),
                                type: 'error'
                            });
                        }
                        resolve(false);
                    });
                });
            },
            // 回传接口
            saveAuditList(tempArr, isAllContainGclid) {
                util.ajaxJson({
                    url: 'crm/conversionAudit/saveAuditList',
                    method: 'POST',
                    data: {
                        saveAuditDtoList: tempArr
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        if (!isAllContainGclid) {
                            this.$Message.success(this.$t('visitor_history.isAllContainGclid'));
                        } else {
                            // 回传成功
                            this.$Message.success(this.$t('visitor_history.passBackSuccess'));
                        }
                    } else {
                        this.$Message.error(this.$t('visitor_history.passBackFailed'));
                    }
                }).catch(error => {
                    console.log(error);
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error(this.$t('visitor_history.passBackFailed'));
                    }
                });
            },
            // 点击回传按钮
            async passBack() {
                // 1. 先确认有无高价值流量转化操作
                const gooleAttrsArr = await this.getGoogleList();
                if (!gooleAttrsArr) {
                    return;
                }
                const highValue = gooleAttrsArr.find(item => {
                    return item.followup === '高价值流量';
                });
                // 如果没有，提醒没有高价值流量
                if (highValue === undefined) {
                    this.$Message.error(this.$t('visitor_history.withoutHighValue'));
                } else {
                    // 2. 如果有高价值流量的话，再调接口拿到gclid
                    const isHaveGclid = await this.getGclidByVisitorIdList(highValue);
                }
                // 刷新页面
                if (this.isPiwikFlag) {
                    this.mergeQueryListP();
                    this.refreshDataP();
                } else {
                    this.mergeQueryListO();
                    this.refreshDataO();
                }
                this.clearSelectedVisitors();
            },


            // =============================================================== 接口
            /* 公用的接口 */
            // 获取客服列表
            async handleGetServerList() {
                this.$commonApi.getServerList({
                    enterpriseId: this.enterpriseId
                }).then(response => {
                    if (response.code === '1') {
                        this.serverList = response.data;
                        this.$set(this.config_tableFilter.receptionServer, 'allList', this.serverList.map(item => {
                            const { serviceName: label, accid: value } = item;
                            return { label, value };
                        }));
                    }
                });
                // const orgId = this.enterpriseId;
                // const resData = await this.$commonApi.getNewusers({ orgId, userId: this.userId });
                // if (resData.code === 10000) {
                //     this.serverList = resData.data;
                //     this.$set(this.config_tableFilter.receptionServer, 'allList', this.serverList.map(item => {
                //         const { cnName: label, larkId: value } = item;
                //         return { label, value };
                //     }));
                // }
            },
            // 获取访客类型列表
            async getVisitorTypeList() {
                // 用的piwik接口数据--- 访客类型和字段设置的接口一致，用的都是piwik的。所以之后再修改访客类型的话，6月1号之前无法修改
                const type = 1;
                const orgId = this.enterpriseId;
                const resData = await getVisitorTypeListPiwik({ type, orgId });
                if (resData.code === '1') {
                    this.visitorTypeList = resData.data;
                    this.$set(this.config_tableFilter.visitorType, 'allList', this.visitorTypeList.map(item => {
                        const { name: label, id: value } = item;
                        return { label, value };
                    }));
                    this.$set(this.config_tableFilter.visitorTypeId, 'allList', this.visitorTypeList.map(item => {
                        const { name: label, id: value } = item;
                        return { label, value };
                    }));
                }
            },
            // 获取公司概况
            getCompanySituation() {
                const that = this;
                return new Promise(function(resolve) {
                    util.ajaxLeadscloudJson({
                        // url: '/new-privilege/org/getOrgList',
                        url: '/v2-privilege/org/getOrgById',
                        method: 'get',
                        params: {
                            orgId: that.enterpriseId
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            resolve(res.data);
                        }
                    });
                });
            },
            // 检测询盘云接口6月1号之前是否有数据
            async enterpriseVisitorsTotalNew() {
                const enterpriseId = this.enterpriseId;
                const searchConditionItem = [{
                    endDate: this.onLineTime,
                    name: 'create_time',
                    type: '3'
                }];
                const pageSize = 10;
                const pageNo = 1;
                return new Promise((resolve, reject) => {
                    util.ajaxInternationalJson({
                        url: '/server/enterpriseVisitorsTotalNew',
                        method: 'post',
                        data: {
                            enterpriseId,
                            searchConditionItem,
                            pageSize,
                            pageNo
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            resolve(res.data);
                        }
                    });
                });
            },
            // 获取常用检索
            get_commonSearch() {
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
                }).catch(error => {
                    console.log(error);
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error(this.$t('crm.Table.error_getCommonSearchList'));
                    }
                });
            },
            // 保存常用检索
            saveCommonSearch() {
                return new Promise((resolve, reject) => {
                    util.ajaxJson({
                        url: '/crm/commonSearch/saveCommonSearch',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            type: this.columnType,
                            userId: this.userId,
                            searchContent: JSON.stringify(this.searchContent),
                            searchName: this.custom_search_name
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            this.get_commonSearch();
                            // this.$Message.success(this.$t('crm.Table.success_save'));
                            this.$Message({
                                message: this.$t('crm.Table.success_save'),
                                type: 'success',
                                duration: 1000,
                                showClose: true
                            });
                            // this.save_disabled = false
                            this.addCondition.forEach((item) => {
                                item.condition1 = '';
                                item.condition2 = '';
                                item.condition3 = '';
                                item.conditionList1 = this.$deepClone(this.conditionList1);
                                item.conditionList2 = this.$deepClone(this.conditionList1);
                                item.inputType = 'string';
                            });
                            this.custom_search_name = '';
                        } else {
                            // this.$Message.error(this.$t('crm.Table.error_save'));
                            this.$Message({
                                message: this.$t('crm.Table.error_save'),
                                type: 'error'
                            });
                        }
                        this.saveSearchLoading = false;
                    }).catch(error => {
                        console.log(error);
                        this.saveSearchLoading = false;
                        if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                            // this.$Message.error(this.$t('crm.Table.error_save'));
                            this.$Message({
                                message: this.$t('crm.Table.error_save'),
                                type: 'error'
                            });
                        }
                    });
                });
            },

            /* 以下接口同一个功能: p代表piwik的接口，o代表询盘云的接口 */
            // 获取列表数据
            refreshDataO() {
                this.loading = true;
                return new Promise((resolve, reject) => {
                    const pageNo = this.currentPage;
                    util.ajaxInternationalJson({
                        url: '/server/enterpriseVisitorsNew',
                        method: 'POST',
                        data: {
                            orderType: this.order_type, // 排序类型 desc  asc
                            orderColumn: this.order_column, // 排序字段
                            enterpriseId: this.enterpriseId,
                            searchConditionItem: this.searchItem,
                            pageSize: this.pageSize,
                            pageNo
                        }
                    }).then(res => {
                        // 延时 loading
                        const timer = setTimeout(() => {
                            this.SearchLoading = false;
                            this.loading = false;
                        }, 500);
                        if (res.data.code === '1') {
                            // 如果当前页没有数据, 且当前页不是第一页, 则跳回到第一页
                            if (!res.data.list.length && pageNo !== 1) {
                                this.changePage(1);
                                // 去掉延时 loading
                                clearTimeout(timer);
                            } else {
                                this.editIncellData = res.data.list;
                                this.totalPage = res.data.total;
                                this.handleData(this.editIncellData);
                            }
                        } else {
                            this.editIncellData = [];
                            this.totalPage = 0;
                            this.currentVisitor = [];
                        }
                        this.isPiwikFlag = false;
                    }).catch(error => {
                        console.log(error);
                        this.editIncellData = [];
                        this.totalPage = 0;
                        this.currentVisitor = [];
                        this.SearchLoading = false;
                        this.loading = false;
                        this.isPiwikFlag = false;
                    });
                });
            },
            refreshDataP() {
                this.loading = true;
                return new Promise((resolve, reject) => {
                    // 暂存请求完毕后还要用到的数据
                    const pageNo = this.currentPage;

                    // 暂存发送请求数据
                    const postData = {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        pageNo,
                        pageSize: this.pageSize
                    };
                    if (this.dashBoardFilterCon) {
                        postData.websiteStatQuery = this.dashBoardFilterCon;
                    } else if (this.interactionVisitorsMd5 || this.visitorsMd5) {
                        // 有 md5 筛选值, 则不走其他筛选, 只筛 md5
                        postData.idsKey = this.interactionVisitorsMd5 || this.visitorsMd5;
                    } else {
                        // 否则, 正常筛选

                        // 后台要求新增客服名称字段
                        let serverAccName = [];
                        if (Array.isArray(this.serverAccId)) {
                            serverAccName = this.serverList.map(item => {
                                if (this.serverAccId.includes(item.accid)) {
                                    return item.serviceName;
                                }
                            }).filter(item => !(!item || item === ''));
                        }

                        postData.query = JSON.stringify(this.queryData);
                        postData.serverAccId = this.serverAccId;
                        postData.serverAccName = serverAccName;
                        postData.orderType = this.order_type;
                        postData.orderColumn = this.order_column;
                        postData.startDate = this.datevalue[0];
                        postData.endDate = this.datevalue[1];
                    }
                    // 发送请求
                    util.ajaxInternationalJsonLangTime({
                        url: '/piwikRead/visitorHistory/getVisitorHistory',
                        method: 'POST',
                        data: postData
                    }).then(res => {
                        if (res.data.code === '1') {
                            // 延时 loading
                            const timer = setTimeout(() => {
                                this.SearchLoading = false;
                                this.loading = false;
                            }, 500);
                            // 如果当前页没有数据, 且当前页不是第一页, 则跳回到第一页
                            if (!res.data.data.list.length && pageNo !== 1) {
                                this.changePage(1);
                                // 去掉延时 loading
                                clearTimeout(timer);
                            } else {
                                this.editIncellData = res.data.data.list;
                                this.totalPage = res.data.data.total;
                                this.handleData(this.editIncellData);
                            }
                        } else {
                            this.editIncellData = [];
                            this.totalPage = 0;
                            this.currentVisitor = [];
                        }
                        this.isPiwikFlag = true;
                    }).catch(error => {
                        console.log('出错了', error);
                        this.editIncellData = [];
                        this.totalPage = 0;
                        this.currentVisitor = [];
                        this.loading = false;
                        this.isPiwikFlag = true;
                    });
                });
            },
            // 修改备注
            async changeRemarkP({ visitorId, visitorRemark, visitorAccId }) {
                util.ajaxInternationalJson({
                    url: '/piwik/visitorInfo/updateCategoriesOrRemark',
                    method: 'POST',
                    data: {
                        visitorId,
                        visitorRemark,
                        visitorAccId,
                        orgId: this.enterpriseId,
                        updateUserId: this.userId
                    }
                }).then(res => {
                    if (res.data.code === '1' && res.data.data === true) {
                        this.$Message({
                            showClose: true,
                            message: this.$t('editSuccess'),
                            type: 'success',
                            duration: 1000
                        });
                        this.isChangeSucc = false;
                        this.editRemarkVisible = false;
                        // this.$set(this.editRow, 'remark', this.editRemark);
                        // this.$set(this.editIncellData, this.editIndex, this.editRow);

                        // 更新"updatedId" , 触发访客历史表格页刷新
                        this.$store.commit('visitor_history/setUpdatedId', null);
                        this.$nextTick(() => {
                            this.$store.commit('visitor_history/setUpdatedId', visitorId);
                        });
                    } else {
                        this.$Message({
                            showClose: true,
                            message: this.$t('editFail'),
                            type: 'error',
                            duration: 1000
                        });
                    }
                }).catch(error => {
                    console.log(error);
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        // this.$Message.error(this.$t('editFail'));
                        this.$Message({
                            showClose: true,
                            message: this.$t('editFail'),
                            type: 'error',
                            duration: 1000
                        });
                    }
                });
            },
            async changeRemarkO({ visitorId, visitorRemark }) {
                util.ajaxInternational({
                    url: '/visitortrace/uploadVisitorRemark',
                    method: 'POST',
                    data: {
                        visitorId,
                        remark: visitorRemark
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.$Message({
                            showClose: true,
                            message: this.$t('editSuccess'),
                            type: 'success',
                            duration: 1000
                        });
                        this.isChangeSucc = false;
                        this.editRemarkVisible = false;
                        // this.$set(this.editRow, 'remark', this.editRemark);
                        // this.$set(this.editIncellData, this.editIndex, this.editRow);

                        // 更新"updatedId" , 触发访客历史表格页刷新
                        this.$store.commit('visitor_history/setUpdatedId', null);
                        this.$nextTick(() => {
                            this.$store.commit('visitor_history/setUpdatedId', visitorId);
                        });
                    } else {
                        this.$Message({
                            showClose: true,
                            message: this.$t('editFail'),
                            type: 'error',
                            duration: 1000
                        });
                    }
                }).catch(error => {
                    console.log(error);
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        // this.$Message.error(this.$t('editFail'));
                        this.$Message({
                            showClose: true,
                            message: this.$t('editFail'),
                            type: 'error',
                            duration: 1000
                        });
                    }
                });
            },
            // 修改访客类别
            async changeVisitorTypeP({ scope, visitorTypeId }) {
                util.ajaxInternationalJson({
                    url: '/piwik/visitorInfo/updateCategoriesOrRemark',
                    method: 'POST',
                    data: {
                        visitorId: scope.row.visitorId,
                        orgId: this.enterpriseId,
                        visitorRemark: scope.row.remark,
                        visitorCategoriesId: visitorTypeId, // 访客类别 id
                        visitorCategoriesName: scope.row.visitorType, // 访客类别 name
                        updateUserId: this.userId
                    }
                }).then(res => {
                    if (res.data.code === '1' && res.data.data === true) {
                        this.$Message({
                            duration: 3000,
                            showClose: true,
                            message: this.$t('editSuccess'),
                            type: 'success'
                        });
                        // this.$refs.editTable.thisTableData[params.index].visitorType = e;
                        // this.$refs.editTable.edittingStore[params.index].visitorType = e;

                        // 更新"updatedId" , 触发访客历史表格页刷新
                        this.$store.commit('visitor_history/setUpdatedId', null);
                        this.$nextTick(() => {
                            this.$store.commit('visitor_history/setUpdatedId', scope.row.visitorId);
                        });
                    } else {
                        this.$Message({
                            duration: 3000,
                            showClose: true,
                            message: this.$t('editFail'),
                            type: 'error'
                        });
                    }
                }).catch(error => {
                    console.log(error);
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        // this.$Message.error(this.$t('editFail'));
                        this.$Message({
                            showClose: true,
                            message: this.$t('editFail'),
                            type: 'error',
                            duration: 1000
                        });
                    }
                });
            },

            /* 权限相关的接口 */
            // 获取该条访客的接待客服id
            getVisitorServerIdListByVisitorIdP(data) {
                return new Promise((resolve, reject) => {
                    util.ajaxInternationalJson({
                        url: '/piwikRead/visitorHistory/getVisitorServerIdListByVisitorId',
                        method: 'get',
                        params: {
                            visitorId: data.visitorId,
                            orgId: String(this.enterpriseId)
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            return resolve(res.data.data);
                        } else {
                            // this.$Message.error(this.$t('visitor_history.haveNoPrivilege'));
                            this.$Message({
                                message: this.$t('visitor_history.haveNoPrivilege'),
                                type: 'error'
                            });
                            return resolve(null);
                        }
                    }).catch(error => {
                        console.log(error);
                        if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                            // this.$Message.error(this.$t('visitor_history.haveNoPrivilege'));
                            this.$Message({
                                message: this.$t('visitor_history.haveNoPrivilege'),
                                type: 'error'
                            });
                        }
                        return resolve(null);
                    });
                });
            },
            getVisitorServerIdListByVisitorIdO(data) {
                return new Promise((resolve, reject) => {
                    util.ajaxInternationalJson({
                        url: '/piwikRead/visitorHistory/getOldVisitorServerIdListByVisitorId',
                        method: 'get',
                        params: {
                            visitorId: data.visitorId,
                            orgId: String(this.enterpriseId)
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            return resolve(res.data.data);
                        } else {
                            this.$Message({
                                message: this.$t('visitor_history.haveNoPrivilege'),
                                type: 'error'
                            });
                            return resolve(null);
                        }
                    }).catch(error => {
                        console.log(error);
                        if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                            this.$Message({
                                message: this.$t('visitor_history.haveNoPrivilege'),
                                type: 'error'
                            });
                        }
                        return resolve(null);
                    });
                });
            },
            // 判断是否有权限查看详情页
            getVisitorHistoryDetailPrivilege(data, serverIdList) {
                return new Promise((resolve, reject) => {
                    util.ajaxJson({
                        url: 'crm/inquiry/getVisitorHistoryDetailPrivilege',
                        method: 'post',
                        data: {
                            visitorId: data.visitorId,
                            orgId: this.enterpriseId,
                            userId: Number(this.userId),
                            crmStatus: data.crmStatus.toString(),
                            serverIdList: serverIdList
                        }
                    }).then(res => {
                        if (res.data.code === '1' && res.data.data === true) {
                            return resolve(res.data.data);
                        } else {
                            // this.$Message.error(this.$t('visitor_history.haveNoPrivilege'));
                            this.$Message({
                                message: this.$t('visitor_history.haveNoPrivilege'),
                                type: 'error'
                            });
                            return resolve(null);
                        }
                    }).catch(error => {
                        console.log(error);
                        if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                            this.$Message({
                                message: this.$t('visitor_history.haveNoPrivilege'),
                                type: 'error'
                            });
                        }
                        resolve(null);
                    });
                });
            },


            // =============================================================== 筛选处理，p代表piwik，o代表询盘云
            /* 筛选字段处理（这两个方法冗余的很） */
            // 询盘云一律转为下划线格式
            handleSearchConO(str) {
                switch (str) {
                    case this.$t('visitor_history.visitor_id'):
                    case 'visitorId':
                        return 'visitor_id';

                    case this.$t('visitor_history.remark'):
                    case 'remark':
                        return 'remark';

                    case this.$t('visitor_history.visitor_type'):
                    case 'visitorType':
                        // case 'visitorTypeId':
                        return 'visitor_type';

                    case this.$t('visitor_history.visitor_name'):
                    case 'visitorName':
                        return 'visitor_name';
                    case this.$t('visitor_history.ip_location'):
                    case 'ipLocation':
                        return 'ip_location';

                    case this.$t('visitor_history.service_name'):
                    case 'receptionServer':
                        return 'reception_server';

                    case this.$t('visitor_history.visitor_chat_count'):
                    case 'visitorChatCount':
                        return 'visitor_chat_count';

                    case this.$t('visitor_history.service_chat_count'):
                    case 'serverChatCount':
                        return 'server_chat_count';

                    case this.$t('visitor_history.create_time'):
                    case 'createTime':
                        return 'create_time';

                    case this.$t('visitor_history.leave_time'):
                    case 'leaveTime':
                        return 'leave_time';

                    // case this.$t('visitor_history.recent_visit_source'):
                    // case 'recentVisitSource':
                    //     return 'recentVisitSource';

                    // case this.$t('visitor_history.recent_first_visit_address'):
                    // case 'recentFirstVisitorAddress':
                    //     return 'recentFirstVisitorAddress';

                    // case this.$t('visitor_history.first_visit_source'):
                    // case 'firstVisitSource':
                    //     return 'firstVisitSource';

                    // case this.$t('visitor_history.first_visitor_address'):
                    // case 'firstVisitorAddress':
                    //     return 'firstVisitorAddress';
                    case this.$t('visitor_history.source'):
                    case 'visitSource':
                        return 'visit_source';

                    case this.$t('visitor_history.first_visit_address'):
                    case 'firstVisitorAddress':
                        return 'first_visitor_address';

                    case this.$t('visitor_history.status'):
                    case 'crmStatus':
                        return 'crm_status';

                    case this.$t('visitor_history.traffic_source'):
                    case 'trafficSource':
                        return 'traffic_source';

                    case this.$t('visitor_history.visit_value'):
                    case 'visitValue':
                        return 'visit_value';

                    default:
                        return str;
                }
            },
            // piwik一律改成驼峰
            handleSearchConP(str) {
                switch (str) {
                    case this.$t('visitor_history.visitor_id'):
                    case 'visitorId':
                    case 'visitor_id':
                        return 'visitorId';

                    case this.$t('visitor_history.remark'):
                    case 'remark':
                        return 'remark';

                    case this.$t('visitor_history.visitor_type'):
                    case 'visitorType':
                    case 'visitor_type':
                        return 'visitorType';

                    case 'visitorTypeId':
                    case 'visitor_type_id':
                        return 'visitorTypeId';

                    case this.$t('visitor_history.visitor_name'):
                    case 'visitorName':
                    case 'visitor_name':
                        return 'visitorName';

                    case this.$t('visitor_history.ip_location'):
                    case 'ipLocation':
                    case 'ip_location':
                        return 'ipLocation';

                    case this.$t('visitor_history.service_name'):
                    case 'receptionServer':
                    case 'reception_server':
                        return 'receptionServer';

                    case this.$t('visitor_history.visitor_chat_count'):
                    case 'visitorChatCount':
                    case 'visitor_chat_count':
                        return 'visitorChatCount';

                    case this.$t('visitor_history.service_chat_count'):
                    case 'serverChatCount':
                    case 'server_chat_count':
                        return 'serverChatCount';

                    case this.$t('visitor_history.create_time'):
                    case 'createTime':
                    case 'create_time':
                        return 'createTime';

                    case this.$t('visitor_history.leave_time'):
                    case 'leaveTime':
                    case 'leave_time':
                        return 'leaveTime';

                    // case this.$t('visitor_history.recent_visit_source'):
                    // case 'recentVisitSource':
                    // case 'recent_visit_source':
                    //     return 'recentVisitSource';

                    // case this.$t('visitor_history.recent_first_visit_address'):
                    // case 'recentFirstVisitorAddress':
                    // case 'recent_First_visitor_address':
                    //     return 'recentFirstVisitorAddress';

                    // case this.$t('visitor_history.first_visit_source'):
                    // case 'firstVisitSource':
                    // case 'first_visit_source':
                    //     return 'firstVisitSource';

                    // case this.$t('visitor_history.first_visitor_address'):
                    // case 'firstVisitorAddress':
                    // case 'first_visitor_address':
                    //     return 'firstVisitorAddress';
                    case this.$t('visitor_history.source'):
                    case 'visitSource':
                    case 'visit_source':
                        return 'visitSource';

                    case this.$t('visitor_history.first_visit_address'):
                    case 'firstVisitorAddress':
                    case 'first_visitor_address':
                        return 'firstVisitorAddress';

                    case this.$t('visitor_history.status'):
                    case 'crmStatus':
                    case 'crm_status':
                        return 'crmStatus';

                    case this.$t('visitor_history.traffic_source'):
                    case 'trafficSource':
                    case 'traffic_source':
                        return 'trafficSource';

                    case this.$t('visitor_history.visit_value'):
                    case 'visitValue':
                    case 'visit_value':
                        return 'visitValue';

                    default:
                        return str;
                }
            },

            /* 表头筛选 */
            // 处理表头筛选条件
            handleTableFilterO(filterKey, colIndex) {
                const temp = this.config_tableFilter[filterKey];
                if (temp) {
                    const keyS = this.handleSearchConO(filterKey);
                    const sqlDel = this.handleSearchConP(filterKey);
                    /* 处理筛选 */
                    let tableSearchItem = {};
                    let name = '';
                    if (temp.query.length) { // 检索 (除visitorType)
                        switch (temp.filterType) {
                            // else if (filterKey === 'recentVisitSource' || filterKey === 'recentFirstVisitorAddress' || filterKey === 'firstVisitSource' || filterKey === 'firstVisitorAddress') {
                            //     name = filterKey;
                            // }
                            case 'string':
                                if (filterKey === 'visitorId' || filterKey === 'visitSource' || filterKey === 'firstVisitorAddress') {
                                    name = `a.${keyS}`;
                                } else {
                                    name = keyS;
                                }
                                tableSearchItem = {
                                    name: name,
                                    operate: 'like',
                                    type: '1',
                                    value: temp.query
                                };
                                break;
                            // 时间类型
                            case 'date':
                                tableSearchItem = {
                                    name: keyS,
                                    type: '3',
                                    startDate: `${this.$options.filters.timeFormat(new Date(temp.query[0]).getTime())} 00:00:00`,
                                    endDate: `${this.$options.filters.timeFormat(new Date(temp.query[1]).getTime())} 00:00:00`
                                };
                                break;
                            case 'trafficSource':
                            case 'select':
                                if (temp.query.length > 1) {
                                    const valueArr = temp.query.map(item => {
                                        return item.value;
                                    });
                                    const str = `${valueArr.join(',')}`;
                                    tableSearchItem = {
                                        name: keyS,
                                        operate: 'in',
                                        type: '1',
                                        value: str
                                    };
                                    // tableSearchItem = temp.query.map(item => {
                                    //     return {
                                    //         name: keyS,
                                    //         operate: '=',
                                    //         type: '1',
                                    //         value: item.value
                                    //     }
                                    // })
                                } else if (temp.query.length === 1) {
                                    tableSearchItem = {
                                        name: keyS,
                                        operate: '=',
                                        type: '1',
                                        value: temp.query[0].value
                                    };
                                }
                                break;
                        }

                        // 数字类型的
                        if (filterKey === 'visitorChatCount' || filterKey === 'serverChatCount' || filterKey === 'visitValue') {
                            tableSearchItem = {
                                name: keyS,
                                operate: '=',
                                type: '2',
                                value: temp.query
                            };
                        }
                        this.allColumns = this.allColumns.map((item, index) => {
                            if (colIndex != undefined) {
                                if (index === colIndex) {
                                    item.filtering = true;
                                }
                            } else {
                                if (item.key === filterKey) {
                                    item.filtering = true;
                                }
                            }
                            return item;
                        });
                    } else { // visitorType检索 和 升降序
                        if (filterKey === 'visitorType') {
                            tableSearchItem = {
                                name: keyS,
                                operate: '=',
                                type: '1',
                                value: this.config_tableFilter.visitorTypeId.query[0].value
                            };
                            const queryTemp = this.config_tableFilter.visitorTypeId.query;
                            if (queryTemp.length > 1) {
                                const valueArr = queryTemp.map(item => {
                                    return item.value;
                                });
                                const str = `${valueArr.join(',')}`;
                                tableSearchItem = {
                                    name: keyS,
                                    operate: 'in',
                                    type: '1',
                                    value: str
                                };
                            } else if (temp.query.length === 1) {
                                tableSearchItem = {
                                    name: keyS,
                                    operate: '=',
                                    type: '1',
                                    value: temp.query[0].value
                                };
                            }
                        }

                        this.allColumns = this.allColumns.map((item, index) => {
                            if (colIndex != undefined) {
                                if (index === colIndex) {
                                    item.filtering = false;
                                }
                            } else {
                                if (item.key === filterKey) {
                                    item.filtering = false;
                                }
                            }
                            return item;
                        });
                    // this.$delete(this.tableSearch, con);
                    }
                    const tableSearch = this.tableSearch;
                    if (tableSearch.length > 0) {
                        const index = tableSearch.findIndex(item => {
                            if (item.name) {
                                if (item.name.startsWith('a.')) {
                                    return item.name.slice(2) === keyS;
                                }
                                return item.name === keyS;
                            }
                        });
                        if (index != -1) {
                            tableSearch.splice(index, 1, tableSearchItem);
                        } else {
                            if (tableSearchItem instanceof Array) {
                                tableSearchItem = tableSearchItem.filter(item => {
                                    return JSON.stringify(item) != '{}';
                                });
                                tableSearch.push(...tableSearchItem);
                            } else {
                                if (JSON.stringify(tableSearchItem) != '{}') {
                                    tableSearch.push(tableSearchItem);
                                }
                            }
                        }
                        this.tableSearch = tableSearch;
                    } else {
                        if (tableSearchItem instanceof Array) {
                            tableSearch.push(...tableSearchItem);
                        } else {
                            if (JSON.stringify(tableSearchItem) != '{}') {
                                tableSearch.push(tableSearchItem);
                            }
                        }
                        this.tableSearch = tableSearch;
                    }
                    /* 刷新列表 */
                    this.currentPage = 1;
                // this.mergeQueryListP()
                }
            },
            handleTableFilterP(filterKey, colIndex) {
                const temp = this.config_tableFilter[filterKey];
                if (temp) {
                    /* 处理筛选 */
                    // 判断是否有值, 调整 sqlList
                    const con = this.handleSearchConP(filterKey);
                    const del = this.handleSearchConO(filterKey);
                    const start = {};
                    const end = {};
                    if (temp.query.length) {
                        const result = {};
                        switch (temp.filterType) {
                            case 'string':
                                if (filterKey === 'visitorChatCount' || filterKey === 'serverChatCount' || filterKey === 'visitValue') {
                                    this.$set(this.sqlList_tableFilter, con, {
                                        $eq: temp.query
                                    });
                                } else {
                                    this.$set(this.sqlList_tableFilter, con, {
                                        $regex: temp.query
                                    });
                                }
                                break;
                            case 'trafficSource':
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
                                start[con] = {};
                                start[con].$gte = `${this.$options.filters.timeFormat(new Date(temp.query[0]).getTime())} 00:00:00`;
                                result.$and.push(start);
                                end[con] = {};
                                end[con].$lte = `${this.$options.filters.timeFormat(new Date(temp.query[1]).getTime())} 23:59:59`;
                                result.$and.push(end);
                                this.$set(this.sqlList_tableFilter, con, result);
                                break;
                        }
                        this.allColumns = this.allColumns.map((item, index) => {
                            if (colIndex != undefined) {
                                if (index === colIndex) {
                                    item.filtering = true;
                                }
                            } else {
                                if (item.key === filterKey) {
                                    item.filtering = true;
                                }
                            }
                            return item;
                        });
                    } else {
                        if (con === 'visitorType') {
                            // 处理访客来源类别的筛选，需要用visitorTypeId字段和值去筛选，所以要做额外的处理
                            if (this.config_tableFilter.visitorTypeId.query.length > 0) {
                                const result = {};
                                result.$or = this.config_tableFilter.visitorTypeId.query.map(item => {
                                    const temp = {};
                                    temp.visitorTypeId = {};
                                    temp.visitorTypeId.$eq = item.value;
                                    this.$set(this.sqlList_tableFilter, 'visitorTypeId', result);
                                    this.allColumns = this.allColumns.map((item, index) => {
                                        if (colIndex != undefined) {
                                            if (index === colIndex) {
                                                item.filtering = true;
                                            }
                                        } else {
                                            if (item.key === filterKey) {
                                                item.filtering = true;
                                            }
                                        }
                                        return item;
                                    });
                                    return temp;
                                });
                            } else {
                                this.$delete(this.sqlList_tableFilter, 'visitorTypeId');
                                this.allColumns = this.allColumns.map((item, index) => {
                                    if (colIndex != undefined) {
                                        if (index === colIndex) {
                                            item.filtering = false;
                                        }
                                    } else {
                                        if (item.key === filterKey) {
                                            item.filtering = false;
                                        }
                                    }
                                    return item;
                                });
                            }
                        } else {
                            // 非筛选
                            this.$delete(this.sqlList_tableFilter, con);
                            this.allColumns = this.allColumns.map((item, index) => {
                                if (colIndex != undefined) {
                                    if (index === colIndex) {
                                        item.filtering = false;
                                    }
                                } else {
                                    if (item.key === filterKey) {
                                        item.filtering = false;
                                    }
                                }
                                return item;
                            });
                        }
                    }
                    // 如果有客服筛选的话，删去sqlList_tableFilter中receptionServer的值，直接使用serverAccid字段去筛选
                    if (filterKey === 'receptionServer') {
                        this.$delete(this.sqlList_tableFilter, 'receptionServer');
                    }
                    this.currentPage = 1;
                }
            },

            /* 右上角检索条件处理 */
            // 条件对比 -- 询盘云
            strSearch(key, con2, con3) {
                if (con3.trim() != '') {
                    switch (con2) {
                        case this.$t('filter_box.contain'):
                            return {
                                name: key,
                                operate: 'like',
                                type: '1',
                                value: con3
                            };
                            break;
                        case this.$t('filter_box.not_contain'):
                            return {
                                name: key,
                                operate: 'not like',
                                type: '1',
                                value: con3
                            };
                            break;
                        case this.$t('filter_box.equal'):
                            return {
                                name: key,
                                operate: '=',
                                type: '1',
                                value: con3
                            };
                            break;
                        default:
                            break;
                    }
                } else {
                    // this.$Message.warning(this.$t('filter_box.con_empty'));
                    this.$Message({
                        message: this.$t('filter_box.con_empty'),
                        type: 'warning'
                    });
                    return false;
                }
            },
            timeSearch(key, con2, con3) {
                if (con3[0] != '') {
                    return {
                        name: key,
                        type: '3',
                        startDate: con3[0],
                        endDate: con3[1]
                    //   startDate: this.$options.filters.timeFormat(con3[0].getTime()) + ' 00:00:00',
                    //   endDate: this.$options.filters.timeFormat(con3[1].getTime()) + ' 23:59:59'

                    };
                } else {
                    // this.$Message.warning(this.$t('filter_box.select_time'));
                    this.$Message({
                        message: this.$t('filter_box.select_time'),
                        type: 'warning'
                    });
                    return false;
                }
            },
            numSearch(key, con2, con3) {
                if (isNaN(con3) == false) {
                    switch (con2) {
                        case this.$t('filter_box.lt'):
                            return {
                                name: key,
                                operate: '<',
                                type: '2',
                                value: con3
                            };
                            break;
                        case this.$t('filter_box.lte'):
                            return {
                                name: key,
                                operate: '<=',
                                type: '2',
                                value: con3
                            };
                            break;
                        case this.$t('filter_box.equal'):
                            return {
                                name: key,
                                operate: '=',
                                type: '2',
                                value: con3
                            };
                            break;
                        case this.$t('filter_box.gte'):
                            return {
                                name: key,
                                operate: '>=',
                                type: '2',
                                value: con3
                            };
                            break;
                        case this.$t('filter_box.gt'):
                            return {
                                name: key,
                                operate: '>',
                                type: '2',
                                value: con3
                            };
                            break;
                        default:
                            break;
                    }
                } else {
                    // alert('请输入合法的数值');
                    // this.$Message.warning(this.$t('filter_box.enter_number'));
                    this.$Message({
                        message: this.$t('filter_box.enter_number'),
                        type: 'warning'
                    });
                    return false;
                }
            },
            // 字段条件组合 -- 询盘云
            handleConditionGroup(con1, con2, con3) {
                // this.reportdata1=[];
                if (con1) {
                    switch (con1) {
                        case this.$t('visitor_history.visitor_id'):
                            return this.strSearch('a.visitor_id', con2, con3.trim());
                            break;
                        case this.$t('visitor_history.visitor_name'):
                            return this.strSearch('visitor_name', con2, con3.trim());
                            break;
                        case this.$t('visitor_history.ip_location'):
                            return this.strSearch('ip_location', con2, con3.trim());
                            break;
                        case this.$t('visitor_history.service_name'):
                            return this.strSearch('reception_server', con2, con3);
                            break;
                        case this.$t('visitor_history.visitor_type'):
                            return this.strSearch('visitor_type', con2, con3);
                            break;
                        case this.$t('visitor_history.visitor_chat_count'):
                            return this.numSearch('visitor_chat_count', con2, con3.toString().trim());
                            break;
                        case this.$t('visitor_history.service_chat_count'):
                            return this.numSearch('server_chat_count', con2, con3.toString().trim());
                            break;
                        case this.$t('visitor_history.create_time'):
                            return this.timeSearch('create_time', con2, con3);
                            break;
                        case this.$t('visitor_history.leave_time'):
                            return this.timeSearch('leave_time', con2, con3);
                            break;
                        // case this.$t('visitor_history.recent_visit_source'):
                        //     return this.strSearch('recentVisitSource', con2, con3.trim());
                        //     break;
                        // case this.$t('visitor_history.recent_first_visit_address'):
                        //     return this.strSearch('recentFirstVisitorAddress', con2, con3.trim());
                        //     break;
                        // case this.$t('visitor_history.first_visit_source'):
                        //     return this.strSearch('firstVisitSource', con2, con3.trim());
                        //     break;
                        // case this.$t('visitor_history.first_visitor_address'):
                        //     return this.strSearch('firstVisitorAddress', con2, con3.trim());
                        //     break;
                        case this.$t('visitor_history.source'):
                            return this.strSearch('a.visit_source', con2, con3.trim());
                            break;
                        case this.$t('visitor_history.first_visit_address'):
                            return this.strSearch('a.first_visitor_address', con2, con3.trim());
                            break;
                        case this.$t('visitor_history.remark'):
                            return this.strSearch('remark', con2, con3.trim());
                            break;
                        case this.$t('visitor_history.status'):
                            return this.strSearch('crm_status', con2, con3.toString());
                            break;
                        case this.$t('visitor_history.traffic_source'):
                            return this.strSearch('traffic_source', con2, con3.toString());
                            break;
                        case this.$t('visitor_history.visit_value'):
                            return this.numSearch('visit_value', con2, con3.toString().trim());
                            break;
                        default:
                            break;
                    }
                } else {
                    // this.$Message.warning(this.$t('filter_box.con_empty'));
                    this.$Message({
                        message: this.$t('filter_box.con_empty'),
                        type: 'warning'
                    });
                    return false;
                }
            },
            // 添加所有的检索条件 -- 询盘云
            addSearchItems() {
                this.searchItem = [];
                // 遍历addCondition
                for (let i = 0; i < this.addCondition.length; i++) {
                    const { condition1, condition2, condition3 } = this.addCondition[i];
                    if (this.handleConditionGroup(condition1, condition2, condition3) === false) {
                        return false;
                    } else {
                        this.searchItem.push(this.handleConditionGroup(condition1, condition2, condition3));
                    }
                }
            },
            // 获取检索条件对应的 sql 条件 -- piwik
            getSearchType(str) {
                switch (str) {
                    case this.$t('filter_box.contain'):
                        return '$regex';
                    case this.$t('filter_box.not_contain'):
                        return '$nregex';
                    case this.$t('filter_box.equal'):
                        return '$eq';
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

            /* 右上角检索 */
            async searchDataO() {
                const result = this.addSearchItems();// 整合所有的检索条件
                if (result === false) {
                    return;
                }
                this.filtercolshow = false;
                this.filtering = 'search';
                this.SearchLoading = true;
                this.currentPage = 1;
                this.mergeQueryListO();
                // 更新数据
                this.refreshDataO();
            },
            async searchDataP() {
                this.addCondition.forEach(item => {
                    const con = this.handleSearchConP(item.condition1);
                    if (con === 'receptionServer') {
                        this.serverAccId = [];
                        this.serverAccId.push(item.condition3);
                    }
                });
                this.filtering = 'search';
                this.mergeQueryListP();
                this.refreshDataP();
            },

            /* 合并表头筛选和右上角筛选 */
            mergeQueryListO(index) {
                // 右上角筛选框优先级更高, a 为检索/常用检索条件, b 为表头检索条件
                const b = this.tableSearch;
                let a = [];
                switch (this.filtering) {
                    case 'search':
                        a = this.searchItem;
                        break;
                    case 'searchCommon':
                        a = this.common_conditions;
                        break;
                }
                // 处理负责人筛选, 优先使用右上角检索条件
                const temp = a.concat(b);
                this.searchItem = temp;
            },
            mergeQueryListP(index) {
                const receptionSearchFlag = this.addCondition.find(item => {
                    return item.condition1 === this.$t('visitor_history.service_name');
                });
                // 右上角筛选框优先级更高, a 为检索/常用检索条件, b 为表头检索条件
                const b = this.computed_sqlList_tableFilter;
                let a = [];
                // let searchContent = [];
                let receptionCommonFlag;
                switch (this.filtering) {
                    case 'search':
                        let computed_addCondition = this.$deepClone(this.computed_addCondition)
                        computed_addCondition.forEach((item, index) => {
                            if (item.serverAccId && item.serverAccId.length) {
                                computed_addCondition.splice(index, 1);
                            }
                        });
                        a = computed_addCondition;
                        break;
                    case 'searchCommon':
                        // searchContent = this.$options.filters.parseArray(this.list_commonSearch[index].searchContent);
                        a = this.common_conditions;
                        break;
                }
                // 判断有没有receptionServer相关检索条件
                if (this.common_searchContent.length) {
                    receptionCommonFlag = this.common_searchContent[1].find(item => {
                        return item.name === 'reception_server';
                    });
                }
                if (this.config_tableFilter.receptionServer.serverAccId.length || receptionSearchFlag || (this.common_searchContent.length && receptionCommonFlag)) {
                    console.log('有客服检索');
                } else {
                    // 没有客服检索
                    this.serverAccId = [];
                }
                // 处理负责人筛选, 优先使用右上角检索条件 -- 访客历史没有负责人这个筛选
                const temp = a.filter(item => !item.hasOwnProperty('companyManagers')).concat(b.filter(item => !item.hasOwnProperty('companyManagers')));
                const subUserIds_a = a.filter(item => item.hasOwnProperty('companyManagers'));
                const subUserIds_b = b.filter(item => item.hasOwnProperty('companyManagers'));
                // 如果都有"负责人"筛选, 只取前者第一项, 否则取后者第一项或空数组
                const con_subUserIds = subUserIds_a[0] || subUserIds_b[0];
                if (con_subUserIds) {
                    this.subUserIds = con_subUserIds.companyManagers.$eq.join(',');
                } else {
                    this.subUserIds = '';
                }
                this.$set(this.queryData, '$and', temp);
            },

            // =============================================================== 方法集成
            /* 初始化数据 */
            async initTable() {
                this.$set(this.config_tableFilter.crmStatus, 'allList', this.crmStatusList);
                this.$set(this.config_tableFilter.trafficSource, 'allList', this.trafficSourceList.map((trafficSource, trafficIndex) => {
                    return {
                        value: trafficSource.value,
                        label: trafficSource.label
                    };
                }));
                // 获取客服列表和访客类型列表
                this.handleGetServerList();
                this.getVisitorTypeList();
                // 表头数据处理
                this.handleTableHead();
                // 初始筛选条件处理
                if (this.dashBoardFilterCon) {
                    // 有传入仪表盘筛选条件, 使用重置后的最大的 piwik 时间筛选条件
                    this.handleResetTime('createTime');
                } else {
                    // 否则, 走默认的"初始化筛选条件"
                    this.init_filter_table();
                }
                // 页面初始化，默认获取piwik数据，用今天的时间去检索，只调piwik接口
                this.currentPage = 1;
                this.mergeQueryListP();
                this.refreshDataP();
            },
            // 初始化筛选条件 --以createtime 来筛选，从今天凌晨00:00:00 到今天晚上23:59:59
            init_filter_table() {
                // 处理从仪表盘跳转过来的 Google 营销 md5 筛选条件
                // 访客数
                let visitorsMd5Data = localStorage.getItem('dashboard_visitor_filter_googleMarketing');
                localStorage.removeItem('dashboard_visitor_filter_googleMarketing');
                if (visitorsMd5Data) {
                    try {
                        // JSON 格式化
                        visitorsMd5Data = JSON.parse(visitorsMd5Data);

                        // 设置筛选标签多语言
                        if (Array.isArray(visitorsMd5Data.dateRange)) {
                            this.lang_visitor_history.visitorsMd5 = this.$t('visitor_history.googleAdsRelatedVisitorsWithDate').replace('$startDate', this.$options.filters.timeFormat(visitorsMd5Data.dateRange[0])).replace('$endDate', this.$options.filters.timeFormat(visitorsMd5Data.dateRange[1]));
                        } else {
                            this.lang_visitor_history.visitorsMd5 = this.$t('visitor_history.googleAdsRelatedVisitors');
                        }

                        // 数据复制
                        this.visitorsMd5 = visitorsMd5Data.md5;
                        this.init_filter('visitorsMd5', '', this.visitorsMd5);
                        this.currentPage = 1;

                        // 退出流程
                        return;
                    } catch (e) {
                        console.error(e);
                    }
                }
                // 互动数
                const interactionVisitorsMd5 = localStorage.getItem('dashboard_interaction_visitor_filter_googleMarketing');
                localStorage.removeItem('dashboard_visitor_filter_googleMarketing');
                if (interactionVisitorsMd5) {
                    // 数据复制
                    this.interactionVisitorsMd5 = interactionVisitorsMd5;
                    this.init_filter('interactionVisitorsMd5', '', this.interactionVisitorsMd5);
                    this.currentPage = 1;

                    // 退出流程
                    return;
                }

                const timeRange = [Date.now(), Date.now()].map(item => {
                    return this.$options.filters.timeFormat(item);
                });
                const initial_filter_cons = new Map([
                    ['createTime', [(`${timeRange[0]} 00:00:00`), (`${timeRange[1]} 23:59:59`)]]
                ]);
                this.allColumns = this.allColumns.map(col => {
                    if (this.config_tableFilter.hasOwnProperty(col.key)) {
                        col.filtering = initial_filter_cons.get(col.key) ? this.init_filter(col.key, col.title, initial_filter_cons.get(col.key)) : false;
                    }
                    return col;
                });
                // this.merge_query_list()
            },
            // 设定初始筛选条件
            init_filter(key, title, val) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    this.$set(this.config_tableFilter[key], 'query', val);
                    const con = this.handleSearchConP(title);
                    if (!con) {
                        return false;
                    }

                    if (val.length) {
                        const result = {};
                        // 根据不同的类型处理查询sqlList_tableFilter
                        switch (temp.filterType) {
                            case 'string':
                                if (key === 'visitorChatCount' || key === 'serverChatCount' || key === 'visitValue') {
                                    this.$set(this.sqlList_tableFilter, con, {
                                        $eq: val
                                    });
                                } else {
                                    this.$set(this.sqlList_tableFilter, con, {
                                        $regex: val
                                    });
                                }
                                break;
                            case 'trafficSource':
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

            // -------------------------------------------------------------------复杂逻辑处理，这块需要重新看一看
            /* 以下为：如果筛选时间的话，选择范围的一些处理 */
            // 右上角时间筛选范围选择
            changeDateR(index) {
                const flag1 = this.addCondition.findIndex(item => {
                    const con = this.handleSearchConP(item.condition1);
                    return item.condition2 === '时间段' && con === 'leaveTime';
                });
                const flag2 = this.addCondition.findIndex(item => {
                    const con = this.handleSearchConP(item.condition1);
                    return item.condition2 === '时间段' && con === 'createTime';
                });
                const con = this.handleSearchConP(this.addCondition[index].condition1);
                if (this.isNewCompany) {
                    this.dateOptionR = {
                        disabledDate: (date) => {
                            return date && date.valueOf() < this.companyOpenTime || date.valueOf() >= Date.now();
                        }
                    };
                } else {
                    // 点击的是首次访问时间
                    if (con === 'createTime') {
                        if (this.config_tableFilter.leaveTime.query.length > 0) { // 先判断表头有无离开时间
                            const startTime = new Date(this.config_tableFilter.leaveTime.query[0]).getTime();
                            const endTime = new Date(this.config_tableFilter.leaveTime.query[1]).getTime();
                            this.handleRightTimeChoose(startTime, endTime);
                        } else if (flag1 != -1 && index !== flag1) {
                            const startTime = new Date(this.addCondition[flag1].condition3[0]).getTime();
                            const endTime = new Date(this.addCondition[flag1].condition3[1]).getTime();
                            this.handleRightTimeChoose(startTime, endTime);
                        } else {
                            this.dateOptionR = {
                                disabledDate(date) {
                                    return date && date.valueOf() >= Date.now();
                                }
                            };
                        }
                    } else if (con === 'leaveTime') {
                        // 点击的是离开时间
                        if (this.config_tableFilter.createTime.query.length > 0) { // 先判断表头有无离开时间
                            const startTime = new Date(this.config_tableFilter.createTime.query[0]).getTime();
                            const endTime = new Date(this.config_tableFilter.createTime.query[1]).getTime();
                            this.handleRightTimeChoose(startTime, endTime);
                        } else if (flag2 != -1 && index !== flag2) {
                            const startTime = new Date(this.addCondition[flag2].condition3[0]).getTime();
                            const endTime = new Date(this.addCondition[flag2].condition3[1]).getTime();
                            this.handleRightTimeChoose(startTime, endTime);
                        } else {
                            this.dateOptionR = {
                                disabledDate(date) {
                                    return date && date.valueOf() >= Date.now();
                                }
                            };
                        }
                    }
                }
            },
            handleRightTimeChoose(startTime, endTime) {
                // 如果公司建立时间大于6月1号
                if (this.isNewCompany) {
                    this.dateOptionR = {
                        disabledDate: (date) => {
                            return date && date.valueOf() < this.companyOpenTime || date.valueOf() >= Date.now();
                        // return date && Date.now() - 86400000 < date.valueOf() < this.timeLine;
                        }
                    };
                } else {
                    if (startTime >= this.timeLine) {
                        this.dateOptionR = {
                            disabledDate: (date) => {
                                return date && date.valueOf() < this.timeLine || date.valueOf() > Date.now();
                            }
                        };
                    } else if (endTime < this.timeLine) {
                        this.dateOptionR = {
                            disabledDate: (date) => {
                                return date && date.valueOf() > this.timeLine;
                            }
                        };
                    }
                }
            },

            // 表头时间筛选范围问题
            changeDateTable(column) {
                // 如果公司创建时间大于6月1号，就直接限制它能够筛选从公司创建时间到今天的数据
                if (this.isNewCompany) {
                    this.dateOptions = {
                        disabledDate: (date) => {
                            return date && date.valueOf() < this.companyOpenTime || date.valueOf() >= Date.now();
                        }
                    };
                } else {
                    let startTime = '';
                    let endTime = '';
                    if (column.key === 'createTime') { // 选的是首次访问时间
                        const flag = this.addCondition.find(item => {
                            const temp = this.handleSearchConP(item.condition1);
                            return temp === 'leaveTime';
                        });
                        if (flag) { // 右上角有时间检索条件
                            startTime = new Date(flag.condition3[0]).getTime();
                            endTime = new Date(flag.condition3[1]).getTime();
                        } else if (this.config_tableFilter.leaveTime.query.length > 0) { // 表头中有离开时间限制
                            startTime = new Date(this.config_tableFilter.leaveTime.query[0]).getTime();
                            endTime = new Date(this.config_tableFilter.leaveTime.query[1]).getTime();
                        } else {
                            this.dateOptions = {
                                disabledDate(date) {
                                    return date && date.valueOf() >= Date.now();
                                }
                            };
                        }
                    }
                    if (column.key === 'leaveTime') { // 选的是首次访问时间
                        const flag = this.addCondition.find(item => {
                            const temp = this.handleSearchConP(item.condition1);
                            return temp === 'createTime';
                        });
                        if (flag) { // 右上角有时间检索条件
                            startTime = new Date(flag.condition3[0]).getTime();
                            endTime = new Date(flag.condition3[1]).getTime();
                        } else if (this.config_tableFilter.createTime.query.length > 0) { // 表头中有开始时间的限制
                            startTime = new Date(this.config_tableFilter.createTime.query[0]).getTime();
                            endTime = new Date(this.config_tableFilter.createTime.query[1]).getTime();
                        } else {
                            this.dateOptions = {
                                disabledDate(date) {
                                    return date && date.valueOf() >= Date.now();
                                }
                            };
                        }
                    }
                    if (startTime && endTime) {
                        this.handleTimeChoose(startTime, endTime);
                    }
                }
            },
            handleTimeChoose(startTime, endTime) {
                if (startTime >= this.timeLine) {
                    this.dateOptions = {
                        disabledDate: (date) => {
                            return date && date.valueOf() < this.timeLine || date.valueOf() >= Date.now();
                        // return date && Date.now() - 86400000 < date.valueOf() < this.timeLine;
                        }
                    };
                } else if (endTime < this.timeLine) {
                    this.dateOptions = {
                        disabledDate: (date) => {
                            return date && date.valueOf() > this.timeLine;
                        }
                    };
                }
            },

            // 筛选标签的时间选择
            onChangeTime() {
                if (this.isNewCompany) {
                    this.filterDateOptions = {
                        disabledDate: (date) => {
                            return date && date.valueOf() < this.companyOpenTime || date.valueOf() >= Date.now();
                        // return date && Date.now() - 86400000 < date.valueOf() < this.timeLine;
                        }
                    };
                } else {
                    this.filterDateOptions = {
                        disabledDate(date) {
                            // return date && date.valueOf() > Date.now() - 86400000;
                            return date.valueOf() >= Date.now();
                        }
                    };
                }
            },

            // 重置筛选时间 --
            handleResetTime(key, timeVal) {
                if (!timeVal) {
                    timeVal = [new Date(this.onLineTime), new Date()];
                    timeVal = timeVal.map(item => {
                        return this.$options.filters.timeFormat(item.getTime());
                    });
                    timeVal[0] = `${timeVal[0]} 00:00:00`;
                    timeVal[1] = `${timeVal[1]} 23:59:59`;
                }
                this.datevalue = timeVal;
                this.$set(this.config_tableFilter[key], 'query', timeVal);
                const con = this.handleSearchConP(key);
                const result = {};
                const start = {};
                const end = {};
                result.$and = [];
                start[con] = {};
                start[con].$gte = timeVal[0];
                result.$and.push(start);
                end[con] = {};
                end[con].$lte = timeVal[1];
                result.$and.push(end);
                this.$set(this.sqlList_tableFilter, con, result);
            },

            /* 右上角检索 */
            // 清空检索条件栏
            empty() {
                // 右上角筛选重置为空
                this.addCondition.forEach((item) => {
                    item.condition1 = '';
                    item.condition2 = '';
                    item.condition3 = '';
                    item.conditionList1 = this.$deepClone(this.conditionList1);
                    item.conditionList2 = this.$deepClone(this.conditionList1);
                    item.inputType = 'string';
                });
                this.custom_search_name = '';
                this.filtering = false;
                this.id_selected_commonSearch = -1;
                this.searchItem = [];
                this.isSearching = -1;
                // 右侧检索不清空表头的客服人员筛选条
                this.serverAccId = [];
                const that = this;
                // 清空的话右上角是没有筛选的，需要判断表头有没有筛选
                this.handleTimeJudgementAll('', function() {
                    that.mergeQueryListP();
                    that.refreshDataP();
                }, function() {
                    that.mergeQueryListO();
                    that.refreshDataO();
                }, function() {
                });
            },
            // 右上角不可选重复筛选--只对访客历史来说
            handleRepeat(flag) {
                const con1 = this.addCondition.map((item, index) => {
                    return this.handleSearchConP(item.condition1);
                });
                if (con1.length > 0) {
                    this.conditionList1.forEach((item, index2) => {
                        item.disabledR = false;
                        const con2 = this.handleSearchConP(item.value);
                        con1.forEach(item1 => {
                            if (item1 != '') {
                                if (con2 === item1) {
                                    item.disabledR = true;
                                }
                            }
                        });
                    });
                }
            },
            // 右上角筛选时间格式化处理
            handleFormatDate() {
                this.addCondition.forEach((item, index) => {
                    if (item.condition2 === '时间段') {
                        if (item.condition3[0] instanceof Date || item.condition3[1] instanceof Date) {
                            item.condition3[0] = `${this.$options.filters.timeFormat(item.condition3[0].getTime())} 00:00:00`;
                            item.condition3[1] = `${this.$options.filters.timeFormat(item.condition3[1].getTime())} 23:59:59`;
                            this.datevalue = item.condition3;
                        }
                    }
                });
            },
            // 搜索
            searchData() {
                // 进行正常检索之前先去掉 md5 值检索
                this.removeMd5Filter();

                // 非空判断
                this.isSearching = -1;
                const flag = this.addCondition.every(item => item.condition1 && item.condition2 && ((item.condition3 && item.condition3.length) || item.condition3 instanceof Date || (typeof item.condition3 === 'number' && !isNaN(item.condition3))));
                if (!flag) {
                    // this.$Message.warning(this.$t('filter_box.con_empty'));
                    this.$Message({
                        message: this.$t('filter_box.con_empty'),
                        type: 'warning'
                    });
                } else {
                    // 去除表头筛选重复部分
                    this.addCondition.forEach((item, index) => {
                        const temp = this.handleSearchConP(item.condition1);
                        const temp1 = this.handleSearchConO(item.condition1);
                        if (this.config_tableFilter[temp].query) {
                            switch (this.config_tableFilter[temp].filterType) {
                                case 'string':
                                    this.config_tableFilter[temp].query = '';
                                    break;
                                case 'trafficSource':
                                case 'select':
                                case 'countryArea':
                                case 'date':
                                    if (temp === 'receptionServer') {
                                        this.config_tableFilter[temp].serverAccId = [];
                                    }
                                    this.config_tableFilter[temp].query = [];
                                    break;
                            }
                            if (temp === 'visitorType' || temp === 'visitorTypeId') {
                                this.$set(this.config_tableFilter, 'visitorTypeId', this.config_tableFilter[temp]);
                                this.$set(this.config_tableFilter, 'visitorType', this.config_tableFilter[temp]);
                                this.$delete(this.sqlList_tableFilter, 'visitorTypeId');
                                this.tableSearch.forEach((item, index) => {
                                    if (item.name === 'visitor_type') {
                                        this.$delete(this.tableSearch, index);
                                    }
                                });
                            }
                            // if (temp === 'receptionServer') {
                            //     console.log('客服冲突')
                            //     this.config_tableFilter[temp]['serverAccId'] = []
                            //     this.$set(this.config_tableFilter, 'receptionServer', this.config_tableFilter[temp])
                            //     this.$delete(this.sqlList_tableFilter, 'receptionServer');
                            // }
                            this.$set(this.config_tableFilter, temp, this.config_tableFilter[temp]);
                            this.$delete(this.sqlList_tableFilter, temp);
                            this.tableSearch.forEach((item, index) => {
                                if (item.name == temp1) {
                                    // this.$delete(this.tableSearch, index);
                                }
                            });
                        }
                    });
                    const tempRightTimeFilterFlag = this.rightTimeFilterFlag;
                    const that = this;
                    this.handleTimeJudgementAll('', function() {
                        that.searchDataP();
                    }, function() {
                        that.searchDataO();
                    }, function() {
                        that.addCondition.forEach(item => {
                            const con = that.handleSearchConP(item.condition1);
                            if (con === 'receptionServer') {
                                that.serverAccId = [];
                                that.serverAccId.push(item.condition3);
                            }
                        });
                        that.filtering = 'search';
                    }, function() {
                        // 跨过时间 未做处理 -- 100000
                    });
                    this.currentPage = 1;
                    this.clearSelectedVisitors();
                    this.handleData(this.editIncellData);
                }
            },
            /* 常用检索 */
            delete_commonSearch(id, searchName) {
                this.deleteCommonSearchVisible = true;
                this.deleteCommonSearchId = id;
                this.deleteCommonSearchName = searchName;
            },
            cancelDel_commonSearch() {
                this.deleteCommonSearchVisible = false;
                this.deleteCommonSearchId = '';
                this.deleteCommonSearchName = '';
            },
            // 删除常用检索
            sureDel_commonSearch() {
                // 弹窗提醒
                util.ajaxJson({
                    url: '/crm/commonSearch/deleteCommonSearch',
                    method: 'get',
                    params: {
                        id: this.deleteCommonSearchId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.list_commonSearch = this.list_commonSearch.filter(item => item.id !== this.deleteCommonSearchId);
                        this.$Message.success(this.$t('crm.UniSet.success_delete'));
                        this.empty();
                    } else {
                        // this.$Message.error(this.$t('crm.UniSet.error_delete'));
                        this.$Message({
                            message: this.$t('crm.UniSet.error_delete'),
                            type: 'warning'
                        });
                    }
                    this.cancelDel_commonSearch();
                });
            },
            emptyCommonSearch() {
                this.list_commonSearch.forEach(item => {
                    this.delete_commonSearch(item.id);
                });
            },
            // 常用检索
            searchCommon(item, index) {
                // 进行正常检索之前先去掉 md5 值检索
                this.removeMd5Filter();

                if (item.searchContent) {
                    this.searchContent = this.$options.filters.parseArray(item.searchContent);
                    this.common_searchContent = this.searchContent
                    // 去除表头筛选重复部分
                    let searchContent = this.$options.filters.parseArray(item.searchContent);
                    const that = this;
                    // 检测常用检索中有没有包含时间条件
                    const timeFlag = searchContent[1].find(itemO => {
                        return itemO.name === 'create_time' || itemO.name === 'leave_time';
                    });
                    this.addCondition = [{
                        condition1: '',
                        condition2: '',
                        condition3: '',
                        conditionList1: this.$deepClone(this.conditionList1),
                        conditionList2: this.$deepClone(this.conditionList1),
                        inputType: 'string'
                    }];
                    if (timeFlag) {
                        // 常用检索中有时间
                        if (new Date(timeFlag.startDate).getTime() >= this.timeLine) {
                            // piwik
                            searchContent = searchContent[0];
                        } else if (new Date(timeFlag.endDate).getTime() < this.timeLine) {
                            // old
                            searchContent = searchContent[1];
                        }
                    } else {
                        // 常用检索中没有时间
                        this.handleTimeJudgementAll(searchContent, function() {
                            searchContent = searchContent[0];
                        }, function() {
                            searchContent = searchContent[1];
                        }, function() {
                            searchContent = searchContent[0];
                        });
                    }
                    searchContent.forEach((item1, index) => {
                        if (item1.serverAccId && item1.serverAccId.length > 0) {
                            this.config_tableFilter.receptionServer.serverAccId =[];
                            this.config_tableFilter.receptionServer.query = [];
                            this.serverAccId = item1.serverAccId;
                        } else if (item1.name) {
                            // 老接口
                            const temp = this.handleSearchConP(item1.name);
                            const temp1 = this.handleSearchConO(item1.name);
                            if (this.config_tableFilter[temp].query.length > 0) {
                                switch (this.config_tableFilter[temp].filterType) {
                                    case 'string':
                                        this.config_tableFilter[temp].query = '';
                                        break;
                                    case 'trafficSource':
                                    case 'select':
                                    case 'countryArea':
                                    case 'date':
                                        this.config_tableFilter[temp].query = [];
                                        break;
                                }
                                this.$set(this.config_tableFilter, temp, this.config_tableFilter[temp]);
                                this.$delete(this.sqlList_tableFilter, temp);
                                this.tableSearch.forEach((item, index) => {
                                    if (item.name = temp1) {
                                        this.$delete(this.tableSearch, index);
                                    }
                                });
                            }
                        } else {
                            // piwik接口
                            for (const key in item1) {
                                item1[key].forEach(item2 => {
                                    for (const key in item2) {
                                        if (this.config_tableFilter[key].query.length > 0) {
                                            switch (this.config_tableFilter[key].filterType) {
                                                case 'string':
                                                    this.config_tableFilter[key].query = '';
                                                    break;
                                                case 'trafficSource':
                                                case 'select':
                                                case 'countryArea':
                                                case 'date':
                                                    this.config_tableFilter[key].query = [];
                                                    break;
                                            }
                                            this.$set(this.config_tableFilter, key, this.config_tableFilter[key]);
                                            this.$delete(this.sqlList_tableFilter, key);
                                            this.tableSearch.forEach((item, index) => {
                                                const temp1 = this.handleSearchConO(key);
                                                if (item.name = temp1) {
                                                    this.$delete(this.tableSearch, index);
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                    console.log(this.config_tableFilter)
                    // 去掉重复筛选
                    const serverflag = searchContent.findIndex(item => {
                        return item.serverAccId && item.serverAccId.length > 0;
                    });

                    if (serverflag != -1) {
                        this.serverAccId = searchContent[serverflag].serverAccId;
                        searchContent.splice(serverflag, 1);
                    }

                    // 检索
                    this.filtering = 'searchCommon';
                    // this.filteringType = 'searchCommon'
                    this.id_selected_commonSearch = item.id;
                    this.filtercolshow = false;
                    this.isSearching = index;
                    this.currentPage = 1;
                    this.common_conditions = searchContent;

                    // 检测已切割过的常用检索是旧接口还是piwik接口
                    const FlagO = searchContent.find(itemO => {
                        return itemO.name;
                    });

                    if (timeFlag) { // 检索中有时间条件
                        console.log('自定义检索中包括时间1');
                        if (FlagO) {
                            console.log('old');
                            that.mergeQueryListO(index);
                            that.refreshDataO();
                        } else {
                            console.log(searchContent)
                            searchContent.forEach(item2 => {
                                console.log('piwik', item2);
                                if(item2.$and){
                                    item2.$and.forEach(time => {
                                        for (const key in time) {
                                            if (time[key].$gte) {
                                                this.datevalue[0] = time[key].$gte;
                                            } else if (time[key].$lte) {
                                                this.datevalue[1] = time[key].$lte;
                                            }
                                        }
                                    });
                                }

                            });
                            console.log('时间111', this.datevalue);
                            that.mergeQueryListP(index);
                            that.refreshDataP();
                        }
                    } else { // 检索中没有时间条件
                        this.handleTimeJudgementAll(searchContent, function(searchContent) {
                            that.mergeQueryListP(index);
                            that.refreshDataP();
                        }, function(searchContent) {
                            that.mergeQueryListO(index);
                            that.refreshDataO();
                        }, function() {
                            that.$Message({
                                message: that.$t('visitor_history.contain_time_message'),
                                duration: 5000,
                                showClose: true,
                                type: 'info'
                            });
                            that.handleResetTime('createTime');
                            that.mergeQueryListP(index);
                            that.refreshDataP();
                        });

                    // if(FlagO) {
                    //     console.log("old");
                    //     that.mergeQueryListO()
                    //     that.refreshDataO()
                    // } else {
                    //     console.log('-piwik')
                    //     that.mergeQueryListP()
                    //     that.refreshDataP()
                    // }
                    }
                } else {
                    // this.$Message.error(this.$t('crm.Table.error_getCommonSearchItem'));
                    this.$Message({
                        content: this.$t('crm.Table.error_getCommonSearchItem'),
                        type: 'error'
                    });
                }
            },
            // 保存为常用检索 -- 只保存右上角的筛选
            saveSearch() {
                // 检索名称不能为空
                if (!this.custom_search_name.length) {
                    // return this.$Message.info(this.$t('crm.Table.error_emptySearchName'));
                    return this.$Message({
                        message: this.$t('crm.Table.error_emptySearchName'),
                        type: 'warning'
                    });

                // 检测检索名称不能重复
                } else if (this.list_commonSearch.find(item => item.searchName === this.custom_search_name)) {
                    // return this.$Message.info(this.$t('crm.Table.error_sameCommonSearchName'));
                    return this.$Message({
                        message: this.$t('crm.Table.error_sameCommonSearchName'),
                        type: 'warning'
                    });
                }
                const flag = this.addCondition.every(item => item.condition1 && item.condition2 && ((item.condition3 && item.condition3.length) || item.condition3 instanceof Date || (typeof item.condition3 === 'number' && !isNaN(item.condition3))));
                console.log()
                // addCondition 有属性为空时
                if (!flag) {
                    // return this.$Message.warning(this.$t('filter_box.con_empty'));
                    return this.$Message({
                        message: this.$t('filter_box.con_empty'),
                        type: 'warning'
                    });
                } else {
                    let startTime = '';
                    let endTime = '';
                    if (this.rightTimeFilterFlag) {
                        startTime = new Date(this.rightTimeFilterFlag.condition3[0]).getTime();
                        endTime = new Date(this.rightTimeFilterFlag.condition3[1]).getTime();
                    }
                    // 筛选条件包含时间，并且筛选的时候跨过时间段，无法保存 -- 只能是6月1号之前有数据的公司
                    if (startTime && endTime && startTime < this.timeLine && endTime > this.timeLine) {
                        // return this.$Message.info({
                        //     content: this.$t('visitor_history.time_crossing_warning'),
                        //     duration: 5,
                        //     closable: true
                        // });
                        return this.$Message({
                            message: this.$t('visitor_history.time_crossing_warning'),
                            type: 'warning'
                        });
                    // 筛选条件不包括时间 or 包括时间但是没有跨过6月1号
                    } else {
                        this.handleFormatDate();
                        this.searchContent = [];
                        this.addSearchItems();
                        this.searchContent.push(this.computed_addCondition, this.searchItem);
                        this.saveSearchLoading = true;
                        // 保证右上角有筛选条件
                        if (this.computed_addCondition.length !== 0) {
                            this.saveCommonSearch();
                        } else {
                            this.saveSearchLoading = false;
                            // this.$Message.error(this.$t('crm.Table.error_save'));
                            this.$Message({
                                message: this.$t('crm.Table.error_save'),
                                type: 'error'
                            });
                        }
                    // // this.save_disabled = true
                    // if (this.computed_addCondition.length !== 0 || this.addCondition.find(item => item.condition1 === this.$t('visitor_history.service_name'))) {
                    //     this.saveCommonSearch()
                    // }
                    }
                }
            },

            /* 表头检索 */
            // 左上角排序标签
            empty_sort() {
                // 清空
                this.order_column = '';
                this.order_type = '';
                // 刷新，页码变为第一页
                this.currentPage = 1;
                if (this.isPiwikFlag) {
                    this.mergeQueryListP();
                    this.refreshDataP();
                } else {
                    this.mergeQueryListO();
                    this.refreshDataO();
                }
            },
            // 去掉表头检索标签
            async remove_filter_tag(key, params) {
                this.isSearching = -1;
                const temp = this.config_tableFilter[key];
                // 去掉该项查询条件
                if (temp) {
                    if (key === 'receptionServer') {
                        temp.serverAccId = [];
                        temp.query = [];
                        this.$set(this.config_tableFilter, key, temp);
                        this.serverAccId = [];
                    } else if (['interactionVisitorsMd5', 'visitorsMd5'].includes(key)) {
                        this.removeMd5Filter();
                    } else {
                        // this.serverAccId = []
                        switch (temp.filterType) {
                            case 'string':
                                temp.query = '';
                                break;
                            case 'select':
                            case 'countryArea':
                            case 'date':
                            case 'trafficSource':
                                temp.query = [];
                                break;
                        }
                        this.$set(this.config_tableFilter, key, temp);
                    }
                }
                this.tableSearch.forEach((item, index) => {
                    if (item.name === this.handleSearchConO(key) || (item.name && item.name.startsWith('a.') && item.name.slice(2) === this.handleSearchConO(key))) {
                        this.$delete(this.tableSearch, index);
                    }
                });
                // 设置表格 filtering 为 false , 并从表头筛选条件对象中去掉对应筛选项
                const index = this.allColumns.findIndex(item => item.key === key);
                if (index !== -1) {
                    const col = this.allColumns[index];
                    col.filtering = false;
                    this.$set(this.allColumns, index, col);
                    this.changeGroups(this.group);

                    if (!this.tableTimeFilterFlag) {
                        // 表头没有时间筛选(把时间筛选给remove了)
                        if (this.rightTimeFilterFlag) {
                            // 右上角有时间筛选
                            // 下边这两行不太懂 -- 100000
                            const conR = this.handleSearchConP(flag.condition1);
                            this.$delete(this.sqlList_tableFilter, conR);
                            this.currentPage = 1;
                            if (this.isPiwikFlag) {
                                this.mergeQueryListP();
                                this.refreshDataP();
                            } else {
                                this.mergeQueryListO();
                                this.refreshDataO();
                            }
                        } else {
                            // 如果key 是这两个条件之一的话，按key查询，从上线时间到今天
                            // 右上角没有时间查询,
                            // 重置数据： 先检测该公司6月1号之前有没有数据
                            let timeVal = [];
                            if (this.isNewCompany) {
                                timeVal = [new Date(this.companyOpenTime), new Date()];
                            } else {
                                timeVal = [new Date(this.onLineTime), new Date()];
                                // this.$Message.info({
                                //     content: this.$t('visitor_history.contain_time_message'),
                                //     duration: 5,
                                //     closable: true
                                // });
                                this.$Message({
                                    message: this.$t('visitor_history.contain_time_message'),
                                    duration: 5000,
                                    showClose: true,
                                    type: 'info'
                                });
                            }
                            timeVal = timeVal.map(item => {
                                return this.$options.filters.timeFormat(item.getTime());
                            });
                            timeVal[0] = `${timeVal[0]} 00:00:00`;
                            timeVal[1] = `${timeVal[1]} 23:59:59`;
                            if (key === 'createTime' || key === 'leaveTime') {
                                this.handleResetTime(key, timeVal);
                            } else {
                                this.handleResetTime('createTime');
                            }
                            this.currentPage = 1;
                            this.mergeQueryListP();
                            this.refreshDataP();
                        }
                    } else {
                        // 表头筛选有时间段
                        this.$delete(this.sqlList_tableFilter, this.handleSearchConP(col.title));
                        this.tableSearch.forEach((item, index) => {
                            if (item.name === this.handleSearchConO(key) || (item.name && item.name.startsWith('a.') && item.name.slice(2) === this.handleSearchConO(key))) {
                                this.$delete(this.tableSearch, index);
                            }
                        });
                        const temp1 = this.tableTimeFilterFlag;
                        this.currentPage = 1;
                        const startTime = new Date(temp1.query[0]).getTime();
                        const endTime = new Date(temp1.query[1]).getTime();
                        this.handleTableSearchCondition(startTime, endTime, temp1);
                    }
                } else {
                    if (key === 'visitorTypeId') {
                        this.$delete(this.sqlList_tableFilter, 'visitorTypeId');
                        this.tableSearch.forEach((item, index) => {
                            if (item.name === 'visitor_type') {
                                this.$delete(this.tableSearch, index);
                            }
                        });
                        const visitorTypeIndex = this.allColumns.findIndex(item => item.key === 'visitorType');
                        const col = this.allColumns[visitorTypeIndex];
                        col.filtering = false;
                        this.$set(this.allColumns, visitorTypeIndex, col);
                        this.changeGroups(this.group);
                        this.filtering = false;
                        this.currentPage = 1;
                        const temp1 = this.tableTimeFilterFlag;
                        const startTime = new Date(temp1.query[0]).getTime();
                        const endTime = new Date(temp1.query[1]).getTime();
                        this.handleTableSearchCondition(startTime, endTime, temp1);
                    } else if (['interactionVisitorsMd5', 'visitorsMd5'].includes(key)) {
                        // md5 值
                        this.currentPage = 1;
                        this.mergeQueryListP();
                        this.refreshDataP();
                    }
                }
            },
            //  点击标签可以修改筛选条件
            change_filter_tag(tagKey, temp) {
                if (tagKey === 'createTime' || tagKey === 'leaveTime') {
                    // let val = this.config_tableFilter[tagKey].query;
                    // 先判断query是否已格式化过
                    // const isTimeFormat = val[0].includes('00:00:00');
                    // if (!isTimeFormat) {
                    //     val[0] = `${val[0]} 00:00:00`;
                    //     val[1] = `${val[1]} 23:59:59`;
                    // }
                    const val = this.config_tableFilter[tagKey].query.map(item => {
                        return this.$options.filters.timeFormat(item.getTime());
                    });
                    val[0] = `${val[0]} 00:00:00`;
                    val[1] = `${val[1]} 23:59:59`;

                    if (new Date(val[0]).getTime() < this.timeLine && this.timeLine < new Date(val[1]).getTime()) {
                        console.log('跨过时间');
                        this.timeReference = temp.query;
                    }
                    this.datevalue = val;
                }
                this.handleTimeJudgement(tagKey);
            },
            // 返回字段筛选渲染函数
            renderHeader_filter(colIndex) {
                return (h) => {
                    const column = this.allColumns[colIndex];
                    /* DOM */
                    // 标题
                    if( !column) return false;
                    const title = h('div', {
                        attrs: {
                            title: column.title
                        },
                        class: 'table-filter-title'
                    }, column.title);

                    // 系统 tips
                    const helpTip = column.key === 'trafficSource'
                        ? h('HelpTip', {
                            props: {
                                title: this.$t('helpTip.traffic_source_visitorHistory')
                            },
                            class: 'table-head-tip'
                        })
                        : undefined;

                    // 排序组件
                    const order_column = this.handleSearchConP(column.title);
                    const sortIcons = h('span', {
                        class: {
                            'table-sort-icon-container': true
                        }
                    }, [
                        h('Icon', {
                            class: {
                                'icon-custom-on': true,
                                'icon-custom-on-active': this.order_column === order_column && this.order_type === 'asc'
                            },
                            props: {
                                type: 'md-arrow-dropup'
                            }
                        }),
                        h('Icon', {
                            class: {
                                'icon-custom-on': true,
                                'icon-custom-on-active': this.order_column === order_column && this.order_type === 'desc'
                            },
                            props: {
                                type: 'md-arrow-dropdown'
                            }
                        })
                    ]);

                    // 筛选组件
                    const filterPop = h('FilterBox', {
                        props: Object.assign({
                            showPopper: this.allColumns[colIndex].show_filter_content,
                            filtering: this.allColumns[colIndex].filtering,
                            columnKey: column.key,
                            columnCon: order_column,
                            order_type: this.order_type,
                            order_column: this.order_column,
                            dateOptions: this.dateOptions,
                            storageName_orderColumn: this.storageName_orderColumn
                        }, this.config_tableFilter[column.key]),
                        on: {
                            // 时间相关列筛选时，现在的逻辑是：
                            // 如果没有其他筛选列，那么可以筛选6月1号前或后的数据，如果有其他的，那么要和别的时间筛选保持一致
                            onChangeTimeChoose: () => {
                                this.changeDateTable(column);
                            },
                            updateList: () => {
                                const tagKey = column.key;
                                this.handleTimeJudgement(tagKey, colIndex);
                                this.clearSelectedVisitors();
                            },
                            'update:showPopper': (val) => {
                                this.allColumns = this.allColumns.map((item, index) => {
                                    if (index === colIndex) {
                                        // console.log('index === colIndex',index,colIndex)
                                        item.show_filter_content = val;
                                    } else if (val) {
                                        if (item.title !== this.$t('index')) {
                                            item.show_filter_content = false;
                                        }
                                    }
                                    return item;
                                });
                            },
                            'update:query': (val) => {
                                // 如果是时间筛选，需要格式化
                                if (column.key === 'createTime' || column.key === 'leaveTime') {
                                    if (val && val.length) {
                                        val = val.map(item => {
                                            return this.$options.filters.timeFormat(new Date(item).getTime());
                                        });
                                        val[0] = `${val[0]} 00:00:00`;
                                        val[1] = `${val[1]} 23:59:59`;
                                        if (new Date(val[0]).getTime() < this.timeLine && this.timeLine < new Date(val[1]).getTime()) {
                                            this.timeReference = this.config_tableFilter[column.key].query;
                                        }
                                        this.datevalue = val;
                                    } else {
                                        this.datevalue = [];
                                    }
                                }
                                // 如果是客服筛选，需要另外给config_tableFilter加serverAccId字段
                                if (column.key === 'receptionServer') {
                                    this.serverAccId = [];
                                    val.forEach(item => {
                                        this.serverAccId.push(item.value);
                                    });
                                    this.$set(this.config_tableFilter[column.key], 'serverAccId', val);
                                    this.$set(this.config_tableFilter[column.key], 'query', val);
                                //  如果是访客类别visitorType筛选，需要用visitorTypeId去传参
                                } else if (column.key === 'visitorType') {
                                    this.$set(this.config_tableFilter.visitorType, 'query', []);
                                    this.$set(this.config_tableFilter.visitorTypeId, 'query', val);
                                // 其他都正常的
                                } else {
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
                        (this.order_column === order_column && this.order_type) ? sortIcons : undefined,
                        column.hasOwnProperty('show_filter_content') ? filterPop : undefined,
                        helpTip
                    ]);
                };
            },
            // 纯文本表头, 不换行 + 省略号 + title 提示
            renderHeader_text(colIndex) {
                return h => {
                    const column = this.allColumns[colIndex];
                    /* DOM */
                    // 标题
                    const title = h('div', {
                        attrs: {
                            title: column.title
                        },
                        class: 'table-filter-title'
                    }, column.title);

                    /* 返回 DOM */
                    return h('div', {
                        class: 'table-filter-container'
                    }, [title]);
                };
            },


            // 时间判断： 6月1号之前使用询盘云接口，6月1号之后使用piwik接口
            // a为传参， cbP为借口是piwik的回调， cbO为接口是询盘云本身的回调， cb为右上角和表头都没有时间筛选的回调
            handleTimeJudgementAll(a, cbP, cbO, cb, cbCross) {
                let startTime = '';
                let endTime = '';
                if (!this.tableTimeFilterFlag) {
                    // 表头筛选没有时间检索条件
                    if (this.rightTimeFilterFlag) {
                        // 右上角有时间筛选
                        this.handleFormatDate();
                        // 如果是时间段的话
                        if (this.rightTimeFilterFlag.inputType === 'dateRange') {
                            startTime = new Date(this.rightTimeFilterFlag.condition3[0]).getTime();
                            endTime = new Date(this.rightTimeFilterFlag.condition3[1]).getTime();
                        }
                    } else {
                        // 右上角没有筛选条件,重置条件为piwik
                        // this.$Message.info({
                        //     content: this.$t('visitor_history.contain_time_message'),
                        //     duration: 5,
                        //     closable: true
                        // });
                        this.$Message({
                            message: this.$t('visitor_history.contain_time_message'),
                            duration: 5000,
                            showClose: true,
                            type: 'info'
                        });
                        this.handleResetTime('createTime');
                        this.currentPage = 1;
                        this.mergeQueryListP();
                        this.refreshDataP();
                        return cb(a);
                    }
                } else {
                    // 表头筛选中有时间条件
                    startTime = new Date(this.tableTimeFilterFlag.query[0]).getTime();
                    endTime = new Date(this.tableTimeFilterFlag.query[1]).getTime();
                }
                if (startTime && endTime) {
                    if (startTime >= this.timeLine) {
                        return cbP(a);
                    } else if (endTime < this.timeLine) {
                        return cbO(a);
                    } else {
                        // 跨过时间
                        // this.$Message.info({
                        //     content: this.$t('visitor_history.time_crossing_warning'),
                        //     duration: 5,
                        //     closable: true
                        // });
                        this.$Message({
                            message: this.$t('visitor_history.time_crossing_warning'),
                            duration: 5000,
                            showClose: true,
                            type: 'warning'
                        });
                        return cbCross(a);
                    }
                }
            },
            // 搜索时间处理
            handleTableSearchCondition(startTime, endTime, temp) {
                console.log('搜索时间处理', temp, startTime, endTime);
                if (startTime < this.timeLine && endTime > this.timeLine) {
                    console.log('跨过时间段');
                    // this.$Message.info({
                    //     content: this.$t('visitor_history.time_crossing_warning'),
                    //     duration: 5,
                    //     closable: true
                    // });
                    this.$Message({
                        message: this.$t('visitor_history.time_crossing_warning'),
                        duration: 5000,
                        showClose: true,
                        type: 'warning'
                    });
                    if (temp) {
                        // 保持原来的时间筛选 --- 100000
                        this.$set(temp, 'query', this.timeReference);
                    }
                } else if (startTime >= this.timeLine) {
                    this.mergeQueryListP();
                    this.refreshDataP();
                } else if (endTime < this.timeLine) {
                    this.mergeQueryListO();
                    this.refreshDataO();
                }
            },
            // 表头筛选
            handleTimeJudgement(tagKey, colIndex) {
                // 进行正常检索之前先去掉 md5 值检索
                this.removeMd5Filter();

                // 去除右上角重复检索字段
                this.addCondition.forEach((item, index) => {
                    const temp = this.handleSearchConP(item.condition1);
                    // let temp1 = this.handleSearchConO(item.condition1);
                    if (temp === tagKey) {
                        item.condition1 = '';
                        item.condition2 = '';
                        item.condition3 = '';
                        item.conditionList1 = this.$deepClone(this.conditionList1);
                        item.conditionList2 = this.$deepClone(this.conditionList1);
                        item.inputType = 'string';
                        this.$delete(this.searchItem, index);
                    }
                    if (item.condition1 == '') {
                        this.filtering = false;
                    }
                });
                this.isSearching = -1;
                // 表头筛选没有时间检索条件
                if (!this.tableTimeFilterFlag) {
                    // 右上角有时间筛选
                    if (this.rightTimeFilterFlag) {
                        this.handleTableFilterP(tagKey, colIndex);
                        this.handleTableFilterO(tagKey, colIndex);
                        console.log('表头筛选没有时间条件--右上角有时间检索条件', this.tableSearch, this.sqlList_tableFilter);
                        const startTime = new Date(this.rightTimeFilterFlag.condition3[0]).getTime();
                        const endTime = new Date(this.rightTimeFilterFlag.condition3[1]).getTime();
                        this.handleTableSearchCondition(startTime, endTime);
                    } else {
                        // 右上角没有筛选条件，此时需要重置筛选条件
                        this.handleTableFilterP(tagKey, colIndex);
                        this.handleTableFilterO(tagKey, colIndex);
                        // this.$Message.info({
                        //     content: this.$t('visitor_history.contain_time_message'),
                        //     duration: 5,
                        //     closable: true
                        // });
                        this.$Message({
                            message: this.$t('visitor_history.time_crossing_warning'),
                            duration: 5000,
                            showClose: true,
                            type: 'warning'
                        });
                        // 重置筛选条件
                        this.handleResetTime('createTime');
                        this.currentPage = 1;
                        this.mergeQueryListP();
                        this.refreshDataP();
                    }
                } else {
                    // 表头筛选中有时间条件
                    this.handleTableFilterP(tagKey, colIndex);
                    this.handleTableFilterO(tagKey, colIndex);
                    console.log('表头筛选中有时间条件', this.tableSearch, this.sqlList_tableFilter);
                    let temp = [];
                    if (tagKey === 'createTime' || tagKey === 'leaveTime') {
                        // 正在更新时间检索
                        if (this.config_tableFilter[tagKey].query.length) {
                            temp = this.config_tableFilter[tagKey]; // 筛选 或 排序，当前这列有检索条件
                        } else {
                            temp = this.tableTimeFilterFlag; // 排序
                        }
                    } else {
                        temp = this.tableTimeFilterFlag; // 有时间检索，正在更新其他
                    }
                    const startTime = new Date(temp.query[0]).getTime();
                    const endTime = new Date(temp.query[1]).getTime();
                    this.handleTableSearchCondition(startTime, endTime, temp);
                }
            },

            // 去掉 md5 检索值
            removeMd5Filter() {
                // 如果确实有 md 检索
                if (this.interactionVisitorsMd5 || this.visitorsMd5) {
                    // 如果当前表格筛选条件中没有"时间", 则重置时间筛选条件
                    if (!this.tableTimeFilterFlag) {
                        this.handleResetTime('createTime');
                    }
                }

                // 如果有 md5 检索值, 去掉
                if (this.interactionVisitorsMd5) {
                    this.interactionVisitorsMd5 = '';

                    const temp = this.config_tableFilter.interactionVisitorsMd5;
                    temp.query = '';
                    this.$set(this.config_tableFilter, 'interactionVisitorsMd5', temp);
                }
                if (this.visitorsMd5) {
                    this.visitorsMd5 = '';

                    const temp = this.config_tableFilter.visitorsMd5;
                    temp.query = '';
                    this.$set(this.config_tableFilter, 'visitorsMd5', temp);
                }
            },
            // ----------------------------------------------------------------------------------------------------------

            /* 修改数据 */
            // 编辑模态框出现
            clickEditIcon(row, index) {
                this.editRemarkVisible = true;
                this.editRemark = row.remark;
                this.editRow = row;
                this.editIndex = index;
            },
            // 修改备注
            async sureChangeRemark(val, index, key) {
                const visitorId = this.editRow.visitorId;
                const visitorRemark = this.editRemark;
                const visitorAccId = this.editRow.acctId || '';
                this.isChangeSucc = true;
                if (this.editRow.piwikFlag) {
                    this.changeRemarkP({ visitorId, visitorRemark, visitorAccId });
                } else {
                    this.changeRemarkO({ visitorId, visitorRemark });
                }
            },
            // 取消修改备注
            cancleChangeRemark() {
                console.log(this.editRow);
                this.editRemark = this.editRow.remark;
                this.editRemarkVisible = false;
            },
            // 修改访客类别
            async changeVisitorType(scope) {
                if (!this.authorized_button.visitorType) {
                    this.$Message.warning(this.$t('visitor_history.notAllowedChange'));
                    return;
                }

                let visitorTypeId = '';
                this.visitorTypeList.forEach(item => {
                    if (item.name === scope.row.visitorType) {
                        visitorTypeId = item.id;
                    }
                });
                console.log('修改访客类别', scope, visitorTypeId);
                if (scope.row.piwikFlag) {
                    this.changeVisitorTypeP({ scope, visitorTypeId });
                } else {
                    // 因为访客类型的列表已经是piwik的了，所有6月1号之前的访客类型禁止修改
                    this.$Message.warning(this.$t('visitor_history.notAllowedChange'));
                }
            },

            /* 表格数据处理 */
            // 展示的表格表头信息
            async handleTableHead() {
                const lang = Vue.config.lang;
                this.allColumns = [
                    // {
                    //     key: 'index',
                    //     type: 'index',
                    //     title: this.$t('visitor_history.index'),
                    //     width: 70,
                    //     align: 'left',
                    //     fixed: 'left'
                    // },
                    {
                        key: 'visitorId',
                        title: this.$t('visitor_history.visitor_id'),
                        width: 198,
                        align: 'left'
                    },
                    {
                        key: 'trafficSource',
                        title: this.$t('visitor_history.traffic_source'),
                        width: lang === 'zh-CN' ? 120 : 200,
                        align: 'left',
                        formatter: row => {
                            switch (row.trafficSource - 0) {
                                case 1:
                                    return this.$t('visitor_history.ad_google');
                                case 2:
                                    return this.$t('visitor_history.ad_facebook');
                                case 3:
                                    return this.$t('visitor_history.ad_other');
                                case 4:
                                    return this.$t('visitor_history.email_marketing');
                                case 5:
                                    return this.$t('visitor_history.search_engine');
                                case 6:
                                    return this.$t('visitor_history.social_network');
                                case 7:
                                    return this.$t('visitor_history.other_referrals');
                                case 8:
                                    return this.$t('visitor_history.direct_access');
                                case 9:
                                    return this.$t('visitor_history.ad_yandex');
                                case 10:
                                    return this.$t('visitor_history.ad_cloudshare');
                                case 101:
                                    return this.$t('visitor_history.ad_cloudshare_facebook');
                                case 102:
                                    return this.$t('visitor_history.ad_cloudshare_messenger');
                                case 103:
                                    return this.$t('visitor_history.ad_cloudshare_whatsApp');
                                case 104:
                                    return this.$t('visitor_history.ad_cloudshare_email');
                                case 105:
                                    return this.$t('visitor_history.ad_cloudshare_other');
                                default:
                                    return row.trafficSource;
                            }
                        }
                    },
                    {
                        key: 'remark',
                        customSettings: true,
                        title: this.$t('visitor_history.remark'),
                        width: 135,
                        align: 'left',
                        visible: false
                    },
                    // {
                    //     key: 'visitorType',
                    //     customSettings: true,
                    //     title: this.$t('visitor_history.visitor_type'),
                    //     width: lang === 'zh-CN' ? 140 : 160,
                    //     align: 'left'
                    // },
                    {
                        key: 'visitorName',
                        title: this.$t('visitor_history.visitor_name'),
                        width: 120,
                        align: 'left'
                    },
                    {
                        key: 'receptionServer',
                        title: this.$t('visitor_history.service_name'),
                        width: lang === 'zh-CN' ? 140 : 180,
                        align: 'left'
                    },
                    {
                        key: 'visitorChatCount',
                        title: this.$t('visitor_history.visitor_chat_count'),
                        width: lang === 'zh-CN' ? 150 : 180,
                        align: 'left'
                    },
                    {
                        key: 'serverChatCount',
                        title: this.$t('visitor_history.service_chat_count'),
                        width: lang === 'zh-CN' ? 150 : 180,
                        align: 'left'
                    },
                    {
                        key: 'createTime',
                        title: this.$t('visitor_history.create_time'),
                        width: 180,
                        align: 'left'
                    },
                    {
                        key: 'leaveTime',
                        title: this.$t('visitor_history.leave_time'),
                        width: 180,
                        align: 'left'
                    },

                    // {
                    //     key: 'recentVisitSource',
                    //     title: this.$t('visitor_history.recent_visit_source'),
                    //     width: 180,
                    //     align: 'left'
                    // },
                    // {
                    //     key: 'recentFirstVisitorAddress',
                    //     title: this.$t('visitor_history.recent_first_visit_address'),
                    //     width: 180,
                    //     align: 'left'
                    // },
                    // {
                    //     key: 'firstVisitSource',
                    //     title: this.$t('visitor_history.first_visit_source'),
                    //     width: 180,
                    //     align: 'left'
                    // },
                    {
                        key: 'visitSource',
                        title: this.$t('visitor_history.source'),
                        width: 180,
                        align: 'left'
                    },
                    {
                        key: 'firstVisitorAddress',
                        title: this.$t('visitor_history.first_visit_address'),
                        width: 180,
                        align: 'left'
                    },
                    {
                        key: 'ipLocation',
                        title: this.$t('visitor_history.ip_location'),
                        width: lang === 'zh-CN' ? 120 : 140,
                        align: 'left'
                    },
                    {
                        key: 'crmStatus',
                        title: this.$t('visitor_history.status'),
                        width: 100,
                        align: 'left',
                        formatter: row => {
                            switch (Number(row.crmStatus)) {
                                case 4:
                                    return this.$t('mail.other_leads');
                                case 6:
                                    return this.$t('mail.otherContact');
                                case 9:
                                    return this.$t('mail.other_customers');
                                case 2:
                                    return this.$t('mail.my_leads');
                                case 5:
                                    return this.$t('mail.myContact');
                                case 7:
                                    return this.$t('mail.my_customers');
                                case 3:
                                    return this.$t('mail.public_leads');
                                case 8:
                                    return this.$t('mail.public_customers');
                                case 1:
                                default:
                                    return this.$t('mail.untreatedDocumented');
                            }
                            // // /* 未录入 */
                            // if (row.crmStatus == 1) {
                            //     return this.$t('website.notEnter');
                            //     /* 已录入 */
                            // } else if (row.crmStatus == 3) {
                            //     return this.$t('website.Tooltip2');
                            // } else if (row.crmStatus == 2) {
                            //     return this.$t('clue.clue');
                            // } else if (row.crmStatus == 102) {
                            //     return this.$t('clue.inquiry');
                            // } else {
                            //     return this.$t('website.notEnter');
                            // }
                        }
                    },
                    {
                        key: 'visitValue',
                        title: this.$t('visitor_history.visit_value'),
                        // width: lang === 'zh-CN' ? 120 : 140,
                        align: 'left',
                        minWidth: 120
                    }
                ];
                this.group = this.allGroup.slice();
                // 获取AI公司id列表, 判断是否是AI公司
                const resArr = await this.judgeIsAICompany();
                if (resArr) {
                    this.isAiCompany = resArr.find(item => {
                        return item === this.enterpriseId;
                    });
                }
                // 如果不是的话，去掉流量来源那一列
                if (this.isAiCompany === undefined) {
                    this.allColumns = this.allColumns.filter(item => {
                        return item.key !== 'visitValue';
                    });
                    this.conditionList1 = this.conditionList1.filter(item => {
                        return item.value !== this.$t('visitor_history.visit_value');
                    });
                    this.addCondition[0].conditionList1 = this.conditionList1;
                }
            },
            // 处理列表中的数据格式
            handleData(dataList) {
                // 处理全选
                if (dataList.length > 0) {
                    this.currentVisitor = dataList.map(item => {
                        return {
                            visitorId: item.visitorId,
                            gclid: item.gclid
                        };
                    });
                } else {
                    this.currentVisitor = [];
                }
                // 处理客服聊天数和访客聊天数
                dataList.forEach((item) => {
                    item.visitorChatCount = parseInt(item.visitorChatCount);
                    item.serverChatCount = parseInt(item.serverChatCount);
                });

                // 高亮详情页所在行
                if (this.showDetail) {
                    const rowIndex = this.editIncellData.findIndex(item => item.visitorId === this.currentRow.visitorId);
                    if (rowIndex !== -1) {
                        this.$refs.visitorTable.setCurrentRow(this.editIncellData[rowIndex]);
                    }
                }
            },
            handleConfigureTableFilter() {
                this.allColumns = this.allColumns.map((col, index) => {
                    const headSet = this.config_tableFilter[col.key];
                    if (headSet && (headSet.sort || headSet.filter)) {
                        col.show_filter_content = false;
                        col.filtering = false;
                        col.renderHeader = this.renderHeader_filter(index);
                    } else {
                        col.renderHeader = this.renderHeader_text(index);
                    }
                    return col;
                });
            },


            /* -----------------------------------------右上角检索 */
            // 添加检索条件
            addClick() {
                this.addCondition.push({
                    condition1: '',
                    conditionList1: this.$deepClone(this.conditionList1),
                    condition2: '',
                    conditionList2: this.$deepClone(this.conditionList2),
                    condition3: '',
                    inputType: 'string'
                });
            },
            // 删除检索条件
            removeClick(index) {
                this.addCondition.splice(index, 1);
            },
            // 检索条件变化
            addChangeCon1(conditionName, index, name, inputType) {
                this.addCondition[index].condition2 = '';
                this.addCondition[index].condition3 = '';
                switch (conditionName) {
                    // 字符串型
                    // case this.$t('visitor_history.recent_visit_source'):
                    // case this.$t('visitor_history.recent_first_visit_address'):
                    // case this.$t('visitor_history.first_visit_source'):
                    // case this.$t('visitor_history.first_visitor_address'):
                    case this.$t('visitor_history.visitor_id'):
                    case this.$t('visitor_history.visitor_name'):
                    case this.$t('visitor_history.ip_location'):
                    case this.$t('visitor_history.source'):
                    case this.$t('visitor_history.first_visit_address'):
                    case this.$t('visitor_history.remark'):
                        this.addCondition[index].conditionList2 = [
                            {
                                value: this.$t('filter_box.equal'),
                                label: this.$t('filter_box.equal')
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
                        this.addCondition[index].inputType = 'string';
                        break;
                    // 选择框型---
                    // 客服
                    case this.$t('visitor_history.service_name'):
                        this.addCondition[index].condition2 = this.$t('filter_box.contain');
                        this.addCondition[index].conditionList2 = [
                            {
                                value: this.$t('filter_box.contain'),
                                label: this.$t('filter_box.contain')
                            }
                        ];
                        this.addCondition[index].inputType = 'select';
                        this.addCondition[index].conditionList3 = this.serverList.map((item) => {
                            return {
                                value: item.accid,
                                label: item.serviceName
                            };
                        });
                        break;
                    // 访客类别
                    case this.$t('visitor_history.visitor_type'):
                        this.addCondition[index].conditionList2 = [
                            {
                                value: this.$t('filter_box.equal'),
                                label: this.$t('filter_box.equal')
                            }
                        ];
                        this.addCondition[index].conditionList3 = this.visitorTypeList.map(item => {
                            return {
                                value: item.id,
                                label: item.name
                            };
                        });
                        this.addCondition[index].inputType = 'select';
                        this.addCondition[index].condition2 = this.$t('filter_box.equal');
                        break;
                    // 访客状态
                    case this.$t('visitor_history.status'):
                        this.addCondition[index].conditionList2 = [
                            {
                                value: this.$t('filter_box.equal'),
                                label: this.$t('filter_box.equal')
                            }
                        ];
                        this.addCondition[index].condition2 = this.$t('filter_box.equal');
                        this.addCondition[index].conditionList3 = this.crmStatusList;
                        this.addCondition[index].inputType = 'select';
                        break;
                    // 访客来源类别
                    case this.$t('visitor_history.traffic_source'):
                        this.addCondition[index].conditionList2 = [
                            {
                                value: this.$t('filter_box.equal'),
                                label: this.$t('filter_box.equal')
                            }
                        ];
                        this.addCondition[index].condition2 = this.$t('filter_box.equal');
                        this.addCondition[index].conditionList3 = this.trafficSourceListRight.map((trafficSource, trafficIndex) => {
                            return {
                                value: trafficSource.value,
                                label: trafficSource.label
                            };
                        });
                        this.addCondition[index].inputType = 'select';
                        break;

                    // 数字
                    case this.$t('visitor_history.visitor_chat_count'):
                    case this.$t('visitor_history.service_chat_count'):
                    case this.$t('visitor_history.visit_value'):
                        this.addCondition[index].conditionList2 = [
                            {
                                value: this.$t('filter_box.lt'),
                                label: this.$t('filter_box.lt')
                            },
                            {
                                value: this.$t('filter_box.lte'),
                                label: this.$t('filter_box.lte')
                            },
                            {
                                value: this.$t('filter_box.equal'),
                                label: this.$t('filter_box.equal')
                            },
                            {
                                value: this.$t('filter_box.gte'),
                                label: this.$t('filter_box.gte')
                            },
                            {
                                value: this.$t('filter_box.gt'),
                                label: this.$t('filter_box.gt')
                            }
                        ];
                        this.addCondition[index].inputType = 'number';
                        this.addCondition[index].condition3 = 0;
                        break;
                    // 时间类
                    case this.$t('visitor_history.create_time'):
                    case this.$t('visitor_history.leave_time'):
                        this.addCondition[index].conditionList2 = [
                            {
                                value: this.$t('filter_box.daterange'),
                                label: this.$t('filter_box.daterange')
                            }
                        ];
                        this.addCondition[index].condition2 = this.$t('filter_box.daterange');
                        this.addCondition[index].inputType = 'dateRange';
                        this.addCondition[index].condition3 = [];
                        // if (this.addCondition[index].condition2 === this.$t('filter_box.daterange')) {
                        //     this.addCondition[index].inputType = 'dateRange';
                        //     this.addCondition[index].condition3 = [];
                        // }
                        break;
                    default:
                        break;
                }
            },


            /* 页数相关 */
            // 改变当前页数据条数
            pageSizeChange(pageSize) {
                this.pageSize = pageSize;
                this.currentPage = 1;
                if (this.isPiwikFlag) {
                    this.mergeQueryListP();
                    this.refreshDataP();
                } else {
                    this.mergeQueryListO();
                    this.refreshDataO();
                }
                this.clearSelectedVisitors();
            },
            // 改变页数
            async changePage(index) {
                this.loading = true;
                this.editIncellData = [];
                this.currentPage = index;
                if (this.isPiwikFlag) {
                    this.mergeQueryListP();
                    this.refreshDataP();
                } else {
                    this.mergeQueryListO();
                    this.refreshDataO();
                }
                //  以下为全选相关
                const indexFlag = this.allCheckedPageList.findIndex(item => {
                    return item === index;
                });
                if (indexFlag !== -1) {
                    this.allchecked = true;
                } else {
                    this.allchecked = false;
                }
            },

            /* 显示字段相关 */
            // 修改字段
            changeGroups(selCol) {
                this.refreshColumnFlag = false;
                const orderObj = Object.assign({}, ...selCol.map((item, index) => {
                    const temp = {};
                    temp[item] = index;
                    return temp;
                }));
                this.currentColumns = this.allColumns.filter(col => selCol.includes(col.key)).sort((a, b) => {
                    return orderObj[a.key] - orderObj[b.key];
                });
                this.$nextTick(() => {
                    this.refreshColumnFlag = true;
                    this.selectedVisitors = [];
                });
            },

            /* 访客历史详情页相关 */
            // 点击进入详情页
            async clickRow(row, column, event) {
                // row当前行的数据，column鼠标点击的当前列的信息，event事件对象
                if ((column.label === this.$t('visitor_history.source') || column.label === this.$t('visitor_history.first_visit_address')) &&
                    row[column.property]
                ) {
                    this.$copyText(row[column.property]).then(this.onCopy, this.onError);
                    return;
                }
                // data--当前行的数据; index 当前行的下标
                // let event = window.event || {target: {}};
                // arguments.callee.caller.arguments[0]
                const explorer = window.navigator.userAgent;
                let selecter = '';
                if (explorer.indexOf('MSIE') >= 0 || explorer.indexOf('Opera') >= 0) {
                    const selected = document.selection.createRange();
                    selecter = selected.text;
                } else {
                    selecter = window.getSelection();
                }
                if (selecter.type === 'Range' || document.activeElement.tagName === 'INPUT') {
                    return;
                }
                if (event.target.className === 'ivu-select-placeholder' ||
                    event.target.className === 'ivu-select-selected-value' ||
                    event.target.className === 'ivu-input ivu-input-default' ||
                    event.target.className === 'ivu-input' ||
                    event.target.className === 'copy' ||
                    event.target.nodeName === 'A' ||
                    event.target.className === 'ivu-icon ivu-icon-edit' ||
                    event.target.className === 'ivu-btn ivu-btn-small ivu-btn-icon-only' ||
                    event.target.className === 'ivu-icon ivu-icon-ios-minus-outline' ||
                    event.target.className === 'ivu-icon ivu-icon-android-checkbox-outline' ||
                    event.target.className === 'ivu-icon ivu-icon-forward' ||
                    event.target.className === 'ivu-icon ivu-icon-ios-arrow-down ivu-select-arrow' ||
                    event.target.className === 'ivu-icon ivu-icon-checkmark' ||
                    event.target.className.indexOf('show-edit-btn') !== -1) {
                    return;
                }

                // 以下为判断是否有权限打开该访客详情页
                let serverIdList = [];
                if (this.isPiwikFlag) {
                    serverIdList = await this.getVisitorServerIdListByVisitorIdP(row);
                } else {
                    serverIdList = await this.getVisitorServerIdListByVisitorIdO(row);
                }
                if (serverIdList === null) return;
                // if (serverIdList.length !== 0) {
                //     const isHavePrivilege = await this.getVisitorHistoryDetailPrivilege(row, serverIdList);
                //     if (!isHavePrivilege) return;
                // }
                // 生成触点信息
                // util.ajaxJson({
                //     url: '/form-cust/newtenant/touchpoint/genFormTouchPoint',
                //     method: 'post',
                //     data: {
                //         orgId: this.enterpriseId,
                //         userId: this.userId,
                //         visitorId: row.visitorId
                //     }
                // }).then(response => {
                // });
                this.currentRow = row;
                this.showDetail = true;
            },
            // 详情页修改完访客状态的回调 -- 列表页修改相对应的视图
            changeRowData({ row, key, value, clueId }) {
                this.editIncellData.forEach((ele,i) => {
                    if (ele.acctId === row.acctId) {
                        this.$set(ele, key, value);
                        // this.currentRow = this.editIncellData[i];
                    }
                });
                // if (value != 2) {
                //     this.updateKey = Date.now();
                // }
                this.$refs.visitorDetails.getInfoById();
            },

            /* 其他 */
            // 日期格式化
            dateformat() {
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
                        fmt = fmt.replace(RegExp.$1, (String(this.getFullYear())).substr(4 -
                            RegExp.$1.length));
                    }
                    for (const k in o) {
                        if (new RegExp(`(${k})`).test(fmt)) {
                            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1)
                                ? (o[k])
                                : ((`00${o[k]}`).substr((String(o[k])).length)));
                        }
                    }
                    return fmt;
                };
            },
            // 菜单栏缩放
            toggle_drawer(val) {
                this.bus.$emit('shrinkMenu', val);
            },
            // 显示原图片
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            },
            // 复制url
            copyUrl(url) {
                this.currUrl = url;
                const copyUrl = document.getElementById('CopyUrl');
                setTimeout(() => {
                    copyUrl.click();
                }, 0);
            },
            onCopy() {
                // this.$Message.success(this.$t('portal_set.copy_success'));
                this.$Message({
                    message: this.$t('portal_set.copy_success'),
                    type: 'success'
                });
            },
            onError() {
                // this.$Message.error(this.$t('portal_set.copy_failed'));
                this.$Message({
                    message: this.$t('portal_set.copy_failed'),
                    type: 'error'
                });
            },
            hidelayer() {
                this.filtercolshow = false;
                this.changecolshow = false;
            },
            // 下载文件
            exportData() {
                let url = '';
                console.log('时间', this.datevalue);
                if (!this.datevalue[0]) {
                    this.$Message.error(this.$t('filter_box.select_one'));
                    // this.$Message({
                    //     message: this.$t('filter_box.select_one'),
                    //     duration: 5000,
                    //     showClose: true,
                    //     type: 'error'
                    // });
                    return;
                } else if (this.datevalue[0].slice(0, 10) != this.datevalue[1].slice(0, 10)) {
                    this.$Message.error(this.$t('filter_box.select_one'));
                    // this.$Message({
                    //     message: this.$t('filter_box.select_one'),
                    //     duration: 5000,
                    //     showClose: true,
                    //     type: 'error'
                    // });
                    return;
                }
                if (new Date(this.datevalue[0]).getTime() >= this.timeLine) {
                    url = `${util.internationalUrl}/piwikRead/visitorHistory/exportVisitorHistoryDto?orgId=${this.enterpriseId}&startDate=${this.datevalue[0]}&endDate=${this.datevalue[1]}`;
                } else if (new Date(this.datevalue[1]).getTime() < this.timeLine) {
                    url = `${this.healthFBUrl || util.internationalUrl}/server/exportEnterpriseVisitors?enterpriseId=${this.enterpriseId}&startDate=${this.datevalue[0].slice(0, 10)}&endDate=${this.datevalue[1].slice(0, 10)}`;
                }

                const a = document.createElement('a');
                const filename = `${this.$t('clue.history')}.xlsx`;
                a.href = url;
                a.download = filename;
                a.click();
            },


            // =============================================================== 弃用
            /* 未来可能用到的 */
            // 封装下划线转驼峰的方法 -- 原来想用一个方法直接去转字符，后来发现还有汉字。。。当初右上角写的时候就不能用id去代表一下吗，郁闷
            replaceUnderLine(str) {
                const arr = str.split('');
                const index = arr.indexOf('_');
                arr.splice(index, 2, arr[index + 1].toUpperCase());
                str = arr.join('');
                return str;
            },

            // 去除仪表盘筛选条件
            removeDashBoardFilterCon() {
                // 清空筛选条件
                this.dashBoardFilterCon = null;

                // 刷新表格页
                const that = this;
                this.handleTimeJudgementAll('', function() {
                    that.mergeQueryListP();
                    that.refreshDataP();
                }, function() {
                    that.mergeQueryListO();
                    that.refreshDataO();
                }, function() {
                });
            }
        },
        filters: {
            filterName: function(value) {
                if (value && value.length > 15) {
                    value = `${value.substring(0, 15)}...`;
                }
                return value;
            },
            filterTime1: function(value) {
                const timeStamp = new Date(value);
                const y = timeStamp.getFullYear();
                let mm = timeStamp.getMonth() + 1;
                if (mm < 10) { mm = `0${mm}`; }
                let dd = timeStamp.getDate();
                if (dd < 10) { dd = `0${dd}`; }
                // let h = timeStamp.getHours();
                // let m = timeStamp.getMinutes();
                // let s = timeStamp.getSeconds();
                const stamp1 = `${y}-${mm}-${dd}`;
                // let stamp = `${h}:${m}:${s}`;
                return stamp1;
            },
            filterTime2: function(value) {
                const timeStamp = new Date(value);
                // let y = timeStamp.getFullYear();
                let mm = timeStamp.getMonth() + 1;
                if (mm < 10) { mm = `0${mm}`; }
                let dd = timeStamp.getDate();
                if (dd < 10) { dd = `0${dd}`; }
                const h = timeStamp.getHours();
                const m = timeStamp.getMinutes();
                const s = timeStamp.getSeconds();
                // let stamp1 = `${y}-${mm}-${dd}`;
                const stamp = `${h}:${m}:${s}`;
                return stamp;
            },
            haveChat(value) {
                return value == '1' ? i18n.t('visitor_history.yes') : i18n.t('visitor_history.no');
            }
        },
        watch: {
            showDetail(v){
                console.log(v,'sdddd');
            },
            group: {
                handler(val) {
                    this.changeGroups(val);
                },
                immediate: true
            },
            updatedId: {
                handler(val) {
                    if (val) {
                        // if (this.editIncellData.find(item => item.visitorId === val)) {
                        this.changePage(this.currentPage);
                        // }
                    }
                }
            }
        }
    };
    // 去除字符串两边空格
    // eslint-disable-next-line no-extend-native
    String.prototype.trim = function() {
        return this.replace(/(^\s*)|(\s*$)/g, '');
    };
</script>

<style scoped lang="less">
    .condition3 {
        width:220px;
        margin-right:5px;
    }
    .el-button {
        font-size:12px
    }
    .copy{
        display: inline-block;
    }
    .pagewrap{
        text-align: right;
    }
    .datewrap{
        margin-bottom:15px;
        height: 43px;
        line-height: 43px;
    }
    .datewrap > span{
        float:right;
        position:relative;
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
        width:235px;
        display:inline-block;
    }
    .conditionwrap{
        max-height:136px;
        overflow:auto;
    }
    /* 录入线索样式 */
    .input-clue {
        position: absolute;
        z-index: 99;
        top: 42px;
        left: 370px;
        width: 480px;
        height: 600px;
        background-color: #fff;
        border: 1px solid #d3d3d3;
        overflow: auto;
        border-radius: 3px;
    }
    .input-clue-title {
        text-align: center;
        height: 46px;
        line-height: 46px;
        font-size: 16px;
        font-weight: 700;
        background-color: #000;
        color: #fff
    }
    .clue-label {
        width: 120px;
        display: inline-block;
        margin-right:20px;
        text-align:right;
    }
    .input-clue-body {
        height: 460px;
        overflow: auto;
    }
    .appoint-sale {
        height: 68px;
        background-color: #f0f0f0;
        line-height: 68px;
    }
    .clue-field {
        line-height:66px;
        /* margin-left:60px; */
    }

    .clue-field span:first-child {
        width: 100px;
        height: 66px;
        display: inline-block;
        margin-right:20px;
        text-align:right;
    }

    .other-filter-tags-container {
        display: inline-block;
        position: relative;
        top: -6px;

        /deep/ .el-icon-close {
            margin-left: 0;
            color: #a9b9c9;
            font-size: 16px;
            font-weight: bold;

            &:hover {
                background-color: transparent;
            }
        }

        /deep/ .el-tag {
            height: 32px;
            line-height: 31px;
            border-radius: 16px;
            border-color: #F5F6F9;
            background-color: #F5F6F9;
            margin: 0 4px 0 0;
            color: rgba(0, 0, 0, .8);

            &:hover {
                background-color: #E6EFFF;
            }

            span{
                display: inline-block !important;
                vertical-align: top;
            }
        }
    }

    .useDashBoardFilterConTip {
        background: #fff7f2;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        padding: 0 30px;
    }

    .visitor-history__hasDashBoardFilterCon {
        /deep/ .filter-component, /deep/ .filter-tags-container {
            pointer-events: none;
            visibility: hidden;
        }
    }
</style>

<style lang="less" >
    .el-tooltip__popper {
        max-width: 300px;
    }
    /* 访客详情 */
    .drawer-close-button-moveUp {
        .ivu-drawer-close {
            top: 0;
            right: 0;
            .ivu-icon {
                font-size: 26px;
                background-color: #FFF;
                color: #495060;
                opacity: .5;
                border-radius: 20%;
            }
        }
    }

    /* 检索历史展示处样式 */
    .search-item {
        height: 28px;
        line-height: 28px;
        font-size: 14px;
        margin-bottom: 10px;
        border-radius: 4px;
        padding: 0 10px 0 10px;
        cursor: pointer;
    }
    .search-item:hover {
        background-color: #eee;
    }
    .delete-search {
        float:right;
        /* margin-right:8px; */
    }
    .edit-search {
        float: right;
        margin-right: 6px;
    }

    .tabmain{
        .show-edit-btn {
            display: none;
            cursor: pointer;
            margin-left: -10px;
        }
        .web-remark:hover .show-edit-btn {
            display: inline-block;
        }
    }
    /*  */
    .visitor-history {
        .el-button--text {
            color: rgba(0, 0, 0, 0.8);
            &:hover {
                color: #4285f4;
            }
        }
        .slot{
            white-space: normal;
        }
        .ivu-btn-text:hover {
            color: #4285f4;
            background-color: transparent !important;
            border-color: transparent !important;
        }
        .ivu-table-cell {
            overflow:visible;
            padding-left: 14px;
            padding-right: 16px;
        }
        /* 录入线索模态框 */
        .clue-item input{
            border: 2px solid #dddee1;
        }
        .ivu-select-item {
            text-align: left;
        }
        /* 超出部分隐藏 */
        td.ivu-table-column-center span
        {
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
        }
        /* 超出部分显示 */
        td.ivu-table-column-center:hover span
        {
            // text-overflow:inherit;
            // overflow: visible;
            // white-space: pre-line;
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
        }
        /* 编辑按钮的隐藏 */
        .ivu-col-span-2 .ivu-btn {
            padding:0 !important;
        }


        // .hover-row .show-edit-btn {
        //     display: inline-block;
        // }
        /* .show-edit-btn {
            display: block !important;
            margin-left: -10px !important;
        } */
        .ivu-table-column-center:hover .show-edit-btn {
            display: block !important;
            margin-left: -10px !important;
        }
        li {
            list-style: none;
        }
        table {
            width:100% !important;
        }
        .visitor-content {
            background-color: #fff;
        }
        /* .ivu-table-body {
      overflow-x:scroll;
    } */
        /*.tabmain>.ivu-table td,.tabmain>.ivu-table th{*/
        /*text-align:center;*/
        /*}*/
        .el-table tr {
            font-size: 12px;
            height: 48px !important;
            td {
                padding: 0 !important;
            }
        }

        /*.tabmain>.ivu-table tbody tr:hover td{*/
        /*    background:#f8f8f9;*/
        /*    color:#FA8241;*/
        /*}*/
        .checkboxgroup>label{
            display:inline-block;
            margin-bottom:5px;
        }
        .datewrap{
            .ivu-poptip-body-content{
                white-space: normal;
            }
        }
        .conditionmain>.ivu-select .ivu-select-dropdown{
            max-height:140px;
        }
        /* 检索历史展示处样式 */
        .search-item {
            height: 28px;
            line-height: 28px;
            font-size: 14px;
            margin-bottom: 10px;
            border-radius: 4px;
            padding: 0 10px 0 10px;
            cursor: pointer;
        }
        .search-item:hover {
            background-color: #eee;
        }
        .edit-search {
            float: right;
            margin-right: 6px;
        }
        /*  */
        .ivu-modal-header-inner {
            color:#fff !important;
        }
        /*  */
        .input-clue-body::-webkit-scrollbar {
            width: 4px;
            height: 10px;
            background-color: #c9c9c9;
        }

        .input-clue-body::-webkit-scrollbar-track {
            border-radius: 2px;
            background-color: #c9c9c9;
        }
        .input-clue-body::-webkit-scrollbar-thumb {
            border-radius: 5px;
            background-color: #fc8b2f;
        }
        /* 固定列错位 */
        .ivu-table>.ivu-table-fixed ,
        .ivu-table>.ivu-table-fixed-right{
            height: 100%;
            overflow: hidden;
        }
        .ivu-row .edittable-table-height-con {
            height:100%;
        }
    }

    .ivu-table-fixed-right-header {
        top:0px !important;
    }

    .delete-search {
        float:right;
        /* margin-right:8px; */
    }
</style>
