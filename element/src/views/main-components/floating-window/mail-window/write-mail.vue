<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-13 15:26:50
 * @LastEditTime: 2019-08-15 18:06:06
 * @LastEditors: Please set LastEditors
 -->
<style lang="less">
    @import url('../../../mail/mail-home/components/write-mail/write-mail.less');
    .timeout-modal {
        .ivu-modal-body{
            overflow: visible;
        }
    }
    @inputHeight:42px;
    .writeMail{
        div{
            &.ivu-card-body{
            padding: 0 20px;
            }
        }
        .form-title-font{

            line-height: 44px;
        }
        .ivu-form-item{

            margin-bottom: 1px;
        }
        .ccbtn{
            margin-top: -@inputHeight;
            line-height: @inputHeight;
            float: right;
            &:hover .blue-font{
            color:#2d63bc;
            text-decoration: underline;
            }
        }
        .tag-input{
            .ivu-tag{
            margin: 0;
            }
            .form-label{
            line-height: @inputHeight !important;
            }
            .input-inside{
            height: @inputHeight;
            font-size: 14px;
            }
        }
        & .ivu-upload-drag {
            background: #fff;
            border-radius: 4px;
            border: 1px dashed #4285f4;
            text-align: center;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            -webkit-transition: border-color .2s ease;
            transition: border-color .2s ease;
        }
    }
    .float-window-write {
        .tox-tinymce {
            border-top: none;
        }
    }
    .btn-ghost {
        color: #FA8241;
        border-color: #FA8241;
        &:hover {
            color: #FA8241;
            border-color: #FA8241;
            background-color: #fff4ea;
        }
    }
