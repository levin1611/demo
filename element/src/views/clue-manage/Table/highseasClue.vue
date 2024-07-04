<template>
  <div class="clue">
    <div class="adgroup">
      <div class="table_wrap">
        <div class="datewrap clearfix" style="position:relative;">
          <template v-if="selectedList.length">
            <div class="table-multiple-operate-btns" style="display: inline-block">
              {{ $t("crm.Table.selected") }}
              <span style="font-weight: bolder;color:#FA8241;">{{ selectedList.length }}</span>
              {{
                selectedList.length > 1
                  ? $t("crm.Table.item_clues")
                  : $t("crm.Table.item_clue")
              }}
                <!-- 群发单显  v-if="authorized_button['mergeData']"-->
                <!-- <Button type="minor"
                        style="font-size: 14px;"
                        @click="bulkSending">{{ $t('crm.Table.bulkSending') }}</Button> -->
                <!-- 发送WhatsApp -->
                <Button v-if="sendWhatsAppBtn" type="minor"
                        style="font-size: 14px; margin-left: 20px;"
                        @click="sendWhatsApp">{{ $t('crm.Table.sendWhatsApp') }}</Button>
                    <!-- 批量认领 -->
                <Button v-if="batch_claim_btn"
                    :loading="claimClueLoading"
                    type="minor"
                    class="piwik_batch_claim_highSeasCustomer"
                    style="font-size: 14px;"
                    @click="claimClue()"
                >
                    {{ $t("clue.claim_some") }}
                </Button>
            </div>
            <span>
                <!-- 关闭选中之后的操作栏 -->
              <Button type="text" @click="clearSelectedClues">
                <Icon type="md-close" size="18" color="#A9B9C9"></Icon>
              </Button>
            </span>
          </template>
          <template v-else>
            <!-- <h1 class="switch-title" style="display: inline-block">
              {{ $t("clue.public_clue") }}
            </h1> -->
            <div style="float: left;margin-top: 6px;">
                <TopFilter
                        :title.sync="title_topFilter"
                        type="highseasClue"
                        :flag_topFilter="flag_topFilter"
                        :type_topFilter="type_topFilter"
                        :allUsers="allUsers"
                        :allColumns="allColumns"
                        :config_tableFilter="config_tableFilter"
                        :selectOptions="selectOptions"
                        :columnType="columnType"
                        :filtering.sync="filtering"
                        :custom_conditions.sync="addCondition"
                        :common_conditions.sync="common_conditions"
                        :conditionList1="conditionList1"
                        :conditionList2="conditionList2"
                        :getSearchCon="getSearchCon"
                        :addChangeCon1="addChangeCon1"
                        :addChangeCon2="addChangeCon2"
                        sql_manager="highseasClueManagers"
                        ref="topFilter"
                        @refreshData="refreshData_filter">
                </TopFilter>
            </div>
            &nbsp;&nbsp;&nbsp;
            <!-- 筛选标签 -->
            <FilterTags
              style="left: 16px; top: 2px; height: 36px;"
              :order_column="order_column"
              :order_type="order_type"
              :langObj="langObj"
              :filterConObj.sync="config_tableFilter"
              :storageName_orderColumn="storageName_orderColumn"
              :width="600"
              :tagMaxWidth="300"
              @change_filter_tag="change_filter_tag"
              @emptySort="empty_sort"
              @removeCon="remove_filter_tag"
            >
            </FilterTags>
            <div style="display:inline-block" v-if="googleMarketingMd5">
                <Tag class="googleMarketing-filter" @close="closeGoogleMarketingSearch" closable>Google 广告访客关联的线索</Tag>
            </div>
            <span class="clearfix _btns_text_ml">
                <Tooltip :content="$t('crm.Table.exportData')" effect="dark" placement="bottom">
                    <Button
                        type="text"
                        v-if="export_data_btn"
                        icon="custom custom-file-download"
                        @click="exportData"
                        class="custom-file-download-border"></Button>
                </Tooltip>
                <HelpTip :title="$t('helpTip.exportData')"></HelpTip>
                <template v-if="!is_marketing_station">
                        <span v-if="add_clue_btn || import_data_btn" class="newCreate-btn-group">
                            <!-- 外部按钮 -->
                            <template v-if="add_clue_btn">
                                <!-- 新建线索 -->
                                <Button
                                    type="text"
                                    class="newCreate-btn-group-newCreate"
                                    @click="enterClue()">
                                        {{$t('clue.add_clue')}}
                                </Button>
                            </template>
                            <template v-else>
                                <!-- 导入数据 -->
                                <Button
                                    type="text"
                                    icon="archive"
                                    v-if="import_data_btn"
                                    class="newCreate-btn-group-import clue-import-data"
                                    @click="importDataShow=true">
                                        {{$t('clue.import_data')}}
                                </Button>
                            </template>
                            <!-- 下拉 -->
                            <template v-if="add_clue_btn&&import_data_btn">
                                <Dropdown placement="bottom-end">
                                    <Button
                                        icon="custom custom-menu-arrow"
                                        class="dropIcon">
                                            <span style="display: none;">_</span>
                                    </Button>
                                    <DropdownMenu slot="dropdown">
                                        <DropdownItem @click.native.stop="importDataShow=true">
                                            <!-- 导入数据 -->
                                            <span v-if="import_data_btn">{{ $t('crm.Table.importData') }}</span>
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </template>
                        </span>
                    </template>
            </span>
          </template>
        </div>
        <div class="_min_height_100" :style="{ minHeight: table_height - 100 + 'px' }">
            <Spin v-if="loading" fix></Spin>
            <div class="table">
                <vxe-table
                    v-if="refreshColumnFlag"
                    :height="table_height"
                    :row-config="{useKey: true, keyField: 'id', isCurrent: true, isHover: true}"
                    :column-config="{resizable: true}"
                    :checkbox-config="{highlight: true, reserve: true}"
                    ref="table"
                    stripe
                    :data="allreportdata"
                    :scroll-x="{enabled: true, gt: 10}"
                    :scroll-y="{enabled: true, gt: 10}"
                    @cell-click="clickRow"
                    @contextmenu.native.prevent="$copyTableCellValue"
                    @checkbox-all="handleSelectAll"
                    @checkbox-change="handleSelectAll"
                    @resizable-change="handleTableColResizeEndVxeTable"
                    @scroll.native.capture="close_popper"
                    class="tabmain">
                    <vxe-column
                        title=""
                        width="48"
                        align="left"
                        fixed="left"
                        :resizable="false"
                        :show-overflow="false"
                        type="checkbox"
                    ></vxe-column>
                    <template v-for="(item, index) in currentColumns">
                        <vxe-column
                            :key="item.key"
                            :align="item.align"
                            :field="item.key"
                            :title="item.title"
                            :width="item.width"
                            show-header-overflow="tooltip"
                            show-overflow="tooltip"
                        >
                            <template #header="{ column }">
                                <div class="table-filter-container">
                                    <div class="table-filter-title" :title="column.title">{{ column.title }}</div>
                                    <template v-if="order_type && storageName_orderColumn === column.field">
                                        <span class="table-sort-icon-container">
                                            <Icon :class="`icon-custom-on ${order_type === 'asc' && 'icon-custom-on-active'}`" type="md-arrow-dropup"></Icon>
                                            <Icon :class="`icon-custom-on ${order_type === 'desc' && 'icon-custom-on-active'}`" type="md-arrow-dropdown"></Icon>
                                        </span>
                                    </template>
                                    <FilterBox ref="filterBoxList"
                                            :showPopper.sync="item.show_filter_content"
                                            :filtering="item.filtering"
                                            :columnKey="column.field"
                                            :columnCon="getSearchCon(column.field)"
                                            :column="column"
                                            :order_type.sync="order_type"
                                            :order_column.sync="order_column"
                                            :storageName_orderColumn.sync="storageName_orderColumn"
                                            :columnType="columnType"
                                            :sort="config_tableFilter[column.field].sort"
                                            :filter="config_tableFilter[column.field].filter"
                                            :filterType="config_tableFilter[column.field].filterType"
                                            :url="config_tableFilter[column.field].url"
                                            :placeholderDrop="config_tableFilter[column.field].placeholderDrop"
                                            :blank="config_tableFilter[column.field].blank"
                                            :dateOptions="config_tableFilter[column.field].dateOptions"
                                            :query.sync="config_tableFilter[column.field].query"
                                            :allList="config_tableFilter[column.field].allList"
                                            :confirmBtnCls="config_tableFilter[column.field].confirmBtnCls"
                                            :selectAll="config_tableFilter[column.field].selectAll"
                                            :withRole="config_tableFilter[column.field].withRole"
                                            @update_showPopper="(status) => { update_showPopper(status, index) }"
                                            @updateList="(checkAll) => { updateList(checkAll, column) }">
                                    </FilterBox>
                                </div>
                            </template>
                            <template #default="{ row }">
                                <Poptip
                                    @click.stop
                                    v-if="item.key == 'leadsId'"
                                    trigger.stop="click"
                                    popper-class="fb-lead-popper"
                                    width="180">
                                    <div class="fb-lead fb-lead-id">
                                        <p>FB Lead ID</p>
                                        <p @click="jumpToLeads(row.leadsId)">{{row.leadsId || '-'}}</p>
                                    </div>
                                    <div class="fb-lead fb-lead-name">
                                        <p>{{$t('clue.FB_name')}}</p>
                                        <p>{{row.partSys || '-'}}</p>
                                    </div>
                                    <div class="fb-lead fb-lead-createTime">
                                        <p>{{$t('clue.leads_create_time')}}</p>
                                        <p>{{row.leadsSubmitTime || '-'}}</p>
                                    </div>
                                    <div class="fb-lead fb-ad-id">
                                        <p>AD ID</p>
                                        <p>{{row.adId || '-'}}</p>
                                    </div>
                                    <div slot="reference" class="show-fb-lead-poptip" @click.stop>{{ row[item.key] || '-' }}</div>
                                </Poptip>
                                <Poptip
                                    @click.stop
                                    v-else-if="item.key == 'proj'"
                                    trigger.stop="click"
                                    popper-class="fb-lead-popper"
                                    width="280">
                                    <div class="fb-lead fb-lead-id">
                                        <p>{{$t('clue.visitor_id')}}</p>
                                        <p @click="jumpToVisitorHistory(row.proj)">{{row.proj || '-'}}</p>
                                    </div>
                                    <div class="fb-lead fb-lead-name">
                                        <p>{{$t('clue.traffic_source')}}</p>
                                        <p>{{row.trafficSource || '-'}}</p>
                                    </div>
                                    <div class="fb-lead fb-lead-createTime">
                                        <p>{{$t('clue.first_visit_url')}}</p>
                                        <p class="fb-url-link">{{row.sourceUrl || '-'}}</p>
                                    </div>
                                    <div class="fb-lead fb-ad-id">
                                        <p>{{$t('clue.service')}}</p>
                                        <p>{{row.serviceName || '-'}}</p>
                                    </div>
                                    <div slot="reference" @click.stop class="show-fb-lead-poptip">{{ row[item.key]  || '-'}}</div>
                                </Poptip>
                                <span v-else-if="item.formatter">
                                    {{ (item.formatter)(row,item,row[item.key] ) }}
                                </span>
                                <span v-else>
                                    {{ row[item.key] ?  row[item.key] : '-' }}
                                </span>
                            </template>
                        </vxe-column>
                    </template>
                    <vxe-column
                        width="40"
                        fixed="right"
                        align="center"
                        :resizable="false"
                        :show-header-overflow="false"
                        :show-overflow="false"
                    >
                        <template slot="header">
                            <i class="custom custom-table-edit-columns"
                                style="font-size: 18px"
                                @click="visible_edit_columns = true"
                            ></i>
                        </template>
                    </vxe-column>
                    <template #empty>
                        <div class="custom_table-empty">
                            <span>{{$t('crm.Table.noFilterData')}}</span>
                            <span class="custom_table-empty_button" @click="() => {clearFilterConditionByInitView()}">{{$t('crm.Table.noFilterDataButton')}}</span>
                        </div>
                    </template>
                </vxe-table>
                <div class="pagewrap">
                    <Page
                        ref="page"
                        :total="totalpage"
                        :page-sizes="pagesizeopts"
                        :current-page="curPage"
                        :pageSize="pageSize"
                        layout="total, prev, pager, next, sizes, jumper"
                        placement="top"
                        @size-change="sizeChange"
                        @current-change="changePage"
                        >
                    </Page>
                </div>
            </div>
        </div>
      </div>
    </div>
    <!-- 修改字段 -->
    <EditColumns
      :visible.sync="visible_edit_columns"
      :columnType="columnType"
      :id.sync="id_column_show_order"
      :allColumns="allColumns"
      :allGroup="allGroup"
      :group.sync="group"
    >
    </EditColumns>
        <!-- 线索详情侧边栏 -->
        <ClueDrawerList
        :visible.sync="show_clue_detail"
        originalType="highseasClue"
        type="highseasClue"
        :clueId.sync="clueId"
        @refreshData="refreshData"
        >
        </ClueDrawerList>
        <!-- 新增线索 -->
        <ClueModal
            v-model="clueModal"
            :title="$t('clue.add_clue')"
            class="modal companydata"
            modaltype="hightseas"
            :delLoading="delLoading"
            :json_data="json_data"
            :saveClueClass="'my-clue-enter-clue'"
            :saveClueAndInquiryClass="'my-clue-save-clue-and-inquiry'"
            :okEnterInquiryClass="'my-clue-enter-inquiry'"
            @on_cancle_clue="on_cancle_clue"
            @open_close="open_close">
        </ClueModal>
        <ImportData
            v-show="importDataShow"
            :userId="userId"
            @refreshData="refreshData"
            :visible.sync="importDataShow">
        </ImportData>
        <!-- 群发单显&发送WhatsApp -->
        <contactSelectionBox type="clue"
            originalType="highseasClue"
            :sendType="sendType"
            :visible.sync="visible_contact_selectionBox"
            :ids="selectedList.map(item => item.id)"
            :fieldColumns="fieldColumns"
            @refreshData="clearSelectedClues"></contactSelectionBox>
  </div>
