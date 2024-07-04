<template>
    <div v-loading="isLoading"
         class="time-line-scroll"
         id="timelineBox"
         >
        <!-- 无数据提醒 -->
        <div v-if="dataList.length === 0"
             style="margin-top: 60px;text-align: center;color: #999; ">{{ $t('timeLine.noData') }}</div>

        <!-- 时间轴 -->
        <Timeline v-else
                  class="big-icon-timeline"
                  v-infinite-scroll="loadMore"
                  :infinite-scroll-disabled="noMore || currentTab !== 'Mail'"
                  :infinite-scroll-distance="5"
                  :infinite-scroll-immediate="false">
            <TimelineItem v-for="(item, index) in dataList"
                          :key="index"
                          class="mail">
                <!-- 时间轴图标 -->
                <div slot="dot"
                     class="timeline-dot">
                    <img v-if="item.eventCustomVar.action == 1"
                         src="@/styles/customFont/svg/sendMail.svg"/>
                    <img v-else-if="item.eventCustomVar.action == 2"
                         src="@/styles/customFont/svg/receiveMail.svg"/>
                    <!--<img v-else-->
                    <!--     src="@/styles/customFont/svg/mailOpenRecord.svg"></img>-->
                </div>

                <!-- 时间轴内容 -->
                <MailItem :item="item"
                          :index="index"
                          :disabled="disabled"
                          :type="type ? type :'journeyDetail'"
                          :originalType="originalType"
                          :companyId="companyId"
                          :reply="reply"
                          @getMailDetail="getMailDetail"
                          @viewContact="viewContact"
                          v-on="$listeners"></MailItem>
            </TimelineItem>

            <!-- 邮件详情 -->
            <MailDetail :visible.sync="previewModel"
                        :disabled="disabled"
                        :id="id_previewMail"
                        :type="type"
                        :originalType="originalType"
                        :modalWidth="modal_width"
                        @updateReadStatus="update_mail_readStatus"></MailDetail>
            <p v-if="noMore" class="tileline-no-more-tip">{{$t('noticeWindow.noMore')}}</p>
        </Timeline>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import MailItem from '@/views/main-components/timeline/mail/mailItem';
    import MailDetail from '@/views/main-components/timeline/Components/mailDetail';

    export default {
        name: 'mail',
        components: {
            MailItem,
            MailDetail
        },
        props: [
            'companyId',
            'currentTab',
            'type',
            'originalType',
            'customerInfo',
            'currAccountInfo',
            'mailAddress'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName'
            }),
            modal_width() {
                return parseInt(document.body.clientWidth * 0.8);
            }
        },
        created() {
            // 获取全部用户
            this.$store.dispatch('getAllUsers');
        },
        watch: {
            currentTab: {
                handler(value) {
                    if (value === 'Mail') {
                        this.pageNo = 1;
                        this.noMore = false;
                        if (this.keyword) {
                            this.isMailSearch = true;
                            this.handleSearchMail();
                        } else {
                            this.dataList = [];
                            this.isMailSearch = false;
                            this.getMails();
                        }
                    }
                },
                immediate: true
            }
        },
        data() {
            return {
                cancelFunc: null, // axios 请求配置项 cancelToken 相关, 连续多次请求数据时用来取消上一次请求
                cancelFuncCount: null, // axios 请求配置项 cancelToken 相关, 连续多次请求数据时用来取消上一次请求--单客户搜索获取数量时
                isLoading: true,
                dataList: [],
                disabled: '',
                /* 邮件弹窗 */
                previewModel: false,
                id_previewMail: '',

                // 批量下载
                attachmentDataList: {},

                // 评论
                reply: {},
                pageNo: 1, // 时间轴分页
                noMore: false,
                isMailSearch: false, // 当前是否是邮件搜索的场景
                isUpdateCount: true // 搜索列表更新的同时，是否更新邮件相关的统计数字
            };
        },
        methods: {
            loadMore() {
                // 正在加载中就先不请求接口了
                if (!this.isLoading) {
                    this.pageNo += 1;
                    if (this.isMailSearch) {
                        this.handleSearchMail();
                    } else {
                        this.getMails();
                    }
                }
            },
            getMails() {
                this.isLoading = true;
                const jsonData = {
                    orgId: this.enterpriseId,
                    email: this.mailAddress ? this.mailAddress : this.currAccountInfo.mailAddress,
                    userId: this.userId
                };
                // if (!this.mailAddress) {
                //     jsonData.userId = this.userId;
                // }
                const vm = this;
                // 取消之前的数据请求
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }

                util.ajax({
                    url: '/mail/timeAxis/getTimeAxis4Unfiled',
                    method: 'post',
                    data: jsonData,
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        // An executor function receives a cancel function as a parameter
                        vm.cancelFunc = c;
                    })
                }).then(res => {
                    if (res.data.code === 1) {
                        if (res.data.data && res.data.data.length) {
                            const List = this.handleEventList(res.data.data);
                            this.dataList = List;
                            this.noMore = true;
                        } else {
                            this.$emit('noData', 'visitor-timeLine');
                        }
                    }
                    this.isLoading = false;
                });
            },
            handleEventList(list) {
                list.forEach((item, index) => {
                    item.eventCustomVar = JSON.parse(item.eventCustomVar);
                    item.mailDetail = {};
                    item.showDetail = false;
                    item.isRead = false;
                    item.attachments = [];
                    item.tags = [];
                    item.mailResumes = '';
                    item.contactsName = item.email ? item.email.substring(0, item.email.indexOf('@')) : this.customerInfo.title;

                    // 格式化询盘时间轴的"邮件打开记录"数据
                    if (Array.isArray(item.eventActionList) && item.eventActionList.length) {
                        item.eventActionList.forEach(eventActionItem => {
                            eventActionItem.eventCustomVar = JSON.parse(eventActionItem.eventCustomVar);
                        });

                        // 倒序排序
                        item.eventActionList.sort((a, b) => b.eventTime - a.eventTime);
                    }

                    // 邮件评论相关
                    // const tempI = (this.pageNo - 1) * 20 + index; // index 为分页后的序号,需要转换成this.lineList对应的位置
                    this.$set(this.reply, item.id, {
                        // 查看已存在的评论和评论对话框
                        visible: false,
                        // input 内容
                        content: '',
                        // 存放要回复的评论的 id , 为 0 时表示回复跟进记录
                        parentId: 0,
                        // 存放要回复的评论的人的 fullName
                        parent_commentatorName: undefined,
                        // 存放要回复的评论的人的 id , 初始值为跟进记录填写者的 id (跟 parentId 初始值为 0 同理)
                        parent_commentatorId: item.eventCustomVar.createUserId,
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
                        postId: item.eventId,
                        postContent: item.eventCustomVar.mailSubject,
                        postCreatorId: item.eventCustomVar.createUserId,
                        postCreatorName: item.eventUser,
                        keyId: item.contactsId || item.clueId
                    });
                });

                // 请求评论数
                this.get_count_comments();

                // 时间轴中有邮件时, 获取一些基本信息
                const mailItems = list.filter(item => `${item.eventCategory}` === '2');
                if (mailItems.length) {
                    const mailIds = [];
                    const mailInfoDtoList = [];
                    mailItems.forEach(item => {
                        const mailId = item.eventId;
                        const createUserId = item.eventCustomVar.createUserId;
                        mailIds.push(mailId);
                        mailInfoDtoList.push({
                            mailId,
                            createUserId
                        });
                    });
                    util.ajaxJson({
                        url: '/mail/getMailBaseInformation',
                        method: 'post',
                        data: {
                            enterpriseId: this.enterpriseId,
                            userId: this.userId,
                            mailIds,
                            mailInfoDtoList
                        }
                    }).then(res => {
                        if (res.data.code === 1) {
                            const arr_mailInfo = res.data.data;
                            list.forEach(item => {
                                const temp = arr_mailInfo.find(mailInfo => `${mailInfo.idString}` === `${item.eventId}`);
                                if (temp) {
                                    item.isRead = temp.mailReadFlag === '1' || false;
                                    item.attachments = temp.mailAttachmentList || [];
                                    item.tags = [];
                                    item.mailResumes = temp.mailResumes;
                                    if (temp.labelName) {
                                        const ids = temp.labelId.split(',');
                                        const names = temp.labelName.split(',');
                                        const colors = temp.labelColor.split(',');
                                        item.tags = names.map((name, index) => {
                                            return {
                                                labelId: ids[index],
                                                labelName: names[index],
                                                labelColor: colors[index]
                                            };
                                        });
                                    }
                                }
                            });
                            this.$forceUpdate();
                        }
                    });
                }

                return list;
            },
            showDetail(item) {
                item.showDetail = true;
                console.log(item);
            },
            getMailDetail(mail) {
                this.id_previewMail = mail.eventId;
                this.previewModel = true;
            },

            update_mail_readStatus() {
                let index = this.dataList.findIndex(item => item.eventId === this.id_previewMail);
                if (index !== -1 && !this.dataList[index].isRead) {
                    util.ajaxMailJson({
                        url: '/mail/mailReadFlag',
                        method: 'PUT',
                        data: {
                            orgId: this.enterpriseId,
                            ids: [this.id_previewMail],
                            mailReadFlag: 1,
                            updateUserId: this.userId,
                            updateUserName: this.userName
                        }
                    }).then(res => {
                        if (res.data.code == 1) {
                            index = this.dataList.findIndex(item => item.eventId === this.id_previewMail);
                            if (index !== -1) {
                                this.$set(this.dataList, index, Object.assign(this.dataList[index], { isRead: true }));
                            }
                        }
                    });
                }
            }, // 更改邮件状态为已读

            /* 评论 */
            // 获取回复数量
            get_count_comments() {
                const replyObjs = Object.values(this.reply);
                if (replyObjs.filter(item => item.postId).length) {
                    util.ajaxJson({
                        url: '/crm/comment/getTotal',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            postIds: replyObjs.filter(item => item.postId).map(item => item.postId)
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            const postTypes = [1, 2];
                            postTypes.forEach(postType => {
                                const count_obj = Object.assign({}, ...res.data.data.filter(item => `${item.postType}` === `${postType}`).map(item => {
                                    const temp = {};
                                    temp[item.postId] = item.count;
                                    return temp;
                                }));
                                replyObjs.filter(item => `${item.postType}` === `${postType}`).forEach((reply, index) => {
                                    if (reply.postId && count_obj[reply.postId]) {
                                        reply.count_comments = count_obj[reply.postId];
                                        this.$forceUpdate();
                                    }
                                });
                            });
                        } else {
                            this.$Message.error(this.$t('timeLine.followUpTip1'));
                        }
                    });
                }
            },
            /* 时间轴单客户搜索  注：当前仅支持邮件搜索  2020/11/26 */
            handleSearchMail() {
                this.isLoading = true;
                const contactIds = [];
                if (this.type !== 'clue') {
                    for (const key in this.countObj_mail) {
                        contactIds.push(key);
                    }
                }
                const jsonData = {
                    orgId: this.enterpriseId,
                    startDate: Array.isArray(this.date) ? this.date[0] : undefined,
                    endDate: Array.isArray(this.date) ? this.date[1] : undefined,
                    eventCategory: 2,
                    pageNo: this.pageNo - 1,
                    pageSize: 20,
                    searchContent: this.keyword.trim(),
                    emailType: this.mailType.join(','),
                    contactIds: this.group_mail === 'all' ? contactIds.join(',') : this.group_mail
                };
                switch (this.type) {
                    case 'customer':
                    case 'highseasCustomer':
                        jsonData.companyId = this.companyId;
                        break;
                    case 'inquiry':
                        jsonData.inquiryId = this.companyId;
                        break;
                    case 'contact':
                        jsonData.contactsId = this.companyId;
                        break;
                    case 'clue':
                        jsonData.clueId = this.companyId;
                        break;
                }
                console.log('handleSearchMail()-----', this.keyword, jsonData);
                if (this.isUpdateCount) {
                    this.getSearchMailCount(jsonData);
                }
                this.getSearchMailList(jsonData);
            },
            /* 以下分别为时间轴搜索获取列表数据和邮件数量明细的方法 */
            getSearchMailList(jsonData) {
                /* 列表请求意味着本次搜索动作执行完成，isUpdateCount恢复初始值 */
                this.isUpdateCount = true;
                const vm = this;
                // 取消之前的数据请求
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }
                util.ajaxJson({
                    url: '/es/api/time/line/searchList',
                    method: 'post',
                    data: jsonData,
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        // An executor function receives a cancel function as a parameter
                        vm.cancelFunc = c;
                    })
                }).then(res => {
                    this.isLoading = false;
                    if (this.pageNo === 1) {
                        this.dataList = [];
                        this.reply = {};
                    }
                    if (res.data.code === '1' && res.data.data.item) {
                        if (res.data.data.item.length < 20) {
                            this.noMore = true;
                        }
                        const List = this.handleEventList(res.data.data.item);
                        this.dataList = this.dataList.concat(List);
                    }
                }).catch(err => {
                    this.isLoading = false;
                    console.log('handleSearch()-----err', err);
                    if (err.message) {
                        this.$Message.error(this.$t('timeLine.timeLineSearchError'));
                    }
                });
            },
            getSearchMailCount(jsonData) {
                const vm = this;
                // 取消之前的数据请求
                if (typeof this.cancelFuncCount === 'function') {
                    this.cancelFuncCount();
                }
                util.ajaxJson({
                    url: '/es/api/time/line/searchStat',
                    method: 'post',
                    data: jsonData,
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        // An executor function receives a cancel function as a parameter
                        vm.cancelFuncCount = c;
                    })
                }).then(res => {
                    this.isLoading = false;
                    if (res.data.code === '1') {
                        const obj = {};
                        const stat = {};
                        const detailTemp = res.data.data.find(item => item.type === '2');
                        if (detailTemp && detailTemp.description) {
                            detailTemp.description.forEach(item => {
                                if (item.type === '2') {
                                    obj.receiveCount = item.totalCount;
                                } else {
                                    obj.sendCount = item.totalCount;
                                }
                            });
                            obj.totalCount = detailTemp.totalCount;
                            // obj.detail = detailTemp.detail;
                        }
                        if (detailTemp && detailTemp.detail) {
                            detailTemp.detail.map(i => {
                                const obj = {};
                                obj.name = i.typeName;
                                if (i.description && Array.isArray(i.description)) {
                                    i.description.map(i => {
                                        if (i.type === '2') {
                                            obj.receive = i.totalCount;
                                        }
                                        if (i.type === '1') {
                                            obj.send = i.totalCount;
                                        }
                                    });
                                    stat[i.type] = obj;
                                }
                            });
                        }
                        this.$emit('updateMailCount', obj);
                        this.$emit('update:countObj_mail', Object.assign({}, stat));
                    }
                    console.log('getSearchMailCount()---', res);
                }).catch(err => {
                    this.isLoading = false;
                    console.log('getSearchMailCount()-----err', err);
                    if (err.message) {
                        this.$Message.error(this.$t('timeLine.timeLineSearchError'));
                    }
                });
            },
            viewContact(item) {
                this.$Message.error('当前联系人未建档');
            }
        }
    };
</script>
<style lang="less" scoped>
    .time-line-scroll{
        padding: 10px 20px;
    }
    .InfoList{
        .time-line-scroll{
            padding: 0px;
        }
    }
</style>
