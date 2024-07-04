<template>
   <div class="table">
        <vxe-table v-if="flag_refreshColumn"
                :data="tableData"
                :row-config="{useKey: true, keyField: 'id', isCurrent: true, isHover: true}"
                :column-config="{resizable: true}"
                :height="table_height"
                size="medium"
                stripe
                ref="table"
                :checkbox-config="{highlight: true, reserve: true}"
                @scroll.native.capture="close_popper"
                @cell-click="$parent.clickRow"
                @contextmenu.native.prevent="$copyTableCellValue"
                @checkbox-change="$parent.handleSelectionChange"
                @checkbox-all="$parent.handleSelectionChange"
                @resizable-change="handleTableColResizeEndVxeTable"
                :scroll-y="{enabled: true, gt: 20}"
                :scroll-x="{enabled: true, gt: 10}"
                class="tabmain">
            <!-- 首列 checkbox -->
            <vxe-column v-if="currentTable !='contact'"
                        fixed="left"
                        width="48"
                        align="left"
                        show-header-overflow
                        type="checkbox"></vxe-column>
            <!-- 正常列 -->
            <vxe-column v-for="(item, index) in currentColumns"
                            :key="item.key"
                            :field="item.key"
                            :title="item.title"
                            :align="item.align"
                            :fixed="item.fixed"
                            :class-name="item.className"
                            :width="item.width"
                            :min-width="84"
                            :show-overflow="!['iqLabel', 'cpStarLevel'].includes(item.key) ? 'tooltip' : false">
                <template #header="{ column }">
                    <div class="table-filter-container">
                        <!-- 表头筛选 -->
                        <template  v-if="config_tableFilter[column.field] && (config_tableFilter[column.field].sort || config_tableFilter[column.field].filter)">
                            <div class="table-filter-title" :title="column.title">{{ column.title }}</div>
                            <template v-if="order_type && storageName_orderColumn === column.field">
                                <span class="table-sort-icon-container">
                                    <Icon :class="`icon-custom-on ${order_type === 'asc' && 'icon-custom-on-active'}`" type="md-arrow-dropup"></Icon>
                                    <Icon :class="`icon-custom-on ${order_type === 'desc' && 'icon-custom-on-active'}`" type="md-arrow-dropdown"></Icon>
                                </span>
                            </template>
                            <FilterBox ref="filterBoxList"
                                    :showPopper.sync="currentColumns[index].show_filter_content"
                                    :filtering="currentColumns[index].filtering"
                                    :columnKey="column.field"
                                    :columnCon.sync="column.field"
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
                                    @updateList="(checkAll) => updateList(checkAll, column, index)">
                            </FilterBox>
                        </template>
                        <!-- 纯文本 -->
                        <template v-else>
                            <div :title="column.title" class="table-filter-title">{{ column.title }}</div>
                        </template>
                    </div>
                </template>
                <template #default="{ row, rowIndex }">
                    <!-- 询盘特殊字段处理 -->
                    <template v-if="item.key === 'status'">
                        <div class="audience_icon_wrap">
                            <template v-for="(statusType, index) in ['conversionStatus', 'auditStatus', 'facebookStatus']">
                                <span v-if="row[statusType] === 1" :key="index">
                                    <img :src="[`${publicPath}image/isFromGoogle.png`, `${publicPath}image/googleReview.png`, `${publicPath}image/facebookStatus.png`][index]"
                                            :title="index === 2 ? $t('crm.Table.FacebookAudienceOptimization') : $t('crm.Table.GoogleIsLearning')">
                                </span>
                            </template>
                            <span class="table-show-contant" v-if="!row.auditStatus && !row.conversionStatus && !row.facebookStatus"> - </span>
                        </div>
                    </template>
                     <template v-else-if="item.key === 'dynamic' && row.dynamic">
                        <p class="table-show-contant">
                            <template v-if="['1', '2', '3', '4', '5', '6'].includes(`${row.dynamic.type}`)">
                                <Icon color="#4285F2"
                                        size="18"
                                        :custom="`${`${row.dynamic.type}` === '1' ? 'custom-dynamic-type-followUp':
                                        `${row.dynamic.type}` === '2' ? 'custom-dynamic-type-mail':
                                        `${row.dynamic.type}` === '3' ? 'custom-dynamic-type-whatsApp':
                                        `${row.dynamic.type}` === '4' ? 'custom-dynamic-type-facebook':
                                        `${row.dynamic.type}` === '5' ? 'custom-dynamic-type-source':
                                        `${row.dynamic.type}` === '6' ? 'custom-dynamic-type-qiwei': '' }`"></Icon>
                            </template>
                            <span style="margin-left: 4px;" v-if="row.dynamic.type+'' === '3'">
                                {{ row.dynamic.messageType+'' ==='1' ? row.dynamic.message : row.dynamic.messageType ? $t(`crm.Table.col_whatsapp_message_type${row.dynamic.messageType}`):''}}
                            </span>
                            <span style="margin-left: 4px;" v-else-if="row.dynamic.type+'' === '6'">
                                {{ row.dynamic.messageType+'' ==='1' ? row.dynamic.message : row.dynamic.messageType ? $t(`crm.Table.col_qiwei_message_type${row.dynamic.messageType}`):''}}
                            </span>
                            <span style="margin-left: 4px;" v-else>{{ row.dynamic.message }}</span>
                        </p>
                            <span class="table-edit-btn" v-if="item.isOnlyRead !== 1 && item.isOnlyRead !== 2 && authorized_button" @click.stop>
                            <Tooltip placement="top" content="编辑">
                                <a href="javascript:void(0)" @click="handleClickEdit(item,row,rowIndex, $event)" class="table-show-edit custom custom-bianji-normal"></a>
                            </Tooltip>
                        </span>
                    </template>
                    <template v-else-if="item.key === 'label' && row.label">
                        <AbbrLabel v-if="$options.filters.parseArray(row.label).length"
                                    :labels="$options.filters.parseArray(row.label)"
                                    ref="abbrLabel"></AbbrLabel>
                         <template v-else>
                            <span class="table-show-contant"> - </span>
                            <span class="table-edit-btn" v-if="item.isOnlyRead !== 1 && item.isOnlyRead !== 2 && authorized_button" @click.stop>
                                <Tooltip placement="top" content="编辑">
                                    <a href="javascript:void(0)" @click="handleClickEdit(item,row, rowIndex, $event)" class="table-show-edit custom custom-bianji-normal"></a>
                                </Tooltip>
                            </span>
                        </template>
                    </template>
                    <template v-else-if="item.key === 'inquiryMarker'">
                        <Icon custom="custom-crm-mark"
                                style="cursor: pointer;"
                                @click.stop="remarkInquiryMarker(row, rowIndex)"
                                :color="row.inquiryMarker === 1 ? '#FBBC04' : 'rgba(0, 0, 0, .18)'"
                                size="12"></Icon>
                    </template>
                    <!-- 询盘特殊字段处理结束 -->

                    <!-- 客户特殊字段 -->
                    <template v-else-if="item.key === 'cpMarker'">
                        <Icon custom="custom-crm-mark"
                                style="cursor: pointer;"
                                @click.stop="remarkFun(row, rowIndex)"
                                :color="row.cpMarker === 1 ? '#FBBC04' : 'rgba(0, 0, 0, .18)'"
                                size="12"></Icon>
                    </template>
                    <template v-else-if="item.key === 'cpStarLevel'">
                        <Rate :value="row.cpStarLevel"
                            disabled
                            void-color="rgba(0, 0, 0, 0.14)"
                            disabled-void-color="rgba(0, 0, 0, 0.14)"
                            :colors="['#FFC909', '#FFC909', '#FFC909']"
                            :icon-classes="['custom custom-star', 'custom custom-star', 'custom custom-star']"
                            disabled-void-icon-class="custom custom-star"></Rate>
                            <span class="table-edit-btn" v-if="item.isOnlyRead !== 1 && item.isOnlyRead !== 2 && authorized_button" @click.stop>
                            <Tooltip placement="top" content="编辑">
                                <a href="javascript:void(0)" @click="handleClickEdit(item,row,rowIndex, $event)" class="table-show-edit custom custom-bianji-normal"></a>
                            </Tooltip>
                        </span>
                    </template>
                    <template v-else-if="item.key === 'cpDynamic' && row.cpDynamic">
                        <p class="table-show-contant">
                        <template v-if="['1', '2', '3', '4', '5', '6'].includes(`${row.cpDynamic.type}`)">
                            <Icon color="#4285F2"
                                    size="18"
                                    :custom="`${`${row.cpDynamic.type}` === '1' ? 'custom-dynamic-type-followUp' :
                                            `${row.cpDynamic.type}` === '2' ? 'custom-dynamic-type-mail' :
                                            `${row.cpDynamic.type}` === '3' ? 'custom-dynamic-type-whatsApp' :
                                            `${row.cpDynamic.type}` === '4' ? 'custom-dynamic-type-facebook' :
                                            `${row.cpDynamic.type}` === '5' ? 'custom-dynamic-type-source':
                                            `${row.cpDynamic.type}` === '6' ? 'custom-dynamic-type-qiwei' : ''}`"></Icon>
                        </template>
                        <span style="margin-left: 4px;" v-if="row.cpDynamic.type+'' === '3'">
                            {{ row.cpDynamic.messageType+'' ==='1' ? row.cpDynamic.message : row.cpDynamic.messageType ? $t(`crm.Table.col_whatsapp_message_type${row.cpDynamic.messageType}`):''}}
                        </span>
                        <span style="margin-left: 4px;" v-else-if="row.cpDynamic.type+'' === '6'">
                            {{ row.cpDynamic.messageType+'' ==='1' ? row.cpDynamic.message : row.cpDynamic.messageType ? $t(`crm.Table.col_qiwei_message_type${row.cpDynamic.messageType}`):''}}
                        </span>
                        <span style="margin-left: 4px;" v-else>{{ row.cpDynamic.message }}</span>
                            </p>
                            <span class="table-edit-btn" v-if="item.isOnlyRead !== 1 && item.isOnlyRead !== 2 && authorized_button" @click.stop>
                            <Tooltip placement="top" content="编辑">
                                <a href="javascript:void(0)" @click="handleClickEdit(item,row,rowIndex, $event)" class="table-show-edit custom custom-bianji-normal"></a>
                            </Tooltip>
                        </span>
                    </template>
                    <!-- 标签列 -->
                    <template v-else-if="item.key === 'iqLabel' && row.iqLabel">
                        <AbbrLabel v-if="$options.filters.parseArray(row.iqLabel).length"
                                    :labels="$options.filters.parseArray(row.iqLabel)"
                                    ref="abbrLabel"></AbbrLabel>
                         <template v-else>
                            <span class="table-show-contant"> - </span>
                            <span class="table-edit-btn" v-if="item.isOnlyRead !== 1 && item.isOnlyRead !== 2 && authorized_button" @click.stop>
                                <Tooltip placement="top" content="编辑">
                                    <a href="javascript:void(0)" @click="handleClickEdit(item,row, rowIndex, $event)" class="table-show-edit custom custom-bianji-normal"></a>
                                </Tooltip>
                            </span>
                        </template>
                    </template>

                    <!-- 联系人字段特殊列 -->
                    <template v-else-if="['ctWhatsApp', 'whatsApp'].includes(item.key) && row[item.key]">
                        <!-- 点击打开 wa 回复框 -->
                        <span @click.stop="openGlobalWaReplyModal(row[item.key], $event)"
                                class="table-show-contant el-tooltip header-source">{{ row[item.key] ?  row[item.key] : '-' }}</span>

                        <!-- 编辑按钮 -->
                        <span class="table-edit-btn" v-if="item.isOnlyRead !== 1 && item.isOnlyRead !== 2 && authorized_button" @click.stop
                                @click="handleClickEdit(item,row, rowIndex, $event)" >
                                <Tooltip placement="top" content="编辑">
                                <a href="javascript:void(0)" class="table-show-edit custom custom-bianji-normal"></a>
                            </Tooltip>
                        </span>
                    </template>

                    <!-- 其他正常列 -->
                    <template v-else-if="item.formatter">
                            <span :class="(item.isOnlyRead === 1 || item.isOnlyRead === 2) ? 'table-show-contant-edit' : 'table-show-contant'">{{ (item.formatter)(row) }}</span>
                            <span class="table-edit-btn" v-if="item.isOnlyRead !== 1 && item.isOnlyRead !== 2 && authorized_button" @click.stop>
                                <Tooltip placement="top" content="编辑">
                                    <a href="javascript:void(0)" @click="handleClickEdit(item,row,rowIndex, $event)" class="table-show-edit custom custom-bianji-normal"></a>
                                </Tooltip>
                            </span>
                    </template>
                    <template v-else>
                        <span :class="(item.isOnlyRead === 1 || item.isOnlyRead === 2) ? 'table-show-contant-edit' : 'table-show-contant'">{{ row[item.key] ? row[item.key] : '-' }}</span>
                        <span class="table-edit-btn" v-if="item.isOnlyRead !== 1 && item.isOnlyRead !== 2 && authorized_button" @click.stop @click="handleClickEdit(item,row, rowIndex, $event)" >
                            <Tooltip placement="top" content="编辑">
                                <a href="javascript:void(0)" class="table-show-edit custom custom-bianji-normal"></a>
                            </Tooltip>
                        </span>
                    </template>
                </template>
            </vxe-column>
            <!-- 末列字段配置按钮 -->
            <vxe-column fixed="right"
                width="40"
                align="center"
                :resizable="false"
                show-header-overflow>
                <template slot="header">
                    <i class="custom custom-table-edit-columns"
                        style="font-size: 18px"
                        @click="$parent.edit_columns"
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
            <Page :page-size="pageSize"
                    :page-sizes="pageSizeOpts"
                    :total="totalNum"
                    :current-page="curPage"
                    layout="total, prev, pager, next, sizes, jumper"
                    @current-change="$parent.changePage"
                    @size-change="$parent.pageSizeChange"
                    class="pageWrap-right"></Page>
        </div>
        <Poptip ref="editPopover"
            :popper-class="['socialNetworkingPlatform'].includes(checkedColumn.key) ? 'table-edit-box-popper socialNetworkingPlatform' :'table-edit-box-popper'"
            v-model="visibleEdit"
            placement="left"
            :visible-arrow="false"
            :reference="prevTarget"
            :key="popperFlag"
            :width="checkedColumn.width"
            @hide="clearEditPopperComponent"
            :popper-options="popperOptions"
        >
            <div class="table-edit-box" :class="{'phone-edit-box': ['phone'].includes(checkedColumn.key), 'wa-edit-box': ['whatsApp'].includes(checkedColumn.key)}">
                <Form
                    class="table-edit-form"
                    inline
                    :validate-on-rule-change="false"
                    label-position="left"
                    label-width="90px"
                >
                    <CrmInputArea ref="crmInputArea"
                                :data.sync="tempDetail"
                                operateType="tableEdit"
                                :items="corp_item_all"
                                :selectOptions="computed_selectOptions"
                                :pictures.sync="detailPictures"
                                :error_countryArea.sync="error_countryArea"
                                :contactAddressLatLng.sync="contactAddressLatLng"
                                :email_editing="email_editing"
                                :email_saving="email_saving"
                                @uniqPhoneNumber="uniqContact({ field: 'phone', value: $event })"
                                @uniqContact="uniqContact"
                                @uniqCompany="uniqCompany"
                                @uniqSocialPlatforms="uniqSocialPlatforms"
                                :estimatedInquiryAmount.sync="estimatedInquiryAmount"
                                :estimatedInquiryAmountCurrency.sync="estimatedInquiryAmountCurrency"
                                :transactionInfo.sync="transactionInfo"
                                ></CrmInputArea>
                </Form>
                <div class="table-edit-box-buttons">
                    <Button @click="clearEditPopperComponent" type="text">{{ $t('crm.Modal.modal_cancel') }}</Button>
                    <Button type="text" @click="ok" class="table-edit-box-button-sure" :class="`piwik_${currentTable}_editPopover`" :disabled="loading">{{ $t('crm.Modal.modal_ok') }}</Button>
                </div>
            </div>
        </Poptip>

        <!-- 邮箱 / 电话 / WhatsApp / Instagram 字段查重弹窗 -->
        <UniqContact :visible.sync="uniqContactVisible"
                     :uniqField="uniqContactField"
                     :uniqVal="uniqContactVal"></UniqContact>

       <!-- 邮箱后缀查重弹窗 -->
       <UniqEmailSuffix :visible.sync="uniqEmailSuffixVisible"
                        :email="uniqEmailSuffixVal"></UniqEmailSuffix>

        <!-- 社交平台查重 -->
        <UniqSocialPlatforms
                    :uniqSocialPlatformVal="uniqSocialPlatformVal"
                    :uniqSocialPlatformName="uniqSocialPlatformName"
                    :visible.sync="uniqSocialPlatformsVisible"></UniqSocialPlatforms>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import Utils from '@/utils/index';
    import { mapState, mapGetters } from 'vuex';
    import resetInitComponents from '@/mixins/resetComponentViewData';
    import tableColResize from '@/mixins/tableColResize';
    import tableQuickEdit from '@/mixins/tableQuickEdit';
    import globalWaReplyModal from '@/mixins/globalWaReplyModal';
    import UniqContact from '@/views/crm/Detail/Components/Modal/uniqContact';
    import UniqEmailSuffix from '@/views/crm/Detail/Components/Modal/uniqEmailSuffix';
    import CrmInputArea from '@/views/crm/Detail/Components/Modal/fixed-modal-form/crm-input-area';
    import UniqSocialPlatforms from '@/views/crm/Detail/Components/Modal/uniqSocialPlatforms';
    import { checkContact } from '@/api/reusableApi/common';
    import { GET_EMAIL_SUFFIX } from '@/api/mail';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { crmCommon, crmCompany, crmInquiry, crmContacts, crmClue } from '@/api/crm/index';

    export default {
        name: 'customerTable',
        mixins: [resetInitComponents, tableColResize, tableQuickEdit, globalWaReplyModal],
        components: {
            CrmInputArea,
            UniqContact,
            UniqEmailSuffix,
            UniqSocialPlatforms
        },
        props: {
            flag_refreshColumn: {
                type: Boolean
            },
            table_height: {
                type: Number
            },
            tableData: {
                type: Array
            },
            currentColumns: {
                type: Array
            },
            config_tableFilter: {
                type: Object
            },
            pageSize: {
                type: null
            },
            pageSizeOpts: {
                type: Array
            },
            totalNum: Number,
            curPage: Number,
            close_popper: Function,
            corp_columns_authorized: Object,
            contact_columns_authorized: Object,
            inquiry_columns_authorized: Object,
            fieldStyle: Object,
            allColumns: Array,
            columnType: Number,
            selected_items: Array,
            companyId: [String, Number],
            currentTable: String,
            order_type: String,
            storageName_orderColumn: String,
            order_column: String
        },
        computed: {
            ...mapState({
                lang: state => state.app.lang,
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                window_height: 'window_height',
                button_list: state => state.app.button_list,
                showUniq: state => state.crm.showUniq,
                allowMerge: state => state.crm.allowMerge,
                uniqTypeCompanyName: state => state.crm.uniqTypeCompanyName,
                selectOptions: state => state.crm.selectOptions,
                socialPlatformIds: state => state.crm.socialPlatformIds
            }), // 从 vuex 中
            ...mapGetters([
                // 字段长度校验
                'check_length_default',
                'check_length_custom',
                'corp_items',
                'inquiry_items',
                'contact_items'
            ]),
            item_custom() {
                switch (this.parentFiled) {
                    case 1:
                        return this.corp_columns_authorized.custom;
                    case 2:
                        return this.contact_columns_authorized.custom;
                    case 3:
                        return this.inquiry_columns_authorized.custom;
                }
            },
            computed_selectOptions() {
                const result = {};
                Object.entries(this.$deepClone(this.selectOptions)).forEach(([key, value]) => {
                    result[key] = value.filter(item => item.isAvailable === 1);
                });
                result.companySourceWay = result.sourceWay;
                return result;
            },
            current_followUp() {
                return Array.isArray(this.computed_selectOptions.followUp) ? this.computed_selectOptions.followUp.find(item => `${item.attrId}` === `${this.tempDetail.followUpId}`) : undefined;
            },
            authorized_button() {
                if (this.currentTable === 'customer') {
                    const ids = BUTTON_IDS.CRM.customer;
                    return !HANDLE_BUTTON(ids.edit.editCustomer, this.button_list);
                } else if (this.currentTable === 'inquiry') {
                    const ids = BUTTON_IDS.CRM.inquiry;
                    return !HANDLE_BUTTON(ids.edit.editInquiry, this.button_list);
                } else {
                    const ids = BUTTON_IDS.CRM.contact;
                    return !HANDLE_BUTTON(ids.edit.editContact, this.button_list);
                }
            }
        },
        data() {
            return {
                publicPath: process.env.BASE_URL,
                upadte: false,
                loading: false,
                detailData: {},
                tempDetail: {},
                detailPictures: [],
                /* 公司 WhatsApp / Instagram 查重 */
                uniqCompanyVisible: false,
                uniqContactVisible: false,
                uniqContactField: '',
                uniqContactVal: '',
                // 社交平台查重弹窗的状态
                uniqSocialPlatformsVisible: false,
                uniqSocialPlatformVal: '',
                uniqSocialPlatformName: '',
                /* 修改邮件地址 */
                email_editing: false,
                email_saving: false,
                contactMerged: false,
                // CrmInputArea 询盘信息
                transactionTime: '',
                estimatedInquiryAmount: null,
                estimatedInquiryAmountCurrency: 'CNY',
                transactionInfo: null,
                isMainInquiry: false,
                prevLabelData: [],
                contactId: '', // 联系人id
                inquiryId: '', // 线索id
                corp_item_all: [],
                error_countryArea: false,
                value: '',
                checkedColumn: {
                    offset: [1, 1],
                    width: '',
                    key: ''
                },
                parentFiled: '',
                table: null,
                rowIndex: '',
                editKey: '',
                /* 邮箱后缀查重 */
                uniqEmailSuffixVisible: false,
                uniqEmailSuffixVal: '',
                contactAddressLatLng: '' // 联系地址经纬度
            };
        },
        created() {
            if (this.currentTable === 'customer') {
                util.setCurrentPath(this, 'myCustomer');
            }
        },
        mounted() {
        },
        methods: {
            update_showPopper(val, colIndex) {
                this.$emit('update_showPopper', val, colIndex);
            },
            updateList(checkAll, column, colIndex) {
                this.$emit('update_query', this.config_tableFilter[column.field].query, column)
                this.$emit('update:order_column', this.order_column);
                this.$emit('update:order_type', this.order_type);
                this.$emit('update:storageName_orderColumn', this.storageName_orderColumn);
                this.$emit('updateList', checkAll, column, colIndex);
            },
            addTableListenerScroll() {
                this.$nextTick(() => {
                    this.table = document.querySelector('.vxe-table--body-wrapper');
                    let scrollHandle = () => {
                        if (this.visibleEdit) {
                            this.clearEditPopperComponent();
                        }
                    };
                    this.table.addEventListener('scroll', scrollHandle);
                });
            },
            // 表格表头单元格 class 方法
            headerCellClass({ column }) {
                const result = [];
                // 如果可调整列宽, 则设置相应 class
                if (column.resizable) {
                    result.push('resizable-col');
                }
                // 有 tip 提示的 column , 指定特殊 class , 修改 cell 的 padding 以容纳 tip 和筛选按钮
                if (this.currentTable !== 'contact') {
                    if (['cpTouchCount', 'lastFollowupTime', 'updateTime', 'follow_up_count'].includes(column.property)) {
                        const filterSet = this.config_tableFilter[column.property];
                        if (filterSet && filterSet.filter) {
                            result.push('hasTipAndFilterCell');
                        }
                    }
                }
                return result.join(' ');
            },
            /* 多选操作 */
            // 指定表格行数据 key
            getRowKey() {
                switch (this.currentTable) {
                    case 'customer':
                        return 'companyId';
                    case 'inquiry':
                        return 'inquiryId';
                    case 'contact':
                        return 'id';
                    default:
                        return 'companyId';
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
                            click: this.$parent.edit_columns
                        }
                    })
                ]);
            },
            // 首字母小写
            firstLowerCase(str) {
                return `${str[0].toLowerCase()}${str.slice(1)}`;
            },
            // 点击编辑
            handleClickEdit(column, row, rowIndex, e) {
                console.log(column);
                console.log(row);
                console.log(rowIndex)
                if (!this.table) {
                    this.addTableListenerScroll();
                }
                this.parentFiled = column.parentId;
                let key = column.key;
                if (this.currentTable === 'customer') {
                    key = column.storageName ? column.storageName : this.firstLowerCase(column.key.substring(2));
                }
                this.$set(this.checkedColumn, 'key', key);
                if (this.parentFiled === 1) {
                    this.corp_item_all = this.corp_items(this.corp_columns_authorized).filter(item => item.storageName === key);
                    this.get_company_detail(row.companyId);
                } else if (this.parentFiled === 2) {
                    this.corp_item_all = this.contact_items(this.contact_columns_authorized).filter(item => item.storageName === key);
                    this.get_contact_detail(row.contactId);
                } else if (this.parentFiled === 3) {
                    this.corp_item_all = this.inquiry_items(this.inquiry_columns_authorized).filter(item => item.storageName === key);
                    this.get_inquiry_detail(row.inquiryId);
                } else {
                    this.$Message.warning(this.$t('crm.Table.system_fields_cannotEdit'));
                    return;
                }
                const path = e.path || (e.composedPath && e.composedPath());
                const currentTarget = Array.isArray(path) ? path[3] : e.srcElement.offsetParent; // 赋值当前点击的编辑
                this.$set(this.checkedColumn, 'width', column.width + 90);
                this.rowIndex = rowIndex;
                this.editKey = column.key;
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
                                if (this.$refs.crmInputArea.$refs[key]) {
                                    this.$refs.crmInputArea.$refs[key][0].focus();
                                }
                            });
                        });
                    } else {
                        this.prevTarget = currentTarget;
                        this.visibleEdit = true;
                        setTimeout(() => {
                            if (this.$refs.crmInputArea.$refs[key]) {
                                this.$refs.crmInputArea.$refs[key][0].focus();
                            }
                        }, 100);
                    }
                }
            },
            // 获取公司信息详情
            get_company_detail(companyId) {
                this.loading = true;
                this.detailData = {};
                crmCompany.getCompany({ id: companyId }).then(response => {
                    if (response.code === '1') {
                        this.detailData = response.data;
                        this.tempDetail = this.$deepClone(this.detailData);
                        if (this.tempDetail.companyPicture) {
                            this.detailPictures = this.tempDetail.companyPicture.split(';').map(item => {
                                return {
                                    url: item
                                };
                            });
                        }
                        // 格式化多选字符串值
                        this.corp_item_all.filter(item => item.colType === 'selectMultiple').forEach(item => {
                            this.tempDetail[item.storageName] = this.$options.filters.parseArray(this.tempDetail[item.storageName]);
                        });
                    } else {
                        this.$Message.error(this.$t('crm.Detail.error_getCompanyInfo'));
                    }
                    this.loading = false;
                }, error => {
                    this.loading = false;
                }).catch(error => {
                    this.loading = false;
                });
            },
            // 获取联系人详情
            get_contact_detail(contactId) {
                this.loading = true;
                this.contactId = contactId;
                this.detailData = {};
                crmContacts.getContacts({ id: contactId }).then(response => {
                    if (response.code === '1') {
                        this.detailData = response.data;
                        this.detailData.phone = this.detailData.phone ? this.detailData.phone.split(',') : [''];
                        if (this.detailData.socialNetworkingPlatform) {
                            let temp = [{
                                attrName: '',
                                attrValue: '',
                                isShow: false
                            }];
                            try {
                                temp = JSON.parse(this.detailData.socialNetworkingPlatform).length ? JSON.parse(this.detailData.socialNetworkingPlatform) : [{
                                    attrName: '',
                                    attrValue: '',
                                    isShow: false
                                }];
                            } catch (e) {
                            }
                            this.detailData.socialNetworkingPlatform = temp.length ? temp.map(item => {
                                if (item.attrName) {
                                    return {
                                        attrId: item.attrId || this.getPlatformId(item.attrName),
                                        attrName: item.attrName,
                                        attrValue: item.attrValue,
                                        isShow: this.socialPlatformIds.some((self) => item.attrName === self.attrName && self.socialValue === '1')
                                    };
                                }
                                return {
                                    attrName: '',
                                    attrValue: '',
                                    isShow: false
                                };
                            }) : [{
                                attrName: '',
                                attrValue: '',
                                isShow: false
                            }];
                        } else if (this.detailData.socialNetworkingPlatform === null) {
                            this.detailData.socialNetworkingPlatform = [{
                                attrName: '',
                                attrValue: '',
                                isShow: false
                            }];
                        }

                        this.tempDetail = this.$deepClone(this.detailData);
                        if (this.tempDetail.hasOwnProperty('phone')) {
                            this.tempDetail.phone = this.tempDetail.phone.length ? this.tempDetail.phone.map(item => {
                                return {
                                    phoneNumber: item
                                };
                            }) : [{ phoneNumber: '' }];
                        }

                        this.detailPictures = this.detailData.picture ? this.detailData.picture.split(';').map(item => {
                            return {
                                url: item
                            };
                        }) : [];

                        // 格式化多选字符串值
                        this.corp_item_all.filter(item => item.colType === 'selectMultiple').forEach(item => {
                            this.tempDetail[item.storageName] = this.$options.filters.parseArray(this.tempDetail[item.storageName]);
                        });
                    } else {
                        this.$Message.error(this.$t('crm.Detail.error_getContactInfo'));
                    }
                    this.loading = false;
                }, error => {
                    this.loading = false;
                }).catch(error => {
                    this.loading = false;
                });
            },
            // 获取询盘详情
            get_inquiry_detail(inquiryId) {
                this.loading = true;
                this.inquiryId = inquiryId;
                crmInquiry.getInquiry({ id: this.inquiryId }).then(async response => {
                    if (response.code === '1') {
                        this.detailData = response.data;
                        // 格式化多选字符串值
                        this.corp_item_all.filter(item => item.colType === 'selectMultiple').forEach(item => {
                            const temp = this.$options.filters.parseArray(this.detailData[item.storageName]);
                            if (item.fieldType === 'custom') {
                                this.detailData[item.storageName] = temp;
                            } else if (item.fieldType === 'default') {
                                if (this.detailData[item.storageName] && this.detailData[item.storageName] !== '[]' && !temp.length) {
                                    this.detailData[item.storageName] = [this.detailData[item.storageName]];
                                } else {
                                    this.detailData[item.storageName] = temp;
                                }
                            }
                        });

                        // 成交数据处理
                        this.transactionTime = this.detailData.transactionTime ? new Date(this.detailData.transactionTime) : new Date();
                        this.estimatedInquiryAmount = this.detailData.estimatedInquiryAmount ? Utils.transformMoney(this.detailData.estimatedInquiryAmount) : this.detailData.estimatedInquiryAmount;
                        this.estimatedInquiryAmountCurrency = this.detailData.estimatedInquiryAmountCurrency ? this.detailData.estimatedInquiryAmountCurrency : 'CNY';
                        this.transactionInfo = this.handleTransactionInfo(this.detailData.transactionInfo, this.detailData.sysCreateFlag);
                        const label = this.detailData.label ? JSON.parse(this.detailData.label) : [];
                        this.prevLabelData = label;
                        this.detailData.label = label.map(item => {
                            return item.attrName;
                        });
                        this.tempDetail = this.$deepClone(this.detailData);
                    } else {
                        this.$Message.error(this.$t('crm.Detail.error_getInquiryInfo'));
                    }
                    this.loading = false;
                }, error => {
                    this.loading = false;
                }).catch(error => {
                    this.loading = false;
                });
            },

            // 联系人字段查重(邮箱/电话/WhatsApp / Instagram)
            async uniqContact({ field, value, uniqDirectly, noSuccessNotice }) {
                // 组装发送数据, 组装多语言
                const params = {
                    orgId: this.enterpriseId,
                    id: this.contactId
                };
                let langObj = {};
                switch (field) {
                    case 'email':
                        params.email = value.trim();
                        langObj = {
                            noRepeatTip: this.$t('crm.Modal.success_uniqMail'),
                            emptyParamTip: this.$t('crm.Modal.error_noEmailToUniq')
                        };
                        break;
                    case 'phone':
                        params.phone = value.trim();
                        langObj = {
                            noRepeatTip: this.$t('crm.Modal.success_uniqPhoneNumber'),
                            emptyParamTip: this.$t('crm.Modal.error_noPhoneToUniq')
                        };
                        break;
                    case 'WhatsApp':
                        params.whatsApp = value.trim();
                        langObj = {
                            noRepeatTip: this.$t('crm.Modal.success_uniqWhatsApp'),
                            emptyParamTip: this.$t('crm.Modal.error_noWhatsAppToUniq')
                        };
                        break;
                    case 'Instagram':
                        params.instagram = value.trim();
                        langObj = {
                            noRepeatTip: this.$t('crm.Modal.success_uniqInstagram'),
                            emptyParamTip: this.$t('crm.Modal.error_noInstagramToUniq')
                        };
                        break;
                }

                if (value.trim()) {

                    // 发送请求
                    const res_uniqContact = await checkContact(params);

                    if (res_uniqContact.code === '1') {
                        this.uniqContactField = field;
                        this.uniqContactVal = value;
                        this.uniqContactVisible = true;
                    } else {
                        if (!noSuccessNotice) {
                            this.$Message.success(langObj.noRepeatTip);
                        }
                    }
                } else {
                    this.$Message.error(langObj.emptyParamTip);
                }
            },
            // 处理成交信息
            handleTransactionInfo(val, sysCreateFlag) {
                // 无成交信息, 直接退出流程
                if (!val) {
                    return;
                }

                let result = '';
                // 根据不同成交信息来源返回不同数据
                switch (`${sysCreateFlag}`) {
                    case '1':
                        // magento
                        result = JSON.parse(val);
                        result = `来自网站的订单信息
                        Order Number: ${result.orderId}
                        1. Order Summary:
                        Order Total: ${result.cart.subtotal}
                        ${result.cart.summary_count} item${(result.cart.summary_count > 1) ? 's' : ''} in Cart:
                        ${result.cart.items.map((item, index) => `        ${index + 1}. ${item.product_name}; Qty: ${item.qty}; Price: ${item.product_price}; ${item.options.map(option => `${option.label}: ${option.value}`).join('; ')}\n            商品链接: ${item.product_url};`).join('\n')}
                        2. Shipping Address:
                        ${result.shippingAddress.first_name || ''} ${result.shippingAddress.last_name || ''}
                        ${result.shippingAddress.street_address || ''}
                        ${result.shippingAddress.city_state_province_postal_code || ''}
                        ${result.shippingAddress.country || ''}
                        ${result.shippingAddress.phone || ''}
                        3. Billing Address:
                        ${result.billingAddress.first_name || ''} ${result.billingAddress.last_name || ''}
                        ${result.billingAddress.street_address || ''}
                        ${result.billingAddress.city_state_province_postal_code || ''}
                        ${result.billingAddress.country || ''}
                        ${result.billingAddress.phone || ''}
                        `;
                        result = result.replace(/\n(\n)*( )*(\n)*\n/g, '\n');
                        break;
                    case '2':
                        // shopify
                        result = JSON.parse(val);
                        result = `来自网站的订单信息
                        Order Number: ${result.order_number}
                        1. Order Summary:
                        total price: ${result.total_price} ${result.presentment_currency}; total line items price: ${result.total_line_items_price} ${result.presentment_currency}; total tax: ${result.total_tax} ${result.presentment_currency}; total tip_received: ${result.total_tip_received} ${result.presentment_currency};
                        ${result.line_items.length} Item${(result.line_items.length > 1) ? 's' : ''} in Cart:
                        ${result.line_items.map((item, index) => `        ${index + 1}. ${item.title}; Qty: ${item.quantity}; Price: ${item.price} ${result.presentment_currency};`).join('\n')}
                        2. Shipping Address:
                        ${result.shipping_address.name || ''}
                        ${result.shipping_address.company || ''}
                        ${result.shipping_address.address1 || ''} ${result.shipping_address.address2 || ''}
                        ${result.shipping_address.city || ''} ${result.shipping_address.province || ''} ${result.shipping_address.zip || ''}
                        ${result.shipping_address.country || ''}
                        ${result.shipping_address.phone || ''}
                        3. Billing Address:
                        ${result.billing_address.name || ''}
                        ${result.billing_address.company || ''}
                        ${result.billing_address.address1 || ''} ${result.billing_address.address2 || ''}
                        ${result.billing_address.city || ''} ${result.billing_address.province || ''} ${result.billing_address.zip || ''}
                        ${result.billing_address.country || ''}
                        ${result.billing_address.phone || ''}
                        `;
                        result = result.replace(/\n(\n)*( )*(\n)*\n/g, '\n');
                        break;
                    default:
                        // 默认手动创建
                        result = val;
                }

                return result;
            },
            // 处理社交平台数据
            getPlatformId(attrName) {
                let result = '';
                this.selectOptions.socialNetworkingPlatform.some(i => {
                    if (i.attrName === attrName) {
                        result = i.attrId;
                        return true;
                    }
                });
                return result;
            },
            /* 公司去重 */
            uniqCompany() {
                if (this.tempDetail.companyName !== '') {
                    const data = {
                        orgId: this.enterpriseId,
                        companyName: String(this.tempDetail.companyName),
                        id: this.tempDetail.id
                    };
                    crmCompany.sameCompanyName(data).then(response => {
                        if (response.data && this.tempDetail.companyName !== this.detailData.companyName) {
                            this.$Message.error(this.$t('crm.Modal.error_existedCompanyName'));
                        } else {
                            this.$Message.success(this.$t('crm.Modal.success_uniqCompanyName'));
                        }
                    });
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_emptyCompanyName'));
                }
            },
            async ok() {
                // 如果当前正在录入, 则退出录入
                if (this.loading) {
                    this.$Message.warning(this.$t('mail.customerBox.requestTip'));
                    return;
                }
                // 图片是否上传完成
                if (Array.isArray(this.detailPictures) && this.detailPictures.some(item => item.uploading)) {
                    this.$Message.warning(this.$t('crm.Modal.info_contactPictureUploading'));
                    return;
                }
                // 校验社交平台信息是否填完整
                if (this.tempDetail.socialNetworkingPlatform && this.tempDetail.socialNetworkingPlatform.length && (this.socialPlatformsFlag() === '1' || this.socialPlatformsFlag() === '2')) {
                    const str = this.socialPlatformsFlag() === '2' ? '社交平台分类不能为空' : '社交平台内容不能为空';
                    this.$Message.error(str);
                    return;
                }
                if (this.parentFiled === 1) {
                    // 各种合法性校验
                    // 公司名不能为空
                    if (this.tempDetail.companyName && !this.tempDetail.companyName.trim()) {
                        this.$Message.error(this.$t('crm.Modal.error_emptyCompanyName'));
                        return;
                    }
                    // 必填字段校验
                    let tempErrorField = '';
                    let countryAreaName = '';
                    if (this.corp_item_all.some(item => {
                        if (item.mustInput === 1) {
                            if (item.storageName === 'companyPicture') {
                                if (this.detailPictures.length === 0) {
                                    tempErrorField = item.cname;
                                    return true;
                                }
                            } else {
                                if (!this.tempDetail[item.storageName] || this.tempDetail[item.storageName].length === 0) {
                                    if (item.isOnlyRead !== 1) {
                                        tempErrorField = item.cname;
                                        return true;
                                    }
                                }
                            }
                        }
                    })) {
                        this.$Message.error(`${tempErrorField}${this.$t('crm.Modal.error_canNotBeEmpty')}`);
                        return;
                    }
                    // 正体
                    this.loading = true;
                    // 校验公司名
                    if (this.corp_item_all && this.corp_item_all.some(item => item.storageName === 'companyName') && this.tempDetail.companyName !== this.detailData.companyName) {
                        const res_uniqCompanyName = await crmCompany.sameCompanyName({
                            orgId: this.enterpriseId,
                            companyName: this.tempDetail.companyName,
                            id: this.tempDetail.id
                        });
                        if (res_uniqCompanyName.data && this.tempDetail.companyName !== this.detailData.companyName) {
                            this.$Message.error(this.$t('crm.Modal.error_existedCompanyName'));
                            this.loading = false;
                        }
                    }

                    // 校验国家地区, 非只读情况下
                    if (this.loading) {
                        const temp = this.corp_item_all.find(item => item.storageName === 'countryArea');
                        if (temp && this.tempDetail.countryArea) {
                            if (temp.isOnlyRead !== 1) {
                                const res_getCountryArea = await this.$commonApi.getDetailByCode({
                                    divCode: this.tempDetail.countryArea
                                });
                                if (!(Array.isArray(res_getCountryArea.data) && res_getCountryArea.data.length)) {
                                    this.$Message.error(this.$t('crm.Modal.error_countryAreaFormat'));
                                    this.error_countryArea = true;
                                    this.loading = false;
                                } else {
                                    countryAreaName = this.lang === 'zh-CN' ? `${res_getCountryArea.data[0].countryName}-${res_getCountryArea.data[0].divisionCnname}` : `${res_getCountryArea.data[0].countryEnname}-${res_getCountryArea.data[0].divisionEnname}`;
                                }
                            }
                        }
                    }

                    // 校验都通过
                    if (this.loading) {
                        const send_data = {
                            id: this.tempDetail.id,
                            orgId: this.enterpriseId,
                            companyName: this.detailData.companyName
                        };
                        this.corp_item_all.forEach(item => {
                            if (item.isOnlyRead !== 1) {
                                switch (item.storageName) {
                                    case 'companyPicture':
                                        this.tempDetail.companyPicture = this.detailPictures.map(pic => pic.url).join(';');
                                        send_data.companyPicture = this.detailPictures.map(pic => pic.url).join(';');
                                        break;
                                    case 'contactAddress':
                                        send_data[item.storageName] = this.tempDetail[item.storageName];
                                        send_data.point = this.tempDetail.point;
                                        break;
                                    default:
                                        switch (item.colType) {
                                            case 'selectMultiple':
                                                const temp = Array.isArray(this.tempDetail[item.storageName]) ? JSON.stringify(this.tempDetail[item.storageName]) : JSON.stringify([]);
                                                send_data[item.storageName] = temp;
                                                break;
                                            case 'select':
                                                send_data[item.storageName] = this.tempDetail[item.storageName] || '';
                                                break;
                                            default:
                                                send_data[item.storageName] = this.tempDetail[item.storageName];
                                        }
                                }
                            }
                        });
                        // /* 检验字段是否超长 */
                        if (this.check_length_default('corp_field_long_limit', send_data) || this.check_length_custom('corp_item_custom', this.item_custom, send_data)) {
                            this.loading = false;
                            return false;
                        }
                        const updateFieldData = {
                            userId: this.userId,
                            userName: this.fullName,
                            idStr: this.tempDetail.id,
                            orgId: this.enterpriseId,
                            tableType: 1,
                            fieldName: this.checkedColumn.key,
                            fieldValue: send_data[this.checkedColumn.key]
                        };
                        if (this.checkedColumn.key === 'contactAddress') {
                            if (this.contactAddressLatLng) {
                                updateFieldData.point = `${this.contactAddressLatLng.lng},${this.contactAddressLatLng.lat}`;
                            }
                        }
                        crmCommon.updateField(updateFieldData).then(response => {
                            this.loading = false;
                            if (response.code === '1') {
                                this.$saveLog({
                                    operateType: 2,
                                    operateModule: 1,
                                    companyId: this.detailData.id,
                                    targetId: this.detailData.id,
                                    enterpriseId: this.enterpriseId.toString(),
                                    userId: this.userId,
                                    fullName: this.fullName,
                                    prevObj: Object.assign({}, this.detailData),
                                    currentObj: Object.assign({}, this.tempDetail)
                                }, 'company');
                                this.$Message.success(this.$t('crm.Detail.success_editTable'));
                                if (this.checkedColumn.key === 'countryArea') {
                                    this.tableData[this.rowIndex][this.editKey] = countryAreaName.replace(/-未知地区|-unknown area/g, '');
                                } else {
                                    this.tableData[this.rowIndex][this.editKey] = send_data[this.checkedColumn.key];
                                }
                                this.contactAddressLatLng = '';
                                this.clearEditPopperComponent();
                            } else {
                                this.$Message.error(this.$t('crm.Detail.error_editTable'));
                            }
                        }, error => {
                            this.loading = false;
                        }).catch(error => {
                            this.loading = false;
                        });
                    }
                }
                if (this.parentFiled === 2) {
                    // 联系人邮箱是否编辑完成
                    // if (this.email_editing) {
                    //     this.$Message.error(this.$t('crm.Modal.error_editMailUnfinished'));
                    //     return;
                    // }
                    // 联系人姓名不能为空
                    if (this.tempDetail.nickName.trim() === '') {
                        this.$Message.error(this.$t('crm.Modal.error_emptyNickName'));
                        return;
                    }
                    // 必填字段校验
                    let tempErrorField = '';
                    let socialNetworkingPlatformVal = [];
                    if (this.corp_item_all.some(item => {
                        // 特殊字段, 值为对象数组, phone 或 socialNetworkingPlatform
                        if (item.mustInput === 1) {
                            if (item.storageName === 'phone') {
                                tempErrorField = item.cname;
                                return !this.tempDetail[item.storageName].some(item => item.phoneNumber.trim().length);
                            } else if (item.storageName === 'socialNetworkingPlatform') {
                                tempErrorField = item.cname;
                                return !this.tempDetail[item.storageName].some(item => item.attrName && item.attrValue.trim().length);
                            } else if (item.storageName === 'picture') {
                                if (this.detailPictures.length === 0) {
                                    tempErrorField = item.cname;
                                    return true;
                                }
                            } else {
                                // 常规字段, 值为字符串或数组类型
                                if (!this.tempDetail[item.storageName] || this.tempDetail[item.storageName].length === 0) {
                                    if (item.isOnlyRead !== 1) {
                                        tempErrorField = item.cname;
                                        return true;
                                    }
                                }
                            }
                        }
                    })) {
                        this.$Message.error(`${tempErrorField}${this.$t('crm.Modal.error_canNotBeEmpty')}`);
                        return;
                    }

                    // 如果当前正在录入, 则退出录入
                    if (this.loading) {
                        this.$Message.warning(this.$t('mail.customerBox.requestTip'));
                        return;
                    }
                    // 处理 whatsApp中间的空格
                    this.tempDetail.whatsApp = this.tempDetail.whatsApp ? this.tempDetail.whatsApp.replace(/( )|(　)/g, '') : '';
                    // 处理 手机号中间的空格
                    if (this.tempDetail.phone && this.tempDetail.phone.length) {
                        this.tempDetail.phone.forEach(item => {
                            item.phoneNumber = item.phoneNumber.replace(/( )|(　)/g, '');
                        });
                    }
                    // 正体
                    this.loading = true;
                    const temp = Object.assign({}, this.tempDetail);
                    let have_phone = false; // 标记权限接口返回的字段中是否有 phone 字段
                    const send_data = {
                        id: this.contactId,
                        orgId: this.enterpriseId
                    };
                    this.corp_item_all.forEach(item => {
                        if (item.isOnlyRead !== 1) {
                            switch (item.storageName) {
                                case 'email':
                                    send_data.email = temp.email;
                                    // 目前不可编辑联系人邮箱
                                    break;
                                case 'phone':
                                    have_phone = true;
                                    break;
                                case 'picture':
                                    send_data.picture = this.detailPictures.map(item => item.url).join(';');
                                    temp.picture = this.detailPictures.map(item => item.url).join(';');
                                    break;
                                case 'socialNetworkingPlatform':
                                    temp.socialNetworkingPlatform = (Array.isArray(temp.socialNetworkingPlatform) && temp.socialNetworkingPlatform.length) ? temp.socialNetworkingPlatform.map(item => {
                                        if (item.attrName && item.attrValue) {
                                            return {
                                                attrId: this.getPlatformId(item.attrName),
                                                attrName: item.attrName,
                                                attrValue: item.attrValue,
                                                isShow: this.socialPlatformIds.some((self) => item.attrName === self.attrName && self.socialValue === '1')
                                            };
                                        }
                                    }).filter(item => {
                                        return !(!item || item === '');
                                    }) : [];
                                    socialNetworkingPlatformVal = temp.socialNetworkingPlatform;
                                    send_data.socialNetworkingPlatform = JSON.stringify(temp.socialNetworkingPlatform);
                                    break;
                                default:
                                    switch (item.colType) {
                                        case 'selectMultiple':
                                            const str = Array.isArray(temp[item.storageName]) ? JSON.stringify(temp[item.storageName]) : JSON.stringify([]);
                                            send_data[item.storageName] = str;
                                            break;
                                        case 'select':
                                            send_data[item.storageName] = temp[item.storageName] || '';
                                            break;
                                        default:
                                            send_data[item.storageName] = temp[item.storageName];
                                    }
                            }
                        }
                    });
                    if (this.checkedColumn.key === 'email') {
                        // 如果编辑前后一致, 直接提示"编辑成功", 不发请求
                        const oldEmail = this.detailData.email ? this.detailData.email.trim() : this.detailData.email;
                        if (oldEmail === send_data.email) {
                            this.clearEditPopperComponent();
                            this.$Message.success(this.$t('crm.UniSet.success_edit'));
                            return;
                        }
                        // 邮箱格式是否规范
                        const emailReg = Utils.regExp.fullEmail;
                        if (send_data.email && !emailReg.test(send_data.email)) {
                            this.$Message.error(this.$t('crm.Modal.error_emailFormat'));// 停止录入操作
                            this.loading = false;
                            return;
                        }
                        if (send_data.email) {
                            // 邮箱去重
                            const res_uniqEmail = await crmContacts.sameContactsEmail({
                                orgId: this.enterpriseId,
                                email: send_data.email
                            });
                            if (res_uniqEmail.code === '1') {
                                // 如果邮件有重复
                                if (this.allowMerge === '1') {
                                    // 如果允许合并
                                    if (!this.contactMerged) {
                                        // 未合并到已有联系人, 弹出合并提示并退出流程
                                        this.$Message({
                                            dangerouslyUseHTMLString: true,
                                            type: 'error',
                                            message: this.$t('crm.Modal.error_existedEmailNeedMerge')
                                        });
                                        this.loading = false;
                                        return;
                                    }
                                } else {
                                    // 弹出查重框
                                    this.uniqContact({ field: 'email', value: send_data.email, uniqDirectly: true });
                                    // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                                    setTimeout(() => {
                                        this.$Message.warning(this.$t('crm.Modal.info_enterUniqContact').replace(/\$field/g, this.$t('crm.Table.col_email')));
                                    });
                                    // 停止录入操作
                                    this.loading = false;
                                    return;
                                }
                            }
                        }
                        // 邮箱后缀查重
                        if (this.showUniq.emailSuffix === '1' && send_data.email) {
                            const res_uniqEmailSuffix = await this.$commonApi.getContactRepeatData({
                                orgId: this.enterpriseId,
                                emailSuffix: GET_EMAIL_SUFFIX(send_data.email)
                            });
                            if (res_uniqEmailSuffix.code === '1') {
                                if (Array.isArray(res_uniqEmailSuffix.data) && res_uniqEmailSuffix.data.length) {
                                    const companyId = this.tableData[this.rowIndex].companyId;
                                    // 有重复
                                    if (!res_uniqEmailSuffix.data.some(item => `${item.companyId}` === `${companyId}`)) {
                                        // 如果重复数据中没有当前客户 id

                                        // 弹出查重框
                                        this.uniqEmailSuffixVal = send_data.email;
                                        this.uniqEmailSuffixVisible = true;

                                        // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                                        setTimeout(() => {
                                            this.$Message.warning(this.$t('crm.Modal.info_enterUniqEmailSuffix').replace(/\$field/g, GET_EMAIL_SUFFIX(send_data.email)));
                                        });
                                        // 停止录入操作
                                        this.loading = false;
                                        // 停止编辑操作
                                        return;
                                    }
                                }
                            }
                        }
                    }
                    // WhatsApp 查重
                    if (this.loading && this.checkedColumn.key === 'whatsApp' && this.showUniq.whatsapp === '1' && temp.hasOwnProperty('whatsApp') && temp.whatsApp && temp.whatsApp.trim()) {
                        if (!(Utils.regExp.whatsApp.test(this.tempDetail.whatsApp))) {
                            this.$Message.error(this.$t('crm.Modal.error_whatsAppFormat'));
                            return;
                        }
                        // whatsApp 查重
                        const res_uniqContact = await checkContact({
                            orgId: this.enterpriseId,
                            id: this.contactId,
                            whatsApp: temp.whatsApp.trim()
                        });
                        if (res_uniqContact.code === '1') {
                            // 弹出查重框
                            this.uniqContact({ field: 'WhatsApp', value: temp.whatsApp, uniqDirectly: true });
                            // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                            setTimeout(() => {
                                this.$Message.warning(this.$t('crm.Modal.info_enterUniqContact').replace(/\$field/g, 'WhatsApp'));
                            });
                            // 停止录入操作
                            this.loading = false;
                        }
                    }
                    // 电话查重
                    if (this.loading && have_phone) {
                        // 电话
                        temp.phone = temp.phone ? [...new Set(temp.phone.map(item => {
                            return item.phoneNumber;
                        }).filter(item => {
                            return !(!item || item === '');
                        }))] : null;
                        // 不查重this.showUniq.phone，'0'不查重，'1'查重
                        if (this.showUniq.phone !== '0' && temp.phone.length > 0) {
                            const res_uniqPhone = await crmContacts.isSameField({
                                contactsId: this.contactId,
                                orgId: this.enterpriseId,
                                field: 'phone',
                                values: temp.phone.join(',')
                            });

                            if (res_uniqPhone.code === '1') {
                                // 弹出查重框
                                this.uniqContact({ field: 'phone', value: temp.phone[0], uniqDirectly: true });
                                // 弹出重复警告(等查重框弹出后再弹出, 避免被查if (uniqDirectly) {重框遮罩层盖住)
                                setTimeout(() => {
                                    this.$Message.warning(this.$t('crm.Modal.info_enterUniqContact').replace(/\$field/g, this.$t('crm.Table.col_phone')));
                                });
                                // 停止录入操作
                                this.loading = false;
                            } else {
                                send_data.phone = temp.phone.join(',');
                            }
                        } else {
                            send_data.phone = temp.phone.join(',');
                        }
                    }
                    // Instagram 查重
                    if (this.loading && this.showUniq.instagram === '1' && temp.hasOwnProperty('instagram') && temp.instagram && temp.instagram.trim()) {
                        // Instagram 查重
                        const res_uniqContact = await checkContact({
                            orgId: this.enterpriseId,
                            id: this.contactId,
                            instagram: temp.instagram.trim()
                        });

                        if (res_uniqContact.code === '1') {
                            // 弹出查重框
                            this.uniqContact({ field: 'Instagram', value: temp.instagram, uniqDirectly: true });
                            // 弹出重复警告(等查重框弹出后再弹出, 避免被查重框遮罩层盖住)
                            setTimeout(() => {
                                this.$Message.warning(this.$t('crm.Modal.info_enterUniqContact').replace(/\$field/g, 'Instagram'));
                            });
                            // 停止录入操作
                            this.loading = false;
                        }
                    }
                    // 社交平台查重
                    if (this.loading && this.showUniq.socialPlatform === '1' && temp.socialNetworkingPlatform && temp.socialNetworkingPlatform.length) {
                        let result = await this.socialPlatformsCheckDuplicate(temp.socialNetworkingPlatform);
                        if (result.length) {
                            this.$Message.warning(this.$t('crm.Modal.info_enterUniqSocialPlatformLink').replace(/\$fieldName/g, result[0].attrName).replace(/\$fieldVal/g, result[0].attrValue));
                            // 停止录入操作
                            this.loading = false;
                        }
                    }
                    // 查重通过, 数据格式化, 存入待发送数据对象中
                    if (this.loading) {
                        /**
                         * @Description: 与后端确认，更新联系人信息的接口中，nickName不传/传空都不会更改原值。
                         *               所以此处去掉改行代码，在nickName被设置为只读时，update接口不会传这个字段给后台。
                         * @author 杨娣
                         * @date 2020/6/14
                        */
                        // send_data.nickName = send_data.nickName || '';

                        /* 检验字段是否超长 */
                        if (this.check_length_default('contact_field_long_limit', send_data) || this.check_length_custom('contact_item_custom', this.item_custom, send_data)) {
                            this.loading = false;
                            return false;
                        }
                        const updateFieldData = {
                            userId: this.userId,
                            userName: this.fullName,
                            idStr: this.tempDetail.id,
                            orgId: this.enterpriseId,
                            tableType: 2,
                            fieldName: this.checkedColumn.key,
                            fieldValue: send_data[this.checkedColumn.key]
                        };
                        crmCommon.updateField(updateFieldData).then(response => {
                            if (response.code === '1') {
                                const sentPrevObj = Object.assign({}, this.detailData);
                                if (sentPrevObj.phone.length === 1 && sentPrevObj.phone[0] === '') {
                                    sentPrevObj.phone = [];
                                } // 防止出现 prevObj.phone 为 [""] 而 currentObj.phone 为 [] 导致发送错误日志
                                const sentCurrentObj = Object.assign({}, temp);
                                sentCurrentObj.socialNetworkingPlatform = temp.socialNetworkingPlatform && temp.socialNetworkingPlatform.length > 0 ? temp.socialNetworkingPlatform.map(item => {
                                    return {
                                        attrId: item.attrId,
                                        attrName: item.attrName,
                                        attrValue: item.attrValue
                                    };
                                }) : [{
                                    attrName: '',
                                    attrValue: ''
                                }];
                                // 邮箱非必填
                                if (this.checkedColumn.key === 'email' && send_data.email) {
                                    crmClue.mergerMail({
                                        emailAddress: send_data.email,
                                        createUserId: this.tableData[this.rowIndex].companyManagerIds,
                                        orgId: this.enterpriseId,
                                        inquiryId: Array.isArray(this.detailData.inquiryList) ? this.detailData.inquiryList[0].id : undefined
                                    });
                                    // 联系人邮箱关联到邮件系统
                                    crmClue.addTimeAxis({
                                        address: send_data.email,
                                        createUserId: this.tableData[this.rowIndex].companyManagerIds,
                                        orgId: this.enterpriseId,
                                        contactsId: this.detailData.id,
                                        companyId: this.tableData[this.rowIndex].companyId,
                                        inquiryId: Array.isArray(this.detailData.inquiryList) ? this.detailData.inquiryList[0].id : undefined
                                    });
                                }
                                // 这里是因为 socialNetWorkingPlatform 数组项对象会莫名其妙地多个 type: '' 属性,一直没找到原因,干脆重新弄一个对象算了
                                this.$saveLog({
                                    operateType: 2,
                                    operateModule: 2,
                                    contactId: this.contactId,
                                    targetId: this.contactId,
                                    enterpriseId: this.enterpriseId.toString(),
                                    userId: this.userId,
                                    fullName: this.fullName,
                                    prevObj: sentPrevObj,
                                    currentObj: sentCurrentObj
                                }, 'contact');
                                // // 如果有更改主要联系人, 需要保存询盘日志
                                // if (data.isMainContact === 2 && !this.initial_isMainContact) {
                                //     this.saveLog_mainContact(data.inquiryId, this.contactId, prev_contactId);
                                // }
                                this.$Message.success(this.$t('crm.Detail.success_editTable'));
                                if (temp.phone.length === 0) {
                                    temp.phone = [''];
                                }
                                if (!temp.socialNetworkingPlatform || temp.socialNetworkingPlatform.length === 0) {
                                    temp.socialNetworkingPlatform = [{
                                        attrName: '',
                                        attrValue: '',
                                        isShow: false
                                    }];
                                }
                                if (this.checkedColumn.key === 'socialNetworkingPlatform') {
                                    this.tableData[this.rowIndex][this.editKey] = socialNetworkingPlatformVal;
                                } else {
                                    this.tableData[this.rowIndex][this.editKey] = send_data[this.checkedColumn.key];
                                }
                                this.clearEditPopperComponent();
                            } else {
                                if (response.data && response.data['2-1003']) {
                                    this.$Message.error(this.$t('crm.Modal.error_enterpriseColleagueMail'));
                                } else {
                                    this.$Message.error(this.$t('crm.Detail.error_editTable'));
                                }
                            }
                        }, error => {
                            this.loading = false;
                        }).catch(error => {
                            this.loading = false;
                        });
                    }
                }
                if (this.parentFiled === 3) {
                    if (this.transactionMoney) {
                        const tempMoney = this.transactionMoney.replace(/,/g, '');
                        if (isNaN(Number(tempMoney)) && ![1, 2].includes(this.detailData.sysCreateFlag)) {
                            this.$Message.warning('成交金额只支持数字类型');
                            return;
                        }
                    }
                    // 各种合法性校验
                    // 成交时间不能为空
                    if (((this.current_followUp && this.current_followUp.transactionStatus) || this.detailData.transactionTime) && !(this.transactionTime instanceof Date && !isNaN(this.transactionTime.getTime()))) {
                        this.$Message.error(this.$t('crm.Html.empty_transactionTime'));
                        return;
                    }
                    // 产品分类不能为空
                    // if (this.checkedColumn.key === 'productCategory' && (!this.tempDetail.productCategory || !this.tempDetail.productCategory.length)) {
                    //     this.$Message.error(this.$t('crm.Modal.error_emptyProductCategory'));
                    //     return;
                    // }
                    // 询盘备注不能超过 20000 个字符
                    if (this.tempDetail.remark && this.tempDetail.remark.toString().replace(/[^\x00-\xff]/gi, '--').length > 20000) {
                        this.$Message.error(this.$t('crm.Modal.error_remarkLength'));
                        return;
                    }
                    this.tempDetail.estimatedInquiryAmount = this.estimatedInquiryAmount ? Number(this.estimatedInquiryAmount.replace(/,/g, '')) : this.estimatedInquiryAmount;
                    // this.tempDetail.estimatedInquiryAmountCurrency = this.estimatedInquiryAmountCurrency;
                    // 必填字段校验
                    let tempErrorField = '';
                    if (this.corp_item_all.some(item => {
                        if (item.mustInput === 1) {
                            switch (item.colType) {
                                case 'followUp':
                                    if (!this.tempDetail.followUpId.length) {
                                        if (item.isOnlyRead !== 1) {
                                            tempErrorField = this.$t('crm.Modal.inq_followUp');
                                            return true;
                                        }
                                    }
                                    break;
                                case 'label':
                                    if (item.storageName === 'label' && this.tempDetail.label.length === 0) {
                                        if (item.isOnlyRead !== 1) {
                                            tempErrorField = item.cname;
                                            return true;
                                        }
                                    }
                                    break;
                                default:
                                    if (!this.tempDetail[item.storageName] || this.tempDetail[item.storageName].length === 0) {
                                        if (item.isOnlyRead !== 1) {
                                            tempErrorField = item.cname;
                                            if (this.tempDetail[item.storageName] === 0) {
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                            }
                        }
                    })) {
                        this.$Message.error(`${tempErrorField}${this.$t('crm.Modal.error_canNotBeEmpty')}`);
                        return;
                    }

                    const send_data = {
                        id: this.inquiryId,
                        orgId: this.enterpriseId,
                        companyId: this.detailData.companyId
                    };
                    this.corp_item_all.forEach(item => {
                        if (item.isOnlyRead !== 1) {
                            switch (item.storageName) {
                                case 'label':
                                    send_data.label = JSON.stringify(this.getSelectedLabels(this.tempDetail.label, this.selectOptions.tag));
                                    break;
                                case 'followUp':
                                    send_data.followUpId = this.tempDetail.followUpId;
                                    if (this.current_followUp) {
                                        send_data.followUp = this.current_followUp.attrName;
                                        this.tempDetail.followUp = this.current_followUp.attrName;
                                    }
                                    break;
                                default:
                                    switch (item.colType) {
                                        case 'selectMultiple':
                                            const str = Array.isArray(this.tempDetail[item.storageName]) ? JSON.stringify(this.tempDetail[item.storageName]) : JSON.stringify([]);
                                            send_data[item.storageName] = str;
                                            break;
                                        case 'select':
                                            send_data[item.storageName] = this.tempDetail[item.storageName] || '';
                                            break;
                                        default:
                                            send_data[item.storageName] = this.tempDetail[item.storageName];
                                    }
                            }
                        }
                    });
                    // 就算没有"跟进状态"字段, 也要保存上 '0' , 不然编辑时不选跟进状态就会因为 followUpId 为 null 而无法保存
                    // 更正: 首先应考虑传原有的 followUpId 值, 以免跟进状态只读情况下, send_data 仍然传 '0' 更改原有跟进状态为'询盘'
                    // if (!send_data.followUpId) {
                    //     send_data.followUpId = this.detailData.followUpId || '0';
                    // }

                    /* 检验字段是否超长 */
                    // 如果成交数据可编辑, 此处校验时还要临时加上成交数据, 但不能放数据到 send_data 中, 编辑成交数据走 edit_clinchData 方法
                    // 拷贝原本要验证的数据
                    const tempData = this.$deepClone(send_data);
                    // tempData.estimatedInquiryAmount = this.estimatedInquiryAmount ? Number(this.estimatedInquiryAmount.replace(/,/g, '')) : this.estimatedInquiryAmount;
                    tempData.estimatedInquiryAmountCurrency = this.estimatedInquiryAmountCurrency;

                    if (this.check_length_default('inquiry_field_long_limit', tempData) || this.check_length_custom('inquiry_item_custom', this.item_custom, tempData)) {
                        return false;
                    }
                    // 正体
                    const updateFieldData = {
                        userId: this.userId,
                        userName: this.fullName,
                        idStr: this.tempDetail.id,
                        orgId: this.enterpriseId,
                        tableType: 3,
                        fieldName: this.checkedColumn.key,
                        fieldValue: tempData[this.checkedColumn.key]
                    };
                    this.loading = true;
                    crmCommon.updateField(updateFieldData).then(response => {
                        this.loading = false;
                        if (response.code === '1') {
                            // 如果是预计询盘金额字段 实际是 金额 和 币种两个字段，该接口只能接受一个字段key,所以要再单独传一下币种
                            if (this.checkedColumn.key === 'estimatedInquiryAmount') {
                                const reData = {
                                    userId: this.userId,
                                    userName: this.fullName,
                                    idStr: this.tempDetail.id,
                                    orgId: this.enterpriseId,
                                    tableType: 3,
                                    fieldName: 'estimatedInquiryAmountCurrency',
                                    fieldValue: tempData.estimatedInquiryAmountCurrency
                                };
                                crmCommon.updateField(reData).then(response => {});

                                this.tableData[this.rowIndex][this.editKey] = tempData[this.checkedColumn.key] !== null ? (Utils.getCurrencySymbol(tempData.estimatedInquiryAmountCurrency).symbol + Utils.transformMoney(tempData.estimatedInquiryAmount)) : '-';
                            } else {
                                this.tableData[this.rowIndex][this.editKey] = tempData[this.checkedColumn.key];
                            }
                            this.$Message.success(this.$t('crm.Detail.success_editTable'));
                            this.clearEditPopperComponent();
                            /* 保存日志 */
                            const sentPrevObj = Object.assign({}, this.detailData);
                            sentPrevObj.label = this.prevLabelData.map(item => {
                                const temp = Object.assign({}, item);
                                delete temp.id;
                                return temp;
                            });
                            if (send_data.label) {
                                this.tempDetail.label = JSON.parse(send_data.label.slice());
                            }
                        } else {
                            this.$Message.error(this.$t('crm.Detail.error_editTable'));
                        }
                    }, error => {
                        this.loading = false;
                    }).catch(error => {
                        this.loading = false;
                    });
                }
            },
            // 校验社交平台字段是否有未填项
            socialPlatformsFlag() {
                for (let i = 0; i < this.tempDetail.socialNetworkingPlatform.length; i++) {
                    const item = this.tempDetail.socialNetworkingPlatform[i];
                    item.attrValue = item.attrValue.trim();
                    if (item.attrName !== '' && item.attrValue === '') {
                        return '1';
                    } else if (item.attrName === '' && item.attrValue !== '') {
                        return '2';
                    }
                }
            },
            // 多条社交平台循环查重
            async socialPlatformsCheckDuplicate(socialNetworkingPlatform) {
                const result = [];
                for (let i = 0; i < socialNetworkingPlatform.length; i++) {
                    const item = socialNetworkingPlatform[i];
                    if (item.isShow) {
                        const res_uniqSocialPlatforms = await this.$commonApi.checkContact({
                            orgId: this.enterpriseId,
                            attrValue: item.attrValue.trim(),
                            attrName: item.attrName,
                            id: this.contactId
                        });
                        if (res_uniqSocialPlatforms.code === '1') {
                            result.push(item);
                            break;
                        }
                    }
                }
                return result;
            },
            // 社交平台查重
            async uniqSocialPlatforms({ attrName, attrValue }) {
                if (!attrName || !attrValue) {
                    return this.$Message.error('请先输入社交平台');
                }
                const res_uniqSocialPlatforms = await this.$commonApi.checkContact({
                    orgId: this.enterpriseId,
                    attrValue: attrValue.trim(),
                    attrName
                });

                if (res_uniqSocialPlatforms.code === '1') {
                    this.uniqSocialPlatformVal = attrValue;
                    this.uniqSocialPlatformName = attrName;
                    this.uniqSocialPlatformsVisible = true;
                } else {
                    // 弹出社交平台无重复提示
                    this.$Message.success(`${attrName}${this.$t('crm.Modal.success_uniqSocialPlatforms')}`);
                }
            },
            /* 按钮操作 */
            // 标记 客户
            remarkFun(item, index) {
                let flag = 1;
                if (item.cpMarker === 1) {
                    flag = 2;
                }
                const data = {
                    id: item.companyId,
                    marker: flag
                };
                crmCompany.addMarker(data).then(response => {
                    if (response.code === '1') {
                        this.tableData[index].cpMarker = flag;
                        if (flag === 1) {
                            this.$Message.success(this.$t('crm.Detail.success_addMarker'));
                        } else {
                            this.$Message.success(this.$t('crm.Detail.success_removeMarker'));
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Detail.error_addMarker'));
                    }
                });
            },
            // 标记 询盘
            remarkInquiryMarker(item, index) {
                let flag = 1;
                if (item.inquiryMarker === 1) {
                    flag = 2;
                }
                const data = {
                    id: item.inquiryId,
                    inquiryMarker: flag
                };
                crmInquiry.updateMarker(data).then(response => {
                    if (response.code === '1') {
                        this.tableData[index].inquiryMarker = flag;
                        this.$emit('changeInquiryMarker');
                        if (flag === 1) {
                            this.$Message.success(this.$t('crm.Detail.success_addMarker'));
                        } else {
                            this.$Message.success(this.$t('crm.Detail.success_removeMarker'));
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Detail.error_addMarker'));
                    }
                });
            }
        },
        beforeDestroy() {
            if (this.table) {
                this.table.removeEventListener('scroll', function(){});
            }
        },
        watch: {
            companyId: {
                handler(val) {
                    if (val) {
                        setTimeout(() => {
                            const activeRow = document.querySelector('active-customer-item');
                            if (activeRow) {
                                activeRow.scrollIntoView();
                            }
                        });
                    }
                }
            },
            window_height() {
                this.clearEditPopperComponent();
            }
        }
    };
</script>

<style lang="less">
    .active-customer-item {
        background-color: #fff3ec !important;
    }
    td.ct_email{
        color: #3B78DE;
        cursor: pointer;
        &:hover {
            color: #2D63BC;
            cursor: pointer;
        }
    }
</style>
