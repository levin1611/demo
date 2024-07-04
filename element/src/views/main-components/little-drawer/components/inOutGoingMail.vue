<template>
    <div style="height: 100%;overflow-y: hidden">
        <div style="height: 100%;" v-loading="loading">
            <Tabs v-model="current_mutual" class="mutual-tab" :class="{'inOutGoingMail-mutual-tab' : originalType === 'journeyDetail'}">
                <TabPane v-for="item in mutual_list"
                    :key="item.key"
                    :name="item.key">
                    <span slot="label" :class="item.class">{{item.title}}</span>
                </TabPane>
            </Tabs>
            <div class="inOutGoingMailForm">
                <div class="inOutGoingMailFormBox">
                    <Select
                        @change="init('userId')"
                        v-model="query.userId"
                        ref="userId"
                        placeholder="">
                        <Option
                            class="piwik_inOutGoingMail_userId"
                            v-for="i in allUsers"
                            :key="i.userId"
                            :value="i.userId"
                            :label="i.fullname"
                        ></Option>
                    </Select>
                    <div class="inOutGoingMailFormBoxIcon">
                        <Icon custom="custom-crm-transfer" color="#677F99" size="14"></Icon>
                    </div>
                    <Select
                        @change="init"
                        v-model="query.emailAddress"
                        ref="emailAddress"
                        placeholder="">
                        <Option
                            class="piwik_inOutGoingMail_emailAddress"
                            v-for="i in contentMailList"
                            :key="i.email"
                            :value="i.email"
                            :label="i.name"
                        ></Option>
                    </Select>
                </div>
                <div class="inOutGoingMailFormBox">
                    <Select
                        @change="init"
                        v-model="query.fromOrToFlag"
                        ref="mailBoxTypeId"
                        placeholder="">
                        <Option
                            v-for="(i, index) in folders"
                            :key="index"
                            :value="i.value"
                            :label="i.label"
                        ></Option>
                    </Select>
                </div>
            </div>
            <div class="inOutGoingMailList"
                :class="{'inOutGoingMailList_journeyDetail' : originalType === 'journeyDetail'}"
                v-infinite-scroll="loadMore"
                :infinite-scroll-immediate="false"
                :infinite-scroll-disabled="noMore"
                :infinite-scroll-distance="10">
                <template v-if="current_mutual === 'mailList'">
                    <div class="mailItem piwik_inOutGoingMail_showMailDetai"
                        v-for="(rowData, index) in mailList"
                        :key="index"
                        :class="{'mailItemActive' : id_previewMail === rowData.mailIdString}"
                        @click="showMailDetai(rowData, index)">
                        <div class="mailItemTitle">
                            <div class="mailStatus">
                                <Tooltip placement="top" :content="[0].includes(rowData.fromOrToFlag) ? $t('mail.receiveLetter') : $t('mail.sendLetter')">
                                    <Icon :custom="[0].includes(rowData.fromOrToFlag) ? 'custom-icon_detail_get' : 'custom-icon_detail_send'"></Icon>
                                </Tooltip>
                            </div>
                            <!-- 邮件标签 -->
                            <div class="mailTitle">
                                <span class="mail-theme" :class="{'mail-unread': rowData.mailReadFlag === '0'}">
                                    <i></i>{{rowData.mailSubject}}</span>
                                 <Icon v-if="rowData.mailAttachmentFlag === '1'"
                                    custom="custom custom-mail-annex"
                                    size="14"
                                    :content="$t('mail.attachment')"/>
                                <span class="time">{{rowData.mailSendDate}}</span>
                                <!-- <span class="time">{{rowData.mailSendDate | timeFormat("DateTimeHm") | mailTimeOmiFormat}}</span> -->
                            </div>
                        </div>
                        <div class="mailItemContent">{{rowData.mailResumes}}</div>
                        <div class="mailItemContent" v-if="rowData.traceInfo">{{rowData.traceInfo}}</div>
                    </div>
                </template>
                <template v-if="current_mutual === 'attachmentList'">
                    <div class="attachmentItem"
                        v-for="(rowData, index)  in mailList"
                        :class="{'attachmentItemActive' : attachmentId === rowData.mailIdString}"
                        :key="rowData.id">
                        <div class="mailTitle">
                            <div class="fileName">
                                <fileNameIcon :iconName="rowData.iconType"></fileNameIcon>
                                <span>{{rowData.fileName}}</span>
                            </div>
                            <span class="time">{{rowData.mailSendDate}}</span>
                        </div>
                        <div class="mailTitle mailItemContent">
                            <span class="mail-theme" @click="showMailDetai(rowData, index)">{{rowData.mailSubject}}</span>
                            <div class="list-btn">
                                <Icon custom="custom-view-image piwik_inOutGoingMail_attachment_preview" size="12" color="#7B98B6" style="cursor: pointer; margin:0 12px"
                                    @click="previewFile(rowData)"></Icon>
                                <Icon custom="custom-icon_download piwik_inOutGoingMail_attachment_download" size="14" color="#7B98B6" style="cursor: pointer;"
                                    @click="downloadFile(rowData)"></Icon>
                                <Icon custom="custom-attachment-copy piwik_inOutGoingMail_attachment_copy" size="14" color="#7B98B6" style="cursor: pointer; margin:0 12px"
                                    @click="copyAttachment(rowData)"></Icon>
                            </div>
                        </div>
                    </div>
                </template>
                <!-- 提示: 没有更多 -->
                <p v-if="noMore" class="timeline-no-more-tip">{{ $t('noticeWindow.noMore') }}</p>
            </div>
        </div>
        <!-- <div class="component-wrap" v-else>
            <div class="no-data">
                <img src="@/svg/no-data.svg"
                        :alt="$t('crm.Table.customerColumnsNoData')">
                <p style="margin-top:30px;color:#000">{{ $t('crm.Table.customerColumnsNoData') }}</p>
            </div>
        </div> -->
         <!-- 邮件详情带钉功能 -->
        <littleDrawerMailDetail
            :visible.sync="littleDrawerMailDetailVisible"
            :id.sync="id_previewMail"
            :createUserId="query.userId"
            :type="originalType"></littleDrawerMailDetail>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmCommon } from '@/api/crm/index';
    import littleDrawerMailDetail from '@/views/main-components/little-drawer/components/mailComponents/littleDrawerMailDetail';

    export default {
        name: 'inOutGoingMail',
        props: ['originalType', 'customerInfo', 'from', 'currAccountInfo', 'id'],
        components: {
            littleDrawerMailDetail
        },
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId',
                fullName: state => state.fullName,
                copyAttachmentStatus: state => state.mail.copyAttachmentStatus
            })
        },
        watch: {
            current_mutual: {
                handler(val) {
                    this.init('current_mutual');
                }
            },
            originalType: {
                handler(val) {
                    if (['customer', 'highseasCustomer', 'clue', 'highseasClue'].includes(val)) {
                        this.contentMailList = [{
                            name: this.currAccountInfo.nickName || this.currAccountInfo.contactsName,
                            email: this.currAccountInfo.mailAddress
                        }];
                        this.query.userId = Number(this.userId);
                        this.query.emailAddress = this.currAccountInfo.mailAddress;
                        if (['customer', 'highseasCustomer'].includes(val)) {
                            this.getContactsListByCompany(this.id);
                        }
                        this.init();
                    }
                },
                immediate: true
            },
            customerInfo: {
                handler(val) {
                    if (val) {
                        this.contentMailList = [{
                            name: val.title,
                            email: this.currAccountInfo.mailAddress
                        }];
                        this.query.emailAddress = this.currAccountInfo.mailAddress;
                        this.query.userId = Number(this.userId);
                        if (val.title && this.currAccountInfo.mailAddress) {
                            this.init();
                        }
                    }
                },
                immediate: true,
                deep: true
            },
            // mailCrmFlag 0 未建档 1
            currAccountInfo: {
                handler(val) {
                    // if (val.mailCrmFlag === 0) {
                    //     this.contentMailList = [{
                    //         name: val.contactsName,
                    //         email: val.mailAddress
                    //     }];
                    // } else if ([1, 2].includes(val.mailCrmFlag)) {
                    //     this.getContactsListByCompany(val.companyId);
                    // } else {
                    //     this.contentMailList = [{
                    //         name: val.contactsName,
                    //         email: val.mailAddress
                    //     }];
                    // }
                },
                immediate: true
            }
        },
        data() {
            return {
                loading: true,
                // 视图切换
                visitorDetailLoading: true, // 控制详情页刷新
                mutual_list: [
                    { key: 'mailList', title: this.$t('littleDrawer.mailList'), class: 'piwik_inOutGoingMail_mailList' },
                    { key: 'attachmentList', title: this.$t('littleDrawer.attachmentList'), class: 'piwik_inOutGoingMail_attachmentList' }
                ], // 访客 动态下的 tab 列表
                current_mutual: 'mailList',
                allUsers: [],
                contentMailList: [],
                folders: [
                    {
                        label: this.$t('mailSetting.sendReceiveRules.allMails'),
                        value: ''
                    },
                    {
                        label: this.$t('mailSetting.sendReceiveRules.receive'),
                        value: 0
                    },
                    {
                        label: this.$t('mailSetting.sendReceiveRules.send'),
                        value: 1
                    }
                ],
                query: {
                    userId: '',
                    emailAddress: '',
                    fromOrToFlag: ''
                },
                noMore: false,
                pageNo: 0,
                mailList: [],
                littleDrawerMailDetailVisible: false,
                id_previewMail: '',
                attachmentId: ''
            };
        },
        activated() {
        },
        methods: {
            init(type) {
                this.mailList = [];
                this.pageNo = 0;
                this.noMore = false;
                if (!type) {
                    this.getComeGoUserList();
                } else {
                    this.getData();
                }
            },
            // 获取用户下属
            getComeGoUserList() {
                this.loading = true;
                this.$commonApi.getComeGoUserList({
                    userId: this.userId,
                    enterpriseId: this.orgId,
                    emailAddress: this.query.emailAddress,
                    fromOrToFlag: this.query.fromOrToFlag
                }).then(res => {
                    if (res.code === 1) {
                        const data = res.data.filter(item => item.userId !== Number(this.userId));
                        const allUsers = [
                            { fullname: this.fullName, userId: Number(this.userId) }
                        ];
                        this.allUsers = allUsers.concat(data);
                    }
                    this.getData();
                });
            },
            // 通过企业id获取联系人列表
            getContactsListByCompany(id) {
                crmCommon.getContactsPageListByCompany({
                    id: id,
                    userId: this.userId,
                    orgId: this.orgId
                }).then(res => {
                    if (res.code === '1') {
                        const list = res.data.list || [];
                        //  this.contentMailList = [{
                        //     name: val.contactsName,
                        //     email: val.mailAddress
                        // }];
                        this.contentMailList = list.map(item => {
                            return {
                                name: item.nickName,
                                email: item.email
                            };
                        });
                    }
                });
            },
            // 滚动加载更多
            loadMore() {
                // 正在加载中就先不请求接口了
                if (!this.loading) {
                    this.pageNo++;
                    this.getData();
                }
            },
            // 获取列表数据
            getData() {
                this.loading = true;
                const postData = Object.assign({
                    createUserId: this.userId,
                    enterpriseId: this.orgId,
                    page: this.pageNo,
                    size: 100
                }, this.query);
                let url = '/mail/comeGoAttachmentPageList';
                if (this.current_mutual === 'mailList') {
                    url = '/mail/comeGoMailPageList';
                    postData.size = 50;
                }
                this.$util.ajaxMailJson({
                    url: url,
                    method: 'POST',
                    data: postData
                }).then((response) => {
                    this.loading = false;
                    if (response.data.code === 1) {
                        if (!response.data.data.content.length) {
                            this.noMore = true;
                            return;
                        }
                        const data = response.data.data.content;
                        if (this.current_mutual !== 'mailList') {
                            data.forEach(item => {
                                item.iconType = item.fileType.substring(item.fileType.lastIndexOf('.') + 1).toLowerCase();
                            });
                        }
                        this.mailList = this.mailList.concat(data);
                    } else {
                        this.noMore = true;
                    }
                });
            },
            showMailDetai(rowData, index) {
                if (Number(this.userId) === this.query.userId) {
                    this.$set(this.mailList, index, Object.assign(this.mailList[index], { mailReadFlag: '1' }));
                }
                this.id_previewMail = rowData.mailIdString;
                this.attachmentId = rowData.id;
                this.littleDrawerMailDetailVisible = true;
                // this.$nextTick(() => {
                //     this.littleDrawerMailDetailVisible = true;
                // });
            },
            // 附件预览
            async previewFile(rowData) {
                /* state---附件状态：0附件开始接收；1已经成功接收完附件；2附件接收途中报错了;默认是1 */
                if (rowData.fileState !== 1) {
                    const fileInfo = await this.getAttachmentStateById([rowData.id], rowData.fileType);
                    if (fileInfo[0].fileState !== 1) {
                        this.$Message.error('当前附件还未收取完毕，请稍后再试');
                    } else {
                        const path = fileInfo[0].filePath;
                        let type = fileInfo[0].fileType;
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
                    const path = rowData.filePath;
                    let type = rowData.fileType.slice(rowData.fileType.lastIndexOf('.'));
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
            // 附件下载
            async downloadFile(rowData) {
                /* state---附件状态：0附件开始接收；1已经成功接收完附件；2附件接收途中报错了;默认是1 */
                if (rowData.fileState !== 1) {
                    const fileInfo = await this.getAttachmentStateById([rowData.id], rowData.fileType);
                    if (fileInfo[0].fileState !== 1) {
                        this.$Message.error('当前附件还未收取完毕，请稍后再试');
                    } else {
                        const path = fileInfo[0].filePath;
                        const name = fileInfo[0].fileName;
                        window.open(`//${path.slice(path.split(':')[0].length + 1)}?attname=${encodeURIComponent(name)}`);
                    }
                } else {
                    const path = rowData.filePath;
                    window.open(`//${path.slice(path.split(':')[0].length + 1)}?attname=${encodeURIComponent(rowData.fileName)}`);
                }
            },
            /* 通过附件id查询附件信息 */
            getAttachmentStateById(ids, iconType) {
                return new Promise((resolve, reject) => {
                    this.$util.ajaxMailParamsSerializer({
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
                                const fileIndex = this.mailList.findIndex(item => item.id === ids[0]);
                                res.data.data[0].iconType = iconType;
                                this.mailList.splice(fileIndex, 1, res.data.data[0]);
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
            // 复制附件
            copyAttachment(item) {
                const copyAttachment = item ? JSON.stringify([item]) : JSON.stringify(this.attachments);
                localStorage.setItem('copyAttachment', copyAttachment);
                this.$store.commit('setCopyAttachmentStatus', !this.copyAttachmentStatus);
                this.$Message.success(this.$t('mail.copyAttachmentTip'));
            }
        },
        created() {
        },
        mounted() {
        }
    };
</script>

<style lang="less" scoped>
    .mutual-tab{
        // padding: 0 15px;
        /deep/ .el-tabs__header {
            border-bottom: none;
        }

        /deep/ .el-tabs__nav-wrap {
            height: 40px;
            line-height: 32px;
            overflow: inherit;
        }

        /deep/ .el-tabs__nav .el-tabs__item {
            padding: 3px 15px 3px 0;
            font-size: 13px;
            line-height: 40px;
            outline: none;
            vertical-align: middle;
            &:active {
                color: #4285F4 !important;
                outline: none;
            }

            &:hover {
                color: #4285F4 !important;

                .custom-menu-arrow {
                    color: #4285F4 !important;
                }
            }

            &.is-active {
                color: #4285F4;
                outline: none;
                i {
                    color: #4285F4 !important;
                }
            }
        }

        /deep/ .el-tabs__active-bar {
            display: none;
        }

        /deep/ .el-tabs__nav-wrap:after {
            display: none;
        }
    }
    .inOutGoingMailForm{
        margin-bottom: 20px;
    }
    .inOutGoingMailFormBox {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        .inOutGoingMailFormBoxIcon{
            text-align: center;
            line-height: 40px;
            // width: 50px;
        }
        .el-select {
            width: 150px;
        }
    }
    .inOutGoingMailList {
        height: calc(100vh - 50vh);
        overflow-y: auto;
        .mailItem {
            padding: 10px 0;
            cursor: pointer;
            border-bottom: 1px dashed #eceef5;
            &:hover{
                background: #f6f7fa;
            }
            .mailItemTitle{
                display: flex;
                align-items: center;
                white-space: nowrap;
                overflow: hidden;
                line-height: 18px;
                margin-bottom: 6px;
                .mailStatus {
                    width: 14px;
                    margin-right: 12px;
                }
                .mail-label-box {
                    margin-right: 4px;
                    .mail-label {
                        display: inline-block;
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        background: rgba(234, 67, 53, 1);
                    }
                }
                .mailTitle{
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 14px;
                    color: rgba(0, 0, 0, 0.8);
                    .mail-theme {
                        width: 240px;
                        font-weight: 400;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                    .mail-unread {
                        font-weight: 900;
                        i {
                            display: inline-block;
                            width: 8px;
                            height: 8px;
                            background: #EA4335;
                            border-radius: 50%;
                            margin-right: 4px;
                        }
                    }
                    .time{
                        font-size: 12px;
                        color: rgba(0, 0, 0, 0.6);
                    }
                }
            }
            .mailItemContent {
                padding-left: 26px;
                font-size: 12px;
                color: rgba(0, 0, 0, 0.6);
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
        .attachmentItem {
            padding: 10px 0;
            border-bottom: 1px dashed #eceef5;
            &:hover{
                background: #f6f7fa;
            }
            .mailTitle {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 6px;
                .fileName {
                    display: flex;
                    align-items: center;
                    font-size: 14px;
                    svg {
                        margin-right: 10px;
                    }
                    span {
                        max-width: 200px;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                }
            }
            .mailItemContent {
                padding-left: 34px;
                line-height: 18px;
                .mail-theme {
                    width: 240px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    font-size: 12px;
                    color: rgba(59, 120, 222, 1);
                    cursor: pointer;
                }
                .list-btn {
                    display: flex;
                    align-items: center;
                }
            }
        }
        .mailItemActive, .attachmentItemActive {
            background: #fff3ec;
        }
    }
    .inOutGoingMailList_journeyDetail {
        height: calc(100vh - 45vh);
    }
    .mailSinglePage {
        .inOutGoingMailList{
            height: calc(100vh - 45vh);
        }
        .inOutGoingMailList_journeyDetail {
            height: calc(100vh - 40vh);
        }
    }
</style>
