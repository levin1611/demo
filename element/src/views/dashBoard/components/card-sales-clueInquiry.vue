<template>
  <div class="b-r">
    <Card class="table_card _b_r" body-style="height:376px;">
      <div class="table_header _f _j_b">
        <div class="table_header_left _f _c _j_b">
          <span class="table_title">{{
            $t("dashBoardV2.Title.salesclueStatistics")
          }}</span>
        </div>
        <div class="_f _j_b">
          <div class="table_header_right">
            <!-- 日期Select-->
            <Select
              v-model="targetDate"
              size="small"
              class="target_date_select"
              @change="handleDateChange(targetDate)"
            >
              <Option
                v-for="item in dateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></Option>
            </Select>
          </div>
        </div>
      </div>
      <div class="table_body" v-loading="loading">
          <!-- class="noBoxShadow-right noborder-table dashBoard_table tabmain" -->
        <Table
          :data="tableData"
          highlight-current-row
          ref="table"
          size="medium"
          height="266px"
          max-height="266px"
          :span-method="arraySpanMethod"
          class="noBoxShadow-right"
          :class="`tableScroll${kind}`"
          v-if="refresh_table_flag"
          @mouseenter.native="ctrlScrollBar(0)"
          @mouseleave.native="ctrlScrollBar(1)"
        >
          <TableColumn
            v-for="item in tableColumns"
            :key="item.key"
            :prop="item.key"
            :label="item.title"
            :align="item.align || 'center'"
            :fixed="item.fixed"
            :width="item.width"
            :min-width="item.width || 120"
            :show-overflow-tooltip="true"
          >
          <!-- <template slot-scope="scope" v-if="item.child && item.child.length"> -->
            <TableColumn
                v-for="child in item.child"
                :key="child.key"
                :prop="child.key"
                :label="child.title"
                :align="child.align || 'center'"
                :width="child.width"
                :show-overflow-tooltip="true"
              >
                <template slot-scope="scope">
                  <span>
                    {{ scope.row[child.key] }}
                  </span>
                </template>
              </TableColumn>
            <!-- </template> -->
            <template slot-scope="scope">
                  <span
                    class="hover-link"
                    :class="`piwik_${item.key}`"
                    @click="jumpToDetail(item.key,scope.row)"
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
    import { getClueAndInquiryStats } from '@/api/dashBoard/dashBoardV2';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { mapState, mapGetters } from 'vuex';
    import deleteIcon from './deleteIcon';
    export default {
        name: 'card-sales-clueInquiry',
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
                    },
                    {
                        key: 'assignedClueCount',
                        title: this.$t('dashBoardV2.Table.lixincol1'),
                        width: 126,
                        align: 'center'
                    },
                    {
                        key: 'assignedInquiryCount',
                        title: this.$t('dashBoardV2.Table.lixincol2'),
                        width: 150,
                        align: 'center'
                    },
                    {
                        key: 'ownCreateClueCount',
                        title: this.$t('dashBoardV2.Table.lixincol3'),
                        // width: 120,
                        align: 'center'
                    },
                    {
                        key: 'ownCreateInquiryCount',
                        title: this.$t('dashBoardV2.Table.lixincol4'),
                        // width: 120,
                        align: 'center'
                    }
                ],
                tableData: [],
                dateOptions: [
                    {
                        value: 'today',
                        label: this.$t('crm.Table.today')
                    },
                    {
                        value: 'yesterday',
                        label: this.$t('crm.Table.yesterday')
                    },
                    {
                        value: 'thisWeek',
                        label: this.$t('crm.Table.thisWeek')
                    },
                    {
                        value: 'lastWeek',
                        label: this.$t('crm.Table.lastWeek')
                    },
                    {
                        value: 'thisYear',
                        label: this.$t('dashBoardV2.Select.thisYear')
                    },
                    {
                        value: 'lastYear',
                        label: this.$t('dashBoardV2.Select.lastYear')
                    }
                ],
                targetDate: 'thisWeek',
                isHaveRight: false, // 是否有查看下属邮件权限
                kind: 'salesclueInquiry',
                refresh_table_flag: true,
                timeRange: null
            };
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                orgId: state => state.enterpriseId,
                userName: state => state.userName,
                window_width: state => state.window_width,
                button_list: state => state.app.button_list
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
            // 切换时间
            handleDateChange(val) {
                const end = new Date();
                const start = new Date();
                let dayNo = start.getDay();
                switch (val) {
                    case 'today':
                        this.timeRange = [start.getTime(), end.getTime()];
                        break;
                    case 'yesterday':
                        this.timeRange = [
                            start.getTime() - 24 * 60 * 60 * 1000,
                            end.getTime() - 24 * 60 * 60 * 1000
                        ];
                        break;
                    case 'thisWeek':
                        dayNo = dayNo ? dayNo - 1 : 6;
                        this.timeRange = [
                            start.getTime() - dayNo * 24 * 60 * 60 * 1000,
                            end.getTime()
                        ];
                        break;
                    case 'lastWeek':
                        dayNo = dayNo || 7;
                        this.timeRange = [
                            end.getTime() - (6 + dayNo) * 24 * 60 * 60 * 1000,
                            end.getTime() - dayNo * 24 * 60 * 60 * 1000
                        ];
                        break;
                    case 'thisYear':
                        this.timeRange = [
                            new Date(end.getFullYear(), 0, 1).getTime(),
                            end.getTime()
                        ];
                        break;
                    case 'lastYear':
                        this.timeRange = [
                            new Date(end.getFullYear() - 1, 0, 1).getTime(),
                            new Date(end.getFullYear() - 1, 11, 31).getTime()
                        ];
                        break;
                }
                this.getData();
            },
            getData() {
                const startDate = this.timeRange.length
                    ? this.dateFormat(this.timeRange[0])
                    : undefined;
                const endDate = this.timeRange.length
                    ? this.dateFormat(this.timeRange[1])
                    : undefined;
                const orgId = this.orgId;
                const userId = this.userId;
                const data = {
                    startDate,
                    endDate,
                    orgId,
                    userId
                };
                this.loading = true;
                getClueAndInquiryStats(data).then(res => {
                    if (res.code === '1') {
                        this.tableData = res.data;
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
                if (type === 'ownCreateInquiryCount') {
                    if (this.isContainsMenu('myInquiry')) {
                        // 跳转
                        config = [
                            ['inquiryManagers', [{ label: row.fullName, value: row.userId }]], // 负责人
                            ['createUser', [{ label: row.fullName, value: row.userId }]]
                        ];
                        // 时间
                        if (this.timeRange.length) {
                            config.unshift(['createTime', this.timeRange]);
                        }
                        localStorage.setItem('dashboard_inquiry_filters', JSON.stringify(config));
                        this.$stm.openNewWindow(this.$router.resolve({
                            name: 'myInquiry'
                        }).href);
                    } else {
                        this.$Message.warning(this.$t('globalSearch.haveNoPermissionMyInquiry'));
                    }
                } else {
                    if (this.isContainsMenu('my_clue') && !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.id, this.button_list)) {
                        // const authorized = await this.isHaveAuthority({
                        //     type: 'Clue',
                        //     id: this.clueId
                        // });
                        // if (!authorized) return;
                        // if (authorized === 'highseas') {
                        //     this.$Message.warning(this.$t('crm.Modal.error_JumpClueInHighseas'));
                        //     return;
                        // }
                        const createUserList = row.createUserList;
                        const createUser = [];
                        let status = [];
                        if (type.indexOf('ownCreate') > -1) {
                            createUser.push({ label: row.fullName, value: row.userId });
                        } else {
                            if (createUserList && createUserList.length) {
                                createUserList.forEach(item => {
                                    const obj = {
                                        label: item.name,
                                        value: item.id
                                    };
                                    createUser.push(obj);
                                });
                            }
                            if (type === 'assignedInquiryCount') {
                                status = [
                                    {
                                        value: 3,
                                        label: this.$t('clue.inquiry')
                                    }
                                ];
                            }
                        }
                        config = [
                            ['saleName', [{ label: row.fullName, value: row.userId }]],
                            ['createUser', createUser],
                            ['status', status]
                        ];
                        if (this.timeRange.length) {
                            config.unshift(['createTime', this.timeRange]);
                        }

                        localStorage.setItem(
                            'dashboard_clue_filter',
                            JSON.stringify(config)
                        );
                        localStorage.setItem(
                            'dashboard_clue_type',
                            JSON.stringify(3)
                        );
                        this.$stm.openNewWindow(this.$router.resolve({
                            name: 'my_clue'
                        }).href);
                    } else {
                        this.$Message.error(this.$t('globalSearch.haveNoPermissionAllClue'));
                    }
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
                    return h('div', {}, [title]);
                };
            }
        },
        created() {
            this.tableColumns = this.tableColumns.map((col, index) => {
                col.renderHeader = this.renderHeader_filter(index);
                return col;
            });
            this.handleDateChange(this.targetDate);
        },
        mounted() {

        },
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
    .table_header_right {
        display: flex;
        .target_type_select {
            align-self: center;
            margin-right: 10px;
        }
        /deep/ .el-select {
            width: 78px;
        }
    }
    /deep/.el-table__header .is-group tr:last-child {
        display: none;
    }
</style>
