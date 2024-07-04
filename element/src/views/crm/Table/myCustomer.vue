<template>
    <div class="crm-table-page">
        <div style="min-width: 700px">
            <div class="my-customer-top" :style="`${!selected_items.length && 'border-color: transparent;'}`">
                <div class="table-top-container">
                    <!-- 多选操作视图 -->
                    <template v-if="visible_batch_operate">
                        <div class="visible-batch-operat">
                            <div style="display: inline-block;color: rgba(0, 0, 0, .8);"
                                class="table-multiple-operate-btns _btns_text_ml">
                                <div style="display: inline-block; margin-right:20px;">
                                    {{ $t('crm.Table.selected') }}
                                    <!-- 选中客户条数 -->
                                    <span style="font-weight: bolder;color:#FA8241;">{{ selected_items.length }}</span>
                                    {{ selected_items.length > 1 ? $t('crm.Table.item_customers') : $t('crm.Table.item_customer') }}
                                </div>
                                 <!-- 群发单显 -->
                                <!-- <Button v-if="authorized_button['mergeData']" type="minor"
                                        style="font-size: 14px;"
                                        @click="bulkSending">{{ $t('crm.Table.bulkSending') }}</Button> -->
                                 <!-- 发送WhatsApp -->
                                <Button v-if="authorized_button['sendWhatsApp']" type="minor"
                                        style="font-size: 14px; margin-left: 20px;"
                                        @click="sendWhatsApp">{{ $t('crm.Table.sendWhatsApp') }}</Button>
                                <!-- 合并客户 -->
                                <Button v-if="authorized_button['mergeData']" type="minor"
                                        style="font-size: 14px;"
                                        @click="merge_company">{{ $t('crm.Table.merge') }}</Button>

                                <!-- 批量转移客户 -->
                                <!-- <Button v-if="authorized_button['transferCompanyBatch']" type="minor"
                                        style="font-size: 14px;"
                                        @click="transfer_company">{{ $t('crm.Detail.transferCompany') }}</Button> -->

                                <!-- 批量退入公海 -->
                                <!-- <Button v-if="authorized_button['batchThrowCompany']" type="minor"
                                        style="font-size: 14px;"
                                        @click="batch_throw_company">{{$t('crm.Detail.throwInquiry')}}</Button> -->

                                <!-- 取消跟进 -->
                                <!-- <Button
                                    type="minor"
                                    v-if="title_topFilter==='我的客户'||title_topFilter==='My Customers'"
                                    style="font-size: 14px;"
                                    @click="handleCancelFollow">{{ $t('crm.Detail.unfollow') }}</Button> -->

                                <!-- 批量编辑 -->
                                <Button v-if="authorized_button['editCompany']" type="minor"
                                        style="font-size: 14px;"
                                        @click="handleBatchEdit">{{$t('crm.Table.batchEdit')}}</Button>

                                <Poptip ref="moreOperateGroup"
                                    trigger="hover"
                                    placement="bottom-start"
                                    popper-class="moreOperateGroup">
                                    <Button slot="reference" type="minor" style="font-size: 14px; margin-left: 10px; height:36px">
                                        {{$t('crm.Detail.changeManagers')}}
                                        <Icon custom="custom-menu-arrow"
                                            color="#A9B9C9"
                                            size="14"></Icon>
                                    </Button>
                                    <div>
                                        <ul class="_font_size12">
                                            <!-- 取消跟进 -->
                                            <li @click="handleCancelFollow" class="piwik_mark_customer">
                                                {{ $t('crm.Detail.unfollow') }}
                                            </li>
                                            <!-- 转移客户 -->
                                            <li v-if="authorized_button['transferCompanyBatch']" @click="transfer_company">
                                                {{ $t('crm.Table.batchTransfer') }}
                                            </li>
                                            <!-- 分享客户 v-if="authorized_button['shareCompany']" -->
                                            <!-- <li @click="shareCompany">
                                                {{ $t('crm.Detail.shareCompany') }}
                                            </li> -->
                                            <!-- 扔入公海 -->
                                            <li v-if="authorized_button['batchThrowCompany']" @click="batch_throw_company">
                                                {{ $t('crm.Table.batchThrow') }}
                                            </li>
                                        </ul>
                                    </div>
                                </Poptip>
                            </div>

                            <!-- 清空已选 -->
                            <span style="position: absolute;right: 0;">
                                <Icon type="md-close"
                                    size="18"
                                    color="#A9B9C9"
                                    @click="clear_selected_items"
                                    class="cursor-pointer"></Icon>
                            </span>
                        </div>
                    </template>

                    <!-- 正常视图 -->
                    <template v-else>
                        <!-- 改版顶部筛选 -->
                        <TopFilter :title.sync="title_topFilter"
                                type="myCustomer"
                                :columnType="columnType"
                                :filtering.sync="filtering"
                                sql_manager="cpCompanyManagers"
                                :allUsers="allUsers"
                                :allColumns="allColumns"
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
                                    style="left:16px;"
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
                            <div class="fl">
                                <Tooltip :content="$t('crm.Table.viewList')" effect="dark" placement="top">
                                    <span class="change-customer-view change-customer-view-left piwik_view_list" :class="{ 'change-customer-view-active' : customerViewValue===1}"  @click="changeCustomerViewValue(1)">
                                        <i class="custom custom-my-customer-view-list"></i>
                                    </span>
                                </Tooltip>
                                <Tooltip :content="$t('crm.Table.viewCard')" effect="dark" placement="top">
                                    <span class="change-customer-view change-customer-view-right piwik_view_card" :class="{ 'change-customer-view-active' : customerViewValue===0}" @click="changeCustomerViewValue(0)">
                                        <i class="custom custom-my-customer-view-card"></i>
                                    </span>
                                </Tooltip>
                            </div>
                            <!-- 文件导出 -->
                            <Tooltip :content="$t('crm.Table.exportData')" effect="dark" placement="bottom">
                                <Button v-if="authorized_button['exportData']"
                                    type="text"
                                    icon="custom custom-file-download"
                                    @click="exportData"
                                    class="piwik_download_table_customer customer-filedownload custom-file-download-border"></Button>
                            </Tooltip>
                            <HelpTip :title="$t('helpTip.exportData')"></HelpTip>
                            <!-- 按钮组 -->
                            <span v-if="authorized_button['newCompany'] || authorized_button['importData']"
                                class="newCreate-btn-group">
                                <!-- 外部按钮 -->
                                <template v-if="authorized_button['newCompany']">
                                    <!-- 新建客户 -->
                                    <Button type="text"
                                            @click="newCreate"
                                            class="newCreate-btn-group-newCreate">{{ $t('crm.Table.newCompany') }}</Button>
                                </template>
                                <template v-else>
                                    <!-- 导入数据 -->
                                    <Button type="text"
                                            icon="custom custom-import"
                                            @click.stop="show_import_data=true"
                                            class="newCreate-btn-group-import">{{ $t('crm.Table.importData') }}</Button>
                                </template>

                                <!-- 下拉 -->
                                <template v-if="authorized_button['newCompany'] && authorized_button['importData']">
                                    <Dropdown placement="bottom-end">
                                        <Button icon="custom custom-menu-arrow"
                                                class="dropIcon">
                                            <span style="display: none;">_</span>
                                        </Button>
                                        <DropdownMenu slot="dropdown">
                                            <DropdownItem @click.native.stop="show_import_data=true">
                                                <!-- 导入数据 -->
                                                <span v-if="authorized_button['importData']">{{ $t('crm.Table.importData') }}</span>
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </template>
                            </span>
                        </div>
                    </template>
                </div>
            </div>
            <!-- 操作栏 -->
            <div class="_min_height_100" :style="{minHeight:table_height-100+'px'}">
                <!-- loading -->
                <Spin v-if="loading"
                      fix></Spin>

                <component v-if="customerView"
                    ref="customerView"
                    :is="customerView"
                    :companyId="companyId"
                    :flag_refreshColumn="flag_refreshColumn"
                    :table_height="table_height"
                    :tableData="tableData"
                    :currentColumns="currentColumns"
                    :config_tableFilter.sync="config_tableFilter"
                    :pageSize="pageSize"
                    :currentIndex.sync="currentIndex"
                    :pageSizeOpts="pageSizeOpts"
                    :totalNum="totalNum"
                    :curPage="curPage"
                    :close_popper="close_popper"
                    :fieldStyle="fieldStyle"
                    :allColumns.sync="allColumns"
                    :columnType="columnType"
                    :selected_items="selected_items"
                    :corp_columns_authorized="corp_columns_authorized"
                    :contact_columns_authorized="contact_columns_authorized"
                    :inquiry_columns_authorized="inquiry_columns_authorized"
                    :order_column.sync="order_column"
                    :order_type.sync="order_type"
                    :storageName_orderColumn.sync="storageName_orderColumn"
                    @refreshData="refreshData"
                    @columnsFilter="columnsFilter"
                    currentTable="customer"
                    @updateList="updateList"
                    @update_query="update_query"
                    @update_showPopper="update_showPopper"
                >
                </component>
                <!-- 表格 -->
            </div>
        </div>

        <!-- 修改字段 -->
        <EditColumns :visible.sync="visible_edit_columns"
                     :group.sync="group"
                     :id.sync="id_column_show_order"
                     :columnType="columnType"
                     :allColumns="allColumns"
                     :allGroup="allGroup"
                     :groupingRules="groupingRules"></EditColumns>

        <!-- 新建客户 -->
        <NewCompany :visible.sync="newCompanyShow"
                    type="customer"
                    @refreshData="refreshData"></NewCompany>

        <!-- 导入数据 -->
        <ImportData v-show="show_import_data"
                    :visible.sync="show_import_data"
                    type="customer"
                    @refreshData="refreshData"></ImportData>

        <!-- 合并客户 -->
        <MergeData v-show="show_merge_data"
                   :visible.sync="show_merge_data"
                   type="customer"
                   :ids="selected_items.map(item => item.companyId)"
                   @refreshData="refreshData({clearSelected: true})"></MergeData>

        <!-- 批量转移客户 -->
        <transferCompanyBatch :visible.sync="visible_transfer_company"
                              :ids="selected_items.map(item => item.companyId)"
                              @refreshData="refreshData({clearSelected: true})"></transferCompanyBatch>

        <!-- 批量退入公海 -->
        <BatchThrowCompany
                :visible.sync="visible_batch_throw_company"
                :ids="selected_items.map(item => item.companyId)"
                @refreshData="refreshData({clearSelected: true})"></BatchThrowCompany>

        <!-- 取消跟进 -->
        <Modal
            :visible.sync="visible_cancel_follow"
            :title="$t('crm.Modal.title_unfollow')"
            :append-to-body="true"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            width="656px"
        >
            <div>
                <p>{{ $t('crm.Detail.unfollowText')}}{{this.selected_items.length}}{{$t('crm.Detail.unfollowText1')}} {{this.cancelFollowData.length}} {{$t('crm.Detail.unfollowText2')}}</p>
                <!-- <p>{{ $t('crm.Modal.areyYouSureToCancelFollowUpOfselected') }} {{this.selected_items.length}} {{ $t('crm.Modal.customers') }}</p> -->
            </div>
            <div slot="footer">
                <Button @click="visible_cancel_follow = false">{{ $t('cancel') }}</Button>
                <Button type="primary" :disabled="unFollowBtn" @click="unFollow">{{ $t('confirm') }}</Button>
            </div>
        </Modal>

        <!-- 批量编辑 -->
        <batchEdit type="customer"
                :visible.sync="showBatchEdit"
                :ids="selected_items.map(item => item.companyId)"
                @refreshData="refreshData"></batchEdit>
        <!-- 群发单显&发送WhatsApp -->
        <contactSelectionBox type="customer"
            originalType="customer"
            :sendType="sendType"
            :visible.sync="visible_contact_selectionBox"
            :ids="selected_items.map(item => item.companyId)"
            :fieldColumns="fieldColumns"
            @refreshData="clear_selected_items"></contactSelectionBox>
        <!-- 批量分享 -->
        <batchShareCompany :visible.sync="visible_batch_share_company"
            :ids="selected_items.map(item => item.companyId)"
            @refreshData="refreshData"></batchShareCompany>
        <!-- 详情页 -->
        <CustomerDrawer :visible.sync="show_company_detail"
                        :id.sync="companyId"
                        :colSpan="24"
                        type="customer"
                        originalType="customer"
                        :corp_columns_authorized="corp_columns_authorized"
                        :contact_columns_authorized="contact_columns_authorized"
                        :inquiry_columns_authorized="inquiry_columns_authorized"
                        @refreshData="refreshData"
                        @refreshCheck="refreshCheck"></CustomerDrawer>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS, TOP_FILTER_ITEM } from '@/api/config';
    import Utils from '@/utils/index';
    import TopFilter from '@/views/crm/Table/Components/Html/topFilter';
    import FilterTags from '@/views/main-components/filter-tags';
    const EditColumns = () => import('@/views/crm/Table/Components/Modal/editColumns');
    const MergeData = () => import('@/views/crm/Table/Components/Modal/mergeData');
    const ImportData = () => import('@/views/crm/Table/Components/Modal/importData');
    const NewCompany = () => import('@/views/crm/Detail/Components/Modal/fixed-modal-form/create-company');
    const transferCompanyBatch = () => import('@/views/crm/Table/Components/Modal/transferCompanyBatch');
    const BatchThrowCompany = () => import('@/views/crm/Detail/Components/Modal/batchThrowCompany');
    const batchEdit = () => import('@/views/crm/Table/Components/Modal/batchEdit');
    const CustomerDrawer = () => import('@/views/crm/Table/Components/Html/customerDrawer');
    import contactSelectionBox from '@/views/crm/Table/Components/Modal/contactSelectionBox';
    import batchShareCompany from '@/views/crm/Table/Components/Modal/batchShareCompany';
    import customerTable from '@/views/crm/Table/Components/customerTable';
    import customerColumns from '@/views/crm/Table/Components/customerColumns';
    import tableBatchHandle from '@/mixins/tableBatchHandle';
    import { crmCommon, crmCompany } from '@/api/crm/index';
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
                this.addCondition[index].inputType = TOP_FILTER_ITEM.text[0].childrenType;
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
                if (Array.isArray(this.selectOptions[this.addCondition[index].condition1]) && this.selectOptions[this.addCondition[index].condition1].length) {
                    this.addCondition[index].conditionList2 = [
                        ...TOP_FILTER_ITEM.MultSelect
                    ];

                    this.addCondition[index].condition2 = '$regex';
                    this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelect[0].childrenType;
                    this.addCondition[index].condition3 = [];
                    this.addCondition[index].conditionList3 = this.selectOptions[this.addCondition[index].condition1].map(item => {
                        const { attrName, attrId } = item;
                        return { value: attrName, label: attrName };
                    });
                    if (this.addCondition[index].condition1 === 'iqProductCategory') {
                        this.addCondition[index].conditionList3.push({
                            value: -1, label: '空'
                        });
                    }
                } else {
                    this.addCondition[index].conditionList2 = [
                        ...TOP_FILTER_ITEM.text
                    ];
                    this.addCondition[index].condition2 = '$regex';
                    this.addCondition[index].inputType = TOP_FILTER_ITEM.text[0].childrenType;
                }
                break;
            // 单选型
            case 'cpClientType':
            case 'cpScale':
            case 'cpCompanySourceWay':
            case 'iqSourceChannel':
            case 'iqSourceWay':
            case 'iqGrouping':
            case 'iqFollowUp':
                if (Array.isArray(this.selectOptions[this.addCondition[index].condition1]) && this.selectOptions[this.addCondition[index].condition1].length) {
                    this.addCondition[index].conditionList2 = [
                        ...TOP_FILTER_ITEM.select
                    ];

                    this.addCondition[index].condition2 = '$eq';
                    this.addCondition[index].inputType = TOP_FILTER_ITEM.select[0].childrenType;
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
                    } else if (this.addCondition[index].condition1 === 'cpClientType') {
                        this.addCondition[index].conditionList3 = [{
                            value: -1,
                            label: this.$t('crm.UniSet.defaultFollowUpStatus_empty')
                        }].concat(this.selectOptions[this.addCondition[index].condition1].map(item => {
                            const { attrName } = item;
                            return { value: attrName, label: attrName };
                        }));
                    } else {
                        this.addCondition[index].conditionList3 = this.selectOptions[this.addCondition[index].condition1].map(item => {
                            const { attrName } = item;
                            return { value: attrName, label: attrName };
                        });
                    }
                } else {
                    this.addCondition[index].conditionList2 = [
                        ...TOP_FILTER_ITEM.text
                    ];
                    this.addCondition[index].condition2 = '$regex';
                    this.addCondition[index].inputType = TOP_FILTER_ITEM.text[0].childrenType;
                }
                break;
            case 'cpCreateUser':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.select
                ];
                this.addCondition[index].condition2 = '$eq';
                this.addCondition[index].inputType = TOP_FILTER_ITEM.select[0].childrenType;
                this.addCondition[index].condition3 = '';
                this.addCondition[index].conditionList3 = [].concat(
                    [{ label: '询盘云', value: -2 }],
                    this.allUsers.map(item => {
                        const { fullname: label, id: value } = item;
                        return { label, value };
                    })
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
                this.addCondition[index].condition2 = '$range';
                this.addCondition[index].inputType = TOP_FILTER_ITEM.number[0].childrenType;
                this.addCondition[index].condition3 = [0, 0];
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
            case 'cpLastGetCompanyTime':
            case 'cpLastTransactionTime':
            case 'cpPredictGiveupTime':
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
            // 仪表盘-客户跟进情况概览, 带过来的筛选条件"跟进时间", 特殊处理
            case 'eventDate':
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
            // 负责人, 数组, 多选
            case 'cpCompanyManagers':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.MultSelectUser
                ];
                this.addCondition[index].condition2 = '$eq';
                this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelectUser[0].childrenType;
                this.addCondition[index].condition3 = [];
                this.addCondition[index].conditionList3 = this.allUsers.map(item => {
                    const { fullname: label, id: value } = item;
                    return { label, value };
                });
                break;
            // 负责人所属部门
            case 'cpCompanyManagerDepartments':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.departmentSelect
                ];
                this.addCondition[index].inputType = TOP_FILTER_ITEM.departmentSelect[0].childrenType;
                this.addCondition[index].condition2 = '$regex';
                this.addCondition[index].condition3 = [];
                break;
            // 国家地区
            case 'cpCountryArea':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.contrySelect
                ];
                this.addCondition[index].condition2 = '$eq';
                this.addCondition[index].inputType = 'countryArea';
                this.addCondition[index].condition3 = '';
                break;
            // 自定义字段
            default:
                const temp = this.allColumns.find(item => item.key === this.addCondition[index].condition1);
                if (temp) {
                    switch (temp.filterType) {
                        case 'date':
                        case 'date+time':
                            this.addCondition[index].conditionList2 = [
                                ...TOP_FILTER_ITEM.dateRange
                            ];
                            this.addCondition[index].condition2 = '$range';
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.dateRange[0].childrenType;
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
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelect[0].childrenType;
                            this.addCondition[index].condition3 = [];
                            this.addCondition[index].conditionList3 = temp.option.split('?').map(item => {
                                return { value: item, label: item };
                            });
                            break;
                        case 'select':
                            this.addCondition[index].conditionList2 = [
                                ...TOP_FILTER_ITEM.select
                            ];
                            this.addCondition[index].condition2 = '$eq';
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.select[0].childrenType;
                            this.addCondition[index].condition3 = '';
                            this.addCondition[index].conditionList3 = temp.option.split('?').map(item => {
                                return { value: item, label: item };
                            });
                            break;
                        case 'text':
                        case 'textarea':
                            this.addCondition[index].conditionList2 = [
                                ...TOP_FILTER_ITEM.text
                            ];
                            this.addCondition[index].condition2 = '$regex';
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.text[0].childrenType;
                            break;
                        default:
                            this.addCondition[index].conditionList2 = [
                                ...TOP_FILTER_ITEM.text
                            ];
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.text[0].childrenType;
                    }
                } else {
                    this.addCondition[index].conditionList2 = [
                        ...TOP_FILTER_ITEM.text
                    ];
                    this.addCondition[index].inputType = TOP_FILTER_ITEM.text[0].childrenType;
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
                this.addCondition[index].condition3 = '';
                this.addCondition[index].inputType = TOP_FILTER_ITEM.text.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                break;
            // 多选型
            case 'iqProductCategory':
            case 'iqLabel':
                this.addCondition[index].condition3 = [];
                this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelect.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                break;
            // 单选型
            case 'cpClientType':
            case 'cpScale':
            case 'cpCompanySourceWay':
            case 'cpCreateUser':
            case 'iqSourceChannel':
            case 'iqSourceWay':
            case 'iqGrouping':
            case 'iqFollowUp':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.select.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = '';
                if (this.addCondition[index].inputType === 'array') {
                    this.addCondition[index].condition3 = [];
                }
                if (this.addCondition[index].condition1 === 'cpClientType' && this.addCondition[index].condition2 === '$ne') {
                    this.addCondition[index].conditionList3 = this.selectOptions[this.addCondition[index].condition1].map(item => {
                        const { attrName } = item;
                        return { value: attrName, label: attrName };
                    });
                }
                if (this.addCondition[index].condition1 === 'cpClientType' && this.addCondition[index].condition2 === '$eq') {
                    this.addCondition[index].conditionList3 = [{
                        value: -1,
                        label: this.$t('crm.UniSet.defaultFollowUpStatus_empty')
                    }].concat(this.selectOptions[this.addCondition[index].condition1].map(item => {
                        const { attrName } = item;
                        return { value: attrName, label: attrName };
                    }));
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
                this.addCondition[index].condition3 = 0;
                if (this.addCondition[index].inputType === 'numberRange') {
                    this.addCondition[index].condition3 = [0, 0];
                }
                break;
            // Boolean
            case 'cpMarker':
            case 'ctGender':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.boolean.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = 1;
                if (this.addCondition[index].inputType === 'booleanMultSelect') {
                    this.addCondition[index].condition3 = [];
                }
                break;
            // 时间类
            case 'cpCreateTime':
            case 'cpUpdateTime':
            case 'cpLastFollowUpTime':
            case 'ctBirthday':
            case 'eventDate':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.dateRange.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = '';
                if (this.addCondition[index].inputType === 'dateRange') {
                    this.addCondition[index].condition3 = [];
                }
                break;
            // 负责人所属部门
            case 'cpCompanyManagerDepartments':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.departmentSelect.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = [];
                break;
            // 负责人, 数组
            case 'cpCompanyManagers':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelectUser.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = [];
                break;
            // 国家地区
            case 'cpCountryArea':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.contrySelect.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = '';
                break;
            // 自定义字段
            default:
                const temp = this.allColumns.find(item => item.key === this.addCondition[index].condition1);
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
                    }
                } else {
                    this.addCondition[index].inputType = TOP_FILTER_ITEM.text.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                    this.addCondition[index].condition3 = '';
                }
                break;
        }
        if (this.addCondition[index].inputType === 'null' || this.addCondition[index].inputType === 'nnull') {
            this.addCondition[index].condition3 = -1;
        }
    };

    export default {
        name: 'myCustomer',
        mixins: [tableBatchHandle],
        components: {
            customerTable,
            customerColumns,
            TopFilter,
            EditColumns,
            MergeData,
            ImportData,
            NewCompany,
            transferCompanyBatch,
            CustomerDrawer,
            FilterTags,
            BatchThrowCompany,
            batchEdit,
            contactSelectionBox,
            batchShareCompany
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                window_height: 'window_height',
                lang: state => state.app.lang,
                button_list: state => state.app.button_list,
                allUsers: state => state.crm.allUsers,
                salesList: state => state.crm.salesList,
                allSelectOptions: state => state.crm.selectOptions
            }), // 从 vuex 中获取属性
            visible_batch_operate() {
                return this.selected_items.length > 0;
            },
            table_height() {
                let temp = this.window_height ? this.window_height - 174 : document.body.clientHeight - 174;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            },
            authorized_button() {
                const ids = BUTTON_IDS.CRM.customer;
                return {
                    newCompany: !HANDLE_BUTTON(ids.newCompany, this.button_list),
                    importData: !HANDLE_BUTTON(ids.dataImport.importData, this.button_list),
                    exportData: !HANDLE_BUTTON(ids.dataExport.documentDownload, this.button_list),
                    mergeData: !HANDLE_BUTTON(ids.edit.merge, this.button_list),
                    transferCompanyBatch: !HANDLE_BUTTON(ids.edit.batchTransfer, this.button_list),
                    batchThrowCompany: !HANDLE_BUTTON(ids.edit.batchThrowCompany, this.button_list),
                    editCompany: !HANDLE_BUTTON(ids.edit.editCustomer, this.button_list),
                    sendWhatsApp: !HANDLE_BUTTON(BUTTON_IDS.WhatsApp.WA_Group_Btn_List.personGroupSend, this.button_list) || !HANDLE_BUTTON(BUTTON_IDS.WhatsApp.WA_Group_Btn_List.ApiGroupSend, this.button_list)
                };
            },
            // 转换筛选条件数组
            computed_addCondition() {
                return this.addCondition.filter(item => item.condition1 && item.condition2 && ((item.condition3 && item.condition3.length) || item.condition3 instanceof Date || (typeof item.condition3 === 'number' && !isNaN(item.condition3)))).map(item => {
                    const temp = {};
                    const con = this.getSearchCon(item.condition1);
                    const type = item.condition2;
                    switch (item.inputType) {
                        case 'string':
                        case 'number':
                        case 'boolean':
                        case 'booleanSelect':
                        case 'null':
                        case 'nnull':
                        case 'select':
                        case 'department':
                            temp[con] = {};
                            temp[con][type] = item.condition3;
                            return temp;
                        case 'countryArea':
                            temp[con] = {};
                            temp[con][type === '$ne' ? '$nregex' : '$regex'] = item.condition3.replace('unknown', '');
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
                                        temp.$or = item.condition3.map(val => {
                                            const temp = {};
                                            temp[con] = {};
                                            temp[con][type] = val;
                                            return temp;
                                        });
                                    }
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
                        // 数字组件改为两个数字,这里做了一些特殊处理
                    } else if (['cpTouchCount', 'cpFollowUpCount', 'cpNotFollowedDays', 'cpTransactionMoneyRmb', 'cpTransactionInquiryCount'].includes(key)) {
                        temp.$and = val.$and;
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
        data() {
            return {
                /* 全局 */
                cancelFunc: null,
                listType: 3,
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
                    // 自定义字段 - 无
                    // 其他字段
                    cpCompanyManagers: this.$t('crm.Table.col_companyManagers'),
                    cpCompanyManagerDepartments: this.$t('crm.Table.col_companyManagerDepartments'),
                    cpMarker: this.$t('crm.Table.col_marker'),
                    cpFollowUpCount: this.$t('crm.Table.col_followUpCount'),
                    cpTouchCount: this.$t('crm.Table.col_touchCount'),
                    cpNotFollowedDays: this.$t('crm.Table.col_notFollowedDays'),
                    cpDynamic: this.$t('crm.Table.col_lastFollowup'),
                    cpLastFollowUpTime: this.$t('crm.Table.col_lastFollowupTime'),
                    cpCreateUser: this.$t('crm.WorkBench.col_followUpCreateUser'),
                    cpCreateTime: this.$t('crm.Table.col_createTime'),
                    cpUpdateTime: this.$t('crm.Table.col_updateTime'),
                    cpCompanySourceWay: this.$t('crm.Table.col_customerSource'),
                    cpLastGetCompanyTime: this.$t('crm.Table.col_mostRecentlyObtainedTime'),
                    cpLastTransactionTime: this.$t('crm.Table.col_lastTransactionTime'),
                    cpTransactionMoneyRmb: this.$t('crm.Table.col_transactionInquiryAmount'),
                    cpTransactionInquiryCount: this.$t('crm.Table.col_transactionInquiryNO'),
                    cpPredictGiveupTime: this.$t('crm.Table.col_inflowintoTheOpenSea'),

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
                    iqEstimatedInquiryAmount: this.$t('crm.Detail.inq_estimatedInquiryAmount'),

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
                flag_refreshColumn: true, // 使用 v-if 刷新列表列顺序
                totalNum: 0,
                curPage: 1,
                pageSize: null,
                maxPageNum: 1,
                pageSizeOpts: [20, 50, 100],
                tableData: [],
                prefixes: ['cp', 'iq', 'ct'], // 字段模块前缀
                // 需要添加日期处理方法的字段
                dateOptionsFileds: ['cpLastFollowUpTime', 'cpCreateTime', 'cpUpdateTime', 'cpLastGetCompanyTime', 'cpLastTransactionTime', 'cpPredictGiveupTime'],
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
                    iqProductCategory: row => {
                        return this.$options.filters.parseArray(row.iqProductCategory).length ? this.$options.filters.parseArray(row.iqProductCategory).join(', ') : '-';
                    },
                    iqFollowUp: row => {
                        let str = '-';
                        if (/\d+/.test(`${row.iqFollowUpId}`)) {
                            if (`${row.iqFollowUpId}` === '-1') {
                                str = this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry');
                            }
                            const temp = this.selectOptions.iqFollowUp ? this.selectOptions.iqFollowUp.find(item => `${item.attrId}` === `${row.iqFollowUpId}`) : undefined;
                            str = temp ? temp.attrName : str;
                        } else {
                            str = row.iqFollowUp || '-';
                        }
                        return str;
                    },
                    ctSocialNetworkingPlatform: row => {
                        return Array.isArray(row.ctSocialNetworkingPlatform) && row.ctSocialNetworkingPlatform.filter(item => item.attrValue).length ? row.ctSocialNetworkingPlatform.map(item => {
                            return `${item.attrName}: ${item.attrValue}`;
                        }).join(', ') : '-';
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
                    },
                    cpNotFollowedDays: row => {
                        let temp = null;
                        if (row.cpNotFollowedDays) {
                            temp = Math.floor((Date.now() - row.cpNotFollowedDays) / (24 * 60 * 60 * 1000));
                            if (temp < 0) {
                                temp = 0;
                            }
                        }
                        return temp;
                    }
                },
                currentColumns: [], // 表格列名称
                allColumns: [], // 表格全部列
                close_popper: this.$debounce(() => {                 
                    // 关闭表头筛选框浮层
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

                    // 关闭标签弹窗
                    if (this.$refs.abbrLabel) {
                        this.$refs.abbrLabel.forEach(item => {
                            item.doClose();
                        });
                    }
                }, 100, true),
                /* 筛选 */
                title_topFilter: this.$t('crm.Table.allCustomer'),
                flag_topFilter: false,
                type_topFilter: '',
                addChangeCon1: addChangeCon1,
                addChangeCon2: addChangeCon2,
                // order_column: '',
                // order_type: '',
                // storageName_orderColumn: '',
                order_column: localStorage.getItem('myCustomer_order_column') ? localStorage.getItem('myCustomer_order_column') : '', /* 排序列 */
                order_type: localStorage.getItem('myCustomer_order_type') ? localStorage.getItem('myCustomer_order_type') : '', /* 排序类型  asc desc */
                storageName_orderColumn: localStorage.getItem('myCustomer_storageName_orderColumn') ? localStorage.getItem('myCustomer_storageName_orderColumn') : '',
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
                // 负责人 高级筛选
                subUserOptType: [],
                // "负责人部门"字段 高级筛选
                departmentOptType: [],
                // "负责人"字段筛选, 单独发送
                subUserIds: '',
                // "负责人部门"字段筛选, 单独发送
                departmentIds: '',
                // 仪表盘跟进情况概览的"跟进时间"字段筛选, 此字段当前不在客户表格页显示, 特殊处理, 单独发送
                eventDate: [],
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
                columnType: 1,
                id_column_show_order: undefined,
                group: [],
                allGroup: [],
                groupingRules: [
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
                // 合并
                show_merge_data: false,
                // 转移
                visible_transfer_company: false,

                /* 导入数据 */
                show_import_data: false,

                /* 新建公司 */
                newCompanyShow: false,
                // 下拉选项加上模块前缀 - 注意, 此处为了配合 topFilter , 不能修改变量名, 要保证 addChangeCon 中的 selectOptions 变量名和 topFilter-customSearch 的 prop:selectOptions  一致
                selectOptions: {},

                /* 对接权限系统 */
                corp_columns_authorized: {}, // 公司所有字段
                contact_columns_authorized: {}, // 联系人所有字段
                inquiry_columns_authorized: {}, // 询盘所有字段

                /* 客户详情 */
                companyId: 0,
                show_company_detail: false,
                rowIndex: -1,
                /* crm批量操作 */
                visible_batch_throw_company: false, // 批量退入公海
                visible_cancel_follow: false, // 取消跟进
                cancelFollowData: [],
                customerViewValue: 0, // 客户列表视图展示
                customerView: null,
                currentIndex: null,

                // 是否有从仪表盘带过来的筛选条件指定了表格显示类型, true 代表有
                dashBoardViewFlag: false,
                // 仪表盘进入 是否显示第一条数据
                showFirst: false,
                // 批量编辑相关
                showBatchEdit: false,

                // 当前的操作人姓名
                // userNameCh: '',
                // 请求数据时禁止'取消跟进'的确定按钮可以一直点
                unFollowBtn: false,
                visible_contact_selectionBox: false,
                visible_batch_share_company: false,
                sendType: null
            };
        },
        created() {
            // 获取全部用户
            !this.allUsers.length && this.$store.dispatch('getAllUsers');
            // 获取 下拉选项数据 用到组件detailInfo.vue inquiryInfo.vue newInquiry.vue editCompany.vue newContact.vue  addInquiryLabel.vue
            this.$store.dispatch('getSelectOptions');
            // 获取全部销售人员
            !this.salesList.length && this.$store.dispatch('getSalesList');
            this.loading = true;
            const query = this.$route.query;
            if (query && query.insfrom === '1' && query.companyId) {
                this.$viewCustomer(query.companyId, '_self');
            }
        },
        async mounted() {
            // 获取列表相关数据 筛选数据 + 列表字段 + 显示字段 + 左上角筛选第一项的下拉数据
            await this.getTableColumns();
            // 获取所有授权字段
            this.getAllField();
        },
        beforeDestroy() {
            this.companyId = '';
        },
        methods: {
            // 获取所有授权字段
            getAllField() {
                // 获取所有授权字段
                // 获取列表表头+显示顺序+表格宽度+显示条数
                const data = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    type: this.columnType,
                    key: 'myCustomer',
                    pageType: 1, // 1代表客户列表固定
                    attrType: 1, // 1、视图操作按钮
                    parentId: 0
                };
                crmCommon.getCommonConfig(data).then(res => {
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
                        this.$set(this.corp_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 1));
                        this.$set(this.corp_columns_authorized, 'custom', customFields.filter(col => col.parentId === 1));
                        this.$set(this.contact_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 2));
                        this.$set(this.contact_columns_authorized, 'custom', customFields.filter(col => col.parentId === 2));
                        this.$set(this.inquiry_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 3));
                        this.$set(this.inquiry_columns_authorized, 'custom', customFields.filter(col => col.parentId === 3));
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                    }
                });
            },
            getTableColumns() {
                crmCommon.getCompanyFrontList({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    listType: this.columnType, // listType：1客户，4公海客户
                    configKey: 'myCustomer'
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
                                col.columnsFilter = Boolean(this.config_tableFilter[col.key].sort);
                                col.title = this.langObj[col.key] || col.title;
                                this.langObj[col.key] = col.title;
                                if (col.key === 'cpCompanyName') {
                                    col.className = 'cp_companyName';
                                    col.fixed = 'left';
                                } else if (col.key === 'ctEmail') {
                                    col.className = 'ct_email';
                                }
                                if (this.tableFormatters[col.key]) {
                                    col.formatter = this.tableFormatters[col.key];
                                } else if (col.fieldType === 'custom' && col.filterType === 'selectMultiple') {
                                    col.formatter = (row) => {
                                        return this.$options.filters.parseArray(row[col.key]).length ? this.$options.filters.parseArray(row[col.key]).join(', ') : '-';
                                    };
                                }
                            } else {
                                col.renderHeader = this.renderHeader_text(index);
                                col.title = this.langObj[col.key] || col.title;
                                this.langObj[col.key] = col.title;
                                if (this.tableFormatters[col.key]) {
                                    col.formatter = this.tableFormatters[col.key];
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

                        // 列表显示字段 key  ==== 配置表格显示项 开始 ============
                        if (response.data.fieldOrder) {
                            // 解构数据
                            const { id, showField, fieldStyle } = response.data.fieldOrder;
                            this.id_column_show_order = id;
                            // 处理字段宽度
                            this.fieldStyle = fieldStyle ? JSON.parse(fieldStyle) : {};
                            Object.entries(this.fieldStyle).forEach(([fieldKey, fieldObj]) => {
                                const column = this.allColumns.find(item => item.key === fieldKey);
                                if (column && fieldObj.width) {
                                    column.width = fieldObj.width;
                                }
                            });
                            // 处理字段顺序
                            if (typeof showField === 'string') {
                                this.group = showField.split(',').map(key => {
                                    // 显示字段无前缀者, 默认加上公司前缀
                                    return this.prefixes.some(prefix => key.startsWith(prefix)) ? key : `cp${this.firstUpperCase(key)}`;
                                });
                            }
                        }
                        // ============= 配置表格显示项 结束 =================

                        // 根据跳转时附加参数的不同作出相应刷新操作
                        this.checkRouteParams();

                        // 获取显示形式 开始   attrValue 1为列表，0为分配
                        // dashBoardViewFlag 是从仪表盘过来的 要用仪表盘带的逻辑，不走该逻辑
                        if (!this.dashBoardViewFlag) {
                            if (response.data.pageDisplay) {
                                this.customerViewValue = response.data.pageDisplay.attrValue;
                                if (this.customerViewValue) {
                                    this.bus.$emit('shrinkMenu', false);
                                    this.customerView = 'customerTable';
                                } else {
                                    this.bus.$emit('shrinkMenu', true);
                                    this.customerView = 'customerColumns';
                                }
                            } else {
                                this.changeCustomerViewValue(this.customerViewValue);
                            }
                        }
                        // 获取显示形式 结束
                        //  用户当前设置页数 开始
                        if (response.data.userConfig && response.data.userConfig.value) {
                            const size = parseInt(response.data.userConfig.value);
                            this.pageSize = size;
                        } else {
                            this.pageSize = 20;
                            this.addPageSize();
                        }
                        //  用户当前设置页数 结束

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
            // 保存显示形式attrValue 1为列表，0为分屏
            saveCommonPageDisplay() {
                const data = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    pageType: 1, // 1代表客户列表固定
                    attrType: 1, // 1、视图操作按钮
                    attrValue: this.customerViewValue
                };
                crmCommon.commonPageDisplaySave(data);
            },
            /* 添加PageSize */
            addPageSize() {
                const data = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    key: 'myCustomer',
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
                                switch (con) {
                                    case 'cpFollowUpCount': // 员工待办事项【待处理客户】
                                        result.$and = [];
                                        const start = {};
                                        start[con] = {};
                                        start[con].$gte = Number(val.slice(0, val.indexOf('-')));
                                        result.$and.push(start);

                                        const end = {};
                                        end[con] = {};
                                        end[con].$lte = Number(val.slice(val.indexOf('-') + 1, val.length));
                                        result.$and.push(end);
                                        this.$set(this.sqlList_tableFilter, con, result);
                                        break;
                                    default:
                                        this.$set(this.sqlList_tableFilter, con, {
                                            $eq: val
                                        });
                                        break;
                                }
                                break;
                            case 'select':
                            case 'users':
                            case 'departments':
                                switch (con) {
                                    // 单独发送的字段在最外层, 方便 merge_query_list , 否则用 $or: [筛选条件...]
                                    case 'cpCompanyManagers':
                                    case 'cpCompanyManagerDepartments':
                                        result.$regex = val.map(item => item.value);
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
                                        result.$or = val.map(item => {
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
            // 根据跳转时附加参数的不同作出相应刷新操作
            checkRouteParams() {
                // 处理从任务带参数跳过来的情况 或 从工作台行为视图点击跳转
                if (localStorage.getItem('leadsCloud-companyId')) {
                    const tempId = localStorage.getItem('leadsCloud-companyId');
                    localStorage.removeItem('leadsCloud-companyId');
                    this.$router.replace({
                        name: 'companyDetail',
                        query: {
                            companyId: tempId
                        }
                    });
                    return;
                }

                // 处理仪表盘带 Map 类型筛选条件跳转
                if (localStorage.getItem('dashboard_customer_filters')) {
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', true);
                    // 提取筛选条件 Map 数组
                    const initial_filter_cons = new Map(JSON.parse(localStorage.getItem('dashboard_customer_filters')));
                    localStorage.removeItem('dashboard_customer_filters');

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
                // 处理仪表盘带参数跳转 - 回填左上角筛选
                if (localStorage.getItem('dashboard_customer_search_filters')) {
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', true);
                    // 提取筛选条件 Map 数组
                    const search_filter_cons = JSON.parse(localStorage.getItem('dashboard_customer_search_filters'));
                    localStorage.removeItem('dashboard_customer_search_filters');
                    this.addCondition = [];
                    search_filter_cons.forEach((val, index) => {
                        if (val.key === 'cpCompanyManagers') {
                            this.addClick();
                            this.addCondition[index].condition1 = val.key;
                            this.addCondition[index].condition2 = '$regex';
                            this.addCondition[index].conditionList3 = this.allUsers.map(item => {
                                const { fullname: label, id: value } = item;
                                return { label, value };
                            });
                            this.addCondition[index].inputType = 'array';
                            this.$nextTick(() => {
                                this.addCondition[index].condition3 = [val.val];
                            });
                        }
                        if (val.key === 'cpFollowUpCount') {
                            this.addClick();
                            this.addCondition[index].condition1 = val.key;
                            this.addCondition[index].condition2 = '$eq';
                            this.addCondition[index].condition3 = val.val;
                            this.addCondition[index].inputType = 'number';
                        }
                        if (val.key === 'iqFollowUp') {
                            this.addClick();
                            this.addCondition[index].condition1 = val.key;
                            this.addCondition[index].condition2 = '$ne';
                            this.addCondition[index].conditionList3 = [{
                                value: -1,
                                label: this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry')
                            }].concat(this.selectOptions[this.addCondition[index].condition1].map(item => {
                                const { attrName, attrId } = item;
                                return { value: attrId, label: attrName };
                            }));
                            this.$nextTick(() => {
                                this.addCondition[index].condition3 = val.val;
                            });
                            this.addCondition[index].inputType = 'select';
                        }
                        if (val.key === 'cpClientType') {
                            this.addClick();
                            this.addCondition[index].condition1 = val.key;
                            this.addCondition[index].condition2 = '$eq';
                            this.addCondition[index].condition3 = val.val;
                            this.addCondition[index].disabled = val.val === -1;
                            this.addCondition[index].inputType = 'select';
                        }
                        if (val.key === 'cpCreateTime' && val.val.length) {
                            this.addClick();
                            this.addCondition[index].condition1 = val.key;
                            this.addCondition[index].condition2 = 'dateRange';
                            this.addCondition[index].condition3 = val.val;
                            this.addCondition[index].inputType = 'dateRange';
                        }
                        if (val.key === 'cpNotFollowedDays') {
                            this.addClick();
                            this.addCondition[index].condition1 = val.key;
                            this.addCondition[index].condition2 = val.symbol;
                            this.addCondition[index].condition3 = val.val;
                            this.addCondition[index].inputType = 'number';
                        }

                        // 处理"客户跟进情况概览"图表带过来的"跟进时间"
                        if (val.key === 'eventDate') {
                            this.conditionList1.unshift({
                                value: 'eventDate',
                                label: this.$t('crm.WorkBench.col_followUpTime')
                            });
                            this.addCondition.forEach(item => {
                                item.conditionList1 = this.$deepClone(this.conditionList1);
                            });
                            this.addClick();
                            this.addCondition[index].condition1 = val.key;

                            if (Array.isArray(val.val) && val.val.length === 2) {
                                // 时间段筛选

                                this.addCondition[index].condition2 = 'dateRange';
                                this.addCondition[index].condition3 = val.val;
                                this.addCondition[index].inputType = 'dateRange';
                            } else {
                                // "跟进时间"筛选条件为"全部" - 转为"小于当前日期"筛选

                                this.addCondition[index].condition2 = '$lte';
                                this.addCondition[index].condition3 = this.$options.filters.timeFormat(Date.now());
                                this.addCondition[index].inputType = 'date';
                            }
                        }

                        // 处理"客户列表展示方式", 指定按照带过来的条件显示列表
                        if (val.key === 'customerViewValue' && [0, 1].includes(val.val)) {
                            this.dashBoardViewFlag = true;
                            this.customerViewValue = val.val;
                            this.showFirst = true;
                            if (val) {
                                this.customerView = 'customerTable';
                                this.bus.$emit('shrinkMenu', false);
                            } else {
                                this.customerView = 'customerColumns';
                                this.bus.$emit('shrinkMenu', true);
                            }
                        }

                        // 处理"客户 ID", 打开指定客户侧滑页
                        if (val.key === 'companyId' && val.val) {
                            this.showFirst = false;
                            this.companyId = val.val;

                            // 否则打开侧滑页
                            this.show_company_detail = true;
                        }
                    });

                    // 检索
                    setTimeout(() => {
                        if (this.addCondition.length) {
                            this.filtering = false;
                            this.type_topFilter = 'customSearch';
                            this.$nextTick(() => {
                                this.flag_topFilter = !this.flag_topFilter;
                            });
                        } else {
                            this.filtering = false;
                            this.type_topFilter = 'searchCommon';
                            this.flag_topFilter = !this.flag_topFilter;
                        }
                    });

                    // 停止向下执行
                    return;
                }
                // 请求表格数据
                this.filtering = false;
                this.type_topFilter = 'searchCommon';
                this.flag_topFilter = !this.flag_topFilter;
            },
            // 设置属性列表
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
                    this.$set(this.selectOptions, (storageNameMap[key] || key), value);
                });

                /* 如果请求下来的所有选项( selectOptions )中有与筛选设置( config_tableFilter )匹配的属性, 且匹配到的筛选设置筛选类型为 'select' , 则导入选项数据到匹配筛选设置 */
                Object.entries(this.selectOptions).forEach(([key, value]) => {
                    if (this.config_tableFilter.hasOwnProperty(key)) {
                        const temp = this.config_tableFilter[key];
                        if (temp.filterType === 'select') {
                            temp.allList = value.map(({ attrId, attrName }) => {
                                return {
                                    value: ['cpGiveupReason', 'iqFollowUp'].includes(key) ? attrId : attrName,
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
                const allList = this.allUsers.map(item => {
                    const { fullname: label, id: value } = item;
                    return { label, value };
                });
                this.config_tableFilter.cpCreateUser && this.$set(this.config_tableFilter.cpCreateUser, 'allList', [{ label: '询盘云', value: -2 }].concat(allList));
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
                // 处理负责人筛选, 优先使用右上角检索条件
                const subUserIds_a = a.filter(item => item.hasOwnProperty('cpCompanyManagers'));
                const subUserIds_b = b.filter(item => item.hasOwnProperty('cpCompanyManagers'));
                if (subUserIds_a && subUserIds_a.length) {
                    this.subUserOptType = [];
                    subUserIds_a.forEach(items => {
                        Object.entries(items.cpCompanyManagers).forEach(([fieldKey, fieldObj]) => {
                            this.subUserOptType.push({
                                [fieldKey]: fieldObj === -1 ? [] : fieldObj
                            });
                        });
                    });
                } else {
                    this.subUserOptType = [];
                }
                if (subUserIds_b && subUserIds_b.length) {
                    this.subUserIds = subUserIds_b[0].cpCompanyManagers.$regex.join(',');
                } else {
                    this.subUserIds = '';
                }
                // 负责人所在部门
                const cpCompanyManagerDepartments = a.filter(item => item.hasOwnProperty('cpCompanyManagerDepartments'));
                if (cpCompanyManagerDepartments && cpCompanyManagerDepartments.length) {
                    this.departmentOptType = [];
                    cpCompanyManagerDepartments.forEach(items => {
                        Object.entries(items.cpCompanyManagerDepartments).forEach(([fieldKey, fieldObj]) => {
                            this.departmentOptType.push({
                                [fieldKey]: fieldObj === -1 ? [] : fieldObj.map(item => item.value)
                            });
                        });
                    });
                } else {
                    this.departmentOptType = [];
                }
                this.departmentIds = '';
                const departmentIds = b.filter(item => item.hasOwnProperty('cpCompanyManagerDepartments'));
                if (departmentIds[0]) {
                    this.departmentIds = departmentIds[0].cpCompanyManagerDepartments.$regex.join(',');
                }
                a = a.filter(item => !item.hasOwnProperty('cpCompanyManagers') && !item.hasOwnProperty('cpCompanyManagerDepartments'));
                b = b.filter(item => !item.hasOwnProperty('cpCompanyManagers') && !item.hasOwnProperty('cpCompanyManagerDepartments'));

                // 过滤 eventDate , 提取其数据单独发送
                this.eventDate = [];
                a = a.filter(item => {
                    if (item.$and && item.$and.every(item => item.hasOwnProperty('eventDate'))) {
                        this.eventDate = item.$and.map(i => Object.values(i.eventDate)[0].replace(' 23:59:59.999', ''));
                        return false;
                    } else if (item.hasOwnProperty('eventDate')) {
                        const dateVal = Object.values(item.eventDate)[0].replace(' 23:59:59.999', '');
                        if (item.eventDate.$lte) {
                            this.eventDate = ['2015-01-01', dateVal];
                        } else if (item.eventDate.$gte) {
                            this.eventDate = [dateVal, this.$options.filters.timeFormat(Date.now())];
                        } else {
                            this.eventDate = [];
                        }
                        return false;
                    }
                    return true;
                });

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
                        case 'departments':
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

                this.refreshData_filter();
            },
            // filterTags 组件内部修改筛选值后触发的方法, 由下方的 updateList 改造而成
            change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    const column = this.allColumns.find(item => item.key === key);
                    if (column) {
                        // 判断是否有值, 调整 sqlList
                        const con = column.fieldType === 'custom' ? key : this.getSearchCon(key);
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
                                            result.$regex = temp.query.map(item => item.value);
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
                localStorage.removeItem('myCustomer_order_column');
                localStorage.removeItem('myCustomer_order_type');
                localStorage.removeItem('myCustomer_storageName_orderColumn');
                // 刷新
                this.curPage = 1;
                this.refreshData();
                if (this.$refs.customerView.$refs.headFilterPoptip) {
                    this.$refs.customerView.sortVal = '';
                    this.$refs.customerView.sortKey = '';
                }
            },
            // 多选
            handleSelectionChange({ records, reserves }) {
                const selection = records.concat(reserves);
                if (selection.length > 0) {
                    this.selected_items = selection.map(item => {
                        const { companyId, cpCompanyManagerIds } = item;
                        return {
                            companyId,
                            cpCompanyManagerIds
                        };
                    });
                } else {
                    this.selected_items = [];
                }
            },
            // 清除表格已选内容
            clear_selected_items() {
                if (this.$refs.customerView && this.$refs.customerView.$refs.table) {
                    this.$refs.customerView.$refs.table.clearCheckboxRow();
                    this.$refs.customerView.$refs.table.clearCheckboxReserve();
                }
                this.selected_items = [];
                this.cancelFollowData = [];
            },

            /* 合并询盘 */
            merge_company() {
                if (this.selected_items.length === 2) {
                    this.show_merge_data = true;
                } else {
                    this.$Message.error(this.$t('crm.Table.error_mergeCompanyLength'));
                }
            },

            /* 批量转移客户 */
            transfer_company() {
                this.closePoptip();
                this.visible_transfer_company = true;
            },

            /* 新建客户 */
            newCreate() {
                this.newCompanyShow = true;
            },

            /* 文件下载 */
            async exportData() {
                /**
                 * @Description: 先保存显示字段, 再下载
                 * 20210528 产品要求更新默认字段顺序, 更新之后发现下载顺序不对, 后端说后端改下载默认字段顺序麻烦, 让前端下载前先保存字段顺序
                 * 这里没管之前保没保存过字段顺序, 直接保存然后下载
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
                    const lastIdTag = new Date().getTime();
                    if (this.totalNum > 60000) {
                        const lists = Math.ceil(this.totalNum / 60000);
                        for (let i = 0; i < lists; i++) {
                            setTimeout(() => {
                                const url = `${this.$util.ajaxUrl}/crm/bigcompany/getFilterListExcelV2?pageSize=60000&pageNo=${i + 1}&userId=${this.userId}&orgId=${this.enterpriseId}&listType=${this.listType}&query=${this.queryData.$and.length ? encodeURIComponent(JSON.stringify(this.queryData)) : ''}&subUserIds=${this.subUserIds}&eventDate=${this.eventDate.join(',')}&subUserOptType=${this.subUserOptType.length ? encodeURIComponent(JSON.stringify(this.subUserOptType)) : ''}&departmentIds=${this.departmentIds}&departmentOptType=${this.departmentOptType.length ? encodeURIComponent(JSON.stringify(this.departmentOptType)) : ''}&lastIdTag=${lastIdTag}`;
                                this.$stm.openNewWindow(url);
                            }, i * 1500);
                        }
                    } else {
                        const url = `${this.$util.ajaxUrl}/crm/bigcompany/getFilterListExcelV2?pageSize=60000&pageNo=1&orgId=${this.enterpriseId}&userId=${this.userId}&listType=${this.listType}&query=${this.queryData.$and.length ? encodeURIComponent(JSON.stringify(this.queryData)) : ''}&subUserIds=${this.subUserIds}&eventDate=${this.eventDate.join(',')}&subUserOptType=${this.subUserOptType.length ? encodeURIComponent(JSON.stringify(this.subUserOptType)) : ''}&departmentIds=${this.departmentIds}&departmentOptType=${this.departmentOptType.length ? encodeURIComponent(JSON.stringify(this.departmentOptType)) : ''}&lastIdTag=${lastIdTag}`;
                        this.$stm.openNewWindow(url);
                    }
                } else {
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
                this.loading = true;
                const postData = {
                    lang: this.lang,
                    orgId: this.enterpriseId,
                    listType: this.listType,
                    query: this.queryData.$and.length ? JSON.stringify(this.queryData) : undefined,
                    subUserIds: this.subUserIds,
                    subUserOptType: this.subUserOptType.length ? JSON.stringify(this.subUserOptType) : undefined,
                    departmentIds: this.departmentIds,
                    departmentOptType: this.departmentOptType.length ? JSON.stringify(this.departmentOptType) : undefined,
                    eventDate: this.eventDate.join(','),
                    pageSize: this.pageSize,
                    pageNo: this.curPage,
                    orderColumn: this.order_column,
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
                crmCompany.getCompanyFilterListDataAndTotal(postData, cancelToken).then(async response => {
                    if (response.code === '1') {
                        if ((response.data.list === null || !response.data.list.length) && this.curPage > 1) {
                            this.curPage--;
                            this.refreshData();
                            return;
                        }
                        this.totalNum = response.data.total || 0;
                        this.maxPageNum = Math.ceil(this.totalNum / this.pageSize);
                        // 处理数据
                        this.tableData = await this.handleData(response.data.list);
                        if (this.tableData.length) {
                            // 产品需求 仪表盘跳过来的默认选中第一个显示小窗
                            if (this.showFirst) {
                                this.companyId = this.tableData[0].companyId;
                                // 否则打开侧滑页
                                this.show_company_detail = true;
                                this.showFirst = false;
                            }
                        } else {
                            if (this.showFirst) {
                                this.showFirst = false;
                            }
                        }
                        // 表格滚动到顶部
                        if (this.$refs.customerView && this.$refs.customerView.$refs.table) {
                            this.$refs.customerView.$refs.table.$el.querySelector('.vxe-table--body-wrapper').scrollTop = 0;
                        }
                    } else {
                        this.totalNum = 0;
                        this.maxPageNum = 0;
                        this.tableData = [];
                        if (this.showFirst) {
                            this.showFirst = false;
                        }
                        this.$Message.error(this.$t('crm.Table.error_getCompanyTableData'));
                    }
                    this.loading = false;
                    if (localStorage.getItem('leadsCloud-filter-title')) {
                        localStorage.removeItem('leadsCloud-filter-title');
                    }
                });
            },
            // 检索并刷新表格
            refreshData_filter() {
                this.currentIndex = null;
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
                    result = data.map(rowData => {
                        // 存放返回结果
                        // 先处理与权限无关的字段
                        const temp = {
                            id: rowData.cpId,
                            cpAutoSeq: rowData.cpAutoSeq,
                            cpCreateTime: new Date(rowData.cpCreateTime).format('yyyy-MM-dd hh:mm'),
                            cpUpdateTime: new Date(rowData.cpUpdateTime).format('yyyy-MM-dd hh:mm'),
                            cpFollowUpCount: rowData.cpFollowUpCount !== null ? `${rowData.cpFollowUpCount}` : '',
                            cpTouchCount: rowData.cpTouchCount !== null ? `${rowData.cpTouchCount}` : '',
                            cpNotFollowedDays: rowData.cpNotFollowedDays,
                            cpDynamic: this.$options.filters.parseObject(rowData.cpDynamic),
                            cpLastFollowUpTime: rowData.cpLastFollowUpTime ? new Date(rowData.cpLastFollowUpTime).format('yyyy-MM-dd hh:mm') : '',
                            cpCompanyManagerIds: rowData.cpCompanyManagerIds,
                            cpCompanyManagers: rowData.cpCompanyManagers,
                            cpCompanyManagerDepartments: rowData.cpCompanyManagerDepartments,
                            cpCreateUser: rowData.cpCreateUser,
                            cpCreateUserId: rowData.cpCreateUserId,
                            cpMarker: rowData.cpMarker,
                            companyId: rowData.cpId,
                            contactId: rowData.ctId,
                            inquiryId: rowData.iqId,
                            iqSeqNumber: rowData.iqSeqNumber,
                            cpCountryArea: rowData.cpCountryArea,
                            companyManagerIds: rowData.cpCompanyManagerIds,
                            cpCompanySourceWay: rowData.cpCompanySourceWay,
                            cpLastGetCompanyTime: rowData.cpLastGetCompanyTime ? new Date(rowData.cpLastGetCompanyTime).format('yyyy-MM-dd hh:mm:ss') : '',
                            cpLastTransactionTime: rowData.cpLastTransactionTime ? new Date(rowData.cpLastTransactionTime).format('yyyy-MM-dd hh:mm:ss') : '',
                            cpPredictGiveupTime: rowData.cpPredictGiveupTime ? new Date(rowData.cpPredictGiveupTime).format('yyyy-MM-dd') : '',
                            cpTransactionInquiryCount: rowData.cpTransactionInquiryCount !== null ? `${rowData.cpTransactionInquiryCount}` : '',
                            cpTransactionMoneyRmb: rowData.cpTransactionMoneyRmb ? `￥ ${Utils.transformMoney(rowData.cpTransactionMoneyRmb)}` : ''
                        };
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
                            let ctSocialNetworkingPlatform = [{
                                attrName: '',
                                attrValue: ''
                            }];
                            try {
                                ctSocialNetworkingPlatform = JSON.parse(temp.ctSocialNetworkingPlatform).length ? JSON.parse(temp.ctSocialNetworkingPlatform) : [{
                                    attrName: '',
                                    attrValue: ''
                                }];
                            } catch (e) {
                            }
                            temp.ctSocialNetworkingPlatform = ctSocialNetworkingPlatform;
                        }
                        // 电话
                        if (temp.ctPhone) {
                            temp.ctPhone = temp.ctPhone ? temp.ctPhone : '-';
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
                const orderObj = Object.assign({}, ...selCol.map((item, index) => {
                    const temp = {};
                    temp[item] = index;
                    return temp;
                }));
                this.currentColumns = this.allColumns.filter(col => selCol.includes(col.key)).sort((a, b) => {
                    return orderObj[a.key] - orderObj[b.key];
                });
                this.$nextTick(() => {
                    this.flag_refreshColumn = true;
                    this.selected_items = [];
                });
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
            updateList(checkAll, column, colIndex) {
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
                                    case 'cpCompanyManagerDepartments':
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
            // 点击表格行
            clickRow({ row, column, $event}) {
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
                if (selector.type !== 'Range' &&
                    document.activeElement.tagName !== 'INPUT' &&
                    !$event.target.classList.contains('abbr-account')) {
                    this.companyId = row.companyId;
                    // this.show_company_detail = true;
                    this.rowIndex = this.tableData.findIndex(item => item.companyId === row.companyId);

                    // 打开详情页
                    const path = $event.path || ($event.composedPath && $event.composedPath());
                    if (path.find(item => item.classList && item.classList.contains('cp_companyName') && item.tagName === 'TD')) {
                        // 如果是点击的"公司名称"

                        // 新窗口打开客户详情页
                        window.open(this.$router.resolve({
                            name: 'companyDetail',
                            query: {
                                companyId: row.companyId
                            }
                        }).href, '_blank');
                        return;
                    }
                    // 邮箱弹窗
                    if (path.find(item => item.classList && item.classList.contains('ct_email') && item.tagName === 'TD')) {
                        if (row.ctEmail) {
                            const emails = [{
                                receiverName: row.ctNickName || '',
                                receiveMailAddress: row.ctEmail,
                                followUpId: `${row.companyId}`,
                                followUpType: 3
                            }];
                            localStorage.setItem('leadsCloud-sendMail-contacts', JSON.stringify(emails));
                            // 打开写信弹窗之前先判断有没有已经打开的写信弹窗
                            const doc = document.getElementById('mail_detail_modal');
                            if (!doc) {
                                this.$store.commit('setQuickSendMailVisible', true);
                            }
                        }
                        return;
                    }
                    // 否则打开侧滑页
                    this.show_company_detail = true;
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
                    key: 'myCustomer',
                    value: pageSize.toString()
                };
                crmCommon.userconfigUpdate(data);
                this.currentIndex = null;
                this.refreshData();
            },
            // 改变页码
            changePage(page) {
                if (page <= this.maxPageNum) {
                    this.curPage = page;
                    this.refreshData();
                    this.currentIndex = null;
                }
            },

            /* 处理详情页传递过来的刷新信息 */
            refreshCheck(obj) {
                if (obj && obj.companyId) {
                    /**
                     * @Description: 此处使用 Element-ui 定制版的方法 toggleRowSelectionById ,
                     * 保证从 selected_items 中去掉 obj.companyId 对应选项时表格选中项也去掉,
                     * 相较 toggleRowSelection , row 变为 { attrName, id } , 指定 "id" 对应的属性名和属性值,
                     * 解决了分页时无法取到对应的 row 的问题, 分页时需配合 reserve-selection
                     * @author 汤一飞
                     * @date 2020/11/26
                     */
                    this.$refs.customerView.$refs.table.toggleRowSelectionById({
                        attrName: 'companyId',
                        id: obj.companyId
                    }, false);

                    this.selected_items = this.selected_items.filter(item => item.companyId !== obj.companyId);
                    const tableRow = this.tableData.find(item => `${item.companyId}` === `${obj.companyId}`);
                    if (tableRow) {
                        // 改为不刷新表格, 只获取该条表格数据的最新信息, 更新到表格
                        this.updateTableRow(tableRow);
                    }
                }
            },
            // 更新指定表格行信息
            updateTableRow(row) {
                // 筛选条件: 指定 row id
                const filterRowCondition = {
                    $and: [
                        {
                            cpId: {
                                $eq: row.companyId
                            }
                        }
                    ]
                };

                // 组装请求数据
                const postData = {
                    lang: this.lang,
                    orgId: this.enterpriseId,
                    listType: this.listType,
                    query: JSON.stringify(filterRowCondition),
                    pageSize: 20,
                    pageNo: 1,
                    userId: this.userId
                };
                // 请求指定 row 最新数据
                crmCompany.getCompanyFilterListDataAndTotal(postData).then(async response => {
                    if (response.code === '1') {
                        // 获取待更新的表格行在当前表格页的位置
                        const index = this.tableData.findIndex(item => `${item.companyId}` === `${row.companyId}`);
                        // 如果待更新的表格行已不在当前表格页, 停止更新, 不再往下继续执行
                        if (index === -1) {
                            return;
                        }

                        // 存储返回的表格行最新数据
                        let newRowData = (Array.isArray(response.data.list) && response.data.list.length) ? response.data.list[0] : null;
                        if (newRowData) {
                            // 有数据
                            // 处理数据
                            [newRowData] = await this.handleData([newRowData]);
                            // 更新数据到表格行
                            this.$set(this.tableData, index, newRowData);
                            // 如果之前表格高亮行就是当前行, 更新后要恢复高亮状态
                            if (this.rowIndex === index) {
                                this.$refs.customerView.$refs.table.setCurrentRow(this.tableData[index]);
                            }
                        } else {
                            // 无数据
                            // 关闭所有侧滑页
                            this.show_company_detail = false;
                            this.companyId = 0;
                            // 刷新当前页表格数据
                            this.refreshData();
                        }
                    }
                });
            },
            // 取消跟进
            unFollow() {
                // const companyIds = [];
                // this.selected_items.forEach(item => {
                //     // 提取客户id并存到数组
                //     companyIds.push(item.companyId);
                // });
                // 禁用按钮
                this.unFollowBtn = true;
                // 请求当前的操作人姓名
                // await this.$commonApi.checkUserInfoExists({
                //     orgId: this.enterpriseId,
                //     userId: this.userId
                // }).then(response => {
                //     if (response.code === '1') {
                //         // 保存当前操作人的姓名
                //         this.userNameCh = response.data.userNameCh;
                //     }
                // });
                // 1 向后端发送请求;2 提示信息;3 重新请求数据;
                crmCompany.batchCancelFollowup({
                    companyIds: this.cancelFollowData.toString(), // 将数组转为字符串,（安卓端无法传数组,所以传的字符串）
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    userName: this.fullName
                }).then(response => {
                    if (response.code === '1') {
                        // 提示信息
                        this.$Message.success(`${this.$t('crm.Modal.successfullyUnfollow')} ${this.cancelFollowData.length} ${this.$t('crm.Modal.customer')}`);
                        // 刷新表格数据 并将选择框清空 传入参数: clearSelected: true
                        this.refreshData({ clearSelected: true });
                    } else {
                        this.$Message.error(response.message);
                    };
                    // 取消modal的显示
                    this.visible_cancel_follow = false;
                    // 禁用按钮恢复
                    this.unFollowBtn = false;
                }).catch(error => {
                    console.error(error);
                    this.unFollowBtn = false;
                });
            },
            /* 批量退入公海 */
            batch_throw_company() {
                if (this.selected_items.length > 100) {
                    this.$Message.warning(this.$t('crm.Table.batchThrowCustomersLimit'));
                    return false;
                }
                this.closePoptip();
                this.visible_batch_throw_company = true;
            },
            /* 关闭弹窗 */
            closeBatchThrowModal() {
                this.visible_batch_throw_company = false;
            },
            handleCancelFollow() {
                this.cancelFollowData = [];
                const companyIds = [];
                this.selected_items.forEach(item => {
                    if (item.cpCompanyManagerIds.indexOf(this.userId) !== -1) {
                        companyIds.push(item.companyId);
                    }
                });
                if (companyIds.length === 0) {
                    this.$Message.warning(this.$t('crm.Detail.unfollowTip'));
                    return false;
                }
                this.closePoptip();
                this.cancelFollowData = JSON.parse(JSON.stringify(companyIds));
                this.visible_cancel_follow = true;
            },
            // 切换展示方式
            changeCustomerViewValue(val) {
                // 用户手动切换展示方式, 仪表盘指定方式失效
                this.dashBoardViewFlag = false;

                this.loading = true;
                this.$nextTick(() => {
                    this.refreshData();
                    this.customerViewValue = val;
                    if (val) {
                        this.customerView = 'customerTable';
                        this.bus.$emit('shrinkMenu', false);
                    } else {
                        this.customerView = 'customerColumns';
                        this.bus.$emit('shrinkMenu', true);
                    }
                    this.saveCommonPageDisplay();
                });
            },
            columnsFilter(obj) {
                this.order_column = obj.key;
                this.storageName_orderColumn = obj.key;
                this.order_type = obj.val;
                /* 刷新列表 */
                this.refreshData_filter();
            },
            handleBatchEdit() {
                this.showBatchEdit = true;
            },
            shareCompany() {
                this.closePoptip();
                this.visible_batch_share_company = true;
            },
            closePoptip() {
                this.$refs.moreOperateGroup.doClose();
            }
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
                        // 设置大部分下拉选项
                        this.setSelectOptions();
                    }
                }
            },
            allUsers: {
                handler(val) {
                    if (val) {
                        // 设置全部人员列表以供筛选
                        this.setAllUsers();
                    }
                }
            },
            show_company_detail: {
                handler(val) {
                    if (!val) {
                        if (this.$refs.customerView && this.$refs.customerView.$refs.table) {
                            this.$refs.customerView.$refs.table.setCurrentRow();
                        }
                    }
                }
            },
            order_column: {
                handler(val) {
                    localStorage.setItem('myCustomer_order_column', val);
                    localStorage.setItem('myCustomer_storageName_orderColumn', this.storageName_orderColumn);
                },
                immediate: true
            },
            order_type: {
                handler(val) {
                    localStorage.setItem('myCustomer_order_type', val);
                },
                immediate: true
            },
            // storageName_orderColumn: {
            //     handler(val) {
            //         localStorage.setItem('myCustomer_storageName_orderColumn', val);
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
    .change-customer-view{
        float: left;
        margin-top: 4px;
        line-height: 28px;
        width: 28px;
        border: 1px solid #ABBFD5;
        text-align: center;
        cursor: pointer;
        color: #677F99;
    }
    .change-customer-view-left{
         border-radius: 4px 0 0 4px;
    }
    .change-customer-view-right{
         border-radius: 0 4px 4px 0;
         border-left:none;
    }
    .change-customer-view:hover ,.change-customer-view-active{
        color: #4285F2;
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
            color: #FFF;
            background: #FA8241;
            border: 1px solid #FA8241;
            border-left: 1px solid #E56926;
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

    /deep/ .custom-throw {
        font-size: 13px;
        color: #677F99;
        &:hover {
            color: #4285f4;
        }
    }
    /deep/.el-table__fixed{
        height: calc(100% - 8px) !important;
        // box-shadow: none;
    }
    /deep/.el-table__fixed::before{
        content: ' ';
        height: 0px;
    }
</style>
