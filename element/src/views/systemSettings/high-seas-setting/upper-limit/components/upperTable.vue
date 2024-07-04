<template>
  <div class="seas-set-item" v-loading="limitLoading">
    <slot></slot>
    <Table class="tabmain noBoxShadow-right noborder-table" :height="`${tableHeight}px`" :data="limitData" :isCustom="true" :customEmptyText="$t('crm.Table.noData')" customEmptyButtonText="" :customClearMethod="clearCondition" highlight-current-row style="width: 100%">
      <template>
        <TableColumn prop="userNames" :label="$t('highSeasSetting.inquriry.persons')" show-overflow-tooltip>
        </TableColumn>
        <TableColumn prop="maxCount" :label="$t('highSeasSetting.inquriry.maxCount')" show-overflow-tooltip>
        </TableColumn>
        <TableColumn prop="containOwn" :label="$t('highSeasSetting.inquriry.containOwn')" show-overflow-tooltip>
          <template slot="header">
            <span class="_form-item_label _text__overflow-com" :title="$t('highSeasSetting.inquriry.containOwn')">{{$t('highSeasSetting.inquriry.containOwn')}}</span>
          </template>
          <template slot-scope="{row}">
            <Checkbox v-model="row.containOwnFlag" size="medium" disabled></Checkbox>
          </template>
        </TableColumn>
        <TableColumn prop="containDeal" show-overflow-tooltip>
          <template slot="header">
            <span class="_form-item_label _text__overflow-com" :title="$t('highSeasSetting.inquriry.containDeal')">{{$t('highSeasSetting.inquriry.containDeal')}}</span>
          </template>
          <template slot-scope="{row}">
            <Checkbox v-model="row.containDealFlag" size="medium" disabled></Checkbox>
          </template>
        </TableColumn>
        <TableColumn prop="createTime" :label="$t('highSeasSetting.inquriry.createTime')" show-overflow-tooltip>
          <template slot-scope="{row}">
            <span>{{ row.createTime | timeFormat("DateTime")}}</span>
          </template>
        </TableColumn>
        <TableColumn prop="createUser" :label="$t('highSeasSetting.inquriry.createUser')" show-overflow-tooltip>
        </TableColumn>
        <TableColumn :label="$t('highSeasSetting.inquriry.operation')" width="100" show-overflow-tooltip>
          <template slot-scope="{row}">
            <Button type="text" @click="editLimit(row)" icon="custom custom-field-edit"></Button>
            <Button type="text" style="margin-left: 15px" @click="deletLimit(row)" icon="custom custom-field-delete"></Button>
          </template>
        </TableColumn>
      </template>
    </Table>
    <Row>
      <Page :page-size="pageConfig.pageNumber" :page-sizes="pageConfig.pageSizes" @size-change="pageSizeChange" layout="total, prev, pager, next, sizes, jumper" :total="pageConfig.total" class="pageWrap-right" :current-page="pageConfig.page" @current-change="changePage"></Page>
    </Row>
    <selfModal ref="upLimitModalTable" modalType="edit" @success="init"></selfModal>
  </div>
</template>

<script>
    import selfModal from './uppertModal';
    import {
        getTableList,
        removeUserLimit
    } from '@/api/systemSettings/high-seas-setting/upperLimit';
    import { mapState } from 'vuex';
    export default {
        name: 'upperLimitTable',
        components: { selfModal },
        computed: {
            maxPageNum() {
                return (this.pageConfig.total || 0) / this.pageConfig.pageNumber;
            },
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId'
            }),
            tableHeight() {
                const h = this.$store.state.window_height - 450;
                return h < 200 ? 200 : h;
            }
        },
        data() {
            return {
                limitLoading: false,
                limitData: [],
                pageConfig: {
                    page: 1,
                    pageNumber: 10,
                    total: 0,
                    pageSizes: [10, 20, 30, 40]
                }
            };
        },
        methods: {
            clearCondition() {
                this.resetSearchData();
                this.getTableData();
            },
            async init() {
                this.limitLoading = true;
                const td = await getTableList({
                    page: this.pageConfig.page,
                    pageNumber: this.pageConfig.pageNumber
                });
                if (td.code === '1') {
                    const a = td.data;
                    this.limitData = ((a && a.list) || []).map(v => {
                        return {
                            ...v,
                            containOwnFlag: Boolean(v.containOwn),
                            containDealFlag: Boolean(v.containDeal)
                        };
                    });
                    this.pageConfig.total = (a && a.total) || 0;
                }
                this.limitLoading = false;
            },
            editLimit(row) {
                this.$refs.upLimitModalTable.show(row);
            },
            deletLimit(row) {
                this.$confirm(
                    `${this.$t('highSeasSetting.inquriry.deleteContent')}`,
                    this.$t('b2b.production.delete'),
                    {
                        confirmButtonText: this.$t('confirm'),
                        cancelButtonText: this.$t('cancel'),
                        type: ''
                    }
                )
                    .then(async res => {
                        const data = await removeUserLimit({
                            id: row.id
                        });
                        if (data.code === '1') {
                            this.computedCurrent();
                            this.init();
                            this.$Message.success(this.$t('portal_set.del_success'));
                        }
                    })
                    .catch(({ data }) => {
                        this.$Message.warning(data.message || 'fail');
                    });
            },
            computedCurrent() {
                if (this.limitData.length === 1) {
                    const cur = this.pageConfig.page - 1;
                    this.pageConfig.page = cur || 1;
                }
            },
            pageSizeChange(pageSize) {
                this.pageConfig.page = 1;
                this.pageConfig.pageNumber = pageSize;
                this.init();
            },
            changePage(page) {
                this.pageConfig.page = page;
                this.init();
            }
        },
        mounted() {
            this.init();
        }
    };
</script>
