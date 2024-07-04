<template>
    <div>
        <Modal
                :title="$t('mail.writeLetter.addContactModal.selectContact')"
                :visible="visible"
                :modal-append-to-body="false"
                :show-close="false"
                class="contactModel">
            <Menu mode="horizontal" :default-active="currentContactType" @select="changeContactType">
                <MenuItem index="clue_contact">
                    {{$t('mail.writeLetter.addContactModal.clueContact')}}
                </MenuItem>
                <MenuItem index="customer_contact">
                    {{$t('mail.writeLetter.addContactModal.customerContact')}}
                </MenuItem>
<!--                <MenuItem index="colleagues_contact">-->
<!--                    {{$t('mail.writeLetter.addContactModal.colleagues')}}-->
<!--                </MenuItem>-->
<!--                <MenuItem index="personal_contact">-->
<!--                    {{$t('mail.writeLetter.addContactModal.personalAddressBook')}}-->
<!--                </MenuItem>-->
            </Menu>
            <component
                    :is="currentContactType"
                    :currentPage="currentPage"
                    :isReset="isReset"
                    @getTotalCount="num=>totalCount=num"
                    @getContactList="list=>contactList=list"
                    @isSearch="currentPage=1"
                    @isFiltering="is=>filtering=is">
            </component>
            <Row style="margin-bottom: 16px;" >
                <Col :span="15">
                    <Card shadow="never" v-loading="filtering" class="address_book_body" :style="'height:'+(windowHeight-420)+'px;border-right: none !important;'" dis-hover>
                        <div slot="header">
                            {{currentContactTypeName}}
                            <Page
                                    small
                                    :current="currentPage"
                                    :page-size="20"
                                    :total="totalCount"
                                    layout="prev, pager, next"
                                    @current-change="changePage"
                                    style="float:right;margin-top:-5px">
                            </Page>
                        </div>
                        <div class="contacts-header">
                            <Row :gutter="16">
                                <Col :span="2">
                                    <Checkbox
                                            v-model="checkAll"
                                            :disabled="!contactList.length"
                                            @change="handleCheckAll">
                                    </Checkbox>
                                </Col>
                                <Col :span="22">{{$t('mail.writeLetter.addContactModal.selectAll')}}</Col>
                            </Row>
                        </div>
                        <div class="contacts-content" v-if="contactList.length">
                            <Row :gutter="16" :key="key" v-for="(contact, key) in contactList">
                                <Col :span="3">
                                    <Checkbox v-model="contact.checked" @change="contactOnChange(key)"></Checkbox>
                                </Col>
                                <Col :span="11">{{ contact.receiverName }} <{{ contact.receiveMailAddress }}></Col>
                                <Col :span="10">{{ contact.enterpriseName }}</Col>
                            </Row>
                        </div>
                    </Card>
                </Col>
                <Col :span="9">
                    <Card shadow="never" class="address_book_body" :style="'height:'+(windowHeight-420)+'px'" dis-hover>
                        <div slot="header">
                            <span>
                                {{$t('mail.writeLetter.recipients')}}({{ checkedContactList.length }})
                            </span>
                            <a slot="extra" class="clear-all-contacts" @click="clearAll">{{$t('mail.writeLetter.addContactModal.clearAll')}}</a>
                        </div>
                        <div style="overflow: auto;">
                            <div v-for="(contact,index) in checkedContactList" :key="index"
                                 style="margin-bottom: 30px;word-break: break-all;">
                                {{ contact.receiverName }} <{{ contact.receiveMailAddress }}>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <div slot="footer">
                <Button @click="cancel">{{$t('cancel')}}</Button>
                <Button @click="reset">{{$t('reset')}}</Button>
                <Button type="primary" @click="ok" class="mail-saveforcontacts">{{$t('save')}}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';

    import clue_contact from '@/views/mail/mail-home/components/write-mail/Modal/clue_contact.vue';
    import customer_contact from '@/views/mail/mail-home/components/write-mail/Modal/customer_contact.vue';
    // import colleagues_contact from './colleagues_contact.vue';
    // import personal_contact from './personal_contact.vue';
    import { mapState } from 'vuex';
    export default {
        name: 'address_book_modal',
        props: [
            'visible',
            'addContactList'
        ],
        components: {
            clue_contact,
            customer_contact
            // colleagues_contact,
            // personal_contact
        },
        computed: {
            ...mapState({
                window_height: 'window_height'
            }),
            checkAll: {
                get() {
                    if (this.contactList.length) {
                        return this.contactList.every(item => {
                            return item.checked === true;
                        });
                    }
                    return false;
                },
                set() {
                }
            }
        },
        data() {
            return {
                filtering: true,
                searchedCount: 0,
                currentContactType: 'clue_contact', // 当前联系人类型
                currentContactTypeName: this.$t('mail.writeLetter.addContactModal.clueContact'), // 当前联系人类型名称
                contactList: [], // 联系人列表
                checkedContactList: [],
                filterConditions: {},
                currentPage: 1,
                totalCount: 0,
                isReset: false,
                windowHeight: this.window_height ? this.window_height : document.documentElement.clientHeight
            };
        },
        methods: {
            /** 切换联系人tab */
            changeContactType(name) {
                this.currentPage = 1;
                this.totalCount = 0;
                this.contactList = [];
                this.currentContactType = name;
                this.filtering = true;
                switch (name) {
                    case 'clue_contact':
                        this.currentContactTypeName = this.$t('mail.writeLetter.addContactModal.clueContact');
                        break;
                    case 'customer_contact':
                        this.currentContactTypeName = this.$t('mail.writeLetter.addContactModal.customerContact');
                        break;
                    case 'colleagues_contact':
                        this.currentContactTypeName = this.$t('mail.writeLetter.addContactModal.colleagues');
                        break;
                    case 'personal_contact':
                        this.currentContactTypeName = this.$t('mail.writeLetter.addContactModal.personalAddressBook');
                        break;
                }
            },
            getContactFilterConditions() {
                util.ajax({
                    url: '/crm/mailbox/getAttrType',
                    method: 'post',
                    data: {
                        orgId: this.$store.state.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.filterConditions = response.data.data;
                    }
                });
            }, // 获取筛选条件下拉选项
            // initialShowAllContacts: function () {
            //     this.filtering = true;
            //     this.filteringCount = 0;
            //     this.contactList = [];
            //     this.contactsForm = {
            //         keywords: '',
            //         clientType: '',
            //         scale: ''
            //     };
            //     util.ajax({
            //         url: '/crm/mailbox/getCompanyList',
            //         method: 'post',
            //         data: {
            //             orgId: this.$store.state.enterpriseId
            //         }
            //     }).then(response => {
            //         if (response.data.code === '1') {
            //             if (response.data.data.length) {
            //                 response.data.data.map(item => {
            //                     this.getContactsByCompanyId(item.key, item.value, response.data.data.length);
            //                 });
            //             } else {
            //                 this.filtering = false;
            //             }
            //         }
            //     });
            // }, // 初始化时获取所有联系人
            // getContactsByCompanyId: function (companyId, companyName, length) {
            //     util.ajax({
            //         url: '/crm/mailbox/getEmailListByCompanyId',
            //         method: 'post',
            //         data: {
            //             companyId: companyId
            //         }
            //     }).then(response => {
            //         if (response.data.code === '1') {
            //             response.data.data.map(item => {
            //                 this.contactList.push({
            //                     checked: false,
            //                     mailBox: item,
            //                     companyName: companyName
            //                 });
            //             });
            //             this.filteringCount++;
            //             if (this.filteringCount === length) {
            //                 this.filtering = false;
            //             }
            //         }
            //     });
            // },
            contactOnChange: function(key) {
                if (this.contactList[key].checked) {
                    if (this.checkedContactList.findIndex(contact => contact.receiveMailAddress === this.contactList[key].receiveMailAddress) === -1) {
                        this.checkedContactList.unshift(this.contactList[key]);
                    }
                } else {
                    this.checkedContactList.splice(this.checkedContactList.indexOf(this.contactList[key]), 1);
                }
            }, // 勾选联系人情况改变时,视情况改变全选框的选中情况
            handleCheckAll() {
                console.log('handleCheckAll()', this.contactList, this.checkAll);
                let index = -1;
                if (this.contactList.length) {
                    if (this.checkAll) {
                        this.contactList.map(item => {
                            item.checked = false;
                            index = this.checkedContactList.findIndex(contact => contact.receiveMailAddress === item.receiveMailAddress);
                            if (index !== -1) {
                                this.checkedContactList.splice(index, 1);
                            }
                        });
                    } else {
                        this.contactList.map(item => {
                            item.checked = true;
                            index = this.checkedContactList.findIndex(contact => contact.receiveMailAddress === item.receiveMailAddress);
                            if (index === -1) {
                                this.checkedContactList.unshift(item);
                            }
                        });
                    }
                }
            }, // 点击全选
            clearAll() {
                this.contactList.map(item => {
                    item.checked = false;
                });
                this.checkedContactList = [];
            }, // 清除全部
            ok() {
                this.$emit('update:addContactList', [...this.checkedContactList]);
                this.cancel();
            }, // 回填到写信页面
            cancel() {
                this.reset();
                this.$emit('changeContactsModel', false);
            }, // 取消添加,并清除相关数据
            reset() {
                this.isReset = true;
                // this.initialShowAllContacts();
                // 清空选中项
                this.contactList.map(item => {
                    item.checked = false;
                    if (this.checkedContactList.indexOf(item) !== -1) {
                        this.checkedContactList.splice(this.checkedContactList.indexOf(item), 1);
                    }
                });
                // 下面的是防止在不同面板都选择了
                this.checkedContactList = [];
                setTimeout(() => {
                    this.isReset = false;
                }, 1000);
                // this.contactList = [];
            }, // 重置成初始情况

            /** 翻页 */
            changePage(num) {
                this.filtering = true;
                this.currentPage = num;
            }
        },
        created() {
            this.getContactFilterConditions();
            // this.initialShowAllContacts();
        },
        watch: {
            contactList(value) {
                console.log(value);
                this.contactList.forEach((item, index) => {
                    this.checkedContactList.forEach(val => {
                        if (item.receiveMailAddress === val.receiveMailAddress) {
                            this.contactList[index].checked = true;
                        }
                    });
                });
            },
            // visible(val){
            //     this.currentPage=1
            //     this.totalCount=0
            //     this.contactList=[]
            // }
            totalCount(val) {
                console.log(val);
            }
        }
    };
