<template>
    <div id="mailDetail" v-loading="spinShow">
        <Card v-show="!spinShow"
              ref="detailCard"
              @scroll.native="handleMailVerticalScroll"
              style="width:100%;height:100%;overflow-y:auto;padding:0 14px 14px 14px;"
              :class="{'no-border': mailReadingMode === 2}">
            <ul class="operates clearfix" :style="(!showToggleMailDetail) ? 'height: 41px;line-height:41px;' : null">
                <!--0-inbox(收件箱)、5-draftBox(草稿箱)、4-sentBox(已发箱)、3-dustbin(已删除箱)、2-trash(垃圾箱)）-->
                <!-- 返回上一页 -->
                <li>
                    <Tooltip v-if="mailReadingMode !== 2 && !$route.query.id"
                             placement="top"
                             transfer
                             :content="$t('back')">
                        <Icon custom="custom custom-back" class="mail-detail-back" @click="pageReturn"/>
                    </Tooltip>
                </li>
                <!-- 回复 -->
                <li v-show="(currentPersonId || currentBoxType === 'customerBox')">
                    <Tooltip placement="top" transfer :content="$t('mail.reply')" :open-delay="500">
                        <Icon size="18" @click="reply('replyCurrent')" custom="custom custom-a-icon_Replied1" :class="currentPersonId !== userId?'piwik_reply_button':'mail-reply'" />
                    </Tooltip>
                    <Dropdown trigger="click" @command="reply" placement="bottom">
                        <Icon custom="custom-floating-window-arrow" size="10"></Icon>
                        <DropdownMenu slot="dropdown">
                            <DropdownItem :class="currentPersonId !== userId?'piwik_reply_button':'mail-reply-all'" command="replyCurrent">{{$t('mail.reply')}}</DropdownItem>
                            <DropdownItem :class="currentPersonId !== userId?'piwik_reply_button':'mail-reply-with-attachment'" command="replywithoutOriginalText">{{$t('mail.replyWithoutOriginalText')}}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </li>
                <!-- 回复全部、带附件 -->
                <li v-show="(currentPersonId || currentBoxType === 'customerBox')">
                    <Tooltip placement="top" transfer :content="$t('mail.replyAll')" :open-delay="500">
                        <Icon custom="custom custom-a-icon_Replied2" :class="currentPersonId !== userId?'piwik_reply_button':'mail-reply-all'" size="18" @click="reply('replyAll')" style="margin-right: 4px"></Icon>
                    </Tooltip>
                    <Dropdown trigger="click" @command="reply" placement="bottom">
                        <Icon custom="custom-floating-window-arrow" size="10"></Icon>
                        <DropdownMenu slot="dropdown">
                            <DropdownItem :class="currentPersonId !== userId?'piwik_reply_button':'mail-reply-all'" command="replyAll">{{$t('mail.replyAll')}}</DropdownItem>
                            <DropdownItem :class="currentPersonId !== userId?'piwik_reply_button':'mail-reply-with-attachment'" command="replyAllWithoutOriginalText">{{$t('mail.replyAllWithoutOriginalText')}}</DropdownItem>
                            <DropdownItem :class="currentPersonId !== userId?'piwik_reply_button':'mail-reply-with-attachment'" command="replyWithAttachment">{{$t('mail.replyWithAttachment')}}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </li>
                <!-- 转发 -->
                <li v-show="(currentPersonId || currentBoxType === 'customerBox')" :class="currentPersonId !== userId?'piwik_forward_button':''">
                    <Tooltip placement="top" :content="$t('mail.forward')" :open-delay="500">
                        <Icon custom="custom custom-icon_forwarded1" size="18" @click="forward('forward')" style="margin-right: 4px"></Icon>
                    </Tooltip>
                    <Dropdown trigger="click" @command="forward" placement="bottom">
                        <Icon custom="custom-floating-window-arrow" size="10"></Icon>
                        <DropdownMenu slot="dropdown">
                            <DropdownItem command="forward">{{$t('mail.forward')}}</DropdownItem>
                            <DropdownItem command="forwardAsAttachment">{{$t('mail.forwardAsAttachment')}}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </li>
                <!-- 标记 -->
                <li v-show="(currentPersonId === userId || currentBoxType === 'customerBox') && !['2', '3'].includes(mailBoxTypeId)">
                    <Dropdown trigger="click" @command="markAs" placement="bottom">
                        <Tooltip placement="top" transfer :content="$t('mail.mark')" :open-delay="500">
                            <Icon size="18" custom="custom custom-icon_biaoji" />
                        </Tooltip>
                        <DropdownMenu slot="dropdown">
                            <DropdownItem command="read">{{$t('mail.markRead')}}</DropdownItem>
                            <DropdownItem command="unread">{{$t('mail.markUnread')}}</DropdownItem>
                            <DropdownItem command="changePending" class="piwik_mail_mark_untreated" :divided="currentBox !== 'draftBox'">{{$t('mail.markAsUntreated')}}</DropdownItem>
                            <DropdownItem command="changeFinished" class="piwik_mail_mark_nosetOrFinished">{{$t('mail.markAsFinished')}}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </li>
                <!-- 移动到 -->
                <li v-if="!['-1', '4'].includes(mailDetailData.mailSuccessFlag)" v-show="(currentPersonId === userId || currentBoxType === 'customerBox') && !['2', '3'].includes(mailBoxTypeId)">
                    <Dropdown trigger="click" ref="dropdown" @command="moveTo" placement="bottom">
                        <Tooltip placement="top" transfer :content="$t('mail.moveTo')" :open-delay="500">
                            <Icon size="18" custom="custom custom-icon_yidongdao" />
                        </Tooltip>
                        <DropdownMenu slot="dropdown"
                            class="move-to-folders">
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
                                style="max-height: 400px; overflow: auto;" >
                            </Tree>
                        </DropdownMenu>
                    </Dropdown>
                </li>
                <!-- 删除 -->
                <li v-show="orgId !== '10991' && (currentPersonId === userId || currentBoxType === 'customerBox') && !['-1', '4'].includes(mailDetailData.mailSuccessFlag)">
                    <Tooltip placement="top" transfer :content="$t('delete')" :open-delay="500">
                        <Icon size="18" custom="custom custom-icon_shanchu" @click="handleDelete" />
                    </Tooltip>
                </li>
                <!-- 标签 -->
                <li v-show="(currentPersonId === userId || currentBoxType === 'customerBox') && !['2', '3'].includes(mailBoxTypeId)">
                    <Dropdown trigger="click" @command="operateTag($event,1)" placement="bottom">
                        <Tooltip placement="top" transfer :content="$t('crm.InqSet.inq_label')" :open-delay="500">
                            <Icon size="18" custom="custom custom-icon_biaoqian" />
                        </Tooltip>
                        <DropdownMenu slot="dropdown">
                            <div style="max-height: 400px; overflow: auto;">
                                <DropdownItem v-for="(tag,index) in tagList " :key="index" :command="tag.id" :style="`${tag.id === -1 ? 'text-align: center;' : ''}`">
                                    <span class="tag-color" :style="`background-color: ${tag.labelColor};`" v-if="tag.id !== -1"></span>
                                    <span :title="tag.labelName">{{tag.labelName}}</span>
                                </DropdownItem>
                                <DropdownItem command="addtag" divided>{{$t('mail.add_tags_mark')}}</DropdownItem>
                            </div>
                        </DropdownMenu>
                    </Dropdown>
                </li>
                <!-- 再次编辑 -->
                <!-- <li v-show="(currentPersonId || currentBoxType === 'customerBox')">
                    <Tooltip placement="top" transfer :content="$t('mail.edit_again')">
                        <Icon @click="reedit" class="mail-editagain" custom="custom custom-edit-again" />
                    </Tooltip>
                </li> -->
                <!-- 从已删除恢复邮件 -->
                <li v-if="(currentPersonId === userId || currentBoxType === 'customerBox') && mailBoxTypeId === '3'">
                    <Tooltip placement="top" transfer :content="$t('restore')" :open-delay="500">
                        <Icon size="18" custom="custom custom-icon_huanyuan" @click="restore" />
                    </Tooltip>
                </li>
                <!-- 从垃圾箱或者自定义文件夹还原邮件 -->
                <li v-show="(currentPersonId === userId || currentBoxType === 'customerBox') && mailBoxTypeId === '2'">
                    <Tooltip placement="top" transfer content="还原" :open-delay="500">
                        <Icon size="18" custom="custom custom-huaban" @click="moveRestore" />
                    </Tooltip>
                </li>
                <!-- 打印 -->
                <!-- <li class="piwik_mailDetail_print">
                    <Tooltip placement="top" transfer content="打印">
                        <Icon size="14" custom="custom custom-print" @click="handlePrint" />
                    </Tooltip>
                </li> -->
                <!-- 内部转发InterForwarding -->
                <li v-show="(currentPersonId === userId || currentBoxType === 'customerBox') && !['4'].includes(mailBoxTypeId) && !mailDetailData.fromOrToFlag">
                    <Tooltip placement="top" transfer :content="$t('mail.forwarding')" :open-delay="500">
                        <Icon size="18" custom="custom custom-icon_neibuzhuanfa" @click="toggleInterForwardingModal(true)"/>
                    </Tooltip>
                </li>
                <!-- 手动归档 CRM -->
                <!-- <li v-if="(currentPersonId === userId || currentBoxType === 'customerBox') && !['-1', '4'].includes(mailDetailData.mailSuccessFlag)">
                    <Dropdown trigger="click" @command="archiveToCRM" placement="bottom">
                        <Tooltip placement="top"
                                 :content="$t('mail.archiveToCRM')"
                                 transfer
                                 :open-delay="500">
                            <span>
                                <Icon size="18" custom="custom custom-icon_jiandang"/>
                            </span>
                        </Tooltip>
                        <DropdownMenu slot="dropdown">
                            <DropdownItem :command="1">{{ $t('mail.customer') }}</DropdownItem>
                            <DropdownItem :command="3">{{ $t('mail.inquiry') }}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </li> -->
                <!-- 翻译图标 -->
                <!-- <li>
                    <Tooltip placement="top" :content="$t('mail.translateContent')" transfer>
                        <Icon class="piwik_email_detail_translate_button" size="16" custom="custom custom-fanyi" @click="handleTranslateContent"/>
                    </Tooltip>
                </li> -->
                <!-- 手动执行收发信规则图标 -->
                <!-- <li v-show="(currentPersonId === userId || currentBoxType === 'customerBox') && !['-1', '4'].includes(mailDetailData.mailSuccessFlag)">
                    <Tooltip placement="top" :content="$t('mail.mailDetail.manuallyEnforceRule')" transfer>
                        <Icon class="piwik_manually_enforce_rules" size="16" custom="custom custom-icon_e_rule" @click="handleenforceRules"/>
                    </Tooltip>
                </li> -->
                <!-- 标记为垃圾邮件图标 -->
                <!-- <li v-if="(currentPersonId === userId || currentBoxType === 'customerBox') && !['4', '2'].includes(mailBoxTypeId) && !mailDetailData.fromOrToFlag && !['-1', '4'].includes(mailDetailData.mailSuccessFlag)">
                    <Tooltip placement="top" :content="$t('mail.mailDetail.markedAsSpam')" transfer>
                        <Icon size="16" custom="custom custom-icon_m_spam" @click="() => markSpamModel = true"/>
                    </Tooltip>
                </li> -->
                <!-- 新建收发信规则图标 -->
                <!-- <li v-show="currentPersonId === userId || currentBoxType === 'customerBox'">
                    <Tooltip placement="top" :content="$t('mail.mailDetail.addRules')" transfer>
                        <Icon size="16" custom="custom custom-icon_c_rule" @click="handleAdd"/>
                    </Tooltip>
                </li> -->
                <!-- 邮件日志图标 -->
                <!-- <li>
                    <Tooltip placement="top" :content="$t('mail.mailDetail.mailLogs')" transfer>
                        <Icon class="piwik_mail_log" size="16" custom="custom custom-icon_log" @click="() => mailLogVisible = true"/>
                    </Tooltip>
                </li> -->
                <!-- 取消发送 -->
                <li v-if="['-1'].includes(mailDetailData.mailSuccessFlag) && mailDetailData.mailBoxTypeId === 7">
                    <Tooltip placement="top" :content="$t('cancel')" transfer :open-delay="500">
                        <Icon class="piwik_mail_cancel_send" size="18" custom="custom custom-icon_quxiao" @click="handleCancel"/>
                    </Tooltip>
                </li>
                <!-- 下载eml -->
                <!-- <li v-if="authorized_button.download">
                    <Tooltip placement="top" :content="$t('mail.download')" transfer>
                        <Icon size="16" color="#666666" custom="custom custom-file-download" @click="handleDownload"/>
                    </Tooltip>
                </li> -->
                <!-- 更多操作 start -->
                <Poptip v-model="visible"
                        trigger="hover"
                        placement="bottom-start"
                        popper-class="detail-move-operate-pop"
                        :open-delay="500">
                    <span slot="reference">
                        <Icon custom="custom custom-gengduo1" size="18"></Icon>
                    </span>
                    <div>
                        <ul>
                            <!-- 分发 -->
                            <li v-show="(currentPersonId === userId || currentBoxType === 'customerBox') && ['distribute_box'].includes(currentBox)" @click="distributionModal(true)">{{'分发'}}</li>
                            <!-- 再次编辑 -->
                            <li v-show="(currentPersonId || currentBoxType === 'customerBox')"  @click="reedit" class="mail-editagain">{{$t('mail.edit_again')}}</li>
                            <!-- 翻译 -->
                            <li class="piwik_email_detail_translate_button" @click="() => {visible = false;handleTranslateContent()}">{{$t('mail.translateContent')}}</li>
                            <!-- 标记为垃圾邮件 -->
                             <li v-if="(currentPersonId === userId || currentBoxType === 'customerBox') && !['4', '2'].includes(mailBoxTypeId) && !mailDetailData.fromOrToFlag && !['-1', '4'].includes(mailDetailData.mailSuccessFlag)"
                                  @click="() => markSpamModel = true">
                                {{$t('mail.mailDetail.markedAsSpam')}}
                            </li>
                            <!-- 邮件日志 -->
                            <li class="piwik_mail_log" @click="() => { visible = false; mailLogVisible = true }">{{$t('mail.mailDetail.mailLogs')}}</li>
                            <!-- 新建收发信规则 -->
                            <li v-show="currentPersonId === userId || currentBoxType === 'customerBox'" @click="handleAdd">{{$t('mail.mailDetail.addRules')}}</li>
                            <!-- 手动执行收发信规则 -->
                            <li v-show="(currentPersonId === userId || currentBoxType === 'customerBox') && !['-1', '4'].includes(mailDetailData.mailSuccessFlag)"
                                 class="piwik_manually_enforce_rules"
                                 @click="handleenforceRules">
                                 {{$t('mail.mailDetail.manuallyEnforceRule')}}</li>
                            <!-- 打印 -->
                            <li class="piwik_mailDetail_print" @click="handlePrint">{{$t('mail.print')}}</li>
                            <!-- 下载 -->
                            <li v-if="authorized_button.download" @click="handleDownload">{{$t('mail.download')}}</li>
                        </ul>
                    </div>
                </Poptip>
                <!-- 更多操作 end -->
                <!-- 切换 上一条/下一条 -->
                <li style="float: right;margin-right: 30px;" v-if="showToggleMailDetail">
                    <Button class="change-page-pre" @click="handle_pre_next('pre')" :disabled="cur_mail - 2<0">
                        <Icon type="chevron-left"></Icon>
                    </Button>
                    <span style="line-height: 38px;font-size: 14px;display: inline-block; color: #7e7e7e">{{cur_mail}}/{{total_mail}}</span>
                    <Button class="change-page-next" @click="handle_pre_next('next')" :disabled="cur_mail ===total_mail">
                        <Icon type="chevron-right"></Icon>
                    </Button>
                </li>
                <!-- 新窗口打开 -->
                <li style="float: right; margin-right: 16px" v-if="!$route.query.id">
                    <Tooltip placement="top" :content="$t('mail.openNewWindow')" transfer :open-delay="500">
                        <Icon class="cursor-pointer" size="16" color="#677F99" custom="custom custom-icon_opennew" @click="handleOpenNewWindow"/>
                    </Tooltip>
                </li>
            </ul>
            <div class="mail-content" :style="(!showToggleMailDetail) ? 'padding-top:41px;' : null">
                <div id="title" class="mail-title-container">
                    <!-- 主题 + 标签 -->
                    <div class="mail-tag-container">
                        <!-- 邮件主题 -->
                        <span v-if="currentBox==='search'"
                              v-html="highLight(title,true)"></span>
                        <span v-else
                              :style="mailPrintFlag ? 'font-size: 18px; opacity: 0.8; line-height: 26px;' : ''">{{title}}</span>
                        <!-- 标签 -->
                        <Tag v-for="(tag,index) in tags"
                             :key="index"
                             :color="tag.labelColor"
                             :style="`color:${getRGB(tag.labelColor)}`"
                             class="tag-in-table">
                            <span v-if="!mailPrintFlag" @click="filterTag(tag.id)">{{tag.labelName}}</span>
                            <Icon class="custom custom-delete1" @click="operateTag(tag.id,0)" :style="`margin-left: 9px;cursor: pointer;color:${getRGB(tag.labelColor) === '#333' ? '#999!important' : '#fff'}`"></Icon>
                        </Tag>
                    </div>
                    <!-- <taskPoptip :params="mailDetailData" fromModule="mailDetail" @handleTaskModal="handleTaskModal" @refreshDataList="refreshDataList" style="line-height:18px; margin-right:10px"></taskPoptip> -->
                    <!-- 待处理 -->
                    <span v-if="!mailPrintFlag && (currentPersonId === userId || currentBoxType === 'customerBox') && !['2', '3'].includes(mailBoxTypeId)"
                          class="mail-detail-status cursor-pointer">
                        <Icon v-if="mailToDoFlag === 0" size="14" custom="custom custom-mail-notSet piwik_mail_mark_nosetOrFinished"
                              style="color: #666;" :title="$t('mail.notSet')" @click="changeProcessingState(1)"/>
                        <Icon v-if="mailToDoFlag === 1"  custom="custom custom-mail-untreated piwik_mail_mark_untreated"
                              style="color:#FBBC04;" size="14" :title="$t('mail.untreated')" @click="changeProcessingState(2)"/>
                        <Icon v-if="mailToDoFlag === 2"  size="14" custom="custom custom-mail-finished piwik_mail_mark_nosetOrFinished" :title="$t('mail.finished')"
                              style="color:#00CC99;" @click="changeProcessingState(1)"/>
                    </span>
                    <!-- 星标 -->
                    <div v-if="(currentPersonId === userId || currentBoxType === 'customerBox') && !['2', '3'].includes(mailBoxTypeId) && !mailPrintFlag"
                         class="mail-star-operate cursor-pointer">
                        <Icon v-if="mailStarFlag === '0'" size="14" style="visibility:visible;margin-top: -2px;color: #666;"
                              custom="custom custom-mail-star0" :title="$t('mail.flag_star_box')"
                              @click="sign_star(1)"/>
                        <Icon v-else custom="custom custom-mail-star1"
                              style="color:#FBBC04;visibility:visible;margin-top: -2px;" size="14" :title="$t('mail.cancel_flag_star_box')"
                              @click="sign_star(0)"/>
                    </div>
                    <!-- 详情 -->
                    <span v-if="!mailPrintFlag" class="show-more" @click="showMore=!showMore">
                        {{showMore?$t('distribution.takeUp'):$t('crm.Modal.details')}}
                        <Icon :class="showMore?'opened':''" size="12" custom="custom custom-show-more"></Icon>
                    </span>
                </div>

                <div v-show="!showMore">
                    <div v-if="currentBox==='search'" class="notwrap" style="color:#979797;"  >
                    <span v-if="lang === 'zh-CN'">
                        <span v-html="highLight(getNickname(sender.join(',')),true)"></span>{{`于${sendTime}发给`}}<span v-html="highLight(getNickname(recipients.join(',')+','+recipients_cc.join(',')+','+recipients_bcc.join(',')),true)"></span>
                    </span>
                        <span v-else>
                        <span v-html="highLight(getNickname(sender.join(',')),true)"></span> sent to <span v-html="highLight(getNickname(recipients.join(',')+','+recipients_cc.join(',')+','+recipients_bcc.join(',')),true)"></span>{{`at ${sendTime}`}}
                    </span>
                        <!-- {{getNickname(sender)}}&emsp;于{{sendTime}}发给&emsp;{{getNickname(recipients+','+recipients_cc+','+recipients_bcc)}} -->
                    </div>
                    <div v-else class="notwrap" style="color:#979797;"  >
                        {{lang === 'zh-CN'?
                        `${getNickname(sender.join(','))} 于${sendTime}发给 ${getNickname(recipients.join(',')+','+recipients_cc.join(',')+','+recipients_bcc.join(','))}`:
                        `${getNickname(sender.join(','))} sent to ${getNickname(recipients.join(',')+','+recipients_cc.join(',')+','+recipients_bcc.join(','))} at ${sendTime}`}}
                    </div>
                    <div v-if="attachmentCount!==0"  style="color:#979797;">{{$t('mail.attachment')}}：
                        {{attachmentCount}}（
                        <div class="attachmentBrief"><span v-for="(item,index) in attachment" :key="index">
                        <span v-if="currentBox==='search'" v-html="highLight(item.fileName,true)" ></span>
                        <span v-else >{{item.fileName}}</span>
                        <span v-if="index!==attachment.length-1">，</span></span></div>
                        ）
                        <a style="color:#4285f4;" @click="scrollToAttachment">{{$t('mail.gotoAttachment')}}</a>
                    </div>
                </div>

                <ul v-show="showMore" class="detailHead" :style="mailPrintFlag ? 'font-size: 12px; opacity: 0.4; line-height: 18px;' : ''">
                    <li>{{$t('mail.writeLetter.sender')}}：
                        <!-- <span v-if="currentBox==='search'" v-html="highLight(sender,true)"></span>-->
                        <span v-for="(send) in sender" style="margin-right: 5px;" class="cursor-pointer">
                           <RecipientPoptip
                                fromFlag="mailDetail-send"
                                :currentBoxType="currentBoxType"
                                v-if="!mailPrintFlag"
                                v-bind="$attrs"
                                v-on="$listeners"
                                :params="{row: crmEmails.from.find(item => getStandardEmail(send) === item.email)}"
                                @showCompany="showCompany"
                                @showClue="showClue"
                                @createClue="createClue"
                                @handleClick="handleClick">
                            </RecipientPoptip>
                            <span v-if="currentBox==='search'" class="recipients_person" @click="copy_email_address(send)" v-html="handleHighLight(send)"></span>
                            <span v-else style="margin-left: 5px;" class="recipients_person" @click="copy_email_address(send)">{{send}}</span>
                        </span>
                    </li>
                    <li v-if="mailDetailData.displayReplyFlag === 1">{{$t('mail.replyAddress')}}：
                        <!-- <span v-if="currentBox==='search'" v-html="highLight(sender,true)"></span>-->
                        <span v-for="(send) in replyTo" style="margin-right: 5px;" class="cursor-pointer">
                           <RecipientPoptip
                                   fromFlag="mailDetail-send"
                                   :currentBoxType="currentBoxType"
                                   v-if="!mailPrintFlag"
                                   v-bind="$attrs"
                                   v-on="$listeners"
                                   :params="{row: crmEmails.replyTo.find(item => getStandardEmail(send) === item.email)}"
                                   @showCompany="showCompany"
                                   @showClue="showClue"
                                   @createClue="createClue"
                           ></RecipientPoptip>
                            <span v-if="currentBox==='search'" class="recipients_person" @click="copy_email_address(send)" v-html="handleHighLight(send)"></span>
                            <span v-else style="margin-left: 5px;" class="recipients_person" @click="copy_email_address(send)">{{send}}</span>
                        </span>
                    </li>
                    <li>{{$t('mail.writeLetter.sendTime')}}{{sendTime}}</li>

                    <li v-if="recipients.length && recipients.join('')">{{$t('mail.writeLetter.recipients')}}：
                        <!--<span v-if="currentBox==='search'" v-html="highLight(recipients,true)"></span>-->
                        <span v-for="(recipient, index) in recipients" style="margin-right: 5px;" class="cursor-pointer">
                            <RecipientPoptip
                                fromFlag="mailDetail-recipient"
                                :currentBoxType="currentBoxType"
                                v-if="!mailPrintFlag"
                                v-bind="$attrs"
                                v-on="$listeners"
                                :params="{row: crmEmails.to.find(item => getStandardEmail(recipient) === item.email)}"
                                @showCompany="showCompany"
                                @showClue="showClue"
                                @createClue="createClue"
                                @handleClick="handleClick">
                            </RecipientPoptip>
                            <span v-else-if="index !== 0">,</span>
                            <span v-if="currentBox==='search'" class="recipients_person" @click="copy_email_address(recipient)" v-html="handleHighLight(recipient)"></span>
                            <span v-else style="margin-left: 5px;" class="recipients_person" @click="copy_email_address(recipient)">{{recipient}}</span>
                        </span>
                    </li>
                    <li v-if="recipients_cc.length && recipients_cc.join('')">{{$t('mail.writeLetter.recipientCc')}}：
                        <!--<span v-if="currentBox==='search'" v-html="highLight(recipients_cc,true)"></span>-->
                        <span v-for="(cc, index) in recipients_cc" :key="index" style="margin-right: 5px;" class="cursor-pointer">
                            <RecipientPoptip
                                fromFlag="mailDetail-cc"
                                :currentBoxType="currentBoxType"
                                v-if="!mailPrintFlag"
                                v-bind="$attrs"
                                v-on="$listeners"
                                :params="{row: crmEmails.cc.find(item => getStandardEmail(cc) === item.email)}"
                                @showCompany="showCompany"
                                @showClue="showClue"
                                @createClue="createClue"
                                @handleClick="handleClick">
                            </RecipientPoptip>
                            <span v-else-if="index !== 0">,</span>
                            <span v-if="currentBox==='search'" class="recipients_person" @click="copy_email_address(cc)" v-html="handleHighLight(cc)"></span>
                            <span v-else style="margin-left: 5px;" class="recipients_person" @click="copy_email_address(cc)">{{cc}}</span>
                        </span>
                    </li>

                    <li v-if="recipients_bcc.length && recipients_bcc.join('')">
                        {{$t('mail.writeLetter.recipientBcc')}}：
                        <!--<span v-if="currentBox==='search'" v-html="highLight(recipients_bcc,true)"></span>-->
                        <span v-for="(bcc, index) in recipients_bcc" style="margin-right: 5px;" class="cursor-pointer">
                            <RecipientPoptip
                                fromFlag="mailDetail-bcc"
                                :currentBoxType="currentBoxType"
                                v-if="!mailPrintFlag"
                                v-bind="$attrs"
                                v-on="$listeners"
                                :params="{row: crmEmails.bcc.find(item => getStandardEmail(bcc) === item.email)}"
                                @showCompany="showCompany"
                                @showClue="showClue"
                                @createClue="createClue"
                                @handleClick="handleClick">
                            </RecipientPoptip>
                            <span v-else-if="index !== 0">,</span>
                            <span v-if="currentBox==='search'" class="recipients_person" @click="copy_email_address(bcc)" v-html="handleHighLight(bcc)"></span>
                            <span v-else style="margin-left: 5px;" class="recipients_person" @click="copy_email_address(bcc)">{{bcc}}</span>
                        </span>
                    </li>
                    <li v-if="attachmentCount!==0 && !mailPrintFlag">{{$t('mail.attachment')}}：
                        {{attachmentCount}}（
                        <div class="attachmentBrief">
                        <span v-for="(item,index) in attachment" :key="index">{{item.fileName}}<span
                                v-if="index!==attachment.length-1">，</span></span>
                        </div>
                        ）
                        <a style="color:#4285f4;" @click="scrollToAttachment">{{$t('mail.gotoAttachment')}}</a>
                    </li>
                    <!--当前邮件的全部追踪记录-->
                    <li v-if="mailDetailData.mailOpenTimes > 0 && !mailPrintFlag">{{$t('mail.mailOpenTimesTip')}}{{mailDetailData.mailOpenTimes}}{{$t('mail.recentOpenTimeTip')}}{{dateFormat("yyyy-MM-dd hh:mm:ss", mailDetailData.recentOpenTime)}}{{$t('mail.recentOpenPositionTip')}}{{mailDetailData.recentOpenPosition}}（{{mailDetailData.recentOpenIp}}）
                        <Poptip v-if="mailDetailData.mailOpenTimes > 1" width="600" placement="top" @show="openRecord">
                            <div style="margin: 10px 10px 0;font-size: 12px;">
                                <!-- loading -->
                                <Spin fix v-if="moreLoading"></Spin>

                                <div v-infinite-scroll="load"
                                    :infinite-scroll-distance="10"
                                    :infinite-scroll-disabled="noMore"
                                    style="max-height: 200px;overflow-y: auto;">
                                    <div v-for="eventAction in eventActionList" style="white-space: normal;">
                                        {{eventAction.openTime | timeFormat("DateTime")}}
                                        <a type="text"
                                        :style="{'color': '#4285F4', 'cursor': 'default', 'font-weight': 'bolder'}"></a>
                                        {{$t('mail.recentOpenPositionTip')}}{{eventAction.openPosition}}（{{eventAction.openIp}}）
                                    </div>
                                </div>
                                <br>
                                <div style="text-align: right">
                                    <a type="text" style="color: #4285F4;"
                                       @click="close_poptip">{{$t('close')}}</a>
                                </div>
                            </div>
                            <span slot="reference">
                                <a type="text" class="item-event more-eventaction-maildetail">{{$t('mail.more')}}>></a>
                            </span>
                        </Poptip>
                    </li>
                    <!--当前邮件的已回复记录-->
                    <li style="margin-bottom: 0;" v-if="!mailPrintFlag">
                        <div v-if="forwardMailList.length > 0 " style="margin-top: 8px;margin-bottom: 8px">
                            <span style="font-size: 12px">回复状态:&nbsp;&nbsp;  <span>已回复&nbsp;&nbsp;</span> </span>
                            <span class="show-more-separate" @click="showAllMailList=!showAllMailList">
                                {{showAllMailList?$t('distribution.takeUp'):$t('crm.Modal.details')}}
                                <Icon :class="showAllMailList?'opened':''" size="12" custom="custom li>tom-show-more"></Icon>
                            </span>
                        </div>

                        <div v-show="showAllMailList">
                            <Table class="noborder-table"
                                   style="font-size: 12px;"
                                   :data="forwardMailList"
                                   @row-click="goToForwardDetail"
                            >
                                <TableColumn v-for="(item, index) in forwardColumns"
                                             :key="index"
                                             :prop="item.key"
                                             :label="item.title"
                                             :render-header="item.renderHeader"
                                             :formatter="item.formatter"
                                             :show-overflow-tooltip="false">
                                    <template slot-scope="{ row, index }">
                                        <div v-if="item.key === 'answerAddress'" style="font-size: 12px;">
                                            <div :title="row.answerAddress[0] === '[' && row.answerAddress[row.answerAddress.length-1] === ']' ? JSON.parse(row.answerAddress) : row.answerAddress">{{getAnswerAddress(row.answerAddress)}}</div>
                                        </div>
                                        <div v-if="item.key === 'answerSubject'" style="font-size: 12px;">
                                            <div :title="row.answerSubject">
                                                <span v-if="row.answerSubject.length > 15">{{`${row.answerSubject.slice(0, 14)}...`}}</span>
                                                <span v-else>{{row.answerSubject}}</span>
                                            </div>
                                        </div>
                                        <div v-if="item.key === 'createTime'" style="font-size: 12px;">
                                            <div>{{new Date(row.createTime).format('yyyy-MM-dd hh:mm:ss')}}</div>
                                        </div>
                                    </template>
                                </TableColumn>
                            </Table>
                        </div>
                    </li>
                    <!--当前邮件的转发状态记录-->
                    <li style="margin-bottom: 0;" v-if="!mailPrintFlag">
                        <div v-if="forwardList.length > 0 " style="margin-top: 8px;margin-bottom: 8px">
                            <span style="font-size: 12px">转发状态:&nbsp;&nbsp;  <span>已转发&nbsp;&nbsp;</span> </span>
                            <span class="show-more-separate" @click="showForwardList=!showForwardList">
                                {{showForwardList?$t('distribution.takeUp'):$t('crm.Modal.details')}}
                                <Icon :class="showForwardList?'opened':''" size="12" custom="custom li>tom-show-more"></Icon>
                            </span>
                        </div>
                        <div v-show="showForwardList">
                            <Table class="noborder-table"
                                style="font-size: 12px;"
                                :data="forwardList">
                                <TableColumn v-for="(item, index) in forwardColumns"
                                             :key="index"
                                             :prop="item.key"
                                             :label="item.title"
                                             :render-header="item.renderHeader"
                                             :formatter="item.formatter"
                                             :show-overflow-tooltip="false">
                                    <template slot-scope="{ row, index }">
                                        <div v-if="item.key === 'answerAddress'" style="font-size: 12px;">
                                            <div :title="row.answerAddress[0] === '[' && row.answerAddress[row.answerAddress.length-1] === ']' ? JSON.parse(row.answerAddress) : row.answerAddress">{{getAnswerAddress(row.answerAddress)}}</div>
                                        </div>
                                        <div v-if="item.key === 'answerSubject'" style="font-size: 12px;">
                                            <div :title="row.answerSubject">
                                                <span v-if="row.answerSubject.length > 15">{{`${row.answerSubject.slice(0, 14)}...`}}</span>
                                                <span v-else>{{row.answerSubject}}</span>
                                            </div>
                                        </div>
                                        <div v-if="item.key === 'createTime'" style="font-size: 12px;">
                                            <div>{{new Date(row.createTime).format('yyyy-MM-dd hh:mm:ss')}}</div>
                                        </div>
                                    </template>
                                </TableColumn>
                            </Table>
                        </div>
                    </li>
                    <!-- 翻译行 -->
                    <li v-show="showTranslateContent">
                        {{this.$t('mail.writeTranslate.mailTranslation')}}
                        <span>{{this.$t('mail.writeTranslate.translateTo')}}&nbsp;</span>
                        <!--  @command="reply" 表示触发的事件 -->
                        <Dropdown trigger="click" @command="selectTargetLanguage">
                            <span class="translate-select">
                                <span>{{targetTranslate}}</span>
                                <Icon custom="custom-menu-arrow" color="#7B98B6" size="12"></Icon>
                            </span>
                            <DropdownMenu style="width:125px;max-height: 300px;overflow-y: auto;margin-top: 10px;" slot="dropdown">
                                <DropdownItem :disabled="item.label===targetTranslate" :style="item.label===targetTranslate?'color:#4285F4':''"  v-for="(item,index) in languageList" :key="index" :command="item">{{item.label}}</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <span class="translate-btn" v-if="showOriginal" @click="handleRevert">{{this.$t('mail.writeTranslate.showOriginalText')}}</span>
                        <span class="translate-btn" v-else @click="handleTranslate">{{this.$t('mail.writeTranslate.translate')}}</span>
                        <span class="translate-btn" @click="closeTranslate">{{this.$t('mail.writeTranslate.close')}}</span>
                    </li>
                </ul>
                <div v-if="mailDetailData.fromOrToFlag === 1 && mailDetailData.mailDraftFlag !== 1 && !mailPrintFlag" id="separateTitle" class="separateDetailContent" style="line-height: 26px; color: rgba(0, 0, 0, 0.6);">
                    <span style="font-size: 12px">发送状态:&nbsp;&nbsp;  <span class="emailSendedStatus">{{emailSendedStatus}}&nbsp;&nbsp;</span> </span>
                    <span>
                        <span
                            class="show-more-separate"
                            @click="showMoreTable=!showMoreTable">
                            {{showMoreTable?$t('distribution.takeUp'):$t('crm.Modal.details')}}
                        </span>
                        <span
                            class="show-more-separate"
                            style="margin-right: 10px;"
                            v-if="mailSendSuccFlag === '2' && separateFlag !== 1"
                            @click="() => getMailSendStatus(mailId, true)">
                            {{`[${$t('facebook.onekeyRelease.releaseSuccess.refresh')}]`}}
                            <Icon
                                    v-if="mailSendStatusLoading"
                                    custom="custom custom-refresh"
                                    style="color:rgba(0,0,0,0.4);"
                                    :class="mailSendStatusLoading?'receive-load-loop':''">
                            </Icon>
                        </span>
                        <Icon
                            :class="showMoreTable?'opened show-more-icon':'show-more-icon'"
                            size="12"
                            custom="custom custom-show-more">
                        </Icon>
                    </span>
                </div>
                <div v-show="showMoreTable && !mailPrintFlag">
                    <Table class="noborder-table separateMailInfo"
                           style="font-size: 12px;"
                           :data="data1">
                        <TableColumn v-for="(item, index) in columns1"
                                     :key="index"
                                     :prop="item.key"
                                     :label="item.title"
                                     :show-overflow-tooltip="false">
                            <template slot-scope="{ row, index }">
                                <div v-if="item.key === 'recipients'" style="font-size: 12px;">
                                    <div v-if="row.recipients.length <= 20" :title="row.recipients">{{row.recipients}}</div>
                                    <div v-else :title="row.recipients">{{`${row.recipients.slice(0, 19)}...`}}</div>
                                </div>
                                <div v-if="item.key === 'status'" style="font-size: 12px;">
                                    <div v-if="row.status === 0"  :title="`${$t('mail.writeLetter.sendErrorTitle')}${row.mailSendErrorMsg ? row.mailSendErrorMsg : ''}`">
                                        <span style="color: #EA4335;">
                                            {{$t('mail.writeLetter.sendErrorTitle')}}
                                            <span v-if="row.mailSendErrorMsg && row.mailSendErrorMsg.length <= 15">{{`：${row.mailSendErrorMsg}`}}</span>
                                            <span v-if="row.mailSendErrorMsg && row.mailSendErrorMsg.length > 15">{{`：${row.mailSendErrorMsg.slice(0, 14)}...`}}</span>
                                        </span>
                                    </div>
                                    <div v-else-if="row.status === 1" :title="$t('mail.writeLetter.sendSuccTitle')">
                                        <span style="opacity: 0.6;">{{$t('mail.writeLetter.sendSuccTitle')}}</span>
                                    </div>
                                    <div v-else-if="row.status === 2" :title="$t('mail.writeLetter.sendingMail')">
                                        <span style="opacity: 0.6;">{{$t('mail.writeLetter.sendingMail')}}</span>
                                    </div>
                                    <div v-else-if="row.status === -1" :title="$t('mail.status_1')">
                                        <span style="opacity: 0.6;">{{$t('mail.status_1')}}</span>
                                    </div>
                                    <div v-else-if="row.status === 4" :title="$t('mail.status_2')">
                                        <span style="opacity: 0.6;">{{$t('mail.status_2')}}</span>
                                    </div>
                                </div>
                                <div v-if="item.key === 'time'" style="font-size: 12px;">
                                    <div>{{row.time}}</div>
                                </div>
                            </template>
                        </TableColumn>
                    </Table>
                </div>
                <!-- 内部转发详情 -->
                <!-- 此处显示逻辑为：若用户仅为内部转发邮件的接收方，则邮件详情仅显示内部转发备注信息；若用户仅为内部转发邮件的发送方，则邮件详情仅显示内部转发邮件的详细信息
                    若用户同时满足以上两种场景，则邮件详情既显示内部转发的备注信息，又显示内部转发的详细信息 -->
                <!-- 内部转发备注 -->
                <div v-if="mailInterForwardingFlag && !mailPrintFlag" style="display: flex; align-items: center;line-height: 26px;font-size: 12px;color: rgba(0, 0, 0, 0.6);">
                    <span>{{$t('mail.repostingNotes')}}：</span>
                    <div style="flex: 1;" class="ellipsis" :title="mailInterForwardingRemark">{{mailInterForwardingRemark}}</div>
                </div>
                <!-- 分发备注信息 -->
                <div v-if="distributeRemark && distributeRemark.length" style="display: flex; align-items: center;line-height: 26px;font-size: 12px;color: rgba(0, 0, 0, 0.6);">
                    <div style="flex: 1;" class="ellipsis" :title="distributeRemark" v-html="distributeRemark"></div>
                </div>
                <!-- 内部转发状态 + 展开按钮 -->
                <div v-if="mailForwardedInternallyFlag && !mailPrintFlag" class="mailInterForwarding" style="line-height: 26px;color: rgba(0, 0, 0, 0.6);">
                    <span style="font-size: 12px">{{$t('mail.forwardingStatus')}}:<span class="mailInterForwardingStatus">{{mailInterForwardingStatus.value}}</span> </span>
                    <span>
                        <span class="show-more-separate"
                             @click="showMoreforwardingInfo=!showMoreforwardingInfo">
                            {{showMoreforwardingInfo ? $t('distribution.takeUp'):$t('crm.Modal.details')}}
                        </span>
                        <Icon :class="showMoreforwardingInfo?'opened show-more-icon':'show-more-icon'"
                            size="12"
                            custom="custom custom-show-more">
                        </Icon>
                    </span>
                </div>
                <!-- 内部转发详情表格 -->
                <div v-show="showMoreforwardingInfo && !mailPrintFlag">
                    <Table class="noborder-table mailInterForwardingInfo"
                           style="font-size: 12px;"
                           :data="mailInterForwardingData">
                        <TableColumn v-for="(item, index) in interForwardingColumn"
                                     :key="index"
                                     :prop="item.key"
                                     :label="item.title"
                                     :show-overflow-tooltip="true">
                            <template slot-scope="{ row }">
                                <div v-if="item.key === 'recipients'"
                                     style="font-size: 12px;"
                                     class="ellipsis">
                                    {{ row.generatedForwardedMailUserName }}
                                </div>
                                <div v-if="item.key === 'interForwardStatus'" style="font-size: 12px;">
                                    {{row.forwardStatus ? $t('googleOptimize.conversionSuccess') : $t('googleOptimize.conversionFail')}}
                                </div>
                                <div v-if="item.key === 'interForwardRemark'"
                                     style="font-size: 12px;"
                                     class="ellipsis">
                                    {{ row.forwardRemark }}
                                </div>
                                <div v-if="item.key === 'time'" style="font-size: 12px;">
                                    <div>{{dateFormat("yyyy-MM-dd hh:mm:ss", row.createTime)}}</div>
                                </div>
                            </template>
                        </TableColumn>
                    </Table>
                </div>
                <!-- 邮件归档详情 -->
                <!-- 邮件归档状态 + 展开按钮 -->
                <div v-if="mailArchiveData.length && !mailPrintFlag"
                     style="line-height: 26px; color: rgba(0, 0, 0, 0.6);">
                    <!-- 邮件归档状态 -->
                    <span style="font-size: 12px">{{ $t('mail.mailArchiveStatus') }}:
                        <span>{{ mailArchiveData[0].archiveStatus === 1 ? $t('crm.Modal.success') : $t('crm.Modal.error') }}</span>
                    </span>
                    <!-- 展开按钮 -->
                    <span>
                        <span @click="showArchiveTable = !showArchiveTable"
                              class="show-more-separate"> {{ showArchiveTable ? $t('distribution.takeUp'):$t('crm.Modal.details')}} </span>
                        <Icon custom="custom custom-show-more"
                              size="12"
                              class="show-more-icon"
                              :class="{'opened': showArchiveTable}" />
                    </span>
                </div>
                <!-- 邮件归档详情表格 -->
                <div v-show="showArchiveTable && !mailPrintFlag">
                    <Table :data="mailArchiveData"
                           class="noborder-table separateMailInfo">
                        <TableColumn v-for="(item, index) in mailArchiveTableColumns"
                                     :key="index"
                                     :prop="item.key"
                                     :label="item.title"
                                     :min-width="item.width"
                                     :show-overflow-tooltip="true">
                            <template slot-scope="{ row }">
                                <!-- 公司名称 -->
                                <template v-if="item.key === 'companyName'">
                                    <div v-if="row.companyName"
                                         class="ellipsis">
                                        <a @click.stop="viewCompany(row.companyId)"
                                           class="hover-link">{{ row[item.key] }}</a>
                                    </div>
                                    <div v-else>{{ '-' }}</div>
                                </template>
                                <!-- 询盘编号 -->
                                <template v-else-if="item.key === 'seqNumber'">
                                    <div v-if="row.seqNumber"
                                         class="ellipsis">
                                        <a @click.stop="viewInquiry(row.inquiryId)"
                                           class="hover-link">{{ row[item.key] }}</a>
                                    </div>
                                    <div v-else>{{ '-' }}</div>
                                </template>
                                <!-- 归档状态 -->
                                <template v-else-if="item.key === 'archiveStatus'">
                                    <!-- 成功 -->
                                    <div v-if="row.archiveStatus === 1">{{ $t('crm.Modal.success') }}</div>
                                    <!-- 失败 -->
                                    <div v-else-if="row.archiveStatus === 0"
                                         style="color: red;">{{ $t('crm.Modal.error') }}</div>
                                </template>
                                <!-- 归档时间 -->
                                <template v-else-if="item.key === 'archiveTime'">
                                    <div>{{ row.archiveTime | timeFormat('DateTime') }}</div>
                                </template>
                                <template v-else-if="item.formatter">{{ (item.formatter)(row) }}</template>
                                <template v-else>{{ row[item.key] }}</template>
                            </template>
                        </TableColumn>
                    </Table>
                </div>
                <!-- 分割线 -->
                <div v-if="mailPrintFlag" style="border-bottom: 1px solid #EAEAEA;"></div>
                <!-- 此处不知为何要加overflow-x: auto;，该样式会导致某些邮件内容展示不全。暂且去掉，观察会否有其他影响  杨娣 2020/07/03 -->
                <!-- 经观察，去掉overflow-x: auto；会导致用户在详情页无法拖动横向滚动条查看完整内容。由于后者影响远大于前者，
                因此恢复原有样式。由此衍生的邮件内容展示不全问题，由于缺乏特定测试数据，待重现时再处理 2020.09.29-->
                <div style="border-top: 1px solid #EAEAEA;padding-top: 20px;" v-if="content">
                    <!-- <div v-html="content"></div> -->
                    <iframe id="mailFrame"
                            :src="`${publicPath}mailDetail.html`"
                            :name="mailFrameName"
                            width="100%"
                            height="0"
                            style="border: none;"></iframe>
                    <!-- 自定义滚动条 -->
                    <div @scroll="handleMailHorizontalScroll"
                         ref="mailIframeScroll"
                         :style="mailScrollContainerStyleObj">
                        <div :style="mailScrollInnerStyleObj"></div>
                    </div>
                </div>
                <div ref="attachmentArea" id="attachmentArea" v-if="attachmentCount!==0" :style="mailPrintFlag ? 'font-size: 14px; opacity: 0.8; line-height: 22px;' : ''">
                    <div style="margin-bottom:10px;height:1px;background-color:#EAEAEA;"></div>
                    <div>
                        <span>{{$t('mail.attachment')}}（{{attachmentCount}}{{ $t('b2b.b2b.unit') }}）</span>
                        <span v-if="attachment.length > 1 && !mailPrintFlag" class="header-source mail-attachmentpackagedownload" style="margin-right: 10px;" @click="downloadFileZip">{{ $t('mail.packageDownload') }}</span>
                        <Icon custom="custom custom-refresh" class="receive-load-loop" v-if="isDownloadingZip" style="margin-right: 10px;"></Icon>
                        <span v-if="attachment.length > 1 && !mailPrintFlag" class="header-source" @click="copyAttachment()">{{ $t('mail.copyAttachmentAll') }}</span>
                    </div>
                    <div v-for="(item,index) in attachment" :key="index" style="margin:5px 10px">
                        <div>
                            <Icon :class="format(item)" size="16" style="color: #677f99;margin-right: 6px;"></Icon>
                            <span v-if="currentBox==='search'" v-html="highLight(item.fileName,true)"></span>
                            <span v-else >{{item.fileName}}</span>
                            <span v-if="item.fileState === 1">（{{item.fileSize}}）</span>
                        </div>
                        <div v-if="!mailPrintFlag">
                            <span @click="downloadFile(item.fileState, item.filePath,item.fileName, item.id, item.iconType)"
                              class="header-source" style="margin-right:10px;">{{$t('mail.download')}}</span>
                            <span @click="previewFile(item.fileState, item.fileType,item.filePath,item.id, item.iconType)" class="header-source" style="margin-right:10px;">{{$t('mail.preview')}}</span>
                            <span @click="copyAttachment(item)"
                              class="header-source">{{$t('mail.copyAttachments')}}</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 邮件打印的iframe容器 -->
            <iframe id="printf" name="printf" style="display: none;"></iframe>
        </Card>
        <!-- 添加标签 -->
        <Modal
            :visible.sync="addModal"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            :append-to-body="true"
            :title="$t('crm.UniSet.setting_label')"
            width="458px"
            transfer
            :mask-closable="false"
            class="add-tag">
            <div class="layermain">
                <Form label-position="left" label-width="80px">
                    <FormItem :label="$t('mail.tagName')" style="position:relative;">
                        <Input v-model.trim="tagName" placeholder="请输入"
                                style="margin-top:2px;">
                        </Input>
                        <p style="text-align:left;color:red;height: 18px;line-height: 18px;">{{ $t('mailSetting.MailTag.lengthLimit') }}</p>
                    </FormItem>
                </Form>
                <div class="label_color">
                    <span class="label_color_title">{{ '标签颜色' }}</span>
                    <Poptip v-model="colorPickerVisible"
                            style="flex: 1;display: flex;"
                            placement="bottom-end"
                            :visible-arrow="false"
                            :width="selectWidth"
                            popper-class="label_color_select"
                            ref="poptip">
                        <p class="label_color_item" slot="reference">
                            <i class="label_color_icon" :style="`background:${fontColorValue}`"></i>
                            {{ fontColorValue }}
                            <Icon :custom="`custom custom-menu-arrow-forward-medium ${colorPickerVisible ? 'is-reverse' : ''}`" size="12" style="position:absolute;right:0;"></Icon>
                        </p>
                        <ColorPicker
                            popper-class="labelDefaultColorPicker"
                            class="mail-default-color"
                            ref="colorPicker"
                            :predefine="predefineColors"
                            v-model="fontColorValue"
                            @active-change="activeColorChange"
                            @change="colorChange"
                            />
                    </Poptip>
                </div>
            </div>
            <div slot="footer">
                <Button @click="addModal = false">{{$t('crm.UniSet.modal_cancel') }}</Button>
                <Button @click="saveTag" type="primary">{{ $t('crm.UniSet.modal_ok') }}</Button>
            </div>
        </Modal>
        <Modal
            :visible.sync="deleteModel"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            :append-to-body="true"
            :title="$t('mail.deleteTitle')"
            width="520px"
            transfer
            :mask-closable="false"
            class="modal">
            <p>{{$t('mail.deleteContent')}}</p>
            <p v-if="isMergeredMailList.length">{{$t('mail.deleteConfirmTip')}}</p>
            <div slot="footer">
                <Button @click="deleteModel = false">{{$t('crm.UniSet.modal_cancel') }}</Button>
                <Button @click="foreverRemove" type="primary">{{ $t('crm.UniSet.modal_ok') }}</Button>
            </div>
        </Modal>
        <!-- 内部转发确认弹窗 -->
        <Modal :visible="visibleForwardSales"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            :destroy-on-close="true"
            :append-to-body="true"
            title="内部转发"
            :mask-closable="false"
            :show-close="false"
            width="700px"
            class="modal inter-forwarding-modal">
            <div class="inter-forwarding-container">
                <div>
                    <div>请选择转发给：</div>
                    <div class="inter-forwarding-sales-tree">
                        <div style="max-height: 350px;overflow: auto;">
                            <Tree :data="mailInterForwardingTreeData"
                                  :props="newDefaultProps"
                                  show-checkbox
                                  multiple
                                  default-expand-all
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
                <div class="inter-forwarding-footer" slot="footer">
                    <Button @click="toggleInterForwardingModal(false)" >{{ $t('crm.UniSet.modal_cancel') }}</Button>
                    <Button @click="handleMailInterForwarding" type="primary">{{ $t('crm.UniSet.modal_ok') }}</Button>
                </div>
            </div>
        </Modal>
        <!-- 分发弹框 -->
        <div v-if="distributionVisible">
            <Modal
                :visible="distributionVisible"
                :modal-append-to-body="false"
                :close-on-click-modal="false"
                :title="'分发'"
                width="700px"
                @close="handleDistributionClose"
                class="modal distribution-modal"
            >
                <div class="distribution-container">
                    <div>
                        <div>请选择分发给：</div>
                        <!-- 输入关键字 -->
                        <Input icon="ios-search-strong"
                                style="margin: 10px 0;"
                                search
                                @keyup.enter.native="handleFilterText"
                                v-model="filterText"
                                :placeholder="$t('tableFilter.tip_inputKeyWords')" >
                            <i slot="suffix" class="el-input__icon el-icon-search" style="cursor: pointer;" @click="handleFilterText"></i>
                        </Input>
                        <div class="distribution-sales-tree">
                            <div :style="`height: ${modalHeight}px; min-height: 200px;overflow: auto`">
                                <Tree
                                    v-show="distributionVisible"
                                    :props="newDefaultProps"
                                    :data="distributionTreeData"
                                    show-checkbox
                                    multiple
                                    default-expand-all
                                    node-key="id"
                                    :filter-node-method="filterNode"
                                    :render-content="renderContent"
                                    ref="distribution_tree"
                                    @check-change="change_selected_distributionIds"
                                ></Tree>
                            </div>
                        </div>
                    </div>
                    <div class="distribution-remark">
                        <Input
                            v-model="distributionRemark"
                            placeholder="请填写分发备注信息"
                            type="textarea"
                            :maxlength="2000"
                            :show-word-limit="true"
                            :autosize="{ minRows: 2, maxRows: 5 }"
                        ></Input>
                    </div>
                    <div class="distribution-footer" slot="footer">
                        <Button @click="distributionModal(false)">
                            {{$t("crm.UniSet.modal_cancel")}}
                        </Button>
                        <Button @click="handleDistribution" type="primary" :loading="enforceRulesLoading">
                            {{$t("crm.UniSet.modal_ok")}}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
        <!-- 手动收发信规则确认 -->
        <Modal
            :visible.sync="sendReceiveRulesModel"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            :append-to-body="true"
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
        <!-- 标记为垃圾邮件二次确认弹窗 -->
        <Modal
            :visible.sync="markSpamModel"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            :append-to-body="true"
            :title="$t('mail.mailDetail.markedSpam')"
            width="400px"
            transfer
            @close="() => { markSpamLoading = false; markSpamChecked = false; }"
            :mask-closable="false"
            class="modal">
            <p style="margin-bottom: 8px;">{{$t('mail.mailDetail.confirmMarkedSpam')}}</p>
            <p>
                <Checkbox v-model="markSpamChecked"></Checkbox>
                {{$t('mail.mailDetail.simultaneouslyNewRule')}}
            </p>
            <div slot="footer">
                <Button @click="markSpamModel = false; markSpamLoading = false; markSpamChecked = false;">{{$t('crm.UniSet.modal_cancel') }}</Button>
                <Button @click="handleMarkSpam" :class="markSpamChecked ? 'piwik_mark_spam_and_new_rules' : 'piwik_mark_spam'" :loading="markSpamLoading" type="primary">{{ $t('crm.UniSet.modal_ok') }}</Button>
            </div>
        </Modal>
        <!-- 右侧弹窗 -->
        <littleDrawer
            :class="$route.path === '/mail/mailDetail' ? 'mailSinglePage' : ''"
            :visible="littleDrawerVisible"
            :id="currentMailId"
            :currAccountInfo="currentMailInfo"
            :corp_columns_authorized="corp_columns_authorized"
            :inquiry_columns_authorized="inquiry_columns_authorized"
            :contact_columns_authorized="contact_columns_authorized"
            :type="littleDrawerType"
            from="mail_detail"
            @handleClick="handleClick"
            @littleDrawerHidden="littleDrawerHidden"
            @updateStatus="updateStatus"
            @updateInquiryStatus="updateInquiryStatus"
        ></littleDrawer>
        <!-- 邮件归档至 CRM -->
        <MailArchive :visible.sync="visibleArchive"
                     :archiveObjectType="archiveObjectType"
                     :mailList="[{id: mailId}]"
                     @archiveFinished="handleArchiveFinished"></MailArchive>

        <!-- 邮件日志 -->
        <MailLogModal :mailLogVisible.sync="mailLogVisible" :mailId="mailId"></MailLogModal>

        <!-- 新建邮件收发信规则 -->
        <newRules
            v-if="letAddModalShow"
            fromModal="mail"
            :letAddModalShow.sync="letAddModalShow">
        </newRules>
    </div>
