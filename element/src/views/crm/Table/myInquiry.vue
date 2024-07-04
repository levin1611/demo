<template>
    <div class="crm-table-page">
        <div style="min-width: 700px;">
             <div class="my-inquiry-top" :style="`${!selected_items.length && 'border-color: transparent;'}`">
            <!-- 操作栏 -->
                <div class="table-top-container">
                    <!-- 多选操作视图 -->
                    <template v-if="visible_batch_operate">
                        <div style="display: inline-block;color: rgba(0, 0, 0, .8);margin-bottom: -15px;"
                            class="table-multiple-operate-btns _btns_text_ml">
                            {{ $t('crm.Table.selected') }}
                            <!-- 选中询盘条数 -->
                            <span style="font-weight: bolder;color:#FA8241;">{{ selected_items.length }}</span>
                            {{ selected_items.length > 1 ? $t('crm.Table.item_inquiries') : $t('crm.Table.item_inquiry') }}
                             <!-- 群发单显  v-if="authorized_button['mergeData']"-->
                            <!-- <Button type="minor"
                                    style="font-size: 14px;"
                                    @click="bulkSending">{{ $t('crm.Table.bulkSending') }}</Button> -->
                            <!-- 发送WhatsApp -->
                            <Button v-if="authorized_button['sendWhatsApp']"
                                    type="minor"
                                    style="font-size: 14px; margin-left: 20px;"
                                    @click="sendWhatsApp">{{ $t('crm.Table.sendWhatsApp') }}</Button>
                            <!-- 批量编辑  v-if="authorized_button['batchThrowCompany']"-->
                            <!-- <Button type="minor"
                                    style="font-size: 14px;"
                                    @click="handleBatchEdit">{{$t('crm.Table.batchEdit')}}</Button> -->
                            <!-- 合并询盘 -->
                            <Button v-if="authorized_button['mergeData']"
                                    type="minor"
                                    style="font-size: 14px;"
                                    @click="merge_inquiry">{{ $t('crm.Table.merge') }}</Button>

                            <!-- 受众优化 -->
                            <Button v-if="authorized_button['audienceOptimization']"
                                    type="minor"
                                    style="font-size: 14px;"
                                    @click="audience_optimization">{{ $t('crm.Table.audienceOptimization') }}</Button>
                        </div>

                        <!-- 清空已选 -->
                        <span style="position: absolute;right: 0;">
                            <Icon type="md-close"
                                size="18"
                                color="#CBD6E2"
                                @click="clear_selected_items"
                                class="cursor-pointer"></Icon>
                        </span>
                    </template>

                    <!-- 正常视图 -->
                    <template v-else>
                        <!-- 改版顶部筛选 -->
                        <TopFilter :title.sync="title_topFilter"
                                type="myInquiry"
                                :columnType="columnType"
                                :filtering.sync="filtering"
                                sql_manager="inquiryManagers"
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
                                    :langObj="lang_inquiry"
                                    :width="600"
                                    :tagMaxWidth="300"
                                    ref="filterTags"
                                    @change_filter_tag="change_filter_tag"
                                    @emptySort="empty_sort"
                                    @removeCon="remove_filter_tag"></FilterTags>
                        <div style="display:inline-block;margin-left:4px" v-if="googleMarketingMd5">
                            <Tag class="googleMarketing-filter" @close="closeGoogleMarketingSearch" closable>Google 广告访客关联的询盘</Tag>
                        </div>

                        <!-- 新版按钮 -->
                        <div class="table-operate-btns _btns_text_ml">
                            <!-- 文件导出 -->
                            <Tooltip :content="$t('crm.Table.exportData')" effect="dark" placement="bottom">
                                <Button v-if="authorized_button['exportData']"
                                    type="text"
                                    icon="custom custom-file-download"
                                    @click="exportData"
                                    class="piwik_download_table_inquiry inquiry-filedownload custom-file-download-border"></Button>
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
            <div class="_min_height_100" :style="{minHeight:table_height-100+'px'}">
                <!-- loading -->
                <Spin v-if="loading"
                      fix></Spin>

                <!-- 表格 -->
                    <customerTable ref="customerView"
                        :flag_refreshColumn="flag_refreshColumn"
                        :table_height="table_height"
                        :tableData="tableData"
                        :currentColumns="currentColumns"
                        :config_tableFilter.sync="config_tableFilter"
                        :pageSize="pageSize"
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
                        currentTable="inquiry"
                        @refreshData="refreshData"
                        @changeInquiryMarker="changeInquiryMarker"
                        @updateList="updateList"
                        @update_query="update_query"
                        @update_showPopper="update_showPopper"
                    ></customerTable>
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
                    type="inquiry"
                    @refreshData="refreshData"></NewCompany>

        <!-- 导入数据 -->
        <ImportData v-show="show_import_data"
                    :visible.sync="show_import_data"
                    type="inquiry"
                    @refreshData="refreshData"></ImportData>

        <!-- 受众优化 -->
        <AudienceOptimization v-if="audience_optimization_show"
                              :visible.sync="audience_optimization_show"
                              :ids="selected_items.map(item => item.inquiryId)"
                              :listType="3"
                              :queryData="queryData"
                              :subUserIds="subUserIds"
                              :isFromGoogle="isFromGoogle"
                              :optimizeStatus="optimizeStatus"
                              :order_column="order_column"
                              :order_type="order_type"
                              @refreshData="refreshData"
                              @updateAccontNotBind="updateAccontNotBind"></AudienceOptimization>

        <!-- 合并询盘 -->
        <MergeData v-show="show_merge_data"
                   :visible.sync="show_merge_data"
                   type="inquiry"
                   :ids="selected_items.map(item => item.inquiryId)"
                   @refreshData="refreshData({clearSelected: true})"></MergeData>

        <!-- 详情页 -->
        <CRMDrawerList :visible.sync="show_inquiry_detail"
                        ref="inquiryDetail"
                       :id.sync="inquiryId"
                       type="inquiry"
                       originalType="inquiry"
                       :colSpan="12"
                       :corp_columns_authorized="corp_columns_authorized"
                       :contact_columns_authorized="contact_columns_authorized"
                       :inquiry_columns_authorized="computed_inquiry_columns_authorized"
                       @refreshData="refreshData"
                       @refreshCheck="refreshCheck"></CRMDrawerList>

        <!-- 绑定主页失效提示弹窗 -->
        <Modal
                :visible.sync="accontNotBind"
                :modal-append-to-body="false"
                width="560px"
                :show-close="false"
                :close-on-click-modal="false">
            <p slot="title">
                {{$t('inbox.accountNotBindTitle')}}
            </p>
            <div style="text-align:center;margin-bottom: 10px;">
                {{$t('inbox.accountNotBindTip')}}
            </div>
            <div slot="footer">
                <Button @click="accontNotBind = false">{{$t('cancel')}}</Button>
                <Button type="primary" @click="goToBind">{{$t('facebook.inbox.gotoBind')}}</Button>
            </div>
        </Modal>

        <!-- 群发单显&发送WhatsApp -->
        <contactSelectionBox type="customer"
            originalType="inquiry"
            :sendType="sendType"
            :visible.sync="visible_contact_selectionBox"
            :ids="selected_items.map(item => item.inquiryId)"
            :fieldColumns="fieldColumns"
            @refreshData="clear_selected_items"></contactSelectionBox>

        <!-- 批量编辑 -->
        <batchEdit type="inquiry"
                :visible.sync="showBatchEdit"
                :ids="selected_items.map(item => item.inquiryId)"
                @refreshData="refreshData"></batchEdit>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import Utils from '@/utils/index';
    import { HANDLE_BUTTON, BUTTON_IDS, TOP_FILTER_ITEM } from '@/api/config';
    import TopFilter from '@/views/crm/Table/Components/Html/topFilter';
    import FilterTags from '@/views/main-components/filter-tags';
    const EditColumns = () => import('@/views/crm/Table/Components/Modal/editColumns');
    const MergeData = () => import('@/views/crm/Table/Components/Modal/mergeData');
    const ImportData = () => import('@/views/crm/Table/Components/Modal/importData');
    const NewCompany = () => import('@/views/crm/Detail/Components/Modal/fixed-modal-form/create-company');
    const AudienceOptimization = () => import('@/views/crm/Table/Components/Modal/audienceOptimization');
    const CRMDrawerList = () => import('@/views/crm/Detail/CRMDrawerList');
    import customerTable from '@/views/crm/Table/Components/customerTable';
    import batchEdit from '@/views/crm/Table/Components/Modal/batchEdit';
    import contactSelectionBox from '@/views/crm/Table/Components/Modal/contactSelectionBox';
    import tableBatchHandle from '@/mixins/tableBatchHandle';
    import { crmCommon, crmInquiry } from '@/api/crm/index';

    // 检索条件变化
    const addChangeCon1 = function(index) {
        this.addCondition[index].condition2 = '';
        this.addCondition[index].condition3 = '';
        switch (this.addCondition[index].condition1) {
            // 字符串型
            case 'seqNumber':
            case 'companyName':
            case 'shortName':
            case 'demandProducts':
            case 'remark':
            case 'nickName':
            case 'email':
            case 'phone':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.text
                ];
                this.addCondition[index].condition2 = '$regex';
                this.addCondition[index].inputType = 'string';
                break;
            case 'dynamic':
            case 'socialNetworkingPlatform':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.textsocialNetwork
                ];
                this.addCondition[index].condition2 = '$regex';
                this.addCondition[index].inputType = TOP_FILTER_ITEM.text[0].childrenType;
                break;
            case 'inquiryMarker':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.boolean
                ];
                this.addCondition[index].condition2 = '$eq';
                this.addCondition[index].inputType = 'booleanSelect';
                this.addCondition[index].condition3 = 1;
                break;
            // 多选型
            case 'productCategory':
            case 'label':
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
                } else {
                    this.addCondition[index].conditionList2 = [
                        ...TOP_FILTER_ITEM.text
                    ];
                    this.addCondition[index].condition2 = '$regex';
                    this.addCondition[index].inputType = TOP_FILTER_ITEM.text[0].childrenType;
                }
                break;
            // 单选型
            case 'sourceChannel':
            case 'sourceWay':
            case 'grouping':
            case 'followUp':
            case 'clientType':
                if (Array.isArray(this.selectOptions[this.addCondition[index].condition1]) && this.selectOptions[this.addCondition[index].condition1].length) {
                    this.addCondition[index].conditionList2 = [
                        ...TOP_FILTER_ITEM.select
                    ];
                    this.addCondition[index].condition2 = '$eq';
                    this.addCondition[index].inputType = TOP_FILTER_ITEM.select[0].childrenType;
                    this.addCondition[index].condition3 = '';
                    if (this.addCondition[index].condition1 === 'followUp') {
                        const followList = this.selectOptions[this.addCondition[index].condition1].map(item => {
                            const { attrName, attrId } = item;
                            return { value: attrId, label: attrName };
                        });
                        followList.splice(1, 0, {
                            value: -1,
                            label: this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry')
                        });
                        this.addCondition[index].conditionList3 = followList;
                    } else {
                        this.addCondition[index].conditionList3 = this.selectOptions[this.addCondition[index].condition1].map(item => {
                            const { attrName, attrId } = item;
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
            case 'createUser':
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
            case 'followUpCount':
            case 'notFollowedDays':
            case 'estimatedInquiryAmount':
            case 'transactionMoney':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.number
                ];
                this.addCondition[index].condition2 = '$range';
                this.addCondition[index].inputType = TOP_FILTER_ITEM.number[0].childrenType;
                this.addCondition[index].condition3 = [0, 0];
                break;
            // 时间类
            case 'createTime':
            case 'updateTime':
            case 'lastFollowupTime':
            case 'transactionTime':
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
            // 负责人, 数组
            case 'inquiryManagers':
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
            case 'status':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.MultSelect
                ];
                this.addCondition[index].condition2 = '$regex';
                this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelect[0].childrenType;
                this.addCondition[index].condition3 = [];
                this.addCondition[index].conditionList3 = [
                    {
                        value: 0,
                        label: this.$t('crm.Table.GoogleMachineLearning')
                    },
                    {
                        value: 2,
                        label: this.$t('crm.Table.FacebookAudienceOptimization')
                    },
                    {
                        value: 4,
                        label: this.$t('crm.Table.GoogleToAudit')
                    }
                ];
                break;
            // 国家地区
            case 'countryArea':
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
            case 'seqNumber':
            case 'companyName':
            case 'shortName':
            case 'demandProducts':
            case 'remark':
            case 'nickName':
            case 'email':
            case 'phone':
            case 'socialNetworkingPlatform':
            case 'dynamic':
                this.addCondition[index].condition3 = '';
                this.addCondition[index].inputType = TOP_FILTER_ITEM.text.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                break;
            case 'inquiryMarker':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.boolean.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = 1;
                if (this.addCondition[index].inputType === 'booleanMultSelect') {
                    this.addCondition[index].condition3 = [];
                }
                break;
            // 多选型
            case 'productCategory':
            case 'label':
                this.addCondition[index].condition3 = [];
                this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelect.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                break;
            // 单选型
            case 'sourceChannel':
            case 'sourceWay':
            case 'grouping':
            case 'followUp':
            case 'clientType':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.select.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                if (this.addCondition[index].inputType === 'array') {
                    this.addCondition[index].condition3 = [];
                } else {
                    this.addCondition[index].condition3 = '';
                }
                break;
            case 'createUser':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.select.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                if (this.addCondition[index].inputType === 'array') {
                    this.addCondition[index].condition3 = [];
                } else {
                    this.addCondition[index].condition3 = '';
                }
                break;
            // 数字
            case 'followUpCount':
            case 'notFollowedDays':
            case 'estimatedInquiryAmount':
            case 'transactionMoney':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.number.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = 0;
                if (this.addCondition[index].inputType === 'numberRange') {
                    this.addCondition[index].condition3 = [0, 0];
                }
                break;
            // 时间类
            case 'createTime':
            case 'updateTime':
            case 'lastFollowupTime':
            case 'transactionTime':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.dateRange.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = '';
                if (this.addCondition[index].inputType === 'dateRange') {
                    this.addCondition[index].condition3 = [];
                }
                break;
            // 负责人, 数组
            case 'inquiryManagers':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelectUser.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = [];
                break;
            case 'status':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.MultSelect.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = [];
                break;
            // 国家地区
            case 'countryArea':
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
        }
        if (this.addCondition[index].inputType === 'null' || this.addCondition[index].inputType === 'nnull') {
            this.addCondition[index].condition3 = -1;
        }
    };

    export default {
        name: 'myInquiry',
        mixins: [tableBatchHandle],
        components: {
            customerTable,
            TopFilter,
            EditColumns,
            MergeData,
            ImportData,
            NewCompany,
            AudienceOptimization,
            CRMDrawerList,
            FilterTags,
            batchEdit,
            contactSelectionBox
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height',
                lang: state => state.app.lang,
                button_list: state => state.app.button_list,
                allUsers: state => state.crm.allUsers,
                salesList: state => state.crm.salesList,
                allSelectOptions: state => state.crm.selectOptions
            }), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu'
            ]),
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
                const ids = BUTTON_IDS.CRM.inquiry;
                return {
                    newCompany: !HANDLE_BUTTON(ids.newCompany, this.button_list),
                    importData: !HANDLE_BUTTON(ids.dataImport.importData, this.button_list),
                    exportData: !HANDLE_BUTTON(ids.dataExport.documentDownload, this.button_list),
                    mergeData: !HANDLE_BUTTON(ids.edit.merge, this.button_list),
                    audienceOptimization: !HANDLE_BUTTON(ids.edit.audienceOptimization, this.button_list),
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
                        case 'booleanSelect':
                        case 'boolean':
                        case 'select':
                        case 'null':
                        case 'nnull':
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
                                case 'inquiryManagers':
                                case 'status':
                                    temp[con] = {};
                                    if (con === 'inquiryManagers') {
                                        temp[con][type] = item.condition3;
                                    } else {
                                        temp[con].$regex = item.condition3;
                                    }
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
                    } else if (['transactionMoney', 'followUpCount', 'not_followed_days', 'estimated_inquiry_amount'].includes(key)) {
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
            },

            computed_inquiry_columns_authorized() {
                const temp = this.$deepClone(this.inquiry_columns_authorized);
                if (Array.isArray(temp.default)) {
                    temp.default = temp.default.filter(item => !item.companyFlag && !item.contactFlag);
                }
                return temp;
            } // 过滤公司授权字段
        },
        data() {
            return {
                // 增加受众优化账号未绑定弹窗
                accontNotBind: false,
                /* 全局 */
                cancelFunc: null,
                /* 多语言 */
                lang_inquiry: {
                    productCategory: this.$t('crm.Modal.inq_productCategory'),
                    demandProducts: this.$t('crm.Modal.inq_demandProducts'),
                    inquiryScore: this.$t('crm.Modal.inq_inquiryScore'),
                    label: this.$t('crm.Modal.inq_label'),
                    sourceChannel: this.$t('crm.Modal.inq_sourceChannel'),
                    sourceWay: this.$t('crm.Modal.inq_sourceWay'),
                    grouping: this.$t('crm.Modal.inq_grouping'),
                    followUp: this.$t('crm.Modal.inq_followUp'),
                    remark: this.$t('crm.Modal.inq_remark'),
                    estimatedInquiryAmount: this.$t('crm.Detail.inq_estimatedInquiryAmount'),
                    transactionTime: this.$t('crm.Modal.transactionTime'),
                    transactionMoney: this.$t('crm.Modal.transactionMoney'),
                    clientType: this.$t('crm.Modal.corp_clientType'),
                    inquiryMarker: this.$t('crm.Table.inquiryMarker'),

                    // 自定义字段 - 无

                    // 其他字段
                    // 公司
                    companyName: this.$t('crm.Table.col_companyName'),
                    shortName: this.$t('crm.Table.col_corpShortName'),
                    countryArea: this.$t('crm.Modal.corp_countryArea'),

                    // 联系人
                    nickName: this.$t('crm.Modal.contact_nickName'),
                    email: this.$t('crm.Modal.contact_email'),
                    phone: this.$t('crm.Modal.contact_phone'),
                    socialNetworkingPlatform: this.$t('crm.Modal.contact_socialNetworkingPlatform'),
                    jobTitle: this.$t('crm.Modal.contact_jobTitle'),
                    jobGrade: this.$t('crm.Modal.contact_jobGrade'),
                    birthday: this.$t('crm.Modal.contact_birthday'),
                    gender: this.$t('crm.Modal.contact_gender'),
                    picture: this.$t('crm.Modal.contact_picture'),
                    whatsApp: this.$t('crm.Modal.contact_whatsApp'),
                    instagram: this.$t('crm.Modal.contact_instagram'),

                    // 其他字段
                    seqNumber: this.$t('crm.Table.col_seqNumber'),
                    inquiryManagers: this.$t('crm.Table.col_inquiryManagers'),
                    createUser: this.$t('crm.WorkBench.col_followUpCreateUser'),
                    status: this.$t('crm.Table.col_status'),
                    followUpCount: this.$t('crm.Table.col_followUpCount'),
                    notFollowedDays: this.$t('crm.Table.col_notFollowedDays'),
                    dynamic: this.$t('crm.Table.col_lastFollowup'),
                    lastFollowupTime: this.$t('crm.Table.col_lastFollowupTime'),
                    createTime: this.$t('crm.Table.col_createTime'),
                    updateTime: this.$t('crm.Table.col_updateTime')
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
                currentColumns: [], // 表格列名称
                allColumns: [], // 表格全部列
                // 处理时间筛选格式，拼接到接口返回的数据中 === 需要添加日期处理方法的字段
                dateOptionsFileds: ['transactionTime', 'lastFollowupTime', 'createTime', 'updateTime'],
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
                    notFollowedDays: row => {
                        let temp = null;
                        if (row.notFollowedDays) {
                            temp = Math.floor((Date.now() - row.notFollowedDays) / (24 * 60 * 60 * 1000));
                            if (temp < 0) {
                                temp = 0;
                            }
                        }
                        return temp;
                    },
                    productCategory: row => {
                        return this.$options.filters.parseArray(row.productCategory).length ? this.$options.filters.parseArray(row.productCategory).join(', ') : '-';
                    },
                    followUp: row => {
                        let str = '';
                        if (/\d+/.test(`${row.followUpId}`)) {
                            if (`${row.followUpId}` === '-1') {
                                str = this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry');
                            }
                            const temp = this.selectOptions.followUp ? this.selectOptions.followUp.find(item => `${item.attrId}` === `${row.followUpId}`) : '-';
                            str = temp ? temp.attrName : str;
                        } else {
                            str = row.followUp || '-';
                        }
                        return str;
                    },
                    socialNetworkingPlatform: row => {
                        return Array.isArray(row.socialNetworkingPlatform) && row.socialNetworkingPlatform.filter(item => item.attrValue).length ? row.socialNetworkingPlatform.map(item => {
                            return `${item.attrName}: ${item.attrValue}`;
                        }).join(', ') : '-';
                    },
                    inquiryMarker: row => {
                        let inquiryMarker = this.$t('crm.Table.con_not');
                        switch (`${row.inquiryMarker}`) {
                            case '1':
                                inquiryMarker = this.$t('crm.Table.con_is');
                                break;
                        }
                        return inquiryMarker;
                    }
                },
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
                title_topFilter: this.$t('crm.Table.allInquiry'),
                flag_topFilter: false,
                type_topFilter: '',
                addChangeCon1: addChangeCon1,
                addChangeCon2: addChangeCon2,
                // order_column: '',
                // order_type: '',
                // storageName_orderColumn: '',
                order_column: localStorage.getItem('myInquiry_order_column') ? localStorage.getItem('myInquiry_order_column') : '', /* 排序列 */
                order_type: localStorage.getItem('myInquiry_order_type') ? localStorage.getItem('myInquiry_order_type') : '', /* 排序类型  asc desc */
                storageName_orderColumn: localStorage.getItem('myInquiry_storageName_orderColumn') ? localStorage.getItem('myInquiry_storageName_orderColumn') : '',
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
                subUserIds: '',
                subUserOptType: [],
                isFromGoogle: null, // 筛选条件, 是否来自 Google , 传 0 表示否, 1 表示 是
                optimizeStatus: null, // 筛选条件, 受众优化, (google, facebook), 传 0 表示否, 1 表示 是
                auditStatus: null,
                /* 新版表头筛选 */
                // 筛选配置
                config_tableFilter: {},
                // 表头筛选条件
                sqlList_tableFilter: {},

                /* 修改字段 */
                visible_edit_columns: false,
                columnType: 3,
                id_column_show_order: undefined,
                group: [],
                allGroup: [],
                // 保存到后端的字段属性, 目前只有 width
                fieldStyle: {},

                /* 多选操作 */
                // 已选中的询盘
                selected_items: [],
                // 合并
                show_merge_data: false,

                /* 导入数据 */
                show_import_data: false,

                /* 新建公司 */
                newCompanyShow: false,
                selectOptions: {},

                /* 受众优化 */
                audience_optimization_show: false,

                /* 对接权限系统 */
                corp_columns_authorized: {}, // 公司所有字段
                contact_columns_authorized: {}, // 联系人所有字段
                inquiry_columns_authorized: {}, // 询盘所有字段

                /* 询盘详情 */
                inquiryId: 0,
                show_inquiry_detail: false,
                rowIndex: -1,
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
                allLists: {
                    inquiryMarker: [
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
                googleMarketingMd5: '',
                showBatchEdit: false,
                visible_contact_selectionBox: false,
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
        },
        async mounted() {
            // 获取列表相关数据 筛选数据 + 列表字段 + 显示字段 + 左上角筛选第一项的下拉数据
            await this.getTableColumns();
            // 获取 数据库的所有字段数据(未经处理)
            this.getAllField();
            // 获取列表表头+显示顺序+表格宽度+客户显示条数 结束
        },
        beforeDestroy() {
            this.inquiryId = '';
        },
        methods: {
            closeGoogleMarketingSearch() {
                localStorage.removeItem('dashboard_inquiry_filter_googleMarketing');
                this.googleMarketingMd5 = '';
                this.curPage = 1;
                this.refreshData();
            },
            getAllField() {
                // 获取授权字段
                // 获取列表表头+显示顺序+表格宽度+显示条数
                const data = {
                    orgId: this.enterpriseId, // 企业id
                    userId: this.userId, // 用户id
                    parentId: 0,
                    type: this.columnType,
                    key: 'myInquiry'
                };
                crmCommon.getCommonConfig(data).then(resCol => {
                    if (resCol.code === '1') {
                        // 暂存所有默认字段和自定义字段
                        const defaultFields = resCol.data && Array.isArray(resCol.data.default) ? resCol.data.default : [];
                        const customFields = resCol.data && Array.isArray(resCol.data.custom) ? resCol.data.custom : [];
                        defaultFields.forEach(item => {
                            if (item.storageName === 'remark' && item.parentId === 2) {
                                item.cname = this.$t('crm.Modal.contact_remark');
                            } else {
                                item.cname = this.lang_inquiry[item.storageName] || item.cname;
                            }
                        });
                        // 筛选得到公司/询盘/联系人授权字段
                        this.$set(this.corp_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 1));
                        this.$set(this.corp_columns_authorized, 'custom', customFields.filter(col => col.parentId === 1));
                        this.$set(this.contact_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 2));
                        this.$set(this.contact_columns_authorized, 'custom', customFields.filter(col => col.parentId === 2));
                        this.$set(this.inquiry_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 3));
                        this.$set(this.inquiry_columns_authorized, 'custom', customFields.filter(col => col.parentId === 3));
                        // 拼接公司授权字段的 简称 和 国家地区 和 客户类型到询盘授权字段
                        if (Array.isArray(this.corp_columns_authorized.default)) {
                            const temp = this.corp_columns_authorized.default.filter(item => ['shortName', 'clientType', 'countryArea'].includes(item.storageName));
                            if (temp.length) {
                                temp.forEach(item => {
                                    item.companyFlag = true;
                                });

                                if (Array.isArray(this.inquiry_columns_authorized.default)) {
                                    this.inquiry_columns_authorized.default.unshift(...temp);
                                } else {
                                    this.inquiry_columns_authorized.default = temp;
                                }
                            }
                        }
                        // 拼接联系人授权字段的 简称 和 国家地区到询盘授权字段
                        if (Array.isArray(this.contact_columns_authorized.default)) {
                            const temp = this.contact_columns_authorized.default.filter(item => ['nickName', 'email', 'phone', 'socialNetworkingPlatform'].includes(item.storageName));
                            if (temp.length) {
                                temp.forEach(item => {
                                    item.contactFlag = true;
                                });

                                if (Array.isArray(this.inquiry_columns_authorized.default)) {
                                    this.inquiry_columns_authorized.default.unshift(...temp);
                                } else {
                                    this.inquiry_columns_authorized.default = temp;
                                }
                            }
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                    }
                });
            },
            async getTableColumns() {
                crmCommon.getFrontListAssembleObject({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    listType: 3 // listType：1客户，4公海客户,3询盘
                }).then((response) => {
                    if (response.code === '1') {
                        this.allColumns = response.data.showFieldList;
                        const list = response.data.filterFieldMap;
                        Object.keys(list).forEach((key) => {
                            // 格式化时间配置项 快捷操作按钮(默认字段)
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
                            col.storageName = col.key;
                            const headSet = this.config_tableFilter[col.key];
                            if (col.key === 'email') {
                                this.$set(this.fieldColumns, 'email', true);
                            }
                            if (col.key === 'whatsApp') {
                                this.$set(this.fieldColumns, 'whatsApp', true);
                            }
                            if (headSet && (headSet.sort || headSet.filter)) {
                                col.show_filter_content = false;
                                col.filtering = false;
                                col.columnsFilter = Boolean(this.config_tableFilter[col.key].sort);
                                col.title = this.lang_inquiry[col.key] || col.title;
                                this.lang_inquiry[col.key] = col.title;
                                if (col.key === 'email') {
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
                                col.title = this.lang_inquiry[col.key] || col.title;
                                if (this.tableFormatters[col.key]) {
                                    col.formatter = this.tableFormatters[col.key];
                                }
                            }
                        });
                        // 所有字段 key
                        this.allGroup = this.allColumns.map(item => item.key);

                        // 初始化左上角筛选数据
                        this.conditionList1 = response.data.searchFieldList.map(item => {
                            item.label = this.lang_inquiry[item.value] || item.label;
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

                        // 配置表格显示项 开始
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
                                this.group = showField.split(',');
                            }
                        }
                        // 配置表格显示项 结束

                        // 用户当前设置页数 开始
                        if (response.data.userConfig && response.data.userConfig.value) {
                            const size = parseInt(response.data.userConfig.value);
                            this.pageSize = size;
                        } else {
                            this.pageSize = 20;
                            this.addPageSize();
                        }
                        // 用户当前设置页数 结束
                        // 设置大部分下拉选项
                        this.allSelectOptions.followUp && this.setSelectOptions();
                        // 设置全部人员列表以供筛选
                        this.allUsers.length && this.setAllUsers();
                        // 根据跳转时附加参数的不同作出相应刷新操作
                        this.checkRouteParams();
                    } else {
                        console.log('数据获取失败');
                    }
                }, () => {
                    console.log('数据获取失败');
                });
            },
            /**
             * @Date: 2020-06-04 16:00:52
             * @LastEditors: niumkiki
             * @description: fb账号未绑定弹窗方法
             * @param :
             * @return:
             */
            updateAccontNotBind(val) {
                this.accontNotBind = val;
            },
            // 去绑定fb账号
            goToBind() {
                if (this.isContainsMenu('account_binding')) {
                    window.open('#/systemSettings/facebookBinding/account_binding', '_blank');
                } else {
                    // ？？
                    this.$Message.warning(this.$t('inbox.tip'));
                }
                this.accontNotBind = false;
            },
            /* 添加PageSize */
            addPageSize() {
                const data = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    key: 'myInquiry',
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
                                    case 'inquiryManagers':
                                        result.$regex = val.map(item => item.value);
                                        break;
                                    default:
                                        // 表头筛选中只能有单个选项值的(单选型字段 + 创建人这种表格才有的字段)属性, 筛选时使用 $eq 等于, 其他用 $regex 包含
                                        let type = '$regex';
                                        switch (key) {
                                            case 'sourceChannel':
                                            case 'sourceWay':
                                            case 'grouping':
                                            case 'followUp':
                                            case 'createUser':
                                            case 'inquiryMarker':
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
            // 根据跳转时附加参数的不同作出相应刷新操作
            async checkRouteParams() {
                const paramsRoute = this.$route.query;
                // localStorageName 统一管理
                const getLocalStorageItemName = {
                    inquiryId: 'leadsCloud-inquiryId',
                    workBench_number_type: 'leadsCloud-workBench_number_type',
                    workBench_type: 'leadsCloud-workBench_type',
                    screenDate: 'leadsCloud-screenDate',
                    followUpId: 'leadsCloud-followUpId',
                    saleIdList: 'leadsCloud-saleIdList',
                    dashboard_inquiry_filters: 'dashboard_inquiry_filters'
                };
                // 根据query 更新getLocalStorageItemName值
                let updateList = localStorage.getItem(paramsRoute.k);
                localStorage.removeItem(paramsRoute.k);
                if (updateList && this.$dym.isJSON(updateList)) {
                    updateList = JSON.parse(updateList);
                    if (Array.isArray(updateList) && paramsRoute.i) {
                        updateList.forEach(v => {
                            if (getLocalStorageItemName[v]) {
                                getLocalStorageItemName[v] = getLocalStorageItemName[v] + paramsRoute.i;
                            }
                        });
                    }
                }

                // 处理工作台顶部数字点击跳转到询盘
                if (localStorage.getItem(getLocalStorageItemName.workBench_number_type)) {
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', true);
                    const temp = localStorage.getItem(getLocalStorageItemName.workBench_number_type);
                    localStorage.removeItem(getLocalStorageItemName.workBench_number_type);
                    this.show_inquiry_detail = false;

                    const end = new Date();
                    const start = new Date();

                    this.addCondition = [];

                    switch (temp) {
                        case 'today':
                            this.addClick();
                            this.addCondition[0].condition1 = 'createTime';
                            this.addCondition[0].condition2 = 'dateRange';
                            this.addCondition[0].condition3 = [start.format('yyyy-MM-dd'), end.format('yyyy-MM-dd')];
                            this.addCondition[0].inputType = 'dateRange';
                            break;
                        case 'week':
                            let dayNo = start.getDay();
                            dayNo = dayNo ? dayNo - 1 : 6;
                            start.setTime(start.getTime() - dayNo * 24 * 60 * 60 * 1000);

                            this.addClick();
                            this.addCondition[0].condition1 = 'createTime';
                            this.addCondition[0].condition2 = 'dateRange';
                            this.addCondition[0].condition3 = [start.format('yyyy-MM-dd'), end.format('yyyy-MM-dd')];
                            this.addCondition[0].inputType = 'dateRange';
                            break;
                        case 'month':
                            start.setTime(new Date(start.getFullYear(), start.getMonth(), 1).getTime());

                            this.addClick();
                            this.addCondition[0].condition1 = 'createTime';
                            this.addCondition[0].condition2 = 'dateRange';
                            this.addCondition[0].condition3 = [start.format('yyyy-MM-dd'), end.format('yyyy-MM-dd')];
                            this.addCondition[0].inputType = 'dateRange';
                            break;
                        case 'unFollow':
                            start.setTime(start.getTime() - 7 * 24 * 60 * 60 * 1000);

                            this.addClick();
                            this.addCondition[0].condition1 = 'notFollowedDays';
                            this.addCondition[0].condition2 = '$gte';
                            this.addCondition[0].condition3 = 7;
                            this.addCondition[0].inputType = 'number';
                            if (!this.selectOptions.followUp) await this.$store.dispatch('getSelectOptions');
                            this.addClick();
                            this.addCondition[1].condition1 = 'followUp';
                            this.addCondition[1].condition2 = '$ne';
                            this.addCondition[1].condition3 = -1;
                            this.addCondition[1].inputType = 'select';
                            break;
                    }

                    // 判断工作台的"我的""全部"
                    if (localStorage.getItem(getLocalStorageItemName.workBench_type) === 'myInquiry') {
                        this.addClick();
                        const i = this.addCondition.length - 1;

                        this.addCondition[i].condition1 = 'inquiryManagers';
                        this.addCondition[i].condition2 = '$regex';
                        this.addCondition[i].condition3 = [Number(this.userId)];
                        this.addCondition[i].inputType = 'array';
                    }
                    localStorage.removeItem(getLocalStorageItemName.workBench_type);

                    // 检索
                    setTimeout(() => {
                        if (this.addCondition.length) {
                            this.addCondition.unshift(this.addCondition.pop());
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

                // 处理工作台跳转到询盘
                if (localStorage.getItem(getLocalStorageItemName.screenDate)) {
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', true);
                    // 从 localStorage 中取数据
                    const screenDate = this.$options.filters.parseArray(localStorage.getItem(getLocalStorageItemName.screenDate));
                    const followUpId = localStorage.getItem(getLocalStorageItemName.followUpId);
                    const saleIdList = this.$options.filters.parseArray(localStorage.getItem(getLocalStorageItemName.saleIdList));
                    // 改为添加定时器移除localStorage
                    window.setTimeout(() => {
                        localStorage.removeItem(getLocalStorageItemName.screenDate);
                        localStorage.removeItem(getLocalStorageItemName.followUpId);
                        localStorage.removeItem(getLocalStorageItemName.saleIdList);
                    }, 5000);
                    this.show_inquiry_detail = false;
                    this.addCondition = [];

                    // 日期
                    if (Array.isArray(screenDate) && screenDate.length) {
                        this.addClick();
                        const i = this.addCondition.length - 1;

                        this.addCondition[i].condition1 = 'createTime';
                        this.addCondition[i].condition2 = 'dateRange';
                        this.addCondition[i].condition3 = screenDate;
                        this.addCondition[i].inputType = 'dateRange';
                    }

                    // 跟进状态
                    if (followUpId) {
                        this.addClick();
                        const i = this.addCondition.length - 1;
                        this.addCondition[i].condition1 = 'followUp';
                        this.addCondition[i].condition2 = '$eq';
                        this.addCondition[i].condition3 = Number(followUpId);
                        this.addCondition[i].inputType = 'select';
                    }
                    // 负责人
                    if (localStorage.getItem(getLocalStorageItemName.workBench_type) === 'myInquiry') {
                        this.addClick();
                        const i = this.addCondition.length - 1;

                        this.addCondition[i].condition1 = 'inquiryManagers';
                        this.addCondition[i].condition2 = '$regex';
                        this.addCondition[i].condition3 = [Number(this.userId)];
                        this.addCondition[i].inputType = 'array';
                    } else {
                        if (Array.isArray(saleIdList) && saleIdList.length) {
                            this.addClick();
                            const i = this.addCondition.length - 1;

                            this.addCondition[i].condition1 = 'inquiryManagers';
                            this.addCondition[i].condition2 = '$regex';
                            this.addCondition[i].condition3 = saleIdList.map(id => Number(id));
                            this.addCondition[i].inputType = 'array';
                        }
                    }
                    localStorage.removeItem(getLocalStorageItemName.workBench_type);
                    // 检索
                    setTimeout(() => {
                        if (this.addCondition.length) {
                            this.addCondition.unshift(this.addCondition.pop());
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
                if (localStorage.getItem('leadsCloud-dataOverview')) {
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', true);
                    const type = localStorage.getItem('leadsCloud-dataOverview-type');
                    const dataOverviewParams = JSON.parse(localStorage.getItem('leadsCloud-dataOverview'));
                    this.show_inquiry_detail = false;
                    this.addCondition = [];
                    const addCondition = [];
                    for (let i = 0; i < dataOverviewParams.length; i++) {
                        const obj = {
                            condition1: dataOverviewParams[i].condition1,
                            condition2: dataOverviewParams[i].condition2,
                            condition3: dataOverviewParams[i].condition3,
                            inputType: dataOverviewParams[i].inputType
                        };
                        addCondition.push(obj);
                    }
                    if (type) {
                        if (!this.selectOptions.followUp) await this.$store.dispatch('getSelectOptions');
                        if (type === 'inquiryCount') {
                            const statusList = this.selectOptions.followUp ? this.selectOptions.followUp.filter(item => item.transactionStatus > 0) : [];
                            console.log(statusList);
                            for (let i = 0; i < statusList.length; i++) {
                                const obj = {
                                    condition1: 'followUp',
                                    condition2: '$ne',
                                    condition3: statusList[i].attrId,
                                    inputType: 'select'
                                };
                                addCondition.push(obj);
                            }
                            const obj = {
                                condition1: 'followUp',
                                condition2: '$ne',
                                condition3: -1,
                                inputType: 'select'
                            };
                            addCondition.push(obj);
                        }
                        if (type === 'inquiryTransactionCount') {
                            const obj = {
                                condition1: 'followUp',
                                condition2: '$ne',
                                condition3: 0,
                                inputType: 'select'
                            };
                            addCondition.push(obj);
                            const statusList = this.selectOptions.followUp ? this.selectOptions.followUp.filter(item => item.transactionStatus < 1) : [];
                            console.log(statusList);
                            for (let i = 0; i < statusList.length; i++) {
                                const obj = {
                                    condition1: 'followUp',
                                    condition2: '$ne',
                                    condition3: statusList[i].attrId,
                                    inputType: 'select'
                                };
                                addCondition.push(obj);
                            }
                        }
                    }
                    localStorage.removeItem('leadsCloud-dataOverview');
                    localStorage.removeItem('leadsCloud-dataOverview-type');
                    this.addCondition = addCondition;
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
                if (localStorage.getItem('leadsCloud-dashBoard-topFilter')) {
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', true);
                    const topFilterParams = JSON.parse(localStorage.getItem('leadsCloud-dashBoard-topFilter'));
                    this.show_inquiry_detail = false;
                    this.addCondition = [];
                    const addCondition = [];
                    for (let i = 0; i < topFilterParams.length; i++) {
                        const obj = {
                            condition1: topFilterParams[i].condition1,
                            condition2: topFilterParams[i].condition2,
                            condition3: topFilterParams[i].condition3,
                            inputType: topFilterParams[i].inputType
                        };
                        addCondition.push(obj);
                    }
                    localStorage.removeItem('leadsCloud-dashBoard-topFilter');
                    this.addCondition = addCondition;
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
                // 处理仪表盘带 Map 类型筛选条件跳转
                if (localStorage.getItem(getLocalStorageItemName.dashboard_inquiry_filters)) {
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', true);
                    // 提取筛选条件 Map 数组
                    const initial_filter_cons = new Map(JSON.parse(localStorage.getItem(getLocalStorageItemName.dashboard_inquiry_filters)));
                    localStorage.removeItem(getLocalStorageItemName.dashboard_inquiry_filters);

                    // 成交及成交之后跟进状态筛选
                    if (initial_filter_cons.get('transactionStatus')) {
                        const statusList = this.selectOptions.followUp ? this.selectOptions.followUp.filter(item => item.transactionStatus > 0) : [];
                        if (statusList.length) {
                            initial_filter_cons.set('followUp', statusList.map(item => {
                                const { attrId: value, attrName: label } = item;
                                return { value, label };
                            }));
                        }
                    }

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
                // 处理仪表盘带 Map 类型筛选条件跳转
                if (localStorage.getItem('dashboard_inquiry_filter_googleMarketing')) {
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', true);
                    this.googleMarketingMd5 = localStorage.getItem('dashboard_inquiry_filter_googleMarketing');
                    localStorage.removeItem('dashboard_inquiry_filter_googleMarketing');
                    // 请求表格数据
                    this.filtering = false;
                    this.type_topFilter = 'searchCommon';
                    this.flag_topFilter = !this.flag_topFilter;

                    // 停止向下执行
                    return;
                }

                // 处理其它带 inquiryId 跳转
                if (localStorage.getItem(getLocalStorageItemName.inquiryId)) {
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', true);
                    // 跳转时带过来指定的 inquiryId
                    const tempId = localStorage.getItem(getLocalStorageItemName.inquiryId);
                    localStorage.removeItem(getLocalStorageItemName.inquiryId);
                    this.show_inquiry_detail = false;
                    this.$nextTick(() => {
                        this.inquiryId = tempId;
                        this.show_inquiry_detail = true;
                    });

                    // 请求表格数据
                    this.filtering = false;
                    this.type_topFilter = 'searchCommon';
                    this.flag_topFilter = !this.flag_topFilter;

                    // 停止向下执行
                    return;
                }

                // 请求表格数据
                this.filtering = false;
                this.type_topFilter = 'searchCommon';
                this.flag_topFilter = !this.flag_topFilter;
            },
            // 新建获取属性列表
            setSelectOptions() {
                this.selectOptions = this.$deepClone(this.allSelectOptions);
                this.$set(this.selectOptions, 'label', this.selectOptions.tag || []);
                
                /* 如果请求下来的所有选项( selectOptions )中有与筛选设置( config_tableFilter )匹配的属性, 且匹配到的筛选设置筛选类型为 'select' , 则导入选项数据到匹配筛选设置 */
                Object.entries(this.selectOptions).forEach(([key, value]) => {
                    if (this.config_tableFilter.hasOwnProperty(key)) {
                        const temp = this.config_tableFilter[key];
                        if (temp.filterType === 'select') {
                            temp.allList = value.map(({ attrId, attrName }) => {
                                return {
                                    value: key === 'followUp' ? attrId : attrName,
                                    label: attrName
                                };
                            });
                            if (key === 'followUp') {
                                temp.allList.splice(1, 0, {
                                    value: -1,
                                    label: this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry')
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
                this.config_tableFilter.createUser && this.$set(this.config_tableFilter.createUser, 'allList', [{ label: '询盘云', value: -2 }].concat(allList));
            },
            // 获取检索字段名称对应的数据库字段名
            getSearchCon(str) {
                switch (str) {
                    case 'seqNumber':
                        return 'seq_number';
                    case 'companyName':
                        return 'company_name';
                    case 'shortName':
                        return 'short_name';
                    case 'countryArea':
                        return 'country_area';
                    case 'nickName':
                        return 'nick_name';
                    case 'email':
                        return 'email';
                    case 'phone':
                        return 'phone';
                    case 'socialNetworkingPlatform':
                        return 'social_networking_platform';
                    case 'demandProducts':
                        return 'demand_products';
                    case 'productCategory':
                        return 'product_category';
                    case 'sourceChannel':
                        return 'source_channel';
                    case 'sourceWay':
                        return 'source_way';
                    case 'status':
                        return 'status';
                    case 'followUp':
                        return 'follow_up_id';
                    case 'follow_up_count':
                        return 'follow_up_count';
                    case 'estimatedInquiryAmount':
                        return 'estimated_inquiry_amount';
                    case 'transactionTime':
                        return 'transactionTime';
                    case 'transactionMoney':
                        return 'transactionMoney';
                    case 'notFollowedDays':
                        return 'not_followed_days';
                    case 'dynamic':
                        return 'dynamic';
                    case 'lastFollowupTime':
                        return 'last_follow_up_time';
                    case 'grouping':
                        return 'grouping';
                    case 'remark':
                        return 'remark';
                    case 'label':
                        return 'label';
                    case 'inquiryManagers':
                        return 'inquiryManagers';
                    case 'createUser':
                        return 'create_user_id';
                    case 'createTime':
                        return 'create_time';
                    case 'updateTime':
                        return 'update_time';
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
                const subUserIds_a = a.filter(item => item.hasOwnProperty('inquiryManagers'));
                const subUserIds_b = b.filter(item => item.hasOwnProperty('inquiryManagers'));
                if (subUserIds_a && subUserIds_a.length) {
                    this.subUserOptType = [];
                    subUserIds_a.forEach(items => {
                        Object.entries(items.inquiryManagers).forEach(([fieldKey, fieldObj]) => {
                            this.subUserOptType.push({
                                [fieldKey]: fieldObj === -1 ? [] : fieldObj
                            });
                        });
                    });
                } else {
                    this.subUserOptType = [];
                }
                if (subUserIds_b && subUserIds_b.length) {
                    this.subUserIds = subUserIds_b[0].inquiryManagers.$regex.join(',');
                } else {
                    this.subUserIds = '';
                }
                a = a.filter(item => !item.hasOwnProperty('inquiryManagers'));
                b = b.filter(item => !item.hasOwnProperty('inquiryManagers'));

                // 处理状态筛选, 优先使用右上角检索条件
                const status_a = a.filter(item => item.hasOwnProperty('status'));
                const status_b = b.filter(item => item.hasOwnProperty('status'));
                // 如果都有"状态"筛选, 只取前者第一项, 否则取后者第一项或空数组
                const con_status = status_a[0] || status_b[0];
                if (con_status) {
                    const arr = con_status.status.$regex;
                    if (arr.length) {
                        if (arr.includes(null)) {
                            this.isFromGoogle = 0;
                            this.optimizeStatus = '0,0';
                            this.auditStatus = 0;
                        } else {
                            if (arr.includes(0)) {
                                this.isFromGoogle = 1;
                            } else {
                                this.isFromGoogle = 0;
                            }
                            if (arr.includes(4)) {
                                this.auditStatus = 1;
                                // google 受众优化1   facebook受众优化2  google回传待审核4
                                switch (arr.reduce((a, b) => a + b) - 4) {
                                    case 1:
                                        this.optimizeStatus = '1,0';
                                        break;
                                    case 2:
                                        this.optimizeStatus = '0,1';
                                        break;
                                    case 3:
                                        this.optimizeStatus = '1,1';
                                        break;
                                    case 0:
                                        this.optimizeStatus = '0,0';
                                        break;
                                }
                            } else {
                                this.auditStatus = 0;
                                switch (arr.reduce((a, b) => a + b)) {
                                    case 1:
                                        this.optimizeStatus = '1,0';
                                        break;
                                    case 2:
                                        this.optimizeStatus = '0,1';
                                        break;
                                    case 3:
                                        this.optimizeStatus = '1,1';
                                        break;
                                    case 0:
                                        this.optimizeStatus = '0,0';
                                        break;
                                }
                            }
                        }
                    } else {
                        this.isFromGoogle = null;
                        this.optimizeStatus = null;
                        this.auditStatus = null;
                    }
                } else {
                    this.isFromGoogle = null;
                    this.optimizeStatus = null;
                    this.auditStatus = null;
                }
                a = a.filter(item => !item.hasOwnProperty('status'));
                b = b.filter(item => !item.hasOwnProperty('status'));

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
                                        case 'inquiryManagers':
                                        case 'status':
                                            result.$regex = temp.query.map(item => item.value);
                                            break;
                                        default:
                                            // 表头筛选中只能有单个选项值的(单选型字段 + 创建人这种表格才有的字段)属性, 筛选时使用 $eq 等于, 其他用 $regex 包含
                                            let type = '$regex';
                                            switch (key) {
                                                case 'sourceChannel':
                                                case 'sourceWay':
                                                case 'grouping':
                                                case 'followUp':
                                                case 'createUser':
                                                case 'inquiryMarker':
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
                localStorage.removeItem('myInquiry_order_column');
                localStorage.removeItem('myInquiry_order_type');
                localStorage.removeItem('myInquiry_storageName_orderColumn');

                // 刷新
                this.curPage = 1;
                this.refreshData();
            },

            /* 多选操作 */
            // 多选
            handleSelectionChange({ records, reserves }) {
                const selection = records.concat(reserves);
                if (selection.length > 0) {
                    this.selected_items = selection.map(item => {
                        const { inquiryId, companyId, clueId, inquiryManagers, inquiryManagerIds } = item;
                        return {
                            inquiryId,
                            companyId,
                            clueId,
                            inquiryManagers,
                            inquiryManagerIds
                        };
                    });
                } else {
                    this.selected_items = [];
                }
            },
            // 清除表格已选内容
            clear_selected_items() {
                if (this.$refs.customerView.$refs.table) {
                    this.$refs.customerView.$refs.table.clearCheckboxRow();
                    this.$refs.customerView.$refs.table.clearCheckboxReserve();
                }
                this.selected_items = [];
            },

            /* 合并询盘 */
            merge_inquiry() {
                if (this.selected_items.length === 2) {
                    if ([...new Set(this.selected_items.map(item => item.companyId))].length !== 1) {
                        this.$Message.error(this.$t('crm.Table.error_mergeInquiryBelong'));
                    } else {
                        this.show_merge_data = true;
                    }
                } else {
                    this.$Message.error(this.$t('crm.Table.error_mergeInquiryLength'));
                }
            },

            /* 新建客户 */
            newCreate() {
                this.newCompanyShow = true;
            },

            /* 筛选字段, poptip 型 */
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

            /* 文件下载 */
            exportData() {
                const url = `${this.$util.ajaxUrl}/crm/mongo/inquiryRefactor/getFilterListExcel?userId=${this.userId}&orgId=${this.enterpriseId}&listType=3&subUserOptType=${this.subUserOptType.length ? encodeURIComponent(JSON.stringify(this.subUserOptType)) : ''}&query=${this.queryData.$and.length ? encodeURIComponent(JSON.stringify(this.queryData)) : ''}&subUserIds=${this.subUserIds}&isFromGoogle=${this.isFromGoogle ? 1 : ''}&optimizeStatus=${this.optimizeStatus || ''}&auditStatus=${this.auditStatus || ''}`;
                this.$stm.openNewWindow(url);
            },

            /* 受众优化 */
            audience_optimization() {
                if (this.selected_items.length > 500) {
                    this.$Message.error(this.$t('crm.Table.error_audienceOverLength'));
                    return;
                }
                this.audience_optimization_show = true;
            },

            /* 表格 */
            // 数据处理
            // 刷新表格数据
            refreshData(paramsObj = {}) {
                if (this.queryData.$and.length > 0) {
                    this.googleMarketingMd5 = '';
                    localStorage.removeItem('dashboard_clue_filter_googleMarketing');
                }
                // 取消之前的表格数据请求
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }

                // 清空已选中的询盘
                if (paramsObj.clearSelected) {
                    this.clear_selected_items();
                }

                // '未跟进天数'的排序比较特殊, 要反着来
                let orderType = this.order_type;
                if (this.order_column === 'not_followed_days') {
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
                    listType: 3,
                    query: this.queryData.$and.length ? JSON.stringify(this.queryData) : undefined,
                    subUserIds: this.subUserIds,
                    subUserOptType: this.subUserOptType.length ? JSON.stringify(this.subUserOptType) : undefined,
                    isFromGoogle: this.isFromGoogle,
                    optimizeStatus: this.optimizeStatus,
                    auditStatus: this.auditStatus,
                    pageSize: this.pageSize,
                    pageNo: this.curPage,
                    orderColumn: this.order_column,
                    orderType,
                    userId: this.userId,
                    md5: this.googleMarketingMd5 ? this.googleMarketingMd5 : undefined
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
                crmInquiry.getInquiryFilterListDataAndTotalMongo(postData, cancelToken).then(async response => {
                    if (response.code === '1') {
                        this.totalNum = response.data.total || 0;
                        this.maxPageNum = Math.ceil(this.totalNum / this.pageSize);
                        // 处理数据
                        this.tableData = await this.handleData(response.data.list);
                        // 表格滚动到顶部
                        if (this.$refs.customerView.$refs['table']) {
                            this.$refs.customerView.$refs['table'].$el.querySelector('.vxe-table--body-wrapper').scrollTop = 0;
                        }
                    } else {
                        this.totalNum = 0;
                        this.maxPageNum = 0;
                        this.tableData = [];
                        this.$Message.error(this.$t('crm.Table.error_getInquiryTableData'));
                    }
                    this.loading = false;
                    if (localStorage.getItem('leadsCloud-filter-title')) {
                        localStorage.removeItem('leadsCloud-filter-title');
                    }
                });
            },
            // 检索并刷新表格
            refreshData_filter() {
                this.merge_query_list();
                this.curPage = 1;
                this.refreshData();
            },
            // 初始化数据
            async handleData(data) {
                let result = [];
                if (Array.isArray(data) && data.length) {
                    // 格式化数据
                    result = data.map(data => {
                        const temp = {
                            id: data.id,
                            inquiryId: data.id,
                            companyId: data.companyId,
                            contactId: data.mainContactsId,
                            clueId: data.clueId,
                            seqNumber: data.seqNumber,
                            companyName: data.companyName,
                            inquiryManagers: data.companyManagers,
                            inquiryManagerIds: data.companyManagerIds,
                            createTime: new Date(data.createTime).format('yyyy-MM-dd hh:mm'),
                            updateTime: new Date(data.updateTime).format('yyyy-MM-dd hh:mm'),
                            follow_up_count: data.followUpCount,
                            notFollowedDays: data.notFollowedDays,
                            dynamic: this.$options.filters.parseObject(data.dynamic),
                            lastFollowupTime: data.lastFollowUpTime ? new Date(data.lastFollowUpTime).format('yyyy-MM-dd hh:mm') : '',
                            transactionTime: data.transactionTime ? new Date(data.transactionTime).format('yyyy-MM-dd hh:mm:ss') : '',
                            transactionMoney: (data.transactionMoneyCurrency && data.transactionMoney) ? (Utils.getCurrencySymbol(data.transactionMoneyCurrency).symbol + Utils.transformMoney(data.transactionMoney)) : '-',
                            followUpId: data.followUpId,
                            mainContactsId: data.mainContactsId,
                            facebookStatus: data.facebookStatus,
                            isFromGoogle: data.isFromGoogle,
                            conversionStatus: data.conversionStatus,
                            auditStatus: data.auditStatus,
                            createUser: data.createUser,
                            createUserId: data.createUserId,
                            countryArea: data.countryArea,
                            clientType: data.clientType,
                            companyManagerIds: data.companyManagerIds,
                            inquiryMarker: data.inquiryMarker
                        };

                        this.allColumns.forEach((columns, index) => {
                            if (temp[columns.key] === undefined) {
                                temp[columns.key] = data[columns.key];
                            }
                        });


                        if (this.allColumns.map((item) => item.key).includes('socialNetworkingPlatform')) {
                            let socialNetworkingPlatform = [{
                                attrName: '',
                                attrValue: ''
                            }];
                            if (data.socialNetworkingPlatform) {
                                try {
                                    socialNetworkingPlatform = JSON.parse(data.socialNetworkingPlatform).length ? JSON.parse(data.socialNetworkingPlatform) : [{
                                        attrName: '',
                                        attrValue: ''
                                    }];
                                } catch (e) {
                                }
                            }
                            temp.socialNetworkingPlatform = socialNetworkingPlatform;
                        }
                        if (this.allColumns.map((item) => item.key).includes('phone')) {
                            temp.phone = data.phone ? data.phone : '-';
                        }
                        if (this.allColumns.map((item) => item.key).includes('estimatedInquiryAmount')) {
                            temp.estimatedInquiryAmount = (data.estimatedInquiryAmountCurrency && data.estimatedInquiryAmount != null) ? (Utils.getCurrencySymbol(data.estimatedInquiryAmountCurrency).symbol + Utils.transformMoney(data.estimatedInquiryAmount)) : '-';
                        }

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
                // 去掉排序逻辑，由于接口已经排好顺序
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
                    if (['transactionMoney', 'followUpCount', 'notFollowedDays', 'estimatedInquiryAmount'].includes(column.field)) {
                        if (val) {
                            this.$set(this.config_tableFilter[column.field], 'query', `${val.$gte}-${val.$lte}`);
                        } else {
                            // 清除筛选操作
                            this.$set(this.config_tableFilter[column.field], 'query', '');
                        };
                    } else {
                        this.$set(this.config_tableFilter[column.field], 'query', val);
                    };
                }
            },
            // 这里是给接口传递参数的
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
                                switch (con) {
                                    // 单独发送的字段在最外层, 方便 merge_query_list , 否则用 $or: [筛选条件...]
                                    case 'inquiryManagers':
                                    case 'status':
                                        result.$regex = temp.query.map(item => item.value);
                                        break;
                                    default:
                                        // 表头筛选中只能有单个选项值的(单选型字段 + 创建人这种表格才有的字段)属性, 筛选时使用 $eq 等于, 其他用 $regex 包含
                                        let type = '$regex';
                                        switch (column.field) {
                                            case 'sourceChannel':
                                            case 'sourceWay':
                                            case 'grouping':
                                            case 'followUp':
                                            case 'createUser':
                                            case 'inquiryMarker':
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
            clickRow({row, column, $event}) {
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
                    // 打开详情页
                    const path = $event.path || ($event.composedPath && $event.composedPath());
                    // 邮箱弹窗
                    if (path.find(item => item.classList && item.classList.contains('ct_email') && item.tagName === 'TD')) {
                        if (row.email) {
                            const emails = [{
                                receiverName: row.nickName || '',
                                receiveMailAddress: row.email,
                                followUpId: `${row.inquiryId}`,
                                followUpType: 2
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
                    this.inquiryId = row.inquiryId;
                    this.show_inquiry_detail = true;
                    this.rowIndex = this.tableData.findIndex(item => item.inquiryId === row.inquiryId);
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
                    key: 'myInquiry',
                    value: pageSize.toString()
                }
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

            /* 处理详情页传递过来的刷新信息 */
            refreshCheck(obj) {
                if (obj && obj.inquiryId) {
                    /**
                     * @Description: 此处使用 Element-ui 定制版的方法 toggleRowSelectionById ,
                     * 保证从 selected_items 中去掉 obj.inquiryId 对应选项时表格选中项也去掉,
                     * 相较 toggleRowSelection , row 变为 { attrName, id } , 指定 "id" 对应的属性名和属性值,
                     * 解决了分页时无法取到对应的 row 的问题, 分页时需配合 reserve-selection
                     * @author 汤一飞
                     * @date 2020/4/30
                     */
                    this.$refs.customerView.$refs['table'].toggleRowSelectionById({
                        attrName: 'inquiryId',
                        id: obj.inquiryId
                    }, false);

                    this.selected_items = this.selected_items.filter(item => item.inquiryId !== obj.inquiryId);
                    const tableRow = this.tableData.find(item => `${item.inquiryId}` === `${obj.inquiryId}`);
                    if (tableRow) {
                        // this.refreshData();
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
                            id: {
                                $eq: row.inquiryId
                            }
                        }
                    ]
                };

                // 组装请求数据
                const postData = {
                    orgId: this.enterpriseId,
                    listType: 3,
                    query: JSON.stringify(filterRowCondition),
                    pageSize: 20,
                    pageNo: 1,
                    userId: this.userId
                };
                // 请求指定 row 最新数据
                crmInquiry.getInquiryFilterListDataAndTotalMongo(postData).then(async response => {
                    if (response.code === '1') {
                        // 获取待更新的表格行在当前表格页的位置
                        const index = this.tableData.findIndex(item => `${item.inquiryId}` === `${row.inquiryId}`);
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
                                this.$refs.customerView.$refs['table'].setCurrentRow(this.tableData[index]);
                            }
                        } else {
                            // 无数据
                            // 关闭所有侧滑页
                            this.show_inquiry_detail = false;
                            this.inquiryId = 0;
                            // 刷新当前页表格数据
                            this.refreshData();
                        }
                    }
                });
            },
            changeInquiryMarker() {
                if (this.show_inquiry_detail) {
                    this.$refs.inquiryDetail.$refs.crmDetail.get_inquiry_short_info();
                }
            },
            handleBatchEdit() {
                this.showBatchEdit = true;
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
            show_inquiry_detail: {
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
                    localStorage.setItem('myInquiry_order_column', val);
                    localStorage.setItem('myInquiry_storageName_orderColumn', this.storageName_orderColumn);
                },
                immediate: true
            },
            order_type: {
                handler(val) {
                    localStorage.setItem('myInquiry_order_type', val);
                },
                immediate: true
            },
            // storageName_orderColumn: {
            //     handler(val) {
            //         localStorage.setItem('myInquiry_storageName_orderColumn', val);
            //     },
            //     immediate: true
            // }
            salesList: {
                handler(val) {
                    if (val) {
                        if (location.href.indexOf('?insfrom=1') !== -1) {
                            const name = this.$route.name;
                            this.newCreate();
                            this.$router.replace({ name });
                        }
                    }
                }
            }
        }
    };
</script>

<style lang="less">
    @import "../../../styles/common.less";
    @import "../Detail/Components/less/modal.less";
    @import "Components/less/tablePage.less";
    @import "../Detail/Components/less/detailPage.less";
    @import '../../main-components/editable-table.less';

    .audience_icon_wrap {
        display: table;
        height: 100%;
        overflow: hidden;

        > span {
            display: table-cell;
            line-height: 0;

            &:not(:first-child) {
                padding-left: 5px;
            }
        }
    }
    .googleMarketing-filter .el-icon-close{
        color: #a9b9c9;
    }
    .googleMarketing-filter  .el-icon-close:hover {
        background-color: transparent;
        color: #a9b9c9;
    }
</style>

<style scoped lang="less">
    .my-inquiry-top{
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
        position: relative;
        bottom: 4px;
    }
</style>
