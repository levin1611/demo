<template>
    <Modal :visible="visible"
        :title="$t('crm.Modal.title_sendMail')"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :append-to-body="true"
        @close="cancel"
        width="1000px"
        class="selectContact-modal">
        <div style="display: flex;">
            <div class="selectContactBox" style="width: 648px;" v-loading="loading">
                <div v-if="type==='customer'" class="selectContactBoxTop">
                    <p>
                        <span style="margin-right: 20px;">{{$t('crm.Table.primaryContact')}}</span>
                        <RadioGroup v-model="isMainContact" @input="handleInput">
                            <Radio :label="2">{{$t('crm.Table.con_nolimit')}}</Radio>
                            <Radio :label="1">{{$t('crm.Table.con_is')}}</Radio>
                            <Radio :label="0">{{$t('crm.Table.con_not')}}</Radio>
                        </RadioGroup>
                    </p>
                </div>
                <div v-show="tableList.length">
                    <Table ref="selectContactTable"
                        :data="tableList"
                        :row-key="getRowKey"
                        :height="type === 'clue' ? '510px' : '466px'"
                        stripe
                        @select="handleSelectionChange"
                        @select-all="handleSelectionChange"
                        :customEmptyText="customEmptyTextLang"
                        :customEmptyButtonText="customEmptyButtonTextLang"
                        :customClearMethod="clearFilterConditionByInitView"
                        class="tabmain selectContactTable">
                        <TableColumn width="70" type="selection" align="center" reserve-selection></TableColumn>
                        <TableColumn  v-for="(item, index) in currentColumns"
                            :width="item.width"
                            :key="index"
                            :prop="item.key"
                            :label="item.title"
                            :show-overflow-tooltip="true">
                            <template slot-scope="scope">
                                <span>
                                    {{ scope.row[item.key] ? scope.row[item.key] : '-' }}
                                </span>
                            </template>
                        </TableColumn>
                    </Table>
                    <div class="selectContactBoxTop" style="margin: 0px;">
                        <span>{{$t('crm.Table.selectContactBoxTip1')}} {{total}} {{$t('crm.Table.selectContactBoxTip2')}}</span>
                        <Page
                            :total="total"
                            :current-page.sync="currentPageNum"
                            :page-size="50"
                            class="pageWrap-right"
                            layout="prev, pager, next"
                            @current-change="pageChange">
                        </Page>
                    </div>
                </div>
                <div v-show="!tableList.length" class="no_data">
                    <img src="@/svg/no-data.svg"
                        :alt="$t('crm.Table.noData')">
                    <p>
                        {{ $t('crm.Table.noData') }}
                    </p>
                </div>
            </div>
            <div class="selectContactBox" style="width:305px; border-left: none;">
                <div class="selectContactBoxTop">
                    <p>{{$t('crm.Table.selected')}} ({{selcetContact.length}})</p>
                    <Button type="text" class="clearAllBtn" @click="clearList">{{ $t('crm.followUpPlan.clearAll') }}</Button>
                </div>
                <div class="select-contact-list">
                    <p class="contact-list" v-for="(item, index) in selcetContact" :key="item.id">
                        <span v-if="fieldColumns[sendType]" class="ellipsis" :title="`${item.nickName}<${item.columnValueShow}>`">{{item.nickName}}<{{item.columnValueShow}}></span>
                        <span v-else class="ellipsis" :title="item.nickName">{{item.nickName}}</span>
                        <Icon custom="custom-modal-close" class="delete-item" @click="remove(index, item)"></Icon>
                    </p>
                </div>
            </div>
        </div>

        <div slot="footer">
            <Button @click="cancel">{{$t('cancel')}}</Button>
            <Button type="primary" @click="sendAll" :loading="sendAllLoading">{{$t('crm.Table.sendAll')}}</Button>
            <Button type="primary" @click="send" class="mail-saveforcontacts" :loading="sendLoading">{{$t('crm.Modal.modal_ok')}}</Button>
        </div>
    </Modal>
