<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-08 18:29:59
 * @LastEditTime: 2019-08-19 11:30:34
 * @LastEditors: Please set LastEditors
 -->
<template>
    <div class="leave_drag" style="width: 100%;" :style="set_time_flag && set_time_form.local_time && isShowOnSeparate ? (isModalFullScreen ? 'padding-bottom:24px;': 'padding-bottom:64px;'): (isModalFullScreen ? 'padding-bottom:0;': 'padding-bottom:30px;')">
        <div style="height: 100%;" class="writeMail writeMailModal ">
            <div @click.stop="writeMail" @paste="handlePaste">
                <Row v-if="writeType!=='theSameTab' && isSendMailSuccess" style="margin: 20px 10px;">
                    <Col :span="24">
                    <div style="width: 80px;float: left;padding-left: 20px"><Icon type="md-checkmark-circle" color="#87d068" size="40"/></div>
                    <div style="margin-left: 90px;">
                        <p style="color: #299023;font-size: 16px;font-weight: bold;">{{$t('mail.has_sended')}}</p>
                        <p style="margin:5px 0 15px">{{$t('mail.sended_and_saved')}}</p>
                        <div class="newTabCloseBtn">
                            <a href="javascript:window.opener=null;window.open('','_self');window.close();">{{$t('mail.close_window')}}</a>
                        </div>
                    </div>
                    </Col>
                </Row>
                <Row style="height: 100%;">
                    <Col :span="textModel||translateModel?18:24">
                        <Card shadow="never" :bordered="false" dis-hover v-if="!isSendMailSuccess" v-loading="is_show">
                            <Row :gutter="20">
                                <Col :span="24">
                                <div class="enter_drag">
                                    <Form  v-model="emailForm">
                                        <div class="recipient_content" @click.stop="recipientContent">
                                            <!-- 收起状态的接收人（收件人/抄送人/密送人） -->
                                            <FormItem style="margin-bottom: 0" v-show="!expandRecipientDetailsShow">
                                                <div style="border-bottom:1px solid rgb(234, 234, 234);height: 48px;margin-bottom: 16px;">
                                                    <div class="putAwayModal" @click.stop="expandRecipientDetails">
                                                        <TagShow
                                                                fromFlag="writeMail"
                                                                class="mail-tag-input"
                                                                :isSeparate="isSeparate"
                                                                :taglist.sync="allRecipientsList"
                                                                :type="'to'"
                                                                title=""
                                                                :row="crmEmails"
                                                                v-bind="$attrs"
                                                                v-on="$listeners"
                                                                @showCompany="showCompany"
                                                                @showClue="showClue"
                                                                @createClue="createClue"
                                                        >
                                                        </TagShow>
                                                        <span class="putAwayCount">+共{{allRecipientsList.length}}个人</span>
                                                    </div>
                                                </div>
                                            </FormItem>
                                            <div v-show="expandRecipientDetailsShow">
                                                <!-- 收件人 -->
                                                <FormItem  style="margin-bottom: 0" >
                                                    <div style="display: flex;border-bottom: 1px solid #EAEAEA;">
                                                        <div @click.stop="add_link_type='Addressee'" class="compose_mailInfo_item_first_row">
                                                            <div class="compose_mailInfo_item_header">{{ $t('mail.writeLetter.recipients') }}</div>
                                                            <MailInput
                                                                    fromFlag="writeMail"
                                                                    class="mail-tag-input"
                                                                    :isSeparate="isSeparate"
                                                                    :taglist.sync="emailForm.recipients_to"
                                                                    :title="$t('mail.writeLetter.recipients')"
                                                                    :type="'modelTo'"
                                                                    :row="crmEmails"
                                                                    :placeholder="placeholder"
                                                                    :readonly="readonly"
                                                                    v-bind="$attrs"
                                                                    v-on="$listeners"
                                                                    @changeFocuseToPerson="cursorType='person'"
                                                                    @showCompany="showCompany"
                                                                    @showClue="showClue"
                                                                    @createClue="createClue"
                                                                    @handleUpdateRecipients="handleUpdateRecipients"
                                                            >
                                                            </MailInput>
                                                        </div>
                                                        <div style="display: flex;flex-shrink: 0;line-height:40px;">
                                                            <a href="javascript:void(0)">
                                                                <span v-if="isSeparate === 0 && !ccModel" class="blue-font mail-cc" @click.stop="ccModel=!ccModel;emailForm.recipients_cc=[];cursorType='editor'">{{$t('mail.writeLetter.Cc')}}</span>
                                                                <span v-if="isSeparate === 0 && !ccModel && !bccModel" style="border-right: 1px solid rgba(0,0,0,0.16);margin: 0 10px"></span>
                                                                <span v-if="isSeparate === 0 && !bccModel" class="blue-font mail-secretdelivery" @click.stop="bccModel=!bccModel;emailForm.recipients_bcc=[];cursorType='editor'">{{$t('mail.writeLetter.Bcc')}}</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </FormItem>
                                                <!-- 抄送人 -->
                                                <FormItem v-show="ccModel" v-if="isSeparate === 0">
                                                    <div style="display: flex;border-bottom: 1px solid #EAEAEA;">
                                                        <div @click.stop="add_link_type='cc_person'" class="compose_mailInfo_item_first_row">
                                                            <div class="compose_mailInfo_item_header">{{ $t('mail.writeLetter.recipientCc') }}</div>
                                                            <MailInput
                                                                    fromFlag="writeMail"
                                                                    class="mail-tag-input"
                                                                    :taglist.sync="emailForm.recipients_cc"
                                                                    :title="$t('mail.writeLetter.recipientCc')"
                                                                    :type="'modelCc'"
                                                                    :row="crmEmails"
                                                                    @changeFocuseToPerson="cursorType='person'"
                                                                    v-bind="$attrs"
                                                                    v-on="$listeners"
                                                                    @showCompany="showCompany"
                                                                    @showClue="showClue"
                                                                    @createClue="createClue">
                                                            </MailInput>

                                                        </div>
                                                        <div style="display: flex;flex-shrink: 0;line-height:40px;">
                                                            <!-- 删除抄送人 -->
                                                            <a href="javascript:void(0)">
                                                                <span v-if="isSeparate === 0" class="blue-font mail-cc" @click.stop="ccModel=!ccModel;emailForm.recipients_cc=[];cursorType='editor'">{{$t('mail.writeLetter.deleteCc')}}</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </FormItem>
                                                <!-- 密送人 -->
                                                <FormItem v-show="bccModel" v-if="isSeparate === 0">
                                                    <div style="display: flex;border-bottom: 1px solid #EAEAEA;">
                                                        <div @click.stop="add_link_type='bcc_person'" class="compose_mailInfo_item_first_row">
                                                            <div class="compose_mailInfo_item_header">{{ $t('mail.writeLetter.recipientBcc') }}</div>
                                                            <MailInput
                                                                    fromFlag="writeMail"
                                                                    class="mail-tag-input"
                                                                    :taglist.sync="emailForm.recipients_bcc"
                                                                    :title="$t('mail.writeLetter.recipientBcc')"
                                                                    :type="'modelBcc'"
                                                                    :row="crmEmails"
                                                                    @changeFocuseToPerson="cursorType='person'"
                                                                    v-bind="$attrs"
                                                                    v-on="$listeners"
                                                                    @showCompany="showCompany"
                                                                    @showClue="showClue"
                                                                    @createClue="createClue">
                                                            </MailInput>
                                                        </div>
                                                        <div style="display: flex;flex-shrink: 0;line-height:40px;">
                                                            <!-- 删除密送人 -->
                                                            <a href="javascript:void(0)">
                                                                <span v-if="isSeparate === 0" class="blue-font mail-secretdelivery" @click.stop="bccModel=!bccModel;emailForm.recipients_bcc=[];cursorType='editor'">{{$t('mail.writeLetter.deleteBcc')}}</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </FormItem>
                                            </div>
                                        </div>

                                        <!-- 主题 -->
                                        <FormItem>
                                            <div  class="form-title-font write-mail-tags" style="border-bottom:1px solid #EAEAEA;margin-bottom: 0" @mouseup="onIputSelect">
                                                {{$t('mail.writeLetter.subject')}}&nbsp;
                                                <Tag v-for="(tag,index) in writeMailTags" :color="tag.labelColor" :style="`color:${getRGB(tag.labelColor)}`" :key="index">
                                                    <span>{{tag.labelName}}</span>
                                                    <Icon class="custom custom-delete1" @click="handleTagClose(tag)" :style="`margin-left: 9px;cursor: pointer;color:${getRGB(tag.labelColor) === '#333' ? '#999!important' : '#fff'}`"></Icon>
                                                </Tag>
                                                <input v-if="showSubjectInput" class="subject-input"
                                                        ref="subject"
                                                        id="modelMailSubject"
                                                        @blur="handleInputBlur"
                                                        @focus="subjectFocus"
                                                        :placeholder="$t('aiToolBar.placeholder')"
                                                        v-model="emailForm.subject" type="text">
                                            </div>
                                            <Dropdown trigger="click" @command="insertVariable" v-if="isSeparate" class="add-variable-dropdown">
                                                <a class="blue-font" :title="$t('mail.separateInsertVariablesTips')" href="javascript:void(0)">{{$t('mail.separateInsertVariables')}}</a>
                                                <DropdownMenu slot="dropdown" class="add-variable-dropdown-menu">
                                                    <DropdownItem style="font-size: 12px;" v-for="(item, idx) in variableList" :key="idx" :command="item.value" :class="item.class">{{item.label}}</DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </FormItem>

                                        <!-- 附件 -->
                                        <FormItem class="selfUpload-formItem">
                                            <div @click.stop style="display:inline-block;">
                                                <selfUpload
                                                        ref="filesUpload"
                                                        multiple
                                                        type="drag"
                                                        class="mail-upload"
                                                        :max-size="max_size"
                                                        :ul_width="modal_width"
                                                        :on-exceeded-size="handleSizeOverflow"
                                                        :onPreview="handlePreviewAtta"
                                                        :defaultFileList="defaultFileList"
                                                        :style="{width:auto_width}"
                                                        sortableClass="writeMailsModalSelfUploadList"
                                                        @handleDataBaseFile="handleDataBaseFile"
                                                        @getUploadFilesList="getUploadFilesList">
                                                    <div class="database-box">
                                                        <!-- 原来的 '上传附件' 和 '添加资料库文件' 合并为一个 dropdown -->
                                                        <Dropdown trigger="hover" placement="bottom" style="width: 90px;white-space: nowrap;">
                                                            <Tooltip placement="top">
                                                                <div slot="content" style="text-align:center;">{{$t('mail.writeLetter.uploadFilesEmailAttachments')}}<br/>{{$t('mail.writeLetter.within25M')}}</div>
                                                                <span class="database-item">
                                                                    <Icon style="margin-right:4px;" class="custom custom-icon_appendix" size="16"></Icon>
                                                                    <span style="overflow: hidden;" :title="$t('mail.writeLetter.uploadFiles')">{{$t('mail.writeLetter.uploadFiles')}}</span>
                                                                    <Icon type="ios-arrow-down"></Icon>
                                                                </span>
                                                            </Tooltip>
                                                            <DropdownMenu style="text-align:center;max-height:300px;width: 120px;white-space: nowrap;" slot="dropdown">
                                                                <DropdownItem @click.native="handleNormalUpload">
                                                                    <span class="write-mail-upload">{{$t('mail.writeLetter.localFiles')}}</span>
                                                                </DropdownItem>
                                                                <DropdownItem @click.native="handleDataBaseUpload">
                                                                    <span v-show="isContainsMenu('database')" class="write-mail-upload piwik_writeMail_fileUpload_dataBase">{{$t('mail.writeLetter.databaseFile')}}</span>
                                                                </DropdownItem>
                                                            </DropdownMenu>
                                                        </Dropdown>
                                                        <!-- <Tooltip placement="top">
                                                            <div slot="content" style="text-align:center;">{{$t('mail.writeLetter.insertSmartMaterial')}}<br/>{{$t('mail.writeLetter.recommendedForVeryLargeFiles')}}</div>
                                                            <span class="database-item" style="margin-left:20px;width:80px;white-space: nowrap;" @click.stop="handleFileSelected">
                                                                <Icon style="margin-right:4px;" class="custom custom-icon_material" size="16"></Icon>
                                                                <span style="overflow: hidden;" :title="$t('mail.writeLetter.insertSmartMaterial')">{{$t('mail.writeLetter.insertSmartMaterial')}}</span>
                                                            </span>
                                                        </Tooltip> -->
                                                    </div>
                                                </selfUpload>
                                                <!-- 快速文本 -->
                                                <span class="blue-font" v-if="!dragOver" @click.stop="quickTextClick" style="cursor: pointer;display: inline-block;position: absolute;top:5px;right: 0; height: 30px;line-height: 30px;margin-top:1px;">{{$t('mail.writeLetter.fastText')}}</span>
                                            </div>
                                            <!-- 插入模板 -->
                                            <div style="margin-left:14px;cursor: pointer;display: inline-block;position: absolute;left: 90px;top:12px;" @click.stop="addTemplateVisible = true">
                                                <span style="color:#3B78DE;font-size: 12px;">
                                                    <Icon custom="custom-youjianmoban" size="14" style="color: #3B78DE;margin-right: 4px;"/>{{$t('mailSetting.emailTemplate.template')}}
                                                </span>
                                            </div>
                                            <!-- 监测链接的入口 -->
                                            <div style="margin-left:14px;cursor: pointer;display: inline-block;position: absolute;left: 148px;top:12px;" @click.stop="testInsertLink">
                                                <span style="color:#3B78DE;font-size: 12px;">
                                                    <Icon custom="custom custom-lianjie1" size="16" style="color: #3B78DE;margin-right: 4px;"/>{{$t('monitorLink.titleLink')}}
                                                </span>
                                            </div>
                                            <!-- 翻译的入口 -->
                                            <div style="margin-left:20px;cursor: pointer;display: inline-block;position: absolute;left: 206px;top:12px;" @click.stop="showTranslateBox">
                                                <span style="color:#3B78DE;font-size: 12px;">
                                                    <Icon custom="custom custom-fanyi1" size="16" style="color: #3B78DE;margin-right: 4px;"/>{{$t('mail.writeTranslate.translate')}}
                                                </span>
                                            </div>
                                        </FormItem>
                                        <FormItem v-loading="dataBaseLoading" style="margin-bottom: 10px"  >
                                            <div id="vModalEditor" v-show="!dragOver"></div>
                                        </FormItem>
                                        <FormItem>
                                            <Row v-if="set_time_flag && set_time_form.local_time" v-show="isShowOnSeparate">
                                                <Col :span="24">
                                                <p style="height:30px;">
                                                </p>
                                                </Col>
                                            </Row>
                                        </FormItem>
                                    </Form>

                                    <!-- 拖拽的范围 -->
                                    <div style="position: absolute;left:20px;top:51px;"
                                        id="self-upload-drag"
                                        v-show="dragOver"
                                        @mousemove="mousemove_upload"
                                        class="mail-upload-placeholder-container"
                                        :style="{width: textModel||translateModel?`calc(100% - ${linkmanListWidth+40}px)`: 'calc(100% - 40px)',height: set_time_flag && set_time_form.local_time && isShowOnSeparate?'calc(100% - 161px)':'calc(100% - 121px)'}"
                                    >
                                        <!-- 拖拽上传附件显示范围 -->
                                        <div style="height:calc(100% / 2);" :style="uploadAttachment?'border: 3px dashed #3B78DE;':'border: 3px dashed rgba(0,0,0,0.30);'" @dragover="upload_dragover" @drop="upload_drop">
                                            <div class="mail-upload-placeholder-text" style="opacity: 0.6;background: #fff;">
                                                <span class="mail-upload-placeholder-span">{{uploadAttachment ? '松开鼠标后立即上传为附件！' : '将文件拖至此区域内上传为附件'}}</span>
                                            </div>
                                        </div>
                                        <!-- 上传到编辑器的图片 -->
                                        <div style="height:calc(100% / 2);" :style="uploadImages?'border: 3px dashed #3B78DE;':'border: 3px dashed rgba(0,0,0,0.30);'" @dragover="upload_images_dragover">
                                            <Upload
                                                    class="mail-upload-placeholder"
                                                    style="height:100%;width:100%;"
                                                    :on-success="insertImage"
                                                    :action="action"
                                                    :multiple="true"
                                                    accept=".png,.jpeg,.jpg,.gif,.bmp"
                                                    :show-file-list="false"
                                                    drag>
                                                <div class="mail-upload-placeholder-text">
                                                    <span class="mail-upload-placeholder-span">{{uploadImages ? '松开鼠标后立即上传为正文！':'将图片拖至此区域内上传至正文'}}<br/>（支持 .jpg, .jpeg, .png, .gif, .bmp格式）</span>
                                                </div>
                                            </Upload>
                                        </div>
                                    </div>

                                    <!-- 底部操作栏 -->
                                    <div class="write-mail-btns-fix" style="position: absolute;bottom:0;left:0;padding: 10px 20px 24px 20px; width: 100%; background: #fff;">
                                        <div v-if="set_time_flag && set_time_form.local_time" v-show="isShowOnSeparate" style="margin-bottom: 8px;">
                                            <p>
                                                {{$t('mail.writeLetter.will_send')}}：
                                                <span v-if="bj_time">
                                                    <span style="color: #FA8241">{{bj_time}}</span>
                                                    {{$t('mail.writeLetter.send')}}！
                                                </span>
                                                <span v-else>
                                                    <span style="color: #3B78DE">{{bjTime}}</span>{{$t('mail.writeLetter.send')}}！<span style="color: red;">{{$t('mail.setTimeOutTip')}}</span>
                                                </span>
                                                <span @click.stop="handleUpdateTime" class="edit_timing_btn">{{$t('mail.writeLetter.update_sendTime')}}</span>
                                                <span @click.stop="handleCancelTime" class="edit_timing_btn">{{$t('mail.writeLetter.cancel_timing')}}</span>
                                                <!--<span style="margin-left:20px;">-->
                                                    <!--注：定时邮件更改内容或时间后，记得点击保存当前内容和设置。-->
                                                <!--</span>-->
                                            </p>
                                        </div>
                                        <!-- 发送/定时发送 -->
                                        <div style="display: inline-block;margin-right: 12px;">
                                            <Tooltip placement="top" transfer :content="sendTip" v-show="sendTip">
                                                <Button type="info" style="padding-left:20px;padding-right: 20px;background: #e7ecf2;border-color: #e7ecf2;cursor:default;color:rgba(110,129,154,.4);">
                                                    {{isSeparate ? $t('mail.writeLetter.respectivelySend') : $t('mail.writeLetter.send')}}
                                                </Button>
                                            </Tooltip>
                                            <Button type="primary" @click.stop="handleSendEmail"  v-show="!sendTip && isSeparate === 1" style="margin-left: 0;">
                                                {{$t('mail.writeLetter.respectivelySend')}}
                                            </Button>
                                            <Button :loading="publishLoading" type="primary" @click.stop="handleSendEmail" v-show="!sendTip && isSeparate === 0 && publishLoading" style="margin-left: 0;">
                                                {{$t('mail.writeLetter.send')}}
                                            </Button>
                                            <Dropdown class="send-dropdown" trigger="click" split-button type="primary" placement="bottom-end" @click.stop="handleSendEmail" @command="handle_modal_open" v-show="!sendTip && isSeparate === 0 && !publishLoading">
                                                {{$t('mail.writeLetter.send')}}
                                                <DropdownMenu slot="dropdown" class="mail_label_drop_down">
                                                    <DropdownItem command="addtag" v-show="isSeparate === 0">{{$t('mail.set_timeout_mail')}}</DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                        <Button :loading="draftLoading" @click.stop="handleSaveDraft" class="mail-save-draft"
                                                style="margin-right: 12px">{{$t('mail.writeLetter.saveDraft')}}
                                        </Button>
                                        <!-- 发件人 -->
                                        <div @click.stop style="display:inline-block;">
                                            <span>{{$t('mail.writeLetter.sender')}}：</span>
                                            <Select style="border:0;" v-model="emailForm.from"
                                                    class="fromSelectModal"
                                                    @change="handleSender">
                                                <Option v-for="(item, index) in senders"
                                                        class="mail-signature"
                                                        :value="item.emailAddress"
                                                        :key="item.emailAddress"
                                                        :label="item.emailAddress">
                                                </Option>
                                            </Select>
                                        </div>
                                        <!-- 移到底部的各操作入口 -->
                                        <div style="display: inline-block;">
                                            <!-- 签名 -->
                                            <Dropdown trigger="click" style="margin-left: 20px;" placement="top-end" @command="handleSignChange">
                                                <Tooltip placement="top" transfer :content="$t('mail.writeLetter.signature')">
                                                    <Icon custom="custom custom-qianming" size=16 style="color:#xe911;"/>
                                                </Tooltip>
                                                <DropdownMenu slot="dropdown" class="mail_label_drop_down" style="max-height: 400px;overflow: auto;">
                                                    <DropdownItem v-for="(tag,index) in signatures " :key="index" :command="index" class="mail_label_1">
                                                        <span class="tag-color" :style="`background-color: ${tag.labelColor};`"></span>
                                                        <span :title="tag.signName" >{{tag.signName}}</span>
                                                    </DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                            <span style="border-left:1px solid #D8D8D8;margin:0 12px;"></span>
                                            <!--紧急-->
                                            <Checkbox class="mail-urgent writemail-checkbox" v-model="emailForm.priority">
                                                {{$t('mail.writeLetter.urgent')}}
                                            </Checkbox>
                                            <!-- 回执 -->
                                            <Checkbox  class="mail-receipt writemail-checkbox" v-model="emailForm.receipt_flag">
                                                {{$t('mail.writeLetter.receipt')}}
                                            </Checkbox>
                                            <!-- 追踪邮件 -->
                                            <Checkbox class="writemail-checkbox" v-model="emailForm.mailIsTrace">
                                                {{$t('mail.writeLetter.tracking')}}
                                            </Checkbox>
                                            <span style="border-left:1px solid #D8D8D8;margin-right:12px;"></span>
                                            <!-- <taskPoptip v-if="isSeparate === 0" :params="{...emailForm, mailBoxTypeName: $t('mail.sentBox')}" fromModule="writeMail" @handleTaskModal="handleTaskModal" @setTask="setTask" :taskObj="taskObj"></taskPoptip> -->
                                            <!-- 标签 -->
                                            <Dropdown trigger="click" placement="bottom-end" @command="operateTag($event,1)">
                                                <Tooltip placement="top" transfer :content="$t('crm.InqSet.inq_label')">
                                                    <Icon custom="custom custom-tag" size=16 />
                                                </Tooltip>
                                                <DropdownMenu slot="dropdown" class="mail_label_drop_down" style="max-height: 400px;overflow: auto;">
                                                    <DropdownItem v-for="(tag,index) in tagList " :key="index" :command="tag.id" class="mail_label_1">
                                                        <span class="tag-color" :style="`background-color: ${tag.labelColor};`"></span>
                                                        <span :title="tag.labelName" >{{tag.labelName}}</span>
                                                    </DropdownItem>
                                                    <DropdownItem command="addtag" divided>{{$t('mail.add_tags_mark')}}</DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <!--
                    * @Description: 快速文本的交互优化
                    * @LastEditTime: 2019-11-18 09:41
                    * @LastEditors: 王红珠
                    -->
                    <!-- 快速文本搜索 -->
                    <Col :span="6" v-if="textModel" class="flexBox">
                        <div style="overflow-y: auto;"
                            :style="`height:${writeType!=='theSameTab'?(window_height-200-(set_time_flag && set_time_form.local_time && isShowOnSeparate?32:0)):(window_height-250-(set_time_flag && set_time_form.local_time && isShowOnSeparate ? 32 : 0))}px;`">
                            <ul class="linkman-list fast-text-title" style="margin-top:0;">
                                <li style="cursor:auto;">
                                    <div>{{$t('mail.writeLetter.fastText')}}</div>
                                    <div>
                                        <i @click="toFastTextSet">
                                            <Tooltip placement="top" transfer :content="$t('mailSetting.fastText.setting')">
                                                <Icon size="14" custom="custom custom-custom-script-set" style="cursor:pointer;" />
                                            </Tooltip>
                                        </i>
                                        <i><Icon size="14" @click="closeFastText" custom="custom custom-modal-close" style="cursor:pointer;" /></i>
                                    </div>
                                </li>
                                <li>
                                    <Input class="verbal-search"
                                        icon="ios-search-strong"
                                        search
                                        clearable
                                        v-model="fastTextSearch"
                                        @keyup.enter.native="searchFastTextList"
                                        @input="searchFastTextList"
                                        :placeholder="$t('mail.fastTextSearchHolder')" >
                                    <i slot="suffix" class="el-input__icon el-icon-search" @click="searchFastTextList"></i>
                                    </Input>
                                </li>
                            </ul>
                            <div class="fast-text-list">
                                <!-- <p>暂无数据</p> -->
                                <p v-if="!fastTextShowLag" class="noDataTip">{{$t('crm.Table.noData')}} </p>
                                <ul>
                                    <li v-if="fastTextShowLag" @click="handleQuickText(fastTextItem.quickContent,fastTextIndex)" v-for="(fastTextItem , fastTextIndex) in quickTexts" :key="fastTextIndex">
                                        <h4>{{fastTextItem.quickName}}</h4>
                                        <Tooltip placement="left" max-width="150">
                                            <p class="paragraph overTwoLine" v-html="fastTextItem.quickContent" >
                                            </p>
                                            <div slot="content">
                                                <p class="paragraph quickTextDom" v-html="fastTextItem.quickContent">
                                                </p>
                                            </div>
                                        </Tooltip>
                                    </li>
                                </ul>
                                <p v-if="fastTextShowLag" class="load-more">
                                    <a class="hrefa" @click="quickTextLoadMore" v-if="quickTexts.length < textTotalNumber ">{{$t('chat.loadMore')}}</a>
                                    <a v-else class="nohrefa">{{ $t('chat.noMore') }}</a>
                                </p>
                            </div>
                        </div>
                    </Col>
                    <!-- 翻译行 -->
                    <Col :span="6" v-show="translateModel" class="translateBox" :style="`height:${writeType!=='theSameTab'?(window_height-110-(set_time_flag && set_time_form.local_time && isShowOnSeparate?32:0)):(window_height-150-(set_time_flag && set_time_form.local_time && isShowOnSeparate ? 32 : 0))}px;`">
                        <div style="margin-bottom:9px;" class="trans-div">
                            <div style="font-size: 14px;color: rgba(0,0,0,0.80);font-weight: 600;">{{this.$t('mail.writeTranslate.translate')}}</div>
                            <Icon size="14" @click.stop="closeTranslate" custom="custom custom-modal-close" style="cursor:pointer;" />
                        </div>
                        <Row style="margin-bottom:16px;white-space:nowrap;">
                            <!--  @command="reply" 表示触发的事件 -->
                            <div style="width:43px;white-space:no-wrap;margin-right:10px;display:inline-block;">{{this.$t('mail.writeTranslate.translateTo')}}</div>
                            <Dropdown trigger="click" @command="selectTargetLanguage" style="width: calc(100% - 153px);margin-right:10px;">
                                <span class="translate-select" style="width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 8px">
                                    <span>{{targetTranslate}}</span>
                                    <Icon custom="custom-menu-arrow" color="#7B98B6" size="12"></Icon>
                                </span>
                                <DropdownMenu style="width:125px;max-height: 300px;overflow-y: auto;margin-top: 10px;" slot="dropdown">
                                    <DropdownItem :disabled="item.label===targetTranslate" :style="item.label===targetTranslate?'color:#4285F4':''" v-for="(item,index) in languageList" :key="index" :command="item">{{item.label}}</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <!-- 翻译按钮 -->
                            <Button class="piwik_write_letter_translation_button" :loading="translateLoading" @click="handleTranslate" :disabled="translateDisabled" type="info" style="width:90px;height:34px;font-size:12px;color:white;padding:0;margin:0 auto;">
                                {{$t('mail.translateContent')}}
                            </Button>
                        </Row>
                        <div style="margin-bottom:6px;" class="trans-div">
                            <span>{{this.$t('mail.writeTranslate.original')}}</span>
                            <Tooltip placement="top" transfer :content="this.$t('mail.writeTranslate.clearOriginalText')">
                                <span style="cursor:pointer;color: #3B78DE;" @click="clearRequestText">{{this.$t('mail.writeTranslate.clearOriginalText')}}</span>
                            </Tooltip>
                        </div>
                        <div class="trans-div">
                            <Input id="requestInput" v-model="requestText" type="textarea" show-word-limit maxlength="5000" rows="14" placeholder="请输入原文"></Input>
                        </div>
                        <div class="trans-div" style="min-height:16px;color:red;line-height:16px;margin-top:4px;">{{requestTextTooLong}}</div>
                        <div class="trans-div" style="margin-bottom:5px;">
                            <span>{{this.$t('mail.writeTranslate.translation')}}</span>
                            <Tooltip placement="top" transfer>
                                <div style="text-align:center;" slot="content">{{this.$t('mail.writeTranslate.insertAtSubjectBody')}}<br/>{{this.$t('mail.writeTranslate.insertTranslation')}}</div>
                                <span style="cursor:pointer;color: #3B78DE;" @click="insertText">{{this.$t('mail.writeTranslate.insertTranslation')}}</span>
                            </Tooltip>
                        </div>
                        <div class="trans-div">
                            <Input ref="targetText" v-model="targetText" type="textarea" rows="14"></Input>
                        </div>
                    </Col>
                </Row>
            </div>
            <AddContact v-if="contactsModel"
                        :visible="contactsModel"
                        :showTabs="showTabs"
                        :addContactList.sync="addContactList"
                        @changeContactsModel="(flag) => contactsModel = flag">
            </AddContact>
            <Modal
                :visible.sync="addModal"
                :close-on-click-modal="false"
                :title="$t('crm.UniSet.setting_label')"
                :append-to-body="true"
                width="458px"
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
                        <Poptip v-model="visible"
                                style="flex: 1;display: flex;"
                                placement="bottom-end"
                                :visible-arrow="false"
                                :width="selectWidth"
                                popper-class="label_color_select"
                                ref="poptip">
                            <p class="label_color_item" slot="reference">
                                <i class="label_color_icon" :style="`background:${fontColorValue}`"></i>
                                {{ fontColorValue }}
                                <Icon :custom="`custom custom-menu-arrow-forward-medium ${visible ? 'is-reverse' : ''}`" size="12" style="position:absolute;right:0;"></Icon>
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
                :visible.sync="set_timeout_modal"
                :close-on-click-modal="false"
                :append-to-body="true"
                :show-close="false"
                width="520px"
                :title="$t('mail.set_timeout_mail')"
                class-name="vertical-center-modal timeout-modal"
                :styles="{top: '-60px'}">
                <div style="width: 80%;margin: 0 auto">
                    <p v-if="bj_time">
                        {{$t('mail.writeLetter.will_send')}}：<span style="color: #FA8241">{{bj_time}}</span>{{$t('mail.writeLetter.send')}}！
                    </p>
                </div>
                <Form :model="set_time_form" :rules="rule_time_form" label-width="80"
                      style="width: 80%;margin: 10px auto" ref="set_time_form">
                    <FormItem :label="$t('facebook.timeZone')">
                        <Select v-model="value">
                            <Option
                                    v-for="item in time_zone"
                                    :value="item.value"
                                    :key="item.value"
                                    :label="item.label">
                            </Option>
                        </Select>
                    </FormItem>
                    <FormItem :label="$t('mail.local_time')" prop="local_time">
                        <DatePicker
                                v-model="set_time_form.local_time"
                                :editable="false"
                                type="datetime"
                                placeholder="Select date and time"
                                popper-class="write-settime-mail"
                                default-time="09:00:00"
                                style="width: 100%">
                        </DatePicker>
                    </FormItem>
                </Form>
                <div v-if="local_time_flag && set_time_form.local_time !== '' " style="box-sizing:border-box;color: red;padding-left: 125px;margin-top: -15px;">
                    转换后的北京时间至少大于现在北京时间30分钟！
                </div>
                <div slot="footer">
                    <Button @click="handleCancelUpdate">{{$t('cancel')}}</Button>
                    <Button type="primary" :disabled="local_time_flag || !set_time_form.local_time" @click="set_timeout_modal=false">{{$t('confirm')}}</Button>
                </div>
            </Modal>
            <Modal
                :visible.sync="saveDraftTagModal"
                :close-on-click-modal="false"
                :append-to-body="true"
                width="520px"
                @close="handleSaveDraftCancel"
                :title="$t('mail.writeLetter.saveDraftTagTipsTitle')">
                <p>{{$t('mail.writeLetter.saveDraftTagTips')}}</p>
                <div slot="footer">
                    <Button @click="handelSaveDraftTag">{{$t('confirm') }}</Button>
                    <Button @click="handleSaveDraftCancel" type="primary">{{ $t('close') }}</Button>
                </div>
            </Modal>
            <Upload
                    ref="imageUpload"
                    :on-success="insertImage"
                    :action="action"
                    accept=".png,.jpeg,.jpg,.gif,.bmp,.ico"
                    style="display:none">
            </Upload>
            <Modal
                class="modal-footer-margin"
                :visible.sync="confirmLeaveModal"
                :append-to-body="true"
                :close-on-click-modal="false"
                width="360px">
                <p slot="title">
                    <span>{{$t('mail.leaveConfirm')}}</span>
                </p>
                <div>
                    <p>{{$t('mail.leaveTip')}}</p>
                </div>
                <div slot="footer">
                    <Button @click="() => confirmLeaveModal = false">{{$t('cancel')}}</Button>
                    <Button @click="jumpToMailHome">{{$t('mail.noSave')}}</Button>
                    <Button type="primary" @click="leaveAndSaveDraft" :loading="draftLoading">
                        {{$t('mail.saveDraft')}}
                    </Button>
                </div>
            </Modal>
        </div>
         <TaskModal
            v-if="taskModalShow"
            :visible.sync="modalShow"
            :type="modalType"
            :fromModule="fromModule"
            :taskObjProp="taskModalData"
            @setTask="setTask"></TaskModal>

        <!-- 监测链接的弹窗组件 -->
        <monitorLink :visible.sync="visible_insertLink"
                     @insertUrl="handleInsertUrl"></monitorLink>
        <!-- 内容含有附件或attachment 但实际没有附件提示 -->
        <Modal
            :visible.sync="noAttachmentModal"
            :close-on-click-modal="true"
            :append-to-body="true"
            width="520px"
            :title="$t('mail.writeLetter.addAttachmentTitle')">
            <p>{{$t('mail.writeLetter.addAttachmentText')}}</p>
            <div slot="footer">
                <Button @click="noAttachmentModal = false">{{$t('crm.UniSet.modal_cancel') }}</Button>
                <Button @click="saveEmail(noAttachmentData)" type="primary">{{ $t('crm.UniSet.modal_ok') }}</Button>
            </div>
        </Modal>
        <!-- 插入模板弹窗 -->
        <mailTemplateModal :visible.sync="addTemplateVisible" @handleTemplate="handleTemplate"></mailTemplateModal>
    </div>
