<template>
  <div class="fb-msg">
    <div class="adgroup" @click="hidelayer()">
      <div class="table_wrap">
        <!-- <template v-if="!visible_batch_operate"> -->
          <div class="datewrap">
            <!-- 筛选标签 -->
            <FilterTags
                    :order_column="order_column"
                    :order_type="order_type"
                    :storageName_orderColumn="storageName_orderColumn"
                    :filterConObj.sync="config_tableFilter"
                    :langObj="lang_message"
                    :width="600"
                    @change_filter_tag="change_filter_tag"
                    @emptySort="empty_sort"
                    @removeCon="remove_filter_tag"
            ></FilterTags>
            <span>
            <!-- 右上角筛选字段 -->
            <Poptip width="540" placement="bottom-end" trigger="click">
              <Button
                      type="text"
                      icon="custom custom-table-filter"
                      slot="reference"
                      class="export-data leads-filter-field"
                      :style="filtering?'color:#4285f4':''"
              >{{$t('filter_box.filter_field')}}</Button>
              <div>
                <!-- <Tabs v-model="selected_filter_tab" class="full-tab">
                  <TabPane :label="$t('crm.Table.search')" name="search"></TabPane>
                  <TabPane :label="$t('crm.Table.searchCommon')" name="searchCommon"></TabPane>
                </Tabs> -->
                <div style="padding: 0 10px 10px 10px">
                  <div v-show="selected_filter_tab === 'search'">
                    <!-- <div style="margin-bottom: 15px">
                      <div class="filter-tips">{{$t('filter_box.filter_name')}}</div>
                      <Input
                              v-model="custom_search_name"
                              :placeholder="$t('filter_box.tip_customSearch')"
                              style="width: 486px"
                      ></Input>
                    </div> -->
                    <div>
                      <div class="filter-tips">{{$t('filter_box.filter_con')}}</div>
                      <div v-for="(add, index) in addCondition" :key="index" class="conditionmain">
                        <Select
                                v-model="add.condition1"
                                style="width:120px;margin-right:15px;float:left;"
                                size="small"
                                filterable
                                @change="addChangeCon1(index)"
                        >
                          <Option
                                  v-for="(item,i) in add.conditionList1"
                                  :key="i"
                                  :value="item.value"
                                  :label="item.label"
                          ></Option>
                        </Select>

                        <Select
                                v-model="add.condition2"
                                @change="addChangeCon2(index)"
                                style="width:90px;margin-right:15px;float:left;"
                                size="small"
                                :ref="`selMiddle${index}`"
                        >
                          <Option
                                  v-for="(item,index) in add.conditionList2"
                                  :value="item.value"
                                  :label="item.label"
                                  :key="index"
                          ></Option>
                        </Select>

                        <div style="margin-bottom:10px;">
                          <span v-if="add.inputType === 'string'">
                            <Input
                                    v-model="add.condition3"
                                    size="small"
                                    :placeholder="$t('crm.Table.tip_addKeywords')"
                                    class="condition3"
                            ></Input>
                          </span>
                          <template v-else-if="add.inputType === 'number'">
                            <InputNumber
                                    :min="0"
                                    :max="5"
                                    v-model="add.condition3"
                                    size="small"
                                    :placeholder="$t('crm.Table.tip_inputNumber')"
                                    class="condition3"
                            ></InputNumber>
                          </template>
                          <template v-else-if="add.inputType === 'boolean'">
                            <Select
                                    v-model="add.condition3"
                                    size="small"
                                    class="condition3"
                            >
                              <Option
                                      v-for="(n,index) in 2"
                                      :value="n"
                                      :key="index"
                                      :label=" n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : '' "
                              ></Option>
                            </Select>
                          </template>
                          <!-- 使用v-show避免日期选择框定位问题 -->
                          <span v-show="add.inputType === 'dateRange'">
                            <DatePicker
                                    v-model="add.condition3"
                                    format="yyyy-MM-dd"
                                    type="daterange"
                                    placement="bottom-end"
                                    :placeholder="$t('crm.Table.tip_selectTime')"
                                    size="small"
                                    class="condition3"
                            ></DatePicker>
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
                                    class="condition3"
                            ></DatePicker>
                          </span>
                          <template v-if="add.inputType === 'select'">
                            <Select
                                    v-model="add.condition3"
                                    filterable
                                    size="small"
                                    class="manager-select condition3"
                            >
                              <Option
                                      v-for="item in add.conditionList3"
                                      :value="item.value"
                                      :label="item.label"
                                      :key="item.label + index"
                              ></Option>
                            </Select>
                          </template>
                          <template v-else-if="add.inputType === 'array'">
                            <Select
                                    v-model="add.condition3"
                                    multiple
                                    filterable
                                    size="small"
                                    class="manager-select condition3"
                            >
                              <Option
                                      v-for="item in add.conditionList3"
                                      :value="item.value"
                                      :label="item.label"
                                      :key="item.label + index"
                              ></Option>
                            </Select>
                          </template>
                          <template v-else-if="add.inputType === 'countryArea'">
                            <CountryAreaSelect
                                    class="condition3"
                                    size="small"
                                    :countryArea.sync="add.condition3"
                            ></CountryAreaSelect>
                          </template>
                        </div>

                        <!-- 右侧新增/删除按钮 -->
                        <template v-if="index === 0">
                          <span @click="addClick">
                            <!-- <Icon
                              type="plus-circled"
                              size="15"
                              color="#FA8241"
                              style="cursor:pointer;display:inline-block;"
                            ></Icon> -->
                            <Icon
                                    size="15"
                                    class="custom custom-add-circle"
                                    style="cursor:pointer;display:inline-block;"
                            ></Icon>
                          </span>
                        </template>
                        <template v-else>
                          <span @click="removeClick(index)">
                            <!-- <Icon
                              type="minus-circled"
                              size="15"
                              color="#FA8241"
                              style="cursor:pointer;display:inline-block;"
                            ></Icon> -->
                            <Icon
                                    size="15"
                                    class="custom custom-reduce-circle"
                                    style="cursor:pointer;display:inline-block;"
                            ></Icon>
                          </span>
                        </template>
                      </div>
                    </div>
                    <div class="btn _f _j_e" style="margin-top: 10px">
                        <!-- <Button
                                type="primary"
                                size="small"
                                :loading="saveSearchLoading"
                                @click="saveSearch()">
                                {{$t('filter_box.save_common')}}
                        </Button> -->
                      <Button
                              type="primary"
                              size="small"
                              @click="searchData()"
                      >{{$t('filter_box.filter')}}</Button>
                      <Button
                              size="small"
                              @click="empty()"
                      >{{$t('filter_box.empty')}}</Button>
                    </div>
                  </div>
                  <div v-show="selected_filter_tab === 'searchCommon'">
                    <p class="filter-tips">{{$t('filter_box.common_filter')}}</p>
                    <div class="commentwrap">
                      <div
                              class="eachlist"
                              v-for="(item,index) in list_commonSearch"
                              :key="index"
                              :style="id_selected_commonSearch===item.id?'color:#fda359':''"
                              @click="searchCommon(item)"
                      >
                        <span class="listtitle" v-text="item.searchName"></span>
                        <span class="removelist" @click.stop="delete_commonSearch(item.id, item.searchName)">×</span>
                      </div>
                      <!-- <Button
                        type="primary"
                        plain
                        size="small"
                        style="float:right;width:50px;"
                        @click="empty()"
                      >{{$t('filter_box.empty')}}</Button> -->
                    </div>
                  </div>
                </div>
              </div>
            </Poptip>
              <!-- 右上角文件下载 -->
            <Button
                    v-if="authorized_button.export"
                    type="text"
                    icon="custom custom-file-download"
                    @click="exportData()"
                    class="export-data leads-export-data"
            >{{$t('filter_box.export_data')}}</Button>
          </span>
          </div>
        <!-- </template>
        <template v-else>
          <div class="operate_wrap">
            <span class="batch_operate" v-if="$lang === 'zh-CN'">已选择 {{selected_leads.length}} 项</span>
            <span class="batch_operate" v-if="$lang === 'en-US'">{{selected_leads.length}} was selected</span>
            <span class="batch_operate hoverBtn" @click="handleBatchLeads">{{$t('facebook.leads.bulkLeads')}}</span>
          </div>
        </template> -->

        <div class="table" v-loading="loading">
            <!-- @select="handleSelectionChange"
            @select-all="handleAllSelectionChange"
            @selection-change="handleSelectionChange"
            :select-on-indeterminate="isSelection" -->
          <Table
            v-if="flag_refreshColumn"
            :height="table_height"
            :data="data1"
            @row-click="clickRow"
            :isCustom="true"
            :customEmptyText="customEmptyTextLang"
            :customEmptyButtonText="customEmptyButtonTextLang"
            :customClearMethod="clearFilterConditionByInitView"
            :border="true"
            :header-cell-class-name="headerCellClass"
            highlight-current-row
            ref="table"
            :row-key="getRowKey"
            @mousemove.native="handleTableColHover"
            @mousedown.native="handleTableColResizeStart"
            @header-dragend="handleTableColResizeEnd"
            class="tabmain noBoxShadow-right noborder-table resizable-table"
          >
            <!-- todo 增加批量录入线索 -->
            <!-- <TableColumn fixed="left"
                         width="50"
                         align="center"
                         :reserve-selection="true"
                         type="selection"
                         :selectable="isRowSelectable" ></TableColumn> -->
            <!-- 无数据提示 -->
            <template slot="empty">
                {{showcontent}}
            </template>
            <template v-for="item in currentColumns">
              <!-- 正常列 -->
              <TableColumn
                v-if="item.key!=='remark'&&item.key!=='status'"
                :key="item.key"
                :prop="item.key"
                :label="item.title"
                :width="item.width"
                :min-width="item.minWidth"
                :render-header="item.renderHeader"
                show-overflow-tooltip
              >
              </TableColumn>
              <!-- leads状态 -->
               <TableColumn
                v-else-if="item.key==='status'"
                :key="item.key"
                :prop="item.key"
                :label="item.title"
                :min-width="item.minWidth"
                :width="item.width"
                :render-header="item.renderHeader"
              >
                <template slot-scope="scope">
                    <span> {{newStatus(scope.row.status)}} </span>
                  <!-- <span v-if="scope.row.status===1">{{$t('website.noDispose')}}</span>
                  <span v-else-if="scope.row.status===100">{{$t('facebook.inbox.invalid')}}</span>
                  <span v-else-if="scope.row.status===102">{{$t('facebook.reporting.inquiry')}}</span>
                  <span v-else-if="scope.row.status===101">{{$t('facebook.reporting.clue')}}</span>
                  <span v-else-if="scope.row.status===103">{{$t('facebook.secondConsultation')}}</span> -->
                </template>
              </TableColumn>
              <!-- 备注 -->
              <TableColumn
                v-else-if="item.key==='remark'"
                :key="item.key"
                :prop="item.key"
                :label="item.title"
                :min-width="item.minWidth"
                :width="item.width"
                :render-header="item.renderHeader"
              >
                <template slot-scope="scope">
                  <Tooltip
                    class="remark-text"
                    v-if="typeof(scope.row.remark)==='string'&&scope.row.remark.length>5"
                    :content="scope.row.remark"
                  >
                    <div class="remark-tip">{{scope.row.remark}}</div>
                  </Tooltip>
                  <div v-else class="remark-text">{{scope.row.remark?scope.row.remark:''}}</div>
                  <i
                    slot="reference"
                    class="remark-button custom custom-edit fb-leads-edit-remark"
                    style="font-size: 12px"
                    @click="showRemark(scope.$index)"
                  ></i>
                </template>
              </TableColumn>
            </template>
            <!-- 右侧字段管理按钮 -->
            <!-- <TableColumn
              width="40"
              fixed="right"
              align="center"
              :resizable="false"
              :render-header="renderHeader_editColumn"
              class-name="no-padding-cell"
            ></TableColumn> -->
          </Table>
            <!-- 备注模态框 -->
          <Modal :visible.sync="showRemarkModal" :modal-append-to-body="false" width="320px" :height="100" title="备注" @on-ok="saveRemark">
            <textarea
              v-model="remarkText"
              style="width:260px;height:60px;"
              name
              id
              cols="30"
              rows="10"
            ></textarea>
             <span slot="footer" class="dialog-footer">
                <Button @click="showRemarkModal = false">取 消</Button>
                <Button type="primary" @click="saveRemark">确 定</Button>
            </span>
          </Modal>
          <div style="margin: 10px;">
            <div class="pagewrap">
              <Page
                :page-sizes="pagesizeopts"
                :total="totalpage"
                :current-page="curPage"
                :page-size="pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="sizeChange"
                @current-change="changePage"
              ></Page>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    <!-- 修改字段 -->
    <EditColumns
      :visible.sync="visible_edit_columns"
      :columnType="columnType"
      :id.sync="id_column_show_order"
      :allColumns="allColumns"
      :allGroup="allGroup"
      :group.sync="group"
    ></EditColumns>
    <ClueModal
                type="fb_leads"
                v-model="clueModal"
                :title="$t('website.Tooltip1')"
                class="modal companydata"
                :delLoading="delLoading"
                :json_data="json_data"
                :hide="enterpriseId + '' !== '1000' && enterpriseId + '' !== '1002'"
                @on_cancle_clue="on_cancle_clue"
                @open_close="open_close">
    </ClueModal>

    <LeadsDrawer
      :visible_leads.sync="show_leads_detail"
      :visible_clue.sync="show_clue_detail"
      :visible_inquiry.sync="show_inquiry_detail"
      :rowData="data_current_row"
      :templateId="templateId"
      :formModel="formModel"
      :columns="allColumns"
      :get_leads_status="get_leads_status"
      :corp_columns_authorized="corp_columns_authorized"
      :contact_columns_authorized="contact_columns_authorized"
      :inquiry_columns_authorized="inquiry_columns_authorized"
      @refreshData="refreshData"
      @closeDrawer="show_leads_detail = false"
    ></LeadsDrawer>
    <batchLeads :visible.sync="visible_batch_leads"
                :selected="selected_leads"
                @refreshData="handleBatchRefresh"
                v-if="visible_batch_leads"></batchLeads>
  </div>
