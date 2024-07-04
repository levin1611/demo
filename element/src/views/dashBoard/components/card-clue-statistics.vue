<template>
  <div class="b-r">
    <Card class="table_card _b_r" body-style="height:376px;">
      <div class="table_header _f _j_b">
        <div class="table_header_left _f _c _j_b">
          <span class="table_title">{{ $t("dashBoardV2.Title.clueStatistics") }}</span>
        </div>
        <div class="_f _j_b">
          <div class="table_header_right">
            <!-- 来源渠道Select-->
            <Select
              v-model="viewTab"
              size="small"
              class="target_type_select"
              @change="handleTabChange(viewTab)"
            >
              <Option
                v-for="item in viewsTabs"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></Option>
            </Select>
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
        <Table
          :data="tableData"
          highlight-current-row
          ref="table"
          size="medium"
          height="266px"
          max-height="266px"
          :span-method="arraySpanMethod"
          :class="`tableScroll${kind}`"
          v-if="refresh_table_flag"
          @mouseenter.native="ctrlScrollBar(0)"
          @mouseleave.native="ctrlScrollBar(1)"
        >
          <!-- <TableColumn
            v-if="viewTab === 'channel'"
            key="0"
            prop="channelName"
            :label="$t('dashBoardV2.Table.channel')"
            align="center"
            width="100"
            min-width="100"
          >
            <template slot-scope="scope">
              {{ scope.row["channelName"] }}
            </template>
          </TableColumn> -->
          <!-- <TableColumn
                v-for="item in tableColumns"
                :key="item.key"
                :label="item.title"
                :align="item.align || 'center'"
                :width="item.width"
                :min-width="item.width || 64"
                :class="item.key"
            >
                <TableColumn
                    v-for="child in item.child"
                    :key="child.key"
                    :prop="child.key"
                    :label="child.title"
                    :align="child.align || 'center'"
                    :width="child.width"
                    :min-width="child.width || 64"
                    :class="child.key"
                    :show-overflow-tooltip="true"
                >
                    <template slot-scope="scope">
                        <span
                            class="hoverBtn"
                            :class="`piwik_${child.key}`"
                            @click="
                                jumpToDetail(child.key, scope.row.userId, scope.row.userName)
                            "
                            >
                            {{scope.row[child.key]}}
                        </span>

                    </template>
                </TableColumn>
            </TableColumn> -->
          <TableColumn
            v-for="item in tableColumns"
            :key="item.key"
            :prop="item.key"
            :label="item.title"
            :fixed="item.fixed"
            :align="item.align || 'center'"
            :width="item.width"
            :min-width="item.width || 100"
          >
            <template v-if="item.child && item.child.length">
              <TableColumn
                v-for="child in item.child"
                :key="child.key"
                :prop="child.key"
                :label="child.title"
                :fixed="child.fixed"
                :align="child.align || 'center'"
                :width="child.width"
                :min-width="child.width || 80"
                :show-overflow-tooltip="true"
              >
                <template slot-scope="scope">
                  <span v-if="child.key !=='firstDepartmentName' && child.key !== 'secondDepartmentName' && scope.row[child.key]"
                    class="hoverBtn"
                    :class="`piwik_${child.key}`"
                    @click="jumpToDetail(child.jumpStatus, child.key, scope.row)"
                  >
                    {{ scope.row[child.key] }}
                  </span>
                  <span v-else>{{ scope.row[child.key] }}</span>
                </template>
              </TableColumn>
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
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import deleteIcon from './deleteIcon';
    export default {
        name: 'card-clue-statistics',
        components: {
            deleteIcon
        },
        data() {
            return {
                loading: false,
                tableColumns: [],
                tableData: [],
                viewsTabs: [
                    {
                        value: 'channel',
                        label: this.$t('dashBoardV2.Select.channel')
                    },
                    {
                        value: 'department',
                        label: this.$t('dashBoardV2.Select.department')
                    }
                ],
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
                viewTab: 'channel',
                showLoadingOpts: {
                    text: '数据加载中...',
                    color: '#fd7a35',
                    textColor: '#fd7a35',
                    maskColor: 'rgba(255, 255, 255, 1)',
                    zlevel: 0
                }, // echarts 加载数据or无数据时的展示

                redirectList: [
                    'pendingMailCount',
                    'pendingClueCount',
                    'pendingCustomerCount'
                ], // 可以跳转的tableColumns数组
                emailList: [],
                isBindMail: false, // 是否绑定邮箱
                isHaveRight: false, // 是否有查看下属邮件权限
                kind: 'clueStatistics',
                refresh_table_flag: true,
                timeRange: null,
                jumpTime: null
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
                let rowOne = 0;
                this.tableData.forEach((item, index) => {
                    if (index === 0) {
                        rowOneData.push(1);
                    } else {
                        if (item.firstDepartmentName === this.tableData[index - 1].firstDepartmentName) {
                            rowOneData[rowOne] += 1;
                            rowOneData.push(0);
                        } else {
                            rowOneData.push(1);
                            rowOne = index;
                        }
                    }
                });
                return {
                    one: rowOneData
                };
            },
            // 设置表格显示
            setTableColumns(array) {
                this.tableColumns = [];
                if (this.viewTab === 'department') {
                    this.tableColumns = [
                        {
                            key: 'id',
                            title: '部门',
                            align: 'center',
                            fixed: true,
                            width: 200,
                            child: [
                                {
                                    key: 'firstDepartmentName',
                                    title: '一级部门',
                                    width: 100
                                },
                                {
                                    key: 'secondDepartmentName',
                                    title: '二级部门',
                                    width: 100
                                }
                            ]
                        }
                    ];
                } else {
                    this.tableColumns = [
                        {
                            key: 'channel',
                            title: this.$t('dashBoardV2.Table.channel'),
                            align: 'center',
                            width: 100,
                            fixed: true
                        }
                    ];
                }
                if (this.targetDate === 'thisYear' || this.targetDate === 'lastYear') {
                    this.tableColumns.push({
                        key: 'totleid',
                        title: '年总数',
                        align: 'center',
                        child: [
                            {
                                key: 'totalClue',
                                align: 'center',
                                jumpStatus: 'all',
                                title: '线索总数'
                            },
                            {
                                key: 'totalInqury',
                                jumpStatus: 'inquiry',
                                align: 'center',
                                title: '`"询盘"状态的线索`'
                            }
                        ]
                    });
                }
                array.forEach(item => {
                    const obj = {
                        key: `${item}Id`,
                        title: item.indexOf('.') >= 0 ? item : this.$t(`datepicker.month${item}`),
                        align: 'center',
                        child: [
                            {
                                key: `${item}CuleCount`,
                                jumpStatus: 'all',
                                title: '线索总数',
                                align: 'center'
                            },
                            {
                                key: `${item}InquryCount`,
                                jumpStatus: 'inquiry',
                                align: 'center',
                                title: '"询盘"状态的线索'
                            }
                        ]
                    };
                    this.tableColumns.push(obj);
                });
                this.$nextTick(() => {
                    this.$refs.table.doLayout();
                });
                this.getData();
            },
            // 格式化日期
            getDayDate(date) {
                const newDate = new Date(date);
                const myyear = newDate.getFullYear();
                let mymonth = newDate.getMonth() + 1;
                let myweekday = newDate.getDate();
                mymonth = mymonth < 10 ? `0${mymonth}` : mymonth;
                myweekday = myweekday < 10 ? `0${myweekday}` : myweekday;
                return {
                    tableColumn: `${mymonth}.${myweekday}`,
                    jumpTime: `${myyear}-${mymonth}-${myweekday}`
                };
            },
            // 获取本年月份
            getMonthDay(type) {
                const date = new Date();
                const myyear = type ? (date.getFullYear() - 1) : date.getFullYear();
                const mymonth = type ? 12 : date.getMonth() + 1;
                const monthList = [];
                this.jumpTime = [];
                for (let i = 0; i < mymonth; i++) {
                    if (mymonth - i < 10) {
                        monthList.push(`0${mymonth - i}`);
                        this.jumpTime.push(`${myyear}-${mymonth - i}-1`);
                    } else {
                        monthList.push(`${mymonth - i}`);
                        this.jumpTime.push(`${myyear}-${mymonth - i}-1`);
                    }
                }
                return monthList.reverse();
            },
            // 获取本周的日期
            getWeekDay() {
                const date = new Date();
                const dateTime = date.getTime(); // 获取现在的时间
                const dateDay = date.getDay() ? date.getDay() - 1 : 6;
                const oneDayTime = 24 * 60 * 60 * 1000;
                const weekList = [];
                this.jumpTime = [];
                for (let i = 0; i < dateDay; i++) {
                    const time = dateTime - (dateDay - i) * oneDayTime;
                    weekList[i] = this.getDayDate(new Date(time)).tableColumn;
                    // 跳转到列表页需要与此进行判断 拿该时间
                    this.jumpTime.push(this.getDayDate(new Date(time)).jumpTime);
                }
                weekList.push(this.getDayDate(new Date()).tableColumn);
                this.jumpTime.push(this.getDayDate(new Date()).jumpTime);
                return weekList;
            },
            // 获取上周的日期
            getProWeekList() {
                const date = new Date();
                const dateTime = date.getTime(); // 获取现在的时间
                const dateDay = date.getDay();
                const oneDayTime = 24 * 60 * 60 * 1000;
                const proWeekList = [];
                this.jumpTime = [];
                for (let i = 0; i < 7; i++) {
                    const time = dateTime - (dateDay + (7 - 1 - i)) * oneDayTime;
                    proWeekList[i] = this.getDayDate(new Date(time)).tableColumn;
                    // 跳转到列表页需要与此进行判断 拿该时间
                    this.jumpTime.push(this.getDayDate(new Date(time)).jumpTime);
                }

                return proWeekList;
            },
            // 获取选中月的第一天与最后一天
            getDateByMonth(timeStamp) {
                const today = new Date();
                const inDate = new Date(timeStamp);
                const year = inDate.getFullYear();
                const month = inDate.getMonth();
                const startTime = new Date(year, month, 1).getTime();
                let endTime = '';
                // 如果选中的月份 是当前月，使用1号到当天时间
                if (today.getFullYear() === year && today.getMonth() === month) {
                    endTime = new Date(year, month, today.getDate()).getTime();
                } else {
                    endTime = new Date(year, month + 1, 0).getTime();
                }
                return [
                    startTime,
                    endTime
                ];
            },
            arraySpanMethod({ row, column, rowIndex, columnIndex }) {
                if (this.viewTab !== 'channel') {
                    if (columnIndex === 0) {
                        const _row = this.setSpanMethod().one[rowIndex];
                        const _col = _row > 0 ? 1 : 0;
                        return {
                            rowspan: _row,
                            colspan: _col
                        };
                    }
                }
            },
            // 切换来源 部门
            handleTabChange(val) {
                this.handleDateChange(this.targetDate);
            },
            // 切换时间
            handleDateChange(val) {
                let tableHeaderData = [];
                const end = new Date();
                const start = new Date();
                let dayNo = start.getDay();
                switch (val) {
                    case 'today':
                        tableHeaderData.push(this.getDayDate(end).tableColumn);
                        this.timeRange = [start.getTime(), end.getTime()];
                        break;
                    case 'yesterday':
                        tableHeaderData.push(this.getDayDate(end.getTime() - 24 * 60 * 60 * 1000).tableColumn);
                        this.timeRange = [
                            start.getTime() - 24 * 60 * 60 * 1000,
                            end.getTime() - 24 * 60 * 60 * 1000
                        ];
                        break;
                    case 'thisWeek':
                        tableHeaderData = this.getWeekDay();
                        dayNo = dayNo ? dayNo - 1 : 6;
                        this.timeRange = [
                            start.getTime() - dayNo * 24 * 60 * 60 * 1000,
                            end.getTime()
                        ];
                        break;
                    case 'lastWeek':
                        tableHeaderData = this.getProWeekList();
                        dayNo = dayNo || 7;
                        this.timeRange = [
                            end.getTime() - (6 + dayNo) * 24 * 60 * 60 * 1000,
                            end.getTime() - dayNo * 24 * 60 * 60 * 1000
                        ];
                        break;
                    case 'thisYear':
                        tableHeaderData = this.getMonthDay();
                        this.timeRange = [
                            new Date(end.getFullYear(), 0, 1).getTime(),
                            end.getTime()
                        ];
                        break;
                    case 'lastYear':
                        tableHeaderData = this.getMonthDay('lastYear');
                        this.timeRange = [
                            new Date(end.getFullYear() - 1, 0, 1).getTime(),
                            new Date(end.getFullYear() - 1, 11, 31).getTime()
                        ];
                        break;
                }
                this.setTableColumns(tableHeaderData);
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
                const days = !(this.targetDate === 'thisYear' || this.targetDate === 'lastYear');
                const data = {
                    startDate,
                    endDate,
                    orgId,
                    userId,
                    days
                };
                this.loading = true;
                // 不同渠道的线索统计
                let url = '/dashboard/lixin/getclueinqbychannle';
                if (this.viewTab !== 'channel') {
                    url = '/dashboard/lixin/getclueinqbydep';
                }
                util.ajaxJsonMoreLongTime({
                    url: url,
                    method: 'POST',
                    data: data
                }).then(res => {
                    if (res.data.code === '1') {
                        this.tableData = res.data.data.cluelist;
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
            async jumpToDetail(type, key, row) {
                /**
                 * @params userId  点击表格中某一行的用户id
                 * */
                let config = [];
                switch (type) {
                    case 'all':
                        // 跳转线索
                        if (this.isContainsMenu('my_clue') && !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.id, this.button_list)) {
                            // 根据key 获取所需其它参数
                            let checktimeRange = key.match(/-?([1-9]\d*(\.\d*)*|0\.[1-9]\d*)/g) ? `${key.match(/-?([1-9]\d*(\.\d*)*|0\.[1-9]\d*)/g)[0]}` : 'total';
                            if (this.viewTab === 'channel') {
                                config = [
                                    [
                                        'a10019',
                                        [
                                            {
                                                value: row.channel === '空(未填写)' ? null : row.channel,
                                                label: row.channel
                                            }
                                        ]
                                    ]
                                ];
                            } else {
                                const saleNames = row[`${checktimeRange === 'total' ? checktimeRange : checktimeRange > 10 ? checktimeRange : `0${checktimeRange}`}CuleFullNames`];
                                const saleIds = row[`${checktimeRange === 'total' ? checktimeRange : checktimeRange > 10 ? checktimeRange : `0${checktimeRange}`}CuleUserIDs`];
                                const saleName = [];
                                saleNames.forEach((item, index) => {
                                    const obj = {
                                        label: item,
                                        value: saleIds[index]
                                    };
                                    saleName.push(obj);
                                });
                                config.push(['saleName', saleName]);
                            }

                            if (this.targetDate === 'yesterday' || this.targetDate === 'today' || checktimeRange === 'total') {
                                config.unshift(['createTime', this.timeRange]);
                            } else if (this.targetDate === 'thisWeek' || this.targetDate === 'lastWeek') {
                                checktimeRange = checktimeRange.split('.').join('-');
                                let timeRange;
                                this.jumpTime.forEach(item => {
                                    if (item.indexOf(checktimeRange) > -1) {
                                        timeRange = item;
                                    }
                                });
                                config.unshift(['createTime', [timeRange, timeRange]]);
                            } else {
                                let timeRange;
                                this.jumpTime.forEach(item => {
                                    const month = item.split('-')[1];
                                    if (month === checktimeRange) {
                                        timeRange = this.getDateByMonth(item);
                                    }
                                });
                                config.unshift(['createTime', timeRange]);
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
                        break;
                    case 'inquiry':
                        // 跳转线索
                        if (this.isContainsMenu('my_clue') && !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.id, this.button_list)) {
                            // 根据key 获取所需其它参数
                            let checktimeRange = key.match(/-?([1-9]\d*(\.\d*)*|0\.[1-9]\d*)/g) ? `${key.match(/-?([1-9]\d*(\.\d*)*|0\.[1-9]\d*)/g)[0]}` : 'total';
                            config = [
                                [
                                    'status',
                                    [
                                        {
                                            value: 3,
                                            label: this.$t('clue.inquiry')
                                        }
                                    ]
                                ]
                            ];
                            if (this.viewTab === 'channel') {
                                config.push([
                                    'a10019',
                                    [
                                        {
                                            value: row.channel === '空(未填写)' ? null : row.channel,
                                            label: row.channel
                                        }
                                    ]
                                ]);
                            } else {
                                const saleNames = row[`${checktimeRange === 'total' ? checktimeRange : checktimeRange > 10 ? checktimeRange : `0${checktimeRange}`}InquryFullNames`];
                                const saleIds = row[`${checktimeRange === 'total' ? checktimeRange : checktimeRange > 10 ? checktimeRange : `0${checktimeRange}`}InquryUserIDs`];
                                const saleName = [];
                                saleNames.forEach((item, index) => {
                                    const obj = {
                                        label: item,
                                        value: saleIds[index]
                                    };
                                    saleName.push(obj);
                                });
                                config.push(['saleName', saleName]);
                            }
                            if (this.targetDate === 'yesterday' || this.targetDate === 'today' || checktimeRange === 'total') {
                                config.unshift(['createTime', this.timeRange]);
                            } else if (this.targetDate === 'thisWeek' || this.targetDate === 'lastWeek') {
                                checktimeRange = checktimeRange.split('.').join('-');
                                let timeRange;
                                this.jumpTime.forEach(item => {
                                    if (item.indexOf(checktimeRange) > -1) {
                                        timeRange = item;
                                    }
                                });
                                config.unshift(['createTime', [timeRange, timeRange]]);
                            } else {
                                let timeRange;
                                this.jumpTime.forEach(item => {
                                    const month = item.split('-')[1];
                                    if (month === checktimeRange) {
                                        timeRange = this.getDateByMonth(item);
                                    }
                                });
                                config.unshift(['createTime', timeRange]);
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
                        break;
                }
            },
            isHaveAuthority(inquiryId) {
                return util
                    .ajax({
                        url: 'crm/mailbox/isHaveAuthority',
                        method: 'get',
                        params: {
                            userId: this.userId,
                            orgId: this.enterpriseId,
                            inquiryId: inquiryId
                        }
                    })
                    .then(res => {
                        if (res.data.code === '1') {
                            if (res.data.data === 1) {
                                return true;
                            } else if (res.data.data === 2) {
                                this.$Message.warning(this.$t('crm.Modal.error_JumpInquiryInHighseas'));
                                return false;
                            } else if (res.data.data === 3) {
                                this.$Message.warning(this.$t('crm.Modal.error_JumpInquiryMerged'));
                                return false;
                            } else {
                                this.$Message.warning(this.$t('crm.Modal.error_JumpInquiryHaveNoPermission'));
                                return false;
                            }
                        }
                    });
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
            }
        },
        created() {
            this.handleDateChange(this.targetDate);
        },
        mounted() {}
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
        /deep/.el-select {
            width: 100px;
        }
        /deep/.target_date_select {
            width: 78px;
        }
    }
</style>