</template>
<script>
    import { mapState } from 'vuex';
    import { crmCommon } from '@/api/crm/index';
    export default {
        name: 'contactSelectionBox',
        props: [
            'type',
            'originalType',
            'sendType',
            'fieldColumns',
            'visible',
            'ids'
        ],
        data() {
            return {
                selcetContact: [],
                tableList: [],
                isMainContact: 1,
                total: 0, // 列表数据总条数
                currentPageNum: 1, // 当前页码
                loading: true,
                sendAllLoading: false,
                sendLoading: false,
                tableHeader: {
                    customer: {
                        email: [
                            { title: this.$t('crm.Modal.contact_nickName'), key: 'nickName', width: '80' },
                            { title: this.$t('crm.Modal.contact_email'), key: 'columnValueShow', width: '' },
                            { title: this.$t('crm.Table.col_companyName'), key: 'companyName', width: '212' },
                            { title: this.$t('crm.Modal.contact_jobTitle'), key: 'jobTitle', width: '92' }
                        ],
                        whatsApp: [
                            { title: this.$t('crm.Modal.contact_nickName'), key: 'nickName', width: '80' },
                            { title: this.$t('crm.Modal.contact_whatsApp'), key: 'columnValueShow', width: '' },
                            { title: this.$t('crm.Table.col_companyName'), key: 'companyName', width: '212' },
                            { title: this.$t('crm.Modal.contact_jobTitle'), key: 'jobTitle', width: '92' }
                        ]
                    },
                    clue: {
                        email: [
                            { title: this.$t('crm.Modal.contact_nickName'), key: 'nickName', width: '100' },
                            { title: this.$t('crm.Modal.contact_email'), key: 'columnValueShow', width: '' }
                        ],
                        whatsApp: [
                            { title: this.$t('crm.Modal.contact_nickName'), key: 'nickName', width: '100' },
                            { title: this.$t('crm.Modal.contact_whatsApp'), key: 'columnValueShow', width: '' }
                        ]
                    }
                }
            };
        },
        computed: {
            ...mapState({
                fullName: 'fullName',
                userId: 'userId',
                enterpriseId: 'enterpriseId'
            }), // 从 vuex 中获取属性
            currentColumns() {
                return this.tableHeader[this.type][this.sendType];
            }
        },
        methods: {
            handleInput() {
                this.currentPageNum = 1;
                this.getListData();
            },
            // 翻页
            pageChange(num) {
                this.currentPageNum = num;
                this.getListData();
            },
            // 指定表格行数据 key
            getRowKey(row) {
                return row.id;
            },
            getListData() {
                this.loading = true;
                if (this.type === 'customer') {
                    crmCommon.getContactsListByTargetIds({
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        pageSize: 50,
                        pageNo: this.currentPageNum,
                        targetIdList: this.ids,
                        targetType: ['highseasCustomer', 'customer'].includes(this.originalType) ? 1 : 3,
                        isMainContacts: this.isMainContact,
                        batchOperateType: this.sendType === 'whatsApp' ? 1 : 2
                    }).then(res => {
                        if (res.code === '1' && res.data.list.length) {
                            this.total = res.data.total;
                            this.tableList = res.data.list;
                        } else {
                            this.total = 0;
                            this.tableList = [];
                            this.$Message.error(this.$t(`crm.Table.selectContactBoxTip_${this.sendType}`));
                        }
                        this.loading = false;
                    });
                } else if (this.type === 'clue') {
                    crmCommon.getContactsListByClueIds({
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        pageSize: 50,
                        pageNo: this.currentPageNum,
                        targetIdList: this.ids,
                        targetType: 4,
                        batchOperateType: this.sendType === 'whatsApp' ? 1 : 2
                    }).then(res => {
                        if (res.code === '1' && res.data.list.length) {
                            this.total = res.data.total;
                            this.tableList = res.data.list;
                        } else {
                            this.total = 0;
                            this.tableList = [];
                            this.$Message.error(this.$t(`crm.Table.selectContactBoxTip_${this.sendType}`));
                        }
                        this.loading = false;
                    });
                }
            },
            // 多选
            handleSelectionChange(selection) {
                if (selection.length > 0) {
                    this.selcetContact = selection.map(item => item);
                } else {
                    this.selcetContact = [];
                }
            },
            clearList() {
                this.$refs.selectContactTable.clearSelection();
                this.selcetContact = [];
            },
            remove(index, row) {
                this.$refs.selectContactTable.toggleRowSelection(row);
                this.selcetContact.splice(index, 1);
            },
            sendAll() {
                if (this.total === 0) {
                    this.$Message.warning(this.$t('crm.Html.error_emptyContact'));
                    return false;
                }
                this.sendAllLoading = true;
                if (this.total <= 50) {
                    this.handleSend(this.tableList);
                    return;
                }
                if (this.type === 'customer') {
                    crmCommon.getContactsListByTargetIds({
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        pageSize: this.total,
                        pageNo: 1,
                        targetIdList: this.ids,
                        targetType: ['highseasCustomer', 'customer'].includes(this.originalType) ? 1 : 3,
                        isMainContacts: this.isMainContact,
                        batchOperateType: this.sendType === 'whatsApp' ? 1 : 2
                    }).then(res => {
                        if (res.code === '1') {
                            this.handleSend(res.data.list);
                        }
                    });
                } else if (this.type === 'clue') {
                    crmCommon.getContactsListByClueIds({
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        pageSize: this.total,
                        pageNo: 1,
                        targetIdList: this.ids,
                        targetType: 4,
                        batchOperateType: this.sendType === 'whatsApp' ? 1 : 2
                    }).then(res => {
                        if (res.code === '1' && res.data.list.length) {
                            this.handleSend(res.data.list);
                        }
                    });
                }
            },
            send() {
                if (this.selcetContact.length === 0) {
                    this.$Message.warning(this.$t('crm.Html.error_emptyContact'));
                    return false;
                }
                this.sendLoading = true;
                this.handleSend(this.selcetContact);
            },
            handleSend(data) {
                let list = data.map(item => {
                    return item.columnValueReal;
                });
                // 数据去重
                list = [...new Set(list)];
                if (this.sendType === 'email') {
                    localStorage.setItem('sendHandleSeparate', JSON.stringify(list));
                    this.$stm.openNewWindow(this.$router.resolve({
                        name: 'mail_home'
                    }).href);
                } else if (this.sendType === 'whatsApp') {
                    // 调whatsApp群发弹窗
                    this.$store.commit('setWAGroupSendVisible', true);
                    this.$store.commit('setwAGroupSendAccount', list);
                    // const showWAGroupSend = new Promise(resolve => {
                    //     this.$store.commit('setWAGroupSendVisible', true);
                    //     this.$store.commit('setwAGroupSendAccount', list);
                    //     resolve(true);
                    // });
                    // showWAGroupSend.then(res => {
                    //     this.$emit('refreshData');
                    //     this.cancel();
                    // });
                }
                // this.$nextTick(() => {
                //     this.$emit('refreshData');
                // });
                // setTimeout(() => {
                //     this.$emit('refreshData');
                //     this.cancel();
                // }, 0);
                // this.cancel();
                this.sendAllLoading = false;
                this.sendLoading = false;
            },
            cancel() {
                this.$refs.selectContactTable.clearSelection();
                this.selcetContact = [];
                this.selcetContact = [];
                this.isMainContact = 1;
                this.currentPageNum = 1;
                this.total = 0;
                this.tableList = [];
                this.sendAllLoading = false;
                this.sendLoading = false;
                this.$emit('update:visible', false);
            }
        },
        created() {},
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        this.getListData();
                    }
                }
            },
            fieldColumns: {
                handler(val) {
                    if (val && this.type === 'clue') {
                        if (val.companyName) {
                            const companyObj = { title: this.$t('crm.Table.col_companyName'), key: 'companyName', width: '200' };
                            this.tableHeader.clue.email.push(companyObj);
                            this.tableHeader.clue.whatsApp.push(companyObj);
                        }
                        if (val.jobTitle) {
                            const jobTitleObj = { title: this.$t('crm.Modal.contact_jobTitle'), key: 'jobTitle', width: '92' };
                            this.tableHeader.clue.email.push(jobTitleObj);
                            this.tableHeader.clue.whatsApp.push(jobTitleObj);
                        }
                    }
                },
                deep: true
            }
        }
    };