</template>

<script>
    import Vue from 'vue';
    import { mapState } from 'vuex';
    import util from '../../../libs/util';
    import Utils from '@/utils';
    import _ from 'lodash';
    import ClueModal from '../../main-components/enter-clue/enter-clue.vue';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import LeadsDrawer from '@/views/facebook/fb-message/LeadsDrawer';
    import FilterTags from '@/views/main-components/filter-tags';
    import EditColumns from '@/views/crm/Table/Components/Modal/editColumns';
    import resetInitComponents from '@/mixins/resetComponentViewData';
    import tableColResize from '@/mixins/tableColResize';
    import batchLeads from './components/batchLeads';

    export default {
        mixins: [resetInitComponents, tableColResize],
        name: 'fb_message',
        components: {
            ClueModal,
            LeadsDrawer,
            FilterTags,
            EditColumns,
            batchLeads
        },
        data() {
            return {
                // 增加删除常用检索弹窗
                deleteCommonSearchVisible: false,
                deleteCommonSearchId: '',
                deleteCommonSearchName: '',

                saveSearchLoading: false,
                isSet: true,
                json_data: {},
                msgIndex: '', // 当前行
                currentUrl: '', // 当前留言 网页url
                currentId: '', // 当前留言id
                currentProj: '', // 当前访客id
                currentRow: {}, // 当前行数据
                Email: '',
                seqNumber: '', // 线索编号
                emailModal: false, // 邮箱验证弹框
                saleName: '',
                saleId: '',
                source: 5, // 线索来源 1:访客历史,2:网站留言,3:直接创建,4:聊天
                clueModal: false, // 线索框状态
                delLoading: false, // 弹出框loading
                inputType: 'string', // 判断是否需要改变筛选条件 Input 为日期选择框
                nextCompanyId: '',
                middledata: [],
                // table_height: document.body.clientHeight - 210,
                uploadImgList: [],
                urlImgList: [],
                uploadList: [],
                urlList: [],
                imgName: '',
                columns1: [], // 表格列名称
                allColumns: [], // 表格全部列
                flag_refreshColumn: true, // 使用 v-if 刷新列表列顺序
                showRemarkModal: false,
                remarkText: '',
                remarkIndex: '',
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
                model1: '',
                pagenum: 1,
                perpagenum: '20条/页',
                totalpage: 0,
                reportdata: [],
                allreportdata: [], // 所有数据
                colObj: {},
                curPage: 1,
                pagesize: 20,
                maxpagenum: 1,
                pagesizeopts: [20, 50, 100],
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
                                end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() -
                                    24 * 60 * 60 * 1000);
                                start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        }
                    ],
                    disabledDate(date) {
                        return date.valueOf() > Date.now();
                    }
                },
                templateId: '' /* 线索模板id */,
                leadsId: '',
                adId: '',
                allGroupTemp: [], // 修改字段：所有字段
                indeterminate: false,
                checkAll: true,
                changecolshow: false,
                condition1: '',
                conditionList1: [], // 筛选字段：字段列表
                condition2: '',
                conditionList2: [
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
                conditionList3: [
                    {
                        value: 1,
                        label: '未处理'
                    },
                    {
                        value: 2,
                        label: '垃圾'
                    },
                    {
                        value: 3,
                        label: '询盘'
                    },
                    {
                        value: 4,
                        label: '跟进中'
                    },
                    {
                        value: 5,
                        label: '完成'
                    }
                ],
                addCondition: [],
                startDate: '',
                endDate: '',
                loading: true,
                searchkey: '',
                searchcon: '',
                searchval: '',
                reportdata1: [],
                filtershow: false,
                matchtype: '',
                isChecked: true,
                filterTerm: true, // 检索
                custom_search_name: '',
                list_commonSearch: [],
                parentTempateId: '',
                formModel: '', // 选中的表单id
                formList: [], // 表单列表
                savingClue: false,
                filterCon: '',
                id_selected_commonSearch: -1 /* 正在检索常用检索的哪一个  保存的是index */,
                selected_filter_tab: 'search', // 检索 or 常用检索

                /* 列头筛选 */
                order_column: '',
                order_type: '',
                storageName_orderColumn: '',
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
                        sort: true,
                        filter: true,
                        filterType: 'select',
                        query: '',
                        allList: []
                    },
                    partSys: {
                        sort: true,
                        filter: true,
                        filterType: 'string',
                        query: '',
                        allList: null
                    },
                    leadsSubmitTime: {
                        sort: true,
                        filter: true,
                        filterType: 'date',
                        query: '',
                        allList: null
                    },
                    leadsId: {
                        sort: true,
                        filter: true,
                        filterType: 'string',
                        query: '',
                        allList: null
                    },
                    adId: {
                        sort: true,
                        filter: true,
                        filterType: 'string',
                        query: '',
                        allList: null
                    }
                },
                sqlList_tableFilter: {},
                queryData: {
                    $and: []
                },
                lang_message: {
                    // 默认字段
                    proj: this.$t('website.proj'),
                    currentUrl: this.$t('website.currentUrl'),
                    sourceUrl: this.$t('website.sourceUrl'),
                    createTime: this.$t('website.createTime'),
                    remark: this.$t('website.remark'),
                    status: this.$t('facebook.leads.status'),

                    partSys: this.$t('clue.FB_name'),
                    leadsSubmitTime: this.$t('clue.leads_create_time'),
                    leadsId: 'FB Lead ID',
                    adId: 'Ad ID',
                    /* 固定字段 */
                    a1001: this.$t('crm.Modal.corp_companyName'),
                    a1002: this.$t('crm.Modal.corp_mainProduct'),
                    a1003: this.$t('crm.Modal.corp_countryArea'),
                    a1004: this.$t('crm.Modal.corp_homePage'),
                    a1005: this.$t('crm.Modal.corp_fax'),
                    a1006: this.$t('crm.Modal.corp_phone'),
                    a1007: this.$t('crm.Modal.corp_contactAddress'),
                    a1008: this.$t('crm.Modal.corp_companyRemark'),
                    a1009: this.$t('crm.Modal.contact_nickName'),
                    a10010: this.$t('crm.Modal.contact_email'),
                    a10011: this.$t('crm.Modal.contact_jobTitle'),
                    a10012: this.$t('crm.Modal.contact_phone'),
                    a10013: this.$t('crm.Modal.contact_socialNetworkingPlatform'),
                    a10014: this.$t('crm.Modal.contact_gender'),
                    a10015: this.$t('crm.Modal.contact_remark'),
                    a10016: this.$t('crm.Modal.inq_demandProducts'),
                    a10017: this.$t('crm.Modal.inq_label'),
                    a10018: this.$t('crm.Modal.inq_productCategory'),
                    a10019: this.$t('crm.Modal.inq_sourceChannel'),
                    a10020: this.$t('crm.Modal.inq_sourceWay'),
                    a10021: this.$t('crm.Modal.inq_remark'),
                    a10052: this.$t('crm.InqSet.contact_whatsApp'),
                    a10053: this.$t('crm.InqSet.contact_instagram')
                },
                filtering: false /* 是否检索数据 */,

                /* 修改字段 */
                visible_edit_columns: false,
                columnType: 7, // 字段所属模块 1客户2联系人3询盘4公海客户5线索6公海线索 7fbleads
                id_column_show_order: undefined,
                group: [],
                // 保存到后端的字段属性, 目前只有 width
                fieldStyle: {},

                /* drawer */
                show_leads_detail: false,
                show_clue_detail: false,
                show_inquiry_detail: false,
                data_current_row: {},
                leads_status: '',
                leads_entered_id: undefined,
                currentColumns: [], // 表格列名称

                /* CRM 相关 */
                lang_contact: {
                    nickName: this.$t('crm.Modal.contact_nickName'),
                    jobTitle: this.$t('crm.Modal.contact_jobTitle'),
                    email: this.$t('crm.Modal.contact_email'),
                    phone: this.$t('crm.Modal.contact_phone'),
                    jobGrade: this.$t('crm.Modal.contact_jobGrade'),
                    socialNetworkingPlatform: this.$t('crm.Modal.contact_socialNetworkingPlatform'),
                    birthday: this.$t('crm.Modal.contact_birthday'),
                    gender: this.$t('crm.Modal.contact_gender'),
                    picture: this.$t('crm.Modal.contact_picture'),
                    remark: this.$t('crm.Modal.contact_remark')
                },
                lang_inquiry: {
                    productCategory: this.$t('crm.Modal.inq_productCategory'),
                    demandProducts: this.$t('crm.Modal.inq_demandProducts'),
                    inquiryScore: this.$t('crm.Modal.inq_inquiryScore'),
                    label: this.$t('crm.Modal.inq_label'),
                    sourceChannel: this.$t('crm.Modal.inq_sourceChannel'),
                    sourceWay: this.$t('crm.Modal.inq_sourceWay'),
                    grouping: this.$t('crm.Modal.inq_grouping'),
                    followUp: this.$t('crm.Modal.inq_followUp'),
                    estimatedInquiryAmount: this.$t('crm.Detail.inq_estimatedInquiryAmount'),
                    remark: this.$t('crm.Modal.inq_remark')
                },
                lang_company: {
                    companyName: this.$t('crm.Modal.corp_companyName'),
                    starLevel: this.$t('crm.Modal.corp_starLevel'),
                    shortName: this.$t('crm.Modal.corp_shortName'),
                    countryArea: this.$t('crm.Modal.corp_countryArea'),
                    mainProduct: this.$t('crm.Modal.corp_mainProduct'),
                    scale: this.$t('crm.Modal.corp_scale'),
                    clientType: this.$t('crm.Modal.corp_clientType'),
                    homePage: this.$t('crm.Modal.corp_homePage'),
                    phone: this.$t('crm.Modal.corp_phone'),
                    fax: this.$t('crm.Modal.corp_fax'),
                    contactAddress: this.$t('crm.Modal.corp_contactAddress'),
                    relatedCompany: this.$t('crm.Modal.corp_relatedCompany'),
                    companyPicture: this.$t('crm.Modal.corp_companyPicture'),
                    companyRemark: this.$t('crm.Modal.corp_companyRemark'),
                    companySourceWay: this.$t('crm.Table.col_customerSource')
                },
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
                corp_columns_authorized: {},
                contact_columns_authorized: {},
                inquiry_columns_authorized: {},
                isbindTemplate: 1,

                /* 批量录入线索相关 */
                selected_leads: [],
                visible_batch_leads: false,
                isSelection: true
            };
        },

        created: function() {
            this.$set(this.config_tableFilter.status, 'allList', this.crmStatusList);
            /* 初始化获取最近7天的数据表格 */
            this.getTemplateId();
            this.getTemplateList();
            this.dateformat();
            const endtime = new Date();
            const starttime = new Date();
            starttime.setTime(starttime.getTime() - 3600 * 1000 * 24 * 6);
            this.datevalue = [starttime, endtime];
            this.startDate = starttime.format('yyyy-MM-dd');
            this.endDate = endtime.format('yyyy-MM-dd');
            if (localStorage.getItem('conditionlist_fb') !== null) {
                this.commentsearchlist = JSON.parse(localStorage.getItem('conditionlist_fb'));
            }
            
            // this.get_commonSearch();
        },
        mounted() {
            // 获取 crm 权限字段
            // this.get_columns_authorized();
            // 获取全部销售人员 录入线索时用的，在此调用下
            // this.$store.dispatch('getSalesList');
            // 获取 下拉选项数据LeadsDrawer 组件中的 CRMDrawerList和ClueDrawerList弹窗组件中的子组件有用到，在此调用下
            // this.$store.dispatch('getSelectOptions');
        },
        beforeDestroy() {
            this.show_leads_detail = false;
            this.show_clue_detail = false;
            this.show_inquiry_detail = false;
            this.data_current_row = {};
            this.leads_status = 'leads';
            this.leads_entered_id = undefined;
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                button_list: state => state.app.button_list,
                window_height: 'window_height',
                fullName: state => state.fullName,
                $lang: state => state.app.lang
            }),
            showcontent() {
                if (this.isbindTemplate === 1) {
                    return '暂无数据';
                } else {
                    return '请先去创建Facebook表单模板';
                }
            },
            table_height() {
                let temp = this.window_height
                    ? this.window_height - 216
                    : document.body.clientHeight - 216;
                if (temp < 200) {
                    temp = 200;
                }
                temp += this.loading ? 1 : 0;
                return temp;
            },
            authorized_button() {
                const buttonIds = BUTTON_IDS.Facebook.leads;
                return {
                    export: !HANDLE_BUTTON(buttonIds.export, this.button_list)
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
                        if (
                            timeArr[0] &&
                            timeArr[1] &&
                            timeArr[0][key].$gte &&
                            timeArr[1][key].$lte
                        ) {
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
            // 转换筛选条件数组
            computed_addCondition() {
                return this.addCondition
                    .filter(item =>
                        item.condition1 &&
                        item.condition2 &&
                        ((item.condition3 && item.condition3.length) ||
                        item.condition3 instanceof Date ||
                        (typeof item.condition3 === 'number' && !isNaN(item.condition3))))
                    .map(item => {
                        const temp = {};
                        const con = this.getSearchCon(item.condition1);
                        const type = this.getSearchType(item.condition2);
                        switch (item.inputType) {
                            case 'string':
                            case 'number':
                            case 'boolean':
                            case 'select':
                                temp[con] = {};
                                temp[con][type] = item.condition3;
                                return temp;
                            case 'countryArea':
                                temp[con] = {};
                                temp[con][
                                    type === '$ne' ? '$nregex' : '$regex'
                                ] = item.condition3.replace('unknown', '');
                                return temp;
                            case 'date':
                                temp[con] = {};
                                temp[con][type] = this.$options.filters.timeFormat(item.condition3);
                                if (type === '$gt') {
                                    temp[con][type] = `${temp[con][type]} 23:59:59.999`;
                                }
                                return temp;
                            case 'dateRange':
                                if (item.condition3[0] && item.condition3[1]) {
                                    temp.$and = [];

                                    const start = {};
                                    start[con] = {};
                                    start[con].$gte = this.$options.filters.timeFormat(item.condition3[0]);
                                    temp.$and.push(start);

                                    const end = {};
                                    end[con] = {};
                                    end[con].$lte = `${this.$options.filters.timeFormat(item.condition3[1])} 23:59:59.999`;
                                    temp.$and.push(end);

                                    return temp;
                                }
                                break;
                            case 'array':
                                switch (con) {
                                    case 'companyManagers':
                                    case 'status':
                                        temp[con] = {};
                                        temp[con].$regex = item.condition3;
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
                    })
                    .filter(item => !(!item || item === ''));
            },
            allGroup() {
                return this.allColumns.map(item => item.key);
            },
            visible_batch_operate() {
                return this.selected_leads.length > 0;
            }
        },
        watch: {
            group: {
                handler(val) {
                    this.changeGroups(val);
                },
                immediate: true
            },
            data1: {
                handler(val) {
                    // val.forEach(v => {
                    //     this.selected_leads.forEach(item => {
                    //         if (v.id === item.id) {
                    //             this.$set(item, 'status', v['status']);
                    //         }
                    //     })
                    // });
                    // const index = this.selected_leads.findIndex(lead => lead.status !== 1);
                    // if (index !== -1) {
                    //     debugger;
                    //     const temp = this.selected_leads.splice(index, 1);
                    //     console.log('cym selected', this.selected_leads);
                    //     const id = temp[0].id;
                    //     const index = val.findIndex(v => v.id === id);
                    //     console.log('the row is ', index);
                    //     if (index !== -1) {
                    //         // this.$refs.table.clearSelection();
                    //         // this.visible_batch_leads = false;
                    //     }
                    // }
                },
                deep: true,
                immediate: true
            }
        },
        methods: {
            // 根据国家编码获取国家地区
            getCountrys(list) {
                return new Promise((resolve, reject) => {
                    util.ajaxJson({
                        url: '/report/country/getNamesByList',
                        method: 'post',
                        data: {
                            list,
                            lang: Vue.config.lang
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            resolve(res.data.data);
                        } else {
                            resolve(list);
                        }
                    });
                });
            },
            getCountryCodeByName(countryName) {
                return util.ajax({
                    url: '/report/country/getCountryCodeByName',
                    method: 'get',
                    params: {
                        countryName
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        return res.data.data;
                    } else {
                        return null;
                    }
                });
            },
            // 右侧字段管理按钮
            renderHeader_editColumn(h) {
                return h('div', [
                    h('Icon', {
                        props: {
                            custom: 'custom-table-edit-columns',
                            size: 18,
                            color: '#c3cdd9'
                        },
                        class: 'leads-edit-column cursor-pointer',
                        nativeOn: {
                            click: this.edit_columns
                        }
                    })
                ]);
            },
            jumpFormSetting() {
                this.$router.push({
                    name: 'form_setting'
                });
            },
            /** 设定初始筛选条件 */
            init_filter(key, title, val) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    this.$set(this.config_tableFilter[key], 'query', val);

                    const con = this.getSearchCon(key);
                    if (val.length) {
                        const result = {};
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
                                            item.value === null
                                                ? (temp[con].$null = -1)
                                                : (temp[con].$eq = item.value);
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

            on_cancle_clue(data) {
                this.clueModal = data.close;
            },
            open_close(data) {
                this.clueModal = data.close;
                if (data.Status === 101) {
                    this.currentRow.status = 101;
                }
            },
            /* 把字段option转成数组 */
            filterOption(str) {
                let arr = [];
                arr = str.split('?');
                return arr;
            },
            formSelect(val) {
                this.getColumnList();
            },
            /* 获得模板id */
            getTemplateId() {
                util
                    .ajax({
                        url: '/form-cust/form/getXSShow',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId
                        }
                    })
                    .then(response => {
                        if (response.data.code === '1') {
                            this.templateId = response.data.data.template.id;
                        }
                    });
            },
            /* 加载表单列表 */
            getTemplateList() {
                util
                    .ajax({
                        url: '/form-cust/form/getLastedTemplate',
                        method: 'get',
                        params: {
                            orgId: this.enterpriseId,
                            cateType: 1
                        }
                    })
                    .then(response => {
                        if (response.data.code === '1') {
                            this.formList = response.data.data;
                            this.formModel = response.data.data.id;
                            this.getColumnList();
                            this.isbindTemplate = 1;
                        } else {
                            this.loading = false;
                            this.isbindTemplate = 0;
                        }
                    })
                    .catch(erro => {
                        this.loading = false;
                        this.isbindTemplate = 0;
                    });
            },
            showClueModel(row, index) {
                this.json_data = Object.assign({}, row, {
                    enterpriseId: this.$store.state.enterpriseId,
                    userId: this.$store.state.userId,
                    userName: this.$store.state.userName,
                    templateId: this.templateId,
                    sourceName: this.formModel
                });
                this.msgIndex = index;
                this.currentProj = row.proj;
                this.currentId = row.id;
                this.currentUrl = row.currentUrl;
                this.currentRow = row;
                this.clueModal = true;
            },
            cancelClue() {
                this.clueModal = false;
                this.savingClue = false;
                this.saleId = '';
                this.colObj = {};
            },
            /* 获取表头 */
            getColumnList() {
                util
                    .ajax({
                        url: '/form-cust/form/getColumns',
                        method: 'post',
                        data: {
                            templateId: this.formModel,
                            isShow: 1,
                            orgId: this.enterpriseId,
                            userId: this.userId
                        }
                    })
                    .then(response => {
                        if (response.data.code === '1') {
                            let columnList = [
                                {
                                    title: this.$t('clue.FB_name'),
                                    minWidth: 200,
                                    align: 'center',
                                    key: 'partSys',
                                    tooltip: true,
                                    render: (h, params) => {
                                        if (params.row.partSys) {
                                            if (params.row.partSys.toString().length > 15) {
                                                return h(
                                                    'Tooltip',
                                                    {
                                                        class: 'com_name',
                                                        props: {
                                                            placement: 'bottom-start',
                                                            content: params.row.partSys
                                                        }
                                                    },
                                                    [
                                                        h(
                                                            'span',
                                                            `${params.row.partSys.toString().slice(0, 14)}...`
                                                        )
                                                    ]
                                                );
                                            }
                                            return h('span', params.row.partSys);
                                        }
                                        return h('span', '');
                                    }
                                },
                                {
                                    title: 'Lead ID',
                                    width: 150,
                                    align: 'center',
                                    key: 'leadsId',
                                    tooltip: false
                                },
                                {
                                    title: 'Ad ID',
                                    width: 160,
                                    align: 'center',
                                    key: 'adId',
                                    tooltip: false
                                },
                                {
                                    title: this.$t('clue.leads_create_time'),
                                    width: 160,
                                    align: 'center',
                                    key: 'leadsSubmitTime',
                                    tooltip: false
                                }
                            ];
                            let groupTemp = [
                                this.$t('index'),
                                this.$t('clue.FB_name'),
                                'Lead ID',
                                'Ad ID',
                                this.$t('clue.leads_create_time')
                            ];
                            const showList = response.data.data;
                            for (const key in showList) {
                                const obj = showList[key];
                                obj.key = key;
                                obj.required = showList[key].isNeed !== 0;
                                groupTemp.push(this.lang_fixed_columns[key] || showList[key].name);
                                if (key.indexOf('a100') !== -1) {
                                    const keyTemp = `b${key}`;
                                    columnList.push({
                                        title: this.lang_fixed_columns[key] || showList[key].name,
                                        key: keyTemp,
                                        minWidth: 180
                                        // render: (h, params) => {
                                        //     if (params.row[keyTemp]) {
                                        //         if (params.row[keyTemp].toString().length > 11) {
                                        //             return h(
                                        //                 'Tooltip',
                                        //                 {
                                        //                     class: 'com_name',
                                        //                     props: {
                                        //                         placement: 'bottom-start',
                                        //                         content: params.row[keyTemp]
                                        //                     }
                                        //                 },
                                        //                 [
                                        //                     h(
                                        //                         'span',
                                        //                         `${params.row[keyTemp]
                                        //                             .toString()
                                        //                             .slice(0, 10)}...`
                                        //                     )
                                        //                 ]
                                        //             );
                                        //         }
                                        //         return h('span', params.row[keyTemp]);
                                        //     }
                                        //     return h('span', '');
                                        // }
                                    });
                                    let filter_type = 'string';
                                    let queryTemp = '';
                                    let allListTemp = null;
                                    switch (showList[key].type) {
                                        case 'date':
                                            filter_type = 'date';
                                            queryTemp = [];
                                            break;
                                        case 'select':
                                            filter_type = 'select';
                                            queryTemp = [];
                                            allListTemp = showList[key].option
                                                .split('?')
                                                .map(option => {
                                                    return { value: option, label: option };
                                                });
                                            break;
                                        default:
                                            break;
                                    }
                                    // this.config_tableFilter[keyTemp] = {
                                    //     sort: filter_type !== 'select', // 是否允许排序
                                    //     filter: true, // 是否允许筛选
                                    //     filterType: filter_type, // 筛选类型, string / date / select / countryArea
                                    //     query: queryTemp, // 筛选值, 对应上述类型: '' / [] / [] / ''
                                    //     blank: true, // 增加选项-空(未填写)
                                    //     allList: allListTemp // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                                    // };
                                    /**
                                     * @Description: 由于a100开头的字段，原书写方式会导致config_tableFilter中a100的字段无get/set监听，
                                     *               导致表头筛选无法触发filterTags中对filterConObj的watch监听，导致表格上方不显示该筛选条件。
                                     *               相关bug：【ID1006420】
                                     * @author 杨娣
                                     * @date 2020/6/14
                                    */
                                    this.$set(this.config_tableFilter, keyTemp, {
                                        sort: filter_type !== 'select', // 是否允许排序
                                        filter: true, // 是否允许筛选
                                        filterType: filter_type, // 筛选类型, string / date / select / countryArea
                                        query: queryTemp, // 筛选值, 对应上述类型: '' / [] / [] / ''
                                        blank: true, // 增加选项-空(未填写)
                                        allList: allListTemp // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                                    });
                                    this.$set(
                                        this.lang_message,
                                        key,
                                        this.lang_fixed_columns[key] || showList[key].name
                                    );
                                } else {
                                    columnList.push({
                                        title: this.lang_fixed_columns[key] || showList[key].name,
                                        key,
                                        align: 'center',
                                        minWidth: 120,
                                        tooltip: true
                                    });
                                }
                            }
                            groupTemp = groupTemp.concat([
                                this.$t('website.createTime'),
                                this.$t('website.remark'),
                                this.$t('facebook.leads.status')
                            ]);
                            columnList = columnList.concat([
                                {
                                    title: this.$t('website.createTime'),
                                    align: 'center',
                                    key: 'createTime',
                                    width: 160,
                                    tooltip: false
                                },
                                {
                                    title: this.$t('website.remark'),
                                    align: 'center',
                                    key: 'remark',
                                    slot: 'remark',
                                    width: 150,
                                    editable: true,
                                    tooltip: true
                                },
                                {
                                    title: this.$t('facebook.leads.status'),
                                    width: 120,
                                    align: 'center',
                                    key: 'status',
                                    render: (h, params) => {
                                        switch (params.row.status) {
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
                                        // if (params.row.status === 1) {
                                        //     return h(
                                        //         'div',
                                        //         { style: { textAlign: 'left' } },
                                        //         this.$t('website.noDispose')
                                        //     );
                                        // } else if (params.row.status === 100) {
                                        //     return h(
                                        //         'div',
                                        //         { style: { textAlign: 'left' } },
                                        //         this.$t('facebook.inbox.invalid')
                                        //     );
                                        // } else if (params.row.status === 102) {
                                        //     return h(
                                        //         'div',
                                        //         { style: { textAlign: 'left' } },
                                        //         this.$t('facebook.reporting.inquiry')
                                        //     );
                                        // } else if (params.row.status === 101) {
                                        //     return h(
                                        //         'div',
                                        //         { style: { textAlign: 'left' } },
                                        //         this.$t('facebook.reporting.clue')
                                        //     );
                                        // } else if (params.row.status === 103) {
                                        //     return h(
                                        //         'div',
                                        //         { style: { textAlign: 'left' } },
                                        //         this.$t('facebook.secondConsultation')
                                        //     );
                                        // }
                                    },
                                    tooltip: true
                                }
                            ]);
                            columnList = columnList.map((col, index) => {
                                if (this.config_tableFilter.hasOwnProperty(col.key)) {
                                    col.show_filter_content = false;
                                    col.filtering = false;
                                    col.renderHeader = this.renderHeader_filter(index);
                                } else {
                                    col.renderHeader = this.renderHeader_text(index);
                                }
                                return col;
                            });
                            this.columns1 = columnList;
                            this.allColumns = columnList;
                            this.allGroupTemp = groupTemp;
                            const filterCon = this.allColumns.map(item => {
                                return {
                                    value: item.key,
                                    label: item.title
                                };
                            });
                            this.conditionList1 = filterCon.filter(item => {
                                return !['checkbox', 'inquiryNum'].includes(item.value);
                            });
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
                            this.loading = false;
                            // this.setFields();
                            this.group = this.allGroup.slice();
                            // this.refreshData();
                            this.checkRouteParams();
                        }
                    });
            },
            // 列相关
            // 修改列
            edit_columns() {
                this.visible_edit_columns = true;
            },
            setFields() {
                /* 配置表格显示项 */
                util
                    .ajaxJson({
                        url: '/crm/commonField/getFieldOrderList',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            type: this.columnType
                        }
                    })
                    .then(response => {
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
                            }
                        } else {
                            this.$Message.error(this.$t('crm.Table.getTableColumnOrder'));
                            this.group = this.allGroup.slice();
                        }
                    })
                    .catch(erro => {
                        this.$Message.error(this.$t('crm.Table.getTableColumnOrder'));
                        this.group = this.allGroup.slice();
                    });
                this.checkRouteParams();
            },
            /* 修改列 */
            changeGroups(selCol) {
                this.flag_refreshColumn = false;
                const orderObj = Object.assign(
                    {},
                    ...selCol.map((item, index) => {
                        const temp = {};
                        temp[item] = index;
                        return temp;
                    })
                );
                this.currentColumns = this.allColumns
                    .filter(col => selCol.includes(col.key))
                    .sort((a, b) => {
                        return orderObj[a.key] - orderObj[b.key];
                    });
                // console.log(this.currentColumns, 'this.currentColumns----------------------');
                this.$nextTick(() => {
                    this.flag_refreshColumn = true;
                });
            },
            async handleData(dataList) {
                const emailReg = Utils.regExp.fullEmail;
                const telReg = new RegExp('^([+]|(00))?[0-9]{7,15}$');
                // const countrys = dataList.map(item => item.a1003);
                // const countryList = await this.getCountrys(countrys);
                // console.log('countryList', countryList);
                dataList.forEach((item, index) => {
                    for (const key in item) {
                        const newKey = `b${key}`;
                        if (key.indexOf('a100') !== -1) {
                            /* 表单字段中 */
                            if (
                                item[key].includes('@') &&
                                item[key].length <= 40 &&
                                emailReg.test(item[key].trim())
                            ) {
                                /* 检测是邮箱格式 */
                                const emailArr = item[key].split('@');
                                emailArr[0] = '****';
                                item[newKey] = emailArr.join('@');
                            } else if (
                                key !== 'a10010' &&
                                item[key].length <= 40 &&
                                telReg.test(item[key].replace(/[-\s]/g, ''))
                            ) {
                                /* 去掉字符串中空格 检测是电话 */
                                item[newKey] = `${item[key].slice(0, -4)}****`;
                            } else {
                                item[newKey] = item[key];
                            }
                        }
                    }
                    // item.a1003 = countryList[index];
                    if (item.editTime) {
                        item.editTime = new Date(item.editTime).format('yyyy-MM-dd hh:mm:ss');
                    } else {
                        item.editTime = new Date(item.createTime).format('yyyy-MM-dd hh:mm:ss');
                    }
                    if (item.createTime) {
                        item.createTime = new Date(item.createTime).format('yyyy-MM-dd hh:mm:ss');
                    }
                    if (item.leadsSubmitTime) {
                        item.leadsSubmitTime = item.leadsSubmitTime.substr(0, 19);
                    }
                    // item.a1003 = ;
                    // return item;
                });

                // 高亮详情页所在行
                if (this.show_leads_detail) {
                    const rowIndex = dataList.findIndex(item => item.id === this.data_current_row.id);
                    if (rowIndex !== -1) {
                        this.$refs.table.setCurrentRow(dataList[rowIndex]);
                    }
                }
                return dataList;
            },
            hideContact() {},
            // 返回字段筛选渲染函数
            renderHeader_filter(colIndex) {
                return h => {
                    const column = this.allColumns[colIndex];
                    /* DOM */
                    // 标题
                    const title = h(
                        'div',
                        {
                            attrs: {
                                title: column.title
                            },
                            class: 'table-filter-title'
                        },
                        column.title
                    );
                    // 排序组件
                    let order_column = this.getSearchCon(column.key);
                    if (order_column === 'create_user_id') {
                        order_column = 'create_user';
                    }
                    const sortIcons = h(
                        'span',
                        {
                            class: {
                                'table-sort-icon-container': true
                            }
                        },
                        [
                            h('Icon', {
                                class: {
                                    on:
                                        this.order_column === order_column &&
                                        this.order_type === 'asc'
                                },
                                props: {
                                    type: 'md-arrow-dropup'
                                }
                            }),
                            h('Icon', {
                                class: {
                                    on:
                                        this.order_column === order_column &&
                                        this.order_type === 'desc'
                                },
                                props: {
                                    type: 'md-arrow-dropdown'
                                }
                            })
                        ]
                    );
                    // 筛选组件
                    const filterPop = h('FilterBox', {
                        props: Object.assign(
                            {
                                showPopper: this.allColumns[colIndex].show_filter_content,
                                filtering: this.allColumns[colIndex].filtering,
                                columnKey: column.key,
                                columnCon: order_column,
                                order_type: this.order_type,
                                order_column: this.order_column,
                                storageName_orderColumn: this.storageName_orderColumn,
                                dateOptions: this.options2,
                                columnType: this.columnType
                            },
                            this.config_tableFilter[column.key]
                        ),
                        on: {
                            updateList: async () => {
                                const temp = this.config_tableFilter[column.key];
                                if (temp) {
                                    /* 处理筛选 */
                                    // 判断是否有值, 调整 sqlList
                                    const con = this.getSearchCon(column.key);
                                    if (temp.query.length) {
                                        const result = {};
                                        switch (temp.filterType) {
                                            case 'string':
                                                console.log('countryArea111111111', con, temp);
                                                // 国家地区
                                                if (con === 'a1003') {
                                                    let tempContryName = '';
                                                    if (temp.query === '中国') {
                                                        tempContryName = 'CN';
                                                    } else {
                                                        tempContryName = await this.getCountryCodeByName(temp.query);
                                                    }
                                                    // 如果该筛选条件有国家地区转码的话,筛选国家地区传参变为$or
                                                    if (tempContryName !== temp.query) {
                                                        const type = '$regex';
                                                        const tempArr = [];
                                                        tempArr.push(temp.query, tempContryName);
                                                        result.$or = tempArr.map(item => {
                                                            const temp = {};
                                                            temp[con] = {};
                                                            // temp[con][type] = item.value;
                                                            item === null ? temp[con].$null = -1 : temp[con][type] = item;
                                                            return temp;
                                                        });
                                                        this.$set(this.sqlList_tableFilter, con, result);
                                                    } else {
                                                        this.$set(this.sqlList_tableFilter, con, {
                                                            $regex: temp.query
                                                        });
                                                    }
                                                    console.log('tempContryName', tempContryName);
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
                                                            item.value === null
                                                                ? (temp[con].$null = -1)
                                                                : (temp[con].$eq = item.value);
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
                                        this.allColumns = this.allColumns.map((item, index) => {
                                            if (index === colIndex) {
                                                item.filtering = true;
                                            }
                                            return item;
                                        });
                                    } else {
                                        this.$delete(this.sqlList_tableFilter, con);
                                        this.allColumns = this.allColumns.map((item, index) => {
                                            if (index === colIndex) {
                                                item.filtering = false;
                                            }
                                            return item;
                                        });
                                    }

                                    /* 刷新列表 */
                                    this.merge_query_list();
                                    this.curPage = 1;
                                    this.refreshData();
                                }
                            },
                            'update:showPopper': val => {
                                this.allColumns = this.allColumns.map((item, index) => {
                                    if (index === colIndex) {
                                        item.show_filter_content = val;
                                    } else if (val) {
                                        item.show_filter_content = false;
                                    }
                                    return item;
                                });
                            },
                            'update:query': val => {
                                if (this.config_tableFilter[column.key]) {
                                    this.$set(this.config_tableFilter[column.key], 'query', val);
                                    console.log('update:query()-----', val, this.config_tableFilter);
                                }
                            },
                            'update:order_column': val => {
                                this.order_column = val;
                            },
                            'update:order_type': val => {
                                this.order_type = val;
                            },
                            'update:storageName_orderColumn': val => {
                                if (val.indexOf('ba100') === 0) {
                                    val = val.substr(1);
                                }
                                this.storageName_orderColumn = val;
                            }
                        }
                    });

                    /* 返回 DOM */
                    return h(
                        'div',
                        {
                            class: 'table-filter-container'
                        },
                        [
                            title,
                            this.order_column === order_column && this.order_type
                                ? sortIcons
                                : undefined,
                            column.hasOwnProperty('show_filter_content') ? filterPop : undefined
                        ]
                    );
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

            /* 刷新表格数据 */
            refreshData() {
                if (this.formModel) {
                    const jsonData = {
                        orgId: this.enterpriseId,
                        templateId: this.formModel,
                        userId: this.userId,
                        isForm: 1,
                        pageSize: this.pagesize,
                        pageNo: this.curPage,
                        query: JSON.stringify(this.queryData),
                        orderColumn: this.toLine(this.order_column),
                        orderType: this.order_type
                    };
                    if (this.filterCon) {
                        jsonData.query = this.filterCon;
                    }
                    this.loading = true;
                    util
                        .ajax({
                            url: '/form-cust/form/getColumnValueList',
                            method: 'post',
                            data: jsonData
                        })
                        .then(async response => {
                            if (response.data.code === '1') {
                                if (!response.data.data.list) {
                                    this.data1 = [];
                                    this.totalpage = 0;
                                } else {
                                    this.data1 = await this.handleData(response.data.data.list);
                                    this.totalpage = response.data.data.total;
                                }
                            }
                            this.loading = false;
                        });
                }
            },
            /* 格式化日期 */
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
                        fmt = fmt.replace(
                            RegExp.$1,
                            `${this.getFullYear()}`.substr(4 - RegExp.$1.length)
                        );
                    }
                    for (const k in o) {
                        if (new RegExp(`(${k})`).test(fmt)) {
                            fmt = fmt.replace(
                                RegExp.$1,
                                RegExp.$1.length == 1
                                    ? o[k]
                                    : `00${o[k]}`.substr(`${o[k]}`.length)
                            );
                        }
                    }
                    return fmt;
                };
            },
            /* 初始化数据 */
            initdata() {
                this.alldata1 = this.allreportdata;
            },
            /* 当前页显示内容 [start,end) */
            changecontent(pagenumstart, pagenumend) {
                this.data1 = [];
                for (let i = pagenumstart; i < pagenumend; i++) {
                    this.data1.push(this.alldata1[i]);
                }
            },
            /* 改变每页条数 */
            sizeChange(size) {
                this.pagesize = size;
                /* 如果当前不是第一页 重置为第一页 会自动触发 changepage */
                if (this.curPage !== 1) {
                    this.curPage = 1;
                } else {
                    this.loading = true;
                    this.refreshData();
                }
            },
            /* 改变页码 */
            changePage(page) {
                /**
                  * leads批量导入 不支持切换分页勾选 因此分页触发sizeChange需要重置selected_leads
                  * @author: Yiming Cai 2021-01-28
                  * */
                this.selected_leads = [];
                this.$refs.table.clearSelection();
                this.data1 = [];
                this.loading = true;
                this.curPage = page;
                this.refreshData();
                document.querySelector('.ivu-table-body').scrollTop = 0;
            },
            /* 改变日期 */
            changeDate(date) {
                this.curPage = 1;
                this.startDate = date[0];
                this.endDate = date[1];
                this.refreshData();
            },
            /* 下载 */
            exportData() {
                const query = this.queryData
                    ? encodeURIComponent(JSON.stringify(this.queryData))
                    : '';
                const url =
                    `${util.ajaxUrl}/form-cust/form/getColumnValueListExcel?` +
                    `isForm=2&orgId=${this.enterpriseId}&query=${query}&templateId=${this.formModel}&userId=${this.userId}`;
                window.open(url, '_blank');
            },
            /* 修改列 */
            changegroups(selcol) {
                this.columns1 = [];
                let flag = 0;
                let index = 0;
                for (let i = 0; i < this.allColumns.length; i++) {
                    for (let j = 0; j < selcol.length; j++) {
                        if (this.allColumns[i].title == selcol[j]) {
                            flag = 1;
                            index = i;
                            break;
                        }
                    }
                    if (flag) {
                        this.columns1.push(this.allColumns[i]);
                        flag = 0;
                    }
                }
                if (selcol.length === this.allColumns.length) {
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
            /* 同上，新增筛选条件的相应方法 */
            addChangeCon1(index) {
                this.addCondition[index].condition2 = '';
                this.addCondition[index].condition3 = '';
                switch (this.addCondition[index].condition1) {
                    // 时间类
                    case 'leadsSubmitTime':
                    case 'createTime':
                        this.addCondition[index].condition2 = this.$t('crm.Table.con_periodOfTime');
                        this.addCondition[index].condition3 = '';
                        this.addCondition[index].conditionList2 = [
                            {
                                value: 'dateRange',
                                label: this.$t('crm.Table.con_periodOfTime')
                            },
                            {
                                value: '$lt',
                                label: this.$t('crm.Table.con_lessThan')
                            },
                            {
                                value: '$gt',
                                label: this.$t('crm.Table.con_greaterThan')
                            }
                        ];
                        this.addCondition[index].inputType = 'dateRange';
                        break;
                    case 'status':
                        this.addCondition[index].condition2 = this.$t('filter_box.equal');
                        this.addCondition[index].conditionList2 = [
                            {
                                value: this.$t('filter_box.equal'),
                                label: this.$t('filter_box.equal')
                            },
                            {
                                value: this.$t('filter_box.unequal'),
                                label: this.$t('filter_box.unequal')
                            }
                        ];
                        this.addCondition[index].condition3 = '';
                        this.addCondition[index].conditionList3 = this.crmStatusList;
                        this.addCondition[index].inputType = 'select';
                        break;
                    case 'source':
                        this.addCondition[index].conditionList2 = [
                            {
                                value: this.$t('filter_box.equal'),
                                label: this.$t('filter_box.equal')
                            },
                            {
                                value: this.$t('filter_box.unequal'),
                                label: this.$t('filter_box.unequal')
                            }
                        ];
                        this.addCondition[index].conditionList3 = [
                            {
                                value: 1,
                                label: this.$t('clue.history')
                            },
                            {
                                value: 2,
                                label: this.$t('clue.web_msg')
                            },
                            {
                                value: 3,
                                label: this.$t('clue.direct_create')
                            },
                            {
                                value: 4,
                                label: this.$t('clue.web_conversation')
                            },
                            {
                                value: 5,
                                label: 'Facebook Leads'
                            },
                            {
                                value: 6,
                                label: this.$t('clue.fb_msg')
                            },
                            {
                                value: 7,
                                label: this.$t('clue.fb_comment')
                            },
                            {
                                value: 9,
                                label: this.$t('clue.data_import')
                            }
                        ];
                        this.addCondition[index].inputType = 'select';
                        break;
                    default:
                        this.addCondition[index].condition3 = '';
                        this.addCondition[index].condition2 = '';
                        this.addCondition[index].conditionList2 = [
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
                        this.addCondition[index].inputType = 'string';
                        break;
                }
            },
            addChangeCon2(index) {
                switch (this.addCondition[index].condition1) {
                    case 'select':
                        this.addCondition[index].condition3 = '';
                        break;
                    // 时间类
                    case 'createTime':
                    case 'editTime':
                    case 'leadsSubmitTime':
                        this.addCondition[index].inputType = 'date';
                        this.addCondition[index].condition3 = '';
                        if (this.addCondition[index].condition2 === 'dateRange') {
                            this.addCondition[index].inputType = 'dateRange';
                            this.addCondition[index].condition3 = [];
                        }
                        break;
                    default:
                        this.addCondition[index].condition3 = '';
                        break;
                }

                // 下面这行代码是不得已而为之,原因在于
                // BUG : 目前根据第一个下拉框决定第二个的选项数组的值,但是只要 change 前后选项数组值的长度一致,就会导致 change 后第二个选框选择下拉值显示无效(永远只显示 change 前的选择值, 第一个选框改回去才可以选择,但实际上只是显示无效,检索功能正常)
                // 解决思路: 通过 Vue-devTools 观察,发现 Select 的 data 上这两个属性值, selectedSingle 错误,所以使用 refs 取 Select 实例更正其数据
                // 因为 v-for ,这里取到的是只有一项的数组,用 [0] 取值
                // this.$refs[`selMiddle${index}`][0].selectedSingle === this.$refs[`selMiddle${index}`][0].model ? undefined : this.$refs[`selMiddle${index}`][0].selectedSingle = this.$refs[`selMiddle${index}`][0].model;
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
            /* 全选列 */
            handleCheckAll() {
                if (this.indeterminate) {
                    this.checkAll = false;
                } else {
                    this.checkAll = !this.checkAll;
                }
                this.indeterminate = false;

                if (this.checkAll) {
                    this.allGroup = this.allGroupTemp;
                    this.columns1 = this.allColumns;
                } else {
                    this.allGroup = [];
                    this.columns1 = [];
                }
            },
            /* 单选列 */
            changecol() {
                if (this.changecolshow) {
                    this.changecolshow = false;
                } else {
                    this.changecolshow = true;
                    this.filtershow = false;
                }
            },
            /* 添加检索条件 */
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
            /* 删除检索条件 */
            removeClick(index) {
                this.addCondition.splice(index, 1);
            },
            /** 筛选字段-获取检索类型 */
            getSearchCon(str) {
                switch (str) {
                    case 'createUser':
                        return 'create_user';
                        break;
                    case 'serviceName':
                        return 'service_name';
                        break;
                    case 'saleName':
                        return 'sale_name';
                        break;
                    case 'seqNumber':
                        return 'seq_number';
                        break;
                    case 'currentUrl':
                        return 'current_url';
                        break;
                    case 'partSys':
                        return 'part_sys';
                        break;
                    case 'leadsId':
                        return 'leads_id';
                        break;
                    case 'adId':
                        return 'ad_id';
                        break;
                    case 'leadsSubmitTime':
                        return 'leads_submit_time';
                        break;
                    case 'createTime':
                        return 'create_time';
                        break;
                    case 'editTime':
                        return 'edit_time';
                        break;
                    default:
                        str = str.indexOf('ba100') === 0 ? str.substr(1) : str;
                        return str;
                        break;
                }
            },
            // 获取检索条件对应的 sql 条件
            getSearchType(str) {
                switch (str) {
                    case this.$t('crm.Table.con_include'):
                        return '$regex';
                    case this.$t('filter_box.not_contain'):
                        return '$nregex';
                    case this.$t('crm.Table.con_equal'):
                        return '$eq';
                    case this.$t('crm.Table.con_unequal'):
                        return '$ne';
                    case this.$t('crm.Table.con_greaterThan'):
                        return '$gt';
                    case this.$t('crm.Table.con_greaterOrEqual'):
                        return '$gte';
                    case this.$t('crm.Table.con_lessThan'):
                        return '$lt';
                    case this.$t('crm.Table.con_lessOrEqual'):
                        return '$lte';
                    default:
                        return str;
                }
            },
            /** 筛选字段-检索 */
            searchData() {
                // 检测是否 addCondition 所有属性都不为空
                const flag = this.addCondition.every(item =>
                    item.condition1 &&
                    item.condition2 &&
                    ((item.condition3 && item.condition3.length) ||
                    item.condition3 instanceof Date ||
                    (typeof item.condition3 === 'number' && !isNaN(item.condition3))));

                // 可筛选
                if (flag) {
                    this.filtering = 'search';
                    this.merge_query_list();
                    this.curPage = 1;
                    this.refreshData();
                } else {
                    this.$Message.info(this.$t('crm.Table.info_searchEmptyConditions'));
                }
            },
            /* 清空检索条件 */
            empty() {
                this.addCondition = [
                    {
                        condition1: '',
                        conditionList1: this.$deepClone(this.conditionList1),
                        condition2: '',
                        conditionList2: this.$deepClone(this.conditionList2),
                        condition3: '',
                        inputType: 'string'
                    }
                ];
                this.custom_search_name = '';
                this.filtering = false;
                this.id_selected_commonSearch = -1;
                this.merge_query_list();
                this.curPage = 1;
                this.refreshData();
            },
            conditionshow() {
                if (this.filtershow) {
                    this.filtershow = false;
                } else {
                    this.filtershow = true;
                    this.changecolshow = false;
                }
            },
            // 合并表头筛选和右上角筛选
            merge_query_list() {
                // 右上角筛选框优先级更高, a 为检索/常用检索条件, b 为表头检索条件
                const b = this.computed_sqlList_tableFilter;
                let a = [];
                switch (this.filtering) {
                    case 'search':
                        a = this.computed_addCondition;
                        break;
                    case 'searchCommon':
                        a = this.common_conditions;
                        break;
                }
                this.$set(this.queryData, '$and', a.concat(b));
            },
            /** 检查路由传递过来的参数 */
            checkRouteParams() {
                // 处理公海线索及我的线索跳转来的逻辑
                if (localStorage.getItem('leadsCloud-FBLeadsId')) {
                    const queryData = {
                        $and: [
                            { leads_id: { $regex: localStorage.getItem('leadsCloud-FBLeadsId') } }
                        ]
                    };
                    localStorage.removeItem('leadsCloud-FBLeadsId');
                    console.log(new Date().getTime())
                    this.getItemByFBLeadsId(queryData);
                    console.log(new Date().getTime())
                }
                // 进行表格默认筛选
                let initial_filter_cons;
                if (this.$route.params.type === 'noDispose') {
                    // 设置初始筛选条件为'状态为未处理'
                    initial_filter_cons = new Map([
                        ['status', [{ value: 1, label: this.$t('website.noDispose') }]]
                    ]);

                    // 删除参数, 避免重复触发
                    delete this.$route.params.type;
                } else {
                    // 设置初始筛选条件为'创建时间为近一周'
                    const timeArr = [Date.now() - 3600 * 1000 * 24 * 30, Date.now()].map(item => this.$options.filters.timeFormat(item));
                    timeArr[0] = `${timeArr[0]} 00:00:00`;
                    timeArr[1] = `${timeArr[1]} 23:59:59`;
                    initial_filter_cons = new Map([
                        ['createTime', timeArr] // 近七天创建
                    ]);
                }
               
                this.allColumns = this.allColumns.map(col => {
                    if (this.config_tableFilter.hasOwnProperty(col.key)) {
                        col.filtering = initial_filter_cons.get(col.key)
                            ? this.init_filter(
                                col.key,
                                col.title,
                                initial_filter_cons.get(col.key)
                            )
                            : false;
                    }
                    return col;
                });

                // 请求表格数据
                this.merge_query_list();
                this.curPage = 1;
                this.refreshData();
            },
            /* 刷新表格数据 */
            getItemByFBLeadsId(queryData) {
                if (this.formModel) {
                    const jsonData = {
                        orgId: this.enterpriseId,
                        templateId: this.formModel,
                        userId: this.userId,
                        isForm: 1,
                        pageSize: this.pagesize,
                        pageNo: this.curPage,
                        query: JSON.stringify(queryData),
                        orderColumn: this.toLine(this.order_column),
                        orderType: this.order_type
                    };
                    if (this.filterCon) {
                        jsonData.query = this.filterCon;
                    }
                    this.loading = true;
                    util
                        .ajax({
                            url: '/form-cust/form/getColumnValueList',
                            method: 'post',
                            data: jsonData
                        })
                        .then(async response => {
                            if (response.data.code === '1') {
                                if (response.data.data.list) {
                                    const data1 = await this.handleData(response.data.data.list);
                                    this.data_current_row = data1[0];
                                    this.get_leads_status();
                                }
                            }
                            this.loading = false;
                        });
                }
            },
            // filterTags 组件内部修改筛选值后触发的方法, 由下方的 updateList 改造而成
            change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    const column = this.allColumns.find(item => item.key === key);
                    if (column) {
                        // 判断是否有值, 调整 sqlList
                        const con =
                            column.fieldType === 'custom' ? key : this.getSearchCon(key);
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
                                        case 'inquiryManagers':
                                        case 'status':
                                            result.$regex = temp.query.map(item => item.value);
                                            break;
                                        default:
                                            // 表头筛选中只能有单个选项值的(单选型字段 + 创建人这种表格才有的字段)属性, 筛选时使用 $eq 等于, 其他用 $regex 包含
                                            let type = '$regex';
                                            switch (key) {
                                                case 'status':
                                                case 'a10014':
                                                case 'a10019':
                                                case 'a10020':
                                                    type = '$eq';
                                                    break;
                                                default:
                                                    if (
                                                        column.fieldType === 'custom' &&
                                                        column.colType === 'select'
                                                    ) {
                                                        type = '$eq';
                                                    }
                                            }
                                            result.$or = temp.query.map(item => {
                                                const temp = {};
                                                temp[con] = {};
                                                item.value === null
                                                    ? (temp[con].$null = -1)
                                                    : (temp[con][type] = item.value);
                                                return temp;
                                            });
                                            break;
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
                        this.curPage = 1;
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
                this.curPage = 1;
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
                    this.changeGroups(this.group);
                    this.$delete(this.sqlList_tableFilter, this.getSearchCon(col.key));
                }
                this.merge_query_list();
                this.curPage = 1;
                this.refreshData();
            },
            changesort(a) {
                this.alldata1 = _.orderBy(this.alldata1, a.key, a.order);
                this.changePage(1);
            },
            hidelayer() {
                this.filtershow = false;
                this.changecolshow = false;
            },
            filter1() {
                this.isChecked = true;
                this.filterTerm = true;
            },
            filter2() {
                this.isChecked = false;
                this.filterTerm = false;
            },
            saveSearch() {
                this.saveSearchLoading = true;
                // 检索名称不能为空
                if (!this.custom_search_name.length) {
                    this.$Message.info(this.$t('crm.Table.error_emptySearchName'));
                    this.saveSearchLoading = false;
                    return;
                } else if (
                    this.list_commonSearch.find(item => {
                        return item.searchName === this.custom_search_name;
                    })
                ) {
                    this.$Message.info(this.$t('crm.Table.error_sameCommonSearchName'));
                    this.saveSearchLoading = false;
                    return;
                }
                const flag = this.addCondition.every(item =>
                    item.condition1 &&
                    item.condition2 &&
                    ((item.condition3 && item.condition3.length) ||
                    item.condition3 instanceof Date ||
                    (typeof item.condition3 === 'number' && !isNaN(item.condition3))));
                if (flag) {
                    if (this.computed_addCondition.length !== 0) {
                        util
                            .ajaxJson({
                                url: '/crm/commonSearch/saveCommonSearch',
                                method: 'post',
                                data: {
                                    orgId: this.enterpriseId,
                                    type: this.columnType,
                                    userId: this.userId,
                                    searchContent: JSON.stringify(this.computed_addCondition),
                                    searchName: this.custom_search_name
                                }
                            })
                            .then(res => {
                                if (res.data.code === '1') {
                                    this.get_commonSearch();
                                    this.$Message.success(this.$t('crm.Table.success_save'));
                                } else {
                                    this.$Message.error(this.$t('crm.Table.error_save'));
                                    this.saveSearchLoading = false;
                                }
                            });
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_save'));
                        this.saveSearchLoading = false;
                    } // 否则，如果检索条件 List 不为空，则存入 localstorage ，不然报错
                } else {
                    this.$Message.info(this.$t('crm.Table.info_saveEmptyConditions'));
                    this.saveSearchLoading = false;
                }
            }, // 保存为常用检索
            /** 获取常用检索 */
            get_commonSearch() {
                util
                    .ajaxJson({
                        url: '/crm/commonSearch/getCommonSearchList',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            type: this.columnType,
                            userId: this.userId
                        }
                    })
                    .then(res => {
                        if (res.data.code === '1') {
                            this.list_commonSearch = res.data.data;
                        } else {
                            this.$Message.error(this.$t('crm.Table.error_getCommonSearchList'));
                        }
                        this.saveSearchLoading = false;
                    })
                    .catch(erro => {
                        this.$Message.error(this.$t('crm.Table.error_getCommonSearchList'));
                        this.saveSearchLoading = false;
                    });
            },
            // 常用检索
            searchCommon(item) {
                if (item.searchContent) {
                    this.filtering = 'searchCommon';
                    this.id_selected_commonSearch = item.id;
                    this.common_conditions = this.$options.filters.parseArray(item.searchContent);
                    this.merge_query_list();
                    this.curPage = 1;
                    this.refreshData();
                } else {
                    this.$Message.error(this.$t('crm.Table.error_getCommonSearchItem'));
                }
            }, // 点击常用检索项检索

            /** 删除常用检索项 */
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
            sureDel_commonSearch() {
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
                    } else {
                        this.$Message.error(this.$t('crm.UniSet.error_delete'));
                    }
                    this.cancelDel_commonSearch();
                }).catch(erro => {
                    this.$Message.error(this.$t('crm.UniSet.error_delete'));
                    this.cancelDel_commonSearch();
                });
            },

            /* 设为无关留言 */
            trashyMsg(id, index, flag) {
                this.changStatus(id, index, flag);
            },
            changStatus(id, index, flag) {
                util
                    .ajax({
                        url: '/form-cust/form/updateColumnValueStatus',
                        method: 'post',
                        data: {
                            id: id,
                            status: flag
                        }
                    })
                    .then(response => {
                        if (response.data.code === '1') {
                            //                        this.data1[index].status=flag;
                            Vue.set(this.data1[index], 'status', flag);
                            /* 为了更新视图 */
                            this.data1.push('');
                            this.data1.pop('');

                            if (flag === 100) {
                                this.$Message.success(this.$t('website.set_trash'));
                            } else if (flag === 1) {
                                this.$Message.success(this.$t('website.reset'));
                            }
                        }
                    });
            },
            /** 显示修改备注模态框 */
            showRemark(index) {
                this.showRemarkModal = true;
                this.remarkText = this.data1[index].remark;
                this.remarkIndex = index;
            },
            /** 保存备注 */
            saveRemark() {
                util
                    .ajax({
                        url: '/form-cust/form/updateColumnValueRemark',
                        method: 'post',
                        data: {
                            id: this.data1[this.remarkIndex].id,
                            remark: this.remarkText,
                            userName: this.fullName
                        }
                    })
                    .then(response => {
                        if (response.data.code === '1') {
                            this.$Message.success(this.$t('chat.remarkTip2'));
                            this.$set(this.data1[this.remarkIndex], 'remark', this.remarkText);
                            this.showRemarkModal = false;
                        }
                    });
            },
            handleCellChange(val, index, key) {
                const id = val[index].id;
                const Text = val[index][key];
                if (!Text) {
                    this.$Message.success(this.$t('chat.remarkTip'));
                    return false;
                }
                util
                    .ajax({
                        url: '/form-cust/form/updateColumnValueRemark',
                        method: 'post',
                        data: {
                            id: id,
                            remark: Text,
                            userName: this.fullName
                        }
                    })
                    .then(response => {
                        if (response.data.code === '1') {
                            this.$Message.success(this.$t('chat.remarkTip2'));
                        }
                    });
            },

            /* drawer */
            // 获取 leads 录入状态
            get_leads_status() {
                util.ajax({
                    url: '/v2-crm/contactProfileData/getContactProfileInfo',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        targetType: 8,
                        targetValues: [this.data_current_row.leadsId],
                        userId: this.userId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        // switch (response.data.data.type) {
                        //     // 询盘
                        //     case 1:
                        //         this.leads_status = 'customer';
                        //         this.leads_entered_id = response.data.data.id[0];
                        //         break;
                        //     // 线索
                        //     case 2:
                        //         this.leads_status = 'clue';
                        //         this.leads_entered_id = response.data.data.id[0];
                        //         break;
                        //     // 未录入
                        //     case 3:
                        //         this.leads_status = 'leads';
                        //         break;
                        // }
                        // if (this.leads_status === 'clue') {
                        //     if (this.leads_entered_id) {
                        //         this.show_leads_detail = true;
                        //     } else {
                        //         this.show_leads_detail = false;
                        //         this.$Message.error('出现错误');
                        //     }
                        // } else if (this.leads_status === 'customer') {
                        //     if (this.leads_entered_id) {
                        //         this.show_leads_detail = true;
                        //     } else {
                        //         this.show_leads_detail = false;
                        //         this.$Message.error('出现错误');
                        //     }
                        // } else {
                        //     this.show_leads_detail = true;
                        // }
                    } else {
                        this.show_leads_detail = false;
                        this.show_clue_detail = false;
                        this.show_inquiry_detail = false;
                    }
                }).catch(erro => {
                    this.show_leads_detail = false;
                    this.show_clue_detail = false;
                    this.show_inquiry_detail = false;
                });
            },
            // 点击每一行
            clickRow(data, column, event) {
                // 过滤表格页部分点击事件, 不弹出详情页
                const excludeClassNames = [
                    'fb-leads-edit-remark' // 编辑备注
                ];
                if (event && event.target && event.target.classList) {
                    const classList = event.target.classList;
                    if (excludeClassNames.some(item => classList.contains(item))) {
                        return;
                    }
                }

                const explorer = window.navigator.userAgent;
                let selector = '';
                // 判断浏览器
                if (explorer.indexOf('MSIE') >= 0 || explorer.indexOf('Opera') >= 0) {
                    const selected = document.selection.createRange();
                    selector = selected.text;
                } else {
                    selector = window.getSelection();
                }
                // 返回一个  Selection 对象，表示用户选择的文本范围或光标的当前位置。
                /*
                    None: 当前没有选择。
                    Caret: 选区已折叠（即 光标在字符之间，并未处于选中状态）。
                    Range: 选择的是一个范围。
                */
                if (selector.type !== 'Range') {
                    // 生成触点信息
                    util.ajaxJson({
                        url: '/form-cust/newtenant/touchpoint/genLeadsTouchPoint',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            leadsId: data.leadsId
                        }
                    }).then(response => {
                    });
                    this.data_current_row = data;
                    this.show_leads_detail = true;
                    // this.get_leads_status();
                }
            },
            // 获取crm授权字段
            get_columns_authorized() {
                util
                    .ajax({
                        url: '/crm/columnConfig/getFields',
                        method: 'get',
                        params: {
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            parentId: 0
                        }
                    })
                    .then(response => {
                        if (response.data.code === '1') {
                            // 暂存所有默认字段和自定义字段
                            const defaultFields = response.data.data && Array.isArray(response.data.data.default) ? response.data.data.default : [];
                            const customFields = response.data.data && Array.isArray(response.data.data.custom) ? response.data.data.custom : [];
                            // 筛选得到公司/询盘/联系人授权字段
                            this.$set(this.corp_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 1));
                            this.$set(this.corp_columns_authorized, 'custom', customFields.filter(col => col.parentId === 1));
                            this.$set(this.contact_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 2));
                            this.$set(this.contact_columns_authorized, 'custom', customFields.filter(col => col.parentId === 2));
                            this.$set(this.inquiry_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 3));
                            this.$set(this.inquiry_columns_authorized, 'custom', customFields.filter(col => col.parentId === 3));
                            if (this.corp_columns_authorized.default) {
                                this.corp_columns_authorized.default.forEach(item => {
                                    if (this.lang_company.hasOwnProperty(item.storageName)) {
                                        item.cname = this.lang_company[item.storageName];
                                    }
                                });
                            }
                            if (this.contact_columns_authorized.default) {
                                this.contact_columns_authorized.default.forEach(item => {
                                    if (this.lang_contact.hasOwnProperty(item.storageName)) {
                                        item.cname = this.lang_contact[item.storageName];
                                    }
                                });
                            }
                            if (this.inquiry_columns_authorized.default) {
                                this.inquiry_columns_authorized.default.forEach(item => {
                                    if (this.lang_inquiry.hasOwnProperty(item.storageName)) {
                                        item.cname = this.lang_inquiry[item.storageName];
                                    }
                                });
                            }
                        } else {
                            this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                        }
                    })
                    .catch(erro => {
                        this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                    });
            },
            toLine(name) {
                return name.replace(/([A-Z])/g, '_$1').toLowerCase();
            },
            handleSelectionChange(selection, row) {
                if (selection.length && Array.isArray(selection)) {
                    if (selection.length > 20) {
                        selection.splice(20);
                        this.$refs.table.toggleRowSelection(row, false);
                        this.$Message.warning(this.$t('facebook.leads.batchTips'));
                    }
                    this.selected_leads = selection;
                    this.isSelection = true;
                } else {
                    this.selected_leads = [];
                    this.isSelection = false;
                }
            },
            handleAllSelectionChange(selection) {
                if (selection.length && Array.isArray(selection) && this.isSelection) {
                    if (selection.length > 20) {
                        selection.splice(20);
                        this.$Message.warning(this.$t('facebook.leads.batchTips'));
                    }
                    this.selected_leads = selection;
                    this.isSelection = false;
                } else {
                    this.selected_leads = [];
                    selection = [];
                    this.isSelection = true;
                }
            },
            isRowSelectable(selection, index) {
                return selection.status === 1 && selection.a1009;
            },
            getRowKey(row) {
                return row.id;
            },
            handleBatchLeads() {
                this.visible_batch_leads = true;
            },
            handleBatchRefresh() {
                this.selected_leads = [];
                this.$refs.table.clearSelection();
                this.refreshData();
            },
            newStatus(status) {
                switch (status) {
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
            }
        }
    };
