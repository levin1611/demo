<template>
    <div>
        <Modal :visible="visible"
               :title="$t('crm.Modal.mail_followUp')"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :append-to-body="true"
               width="56%"
               v-loading="loading"
               class="modal">
            <!-- 内容 -->
            <div>
                <!-- 邮件记录 -->
                <div v-if="mailData.eventCustomVar"
                     class="timeline-item">
                    <div class="item-header clearfloat">
                        <!-- 标题 -->
                        <div v-if="mailData.eventCustomVar.action == 1"
                             class="item-title">{{ $t('timeLine.sendMail') }}</div>
                        <div v-else-if="mailData.eventCustomVar.action == 2"
                             class="item-title">{{ $t('timeLine.getMail') }}</div>
                        <div v-else
                             class="item-title">{{ $t('timeLine.OpenRecord') }}</div>
                        <div class="block-line"></div>
                        <div v-if="data.followup_belong_type === 5"
                             @click="viewClue(mailData.clueId)"
                             :class="(data.followup_belong_type === 5 && $route.path.startsWith('/clue_manage')) ? 'header-source-current' : 'header-source'">
                            {{ $t('timeLine.fromClue') }}{{ clue_short_info.a1009 }}</div>
                        <div v-else
                             @click="viewContact(mailData.contactsId)"
                             :class="data.followup_belong_type === 2 ? 'header-source-current' : 'header-source'">
                            {{ $t('timeLine.fromContacts') }}{{ mailData.contactsName || $t('timeLine.unknown') }}</div>

                        <!-- 时间 -->
                        <div class="item-time">{{ mailData.eventTime | timeFormat("DateTime") }}</div>
                    </div>

                    <!-- 正文 -->
                    <!-- 线索型 -->
                    <template v-if="data.followup_belong_type === 5">
                        <div class="item-body">
                            <template v-if="mailData.eventCustomVar.action == 1">
                                【{{ mailData.eventUser }}】{{ $t('timeLine.towards') }}【{{ clue_short_info.a1009 }}】{{ $t('timeLine.send') }}
                                <Tag v-for="(tag,index) in mailData.tags || []"
                                     :key="index"
                                     :color="getRGB(tag.labelColor)"
                                     :style="`color:${tag.labelColor}`">
                                    <span>{{ tag.labelName }}</span>
                                </Tag>
                                <a @click="viewMail"
                                   :class="{'item-event': true, 'unRead-mail-title': !mailData.isRead}">【{{ mailData.eventCustomVar.mailSubject }}】</a>
                            </template>
                            <template v-else-if="mailData.eventCustomVar.action == 2">
                                【{{ clue_short_info.a1009 }}】{{ $t('timeLine.towards') }}【{{ mailData.eventUser }}】{{ $t('timeLine.send') }}
                                <Tag v-for="(tag,index) in mailData.tags || []"
                                     :key="index"
                                     :color="getRGB(tag.labelColor)"
                                     :style="`color:${tag.labelColor}`">
                                    <span>{{ tag.labelName }}</span>
                                </Tag>
                                <a @click="viewMail"
                                   :class="{'item-event': true, 'unRead-mail-title': !mailData.isRead}">【{{ mailData.eventCustomVar.mailSubject }}】</a>
                            </template>
                            <template v-else>
                                <Tag v-for="(tag,index) in mailData.tags || []"
                                     :key="index"
                                     :color="getRGB(tag.labelColor)"
                                     :style="`color:${tag.labelColor}`">
                                    <span>{{ tag.labelName }}</span>
                                </Tag>
                                <a @click="viewMail"
                                   :class="{'item-event': true, 'unRead-mail-title': !mailData.isRead}">【{{ mailData.eventCustomVar.mailSubject }}】</a>
                                {{ $t('timeLine.opened') }}{{ mailData.eventCustomVar.openPosition }}，IP：{{ mailData.eventCustomVar.openIP }}
                            </template>
                        </div>
                    </template>
                    <!-- 询盘型 -->
                    <template v-else-if="data.followup_belong_type === 3">
                        <div class="item-body">
                            <template v-if="mailData.eventCustomVar.action == 1">
                                【{{ mailData.eventUser }}】{{ $t('timeLine.towards') }}【{{ mailData.contactsName || $t('timeLine.unknown') }}】{{ $t('timeLine.send') }}
                                <Tag v-for="(tag,index) in mailData.tags || []"
                                     :key="index"
                                     :color="getRGB(tag.labelColor)"
                                     :style="`color:${tag.labelColor}`">
                                    <span>{{ tag.labelName }}</span>
                                </Tag>
                                <a @click="viewMail"
                                   :class="{'item-event': true, 'unRead-mail-title': !mailData.isRead}">【{{ mailData.eventCustomVar.mailSubject }}】</a>
                            </template>
                            <template v-else-if="mailData.eventCustomVar.action == 2">
                                【{{ mailData.contactsName || $t('timeLine.unknown') }}】{{ $t('timeLine.towards') }}【{{ mailData.eventUser }}】{{ $t('timeLine.send') }}
                                <Tag v-for="(tag,index) in mailData.tags || []"
                                     :key="index"
                                     :color="getRGB(tag.labelColor)"
                                     :style="`color:${tag.labelColor}`">
                                    <span>{{ tag.labelName }}</span>
                                </Tag>
                                <a @click="viewMail"
                                   :class="{'item-event': true, 'unRead-mail-title': !mailData.isRead}">【{{ mailData.eventCustomVar.mailSubject }}】</a>
                            </template>
                            <template v-else>
                                <Tag v-for="(tag,index) in mailData.tags || []"
                                     :key="index"
                                     :color="getRGB(tag.labelColor)"
                                     :style="`color:${tag.labelColor}`">
                                    <span>{{ tag.labelName }}</span>
                                </Tag>
                                <a @click="viewMail"
                                   :class="{'item-event': true, 'unRead-mail-title': !mailData.isRead}">【{{ mailData.eventCustomVar.mailSubject }}】</a>
                                {{ $t('timeLine.opened') }}{{ mailData.eventCustomVar.openPosition }}，IP：{{ mailData.eventCustomVar.openIP }}
                            </template>
                        </div>

                        <div v-if="Array.isArray(mailData.eventActionList) && mailData.eventActionList.length"
                             style="border-top: 1px solid #d5d8dd;margin-top: 15px;padding-top: 15px;"
                             class="item-body">
                            <!-- 第一条打开记录 -->
                            {{ mailData.eventActionList[0].eventTime | timeFormat("DateTime") }}
                            <Tag v-for="(tag,index) in mailData.tags || []"
                                 :key="index"
                                 :color="getRGB(tag.labelColor)"
                                 :style="`color:${tag.labelColor}`">
                                <span>{{ tag.labelName }}</span>
                            </Tag>
                            <a style="color: #4285F4;cursor: default;"
                               :class="{'unRead-mail-title': !mailData.isRead}">【{{ mailData.eventActionList[0].eventCustomVar.mailSubject }}】</a>
                            {{ $t('timeLine.opened') }}{{ mailData.eventActionList[0].eventCustomVar.openPosition }}，IP：{{ mailData.eventActionList[0].eventCustomVar.openIP }}

                            <!-- 如果有多条打开记录, 则以 Poptip 显示更多 -->
                            &nbsp;&nbsp;&nbsp;
                            <Poptip v-if="mailData.eventActionList.length > 1"
                                    width="600px">
                                <a slot="reference"
                                   class="item-event">{{ $t('mail.more') }}>></a>
                                <div>
                                    <div style="margin: 10px 10px 0;">
                                        <div v-for="eventAction in mailData.eventActionList.slice(1)"
                                             style="white-space: normal;">
                                            {{ eventAction.eventTime | timeFormat("DateTime") }}
                                            <Tag v-for="(tag,index) in mailData.tags || []"
                                                 :key="index"
                                                 :color="getRGB(tag.labelColor)"
                                                 :style="`color:${tag.labelColor}`">
                                                <span>{{ tag.labelName }}</span>
                                            </Tag>
                                            <a :style="{'color': '#4285F4', 'cursor': 'default', 'font-weight': !mailData.isRead ? 'bolder' : 'normal'}">【{{ eventAction.eventCustomVar.mailSubject }}】</a>
                                            {{ $t('timeLine.opened') }}{{ eventAction.eventCustomVar.openPosition }}，IP：{{ eventAction.eventCustomVar.openIP }}
                                        </div>
                                        <br>
                                        <div style="text-align: right">
                                            <a @click="close_poptip"
                                               style="color: #4285F4;">{{ $t('close') }}</a>
                                        </div>
                                    </div>
                                </div>
                            </Poptip>
                        </div>
                    </template>
                    <!-- 其他 -->
                    <template v-else>
                        <div class="item-body">
                            <template v-if="mailData.eventCustomVar.action == 1">
                                【{{ mailData.eventUser }}】{{ $t('timeLine.towards') }}【{{ mailData.contactsName || $t('timeLine.unknown') }}】{{ $t('timeLine.send') }}
                                <Tag v-for="(tag,index) in mailData.tags || []"
                                     :key="index"
                                     :color="getRGB(tag.labelColor)"
                                     :style="`color:${tag.labelColor}`">
                                    <span>{{ tag.labelName }}</span>
                                </Tag>
                                <a @click="viewMail"
                                   :class="{'item-event': true, 'unRead-mail-title': !mailData.isRead}">【{{ mailData.eventCustomVar.mailSubject }}】</a>
                            </template>
                            <template v-else-if="mailData.eventCustomVar.action == 2">
                                【{{ mailData.contactsName || $t('timeLine.unknown') }}】{{ $t('timeLine.towards') }}【{{ mailData.eventUser }}】{{ $t('timeLine.send') }}
                                <Tag v-for="(tag,index) in mailData.tags || []"
                                     :key="index"
                                     :color="getRGB(tag.labelColor)"
                                     :style="`color:${tag.labelColor}`">
                                    <span>{{ tag.labelName }}</span>
                                </Tag>
                                <a @click="viewMail"
                                   :class="{'item-event': true, 'unRead-mail-title': !mailData.isRead}">【{{ mailData.eventCustomVar.mailSubject }}】</a>
                            </template>
                            <template v-else>
                                <Tag v-for="(tag, index) in mailData.tags || []"
                                     :key="index"
                                     :color="getRGB(tag.labelColor)"
                                     :style="`color:${tag.labelColor}`">
                                    <span>{{ tag.labelName }}</span>
                                </Tag>
                                <a @click="viewMail"
                                   :class="{'item-event': true, 'unRead-mail-title': !mailData.isRead}">【{{ mailData.eventCustomVar.mailSubject }}】</a>
                                {{ $t('timeLine.opened') }}{{ mailData.eventCustomVar.openPosition }}，IP：{{ mailData.eventCustomVar.openIP }}
                            </template>
                        </div>
                    </template>

                    <!-- 附件 -->
                    <div v-if="[1, 2].some(action => action == mailData.eventCustomVar.action) && Array.isArray(mailData.attachments) && mailData.attachments.length">
                        <div style="margin:15px 0;height:1px;background-color:#EAEAEA;"></div>
                        <div>
                            <!-- <Icon type="paperclip" size="16"></Icon> -->
                            <span>{{ $t('mail.attachment') }}（{{ mailData.attachments.length }}{{ $t('b2b.b2b.unit') }}）</span>
                            <span v-if="mailData.attachments.length > 1 && show_mail_btn"
                                  @click="downloadFileZip"
                                  style="cursor:pointer;color:#3b78de;margin-right: 10px;"
                                  :class="{'crm-mailattachmentpackagedownload': ['inquiry', 'customer', 'highseasCustomer', 'contact'].includes(data.originalType)}">{{ $t('mail.packageDownload') }}</span>
                            <Icon v-if="check_isDownloading(mailData.eventId)"
                                  custom="custom-refresh"></Icon>
                        </div>
                        <div v-for="(file,index) in mailData.attachments"
                             :key="index"
                             style="margin:5px 10px">
                            <div>
                                <Icon :type="file.iconType"></Icon>
                                <span>{{ file.fileName }}</span>（{{ file.fileSize }}）
                            </div>
                            <div v-if="show_mail_btn">
                            <span @click="downloadFile(file.filePath,file.fileName)"
                                  style="margin-right: 10px;"
                                  :class="{'header-source': true, 'crm-mailattachmentdownload': ['inquiry', 'customer', 'highseasCustomer', 'contact'].includes(data.originalType)}">{{ $t('mail.download') }}</span>
                                <span @click="previewFile(file.fileType,file.filePath)"
                                      :class="{'header-source': true, 'crm-mailattachmentpreview': ['inquiry', 'customer', 'highseasCustomer', 'contact'].includes(data.originalType)}">{{ $t('mail.preview') }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 评论 -->
                    <FollowupReply v-if="show_comments"
                                   :replyObj="replyObj"
                                   :currentId="data.id"
                                   :belongId="data.followup_belong_id"
                                   :followup_belong_type="data.followup_belong_type"
                                   :postType="2"
                                   :originalType="data.originalType"
                                   :open="show_comments"
                                   @update_reply="update_reply"></FollowupReply>
                </div>
            </div>

            <!-- 底部按钮 -->
            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_close') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import JSZip from 'jszip';
    import { saveAs } from 'file-saver';
    import FollowupReply from '@/views/main-components/timeline/Components/followupReply';

    export default {
        name: 'mailModal',
        components: {
            FollowupReply
        },
        props: [
            'visible',
            'data',
        ],
        data() {
            return {
                haveSourceMenu: false, // 是否有邮件评论所属模块的目录权限
                haveAuthority: false, // 是否有邮件评论所属模块的 Id 的权限
                loading: true,

                mailData: {},
                replyObj: {},
                show_comments: false,

                // 批量下载
                attachmentDataList: {}
            };
        },
        computed: {
            ...mapState({
                userName: 'userName',
                fullName: 'fullName',
                userId: 'userId',
                enterpriseId: 'enterpriseId',
                downloadingMailIds: state => state.mail.downloadingMailIds,
                departmentPeople: state => state.mail.departmentPeople // 邮件下属人员 任务提醒与 系统消息提醒 跳转时用到
            }), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            show_mail_btn() {
                return !['xhl-chat', 'visitorHistory', 'FBLeads', 'Fb-comment', 'Fb-chat'].includes(this.data.originalType) && this.haveSourceMenu && this.haveAuthority;
            },
            // 用于校验邮件权限
            authObj() {
                // 数据合法性校验, 未通过直接发回 null
                if (!(this.data && this.data.followup_belong_id && this.data.followup_belong_type)) {
                    return null;
                }

                const result = {
                    id: this.data.followup_belong_id
                };
                switch (this.data.followup_belong_type) {
                    // 公司
                    case 1:
                        result.type = 'Customer';
                        break;
                    // 联系人
                    case 2:
                        result.type = 'Contact';
                        break;
                    // 询盘
                    case 3:
                        result.type = 'Inquiry';
                        break;
                    // 线索
                    case 5:
                        result.type = 'Clue';
                }

                return result;
            }
        },
        methods: {
            // 请求邮件记录内容
            getMailData() {
                this.mailData = {};

                const sendData = {
                    orgId: this.enterpriseId,
                    eventId: this.data.postId,
                    belongType: this.data.followup_belong_type
                    // 还差一个 clueId / inquiryId
                };

                if (this.data.keyId) {
                    sendData.keyId = this.data.keyId;
                    // 1 代表线索， 2代表联系人 5正常应该是客户未知的联系人
                    sendData.keyType = this.data.followup_belong_type === 5 ? 1 : `${sendData.keyId}`.length > 10 ? 1 : 2;
                } else {
                    this.$Message.error(this.$t('message.error_getMailRecordDetail'));
                    this.loading = false;
                    this.cancel();
                    return;
                }

                this.loading = true;
                util.ajaxJson({
                    url: '/crm/time/line/query/getTimeLineByEventCondition',
                    method: 'post',
                    data: sendData
                }).then(res => {
                    if (res.data.code === '1') {
                        const temp = res.data.data.find(item => `${item.eventId}` === `${this.data.postId}`);
                        if (temp) {
                            this.mailData = temp;
                            this.mailData.eventCustomVar = JSON.parse(this.mailData.eventCustomVar);
                            this.mailData.showDetail = false;

                            // 格式化询盘时间轴的"邮件打开记录"数据
                            if (Array.isArray(this.mailData.eventActionList) && this.mailData.eventActionList.length) {
                                this.mailData.eventActionList.forEach(eventActionItem => {
                                    eventActionItem.eventCustomVar = JSON.parse(eventActionItem.eventCustomVar);
                                });

                                // 倒序排序
                                this.mailData.eventActionList.sort((a, b) => b.eventTime - a.eventTime);
                            }

                            // 邮件评论相关
                            this.replyObj = {
                                // 查看已存在的评论和评论对话框
                                visible: false,
                                // input 内容
                                content: '',
                                // 存放要回复的评论的 id , 为 0 时表示回复跟进记录
                                parentId: 0,
                                // 存放要回复的评论的人的 fullName
                                parent_commentatorName: undefined,
                                // 存放要回复的评论的人的 id , 初始值为跟进记录填写者的 id (跟 parentId 初始值为 0 同理)
                                parent_commentatorId: this.mailData.eventCustomVar.createUserId,
                                // 保存中 loading
                                loading_saving: false,
                                // 已存在的评论
                                comments: [],
                                // 已存在的评论数
                                count_comments: 0,
                                // 请求中 loading
                                loading_requesting: false,
                                // 定义最后光标对象
                                lastEditRange: undefined,

                                // 邮件记录部分内容
                                postType: 2,
                                postId: this.mailData.eventId,
                                postContent: this.mailData.eventCustomVar.mailSubject,
                                postCreatorId: this.mailData.eventCustomVar.createUserId,
                                postCreatorName: this.mailData.eventUser,
                                keyId: this.mailData.contactsId || this.mailData.clueId
                            };

                            // 加载评论
                            this.$nextTick(() => {
                                this.show_comments = true;
                            });

                            this.loading = false;

                            // 获取邮件其他信息
                            this.getMailBaseInfo();
                        } else {
                            this.$Message.error(this.$t('message.error_getMailRecordDetail'));

                            this.loading = false;
                        }
                    } else {
                        this.$Message.error(this.$t('message.error_getMailRecordDetail'));

                        this.loading = false;
                    }
                });
            },
            // 请求邮件记录其他信息 - tags + attachment
            getMailBaseInfo() {
                this.loading = true;
                util.ajaxJson({
                    url: '/mail/getMailBaseInformation',
                    method: 'post',
                    data: {
                        enterpriseId: this.enterpriseId,
                        userId: this.userId,
                        mailIds: [this.data.postId],
                        mailInfoDtoList: [{
                            mailId: this.data.postId,
                            createUserId: this.mailData.eventCustomVar.createUserId
                        }]
                    }
                }).then(res => {
                    if (res.data.code == '1') {
                        const arr_mailInfo = res.data.data;
                        const temp = arr_mailInfo.find(mailInfo => `${mailInfo.idString}` === `${this.data.postId}`);
                        if (temp) {
                            this.$set(this.mailData, 'isRead', temp.mailReadFlag === '1' || false);
                            this.$set(this.mailData, 'mailBoxTypeId', temp.mailBoxTypeId);
                            this.$set(this.mailData, 'attachments', temp.mailAttachmentList || []);
                            let tags = [];
                            if (temp.labelName) {
                                const ids = temp.labelId.split(',');
                                const names = temp.labelName.split(',');
                                const colors = temp.labelColor.split(',');
                                tags = names.map((name, index) => {
                                    return {
                                        labelId: ids[index],
                                        labelName: names[index],
                                        labelColor: colors[index]
                                    };
                                });
                            }
                            this.$set(this.mailData, 'tags', tags);
                        }
                        this.$forceUpdate();
                    }
                    this.loading = false;
                });
            },
            // 获取标签后显示标签颜色
            getRGB(hex) {
                const rgb = [];
                if (hex.includes('#')) {
                    hex = hex.substr(1);// 去除前缀 # 号
                    if (hex.length === 3) { // 处理 "#abc" 成 "#aabbcc"
                        hex = hex.replace(/(.)/g, '$1$1');
                    }
                    hex.replace(/../g, function(color) {
                        rgb.push(parseInt(color, 0x10));// 按16进制将字符串转换为数字
                    });
                    return `rgb(${rgb.join(',')},0.12)`;
                } else {
                    return hex;
                }
            },
            // 更新 replyObj
            update_reply(data) {
                this.replyObj = Object.assign({}, data);
            },

            cancel() {
                this.$emit('update:visible', false);
            },

            // 新窗口跳转到联系人
            async viewContact(id) {
                // 无"我的联系人"页面权限, 退出流程
                if (!this.isContainsMenu('myContact')) {
                    this.$Message.warning(this.$t('crm.newDetail.error_noContactsMenuAuthority'));
                    return;
                }

                // 无 contactsId , 退出流程
                if (!id) {
                    this.$Message.warning(this.$t('crm.Modal.error_noneUserInfo'));
                    return false;
                }

                // 查询该联系人 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Contact',
                    id
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 如果是公海联系人
                if (authorized === 'highseas') {
                    if (this.isContainsMenu('highseasCustomer')) {
                        // 如果有公海目录权限
                        this.$viewHighSeasCustomer(this.mailData.companyId);
                        return;
                    } else {
                        // 没有"公海客户"页面权限, 弹出提示
                        this.$Message.warning(this.$t('globalSearch.haveNoPermissionHighseasCustomer'));
                        return;
                    }
                }

                // 新窗口打开联系人详情页
                localStorage.setItem('leadsCloud-contactId', id);
                window.open(this.$router.resolve({
                    name: 'myContact'
                }).href, '_blank');
            },
            // 跳转到线索
            viewClue(clueId) {
                if (!this.isContainsMenu('my_clue')) {
                    this.$Message.warning(this.$t('crm.newDetail.error_noMenuAuthority'));
                }
                localStorage.setItem('leadsCloud-clueId', clueId);
                window.open(this.$router.resolve({
                    name: 'my_clue'
                }).href, '_blank');
            },
            // 跳转到邮件
            async viewMail() {
                // 校验是否有模块查看权限
                if (!this.haveSourceMenu) {
                    this.$Message.warning(this.$t('crm.newDetail.error_noMenuAuthority'));
                    return;
                }

                // 校验是否有该条评论所属的公司/询盘/联系人/线索查看权限
                if (!this.authObj) {
                    this.$Message.error(this.$t('crm.InqSet.error_params'));
                }
                const resAuth = await this.isHaveAuthority(this.authObj);

                if (resAuth === true) {
                    // 校验通过
                    this.haveAuthority = true;
                    this.getMailDetailById(this.mailData.eventId);
                } else {
                    // 校验未通过
                    this.haveAuthority = false;
                    if (resAuth === 'highseas') {
                        // 权限为公海
                        this.$Message.error(this.$t(`crm.Modal.error_viewMailWhen${this.authObj.type}InHighseas`));
                    } else {
                        // 无权限查看
                        this.$Message.error(this.$t('message.error_haveNoPermissionViewMail'));
                    }
                }
            },
            /* 获取邮件详情,跳转至发送失败的邮件详情页 */
            getMailDetailById(id) {
                util.ajaxMailJson({
                    url: '/mail/mailDetail',
                    method: 'GET',
                    params: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        id,
                        createUserId: this.mailData.eventCustomVar.createUserId
                    },
                    timeout: 60000
                }).then(res => {
                    if (res.data.code === 1) {
                        const mailDetail = Object.assign(res.data.data, { id });
                        if (mailDetail.createUserId !== `${this.userId}`) {
                            const currentInputInfo = this.departmentPeople.filter(item => item.createUserId === mailDetail.createUserId);
                            if (currentInputInfo.length) {
                                const currentAccount = currentInputInfo.map(item => item.emailAddress);
                                const jumpMailHome = JSON.stringify({ currentInputInfo: currentInputInfo[0].fullname, currentAccount: currentAccount });
                                localStorage.setItem('leadsCloud-jumpMailHome', jumpMailHome);
                            } else {
                                this.$Message.error('此邮件负责人没有设置"允许上级查看邮件"权限');
                                return;
                            }
                        }
                        localStorage.setItem('leadsCloud-currentPersonId', res.data.data.createUserId);
                        const href = window.location.origin + window.location.pathname + this.$router.resolve({
                            name: 'mail_home'
                        }).href;
                        localStorage.setItem('leadsCloud-timeLine-mailDetail', JSON.stringify(mailDetail));
                        window.open(href, '_blank');
                    } else if (res.data.code === -4 && res.data.msg === '邮件已被删除！') {
                        this.$Message.warning('邮件已被删除！');
                    } else {
                        this.$Message.error('跳转失败，请刷新后重试');
                    }
                }).catch(() => {
                    this.$Message.error('跳转失败，请刷新后重试');
                });
            },
            // 关闭邮件打开记录详情
            close_poptip() {
                document.body.click();
            },

            /* 附件打包下载 */
            downloadFile(path, name) {
                window.open(`http:${path.slice(path.split(':')[0].length + 1)}?attname=${name}`);
            },
            previewFile(type, path) {
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
            },
            downloadFileZip() {
                const mailId = this.mailData.eventId;
                if (this.check_isDownloading(mailId)) {
                    this.$Message.warning(this.$t('mail.packageDownloading'));
                    return;
                }
                const title = this.mailData.eventCustomVar.mailSubject;
                let attachments = this.$deepClone(this.mailData.attachments);
                const vm = this;
                const promises = [];
                this.$store.commit('setDownloadingMailIds', mailId);
                for (let i = 0; i < attachments.length; i++) {
                    promises.push(vm.getFileData(attachments[i], mailId));
                }
                attachments = vm.getAttachmentIcon(attachments);
                attachments = vm.handleSameNameFile(attachments);
                Promise.all([...promises]).then(() => {
                    const zip = new JSZip();
                    for (let i = 0; i < attachments.length; i++) {
                        const id = attachments[i].id;
                        console.log(attachments[i], attachments[i].fileName, vm.attachmentDataList[mailId][id], vm.attachmentDataList[mailId][id].data);
                        zip.file(attachments[i].fileName, vm.attachmentDataList[mailId][id].data);
                    }
                    zip.generateAsync({ type: 'blob' })
                        .then(function(content) {
                            // see FileSaver.js
                            saveAs(content, `${title}.zip`);
                            vm.attachmentDataList[mailId] = {};
                            vm.$store.commit('setDownloadingMailIds', mailId);
                        });
                }).catch(error => {
                    console.error(error);
                    vm.attachmentDataList[mailId] = {};
                    vm.$store.commit('setDownloadingMailIds', mailId);
                    vm.$Message.error(this.$t('mail.error_packageDownload'));
                });
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
            getFileData(file, mailId) {
                if (!this.attachmentDataList[mailId]) {
                    this.$set(this.attachmentDataList, mailId, {});
                }
                return new Promise((resolve, reject) => {
                    util.ajaxDownloadFile({
                        url: file.filePath,
                        method: 'get',
                        params: {
                            attname: file.fileName
                        }
                    }).then(res => {
                        this.attachmentDataList[mailId][file.id] = res;
                        resolve(res);
                    }).catch(error => {
                        console.error(error);
                        reject();
                    });
                });
            },
            check_isDownloading(id) {
                return this.downloadingMailIds.findIndex(item => `${item}` === `${id}`) !== -1;
            }
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        if (this.data && this.data.followup_belong_id && this.data.followup_belong_type) {
                            this.getMailData();
                            (async () => {
                                this.haveAuthority = await this.isHaveAuthority(this.authObj) === true;
                            })();
                            switch (this.data.followup_belong_type) {
                                case 1:
                                    this.haveSourceMenu = this.isContainsMenu('myCustomer');
                                    break;
                                case 2:
                                    this.haveSourceMenu = this.isContainsMenu('myContact');
                                    break;
                                case 3:
                                    this.haveSourceMenu = this.isContainsMenu('myInquiry');
                                    break;
                                case 5:
                                    this.haveSourceMenu = this.isContainsMenu('my_clue');
                                    break;
                                default:
                                    this.haveSourceMenu = false;
                            }
                        } else {
                            this.haveSourceMenu = false;
                            this.haveAuthority = false;
                            this.loading = true;
                            this.$Message.error(this.$t('message.error_getMailRecordDetail'));
                        }
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less">
    @import url('../../../../../main-components/timeline/timeline.less');
</style>

<style lang="less" scoped>
    /* 标签样式 */
    .el-tag {
        cursor: default;
        border-radius: 11px;
        border-width: 0 !important;
    }
</style>
