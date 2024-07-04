<template>
    <div class="mail-table">
        <!-- 表格上方操作栏 -->
        <div class="header clearfloat">
            <!-- 筛选结果展示 -->
            <div v-if="currentBox === 'search'" class="search-header">
                <h3>搜索结果</h3>
                <HelpTip
                    style="margin-right: 8px"
                    :title="$t('helpTip.searchResult')"
                ></HelpTip>
                <p>
                    已搜索到{{ total }}封关键词为“<span :title="themeKey" class="keyword keyword-limit">{{ themeKey }}</span>”的邮件
                </p>
            </div>
            <!-- 收信按钮 -->
            <Tooltip v-else
                     v-show="currentPersonId === userId"
                     placement="top"
                     :content="$t('mail.receiveLetter')"
                     :style="{'margin-top': !selectMailList.length ? '-3px':'5px'}"
                     transfer>
                <Icon custom="custom custom-refresh"
                      @click.native="receiveMail"
                      :class="receiveMailFlag ? 'receive-load-loop' : ''"
                      class="split-mail-receive mail-receivingletter cursor-pointer margin-right-20"></Icon>
            </Tooltip>

            <!--默认显示的标记栏 【全部标为已读】【全部标为已完成】-->
            <ul v-show="currentPersonId === userId && !selectMailList.length" class="operates clearfloat" :style="{'margin-top': currentBox === 'search' ? '0':'-10px'}">
                <!-- 标记 -->
                <li v-if="!signFlag && !['dustbin', 'trash', 'draftBox'].includes(currentBox)">
                    <Dropdown trigger="click" @command="changeReadState">
                        <Tooltip placement="top" transfer :content="$t('mail.mark')">.
                            <Icon custom="custom custom-sign" size="16"/>
                        </Tooltip>
                        <DropdownMenu slot="dropdown">
                            <DropdownItem
                                v-if="currentBox !== 'draftBox'"
                                command="readAll">
                                {{ $t("mail.markReadAll") }}
                            </DropdownItem>
                            <DropdownItem
                                command="finishedAll"
                                class="piwik_mailTable_betchRemark_finishedAll">
                                {{ $t("mail.markAsFinishedAll") }}
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </li>
            </ul>

            <!-- 批量操作 -->
            <!--0-inbox(收件箱)、5-draftBox(草稿箱)、4-sentBox(已发箱)、3-dustbin(已删除箱)、2-trash(垃圾箱)）-->
            <ul v-show="selectMailList.length > 0" class="operates clearfloat">
                <!-- 标记 -->
                <li v-if="!signFlag && !['dustbin', 'trash', 'draftBox'].includes(currentBox)">
                    <Dropdown trigger="click" @command="changeReadState">
                        <Tooltip placement="top" transfer :content="$t('mail.mark')">
                            <Icon custom="custom custom-sign" size="16"/>
                        </Tooltip>
                        <DropdownMenu slot="dropdown">
                            <DropdownItem v-if="currentBox !== 'draftBox'" command="read">
                                {{ $t("mail.markRead") }}
                            </DropdownItem>
                            <DropdownItem v-if="currentBox !== 'draftBox'" command="unread">
                                {{$t("mail.markUnread")}}
                            </DropdownItem>
                            <DropdownItem
                                v-if="currentBox !== 'draftBox'"
                                command="readAll">
                                {{ $t("mail.markReadAll") }}
                            </DropdownItem>
                            <DropdownItem
                                v-if="!['dustbin', 'draftBox'].includes(currentBox)"
                                :divided="currentBox !== 'draftBox'"
                                command="star">
                                {{ $t("mail.flag_star_box") }}
                            </DropdownItem>
                            <DropdownItem
                                v-if="!['dustbin', 'draftBox'].includes(currentBox)"
                                command="unstar">
                                {{ $t("mail.cancel_flag_star_box") }}
                            </DropdownItem>
                            <DropdownItem
                                v-if="currentBox !== 'untreated'"
                                :divided="currentBox !== 'draftBox'"
                                command="changeUntreated"
                                class="piwik_mailTable_betchRemark_untreated">
                                {{ $t("mail.markAsUntreated") }}
                            </DropdownItem>
                            <DropdownItem
                                command="changeFinished"
                                :divided="currentBox === 'untreated'"
                                class="piwik_mailTable_betchRemark_finished">
                                {{ $t("mail.markAsFinished") }}
                            </DropdownItem>
                            <DropdownItem
                                command="finishedAll"
                                class="piwik_mailTable_betchRemark_finishedAll">
                                {{ $t("mail.markAsFinishedAll") }}
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </li>
                <!-- 移动到 -->
                <li v-if="!moveFlag && !['dustbin', 'trash'].includes(currentBox)">
                    <Dropdown trigger="click" ref="dropdown" @command="moveTo">
                        <Tooltip placement="top" transfer :content="$t('mail.moveTo')">
                            <Icon
                                custom="custom custom-move-mail"
                                size="16"
                                @click="mockcustomFolders"/>
                        </Tooltip>
                        <DropdownMenu
                            slot="dropdown"
                            class="move-to-folders"
                            style="max-height: 400px; overflow: auto"
                        >
                            <Tree
                                :data="customFolders"
                                :loading="customFolders && customFolders.length ? false : true"
                                draggable
                                :props="defaultProps"
                                :render-content="foldersRenderContent"
                                node-key="id"
                                :default-expanded-keys="expandedIdList"
                                @node-expand="tree_node_expand"
                                @node-collapse="tree_node_collapse"
                                >
                            </Tree>
                        </DropdownMenu>
                    </Dropdown>
                </li>
                <!-- 删除 -->
                <li v-if="orgId !== '10991'">
                    <Tooltip placement="top" transfer :content="$t('delete')">
                        <Icon
                            custom="custom custom-delete-mail"
                            size="16"
                            @click="handleDelete" />
                    </Tooltip>
                </li>
                <!-- 标签 -->
                <li v-if="!['dustbin', 'trash', 'draftBox'].includes(currentBox)">
                    <Dropdown trigger="click" @command="signLabel">
                        <Tooltip
                            placement="top"
                            transfer
                            :content="$t('crm.InqSet.inq_label')">
                            <Icon custom="custom custom-tag" size="16" @click="getTags"/>
                        </Tooltip>
                        <DropdownMenu
                            slot="dropdown"
                            style="max-height: 400px; overflow: auto">
                            <DropdownItem
                                v-for="(tag, index) in tagList"
                                :key="index"
                                :command="tag.id"
                                :style="`${tag.id === -1 ? 'text-align: center;' : ''}`"
                                class="mail-addtag">
                                <span
                                    v-if="tag.id !== -1"
                                    :style="`background-color: ${tag.labelColor};`"
                                    class="tag-color"
                                ></span>
                                <span :title="tag.labelName">{{ tag.labelName }}</span>
                            </DropdownItem>
                            <DropdownItem command="addtag" divided class="mail-addtag">
                                {{$t("mail.add_tags_mark")}}
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </li>
                <!-- 恢复 -->
                <li v-if="currentBox === 'dustbin'">
                    <Tooltip placement="top" transfer :content="$t('restore')">
                        <Icon size="16" custom="custom custom-restore" @click="restore"/>
                    </Tooltip>
                </li>
                <!-- 还原 -->
                <li v-if="currentBox === 'trash' || Boolean(Number(currentBox))">
                    <Tooltip
                        placement="top"
                        :content="$t('mail.moveRestore')"
                        transfer
                        :class="{'customfolder-moverestore-mail': Boolean(Number(currentBox))}">
                        <Icon
                            custom="custom custom-mail-restore"
                            size="16"
                            @click="moveRestore"/>
                    </Tooltip>
                </li>
                <!-- 内部转发 -->
                <li v-if="!['sentBox', 'dustbin', 'trash', 'draftBox'].includes(currentBox)">
                    <Tooltip placement="top" transfer content="内部转发">
                        <Icon
                            size="16"
                            custom="custom custom-inter-forwarding"
                            @click="toggleInterForwardingModal(true)"/>
                    </Tooltip>
                </li>
                <!-- 手动归档 CRM -->
                <li v-if="!['dustbin', 'trash', 'draftBox'].includes(currentBox)">
                    <Dropdown trigger="click" @command="archiveToCRM">
                        <!-- trigger -->
                        <Tooltip
                            placement="top"
                            :content="$t('mail.archiveToCRM')"
                            transfer>
                            <span>
                                <svg
                                    class="custom"
                                    aria-hidden="true"
                                    style="width: 16px; height: 16px">
                                    <use xlink:href="#custom-archiveToCrm"></use>
                                </svg>
                            </span>
                        </Tooltip>
                        <!-- 下拉 -->
                        <DropdownMenu
                            slot="dropdown"
                            style="max-height: 400px; overflow: auto">
                            <!-- 客户 -->
                            <DropdownItem :command="1">{{ $t("mail.customer") }}</DropdownItem>
                            <!-- 询盘 -->
                            <DropdownItem :command="3">{{ $t("mail.inquiry") }}</DropdownItem>
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

            <!-- 部门筛选 -->
            <div
                style="display: inline-block;"
                class="enterInfo"
                v-if="currentBox !== 'search'"
                v-show="!selectMailList.length">
                <DepartmentTree
                    ref="departmentTree"
                    :accountList="accountList"
                    @SelectedPerson="TabEmail"
                    @EmailFlag="refreshEmailList"
                    @closeOtherPoptip="closeOtherPoptip">
                </DepartmentTree>
            </div>

            <!-- 筛选标签 -->
            <FilterTags
                v-if="!selectMailList.length"
                style="top: 0; left: 8px"
                :order_column="sort"
                :order_type="sortType"
                :filterConObj.sync="config_tableFilter"
                :langObj="lang_mail"
                :storageName_orderColumn="sort"
                :width="filterComponentWidth"
                :removeWidth="1100"
                :minWidth="390"
                @change_filter_tag="change_filter_tag"
                @emptySort="empty_sort"
                @removeCon="remove_filter_tag">
            </FilterTags>

             <!-- 邮件搜索 -->
            <Search
                ref="search"
                style="float: right; margin-top: 2px"
                :parentValue="keyword"
                :holderText="$t('mail.themeKeyPlh')"
                :width="300"
                :delayTime="100"
                :btnClass="'mail-search'"
                :maxlength="30"
                @change-keyword="changeKeyword"
                @press-enter="search('0')">
                <template>
                    <ul class="ivu-select-dropdown-list" slot="searchDropdown">
                        <li @mousedown="search('1')" class="ivu-select-item">
                            包含<span class="keyword">[<span class="keyword-limit">{{ keyword }}</span>]</span>的收件人/发件人/主题
                        </li>
                        <li @mousedown="search('2')" class="ivu-select-item">
                            包含<span class="keyword">[<span class="keyword-limit">{{ keyword }}</span>]</span>的邮件正文
                        </li>
                        <li @mousedown="search('3')" class="ivu-select-item">
                            包含<span class="keyword">[<span class="keyword-limit">{{ keyword }}</span>]</span>的附件名称
                        </li>
                    </ul>
                </template>
            </Search>
        </div>
        <!-- 待处理邮箱的不同类别 分别为：全部、已建档用户、未建档用户-->
        <Tabs
            v-if="currentBox === 'untreated'"
            :value="currentUntreatedTab"
            @tab-click="changeUntreatedTab"
            class="untreated-box-types">
            <TabPane name="all" class="piwik_mailTable_untreated_all">
                <span slot="label">{{ $t("mail.accountPlh") }}</span>
            </TabPane>
            <TabPane name="customer" class="piwik_mailTable_untreated_customer">
                <span slot="label">
                    <span class="type-item-title">
                        {{$t("mail.untreatedCustomer")}}
                    </span>
                    <span class="type-item-count">
                        ({{`${untreatedCustomerCount}`}})
                    </span>
                </span>
            </TabPane>
            <TabPane name="undocumented" class="piwik_mailTable_untreated_undocumented">
                <span slot="label">
                    <span class="type-item-title">
                        {{$t("mail.untreatedDocumented")}}
                    </span>
                    <span class="type-item-count">
                        ({{ untreatedUndocumentedCount }})
                    </span>
                </span>
            </TabPane>
        </Tabs>
        <!-- 表格部分 -->
        <div :class="isFixed ? 'table-content table-content-small' : 'table-content'">
            <Table
                v-if="refreshColumnFlag"
                :height="tableHeight"
                :row-class-name="() => {return 'height-32';}"
                ref="expandtable"
                :isCustom="true"
                :customEmptyText="customEmptyTextLang"
                customEmptyButtonText=""
                :customClearMethod="clearFilterConditionByInitView"
                :data="table_list"
                :no-data-text="no_data_text"
                :default-expand-all="true"
                :border="true"
                :header-cell-class-name="headerCellClass"
                v-loading="loading"
                @row-click="handleRowClick"
                @expand-change="handleExpandChange"
                @mousemove.native="handleTableColHover"
                @mousedown.native="handleTableColResizeStart"
                @header-dragend="handleTableColResizeEnd"
                class="noborder-table resizable-table">
                <TableColumn
                    v-for="(item, index) in parentColumns"
                    :width="item.width"
                    :min-width="item.minWidth || 64"
                    :type="item.type"
                    :key="index"
                    :prop="item.key"
                    :label="item.label"
                    :render-header="item.renderHeader"
                    :show-overflow-tooltip="false"
                    :resizable="item.resizable !== false">
                    <template slot-scope="{ row }">
                        <div class="period" v-if="item.key === 'checkbox'">
                            <span>{{ row.title }}</span>
                            <span>
                                <Icon
                                    :class="row._expanded ? '' : 'period-expand'"
                                    type="md-arrow-dropup"/>
                            </span>
                        </div>
                        <template v-if="item.key === 'expandColumn' && row.data.length && row._expanded">
                            <TableTemplate
                                :tableData="row.data"
                                :columns="childColumns"
                                :ref="`table${row.desc}`"
                                :keyword="themeKey"
                                :desc="row.desc"
                                :checkAll="checkAll"
                                :indeterminate="indeterminate"
                                :currentBox="currentBox"
                                :visibleForwardSales.sync="visibleForwardSales"
                                :corp_columns_authorized="corp_columns_authorized"
                                :inquiry_columns_authorized="inquiry_columns_authorized"
                                :contact_columns_authorized="contact_columns_authorized"
                                @createClue="createClue"
                                @littleDrawerHidden="littleDrawerHidden"
                                @goMailDetail="goMailDetail"
                                @handle_select_mail="handle_select_mail"
                                @handleReply="handleReply"
                                @forward-mail="handleForward"
                                @sign-star="flag_star"
                                @deleteTag="mailDelLabel"
                                @refreshEmailList="refreshEmailList"
                                @changeProcessingState="changeProcessingState"
                                @updateMailsCrmStatus="getCompanyStatusByEmails">
                            </TableTemplate>
                        </template>
                    </template>
                </TableColumn>
                <TableColumn
                    fixed="right"
                    width="25"
                    align="center"
                    class-name="no-padding-cell"
                    :resizable="false">
                    <!-- 为了保证父级表格的列宽与子级表格的列宽一致，搜索列表时，此列不可直接隐藏。因此将设置图标隐藏，不提供操作即可 -->
                    <template
                        slot="header"
                        slot-scope="scope">
                        <i class="custom custom-table-edit-columns"
                            style="font-size: 18px"
                            @click="visible_edit_columns = true">
                        </i>
                    </template>
                </TableColumn>
            </Table>
            <footer :class="isFixed ? 'footer-small' : 'footer'">
                <Page
                    :total="total"
                    :current-page.sync="currentPageNum"
                    :page-size="pageSize"
                    :page-sizes="[15, 30, 45]"
                    class="pageWrap-right"
                    layout="total, prev, pager, next, sizes, jumper"
                    @current-change="pageChange"
                    @size-change="pageSizeChange"
                    transfer>
                </Page>
            </footer>
        </div>
        <!-- 修改字段 -->
        <EditColumns
            :visible.sync="visible_edit_columns"
            :columnType="columnType"
            :id.sync="id_column_show_order"
            :allColumns="editAllColumns"
            :allGroup="editAllColumnsGroup"
            :group.sync="group">
        </EditColumns>
        <!-- 删除二次确认框,只有垃圾箱、已删除箱才显示，其他箱体内容直接转移到已删除箱 -->
        <Modal
            :visible.sync="deleteModel"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            :title="$t('mail.deleteTitle')"
            :loading="true"
            :styles="{ top: '120px' }"
            :transition-names="['', '']">
            <p>{{ $t("mail.deleteContent") }}</p>
            <p v-if="isMergeredMailList.length">{{ $t("mail.deleteConfirmTip") }}</p>
            <div slot="footer">
                <Button @click="deleteModel = false">
                    {{$t("crm.UniSet.modal_cancel")}}
                </Button>
                <Button class="mail-delete-confirm" @click="foreverRemove" type="primary">
                    {{ $t("crm.UniSet.modal_ok") }}
                </Button>
            </div>
        </Modal>
        <!-- 新建标签 -->
        <Modal
            :visible.sync="tagModal"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            :title="$t('crm.UniSet.setting_label')"
            :mask-closable="false"
            width="520px"
            class="modal">
            <div class="layermain" style="margin: 10px 0 10px 10px">
                {{ $t("clue.add_clue") }}:
                <Input
                    v-model.trim="tagName"
                    style="width: 300px; margin-top: 2px"
                ></Input>
                <p style="text-align: center; color: red">
                    {{ $t("mail.lengthLimit") }}
                </p>
            </div>
            <div class="color">
                <ul>
                    <li v-for="(item, index) in colors"
                        :style="`background-color:${item.color}`"
                        @click="colorClick(index)"
                        :key="index">
                        <Icon type="android-done" v-if="item.show"></Icon>
                    </li>
                </ul>
            </div>
            <div slot="footer">
                <Button @click="tagModal = false">
                    {{$t("crm.UniSet.modal_cancel")}}
                </Button>
                <Button @click="saveTag" type="primary">
                    {{$t("crm.UniSet.modal_ok")}}
                </Button>
            </div>
        </Modal>

        <!-- 内部转发 -->
        <Modal
            :visible="visibleForwardSales"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            title="$t('mail.forwarding')"
            :mask-closable="false"
            :show-close="false"
            width="700px"
            @closed="handleCloseInterForwarding"
            class="modal inter-forwarding-modal"
        >
            <div class="inter-forwarding-container">
                <div>
                    <div>请选择转发给：</div>
                    <div class="inter-forwarding-sales-tree">
                        <div style="max-height: 350px; overflow: auto">
                            <Tree
                                v-show="visibleForwardSales"
                                :data="mailInterForwardingTreeData"
                                show-checkbox
                                multiple
                                default-expand-all
                                node-key="id"
                                :render-content="renderContent"
                                ref="update_tree"
                                style="margin-top: 15px"
                                @check-change="change_selected_userIds"
                            ></Tree>
                        </div>
                    </div>
                </div>
                <div class="inter-forwarding-remark">
                    <Input
                        v-model="mailInterForwardingInputContent"
                        placeholder="请填写转发备注信息"
                        type="textarea"
                        :maxlength="2000"
                        :show-word-limit="true"
                        :autosize="{ minRows: 2, maxRows: 5 }"
                    ></Input>
                </div>
                <div class="inter-forwarding-footer" slot="footer">
                    <Button @click="toggleInterForwardingModal(false)">
                        {{$t("crm.UniSet.modal_cancel")}}
                    </Button>
                    <Button @click="handleMailInterForwarding" type="primary">
                        {{$t("crm.UniSet.modal_ok")}}
                    </Button>
                </div>
            </div>
        </Modal>

        <!-- 邮件归档至 CRM -->
        <MailArchive
            :visible.sync="visibleArchive"
            :archiveObjectType="archiveObjectType"
            :mailList="selectMailList"
        ></MailArchive>
        <!-- 是否全部标记提示 -->
        <Modal
            top="40vh"
            :visible.sync="showControl"
            :modal-append-to-body="false"
            :title="$t('mail.markAllCompletedConfirmation')"
            width="520px"
            :close-on-click-modal="false">
            <div style="font-size:14px;color:#333;">
                {{$t('mail.sureMarkAllPendingMessagesCompleted')}}
            </div>
            <div slot="footer">
                <Button @click="showControl=false">
                    {{$t('cancel')}}
                </Button>
                <Button type="primary" @click="sureBtn">
                    {{$t('confirm')}}
                </Button>
            </div>
        </Modal>
        <!-- 右侧弹窗 -->
        <littleDrawer
            v-if="littleDrawerVisible"
            :visible.sync="littleDrawerVisible"
            :id="currentMailId"
            :currAccountInfo="currentMailInfo"
            :corp_columns_authorized="corp_columns_authorized"
            :inquiry_columns_authorized="inquiry_columns_authorized"
            :contact_columns_authorized="contact_columns_authorized"
            type="journeyDetail"
            from="mail"
            @littleDrawerHidden="littleDrawerHidden"
            @updateStatus="updateStatus"
            @updateInquiryStatus="updateInquiryStatus"
        ></littleDrawer>

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
    import util from '@/libs/util';
    import { mapState, mapGetters, mapActions } from 'vuex';
    import TableTemplate from './components/tableTemplate';
    import FilterTags from '@/views/main-components/filter-tags';
    import Search from '@/views/main-components/search-input/search-input';
    import DepartmentTree from './components/departmentTree';
    import MailArchive from '@/views/mail/mail-home/components/mail-table/components/Modal/MailArchive';
    import EditColumns from '@/views/crm/Table/Components/Modal/editColumns';
    import { getIsEnable, enforceRules } from '@/api/mail.js';
    import resetInitComponents from '@/mixins/resetComponentViewData';
    import mailTableColResize from '@/mixins/mailTableColResize';
    import littleDrawer from '@/views/main-components/little-drawer/little-drawer.vue';

    export default {
        name: 'MailTable',
        mixins: [resetInitComponents, mailTableColResize],
        components: {
            TableTemplate,
            FilterTags,
            Search,
            DepartmentTree,
            MailArchive,
            EditColumns,
            littleDrawer
        },
        props: {
            receiveMailFlag: {
                type: Boolean,
                default: false
            },
            currentBox: String,
            timerReceiveFlag: Boolean,
            table_height: {
                type: Number
            },
            checkBox: {
                type: Boolean,
                default: false
            },
            currentUntreatedTab: String // 待处理箱体目前选中的tab
        },
        computed: {
            ...mapState({
                orgId: (state) => state.enterpriseId,
                userId: (state) => state.userId,
                fullName: (state) => state.fullName,
                userName: (state) => state.userName,
                currentPage: (state) => state.mail.currentPage,
                window_height: (state) => state.window_height,
                ws_receive_mail: (state) => state.mail.ws_receive_mail,
                themeKey: (state) => state.mail.themeKey,
                searchType: (state) => state.mail.searchType,
                currentPersonId: (state) => state.mail.currentPersonId,
                currentAccount: (state) => state.mail.currentAccount,
                isFixed: (state) => state.isFixed,
                websocketMsgMail: state => state.mail.websocketMsgMail,
                lang: state => state.app.lang
            }),
            ...mapGetters([
                // 当前选中邮箱账号的"新收邮件"统计数据
                'currentAccountNewReceiveMailIdObj'
            ]),
            // 当前邮箱当前箱体"新收邮件统计数据"
            currentBoxNewReceiveMailIdArr() {
                return this.currentAccountNewReceiveMailIdObj[this.currentBox] || [];
            },
            page() {
                return this.currentPage - 1;
            },
            tableHeight() {
                if (this.currentBox === 'untreated') {
                    return this.window_height - 208;
                } else {
                    return this.window_height - 168;
                }
            },
            no_data_text() {
                if (this.currentBox === 'search') {
                    return '找不到与您的搜索匹配的邮件';
                } else {
                    return '暂无数据';
                }
            },
            editAllColumns() {
                const specialBoxList = ['draftBox'];
                let expectKeys = [];
                if (specialBoxList.includes(this.currentBox)) {
                    expectKeys = [
                        'expandColumn',
                        'checkbox',
                        'replyAndForward',
                        'untreatedAndStar'
                    ];
                } else if (this.currentPersonId !== this.userId || ['dustbin', 'trash'].includes(this.currentBox)) { // 查看下属、垃圾箱、删除箱,放开回复和转发
                    expectKeys = [
                        'expandColumn',
                        'checkbox',
                        'untreatedAndStar'
                    ];
                } else {
                    expectKeys = ['expandColumn', 'checkbox'];
                }
                return this.mailTableColumns.filter((item) => {
                    if (!expectKeys.includes(item.key)) {
                        return item;
                    }
                });
            },
            editAllColumnsGroup() {
                const temp = [];
                const specialBoxList = ['draftBox'];
                let expectKeys = [];
                if (specialBoxList.includes(this.currentBox)) {
                    expectKeys = [
                        'expandColumn',
                        'checkbox',
                        'replyAndForward',
                        'untreatedAndStar'
                    ];
                } else if (this.currentPersonId !== this.userId || ['dustbin', 'trash'].includes(this.currentBox)) { // 查看下属、垃圾箱、删除箱,放开回复和转发
                    expectKeys = [
                        'expandColumn',
                        'checkbox',
                        'untreatedAndStar'
                    ];
                } else {
                    expectKeys = ['expandColumn', 'checkbox'];
                }
                this.mailTableColumns.forEach((item) => {
                    if (!expectKeys.includes(item.key)) {
                        temp.push(item.key);
                    }
                });
                return temp;
            },
            columnType() {
                let columnType = '';
                if (this.currentBox.includes('tag_')) {
                    /* 邮件标签对应的箱体 */
                    columnType = 22;
                } else {
                    switch (this.currentBox) {
                        case 'inbox':
                            columnType = 15;
                            break;
                        case 'unreadBox':
                            columnType = 16;
                            break;
                        case 'star_box':
                            columnType = 17;
                            break;
                        case 'draftBox':
                            columnType = 18;
                            break;
                        case 'sentBox':
                            columnType = 19;
                            break;
                        case 'dustbin':
                            columnType = 20;
                            break;
                        case 'trash':
                            columnType = 21;
                            break;
                        case 'search':
                            columnType = undefined;
                            break;
                        case 'untreated':
                            columnType = 25;
                            break;
                        default:
                            columnType = 23; // 自定义文件夹对应的箱体
                    }
                }
                return columnType;
            },
            // 选中邮件 id 列表
            selectMailIds() {
                return this.selectMailList.map(item => item.id);
            },
            // 选中邮件箱类型列表
            selectMailBoxTypeIds() {
                return this.selectMailList.map(item => item.mailBoxTypeId);
            }
        },
        watch: {
            // 监听当前邮箱当前箱体"新收邮件统计数据"变化, 当有新变化时, 如果当前处于表格第一页, 则刷新表格数据
            currentBoxNewReceiveMailIdArr: {
                handler(val, oldVal) {
                    if (val.find(id => !oldVal.includes(id))) {
                        // 如果当前账号新收邮件 id 数组中有新值
                        // (如果箱体发生变化, mail-home.vue 会调用 removeBox 清空该箱体, 所以不用担心箱体变化影响此处监听)
                        if (this.page === 0) {
                            // 如果当前处于第一页
                            if (this.selectMailIds.length || this.$el.querySelector('.mail-table-template__operating')) {
                                // 如果用户当前正在操作(有表格行被选中, 或表格行操作弹框已打开), 退出流程, 不刷新页面
                                return;
                            }
                            // 刷新页面
                            // this.refreshEmailList(null, true);
                            this.refreshEmailList();
                        }
                    }
                }
            },
            // 监听 page 变化, 从第一页切换出去时, 清空当前邮箱当前箱体"新收邮件统计数据"
            page: {
                handler(val, oldVal) {
                    if (oldVal === 0) {
                        // 表格从第一页切换到其他页时
                        // 更新"新收邮件未读数统计数据", 从中剔除掉当前箱体
                        this.$store.commit('updateNewReceiveMails', {
                            type: 'removeBox',
                            data: this.currentBox
                        });
                    }
                }
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
                    this.table_list.forEach((item) => {
                        if (Array.isArray(item.data) && item.data.length) {
                            item.data.forEach((subItem) => {
                                if (subItem.id === val.mailId) {
                                    // subItem.successFlag = String(val.messageCode);
                                    this.$set(subItem, 'successFlag', String(val.messageCode));
                                    if (val.mailSendErrorMsg && val.messageCode === 0) {
                                        // subItem.mailSendErrorMsg = val.mailSendErrorMsg;
                                        this.$set(subItem, 'mailSendErrorMsg', val.mailSendErrorMsg);
                                    }
                                }
                                return subItem;
                            });
                            return item;
                        }
                    });
                }
            },
            group: {
                handler(val) {
                    this.changeGroups(val);
                },
                immediate: true
            },
            currentUntreatedTab: {
                handler(val) {
                    const avatarList = [
                        { value: 0, label: this.$t('mail.undocumented') },
                        { value: 1, label: this.$t('mail.public_customers') },
                        { value: 2, label: this.$t('mail.my_customers') },
                        { value: 3, label: this.$t('mail.other_customers') },
                        { value: 4, label: this.$t('mail.public_leads') },
                        { value: 5, label: this.$t('mail.my_leads') },
                        { value: 6, label: this.$t('mail.other_leads') }
                    ];
                    let temp = [];
                    switch (val) {
                        case 'customer':
                            temp = avatarList.filter((item) => item.value !== 0);
                            break;
                        case 'undocumented':
                            temp = avatarList.filter((item) => item.value === 0);
                            break;
                        case 'all':
                        default:
                            temp = avatarList;
                    }
                    this.config_tableFilter = {
                        avatar: {
                            sort: false,
                            filter: true,
                            filterType: 'select',
                            query: '',
                            allList: temp
                        },
                        subject: {
                            sort: true, // 是否允许排序
                            filter: true, // 是否允许筛选
                            filterType: 'string', // 筛选类型,              string / date / select / countryArea
                            query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                            allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
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
                            query: [Date.now() - 3600 * 1000 * 24 * 30, Date.now()],
                            allList: null
                        },
                        // 新增"邮件状态筛选", 不在表格中显示, 只做筛选用
                        mailStatusFilter: {
                            sort: false,
                            filter: true,
                            filterType: 'select',
                            query: '',
                            allList: [
                                { value: 1, label: '未回复' },
                                { value: 2, label: '已回复' },
                                { value: 3, label: '发送失败' },
                                { value: 4, label: '邮件已打开' }
                            ]
                        }
                    };
                    this.$store.commit('setCurrentPage', 1);
                    this.mailTableData = this.mockmailTableData(this.currentPersonId);
                }
            },
            currentSelectMailStatus: {
                handler(val) {
                    if (val) {
                        this.pageChange(1);
                    }
                }
            }
        },
        data() {
            return {
                showControl: false, // 控制显示全部完成弹窗的阈值
                loading: true,
                accountList: [
                    {
                        id: '',
                        account: this.$t('mail.accountPlh')
                    }
                ],
                mailBoxType: '',
                customFolders: [], // 自定义文件夹列表
                keyword: this.$store.state.mail.themeKey, // 关键词
                pageSize: null,
                replyFlag: false, // 是否禁用回复
                forwardFlag: false, // 是否禁用转发
                mergeFlag: false, // 是否禁用归并
                signFlag: false, // 是否禁用标记
                /** 是否禁用移动到文件夹功能 */
                moveFlag: false,
                // 表格
                mailTableData: [],
                allTableData: [],
                expandColumns: [
                    {
                        type: '',
                        key: 'expandColumn',
                        width: 1,
                        minWidth: 1,
                        resizable: false
                    },
                    {
                        title: this.$t('mail.customerAvatar'),
                        label: this.$t('mail.customerAvatar'),
                        key: 'avatar',
                        width: 135,
                        minWidth: 135,
                        renderHeader: (h) => {
                            return h('div', [
                                h('Icon', {
                                    props: {
                                        custom: 'custom custom-crm-customer'
                                    }
                                })
                            ]);
                        }
                    },
                    {
                        title: '邮件标识',
                        label: '',
                        key: 'marks',
                        width: 50,
                        minWidth: 50,
                        resizable: false
                    },
                    {
                        title: this.$t('mail.writeLetter.subject'),
                        label: this.$t('mail.writeLetter.subject'),
                        key: 'subject',
                        width: undefined,
                        minWidth: 240
                    },
                    {
                        title: this.$t('mail.writeLetter.recipients'),
                        label: this.$t('mail.writeLetter.recipients'),
                        key: 'recipient',
                        width: 120,
                        minWidth: 120
                    },
                    {
                        title: this.$t('mail.writeLetter.sender'),
                        label: this.$t('mail.writeLetter.sender'),
                        key: 'sender',
                        width: 90,
                        minWidth: 90
                    },
                    {
                        title: this.$t('mail.time'),
                        label: this.$t('mail.time'),
                        key: 'date',
                        width: 90,
                        minWidth: 90,
                        sortable: 'custom'
                    },
                    {
                        title: '回复和转发操作',
                        key: 'replyAndForward',
                        label: '',
                        width: 30,
                        minWidth: 30,
                        resizable: false
                    },
                    {
                        title: '星标与处理状态',
                        key: 'untreatedAndStar',
                        label: '',
                        width: 60,
                        minWidth: 60,
                        resizable: false
                    },
                    {
                        title: '编辑图标',
                        key: 'editColumns',
                        label: '',
                        width: 25,
                        minWidth: 25,
                        resizable: false
                    }
                ],
                mailTableColumns: [
                    {
                        type: 'expand',
                        key: 'expandColumn',
                        width: 1,
                        minWidth: 1,
                        resizable: false
                    },
                    {
                        title: '',
                        key: 'checkbox',
                        width: 45,
                        minWidth: 35,
                        resizable: false,
                        renderHeader: (h, { column, index }) => {
                            /* 由于之前的逻辑中currentPersonId存储的数据格式不一(存在string和number两种)，所以此处使用半等 */
                            if (this.currentPersonId == this.userId) {
                                const temp = [];
                                const expendMailBoxs = ['draftBox', 'trash'];
                                let currentFilterOption = {};
                                switch (this.mailBoxType) {
                                    case '0':
                                    case '4':
                                        currentFilterOption = this.mailStatusFilterOptions.find((item) => item.mailBoxType === this.mailBoxType);
                                        break;
                                    default:
                                        currentFilterOption = this.mailStatusFilterOptions.find((item) => item.mailBoxType === '-1');
                                        break;
                                }
                                if (currentFilterOption && currentFilterOption.filterOptions) {
                                    currentFilterOption.filterOptions.map((item) => {
                                        temp.push(h(
                                            'DropdownItem',
                                            {
                                                style: {
                                                    backgroundColor:
                                                        this.currentSelectMailStatus === item.value
                                                            ? '#fff3ec'
                                                            : '',
                                                    color:
                                                        this.currentSelectMailStatus === item.value
                                                            ? '#fb9b67'
                                                            : ''
                                                },
                                                props: {
                                                    command: item.value
                                                }
                                            },
                                            [
                                                h('Icon', {
                                                    style: {
                                                        display: this.currentSelectMailStatus
                                                            ? 'inline-block'
                                                            : 'none',
                                                        visibility:
                                                            this.currentSelectMailStatus === item.value
                                                                ? 'visible'
                                                                : 'hidden'
                                                    },
                                                    props: {
                                                        custom: 'custom custom-delivered-and-unreceived',
                                                        size: '12'
                                                    }
                                                }),
                                                h(
                                                    'span',
                                                    {
                                                        style: {
                                                            fontSize: '12px'
                                                        }
                                                    },
                                                    item.title
                                                )
                                            ]
                                        ));
                                    });
                                }
                                return h(
                                    'span',
                                    expendMailBoxs.includes(this.currentBox)
                                        ? {
                                            style: {
                                                marginLeft: '3px'
                                            }
                                        }
                                        : {
                                            style: {
                                                display: 'flex',
                                                justifyContent: 'left',
                                                alignItems: 'center'
                                            }
                                        },
                                    expendMailBoxs.includes(this.currentBox)
                                        ? [
                                            h('Checkbox', {
                                                props: {
                                                    indeterminate: this.indeterminate,
                                                    value: this.checkAll
                                                },
                                                nativeOn: {
                                                    click: (event) => {
                                                        /** 半选时点击全选，checkbox 仍是全选，看iview 发现checkbox.vue中改变currentValue的是input的点击事件checked的值
                                                         * 阻止浏览器默认事件 */
                                                        if (event) event.preventDefault();
                                                        this.handleCheckAll();
                                                    }
                                                }
                                            })
                                        ]
                                        : [
                                            h('Checkbox', {
                                                props: {
                                                    indeterminate: this.indeterminate,
                                                    value: this.checkAll
                                                },
                                                nativeOn: {
                                                    click: (event) => {
                                                        /** 半选时点击全选，checkbox 仍是全选，看iview 发现checkbox.vue中改变currentValue的是input的点击事件checked的值
                                                         * 阻止浏览器默认事件 */
                                                        if (event) event.preventDefault();
                                                        this.handleCheckAll();
                                                    }
                                                }
                                            }),
                                            h(
                                                'Dropdown',
                                                {
                                                    props: {
                                                        trigger: 'click',
                                                        placement: 'bottom-start'
                                                    },
                                                    on: {
                                                        command: (val) => {
                                                            this.currentSelectMailStatus = val;
                                                            const temp = this.config_tableFilter.mailStatusFilter.allList.filter((item) => item.value === val);
                                                            if (this.config_tableFilter.mailStatusFilter) {
                                                                this.$set(
                                                                    this.config_tableFilter.mailStatusFilter,
                                                                    'query',
                                                                    temp
                                                                );
                                                            }
                                                        }
                                                    }
                                                },
                                                [
                                                    h('Icon', {
                                                        style: {
                                                            opacity: 0.6,
                                                            marginLeft: '3px'
                                                        },
                                                        props: {
                                                            custom: 'custom custom-floating-window-arrow',
                                                            size: '12'
                                                        }
                                                    }),
                                                    h(
                                                        'DropdownMenu',
                                                        {
                                                            slot: 'dropdown'
                                                        },
                                                        temp
                                                    )
                                                ]
                                            )
                                        ]
                                );
                            }
                        }
                    },
                    {
                        title: this.$t('mail.customerAvatar'),
                        label: this.$t('mail.customerAvatar'),
                        key: 'avatar',
                        width: 135,
                        minWidth: 135,
                        renderHeader: (h) => {
                            return h('Icon', {
                                props: {
                                    custom: 'custom custom-crm-customer',
                                    size: '16'
                                }
                            });
                        }
                    },
                    {
                        title: '邮件标识',
                        label: '',
                        key: 'marks',
                        width: 50,
                        minWidth: 50,
                        resizable: false
                    },
                    {
                        title: this.$t('mail.writeLetter.subject'),
                        label: this.$t('mail.writeLetter.subject'),
                        key: 'subject',
                        width: undefined,
                        minWidth: 240
                    },
                    {
                        title: this.$t('mail.writeLetter.recipients'),
                        label: this.$t('mail.writeLetter.recipients'),
                        key: 'recipient',
                        width: 120,
                        minWidth: 120
                    },
                    {
                        title: this.$t('mail.writeLetter.sender'),
                        label: this.$t('mail.writeLetter.sender'),
                        key: 'sender',
                        width: 90,
                        minWidth: 90
                    },
                    {
                        title: this.$t('mail.time'),
                        label: this.$t('mail.time'),
                        key: 'date',
                        width: 90,
                        minWidth: 90
                    },
                    {
                        title: '回复和转发操作',
                        key: 'replyAndForward',
                        label: '',
                        width: 30,
                        minWidth: 30,
                        resizable: false
                    },
                    {
                        title: '星标与处理状态',
                        key: 'untreatedAndStar',
                        label: '',
                        width: 60,
                        minWidth: 60,
                        resizable: false
                    }
                ],
                mailStatusFilterOptions: [
                    {
                        mailBoxType: '0',
                        mailBoxName: 'inbox',
                        filterOptions: [
                            {
                                title: '未回复',
                                value: 1
                            },
                            {
                                title: '已回复',
                                value: 2
                            }
                        ]
                    },
                    {
                        mailBoxType: '4',
                        mailBoxName: 'sentBox',
                        filterOptions: [
                            {
                                title: '发送失败',
                                value: 3
                            },
                            {
                                title: '邮件已打开',
                                value: 4
                            }
                        ]
                    },
                    {
                        mailBoxType: '-1',
                        mailBoxName: 'others',
                        filterOptions: [
                            {
                                title: '未回复',
                                value: 1
                            },
                            {
                                title: '已回复',
                                value: 2
                            },
                            {
                                title: '发送失败',
                                value: 3
                            },
                            {
                                title: '邮件已打开',
                                value: 4
                            }
                        ]
                    }
                ],
                currentSelectMailStatus: '', // 当前选中的邮件状态
                config_tableFilter: {
                    avatar: {
                        sort: false,
                        filter: true,
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
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
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
                        query: [],
                        allList: null
                    },
                    // 新增"邮件状态筛选", 不在表格中显示, 只做筛选用
                    mailStatusFilter: {
                        sort: false,
                        filter: true,
                        filterType: 'select',
                        query: '',
                        allList: [
                            { value: 1, label: '未回复' },
                            { value: 2, label: '已回复' },
                            { value: 3, label: '发送失败' },
                            { value: 4, label: '邮件已打开' }
                        ]
                    }
                },
                indeterminate: false,
                checkAll: false,
                sortType: 'desc', // 排序方式
                sort: '',
                total: 0, // 邮件个数
                totalUnread: 0, // 未读邮件个数
                autoSelectMailOperate: false, // 自动选中邮件的操作
                selectMailList: [], // 选中邮件列表
                cusCardIndex: 0, // 当前名片索引
                currentRowRecievers: {}, // 当前行的所有收件人名片信息
                table_list: [
                    {
                        _expanded: true,
                        title: '今天',
                        data: [],
                        desc: 'today'
                    }
                ],
                selection_list: {},
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
                newCompanyShow: false,
                // crm 相关
                selectOptions: {},
                corp_columns_authorized: {},
                contact_columns_authorized: {},
                inquiry_columns_authorized: {},


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

                deleteModel: false,
                isMergeredMailList: [], // 被归并到客户箱的邮件列表
                emails: [], // 当前页面所有邮件地址列表
                crmEmails: [], // 当前页建档的邮箱列表

                currentPageNum: this.$store.state.mail.currentPage, // 当前页码
                filterComponentWidth: 220, // 筛选组件的宽度

                /* 调整显示字段顺序相关 */
                visible_edit_columns: false, // 是否显示列编辑弹窗
                group: [], // 编辑显示字段弹窗显示的字段集合
                id_column_show_order: undefined,
                // 保存到后端的字段属性, 目前只有 width
                fieldStyle: {},

                refreshColumnFlag: true,
                parentColumns: [], // 设置后的父级表格显示字段
                childColumns: [], // 设置后的子级表格显示字段
                untreatedCustomerCount: 0, // 待处理箱的建档客户邮件数
                untreatedUndocumentedCount: 0, // 待处理箱的未建档邮件数

                /* 内部转发相关 */
                visibleForwardSales: false, // 是否显示弹窗，选择邮件内部转发的销售人员
                init_tree: [], // 初始的企业部门树
                mailInterForwardingTreeData: [], // 经处理之后得到的最终企业部门树
                mailInterForwardingUsers: [], // 当前企业除离职外的所有用户
                interForwardingUsersSelected: [], // 被选中的用户集合
                mailInterForwardingInputContent: '', // 邮件内部转发的备注信息
                loading_tree: true, // 正在获取部门树

                /* 邮件归档至 CRM */
                // 归档弹框 visible
                visibleArchive: false,
                // 归档类型, 1 || 3 (customer || inquiry)
                archiveObjectType: 0,

                // 新增弹窗相关
                mailAddress: '', // 创建新客户的邮箱
                currentMailId: '',
                currentMailInfo: {},
                littleDrawerVisible: false,
                defaultProps: {
                    children: 'list'
                },
                expandedIdList: [],
                enforceRulesLoading: false, // 手动执行规则的确认按钮loading
                sendReceiveRulesModel: false // 手动执行规则确认弹窗状态
            };
        },
        created() {
            // 获取 下拉选项数据 子组件有用到 更新下
            this.$store.dispatch('getSelectOptions');
            // 获取crm 授权字段
            this.get_columns_authorized();
            if (Object.keys(this.$store.state.mail.config_tableFilter).length > 0) {
                this.config_tableFilter = {
                    ...this.$store.state.mail.config_tableFilter
                };
                this.sort = this.$store.state.mail.sort;
                this.sortType = this.$store.state.mail.sortType;
            }
            if (this.currentBox === 'search') {
                this.empty_query();
            }
            if (!this.currentPersonId) {
                this.$store.commit('set_currentPersonId', this.userId);
            }
            this.init();
            this.getFieldOrderList();
        },
        mounted() {
            this.$nextTick(() => {
                // 处理仪表盘带筛选条件跳转
                if (localStorage.getItem('dashboard_mail_filters')) {
                    // 提取筛选条件 Map 数组
                    const filterConsObj = this.$options.filters.parseObject(localStorage.getItem('dashboard_mail_filters'));
                    // 如果当前所在邮件箱体不是要跳转到的邮件箱体, 退出流程
                    if (filterConsObj.boxName !== this.currentBox) {
                        return;
                    }
                    localStorage.removeItem('dashboard_mail_filters');

                    // 顶部部门树选中用户
                    if (filterConsObj && filterConsObj.personId && String(filterConsObj.personId) !== String(this.userId)) {
                        this.$store.commit('set_currentPersonId', filterConsObj.personId);
                    }

                    // 回填筛选条件
                    if (filterConsObj && filterConsObj.filterCons) {
                        const filterCons = filterConsObj.filterCons;
                        filterCons.forEach((item) => {
                            if (this.config_tableFilter[item.key]) {
                                this.$set(this.config_tableFilter[item.key], 'query', item.val);
                            }
                            if (item.key === 'mailStatusFilter') {
                                this.currentSelectMailStatus =
                                    item.val.length && item.val[0] ? item.val[0].value : '';
                            }
                        });
                    } else {
                        // 参数错误
                        this.$Message.error(this.$t('crm.InqSet.error_params'));
                    }
                }

                // 以下代码是对无用代码，发到测试没有问题就可以直接删掉  2021.10.13 崔营营
                //                const tableNode = document.querySelector(".mail-table");
                //                const receiveBtnNode = document.querySelector(".receive-mail");
                //                this.screenWidth = tableNode.offsetWidth; // 窗口宽度
                // 定义窗口大小变更通知事件
                //                window.addEventListener("resize", this.onResizeFunc);
                //                if (receiveBtnNode) {
                //                    this.filterComponentWidth =
                //                        this.screenWidth - receiveBtnNode.offsetWidth - 570;
                //                }
                this.get_update_tree();
            });
        },
        beforeDestroy() {
            // 以下代码是对无用代码，发到测试没有问题就可以直接删掉  2021.10.13 崔营营
            // window.removeEventListener("resize", this.onResizeFunc);

            this.$store.commit('set_mail_config', { ...this.config_tableFilter });
            this.$store.commit('set_mail_sort', this.sort);
            this.$store.commit('set_mail_sortType', this.sortType);
        },
        methods: {
            ...mapActions(['getUnreadMail']),
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
            sureBtn() {
                // 弹窗消失
                this.showControl = false;
                // 全部标为已完成的方法
                this.changeFinishedAll();
            },
            /* 处理点击表格行的展开收起动作 */
            handleRowClick(e) {
                this.$refs.expandtable.toggleRowExpansion(e, !e._expanded);
            },
            handleExpandChange(e) {
                this.table_list.forEach((item) => {
                    if (item.title === e.title) {
                        item._expanded = !item._expanded;
                    }
                });
                if (e._expanded) {
                    this.$nextTick(() => {
                        const ref = this.$refs[`table${e.desc}`];
                        const temp = ref[0].$refs[`table${e.desc}`];
                        const tempArr = this.table_list.find((item) => item.desc === e.desc)
                            .data;
                        this.selectMailList.forEach((item) => {
                            if (tempArr.findIndex((subItem) => subItem.id === item.id) !== -1) {
                                this.autoSelectMailOperate = true;
                                temp.toggleRowSelection(item, true);
                            }
                        });
                    });
                }
            },
            /* 刷新邮件列表 */
            refreshEmailList(mailObject, retainSelectedMails) {
                console.log('refreshEmailList()', mailObject, retainSelectedMails);
                this.$store.commit('setCurrentPage', 1);
                this.$store.commit('set_currentPersonId', this.userId);
                this.init(retainSelectedMails);
                this.getDifferentToDoCount(this.currentPersonId);
            },
            /* 获取目前所在的邮件箱体以及PageSize */
            getPageSize(retainSelectedMails) {
                util
                    .ajaxJson({
                        url: '/crm/userconfig/get',
                        method: 'POST',
                        data: {
                            orgId: this.orgId,
                            userId: this.userId,
                            key: 'mailBox'
                        }
                    })
                    .then((res) => {
                        if (res.data.code === '1') {
                            if (res.data.data.value === null) {
                                this.pageSize = 15;
                                this.addPageSize();
                                this.$store.dispatch('getUnreadMail');
                                this.mailTableData = this.mockmailTableData(this.currentPersonId);
                            } else {
                                const size = parseInt(res.data.data.value);
                                this.pageSize = size;
                                this.$store.commit('setPageSize', size);
                                this.$store.dispatch('getUnreadMail');
                                this.mailTableData = this.mockmailTableData(this.currentPersonId);
                            }
                        } else {
                            this.pageSize = 15;
                            this.$store.dispatch('getUnreadMail');
                            this.mailTableData = this.mockmailTableData(this.currentPersonId);
                        }
                    })
                    .catch(() => {
                        this.pageSize = 15;
                        this.$store.dispatch('getUnreadMail');
                        this.mailTableData = this.mockmailTableData(this.currentPersonId);
                    });
            },
            /* 添加PageSize */
            addPageSize() {
                util
                    .ajaxJson({
                        url: '/crm/userconfig/add',
                        method: 'POST',
                        data: {
                            orgId: this.orgId,
                            userId: this.userId,
                            key: 'mailBox',
                            value: this.pageSize.toString()
                        }
                    })
                    .then((res) => {
                        this.mailTableData = this.mockmailTableData(this.currentPersonId);
                    });
            },
            // 切换邮箱
            TabEmail(user) {
                this.untreatedCustomerCount = 0;
                this.untreatedUndocumentedCount = 0;
                this.$store.commit('setCurrentPage', 1);
                this.$store.commit('set_currentPersonId', user[0].id);
                this.mailTableData = this.mockmailTableData(this.currentPersonId);
                this.$store.dispatch('getUnreadMail');
                this.getDifferentToDoCount(this.currentPersonId);
            },
            // 未处理箱顶部 tabs 选中
            changeUntreatedTab({ name }) {
                this.$emit('update:currentUntreatedTab', name);
            },

            /** 初始化页面 */
            init(retainSelectedMails) {
                this.getPageSize(retainSelectedMails);
                this.mockaccountList();

                if (this.currentBox && this.currentBox !== 'search') {
                    const expandTemp = [
                        'checkbox',
                        'marks',
                        'replyAndForward',
                        'untreatedAndStar'
                    ];
                    this.mailTableColumns = this.mailTableColumns.map((col, index) => {
                        col.show_filter_content = false;
                        col.filtering = false;
                        if (col.key && !expandTemp.includes(col.key)) {
                            col.renderHeader = this.renderHeader_filter(index);
                        }
                        return col;
                    });
                }
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
                        userId: this.currentPersonId,
                        orgId: this.orgId
                    };
                    util
                        .ajaxJson({
                            url: '/crm/mailbox/getInquiryAndCompanyInfoByEmails',
                            method: 'post',
                            data: postData
                        })
                        .then((response) => {
                            if (response.data.code === '1') {
                                const res = response.data.data;
                                this.crmEmails = [];
                                for (let i = 0; i < emailList.length; i++) {
                                    if (res[emailList[i]] && res[emailList[i]].success) {
                                        res[emailList[i]].email = emailList[i];
                                        this.crmEmails.push(res[emailList[i]]);
                                    }
                                }
                                this.mailTableData.map((item) => {
                                    let currentMail = {};
                                    if (item.fromOrToFlag) {
                                        const tempEmail = item.recipient[0];
                                        currentMail = this.crmEmails.find((subItem) =>
                                            subItem.email === this.getStandardEmail(tempEmail));
                                        if (currentMail && currentMail.type) {
                                            if (currentMail.type !== 0) {
                                                item.companyName = currentMail.companyName || '';
                                                item.contactsName =
                                                    currentMail.contactsName ||
                                                    handleMailAddress(tempEmail);
                                                item.shortName = currentMail.shortName || '';
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
                                        currentMail = this.crmEmails.find((subItem) =>
                                            subItem.email === this.getStandardEmail(tempEmail));
                                        if (currentMail && currentMail.type) {
                                            if (currentMail.type !== 0) {
                                                item.companyName = currentMail.companyName || '';
                                                item.contactsName =
                                                    currentMail.contactsName ||
                                                    handleMailAddress(tempEmail);
                                                item.shortName = currentMail.shortName || '';
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
                        })
                        .catch((err) => {
                            console.error(err);
                        });
                }

                function handleMailAddress(mailAdd) {
                    if (mailAdd) {
                        let startIndex = 0;
                        let endIndex = -1;
                        if (mailAdd.lastIndexOf('<') > 0) {
                            endIndex = mailAdd.lastIndexOf('<');
                        } else if (mailAdd.lastIndexOf('@') > 0) {
                            endIndex = mailAdd.lastIndexOf('@');
                        } else {
                            endIndex = mailAdd.length;
                        }
                        if (mailAdd.lastIndexOf('<') === 0) {
                            startIndex = 1;
                        }
                        mailAdd = mailAdd.slice(startIndex, endIndex);
                        return mailAdd;
                    } else {
                        return mailAdd;
                    }
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
                        createUserId: this.currentPersonId,
                        orgId: this.orgId
                    }
                }).then((res) => {
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
            /** 搜索关键词改变 */
            changeKeyword(keyword) {
                this.keyword = keyword.trim();
            },
            /** 表头渲染 */
            renderHeader_filter(colIndex) {
                const column = this.mailTableColumns[colIndex];
                return (h) => {
                    const sortIcons = h(
                        'span',
                        {
                            class: {
                                'ivu-table-sort': true
                            }
                        },
                        [
                            h('Icon', {
                                class: {
                                    on: this.sort === column.key && this.sortType === 'asc'
                                },
                                props: {
                                    type: 'md-arrow-dropup'
                                }
                            }),
                            h('Icon', {
                                class: {
                                    on: this.sort === column.key && this.sortType === 'desc'
                                },
                                props: {
                                    type: 'md-arrow-dropdown'
                                }
                            })
                        ]
                    );
                    return h(
                        'div',
                        {
                            style: {
                                position: 'relative'
                            }
                        },
                        [
                            column.key === 'avatar'
                                ? h('Icon', {
                                    props: {
                                        custom: 'custom custom-crm-customer',
                                        size: '16'
                                    }
                                })
                                : h('span', column.title),
                            this.sort === column.key && this.sortType ? sortIcons : undefined,
                            h('FilterBox', {
                                style: {
                                    left: column.key === 'avatar' ? '20px' : '50px',
                                    right: 'auto',
                                    top: 0
                                },
                                ref: `tableHeaderFilterBox${colIndex}`,
                                props: Object.assign(
                                    {
                                        showPopper: this.mailTableColumns[colIndex]
                                            .show_filter_content,
                                        columnCon: this.mailTableColumns[colIndex].key,
                                        order_column: column.key,
                                        columnKey: column.key,
                                        order_type: column.key,
                                        filtering: column.filtering
                                    },
                                    this.config_tableFilter[column.key]
                                ),
                                on: {
                                    'update:showPopper': (val) => {
                                        this.mailTableColumns = this.mailTableColumns.map((item, index) => {
                                            if (index === colIndex) {
                                                item.show_filter_content = val;
                                            } else if (val) {
                                                item.show_filter_content = false;
                                            }
                                            return item;
                                        });
                                        this.check_mail();
                                    },
                                    'update:query': (val) => {
                                        if (this.config_tableFilter[column.key]) {
                                            this.$set(
                                                this.config_tableFilter[column.key],
                                                'query',
                                                val
                                            );
                                        }
                                    },
                                    'update:order_type': (val) => {
                                        this.sortType = val;
                                    },
                                    'update:order_column': (val) => {
                                        this.sort = val;
                                    },
                                    updateList: () => {
                                        this.pageChange(1);
                                    },
                                    closeDepartmentTree: () => {
                                        if (
                                            this.$refs.departmentTree &&
                                            this.$refs.departmentTree.showDropdown
                                        ) {
                                            this.$refs.departmentTree.$refs.input.blur();
                                            this.$refs.departmentTree.showDropdown = false;
                                        }
                                        // console.log(this.$refs.departmentTree, this.$refs.departmentTree.showDropdown);
                                    }
                                }
                            })
                        ]
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

            /** 收信 调用父组件方法 */
            receiveMail() {
                this.$emit('receiveMail');
            },
            /** 获取邮箱账号列表 */
            mockaccountList() {
                this.accountList = [
                    {
                        id: '',
                        account: this.$t('mail.accountPlh')
                    }
                ];
                util
                    .ajaxMail({
                        url: `/mail/mailAccounts/user/${this.orgId}/${this.userId}`,
                        method: 'GET'
                    })
                    .then((response) => {
                        if (response.data.code === 1) {
                            for (const item of response.data.data) {
                                this.accountList.push({
                                    id: item.id,
                                    account: item.emailAddress
                                });
                            }
                        } else {
                            this.$Message.error('邮箱账号列表获取失败,请刷新后重试');
                        }
                    })
                    .catch(() => {
                        this.$Message.error('邮箱账号列表获取失败,请刷新后重试');
                    });
            },
            /** 获取自定义文件夹列表 */
            mockcustomFolders() {
                util
                    .ajaxMail({
                        url: `/mail/mailBoxTypes/${this.userId}`,
                        method: 'GET'
                    })
                    .then((response) => {
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
            /** 点击查询 */
            search(type) {
                if (!this.keyword) {
                    this.$Message.warning(this.$t('mail.themeKeyPlh'));
                    return;
                }
                this.$store.commit('setSearchType', type);
                this.$store.commit('setThemeKey', this.keyword);
                /* 判断当前在不在搜索页 */
                if (this.currentBox === 'search') {
                    this.pageChange(1);
                } else {
                    this.$store.commit('setCurrentPage', 1);
                    this.$store.commit('setPageSize', this.pageSize);
                    this.$emit('update:currentBox', 'search');
                }
            },
            /** 根据关键词查询搜索结果 */
            searchByKeywords() {
                // 清空自定义文件夹的选中状态
                this.$emit('clearcustomFoldersActive');

                const result = [];
                this.loading = true;
                let postData = {
                    orgId: this.orgId,
                    accountId:
                        this.currentAccount.join(',') === this.$t('mail.accountPlh')
                            ? []
                            : this.currentAccount,
                    userId: this.currentPersonId,
                    pageNumber: this.page,
                    PageSize: this.pageSize,
                    searchType: this.searchType,
                    searchContent: this.themeKey
                };
                const query = this.handleQuerys();
                console.log('搜索时的参数', query);
                postData = Object.assign(postData, query);
                util
                    .ajax({
                        url: '/es/api/mail/search',
                        method: 'post',
                        data: postData
                    })
                    .then(({ data }) => {
                        this.currentPageNum = this.$store.state.mail.currentPage;
                        this.total = data.totalElements;
                        const ids = Array.isArray(data.list)
                            ? data.list.map((item) => item.id)
                            : [];
                        if (ids.length > 0) {
                            this.getSearchDetails(ids);
                        } else {
                            this.loading = false;
                            this.handle_search_data([], result);
                            this.mailTableData = result;
                        }
                    })
                    .catch((err) => {
                        this.loading = false;
                        this.handle_search_data([], result);
                        this.mailTableData = result;
                    });
            },
            /* 获取搜索页列表的邮件部分字段的信息，如已回复状态，追踪信息，主题等等，显示在列表页 */
            getSearchDetails(ids) {
                const result = [];
                util
                    .ajaxJson({
                        url: '/mail/getMailProperty',
                        method: 'post',
                        data: {
                            enterpriseId: this.orgId,
                            mailIds: ids
                        }
                    })
                    .then((res) => {
                        if (res.data.code === 1) {
                            if (res.data.data.length) {
                                this.handle_search_data([...res.data.data], result);
                                this.mailTableData = result;
                            }
                        } else {
                            this.loading = false;
                            this.handle_search_data([], result);
                            this.mailTableData = result;
                        }
                    })
                    .catch((err) => {
                        this.loading = false;
                        this.handle_search_data([], result);
                        this.mailTableData = result;
                    });
            },
            /** 获取并处理邮箱列表数据 */
            mockmailTableData(userPersonId, excludeIds) {
                console.log('mockmailTableData()------', userPersonId, excludeIds);
                if (this.currentBox === 'search') {
                    this.searchByKeywords();
                    return [];
                }
                this.loading = true;
                let crmFlags = [];
                switch (this.currentBox) {
                    case 'unreadBox':
                        this.mailBoxType = '0';
                        this.moveFlag = true;
                        break;
                    case 'inbox':
                        this.mailBoxType = '0';
                        break;
                    case 'draftBox':
                        this.mailBoxType = '5';
                        this.moveFlag = true;
                        this.mergeFlag = true;
                        this.replyFlag = true;
                        this.forwardFlag = true;
                        break;
                    case 'sentBox':
                        this.mailBoxType = '4';
                        break;
                    case 'dustbin':
                        this.mailBoxType = '3';
                        this.replyFlag = true;
                        break;
                    case 'trash':
                        this.mailBoxType = '2';
                        break;
                    default:
                        this.mailBoxType = this.currentBox;
                        break;
                }
                switch (this.currentUntreatedTab) {
                    case 'all':
                        crmFlags = [];
                        break;
                    case 'customer':
                        crmFlags = [1, 2, 3, 4, 5, 6];
                        break;
                    case 'undocumented':
                        crmFlags = [0];
                        break;
                }
                let postData = {
                    enterpriseId: this.orgId,
                    createUserId: userPersonId,
                    accountId: '',
                    accountIds:
                        this.currentAccount[0] === this.$t('mail.accountPlh')
                            ? []
                            : this.currentAccount,
                    mailBoxTypeId: this.mailBoxType,
                    page: this.page,
                    size: this.pageSize,
                    mailToDoFlag: this.currentBox === 'untreated' ? 1 : '',
                    mailCrmFlags: this.currentBox === 'untreated' ? crmFlags : [],
                    recieverCrmFlags: this.currentBox === 'untreated' ? crmFlags : [],
                    excludeIds: excludeIds || []
                };
                const query = this.handleQuerys();
                postData = Object.assign(postData, query);
                if (query.mailCrmFlags && !query.mailCrmFlags.length && crmFlags.length) {
                    postData.mailCrmFlags = crmFlags;
                    postData.recieverCrmFlags = crmFlags;
                }
                /* 按标签查询 this.mailBoxType 是 'tag_2'的形式 */
                if (this.mailBoxType.indexOf('tag_') !== -1) {
                    postData = Object.assign(
                        {
                            mailLabelId: this.mailBoxType.split('_')[1]
                        },
                        postData
                    );
                }
                const data = [];
                if (this.currentBox === 'unreadBox') {
                    postData.mailReadFlag = '0';
                }
                if (this.currentBox === 'star_box') {
                    postData.mailStarFlag = '1';
                }
                this.$store.commit('set_mail_detail_params', postData);
                util
                    .ajaxMailJson({
                        url: '/mail/mailBoxsAndLabel',
                        method: 'POST',
                        data: postData
                    })
                    .then((response) => {
                        this.loading = false;
                        if (response.data.code === 1) {
                            this.currentPageNum = this.$store.state.mail.currentPage;
                            this.total = response.data.data.totalElements;
                            if (this.currentBox === 'unreadBox') {
                                this.totalUnread = response.data.data.totalElements;
                            } else if (this.currentBox === 'untreated') {
                                this.getDifferentToDoCount(this.currentPersonId);
                            }
                            if (!response.data.data.content.length && this.currentPage > 1) {
                                this.$store.commit('setCurrentPage', this.currentPage - 1);
                                this.mailTableData = this.mockmailTableData(this.currentPersonId);
                            }
                            this.handle_table_data(response.data.data.content, data);

                            // 清空选中项
                            this.emptySelection();
                        } else {
                            this.$Message.error(this.$t('catch_message.error'));
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        this.loading = false;
                        this.$Message.error(this.$t('catch_message.error'));
                    });
                return data;
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
                                    mailCrmFlags: this.config_tableFilter[key].query.map((item) => {
                                        return item.value;
                                    }),
                                    recieverCrmFlags: this.config_tableFilter[key].query.map((item) => {
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
                                if (this.currentBox !== 'search') {
                                    result = Object.assign(result, {
                                        sendStartDate: this.config_tableFilter[key].query[0]
                                            ? this.dateFormat(
                                                'yyyy-MM-dd',
                                                this.config_tableFilter[key].query[0]
                                            )
                                            : '',
                                        sendEndDate: this.config_tableFilter[key].query[1]
                                            ? this.dateFormat(
                                                'yyyy-MM-dd',
                                                this.config_tableFilter[key].query[1]
                                            )
                                            : ''
                                    });
                                }
                                break;
                            case 'mailStatusFilter':
                                // 邮件状态是否被选中, 传值为 0--未回复；1--已回复；2--发送失败；3--邮件被打开
                                queryValue = this.config_tableFilter[key].query.map((item) => {
                                    return item.value;
                                })[0];
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
                                /* result = Object.assign(result, {
           mailStatusFilter: this.config_tableFilter[key].query.map(item => {
           return item.value;
           })[0]
           }); */
                                result = Object.assign(result, temp);
                                break;
                            default:
                                break;
                        }
                    }
                }
                switch (this.sort) {
                    case 'date':
                        Object.assign(result, {
                            sort: 'mail_send_date',
                            direction: this.sortType
                        });
                        break;
                    case 'subject':
                        Object.assign(result, {
                            sort: 'mail_subject',
                            direction: this.sortType
                        });
                        break;
                    case 'sender':
                        Object.assign(result, {
                            sort: 'mail_from',
                            direction: this.sortType
                        });
                        break;
                    case 'recipient':
                        Object.assign(result, {
                            sort: 'mail_to',
                            direction: this.sortType
                        });
                        break;
                    default:
                        break;
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
                        case 'date':
                            temp.query = [];
                            break;
                    }
                    this.$set(this.config_tableFilter, key, temp);
                }
                /* 针对邮件状态筛选做处理，当移除该筛选项时，当前选中的邮件状态值清空 */
                if (key === 'mailStatusFilter') {
                    this.currentSelectMailStatus = '';
                }

                // 设置表格 filtering 为 false , 并从表头筛选条件对象中去掉对应筛选项
                const index = this.mailTableColumns.findIndex((item) => item.key === key);
                if (index !== -1) {
                    const col = this.mailTableColumns[index];
                    col.filtering = false;
                    this.$set(this.mailTableColumns, index, col);
                }
                // 刷新
                this.$store.commit('setCurrentPage', 1);
                this.mailTableData = this.mockmailTableData(this.currentPersonId);
            },
            // filterTags 组件内部修改筛选值后触发的方法, 由下方的 updateList 改造而成
            change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    const column = this.mailTableColumns.find((item) => item.key === key);
                    if (column) {
                        // 判断是否有值, 调整 sqlList
                        const con = key;
                        if (temp.query.length) {
                            const result = {};
                            switch (temp.filterType) {
                                case 'string':
                                    break;
                                case 'select':
                                    // 表头筛选中只能有单个选项值的(单选型字段 + 创建人这种表格才有的字段)属性, 筛选时使用 $eq 等于, 其他用 $regex 包含
                                    const type = '$regex';
                                    result.$or = temp.query.map((item) => {
                                        const temp = {};
                                        temp[con] = {};
                                        item.value === null
                                            ? (temp[con].$null = -1)
                                            : (temp[con][type] = item.value);
                                        return temp;
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
                                    } else {
                                        this.config_tableFilter[key].query = [];
                                    }
                                    break;
                            }
                            this.mailTableColumns = this.mailTableColumns.map((item) => {
                                if (item.key === key) {
                                    item.filtering = true;
                                }
                                return item;
                            });
                        } else {
                            this.mailTableColumns = this.mailTableColumns.map((item) => {
                                if (item.key === key) {
                                    item.filtering = false;
                                }
                                return item;
                            });
                        }
                        this.$store.commit('setCurrentPage', 1);
                        this.mailTableData = this.mockmailTableData(this.currentPersonId);
                    } else {
                        this.remove_filter_tag(key);
                    }
                } else {
                    this.remove_filter_tag(key);
                }
            },
            /** 删掉 sort tag */
            empty_sort() {
                // 清空
                this.sort = '';
                this.sortType = '';
                // 刷新
                this.$store.commit('setCurrentPage', 1);
                this.mailTableData = this.mockmailTableData(this.currentPersonId);
            },
            /* 初始化筛选配置 */
            empty_query() {
                this.config_tableFilter = {
                    avatar: {
                        sort: false,
                        filter: true,
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
                        allList: null // 所有可能的筛选条件, 对应上述类型: null / null / [] / null
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
                        query: [],
                        allList: null
                    },
                    // 新增"邮件状态筛选", 不在表格中显示, 只做筛选用
                    mailStatusFilter: {
                        sort: false,
                        filter: true,
                        filterType: 'select',
                        query: '',
                        allList: [
                            { value: 1, label: '未回复' },
                            { value: 2, label: '已回复' },
                            { value: 3, label: '发送失败' },
                            { value: 4, label: '邮件已打开' }
                        ]
                    }
                };
            },
            /* 邮件搜索数据处理 */
            handle_search_data(mailList, setData) {
                const todayArr = [];
                const yesterdayArr = [];
                const agoArr = [];
                mailList = mailList.map((item) => {
                    // // 收件人昵称中带有英文逗号的处理
                    // const recipientArr = item.mailTo.split(',');
                    // if (item.mailTo.indexOf('&#44;') !== -1) {
                    //     for (let i = 0; i < recipientArr.length; i++) {
                    //         if (recipientArr[i].indexOf('&#44;') !== -1) {
                    //             recipientArr[i] = recipientArr[i].replace(/&#44;/g, ',');
                    //         }
                    //     }
                    // }
                    const mailTo = this.getMailNickName(item.mailTo[0] === '[' && item.mailTo[item.mailTo.length - 1] === ']' ? JSON.parse(item.mailTo) : item.mailTo.split(','));
                    const mailSender = this.getMailNickName([item.mailFrom]);
                    const mailInfo = {
                        id: item.id,
                        mailBoxTypeId: item.mailBoxTypeId,
                        theme:
                            item.mailSubject === ''
                                ? this.$t('mail.writeLetter.noSubject')
                                : item.mailSubject,
                        handledtheme: this.$dym.highLightKeyWordsInArray(
                            item.mailSubject,
                            this.themeKey
                        ),
                        sender: item.mailFrom,
                        // sender: item.mailFrom.replace(/&#44;/g, ','), // 发件人带有英文逗号的处理
                        handledsender: this.$dym.highLightKeyWordsInArray(
                            mailSender,
                            this.themeKey
                        ),
                        recipient: item.mailTo[0] === '[' && item.mailTo[item.mailTo.length - 1] === ']' ? JSON.parse(item.mailTo) : item.mailTo.split(','),
                        // recipient: recipientArr,
                        handledrecipient: this.$dym.highLightKeyWordsInArray(
                            mailTo,
                            this.themeKey
                        ),
                        date: this.dateFormat('yyyy-MM-dd', item.mailSendDate),
                        wholeDate: this.dateFormat('yyyy-MM-dd hh:mm:ss', item.mailSendDate),
                        fromOrToFlag: item.fromOrToFlag, // 收信还是发信  1-发信
                        fav: item.mailReadFlag,
                        originalMailBoxTypeId: item.originalMailBoxTypeId, // 邮件原始来源邮箱
                        mailStarFlag: item.mailStarFlag, // 是否有星标
                        urgentFlag: item.mailUrgentFlag, // 紧急
                        mailTraceFlag: item.mailTraceFlag, // 追踪
                        attachmentFlag: item.mailAttachmentFlag, // 附件
                        mailCrmFlag: item.mailCrmFlag, // 发件人是否在crm系统中存在
                        clueFlag: `${item.mailMyclueFlag}`, // 发件人是否在线索中存在
                        recieverCrmFlag: item.recieverCrmFlag, // 收件人是否在crm系统中存在
                        recieverClueFlag: item.recieverMyclueFlag, // 收件人是否在crm系统中存在
                        receiptFlag: item.mailReceiptFlag, // 回执
                        successFlag: item.mailSuccessFlag, // 发送是否成功
                        mailGroupSendingSingleShowFlag: item.mailGroupSendingSingleShowFlag, // 群发单显
                        mailAnsweredFlag: item.mailAnsweredFlag, // 邮件是否被回复
                        mailDraftFlag: item.mailDraftFlag,
                        recentOpenIp: item.recentOpenIp, // 追踪气泡中最近打开位置IP
                        recentOpenPosition: item.recentOpenPosition, // 追踪气泡中最近打开位置
                        recentOpenTime: item.recentOpenTime
                            ? item.recentOpenTime.substr(0, 19)
                            : '', // 追踪气泡中最近打开时间
                        mailOpenTimes: item.mailOpenTimes, // 追踪气泡中打开次数
                        mailTimeFlag: item.mailTimeFlag, // 是否有定时邮件
                        createUserId: item.createUserId,
                        labelColor: item.labelColor ? item.labelColor.split(',') : [],
                        labelId: item.labelId ? item.labelId.split(',') : [],
                        labelName: item.labelName ? item.labelName.split(',') : [],
                        mailSendErrorMsg: item.mailSendErrorMsg, // 邮件发送失败原因
                        replyTo: item.replyTo && item.replyTo[0] === '[' && item.replyTo[item.replyTo.length - 1] === ']' ? JSON.parse(item.replyTo)[0] : (item.replyTo ? item.replyTo.split(',')[0] : ''), // 指定回复邮箱
                        mailResumes: item.mailResumes, // 邮件正文内容
                        mailToDoFlag: item.mailToDoFlag, // 邮件的处理状态  0--未设置  1--待处理  2--已完成
                        companyName: '', // 邮箱对应的公司名称
                        contactsName: '', // 邮箱对应的客户名称
                        mailInterForwardingFlag: item.mailInterForwardingFlag, // 邮件是否来自于内部转发 0---不是 1---是
                        mailForwardedInternallyFlag: item.mailForwardedInternallyFlag // 邮件是否已被内部转发 0---否  1---是
                    };
                    /* 此处注意：今天的邮件包含当天以及将来的邮件 */
                    setData.push(mailInfo);
                    const { day, month, year } = this.get_offset_day(item.mailSendDate);
                    if (year < 0) {
                        todayArr.push(mailInfo);
                    } else if (year > 0) {
                        agoArr.push(mailInfo);
                    } else if (year === 0) {
                        if (month < 0) {
                            todayArr.push(mailInfo);
                        } else if (month > 0) {
                            agoArr.push(mailInfo);
                        } else if (month === 0) {
                            if (day <= 0) {
                                todayArr.push(mailInfo);
                            } else if (day === 1) {
                                yesterdayArr.push(mailInfo);
                            } else if (day > 0) {
                                agoArr.push(mailInfo);
                            }
                        }
                    }
                    return mailInfo;
                });
                this.getCurrentPageEmails(mailList);
                this.getCompanyStatusByEmails();
                this.table_list = [];
                if (todayArr.length !== 0) {
                    this.table_list.push({
                        _expanded: true,
                        title: this.$t('crm.Table.today'),
                        data: todayArr,
                        desc: 'today'
                    });
                }
                if (yesterdayArr.length !== 0) {
                    this.table_list.push({
                        _expanded: true,
                        title: this.$t('crm.Table.yesterday'),
                        data: yesterdayArr,
                        desc: 'yesterday'
                    });
                }
                if (agoArr.length !== 0) {
                    this.table_list.push({
                        _expanded: true,
                        title: this.$t('crm.Html.earlier'),
                        data: agoArr,
                        desc: 'ago'
                    });
                }
                this.loading = false;
            },
            /* 获取用于区分邮件今天/昨天/更早的数据 */
            get_offset_day(date) {
                const now = new Date();
                const sendDate = new Date(date.replace(/-/g, '/').replace(/\.(.*?)$/g, ''));
                const day = now.getDate() - sendDate.getDate();
                const month = now.getMonth() - sendDate.getMonth();
                const year = now.getFullYear() - sendDate.getFullYear();
                // if (year >= 0 && month > 0) return false;
                return { day, month, year };
            },
            /* 获取当前页面所有的邮件地址 */
            getCurrentPageEmails(data) {
                this.emails = [];
                data.forEach((item) => {
                    if (item.fromOrToFlag && item.recipient[0]) {
                        this.emails.push(item.recipient[0]);
                    } else if (item.sender) {
                        this.emails.push(item.sender);
                    }
                });
                this.emails = this.emails.map((item) => {
                    return this.getStandardEmail(item);
                });
            },
            /** 获取邮件列表（0-unreadBox(未读箱)、0-inbox(收件箱)、5-draftBox(草稿箱)、4-sentBox(已发箱)、3-dustbin(已删除箱)、2-trash(垃圾箱)）、6-star_box（星邮件） */
            handle_table_data(mailList, setData) {
                const todayArr = [];
                const yesterdayArr = [];
                const agoArr = [];
                for (let i = 0; i < mailList.length; i++) {
                    const data = {
                        id: mailList[i].id,
                        theme:
                            mailList[i].mailSubject === ''
                                ? this.$t('mail.writeLetter.noSubject')
                                : mailList[i].mailSubject,
                        sender: mailList[i].mailFrom,
                        recipient: mailList[i].mailTo[0] === '[' && mailList[i].mailTo[mailList[i].mailTo.length - 1] === ']' ? JSON.parse(mailList[i].mailTo) : mailList[i].mailTo.split(','),
                        date: mailList[i].mailSendDate
                            ? this.dateFormat('yyyy-MM-dd', mailList[i].mailSendDate)
                            : '',
                        wholeDate: mailList[i].mailSendDate
                            ? this.dateFormat('yyyy-MM-dd hh:mm:ss', mailList[i].mailSendDate)
                            : '',
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
                        mailGroupSendingSingleShowFlag:
                            mailList[i].mailGroupSendingSingleShowFlag, // 群发单显
                        mailTraceFlag: mailList[i].mailTraceFlag, // 追踪
                        recentOpenIp: mailList[i].recentOpenIp, // 追踪气泡中最近打开位置IP
                        recentOpenPosition: mailList[i].recentOpenPosition, // 追踪气泡中最近打开位置
                        recentOpenTime: mailList[i].recentOpenTime
                            ? mailList[i].recentOpenTime.substr(0, 19)
                            : '', // 追踪气泡中最近打开时间
                        mailOpenTimes: mailList[i].mailOpenTimes, // 追踪气泡中打开次数
                        mailStarFlag: mailList[i].mailStarFlag, // 是否有星标
                        mailTimeFlag: mailList[i].mailTimeFlag, // 是否有定时邮件
                        mailBoxTypeId: mailList[i].mailBoxTypeId, // 邮件属于哪个箱
                        mailDraftFlag: mailList[i].mailDraftFlag, // 邮件是不是草稿
                        createUserId: mailList[i].createUserId,
                        labelColor: mailList[i].labelColor
                            ? mailList[i].labelColor.split(',')
                            : [],
                        labelId: mailList[i].labelId ? mailList[i].labelId.split(',') : [],
                        labelName: mailList[i].labelName
                            ? mailList[i].labelName.split(',')
                            : [],
                        mailAnsweredFlag: mailList[i].mailAnsweredFlag, // 邮件是否被回复
                        mailSendErrorMsg: mailList[i].mailSendErrorMsg, // 邮件发送失败原因
                        replyTo: mailList[i].replyTo && mailList[i].replyTo[0] === '[' && mailList[i].replyTo[mailList[i].replyTo.length - 1] === ']' ? JSON.parse(mailList[i].replyTo)[0] : (mailList[i].replyTo ? mailList[i].replyTo.split(',')[0] : ''), // 指定回复邮箱
                        mailResumes: mailList[i].mailResumes, // 邮件正文内容
                        mailToDoFlag: mailList[i].mailToDoFlag, // 邮件的处理状态 0--未设置  1--待处理  2--已完成
                        companyName: '', // 邮箱对应的公司名称
                        contactsName: '', // 邮箱对应的客户名称
                        shortName: '', // 公司简称
                        mailInterForwardingFlag: mailList[i].mailInterForwardingFlag, // 邮件是否来自于内部转发 0---不是 1---是
                        mailForwardedInternallyFlag: mailList[i].mailForwardedInternallyFlag // 邮件是否已被内部转发 0---否  1---是
                    };
                    setData.push(data);
                    /* 此处注意：今天的邮件包含当天以及将来的邮件 */
                    const { day, month, year } = this.get_offset_day(mailList[i].mailSendDate);
                    if (year < 0) {
                        todayArr.push(data);
                    } else if (year > 0) {
                        agoArr.push(data);
                    } else if (year === 0) {
                        if (month < 0) {
                            todayArr.push(data);
                        } else if (month > 0) {
                            agoArr.push(data);
                        } else if (month === 0) {
                            if (day <= 0) {
                                todayArr.push(data);
                            } else if (day === 1) {
                                yesterdayArr.push(data);
                            } else if (day > 0) {
                                agoArr.push(data);
                            }
                        }
                    }
                }
                this.getCurrentPageEmails(setData);
                this.getCompanyStatusByEmails();
                this.table_list = [];
                if (todayArr.length !== 0) {
                    this.table_list.push({
                        _expanded: true,
                        title: this.$t('crm.Table.today'),
                        data: todayArr,
                        desc: 'today'
                    });
                }
                if (yesterdayArr.length !== 0) {
                    this.table_list.push({
                        _expanded: true,
                        title: this.$t('crm.Table.yesterday'),
                        data: yesterdayArr,
                        desc: 'yesterday'
                    });
                }
                if (agoArr.length !== 0) {
                    this.table_list.push({
                        _expanded: true,
                        title: this.$t('crm.Html.earlier'),
                        data: agoArr,
                        desc: 'ago'
                    });
                }
            },
            /** 获取按今天昨天更早显示的 */
            getAllTableData() {
                this.allTableData = [];
                this.table_list.forEach((item) => {
                    if (item._expanded) {
                        this.allTableData = this.allTableData.concat(item.data);
                    }
                });
            },
            /** 跳转到邮件详情页 */
            goMailDetail(item) {
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
                console.log(event);
                if (event.target.nodeName === 'I') {
                    return;
                }
                if (selecter.type !== 'Range') {
                    this.$store.commit('setSelectedMailId', item.id);
                    this.$store.commit(
                        'setSelectMailBoxType',
                        this.getMailBox(item.mailBoxTypeId)
                    );
                    if (
                        this.currentBox === 'draftBox' ||
                        this.getMailBox(item.mailBoxTypeId) === 'draftBox'
                    ) {
                        if (this.currentPersonId === this.userId) {
                            // this.$store.commit('setMailEdit', true);
                            // this.$emit('handleView', 'WriteMail', item.id);
                            const obj = {};
                            obj.mailEdit = true;
                            obj.mailId = item.id;
                            obj.selectedMailBoxType = this.getMailBox(item.mailBoxTypeId);
                            localStorage.setItem(
                                'leadsCloud-writeMailData',
                                JSON.stringify(obj)
                            );
                            // 当前页面打开邮件页面
                            this.$emit('getModalWidth');
                            this.$emit('update:mailModelVisible', true);
                        }
                    } else {
                        this.$emit('handleView', 'MailDetail');
                    }
                }
            },
            /** 邮件是哪个箱 */
            getMailBox(boxId) {
                switch (boxId) {
                    case 0:
                        return 'inbox';
                    case 3:
                        return 'dustbin';
                    case 2:
                        return 'trash';
                    case 4:
                        return 'sentBox';
                    case 5:
                        return 'draftBox';
                    default:
                        return boxId;
                }
            },
            /** 回复邮件 */
            handleReply({ name, id }) {
                // this.$store.commit('setSelectedMailId', id);
                // this.$store.commit('setReplyMailType', name);
                // this.$store.commit('setMailEdit', true);
                // this.$emit('handleView', 'WriteMail');
                const obj = {};
                obj.mailEdit = true;
                obj.mailId = id;
                obj.replyType = name;
                localStorage.setItem('leadsCloud-writeMailData', JSON.stringify(obj));
                // 当前页面打开邮件页面
                this.$emit('getModalWidth');
                this.$emit('update:mailModelVisible', true);
            },
            /** 转发邮件 */
            handleForward(id) {
                // this.$store.commit('setSelectedMailId', id);
                // this.$store.commit('setReplyMailType', 'forward');
                // this.$store.commit('setMailEdit', true);
                // this.$emit('handleView', 'WriteMail');
                const obj = {};
                obj.mailEdit = true;
                obj.mailId = id;
                obj.replyType = 'forward';
                localStorage.setItem('leadsCloud-writeMailData', JSON.stringify(obj));
                // 当前页面打开邮件页面
                this.$emit('getModalWidth');
                this.$emit('update:mailModelVisible', true);
            },
            /* 获取当前可支持操作的邮件id集合 */
            getSupportOperateIds(types, arr = this.selectMailList) {
                const ids = [];
                const mailBoxTypeIds = [];
                for (let i = 0; i < arr.length; i++) {
                    const item = arr[i];
                    if (types.every((type) => type !== item.mailBoxTypeId)) {
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
                    case 'finishedAll':
                        // 全部标为已完成的方法
                        // this.changeFinishedAll();
                        // 弹窗提示
                        this.showControl = true;
                        break;
                }
            },
            /** 标记已读未读,如果是搜索页, 要将已删除/垃圾箱/草稿箱邮件排除 */
            readPart(flag) {
                let ids = [];
                if (this.currentPersonId === this.userId) {
                    if (this.selectMailList.length !== 0) {
                        if (this.currentBox === 'search') {
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
                        }).then((response) => {
                            if (response.data.code === 1) {
                                if (ids.length !== this.selectMailIds.length) {
                                    this.$Message.success('草稿箱/已删除/垃圾箱的邮件不支持标记已读未读操作！');
                                }
                                if (flag && this.currentBox === 'unreadBox') {
                                    if (ids.length === this.mailTableData.length) {
                                        this.$store.commit('setCurrentPage', this.currentPage - 1);
                                    }
                                }
                                this.emptySelection();
                                // 未读箱邮件标记为已读传递参数过滤数据
                                let excludeIds = [];
                                if (flag === 1 && this.currentBox === 'unreadBox') {
                                    excludeIds = ids;
                                }
                                this.mailTableData = this.mockmailTableData(
                                    this.currentPersonId,
                                    excludeIds
                                );
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
                        this.$Message.success('草稿箱/已删除/垃圾箱的邮件不支持标记已读未读操作！');
                        this.emptySelection();
                        this.mailTableData = this.mockmailTableData(this.currentPersonId);
                        this.$store.dispatch('getUnreadMail');
                    }
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
                }).then((response) => {
                    if (response.data.code === 1) {
                        this.emptySelection();
                        this.$store.dispatch('getUnreadMail');
                        this.loading = true;
                        setTimeout(() => {
                            this.mailTableData = this.mockmailTableData(this.currentPersonId);
                        }, 1000);
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
            /** 全部标记已完成 */
            changeFinishedAll() {
                const data = {
                    userId: this.userId,
                    orgId: this.orgId
                };
                util.ajaxMailJson({
                    url: 'mail//updateMailToDoFlagAll',
                    method: 'POST',
                    data
                }).then((response) => {
                    if (response.data.code === 1) {
                        this.emptySelection();
                        this.$store.dispatch('getUnreadMail');
                        this.loading = true;
                        setTimeout(() => {
                            this.mailTableData = this.mockmailTableData(this.currentPersonId);
                        }, 1000);
                        this.$Message.success(this.$t('mail.markAsFinishedAllSuccess'));
                    } else {
                        this.$Message.error(this.$t('mail.markAsFinishedAllError'));
                    }
                }).catch(() => {
                    this.$Message.error(this.$t('mail.markAsFinishedAllError'));
                });
            },
            /** 标记星标 ,如果是搜索页, 要将已删除/垃圾箱/草稿箱邮件排除 */
            flag_star(isFlag, arr = this.selectMailList) {
                // isFlag 1是标记 0是取消标记
                let ids = [];
                if (arr.length) {
                    if (this.currentBox === 'search') {
                        ids = this.getSupportOperateIds([2, 3, 5], arr).ids;
                    } else if (arr.length === 1) {
                        ids = arr.map((item) => item.id);
                    } else if (this.selectMailIds.length) {
                        ids = this.selectMailIds;
                    }
                } else {
                    this.$Message.info(this.$t('mail.please_flag_mail'));
                }
                if (ids.length) {
                    util
                        .ajaxMailJson({
                            url: '/mail/mailBoxs/starMailBox',
                            method: 'put',
                            data: {
                                ids: ids,
                                mailStarFlag: isFlag,
                                updateUserId: this.userId,
                                updateUserName: this.userName
                            }
                        })
                        .then(({ data }) => {
                            if (data.code !== 1) {
                                this.$Message.error(this.$t('mail.flag_star_error'));
                            }
                            if (ids.length !== arr.length) {
                                this.$Message.success('草稿箱/已删除/垃圾箱的邮件不支持星标操作！');
                            }
                            if (!isFlag && this.currentBox === 'star_box') {
                                if (ids.length === this.mailTableData.length) {
                                    this.$store.commit('setCurrentPage', this.currentPage - 1);
                                }
                            }
                            this.loading = true;
                            setTimeout(() => {
                                this.mailTableData = this.mockmailTableData(this.currentPersonId);
                            }, 1000);
                            this.emptySelection();
                        })
                        .catch(() => {
                            this.$Message.error(this.$t('mail.flag_star_error'));
                        });
                } else {
                    this.$Message.success('草稿箱/已删除/垃圾箱的邮件不支持星标操作！');
                    this.mailTableData = this.mockmailTableData(this.currentPersonId);
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
                    const tag = this.tagList.filter((item) => {
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
                    labelColor: this.colors.filter((item) => {
                        return item.show === true;
                    })[0].color,
                    labelName: this.tagName,
                    orgId: this.orgId
                };
                util
                    .ajaxMailJson({
                        url: 'mail/maillabel/add',
                        method: 'post',
                        data: jsonData
                    })
                    .then((res) => {
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
                    })
                    .catch(() => {
                        this.$Message.error('添加标签失败，请刷新后重试');
                    });
            },
            /** 移动到自定义文件夹,如果是搜索页, 要将已删除/垃圾箱/草稿箱邮件排除 */
            moveTo(name) {
                if (name === -1) {
                    return false;
                }
                if (this.selectMailList.length === 0) {
                    this.$Message.warning(this.$t('mail.noMailSelectedTip'));
                } else if (
                    this.currentBox === 'star_box' ||
                    this.currentBox === 'search' ||
                    this.currentBox === 'unreadBox' ||
                    this.currentBox === 'untreated' ||
                    this.currentBox.indexOf('tag') === 0
                ) {
                    this.starBoxMove(name);
                } else {
                    util
                        .ajaxMailJson({
                            url: '/mail/moveMailBoxTypeId',
                            method: 'PUT',
                            data: {
                                originalMailBoxTypeId: this.mailBoxType,
                                destinationMailBoxTypeId: name,
                                mailBoxIds: this.selectMailIds,
                                updateUserId: this.userId,
                                updateUserName: this.userName
                            }
                        })
                        .then((response) => {
                            if (response.data.code === 1) {
                                this.$Message.success(this.$t('mail.moveSuccTip'));
                                if (this.selectMailIds.length === this.mailTableData.length) {
                                    this.$store.commit('setCurrentPage', this.currentPage - 1);
                                }
                                // 移动到自定义文件夹过滤数据ids
                                const excludeIds = this.selectMailIds;
                                this.mailTableData = this.mockmailTableData(
                                    this.currentPersonId,
                                    excludeIds
                                );
                                // 清空数据
                                this.emptySelection();
                            } else {
                                this.$Message.error('移动到自定义文件夹失败，请刷新后重试');
                            }
                        })
                        .catch(() => {
                            this.$Message.error('移动到自定义文件夹失败，请刷新后重试');
                        });
                }
            },
            /** 星标箱移动到文件夹,如果是搜索页, 要将已删除/垃圾箱/草稿箱邮件排除 */
            starBoxMove(name) {
                const mailMap = {};
                let ids = [];
                let mailBoxTypeIds = [];
                if (this.currentBox === 'search') {
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
                    util
                        .ajaxMailJson({
                            url: '/mail/moveStarMailBox',
                            method: 'put',
                            data: {
                                destinationMailBoxTypeId: name,
                                mailMap,
                                updateUserId: this.userId,
                                updateUserName: this.userName
                            }
                        })
                        .then((res) => {
                            if (res.data.code === 1) {
                                if (ids.length !== this.selectMailIds.length) {
                                    this.$Message.success('草稿箱/已删除/垃圾箱的邮件不支持移动到自定义文件夹操作！');
                                }
                                this.mailTableData = this.mockmailTableData(this.currentPersonId);
                                // 清空
                                this.emptySelection();
                            } else {
                                this.$Message.error('移动到自定义文件夹失败，请刷新后重试');
                            }
                        })
                        .catch(() => {
                            this.$Message.error('移动到自定义文件夹失败，请刷新后重试');
                        });
                } else {
                    this.$Message.success('草稿箱/已删除/垃圾箱的邮件不支持移动到自定义文件夹操作！');
                    this.emptySelection();
                    this.mailTableData = this.mockmailTableData(this.currentPersonId);
                }
            },
            /* 删除，删除确认弹窗 */
            handleDelete() {
                if (this.selectMailList.length !== 0) {
                    console.log('this.currentBox', this.currentBox);
                    // 只有垃圾箱、已删除箱才显示二次确认框，其他箱体内容直接转移到已删除箱
                    if (this.currentBox === 'dustbin' || this.currentBox === 'trash') {
                        this.deleteModel = true;
                        this.getMergeredMailList();
                    } else {
                        console.log('普通邮件直接进入已删除');
                        this.remove();
                    }
                } else {
                    this.$Message.warning(this.$t('mail.noMailSelectedTip'));
                }
            },
            /* 查询当前邮件是否归并到客户箱 */
            getMergeredMailList() {
                if (this.currentBox === 'dustbin' || this.currentBox === 'trash') {
                    util
                        .ajaxMailParamsSerializer({
                            url: '/mail/isMergered',
                            method: 'GET',
                            params: {
                                mailBoxIds: this.selectMailIds
                            }
                        })
                        .then((response) => {
                            if (response.data.code === 1) {
                                this.isMergeredMailList = response.data.data;
                            } else {
                                this.isMergeredMailList = [];
                            }
                        })
                        .catch(() => {
                            this.isMergeredMailList = [];
                        });
                }
            },
            /**
             * 已删除箱、垃圾箱的邮件，永久删除
             * @author 崔营营
             * @date 2021/06/04
             **/
            foreverRemove() {
                util.ajaxMailJson({
                    url: '/mail/deleteMailBox',
                    method: 'PUT',
                    data: {
                        mailBoxIds: this.selectMailIds,
                        updateUserId: this.userId,
                        updateUserName: this.userName,
                        enterpriseId: this.orgId
                    }
                }).then((response) => {
                    if (response.data.code === 1) {
                        this.deleteModel = false;
                        util.ajaxMailJson({
                            url: '/es/api/mail/delete',
                            method: 'POST',
                            data: {
                                emailIds: this.selectMailIds
                            }
                        }).then(() => {
                            // empty
                        });
                        /* 如果该邮件被归并至客户箱，则在彻底删除后需要将客户箱对应的邮件取消归并，此操作后端完成，前端不做处理 */
                        this.$Message.success(this.$t('mail.deleteSuccTip'));
                        this.$store.dispatch('getUnreadMail');
                        /**
                         * @Description: bugID: 【ID1004297】
                         *              解决方案：删除成功后，判断被选中删除的邮件数量是否等于列表显示的邮件总数量，
                         *               若相等，则视为全部删除，页码数应减1；反之不变。
                         * @author 杨娣
                         * @date 2020/5/7
                         */
                        if (this.selectMailIds.length === this.mailTableData.length) {
                            this.$store.commit('setCurrentPage', this.currentPage - 1);
                        }
                        // 永久删除过滤数据 ids
                        const excludeIds = this.selectMailIds;
                        this.mailTableData = this.mockmailTableData(
                            this.currentPersonId,
                            excludeIds
                        );
                        // 清空
                        this.emptySelection();
                    } else {
                        this.$Message.error(this.$t('mail.deleteErrorTip'));
                    }
                }).catch(() => {
                    this.$Message.error(this.$t('mail.deleteErrorTip'));
                });
            },
            /** 从表格中删除一个或多个邮件
             * 1. 垃圾箱和已删除为彻底删除操作，其他箱体为移动到已删除箱体的操作
             * 2. 如果是客户箱的删除操作，则实质上是取消归并，并不影响邮件箱的邮件状态；
             * 3. 删除时查询该邮件是否已被归并至客户箱，若有则提示用户。
             * */
            /**
             * @Description: 增加一个接口，在垃圾箱彻底删除邮件时将邮件ID传给后台。
             * @author 杨娣
             * @date 2019/9/9
             */
            remove() {
                if (
                    this.currentBox === 'star_box' ||
                    this.currentBox === 'search' ||
                    this.currentBox === 'unreadBox' ||
                    this.currentBox === 'untreated' ||
                    this.currentBox.indexOf('tag') === 0
                ) {
                    this.moveToDustbin(this.selectMailBoxTypeIds, this.selectMailIds);
                } else {
                    util
                        .ajaxMailJson({
                            url: '/mail/moveMailBoxTypeId',
                            method: 'PUT',
                            data: {
                                originalMailBoxTypeId: this.mailBoxType,
                                destinationMailBoxTypeId: '3',
                                mailBoxIds: this.selectMailIds,
                                updateUserId: this.userId,
                                updateUserName: this.userName
                            }
                        })
                        .then((response) => {
                            if (response.data.code === 1) {
                                this.deleteModel = false;
                                this.$Message.success(this.$t('mail.deleteSuccTip'));
                                this.$store.dispatch('getUnreadMail');
                                /**
                                 * @Description: bugID: 【ID1004297】
                                 *              解决方案：删除成功后，判断被选中删除的邮件数量是否等于列表显示的邮件总数量，
                                 *               若相等，则视为全部删除，页码数应减1；反之不变。
                                 * @author 杨娣
                                 * @date 2020/5/7
                                 */
                                if (this.selectMailIds.length === this.mailTableData.length) {
                                    this.$store.commit('setCurrentPage', this.currentPage - 1);
                                }
                                // 删除至已删除箱过滤数据 ids
                                const excludeIds = this.selectMailIds;
                                this.mailTableData = this.mockmailTableData(
                                    this.currentPersonId,
                                    excludeIds
                                );
                                // 清空
                                this.emptySelection();
                            } else {
                                this.$Message.error(this.$t('mail.deleteErrorTip'));
                            }
                        })
                        .catch(() => {
                            this.$Message.error(this.$t('mail.deleteErrorTip'));
                        });
                }
            },
            /** 邮件移动到已删除, 如果是搜索页, 要将已删除/垃圾箱/草稿箱邮件排除 */
            moveToDustbin() {
                const mailMap = {};
                let ids = [];
                let mailBoxTypeIds = [];
                if (this.currentBox === 'search') {
                    const res = this.getSupportOperateIds([2, 3]);
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
                    util
                        .ajaxMailJson({
                            url: '/mail/moveStarMailBox',
                            method: 'put',
                            data: {
                                destinationMailBoxTypeId: '3',
                                mailMap,
                                updateUserId: this.userId,
                                updateUserName: this.userName
                            }
                        })
                        .then((res) => {
                            if (res.data.code === 1) {
                                this.deleteModel = false;
                                if (ids.length !== this.selectMailIds.length) {
                                    this.$Message.warning('已删除/垃圾箱的邮件不支持在此页面的删除操作！');
                                }
                                this.$Message.success(this.$t('mail.deleteSuccTip'));
                                /**
                                 * @Description: bugID: 【ID1004297】
                                 *              解决方案：删除成功后，判断被选中删除的邮件数量是否等于列表显示的邮件总数量，
                                 *               若相等，则视为全部删除，页码数应减1；反之不变。
                                 * @author 杨娣
                                 * @date 2020/5/7
                                 */
                                if (this.selectMailIds.length === this.mailTableData.length) {
                                    this.$store.commit('setCurrentPage', this.currentPage - 1);
                                }
                                this.$store.dispatch('getUnreadMail');
                                // 星标箱、未读箱、待处理移动至已删除箱过滤数据 ids
                                const excludeIds = this.selectMailIds;
                                this.mailTableData = this.mockmailTableData(
                                    this.currentPersonId,
                                    excludeIds
                                );
                                // 清空
                                this.emptySelection();
                            } else {
                                this.$Message.error(this.$t('mail.deleteErrorTip'));
                            }
                        })
                        .catch(() => {
                            this.$Message.error(this.$t('mail.deleteErrorTip'));
                        });
                } else {
                    this.deleteModel = false;
                    this.$Message.warning('已删除/垃圾箱的邮件不支持在此页面的删除操作！');
                    this.emptySelection();
                    this.$store.dispatch('getUnreadMail');
                    this.mailTableData = this.mockmailTableData(this.currentPersonId);
                }
            },
            /** 给选中项添加标签,如果是搜索页, 要将已删除/垃圾箱/草稿箱邮件排除 */
            mailAddLabel(tagId) {
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
                if (ids.length) {
                    util
                        .ajaxMailJson({
                            url: 'mail/maillabel/operateMailLabel',
                            method: 'post',
                            data: {
                                mailBoxIds: ids,
                                mailLabelId: tagId,
                                operateState: 1
                            }
                        })
                        .then(async (res) => {
                            if (res.data.code === 1) {
                                if (ids.length !== this.selectMailIds.length) {
                                    await this.$Message.success('草稿箱/已删除/垃圾箱的邮件不支持标记标签操作！');
                                }
                                this.mailTableData = this.mockmailTableData(this.currentPersonId);
                                this.emptySelection();
                                await this.$Message.success('成功设置邮件标签');
                            } else {
                                this.$Message.error('设置邮件标签失败，请刷新后重试');
                            }
                        })
                        .catch(() => {
                            this.$Message.error('设置邮件标签失败，请刷新后重试');
                        });
                } else {
                    this.$Message.success('草稿箱/已删除/垃圾箱的邮件不支持标记标签操作！');
                    this.mailTableData = this.mockmailTableData(this.currentPersonId);
                    this.emptySelection();
                }
            },
            /** 标记标签,如果是搜索页, 要将已删除/垃圾箱/草稿箱邮件排除 */
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
                    if (this.currentBox === 'search') {
                        ids = this.getSupportOperateIds([2, 3, 5]).ids;
                    } else {
                        ids = this.selectMailIds;
                    }
                } else {
                    this.$Message.warning(this.$t('mail.noMailSelectedTip'));
                }
                if (ids.length) {
                    util
                        .ajaxMailJson({
                            url: 'mail/maillabel/operateMailLabel',
                            method: 'post',
                            data: {
                                mailBoxIds: ids,
                                mailLabelId: tagId,
                                operateState: 1
                            }
                        })
                        .then(async (res) => {
                            if (res.data.code === 1) {
                                if (ids.length !== this.selectMailIds.length) {
                                    await this.$Message.warning('草稿箱/已删除/垃圾箱的邮件不支持标记标签操作！');
                                }
                                this.mailTableData = this.mockmailTableData(this.currentPersonId);
                                this.emptySelection();
                                await this.$Message.success('成功设置邮件标签');
                            } else {
                                this.$Message.error('设置邮件标签失败，请刷新后重试');
                            }
                        })
                        .catch(() => {
                            this.$Message.error('设置邮件标签失败，请刷新后重试');
                        });
                } else {
                    this.$Message.success('草稿箱/已删除/垃圾箱的邮件不支持标记标签操作！');
                    this.mailTableData = this.mockmailTableData(this.currentPersonId);
                    this.emptySelection();
                }
            },
            /** 从已删除箱恢复邮件 */
            restore() {
                const selectedList = [...this.selectMailList];
                const paramsList = [];
                for (let m = 0; m < selectedList.length; m++) {
                    const obj = {};
                    obj.fromOrToFlag = selectedList[m].fromOrToFlag;
                    obj.mailBoxId = selectedList[m].id;
                    obj.mailBoxTypeId = selectedList[m].mailBoxTypeId;
                    obj.originalMailBoxTypeId = selectedList[m].originalMailBoxTypeId;
                    obj.mailDraftFlag = selectedList[m].mailDraftFlag;
                    paramsList.push(obj);
                }
                if (this.selectMailList.length !== 0) {
                    util
                        .ajaxJson({
                            url: '/mail/reductionMailBoxTypeId',
                            method: 'PUT',
                            data: {
                                updateUserId: this.userId,
                                updateUserName: this.userName,
                                mailBoxTypeConditionList: paramsList
                            }
                        })
                        .then((response) => {
                            if ([1, 2, 3, 4, 5, 6].includes(response.data.code)) {
                                if (response.data.code === 1) {
                                    this.$Message.success(this.$t('mail.restoreSuccTip'));
                                } else if (response.data.code === 2) {
                                    // 恢复邮件的原自定义文件夹已删除，恢复至收件箱
                                    this.$Message.success(this.$t('mail.restoringInboxTip'));
                                } else if (response.data.code === 3) {
                                    // 恢复邮件的原自定义文件夹已删除,恢复至发件箱
                                    this.$Message.success(this.$t('mail.restoringOutboxTip'));
                                } else if (response.data.code === 4) {
                                    // 批量恢复的邮件中包含已被删除的原自定义文件夹,恢复至收件箱
                                    this.$Message.success(this.$t('mail.bulkRestoringInboxTip'));
                                } else if (response.data.code === 5) {
                                    // 批量恢复的邮件中包含已被删除的原自定义文件夹,恢复至发件箱
                                    this.$Message.success(this.$t('mail.bulkRestoringOutboxTip'));
                                } else if (response.data.code === 6) {
                                    // 批量恢复的邮件中包含已被删除的原自定义文件夹,恢复至收件箱(发件箱)
                                    this.$Message.success(this.$t('mail.bulkRestoringOutboxInboxTip'));
                                }
                                // 通用刷新数据
                                this.$store.dispatch('getUnreadMail');
                                if (this.selectMailIds.length === this.mailTableData.length) {
                                    this.$store.commit('setCurrentPage', this.currentPage - 1);
                                }
                                // 恢复过滤数据 ids
                                const excludeIds = this.selectMailIds;
                                this.mailTableData = this.mockmailTableData(
                                    this.currentPersonId,
                                    excludeIds
                                );
                                // 清空
                                this.emptySelection();
                            } else {
                                this.$Message.error(this.$t('mail.restoreErrorTip'));
                            }
                        })
                        .catch(() => {
                            console.log();
                            this.$Message.error(this.$t('mail.restoreErrorTip'));
                        });
                } else {
                    this.$Message.warning(this.$t('mail.noMailSelectedTip'));
                }
            },
            /** 删除标签(arr,number) */
            mailDelLabel(mailId, tagId) {
                util
                    .ajaxMailJson({
                        url: 'mail/maillabel/operateMailLabel',
                        method: 'post',
                        data: {
                            mailBoxIds: [mailId],
                            mailLabelId: tagId,
                            operateState: 0
                        }
                    })
                    .then((res) => {
                        if (res.data.code === 1) {
                            setTimeout(() => {
                                this.mailTableData = this.mockmailTableData(this.currentPersonId);
                            }, 1000);
                        } else {
                            this.$Message.error(this.$t('mail.deleteErrorTip'));
                        }
                    })
                    .catch(() => {
                        this.$Message.error(this.$t('mail.deleteErrorTip'));
                    });
            },
            /** 自定义文件夹或者垃圾箱邮件还原 */
            moveRestore() {
                const selectedList = [...this.selectMailList];
                const paramsList = [];
                for (let m = 0; m < selectedList.length; m++) {
                    const obj = {};
                    obj.fromOrToFlag = selectedList[m].fromOrToFlag;
                    obj.mailBoxId = selectedList[m].id;
                    obj.mailBoxTypeId = selectedList[m].mailBoxTypeId;
                    obj.originalMailBoxTypeId = selectedList[m].originalMailBoxTypeId;
                    obj.mailDraftFlag = selectedList[m].mailDraftFlag;
                    paramsList.push(obj);
                }
                util
                    .ajaxMailJson({
                        url: 'mail/batchRecoverMailBoxTypeId',
                        method: 'PUT',
                        data: {
                            updateUserId: this.userId,
                            updateUserName: this.userName,
                            mailBoxTypeConditionList: paramsList
                        }
                    })
                    .then((res) => {
                        if (res.data.code === 1) {
                            this.$Message.success(this.$t('mail.moveRestoreSuccTip'));
                            if (paramsList.length === this.mailTableData.length) {
                                this.$store.commit('setCurrentPage', this.currentPage - 1);
                            }
                            // 还原过滤数据 ids
                            const excludeIds = this.selectMailIds;
                            this.mailTableData = this.mockmailTableData(
                                this.currentPersonId,
                                excludeIds
                            );
                            // 清空
                            this.emptySelection();
                        } else {
                            this.$Message.error(this.$t('mail.moveRestoreErrorTip'));
                        }
                    })
                    .catch(() => {
                        this.$Message.error(this.$t('mail.moveRestoreErrorTip'));
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
                util
                    .ajaxMail({
                        url: 'mail/maillabel/all',
                        method: 'get',
                        params: {
                            createUserId: this.userId
                        }
                    })
                    .then((res) => {
                        if (res.data.code === 1) {
                            if (!res.data.data.length) {
                                this.tagList = [
                                    {
                                        labelName: this.$t('timeLine.noData'),
                                        id: -1
                                    }
                                ];
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
                this.selection_list = {};
            },
            /** 选择邮件 */
            handle_select_mail(desc, selection) {
                if (this.autoSelectMailOperate) {
                    this.autoSelectMailOperate = false;
                    return false;
                }
                this.selection_list[desc] = [];
                for (const item of selection) {
                    this.selection_list[desc].push(item);
                }
                this.$store.commit('setSelectMailBoxType', this.currentBox);
                this.selectMailList = [];
                for (const key in this.selection_list) {
                    const temp = this.selection_list[key];
                    if (temp) {
                        const selectMails = [...temp];
                        this.selectMailList = selectMails.concat(this.selectMailList);
                    }
                }

                let total = 0;
                this.table_list.forEach((item) => {
                    total += item.data.length;
                });
                if (total === this.selectMailList.length) {
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
            // 在选中项为空的情况下, 批量选中 id 数组中存在于当前表格的数据(刷新列表保留原选中项用)
            handle_select_mails(idList) {
                this.selection_list = {};
                this.table_list.forEach(({ desc, data }) => {
                    const ref = this.$refs[`table${desc}`];
                    const temp = ref[0].$refs[`table${desc}`];
                    if (Array.isArray(data) && data.length) {
                        this.selection_list[desc] = data.filter(item => {
                            if (idList.includes(item.id)) {
                                this.autoSelectMailOperate = true;
                                temp.toggleRowSelection(item, true);

                                return true;
                            }
                            return false;
                        });
                    }
                });
                this.$store.commit('setSelectMailBoxType', this.currentBox);

                // 汇总各表格选中邮件
                this.selectMailList = [];
                for (const key in this.selection_list) {
                    const temp = this.selection_list[key];
                    if (temp) {
                        const selectMails = [...temp];
                        this.selectMailList = selectMails.concat(this.selectMailList);
                    }
                }

                // 计算总数
                let total = 0;
                this.table_list.forEach((item) => {
                    total += item.data.length;
                });
                // 计算全选
                if (total === this.selectMailList.length) {
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
            /** show筛选框 选中项被清空之后重新把选中的项打钩 */
            check_mail() {
                this.table_list.forEach((item) => {
                    item.data.forEach((mail) => {
                        if (this.selectMailIds.includes(mail.id)) {
                            mail._checked = true;
                        }
                    });
                });
            },
            /** 全选 */
            handleCheckAll() {
                if (this.indeterminate) {
                    this.checkAll = false;
                } else {
                    this.checkAll = !this.checkAll;
                }
                this.indeterminate = false;
                /**
                 * @Description: 补充在今天/昨天/更早收起状态下，点击全选框进行全选/取消全选操作时的逻辑，产品需求见【ID1005844】评论
                 * @author 杨娣
                 * @date 2020/5/28
                 */
                const domsObj = {};
                const tempArr = this.table_list.map((item) => item.desc);
                tempArr.forEach((item) => {
                    domsObj[item] = this.$refs[`table${item}`];
                });
                for (const key in domsObj) {
                    const selectMails = this.table_list.find((item) => item.desc === key);
                    /* 倘若未获取到该DOM节点，说明此刻是收起状态，那么如果全部选中，需要往selectMailList中添加选中数据
         * 在展开时，根据selectMailList的数据设置对应列表的选中状态
         *  */
                    if (!domsObj[key].length && this.checkAll) {
                        this.selectMailList.push(...selectMails.data);
                        this.selection_list[key] = [...selectMails.data];
                    }
                }

                /* 如果是取消全选(全不选)，需要把所有选中数据清空，在展开时，根据selectMailList的数据设置对应列表的选中状态 */
                if (!this.checkAll) {
                    for (const key in this.selection_list) {
                        this.selection_list[key] = [];
                    }
                }
            },
            /** 翻页操作 */
            pageChange(num) {
                this.$store.commit('setCurrentPage', num);
                this.currentPageNum = num;
                this.mailTableData = this.mockmailTableData(this.currentPersonId);
                this.$refs.expandtable.$el.querySelector('.el-table__body-wrapper').scrollTop = 0;
            },
            /** 改变表格每页展示数据量 */
            pageSizeChange(size) {
                this.$store.commit('setPageSize', size);
                this.pageSize = size;
                util
                    .ajaxJson({
                        url: '/crm/userconfig/update',
                        method: 'POST',
                        data: {
                            orgId: this.orgId,
                            userId: this.userId,
                            key: 'mailBox',
                            value: size.toString()
                        }
                    })
                    .then((res) => {
                        console.log('update的结果为', res.data);
                    });
                this.mailTableData = this.mockmailTableData(this.currentPersonId);
            },
            /** 根据日期排序 */
            handleSort(a) {
                this.sortType = a.order;
                this.mailTableData = this.mockmailTableData(this.currentPersonId);
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
                    fmt = fmt.replace(
                        RegExp.$1,
                        `${date.getFullYear()}`.substr(4 - RegExp.$1.length)
                    );
                }
                for (const k in o) {
                    if (new RegExp(`(${k})`).test(fmt)) {
                        fmt = fmt.replace(
                            RegExp.$1,
                            RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length)
                        );
                    }
                }
                return fmt;
            },
            /* 窗口变化的事件回调 */
            //            onResizeFunc() {
            //                const tableNode = document.querySelector(".mail-table");
            //                const receiveBtnNode = document.querySelector(".receive-mail");
            //                if (tableNode) {
            //                    this.screenWidth = tableNode.offsetWidth; // 窗口宽度
            //                    this.filterComponentWidth =
            //                        this.screenWidth - receiveBtnNode.offsetWidth - 570;
            //                }
            //            },
            /* 更新邮件列表，在mail-home中调用的 */
            updateTable() {
                this.loading = true;
                setTimeout(() => {
                    this.mailTableData = this.mockmailTableData(this.currentPersonId);
                }, 1000);
            },
            /* 关闭页面上其他的poptip浮层 */
            closeOtherPoptip() {
                const parentRef = this.$refs.expandtable.$refs.tableHeader;
                for (let i = 0; i < this.mailTableColumns.length; i++) {
                    const ref = parentRef.$refs[`tableHeaderFilterBox${i}`];
                    if (ref && typeof ref.closePoptip === 'function') {
                        // console.log(ref, typeof (ref.closePoptip));
                        ref.closePoptip();
                    }
                }
            },
            /* 配置表格显示项 */
            getFieldOrderList() {
                /**
                 * @Description: 搜索结果页不需要提供编辑表格显示字段的操作。此处默认搜索箱显示全部字段
                 * @author 杨娣
                 * @date 2020/8/25
                 */
                if (this.currentBox !== 'search') {
                    util
                        .ajaxJson({
                            url: '/crm/commonField/getFieldOrderList',
                            method: 'post',
                            data: {
                                orgId: this.orgId,
                                userId: this.userId,
                                type: this.columnType
                            }
                        })
                        .then((response) => {
                            if (response.data.code === '1') {
                                if (response.data.data) {
                                    // 解构数据
                                    const { id, showField, fieldStyle } = response.data.data;
                                    this.id_column_show_order = id;
                                    // 处理字段顺序
                                    if (typeof showField === 'string') {
                                        const fields = showField.split(',');
                                        this.group = fields.filter((item) =>
                                            this.editAllColumnsGroup.includes(item));
                                    } else {
                                        this.group = this.editAllColumnsGroup.slice();
                                    }
                                    // 处理字段宽度
                                    this.fieldStyle = fieldStyle ? JSON.parse(fieldStyle) : {};
                                    Object.entries(this.fieldStyle).forEach(([fieldKey, fieldObj]) => {
                                        // 更新最外层 table
                                        let column = this.mailTableColumns.find((item) => item.key === fieldKey);
                                        if (column && fieldObj.width) {
                                            column.width =
                                                fieldKey === 'subject' ? undefined : fieldObj.width;
                                            if (fieldKey === 'checkbox') {
                                                column.width = 45;
                                            }
                                            column.minWidth = fieldObj.width;
                                        }
                                        // 更新子 table
                                        column = this.expandColumns.find((item) => item.key === fieldKey);
                                        if (column && fieldObj.width) {
                                            column.width = fieldKey === 'subject' ? undefined : fieldObj.width;
                                            if (fieldKey === 'checkbox') {
                                                column.width = 45;
                                            }
                                            column.minWidth = fieldObj.width;
                                        }
                                    });
                                } else {
                                    this.group = this.editAllColumnsGroup;
                                }
                            } else {
                                this.$Message.error(this.$t('crm.Table.getTableColumnOrder'));
                                this.group = this.editAllColumnsGroup;
                            }
                        });
                } else {
                    this.group = this.editAllColumnsGroup;
                }
            },
            /* 修改列 */
            changeGroups(selCol) {
                this.refreshColumnFlag = false;
                const minWidthColumns = ['subject', 'sender', 'recipient', 'date'];
                const specialKeyParent = ['expandColumn', 'checkbox'];
                const selColParent = specialKeyParent.concat(selCol);
                const specialKeyChild = ['expandColumn', 'editColumns'];
                const selColChild = specialKeyChild.concat(selCol);
                const orderObj = Object.assign(
                    {},
                    ...selCol.map((item, index) => {
                        const temp = {};
                        temp[item] = index;
                        return temp;
                    })
                );
                this.parentColumns = this.mailTableColumns
                    .filter((col) => selColParent.includes(col.key))
                    .sort((a, b) => {
                        return orderObj[a.key] - orderObj[b.key];
                    });
                this.childColumns = this.expandColumns
                    .filter((col) => selColChild.includes(col.key))
                    .sort((a, b) => {
                        return orderObj[a.key] - orderObj[b.key];
                    });
                /**
                 * @Description: tableColumn默认会将页面剩余宽度平均分配给设置了width的列。当用户将所有字段都隐藏时，页面剩下不可隐藏的列均为固定宽度。
                 *              页面中将不会有设置了width的列，因此页面会出现大片空白，显示效果极差。因此，为了满足页面始终有被设置了minWidth的列，当用户
                 *              将所有可操作列隐藏时，手动增加一列用于临时占位。当有可操作列显示时，占位列将不再有。
                 *              注：将所有可操作列隐藏的操作按钮为表格右侧的设置图标，点击即可在弹窗中设置可操作列的显隐及顺序
                 * @author 杨娣
                 * @date 2020/8/7
                 */
                if (
                    !selCol.length ||
                    !selCol.some((item) => minWidthColumns.includes(item))
                ) {
                    const tempObj = {
                        title: '',
                        key: 'tempColumn',
                        label: '',
                        minWidth: 1
                    };
                    this.parentColumns.push(tempObj);
                    this.childColumns.push(tempObj);
                }
                this.$nextTick(() => {
                    this.refreshColumnFlag = true;
                    this.emptySelection();
                });
            },
            /* 通过邮箱地址获取邮箱昵称 */
            getMailNickName(mailAddressArray) {
                const tempArr = [];
                for (let i = 0; i < mailAddressArray.length; i++) {
                    const temp = mailAddressArray[i];
                    let lastIndex = temp.lastIndexOf('<');
                    let nickName = '';
                    if (lastIndex > 0) {
                        nickName = temp.substring(0, lastIndex);
                    } else {
                        if (lastIndex === 0) {
                            lastIndex = temp.lastIndexOf('@');
                            nickName = temp.substring(1, lastIndex);
                        } else {
                            lastIndex = temp.lastIndexOf('@');
                            nickName = temp.substring(0, lastIndex);
                        }
                    }
                    tempArr.push(nickName);
                }
                return tempArr.join();
            },
            /* 改变邮件的处理状态 */
            changeProcessingState(status, arr = this.selectMailList) {
                let ids = [];
                if (arr.length) {
                    if (this.currentBox === 'search') {
                        ids = this.getSupportOperateIds([2, 3, 5], arr).ids;
                    } else if (arr.length === 1) {
                        ids = arr.map((item) => item.id);
                    } else if (this.selectMailIds.length) {
                        ids = this.selectMailIds;
                    }
                } else {
                    this.$Message.info(this.$t('mail.please_flag_mail'));
                }
                if (ids.length) {
                    util
                        .ajaxJson({
                            url: '/mail/toDoMail',
                            method: 'post',
                            data: {
                                ids: ids,
                                mailFlag: status,
                                orgId: this.orgId,
                                userId: this.userId
                            }
                        })
                        .then((res) => {
                            if (res.data.code === 1) {
                                if (ids.length !== arr.length) {
                                    this.$Message.success(this.$t('mail.notSupportUntreatedTip1'));
                                }
                                /* 如果是将某页数据全部置为已完成，并且当前处于待处理箱，则页码自动减一，避免出现此页无数据显示的问题 */
                                if (status === 2 && this.currentBox === 'untreated') {
                                    if (ids.length === this.mailTableData.length) {
                                        this.$store.commit('setCurrentPage', this.currentPage - 1);
                                    }
                                }
                                // 标记已完成过滤数据 ids
                                let excludeIds = [];
                                if (status === 2 && this.currentBox === 'untreated') {
                                    excludeIds = ids;
                                }
                                this.mailTableData = this.mockmailTableData(
                                    this.currentPersonId,
                                    excludeIds
                                );
                                // 清空
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
                        })
                        .catch((err) => {
                            console.log('changeProcessingState()---err', err, status);
                        });
                } else {
                    this.$Message.success(this.$t('mail.notSupportUntreatedTip'));
                    this.mailTableData = this.mockmailTableData(this.currentPersonId);
                    this.emptySelection();
                }
            },
            /* 获取不同场景下的邮件待处理数量 */
            getDifferentToDoCount(userPersonId) {
                util
                    .ajaxJson({
                        url: 'mail/getMailSomeCount',
                        method: 'post',
                        data: {
                            accountIds:
                                this.currentAccount[0] === this.$t('mail.accountPlh')
                                    ? []
                                    : this.currentAccount,
                            createUserId: userPersonId,
                            enterpriseId: this.orgId,
                            mailToDoFlag: 1
                        }
                    })
                    .then((res) => {
                        if (res.data.code === 1) {
                            this.untreatedCustomerCount = res.data.data.inCrmMailCount;
                            this.untreatedUndocumentedCount = res.data.data.outCrmMailCount;
                        }
                    });
            },

            /* 内部转发相关 */
            /* 控制内部转发弹窗的显隐规则 */
            toggleInterForwardingModal(isVisible) {
                this.visibleForwardSales = isVisible;
            },
            // 内部转发弹窗 closed 回调
            handleCloseInterForwarding() {
                // 清空用户树选中项
                this.$refs.update_tree.setCheckedKeys([]);
                // 清空内部转发选中用户
                this.interForwardingUsersSelected = [];
                // 清空内部转发备注信息
                this.mailInterForwardingInputContent = '';
            },

            /* 邮件归档 */
            // 邮件归档至 CRM
            archiveToCRM(type) {
                this.visibleArchive = true;
                this.archiveObjectType = type;
            },

            /* 获取内部转发的企业人员信息 --- 为全部企业人员中排除掉离职的部分 */
            get_update_tree() {
                util
                    .ajax({
                        url: '/new-privilege/department/getDepartmentTree',
                        method: 'post',
                        data: {
                            orgId: this.orgId
                        }
                    })
                    .then(({ data }) => {
                        if (data.code === '1') {
                            return new Promise((resolve) => {
                                this.init_tree = data.data.list;
                                if (Array.isArray(data.data.list) && data.data.list.length) {
                                    resolve();
                                } else {
                                    this.loading_tree = false;
                                }
                            });
                        } else {
                            this.$Message.error(this.$t('authority.userManagement.departmentErr'));
                            this.loading_tree = false;
                        }
                    })
                    .then((data) => {
                        util
                            .ajaxJson({
                                url: '/new-privilege/user/getUserDataTables',
                                method: 'post',
                                data: {
                                    departmentId: 0,
                                    orgId: this.orgId,
                                    pageNo: 1,
                                    pageSize: 2000
                                }
                            })
                            .then(({ data }) => {
                                if (data.code === '1') {
                                    this.mailInterForwardingUsers = data.data.list.filter((item) => !item.isDelete);
                                    this.mailInterForwardingTreeData = this.get_tree(
                                        this.init_tree,
                                        this.mailInterForwardingUsers
                                    );
                                } else {
                                    this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                                }
                                this.loading_tree = false;
                            });
                    });
            },
            /* 部门树处理函数 */
            get_tree(param_arr, user_list, check_arr) {
                const userList = user_list.map((item) => {
                    const obj = {};
                    obj.parentId = item.departmentId;
                    obj.name = item.fullname;
                    obj.power = item.manageName;
                    obj.id = item.id;
                    obj.check = false;
                    obj.type = 'person';
                    return obj;
                });

                if (check_arr) {
                    for (const check_item of check_arr) {
                        for (const user_item of userList) {
                            if (check_item.userId === user_item.id) {
                                user_item.check = true;
                            }
                        }
                    }
                }
                const arr = param_arr.map((item) => {
                    const obj = {};
                    obj.parentId = item.parentId;
                    obj.name = item.name;
                    obj.id = item.id;
                    return obj;
                });
                let parent_arr = [];

                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].parentId === 0) {
                        parent_arr.push(arr[i]);
                        arr.splice(i, 1);
                        i = i - 1;
                    }
                }

                function structure_parent_arr(arr) {
                    return arr.map((item) => {
                        const obj = {};
                        obj.title = item.name;
                        obj.id = item.id;
                        obj.parentId = item.parentId;
                        obj.checked = item.check;
                        obj.expand = true;
                        obj.children = [];
                        return obj;
                    });
                }

                parent_arr = structure_parent_arr(parent_arr);

                function build_child(parent_arr, arr) {
                    /**
                     * @Description: 企业下人员列表和部门列表在后端存储的是两张表，存在人员id和部门id相同的情况
                     * 一旦出现这种情况，会导致本来应属于某一部门下的人员，出现在某一人员的子节点中，示例见bug[1002136]
                     * 解决方案为：
                     * 在获取人员列表时，每一项加上type='person'，部门列表每一项添加上type='department'，
                     * 遍历添加子节点时，加上filter，解决当传入的父节点数组中既有人员又有部门的情况，
                     * 保证只有type为department的父节点才会有children属性，才可以添加子节点
                     * @author 杨娣
                     * @date 2019/11/22
                     */
                    parent_arr = parent_arr.filter((item) => item.type !== 'person');
                    for (let j = 0; j < parent_arr.length; j++) {
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i].parentId === parent_arr[j].id) {
                                parent_arr[j].checked = false;
                                const obj = {};
                                obj.title = arr[i].name;
                                obj.id = arr[i].id;
                                obj.power = arr[i].power;
                                obj.parentId = arr[i].parentId;
                                obj.grandpa_id = parent_arr[j].parentId;
                                obj.parent_name = parent_arr[j].title;
                                if (arr[i].category === 1) {
                                    obj.menu = 'department';
                                } else {
                                    obj.menu = 'person';
                                }
                                obj.type = arr[i].type;
                                obj.expand = true;
                                obj.checked = arr[i].check;
                                obj.children = [];
                                parent_arr[j].children.push(obj);
                                arr.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }
                    if (arr.length) {
                        for (const child_item of parent_arr) {
                            if (child_item.children.length) {
                                build_child(child_item.children, arr);
                            }
                        }
                    }

                    return parent_arr;
                }

                const new_arr = arr.concat(userList);
                return build_child(parent_arr, new_arr);
            },
            /* 部门树结构的渲染函数 */
            renderContent(h, { data }) {
                function get_icon(str) {
                    return str === 'person'
                        ? 'custom custom-person'
                        : 'custom custom-group';
                }

                return h('span', [
                    h('span', [
                        h('Icon', {
                            props: {
                                custom: get_icon(data.type)
                            },
                            style: {
                                marginRight: '8px',
                                fontSize: '16px'
                            }
                        }),
                        h(
                            'span',
                            {
                                attrs: {
                                    title: data.title
                                },
                                style: {
                                    display: 'inline-block',
                                    maxWidth: '100px',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    verticalAlign: 'bottom'
                                }
                            },
                            data.title
                        )
                    ])
                ]);
            },
            /* 部门树选中项变化 */
            change_selected_userIds() {
                const person_arr = this.$refs.update_tree.getCheckedNodes();
                this.interForwardingUsersSelected = person_arr
                    .filter((item) => item.type === 'person')
                    .map((item) => {
                        return {
                            userId: item.id,
                            userName: item.title
                        };
                    });
            },
            /* 处理内部转发的逻辑 */
            handleMailInterForwarding() {
                console.log('handleMailInterForwarding()--', this.selectMailIds);
                let ids = [];
                if (!this.interForwardingUsersSelected.length) {
                    this.$Message.warning('请至少选择一位接收人');
                    return false;
                }
                if (this.selectMailIds.length) {
                    if (this.currentBox === 'search') {
                        /* 邮件搜索页在进行批量内部转发操作时，需要排除掉草稿箱/已删除/垃圾箱的邮件 */
                        ids = this.getSupportOperateIds([5]).ids;
                    } else {
                        ids = this.selectMailIds;
                    }

                    // 过滤原始邮件类型为发件的邮件
                    // fromOrToFlag（from_or_to_flag -- 收发件标识；当 is null 时，代表是收到的非已发箱邮件（例如收件箱、垃圾箱等）；=1时，并且mail_draft_flag=0是代表是从询盘云发出的邮件；=2时，代表是收到的已发箱邮件。）
                    ids = ids.filter((id) => {
                        const mail = this.selectMailList.find((item) => item.id === id);

                        return !(mail && mail.fromOrToFlag);
                    });
                } else {
                    this.$Message.warning(this.$t('mail.noMailSelectedTip'));
                }
                if (ids.length) {
                    this.visibleForwardSales = false;
                    /* 给一鸣：此处调用后端内部转发的接口 */
                    util
                        .ajaxMailJson({
                            url: '/mail/mailInterForwardingRecord/interForwarding',
                            method: 'post',
                            data: {
                                mailIdList: ids,
                                createUserId: this.userId,
                                createUserName: this.fullName,
                                forwardRemark: this.mailInterForwardingInputContent,
                                forwardToUserList: this.interForwardingUsersSelected,
                                orgId: this.orgId
                                // 此处参数依照接口定义填写，选中的部门树人员存于变量interForwardingUsersSelected；内部转发备注存于变量mailInterForwardingInputContent
                            }
                        })
                        .then(async (res) => {
                            if (res.data.code === 1) {
                                if (ids.length !== this.selectMailIds.length) {
                                    await this.$Message.warning('已发箱/草稿箱的邮件不支持内部转发！');
                                } else {
                                    this.$Message.success('内部转发成功');
                                }
                                this.mailTableData = this.mockmailTableData(this.currentPersonId);
                                this.emptySelection();
                            } else {
                                this.$Message.error('内部转发失败');
                            }
                        });
                } else {
                    this.visibleForwardSales = false;
                    this.$Message.success('已发箱/草稿箱的邮件不支持内部转发！');
                    this.mailTableData = this.mockmailTableData(this.currentPersonId);
                    this.emptySelection();
                }
            },
            // 创建线索
            createClue(mailId, email, currentMailAddType, currentMailInfo, noReplyToEmail) {
                if (this.currentPersonId === this.userId) {
                    if (this.mailAddress === email) {
                        this.littleDrawerVisible = !this.littleDrawerVisible;
                    } else {
                        this.littleDrawerVisible = false;
                        this.$nextTick(() => {
                            this.littleDrawerVisible = true;
                        });
                    }
                    this.mailAddress = email;
                    this.currentMailId = mailId;
                    this.currentMailInfo = currentMailInfo;
                    this.currentMailInfo.noReplyToEmail = noReplyToEmail;
                    this.currentMailInfo.mailAddress = email;
                    if (this.$refs.tabletoday) {
                        this.$refs.tabletoday[0].show_company_detail = false;
                        this.$refs.tabletoday[0].show_clue_detail = false;
                    }
                    if (this.$refs.tableyesterday) {
                        this.$refs.tableyesterday[0].show_company_detail = false;
                        this.$refs.tableyesterday[0].show_clue_detail = false;
                    }
                    if (this.$refs.tableago) {
                        this.$refs.tableago[0].show_company_detail = false;
                        this.$refs.tableago[0].show_clue_detail = false;
                    }
                }
            },
            // 关闭小弹窗
            littleDrawerHidden(val) {
                this.littleDrawerVisible = val;
            },
            // 录入为线索后
            updateStatus(clueId, status) {
                this.getCompanyStatusByEmails();
                if (this.$refs.tabletoday) {
                    this.$refs.tabletoday[0].showClue({ clueId, type: 1 });
                } else if (this.$refs.tableyesterday) {
                    this.$refs.tableyesterday[0].showClue({ clueId, type: 1 });
                } else if (this.$refs.tableago) {
                    this.$refs.tableago[0].showClue({ clueId, type: 1 });
                }
            },
            // 录入成询盘后
            updateInquiryStatus(clueId, status) {
                this.getCompanyStatusByEmails();
                if (this.$refs.tabletoday) {
                    this.$refs.tabletoday[0].getInquiryAndCompanyInfoByEmails(this.mailAddress);
                } else if (this.$refs.tableyesterday) {
                    this.$refs.tableyesterday[0].getInquiryAndCompanyInfoByEmails(this.mailAddress);
                } else if (this.$refs.tableago) {
                    this.$refs.tableago[0].getInquiryAndCompanyInfoByEmails(this.mailAddress);
                }
            },
            foldersRenderContent(h, { root, data, store }) {
                if (data.list && data.list.length) {
                    return (
                        <div style="width:100%;" on-click={() => { event.stopPropagation(); }}>
                            <Tooltip placement="top"
                                    content={data.boxTypeName}
                                    transfer>
                                <span on-click={() => { event.stopPropagation(); this.$refs.dropdown.handleClick(); this.moveTo(data.id); }}
                                      style="width:100%;display:block;font-size:14px;">{this.$dym.characterOmitStr(data.boxTypeName, 20)}</span>
                            </Tooltip>
                        </div>
                    );
                } else {
                    return (
                        <Tooltip placement="top"
                                content={data.boxTypeName}
                                transfer>
                            <DropdownItem
                                key={data.id}
                                command={data.id}
                                style="width:100%;"
                                class="mail-movetofolder">
                                { this.$dym.characterOmitStr(data.boxTypeName, 20) }
                            </DropdownItem>
                        </Tooltip>
                    );
                }
            },
            // 树节点展开，记录展开节点 id，控制默认展开项
            tree_node_expand(val) {
                this.expandedIdList.push(val.id);
            },
            // 树节点收起，清空收起节点 id，控制默认展开项
            tree_node_collapse(val) {
                // 使用递归获取该节点及其子节点id数组
                const allChildrenIdArr = [];
                function getAllChildrenId(node) {
                    allChildrenIdArr.push(node.id);
                    if (node.list != null) {
                        node.list.forEach(item => {
                            getAllChildrenId(item);
                        });
                    }
                }
                getAllChildrenId(val);

                // 收起时要去掉该节点及其子节点
                const expandedIdArr = [];
                this.expandedIdList.forEach(item => {
                    if (allChildrenIdArr.indexOf(item) === -1) {
                        expandedIdArr.push(item);
                    }
                });
                this.expandedIdList = expandedIdArr;
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
                        this.mailTableData = this.mockmailTableData(this.currentPersonId);
                        // 清空数据
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

<style lang="less">
    @import url("./MailTable.less");

    .move-to-folders{
        .el-tree-node__content{
            height: 36px;
            padding-right: 20px;
        }
        .el-dropdown-menu__item{
            padding:0;
        }
    }
    .mail-table footer {
        margin: 10px 0 !important;
        padding: 0 !important;
        text-align: right;
    }

    .table-expand {
        display: none;
    }

    .noborder-table {
        .el-table__expanded-cell {
            padding: 0;
        }

        .el-icon-arrow-right {
            visibility: hidden;
        }
    }

    .inter-forwarding-modal {
        padding: 10px 20px;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.8);

        .el-dialog {
            padding-bottom: 10px;

            .el-dialog__title {
                font-weight: 700;
            }

            .el-dialog__body {
                max-height: 65vh;
            }
        }

        .inter-forwarding-container {
            .inter-forwarding-remark {
                margin-bottom: 10px;

                .el-textarea__inner {
                    /*max-height: 110px;*/
                    /*overflow: auto;*/
                }
            }

            .inter-forwarding-footer {
                float: right;
            }
        }
    }
</style>
