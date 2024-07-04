<template>
    <div class="service">
        <div class="service-header">
            <div style="display: flex;">
                <div class="service-checked">
                </div>

                <!-- 筛选之后的标签显示 -->
                <FilterTags
                        style="top: 0px; left: 8px"
                        :order_column="sort"
                        :order_type="sortType"
                        :filterConObj.sync="config_tableFilter"
                        :langObj="lang_mail"
                        :storageName_orderColumn="sort"
                        :width="filterComponentWidth"
                        :removeWidth="1100"
                        :minWidth="390"
                        @change_filter_tag="change_filter_tag"
                        @emptySort="empty_sort"
                        @removeCon="remove_filter_tag"
                ></FilterTags>
            </div>
            <div class="service-send">
                <!--<Tooltip placement="top"-->
                         <!--transfer-->
                         <!--content="对当前列表页内展示的全部邮件联系人进行重发"-->
                         <!--v-show="!selectList.length">-->
                    <!--<span @click.stop="allResendVisible = true;">{{$t('mailMarketing.report.resendAll')}}</span>-->
                <!--</Tooltip>-->
                <!--<span v-show="selectList.length" @click.stop="handleConfirm(0)">{{mailMarketing.report.resend}}</span>-->
            </div>
        </div>
        <div class="service-table">
            <Table :data="tableList"
                   @selection-change="handleSelectionChange"
                   :height="tableHeight"
                   ref="multipleTable">
                <TableColumn type="selection" width="45"> </TableColumn>
                <TableColumn
                        v-for="(item, index) in tableColumns"
                        :width="item.width"
                        :min-width="item.minWidth || 64"
                        :key="index"
                        :prop="item.key"
                        :label="item.label"
                        :render-header="item.renderHeader"
                        :show-overflow-tooltip="true"
                        :resizable="item.resizable !== false"
                        v-if="currentTableType === 'service' && ['mailContact','sendStatus','openedCount','mailSendDate','recentlyOpenedTime','recentlyOpenedLocation'].includes(item.key)
                        || currentTableType === 'notDelivered' && ['mailContact','sendStatus','sendFailReason','mailSendDate'].includes(item.key)"
                >
                    <template  slot-scope="{row}">
                        <template v-if="item.key === 'mailContact'">
                            <span>{{JSON.parse(row.mailContact)[0]}}</span>
                        </template>
                        <template v-else-if="item.key === 'sendStatus'">
                            <span :style="row.sendStatus === 1?'color:#00CC99':'color:#EA4335'">{{row.sendStatus | sendStatusFilter }}</span>
                        </template>
                        <template v-else-if="item.key === 'mailSendDate'">
                            <span>{{new Date(Number(row.mailSendDate)).format('yyyy-MM-dd hh:mm:ss')}}</span>
                        </template>
                        <template v-else-if="item.key === 'recentlyOpenedTime'">
                            <span>{{row.recentlyOpenedTime && new Date(Number(row.recentlyOpenedTime)).format('yyyy-MM-dd hh:mm:ss')}}</span>
                        </template>
                        <template v-else-if="item.key !== 'sendStatus' && item.key !== 'mailContact' && item.key !== 'mailSendDate' && item.key !== 'recentlyOpenedTime'">
                            <span>{{row[item.key]}}</span>
                        </template>
                    </template>
                </TableColumn>
            </Table>
            <!-- 分页 -->
            <Page
                    :total="total"
                    :current-page.sync="currentPageNum"
                    :page-size="pageSize"
                    :page-sizes="[20, 50, 100]"
                    class="pageWrap-right"
                    layout="total, prev, pager, next, sizes, jumper"
                    @current-change="pageChange"
                    @size-change="pageSizeChange"
                    transfer
            >
            </Page>
        </div>

        <!-- 一键全部重发的二次确认 -->
        <Modal
                :visible.sync="allResendVisible"
                :modal-append-to-body="false"
                :close-on-click-modal="false"
                :append-to-body="true"
                width="360px">
            <p slot="title">
                <span>{{$t('mailMarketing.report.resendAll')}}</span>
            </p>
            <div>
                <p>{{$t('mailMarketing.report.confirmResend')}}</p>
            </div>
            <div slot="footer">
                <Button @click="allResendVisible = false">{{$t('mailMarketing.cancel')}}</Button>
                <Button type="primary" @click="handleConfirm(1)" :loading="reSendLoading" :disabled="!tableList">{{$t('mailMarketing.confirm')}}</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import FilterTags from '@/views/main-components/filter-tags';
    export default {
        name: '',
        props: ['currentTableType', 'id'],
        data() {
            return {
                num: 1,
                reSendLoading: false,
                tableList: [],
                sortType: 'desc', // 排序方式
                sort: '',
                filterComponentWidth: 220, // 筛选组件的宽度
                config_tableFilter: {
                    mailContact: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型,              string / number / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: null
                    },
                    openedCount: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'number', // 筛选类型,              string / number / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: null
                    },
                    recentlyOpenedTime: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型,              string / number / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: null
                    },
                    recentlyOpenedLocation: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型,              string / number / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: null
                    },
                    sendFailReason: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型,              string / number / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: null
                    },
                    mailSendDate: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型,              string / number / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: null
                    }
                },
                lang_mail: {
                    mailContact: this.$t('mailMarketing.report.mailContact'),
                    openedCount: this.$t('mailMarketing.report.openTimes'),
                    recentlyOpenedTime: this.$t('mailMarketing.report.lastOpenedTime'),
                    recentlyOpenedLocation: this.$t('mailMarketing.report.recentlyOpenedLocation'),
                    sendFailReason: this.$t('mailMarketing.report.reasonFailure'),
                    mailSendDate: this.$t('mailMarketing.report.dateDelivery')
                },
                tableColumns: [
                    {
                        title: this.$t('mailMarketing.report.mailContact'),
                        label: this.$t('mailMarketing.report.mailContact'),
                        key: 'mailContact',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.report.deliveryStatus'),
                        label: this.$t('mailMarketing.report.deliveryStatus'),
                        key: 'sendStatus',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.report.openTimes'),
                        label: this.$t('mailMarketing.report.openTimes'),
                        key: 'openedCount',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.report.lastOpenedTime'),
                        label: this.$t('mailMarketing.report.lastOpenedTime'),
                        key: 'recentlyOpenedTime',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.report.recentlyOpenedLocation'),
                        label: this.$t('mailMarketing.report.recentlyOpenedLocation'),
                        key: 'recentlyOpenedLocation',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.report.reasonFailure'),
                        label: this.$t('mailMarketing.report.reasonFailure'),
                        key: 'sendFailReason',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.report.dateDelivery'),
                        label: this.$t('mailMarketing.report.dateDelivery'),
                        key: 'mailSendDate',
                        resizable: false
                    }
                ],
                total: 0, // 列表数据总条数
                currentPageNum: 1, // 当前页码
                pageSize: 20, // 当前页显示条数
                selectList: [],
                allResendVisible: false // 一键全部重发弹窗的显隐状态
            };
        },
        components: { FilterTags },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: (state) => state.window_height
            }),
            tableHeight() {
                return this.window_height - 548;
            },
            selecedContacts() {
                let str = this.$t('mailMarketing.newMarketing.selectedNumber');
                console.log('str.indexOf(\'*\')', str.indexOf('*'));
                console.log(str.replace('*', `<span style="font-weight: bolder;color: rgb(66, 133, 244);">{{${this.selectList.length}}}</span>`));
                str = str.replace('*', `<span style="font-weight: bolder;color: rgb(66, 133, 244);">{{${this.selectList.length}}}</span>`);
                return str;
            }
        },
        mounted() {
        },
        created() {
            this.init();
        },
        methods: {
            handleSelectionChange(val) {
                this.selectList = val.map((item, index) => {
                    return 1 + index;
                });

                /** 设置选中联系人之后的效果，将翻译中的 * 替换成变量，并且变量带有单独的样式 */
                const a = document.querySelector('.service-checked');
                let str = this.$t('mailMarketing.newMarketing.selectedNumber');
                str = str.replace('*', `<span style="font-weight: bolder;color: rgb(66, 133, 244);">${this.selectList.length}</span>`);
                if (this.selectList.length === 0) {
                    a.innerHTML = '';
                } else {
                    a.innerHTML = str;
                }
            },
            // 翻页
            pageChange(num) {
                this.currentPageNum = num;
                this.getListData();
                this.$refs.multipleTable.$el.querySelector('.el-table__body-wrapper').scrollTop = 0;
            },
            /** 改变表格每页展示数据量 */
            pageSizeChange(size) {
                this.pageSize = size;
                /** 改变页码之后调用接口保存改变后的页码，接口还未提供，提供之后直接替换即可 */
                util.ajaxEmailMarketingJson({
                    url: '/crm/userconfig/update',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        key: 'mailBox',
                        value: size.toString()
                    }
                }).then((res) => {
                });
                this.getListData();
            },
            // 初始化有筛选的表头内容
            init() {
                const expandTemp = [
                    'sendStatus'
                ];
                this.tableColumns = this.tableColumns.map((col, index) => {
                    col.show_filter_content = false;
                    col.filtering = false;
                    if (col.key && !expandTemp.includes(col.key)) {
                        col.renderHeader = this.renderHeader_filter(index);
                    }
                    return col;
                });
            },
            /** 表头渲染 */
            renderHeader_filter(colIndex) {
                const column = this.tableColumns[colIndex];
                return (h) => {
                    const sortIcons = h(
                        'span',
                        {
                            class: {
                                'ivu-table-sort': true
                            }
                        },
                        [
                            h('Icon', {
                                class: {
                                    on: this.sort === column.key && this.sortType === 'asc'
                                },
                                props: {
                                    type: 'md-arrow-dropup'
                                }
                            }),
                            h('Icon', {
                                class: {
                                    on: this.sort === column.key && this.sortType === 'desc'
                                },
                                props: {
                                    type: 'md-arrow-dropdown'
                                }
                            })
                        ]
                    );
                    return h(
                        'div',
                        {
                            style: {
                                position: 'relative'
                            }
                        },
                        [
                            h('span', column.title),
                            this.sort === column.key && this.sortType ? sortIcons : undefined,
                            h('FilterBox', {
                                style: {
                                    left: column.key === 'mailContact' ? '80px' : (['sendFailReason', 'recentlyOpenedLocation', 'recentlyOpenedTime'].includes(column.key) ? '100px' : '70px'),
                                    right: 'auto',
                                    top: 0
                                },
                                ref: `tableHeaderFilterBox${colIndex}`,
                                props: Object.assign(
                                    {
                                        showPopper: this.tableColumns[colIndex].show_filter_content,
                                        columnCon: this.tableColumns[colIndex].key,
                                        order_column: column.key,
                                        columnKey: column.key,
                                        order_type: column.key,
                                        filtering: column.filtering
                                    },
                                    this.config_tableFilter[column.key]
                                ),
                                on: {
                                    'update:showPopper': (val) => {
                                        this.tableColumns = this.tableColumns.map((item, index) => {
                                            if (index === colIndex) {
                                                item.show_filter_content = val;
                                            } else if (val) {
                                                item.show_filter_content = false;
                                            }
                                            return item;
                                        });
                                    },
                                    'update:query': (val) => {
                                        if (this.config_tableFilter[column.key]) {
                                            if (['openedCount'].includes(column.key)) {
                                                if (val) {
                                                    this.$set(this.config_tableFilter[column.key], 'query', `${val.$gte}-${val.$lte}`);
                                                }
                                            } else {
                                                this.$set(this.config_tableFilter[column.key], 'query', val);
                                            }
                                        }
                                    },
                                    'update:order_type': (val) => {
                                        this.sortType = val;
                                    },
                                    'update:order_column': (val) => {
                                        this.sort = val;
                                    },
                                    updateList: () => {
                                        this.pageChange(1);
                                    },
                                    closeDepartmentTree: () => {
                                        if (this.$refs.departmentTree && this.$refs.departmentTree.showDropdown) {
                                            this.$refs.departmentTree.$refs.input.blur();
                                            this.$refs.departmentTree.showDropdown = false;
                                        }
                                    }
                                }
                            })
                        ]
                    );
                };
            },
            /** 删掉 sort tag */
            empty_sort() {
                // 清空
                this.sort = '';
                this.sortType = '';
                this.getListData();
            },
            // filterTags 组件内部修改筛选值后触发的方法, 由下方的 updateList 改造而成
            change_filter_tag(key) {
                const temp = this.config_tableFilter[key];
                if (temp) {
                    const column = this.tableColumns.find((item) => item.key === key);
                    if (column) {
                        // 判断是否有值, 调整 sqlList
                        const con = key;
                        if (temp.query.length) {
                            const result = {};
                            switch (temp.filterType) {
                                case 'string':
                                    break;
                                case 'select':
                                    // 表头筛选中只能有单个选项值的(单选型字段 + 创建人这种表格才有的字段)属性, 筛选时使用 $eq 等于, 其他用 $regex 包含
                                    const type = '$regex';
                                    result.$or = temp.query.map((item) => {
                                        const temp = {};
                                        temp[con] = {};
                                        item.value === null
                                            ? (temp[con].$null = -1)
                                            : (temp[con][type] = item.value);
                                        return temp;
                                    });
                                    break;
                                case 'date':
                                    if (temp.query[0] && temp.query[1]) {
                                        result.$and = [];
                                        const start = {};
                                        start[con] = {};
                                        start[con].$gte = temp.query[0];
                                        result.$and.push(start);

                                        const end = {};
                                        end[con] = {};
                                        end[con].$lte = temp.query[1];
                                        result.$and.push(end);
                                    } else {
                                        this.config_tableFilter[key].query = [];
                                    }
                                    break;
                            }
                            this.tableColumns = this.tableColumns.map((item) => {
                                if (item.key === key) {
                                    item.filtering = true;
                                }
                                return item;
                            });
                        } else {
                            this.tableColumns = this.tableColumns.map((item) => {
                                if (item.key === key) {
                                    item.filtering = false;
                                }
                                return item;
                            });
                        }
                        this.getListData();
                    } else {
                        this.remove_filter_tag(key);
                    }
                } else {
                    this.remove_filter_tag(key);
                }
            },
            /** 筛选 tag close tag 时去掉对应的筛选条件并刷新 */
            remove_filter_tag(key) {
                // 清空筛选条件
                const temp = this.config_tableFilter[key];
                if (temp) {
                    switch (temp.filterType) {
                        case 'string':
                        case 'number':
                            temp.query = '';
                            break;
                        case 'select':
                        case 'date':
                            temp.query = [];
                            break;
                    }
                    this.$set(this.config_tableFilter, key, temp);
                }
                // 设置表格 filtering 为 false , 并从表头筛选条件对象中去掉对应筛选项
                const index = this.tableColumns.findIndex((item) => item.key === key);
                if (index !== -1) {
                    const col = this.tableColumns[index];
                    col.filtering = false;
                    this.$set(this.tableColumns, index, col);
                }
                // 刷新
                this.getListData();
            },
            /** 重新发送、 一键全部重发 */
            handleConfirm(type) {
                if (!this.tableList.length) {
                    this.$Message.error('当前查询数据为空，不能操作重新发送');
                    return;
                }
                if (this.reSendLoading) return;
                this.reSendLoading = true;
                // type 0 重新发送  1 一键全部重发
                const data = {
                    actId: this.id,
                    createUserId: this.userId,
                    orgId: this.enterpriseId,
                    repeatType: type, // 重新发送和一键全部重发 类型
                    mailIds: this.selectList, // 选中的id集合
                    sendedType: this.currentTableType === 'service' ? 1 : 2 // 送达、未送达类型
                };
                util.ajaxEmailMarketingJson({
                    url: '/business/marketing/report/reSend',
                    method: 'post',
                    data
                }).then(response => {
                    this.reSendLoading = false;
                    if (response.data.code === 1) {
                        this.getListData();
                        if (type === 1) {
                            this.allResendVisible = false;
                        }
                    } else {
                        this.$Message.error(response.data.msg);
                    }
                }).catch(() => {
                    this.reSendLoading = false;
                    this.$Message.error('请求异常');
                });
            },
            /** 获取送达、未送达的邮件列表数据 */
            getListData() {
                let data = {
                    orgId: this.enterpriseId,
                    actId: this.id,
                    pageNo: this.currentPageNum,
                    pageSize: this.pageSize,
                    type: this.currentTableType === 'service' ? 1 : 2
                };
                const query = this.handleQuerys();
                data = Object.assign(data, query);
                util.ajaxEmailMarketingJson({
                    url: '/business/marketing/report/getReportDetailList',
                    method: 'post',
                    data
                }).then(response => {
                    if (response.data.code === 1) {
                        const result = response.data.data;
                        // 表格数据赋值
                        this.tableList = result.list;
                        this.total = result.totalSize;
                        this.currentPageNum = result.pageNo;
                        this.pageSize = result.pageSize;
                    } else {
                        this.$Message.error(response.data.msg);
                    }
                }).catch(() => {
                    this.$Message.error('请求异常');
                });
            },
            /** 处理筛选条件 */
            handleQuerys() {
                let result = {};
                for (const key in this.config_tableFilter) {
                    if (!this.config_tableFilter.hasOwnProperty(key)) continue;
                    if (this.config_tableFilter[key].query) {
                        let queryValue = [];
                        switch (key) {
                            case 'mailContact':
                                result = Object.assign(result, {
                                    mailContact: this.config_tableFilter[key].query
                                });
                                break;
                            case 'openedCount':
                                queryValue = this.config_tableFilter[key].query.split('-');
                                result = Object.assign(result, {
                                    [`${key}Start`]: queryValue[0],
                                    [`${key}End`]: queryValue[1]
                                });
                                // result = Object.assign(result, {
                                //     openedCount: this.config_tableFilter[key].query,
                                // });
                                break;
                            case 'mailSendDate':
                                result = Object.assign(result, {
                                    mailSendDateStart: this.config_tableFilter[key].query[0]
                                        ? this.dateFormat(
                                            'yyyy-MM-dd',
                                            this.config_tableFilter[key].query[0]
                                        ) : '',
                                    mailSendDateEnd: this.config_tableFilter[key].query[1]
                                        ? this.dateFormat(
                                            'yyyy-MM-dd',
                                            this.config_tableFilter[key].query[1]
                                        ) : ''
                                });
                                break;
                            case 'recentlyOpenedTime':
                                result = Object.assign(result, {
                                    recentlyOpenedTimeStart: this.config_tableFilter[key].query[0]
                                        ? this.dateFormat(
                                            'yyyy-MM-dd',
                                            this.config_tableFilter[key].query[0]
                                        ) : '',
                                    recentlyOpenedTimeEnd: this.config_tableFilter[key].query[1]
                                        ? this.dateFormat(
                                            'yyyy-MM-dd',
                                            this.config_tableFilter[key].query[1]
                                        ) : ''
                                });
                                break;
                            case 'recentlyOpenedLocation':
                                result = Object.assign(result, {
                                    recentlyOpenedLocation: this.config_tableFilter[key].query
                                });
                                break;
                            case 'sendFailReason':
                                result = Object.assign(result, {
                                    sendFailReason: this.config_tableFilter[key].query
                                });
                                break;
                            default:
                                break;
                        }
                    }
                }
                switch (this.sort) {
                    case 'mailContact':
                        Object.assign(result, {
                            orderColumn: 'mailContact',
                            orderType: this.sortType
                        });
                        break;
                    case 'openedCount':
                        Object.assign(result, {
                            orderColumn: 'openedCount',
                            orderType: this.sortType
                        });
                        break;
                    case 'mailSendDate':
                        Object.assign(result, {
                            orderColumn: 'mailSendDate',
                            orderType: this.sortType
                        });
                        break;
                    case 'recentlyOpenedTime':
                        Object.assign(result, {
                            orderColumn: 'recentlyOpenedTime',
                            orderType: this.sortType
                        });
                        break;
                    case 'recentlyOpenedLocation':
                        Object.assign(result, {
                            orderColumn: 'recentlyOpenedTime',
                            orderType: this.sortType
                        });
                        break;
                    case 'sendFailReason':
                        Object.assign(result, {
                            orderColumn: 'sendFailReason',
                            orderType: this.sortType
                        });
                        break;
                    default:
                        break;
                }
                return result;
            },
            /** 日期格式化 */
            dateFormat(fmt, timeStramp) {
                const date = new Date(timeStramp);
                const o = {
                    'M+': date.getMonth() + 1, // 月份
                    'd+': date.getDate(), // 日
                    'h+': date.getHours(), // 小时
                    'm+': date.getMinutes(), // 分
                    's+': date.getSeconds(), // 秒
                    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
                    S: date.getMilliseconds() // 毫秒
                };
                if (/(y+)/.test(fmt)) {
                    fmt = fmt.replace(
                        RegExp.$1,
                        `${date.getFullYear()}`.substr(4 - RegExp.$1.length)
                    );
                }
                for (const k in o) {
                    if (new RegExp(`(${k})`).test(fmt)) {
                        fmt = fmt.replace(
                            RegExp.$1,
                            RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length)
                        );
                    }
                }
                return fmt;
            }
        },
        watch: {
            currentTableType: {
                handler(val) {
                    if (val) {
                        // 切换送达/未送达 tab 清空选中列表和多选框勾选状态
                        this.selectList = [];
                        this.$refs.multipleTable && this.$refs.multipleTable.clearSelection();
                        // 清空筛选条件
                        for (const item in this.config_tableFilter) {
                            this.config_tableFilter[item].query = '';
                        }
                        // 切换送达/未送达 tab 需要刷新列表数据
                        this.getListData();
                    }
                },
                deep: true,
                immediate: true
            }
        },
        filters: {
            sendStatusFilter(val) {
                switch (val) {
                    case -1:
                        return '未发送';
                    case 0:
                        return '失败';
                    case 1:
                        return '成功';
                    case 2:
                        return '发送中';
                }
            }
        }
    };
</script>
<style lang="less">
    @import url("service.less");
</style>
