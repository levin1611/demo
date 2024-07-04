<template>
  <div class="b-r">
    <Card class="table_card _b_r" body-style="height:376px;">
      <div class="table_header _f _j_b">
        <div class="table_header_left _f _c _j_b">
          <span class="table_title">{{
            $t("dashBoardV2.Title.salesInquiryStatistics")
          }}</span>
        </div>
        <div class="_f _j_b">
          <div class="table_header_right"></div>
        </div>
      </div>
      <div class="table_body" v-loading="loading">
        <Table
          :data="tableData"
          highlight-current-row
          ref="table"
          size="medium"
          height="266px"
          max-height="266px"
          :class="`tableScroll${kind}`"
          :span-method="arraySpanMethod"
          v-if="refresh_table_flag"
          @mouseenter.native="ctrlScrollBar(0)"
          @mouseleave.native="ctrlScrollBar(1)"
        >
          <TableColumn
            v-for="item in tableColumns"
            :key="item.key"
            :prop="item.key"
            :label="item.title"
            :fixed="item.fixed"
            :align="item.align || 'center'"
            :width="item.width"
            :min-width="item.width || 100"
            :render-header="item.renderHeader"
          >
            <TableColumn
            v-for="child in item.child"
            :key="child.key"
            :prop="child.key"
            :label="child.title"
            :align="child.align || 'center'"
            :fixed="child.fixed"
            :width="child.width"
            :min-width="child.width || 100"
            :show-overflow-tooltip="true"
            >
            <template slot-scope="scope">
                <span>
                {{ scope.row[child.key] }}
                </span>
            </template>
            </TableColumn>
            <template slot-scope="scope">
                  <span
                    class="hoverBtn"
                    :class="`piwik_${item.key}`"
                    @click="jumpToDetail(item.key, scope.row)"
                  >
                    {{ scope.row[item.key] }}
                  </span>
                </template>
          </TableColumn>
        </Table>
      </div>
    </Card>
    <deleteIcon
      @removeFromDashBoard="removeFromDashBoard"
      style="position: absolute; bottom: 0px; right: 0px"
    />
  </div>
</template>

