<template>
    <div>
        <Modal
            :title="$t('mail.writeLetter.addContactModal.selectContact')"
            :visible.sync="visibleModal"
            :modal-append-to-body="true"
            :append-to-body="true"
            :close-on-click-modal="false"
            @close="cancel"
            class="contactModel">
            <Row style="display: flex;" v-loading="filtering">
                <div style="width: 730px;margin-right: 20px;">
                    <Card shadow="never" style="padding:0;" dis-hover>
                        <Menu mode="horizontal" :default-active="currentContactType" @select="changeContactType" style="white-space:nowrap;margin-bottom:8px;">
                            <template v-for="(item, index) in radioList">
                                <MenuItem :index="item.value" :key="index">{{item.label}}</MenuItem>
                            </template>
                        </Menu>
                        <Row class="dialog-body-row address_book_body_left" >
                            <div class="contacts-content">
                                <advancedFiltering ref="advancedFiltering" @getData="getData" from="email" :needButton="true" @reset="contactList = []" class="contacts_content_conatiner"></advancedFiltering>
                                <div class="contacts-content-email-list" v-loading="filtering">
                                    <div slot="header" class="contacts-header">
                                        <Row :gutter="16">
                                            <Checkbox
                                                    v-model="checkAll"
                                                    :disabled="!contactList.length"
                                                    :indeterminate="indeterminate"
                                                    @change="handleCheckAll">
                                            </Checkbox>
                                            <Col :span="6">{{$t('mail.writeLetter.addContactModal.selectAll')}}</Col>
                                        </Row>
                                    </div>
                                    <div v-if="contactList.length">
                                        <Row :gutter="16" :key="key" v-for="(contact, key) in contactList" style="margin:0;">
                                            <Checkbox v-model="contact.checked" @change="contactOnChange(key, 'checkbox')" style="float: left;margin-top: 3px; margin-right: 8px;"></Checkbox>
                                            <Col :span="12" style="padding:0;">
                                                <div @click="() => contactOnChange(key)" :title="`${contact.receiverName}<${contact.receiveMailAddress}>`" class="ellipsis">{{ contact.receiverName }} <{{ contact.receiveMailAddress }}></div>
                                            </Col>
                                            <Col :span="10" style="padding:0;">
                                                <div @click="() => contactOnChange(key)" :title="contact.enterpriseName" class="ellipsis">{{ contact.enterpriseName }}</div>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div v-else style="position:relative;height: 50px;">
                                        <div class="no-data-center">
                                            {{$t('mail.customerBox.noData')}}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Page
                                    small
                                    :current-page.sync="currentPage"
                                    v-if="pageShow && contactList.length > 0"
                                    :page-size="20"
                                    :total="totalCount"
                                    layout="total, prev, pager, next"
                                    @current-change="changePage"
                                    style="position: absolute;right: 0;">
                            </Page>
                        </Row>
                    </Card>
                </div>
                <div style="width:380px;">
                    <Row class="dialog-body-row" >
                        <Card shadow="never" class="address_book_body" dis-hover>
                            <div slot="header">
                                <span style="color: rgba(0, 0, 0, 0.6);font-size:14px;">
                                    {{$t('mail.writeLetter.recipients')}}({{ checkedContactList.length }})
                                </span>
                                <HelpTip :title="$t('helpTip.Address')" style="font-size:16px;margin-left:8px;"></HelpTip>
                                <a slot="extra" class="clear-all-contacts" @click="clearAll">{{$t('mail.writeLetter.addContactModal.clearAll')}}</a>
                            </div>
                            <div style="overflow: auto;">
                                <div v-for="(contact,index) in checkedContactList" :key="index"
                                    class="checkedlist-item">
                                    <span :title="`${contact.receiverName}<${contact.receiveMailAddress}>`" class="ellipsis">{{ contact.receiverName }} <{{ contact.receiveMailAddress }}></span>
                                    <Icon @click="handleRemoveChecked(contact.receiveMailAddress, index)" custom="custom-modal-close" class="delete-item"></Icon>
                                </div>
                            </div>
                        </Card>
                    </Row>
                </div>
            </Row>

            <div slot="footer">
                <Button @click="cancel">{{$t('cancel')}}</Button>
                <Button @click="reset">{{$t('reset')}}</Button>
                <Button type="primary" @click="ok" class="mail-saveforcontacts">{{$t('save')}}</Button>
            </div>
            <!-- 此元素专用于点击关闭筛选弹窗 -->
            <span style="display: none;" ref="clickToClosePoptip"></span>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import advancedFiltering from '@/views/main-components/advancedFiltering.vue';
    import Cookies from 'js-cookie';
    import { mapState, mapGetters } from 'vuex';
    import _ from 'lodash';
    export default {
        name: 'address_book_modal',
        props: [
            'visible',
            'addContactList',
            'showTabs'
        ],
        components: {
            advancedFiltering
        },
        computed: {
            ...mapState({
                window_height: 'window_height',
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                button_list: state => state.app.button_list
            }), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu'
            ]),
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
            },
            lang() {
                return (localStorage.getItem('LANG') || Cookies.get('LANG')) === 'en-US';
            }
        },
        data() {
            return {
                currentContactType: 'touchPointContact',
                radioList: [
                    { label: '触点联系人', value: 'touchPointContact' },
                    { label: '联系人', value: 'contact' },
                    { label: '线索', value: 'lead' },
                    { label: '客户', value: 'customer' },
                    { label: '商机', value: 'opportunity' },
                    { label: '企业同事', value: 'colleague' },
                    { label: '个人通讯录', value: 'addressbook' }
                ],
                filtering: false,
                contactList: [], // 联系人列表
                checkedContactList: [],
                currentPage: 1,
                totalCount: 0,
                isReset: false,
                visibleModal: this.visible,
                pageShow: false,
                params: null
            };
        },
        methods: {
            changeContactType(name) {
                if (this.currentContactType === name) return;
                this.currentContactType = name;
                this.$refs.advancedFiltering.sourceTypeChange(name);
            },
            // 监听滚动事件 显示分页
            listenerScroll() {
                this.$nextTick(() => {
                    const contactsContent = document.querySelector('.contacts-content');
                    contactsContent.addEventListener('scroll', _.debounce(this.scrollHandle));
                });
            },
            scrollHandle() {
                const contactsContent = document.querySelector('.contacts-content');
                const contentList = document.querySelector('.contacts-content-email-list');
                if (contentList.offsetTop < contactsContent.scrollTop + contactsContent.clientHeight) {
                    this.pageShow = true;
                } else {
                    this.pageShow = false;
                }
            },
            getData(data) {
                if (this.filtering) return;
                this.filtering = true;
                this.params = data;
                this.getDataTables();
            },
            /** 获取列表 */
            getDataTables() {
                this.contactList = [];
                const data = this.params;
                if (data.sourceType === 'colleague') {
                    const jsonData = {
                        pageNo: this.currentPage,
                        pageSize: 20,
                        orgId: this.enterpriseId,
                        fullname: data.contactsFormForShow.name,
                        email: data.contactsFormForShow.email,
                        userIds: data.contactsFormForShow.userIds.map(item => item.value)
                    };
                    util.ajaxJson({
                        url: '/mail/getCorporateColleagues',
                        method: 'post',
                        data: jsonData
                    }).then(response => {
                        this.filtering = false;
                        if (response.data.code === 1) {
                            this.totalCount = response.data.data.total;
                            if (response.data.data.list.length > 0) {
                                const dataList = response.data.data.list;
                                const contactList = [];
                                for (const item of dataList) {
                                    const temp = item.email.substring(0, item.email.lastIndexOf('@'));
                                    contactList.push({
                                        receiverName: item.fullname ? item.fullname : temp,
                                        receiveMailAddress: item.email,
                                        enterpriseName: item.departmentName ? item.departmentName : '--',
                                        checked: false
                                    });
                                }
                                this.contactList = [].concat(contactList);
                            } else {
                                this.contactList = [];
                            }
                        } else {
                            this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                        }
                    });
                } else if (data.sourceType === 'addressbook') {
                    const jsonData = {
                        contactUserMail: data.contactsFormForShow.email,
                        contactUserName: data.contactsFormForShow.name,
                        groupId: data.contactsFormForShow.group,
                        createUserId: this.userId,
                        page: this.currentPage - 1,
                        size: 20
                    };
                    util.ajaxMailJson({
                        url: '/mail/mailaddresscontact/pageList',
                        method: 'post',
                        data: jsonData
                    }).then(response => {
                        this.filtering = false;
                        if (response.data.code === 1) {
                            this.totalCount = response.data.data.totalElements;
                            if (response.data.data.content.length > 0) {
                                const contactList = [];
                                const dataList = response.data.data.content;
                                for (const item of dataList) {
                                    const temp = item.contactUserMail.substring(0, item.contactUserMail.lastIndexOf('@'));
                                    contactList.push({
                                        receiverName: item.contactUserName ? item.contactUserName : temp,
                                        receiveMailAddress: item.contactUserMail,
                                        enterpriseName: item.groupId === 0 ? '--' : item.groupName,
                                        checked: false
                                    });
                                }
                                this.contactList = [].concat(contactList);
                            } else {
                                this.contactList = [];
                            }
                        }
                    });
                } else {
                    const jsonData = {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        businessApiKey: data.sourceType,
                        targetType: 4,
                        pageNo: this.currentPage,
                        pageSize: 20,
                        searchCondition: {
                            filterType: data.filterType,
                            expression: data.expression,
                            conditions: data.conditions
                        }
                    };
                    util.ajaxLeadscloudJson({
                        url: '/v2-crm/contactProfileData/page/advFilteringContactInfo',
                        method: 'post',
                        data: jsonData
                    }).then(response => {
                        this.filtering = false;
                        if (response.data.code === 10000) {
                            this.totalCount = response.data.data.total;
                            if (response.data.data.list.length > 0) {
                                const contactList = [];
                                const dataList = response.data.data.list;
                                dataList.forEach(item => {
                                    const temp = item.contactNo.substring(0, item.contactNo.lastIndexOf('@'));
                                    contactList.push({
                                        receiverName: item.contactsName ? item.contactsName : temp,
                                        receiveMailAddress: item.contactNo,
                                        enterpriseName: item.companyName ? item.companyName : '--',
                                        checked: false
                                    });
                                });
                                this.contactList = [].concat(contactList);
                            } else {
                                this.contactList = [];
                            }
                        }
                    });
                }
                this.filtering = false;
            },
            contactOnChange: function(key, operateObj) {
                /**
                 * @Description: 点击多选框时，选中状态先变化，才触发@change回调逻辑；点击邮箱地址时，先触发@click回调逻辑，多选框选中状态才变化；
                 *               为了回调可以统一处理，当点击多选框时，先将多选框选中状态恢复至变化前。
                 * @author 杨娣
                 * @date 2020/7/24
                */
                if (operateObj === 'checkbox') {
                    this.contactList[key].checked = !this.contactList[key].checked;
                }
                const tempIndex = this.checkedContactList.findIndex(contact => contact.receiveMailAddress === this.contactList[key].receiveMailAddress);
                console.log('contactOnChange()-------', key, operateObj, tempIndex, this.contactList[key].checked);
                // if (this.contactList[key].checked) {
                //     if (tempIndex === -1) {
                //         this.checkedContactList.unshift(this.contactList[key]);
                //     }
                // } else if (tempIndex !== -1) {
                //     this.checkedContactList.splice(tempIndex, 1);
                // }
                if (this.contactList[key].checked) {
                    /* 选中状态 */
                    if (tempIndex === -1) {
                        /* 未添加过，添加 */
                        this.checkedContactList.unshift(this.contactList[key]);
                    } else {
                        /* 已添加过，删除，同时取消所有邮箱相同的选中 */
                        this.contactList.forEach(item => {
                            if (item.receiveMailAddress === this.contactList[key].receiveMailAddress) {
                                item.checked = false;
                            }
                        });
                        this.checkedContactList.splice(tempIndex, 1);
                    }
                } else {
                    /* 未选中状态 */
                    if (tempIndex === -1) {
                        /* 未添加过，选中列表中所有相同的邮箱地址，并添加至右侧列表 */
                        this.contactList.forEach(item => {
                            if (item.receiveMailAddress === this.contactList[key].receiveMailAddress) {
                                item.checked = true;
                            }
                        });
                        this.checkedContactList.unshift(this.contactList[key]);
                    } else {
                        /* 已添加过，仅选中，不做添加操作 */
                        this.contactList[key].checked = !this.contactList[key].checked;
                    }
                }
                this.handleChangeCheckbox();
            }, // 勾选联系人情况改变时,视情况改变全选框的选中情况
            handleCheckAll() {
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
                    this.handleChangeCheckbox();
                }
            }, // 点击全选
            clearAll() {
                this.contactList.map(item => {
                    item.checked = false;
                });
                this.checkedContactList = [];
                this.handleChangeCheckbox();
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
                this.handleChangeCheckbox();
                // this.contactList = [];
            }, // 重置成初始情况

            /** 翻页 */
            changePage(num) {
                this.filtering = true;
                this.currentPage = num;
                this.getDataTables();
                // this.handleChangeCheckbox();
            },

            /* 关闭筛选弹窗 */
            closeFilterPoptip(isClose) {
                if (isClose) {
                    this.$refs.clickToClosePoptip.click();
                }
            },
            getTemplateId() {
                util.ajax({
                    url: '/form-cust/form/getXSShow', /* 获取线索字段 */
                    method: 'post',
                    data: {
                        userId: this.userId,
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.templateId = response.data.data.template.id;
                        if (!response.data.data.noAccess.a10010 && !response.data.data.show.a10010) {
                            this.hasMailField = false;
                        }
                    }
                });
            },
            
            /* 删除已选中 */
            handleRemoveChecked(mailAddress, index) {
                this.contactList.map(item => {
                    if (item.receiveMailAddress === mailAddress) {
                        item.checked = false;
                    }
                    return item;
                });
                this.checkedContactList.splice(index, 1);
                this.handleChangeCheckbox();
            },
            /* 处理全选框的选中状态 */
            handleChangeCheckbox() {
                if (this.contactList.every(item => item.checked)) {
                    this.checkAll = true;
                    this.indeterminate = false;
                } else if (this.contactList.every(item => !item.checked)) {
                    if (this.checkedContactList.length) {
                        this.checkAll = false;
                        this.indeterminate = true;
                    } else {
                        this.checkAll = false;
                        this.indeterminate = false;
                    }
                } else {
                    this.checkAll = false;
                    this.indeterminate = true;
                }
            }
        },
        created() {
        },
        mounted() {
            this.listenerScroll();
        },
        watch: {
            contactList(value) {
                this.contactList.forEach((item, index) => {
                    this.checkedContactList.forEach(val => {
                        if (item.receiveMailAddress === val.receiveMailAddress) {
                            this.contactList[index].checked = true;
                        }
                    });
                });
                this.handleChangeCheckbox();
                this.scrollHandle();

                // 筛选数据之后滚动条移动到指定位置  显示筛选数据
                this.$nextTick(() => {
                    const aa = document.querySelector('.contacts-content');
                    const conatinerHeight = document.querySelector('.contacts_content_conatiner').clientHeight;
                    aa.scrollTop = conatinerHeight - 90;
                });
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
                margin:0 15px;
                color: rgba(0, 0, 0, 0.6);
                height: 42px;
                line-height: 42px;
            }
            .is-active{
                font-weight: 700;
                color: #FF752A !important;
            }
        }
        .el-menu.el-menu--horizontal{
            // height: 42px;
            // line-height: 42px;
            // border-bottom: none;
            .el-menu-item:not(.is-disabled):hover {
                outline: none;
                color: #fc8c30;
                .custom-menu-arrow {
                    color: #fc8c30 !important;
                }
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
            width: 1190px !important;
            .el-dialog__header{
                padding: 24px 24px 16px;
                .el-dialog__title {
                    font-weight: 500;
                }
                .el-dialog__headerbtn{
                    right: 24px;
                }
            }
        }
        .el-dialog__body{
            padding: 0 30px 82px;
            margin: 0 !important;
            .dialog-body-row {
                height: calc(~'55vh');
                padding-bottom: 30px;
                .el-col-12 {
                    height: 100%;
                }
            }
        }
        .el-dialog__footer{
            padding: 24px;
            position: absolute;
            bottom: 0;
            right: 0;
            width: 100%;
        }
        .el-card {
            border-radius: 0;
            & .el-card__body {
                box-sizing: border-box;
                position: relative;
                border-right: none;
                border-top: none;
                padding: 0;
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
                padding: 12px 20px;
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
            font-size: 12px;
            height: calc(~'55vh + 52px');
            & .el-card__body {
                height: calc(~'100% - 49px');
                overflow: auto;
            }
        }
        .address_book_body_left{
            overflow-y: auto;
            font-size: 12px;
            .no-data-center {
                position: absolute;
                top: 50%;
                left: 50%;
                margin-left: -24px;
                margin-top: -12px;
                color: rgba(0, 0, 0, .8);
            }
        }
        .contacts-header {
            font-weight: bolder;
            font-size: 12px;
            margin-left: -10px;
            .el-row {
                position: relative;
                display: flex;
                align-items: center;
            }
        }
        .contacts-content{
            height: 100%;
            overflow: auto;
            .contacts-content-email-list{
                border-top: 1px solid #EAEAEA;
                padding-top: 10px;
                padding-left: 30px;
                padding-right: 10px;
                position: relative;
            }
            .el-col {
                font-size: 12px;
                line-height: 30px;
                word-wrap: break-word;
                word-break: break-all;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .el-col-2 {
                padding-right: 0 !important;
            }
            .el-col-12 {
                padding-left: 0;
                padding-right: 20px;
            }
            .el-col-10 {
                padding-left: 0;
                padding-right: 0;
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
        .checkedlist-item {
            word-break: break-all;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-left: 30px;
            height: 30px;
            line-height: 30px;
            &:hover{
                background: #F5F7FA;
            }
            .ellipsis{
                margin-right: 10px;
            }
            .delete-item {
                display: none;
                margin-right: 10px;
                color: #A9B9C9;
            }
            &:hover {
                .delete-item {
                    display: inline-block;
                }
            }
        }
    }
</style>
