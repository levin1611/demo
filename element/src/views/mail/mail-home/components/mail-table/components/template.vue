<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-05 09:12:42
 * @LastEditTime: 2019-08-14 14:46:43
 * @LastEditors: Please set LastEditors
 -->
<template>
  <div class="mail-table-template">
        <Table
            :ref="`table${desc}`"
            :data="tableData"
            :show-header="showHeader"
            :row-class-name="rowClassName"
            :row-key="getRowKey"
            @row-click="openDetail"
            @selection-change="changeSelection"
        >
            <!--由于现有的逻辑中currentPersonId存储的数据格式不一(存在string和number两种)，所以此处使用半等 -->
            <TableColumn
                    v-if="currentBox !== 'groupBox'"
                    type="selection"
                    width="45"
                    :class-name="currentPersonId == userId || currentMailTab === 'customerBox'? '' : 'hideColumn'">
            </TableColumn>
            <TableColumn
                    v-for="(item, index) in columns"
                    :width="item.width"
                    :min-width="item.minWidth || 64"
                    :key="index"
                    :prop="item.key"
                    :type="item.type"
                    :reserve-selection="true"
                    :render-header="item.renderHeader">
                <template slot-scope="{ row, index }">
                    <div v-if="item.key === 'avatar'" style="display: flex">
                        <!-- 由询盘云发出去的邮件 -->
                        <RecipientPoptip
                            v-if="row.fromOrToFlag === 1"
                            :currentInquiryId="currentInquiryId"
                            :currentCustomerName="currentCustomerName"
                            @changeCrmFlag="changeCrmFlag"
                            @showCompany="showCompany"
                            @showClue="showClue"
                            @createClue="createClue"
                            :params="{ row, index }">
                        </RecipientPoptip>
                        <!-- 客户邮箱同步过来的数据基本都在发件箱，可移动到自定义箱体 -->
                        <SynchronousPoptip
                            v-else-if="row.fromOrToFlag === 2"
                            :currentInquiryId="currentInquiryId"
                            :currentCustomerName="currentCustomerName"
                            @changeCrmFlag="changeCrmFlag"
                            @showCompany="showCompany"
                            @showClue="showClue"
                            @createClue="createClue"
                            :params="{ row, index }">
                        </SynchronousPoptip>
                        <!-- 收件箱 -->
                        <SenderPoptip
                            v-else
                            @showCompany="showCompany"
                            :currentInquiryId="currentInquiryId"
                            :currentCustomerName="currentCustomerName"
                            @changeCrmFlag="changeCrmFlag"
                            @showClue="showClue"
                            @createClue="createClue"
                            :params="{ row, index }">
                        </SenderPoptip>
                        <div
                            class="mail-avatar-name"
                            v-if="mailTitleDisplayInformationValue === 2">
                            <TooltipAuto
                                v-if="row.contactsName"
                                :content="row.contactsName">
                            </TooltipAuto>
                        </div>
                        <div
                            class="mail-avatar-name"
                            v-else-if="mailTitleDisplayInformationValue === 3">
                            <TooltipAuto
                                :style="row.shortName?'max-width:50%': 'max-width:100%'"
                                v-if="row.contactsName"
                                :content="row.contactsName">
                            </TooltipAuto>
                            <TooltipAuto
                                v-if="row.shortName"
                                :content="row.shortName"
                                :style="row.contactsName?'max-width:50%': 'max-width:100%'">
                                {{`(${row.shortName})`}}
                            </TooltipAuto>
                        </div>
                        <div
                            class="mail-avatar-name"
                            v-else>
                            <TooltipAuto
                                :style="row.companyName?'max-width:50%': 'max-width:100%'"
                                v-if="row.contactsName"
                                :content="row.contactsName">
                            </TooltipAuto>
                            <TooltipAuto v-if="row.companyName"
                                :content="row.companyName"
                                :style="row.contactsName?'max-width:50%': 'max-width:100%'">
                                {{`(${row.companyName})`}}
                            </TooltipAuto>
                        </div>
                    </div>
                    <!-- 标志 -->
                    <div class="flags" v-else-if="item.key === 'marks'">
                        <!-- 邮件为收件，仅判断是否有已回复标识 -->
                        <div v-if="!row.fromOrToFlag">
                            <Tooltip
                                transfer
                                v-if="row.mailAnsweredFlag === 1"
                                placement="top"
                                :content="$t('mail.answered')">
                                <Icon
                                    @click="goToForwardDetail(row)"
                                    class="answered-mail"
                                    custom="custom custom-forward"
                                    size="14"
                                    style="color: #a9b9c9; transform: scale(-1, 1)" />
                            </Tooltip>
                            <Tooltip
                                    transfer
                                    v-else-if="row.mailInterForwardingFlag === 1 && !exceptMailBoxTypeIds.includes(row.mailBoxTypeId)"
                                    placement="top"
                                    :content="$t('mail.forwarding')">
                                    <Icon
                                        class="answered-mail"
                                        custom="custom custom-inter-forwarding-flag"
                                        size="14"
                                        style="color: #fa8241"/>
                            </Tooltip>
                            <Tooltip
                                    transfer
                                    v-else-if="row.mailForwardedInternallyFlag === 1 && !exceptMailBoxTypeIds.includes(row.mailBoxTypeId)"
                                    placement="top"
                                    :content="$t('mail.forwardedInternally')">
                                    <Icon
                                        class="answered-mail"
                                        custom="custom custom-inter-forwarding-flag"
                                        size="14"
                                        style="color: #a9b9c9"/>
                            </Tooltip>
                        </div>
                        <!-- 草稿箱邮件判断是否为定时邮件，若是，显示定时图标；反之，判断是否为追踪邮件，若有，显示追踪图标，若无，不显示图标 -->
                        <div v-else-if="row.mailBoxTypeId === 5">
                            <TimeoutTip
                                :params="{ row, index }"
                                v-if="row.mailTimeFlag === 1"
                                placement="top">
                            </TimeoutTip>
                            <Tooltip
                                transfer
                                v-else-if="row.mailTraceFlag === '1'"
                                placement="top">
                                <span style="color:#a9b9c9;position:relative;">
                                    <Icon size="14" custom="custom custom-px-trace" />
                                    <span style="font-size:13px;position: absolute;line-height: 28px;width:30px;">{{Number(row.mailOpenTimes) > 100 ? '99+' : row.mailOpenTimes}}</span>
                                </span>
                                <div slot="content">
                                    <p>{{ $t("mail.openCount") + row.mailOpenTimes }}</p>
                                    <p>{{ row.mailOpenTimes === 0 ? $t("mail.openTime") + $t("mail.null") : $t("mail.openTime") + row.recentOpenTime }}</p>
                                    <p>{{ row.mailOpenTimes === 0 ? $t("mail.openIP") + $t("mail.null") : $t("mail.openIP") + row.recentOpenIp }}</p>
                                    <p>{{ row.mailOpenTimes === 0 ? $t("mail.openLocation") + $t("mail.null") : $t("mail.openLocation") + row.recentOpenPosition }}</p>
                                </div>
                            </Tooltip>
                        </div>
                        <!-- 若邮件为一封发件，则图标的优先级顺序为发送中 > 发送失败 || 群发单显全部失败 > 群发单显部分成功 > 邮件追踪 > 群发单显全部成功
                        +注：对于普通邮件而言，若邮件发送成功并且无追踪标识，则不显示任何图标  杨娣 2020/11/19-->
                        <div v-else-if="row.fromOrToFlag === 1 || row.fromOrToFlag === 2">
                            <!-- 不论是普通发件 or 群发单显邮件，发送中的邮件标识优先级最高 -->
                            <Tooltip
                                transfer
                                v-if="row.successFlag === '2'"
                                placement="top"
                                :content="$t('mail.writeLetter.sending')">
                                <svg
                                    class="svg-icon custom"
                                    aria-hidden="true"
                                    style="display: inline-block; margin-right: 10px">
                                    <use xlink:href="#custom-fasongzhong"></use>
                                </svg>
                            </Tooltip>
                            <!-- 若邮件发送失败，判断是否为群发单显邮件，并显示对应图标 -->
                            <div v-else-if="row.successFlag === '0'">
                                    <Tooltip
                                        transfer
                                        popper-class="send-fail-tooltip"
                                        v-if="row.mailGroupSendingSingleShowFlag !== 1"
                                        placement="top">
                                        <span slot="content">
                                            <span>{{ $t("mail.writeLetter.sendErrorTitle") }}</span>
                                            <span v-if="row.mailSendErrorMsg">
                                                {{`: ${row.mailSendErrorMsg}`}}
                                            </span>
                                        </span>
                                        <Icon
                                            style="color: #ea4335"
                                            size="14"
                                            custom="custom custom-send-email-error"/>
                                    </Tooltip>
                                    <Tooltip
                                        transfer
                                        v-else
                                        placement="top"
                                        :content="$t('mail.writeLetter.sendErrorTitle')">
                                        <svg
                                            class="svg-icon custom"
                                            aria-hidden="true"
                                            style="display: inline-block; margin-right: 10px">
                                            <use xlink:href="#custom-mail-group-sent-unsuccessfully"></use>
                                        </svg>
                                    </Tooltip>
                            </div>
                            <!-- 若邮件部分成功(意味着为一封群发单显邮件)，则显示部分成功的图标 -->
                            <div v-else-if="row.successFlag === '3'">
                                    <Tooltip
                                        transfer
                                        v-if="row.mailGroupSendingSingleShowFlag === 1"
                                        placement="top"
                                        :content="$t('mail.writeLetter.partialSuccTitle')">
                                        <svg
                                            class="svg-icon custom"
                                            aria-hidden="true"
                                            style="display: inline-block; margin-right: 10px">
                                            <use xlink:href="#custom-mails-sent-successfully-partially"></use>
                                        </svg>
                                    </Tooltip>
                            </div>
                            <!-- 若邮件没有部分成功的标识(意味着为一封普通发件)，则根据是否为追踪邮件，决定是否显示追踪图标 -->
                            <Tooltip
                                transfer
                                v-else-if="row.mailTraceFlag === '1'"
                                placement="top">
                                <span style="color:#a9b9c9;position:relative;">
                                    <Icon size="14" custom="custom custom-px-trace" />
                                    <span style="font-size:13px;position: absolute;line-height: 28px;width:30px;">{{Number(row.mailOpenTimes) > 100 ? '99+' : row.mailOpenTimes}}</span>
                                </span>
                                <div slot="content">
                                    <p>{{ $t("mail.openCount") + row.mailOpenTimes }}</p>
                                    <p>{{ row.mailOpenTimes === 0 ? $t("mail.openTime") + $t("mail.null") : $t("mail.openTime") + row.recentOpenTime }}</p>
                                    <p>{{ row.mailOpenTimes === 0 ? $t("mail.openIP") + $t("mail.null") : $t("mail.openIP") + row.recentOpenIp }}</p>
                                    <p>{{ row.mailOpenTimes === 0 ? $t("mail.openLocation") + $t("mail.null") : $t("mail.openLocation") + row.recentOpenPosition }}</p>
                                </div>
                            </Tooltip>
                            <!-- 若邮件为一封普通发件，且无追踪标识，则根据该邮件是否有全部成功的标识(有则意味着为一封群发单显邮件)，决定是否显示全部成功的图标 -->
                            <Tooltip
                                transfer
                                v-else-if="row.successFlag === '1' && row.mailGroupSendingSingleShowFlag === 1"
                                placement="top"
                                :content="$t('mail.writeLetter.sendSuccTitle')">
                                <svg
                                    class="svg-icon custom"
                                    aria-hidden="true"
                                    style="display: inline-block; margin-right: 10px">
                                    <use xlink:href="#custom-mails-sent-successfully"></use>
                                </svg>
                            </Tooltip>
                            <Tooltip
                                transfer
                                v-else-if="row.mailInterForwardingFlag === 1 && !exceptMailBoxTypeIds.includes(row.mailBoxTypeId)"
                                placement="top"
                                :content="$t('mail.forwarding')">
                                <Icon
                                    class="answered-mail"
                                    custom="custom custom-inter-forwarding-flag"
                                    size="14"
                                    style="color: #fa8241"/>
                            </Tooltip>
                            <Tooltip
                                    transfer
                                    v-else-if="row.mailForwardedInternallyFlag === 1 && !exceptMailBoxTypeIds.includes(row.mailBoxTypeId)"
                                    placement="top"
                                    :content="$t('mail.forwardedInternally')">
                                    <Icon
                                        class="answered-mail"
                                        custom="custom custom-inter-forwarding-flag"
                                        size="14"
                                        style="color: #a9b9c9"/>
                            </Tooltip>
                        </div>
                    </div>
                    <!-- 主题 -->
                    <div v-else-if="item.key === 'subject'">
                        <div class="subject-title overflow-hidden">
                        <!--<span v-if="currentBox==='search'" class="box-type">[{{getMailBox(row.mailBoxTypeId)}}]</span>
                                    <span v-for="(label,index) in row.labelId" v-show="index<2" :key="index">
                                        <Tag :closable="currentPersonId === userId || currentBoxType === 'customerBox'" class="tag-in-table" @close="delTag(row.id,label)"
                                            :style="`color:${row.labelColor[index]}`" :color="getRGB(row.labelColor[index])">
                                        <span class="span-in-lable ellipsis">{{row.labelName[index]}}</span>
                                        </Tag>
                                </span>
                                    <span v-if="currentBox==='search'" v-html="row.handledtheme">
                                </span>
                                    <span v-else>{{row.theme}}</span>-->
                            <div class="subject-title overflow-hidden">
                                <div style="width: 95%" class="ellipsis">
                                    <!-- 加急 -->
                                    <Tooltip
                                        transfer
                                        v-if="row.urgentFlag === '1'"
                                        placement="top"
                                        :content="$t('mail.writeLetter.urgent')">
                                        <Icon
                                            custom="custom custom-urgent"
                                            size="14"
                                            style="color: #f25642; margin-top: -1px"/>
                                    </Tooltip>
                                    <!-- 搜索时显示哪个箱体 -->
                                    <span v-if="currentBox === 'search'" class="box-type">[{{ getMailBox(row.mailBoxTypeId) }}]</span>
                                    <!-- 打了标签的 -->
                                    <Dropdown trigger.stop="hover" placement="bottom-start">
                                        <span>
                                            <span
                                                v-for="(label, index) in row.labelId"
                                                v-show="index < 3"
                                                :key="Number(label)"
                                                class="mail-label"
                                                :style="`background-color:${row.labelColor[index]};margin-right: -5px;`">
                                            </span>
                                        </span>
                                        <DropdownMenu
                                            slot="dropdown"
                                            class="mail-label-dropdown-menu">
                                            <DropdownItem
                                                v-for="(label, index) in row.labelId"
                                                :key="Number(label)">
                                                <span
                                                    class="mail-label-dropdown-item"
                                                    :style="`background-color:${row.labelColor[index]}`"></span>
                                                <span style="font-size: 12px; margin-left: 5px">
                                                    {{row.labelName[index]}}
                                                </span>
                                                <Icon
                                                    v-if="currentPersonId === userId || currentBoxType === 'customerBox'"
                                                        size="12"
                                                        class="el-icon-close mail-label-close"
                                                        @click="delTag(row.id, label)"
                                                ></Icon>
                                            </DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                    <span
                                        v-if="currentBox === 'search'"
                                        v-html="row.handledtheme"
                                        style="margin-left: 10px"
                                        :title="`${row.theme}${ row.mailResumes ? row.mailResumes.substring(0, 201) : '' }`"></span>
                                    <span
                                        v-else
                                        style="margin-left: 10px"
                                        :title="`${row.theme}${row.mailResumes ? row.mailResumes.substring(0, 201) : ''}`"
                                    >{{ row.theme }}</span>
                                    <span style="color: rgba(0, 0, 0, 0.4)">-</span>
                                    <span
                                        v-if="row.mailResumes"
                                        :title="`${row.theme}${row.mailResumes ? row.mailResumes.substring(0, 201) : ''}`">
                                        <span
                                            v-if="currentBox === 'search'"
                                            style="color: rgba(0, 0, 0, 0.4)"
                                            v-html="handleMailContent(row.mailResumes)"></span>
                                        <span v-else style="color: rgba(0, 0, 0, 0.4)">
                                            {{row.mailResumes}}
                                        </span>
                                    </span>
                                </div>
                                <!-- 是否由附件 -->
                                <Tooltip
                                    transfer
                                    :content="$t('mail.attachment')"
                                    v-if="row.attachmentFlag === '1'"
                                    placement="top">
                                    <Icon
                                        size="14"
                                        custom="custom custom-mail-annex"
                                        style="position: absolute; right: 10px; top: 14px"/>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    <!-- 发件人 -->
                    <div v-else-if="item.key === 'sender'">
                        <div
                            v-if="currentBox === 'search'"
                            class="overflow-hidden"
                            :title="row.sender === '' ? $t('mail.noSender') : row.sender"
                            v-html="row.handledsender">
                        </div>
                        <div
                            v-else
                            class="overflow-hidden"
                            :title="row.sender === '' ? $t('mail.noSender') : row.sender">
                            {{row.sender === "" ? $t("mail.noSender") : getMailNickName([row.sender]) }}
                        </div>
                    </div>
                    <!-- 收件人 -->
                    <div v-else-if="item.key === 'recipient'">
                        <div
                            v-if="currentBox === 'search'"
                            class="overflow-hidden"
                            :title="row.recipient[0] === '' ? $t('mail.noRecipient') : row.recipient.join()"
                            v-html="row.handledrecipient">
                        </div>
                        <div
                            v-else
                            class="overflow-hidden"
                            :title="row.recipient[0] === '' ? $t('mail.noRecipient') : row.recipient.join()">
                            {{row.recipient[0] === "" ? $t("mail.noRecipient") : getMailNickName(row.recipient) }}
                        </div>
                    </div>
                    <!-- 日期 -->
                    <div class="overflow-hidden"
                        :title="row.wholeDate"
                        v-else-if="item.key === 'date'">
                        {{ row.date }}
                    </div>
                    <!-- 回复和转发操作 -->
                    <div v-if="item.key === 'replyAndForward' && row.mailBoxTypeId !== 5">
                        <div class="mail-operations" v-show="currentPersonId || currentMailTab === 'customerBox'">
                            <Dropdown trigger="hover"
                                @visible-change="handleMailOperatePopTrigger">
                                <Icon
                                    size="14"
                                    class="el-icon-more"
                                    style="transform: rotate(90deg); color: rgba(0, 0, 0, 0.28)"/>
                                <DropdownMenu slot="dropdown">
                                    <DropdownItem
                                        class="mail-reply piwik_reply_button"
                                        @click.native.stop="handleReply('replyCurrent', row.id)"
                                        name="replyCurrent"
                                        style="font-size: 12px">
                                        {{ $t("mail.reply") }}
                                    </DropdownItem>
                                    <DropdownItem
                                        class="mail-reply-all piwik_reply_button"
                                        @click.native.stop="handleReply('replyAll', row.id)"
                                        name="replyAll"
                                        style="font-size: 12px">
                                        {{ $t("mail.replyAll") }}
                                    </DropdownItem>
                                    <DropdownItem
                                        class="mail-reply-with-attachment piwik_reply_button"
                                        @click.native.stop="handleReply('replyWithAttachment', row.id)"
                                        name="replyWithAttachment"
                                        style="font-size: 12px">
                                        {{ $t("mail.replyWithAttachment") }}
                                    </DropdownItem>
                                    <DropdownItem
                                        class="mail-forward piwik_forward_button"
                                        @click.native.stop="forward(row.id)"
                                        name="forward"
                                        style="font-size: 12px">
                                        {{ $t("mail.forward") }}
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </div>
                    <!-- 待处理 和 星标操作 -->
                    <div v-if="item.key === 'untreatedAndStar' && row.mailBoxTypeId !== 5 && row.mailBoxTypeId !== 3 && row.mailBoxTypeId !== 2">
                        <!-- 待处理操作 -->
                        <div v-if="currentPersonId === userId || currentMailTab === 'customerBox'"
                            style="display: flex; align-items: center; justify-content: space-around;">
                            <div class="mail-operations">
                                <Icon
                                    v-if="row.mailToDoFlag === 0"
                                    size="14"
                                    custom="custom custom-mail-notSet piwik_mail_mark_nosetOrFinished"
                                    style="color: rgba(0, 0, 0, 0.28)"
                                    :title="$t('mail.notSet')"
                                    @click="changeMailState(row.id, 1)"
                                />
                                <Icon
                                    v-if="row.mailToDoFlag === 1"
                                    custom="custom custom-mail-untreated piwik_mail_mark_untreated"
                                    style="color: #fbbc04"
                                    size="14"
                                    :title="$t('mail.untreated')"
                                    @click="changeMailState(row.id, 2)"
                                />
                                <Icon
                                    v-if="row.mailToDoFlag === 2"
                                    size="14"
                                    custom="custom custom-mail-finished piwik_mail_mark_nosetOrFinished"
                                    style="color: #00cc99"
                                    :title="$t('mail.finished')"
                                    @click="changeMailState(row.id, 1)"
                                />
                            </div>
                            <div class="mail-operations">
                                <Icon
                                    v-if="row.mailStarFlag === '0' && row.mailBoxTypeId !== 3"
                                    size="14"
                                    style="visibility: visible; color: rgba(0, 0, 0, 0.28)"
                                    custom="custom custom-mail-star0"
                                    :title="$t('mail.flag_star_box')"
                                    @click="sign_star(1, row.id)"
                                />
                                <Icon
                                    v-else-if="row.mailBoxTypeId !== 3"
                                    custom="custom custom-mail-star1"
                                    style="color: #fbbc04; visibility: visible"
                                    size="14"
                                    :title="$t('mail.cancel_flag_star_box')"
                                    @click="sign_star(0, row.id)"
                                />
                            </div>
                        </div>
                    </div>
                     <!-- 群发箱相关字段-->
                    <div v-if="['sendCount', 'sendedCount', 'sendedRate', 'openCount', 'openRate', 'createTime'].includes(item.key)">
                        {{row[item.key]}}
                    </div>
                    <!-- 群发箱正文 明细 操作按钮 -->
                    <div v-if="item.key === 'operate'">
                        <Button type="text" @click.native.stop="groupBoxHandle(row.id,'showMail')">{{$t('mail.mailTable.detailed')}}</Button>
                        <Button type="text" @click.native.stop="groupBoxHandle(row.id,'showText')">{{$t('mail.mailTable.text')}}</Button>
                    </div>
                </template>
            </TableColumn>
        </Table>
    <CRMDrawerList
        :visible.sync="show_company_detail"
        :id.sync="companyId"
        :type="type_company"
        :originalType="type_company"
        :corp_columns_authorized="corp_columns_authorized"
        :contact_columns_authorized="contact_columns_authorized"
        :inquiry_columns_authorized="inquiry_columns_authorized">
    </CRMDrawerList>

    <ClueDrawerList
        :visible.sync="show_clue_detail"
        :type="type_clue"
        :clueId.sync="clueId"
        :listType="2"
        :corp_columns_authorized="corp_columns_authorized"
        :contact_columns_authorized="contact_columns_authorized"
        :inquiry_columns_authorized="inquiry_columns_authorized">
    </ClueDrawerList>
  </div>