<script>
    import { getDiffFollowupInquiryStats } from '@/api/dashBoard/dashBoardV2';
    import { mapState, mapGetters } from 'vuex';
    import deleteIcon from './deleteIcon';
    export default {
        name: 'card-sales-inquiryStatistics',
        components: {
            deleteIcon
        },
        data() {
            return {
                loading: false,
                tableColumns: [
                    {
                        key: '',
                        title: this.$t('dashBoardV2.Table.lixincol0'),
                        align: 'center',
                        fixed: true,
                        width: 240,
                        child: [
                            {
                                key: 'firstDepartmentName',
                                title: '',
                                width: 80,
                                align: 'center'
                            },
                            {
                                key: 'secondDepartmentName',
                                title: '',
                                width: 80,
                                align: 'center'
                            },
                            {
                                key: 'fullName',
                                title: '',
                                width: 80,
                                align: 'center'
                            }
                        ]
                    }
                ],
                tableData: [],
                statusList: [],
                isHaveRight: false, // 是否有查看下属邮件权限
                kind: 'salesInquiryStatistics',
                refresh_table_flag: true,
                timeRange: null
            };
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                orgId: state => state.enterpriseId,
                userName: state => state.userName,
                window_width: state => state.window_width
            }),
            ...mapGetters(['isContainsMenu'])
        },
        methods: {
            setSpanMethod() {
                const rowOneData = [];
                const rowTwoData = [];
                let rowOne = 0;
                let rowTwo = 0;
                this.tableData.forEach((item, index) => {
                    if (index === 0) {
                        rowOneData.push(1);
                        rowTwoData.push(1);
                    } else {
                        if (item.firstDepartmentId === this.tableData[index - 1].firstDepartmentId) {
                            rowOneData[rowOne] += 1;
                            rowOneData.push(0);
                        } else {
                            rowOneData.push(1);
                            rowOne = index;
                        }
                        if (item.secondDepartmentId && (item.secondDepartmentId === this.tableData[index - 1].secondDepartmentId)) {
                            rowTwoData[rowTwo] += 1;
                            rowTwoData.push(0);
                        } else {
                            rowTwoData.push(1);
                            rowTwo = index;
                        }
                    }
                });
                return {
                    one: rowOneData,
                    two: rowTwoData
                };
            },
            // 获取全部询盘状态 设置表头
            get_followUp_status() {
                this.loading = true;
                this.$commonApi
                    .getFollowUpList({
                        orgId: this.orgId,
                        typeId: 7
                    })
                    .then(response => {
                        if (response.code === '1') {
                            const status_list = response.data.filter(item => item.isAvailable === 1).sort((a, b) => a.sort - b.sort);
                            status_list.unshift({
                                attrName: this.$t('crm.UniSet.defaultFollowUpStatus_inquiry'),
                                attrId: 0
                            });
                            status_list.push({
                                attrName: this.$t('crm.Html.closeInquiry'),
                                attrId: -1
                            });

                            status_list.forEach(item => {
                                const obj = {
                                    key: `${item.attrId}`,
                                    title: item.attrName,
                                    align: 'center'
                                };
                                this.tableColumns.push(obj);
                            });
                            this.statusList = status_list;
                            this.tableColumns = this.tableColumns.map((col, index) => {
                                col.renderHeader = this.renderHeader_filter(index);
                                return col;
                            });
                            this.$nextTick(() => {
                                this.$refs.table.doLayout();
                            });
                            this.getData();
                        } else {
                            this.$Message.error(this.$t('crm.Html.error_getFollowUpStatusList'));
                        }
                    });
            },
            arraySpanMethod({ row, column, rowIndex, columnIndex }) {
                if (columnIndex === 0) {
                    const _row = (this.setSpanMethod().one)[rowIndex];
                    const _col = _row > 0 ? 1 : 0;
                    return {
                        rowspan: _row,
                        colspan: _col
                    };
                }
                if (columnIndex === 1) {
                    const _row = (this.setSpanMethod().two)[rowIndex];
                    const _col = _row > 0 ? 1 : 0;
                    return {
                        rowspan: _row,
                        colspan: _col
                    };
                }
            },
            getData() {
                const orgId = this.orgId;
                const userId = this.userId;
                const data = {
                    orgId,
                    userId
                };
                getDiffFollowupInquiryStats(data).then(res => {
                    if (res.code === '1') {
                        this.tableData = res.data.sort((a, b) => a.firstDepartmentId - b.firstDepartmentId);
                        this.refresh_table_flag = false;
                        this.$nextTick(() => {
                            this.refresh_table_flag = true;
                        });
                        // setTimeout(() => {
                        //     this.ctrlScrollBar(1);
                        // }, 0);
                    } else {
                        this.tableData = [];
                    }
                    setTimeout(() => {
                        this.loading = false;
                    }, 500);
                });
            },

            dateFormat(timeStamp, divider = '-') {
                const time = new Date(timeStamp);
                const y = time.getFullYear();
                let m = time.getMonth() + 1;
                m = m < 10 ? `0${m}` : m;
                let d = time.getDate();
                d = d < 10 ? `0${d}` : d;
                return `${y}${divider}${m}${divider}${d}`;
            },
            async jumpToDetail(type, row) {
                /**
                 * @params userId  点击表格中某一行的用户id
                 * */
                let config = [];
                // 跳转询盘
                if (this.isContainsMenu('myInquiry')) {
                    const followUpData = this.statusList.filter(item => type === `${item.attrId}`);
                    config = [
                        ['inquiryManagers', [{ label: row.fullName, value: row.userId }]],
                        ['followUp', [{ label: followUpData[0].attrName, value: followUpData[0].attrId }]]
                    ];
                    localStorage.setItem('dashboard_inquiry_filters', JSON.stringify(config));
                    this.$stm.openNewWindow(this.$router.resolve({
                        name: 'myInquiry'
                    }).href);
                } else {
                    this.$Message.warning(this.$t('globalSearch.haveNoPermissionMyInquiry'));
                }
            },
            ctrlScrollBar(flag) {
                const parent = document.querySelector(`.tableScroll${this.kind}`);
                const dom = parent.querySelector('.el-table__body-wrapper');
                if (flag === 0) {
                    dom.style.overflow = 'overlay';
                } else {
                    dom.style.overflow = 'hidden';
                }
            },
            removeFromDashBoard() {
                this.$emit('removeFromDashBoard', this.kind);
            },
            renderHeader_filter(colIndex) {
                return h => {
                    const column = this.tableColumns[colIndex];
                    const title = h('div', {
                        attrs: {
                            title: column.title
                        },
                        class: 'table-filter-title',
                        title: column.title
                    }, column.title);
                    return h('div', {
                        class: 'table-filter-container'
                    }, [title]);
                };
            }
        },
        created() {
            this.get_followUp_status();
        },
        mounted() {},
        watch: {
            tableData: {
                handler(val) {
                    if (val) {
                    // this.setSpanMethod();
                    }
                }
            }
        }
    };
</script>
<style scoped lang="less">
    @import "./cardtables.less";
    /deep/.el-table .table-filter-container{
        justify-content: center;
    }
    .table_header_right {
        display: flex;
        .target_type_select {
            align-self: center;
            margin-right: 10px;
        }
        /deep/ .el-select {
            width: 100px;
        }
    }
    /deep/.el-table__header .is-group tr:last-child {
        display: none;
    }
</style>
