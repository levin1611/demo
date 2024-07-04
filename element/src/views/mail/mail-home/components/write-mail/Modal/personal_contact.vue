<template>
    <Form :model="contactsFormForShow" class="personal-contact contacts_content_conatiner">
        <Row :gutter="40" style="margin: 0;">
            <Col :span="13" style="padding:0;">
                <FormItem :label="$t('mail.writeLetter.addContactModal.name')">
                    <Input :disabled="filtering" v-model="contactsFormForShow.name"
                        :placeholder="$t('mail.writeLetter.addContactModal.enterKeywordTip')">
                    </Input>
                </FormItem>
            </Col>
            <Col :span="11" style="padding:0;">
                <FormItem :label="$t('mail.writeLetter.addContactModal.email')">
                    <Input :disabled="filtering" v-model="contactsFormForShow.email"
                        :placeholder="$t('mail.writeLetter.addContactModal.enterKeywordTip')">
                    </Input>
                </FormItem>
            </Col>
        </Row>
        <Row :gutter="40" style="margin: 0;">
            <Col :span="13" style="padding:0;">
                <FormItem :label="$t('mail.writeLetter.addContactModal.group')">
                    <Select v-model="group" :disabled="filtering" clearable size="small">
                        <Option :key="index" v-for="(item, index) in groupList" :value="item.id" :label="item.groupName">
                        </Option>
                    </Select>
                </FormItem>
            </Col>
        </Row>
        <FormItem>
            <Button @click="() => searchContact('manual')" type="success" :loading="searchLoading" class="piwik_personal_contact_search_btn">{{$t('mail.writeLetter.addContactModal.filter')}}</Button>
            <Button @click="handleClearFilter" type="minor">{{$t('filter_box.empty')}}</Button>
        </FormItem>
    </Form>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'personal_contact',
        props: {
            currentPage: {
                type: Number,
                default: 1
            },
            isReset: {
                type: Boolean,
                default: false
            },
            changePageOperate: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                filtering: false,
                searchLoading: false,
                contactsFormForShow: {
                    name: '',
                    email: '',
                    group: ''
                },
                contactsFormForSearch: {
                    name: '',
                    email: '',
                    group: ''
                },
                group: '',
                groupList: [{
                    createUserId: this.userId,
                    orgId: this.enterpriseId,
                    id: 0,
                    groupName: '未分组'
                }],
                contactList: [],
                withSearch: false,
                isClosePoptip: true // 是否需要关闭搜索弹窗
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId
            })
        },
        methods: {
            /** 获取个人通讯录列表 */
            getPageList(callBackType) {
                this.contactList = [];
                const jsonData = {
                    contactUserMail: this.contactsFormForSearch.email,
                    contactUserName: this.contactsFormForSearch.name,
                    groupId: this.group,
                    createUserId: this.userId,
                    page: this.currentPage - 1,
                    size: 20
                };
                this.$emit('update:changePageOperate', false);
                util.ajaxMailJson({
                    url: '/mail/mailaddresscontact/pageList',
                    method: 'post',
                    data: jsonData
                }).then(response => {
                    this.filtering = false;
                    this.$emit('isFiltering', false);
                    this.searchLoading = false;
                    if (response.data.code === 1) {
                        if (response.data.data.content.length > 0) {
                            const dataList = response.data.data.content;
                            for (const item of dataList) {
                                const temp = item.contactUserMail.substring(0, item.contactUserMail.lastIndexOf('@'));
                                this.contactList.push({
                                    receiverName: item.contactUserName ? item.contactUserName : temp,
                                    receiveMailAddress: item.contactUserMail,
                                    enterpriseName: item.groupId === 0 ? '--' : item.groupName,
                                    checked: false
                                });
                            }
                        } else {
                            this.contactList = [];
                        }
                        this.$emit('getContactList', this.contactList);
                        this.$emit('getTotalCount', response.data.data.totalElements);
                        if (this.isClosePoptip) {
                            this.$emit('closeFilterPoptip', true);
                        }
                        this.isClosePoptip = true;
                    }
                });
            },
            /** 获取所有分组列表 */
            getGroupList() {
                util.ajaxMail({
                    url: '/mail/addresscontactgroup/all',
                    method: 'get',
                    params: {
                        createUserId: this.userId
                    }
                }).then(response => {
                    if (response.data.code === 1) {
                        this.groupList = this.groupList.concat(response.data.data);
                    } else {
                        this.$Message.error(response.data.msg);
                    }
                });
            },
            /** 查询 */
            searchContact() {
                this.$emit('isFiltering', true);
                if (this.isClosePoptip) {
                    this.filtering = true;
                    this.searchLoading = true;
                }
                this.contactsFormForSearch = this.$deepClone(this.contactsFormForShow);
                if (this.currentPage === 1) {
                    this.getPageList();
                } else {
                    this.$emit('isSearch', true);
                }
            },
            /* 清空筛选条件 */
            handleClearFilter() {
                this.contactsFormForShow = this.contactsFormForSearch = {
                    name: '',
                    email: '',
                    group: ''
                };
                this.group = '';
                this.isClosePoptip = false;
                this.$emit('update:changePageOperate', false);
                if (this.currentPage !== 1) {
                    this.$emit('isSearch');
                } else {
                    this.searchContact();
                }
            }
        },
        created() {
            this.isClosePoptip = false;
            this.getPageList();
            this.getGroupList();
        },
        watch: {
            currentPage: {
                handler(val) {
                    console.log('currentPage变化了-------', val, this.changePageOperate);
                    if (val === 1 && !this.changePageOperate) {
                        this.searchContact();
                    } else {
                        this.getPageList();
                    }
                }
            },
            isReset(val) {
                if (val === true) {
                    // this.contactsForm = {
                    //     name: '',
                    //     email: '',
                    //     group: ''
                    // };
                    this.handleClearFilter();
                }
            }
        }
    };
</script>
<style lang="less" scoped>
    .personal-contact {
        padding: 0 20px;
        /deep/ .el-form-item__content {
            font-size: 12px;
            .el-input {
                font-size: 12px;
                width: 232px;
            }
            .el-select {
                font-size: 12px;
                width: 232px;
                .el-input {
                    width: 100%;
                }
            }
        }
        /deep/ .el-form-item__label {
            font-size: 12px;
            line-height: 25px;
            margin-top: 7px;
            padding-right: 0;
            text-align: left;
        }
        /deep/ .el-button--success {
            float: right;
            font-size: 12px;
            height: 33px;
            line-height: 30px;
            padding-bottom: 0;
            padding-top: 0;
            color: #fff;
            background-color: #7b98b6;
            border-color: #7b98b6;
            &:hover {
                background-color: #95adc5;
                border-color: #95adc5;
            }
        }
        /deep/ .el-button--minor {
            float: right;
            font-size: 12px;
            height: 33px;
            line-height: 30px;
            padding-bottom: 0;
            padding-top: 0;
            margin-right: 10px;
        }
    }
</style>

