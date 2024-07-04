<template>
     <Modal :visible="visible"
        :title="$t('crm.followUpRecord.selectCompanytitle')"
        width="960px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :append-to-body="true"
        :show-close="true"
        @close="handleClose()"
        class="field-modal">
        <Row :gutter="30" class="followUpPlanSelectCompany">
            <Col span="12">
                <div class="company_list_contain" v-loading="loading">
                    <div class="search_word_box">
                        <Input v-model.trim="searchWord"
                            class="searchInput"
                            clearable
                            @keyup.enter.native="searchCompanyList"
                            maxlength="50"
                            :placeholder="$t('crm.followUpRecord.companyPlaceholder')"></Input>
                        <Button type="success" size="small" @click="searchCompanyList">{{ $t('traffic.search')}}</Button>
                    </div>
                    <div v-if="companyList.length">
                        <div class="company_list">
                            <CheckboxGroup v-model="checkedCompanyIds" :max="20" class="company_list_box">
                                <p v-for="(item,index) in companyList" :key="index" class="companys">
                                    <Checkbox :label="item.companyId" @change="checkedCompanys(item)">
                                        {{ item.companyName }}
                                    </Checkbox>
                                </p>
                            </CheckboxGroup>
                        </div>
                        <Page
                            :total="total"
                            :current-page.sync="currentPageNum"
                            :page-size="pageSize"
                            layout="total, prev, pager, next"
                            @current-change="pageChange"
                            @size-change="pageSizeChange">
                        </Page>
                    </div>
                    <div v-if="searchStatus && !companyList.length" class="no_data">
                        <img src="@/svg/no-data.svg"
                            :alt="$t('crm.Table.noData')">
                        <p>
                            {{ $t('crm.Table.noData') }}
                        </p>
                    </div>
                </div>
            </Col>
            <Col span="12">
                <div class="selectCompanyBox">
                    <div class="selectCompanyBoxTop">
                        <p>{{$t('crm.Table.selected')}} ({{checkedCompany.length}})</p>
                        <Button type="text" class="clearAllBtn" @click="clearList">{{ $t('crm.followUpPlan.clearAll') }}</Button>
                    </div>
                    <div class="selectCompanyList">
                        <p class="companyList" v-for="(item, index) in checkedCompany" :key="item.companyId">
                            <span>{{ item.companyName }}</span>
                            <Icon custom="custom-modal-close" class="delete-item" @click="remove(index)"></Icon>
                        </p>
                    </div>
                </div>
            </Col>
        </Row>
        <div slot="footer">
            <Button @click="handleClose">{{ $t('crm.Modal.modal_cancel') }}</Button>
            <Button type="primary"
                    size="large"
                    :disabled="!checkedCompanyIds.length"
                    @click="ok()">{{ $t('crm.InqSet.modal_ok') }}</Button>
        </div>
    </Modal>
</template>
<script>
    import { mapState } from 'vuex';
    import { crmFollowupRecord } from '@/api/crm/index';
    export default {
        name: 'selectCompanys',
        props: [
            'visible',
            'selectedCustomers',
            'selectedCustomersIds'
        ],
        data() {
            return {
                total: 0,
                pageSize: 10,
                currentPageNum: 1,
                companyList: [],
                searchWord: '',
                searchStatus: false,
                checkedCompanyIds: [],
                checkedCompany: [],
                loading: false
            };
        },
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId'
            })
        },
        created() {
            this.getCompanyList();
        },
        mounted() {
        },
        methods: {
            searchCompanyList() {
                this.currentPageNum = 1;
                this.getCompanyList();
            },
            getCompanyList() {
                this.loading = true;
                const postData = {
                    orgId: this.orgId,
                    userId: this.userId,
                    companyName: this.searchWord,
                    pageSize: this.pageSize,
                    pageNo: this.currentPageNum
                };
                crmFollowupRecord.getCompanyByName(postData).then(response => {
                    if (response.code === '1') {
                        if ((response.data.list === null || !response.data.list.length) && this.currentPageNum > 1) {
                            this.currentPageNum--;
                            this.getCompanyList();
                            return;
                        }
                        this.total = response.data.total || 0;
                        // 处理数据
                        this.companyList = response.data.list;
                    } else {
                        this.total = 0;
                        this.companyList = [];
                        this.$Message.error(this.$t('crm.Table.error_getCompanyTableData'));
                    }
                    this.searchStatus = true;
                    this.loading = false;
                });
            },
            clearList() {
                this.checkedCompanyIds = [];
                this.checkedCompany = [];
            },
            // 翻页
            pageChange(num) {
                this.currentPageNum = num;
                this.getCompanyList();
            },
            /** 改变表格每页展示数据量 */
            pageSizeChange(size) {
                this.pageSize = size;
                this.getCompanyList();
            },
            handleClose() {
                this.$emit('update:visible', false);
            },
            checkedCompanys(row) {
                if (this.checkedCompany.length) {
                    const index = this.checkedCompany.findIndex(item => item.companyId === row.companyId);
                    if (index >= 0) {
                        this.checkedCompany.splice(index, 1);
                    } else {
                        this.checkedCompany.push(row);
                    }
                } else {
                    this.checkedCompany.push(row);
                }
            },
            remove(index) {
                this.checkedCompanyIds.splice(index, 1);
                this.checkedCompany.splice(index, 1);
            },
            ok() {
                if (this.checkedCompany && this.checkedCompany.length) {
                    this.$emit('handleCompany', this.checkedCompany, this.checkedCompanyIds);
                    this.handleClose();
                }
            }
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        this.checkedCompanyIds = this.$deepClone(this.selectedCustomersIds);
                        this.checkedCompany = this.$deepClone(this.selectedCustomers);
                    }
                },
                immediate: true
            }
        },
        beforeDestroy() { }
    };
</script>
<style lang="less" scoped>
    .followUpPlanSelectCompany {
        .search_word_box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            .searchInput{
                margin-right: 12px;
            }
        }
        .company_list_box {
            display: block;
        }
        .company_list {
            height: 320px;
            margin-bottom: 10px;
            overflow-x: hidden;
            overflow-y: auto;
            .companys {
                padding-left: 9px;
                margin-bottom: 4px;
                /deep/.el-checkbox__label{
                    line-height: 18px;
                    font-size: 14px;
                }
                &:hover{
                    background: #F5F7FA;
                }
            }
        }
        .no_data {
            width: 100%;
            height: 300px;
            display: flex;
            flex-flow: column;
            align-items: center;
            justify-content: center;
            p{
                margin-top: 20px;
                font-size: 12px;
                color:rgba(0, 0, 0, 0.4);

            }
        }
        .selectCompanyBox {
            padding: 0px 20px;
            height: 418px;
            border: 1px solid #EBEEF5;
            .selectCompanyBoxTop{
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                line-height: 30px;
                p {
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
            .selectCompanyList {
                height: 340px;
                overflow-y: auto;
            }
            .companyList {
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
                    background: #F5F7FA;
                    .delete-item {
                        display: inline-block;
                    }
                }
            }
        }
    }
</style>
