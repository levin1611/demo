<template>
    <div class="float-window-mail-detail" :style="`height:${bodyHeight}px`">
        <div class="floating-window-header">
            <div class="floating-window-header-left">
                <Icon custom="custom custom-floating-window-arrow" size="14" @click.native="backToList" style="color:rgba(0,0,0,0.6);" class="floating-window-header-back-arrow"></Icon>
            </div>
            <div class="floating-window-fix-icon">
                <!-- <Icon custom="custom custom-delete-mail" size="16"  @click="handleDelete" /> -->
                <Tooltip :content="$t('clue.last')">
                  <Icon custom="custom custom-floating-window-arrow"  size="16" @click="handle_pre_next('pre')" :style="`transform:rotate(180deg);margin:0 20px;cursor: ${cur_mail - 2<0 ? 'not-allowed' : 'auto'}`"></Icon>
                </Tooltip>
                <Tooltip :content="$t('clue.next')">
                  <Icon custom="custom custom-floating-window-arrow" size="16" @click="handle_pre_next('next')" :style="`margin-right:20px;cursor: ${cur_mail ===total_mail ? 'not-allowed' : 'auto'}`"></Icon>
                </Tooltip>
                <Tooltip :content="$t('pin')" v-if="!isFixed">
                  <Icon custom="custom custom-float-window"  @click.native="handleFixed" size="16" />
                </Tooltip>
                <Tooltip :content="$t('unpin')" v-else>
                  <Icon custom="custom custom-fixed-window" @click.native="handleUnFixed" size="16" />
                </Tooltip>
            </div>
        </div>
        <div v-loading="spinShow"
             ref="floatingWindowDetailCard"
             @scroll="handleMailVerticalScroll"
             class="mail-detail-content">
            <div id="title" class="title" >
                <div class="mail-star-operate" v-if="mailBoxTypeId !== '3' && mailBoxTypeId !== '2'">
                    <Icon v-if="mailStarFlag === '0'"
                          size="14" style="visibility:visible;margin-top: -2px;color: #666;"
                          custom="custom custom-mail-star0"
                          :title="$t('mail.flag_star_box')"
                          @click="sign_star(1)"/>
                    <Icon v-else custom="custom custom-mail-star1"
                          style="color:#FBBC04;visibility:visible;margin-top: -2px;"
                          size="14"
                          :title="$t('mail.cancel_flag_star_box')"
                          @click="sign_star(0)"/>
                    <span>{{title}}</span>
                    <span class="show-more" @click="showMore=!showMore">
                        {{showMore?$t('mail.collapse'):$t('mail.detail')}}
                        <Icon :class="showMore?'opened':''" size="12" custom="custom custom-show-more"></Icon>
                    </span>
                    <span class="mail-operations" style="margin: 0 5px;">
                        <Icon v-if="mailToDoFlag === 0" size="14" custom="custom custom-mail-notSet piwik_mail_mark_nosetOrFinished"
                              style="color: #666;" :title="$t('mail.notSet')" @click.stop="changeProcessingState(1)"/>
                        <Icon v-if="mailToDoFlag === 1"  custom="custom custom-mail-untreated piwik_mail_mark_untreated"
                              style="color:#FBBC04;" size="14" :title="$t('mail.untreated')" @click.stop="changeProcessingState(2)"/>
                        <Icon v-if="mailToDoFlag === 2"  size="14" custom="custom custom-mail-finished piwik_mail_mark_nosetOrFinished" :title="$t('mail.finished')"
                              style="color:#00CC99;" @click.stop="changeProcessingState(1)"/>
                    </span>
                    <Tag v-for="(tag,index) in tags" class="tag-in-table" :color="tag.labelColor" :style="`color:${getRGB(tag.labelColor)}`" :key="index">
                        <span @click="filterTag(tag.id)">{{tag.labelName}}</span>
                        <Icon class="custom custom-delete1" @click="operateTag(tag.id,0)" :style="`margin-left: 9px;cursor: pointer;color:${getRGB(tag.labelColor) === '#333' ? '#999!important' : '#fff'}`"></Icon>
                    </Tag>
                </div>
                <div v-show="!showMore">
                    <div class="notwrap" style="color:#979797;margin-top: 8px;font-size: 12px;"  >
                        <!-- {{getNickname(sender)}}&emsp;于{{sendTime}}发给&emsp;{{getNickname(recipients+','+recipients_cc+','+recipients_bcc)}} -->
                        {{$lang === 'zh-CN'?
                        `${getNickname(sender.join(','))} 于${sendTime}发给 ${getNickname(recipients.join(',')+','+recipients_cc.join(',')+','+recipients_bcc.join(','))}`:
                        `${getNickname(sender.join(','))} sent to ${getNickname(recipients.join(',')+','+recipients_cc.join(',')+','+recipients_bcc.join(','))} at ${sendTime}`}}
                    </div>
                    <div v-if="attachmentCount!==0"  style="color:#979797;font-size: 12px;">{{$t('mail.attachment')}}：
                        {{attachmentCount}}（
                        <div class="attachmentBrief"><span v-for="(item,index) in attachment" :key="index">{{item.fileName}}<span
                                v-if="index!==attachment.length-1">，</span></span></div>
                        ）
                        <a @click="scrollToAttachment" style="color:#4285f4;">{{$t('mail.gotoAttachment')}}</a>
                    </div>
                </div>
                <ul v-show="showMore" class="detailHead">
                    <li>{{$t('mail.writeLetter.sender')}}：
                        <span v-for="(send) in sender" style="margin-right: 5px;">
                         <RecipientPoptip
                             fromFlag="mailDetail-send"
                             v-if="true"
                             v-bind="$attrs"
                             v-on="$listeners"
                             :params="{row: crmEmails.from.find(item => getStandardEmail(send) === item.email)}"
                             @showCompany="showCompany"
                             @showClue="showClue"
                             @createClue="createClue"
                            @handleClick="handleClick"
                         ></RecipientPoptip>
                        <span style="margin-left: 5px;">{{send}}</span>
                      </span>
                    </li>
                    <li>{{$t('mail.writeLetter.sendTime')}}{{sendTime}}</li>
                    <li v-if="recipients.length && recipients.join('')">{{$t('mail.writeLetter.recipients')}}：
                        <span v-for="(recipient) in recipients" style="margin-right: 5px;">
                        <RecipientPoptip
                            fromFlag="mailDetail-recipient"
                            v-if="true"
                            v-bind="$attrs"
                            v-on="$listeners"
                            :params="{row: crmEmails.to.find(item => getStandardEmail(recipient) === item.email)}"
                            @showCompany="showCompany"
                            @showClue="showClue"
                            @createClue="createClue"
                            @handleClick="handleClick"
                        ></RecipientPoptip>
                        <span style="margin-left: 5px;">{{recipient}}</span>
                      </span>
                    </li>
                    <li v-if="recipients_cc.length && recipients_cc.join('')">{{$t('mail.writeLetter.recipientCc')}}：
                        <span v-for="(cc) in recipients_cc" style="margin-right: 5px;">
                        <RecipientPoptip
                            fromFlag="mailDetail-cc"
                            v-if="true"
                            v-bind="$attrs"
                            v-on="$listeners"
                            :params="{row: crmEmails.cc.find(item => getStandardEmail(cc) === item.email)}"
                            @showCompany="showCompany"
                            @showClue="showClue"
                            @createClue="createClue"
                            @handleClick="handleClick"
                        ></RecipientPoptip>
                        <span style="margin-left: 5px;">{{cc}}</span>
                      </span>
                    </li>
                    <li v-if="mailBoxType==='sentBox'&&recipients_bcc.length && recipients_bcc.join('')">
                        {{$t('mail.writeLetter.recipientBcc')}}：
                        <span v-for="(bcc) in recipients_bcc" style="margin-right: 5px;">
                        <RecipientPoptip
                            fromFlag="mailDetail-bcc"
                            v-if="true"
                            v-bind="$attrs"
                            v-on="$listeners"
                            :params="{row: crmEmails.bcc.find(item => getStandardEmail(bcc) === item.email)}"
                            @showCompany="showCompany"
                            @showClue="showClue"
                            @createClue="createClue"
                            @handleClick="handleClick"
                        ></RecipientPoptip>
                        <span style="margin-left: 5px;">{{bcc}}</span>
                      </span>
                    </li>
                    <!-- <li>{{$t('mail.writeLetter.size')}}：{{size}}</li> -->
                    <li v-if="attachmentCount!==0">{{$t('mail.attachment')}}：
                        {{attachmentCount}}（
                        <div class="attachmentBrief"><span v-for="(item,index) in attachment" :key="index">{{item.fileName}}<span
                            v-if="index!==attachment.length-1">，</span></span></div>
                        ）
                        <a @click="scrollToAttachment" style="color: #4285F4;">{{$t('mail.gotoAttachment')}}</a>
                    </li>
                    <li v-if="mailDetailData.mailOpenTimes>0">{{$t('mail.mailOpenTimesTip')}}{{mailDetailData.mailOpenTimes}}{{$t('mail.recentOpenTimeTip')}}{{dateFormat("yyyy-MM-dd hh:mm", mailDetailData.recentOpenTime)}}{{$t('mail.recentOpenPositionTip')}}{{mailDetailData.recentOpenPosition}}（{{mailDetailData.recentOpenIp}}）</li>
                </ul>
                <div style="border-top: 1px solid #EAEAEA;padding-top: 20px;">
                    <iframe 
                            id="mailFrameFloat"
                            :src="`${publicPath}mailDetail.html`"
                            :name="mailFrameName"
                            width="100%"
                            height="0"
                            class="no-border"></iframe>

                    <!-- 自定义滚动条 -->
                    <div @scroll="handleMailHorizontalScroll"
                         ref="mailIframeScroll"
                         :style="mailScrollContainerStyleObj">
                        <div :style="mailScrollInnerStyleObj"></div>
                    </div>
                </div>
                <!--<iframe src="http://p0zwqtqw9.bkt.clouddn.com/mailContent/receiveMail/10166/411/xtbBFB3v7VaDyj-p3wAAsd.html" width="800"></iframe>-->
                <div ref="floatingWindowAttachmentArea" v-if="attachmentCount!==0">
                    <div style="margin-bottom:10px;height:1px;background-color:#EAEAEA;"></div>
                    <div style="font-size: 13px;color: rgba(0,0,0,0.80);">
                        <!-- <Icon type="paperclip" size="16"></Icon> -->
                    <span>{{$t('mail.attachment')}}（{{attachmentCount}}{{ $t('b2b.b2b.unit') }}）</span>
                    <span v-if="attachment.length > 1" style="cursor:pointer;color:#3b78de;margin-right: 10px;" @click="downloadFileZip">{{ $t('mail.packageDownload') }}</span>
                    <Icon custom="custom custom-refresh" class="receive-load-loop" v-if="isDownloadingZip" style="margin-right: 10px;"></Icon>
                    <span v-if="attachment.length > 1"
                        class="mail-attachmentpackagedownload"
                        style="cursor:pointer;color:#3b78de;margin-right: 10px;"
                        @click="copyAttachment()">{{ $t('mail.copyAttachmentAll') }}</span>
                    </div>
                    <div v-for="(item,index) in attachment" :key="index" style="margin:10px 0">
                        <div style="font-size: 14px;color: rgba(0,0,0,0.80);">
                            <Icon :class="format(item)" size="16" style="color: #677f99;margin-right: 6px;"></Icon>
                            {{item.fileName}}
                            <span v-if="item.fileState === 1">（{{item.fileSize}}）</span>
                        </div>
                        <div style="font-size: 12px;color: #4285F4;margin-top:10px;">
                            <span @click="downloadFile(item.filePath,item.fileName, item.id, item.attachmentIcon)"
                                class="header-source" style="margin-right:10px;">{{$t('mail.download')}}</span>
                            <span @click="previewFile(item.fileType,item.filePath, item.id, item.attachmentIcon)" class="header-source" style="margin-right: 10px;">{{$t('mail.preview')}}</span>
                            <span @click="copyAttachment(item)"
                            class="header-source">{{$t('mail.copyAttachments')}}</span>
                        </div>
                    </div>
                </div>
                <Modal
                        :modal="false"
                        :title="$t('previewImg')"
                        :visible.sync="previewImg"
                        width="800">
                    <img :src="imgUrl" style="width: 100%">
                    <div slot="footer"></div>
                </Modal>
                </div>
        <div class="mail-detail-footer">
            <!-- <Icon custom="custom custom-annex-file" size="20" style="margin-right:20px;"></Icon> -->
            <span style="font-size: 14px;color: rgba(0,0,0,0.28);cursor:text;" @click="replyAll()">回复全部...</span>
            <Tooltip style="cursor:pointer;float:right;" :content="$t('mail.forward')">
              <Icon custom="custom custom-forward" size="16" @click="forward()"></Icon>
            </Tooltip>
        </div>
        <!-- 添加标签 -->
        <Modal
            :visible.sync="addModal"
            :modal="false"
            :title="$t('crm.UniSet.setting_label')"
            transfer
            :mask-closable="false"
            class="modal">
            <p class="layermain" style="margin:10px 0 10px 10px;">
                {{$t('clue.add_clue')}}:
                <Input v-model.trim="tagName" style="width: 300px;margin-top:2px;"></Input>
                <p style="text-align:center;color:red;">
                    {{$t('mail.lengthLimit')}}
                </p>
            </p>
            <div class="color">
                <ul>
                    <li v-for="(item,index) in colors" @click="colorClick(index)" :key="index">
                    <Icon type="android-done" v-if="item.show"></Icon>
                    </li>
                </ul>
            </div>
            <div slot="footer">
                <Button @click="addModal = false">{{$t('crm.UniSet.modal_cancel') }}</Button>
                <Button @click="saveTag" type="primary">{{ $t('crm.UniSet.modal_ok') }}</Button>
            </div>
        </Modal>
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
</div>
</template>
<script>
    import CRMDrawerList from '@/views/crm/Detail/CRMDrawerList';
    import ClueDrawerList from '@/views/clue-manage/Detail/ClueDrawerList';
    import Cookies from 'js-cookie';
    import util from '@/libs/util';
    import { mapState, mapActions, mapGetters } from 'vuex';
    import JSZip from 'jszip';
    import { saveAs } from 'file-saver';
    import mailContent from '@/mixins/mailContent';
    import littleDrawer from '@/views/main-components/little-drawer/little-drawer.vue';

    /** 判断长度 */
    String.prototype.realLength = function() {
        return this.replace(/[^\x00-\xff]/g, '**').length; // [^\x00-\xff] - 匹配非双字节的字符
    };
    export default {
        props: [
            'selectedMailId',
            'selectedMailBoxType',
            'replyMailType',
            'mailEdit',
            'isFixed',
            'corp_columns_authorized',
            'contact_columns_authorized',
            'inquiry_columns_authorized',
            'selectOptions'
        ],
        computed: {
            ...mapState({
                fullName: 'fullName',
                orgId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                window_height: 'window_height',
                downloadingMailIds: state => state.mail.downloadingMailIds,
                $lang: state => state.app.lang,
                // 写信页面富文本编辑器 content_style 配置中会影响邮件内容渲染的样式
                tinymce_contentStyle: state => state.mail.tinymce_contentStyle,
                copyAttachmentStatus: state => state.mail.copyAttachmentStatus
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            card_height() {
                return `${parseInt(this.content_height) - 90}px`;
            },
            bodyHeight() {
                const temp = this.window_height ? this.window_height - 60 : document.body.clientHeight - 60;
                return temp > 200 ? temp : 200;
            },
            isDownloadingZip() {
                if (this.downloadingMailIds.findIndex(item => item === this.selectedMailId) !== -1) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        components: {
            CRMDrawerList,
            ClueDrawerList,
            littleDrawer
        },
        name: 'MailDetail',
        mixins: [mailContent],
        data() {
            return {
                // 静态资源文件地址
                publicPath: process.env.BASE_URL,
                mailDetailData: {},
                detail_url: '',
                total_mail: 0,
                cur_mail: 0,
                mail_id_list: [],
                totalUnread: '',
                spinShow: true,
                mailBoxType: '',
                mailBoxTypeId: '',
                title: '',
                sender: [],
                sendTime: '',
                recipients: [], // 收件人
                recipients_cc: [], // 抄送人
                recipients_bcc: [], // 密送人
                size: '',
                content: '',
                attachment: [],
                attachmentCount: '',
                mailStarFlag: false, // 是否为星标邮件
                deleteModel: false,
                moveFlag: false,
                previewImg: false,
                imgUrl: '',
                sourceLang: 'en',
                targetLang: 'zh-CN',
                tags: [], // 这份邮件的标签
                tagList: [], // 所有标签列表
                addModal: false,
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
                showMore: true, // 是否显示详情
                attachmentDataList: {}, // 从七牛获取到的附件资源数据
                crmEmails: {
                    from: [],
                    to: [],
                    cc: [],
                    bcc: []
                },
                mailAddType: '', // 创建新客户/新线索的邮箱，属于发件人 or 收件人 or 抄送 or 密送
                show_company_detail: false,
                type_company: 'customer',
                companyId: 0,
                show_clue_detail: false,
                type_clue: '',
                clueId: '',
                cancelFunc: null, // 取消上一次请求
                mailToDoFlag: '', // 邮件处理状态

                // 邮件内容 iframe name
                mailFrameName: 'splitMailContentFrame',
                // 模拟水平滚动条距离 offsetParent 的 bottom , 单位 px
                scrollBarBottom: 2,
                // 新增弹窗相关
                mailAddress: '', // 创建新客户的邮箱
                currentMailId: '',
                currentMailInfo: {},
                littleDrawerVisible: false
            };
        },
        methods: {
            handleFixed() {
                this.$emit('changeFixState', true);
            },
            handleUnFixed() {
                this.$emit('changeFixState', false);
            },
            backToList() {
                this.$emit('changeView', 'mailHome');
            },
            scrollToAttachment() {
                document.querySelector('.mail-detail-content').scrollTop = this.$refs.floatingWindowAttachmentArea.offsetTop;
            },
            get_mail_list() {
                util.ajaxMailJson({
                    url: '/mail/mailBoxs/ids',
                    method: 'POST',
                    data: this.$store.state.mail_window.mail_detail_params
                }).then(({ data }) => {
                    if (data.code === 1) {
                        if (this.currentBox === 'unreadBox') {
                            this.mail_id_list = Array.from(new Set([this.selectedMailId].concat(data.data)));
                        } else {
                            this.mail_id_list = data.data;
                        }
                        this.total_mail = this.mail_id_list.length;
                        for (let i = 0; i < this.mail_id_list.length; i++) {
                            if (this.selectedMailId === this.mail_id_list[i]) {
                                this.cur_mail = i + 1;
                                break;
                            }
                        }
                    }
                });
            },
            handle_pre_next(type) {
                /**
                 * @Description: 原逻辑存在三个问题：1. 邮件详情若未获取成功，该邮件已被置为已读，实际上对用户来说该邮件未读
                 *                                   2. 父组件props传入的selectedMailId更改，触发一次获取邮件详情的接口调用；
                 *                                       此处主动调用一次获取详情的接口属多余调用，会导致因为两次接口调用(邮件id不同)，响应
                 *                                       速度不同，最终页面显示的详情信息与邮件id不一致。
                 *                                   3. 前一封/后一封未判断是否还有值，页面交互效果错误
                 *                处理方法：问题1.2 ： 注释不合理的代码段
                 *                          问题3： 增加判断逻辑
                 * @author 杨娣
                 * @date 2020/5/19
                */
                if (type === 'pre') {
                    if (this.cur_mail - 2 < 0) {
                        return false;
                    }
                    this.$emit('changeSelectedMailId', this.mail_id_list[this.cur_mail - 2]);
                    this.cur_mail = this.cur_mail - 1;
                } else {
                    if (this.cur_mail === this.total_mail) {
                        return false;
                    }
                    this.$emit('changeSelectedMailId', this.mail_id_list[this.cur_mail]);
                    this.cur_mail = this.cur_mail + 1;
                }
            },
            mailDetailinit() {
                this.mailBoxType = this.selectedMailBoxType;
                switch (this.mailBoxType) {
                    case 'unreadBox':
                        this.mailBoxTypeId = '0';
                        break;
                    case 'inbox':
                        this.mailBoxTypeId = '0';
                        break;
                    case 'draftBox':
                        this.mailBoxTypeId = '5';
                        break;
                    case 'sentBox':
                        this.mailBoxTypeId = '4';
                        break;
                    case 'dustbin':
                        this.mailBoxTypeId = '3';
                        break;
                    case 'customerBox':
                        this.mailBoxTypeId = '6';
                        break;
                    default:
                        this.mailBoxTypeId = this.mailBoxType;
                        break;
                }
                this.getMailDetailById();
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
            /** 获取邮件详情 */
            getMailDetailById() {
                /**
                 * @Description1: 邮件自动置为已读--原逻辑：点击分屏列表页某行---该邮件置为已读，同时跳转进详情页---获取邮件详情失败
                 *               ----页面跳转回分屏列表页，同时将邮件置为未读；此逻辑极其不合理
                 * @Description2: 修改后的邮件自动置为已读逻辑：只在邮件详情获取成功后，邮件才被置为已读
                 * @Description3: ----此处注释逻辑不合理的代码段，并增加在邮件详情获取成功后将邮件置为已读的操作
                 * @author 杨娣
                 * @date 2020/5/7
                 */
                this.getTagsById();
                util.ajaxMailJson({
                    url: '/mail/mailDetail',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.orgId,
                        id: this.selectedMailId
                    },
                    timeout: 60000
                }).then(async response => {
                    this.spinShow = false;
                    this.$refs.floatingWindowDetailCard.scrollTop = 0;
                    if (response.data.code === 1) {
                        this.mailDetailData = response.data.data;
                        const mailDetail = response.data.data;
                        this.title = (mailDetail.subject === '') ? this.$t('mail.writeLetter.noSubject') : mailDetail.subject;
                        this.sender = [mailDetail.from];
                        this.sendTime = mailDetail.sendTime.substr(0, 19);
                        this.recipients = mailDetail.recipients_to[0] === '[' && mailDetail.recipients_to[mailDetail.recipients_to.length-1] === ']' ? (JSON.parse(mailDetail.recipients_to).length===1 && !JSON.parse(mailDetail.recipients_to)[0] ? [] : JSON.parse(mailDetail.recipients_to)) : mailDetail.recipients_to ? mailDetail.recipients_to.split(',') : [];
                        this.recipients_cc = mailDetail.recipients_cc[0] === '[' && mailDetail.recipients_cc[mailDetail.recipients_cc.length-1] === ']' ?  (JSON.parse(mailDetail.recipients_cc).length===1 && !JSON.parse(mailDetail.recipients_cc)[0] ? [] : JSON.parse(mailDetail.recipients_cc)) : mailDetail.recipients_cc ? mailDetail.recipients_cc.split(',') : [];
                        this.recipients_bcc = mailDetail.recipients_bcc[0] === '[' && mailDetail.recipients_bcc[mailDetail.recipients_bcc.length-1] === ']' ? (JSON.parse(mailDetail.recipients_bcc).length===1 && !JSON.parse(mailDetail.recipients_bcc)[0] ? [] : JSON.parse(mailDetail.recipients_bcc)) : mailDetail.recipients_bcc ? mailDetail.recipients_bcc.split(',') : [];
                        this.size = mailDetail.mailSize;
                        this.mailStarFlag = mailDetail.mailStarFlag;
                        this.mailToDoFlag = mailDetail.mailToDoFlag;
                        // 渲染页面
                        // 暂存邮件内容
                        let strHTML = mailDetail.content;
                        // 如果邮件内容不以此样式开头, 且此邮件是询盘云发出(注意, 只能识别已发箱邮件), 给邮件内容前面加上此样式, 避免渲染错误
                        if (!strHTML.startsWith(this.tinymce_contentStyle) && mailDetail.fromOrToFlag === 1) {
                            strHTML = this.tinymce_contentStyle + strHTML;
                        } else {
                            strHTML = `<style>div {word-break: break-all;} pre{ white-space: pre-wrap; } p{ margin: 0;}</style>${strHTML}`;
                        }
                        // 生成 iframe documentElement 代码
                        this.content = this.handleMailHTML(strHTML);
                        // 渲染代码到 iframe 中
                        this.renderMailHTML(this.mailFrameName, this.content, this.handleIframeHashChange);

                        this.attachment = mailDetail.mailAttachmentList ? mailDetail.mailAttachmentList : [];
                        this.attachment.forEach((item) => {
                            const type = item.fileType.toLowerCase();
                            if (type === '.txt') {
                                item.attachmentIcon = 'custom custom-file-text';
                            } else if (type === '.zip' || type === '.rar') {
                                item.attachmentIcon = 'custom custom-file-zip';
                            } else if (type === '.pdf') {
                                item.attachmentIcon = 'custom custom-file-pdf';
                            } else if (type === '.xls' || type === '.xlsx') {
                                item.attachmentIcon = 'custom custom-file-xls';
                            } else if (type === '.doc' || type === '.docx') {
                                item.attachmentIcon = 'custom custom-file-doc';
                            } else if (type === '.ppt' || type === '.pptx') {
                                item.attachmentIcon = 'custom custom-file-ppt';
                            } else {
                                item.attachmentIcon = 'custom custom-file-other';
                            }
                        });
                        this.attachmentCount = mailDetail.attachmentCount;
                        if (mailDetail.mailReadFlag === 0) {
                            this.readPart('read');
                        }
                        this.getAllContactsStatus();

                        // ai tool bar 
                        this.$nextTick(() => {
                            this.initAiToolBar()
                        });
                    } else {
                        if (response.data.msg) {
                            this.$Message.error(response.data.msg);
                        } else {
                            this.$Message.error(this.$t('mail.getFailAndRetryLater'));
                        }
                    }
                }).catch((err) => {
                    this.spinShow = false;
                    console.log(err, '报错信息');
                    this.$Message.error(this.$t('mail.getFailAndRetryLater'));
                    this.pageReturn();
                    // this.readPart('unread');
                });
            },

            // ai tool bar 
            initAiToolBar () {
                const _this = this
                const iframe = document.getElementById("mailFrameFloat");
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
            /** 获取邮件标签 */
            getTagsById() {
                util.ajaxMail({
                    url: `/mail/maillabel/all/${this.selectedMailId}`,
                    method: 'get',
                    params: {
                        mailBoxId: this.selectedMailId,
                        orgId: this.orgId,
                        userId: this.userId
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        this.tags = res.data.data;
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
                        this.tagList = res.data.data;
                    }
                });
            },
            /** 添加标签模态框切换颜色 */
            colorClick(index) {
                for (let i = 0; i < this.colors.length; i++) {
                    if (i === index) {
                        this.colors[i].show = true;
                    } else {
                        this.colors[i].show = false;
                    }
                }
            },
            /** 新建保存标签 */
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
                    this.addModal = false;
                    this.tagName = '';
                    this.operateTag(tag[0].id, 1);
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
                    url: '/mail/maillabel/add',
                    method: 'post',
                    data: jsonData
                }).then(res => {
                    if (res.data.code == 1) {
                        this.tagName = '';
                        this.addModal = false;
                        this.$Message.success('成功添加标签');
                        this.getTags();
                        this.$emit('updateTagList', 'tagMenu');
                        this.operateTag(res.data.data.id, 1);
                    } else {
                        this.$Message.error(res.data.msg);
                    }
                });
            },
            /** 跳转table根据标签查询 */
            filterTag(tagId) {
                console.log('查询标签');
                this.$emit('changeBox', `tag_${tagId}`);
            },
            /** 给邮件增加删除标签 ,参数1增加/删除的标签id;参数2增加1删除0 */
            operateTag(label, type) {
                util.ajaxMailJson({
                    url: '/mail/maillabel/operateMailLabel',
                    method: 'post',
                    data: {
                        orgId: this.orgId,
                        userId: this.userId,
                        mailBoxIds: [this.selectedMailId],
                        mailLabelId: label,
                        operateState: type
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        if (type) {
                            this.$Message.success('成功设置邮件标签');
                        }
                        this.getTagsById();
                    }
                });
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
            async downloadFile(path, name, id, attachmentIcon) {
                if (!path) {
                    const fileInfo = await this.getAttachmentStateById([id], attachmentIcon);
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
            async previewFile(type, path, id, attachmentIcon) {
                if (!path) {
                    const fileInfo = await this.getAttachmentStateById([id], attachmentIcon);
                    if (fileInfo[0].fileState !== 1) {
                        this.$Message.error('当前附件还未收取完毕，请稍后再试');
                    } else {
                        path = fileInfo[0].filePath;
                        type = fileInfo[0].fileType;
                        type = type.slice(type.lastIndexOf('.'));
                        type = type.toLowerCase();
                        if (type === '.jpg' || type === '.jpeg' || type === '.png' || type === '.gif') {
                            // this.previewImg=true
                            // this.imgUrl=path
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
                        // this.previewImg=true
                        // this.imgUrl=path
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
            getAttachmentStateById(ids, attachmentIcon) {
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
                            const fileIndex = this.attachment.findIndex(item => item.id === ids[0]);
                            res.data.data[0].attachmentIcon = attachmentIcon;
                            this.attachment.splice(fileIndex, 1, res.data.data[0]);
                            resolve(res.data.data);
                        } else {
                            resolve(false);
                        }
                    }).catch(err => {
                        reject(err);
                    });
                });
            },
            pageReturn() {
                /**
                 * @Description1: 邮件自动置为已读--原逻辑：点击分屏列表页某行---该邮件置为已读，同时跳转进详情页---获取邮件详情失败
                 *               ----页面跳转回分屏列表页，同时将邮件置为未读；此逻辑极其不合理
                 * @Description2: 修改后的邮件自动置为已读逻辑：只在邮件详情获取成功后，邮件才被置为已读
                 * @Description3: ----此处注释逻辑不合理的代码段，并修正页面跳转的逻辑
                 * @author 杨娣
                 * @date 2020/5/7
                 */
                this.$emit('changeView', 'mailHome');
            },
            reply() {
                this.$emit('update:replyMailType', 'replyCurrent');
                this.$emit('update:mailEdit', true);
                this.$emit('changeView', 'WriteMail');
            },
            replyAll(name) {
                this.$emit('update:replyMailType', 'replyAll');
                this.$emit('update:mailEdit', true);
                this.$emit('changeView', 'WriteMail');
            },
            forward() {
                this.$emit('update:replyMailType', 'forward');
                this.$emit('update:mailEdit', true);
                this.$emit('changeView', 'WriteMail');
            },
            /* 重新编辑 */
            reedit() {
                this.$store.commit('setReplyMailType', 'reedit');
                this.setMailTypeCookie('reedit');
                this.$store.commit('setMailEdit', true);
                this.$emit('handleView', 'WriteMail');
            },
            setMailTypeCookie(type) {
                Cookies.set('replyMailType', type);
            },
            remove() {
                const ids = [];
                ids.push(this.selectedMailId);
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
                        this.$Notice.success({
                            title: this.$t('mail.deleteSuccTip'),
                            message: this.$t('mail.backTomail')
                        });
                        this.backToList();
                    } else {
                        this.$Message.error(this.$t('mail.deleteErrorTip'));
                    }
                });
            },
            /** 标记 -已读未读和标签 */
            markAs(name) {
                if (!name) {
                    return;
                }
                if (name === 'read') {
                    this.readPart(name);
                } else if (name === 'unread') {
                    this.readPart(name);
                } else if (name.includes('tag_')) {
                    this.operateTag(name.split('_')[1], 1);
                } else if (name === 'addtag') {
                    this.addModal = true;
                }
            },
            /** 标记已读/未读 */
            readPart(name) {
                let flag = 0;
                if (name === 'read') {
                    flag = 1;
                } else {
                    flag = 0;
                }
                const ids = (`${this.selectedMailId}`).split(',');
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
                        this.$emit('changeMailReadStatus', this.selectedMailId, flag);

                        // 更新"新收邮件未读数统计数据", 从中剔除掉已读邮件
                        if (flag === 1) {
                            this.$store.commit('updateNewReceiveMails', {
                                type: 'removeRead',
                                data: ids
                            });
                        }
                    }
                });
            },
            /**
             * 移动到自定义文件夹
             */
            moveTo(name) {
                const ids = [];
                ids.push(this.selectedMailId);
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
                        this.$Notice.success({
                            title: this.$t('mail.moveSuccTip'),
                            message: this.$t('mail.backTomail')
                        });
                        this.pageReturn();
                    }
                });
            },
            /** 删除 */
            handleDelete() {
                this.$Modal.confirm({
                    title: this.$t('mail.deleteTitle'),
                    content: this.$t('mail.deleteContent'),
                    onOk: this.remove
                });
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
            handleMore(name) {
                if (name === 'merge') {
                    this.$Modal.confirm({
                        title: this.$t('mail.promptTip'),
                        content: `<p>${this.$t('mail.mergeCurrentTip')}</p><p>${this.$t('mail.mergeWarnTip')}</p>`,
                        onOk: () => {
                            const ids = [];
                            ids.push(this.selectedMailId);
                            util.ajaxMailJson({
                                url: '/mail/moveMailBox',
                                method: 'PUT',
                                data: {
                                    originalMailBoxTypeId: this.mailBoxTypeId,
                                    destinationMailBoxTypeId: '6',
                                    mailBoxIds: ids,
                                    updateUserId: this.userId,
                                    updateUserName: this.userName
                                }
                            }).then(response => {
                                if (response.data.code === 1) {
                                    this.$Notice.success({
                                        title: this.$t('mail.mergeSuccTip'),
                                        message: this.$t('mail.backTomail')
                                    });
                                    util.ajaxJson({
                                        url: '/crm/mailbox/updateInquiryTimeByCompanyIdAndEmails',
                                        method: 'post',
                                        data: JSON.parse(response.data.data)
                                    }).then();
                                    this.pageReturn();
                                } else {
                                    this.$Message.error(response.data.msg);
                                }
                            });
                        }
                    });
                } else if (name === 'delete') {
                    this.deleteModel = true;
                }
            },
            /** 翻译 */
            handleTranslate() {
                util.ajaxInternational({
                    url: '/translation/translationWithSource',
                    method: 'post',
                    data: {
                        requestText: this.content,
                        sourceLang: this.sourceLang,
                        targetLang: this.targetLang
                    }
                }).then(response => {
                    this.content = response.data.data.translations[0].translatedText;
                });
            },
            /** 显示原文 */
            handleRevert() {
                this.content = this.mailDetailData.content;
            },
            /* 附件打包下载 */
            async downloadFileZip() {
                const ids = this.attachment.map(item => item.id);
                const filesInfo = await this.getAttachmentStateById(ids);
                this.attachment = this.getAttachmentIcon(filesInfo);
                if (filesInfo.some(item => item.fileState !== 1)) {
                    this.$Message.error('当前附件还未收取完毕，请稍后再试');
                } else {
                    if (this.downloadingMailIds.findIndex(item => item === this.selectedMailId) !== -1) {
                        this.$Message.warning(this.$t('mail.packageDownloading'));
                        return;
                    }
                    const vm = this;
                    const promises = [];
                    this.$store.commit('setDownloadingMailIds', this.selectedMailId);
                    for (let i = 0; i < this.attachment.length; i++) {
                        promises.push(vm.getFileData(this.attachment[i]));
                    }
                    Promise.all([...promises]).then(() => {
                        const zip = new JSZip();
                        for (let i = 0; i < vm.attachment.length; i++) {
                            const id = vm.attachment[i].id;
                            zip.file(vm.attachment[i].fileName, vm.attachmentDataList[id].data);
                        }
                        zip.generateAsync({ type: 'blob' })
                            .then(function(content) {
                                // see FileSaver.js
                                saveAs(content, vm.title);
                                vm.$store.commit('setDownloadingMailIds', vm.selectedMailId);
                            });
                    }).catch(() => {
                        vm.$store.commit('setDownloadingMailIds', vm.selectedMailId);
                        vm.$Message.error(this.$t('mail.error_packageDownload'));
                    });
                }
            },
            getAttachmentIcon(attachments) {
                attachments.forEach((item) => {
                    const type = item.fileType.toLowerCase();
                    if (type === '.txt') {
                        item.attachmentIcon = 'custom custom-file-text';
                    } else if (type === '.zip' || type === '.rar') {
                        item.attachmentIcon = 'custom custom-file-zip';
                    } else if (type === '.pdf') {
                        item.attachmentIcon = 'custom custom-file-pdf';
                    } else if (type === '.xls' || type === '.xlsx') {
                        item.attachmentIcon = 'custom custom-file-xls';
                    } else if (type === '.doc' || type === '.docx') {
                        item.attachmentIcon = 'custom custom-file-doc';
                    } else if (type === '.ppt' || type === '.pptx') {
                        item.attachmentIcon = 'custom custom-file-ppt';
                    } else {
                        item.attachmentIcon = 'custom custom-file-other';
                    }
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
            /* 创建客户---产品要求修改为邮件录入线索，此方法注释。杨娣 2021/03/05 */
            /* createCustomer(email) {
                this.mailAddress = email;
                this.newCompanyShow = true;
            }, */
            createClue(mailId, email, currentMailAddType,currentMailInfo) {
                if (this.mailAddress === email) {
                    this.littleDrawerVisible = !this.littleDrawerVisible
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
                this.mailAddType = currentMailAddType;
            },
            // 关闭小弹窗
            littleDrawerHidden(val) {
                this.littleDrawerVisible = val;
            },
            // 录入为线索后
            updateStatus(clueId, status) {
                this.clueId = clueId;
                this.updateMailCrmStatus(this.mailAddress, status);
                this.showClue({ clueId, type: 1 });
            },
            // 录入成询盘后
            updateInquiryStatus(clueId, status) {
                this.clueId = clueId;
                this.updateMailCrmStatus(this.mailAddress, status);
                this.getInquiryAndCompanyInfoByEmails();
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
            getInquiryAndCompanyInfoByEmails() {
                const postData = {
                    emailList: [this.mailAddress],
                    userId: this.userId,
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
                        orgId: this.orgId
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
                            this.crmEmails = {
                                from: [],
                                to: [],
                                cc: [],
                                bcc: []
                            };
                            for (let i = 0; i < emailList.length; i++) {
                                /* console.log(i,emailList,  email, res[email]) */
                                const email = emailList[i];
                                res[email].recipient = [email];
                                res[email].email = email;
                                res[email].recieverCrmFlag = res[email].type;
                                res[email].fromOrToFlag = this.mailDetailData.fromOrToFlag;
                                res[email].replyTo = this.mailDetailData.replyTo;
                                if (this.sender.findIndex(item => item.includes(email)) !== -1) {
                                    this.crmEmails.from.push(res[email]);
                                }
                                if (this.recipients.findIndex(item => item.includes(email)) !== -1) {
                                    this.crmEmails.to.push(res[email]);
                                }
                                if (this.recipients_cc.findIndex(item => item.includes(email)) !== -1) {
                                    this.crmEmails.cc.push(res[email]);
                                }
                                if (this.recipients_bcc.findIndex(item => item.includes(email)) !== -1) {
                                    this.crmEmails.bcc.push(res[email]);
                                }
                            }
                        }
                    });
                }
            },
            getAllContactsStatus() {
                const allEmails = this.sender.concat(this.recipients).concat(this.recipients_cc).concat(this.recipients_bcc);
                const mailAdds = [];
                for (let i = 0; i < allEmails.length; i++) {
                    mailAdds.push(this.getStandardEmail(allEmails[i]));
                }
                this.getCompanyStatusByEmails([...new Set(mailAdds)]);
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
            /* 邮件标记星标 / 取消星标 */
            sign_star(flag) {
                util.ajaxMailJson({
                    url: '/mail/mailBoxs/starMailBox',
                    method: 'put',
                    data: {
                        orgId: this.orgId,
                        ids: [this.selectedMailId],
                        mailStarFlag: flag,
                        updateUserId: this.userId,
                        updateUserName: this.userName
                    }
                }).then(({ data }) => {
                    if (data.code === 1) {
                        this.mailStarFlag = String(flag);
                        this.$emit('updateMailFlag', this.selectedMailId, this.mailStarFlag, 'starFlag');
                    } else {
                        this.$Message.error(this.$t('mail.flag_star_error'));
                    }
                }).catch((err) => {
                    this.$Message.error(this.$t('mail.flag_star_error'));
                });
            },
            /* 改变邮件的处理状态 */
            changeProcessingState(status) {
                util.ajaxJson({
                    url: '/mail/toDoMail',
                    method: 'post',
                    data: {
                        ids: [this.selectedMailId],
                        mailFlag: status,
                        orgId: this.orgId,
                        userId: this.userId
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        this.mailToDoFlag = status;
                        this.$emit('updateMailFlag', this.selectedMailId, this.mailToDoFlag, 'toDoFlag');
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
            },
            copyAttachment(item) {
                const copyAttachment = item ? JSON.stringify([item]) : JSON.stringify(this.attachment);
                localStorage.setItem('copyAttachment', copyAttachment);
                this.$store.commit('setCopyAttachmentStatus', !this.copyAttachmentStatus);
                this.$Message.success(this.$t('mail.copyAttachmentTip'));
            },
            // littleDrawer点击事件传递
            handleClick(params) {
                this.$emit('handleClick', params);
            }
        },
        created() {
            this.get_mail_list();
            this.mailDetailinit();
            this.getTags();
        },
        mounted() {
            // 获取全部销售人员 线索弹窗录询盘用
            this.$store.dispatch('getSalesList');
        },
        watch: {
            selectedMailId() {
                this.mailDetailinit();
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
            }
        },
        beforeDestroy() {
            // ai tool bar destory removeEventListener
            const iframe = document.getElementById("mailFrameFloat");
            if(iframe) {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                const element = doc.getElementsByTagName('body')[0];
                element.removeEventListener('mouseup');
            }
        },
    };
</script>
<style lang="less">
@import url('../../../mail/mail-home/components/browserDefault.less');
@import url('../floating-window.less');
.float-window-mail-detail{
    display: -webkit-flex;
    display: flex;
    flex-direction: column;
        .mail-detail-content{
            flex: 1;
            padding: 0 20px;
            overflow-x: hidden;
            overflow-y: auto;
        }
        .mail-detail-footer{
            padding: 20px;
            bottom: 0;
            left: 0;
            right: 0;
            background: #FAFCFF;
            height: 60px;
            line-height: 20px;
        }
        .operates{
            height: 34px;
            margin-bottom: 10px;
            &>li{
                color: rgba(0,0,0,0.60);
                margin-left: 22px;
                line-height: 34px;
                font-size: 16px;
                float: left;
                list-style: none;
                cursor: pointer;
            }
            .change-page{
                height: 30px;
                width: 30px;
                border-radius: 15px;
                text-align: center;
                padding: 0;
                margin: 0 12px;
                background-color: #F5F6F9;
                border: none;
                &>span{
                    line-height: 30px;
                    display: inline-block;
                    font-size: 12px;
                }
                &.ivu-btn{
                    &:focus{
                        box-shadow: none;
                    }
                }
            }
        }

        .title {
            // font-weight: bold;
            font-size: 18px;
            line-height: 26px;
            color: rgba(0,0,0,0.80);
        }
        .detailHead {
            list-style-type: none;
            font-size: 12px;
            color: rgba(0,0,0,0.40);
        }
        .detailHead li {
            line-height: 26px;
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
            font-size: 14px;
            color: #4285F4;
            cursor: pointer;
            i{
                color:rgba(0,0,0,0.40);
                transition: transform .2s ease-in-out,-webkit-transform .2s ease-in-out;
                transform: scale(0.8);
                &.opened{
                    transform: rotate(180deg) scale(0.8);
                }
            }
        }
        /* 标签样式 */
        .ivu-tag{
            border-radius: 11px;
            border-width: 0 !important;
            .ivu-tag-text,i{
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
        .tag-in-table{
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
        .mail-operations {
            float: right;
            margin-right: 5px;
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
    }
.mail-star-operate{
    display: inline-block;
    margin-right: 10px;
}
.header-source {
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
@keyframes ani-load-loop {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
}
</style>