</template>

<script>
    import Vue from 'vue';
    import Cookies from 'js-cookie';
    import tinymce from 'tinymce/tinymce';
    import 'tinymce/themes/silver';
    /** 解决tinymce Firefox浏览器兼容问题 */
    // import 'tinymce/plugins/paste';
    import 'tinymce/plugins/image';
    import 'tinymce/plugins/link';
    import 'tinymce/plugins/autolink';
    import 'tinymce/plugins/lists';
    import 'tinymce/plugins/hr';
    import 'tinymce/plugins/nonbreaking';
    import 'tinymce/plugins/charmap';
    import 'tinymce/plugins/print';
    import 'tinymce/plugins/anchor';
    import 'tinymce/plugins/imagetools';
    import 'tinymce/plugins/media';
    import 'tinymce/plugins/save';
    import 'tinymce/plugins/directionality';
    import 'tinymce/plugins/textcolor';
    import 'tinymce/plugins/colorpicker';
    import 'tinymce/plugins/textpattern';
    import 'tinymce/plugins/fullscreen';
    import 'tinymce/plugins/table';
    import 'tinymce/plugins/code';
    import 'tinymce/plugins/emoticons';
    import 'tinymce/icons/default';
    import '@/utils/tinymcplaceholder';

    import util from '@/libs/util';
    import AddContact from '@/views/mail/mail-home/components/write-mail/Modal/address_book_modal';
    // import UploadList from '../../../mail/mail-home/components/write-mail/upload-list';
    import selfUpload from '@/views/mail/mail-home/components/write-mail/self-upload';
    import * as qiniu from 'qiniu-js';
    import TagInput from '@/views/main-components/tag-input/tag-input';
    import MailInput from '@/views/main-components/tag-input/mail-input';
    import TagShow from '@/views/main-components/tag-input/tag-show';
    import monitorLink from '@/views/main-components/contact-association/monitorLink';
    import writeMailTranslate from '@/mixins/writeMailTranslate'; // 引入翻译功能相关共通代码
    import smartmaterialIcons from '@/configs/smartmaterialIcons.js'; // 引入智能物料icon图标(base64)
    import taskPoptip from '@/views/mail/mail-home/components/taskPoptip';
    import TaskModal from '@/views/crm/Detail/Components/Modal/taskModals';
    import { crmCommon } from '@/api/crm/index';
    import { mapState, mapGetters } from 'vuex';
    import writeApi from '@/api/mail/write';
    import mailCommon from '@/api/mail/common.js';
    import { triggerGtag } from '@/utils/base';
    const mailTemplateModal = () => import("@/views/main-components/mail-template-modal.vue"); // 新增模板

    // ai tool bar
    import { getInputSelectedText, coverText, insertText } from '@/views/ai-toolbar/utils/tools'

    export default {
        name: 'writeMailModal',
        mixins: [writeMailTranslate],
        props: {
            isSaveDraft: {
                type: Boolean,
                default: false
            },
            currentBoxType: {
                type: String
            },
            no_settime: {
                type: Boolean,
                default: false
            },
            writeType: {
                type: String
            },
            whereToWrite: {
                type: String
            },
            toRouterObj: {
                type: Object
            },
            currentBox: {
                type: String
            },
            mailDetailMailEdit: {
                type: Boolean
            },
            mailDetailId: {
                type: String
            },
            createUserId: {
                type: String
            },
            mailDetailReplyType: {
                type: String
            },
            mail_modal_width: {
                type: String
            },
            isModalFullScreen: {
                type: Boolean
            }
        },
        components: {
            AddContact,
            // UploadList,
            selfUpload,
            TagInput,
            MailInput,
            TagShow,
            monitorLink,
            taskPoptip,
            TaskModal,
            mailTemplateModal
        },
        data() {
            return {
                replyStatus: false,
                dataBaseLoading: null, // 添加智能物料时的loading
                dataBaseList: [], // 存智能物料的数据
                value: 0,
                windowHeight: document.body.offsetHeight,
                isSendMailSuccess: false,
                is_show: true,
                isSeparate: 0,
                max_size: 25600,
                tagList: [],
                writeMailTags: [],
                mailLabelIds: [],
                saveDraftTagModal: false,
                addModal: false,
                tagName: '',
                // poptip 整体
                visible: false,
                selectWidth: '166',
                fontColorValue: '#71A3F5',
                predefineColors: [ '#71A3F5', '#40D9B3', '#50D4DF', '#9C8CF2', '#FF985F', '#FFCD43', '#40CEFE', '#7388B6', '#5BBA7E', '#EF7267'],
                isReciMax: false,
                placeholder: this.$t('mail.writeLetter.bulkCopyHolder'),
                readonly: false,
                isShowOnSeparate: true,
                set_time_form: {
                    time_difference: 0,
                    local_time: null
                },
                /**
                 * @Description: 修改时区和修改时间的表单值改变，表单验证的结果只作用于自身，
                 *                 所以会出现只修改时区不修改时间，满足时间要求后，错误提示仍一直存在的问题
                 *                 所以弃用表单自带的验证规则，改为监听set_time_form的值变化，触发check_local_time启动校验
                 *                 校验结果用local_time_flag保存，用于控制提示语的隐藏显示。
                 * @author 杨娣
                 * @date 2019/10/9
                 */
                rule_time_form: {
                    local_time: [
                        { required: true, type: 'date', message: this.$t('mailSetting.fastText.quickContentTip'), trigger: 'blur' }
                    ]
                },
                /**
                 * @Description: 将东八区作为格林威治时间参考点，所以只有东九区和东十区的时差为负，其他时区都应该是正值。
                 * @author 杨娣
                 * @date 2019/10/08
                 */
                time_zone: [
                    {
                        label: this.$t('mail.utc_add0'),
                        value: 480
                    },
                    {
                        label: this.$t('mail.utc_add1'),
                        value: 420
                    },
                    {
                        label: this.$t('mail.utc_add2'),
                        value: 360
                    },
                    {
                        label: this.$t('mail.utc_add3'),
                        value: 300
                    },
                    {
                        label: this.$t('mail.utc_add4'),
                        value: 240
                    },
                    {
                        label: this.$t('mail.utc_add5'),
                        value: 180
                    },
                    {
                        label: this.$t('mail.utc_add6'),
                        value: 120
                    },
                    {
                        label: this.$t('mail.utc_add7'),
                        value: 60
                    },
                    {
                        label: this.$t('mail.utc_add8'),
                        value: 0
                    },
                    {
                        label: this.$t('mail.utc_add9'),
                        value: -60
                    },
                    {
                        label: this.$t('mail.utc_add10'),
                        value: -120
                    },
                    {
                        label: this.$t('mail.utc_add11'),
                        value: -180
                    },
                    {
                        label: this.$t('mail.utc_add12'),
                        value: -240
                    },
                    {
                        label: this.$t('mail.utc_1'),
                        value: 540
                    },
                    {
                        label: this.$t('mail.utc_2'),
                        value: 600
                    },
                    {
                        label: this.$t('mail.utc_3'),
                        value: 660
                    },
                    {
                        label: this.$t('mail.utc_4'),
                        value: 720
                    },
                    {
                        label: this.$t('mail.utc_5'),
                        value: 780
                    },
                    {
                        label: this.$t('mail.utc_6'),
                        value: 840
                    },
                    {
                        label: this.$t('mail.utc_7'),
                        value: 900
                    },
                    {
                        label: this.$t('mail.utc_8'),
                        value: 960
                    },
                    {
                        label: this.$t('mail.utc_9'),
                        value: 1020
                    },
                    {
                        label: this.$t('mail.utc_10'),
                        value: 1080
                    },
                    {
                        label: this.$t('mail.utc_11'),
                        value: 1140
                    }
                ],
                // 定时邮件弹框
                set_time_flag: false,
                is_timed_mail: false,
                set_timeout_modal: false,
                timer: null,
                // 收件人 Addressee  抄送人 cc_person 密送人 bcc_person
                add_link_type: 'Addressee',
                dragOver: false,
                accountId: null, // 发件人账号ID
                senders: [], // 发件人账号列表
                senderIndex: null, // 发件人列表索引
                contacts: [], // 联系人列表
                mailSignAccountList: [], // 发件账号对应不同的默认签名
                signatures: [], // 签名列表
                signature: '', // 写信使用的签名
                signatureNew: '', // 回复等使用的签名
                quickTexts: [], // 快速文本列表
                quickText: '', // 快速文本
                action: '', // 上传图片url
                uptoken: '',
                mailContent: '', // 邮件内容
                emailForm: {
                    from: '', // 发件人账号
                    recipients_to: [], // 收件人
                    recipients_cc: [], // 抄送人
                    recipients_bcc: [], // 密送人
                    subject: '', // 主题
                    mailSignIndex: 0, // 邮件签名索引
                    mailSignId: '', // 邮件签名id
                    priority: false, // 紧急
                    receipt_flag: false, // 回执
                    mailIsTrace: false, // 追踪邮件
                    mailTimeFlag: false, // 定时邮件
                    bjTime: null// 定时邮件
                },
                requestSerialCode: '', // 发送邮件时生成唯一Key,防止发信接口超时多次发送
                allRecipientsList: [], // 全部接收人，收起状态显示
                expandRecipientDetailsShow: true, // 是否展开全部接收人
                firstVisit: true, // 记录首次进入页面
                isInitFinishedMail: false, // 写信页面是否初始化完成
                bjTime: null,
                ccModel: false, // 显示抄送人
                bccModel: false, // 显示密送人
                contactsModel: false, // 显示联系人选框
                emitModalId: '', //
                addContactList: [], // 添加联系人列表
                textModel: false, // 显示快速文本列表
                publishLoading: false, // 发布中
                draftLoading: false, // 存草稿中
                saveMailCrmRelationConditions: [], //
                signatureIds: [], // 新邮件、回复邮件、转发邮件签名id
                signatureId: 0, // 签名id
                defaultSendAccount: '', // 默认发件人
                signChangeCount: 0, // 签名切换计数
                leaveModal: false, // 离开当前页面模态框
                defaultFileList: [],
                originalMailFrom: '', // 原始邮件的发件人
                originalMailId: '', // 原始邮件的id

                local_time_flag: false, // 当地时间转换后的北京时间是否小于当前北京时间30分钟

                isFirstUpload: true, // 是否是第一次上传附件
                autoSaveDraftTimer: null, // 自动保存草稿定时器标志
                autoSaveDraftFlag: false, // 自动保存草稿的标志

                showSubjectInput: true,
                updateSendTimeFlag: false, // 修改发送时间的标志
                lastSetTimeForm: {}, // 修改发送时间之前的定时信息
                fastTextSearch: '', // 搜索快速文本
                fastTextShowLag: true, // 快速文本默认显示
                textCurrentPage: 0, // 快速文本列表当前页码
                fastTextPageSize: 10, // 快速文本列表每页显示数量
                textTotalNumber: 0, // 快速文本数量总和
                inputSelectStartIndex: 0, // 输入框光标起始位置
                inputSelectEndIndex: 0, // 输入框光标停留位置
                cursorType: 'editor', // 光标所处位置：subject/主题，editor/正文，person/收件人/发件人/密送人

                crmEmails: [],
                newCompanyShow: false,
                newClueShow: false,
                mailAddress: '', // 创建新客户/新线索的邮箱

                show_company_detail: false,
                type_company: 'customer',
                companyId: 0,
                show_clue_detail: false,
                type_clue: '',
                clueId: '',
                templateId: '', // 线索模板id
                templateList: [],
                json_data: {},
                mailDraftFlag: 0, // 邮件是否是一封草稿
                fromOrToFlag: null, // 邮件是收件 or 发件

                cancelFunc: null, // 取消上一次请求
                emailCount: 0, // 当前写信页面的收件邮箱地址总数
                defaultMailSetting: {
                    fontFamilyValue: 'arial', // 默认写信字体
                    fontSizeValue: '16px', // 默认写信字号
                    fontColorValue: '#000' // 默认写信颜色
                },
                clickButton: '', // 区分点击的是发送还是存草稿(定时邮件需要区分开)

                showTabs: ['clue_contact', 'customer_contact', 'colleagues_contact', 'personal_contact'], // 由于智能物料与邮件管理的AddContact组件为完全复用关系，此变量用于控制通讯录弹窗中显示的Tab项。

                /* 帮助中心 */
                isDrawerShow: false,

                /* 默认新窗口写信相关 */
                confirmLeaveModal: false, // 确认离开写信页面的弹窗
                saveDraftOperateType: '', // 触发保存草稿操作的来源
                email_id: '', // 要回复、转发、编辑的邮件id
                mailId: '', // 保存草稿之后得到的草稿邮件id
                /* 主题/正文插入变量相关 */
                variableList: [
                    {
                        label: this.$t('automatedMail.userName'),
                        value: 'name',
                        class: 'piwik-separate-insert-contactName'
                    },
                    {
                        label: this.$t('automatedMail.companyName'),
                        value: 'companyName',
                        class: 'piwik-separate-insert-companyName'
                    }
                ],
                variables: [], // 群发单显增加的变量名信息
                isShowCompanyName: true, // 当前用户是否拥有[公司名称]的字段权限
                isShowContactName: true, // 当前用户是否拥有[姓名]的字段权限
                mailDetail: {},
                sendTip: '',
                linkmanListWidth: 0,
                uploadAttachment: false,
                uploadImages: false,
                visible_insertLink: false,
                // TaskModal相关
                taskObj: null,
                taskModalShow: false,
                modalShow: false,
                taskModalData: null,
                fromModule: '',
                modalType: 'newTask', // showTask（详情）、newTask（新建）、editTask（编辑）
                copyAttachmentNotice: null,
                noAttachmentReg: new RegExp('附件|attachment', 'i'),
                noAttachmentModal: false, // 内容有附件，但没有上传提示
                noAttachmentData: null, // 存储下邮件form内容
                toxTinymce: null,
                vModalEditorIframe: null,
                original_recipients_cc: [], // 原邮件回填的抄送人
                original_recipients_bcc: [], // 原邮件回填的密送人
                defaultCc: [], // 设置默认抄送人
                defaultBcc: [], // 设置默认密送人
                addTemplateVisible: false // 添加模板弹窗
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                qiniuHttp: 'qiniuHttp',
                qiniuUrl: 'qiniuUrl',
                window_width: 'window_width',
                window_height: 'window_height',
                selectedMailBoxType: state => state.mail.selectedMailBoxType,
                replyMailType: state => state.mail.replyMailType,
                mailEdit: state => state.mail.mailEdit,
                currentPersonId: state => state.mail.currentPersonId,
                saveWithWhich: state => state.mail.saveWithWhich,
                // 写信页面富文本编辑器 content_style 配置中会影响邮件内容渲染的样式
                tinymce_contentStyle: state => state.mail.tinymce_contentStyle,
                isHidden: 'isHidden',
                sendMailUrl: state => state.mail.sendMailUrl,
                mailTagList: state => state.mail.mailTagList
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            $lang() {
                return Vue.config.lang;
            },
            bj_time_flag() {
                if (this.set_time_form.local_time) {
                    if ((this.set_time_form.local_time.getTime() + this.set_time_form.time_difference * 60000 - new Date().getTime()) > 1800000) {
                        return this.set_time_form.local_time.getTime() + this.set_time_form.time_difference * 60000;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            },
            bj_time() {
                if (this.bj_time_flag) {
                    return this.dateFormat('yyyy-MM-dd hh:mm:ss', this.bj_time_flag);
                } else {
                    return false;
                }
            },
            modal_width() {
                return parseInt(this.mail_modal_width.slice(0, this.mail_modal_width.length - 2) - 50);
            },
            auto_width() {
                return '90px';
            },
            nowTime() {
                const t = new Date();
                const minute = t.getMinutes() < 10 ? `0${t.getMinutes()}` : t.getMinutes();
                return `${t.getFullYear()}年${t.getMonth() + 1}月${t.getDate()}日 ${t.getHours()}:${minute}`;
            },
            getSpan() {
                return this.writeType === 'theSameTab' ? 20 : 24;
            },
            getClass() {
                if (this.writeType !== 'theSameTab') {
                    return 'newTabClass';
                } else {
                    return '';
                }
            }
        },
        created() {
            this.getTags();
            this.requestSerialCode = `${this.enterpriseId}${this.userId}${new Date().getTime()}`;
            this.getWriteMailDefault(); /* 通过用户ID获取发件人邮箱列表 */
        },
        mounted() {
            tinymce.execCommand('mceRemoveEditor', true, 'vModalEditor');
            const contacts = this.$options.filters.parseObject(localStorage.getItem('leadsCloud-sendMail-contacts'));
            if (contacts) {
                localStorage.removeItem('leadsCloud-sendMail-contacts');
                this.saveMailCrmRelationConditions = contacts.map(item => {
                    this.contacts.push(`${item.receiverName}<${item.receiveMailAddress}>`);
                    this.emailForm.recipients_to.push(`${item.receiverName}<${item.receiveMailAddress}>`);
                    return item;
                });
            }
            // 获取写信页面右侧的联系人列表宽度
            this.$nextTick(() => {
                this.linkmanListWidth = document.querySelector('.linkman-list') ? document.querySelector('.linkman-list').offsetWidth : 0;
                const _this = this;
                document.body.addEventListener('dragenter', _this.enter_drag, false);
                document.body.addEventListener('drop', _this.dragleave, false);
            });
            this.autoSaveDraft();
        // 获取全部销售人员  页面中没有用到 暂时注释再这个
        // this.$store.dispatch('getSalesList');
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
                this.visible = false;
            },
            // 获取写信设置相关
            getWriteMailDefault() {
                const params = {
                    createUserId: this.userId
                };
                if (['replyCurrent', 'replyAll', 'replyWithAttachment','replywithoutOriginalText', 'replyAllWithoutOriginalText', 'forwardAsAttachment', 'forward', 'reedit'].includes(this.replyMailType) && this.mailDetailId) {
                    params.originalMailId = this.mailDetailId;
                    params.originalCreateUserId = this.createUserId;
                }
                writeApi.getWriteMaildefault(params).then(res => {
                    if (res.code === 1) {
                        // 通过用户ID获取发件人邮箱列表 发件人相关操作 开始
                        this.senders = res.data.mailAccount || [];
                        // 发件人数组长度校验
                        if (this.senders.length) {
                            // 判断得到默认发件人 index
                            let index;
                            if (this.senders.length === 1 || params.originalMailId) {
                                // 发件人只有一个 或 是"回复邮件", 自动选中第一个发件人回填
                                index = 0;
                            } else {
                                // 否则, 自动选中第一个 flag 为 '1' 的发件人回填
                                index = this.senders.findIndex(item => `${item.defaultSendAccountFlag}` === '1');
                                if (index === -1) {
                                    index = 0;
                                }
                            }
                            // 选中默认发件人
                            const item = this.senders[index];
                            this.accountId = item.id;
                            this.senderIndex = index;
                            this.emailForm.from = item.emailAddress;
                            this.defaultSendAccount = item.emailAddress;
                        }
                        // 发件人相关操作 结束
                        // 获取七牛图片上传token
                        this.action = `//upload.qiniup.com?token=${res.data.uptoken.uptoken}`;
                        // 写信默认设置
                        if (res.data.userConfig && res.data.userConfig.value) {
                            const result = JSON.parse(res.data.userConfig.value);
                            this.defaultMailSetting.fontFamilyValue = result.fontFamilyValue ? result.fontFamilyValue : 'arial';
                            this.defaultMailSetting.fontSizeValue = result.fontSizeValue ? result.fontSizeValue : '16px';
                            this.defaultMailSetting.fontColorValue = result.fontColorValue ? result.fontColorValue : '#000';
                        } else {
                            /* 如果未获取到用户的写信默认设置数据，则将产品给定的一套初始默认设置数据，保存至后台 */
                            this.addDefaultSetting();
                        }
                        this.initEditor();
                    } else {
                        this.$Message.error(res.message);
                    }
                });
            },
            /* 将获取到的智能物料的链接插入邮件内容区 */
            addDataBaseFile(arr) {
                // 获取邮件富文本的dom
                const currDoc = tinymce.activeEditor.iframeElement.contentDocument;

                // 文本中是否有回复的dom
                const relayPlaceholderDom = currDoc.getElementById('relayPlaceholder');
                // 文本中是否有回复的dom
                const forwardPlaceholderDom = currDoc.getElementById('forwardPlaceholder');

                const relayPlaceholderDoms = currDoc.querySelectorAll('#dataModalBaseFile');
                // 将回复的内容中有id为dataBaseFile的dom移除id
                if (relayPlaceholderDoms && relayPlaceholderDom && !this.replyStatus) {
                    this.replyStatus = true;
                    relayPlaceholderDoms.forEach(item => {
                        item.removeAttribute('id');
                    });
                }

                // 当前富文本 id为dataBaseFile的dom
                const currSignNode = currDoc.getElementById('dataModalBaseFile');
                let currSignNodeParentNode = null;
                // 如果富文本中有id为dataBaseFile的dom,则在富文本中移除
                if (currSignNode) {
                    if (['forward', 'reedit'].includes(this.replyMailType)) {
                        // 父节点
                        currSignNodeParentNode = currSignNode.querySelector('ul');
                    } else {
                        currDoc.body.firstChild.removeChild(currSignNode);
                    }
                };

                // 新建添加文件的dom
                const dataBaseFileDom = document.createElement('div');
                dataBaseFileDom.id = 'dataModalBaseFile'; // 添加一个自定义的id
                dataBaseFileDom.style = 'font-size:14px;background: #F5F6F9;border-radius: 4px;padding:12px;margin-top:24px; clear:both;'; // 添加样式

                /** dom的内容区 start */
                // 要添加的文本(顶部)
                const dataBaseDom = document.createElement('div');
                // 顶部左侧span
                const spanDom1 = document.createElement('span');
                spanDom1.style = 'font-weight:600;margin-right:12px;color:rgba(0,0,0,0.8);';
                spanDom1.innerHTML = 'Document List';
                dataBaseDom.appendChild(spanDom1);
                // 顶部右侧span
                const spanDom2 = document.createElement('span');
                spanDom2.style = 'font-size:12px;color:rgba(0,0,0,0.6);';
                spanDom2.innerHTML = 'Tip: Click file name to preview and download the file';
                dataBaseDom.appendChild(spanDom2);

                const ulDom = document.createElement('ul');
                ulDom.style = 'padding:0;margin:0;'; // ul的样式
                arr.forEach(item => {
                    const imgDom = document.createElement('img'); // 新建i标签
                    imgDom.style = 'height: 24px;width: 24px;font-size:16px;margin-right:10px;';
                    // 根据文件类型匹配正确的img文件图标
                    for (const key in smartmaterialIcons) {
                        if (item.suffix === key) {
                            imgDom.src = smartmaterialIcons[key];
                            break;
                        } else {
                            imgDom.src = smartmaterialIcons.default;
                        };
                    };

                    const liDom = document.createElement('li'); // 新建li标签
                    liDom.style = 'margin-top:12px;list-style:none;display:flex;align-items:center;';
                    const aDom = document.createElement('a'); // 新建a标签
                    aDom.style = 'text-decoration:none;color:#3B78DE;font-size:12px;';
                    aDom.href = item.url;
                    aDom.target = '_blank';
                    aDom.innerHTML = item.fileName;
                    liDom.appendChild(imgDom); // li标签里面追加i标签
                    liDom.appendChild(aDom); // li标签里面追加a标签
                    if (currSignNodeParentNode) {
                        currSignNodeParentNode.appendChild(liDom);
                    } else {
                        ulDom.appendChild(liDom); // ul标签里面追加li标签
                    }
                });
                /** dom的内容区 end */
                // 再次编辑时,重新追加ul列表
                if (currSignNodeParentNode) {
                    this.dataBaseLoading = false; // 关闭loading效果
                    return;
                };
                // 替换dom内容
                dataBaseFileDom.appendChild(dataBaseDom);
                dataBaseFileDom.appendChild(ulDom);

                // 转发的时候
                if (forwardPlaceholderDom && this.replyMailType === 'forward') {
                    currDoc.body.firstElementChild.insertBefore(dataBaseFileDom, forwardPlaceholderDom);
                    this.dataBaseLoading = false; // 关闭loading效果
                    return;
                };

                // 回复的时候
                if (relayPlaceholderDom) {
                    currDoc.body.firstElementChild.insertBefore(dataBaseFileDom, relayPlaceholderDom);
                    this.dataBaseLoading = false; // 关闭loading效果
                    return;
                };
                currDoc.body.firstElementChild.appendChild(dataBaseFileDom);
                this.dataBaseLoading = false; // 关闭loading效果
            },
            // 选择文件弹窗点击确定后调用的方法
            handleDataBaseFile(data, activeTab) {
                this.dataBaseLoading = true; // loading效果
                // data: 文件列表;activeTab: 表示文件是属于个人、公司、共享
                const arr = [];
                for (let i = 0; i < data.length; i++) {
                    const obj = {};
                    obj.title = data[i].filename; // 文件名
                    /**
                     * 文件描述:
                     * 问题：1.个别文件的文件名没有文件类型后缀;2大部分文件名有文件类型后缀;
                     * 解决: 1. 没有文件类型后缀的:直接用文件名作为<文件描述>
                     *      2.文件名是有文件类型后缀的:直接用去掉文件后缀的文件名作为<文件描述>
                     */
                    obj.description = data[i].filename.lastIndexOf('.') ? data[i].filename : data[i].filename.substring(0, data[i].filename.lastIndexOf('.'));
                    obj.fileId = data[i].id; // 文件id
                    obj.fileType = activeTab === 'person' ? 10 : activeTab === 'company' ? 11 : activeTab === 'share' ? 12 : 10; // 个人: 10、公司: 11、共享: 12
                    obj.image = 'https://content.leadscloud.com/FjIk9U8rVHGGRAWZHXRHkIxbiYIY'; // 文件预览图
                    obj.isPublic = 0; // 是否需要查看人登录 Facebook 授权,如果不授权将无法预览文件; 0:表示不授权
                    arr.push(obj);
                }

                // 获取智能物料链接
                util.ajaxShareMail({
                    url: '/push/mailAddCloudShare',
                    method: 'POST',
                    data: arr
                }).then((response) => {
                    if (response.data.code === '1') {
                        // 保存接口返回的智能物料的数据
                        const result = response.data.data;

                        // 多次添加智能物料，则按顺序依次添加至文件列表下方
                        const smartMaterial = this.dataBaseList.concat(result);

                        // 将this.dataBaseList更新为最新的数据
                        this.dataBaseList = smartMaterial;

                        // 将获取到的智能物料的链接插入邮件内容区
                        this.addDataBaseFile(smartMaterial);
                    } else {
                        this.$Message.error(response.data.message);
                    };
                }).catch(error => {
                    console.error(error);
                });
            },
            // 点击'添加资料库文件'时出现'选择文件'弹窗
            handleFileSelected() {
                // 选择文件弹窗
                this.$refs.filesUpload.handleClick('showDataBaseModel');
            },
            /** 关闭快速翻译列表 */
            closeTranslate() {
                this.translateModel = false;
            },
            // 点击翻译时调用全屏函数
            showTranslateBoxFullScreen() {
                // 全屏
                this.$emit('modalFullScreen', true);
                this.$nextTick(() => {
                    this.linkmanListWidth = document.querySelector('.linkman-list') ? document.querySelector('.linkman-list').offsetWidth : 0;
                });
            },
            // 显示翻译框
            showTranslateBox() {
                this.showTranslateBoxFullScreen();
                // 如果当前显示了翻译功能,则进行提示
                if (this.translateModel) {
                    this.$Message.warning({
                        message: this.$t('mail.writeTranslate.translationTurnedOn'),
                        duration: 1500
                    });
                    return;
                };
                // 如果缓存中有翻译过的记录,则获取记录并更换到data数据中
                if (Cookies.get('writeTargetLang')) {
                    const languageList = this.languageList;
                    for (let i = 0; i < languageList.length; i++) {
                        // 先判断是否有缓存,如果有则用缓存中的目标语言,如果没有缓存,则用默认的语言作为目标语言
                        // 有缓存时,将目标语言改为缓存中的目标语言
                        if (languageList[i].value === Cookies.get('writeTargetLang')) {
                            this.targetLang = Cookies.get('writeTargetLang');
                            this.targetTranslate = languageList[i].label;
                            break;
                        };
                    };
                };
                this.translateModel = true; // 显示翻译功能
                this.textModel = false; // 隐藏快速文本功能
                this.cursorType = 'editor';
            },
            /* ---------------------------写信页面初始化------------------------------------------------ */
            /* 页面表单初始化 */
            initPage() {
                const vm = this;
                const id = this.mailDetailId;
                const type = this.selectedMailBoxType;
                const rType = this.replyMailType;
                const mailEdit = this.mailEdit;

                // 抄密送人的回填逻辑 原邮件抄密送人 + 设置默认的抄密送人
                for (let i = 0; i < vm.senders.length; i++) {
                    const item = vm.senders[i];
                    if (item.emailAddress === vm.emailForm.from && (item.defaultCc || item.defaultBcc)) {
                        this.defaultCc = item.defaultCc.length ? JSON.parse(item.defaultCc) : [];
                        this.defaultBcc = item.defaultBcc.length ? JSON.parse(item.defaultBcc) : [];
                    }
                }
                if (!rType) {
                    // 新建 回填默认设置抄密送人
                    vm.emailForm.recipients_cc = this.defaultCc;
                    vm.emailForm.recipients_bcc = this.defaultBcc;
                    // 抄密送框是否显示
                    vm.ccModel = Boolean(vm.emailForm.recipients_cc.length);
                    vm.bccModel = Boolean(vm.emailForm.recipients_bcc.length);
                }

                /* this.mailId用于在回复邮件时，当满足原始邮件发件人包含于收件人列表时，对原始邮件增加已回复标识的逻辑中。
                 * 倘若不加if(id && mailEdit)的判断，则点击邮件列表某一邮件进入详情页------退出详情页---点击写信新建邮件并发送，
                 * 会使得通过写信按钮新建并发送的邮件，与另一封毫不相关的邮件产生回复的关系。
                 * */
                // 邮件初始化完成
                this.isInitFinishedMail = true;
                if (id && mailEdit) {
                    this.mailId = id;
                    if (rType === 'forwardAsAttachment') {
                        this.getMailEml();
                        this.getMailSignsGeneralSetting();
                        // 作为附件转发 回填默认设置抄密送人
                        vm.emailForm.recipients_cc = this.defaultCc;
                        vm.emailForm.recipients_bcc = this.defaultBcc;
                        // 抄密送框是否显示
                        vm.ccModel = Boolean(vm.emailForm.recipients_cc.length);
                        vm.bccModel = Boolean(vm.emailForm.recipients_bcc.length);
                    } else {
                        util.ajaxMailJson({
                            url: '/mail/mailDetail',
                            method: 'get',
                            params: {
                                userId: this.userId,
                                orgId: this.enterpriseId,
                                id,
                                createUserId: this.createUserId
                            }
                        }).then(response => {
                            if (response.data.code === 1 || response.data.code === -4) {
                                /**
                                 * @Description:
                                 * 问题描述：当邮件内容过多时，回复该邮件时会出现签名出现在正文之后，并且无空白区域供用户输入的情况；
                                 * 原因：获取邮件内容的请求和获取签名的请求是并行发送的，如果签名在邮件内容获取到之前渲染，就会出现以上问题；
                                 * 解决方案：在邮件内容获取到之后再请求签名
                                 * @author 杨娣
                                 * @date 2019/9/6
                                 */
                                this.getMailSignsGeneralSetting(response.data.data.mailSignId);
                                /* -------------非新建邮件时，需要将获取到的邮件信息，回填显示至相应的页面区域----------------- */
                                const data = response.data.data;

                                // 去掉可能存在的, 邮件开头加的 iframe head style
                                if (data.content && data.content.startsWith(this.tinymce_contentStyle)) {
                                    data.content.replace(this.tinymce_contentStyle, '');
                                }

                                // 由于接口返回这些人是“[ '****@***.com','****@***.com' ]”或者“'****@***.com','****@***.com'”这种格式，所以才会有下面的各种判断取值
                                // 收件人
                                const recipients_to = data.recipients_to[0] === '[' && data.recipients_to[data.recipients_to.length - 1] === ']' ? (JSON.parse(data.recipients_to).length === 1 && !JSON.parse(data.recipients_to)[0] ? [] : JSON.parse(data.recipients_to)) : data.recipients_to ? data.recipients_to.split(',') : [];
                                // 抄送人
                                const recipients_cc = data.recipients_cc[0] === '[' && data.recipients_cc[data.recipients_cc.length - 1] === ']' ? (JSON.parse(data.recipients_cc).length === 1 && !JSON.parse(data.recipients_cc)[0] ? [] : JSON.parse(data.recipients_cc)) : data.recipients_cc ? data.recipients_cc.split(',') : [];
                                // 密送人
                                const recipients_bcc = data.recipients_bcc[0] === '[' && data.recipients_bcc[data.recipients_bcc.length - 1] === ']' ? (JSON.parse(data.recipients_bcc).length === 1 && !JSON.parse(data.recipients_bcc)[0] ? [] : JSON.parse(data.recipients_bcc)) : data.recipients_bcc ? data.recipients_bcc.split(',') : [];
                                vm.contacts = [...new Set(recipients_to.concat(recipients_cc).concat(recipients_bcc))];
                                vm.originalMailFrom = data.from;
                                vm.mailDraftFlag = data.mailDraftFlag;
                                vm.fromOrToFlag = data.fromOrToFlag;
                                vm.original_recipients_cc.push(...recipients_cc);
                                vm.original_recipients_bcc.push(...recipients_bcc);
                                vm.set_time_flag = (data.mailTimeFlag === 1);
                                vm.is_timed_mail = (data.mailTimeFlag === 1);
                                if (!rType) {
                                    vm.isSeparate = data.mailGroupSendingSingleShowFlag;
                                }
                                if (data.mailBoxTypeId === 5) {
                                    vm.email_id = vm.mailId;
                                    vm.emailForm.mailIsTrace = data.mailTraceFlag === 1;
                                }
                                vm.mailLabelIds = data.mailLabelIdsString || [];
                                if (data.timeZone) {
                                    vm.set_time_form.time_difference = parseInt(data.timeZone);
                                    vm.value = vm.set_time_form.time_difference;
                                }
                                if (data.timeZoneTime) vm.set_time_form.local_time = new Date(data.timeZoneTime);
                                if (data.bjTime) vm.bjTime = this.dateFormat('yyyy-MM-dd hh:mm:ss', data.bjTime);
                                vm.is_show = false;
                                if (this.mailLabelIds.length) {
                                    this.tagList.forEach(item => {
                                        if (this.mailLabelIds.some(subItem => item.id === subItem)) {
                                            this.writeMailTags.push(item);
                                        }
                                    });
                                }
                                if (type === 'draftBox') {
                                    if (data.mailReceiptFlag) {
                                        vm.emailForm.receipt_flag = true;
                                    }
                                    if (data.mailUrgentFlag === 1) {
                                        vm.emailForm.priority = true;
                                    }
                                }
                                /**
                                 * @Description: 群发单显邮件支持手动输入，此处注释相关代码
                                 * @author 杨娣
                                 * @date 2020/10/21
                                 */
                                // if (data.mailGroupSendingSingleShowFlag === 1 && !rType) {
                                //     vm.readonly = true;
                                // }
                                /*  草稿箱邮件重新编辑时，需要判断发件人是否还存在于该询盘用户绑定的邮箱账号中 */
                                if (type === 'draftBox') {
                                    vm.emailForm.from = '';
                                    vm.emailForm.originalMailId = data.originalMailId;
                                    vm.originalMailId = data.originalMailId;
                                    if (data.from) {
                                        data.from = vm.getStandardEmail(data.from);
                                        for (const item of vm.senders) {
                                            if (data.from.replace(/\<|>/g, '') === item.emailAddress) {
                                                vm.emailForm.from = item.emailAddress;
                                            }
                                        }
                                    }
                                    vm.emailForm.recipients_to.push(...recipients_to);
                                } else {
                                    vm.emailForm.from = vm.defaultSendAccount;
                                    /**
                                     * @Description: 收件箱邮件在回复时，收件人处回填的为原邮件发件人的信息；
                                     *               已发箱邮件在回复时，收件人处回填的为原邮件收件人信息；
                                     * @author 杨娣
                                     * @date 2020/6/4
                                     */
                                    if (!data.fromOrToFlag) {
                                        /* 收件 */
                                        /**
                                         * 当前发件人邮箱不等于原邮件的发件人邮箱时，当前邮件为一封回复收件的邮件
                                         * */
                                        if (vm.emailForm.from !== this.getStandardEmail(data.from)) {
                                            /**
                                             * 所有的回复邮件都需要把原发件人回填到收件人的位置，先把指定的收件人或者原发件人回填到收件人位置
                                             * @Description: 若data.replyTo有值，则判定是一封中转邮件，需要回复给指定的收件人；否则回复给原始发件人
                                             * @author 杨娣
                                             * @date 2020/10/22
                                             */
                                            if (rType.indexOf('reply') !== -1) {
                                                vm.emailForm.recipients_to = data.replyTo && data.replyTo[0] === '[' && data.replyTo[data.replyTo.length - 1] === ']' ? (JSON.parse(data.replyTo).length === 1 && !JSON.parse(data.replyTo)[0] ? [data.from] : JSON.parse(data.replyTo)) : data.replyTo ? data.replyTo.split(',') : [data.from];
                                                // 去掉重复邮箱
                                                vm.emailForm.recipients_to = vm.emailForm.recipients_to.filter(item => vm.emailForm.from !== this.getStandardEmail(item));
                                            }
                                        }
                                        if (rType === 'replyAll' || rType === 'replyWithAttachment' || rType === 'replyAllWithoutOriginalText') {
                                            let isRecipients_to = false;
                                            /**
                                             *  原收件人列表中包含先发件人，即为回复自己的邮件
                                             *  isRecipients_to = true 的时候回复自己的邮件
                                             **/
                                            for (let i = 0; i < recipients_to.length; i++) {
                                                const item = recipients_to[i];
                                                if (this.emailForm.from && this.getStandardEmail(item) == this.emailForm.from) {
                                                    isRecipients_to = true;
                                                }
                                            }

                                            /**
                                             * 回复全部: data.recipients_to 返回所有的原收件人
                                             *  回复自己的邮件，收件人位置回填原发件人的基础上还需要回填除自己以外的所有收件人
                                             **/
                                            if (isRecipients_to) {
                                                /* 回复自己的邮件，需要在收件人回填列表去除当前写信页面的发件人 */
                                                let exceptedArr = recipients_to.filter(item => {
                                                    return vm.emailForm.from !== this.getStandardEmail(item);
                                                });
                                                /**
                                                 * data.accountId 邮件所属邮箱
                                                 * 如果原始邮件发件人不等于邮件的所属邮箱，则需要把邮件的所属邮箱从收件人中去除归属邮箱
                                                 */
                                                if (data.accountId !== this.getStandardEmail(data.from)) {
                                                    exceptedArr = exceptedArr.filter(item => {
                                                        return data.accountId !== this.getStandardEmail(item);
                                                    });
                                                }
                                                vm.emailForm.recipients_to.push(...exceptedArr);
                                            }
                                            /* 抄送人/密送人中直接去除邮件归属邮箱 */
                                            vm.original_recipients_cc = vm.original_recipients_cc.filter(item => {
                                                return this.emailForm.from !== this.getStandardEmail(item);
                                            });
                                            vm.original_recipients_bcc = vm.original_recipients_bcc.filter(item => {
                                                return this.emailForm.from !== this.getStandardEmail(item);
                                            });

                                            /**
                                             * 回复全部: data.recipients_to 返回所有的原收件人
                                             *  回复他人的邮件：
                                             *      当前邮件的发件人为第三方人员，肯定不会存在收件人中，所以直接在当前收件人中 push 原收件人即可
                                             *      不需要排除掉当前邮件的发件人以及邮件所属的邮箱
                                             *  抄送/密送人中也不需要去除掉邮件所属的邮箱
                                             **/
                                            if (!isRecipients_to) {
                                                vm.emailForm.recipients_to.push(...recipients_to);
                                            }
                                            this.updateRecipients();
                                        }
                                    } else if (data.fromOrToFlag === 1 || data.fromOrToFlag === 2) {
                                        /* 发件 */
                                        if (rType === 'replyAll' || rType === 'replyCurrent' || rType === 'replyWithAttachment' || rType === 'replywithoutOriginalText' || rType === 'replyAllWithoutOriginalText') {
                                            // 当前邮件的发件人等于原发件人，即为
                                            // 回复全部  ---- isRecipients_to = true 为回复自己的邮件，反之为回复他人邮件
                                            let isRecipients_to = false;
                                            const from = data.from;
                                            if (this.getStandardEmail(from) == this.emailForm.from) {
                                                isRecipients_to = true;
                                            }
                                            // （回复全部并且回复自己/回复）的发件需要把当前邮件的发件人在收件人列表中去除
                                            if (((rType === 'replyAll' || rType === 'replyWithAttachment' || rType === 'replyAllWithoutOriginalText') && isRecipients_to) || (rType === 'replyCurrent' || rType === 'replywithoutOriginalText')) {
                                                const exceptedArr = recipients_to.filter(item => {
                                                    return vm.emailForm.from !== this.getStandardEmail(item);
                                                });
                                                vm.emailForm.recipients_to.push(...exceptedArr);
                                            }
                                            // 回复全部并且回复他人的发件，直接 回填原发件人和原收件人
                                            if (!isRecipients_to && (rType === 'replyAll' || rType === 'replyWithAttachment' || rType === 'replyAllWithoutOriginalText')) {
                                                const exceptedArr = [...recipients_to, data.from];
                                                // 过滤下当前登陆人邮箱
                                                const exceptedArr0 = exceptedArr.filter(item => {
                                                    return vm.emailForm.from !== this.getStandardEmail(item);
                                                });
                                                vm.emailForm.recipients_to.push(...exceptedArr0);
                                            }
                                        }
                                    }
                                    if (!vm.contacts.includes(data.from)) {
                                        vm.contacts.push(data.from);
                                    }
                                }

                                /* -------------------------------------邮件内容的处理逻辑------------------------------------------------ */
                                /**
                                 * @Description: 需要把非草稿邮件的标识‘id=signature’去掉，以免影响回复/转发/再次编辑时的签名切换逻辑判断
                                 * @author 杨娣
                                 * @date 2020/7/7
                                 */
                                // 替换之前转发再转发引起的样式问题去掉之前的forwardPlaceholder、relayPlaceholder以及替换blockquote标签
                                if (vm.mailDraftFlag !== 1) {
                                    data.content = data.content.replace(/ id="signature"| id="forwardPlaceholder"| id="relayPlaceholder"/ig, '');
                                    data.content = data.content.replace(/blockquote/g, 'p');
                                }

                                /**
                                 * @Description: 1. plainText这个正则是判断邮件内容是否是html代码的。但其所用的方法是匹配其中所有的标签体，效率低
                                 *               内容一旦过长容易页面卡死。此处换用另一个正则表达式来判断。
                                 *               2. 邮件详情页的正文中超链接更改为新标签窗口打开
                                 * @author 杨娣
                                 * @date 2020/6/3
                                 */
                                // const plainText = new RegExp(/<[\s\S]*?>[\s\S]*?<\/[\s\S]*?>/);
                                const isHtml = RegExp.prototype.test.bind(/(<([^>]+)>)/i);
                                if (typeof (vm.content) === 'string' && !isHtml(vm.content)) {
                                    data.content = data.content.replace(/\n/g, '<br/>');
                                }
                                const relayContent = () => {
                                    vm.emailForm.originalMailId = id;
                                    data.content = `<div id="relayPlaceholder" style="${(rType === 'replywithoutOriginalText' || rType === 'replyAllWithoutOriginalText') && 'display:none;'}line-height: 32px;font-size:14px ;font-family: arial,helvetica,sans-serif;color:#333;">
                                        -------- Reply message --------<br>
                                        From: ${data.from}<br>
                                        Send Time: ${data.sendTime}<br>
                                        To: ${data.recipients_to[0] === '[' && data.recipients_to[data.recipients_to.length - 1] === ']' ? JSON.parse(data.recipients_to).join(',') : data.recipients_to}<br>
                                        ${data.recipients_cc[0] === '[' && data.recipients_cc[data.recipients_cc.length - 1] === ']' ? (!JSON.parse(data.recipients_cc).length ? '' : `Cc: ${JSON.parse(data.recipients_cc).join(',')}<br>`) : (data.recipients_cc ? `Cc: ${data.recipients_cc}<br>` : '')}
                                        Subject: ${data.subject}<br>
                                        <blockquote style='margin:0;border:none;padding:0;'>
                                        ${data.content}</blockquote></div>`;
                                };
                                switch (rType) {
                                    case 'replyCurrent':// 回复
                                        vm.emailForm.subject = `Re: ${data.subject}`;
                                        relayContent();
                                        vm.original_recipients_cc = [];
                                        vm.original_recipients_bcc = [];
                                        break;
                                    case 'replyAll':// 回复全部
                                        vm.emailForm.subject = `Re: ${data.subject}`;
                                        relayContent();
                                        break;
                                    case 'replyWithAttachment':// 回复全部带附件
                                        vm.emailForm.subject = `Re: ${data.subject}`;
                                        relayContent();
                                        break;
                                    case 'replywithoutOriginalText':// 回复不带原文
                                        vm.emailForm.subject = `Re: ${data.subject}`;
                                        relayContent();
                                        vm.original_recipients_cc = [];
                                        vm.original_recipients_bcc = [];
                                        break;
                                    case 'replyAllWithoutOriginalText': // 回复全部不带原文
                                        vm.emailForm.subject = `Re: ${data.subject}`;
                                        relayContent();
                                        break;
                                    case 'forward':// 转发
                                        vm.emailForm.subject = `Fw: ${data.subject}`;
                                        vm.emailForm.recipients_to = [];
                                        vm.original_recipients_cc = [];
                                        vm.original_recipients_bcc = [];
                                        data.content = `<div id="forwardPlaceholder" style="line-height: 32px;font-size:14px ;font-family: arial,helvetica,sans-serif;color:#333;">
                                            -------- Forwarded message --------<br>
                                            From: ${data.from}<br>
                                            Send Time: ${data.sendTime}<br>
                                            To: ${data.recipients_to[0] === '[' && data.recipients_to[data.recipients_to.length - 1] === ']' ? JSON.parse(data.recipients_to).join(',') : data.recipients_to}<br>
                                            ${data.recipients_cc[0] === '[' && data.recipients_cc[data.recipients_cc.length - 1] === ']' ? (!JSON.parse(data.recipients_cc).length ? '' : `Cc: ${JSON.parse(data.recipients_cc).join(',')}<br>`) : (data.recipients_cc ? `Cc: ${data.recipients_cc}<br>` : '')}
                                            Subject: ${data.subject}<br>
                                            <blockquote style='margin:0;border:none;padding:0;'>
                                            ${data.content}</blockquote></div>`;
                                        break;
                                    case 'reedit':// 重新编辑
                                        vm.emailForm.recipients_to = recipients_to;
                                        vm.emailForm.subject = data.subject;
                                        break;
                                    default:
                                        vm.emailForm.subject = data.subject;
                                }
                                // 抄密送人 数据 整合回填
                                if (type === 'draftBox') {
                                    vm.emailForm.recipients_cc = vm.original_recipients_cc;
                                    vm.emailForm.recipients_bcc = vm.original_recipients_bcc;
                                } else {
                                    vm.emailForm.recipients_cc = vm.original_recipients_cc.concat(this.defaultCc);
                                    vm.emailForm.recipients_bcc = vm.original_recipients_bcc.concat(this.defaultBcc);
                                }
                                // 抄密送原邮件和默认去重处理
                                for (let i = 0; i < vm.emailForm.recipients_cc.length; i++) {
                                    for (let j = i + 1; j < vm.emailForm.recipients_cc.length; j++) {
                                        if (this.getStandardEmail(vm.emailForm.recipients_cc[i]) === this.getStandardEmail(vm.emailForm.recipients_cc[j])) {
                                            vm.emailForm.recipients_cc.splice(j, 1);
                                            j--;
                                        }
                                    }
                                }
                                for (let i = 0; i < vm.emailForm.recipients_bcc.length; i++) {
                                    for (let j = i + 1; j < vm.emailForm.recipients_bcc.length; j++) {
                                        if (this.getStandardEmail(vm.emailForm.recipients_bcc[i]) === this.getStandardEmail(vm.emailForm.recipients_bcc[j])) {
                                            vm.emailForm.recipients_bcc.splice(j, 1);
                                            j--;
                                        }
                                    }
                                }

                                /* 查询所有收件人的跟进类型和关联联系人 */
                                vm.ccModel = Boolean(vm.emailForm.recipients_cc.length);
                                vm.bccModel = Boolean(vm.emailForm.recipients_bcc.length);
                                /** 在签名上方添加空白行，保证用户将光标放在空白行时，可以按照"写信默认设置"编辑 */
                                const findSIndex = data.content.indexOf('<div id="signature"');
                                if (findSIndex !== -1) {
                                    data.content = `${data.content.slice(0, findSIndex)}<div></div>${data.content.slice(findSIndex)}`;
                                }
                                vm.mailContent = data.content.replace(/<style(([\s\S])*?)<\/style>/g, '');
                                tinymce.activeEditor.resetContent(vm.mailContent);
                                if (type === 'draftBox' || ['replyWithAttachment', 'forward', 'reedit'].includes(rType)) {
                                    let fileList = data.mailAttachmentList;
                                    if (fileList) {
                                        fileList = fileList.map(item => {
                                            let hash;
                                            if (item.filePath.indexOf('p0zwqtqw9.bkt.clouddn.com') !== -1) {
                                                hash = item.filePath.split('//p0zwqtqw9.bkt.clouddn.com/')[1];
                                            } else {
                                                hash = item.filePath.split(`//${this.qiniuUrl}/`)[1];
                                            }
                                            return {
                                                name: item.fileName,
                                                percentage: 100,
                                                response: {
                                                    hash: hash,
                                                    key: hash
                                                },
                                                showProgress: false,
                                                size: this.sizeConversion(item.fileSize),
                                                status: 'finished',
                                                uid: item.id
                                            };
                                        });
                                        vm.defaultFileList = fileList;
                                        let fileTotalSize = 0;
                                        vm.defaultFileList.forEach(item => {
                                            fileTotalSize += this.$refs.filesUpload.getSizeNumber(item.size);
                                        });
                                        if (fileTotalSize >= this.max_size * 1024) {
                                            this.$Message.warning(`${this.$t('mail.uploadFilesOversizeTip')}${this.max_size / 1024}M`);
                                        }
                                    }
                                }
                            } else {
                                vm.$Message.error(vm.$t('mail.writeLetter.mailErrorTip'));
                            }
                        }).catch(() => {
                            vm.$Message.warning({
                                duration: 3000,
                                message: this.$t('mail.getFailAndRetryLater')
                            });
                        });
                    }
                } else {
                    vm.is_show = false;
                    let sendMailContents = localStorage.getItem('leadsCloud-sendMail-contents');
                    if (sendMailContents) {
                        this.$store.commit('setReplyMailType', 'replyFormMessage');
                        localStorage.removeItem('leadsCloud-sendMail-contents');
                        sendMailContents = JSON.parse(sendMailContents);
                        const fields = Object.values(sendMailContents.fields);
                        const textList = [];
                        fields.forEach(({ type, label, value }) => {
                            // 字段名全翻译
                            textList.push(label);
                        });
                        // 获取多语言包
                        this.$commonApi.getConfigOrBrowserLanguageForList({
                            orgId: this.enterpriseId,
                            websiteLanguageParam: '',
                            browserLangageParam: 'en',
                            textList
                        }).then(response => {
                            // 处理多语言包为对象, 方便取值
                            if (response.code === '1' && response.data && Array.isArray(response.data.languagePack)) {
                                const langObj = {};
                                response.data.languagePack.forEach(({ zh_cn, en }) => {
                                    if (zh_cn) {
                                        langObj[zh_cn] = en;
                                    }
                                });
                                let fieldsNode = '';
                                fields.forEach(item => {
                                    fieldsNode += `<p style="margin:0;padding-left:15px;line-height:24px;">${langObj[item.label] || item.label}: ${item.value}</p>`;
                                });
                                const mailContent = `<div><br/></div><div><br/></div><div><br/></div><div id="relayPlaceholder" style="line-height: 32px;font-size:14px ;font-family: arial,helvetica,sans-serif;color:#333;">
                                        -------- Reply message --------<br>
                                        <p style="margin:0;padding-left:15px;line-height:24px;">Time: ${this.dateFormat('yyyy-MM-dd hh:mm:ss', sendMailContents.createTime)}</p>
                                        <p style="margin:0;padding-left:15px;line-height:24px;">Message page: ${sendMailContents.currentUrl}</p>
                                        ${fieldsNode}
                                        </div>`;
                                tinymce.activeEditor.resetContent(mailContent);
                                this.getMailSignsGeneralSetting();
                            }
                        });
                    } else {
                        this.getMailSignsGeneralSetting();
                    }
                }
                const copyAttachment = localStorage.getItem('copyAttachment');
                if (copyAttachment) {
                    this.showCopyAttachmentNotice();
                }
            },
            showCopyAttachmentNotice() {
                if (this.copyAttachmentNotice) return;
                const h = this.$createElement;
                // 弹出"粘贴"提示
                this.copyAttachmentNotice = this.$Notice({
                    type: '',
                    customClass: 'copyAttachment',
                    dangerouslyUseHTMLString: true,
                    title: this.$t('mail.copyAttachmentTitle'),
                    message: h('div', null, [
                        h('p', {
                            class: 'copyAttachmentText'
                        }, this.$t('mail.copyAttachmentModelText')),
                        h('div', {
                            class: 'copyAttachmentBtns'
                        }, [
                            h('span', {
                                on: {
                                    click: this.removeCopyAttachment
                                }
                            }, this.$t('filter_box.empty')),
                            h('span', {
                                class: 'copyAttachmentBtn',
                                on: {
                                    click: this.setCopyAttachment
                                }
                            }, this.$t('mail.paste'))
                        ])
                    ]),
                    duration: 0,
                    onClose: () => {
                        this.copyAttachmentNotice = null;
                    }
                });
            },
            setCopyAttachment() {
                const attachmentList = JSON.parse(localStorage.getItem('copyAttachment'));
                if (attachmentList) {
                    let fileTotalSize = 0;
                    attachmentList.forEach(item => {
                        fileTotalSize += this.$refs.filesUpload.getSizeNumber(item.fileSize);
                    });
                    if (this.$refs.filesUpload.fileSize + fileTotalSize >= this.max_size * 1024) {
                        this.$Message.warning(`${this.$t('mail.uploadFilesOversizeTip')}${this.max_size / 1024}M`);
                        return;
                    }
                    const fileList = [];
                    attachmentList.forEach((item, index) => {
                        let hash;
                        if (item.filePath.indexOf('p0zwqtqw9.bkt.clouddn.com') !== -1) {
                            hash = item.filePath.split('//p0zwqtqw9.bkt.clouddn.com/')[1];
                        } else {
                            hash = item.filePath.split(`//${this.qiniuUrl}/`)[1];
                        }
                        const file = {
                            name: item.fileName,
                            percentage: 100,
                            response: {
                                hash: hash,
                                key: hash
                            },
                            showProgress: false,
                            size: this.sizeConversion(item.fileSize),
                            status: 'finished',
                            uid: Date.now() + index
                        };
                        fileList.push(file);
                    });
                    this.$refs.filesUpload.fileList = this.$refs.filesUpload.fileList.concat(fileList);
                    this.removeCopyAttachment();
                } else {
                    this.$Message.warning(this.$t('mail.copyAttachmentEmpty'));
                    this.removeCopyAttachment();
                }
            },
            removeCopyAttachment() {
                localStorage.removeItem('copyAttachment');
                this.copyAttachmentNotice.close();
                this.copyAttachmentNotice = null;
            },
            // 获取邮件eml
            getMailEml() {
                mailCommon.downloadMailEml({
                    userId: this.userId,
                    orgId: this.enterpriseId,
                    mailId: this.mailId,
                    createUserId: this.createUserId
                }).then(response => {
                    if (response.code === 1 && response.data) {
                        let fileList = [response.data];
                        fileList = fileList.map((item, index) => {
                            let hash;
                            if (item.filePath.indexOf('p0zwqtqw9.bkt.clouddn.com') !== -1) {
                                hash = item.filePath.split('//p0zwqtqw9.bkt.clouddn.com/')[1];
                            } else {
                                hash = item.filePath.split(`//${this.qiniuUrl}/`)[1];
                            }
                            return {
                                name: item.fileName,
                                percentage: 100,
                                response: {
                                    hash: hash,
                                    key: hash
                                },
                                showProgress: false,
                                size: this.sizeConversion(item.fileSize),
                                status: 'finished',
                                uid: parseInt(`${this.userId}${index}${Date.now()}`)
                            };
                        });
                        this.defaultFileList = fileList;
                        let fileTotalSize = 0;
                        this.defaultFileList.forEach(item => {
                            fileTotalSize += this.$refs.filesUpload.getSizeNumber(item.size);
                        });
                        if (fileTotalSize >= this.max_size * 1024) {
                            this.$Message.warning(`${this.$t('mail.uploadFilesOversizeTip')}${this.max_size / 1024}M`);
                        }
                    }
                    this.is_show = false;
                });
            },
            /* 新窗口写信 */
            openNewTab() {
                // 如果前往新窗口写信的时候是新建邮件，则清空相关cookie
                /**
                 * @Description: 通过转发/回复等方式进入写信页面，点击新窗口写信，新打开的窗口都是当作一封新建邮件处理.
                 *              所以此处只要是打开新窗口写信,相关cookie都清空.
                 * @author 杨娣
                 * @date 2020/4/1
                 */
                // if (this.whereToWrite === 'new') {
                Cookies.remove('selectedMailId');
                Cookies.remove('selectedMailBoxType');
                Cookies.remove('replyMailType');
                Cookies.set('mailEdit', false);
                // }
                window.open('#/writeMail', '_blank');
            },
            /* 发件人控制 */
            handleSender(i) {
                this.emailForm.from = i;
                this.senders.forEach((item, index) => {
                    if (item.emailAddress === i) {
                        this.senderIndex = index;
                        this.accountId = item.id;
                        const fileList = this.$refs.filesUpload.fileList;
                        if (fileList && fileList.length) {
                            let fileTotalSize = 0;
                            fileList.forEach(item => {
                                fileTotalSize += this.$refs.filesUpload.getSizeNumber(item.size);
                            });
                            if (fileTotalSize >= this.max_size * 1024) {
                                this.$Message.warning(`${this.$t('mail.uploadFilesOversizeTip')}${this.max_size / 1024}M`);
                            }
                        }
                    }

                    // 新建邮件 切换更新抄密送人逻辑  有默认替换更新，没有设置不管
                    if (!this.replyMailType && item.emailAddress === i && (item.defaultCc || item.defaultBcc)) {
                        this.defaultCc = item.defaultCc.length ? JSON.parse(item.defaultCc) : [];
                        this.defaultBcc = item.defaultBcc.length ? JSON.parse(item.defaultBcc) : [];
                        // 新建 回填默认设置抄密送人
                        this.emailForm.recipients_cc = this.defaultCc;
                        this.emailForm.recipients_bcc = this.defaultBcc;
                        // 抄密送框是否显示
                        this.ccModel = Boolean(this.emailForm.recipients_cc.length);
                        this.bccModel = Boolean(this.emailForm.recipients_bcc.length);
                    }
                });
                // 切换发件人回填对应默认签名
                this.defaultSignBackfill(this.mailSignAccountList);
            },
            /* ---------------------------邮件签名相关------------------------------------------------ */
            /* 通过用户ID获取签名列表 并 初始化签名  */
            getMailSignsGeneralSetting(signId = '-1') {
                writeApi.getMailSignsGeneralSetting({
                    orgId: this.enterpriseId,
                    createUserId: this.userId
                }).then(response => {
                    if (response.code === 1) {
                        // 处理签名列表
                        this.signatures = response.data.mailSigns || [];
                        this.signatures.unshift({
                            id: '-1',
                            signName: this.$t('mail.writeLetter.withoutSignature'),
                            signContent: ''
                        });


                        // 获取账号对应的签名默认数据
                        this.mailSignAccountList = response.data.mailSignAccountList;

                        // 初始化签名
                        this.defaultSignBackfill(response.data.mailSignAccountList, signId);

                        // 初始化签名
                        const d = response.data.generalSetting;
                        this.emailForm.mailIsTrace = Boolean(d.selectedMailTraceFlag);
                        this.emailForm.receipt_flag = Boolean(d.selectedMailReceiptFlag);
                    } else {
                        this.$Message.error(this.$t('mail.writeLetter.signatureErrorTip'));
                    }
                });
                this.$store.commit('setMailEdit', false);
            },
            /**
             * 签名的回填逻辑
             * 1、新邮件/回复/转发优先回填默认签名
             * 2、草稿箱编辑优先回填保存的签名，切换发件账号之后不再记录保存的签名统一回填默认邮箱
            */
            defaultSignBackfill(signList, signId = '-1') {
                const rType = this.replyMailType;
                const type = this.selectedMailBoxType;
                const mailEdit = this.mailEdit;
                signList.forEach((item) => {
                    if (item.emailAddress === this.emailForm.from) {
                        this.signatureIds = [item.newMailSignId, item.replyMailSignId, item.relayMailSignId];
                        if (['replyCurrent', 'replyAll','replywithoutOriginalText', 'replyAllWithoutOriginalText', 'replyWithAttachment'].includes(rType)) {
                            this.signatureId = item.replyMailSignId;
                        } else if (['forwardAsAttachment', 'forward'].includes(rType)) {
                            this.signatureId = item.relayMailSignId;
                        } else if (type === 'draftBox' && mailEdit) {
                            this.signatureId = signId;
                        } else if (rType === 'reedit') {
                            this.signatureId = '-1';
                        } else {
                            this.signatureId = item.newMailSignId;
                        }
                    }
                });

                this.signatures.forEach((item, index) => {
                    if (Number(item.id) === Number(this.signatureId)) {
                        this.emailForm.mailSignIndex = index;
                    }
                });
                this.handleSignChange(this.emailForm.mailSignIndex);
            },
            /* 签名切换控制 */
            handleSignChange(index) {
                /**
                 * @Description: 解决当写信页面初始显示为不使用签名的情况下，切换签名不生效的问题
                 * @author 杨娣
                 * @date 2020/6/15
                 */
                let content = tinymce.activeEditor.getContent();
                // const type = this.selectedMailBoxType;
                const rType = this.replyMailType;
                let signatureNew = '';
                let signature = '';// 切换签名之前获取 id='signature' 的元素
                const currDoc = tinymce.activeEditor.iframeElement.contentDocument;
                let currSignNode = currDoc.getElementById('signature');
                if (!currSignNode) {
                    currSignNode = currDoc.getElementById('signatureNew');
                }
                let node_innerHTML = '';
                // 判断当前 id='signature' 的元素内存放的是不是签名内容
                let isSignatureId = false;
                this.signatures.forEach((item, index) => {
                    if (Number(item.id) === Number(this.signatureId)) {
                        isSignatureId = true;
                    }
                });
                // 创建一个新的元素存放之前放在 id='signature' 的元素里边的非签名内容，后边需要单独加到签名内容之前
                if (!isSignatureId && currSignNode && currSignNode.innerHTML && currSignNode.innerHTML.trim().length) {
                    node_innerHTML = document.createElement('div'); ;
                    node_innerHTML.innerHTML = currSignNode.innerHTML.trim();
                }
                this.signatureId = this.signatures[index].id;
                // 添加style目的：避免全局默认字体/字号/颜色设置覆盖签名样式
                if (this.signatures[index].id === '-1') {
                    signatureNew = `<div id="signature" style="clear:both;">${this.signatures[index].signContent}</div>`;
                    signature = `<div id="signature" style="clear:both;">${this.signatures[index].signContent}</div>`;
                } else {
                    signatureNew = `<div id="signature" style="clear:both;">${
                        this.signatures[index].signContent
                    }</div>`;
                    signature = `<div id="signature" style="clear:both;">${
                        this.signatures[index].signContent
                    }</div>`;
                }
                this.signatureNew = signatureNew;
                this.signature = signature;
                if (this.signChangeCount === 0) {
                    if (currSignNode && this.fromOrToFlag) {
                        // 将 id='signature' 的元素内的所有内容单独插入到 id='signature' 元素前边存放，才会保证插入签名之后，非签名内容不会清空
                        if (node_innerHTML !== '') {
                            currSignNode.parentElement.insertBefore(node_innerHTML, currSignNode);
                        }
                        if (this.signatures[index].id === '-1') {
                            currSignNode.innerHTML = '';
                        } else {
                            currSignNode.innerHTML = `${this.signatures[index].signContent}`;
                        }
                    } else {
                        // reedit 为再次编辑
                        if (!rType) {
                            content = `${content}<div><br></div><div><br></div>${this.signature}`;
                        } else if (rType === 'reedit') {
                            content = `${content}${this.signatureNew}`;
                        } else {
                            content = `<div><br></div><div><br></div>${this.signatureNew}${content}`;
                        }
                        tinymce.activeEditor.resetContent(`<div style="font-family:${this.defaultMailSetting.fontFamilyValue};font-size:${this.defaultMailSetting.fontSizeValue};color:${this.defaultMailSetting.fontColorValue};">${content}</div>`);
                    }
                    this.signChangeCount = this.signChangeCount + 1;
                } else {
                    if (currSignNode) {
                        // 将 id='signature' 的元素内的所有内容单独插入到 id='signature' 元素前边存放，才会保证插入签名之后，非签名内容不会清空
                        if (node_innerHTML !== '') {
                            currSignNode.parentElement.insertBefore(node_innerHTML, currSignNode);
                        }
                        if (this.signatures[index].id === '-1') {
                            currSignNode.innerHTML = '';
                        } else {
                            currSignNode.innerHTML = `${this.signatures[index].signContent}`;
                        }
                    } else {
                        // reedit 为再次编辑
                        if (!rType) {
                            content = `${content}<div><br></div><div><br></div>${this.signature}`;
                        } else if (rType === 'reedit') {
                            content = `${content}${this.signatureNew}`;
                        } else {
                            content = `<div><br></div><div><br></div>${this.signatureNew}${content}`;
                        }
                        tinymce.activeEditor.resetContent(`<div style="font-family:${this.defaultMailSetting.fontFamilyValue};font-size:${this.defaultMailSetting.fontSizeValue};color:${this.defaultMailSetting.fontColorValue};">${content}</div>`);
                    }
                    this.signChangeCount = this.signChangeCount + 1;
                }
                // 切换签名时触发编辑器的获取焦点的方法，获取最新的正文不能为空的提示
                tinymce.editors[0].editorManager.get('vModalEditor').focus();
                this.mailContent = tinymce.activeEditor.getContent();
            },
            /* ---------------------------邮件快速文本相关------------------------------------------------ */
            /* 通过用户ID获取快速文本列表 */
            getTextsByUserId() {
                util.ajaxMailJson({
                    url: `/mail/quickTexts/${this.userId}`,
                    method: 'get'
                }).then(response => {
                    if (response.data.code === 1) {
                        const flag = response.data.data.length === 0;
                        this.fastTextShowLag = !flag;
                    } else {
                        this.$Message.error(this.$t('mail.writeLetter.quickTextErrorTip'));
                    }
                });
            },
            /** 关闭快速文本列表 */
            closeFastText() {
                this.textModel = false;
                this.fastTextSearch = '';
                this.textCurrentPage = 0;
            },
            // 点击快速文本按钮
            quickTextClick() {
                // 关闭翻译行
                this.translateModel = false;
                this.textModel = true;
                this.cursorType = 'editor';
                this.searchFastTextList();
                this.$emit('modalFullScreen', true);
                this.$nextTick(() => {
                    this.linkmanListWidth = document.querySelector('.linkman-list') ? document.querySelector('.linkman-list').offsetWidth : 0;
                });
            },
            /** 点击加载更多 */
            quickTextLoadMore() {
                this.textCurrentPage += 1;
                this.getDataByQuickContent();
            },
            /** 跳转至邮箱设置-->快速文本 */
            toFastTextSet() {
                localStorage.setItem('updateAccountToQuickText', 'QuickText');
                window.open(this.$rootRouter.resolve('/systemSettings/mail_set').href, '_blank');
            },
            /** 搜索快速文本 */
            searchFastTextList() {
                this.textCurrentPage = 0;
                this.getDataByQuickContent();
            },
            /** 调用快速文本查询接口 */
            getDataByQuickContent() {
                util.ajaxMail({
                    url: '/mail/quickTextsFind/findByQuickContent',
                    method: 'get',
                    params: {
                        userId: this.userId,
                        content: this.fastTextSearch,
                        page: this.textCurrentPage,
                        size: this.fastTextPageSize
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        this.textTotalNumber = res.data.data.totalElements;
                        if (this.textCurrentPage !== 0) {
                            this.quickTexts = this.quickTexts.concat(res.data.data.content);
                        } else {
                            this.quickTexts = res.data.data.content;
                        }
                        this.fastTextShowLag = !(this.textTotalNumber === 0);
                    } else {
                        this.$Message.error(this.$t('mail.writeLetter.quickTextErrorTip'));
                    }
                });
            },
            /** 获取主题光标位置 */
            handleInputBlur(e) {
                this.inputSelectStartIndex = e.target.selectionStart;
                this.inputSelectEndIndex = e.target.selectionEnd;
                // 主题长度限制
                if (this.emailForm.subject.length > 500) {
                    return this.$Message.error(this.$t('mail.writeLetter.subjectLimit'));
                }
            },
            /** 插入快速文本 */
            handleQuickText(quickText, index) {
                if (this.cursorType === 'person') {
                    this.$Message.warning({
                        message: this.$t('mailSetting.fastText.testTypeTip'),
                        duration: 3000
                    });
                } else if (this.cursorType === 'subject') {
                    let subjectTest = document.getElementsByClassName('overTwoLine')[index].innerText;
                    subjectTest = subjectTest.replace(/\n/g, '');
                    /** 将鼠标选中部分替换为快速文本 */
                    if (this.inputSelectStartIndex > this.inputSelectEndIndex || this.inputSelectStartIndex === this.inputSelectEndIndex) {
                        this.emailForm.subject = (this.emailForm.subject.substring(0, this.inputSelectEndIndex) + subjectTest + this.emailForm.subject.substring(this.inputSelectStartIndex)).slice(0, 200);
                    } else {
                        this.emailForm.subject = (this.emailForm.subject.substring(0, this.inputSelectStartIndex) + subjectTest + this.emailForm.subject.substring(this.inputSelectEndIndex)).slice(0, 200);
                    }
                    if (this.emailForm.subject.length === 200) {
                        this.$Message.warning({
                            message: this.$t('mailSetting.fastText.testOverLimitTip'),
                            duration: 3000
                        });
                    }
                } else {
                    let quickTextStr = '';
                    if (quickText.indexOf('style="pointer-events: none;"') !== -1) {
                        quickTextStr = quickText.replace('style="pointer-events: none;"', '');
                    } else {
                        quickTextStr = quickText;
                    }
                    /** 处理快速文本默认样式 */
                    tinymce.execCommand('mceInsertContent', false, quickTextStr);
                }
                this.cursorType = 'editor';
            },
            /* ---------------------------群发单显邮件相关------------------------------------------------ */
            /** 判断是否启用群发单显 */
            handleSeparate() {
                this.cursorType = 'editor';
                // 点击切换是否群发单显，在群发单显的情况下，input中的placeholder出现提示语 1 --- 群发单显 ， 0 ---取消群发单显
                if (this.isSeparate === 0) {
                    this.placeholder = this.$t('mail.separateTip');
                    this.isSeparate = 1;
                    /**
                     * @Description: 群发单显邮件支持手动输入，此处注释相关代码
                     * @author 杨娣
                     * @date 2020/10/21
                     */
                    // this.readonly = true;
                    const temp = this.emailForm.recipients_to.slice(0, 31);
                    this.emailForm.recipients_to = temp;
                    this.emailForm.recipients_bcc = [];
                    this.emailForm.recipients_cc = [];
                    this.$refs.filesUpload.fileList = [];
                    // 【ID1002915】根据目前产品逻辑，群发单显暂不支持定时邮件，因此在点击群发单显按钮时 定时邮件的flag将置为false,并隐藏单选框
                    this.isShowOnSeparate = false;
                } else {
                    this.placeholder = this.$t('mail.writeLetter.bulkCopyHolder');
                    this.isSeparate = 0;
                    this.readonly = false;
                    this.isShowOnSeparate = true;
                }
            },
            /** 群发单显，主题/正文插入变量----在光标位置插入内容 */
            insertVariable(str) {
                const character = `{"${str}"}`;
                if (this.cursorType === 'person') {
                    this.$Message.warning({
                        message: '只能在正文/主题添加变量！',
                        duration: 3000
                    });
                } else if (this.cursorType === 'subject') {
                    /** 将鼠标选中部分替换为变量 */
                    if (this.inputSelectStartIndex > this.inputSelectEndIndex || this.inputSelectStartIndex === this.inputSelectEndIndex) {
                        this.emailForm.subject = (this.emailForm.subject.substring(0, this.inputSelectEndIndex) + character + this.emailForm.subject.substring(this.inputSelectStartIndex)).slice(0, 200);
                    } else {
                        this.emailForm.subject = (this.emailForm.subject.substring(0, this.inputSelectStartIndex) + character + this.emailForm.subject.substring(this.inputSelectEndIndex)).slice(0, 200);
                    }
                    if (this.emailForm.subject.length === 200) {
                        this.$Message.warning({
                            message: this.$t('mailSetting.fastText.testOverLimitTip'),
                            duration: 3000
                        });
                    }
                } else {
                    /** 处理默认样式 */
                    tinymce.execCommand('mceInsertContent', false, `<span>${character}</span>`);
                }
                this.cursorType = 'editor';
            },
            handleUpdateRecipients(email) {
                let emails = [];
                if (Array.isArray(email)) {
                    for (let i = 0; i < email.length; i++) {
                        emails.push(this.getStandardEmail(email[i]))
                    }
                } else {
                    emails.push(this.getStandardEmail(email));
                }
                for (let i = 0; i < this.variables.length; i++) {
                    let item = this.variables[i];
                    if (emails.includes(item)) {
                        this.variables.splice(i, 1);
                        i--;
                    }
                }
            },
            /* ---------------------------邮件标签相关------------------------------------------------ */
            /** 获取所有的标签列表 并更新 */
            getTags(id) {
                util.ajaxMail({
                    url: '/mail/maillabel/all',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        createUserId: this.userId
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        this.$store.commit('setMailTagList', res.data.data || []);
                        if (id) {
                            this.$nextTick(() => {
                                this.operateTag(id, 1);
                            });
                        }
                    }
                });
            },
            /** 给邮件增加删除标签 ,参数1增加/删除的标签id;参数2增加1删除0 */
            operateTag(label, type) {
                if (label === 'addtag') {
                    this.addModal = true;
                    return;
                }
                const temp = this.tagList.find(item => item.id === label);
                const flag = this.writeMailTags.some(item => item.id === label);
                if (!flag) {
                    this.writeMailTags.push(temp);
                    this.mailLabelIds.push(label);
                    this.$Message.success(this.$t('mail.setMailLabelSuccess'));
                }
            },
            /* 删除邮件标签 */
            handleTagClose(tag) {
                const index = this.writeMailTags.indexOf(tag);
                const labelIndex = this.mailLabelIds.indexOf(tag.id);
                this.mailLabelIds.splice(labelIndex, 1);
                this.writeMailTags.splice(index, 1);
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
                    orgId: this.enterpriseId
                };
                util.ajaxMailJson({
                    url: '/mail/maillabel/add',
                    method: 'post',
                    data: jsonData
                }).then(res => {
                    if (res.data.code === 1) {
                        this.tagName = '';
                        this.addModal = false;
                        this.$Message.success(this.$t('mail.addTagsSuccess'));
                        this.getTags(res.data.data.id);
                    } else {
                        this.$Message.error(res.data.msg);
                    }
                });
            },
            /** 邮件保存草稿时，确认是否去除已添加标签的确认弹窗中，点击确定去除所有添加的标签 */
            handelSaveDraftTag() {
                this.writeMailTags = [];
                this.mailLabelIds = [];
                this.handleSaveEmail(1, false);
                this.saveDraftTagModal = false;
            },
            /** 邮件保存草稿时，确认是否去除已添加标签的确认弹窗中，点击取消，关闭该弹窗 */
            handleSaveDraftCancel() {
                this.draftLoading = false;
                this.saveDraftTagModal = false;
                // this.$emit('saveDraftTagsCancel', false);
                // this.$emit('handleIsSaveDraft', false);
            },
            /* ---------------------------定时邮件相关------------------------------------------------ */
            /* 定时邮件修改发送时间 */
            handleUpdateTime() {
                this.updateSendTimeFlag = true;
                this.set_timeout_modal = true;
                this.lastSetTimeForm.local_time = this.set_time_form.local_time;
                this.lastSetTimeForm.time_difference = this.set_time_form.time_difference;
            },
            // 取消定时
            handleCancelTime() {
                this.isShowOnSeparate = false;
                this.set_time_flag = false;
            },
            /* 定时邮件取消修改发送时间 */
            handleCancelUpdate() {
                this.set_time_flag = Boolean(this.updateSendTimeFlag);
                if (this.updateSendTimeFlag) {
                    this.set_time_form.local_time = this.lastSetTimeForm.local_time;
                    this.set_time_form.time_difference = this.lastSetTimeForm.time_difference;
                }
                this.set_timeout_modal = false;
                if (!this.email_id) {
                    this.updateSendTimeFlag = false;
                } else {
                    const time = this.lastSetTimeForm.local_time.getTime() + this.lastSetTimeForm.time_difference * 60000;
                    this.bjTime = this.dateFormat('yyyy-MM-dd hh:mm:ss', time);
                }
            },
            /* 定时邮件--当地时间转换为北京时间后，与当前北京时间是否相差半小时的校验 */
            check_local_time(rule, value, callback) {
                const flag = (new Date(this.bj_time_flag).getTime() - new Date().getTime()) > 1800000;
                this.local_time_flag = !flag;
            },
            /* 定时邮件设置弹窗打开的回调 */
            handle_modal_open() {
                if (!this.set_time_flag || !this.set_time_form.local_time) {
                    this.updateSendTimeFlag = false;
                    this.set_timeout_modal = true;
                    this.local_time_flag = false;
                }
            },
            /* ---------------------------邮件附件相关------------------------------------------------ */
            /* 获取附件列表 */
            getUploadFilesList(fileList) {
                if (this.isFirstUpload && fileList.length) {
                    this.isFirstUpload = false;
                    this.showSubjectInput = false;
                    const subject = this.emailForm.subject;
                    const index = fileList[0].name.lastIndexOf('.');
                    let fileName = '';
                    if (index !== -1) {
                        fileName = fileList[0].name.substring(index, 0);
                    } else {
                        fileName = fileList[0].name;
                    }
                    this.$nextTick(() => {
                        if (!subject.trim()) {
                            this.emailForm.subject = subject.trim() + fileName;
                        }
                        this.showSubjectInput = true;
                    });
                }
            },
            /* 附件预览 */
            handlePreviewAtta(data) {
                const filePath = `${this.qiniuHttp}${data.isDataBaseFile ? data.uid : data.response.key}`;
                let type = data.name.slice(data.name.lastIndexOf('.'));
                type = type.toLowerCase();
                if (type === '.jpg' || type === '.jpeg' || type === '.png' || type === '.gif') {
                    window.open(`${filePath}?imageView2/0`);
                } else if (['.mp4', '.webm', '.pdf', '.txt'].includes(type)) {
                    window.open(filePath);
                } else if (type === '.xls' || type === '.xlsx' || type === '.doc' || type === '.docx' || type === '.ppt' || type === '.pptx') {
                    window.open(`http://view.officeapps.live.com/op/view.aspx?src=${filePath}`);
                } else {
                    this.$Message.info(this.$t('mail.previewErrorTip'));
                }
            },
            // 拖拽处理
            enter_drag(e) {
                e.preventDefault();
                e.stopPropagation();
                this.dragOver = e.target.className === 'mail-upload-placeholder-text' ||
                    e.target.className === 'el-form-item__content' ||
                    e.target.className === 'mail-upload-placeholder' ||
                    e.target.className === 'mail-upload-placeholder-container' ||
                    e.target.className === 'el-card__body' ||
                    e.target.className === 'mail-upload-placeholder-span' ||
                    e.target.className === 'el-upload-dragger is-dragover' ||
                    e.target.className === 'el-upload-dragger' ||
                    !(e.target.className);
                this.uploadImages = false;
                this.uploadAttachment = false;
            },
            enter_drag_iframe(e) {
                e.preventDefault();
                e.stopPropagation();
                this.dragOver = true;
                this.uploadImages = false;
                this.uploadAttachment = false;
            },
            /** 上传的附件超过大小限制 */
            handleSizeOverflow() {
                this.$Message.error(this.isSeparate ? this.$t('mail.writeLetter.separateAttachmentTip') : this.$t('mail.writeLetter.attachmentMaxTip'));
            },
            /* ---------------------------邮件写信相关------------------------------------------------ */
            /* 插入图片至编辑器 */
            insertImage(res) {
                const src = this.qiniuHttp + res.key;
                tinymce.execCommand('mceInsertContent', false, `<img src=${src}>`);
            },
            /* 初始化编辑器 */
            initEditor() {
                const vm = this;
                tinymce.init({
                    selector: '#vModalEditor',
                    theme: 'silver',
                    language_url: `${process.env.BASE_URL}tinymce/langs/zh_CN.js`,
                    skin_url: `${process.env.BASE_URL}tinymce/skins/ui/oxide`,
                    placeholder: vm.$t('aiToolBar.placeholder'),
                    skin: 'oxide',
                    browser_spellcheck: true, // 拼写检查
                    branding: false, // 去水印
                    valid_children: '+div[style]', // 保留style标签不被编辑器过滤
                    elementpath: false, // 禁用编辑器底部的状态栏
                    // statusbar: false,  //隐藏编辑器底部的状态栏
                    paste_data_images: true, // 允许粘贴图像
                    paste_enable_default_filters: false, // paste插件 禁用TinyMCE的默认粘贴过滤器。
                    paste_webkit_styles: 'all', // 指定在WebKit中粘贴时要保留的样式
                    height: vm.writeType === 'theSameTab' ? document.body.offsetHeight - 400 : document.body.offsetHeight - 480,
                    language: vm.$t('mail.editor_lauguage'),
                    plugins: 'undo redo fullscreen autolink lists link image charmap print hr anchor imagetools media nonbreaking directionality textpattern formatpainter table hr code emoticons placeholder',
                    nonbreaking_force_tab: true, // 编辑器插入制表符
                    contextmenu: false, // 禁用编辑器上下文菜单
                    menubar: false,
                    table_default_styles: {
                        'border-collapse': 'collapse',
                        width: '100%'
                    },
                    table_advtab: false,
                    table_cell_advtab: false,
                    toolbar: [
                        'undo redo formatpainter | fontselect fontsizeselect | forecolor backcolor bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent lineheight | insertImageBtn link table emoticons hr | fullscreen code removeformat'
                    ],
                    powerpaste_word_import: 'merge',
                    powerpaste_html_import: 'merge',
                    powerpaste_allow_local_images: true,
                    // 添加扩展插件
                    external_plugins: {
                        powerpaste: `${process.env.BASE_URL}tinymce/powerpaste/plugin.min.js`,
                        formatpainter: `${process.env.BASE_URL}tinymce/formatpainter/plugin.min.js`
                    },
                    toolbar_mode: 'floating',
                    emoticons_database_url: 'emojis.js',
                    font_formats: '黑体="黑体";宋体="宋体";微软雅黑="微软雅黑";楷体="楷体";Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Calibri=calibri;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats',
                    fontsize_formats: '12px 14px 16px 18px 24px 36px 48px', // 字号选项
                    autosave_interval: '20s',
                    /**
                     * @Description: 此样式会以 style 标签插入到 head 中, 而发送邮件时用的是 body 内容, 不包括此内容, 因此可能导致邮件详情页邮件内容显示错位
                     * 例: 图片右对齐时, 相邻文字被富文本编辑器产生的空行挤到下方, 但是如果没有 line-height: 1.5 , 空行行高不够, 图片和文字错位
                     * 解决: 将影响布局的样式存入 vuex tinymce_contentStyle , 发邮件之前先把这条样式加上去, 历史数据也尽量做下处理
                     * 因此要注意!!!!!!!!!!!!!!!!!!!!!!!如果以后修改了这条样式, 一定要同步修改 tinymce_contentStyle , 以及注意历史数据
                     * @author 汤一飞
                     * @date 2021/6/2
                     */
                    content_style: `
                        div { line-height:1.5; margin: 0;word-break: break-word!important;} body { margin: 2rem; } pre{ white-space: pre-wrap; } p{ margin: 0;}
                    `,
                    forced_root_block: 'div', /* 参数 将非块元素或文本节点都包含在设置的元素中 回车 其他邮件中用的大部分是div包裹元素 */
                    visual: false,
                    images_upload_handler: function(blobInfo, success, failure) {
                        const config = {
                            useCdnDomain: true,
                            region: qiniu.region.z0
                        };
                        const observer = {
                            error(err) {
                                console.log(err);
                            },
                            complete(res) {
                                success(vm.qiniuHttp + res.key);
                            }
                        };
                        const putExtra = {
                            fname: '',
                            params: {}
                        };
                        const uid = Date.now() + blobInfo.name();
                        util.oldAjax({
                            url: '/file-sys/api/uptoken',
                            method: 'post'
                        }).then(response => {
                            vm.uptoken = response.data.uptoken;
                            vm.action =
                                `//upload.qiniup.com?token=${response.data.uptoken}`;

                            const observable = qiniu.upload(blobInfo.blob(), uid, vm.uptoken, putExtra, config);
                            const subscription = observable.subscribe(observer);
                        });
                    },
                    setup: function(editor) {
                        editor.on('init', function(e) {
                            /**
                             * @Description: 更改富文本编辑器默认字体/字号/颜色
                             * @author wanghongzhuf
                             * @date 2020/4/27
                             */
                            this.getBody().style.fontSize = vm.defaultMailSetting.fontSizeValue;
                            this.getBody().style.color = vm.defaultMailSetting.fontColorValue;
                            this.getBody().style.fontFamily = vm.defaultMailSetting.fontFamilyValue;

                            vm.initPage();
                            vm.toxTinymce = document.querySelector('.tox-tinymce');
                            vm.toxTinymce.addEventListener('dragover', vm.enter_drag_iframe, false);
                            vm.vModalEditorIframe = document.getElementById('vModalEditor_ifr');
                            vm.vModalEditorIframe.contentWindow.document.addEventListener('dragover', vm.enter_drag_iframe, false);
                        });
                        editor.on('focus', function(e) {
                            // 富文本获取焦点时,更改阈值为tinymce
                            vm.insertTxt = 'tinymce';
                            vm.cursorType = 'editor';
                            if (!vm.firstVisit) {
                                vm.writeMail();
                            }
                            vm.firstVisit = false;
                            // 增加防抖
                            if (vm.timer) {
                                clearTimeout(vm.timer);
                                vm.timer = null;
                            }
                            vm.timer = setTimeout(() => {
                                vm.requiredItemsVerification();
                            }, 200);
                            // document.getElementsByClassName('el-dialog__body')
                            // 滚动弹窗到底部
                            // if (vm.mailDetailId) {
                            //     $('.el-dialog__body').scrollTop($('.el-dialog__body')[0].scrollHeight);
                            // }
                        });

                        // ai tool bar
                        editor.on('mouseup', function (e) {
                            setTimeout(() => {
                                const selection = editor.selection;
                                const text = selection.getContent({ 'format': 'text' }).trim();
                                const preText = selection.getContent({ 'format': 'html' });
                                const frameRect = vm.vModalEditorIframe.getBoundingClientRect()
                                const { left, top  } = frameRect
                                if (text) {
                                    vm.$aiToolBar.init({
                                        type: 'inputBoxSelect',
                                        value: text,
                                        mouseX: left + e.clientX,
                                        mouseY: top + e.clientY,
                                        onCover: (v) => {
                                            vm.$aiToolBar.destroy();
                                            const id = `cover-${Math.ceil(Math.random() * 1000)}`
                                            editor.selection.setContent(`<span id="${id}">${v.replace(/\n/g,'<br>')}</span>`, {format: 'html'});
                                            // auto select
                                            const selection = tinymce.activeEditor.selection;
                                            selection.select(tinymce.activeEditor.dom.select(`span[id="${id}"]`)[0], true);
                                        },
                                        onInsert: (v) => {
                                            vm.$aiToolBar.destroy();
                                            const id = `insert-${Math.ceil(Math.random() * 1000)}`
                                            editor.selection.setContent(`${preText}<div id="${id}">${v.replace(/\n/g,'<br>')}</div>`);
                                            const selection = tinymce.activeEditor.selection;
                                            selection.select(tinymce.activeEditor.dom.select(`div[id="${id}"]`)[0], true);
                                        }
                                    })
                                } else {
                                    vm.$aiToolBar.destroy();
                                }
                            }, 0);
                        });
                        editor.on('input', function(e) {
                            console.log(1)
                            const content = tinymce.activeEditor.getContent({ format: 'text' }).trim();
                            const text = content.split('\n')[0]
                            if (text.trim().toLowerCase() === '/ai') {
                                vm.$aiToolBar.init({
                                    type: 'inputBoxSlash',
                                    onConfirm: (v) => {
                                        const preContent = tinymce.activeEditor.getContent({ format: 'html' });
                                        vm.$aiToolBar.destroy();
                                        tinymce.activeEditor.setContent(`<div id="new-added">${v.replace(/\n/g,'<br>')}</div>${preContent.replace(text, '')}`, {format: 'html'});
                                        // auto select
                                        const selection = tinymce.activeEditor.selection;
                                        selection.select(tinymce.activeEditor.dom.select('div[id="new-added"]')[0], true);
                                    },
                                    onAbort: () => {
                                        const preContent = tinymce.activeEditor.getContent({ format: 'html' });
                                        tinymce.activeEditor.setContent(preContent.replace(text, ''), {format: 'html'});
                                    }
                                })
                            } else {
                                vm.$aiToolBar.destroy();
                            }

                            // 增加防抖
                            if (vm.timer) {
                                clearTimeout(vm.timer);
                                vm.timer = null;
                            }
                            vm.timer = setTimeout(() => {
                                vm.requiredItemsVerification();
                            }, 200);
                        });
                        editor.on('keyup', function(e) {
                            // 增加防抖
                            if (vm.timer) {
                                clearTimeout(vm.timer);
                                vm.timer = null;
                            }
                            vm.timer = setTimeout(() => {
                                vm.requiredItemsVerification();
                            }, 200);
                        });
                        editor.on('change', function(e) {
                            // 增加防抖
                            if (vm.timer) {
                                clearTimeout(vm.timer);
                                vm.timer = null;
                            }
                            vm.timer = setTimeout(() => {
                                vm.requiredItemsVerification();
                            }, 200);
                        });
                        //  高级粘贴功能的回调
                        editor.on('PastePostProcess', function(data) {
                            let tbl = data.node.querySelector('#signature');
                            tbl && tbl.removeAttribute('id', 'signature');
                            data.node.querySelector('img') && data.node.querySelector('img').getAttribute('src')
                            if (data.node.querySelector('img') && !data.node.querySelector('img').getAttribute('src')) {
                                // 不支持图文上传
                                tinymce.activeEditor.notificationManager.open({
                                    text: '不支持复制粘贴含图片的文本内容，请对图片单独操作。',
                                    type: 'error',
                                    timeout: 5000,
                                    closeButton: true
                                });
                            }
                        });
                        editor.on('paste', function(event) {
                            const items = (event.clipboardData || window.clipboardData).items;
                            if (items && items.length) {
                                const files = (event.clipboardData || window.clipboardData).files;
                                // 先按附件上传
                                if (files.length) {
                                    const filesUnImage = [];
                                    for (const item in files) {
                                        if (files[item].type && files[item].type.indexOf('image') === -1) {
                                            filesUnImage.push(files[item]);
                                        }
                                    }
                                    if (filesUnImage.length) {
                                        vm.$refs.filesUpload.uploadFiles(filesUnImage);
                                    }
                                }
                                // 搜索剪切板items
                                if (items[items.length - 1].type === 'application/whatsapp') {
                                /**
                                 * @Description: 客户报错: whatsapp 消息粘贴不了
                                 * @author 汤一飞
                                 * @date 2021/5/31
                                 */
                                } else if (items[items.length - 1].type === 'text/plain') {
                                /**
                                 * @Description: 客户报错: 粘贴 Google 翻译内容时, 没有保留换行和空格
                                 * 之前改为在 editor.insertContent 时, 粘贴处理后的字符串(替换换行和空格为 HTML 换行符和空格转义字符)
                                 * 后来发现富文本编辑器官网粘贴文本就能保留换行和空格, 所以直接注释下面的纯文本处理逻辑, 按富文本编辑器默认行为走
                                 * @author 汤一飞
                                 * @date 2021/5/20
                                 */
                                }
                            }
                            vm.writeMail();
                        });
                        editor.ui.registry.addButton('insertImageBtn', {
                            tooltip: 'Insert Image',
                            icon: 'image',
                            onAction: function(_) {
                                const upload = vm.$refs.imageUpload;
                                vm.$nextTick(() => {
                                    upload.$refs['upload-inner'].handleClick();
                                });
                            }
                        });
                    }
                });
            },
            /** 添加写信默认设置 */
            addDefaultSetting() {
                util.ajaxJson({
                    url: '/mail/userconfig/add',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        key: 'getDefaultSetting',
                        value: JSON.stringify(this.defaultMailSetting)
                    }
                }).then(res => {
                    console.log('添加写信默认设置 保存结果', res.data);
                });
            },
            /* 添加联系人 */
            addContacts(id) {
                event.stopPropagation();
                this.addContactList = [];
                this.emitModalId = id;
                this.contactsModel = true;
            },
            /* 如果发件人邮箱在收件人列表中, 则将该发件人从收件人列表去除 */
            updateRecipients() {
                if (this.senderIndex) {
                    const temp = this.getStandardEmail(this.senders[this.senderIndex].emailAddress);
                    this.emailForm.recipients_to.some((i, index, arr) => {
                        if (this.getStandardEmail(i) === temp) {
                            arr.splice(index, 1);
                            return true;
                        }
                    });
                }
            },
            /* 点击写信页面底部的取消按钮时，需要判断是否需要离开确认弹窗 */
            isNeedShowLeaveTip() {
                const data = this.mailDataFormat(0);
                const data_recipients_to = data.recipients_to[0] === '[' && data.recipients_to[data.recipients_to.length - 1] === ']' ? (JSON.parse(data.recipients_to).length === 1 && !JSON.parse(data.recipients_to)[0] ? [] : JSON.parse(data.recipients_to)) : data.recipients_to;
                const data_recipients_cc = data.recipients_cc[0] === '[' && data.recipients_cc[data.recipients_cc.length - 1] === ']' ? (JSON.parse(data.recipients_cc).length === 1 && !JSON.parse(data.recipients_cc)[0] ? [] : JSON.parse(data.recipients_cc)) : data.recipients_cc;
                const data_recipients_bcc = data.recipients_bcc[0] === '[' && data.recipients_bcc[data.recipients_bcc.length - 1] === ']' ? (JSON.parse(data.recipients_bcc).length === 1 && !JSON.parse(data.recipients_bcc)[0] ? [] : JSON.parse(data.recipients_bcc)) : data.recipients_bcc;
                const text = tinymce.activeEditor ? tinymce.activeEditor.getContent({ format: 'text' }) : '';
                return data_recipients_to.length ||
                    data_recipients_bcc.length ||
                    data_recipients_cc.length ||
                    data.subject.length ||
                    text.trim().length ||
                    data.mailAttachmentList.length ||
                    /<img[^>]+>/.test(data.content) ||
                    (data.mailLabelIds && data.mailLabelIds.length);
            },
            handleCancel() {
                if (this.isNeedShowLeaveTip()) {
                    this.confirmLeaveModal = true;
                } else {
                    this.jumpToMailHome();
                }
            },
            /* 自动保存草稿 */
            autoSaveDraft() {
                clearInterval(this.autoSaveDraftTimer);
                const vm = this;
                this.autoSaveDraftTimer = setInterval(() => {
                    vm.saveDraftOperateType = 'writeMailFooter';
                    vm.handleSaveEmail(1, true);
                }, 300000);
            },
            /* 跳转至邮箱首页--收件箱 */
            jumpToMailHome() {
                this.confirmLeaveModal = false;
                this.$emit('cancel');
            },
            /* ---------------------------发送邮件和存草稿相关------------------------------------------------ */
            /* 确认离开写信页面的弹窗中，点击存草稿，执行存草稿的操作成功后，跳转至邮箱首页 */
            leaveAndSaveDraft() {
                this.saveDraftOperateType = 'confirmLeaveModal';
                this.handleSaveEmail(1, false);
            },
            /* 点击写信页面下方的存草稿按钮的回调 */
            handleSaveDraft() {
                this.clickButton = 'saveDraft';
                this.saveDraftOperateType = 'writeMailFooter';
                this.handleSaveEmail(1, false);
            },
            /* 点击写信页面下方的发送按钮的回调 */
            handleSendEmail() {
                this.clickButton = 'sendMail';
                this.handleSaveEmail(0, false);
            },
            /* num: 0---发送邮件 or 2---存草稿; flag: true---自动保存草稿 or false---非自动存草稿 */
            handleSaveEmail(num, flag) {
                /* 自动保存的标志更改 */
                let localTime = 0;
                this.autoSaveDraftFlag = flag;
                if (this.$refs.filesUpload.fileList.some(item => { return item.status !== 'finished'; })) {
                    this.$Message.warning(this.$t('mail.uploadFilesUnfinishTip'));
                    return;
                } else if (this.$refs.filesUpload.fileSize >= this.max_size * 1024 && this.isSeparate === 0) {
                    this.$Message.warning(`${this.$t('mail.uploadFilesOversizeTip')}${this.max_size / 1024}M`);
                    return;
                } else if (this.$refs.filesUpload.fileSize >= 2 * 1024 * 1024 && this.isSeparate === 1) {
                    this.$Message.warning(`${this.$t('mail.uploadFilesOversizeTip')}2M`);
                    return;
                }
                // 主题长度限制
                if (this.emailForm.subject.length > 500) {
                    return this.$Message.error(this.$t('mail.writeLetter.subjectLimit'));
                }
                if (num) {
                    this.draftLoading = true;
                } else {
                    this.publishLoading = true;
                }
                if (this.isSeparate === 1) {
                    this.set_time_flag = false;
                }
                const data = this.mailDataFormat(num);
                const data_recipients_to = data.recipients_to[0] === '[' && data.recipients_to[data.recipients_to.length - 1] === ']' ? (JSON.parse(data.recipients_to).length === 1 && !JSON.parse(data.recipients_to)[0] ? [] : JSON.parse(data.recipients_to)) : data.recipients_to;
                /* 由于用户可能在写信页面停留过久，点击发送/存草稿时，需要再次校验，定时邮件的发送时间是否超前于当前北京时间半小时，若不足半小时，需要重新设置 */
                if (this.set_time_form.local_time) {
                    localTime = this.set_time_form.local_time.getTime() + this.set_time_form.time_difference * 60000;
                }
                // 转发邮件增加参数
                if (this.replyMailType === 'forward' && this.userId === this.createUserId) {
                    data.replyMailType = 2;
                    data.originalMailId = this.mailDetailId;
                }
                if (!this.autoSaveDraftFlag && this.set_time_flag && this.set_time_form.local_time && localTime - new Date().getTime() < 1800000) {
                    this.$Message.warning(this.$t('mail.regularMailResetTip'));
                    this.draftLoading = false;
                    this.publishLoading = false;
                    this.set_time_flag = false;
                    this.$emit('saveDraftFail', false);
                    return false;
                }
                if (num) {
                    if (data.content.length) {
                        if (this.no_settime) {
                            this.set_time_flag = false;
                        }
                        data.mailLabelIds = [];
                        data.mailBoxId = this.email_id;
                        data.operateType = this.autoSaveDraftFlag ? 0 : 1;
                        /* 邮件保存草稿新增对标签的判断，如果有标签则提示弹窗并清除writeMailTags，若没有则调用保存邮件的方法 */
                        if (this.writeMailTags.length !== 0 && !flag) {
                            // 弹窗提示用户保存邮件会删除已经添加的标签。用户点击ok，则清除writeMailTags并执行savaAsDraft；点击cancel，则关闭确认弹窗
                            this.saveDraftTagModal = true;
                            return;
                        }
                        this.saveAsDraft(data);
                    } else {
                        this.draftLoading = false;
                        // this.$emit('hasDraftSaved', false);
                        this.$Notice.warning({
                            title: this.$t('mail.writeLetter.saveWarnTitle'),
                            message: this.$t('mail.writeLetter.saveWarnDesc')
                        });
                    }
                } else {
                    /**
                     * @Description: bug：发送邮件时对邮件内容进行为空校验，包含富文本编辑器默认的一行空格，需要认定为空。【ID1005117】
                     *               解决方案：获取富文本编辑器的纯文本内容。
                     * @author 杨娣
                     * @date 2020/5/19
                     */
                    const text = tinymce.activeEditor.getContent({ format: 'text' });
                    if (data.from.length &&
                        data_recipients_to.length &&
                        data.subject.length &&
                        (text.trim().length || /<img[^>]+>/.test(data.content))) {
                        data.operateType = 2;
                        /**
                         * @Description: 配合后端将发件接口拆分为保存邮件信息和发送邮件两个接口实现。当保存邮件信息接口保存成功后，再调用发件接口
                         *               后端开发人员：迟丽超
                         * @author 杨娣
                         * @date 2020/7/14
                         */
                        // 主题不能添加表情的限制
                        const reg = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
                        if (data.subject.match(reg) && data.subject.match(reg).length) {
                            this.$Message.warning(this.$t('mail.writeLetter.subjectCheckTitle'));
                        } else {
                            if (this.noAttachmentReg.test(text) && !data.mailAttachmentList.length) {
                                this.noAttachmentData = data;
                                this.noAttachmentModal = true;
                                this.publishLoading = false;
                            } else {
                                this.saveEmail(data);
                            }
                        }
                    } else {
                        this.publishLoading = false;
                        this.$Notice.warning({
                            title: this.$t('mail.writeLetter.sendWarnTitle'),
                            message: this.$t('mail.writeLetter.sendWarnDesc')
                        });
                    }
                }
            },
            /* 发送邮件前保存邮件信息 */
            async saveEmail(data) {
                this.is_show = true;
                if (this.noAttachmentModal) {
                    this.noAttachmentData = null;
                    this.noAttachmentModal = false;
                    this.publishLoading = true;
                }
                // 提交之前把邮件内容隐藏的原邮件放出来
                data.content = data.content.replace('<div id="relayPlaceholder" style="display: none; line-height: 32px; font-size: 14px; font-family: arial,helvetica,sans-serif; color: #333;">', '<div id="relayPlaceholder" style="line-height: 32px;font-size:14px ;font-family: arial,helvetica,sans-serif;color:#333;">')

                data.requestSerialCode = this.requestSerialCode;
                if (this.set_time_flag && this.set_time_form.local_time) {
                    this.saveAsDraft(data);
                } else {
                    // 追加 iframe head 中的 style , 避免样式错误
                    if (!data.content.startsWith(this.tinymce_contentStyle)) {
                        data.content = this.tinymce_contentStyle + data.content;
                    }
                    if (!localStorage.getItem('XHLMailUrl')) {
                        await this.$store.dispatch('getMailUrl');
                    }
                    const XHLMailUrl = JSON.parse(localStorage.getItem('XHLMailUrl'));
                    const url = XHLMailUrl.sendMail && XHLMailUrl.sendMail[this.emailForm.from] === 1 ? this.sendMailUrl : '/mail/saveMail';
                    triggerGtag('CRM', '发送邮件');
                    util.ajaxJson({
                        url: url,
                        method: 'post',
                        timeout: 15000,
                        data
                    }).then(async (response) => {
                        /**
                         * @Description: 配合后端发送邮件的接口修改，只有当接口返回code为1且data有值(data的值即为当前发送的邮件id)时，才提示发送成功
                         * @author 杨娣
                         * @date 2020/5/6
                         */
                        if (response.data.code === 1 && response.data.data) {
                            if (this.$route.path === '/mail/mailDetail' && this.userId === this.createUserId) {
                                this.$emit('sendMail');
                            }
                            /* 草稿箱邮件发送成功后，调用deleteMail，将原草稿邮件从es数据库中删除，避免出现草稿已发送但仍被搜索到的问题;
                     同时删除邮件数据库的原草稿邮件 */
                            if (this.email_id && this.mailDraftFlag === 1) {
                                this.deleteMail();
                            }
                            if (this.taskObj && this.isSeparate === 0) {
                                this.taskObj.relatObjId = response.data.data;
                                this.taskObj.relatObjDescription = JSON.stringify({ mailSubject: data.subject, mailId: response.data.data, mailBoxTypeId: 4, mailBoxTypeName: this.$t('mail.sentBox'), mailCreateUserId: this.userId });
                                crmCommon.taskSave(this.taskObj).then(response => {
                                    if (response.code === '1') {
                                        const time = new Date(this.taskObj.taskEndTime).getTime() - 0 * 60000 - Date.now();
                                        if (time > 0) {
                                            this.$store.commit('setTaskChangeObj', {
                                                id: JSON.parse(response.data).id,
                                                type: 'newTask',
                                                taskName: this.taskObj.taskName,
                                                taskEndTime: this.taskObj.taskEndTime,
                                                time: time
                                            });
                                        } else if (time === 0) {
                                            this.$store.dispatch('taskNotice', {
                                                tip: this.taskObj.taskName,
                                                fromNick: this.$options.filters.timeFormat(this.taskObj.taskEndTime, 'yyyy-MM-dd hh:mm')
                                            });
                                        }
                                    } else {
                                        this.$Message.error(this.$t('crm.Modal.error_newTask'));
                                    }
                                });
                            }
                            this.taskObj = null;
                            await this.delete_drafts();
                            /* 邮件信息保存成功后，后端会自行调用真实发邮件的接口，无需前端处理 */
                            /* 以下三行逻辑目前未知用途，暂时保留，待确认 */
                            data.from = `<${data.from}>`;
                            data.content = data.content.replace('<div id="signature" style="color:#000;font-size:16px;font-family:楷体,arial,helvetica,sans-serif;clear:both;">', '<div>');
                            data.mailId = response.data.data;
                            this.publishLoading = false;
                            this.$Notice({
                                iconClass: 'custom custom-sending',
                                title: this.$t('mail.writeLetter.sendingMail')
                            });
                            /* 邮件信息保存成功跳转至邮件首页 */
                            this.jumpToMailHome();
                        } else {
                            this.publishLoading = false;
                            this.$Notice.error({
                                title: this.$t('mail.writeLetter.sendErrorTitle'),
                                message: response.data.msg
                            });
                        }
                        this.is_show = false;
                    }).catch(() => {
                        // 增加国外发信失败再次尝试走国内发件
                        triggerGtag('CRM', '发送邮件');
                        util.ajaxJson({
                            url: '/mail/saveMail',
                            method: 'post',
                            timeout: 15000,
                            data
                        }).then(async (response) => {
                            /**
                             * @Description: 配合后端发送邮件的接口修改，只有当接口返回code为1且data有值(data的值即为当前发送的邮件id)时，才提示发送成功
                             * @author 杨娣
                             * @date 2020/5/6
                             */
                            if (response.data.code === 1 && response.data.data) {
                                /* 草稿箱邮件发送成功后，调用deleteMail，将原草稿邮件从es数据库中删除，避免出现草稿已发送但仍被搜索到的问题;
                        同时删除邮件数据库的原草稿邮件 */
                                if (this.email_id && this.mailDraftFlag === 1) {
                                    this.deleteMail();
                                }
                                await this.delete_drafts();
                                if (this.taskObj && this.isSeparate === 0) {
                                    this.taskObj.relatObjId = response.data.data;
                                    this.taskObj.relatObjDescription = JSON.stringify({ mailSubject: data.subject, mailId: response.data.data, mailBoxTypeId: 4, mailBoxTypeName: this.$t('mail.sentBox'), mailCreateUserId: this.userId });
                                    crmCommon.taskSave(this.taskObj).then(response => {
                                        if (response.code === '1') {
                                            const time = new Date(this.taskObj.taskEndTime).getTime() - 0 * 60000 - Date.now();
                                            if (time > 0) {
                                                this.$store.commit('setTaskChangeObj', {
                                                    id: JSON.parse(response.data).id,
                                                    type: 'newTask',
                                                    taskName: this.taskObj.taskName,
                                                    taskEndTime: this.taskObj.taskEndTime,
                                                    time: time
                                                });
                                            } else if (time === 0) {
                                                this.$store.dispatch('taskNotice', {
                                                    tip: this.taskObj.taskName,
                                                    fromNick: this.$options.filters.timeFormat(this.taskObj.taskEndTime, 'yyyy-MM-dd hh:mm')
                                                });
                                            }
                                        } else {
                                            this.$Message.error(this.$t('crm.Modal.error_newTask'));
                                        }
                                    });
                                }
                                this.taskObj = null;
                                await this.delete_drafts();
                                /* 邮件信息保存成功后，后端会自行调用真实发邮件的接口，无需前端处理 */
                                /* 以下三行逻辑目前未知用途，暂时保留，待确认 */
                                data.from = `<${data.from}>`;
                                data.content = data.content.replace('<div id="signature" style="color:#000;font-size:16px;font-family:楷体,arial,helvetica,sans-serif;clear:both;">', '<div>');
                                data.mailId = response.data.data;
                                this.publishLoading = false;
                                this.$Notice({
                                    iconClass: 'custom custom-sending',
                                    title: this.$t('mail.writeLetter.sendingMail')
                                });
                                /* 邮件信息保存成功跳转至邮件首页 */
                                this.jumpToMailHome();
                            } else {
                                this.publishLoading = false;
                                this.$Notice.error({
                                    title: this.$t('mail.writeLetter.sendErrorTitle'),
                                    message: response.data.msg
                                });
                            }
                        }).catch(error => {
                            this.publishLoading = false;
                            this.is_show = false;
                            if (/timeout of (\d+)ms exceeded/.test(error.toString())) {
                                this.$Notice.error({
                                    title: this.$t('mail.writeLetter.sendTimeoutTitle'),
                                    message: this.$t('mail.writeLetter.timeoutDesc')
                                });
                            } else {
                                this.$Notice.error({
                                    title: this.$t('mail.writeLetter.sendErrorTitle'),
                                    message: this.$t('mail.writeLetter.errorDesc')
                                });
                            }
                        });
                    });
                }
            },
            /* 保存邮件为草稿 */
            saveAsDraft(data) {
                const reg = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g;
                if (data.subject.match(reg) && data.subject.match(reg).length) {
                    this.$Message.warning(this.$t('mail.writeLetter.subjectCheckTitle'));
                    this.draftLoading = false;
                    this.is_show = false;
                    return;
                }
                /* 定时邮件，保存草稿时携带相关定时信息 */
                if (this.set_time_flag && this.set_time_form.local_time) {
                    data.bjTime = this.bj_time_flag ? this.bj_time_flag : new Date(this.bjTime).getTime();
                    data.mailTimeFlag = 1;
                    data.mailIsDraft = 1;
                    data.timeZone = this.set_time_form.time_difference;
                    data.timeZoneTime = this.set_time_form.local_time;
                    data.mailBoxId = this.email_id;
                }

                // 追加 iframe head 中的 style , 避免样式错误
                if (!data.content.startsWith(this.tinymce_contentStyle)) {
                    data.content = this.tinymce_contentStyle + data.content;
                }

                util.ajaxReceiveMailJson({
                    url: '/mail/saveDraft',
                    method: 'post',
                    data
                }).then(async (response) => {
                    this.draftLoading = false;
                    this.is_show = false;
                    if (response.data.code === 1) {
                        // 更新es库的草稿
                        this.email_id = response.data.data;
                        this.mailDraftFlag = 1;
                        if (this.taskObj && this.isSeparate === 0) {
                            this.taskObj.relatObjId = this.email_id;
                            this.taskObj.relatObjDescription = JSON.stringify({ mailSubject: data.subject, mailId: this.email_id, mailBoxTypeId: 5, mailBoxTypeName: this.$t('mail.draftBox'), mailCreateUserId: this.userId });
                            crmCommon.taskSave(this.taskObj).then(response => {
                                if (response.code === '1') {
                                    const taskData = JSON.parse(response.data);
                                    taskData.createTime = undefined;
                                    taskData.updateTime = undefined;
                                    taskData.remindTimeLatest = undefined;
                                    this.$emit('setTask', taskData);
                                    const time = new Date(this.taskObj.taskEndTime).getTime() - 0 * 60000 - Date.now();
                                    if (time > 0) {
                                        this.$store.commit('setTaskChangeObj', {
                                            id: this.email_id,
                                            type: 'newTask',
                                            taskName: this.taskObj.taskName,
                                            taskEndTime: this.taskObj.taskEndTime,
                                            time: time
                                        });
                                    } else if (time === 0) {
                                        // this.$store.dispatch('taskNotice', {
                                        //     tip: this.taskObj.taskName,
                                        //     fromNick: this.$options.filters.timeFormat(this.taskObj.taskEndTime, 'yyyy-MM-dd hh:mm')
                                        // });
                                    }
                                } else {
                                    this.$Message.error(this.$t('crm.Modal.error_newTask'));
                                }
                            });
                        }
                        await this.updateDraft(response.data.data);
                        this.$Message.success({
                            message: this.autoSaveDraftFlag ? this.$t('mail.autoSaveDraftSuccess') : this.$t('mail.writeLetter.saveSuccTitle'),
                            duration: 3000
                        });
                        /* 当在确认离开的弹窗中点击存草稿，或者定时邮件点击发送时，执行存草稿操作；草稿保存成功后，自动关闭写信页面的逻辑 */
                        if (this.saveDraftOperateType === 'confirmLeaveModal' || (this.set_time_flag && this.set_time_form.local_time && this.clickButton === 'sendMail')) {
                            this.jumpToMailHome();
                        }
                        if ((this.set_time_flag && this.set_time_form.local_time && this.clickButton === 'sendMail') && !this.autoSaveDraftFlag) {
                            this.$Notice.success({
                                title: this.$t('mail.regularMailSetSuccess'),
                                message: this.$t('mail.writeLetter.succDescDraft')
                            });
                        }
                    } else {
                        this.confirmLeaveModal = false;
                        // 理论上不会保存失败
                        if (this.autoSaveDraftFlag) {
                            this.$Message.error({
                                message: this.$t('mail.autoSaveDraftError'),
                                duration: 3000
                            });
                        } else {
                            this.$Message.error(this.$t('mail.writeLetter.saveFailTitle'));
                        }
                    }
                }).catch(error => {
                    this.draftLoading = false;
                    this.is_show = false;
                    if (/timeout of (\d+)ms exceeded/.test(error.toString())) {
                        this.$Notice.error({
                            title: this.$t('mail.writeLetter.saveTimeoutTitle'),
                            message: this.$t('mail.writeLetter.timeoutDesc')
                        });
                    } else {
                        if (!this.autoSaveDraftFlag) {
                            this.$Notice.error({
                                title: this.$t('mail.writeLetter.saveFailTitle'),
                                message: this.$t('mail.writeLetter.errorDesc')
                            });
                        } else {
                            this.$Message.error({
                                message: this.$t('mail.autoSaveDraftError'),
                                duration: 3000
                            });
                        }
                    }
                });
            },
            /** 更新es库的草稿信息 */
            updateDraft(mailId) {
                util.ajaxMailJson({
                    url: '/es/api/mail/updateDraftMail',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        mailId: mailId,
                        createUserId: this.userId
                    }
                }).then((res) => {
                    console.log(res);
                });
            },
            // 邮件发送成功后，删除原草稿箱邮件
            delete_drafts() {
                if (this.email_id) {
                    return new Promise((resolve) => {
                        util.ajaxMailJson({
                            url: '/mail/deleteDraftMail',
                            method: 'put',
                            data: {
                                orgId: this.enterpriseId,
                                mailBoxId: this.email_id,
                                updateUserId: this.userId,
                                updateUserName: this.userName
                            }
                        }).then(() => {
                            resolve();
                        }).catch(() => {
                            resolve();
                        });
                    });
                }
            },
            /* 当草稿箱邮件发送成功后，将es库中的原草稿邮件信息删除，避免全局搜索时仍旧搜到该草稿邮件 */
            deleteMail() {
                util.ajaxMailJson({
                    url: '/es/api/mail/delete',
                    method: 'POST',
                    data: {
                        emailIds: [this.email_id]
                    }
                }).then(response => {
                    if (response.data.code === 1) {
                        // no empty
                    } else {
                        // no empty
                    }
                });
            },
            /* ---------------------------邮件通用方法------------------------------------------------ */
            /* 邮件数据格式化 */
            mailDataFormat(num) {
                const emailForm = Object.assign({}, this.emailForm);
                const saveMailCrmRelationConditions = this.saveMailCrmRelationConditions.slice();
                const time = new Date().getTime();
                const arr_recipients = [];
                const accountId = this.accountId;
                const createUserId = this.userId;
                Object.keys(emailForm).forEach(item => {
                    if (typeof emailForm[item] === 'boolean') {
                        emailForm[item] = emailForm[item] ? 1 : 0;
                    }
                    if (Object.prototype.toString.call(emailForm[item]) === '[object Array]') {
                        if (item === 'recipients_to') {
                            emailForm[item].forEach(mail => {
                                saveMailCrmRelationConditions.forEach(obj => {
                                    if (obj.receiveMailAddress === mail) {
                                        obj = {
                                            ...obj,
                                            accountId: accountId,
                                            createUserId: createUserId,
                                            receiverType: 'to'
                                        };
                                        arr_recipients.push(obj);
                                    }
                                });
                            });
                        }
                    }
                });
                // 收件人/抄送人/密送人 需要转成字符串类型的数组
                Object.keys(emailForm).forEach((item) => {
                    if (item === 'recipients_to' || item === 'recipients_cc' || item === 'recipients_bcc') {
                        emailForm[item] = JSON.stringify(emailForm[item]);
                    }
                });
                return {
                    ...emailForm,
                    // mailSignId: this.emailForm.mailSignIndex,
                    mailSignId: this.signatureId,
                    content: tinymce.activeEditor ? tinymce.activeEditor.getContent() : '',
                    traceTimeStamp: time,
                    mail_from: 'placeholder',
                    mailIsDraft: num,
                    contain_attachment_flag: this.$refs.filesUpload.fileList.length ? 1 : 0,
                    mailAttachmentList: this.$refs.filesUpload.fileList.map((file, index) => {
                        return {
                            fileName: file.name,
                            fileOrder: index,
                            filePath: `${this.qiniuHttp}${file.isDataBaseFile ? file.uid : file.response ? file.response.key : ''}`,
                            fileSize: this.sizeConversion(file.size),
                            fileType: file.name.lastIndexOf('.') !== -1 ? file.name.slice(file.name.lastIndexOf('.')) : '',
                            mailBoxId: 4
                        };
                    }),
                    saveMailCrmRelationConditions: arr_recipients,
                    variables: this.isSeparate ? this.variables : [],
                    createUserId: this.userId,
                    enterpriseId: this.enterpriseId,
                    mailGroupSendingSingleShowFlag: this.isSeparate,
                    mailLabelIds: this.mailLabelIds
                };
            },
            /* 附件大小显示格式处理 */
            sizeConversion(size) {
                const result = Number(size);
                if (isNaN(result)) {
                    return size;
                } else {
                    const kiloByte = (result / 1024).toFixed(2);
                    if (kiloByte < 1) {
                        return `${result}Byte(s)`;
                    }
                    const megaByte = (kiloByte / 1024).toFixed(2);
                    if (megaByte < 1) {
                        return `${kiloByte}KB`;
                    }
                    const gigaByte = (megaByte / 1024).toFixed(2);
                    if (gigaByte < 1) {
                        return `${megaByte}MB`;
                    }
                    const teraByte = (gigaByte / 1024).toFixed(2);
                    if (teraByte < 1) {
                        return `${gigaByte}GB`;
                    }
                }
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
            /* 通过originalMailId获取原始邮件的详情，用于已回复标识的判断 */
            getOriginalMailDetail() {
                return new Promise((resolve, reject) => {
                    util.ajaxMailJson({
                        // url: `/mail/mailDetail/${this.originalMailId}`,
                        url: '/mail/mailDetail',
                        method: 'get',
                        params: {
                            userId: this.userId,
                            orgId: this.enterpriseId,
                            id: this.originalMailId,
                            createUserId: this.createUserId
                        }
                    }).then(res => {
                        if (res.data.code === 1) {
                            resolve(res.data.data.from);
                        } else {
                            resolve();
                        }
                    }).catch(err => {
                        reject(err);
                    });
                });
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
            /* /!* 获取标准格式的邮箱 *!/
         getStandardEmail: function (str) {
         // return /<([\s\S]*?)>/.exec(str) ? /<([\s\S]*?)>/.exec(str)[1] : str;
         return /[a-z0-9]+([.]?[-_a-z0-9]+)*@([a-z0-9]+([.-][a-z0-9]+)*\.)[a-z0-9]+/i.exec(str) ? /[a-z0-9]+([.]?[-_a-z0-9]+)*@([a-z0-9]+([.-][a-z0-9]+)*\.)[a-z0-9]+/i.exec(str)[0] : str;
         }, */
            handleUnload(e) {
                if (this.isNeedShowLeaveTip()) {
                    // Older browsers supported custom message
                    e = window.event || e;
                    // Cancel the event as stated by the standard.
                    e.preventDefault();
                    if (e) {
                        e.returnValue = '确定离开当前页面吗？';
                    }
                    return '确定离开当前页面吗？';
                }
            },
            /* 创建客户---产品要求修改为邮件录入线索，此方法注释。杨娣 2021/03/05 */
            /* createCustomer(email) {
         this.mailAddress = email;
         this.newCompanyShow = true;
         }, */
            createClue(mailId, email) {
                this.mailAddress = email;
                this.newClueShow = true;
                this.getClueOption(mailId);
            },
            // 获取线索字段
            getClueOption(mailId) {
                this.templateList = [];
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
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
                            enterpriseId: this.enterpriseId,
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
                this.updateMailCrmStatus(this.mailAddress, status);
            },
            // 录入成询盘后
            updateInquiryStatus(clueId, status) {
                this.newClueShow = false;
                this.clueId = clueId;
                this.updateMailCrmStatus(this.mailAddress, status);
            },
            updateMailCrmStatus(email, status) {
                this.crmEmails.forEach(item => {
                    if (item.email === email) {
                        item.type = status;
                    }
                    return item;
                });
            },
            /** 显示详情 */
            async showCompany({ companyId, rightUserIds, type }) {
                // if (type === 0) {
                //     if (!this.isContainsMenu('highseasCustomer')) {
                //         this.$Message.warning('您没有查看公海数据的权限，无法查看');
                //         return;
                //     }
                // } else {
                //     if (this.isContainsMenu('myCustomer')) {
                //         if (type === 2) {
                //             const flag = await this.isHaveManageAuthority(rightUserIds);
                //             if (!flag) {
                //                 this.$Message.warning('您当前无权限查看此客户');
                //                 return false;
                //             }
                //         }
                //     } else {
                //         this.$Message.warning('您没有客户管理页面的查看权限，请联系您的管理员开通');
                //         return false;
                //     }
                // }
                // this.show_clue_detail = false;
                // this.show_company_detail = false;

                // this.$nextTick(() => {
                //     this.companyId = companyId;
                //     if (type === 1 || type === 2) {
                //         /**
                //          * @Description: 如要修改点击橙色小人头标识跳转至目标详情页，修改此处的type_company即可。
                //          *               customer(客户详情页)/inquiry(询盘详情页)
                //          * @author 杨娣
                //          * @date 2021/01/20
                //          */
                //         this.type_company = 'customer';
                //     } else if (type === 0) {
                //         this.type_company = 'highseasCustomer';
                //     }
                //     this.show_company_detail = true;
                //     this.$emit('changeSearchCustomer', false);
                // });
            },
            async showClue({ clueId, rightUserIds, type }) {
                // if (type === 0) {
                //     if (!this.isContainsMenu('common_sea_customer')) {
                //         this.$Message.warning('您没有查看公海数据的权限，无法查看');
                //         return;
                //     }
                // } else {
                //     if (this.isContainsMenu('my_clue')) {
                //         if (type === 2) {
                //             const flag = await this.isHaveManageAuthority(rightUserIds);
                //             if (!flag) {
                //                 this.$Message.warning('您当前无权限查看此客户');
                //                 return false;
                //             }
                //         }
                //     } else {
                //         this.$Message.warning('您没有线索管理页面的查看权限，请联系您的管理员开通');
                //         return false;
                //     }
                // }
                // this.show_company_detail = false;
                // this.show_clue_detail = false;
                // this.$nextTick(() => {
                //     this.clueId = clueId;
                //     this.show_clue_detail = true;
                //     if (type === 1 || type === 2) {
                //         this.type_clue = 'clue';
                //     } else if (type === 0) {
                //         this.type_clue = 'highseasClue';
                //     }
                // });
            },
            /* 当前用户是否拥有某些人员的管理权限的判断 */
            isHaveManageAuthority(userIds) {
                /* 若userIds有值传入，则代表希望获取管理权限的校验结果；
             若无值传入，代表希望仅获取当前用户所管理的人员id集合，无需做管理权限的校验
             */
                return new Promise((resolve) => {
                    util.ajaxJson({
                        url: '/new-privilege/manage/getusers',
                        method: 'get',
                        params: {
                            orgId: this.enterpriseId,
                            userId: this.userId
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            // 该用户可管理的人员id集合
                            const arr1 = res.data.data;
                            if (userIds && userIds.length) {
                                // 询盘/线索负责人的id集合
                                const arr2 = userIds.map(Number);
                                // 如果有重复，视为当前用户具有管理权限
                                const flag = arr2.filter((x) => {
                                    return arr1.includes(x);
                                });
                                resolve(flag.length);
                            } else {
                                resolve(arr1);
                            }
                        }
                    }).catch(err => {
                        if (userIds && userIds.length) {
                            resolve(0);
                        } else {
                            resolve([]);
                        }
                    });
                });
            },

            // 通过邮箱地址获取对应的询盘/线索/未建档的状态
            getCompanyStatusByEmails(emailList) {
                const vm = this;
                /* 取消上一次请求，避免频繁请求接口时因接口响应速度快慢导致数据错乱 */
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }
                if (emailList.length) {
                    const post_data = {
                        emailList: emailList,
                        userId: this.userId,
                        orgId: this.enterpriseId
                    };
                    util.ajaxJson({
                        url: '/mail/getContactProfileInfo',
                        method: 'post',
                        data: post_data,
                        cancelToken: new util.axios.CancelToken(function executor(c) {
                            // An executor function receives a cancel function as a parameter
                            vm.cancelFunc = c;
                        })
                    }).then(async response => {
                        if (response.data.code === '1') {
                            const res = response.data.data;
                            // let flag = 0;
                            // const manageUserIds = await this.isHaveManageAuthority();
                            this.crmEmails = [];
                            this.variables = [];
                            for (let i = 0; i < emailList.length; i++) {
                                if (res[emailList[i]]) {
                                    res[emailList[i]].recipient = [emailList[i]];
                                    res[emailList[i]].email = emailList[i];
                                    res[emailList[i]].recieverCrmFlag = res[emailList[i]].type;
                                    res[emailList[i]].fromOrToFlag = 1;
                                }
                                this.crmEmails.push(res[emailList[i]]);
                            }
                            for (const key in res) {
                                if (Object.prototype.hasOwnProperty.call(res, key)) {
                                    const obj = {};
                                    // if (res[key].rightUsers) {
                                    //     const rightUserIds = Object.keys(res[key].rightUsers);
                                    //     flag = manageUserId(manageUserIds, rightUserIds);
                                    // }
                                    obj.email = key;
                                    obj.contactsName = res[key].contactsName && this.isShowContactName ? res[key].contactsName : '';
                                    obj.companyName = res[key].companyName && this.isShowCompanyName ? res[key].companyName : '';
                                    /* 他人线索/他人客户需经过管理权限的校验，决定是否显示公司名称/姓名 */
                                    // if (!flag && (res[key].type === 3 || res[key].type === 6)) {
                                    //     obj.contactsName = '';
                                    //     obj.companyName = '';
                                    // }
                                    this.variables.push(obj);
                                }
                            }
                        }
                    }).catch(error => {
                        console.log(error);
                    });
                }

                // function manageUserId(manageUserIds, rightUserIds) {
                //     if (rightUserIds.length) {
                //         // 询盘/线索负责人的id集合
                //         const tempArr = rightUserIds.map(Number);
                //         // 如果有重复，则视为当前用户具有管理权限
                //         const flag = tempArr.filter((x) => {
                //             return manageUserIds.includes(x);
                //         });
                //         return flag.length;
                //     }
                // }
            },
            getAllContactsStatus() {
                const allEmails = this.emailForm.recipients_to.concat(this.emailForm.recipients_cc).concat(this.emailForm.recipients_bcc);
                /**
                 * @Description: 此处设置判断是为了处理在删除收件人的操作时，不需要请求接口获取小人头状态，减轻服务器压力
                 * @author 杨娣
                 * @date 2020/5/12
                 */
                if (allEmails.length >= this.emailCount) {
                    this.emailCount = allEmails.length;
                } else {
                    this.emailCount = allEmails.length;
                    return;
                }
                const mailAdds = [];
                for (let i = 0; i < allEmails.length; i++) {
                    mailAdds.push(this.getStandardEmail(allEmails[i]));
                }
                this.getCompanyStatusByEmails([...new Set(mailAdds)]);
            },
            /* 上传附件的两种操作 --- 普通上传 和 询盘云资料库上传 */
            handleNormalUpload() {
                this.$refs.filesUpload.handleClick('normal');
            },
            handleDataBaseUpload() {
                this.$refs.filesUpload.handleClick('dataBase');
            },
            beforeDestroyClose() {
                tinymce.execCommand('mceRemoveEditor', true, 'vModalEditor');
                tinymce.remove('vModalEditor');
                this.$store.commit('setMailEdit', true);
                this.$store.commit('setReplyMailType', '');
                this.isFirstUpload = true;
                this.confirmLeaveModal = false;
                clearInterval(this.autoSaveDraftTimer);
                if (this.timer) {
                    clearTimeout(this.timer);
                    this.timer = null;
                }
                /**
                 * @Description: bug描述：对邮件A回复/转发等保存为草稿A后，退出写信页面，mail-home中的email_id未置空，其值为保存成功的草稿A的邮件id；
                 *                        再次进行其他任何邮件的回复/转发等，并最终存为草稿B时，会将草稿A的id随接口发送，则草稿A被误认为需要更新内容，
                 *                        数据库将草稿B的内容更新至草稿A的后台数据中，导致bug。
                 *               解决方案：页面销毁前将mail-home中的email_id初始化
                 * @author 杨娣
                 * @date 2020/6/23
                 */
                this.email_id = null;
            // window.removeEventListener('beforeunload', this.handleUnload);
            },
            expandRecipientDetails() {
                /** 触发接收人区域的展开状态 */
                this.expandRecipientDetailsShow = true;
            },
            writeMail() {
                /** 触发其他区域展示收起状态 --- 收件人不为空的情况收起 */
                if (this.emailForm.recipients_to.length) {
                    this.expandRecipientDetailsShow = false;
                }
            },
            recipientContent(e) {
                // 事件冒泡，阻止 触发收起事件的执行
                e.stopPropagation();
            },
            // 校验必填项（发件人、收件人、主题、正文）不能为空
            requiredItemsVerification() {
                // 发送按钮的 tip 主题和发件人不能为空提示
                const arr = [];
                if (!this.emailForm.from) arr.push(this.$t('mail.writeLetter.sender'));
                if (!this.emailForm.subject) arr.push(this.$t('mail.writeLetter.subject'));
                if (!this.emailForm.recipients_to.length) arr.push(this.$t('mail.writeLetter.recipients'));
                if (this.isInitFinishedMail) {
                    const data = this.mailDataFormat(0);
                    const text = tinymce.activeEditor.getContent({ format: 'text' });
                    if (!text.trim().length && !(/<img[^>]+>/.test(data.content))) {
                        arr.push(this.$t('mail.writeLetter.body'));
                    }
                } else {
                    arr.push(this.$t('mail.writeLetter.body'));
                }
                if (arr.length > 0) {
                    this.sendTip = arr.toString() + this.$t('mail.writeLetter.cannotBeEmpty');
                } else {
                    this.sendTip = '';
                }
            },
            dragleave(e) {
                e.preventDefault();
                e.stopPropagation();
                this.dragOver = false;
                this.uploadImages = false;
                this.uploadAttachment = false;
            },
            upload_drop(e) {
                e.preventDefault();
                e.stopPropagation();
                this.dragOver = false;
                this.uploadImages = false;
                this.uploadAttachment = false;
                this.$refs.filesUpload.uploadFiles(e.dataTransfer.files);
            },
            upload_dragover(e) {
                e.preventDefault();
                e.stopPropagation();
                this.uploadAttachment = true;
                this.uploadImages = false;
            },
            upload_images_dragover(e) {
                e.preventDefault();
                e.stopPropagation();
                this.uploadImages = true;
                this.uploadAttachment = false;
            },
            mousemove_upload(e) {
                this.dragOver = false;
                this.uploadImages = false;
                this.uploadAttachment = false;
            },
            // 打开监测链接的弹窗
            testInsertLink() {
                this.visible_insertLink = true;
            },
            // 插入监测链接
            handleInsertUrl({ linkUrl }) {
                // 如果没有链接直接插入
                tinymce.execCommand('mceInsertContent', false, `<a target="_blank" href="${linkUrl}">${linkUrl}</a>`);
            },
            handleTaskModal(params) {
                this.taskModalShow = false;
                this.modalShow = false;
                this.$nextTick(() => {
                    this.taskModalShow = true;
                    this.$nextTick(() => {
                        this.modalType = params.modalType;
                        this.fromModule = params.fromModule;
                        this.taskModalData = params.taskModalData;
                        this.modalShow = true;
                    });
                });
            },
            setTask(data) {
                this.taskObj = data;
            },
            handlePaste(e) {
                if (e && e.target && e.target.id && ['modelTotxt1', 'modelCctxt1', 'modelBcctxt1', 'modelMailSubject'].includes(e.target.id) && e.clipboardData.files.length === 1 && e.clipboardData.files[0].name === 'image.png') return;
                this.$refs.filesUpload.uploadFiles(e.clipboardData.files);
            },

            // ai tool bar
            onIputSelect(e) {
                const result = getInputSelectedText()
                if (result.text) {

                    const insert = (newText, insertStart, insertEnd) => {
                        this.emailForm.subject= newText
                        const subInput = document.getElementById("mailSubject")
                        subInput.focus()
                        this.$nextTick(() => {
                            subInput.setSelectionRange(insertStart, insertEnd)
                        })
                        this.$aiToolBar.destroy();
                    }

                    this.$aiToolBar.init({
                        type: 'inputBoxSelect',
                        value: result.text,
                        mouseX: e.clientX,
                        mouseY: e.clientY,
                        onCover: (v) => {
                            const newText = coverText(this.emailForm.subject, v, result)
                            insert(newText, result.start, result.start + v.length)
                        },
                        onInsert: (v) => {
                            const newText = insertText(this.emailForm.subject, v, result)
                            insert(newText, result.end, result.end + v.length)
                        }
                    })
                } else {
                    this.$aiToolBar.destroy()
                }
            },
        },

        beforeDestroy() {
            const _this = this;
            document.body.removeEventListener('dragenter', _this.enter_drag);
            document.body.removeEventListener('drop', _this.dragleave);
            if (this.vModalEditorIframe) {
                this.vModalEditorIframe = null;
            }
            if (this.toxTinymce) {
                this.toxTinymce.removeEventListener('dragover', _this.enter_drag_iframe);
                this.toxTinymce = null;
            }
            tinymce.execCommand('mceRemoveEditor', true, 'vModalEditor');
            tinymce.remove('vModalEditor');
            this.$store.commit('setReplyMailType', '');
            this.$store.commit('setSelectMailBoxType', '');
            this.isFirstUpload = true;
            clearInterval(this.autoSaveDraftTimer);
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }
            this.autoSaveDraftFlag = false;
            if (this.copyAttachmentNotice) {
                this.copyAttachmentNotice.close();
                this.copyAttachmentNotice = null;
            }
            /**
             * @Description: bug描述：对邮件A回复/转发等保存为草稿A后，退出写信页面，mail-home中的email_id未置空，其值为保存成功的草稿A的邮件id；
             *                        再次进行其他任何邮件的回复/转发等，并最终存为草稿B时，会将草稿A的id随接口发送，则草稿A被误认为需要更新内容，
             *                        数据库将草稿B的内容更新至草稿A的后台数据中，导致bug。
             *               解决方案：页面销毁前将mail-home中的email_id初始化
             * @author 杨娣
             * @date 2020/6/23
             */
            this.email_id = null;
        // window.removeEventListener('beforeunload', this.handleUnload);
        },
        watch: {
            // 监听 poptip 状态开启颜色选择框
            visible(val) {
                val && this.$refs.colorPicker.handleTrigger();
            },
            isModalFullScreen: {
                handler(val) {
                    if (val) {
                        this.$nextTick(() => {
                            this.linkmanListWidth = document.querySelector('.linkman-list') ? document.querySelector('.linkman-list').offsetWidth : 0;
                        });
                    }
                },
                deep: true,
                immediate: true
            },
            mailDetailMailEdit: {
                handler(val) {
                    this.$store.commit('setMailEdit', val);
                },
                deep: true,
                immediate: true
            },
            mailDetailId: {
                handler(val) {
                    this.confirmLeaveModal = false;
                    this.autoSaveDraft();
                },
                deep: true,
                immediate: true
            },
            mailDetailReplyType: {
                handler(val) {
                    this.$store.commit('setReplyMailType', val);
                    this.autoSaveDraft();
                },
                deep: true,
                immediate: true
            },
            set_time_flag(val) {
                if (!val) {
                    this.updateSendTimeFlag = false;
                }
            },
            bj_time(val) {
                this.set_time_flag = Boolean(val) || this.updateSendTimeFlag;
            },
            set_timeout_modal(val) {
                if (!val) {
                    this.set_time_flag = Boolean(this.bj_time) || this.updateSendTimeFlag;
                    if (!this.set_time_flag) {
                        this.set_time_form.local_time = '';
                    }
                }
            },
            contactsModel(val) {
                if (!val && this.addContactList && this.emitModalId) {
                    const addContactList = [...this.addContactList];
                    /**
                     * @Description: 邮箱收件人去重逻辑修改为只要邮箱地址部分重复，即判为同一个邮箱，默认保留第一个
                     *                 如客户a<xhl@163.com>， 客户b<xhl@163.com>，xhl@163.com为重复邮箱，保留邮箱--客户a<xhl@163.com>
                     * @author 杨娣
                     * @date 2019/10/15
                     */
                    const recipientsTo = this.emailForm[`recipients_${this.emitModalId}`];
                    const standardMailAdd = [];
                    let startIndex = -1;
                    let endIndex = -1;
                    for (let i = 0; i < recipientsTo.length; i++) {
                        startIndex = recipientsTo[i].indexOf('<');
                        endIndex = recipientsTo[i].indexOf('>');
                        if (startIndex !== -1 && endIndex !== -1) {
                            standardMailAdd.push(recipientsTo[i].substring(startIndex + 1, endIndex));
                        } else {
                            standardMailAdd.push(recipientsTo[i]);
                        }
                    }
                    addContactList.map(item => {
                        if (standardMailAdd.findIndex(contact => contact === item.receiveMailAddress) === -1) {
                            standardMailAdd.push(item.receiveMailAddress);
                            this.contacts.push(`${item.receiverName}<${item.receiveMailAddress}>`);
                            this.emailForm[`recipients_${this.emitModalId}`].push(`${item.receiverName}<${item.receiveMailAddress}>`);
                            delete item.checked;
                            delete item.clientType;// todo,后期可能不删除
                            delete item.scale;
                            this.saveMailCrmRelationConditions.push(item);
                        } else if (this.emailForm[`recipients_${this.emitModalId}`].findIndex(contact => contact.includes(item.receiveMailAddress)) === -1) {
                            this.emailForm[`recipients_${this.emitModalId}`].push(`${item.receiverName}<${item.receiveMailAddress}>`);
                        }
                    });
                    /**
                     * @Description: {收件人/抄送人/密送人}超出字符限制提示语
                     * @author wanghongzhu
                     * @date 2020/4/21
                     */
                    if (this.isSeparate === 0) {
                        // 当不为群发单显时会进入此判断
                        let inputStr = String(this.emailForm[`recipients_${this.emitModalId}`]);
                        if (inputStr.length >= 3800) {
                            inputStr = inputStr.slice(0, 3799);
                            if (this.emitModalId === 'to') {
                                this.$Message({
                                    message: this.$t('mail.writeLetter.beyondCharacterTip1'),
                                    type: 'warning',
                                    duration: 3000
                                });
                            } else if (this.emitModalId === 'cc') {
                                this.$Message({
                                    message: this.$t('mail.writeLetter.beyondCharacterTip2'),
                                    type: 'warning',
                                    duration: 3000
                                });
                            } else {
                                this.$Message({
                                    message: this.$t('mail.writeLetter.beyondCharacterTip3'),
                                    type: 'warning',
                                    duration: 3000
                                });
                            }
                        }
                    }
                // ----------------cut-off-------------------
                }
            },
            isSaveDraft(val) {
                if (val === true) {
                    this.handleSaveEmail(1, false);
                }
            },
            ccModel(val) {
                if (val) {
                    this.add_link_type = 'cc_person';
                } else {
                    this.add_link_type = 'Addressee';
                }
            },
            bccModel(val) {
                if (val) {
                    this.add_link_type = 'bcc_person';
                } else {
                    this.add_link_type = 'Addressee';
                }
            },
            emailForm: {
                handler() {
                    // const arrLen = this.emailForm.recipients_to.length;
                    // const emailReciMaxNum = 30;
                    // if (this.isSeparate === 1 && arrLen > emailReciMaxNum) {
                    //     this.emailForm.recipients_to.splice(-1, arrLen - emailReciMaxNum);
                    //     if (this.emailForm.recipients_to.length = emailReciMaxNum) {
                    //         this.$Message.warning(this.$t('mail.separateContactTip'));
                    //     }
                    // // this.$Message.warning("群发单显邮件仅支持最多发送30人");
                    // }
                    // 变化的时候，重新计算 所有接收人的列表
                    this.allRecipientsList = [...this.emailForm.recipients_to, ...this.emailForm.recipients_cc, ...this.emailForm.recipients_bcc];

                    // 调用不能为空校验
                    this.requiredItemsVerification();

                    // 获取到主题的变化
                    this.$emit('getModalSubject', this.emailForm.subject);
                },
                deep: true,
                immediate: true
            },
            set_time_form: {
                handler(val) {
                    if (val.local_time) {
                        this.isShowOnSeparate = true;
                        this.check_local_time();
                    } else {
                    // no empty
                    }
                },
                deep: true,
                immediate: false
            },
            defaultFileList: {
                handler(val) {
                    if (val && val.length) {
                        this.isFirstUpload = false;
                    }
                },
                deep: true,
                immediate: true
            },
            'emailForm.recipients_to': {
                async handler(val) {
                    /**
                     * @Description: 已回复标识关于发件人收件人的判断逻辑
                     * @author 杨娣
                     * @date 2019/11/18
                     */
                    let originalSenderAdd = null;
                    const rType = this.replyMailType;
                    if (this.currentBox === 'draftBox' && this.originalMailId && this.originalMailId !== '0') {
                        const address = await this.getOriginalMailDetail();
                        originalSenderAdd = this.getStandardEmail(address);
                    } else if (rType !== 'reedit' && rType !== 'forward') {
                        // 只有回复邮件时才判断是否需要已回复标识
                        originalSenderAdd = this.getStandardEmail(this.originalMailFrom);
                    }
                    if (this.emailForm.recipients_to.findIndex(item => item.includes(originalSenderAdd)) === -1) {
                        /* 如果原始邮件的发件人不在当前收件人列表中，则无已回复标识 */
                        this.emailForm.originalMailId = 0;
                    } else if (!this.originalMailId && this.originalMailId !== '0') {
                        /* 原始邮件点击回复，如果原始邮件的发件人在当前收件人列表中，则有已回复标识 */
                        if (rType !== 'forwardAsAttachment') {
                            this.emailForm.originalMailId = this.mailId;
                        } else {
                            this.emailForm.originalMailId = 0;
                        }
                    } else {
                        /* 原始邮件点击回复并且已存入草稿箱(前提是携带着已回复标识)，则从草稿箱再次编辑该邮件，
                     如果原始邮件的发件人在当前收件人列表中，则有已回复标识 */
                        this.emailForm.originalMailId = this.originalMailId;
                    }
                    /**
                     * @Description: 收件人placeholder显示逻辑
                     * @author wanghongzhu
                     * @date 2020/4/21
                     */
                    if (val.length > 0) {
                        this.placeholder = '';
                    } else if (val.length === 0 && this.isSeparate === 1) {
                        // 群发单显会进入此判断
                        this.placeholder = this.$t('mail.separateTip');
                    } else {
                        this.placeholder = this.$t('mail.writeLetter.bulkCopyHolder');
                    }
                    // ---------------cut off--------------
                    this.getAllContactsStatus();
                },
                immediate: true,
                deep: true
            },
            'emailForm.recipients_cc': {
                handler(val) {
                    this.getAllContactsStatus();
                },
                immediate: true,
                deep: true
            },
            'emailForm.recipients_bcc': {
                handler(val) {
                    this.getAllContactsStatus();
                },
                immediate: true,
                deep: true
            },
            newCompanyShow: {
                handler(val) {
                    if (!val) {
                        this.getAllContactsStatus();
                    }
                }
            },
            show_company_detail: {
                handler(val) {
                    if (!val) {
                        this.getAllContactsStatus();
                    }
                }
            },
            show_clue_detail: {
                handler(val) {
                    if (!val) {
                        this.getAllContactsStatus();
                    }
                }
            },
            value: {
                handler(val) {
                    this.set_time_form.time_difference = val;
                }
            },
            dragOver: {
                handler(val) {
                    if (!val) {
                        document.getElementById('self-upload-drag').style.display = 'none';
                    }
                }
            },
            isHidden: {
                handler(val) {
                    if (!val) {
                        const copyAttachment = localStorage.getItem('copyAttachment');
                        if (copyAttachment) {
                            this.showCopyAttachmentNotice();
                        }
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
            },

            // ai tool bar 
            'emailForm.subject': {
                handler(val) {
                    if (val.toLowerCase() === '/ai') {
                        this.$aiToolBar.init({
                            type: 'inputBoxSlash',
                            onConfirm: v => {
                                this.$aiToolBar.destroy()
                                this.emailForm.subject = v

                                const subInput = document.getElementById("mailSubject")
                                subInput.focus()
                                this.$nextTick(() => {
                                    subInput.setSelectionRange(0, v.length)
                                })
                            },
                            onAbort: () => {
                                this.emailForm.subject = ''
                            },
                        })
                    }else {
                        this.$aiToolBar.destroy()
                    }
                },
            },
        }
    };
</script>

<style lang="less">
    @import url(../../../mail/mail-home/components/write-mail/write-mail.less);
    .timeout-modal {
    .ivu-modal-body{
        overflow: visible;
    }
    .ivu-form-item{
        margin-bottom: 22px;
    }
    }
    .putAwayModal{
        .mail-tag-input{
            .tag-list{
                max-width: calc(~'100% - 100px');
            }
        }
    }
    .mail-tag-input{
    .tag-list{
        max-width: calc(~'100% - 160px');
    }
    .input-inside{
        width: 620px;
    }
    }
    .new-tab-write {
        position: absolute;
        right: 12px;
        top: 12px;
        font-size: 12px;
        color:#4285F4;
        cursor: pointer;
        z-index:10;
    &:hover{
         color: #2d63bc;
         text-decoration: underline;
     }
    }
    .separate {
        position: absolute;
        right: 96px;
        top: 12px;
        font-size: 12px;
        color: #4285F4;
        cursor: pointer;
        z-index: 10;
    &:hover{
         color: #2d63bc;
         text-decoration: underline;
     }

    }
    .separateInNewTab {
        position: absolute;
        right: 12px;
        top: 12px;
        font-size: 12px;
        color:#4285F4;
        cursor: pointer;
        z-index:10;
    &:hover{
         color: #2d63bc;
         text-decoration: underline;
     }
    }
    .pointevent{
        cursor: not-allowed;
        pointer-events: none;
    }
    .mail_label{
        overflow: hidden;
        float: right;

    .mail_label_drop_down {
        float: right;
    }
    .ivu-select-dropdown.ivu-select-dropdown {
        width: auto !important;
        transform-origin: right bottom !important;
        max-height: 570px;
        overflow: scroll;
    }
    .tag-color{
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-right: 4px;
        vertical-align: middle;
    }


    }
    .mail-label-position {
        margin-right: 70px;
    }
    .write_mail_tag_modal{
    .color{
        margin-top: 10px;
        margin-left: 125px;
        margin-bottom: 10px;
        position: relative;
    }
    .color>ul>li{
        width: 16px;
        height: 16px;
        color: #fff;
        float: left;
        cursor: pointer;
        margin-right: 25px;
    }
    }
    .write-mail-tags{
    .el-tag{
        border-radius: 11px;
        border-width: 0 !important;
    .tag-content,i{
        color: inherit !important;
    }
    & .ivu-icon-ios-close{
          display: none;
      }
    &:hover {
    & .ivu-icon-ios-close{
          display: inline-block;
      }
    }
    }
    }
    ._dialog_maxContent .el-dialog .el-dialog__body{
        max-height: 470px;
    }
    .writeMailModal {
        .el-dialog__footer {
            border-top:none;
        }
        .el-dialog__header {
            border-bottom:none;
        }
        .el-row .enter_drag .el-form {

            .putAwayModal{
                .mail-tag-input{
                    .form-label{
                        width: 0;
                    }
                }
            }

            .form-label{
                width: 58px;
            }
        }
    }
    .fromSelectModal{
        .el-input{
            .el-input__inner{
                border:0;
                padding:0;
                width:170px;
                padding-right: 26px;
                &:hover{
                     border-color: #fff;
                     box-shadow: 0 3px 0 0 #fff;
                    &:hover{
                         border-color: #fff;
                         box-shadow: 0 3px 0 0 #fff;
                     }
                }
                &:focus{
                     border-color: #fff;
                     box-shadow: 0 3px 0 0 #fff;
                    &:hover{
                         border-color: #fff;
                         box-shadow: 0 3px 0 0 #fff;
                     }
                }
            }
        }
    }
    .selfUpload-formItem{
        .database-box {
            display: flex;
            height: 38px;
            line-height: 38px;

            .database-item {
                font-size: 12px;
                color: #3B78DE;
                display: flex;
                align-items: center;
            }
        }

        .el-form-item__content{
            line-height: 10px;
            margin-bottom:5px;
            .attament{
                .file-list-item{
                    margin-bottom: 8px;
                    width: 300px;
                    min-width: unset;
                }
            }
        }
    }
    .mail-upload-placeholder{
        .el-upload--picture-card:hover, .el-upload:focus{
            border-color: #FFFFFF;
        }
        .el-upload--text{
            height:100%;
            width:100%;
            &:hover{
                 border:none;
                 color: rgba(0,0,0,0.30);
             }
            .el-upload-dragger{
                height:100%;
                width:100%;
                opacity: 0.6;
                background: #FFFFFF;
                border-color: #FFFFFF;
                &:hover{
                     border-color: #FFFFFF;
                }
            }
        }
    }
    .mail-upload-placeholder-text{
        height: 100%;
        font-family: PingFangSC-Semibold;
        font-size: 20px;
        color: rgba(0,0,0,0.6);
        letter-spacing: 0;
        display: flex;
        align-items: center;
        text-align: center;
        font-weight: 600;
        .mail-upload-placeholder-span{
            margin:0 auto;
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

<style lang="less" scoped>
    @import url(../../../mail/mail-home/components/write-mail/scoped.less);
    // 邮件翻译列表
    .translate-select {
        display: flex;
        justify-content: space-between;
        align-items: center;
        // width: 114px;
        line-height:34px;
        border: 1px solid #CBD6E2;
        border-radius: 4px;
        cursor:pointer;
        padding: 0 10px;
        box-sizing: border-box;
        font-size: 12px;
        color: rgba(0, 0, 0 ,0.8);
    }
    // 更改翻译语言的下拉列表得hover样式
    .el-dropdown-menu__item:not(.is-disabled):hover {
        background-color: #F3F4F7;
        color: #3B78DE;
    }
    // 右侧翻译框
    .translateBox {
        padding:20px;
        box-sizing:border-box;
        overflow-y: auto;

        .trans-div {
            display:flex;
            align-items:center;
            justify-content:space-between;
            font-size: 12px;
        }
    }
    .newTabClass{
        height: 100%;
    }
    .newTabCloseBtn{
        width: 80px;height: 25px;border-radius: 5px;background-color: #008BCA;text-align: center;line-height: 25px;font-size: 12px;
        background: linear-gradient(to bottom, #008ECD 5%, #0081BD 100%);
    a{
        color:#ffffff;
    }
    }
    .writeMail {
    & /deep/ .el-form-item {
                 margin-bottom: 0;
             }
    
    .fast-text-list {
    ul {
    li {
        border-bottom: none;
    }
    }
    }
    }
    /deep/ .el-tag{
               display: inline-block;
               max-width: 100%!important;
               height: 24px;
               line-height: 24px;
               padding: 0 8px;
               border: 1px solid #f4f5f8;
               border-radius: 11px;
               background: #f7f7f7;
               font-size: 12px;
               vertical-align: middle;
               white-space: normal;
               opacity: 1;
               overflow: hidden;
               cursor: pointer;
               margin-right: 6px;
    }

    .fullHeight-drawer {
    /deep/ .el-drawer {
               height: 100%;
               top: 0;
           }
    }
    .add-variable-dropdown {
        position: absolute;
        right: 0;
        top: 2px;
        font-size: 12px;
    }
    .putAwayModal {
        max-width: 100%;
        position: relative;
        height:48px;
        overflow-y: hidden;
        cursor: text;
        .putAwayCount{
            color: #3b78de;
            font-size: 12px;
            position: absolute;
            top:0;
            right: 20px;
            height: 48px;
            line-height: 48px;
        }
    }
    .edit_timing_btn{
        color:#3B78DE;
        margin-left:20px;
        cursor: pointer;
    &:hover{
         color: #2D63BC;
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

    // 输入邮箱地址组件
    .compose_mailInfo_item_first_row{
        display: flex;
        width: 100%;

        .compose_mailInfo_item_header{
            line-height: 38px;
            width: 84px
        }
    }

    .recipient_content{
        /deep/ .el-form-item__content{
            line-height: initial;
        }
    }
</style>