</script>

<style scoped lang="less">
.condition3 {
    width:220px;
    margin-right:5px;
}
.table /deep/ .el-table__empty-block {
    width: 100% !important;
}
.remark-text {
  display: inline-block;
  max-width: calc(~"100% - 44px");
}

.remark-tip {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remark-button {
  float: right;
  visibility: hidden;

}

.noborder-table {
  &::after {
    width: calc(~"100% + 30px");
  }
}

.appoint-sale {
  height: 68px;
  background-color: #f0f0f0;
  line-height: 68px;
  padding-left: 15px;
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
  position: relative;
  text-align: right;
}

.datewrap {
  margin-bottom: 15px;
  height: 43px;
}
.operate_wrap {
  margin-bottom: 15px;
  height: 43px;
  display: flex;
  margin-left: 10px;
  .batch_operate {
      display: block;
      margin-right: 20px;
      font-size: 12px;
      color:rgba(0, 0, 0, 0.8);
      align-self: center;
  }
  .hoverBtn {
      cursor: pointer;
      &:hover {
          color:#4285f4;
      }
  }
}

.datewrap > span {
  float: right;
  position: relative;
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
  width: 225px;
  display: inline-block;
}

.conditionwrap {
  max-height: 136px;
  overflow: auto;
}

::-webkit-scrollbar {
  width: 4px;
  height: 10px;
  background-color: #c9c9c9;
}

::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  background-color: #c9c9c9;
}

::-webkit-scrollbar-thumb {
  border-radius: 5px;
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  background-color: #fc8b2f;
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
  float: right;
  margin: 4px 10px 0 0;
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

</style>

<style>
.el-tooltip__popper{
    max-width: 250px;
}
/*表单始终铺满界面*/
.tabmain table {
  width: 100% !important;
}
</style>

<style lang="less" scoped>

.fb-msg {
  padding: 10px 30px 0 30px;

  td {
    &:hover {
      .remark-button {
        visibility: visible;
      }
    }
  }
}


.tabmain table {
  width: 100% !important;
}

.checkboxgroup > label {
  display: block;
  margin-bottom: 5px;
}

.export-data {
    padding: 5px 0 6px;
    font-size: 12px;
    color:rgba(0, 0, 0, 0.8);
    margin-left: 20px;
    /deep/ .custom {
        margin-right: 5px !important;
    }
}
.export-data:hover {
    color:#4285f4;
}
</style>
