<template>
    <div class="split-mail-table">
        <!-- 表格上方操作栏 -->
        <div class="split-search-header">
            <!-- 全选按钮 -->
            <span class="split-mail-checkAll margin-right-20">
                <Checkbox :value="checkAll"
                          :indeterminate="indeterminate"
                          @click.native.prevent="handleCheckAll"></Checkbox>
                <Dropdown trigger="click"
                          placement="bottom-start"
                          @command="handleStatusFilter">
                    <Icon custom="custom custom-floating-window-arrow"
                          size="12"
                          style="opacity: 0.6;margin-left: 5px"
                          class="cursor-pointer"></Icon>
                    <DropdownMenu slot="dropdown">
                        <DropdownItem v-for="item in config_tableFilter.mailStatusFilter.allList"
                                      :key="item.value"
                                      :command="item.value"
                                      :style="{backgroundColor: currentSelectMailStatus === item.value ? '#fff3ec' : '', color: currentSelectMailStatus === item.value ? '#fb9b67' : ''}">
                            <Icon custom="custom custom-delivered-and-unreceived"
                                  size="12"
                                  :style="{display: currentSelectMailStatus ? 'inline-block' : 'none', visibility: currentSelectMailStatus === item.value ? 'visible' : 'hidden'}"></Icon>
                            <span style="font-size: 12px">{{ item.label }}</span>
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </span>

            <!-- 收信按钮 -->
            <Tooltip placement="top"
                     :content="$t('mail.receiveLetter')"
                     transfer>
                <Icon custom="custom custom-refresh"
                      @click.native="receiveMail"
                      :class="receiveMailFlag ? 'receive-load-loop' : ''"
                      class="split-mail-receive mail-receivingletter cursor-pointer margin-right-20"></Icon>
            </Tooltip>

            <!-- 批量操作 -->
            <ul v-show="selectMailList.length"
                class="operates clearfloat">
                <li v-if="!signFlag">
                    <Dropdown trigger="click"
                              @command="changeReadState">
                        <Tooltip placement="top"
                                 :content="$t('mail.mark')"
                                 transfer>
                            <Icon custom="custom custom-sign"
                                  size="16"/>
                        </Tooltip>
                        <DropdownMenu slot="dropdown">
                            <DropdownItem command="read">{{ $t('mail.markRead') }}</DropdownItem>
                            <DropdownItem command="unread">{{ $t('mail.markUnread') }}</DropdownItem>
                            <DropdownItem command="readAll">{{ $t('mail.markReadAll') }}</DropdownItem>
                            <DropdownItem command="star">{{ $t('mail.flag_star_box') }}</DropdownItem>
                            <DropdownItem command="unstar">{{ $t('mail.cancel_flag_star_box') }}</DropdownItem>
                            <DropdownItem command="changeUntreated">{{ $t('mail.markAsUntreated') }}</DropdownItem>
                            <DropdownItem command="changeFinished">{{ $t('mail.markAsFinished') }}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </li>
                <li v-if="!moveFlag">
                    <Dropdown trigger="click"
                              @command="moveTo">
                        <Tooltip placement="top"
                                 :content="$t('mail.moveTo')"
                                 transfer>
                            <Icon custom="custom custom-move-mail"
                                  size="16"
                                  @click="getCustomFolders"/>
                        </Tooltip>
                        <DropdownMenu slot="dropdown"
                                      style="max-height: 400px; overflow: auto;">
                            <DropdownItem v-for="(folder, index) in customFolders"
                                          :key="index"
                                          :command="folder.id"
                                          class="mail-movetofolder">
                                <Icon v-if="folder.id !== -1"
                                      type="folder"/>
                                {{ folder.boxTypeName }}
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </li>
                <li v-if="orgId !== '10991'">
                    <Tooltip placement="top"
                             :content="$t('delete')"
                             transfer>
                        <Icon custom="custom custom-delete-mail"
                              size="16"
                              @click="handleDelete"/>
                    </Tooltip>
                </li>
                <li>
                    <Dropdown trigger="click"
                              @command="signLabel">
                        <Tooltip placement="top"
                                 :content="$t('crm.InqSet.inq_label')"
                                 transfer>
                            <Icon custom="custom custom-tag"
                                  size="16"
                                  @click="getTags"/>
                        </Tooltip>
                        <DropdownMenu slot="dropdown"
                                      style="max-height: 400px;overflow: auto;">
                            <DropdownItem v-for="(tag, index) in tagList "
                                          :key="index"
                                          :command="tag.id"
                                          :style="`${tag.id === -1 ? 'text-align: center;' : ''}`"
                                          class="mail-addtag">
                                <span v-if="tag.id !== -1"
                                      :style="`background-color: ${tag.labelColor};`"
                                      class="tag-color"></span>
                                <span :title="tag.labelName">{{ tag.labelName }}</span>
                            </DropdownItem>
                            <DropdownItem command="addtag"
                                          divided
                                          class="mail-addtag">{{ $t('mail.add_tags_mark') }}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </li>

                <!-- 手动执行收发信规则图标 -->
                <li>
                    <Tooltip placement="top" :content="$t('mail.mailDetail.manuallyEnforceRule')" transfer>
                        <Icon class="piwik_manually_enforce_rules" size="16" custom="custom custom-icon_e_rule" @click="handleenforceRules"/>
                    </Tooltip>
                </li>
            </ul>

            <!-- 筛选标签 -->
            <div class="split-mail-filter-tags">
                <FilterTags
                        v-show="!selectMailList.length"
                        :filterConObj.sync="config_tableFilter"
                        :langObj="lang_mail"
                        :removeWidth="1100"
                        :minWidth="390"
                        @change_filter_tag="change_filter_tag"
                        @removeCon="remove_filter_tag">
                </FilterTags>
            </div>
            <div class="view-box">
                <Tooltip :content="$t('crm.Table.viewList')" effect="dark" placement="top">
                    <span class="change-customer-view change-customer-view-left piwik_view_list" @click="handleReadModeSet(1)">
                        <i class="custom custom-my-customer-view-list"></i>
                    </span>
                </Tooltip>
                <Tooltip :content="$t('crm.Table.viewCard')" effect="dark" placement="top">
                    <span class="change-customer-view change-customer-view-right piwik_view_card change-customer-view-active" @click="handleReadModeSet(2)">
                        <i class="custom custom-my-customer-view-card"></i>
                    </span>
                </Tooltip>
            </div>
        </div>

        <!-- 左侧列表 + 右侧详情 -->
        <Row class="split-mail-row">
            <!-- 左侧列表 + 顶部搜索 -->
            <Col :span="8"
                 v-loading="loading">
                <!-- 筛选弹窗 -->
                <FilterPanel :filterConObj.sync="config_tableFilter"
                    inputKey="subject"
                    :langObj="lang_mail"
                    @search="pageChange(1)"></FilterPanel>

                <!-- 左侧列表 -->
                <div ref="mailListContainer"
                    :style="{ height: list_height }"
                    class="split-mail-list">
                    <!-- 无数据提示 -->
                    <div v-if="mailTableData.length === 0"
                        class="noDataTip">
                        <p>{{ $t('crm.Table.noData') }}</p>
                    </div>

                    <!-- 列表 -->
                    <SplitMailItem
                        v-for="item in mailTableData"
                        :key="item.id"
                        :rowData="item"
                        :selectMailIds="selectMailIds"
                        :currentBoxType="currentBoxType"
                        :currentInquiryId="currentInquiryId"
                        :currentCustomerName="currentCustomerName"
                        :currentMailTab="toggleCustomerBox ? 'customerBox' : ''"
                        @goMailDetail="goMailDetail"
                        @handle_select_mail="handle_select_mail"
                        @goToForwardDetail="goToForwardDetail"
                        @sign-star="flag_star"
                        @deleteTag="mailDelLabel"
                        @changeCrmFlag="changeCrmFlag"
                        @changeProcessingState="changeProcessingState"
                        @showCompany="showCompany"
                        @showClue="showClue"
                        @createClue="createClue" />
                </div>
                <!-- 分页 -->
                <Page
                    :total="total"
                    :current-page.sync="currentPageNum"
                    :page-size="pageSize"
                    :page-sizes="[20,50,100]"
                    class="pageWrap-right"
                    layout="total, slot, prev, next, sizes"
                    @current-change="pageChange"
                    @size-change="pageSizeChange"
                    transfer>
                    <div style="display: inline-block; margin: 0 10px;">
                        <!-- 下拉切换页码 -->
                        <Dropdown v-if="maxPageNum > 1"
                                trigger="click"
                                @command="pageChange"
                                class="page-drop">
                            <!-- 页码 -->
                            <span class="cursor-pointer font-normal">{{ currentPageNum }}/{{ maxPageNum }}
                                <Icon custom="custom custom-floating-window-arrow"
                                    size="12"/>
                            </span>
                            <DropdownMenu slot="dropdown"
                                class="page-drop-menu">
                                <DropdownItem v-for="n in maxPageNum"
                                    :key="n"
                                    :command="n"
                                    :class="{'active-drop-item': n === currentPageNum}">{{ n }} / {{ maxPageNum }}</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </Page>
            </Col>

            <!-- 邮件详情 -->
            <Col :span="16"
                 :style="{ height: mail_height }">
                <!-- 未选中邮件 -->
                <div v-if="selectedMailIndex === -1"
                    :style="{ marginTop: noMail_top }"
                    class="no-selected-mail">
                    <img src="@/svg/no-data.svg"
                        :alt="$t('mail.noSelectedMail')">
                    <p>{{ $t('mail.noSelectedMail') }}</p>
                </div>

                <!-- 邮件详情 -->
                <MailDetail
                        v-else-if="selectedMailIndex !== -1"
                        :currentBoxType="currentBoxType"
                        :showToggleMailDetail="false"
                        ref="mailDetail"
                        v-bind="$attrs"
                        @mailReadStateChanged="mailReadStateChanged"
                        @updateMailList="updateTable"
                        v-on="$listeners">
                    <!-- 以下属性改为用 v-bind 和 v-on 从上层组件 mail-home 传给 mailDetail -->
                    <!--:content_height="content_height"-->
                    <!--:currentBoxType="currentBoxType"-->
                    <!--:showToggleMailDetail="showToggleMailDetail"-->
                    <!--@changeBox="changeBox"-->
                    <!--@handleView="handleView"-->
                    <!--@handleUnreadCount="handleUnreadCount"-->
                    <!--@updateTagList="updateTagList"-->
                </MailDetail>
            </Col>
        </Row>

        <!-- 删除邮件 -->
        <Modal
                :visible.sync="deleteModel"
                :modal-append-to-body="false"
                :close-on-click-modal="false"
                :title="$t('mail.deleteTitle')"
                :loading="true"
                width="520px"
                :styles="{top: '120px'}"
                :transition-names="['','']">
            <p>{{ $t('mail.deleteContent') }}</p>
            <div slot="footer">
                <Button @click="deleteModel = false">{{ $t('crm.UniSet.modal_cancel') }}</Button>
                <Button type="primary"
                        @click="customerBoxMailMerger"
                        class="mail-delete-confirm">{{ $t('crm.UniSet.modal_ok') }}
                </Button>
            </div>
        </Modal>

        <!-- 标签 -->
        <Modal
                :visible.sync="tagModal"
                :modal-append-to-body="false"
                :close-on-click-modal="false"
                :title="$t('crm.UniSet.setting_label')"
                :mask-closable="false"
                width="520px"
                class="modal">
            <div style="margin:10px 0 10px 10px;"
                 class="layermain">
                {{ $t('clue.add_clue') }}:
                <Input v-model.trim="tagName"
                       style="width: 300px;margin-top:2px;"></Input>
                <p style="text-align:center;color:red;">{{ $t('mail.lengthLimit') }}</p>
            </div>
            <div class="color">
                <ul>
                    <li v-for="(item, index) in colors"
                        :key="index"
                        @click="colorClick(index)"
                        :style="`background-color:${item.color}`">
                        <Icon v-if="item.show"
                              type="android-done"></Icon>
                    </li>
                </ul>
            </div>
            <div slot="footer">
                <Button @click="tagModal = false">{{ $t('crm.UniSet.modal_cancel') }}</Button>
                <Button type="primary"
                        @click="saveTag">{{ $t('crm.UniSet.modal_ok') }}</Button>
            </div>
        </Modal>

        <!-- 新建公司 -->
        <!--<NewCompany-->
        <!--        :visible.sync="newCompanyShow"-->
        <!--        :mailAddress.sync="mailAddress"-->
        <!--        :salesList="salesList"-->
        <!--        type="mail"-->
        <!--        :corp_columns_authorized="corp_columns_authorized"-->
        <!--        :contact_columns_authorized="contact_columns_authorized"-->
        <!--        :inquiry_columns_authorized="inquiry_columns_authorized"-->
        <!--        :selectOptions="selectOptions">-->
        <!--</NewCompany>-->

        <!-- 录入线索 -->
        <EnterClueModal
                v-model="newClueShow"
                :title="$t('facebook.inbox.enterClue')"
                class="modal companydata"
                :json_data="json_data"
                :type="'mail'"
                saveClueClass="piwik-mail-enter-clue"
                saveClueAndInquiryClass="piwik-mail-enter-inquiry"
                okEnterInquiryClass="mail_inquirySubmit"
                @on_cancle_clue="on_cancle_clue"
                @returnLeadsId="updateStatus"
                @updateInquiryStatus="updateInquiryStatus">
        </EnterClueModal>

        <!-- CRM 侧滑页 -->
        <CRMDrawerList
                :visible.sync="show_company_detail"
                :id.sync="companyId"
                :type="type_company"
                :originalType="type_company"
                :corp_columns_authorized="corp_columns_authorized"
                :contact_columns_authorized="contact_columns_authorized"
                :inquiry_columns_authorized="inquiry_columns_authorized">
        </CRMDrawerList>

        <!-- 线索侧滑页 -->
        <ClueDrawerList
                :visible.sync="show_clue_detail"
                :type="type_clue"
                :clueId.sync="clueId"
                :listType="2"
                :corp_columns_authorized="corp_columns_authorized"
                :contact_columns_authorized="contact_columns_authorized"
                :inquiry_columns_authorized="inquiry_columns_authorized">
        </ClueDrawerList>

        <!-- 手动收发信规则确认 -->
        <Modal
                :visible.sync="sendReceiveRulesModel"
                :modal-append-to-body="false"
                :close-on-click-modal="false"
                :title="$t('mail.mailDetail.executeRuleConfirmation')"
                width="400px"
                transfer
                :mask-closable="false"
                class="modal">
            <p>{{$t('mail.mailDetail.ruleConfirmationContent')}}</p>
            <div slot="footer">
                <Button @click="sendReceiveRulesModel = false">{{$t('crm.UniSet.modal_cancel') }}</Button>
                <Button @click="enforceRules" :loading="enforceRulesLoading" type="primary">{{ $t('crm.UniSet.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import Vue from 'vue';
    import util from '@/libs/util';
    import Utils from '@/utils';
    import { mapState, mapActions, mapGetters } from 'vuex';
    import FilterTags from '@/views/main-components/filter-tags';
    import SplitMailItem from './components/splitMailItem';
    import FilterPanel from './components/filterPanel';
    import MailDetail from '../MailDetail';
    // import NewCompany from '@/views/crm/Detail/Components/Modal/fixed-modal-form/create-company';
    import EnterClueModal from '@/views/main-components/enter-clue/enter-clue';
    import CRMDrawerList from '@/views/crm/Detail/CRMDrawerList';
    import ClueDrawerList from '@/views/clue-manage/Detail/ClueDrawerList';
    import { getIsEnable, enforceRules } from '@/api/mail.js';

    export default {
        name: 'splitCustomerTable',
        components: {
            FilterTags,
            SplitMailItem,
            FilterPanel,
            MailDetail,
            // NewCompany,
            EnterClueModal,
            CRMDrawerList,
            ClueDrawerList
        },
        props: {
            receiveMailFlag: {
                type: Boolean,
                default: false
            },
            currentBoxType: {
                type: String
            },
            currentInquiryId: {
                type: Number
            },
            currentCustomerName: {
                type: String
            },
            toggleCustomerBox: {
                type: Boolean
            }
        },
        computed: {
            ...mapState({
                orgId: state => state.enterpriseId,
                userId: state => state.userId,
                fullName: state => state.fullName,
                userName: state => state.userName,
                currentPage: state => state.mail.currentPage,
                window_height: state => state.window_height,
                currentAccount: state => state.mail.currentAccount,
                currentInputInfo: state => state.mail.currentInputInfo,
                currentAccountIds: state => state.mail.currentAccountIds,
                ws_receive_mail: state => state.mail.ws_receive_mail,
                websocketMsgMail: state => state.mail.websocketMsgMail,
                selectedMailId: state => state.mail.selectedMailId,
                selectedMailBoxType: state => state.mail.selectedMailBoxType
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            // 邮件详情高度
            mail_height() {
                return `${this.window_height - 106}px`;
            },
            // 邮件列表高度
            list_height() {
                return `${this.window_height - 158 - 41}px`;
            },
            // "未选中邮件"区域的 margin-top
            noMail_top() {
                return `${(this.window_height - 106 - 149) / 2}px`;
            },
            page() {
                return this.currentPage - 1;
            },
            maxPageNum() {
                return this.pageSize ? Math.ceil(this.total / this.pageSize) : '';
            },
            // 选中邮件 id 列表
            selectMailIds() {
                return this.selectMailList.map(item => item.id);
            },
            // 选中邮件箱类型列表
            selectMailBoxTypeIds() {
                return this.selectMailList.map(item => item.mailBoxTypeId);
            },
            // 当前被选中的邮箱是否存在于左侧列表
            selectedMailIndex() {
                if (!this.selectedMailId) {
                    return -1;
                }
                return this.mailTableData.findIndex(item => item.id == this.selectedMailId);
            },
            // 当前选中的邮件状态
            currentSelectMailStatus() {
                const filterValue = this.config_tableFilter.mailStatusFilter.query;
                return (Array.isArray(filterValue) && filterValue[0]) ? filterValue[0].value : '';
            }
        },
        watch: {
            ws_receive_mail() {
                this.mailTableData = this.getMailTableData();
            },
            currentInquiryId() {
                this.currentCustomerAccount = '';
                this.$store.commit('setCurrentPage', 1);
                this.mailTableData = this.getMailTableData();
            },
            websocketMsgMail: {
                handler(val) {
                    /**
                     * @Description: 收到邮件发送状态的通知后，分为普通邮件和群发单显邮件
                     *               普通邮件发送状态有2种：成功与失败；群发单显邮件发送状态有2种：全部成功、全部失败、部分成功
                     *               因此解决方案为：
                     *                      根据websocket返回的mailId查找当前邮件列表页中该封邮件，修改其mailSuccessFlag，
                     *               如果有失败原因，还需要更新失败原因，让列表页面重新渲染这一条数据，不影响列表的勾选值及折叠收起状态
                     * @author 杨娣
                     * @date 2020/6/7
                     */
                    if (Array.isArray(this.mailTableData) && this.mailTableData.length) {
                        this.mailTableData.forEach(subItem => {
                            if (subItem.id === val.mailId) {
                                this.$set(subItem, 'successFlag', String(val.messageCode));
                                if (val.mailSendErrorMsg && val.messageCode === 0) {
                                    this.$set(subItem, 'mailSendErrorMsg', val.mailSendErrorMsg);
                                }
                            }
                            return subItem;
                        });
                    }
                }
            },
            // 根据 mailBoxType 的不同, 设置不同的邮件状态筛选条件
            mailBoxType: {
                handler(val) {
                    let filterOptions = [];
                    let currentFilterOption = {};
                    switch (this.mailBoxType) {
                        case '0':
                        case '4':
                            currentFilterOption = this.mailStatusFilterOptions.find(item => item.mailBoxType === this.mailBoxType);
                            break;
                        default:
                            currentFilterOption = this.mailStatusFilterOptions.find(item => item.mailBoxType === '-1');
                            break;
                    }
                    if (currentFilterOption && currentFilterOption.filterOptions) {
                        filterOptions = currentFilterOption.filterOptions;
                    }

                    this.$set(this.config_tableFilter.mailStatusFilter, 'allList', filterOptions);
                },
                immediate: true
            }
        },
        data() {
            return {
                lang: 'zh-CN',
                loading: true,
                mailBoxType: '',
                customFolders: [], // 自定义文件夹列表
                currentCustomerAccount: this.$store.state.mail.currentCustomerAccount,
                pageSize: 45,
                replyFlag: false, // 是否禁用回复
                forwardFlag: false, // 是否禁用转发
                mergeFlag: false, // 是否禁用归并
                signFlag: false, // 是否禁用标记
                moveFlag: false, // 是否禁用移动到文件夹功能
                // 表格
                mailTableData: [],
                mailStatusFilterOptions: [
                    {
                        mailBoxType: '0',
                        mailBoxName: 'inbox',
                        filterOptions: [
                            { value: 1, label: '未回复' },
                            { value: 2, label: '已回复' }
                        ]
                    },
                    {
                        mailBoxType: '4',
                        mailBoxName: 'sentBox',
                        filterOptions: [
                            { value: 3, label: '发送失败' },
                            { value: 4, label: '邮件已打开' }
                        ]
                    },
                    {
                        mailBoxType: '-1',
                        mailBoxName: 'others',
                        filterOptions: [
                            { value: 1, label: '未回复' },
                            { value: 2, label: '已回复' },
                            { value: 3, label: '发送失败' },
                            { value: 4, label: '邮件已打开' }
                        ]
                    }
                ],
                config_tableFilter: {
                    // 新增"邮件状态筛选", 不在表格中显示, 只做筛选用
                    mailStatusFilter: {
                        sort: false,
                        filter: true,
                        filterType: 'selectSingle',
                        query: '',
                        allList: []
                    },
                    avatar: {
                        sort: false,
                        filter: false,
                        filterType: 'select',
                        query: '',
                        allList: [
                            { value: 0, label: this.$t('mail.undocumented') },
                            { value: 1, label: this.$t('mail.public_customers') },
                            { value: 2, label: this.$t('mail.my_customers') },
                            { value: 3, label: this.$t('mail.other_customers') },
                            { value: 4, label: this.$t('mail.public_leads') },
                            { value: 5, label: this.$t('mail.my_leads') },
                            { value: 6, label: this.$t('mail.other_leads') }
                        ]
                    },
                    subject: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型,              string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: null, // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                        placeholder: this.$t('mail.tip_inputSubject') // 筛选框 placeholder , 目前只有 filterPanel 组件用到
                    },
                    sender: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型,              string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
                    },
                    recipient: {
                        sort: true,
                        filter: true,
                        filterType: 'string',
                        query: '',
                        allList: null
                    },
                    date: {
                        sort: true,
                        filter: true,
                        filterType: 'date',
                        query: '',
                        allList: null
                    }
                },
                indeterminate: false,
                checkAll: false,
                total: 0, // 邮件个数
                totalUnread: 0, // 未读邮件个数
                selectMailList: [], // 选中邮件列表
                // 标签
                tagList: [], // 获取的所有标签列表,
                tagModal: false, // 新建标签
                tagName: '',
                colors: [
                    {
                        show: true,
                        color: '#4285F4'
                    },
                    {
                        show: false,
                        color: '#00CC99'
                    },
                    {
                        show: false,
                        color: '#15C5D4'
                    },
                    {
                        show: false,
                        color: '#7B66EE'
                    },
                    {
                        show: false,
                        color: '#FA8241'
                    }
                ],
                // 小人头 询盘详情 线索详情
                // newCompanyShow: false,
                newClueShow: false,
                corp_columns_authorized: {},
                contact_columns_authorized: {},
                inquiry_columns_authorized: {},
                templateId: '', // 线索模板id
                templateList: [],
                json_data: {},
                mailAddress: '', // 创建新客户的邮箱
                lang_mail: {
                    subject: this.$t('mail.writeLetter.subject'),
                    sender: this.$t('mail.writeLetter.sender'),
                    recipient: this.$t('mail.writeLetter.recipients'),
                    date: this.$t('mail.time'),
                    avatar: this.$t('mail.customerAvatar'),
                    mailStatusFilter: this.$t('mail.status')
                },
                /* 多语言 */
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
                    companyRemark: this.$t('crm.Modal.corp_companyRemark')
                },
                /* drawer */
                show_company_detail: false,
                type_company: 'customer',
                companyId: 0,
                show_clue_detail: false,
                type_clue: '',
                clueId: '',

                deleteModel: false,
                emails: [], // 当前页面所有邮件地址列表
                crmEmails: [], // 当前页建档的邮箱列表

                currentPageNum: this.currentPage, // 当前页码

                // 记录左侧邮件列表滚动条相关
                scrollTop: 0,
                isInView: false,
                beforeIndex: -1,
                enforceRulesLoading: false, // 手动执行规则的确认按钮loading
                sendReceiveRulesModel: false // 手动执行规则确认弹窗状态
            };
        },
        mounted() {
            this.lang = Vue.config.lang;
        },
        created() {
            this.init();
            // 获取 下拉选项数据 子组件有用到 更新下
            this.$store.dispatch('getSelectOptions');
            // 获取crm 授权字段
            this.get_columns_authorized();
        },
        methods: {
            ...mapActions(['getUnreadMail']),
            handleReadModeSet(value) {
                this.$emit('handleReadModeSet', value);
            },
            /* 获取目前所在的邮件箱体以及PageSize */
            getPageSize() {
                util.ajaxJson({
                    url: '/crm/userconfig/get',
                    method: 'POST',
                    data: {
                        orgId: this.orgId,
                        userId: this.userId,
                        key: 'mailBox'
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        if (res.data.data.value === null) {
                            this.pageSize = 45;
                            this.addPageSize();
                            this.$store.dispatch('getUnreadMail');
                            this.mailTableData = this.getMailTableData();
                        } else {
                            const size = parseInt(res.data.data.value);
                            this.pageSize = size;
                            this.$store.commit('setPageSize', size);
                            this.$store.dispatch('getUnreadMail');
                            this.mailTableData = this.getMailTableData();
                        }
                    } else {
                        this.pageSize = 45;
                        this.$store.dispatch('getUnreadMail');
                        this.mailTableData = this.getMailTableData();
                    }
                }).catch(() => {
                    this.pageSize = 45;
                    this.$store.dispatch('getUnreadMail');
                    this.mailTableData = this.getMailTableData();
                });
            },
            /* 添加PageSize */
            addPageSize() {
                util.ajaxJson({
                    url: '/crm/userconfig/add',
                    method: 'POST',
                    data: {
                        orgId: this.orgId,
                        userId: this.userId,
                        key: 'mailBox',
                        value: this.pageSize.toString()
                    }
                }).then(res => {
                    this.mailTableData = this.getMailTableData();
                });
            },

            /** 初始化页面 */
            init() {
                // this.getPageSize();
                this.$store.dispatch('getUnreadMail');
                this.mailTableData = this.getMailTableData();
            },
            /**
             * @Description: 此方法是为了解决频繁出现邮件列表页初始显示的小人头状态，与鼠标悬停之后显示的状态不一致的问题。
             *               获取到邮件列表数据之后，即根据对应箱体拿到标准邮箱集合，统一获取小人头状态并更新显示
             * @author 杨娣
             * @date 2020/1/9
             */
            getCompanyStatusByEmails() {
                const emailList = [];
                emailList.push(...new Set(this.emails));
                if (emailList.length) {
                    const postData = {
                        emailList: emailList,
                        userId: this.userId,
                        orgId: this.orgId
                    };
                    util.ajaxJson({
                        url: '/crm/mailbox/getInquiryAndCompanyInfoByEmails',
                        method: 'post',
                        data: postData
                    }).then(response => {
                        if (response.data.code === '1') {
                            const res = response.data.data;
                            this.crmEmails = [];
                            for (let i = 0; i < emailList.length; i++) {
                                if (res[emailList[i]] && res[emailList[i]].success) {
                                    res[emailList[i]].email = emailList[i];
                                    this.crmEmails.push(res[emailList[i]]);
                                }
                            }
                            this.mailTableData.map(item => {
                                let currentMail = {};
                                if (item.fromOrToFlag) {
                                    const tempEmail = item.recipient[0];
                                    currentMail = this.crmEmails.find(subItem => subItem.email === this.getStandardEmail(tempEmail));
                                    if (currentMail && currentMail.type) {
                                        if (currentMail.type !== 0) {
                                            item.companyName = currentMail.companyName || '';
                                            item.contactsName = currentMail.contactsName || '';
                                        } else {
                                            item.contactsName = handleMailAddress(tempEmail);
                                        }
                                        if (item.recieverCrmFlag !== currentMail.type) {
                                            item.recieverCrmFlag = currentMail.type;
                                            this.updateCrmFlag(currentMail, currentMail.type);
                                        }
                                    } else {
                                        item.contactsName = handleMailAddress(tempEmail);
                                    }
                                } else {
                                    const tempEmail = item.sender;
                                    currentMail = this.crmEmails.find(subItem => subItem.email === this.getStandardEmail(tempEmail));
                                    if (currentMail && currentMail.type) {
                                        if (currentMail.type !== 0) {
                                            item.companyName = currentMail.companyName || '';
                                            item.contactsName = currentMail.contactsName || '';
                                        } else {
                                            item.contactsName = handleMailAddress(tempEmail);
                                        }
                                        if (item.mailCrmFlag !== currentMail.type) {
                                            item.mailCrmFlag = currentMail.type;
                                            this.updateCrmFlag(currentMail, currentMail.type);
                                        }
                                    } else {
                                        item.contactsName = handleMailAddress(tempEmail);
                                    }
                                }
                            });
                        } else {
                            console.error('获取邮件小人头状态失败');
                        }
                    });
                }

                function handleMailAddress(mailAdd) {
                    let startIndex = 0;
                    let endIndex = -1;
                    if (mailAdd && mailAdd.lastIndexOf('<') > 0) {
                        endIndex = mailAdd.lastIndexOf('<');
                    } else if (mailAdd.lastIndexOf('@') > 0) {
                        endIndex = mailAdd.lastIndexOf('@');
                    } else {
                        endIndex = mailAdd.length;
                    }
                    if (mailAdd && mailAdd.lastIndexOf('<') === 0) {
                        startIndex = 1;
                    }
                    mailAdd = mailAdd.slice(startIndex, endIndex);
                    return mailAdd;
                }
            },
            /* 更新小人头状态 */
            updateCrmFlag(data) {
                util.ajaxMail({
                    url: '/mail/mailBoxs/updateCrmFlagNew',
                    method: 'post',
                    timeout: 360000,
                    data: {
                        address: data.email,
                        orgId: this.orgId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        console.log('修改crmFlag成功');
                    }
                });
            },
            /* 获取标准邮箱 */
            getStandardEmail(emailAdd) {
                if (emailAdd && emailAdd.lastIndexOf('<') !== -1) {
                    const startIndex = emailAdd.lastIndexOf('<');
                    return emailAdd.slice(startIndex + 1, emailAdd.length - 1);
                } else {
                    return emailAdd;
                }
            },

            /** 收信 调用父组件方法 */
            receiveMail() {
                this.$emit('receiveMail');
            },
            /** 获取自定义文件夹列表 */
            getCustomFolders() {
                util.ajaxMail({
                    url: `/mail/mailBoxTypes/${this.userId}`,
                    method: 'GET'
                }).then(response => {
                    if (response.data.code === 1) {
                        if (!response.data.data || !response.data.data.length) {
                            this.customFolders = [
                                {
                                    boxTypeName: this.$t('timeLine.noData'),
                                    id: -1
                                }
                            ];
                        } else {
                            this.customFolders = response.data.data;
                        }
                    }
                });
            },
            /** 获取并处理邮箱列表数据 */
            getMailTableData(isUpdateDetail = false, isKeepScroll = false) {
                // 记录当前滚动条位置
                this.scrollTop = isKeepScroll ? this.$refs.mailListContainer.scrollTop : 0;

                this.loading = true;
                let postData = {
                    enterpriseId: this.orgId,
                    createUserId: this.userId,
                    accountId: this.currentCustomerAccount === this.$t('mail.accountPlh') ? '' : this.currentCustomerAccount,
                    accountIds: [],
                    page: this.page,
                    size: this.pageSize,
                    inquiryId: this.currentInquiryId
                };
                const query = this.handleQuerys();
                postData = Object.assign(postData, query);
                /* 按标签查询 this.mailBoxType 是 'tag_2'的形式 */
                if (this.mailBoxType.indexOf('tag_') !== -1) {
                    postData = Object.assign({
                        mailLabelId: this.mailBoxType.split('_')[1]
                    }, postData);
                }
                const data = [];
                this.$store.commit('set_mail_detail_params', postData);
                util.ajaxMailJson({
                    url: '/mail/mailBoxsAndLabel',
                    method: 'POST',
                    data: postData
                }).then(response => {
                    this.loading = false;
                    if (response.data.code === 1) {
                        this.currentPageNum = this.currentPage;
                        this.total = response.data.data.totalElements;
                        if (!response.data.data.content.length && this.currentPage > 1) {
                            this.$store.commit('setCurrentPage', this.currentPage - 1);
                            this.mailTableData = this.getMailTableData(isUpdateDetail, isKeepScroll);
                        }
                        this.handle_table_data(response.data.data.content, data);
                        this.emptySelection();
                        // 有显示邮件详情, 刷新邮件详情
                        setTimeout(() => {
                            // 将滚动条恢复到之前的位置
                            this.$refs.mailListContainer.scrollTop = this.scrollTop;

                            if (this.selectedMailIndex !== -1) {
                                // 如果要求刷新邮件详情
                                if (isUpdateDetail && this.$refs.mailDetail) {
                                    this.$refs.mailDetail.getMailDetailById();
                                }

                                // 处理左侧列表滚动条
                                // 如果刷新前左侧被打开邮件在视图内, 刷新后不在视图内, 则调整滚动条令其显示
                                const activeMailDOM = this.$refs.mailListContainer.querySelector('.selected-mail-item');
                                if (this.isInView && !Utils.isInViewPort(activeMailDOM, this.$refs.mailListContainer)) {
                                    this.$refs.mailListContainer.scrollTop = activeMailDOM.offsetTop;
                                }
                            } else {
                                // 如果记录了之前被打开邮件在邮件列表中的位置
                                if (this.beforeIndex !== -1) {
                                    // 如果之前的位置仍存在于当前邮件列表
                                    if (this.beforeIndex < this.mailTableData.length) {
                                        // 打开该位置邮件
                                        this.goMailDetail(this.mailTableData[this.beforeIndex]);
                                    } else {
                                        // 如果当前列表还有数据
                                        if (this.mailTableData.length) {
                                            // 打开最后一封邮件
                                            this.goMailDetail(this.mailTableData[this.mailTableData.length - 1]);
                                            // 将滚动条滚动到最底部
                                            this.$refs.mailListContainer.scrollTop = 999999;
                                        }
                                    }
                                }
                            }

                            // 重置滚动条相关数据
                            this.scrollTop = 0;
                            this.isInView = false;
                            this.beforeIndex = -1;
                        }, 0);
                    } else {
                        this.$Message.error(this.$t('catch_message.error'));
                    }
                }).catch((err) => {
                    this.loading = false;
                    this.$Message.error(this.$t('catch_message.error'));
                });
                return data;
            },
            /** 跳转到邮件详情页 */
            goMailDetail(item) {
                this.$store.commit('setSelectedMailId', '');
                this.$nextTick(() => {
                    this.$store.commit('setSelectedMailId', item.id);
                    this.$store.commit('setSelectMailBoxType', 'customerBox');
                    this.$store.commit('setSelectCustomerInquiryId', this.currentInquiryId);
                    //  this.$emit('handleView', 'MailDetail');
                });
            },
            /** 处理筛选条件 */
            handleQuerys() {
                let result = {};
                for (const key in this.config_tableFilter) {
                    if (!this.config_tableFilter.hasOwnProperty(key)) continue;
                    if (this.config_tableFilter[key].query) {
                        const temp = {};
                        let queryValue = [];
                        switch (key) {
                            case 'avatar':
                                result = Object.assign(result, {
                                    mailCrmFlags: this.config_tableFilter[key].query.map(item => {
                                        return item.value;
                                    }),
                                    recieverCrmFlags: this.config_tableFilter[key].query.map(item => {
                                        return item.value;
                                    })
                                });
                                break;
                            case 'sender':
                                result = Object.assign(result, {
                                    mailFroms: [this.config_tableFilter[key].query]
                                });
                                break;
                            case 'subject':
                                result = Object.assign(result, {
                                    subject: this.config_tableFilter[key].query
                                });
                                break;
                            case 'recipient':
                                result = Object.assign(result, {
                                    mailTos: [this.config_tableFilter[key].query]
                                });
                                break;
                            case 'date':
                                result = Object.assign(result, {
                                    sendStartDate: this.config_tableFilter[key].query[0] ? this.dateFormat('yyyy-MM-dd', this.config_tableFilter[key].query[0]) : '',
                                    sendEndDate: this.config_tableFilter[key].query[1] ? this.dateFormat('yyyy-MM-dd', this.config_tableFilter[key].query[1]) : ''
                                });
                                break;
                            case 'mailStatusFilter':
                                // 邮件状态是否被选中, 传值为 0--未回复；1--已回复；2--发送失败；3--邮件被打开
                                queryValue = this.config_tableFilter[key].query.map(item => item.value)[0];
                                switch (queryValue) {
                                    case 1:
                                        temp.mailAnsweredFlag = '0';
                                        break;
                                    case 2:
                                        temp.mailAnsweredFlag = '1';
                                        break;
                                    case 3:
                                        temp.mailSuccessFlag = '0';
                                        break;
                                    case 4:
                                        temp.mailOpenFlag = '1';
                                        break;
                                }
                                result = Object.assign(result, temp);
                                break;
                            default:
                                break;
                        }
                    }
                }
                return result;
            },
            /** 筛选 tag close tag 时去掉对应的筛选条件并刷新 */
            remove_filter_tag(key) {
                // 清空筛选条件
                const temp = this.config_tableFilter[key];
                if (temp) {
                    switch (temp.filterType) {
                        case 'string':
                            temp.query = '';
                            break;
                        case 'select':
                        case 'selectSingle':
                        case 'date':
                            temp.query = [];
                            break;
                    }
                    this.$set(this.config_tableFilter, key, temp);
                }

                // 刷新
                this.$store.commit('setCurrentPage', 1);
                this.mailTableData = this.getMailTableData();
            },
            // filterTags 组件内部修改筛选值后触发的方法, 由下方的 updateList 改造而成
            change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    this.$store.commit('setCurrentPage', 1);
                    this.mailTableData = this.getMailTableData();
                } else {
                    this.remove_filter_tag(key);
                }
            },
            /* 获取当前页面所有的邮件地址 */
            getCurrentPageEmails(data) {
                this.emails = [];
                data.forEach(item => {
                    if (item.fromOrToFlag && item.recipient[0]) {
                        this.emails.push(item.recipient[0]);
                    } else if (item.sender) {
                        this.emails.push(item.sender);
                    }
                });
                this.emails = this.emails.map(item => {
                    return this.getStandardEmail(item);
                });
            },
            /** 获取邮件列表（0-unreadBox(未读箱)、0-inbox(收件箱)、5-draftBox(草稿箱)、4-sentBox(已发箱)、3-dustbin(已删除箱)、2-trash(垃圾箱)）、6-star_box（星邮件） */
            handle_table_data(mailList, setData) {
                for (let i = 0; i < mailList.length; i++) {
                    const data = {
                        id: mailList[i].id,
                        theme: (mailList[i].mailSubject === '') ? this.$t('mail.writeLetter.noSubject') : mailList[i].mailSubject,
                        sender: mailList[i].mailFrom,
                        recipient: mailList[i].mailTo[0] === '[' && mailList[i].mailTo[mailList[i].mailTo.length - 1] === ']' ? JSON.parse(mailList[i].mailTo) : mailList[i].mailTo.split(','),
                        date: mailList[i].mailSendDate ? this.dateFormat('yyyy-MM-dd', mailList[i].mailSendDate) : '',
                        wholeDate: mailList[i].mailSendDate ? this.dateFormat('yyyy-MM-dd hh:mm:ss', mailList[i].mailSendDate) : '',
                        fromOrToFlag: mailList[i].fromOrToFlag, // 收信还是发信  1-发信
                        fav: mailList[i].mailReadFlag, // 0-未读   1-已读
                        originalMailBoxTypeId: mailList[i].originalMailBoxTypeId, // 邮件原始来源邮箱
                        mailCrmFlag: mailList[i].mailCrmFlag, // 发件人是否在crm系统中存在
                        clueFlag: `${mailList[i].mailMyclueFlag}`, // 发件人是否在线索中存在
                        recieverCrmFlag: mailList[i].recieverCrmFlag, // 收件人是否在crm系统中存在
                        recieverClueFlag: `${mailList[i].recieverMyclueFlag}`, // 收件人是否在crm系统中存在
                        receiptFlag: mailList[i].mailReceiptFlag, // 回执
                        attachmentFlag: mailList[i].mailAttachmentFlag, // 附件
                        urgentFlag: mailList[i].mailUrgentFlag, // 紧急
                        successFlag: mailList[i].mailSuccessFlag, // 发送是否成功
                        mailGroupSendingSingleShowFlag: mailList[i].mailGroupSendingSingleShowFlag, // 群发单显
                        mailTraceFlag: mailList[i].mailTraceFlag, // 追踪
                        recentOpenIp: mailList[i].recentOpenIp, // 追踪气泡中最近打开位置IP
                        recentOpenPosition: mailList[i].recentOpenPosition, // 追踪气泡中最近打开位置
                        recentOpenTime: mailList[i].recentOpenTime ? mailList[i].recentOpenTime.substr(0, 19) : '', // 追踪气泡中最近打开时间
                        mailOpenTimes: mailList[i].mailOpenTimes, // 追踪气泡中打开次数
                        mailStarFlag: mailList[i].mailStarFlag, // 是否有星标
                        mailTimeFlag: mailList[i].mailTimeFlag, // 是否有定时邮件
                        mailBoxTypeId: mailList[i].mailBoxTypeId, // 邮件属于哪个箱
                        mailDraftFlag: mailList[i].mailDraftFlag, // 邮件是不是草稿
                        createUserId: mailList[i].createUserId,
                        labelColor: mailList[i].labelColor ? mailList[i].labelColor.split(',') : [],
                        labelId: mailList[i].labelId ? mailList[i].labelId.split(',') : [],
                        labelName: mailList[i].labelName ? mailList[i].labelName.split(',') : [],
                        mailAnsweredFlag: mailList[i].mailAnsweredFlag, // 邮件是否被回复
                        mailSendErrorMsg: mailList[i].mailSendErrorMsg, // 邮件发送失败原因
                        replyTo: mailList[i].replyTo && mailList[i].replyTo[0] === '[' && mailList[i].replyTo[mailList[i].replyTo.length - 1] === ']' ? JSON.parse(mailList[i].replyTo)[0] : (mailList[i].replyTo ? mailList[i].replyTo.split(',')[0] : ''), // 指定回复邮箱
                        mailResumes: mailList[i].mailResumes, // 邮件正文内容
                        mailToDoFlag: mailList[i].mailToDoFlag, // 邮件的处理状态 0--未设置  1--待处理  2--已完成
                        companyName: '', // 邮箱对应的公司名称
                        contactsName: '', // 邮箱对应的客户名称
                        mailInterForwardingFlag: mailList[i].mailInterForwardingFlag, // 邮件是否来自于内部转发 0---不是 1---是
                        mailForwardedInternallyFlag: mailList[i].mailForwardedInternallyFlag // 邮件是否已被内部转发 0---否  1---是
                    };
                    setData.push(data);
                }
                this.getCurrentPageEmails(setData);
                this.getCompanyStatusByEmails();
            },
            /* 获取当前可支持操作的邮件id集合 */
            getSupportOperateIds(types, arr = this.selectMailList) {
                const ids = [];
                const mailBoxTypeIds = [];
                for (let i = 0; i < arr.length; i++) {
                    const item = arr[i];
                    if (types.every(type => type !== item.mailBoxTypeId)) {
                        ids.push(item.id);
                        mailBoxTypeIds.push(item.mailBoxTypeId);
                    }
                }
                return { ids, mailBoxTypeIds };
            },
            /** 标记已读/未读 */
            changeReadState(name) {
                switch (name) {
                    case 'read':
                        this.readPart(1);
                        break;
                    case 'unread':
                        this.readPart(0);
                        break;
                    case 'readAll':
                        this.readAll();
                        break;
                    case 'star':
                        this.flag_star(1);
                        break;
                    case 'unstar':
                        this.flag_star(0);
                        break;
                    case 'addtag':
                        this.tagModal = true;
                        break;
                    case 'changeFinished':
                        this.changeProcessingState(2);
                        break;
                    case 'changeUntreated':
                        this.changeProcessingState(1);
                        break;
                }
            },
            /** 标记已读未读 */
            readPart(flag) {
                let ids = [];
                if (this.selectMailList.length !== 0) {
                    if (this.toggleCustomerBox) {
                        ids = this.getSupportOperateIds([2, 3, 5]).ids;
                    } else {
                        ids = this.selectMailIds;
                    }
                } else {
                    this.$Message.warning(this.$t('mail.noMailSelectedTip'));
                }
                if (ids.length) {
                    util.ajaxMailJson({
                        url: '/mail/mailReadFlag',
                        method: 'PUT',
                        data: {
                            ids: ids,
                            mailReadFlag: flag,
                            updateUserId: this.userId,
                            updateUserName: this.userName
                        }
                    }).then(response => {
                        if (response.data.code === 1) {
                            if (ids.length !== this.selectMailIds.length) {
                                this.$Message.success('已删除/垃圾箱的邮件不支持标记已读未读操作！');
                            }
                            this.emptySelection();
                            this.mailTableData = this.getMailTableData();
                            this.$store.dispatch('getUnreadMail');

                            // 更新"新收邮件未读数统计数据", 从中剔除掉已读邮件
                            if (flag === 1) {
                                this.$store.commit('updateNewReceiveMails', {
                                    type: 'removeRead',
                                    data: ids
                                });
                            }
                        } else {
                            this.$Message.error('标记已读未读失败，请刷新后重试！');
                        }
                    }).catch(() => {
                        this.$Message.error('标记已读未读失败，请刷新后重试！');
                    });
                } else {
                    this.$Message.success('已删除/垃圾箱的邮件不支持标记已读未读操作！');
                    this.emptySelection();
                    this.mailTableData = this.getMailTableData();
                    this.$store.dispatch('getUnreadMail');
                }
            },
            /** 全部标记已读 */
            readAll() {
                util.ajaxMailJson({
                    url: '/mail/mailReadFlagAllRead',
                    method: 'PUT',
                    data: {
                        updateUserId: this.userId,
                        updateUserName: this.userName
                    }
                }).then(response => {
                    if (response.data.code === 1) {
                        this.emptySelection();
                        this.$store.dispatch('getUnreadMail');
                        this.mailTableData = this.getMailTableData();
                        this.$Message.success(this.$t('mail.markReadAllSuccess'));

                        // 更新"新收邮件未读数统计数据", 从中剔除掉当前箱体
                        this.$store.commit('updateNewReceiveMails', {
                            type: 'clear'
                        });
                    } else {
                        this.$Message.error(this.$t('mail.markReadAllError'));
                    }
                }).catch(() => {
                    this.$Message.error(this.$t('mail.markReadAllError'));
                });
            },
            // 邮件详情页触发'已读/未读'状态变更
            mailReadStateChanged(flag) {
                if (this.selectedMailIndex !== -1) {
                    this.$set(this.mailTableData, this.selectedMailIndex, Object.assign(this.mailTableData[this.selectedMailIndex], { fav: flag }));
                }
            },
            /** 标记星标 */
            flag_star(isFlag, arr = this.selectMailList) {
                // isFlag 1是标记 0是取消标记
                let ids = [];
                if (arr.length) {
                    if (this.toggleCustomerBox) {
                        ids = this.getSupportOperateIds([2, 3, 5], arr).ids;
                    } else if (arr.length === 1) {
                        ids = arr.map(item => item.id);
                    } else if (this.selectMailIds.length) {
                        ids = this.selectMailIds;
                    }
                } else {
                    this.$Message.info(this.$t('mail.please_flag_mail'));
                }
                if (ids.length) {
                    util.ajaxMailJson({
                        url: '/mail/mailBoxs/starMailBox',
                        method: 'put',
                        data: {
                            ids: ids,
                            mailStarFlag: isFlag,
                            updateUserId: this.userId,
                            updateUserName: this.userName
                        }
                    }).then(({ data }) => {
                        if (data.code !== 1) {
                            this.$Message.error(this.$t('mail.flag_star_error'));
                        }
                        if (ids.length !== arr.length) {
                            this.$Message.success('已删除/垃圾箱的邮件不支持星标操作！');
                        }
                        // 这里暂且用 arr.length === 1 来判断"是左侧邮件条目向上 $emit", 而不是"批量选中邮件", 不一定准确
                        this.mailTableData = this.getMailTableData(false, arr.length === 1);
                        this.emptySelection();
                    }).catch(() => {
                        this.$Message.error(this.$t('mail.flag_star_error'));
                    });
                } else {
                    this.$Message.success('已删除/垃圾箱的邮件不支持星标操作！');
                    this.mailTableData = this.getMailTableData();
                    this.emptySelection();
                }
            },
            /** 保存并给选中项添加标签 */
            saveTag() {
                if (!this.tagName) {
                    return;
                } else if (this.tagName.realLength() > 20) {
                    this.$Message.warning('长度不能大于20个字符');
                    return;
                }
                if (this.tagList.includes(this.tagName)) {
                    const tag = this.tagList.filter(item => {
                        return item.labelName === this.tagName;
                    });
                    this.tagModal = false;
                    this.tagName = '';
                    this.mailAddLabel(tag[0].id);
                    return;
                }
                const jsonData = {
                    createUserId: this.userId,
                    createUserName: this.fullName,
                    labelColor: this.colors.filter(item => {
                        return item.show === true;
                    })[0].color,
                    labelName: this.tagName,
                    orgId: this.orgId
                };
                util.ajaxMailJson({
                    url: 'mail/maillabel/add',
                    method: 'post',
                    data: jsonData
                }).then(res => {
                    if (res.data.code === 1) {
                        this.tagModal = false;
                        this.tagName = '';
                        this.getTags();
                        this.$emit('updateTagList', 'tagMenu');
                        this.$Message.success('成功添加标签');
                        if (this.selectMailList.length > 0) {
                            this.mailAddLabel(res.data.data.id);
                        }
                    } else {
                        this.$Message.error(res.data.msg);
                    }
                }).catch(() => {
                    this.$Message.error('添加标签失败，请刷新后重试');
                });
            },
            /** 移动到自定义文件夹 */
            moveTo(name) {
                if (name === -1) {
                    return false;
                }
                if (this.selectMailList.length === 0) {
                    this.$Message.warning(this.$t('mail.noMailSelectedTip'));
                } else {
                    this.starBoxMove(name);
                }
            },
            /** 星标箱移动到文件夹 */
            starBoxMove(name) {
                const mailMap = {};
                let ids = [];
                let mailBoxTypeIds = [];
                if (this.toggleCustomerBox) {
                    const res = this.getSupportOperateIds([2, 3, 5]);
                    ids = res.ids;
                    mailBoxTypeIds = res.mailBoxTypeIds;
                } else {
                    ids = this.selectMailIds;
                    mailBoxTypeIds = this.selectMailBoxTypeIds;
                }
                ids.forEach((item, i) => {
                    mailMap[item] = mailBoxTypeIds[i];
                });
                if (ids.length) {
                    util.ajaxMailJson({
                        url: '/mail/moveStarMailBox',
                        method: 'put',
                        data: {
                            destinationMailBoxTypeId: name,
                            mailMap,
                            updateUserId: this.userId,
                            updateUserName: this.userName
                        }
                    }).then(res => {
                        if (res.data.code === 1) {
                            if (ids.length !== this.selectMailIds.length) {
                                this.$Message.success('已删除/垃圾箱的邮件不支持移动到自定义文件夹操作！');
                            }
                            this.emptySelection();
                            this.mailTableData = this.getMailTableData();
                        } else {
                            this.$Message.error('移动到自定义文件夹失败，请刷新后重试');
                        }
                    }).catch(() => {
                        this.$Message.error('移动到自定义文件夹失败，请刷新后重试');
                    });
                } else {
                    this.$Message.success('已删除/垃圾箱的邮件不支持移动到自定义文件夹操作！');
                    this.emptySelection();
                    this.mailTableData = this.getMailTableData();
                }
            },
            /* 删除，删除确认弹窗 */
            handleDelete() {
                if (this.selectMailList.length !== 0) {
                    this.deleteModel = true;
                } else {
                    this.$Message.warning(this.$t('mail.noMailSelectedTip'));
                }
            },
            /** 给选中项添加标签 */
            mailAddLabel(tagId) {
                let ids = [];
                if (this.selectMailIds.length) {
                    if (this.toggleCustomerBox) {
                        ids = this.getSupportOperateIds([2, 3, 5]).ids;
                    } else {
                        ids = this.selectMailIds;
                    }
                } else {
                    this.$Message.warning(this.$t('mail.noMailSelectedTip'));
                }
                if (ids.length) {
                    util.ajaxMailJson({
                        url: 'mail/maillabel/operateMailLabel',
                        method: 'post',
                        data: {
                            mailBoxIds: ids,
                            mailLabelId: tagId,
                            operateState: 1
                        }
                    }).then(async res => {
                        if (res.data.code === 1) {
                            if (ids.length !== this.selectMailIds.length) {
                                await this.$Message.success('已删除/垃圾箱的邮件不支持标记标签操作！');
                            }
                            this.mailTableData = this.getMailTableData();
                            this.emptySelection();
                            await this.$Message.success('成功设置邮件标签');
                        } else {
                            this.$Message.error('设置邮件标签失败，请刷新后重试');
                        }
                    }).catch(() => {
                        this.$Message.error('设置邮件标签失败，请刷新后重试');
                    });
                } else {
                    this.$Message.success('已删除/垃圾箱的邮件不支持标记标签操作！');
                    this.mailTableData = this.getMailTableData();
                    this.emptySelection();
                }
            },
            /** 标记标签 */
            signLabel(tagId) {
                if (tagId === -1) {
                    return false;
                }
                let ids = [];
                if (tagId === 'addtag') {
                    this.tagModal = true;
                    return;
                }
                if (this.selectMailIds.length) {
                    if (this.toggleCustomerBox) {
                        ids = this.getSupportOperateIds([2, 3, 5]).ids;
                    } else {
                        ids = this.selectMailIds;
                    }
                } else {
                    this.$Message.warning(this.$t('mail.noMailSelectedTip'));
                }
                if (ids.length) {
                    util.ajaxMailJson({
                        url: 'mail/maillabel/operateMailLabel',
                        method: 'post',
                        data: {
                            mailBoxIds: ids,
                            mailLabelId: tagId,
                            operateState: 1
                        }
                    }).then(async res => {
                        if (res.data.code === 1) {
                            if (ids.length !== this.selectMailIds.length) {
                                await this.$Message.warning('已删除/垃圾箱的邮件不支持标记标签操作！');
                            }
                            this.mailTableData = this.getMailTableData();
                            this.emptySelection();
                            await this.$Message.success('成功设置邮件标签');
                        } else {
                            this.$Message.error('设置邮件标签失败，请刷新后重试');
                        }
                    }).catch(() => {
                        this.$Message.error('设置邮件标签失败，请刷新后重试');
                    });
                } else {
                    this.$Message.success('已删除/垃圾箱的邮件不支持标记标签操作！');
                    this.mailTableData = this.getMailTableData();
                    this.emptySelection();
                }
            },
            /** 删除标签(arr,number) */
            mailDelLabel(mailId, tagId) {
                util.ajaxMailJson({
                    url: 'mail/maillabel/operateMailLabel',
                    method: 'post',
                    data: {
                        mailBoxIds: [mailId],
                        mailLabelId: tagId,
                        operateState: 0
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        this.mailTableData = this.getMailTableData(false, true);
                    } else {
                        this.$Message.error(this.$t('mail.deleteErrorTip'));
                    }
                }).catch(() => {
                    this.$Message.error(this.$t('mail.deleteErrorTip'));
                });
            },
            /** 选择颜色 */
            colorClick(index) {
                for (let i = 0; i < this.colors.length; i++) {
                    this.colors[i].show = i === index;
                }
            },
            /** 获取所有标签列表 */
            getTags() {
                util.ajaxMail({
                    url: 'mail/maillabel/all',
                    method: 'get',
                    params: {
                        createUserId: this.userId
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        if (!res.data.data.length) {
                            this.tagList = [{
                                labelName: this.$t('timeLine.noData'),
                                id: -1
                            }];
                        } else {
                            this.tagList = res.data.data;
                        }
                    }
                });
            },
            /** 清空选中项 */
            emptySelection() {
                this.checkAll = false;
                this.indeterminate = false;
                this.selectMailList = [];
            },
            /** 选择邮件 */
            handle_select_mail(mailData) {
                const mailIndex = this.selectMailList.findIndex(item => item.id === mailData.id);
                if (mailIndex !== -1) {
                    this.selectMailList.splice(mailIndex, 1);
                } else {
                    this.selectMailList.push(this.$deepClone(mailData));
                }

                if (this.total === this.selectMailList.length) {
                    this.checkAll = true;
                    this.indeterminate = false;
                } else if (this.selectMailList.length > 0) {
                    this.checkAll = false;
                    this.indeterminate = true;
                } else {
                    this.indeterminate = false;
                    this.checkAll = false;
                }
            },
            /** 全选 */
            handleCheckAll() {
                if (this.indeterminate) {
                    this.checkAll = false;
                } else {
                    this.checkAll = !this.checkAll;
                }
                this.indeterminate = false;

                this.selectMailList = this.checkAll ? this.$deepClone(this.mailTableData) : [];
            },
            // 全选旁下拉按钮状态筛选
            handleStatusFilter(val) {
                const temp = this.config_tableFilter.mailStatusFilter.allList.filter(item => item.value === val);
                if (this.config_tableFilter.mailStatusFilter) {
                    this.$set(this.config_tableFilter.mailStatusFilter, 'query', temp);
                }
                this.pageChange(1);
            },
            /** 翻页操作 */
            pageChange(num) {
                this.$store.commit('setCurrentPage', num);
                this.currentPageNum = num;
                this.mailTableData = this.getMailTableData();
            },
            /** 改变表格每页展示数据量 */
            pageSizeChange(size) {
                this.$store.commit('setPageSize', size);
                this.pageSize = size;
                util.ajaxJson({
                    url: '/crm/userconfig/update',
                    method: 'POST',
                    data: {
                        orgId: this.orgId,
                        userId: this.userId,
                        key: 'mailBox',
                        value: size.toString()
                    }
                }).then(res => {
                    console.log('update的结果为', res.data);
                });
                this.mailTableData = this.getMailTableData();
            },

            /** 日期格式化 */
            dateFormat(fmt, timeStramp) {
                const date = new Date(timeStramp);
                const o = {
                    'M+': date.getMonth() + 1, // 月份
                    'd+': date.getDate(), // 日
                    'h+': date.getHours(), // 小时
                    'm+': date.getMinutes(), // 分
                    's+': date.getSeconds(), // 秒
                    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
                    S: date.getMilliseconds() // 毫秒
                };
                if (/(y+)/.test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (`${date.getFullYear()}`).substr(4 - RegExp.$1.length));
                }
                for (const k in o) {
                    if (new RegExp(`(${k})`).test(fmt)) {
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)));
                    }
                }
                return fmt;
            },
            /* 更新邮件列表 */
            updateTable() {
                // 记录当前打开的邮件是否在视口内
                this.isInView = (this.selectedMailIndex !== -1) && Utils.isInViewPort(this.$refs.mailListContainer.querySelector('.selected-mail-item'), this.$refs.mailListContainer);
                // 记录当前打开邮件在列表中的位置
                this.beforeIndex = this.selectedMailIndex;

                // 重新获取邮件列表和邮件详情
                this.mailTableData = this.getMailTableData(true, true);
            },

            /**
             * @Description: 客户箱新增功能相关方法
             * @author 杨娣
             * @date 2019/9/21
             */
            customerBoxMailMerger() {
                util.ajaxMailJson({
                    url: '/mail/operateMailMerger',
                    method: 'PUT',
                    data: {
                        mailBoxIds: this.selectMailIds,
                        userId: this.userId,
                        orgId: this.orgId,
                        inquiryId: this.currentInquiryId
                    }
                }).then(res => {
                    this.deleteModel = false;
                    if (res.data.code === 1) {
                        if (this.selectMailIds.length === this.mailTableData.length) {
                            this.$store.commit('setCurrentPage', this.currentPage - 1);
                        }
                        this.emptySelection();
                        this.mailTableData = this.getMailTableData();
                    }
                });
            },
            /* 改变邮件的处理状态 */
            changeProcessingState(status, arr = this.selectMailList) {
                let ids = [];
                if (arr.length) {
                    if (this.toggleCustomerBox) {
                        ids = this.getSupportOperateIds([2, 3, 5], arr).ids;
                    } else if (arr.length === 1) {
                        ids = arr.map(item => item.id);
                    } else if (this.selectMailIds.length) {
                        ids = this.selectMailIds;
                    }
                } else {
                    this.$Message.info(this.$t('mail.please_flag_mail'));
                }
                if (ids.length) {
                    util.ajaxJson({
                        url: '/mail/toDoMail',
                        method: 'post',
                        data: {
                            ids: ids,
                            mailFlag: status,
                            orgId: this.orgId,
                            userId: this.userId
                        }
                    }).then(res => {
                        if (res.data.code === 1) {
                            if (ids.length !== arr.length) {
                                this.$Message.success(this.$t('mail.notSupportUntreatedTip2'));
                            }
                            // 这里暂且用 arr.length === 1 来判断"是左侧邮件条目向上 $emit", 而不是"批量选中邮件", 不一定准确
                            this.mailTableData = this.getMailTableData(false, arr.length === 1);
                            this.emptySelection();
                            this.$store.dispatch('getUnreadMail');
                            switch (status) {
                                case 1:
                                    this.$Message.success(this.$t('mail.markAsUntreatedSuccess'));
                                    break;
                                case 2:
                                    this.$Message.success(this.$t('mail.markAsFinishedSuccess'));
                                    break;
                            }
                        }
                    }).catch(err => {
                        console.log('changeProcessingState()---err', err, status);
                    });
                } else {
                    this.$Message.success(this.$t('mail.notSupportUntreatedTip2'));
                    this.mailTableData = this.getMailTableData();
                    this.emptySelection();
                }
            },

            /**
             * @Description: 添加此方法，解决小人头颜色标识与问题提示内容不一致的bug
             * @author 杨娣
             * @date 2019/9/11
             */
            changeCrmFlag({ param, key, type }) {
                param[key] = type;
            },
            /* 创建线索 */
            createClue(mailId, email) {
                this.mailAddress = email;
                this.newClueShow = true;
                this.getClueOption(mailId);
            },
            // 获取线索字段
            getClueOption(mailId) {
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.orgId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.templateId = response.data.data.template.id;
                        this.json_data = {
                            templateId: this.templateId,
                            enterpriseId: this.orgId,
                            source: 3,
                            userId: this.userId,
                            userName: this.userName,
                            a10010: this.mailAddress,
                            id: mailId
                        };
                    }
                });
            },
            on_cancle_clue(data) {
                this.newClueShow = data.close;
            },
            // 录入为线索后
            updateStatus(clueId, status) {
                this.newClueShow = false;
                this.clueId = clueId;
            },
            // 录入成询盘后
            updateInquiryStatus(clueId, status) {
                this.newClueShow = false;
                this.clueId = clueId;
            },
            /** 显示详情 */
            async showCompany({ companyId, rightUserIds, type }) {
                if (type === 0) {
                    if (!this.isContainsMenu('highseasCustomer')) {
                        this.$Message.warning('您没有查看公海数据的权限，无法查看');
                        return;
                    }
                } else {
                    if (this.isContainsMenu('myCustomer')) {
                        if (type === 2) {
                            const flag = await this.isHaveManageAuthority(rightUserIds);
                            if (!flag) {
                                this.$Message.warning('您当前无权限查看此客户');
                                return false;
                            }
                        }
                    } else {
                        this.$Message.warning('您没有客户管理页面的查看权限，请联系您的管理员开通');
                        return false;
                    }
                }
                this.show_clue_detail = false;
                this.show_company_detail = false;

                this.$nextTick(() => {
                    this.companyId = companyId;
                    /**
                     * @Description: 如要修改点击橙色小人头标识跳转至目标详情页，修改此处的type_company即可。
                     *               customer(客户详情页)/inquiry(询盘详情页)
                     *               type为1和2，代表需要打开的是客户详情页；但当用户在客户箱列表页点击客户小人头时，
                     *               则需要打开询盘详情页，对应的type为3
                     * @author 杨娣
                     * @date 2021/01/20
                     */
                    if (type === 3) {
                        this.type_company = 'inquiry';
                    } else if (type === 2 || type === 1) {
                        this.type_company = 'customer';
                    } else if (type === 0) {
                        this.type_company = 'highseasCustomer';
                    }
                    this.show_company_detail = true;
                });
            },
            async showClue({ clueId, rightUserIds, createUserIds, type }) {
                if (type === 0) {
                    if (!this.isContainsMenu('common_sea_customer')) {
                        this.$Message.warning('您没有查看公海数据的权限，无法查看');
                        return;
                    }
                } else {
                    if (this.isContainsMenu('my_clue')) {
                        if (type === 2) {
                            const flag = await this.isHaveManageAuthority(rightUserIds.concat(createUserIds));
                            if (!flag) {
                                this.$Message.warning('您当前无权限查看此线索');
                                return false;
                            }
                        }
                    } else {
                        this.$Message.warning('您没有线索管理页面的查看权限，请联系您的管理员开通');
                        return false;
                    }
                }
                this.show_company_detail = false;
                this.show_clue_detail = false;
                this.$nextTick(() => {
                    this.clueId = clueId;
                    this.show_clue_detail = true;
                    if (type === 1 || type === 2) {
                        this.type_clue = 'clue';
                    } else if (type === 0) {
                        this.type_clue = 'highseasClue';
                    }
                });
            },
            /* 点击已回复图标跳转至已回复邮件详情页前 */
            goToForwardDetail(row) {
                /* 当邮件类型为收件时，有两类图标可能显示，其一：已回复图标；其二，内部转发相关图标。
                当判断当前显示的不是已回复图标时，此次点击动作无效；反之若是已回复图标被点击，则需要跳转至回复邮件的详情。 */
                if (!row.fromOrToFlag && row.mailAnsweredFlag !== 1) {
                    return false;
                }
                console.log('即将跳转至最近一封已回复的邮件详情', row.id);
                /* 通过接口获取最近一封已回复邮件的id */
                util.ajax({
                    url: '/mail/answerMailSkip',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.orgId,
                        mailId: row.id
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data.length) {
                            const answerMailId = res.data.data[0].answerMailId;
                            if (res.data.data[0] && answerMailId) {
                                /* 先获取邮件详情并保存至localStorage中 */
                                this.getMailDetailById(answerMailId);
                            }
                        } else {
                            this.$Message.error('回复邮件已被删除，无法查看！');
                        }
                    } else {
                        this.$Message.error('跳转失败，请刷新后重试');
                    }
                }).catch(() => {
                    this.$Message.error('跳转失败，请刷新后重试');
                });
            },
            /* 获取邮件详情 */
            getMailDetailById(id) {
                util.ajaxMailJson({
                    url: '/mail/mailDetail',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.orgId,
                        id
                    },
                    timeout: 60000
                }).then(res => {
                    if (res.data.code === 1) {
                        const mailDetail = Object.assign(res.data.data, { id });
                        localStorage.setItem('leadsCloud-currentPersonId', res.data.data.createUserId);
                        localStorage.setItem('leadsCloud-currentAccount', JSON.stringify({
                            currentAccount: this.currentAccount,
                            currentInputInfo: this.currentInputInfo,
                            currentAccountIds: this.currentAccountIds
                        }));
                        const href = window.location.origin + window.location.pathname + this.$router.resolve({ name: 'mail_home' }).href;
                        localStorage.setItem('leadsCloud-timeLine-mailDetail', JSON.stringify(mailDetail));
                        window.open(href, '_blank');
                    } else {
                        this.$Message.error('跳转失败，请刷新后重试');
                    }
                }).catch(() => {
                    this.$Message.error('跳转失败，请刷新后重试');
                });
            },
            /* 当前用户是否拥有某些人员的管理权限的判断 */
            isHaveManageAuthority(userIds) {
                return new Promise((resolve) => {
                    util.ajaxJson({
                        url: '/new-privilege/manage/getusers',
                        method: 'get',
                        params: {
                            orgId: this.orgId,
                            userId: this.userId
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            // 该用户可管理的人员id集合
                            const arr1 = res.data.data;
                            // 询盘/线索负责人的id集合
                            const arr2 = userIds.map(Number);
                            // 如果有重复，则可打开
                            const flag = arr2.filter((x) => {
                                return arr1.includes(x);
                            });
                            resolve(flag.length);
                        }
                    }).catch(err => {
                        console.log(err);
                        resolve(0);
                    });
                });
            },
            /* 获取crm相关字段权限 */
            get_columns_authorized() {
                util.ajax({
                    url: '/crm/columnConfig/getFields',
                    method: 'get',
                    params: {
                        orgId: this.orgId,
                        userId: this.userId,
                        parentId: 0
                    }
                }).then(response => {
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
                }).catch(erro => {
                    this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                });
            },
            // 手动执行收发信规则 --- 校验是否有启用状态的手动执行规则
            handleenforceRules() {
                getIsEnable({
                    userId: this.userId
                }).then((res) => {
                    if (res.code === 1) {
                        this.sendReceiveRulesModel = true;
                    } else if (res.code === 2) {
                        // 没有启用手动执行的收发信规则，提示立即设置
                        const h = this.$createElement;
                        this.$Message({
                            dangerouslyUseHTMLString: true,
                            showClose: true,
                            type: 'success',
                            message: h('p', {
                                style: 'line-height: 24px;'
                            }, [
                                h('span', {
                                    style: `font-size: 14px;color: #67c23a;${this.lang !== 'zh-CN' ? 'display: inline-block;width:calc(100% - 100px);' : ''}`
                                }, this.$t('mail.mailDetail.notSetRules')),
                                h('i', {
                                    style: 'color:#2d63bc; right: 40px; position: absolute; font-size: 12px; cursor: pointer; line-height: 24px; font-style: normal;',
                                    on: {
                                        click: () => {
                                            // 打开邮箱设置 -- 收发信规则
                                            localStorage.setItem('updateAccountToQuickText', 'SendReceiveRules');
                                            window.open(this.$router.resolve('/systemSettings/mail_set').href, '_blank');
                                        }
                                    }
                                }, this.$t('mail.mailDetail.nowSet'))
                            ])
                        });
                    } else {
                        this.$Message.error('请求失败');
                    }
                }, () => {
                    this.$Message.error('请求失败');
                });
            },
            // 执行手动触发规则
            enforceRules() {
                if (this.enforceRulesLoading) { return; }
                this.enforceRulesLoading = true;
                let ids = [];
                if (this.selectMailIds.length) {
                    if (this.currentBox === 'search') {
                        ids = this.getSupportOperateIds([2, 3, 5]).ids;
                    } else {
                        ids = this.selectMailIds;
                    }
                } else {
                    this.$Message.warning(this.$t('mail.noMailSelectedTip'));
                }
                enforceRules({
                    orgId: this.orgId,
                    operateUserId: this.userId,
                    operateUserName: this.fullName,
                    mailIds: ids
                }).then((res) => {
                    this.enforceRulesLoading = false;
                    // 需要后台给出那种状态是“有”需要提示“执行完毕”
                    // 哪种是“没有”需要提示 “当前所选邮件没有符合条件的收发信规则”
                    if (res.code === 1) {
                        this.$Message.success(this.$t('mail.mailDetail.ruleExecuted'));
                        this.sendReceiveRulesModel = false;
                        // 刷新列表数据
                        this.mailTableData = this.getMailTableData();
                        this.emptySelection();
                    } else if (res.code === 0) {
                        this.sendReceiveRulesModel = false;
                        this.$Message.error(this.$t('mail.mailDetail.notRulesTip'));
                    } else {
                        this.$Message.error('请求失败');
                    }
                }, () => {
                    this.$Message.error('请求失败');
                });
            }
        }
    };
