<template>
    <div class="timeline-item">
        <div class="item-header clearfloat">
            <!-- 标题 -->
            <div class="item-title">
                <template v-if="item.eventCustomVar.action == 1">{{ $t('timeLine.sendMail') }}</template>
                <template v-else-if="item.eventCustomVar.action == 2">{{ $t('timeLine.getMail') }}</template>
                <!--<template v-else>{{ $t('timeLine.OpenRecord') }}</template>-->
            </div>

            <div v-if="type =='clue'">
                <div class="block-line"></div>
                <div class="item-mail-attachment"
                     v-if="Array.isArray(item.attachments) && item.attachments.length">
                    <Icon size="12" custom="custom custom-mail-annex"/>
                </div>
                <div @click="viewClue(item.clueId)"
                     :class="(type === 'clue' && $route.path.startsWith('/clue_manage')) ? 'header-source-current' : 'header-source'">
                    {{ $t('timeLine.fromClue') }}{{ contactsName }}
                </div>
            </div>
            <!-- 产品提出联系人详情页，在网站交互/FB交互/邮件时间轴后不需要显示“来自联系人xxx”的字样 -->
            <!-- 杨娣 2020/05/27 -->
            <div v-else-if="type !== 'contact' && type !=='journeyDetail'">
                <!-- 分割线 -->
                <div class="block-line"></div>
                <!-- 附件标志 -->
                <div class="item-mail-attachment"
                     v-if="Array.isArray(item.attachments) && item.attachments.length">
                    <Icon size="12" custom="custom custom-mail-annex"/>
                </div>
                <!-- 邮件手动归档至 CRM 时, 若归档对象类型为询盘, 则显示"来自询盘" -->
                <div v-if="item.eventCustomVar.archiveObjectType === 3 && type !== 'inquiry'"
                     @click="$emit('viewInquiry', item.inquiryId)"
                     :class="type === 'inquiry' ? 'header-source-current' : 'header-source'">
                    {{ $t('timeLine.fromInquiry') }}{{ item.eventCustomVar.seqNumber }}
                </div>
                <!-- 非"邮件手动归并至 CRM"情况, 显示"来自联系人" -->
                <div v-if="!item.eventCustomVar.archiveObjectType"
                     @click="$emit('viewContact', item)"
                     :class="type === 'contact' ? 'header-source-current' : 'header-source'">
                    {{ $t('timeLine.fromContacts') }}{{ contactsName }}
                </div>
            </div>
            <div v-else-if="Array.isArray(item.attachments) && item.attachments.length">
                <div class="block-line"></div>
                <div class="item-mail-attachment">
                    <Icon size="12" custom="custom custom-mail-annex"/>
                </div>
            </div>

            <!-- 时间 -->
            <div class="item-time">{{ item.eventTime | timeFormat("DateTime") }}</div>
        </div>

        <!-- 正文 -->
        <div class="item-body">
            <template v-if="item.eventCustomVar.action == 1">
                <div :class="type==='journeyDetail'? 'double-ellipsis' : 'double-ellipsis'" class="item-spacing">
                    <span :title="(item.eventUser && item.eventUser.length > 15) ? item.eventUser : ''">【{{ (item.eventUser && item.eventUser.length > 15) ? item.eventUser.substring(0, 15) + '...' : item.eventUser}}】</span>
                    {{ $t('timeLine.towards') }}
                    <span :title="contactsName.length > 15 ? contactsName : ''">【{{ contactsName.length > 15 ? contactsName.substring(0, 15) + '...' : contactsName}}】</span>
                    {{ $t('timeLine.send') }}
                    <Dropdown trigger.stop="hover" placement="bottom-start"
                              v-if="item.tags && item.tags.length">
                        <span>
                            <span v-for="(tag, index) in item.tags || []"
                                  v-show="index < 3"
                                  :key="Number(tag.labelId)"
                                  class="mail-label"
                                  :style="`background-color:${tag.labelColor};margin-right: -5px;`">
                            </span>
                        </span>
                        <DropdownMenu slot="dropdown" class="mail-label-dropdown-menu">
                            <DropdownItem v-for="tag in item.tags || []" :key="Number(tag.labelId)">
                            <span class="mail-label-dropdown-item"
                                  :style="`background-color:${tag.labelColor};opacity: 1;`"></span>
                                <span style="font-size: 12px;margin-left: 5px;">{{tag.labelName}}</span>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <a @click="$emit('getMailDetail', item)" :title="item.eventCustomVar.mailSubject"
                       :class="{'item-event': true, 'unRead-mail-title': !item.isRead}">
                        【{{ item.eventCustomVar.mailSubject }}】</a>
                </div>
                <!-- 邮件时间轴增加邮件正文显示 -->
                <div v-if="item.mailResumes" :title="item.mailResumes" class="ellipsis">
                    <span>{{$t('timeLine.text')}}：</span>
                    <span>{{`${item.mailResumes.substring(0, 200)}`}}</span>
                </div>
            </template>
            <template v-else-if="item.eventCustomVar.action == 2">
                <div :class="type==='journeyDetail'? 'double-ellipsis' : 'double-ellipsis'"  class="item-spacing">
                    <span :title="contactsName.length > 15 ? contactsName : ''">【{{ contactsName.length > 15 ? contactsName.substring(0, 15) + '...' : contactsName}}】</span>
                    {{ $t('timeLine.towards') }}
                    <span :title="(item.eventUser && item.eventUser.length > 15) ? item.eventUser : ''">【{{ (item.eventUser && item.eventUser.length > 15) ? item.eventUser.substring(0, 15) + '...' : item.eventUser}}】</span>
                    {{ $t('timeLine.send') }}
                    <Dropdown trigger.stop="hover" placement="bottom-start"
                              v-if="item.tags && item.tags.length">
                        <span>
                            <span v-for="(tag, index) in item.tags || []"
                                  v-show="index < 3"
                                  :key="Number(tag.labelId)"
                                  class="mail-label"
                                  :style="`background-color:${tag.labelColor};margin-right: -5px;`">
                            </span>
                        </span>
                        <DropdownMenu slot="dropdown" class="mail-label-dropdown-menu">
                            <DropdownItem v-for="tag in item.tags || []" :key="Number(tag.labelId)">
                            <span class="mail-label-dropdown-item"
                                  :style="`background-color:${tag.labelColor};opacity: 1;`"></span>
                                <span style="font-size: 12px;margin-left: 5px;">{{tag.labelName}}</span>
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <a @click="$emit('getMailDetail', item)" :title="item.eventCustomVar.mailSubject"
                       :class="{'item-event': true, 'unRead-mail-title': !item.isRead}">
                        【{{ item.eventCustomVar.mailSubject }}】</a>
                </div>
                <!-- 邮件时间轴增加邮件正文显示 -->
                <div v-if="item.mailResumes" :title="item.mailResumes" class="ellipsis">
                    <span>{{$t('timeLine.text')}}：</span>
                    <span>{{`${item.mailResumes.substring(0, 200)}`}}</span>
                </div>
            </template>
            <template v-else>
                <Dropdown trigger.stop="hover" placement="bottom-start"
                        v-if="item.tags && item.tags.length">
                    <span>
                        <span v-for="(tag, index) in item.tags || []"
                            v-show="index < 3"
                            :key="Number(tag.labelId)"
                            class="mail-label"
                            :style="`background-color:${tag.labelColor};margin-right: -5px;`">
                        </span>
                    </span>
                    <DropdownMenu slot="dropdown" class="mail-label-dropdown-menu">
                        <DropdownItem v-for="tag in item.tags || []" :key="Number(tag.labelId)">
                        <span class="mail-label-dropdown-item"
                            :style="`background-color:${tag.labelColor};opacity: 1;`"></span>
                            <span style="font-size: 12px;margin-left: 5px;">{{tag.labelName}}</span>
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <!-- 被打开，地点 -->
                <a @click="$emit('getMailDetail', item)"
                :class="{'item-event': true, 'unRead-mail-title': !item.isRead}">
                    【{{ item.eventCustomVar.mailSubject }}】</a>
                {{ $t('timeLine.opened') }}{{ item.eventCustomVar.openPosition }}，
                IP：{{ item.eventCustomVar.openIP }}
            </template>
        </div>

        <!-- 邮件打开记录 -->
        <div v-if="Array.isArray(item.eventActionList) && item.eventActionList.length"
             style="border-top: 1px solid #eaeaea;margin-top: 8px;padding-top: 8px;"
             class="item-body">
            <!-- 第一条打开记录 -->
            <span>最近一次于</span>
            {{ item.eventActionList[0].eventTime | timeFormat("DateTime") }}
            <!-- 时间轴跟进记录不显示邮件主题及邮件标签 杨娣 2020/12/08 -->
            <!--<Dropdown trigger.stop="hover" placement="bottom-start" v-if="item.tags && item.tags.length">
                    <span>
                        <span v-for="(tag, index) in item.tags || []"
                              v-show="index < 3"
                              :key="Number(tag.labelId)"
                              class="mail-label"
                              :style="`background-color:${tag.labelColor};margin-right: -5px;`">
                        </span>
                    </span>
                <DropdownMenu slot="dropdown" class="mail-label-dropdown-menu">
                    <DropdownItem v-for="tag in item.tags || []" :key="Number(tag.labelId)">
                        <span class="mail-label-dropdown-item" :style="`background-color:${tag.labelColor};opacity: 1;`"></span>
                        <span style="font-size: 12px;margin-left: 5px;">{{tag.labelName}}</span>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <a style="color: #4285F4;cursor: default;"
               :class="{'unRead-mail-title': !item.isRead}">
                【{{ item.eventActionList[0].eventCustomVar.mailSubject }}】</a>-->
            {{ $t('timeLine.opened') }}{{ item.eventActionList[0].eventCustomVar.openPosition }}，
            IP：{{ item.eventActionList[0].eventCustomVar.openIP }}

            <!-- 如果有多条打开记录, 则以 Poptip 显示更多 -->
            &nbsp;&nbsp;&nbsp;
            <Poptip v-if="item.mailOpenTimes > 1"
                    width="600"
                    style="margin-left: 8px"
                    @show="getTrackRecordByEmail(item.email, item.eventId)">
                <a slot="reference"
                   class="item-event">{{ $t('mail.more') }}>></a>
                <div>
                    <div style="margin: 10px 10px 0;font-size: 12px;">
                        <div  v-infinite-scroll="load"
                              :infinite-scroll-distance="10"
                              :infinite-scroll-disabled="noMore"
                              style="max-height: 200px;overflow-y: auto;">
                            <div v-for="(eventAction, index) in trackRecordList"
                                style="white-space: normal;" :key="index">
                                {{ eventAction.openTime | timeFormat("DateTime") }}
                                <!-- 时间轴跟进记录不显示邮件主题及邮件标签 杨娣 2020/12/08 -->
                                <!--<Dropdown trigger.stop="hover" placement="bottom-start" v-if="item.tags && item.tags.length">
                                    <span>
                                        <span v-for="(tag, index) in item.tags || []"
                                            v-show="index < 3"
                                            :key="Number(tag.labelId)"
                                            class="mail-label"
                                            :style="`background-color:${tag.labelColor};margin-right: -5px;`">
                                        </span>
                                    </span>
                                    <DropdownMenu slot="dropdown" class="mail-label-dropdown-menu">
                                        <DropdownItem v-for="tag in item.tags || []" :key="Number(tag.labelId)">
                                            <span class="mail-label-dropdown-item" :style="`background-color:${tag.labelColor};opacity: 1;`"></span>
                                            <span style="font-size: 12px;margin-left: 5px;">{{tag.labelName}}</span>
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                                <a :style="{'color': '#4285F4', 'cursor': 'default', 'font-weight': !item.isRead ? 'bolder' : 'normal'}">
                                    【{{ eventAction.eventCustomVar.mailSubject }}】</a>-->
                                {{ $t('timeLine.opened') }}{{ eventAction.openPosition }}，
                                IP：{{ eventAction.openIp }}
                            </div>
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

        <!-- 附件 :公海管理进入不能下载附件-->
        <!-- 时间轴不显示邮件附件列表，仅以附件图标，标识该邮件有附件  杨娣 2020/11/18 -->
        <!--<div v-if="[1, 2].some(action => action == item.eventCustomVar.action) && Array.isArray(item.attachments) && item.attachments.length">
            <div style="margin:15px 0;height:1px;background-color:#EAEAEA;"></div>
            <div>
                &lt;!&ndash; <Icon type="paperclip" size="16"></Icon> &ndash;&gt;
                <span>{{ $t('mail.attachment') }}（{{ item.attachments.length }}{{ $t('b2b.b2b.unit') }}）</span>
                <span v-if="!disabled && item.attachments.length > 1 && show_mail_btn"
                      @click="downloadFileZip(item)"
                      style="cursor:pointer;color:#3b78de;margin-right: 10px;"
                      :class="{'crm-mailattachmentpackagedownload': ['inquiry', 'customer', 'highseasCustomer', 'contact'].includes(originalType), 'highSeas-manage-hide' : disabled}">{{ $t('mail.packageDownload') }}</span>
                <Icon v-if="!disabled && check_isDownloading(item.eventId)"
                      custom="custom-refresh"></Icon>
            </div>
            <div v-for="(file, index) in item.attachments"
                 :key="index"
                 style="margin:5px 10px">
                <div>
                    <Icon :type="file.iconType"></Icon>
                    <span>{{ file.fileName }}</span>
                    （{{ file.fileSize }}）
                </div>
                <div v-if="!disabled && show_mail_btn"
                 :class="{'highSeas-manage-hide' : disabled}">
                    <span @click="downloadFile(file.filePath,file.fileName)"
                          style="margin-right: 10px;"
                          :class="{'header-source': true, 'crm-mailattachmentdownload': ['inquiry', 'customer', 'highseasCustomer', 'contact'].includes(originalType)}">{{ $t('mail.download') }}</span>
                    <span @click="previewFile(file.fileType,file.filePath)"
                          :class="{'header-source': true, 'crm-mailattachmentpreview': ['inquiry', 'customer', 'highseasCustomer', 'contact'].includes(originalType)}">{{ $t('mail.preview') }}</span>
                </div>
            </div>
        </div>-->

        <!-- 评论: 公海管理进入不能回复评论 -->
        <div v-if="[1, 2].some(action => action == item.eventCustomVar.action) && ['inquiry', 'customer', 'highseasCustomer', 'contact', 'clue'].includes(type)">
            <template v-if="reply[item.id]">
                <FollowupReply :replyObj="reply[item.id]"
                               :disabled="disabled"
                               :belongId="belongId"
                               :type="type"
                               :originalType="originalType"
                               :postType="2"
                               :item="item"
                               v-if="item"
                               @replyMailVisibleShow="replyMailVisibleShow"
                               @update_reply="update_reply($event, index)"></FollowupReply>
            </template>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import util from '@/libs/util';
    import FollowupReply from '@/views/main-components/timeline/Components/followupReply';

    export default {
        name: 'mailItem',
        components: {
            FollowupReply
        },
        props: {
            item: {
                type: Object,
                default() {
                    return {};
                }
            },
            disabled: {
                type: Boolean,
                default: false
            },
            type: {
                type: String,
                default: ''
            },
            originalType: {
                type: String,
                default: ''
            },
            belongId: {
                type: [String, Number]
            },
            reply: {
                type: Object,
                default() {
                    return {};
                }
            }
            // replyMailVisible: {
            //     type: Boolean,
            // }
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                clue_short_info: 'clue_short_info'
            }),
            contactsName() {
                // 线索时间轴
                if (this.type === 'clue') {
                    return this.clue_short_info.a1009 || '';
                }

                // 邮箱手动归并至 CRM
                if (this.item.eventCustomVar) {
                    if (this.item.eventCustomVar.archiveObjectType) {
                        return this.item.eventCustomVar.nickName || '';
                    }
                }

                // 正常情况
                return this.item.contactsName || '';
            }
        },
        data() {
            return {
                cancelFunc: null, // axios 请求配置项 cancelToken 相关, 连续多次请求数据时用来取消上一次请求
                trackRecordList: [],
                // itemInfo: {}
                mailId: '',
                moreLoading: true, // 追踪记录更多请求数据 loading
                noMore: false,
                pageNo: 1,
                pageSize: 20
            };
        },
        methods: {
            replyMailVisibleShow(item) {
                // this.itemInfo = item;
                // this.$emit('update:replyMailVisible', true)
                this.$emit('getMailDetailSubject', item);
            },
            // 弹出线索详情
            viewClue(clueId) {
                if (this.$route.path.startsWith('/clue_manage')) {
                    return;
                }
                this.$emit('viewClue', clueId);
            },
            getTrackRecordByEmail(email, id) {
                this.mailId = id;
                // 请求打开记录  分页模式
                this.pageNo = 1;
                this.trackRecordList = [];
                this.noMore = false;
                this.getLogList();
            },
            close_poptip() {
                document.body.click();
            },
            // 更新 reply 对象
            update_reply(data) {
                this.$set(this.reply, this.item.id, data);
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
                const vm = this;
                // 取消之前的数据请求
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }
                this.moreLoading = true;
                util.ajax({
                    url: '/mail/mailTraceRecords',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        mailId: this.mailId,
                        pageNo: this.pageNo,
                        pageSize: this.pageSize
                    },
                    timeout: 50000,
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        // An executor function receives a cancel function as a parameter
                        vm.cancelFunc = c;
                    })
                }).then(response => {
                    this.moreLoading = false;
                    if (response.data.code === 1) {
                        // 当返回数据少于 pageSize 条的时候显示 没有更多数据，同时禁用滚动加载，先不考虑刚好等于 pageSize 条的情况
                        if (response.data.data.length < this.pageSize) {
                            this.noMore = true;
                        }
                        // 当前邮件的全部追踪信息
                        this.trackRecordList = this.trackRecordList.concat(response.data.data || []);
                    } else {
                        this.$Message.error(response.data.message);
                    }
                    this.moreLoading = false;
                });
            }
        }
        // watch: {
        //     itemInfo (val, oldVal) {
        //         if (val) {
        //             this.$emit('getMailDetailSubject', val)
        //         }
        //     }
        // }
    };
</script>

<style lang="less" scoped>
    .mail-label{
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 1px solid #fff;
    }
    .double-ellipsis{
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        overflow:hidden;
        /*! autoprefixer: off */
        -webkit-box-orient: vertical;
    }
    .item-spacing{
        margin-bottom: 10px;
    }
</style>
