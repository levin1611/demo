<template>
    <div class="avatar-poptip" style="display: inline-block;">
        <Poptip ref="senderPoptip"
                word-wrap
                trigger="hover"
                transfer
                @show="popperShow"
                @hide="popperHide"
                :open-delay="200"
                placement="top"
                v-show="currentCustomerName || params.row.fromOrToFlag!==1"
                popper-class="sender-pop">
            <!--如果currentCustomerName有值，说明是客户箱的列表显示，默认全部显示我的客户的图标-->
            <span slot="reference" @click.stop="operate()" v-if="currentCustomerName || crmFlag===undefined || crmFlag<4">
                <span class="avatar-icon" :style="`color:${avatarColor}; border-color:${avatarColor}`">
                    {{getContactsIdentity(crmFlag)}}
                </span>
            </span>
            <span slot="reference" @click.stop="operate()" v-else-if="crmFlag>3">
                <span class="avatar-icon" :style="`color:${avatarColor}; border-color:${avatarColor}`">
                    {{getContactsIdentity(crmFlag)}}
                </span>
            </span>
            <div class="poptip-content">
                <Spin fix v-if="requesting"></Spin>
                <div style="display: flex;flex-direction: column;font-size: 12px;" v-if="!requesting">
                    <div class="poptip-content-list poptip-content-contacts">
                        <span class="contactsName">{{crmInfo.type === 7 || crmInfo.type === 8 ? crmInfo.name : crmInfo.contactsName}}</span>
                        <span class="contactsIdentity" :style="`color:${avatarColor}; border-color:${avatarColor}`">
                            {{getContactsIdentity(crmInfo.type)}}
                        </span>
                    </div>
                    <div class="poptip-content-list" v-if="crmInfo.type === 7">{{$t('mail.department')}}: {{crmInfo.departmentName}}</div>
                    <div class="poptip-content-list" v-if="crmInfo.type === 8">{{$t('mail.classification')}}: {{crmInfo.groupName}}</div>
                    <div class="poptip-content-list">{{$t('crm.Table.col_email')}}: {{email}}</div>
                    <div class="poptip-content-list" v-if="crmInfo.companyId">{{$t('crm.Detail.corp_companyName')}}:{{crmInfo.companyName}}</div>
                    <div class="poptip-content-list" v-if="crmInfo.saleNames">{{$t('crm.Detail.inquiryManagers')}}:{{crmInfo.saleNames}}</div>
                    <div class="poptip-content-btns">
                        <div>
                            <Button type="text" @click="handleClick('writeMail')" class="piwik_avatarPoptip_writeMail" :title="$t('littleDrawer.writeMail')">{{$t('littleDrawer.writeMail')}}</Button>
                            <Button type="text" @click="handleClick('createNewClue')" v-if="crmInfo.type === 0 && authorized_button['enterClues']" class="piwik_avatarPoptip_enterClues" :title="$t('littleDrawer.enterClues')">{{$t('littleDrawer.enterClues')}}</Button>
                            <Button type="text" @click="handleClick('createNewCompany')" v-if="crmInfo.type === 0 && authorized_button['enterInquiry']" class="piwik_avatarPoptip_enterInquiry" :title="$t('littleDrawer.enterInquiry')">{{$t('littleDrawer.enterInquiry')}}</Button>
                            <Button type="text" @click="handleClick('createRule')" v-if="crmInfo.type !== 0" style="max-width: 90px;" class="piwik_avatarPoptip_createRule" :title="$t('littleDrawer.createRule')">{{$t('littleDrawer.createRule')}}</Button>
                        </div>
                        <Dropdown trigger="hover" placement="top" v-if="crmInfo.type === 0" style="margin-left: 10px;">
                            <Icon
                                size="14"
                                class="el-icon-more"
                                style="transform: rotate(90deg); color: rgba(0, 0, 0, 0.28)"/>
                            <DropdownMenu slot="dropdown" :append-to-body="false" style="min-width:140px">
                                <DropdownItem
                                    class="mail-reply piwik_avatarPoptip_createContent"
                                    @click.native.stop="handleClick('createContent')"
                                    name="createContent"
                                    style="font-size: 12px;white-space: nowrap;">
                                    {{ $t('littleDrawer.createContent') }}
                                </DropdownItem>
                                <DropdownItem
                                    class="mail-reply-all piwik_avatarPoptip_createRule"
                                    @click.native.stop="handleClick('createRule')"
                                    name="createRule"
                                    style="font-size: 12px;white-space: nowrap;">
                                    {{ $t('littleDrawer.createRule') }}
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </Poptip>
    </div>