</style>
<template>
    <div class="float-window-write">
        <div class="floating-window-header" style="margin:20px 20px 5px 20px">
            <div class="floating-window-header-title">{{$t('mail.writeLetter.name')}}</div>
            <div class="floating-window-fix-icon">
                <Icon custom="custom custom-modal-close" @click="handleCancel" style="margin-right:20px;"></Icon>
                <Icon custom="custom custom-float-window" v-if="!isFixed" @click.native="handleFixed(true)" size="16" />
                <Icon custom="custom custom-fixed-window" v-else @click.native="handleFixed(false)" size="16" />
            </div>
        </div>
        <div class="writeMail" @dragover.prevent="enter_drag">
            <Card
                :bordered="false"
                dis-hover
                v-if="!isSendMailSuccess"
                :style="{'height':`${scrollHeight}px`,'overflow':'auto'}">
                    <div v-loading="is_show" @dragover.prevent="enter_drag" @drop.prevent="dragOver = false" class="enter_drag">
                        <Form  v-model="emailForm">
                            <FormItem style="border-bottom:1px solid  #EAEAEA;" >
                                <Dropdown placement="bottom-start" trigger="click" @command="handleSender">
                                    <div class="form-title-font">
                                        {{$t('mail.writeLetter.sender')}}
                                        <Icon type="ios-arrow-down" size="16" style="color:#7B98B6;"></Icon>
                                        <span style="margin-left:8px;">{{emailForm.from}}</span>
                                    </div>
                                    <DropdownMenu slot="dropdown">
                                        <DropdownItem v-for="(item, index) in senders" :command="item.emailAddress" :key="index">
                                            {{item.emailAddress}}
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </FormItem>
                            <FormItem  style="margin-bottom: 0">
                                <div @click="add_link_type='Addressee'">
                                    <TagInput
                                        fromFlag="writeMailFloatWindow"
                                        :taglist.sync="emailForm.recipients_to"
                                        :title="$t('mail.writeLetter.recipients')"
                                        :type="'to'"
                                        :row="crmEmails"
                                        v-bind="$attrs"
                                        v-on="$listeners"
                                        @showCompany="showCompany"
                                        @showClue="showClue"
                                        @createClue="createClue"
                                        @handleClick="handleClick">
                                    </TagInput>
                                    <a class="ccbtn" href="javascript:void(0)" >
                                        <span class="blue-font" @click="ccModel=!ccModel;emailForm.recipients_cc=[];emailForm.recipients_bcc=[]">{{$t('mail.bcc_cc')}}</span>
                                        <!-- <span class="blue-font" @click="bccModel=!bccModel;emailForm.recipients_bcc=[]">{{bccModel?$t('mail.writeLetter.deleteBcc'):$t('mail.writeLetter.Bcc')}}</span> -->
                                    </a>
                                </div>
                            </FormItem>
                            <FormItem  v-show="ccModel">
                                <div @click="add_link_type='cc_person'">
                                    <TagInput
                                        fromFlag="writeMailFloatWindow"
                                        :taglist.sync="emailForm.recipients_cc"
                                        :title="$t('mail.writeLetter.recipientCc')"
                                        :type="'cc'"
                                        :row="crmEmails"
                                        v-bind="$attrs"
                                        v-on="$listeners"
                                        @showCompany="showCompany"
                                        @showClue="showClue"
                                        @createClue="createClue"
                                        @handleClick="handleClick">
                                    </TagInput>
                                </div>
                            </FormItem>
                            <FormItem v-show="bccModel">
                                <div @click="add_link_type='bcc_person'">
                                    <TagInput
                                        fromFlag="writeMailFloatWindow"
                                        :taglist.sync="emailForm.recipients_bcc"
                                        :title="$t('mail.writeLetter.recipientBcc')"
                                        :type="'bcc'"
                                        :row="crmEmails"
                                        v-bind="$attrs"
                                        v-on="$listeners"
                                        @showCompany="showCompany"
                                        @showClue="showClue"
                                        @createClue="createClue"
                                        @handleClick="handleClick">
                                    </TagInput>
                                </div>
                            </FormItem>
                            <FormItem  >
                                <div  class="form-title-font" style="border-bottom:1px solid #EAEAEA;margin-bottom: 0" @mouseup="onIputSelect">
                                    {{$t('mail.writeLetter.subject')}}&nbsp;
                                    <input class="subject-input" v-if="showSubjectInput" v-model="emailForm.subject" :placeholder="$t('aiToolBar.placeholder')" type="text" @blur="handleInputBlur">
                                </div>
                                <div>
                                    <self_upload
                                        ref="filesUpload"
                                        multiple
                                        type="drag"
                                        class="mail-upload"
                                        :action="action"
                                        :max-size="max_size"
                                        :ul_width="modal_width"
                                        :on-exceeded-size="handleSizeOverflow"
                                        :onPreview="handlePreviewAtta"
                                        style="margin-top: 10px;color: #FA8241"
                                        :defaultFileList="defaultFileList"
                                        @getUploadFilesList="getUploadFilesList"
                                        :style="{width:auto_width}">
                                        <div style="height: 30px; line-height: 30px;">
                                            <Tooltip :content="$t('mail.writeLetter.attSize25MTip')"
                                                    placement="top">
                                                <span class="write-mail-upload" @click="handleNormalUpload">{{$t('mail.writeLetter.uploadFiles')}}</span>
                                            </Tooltip>
                                            <span v-show="!dragOver && isContainsMenu('database')" style="color: rgba(0, 0, 0, .6);margin: 0 15px;"> | </span>
                                            <Tooltip :content="$t('mail.writeLetter.attSize25MTip')"
                                                    placement="top" v-show="!dragOver && isContainsMenu('database')">
                                                <span class="write-mail-upload" @click="handleDataBaseUpload">{{$t('mail.writeLetter.uploadFilesByDataBase')}}</span>
                                            </Tooltip>
                                        </div>
                                        <div style="padding: 20px 0;width: 100%;margin: 0 auto" v-show="dragOver">
                                            <Icon type="ios-cloud-upload" size="52" style="color: #FA8241"></Icon>
                                            <p>{{$t('mail.writeLetter.dragTip')}}</p>
                                        </div>
                                    </self_upload>
                                </div>
                            </FormItem>
                            <FormItem  style="margin-bottom: 10px">
                                <div id="splitEditor" v-show="!dragOver"></div>
                            </FormItem>
                            <FormItem style="margin-bottom: 10px">
                                <Row>
                                    <Col :span="24">
                                        <Checkbox v-model="emailForm.priority">
                                            {{$t('mail.writeLetter.urgent')}}
                                        </Checkbox>
                                        <Checkbox v-model="emailForm.receipt_flag">
                                            {{$t('mail.writeLetter.receipt')}}
                                        </Checkbox>
                                        <Checkbox v-model="emailForm.mailIsTrace">
                                            {{$t('mail.writeLetter.tracking')}}
                                        </Checkbox>
                                        <span @click="handle_modal_open">
                                            <Checkbox v-model="set_time_flag">
                                                {{$t('mail.set_timeout_mail')}}
                                            </Checkbox>
                                        </span>
                                    </Col>

                                </Row>
                                <Row v-if="set_time_flag && set_time_form.local_time">
                                    <Col :span="24">
                                        <p>
                                            {{$t('mail.writeLetter.will_send')}}：
                                        <span v-if="bj_time">
                                            <span style="color: #FA8241">{{bj_time}}</span>
                                            {{$t('mail.writeLetter.send')}}！
                                        </span>
                                        <span v-else>
                                            <span style="color: #FA8241">{{bjTime}}</span>
                                            {{$t('mail.writeLetter.send')}}！
                                            <span style="color: red;">{{$t('mail.setTimeOutTip')}}</span>
                                        </span>
                                        </p>
                                    </Col>
                                </Row>
                            </FormItem>
                            <FormItem style="margin-bottom: 0">
                                <Button type="primary" :loading="publishLoading" @click="clickButton = 'sendMail';handleSaveEmail(0)"

                                        style="margin:0 12px 10px 0" class="mail-send-float-window">{{$t('mail.writeLetter.send')}}
                                </Button>
                                <Button class="btn-ghost" @click="handlePreview"

                                        style="margin:0 12px 10px 0">
                                    {{$t('mail.writeLetter.preview')}}
                                </Button>
                                <Button class="btn-ghost" :loading="draftLoading" @click="clickButton = 'saveMail';$store.commit('setSaveWithWhich', 'writeMailSave');handleSaveEmail(1, false)"

                                        style="margin:0 12px 10px 0">{{$t('mail.writeLetter.saveDraft')}}
                                </Button>

                                <Button class="btn-ghost" style="margin:0 12px 10px 0"
                                        v-if="(bj_time || bjTime) && set_time_flag" @click="handleUpdateTime">
                                    {{$t('mail.writeLetter.update_sendTime')}}
                                </Button>

                                <Button class="btn-ghost" @click="handleCancel" style="margin:0 0 10px ">
                                    {{$t('cancel')}}
                                </Button>
                            </FormItem>
                        </Form>
                    </div>
            </Card>
            <AddContact :visible.sync="contactsModel" :addContactList.sync="addContactList"
                        v-if="contactsModel"></AddContact>
            <Modal :title="$t('mail.writeLetter.preview')"
                    :visible.sync="previewModel"
                    :class="`mail-preview-model ${getSpan}`"
                    :transition-names="['ease-in','fade-in-enter']"
                    :styles="{width:`${modal_width}px`}"
                    :modal-append-to-body="false"
                    :close-on-click-modal="false">
                <div class="subject">{{emailForm.subject?emailForm.subject:$t('mail.writeLetter.noSubject')}}</div>
                <ul class="detailHead">
                    <li v-if="emailForm.from"><span class="clumsName">{{$t('mail.writeLetter.sender')}}</span>{{emailForm.from}}
                    </li>
                    <li><span class="clumsName">{{$t('mail.writeLetter.time')}}</span>{{nowTime}}</li>
                    <li v-if="emailForm.recipients_to.length">
                        <span class="clumsName">{{$t('mail.writeLetter.recipients')}}</span>{{emailForm.recipients_to.join("，")}}
                    </li>
                    <li v-if="emailForm.recipients_cc.length">
                        <span class="clumsName">{{$t('mail.writeLetter.recipientCc')}}</span>{{emailForm.recipients_cc.join("，")}}
                    </li>
                    <li v-if="emailForm.recipients_bcc.length">
                        <span class="clumsName">{{$t('mail.writeLetter.recipientBcc')}}</span>{{emailForm.recipients_bcc.join("，")}}
                    </li>
                    <li v-if="filesPreview.length">
                        <span class="clumsName">{{$t('mail.writeLetter.attachment')}}</span>{{filesPreview.length}}{{ $t('b2b.b2b.unit') }}
                        <UploadList :files='filesPreview'></UploadList>
                    </li>
                </ul>
                <div class="detailContent" v-html="mailContent"></div>
                <div slot="footer">
                    <Button @click="previewModel = false">{{$t('close')}}</Button>
                    <Button type="primary" @click="previewModel = false">{{$t('confirm')}}</Button>
                </div>
            </Modal>
            <Modal
                    :visible.sync="set_timeout_modal"
                    :title="$t('mail.set_timeout_mail')"
                    :modal-append-to-body="false"
                    :close-on-click-modal="false"
                    :show-close="false"
                    class-name="vertical-center-modal timeout-modal"
                    :styles="{top: '-60px'}">
                <div style="width: 80%;margin: 0 auto">
                    <p style="padding-left: 80px" v-if="bj_time">
                        {{$t('mail.writeLetter.will_send')}}：<span style="color: #FA8241">{{bj_time}}</span>{{$t('mail.writeLetter.send')}}！
                    </p>
                </div>
                <Form :model="set_time_form" :rules="rule_time_form" label-width="80"
                    style="width: 80%;margin: 10px auto" ref="set_time_form">
                    <FormItem :label="$t('facebook.timeZone')">
                        <Select v-model="value">
                            <Option v-for="item in time_zone" :value="item.value" :key="item.value" :label="item.label">
                            </Option>
                        </Select>
                    </FormItem>
                    <FormItem :label="$t('mail.local_time')" prop="local_time">
                        <DatePicker :editable="false" type="datetime" placeholder="Select date and time" style="width: 100%"
                                    v-model="set_time_form.local_time"></DatePicker>
                    </FormItem>
                </Form>
                <div v-if="local_time_flag" style="box-sizing:border-box;color: red;padding-left: 125px;margin-top: -15px;">
                转换后的北京时间至少大于现在北京时间30分钟！
                </div>
                <div slot="footer">
                    <Button @click="handleCancelUpdate">{{$t('cancel')}}</Button>
                    <Button type="primary" :disabled="local_time_flag || !set_time_form.local_time" @click="set_timeout_modal=false">{{$t('confirm')}}</Button>
                </div>
            </Modal>
            <Upload
                    ref="imageUpload"
                    :on-success="insertImage"
                    :action="action"
                    accept=".png,.jpeg,.jpg,.gif,.bmp,.ico"
                    style="display:none">
            </Upload>
            <CRMDrawerList
                :visible.sync="show_company_detail"
                :id.sync="companyId"
                :type="type_company"
                :originalType="type_company"
                :corp_columns_authorized="corp_columns_authorized"
                :contact_columns_authorized="contact_columns_authorized"
                :inquiry_columns_authorized="inquiry_columns_authorized"
                :selectOptions="selectOptions">
            </CRMDrawerList>

            <ClueDrawerList
                :visible.sync="show_clue_detail"
                :type="type_clue"
                :clueId.sync="clueId"
                :listType="2"
                :corp_columns_authorized="corp_columns_authorized"
                :contact_columns_authorized="contact_columns_authorized"
                :inquiry_columns_authorized="inquiry_columns_authorized"
                :selectOptions="selectOptions">
            </ClueDrawerList>

            <!--创建客户---产品要求修改为邮件录入线索，此代码注释。杨娣 2021/03/05-->
            <!--<NewCompany
                :visible.sync="newCompanyShow"
                :mailAddress.sync="mailAddress"
                :salesList="salesList"
                type="mail"
                :corp_columns_authorized="corp_columns_authorized"
                :contact_columns_authorized="contact_columns_authorized"
                :inquiry_columns_authorized="inquiry_columns_authorized"
                :selectOptions="selectOptions">
            </NewCompany>-->
            <!-- 右侧弹窗 -->
            <littleDrawer
                v-if="littleDrawerVisible"
                :visible.sync="littleDrawerVisible"
                :id="currentMailId"
                :currAccountInfo="currentMailInfo"
                :selectOptions="selectOptions"
                :corp_columns_authorized="corp_columns_authorized"
                :inquiry_columns_authorized="inquiry_columns_authorized"
                :contact_columns_authorized="contact_columns_authorized"
                type="journeyDetail"
                from="mail"
                @littleDrawerHidden="littleDrawerHidden"
                @updateStatus="updateStatus"
                @updateInquiryStatus="updateInquiryStatus"
                @handleClick="handleClick"
            ></littleDrawer>
        </div>
        <Modal
                :visible.sync="closeModel"
                :modal-append-to-body="false"
                :close-on-click-modal="false"
                width="360px">
            <p slot="title">
                <span>{{$t('mail.leaveConfirm')}}</span>
            </p>
            <div >
                <p>{{$t('mail.leaveTip')}}</p>
            </div>
            <div slot="footer">
                <Button class="btn-ghost" @click="closeModel = false">{{$t('cancel')}}</Button>
                <Button class="btn-ghost" @click="handleDraftSave(0)">{{$t('mail.noSave')}}</Button>
                <Button type="primary" @click="handleDraftSave(1)" :loading="draftLoading">{{$t('mail.saveDraft')}}</Button>
            </div>
        </Modal>
        <!-- 内容含有附件或attachment 但实际没有附件提示 -->
        <Modal
            :visible.sync="noAttachmentModal"
            :modal-append-to-body="false"
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
  </div>
