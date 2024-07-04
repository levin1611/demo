<template>
    <div class="clue">
        <div class="adgroup">
            <div class="table_wrap">
                <div class="datewrap clearfix" style="position:relative;">
                    <!-- 转移线索相关 -->
                    <template v-if="selected_clues.length && (transfer_clue_btn || go_sea_btn)">
                        <div class="table-multiple-operate-btns" style="display: inline-block">
                            {{ $t('crm.Table.selected') }}
                            <span style="font-weight: bolder;color:#FA8241;">{{ selected_clues.length }}</span>
                             {{ selected_clues.length > 1 ? $t('crm.Table.item_clues') : $t('crm.Table.item_clue') }}
                            <template v-if="!is_marketing_station">
                                <!-- 群发单显  v-if="authorized_button['mergeData']"-->
                                <!-- <Button type="minor"
                                        style="font-size: 14px;"
                                        @click="bulkSending">{{ $t('crm.Table.bulkSending') }}</Button> -->
                                <!-- 发送WhatsApp -->
                                <Button v-if="sendWhatsAppBtn"
                                    type="minor"
                                    style="font-size: 14px; margin-left: 20px;"
                                    @click="sendWhatsApp">{{ $t('crm.Table.sendWhatsApp') }}</Button>
                                <!-- 转移 -->
                                <Button v-if="transfer_clue_btn" type="minor" style="font-size: 14px; padding: 10px;" @click="transferClue">
                                    {{$t('crm.Modal.operate_transfer')}}
                                </Button>
                                <!-- 退入公海 -->
                                <Button v-if="go_sea_btn" type="minor" style="font-size: 14px; padding: 10px;margin-left: 10px;" @click="goSeaClue">
                                    {{$t('crm.Modal.operate_throw')}}
                                </Button>
                            </template>
                        </div>
                        <span class="_btns_text_ml">
                            <Button
                                type="text"
                                @click="clearSelectedClues">
                                    <Icon type="md-close" size="18" color="#A9B9C9"></Icon>
                            </Button>
                        </span>
                    </template>
                    <template v-else>
                        <!-- 改版顶部筛选 -->
                        <div style="float: left;margin-top: 6px;">
                            <TopFilter
                                    :title.sync="title_topFilter"
                                    type="myClue"
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
                                    sql_manager="clueManagers"
                                    ref="topFilter"
                                    @refreshData="refreshData_filter">
                            </TopFilter>
                        </div>
                        &nbsp;&nbsp;&nbsp;
                        <!-- 筛选标签 -->
                        <FilterTags
                            style="left:16px;top:2px;height:36px;"
                            :order_column="order_column"
                            :order_type="order_type"
                            :langObj="langObj"
                            :filterConObj.sync="config_tableFilter"
                            :storageName_orderColumn="storageName_orderColumn"
                            :width="600"
                            :removeWidth="750"
                            :tagMaxWidth="300"
                            @change_filter_tag="change_filter_tag"
                            @emptySort="empty_sort"
                            @removeCon="remove_filter_tag">
                        </FilterTags>
                        <div style="display:inline-block" v-if="googleMarketingMd5">
                            <Tag class="googleMarketing-filter" @close="closeGoogleMarketingSearch" closable>Google 广告访客关联的线索</Tag>
                        </div>
                        <span class="clearfix _btns_text_ml">
                            <!-- 下载线索 -->
                            <Tooltip :content="$t('crm.Table.exportData')" effect="dark" placement="bottom">
                                <Button
                                    type="text"
                                    v-if="export_data_btn"
                                    icon="custom custom-file-download"
                                    @click="exportData"
                                    class="clue-document-dowload custom-file-download-border"></Button>
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
            <div class="_min_height_100" :style="{minHeight:table_height-100+'px'}">
                <Spin v-if="loading"
                      fix></Spin>
                      <!-- @current-change="clickRow"
                        @contextmenu.native.prevent="$copyTableCellValue"
                        @checkbox-all="handleSelectAll"
                        @checkbox-change="handleSelectionChange" -->
                <!-- v-show="initTable" -->
                <div class="table">
                    <!-- v-if="refreshColumnFlag" -->
                    <vxe-table
                        v-if="refreshColumnFlag"
                        :height="table_height"
                        :row-config="{useKey: true, keyField: 'id', isCurrent: true, isHover: true}"
                        ref="clueTable"
                        :checkbox-config="{highlight: true, reserve: true}"
                        stripe
                        :data="allreportdata"
                        :isCustom="true"
                        @cell-click="clickRow"
                        @contextmenu.native.prevent="$copyTableCellValue"
                        @checkbox-all="handleSelectAll"
                        @checkbox-change="handleSelectAll"
                        @resizable-change="handleTableColResizeEndVxeTable"
                        show-overflow
                        :scroll-y="{enabled: true, gt: 20}"
                        :scroll-x="{enabled: true, gt: 10}"
                        :column-config="{resizable: true}"
                        class="tabmain">
                        <!-- v-show="initTable" -->
                            <vxe-column
                                width="48"
                                align="left"
                                fixed
                                type="checkbox"
                                :reserve-selection="true">
                            </vxe-column>
                            <template v-for="(item, index) in currentColumns">
                                <vxe-column
                                    v-if="!item.customSettings"
                                    :key="item.key"
                                    :align="item.align"
                                    :field="item.key"
                                    :title="item.title"
                                    :width="item.width"
                                    show-overflow="tooltip">
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
                                                @update_showPopper="(val) => update_showPopper(val, index)"
                                                @updateList="(checkAll) => updateList(checkAll, column)">
                                            </FilterBox>
                                        </div>
                                    </template>
                                    <template #default="{ row, rowIndex }">
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
                                            <div slot="reference" @click.stop class="show-fb-lead-poptip">{{ row[item.key] || '-' }}</div>
                                        </Poptip>
                                        <template v-else>
                                            <!-- wa 列, 点击打开 wa 回复框 -->
                                            <span v-if="item.key === 'a10052' && row[item.key] && !is_marketing_station"
                                                  @click.stop="openGlobalWaReplyModal(row[item.key], $event)"
                                                  class="table-show-contant header-source">{{ row[item.key] || '-' }}</span>
                                            <a v-else-if="item.key === 'a10010'"
                                               class="table-show-contant ct_email"
                                               href="javascript:void(0)"
                                               @click.stop="quickSend(row)" >{{ row[item.key] || '-' }}</a>
                                            <!-- 其他正常列 -->
                                            <span v-else-if="item.formatter"
                                                  class="table-show-contant">{{ (item.formatter)(row, item, row[item.key]) }}</span>
                                            <span v-else
                                                  class="table-show-contant">{{ row[item.key] || '-' }}</span>

                                            <!-- 编辑按钮 -->
                                            <span class="table-edit-btn" v-show="item.isOnlyRead !== 1 && item.isOnlyRead !== 2 && edit_btn" @click.stop @click="handleClickEdit(item,row, rowIndex, $event)">
                                                <Tooltip placement="top" content="编辑">
                                                    <a href="javascript:void(0)" class="table-show-edit custom custom-bianji-normal"></a>
                                                </Tooltip>
                                            </span>
                                        </template>
                                    </template>
                                </vxe-column>
                                <vxe-column
                                    v-else-if="item.key === 'conversionStatus'"
                                    :field="item.key"
                                    :title="item.title"
                                    :show-overflow="index % 10 === 0"
                                    :width="item.width"
                                    :key="item.key">
                                        <template #default="{ row, rowIndex}">
                                            <div class="positoon-relative">
                                                <div class="audience_icon_wrap" v-if="row.conversionStatus">
                                                    <span style="display:table-cell;">
                                                        <img :src="String(row.conversionStatus) === '1'? `${publicPath}image/googleReview.png` : `${publicPath}image/isFromGoogle.png`">
                                                    </span>
                                                </div>
                                                <span class="table-show-contant" v-else> - </span>
                                                <span @click.stop v-show="item.isOnlyRead !== 1 && item.isOnlyRead !== 2 && edit_btn" @click="handleClickEdit(item,row, rowIndex, $event)">
                                                    <Tooltip placement="top" content="编辑">
                                                        <a href="javascript:void(0)" class="table-show-edit custom custom-bianji-normal"></a>
                                                    </Tooltip>
                                                </span>
                                            </div>
                                        </template>
                                </vxe-column>
                            </template>
                            <vxe-column
                                width="40"
                                fixed="right"
                                align="center"
                                :resizable="false"
                                class-name="no-padding-cell">
                                    <template slot="header">
                                        <i class="custom custom-table-edit-columns" style="font-size: 18px" @click="visible_edit_columns = true"></i>
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
                        <div class="pagewrap">
                            <Page
                                ref="page"
                                :total=" totalpage"
                                :page-sizes="pagesizeopts"
                                :current-page="curPage"
                                :pageSize="pagesize"
                                layout="total, prev, pager, next, sizes, jumper"
                                placement="top"
                                @size-change="sizeChange"
                                @current-change="changePage">
                            </Page>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
         <Poptip ref="editPopover"
            :popper-class="['a10013'].includes(checkedColumn.key) ? 'table-edit-box-popper cule-table-edit-box-popper socialNetworkingPlatform' :'table-edit-box-popper cule-table-edit-box-popper'"
            v-model="visibleEdit"
            placement="left"
            :visible-arrow="false"
            :reference="prevTarget"
            :key="popperFlag"
            :width="checkedColumn.width"
            @hide="clearEditPopperComponent"
            :popper-options="popperOptions"
        >
            <div class="table-edit-box">
                <Form
                    class="table-edit-form"
                    inline
                    :validate-on-rule-change="false"
                    label-position="left"
                    label-width="90px"
                >
                    <clueInputArea ref="clueInputArea"
                        :detailInfo.sync="detailInfo"
                        :fieldsList.sync="corp_item_all"
                        :countryAreaName.sync="countryAreaName"
                        :error_countryArea.sync="error_countryArea"
                        :socialNetworkingPlatform.sync="socialNetworkingPlatform"
                        from="myClue"
                        @verifyEmail="verifyEmail"
                        @verifyPhone="verifyPhone"
                        @verifyWA="verifyWA"
                        ></clueInputArea>
                </Form>
                <div class="table-edit-box-buttons">
                    <Button @click="clearEditPopperComponent" type="text">{{ $t('crm.Modal.modal_cancel') }}</Button>
                    <Button type="text" @click="ok" class="table-edit-box-button-sure" :disabled="tableEditLoading">{{ $t('crm.Modal.modal_ok') }}</Button>
                </div>
            </div>
        </Poptip>
        <!-- 新增线索 -->
        <ClueModal
            v-model="clueModal"
            :title="$t('clue.add_clue')"
            class="modal companydata"
            :delLoading="delLoading"
            :json_data="json_data"
            :saveClueClass="'my-clue-enter-clue'"
            :saveClueAndInquiryClass="'my-clue-save-clue-and-inquiry'"
            :okEnterInquiryClass="'my-clue-enter-inquiry'"
            @on_cancle_clue="on_cancle_clue"
            @open_close="open_close">
        </ClueModal>
        <!-- 修改字段 -->
        <EditColumns
            :visible.sync="visible_edit_columns"
            :columnType="columnType"
            :id.sync="id_column_show_order"
            :allColumns="allColumns"
            :allGroup="allGroup"
            :group.sync="group">
        </EditColumns>
        <!-- 线索详情侧边栏 -->
        <ClueDrawerList
            :visible.sync ="show_clue_detail"
            type="clue"
            :originalType="'clue'"
            :clueId.sync="clueId"
            :listType="listType"
            @refreshData="refreshData"
            @chownSuccess="transferCompleted">
        </ClueDrawerList>

        <!-- 转移线索 -->
        <TransferClue
            :visible.sync="visible_transfer_clue"
            :selectLength="selected_clues.length"
            :clueIds="transferClueData.map(item => item.id)"
            :createUserId="transferClueData.map(item => item.createUserId)"
            :serviceId="transferClueData.map(item => item.serviceId)"
            @invoking="invoking"
            :confirmClass="'clue-batch-transfer-leads'"
            @chownSuccess="transferCompleted">
        </TransferClue>
        <!-- 退入公海 -->
        <goSeaClue
            :visible.sync="visible_goSea_clue"
            :selectIds="backHighSeasList.map(item => item.id)"
            @chownSuccess="transferCompleted"></goSeaClue>
        <!-- 导出数据 -->
        <ImportData
            v-show="importDataShow"
            :userId="userId"
            @refreshData="refreshData"
            :visible.sync="importDataShow">
        </ImportData>
        <!-- 重复模态框 -->
        <checkRepeatModal
            v-if="isEmailRepeat"
            :title="checkRepeatModalTitle"
            :repeatData="repeatData"
            :flag="enterFlag"
            :visible.sync="isEmailRepeat"
            @okEnter="handleSaveClue"
            @cancelEnter="cancelEnter"
        ></checkRepeatModal>
        <!-- 群发单显&发送WhatsApp -->
        <contactSelectionBox type="clue"
            originalType="clue"
            :sendType="sendType"
            :visible.sync="visible_contact_selectionBox"
            :ids="selected_clues.map(item => item.id)"
            :fieldColumns="fieldColumns"
            @refreshData="clearSelectedClues"></contactSelectionBox>
    </div>