</template>

<script>
    import util from '@/libs/util';
    import CRMDrawerList from '@/views/crm/Detail/CRMDrawerList';
    import ClueDrawerList from '@/views/clue-manage/Detail/ClueDrawerList';
    import { mapState, mapGetters, mapActions } from 'vuex';
    import { HANDLE_HIGHLIGHT } from '@/api/mail.js';

    export default {
        name: 'TableTemplate',
        components: {
            CRMDrawerList,
            ClueDrawerList
        },
        props: {
            tableData: {
                type: Array,
                default() {
                    return [];
                }
            },
            desc: {
                type: String,
                default: ''
            },
            columns: {
                type: Array,
                default() {
                    return [];
                }
            },
            keyword: {
                type: String
            },
            showHeader: {
                type: Boolean,
                default: false
            },
            checkAll: {
                type: Boolean
            },
            indeterminate: {
                type: Boolean
            },
            currentBox: {
                type: String
            },
            currentInquiryId: {
                type: Number
            },
            currentCustomerName: {
                type: String
            },
            currentMailTab: {
                type: String,
                default: ''
            },
            currentBoxType: {
                type: String
            },
            corp_columns_authorized: {
                type: Object
            },
            inquiry_columns_authorized: {
                type: Object
            },
            contact_columns_authorized: {
                type: Object
            }
        },
        computed: {
            ...mapState({
                enterpriseId: (state) => state.enterpriseId,
                userId: (state) => state.userId,
                userName: (state) => state.userName,
                fullname: (state) => state.fullName,
                window_height: (state) => state.window_height,
                customFolders: (state) => state.mail.customFolders,
                currentPersonId: (state) => state.mail.currentPersonId,
                currentAccount: (state) => state.mail.currentAccount,
                currentInputInfo: (state) => state.mail.currentInputInfo,
                currentAccountIds: (state) => state.mail.currentAccountIds,
                mailTitleDisplayInformationValue: (state) => state.mail.mailTitleDisplayInformationValue,
                newReceiveMails: state => state.mail.newReceiveMails
            }),
            ...mapGetters([
                'isContainsMenu',
                // 当前选中邮箱账号的"新收邮件"统计数据
                'currentAccountNewReceiveMailIdObj'
            ]),
            // 当前邮箱当前箱体"新收邮件统计数据"
            currentBoxNewReceiveMailIdArr() {
                return this.currentAccountNewReceiveMailIdObj[this.currentBox] || [];
            }
        },
        data() {
            return {
                selection: [],
                show_company_detail: false,
                type_company: 'customer',
                companyId: 0,
                show_clue_detail: false,
                type_clue: '',
                clueId: '',
                exceptMailBoxTypeIds: [5] // 垃圾箱/草稿箱，某些标志不支持以上箱体查看，因此需要排除掉
            };
        },
        created() {},
        mounted() {
            // this.getSalesList(); // 获取销售人员列表以供新建客户时指定销售
        },
        methods: {
            ...mapActions(['getUnreadMail']),
            /* 多选 */
            getRowKey(row) {
                return row.id;
            },
            /** 打开邮件详情 */
            openDetail(row) {
                // 群发列表 不跳详情,由按钮控制
                if (this.currentBox === 'groupBox') return;
                this.$emit('goMailDetail', row);
            },
            /** 回复 */
            handleReply(name, id) {
                this.$emit('handleReply', { name, id });
            },
            /** 转发 */
            forward(id) {
                this.$emit('forward-mail', id);
            },
            /** 指定某一行样式 */
            rowClassName(rowData) {
                let result = '';
                if (rowData.row.fav === '0' && rowData.row.mailBoxTypeId !== 3 && rowData.row.mailBoxTypeId !== 5) {
                    result += ' table-unread-row';
                }
                if (rowData.row.mailBoxTypeId === 5) {
                    result += ' mail-draftdetails';
                }
                if (this.currentBoxNewReceiveMailIdArr.includes(rowData.row.id)) {
                    result += ' mail-new-receive';
                }
                return result;
            },
            /** 获取邮件是哪个箱 */
            getMailBox(boxId) {
                const boxTypeName = this.findBoxTypeName(this.customFolders, boxId);
                switch (boxId) {
                    case 0:
                        return this.$t('mail.inbox');
                    case 3:
                        return this.$t('mail.dustbin');
                    case 2:
                        return this.$t('mail.trash');
                    case 4:
                        return this.$t('mail.sentBox');
                    case 5:
                        return this.$t('mail.draftBox');
                    default:
                        return boxTypeName || this.$t('mail.customizedFolder.name');
                }
            },
            // 返回对应id的name
            findBoxTypeName(treeData, id) {
                const _this = this;
                for (let i = 0; i < treeData.length; i++) {
                    const a = treeData[i];
                    if (a.id === id) {
                        return a.boxTypeName;
                    } else {
                        if (a.list && a.list.length > 0) {
                            const res = _this.findBoxTypeName(a.list, id);
                            if (res) {
                                return res;
                            }
                        }
                    }
                }
            },
            createClue(mailId, email, currentMailAddType, currentMailInfo, noReplyToEmail) {
                // this.mailAddress = email;
                // this.show_company_detail = false;
                // this.show_clue_detail = false;
                this.$emit('createClue', mailId, email, currentMailAddType, currentMailInfo, noReplyToEmail);
            //   if (this.currentPersonId === this.userId) {
            //     if (this.mailAddress === email) {
            //       this.littleDrawerVisible = !this.littleDrawerVisible
            //     } else {
            //       this.littleDrawerVisible = false;
            //       this.$nextTick(() => {
            //         this.littleDrawerVisible = true;
            //       })
            //     }
            //   }
            },
            //  查询当前录入询盘 的email 的crm 状态 打开详情页
            getInquiryAndCompanyInfoByEmails(mailAddress) {
                const postData = {
                    emailList: [mailAddress],
                    userId: this.currentBoxType === 'customerBox' || this.currentPage === 'writeMail' || this.currentPage === 'writeMailFloatWindow' ? this.userId : this.currentPersonId ? this.currentPersonId : this.userId,
                    orgId: this.enterpriseId
                };
                util.ajaxJson({
                    url: '/crm/mailbox/getInquiryAndCompanyInfoByEmails',
                    method: 'post',
                    data: postData
                }).then((response) => {
                    if (response.data.code === '1') {
                        const companyId = response.data.data[mailAddress].companyId;
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
                this.$emit('littleDrawerHidden', false);

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
                    this.$emit('changeSearchCustomer', false);
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
                this.$emit('littleDrawerHidden', false);
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
            /* 当前用户是否拥有某些人员的管理权限的判断 */
            isHaveManageAuthority(userIds) {
                return new Promise((resolve) => {
                    util
                        .ajaxJson({
                            url: '/new-privilege/manage/getusers',
                            method: 'get',
                            params: {
                                orgId: this.enterpriseId,
                                userId: this.userId
                            }
                        })
                        .then((res) => {
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
                        })
                        .catch((err) => {
                            console.log(err);
                            resolve(0);
                        });
                });
            },
            /**
             * @Description: 添加此方法，解决小人头颜色标识与问题提示内容不一致的bug
             * @author 杨娣
             * @date 2019/9/11
             */
            changeCrmFlag({ param, key, type }) {
                param[key] = type;
            },

            /** 标记/取消星标 */
            sign_star(type, id) {
                const data = this.tableData.find((item) => item.id === id);
                this.$emit('sign-star', type, [data]);
            },
            /** 删除标签 */
            delTag(mailId, tagId) {
                if (
                    this.currentPersonId === this.userId ||
                    this.currentBoxType === 'customerBox'
                ) {
                    this.$emit('deleteTag', mailId, tagId);
                }
            },
            /** 表格选项改变 */
            changeSelection(selection) {
                // console.log('表格选项改变', selection);
                this.tableData.forEach((item, i) => {
                    const result = selection.some((element) => {
                        return element.id === item.id;
                    });
                    this.$set(this.selection, i, result);
                });
                this.$emit('handle_select_mail', this.desc, selection);
            },
            /* 点击已回复图标跳转至已回复邮件详情页前 */
            goToForwardDetail(row) {
                /* 当邮件类型为收件时，有两类图标可能显示，其一：已回复图标；其二，内部转发相关图标。
                if (!row.fromOrToFlag && row.mailAnsweredFlag !== 1) {
                return false;
                }
                通过接口获取最近一封已回复邮件的id */
                util.ajax({
                    url: '/mail/answerMailSkip',
                    method: 'GET',
                    params: {
                        mailId: row.id
                    }
                }).then((res) => {
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
                util
                    .ajaxMailJson({
                        // url: `/mail/mailDetail/${id}`,
                        url: '/mail/mailDetail',
                        method: 'GET',
                        params: {
                            userId: this.userId,
                            orgId: this.enterpriseId,
                            id
                        },
                        timeout: 60000
                    })
                    .then((res) => {
                        if (res.data.code === 1) {
                            const mailDetail = Object.assign(res.data.data, { id });
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
                            this.$Message.error('跳转失败，请刷新后重试');
                        }
                    })
                    .catch(() => {
                        this.$Message.error('跳转失败，请刷新后重试');
                    });
            },
            refreshData() {
                this.$emit('refreshEmailList');
            },
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
            handleMailContent(mailContent) {
                return HANDLE_HIGHLIGHT(
                    mailContent.substring(0, 201),
                    this.keyword,
                    true
                );
            },
            /* 改变邮件的处理状态 */
            changeMailState(id, status) {
                const data = this.tableData.find((item) => item.id === id);
                this.$emit('changeProcessingState', status, [data]);
            },

            // 监听表格 pop 显隐状态, 以此给组件增减 'mail-table-template__operating' class , 方便外部检测表格是否操作中
            handleMailOperatePopTrigger(visible) {
                if (visible) {
                    this.$el.classList.add('mail-table-template__operating');
                } else {
                    this.$el.classList.remove('mail-table-template__operating');
                }
            },
            // 群发箱的 正文与明细操作
            groupBoxHandle(mailId, type) {
                this.$emit('groupBoxHandle', mailId, type);
            }
        },
        watch: {
            /** 监听父组件MailTable 的全选按钮状态 从而改变展开列表的选择状态 */
            checkAll: {
                handler(val) {
                    /** 全选true 全选 */
                    if (val) {
                        this.$nextTick(() => {
                            const ref = this.$refs[`table${this.desc}`];
                            const rows = ref.data;
                            rows.forEach((item) => {
                                ref.toggleRowSelection(item, val);
                            });
                        });
                    } else if (!this.indeterminate) {
                        /** 全选false 半选false 清空 */
                        this.$nextTick(() => {
                            this.$refs[`table${this.desc}`].clearSelection(val);
                        });
                    }
                }
            },
            indeterminate: {
                handler(val) {
                    /** indeterminate:false checkAll:false 全不选 */
                    if (!val && !this.checkAll) {
                        this.$nextTick(() => {
                            this.$refs[`table${this.desc}`].clearSelection(val);
                        });
                    }
                }
            },
            tableData: {
                handler() {
                    this.tableData.forEach((item, i) => {
                        this.selection[i] = false;
                    });
                }
            },
            show_company_detail: {
                handler(val) {
                    if (!val) {
                        this.companyId = 0;
                    }
                }
            }
        }
    };
</script>

<style lang="less" scoped>
    .mail-table-template {
        .hidden {
            visibility: hidden;
        }

        .overflow-hidden {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .table-expand {
            display: none;
        }

        .mail-label {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            border: 1px solid #fff;
        }

        .inter-forwarding-modal {
            .inter-forwarding-container {
                .inter-forwarding-footer {
                    float: right;
                }
            }
        }

        .mail-avatar-name {
            margin-left: 5px;
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        /* "新收到的邮件"图标 */
        /deep/ .mail-new-receive {
            position: relative;

            &::after {
                content: '';
                display: inline-block;
                position: absolute;
                top: -4px;
                left: 0;
                width: 40px;
                height: 17px;
                background-image: url("../../../images/new.png");
                background-size: cover;
                background-repeat: no-repeat;
            }
        }
        /* 让"新收到的邮件"图标最顶部能溢出显示 */
        /deep/ .el-table, /deep/ .el-table__body-wrapper {
            padding-top: 4px;
            margin-top: -4px;
        }
        /deep/ .el-table__body {
            border-top: 1px solid #ebeef5;
        }
    }
</style>
