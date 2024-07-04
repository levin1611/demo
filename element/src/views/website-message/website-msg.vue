<template>
    <div class="main-body">
        <div class="adgroup">
            <div class="table_wrap">
                <div class="datewrap" style="position: relative; line-height: 1;">
                    <Dropdown trigger="click"
                              @visible-change="visibleChange"
                              @command="formSelect($event, 'dropdown')"
                              size="medium"
                              v-show="!isRequestError"
                              placement="bottom-start">
                        <h1 class="title" style="cursor: pointer;line-height: normal;font-weight: 500;font-size: 16px;color: #2d2f2e;">
                            {{formModelName}}
                            <Icon custom="custom custom-menu-arrow" color="#7B98B6" size="10"></Icon>
                        </h1>
                        <DropdownMenu slot="dropdown"
                                      style="max-height: 190px; overflow-y: scroll;">
                            <DropdownItem v-for="item in formList"
                                          :selected="formModel === item.id"
                                          :command="item.id">{{ item.cname }}
                                <span style="float: right;margin-left: 10px;">{{ item.count || '' }}</span>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    &nbsp;&nbsp;&nbsp;
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
                      :langObj="lang_company"
                      :width="600"
                      @emptySort="empty_sort"
                      @removeCon="remove_filter_tag"
                      @change_filter_tag="change_filter_tag"></FilterTags>
                    <span>
                        <!-- 右上角筛选 -->
                        <Poptip width="540"
                                trigger="click"
                                placement="bottom-end">
                            <!-- trigger -->
                            <Button slot="reference"
                                    type="text"
                                    icon="custom custom-table-filter"
                                    :style="filtering ? 'color:#4285f4' : ''">&nbsp;&nbsp;&nbsp;{{ $t('website.condition') }}</Button>
                            <!-- content -->
                            <div style="overflow: hidden">
                                <!-- 筛选面板 -->
                                <div style="padding: 0 10px 10px 10px">
                                    <!-- 自定义检索 -->
                                    <div>
                                        <!-- 筛选条件 -->
                                        <div>
                                            <div class="filter-tips">{{ $t('filter_box.filter_con') }}</div>
                                            <!-- 之后添加的筛选 -->
                                            <div class="conditionwrap">
                                                <div v-for="(add, index) in addcondition" class="conditionmain">
                                                    <!-- 筛选项 -->
                                                    <Select v-model="add.condition1"
                                                            size="small"
                                                            @change="addchangecon1(index)"
                                                            style="width:120px;margin-right:15px;float:left;">
                                                        <Option v-for="item in add.conditionlist1"
                                                                :key="item.value"
                                                                :value="item.value"
                                                                :label="item.label"></Option>
                                                    </Select>
                                                    <!-- 筛选条件 -->
                                                    <Select v-model="add.condition2"
                                                            size="small"
                                                            style="width:90px;margin-right:15px;float:left;">
                                                        <Option v-for="item in add.conditionlist2"
                                                                :value="item.value"
                                                                :label="item.label">{{ item.label }}</Option>
                                                    </Select>
                                                    <!-- 筛选值 -->
                                                    <div style="margin-bottom:10px;">
                                                        <!-- 文本型 -->
                                                        <Input v-if="add.inputType === 'string'"
                                                               v-model="add.condition3"
                                                               size="small"
                                                               :placeholder="$t('website.keywordHolder')"></Input>
                                                        <!-- 日期型 -->
                                                        <DatePicker v-else-if="add.inputType === 'date'"
                                                                    v-model="add.condition3"
                                                                    type="daterange"
                                                                    format="yyyy-MM-dd"
                                                                    placement="bottom-end"
                                                                    :placeholder="$t('datepickerHolder')"
                                                                    size="small"></DatePicker>
                                                        <!-- 选择型 -->
                                                        <Select v-else-if="add.inputType === 'select'"
                                                                v-model="add.condition3"
                                                                size="small">
                                                            <Option v-for="item in add.conditionlist3"
                                                                    :key="item.value"
                                                                    :value="item.value"
                                                                    :label="item.label">{{ item.label }}</Option>
                                                        </Select>
                                                    </div>
                                                    <!-- 添加条件 -->
                                                    <template v-if="index === 0">
                                                        <span @click="addclick">
                                                            <Icon
                                                                size="15"
                                                                class="custom custom-add-circle"
                                                                style='cursor:pointer;display:inline-block;'></Icon>
                                                        </span>
                                                    </template>
                                                    <!-- 删除当前筛选 -->
                                                    <template v-else>
                                                        <span @click="removeclick(index)">
                                                            <Icon
                                                                size="15"
                                                                class="custom custom-reduce-circle"
                                                                style='cursor:pointer;display:inline-block;'></Icon>
                                                        </span>
                                                    </template>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- 底部按钮 -->
                                        <div style="margin-top: 10px;text-align: right"
                                             class="btn clearfloat">
                                            <!-- 筛选 -->
                                            <Button type="primary"
                                                    size="small"
                                                    @click="searchdata">{{ $t('filter_box.filter') }}</Button>
                                            <!-- 清空 -->
                                            <Button size="small"
                                                    @click="empty">{{ $t('filter_box.empty') }}</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Poptip>

                        <Button v-if="authorized_button['export']"
                                type="text"
                                icon="custom custom-file-download"
                                @click="exportData"
                                style="margin-left: 15px">&nbsp;&nbsp;&nbsp;{{$t('website.exportData')}}</Button>
                    </span>
                </div>

                <!-- 修改字段 -->
                <EditColumns
                        :visible.sync="visible_edit_columns"
                        :columnType="columnType"
                        :templateId="formModel"
                        :id.sync="id_column_show_order"
                        :allColumns="allColumns"
                        :allGroup="allGroup"
                        :group.sync="group">
                </EditColumns>

                <div v-loading="loading" class="_min_height_100" :style="{minHeight:tableHeight-100+'px'}">
                    <div class="table edittable-table-height-con" v-show="initTable">
                        <Table v-if="refreshColumn"
                               :data="data1"
                               :height="tableHeight"
                               size="medium"
                               :isCustom="true"
                               :customEmptyText="customEmptyTextLang"
                               :customEmptyButtonText="customEmptyButtonTextLang"
                               :customClearMethod="clearFilterConditionByInitView"
                               :border="true"
                               :header-cell-class-name="headerCellClass"
                               highlight-current-row
                               ref="table"
                               @row-click="getDetailById"
                               @mousemove.native="handleTableColHover"
                               @mousedown.native="handleTableColResizeStart"
                               @header-dragend="handleTableColResizeEnd"
                               class="tabmain noBoxShadow-right noborder-table resizable-table">
                            <template v-for="item in currentColumns">
                                <TableColumn v-if="item.key === 'remark'"
                                             :key="item.key"
                                             :prop="item.key"
                                             :label="item.title"
                                             :width="item.width"
                                             :render-header="item.renderHeader"
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
                                            <Col :span="3"
                                                 :offset="scope.row.remark ? 0 : 21">
                                                <span v-if="authorized_button['remark']"
                                                      @click.stop="clickEditIcon(scope.row, scope.$index)"
                                                      class="show-edit-btn">
                                                    <i class="custom custom-edit"
                                                       style="font-size: 12px"></i>
                                                </span>
                                            </Col>
                                        </Row>
                                    </template>
                                </TableColumn>
                                <TableColumn v-else-if="item.key === 'createTime'"
                                             :key="item.key"
                                             :prop="item.key"
                                             :label="item.title"
                                             :width="item.width"
                                             :render-header="item.renderHeader"
                                             show-overflow-tooltip>
                                    <template slot-scope="{row}">
                                        <span>{{ row.createTime | timeFormat("DateTimeHm")}}</span>
                                    </template>
                                </TableColumn>
                                <TableColumn v-else-if="item.key === 'status'"
                                             :key="item.key"
                                             :prop="item.key"
                                             :label="item.title"
                                             :width="item.width"
                                             :render-header="item.renderHeader"
                                             show-overflow-tooltip>
                                    <template slot-scope="{row}">
                                        <span>{{ row.status | filterStatus}}</span>
                                    </template>
                                </TableColumn>
                                <TableColumn v-else
                                             :key="item.key"
                                             :prop="item.key"
                                             :label="item.title"
                                             :width="item.width"
                                             :render-header="item.renderHeader"
                                             show-overflow-tooltip>
                                    <!--                            <template slot-scope="{scope}">-->
                                    <!--                                <span>{{ item.key }}</span>-->
                                    <!--                            </template>-->
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
                        <!-- 分页 -->
                        <div style="margin-right: 30px;overflow: hidden;">
                            <Page :page-sizes="pagesizeopts" ref="pages" :total="totalpage" :current-page="curpage"
                                  :page-size="pagesize"
                                  @current-change="changePage" @size-change="sizeChange"
                                  layout='total, prev, pager, next, sizes, jumper, ->'
                                  class="pageWrap-right"></Page>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 编辑备注 -->
        <Modal :visible.sync="editRemarkVisible"
               :title="$t('website.remark')"
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
                <Button size="small"
                        @click="cancleChangeRemark">{{ $t('cancel') }}</Button>
                <Button size="small"
                        type="primary"
                        :loading="isChangeSucc"
                        @click="sureChangeRemark">{{ $t('confirm') }}</Button>
            </div>
        </Modal>

        <!-- 详情页 -->
        <VisitorDetail
                :type="'webMsg'"
                ref="visitorDetails"
                :row="currentRowTemp"
                :timeLine="timeLine"
                :index="currentIndex"
                :key="updateKey"
                :showDetail.sync="showDetail"
                @changeRowData="changeRowData">
        </VisitorDetail>


        <!--<span ref="CopyUrl" style="display: none;"-->
        <!--      v-clipboard:copy="currUrl"-->
        <!--      v-clipboard:success="onCopy"-->
        <!--      v-clipboard:error="onError"></span>-->

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
    import VisitorDetail from '../visitor-history/components/visitor-detail.vue';
    import FilterTags from '@/views/main-components/filter-tags';
    import EditColumns from '@/views/crm/Table/Components/Modal/editColumns';
    import util from '@/libs/util';
    import Utils from '@/utils/index';
    import i18n from '@/locale';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { mapState } from 'vuex';
    import resetInitComponents from '@/mixins/resetComponentViewData';
    import tableColResize from '@/mixins/tableColResize';

    const emailReg = Utils.regExp.fullEmail;
    const telReg = Utils.regExp.fullPhone;
    const debounce = (func, wait) => {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;

            if (timeout) clearTimeout(timeout);

            const callNow = !timeout;
            timeout = setTimeout(() => {
                timeout = null;
            }, wait);
            if (callNow) func.apply(context, args);
        };
    };
    export default {
        mixins: [resetInitComponents, tableColResize],
        name: 'website_message',
        components: {
            // canEditTable,
            VisitorDetail,
            FilterTags,
            EditColumns
            // timeLine
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                button_list: state => state.app.button_list,
                updatedId: state => state.website_msg.updatedId,
                window_height: state => state.window_height,
                fullName: state => state.fullName
            }), // 从 vuex 中获取属性
            tableHeight() {
                let temp = this.window_height ? this.window_height - 180 : document.body.clientHeight - 180;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            },
            authorized_button() {
                const websiteMsg = BUTTON_IDS.website.websiteMsg;
                return {
                    // enterClue: !HANDLE_BUTTON(websiteMsg.enterClue, this.button_list),
                    // remove: !HANDLE_BUTTON(websiteMsg.remove, this.button_list),
                    remark: !HANDLE_BUTTON(websiteMsg.remark, this.button_list),
                    export: !HANDLE_BUTTON(websiteMsg.export, this.button_list)
                };
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
            },
            // 所有表格列对应的 column.key
            allGroup() {
                return this.allColumns.map(item => item.key);
            }
        },
        filters: {
            filterStatus: function(val) {
                switch (val) {
                    case 4:
                        return i18n.t('mail.other_leads');
                    case 6:
                        return i18n.t('mail.otherContact');
                    case 9:
                        return i18n.t('mail.other_customers');
                    case 2:
                        return i18n.t('mail.my_leads');
                    case 5:
                        return i18n.t('mail.myContact');
                    case 7:
                        return i18n.t('mail.my_customers');
                    case 3:
                        return i18n.t('mail.public_leads');
                    case 8:
                        return i18n.t('mail.public_customers');
                    case 1:
                    default:
                        return i18n.t('mail.untreatedDocumented');
                }
                // switch (val) {
                //     case 1:
                //         return i18n.t('clue.unfollowed'); // 未处理
                //     case 100:
                //     case 3:
                //         return i18n.t('chat.nothingWith'); // 无关
                //     case 101:
                //     case 2:
                //         return i18n.t('clue.clue'); // 线索 101
                //     case 102:
                //         return i18n.t('clue.inquiry'); // 询盘 102
                //     case 103:
                //         return i18n.t('clue.secondConsultation');
                //     default:
                //         return i18n.t('clue.unfollowed');
                // }
            }
        },
        data() {
            return {
                isChangeSucc: false,
                editRemarkVisible: false,
                editIndex: -1,
                editRow: '',
                editRemark: '',
                refreshColumn: true,
                currentColumns: [],
                // 当表单列表相关的接口出错时隐藏表单下拉
                isRequestError: false,
                cancelFunc: null,
                // 新增时间线-- 确保访客详情有piwik之分
                onLineTime: '2019-06-01 00:00:00',
                timeLine: '',
                /* 筛选 */
                order_column: '',
                order_type: '',
                config_tableFilter: {
                    proj: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    currentUrl: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    sourceUrl: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    createTime: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型, string / date / select / countryArea
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
                        }, // 时间选项
                        query: [], // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null

                    },
                    remark: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型, string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    status: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型, string / date / select / countryArea
                        query: [], // 筛选值, 对应上述类型: '' / [] / [] / ''
                        allList: [
                            // { value: 100, label: this.$t('chat.nothingWith') },
                            // { value: 101, label: this.$t('clue.clue') },
                            // { value: 102, label: this.$t('clue.inquiry') },
                            // { label: this.$t('clue.secondConsultation'), value: 103 }
                        ] // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    }
                },
                lang_company: {
                    // 默认字段
                    proj: this.$t('website.proj'),
                    currentUrl: this.$t('website.currentUrl'),
                    sourceUrl: this.$t('website.sourceUrl'),
                    createTime: this.$t('website.createTime'),
                    remark: this.$t('website.remark'),
                    status: this.$t('website.operate')
                },
                // 表头筛选条件
                sqlList_tableFilter: {},
                storageName_orderColumn: '',
                queryData: {
                    $and: []
                },
                json_data: {},

                /* 修改字段 */
                visible_edit_columns: false, // 显隐
                columnType: 11, // 字段所属模块 1客户2联系人3询盘4公海客户5线索6公海线索 7fbleads  11网站留言
                id_column_show_order: undefined, // 获取和更新字段顺序所需的 ID
                group: [], // 所有 column 的已排序的 key
                // 保存到后端的字段属性, 目前只有 width
                fieldStyle: {},

                currUrl: '',
                currentRow: {}, // 当前行数据
                currentRowTemp: {},
                currentIndex: -1,
                showDetail: false,
                delLoading: false, // 弹出框loading
                loading: true, // 加载图标
                initTable: false,
                allColumns: [], // 表格全部列
                data1: [],
                totalpage: 0,
                curpage: 1,
                pagesize: 10,
                maxpagenum: 1,
                pagesizeopts: [10, 20, 30, 50],
                parentTempateId: '',
                formModel: '', // 选中的表单
                formModelName: '', // 选中的表单
                countToForm: {},
                formList: [], // 表单列表
                visibleChange: debounce((visible) => {
                    if (visible) {
                        this.getTemplateList(1);
                    }
                }, 3000),

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
                conditionlist1: [], // 筛选字段：字段列表
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
                list_commonSearch: [], // 常用检索列表
                id_selected_commonSearch: -1, // 当前常用检索 id
                common_conditions: [], // 当前常用检索项的检索数据
                // 删除常用检索确认弹窗
                loading_deleteCommonSearch: false,
                deleteCommonSearchVisible: false,
                deleteCommonSearchId: '',
                deleteCommonSearchName: '',
                lang_fixed_columns: {
                    a1001: this.$t('crm.InqSet.corp_companyName'),
                    a1002: this.$t('crm.InqSet.corp_mainProduct'),
                    a1003: this.$t('crm.InqSet.corp_countryArea'),
                    a1004: this.$t('crm.InqSet.corp_homePage'),
                    a1005: this.$t('crm.InqSet.corp_fax'),
                    a1006: this.$t('crm.InqSet.corp_phone'),
                    a1007: this.$t('crm.InqSet.corp_contactAddress'),
                    a1008: this.$t('crm.InqSet.corp_companyRemark'),
                    a1009: this.$t('crm.InqSet.contact_nickName'),
                    a10010: this.$t('crm.InqSet.contact_email'),
                    a10011: this.$t('crm.InqSet.contact_jobTitle'),
                    a10012: this.$t('crm.InqSet.contact_phone'),
                    a10013: this.$t('crm.InqSet.contact_socialNetworkingPlatform'),
                    a10014: this.$t('crm.InqSet.contact_gender'),
                    a10015: this.$t('crm.InqSet.contact_remark'),
                    a10016: this.$t('crm.InqSet.inq_demandProducts'),
                    a10017: this.$t('crm.InqSet.inq_label'),
                    a10018: this.$t('crm.InqSet.inq_productCategory'),
                    a10019: this.$t('crm.InqSet.inq_sourceChannel'),
                    a10020: this.$t('crm.InqSet.inq_sourceWay'),
                    a10021: this.$t('crm.InqSet.inq_remark'),
                    a10052: this.$t('crm.InqSet.contact_whatsApp'),
                    a10053: this.$t('crm.InqSet.contact_instagram'),
                    a10055: this.$t('crm.InqSet.corp_clientType'),
                    a10056: this.$t('crm.Table.col_customerSource'),
                    clueClass: this.$t('crm.InqSet.corp_leadLevel')
                },

                initial_filter_cons: null,
                updateKey: '',

                // 仪表盘跳转的筛选条件
                dashBoardFilterCon: null
            };
        },
        mounted() {
        },
        created() {
            this.$set(this.config_tableFilter.status, 'allList', this.crmStatusList);
            this.isRequestError = false;
            this.timeLine = new Date(this.onLineTime).getTime();
            this.getTemplateId();
            this.dateformat();
            // this.get_commonSearch();
        },
        deactivated() {
            this.showDetail = false;
            // document.getElementsByClassName('single-page')[0].removeEventListener('click', this.click_blank);
        },
        activated() { /* keep-alive  生命周期函数每次进入页面都有 不管是否缓存了组件 */

        },
        methods: {
            // filterTags 组件内部修改筛选值后触发的方法, 由下方的 updateList 改造而成
            change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    const column = this.allColumns.find(item => item.key === key);
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
                                                item.value === null ? temp[con].$null = -1 : temp[con][type] = item.value;
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
                                        this.$set(this.config_tableFilter[key], 'query', []);
                                        //                                        this.config_tableFilter[key].query = [];
                                        this.$delete(this.sqlList_tableFilter, con);
                                    }
                                    break;
                            }
                            this.allColumns = this.allColumns.map((item, index) => {
                                if (item.key === key) {
                                    item.filtering = true;
                                }
                                return item;
                            });
                        } else {
                            this.$delete(this.sqlList_tableFilter, con);
                            this.allColumns = this.allColumns.map((item, index) => {
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
                if (this.dashBoardFilterCon) {
                    // 有从仪表盘带过来的筛选条件, 不使用初始筛选条件, 直接刷新
                    this.merge_query_list();
                    this.curpage = 1;
                    this.refreshData();

                    return;
                }

                // 否则, 进行初始条件筛选

                // 如果初始筛选条件为空, 则把"创建时间为近七天"设置为初始筛选条件
                if (!this.initial_filter_cons) {
                    const day1 = Date.now() - 6 * 24 * 60 * 60 * 1000;
                    const timeRange = [day1, Date.now()].map(item => {
                        return this.$options.filters.timeFormat(item);
                    });
                    this.initial_filter_cons = new Map([
                        ['createTime', [(`${timeRange[0]} 00:00:00`), (`${timeRange[1]} 23:59:59`)]]
                    ]);
                }

                // this.order_column = 'leaveTime' // 排序字段在数据库中的数据名
                // this.order_type = 'desc' // 排序类型
                // this.storageName_orderColumn = 'leaveTime', // 排序字段
                this.allColumns = this.allColumns.map(col => {
                    if (this.config_tableFilter.hasOwnProperty(col.key)) {
                        col.filtering = this.initial_filter_cons.get(col.key) ? this.init_filter(col.key, col.title, this.initial_filter_cons.get(col.key)) : false;
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
                                        result.$eq = val.map(item => item.value);
                                        break;
                                    default:
                                        result.$or = val.map(item => {
                                            const temp = {};
                                            temp[con] = {};
                                            item.value === null ? temp[con].$null = -1 : temp[con].$eq = item.value;
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
            changeRowData({ row, key, value, index }) {
                if (key === 'crmStatus') {
                    // this.$refs.table3.thisTableData[index].status = value;
                    // this.$refs.table3.edittingStore[index].status = value;
                    // this.currentRow.status = value;
                    this.$set(row, key, value);
                    this.$refs.visitorDetails.getInfoById();
                }
                // this.$set(row,key,temp)
            },
            async getDetailById(row, column, event) {
                // 特殊字段, 点击复制, 不弹出详情页
                if ([this.$t('website.currentUrl'), this.$t('website.sourceUrl')].includes(column.label) && row[column.property]) {
                    this.$copyText(row[column.property]).then(this.onCopy, this.onError);
                    return;
                }
                // 复制数据, 不弹出详情页
                const explorer = window.navigator.userAgent;
                let selector = '';
                if (explorer.indexOf('MSIE') >= 0 || explorer.indexOf('Opera') >= 0) {
                    const selected = document.selection.createRange();
                    selector = selected.text;
                } else {
                    selector = window.getSelection();
                }
                if (selector.type === 'Range' || document.activeElement.tagName === 'INPUT') {
                    return;
                }
                // 部分特定 class 元素, 点击不弹出详情页
                const excludeClassNames = [
                    'custom-edit',
                    'show-edit-btn'
                ];
                if (event && event.target && event.target.classList) {
                    const classList = event.target.classList;
                    if (excludeClassNames.some(item => classList.contains(item))) {
                        return;
                    }
                }

                // 否则显示详情页
                let piwikFlag = 0;
                if (row.createTime >= new Date(this.onLineTime).getTime()) {
                    piwikFlag = 1;
                } else {
                    piwikFlag = 0;
                }
                row.visitorId = row.proj || row.seqNumber;
                row.crmStatus = row.status;
                row.templateId = this.parentTempateId;
                row.sourceName = this.formModel;
                row.piwikFlag = piwikFlag;
                // this.currentIndex = 2;
                this.currentRowTemp = row;
                this.showDetail = true;
                // 生成触点信息
                util.ajaxJson({
                    url: '/form-cust/newtenant/touchpoint/genFormTouchPoint',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        visitorId: row.visitorId
                    }
                }).then(response => {
                });
            },
            formSelect(val, operateType) {
                // 手动下拉切换表单
                if (operateType === 'dropdown') {
                    // 去掉仪表盘筛选条件
                    if (this.dashBoardFilterCon) {
                        this.dashBoardFilterCon = null;
                    }
                }

                this.formModel = val;
                const form = this.formList.filter(item => {
                    if (item.id === val) {
                        this.formModelName = item.cname;
                        return item;
                    }
                });
                this.order_column = '';
                this.order_type = '';
                for (const item in this.config_tableFilter) {
                    let temp;
                    // 筛选类型, string / date / select / countryArea
                    // 筛选值, 对应上述类型: '' / [] / [] / ''
                    switch (this.config_tableFilter[item].filterType) {
                        case 'string':
                            temp = '';
                            break;
                        case 'date':
                        case 'select':
                        case 'countryArea':
                            temp = [];
                            break;
                    }
                    this.$set(this.config_tableFilter[item], 'query', temp);

                    // 设置表格 filtering 为 false , 并从表头筛选条件对象中去掉对应筛选项
                    const index = this.allColumns.findIndex(i => i.key === item);
                    if (index !== -1) {
                        const col = this.allColumns[index];
                        col.filtering = false;
                        this.$set(this.allColumns, index, col);

                        this.$delete(this.sqlList_tableFilter, this.getSearchCon(col.key));
                    }
                }

                // AMP表单访客编号显示seqNumber
                if (form[0].cateType == 2) {
                    this.getColumnList('AMP');
                } else {
                    this.getColumnList();
                }
            },
            // on_cancle_clue(data) {
            //     this.inputClue = data.close;
            // },
            // open_close(data) {
            //     this.inputClue = data.close;
            //     if (data.Status !== undefined) {
            //         // this.editIncellData[this.currentIndex].status = 101;
            //         this.$refs.table3.thisTableData[this.currentIndex].status = 101;
            //         this.$refs.table3.edittingStore[this.currentIndex].status = 101;
            //     }
            // },
            /* 获得模板id */
            getTemplateId() {
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.parentTempateId = response.data.data.template.id;
                        this.getTemplateList(0);
                    }
                }).catch(error => {
                    this.isRequestError = true;
                    this.loading = false;
                    console.error('website getXSShow', error);
                });
            },
            /* 加载表单列表 */
            //            flag:0初始化界面；flag:1点开表单下拉列表，只更新一下列表
            getTemplateList(flag) {
                const p1 = new Promise((resolve, reject) => {
                    util.ajax({
                        url: '/form-cust/form/getUnprocessedFormValue',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            resolve(response.data);
                        } else {
                            reject();
                        }
                    }).catch(() => {
                        // this.isRequestError = true;
                        this.loading = false;
                    });
                });

                const p2 = new Promise((resolve, reject) => {
                    util.ajax({
                        url: '/form-cust/template/getFormTemplateSortedList',
                        method: 'post',
                        data: {
                            billType: 1,
                            status: -1,
                            orgId: this.enterpriseId
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            resolve(response.data);
                        } else {
                            reject();
                        }
                    }).catch(() => {
                        this.isRequestError = true;
                        this.loading = false;
                    });
                });

                Promise.all([p1, p2]).then((result) => {
                    // 表单对应的数字
                    this.countToForm = result[0].data;
                    // v-if="item.cateType!==1"
                    const List = result[1].data.filter(item => {
                        if (item.cateType !== 1) {
                            item.count = this.countToForm[item.id] ? parseInt(this.countToForm[item.id]) : 0;
                            return item;
                        }
                    });
                    this.formList = List;
                    // 更新 vuex 中的 formList
                    this.$store.commit('website_msg/updateFormList', List);

                    // 暂存仪表盘带参数跳转数据
                    const dashBoardFilterCon = localStorage.getItem('dashboard_websiteMsg_filter');
                    localStorage.removeItem('dashboard_websiteMsg_filter');

                    // 判断是否带参数跳过来, 目前只处理一种情况 --- "指定表单 ID , 跳转到该表单并设置初始筛选条件为'状态为未处理'"
                    if (this.$route.params.formId) {
                        const formId = this.$route.params.formId;
                        delete this.$route.params.formId;
                        if (this.formList.find(item => item.id === formId)) {
                            // 如果在 formList 中找到了 formId
                            // 指定表单为 formId 对应表单
                            this.formModel = formId;

                            // 设置初始筛选条件为'状态为未处理'
                            this.initial_filter_cons = new Map([
                                ['status', [{
                                    value: 1,
                                    label: this.$t('clue.unfollowed')
                                }]]
                            ]);
                        }
                    } else if (dashBoardFilterCon) {
                        // 如果有从仪表盘带过来的筛选条件

                        let formId;
                        try {
                            const tmp = JSON.parse(dashBoardFilterCon);
                            formId = tmp.templateId;
                        } catch (e) {
                            console.error(e);
                        }

                        // 指定表单为仪表盘带过来的表单
                        if (formId && this.formList.find(item => item.id === formId)) {
                            this.formModel = formId;

                            // 保存筛选条件数据, 后续参与表格初始化筛选
                            this.dashBoardFilterCon = dashBoardFilterCon;
                        }
                    }

                    if (flag === 0) {
                        // 点击弹窗提醒进入
                        if (this.$route.query.contacts) {
                            List.map(item => {
                                if (item.cname === this.$route.query.contacts) {
                                    this.formModel = item.id;
                                    this.formSelect(this.formModel);
                                }
                            });
                        } else {
                            if (List.length > 0) {
                                let temp = 0;
                                // 过滤掉fb表单（cateType=1）
                                if (List[0].cateType === 1) {
                                    temp = 1;
                                } else {
                                    temp = 0;
                                }
                                if (List.length > temp) {
                                    // 如果已经有表单 id , 切换到指定表单, 否则切换到首个表单
                                    this.formModel = this.formModel || List[temp].id;
                                    this.formSelect(this.formModel);
                                } else {
                                    this.loading = false;
                                }
                            }
                        }
                    }
                });
            },
            /* 获取表头 */
            getColumnList(type) {
                this.loading = true;
                util.ajax({
                    url: '/form-cust/form/getColumns',
                    method: 'post',
                    data: {
                        templateId: this.formModel,
                        isShow: 1,
                        orgId: this.enterpriseId,
                        userId: this.userId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        let columnList;
                        if (type === 'AMP') {
                            columnList = [
                                {
                                    title: this.$t('website.AMPMsg'),
                                    key: 'seqNumber',
                                    align: 'center',
                                    width: 220
                                }
                            ];
                        } else {
                            columnList = [
                                {
                                    title: this.$t('website.proj'),
                                    key: 'proj',
                                    width: 220
                                }
                            ];
                        }

                        const groupTemp = [
                            {
                                value: 'proj',
                                label: this.$t('website.proj')
                            }
                        ];
                        const showList = response.data.data;
                        for (const key in showList) {
                            groupTemp.push({
                                value: key,
                                label: this.lang_fixed_columns[key] || showList[key].name
                            });
                            if (key.indexOf('a100') !== -1) {
                                const keyTemp = `b${key}`;
                                columnList.push({
                                    title: this.lang_fixed_columns[key] || showList[key].name,
                                    key: keyTemp,
                                    minWidth: 180,
                                    width: 180
                                });

                                let filter_type = 'string';
                                let queryTemp = '';
                                let allListTemp;
                                switch (showList[key].type) {
                                    case 'date':
                                        filter_type = 'date';
                                        queryTemp = [];
                                        break;
                                    case 'select':
                                        filter_type = 'select';
                                        queryTemp = [];
                                        allListTemp = showList[key].option.split('?').map(item => {
                                            return {
                                                value: item,
                                                label: item
                                            };
                                        });
                                        allListTemp.push({
                                            value: null,
                                            label: '空(未填写)'
                                        });
                                        break;
                                    case 'selectMultiple':
                                        filter_type = 'select';
                                        queryTemp = [];
                                        allListTemp = showList[key].option.split('?').map(item => {
                                            return {
                                                value: item,
                                                label: item
                                            };
                                        });
                                        allListTemp.push({
                                            value: null,
                                            label: '空(未填写)'
                                        });
                                        break;
                                    default:
                                        break;
                                }
                                this.$set(
                                    this.config_tableFilter, keyTemp,
                                    {
                                        sort: true, // 是否允许排序
                                        filter: true, // 是否允许筛选
                                        filterType: filter_type, // 筛选类型, string / date / select / countryArea
                                        query: queryTemp, // 筛选值, 对应上述类型: '' / [] / [] / ''
                                        allList: allListTemp // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                                    }
                                );
                                this.lang_company[key] = this.lang_fixed_columns[key] || showList[key].name;
                            } else {
                                columnList.push({
                                    title: this.lang_fixed_columns[key] || showList[key].name,
                                    key,
                                    minWidth: 120,
                                    width: 120
                                });
                            }
                        }
                        this.conditionlist1 = groupTemp.concat([
                            {
                                value: 'currentUrl',
                                label: this.$t('website.currentUrl')
                            },
                            {
                                value: 'sourceUrl',
                                label: this.$t('website.sourceUrl')
                            },
                            // {
                            //     value: 'createTime',
                            //     label: this.$t('website.createTime')
                            // },
                            {
                                value: 'remark',
                                label: this.$t('website.remark')
                            },
                            {
                                value: 'status',
                                label: this.$t('website.operate')
                            }
                        ]);
                        columnList = columnList.concat([
                            {
                                title: this.$t('website.currentUrl'),
                                width: 200,
                                key: 'currentUrl'
                            },
                            {
                                title: this.$t('website.sourceUrl'),
                                width: 200,
                                key: 'sourceUrl',
                                toolTip: true
                            },
                            {
                                title: this.$t('website.createTime'),
                                key: 'createTime',
                                width: 150
                            },
                            {
                                title: this.$t('website.remark'),
                                key: 'remark',
                                width: 135,
                                editable: true,
                                className: 'edit-cell',
                                tooltip: true
                            },
                            {
                                title: this.$t('website.operate'),
                                key: 'status',
                                width: 120
                            }
                        ]);
                        this.allColumns = columnList;
                        /* 配置表头筛选 */
                        this.allColumns = this.allColumns.map((col, index) => {
                            if (this.config_tableFilter.hasOwnProperty(col.key)) {
                                col.show_filter_content = false;
                                col.filtering = false;
                                col.renderHeader = this.renderHeader_filter();
                            } else {
                                col.renderHeader = this.renderHeader_text(index);
                            }
                            return col;
                        });
                        //  this.loading = false

                        // this.getFieldOrderList();
                        this.addcondition = [{
                            condition1: '',
                            conditionlist1: this.conditionlist1,
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
                            inputType: 'string'
                        }];
                        this.group = this.allGroup.slice();
                        this.id_column_show_order = undefined;
                        this.init_filter_table();
                    } else {
                        this.loading = false;
                    }
                }).catch(() => {
                    this.loading = false;
                });
            },
            handleData() {
                // 处理得到表格数据
                this.data1 = this.data1.map((item, index) => {
                    if (item.editTime) {
                        item.editTime = new Date(item.editTime).format('yyyy-MM-dd hh:mm:ss');
                    } else {
                        item.editTime = new Date(item.createTime).format('yyyy-MM-dd hh:mm:ss');
                    }
                    if (['1000', '1002'].includes(`${this.enterpriseId}`)) {
                        for (const key in item) {
                            item[`b${key}`] = item[key];
                        }
                    } else {
                        for (const key in item) {
                            if (item[key]) {
                                const newKey = `b${key}`;
                                if (key.indexOf('a100') != -1) { /* 表单字段中 */
                                    if (item[key].includes('@') && item[key].length <= 40 && emailReg.test(item[key].trim())) { /* 检测是邮箱格式 */
                                        const emailArr = item[key].split('@');
                                        emailArr[0] = '****';
                                        item[newKey] = emailArr.join('@');
                                    } else if (key !== 'a10010' && item[key].length <= 40 && telReg.test(item[key].replace(/[-\s]/g, ''))) { /* 去掉字符串中空格 检测是电话 */
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

                // 高亮详情页所在行
                if (this.showDetail) {
                    const rowIndex = this.data1.findIndex(item => item.id === this.currentRowTemp.id);
                    if (rowIndex !== -1) {
                        this.$refs.table.setCurrentRow(this.data1[rowIndex]);
                    }
                }
            },
            /* 刷新表格数据 */
            refreshData() {
                // 取消之前的表格数据请求
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }
                this.loading = true;
                const vm = this;
                const jsonData = {
                    orgId: this.enterpriseId,
                    templateId: this.formModel,
                    userId: this.userId,
                    isForm: 1,
                    pageSize: this.pagesize,
                    pageNo: this.curpage,
                    orderColumn: this.order_column,
                    orderType: this.order_type,
                    query: this.queryData.$and.length ? JSON.stringify(this.queryData) : undefined,
                    websiteStatQuery: this.dashBoardFilterCon || undefined
                };
                util.ajax({
                    url: '/form-cust/form/getColumnValueList',
                    method: 'post',
                    data: jsonData,
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        // An executor function receives a cancel function as a parameter
                        vm.cancelFunc = c;
                    })
                }).then(response => {
                    const timer = setTimeout(() => {
                        this.loading = false;
                    }, 500);
                    this.initTable = true;
                    if (response.data.code === '1') {
                        if (!response.data.data.list) {
                            // 如果当前页没有数据
                            if (jsonData.pageNo !== 1) {
                                // 且当前页不是第一页, 则跳回到第一页
                                this.changePage(1);
                                // 去掉延时 loading
                                clearTimeout(timer);
                            } else {
                                // 否则清空旧数据, 表格数据为空
                                this.data1 = [];
                                this.totalpage = 0;
                            }
                        } else {
                            const items = response.data.data.list;
                            this.data1 = items.map(v => {
                                this.$set(v, 'edit', false); // https://vuejs.org/v2/guide/reactivity.html
                                v.originalRemark = v.remark; //  will be used when user click the cancel botton
                                return v;
                            });
                            this.handleData();
                            this.totalpage = response.data.data.total;
                        }
                    }
                }).catch(error => {
                    setTimeout(() => {
                        this.loading = false;
                    }, 500);
                    this.initTable = true;
                });
            },
            /* 格式化日期 */
            dateformat() {
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
                        fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()}`).substr(4 - RegExp.$1.length));
                    }
                    for (const k in o) {
                        if (new RegExp(`(${k})`).test(fmt)) {
                            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ((`00${o[k]}`).substr((String(o[k])).length)));
                        }
                    }
                    return fmt;
                };
            },
            /* 改变每页条数 */
            sizeChange(size) {
                this.pagesize = size;
                /* 如果当前不是第一页 重置为第一页 会自动触发 changepage */
                // if (this.curpage !== 1) {
                //     this.curpage = 1;
                // } else {
                this.curpage = 1;
                this.loading = true;
                this.refreshData();
                // }
            },
            /* 改变页码 */
            changePage(page) {
                this.data1 = [];
                this.loading = true;
                this.curpage = page;
                this.refreshData();
            },
            /* 下载 */
            exportData() {
                const query = this.queryData.$and.length ? encodeURIComponent(JSON.stringify(this.queryData)) : '';
                window.open(`${util.ajaxUrl}/form-cust/form/getColumnValueListExcel?isForm=1&orgId=${this.enterpriseId}&query=${query}&templateId=${this.formModel}&userId=${this.userId}`, '_blank');
            },
            /* 同上，新增筛选条件的相应方法 */
            addchangecon1(index) {
                switch (this.addcondition[index].condition1) {
                    // 时间类
                    case 'createTime':
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
                    case 'status':
                        this.addcondition[index].inputType = 'select';
                        this.addcondition[index].conditionlist2 = [
                            {
                                value: this.$t('filter_box.equal'),
                                label: this.$t('filter_box.equal')
                            },
                            {
                                value: this.$t('filter_box.unequal'),
                                label: this.$t('filter_box.unequal')
                            }
                        ];
                        this.addcondition[index].condition2 = this.$t('filter_box.equal');
                        this.addcondition[index].conditionlist3 = this.crmStatusList;
                        this.addcondition[index].condition3 = '';
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
                    inputType: 'string'
                });
            },
            /* 删除检索条件 */
            removeclick(index) {
                this.addcondition.splice(index, 1);
            },
            /* 筛选字段-获取检索类型 */
            getSearchCon(key) {
                // 匹配表格固定字段
                const conObj = {
                    proj: 'proj',
                    currentUrl: 'current_url',
                    sourceUrl: 'source_url',
                    createTime: 'create_time',
                    remark: 'remark',
                    status: 'status'
                };
                if (conObj[key]) {
                    return conObj[key];
                }

                // 匹配表单字段
                if (key.indexOf('ba10') !== -1) {
                    return key.substr(1);
                }

                // 均未匹配, 直接返回字段 key
                return key;
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
                // if (this.condition1 !== '' && this.condition2 !== '' &&
                //     this.condition3 !== '') { // 如果最基本的三属性都不为空
                flag = this.addcondition.every(item => {
                    if (item.condition1 !== '' &&
                        item.condition2 !== '' && item !== '') {
                        return true;
                    }
                }); // 那么检测是否 addcondition 所有属性都不为空
                if (!flag) {
                    this.$Message.info(this.$t('website.searchTip'));
                }
                // } else { // 基本三属性有空则提示不能为空
                //     this.$Message.info(this.$t('website.searchTip'));
                // }

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
                        tempObj = {}; // 暂存对象
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
                            this.searchData.push(tempObj);
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
                this.inputType = 'string';
                this.addcondition = [{
                    condition1: '',
                    conditionlist1: this.conditionlist1,
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
                    inputType: 'string'
                }];
                this.filtering = false;
                this.merge_query_list();
                this.curpage = 1;
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
                const conditionList = []; // 暂存数组
                const types = []; // 检索条件类型数组
                // 检查第一项筛选各条件是否都不为空
                // if (this.condition1 !== '' && this.condition2 !== '' && this.condition3 !== '') {
                //     conditionList.push({
                //         con1: this.condition1,
                //         con2: this.condition2,
                //         con3: this.condition3
                //     });
                //     types.push(this.condition1);
                // } else {
                //     this.$Message.info(this.$t('website.detection1'));
                //     return;
                // }
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
            },
            // 点击常用检索项检索
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
            },
            onCopy() {
                this.$Message.success(this.$t('website.copySuccess'));
            },
            onError() {
                this.$Message.error(this.$t('website.copyFail'));
            },

            // 返回字段筛选渲染函数
            renderHeader_filter() {
                return (h, { column, $index }) => {
                    /* DOM */
                    // 标题
                    const title = h('div', {
                        attrs: {
                            title: column.title
                        },
                        class: 'table-filter-title'
                    }, column.label);
                    // 排序组件
                    let order_column = this.getSearchCon(column.property);
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
                            showPopper: this.currentColumns[$index].show_filter_content,
                            filtering: this.currentColumns[$index].filtering,
                            columnKey: column.property,
                            columnCon: order_column,
                            order_type: this.order_type,
                            order_column: this.order_column,
                            storageName_orderColumn: this.storageName_orderColumn
                        }, this.config_tableFilter[column.property]),
                        on: {
                            updateList: () => {
                                const temp = this.config_tableFilter[column.property];
                                if (temp) {
                                    /* 处理筛选 */
                                    // 判断是否有值, 调整 sqlList
                                    const con = this.getSearchCon(column.property);
                                    if (temp.query.length) {
                                        const result = {};
                                        switch (temp.filterType) {
                                            case 'string':
                                                if (con === 'status') {
                                                    let state = '';
                                                    switch (temp.query) {
                                                        case '未录入':
                                                            state = 1;
                                                            break;
                                                        case '已录入':
                                                            state = 101;
                                                            break;
                                                        case '无关':
                                                            state = 100;
                                                            break;
                                                        default:
                                                            break;
                                                    }
                                                    this.$set(this.sqlList_tableFilter, con, {
                                                        $eq: state
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
                                                            item.value === null ? temp[con].$null = -1 : temp[con].$eq = item.value;
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
                                        this.currentColumns = this.currentColumns.map((item, index) => {
                                            if (index === $index) {
                                                item.filtering = true;
                                            }
                                            return item;
                                        });
                                    } else {
                                        this.$delete(this.sqlList_tableFilter, con);
                                        this.currentColumns = this.currentColumns.map((item, index) => {
                                            if (index === $index) {
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
                                this.currentColumns = this.currentColumns.map((item, index) => {
                                    if (index === $index) {
                                        item.show_filter_content = val;
                                    } else if (val) {
                                        item.show_filter_content = false;
                                    }
                                    return item;
                                });
                            },
                            'update:query': (val) => {
                                if (this.config_tableFilter[column.property]) {
                                    this.$set(this.config_tableFilter[column.property], 'query', val);
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
                    }, [title, (this.order_column === order_column && this.order_type) ? sortIcons : undefined, this.currentColumns[$index].hasOwnProperty('show_filter_content') ? filterPop : undefined]);
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
            // 表格表头单元格 class 方法
            headerCellClass({ column }) {
                // 如果可调整列宽, 则设置相应 class
                if (column.resizable) {
                    return 'resizable-col';
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
                const index = this.allColumns.findIndex(item => item.key === key);
                if (index !== -1) {
                    const col = this.allColumns[index];
                    col.filtering = false;
                    this.$set(this.allColumns, index, col);

                    this.$delete(this.sqlList_tableFilter, this.getSearchCon(col.key));
                }

                this.merge_query_list();
                this.curpage = 1;
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

            // 显示模态框
            edit_columns() {
                this.visible_edit_columns = true;
            },
            /* watch group , 当 group 发生变化时调用此方法来刷新表格视图 */
            changeGroups(selCol) {
                this.refreshColumn = false;
                const orderObj = Object.assign({}, ...selCol.map((item, index) => {
                    const temp = {};
                    temp[item] = index;
                    return temp;
                }));
                this.currentColumns = this.allColumns.filter(col => selCol.includes(col.key)).sort((a, b) => {
                    return orderObj[a.key] - orderObj[b.key];
                });
                this.$nextTick(() => {
                    this.refreshColumn = true;
                });
            },
            // 请求表头字段顺序
            getFieldOrderList() {
                /* 配置表格显示项 */
                util.ajaxJson({
                    url: '/crm/commonField/getFieldOrderList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        type: this.columnType,
                        templateId: this.formModel
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
                            this.group = this.allGroup.slice();
                            this.id_column_show_order = undefined;
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Table.getTableColumnOrder'));
                        this.group = this.allGroup.slice();
                        this.id_column_show_order = undefined;
                    }
                });
            },
            // 取消修改备注
            cancleChangeRemark() {
                // console.log('cancleChangeRemark');
                // console.log(this.editRow);
                this.editRemark = '';
                this.editRemarkVisible = false;
            },
            sureChangeRemark() {
                const remark = this.editRemark;
                const id = this.editRow.id;
                // if (!remark) {
                //     this.$Message.info(this.$t('chat.remarkTip'));
                //     return false;
                // }
                this.isChangeSucc = true;
                this.confirmEdit(id, remark);
            },
            /** 确认编辑 */
            confirmEdit(id, remark) {
                util.ajax({
                    url: '/form-cust/form/updateColumnValueRemark',
                    method: 'post',
                    data: {
                        id: id,
                        remark: remark,
                        userName: this.fullName
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$Message.success(this.$t('chat.remarkTip2'));
                        this.isChangeSucc = false;
                        this.editRemarkVisible = false;
                        // this.$set(this.editRow, 'remark', this.editRemark);
                        // this.$set(this.data1, this.editIndex, this.editRow);

                        // 更新"updatedId" , 触发网站留言表格页刷新
                        this.$store.commit('website_msg/setUpdatedId', null);
                        this.$nextTick(() => {
                            this.$store.commit('website_msg/setUpdatedId', id);
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
            /* 修改数据 */
            // 编辑模态框出现
            clickEditIcon(row, index) {
                // console.log(row, index);
                this.editRemarkVisible = true;
                this.editRemark = row.remark;
                this.editRow = row;
                this.editIndex = index;
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
            },

            // 去除仪表盘筛选条件
            removeDashBoardFilterCon() {
                // 清空筛选条件
                this.dashBoardFilterCon = null;

                // 刷新表格页
                this.remove_filter_tag('dashBoardFilterCon');
            }
        },
        watch: {
            group: {
                handler(val) {
                    this.changeGroups(val);
                },
                immediate: true
            },
            updatedId: {
                handler(val) {
                    if (val) {
                        // if (this.data1.find(item => item.id === val)) {
                        this.changePage(this.curpage);
                        // }
                    }
                }
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
    .clue-label{
        width: 100px;
        display: inline-block;
        margin-right:20px;
        text-align:right;
    }
    .clue-item{
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
        text-align: right;
        /*position: absolute;
        left: 50%;
        transform: translate(-50%)*/
    }

    .datewrap {
        margin-bottom: 15px;
    }

    .datewrap /deep/ .export-data {
      padding: 5px 0 6px;
    }

    .datewrap > span {
        float: right;
        position: relative;
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
        width: 220px;
        margin-right: 15px;
        display: inline-block;
    }

    .conditionwrap {
        max-height: 136px;
        overflow: auto;
    }

    .filter-top {
        height: 40px;
        // border-bottom: 1px solid #d0cece;
        border-bottom: none !important;
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
        color: #414040;
    }

    .filter-checked span {
        width: 47px;
        height: 7px;
        border-radius: 3px;
        background-color: #fb8b2f;
        display: block;
        margin: auto;
        margin-top: -4px;
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

    .layermain {
        text-align: center;
    }


    .layermain > span {
        font-weight: bold;
        margin: 0 5px;
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
</style>

<style lang="less">
    .web-button-text{
        color: rgba(0, 0, 0, 0.8);
    }
    .tabmain{
        .show-edit-btn {
            display: none;
            cursor: pointer;
        }
        .web-remark:hover .show-edit-btn {
            display: inline-block;
        }
    }
    .omit-content{
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .tabmain .edit-cell:hover .show-edit-btn {
        display: block !important;
        margin-left: -10px !important;
    }
    /*表单始终铺满界面*/
    .tabmain table{
        width: 100% !important;
    }

</style>

<style>
    .tabmain table {
        width: 100% !important;
    }

    .checkboxgroup > label {
        display: block;
        margin-bottom: 5px;
    }
</style>