</template>

<script>
    import { env } from '@/../build/config';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import MailArchive from '@/views/mail/mail-home/components/mail-table/components/Modal/MailArchive';
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import { HANDLE_HIGHLIGHT, getIsEnable, enforceRules, updateBoxType } from '@/api/mail.js';
    import JSZip from 'jszip';
    import { saveAs } from 'file-saver';
    import mailContent from '@/mixins/mailContent';
    import littleDrawer from '@/views/main-components/little-drawer/little-drawer.vue';
    import mailTranslate from '@/mixins/mailDetailTranslate'; // 引入翻译功能相关共通代码
    import MailLogModal from './Modal/mail_log_modal.vue';
    import taskPoptip from '@/views/mail/mail-home/components/taskPoptip';
    import newRules from '@/views/mail/mail-settings/modal/new_rules';
    import mailCommon from '@/api/mail/common.js';
    import tableApi from '@/api/mail/table.js';

    import { queryToolbarTriggerConfig } from '@/views/ai-toolbar/api';

    /** 判断长度 */
    String.prototype.realLength = function() {
        return this.replace(/[^\x00-\xff]/g, '**').length; // [^\x00-\xff] - 匹配非双字节的字符
    };
    export default {
        name: 'MailDetail',
        mixins: [mailContent, mailTranslate],
        components: {
            MailArchive,
            littleDrawer,
            MailLogModal,
            newRules,
            taskPoptip
        },
        props: {
            // 邮件添加智能物料相关
            replyBtn: {
                type: Boolean,
                default: false
            },
            content_height: {
                type: String
            },
            currentBox: {
                type: String
            },
            currentBoxType: {
                type: String
            },
            showToggleMailDetail: {
                type: Boolean,
                default: true
            },
            groupBoxId: String,
            corp_columns_authorized: Object,
            inquiry_columns_authorized: Object,
            contact_columns_authorized: Object,
            mailInterForwardingTreeData: Array,
            authorized_button: Object,
            newDefaultProps: {
                type: Object,
                default: () => {
                    return {
                        children: 'list',
                        label: 'name'
                    };
                }
            }
        },
        computed: {
            ...mapState({
                fullName: 'fullName',
                orgId: 'enterpriseId',
                userId: 'userId',
                userName: state => state.userName,
                window_height: state => state.window_height,
                themeKey: state => state.mail.themeKey,
                searchType: state => state.mail.searchType,
                currentPersonId: state => state.mail.currentPersonId,
                currentAccount: state => state.mail.currentAccount,
                currentInputInfo: state => state.mail.currentInputInfo,
                currentAccountIds: state => state.mail.currentAccountIds,
                downloadingMailIds: state => state.mail.downloadingMailIds,
                mailReadingMode: state => state.mail.mailReadingMode,
                customFolders: state => state.mail.customFolders,
                // 写信页面富文本编辑器 content_style 配置中会影响邮件内容渲染的样式
                tinymce_contentStyle: state => state.mail.tinymce_contentStyle,
                lang: state => state.app.lang,
                selectedMailId: state => state.mail.selectedMailId,
                isHidden: state => state.isHidden,
                mailTagList: state => state.mail.mailTagList,
                button_list: state => state.app.button_list
            }),
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            card_height() {
                return `${parseInt(this.content_height) - 90}px`;
            },
            isDownloadingZip() {
                if (this.downloadingMailIds.findIndex(item => item === this.mailId) !== -1) {
                    return true;
                } else {
                    return false;
                }
            },
            modalHeight() {
                return this.window_height - 500;
            }
        },
        data() {
            return {
                enforceRulesLoading: false, // 分发loading
                env,
                emailReg: /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/, // 邮箱检验正则
                // 静态资源文件地址
                publicPath: process.env.BASE_URL,
                mailDetailData: {},
                total_mail: 0,
                cur_mail: 0,
                mail_id_list: [],
                spinShow: true,
                mailId: '',
                mailBoxType: '',
                mailBoxTypeId: '',
                title: '',
                sender: [],
                sendTime: '',
                recipients: [], // 收件人
                recipients_cc: [], // 抄送人
                recipients_bcc: [], // 密送人
                content: '',
                attachment: [],
                attachmentCount: '',
                mailStarFlag: false, // 是否为星标邮件
                tags: [], // 这份邮件的标签
                tagList: [], // 所有标签列表
                addModal: false,
                tagName: '',
                // poptip 整体
                colorPickerVisible: false,
                selectWidth: '166',
                fontColorValue: '#71A3F5',
                predefineColors: [ '#71A3F5', '#40D9B3', '#50D4DF', '#9C8CF2', '#FF985F', '#FFCD43', '#40CEFE', '#7388B6', '#5BBA7E', '#EF7267'],
                showMore: true, // 是否显示详情
                showMoreTable: false, // 是否显示群发单显状态详情
                emailSendedStatus: '', // 发送状态
                columns1: [
                    {
                        title: '收件人',
                        key: 'recipients'
                    },
                    {
                        title: '发送状态',
                        key: 'status'
                    },
                    {
                        title: '时间',
                        key: 'time'
                    }
                ], // 群发单显状态表头
                data1: [], // 群发单显状态数据
                separateFlag: 0, // 是否为群发单显邮件 0--不是，1--是
                mailSendSuccFlag: 2, // 邮件的发送状态，包括普通邮件和群发单显邮件
                mailSendStatusLoading: false, // 是否正在获取邮件的发送状态
                forwardList: [],
                // oppositeAnsweredList: [],
                isMergeredMailList: [], // 归并到客户箱的邮件
                attachmentDataList: {}, // 从七牛获取到的附件资源数据
                eventActionList: [], // 当前邮件的全部追踪信息
                forwardMailList: [], // 当前邮件的全部回复信息
                showAllMailList: false, // 是否展开所有回复信息
                showForwardList: false,
                forwardColumns: [
                    {
                        title: '收件人',
                        key: 'answerAddress'
                    },
                    {
                        title: '主题',
                        key: 'answerSubject'
                    },
                    {
                        title: '创建时间',
                        key: 'createTime'
                    }
                ], // 已回复详情的表头信息
                crmEmails: {
                    from: [],
                    to: [],
                    cc: [],
                    bcc: [],
                    replyTo: [] // 回复地址相关
                },
                replyTo: [], // 回复地址相关
                mailAddress: '', // 创建新客户/新线索的邮箱
                mailAddType: '', // 创建新客户/新线索的邮箱，属于发件人 or 收件人 or 抄送 or 密送
                cancelFunc: null, // 取消上一次请求
                deleteModel: false, // 删除弹窗是否显示
                mailPrintFlag: false, // 邮件打印标识
                mailToDoFlag: '', // 邮件处理状态
                /* 邮件内部转发相关 */
                /* 内部转发相关 */
                visibleForwardSales: false, // 是否显示弹窗，选择邮件内部转发的销售人员
                interForwardingUsersSelected: [], // 被选中的用户集合
                mailInterForwardingInputContent: '', // 邮件内部转发的备注信息
                mailInterForwardingFlag: 0, // 邮件是否来自于内部转发 0---不是 1---是
                mailForwardedInternallyFlag: 0, // 邮件是否已被内部转发 0---否  1---是
                mailInterForwardingRemark: '', // 邮件内部转发的备注信息
                mailInterForwardingStatus: {}, // 内部转发邮件的状态信息，0--全部失败 1--部分失败 2--全部成功
                distributeRemark: '' , // 分发备注信息
                interForwardingColumn: [
                    {
                        title: this.$t('mail.interForwardingColumn1'),
                        key: 'recipients'
                    },
                    {
                        title: this.$t('mail.interForwardingColumn2'),
                        key: 'interForwardStatus'
                    },
                    {
                        title: this.$t('mail.interForwardingColumn3'),
                        key: 'interForwardRemark'
                    },
                    {
                        title: this.$t('mail.interForwardingColumn4'),
                        key: 'time'
                    }
                ], // 邮件内部转发信息表格配置项
                mailInterForwardingData: [], // 邮件内部转发的详细信息
                showMoreforwardingInfo: false, // 是否显示内部转发详情

                // 分发相关
                filterText: '',
                distributionVisible: false,
                distributionRemark: '', // 分发备注
                distributionTreeData: [],

                /* 邮件手动归档 CRM */
                // 是否显示邮件归档详情
                showArchiveTable: false,
                mailArchiveData: [],
                mailArchiveTableColumns: [
                    {
                        title: this.$t('mail.archiveObjectType'),
                        key: 'archiveObjectType',
                        width: 50,
                        formatter: row => {
                            switch (row.archiveObjectType) {
                                case 1:
                                    // 公司
                                    return this.$t('mail.customer');
                                case 3:
                                    // 询盘
                                    return this.$t('mail.inquiry');
                                default:
                                    return '-';
                            }
                        }
                    },
                    {
                        title: this.$t('crm.Modal.corp_companyName'),
                        key: 'companyName',
                        width: 160
                    },
                    {
                        title: this.$t('crm.Table.col_seqNumber'),
                        key: 'seqNumber',
                        width: 120
                    },
                    {
                        title: this.$t('mail.archiveStatus'),
                        key: 'archiveStatus',
                        width: 50
                    },
                    {
                        title: this.$t('mail.archiveTime'),
                        key: 'archiveTime',
                        width: 100
                    }
                ],
                /* 弹框 */
                // 归档弹框 visible
                visibleArchive: false,
                // 归档类型, 1 || 3 (customer || inquiry)
                archiveObjectType: 0,

                // 邮件内容 iframe name
                mailFrameName: 'mailContentFrame',
                // 模拟水平滚动条距离 offsetParent 的 bottom , 单位 px
                scrollBarBottom: 2,
                // 新增弹窗相关
                currentMailId: '',
                currentMailInfo: {},
                littleDrawerVisible: false,
                littleDrawerType: '',
                defaultProps: {
                    children: 'list'
                },
                expandedIdList: [],
                mailLogVisible: false, // 邮件日志显隐状态
                sendReceiveRulesModel: false, // 收发信规则确认弹窗状态
                enforceRulesLoading: false, // 收发信规则确认按钮 loading
                markSpamModel: false, // 标记为垃圾邮件确认弹窗状态
                markSpamChecked: false, // 标记为垃圾邮件的同时创建一条规则的选项状态
                markSpamLoading: false, // 标记垃圾邮件的确认按钮 loading
                letAddModalShow: false, // 新建规则弹框状态
                downloadLoading: false, // 下载eml
                moreLoading: true, // 追踪记录更多请求数据 loading
                noMore: false,
                pageNo: 1,
                pageSize: 20,
                visible: false
            };
        },
        methods: {
            colorRGBtoHex(color) {
                var rgb = color.split(',');
                var r = parseInt(rgb[0].split('(')[1]);
                var g = parseInt(rgb[1]);
                var b = parseInt(rgb[2].split(')')[0]); 
                var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                return hex;
            },
            activeColorChange(val) {
                this.fontColorValue = this.colorRGBtoHex(val);
            },
            colorChange(val) {
                this.colorPickerVisible = false;
            },
            // 处理邮件详情代码并渲染到iframe中
            renderCodeToIframe(mailContent) {
                /** handleMailHTML方法 和 renderMailHTML方法都来源mixins(mailContent) */
                // 生成 iframe documentElement 代码
                this.content = this.handleMailHTML(mailContent, this.themeKey);
                // 渲染代码到 iframe 中
                this.renderMailHTML(this.mailFrameName, this.content, this.handleIframeHashChange);

                // ai tool bar mail home & newWindow detail
                this.$nextTick(() => {
                    this.initAiToolBar()
                });
            },

            // ai tool bar 
            initAiToolBar () {
                const _this = this
                const iframe = document.getElementById("mailFrame");
                if(iframe) {
                    const doc = iframe.contentDocument || iframe.contentWindow.document;
                    const element = doc.getElementsByTagName('body')[0];
                    element.addEventListener('mouseup', function(e) {
                        let text;
                        const selection = iframe.contentWindow.getSelection()
                        if (selection && selection.toString().length !== 0) {
                            text = selection.toString()
                        }
                        if (text) {
                            const frameRect = iframe.getBoundingClientRect()
                            const { left, top  } = frameRect
                            setTimeout(() => {
                                _this.$aiToolBar.init({
                                    type: 'pageSelect',
                                    value: text,
                                    mouseX: left + e.clientX,
                                    mouseY: top + e.clientY,
                                })
                            }, 0)
                        }
                    });
                }
            },

            highLight(text, handleSymbol) {
                if (!text) {
                    return '';
                }
                const result = HANDLE_HIGHLIGHT(text, this.themeKey, handleSymbol);
                return result;
            },
            // 点击复制邮箱地址
            copy_email_address(copyEmail) {
                // 判断传入的字符串长度如果小于5(@.com) 则return
                if (copyEmail.length < 5) {
                    return;
                }
                let copyText = '';
                // 客户昵称或名称有可能是邮箱地址，复制了昵称或名称。增加截取尖括号里的邮箱
                const emailAddress = copyEmail.substring(copyEmail.lastIndexOf('<'));
                // 检索出邮箱
                copyText = emailAddress.match(this.emailReg)[0];
                this.$copyText(copyText).then(() => {
                    this.$Message({
                        showClose: true,
                        message: this.$t('mail.copyEmailAddressSuccess'),
                        type: 'success',
                        duration: 3000
                    });
                }, () => {
                    this.$Message({
                        showClose: true,
                        message: this.$t('mail.copyEmailAddressErr'),
                        type: 'error',
                        duration: 3000
                    });
                });
            },
            /**
             * @Description: 由于详情页的发件人/收件人/抄送人/密送人的每一个邮箱前都要加小人头标识，
             * 在highLight(HANDLE_HIGHLIGHT)方法中加小人头相关代码的话改造比较复杂，所以此处用另一种方法
             * 处理详情页的发件人/收件人/抄送人/密送人的关键字高亮匹配。
             * @author 杨娣
             * @date 2019/12/6
             */
            handleHighLight(str) {
                let result = str.split(this.themeKey);
                for (let i = 0; i < result.length; i++) {
                    let string = result[i];
                    string = string.replace(/&/g, '&amp;');
                    string = string.replace(/\"/g, '&quot;');
                    string = string.replace(/</g, '&lt;');
                    string = string.replace(/>/g, '&gt;');
                    result[i] = string;
                }
                result = result.join(`<span class='keyword'>${this.themeKey}</span>`);
                return result;
            },
            scrollToAttachment() {
                this.$refs.detailCard.$el.scrollTop = this.$refs.attachmentArea.offsetTop;
            },
            get_mail_list() {
                if (this.currentBox === 'search' && this.currentBoxType !== 'customerBox') {
                    util.oldAjax({
                        url: '/es/api/mail/searchMailIdList',
                        method: 'post',
                        data: {
                            orgId: this.orgId,
                            userId: this.currentPersonId,
                            accountId: this.currentAccount.join(',') == this.$t('mail.accountPlh') ? [] : this.currentAccount,
                            searchType: this.searchType,
                            searchContent: this.themeKey
                        }
                    }).then(({ data }) => {
                        this.mail_id_list = data.data;
                        this.total_mail = this.mail_id_list.length;
                        this.mail_id_list.some((item, i) => {
                            if (this.mailId === item) {
                                this.cur_mail = i + 1;
                                return true;
                            }
                        });
                    });
                } else {
                    util.ajaxMailJson({
                        url: '/mail/mailBoxs/ids',
                        method: 'POST',
                        data: this.$store.state.mail.mail_detail_params
                    }).then(({ data }) => {
                        if (data.code === 1) {
                            this.mail_id_list = data.data;
                            this.total_mail = this.mail_id_list.length;
                            for (let i = 0; i < this.mail_id_list.length; i++) {
                                if (this.mailId === this.mail_id_list[i]) {
                                    this.cur_mail = i + 1;
                                    break;
                                }
                            }
                        }
                    });
                }
            },
            handle_pre_next(type) {
                // 关闭邮箱翻译行
                this.showTranslateContent = false;
                this.mailSendStatusLoading = false;
                if (type === 'pre') {
                    this.$store.commit('setSelectedMailId', this.mail_id_list[this.cur_mail - 2]);
                    this.cur_mail = this.cur_mail - 1;
                } else {
                    this.$store.commit('setSelectedMailId', this.mail_id_list[this.cur_mail]);
                    this.cur_mail = this.cur_mail + 1;
                }
            },
            mailDetailinit(type) {
                if (!type || type !== 'handle_pre_next') {
                    this.mailId = this.selectedMailId;
                    this.mailBoxType = this.$store.state.mail.selectedMailBoxType;
                }
                if (!this.mailId) {
                    this.$Message.error(this.$t('crm.InqSet.error_params'));
                    return;
                }
                if (type !== 'isHidden') {
                    this.content = '';
                    this.mailDetailData = {};
                    this.showMoreforwardingInfo = false;
                    this.showMoreTable = false;
                    this.showAllMailList = false;
                    this.showForwardList = false; // 转发状态
                    this.showArchiveTable = false;
                    this.mailScrollContainerStyleObj.width = '100%';
                    this.mailScrollInnerStyleObj.width = '0';
                    // 内部转发开关及详情
                    this.mailInterForwardingData = [];
                    // 发送状态及详情
                    this.data1 = [];
                    // 回复记录开关及详情
                    this.forwardMailList = [];
                    // 转发记录开关及详情
                    this.forwardList = []; // 当前邮件的全部转发信息
                    // 归档开关及详情
                    this.mailArchiveData = [];
                }
                // 获取邮件标签 获取邮件归档数据
                this.getMailDetailOther();
                this.getMailDetailById(type);
                /**
                 * @Description: 获取群发单显状态详情的操作，应在成功获取邮件详情之后。注释此处的多余调用。
                 * @author 杨娣
                 * @date 2020/6/3
                */
            },
            /** 获取邮件详情 */
            getMailDetailById(type) {
                if (type !== 'isHidden') {
                    this.littleDrawerVisible = false;
                }
                util.ajaxMailJson({
                    url: '/mail/mailDetail',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.orgId,
                        id: this.mailId,
                        createUserId: this.currentBoxType === 'customerBox' ? this.userId : this.currentPersonId
                    },
                    timeout: 60000
                }).then(async response => {
                    if (response.data.code === 1) {
                        /**
                         * @Description: 问题描述：搜索邮件列表中包含有草稿箱邮件--->点击非草稿箱邮件进入邮件详情页
                         * --->点击右上角前一封/后一封的切换按钮--->如果切换到草稿箱邮件，就会出现草稿箱邮件显示已发送的bug；
                         * 解决方案：获取到邮件详情后，根据接口返回结果中的mailBoxTypeId判断是否是草稿箱邮件，如果是，则保存相关参数
                         * 至vuex，并切换view至write-mail。
                         * @author 杨娣
                         * @date 2019/9/10
                         */
                        /**
                         * 写信页面已经修改为当前页面打开（弹窗覆盖形式--模拟的当前页面打开）
                         * 问题描述：搜索出来的邮件列表，打开草稿箱关闭的之后还会默认再打开并且无法关闭，因为【切换view至write-mail】
                         * 解决方法：去掉 【切换view至write-mail】 的方法，
                         * @date 2021/8/4
                         */
                        if (response.data.data.mailBoxTypeId === 5) {
                            this.$store.commit('setSelectedMailId', this.mailId);
                            this.$store.commit('setSelectMailBoxType', this.getMailBox(response.data.data.mailBoxTypeId));
                            this.$store.commit('setMailEdit', true);
                            return;
                        }
                        this.mailDetailData = response.data.data;
                        this.mailDetailData.setTaskFlag = this.mailDetailData.setTaskFlag || 0;
                        this.mailDetailData.mailBoxTypeName = this.getMailBoxName(response.data.data.mailBoxTypeId);
                        this.mailDetailData.id = this.mailId;
                        // 获取邮件相关
                        const mailDetail = response.data.data;
                        this.title = (mailDetail.subject === '') ? this.$t('mail.writeLetter.noSubject') : mailDetail.subject;
                        this.sender = [mailDetail.from];
                        this.sendTime = mailDetail.sendTime.substr(0, 19);
                        this.recipients = mailDetail.recipients_to[0] === '[' && mailDetail.recipients_to[mailDetail.recipients_to.length - 1] === ']' ? JSON.parse(mailDetail.recipients_to) : mailDetail.recipients_to.split(',');
                        this.recipients_cc = mailDetail.recipients_cc[0] === '[' && mailDetail.recipients_cc[mailDetail.recipients_cc.length - 1] === ']' ? JSON.parse(mailDetail.recipients_cc) : mailDetail.recipients_cc.split(',');
                        this.recipients_bcc = mailDetail.recipients_bcc[0] === '[' && mailDetail.recipients_bcc[mailDetail.recipients_bcc.length - 1] === ']' ? JSON.parse(mailDetail.recipients_bcc) : mailDetail.recipients_bcc.split(',');
                        this.replyTo = mailDetail.replyTo && mailDetail.replyTo[0] === '[' && mailDetail.replyTo[mailDetail.replyTo.length - 1] === ']' ? JSON.parse(mailDetail.replyTo) : mailDetail.replyTo ? mailDetail.replyTo.split(',') : [];
                        this.mailStarFlag = mailDetail.mailStarFlag;
                        this.mailToDoFlag = mailDetail.mailToDoFlag;

                        /* 邮件内部转发相关,当该邮件被内部转发 or 该邮件的来源是内部转发时，需要获取内部转发的详细信息 or 内部转发的备注信息 */
                        this.mailForwardedInternallyFlag = mailDetail.mailForwardedInternallyFlag;
                        this.mailInterForwardingFlag = mailDetail.mailInterForwardingFlag;
                        // 群发单显标识
                        this.separateFlag = mailDetail.mailGroupSendingSingleShowFlag;
                        this.mailBoxTypeId = `${mailDetail.mailBoxTypeId}`;
                        if (type !== 'isHidden') {
                            // 渲染页面
                            // 暂存邮件内容 获取邮件详情中的content文本
                            let strHTML = mailDetail.content;
                            // 如果邮件内容不以此样式开头, 且此邮件是询盘云发出(注意, 只能识别已发箱邮件), 给邮件内容前面加上此样式, 避免渲染错误
                            if (!strHTML.startsWith(this.tinymce_contentStyle) && mailDetail.fromOrToFlag === 1) {
                                strHTML = this.tinymce_contentStyle + strHTML;
                            } else {
                                strHTML = `<style>div {word-break: break-all;} pre{ white-space: pre-wrap; } p{ margin: 0;}</style>${strHTML}`;
                            }
                            // 调用组件中处理邮件的方法
                            this.renderCodeToIframe(strHTML);
                            this.attachment = mailDetail.mailAttachmentList ? mailDetail.mailAttachmentList : [];
                            this.attachment.forEach((item) => {
                                if (item.fileType === '.jpg' || item.fileType === '.jpeg' || item.fileType === '.png') {
                                    item.iconType = 'image';
                                } else {
                                    item.iconType = 'document';
                                }
                                item.realFileName = item.fileName.substring(0, item.fileName.lastIndexOf('.'));
                            });
                            this.attachmentCount = mailDetail.attachmentCount;
                        }
                        /**
                         * @Description: 客户反馈, 部分邮件详情页的小人头悬浮后变色
                         * 目前未重现, 只发现了切换上一页下一页可能导致邮件小人头颜色受上一封邮件影响, 先修改了此 BUG (recipientPoptip.vue)
                         * 产品说切换邮件时最好不要有颜色的变化, 于是改后邮件详情页接口返回邮箱关联信息, 不再单独请求
                         * @author 汤一飞
                         * @date 2021/5/28
                        */
                        // this.getAllContactsStatus();
                        const crmFlagForEmail = response.data.data.crmFlagForEmail;
                        this.crmEmails = {
                            from: [],
                            to: [],
                            cc: [],
                            bcc: [],
                            replyTo: []
                        };
                        if (crmFlagForEmail) {
                            Object.entries(crmFlagForEmail).forEach(([email, valObj]) => {
                                valObj.recipient = [email];
                                valObj.email = email;
                                valObj.recieverCrmFlag = valObj.type;
                                valObj.fromOrToFlag = this.mailDetailData.fromOrToFlag;
                                valObj.replyTo = this.mailDetailData.replyTo && this.mailDetailData.replyTo[0] === '[' && this.mailDetailData.replyTo[this.mailDetailData.replyTo.length - 1] === ']' ? JSON.parse(this.mailDetailData.replyTo)[0] : (this.mailDetailData.replyTo ? this.mailDetailData.replyTo.split(',')[0] : '');
                                valObj.mailCrmFlag = valObj.type;
                                valObj.combineName = valObj.name;
                                if (this.sender.findIndex(item => item.includes(email)) !== -1) {
                                    const currentCecipients = this.sender[this.sender.findIndex(item => item.includes(email))];
                                    let contactsName = currentCecipients.substring(0, currentCecipients.indexOf('<'));
                                    if (!contactsName) {
                                        contactsName = currentCecipients.substring(1, currentCecipients.indexOf('@'));
                                    }
                                    valObj.contactsName = contactsName;
                                    this.crmEmails.from.push(valObj);
                                }
                                if (this.recipients.findIndex(item => item.includes(email)) !== -1) {
                                    const currentCecipients = this.recipients[this.recipients.findIndex(item => item.includes(email))];
                                    let contactsName = currentCecipients.substring(0, currentCecipients.indexOf('<'));
                                    if (!contactsName) {
                                        if (currentCecipients.indexOf('<') !== -1) {
                                            contactsName = currentCecipients.substring(1, currentCecipients.indexOf('@'));
                                        } else {
                                            contactsName = currentCecipients.substring(0, currentCecipients.indexOf('@'));
                                        }
                                    }
                                    valObj.contactsName = contactsName;
                                    this.crmEmails.to.push(valObj);
                                }
                                if (this.recipients_cc.findIndex(item => item.includes(email)) !== -1) {
                                    const currentCecipients = this.recipients_cc[this.recipients_cc.findIndex(item => item.includes(email))];
                                    let contactsName = currentCecipients.substring(0, currentCecipients.indexOf('<'));
                                    if (!contactsName) {
                                        if (currentCecipients.indexOf('<') !== -1) {
                                            contactsName = currentCecipients.substring(1, currentCecipients.indexOf('@'));
                                        } else {
                                            contactsName = currentCecipients.substring(0, currentCecipients.indexOf('@'));
                                        }
                                    }
                                    valObj.contactsName = contactsName;
                                    this.crmEmails.cc.push(valObj);
                                }
                                if (this.recipients_bcc.findIndex(item => item.includes(email)) !== -1) {
                                    const currentCecipients = this.recipients_bcc[this.recipients_bcc.findIndex(item => item.includes(email))];
                                    let contactsName = currentCecipients.substring(0, currentCecipients.indexOf('<'));
                                    if (!contactsName) {
                                        if (currentCecipients.indexOf('<') !== -1) {
                                            contactsName = currentCecipients.substring(1, currentCecipients.indexOf('@'));
                                        } else {
                                            contactsName = currentCecipients.substring(0, currentCecipients.indexOf('@'));
                                        }
                                    }
                                    valObj.contactsName = contactsName;
                                    this.crmEmails.bcc.push(valObj);
                                }
                                if (this.replyTo.findIndex(item => item.includes(email)) !== -1) {
                                    const currentCecipients = this.replyTo[this.replyTo.findIndex(item => item.includes(email))];
                                    let contactsName = currentCecipients.substring(0, currentCecipients.indexOf('<'));
                                    if (!contactsName) {
                                        if (currentCecipients.indexOf('<') !== -1) {
                                            contactsName = currentCecipients.substring(1, currentCecipients.indexOf('@'));
                                        } else {
                                            contactsName = currentCecipients.substring(0, currentCecipients.indexOf('@'));
                                        }
                                    }
                                    valObj.contactsName = contactsName;
                                    this.crmEmails.replyTo.push(valObj);
                                }
                            });
                        }
                        // 优化 统一使用getMailSendStatus获取发送状态即可
                        if (mailDetail.fromOrToFlag === 1) {
                            this.getMailSendStatus(this.mailId);
                        }
                        if ((this.currentPersonId === this.userId || this.currentBoxType === 'customerBox') && mailDetail.mailReadFlag === 0) {
                            this.readPart('read', true);
                        }
                    } else {
                        this.$Message({
                            type: 'error',
                            message: response.data.msg ? response.data.msg : this.$t('mail.getFailAndRetryLater'),
                            duration: 2000,
                            onClose: () => {
                                // if ([-4, -3].includes(response.data.code)) {
                                if (this.mailReadingMode === 1) {
                                    this.pageReturn();
                                } else if (this.mailReadingMode === 2) {
                                    this.$emit('handleUpdateTableData', { key: 'moveMailBoxType', ids: [this.mailId], from: 'mailDetail' });
                                } else {
                                    this.closeWindow();
                                }
                                // }
                            }
                        });
                    }
                    this.spinShow = false;
                }).catch(() => {
                    this.spinShow = false;
                    this.$Message.error(this.$t('mail.getFailAndRetryLater'));
                    this.pageReturn();
                });
            },
            /** 获取详情以外的其它数据邮件标签、邮件归档数据、当前邮件的全部追踪信息  **/
            getMailDetailOther() {
                mailCommon.getMailDetailOther({
                    userId: this.userId,
                    orgId: this.orgId,
                    id: this.mailId,
                    createUserId: this.currentBoxType === 'customerBox' ? this.userId : this.currentPersonId
                }).then(response => {
                    if (response.code === 1) {
                        // 邮件标签
                        this.tags = response.data.mailLabelList || [];
                        // 邮件归档数据
                        this.mailArchiveData = response.data.mailArchiveManuallyRecordList || [];
                        // 当前邮件是否归并到客户箱
                        this.isMergeredMailList = response.data.mergeredByMailBoxId || [];
                        // 当前邮件的全部回复信息
                        this.forwardMailList = response.data.mailAnswerRecordDtos || [];
                        // 当前邮件的转发信息 及 对方已回复
                        const mailFowardRecordDtos = response.data.mailFowardRecordDtos || [];
                        if (mailFowardRecordDtos.length) {
                            // 转发信息
                            this.forwardList = mailFowardRecordDtos.filter(item => {
                                if (item.type === 1) {
                                    return item;
                                }
                            });
                            // 对方已回复
                            // this.oppositeAnsweredList = mailFowardRecordDtos.filter(item => {
                            //     if (item.type === 2) {
                            //         return item;
                            //     }
                            // });
                        }
                        // 邮件的内部转发详细信息
                        this.mailInterForwardingData = response.data.mailInterForwardingRecordList || [];
                        // 处理内部转发数据
                        this.handleMailInterForwardingStatus();
                        // 获取接收到的内部转发邮件的备注信息
                        this.mailInterForwardingRemark = response.data.mailRemark === '客户向非负责人发送邮件自动转发至负责人' ? this.$t('mail.repostingNotesText') : response.data.mailRemark;
                        this.distributeRemark = response.data.distributeRemark ? response.data.distributeRemark.replace(/\n/g,"<br>") : '';
                    }
                }).catch(() => {
                    // 邮件标签
                    this.tags = [];
                    // 内部转发开关及详情
                    this.mailInterForwardingData = [];
                    // 回复记录开关及详情
                    this.forwardMailList = [];
                    // 转发记录开关及详情
                    this.forwardList = []; // 当前邮件的全部转发信息
                    // 归档开关及详情
                    this.mailArchiveData = [];
                    // 当前邮件是否归并到客户箱
                    this.isMergeredMailList = [];
                    // 获取接收到的内部转发邮件的备注信息
                    this.mailInterForwardingRemark = '';
                });
            },
            /* 由文件类型转换成相应的图标显示 */
            format(file) {
                const format = file.fileType.split('.')[1];
                let type = 'document';

                if (['jpg', 'jpeg', 'png', 'bmp', 'webp', 'gif', 'ico', 'psd'].indexOf(format) > -1) {
                    type = 'custom custom-image';
                } else if (['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv', 'mpg', 'mov', 'wmv', 'rm'].indexOf(format) > -1) {
                    type = 'custom custom-video';
                } else if (['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'].indexOf(format) > -1) {
                    type = 'custom custom-audio';
                } else if (['doc', 'docx'].indexOf(format) > -1) {
                    type = 'custom custom-word';
                } else if (['txt'].indexOf(format) > -1) {
                    type = 'custom custom-txt';
                } else if (['pdf'].indexOf(format) > -1) {
                    type = 'custom custom-pdf';
                } else if (['xls', 'xlsx'].indexOf(format) > -1) {
                    type = 'custom custom-excel';
                } else if (['ppt', 'pptx'].indexOf(format) > -1) {
                    type = 'custom custom-ppt';
                } else if (['epub', 'zip', 'rar'].indexOf(format) > -1) {
                    type = 'custom custom-zip';
                } else {
                    type = 'custom custom-unknown-file-format';
                }

                return type;
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
            getMailBoxName(boxId) {
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
                    case 7:
                        return this.$t('mail.groupBox');
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
            /* 获取非群发单显邮件的发送状态 */
            getMailSendStatus(mailId = this.mailId, isManually = false) {
                if (!this.mailSendStatusLoading) {
                    this.mailSendStatusLoading = true;
                    util.ajax({
                        url: '/mail/getMailSendState',
                        method: 'GET',
                        params: {
                            userId: this.currentBoxType === 'customerBox' ? this.userId : this.currentPersonId,
                            orgId: this.orgId,
                            id: mailId
                        }
                    }).then(res => {
                        this.mailSendStatusLoading = false;
                        if (res.data.code === 1) {
                            this.mailSendSuccFlag = res.data.data.mailSuccessFlag;
                            this.emailSendedStatus = this.handleNormalMailSendingStatus(this.mailSendSuccFlag);
                            let recipients = this.recipients;
                            if (this.recipients_cc.join('')) {
                                if (!this.recipients_bcc.join('')) {
                                    recipients = this.recipients.concat(this.recipients_cc);
                                } else {
                                    recipients = this.recipients.concat(this.recipients_cc).concat(this.recipients_bcc);
                                }
                            } else {
                                if (this.recipients_bcc.join('')) {
                                    recipients = this.recipients.concat(this.recipients_bcc);
                                }
                            }
                            this.data1 = [
                                {
                                    recipients: recipients.join(','),
                                    status: Number(this.mailSendSuccFlag),
                                    mailSendErrorMsg: res.data.data.mailSendErrorMsg,
                                    time: this.dateFormat('yyyy-MM-dd hh:mm:ss', this.sendTime)
                                }
                            ];
                        }
                    });
                } else {
                    if (isManually) {
                        this.$Message.warning('正在获取最新的发送结果，请不要重复操作');
                    }
                }
            },
            /** 处理群发单显邮件发送状态 */
            handleSeparateSendingStatus(status) {
                switch (status) {
                    case '-1':
                        return this.$t('mail.status_1');
                    case '0':
                        return this.$t('mail.forwardStatus0');
                    case '1':
                        return this.$t('mail.writeLetter.sendSuccTitle');
                    case '2':
                        return this.$t('mail.writeLetter.sending');
                    case '3':
                        return this.$t('mail.forwardStatus1');
                    case '4':
                        return this.$t('mail.status_2');
                    default:
                        return status;
                }
            },
            /* 处理非群发单显邮件的发送状态 */
            handleNormalMailSendingStatus(status) {
                switch (status) {
                    case '-1':
                        return this.$t('mail.status_1');
                    case '0':
                        return this.$t('mail.writeLetter.sendErrorTitle');
                    case '1':
                        return this.$t('mail.writeLetter.sendSuccTitle');
                    case '2':
                        return this.$t('mail.writeLetter.sending');
                    case '4':
                        return this.$t('mail.status_2');
                    default:
                        return status;
                }
            },
            /** 获取邮件标签 */
            getTagsById() {
                util.ajaxMail({
                    url: `/mail/maillabel/all/${this.mailId}`,
                    method: 'get',
                    params: {
                        orgId: this.orgId,
                        userId: this.userId,
                        originalCreateUserId: this.currentBoxType === 'customerBox' ? this.userId : this.currentPersonId
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        this.tags = res.data.data;
                    } else {
                        this.tags = [];
                    }
                });
            },
            /** 获取所有的标签列表 */
            getTags() {
                util.ajaxMail({
                    url: '/mail/maillabel/all',
                    method: 'get',
                    params: {
                        orgId: this.orgId,
                        createUserId: this.userId
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        // 查看下属时切到客户箱时 不刷新标签菜单
                        if (this.userId === this.currentPersonId) {
                            this.$store.commit('setTagList', res.data.data || []);
                        }
                        this.$store.commit('setMailTagList', res.data.data || []);
                    }
                });
            },
            /** 新建保存标签 */
            saveTag() {
                if (!this.tagName) {
                    this.$Message.warning(this.$t('mailSetting.MailTag.tagNameEmptyTip'));
                    return;
                } else if (this.tagName.realLength() > 20) {
                    this.$Message.warning(this.$t('mail.overLengthWarning'));
                    return;
                }
                const sameTagIndex = this.tagList.findIndex(item => item.labelName === this.tagName);
                // 判断标签名是否重复
                if (sameTagIndex !== -1) {
                    this.$Message.warning(this.$t('mail.repeatedTagName'));
                    return;
                }
                if (!this.fontColorValue || !this.fontColorValue.length) {
                    this.$Message.warning('标签颜色不能为空');
                    return;
                }
                if (this.tagList.includes(this.tagName)) {
                    const tag = this.tagList.filter(item => {
                        return item.labelName === this.tagName;
                    });
                    this.addModal = false;
                    this.tagName = '';
                    this.operateTag(tag[0].id, 1);
                    return;
                }
                const jsonData = {
                    createUserId: this.userId,
                    createUserName: this.fullName,
                    labelColor: this.fontColorValue,
                    labelName: this.tagName,
                    orgId: this.orgId
                };
                util.ajaxMailJson({
                    url: '/mail/maillabel/add',
                    method: 'post',
                    data: jsonData
                }).then(res => {
                    if (res.data.code == 1) {
                        this.tagName = '';
                        this.addModal = false;
                        this.$Message.success('成功添加标签');
                        this.getTags();
                        this.operateTag(res.data.data.id, 1);
                    } else {
                        this.$Message.error(res.data.msg);
                    }
                });
            },
            /** 跳转table根据标签查询 */
            filterTag(tagId) {
                if (this.currentBoxType !== 'customerBox') {
                    this.$emit('changeBox', `tag_${tagId}`);
                }
            },
            /** 给邮件增加删除标签 ,参数1增加/删除的标签id;参数2增加1删除0 */
            operateTag(label, type) {
                if (label === -1) {
                    return false;
                }
                if (this.currentPersonId === this.userId || this.currentBoxType === 'customerBox') {
                    if (label === 'addtag') {
                        this.addModal = true;
                        return;
                    }
                    util.ajaxMailJson({
                        url: '/mail/maillabel/operateMailLabel',
                        method: 'post',
                        data: {
                            orgId: this.orgId,
                            userId: this.userId,
                            mailBoxIds: [this.mailId],
                            mailLabelId: label,
                            operateState: type
                        }
                    }).then(res => {
                        if (res.data.code === 1) {
                            if (type) {
                                this.$Message.success('成功设置邮件标签');
                            }
                            // 分列模式下, 变更邮件处理状态时, 需要刷新左侧邮件列表
                            if (this.mailReadingMode === 2) {
                                this.$emit('handleUpdateTableData', { key: 'mailLabel', val: `${label}-${type}`, ids: [this.mailId], from: 'mailDetail' });
                            } else {
                                this.getTagsById();
                            }
                        }
                    });
                }
            },
            /** 日期格式化 */
            dateFormat(fmt, timeStramp) {
                if (typeof (timeStramp) === 'string' && timeStramp.includes('-')) {
                    timeStramp = timeStramp.replace(/\-/g, '/');
                }
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
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)));
                    }
                }
                return fmt;
            },
            async downloadFile(state, path, name, id, iconType) {
                /* state---附件状态：0附件开始接收；1已经成功接收完附件；2附件接收途中报错了;默认是1 */
                if (state !== 1) {
                    const fileInfo = await this.getAttachmentStateById([id], iconType);
                    if (fileInfo[0].fileState !== 1) {
                        this.$Message.error('当前附件还未收取完毕，请稍后再试');
                    } else {
                        path = fileInfo[0].filePath;
                        name = fileInfo[0].fileName;
                        window.open(`//${path.slice(path.split(':')[0].length + 1)}?attname=${encodeURIComponent(name)}`);
                    }
                } else {
                    window.open(`//${path.slice(path.split(':')[0].length + 1)}?attname=${encodeURIComponent(name)}`);
                }
            },
            async previewFile(state, type, path, id, iconType) {
                /* state---附件状态：0附件开始接收；1已经成功接收完附件；2附件接收途中报错了;默认是1 */
                if (state !== 1) {
                    const fileInfo = await this.getAttachmentStateById([id], iconType);
                    if (fileInfo[0].fileState !== 1) {
                        this.$Message.error('当前附件还未收取完毕，请稍后再试');
                    } else {
                        path = fileInfo[0].filePath;
                        type = fileInfo[0].fileType;
                        type = type.slice(type.lastIndexOf('.'));
                        type = type.toLowerCase();
                        if (type === '.jpg' || type === '.jpeg' || type === '.png' || type === '.gif') {
                            window.open(`${path}?imageView2/0`);
                        } else if (['.mp4', '.webm', '.pdf', '.txt'].includes(type)) {
                            window.open(path);
                        } else if (type === '.xls' || type === '.xlsx' || type === '.doc' || type === '.docx' || type === '.ppt' || type === '.pptx') {
                            window.open(`http://view.officeapps.live.com/op/view.aspx?src=${path}`);
                        } else {
                            this.$Message.info(this.$t('mail.previewErrorTip'));
                        }
                    }
                } else {
                    type = type.slice(type.lastIndexOf('.'));
                    type = type.toLowerCase();
                    if (type === '.jpg' || type === '.jpeg' || type === '.png' || type === '.gif') {
                        window.open(`${path}?imageView2/0`);
                    } else if (['.mp4', '.webm', '.pdf', '.txt'].includes(type)) {
                        window.open(path);
                    } else if (type === '.xls' || type === '.xlsx' || type === '.doc' || type === '.docx' || type === '.ppt' || type === '.pptx') {
                        window.open(`http://view.officeapps.live.com/op/view.aspx?src=${path}`);
                    } else {
                        this.$Message.info(this.$t('mail.previewErrorTip'));
                    }
                }
            },
            /* 通过附件id查询附件信息 */
            getAttachmentStateById(ids, iconType) {
                return new Promise((resolve, reject) => {
                    util.ajaxMailParamsSerializer({
                        url: '/mail/mailAttachments',
                        method: 'GET',
                        params: {
                            orgId: this.orgId,
                            userId: this.userId,
                            mailAttachementIds: ids
                        }
                    }).then(res => {
                        if (res.data.code === 1) {
                            if (ids.length === 1) {
                                const fileIndex = this.attachment.findIndex(item => item.id === ids[0]);
                                res.data.data[0].iconType = iconType;
                                this.attachment.splice(fileIndex, 1, res.data.data[0]);
                            }
                            resolve(res.data.data);
                        } else {
                            resolve(false);
                        }
                    }).catch(err => {
                        reject(err);
                    });
                });
            },
            pageReturn(ids) {
                if (this.mailReadingMode === 2) {
                    if (ids) {
                        this.$emit('updateMailList', ids);
                    } else {
                        this.$emit('updateMailList');
                    }
                    return;
                }
                setTimeout(() => {
                    if (this.mailBoxType === 'customerBox') {
                        this.$emit('handleView', 'CustomerTable');
                    } else {
                        this.$emit('handleView', 'MailTable');
                    }
                }, 1000);
            },
            reply(name) {
                // 邮件添加智能物料:
                // 当回复邮件时,给write-mail组件传一个值,这个值是传给mail-home组件的;mail-home再讲值传给write-mail;
                this.$emit('update:replyBtn', true);
                const obj = {};
                obj.mailEdit = true;
                obj.mailId = this.mailId;
                obj.createUserId = this.mailDetailData.createUserId;
                obj.replyType = name;
                if (this.$route.path === '/mail/mailDetail' && this.$route.query.id) {
                    obj.clickType = 'writeMail';
                    this.$emit('handleClick', obj);
                } else {
                    localStorage.setItem('leadsCloud-writeMailData', JSON.stringify(obj));
                    // 当前页打开邮件页面
                    this.$emit('getModalWidth');
                    this.$emit('update:mailModelVisible', true);
                }
            },
            forward(name) {
                const obj = {};
                obj.mailEdit = true;
                obj.mailId = this.mailId;
                obj.createUserId = this.mailDetailData.createUserId;
                obj.replyType = name;
                if (this.$route.path === '/mail/mailDetail' && this.$route.query.id) {
                    obj.clickType = 'writeMail';
                    this.$emit('handleClick', obj);
                } else {
                    localStorage.setItem('leadsCloud-writeMailData', JSON.stringify(obj));
                    // 当前页打开邮件页面
                    this.$emit('getModalWidth');
                    this.$emit('update:mailModelVisible', true);
                }
            },
            /* 重新编辑 */
            reedit() {
                this.visible = false;
                // 邮件添加智能物料:
                // 当回复邮件时,给write-mail组件传一个值,这个值是传给mail-home组件的;mail-home再讲值传给write-mail;
                this.$emit('update:replyBtn', false);
                const obj = {};
                obj.mailEdit = true;
                obj.mailId = this.mailId;
                obj.createUserId = this.mailDetailData.createUserId;
                obj.replyType = 'reedit';
                if (this.$route.path === '/mail/mailDetail' && this.$route.query.id) {
                    obj.clickType = 'writeMail';
                    this.$emit('handleClick', obj);
                } else {
                    localStorage.setItem('leadsCloud-writeMailData', JSON.stringify(obj));
                    // 当前页打开邮件页面
                    this.$emit('getModalWidth');
                    this.$emit('update:mailModelVisible', true);
                }
            },
            /** 星标箱移动到 */
            starMoveTo(typeId) {
                const mailMap = {};
                mailMap[this.mailId] = this.mailDetailData.mailBoxTypeId;
                util.ajaxMailJson({
                    url: '/mail/moveStarMailBox',
                    method: 'put',
                    data: {
                        orgId: this.orgId,
                        destinationMailBoxTypeId: typeId,
                        mailMap,
                        updateUserId: this.userId,
                        updateUserName: this.userName
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        if (typeId === '3') {
                            this.deleteModel = false;
                            this.$Message.success(this.$t('mail.deleteSuccTip'));
                        } else {
                            this.$Message.success(this.$t('mail.moveSuccTip'));
                        }
                    } else {
                        if (typeId === '3') {
                            this.$Message.error(this.$t('mail.deleteErrorTip'));
                        } else {
                            this.$Message.error(this.$t('editFail'));
                        }
                    }
                });
            },
            /* 删除，删除确认弹窗 */
            handleDelete() {
                // 只有垃圾箱、已删除箱才显示二次确认框，其他箱体内容直接转移到已删除箱
                if (this.currentBox === 'dustbin' || this.currentBox === 'trash' || this.mailDetailData.mailBoxTypeId === 3) {
                    this.deleteModel = true;
                } else {
                    this.remove();
                }
            },
            /**
             * 已删除箱、垃圾箱的邮件，永久删除
             * @author 崔营营
             * @date 2021/06/04
             **/
            foreverRemove() {
                const ids = [];
                ids.push(this.mailId);
                util.ajaxMailJson({
                    url: '/mail/deleteMailBox',
                    method: 'PUT',
                    data: {
                        mailBoxIds: ids,
                        updateUserId: this.userId,
                        updateUserName: this.userName,
                        enterpriseId: this.orgId
                    }
                }).then(response => {
                    if (response.data.code === 1) {
                        this.deleteModel = false;
                        this.deleteMail(ids);
                        this.$Message.success(this.$t('mail.deleteSuccTip'));
                        if (this.$route.path === '/mail/mailDetail') {
                            this.closeWindow();
                            return;
                        }
                        if (this.mailReadingMode === 2) {
                            this.$emit('handleUpdateTableData', { key: 'moveMailBoxType', ids: ids, from: 'mailDetail' });
                        } else {
                            setTimeout(() => {
                                if (this.mailBoxType === 'customerBox') {
                                    this.$emit('handleView', 'CustomerTable');
                                } else {
                                    this.$emit('handleView', 'MailTable');
                                }
                            }, 1000);
                        }
                    } else {
                        this.$Message.error(this.$t('mail.deleteErrorTip'));
                    }
                });
            },
            /** 删除 */
            remove() {
                const ids = [];
                ids.push(this.mailId);
                if (this.mailBoxType === 'star_box') {
                    this.starMoveTo('3');
                } else if (this.mailBoxType === 'customerBox') {
                    this.customerBoxMailMerger(ids);
                } else {
                    util.ajaxMailJson({
                        url: '/mail/moveMailBoxTypeId',
                        method: 'PUT',
                        data: {
                            enterpriseId: this.orgId,
                            originalMailBoxTypeId: this.mailBoxTypeId,
                            destinationMailBoxTypeId: '3',
                            mailBoxIds: ids,
                            updateUserId: this.userId,
                            updateUserName: this.userName
                        }
                    }).then(response => {
                        if (response.data.code === 1) {
                            this.deleteModel = false;
                            this.$Message.success(this.$t('mail.deleteSuccTip'));
                            if (this.$route.path === '/mail/mailDetail') {
                                this.mailDetailinit();
                                return;
                            }
                            if (this.mailReadingMode === 2) {
                                this.$store.dispatch('getUnreadMail');
                                this.$emit('handleUpdateTableData', { key: 'moveMailBoxType', ids: ids, from: 'mailDetail' });
                            } else {
                                setTimeout(() => {
                                    if (this.mailBoxType === 'customerBox') {
                                        this.$emit('handleView', 'CustomerTable');
                                    } else {
                                        this.$emit('handleView', 'MailTable');
                                    }
                                }, 1000);
                            }
                        } else {
                            this.$Message.error(this.$t('mail.deleteErrorTip'));
                        }
                    });
                }
            },
            /* 客户箱取消归并 */
            customerBoxMailMerger(ids) {
                util.ajaxMailJson({
                    url: '/mail/operateMailMerger',
                    method: 'PUT',
                    data: {
                        mailBoxIds: ids,
                        userId: this.userId,
                        orgId: this.orgId,
                        inquiryId: this.$store.state.mail.selectCustomerInquiryId
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        this.deleteModel = false;
                        this.$Message.success(this.$t('mail.cancelMergeSuccess'));
                        this.$emit('handleUpdateTableData', { key: 'moveMailBoxType', ids: ids, from: 'mailDetail' });
                    }
                });
            },
            /* 删除邮件后，向后台发送邮件id */
            deleteMail(ids) {
                util.oldAjaxJson({
                    url: '/es/api/mail/delete',
                    method: 'POST',
                    data: {
                        emailIds: ids
                    }
                }).then();
            },
            /** 标记 -已读未读和标签 */
            markAs(name) {
                if (!name) {
                    return;
                }

                switch (name) {
                    case 'read':
                    case 'unread':
                        this.readPart(name);
                        break;
                    case 'changePending':
                        this.changeProcessingState(1);
                        break;
                    case 'changeFinished':
                        this.changeProcessingState(2);
                        break;
                }
            },
            /** 标记已读/未读 */
            readPart(name, automatic = false) {
                let flag = 0;
                if (name === 'read') {
                    flag = 1;
                } else {
                    flag = 0;
                }
                if (this.currentPersonId === this.userId || this.currentBoxType === 'customerBox') {
                    const ids = (`${this.mailId}`).split(',');
                    util.ajaxMailJson({
                        url: '/mail/mailReadFlag',
                        method: 'PUT',
                        data: {
                            orgId: this.orgId,
                            ids,
                            mailReadFlag: flag,
                            updateUserId: this.userId,
                            updateUserName: this.userName
                        }
                    }).then(response => {
                        if (response.data.code === 1) {
                            this.$store.dispatch('getUnreadMail');
                            // 分列阅读模式下, 点击查看邮件详情时, 同步邮件已读未读状态到左侧列表
                            if (this.mailReadingMode === 2) {
                                this.$emit('handleUpdateTableData', { key: 'fav', val: `${flag}`, ids: [this.mailId], from: 'mailDetail', automatic });
                            }
                            // 更新"新收邮件未读数统计数据", 从中剔除掉已读邮件
                            if (flag === 1) {
                                this.$store.commit('updateNewReceiveMails', {
                                    type: 'removeRead',
                                    data: ids
                                });
                            }
                        }
                    });
                }
            },
            /**
             * 移动到自定义文件夹
             */
            moveTo(name) {
                if (name === -1) {
                    return false;
                }
                const ids = [];
                ids.push(this.mailId);
                if (this.mailBoxTypeId === 'star_box') {
                    this.starMoveTo(name);
                } else {
                    util.ajaxMailJson({
                        url: '/mail/moveMailBoxTypeId',
                        method: 'PUT',
                        data: {
                            enterpriseId: this.orgId,
                            originalMailBoxTypeId: this.mailBoxTypeId,
                            destinationMailBoxTypeId: name,
                            mailBoxIds: ids,
                            updateUserId: this.userId,
                            updateUserName: this.userName
                        }
                    }).then(response => {
                        if (response.data.code === 1) {
                            this.$Message.success(this.$t('mail.moveSuccTip'));
                            if (this.currentBox) {
                                if (this.currentBox === 'star_box' ||
                                    this.currentBox === 'search' ||
                                    this.currentBox === 'unreadBox' ||
                                    this.currentBox === 'untreated' ||
                                    this.currentBox.indexOf('tag') === 0) {
                                    // this.pageReturn();
                                } else {
                                    if (this.mailReadingMode === 2) {
                                        this.$emit('handleUpdateTableData', { key: 'moveMailBoxType', ids: ids, from: 'mailDetail' });
                                    } else {
                                        setTimeout(() => {
                                            if (this.mailBoxType === 'customerBox') {
                                                this.$emit('handleView', 'CustomerTable');
                                            } else {
                                                this.$emit('handleView', 'MailTable');
                                            }
                                        }, 1000);
                                    }
                                }
                            }
                        }
                    });
                }
            },
            /** 获取颜色的深浅度  返回 深色返白色；浅色反黑色 */
            getRGB(val) {
                const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
                const color = val.toLowerCase();
                const result = '';
                if (reg.test(color)) {
                    if (color.length === 4) {
                        const colorNew = '#';
                        for (let i = 0; i < 4; i += 1) {
                            colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
                        }
                        color = colorNew;
                    }
                    const colorChange = [];
                    for (let i = 1; i < 7; i += 2) {
                        colorChange.push(parseInt('0x' + color.slice(i, i + 2)));
                    }
                    const grayLevel = colorChange[0] * 0.299 + colorChange[1] * 0.587 + colorChange[2] * 0.114;
                    if (grayLevel > 192) {
                        return '#333';
                    } else {
                        return '#fff';
                    }
                } else {
                    result = '无效';
                    return result;
                }
            },
            /** 从邮件地址获取昵称 */
            getNickname(name) {
                let emailArr = name.split(',');
                emailArr = emailArr.filter(item => { return item; });
                emailArr = emailArr.map(email => {
                    const reg = /[\<]{1}[\s\S]*?[\>]{1}/;
                    //   let reg = /<?[a-z0-9]+([.]?[-_a-z0-9]+)*@([a-z0-9]+([.-][a-z0-9]+)*\.)[a-z0-9]+>?/i
                    let nickname = email.replace(reg, '');
                    nickname = nickname.trim();
                    return nickname || email;
                });
                return emailArr.join(',');
            },
            /* 附件打包下载 */
            async downloadFileZip() {
                const ids = this.attachment.map(item => item.id);
                const filesInfo = await this.getAttachmentStateById(ids);
                this.attachment = this.getAttachmentIcon(filesInfo);
                if (filesInfo.some(item => item.fileState !== 1)) {
                    this.$Message.error('当前附件还未收取完毕，请稍后再试');
                } else {
                    if (this.downloadingMailIds.findIndex(item => item === this.mailId) !== -1) {
                        this.$Message.warning(this.$t('mail.packageDownloading'));
                        return;
                    }
                    const vm = this;
                    const promises = [];
                    this.$store.commit('setDownloadingMailIds', this.mailId);
                    for (let i = 0; i < this.attachment.length; i++) {
                        promises.push(vm.getFileData(this.attachment[i]));
                    }
                    Promise.all([...promises]).then(() => {
                        const zip = new JSZip();
                        let attachmentData = this.attachment;
                        attachmentData = this.handleSameNameFile(attachmentData);
                        for (let i = 0; i < attachmentData.length; i++) {
                            const currAtta = attachmentData[i];
                            const id = currAtta.id;
                            zip.file(currAtta.newFileName, vm.attachmentDataList[id].data);
                        }
                        zip.generateAsync({ type: 'blob' })
                            .then(function(content) {
                                // see FileSaver.js
                                saveAs(content, `${vm.title}.zip`);
                                vm.$store.commit('setDownloadingMailIds', vm.mailId);
                            });
                    }).catch((err) => {
                        console.error(err);
                        vm.$store.commit('setDownloadingMailIds', vm.mailId);
                        vm.$Message.error(this.$t('mail.error_packageDownload'));
                    });
                }
            },
            /* 处理同名文件 */
            handleSameNameFile(files) {
                const tempArr = [];
                let lastIndex = -1;
                for (let i = 0; i < files.length; i++) {
                    const tempFileNames = tempArr.map(item => item.fileName);
                    const newFileNames = tempArr.map(item => item.newFileName);
                    if (tempArr.length) {
                        lastIndex = tempFileNames.lastIndexOf(files[i].fileName);
                    }
                    if (lastIndex !== -1) {
                        if (tempArr[lastIndex].repeatIndex) {
                            const index = Number(tempArr[lastIndex].repeatIndex.slice(-2, -1));
                            files[i].repeatIndex = `(${index + 1})`;
                        } else {
                            files[i].repeatIndex = '(1)';
                        }
                    }
                    let newFileName = '';
                    if (files[i].repeatIndex) {
                        newFileName = `${files[i].realFileName} ${files[i].repeatIndex}${files[i].fileType}`;
                        if (newFileNames.findIndex(item => item === newFileName) !== -1) {
                            newFileName = `${files[i].realFileName} (${Number(files[i].repeatIndex.slice(-2, -1)) + 1})${files[i].fileType}`;
                        }
                    } else {
                        newFileName = `${files[i].realFileName}${files[i].fileType}`;
                    }
                    files[i].newFileName = newFileName;
                    tempArr.push(files[i]);
                }
                return tempArr;
            },
            getAttachmentIcon(attachments) {
                attachments.forEach((item) => {
                    if (item.fileType === '.jpg' || item.fileType === '.jpeg' || item.fileType === '.png') {
                        item.iconType = 'image';
                    } else {
                        item.iconType = 'document';
                    }
                    item.realFileName = item.fileName.substring(0, item.fileName.lastIndexOf('.'));
                });
                return attachments;
            },
            getFileData(file) {
                return new Promise((resolve, reject) => {
                    util.ajaxDownloadFile({
                        url: file.filePath,
                        method: 'get',
                        params: {
                            attname: file.fileName
                        }
                    }).then(res => {
                        this.attachmentDataList[file.id] = {};
                        this.attachmentDataList[file.id] = res;
                        resolve(res);
                    }).catch(error => {
                        console.error(error);
                        this.attachmentDataList[file.id] = {};
                        reject();
                    });
                });
            },
            /* 获取标准格式的邮箱 */
            getStandardEmail(emailAdd) {
                if (emailAdd && emailAdd.lastIndexOf('<') !== -1) {
                    const startIndex = emailAdd.lastIndexOf('<');
                    return emailAdd.slice(startIndex + 1, emailAdd.length - 1);
                } else {
                    return emailAdd;
                }
            },
            /* 获取邮件详情 */
            goToForwardDetail(row) {
                util.ajaxMailJson({
                    // url: `/mail/mailDetail/${row.answerMailId}`,
                    url: '/mail/mailDetail',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.orgId,
                        id: row.answerMailId,
                        createUserId: this.currentBoxType === 'customerBox' ? this.userId : this.currentPersonId
                    },
                    timeout: 60000
                }).then(res => {
                    if (res.data.code === 1) {
                        const forwardMailDetail = Object.assign(res.data.data, { id: row.answerMailId });
                        localStorage.setItem('leadsCloud-currentPersonId', res.data.data.createUserId);
                        localStorage.setItem('leadsCloud-currentAccount', JSON.stringify({
                            currentAccount: this.currentAccount,
                            currentInputInfo: this.currentInputInfo,
                            currentAccountIds: this.currentAccountIds
                        }));
                        const href = window.location.origin + window.location.pathname + this.$router.resolve({
                            name: 'mail_home'
                        }).href;
                        localStorage.setItem('leadsCloud-timeLine-mailDetail', JSON.stringify(forwardMailDetail));
                        window.open(href, '_blank');
                    } else {
                        this.$Message.error('回复邮件已被删除，无法查看！');
                    }
                });
            },
            close_poptip() {
                document.body.click();
            },
            /** 从已删除恢复邮件 */
            restore() {
                const params = {};
                params.fromOrToFlag = this.mailDetailData.fromOrToFlag;
                params.mailBoxId = this.mailDetailData.id;
                params.mailBoxTypeId = this.mailDetailData.mailBoxTypeId;
                params.originalMailBoxTypeId = this.mailDetailData.originalMailBoxTypeId;
                params.mailDraftFlag = this.mailDetailData.mailDraftFlag;
                if (this.mailId) {
                    util.ajaxJson({
                        url: '/mail/reductionMailBoxTypeId',
                        method: 'PUT',
                        data: {
                            enterpriseId: this.orgId,
                            updateUserId: this.userId,
                            updateUserName: this.userName,
                            mailBoxTypeConditionList: [params]
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
                            if (this.$route.path === '/mail/mailDetail') {
                                this.mailDetailinit();
                                return;
                            }
                            // 通用返回列表
                            if (this.mailReadingMode === 2) {
                                this.$emit('handleUpdateTableData', { key: 'moveMailBoxType', ids: [this.mailId], from: 'mailDetail' });
                            } else {
                                setTimeout(() => {
                                    if (this.mailBoxType === 'customerBox') {
                                        this.$emit('handleView', 'CustomerTable');
                                    } else {
                                        this.$emit('handleView', 'MailTable');
                                    }
                                }, 1000);
                            }
                        } else {
                            this.$Message.success(this.$t('mail.restoreErrorTip'));
                        }
                    });
                }
            },
            /** 从垃圾箱或者自定义文件夹还原邮件 */
            moveRestore() {
                const selectedList = [this.mailDetailData];
                const paramsList = [];
                const ids = [];
                for (let m = 0; m < selectedList.length; m++) {
                    const obj = {};
                    obj.fromOrToFlag = selectedList[m].fromOrToFlag;
                    obj.mailBoxId = selectedList[m].id;
                    obj.mailDraftFlag = selectedList[m].mailDraftFlag;
                    obj.mailBoxTypeId = selectedList[m].mailBoxTypeId;
                    obj.originalMailBoxTypeId = selectedList[m].originalMailBoxTypeId;
                    paramsList.push(obj);
                    ids.push(selectedList[m].id);
                }
                util.ajaxMailJson({
                    url: '/mail/batchRecoverMailBoxTypeId',
                    method: 'PUT',
                    data: {
                        enterpriseId: this.orgId,
                        updateUserId: this.userId,
                        updateUserName: this.userName,
                        mailBoxTypeConditionList: paramsList
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        this.$Message.success(this.$t('mail.moveRestoreSuccTip'));
                        if (this.$route.path === '/mail/mailDetail') {
                            this.mailDetailinit();
                            return;
                        }
                        if (this.mailReadingMode === 2) {
                            this.$emit('handleUpdateTableData', { key: 'moveMailBoxType', ids: [this.mailId], from: 'mailDetail' });
                        } else {
                            setTimeout(() => {
                                if (this.mailBoxType === 'customerBox') {
                                    this.$emit('handleView', 'CustomerTable');
                                } else {
                                    this.$emit('handleView', 'MailTable');
                                }
                            }, 1000);
                        }
                    } else {
                        this.$Message.error(this.$t('mail.moveRestoreErrorTip'));
                    }
                });
            },
            createClue(mailId, email, currentMailAddType, currentMailInfo) {
                if (this.mailReadingMode === 2) {
                    this.$emit('createClue', mailId, email, currentMailAddType, currentMailInfo);
                } else {
                    if (this.mailAddress === email) return;
                    this.littleDrawerType = 'journeyDetail';
                    this.littleDrawerVisible = false;
                    this.$nextTick(() => {
                        this.littleDrawerVisible = true;
                    });
                    this.mailAddType = currentMailAddType;
                    this.mailAddress = email;
                    this.currentMailId = mailId;
                    this.currentMailInfo = currentMailInfo;
                    this.currentMailInfo.mailAddress = email;
                }
            },
            // 录入为线索后
            updateStatus(clueId, status) {
                this.currentMailInfo.mailAddress = '';
                this.showClue({ clueId, type: 1, currentMailInfo: { mailAddress: this.mailAddress, mailCrmFlag: status } });
                this.updateMailCrmStatus(this.mailAddress, status);
            },
            // 录入成询盘后
            updateInquiryStatus(clueId, status) {
                this.currentMailInfo.mailAddress = '';
                this.getInquiryAndCompanyInfoByEmails();
                this.updateMailCrmStatus(this.mailAddress, status);
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
                        const currentMailInfo = Object.assign({ mailAddress: this.mailAddress, mailCrmFlag: response.data.data[this.mailAddress].type }, response.data.data[this.mailAddress])
                        this.showCompany({
                            companyId,
                            type: 1,
                            currentMailInfo: currentMailInfo
                        });
                    }
                });
            },
            updateMailCrmStatus(email, status) {
                if (this.mailAddType === 'mailDetail-send') {
                    changeCrmStatus(this.crmEmails.from);
                }
                if (this.mailAddType === 'mailDetail-recipient') {
                    changeCrmStatus(this.crmEmails.to);
                }
                if (this.mailAddType === 'mailDetail-cc') {
                    changeCrmStatus(this.crmEmails.cc);
                }
                if (this.mailAddType === 'mailDetail-bcc') {
                    changeCrmStatus(this.crmEmails.bcc);
                }

                function changeCrmStatus(emailArr) {
                    emailArr.forEach(item => {
                        if (item.email === email) {
                            item.type = status;
                        }
                        return item;
                    });
                }
            },
            /** 显示详情 */
            async showCompany({ companyId, rightUserIds, type, currentMailInfo }) {
                if (this.mailReadingMode === 2) {
                    this.$emit('showCompany', { companyId, rightUserIds, type, currentMailInfo });
                    return;
                }
                if (this.currentMailInfo.mailAddress === currentMailInfo.mailAddress) return;
                this.currentMailInfo = Object.assign({ noHaveManageAuthority: true }, currentMailInfo);
                this.mailAddress = '';
                // if (type === 0) {
                //     if (!this.isContainsMenu('highseasCustomer')) {
                //         this.littleDrawerType = 'journeyDetail';
                //         this.littleDrawerVisible = false;
                //         this.$nextTick(() => {
                //             this.littleDrawerVisible = true;
                //         });
                //         // this.$Message.warning('您没有查看公海数据的权限，无法查看');
                //         return;
                //     }
                // } else {
                //     if (this.isContainsMenu('myCustomer')) {
                //         if (type === 2) {
                //             const flag = await this.isHaveManageAuthority(rightUserIds);
                //             if (!flag) {
                //                 this.littleDrawerType = 'journeyDetail';
                //                 this.littleDrawerVisible = false;
                //                 this.$nextTick(() => {
                //                     this.littleDrawerVisible = true;
                //                 });
                //                 // this.$Message.warning('您当前无权限查看此客户');
                //                 return false;
                //             }
                //         }
                //     } else {
                //         this.littleDrawerType = 'journeyDetail';
                //         this.littleDrawerVisible = false;
                //         this.$nextTick(() => {
                //             this.littleDrawerVisible = true;
                //         });
                //         // this.$Message.warning('您没有客户管理页面的查看权限，请联系您的管理员开通');
                //         return false;
                //     }
                // }
                this.littleDrawerVisible = false;
                this.$nextTick(() => {
                    this.currentMailId = companyId;
                    this.littleDrawerType = 'customer';
                    if (type === 0) {
                        this.littleDrawerType = 'highseasCustomer';
                    }
                    this.littleDrawerVisible = true;
                });
            },
            async showClue({ clueId, rightUserIds, type, currentMailInfo }) {
                if (this.mailReadingMode === 2) {
                    this.$emit('showClue', { clueId, rightUserIds, type, currentMailInfo });
                    return;
                }
                if (this.currentMailInfo.mailAddress === currentMailInfo.mailAddress) return;
                this.currentMailInfo = Object.assign({ noHaveManageAuthority: true }, currentMailInfo);
                this.mailAddress = '';
                // if (type === 0) {
                //     if (!this.isContainsMenu('common_sea_customer')) {
                //         this.littleDrawerType = 'journeyDetail';
                //         this.littleDrawerVisible = false;
                //         this.$nextTick(() => {
                //             this.littleDrawerVisible = true;
                //         });
                //         return;
                //     }
                // } else {
                //     if (this.isContainsMenu('my_clue') && !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.id, this.button_list)) {
                //         if (type === 2) {
                //             const flag = await this.isHaveManageAuthority(rightUserIds);
                //             if (!flag) {
                //                 this.littleDrawerType = 'journeyDetail';
                //                 this.littleDrawerVisible = false;
                //                 this.$nextTick(() => {
                //                     this.littleDrawerVisible = true;
                //                 });
                //                 return false;
                //             }
                //         }
                //     } else {
                //         this.littleDrawerType = 'journeyDetail';
                //         this.littleDrawerVisible = false;
                //         this.$nextTick(() => {
                //             this.littleDrawerVisible = true;
                //         });
                //         return false;
                //     }
                // }
                this.$nextTick(() => {
                    this.currentMailId = clueId;
                    this.littleDrawerVisible = false;
                    this.$nextTick(() => {
                        this.littleDrawerVisible = true;
                    });
                    if (type === 1 || type === 2) {
                        this.type_clue = 'clue';
                        this.littleDrawerType = 'clue';
                    } else if (type === 0) {
                        this.type_clue = 'highseasClue';
                        this.littleDrawerType = 'highseasClue';
                    }
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
            getAnswerAddress(address) {
                address = address[0] === '[' && address[address.length - 1] === ']' ? JSON.parse(address)[JSON.parse(address).length-1] : address;
                address = this.getStandardEmail(address);
                if (address.length > 20) {
                    return `${address.slice(0, 14)}...`;
                } else {
                    return address;
                }
            },

            /* 邮件内容打印 */
            handlePrint() {
                const originalShowMore = this.showMore;
                this.mailPrintFlag = true;
                this.showMore = true;
                this.$nextTick(() => {
                    this.printMailHtml(this.content, document.querySelector('.mail-content'), this.mailFrameName, 'printf');

                    // const printHtml = document.querySelector('.mail-content').innerHTML; // 需要打印的内容
                    // // const newWin = window.open('', 'newwindow');
                    // // newWin.document.write('<html><head><title>Print title!</title><style>// 添加样式内容</style></head><body>')
                    // // newWin.document.write(printHtml);
                    // // newWin.document.write('</body></html>');
                    // // newWin.print();
                    // // newWin.close(); // 打印完成后关闭
                    // const newWin = window.frames.printf;
                    // newWin.document.write(`<html><head><style media="print">* {word-wrap: break-word; word-break: break-word;}ul li {font-size: 16px;line-height: 36px;font-weight: 400; list-style-type:none;}</style></head><body onload="window.print()">${printHtml}</body></html>`);
                    // newWin.document.close();
                    this.mailPrintFlag = false;
                    this.showMore = originalShowMore;
                });
            },
            /* 邮件标记星标 / 取消星标 */
            sign_star(flag) {
                util.ajaxMailJson({
                    url: '/mail/mailBoxs/starMailBox',
                    method: 'put',
                    data: {
                        orgId: this.orgId,
                        ids: [this.mailId],
                        mailStarFlag: flag,
                        updateUserId: this.userId,
                        updateUserName: this.userName
                    }
                }).then(({ data }) => {
                    if (data.code === 1) {
                        this.mailStarFlag = String(flag);
                        // 分列模式下, 变更邮件处理状态时, 需要刷新左侧邮件列表
                        if (this.mailReadingMode === 2) {
                            this.$emit('handleUpdateTableData', { key: 'mailStarFlag', val: `${flag}`, ids: [this.mailId], from: 'mailDetail' });
                        }
                    } else {
                        this.$Message.error(this.$t('mail.flag_star_error'));
                    }
                }).catch((err) => {
                    this.$Message.error(this.$t('mail.flag_star_error'));
                    console.log('星标操作失败', err);
                });
            },
            /* 改变邮件的处理状态 */
            changeProcessingState(status, mailIds = [this.mailId]) {
                util.ajaxJson({
                    url: '/mail/toDoMail',
                    method: 'post',
                    data: {
                        ids: mailIds,
                        mailFlag: status,
                        orgId: this.orgId,
                        userId: this.userId
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        this.mailToDoFlag = status;
                        switch (status) {
                            case 1:
                                this.$Message.success(this.$t('mail.markAsUntreatedSuccess'));
                                break;
                            case 2:
                                this.$Message.success(this.$t('mail.markAsFinishedSuccess'));
                                break;
                        }
                        this.$store.dispatch('getUnreadMail');
                        // 分列模式下, 变更邮件处理状态时, 需要刷新左侧邮件列表
                        if (this.mailReadingMode === 2) {
                            this.$emit('handleUpdateTableData', { key: 'mailToDoFlag', val: status, ids: [this.mailId], from: 'mailDetail' });
                        }
                    }
                }).catch(err => {
                    console.log('changeProcessingState()---err', err, status);
                });
            },
            /* 内部转发相关 */
            /* 获取邮件的内部转发详细信息 */
            getMailInterForwardingData(isRefresh) {
                return new Promise((resolve, reject) => {
                    util.ajax({
                        url: '/mail/mailInterForwardingRecord/getMailInterForwardingRecords',
                        method: 'GET',
                        params: {
                            orgId: this.orgId,
                            forwardBasedOnMailId: this.mailId
                        }
                    }).then(res => {
                        if (res.data.code === 1) {
                            this.mailInterForwardingData = Array.isArray(res.data.data) ? res.data.data : [];

                            // 处理内部转发数据
                            this.handleMailInterForwardingStatus();

                            // 如果当前场景是"转发操作完成, 重新请求内部转发表格数据"
                            if (isRefresh) {
                                // 更新邮件被转发状态为 true
                                this.mailForwardedInternallyFlag = 1;
                            }

                            resolve(true);
                        } else {
                            this.mailInterForwardingData = [];
                            resolve(true);
                        }
                    }).catch(err => {
                        console.log('获取内部转发详情信息失败', err);
                        this.mailInterForwardingData = [];
                        resolve(true);
                    });
                    resolve(true);
                });
            },
            /* 根据获取到的内部转发详细信息，计算邮件内部转发是否全部成功/全部失败/部分失败 */
            handleMailInterForwardingStatus() {
                const tempData = this.mailInterForwardingData;
                const tempObj = {};
                const that = this;
                if (tempData.every(item => item.forwardStatus === 1)) {
                    /* 全部成功 */
                    tempObj.forwardStatus = 2;
                    tempObj.value = that.$t('mail.forwardStatus2');
                } else if (tempData.every(item => item.forwardStatus === 0)) {
                    /* 全部失败 */
                    tempObj.forwardStatus = 0;
                    tempObj.value = that.$t('mail.forwardStatus0');
                } else {
                    /* 部分失败 */
                    tempObj.forwardStatus = 1;
                    tempObj.value = that.$t('mail.forwardStatus1');
                }
                this.mailInterForwardingStatus = tempObj;
            },
            /* 分发相关 */
            // 关键字过滤
            handleFilterText() {
                this.$refs.distribution_tree.filter(this.filterText);
            },
            /* 控制内部转发弹窗的显隐规则 */
            distributionModal(isVisible) {
                this.distributionVisible = isVisible;
                if (!isVisible) {
                    this.handleDistributionClose();
                } else {
                    this.visible = false;
                }
            },
            // 处理分发的业务逻辑
            handleDistribution() {
                let ids = [];
                if (!this.interForwardingUsersSelected.length) {
                    this.$Message.warning('请至少选择一位接收人');
                    return false;
                }
                if (this.enforceRulesLoading) { return; }
                this.distributionLoading = true;
                const dataJson = {
                    orgId: this.orgId,
                    operateUserId: this.userId,
                    operateUserName: this.fullName,
                    userList: this.interForwardingUsersSelected,
                    mailIdList: [this.mailId],
                    remark: this.distributionRemark
                }
                this.$util.ajaxJson({
                    url: '/mail/distributeMail',
                    method: 'post',
                    data: dataJson
                }).then((res) => {
                    if (res.data.code === 1) {
                        this.$Message.success('分发成功');
                        this.handleDistributionClose();
                        if (this.$route.path === '/mail/mailDetail') {
                            this.mailDetailinit();
                            return;
                        }
                        if (this.mailReadingMode === 2) {
                            this.$store.dispatch('getUnreadMail');
                            this.$emit('handleUpdateTableData', { key: 'moveMailBoxType', ids: ids, from: 'mailDetail' });
                        } else {
                            setTimeout(() => {
                                if (this.mailBoxType === 'customerBox') {
                                    this.$emit('handleView', 'CustomerTable');
                                } else {
                                    this.$emit('handleView', 'MailTable');
                                }
                            }, 1000);
                        }
                    } else {
                        this.$Message.error('分发失败，请重试');
                    }
                    this.distributionLoading = false;
                }).catch(() => {
                    this.distributionLoading = false;
                    this.$Message.error('分发失败，请重试');
                });
            },
            // 分发弹窗 closed 回调
            handleDistributionClose() {
                // 清空用户树选中项  分发
                this.$refs.distribution_tree.setCheckedKeys([]);
                // 清空分发选中用户
                this.interForwardingUsersSelected = [];
                // 清空分发备注信息
                this.distributionRemark = '';
                this.distributionVisible = false;
                // 清空过滤数据
                this.filterText = '';
            },
            /* 部门树选中项变化 */
            change_selected_distributionIds() {
                const person_arr = this.$refs.distribution_tree.getCheckedNodes();
                this.interForwardingUsersSelected = person_arr
                    .filter((item) => item.infoType === 1)
                    .map((item) => {
                        return {
                            userId: item.id,
                            userName: item.name
                        };
                    });
            },
            // 分发过滤数据
            filterNode(value, data, node) {
                // 如果什么都没填就直接返回  搜索
                if (!value) return true;
                // 如果传入的value和data中的label相同说明是匹配到了
                if (data.name.indexOf(value) !== -1) {
                    return true;
                }
                // 否则要去判断它是不是选中节点的子节点
                return this.checkBelongToChooseNode(value, data, node);
            },
            // 判断传入的节点是不是选中节点的子节点
            checkBelongToChooseNode(value, data, node) {
                const level = node.level;
                // 如果传入的节点本身就是一级节点就不用校验了
                if (level === 1) {
                    return false;
                }
                // 先取当前节点的父节点
                let parentData = node.parent;
                // 遍历当前节点的父节点
                let index = 0;
                while (index < level - 1) {
                    // 如果匹配到直接返回
                    if (parentData.data.name.indexOf(value) !== -1) {
                        return true;
                    }
                    // 否则的话再往上一层做匹配
                    parentData = parentData.parent;
                    index++;
                }
                // 没匹配到返回false
                return false;
            },
            /* 邮件归档相关 */
            // 获取邮件的邮件归档详细信息
            getMailArchiveData() {
                return new Promise((resolve, reject) => {
                    util.ajax({
                        url: '/mail/mailArchiveManuallyRecord/getMailArchiveManuallyRecords',
                        method: 'GET',
                        params: {
                            orgId: this.orgId,
                            mailBoxId: this.mailId
                        }
                    }).then(res => {
                        if (res.data.code === 1) {
                            this.mailArchiveData = Array.isArray(res.data.data) ? res.data.data : [];

                            resolve(true);
                        } else {
                            this.mailArchiveData = [];
                            resolve(true);
                        }
                    }).catch(err => {
                        console.log('获取邮件归档详情信息失败', err);
                        this.mailArchiveData = [];
                        resolve(true);
                    });
                    resolve(true);
                });
            },
            // 邮件归档至 CRM
            archiveToCRM(type) {
                this.visibleArchive = true;
                this.archiveObjectType = type;
            },
            // 跳转到客户详情页
            async viewCompany(companyId) {
                // 判断是否有"我的客户"页面权限
                if (!this.isContainsMenu('myCustomer')) {
                    // 没有"我的客户"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                    return;
                }

                // 查询该公司 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Customer',
                    id: companyId
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 公海客户, 检查是否有"公海客户"页面权限
                if (authorized === 'highseas') {
                    // 判断是否有"公海客户"页面权限
                    if (!this.isContainsMenu('highseasCustomer')) {
                        // 没有"公海客户"页面权限, 弹出提示
                        this.$Message.warning(this.$t('crm.Modal.error_haveNoPermissionHighseasCustomer'));
                        return false;
                    }
                }

                // 否则直接新窗口打开新客户详情页
                this.$viewCustomer(companyId);
            },
            // 跳转到询盘详情页
            async viewInquiry(inquiryId) {
                // 判断是否有"我的询盘"页面权限
                if (!this.isContainsMenu('myInquiry')) {
                    // 没有"我的询盘"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyInquiry'));
                    return;
                }

                // 无 inquiryId , 退出流程
                if (!inquiryId) {
                    this.$Message.error(this.$t('crm.Modal.error_inquiryId'));
                    return;
                }

                // 查询该 inquiryId 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Inquiry',
                    id: inquiryId
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 如果是公海询盘
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpInquiryInHighseas'));
                    return;
                }

                // 新窗口跳转到询盘页面
                localStorage.setItem('leadsCloud-inquiryId', inquiryId);
                window.open(this.$rootRouter.resolve({
                    name: 'myInquiry'
                }).href, '_blank');
            },
            // 邮件归档完成
            handleArchiveFinished() {
                if (this.mailReadingMode === 2) {
                    this.$emit('handleUpdateTableData', { key: 'archiveFlag', val: 1, ids: [this.mailId], from: 'mailDetail' });
                } else {
                    // 刷新邮件归档详细信息
                    this.getMailArchiveData();
                }
            },

            /* 控制内部转发弹窗的显隐规则 */
            toggleInterForwardingModal(isVisible) {
                this.visibleForwardSales = isVisible;
            },
            /* 部门树结构的渲染函数 */
            renderContent(h, { data }) {
                const iconSpan = data.infoType !== 1 ? (data.count === 0 ? h('Icon', {
                    props: {
                        custom: 'custom custom-shujiegou-wuziji'
                    },
                    style: {
                        marginRight: '8px',
                        fontSize: '16px'
                    }
                }) : h('svg', {
                    attrs: {
                        'aira-hidden': 'true'
                    },
                    style: {
                        width: '18px',
                        height: '18px',
                        marginRight: '5px',
                        marginLeft: '5px',
                        position: 'relative',
                        top: '4px'
                    },
                    class: 'svg-icon'
                }, [
                    h('use', {
                        attrs: {
                            'xlink:href': '#custom-fp-paper-file'
                        }
                    })
                ])) : '';
                return h('span', [
                    iconSpan,
                    h(
                        'span',
                        {
                            attrs: {
                                title: data.name
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
                        data.name
                    )
                ]);
            },
            /* 部门树选中项变化 */
            change_selected_userIds() {
                const person_arr = this.$refs.update_tree.getCheckedNodes();
                this.interForwardingUsersSelected = person_arr.filter(item => item.infoType === 1).map(item => {
                    return {
                        userId: item.id,
                        userName: item.name
                    };
                });
            },
            /* 处理内部转发的逻辑 */
            handleMailInterForwarding() {
                if (!this.interForwardingUsersSelected.length) {
                    this.$Message.warning('请至少选择一位接收人');
                    return false;
                } else {
                    /* 给一鸣：此处调用后端内部转发的接口, 解注释并补充完善即可 */
                    util.ajaxMailJson({
                        url: '/mail/mailInterForwardingRecord/interForwarding',
                        method: 'post',
                        data: {
                            mailIdList: [this.mailId],
                            createUserId: this.userId,
                            createUserName: this.fullName,
                            forwardRemark: this.mailInterForwardingInputContent,
                            forwardToUserList: this.interForwardingUsersSelected,
                            orgId: this.orgId
                            // 此处参数依照接口定义填写
                        }
                    }).then(async res => {
                        if (res.data.code === 1) {
                            this.$Message.success('内部转发成功');

                            /* 在邮件详情页进行内部转发，会使得内部转发详情信息发生变化，因此内部转发成功后，需要重新获取详细信息数据 */
                            setTimeout(() => {
                                this.getMailInterForwardingData(true);
                            }, 1000);
                            if (this.mailReadingMode === 2) {
                                this.$emit('handleUpdateTableData', { key: 'mailForwardedInternallyFlag', val: 1, ids: [this.mailId], from: 'mailDetail' });
                            }
                        } else {
                            this.$Message.error('内部转发失败');
                        }
                    }).catch(err => {
                        this.$Message.error('内部转发失败');
                    });
                    this.visibleForwardSales = false;
                }
            },
            // 关闭弹窗
            littleDrawerHidden(val) {
                this.littleDrawerType = '';
                this.mailAddress = '';
                this.currentMailInfo = {};
                this.littleDrawerVisible = val;
            },
            foldersRenderContent(h, { root, data, store }) {
                if (data.list && data.list.length) {
                    return (
                        <div style="width:100%; padding-right:20px" on-click={() => { event.stopPropagation(); }}>
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
                enforceRules({
                    orgId: this.orgId,
                    operateUserId: this.userId,
                    operateUserName: this.fullName,
                    mailIds: [this.mailId]
                }).then((res) => {
                    this.enforceRulesLoading = false;
                    // 需要后台给出那种状态是“有”需要提示“执行完毕”
                    // 哪种是“没有”需要提示 “当前所选邮件没有符合条件的收发信规则”
                    if (res.code === 1) {
                        this.$Message.success(this.$t('mail.mailDetail.ruleExecuted'));
                        this.sendReceiveRulesModel = false;
                        this.$emit('handleUpdateTableData', { key: 'moveMailBoxType', ids: [this.mailId], from: 'mailDetail' });
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
            // 标记为垃圾邮件
            handleMarkSpam() {
                if (this.markSpamLoading) { return; }
                this.markSpamLoading = true;
                let isCreatRule;
                if (this.markSpamChecked) {
                    isCreatRule = 1;
                } else {
                    isCreatRule = 0;
                }
                updateBoxType({
                    orgId: this.orgId,
                    createUserId: this.mailDetailData.createUserId,
                    updateUserId: this.userId,
                    updateUserName: this.fullName,
                    id: this.mailId,
                    isCreatRule
                }).then((res) => {
                    this.markSpamLoading = false;
                    if (res.code === 1) {
                        if (res.data.isMarkTrash === 1) {
                            this.$Message.success(this.$t('mail.mailDetail.markSpamSuccess'));
                            if (this.$route.path === '/mail/mailDetail') {
                                this.mailDetailinit();
                                return;
                            }
                            if (this.mailReadingMode === 2) {
                                this.$emit('handleUpdateTableData', { key: 'moveMailBoxType', ids: [this.mailId], from: 'mailDetail' });
                            } else {
                                setTimeout(() => {
                                    if (this.mailBoxType === 'customerBox') {
                                        this.$emit('handleView', 'CustomerTable');
                                    } else {
                                        this.$emit('handleView', 'MailTable');
                                    }
                                }, 1000);
                            }
                        } else if (res.data.isMarkTrash === 0) {
                            this.$Message.error(this.$t('mail.mailDetail.markSpamError'));
                        }
                        if (this.markSpamChecked && res.data.isCreatRule === 1) {
                            this.$Message.success(this.$t('mail.mailDetail.createdRuleSuccess'));
                        } else if (this.markSpamChecked && res.data.isMarkTrash === 0) {
                            this.$Message.error(this.$t('mail.mailDetail.createdRuleError'));
                        }
                        this.markSpamModel = false;
                    } else {
                        this.$Message.error('请求失败');
                    }
                }, () => {
                    this.markSpamLoading = false;
                    this.$Message.error('请求失败');
                });
            },
            /** 新建收发信规则 */
            handleAdd() {
                this.editRulesInfo = {};
                this.letAddModalShow = true;
            },
            // 取消发送
            handleCancel() {
                tableApi.mailCancel({
                    orgId: this.orgId,
                    ids: [this.mailDetailData.id],
                    updateUserId: this.userId,
                    updateUserName: this.fullName,
                    groupNo: this.groupBoxId
                }).then((res) => {
                    if (res.code === 1) {
                        this.$Message.success(this.$t('mail.cancelTipSucess'));
                        this.$emit('handleUpdateTableData', { key: 'successFlag', val: '4', ids: [this.mailId], from: 'mailDetail' });
                        this.getMailSendStatus(this.mailId);
                    } else {
                        this.$Message.error(this.$t('mail.cancelTipError'));
                    }
                });
            },
            handleTaskModal(params) {
                this.$emit('handleTaskModal', params);
            },
            refreshDataList(id, type) {
                mailCommon.getMailTask({
                    orgId: this.orgId,
                    mailId: this.mailId,
                    userId: this.userId
                }).then(response => {
                    if (this.mailReadingMode === 2 && !type) {
                        this.$emit('refreshDataList', id, 'mailDetail');
                    }
                    if (response.code === '1' && response.data.length) {
                        this.$set(this.mailDetailData, 'setTaskFlag', 1);
                    } else {
                        this.$set(this.mailDetailData, 'setTaskFlag', 0);
                    }
                });
            },
            // littleDrawer点击事件传递
            handleClick(params) {
                this.$emit('handleClick', params);
            },
            copyAttachment(item) {
                const copyAttachment = item ? JSON.stringify([item]) : JSON.stringify(this.attachment);
                localStorage.setItem('copyAttachment', copyAttachment);
                this.$Message.success(this.$t('mail.copyAttachmentTip'));
            },
            handleOpenNewWindow() {
                this.$stm.openNewWindow(this.$rootRouter.resolve({
                    name: 'mailSinglePageMailDetail',
                    query: {
                        id: this.mailDetailData.id,
                        currentPersonId: this.mailDetailData.createUserId
                    }
                }).href);
                // window.open(this.$rootRouter.resolve({
                //     name: 'mailSinglePageMailDetail',
                //     query: {
                //         id: this.mailDetailData.id,
                //         currentPersonId: this.mailDetailData.createUserId
                //     }
                // }).href, '_blank');
            },
            closeWindow() {
                window.opener = null;
                window.open('', '_self', '');
                window.close();
            },
            // 下载
            handleDownload() {
                if (this.downloadLoading) return;
                this.visible = false;
                this.downloadLoading = true;
                util.ajax({
                    url: '/mail/eml/generate/single',
                    method: 'GET',
                    params: {
                        orgId: this.orgId,
                        mailId: this.mailId,
                        userId: this.userId,
                        createUserId: this.mailDetailData.createUserId
                    },
                    timeout: 50000
                }).then(response => {
                    if (response.data.code === 1) {
                        window.open(`${response.data.data.filePath}?attname=${encodeURIComponent(response.data.data.fileName)}`, '_blank');
                    } else {
                        this.$Message.error(response.data.message);
                    }
                    this.downloadLoading = false;
                });
            },
            // 追踪记录 更多 支持分页
            load() {
                // 正在加载中就先不请求接口了
                if (!this.moreLoading) {
                    this.pageNo += 1;
                    this.getLogList();
                }
            },
            getLogList() {
                this.moreLoading = true;
                util.ajax({
                    url: '/mail/mailTraceRecords',
                    method: 'post',
                    data: {
                        orgId: this.orgId,
                        mailId: this.mailId,
                        pageNo: this.pageNo,
                        pageSize: this.pageSize
                    },
                    timeout: 50000
                }).then(response => {
                    this.moreLoading = false;
                    if (response.data.code === 1) {
                        // 当返回数据少于 pageSize 条的时候显示 没有更多数据，同时禁用滚动加载，先不考虑刚好等于 pageSize 条的情况
                        if (response.data.data.length < this.pageSize) {
                            this.noMore = true;
                        }
                        // 当前邮件的全部追踪信息
                        this.eventActionList = this.eventActionList.concat(response.data.data || []);
                    } else {
                        this.$Message.error(response.data.message);
                    }
                    this.moreLoading = false;
                });
            },
            openRecord() {
                console.log('打开更多pop');
                this.pageNo = 1;
                this.eventActionList = [];
                this.noMore = false;
                this.getLogList();
            },

            // get ai tool bar config
            getAiToolBarConfig() {
                queryToolbarTriggerConfig({
                    orgId: this.orgId,
                    userId: this.userId,
                }).then((res) => {
                    if (res && res.code === 1) {
                        const { data } = res
                        const { inputBoxSelect, inputBoxSlash, pageSelect } = data
                        this.$store.dispatch('updateToolbarTriggerConfig', {
                            inputBoxSelect,
                            inputBoxSlash,
                            pageSelect,
                        })
                    }
                })
            }
        },
        mounted() {
            if (this.$route.name === 'mailSinglePageMailDetail') {
                console.log(this.$route, 999)
                // aiToolBar config
                this.getAiToolBarConfig()
            }
        },
        created() {
            // 分发的 tree 数据
            this.distributionTreeData = [
                {
                    name: '总部',
                    id: 0,
                    list: this.mailInterForwardingTreeData
                }
            ]
            if (this.$route.path === '/mail/mailDetail' && this.$route.query.id && this.$route.query.currentPersonId) {
                this.$store.commit('setSelectedMailId', this.$route.query.id);
                this.$store.commit('set_currentPersonId', this.$route.query.currentPersonId);
            } else {
                this.mailDetailinit();
            }
            if (this.mailReadingMode !== 2 && !this.$route.query.id) {
                this.get_mail_list();
            }
        },

        beforeDestroy() {
            // ai tool bar destory removeEventListener
            const iframe = document.getElementById("mailFrame");
            if(iframe) {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                const element = doc.getElementsByTagName('body')[0];
                element.removeEventListener('mouseup');
            }
        },
        watch: {
            // 监听 poptip 状态开启颜色选择框
            colorPickerVisible(val) {
                console.log('33333333333333333 监听颜色框的状态:', val);
                val && this.$refs.colorPicker.handleTrigger();
            },
            mailInterForwardingTreeData(val) {
                if (val.length) {
                    this.distributionTreeData = [
                        {
                            name: '总部',
                            id: 0,
                            list: this.mailInterForwardingTreeData
                        }
                    ]
                }
            },
            selectedMailId: {
                handler(val) {
                    if (val) {
                        this.spinShow = true;
                        this.mailDetailinit();
                    }
                }
            },
            isHidden: {
                handler(val) {
                    if (!val) {
                        if (this.$route.path === '/mail/mailDetail') {
                            this.getTags();
                        }
                        this.mailDetailinit('isHidden');
                    }
                }
            },
            mailTagList: {
                handler(val) {
                    if (val.length) {
                        this.tagList = val;
                    } else {
                        this.tagList = [
                            {
                                labelName: this.$t('timeLine.noData'),
                                id: -1
                            }
                        ];
                    }
                },
                deep: true,
                immediate: true
            }
        }
    };
</script>

<style lang="less">
@import url('./browserDefault.less');
    // 清楚默认样式
    ul{
        list-style-type: none;
    }

    // 更改翻译语言的下拉列表得hover样式
    .el-dropdown-menu__item:not(.is-disabled):hover {
        background-color: #F3F4F7;
        color: #3B78DE;
    }
    // 两个按钮
    .translate-btn {
        margin-left:20px;
        color: #3B78DE;
        font-weight: 400;
        cursor:pointer;
    }
    // 邮件翻译列表
    .translate-select {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 120px;
        line-height:34px;
        border: 1px solid #CBD6E2;
        border-radius: 4px;
        cursor:pointer;
        padding: 0 10px;
        box-sizing: border-box;
        font-size: 12px;
        color: rgba(0, 0, 0 ,0.8);
    }
    // 邮件发件人样式
    .recipients_person {
        display: inline-block;
        padding: 4px;
        cursor: pointer;
        line-height: 18px;
    }
    .recipients_person:hover {
        background-color: #F5F7FA;
        border-radius: 2px;
    }
    #mailDetail {
        height: 100%;
        width: 100%;
        overflow: hidden;
        background: #fff;
        position: relative;

        .mail-content{
           padding-top: 50px;
         }
        .el-card__body{
            padding: 0 16px 16px;
        }
        .operates{
            height: 50px;
            line-height: 50px;
            position: absolute;
            width: 100%;
            border-bottom: 1px solid #eee;
            padding-left: -20px;
            margin-left: -34px;
            padding-left: 34px;
            background: #fff;
            z-index: 9;
            &>li{
                color: rgba(0,0,0,0.60);
                margin-right: 20px;
                font-size: 16px;
                float: left;
                list-style: none;
                cursor: pointer;
                .el-dropdown {
                    line-height: 16px;
                }
            }
            .change-page-pre{
                height: 30px;
                width: 30px;
                border-radius: 15px;
                text-align: center;
                padding: 0;
                margin-right: 0;
                background-color: #F5F6F9;
                border: none;
                &>span{
                    line-height: 30px;
                    display: inline-block;
                    font-size: 12px;
                    margin-top: -4px;
                }
                &.ivu-btn{
                    &:focus{
                        box-shadow: none;
                    }
                }
            }
            .change-page-next{
                height: 30px;
                width: 30px;
                border-radius: 15px;
                text-align: center;
                padding: 0;
                margin-right: -9px;
                margin-left: 0;
                background-color: #F5F6F9;
                border: none;
                &>span{
                    line-height: 30px;
                    display: inline-block;
                    font-size: 12px;
                    margin-top: -4px;
                }
                &.ivu-btn{
                    &:focus{
                        box-shadow: none;
                    }
                }
            }
        }
        .mail-star-operate{
            display: inline-block;
            margin-right: 10px;
        }

        .mail-title-container {
            font-weight: bold;
            font-size: 18px;
            line-height: 18px;
            margin-top: 12px;
            margin-bottom: 12px;
            display: flex;
            align-items: baseline;

            .mail-tag-container {
                flex: 1;
            }
        }

        .emailSendedStatus{
          font-size: 12px;
          color: rgba(0, 0, 0 ,0.8);
          /*opacity: 100%;*/
          line-height: 18px;
        }
        .separateMailInfo{
            .cell {
              padding-left: 0;
            }
            .el-table td{
              border-bottom: 0;
            }
            .el-table th{
              height: 34px;
            }
            .el-table__header::after{
              width: 100%;
              left: 0;
            }


        }
        .noborder-table:after{
            width: 100%;
            left: 0;
        }


        .detailHead {
            list-style-type: none;
            font-size: 12px;
            color: rgba(0,0,0,0.60);
        }
        .detailHead li {
            line-height: 18px;
            word-break: break-all;
            margin: 4px 0;
        }
        .operationArea {
            background: #f4f4f4;
            width: auto;
            border-radius: 10px;
            border: 1px solid #d7d7d7;
            padding: 5px 0;
            display: inline-block;
            position: relative;
            left: 50%;
            bottom: -37px;
            margin-left: -150px;
            z-index: 1;
            a {
                color: #979797;
                font-size: 14px;
            }
        }
        .separateDetailContent {
            width: 100%;
            /*margin-top: 20px;*/
            position: relative;
        }
        .attachmentBrief {
            display: inline-block;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: bottom
        }
        .main{
            position: static;
            width: 100%;
            height: 100%;
        }
        .show-more{
            float: right;
            font-weight: normal;
            font-size: 12px;

            color: #3b78de;
            cursor: pointer;
            i{
                color:rgba(0,0,0,0.40);
                transition: transform .2s ease-in-out,-webkit-transform .2s ease-in-out;
                transform: scale(0.8);
                &.opened{
                    transform: rotate(180deg) scale(0.8);
                }
            }
            &:hover {
              color: #2d63bc;
              text-decoration: underline;
            }
        }
        .show-more-separate {

            font-weight: normal;
            font-size: 12px;
            line-height: 18px;
            color: #3b78de;
            cursor: pointer;
            &:hover {
              color: #2d63bc;
              text-decoration: underline;
            }
      }
        .show-more-icon {
            color:rgba(0,0,0,0.40);
            margin-top: 2px;
            transition: transform .2s ease-in-out,-webkit-transform .2s ease-in-out;
            transform: scale(0.8);
            &.opened{
                transform: rotate(180deg) scale(0.8);
            }
        }
        /* 标签样式 */
        .el-tag{
            border-radius: 4px;
            border-width: 0 !important;
            .el-tag-text,i{
                color: inherit !important;
            }
            & .custom-delete1{
                display: none;
            }
            &:hover {
                & .custom-delete1{
                    display: inline-block;
                    background-color: rgba(0, 0, 0 ,0);
                }
            }
        }

        .tag-in-table {
            margin: 3px 4px;
            height: 28px;
            line-height: 28px;
            & .custom-delete1{
                display: none;
            }
            &:hover {
                & .custom-delete1{
                    display: inline-block;
                }
            }
        }
        .clearfix:after {
            display: block;
            content: "clear";
            clear: both;
            line-height: 0;
            visibility: hidden;
        }
        table td {
            box-sizing: content-box;
        }
        .mail-detail-status {
            margin-right: 10px;
        }
    }
    .header-source {
      color: #3b78de !important;
      cursor: pointer;
      &:hover {
        color: #2d63bc !important;
        text-decoration: underline;
      }
    }
    .item-event {
        color: #3b78de !important;
        cursor: pointer;
        &:hover {
            color: #2d63bc !important;
            text-decoration: underline;
        }
    }
    .receive-load-loop {
        animation: ani-load-loop 1s linear infinite;
    }
    .inter-forwarding-modal {
        padding: 10px 20px;
        font-size: 16px;
        color: rgba(0, 0, 0, .8);
        .el-dialog {
            .el-dialog__title {
                font-weight: 700;
            }
            .el-dialog__body {
                padding: 10px 20px 20px;
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
    @keyframes ani-load-loop {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
}

.detail-move-operate-pop{
    // padding: 10px 0;
    li{
        height: 34px;
        line-height: 34px;
        font-size: 14px;
        color: #333;
        cursor: pointer;
        margin: 0 -12px;
        padding: 0 10px;
        &:hover{
            background: #F3F4F7;
        }
    }
}

.el-color-dropdown.labelDefaultColorPicker{
    width: 318px;
    .el-color-svpanel{
        width: 300px;
    }
    .el-button--text{
        color: #3B78DE;
    }
}

.label_color_select{
    &.el-popper{
        margin-top: 12px;
        padding: 0;
        border: none;
        box-shadow: none;
        background: transparent;
        height: 0;
    }

    .mail-default-color{
        .el-color-picker__trigger{
            border: none;
        }
        .el-color-picker__color{
            border: none;
        }
    }
}
    .labelDefaultColorPicker{
        .el-color-dropdown__btns{
            .el-color-dropdown__btn{
                height: 28px;
                width: 52px;
                padding: 0 10px;
            }
        }
        .el-color-predefine{
            width: 100%;
        }
        .el-color-predefine__colors{
            .el-color-predefine__color-selector{
                border-radius: 6px;
                margin-left: 13px;
                &:nth-child(1){
                    margin-left: 0;
                }
            }
        }
    }
</style>
<style scoped lang="less">
    // 分发
    .distribution-modal{
        /deep/ .el-dialog__header{
            padding: 24px;
            padding-bottom: 20px;
            .el-dialog__headerbtn{
                margin: 4px 4px 0 0;
            }
        }
        /deep/ .el-dialog__body{
            max-height: inherit;
            padding: 24px;
            padding-top: 0;
        }
        
        .distribution-container {
            .distribution-remark {
                margin: 10px 0;
            }
            .distribution-footer {
                text-align: right;
            }
        }
    }
    .layermain {

        .label_color{
            display: flex;
            height: 42px;
            align-items: center;
            
            .label_color_title{
                display: inline-block;
                font-size: 14px;
                width: 80px;
                text-align: left;
                color: #333;
            }

            /deep/ .label_color_item{
                border-radius: 4px;
                border: 1px solid #DCDFE6;
                color: #606266;
                display: inline-block;
                font-size: 12px;
                height: 32px;
                line-height: 32px;
                padding: 0 15px;
                flex: 1;
                text-align: left;
                cursor: pointer;
                position: relative;

                i.label_color_icon{
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    background: #4285F2;
                    border-radius: 3px;
                    position: relative;
                    top: 3px;
                }

                &:hover{
                    border-color: #4285F2;
                    box-shadow: 0 3px 0 0 #4285F2;
                }

                .custom-menu-arrow-forward-medium{
                    color: #C0C4CC;
                    font-size: 14px;
                    transition: transform .3s;
                    transform: rotateZ(90deg);
                    cursor: pointer;
                    height: 100%;
                    width: 25px;
                    text-align: center;
                    -webkit-transition: all .3s;
                    transition: all .3s;
                    line-height: 32px;
                    &.is-reverse{
                        transform: rotateZ(270deg);
                    }
                }
            }
        }
    }

    .mail-default-color{
        height: 0px;
        width: 0px;

        /deep/ .el-color-picker__trigger{
            height: 0px;
        }
    }

    .add-tag{
        /deep/ .el-dialog__body{
            padding: 18px 24px;
            .el-form-item{
                margin-bottom: 16px;
                .el-form-item__label{
                    color: #333;
                    font-size: 14px;
                }
            }
        }
        /deep/ .el-dialog__footer{
            padding-top: 20px;
        }
    }
</style>