</template>
<script>
    import util from '@/libs/util.js';
    import { env } from '@/../build/config';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { mapState } from 'vuex';
    export default {
        props: ['params', 'currentInquiryId', 'currentCustomerName'],
        data() {
            return {
                env,
                requesting: true,
                crmInfo: {},
                rightUsers: [] // 负责人列表
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                currentPersonId: state => state.mail.currentPersonId,
                currentAccount: state => state.mail.currentAccount,
                button_list: state => state.app.button_list
            }),
            authorized_button() {
                return {
                    enterClues: !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.id, this.button_list),
                    enterInquiry: !HANDLE_BUTTON(BUTTON_IDS.CRM.inquiry.newCompany, this.button_list)
                };
            },
            /* 小人头跟进状态 */
            crmFlag() {
                return this.params.row.mailCrmFlag;
            },
            /* 小人头颜色 */
            avatarColor() {
                if (this.currentCustomerName) {
                    return '#FF752A';
                }
                if (this.crmFlag === null || this.crmFlag === undefined || this.crmFlag === 0) {
                    return '#90949D';
                } else {
                    switch (this.crmFlag) {
                        case 1:
                        case 4:
                        case 9:
                            return '#4285F2';
                        case 2:
                        case 5:
                        case 10:
                            return '#FF752A';
                        case 3:
                        case 6:
                            return '#00CC99';
                        default:
                            return '#90949D';
                    }
                }
            },
            /* 标准邮箱地址 */
            email() {
                return this.getStandardEmail(this.params.row.sender);
            }
        },
        methods: {
            /**
             * @Description: 注释的邮箱正则校验部分，校验的结果并不准确，比如会将noreply+OHWAEAWRXcW@quip.com校验成为OHWAEAWRXcW@quip.com
             * 原则上是不对的。所以更改一种校验方式
             * @author 杨娣
             * @date 2019/12/4
             */
            /* getStandardEmail(str) {
             // return /<([\s\S]*?)>/.exec(str) ? /<([\s\S]*?)>/.exec(str)[1] : str;
             return /[a-z0-9]+([.]?[-_a-z0-9]+)*@([a-z0-9]+([.-][a-z0-9]+)*\.)[a-z0-9]+/i.exec(str) ? /[a-z0-9]+([.]?[-_a-z0-9]+)*@([a-z0-9]+([.-][a-z0-9]+)*\.)[a-z0-9]+/i.exec(str)[0] : str;
             }, // 获取标准格式的邮箱 */
            /* 获取标准格式的邮箱 */
            getStandardEmail(emailAdd) {
                if (emailAdd && emailAdd.lastIndexOf('<') !== -1) {
                    const startIndex = emailAdd.lastIndexOf('<');
                    const endIndex = emailAdd.lastIndexOf('>');
                    return emailAdd.slice(startIndex + 1, endIndex);
                } else {
                    return emailAdd;
                }
            },
            /* 当浮层显示时的回调，获取邮箱对应的状态并显示对应颜色及提示文字，
                如果接口返回结果与当前显示不一致的话，则调用接口更改为最新的接口返回结果 */
            popperShow() {
                // if (this.currentCustomerName) {
                //     this.requesting = false;
                //     return;
                // }
                // 0未建档 1在CRM公海 2自己客户 3他人客户 4线索公海 5自己线索 6他人线索
                if (this.requesting && this.email) {
                    const email = this.email;
                    const postData = {
                        /* email:this.email, */
                        emailList: [email],
                        userId: this.currentPersonId,
                        orgId: this.enterpriseId

                    };
                    util.ajaxJson({
                        url: '/mail/getContactProfileInfo',
                        method: 'post',
                        data: postData
                    }).then(res => {
                        if (res.data.code === 1) {
                            if (res.data.data[email].success) {
                                this.crmInfo = res.data.data[email];
                                this.rightUsers = [];
                                if (res.data.data[email].rightUsers) {
                                    this.getRightUsers(res.data.data[email].rightUsers);
                                }
                                if (res.data.data[this.email].type !== this.crmFlag) {
                                    this.updateCrmFlag(postData.emailList[0], res.data.data[email].type);
                                }
                                if (this.crmInfo.type === 0) {
                                    this.getEmailNickName();
                                }
                                this.requesting = false;
                                this.$nextTick(() => {
                                    this.$refs.senderPoptip.updatePopper();
                                });
                            } else {
                                /* 后台未查询到小人头状态信息 */
                            }
                        }
                    });
                } else if (!this.email) {
                    this.requesting = false;
                }
            },
            // 通过邮箱地址 获取邮箱nickName
            getEmailNickName() {
                util.ajaxJson({
                    url: '/mail/queryEmailAddress',
                    method: 'POST',
                    data: {
                        createUserId: this.userId,
                        emailAddress: this.email,
                        orgId: this.enterpriseId
                    }
                }).then(res => {
                    if (res.data.code === 1 && res.data.data.length) {
                        const result = res.data.data;
                        this.crmInfo.contactsName = result[0].nickName ? result[0].nickName : this.params.row.contactsName ? this.params.row.contactsName : this.email ? this.email.substring(0, this.email.indexOf('@')) : this.email;
                    } else {
                        this.crmInfo.contactsName = this.params.row.contactsName ? this.params.row.contactsName : this.email ? this.email.substring(0, this.email.indexOf('@')) : this.email;
                    }
                }).catch(err => {
                    console.log('邮件联想地址获取失败', err);
                });
            },
            popperHide() {
                this.requesting = true;
            },
            updateCrmFlag(data, type) {
                util.ajaxMail({
                    url: '/mail/mailBoxs/updateCrmFlagNew',
                    method: 'post',
                    timeout: 360000,
                    data: {
                        address: data,
                        createUserId: this.currentPersonId,
                        orgId: this.enterpriseId
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        this.$emit('changeCrmFlag', {
                            param: this.params.row,
                            key: 'mailCrmFlag',
                            type
                        });
                    }
                });
            },
            getContactsIdentity(type) {
                switch (type) {
                    case 1:
                        return this.$t('mail.customer');
                    case 2:
                        return this.$t('mail.customer');
                    case 3:
                        return this.$t('mail.customer');
                    case 4:
                        return this.$t('mail.clue');
                    case 5:
                        return this.$t('mail.clue');
                    case 6:
                        return this.$t('mail.clue');
                    case 7:
                        return this.$t('mail.colleague');
                    case 8:
                        return this.$t('mail.addressBook');
                    case 9:
                        return this.$t('mail.contact');
                    case 10:
                        return this.$t('mail.contact');
                    default:
                        return this.$t('mail.strange');
                }
            },
            operate() {
                /**
                 * @Description: 如果currentInquiryId有值，说明是来自客户箱的操作，直接显示对应的询盘详情页即可。
                 * @author 杨娣
                 * @date 2019/10/9
                 */
                if (this.requesting || !this.email) {
                    return false;
                }
                let currentMailInfo = {};
                if (this.params.row.mailAddress === '') {
                    currentMailInfo = Object.assign({}, this.params.row, this.crmInfo);
                    currentMailInfo.mailAddress = this.email;
                } else {
                    currentMailInfo = Object.assign({
                        mailAddress: this.email
                    }, this.params.row, this.crmInfo);
                }
                if ([0, 7, 8].includes(this.crmFlag) && !this.crmInfo.touchPointContactId) {
                    this.$Message.error('没有对应的触点联系人');
                    return;
                }
                // if (this.currentInquiryId) {
                //     this.$emit('showCompany', {
                //         companyId: this.crmInfo.companyId,
                //         type: 3, // 当用户在客户箱列表页点击客户小人头时，则需要打开询盘详情页，对应的type为3
                //         currentMailInfo: currentMailInfo
                //     });
                //     return;
                // }
                switch (this.crmFlag) {
                    /*
                    * type与crmFlag的对应关系：0 --- 公海客户/公海线索；1 --- 我的客户/我的线索； 2 --- 他人客户/他人线索
                    *                           上述的type为3，是针对客户箱列表页做的特殊处理
                    * */
                    case 1:
                        this.$emit('showCompany', {
                            /**
                             * @Description: 由于crm公海管理的改版，点击公海小人头，由打开公海询盘详情页，修改为打开公海客户详情页
                             * @author 杨娣
                             * @date 2020/12/21
                            */
                            // companyId: Number(this.crmInfo.inquiryId),
                            companyId: this.crmInfo.companyId,
                            type: 0,
                            currentMailInfo: currentMailInfo
                        });
                        break;
                    case 2:
                        this.$emit('showCompany', {
                            /**
                             * @Description: 如要修改点击橙色小人头标识跳转至目标详情页，修改此处的companyId即可。
                             *               companyId(客户详情页)/inquiryId(询盘详情页)
                             *               注：currentInquiryId为客户箱点击小人头打开的询盘详情页，为特殊处理，
                             *               产品对客户箱有新的小人头处理需求前，不可更改。
                             * @author 杨娣
                             * @date 2021/01/20
                             */
                            companyId: this.crmInfo.companyId,
                            type: 1,
                            currentMailInfo: currentMailInfo
                        });
                        break;
                    case 3:
                        this.$emit('showCompany', {
                            companyId: this.crmInfo.companyId,
                            rightUserIds: this.crmInfo.rightUsers ? Object.keys(this.crmInfo.rightUsers) : [],
                            type: 2,
                            currentMailInfo: currentMailInfo
                        });
                        break;
                    case 4:
                        this.$emit('showClue', {
                            clueId: this.crmInfo.id,
                            type: 0,
                            currentMailInfo: currentMailInfo
                        });
                        break;
                    case 5:
                        this.$emit('showClue', {
                            clueId: this.crmInfo.id,
                            type: 1,
                            currentMailInfo: currentMailInfo
                        });
                        break;
                    case 6:
                        this.$emit('showClue', {
                            clueId: this.crmInfo.id,
                            rightUserIds: this.crmInfo.rightUsers ? Object.keys(this.crmInfo.rightUsers) : [],
                            createUserIds: this.crmInfo.createUsers ? Object.keys(this.crmInfo.createUsers) : [],
                            type: 2,
                            currentMailInfo: currentMailInfo
                        });
                        break;
                    case 0:
                    default:
                        /**
                         * @Description: 当邮件有指定回复邮箱，并且邮件为收件时，录入询盘/线索时自动回填的是指定的回复邮箱的第一个邮箱地址
                         * @author 杨娣
                         * @date 2020/11/18
                         */
                        this.params.row.departmentName = this.crmInfo.departmentName;
                        this.params.row.groupName = this.crmInfo.groupName;
                        if (this.crmInfo.name) this.params.row.combineName = this.crmInfo.name;
                        // this.$emit('createCustomer', this.params.row.replyTo && !this.params.row.fromOrToFlag ? this.getStandardEmail(this.params.row.replyTo.split(',')[0]) : this.email);
                        this.$emit('createClue', this.params.row.id, this.email, '', currentMailInfo);
                }
            },
            getRightUsers(users) {
                for (const usersKey in users) {
                    this.rightUsers.push({
                        userName: users[usersKey],
                        userId: usersKey
                    });
                }
            },
            handleClick(type) {
                const params = {
                    clickType: type,
                    newMailInfo: {
                        mailId: this.params.row.id,
                        mailAddress: this.email,
                        nickName: this.crmInfo.contactsName,
                        followUpId: '',
                        followUpType: ''
                    }
                };
                if ([2, 3].includes(this.crmInfo.type)) {
                    params.newMailInfo.followUpId = this.crmInfo.inquiryId;
                    params.newMailInfo.followUpType = 2;
                }
                if ([5, 6].includes(this.crmInfo.type)) {
                    params.newMailInfo.followUpId = this.crmInfo.id;
                    params.newMailInfo.followUpType = 1;
                }
                this.$emit('handleClick', params);
            }
        }
    };
</script>
<style lang="less" scoped>
    .avatar-poptip {
        display: inline-block;
        span {
            outline: none;
        }
    }
    .avatar-size {
        font-size: 14px;
    }

    .avatar-icon{
        padding: 0 5px;
        border: 1px solid #fff;
        border-radius: 10px;
        font-size: 12px;
    }

    .sender-pop {
        .poptip-content {
            width: 254px;
            padding: 16px;
            display: inline-block;
            min-height: 16px;
            color: #333;
        }

    }
    .poptip-content-btns{
        margin-top: 4px;
        display: flex;
        justify-content: space-between;
        .el-button{
            color: #3B78DE;
            max-width: 58px;
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
            vertical-align: middle;
        }
    }
    .poptip-content-list{
        font-size: 12px;
        line-height: 18px;
        margin-bottom: 8px;
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .poptip-content-contacts {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .contactsName{
            max-width: 160px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        .contactsIdentity {
            padding: 0 5px;
            border: 1px solid #fff;
            border-radius: 10px;
        }
    }
</style>
<style lang="less">
    .sender-pop {
        &.el-popper {
            min-width: 40px;
            padding: 0;
            min-height: 40px;
        }
    }
</style>
