<template>
     <Modal :visible="visible"
        :title="$t('crm.followUpRecord.selectCompanytitle')"
        width="778px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :append-to-body="true"
        :show-close="true"
        @close="handleClose()"
        class="field-modal">
        <div class="company_list_contain" v-loading="loading">
            <div class="search_word_box">
                <Input v-model.trim="searchWord"
                    class="searchInput"
                    clearable
                    @clear="clearList"
                    @keyup.enter.native="searchCompanyList"
                    maxlength="50"
                    :placeholder="$t('crm.followUpRecord.companyPlaceholder')"></Input>
                <Button type="success" @click="searchCompanyList">{{ $t('traffic.search')}}</Button>
            </div>
            <div v-if="companyList.length">
                <div class="company_list">
                    <RadioGroup v-model="checkedCompanId" class="company_list_box">
                        <p v-for="(item,index) in companyList" :key="index" class="companys">
                            <Radio :label="item.companyId"
                                @click.native.stop="checkCompany(item)">
                                {{ item.companyName }}
                            </Radio>
                        </p>
                    </RadioGroup>
                </div>
                <Page
                    :total="total"
                    :current-page.sync="currentPageNum"
                    :page-size="pageSize"
                    :page-sizes="[10]"
                    layout="total, prev, pager, next, sizes, jumper"
                    @current-change="pageChange"
                    @size-change="pageSizeChange"
                >
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
        <div slot="footer">
            <Button @click="handleClose">{{ $t('crm.Modal.modal_cancel') }}</Button>
            <Button type="primary"
                    size="large"
                    :disabled="!checkedCompanId"
                    @click="ok()">{{ $t('crm.InqSet.modal_ok') }}</Button>
        </div>
    </Modal>
</template>
<script>
    import { mapState } from 'vuex';
    import { crmFollowupRecord } from '@/api/crm/index';
    export default {
        name: 'selectCompany',
        props: [
            'visible'
        ],
        data() {
            return {
                total: 0,
                pageSize: 10,
                currentPageNum: 1,
                companyList: [],
                searchWord: '',
                searchStatus: false,
                checkedCompanId: null,
                checkedCompany: null,
                loading: false
            };
        },
        filters: { },
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId'
            })
        },
        created() {
        },
        mounted() {
        },
        methods: {
            searchCompanyList() {
                this.currentPageNum = 1;
                this.getCompanyList();
            },
            getCompanyList() {
                if (this.searchWord) {
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
                }
            },
            clearList() {
                this.searchStatus = false;
                this.companyList = [];
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
            checkCompany(item) {
                this.checkedCompany = item;
            },
            handleClose() {
                this.$emit('update:visible', false);
            },
            ok() {
                if (this.checkedCompany && this.checkedCompany.companyId) {
                    this.$emit('handleCompany', this.checkedCompany);
                    this.handleClose();
                }
            }
        },
        watch: {
        },
        beforeDestroy() { }
    };
</script>
<style lang="less" scoped>
    .company_list_contain {
        padding: 20px 10px;
        min-height: 300px;
    }
    .search_word_box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        .searchInput{
            margin-right: 12px;
            /deep/.el-input__inner{
                height: 36px;
            }
        }
    }
    .company_list_box {
        display: block;
    }
    .company_list {
        height: 300px;
        margin-bottom: 20px;
        overflow-x: hidden;
        overflow-y: auto;
        .companys {
            padding-left: 9px;
            /deep/.el-radio{
                line-height: 30px;
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
</style>
