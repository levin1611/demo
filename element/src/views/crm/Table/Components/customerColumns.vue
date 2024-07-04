
<template>
    <div>
        <Row class="customer-columns" :style="{height:table_height+56+'px'}">
            <Row class="customer-columns-top">
                <Col :xs="6"
                    :sm="6"
                    :md="6"
                    :lg="6"
                    :xl="4"
                >
                    <div class="customer-columns-top-left">
                        <!-- 全选框 -->
                        <Checkbox :value="checkAll"
                        :indeterminate="indeterminate"
                        @click.native.prevent="handleCheckAll">全选</Checkbox>
                        <Poptip
                            ref="headFilterPoptip"
                            placement="bottom-start"
                            style="margin-left:20px">
                            <Button slot="reference"
                                    type="text"
                                    icon="custom custom-customer-columns-filter"></Button>
                            <div class="head-filter">
                                <p class="head-filter-title">排序：</p>
                                <div class="head-filter-item">
                                    <Select v-model="sortKey" filterable>
                                        <Option
                                            v-for="item in sortAllColumns"
                                            :key="item.value"
                                            :label="item.title"
                                            :value="item.key">
                                        </Option>
                                    </Select>
                                </div>
                               <!-- 升序降序 -->
                                <div class="head-filter-item">
                                    <Select v-model="sortVal">
                                        <Option v-for="item in sortList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                                        </Option>
                                    </Select>
                                </div>
                                <!-- 底部按钮 -->
                                <div style="float:right">
                                    <Button size="mini" type="minor" @click="cancel">{{ $t('cancel') }}</Button>
                                    <Button type="success" size="mini" @click="sortSure">{{ $t('confirm') }}</Button>
                                </div>
                            </div>
                        </Poptip>
                        <span style="float:right;margin-right:0;font-size:12px" class="el-pagination__total">{{$t('crm.Table.total')}} {{totalNum}} {{$t('crm.Table.page')}}</span>
                    </div>
                </Col>
            </Row>
            <Col :xs="6"
                :sm="6"
                :md="6"
                :lg="6"
                :xl="4"
            >
                <div :style="{height:table_height-24+'px'}" ref="tableDataList" id="tableDataList" class="customer-columns-left-col-list" v-if="tableData.length">
                    <!-- 客户列表 -->
                    <div class="customer-columns-left-col-lists" :class="{'isActive':item.companyId === companyId}" v-for="(item,index) in tableData" :key="item.companyId" @click="handleCompanyId(item,index)">
                        <div class="customer-columns-left-col-lists-head">
                            <div class="customer-columns-left-col-lists-head-checkbox">
                                <Checkbox :value="selectedItems.indexOf(item.companyId) > -1" @click.native.stop @change.native.prevent="handleCheck(item)"></Checkbox>
                            </div>
                            <div class="customer-columns-left-col-lists-head-title" :title="item.cpCompanyName">
                                {{item.cpCompanyName}}
                            </div>
                            <div class="customer-columns-left-col-lists-head-btns">
                                <template v-if="isHighSeas">
                                    <!-- 认领客户 -->
                                    <Button v-if="authorized_button['claimCustomer']"
                                            icon="custom custom-claim-customer"
                                            size="small"
                                            type="text"
                                            :loading="loading_claim"
                                            :title="$t('crm.Modal.title_claimCustomer')"
                                            @click.stop="getIsClaimInquiry(item)"
                                            class="highSeas-claim-customer"></Button>
                                </template>
                                <!-- 标记客户 -->
                                <Button type="text"
                                        :disabled="isHighSeas"
                                        :title="$t('crm.newDetail.title_signCustomer')"
                                        @click.stop="remarkFun(item,index)"
                                        class="piwik_mark_customer">
                                    <Icon custom="custom-crm-mark"
                                        :color="item.cpMarker ===1 ? '#FBBC04' : '#7b98b6'"></Icon>
                                </Button>
                                <!-- 发送邮件 -->
                                <Button v-if="authorized_button['sendMail']"
                                        icon="custom custom-customer-send-mail"
                                        size="small"
                                        type="text"
                                        :title="$t('crm.Modal.title_sendMail')"
                                        @click.stop="sendMail(item)"
                                        class="piwik_companyDetail_sendMail"></Button>
                                <!-- 新增询盘 -->
                                <Button v-if="authorized_button['newInquiry']"
                                        icon="custom custom-new-inquiry"
                                        size="small"
                                        type="text"
                                        :title="$t('crm.Detail.addInquiry')"
                                        @click.stop="addNewInquiry(item)"></Button>
                                <!-- 转移客户 -->
                                <Button v-if="authorized_button['transferCompany']"
                                        icon="custom custom-transfer-customer"
                                        size="small"
                                        type="text"
                                        :title="$t('crm.Modal.title_transferCompany')"
                                        @click.stop="transferCompany(item,index)"></Button>
                                <Poptip trigger="hover"
                                        placement="bottom-end"
                                        popper-class="moreOperateGroup companyInfo-more-operate-pop" style="margin-left:10px">
                                    <Button slot="reference"
                                            type="text"
                                            icon="custom custom-more"></Button>
                                    <div>
                                        <ul class="_font_size12">
                                            <template v-if="!isHighSeas">
                                                <!-- 分享客户 -->
                                                <li v-if="authorized_button['shareCompany']"
                                                    @click.stop="shareCompany(item)">{{ $t('crm.Detail.shareCompany') }}</li>
                                                <!-- 扔入公海 -->
                                                <li v-if="authorized_button['throwCompany']"
                                                    @click.stop="throwCompany(item,index)">{{ $t('crm.Detail.throwCompany') }}</li>
                                            </template>
                                            <!-- 查看日志 -->
                                            <li @click.stop="seeViewCompanyLog(item)">{{ $t('crm.Detail.viewCompanyLog') }}</li>
                                        </ul>
                                    </div>
                                </Poptip>
                            </div>
                        </div>
                        <div class="customer-columns-left-col-lists-body">
                            <div class="customer-columns-left-col-lists-body-content">
                                <span class="customer-columns-left-col-lists-body-content-title" :title="$t('crm.Modal.corp_shortName')">{{$t('crm.Modal.corp_shortName')}}：</span>
                                <span class="customer-columns-left-col-lists-body-content-text" :title="item.cpShortName">{{ item.cpShortName ? item.cpShortName : '-'}}</span>
                            </div>
                            <div class="customer-columns-left-col-lists-body-content">
                                <span class="customer-columns-left-col-lists-body-content-title" :title="$t('crm.Modal.corp_clientType')">{{$t('crm.Modal.corp_clientType')}}：</span>
                                <span class="customer-columns-left-col-lists-body-content-cpClientType" v-if="item.cpClientType" :title="item.cpClientType">
                                    {{ item.cpClientType}}
                                </span>
                                <span class="customer-columns-left-col-lists-body-content-text" v-else>-</span>
                            </div>
                            <div class="customer-columns-left-col-lists-body-content">
                                <span class="customer-columns-left-col-lists-body-content-title" :title="$t('crm.Modal.corp_countryArea')">{{$t('crm.Modal.corp_countryArea')}}：</span>
                                <span class="customer-columns-left-col-lists-body-content-text" :title="item.cpCountryArea">{{ item.cpCountryArea ? item.cpCountryArea : '-'}}</span>
                            </div>
                            <div class="customer-columns-left-col-lists-body-content">
                                <span class="customer-columns-left-col-lists-body-content-title" :title="$t('crm.Table.col_companyManagers')">{{$t('crm.Table.col_companyManagers')}}：</span>
                                <span class="customer-columns-left-col-lists-body-content-text" :title="item.cpCompanyManagers">{{ item.cpCompanyManagers ? item.cpCompanyManagers : '-'}}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 分页 -->
                <div class="small-page" v-if="tableData.length">
                    <Page :page-size="pageSize"
                        :page-sizes="pageSizeOpts"
                        :total="totalNum"
                        :current-page="curPage"
                        :pager-count="5"
                        small
                        layout="prev, pager, next,sizes"
                        @current-change="$parent.changePage"
                        @size-change="$parent.pageSizeChange"
                        ></Page>
                </div>
                <div :style="{height:table_height+'px'}" class="customer-columns-left-col-list no-data" v-else>
                    <p>{{customEmptyTextLang}}</p>
                    <p class="custom_table-empty_button" @click="clearFilterConditionByInitView('customRootRoomMainView')">{{customEmptyButtonTextLang}}</p>
                </div>
            </Col>
            <Col :xs="12"
                :sm="12"
                :md="12"
                :lg="12"
                :xl="16"
                class="customer-columns-center-col" id="customerColumnsCenter" v-show="companyId">
                <!-- <div class="customer-columns-center-content"> -->
                    <!-- 询盘信息 -->
                    <InquiryInfo
                                id="InquiryInfo"
                                class="customer-columns-inquiry"
                                :class="{'isScroll':isScroll}"
                                :companyId="companyId"
                                :isHighSeas="isHighSeas"
                                :inquiryId.sync="inquiryId"
                                :inquiryDetail.sync="inquiryDetail"
                                :inquiry_columns_authorized="inquiry_columns_authorized"
                                :flag_update_inquiry_list="flag_update_inquiry_list"
                                :flag_update_contact_list.sync="flag_update_contact_list"
                                ></InquiryInfo>
                    <!-- 全触点旅程 -->
                    <CustomerJourney
                                    :style="{height:table_height-200+'px'}"
                                    ref="customerJourney"
                                    :type="isHighSeas ? 'highseasCustomer' : 'customer'"
                                    :originalType="isHighSeas ? 'highseasCustomer' : 'customerColumns'"
                                    :disabled="isHighSeas"
                                    :id="companyId"
                                    :visitorId="''"
                                    :columns_authorized="corp_columns_authorized"
                                    :contact_columns_authorized="contact_columns_authorized"
                                    :inquiry_columns_authorized="inquiry_columns_authorized"
                                    :flag_update_inquiry_list="flag_update_inquiry_list"
                                    :isScroll="isScroll"
                                    @change_flag_update_task="change_flag_update_task"
                                    @change_time_line="addEventListenerScroll"
                                    class="customer-columns-journey"
                                    style="padding:12px 25px 16px;"></CustomerJourney>
                <!-- </div> -->
                <div class="customer-columns-center-col-toTop" v-if="isScroll" @click="toTop">
                    <svg class="icon svg-icon" aria-hidden="true" style="width:100%;height:100%">
                        <use xlink:href="#custom-fanhuidingbu"></use>
                    </svg>
                </div>
            </Col>
            <Col v-show="companyId" :xs="6"
                :sm="6"
                :md="6"
                :lg="6"
                :xl="4">
                <customerColumnsRight
                                :id="inquiryId"
                                :companyId="companyId"
                                :isHighSeas="isHighSeas"
                                :companyName="companyName"
                                :inquirySeqNumber="inquiryDetail.seqNumber"
                                :flag_update_task="flag_update_task"
                                :company_short_info.sync="company_short_info"
                                :columns_authorized="corp_columns_authorized"
                                :inquiry_columns_authorized="inquiry_columns_authorized"
                                :contact_columns_authorized="contact_columns_authorized"
                                :flag_update_contact_list.sync="flag_update_contact_list"
                                ></customerColumnsRight>
            </Col>
            <Col :xs="18"
                :sm="18"
                :md="18"
                :lg="18"
                :xl="20"
                class="customer-columns-center-col" v-if="!companyId">
                <div
                     class="no-data">
                    <img src="@/svg/no-data.svg"
                         :alt="$t('crm.Table.customerColumnsNoData')">
                    <p style="margin-top:30px;color:#000">{{ $t('crm.Table.customerColumnsNoData') }}</p>
                </div>
                </Col>
        </Row>
         <!-- 模态框部分 -->
        <!-- 新增询盘 -->
        <NewInquiry :visible.sync="visible_new_inquiry"
                    :companyId="selectedCompanyId"
                    :contact_columns_authorized="contact_columns_authorized"
                    :inquiry_columns_authorized="inquiry_columns_authorized"
                    :flag_update_inquiry.sync="flag_update_inquiry"
                    @refreshContact="refreshContactList"></NewInquiry>

        <!-- 分享客户 -->
        <ShareCompany :visible.sync="visible_share_company"
                      :id="selectedCompanyId"
                      :managerIds="checkedItem.cpCompanyManagerIds"
                      :managerNames="checkedItem.cpCompanyManagers"
                      :flag_update_detail.sync="flag_update_detail"></ShareCompany>

        <!-- 转移客户 -->
        <TransferCompany :visible.sync="visible_transfer_company"
                         :id="selectedCompanyId"
                         :managerIds="checkedItem.cpCompanyManagerIds"
                         :managerNames="checkedItem.cpCompanyManagers"
                         :flag_update_detail.sync="flag_update_detail"
                         @closeAllDrawer="refreshList"></TransferCompany>

        <!-- 退入公海 -->
        <ThrowCompany :visible.sync="visible_throw_company"
                      :id="selectedCompanyId"
                      @closeAllDrawer="refreshList"></ThrowCompany>

        <!-- 发送邮件 -->
        <SendMail :visible.sync="visible_send_mail"
                  type="customer"
                  :id="selectedCompanyId"
                  :companyName="checkedItem.cpCompanyName"></SendMail>

        <!-- 查看公司操作日志 -->
        <ViewCompanyLog :visible.sync="visible_view_company_log"
                        type="customer"
                        :companyId="selectedCompanyId"></ViewCompanyLog>

        <!-- 认领客户 -->
        <ClaimCustomer :visible.sync="visible_claim_customer"
                       :id="selectedCompanyId"
                       @claimSuccess="claimSuccess"></ClaimCustomer>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import InquiryInfo from '@/views/crm/Detail/Components/newDetail/inquiryInfo';
    import customerColumnsRight from '@/views/crm/Detail/Components/newDetail/customerColumnsRight';
    import CustomerJourney from '@/views/crm/Detail/Components/newDetail/customerJourney';
    import NewInquiry from '@/views/crm/Detail/Components/Modal/newInquiry';
    import ShareCompany from '@/views/crm/Detail/Components/Modal/shareCompany';
    import TransferCompany from '@/views/crm/Detail/Components/Modal/transferCompany';
    import ThrowCompany from '@/views/crm/Detail/Components/Modal/throwCompany';
    import SendMail from '@/views/crm/Detail/Components/Modal/sendMail';
    import ViewCompanyLog from '@/views/crm/Detail/Components/Modal/viewCompanyLog';
    import ClaimCustomer from '@/views/crm/Detail/Components/Modal/claimCustomer';
    import { crmCompany } from '@/api/crm/index';

    import resetInitComponents from '@/mixins/resetComponentViewData';
    export default {
        name: 'customerTable',
        mixins: [resetInitComponents],
        components: {
            InquiryInfo,
            // 右侧四个tab
            customerColumnsRight,
            CustomerJourney,
            // 弹框组件
            NewInquiry,
            ShareCompany,
            TransferCompany,
            ThrowCompany,
            SendMail,
            ViewCompanyLog,
            ClaimCustomer
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
            pageSize: {
                type: null
            },
            pageSizeOpts: {
                type: Array
            },
            order_column: {
                type: String,
                default: 'cpUpdateTime'
            },
            order_type: {
                type: String,
                default: 'desc'
            },
            storageName_orderColumn: {
                type: String,
                default: 'cpUpdateTime'
            },
            currentIndex: null,
            corp_columns_authorized: Object,
            inquiry_columns_authorized: Object,
            contact_columns_authorized: Object,
            totalNum: Number,
            curPage: Number,
            close_popper: Function,
            fieldStyle: Object,
            allColumns: Array,
            columnType: Number,
            selected_items: Array
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                button_list: state => state.app.button_list
            }),
            ...mapGetters([
                'isHaveAuthority'
            ]),
            sortAllColumns() {
                return this.currentColumns.filter(item => item.columnsFilter);
            },
            selectedItems() {
                return this.selected_items.map(item => item.companyId);
            },
            authorized_button() {
                if (this.isHighSeas) {
                    const ids = BUTTON_IDS.CRM.highSeas;
                    return {
                        claimCustomer: !HANDLE_BUTTON(ids.edit.claimCustomer, this.button_list)
                    };
                }
                const ids = BUTTON_IDS.CRM.customer;
                return {
                    editCompany: !HANDLE_BUTTON(ids.edit.editCustomer, this.button_list),
                    newInquiry: !HANDLE_BUTTON(ids.edit.newInquiry, this.button_list),
                    sendMail: !HANDLE_BUTTON(ids.edit.sendMail, this.button_list),
                    shareCompany: !HANDLE_BUTTON(ids.edit.share, this.button_list),
                    transferCompany: !HANDLE_BUTTON(ids.edit.transfer, this.button_list),
                    throwCompany: !HANDLE_BUTTON(ids.edit.throw, this.button_list)
                };
            },
            computed_short_info() {
                const result = this.$deepClone(this.checkedItem);
                // 屏蔽未授权字段
                if (this.corp_columns_authorized && Array.isArray(this.corp_columns_authorized.default)) {
                    const defaultFields = this.corp_columns_authorized.default;

                    // 无"公司名称"字段, 屏蔽公司名为 ****
                    const temp = defaultFields.find(item => item.storageName === 'companyName');
                    if (!temp || temp.manually) {
                        result.companyName = '****';
                    }
                    // 无"客户类型"字段, 删除客户类型属性
                    if (!defaultFields.find(item => item.storageName === 'clientType')) {
                        delete result.clientType;
                    }
                } else {
                    result.companyName = '****';
                    delete result.clientType;
                }
                return result;
            }
        },
        data() {
            return {
                // 公司信息
                companyId: null,
                companyName: '',
                isHighSeas: '',
                company_short_info: {},
                // 客户信息处新增询盘, 触发询盘刷新 flag
                flag_update_inquiry_list: false,
                // 询盘信息
                inquiryId: null,
                inquiryDetail: {},
                // 询盘信息处新增联系人, 触发联系人刷新 flag
                flag_update_contact_list: false,

                // 全触点旅程
                // 客户旅程部分新增跟进记录, 创建快速任务后触发右侧任务部分刷新
                flag_update_task: false,
                indeterminate: false,
                checkAll: false,
                selectionCompanyList: [],
                checkedItem: {},
                selectedCompanyId: null,
                loading_claim: false, // 认领线索
                /* 模态框部分 */
                visible_view_company_log: false,
                visible_new_inquiry: false,
                visible_edit_company: false,
                visible_share_company: false,
                visible_transfer_company: false,
                visible_throw_company: false,
                visible_send_mail: false,
                visible_claim_customer: false,
                // 模态框触发 flag 状态变更, 须作出相应刷新操作
                flag_update_detail: false,
                flag_update_inquiry: false,
                checkedIndex: null,
                timelineBox: null,
                isScroll: false,
                // 排序字段
                sortKey: 'cpUpdateTime',
                sortVal: 'desc',
                sortList: [
                    { label: this.$t('tableFilter.ascend'), value: 'asc' },
                    { label: this.$t('tableFilter.descend'), value: 'desc' }
                ]
            };
        },
        created() {
        },
        mounted() {
            this.addEventListenerScroll();
        },
        beforeDestroy() {
            this.timelineBox.removeEventListener('scroll', function(){});
        },
        methods: {
            // 监听时间轴滚动
            addEventListenerScroll() {
                this.$nextTick(() => {
                    if (this.timelineBox) {
                        this.timelineBox.removeEventListener('scroll', function(){});
                        this.timelineBox = null;
                    }
                    const that = this;
                    const timelineBox = this.timelineBox = document.querySelector('#timelineBox');
                    this.timelineBox.addEventListener('scroll', function(e) {
                        if (timelineBox.scrollTop > 0) {
                            if (timelineBox.scrollHeight >= timelineBox.offsetHeight + 165) {
                                that.isScroll = true;
                            }
                        } else {
                            that.isScroll = false;
                        }
                    });
                });
            },
            toTop() {
                this.timelineBox.scrollTop = 0;
                this.isScroll = false;
            },
            handleCompanyId(item, index) {
                if (item.companyId === this.companyId) return;
                this.companyName = item.cpCompanyName;
                this.$emit('update:currentIndex', index);
                this.toTop();
                this.init(item.companyId, true);
            },
            init(companyId) {
                this.companyId = companyId;
                // 请求管理权限和是否公海
                this.checkAuthority(this.companyId);
            },
            // 点击列表 参数的不同作出相应刷新操作
            async checkAuthority(companyId, callback) {
                if (companyId) {
                    // 查询该公司 id 管理权限
                    const authorized = await this.isHaveAuthority({
                        type: 'Customer',
                        id: companyId
                    });
                    // 无权限, 则不允许跳转, 停止向下执行
                    if (!authorized) {
                        return;
                    }

                    // 校验通过, 执行剩余代码
                    if (callback && typeof callback === 'function') {
                        callback();
                    }

                    // 标记当前客户是否为公海客户
                    this.isHighSeas = authorized === 'highseas';

                    // 调整顶部面包屑
                    // util.setCurrentPath(this, this.isHighSeas ? 'highSeasCompanyDetail' : 'companyDetail');
                } else {
                    this.$Message.error(this.$t('crm.InqSet.error_params'));
                }
            },
            change_flag_update_task() {
                this.flag_update_task = !this.flag_update_task;
            },
            /* 按钮操作 */
            // 标记
            remarkFun(item, index) {
                this.$emit('update:currentIndex', index);
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
            // 分享
            shareCompany(item) {
                this.checkedItem = item;
                this.selectedCompanyId = item.companyId;
                this.visible_share_company = true;
            },
            // 转移
            transferCompany(item, index) {
                this.$emit('update:currentIndex', index);
                this.checkedItem = item;
                this.selectedCompanyId = item.companyId;
                this.visible_transfer_company = true;
            },
            // 退入公海
            throwCompany(item, index) {
                this.$emit('update:currentIndex', index);
                this.checkedItem = item;
                this.selectedCompanyId = item.companyId;
                this.visible_throw_company = true;
            },
            // 查看公司日志
            seeViewCompanyLog(item) {
                this.checkedItem = item;
                this.selectedCompanyId = item.companyId;
                this.visible_view_company_log = true;
            },
            // 发送邮件
            sendMail(item) {
                this.checkedItem = item;
                this.selectedCompanyId = item.companyId;
                this.visible_send_mail = true;
            },
            // 新增线索
            addNewInquiry(item) {
                this.checkedItem = item;
                this.selectedCompanyId = item.companyId;
                this.visible_new_inquiry = true;
            },
            // 点击认领, 先获取当前用户是否有可接询盘权限, 再决定是否弹出认领确认框
            getIsClaimInquiry(item) {
                this.checkedItem = item;
                this.selectedCompanyId = item.companyId;
                this.loading_claim = true;
                const params = {
                    id: this.userId
                };
                this.$commonApi.getUserPrivilege(params).then(response => {
                    this.loading_claim = false;
                    if (response.code === '1') {
                        if (response.data && response.data.canGetInquiry === 1) {
                            this.visible_claim_customer = true;
                        } else {
                            this.$Message.warning(this.$t('crm.newDetail.haveNoAuthorityClaim'));
                        }
                    }
                }).catch(e => {
                    this.loading_claim = false;
                    this.$Message.warning(this.$t('crm.newDetail.haveNoAuthorityClaim'));
                });
            },
            // 刷新联系人资料
            refreshContactList() {
                this.$emit('update:flag_update_contact_list', !this.flag_update_contact_list);
            },
            // 公司信息
            claimSuccess() {
                // 获取 companyId
                const companyId = this.companyId;
                // 置空 companyId , 刷新页面
                this.companyId = null;
                // 重新请求管理权限和是否公海
                this.checkAuthority(companyId);
            },
            refreshList() {
                this.$emit('refreshData');
            },
            // 操作全选按钮
            handleCheckAll() {
                this.checkAll = !this.checkAll;
                this.indeterminate = false;
                this.selectionCompanyList = this.checkAll ? this.$deepClone(this.tableData) : [];
                this.$parent.handleSelectionChange({ records: this.selectionCompanyList, reserves: [] });
            },
            handleCheck(companyData) {
                const companyIdIndex = this.selectionCompanyList.findIndex(item => item.companyId === companyData.companyId);
                if (companyIdIndex !== -1) {
                    this.selectionCompanyList.splice(companyIdIndex, 1);
                } else {
                    this.selectionCompanyList.push(this.$deepClone(companyData));
                }
                if (this.tableData.length === this.selectionCompanyList.length) {
                    this.checkAll = true;
                    this.indeterminate = false;
                } else if (this.selectionCompanyList.length > 0) {
                    this.checkAll = false;
                    this.indeterminate = true;
                } else {
                    this.indeterminate = false;
                    this.checkAll = false;
                }
                this.$parent.handleSelectionChange({ records: this.selectionCompanyList, reserves: [] });
            },
            // 排序相关
            cancel() {
                this.closePoptip();
            },
            closePoptip() {
                this.$refs.headFilterPoptip.doClose();
            },
            sortSure() {
                if (this.sortKey && this.sortVal) {
                    this.$emit('columnsFilter', { key: this.sortKey, val: this.sortVal });
                    this.closePoptip();
                }
            }
        },
        watch: {
            selected_items: function(newVal) {
                if (!newVal.length) {
                    this.selectionCompanyList = [];
                    this.indeterminate = false;
                    this.checkAll = false;
                }
            },
            tableData: {
                handler(newVal) {
                    if (newVal.length) {
                        this.isScroll = false;
                        this.$nextTick(() => {
                            setTimeout(() => {
                                document.querySelector('#timelineBox').scrollTop = 0;
                            }, 500);
                        });
                        if (this.currentIndex) {
                            if (this.currentIndex > newVal.length) {
                                this.init(this.tableData[newVal.length - 1].companyId);
                                this.companyName = this.tableData[newVal.length - 1].cpCompanyName;
                            } else {
                                this.init(this.tableData[this.currentIndex].companyId);
                                this.companyName = this.tableData[this.currentIndex].cpCompanyName;
                            }
                            this.currentIndex = null;
                        } else {
                            this.init(this.tableData[0].companyId);
                            this.companyName = this.tableData[0].cpCompanyName;
                            this.$nextTick(() => {
                                setTimeout(() => {
                                    document.querySelector('#tableDataList').scrollTop = 0;
                                }, 800);
                            });
                        }
                    } else {
                        this.companyId = null;
                    }
                },
                immediate: true
            },
            flag_update_inquiry: {
                handler(val) {
                    this.flag_update_inquiry_list = val;
                }
            },
            storageName_orderColumn: {
                handler(val) {
                    this.sortKey = val;
                },
                immediate: true
            },
            order_type: {
                handler(val) {
                    this.sortVal = val;
                },
                immediate: true
            }
            // flag_update_detail: {
            //     handler() {
            //         //this.get_short_info();
            //     }
            // }
        }
    };