</template>
<script>
    import Cookies from 'js-cookie';
    import { env } from '../../../../../build/config';
    import tinymce from 'tinymce';
    import 'tinymce/themes/silver';
    /** 解决tinymce Firefox浏览器兼容问题 */
    import 'tinymce/plugins/paste';
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
    import AddContact from '@/views/mail/mail-home/components/write-mail/Modal/address_book_modal.vue';
    import UploadList from '@/views/mail/mail-home/components/write-mail/upload-list';
    import self_upload from '@/views/mail/mail-home/components/write-mail/self-upload.vue';
    import TagInput from '../../tag-input/tag-input.vue';
    // import NewCompany from '@/views/crm/Detail/Components/Modal/fixed-modal-form/create-company';
    import CRMDrawerList from '@/views/crm/Detail/CRMDrawerList';
    import ClueDrawerList from '@/views/clue-manage/Detail/ClueDrawerList';
    import littleDrawer from '@/views/main-components/little-drawer/little-drawer.vue';
    import writeApi from '@/api/mail/write';
    import * as qiniu from 'qiniu-js';
    import { mapState, mapGetters } from 'vuex';
    import { triggerGtag } from '@/utils/base';

    // ai tool bar
    import { getInputSelectedText, coverText, insertText } from '@/views/ai-toolbar/utils/tools'

    export default {
        name: 'WriteMail',
        components: {
            AddContact,
            UploadList,
            self_upload: self_upload,
            TagInput,
            // NewCompany,
            CRMDrawerList,
            ClueDrawerList,
            littleDrawer
        },
        props: [
            'selectedMailId',
            'selectedMailBoxType',
            'replyMailType',
            'mailEdit',
            'isFixed',
            'view',
            'needLeaveModal',
            'corp_columns_authorized',
            'contact_columns_authorized',
            'inquiry_columns_authorized',
            'selectOptions'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                qiniuHttp: 'qiniuHttp',
                qiniuUrl: 'qiniuUrl',
                window_width: 'window_width',
                window_height: 'window_height',
                saveWithWhich: state => state.mail.saveWithWhich,
                // 写信页面富文本编辑器 content_style 配置中会影响邮件内容渲染的样式
                tinymce_contentStyle: state => state.mail.tinymce_contentStyle,
                sendMailUrl: state => state.mail.sendMailUrl
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            modal_width() {
                /* return parseInt((document.body.clientWidth - 300) * 0.8 - 40) */
                return parseInt((document.body.clientWidth - 300) * 0.3 + 47);
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
                }
            },
            auto_width() {
                if (this.dragOver) {
                    return '100%';
                } else {
                    return '200px';
                }
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
                return 'newTabClass';
            },
            scrollHeight() {
                return parseInt(this.window_height) - 36;
            }
        },
        data() {
            return {
                value: 0,
                closeModel: false,
                isSaveDraft: true,
                no_settime: false, // 注：之前的逻辑中初始值为true，会导致分屏保存不了定时邮件，与产品确认，取消此逻辑。
                // 前端处理方案为：由于不清楚为什么原本的逻辑设计，相关逻辑暂不更改，只将此处初始值更改为false
                draftLoading: false,
                isSendMailSuccess: false,
                is_show: true,
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
                set_timeout_modal: false,
                // 收件人 Addressee  抄送人 cc_person 密送人 bcc_person
                add_link_type: 'Addressee',
                dragOver: false,
                // window_width: document.documentElement.clientWidth,
                accountId: null, // 发件人账号ID
                senders: [], // 发件人账号列表
                senderIndex: null, // 发件人列表索引
                contacts: [], // 联系人列表
                mailSignAccountList: [], // 发件账号对应不同的默认签名
                signatures: [], // 签名列表
                signature: '', // 写信使用的签名
                signatureNew: '', // 回复等使用的签名
                action: '', // 上传图片url
                mailContent: '', // 邮件内容
                emailForm: {
                    from: '', // 发件人账号
                    recipients_to: [], // 收件人
                    recipients_cc: [], // 抄送人
                    recipients_bcc: [], // 密送人
                    subject: '', // 主题
                    mailSignIndex: 0, // 邮件签名索引
                    priority: false, // 紧急
                    receipt_flag: false, // 回执
                    mailIsTrace: false, // 追踪邮件
                    mailTimeFlag: false, // 定时邮件
                    bjTime: null// 定时邮件
                },
                requestSerialCode: '', // 发送邮件时生成唯一Key,防止发信接口超时多次发送
                bjTime: null,
                ccModel: false, // 显示抄送人
                bccModel: false, // 显示密送人
                contactsModel: false, // 显示联系人选框
                emitModalId: '', //
                addContactList: [], // 添加联系人列表
                inputContact: '', //
                publishLoading: false, // 发布中
                previewModel: false, // 显示预览框
                saveMailCrmRelationConditions: [], //
                filesPreview: [], // 附件预览
                signatureIds: [], // 新邮件、回复邮件、转发邮件签名id
                signatureId: 0, // 签名id
                defaultSendAccount: '', // 默认发件人
                signChangeCount: 0, // 签名切换计数
                leaveModal: false, // 离开当前页面模态框
                defaultFileList: [],
                uptoken: '',

                local_time_flag: false, // 当地时间转换后的北京时间是否小于当前北京时间30分钟
                isFirstUpload: true, // 是否是第一次上传附件
                autoSaveDraftTimer: null, // 自动保存草稿定时器标志
                autoSaveDraftFlag: false, // 自动保存草稿的标志
                emailId: '', // 自动保存的草稿邮件id

                showSubjectInput: true,
                updateSendTimeFlag: false, // 修改发送时间的标志
                lastSetTimeForm: {}, // 修改发送时间之前的定时信息

                crmEmails: [],

                show_company_detail: false,
                type_company: 'customer',
                companyId: 0,
                show_clue_detail: false,
                type_clue: '',
                clueId: '',
                cancelFunc: null, // 取消上一次请求
                emailCount: 0, // 当前写信页面的收件邮箱地址总数
                defaultMailSetting: {
                    fontFamilyValue: 'arial,helvetica,sans-serif', // 默认写信字体
                    fontSizeValue: '16px', // 默认写信字号
                    fontColorValue: '#000' // 默认写信颜色
                },
                clickButton: '', // 区分点击的是发送还是存草稿(定时邮件需要区分开)
                max_size: 25600,
                // 新增弹窗相关
                mailAddress: '', // 创建新客户的邮箱
                currentMailId: '',
                currentMailInfo: {},
                littleDrawerVisible: false,
                noAttachmentReg: new RegExp('附件|attachment', 'i'),
                noAttachmentModal: false, // 内容有附件，但没有上传提示
                noAttachmentData: null, // 存储下邮件form内容
                originalMailId: '', // 原始邮件id
                originalMailFrom: '', // 原始邮件的发件人
                original_recipients_cc: [], // 原邮件回填的抄送人
                original_recipients_bcc: [], // 原邮件回填的密送人
                defaultCc: [], // 设置默认抄送人
                defaultBcc: [] // 设置默认密送人
            };
        },
        created() {
            this.requestSerialCode = `${this.enterpriseId}${this.userId}${new Date().getTime()}`;
            // this.defaultFormValidate = Object.assign({},this.formValidate);
            this.getWriteMailDefault();
        },
        methods: {
            // 获取写信设置相关
            getWriteMailDefault() {
                const params = {
                    createUserId: this.userId
                };
                if (['replyCurrent', 'replyAll', 'replyWithAttachment', 'forwardAsAttachment', 'forward', 'reedit'].includes(this.replyMailType) && this.selectedMailId) {
                    params.originalMailId = this.selectedMailId;
                    params.originalCreateUserId = this.userId;
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
            /** 获取主题光标位置 */
            handleInputBlur() {
                // 主题长度限制
                if (this.emailForm.subject.length > 500) {
                    return this.$Message.error(this.$t('mail.writeLetter.subjectLimit'));
                }
            },
            /** 添加写信默认设置 */
            addDefaultSetting() {
                util.ajaxJson({
                    url: '/crm/userconfig/add',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        key: 'getDefaultSetting',
                        value: JSON.stringify(this.defaultMailSetting)
                    }
                }).then(res => {
                });
            },
            handleWindowClose(view) {
                this.$emit('changeView', view);
            },
            handleFixed(val) {
                this.$emit('changeFixState', val);
            },
            openNewTab() {
                // 如果前往新窗口写信的时候是新建邮件，则清空相关cookie
                if (this.whereToWrite === 'new') {
                    Cookies.remove('selectedMailId');
                    Cookies.remove('selectedMailBoxType');
                    Cookies.remove('replyMailType');
                    Cookies.set('mailEdit', false);
                }
                window.open('#/writeMail', '_blank');
            },
            check_local_time(rule, value, callback) {
                if ((new Date(this.bj_time_flag).getTime() - new Date().getTime()) > 1800000) {
                    /* callback() */
                    this.local_time_flag = false;
                } else {
                    /* callback(new Error('转换后的北京时间至少大于现在北京时间30分钟！')) */
                    this.local_time_flag = true;
                }
            },
            handle_modal_open() {
                if (!this.set_time_flag) {
                    this.updateSendTimeFlag = false;
                    this.set_timeout_modal = true;
                    this.local_time_flag = false;
                }
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
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)));
                    }
                }
                return fmt;
            },
            handle_link_man(row) {
                let is_add = true;
                let startIndex = -1;
                let endIndex = -1;
                /**
                 * @Description: 邮箱收件人去重逻辑修改为只要邮箱地址部分重复，即判为同一个邮箱，默认保留第一个
                 *                 如客户a<xhl@163.com>， 客户b<xhl@163.com>，xhl@163.com为重复邮箱，保留邮箱--客户a<xhl@163.com>
                 * @author 杨娣
                 * @date 2019/10/15
                 */
                switch (this.add_link_type) {
                    case 'cc_person':
                        for (let item of this.emailForm.recipients_cc) {
                            /* if (item === row.mailRecipientAddress) {
                          is_add = false
                      } */
                            startIndex = item.indexOf('<');
                            endIndex = item.indexOf('>');
                            if (startIndex !== -1 && endIndex !== -1) {
                                item = item.substring(startIndex + 1, endIndex);
                            }
                            if (item === row.mailRecipientAddress) {
                                is_add = false;
                            }
                        }
                        if (is_add) {
                            this.emailForm.recipients_cc.push(row.mailRecipientAddress);
                        }
                        break;
                    case 'bcc_person':
                        for (let item of this.emailForm.recipients_bcc) {
                            /* if (item === row.mailRecipientAddress) {
                          is_add = false
                      } */
                            startIndex = item.indexOf('<');
                            endIndex = item.indexOf('>');
                            if (startIndex !== -1 && endIndex !== -1) {
                                item = item.substring(startIndex + 1, endIndex);
                            }
                            if (item === row.mailRecipientAddress) {
                                is_add = false;
                            }
                        }
                        if (is_add) {
                            this.emailForm.recipients_bcc.push(row.mailRecipientAddress);
                        }
                        break;
                    case 'Addressee':
                        for (let item of this.emailForm.recipients_to) {
                            /* if (item === row.mailRecipientAddress) {
                          is_add = false
                      } */
                            startIndex = item.indexOf('<');
                            endIndex = item.indexOf('>');
                            if (startIndex !== -1 && endIndex !== -1) {
                                item = item.substring(startIndex + 1, endIndex);
                            }
                            if (item === row.mailRecipientAddress) {
                                is_add = false;
                            }
                        }
                        if (is_add) {
                            this.emailForm.recipients_to.push(row.mailRecipientAddress);
                        }
                        break;
                }
            },
            // 拖拽处理
            enter_drag(e) {
                if (e.target.className === 'ivu-form-item-content' ||
                    e.target.className === 'ivu-select-input' ||
                    e.target.className === 'ivu-select-selection' ||
                    e.target.className === 'ivu-icon ivu-icon-plus-circled' ||
                    e.target.className === 'ivu-form ivu-form-label-right' ||
                    e.target.className === 'ivu-select-placeholder' ||
                    e.target.className === 'ivu-input' ||
                    e.target.className === 'ivu-col ivu-col-span-16' ||
                    e.target.className === 'ivu-upload' ||
                    e.target.className === 'ivu-upload ivu-upload-drag' ||
                    e.target.className === 'ivu-icon ivu-icon-ios-cloud-upload' ||
                    e.target.className === 'ivu-upload ivu-upload-drag ivu-upload-dragOver' ||
                    e.target.className === 'enter_drag' ||
                    e.target.className === 'addContacts' ||
                    e.target.className === 'ivu-icon ivu-icon-ios-cloud-upload-outline' ||
                    !(e.target.className)
                ) {
                    this.dragOver = true;
                } else {
                    this.dragOver = false;
                }
            },
            /** 上传的附件超过30M */
            handleSizeOverflow() {
                this.$Message.error(this.$t('mail.writeLetter.attachmentMaxTip'));
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
                            let totalSize = 0;
                            fileList.forEach(item => {
                                totalSize += this.$refs.filesUpload.getSizeNumber(item.size);
                            });
                            if (totalSize >= this.max_size * 1024) {
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
                this.defaultSignBackfill(true, this.mailSignAccountList);
            },
            /* 页面表单初始化 */
            initPage() {
                const id = this.selectedMailId;
                const type = this.selectedMailBoxType;
                const rType = this.replyMailType;
                const mailEdit = this.mailEdit;
                const vm = this;

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

                if (id && mailEdit) {
                    this.$store.commit('setMailEdit', false);
                    util.ajaxMailJson({
                        url: '/mail/mailDetail',
                        method: 'get',
                        params: {
                            userId: this.userId,
                            orgId: this.enterpriseId,
                            id
                        }
                    }).then(response => {
                        if (response.data.code === 1) {
                            const data = response.data.data;
                            // 去掉可能存在的, 邮件开头加的 iframe head style
                            if (data.content && data.content.startsWith(this.tinymce_contentStyle)) {
                                data.content.replace(this.tinymce_contentStyle, '');
                            }

                            const recipients_to = data.recipients_to[0] === '[' && data.recipients_to[data.recipients_to.length - 1] === ']' ? (JSON.parse(data.recipients_to).length === 1 && !JSON.parse(data.recipients_to)[0] ? [] : JSON.parse(data.recipients_to)) : data.recipients_to ? data.recipients_to.split(',') : [];
                            const recipients_cc = data.recipients_cc[0] === '[' && data.recipients_cc[data.recipients_cc.length - 1] === ']' ? (JSON.parse(data.recipients_cc).length === 1 && !JSON.parse(data.recipients_cc)[0] ? [] : JSON.parse(data.recipients_cc)) : data.recipients_cc ? data.recipients_cc.split(',') : [];
                            const recipients_bcc = data.recipients_bcc[0] === '[' && data.recipients_bcc[data.recipients_bcc.length - 1] === ']' ? (JSON.parse(data.recipients_bcc).length === 1 && !JSON.parse(data.recipients_bcc)[0] ? [] : JSON.parse(data.recipients_bcc)) : data.recipients_bcc ? data.recipients_bcc.split(',') : [];
                            vm.contacts = [...new Set(recipients_to.concat(recipients_cc).concat(recipients_bcc))];
                            vm.originalMailFrom = data.from;
                            /**
                             * @Description: 需要把id=signature的标识去掉，以免影响回复/转发/再次编辑时的签名切换逻辑判断
                             * @author 杨娣
                             * @date 2020/7/7
                             */
                            data.content = data.content.replace(/id="signature"/ig, '');
                            vm.original_recipients_cc.push(...recipients_cc);
                            vm.original_recipients_bcc.push(...recipients_bcc);
                            vm.set_time_flag = (data.mailTimeFlag === 1);
                            if (data.timeZone) vm.set_time_form.time_difference = parseInt(data.timeZone);
                            if (data.timeZoneTime) vm.set_time_form.local_time = new Date(data.timeZoneTime);
                            if (data.bjTime) vm.bjTime = this.dateFormat('yyyy-MM-dd hh:mm:ss', data.bjTime);
                            vm.is_show = false;
                            /*
                        mailSignIndex: 0,//邮件签名索引
                        priority: false,//紧急
                        receipt_flag: false,//回执
                        */
                            // if (data.mailSignId) {
                            //     vm.emailForm.mailSignIndex = data.mailSignId;
                            // }
                            if (type === 'draftBox') {
                                if (data.mailReceiptFlag) {
                                    vm.emailForm.receipt_flag = true;
                                }
                                /* 1(High):紧急  3:普通(Normal)  5:低(Low) */
                                if (data.mailUrgentFlag === 1) {
                                    vm.emailForm.priority = true;
                                }
                                vm.emailForm.from = '';
                                vm.emailForm.originalMailId = data.originalMailId;
                                vm.originalMailId = data.originalMailId;
                                if (data.from) {
                                    for (const item of vm.senders) {
                                        if (data.from.replace(/\<|>/g, '') === item.emailAddress) {
                                            vm.emailForm.from = item.emailAddress;
                                        }
                                    }
                                }
                                vm.emailForm.recipients_to.push(...recipients_to);
                            }
                            if (type === 'unreadBox' || type === 'inbox' || type === 'sentBox' || type === 'customerBox') {
                                vm.emailForm.from = vm.defaultSendAccount;
                                // 显示默认发件人人,跟接收人无关
                                if (rType.indexOf('reply') !== -1) {
                                    vm.emailForm.recipients_to = data.replyTo && data.replyTo[0] === '[' && data.replyTo[data.replyTo.length - 1] === ']' ? (JSON.parse(data.replyTo).length === 1 && !JSON.parse(data.replyTo)[0] ? [data.from] : JSON.parse(data.replyTo)) : data.replyTo ? data.replyTo.split(',') : [data.from];
                                }
                                if (!vm.contacts.includes(data.from)) {
                                    vm.contacts.push(data.from);
                                }
                                if (rType === 'replyAll' || rType === 'replyWithAttachment') {
                                    /* 去除当前写信页面选中的发件人 */
                                    let exceptedArr = recipients_to.filter(item => {
                                        return vm.emailForm.from !== this.getStandardEmail(item);
                                    });
                                    /* 如果原始邮件发件人不等于邮件归属邮箱，则需要从收件人中去除归属邮箱 */
                                    if (data.accountId !== this.getStandardEmail(data.from)) {
                                        exceptedArr = exceptedArr.filter(item => {
                                            return data.accountId !== this.getStandardEmail(item);
                                        });
                                    }
                                    vm.emailForm.recipients_to.push(...exceptedArr);
                                    this.updateRecipients();
                                    /* 抄送人/密送人中直接去除邮件归属邮箱 */
                                    vm.original_recipients_cc = vm.original_recipients_cc.filter(item => {
                                        return data.accountId !== this.getStandardEmail(item);
                                    });
                                    vm.original_recipients_bcc = vm.original_recipients_bcc.filter(item => {
                                        return data.accountId !== this.getStandardEmail(item);
                                    });
                                }
                            }
                            // vm.$refs.filesUpload.fileList = data.mailAttachmentList;
                            const relayContent = () => {
                                vm.emailForm.originalMailId = id;
                                data.content = `<div id="relayPlaceholder" style="line-height: 32px;font-size:14px ;font-family: arial,helvetica,sans-serif;color:#333;">
                                -------- Reply message --------<br>
                                From: ${data.from}<br>
                                Send Time: ${data.sendTime}<br>
                                To: ${data.recipients_to[0] === '[' && data.recipients_to[data.recipients_to.length - 1] === ']' ? JSON.parse(data.recipients_to).join(',') : data.recipients_to}<br>
                                ${data.recipients_cc[0] === '[' && data.recipients_cc[data.recipients_cc.length - 1] === ']' ? (!JSON.parse(data.recipients_cc).length ? '' : `Cc: ${JSON.parse(data.recipients_cc).join(',')}<br>`) : (data.recipients_cc ? `Cc: ${data.recipients_cc}<br>` : '')}
                                Subject: ${data.subject}<br>
                                <blockquote style='margin:0;border:none;padding:0;'>
                                ${data.content}</blockquote></div>`;
                            };
                            console.log('rType ================== rType:', rType);
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

                            vm.ccModel = Boolean(vm.emailForm.recipients_cc.length);
                            vm.bccModel = Boolean(vm.emailForm.recipients_bcc.length);
                            // vm.addEmail();
                            /**
                             * @Description: 邮件追踪由后端处理，前端注释相关代码，只在发送邮件时判断是否携带追踪标识即可
                             * @author 杨娣
                             * @date 2020/6/8
                             */
                            /* 去掉追踪代码 */
                            // data.content = data.content.replace(/<img\ssrc="http:\/\/[\s\S]*?\.leadscloud\.com\/mail\/emailTraceInfo[\s\S]*?style="display:none;">/g, '');
                            vm.mailContent = data.content.replace(/<style(([\s\S])*?)<\/style>/g, '');
                            tinymce.activeEditor.setContent(vm.mailContent);
                            // vm.signatures.forEach((item, index) => {
                            //     if (item.id == vm.signatureId) {
                            //         vm.handleSignChange(index);
                            //     }
                            // });
                            if (type === 'draftBox' || rType === 'replyWithAttachment' || rType === 'forward' || rType === 'reedit') {
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
                                            // size: 0,
                                            status: 'finished',
                                            uid: item.id
                                        };
                                    });
                                    this.defaultFileList = fileList;
                                    let fileTotalSize = 0;
                                    vm.defaultFileList.forEach(item => {
                                        fileTotalSize += this.$refs.filesUpload.getSizeNumber(item.size);
                                    });
                                    if (fileTotalSize >= this.max_size * 1024) {
                                        this.$Message.warning(`${this.$t('mail.uploadFilesOversizeTip')}${this.max_size / 1024}M`);
                                    }
                                }
                            // vm.$refs.filesUpload.fileList = fileList;
                            }
                            this.getMailSignsGeneralSetting();
                        } else {
                            vm.$Message.error(vm.$t('mail.writeLetter.mailErrorTip'));
                        }
                    }).catch(() => {
                        vm.$Message.warning({
                            duration: 3000,
                            message: this.$t('mail.getFailAndRetryLater')
                        });
                    });
                } else {
                    vm.is_show = false;
                    this.getMailSignsGeneralSetting();
                }
            },
            /* 签名切换控制 */
            handleSignChange(index) {
                let content = tinymce.activeEditor.getContent();
                // const type = this.selectedMailBoxType;
                const rType = this.replyMailType;
                // 添加style目的：避免全局默认字体/字号/颜色设置覆盖签名样式
                const signatureNew = `<div id="signatureNew" style="clear:both;">${
                    this.signatures[index].signContent
                }</div>`;
                const signature = `<div id="signature" style="clear:both;">${
                    this.signatures[index].signContent
                }</div>`;
                this.signatureNew = this.signatures[index].signContent.length ? signatureNew : '';
                this.signature = this.signatures[index].signContent.length ? signature : '';
                if (this.signChangeCount === 0) {
                    if (!rType) {
                        content = `${content}<div><br></div><div><br></div>${this.signature}`;
                    } else if (rType === 'reedit') {
                        content = `${content}${this.signatureNew}`;
                    } else {
                        content = `<div><br></div><div><br></div>${this.signatureNew}${content}`;
                    }
                    tinymce.activeEditor.setContent(content);
                    this.signChangeCount = this.signChangeCount + 1;
                } else {
                    if (rType === 'replyCurrent' || rType === 'replyAll' || rType === 'replyWithAttachment') {
                        const index = content.indexOf('<div id="relayPlaceholder"');
                        const strNew = content.substring(0, index);
                        const defaultContent = content.substring(index);
                        let myContent = strNew.split('<div id="signatureNew"')[0];
                        myContent = myContent + this.signatureNew;
                        this.mailContent = myContent + defaultContent;
                        tinymce.activeEditor.setContent(myContent + defaultContent);
                        this.signChangeCount = this.signChangeCount + 1;
                    } else if (rType === 'forward') {
                        const index = content.indexOf('<div id="forwardPlaceholder"');
                        const strNew = content.substring(0, index);
                        const defaultContent = content.substring(index);
                        let myContent = strNew.split('<div id="signatureNew"')[0];
                        myContent = myContent + this.signatureNew;
                        this.mailContent = myContent + defaultContent;
                        tinymce.activeEditor.setContent(myContent + defaultContent);
                        this.signChangeCount = this.signChangeCount + 1;
                    } else {
                        content = content.split('<div id="signature"')[0];
                        this.mailContent = content + this.signature;
                        tinymce.activeEditor.setContent(content + this.signature);
                        this.signChangeCount = this.signChangeCount + 1;
                    }
                }
                /**
                 * @Description: 将默认设置添加到行内样式上
                 * @author wanghongzhu
                 * @date 2020/4/27
                 */
                tinymce.activeEditor.setContent(`<div style="font-famliy:${this.defaultMailSetting.fontFamilyValue};font-size:${this.defaultMailSetting.fontSizeValue};color:${this.defaultMailSetting.fontColorValue};">${tinymce.activeEditor.getContent()}</div>`);
                this.mailContent = tinymce.activeEditor.getContent();
            },
            /**
             * 签名的回填逻辑
             * 1、新邮件/回复/转发优先回填默认签名
             * 2、草稿箱编辑优先回填保存的签名，切换发件账号之后不再记录保存的签名统一回填默认邮箱
            */
            defaultSignBackfill(changeSenderFlag, signList) {
                const rType = this.replyMailType;
                signList.forEach((item) => {
                    if (item.emailAddress === this.emailForm.from) {
                        this.signatureIds = [item.newMailSignId, item.replyMailSignId, item.relayMailSignId];
                        if (['replyCurrent', 'replyAll', 'replyWithAttachment'].includes(rType)) {
                            this.signatureId = item.replyMailSignId;
                        } else if (['forwardAsAttachment', 'forward'].includes(rType)) {
                            this.signatureId = item.relayMailSignId;
                        } else if (rType === 'reedit') {
                            this.signatureId = '-1';
                        } else {
                            this.signatureId = item.newMailSignId;
                        }
                    }
                });
                /**
                 *  有详情或草稿箱显示默认返回签名
                 * 切换发件人替换掉草稿回填签名
                */
                this.signatures.forEach((item, index) => {
                    if (Number(item.id) === Number(this.signatureId)) {
                        this.emailForm.mailSignIndex = index;
                    }
                });
                this.handleSignChange(this.emailForm.mailSignIndex);
            },
            /* 通过用户ID获取签名列表 并 初始化签名  */
            getMailSignsGeneralSetting() {
                const rType = this.replyMailType;
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
                        this.defaultSignBackfill(false, response.data.mailSignAccountList);
                        // this.initPage();
                    } else {
                        this.$Message.error(this.$t('mail.writeLetter.signatureErrorTip'));
                    }
                });
            },
            /* 保存邮件 0发送 1存草稿 */
            /* todo here */
            handleSaveEmail(num, flag) {
                /* 自动保存的标志更改 */
                this.autoSaveDraftFlag = flag;
                if (this.$refs.filesUpload.fileSize >= this.max_size * 1024) {
                    this.$Message.warning(`${this.$t('mail.uploadFilesOversizeTip')}${this.max_size / 1024}M`);
                    return;
                }
                // 主题长度限制
                if (this.emailForm.subject.length > 500) {
                    return this.$Message.error(this.$t('mail.writeLetter.subjectLimit'));
                }
                if (num) {
                    this.draftLoading = true;
                    this.$emit('isLeaveModalShow', true);
                } else {
                    this.publishLoading = true;
                    this.$emit('isLeaveModalShow', false);
                }
                const data = this.mailDataFormat(num);
                let localTime = 0;
                if (this.set_time_form.local_time) {
                    localTime = this.set_time_form.local_time.getTime() + this.set_time_form.time_difference * 60000;
                }
                if (!this.autoSaveDraftFlag && this.set_time_flag && localTime - new Date().getTime() < 1800000) {
                    this.$Message.warning(this.$t('mail.regularMailResetTip'));
                    this.draftLoading = false;
                    this.publishLoading = false;
                    this.set_time_flag = false;
                    return false;
                }
                if (num) {
                    if (data.content.length) {
                        if (this.no_settime) {
                            this.set_time_flag = false;
                        }
                        /**
                         * @Description: 邮件追踪由后端处理，前端注释相关代码，只在发送邮件时携带是否为追踪邮件的标识即可
                         * @author 杨娣
                         * @date 2020/6/8
                         */
                        data.mailBoxId = this.emailId || '';
                        data.operateType = this.autoSaveDraftFlag ? 0 : 1;
                        this.saveAsDraft(data);
                    } else {
                        this.draftLoading = false;
                        this.$Notice.warning({
                            title: this.$t('mail.writeLetter.saveWarnTitle'),
                            message: this.$t('mail.writeLetter.saveWarnDesc')
                        });
                    }
                } else {
                    /**
                     * @Description: 邮件追踪由后端处理，前端注释相关代码，只在发送邮件时携带是否为追踪邮件的标识即可
                     * @author 杨娣
                     * @date 2020/6/8
                     */
                    /* 获取当前邮件正文的纯文本内容 */
                    const content = tinymce.activeEditor.getContent({ format: 'text' });
                    if (data.from.length && data.recipients_to.length && data.subject.length && content.trim().length) {
                        // data.content = str + data.content;
                        data.operateType = 2;
                        if (this.noAttachmentReg.test(content) && !data.mailAttachmentList.length) {
                            this.noAttachmentData = Object.assign({}, data);
                            this.noAttachmentModal = true;
                            this.publishLoading = false;
                        } else {
                            this.saveEmail(data);
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
            /* 邮件数据格式化 */
            /* todo here  判断是否群发单显 */
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
                    if (
                        Object.prototype.toString.call(emailForm[item]) === '[object Array]'
                    ) {
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
                    mailSignId: this.signatureId,
                    content: tinymce.activeEditor.getContent(),
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
                    createUserId: this.userId,
                    enterpriseId: this.enterpriseId
                };
            },
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
            // 删除元草稿箱邮件
            delete_drafts() {
                if (this.email_id) {
                    return new Promise((resolve, reject) => {
                        util.ajaxMailJson({
                            url: '/mail/deleteDraftMail',
                            method: 'put',
                            data: {
                                orgId: this.enterpriseId,
                                mailBoxId: this.email_id,
                                updateUserId: this.userId,
                                updateUserName: this.userName
                            }
                        }).then((data) => {
                            resolve();
                        }).catch(() => {
                            resolve();
                        });
                    });
                }
            },
            /** 更新草稿 */
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
                    // console.log(res);
                });
            },
            /* 发送邮件前保存邮件信息 */
            async saveEmail(data) {
                if (this.noAttachmentModal) {
                    this.noAttachmentData = null;
                    this.noAttachmentModal = false;
                    this.publishLoading = true;
                }
                data.requestSerialCode = this.requestSerialCode;
                if (this.set_time_flag) {
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
                            this.$emit('update:needLeaveModal', false);
                            /* 邮件信息保存成功后，后端会自行调用真实发邮件的接口，无需前端处理 */
                            data.from = `<${data.from}>`;
                            data.content = data.content.replace('<div id="signature" style="color:#000;font-size:12pt;font-family:arial,helvetica,sans-serif;">', '<div>');
                            data.mailId = response.data.data;
                            await this.delete_drafts();
                            this.publishLoading = false;
                            this.$Notice({
                                iconClass: 'custom custom-sending',
                                title: this.$t('mail.writeLetter.sendingMail')
                                // message: this.$t('mail.writeLetter.succDesc')
                            });
                            this.handleCancel();
                        } else {
                            this.publishLoading = false;
                            this.$Notice.error({
                                title: this.$t('mail.writeLetter.sendErrorTitle'),
                                message: response.data.msg
                            });
                        }
                    }).catch(error => {
                        this.publishLoading = false;
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
                }
            },
            /* 保存邮件为草稿 */
            saveAsDraft(data) {
                if (this.set_time_flag) {
                    data.bjTime = this.bj_time_flag ? this.bj_time_flag : new Date(this.bjTime).getTime();
                    data.mailTimeFlag = 1;
                    data.mailIsDraft = 1;
                    data.timeZone = this.set_time_form.time_difference;
                    data.timeZoneTime = this.set_time_form.local_time;
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
                    if (response.data.code === 1) {
                        // 更新es库的草稿
                        await this.updateDraft(response.data.data);
                        this.emailId = response.data.data;
                        if (this.autoSaveDraftFlag) {
                            this.$Message.success({
                                message: this.$t('mail.autoSaveDraftSuccess'),
                                duration: 3000
                            });
                        } else {
                            this.$Message.success(this.$t('mail.writeLetter.saveSuccTitle'));
                        }
                        this.no_settime = false;
                        if (this.saveWithWhich === 'leaveModalFloatWindow' || (this.set_time_flag && this.clickButton === 'sendMail')) {
                            // 当点击离开确认弹窗"的存草稿按钮、发送定时邮件进入此判断，执行跳转操作
                            this.$emit('changeView', 'mailHome');
                        }
                        if ((this.set_time_flag && this.clickButton === 'sendMail') && !this.autoSaveDraftFlag) {
                            this.$Notice.success({
                                title: this.$t('mail.regularMailSetSuccess'),
                                message: this.$t('mail.writeLetter.succDesc')
                            });
                        }
                    } else {
                        this.no_settime = false;
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
            /* 插入图片至编辑器 */
            insertImage(res) {
                const src = this.qiniuHttp + res.key;
                tinymce.execCommand('mceInsertContent', false, `<img src=${src}>`);
            },
            /* 初始化编辑器 */
            initEditor() {
                const vm = this;
                tinymce.init({
                    selector: '#splitEditor',
                    language_url: `${process.env.BASE_URL}tinymce/langs/zh_CN.js`,
                    skin_url: `${process.env.BASE_URL}tinymce/skins/ui/oxide`,
                    placeholder: vm.$t('aiToolBar.placeholder'),
                    // language_url: '/tinymce/langs/zh_CN.js',
                    // skin_url: '/tinymce/skins/ui/oxide',
                    skin: 'oxide',
                    browser_spellcheck: true, // 拼写检查
                    branding: false, // 去水印
                    // elementpath: false,  //禁用编辑器底部的状态栏
                    statusbar: false, // 隐藏编辑器底部的状态栏
                    paste_data_images: true, // 允许粘贴图像
                    paste_enable_default_filters: false, // paste插件 禁用TinyMCE的默认粘贴过滤器。
                    paste_webkit_styles: 'all', // 指定在WebKit中粘贴时要保留的样式
                    height: document.body.offsetHeight - 615,
                    language: 'zh_CN',
                    plugins: 'undo redo fullscreen autolink lists link image charmap print hr anchor imagetools media nonbreaking directionality paste textpattern formatpainter table hr code emoticons placeholder',
                    nonbreaking_force_tab: true, // 编辑器插入制表符
                    menubar: false,
                    contextmenu: false, // 禁用编辑器上下文菜单
                    // toolbar: [
                    //     'undo redo formatpainter | fontselect fontsizeselect | forecolor backcolor bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent lineheight | insertImageBtn link table emoticons hr | fullscreen code removeformat'
                    // ],
                    toolbar_mode: 'floating',
                    emoticons_database_url: 'emojis.js',
                    toolbar: false,
                    font_formats: '黑体="黑体";宋体="宋体";微软雅黑="微软雅黑";楷体="楷体";Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Calibri=calibri;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats',
                    autosave_interval: '20s',
                    table_default_styles: { width: '100%', borderCollapse: 'collapse' },
                    fontsize_formats: '12px 14px 16px 18px 24px 36px 48px', // 字号选项
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
                    setup: function(editor) {
                        editor.on('init', function(e) {
                            tinymce.activeEditor.setContent(vm.mailContent);
                            /**
                             * @Description: 更改富文本编辑器默认字体/字号/颜色
                             * @author wanghongzhu
                             * @date 2020/4/27
                             */
                            this.getBody().style.fontSize = vm.defaultMailSetting.fontSizeValue;
                            this.getBody().style.color = vm.defaultMailSetting.fontColorValue;
                            this.getBody().style.fontFamily = vm.defaultMailSetting.fontFamilyValue;
                            vm.initPage();
                        });

                        // ai tool bar
                        editor.on('mouseup', function (e) {
                            setTimeout(() => {
                                const selection = editor.selection;
                                const text = selection.getContent({ 'format': 'text' }).trim();
                                const preText = selection.getContent({ 'format': 'html' });
                                const frameRect = vm.editorIframe.getBoundingClientRect()
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
                            // ai tool bar
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
                        });

                        editor.ui.registry.addButton('insertImageBtn', {
                            // text: 'Insert Image',
                            tooltip: 'Insert Image',
                            icon: 'image',
                            onAction: function(_) {
                                const upload = vm.$refs.imageUpload;
                                vm.$nextTick(() => {
                                    upload.$refs['upload-inner'].handleClick();
                                });
                            }
                        });
                    },
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
                        const uid = Date.now() + blobInfo.name() + vm.userId;
                        util
                            .oldAjax({
                                url: '/file-sys/api/uptoken',
                                method: 'post'
                            })
                            .then(response => {
                                vm.uptoken = response.data.uptoken;
                                vm.action =
                                    `//upload.qiniup.com?token=${response.data.uptoken}`;

                                const observable = qiniu.upload(blobInfo.blob(), uid, vm.uptoken, putExtra, config);
                                const subscription = observable.subscribe(observer);
                            });
                    }
                });
            },
            /* 预览邮件 */
            handlePreview() {
                this.previewModel = true;
                this.mailContent = tinymce.activeEditor.getContent();
                // this.$refs.filesPreview.fileList = this.$refs.filesUpload.fileList;
                this.filesPreview = this.$refs.filesUpload.fileList;
            },
            /* 取消写信 */
            handleCancel() {
                this.$emit('update:replyMailType', '');
                if (this.needLeaveModal) {
                    this.closeModel = true;
                } else {
                    this.$emit('changeView', 'mailHome');
                }

            // this.$emit('isLeaveModalShow', true)
            },
            /** 离开写信 0不保存 1存草稿 */
            handleDraftSave(key) {
                if (key === 1) {
                    // this.isSaveDraft = true;
                    // 用于标记点击的是离开确认弹窗"的存草稿按钮
                    this.$store.commit('setSaveWithWhich', 'leaveModalFloatWindow');
                    /**
                     * @Description: this.no_settime = true;会导致在是否保存草稿的弹窗里，保存不了定时邮件
                     *                不清楚之前的设计逻辑，与产品确认，取消此逻辑
                     * @author 杨娣
                     * @date 2019/11/12
                     */
                    /* this.no_settime = true; */
                    this.draftLoading = true;
                    this.handleSaveEmail(1, false);
                    this.closeModel = false;
                } else {
                    this.closeModel = false;
                    this.$emit('changeView', 'mailHome');
                    this.$emit('isLeaveModalShow', true);
                }
            },
            /* 添加联系人 */
            addContacts(id) {
                event.stopPropagation();
                this.addContactList = [];
                this.emitModalId = id;
                this.contactsModel = true;
            },
            /* 如果发件人邮箱在收件人列表中, 则去除发件人 */
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
            /* 附件预览 */
            handlePreviewAtta(data) {
                const filePath = `${this.qiniuHttp}${data.response.key}`;
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
            /* 获取附件列表 */
            getUploadFilesList(fileList) {
                if (this.isFirstUpload && fileList.length) {
                    this.isFirstUpload = false;
                    this.showSubjectInput = false;
                    const subject = this.emailForm.subject;
                    const index = fileList[0].name.lastIndexOf('.');
                    const fileName = fileList[0].name.substring(index, 0);
                    this.$nextTick(() => {
                        if (!subject.trim()) {
                            this.emailForm.subject = subject.trim() + fileName;
                        }
                        this.showSubjectInput = true;
                    });
                }
            },
            /* 自动保存草稿 */
            autoSaveDraft() {
                clearInterval(this.autoSaveDraftTimer);
                const vm = this;
                this.autoSaveDraftTimer = setInterval(() => {
                    vm.handleSaveEmail(1, true);
                }, 300000);
            },
            /* 修改发送时间 */
            handleUpdateTime() {
                this.updateSendTimeFlag = true;
                this.set_timeout_modal = true;
                this.lastSetTimeForm.local_time = this.set_time_form.local_time;
                this.lastSetTimeForm.time_difference = this.set_time_form.time_difference;
            },
            /* 取消修改发送时间 */
            handleCancelUpdate() {
                this.set_time_flag = Boolean(this.updateSendTimeFlag);
                if (this.updateSendTimeFlag) {
                    this.set_time_form.local_time = this.lastSetTimeForm.local_time;
                    this.set_time_form.time_difference = this.lastSetTimeForm.time_difference;
                }
                this.set_timeout_modal = false;
                if (!this.emailId) {
                    this.updateSendTimeFlag = false;
                } else {
                    const time = this.lastSetTimeForm.local_time.getTime() + this.lastSetTimeForm.time_difference * 60000;
                    this.bjTime = this.dateFormat('yyyy-MM-dd hh:mm:ss', time);
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
            /* 创建客户---产品要求修改为邮件录入线索，此方法注释。杨娣 2021/03/05 */
            createClue(mailId, email, currentMailAddType, currentMailInfo) {
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
                this.currentMailInfo.mailAddress = email;
            },
            // 关闭小弹窗
            littleDrawerHidden(val) {
                this.littleDrawerVisible = val;
            },
            // 录入为线索后
            updateStatus(clueId, status) {
                // this.newClueShow = false;
                this.clueId = clueId;
                this.updateMailCrmStatus(this.mailAddress, status);
                this.showClue({ clueId, type: 1 });
            },
            // 录入成询盘后
            updateInquiryStatus(clueId, status) {
                // this.newClueShow = false;
                this.clueId = clueId;
                this.updateMailCrmStatus(this.mailAddress, status);
                this.getInquiryAndCompanyInfoByEmails();
            },
            updateMailCrmStatus(email, status) {
                this.crmEmails.forEach(item => {
                    if (item.email === email) {
                        item.type = status;
                    }
                    return item;
                });
            },
            getInquiryAndCompanyInfoByEmails() {
                const postData = {
                    emailList: [this.mailAddress],
                    userId: this.userId,
                    orgId: this.enterpriseId
                };
                util.ajaxJson({
                    url: '/crm/mailbox/getInquiryAndCompanyInfoByEmails',
                    method: 'post',
                    data: postData
                })
                    .then((response) => {
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
                    if (type === 1 || type === 2) {
                        /**
                         * @Description: 如要修改点击橙色小人头标识跳转至目标详情页，修改此处的type_company即可。
                         *               customer(客户详情页)/inquiry(询盘详情页)
                         * @author 杨娣
                         * @date 2021/01/20
                         */
                        this.type_company = 'customer';
                    } else if (type === 0) {
                        this.type_company = 'highseasCustomer';
                    }
                    this.show_company_detail = true;
                    this.$emit('changeSearchCustomer', false);
                });
            },
            async showClue({ clueId, rightUserIds, type }) {
                if (type === 0) {
                    if (!this.isContainsMenu('common_sea_customer')) {
                        this.$Message.warning('您没有查看公海数据的权限，无法查看');
                        return;
                    }
                } else {
                    if (this.isContainsMenu('my_clue')) {
                        if (type === 2) {
                            const flag = await this.isHaveManageAuthority(rightUserIds);
                            if (!flag) {
                                this.$Message.warning('您当前无权限查看此客户');
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
            /* 当前用户是否拥有某些人员的管理权限的判断 */
            isHaveManageAuthority(userIds) {
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
                        url: '/crm/mailbox/getInquiryAndCompanyInfoByEmails',
                        method: 'post',
                        data: post_data,
                        cancelToken: new util.axios.CancelToken(function executor(c) {
                            // An executor function receives a cancel function as a parameter
                            vm.cancelFunc = c;
                        })
                    }).then(response => {
                        if (response.data.code === '1') {
                            const res = response.data.data;
                            this.crmEmails = [];
                            for (let i = 0; i < emailList.length; i++) {
                                res[emailList[i]].recipient = [emailList[i]];
                                res[emailList[i]].email = emailList[i];
                                res[emailList[i]].recieverCrmFlag = res[emailList[i]].type;
                                res[emailList[i]].fromOrToFlag = 1;
                                this.crmEmails.push(res[emailList[i]]);
                            }
                        }
                    });
                }
            },
            getAllContactsStatus() {
                const allEmails = this.emailForm.recipients_to.concat(this.emailForm.recipients_cc).concat(this.emailForm.recipients_bcc);
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
            // littleDrawer点击事件传递
            handleClick(params) {
                this.$emit('handleClick', params);
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
        mounted() {
            tinymce.execCommand('mceRemoveEditor', true, 'splitEditor');
            const contacts = this.$options.filters.parseObject(localStorage.getItem('leadsCloud-sendMail-contacts'));
            if (contacts) {
                localStorage.removeItem('leadsCloud-sendMail-contacts');
                this.saveMailCrmRelationConditions = contacts.map(item => {
                    this.contacts.push(`${item.receiverName}<${item.receiveMailAddress}>`);
                    this.emailForm.recipients_to.push(`${item.receiverName}<${item.receiveMailAddress}>`);
                    return item;
                });
            }
            this.autoSaveDraft();
        },
        beforeDestroy() {
            tinymce.execCommand('mceRemoveEditor', true, 'splitEditor');
            tinymce.remove('splitEditor');
            this.$emit('update:replyMailType', '');
            this.isFirstUpload = true;
            clearInterval(this.autoSaveDraftTimer);
            this.autoSaveDraftFlag = false;
        },
        watch: {
            set_time_flag(val) {
                if (!val) {
                    this.updateSendTimeFlag = false;
                    this.set_time_form.local_time = null;
                }
            },
            bj_time(val) {
                if (val || this.updateSendTimeFlag) {
                    this.set_time_flag = true;
                } else {
                    this.set_time_flag = false;
                }
            },
            set_timeout_modal(val) {
                if (!val) {
                    if (this.bj_time || this.updateSendTimeFlag) {
                        this.set_time_flag = true;
                    } else {
                        this.set_time_flag = false;
                    }
                }
            },
            contactsModel(val) {
                if (!val && this.addContactList && this.emitModalId) {
                    const addContactList = this.addContactList.map(item => {
                        return Object.assign({}, item);
                    });
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
            set_time_form: {
                handler(val) {
                    if (val.local_time) {
                        this.check_local_time();
                    } else {
                        // empty
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
                    if (rType !== 'reedit' && rType !== 'forward') {
                        // 只有回复邮件时才判断是否需要已回复标识
                        originalSenderAdd = this.getStandardEmail(this.originalMailFrom);
                    }
                    if (this.emailForm.recipients_to.findIndex(item => item.includes(originalSenderAdd)) === -1) {
                        /* 如果原始邮件的发件人不在当前收件人列表中，则无已回复标识 */
                        this.emailForm.originalMailId = 0;
                    } else if (!this.originalMailId && this.originalMailId !== '0') {
                        /* 原始邮件点击回复，如果原始邮件的发件人在当前收件人列表中，则有已回复标识 */
                        this.emailForm.originalMailId = this.selectedMailId;
                    } else {
                        /* 原始邮件点击回复并且已存入草稿箱(前提是携带着已回复标识)，则从草稿箱再次编辑该邮件，
                     如果原始邮件的发件人在当前收件人列表中，则有已回复标识 */
                        this.emailForm.originalMailId = this.originalMailId;
                    }
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
            // newCompanyShow: {
            //     handler(val) {
            //         if (!val) {
            //             this.getAllContactsStatus();
            //         }
            //     }
            // },
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
                            }
                        })
                    }else {
                        this.$aiToolBar.destroy()
                    }
                },
            },
        }
    };
</script>