</template>

<script>
    import util from '../../../libs/util';
    import { HANDLE_BUTTON, BUTTON_IDS, DIRECT_CREATE, TOP_FILTER_ITEM } from '@/api/config';
    import { mapState, mapGetters } from 'vuex';
    import TopFilter from '@/views/crm/Table/Components/Html/topFilter';
    import tableColResize from '@/mixins/tableColResize';
    import resetInitComponents from '@/mixins/resetComponentViewData';
    import { crmClue } from '@/api/crm';
    import { crmCommon } from '@/api/crm/index';
    const FilterTags = () => import('@/views/main-components/filter-tags');
    const EditColumns = () => import('@/views/crm/Table/Components/Modal/editColumns');
    const ClueDrawerList = () => import('@/views/clue-manage/Detail/ClueDrawerList');
    const ClueModal = () => import('@/views/main-components/enter-clue/enter-clue');
    const ImportData  = () => import('@/views/clue-manage/Detail/Components/Modal/importData');

    import contactSelectionBox from '@/views/crm/Table/Components/Modal/contactSelectionBox';
    import tableBatchHandle from '@/mixins/tableBatchHandle';
    /* 根据第一选择筛选项设定第二筛选项的下拉框值 */
    const addChangeCon1 = function(index) {
        this.addCondition[index].condition2 = '';
        this.addCondition[index].condition3 = '';
        const key = this.addCondition[index].condition1;
        let tempAllUsers;
        switch (this.addCondition[index].condition1) {
            case 'a10013':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.textsocialNetwork
                ];
                this.addCondition[index].inputType = TOP_FILTER_ITEM.textsocialNetwork[0].childrenType;
                break;
            // 时间类
            case 'createTime':
            case 'editTime':
            case 'leadsSubmitTime':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.dateRange
                ];
                this.addCondition[index].inputType = TOP_FILTER_ITEM.dateRange[0].childrenType;
                break;
            case 'status':
            case 'source':
            case 'conversionStatus':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.select
                ];
                this.addCondition[index].conditionList3 = this.config_tableFilter[key].allList;
                this.addCondition[index].inputType = TOP_FILTER_ITEM.select[0].childrenType;
                break;
            /* 单选 */
            case 'formerSaleName':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.select
                ];
                this.addCondition[index].conditionList3 = [].concat(this.config_tableFilter[
                    key
                ].allList, []);
                this.addCondition[index].inputType = TOP_FILTER_ITEM.select[0].childrenType;
                break;
            case 'serviceName':
            case 'createUser':
            case 'saleName':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.select
                ];
                tempAllUsers = this.allUsers.map(item => {
                    return {
                        label: item.fullname,
                        value: item.fullname
                    };
                });
                if (key === 'createUser') {
                    tempAllUsers.unshift({
                        label: '询盘云',
                        value: -2
                    });
                }
                this.addCondition[index].conditionList3 = tempAllUsers;
                this.addCondition[index].inputType = TOP_FILTER_ITEM.select[0].childrenType;
                break;
            default:
                const temp = this.allColumns.find((item) => item.key === this.addCondition[index].condition1);
                if (temp) {
                    switch (temp.type) {
                        case 'date':
                        case 'date+time':
                            this.addCondition[index].conditionList2 = [
                                ...TOP_FILTER_ITEM.dateRange
                            ];
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.dateRange[0].childrenType;
                            break;
                        case 'selectMultiple':
                            this.addCondition[index].conditionList2 = [
                                ...TOP_FILTER_ITEM.MultSelect
                            ];
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelect[0].childrenType;
                            this.addCondition[index].conditionList3 = this.config_tableFilter[key].allList;
                            this.addCondition[index].condition3 = '';
                            break;
                        case 'select':
                            this.addCondition[index].conditionList2 = [
                                ...TOP_FILTER_ITEM.select
                            ];
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.select[0].childrenType;
                            this.addCondition[index].conditionList3 = this.config_tableFilter[key].allList;
                            this.addCondition[index].condition3 = '';
                            break;
                        case 'number':
                            this.addCondition[index].conditionList2 = [
                                ...TOP_FILTER_ITEM.number
                            ];
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.number[0].childrenType;
                            this.addCondition[index].condition3 = [0, 0];
                            break;
                        default:
                            this.addCondition[index].conditionList2 = [
                                ...TOP_FILTER_ITEM.text
                            ];
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.text[0].childrenType;
                    }
                }
                break;
        }
    };
    /* 根据第二选择筛选项设定第三筛选项的下拉框值 */
    const addChangeCon2 = function(index) {
        switch (this.addCondition[index].condition1) {
            // 时间类
            case 'createTime':
            case 'editTime':
            case 'leadsSubmitTime':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.dateRange.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = '';
                if (this.addCondition[index].inputType === 'dateRange') {
                    this.addCondition[index].condition3 = [];
                }
                break;
            case 'formerSaleName':
            case 'serviceName':
            case 'createUser':
            case 'saleName':
            case 'status':
            case 'source':
            case 'conversionStatus':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.select.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = '';
                break;
            default:
                const temp = this.allColumns.find(item => item.key === this.addCondition[index].condition1);
                if (temp) {
                    switch (temp.type) {
                        case 'date':
                        case 'date+time':
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.dateRange.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                            this.addCondition[index].condition3 = '';
                            if (this.addCondition[index].inputType === 'dateRange') {
                                this.addCondition[index].condition3 = [];
                            }
                            break;
                        case 'selectMultiple':
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelect.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                            this.addCondition[index].condition3 = [];
                            break;
                        case 'select':
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.select.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                            if (this.addCondition[index].inputType === 'array') {
                                this.addCondition[index].condition3 = [];
                            } else {
                                this.addCondition[index].condition3 = '';
                            }
                            break;
                        case 'number':
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.number.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                            if (this.addCondition[index].inputType === 'numberRange') {
                                this.addCondition[index].condition3 = [0, 0];
                            } else {
                                this.addCondition[index].condition3 = '';
                            }
                            break;
                        default:
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.text.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                            this.addCondition[index].condition3 = '';
                            break;
                    }
                }
                break;
        }
        if (this.addCondition[index].inputType === 'null' || this.addCondition[index].inputType === 'nnull') {
            this.addCondition[index].condition3 = -1;
        }
        // 下面这行代码是不得已而为之,原因在于
        // BUG : 目前根据第一个下拉框决定第二个的选项数组的值,但是只要 change 前后选项数组值的长度一致,就会导致 change 后第二个选框选择下拉值显示无效(永远只显示 change 前的选择值, 第一个选框改回去才可以选择,但实际上只是显示无效,检索功能正常)
        // 解决思路: 通过 Vue-devTools 观察,发现 Select 的 data 上这两个属性值, selectedSingle 错误,所以使用 refs 取 Select 实例更正其数据
        // 因为 v-for ,这里取到的是只有一项的数组,用 [0] 取值
        // this.$refs[`selMiddle${index}`][0].selectedSingle === this.$refs[`selMiddle${index}`][0].model ? undefined : this.$refs[`selMiddle${index}`][0].selectedSingle = this.$refs[`selMiddle${index}`][0].model;
    };

    export default {
        components: {
            ClueDrawerList,
            FilterTags,
            EditColumns,
            TopFilter,
            ClueModal,
            ImportData,
            contactSelectionBox
        },
        mixins: [resetInitComponents, tableColResize, tableBatchHandle],
        name: 'highseasClue',
        computed: {
            ...mapState({
                button_list: (state) => state.app.button_list,
                lang: state => state.app.lang,
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                window_height: 'window_height',
                allUsers: state => state.crm.allUsers,
                is_marketing_station: state => state.app.is_marketing_station,
                selectOptions: state => state.crm.selectOptions

            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
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
                    .filter((item) =>
                        item.condition1 &&
                        item.condition2 &&
                        ((item.condition3 && item.condition3.length) ||
                        item.condition3 instanceof Date ||
                        (typeof item.condition3 === 'number' && !isNaN(item.condition3))
                        ))
                    .map((item) => {
                        const temp = {};
                        const con = this.getSearchCon(item.condition1);
                        const type = this.getSearchType(item.condition2);
                        switch (item.inputType) {
                            case 'string':
                            case 'number':
                            case 'boolean':
                            case 'select':
                            case 'null':
                            case 'nnull':
                                // if (con === 'former_sale_id' && !item.condition3) {
                                //     temp.$or = [];
                                //     const formerSaleId = {};
                                //     formerSaleId[con] = {};
                                //     if (type === '$eq') {
                                //         formerSaleId[con].$null = -1;
                                //     } else {
                                //         formerSaleId[con].$notnull = -1;
                                //     }
                                //     temp.$or.push(formerSaleId);
                                // } else {
                                temp[con] = {};
                                temp[con][type] = item.condition3;
                                // }
                                return temp;
                            case 'countryArea':
                                temp[con] = {};
                                temp[con][type] = item.condition3.replace('unknown', '');
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
                            case 'numberRange':
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
                                // 多选 包含全部 与不包含全部处理
                                if (['$andregex', '$andnregex', '$nregex', '$nin', '$eq', '$ne'].includes(type)) {
                                    temp.$and = item.condition3.map(val => {
                                        const temp = {};
                                        temp[con] = {};
                                        if (type === '$andregex') {
                                            temp[con].$regex = val;
                                        } else if (type === '$andnregex') {
                                            temp[con].$nregex = val;
                                        } else {
                                            temp[con][type] = val;
                                        }
                                        return temp;
                                    });
                                } else {
                                    temp.$or = item.condition3.map((val) => {
                                        const temp = {};
                                        temp[con] = {};
                                        temp[con][type] = val;
                                        return temp;
                                    });
                                }
                                return temp;
                        }
                    })
                    .filter((item) => !(!item || item === ''));
            },
            table_height() {
                let temp = this.window_height
                    ? this.window_height - 176
                    : document.body.clientHeight - 176;
                if (temp < 200) {
                    temp = 200;
                }
                // 转 element-ui 时, 表格样式错误, 加上这句后解决, 具体错误原因暂时未看
                temp += this.loading ? 1 : 0;
                return temp;
            },
            // 按钮权限
            export_data_btn() {
                return !HANDLE_BUTTON(BUTTON_IDS.CRM.highseasClue.export_data, this.button_list);
            },
            add_clue_btn() {
                return !HANDLE_BUTTON(BUTTON_IDS.CRM.highseasClue.add_clue, this.button_list);
            },
            import_data_btn() {
                return !HANDLE_BUTTON(BUTTON_IDS.CRM.highseasClue.import_data, this.button_list);
            },
            // 按钮权限
            batch_claim_btn() {
                return !HANDLE_BUTTON(BUTTON_IDS.CRM.highseasClue.batch_claim, this.button_list);
            },
            allGroup() {
                return this.allColumns.map((item) => item.key);
            },
            sendWhatsAppBtn() {
                return !HANDLE_BUTTON(BUTTON_IDS.WhatsApp.WA_Group_Btn_List.personGroupSend, this.button_list) || !HANDLE_BUTTON(BUTTON_IDS.WhatsApp.WA_Group_Btn_List.ApiGroupSend, this.button_list);
            }
        },
        data() {
            return {
                // 新版筛选所需参数----Start
                title_topFilter: '公海线索',
                flag_topFilter: false,
                type_topFilter: '',
                addChangeCon1: addChangeCon1,
                addChangeCon2: addChangeCon2,
                // 新版筛选所需参数----End
                claimClueLoading: false,
                refreshColumnFlag: false,
                currentClues: [],
                // Email: '',
                // seqNumber: '', // 线索编号
                // saleName: 'nobody',
                // saleId: -1,
                // source: 3, // 线索来源 1:访客历史,2:网站留言,3:直接创建,4:网站对话
                clueModal: false, // 线索框状态
                delLoading: false, // 弹出框loading
                json_data: {},
                loading: true, // 加载图标
                currentColumns: [], // 表格列名称
                allColumns: [], // 表格全部列
                totalpage: 0,
                allreportdata: [], // 所有数据
                curPage: 1,
                pageSize: 20,
                pagesizeopts: [20, 50, 100],
                templateId: '',
                conditionlist1: [], // 筛选字段：字段列表
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
                addCondition: [],
                common_conditions: [],
                // companyid: 0, // 客户跳转id
                filtering: false /* 筛选状态 */,
                // filterCon: {} /* 筛选条件 */,
                // id_selected_commonSearch: -1,
                // selected_filter_tab: 'search', // 检索 or 常用检索
                selectedList: [],

                /** 表头筛选 */
                order_column: localStorage.getItem('highSeasClue_order_column') ? localStorage.getItem('highSeasClue_order_column') : '', /* 排序列 */
                order_type: localStorage.getItem('highSeasClue_order_type') ? localStorage.getItem('highSeasClue_order_type') : '', /* 排序类型  asc desc */
                storageName_orderColumn: localStorage.getItem('highSeasClue_storageName_orderColumn') ? localStorage.getItem('highSeasClue_storageName_orderColumn') : '',

                queryData: {
                    $and: []
                },
                // 表头筛选条件
                sqlList_tableFilter: {},
                config_tableFilter: {
                    /* 固定指标 */
                    seqNumber: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    proj: {
                        sort: true,
                        filter: true,
                        filterType: 'string',
                        query: '',
                        allList: null
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
                        filterType: 'string',
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
                    },
                    currentUrl: {
                        sort: true,
                        filter: true,
                        filterType: 'string',
                        query: '',
                        allList: null
                    },
                    source: {
                        sort: true,
                        filter: true,
                        filterType: 'select',
                        selectAll: true, // 增加选项 全选
                        query: '',
                        blank: true, // 增加选项-空(未填写)
                        allList: [
                            { value: 2, label: this.$t('clue.web_msg') },
                            { value: 3, label: this.$t('clue.direct_create') },
                            { value: 4, label: this.$t('clue.web_conversation') },
                            { value: 5, label: 'Facebook Leads' },
                            { value: 6, label: this.$t('clue.fb_msg') },
                            { value: 7, label: this.$t('clue.fb_comment') },
                            { value: 9, label: this.$t('clue.data_import') },
                            { value: 10, label: this.$t('clue.website_order') }
                        ]
                    },
                    createTime: {
                        sort: true,
                        filter: true,
                        filterType: 'date',
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
                                        end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() -
                                            24 * 60 * 60 * 1000);
                                        start.setTime(new Date(
                                            start.getFullYear(),
                                            start.getMonth() - 1,
                                            1
                                        ).getTime());
                                        picker.$emit('pick', [start, end]);
                                    }
                                }
                            ]
                        }, // 时间选项
                        query: '',
                        allList: null
                    },
                    editTime: {
                        sort: true,
                        filter: true,
                        filterType: 'date',
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
                                        end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() -
                                            24 * 60 * 60 * 1000);
                                        start.setTime(new Date(
                                            start.getFullYear(),
                                            start.getMonth() - 1,
                                            1
                                        ).getTime());
                                        picker.$emit('pick', [start, end]);
                                    }
                                }
                            ]
                        }, // 时间选项
                        query: '',
                        allList: null
                    },
                    createUser: {
                        sort: true,
                        filter: true,
                        filterType: 'select',
                        selectAll: true, // 增加选项 全选
                        query: '',
                        allList: []
                    },
                    serviceName: {
                        sort: true,
                        filter: true,
                        filterType: 'select',
                        selectAll: true, // 增加选项 全选
                        query: '',
                        blank: true, // 增加选项-空(未填写)
                        allList: []
                    },
                    saleName: {
                        sort: true,
                        filter: false,
                        filterType: 'select',
                        selectAll: true, // 增加选项 全选
                        query: '',
                        allList: []
                    },
                    status: {
                        sort: true,
                        filter: true,
                        filterType: 'select',
                        selectAll: true, // 增加选项 全选
                        noBlank: true,
                        query: '',
                        allList: [
                            { value: 1, label: this.$t('clue.unfollowed') },
                            { value: 2, label: this.$t('clue.trash') },
                            { value: 3, label: this.$t('clue.inquiry') },
                            { value: 4, label: this.$t('clue.following') },
                            { value: 5, label: this.$t('clue.done') }
                        ]
                    },
                    conversionStatus: {
                        sort: true,
                        filter: true,
                        filterType: 'select',
                        blank: true, // 增加选项-空(未填写)
                        query: '',
                        allList: [
                            { value: 1, label: this.$t('clue.toaudit') },
                            { value: 2, label: this.$t('clue.success_back') }
                        ]
                    },
                    /* 固定字段 */
                    a1001: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    a1002: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    a1003: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'countryArea', // 筛选类型
                        query: [], // 筛选值 [code, name]
                        allList: null // 所有可能的筛选条件
                    },
                    a1004: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    a1005: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    a1006: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    a1007: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    a1008: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    a1009: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    a10010: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    a10011: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    a10012: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    a10013: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    a10014: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        query: [], // 筛选值
                        allList: [
                            {
                                value: 1,
                                label: this.$t('crm.Modal.male')
                            },
                            {
                                value: 2,
                                label: this.$t('crm.Modal.female')
                            }
                        ] // 所有可能的筛选条件
                    },
                    a10015: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    a10016: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    a10017: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    a10018: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        selectAll: true, // 增加选项 全选
                        // noBlank: true,
                        query: [], // 筛选
                        blank: true, // 增加选项-空(未填写)// 值
                        allList: [] // 所有可能的筛选条件
                    },
                    a10019: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        selectAll: true, // 增加选项 全选
                        // noBlank: true,
                        query: [], // 筛选值
                        blank: true, // 增加选项-空(未填写)
                        allList: [] // 所有可能的筛选条件
                    },
                    a10020: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        selectAll: true, // 增加选项 全选
                        // noBlank: true,
                        query: [], // 筛选值
                        blank: true, // 增加选项-空(未填写)
                        allList: [] // 所有可能的筛选条件
                    },
                    a10021: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        noBlank: true,
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    // 前负责人
                    formerSaleName: {
                        sort: true,
                        filter: true,
                        filterType: 'select',
                        query: '',
                        selectAll: true, // 增加选项 全选
                        blank: true, // 增加选项-空(未填写)
                        allList: []
                    }
                },
                langObj: {
                    /* 固定指标 */
                    seqNumber: this.$t('clue.clue_id'),
                    proj: this.$t('clue.proj_name'),
                    partSys: this.$t('clue.FB_name'),
                    leadsSubmitTime: this.$t('clue.leads_create_time'),
                    leadsId: 'FB Lead',
                    adId: 'Ad ID',
                    currentUrl: this.$t('clue.first_visit_url'),
                    source: this.$t('clue.create_way'),
                    createTime: this.$t('clue.create_time'),
                    editTime: this.$t('clue.edit_time'),
                    createUser: this.$t('clue.inputer'),
                    serviceName: this.$t('clue.service'),
                    saleName: this.$t('clue.sales'),
                    status: this.$t('clue.followUpStatus'),
                    conversionStatus: this.$t('clue.col_status'),

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
                    a10053: this.$t('crm.InqSet.contact_instagram'),
                    a10055: this.$t('crm.InqSet.corp_clientType'),
                    a10056: this.$t('crm.Table.col_customerSource'),
                    clueClass: this.$t('crm.InqSet.corp_leadLevel'),
                    formerSaleName: this.$t('crm.InqSet.corp_formerHead') // 前负责人
                },

                // 需要添加日期处理方法的字段
                dateOptionsFileds: ['editTime', 'leadsSubmitTime', 'createTime'],
                // 日期类型快捷操作的处理方法
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
                // 筛选下拉列表项
                allLists: {},

                /** 修改字段 */
                visible_edit_columns: false,
                columnType: 6, // 1客户2联系人3询盘4公海客户5线索6公海线索 7fbleads
                id_column_show_order: undefined,
                group: [],
                // 保存到后端的字段属性, 目前只有 width
                fieldStyle: {},

                /* drawer */
                clueId: '',
                show_clue_detail: false,
                tableFormatters: {
                    a10014: row => {
                        let a10014 = '-';
                        switch (`${row.a10014}`) {
                            case '1':
                                a10014 = this.$t('crm.Modal.male');
                                break;
                            case '2':
                                a10014 = this.$t('crm.Modal.female');
                                break;
                            default:
                                a10014 = row.a10014 ? row.a10014 : '-';
                                break;
                        }
                        return a10014;
                    },
                    conversionStatus: row => {
                        let status = '-';
                        switch (`${row.conversionStatus}`) {
                            case '1':
                                status = this.$t('clue.toaudit');
                                break;
                            case '2':
                                status = this.$t('clue.success_back');
                                break;
                            default:
                                status = row.conversionStatus ? row.conversionStatus : '-';
                                break;
                        }
                        return status;
                    }
                },
                tableOptions: {
                    status: [
                        { value: 1, label: this.$t('clue.unfollowed') },
                        { value: 2, label: this.$t('clue.trash') },
                        { value: 4, label: this.$t('clue.following') },
                        { value: 5, label: this.$t('clue.done') }
                    ]
                },
                googleMarketingMd5: '', // 仪表盘 google营销转化表跳转过来所携带的参数
				importDataShow: false, /* 导出数据 */
                close_popper: this.$debounce(() => {
                    // document.body.click();                    // 关闭表头筛选框浮层
                    if (this.currentColumns.some(item => item.show_filter_content)) {
                        this.currentColumns = this.currentColumns.map(item => {
                            item.show_filter_content = false;
                            return item;
                        });
                    }
                    // 关闭顶部 topFilter 浮层
                    if (this.$refs.topFilter) {
                        this.$refs.topFilter.doClose();
                    }
                    // 关闭表头筛选标签浮层
                    if (this.$refs.filterTags) {
                        this.$refs.filterTags.doClose();
                    }

                }, 100, true),
            };
        },
        created() {
            // 获取 下拉选项数据
            this.$store.dispatch('getSelectOptions');
            // 获取全部用户
            this.$store.dispatch('getAllUsers');
            // 获取前负责人列表数据
            this.getUserDataTables();
        },
        mounted() {
            if (localStorage.getItem('leadsCloud-clueId')) {
                const tempId = localStorage.getItem('leadsCloud-clueId');
                localStorage.removeItem('leadsCloud-clueId');
                this.show_clue_detail = false;
                // 从全局搜索页跳转到公海线索时, drawer 未加载, append to body 失效, 导致点击详情页时触发 drawer 的 click_blank 关闭详情页, 测试加载时间差后在这里延迟 1 秒加载
                setTimeout(() => {
                    this.show_clue_detail = true;
                    this.clueId = tempId;
                }, 1000);
            }
            if (this.$route.query && this.$route.query.leadsCloudClueId) {
                const tempId = this.$route.query.leadsCloudClueId;
                this.show_clue_detail = false;
                // 同上
                setTimeout(() => {
                    this.show_clue_detail = true;
                    this.clueId = tempId;
                }, 1000);
            }
        },
        watch: {
            allUsers: {
                handler(val) {
                    if (val) {
                        // 设置本页面应用的全部用户
                        this.setAllUsers();
                    }
                }
            },
            group: {
                handler(val) {
                    this.changeGroups(val);
                },
                immediate: true
            },
            importDataShow: {
                handler(val) {
                    if (!val) {
                        this.refreshData();
                    }
                }
            },
            order_column: {
                handler(val) {
                    localStorage.setItem('highSeasClue_order_column', val);
                    localStorage.setItem('highSeasClue_storageName_orderColumn', this.storageName_orderColumn);
                },
                immediate: true
            },
            order_type: {
                handler(val) {
                    localStorage.setItem('highSeasClue_order_type', val);
                },
                immediate: true
            },
            // storageName_orderColumn: {
            //     handler(val) {
            //         localStorage.setItem('highSeasClue_storageName_orderColumn', val);
            //     },
            //     immediate: true
            // }
        },
        methods: {
            // 弹出新增线索模态框
            enterClue() {
                this.json_data = {
                    templateId: this.templateId,
                    source: DIRECT_CREATE,
                    enterpriseId: this.enterpriseId,
                    userId: this.userId,
                    userName: this.userName
                };
                this.clueModal = true;
            },
            // 取消录入线索
            on_cancle_clue(data) {
                this.clueModal = data.close;
            },
            // 关掉新建线索模态框
            open_close(data) {
                this.clueModal = data.close;
                this.refreshData();
            },
            // 跳转到fb lead详情页
            jumpToLeads(id) {
                if (!this.isContainsMenu('fb_message')) {
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionFBLeads'));
                } else {
                    if (id) {
                        localStorage.setItem('leadsCloud-FBLeadsId', id);
                        window.open(this.$router.resolve({
                            name: 'fb_message'
                        }).href, '_blank');
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_FbLeads'));
                    }
                }
            },
            // 跳转到访客历史详情页
            jumpToVisitorHistory(id) {
                if (!this.isContainsMenu('visitor_history')) {
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionVisitorHistory'));
                } else {
                    if (id) {
                        localStorage.setItem('leadsCloud-VisitorHistoryId', id);
                        window.open(this.$router.resolve({
                            name: 'visitor_history'
                        }).href, '_blank');
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_VisitorHistory'));
                    }
                }
            },
            /* 多选操作 */
            // 表格全选
            handleSelectAll({ records, reserves }) {
                const selectedList = records.concat(reserves);
                if (selectedList.length > 0) {
                    this.selectedList = selectedList.map((item) => {
                        return {
                            id: item.id,
                            status: item.status,
                            createUserId: item.createUserId,
                            serviceId: item.serviceId
                        };
                    });
                } else {
                    this.selectedList = [];
                }
            },
            // 关闭选中数据之后的操作栏
            clearSelectedClues() {
                //  清空选中项
                this.$refs.table.clearCheckboxRow();
                this.$refs.table.clearCheckboxReserve();
                this.selectedList = [];
            },
            /** 获取本公司所有 未被删除，并且状态是开启 的用户列表  */
            setAllUsers() {
                const createUserArr = this.allUsers.map((item) => {
                    return { value: item.fullname, label: item.fullname };
                });
                // 录入人员查询增加询盘云字段
                createUserArr.unshift({
                    value: -2,
                    label: '询盘云'
                });
                this.$set(
                    this.config_tableFilter.createUser,
                    'allList',
                    createUserArr
                );
                this.$set(
                    this.config_tableFilter.serviceName,
                    'allList',
                    this.allUsers.map((item) => {
                        return { value: item.fullname, label: item.fullname };
                    })
                );
                this.$set(
                    this.config_tableFilter.saleName,
                    'allList',
                    this.allUsers.map((item) => {
                        return { value: item.fullname, label: item.fullname };
                    })
                );
            },
            /** 获取前负责人的列表数据 */
            getUserDataTables() {
                const data = {
                    pageNo: 1,
                    pageSize: 10000,
                    orgId: this.enterpriseId,
                    departmentId: 0
                };
                crmClue.getUserDataTables(data).then((data) => {
                    if (data.code === '1') {
                        const allUsersList = data.data.list.sort((a, b) => a.createDate - b.createDate);
                        this.$set(
                            this.allLists,
                            'formerSaleName', allUsersList.map((item) => {
                                return { value: item.id, label: item.fullname };
                            })
                        );
                        // 解决 获取前负责人数据 响应速度不确定 会导致前负责人下拉数据不显示， 字段接口放到这请求
                        this.getClueFrontList();
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                    }
                });
            },
            init_filter(key, title, val, fieldType, colType) {
                // key: storageName , title: 多语言, val: query值
                // return filtering true/false
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
                                    case 'inquiryManagers':
                                        result.$regex = val.map((item) => item.value);
                                        break;
                                    default:
                                        // 表头筛选中只能有单个选项值的(单选型字段 + 创建人这种表格才有的字段)属性, 筛选时使用 $eq 等于, 其他用 $regex 包含
                                        let type = '$regex';
                                        switch (key) {
                                            case 'status':
                                            case 'conversionStatus':
                                            case 'saleName':
                                            case 'source':
                                            case 'a10014':
                                            case 'a10019':
                                            case 'a10020':
                                            case 'createUser':
                                            case 'formerSaleName':
                                                type = '$eq';
                                                break;
                                            default:
                                                if (fieldType === 'custom' && colType === 'select') {
                                                    type = '$eq';
                                                }
                                        }
                                        result.$or = val.map((item) => {
                                            const temp = {};
                                            temp[con] = {};
                                            item.value === null
                                                ? (temp[con].$null = -1)
                                                : (temp[con][type] = item.value);
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
            //  点击表头上方的筛选项改变筛选条件（日期支持）
            async change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    /* 处理筛选 */
                    // 判断是否有值, 调整 sqlList
                    const column = this.allColumns.find((item) => item.key === key);
                    if (column) {
                        const con = this.getSearchCon(key);
                        if (temp.query.length) {
                            const result = {};
                            switch (temp.filterType) {
                                case 'string':
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
                                    } else {
                                        this.$set(this.sqlList_tableFilter, con, {
                                            $regex: temp.query
                                        });
                                    }
                                    break;
                                case 'select':
                                    switch (con) {
                                        default:
                                            let type = '$regex';
                                            switch (key) {
                                                case 'status':
                                                case 'saleName':
                                                case 'source':
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
                                            result.$or = temp.query.map((item) => {
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

                        /* 刷新列表 */
                        this.merge_query_list();
                        this.changePage(1);
                    } else {
                        this.remove_filter_tag(key);
                    }
                } else {
                    this.remove_filter_tag(key);
                }
            },
            // 表头筛选相关
            async updateList(checkAll, column) {
                const temp = this.config_tableFilter[column.field];
                temp.checkAll = checkAll; // 是否勾选【全选】
                if (temp) {
                    /* 处理筛选 */
                    // 判断是否有值, 调整 sqlList
                    const con = this.getSearchCon(column.field);
                    if (temp.query.length) {
                        const result = {};
                        switch (temp.filterType) {
                            case 'string':
                                // 国家地区
                                if (con === 'a1003') {
                                    let tempContryName = '';
                                    if (temp.query === '中国') {
                                        tempContryName = 'CN';
                                    } else if (temp.query === '墨西哥') {
                                        tempContryName = 'MX';
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
                                } else {
                                    this.$set(this.sqlList_tableFilter, con, {
                                        $regex: temp.query
                                    });
                                }
                                break;
                            case 'select':
                                switch (con) {
                                    default:
                                        let type = '$regex';
                                        switch (column.field) {
                                            case 'status':
                                            case 'conversionStatus':
                                            case 'saleName':
                                            case 'source':
                                            case 'a10014':
                                            case 'a10019':
                                            case 'a10020':
                                                type = '$eq';
                                                break;
                                            case 'formerSaleName':
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
                                        result.$or = temp.query.map((item) => {
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
                        this.currentColumns = this.currentColumns.map(item => {
                            if (item.key === column.field) {
                                item.filtering = true;
                            }
                            return item;
                        });
                    } else {
                        this.$delete(this.sqlList_tableFilter, con);
                        this.currentColumns = this.currentColumns.map(item => {
                            if (item.key === column.field) {
                                item.filtering = false;
                            }
                            return item;
                        });
                    }
                    this.selectedList = [];
                    /* 刷新列表 */
                    await this.merge_query_list();
                    this.changePage(1);
                    this.clearSelectedClues();
                }
            },
            update_showPopper(val, colIndex) {
                this.currentColumns = this.currentColumns.map((item, index) => {
                    if (index === colIndex) {
                        item.show_filter_content = val;
                    } else if (val) {
                        item.show_filter_content = false;
                    }
                    return item;
                });
                // 暂存下 备用方案
                // this.$refs.filterBoxList.forEach((item, index) => {
                //     if (index !== colIndex) {
                //         item.hide()
                //     }
                // })
                // console.log(val, field)
                // this.currentColumns.forEach((item, index) => {
                //     this.$set(item, 'show_filter_content', false);
                // })
            },
            // 表头筛选相关 结束
            // 合并表头筛选和右上角筛选
            async merge_query_list() {
                // 右上角筛选框优先级更高, a 为检索/常用检索条件, b 为表头检索条件
                const b = this.computed_sqlList_tableFilter;
                let aCopy = [];
                const a = [];
                switch (this.filtering) {
                    case 'search':
                        aCopy = this.computed_addCondition;
                        break;
                    case 'searchCommon':
                        aCopy = this.common_conditions;
                        break;
                }
                for (let i = 0; i < aCopy.length; i++) {
                    const item = aCopy[i];
                    if (item && item.a1003) {
                        const keys = Object.keys(item.a1003)[0];
                        const values = Object.values(item.a1003)[0];
                        if (['$null', '$nnull'].includes(keys)) {
                            a.push(item);
                        } else if (keys === '$regex' || keys === '$eq') {
                            const res = { $or: [] };
                            res.$or.push({ a1003: { [keys]: values } });
                            if (values === '中国') {
                                res.$or.push({ a1003: { [keys]: 'CN' } });
                                res.$or.push({ a1003: { [keys]: 'CN-unknown' } });
                            } else if (values === '墨西哥') {
                                res.$or.push({ a1003: { [keys]: 'MX' } });
                                res.$or.push({ a1003: { [keys]: 'MX-unknown' } });
                            } else {
                                const tempContryName = await this.getCountryCodeByName(values);
                                res.$or.push({ a1003: { [keys]: tempContryName } });
                                res.$or.push({ a1003: { [keys]: `${tempContryName}-unknown` } });
                            }
                            a.push(res);
                        } else {
                            a.push({ a1003: { [keys]: values } });
                            if (values === '中国') {
                                a.push({ a1003: { [keys]: 'CN' } });
                                a.push({ a1003: { [keys]: 'CN-unknown' } });
                            } else if (values === '墨西哥') {
                                a.push({ a1003: { [keys]: 'MX' } });
                                a.push({ a1003: { [keys]: 'MX-unknown' } });
                            } else {
                                const tempContryName = await this.getCountryCodeByName(values);
                                a.push({ a1003: { [keys]: tempContryName } });
                                a.push({ a1003: { [keys]: `${tempContryName}-unknown` } });
                            }
                        }
                        // a.push({ $or: [{ a1003: { [keys]: values } }, { a1003: { [keys]: tempContryName } }] });
                    } else {
                        a.push(item);
                    }
                }
                // 兼容历史数据
                const allColumnKeys = this.allColumns.map(item => this.getSearchCon(item.key));
                for (let i = 0; i < a.length; i++) {
                    const item = a[i];
                    if (Object.keys(item)[0] === '$or') {
                        const item_$or = item['$or'];
                        for (let j = 0; j < item_$or.length; j++) {
                            const self = item_$or[j];
                            if (!allColumnKeys.includes(Object.keys(self)[0])) {
                                item_$or.splice(j, 1);
                                j--;
                            }
                        }
                        if (!item_$or.length) {
                            a.splice(i, 1);
                            i--;
                        }
                    } else if (Object.keys(item)[0] === '$and') {
                        const item_$and = item['$and'];
                        for (let j = 0; j < item_$and.length; j++) {
                            const self = item_$and[j];
                            if (!allColumnKeys.includes(Object.keys(self)[0])) {
                                item_$and.splice(j, 1);
                                j--;
                            }
                        }
                        if (!item_$and.length) {
                            a.splice(i, 1);
                            i--;
                        }
                    } else {
                        if (!allColumnKeys.includes(Object.keys(item)[0])) {
                            a.splice(i, 1);
                            i--;
                        }
                    }
                }

                this.$set(this.queryData, '$and', a.concat(b));
            },
            // 清空google营销报表跳转筛选
            closeGoogleMarketingSearch() {
                localStorage.removeItem('dashboard_clue_filter_googleMarketing');
                this.googleMarketingMd5 = '';
                this.curPage = 1;
                this.refreshData();
            },
            // 检查路由传递过来的参数
            checkRouteParams() {
                // 处理仪表盘带 Map 类型筛选条件跳转
                if (localStorage.getItem('dashboard_highSea_clue_filters')) {
                    // 提取筛选条件 Map 数组
                    const initial_filter_cons = new Map(JSON.parse(localStorage.getItem('dashboard_highSea_clue_filters')));
                    localStorage.removeItem('dashboard_highSea_clue_filters');

                    // 其余正常筛选条件筛选
                    this.allColumns = this.allColumns.map((col) => {
                        if (this.config_tableFilter.hasOwnProperty(col.key)) {
                            col.filtering = initial_filter_cons.get(col.key)
                                ? this.init_filter(
                                    col.key,
                                    col.title,
                                    initial_filter_cons.get(col.key),
                                    col.fieldType,
                                    col.colType
                                )
                                : false;
                        }
                        return col;
                    });

                    // 请求表格数据
                    // this.merge_query_list();
                    // this.curPage = 1;
                    // this.refreshData();

                    // 停止向下执行
                    // return;
                }
                if (localStorage.getItem('dashboard_highSea_clue_filter_googleMarketing')) {
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', true);
                    this.googleMarketingMd5 = localStorage.getItem('dashboard_highSea_clue_filter_googleMarketing');
                    localStorage.removeItem('dashboard_highSea_clue_filter_googleMarketing');
                    // 请求表格数据
                    this.merge_query_list();
                    this.curPage = 1;
                    this.refreshData();
                }
                this.type_topFilter = 'searchCommon';
                this.flag_topFilter = !this.flag_topFilter;
                // 请求表格数据
                // this.merge_query_list();
                // this.curPage = 1;
                // this.refreshData();
            },
            // ============================================接口
            /**
             * @Date: 2020-05-19 17:50:20
             * @LastEditors: niumkiki
             * @description: 增加一个接口,根据国家地区获取它的编码名称
             * @param :
             * @return:
             */
            getCountryCodeByName(countryName) {
                return crmClue.getCountryCodeByName({ countryName }).then(res => {
                    if (res.code === '1') {
                        return res.data;
                    } else {
                        return null;
                    }
                });
            },
            /* 获取表头 */
            async getClueFrontList() {
                // const resData = await this.getXSShow();
                // // 获取到表头各字段的长度限制
                // const limitData = await getUpperLengthLimit({ serviceFlag: 'save_clue', orgId: this.enterpriseId });

                crmClue.getClueFrontList({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    configKey: 'highClue',
                    listType: this.columnType // listType：1客户，4公海客户,5线索
                }).then(resData => {
                    // 获取全部字段, 不要看变量名，由于逻辑修改了，减少后端修改所以变量名没改变
                    // this.allColumns = resData.data.showFieldList;
                    // 所有字段筛选出左侧复选框
                    this.allColumns = resData.data.showFieldList.filter(item => {
                        if (item.key === 'a1001') {
                            this.$set(this.fieldColumns, 'companyName', true);
                        }
                        if (item.key === 'a10011') {
                            this.$set(this.fieldColumns, 'jobTitle', true);
                        }
                        if (item.key === 'a10010') {
                            this.$set(this.fieldColumns, 'email', true);
                        }
                        if (item.key === 'a10052') {
                            this.$set(this.fieldColumns, 'whatsApp', true);
                        }
                        return item.key !== 'checkbox';
                    });
                    // 要显示的字段
                    const { id, showField, fieldStyle } = resData.data.fieldOrder;
                    const _showFields = this.allColumns.filter(item => showField.split(',').includes(item.key));
                    // 获取全部编辑字段
                    this.allFieldsList = _showFields.map(item => {
                        // const [key, value] = item;
                        const { key, title, type, isNeed, option } = item;
                        let formatOptions = option ? option.split('?') : [];
                        Object.keys(this.tableOptions).forEach(keys => {
                            if (key === keys) {
                                formatOptions = this.tableOptions[key];
                            }
                        });
                        return {
                            isNeed,
                            name: title,
                            key: `${key}`,
                            type: type,
                            option: formatOptions
                        };
                    });
                    // console.log(this.allFieldsList);
                    const list = resData.data.filterFieldMap;
                    Object.keys(list).forEach((key) => {
                        // date 类型增加 快捷操作按钮(默认字段)
                        if (this.dateOptionsFileds.includes(key)) {
                            list[key].dateOptions = this.dateOptions;
                        }
                        if (this.allLists[key]) {
                            list[key].allList = this.allLists[key];
                        }
                        if (list[key].query.length) {
                            list[key].query = JSON.parse(list[key].query);
                        }
                        this.$set(this.config_tableFilter, key, list[key]);
                    });
                    
                    this.allColumns.forEach((col, index) => {
                        if (Object.prototype.hasOwnProperty.call(this.config_tableFilter, col.key)) {
                            col.show_filter_content = false;
                            col.filtering = false;
                            col.title = this.langObj[col.key] || col.title;
                            this.langObj[col.key] = col.title;
                            if (this.tableFormatters[col.key]) {
                                col.formatter = this.tableFormatters[col.key];
                            } else if (col.type === 'selectMultiple') {
                                col.formatter = (row) => {
                                    if (row[col.key] && row[col.key].indexOf('[') > -1) {
                                        return JSON.parse(row[col.key]).length ? this.$options.filters.parseArray(row[col.key]).join(', ') : '-';
                                    } else {
                                        return row[col.key] ? row[col.key] : '-';
                                    }
                                };
                            }
                        } else {
                            col.title = this.langObj[col.key] || col.title;
                            if (this.tableFormatters[col.key]) {
                                col.formatter = this.tableFormatters[col.key];
                            }
                        }
                        return col;
                    });

                    if (resData.data.fieldOrder) {
                        // 处理字段宽度
                        this.fieldStyle = fieldStyle ? JSON.parse(fieldStyle) : {};
                        Object.entries(this.fieldStyle).forEach(([fieldKey, fieldObj]) => {
                            const column = this.allColumns.find(item => item.key === fieldKey);
                            if (column && fieldObj.width) {
                                column.width = fieldObj.width;
                            }
                        });
                    }
                    // 列表显示字段 key  ==== 配置表格显示项 开始 ============
                    if (resData.data.fieldOrder) {
                        if (typeof showField === 'string') {
                            const fieldArr = showField.split(',');
                            // 获取要显示的字段
                            // this.allFieldsList = this.allColumns.filter(item => fieldArr.includes(item.key));
                            this.group = fieldArr;
                        } else {
                            this.group = this.allGroup.slice();
                        }
                    } else {
                        this.group = this.allGroup.slice();
                    }
                    // console.log('-----', this.allFieldsList, this.allColumns);
                    this.templateId = resData.data.template.id;
                    const filterCon = this.allColumns.map(item => {
                        return {
                            value: item.key,
                            label: item.title
                        };
                    });
                    // 过滤掉 选择框、询盘编号、访问来源类别字段，获取到检索条件第一个选择框的下拉列表数据
                    this.conditionList1 = filterCon.filter((item) => {
                        return !['checkbox', 'inquiryNum', 'trafficSource'].includes(item.value);
                    });
                    // 检索条件的三个选择框的初始数据
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
                    this.id_column_show_order = id;
                    //  用户当前设置页数 开始
                    if (resData.data.userConfig && resData.data.userConfig.value) {
                        const size = parseInt(resData.data.userConfig.value);
                        this.pageSize = size;
                    } else {
                        this.pageSize = 20;
                        this.addPageSize();
                    }
                    // this.setFields();
                    // this.loading = false;
                    // 设置全部人员列表以供筛选
                    this.allUsers.length && this.setAllUsers();
                    // this.salesList.length && this.setSaleList();
                    this.merge_query_list();
                    this.checkRouteParams();
                    // this.refreshData();
                });
            },
            /* 添加PageSize */
            addPageSize() {
                const data = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    key: 'highClue',
                    value: this.pageSize.toString()
                };
                crmCommon.userconfigAdd(data);
            },
            // 表格数据处理逻辑
            async handleData(dataList) {
                const statusMap = {
                    1: this.$t('clue.unfollowed'),
                    2: this.$t('clue.trash'),
                    3: this.$t('clue.inquiry'),
                    4: this.$t('clue.following'),
                    5: this.$t('clue.done')
                };
                const sourceMap = {
                    1: this.$t('clue.history'),
                    2: this.$t('clue.web_msg'),
                    3: this.$t('clue.direct_create'),
                    4: this.$t('clue.web_conversation'),
                    5: 'Facebook Leads',
                    6: this.$t('clue.fb_msg'),
                    7: this.$t('clue.fb_comment'),
                    9: this.$t('clue.data_import'),
                    10: this.$t('clue.website_order')
                };
                for (let i = 0; i < dataList.length; i++) {
                    /* 创建时间和更新时间转换日期格式 */
                    dataList[i].createTime = new Date(dataList[i].createTime).format('yyyy-MM-dd hh:mm:ss');
                    dataList[i].editTime = dataList[i].editTime ? new Date(dataList[i].editTime).format('yyyy-MM-dd hh:mm:ss') : dataList[i].createTime;
                    dataList[i].partSys = dataList[i].partSys || '';
                    if (dataList[i].leadsSubmitTime) {
                        if (typeof (dataList[i].leadsSubmitTime) === 'string') {
                            dataList[i].leadsSubmitTime = dataList[i].leadsSubmitTime.substr(0, 19);
                        } else {
                            dataList[i].leadsSubmitTime = new Date(dataList[i].leadsSubmitTime).format('yyyy-MM-dd hh:mm:ss');
                        }
                    }
                    dataList[i].status = statusMap[dataList[i].status] || '';
                    dataList[i].source = sourceMap[dataList[i].source] || '';
                    let str = '';
                    if (dataList[i].a10013) {
                        if (dataList[i].a10013.slice(0, 1) != '[') {
                            dataList[i].a10013 = str;
                        } else {
                            JSON.parse(dataList[i].a10013).forEach(platform => {
                                if (platform.type) {
                                    str += `${platform.type}:${platform.account}  `;
                                } else if (platform.attrName) {
                                    str += `${platform.attrName}:${platform.attrValue}  `;
                                }
                            });
                            dataList[i].a10013 = str;
                        }
                    }
                }
            },
            handleTrafficSourceVal(key) {
                switch (key) {
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
                    default:
                        return key;
                }
            },
            /* 刷新表格数据 */
            refreshData() {
                if (this.queryData.$and.length > 0) {
                    this.googleMarketingMd5 = '';
                    localStorage.removeItem('dashboard_clue_filter_googleMarketing');
                }
                this.loading = true;
                const data = {
                    noSale: 1,
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    listType: this.listType,
                    templateId: this.templateId,
                    pageSize: this.pageSize,
                    pageNo: this.curPage,
                    orderColumn: this.toLine(this.order_column),
                    orderType: this.order_type,
                    query: JSON.stringify(this.queryData),
                    md5: this.googleMarketingMd5 ? this.googleMarketingMd5 : null
                };
                crmClue.getClueList(data).then((response) => {
                    if (response.code == 1) {
                        if (response.data.list == undefined) {
                            this.allreportdata = [];
                            this.totalpage = 0;
                            this.currentClues = [];
                        } else {
                            this.allreportdata = response.data.list || [];
                            this.handleData(this.allreportdata);
                            this.totalpage = response.data.total || 0;
                            this.currentClues = response.data.list.map((item) => {
                                return {
                                    id: item.id,
                                    status: item.status,
                                    createUserId: item.createUserId,
                                    serviceId: item.serviceId
                                };
                            });
                        }
                    }
                    this.loading = false;
                });
            },
            /* 改变每页条数 */
            sizeChange(size) {
                this.pageSize = size;
                this.curPage = 1;
                const data = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    key: 'highClue',
                    value: size.toString()
                };
                crmCommon.userconfigUpdate(data);
                this.refreshData();
                this.selectedList = [];
                this.clearSelectedClues();
            },
            /* 改变页码 */
            changePage(page) {
                this.curPage = page;
                this.refreshData();
            },
            /* 下载 */
            exportData() {
                // 限制半个小时之后可点击
                const date = new Date();
                const time = date.getTime();
                const storageDate = JSON.parse(localStorage.getItem('dateTimeObj'));

                if (storageDate) {
                    const date2 = time - storageDate[`time${this.listType}`];
                    const dateMath = Math.floor(date2 / (60 * 1000));
                    if (dateMath < 30) {
                        this.$Message.error('30分钟之内不可重复导出数据');
                        return;
                    }
                }
                const dateTimeObj = {
                    [`time${this.listType}`]: time
                };
                localStorage.setItem('dateTimeObj', JSON.stringify(dateTimeObj));

                const query = this.queryData
                    ? encodeURIComponent(JSON.stringify(this.queryData))
                    : '';
                /**
                 * @Date: 2020-06-08 17:44:40
                 * @LastEditors: niumkiki
                 * @description: 增加一个新接口，给后端返回前端显示的字段及字段顺序，还有非显示字段
                 * @param :
                 * @return:
                 */
                const sortedShowFieldVal = []; // 显示的字段名称
                const sortedShowFieldKey = []; // 显示的字段key
                const sortedHideFieldKey = []; // 隐藏的字段key
                const sortedHideFieldVal = []; // 隐藏的字段名称
                // 后端又要加上访问来源和询盘编号，上边先保留吧，省的他们又改
                const tempAllField = JSON.parse(JSON.stringify(this.allColumns));
                this.group.forEach((show, index) => {
                    tempAllField.forEach((all, index2) => {
                        if (show === all.key) {
                            sortedShowFieldVal.push(all.title);
                            sortedShowFieldKey.push(all.key);
                            tempAllField.splice(index2, 1);
                            index2--;
                        }
                    });
                });
                tempAllField.forEach((item) => {
                    sortedHideFieldKey.push(item.key);
                    sortedHideFieldVal.push(item.title);
                });
                // 减缓后端压力 前端分页下载多个文件
                const lastIdTag = new Date().getTime();
                if (this.totalpage > 60000) {
                    const lists = Math.ceil(this.totalpage / 60000);
                    for (let i = 0; i < lists; i++) {
                        setTimeout(() => {
                            const url = `${util.ajaxUrl}/form-cust/clue/downloadExcelV2?pageSize=60000&pageNo=${i + 1}&listType=10&userId=${this.userId}&orgId=${this.enterpriseId}&templateId=${this.templateId}&query=${query}&sortedShowFieldKey=${sortedShowFieldKey}&sortedShowFieldVal=${encodeURIComponent(sortedShowFieldVal)}&sortedHideFieldKey=${sortedHideFieldKey}&sortedHideFieldVal=${encodeURIComponent(sortedHideFieldVal)}&lastIdTag=${lastIdTag}`;
                            this.$stm.openNewWindow(url);
                        }, i * 1000);
                    }
                } else {
                    const url = `${util.ajaxUrl}/form-cust/clue/downloadExcelV2?pageSize=60000&pageNo=1&listType=10&userId=${this.userId}&orgId=${this.enterpriseId}&templateId=${this.templateId}&query=${query}&sortedShowFieldKey=${sortedShowFieldKey}&sortedShowFieldVal=${encodeURIComponent(sortedShowFieldVal)}&sortedHideFieldKey=${sortedHideFieldKey}&sortedHideFieldVal=${encodeURIComponent(sortedHideFieldVal)}&lastIdTag=${lastIdTag}`;
                    this.$stm.openNewWindow(url);
                }
            },
            /* 修改列 */
            changeGroups(selCol) {
                this.refreshColumnFlag = false;
                const orderObj = Object.assign(
                    {},
                    ...selCol.map((item, index) => {
                        const temp = {};
                        temp[item] = index;
                        return temp;
                    })
                );
                this.currentColumns = this.allColumns
                    .filter((col) => selCol.includes(col.key))
                    .sort((a, b) => {
                        return orderObj[a.key] - orderObj[b.key];
                    });
                // 获取全部编辑字段
                this.allFieldsList = this.currentColumns.map(item => {
                    // const [key, value] = item;
                    const { key, title, type, isNeed, option } = item;
                    let formatOptions = option ? option.split('?') : [];
                    Object.keys(this.tableOptions).forEach(keys => {
                        if (key === keys) {
                            formatOptions = this.tableOptions[key];
                        }
                    });
                    return {
                        isNeed,
                        name: title,
                        key: `${key}`,
                        type: type,
                        option: formatOptions
                    };
                });
                this.handleData(this.allreportdata);
                this.$nextTick(() => {
                    this.refreshColumnFlag = true;
                    this.selectedList = [];
                });
            },
            edit_columns() {
                this.visible_edit_columns = true;
            },
            /* 批量认领线索 */
            claimClue() {
                const idList = this.selectedList.map((item) => {
                    return item.id;
                });
                if (idList.length === 0) {
                    this.$Message.warning(this.$t('clue.one_least'));
                    return;
                }
                const idStr = idList.join(',');
                this.claimClueLoading = true;
                const data = {
                    orgId: this.enterpriseId,
                    ids: idStr,
                    saleId: this.userId,
                    saleName: this.fullName,
                    editUserId: this.userId,
                    editUser: this.fullName
                };
                crmClue.transfer(data).then((res) => {
                    if (res.code == 1) {
                        this.$Message.success(this.$t('clue.claim_success'));
                        this.clearSelectedClues();
                        this.refreshData();
                    } else {
                        this.$Message.error(this.$t('clue.claim_failed'));
                    }
                    this.claimClueLoading = false;
                })
                    .catch(() => {
                        this.$Message.error(this.$t('clue.claim_failed'));
                        this.claimClueLoading = false;
                    });
            },
            /** 筛选字段-获取检索类型 */
            getSearchCon(str) {
                switch (str) {
                    case 'formerSaleName':
                        return 'former_sale_id';
                    case 'createUser':
                        return 'create_user';
                    case 'serviceName':
                        return 'service_name';
                    case 'saleName':
                        return 'sale_name';
                    case 'seqNumber':
                        return 'seq_number';
                    case 'currentUrl':
                        return 'current_url';
                    case 'partSys':
                        return 'part_sys';
                    case 'leadsId':
                        return 'leads_id';
                    case 'adId':
                        return 'ad_id';
                    case 'leadsSubmitTime':
                        return 'leads_submit_time';
                    case 'createTime':
                        return 'create_time';
                    case 'editTime':
                        return 'edit_time';
                    case 'conversionStatus':
                        return 'conversion_status';
                    default:
                        return str;
                }
            },
            /** 获取检索条件对应的sql条件 */
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
            /** 清空筛选条件 */
            async remove_filter_tag(key) {
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
                const index = this.allColumns.findIndex((item) => item.key === key);
                if (index !== -1) {
                    const col = this.allColumns[index];
                    col.filtering = false;
                    this.$set(this.allColumns, index, col);
                    this.$delete(this.sqlList_tableFilter, this.getSearchCon(col.key));
                }

                await this.merge_query_list();
                this.curPage = 1;
                this.refreshData();
            },
            /** 删掉 sort tag */
            empty_sort() {
                // 清空
                this.order_column = '';
                this.order_type = '';
                localStorage.removeItem('highSeasClue_order_column');
                localStorage.removeItem('highSeasClue_order_type');
                localStorage.removeItem('highSeasClue_storageName_orderColumn');

                // 刷新
                this.curPage = 1;
                this.refreshData();
            },
            // 检索并刷新表格
            async refreshData_filter(type) {
                // type === 'mine' ? this.$store.commit('setListType', Number(2)) : this.$store.commit('setListType', Number(3));
                await this.merge_query_list();
                this.curPage = 1;
                this.refreshData();
            },
            /* 点击每一行 */
            toLine(name) {
                return name.replace(/([A-Z])/g, '_$1').toLowerCase();
            },
            /* 点击每一行 */
            clickRow({ row }) {
                const explorer = window.navigator.userAgent;
                let selecter = '';
                // 判断浏览器
                if (explorer.indexOf('MSIsE') >= 0 || explorer.indexOf('Opera') >= 0) {
                    const selected = document.selection.createRange();
                    selecter = selected.text;
                } else {
                    selecter = window.getSelection();
                }

                // 返回一个  Selection 对象，表示用户选择的文本范围或光标的当前位置。
                /*
                    None: 当前没有选择。
                    Caret: 选区已折叠（即 光标在字符之间，并未处于选中状态）。
                    Range: 选择的是一个范围。
                */
                if (
                    selecter.type != 'Range' &&
                    document.activeElement.tagName !== 'INPUT'
                ) {
                    this.clueId = row.id;
                    this.show_clue_detail = true;
                }
            }
        },
        beforeDestroy() { }
    };
</script>


<style lang="less">
@import "../../crm/Detail/Components/less/modal";
@import "../../crm/Detail/Components/less/detailPage";
@import url("../../crm/Table/Components/less/tablePage.less");
@import url("./clue.less");
.clue {
  height: 100%;

  .adgroup {
    height: 100%;
    .table_wrap {
      height: 100%;
    }

    .table {
      height: calc(100% - 58px);
    }
  }
}
.show-fb-lead-poptip:hover{
    color: #3B78DE;
    cursor: pointer;
}
</style>
<style lang="less" scoped>
.custom-file-download-border{
    margin: 0 8px 0 10px;
    height: 30px;
    padding: 0 8px;
    border: 1px solid #ABBFD5;
    border-radius: 4px;
}

.audience_icon_wrap {
  display: table;
  height: 100%;
  overflow: hidden;

  > span:not(:first-child) {
    padding-left: 5px;
  }
}
.el-popover.fb-lead-popper{
    margin: 0;
    padding: 0;
    .fb-lead {
        margin: 0 4px 20px;
        color: rgba(0, 0, 0, 0.6);
        font-size: 12px;
        p:nth-child(1){
            margin-bottom: 8px;
        }
        p:nth-child(2){
            font-size: 14px;
            color: rgba(0, 0, 0, 0.8);
        }
    }
    .fb-lead-id {
        p:nth-child(2){
            color: #3B78DE;
            cursor: pointer;
        }
    }
    .fb-ad-id {
        margin-bottom: 4px;
    }
    .fb-url-link {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
}
.googleMarketing-filter {
    display: inline-block;
    background-color: #F5F6F9;
    margin: 0 4px 0 4px;
    color: rgba(0, 0, 0, 0.8);
    border-radius: 16px;
    border-color: #F5F6F9;
    height: 32px;
    line-height: 31px;
    font-size: 12px;
    padding: 0 10px;
}
</style>