</script>

<style lang="less" scoped>
    .selectContact-modal {
        .no_data {
            width: 100%;
            height: 100%;
            display: flex;
            flex-flow: column;
            align-items: center;
            justify-content: center;
            p {
                margin-top: 20px;
                font-size: 12px;
                color:rgba(0, 0, 0, 0.4);
            }
        }
        .selectContactTable {
            &::before {
                display: none;
            }
            /deep/ th.is-leaf {
                border: none;
            }
            /deep/ .el-table__body tr > td{
                background: #F6F6F6;
                border: none;
            }
            /deep/ .el-table__body tr.el-table__row--striped > td {
                background: #fff;
            }
        }
        .selectContactBox {
            height: 558px;
            border: 1px solid #EBEEF5;
            .selectContactBoxTop {
                padding: 0px 20px;
                margin: 12px 0 10px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                line-height: 22px;
                color: #000;
                p {
                    font-weight: bold;
                    color: #333;
                }
                .clearAllBtn {
                    font-size: 14px;
                    color: #3B78DE;
                    &:hover{
                        color: #2d63bc
                    }
                }
            }
            .select-contact-list {
                padding: 10px 20px 20px;
                height: calc(100% - 52px);
                overflow-y: auto;
                .contact-list {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    line-height: 28px;
                    margin-bottom: 4px;
                    .delete-item {
                        display: none;
                        margin-right: 10px;
                        color: #A9B9C9;
                        cursor: pointer;
                    }
                    &:hover {
                        // background: #F5F7FA;
                        .delete-item {
                            display: inline-block;
                        }
                    }
                }
            }
        }
    }
</style>