</script>
<style lang="less">
    .customer-columns {
        height: 100%;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;
        border-radius: 4px 0px 0px 4px;
        background: rgb(255, 255, 255);
        > .el-col {
            height: calc(100% - 41px);
        }
        &-top{
            line-height: 18px;
            padding: 10px 0 10px;
            border-bottom:#EAEAEA solid 1px;
             &-left{
                padding: 0 16px 0 30px;
                box-shadow:none;
                cursor: pointer;
                .el-button--text{
                    color: #7b98b6;
                    font-size: 16px;
                }
                .el-button--text:hover{
                    color: #4285F2;
                }
            }
        }
        &-left-col,&-left-col-list{
            overflow-y: auto;
            overflow-y: overlay;
        }
        &-left-col-list{
            position: relative;
        }
        .small-page{
            width: 100%;
            padding: 5px 0;
            background: #fff;
            border-top:#EAEAEA solid 1px;
            // border-bottom:#EAEAEA solid 1px;
            text-align: center;
            .el-input--mini {
                .el-input__inner,.el-input__icon{
                    height: 22px;
                    line-height: 22px;
                }
                .el-input__inner{
                    padding-right: 18px;
                    padding-left: 5px;
                }
            }
            .el-pagination .el-select .el-input{
                width: 80px;
            }
        }
        &-center-col {
            position: relative;
            border: 1px solid #E1E8EF;
            border-top:none;
            border-bottom:none;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            &-toTop{
                position: absolute;
                width: 40px;
                height: 40px;
                border-radius:5px ;
                right: 35px;
                bottom: 16px;
                cursor: pointer;
            }
        }
        &-inquiry{
            height: 165px;
            padding: 20px 25px 10px;
            border-bottom: 1px solid #E1E8EF;
            overflow: hidden;
            margin-top: 0px;
            transition: all .6s linear;
        }
        .isScroll{
            margin-top: -165px;
        }
        &-journey {
            flex: 1;
            overflow: hidden;
        }
        .no-data{
            display: flex;
            align-items: center;
            flex-direction: column;
            justify-content: center;
            font-size: 12px;
            color: #909399;
            height: 100%;
            .custom_table-empty_button{
                color: #4285f2;
                cursor: pointer;
            }
        }
        //列表样式
        .customer-columns-left-col-lists{
            padding: 10px 16px 6px 30px;
            box-shadow: inset 0 -1px 0 0 #ebeef5;
            cursor: pointer;
            .customer-columns-left-col-lists-head{
                display: flex;
                flex-direction:row;
                flex-wrap:nowrap;
                align-items: center;
                height: 24px;
                font-size: 14px;
                color: rgba(0,0,0,0.80);
                margin-bottom: 8px;
                .customer-columns-left-col-lists-head-checkbox{
                   margin-right: 8px;
                }
                .customer-columns-left-col-lists-head-title{
                    width: calc(100% - 14px);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .customer-columns-left-col-lists-head-btns{
                    display: none;
                    text-align: right;
                    button{
                        width: 14px;
                        height: 14px;
                        color: #7b98b6;
                        /deep/ .custom{
                            font-size:14px ;
                        }
                    }
                    .el-button--small:hover{
                        color: #4285F4;
                    }
                }
            }
            .customer-columns-left-col-lists-body{
                width: 100%;
                height: 46px;
                overflow: hidden;
                .customer-columns-left-col-lists-body-content{
                    float: left;
                    width: 50%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    font-size: 12px;
                    line-height: 18px;
                    margin-bottom: 4px;
                    span{
                        display: inline-block;
                        vertical-align: middle;
                    }
                    .customer-columns-left-col-lists-body-content-title{
                        width: 45%;
                        color: rgba(0,0,0,.6);
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .customer-columns-left-col-lists-body-content-text{
                        color: rgba(0,0,0,.8);
                        max-width: 53%;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .customer-columns-left-col-lists-body-content-cpClientType{
                        padding:0 8px;
                        border: #FFC6A7 solid 1px;
                        font-size:11px;
                        font-style: normal;
                        max-width: 55%;
                        text-align: center;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        border-radius: 10px;
                        color: #FF752A ;
                    }
                }
            }
        }
        .customer-columns-left-col-lists:hover {
            background: #ebeef5;
            .customer-columns-left-col-lists-head-title{
                width: calc(50% - 7px);
            }
            .customer-columns-left-col-lists-head-btns{
                display: block;
                width: calc(50% - 7px);
            }
        }
        .customer-columns-left-col-lists.isActive{
            background: #fff3ec;
        }
    }
    .head-filter{
        padding: 0 4px;
        .head-filter-title{
            font-size: 12px;
            padding-bottom: 5px;
        }
        .head-filter-item{
            margin-bottom: 15px;
        }
    }
</style>
