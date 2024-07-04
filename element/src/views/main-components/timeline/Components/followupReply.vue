<template>
    <div class="font-size-12">
        <!-- 外部按钮 -->
        <div style="text-align: right;">
            <div class="reply-operation" v-if="item && item.eventCustomVar && (item.eventCustomVar.action == 2 || item.eventCustomVar.action == 1)">
                <!-- 邮件时间轴的回复，回复全部，转发功能 -->
                <a :class="`followup-comment piwik_${type}_${originalType}_mail_replyCurrent`" @click="reply_mail('replyCurrent')">{{$t('mail.reply')}}</a>
                <a :class="`followup-comment piwik_${type}_${originalType}_mail_replyAll`" @click="reply_mail('replyAll')">{{$t('mail.replyAll')}}</a>
                <!-- 转发 -->
                <a :class="`followup-comment piwik_${type}_${originalType}_mail_forward`" @click="reply_mail('forward')">{{$t('mail.forward')}}</a>
            </div>
            <a @click="view_comments"
               v-if="type !== 'clue'"
               class="followup-comment">{{ $t('followupReply.comment') }}({{ temp_replyObj.count_comments }})</a>
        </div>
        <template v-if="temp_replyObj.visible">
            <!-- 回复 -->
            <div v-if="!disabled" style="margin: 10px 0">
                <div v-loading="temp_replyObj.loading_saving"
                     class="input-panel">
                    <!-- 右上角关闭按钮 -->
                    <!--<div class="editArea-close" @click="cancel_reply()">-->
                    <!--<Icon custom="custom custom-follow-edit-area-close"></Icon>-->
                    <!--</div>-->

                    <!-- 文本框 -->
                    <!--<at-ta :members="allUsers" name-key="fullname">-->
                    <!--<template slot="item" slot-scope="s">-->
                    <!--<span v-text="s.item.fullname"></span>-->
                    <!--</template>-->
                    <!--<textarea v-model="temp_replyObj.content" class="input-panel-textarea" ref="reply_textarea"></textarea>-->
                    <!--</at-ta>-->
                    <div contentEditable
                         ref="reply_textarea"
                         @click="temp_replyObj.lastEditRange = save_range()"
                         @keyup="temp_replyObj.lastEditRange = save_range()"
                         style="overflow-y: auto;"
                         class="input-panel-textarea textAreaShow"></div>
                    <!-- 底部按钮 -->
                    <div class="input-panel-bottom">
                        <div>
                            <!-- 显示评论/回复状态 -->
                            <span v-if="temp_replyObj.parentId !== 0">
                                {{ $t('followupReply.reply') }}
                                <a>{{ temp_replyObj.parent_commentatorName }}</a>
                            </span>
                            <span v-else>{{ $t('followupReply.comment') }}</span>
                            <!-- 显示 @ 销售人员 -->
                            <span style="display: inline-block;padding: 12px 5px 0 15px;">
                                <a style="color: #4285F4;">@</a>
                            </span>
                            <Select v-model="checkedUserId"
                                    multiple
                                    filterable
                                    :placeholder="$t('followupReply.inputUsernameToFilter')"
                                    ref="filterUser"
                                    size="small"
                                    @keydown.native.stop="onKeyDown"
                                    style="display: inline-block;width: auto;padding-top:10px;">
                                <Option v-for="user in allUsers"
                                        :key="user.id"
                                        :value="JSON.stringify(user)"
                                        :label="user.fullname">
                                    <div @click.stop="at_user(JSON.stringify(user))"
                                        style="padding: 7px 16px;margin: -7px -16px;">{{ user.fullname }}</div>
                                </Option>
                            </Select>
                        </div>
                        <!-- 提交按钮 -->
                        <div style="padding-top:10px;">
                            <Button type="success"
                                    size="small"
                                    @click="save_comment"
                                    :class="class_commentsubmission">{{ $t('crm.Html.submit') }}</Button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 查看回复 -->
            <div style="margin: 10px 0">
                <div v-loading="temp_replyObj.loading_requesting"
                     style="position: relative;">
                    <template v-if="temp_replyObj.comments.length">
                        <ReplyTree :data="temp_replyObj.comments"
                                   :currentId="currentId"
                                   :showReply="!disabled"
                                   @reply="reply_comment"></ReplyTree>
                    </template>
                    <template v-else>
                        <p style="text-align: center;">{{ $t('followupReply.noComment') }}</p>
                    </template>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import ReplyTree from '@/views/main-components/timeline/followup/replyTree';

    export default {
        name: 'followupReply',
        components: {
            ReplyTree
        },
        props: [
            'open',
            'replyObj',
            'currentId',
            'belongId',
            'type',
            'originalType',
            'postType',
            'followup_belong_type',
            'disabled',
            'item'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                allUsers: state => state.crm.allUsers // 全部用户
            }),
            class_commentsubmission() {
                switch (this.type) {
                    case 'customer':
                        return (this.replyObj && this.replyObj.postType === 2) ? 'customer-commentsubmission-mail' : 'customer-commentsubmission';
                    case 'contact':
                        return (this.replyObj && this.replyObj.postType === 2) ? 'contact-commentsubmission-mail' : 'contact-commentsubmission';
                    case 'inquiry':
                        return (this.replyObj && this.replyObj.postType === 2) ? 'inquiry-commentsubmission-mail' : 'inquiry-commentsubmission';
                    case 'highseasCustomer':
                        return (this.replyObj && this.replyObj.postType === 2) ? 'highseasCustomer-commentsubmission-mail' : 'highseasCustomer-commentsubmission';
                    default:
                        return '';
                }
            }
        },
        data() {
            return {
                temp_replyObj: undefined,
                checkedUserId: ''
            };
        },
        created() {
            !this.allUsers.length && this.$store.dispatch('getAllUsers');
        },
        methods: {
            onKeyDown(e) {
                if (e.keyCode === 13) {
                    const temp = this.checkedUserId[0];
                    this.at_user(temp);
                    this.$nextTick(() => {
                        this.checkedUserId = '';
                        this.$refs.filterUser.blur();
                    });
                }
            },
            /* 评论 */
            // 保存评论和回复, 评论只需要 index , 回复需要后面的参数
            save_comment() {
                // 未填写内容则中断流程
                if (!this.$refs.reply_textarea.innerText.slice().trim().length) {
                    this.$Message.error(this.$t('followupReply.contentEmptyWarning'));
                    return false;
                }
                // 定义要通知的用户
                const users_at = [];
                // 获取 @ 的用户的 DOM
                const nodes_users = this.$refs.reply_textarea.querySelectorAll('span[userId]');
                // 遍历 DOM 将 @ 用户加入到通知列表
                for (let i = 0; i < nodes_users.length; i++) {
                    const temp = Number(nodes_users[i].getAttribute('userId'));
                    if (!isNaN(temp)) {
                        users_at.push(temp);
                    }
                }

                this.temp_replyObj.loading_saving = true;

                // 定义要通用的发送的数据
                const send_data = {
                    orgId: this.enterpriseId, // 组织机构编码
                    postType: this.postType, // 帖子类型，1是跟进记录
                    postId: this.temp_replyObj.postId, // 如果postType是1，那么这个id就是跟进记录的id
                    postContent: this.temp_replyObj.postContent.slice(0, 50), // 截取50个字符以内
                    postCreatorId: this.temp_replyObj.postCreatorId, // 帖子创建人id
                    postCreatorName: this.temp_replyObj.postCreatorName,
                    parentId: this.temp_replyObj.parentId, // 构建树形结构，一级评论传 0，其他的传父评论的主键 id
                    commentatorId: this.userId, // 评论人 id
                    commentatorName: this.fullName,
                    commentContent: this.$refs.reply_textarea.innerText,
                    commentReadStatus: 1, // 1,未读(暂时好像没啥用)
                    // 这里对通知用户没有去重, 想了想, 如果要复制粘贴时判断 @ 是真的 @ 还是写的文字可以用这个
                    user: JSON.stringify(users_at) // 传 @ 用户的信息(可能多个)，你自己设计结构，原封不动返回字符串
                };

                const keyId = this.temp_replyObj.keyId;

                // 发送保存评论请求
                util.ajax({
                    url: '/crm/comment/save',
                    method: 'post',
                    data: send_data
                }).then(res => {
                    this.temp_replyObj.loading_saving = false;

                    if (res.data.code === '1') {
                        /* 保存右上角通知, 发送 websocket 通知 */

                        // 回复自身, 则不通知自己, parentCommentatorId 不为 undefined 时, 说明需要通知
                        let parentCommentatorId;
                        if (`${this.temp_replyObj.parent_commentatorId}` !== `${this.userId}`) {
                            parentCommentatorId = this.temp_replyObj.parent_commentatorId;
                        }

                        if (users_at.length || parentCommentatorId) {
                            this.save_remind({
                                orgId: this.enterpriseId, // 组织机构编码
                                postType: this.postType, // 帖子类型，1是跟进记录, 2是邮件
                                postId: this.temp_replyObj.postId, // 如果postType是1，那么这个id就是跟进记录的id
                                postContent: this.temp_replyObj.postContent.slice(0, 50), // 截取50个字符以内
                                postCreatorId: this.temp_replyObj.postCreatorId, // 帖子创建人id
                                postCreatorName: this.temp_replyObj.postCreatorName,
                                parentId: this.temp_replyObj.parentId, // 构建树形结构，一级评论传 0，其他的传父评论的主键 id
                                commentatorId: this.userId, // 评论人 id
                                commentatorName: this.fullName,
                                commentContent: this.$refs.reply_textarea.innerText,
                                commentReadStatus: 1, // 1,未读(暂时好像没啥用)
                                user: JSON.stringify(users_at), // 传 @ 用户的信息(可能多个)，你自己设计结构，原封不动返回字符串
                                id: res.data.data,
                                keyId
                            }, parentCommentatorId);
                        }

                        // 清空回初始状态
                        this.$refs.reply_textarea.innerHTML = '';
                        const temp = {
                            // input 内容
                            content: '',
                            // 存放要回复的评论的 id , 为 0 时表示回复跟进记录
                            parentId: 0,
                            // 存放要回复的评论的人的 fullName
                            parent_commentatorName: undefined,
                            // 存放要回复的评论的人的 id , 初始值为跟进记录填写者的 id (跟 parentId 初始值为 0 同理)
                            parent_commentatorId: this.temp_replyObj.postCreatorId,
                            // 已存在的评论
                            comments: [],
                            // 定义最后光标对象
                            lastEditRange: undefined
                        };
                        this.temp_replyObj = Object.assign(this.temp_replyObj, temp);

                        // 重新请求评论
                        this.get_comments();
                    } else {
                        this.$Message.error(this.$t('followupReply.ReplyError'));
                    }

                    // 更新对象数组
                    this.$emit('update_reply', this.temp_replyObj);
                });
            },
            // 发送通知和 ws 消息
            save_remind(data, parentCommentatorId) {
                // 将关联对象类型和 id 加到 data 中去.
                let followup_belong_type = this.followup_belong_type || 0;
                let isGongHai = 0;
                switch (this.type) {
                    case 'inquiry':
                        followup_belong_type = 3;
                        break;
                    case 'customer':
                        followup_belong_type = 1;
                        break;
                    case 'highseasCustomer':
                        followup_belong_type = 1;
                        isGongHai = 1;
                        break;
                    case 'contact':
                        followup_belong_type = 2;
                        break;
                    case 'clue':
                        followup_belong_type = 5;
                        break;
                }
                data.followup_belong_type = followup_belong_type;
                data.followup_belong_id = this.belongId;
                data.originalType = this.originalType;

                // 获取 @ 用户去重数组
                const users_at = [...new Set(JSON.parse(data.user))];

                // 通知被回复/评论的用户
                if (parentCommentatorId) {
                    const remindContent = JSON.stringify(Object.assign({ parentCommentatorId }, data));
                    util.ajaxJson({
                        url: '/new-privilege/msgRemind/save',
                        method: 'post',
                        data: {
                            userIdList: [parentCommentatorId], // 接收人userId
                            orgId: this.enterpriseId, // 企业id
                            remindContent, // 提醒内容
                            relationObjType: 9, // 关联对象
                            seqId: this.belongId, // 询盘/客户/联系人/id
                            isGongHai
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            // 整理提示语
                            let noticeText = '';
                            switch (this.postType) {
                                case 1:
                                    noticeText = data.parentId > 0 ? `【${this.fullName}】 ${this.$t('followupReply.commentReply')}` : `【${this.fullName}】 ${this.$t('followupReply.followupComment')}`;
                                    break;
                                case 2:
                                    noticeText = data.parentId > 0 ? `【${this.fullName}】 ${this.$t('followupReply.commentReply')}` : `【${this.fullName}】 ${this.$t('followupReply.mailComment')}`;
                                    break;
                            }

                            // 发送 websocket 消息
                            if (noticeText) {
                                this.$store.dispatch('sendWSMsg', {
                                    userId: `${this.userId}`,
                                    userIds: [`${parentCommentatorId}`],
                                    text: noticeText,
                                    messageType: 'replyFollowup',
                                    remindContent,
                                    title: this.postType === 2 ? this.$t('crm.Modal.mail_followUp') : this.$t('crm.Modal.module_followUp')
                                });
                            }
                        } else {
                            this.$Message.error(this.$t('followupReply.notifyRelevantUserFail'));
                        }
                    });
                }

                // 通知被 @ 的用户
                if (users_at.length) {
                    const remindContent = JSON.stringify(data);
                    util.ajaxJson({
                        url: '/new-privilege/msgRemind/save',
                        method: 'post',
                        data: {
                            userIdList: users_at, // 接收人userId
                            orgId: this.enterpriseId, // 企业id
                            remindContent, // 提醒内容
                            relationObjType: 9, // 关联对象
                            seqId: this.belongId, // 询盘/客户/联系人/id
                            isGongHai
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            // 发送 websocket 消息
                            if (users_at.length) {
                                // 整理提示语
                                let noticeText = '';
                                switch (this.postType) {
                                    case 1:
                                        noticeText = `【${this.fullName}】 ${this.$t('followupReply.notifyInFollowupComment')}`;
                                        break;
                                    case 2:
                                        noticeText = `【${this.fullName}】 ${this.$t('followupReply.notifyInMailComment')}`;
                                        break;
                                }

                                // 发送 websocket 消息
                                if (noticeText) {
                                    this.$store.dispatch('sendWSMsg', {
                                        userId: `${this.userId}`,
                                        userIds: users_at.map(item => `${item}`),
                                        text: noticeText,
                                        messageType: 'replyFollowup',
                                        remindContent,
                                        title: this.postType === 2 ? this.$t('crm.Modal.mail_followUp') : this.$t('crm.Modal.module_followUp')
                                    });
                                }
                            }
                        } else {
                            this.$Message.error(this.$t('followupReply.notifyRelevantUserFail'));
                        }
                    });
                }
            },
            // cancel_reply(index) {
            //     this.temp_replyObj.content = '';
            //     // 更新对象数组
            //     this.$emit('update_reply', this.temp_replyObj);
            // },

            // 展开 comments , 以便计算回复数量
            unfold_comments(arr) {
                const all_comments = [];

                function unfold(arr) {
                    arr.forEach(item => {
                        const temp = Object.assign({}, item);
                        if (Array.isArray(temp.list) && temp.list.length) {
                            const children = temp.list.slice();
                            delete temp.list;
                            all_comments.push(temp);
                            unfold(children);
                        } else {
                            all_comments.push(temp);
                        }
                    });
                }

                unfold(arr);
                return all_comments;
            },

            // 点击"查看回复"按钮
            view_comments() {
                this.temp_replyObj.visible = !this.temp_replyObj.visible;
                if (this.temp_replyObj.visible) {
                    this.get_comments();
                }
            },
            // 请求评论列表
            get_comments() {
                this.temp_replyObj.loading_requesting = true;
                this.$nextTick(() => {
                    util.ajax({
                        url: '/crm/comment/getList',
                        method: 'get',
                        params: {
                            orgId: this.enterpriseId,
                            postId: this.temp_replyObj.postId,
                            postType: this.postType
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            if (Array.isArray(res.data.data) && res.data.data.length) {
                                this.temp_replyObj.comments = res.data.data.sort((a, b) => Date.parse(b.commentTime) - Date.parse(a.commentTime));
                                this.temp_replyObj.count_comments = this.unfold_comments(res.data.data).length;
                            }
                        } else {
                            this.$Message.error(this.$t('followupReply.getReplyFail'));
                        }
                        this.temp_replyObj.loading_requesting = false;
                        this.temp_replyObj.visible = true;
                        // 更新对象数组
                        this.$emit('update_reply', this.temp_replyObj);
                    });
                });
            },
            // 回复评论
            reply_comment(data) {
                this.temp_replyObj.parentId = data.id;
                this.temp_replyObj.parent_commentatorName = data.commentatorName;
                this.temp_replyObj.parent_commentatorId = data.commentatorId;

                this.$nextTick(() => {
                    this.$refs.reply_textarea.focus();

                    // 恢复之前的光标位置
                    // 获取选定对象
                    let selection = null;
                    if (window.getSelection) {
                        selection = window.getSelection();
                    } else if (window.document.getSelection) {
                        selection = window.document.getSelection();
                    } else if (window.document.selection) {
                        selection = window.document.selection.createRange().text;
                    }
                    // 如果获取不到, 退出流程
                    if (!selection) {
                        return false;
                    }
                    // 判断是否有最后光标对象存在
                    if (this.temp_replyObj.lastEditRange) {
                        // 存在最后光标对象，选定对象清除所有光标并添加最后光标还原之前的状态
                        selection.removeAllRanges();
                        selection.addRange(this.temp_replyObj.lastEditRange);
                    }
                });
            },
            // @ 功能
            at_user(name) {
                // 设置筛选用户 Select 搜索词为空
                console.log(name);
                console.log(this.$refs.filterUser);
                this.$refs.filterUser.setSelected(null);

                // 获取编辑框对象
                const dom_input = this.$refs.reply_textarea;
                // 获取输入框对象
                const sale = JSON.parse(name);
                const dom_at = document.createElement('span');
                dom_at.innerText = `@${sale.fullname}`;
                dom_at.contentEditable = false;
                dom_at.style['user-select'] = 'none';
                dom_at.setAttribute('userId', sale.id);
                // 编辑框设置焦点
                dom_input.focus();
                // 获取选定对象
                let selection = null;
                if (window.getSelection) {
                    selection = window.getSelection();
                } else if (window.document.getSelection) {
                    selection = window.document.getSelection();
                } else if (window.document.selection) {
                    selection = window.document.selection.createRange().text;
                }
                // 如果获取不到, 退出流程
                if (!selection) {
                    this.$Message.error(this.$t('followupReply.browserError'));
                    return false;
                }
                // 判断是否有最后光标对象存在
                if (this.temp_replyObj.lastEditRange) {
                    // 存在最后光标对象，选定对象清除所有光标并添加最后光标还原之前的状态
                    selection.removeAllRanges();
                    selection.addRange(this.temp_replyObj.lastEditRange);
                }

                // 根据所在位置的不同以不同的方式插入结点
                if (selection.anchorNode == dom_input) {
                    // 焦点就在文本框, 则直接 append node 到最后
                    dom_input.appendChild(dom_at);
                } else if (selection.anchorNode.nodeName != '#text') {
                    // 焦点在非文本结点, 则插入到焦点节点后面
                    dom_input.insertBefore(dom_at, selection.anchorNode.nextSibling);
                } else {
                    // 焦点在文本结点, 则在焦点位置文字后插入结点
                    this.temp_replyObj.lastEditRange.insertNode(dom_at);
                }

                // 创建新的光标对象
                const range = document.createRange();
                // 光标对象的范围界定为新建的表情节点
                range.setStartAfter(dom_at);
                // 插入空格, 否则光标可能不显示
                dom_input.insertBefore(document.createTextNode(' '), dom_at.nextSibling);
                range.setStart(dom_at.nextSibling, 1);
                // 使光标开始和光标结束重叠
                range.collapse(true);
                // 清除选定对象的所有光标对象
                selection.removeAllRanges();
                // 插入新的光标对象
                selection.addRange(range);
                // 无论如何都要记录最后光标对象
                this.temp_replyObj.lastEditRange = selection.getRangeAt(0);
            },
            // 离开焦点时先保存状态  var range = save_range();
            save_range() {
                let range = null;
                if (window.getSelection) {
                    const sel = window.getSelection();
                    if (sel.getRangeAt && sel.rangeCount) {
                        range = sel.getRangeAt(0);
                    }
                } else if (document.selection && document.selection.createRange) {
                    range = document.selection.createRange();
                }
                return range;
            },
            // 点击回复，回复全部，转发功能
            reply_mail(name) {
                // 判断当前弹框是显示状态，不允许进行其他操作
                const status = this.$parent.replyMailVisible;
                if (status) {
                    return;
                }
                util.ajaxMailJson({
                    url: `/mail/mailAccounts/user/${this.$store.state.enterpriseId}/${this.$store.state.userId}`,
                    method: 'get',
                    params: {
                        userId: this.userId // 登陆人的userid
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data.accountList.length) {
                            let isInvalidMail = false;
                            for (let i = 0; i < res.data.data.accountList.length; i++) {
                                const item = res.data.data.accountList[i];
                                if (item.pwdWrongFlag === 0) {
                                    isInvalidMail = true;
                                }
                            }
                            if (isInvalidMail) {
                                this.item.mailEdit = true;
                                this.item.mailId = this.item.eventId;
                                this.item.replyType = name;
                                // 弹窗之前先判断有没有已经打开的写信弹窗
                                const doc = document.getElementById('mail_detail_modal');
                                if (!doc) {
                                    this.$emit('replyMailVisibleShow', this.item);
                                }
                            } else {
                                const h = this.$createElement;
                                this.$Message({
                                    message: h('p', {
                                        style: {
                                            fontSize: '12px',
                                            color: '#ff9803'
                                        }
                                    }, [
                                        h('span', null, this.$t('mail.writeLetter.invalidMailboxTip')),
                                        h('a', {
                                            style: 'color: #2d8cf0' ,
                                            on: {
                                                click: (bool) => {
                                                    window.open('#/systemSettings/mail_set', '_blank');
                                                }
                                            }
                                        }, this.$t('mail.writeLetter.goToBindTip'))
                                    ]),
                                    type: 'warning'
                                });
                            }
                        } else {
                            const h = this.$createElement;
                            this.$Message({
                                message: h('p', {
                                    style: {
                                        fontSize: '12px',
                                        color: '#ff9803'
                                    }
                                }, [
                                    h('span', null, this.$t('mail.writeLetter.unboundMailboxTip')),
                                    h('a', {
                                        style: 'color: #2d8cf0' ,
                                        on: {
                                            click: (bool) => {
                                                window.open('#/systemSettings/mail_set', '_blank');
                                            }
                                        }
                                    }, this.$t('mail.writeLetter.goToBindTip'))
                                ]),
                                type: 'warning'
                            });
                        }
                    }
                }).catch(err => {
                        console.log('获取邮箱账号列表接口异常', err);
                });
            }
        },
        watch: {
            replyObj: {
                handler(val) {
                    this.temp_replyObj = val;
                },
                immediate: true
            },
            open: {
                handler(val) {
                    if (val) {
                        this.view_comments();
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less" scoped>

    .textAreaShow {
        white-space: pre-wrap;
        word-wrap: break-word;
        word-break: break-all;
    }

    .editArea-close {
        display: inline-block;
        position: absolute;
        right: 10px;
        top: 10px;
        cursor: pointer;
    }

    .input-panel {
        width: 100%;
        position: relative;
        background: #FFFFFF;
        border: 1px solid #E6E6E6;
        border-radius: 2px;
    }

    .input-panel-textarea {
        border: 0;
        outline: 0px;
        resize: none;
        width: 100%;
        height: 70px;
        padding: 10px 25px 10px 10px;
    }

    .input-panel-bottom {
        vertical-align: middle;
        background: #f8f8f9;
        color: #656565;
        padding: 0 10px 10px;
        display: flex;
        justify-content: space-between;
    }

    .img-remove-icon {
        line-height: 1;
        position: absolute;
        top: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.8);

        i {
            color: #FFF;
            font-size: 15px;
            cursor: pointer;
        }
    }

    .followup-comment {
        color: #3b78de;

        &:hover {
            color: #2d63bc;
            text-decoration: underline;
        }
    }
    .timeline-item{
        .reply-operation {
            display: none;
            a{
                margin-right: 20px;;
            }
        }
        &:hover{
            .reply-operation{
                display: inline-block;
            }
        }
    }
</style>
