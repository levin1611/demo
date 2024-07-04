<template>
    <div class="split-mail-table" v-loading="handleLoading">
        <!-- 表格上方操作栏 -->
        <div class="split-search-header">
             <!-- 群发箱明细返回 -->
            <Tooltip v-if="groupBoxId && currentBox !== 'search' && !selectMailList.length"
                    placement="top"
                    transfer
                    :content="$t('back')">
                <Icon custom="custom custom-back" class="mail-detail-back" @click="goGroupBox" style="margin:2px 22px 0 0;cursor: pointer;" />
            </Tooltip>
            <!-- 全选按钮 -->
            <span v-if="currentPersonId === userId"
                  class="split-mail-checkAll margin-right-20">
                <Checkbox :value="checkAll"
                          :indeterminate="indeterminate"
                          @click.native.prevent="handleCheckAll"></Checkbox>
                <Dropdown v-if="!['draftBox', 'trash'].includes(currentBox)"
                          trigger="click"
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

            <!-- 筛选结果展示 -->
            <template v-if="currentBox === 'search'">
                <h3>搜索结果</h3>
                <HelpTip :title="$t('helpTip.searchResult')"
                         style="margin-right: 8px; "></HelpTip>
                <p> 已搜索到{{ total }}封关键词为
                    “<span :title="themeKey"
                           class="keyword keyword-limit">{{ themeKey }}</span>”
                    的邮件
                </p>
            </template>

            <!-- 收信按钮 -->
            <Tooltip v-else
                     v-show="currentPersonId === userId"
                     placement="top"
                     :content="$t('mail.receiveLetter')"
                     transfer>
                <Icon custom="custom custom-refresh"
                      @click.native="receiveMail"
                      :class="receiveMailFlag ? 'receive-load-loop' : ''"
                      class="split-mail-receive mail-receivingletter cursor-pointer margin-right-20"></Icon>
            </Tooltip>

            <!--默认展示标记 【全部标为已读】 【全部标为已完成】-->
            <ul v-show="!selectMailList.length"
                class="operates clearfloat">
                <!-- 标记 -->
                <li v-if="!signFlag && !['dustbin', 'trash', 'draftBox'].includes(currentBox)">
                    <Dropdown trigger="click"
                              @command="changeReadState">
                        <Tooltip placement="top"
                                 :content="$t('mail.mark')"
                                 transfer>
                            <Icon custom="custom custom-sign"
                                  size="16"/>
                        </Tooltip>
                        <DropdownMenu slot="dropdown">
                            <DropdownItem v-if="currentBox !== 'draftBox'"
                                          command="readAll">{{ $t('mail.markReadAll') }}</DropdownItem>
                            <DropdownItem command="finishedAll"
                                          class="piwik_mailTable_betchRemark_finishedAll">{{ $t("mail.markAsFinishedAll") }}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </li>
            </ul>

            <!-- 批量操作 -->
            <!--0-inbox(收件箱)、5-draftBox(草稿箱)、4-sentBox(已发箱)、3-dustbin(已删除箱)、2-trash(垃圾箱)）-->
            <ul v-show="selectMailList.length"
                class="operates clearfloat">
                <!-- 标记 -->
                <li v-if="!signFlag && !['dustbin', 'trash', 'draftBox'].includes(currentBox)">
                    <Dropdown trigger="click"
                              @command="changeReadState">
                        <Tooltip placement="top"
                                 :content="$t('mail.mark')"
                                 transfer>
                            <Icon custom="custom custom-sign"
                                  size="16"/>
                        </Tooltip>
                        <DropdownMenu slot="dropdown">
                            <DropdownItem v-if="currentBox !== 'draftBox'"
                                          command="read">{{ $t('mail.markRead') }}</DropdownItem>
                            <DropdownItem v-if="currentBox !== 'draftBox'"
                                          command="unread">{{ $t('mail.markUnread') }}</DropdownItem>
                            <DropdownItem v-if="currentBox !== 'draftBox'"
                                          command="readAll">{{ $t('mail.markReadAll') }}</DropdownItem>
                            <DropdownItem v-if="!['dustbin', 'draftBox'].includes(currentBox)"
                                          :divided="currentBox !== 'draftBox'"
                                          command="star">{{ $t('mail.flag_star_box') }}</DropdownItem>
                            <DropdownItem v-if="!['dustbin', 'draftBox'].includes(currentBox)"
                                          command="unstar">{{ $t('mail.cancel_flag_star_box') }}</DropdownItem>
                            <DropdownItem v-if="currentBox !== 'untreated'"
                                          :divided="currentBox !== 'draftBox'"
                                          command="changeUntreated"
                                          class="piwik_mailTable_betchRemark_untreated">{{ $t('mail.markAsUntreated') }}</DropdownItem>
                            <DropdownItem command="changeFinished"
                                          :divided="currentBox === 'untreated'"
                                          class="piwik_mailTable_betchRemark_finished">{{ $t('mail.markAsFinished') }}</DropdownItem>
                            <DropdownItem command="finishedAll"
                                          class="piwik_mailTable_betchRemark_finishedAll">{{ $t("mail.markAsFinishedAll") }}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </li>
                <!-- 移动到 -->
                <li v-if="!moveFlag && !['dustbin', 'trash'].includes(currentBox) && !selectMailStatus">
                    <Dropdown trigger="click"
                              ref="dropdown"
                              @command="moveTo">
                        <Tooltip placement="top"
                                 :content="$t('mail.moveTo')"
                                 transfer>
                            <Icon custom="custom custom-move-mail"
                                  size="16"
                                  @click="getCustomFolders"/>
                        </Tooltip>
                        <DropdownMenu slot="dropdown"
                                      class="move-to-folders"
                                      style="max-height: 400px; overflow: auto;">
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
                <li v-if="orgId !== '10991' && !selectMailStatus">
                    <Tooltip placement="top"
                             :content="$t('delete')"
                             transfer>
                        <Icon custom="custom custom-delete-mail"
                              size="16"
                              @click="handleDelete"/>
                    </Tooltip>
                </li>
                <!-- 标签 -->
                <li v-if="!['dustbin', 'trash', 'draftBox'].includes(currentBox)">
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
                <!-- 恢复 -->
                <li v-if="currentBox === 'dustbin'">
                    <Tooltip placement="top"
                             :content="$t('restore')"
                             transfer>
                        <Icon custom="custom custom-restore"
                              size="16"
                              @click="restore"/>
                    </Tooltip>
                </li>
                <!-- 还原 -->
                <li v-if="currentBox === 'trash' || Boolean(Number(currentBox))">
                    <Tooltip placement="top"
                             :content="$t('mail.moveRestore')"
                             transfer
                             :class="{'customfolder-moverestore-mail': Boolean(Number(currentBox))}">
                        <Icon custom="custom custom-mail-restore"
                              size="16"
                              @click="moveRestore"/>
                    </Tooltip>
                </li>
                <!-- 内部转发 -->
                <li v-if="!['sentBox', 'dustbin', 'trash', 'draftBox'].includes(currentBox)">
                    <Tooltip placement="top"
                             content="内部转发"
                             transfer>
                        <Icon custom="custom custom-inter-forwarding"
                              size="16"
                              @click="toggleInterForwardingModal(true)"/>
                    </Tooltip>
                </li>
                <!-- 手动归档 CRM -->
                <li v-if="!['dustbin', 'trash', 'draftBox'].includes(currentBox) && !selectMailStatus">
                    <Dropdown trigger="click"
                              @command="archiveToCRM">
                        <!-- trigger -->
                        <Tooltip placement="top"
                                 :content="$t('mail.archiveToCRM')"
                                 transfer>
                            <span>
                                <svg class="custom"
                                     aria-hidden="true"
                                     style="width: 16px;height: 16px;">
                                    <use xlink:href="#custom-archiveToCrm"></use>
                                </svg>
                            </span>
                        </Tooltip>
                        <!-- 下拉 -->
                        <DropdownMenu slot="dropdown"
                                      style="max-height: 400px; overflow: auto;">
                            <!-- 客户 -->
                            <DropdownItem :command="1">{{ $t('mail.customer') }}</DropdownItem>
                            <!-- 询盘 -->
                            <DropdownItem :command="3">{{ $t('mail.inquiry') }}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </li>
                <!-- 手动执行收发信规则图标 -->
                <li v-if="!selectMailStatus">
                    <Tooltip placement="top" :content="$t('mail.mailDetail.manuallyEnforceRule')" transfer>
                        <Icon class="piwik_manually_enforce_rules" size="16" custom="custom custom-icon_e_rule" @click="handleenforceRules"/>
                    </Tooltip>
                </li>
                <!-- 取消发送 -->
                <li v-if="groupBoxId && isShowCancelStatus">
                    <Tooltip placement="top" :content="$t('cancel')" transfer>
                        <Icon class="piwik_manually_enforce_rules" size="16" custom="custom custom-deletesendmail" @click="handleCancel"/>
                    </Tooltip>
                </li>
            </ul>

            <!-- 部门筛选 -->
            <div v-if="currentBox !== 'search'"
                 v-show="!selectMailList.length"
                 class="float-left enterInfo">
                <DepartmentTree
                        ref="departmentTree"
                        :accountList="accountList"
                        @SelectedPerson="TabEmail"
                        @EmailFlag="refreshEmailList">
                </DepartmentTree>
            </div>

            <!-- 筛选标签 -->
            <div class="split-mail-filter-tags">
                <FilterTags
                    style="top: 0px; height: 34px"
                    v-show="!selectMailList.length"
                    :filterConObj.sync="config_tableFilter"
                    :langObj="lang_mail"
                    :removeWidth="1100"
                    :minWidth="390"
                    @change_filter_tag="change_filter_tag"
                    @removeCon="remove_filter_tag">
                </FilterTags>
            </div>

            <!-- 邮件搜索 -->
            <Search
                ref="search"
                :parentValue="keyword"
                :holderText="$t('mail.themeKeyPlh')"
                :width="300"
                :delayTime="100"
                :btnClass="'mail-search'"
                :maxlength="30"
                :mini="true"
                style="margin-top:3px"
                @change-keyword="changeKeyword"
                @press-enter="search('0')"
                class="text-right">
                <template>
                    <ul slot="searchDropdown"
                        class="ivu-select-dropdown-list">
                        <li @mousedown="search('1')"
                            class="ivu-select-item">包含<span class="keyword">[<span class="keyword-limit">{{ keyword }}</span>]</span>的收件人/发件人/主题
                        </li>
                        <li @mousedown="search('2')"
                            class="ivu-select-item">包含<span class="keyword">[<span class="keyword-limit">{{ keyword }}</span>]</span>的邮件正文
                        </li>
                        <li @mousedown="search('3')"
                            class="ivu-select-item">包含<span class="keyword">[<span class="keyword-limit">{{ keyword }}</span>]</span>的附件名称
                        </li>
                    </ul>
                </template>
            </Search>
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
            <Col :span="8" v-loading="loading">
                <!-- 筛选弹窗 -->
                <FilterPanel v-if="currentBox !== 'search'"
                    :filterConObj.sync="config_tableFilter"
                    inputKey="subject"
                    :langObj="lang_mail"
                    :currentBox="currentBox"
                    @search="pageChange(1)"></FilterPanel>

                <!-- 待处理邮箱的不同类别 分别为：全部、已建档用户、未建档用户-->
                <Tabs v-if="currentBox === 'untreated'"
                      v-model="currentUntreatedTab"
                      class="untreated-box-types">
                    <TabPane name="all"
                        class="piwik_mailTable_untreated_all">
                        <span slot="label">{{ $t('mail.accountPlh') }}</span>
                    </TabPane>
                    <TabPane name="customer"
                        class="piwik_mailTable_untreated_customer">
                        <span slot="label">
                            <span class="type-item-title">{{ $t('mail.untreatedCustomer') }}</span>
                            <span class="type-item-count">{{ `(${untreatedCustomerCount})` }}</span>
                        </span>
                    </TabPane>
                    <TabPane name="undocumented"
                        class="piwik_mailTable_untreated_undocumented">
                        <span slot="label">
                            <span class="type-item-title">{{ $t('mail.untreatedDocumented') }}</span>
                            <span class="type-item-count">{{ `(${untreatedUndocumentedCount})` }}</span>
                        </span>
                    </TabPane>
                </Tabs>

                <!-- 左侧列表 -->
                <div ref="mailListContainer"
                     :style="{ height: list_height }"
                     class="split-mail-list">
                    <!-- 无数据提示 -->
                    <div v-if="mailTableData.length === 0"
                         class="noDataTip">
                        <p>{{ no_data_text }}</p>
                    </div>

                    <!-- 列表 -->
                    <SplitMailItem
                        v-for="item in mailTableData"
                        :key="item.id"
                        :rowData="item"
                        :currentBox="currentBox"
                        :selectMailIds="selectMailIds"
                        :keyword="keyword"
                        @goMailDetail="goMailDetail"
                        @handle_select_mail="handle_select_mail"
                        @goToForwardDetail="goToForwardDetail"
                        @getLatestForward="getLatestForward"
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
                    class="split-mail-table-page"
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
                <div v-if="(selectedMailIndex === -1 && ![jumpMailId, retainMailId].includes(selectedMailId)) || currentBox === 'draftBox' || selectedMailBoxType === 'draftBox'"
                     :style="{ marginTop: noMail_top }"
                     class="no-selected-mail">
                    <img src="@/svg/no-data.svg"
                         :alt="$t('mail.noSelectedMail')">
                    <p>{{ $t('mail.noSelectedMail') }}</p>
                </div>

                <!-- 邮件详情 -->
                <MailDetail
                        v-else-if="selectedMailIndex !== -1 || [jumpMailId, retainMailId].includes(selectedMailId)"
                        :currentBox="currentBox"
                        :groupBoxId="groupBoxId"
                        :showToggleMailDetail="false"
                        ref="mailDetail"
                        v-bind="$attrs"
                        @mailReadStateChanged="mailReadStateChanged"
                        @updateMailList="updateTable"
                        @createClue="createClue"
                        @littleDrawerHidden="littleDrawerHidden"
                        v-on="$listeners">
                   <!-- 以下属性改为用 v-bind 和 v-on 从上层组件 mail-home 传给 mailDetail -->
                    <!--:content_height="content_height"-->
                    <!--:currentBox="currentBox"-->
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
                :styles="{top: '120px'}"
                :transition-names="['','']">
            <p>{{ $t('mail.deleteContent') }}</p>
            <p v-if="isMergeredMailList.length">{{ $t('mail.deleteConfirmTip') }}</p>
            <div slot="footer">
                <Button @click="deleteModel = false">{{ $t('crm.UniSet.modal_cancel') }}</Button>
                <Button type="primary"
                        @click="foreverRemove"
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

        <!-- 内部转发 -->
        <Modal :visible="visibleForwardSales"
               :modal-append-to-body="false"
               :close-on-click-modal="false"
               title="内部转发"
               :mask-closable="false"
               :show-close="false"
               width="700px"
               @closed="handleCloseInterForwarding"
               class="modal inter-forwarding-modal">
            <div class="inter-forwarding-container">
                <div>
                    <div>请选择转发给：</div>
                    <div class="inter-forwarding-sales-tree">
                        <div style="max-height: 350px;overflow: auto;">
                            <Tree v-show="visibleForwardSales"
                                  :data="mailInterForwardingTreeData"
                                  show-checkbox
                                  multiple
                                  default-expand-all
                                  node-key="id"
                                  :render-content="renderContent"
                                  ref="update_tree"
                                  style="margin-top: 15px"
                                  @check-change="change_selected_userIds"></Tree>
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
                            :autosize="{minRows: 2,maxRows: 5}"></Input>
                </div>
                <div slot="footer"
                     class="inter-forwarding-footer">
                    <Button @click="toggleInterForwardingModal(false)">{{ $t('crm.UniSet.modal_cancel') }}</Button>
                    <Button type="primary"
                            @click="handleMailInterForwarding">{{ $t('crm.UniSet.modal_ok') }}</Button>
                </div>
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
        <!--        :selectOptions="selectOptions"-->
        <!--        @refreshData="refreshEmailList">-->
        <!--</NewCompany>-->

        <!-- 录入线索 -->
        <!-- <EnterClueModal
                v-model="newClueShow"
                :title="$t('facebook.inbox.enterClue')"
                :mask-closable="false"
                class="modal companydata"
                :saleList="salesList"
                :templateList="templateList"
                :json_data="json_data"
                :type="'mail'"
                saveClueClass="piwik-mail-enter-clue"
                saveClueAndInquiryClass="piwik-mail-enter-inquiry"
                okEnterInquiryClass="mail_inquirySubmit"
                @on_cancle_clue="on_cancle_clue"
                @returnLeadsId="updateStatus"
                @updateInquiryStatus="updateInquiryStatus">
        </EnterClueModal> -->

        <!-- 邮件归档至 CRM -->
        <MailArchive :visible.sync="visibleArchive"
                     :archiveObjectType="archiveObjectType"
                     :mailList="selectMailList"
                     @archiveFinished="handleArchiveFinished"></MailArchive>

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
              <Button @click="showControl = false">{{$t('cancel')}}</Button>
              <Button type="primary" class="piwik_email_allRead_makeSure" @click="sureBtn">{{$t('confirm')}}
              </Button>
          </div>
        </Modal>
        <!-- 右侧弹窗 -->
        <littleDrawer
            v-if="littleDrawerVisible"
            :visible="littleDrawerVisible"
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
    import Vue from 'vue';
    import util from '@/libs/util';
    import Utils from '@/utils';
    import { mapState, mapActions, mapGetters } from 'vuex';
    import FilterTags from '@/views/main-components/filter-tags';
    import Search from '@/views/main-components/search-input/search-input';
    import DepartmentTree from './components/departmentTree';
    import SplitMailItem from './components/splitMailItem';
    import FilterPanel from './components/filterPanel';
    import MailDetail from '../MailDetail';
    // import NewCompany from '@/views/crm/Detail/Components/Modal/fixed-modal-form/create-company';
    import MailArchive from '@/views/mail/mail-home/components/mail-table/components/Modal/MailArchive';
    import CRMDrawerList from '@/views/crm/Detail/CRMDrawerList';
    import ClueDrawerList from '@/views/clue-manage/Detail/ClueDrawerList';
    import littleDrawer from '@/views/main-components/little-drawer/little-drawer.vue';
    import { getIsEnable, enforceRules } from '@/api/mail.js';
    import tableApi from '@/api/mail/table.js';

    export default {
        name: 'splitMailTable',
        components: {
            FilterTags,
            Search,
            DepartmentTree,
            SplitMailItem,
            FilterPanel,
            MailDetail,
            // NewCompany,
            MailArchive,
            CRMDrawerList,
            ClueDrawerList,
            littleDrawer
        },
        props: {
            receiveMailFlag: {
                type: Boolean,
                default: false
            },
            currentBox: String,
            groupBoxId: String,
            // 从别处直接新窗口跳转邮件详情的邮件 id , 分列阅读模式下, 即使邮件列表不存在此邮件也显示邮件详情
            jumpMailId: Number
        },
        computed: {
            ...mapState({
                orgId: state => state.enterpriseId,
                userId: state => state.userId,
                fullName: state => state.fullName,
                userName: state => state.userName,
                currentPage: state => state.mail.currentPage,
                window_height: state => state.window_height,
                ws_receive_mail: state => state.mail.ws_receive_mail,
                themeKey: state => state.mail.themeKey,
                searchType: state => state.mail.searchType,
                currentPersonId: state => state.mail.currentPersonId,
                currentAccount: state => state.mail.currentAccount,
                currentInputInfo: state => state.mail.currentInputInfo,
                currentAccountIds: state => state.mail.currentAccountIds,
                websocketMsgMail: state => state.mail.websocketMsgMail,
                selectedMailId: state => state.mail.selectedMailId,
                selectedMailBoxType: state => state.mail.selectedMailBoxType
            }),
            ...mapGetters([
                'isContainsMenu',
                // 当前选中邮箱账号的"新收邮件"统计数据
                'currentAccountNewReceiveMailIdObj'
            ]),
            // 当前邮箱当前箱体"新收邮件统计数据"
            currentBoxNewReceiveMailIdArr() {
                return this.currentAccountNewReceiveMailIdObj[this.currentBox] || [];
            },
            // 邮件详情高度
            mail_height() {
                return `${this.window_height - 110}px`;
            },
            // 邮件列表高度
            list_height() {
                return `${this.window_height - 160 - (this.currentBox !== 'search' ? 41 : 0) - (this.currentBox === 'untreated' ? 48 : 0)}px`;
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
            no_data_text() {
                if (this.currentBox === 'search') {
                    return '找不到与您的搜索匹配的邮件';
                } else {
                    return '暂无数据';
                }
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
            },
            selectMailStatus() {
                if (this.groupBoxId) {
                    return this.selectMailList.some(item => item.successFlag === '-1' || item.successFlag === '4');
                }
                return false;
            },
            isShowCancelStatus() {
                return this.selectMailList.some(item => item.successFlag === '-1');
            }
        },
        watch: {
            // 选中邮件 ID 变化时, 去掉"表格页刷新时详情页不刷新"标识
            selectedMailId: {
                handler(val) {
                    this.retainMailId = null;
                }
            },
            // 监听当前邮箱当前箱体"新收邮件统计数据"变化, 当有新变化时, 如果当前处于表格第一页, 则刷新表格数据
            currentBoxNewReceiveMailIdArr: {
                handler(val, oldVal) {
                    if (val.find(id => !oldVal.includes(id))) {
                        // 如果当前账号新收邮件 id 数组中有新值
                        // (如果箱体发生变化, mail-home.vue 会调用 removeBox 清空该箱体, 所以不用担心箱体变化影响此处监听)

                        if (this.page === 0) {
                            // 如果当前处于第一页

                            if (this.selectMailIds.length) {
                                // 如果用户当前正在操作(有表格行被选中), 退出流程, 不刷新页面

                                return;
                            }

                            // 刷新页面
                            this.refreshEmailList(null, true);
                            // this.refreshEmailList();
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
            // ws_receive_mail() {
            //     this.mailTableData = this.getMailTableData(this.currentPersonId);
            // },
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
                                // subItem.successFlag = String(val.messageCode);
                                this.$set(subItem, 'successFlag', String(val.messageCode));
                                if (val.mailSendErrorMsg && val.messageCode === 0) {
                                    // subItem.mailSendErrorMsg = val.mailSendErrorMsg;
                                    this.$set(subItem, 'mailSendErrorMsg', val.mailSendErrorMsg);
                                }
                            }
                            return subItem;
                        });
                    }
                    console.log('邮件箱收到了邮件发送状态的通知-------', val);
                }
            },
            currentUntreatedTab: {
                handler(val) {
                    const avatarList = [
                        {
                            value: 0,
                            label: this.$t('mail.undocumented')
                        },
                        {
                            value: 1,
                            label: this.$t('mail.public_customers')
                        },
                        {
                            value: 2,
                            label: this.$t('mail.my_customers')
                        },
                        {
                            value: 3,
                            label: this.$t('mail.other_customers')
                        },
                        {
                            value: 4,
                            label: this.$t('mail.public_leads')
                        },
                        {
                            value: 5,
                            label: this.$t('mail.my_leads')
                        },
                        {
                            value: 6,
                            label: this.$t('mail.other_leads')
                        }
                    ];
                    let temp = [];
                    switch (val) {
                        case 'customer':
                            temp = avatarList.filter(item => item.value !== 0);
                            break;
                        case 'undocumented':
                            temp = avatarList.filter(item => item.value === 0);
                            break;
                        case 'all':
                        default:
                            temp = avatarList;
                    }
                    const tempFilterOptions = this.config_tableFilter.mailStatusFilter.allList.slice();
                    this.config_tableFilter = {
                        // 新增"邮件状态筛选", 不在表格中显示, 只做筛选用
                        mailStatusFilter: {
                            sort: false,
                            filter: true,
                            filterType: 'selectSingle',
                            query: '',
                            allList: tempFilterOptions
                        },
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
                            query: [(Date.now() - 3600 * 1000 * 24 * 30), Date.now()],
                            allList: null
                        }
                    };
                    this.$store.commit('setCurrentPage', 1);
                    this.mailTableData = this.getMailTableData(this.currentPersonId);
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
                        case '7':
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
                showControl: false, // 控制显示全部完成弹窗的阈值
                loading: true,
                handleLoading: false,
                accountList: [{
                    id: '',
                    account: this.$t('mail.accountPlh')
                }],
                mailBoxType: '',
                customFolders: [], // 自定义文件夹列表
                keyword: this.$store.state.mail.themeKey, // 关键词
                pageSize: 50,
                replyFlag: false, // 是否禁用回复
                forwardFlag: false, // 是否禁用转发
                mergeFlag: false, // 是否禁用归并
                signFlag: false, // 是否禁用标记
                moveFlag: false, // 是否禁用移动到文件夹功能
                // 表格
                mailTableData: [],
                // 邮件相关状态 -1待发送 1未回复 2已回复 3发送失败 4邮件已打开 5已取消
                // 100未读、101星标、102待处理、103带附件 104已转发、105内部转发、106已内部转发、107已归档 108邮件未打开 108邮件未打开 109对方已回复
                mailStatusFilterOptions: [
                    {
                        mailBoxType: '0',
                        mailBoxName: 'inbox',
                        filterOptions: [
                            {
                                label: this.$t('mail.unread'),
                                value: 100
                            },
                            {
                                label: this.$t('mail.start'),
                                value: 101
                            },
                            {
                                label: this.$t('mail.untreated'),
                                value: 102
                            },
                            {
                                label: this.$t('mail.hasAttachment'),
                                value: 103
                            },
                            {
                                label: '未回复',
                                value: 1
                            },
                            {
                                label: '已回复',
                                value: 2
                            }
                            // {
                            //     label: this.$t('mail.alreadForward'),
                            //     value: 104
                            // },
                            // {
                            //     label: this.$t('mail.forwarding'),
                            //     value: 105
                            // },
                            // {
                            //     label: this.$t('mail.forwardedInternally'),
                            //     value: 106
                            // },
                            // {
                            //     label: this.$t('mail.alreadarchiveToCRM'),
                            //     value: 107
                            // }
                        ]
                    },
                    {
                        mailBoxType: '4',
                        mailBoxName: 'sentBox',
                        filterOptions: [
                            {
                                label: this.$t('mail.unread'),
                                value: 100
                            },
                            {
                                label: this.$t('mail.start'),
                                value: 101
                            },
                            {
                                label: this.$t('mail.untreated'),
                                value: 102
                            },
                            {
                                label: this.$t('mail.hasAttachment'),
                                value: 103
                            },
                            {
                                label: '发送失败',
                                value: 3
                            },
                            {
                                label: this.$t('mail.noOpen'),
                                value: 108
                            },
                            {
                                label: '邮件已打开',
                                value: 4
                            }
                            // {
                            //     label: this.$t('mail.alreadReply'),
                            //     value: 109
                            // }
                        ]
                    },
                    {
                        mailBoxType: '7',
                        mailBoxName: 'grpupBox',
                        filterOptions: [
                            {
                                label: this.$t('mail.unread'),
                                value: 100
                            },
                            {
                                label: this.$t('mail.start'),
                                value: 101
                            },
                            {
                                label: this.$t('mail.untreated'),
                                value: 102
                            },
                            {
                                label: this.$t('mail.hasAttachment'),
                                value: 103
                            },
                            {
                                label: '待发送',
                                value: -1
                            },
                            {
                                label: '已取消',
                                value: 5
                            },
                            {
                                label: '发送失败',
                                value: 3
                            },
                            {
                                label: this.$t('mail.noOpen'),
                                value: 108
                            },
                            {
                                label: '邮件已打开',
                                value: 4
                            }
                            // {
                            //     label: this.$t('mail.alreadReply'),
                            //     value: 109
                            // }
                        ]
                    },
                    {
                        mailBoxType: '-1',
                        mailBoxName: 'others',
                        filterOptions: [
                            {
                                label: this.$t('mail.unread'),
                                value: 100
                            },
                            {
                                label: this.$t('mail.start'),
                                value: 101
                            },
                            {
                                label: this.$t('mail.untreated'),
                                value: 102
                            },
                            {
                                label: this.$t('mail.hasAttachment'),
                                value: 103
                            },
                            {
                                label: '未回复',
                                value: 1
                            },
                            {
                                label: '已回复',
                                value: 2
                            },
                            // {
                            //     label: this.$t('mail.alreadForward'),
                            //     value: 104
                            // },
                            // {
                            //     label: this.$t('mail.forwarding'),
                            //     value: 105
                            // },
                            // {
                            //     label: this.$t('mail.forwardedInternally'),
                            //     value: 106
                            // },
                            // {
                            //     label: this.$t('mail.alreadarchiveToCRM'),
                            //     value: 107
                            // },
                            {
                                label: '待发送',
                                value: -1
                            },
                            {
                                label: '已取消',
                                value: 5
                            },
                            {
                                label: '发送失败',
                                value: 3
                            },
                            {
                                label: this.$t('mail.noOpen'),
                                value: 108
                            },
                            {
                                label: '邮件已打开',
                                value: 4
                            }
                            // {
                            //     label: this.$t('mail.alreadReply'),
                            //     value: 109
                            // }
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
                        query: [],
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
                    date: this.groupBoxId ? this.$t('mail.mailTable.title7') : this.$t('mail.time'),
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
                isMergeredMailList: [], // 被归并到客户箱的邮件列表
                emails: [], // 当前页面所有邮件地址列表
                crmEmails: [], // 当前页建档的邮箱列表

                currentPageNum: this.currentPage, // 当前页码

                currentUntreatedTab: 'all', // 待处理箱体目前选中的tab
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

                // 记录左侧邮件列表滚动条相关
                scrollTop: 0,
                isInView: false,
                beforeIndex: -1,

                /* 邮件归档至 CRM */
                // 归档弹框 visible
                visibleArchive: false,
                // 归档类型, 1 || 3 (customer || inquiry)
                archiveObjectType: 0,

                // "表格页刷新时详情页不刷新"标识, 令触发自动更新时只刷新列表不刷新详情
                retainMailId: null,
                // 新增弹窗相关
                littleDrawerVisible: false,
                currentMailInfo: {},
                currentMailId: '',
                defaultProps: {
                    children: 'list'
                },
                expandedIdList: [],
                enforceRulesLoading: false, // 手动执行规则的确认按钮loading
                sendReceiveRulesModel: false // 手动执行规则确认弹窗状态
            };
        },
        created() {
            if (Object.keys(this.$store.state.mail.config_tableFilter).length > 0) {
                this.config_tableFilter = { ...this.$store.state.mail.config_tableFilter };
            }
            if (this.currentBox === 'search') {
                this.empty_query();
            }
            if (!this.currentPersonId) {
                this.$store.commit('set_currentPersonId', this.userId);
            }
            this.getAccountList();
            this.getPageSize();
            // this.init();

            // 获取 下拉选项数据 子组件有用到 更新下
            this.$store.dispatch('getSelectOptions');
            // 获取crm 授权字段
            this.get_columns_authorized();
        },
        mounted() {
            this.lang = Vue.config.lang;
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
                        filterCons.forEach(item => {
                            if (this.config_tableFilter[item.key]) {
                                this.$set(this.config_tableFilter[item.key], 'query', item.val);
                            }
                        });
                    } else {
                        // 参数错误
                        this.$Message.error(this.$t('crm.InqSet.error_params'));
                    }
                }

                this.get_update_tree();
            });
        },
        beforeDestroy() {
            this.$store.commit('set_mail_config', { ...this.config_tableFilter });
        },
        methods: {
            ...mapActions(['getUnreadMail']),
            handleReadModeSet(value) {
                this.$emit('handleReadModeSet', value);
            },
            sureBtn() {
                // 弹窗消失
                this.showControl = false;
                // 全部标为已完成的方法
                this.changeFinishedAll();
            },
            /* 刷新邮件列表 */
            refreshEmailList(mailObject, retainSelectedMails) {
                this.$store.commit('setCurrentPage', 1);
                this.$store.commit('set_currentPersonId', this.userId);
                this.init(retainSelectedMails);
                this.getDifferentToDoCount(this.currentPersonId);
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
                            this.pageSize = 50;
                            this.addPageSize();
                            this.$store.dispatch('getUnreadMail');
                            this.mailTableData = this.getMailTableData(this.currentPersonId);
                        } else {
                            const size = parseInt(res.data.data.value);
                            this.pageSize = size;
                            // this.$store.commit('setPageSize', size);
                            this.$store.dispatch('getUnreadMail');
                            this.mailTableData = this.getMailTableData(this.currentPersonId);
                        }
                    } else {
                        this.pageSize = 50;
                        this.$store.dispatch('getUnreadMail');
                        this.mailTableData = this.getMailTableData(this.currentPersonId);
                    }
                }).catch(() => {
                    this.pageSize = 50;
                    this.$store.dispatch('getUnreadMail');
                    this.mailTableData = this.getMailTableData(this.currentPersonId);
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
                    this.mailTableData = this.getMailTableData(this.currentPersonId);
                });
            },
            // 切换邮箱
            TabEmail(user) {
                this.untreatedCustomerCount = 0;
                this.untreatedUndocumentedCount = 0;
                this.$store.commit('setCurrentPage', 1);
                this.$store.commit('set_currentPersonId', user[0].id);
                this.mailTableData = this.getMailTableData(this.currentPersonId);
                this.$store.dispatch('getUnreadMail');
                this.getDifferentToDoCount(this.currentPersonId);
            },

            /** 初始化页面 */
            init(retainSelectedMails) {
                setTimeout(() => {
                    this.$store.dispatch('getUnreadMail');
                    this.mailTableData = this.getMailTableData(this.currentPersonId, null, retainSelectedMails, retainSelectedMails);
                }, 0);
                this.getAccountList();
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
                                            item.contactsName = currentMail.contactsName || handleMailAddress(tempEmail);
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
                                        if (item.recieverCrmFlag !== currentMail.type) {
                                            item.recieverCrmFlag = currentMail.type;
                                            this.updateCrmFlag(currentMail, currentMail.type);
                                        }
                                    }
                                } else {
                                    const tempEmail = item.sender;
                                    currentMail = this.crmEmails.find(subItem => subItem.email === this.getStandardEmail(tempEmail));
                                    if (currentMail && currentMail.type) {
                                        if (currentMail.type !== 0) {
                                            item.companyName = currentMail.companyName || '';
                                            item.contactsName = currentMail.contactsName || handleMailAddress(tempEmail);
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
                                        if (item.mailCrmFlag !== currentMail.type) {
                                            item.mailCrmFlag = currentMail.type;
                                            this.updateCrmFlag(currentMail, currentMail.type);
                                        }
                                    }
                                }
                            });
                        } else {
                            console.error('获取邮件小人头状态失败');
                        }
                    }).catch(err => {
                        console.error(err);
                    });
                }

                function handleMailAddress(mailAdd) {
                    let startIndex = 0;
                    let endIndex = -1;
                    if (mailAdd && mailAdd.lastIndexOf('<') > 0) {
                        endIndex = mailAdd.lastIndexOf('<');
                    } else if (mailAdd && mailAdd.lastIndexOf('@') > 0) {
                        endIndex = mailAdd.lastIndexOf('@');
                    } else {
                        endIndex = mailAdd && mailAdd.length;
                    }
                    if (mailAdd && mailAdd.lastIndexOf('<') === 0) {
                        startIndex = 1;
                    }
                    mailAdd = mailAdd && mailAdd.slice(startIndex, endIndex);
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
                        createUserId: this.currentPersonId,
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
            /** 搜索关键词改变 */
            changeKeyword(keyword) {
                this.keyword = keyword.trim();
            },

            /** 收信 调用父组件方法 */
            receiveMail() {
                this.$emit('receiveMail');
            },
            /** 获取邮箱账号列表 */
            getAccountList() {
                this.accountList = [
                    {
                        id: '',
                        account: this.$t('mail.accountPlh')
                    }
                ];
                util.ajaxMail({
                    url: `/mail/mailAccounts/user/${this.orgId}/${this.userId}`,
                    method: 'GET'
                }).then(response => {
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
                }).catch(() => {
                    this.$Message.error('邮箱账号列表获取失败,请刷新后重试');
                });
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
                    // this.$store.commit('setPageSize', this.pageSize);
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
                    accountId: this.currentAccount.join(',') === this.$t('mail.accountPlh') ? [] : this.currentAccount,
                    userId: this.currentPersonId,
                    pageNumber: this.page,
                    PageSize: this.pageSize,
                    searchType: this.searchType,
                    searchContent: this.themeKey
                };
                const query = this.handleQuerys();
                postData = Object.assign(postData, query);
                util.ajax({
                    url: '/es/api/mail/search',
                    method: 'post',
                    data: postData
                }).then(({ data }) => {
                    this.total = data.totalElements;
                    const ids = Array.isArray(data.list) ? data.list.map(item => item.id) : [];
                    if (ids.length > 0) {
                        this.getSearchDetails(ids);
                    } else {
                        this.loading = false;
                        this.handle_search_data([], result);
                        this.mailTableData = result;
                    }
                }).catch(err => {
                    this.loading = false;
                    this.handle_search_data([], result);
                    this.mailTableData = result;
                });
            },
            /* 获取搜索页列表的邮件部分字段的信息，如已回复状态，追踪信息，主题等等，显示在列表页 */
            getSearchDetails(ids) {
                const result = [];
                util.ajaxJson({
                    url: '/mail/getMailProperty',
                    method: 'post',
                    data: {
                        enterpriseId: this.orgId,
                        mailIds: ids
                    }
                }).then((res) => {
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
                }).catch(err => {
                    this.loading = false;
                    this.handle_search_data([], result);
                    this.mailTableData = result;
                });
            },
            /** 获取并处理邮箱列表数据 */
            getMailTableData(userPersonId, isUpdateDetail = false, isKeepScroll = false, retainSelectedMails = false, excludeIds) {
                // 记录当前滚动条位置
                this.scrollTop = isKeepScroll ? this.$refs.mailListContainer.scrollTop : 0;
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
                        if (this.groupBoxId) {
                            this.mailBoxType = '7';
                        } else {
                            this.mailBoxType = this.currentBox;
                        }
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
                    accountIds: this.currentAccount[0] === this.$t('mail.accountPlh') ? [] : this.currentAccount,
                    mailBoxTypeId: this.mailBoxType,
                    page: this.page,
                    size: this.pageSize,
                    mailToDoFlag: this.currentBox === 'untreated' ? 1 : '',
                    mailCrmFlags: this.currentBox === 'untreated' ? crmFlags : [],
                    recieverCrmFlags: this.currentBox === 'untreated' ? crmFlags : [],
                    excludeIds: excludeIds || []
                };
                if (this.groupBoxId) {
                    postData.groupNo = this.groupBoxId;
                }
                const query = this.handleQuerys();
                postData = Object.assign(postData, query);
                if (query.mailCrmFlags && !query.mailCrmFlags.length && crmFlags.length) {
                    postData.mailCrmFlags = crmFlags;
                    postData.recieverCrmFlags = crmFlags;
                }
                /* 按标签查询 this.mailBoxType 是 'tag_2'的形式 */
                if (this.mailBoxType.indexOf('tag_') !== -1) {
                    postData = Object.assign({
                        mailLabelId: this.mailBoxType.split('_')[1]
                    }, postData);
                }
                const data = [];
                if (this.currentBox === 'unreadBox') {
                    postData.mailReadFlag = '0';
                }
                if (this.currentBox === 'star_box') {
                    postData.mailStarFlag = '1';
                }
                this.$store.commit('set_mail_detail_params', postData);

                // 如果要求"刷新时保留原勾选项", 说明是本次刷新表格页属于"收到新邮件自动刷新", 此时只刷新左侧列表, 不刷新右侧详情页
                this.retainMailId = retainSelectedMails ? (this.selectedMailId || null) : null;

                // 请求表格数据
                util.ajaxMailJson({
                    url: '/mail/mailBoxsAndLabel',
                    method: 'POST',
                    data: postData
                })
                    .then(response => {
                        this.loading = false;
                        if (response.data.code === 1) {
                            this.currentPageNum = this.currentPage;
                            this.total = response.data.data.totalElements;
                            if (this.currentBox === 'unreadBox') {
                                this.totalUnread = response.data.data.totalElements;
                            } else if (this.currentBox === 'untreated') {
                                this.getDifferentToDoCount(this.currentPersonId);
                            }
                            if (!response.data.data.content.length && this.currentPage > 1) {
                                this.$store.commit('setCurrentPage', this.currentPage - 1);
                                this.mailTableData = this.getMailTableData(this.currentPersonId, isUpdateDetail);
                            }
                            this.handle_table_data(response.data.data.content, data);

                            /* 需求修改, 暂时不需要"刷新列表后保存列表选中项"功能, 先注释掉, 同时, retain 参数还要用作其他用处, 先不去掉参数相关逻辑 */
                            // // 暂存选中项
                            // const prevSelectedMailIds = this.selectMailIds.slice();
                            // 清空选中项
                            this.emptySelection();
                            // // 如果形参指定了要保留选中项, 则从之前选中项中筛选仍存在于列表的邮件并选中
                            // if (retainSelectedMails) {
                            //     this.handle_select_mails(prevSelectedMailIds);
                            // }

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
                                    if (this.beforeIndex !== -1 && this.currentBox !== 'draftBox') {
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
                    })
                    .catch((err) => {
                        console.error(err);
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
                    const selectedMailBoxType = this.getMailBox(item.mailBoxTypeId);
                    this.$store.commit('setSelectMailBoxType', selectedMailBoxType);
                    if (this.currentBox === 'draftBox' || selectedMailBoxType === 'draftBox') {
                        if (this.currentPersonId === this.userId) {
                            const obj = {};
                            obj.mailEdit = true;
                            obj.mailId = item.id;
                            obj.selectedMailBoxType = selectedMailBoxType;
                            localStorage.setItem('leadsCloud-writeMailData', JSON.stringify(obj));
                            // 当前页面打开邮件页面
                            this.$emit('getModalWidth');
                            this.$emit('update:mailModelVisible', true);
                        }
                    } else {
                        // this.$emit('handleView', 'MailDetail');
                    }
                });
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
            /** 处理筛选条件 */
            handleQuerys() {
                let result = {};
                for (const key in this.config_tableFilter) {
                    if (!this.config_tableFilter.hasOwnProperty(key)) continue;
                    if (this.config_tableFilter[key].query && this.config_tableFilter[key].query.length) {
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
                                if (this.currentBox !== 'search') {
                                    result = Object.assign(result, {
                                        sendStartDate: this.config_tableFilter[key].query[0] ? this.dateFormat('yyyy-MM-dd', this.config_tableFilter[key].query[0]) : '',
                                        sendEndDate: this.config_tableFilter[key].query[1] ? this.dateFormat('yyyy-MM-dd', this.config_tableFilter[key].query[1]) : ''
                                    });
                                }
                                break;
                            case 'mailStatusFilter':
                                // 邮件状态是否被选中, 传值为 0--未回复；1--已回复；2--发送失败；3--邮件被打开
                                // 邮件相关状态 -1待发送 1未回复 2已回复 3发送失败 4邮件已打开 5已取消
                                // 100未读、101星标、102待处理、103带附件 104已转发、105内部转发、106已内部转发、107已归档 108邮件未打开 108邮件未打开 109对方已回复
                                queryValue = this.config_tableFilter[key].query.map(item => item.value)[0];
                                switch (queryValue) {
                                    case -1:
                                        temp.mailSuccessFlag = '-1';
                                        break;
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
                                    case 5:
                                        temp.mailSuccessFlag = '4';
                                        break;
                                    case 100:
                                        temp.mailReadFlag = '0';
                                        break;
                                    case 101:
                                        temp.mailStarFlag = '1';
                                        break;
                                    case 102:
                                        temp.mailToDoFlag = '1';
                                        break;
                                    case 103:
                                        temp.mailAttachmentFlag = '1';
                                        break;
                                    // case 104:
                                    //     temp.mailSuccessFlag = '4';
                                    //     break;
                                    // case 105:
                                    //     temp.mailAnsweredFlag = '1';
                                    //     break;
                                    // case 106:
                                    //     temp.mailSuccessFlag = '0';
                                    //     break;
                                    // case 107:
                                    //     temp.mailOpenFlag = '1';
                                    //     break;
                                    case 108:
                                        temp.mailOpenFlag = '0';
                                        break;
                                    // case 109:
                                    //     temp.mailSuccessFlag = '4';
                                    //     break;
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
                this.mailTableData = this.getMailTableData(this.currentPersonId);
            },
            // filterTags 组件内部修改筛选值后触发的方法, 由下方的 updateList 改造而成
            change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    this.$store.commit('setCurrentPage', 1);
                    this.mailTableData = this.getMailTableData(this.currentPersonId);
                } else {
                    this.remove_filter_tag(key);
                }
            },
            /* 初始化筛选配置 */
            empty_query() {
                const tempFilterOptions = this.config_tableFilter.mailStatusFilter.allList.slice();
                this.config_tableFilter = {
                    // 新增"邮件状态筛选", 不在表格中显示, 只做筛选用
                    mailStatusFilter: {
                        sort: false,
                        filter: true,
                        filterType: 'selectSingle',
                        query: '',
                        allList: tempFilterOptions
                    },
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
                        query: [],
                        allList: null
                    }
                };
            },
            /* 邮件搜索数据处理 */
            handle_search_data(mailList, setData) {
                mailList = mailList.map(item => {
                    const mailTo = this.getMailNickName(item.mailTo[0] === '[' && item.mailTo[item.mailTo.length - 1] === ']' ? JSON.parse(item.mailTo) : item.mailTo.split(','));
                    const mailSender = this.getMailNickName([item.mailFrom]);
                    const mailInfo = {
                        id: item.id,
                        mailBoxTypeId: item.mailBoxTypeId,
                        theme: item.mailSubject === '' ? this.$t('mail.writeLetter.noSubject') : item.mailSubject,
                        handledtheme: this.$dym.highLightKeyWordsInArray(item.mailSubject, this.themeKey),
                        sender: item.mailFrom,
                        // sender: item.mailFrom.replace(/&#44;/g, ','), // 发件人带有英文逗号的处理
                        handledsender: this.$dym.highLightKeyWordsInArray(mailSender, this.themeKey),
                        recipient: item.mailTo[0] === '[' && item.mailTo[item.mailTo.length - 1] === ']' ? JSON.parse(item.mailTo) : item.mailTo.split(','),
                        // recipient: recipientArr,
                        handledrecipient: this.$dym.highLightKeyWordsInArray(mailTo, this.themeKey),
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
                        recentOpenTime: item.recentOpenTime ? item.recentOpenTime.substr(0, 19) : '', // 追踪气泡中最近打开时间
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
                        forwardFlag: item.forwardFlag, // 是否已转发
                        archiveFlag: item.archiveFlag, // 是否归档
                        oppositeAnsweredFlag: item.oppositeAnsweredFlag, // 对方已回复
                        mailInterForwardingFlag: item.mailInterForwardingFlag, // 邮件是否来自于内部转发 0---不是 1---是
                        mailForwardedInternallyFlag: item.mailForwardedInternallyFlag // 邮件是否已被内部转发 0---否  1---是
                    };
                    /* 此处注意：今天的邮件包含当天以及将来的邮件 */
                    setData.push(mailInfo);
                    return mailInfo;
                });
                this.getCurrentPageEmails(mailList);
                this.getCompanyStatusByEmails();
                this.loading = false;
            },
            /* 获取当前页面所有的邮件地址 */
            getCurrentPageEmails(data) {
                this.emails = [];
                data.forEach(item => {
                    if (item.fromOrToFlag && item.recipient[0]) {
                        if (this.getStandardEmail(item.recipient[0])) {
                            this.emails.push(item.recipient[0]);
                        }
                    } else if (item.sender) {
                        if (this.getStandardEmail(item.sender)) {
                            this.emails.push(item.sender);
                        }
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
                        shortName: '', // 邮箱对应的客户名称
                        forwardFlag: mailList[i].forwardFlag, // 是否已转发
                        archiveFlag: mailList[i].archiveFlag, // 是否归档
                        oppositeAnsweredFlag: mailList[i].oppositeAnsweredFlag, // 对方已回复
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
                        }).then(response => {
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
                                this.mailTableData = this.getMailTableData(
                                    this.currentPersonId,
                                    null,
                                    null,
                                    null,
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
                        this.mailTableData = this.getMailTableData(this.currentPersonId);
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
                }).then(response => {
                    if (response.data.code === 1) {
                        this.emptySelection();
                        this.$store.dispatch('getUnreadMail');
                        this.loading = true;
                        setTimeout(() => {
                            this.mailTableData = this.getMailTableData(this.currentPersonId);
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
            // 邮件详情页触发'已读/未读'状态变更
            mailReadStateChanged(flag) {
                if (this.selectedMailIndex !== -1) {
                    this.$set(this.mailTableData, this.selectedMailIndex, Object.assign(this.mailTableData[this.selectedMailIndex], {fav: flag}));
                }
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
                            this.mailTableData = this.getMailTableData(this.currentPersonId);
                        }, 1000);
                        this.$Message.success(this.$t('mail.markAsFinishedAllSuccess'));
                    } else {
                        this.$Message.error(this.$t('mail.markAsFinishedAllError'));
                    }
                }).catch((error) => {
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
                            this.$Message.success('草稿箱/已删除/垃圾箱的邮件不支持星标操作！');
                        }
                        if (!isFlag && this.currentBox === 'star_box') {
                            if (ids.length === this.mailTableData.length) {
                                this.$store.commit('setCurrentPage', this.currentPage - 1);
                            }
                        }
                        // 这里暂且用 arr.length === 1 来判断"是左侧邮件条目向上 $emit", 而不是"批量选中邮件", 不一定准确
                        this.loading = true;
                        setTimeout(() => {
                            this.mailTableData = this.getMailTableData(this.currentPersonId, false, arr.length === 1);
                        }, 1000);
                        this.emptySelection();
                    }).catch(() => {
                        this.$Message.error(this.$t('mail.flag_star_error'));
                    });
                } else {
                    this.$Message.success('草稿箱/已删除/垃圾箱的邮件不支持星标操作！');
                    this.mailTableData = this.getMailTableData(this.currentPersonId);
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
            /** 移动到自定义文件夹,如果是搜索页, 要将已删除/垃圾箱/草稿箱邮件排除 */
            moveTo(name) {
                if (name === -1) {
                    return false;
                }
                if (this.selectMailList.length === 0) {
                    this.$Message.warning(this.$t('mail.noMailSelectedTip'));
                } else if (this.currentBox === 'star_box' ||
                    this.currentBox === 'search' ||
                    this.currentBox === 'unreadBox' ||
                    this.currentBox === 'untreated' ||
                    this.currentBox.indexOf('tag') === 0) {
                    this.starBoxMove(name);
                } else {
                    util.ajaxMailJson({
                        url: '/mail/moveMailBoxTypeId',
                        method: 'PUT',
                        data: {
                            enterpriseId: this.orgId,
                            originalMailBoxTypeId: this.mailBoxType,
                            destinationMailBoxTypeId: name,
                            mailBoxIds: this.selectMailIds,
                            updateUserId: this.userId,
                            updateUserName: this.userName
                        }
                    }).then(response => {
                        if (response.data.code === 1) {
                            this.$Message.success(this.$t('mail.moveSuccTip'));
                            if (this.selectMailIds.length === this.mailTableData.length) {
                                this.$store.commit('setCurrentPage', this.currentPage - 1);
                            }
                            // 移动到自定义文件夹过滤数据ids
                            this.mailTableData = this.getMailTableData(
                                this.currentPersonId,
                                null,
                                null,
                                null,
                                this.selectMailIds
                            );
                            this.emptySelection();
                        } else {
                            this.$Message.error('移动到自定义文件夹失败，请刷新后重试');
                        }
                    }).catch(() => {
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
                                this.$Message.success('草稿箱/已删除/垃圾箱的邮件不支持移动到自定义文件夹操作！');
                            }
                            this.mailTableData = this.getMailTableData(this.currentPersonId);
                            this.emptySelection();
                        } else {
                            this.$Message.error('移动到自定义文件夹失败，请刷新后重试');
                        }
                    }).catch(() => {
                        this.$Message.error('移动到自定义文件夹失败，请刷新后重试');
                    });
                } else {
                    this.$Message.success('草稿箱/已删除/垃圾箱的邮件不支持移动到自定义文件夹操作！');
                    this.emptySelection();
                    this.mailTableData = this.getMailTableData(this.currentPersonId);
                }
            },
            /* 删除，删除确认弹窗 */
            handleDelete() {
                if (this.selectMailList.length !== 0) {
                    // 只有垃圾箱、已删除箱才显示二次确认框，其他箱体内容直接转移到已删除箱
                    if (this.currentBox === 'dustbin' || this.currentBox === 'trash') {
                        this.deleteModel = true;
                        this.getMergeredMailList();
                    } else {
                        this.remove();
                    }
                } else {
                    this.$Message.warning(this.$t('mail.noMailSelectedTip'));
                }
            },
            /* 查询当前邮件是否归并到客户箱 */
            getMergeredMailList() {
                util.ajaxMailParamsSerializer({
                    url: '/mail/isMergered',
                    method: 'GET',
                    params: {
                        mailBoxIds: this.selectMailIds
                    }
                }).then(response => {
                    if (response.data.code === 1) {
                        this.isMergeredMailList = response.data.data;
                    } else {
                        this.isMergeredMailList = [];
                    }
                }).catch(() => {
                    this.isMergeredMailList = [];
                });
            },
            refreshTableList() {
                if (this.mailReadingMode === 2) {
                    this.updateTable();
                    return;
                }
                if (this.mailBoxType === 'customerBox') {
                    this.$emit('handleView', 'CustomerTable');
                } else {
                    this.$emit('handleView', 'MailTable');
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
                }).then(response => {
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
                        // this.refreshTableList()
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
                        this.mailTableData = this.getMailTableData(
                            this.currentPersonId,
                            null,
                            null,
                            null,
                            this.selectMailIds
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
                if (this.currentBox === 'star_box' ||
                    this.currentBox === 'search' ||
                    this.currentBox === 'unreadBox' ||
                    this.currentBox === 'untreated' ||
                    this.currentBox.indexOf('tag') === 0) {
                    this.moveToDustbin(this.selectMailBoxTypeIds, this.selectMailIds);
                } else {
                    util.ajaxMailJson({
                        url: '/mail/moveMailBoxTypeId',
                        method: 'PUT',
                        data: {
                            enterpriseId: this.orgId,
                            originalMailBoxTypeId: this.mailBoxType,
                            destinationMailBoxTypeId: '3',
                            mailBoxIds: this.selectMailIds,
                            updateUserId: this.userId,
                            updateUserName: this.userName
                        }
                    }).then(response => {
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
                            this.mailTableData = this.getMailTableData(
                                this.currentPersonId,
                                null,
                                null,
                                null,
                                this.selectMailIds
                            );
                            // 清空数据
                            this.emptySelection();
                        } else {
                            this.$Message.error(this.$t('mail.deleteErrorTip'));
                        }
                    }).catch(() => {
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
                    util.ajaxMailJson({
                        url: '/mail/moveStarMailBox',
                        method: 'put',
                        data: {
                            destinationMailBoxTypeId: '3',
                            mailMap,
                            updateUserId: this.userId,
                            updateUserName: this.userName
                        }
                    }).then(res => {
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
                            // 星标箱、未读箱、待处理移动至已删除箱过滤数据 ids
                            this.mailTableData = this.getMailTableData(
                                this.currentPersonId,
                                null,
                                null,
                                null,
                                this.selectMailIds
                            );
                            // 清空
                            this.emptySelection();
                            this.$store.dispatch('getUnreadMail');
                        } else {
                            this.$Message.error(this.$t('mail.deleteErrorTip'));
                        }
                    }).catch(() => {
                        this.$Message.error(this.$t('mail.deleteErrorTip'));
                    });
                } else {
                    this.deleteModel = false;
                    this.$Message.warning('已删除/垃圾箱的邮件不支持在此页面的删除操作！');
                    this.emptySelection();
                    this.$store.dispatch('getUnreadMail');
                    this.mailTableData = this.getMailTableData(this.currentPersonId);
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
                                await this.$Message.success('草稿箱/已删除/垃圾箱的邮件不支持标记标签操作！');
                            }
                            this.mailTableData = this.getMailTableData(this.currentPersonId);
                            this.emptySelection();
                            await this.$Message.success('成功设置邮件标签');
                        } else {
                            this.$Message.error('设置邮件标签失败，请刷新后重试');
                        }
                    }).catch(() => {
                        this.$Message.error('设置邮件标签失败，请刷新后重试');
                    });
                } else {
                    this.$Message.success('草稿箱/已删除/垃圾箱的邮件不支持标记标签操作！');
                    this.mailTableData = this.getMailTableData(this.currentPersonId);
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
                                await this.$Message.warning('草稿箱/已删除/垃圾箱的邮件不支持标记标签操作！');
                            }
                            this.mailTableData = this.getMailTableData(this.currentPersonId);
                            this.emptySelection();
                            await this.$Message.success('成功设置邮件标签');
                        } else {
                            this.$Message.error('设置邮件标签失败，请刷新后重试');
                        }
                    }).catch(() => {
                        this.$Message.error('设置邮件标签失败，请刷新后重试');
                    });
                } else {
                    this.$Message.success('草稿箱/已删除/垃圾箱的邮件不支持标记标签操作！');
                    this.mailTableData = this.getMailTableData(this.currentPersonId);
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
                    util.ajaxJson({
                        url: '/mail/reductionMailBoxTypeId',
                        method: 'PUT',
                        data: {
                            enterpriseId: this.orgId,
                            updateUserId: this.userId,
                            updateUserName: this.userName,
                            mailBoxTypeConditionList: paramsList
                        }
                    }).then(response => {
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
                            this.mailTableData = this.getMailTableData(
                                this.currentPersonId,
                                null,
                                null,
                                null,
                                this.selectMailIds
                            );
                            // 清空
                            this.emptySelection();
                        } else {
                            this.$Message.error(this.$t('mail.restoreErrorTip'));
                        }
                    }).catch(() => {
                        this.$Message.error(this.$t('mail.restoreErrorTip'));
                    });
                } else {
                    this.$Message.warning(this.$t('mail.noMailSelectedTip'));
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
                        setTimeout(() => {
                            this.mailTableData = this.getMailTableData(this.currentPersonId, false, true);
                        }, 1000);
                    } else {
                        this.$Message.error(this.$t('mail.deleteErrorTip'));
                    }
                }).catch(() => {
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
                util.ajaxMailJson({
                    url: 'mail/batchRecoverMailBoxTypeId',
                    method: 'PUT',
                    data: {
                        updateUserId: this.userId,
                        updateUserName: this.userName,
                        mailBoxTypeConditionList: paramsList
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        this.$Message.success(this.$t('mail.moveRestoreSuccTip'));
                        if (paramsList.length === this.mailTableData.length) {
                            this.$store.commit('setCurrentPage', this.currentPage - 1);
                        }
                        // 还原过滤数据 ids
                        this.mailTableData = this.getMailTableData(
                            this.currentPersonId,
                            null,
                            null,
                            null,
                            this.selectMailIds
                        );
                        // 清空
                        this.emptySelection();
                    } else {
                        this.$Message.error(this.$t('mail.moveRestoreErrorTip'));
                    }
                }).catch(() => {
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
                this.$store.commit('setSelectMailBoxType', this.currentBox);

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
            // 批量选中邮件
            handle_select_mails(idList) {
                // 选中仍存在于列表中的邮件
                this.selectMailList = this.mailTableData.filter(item => idList.includes(item.id));

                // 计算全选状态
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
                this.mailTableData = this.getMailTableData(this.currentPersonId);
            },
            /** 改变表格每页展示数据量 */
            pageSizeChange(size) {
                // this.$store.commit('setPageSize', size);
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
                this.mailTableData = this.getMailTableData(this.currentPersonId);
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
            /* 更新邮件列表，在 mail-home 和 MailDetail 中调用 */
            updateTable(ids = null) {
                // 记录当前打开的邮件是否在视口内
                this.isInView = (this.selectedMailIndex !== -1) && Utils.isInViewPort(this.$refs.mailListContainer.querySelector('.selected-mail-item'), this.$refs.mailListContainer);
                // 记录当前打开邮件在列表中的位置
                this.beforeIndex = this.selectedMailIndex;

                // 重新获取邮件列表和邮件详情
                this.loading = true;
                setTimeout(() => {
                    this.mailTableData = this.getMailTableData(this.currentPersonId, true, true, null, ids);
                }, 1000);
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
                                this.$Message.success(this.$t('mail.notSupportUntreatedTip1'));
                            }
                            /* 如果是将某页数据全部置为已完成，并且当前处于待处理箱，则页码自动减一，避免出现此页无数据显示的问题 */
                            if (status === 2 && this.currentBox === 'untreated') {
                                if (ids.length === this.mailTableData.length) {
                                    this.$store.commit('setCurrentPage', this.currentPage - 1);
                                }
                            }
                            // 这里暂且用 arr.length === 1 来判断"是左侧邮件条目向上 $emit", 而不是"批量选中邮件", 不一定准确
                            console.log('status =========== status:', status);
                            console.log('this.currentBox =========== this.currentBox:', this.currentBox);
                            // 标记已完成过滤数据 ids
                            let excludeIds = [];
                            if (status === 2 && this.currentBox === 'untreated') {
                                excludeIds = ids;
                            }
                            this.mailTableData = this.getMailTableData(
                                this.currentPersonId,
                                null,
                                null,
                                null,
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
                    }).catch(err => {
                        console.log('changeProcessingState()---err', err, status);
                    });
                } else {
                    this.$Message.success(this.$t('mail.notSupportUntreatedTip'));
                    this.mailTableData = this.getMailTableData(this.currentPersonId);
                    this.emptySelection();
                }
            },
            /* 获取不同场景下的邮件待处理数量 */
            getDifferentToDoCount(userPersonId) {
                util.ajaxJson({
                    url: 'mail/getMailSomeCount',
                    method: 'post',
                    data: {
                        accountIds: this.currentAccount[0] === this.$t('mail.accountPlh') ? [] : this.currentAccount,
                        createUserId: userPersonId,
                        enterpriseId: this.orgId,
                        mailToDoFlag: 1
                    }
                }).then(res => {
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
            // 邮件归档完成
            handleArchiveFinished() {
                this.emptySelection();
                this.mailTableData = this.getMailTableData(this.currentPersonId);
            },

            /* 获取内部转发的企业人员信息 --- 为全部企业人员中排除掉离职的部分 */
            get_update_tree() {
                util.ajax({
                    url: '/new-privilege/department/getDepartmentTree',
                    method: 'post',
                    data: {
                        orgId: this.orgId
                    }
                }).then(({data}) => {
                    if (data.code === '1') {
                        return new Promise(resolve => {
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
                }).then(data => {
                    util.ajaxJson({
                        url: '/new-privilege/user/getUserDataTables',
                        method: 'post',
                        data: {
                            departmentId: 0,
                            orgId: this.orgId,
                            pageNo: 1,
                            pageSize: 2000
                        }
                    }).then(({data}) => {
                        if (data.code === '1') {
                            this.mailInterForwardingUsers = data.data.list.filter(item => !item.isDelete);
                            this.mailInterForwardingTreeData = this.get_tree(this.init_tree, this.mailInterForwardingUsers);
                        } else {
                            this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                        }
                        this.loading_tree = false;
                    });
                });
            },
            /* 部门树处理函数 */
            get_tree(param_arr, user_list, check_arr) {
                const userList = user_list.map(item => {
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
                const arr = param_arr.map(item => {
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
                    return arr.map(item => {
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
                    parent_arr = parent_arr.filter(item => item.type !== 'person');
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
            renderContent(h, {data}) {
                function get_icon(str) {
                    return str === 'person' ? 'custom custom-person' : 'custom custom-group';
                }

                return h(
                    'span',
                    [
                        h(
                            'span',
                            [
                                h('Icon', {
                                    props: {
                                        custom: get_icon(data.type)
                                    },
                                    style: {
                                        marginRight: '8px',
                                        fontSize: '16px'
                                    }
                                }),
                                h('span', {
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
                                }, data.title)
                            ]
                        )
                    ]
                );
            },
            /* 部门树选中项变化 */
            change_selected_userIds() {
                const person_arr = this.$refs.update_tree.getCheckedNodes();
                this.interForwardingUsersSelected = person_arr.filter(item => item.type === 'person').map(item => {
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
                    ids = ids.filter(id => {
                        const mail = this.selectMailList.find(item => item.id === id);

                        return !(mail && mail.fromOrToFlag);
                    });
                } else {
                    this.$Message.warning(this.$t('mail.noMailSelectedTip'));
                }
                if (ids.length) {
                    this.visibleForwardSales = false;
                    /* 给一鸣：此处调用后端内部转发的接口 */
                    util.ajaxMailJson({
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
                    }).then(async res => {
                        if (res.data.code === 1) {
                            if (ids.length !== this.selectMailIds.length) {
                                await this.$Message.warning('已发箱/草稿箱邮件不支持内部转发！');
                            } else {
                                this.$Message.success('内部转发成功');
                            }
                            this.mailTableData = this.getMailTableData(this.currentPersonId);
                            this.emptySelection();
                        } else {
                            this.$Message.error('内部转发失败');
                        }
                    });
                } else {
                    this.visibleForwardSales = false;
                    this.$Message.success('已发箱/草稿箱邮件不支持内部转发！');
                    this.mailTableData = this.getMailTableData(this.currentPersonId);
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
            /* 创建客户 */
            // createCustomer(email) {
            //     if (this.currentPersonId === this.userId) {
            //         this.mailAddress = email;
            //         this.newCompanyShow = true;
            //     }
            // },
            /* 创建线索 */
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
                    this.currentMailInfo = currentMailInfo;
                    this.currentMailInfo.noReplyToEmail = noReplyToEmail;
                    this.currentMailInfo.mailAddress = email;
                    this.currentMailId = mailId;
                    this.show_company_detail = false;
                    this.show_clue_detail = false;
                    if (this.$refs.mailDetail) {
                        this.$refs.mailDetail.show_company_detail = false;
                        this.$refs.mailDetail.show_clue_detail = false;
                    }
                    // this.getClueOption(mailId);
                }
            },
            // 获取线索字段
            getClueOption(mailId) {
                this.templateList = [];
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.orgId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const showList = response.data.data.show;
                        for (const key in showList) {
                            const obj = showList[key];
                            obj.key = key;
                            obj.required = showList[key].isNeed !== 0;
                            this.templateList.push(obj);
                        }
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
                // this.newClueShow = false;
                this.clueId = clueId;
                this.showClue({ clueId, type: 1 });
                if (this.$refs.mailDetail) {
                    this.$refs.mailDetail.getAllContactsStatus();
                }
                this.getCompanyStatusByEmails();
            },
            // 录入成询盘后
            updateInquiryStatus(clueId, status) {
                // this.newClueShow = false;
                this.clueId = clueId;
                this.getInquiryAndCompanyInfoByEmails();
                this.getCompanyStatusByEmails();
            },
            //  查询当前录入询盘 的email 的crm 状态 打开客户详情页
            getInquiryAndCompanyInfoByEmails() {
                const postData = {
                    emailList: [this.mailAddress],
                    userId: this.currentBoxType === 'customerBox' || this.currentPage === 'writeMail' || this.currentPage === 'writeMailFloatWindow' ? this.userId : this.currentPersonId ? this.currentPersonId : this.userId,
                    orgId: this.orgId
                };
                util.ajaxJson({
                    url: '/crm/mailbox/getInquiryAndCompanyInfoByEmails',
                    method: 'post',
                    data: postData
                }).then((response) => {
                    if (response.data.code === '1') {
                        const companyId = response.data.data[this.mailAddress].companyId;
                        this.showCompany({
                            companyId,
                            type: 1
                        });
                    }
                });
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
                this.littleDrawerVisible = false;

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
                this.littleDrawerVisible = false;
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
                /* 通过接口获取最近一封已回复邮件的id */
                util.ajax({
                    url: '/mail/answerMailSkip',
                    method: 'GET',
                    params: {
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
            /* 点击已转发图标跳转至已转发邮件详情页前 */
            getLatestForward(row) {
                util.ajax({
                    url: '/mail/task/getLatestForward',
                    method: 'GET',
                    params: {
                        mailId: row.id
                    }
                }).then((res) => {
                    if (res.data.code === 1) {
                        const mailDetail = Object.assign(res.data.data, { id: row.id });
                        localStorage.setItem(
                            'leadsCloud-currentPersonId',
                            res.data.data.createUserId
                        );
                        localStorage.setItem(
                            'leadsCloud-currentAccount',
                            JSON.stringify({
                                currentAccount: this.currentAccount,
                                currentInputInfo: this.currentInputInfo,
                                currentAccountIds: this.currentAccountIds
                            })
                        );
                        const href =
                            window.location.origin +
                            window.location.pathname +
                            this.$router.resolve({
                                name: 'mail_home'
                            }).href;
                        localStorage.setItem(
                            'leadsCloud-timeLine-mailDetail',
                            JSON.stringify(mailDetail)
                        );
                        window.open(href, '_blank');
                    } else {
                        this.$Message.error(res.data.msg);
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
                        const href = window.location.origin + window.location.pathname + this.$router.resolve({
                            name: 'mail_home'
                        }).href;
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
            // 关闭弹窗
            littleDrawerHidden(val) {
                this.littleDrawerVisible = val;
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
                        this.mailTableData = this.getMailTableData(this.currentPersonId);
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
            },
            // 回群发箱
            goGroupBox() {
                this.$emit('update:groupBoxId', 'goback');
            },
            // 取消发送
            handleCancel() {
                this.handleLoading = true;
                tableApi.mailCancel({
                    ids: this.selectMailIds,
                    updateUserId: this.userId,
                    updateUserName: this.fullName,
                    groupNo: this.groupBoxId
                }).then((res) => {
                    if (res.code === 1) {
                        this.$Message.success(this.$t('mail.cancelTipSucess'));
                        this.emptySelection();
                        this.mailTableData = this.getMailTableData(this.currentPersonId);
                    } else {
                        this.$Message.error(this.$t('mail.cancelTipError'));
                    }
                    this.handleLoading = false;
                });
            }
        }
    };
</script>

<style lang="less" scoped>
    .split-mail-table {
        position: relative;
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
            margin: 0 24px 0;
            height: 60px;

            h3 {
                display: inline-block;
                margin-right: 8px;
                font-size: 16px;
                color: rgba(0, 0, 0, 0.80);
            }

            p {
                display: inline-block;
                margin-right: 8px;
                font-size: 12px;
                color: rgba(0, 6, 15, 0.40);
            }

            .split-mail-filter-tags {
                flex: 1;
                padding: 0 10px;
            }
        }

        .keyword-limit {
            display: inline-block;
            max-width: 130px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: middle;
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
        .split-mail-table-page {
            padding: 12px 5px 10px;
            text-align: right;
            background: #fff;
            border-top:#EAEAEA solid 1px;
        }
    }

    .inter-forwarding-modal {
        padding: 10px 20px;
        font-size: 16px;
        color: rgba(0, 0, 0, .8);

        /deep/ .el-dialog {
            padding-bottom: 10px;

            .el-dialog__title {
                font-weight: 700;
            }

            .el-dialog__body {
                max-height: 65vh;
            }
        }

        /deep/ .inter-forwarding-container {
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

    .no-selected-mail {
        text-align: center;

        p {
            font-size: 12px;
            color: rgb(0, 0, 0, .4);
            margin-top: 12px;
        }
    }

    .split-mail-row {
        border-top: 1px solid #ECEEF5;
        border-bottom: 1px solid #ECEEF5;
        box-sizing: border-box;

        /deep/ .filter-panel {
            border-bottom: 1px solid #ECEEF5;
            background: #ffffff;
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

        /* 让"新收到的邮件"图标最顶部能溢出显示 */
        padding-top: 4px;
        margin-top: -4px;
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
    .move-to-folders{
        .el-tree-node__content{
            height: 36px;
            padding-right: 20px;
        }
        .el-dropdown-menu__item{
            padding:0;
        }
    }
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