</script>

<style lang="less">
    .contactModel{
        .el-menu{
            // width: 430px;
            // margin: 0 auto;
            margin-bottom: 20px;
            .el-menu-item{
                padding: 0;
                margin:0 20px;
                color: rgba(0, 0, 0, 0.6);
            }
            .is-active{
                font-weight: 700;
                color: #fc8c30;
            }
        }
        .el-menu.el-menu--horizontal{
            height: 40px;
            line-height: 40px;
            border-bottom: none;
            .el-menu-item:not(.is-disabled):hover {
                outline: none;
                color: #fc8c30;
            }
        }
        .el-pagination--small{
            .btn-prev{
                background-color: #fff;
            }
            .el-pager {
                input{
                    padding: 0;
                }
            }
            .btn-next{
                background-color: #fff;
            }
        }
        .el-dialog{
            width: 820px !important;
            .el-dialog__header{
                padding: 24px 30px 0;
                .el-dialog__title {
                    font-weight: 700;
                }
            }
        }
        .el-dialog__body{
            max-height: calc(~'100vh - 200px');
            padding: 0 30px;
            margin: 0 !important;
        }
        .el-dialog__footer{
            padding: 4px 30px 24px;
        }
        .el-card {
            border-radius: 0;
            & .el-card__body {
                height: calc(~'100% - 62px');
                box-sizing: border-box;
                overflow: auto;
                position: relative;
                border-right: none;
                border-top: none;
                &::-webkit-scrollbar {
                    width: 4px;
                    height: 10px;
                    background-color: #c9c9c9;
                }
                &::-webkit-scrollbar-track {
                    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
                    border-radius: 2px;
                    background-color: #c9c9c9;
                }
                &::-webkit-scrollbar-thumb {
                    border-radius: 5px;
                    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
                    background-color: #fc8b2f;
                }
            }
            & .el-card__header {
                border-bottom: none;
            }
        }
        .el-form{
            .el-form-item {
                margin-bottom: 10px;
                width: 100%;
                font-size: 12px;
            }
        }
        .address_book_body {
            & .el-card__body {
                height: 100%;
                overflow: auto;
            }
        }
        .contacts-header {
            font-weight: bolder;
            margin-bottom: 20px;
        }
        .contacts-content{
            height: 72%;
            overflow: auto;
            .el-col {
                line-height: 30px;
                word-wrap: break-word;
                word-break: break-all;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
        .clear-all-contacts {
            color: #3b78de;
            font-size: 12px;
            float:right;
        }
        .clear-all-contacts{
            &:hover{
                color: #2d63bc;
                text-decoration: underline;
            }
        }
        .ivu-card-bordered {
            border: 1px solid #EAEAEA !important;
        }
        & .el-button--default {
            border-color: #fa8241;
            color: #fa8241;
        }
    }
</style>