</template>

<script>
    import Invoking from '@/mixins/invoking.js';
    import util from '@/libs/util';
    import Utils from '@/utils/index';
    import Cookies from 'js-cookie';
    import resetInitComponents from '@/mixins/resetComponentViewData';
    import tableColResize from '@/mixins/tableColResize';
    import tableQuickEdit from '@/mixins/tableQuickEdit';
    import globalWaReplyModal from '@/mixins/globalWaReplyModal';
    import { mapState, mapGetters } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS, DIRECT_CREATE, TOP_FILTER_ITEM } from '@/api/config';
    import contactSelectionBox from '@/views/crm/Table/Components/Modal/contactSelectionBox';
    import tableBatchHandle from '@/mixins/tableBatchHandle';
    // import { getUpperLengthLimit } from '@/api/upperLengthLimit.js';
    import { crmClue } from '@/api/crm';
    import { crmCommon } from '@/api/crm/index';
    // import ImportData from '@/views/clue-manage/Detail/Components/Modal/importData';
    const ImportData = () => import('@/views/clue-manage/Detail/Components/Modal/importData');
    // import ClueModal from '@/views/main-components/enter-clue/enter-clue';
    const ClueModal = () => import('@/views/main-components/enter-clue/enter-clue');
    // import ClueDrawerList from '@/views/clue-manage/Detail/ClueDrawerList';
    const ClueDrawerList = () => import('@/views/clue-manage/Detail/ClueDrawerList');
    // import TransferClue from '@/views/clue-manage/Detail/Components/Modal/transferClue';
    const TransferClue = () => import('@/views/clue-manage/Detail/Components/Modal/transferClue');
    // import goSeaClue from '@/views/clue-manage/Detail/Components/Modal/goSeaClue';
    const goSeaClue = () => import('@/views/clue-manage/Detail/Components/Modal/goSeaClue');
    // import FilterTags from '@/views/main-components/filter-tags';
    const FilterTags = () => import('@/views/main-components/filter-tags');
    // import EditColumns from '@/views/crm/Table/Components/Modal/editColumns';
    const EditColumns = () => import('@/views/crm/Table/Components/Modal/editColumns');
    // import TopFilter from '@/views/crm/Table/Components/Html/topFilter';
    const TopFilter = () => import('@/views/crm/Table/Components/Html/topFilter');
    // import clueInputArea from '@/views/clue-manage/Detail/Components/Modal/clue-input-area';
    const clueInputArea = () => import('@/views/clue-manage/Detail/Components/Modal/clue-input-area');
    // import checkRepeatModal from '@/views/main-components/enter-clue/Components/check-repeat-modal';
    const checkRepeatModal = () => import('@/views/main-components/enter-clue/Components/check-repeat-modal');
    
    const addChangeCon1 = function(index) {
        this.addCondition[index].condition2 = '';
        this.addCondition[index].condition3 = '';
        const key = this.addCondition[index].condition1;
        let tempAllUsers;
        switch (key) {
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
            case 'conversionStatus':
            case 'source':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.select
                ];
                this.addCondition[index].conditionList3 = this.config_tableFilter[key].allList;
                this.addCondition[index].inputType = TOP_FILTER_ITEM.select[0].childrenType;
                break;
            case 'createUser':
            case 'saleName':
            case 'serviceName':
                this.addCondition[index].conditionList2 = [
                    ...TOP_FILTER_ITEM.select
                ];
                tempAllUsers = this.allUsers.map(item => {
                    return {
                        label: item.fullname,
                        value: key === 'serviceName' ? item.fullname : item.id
                    };
                });
                // 创建人默认询盘云
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
                const temp = this.allColumns.find(item => item.key === this.addCondition[index].condition1);
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
                            this.addCondition[index].condition3 = '';
                    }
                }
                break;
        }
    };
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
            case 'createUser':
            case 'saleName':
            case 'serviceName':
            case 'status':
            case 'conversionStatus':
            case 'source':
                this.addCondition[index].inputType = TOP_FILTER_ITEM.select.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                this.addCondition[index].condition3 = '';
                if (this.addCondition[index].inputType === 'array') {
                    this.addCondition[index].condition3 = [];
                }
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
                            this.addCondition[index].condition3 = '';
                            if (this.addCondition[index].inputType === 'array') {
                                this.addCondition[index].condition3 = [];
                            }
                            break;
                        case 'number':
                            this.addCondition[index].inputType = TOP_FILTER_ITEM.number.find((v, i) => this.addCondition[index].condition2 === v.value).childrenType;
                            this.addCondition[index].condition3 = '';
                            if (this.addCondition[index].inputType === 'numberRange') {
                                this.addCondition[index].condition3 = [];
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
        name: 'my_clue',
        mixins: [Invoking, resetInitComponents, tableColResize, tableQuickEdit, globalWaReplyModal, tableBatchHandle],
        components: {
            ImportData,
            ClueModal,
            ClueDrawerList,
            FilterTags,
            TransferClue,
            goSeaClue,
            EditColumns,
            clueInputArea,
            checkRepeatModal,
            TopFilter,
            contactSelectionBox
        },
        data() {
            return {
                // 新版筛选所需参数----Start
                title_topFilter: this.$t('clue.all_clue'),
                flag_topFilter: false,
                type_topFilter: '',
                addChangeCon1: addChangeCon1,
                addChangeCon2: addChangeCon2,
                // 新版筛选所需参数----End
                refreshColumnFlag: true,
                /* 多选操作 */
                selected_clues: [], // 已选中的线索 ID
                allchecked: false,
                allCheckedPageList: [],
                /* 转移 */
                visible_transfer_clue: false,
                publicPath: process.env.BASE_URL,
                importDataShow: false, /* 导出数据 */
                clueModal: false, // 线索框状态
                delLoading: false, // 弹出框loading
                json_data: {},
                loading: true, // 加载图标
                initTable: false,
                currentColumns: [], // 表格列名称
                allColumns: [], // 表格全部列
                totalpage: 0,
                allreportdata: [], // 线索列表数据
                curPage: 1,
                pagesize: 20,
                pagesizeopts: [20, 50, 100],
                templateId: '',
                allGroupTemp: [], // 修改字段：所有字段
                conditionList1: [], // 筛选字段：字段列表
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
                filtering: false, /* 筛选状态 */

                /** 表头筛选 */
                order_column: localStorage.getItem('clue_order_column') ? localStorage.getItem('clue_order_column') : '', /* 排序列 */
                order_type: localStorage.getItem('clue_order_type') ? localStorage.getItem('clue_order_type') : '', /* 排序类型  asc desc */
                storageName_orderColumn: localStorage.getItem('clue_storageName_orderColumn') ? localStorage.getItem('clue_storageName_orderColumn') : '',
                queryData: {
                    $and: []
                },
                // 表头筛选条件
                sqlList_tableFilter: {},
                // 由后端返回 统一处理了，此处的值可删除
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
                    },
                    sourceUrl: {
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
                        query: '',
                        selectAll: true, // 增加选项 全选
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
                        query: '',
                        allList: null
                    },
                    editTime: {
                        sort: true,
                        filter: true,
                        filterType: 'date',
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
                    // 客服人员
                    serviceName: {
                        sort: true,
                        filter: true,
                        filterType: 'select',
                        query: '',
                        selectAll: true, // 增加选项 全选
                        blank: true, // 增加选项-空(未填写)
                        allList: []
                    },
                    saleName: {
                        sort: true,
                        filter: true,
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
                    trafficSource: {
                        sort: false,
                        filter: false,
                        filterType: 'select',
                        selectAll: true, // 增加选项 全选
                        blank: true, // 增加选项-空(未填写)
                        query: '',
                        allList: []
                    },
                    // 线索等级 多选字段
                    clueClass: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        query: [], // 筛选值
                        allList: [] // 所有可能的筛选条件
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
                        // noBlank: true,
                        selectAll: true, // 增加选项 全选
                        blank: true, // 增加选项-空(未填写)
                        query: [], // 筛选值
                        allList: [] // 所有可能的筛选条件
                    },
                    a10019: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        // noBlank: true,
                        selectAll: true, // 增加选项 全选
                        blank: true, // 增加选项-空(未填写)
                        query: [], // 筛选值
                        allList: [] // 所有可能的筛选条件
                    },
                    a10020: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型
                        // noBlank: true,
                        selectAll: true, // 增加选项 全选
                        blank: true, // 增加选项-空(未填写)
                        query: [], // 筛选值
                        allList: [] // 所有可能的筛选条件
                    },
                    a10021: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        // noBlank: true,
                        blank: true, // 增加选项-空(未填写)
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
                    },
                    whatsApp: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型
                        // noBlank: true,
                        blank: true, // 增加选项-空(未填写)
                        query: '', // 筛选值
                        allList: null // 所有可能的筛选条件
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
                    sourceUrl: this.$t('clue.first_visit_url'),
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
                    clueClass: this.$t('crm.InqSet.corp_leadLevel')
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
                columnType: 5, /* 1客户2联系人3询盘4公海客户5线索6公海线索 7fbleads */
                id_column_show_order: undefined,
                group: [], // 获取到当前表格的表头显示项列表
                // 保存到后端的字段属性, 目前只有 width
                fieldStyle: {},
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
                /* drawer */
                clueId: '',
                show_clue_detail: false,
                // 列表编辑
                tableScollListener: null,
                tableEditLoading: false, // 提交按钮
                detailInfo: {}, // 选中的列
                socialNetworkingPlatform: [], // 社交平台处理
                oldEmail: '',
                oldPhone: '', // 判断手机是否被改
                oldWA: '', // 判断WA是否被改
                allFieldsList: [],
                corp_item_all: [],
                checkedColumn: {
                    width: '',
                    key: ''
                },
                isEmailRepeat: false,
                checkRepeatModalTitle: this.$t('clue.emailOrPhoneRepeat'),
                enterFlag: 'saveClue',
                repeatData: {
                    clueEmail: null,
                    contactEmail: null,
                    cluePhone: null,
                    contactPhone: null,
                    clueWA: null,
                    contactWA: null
                },
                columnPos: 15,
                showColums: [],
                dom: '',
                countryAreaName: '', // 国家地区code编译之后的名称
                error_countryArea: false,
                visible_goSea_clue: false, // 退入公海
                backHighSeasList: [], // 退入公海的数据
                status: '',
                googleMarketingMd5: '', // 仪表盘 google营销转化表跳转过来所携带的参数
                transferClueData: []
            };
        },
        computed: {
            ...mapState({
                clue_scroll_top: state => state.clue.clue_scroll_top,
                clue_scroll_left: state => state.clue.clue_scroll_left,
                button_list: state => state.app.button_list,
                is_marketing_station: state => state.app.is_marketing_station,
                listType: state => state.clue.listType,
                lang: state => state.app.lang,
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                window_height: 'window_height',
                allUsers: state => state.crm.allUsers,
                salesList: state => state.crm.salesList,
                selectOptions: state => state.crm.selectOptions,
                showUniq: state => state.crm.showUniq,
                email_duplicate_check: (state) => state.crm.email_duplicate_check
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            table_height() {
                let temp = this.window_height ? this.window_height - 179 : document.body.clientHeight - 179;
                if (temp < 200) {
                    temp = 200;
                }
                // 转 element-ui 时, 表格样式错误, 加上这句后解决, 具体错误原因暂时未看
                temp += this.loading ? 1 : 0;
                return temp;
            },
            // 我的线索还是全部线索
            show_list_type() {
                switch (this.listType) {
                    case 2:
                        return this.$t('clue.my_clue');
                    case 3:
                        return this.$t('clue.all_clue');
                    default:
                        return this.$t('clue.my_clue');
                }
            },
            computed_sqlList_tableFilter() {
                return Object.entries(this.sqlList_tableFilter).map(([key, val]) => {
                    const temp = {};
                    // 数组型 - 日期型 - 字符串型/国家地区
                    if (Object.prototype.hasOwnProperty.call(val, '$or')) {
                        temp.$or = val.$or;
                    } else if (Object.prototype.hasOwnProperty.call(val, '$and')) {
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
            // 转换筛选条件数组
            computed_addCondition() {
                return this.addCondition.filter(item => item.condition1 && item.condition2 && ((item.condition3 && item.condition3.length) || item.condition3 instanceof Date || (typeof item.condition3 === 'number' && !isNaN(item.condition3)))).map(item => {
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
                            temp[con] = {};
                            temp[con][type] = item.condition3;
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
                            // 多选 包含全部 与不包含全部处理 单选不包含任意
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
                            return temp;
                    }
                }).filter(item => !(!item || item === ''));
            },

            import_data_btn() {
                return !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.import_data, this.button_list);
            },
            export_data_btn() {
                return !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.export_data, this.button_list);
            },
            add_clue_btn() {
                return !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.add_clue, this.button_list);
            },
            transfer_clue_btn() {
                return !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.transfer_batch, this.button_list);
            },
            go_sea_btn() {
                return !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.go_sea, this.button_list);
            },
            edit_btn() {
                return !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.edit, this.button_list);
            },
            sendWhatsAppBtn() {
                return !HANDLE_BUTTON(BUTTON_IDS.WhatsApp.WA_Group_Btn_List.personGroupSend, this.button_list) || !HANDLE_BUTTON(BUTTON_IDS.WhatsApp.WA_Group_Btn_List.ApiGroupSend, this.button_list);
            },
            allGroup() {
                return this.allColumns.map(item => item.key);
            },
            // 处理社交平台字段
            platFormFlag() {
                return this.socialNetworkingPlatform.filter(item => {
                    item.account = item.account.trim();
                    if (item.type !== '' && item.account !== '') {
                        return {
                            type: item.type,
                            account: item.account
                        };
                    }
                });
            }
        },
        created: function() {
            this.$store.commit('setListType', 2);
            // 获取常用检索条件
            // this.get_commonSearch();
            // 获取 下拉选项数据 /crm/attr/getField
            this.$store.dispatch('getSelectOptions');
            // 获取全部用户
            this.$store.dispatch('getAllUsers');
            // 获取全部销售人员
            this.$store.dispatch('getSalesList');
            this.loading = true;
            this.$nextTick(() => {
                this.getClueFrontList();
            });
        },
        mounted() {
            this.$nextTick(() => {
                let tt = setInterval(() => {
                    if (this.$refs.clueTable) {
                        clearInterval(tt);
                        this.dom = this.$refs.clueTable.$el.querySelector('.vxe-table--body-wrapper') ;
                        let that = this;
                        this.dom.addEventListener('scroll', () => {
                            // 滚动距离
                            let scrollLeft = this.dom.scrollLeft;
                            // 变量windowWidth是可视区的宽度
                            let windowWidth = this.dom.clientWidth || this.dom.clientWidth;
                            // 变量scrollWidth是滚动条的总宽度
                            let scrollWidth = this.dom.scrollWidth || this.dom.scrollWidth;
                            if (scrollLeft + windowWidth === scrollWidth) {
                                if (that.showColums.length < that.currentColumns.length) that.getMoreLog();
                            }
                        });
                    }
                }, 1000);
            });
        },
        beforeDestroy() {
            this.show_clue_detail = false;
            this.clueId = '';
            if (document.getElementsByClassName('single-page')[0]) {
                document.getElementsByClassName('single-page')[0].removeEventListener('click', this.click_blank);
            }
            if (this.tableScollListener) {
                this.tableScollListener.removeEventListener('scroll', function() {});
            }
            if (this.dom) {
                this.dom.removeEventListener('scroll', function() {});
            }
        },
        methods: {
            HANDLE_BUTTON,
            tableAddScroll() {
                // let tt = setInterval(() => {
                //     if (this.$refs.clueTable) {
                //         clearInterval(tt);
                //         this.dom = this.$refs.clueTable.bodyWrapper;
                //         let that = this;
                //         this.dom.addEventListener('scroll', () => {
                //             // 滚动距离
                //             let scrollLeft = this.dom.scrollLeft;
                //             // 变量windowWidth是可视区的宽度
                //             let windowWidth = this.dom.clientWidth || this.dom.clientWidth;
                //             // 变量scrollWidth是滚动条的总宽度
                //             let scrollWidth = this.dom.scrollWidth || this.dom.scrollWidth;
                //             if (scrollLeft + windowWidth === scrollWidth) {
                //                 if (that.showColums.length < that.currentColumns.length) that.getMoreLog();
                //             }
                //         });
                //     }
                // }, 1000);
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
            async updateList(checkAll, column) {
                const temp = this.config_tableFilter[column.field];
                temp.checkAll = checkAll; // 是否勾选【全选】
                if (temp) {
                    /* 处理筛选 */
                    // 判断是否有值, 调整 sqlList
                    const con = this.getSearchCon(column.field);
                    await this.handleTableSearch(temp, column.field, column, con);
                    this.selected_clues = [];
                    this.allchecked = false;
                    this.allCheckedPageList = [];
                    /* 刷新列表 */
                    await this.merge_query_list();
                    this.changePage(1);
                    this.clearSelectedClues();
                }
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
            getMoreLog() {
                // debugger
                this.showColums = this.showColums.concat(this.currentColumns.slice(this.columnPos, this.currentColumns.length));
                // this.showColums.push(this.currentColumns[this.columnPos]);
                // this.columnPos++;
            },
            /** 判断一个字符串是不是 json JSON.parse转换判断不报错的，再除去特殊情况 特殊:'null' '数字' 'true/false' */
            isJSON_test(str) {
                if (typeof str === 'string') {
                    if (str === 'null') {
                        return false;
                    }
                    try {
                        const obj = JSON.parse(str);
                        if (typeof obj === 'object') {
                            return true;
                        } else {
                            return false;
                        }
                    } catch (e) {
                        return false;
                    }
                } else {
                    return false;
                }
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
            // 获取客服列表
            setAllUsers() {
                const createUserArr = this.allUsers.map(item => {
                    return { value: item.id, label: item.fullname };
                });
                // 录入人员查询增加询盘云字段
                createUserArr.unshift({
                    value: -2, label: '询盘云'
                });
                this.$set(this.config_tableFilter.createUser, 'allList', createUserArr);
                this.$set(this.config_tableFilter.serviceName, 'allList', this.allUsers.map(item => {
                    return { value: item.fullname, label: item.fullname };
                }));
            },
            /* 从vuex拿销售列表 处理页面应用 */
            setSaleList() {
                this.config_tableFilter.saleName.allList = this.salesList.map(item => {
                    return {
                        label: item.fullname,
                        value: item.id
                    };
                });
            },
            /** 获取线索表头显示字段接口 */
            getXSShow() {
                return new Promise((resolve, reject) => {
                    crmClue.getXSShow({
                        userId: this.userId,
                        orgId: this.enterpriseId
                    }).then(res => {
                        if (res.code === '1') {
                            return resolve(res);
                        } else {
                            this.$Message.error(this.$t('clue.getXSShowFail'));
                            return resolve(null);
                        }
                    }).catch(error => {
                        console.log(error);
                        if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                            this.$Message.error(this.$t('clue.getXSShowFail'));
                        }
                        return resolve(null);
                    });
                });
            },
            // 通过访客id合集获取访客来源类别 -- 后端无法直接返回，需要额外调接口去拼接数据
            getAllAdDetail(visitorIdList) {
                return new Promise((resolve, reject) => {
                    crmClue.getAdDetailList({
                        visitorIdList
                    }).then(res => {
                        if (res.code === '1') {
                            return resolve(res.data);
                        } else {
                            this.$Message.error(this.$t('clue.getAdDetailListFail'));
                            return reject(null);
                        }
                    }).catch(error => {
                        if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                            this.$Message.error(this.$t('clue.getAdDetailListFail'));
                        }
                        return reject(null);
                    });
                });
            },
            //  根据国家编码获取国家地区
            getCountrys(list) {
                return new Promise((resolve, reject) => {
                    crmClue.getNamesByList({
                        list,
                        lang: this.lang
                    }).then(res => {
                        if (res.code === '1') {
                            resolve(res.data);
                        } else {
                            resolve(list);
                        }
                    });
                });
            },
            // 获取询盘编号 --- 后端无法直接返回，需要额外调接口去拼接数据
            getInquiryNum(clueIds) {
                return new Promise((resolve, reject) => {
                    crmClue.getInquirySeqList({
                        clueIdList: clueIds
                    }).then((res) => {
                        resolve(res.data);
                    });
                });
            },
            // 获取线索列表数据 --- 列表数据、title数组（title:[] 待后台查询什么作用，再商量要不要去掉）
            // getclueColumnList(searchData = this.queryData, startDate, endDate) {
            //     const data = {
            //         orgId: this.enterpriseId,
            //         userId: this.userId,
            //         listType: this.listType,
            //         templateId: this.templateId,
            //         pageSize: this.pagesize,
            //         pageNo: this.curPage,
            //         orderColumn: this.toLine(this.order_column),
            //         orderType: this.order_type,
            //         query: JSON.stringify(searchData),
            //         startDate: startDate,
            //         endDate: endDate
            //     };
            //     return new Promise((resolve, reject) => {
            //         crmClue.getColumnValueList(data).then(res => {
            //             if (res.code === '1') {
            //                 return resolve(res);
            //             } else {
            //                 return resolve(null);
            //             }
            //         }).catch(error => {
            //             console.log(error);
            //             this.loading = false;
            //             if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
            //                 // this.$Message.error(this.$t('crm.Table.error_save'));
            //             }
            //         });
            //     });
            // },
            closeGoogleMarketingSearch() {
                localStorage.removeItem('dashboard_clue_filter_googleMarketing');
                this.googleMarketingMd5 = '';
                this.curPage = 1;
                this.refreshData()
            },
            // 获取线索列表数据 --- 列表数据、title数组（title:[] 待后台查询什么作用，再商量要不要去掉）
            getClueList(searchData = this.queryData) {
                const data = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    listType: this.listType,
                    templateId: this.templateId,
                    pageSize: this.pagesize,
                    pageNo: this.curPage,
                    orderColumn: this.toLine(this.order_column),
                    orderType: this.order_type,
                    query: JSON.stringify(searchData),
                    status: this.status,
                    md5: this.googleMarketingMd5 ? this.googleMarketingMd5 : null
                };
                return new Promise((resolve, reject) => {
                    crmClue.getClueList(data).then(res => {
                        this.initTable = true;
                        if (res.code === '1') {
                            return resolve(res);
                        } else {
                            return resolve(null);
                        }
                    }).catch(error => {
                        console.log(error);
                        if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                            // this.$Message.error(this.$t('crm.Table.error_save'));
                        }
                    });
                });
            },
            // ================================================== 已整理
            // 列表上方的相关操作
            // 切换我的线索或全部线索
            changeMyClueOrAllClue(command) {
                this.selected_clues = [];
                this.$store.commit('setListType', Number(command));
            },

            /* 转移的相关操作 */
            // 指定表格行数据 key
            getRowKey(row) {
                return row.id;
            },
            // 表格表头单元格 class 方法
            headerCellClass({ column }) {
                const result = [];
                // 如果可调整列宽, 则设置相应 class
                if (column.resizable) {
                    result.push('resizable-col');
                }

                // 有 tip 提示的 column , 指定特殊 class , 修改 cell 的 padding 以容纳 tip 和筛选按钮
                if (['conversionStatus', 'trafficSource'].includes(column.property)) {
                    const filterSet = this.config_tableFilter[column.property];
                    if (filterSet && filterSet.filter) {
                        result.push('hasTipAndFilterCell');
                    }
                }

                return result.join(' ');
            },
            // 全选
            handleSelectAll({ records, reserves }) {
                const selection = records.concat(reserves);
                if (selection.length > 0) {
                    this.selected_clues = selection.map(item => {
                        return {
                            id: item.id,
                            status: item.status,
                            createUserId: item.createUserId,
                            serviceId: item.serviceId
                        };
                    });
                } else {
                    this.selected_clues = [];
                }
            },
            // 多选
            handleSelectionChange(selection) {
                if (selection.length > 0) {
                    this.selected_clues = selection.map(item => {
                        return {
                            id: item.id,
                            status: item.status,
                            createUserId: item.createUserId,
                            serviceId: item.serviceId
                        };
                    });
                } else {
                    this.selected_clues = [];
                }
            },
            // 清除选中的线索
            clearSelectedClues() {
                this.$refs.clueTable.clearCheckboxRow();
                this.selected_clues = [];
                this.allchecked = false;
                this.allCheckedPageList = [];
                this.backHighSeasList = [];
                this.transferClueData = [];
            },

            // 点击转移按钮显示转移线索模态框
            transferClue() {
                // if (this.selected_clues.find(item => item.status === this.$t('clue.inquiry'))) {
                //     this.$Message.error('当前已选中线索中有线索已录入询盘, 请取消勾选此类线索');
                // } else {
                //     this.visible_transfer_clue = true;
                // }
                this.transferClueData = this.selected_clues.filter((item) => item.status !== this.$t('clue.inquiry'));
                if (this.transferClueData.length) {
                    this.visible_transfer_clue = true;
                } else {
                    this.$Message.warning(this.$t('clue.transferClueTip'));
                }
            },
            //  转移成功
            transferCompleted() {
                this.clearSelectedClues();
                this.refreshData();
            },

            // 退入公海
            goSeaClue() {
                this.backHighSeasList = this.selected_clues.filter((item) => item.status !== this.$t('clue.inquiry'));
                if (this.backHighSeasList.length > 0) {
                    this.visible_goSea_clue = true;
                } else {
                    this.$Message.error(this.$t('clue.goSeaErrorTip'));
                }
            },

            /* 新增线索的相关操作 */
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

            // 下载
            exportData() {
                if (!Cookies.get('token')) {
                    util.jump_to_login(this.$t('tokenExpired'), () => {
                        // 追加错误信息到 localStorage , 跳转到登录页之后打印错误信息, 并清除此 localStorage
                        let quitReason = localStorage.getItem('quitUnexpectedlyReason') || '';
                        quitReason += 'noToken: myClue exportData;';
                        localStorage.setItem('quitUnexpectedlyReason', quitReason);
                    });
                } else if (!this.userId || !this.enterpriseId) {
                    this.$Message.error(this.$t('downloadFail'));
                } else {
                    // 限制半个小时之后可点击
                    const date = new Date();
                    const time = date.getTime();
                    let storageDate = JSON.parse(localStorage.getItem('clueDownloadTime')) || null;

                    if (storageDate) {
                        const date2 = time - storageDate;
                        const dateMath = Math.floor(date2 / (60 * 1000));
                        if (dateMath < 30) {
                            this.$Message.error('30分钟之内不可重复导出数据');
                            return;
                        } else {
                            storageDate = time;
                        }
                    } else {
                        storageDate = time;
                    }
                    localStorage.setItem('clueDownloadTime', JSON.stringify(storageDate));

                    const query = this.queryData ? encodeURIComponent(JSON.stringify(this.queryData)) : '';

                    /**
                     * @Date: 2020-06-08 17:44:40
                     * @LastEditors: niumkiki
                     * @description: 增加一个新接口，给后端返回前端显示的字段及字段顺序，还有非显示字段
                     * @param :
                     * @return:
                     */
                    const sortedShowFieldVal = []; // 显示的字段名称
                    const sortedHideFieldKey = []; // 隐藏的字段key
                    const sortedHideFieldVal = []; // 隐藏的字段名称
                    const sortedShowFieldKey = []; // 显示的字段key
                    // 获取隐藏字段
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
                    tempAllField.forEach(item => {
                        sortedHideFieldKey.push(item.key);
                        sortedHideFieldVal.push(item.title);
                    });
                    // util.ajaxJson({
                    //     url: 'http://192.168.74.112:7086/form-cust/clue/downloadExcelV2',
                    //     method: 'post',
                    //     data: {
                    //         pageSize: 100,
                    //         pageNo: 1,
                    //         userId: this.userId,
                    //         orgId: this.enterpriseId,
                    //         listType: this.listType,
                    //         templateId: this.templateId,
                    //         sortedShowFieldKey: sortedShowFieldKey,
                    //         sortedShowFieldVal: sortedShowFieldVal,
                    //         sortedHideFieldKey: sortedHideFieldKey,
                    //         sortedHideFieldVal: sortedHideFieldVal
                    //     }
                    // }).then(response => {
                    //     console.log(response);
                    // });
                    // 减缓后端压力 前端分页下载多个文件
                    const lastIdTag = new Date().getTime();
                    if (this.totalpage > 60000) {
                        const lists = Math.ceil(this.totalpage / 60000);
                        for (let i = 0; i < lists; i++) {
                            setTimeout(() => {
                                const url = `${util.ajaxUrl}/form-cust/clue/downloadExcelV2?pageSize=60000&pageNo=${i + 1}&listType=${this.listType}&userId=${this.userId}&orgId=${this.enterpriseId}&status=${this.status}&templateId=${this.templateId}&query=${query}&sortedShowFieldKey=${sortedShowFieldKey}&sortedShowFieldVal=${encodeURIComponent(sortedShowFieldVal)}&sortedHideFieldKey=${sortedHideFieldKey}&sortedHideFieldVal=${encodeURIComponent(sortedHideFieldVal)}&lastIdTag=${lastIdTag}`;
                                this.$stm.openNewWindow(url);
                            }, i * 1000);
                        }
                    } else {
                        const url = `${util.ajaxUrl}/form-cust/clue/downloadExcelV2?pageSize=60000&pageNo=1&listType=${this.listType}&userId=${this.userId}&orgId=${this.enterpriseId}&status=${this.status}&templateId=${this.templateId}&query=${query}&sortedShowFieldKey=${sortedShowFieldKey}&sortedShowFieldVal=${encodeURIComponent(sortedShowFieldVal)}&sortedHideFieldKey=${sortedHideFieldKey}&sortedHideFieldVal=${encodeURIComponent(sortedHideFieldVal)}&lastIdTag=${lastIdTag}`;
                        this.$stm.openNewWindow(url);
                    }
                }
            },

            // ==================================================================================
            /* 列表相关 */
            /* 筛选 */
            // 设定初始筛选条件
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
                                        result.$regex = val.map(item => item.value);
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
                                                type = '$eq';
                                                break;
                                            case 'createUser':
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
                                            // temp[con][type] = item.value;
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
            // 表头筛选方法
            async handleTableSearch(temp, key, column, con) {
                if (temp.query.length) {
                    const result = {};
                    let type = '$regex';
                    const start = {};
                    const end = {};
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
                                    // 表头筛选中只能有单个选项值的(单选型字段 + 创建人这种表格才有的字段)属性, 筛选时使用 $eq 等于, 其他用 $regex 包含
                                    switch (key) {
                                        case 'status':
                                        case 'conversionStatus':
                                        case 'source':
                                        case 'a10014':
                                        case 'a10019':
                                        case 'a10020':
                                            type = '$eq';
                                            break;
                                        case 'createUser':
                                            type = '$eq';
                                            con = 'create_user_id';
                                            break;
                                        case 'saleName':
                                            type = '$eq';
                                            con = 'sale_id';
                                            break;
                                        default:
                                            if (column.fieldType === 'custom' && column.colType === 'select') {
                                                type = '$eq';
                                            }
                                    }
                                    result.$or = temp.query.map(item => {
                                        const temp = {};
                                        temp[con] = {};
                                        // temp[con][type] = item.value;
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
                            result.$and = [];
                            start[con] = {};
                            start[con].$gte = temp.query[0];
                            result.$and.push(start);

                            end[con] = {};
                            end[con].$lte = temp.query[1];
                            result.$and.push(end);
                            this.$set(this.sqlList_tableFilter, con, result);

                            break;
                    }
                    this.currentColumns = this.currentColumns.map(item => {
                        if (item.key === key) {
                            item.filtering = true;
                        }
                        return item;
                    });
                } else {
                    this.$delete(this.sqlList_tableFilter, con);
                    this.currentColumns = this.currentColumns.map(item => {
                        if (item.key === key) {
                            item.filtering = false;
                        }
                        return item;
                    });
                }
            },
            // 左上角时间筛选
            change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    /* 处理筛选 */
                    // 判断是否有值, 调整 sqlList
                    const column = this.allColumns.find(item => item.key === key);
                    if (column) {
                        const con = this.getSearchCon(key);
                        this.handleTableSearch(temp, key, column, con);
                        /* 刷新列表 */
                        this.merge_query_list();
                        this.changePage(1);
                    } else {
                        this.remove_filter_tag(key);
                    }
                } else {
                    this.remove_filter_tag(key);
                }
                this.clearSelectedClues();
            },
            /** 渲染表头 */
            renderHeader_filter(colIndex) {
                return (h) => {
                    const column = this.allColumns[colIndex];
                    const config = this.config_tableFilter[column.key];
                    // 标题
                    const title = h('div', {
                        attrs: {
                            title: column.title
                        },
                        class: 'table-filter-title'
                    }, column.title);

                    // 系统 tips
                    const helpTip = ['conversionStatus', 'trafficSource'].includes(column.key)
                        ? h('HelpTip', {
                            props: {
                                title: (key => {
                                    switch (key) {
                                        case 'conversionStatus':
                                            return this.$t('helpTip.status_clue');
                                        case 'trafficSource':
                                            return this.$t('helpTip.traffic_source_clue');
                                    }
                                })(column.key)
                            },
                            class: 'table-head-tip'
                        })
                        : undefined;

                    // 排序组件
                    const order_column = this.getSearchCon(column.key);
                    const sortIcons = config.sort
                        ? h('span', {
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
                        ])
                        : undefined;
                    // 筛选组件
                    const filterPop = config.filter ? h('FilterBox', {
                        props: Object.assign({
                            showPopper: this.allColumns[colIndex].show_filter_content,
                            filtering: this.allColumns[colIndex].filtering,
                            columnKey: column.key,
                            columnCon: order_column,
                            order_type: this.order_type,
                            order_column: this.order_column,
                            storageName_orderColumn: this.storageName_orderColumn,
                            columnType: this.columnType
                        }, this.config_tableFilter[column.key]),
                        on: {
                            updateList: async (checkAll) => {
                                const temp = this.config_tableFilter[column.key];
                                temp.checkAll = checkAll; // 是否勾选【全选】
                                if (temp) {
                                    /* 处理筛选 */
                                    // 判断是否有值, 调整 sqlList
                                    const con = this.getSearchCon(column.key);
                                    await this.handleTableSearch(temp, column.key, column, con);
                                    this.selected_clues = [];
                                    this.allchecked = false;
                                    this.allCheckedPageList = [];
                                    /* 刷新列表 */
                                    await this.merge_query_list();
                                    this.changePage(1);
                                    this.clearSelectedClues();
                                }
                            },
                            'update:showPopper': (val) => {
                                this.allColumns = this.allColumns.map((item, index) => {
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
                                this.clearSelectedClues();
                            },
                            'update:order_type': (val) => {
                                this.order_type = val;
                                this.clearSelectedClues();
                            },
                            'update:storageName_orderColumn': (val) => {
                                this.storageName_orderColumn = val;
                                this.clearSelectedClues();
                            }
                        }
                    }) : undefined;
                    /* 返回 DOM */
                    return h('div', {
                        class: 'table-filter-container'
                    }, [
                        title,
                        (this.order_column === order_column && this.order_type) ? sortIcons : undefined,
                        Object.prototype.hasOwnProperty.call(column, 'show_filter_content') ? filterPop : undefined,
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
                // return;
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
            // 检查路由传递过来的参数
            checkRouteParams() {
                // 从别的页面跳转过来时，先检测localStorage中是否含有leadsCloud-clueId
                if (localStorage.getItem('leadsCloud-clueId')) {
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', true);
                    const tempId = localStorage.getItem('leadsCloud-clueId');
                    localStorage.removeItem('leadsCloud-clueId');
                    this.show_clue_detail = false;
                    this.changeMyClueOrAllClue('2');
                    this.$nextTick(() => {
                        this.show_clue_detail = true;
                        this.clueId = tempId;
                    });
                }
                // WhatsApp插件跳转过来的逻辑
                if (this.$route.query && this.$route.query.leadsCloudClueId) {
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', true);
                    const tempId = this.$route.query.leadsCloudClueId;
                    const seqNumber = this.$route.query.clueNumber;
                    // 进行表格默认筛选
                    const initial_filter_cons = new Map([
                        ['seqNumber', seqNumber] // 线索编号
                    ]);
                    this.allColumns = this.allColumns.map(col => {
                        if (Object.prototype.hasOwnProperty.call(this.config_tableFilter, col.key)) {
                            col.filtering = initial_filter_cons.get(col.key) ? this.init_filter(col.key, col.title, initial_filter_cons.get(col.key), col.fieldType, col.colType) : false;
                        }
                        return col;
                    });
                    // 请求表格数据
                    this.show_clue_detail = false;
                    this.changeMyClueOrAllClue('2');
                    this.$nextTick(() => {
                        this.show_clue_detail = true;
                        this.clueId = tempId;
                    });
                }
                if (localStorage.getItem('dashboard_clue_filter')) {
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', true);
                    // 提取筛选条件 Map 数组
                    const initial_filter_cons = new Map(JSON.parse(localStorage.getItem('dashboard_clue_filter')));
                    this.$store.commit('setListType', 3);
                    localStorage.removeItem('dashboard_clue_type');
                    localStorage.removeItem('dashboard_clue_filter');
                    this.allColumns = this.allColumns.map(col => {
                        if (Object.prototype.hasOwnProperty.call(this.config_tableFilter, col.key)) {
                            col.filtering = initial_filter_cons.get(col.key) ? this.init_filter(col.key, col.title, initial_filter_cons.get(col.key), col.fieldType, col.colType) : false;
                        }
                        return col;
                    });
                    // 请求表格数据
                    this.merge_query_list();
                    this.curPage = 1;
                    // this.refreshData();
                }
                if (localStorage.getItem('dashboard_clue_filter_googleMarketing')) {
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', true);
                    this.googleMarketingMd5 = localStorage.getItem('dashboard_clue_filter_googleMarketing');
                    localStorage.removeItem('dashboard_clue_filter_googleMarketing');
                    // 请求表格数据
                    this.merge_query_list();
                    this.curPage = 1;
                    this.refreshData();
                }
                this.type_topFilter = 'searchCommon';
                this.flag_topFilter = !this.flag_topFilter;
            },
            /* 获取表头 */
            async getClueFrontList() {
                // const resData = await this.getXSShow();
                // // 获取到表头各字段的长度限制
                // const limitData = await getUpperLengthLimit({ serviceFlag: 'save_clue', orgId: this.enterpriseId });

                crmClue.getClueFrontList({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    configKey: 'myClue',
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
                    const list = resData.data.filterFieldMap;
                    Object.keys(list).forEach((key) => {
                        // date 类型增加 快捷操作按钮(默认字段)
                        if (this.dateOptionsFileds.includes(key)) {
                            list[key].dateOptions = this.dateOptions;
                        }
                        // if (this.allLists[key]) {
                        //     list[key].allList = this.allLists[key];
                        // }
                        if (list[key].query.length) {
                            list[key].query = JSON.parse(list[key].query);
                        }
                        this.$set(this.config_tableFilter, key, list[key]);
                    });
                    this.allColumns.forEach((col, index) => {
                        if (Object.prototype.hasOwnProperty.call(this.config_tableFilter, col.key)) {
                            col.show_filter_content = false;
                            col.filtering = false;
                            // col.renderHeader = this.renderHeader_filter(index);
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
                            // col.renderHeader = this.renderHeader_text(index);
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
                        this.pagesize = size;
                    } else {
                        this.pagesize = 20;
                        this.addPageSize();
                    }
                    // this.setFields();
                    // 设置全部人员列表以供筛选
                    this.allUsers.length && this.setAllUsers();
                    this.salesList.length && this.setSaleList();
                    this.checkRouteParams();
                    // this.merge_query_list();
                    // this.refreshData();
                });
            },
            /* 添加PageSize */
            addPageSize() {
                const data = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    key: 'myClue',
                    value: this.pagesize.toString()
                };
                crmCommon.userconfigAdd(data);
            },
            // 数据处理
            async handleData(dataList) {
                // const visitorIdArr = [];
                dataList.forEach((item, index) => {
                    item.createTime = new Date(item.createTime).format('yyyy-MM-dd hh:mm:ss');
                    item.editTime = new Date(item.editTime || item.createTime).format('yyyy-MM-dd hh:mm:ss');
                    if (item.partSys == undefined) {
                        item.partSys = '';
                    }
                    if (item.leadsSubmitTime) {
                        item.leadsSubmitTime = new Date(item.leadsSubmitTime).format('yyyy-MM-dd hh:mm:ss');
                    }
                    switch (item.status) {
                        case 1:
                            item.status = this.$t('clue.unfollowed'); // 未处理
                            break;
                        case 2:
                            item.status = this.$t('clue.trash'); // 垃圾
                            break;
                        case 3:
                            item.status = this.$t('clue.inquiry'); // 询盘
                            break;
                        case 4:
                            item.status = this.$t('clue.following'); // 跟进中
                            break;
                        case 5:
                            item.status = this.$t('clue.done');
                            break;
                    }
                    switch (item.source) {
                        case 1:
                            item.source = this.$t('clue.history');  // 访客历史
                            break;
                        case 2:
                            item.source = this.$t('clue.web_msg');  // 网站留言
                            break;
                        case 3:
                            item.source = this.$t('clue.direct_create'); // 直接创建
                            break;
                        case 4:
                            item.source = this.$t('clue.web_conversation'); // 网站对话
                            break;
                        case 5:
                            item.source = 'Facebook Leads';
                            break;
                        case 6:
                            item.source = this.$t('clue.fb_msg'); // Facebook 私信
                            break;
                        case 7:
                            item.source = this.$t('clue.fb_comment'); // Facebook 评论
                            break;
                        case 9:
                            item.source = this.$t('clue.data_import'); // 数据导入
                            break;
                        case 10:
                            item.source = this.$t('clue.website_order'); // 网站订单
                            break;
                    }

                    // item.a1003 = countryList[index];
                    // item.inquiryNum = inquiryNums[item.id] ? inquiryNums[item.id].seqNumber : '';
                    // item.inquiryId = inquiryNums[item.id] ? inquiryNums[item.id].inquiryId : '';
                    // 处理社交平台显示问题  a10013
                    let str = '';

                    // 判断有显示访问ID列的情况下需要增加访问来源列
                    // if (item.proj) {
                    //     visitorIdArr.push(item.proj);
                    // }

                    if (item.a10013) {
                        if (item.a10013.slice(0, 1) != '[') { 
                            return;
                        }
                        JSON.parse(item.a10013).forEach(platform => {
                            if (platform.type) {
                                str += `${platform.type}:${platform.account}  `;
                            } else if (platform.attrName) {
                                str += `${platform.attrName}:${platform.attrValue}  `;
                            }
                        });
                        item.a10013 = str;
                    }
                });
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
                        return key;
                }
            },
            toLine(name) {
                return name.replace(/([A-Z])/g, '_$1').toLowerCase();
            },

            /* 刷新表格数据 */
            async refreshData() {
                console.log(this.queryData);
                if (this.queryData.$and.length > 0) {
                    this.googleMarketingMd5 = '';
                    localStorage.removeItem('dashboard_clue_filter_googleMarketing');
                }
                // const date1 = this.startDate ? `${this.startDate} 00:00:00` : '';
                // const date2 = this.endDate ? `${this.endDate} 23:59:59` : '';
                this.loading = true;
                const resData = await this.getClueList();
                if (!resData) {
                    return;
                } else {
                    if (resData.data.list == undefined) {
                        this.allreportdata = [];
                        this.totalpage = 0;
                    } else {
                        this.allreportdata = resData.data.list;
                        this.handleData(this.allreportdata);
                        this.totalpage = resData.data.total;
                    }
                }
                setTimeout(() => {
                    this.loading = false;
                }, 800);
            },
            /* 页码相关的 */
            /* 改变每页条数 */
            sizeChange(size) {
                this.pagesize = size;
                this.curPage = 1;
                const data = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    key: 'myClue',
                    value: size.toString()
                };
                crmCommon.userconfigUpdate(data);
                this.refreshData();
                this.selected_clues = [];
                this.allchecked = false;
                this.allCheckedPageList = [];
                // this.maxpagenum = Math.ceil(this.allreportdata.length / size)
                this.clearSelectedClues();
            },
            /* 改变页码 */
            changePage(page) {
                this.allreportdata = [];
                this.loading = true;
                this.curPage = page;
                this.refreshData();
                const indexFlag = this.allCheckedPageList.findIndex(item => {
                    return item == page;
                });
                if (indexFlag != -1) {
                    this.allchecked = true;
                } else {
                    this.allchecked = false;
                }
            },
            /* 修改列 */
            /**
             * 由于接口只是返回一长串文本，需要对文本进行拆解，去allColumns中筛选所需要的其他列表信息，然后进行排序
             * selCol 通过接口获取的页面需要显示的列表项
             */
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
                this.showColums = this.currentColumns.slice(0, this.columnPos);
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
                    this.tableAddScroll();
                    this.selected_clues = [];
                });
            },
            /** 筛选字段-获取检索类型 */
            getSearchCon(str) {
                // for(let item of this.allColumns){
                //     if(str==item.title){

                //     }
                // }
                switch (str) {
                    case 'createUser':
                        return 'create_user_id';
                    case 'serviceName':
                        return 'service_name';
                    case 'saleName':
                        return 'sale_id';
                    case 'seqNumber':
                        return 'seq_number';
                    case 'sourceUrl':
                        return 'source_url';
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
            // 检索并刷新表格
            async refreshData_filter(type, status) {
                this.status = '';
                switch (type) {
                    case 'mine':
                        this.$store.commit('setListType', Number(2));
                        break;
                    case 'all':
                        this.status = status;
                        this.$store.commit('setListType', Number(3));
                        break;
                    case 'myCharge':
                        this.$store.commit('setListType', Number(2));
                        break;
                    case 'myCreate':
                        this.$store.commit('setListType', Number(5));
                        break;
                    case 'myChargeTran':
                        this.$store.commit('setListType', Number(4));
                        break;
                    case 'myCreateTran':
                        this.$store.commit('setListType', Number(6));
                        break;
                    default:
                        this.$store.commit('setListType', Number(type));
                        break;
                }
                // type === 'mine' ? this.$store.commit('setListType', Number(2)) : this.$store.commit('setListType', Number(3));
                await this.merge_query_list();
                this.curPage = 1;
                this.refreshData();
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
                const index = this.allColumns.findIndex(item => item.key === key);
                if (index !== -1) {
                    const col = this.allColumns[index];
                    col.filtering = false;
                    this.$set(this.allColumns, index, col);
                    this.changeGroups(this.group);
                    let temp = col.key;
                    if (col.key === 'createUser') {
                        temp = 'create_user_id';
                    } else if (col.key === 'saleName') {
                        temp = 'sale_id';
                    }
                    this.$delete(this.sqlList_tableFilter, this.getSearchCon(temp));
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
                localStorage.removeItem('clue_order_column');
                localStorage.removeItem('clue_order_type');
                localStorage.removeItem('clue_storageName_orderColumn');
                // 刷新
                this.curPage = 1;
                this.refreshData();
            },
            /* 点击每一行 */
            clickRow({ row }) {
                const explorer = window.navigator.userAgent;
                let selecter = '';
                // 判断浏览器
                if (explorer.indexOf('MSIE') >= 0 || explorer.indexOf('Opera') >= 0) {
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
                if (selecter.type != 'Range' && document.activeElement.tagName !== 'INPUT') {
                    this.clueId = row.id;
                    this.show_clue_detail = true;
                }
            },
            // 表格快速编辑逻辑
            // 指定表格行 class name
            getRowClassName({ row, rowIndex }) {
                row.index = rowIndex;
                if (this.selected_clues.some(item => item.id === row.id)) {
                    return 'heightLight';
                }
                // row.index = rowIndex;
                // if (rowIndex % 2 === 0) {
                //     return 'one_row_background';
                // } else if (rowIndex % 2 === 1) {
                //     return 'pair_row_background';
                // }
                return '';
            },
            // 滚动监听
            addTableListenerScroll() {
                this.$nextTick(() => {
                    // this.table = document.querySelector('.vxe-table--body-wrapper');
                    this.tableScollListener = document.querySelector('.vxe-table--body-wrapper');
                    const scrollHandle = () => {
                        if (this.visibleEdit) {
                            this.clearEditPopperComponent();
                        }
                    };
                    this.tableScollListener.addEventListener('scroll', scrollHandle);
                });
            },
            // 点击编辑
            handleClickEdit(column, row, rowIndex, e) {
                if (row.inquiryNum) {
                    this.$Message.warning(this.$t('clue.cannot_edit_inquiry'));
                    return;
                }
                if (!this.tableScollListener) {
                    this.addTableListenerScroll();
                }
                // 赋值当前点击的编辑
                const path = e.path || (e.composedPath && e.composedPath());
                const currentTarget = Array.isArray(path) ? path[2] : e.srcElement.offsetParent;
                this.$set(this.checkedColumn, 'width', column.width + 90);
                this.rowIndex = rowIndex;
                const key = column.key;
                this.$set(this.checkedColumn, 'key', key);
                this.corp_item_all = this.allFieldsList.filter(item => item.key === key);
                this.getClueDetail(row.id);
                // 判断是否需要切换
                if (this.prevTarget === currentTarget) {
                    // 同一个元素重复点击
                    this.visibleEdit = !this.visibleEdit;
                } else {
                    // 切换不同元素, 判断之前是否有点击其他编辑 prevTarget
                    if (this.prevTarget) {
                        // 先清除之前的编辑框
                        this.clearEditPopperComponent();
                        // 然后生成新的编辑框
                        this.$nextTick(() => {
                            this.prevTarget = currentTarget;
                            this.visibleEdit = true;
                            this.$nextTick(() => {
                                if (this.$refs.clueInputArea.$refs[key]) {
                                    this.$refs.clueInputArea.$refs[key][0].focus();
                                }
                            });
                        });
                    } else {
                        this.prevTarget = currentTarget;
                        this.visibleEdit = true;
                        setTimeout(() => {
                            if (this.$refs.clueInputArea.$refs[key]) {
                                this.$refs.clueInputArea.$refs[key][0].focus();
                            }
                        }, 100);
                    }
                }
            },
            // 获取线索详情
            getClueDetail(clueId) {
                // 先获取线索字段详情
                const data = {
                    id: clueId,
                    userId: this.userId,
                    isEdit: 1
                };
                crmClue.getColumnValue(data).then(res => {
                    if (res.code === '1') {
                        this.detailInfo = res.data;
                        this.oldEmail = this.detailInfo.a10010;
                        this.oldPhone = this.detailInfo.a10012;
                        this.oldWA = this.detailInfo.a10052;
                        // 格式化多选字符串值
                        this.allFieldsList.filter(field => field.type === 'selectMultiple').forEach(field => {
                            let temp = [];
                            // 线索字段对应的询盘字段可能变化, 如果类型变化, 则可能解析出来的格式不对, 无法正确显示
                            try {
                                if (this.detailInfo[field.key]) {
                                    if (this.detailInfo[field.key].indexOf('[') !== -1) {
                                        temp = JSON.parse(this.detailInfo[field.key]);
                                        if (!Array.isArray(temp)) {
                                            temp = [];
                                        }
                                    } else {
                                        temp = this.detailInfo[field.key];
                                    }
                                } else {
                                    temp = [];
                                }
                            } catch (e) {
                                console.log(e);
                            }
                            this.$set(this.detailInfo, field.key, temp);
                        });
                        // 获取社交平台数据
                        if (this.detailInfo && this.detailInfo.a10013) {
                            // fix: 当社交平台数据为'[]'时,编辑线索时社交平台不显示输入框
                            if (this.detailInfo.a10013 === '[]') {
                                this.socialNetworkingPlatform = [{ type: '', account: '' }];
                            } else {
                                try {
                                    const tempJson = JSON.parse(this.detailInfo.a10013);
                                    if (this.detailInfo.a10013.indexOf('attrValue') !== -1) {
                                        this.socialNetworkingPlatform = tempJson.map(item => {
                                            return {
                                                type: item.attrName,
                                                account: item.attrValue
                                            };
                                        });
                                    } else {
                                        this.socialNetworkingPlatform = tempJson;
                                    }
                                } catch (error) {
                                    console.error('社交平台格式错误', error);
                                }
                            }
                        }
                    } else {
                        this.$Message.error(this.$t('clue.error_getClueDetail'));
                    }
                });
            },
            async ok() {
                this.tableEditLoading = true;
                let ret = ''; // 邮箱查重结果
                let phoneRepeat = ''; // 电话查重结果
                let WARepeat = '';// 电话查重结果
                // 遍历数据检测是否有未填写的必填选项
                this.allFieldsList.forEach((item, index) => {
                    this.valideClueEnter(item, index);
                });
                // 国家地区字段格式不符校验
                if (this.error_countryArea) {
                    this.$Message.error(this.$t('crm.Modal.error_countryAreaFormat'));
                    this.tableEditLoading = false;
                    return;
                }
                const isEmptyArr = this.allFieldsList.find(item => item.key === this.checkedColumn.key);
                if (isEmptyArr.isNeed === 1 && isEmptyArr.isEmpty) {
                    this.$Message.error(`[${isEmptyArr.name}] ${this.$t('enterClue.requireEmptyTip')}`);
                    this.tableEditLoading = false;
                    return false;
                }
                if (this.detailInfo[this.checkedColumn.key] && this.detailInfo[this.checkedColumn.key].length > isEmptyArr.upperLimitLength) {
                    this.tableEditLoading = false;
                    return false;
                }
                if (this.checkedColumn.key === 'a10010' && this.detailInfo[this.checkedColumn.key]) {
                    this.detailInfo[this.checkedColumn.key] = this.detailInfo[this.checkedColumn.key].trim();
                    const szReg = Utils.regExp.fullEmail;
                    if (!szReg.test(this.detailInfo[this.checkedColumn.key])) {
                        this.$Message.error(this.$t('portal_set.format_wrong'));
                        this.loading = false;
                        return false;
                    }
                    if (this.detailInfo[this.checkedColumn.key] !== this.oldEmail) {
                        // 校验该企业是否需要邮箱查重
                        if (this.email_duplicate_check) {
                            ret = await this.verifyEmail(this.detailInfo[this.checkedColumn.key], false);
                        }
                    }
                }
                // 手机判重
                if (this.checkedColumn.key === 'a10012' && this.detailInfo[this.checkedColumn.key]) {
                    this.detailInfo[this.checkedColumn.key] = this.detailInfo[this.checkedColumn.key].trim();
                    if (this.detailInfo[this.checkedColumn.key] !== this.oldPhone) {
                        phoneRepeat = await this.verifyPhone(this.detailInfo[this.checkedColumn.key], false);
                    }
                }
                const whatsAppReg = Utils.regExp.whatsApp;
                if (this.checkedColumn.key === 'a10052' && this.detailInfo[this.checkedColumn.key]) {
                    this.detailInfo[this.checkedColumn.key] = this.detailInfo[this.checkedColumn.key].trim();
                    if (!whatsAppReg.test(this.detailInfo[this.checkedColumn.key].replace(/\s/g, ''))) {
                        this.$Message.error(this.$t('enterClue.whatsAppFormErro'));
                        this.tableEditLoading = false;
                        return false;
                    }
                    // if (this.detailInfo[this.checkedColumn.key] !== this.oldWA && this.showUniq.whatsapp === '1') {
                    WARepeat = await this.verifyWA(this.detailInfo[this.checkedColumn.key], false);
                    // }
                }
                if (this.checkedColumn.key === 'a10013') {
                    this.detailInfo[this.checkedColumn.key] = JSON.stringify(this.platFormFlag);
                }
                if (ret || phoneRepeat || WARepeat) {
                    this.enterFlag = 'saveClue';
                    this.checkRepeatModalTitle = this.$t('clue.emailOrPhoneRepeat');
                    this.isEmailRepeat = true;
                    return false;
                }
                this.handleSaveClue();
            },
            handleSaveClue() {
                delete this.detailInfo.createTime;
                delete this.detailInfo.editTime;
                const jsonData = Object.assign(this.detailInfo, {
                    userId: this.userId,
                    userName: this.fullName
                });

                this.allFieldsList.filter(item => item.type === 'selectMultiple').forEach(field => {
                    const temp = Array.isArray(jsonData[field.key]) ? JSON.stringify(jsonData[field.key]) : JSON.stringify([]);
                    jsonData[field.key] = temp;
                });
                const sendData = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    userName: this.fullName,
                    clueId: this.detailInfo.id,
                    fieldName: this.checkedColumn.key,
                    fieldValue: jsonData[this.checkedColumn.key]
                };
                crmClue.updateField(sendData).then(response => {
                    if (response.code === '1') {
                        if (this.checkedColumn.key === 'a10017') {
                            const lableTag = JSON.parse(this.detailInfo[this.checkedColumn.key]);
                            this.$set(this.allreportdata[this.rowIndex], this.checkedColumn.key, lableTag.join());
                        } else if (this.checkedColumn.key === 'a10013') {
                            const socialNetworkingPlatform = this.detailInfo[this.checkedColumn.key];
                            if (socialNetworkingPlatform.slice(0, 1) !== '[') {
                                return;
                            }
                            let str = '';
                            JSON.parse(socialNetworkingPlatform).forEach(platform => {
                                if (platform.type) {
                                    str += `${platform.type}:${platform.account}  `;
                                } else if (platform.attrName) {
                                    str += `${platform.attrName}:${platform.attrValue}  `;
                                }
                            });
                            this.$set(this.allreportdata[this.rowIndex], this.checkedColumn.key, str);
                        } else if (this.checkedColumn.key === 'a1003') {
                            // 国家地区修改之后会更新 countryAreaName， 为空表示没有修改
                            if (this.countryAreaName.length > 0) {
                                this.$set(this.allreportdata[this.rowIndex], this.checkedColumn.key, this.countryAreaName);
                            }
                        } else if (this.checkedColumn.key === 'status') {
                            switch (jsonData[this.checkedColumn.key]) {
                                case 1:
                                    jsonData[this.checkedColumn.key] = this.$t('clue.unfollowed');
                                    break;
                                case 2:
                                    jsonData[this.checkedColumn.key] = this.$t('clue.trash');
                                    break;
                                case 4:
                                    jsonData[this.checkedColumn.key] = this.$t('clue.following');
                                    break;
                                case 5:
                                    jsonData[this.checkedColumn.key] = this.$t('clue.done');
                                    break;
                            }
                            this.$set(this.allreportdata[this.rowIndex], this.checkedColumn.key, jsonData[this.checkedColumn.key]);
                        } else {
                            this.$set(this.allreportdata[this.rowIndex], this.checkedColumn.key, jsonData[this.checkedColumn.key]);
                        }
                        
                        this.clearEditPopperComponent();
                        this.$Message.success(this.$t('clue.edit_success'));
                        // 分发提醒事件
                        this.invoking({
                            data: {
                                saleId: this.detailInfo.saleId,
                                createUserId: [this.detailInfo.createUserId],
                                serviceId: [this.detailInfo.serviceId]
                            },
                            id: this.detailInfo.id,
                            effectActionType: 2
                        });
                    } else {
                        if (response.data === -7) {
                            // 该邮箱为企业同事邮箱，不可录入
                            this.$Message.error(this.$t('crm.Modal.error_enterpriseColleagueMail'));
                        } else {
                            this.$Message.error(this.$t('clue.edit_failed'));
                        }
                    }
                    this.cancelEnter();
                }).catch(() => {
                    this.cancelEnter();
                });
            },
            cancelEnter() {
                this.tableEditLoading = false;
                this.isEmailRepeat = false;
            },
            // 字段校验
            valideClueEnter(column, index, platFormKey, platFormIndex) {
                if (column.isNeed) {
                    // 社交平台处理
                    if (column.key === 'a10013') {
                        // 判断字段是否超长
                        this.validePlatform(column, index);
                        if (platFormKey === 'account' && this.socialNetworkingPlatform[platFormIndex].account) {
                            this.socialNetworkingPlatform[platFormIndex].account = this.socialNetworkingPlatform[platFormIndex].account.trim();
                        }
                        // 如果是社交平台分类没有填写
                        if (platFormKey === 'type' && !this.socialNetworkingPlatform[platFormIndex].type) {
                            this.$set(this.allFieldsList[index], 'isEmpty', true);
                            this.$set(this.socialNetworkingPlatform[platFormIndex], 'platFormFlagEmptyTip', this.$t('enterClue.platFormFlagTypeEmptyTip'));
                            return true;
                        } else if (platFormKey === 'account' && !this.socialNetworkingPlatform[platFormIndex].account) {
                            // 如果是社交平台内容没有填写
                            this.$set(this.allFieldsList[index], 'isEmpty', true);
                            this.$set(this.socialNetworkingPlatform[platFormIndex], 'platFormFlagEmptyTip', this.$t('enterClue.platFormFlagAccountEmptyTip'));
                            return true;
                        } else {
                            // 判断是否含有platFormIndex
                            if (platFormIndex === undefined) {
                                // 如果是undefined， 代表是点击确认时，去验证规则的
                                const emptyArr = this.socialNetworkingPlatform.some((item, i) => {
                                    if (item.account) {
                                        item.account = item.account.trim();
                                    }
                                    if (!item.type && !item.account) {
                                        this.$set(this.socialNetworkingPlatform[i], 'platFormFlagEmptyTip', this.$t('enterClue.emptyTip'));
                                        return true;
                                    } else if (!item.type) {
                                        this.$set(this.socialNetworkingPlatform[i], 'platFormFlagEmptyTip', this.$t('enterClue.platFormFlagTypeEmptyTip'));
                                        return true;
                                    } else if (!item.account) {
                                        this.$set(this.socialNetworkingPlatform[i], 'platFormFlagEmptyTip', this.$t('enterClue.platFormFlagAccountEmptyTip'));
                                        return true;
                                    } else {
                                        this.$set(this.socialNetworkingPlatform[i], 'platFormFlagEmptyTip', '');
                                        return false;
                                    }
                                });
                                if (emptyArr) {
                                    this.$set(this.allFieldsList[index], 'isEmpty', true);
                                }
                                return emptyArr;
                            } else {
                                this.$set(this.allFieldsList[index], 'isEmpty', false);
                                this.$set(this.socialNetworkingPlatform[platFormIndex], 'platFormFlagEmptyTip', '');
                                // 判断社交平台是否超长
                                const isExtra = this.validePlatform(column, index);
                                if (isExtra) {
                                    const plateformEmpty = this.socialNetworkingPlatform.some((item, i) => {
                                        if (item.account) {
                                            item.account = item.account.trim();
                                        }
                                        return !item.type || !item.account;
                                    });
                                    if (plateformEmpty) {
                                        this.$set(this.allFieldsList[index], 'isEmpty', true);
                                    }
                                }
                                return false;
                            }
                        }
                    } else if (column.key !== 'a10013') {
                        if (column.type === 'selectMultiple' || column.type === 'select') {
                            if (!this.detailInfo[column.key] || !this.detailInfo[column.key].length) {
                                this.$set(this.allFieldsList[index], 'isEmpty', true);
                                return true;
                            } else {
                                this.$set(this.allFieldsList[index], 'isEmpty', false);
                                return false;
                            }
                        } else {
                            if (!this.detailInfo[column.key] || (this.detailInfo[column.key] && !this.detailInfo[column.key].trim())) {
                                this.$set(this.allFieldsList[index], 'isEmpty', true);
                                return true;
                            } else {
                                this.$set(this.allFieldsList[index], 'isEmpty', false);
                                return false;
                            }
                        }
                    }
                }
            },
            // 社交平台校验
            validePlatform(column, index) {
                const str = JSON.stringify(this.socialNetworkingPlatform);
                if (str.length > column.upperLimitLength) {
                    this.$set(this.allFieldsList[index], 'isExtraLong', true);
                    return true;
                } else {
                    this.$set(this.allFieldsList[index], 'isExtraLong', false);
                    return false;
                }
            },
            // 验证邮箱
            verifyEmail(val, type) {
                /* type是是否有重复提示 */
                if (!val) {
                    return;
                }
                if (type) {
                    this.checkRepeatModalTitle = this.$t('crm.Modal.title_uniqEmail_fixed');
                    this.repeatData = {};
                }
                this.repeatData.clueEmail = null;
                this.repeatData.contactEmail = null;
                return new Promise((resolve, reject) => {
                    crmClue.getSameListByEmail({
                        orgId: this.enterpriseId,
                        email: String(val),
                        excludeId: this.detailInfo.id
                    }).then(response => {
                        if (response.code === '1') {
                            const data = response.data;
                            if (!data || (!data.clue && (!data.inquiry || !data.inquiry.length))) {
                                if (type) {
                                    this.$Message.success(this.$t('enterClue.backCluesTip2'));
                                }
                                resolve(false);
                            } else {
                                if (data.clue && data.clue.length) {
                                    this.repeatData.clueEmail = data.clue;
                                }
                                if (data.inquiry && data.inquiry.length) {
                                    this.repeatData.contactEmail = data.inquiry;
                                }
                                if (type) {
                                    this.enterFlag = 'self-test';
                                    this.isEmailRepeat = true;
                                }
                                resolve(true);
                            }
                        } else {
                            resolve(false);
                        }
                    });
                });
            },
            // 电话查重
            verifyPhone(value, type) {
                if (!value) {
                    return;
                }
                if (type) {
                    this.checkRepeatModalTitle = this.$t('crm.Modal.title_uniqPhone_fixed');
                    this.repeatData = {};
                }
                this.repeatData.cluePhone = null;
                this.repeatData.contactPhone = null;

                const data = {
                    orgId: this.enterpriseId,
                    phone: value,
                    excludeId: this.detailInfo.id
                };
                return new Promise((resolve, reject) => {
                    crmClue.getSameListByPhone(data).then((res) => {
                        if (res.code === '1') {
                            const data = res.data;
                            if (!data || (!data.clue && !data.inquiry)) {
                                if (type) {
                                    this.$Message.success(this.$t('clue.no_repeat'));
                                }
                                resolve(false);
                            } else {
                                if (data.clue && data.clue.length) {
                                    this.repeatData.cluePhone = data.clue;
                                }
                                if (data.inquiry && data.inquiry.length) {
                                    this.repeatData.contactPhone = data.inquiry;
                                }
                                if (type) {
                                    this.enterFlag = 'self-test';
                                    this.isEmailRepeat = true;
                                }
                                resolve(true);
                            }
                        }
                    });
                });
            },
            /** WhatsApp查重  */
            verifyWA(value, type) {
                if (!value) {
                    return;
                }
                if (type) {
                    this.repeatData = {};
                }
                this.repeatData.clueWA = null;
                this.repeatData.contactWA = null;
                return new Promise((resolve, reject) => {
                    crmClue.getSameListByWhatsapp({
                        orgId: this.enterpriseId,
                        whatsapp: value,
                        excludeId: this.detailInfo.id
                    }).then((res) => {
                        if (res.code === '1') {
                            const data = res.data;
                            // 如果没有list的话，说明没有重复电话
                            if (!data || (!data.clue && !data.inquiry)) {
                                if (type) {
                                    this.$Message.success(this.$t('clue.no_repeat'));
                                }
                                resolve(false);
                            } else {
                                if (data.clue && data.clue.length) {
                                    this.repeatData.clueWA = data.clue;
                                }
                                if (data.inquiry && data.inquiry.length) {
                                    this.repeatData.contactWA = data.inquiry;
                                }
                                if (type) {
                                    this.enterFlag = 'self-test';
                                    this.isEmailRepeat = true;
                                }
                                resolve(true);
                            }
                        } else {
                            resolve(false);
                        }
                    });
                });
            },
            // 打开发信弹窗
            quickSend(data) {
                if (this.is_marketing_station) return;
                if (data.a10010) {
                    const emails = [{
                        receiverName: data.a1009 || '',
                        receiveMailAddress: data.a10010,
                        followUpId: `${data.id}`,
                        fromClue: 1
                    }];
                    localStorage.setItem('leadsCloud-sendMail-contacts', JSON.stringify(emails));
                    // 打开写信弹窗之前先判断有没有已经打开的写信弹窗
                    const doc = document.getElementById('mail_detail_modal');
                    if (!doc) {
                        this.$store.commit('setQuickSendMailVisible', true);
                    }
                }
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
            salesList: {
                handler(val) {
                    if (val) {
                        // 设置本页面应用的全部销售人员，手动增加公海，新增时使用
                        this.setSaleList();
                    }
                }
            },
            importDataShow: {
                handler: function() {
                    this.refreshData();
                }
            },
            button_list: {
                handler: function() {
                },
                deep: true
            },
            group: {
                handler(val) {
                    this.changeGroups(val);
                },
                immediate: true
            },
            window_height() {
                this.clearEditPopperComponent();
            },
            show_clue_detail: {
                handler(val) {
                    if (!val) {
                        this.$refs.clueTable.setCurrentRow();
                        if (this.$route.query && this.$route.query.leadsCloudClueId) {
                            this.$rootRouter.replace({ query: {} });
                        }
                    }
                }
            },
            order_column: {
                handler(val) {
                    localStorage.setItem('clue_order_column', val);
                    localStorage.setItem('clue_storageName_orderColumn', this.storageName_orderColumn);
                },
                immediate: true
            },
            order_type: {
                handler(val) {
                    localStorage.setItem('clue_order_type', val);
                },
                immediate: true
            },
            // storageName_orderColumn: {
            //     handler(val) {
            //         localStorage.setItem('clue_storageName_orderColumn', val);
            //     },
            //     immediate: true
            // }
        },
        beforeMount() {

        }
    };
</script>

<style lang="less">
    @import "../../crm/Detail/Components/less/modal";
    @import "../../crm/Detail/Components/less/detailPage";
    @import url('../../crm/Table/Components/less/tablePage.less');
    @import url('./clue.less');
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
    .show-fb-lead-poptip:hover{
        color: #3B78DE;
        cursor: pointer;
    }
</style>