</script>

<style lang="less" scoped>
    .split-mail-table {
        width: 100%;
        .clearfloat {
            zoom: 1;
            &:after {
                display: block;
                clear: both;
                content: "";
                visibility: hidden;
                height: 0
            }
        }
        .split-search-header {
            display: flex;
            align-items: center;
            height: 40px;
            margin: 5px 21px 0;

            h3 {
                display: inline-block;
                margin-right: 8px;
                font-size: 16px;
                color: rgba(0, 0, 0, 0.80);
            }

            p {
                display: inline-block;
                font-size: 12px;
                color: rgba(0, 6, 15, 0.40);
            }

            .split-mail-filter-tags {
                flex: 1;
                padding: 0 10px;
            }
        }
        .operates {
            height: 40px;
            & > li {
                color: rgba(0, 0, 0, 0.60);
                margin-right: 22px;
                line-height: 34px;
                font-size: 18px;
                float: left;
                list-style: none;
                cursor: pointer;
            }
        }
        .el-checkbox {
            margin-right: 0;
        }
        .untreated-box-types {
            font-size: 14px;
            padding: 12px 20px;
            border-bottom: 1px solid #ECEEF5;
            /deep/ .el-tabs__header {
                margin: 0;
            }
            /deep/ .el-tabs__item {
                height: auto;
                font-size: 14px;
                color: rgba(0, 0, 0, 0.80);
                letter-spacing: 0;
                line-height: 22px;
                font-weight: 400;
            }
            /deep/ .el-tabs__nav-wrap:after {
                display: none;
            }
            /deep/ .el-tabs__active-bar {
                display: none;
            }
            /deep/ .el-tabs__item.is-active {
                font-weight: 600;
                color: #4285f4;
            }
            /deep/ .el-tabs__item:hover {
                color: #4285f4;
            }
        }
        .noDataTip {
            p {
                margin-top: 80px;
                text-align: center;
            }
        }
    }
    .no-selected-mail {
        text-align: center;
        p {
            font-size: 12px;
            color: rgb(0, 0, 0, .4);
            margin-top: 12px;
        }
    }
    .split-mail-row {
        border: 1px solid #ECEEF5;
        box-sizing: border-box;
        /deep/ .filter-panel {
            border-bottom: 1px solid #ECEEF5;
        }
        > .el-col {
            height: 100%;
            &:not(:first-child) {
                border-left: 1px solid #ECEEF5;
            }
        }
    }
    .split-mail-list {
        overflow-y: auto;
        overflow-y: overlay;
    }
    .split-mail-checkAll {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .split-mail-receive {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>

<style lang="less">
    .page-drop-menu {
        max-height: 374px;
        overflow-y: auto;
        padding: 6px 0;
        .el-dropdown-menu__item {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.80);
            letter-spacing: 0;
            line-height: 18px;
            font-weight: 400;
            padding: 6px 12px;
            &.active-drop-item {
                color: #4385F2;

                &:hover {
                    color: #4385F2;
                }
            }
            &:hover {
                background: #F4F7FA;
                color: rgba(0, 0, 0, 0.80);
            }
        }
    }
</style>
