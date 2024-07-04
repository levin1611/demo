<template>
    <div class="crm-table-page">
        <div style="min-width: 700px;">
            <div class="my-customer-top" :style="`${!selected_items.length && 'border-color: transparent;'}`">
                <!-- 操作栏 -->
                <div class="table-top-container">
                    <!-- 多选操作视图 -->
                    <template v-if="visible_batch_operate">
                        <div style="display: inline-block;color: rgba(0, 0, 0, 0.8);margin-bottom: -15px;"
                            class="table-multiple-operate-btns">
                            {{ $t("crm.Table.selected") }}
                            <!-- 选中客户条数 -->
                            <span style="font-weight: bolder;color:#FA8241;">{{ selected_items.length }}</span>
                            {{ selected_items.length > 1 ? $t("crm.Table.item_customers") : $t("crm.Table.item_customer") }}
                            <!-- 群发单显  v-if="authorized_button['mergeData']"-->
                            <!-- <Button type="minor"
                                    style="font-size: 14px;margin-left: 20px;"
                                    @click="bulkSending">{{ $t('crm.Table.bulkSending') }}</Button> -->
                            <!-- 发送WhatsApp -->
                            <Button v-if="authorized_button['sendWhatsApp']"
                                    type="minor"
                                    style="font-size: 14px; margin-left: 20px;"
                                    @click="sendWhatsApp">{{ $t('crm.Table.sendWhatsApp') }}</Button>
                            <!-- 批量认领客户 -->
                            <Button v-if="authorized_button['batchClaimCustomer']"
                                    class="piwik-crm-batch-claim"
                                    type="minor"
                                    style="font-size: 14px;"
                                    @click="batch_claim_customer">{{ $t("crm.Detail.claimCustomer") }}</Button>
                            <!-- 批量分配客户 -->
                            <Button v-if="authorized_button['batchDistributeCustomer']"
                                    type="minor"
                                    style="font-size: 14px;"
                                    @click="batch_distribute_customer">{{ $t("crm.Modal.title_distributeCustomer") }}</Button>
                        </div>

                        <!-- 清空已选 -->
                        <span style="position: absolute; right: 0">
                            <Icon type="md-close"
                                size="18"
                                color="#A9B9C9"
                                @click="clear_selected_items"
                                class="cursor-pointer"></Icon>
                        </span>
                    </template>
                    <!-- 正常视图 -->
                    <template v-else>
                        <!-- 改版顶部筛选 -->
                        <TopFilter
                                :title.sync="title_topFilter"
                                type="highseasCustomer"
                                :columnType="columnType"
                                :filtering.sync="filtering"
                                sql_manager="companyManagersBefore"
                                :allUsers="allUsers"
                                :allColumns="allColumns"
                                :allUsersList="allUsersList"
                                :selectOptions="selectOptions"
                                :custom_conditions.sync="addCondition"
                                :common_conditions.sync="common_conditions"
                                :conditionList1="conditionList1"
                                :conditionList2="conditionList2"
                                :getSearchCon="getSearchCon"
                                :addChangeCon1="addChangeCon1"
                                :addChangeCon2="addChangeCon2"
                                :flag_topFilter="flag_topFilter"
                                :type_topFilter="type_topFilter"
                                ref="topFilter"
                                @refreshData="refreshData_filter"></TopFilter>

                        &nbsp;&nbsp;&nbsp;
                        <!-- 筛选标签 -->
                        <FilterTags
                                style="left: 16px;"
                                :filterConObj.sync="config_tableFilter"
                                :storageName_orderColumn="storageName_orderColumn"
                                :order_column="order_column"
                                :order_type="order_type"
                                :langObj="langObj"
                                :width="600"
                                :tagMaxWidth="300"
                                ref="filterTags"
                                @change_filter_tag="change_filter_tag"
                                @emptySort="empty_sort"
                                @removeCon="remove_filter_tag"></FilterTags>
                        <!-- 新版按钮 -->
                        <div class="table-operate-btns _btns_text_ml">
                            <!-- 文件导出 -->
                            <Tooltip :content="$t('crm.Table.exportData')" effect="dark" placement="bottom">
                                <Button v-if="authorized_button['exportData']"
                                    type="text"
                                    icon="custom custom-file-download"
                                    @click="exportData"
                                    class="piwik_download_table_highSeasCustomer highseasCustomer-filedownload custom-file-download-border"></Button>
                            </Tooltip>
                            <HelpTip :title="$t('helpTip.exportData')"></HelpTip>
                        </div>
                    </template>
                </div>
            </div>
            <div class="_min_height_100"
                 :style="{ minHeight: table_height - 100 + 'px' }">
                <!-- loading -->
                <Spin v-if="loading"
                      fix></Spin>

                <!-- 表格 -->
                <div class="table" v-show="initTable">
                    <vxe-table
                        v-if="flag_refreshColumn"
                        :row-config="{useKey: true, keyField: 'companyId', isCurrent: true, isHover: true}"
                        :column-config="{resizable: true}"
                        :checkbox-config="{highlight: true, reserve: true}"
                        :scroll-x="{enabled: true, gt: 10}"
                        :scroll-y="{enabled: true, gt: 10}"
                        @resizable-change="handleTableColResizeEndVxeTable"
                        :data="tableData"
                        :height="table_height"
                        ref="table"
                        stripe
                        @scroll.native.capture="close_popper"
                        @current-change="clickRow"
                        @contextmenu.native.prevent="$copyTableCellValue"
                        @checkbox-change="handleSelectAll"
                        @checkbox-all="handleSelectAll"
                        class="tabmain">
                        <!-- 首列 checkbox -->
                        <vxe-column
                                fixed="left"
                                width="48"
                                align="left"
                                :resizable="false"
                                type="checkbox"></vxe-column>
                    <template >
                        <!-- 正常列 -->
                        <vxe-column
                                v-for="(item,index) in currentColumns" 
                                :key="item.key"
                                :field="item.key"
                                :align="item.align"
                                :title="item.title"
                                :width="item.width"
                                show-header-overflow="tooltip"
                                show-overflow="tooltip"
                                >
                                
                                <template #header="{ column, columnIndex }">
                                    <div class="table-filter-container">
                                        <div class="table-filter-title" :title="column.title">{{ column.title }}</div>
                                        <template v-if="order_type  && storageName_orderColumn === column.field">
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
                                                @update_showPopper="(status) => { update_showPopper(status, column.field) }"
                                                @updateList="(checkAll) => updateList(checkAll, column, index)">
                                        </FilterBox>
                                    </div>
                                </template>

                            <template slot-scope="scope">
                                <template v-if="item.key === 'cpMarker'">
                                    <Icon custom="custom-crm-mark"
                                          :color="scope.row.cpMarker === 1 ? '#FBBC04' : 'rgba(0, 0, 0, .18)'"
                                          size="12"></Icon>
                                </template>
                                <!-- 标签列 -->
                                <template v-else-if="item.key === 'iqLabel' && scope.row.iqLabel">
                                    <AbbrLabel v-if="$options.filters.parseArray(scope.row.iqLabel).length"
                                                :labels="$options.filters.parseArray(scope.row.iqLabel)"
                                                ref="abbrLabel"></AbbrLabel>
                                    <div class="positoon-relative" v-else>
                                        <span class="table-show-contant"> - </span>
                                        <span v-if="item.isOnlyRead !== 1 && item.isOnlyRead !== 2" @click.stop>
                                        <a href="javascript:void(0)" @click="handleClickEdit(item,scope.row, scope.row.index, $event)" class="table-show-edit custom custom-remark-edit"></a>
                                        </span>
                                    </div>
                                </template>
                                <template v-else-if="item.key === 'cpStarLevel'">
                                    <Rate :value="scope.row.cpStarLevel"
                                          disabled
                                          void-color="rgba(0, 0, 0, 0.14)"
                                          disabled-void-color="rgba(0, 0, 0, 0.14)"
                                          :colors="['#FFC909', '#FFC909', '#FFC909']"
                                          :icon-classes="['custom custom-star', 'custom custom-star', 'custom custom-star']"
                                          disabled-void-icon-class="custom custom-star"></Rate>
                                </template>
                                <template v-else-if="item.key === 'cpDynamic' && scope.row.cpDynamic">
                                    <div style="overflow: hidden; text-overflow: ellipsis">
                                        <template v-if="['1', '2', '3', '4', '5', '6'].includes(`${scope.row.cpDynamic.type}`)">
                                            <Icon color="#4285F2"
                                                  size="18"
                                                  :custom="`${`${scope.row.cpDynamic.type}` === '1' ? 'custom-dynamic-type-followUp' :
                                                  `${scope.row.cpDynamic.type}` === '2' ? 'custom-dynamic-type-mail' :
                                                  `${scope.row.cpDynamic.type}` === '3' ? 'custom-dynamic-type-whatsApp' :
                                                  `${scope.row.cpDynamic.type}` === '4' ? 'custom-dynamic-type-facebook' :
                                                  `${scope.row.cpDynamic.type}` === '5' ? 'custom-dynamic-type-source' :
                                                  `${scope.row.cpDynamic.type}` === '6' ? 'custom-dynamic-type-qiwei' :''}`"></Icon>
                                        </template>
                                        <span style="margin-left: 4px;" v-if="scope.row.cpDynamic.type+'' === '3'">
                                            {{ scope.row.cpDynamic.messageType+'' ==='1' ? scope.row.cpDynamic.message : scope.row.cpDynamic.messageType ? $t(`crm.Table.col_whatsapp_message_type${scope.row.cpDynamic.messageType}`):''}}
                                        </span>
                                        <span style="margin-left: 4px;" v-else-if="scope.row.cpDynamic.type+'' === '6'">
                                            {{ scope.row.cpDynamic.messageType+'' ==='1' ? scope.row.cpDynamic.message : scope.row.cpDynamic.messageType ? $t(`crm.Table.col_qiwei_message_type${scope.row.cpDynamic.messageType}`):''}}
                                        </span>
                                        <span style="margin-left: 4px" v-else>{{ scope.row.cpDynamic.message }}</span>
                                    </div>
                                </template>
                                <template v-else-if="item.formatter">{{ item.formatter(scope.row) }}</template>
                                <template v-else>{{ scope.row[item.key] ?  scope.row[item.key] : '-' }}</template>
                            </template>
                        </vxe-column>
                    </template>
                      <!-- 末列字段配置按钮 -->
                        <vxe-column 
                        width="40"
                        fixed="right"
                        align="center"
                        :resizable="false"
                        class-name="no-padding-cell">
                            <template slot="header" slot-scope="scope">
                                <i class="custom custom-table-edit-columns"
                                    style="font-size: 18px"
                                    @click="edit_columns"
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
                    <div>
                        <Page
                                :page-size="pageSize"
                                :page-sizes="pageSizeOpts"
                                :total="totalNum"
                                :current-page="curPage"
                                layout="total, prev, pager, next, sizes, jumper"
                                @current-change="changePage"
                                @size-change="pageSizeChange"
                                class="pageWrap-right"></Page>
                    </div>
                </div>
            </div>
        </div>
        <!-- 详情页 -->
        <CustomerDrawer :visible.sync="show_company_detail"
                        :id.sync="companyId"
                        type="highseasCustomer"
                        originalType="highseasCustomer"
                        :corp_columns_authorized="corp_columns_authorized"
                        :contact_columns_authorized="contact_columns_authorized"
                        :inquiry_columns_authorized="inquiry_columns_authorized"
                        @refreshData="refreshData"
                        @detailClaimSuccess="detailClaimSuccess"
                        v-on="$listeners"></CustomerDrawer>
        <!-- 修改字段 -->
        <EditColumns
                :visible.sync="visible_edit_columns"
                :group.sync="group"
                :id.sync="id_column_show_order"
                :columnType="columnType"
                :allColumns="allColumns"
                :allGroup="allGroup"
                :groupingRules="groupingRules"></EditColumns>

        <!-- 请求余量时的loading效果 -->
        <Spin fix v-if="isAllowanceLoading"></Spin>
        <!-- 批量认领客户 -->
        <BatchClaimCustomer
                ref="batchClaimCustomer"
                :visible.sync="visible_batch_claim_customer"
                :ids="selected_items.map((item) => item.companyId)"
                :claimAllowance="currentAllowance"
                @refreshData="refreshData({ clearSelected: true })"></BatchClaimCustomer>
        <!-- 批量分配客户 -->
        <BatchDistributeCustomer
                ref="batchDistributeCustomer"
                :visible.sync="visible_batch_distribute_customer"
                :ids="selected_items.map((item) => item.companyId)"
                @refreshData="refreshData({ clearSelected: true })"></BatchDistributeCustomer>
         <!-- 群发单显&发送WhatsApp -->
        <contactSelectionBox type="customer"
            originalType="highseasCustomer"
            :sendType="sendType"
            :visible.sync="visible_contact_selectionBox"
            :ids="selected_items.map(item => item.companyId)"
            :fieldColumns="fieldColumns"
            @refreshData="clear_selected_items"></contactSelectionBox>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS, TOP_FILTER_ITEM } from '@/api/config';
    import Utils from '@/utils/index';
    import TopFilter from '@/views/crm/Table/Components/Html/topFilter';
    import FilterTags from '@/views/main-components/filter-tags';
    import EditColumns from '@/views/crm/Table/Components/Modal/editColumns';
    import resetInitComponents from '@/mixins/resetComponentViewData';
    import BatchClaimCustomer from '@/views/crm/Detail/Components/Modal/batchClaimCustomer';
    import BatchDistributeCustomer from '@/views/crm/Detail/Components/Modal/batchDistributeCustomer';
    // import CustomerDrawer from '@/views/crm/Table/Components/Html/customerDrawer';
    import contactSelectionBox from '@/views/crm/Table/Components/Modal/contactSelectionBox';
    import tableColResize from '@/mixins/tableColResize';
    import tableBatchHandle from '@/mixins/tableBatchHandle';
    import { crmCommon, crmCompany } from '@/api/crm/index';
    const CustomerDrawer = () => import(/* webpackChunkName: "CustomerDrawer_highseacustomer" */ '@/views/crm/Table/Components/Html/customerDrawer');

    // 检索条件变化
    const addChangeCon1 = function(index) {
        this.addCondition[index].condition2 = '';
        this.addCondition[index].condition3 = '';
        switch (this.addCondition[index].condition1) {
            // 字符串型
            case 'cpCompanyName':
            case 'cpShortName':
            case 'cpMainProduct':
            case 'cpHomePage':
            case 'cpContactAddress':
            case 'iqSeqNumber':
            case 'iqDemandProducts':
            case 'iqRemark':
            case 'ctNickName':
            case 'ctEmail':
            case 'ctJobTitle':
            case 'ctJobGrade':
            case 'ctPhone':
            case 'ctWhatsApp':
            case 'ctInstagram':
            case 'ctRemark':
            case 'cpAutoSeq':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.text
                ];
                this.addCondition[index].condition2 = '$regex';
                this.addCondition[index].inputType = 'string';
                break;
            case 'ctSocialNetworkingPlatform':
            case 'cpDynamic':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.textsocialNetwork
                ];
                this.addCondition[index].condition2 = '$regex';
                this.addCondition[index].inputType = TOP_FILTER_ITEM.text[0].childrenType;
                break;
            // 多选型
            case 'iqProductCategory':
            case 'iqLabel':
                if (
                    Array.isArray(this.selectOptions[this.addCondition[index].condition1]) &&
                    this.selectOptions[this.addCondition[index].condition1].length
                ) {
                    this.addCondition[index].conditionList2 = [
                        ...TOP_FILTER_ITEM.MultSelect
                    ];

                    this.addCondition[index].condition2 = '$regex';
                    this.addCondition[index].inputType = 'array';
                    this.addCondition[index].condition3 = [];
                    this.addCondition[index].conditionList3 = this.selectOptions[
                        this.addCondition[index].condition1
                    ].map((item) => {
                        const { attrName, attrId } = item;
                        return { value: attrName, label: attrName };
                    });
                } else {
                    this.addCondition[index].conditionList2 = [
                        ...TOP_FILTER_ITEM.text
                    ];
                    this.addCondition[index].condition2 = '$regex';
                    this.addCondition[index].inputType = 'string';
                }
                break;
            // 单选型
            case 'cpClientType':
            case 'cpScale':
            case 'cpCompanySourceWay':
            case 'cpGiveupReason':
            case 'iqSourceChannel':
            case 'iqSourceWay':
            case 'iqGrouping':
            case 'iqFollowUp':
                if (
                    Array.isArray(this.selectOptions[this.addCondition[index].condition1]) &&
                    this.selectOptions[this.addCondition[index].condition1].length
                ) {
                    this.addCondition[index].conditionList2 = [
                        ...TOP_FILTER_ITEM.select
                    ];

                    this.addCondition[index].condition2 = '$eq';
                    this.addCondition[index].inputType = 'select';
                    this.addCondition[index].condition3 = '';
                    if (this.addCondition[index].condition1 === 'iqFollowUp') {
                        const followList = this.selectOptions[this.addCondition[index].condition1].map(item => {
                            const { attrName, attrId } = item;
                            return { value: attrId, label: attrName };
                        });
                        followList.splice(1, 0, {
                            value: -1,
                            label: this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry')
                        });
                        this.addCondition[index].conditionList3 = followList;
                    } else if (this.addCondition[index].condition1 === 'cpGiveupReason') {
                        this.addCondition[index].conditionList3 = [
                            {
                                value: -1,
                                label: '自动退入公海'
                            }
                        ].concat(this.selectOptions[this.addCondition[index].condition1].map((item) => {
                            const { attrName, attrId } = item;
                            return { value: attrId, label: attrName };
                        }));
                    } else {
                        this.addCondition[index].conditionList3 = this.selectOptions[
                            this.addCondition[index].condition1
                        ].map((item) => {
                            const { attrName, attrId } = item;
                            return { value: attrName, label: attrName };
                        });
                    }
                } else {
                    this.addCondition[index].conditionList2 = [
                        ...TOP_FILTER_ITEM.text
                    ];
                    this.addCondition[index].condition2 = '$regex';
                    this.addCondition[index].inputType = 'string';
                }
                break;
            case 'cpCreateUser':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.select
                ];
                this.addCondition[index].condition2 = '$eq';
                this.addCondition[index].inputType = 'select';
                this.addCondition[index].condition3 = '';
                this.addCondition[index].conditionList3 = [].concat(
                    [{ label: '询盘云', value: -2 }],
                    this.allUsers.map((item) => {
                        const { fullname: label, id: value } = item;
                        return { label, value };
                    })
                );
                break;
            case 'companyManagersBefore':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.MultSelectUser
                ];
                this.addCondition[index].condition2 = '$regex';
                this.addCondition[index].inputType = 'array';

                this.addCondition[index].condition3 = [];
                this.addCondition[index].conditionList3 = [].concat(
                    this.allUsersList.map((item) => {
                        const { fullname: label, id: value } = item;
                        return { label, value };
                    }),
                    [{ label: this.$t('crm.Table.empty'), value: -1 }]
                );
                break;
            // 数字
            case 'cpStarLevel':
            case 'cpFollowUpCount':
            case 'cpTouchCount':
            case 'cpNotFollowedDays':
            case 'cpTransactionInquiryCount':
            case 'cpTransactionMoneyRmb':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.number
                ];
                this.addCondition[index].condition2 = '$eq';
                this.addCondition[index].inputType = 'number';
                this.addCondition[index].condition3 = 0;
                break;
            // Boolean
            case 'cpMarker':
            case 'ctGender':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.boolean
                ];
                this.addCondition[index].condition2 = '$eq';
                this.addCondition[index].inputType = 'booleanSelect';
                this.addCondition[index].condition3 = 1;
                break;
            // 时间类
            case 'cpCreateTime':
            case 'cpUpdateTime':
            case 'cpLastFollowUpTime':
            case 'ctBirthday':
            case 'cpLastGiveupTime':
            case 'cpLastGetCompanyTime':
            case 'cpLastTransactionTime':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.dateRange
                ];
                this.addCondition[index].condition2 = '$range';
                this.addCondition[index].inputType = 'dateRange';
                this.$nextTick(() => {
                    const end = new Date();
                    const start = new Date();
                    end.setTime(end.getTime() - 3600 * 1000 * 24);
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                    this.addCondition[index].condition3 = [start, end];
                });
                break;
            // 国家地区
            case 'cpCountryArea':
                this.addCondition[index].conditionList2 = [
                    // {
                    //     value: '$eq',
                    //     label: this.$t('crm.Table.con_equal')
                    // },
                    // {
                    //     value: '$ne',
                    //     label: this.$t('crm.Table.con_unequal')
                    // }
                    ...TOP_FILTER_ITEM.contrySelect
                ];
                this.addCondition[index].condition2 = '$eq';
                this.addCondition[index].inputType = 'countryArea';
                this.addCondition[index].condition3 = '';
                break;
            // 自定义字段
            default:
                // eslint-disable-next-line no-case-declarations
                const temp = this.allColumns.find((item) => item.key === this.addCondition[index].condition1);
                if (temp) {
                    switch (temp.filterType) {
                        case 'date':
                        case 'date+time':
                            this.addCondition[index].conditionList2 = [
                                ...TOP_FILTER_ITEM.dateRange
                            ];
                            this.addCondition[index].condition2 = '$range';
                            this.addCondition[index].inputType = 'dateRange';
                            this.$nextTick(() => {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                                this.addCondition[index].condition3 = [start, end];
                            });
                            break;
                        case 'selectMultiple':
                            this.addCondition[index].conditionList2 = [
                                ...TOP_FILTER_ITEM.MultSelect
                            ];
                            this.addCondition[index].condition2 = '$regex';
                            this.addCondition[index].inputType = 'array';
                            this.addCondition[index].condition3 = [];
                            this.addCondition[index].conditionList3 = temp.option
                                .split('?')
                                .map((item) => {
                                    return { value: item, label: item };
                                });
                            break;
                        case 'select':
                            this.addCondition[index].conditionList2 = [
                                ...TOP_FILTER_ITEM.select
                            ];
                            this.addCondition[index].condition2 = '$eq';
                            this.addCondition[index].inputType = 'select';
                            this.addCondition[index].condition3 = '';
                            this.addCondition[index].conditionList3 = temp.option
                                .split('?')
                                .map((item) => {
                                    return { value: item, label: item };
                                });
                            break;
                        case 'text':
                        case 'textarea':
                        default:
                            this.addCondition[index].conditionList2 = [
                                ...TOP_FILTER_ITEM.text
                            ];
                            this.addCondition[index].inputType = 'string';
                    }
                } else {
                    this.addCondition[index].conditionList2 = [
                        ...TOP_FILTER_ITEM.text
                    ];
                    this.addCondition[index].inputType = 'string';
                }
        }
    };
    const addChangeCon2 = function(index) {
        switch (this.addCondition[index].condition1) {
            // 字符串型
            case 'cpCompanyName':
            case 'cpShortName':
            case 'cpMainProduct':
            case 'cpHomePage':
            case 'cpContactAddress':
            case 'cpDynamic':
            case 'iqSeqNumber':
            case 'iqDemandProducts':
            case 'iqRemark':
            case 'ctNickName':
            case 'ctEmail':
            case 'ctJobTitle':
            case 'ctJobGrade':
            case 'ctPhone':
            case 'ctWhatsApp':
            case 'ctInstagram':
            case 'ctRemark':
            case 'ctSocialNetworkingPlatform':
            case 'cpAutoSeq':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.text.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = '';
                break;
            // 多选型
            case 'iqLabel':
            case 'iqProductCategory':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelect.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = [];
                break;
            // 单选型
            case 'cpClientType':
            case 'cpScale':
            case 'cpCreateUser':
            case 'cpGiveupReason':
            case 'cpCompanySourceWay':
            case 'iqSourceChannel':
            case 'iqSourceWay':
            case 'iqGrouping':
            case 'iqFollowUp':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.select.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                if (this.addCondition[index].inputType === 'array') {
                    this.addCondition[index].condition3 = [];
                } else {
                    this.addCondition[index].condition3 = '';
                }
                break;
            // 数字
            case 'cpStarLevel':
            case 'cpFollowUpCount':
            case 'cpTouchCount':
            case 'cpNotFollowedDays':
            case 'cpTransactionInquiryCount':
            case 'cpTransactionMoneyRmb':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.number.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                if (this.addCondition[index].inputType === 'numberRange') {
                    this.addCondition[index].condition3 = [0, 0];
                } else {
                    this.addCondition[index].condition3 = 0;
                }
                break;
            // Boolean
            case 'cpMarker':
            case 'ctGender':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.boolean.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                if (this.addCondition[index].inputType === 'booleanMultSelect') {
                    this.addCondition[index].condition3 = [];
                } else {
                    this.addCondition[index].condition3 = 1;
                }
                break;
            // 时间类
            case 'cpCreateTime':
            case 'cpUpdateTime':
            case 'cpLastFollowUpTime':
            case 'ctBirthday':
            case 'cpLastGiveupTime':
            case 'cpLastGetCompanyTime':
            case 'cpLastTransactionTime':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.dateRange.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                if (this.addCondition[index].inputType === 'dateRange') {
                    this.addCondition[index].condition3 = [];
                } else {
                    this.addCondition[index].condition3 = '';
                }
                break;
            // 国家地区
            case 'cpCountryArea':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.contrySelect.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = '';
                break;
            case 'companyManagersBefore':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelectUser.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = [];
                break;
            // 自定义字段
            default:
                // eslint-disable-next-line no-case-declarations
                const temp = this.allColumns.find((item) => item.key === this.addCondition[index].condition1);
                if (temp) {
                    switch (temp.filterType) {
                        case 'date':
                        case 'date+time':
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.dateRange.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                            if (this.addCondition[index].inputType === 'dateRange') {
                                this.addCondition[index].condition3 = [];
                            } else {
                                this.addCondition[index].condition3 = '';
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
                        case 'text':
                        case 'textarea':
                        default:
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.text.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                            this.addCondition[index].condition3 = '';
                            break;
                    }
                } else {
                    this.addCondition[index].inputType = TOP_FILTER_ITEM.text.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                    this.addCondition[index].condition3 = '';
                }
        }
        if (this.addCondition[index].inputType === 'null' || this.addCondition[index].inputType === 'nnull') {
            this.addCondition[index].condition3 = -1;
        }
    };

    export default {
        name: 'highseasCustomer',
        mixins: [resetInitComponents, tableColResize, tableBatchHandle],
        components: {
            TopFilter,
            EditColumns,
            FilterTags,
            BatchClaimCustomer,
            BatchDistributeCustomer,
            CustomerDrawer,
            contactSelectionBox
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height',
                lang: state => state.app.lang,
                button_list: (state) => state.app.button_list,
                allUsers: state => state.crm.allUsers,
                highSeasGroupId: state => state.crm.highSeasGroupId,
                allSelectOptions: state => state.crm.selectOptions
            }), // 从 vuex 中获取属性
            visible_batch_operate() {
                return this.selected_items.length > 0;
            },
            table_height() {
                let temp = this.window_height
                    ? this.window_height - 174
                    : document.body.clientHeight - 174;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            },
            allGroup() {
                return this.allColumns.map((item) => item.key);
            },
            authorized_button() {
                const ids = BUTTON_IDS.CRM.highSeas;
                return {
                    exportData: !HANDLE_BUTTON(
                        ids.dataExport.documentDownload,
                        this.button_list
                    ),
                    batchClaimCustomer: !HANDLE_BUTTON(
                        ids.edit.batchClaimCustomer,
                        this.button_list
                    ),
                    batchDistributeCustomer: !HANDLE_BUTTON(
                        ids.edit.batchDistributeCustomer,
                        this.button_list
                    ),
                    sendWhatsApp: !HANDLE_BUTTON(BUTTON_IDS.WhatsApp.WA_Group_Btn_List.personGroupSend, this.button_list) || !HANDLE_BUTTON(BUTTON_IDS.WhatsApp.WA_Group_Btn_List.ApiGroupSend, this.button_list)
                };
            },

            // 转换筛选条件数组
            computed_addCondition() {
                return this.addCondition
                    .filter((item) =>
                        item.condition1 &&
                        item.condition2 &&
                        ((item.condition3 && item.condition3.length) ||
                        item.condition3 instanceof Date ||
                        (typeof item.condition3 === 'number' && !isNaN(item.condition3))))
                    .map((item) => {
                        const temp = {};
                        const con = this.getSearchCon(item.condition1);
                        // let type = this.getSearchType(item.condition2);
                        const type = item.condition2;
                        switch (item.inputType) {
                            case 'string':
                            case 'number':
                            case 'boolean':
                            case 'booleanSelect':
                            case 'select':
                            case 'null':
                            case 'nnull':
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
                            case 'numberRange':
                                if (typeof item.condition3[0] === 'number' && typeof item.condition3[1] === 'number') {
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
                                }
                                break;
                            case 'booleanMultSelect':
                            case 'array':
                                switch (con) {
                                    case 'cpCompanyManagers':
                                    case 'companyManagersBefore':
                                        temp[con] = {};
                                        temp[con][type] = item.condition3;
                                        break;
                                    default:
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
                                }
                                return temp;
                        }
                    })
                    .filter((item) => !(!item || item === ''));
            },
            computed_sqlList_tableFilter() {
                return Object.entries(this.sqlList_tableFilter).map(([key, val]) => {
                    const temp = {};
                    // 数组型 - 日期型 - 字符串型/国家地区
                    if (val.hasOwnProperty('$or')) {
                        temp.$or = val.$or;
                        // 数字组件改为两个数字,这里做了一些特殊处理
                    } else if (['cpTouchCount', 'cpFollowUpCount', 'cpNotFollowedDays', 'cpTransactionMoneyRmb', 'cpTransactionInquiryCount'].includes(key)) {
                        temp.$and = val.$and;
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
            }
        },
        data() {
            return {
                cancelFunc: null,
                allUsersList: [], // 全部用户，包括已经离职的、禁用的
                /* 多语言 */
                langObj: {
                    // 公司字段
                    // 默认字段
                    cpAutoSeq: this.$t('crm.Table.col_customerNumber'),
                    cpCompanyName: this.$t('crm.Modal.corp_companyName'),
                    cpStarLevel: this.$t('crm.Modal.corp_starLevel'),
                    cpShortName: this.$t('crm.Modal.corp_shortName'),
                    cpCountryArea: this.$t('crm.Modal.corp_countryArea'),
                    cpMainProduct: this.$t('crm.Modal.corp_mainProduct'),
                    cpScale: this.$t('crm.Modal.corp_scale'),
                    cpClientType: this.$t('crm.Modal.corp_clientType'),
                    cpHomePage: this.$t('crm.Modal.corp_homePage'),
                    cpPhone: this.$t('crm.Modal.corp_phone'),
                    cpFax: this.$t('crm.Modal.corp_fax'),
                    cpContactAddress: this.$t('crm.Modal.corp_contactAddress'),
                    cpRelatedCompany: this.$t('crm.Modal.corp_relatedCompany'),
                    cpCompanyPicture: this.$t('crm.Modal.corp_companyPicture'),
                    cpCompanyRemark: this.$t('crm.Modal.corp_companyRemark'),
                    companyManagersBefore: this.$t('crm.InqSet.corp_formerHead'),
                    cpCompanySourceWay: this.$t('crm.Table.col_customerSource'),
                    cpLastTransactionTime: this.$t('crm.Table.col_lastTransactionTime'),
                    cpTransactionMoneyRmb: this.$t('crm.Table.col_transactionInquiryAmount'),
                    cpTransactionInquiryCount: this.$t('crm.Table.col_transactionInquiryNO'),
                    // 自定义字段 - 无
                    // 其他字段
                    cpMarker: this.$t('crm.Table.col_marker'),
                    cpFollowUpCount: this.$t('crm.Table.col_followUpCount'),
                    cpTouchCount: this.$t('crm.Table.col_touchCount'),
                    cpNotFollowedDays: this.$t('crm.Table.col_notFollowedDays'),
                    cpDynamic: this.$t('crm.Table.col_lastFollowup'),
                    cpLastFollowUpTime: this.$t('crm.Table.col_lastFollowupTime'),
                    cpGiveupReason: this.$t('crm.Table.col_lastGiveupReason'),
                    cpCreateUser: this.$t('crm.WorkBench.col_followUpCreateUser'),
                    cpCreateTime: this.$t('crm.Table.col_createTime'),
                    cpUpdateTime: this.$t('crm.Table.col_updateTime'),
                    cpLastGiveupTime: this.$t('crm.Table.col_lastGiveupTime'),

                    // 询盘字段
                    iqProductCategory: this.$t('crm.Modal.inq_productCategory'),
                    iqDemandProducts: this.$t('crm.Modal.inq_demandProducts'),
                    iqInquiryScore: this.$t('crm.Modal.inq_inquiryScore'),
                    iqLabel: this.$t('crm.Modal.inq_label'),
                    iqSourceChannel: this.$t('crm.Modal.inq_sourceChannel'),
                    iqSourceWay: this.$t('crm.Modal.inq_sourceWay'),
                    iqGrouping: this.$t('crm.Modal.inq_grouping'),
                    iqFollowUp: this.$t('crm.Modal.inq_followUp'),
                    iqRemark: this.$t('crm.Modal.inq_remark'),
                    iqSeqNumber: this.$t('crm.Table.col_seqNumber'),

                    // 联系人字段
                    ctNickName: this.$t('crm.Modal.contact_nickName'),
                    ctJobTitle: this.$t('crm.Modal.contact_jobTitle'),
                    ctEmail: this.$t('crm.Modal.contact_email'),
                    ctPhone: this.$t('crm.Modal.contact_phone'),
                    ctJobGrade: this.$t('crm.Modal.contact_jobGrade'),
                    ctSocialNetworkingPlatform: this.$t('crm.Modal.contact_socialNetworkingPlatform'),
                    ctBirthday: this.$t('crm.Modal.contact_birthday'),
                    ctGender: this.$t('crm.Modal.contact_gender'),
                    ctPicture: this.$t('crm.Modal.contact_picture'),
                    ctRemark: this.$t('crm.Modal.contact_remark'),
                    ctWhatsApp: this.$t('crm.Modal.contact_whatsApp'),
                    ctInstagram: this.$t('crm.Modal.contact_instagram')
                },

                /* 表格 */
                loading: true, // 加载图标
                initTable: false,
                flag_refreshColumn: true, // 使用 v-if 刷新列表列顺序
                totalNum: 0,
                curPage: 1,
                pageSize: null,
                maxPageNum: 1,
                pageSizeOpts: [20, 50, 100],
                tableData: [],
                prefixes: ['cp', 'iq', 'ct'], // 字段模块前缀
                // 需要添加日期处理方法的字段
                dateOptionsFileds: ['cpLastGiveupTime', 'cpLastFollowUpTime', 'cpCreateTime', 'cpUpdateTime', 'cpLastGetCompanyTime', 'cpLastTransactionTime'],
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
                },
                // 需要添加格式化方法的字段 以及 方法
                tableFormatters: {
                    cpNotFollowedDays: row => {
                        let temp = null;
                        if (row.cpNotFollowedDays) {
                            temp = Math.floor((Date.now() - row.cpNotFollowedDays) / (24 * 60 * 60 * 1000));
                            if (temp < 0) {
                                temp = 0;
                            }
                        }
                        return temp;
                    },
                    cpGiveupReason: row => {
                        let str = row.cpGiveupReason;
                        if (Number(row.cpGiveupReason) === -1) {
                            str = '自动退入公海';
                        }
                        const temp = this.selectOptions.cpGiveupReason
                            ? this.selectOptions.cpGiveupReason.find((item) => item.attrId === Number(row.cpGiveupReason))
                            : undefined;
                        str = temp ? temp.attrName : str;
                        return str;
                    },
                    iqProductCategory: row => {
                        return this.$options.filters.parseArray(row.iqProductCategory)
                            .length
                            ? this.$options.filters
                                .parseArray(row.iqProductCategory)
                                .join(', ')
                            : '-';
                    },
                    iqFollowUpId: row => {
                        let str = '-';
                        if (/\d+/.test(`${row.iqFollowUpId}`)) {
                            if (`${row.iqFollowUpId}` === '-1') {
                                str = this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry');
                            }
                            const temp = this.selectOptions.iqFollowUp
                                ? this.selectOptions.iqFollowUp.find((item) => `${item.attrId}` === `${row.iqFollowUpId}`)
                                : 'undefined';
                            str = temp ? temp.attrName : str;
                        } else {
                            str = row.iqFollowUp || '-';
                        }
                        return str;
                    },
                    ctPhone: row => {
                        return Array.isArray(row.ctPhone)
                            ? row.ctPhone.join(', ')
                            : '-';
                    },
                    ctSocialNetworkingPlatform: row => {
                        return Array.isArray(row.ctSocialNetworkingPlatform) &&
                            row.ctSocialNetworkingPlatform.filter((item) => item.attrValue)
                                .length
                            ? row.ctSocialNetworkingPlatform
                                .map((item) => {
                                    return `${item.attrName}: ${item.attrValue}`;
                                })
                                .join(', ')
                            : '-';
                    },
                    ctGender: row => {
                        let ctGender = '-';
                        switch (`${row.ctGender}`) {
                            case '1':
                                ctGender = this.$t('crm.Modal.male');
                                break;
                            case '2':
                                ctGender = this.$t('crm.Modal.female');
                                break;
                        }
                        return ctGender;
                    }
                },
                currentColumns: [], // 表格列名称
                allColumns: [], // 表格全部列
                close_popper: this.$debounce(
                    () => {
                        // document.body.click();

                        // 关闭表头筛选框浮层
                        if (this.currentColumns.some((item) => item.show_filter_content)) {
                            this.currentColumns = this.currentColumns.map((item) => {
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
                    },
                    100,
                    true
                ),

                /* 筛选 */
                title_topFilter: this.$t('crm.Table.highseasCustomer'),
                flag_topFilter: false,
                type_topFilter: '',
                addChangeCon1: addChangeCon1,
                addChangeCon2: addChangeCon2,
                companyManagersBefore: '',
                subUserOptTypeBefore: [],
                // order_column: '',
                // order_type: '',
                // storageName_orderColumn: '',
                order_column: localStorage.getItem('highseasCustomer_order_column') ? localStorage.getItem('highseasCustomer_order_column') : '', /* 排序列 */
                order_type: localStorage.getItem('highseasCustomer_order_type') ? localStorage.getItem('highseasCustomer_order_type') : '', /* 排序类型  asc desc */
                storageName_orderColumn: localStorage.getItem('highseasCustomer_storageName_orderColumn') ? localStorage.getItem('highseasCustomer_storageName_orderColumn') : '',
                conditionList1: [],
                conditionList2: [
                    {
                        value: '$eq',
                        label: this.$t('crm.Table.con_equal')
                    },
                    {
                        value: '$ne',
                        label: this.$t('crm.Table.con_unequal')
                    },
                    {
                        value: '$regex',
                        label: this.$t('crm.Table.con_include')
                    },
                    {
                        value: '$nregex',
                        label: this.$t('crm.Table.con_exclude')
                    }
                ],
                addCondition: [],
                common_conditions: [],
                filtering: false,
                queryData: {
                    $and: []
                },
                allLists: {
                    cpStarLevel: [
                        {
                            value: 0,
                            label: '0'
                        },
                        {
                            value: 1,
                            label: '1'
                        },
                        {
                            value: 2,
                            label: '2'
                        },
                        {
                            value: 3,
                            label: '3'
                        },
                        {
                            value: 4,
                            label: '4'
                        },
                        {
                            value: 5,
                            label: '5'
                        }
                    ], // 所有可能的筛选条件
                    ctGender: [
                        {
                            value: 1,
                            label: this.$t('crm.Modal.male')
                        },
                        {
                            value: 2,
                            label: this.$t('crm.Modal.female')
                        }
                    ], // 所有可能的筛选条件
                    cpMarker: [
                        {
                            value: 1,
                            label: this.$t('crm.Table.con_is')
                        },
                        {
                            value: 2,
                            label: this.$t('crm.Table.con_not')
                        }
                    ] // 所有可能的筛选条件
                },

                /* 新版表头筛选 */
                // 筛选配置
                config_tableFilter: {},
                // 表头筛选条件
                sqlList_tableFilter: {},

                /* 修改字段 */
                visible_edit_columns: false,
                columnType: 4,
                id_column_show_order: undefined,
                group: [],
                groupingRules: [
                    // {
                    //     align: 'left' || 'right' || 'both', // 指定哪侧面板分组
                    //     key: 'parentId', // 指定分组所需的 key
                    //     value: 1, // 指定分组所需的 value
                    //     label: '公司信息', // 指定分组的标题
                    //     emptyText: '无' // 指定分组无数据时显示的提示信息
                    // }
                    {
                        align: 'left',
                        key: 'parentId',
                        value: 1,
                        label: this.$t('crm.Modal.module_company'),
                        emptyText: this.$t('crm.Html.nothing')
                    },
                    {
                        align: 'left',
                        key: 'parentId',
                        value: 3,
                        label: this.$t('crm.Modal.module_inquiry'),
                        emptyText: this.$t('crm.Html.nothing')
                    },
                    {
                        align: 'left',
                        key: 'parentId',
                        value: 2,
                        label: this.$t('crm.Modal.module_contact'),
                        emptyText: this.$t('crm.Html.nothing')
                    }
                ],
                // 保存到后端的字段属性, 目前只有 width
                fieldStyle: {},

                /* 多选操作 */
                // 已选中的客户
                selected_items: [],

                // 下拉选项加上模块前缀 - 注意, 此处为了配合 topFilter , 不能修改变量名, 要保证 addChangeCon 中的 selectOptions 变量名和 topFilter-customSearch 的 prop:selectOptions  一致
                selectOptions: {},

                /* 对接权限系统 */
                corp_columns_authorized: {}, // 公司所有字段
                contact_columns_authorized: {}, // 联系人所有字段
                inquiry_columns_authorized: {}, // 询盘所有字段

                /* 客户详情 */
                companyId: 0,
                rowIndex: -1,

                /* 批量认领客户 */
                isAllowanceLoading: false, // 正在获取可认领客户余量
                visible_batch_claim_customer: false, // 是否批量认领客户
                currentAllowance: -1, // 当前用户可认领客户余量
                visible_batch_distribute_customer: false, // 是否批量分配客户
                columnPos: 15,
                showColums: [],
                dom: '',
                show_company_detail: false
            };
        },
        created() {
            // 获取全部用户
            !this.allUsers.length && this.$store.dispatch('getAllUsers');
            // 获取 下拉选项数据 用到组件detailInfo.vue inquiryInfo.vue newInquiry.vue editCompany.vue newContact.vue  addInquiryLabel.vue
            this.$store.dispatch('getSelectOptions');
            this.loading = true;
        },
        async mounted() {
            // 获取列表相关数据 筛选数据 + 列表字段 + 显示字段 + 左上角筛选第一项的下拉数据
            await this.getTableColumns();
            // 获取所有授权字段
            this.getAllFiled();
        },
        beforeDestroy() {
            this.companyId = '';
            if (this.dom) {
                this.dom.removeEventListener('scroll', () => {});
            }
        },
        methods: {
            // 获取所有授权字段
            getAllFiled() {
                const data = {
                    orgId: this.enterpriseId, // 企业id
                    userId: this.userId, // 用户id
                    parentId: 0,
                    type: this.columnType,
                    key: 'highseasCustomer'
                };
                crmCommon.getCommonConfig(data).then((res) => {
                    if (res.code === '1') {
                        // 暂存所有默认字段和自定义字段
                        const defaultFields = res.data && Array.isArray(res.data.default) ? res.data.default : [];
                        const customFields = res.data && Array.isArray(res.data.custom) ? res.data.custom : [];
                        defaultFields.forEach(item => {
                            if (item.parentId === 1) {
                                item.cname = this.langObj[`cp${this.firstUpperCase(item.storageName)}`] || item.cname;
                            }
                            if (item.parentId === 2) {
                                item.cname = this.langObj[`ct${this.firstUpperCase(item.storageName)}`] || item.cname;
                            }
                            if (item.parentId === 3) {
                                item.cname = this.langObj[`iq${this.firstUpperCase(item.storageName)}`] || item.cname;
                            }
                        });
                        // 筛选得到公司/询盘/联系人授权字段
                        this.$set(this.corp_columns_authorized, 'default', defaultFields.filter((col) => col.parentId === 1));
                        this.$set(this.corp_columns_authorized, 'custom', customFields.filter((col) => col.parentId === 1));
                        this.$set(this.contact_columns_authorized, 'default', defaultFields.filter((col) => col.parentId === 2));
                        this.$set(this.contact_columns_authorized, 'custom', customFields.filter((col) => col.parentId === 2));
                        this.$set(this.inquiry_columns_authorized, 'default', defaultFields.filter((col) => col.parentId === 3));
                        this.$set(this.inquiry_columns_authorized, 'custom', customFields.filter((col) => col.parentId === 3));
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                    }
                });
            },
            // 获取列表
            getTableColumns() {
                crmCommon.getCompanyFrontList({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    listType: this.columnType, // listType：1客户，4公海客户
                    configKey: 'highseasCustomer'
                }).then((response) => {
                    if (response.code === '1') {
                        this.allColumns = response.data.showFieldList;
                        let list = response.data.filterFieldMap;
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
                            const headSet = this.config_tableFilter[col.key];
                            if (col.key === 'ctEmail') {
                                this.$set(this.fieldColumns, 'email', true);
                            }
                            if (col.key === 'ctWhatsApp') {
                                this.$set(this.fieldColumns, 'whatsApp', true);
                            }
                            if (headSet && (headSet.sort || headSet.filter)) {
                                col.show_filter_content = false;
                                col.filtering = false;
                                col.title = this.langObj[col.key] || col.title;
                                this.langObj[col.key] = col.title;
                                if (this.tableFormatters[col.key]) {
                                    col.formatter = this.tableFormatters[col.key];
                                } else if (col.fieldType === 'custom' && col.filterType === 'selectMultiple') {
                                    col.formatter = (row) => {
                                        return this.$options.filters.parseArray(row[col.key]).length ? this.$options.filters.parseArray(row[col.key]).join(', ') : '-';
                                    };
                                }
                                if (col.key === 'cpCompanyName') {
                                    col.className = 'cp_companyName';
                                    col.fixed = 'left';
                                }
                            } else {
                                col.renderHeader = this.renderHeader_text(index);
                                col.title = this.langObj[col.key] || col.title;
                                this.langObj[col.key] = col.title;
                                if (this.tableFormatters[col.key]) {
                                    col.formatter = this.tableFormatters[col.key];
                                } else if (col.fieldType === 'custom' && col.filterType === 'selectMultiple') {
                                    col.formatter = (row) => {
                                        return this.$options.filters.parseArray(row[col.key]).length ? this.$options.filters.parseArray(row[col.key]).join(', ') : '-';
                                    };
                                }
                            }
                        });
                        // 所有字段 key
                        this.allGroup = this.allColumns.map(item => item.key);

                        // 初始化左上角筛选数据
                        this.conditionList1 = response.data.searchFieldList.map(item => {
                            item.label = this.langObj[item.value] || item.label;
                            return item;
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

                        if (response.data.fieldOrder) {
                            // 解构数据
                            const { id, showField, fieldStyle } = response.data.fieldOrder;
                            this.id_column_show_order = id;
                            // 处理字段顺序
                            if (typeof showField === 'string') {
                                const fields = showField.split(',').map((key) => {
                                    // 显示字段无前缀者, 默认加上公司前缀
                                    // return key
                                    return this.prefixes.some((prefix) =>
                                        key.startsWith(prefix))
                                        ? key
                                        : `cp${this.firstUpperCase(key)}`;
                                });
                                if (fields.indexOf('cpCompanyManagersBefore') > -1) {
                                    fields.splice(fields.indexOf('cpCompanyManagersBefore'), 1, 'companyManagersBefore');
                                }
                                this.group = fields.filter((item) => this.allGroup.includes(item));
                            }

                            // 处理字段宽度
                            this.fieldStyle = fieldStyle ? JSON.parse(fieldStyle) : {};
                            Object.entries(this.fieldStyle).forEach(([fieldKey, fieldObj]) => {
                                const column = this.allColumns.find((item) => item.key === fieldKey);
                                if (column && fieldObj.width) {
                                    column.width = fieldObj.width;
                                }
                            });
                        } else {
                            // 去除默认顺序中不存在的字段, 得到最终的顺序
                            this.group = defaultFields.filter((key) => this.allGroup.includes(key));
                        }
                        // 配置表格显示项 结束
                        //  用户当前设置页数 开始
                        if (response.data.userConfig && response.data.userConfig.value) {
                            const size = parseInt(response.data.userConfig.value);
                            this.pageSize = size;
                        } else {
                            this.pageSize = 20;
                            this.addPageSize();
                        }
                        //  用户当前设置页数 结束
                        // 根据跳转时附加参数的不同作出相应刷新操作
                        this.checkRouteParams();

                        // 设置大部分下拉选项
                        this.allSelectOptions.clientType && this.setSelectOptions();
                        // 设置全部人员列表以供筛选
                        this.allUsers.length && this.setAllUsers();
                    } else {
                        console.log('数据获取失败');
                    }
                }, () => {
                    console.log('数据获取失败');
                });
            },
          
            /* 添加PageSize */
            addPageSize() {
                const data = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    key: 'highseasCustomer',
                    value: this.pageSize.toString()
                };
                crmCommon.userconfigAdd(data);
            },
            /* 全局 */
            // 设定初始筛选条件
            init_filter(key, title, val, fieldType, colType) {
                // key: storageName , title: 多语言, val: query值, fieldType: 自定义/默认字段类型, colType: select/input/email...输入类型
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
                            case 'number':
                                this.$set(this.sqlList_tableFilter, con, {
                                    $eq: val
                                });
                                break;
                            case 'select':
                            case 'users':
                                switch (con) {
                                    // 单独发送的字段在最外层, 方便 merge_query_list , 否则用 $or: [筛选条件...]
                                    case 'cpCompanyManagers':
                                    case 'companyManagersBefore':
                                        result.$regex = val.map((item) => item.value);
                                        break;
                                    default:
                                        // 表头筛选中只能有单个选项值的(单选型字段 + 创建人这种表格才有的字段)属性, 筛选时使用 $eq 等于, 其他用 $regex 包含
                                        let type = '$regex';
                                        switch (key) {
                                            case 'cpClientType':
                                            case 'cpStarLevel':
                                            case 'cpScale':
                                            case 'cpCreateUser':
                                            case 'cpMarker':
                                            case 'cpGiveupReason':
                                            case 'iqSourceChannel':
                                            case 'iqSourceWay':
                                            case 'iqGrouping':
                                            case 'iqFollowUp':
                                            case 'ctGender':
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
            // 根据跳转时附加参数的不同作出相应刷新操作
            checkRouteParams() {
                const globalSearchViewType = localStorage.getItem('leadsCloud-globalSearchViewType');
                const companyId = localStorage.getItem('leadsCloud-companyId');
                const inquiryId = localStorage.getItem('leadsCloud-inquiryId');

                // 处理从全局搜索结果页跳转至公海
                if (globalSearchViewType) {
                    if (companyId) {
                        localStorage.removeItem('leadsCloud-companyId');

                        /**
                         * @Description: 注释掉所有打开侧滑页的操作, 改为新窗口打开客户详情页
                         * @author 汤一飞
                         * @date 2021/1/4
                         */
                        this.$router.replace({
                            name: 'companyDetail',
                            query: {
                                companyId: companyId
                            }
                        });
                        return;
                    }
                }

                // 处理仪表盘带 Map 类型筛选条件跳转
                if (localStorage.getItem('dashboard_highSea_inquiry_filters')) {
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', true);
                    // 提取筛选条件 Map 数组
                    const initial_filter_cons = new Map(JSON.parse(localStorage.getItem('dashboard_highSea_inquiry_filters')));
                    localStorage.removeItem('dashboard_highSea_inquiry_filters');
                    // 成交及成交之后跟进状态筛选
                    if (initial_filter_cons.get('transactionStatus')) {
                        const statusList = this.selectOptions.iqFollowUp
                            ? this.selectOptions.iqFollowUp.filter((item) => item.transactionStatus > 0)
                            : [];
                        if (statusList.length) {
                            initial_filter_cons.set(
                                'iqFollowUp',
                                statusList.map((item) => {
                                    const { attrId: value, attrName: label } = item;
                                    return { value, label };
                                })
                            );
                        }
                    }

                    // 其余正常筛选条件筛选
                    this.allColumns = this.allColumns.map((col) => {
                        if (this.config_tableFilter.hasOwnProperty(col.key)) {
                            col.filtering = initial_filter_cons.get(col.key)
                                ? this.init_filter(
                                    col.key,
                                    col.title,
                                    initial_filter_cons.get(col.key),
                                    col.fieldType,
                                    col.filterType
                                )
                                : false;
                        }
                        return col;
                    });

                    // 请求表格数据
                    this.refreshData_filter();

                    // 停止向下执行
                    return;
                }
                if (localStorage.getItem('dashboard_highseasCustomer_filters')) {
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', true);
                    // 提取筛选条件 Map 数组
                    const initial_filter_cons = new Map(JSON.parse(localStorage.getItem('dashboard_highseasCustomer_filters')));
                    localStorage.removeItem('dashboard_highseasCustomer_filters');

                    // 其余正常筛选条件筛选
                    this.allColumns = this.allColumns.map(col => {
                        if (this.config_tableFilter.hasOwnProperty(col.key)) {
                            col.filtering = initial_filter_cons.get(col.key) ? this.init_filter(col.key, col.title, initial_filter_cons.get(col.key), col.fieldType, col.filterType) : false;
                        }
                        return col;
                    });
                    // 请求表格数据
                    this.filtering = false;
                    this.type_topFilter = 'searchCommon';
                    this.flag_topFilter = !this.flag_topFilter;

                    // 停止向下执行
                    return;
                }
                // 处理从消息中心任务详情跳转至公海
                if (inquiryId) {
                    if (localStorage.getItem('leadsCloud-customer-companyId')) {
                        const tempCompanyId = localStorage.getItem('leadsCloud-customer-companyId');
                        localStorage.removeItem('leadsCloud-customer-companyId');
                        /**
                         * @Description: 注释掉所有打开侧滑页的操作, 改为新窗口打开客户详情页
                         * @author 汤一飞
                         * @date 2021/1/4
                         */
                        this.$router.replace({
                            name: 'companyDetail',
                            query: {
                                companyId: tempCompanyId
                            }
                        });
                        return;
                    }
                }

                // 其他带参数跳转到公海情况
                if (companyId) {
                    localStorage.removeItem('leadsCloud-companyId');
                    /**
                     * @Description: 注释掉所有打开侧滑页的操作, 改为新窗口打开客户详情页
                     * @author 汤一飞
                     * @date 2021/1/15
                     */
                    this.$router.replace({
                        name: 'companyDetail',
                        query: {
                            companyId: companyId
                        }
                    });
                    return;
                }

                // 请求表格数据 由搜索框触发请求数据
                // this.refreshData_filter();
                this.type_topFilter = 'searchCommon';
                this.flag_topFilter = !this.flag_topFilter;
            },
            // 新建获取属性列表
            setSelectOptions() {
                // 存放原始下拉选项
                const sourceSelectOptions = this.$deepClone(this.allSelectOptions);
                sourceSelectOptions.label = sourceSelectOptions.tag || [];

                // 存放表格页要用到的下拉选项
                this.selectOptions = {
                    cpCompanySourceWay: sourceSelectOptions.sourceWay
                };
                const storageNameMap = {
                    clientType: 'cpClientType',
                    followUp: 'iqFollowUp',
                    giveupReason: 'cpGiveupReason',
                    grouping: 'iqGrouping',
                    productCategory: 'iqProductCategory',
                    scale: 'cpScale',
                    socialNetworkingPlatform: 'ctSocialNetworkingPlatform',
                    sourceChannel: 'iqSourceChannel',
                    sourceWay: 'iqSourceWay',
                    label: 'iqLabel'
                };
                Object.entries(sourceSelectOptions).forEach(([key, value]) => {
                    this.$set(this.selectOptions, storageNameMap[key] || key, value);
                });

                /* 如果请求下来的所有选项( selectOptions )中有与筛选设置( config_tableFilter )匹配的属性, 且匹配到的筛选设置筛选类型为 'select' , 则导入选项数据到匹配筛选设置 */
                Object.entries(this.selectOptions).forEach(([key, value]) => {
                    if (this.config_tableFilter.hasOwnProperty(key)) {
                        const temp = this.config_tableFilter[key];
                        if (temp.filterType === 'select') {
                            temp.allList = value.map(({ attrId, attrName }) => {
                                return {
                                    value: ['cpGiveupReason', 'iqFollowUp'].includes(key)
                                        ? attrId
                                        : attrName,
                                    label: attrName
                                };
                            });
                            if (key === 'iqFollowUp') {
                                temp.allList.splice(1, 0, {
                                    value: -1,
                                    label: this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry')
                                });
                            }
                            if (key === 'cpGiveupReason') {
                                temp.allList.unshift({
                                    value: -1,
                                    label: '自动退入公海'
                                });
                            }
                        }
                        this.$set(this.config_tableFilter, key, temp);
                    }
                });
            },
            // 获取全部用户
            setAllUsers() {
                const allList = this.allUsers.map((item) => {
                    const { fullname: label, id: value } = item;
                    return { label, value };
                });

                this.config_tableFilter.cpCreateUser && this.$set(
                    this.config_tableFilter.cpCreateUser,
                    'allList',
                    [{ label: '询盘云', value: -2 }].concat(allList)
                );
                const data = {
                    pageNo: 1,
                    pageSize: 10000,
                    orgId: this.enterpriseId,
                    departmentId: 0
                };
                this.$commonApi.getUserDataList(data).then(response => {
                    if (response.code === '1') {
                        this.allUsersList = response.data.list.sort((a, b) => a.createDate - b.createDate);
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                    }
                });
            },
            // 获取检索字段名称对应的数据库字段名
            getSearchCon(str) {
                switch (str) {
                    case 'cpCreateUser':
                        return 'cpCreateUserId';
                    case 'iqFollowUp':
                        return 'iqFollowUpId';
                    default:
                        return str;
                }
            },
            // 获取检索条件对应的 sql 条件
            getSearchType(str) {
                switch (str) {
                    case this.$t('crm.Table.con_include'):
                        return '$regex';
                    case this.$t('crm.Table.con_exclude'):
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
            // 合并表头筛选和右上角筛选
            merge_query_list() {
                // 右上角筛选框优先级更高, a 为检索/常用检索条件, b 为表头检索条件
                let b = this.computed_sqlList_tableFilter;
                let a = [];
                switch (this.filtering) {
                    case 'search':
                        a = this.computed_addCondition;
                        break;
                    case 'searchCommon':
                        a = this.common_conditions;
                        break;
                }
                // 处理前负责人筛选, 优先使用右上角检索条件
                const subUserIds_a = a.filter(item => item.hasOwnProperty('companyManagersBefore'));
                const subUserIds_b = b.filter(item => item.hasOwnProperty('companyManagersBefore'));
                if (subUserIds_a && subUserIds_a.length) {
                    this.subUserOptTypeBefore = [];
                    subUserIds_a.forEach(items => {
                        Object.entries(items.companyManagersBefore).forEach(([fieldKey, fieldObj]) => {
                            this.subUserOptTypeBefore.push({
                                [fieldKey]: fieldObj === -1 ? [] : fieldObj
                            });
                        });
                    });
                } else {
                    this.subUserOptTypeBefore = [];
                }
                if (subUserIds_b && subUserIds_b.length) {
                    this.companyManagersBefore = subUserIds_b[0].companyManagersBefore.$regex.join(',');
                } else {
                    this.companyManagersBefore = '';
                }
                // 如果都有"负责人"筛选, 只取前者第一项, 否则取后者第一项或空数组
                // const con_subUserIds = subUserIds_a[0] || subUserIds_b[0];

                // if (con_subUserIds) {
                //     this.companyManagersBefore = con_subUserIds.companyManagersBefore.$regex.join(',');
                // } else {
                //     this.companyManagersBefore = '';
                // }
                a = a.filter(item => !item.hasOwnProperty('companyManagersBefore'));
                b = b.filter(item => !item.hasOwnProperty('companyManagersBefore'));

                // 筛选兼容历史数据
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

            /* 筛选 tag */
            // close tag 时去掉对应的筛选条件并刷新
            remove_filter_tag(key) {
                // 清空筛选条件
                const temp = this.config_tableFilter[key];
                if (temp) {
                    switch (temp.filterType) {
                        case 'string':
                        case 'number':
                            temp.query = '';
                            break;
                        case 'select':
                        case 'users':
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
                    this.changeGroups(this.group);

                    this.$delete(this.sqlList_tableFilter, this.getSearchCon(col.key));
                }

                this.refreshData_filter();
            },
            // filterTags 组件内部修改筛选值后触发的方法, 由下方的 updateList 改造而成
            change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    const column = this.allColumns.find((item) => item.key === key);
                    if (column) {
                        // 判断是否有值, 调整 sqlList
                        const con =
                            column.fieldType === 'custom' ? key : this.getSearchCon(key);
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
                                    switch (con) {
                                        // 单独发送的字段在最外层, 方便 merge_query_list , 否则用 $or: [筛选条件...]
                                        case 'cpCompanyManagers':
                                        case 'companyManagersBefore':
                                            result.$regex = temp.query.map((item) => item.value);
                                            break;
                                        default:
                                            // 表头筛选中只能有单个选项值的(单选型字段 + 创建人这种表格才有的字段)属性, 筛选时使用 $eq 等于, 其他用 $regex 包含
                                            let type = '$regex';
                                            switch (key) {
                                                case 'cpClientType':
                                                case 'cpStarLevel':
                                                case 'cpScale':
                                                case 'cpCreateUser':
                                                case 'cpMarker':
                                                case 'cpGiveupReason':
                                                case 'iqSourceChannel':
                                                case 'iqSourceWay':
                                                case 'iqGrouping':
                                                case 'iqFollowUp':
                                                case 'ctGender':
                                                    type = '$eq';
                                                    break;
                                                default:
                                                    if (
                                                        column.fieldType === 'custom' &&
                                                        column.filterType === 'select'
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

                        this.refreshData_filter();
                    } else {
                        this.remove_filter_tag(key);
                    }
                } else {
                    this.remove_filter_tag(key);
                }
            },
            // 删掉 sort tag
            empty_sort() {
                // 清空
                this.order_column = '';
                this.order_type = '';
                this.companyManagersBefore = '';
                localStorage.removeItem('highseasCustomer_order_column');
                localStorage.removeItem('highseasCustomer_order_type');
                localStorage.removeItem('highseasCustomer_storageName_orderColumn');
                // 刷新
                this.curPage = 1;
                this.refreshData();
            },

            /* 多选操作 */
            // 清除表格已选内容
            clear_selected_items() {
                this.$refs.table.clearCheckboxRow();
                this.$refs.table.clearCheckboxReserve();
                this.selected_items = [];
            },

            /* 文件下载 */
            async exportData() {
                /**
                 * @Description: 先保存显示字段, 再下载
                 * 20210528 产品要求更新客户列表页默认字段顺序, 更新之后发现下载顺序不对, 后端说后端改下载默认字段顺序麻烦, 让前端下载前先保存字段顺序
                 * 公海客户表格页不更改字段顺序, 但测试说下载有问题, 让也加上保存字段顺序这一步
                 * @author 汤一飞
                 * @date 2021/6/2
                 */
                // 保存显示字段
                const res = await this.$commonApi.setTableColConfig({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    type: this.columnType,
                    id: this.id_column_show_order,
                    templateId: '',
                    showField: this.group.join(',')
                });

                if (res && res.code === '1') {
                    // 保存显示字段设置 id
                    this.id_column_show_order = res.data.data;
                    // 减缓后端压力 前端分页下载多个文件
                    // 下载表格数据文件
                    const lastIdTag = new Date().getTime();
                    if (this.totalNum > 60000) {
                        const lists = Math.ceil(this.totalNum / 60000);
                        for (let i = 0; i < lists; i++) {
                            setTimeout(() => {
                                const url = `${this.$util.ajaxUrl}/crm/bigcompany/getFilterListExcelV2?pageSize=60000&pageNo=${i + 1}&userId=${this.userId}&orgId=${this.enterpriseId}&listType=1&query=${this.queryData.$and.length ? encodeURIComponent(JSON.stringify(this.queryData)) : ''}&subUserOptTypeBefore=${this.subUserOptTypeBefore.length ? encodeURIComponent(JSON.stringify(this.subUserOptTypeBefore)) : ''}&companyManagersBefore=${this.companyManagersBefore}&highseasGroupId=${this.highSeasGroupId}&lastIdTag=${lastIdTag}`;
                                this.$stm.openNewWindow(url);
                            }, i * 1500);
                        }
                    } else {
                        const url = `${this.$util.ajaxUrl}/crm/bigcompany/getFilterListExcelV2?pageSize=60000&pageNo=1&userId=${this.userId}&orgId=${this.enterpriseId}&listType=1&query=${this.queryData.$and.length ? encodeURIComponent(JSON.stringify(this.queryData)) : ''}&subUserOptTypeBefore=${this.subUserOptTypeBefore.length ? encodeURIComponent(JSON.stringify(this.subUserOptTypeBefore)) : ''}&companyManagersBefore=${this.companyManagersBefore}&highseasGroupId=${this.highSeasGroupId}&lastIdTag=${lastIdTag}`;
                        this.$stm.openNewWindow(url);
                    }
                } else {
                    // 保存失败
                    // 报错
                    this.$Message.error(this.$t('crm.Table.errorOccurred'));
                }
            },

            /* 表格 */
            // 数据处理
            // 刷新表格数据
            refreshData(paramsObj = {}) {
                // 取消之前的表格数据请求
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }

                // 清空已选中的客户
                if (paramsObj.clearSelected) {
                    this.clear_selected_items();
                }

                // '未跟进天数'的排序比较特殊, 要反着来
                let orderType = this.order_type;
                if (this.order_column === 'cpNotFollowedDays') {
                    if (orderType === 'asc') {
                        orderType = 'desc';
                    } else if (orderType === 'desc') {
                        orderType = 'asc';
                    }
                }
                const vm = this;
                const postData = {
                    lang: this.lang,
                    orgId: this.enterpriseId,
                    listType: 1,
                    companyManagersBefore: this.companyManagersBefore,
                    subUserOptTypeBefore: this.subUserOptTypeBefore.length ? JSON.stringify(this.subUserOptTypeBefore) : undefined,
                    query: this.queryData.$and.length
                        ? JSON.stringify(this.queryData)
                        : undefined,
                    pageSize: this.pageSize,
                    pageNo: this.curPage,
                    orderColumn: this.order_column,
                    highseasGroupId: '' || this.highSeasGroupId, // 公海分组筛选时才传此参数
                    orderType,
                    userId: this.userId
                };
                const cancelToken = new this.$util.axios.CancelToken(function executor(c) {
                    // An executor function receives a cancel function as a parameter
                    vm.cancelFunc = c;
                });
                /**
                 * @Description: 当前页不是第一页的时候不再请求总条数
                 * @author mayuanzhi
                 * @date 2020/8/6
                 */
                this.loading = true;
                crmCompany.getCompanyFilterListDataAndTotal(postData, cancelToken).then(async (response) => {
                    this.initTable = true;
                    if (response.code === '1') {
                        this.totalNum = response.data.total || 0;
                        this.maxPageNum = Math.ceil(this.totalNum / this.pageSize);
                        // 处理数据
                        this.tableData = await this.handleData(response.data.list);
                        // 暂时将-2改为取消跟进 -2是与后端定好的参数,但是如果为-2的话，内容区的'最近退入公海原因'会显示-2
                        this.tableData.forEach(item => {
                            if (item.cpGiveupReason === '-2') {
                                item.cpGiveupReason = '取消跟进';
                            };
                        });
                        // 表格滚动到顶部
                        if (this.$refs.table) {
                            // this.$refs.table.$el.querySelector('.el-table__body-wrapper').scrollTop = 0;
                        }
                    } else {
                        this.totalNum = 0;
                        this.maxPageNum = 0;
                        this.tableData = [];
                        this.$Message.error(this.$t('crm.Table.error_getCompanyTableData'));
                    }
                    this.loading = false;
                });
            },
            // 检索并刷新表格
            refreshData_filter() {
                this.merge_query_list();
                this.curPage = 1;
                this.refreshData();
            },
            // 首字母大写
            firstUpperCase(str) {
                return `${str[0].toUpperCase()}${str.slice(1)}`;
            },
            // 初始化数据
            async handleData(data) {
                // 存放返回结果
                let result = [];

                // 遍历处理接口返回数据
                if (Array.isArray(data) && data.length) {
                    // 格式化数据
                    result = data.map((rowData) => {
                        // 存放返回结果
                        // 先处理与权限无关的字段
                        const temp = {
                            cpAutoSeq: rowData.cpAutoSeq,
                            cpLastGiveupTime: rowData.cpLastGiveupTime ? new Date(rowData.cpLastGiveupTime).format('yyyy-MM-dd hh:mm') : '',
                            cpCreateTime: new Date(rowData.cpCreateTime).format('yyyy-MM-dd hh:mm'),
                            cpUpdateTime: new Date(rowData.cpUpdateTime).format('yyyy-MM-dd hh:mm'),
                            companyManagersBefore: rowData.companyManagersBefore,
                            cpFollowUpCount: rowData.cpFollowUpCount !== null ? `${rowData.cpFollowUpCount}` : '',
                            cpTouchCount: rowData.cpTouchCount !== null ? `${rowData.cpTouchCount}` : '',
                            cpNotFollowedDays: rowData.cpNotFollowedDays,
                            cpDynamic: this.$options.filters.parseObject(rowData.cpDynamic),
                            cpLastFollowUpTime: rowData.cpLastFollowUpTime
                                ? new Date(rowData.cpLastFollowUpTime).format('yyyy-MM-dd hh:mm')
                                : '',
                            cpGiveupReason: rowData.cpGiveupReason,
                            cpCreateUser: rowData.cpCreateUser,
                            cpCreateUserId: rowData.cpCreateUserId,
                            cpMarker: rowData.cpMarker,
                            companyId: rowData.cpId,
                            iqSeqNumber: rowData.iqSeqNumber,
                            cpCountryArea: rowData.cpCountryArea,
                            cpCompanySourceWay: rowData.cpCompanySourceWay,
                            cpLastTransactionTime: rowData.cpLastTransactionTime ? new Date(rowData.cpLastTransactionTime).format('yyyy-MM-dd hh:mm:ss') : '',
                            cpTransactionInquiryCount: rowData.cpTransactionInquiryCount !== null ? `${rowData.cpTransactionInquiryCount}` : '',
                            cpTransactionMoneyRmb: rowData.cpTransactionMoneyRmb ? `￥ ${Utils.transformMoney(rowData.cpTransactionMoneyRmb)}` : ''
                        };

                        // 处理公司默认授权字段 + 公司/询盘/联系人自定义授权字段
                        // 判断默认字段权限 + 处理数据
                        this.allColumns.forEach((columns, index) => {
                            if (temp[columns.key] === undefined) {
                                temp[columns.key] = rowData[columns.key];
                            }
                        });
                        // 特殊默认字段处理
                        // 星级
                        if (temp.cpStarLevel) {
                            temp.cpStarLevel = isNaN(parseInt(temp.cpStarLevel)) ? 0 : parseInt(temp.cpStarLevel);
                        }
                        // 跟进状态
                        if (temp.iqFollowUp) {
                            temp.iqFollowUpId = rowData.iqFollowUpId;
                        }
                        // 社交平台
                        if (temp.ctSocialNetworkingPlatform) {
                            let ctSocialNetworkingPlatform = [
                                {
                                    attrName: '',
                                    attrValue: ''
                                }
                            ];
                            try {
                                ctSocialNetworkingPlatform = JSON.parse(temp.ctSocialNetworkingPlatform).length
                                    ? JSON.parse(temp.ctSocialNetworkingPlatform)
                                    : [
                                        {
                                            attrName: '',
                                            attrValue: ''
                                        }
                                    ];
                            } catch (e) {
                            }
                            temp.ctSocialNetworkingPlatform = ctSocialNetworkingPlatform;
                        }
                        // 电话
                        if (temp.ctPhone) {
                            temp.ctPhone = temp.ctPhone ? temp.ctPhone.split(',') : [''];
                        }

                        // 返回结果
                        return temp;
                    });
                }
                return result;
            },
            // 列相关
            // 修改列
            edit_columns() {
                this.visible_edit_columns = true;
            },
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
                    .filter((col) => selCol.includes(col.key))
                    .sort((a, b) => {
                        return orderObj[a.key] - orderObj[b.key];
                    });
                // this.showColums = this.currentColumns.slice(0, this.columnPos);
                this.$nextTick(() => {
                    this.flag_refreshColumn = true;
                    this.selected_items = [];
                });
            },
         
            // 纯文本表头, 不换行 + 省略号 + title 提示
            renderHeader_text(colIndex) {
                return (h) => {
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

                    /* 返回 DOM */
                    return h(
                        'div',
                        {
                            class: 'table-filter-container'
                        },
                        [title]
                    );
                };
            },
            // 表格表头单元格 class 方法
            headerCellClass({ column }) {
                // 如果可调整列宽, 则设置相应 class
                if (column.resizable) {
                    return 'resizable-col';
                }
            },
            renderHeader_editColumn(h) {
                return h('div', [
                    h('Icon', {
                        props: {
                            custom: 'custom-table-edit-columns',
                            size: 18,
                            color: '#c3cdd9'
                        },
                        class: 'cursor-pointer',
                        nativeOn: {
                            click: this.edit_columns
                        }
                    })
                ]);
            },

            // 点击表格行
            clickRow({row, column, $event}) {
                const data = row , event = $event;
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
                if (
                    selector.type !== 'Range' &&
                    document.activeElement.tagName !== 'INPUT'
                ) {
                    this.companyId = data.companyId;
                    this.rowIndex = this.tableData.findIndex((item) => item.companyId === data.companyId);
                    const path = event.path || (event.composedPath && event.composedPath());
                    if (path.find(item => item.classList && item.classList.contains('cp_companyName'))) {
                        // 如果是点击的"公司名称"

                        // 新窗口打开客户详情页
                        window.open(this.$router.resolve({
                            name: 'companyDetail',
                            query: {
                                companyId: data.companyId
                            }
                        }).href, '_blank');
                        return;
                    }
                    this.show_company_detail = true;
                    // this.$stm.openNewWindow(this.$router.resolve({
                    //     name: 'companyDetail',
                    //     query: {
                    //         companyId: data.companyId
                    //     }
                    // }).href);
                    // this.$refs.table.setCurrentRow();
                    // window.open(
                    //     this.$router.resolve({
                    //         name: 'companyDetail',
                    //         query: {
                    //             companyId: data.companyId
                    //         }
                    //     }).href,
                    //     '_blank'
                    // );
                }
            },

            // 底部页码
            // 改变每页条数
            pageSizeChange(pageSize) {
                this.curPage = 1;
                this.pageSize = pageSize;
                const data = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    key: 'highseasCustomer',
                    value: pageSize.toString()
                };
                crmCommon.userconfigUpdate(data);
                this.refreshData();
            },
            // 改变页码
            changePage(page) {
                if (page <= this.maxPageNum) {
                    this.curPage = page;
                    this.refreshData();
                }
            },
        
            // 指定表格行 class name
            getRowClassName({ row, rowIndex }) {
                if (this.selected_items.some(item => item.companyId === row.companyId)) {
                    return 'heightLight';
                }
                // if (rowIndex % 2 === 0) {
                //     return 'one_row_background';
                // } else if (rowIndex % 2 === 1) {
                //     return 'pair_row_background';
                // }
                return '';
            },
            // 多选
            handleSelectAll({ records, reserves }) {
                const selectedList = records.concat(reserves);
                if (selectedList.length > 0) {
                    this.selected_items = selectedList.map((item) => {
                        const { companyId } = item;
                        return {
                            companyId
                        };
                    });
                } else {
                    this.selected_items = [];
                }
            },

            /* 批量认领客户 */
            async batch_claim_customer(type, id) {
                // 公海侧滑也不需要判断条数    
                if (this.selected_items.length > 100) {
                    this.$Message.warning(this.$t('crm.Table.batchClaimCustomersLimit'));
                    return false;
                }
                const canGetInquiry = await this.getIsClaimInquiry();
                if (!canGetInquiry) return;
                this.isAllowanceLoading = true;
                this.currentAllowance = await this.getCustomerAllowance();
                /* currentAllowance的值为-1000(未设置客户上限) 或 真实设置的客户上限的余量 */
                if (
                    this.currentAllowance !== -1000 &&
                    this.selected_items.length > this.currentAllowance
                ) {
                    this.isAllowanceLoading = false;
                    this.visible_batch_claim_customer = true;
                } else if (this.$refs.batchClaimCustomer) {
                    let result = null;
                    result = await this.$refs.batchClaimCustomer.ok();
                    this.isAllowanceLoading = false;
                    if (!result) {
                        this.visible_batch_claim_customer = true;
                    }
                }
            },
            claimSuccess() {
                this.visible_batch_claim_customer = false;
            },
            detailClaimSuccess() {
                this.show_company_detail = false;
                this.refreshData();
            },
            /* 获取当前用户可以认领客户的余量 */
            getCustomerAllowance() {
                return new Promise((resolve) => {
                    const data = {
                        orgId: this.enterpriseId,
                        userId: this.userId
                    };
                    crmCommon.getUserRemainLimitCount(data).then((res) => {
                        if (res.code === '1') {
                            if (res.data.userRemainLimit === 'true') {
                                resolve(res.data.userRemainLimitCount);
                            } else {
                                /* 如果用户未设置客户上限，则此处返回-1000，代表未设置上限 */
                                resolve(-1000);
                            }
                        }
                    });
                });
            },
            /* 批量分配客户 */
            batch_distribute_customer() {
                if (this.selected_items.length > 100) {
                    this.$Message.warning(this.$t('crm.Table.batchDistributeCustomersLimit'));
                    return false;
                }
                this.visible_batch_distribute_customer = true;
            },
            // 获取当前用户是否有可接询盘权限, 再决定是否弹出认领确认框
            getIsClaimInquiry() {
                return new Promise((resolve) => {
                    this.$commonApi.getUserPrivilege({
                        id: this.userId
                    }).then(response => {
                        if (response.code === '1') {
                            if (response.data && response.data.canGetInquiry === 1) {
                                resolve(true);
                            } else {
                                resolve(false);
                                this.$Message.warning(this.$t('crm.newDetail.haveNoAuthorityClaim'));
                            }
                        }
                    });
                });
            },
            updateList(checkAll, column, colIndex) {
               this.update_query(this.config_tableFilter[column.field].query, column);
                const temp = this.config_tableFilter[column.field];
                temp.checkAll = checkAll; // 是否勾选【全选】
                if (temp) {
                    /* 处理筛选 */  

                    // 判断是否有值, 调整 sqlList
                    const con = column.fieldType === 'custom' ? column.field : this.getSearchCon(column.field);
                    if (temp.query.length || typeof temp.query === 'number') {
                        const result = {};
                        switch (temp.filterType) {
                            case 'string':
                                this.$set(this.sqlList_tableFilter, con, {
                                    $regex: temp.query
                                });
                                break;
                            case 'number':
                                result.$and = [];
                                if (temp.query) {
                                    const start = {};
                                    start[con] = {};
                                    start[con].$gte = Number(temp.query.slice(0, temp.query.indexOf('-')));
                                    result.$and.push(start);

                                    const end = {};
                                    end[con] = {};
                                    end[con].$lte = Number(temp.query.slice(temp.query.indexOf('-') + 1, temp.query.length));
                                    result.$and.push(end);
                                }
                                this.$set(this.sqlList_tableFilter, con, result);
                                break;
                            case 'select':
                            case 'users':
                            case 'departments':
                                switch (con) {
                                    // 单独发送的字段在最外层, 方便 merge_query_list , 否则用 $or: [筛选条件...]
                                    case 'cpCompanyManagers':
                                    case 'companyManagersBefore':
                                        result.$regex = temp.query.map(item => item.value);
                                        break;
                                    default:
                                        // 表头筛选中只能有单个选项值的(单选型字段 + 创建人这种表格才有的字段)属性, 筛选时使用 $eq 等于, 其他用 $regex 包含
                                        let type = '$regex';
                                        switch (column.field) {
                                            case 'cpClientType':
                                            case 'cpStarLevel':
                                            case 'cpScale':
                                            case 'cpCreateUser':
                                            case 'cpMarker':
                                            case 'iqSourceChannel':
                                            case 'iqSourceWay':
                                            case 'iqGrouping':
                                            case 'iqFollowUp':
                                            case 'ctGender':
                                                type = '$eq';
                                                break;
                                            default:
                                                if (column.fieldType === 'custom' && column.filterType === 'select') {
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
                                    this.config_tableFilter[column.field].query = [];
                                    this.$delete(this.sqlList_tableFilter, con);
                                }
                                break;
                        }
                        this.currentColumns = this.currentColumns.map((item, index) => {
                            if (index === colIndex) {
                                item.filtering = true;
                            }
                            return item;
                        });
                    } else {
                        this.$delete(this.sqlList_tableFilter, con);
                        this.currentColumns = this.currentColumns.map((item, index) => {
                            if (index === colIndex) {
                                item.filtering = false;
                            }
                            return item;
                        });
                    }

                    /* 刷新列表 */
                    this.refreshData_filter();
                }
            },
            update_query(val, column){
                if (this.config_tableFilter[column.field]) {
                    if (['cpTouchCount', 'cpFollowUpCount', 'cpNotFollowedDays', 'cpTransactionMoneyRmb', 'cpTransactionInquiryCount'].includes(column.field)) {
                        if (val) {
                            this.$set(this.config_tableFilter[column.field], 'query', `${val.$gte}-${val.$lte}`);
                        } else {
                            // 清除筛选操作
                            this.$set(this.config_tableFilter[column.field], 'query', '');
                        };
                    } else {
                        this.$set(this.config_tableFilter[column.field], 'query', val);
                    };
                };
            },
            update_showPopper(val, field) {
                this.currentColumns = this.currentColumns.map((item, index) => {
                    if (item.key === field) {
                        item.show_filter_content = val;
                    } else {
                        item.show_filter_content = false;
                    }
                    return item;
                });
            },

        },
        watch: {
            group: {
                handler(val) {
                    this.changeGroups(val);
                },
                immediate: true
            },
            allSelectOptions: {
                handler(val) {
                    if (val) {
                        this.setSelectOptions();
                    }
                }
            },
            allUsers: {
                handler(val) {
                    if (val) {
                        // 设置本页面应用的全部用户
                        this.setAllUsers();
                    }
                }
            },
            order_column: {
                handler(val) {
                    localStorage.setItem('highseasCustomer_order_column', val);
                    localStorage.setItem('highseasCustomer_storageName_orderColumn', this.storageName_orderColumn);
                },
                immediate: true
            },
            order_type: {
                handler(val) {
                    localStorage.setItem('highseasCustomer_order_type', val);
                },
                immediate: true
            }
            // storageName_orderColumn: {
            //     handler(val) {
            //         localStorage.setItem('highseasCustomer_storageName_orderColumn', val);
            //     },
            //     immediate: true
            // }

        }
    };
</script>

<style lang="less">
    @import "../../../styles/common.less";
    @import "../Detail/Components/less/modal.less";
    @import "Components/less/tablePage.less";
    @import "../Detail/Components/less/detailPage.less";
    @import "../../main-components/editable-table.less";

    .highSeas-manage-hide {
        display: none;
    }
    td.cp_companyName{
        color: #3B78DE;
        cursor: pointer;
        font-weight: bold;
        &:hover {
            color: #2D63BC;
            cursor: pointer;
        }
    }
</style>

<style scoped lang="less">
    .my-customer-top{
        padding: 8px 30px 8px 20px;
        background: #fff;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
        border-radius: 4px 0 0 4px;
        margin-bottom: 8px;
    }
    .custom-file-download-border{
        margin: 0 8px 0 20px;
        height: 30px;
        padding: 0 8px;
        border: 1px solid #ABBFD5;
        border-radius: 4px;
    }
    * /deep/ .el-dropdown-selfdefine {
        button.dropIcon {
            color: #fff;
            background: #fa8241;
            border: 1px solid #fa8241;
            border-left: 1px solid #e56926;
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            padding-left: 10px;
            padding-right: 10px;
            height: 38px;
            line-height: 28px;

            & > .custom-menu-arrow {
                color: #fff !important;
            }
        }
    }

    .newCreate-btn-group-newCreate:hover {
        color: #fff !important;
    }

    /deep/ .custom-distribute {
        color: #677f99;

        &:hover {
            color: #4285f4;
        }
    }
</style>
