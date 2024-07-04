<template>
    <div class="marketing-activities">
        <!-- 营销活动头部操作 --- 筛选、新建-->
        <div class="marketing-header">
            <div>
                <!-- 我的营销活动 or 全部营销活动 -->
                <Dropdown trigger="click" @command="changeMyOrAll" style="line-height: 40px;">
                    <h1 class="switch-title">
                        {{marketing_title}}
                        <Icon custom="custom custom-menu-arrow" color="#7B98B6" size="10"></Icon>
                    </h1>
                    <DropdownMenu slot="dropdown">
                        <DropdownItem command="1">{{$t('mailMarketing.newMarketing.myMarketing')}}
                        </DropdownItem>
                        <DropdownItem command="2">{{$t('mailMarketing.newMarketing.allMarketing')}}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <!-- 筛选之后的标签显示 -->
                <FilterTags
                        style="top: 2px; left: 8px"
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
            <Button type="primary" @click.stop="newMarketing(-1)">{{$t('mailMarketing.new')}}</Button>
        </div>
        <!-- 营销活动列表 -->
        <div>
            <Table :data="tableList" :height="tableHeight" ref="multipleTable" :loading="tableLoading">
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
                >
                    <template slot-scope="{row}">
                        <!-- 状态 已发送、草稿、待发送、发送中 -->
                        <template v-if="item.key === 'actStatus'">
                            <span>{{row.actStatus | actStatusFilter(that)}}</span>
                        </template>
                        <template v-else-if="item.key === 'sendCount'">
                            <span>{{row.actStatus === 0 ? (row.sendCount ? row.sendCount : '-') : row.sendCount}}</span>
                        </template>
                        <template v-else-if="item.key === 'sendedCount'">
                            <span style="margin-right: 10px;">{{row.actStatus === 4 ? row.sendedCount : (row.sendedCount ? row.sendedCount : '-')}}</span>
                            <span>{{row.actStatus === 4 ? row.sendedRate + '%' : (row.sendedCount ? row.sendedRate + '%' : '-')}}</span>
                        </template>
                        <template v-else-if="item.key === 'openedCount'">
                            <span style="margin-right: 10px;">{{row.actStatus === 4 ? (row.openedCount ? row.openedCount : '0') : '-'}}</span>
                            <span>{{row.actStatus === 4 ? row.openedRate + '%' : '-'}}</span>
                        </template>
                        <template v-else-if="item.key === 'createTime'">
                            <span>{{new Date(row.createTime).format('yyyy-MM-dd hh:mm:ss')}}</span>
                        </template>
                        <template v-else>
                            <span>{{row[item.key]}}</span>
                        </template>
                    </template>
                </TableColumn>
                <TableColumn :label="$t('mailMarketing.newMarketing.operate')">
                    <template slot-scope="{row}">
                        <!-- 状态为：草稿箱、待发送 显示编辑入口，已发送、发送中显示【查看】和【报告】 -->

                        <Button style="color:#3B78DE;" type="text" @click.stop="newMarketing(row.id)" v-if="row.actStatus === 0">{{$t('mailMarketing.edit')}}</Button>
                        <Button style="color:#3B78DE;" type="text" @click.stop="handleRreview(row.id)" v-if="row.actStatus !== 0">{{$t('mailMarketing.lookOver')}}</Button>
                        <Button style="color:#3B78DE;" type="text" @click.stop="marketingReport(row.id)" v-if="row.actStatus !== 0">{{$t('mailMarketing.reportBtn')}}</Button>
                        <Button style="color:#3B78DE;" v-if="showBtns.delBtn" type="text" @click.stop="handleDel(row)">{{$t('mailMarketing.delete')}}</Button>
                    </template>
                </TableColumn>
            </Table>

            <footer>
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
            </footer>

        </div>
        <!-- 点击查看预览营销活动详情 -->
        <mailDetail v-if="previewVisible" :visible.sync="previewVisible" :actMailId="actMailId"></mailDetail>

        <!-- 删除营销活动 -->
        <dialogModal :title="$t('mailMarketing.newMarketing.deleteActivity')"
                     :content="$t('mailMarketing.newMarketing.confirmDelete')"
                     :visible.sync="confirmDelVisible"
                     @confirm="handleConfirm"></dialogModal>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import FilterTags from '@/views/main-components/filter-tags';
    import mailDetail from './mailDetail.vue';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    export default {
        name: 'tableList',
        props: [],
        components: { FilterTags, mailDetail },
        data() {
            return {
                that: this,
                type: this.$store.state.mail.marketingTitle,
                total: 0, // 列表数据总条数
                currentPageNum: this.$store.state.mail.edmCurrentPage, // 当前页码
                pageSize: 20, // 当前页显示条数
                tableLoading: true, // 表格loading
                actMailId: '', // 点击查看获取到的当前的营销邮件id
                tableList: [], // 列表数据
                previewVisible: false, // 控制查看的弹窗状态
                confirmDelVisible: false, // 控制删除的弹窗状态
                confirmDelRowData: null, // 删除的行数据
                show_filter_content: false,
                config_tableFilter: {
                    actName: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型,              string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: null
                    },
                    actStatus: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型,              string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: [
                            { value: 4, label: this.$t('mailMarketing.newMarketing.beingSent') },
                            { value: 0, label: this.$t('mailMarketing.newMarketing.draft') },
                            { value: 1, label: this.$t('mailMarketing.newMarketing.sending') }
                        ]
                    },
                    createUser: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型,              string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: []
                    },
                    createTime: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'date', // 筛选类型,              string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: null
                    }
                }, // 表头筛选条件初始化
                createUsers: [], // 创建人的筛选列表
                sortType: 'desc', // 排序方式
                sort: '',
                filterComponentWidth: 220, // 筛选组件的宽度
                lang_mail: {
                    actName: this.$t('mailMarketing.newMarketing.activityName'),
                    actStatus: this.$t('mailMarketing.newMarketing.status'),
                    createUser: this.$t('mailMarketing.newMarketing.creator'),
                    createTime: this.$t('mailMarketing.newMarketing.updateTime')
                },
                tableColumns: [
                    {
                        title: this.$t('mailMarketing.newMarketing.activityName'),
                        label: this.$t('mailMarketing.newMarketing.activityName'),
                        key: 'actName',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.newMarketing.status'),
                        label: this.$t('mailMarketing.newMarketing.status'),
                        key: 'actStatus',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.newMarketing.send'),
                        label: this.$t('mailMarketing.newMarketing.send'),
                        key: 'sendCount',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.newMarketing.delivered'),
                        label: this.$t('mailMarketing.newMarketing.delivered'),
                        key: 'sendedCount',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.newMarketing.open'),
                        label: this.$t('mailMarketing.newMarketing.open'),
                        key: 'openedCount',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.newMarketing.creator'),
                        label: this.$t('mailMarketing.newMarketing.creator'),
                        key: 'createUser',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.newMarketing.updateTime'),
                        label: this.$t('mailMarketing.newMarketing.updateTime'),
                        key: 'createTime',
                        resizable: false
                    }
                ]
            };
        },
        filters: {
            actStatusFilter(val, that) {
                if (val === 4) {
                    return that.$t('mailMarketing.newMarketing.beingSent');
                } else if (val === 0) {
                    return that.$t('mailMarketing.newMarketing.draft');
                } else if (val === 1) {
                    return that.$t('mailMarketing.newMarketing.sending');
                }
            }
        },
        computed: {
            ...mapState({
                orgId: (state) => state.enterpriseId,
                userId: (state) => state.userId,
                fullName: (state) => state.fullName,
                userName: (state) => state.userName,
                edmCurrentPage: (state) => state.mail.edmCurrentPage,
                window_height: (state) => state.window_height,
                button_list: state => state.app.button_list
            }),
            tableHeight() {
                return this.window_height - 169;
            },
            showBtns() {
                const ids = BUTTON_IDS.emailMarketing.activity;
                return {
                    delBtn: !HANDLE_BUTTON(ids.del, this.button_list)
                };
            },
            marketing_title() {
                switch (this.type) {
                    case 1:
                        return this.$t('mailMarketing.newMarketing.myMarketing');
                        break;
                    case 2:
                        return this.$t('mailMarketing.newMarketing.allMarketing');
                        break;
                }
            }
        },
        created() {
            // 返回列表回填筛选条件
            if (Object.keys(this.$store.state.mail.edm_config_tableFilter).length > 0) {
                this.config_tableFilter = {
                    ...this.$store.state.mail.edm_config_tableFilter
                };
                this.sort = this.$store.state.mail.edm_sort;
                this.sortType = this.$store.state.mail.edm_sortType;
            }
            this.init();
            this.getListData();
            // 赋值之前请求营销活动名称筛选数据
            this.getCreatedUser();
        },
        mounted() {
        },
        methods: {
            // 切换我的营销活动或全部营销活动
            changeMyOrAll(command) {
                this.type = Number(command);
                // 切换我的、全部 刷新列表
                this.$store.commit('setEdmCurrentPage', 1);
                this.$store.commit('setMarketingTitle', this.type);
                this.currentPageNum = 1;
                this.getListData();
            },
            // 新建营销活动
            newMarketing(id) {
                this.$emit('handleView', 'newMarketing', id);
            },
            // 点击报告
            marketingReport(id) {
                this.$emit('handleView', 'marketingReport', id);
            },
            // 翻页
            pageChange(num) {
                this.$store.commit('setEdmCurrentPage', num);
                this.currentPageNum = num;
                this.getListData();
                this.$refs.multipleTable.$el.querySelector('.el-table__body-wrapper').scrollTop = 0;
            },
            /** 改变表格每页展示数据量 */
            pageSizeChange(size) {
                this.pageSize = size;
                /** 改变页码之后调用接口保存改变后的页码，接口还未提供，提供之后直接替换即可 */
                //            util.ajaxEmailMarketingJson({
                //                url: "/crm/userconfig/update",
                //                method: "POST",
                //                data: {
                //                    orgId: this.orgId,
                //                    userId: this.userId,
                //                    key: "mailBox",
                //                    value: size.toString(),
                //                },
                //            }).then((res) => {
                //            });
                this.getListData();
            },
            // 点击查看营销活动
            handleRreview(id) {
                this.previewVisible = true;
                this.actMailId = id;
            },
            // 点击删除营销活动
            handleDel(rowData) {
                this.confirmDelVisible = true;
                this.confirmDelRowData = rowData;
            },
            // 确认删除营销活动
            handleConfirm() {
                util.ajaxEmailMarketing({
                    url: '/business/marketing/activity/delete',
                    method: 'post',
                    data: {
                        id: this.confirmDelRowData.id,
                        userId: this.userId
                    }
                }).then(response => {
                    if (response.data.code === 1) {
                        this.confirmDelVisible = false;
                        if (this.tableList.length === 1) {
                            this.$store.commit('setEdmCurrentPage', this.currentPageNum - 1);
                        }
                        this.getListData();
                    } else {
                        this.$Message.error(response.data.msg);
                    }
                }).catch(() => {
                    this.$Message.error('请求异常');
                });
            },
            // 初始化表头的筛选项
            init() {
                const expandTemp = [
                    'sendCount',
                    'sendedCount',
                    'openedCount'
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
                                    left: column.key === 'actName' || column.key === 'createTime' ? '90px' : '50px',
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
                                            this.$set(
                                                this.config_tableFilter[column.key],
                                                'query',
                                                val
                                            );
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
            /** 删掉 sort tag */
            empty_sort() {
                // 清空
                this.sort = '';
                this.sortType = '';
                this.$store.commit('setEdmCurrentPage', 1);
                this.currentPageNum = 1;
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
                        this.$store.commit('setEdmCurrentPage', 1);
                        this.currentPageNum = 1;
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
                            temp.query = '';
                            break;
                        case 'select':
                        case 'date':
                            temp.query = [];
                            break;
                    }
                    this.$set(this.config_tableFilter, key, temp);
                }
                /* 针对邮件状态筛选做处理，当移除该筛选项时，当前选中的邮件状态值清空 */
                if (key === 'mailStatusFilter') {
                    this.currentSelectMailStatus = '';
                }

                // 设置表格 filtering 为 false , 并从表头筛选条件对象中去掉对应筛选项
                const index = this.tableColumns.findIndex((item) => item.key === key);
                if (index !== -1) {
                    const col = this.tableColumns[index];
                    col.filtering = false;
                    this.$set(this.tableColumns, index, col);
                }
                // 刷新
                this.$store.commit('setEdmCurrentPage', 1);
                this.currentPageNum = 1;
                this.getListData();
            },
            /** 获取并处理邮箱列表数据 */
            getListData() {
                let data = {
                    orgId: this.orgId,
                    userId: this.userId,
                    pageNo: this.currentPageNum,
                    pageSize: this.pageSize,
                    selfOrAll: this.type
                };
                const query = this.handleQuerys();
                data = Object.assign(data, query);
                util.ajaxEmailMarketingJson({
                    url: '/business/marketing/activity/findListByPage',
                    method: 'post',
                    data
                }).then(response => {
                    this.tableLoading = false;
                    if (response.data.code === 1) {
                        // 表格数据赋值
                        this.tableList = response.data.data.list;
                        this.currentPageNum = this.$store.state.mail.edmCurrentPage;
                        this.total = response.data.data.totalSize;
                        if (!response.data.data.list.length && this.currentPageNum > 1) {
                            this.getListData();
                        }
                    } else {
                        this.$Message.error(response.data.msg);
                    }
                }).catch(() => {
                    this.tableLoading = false;
                    this.$Message.error('请求异常');
                });
            },
            /** 处理筛选条件 */
            handleQuerys() {
                let result = {};
                for (const key in this.config_tableFilter) {
                    if (!this.config_tableFilter.hasOwnProperty(key)) continue;
                    if (this.config_tableFilter[key].query) {
                        const queryValue = [];
                        switch (key) {
                            case 'actName':
                                result = Object.assign(result, {
                                    actName: this.config_tableFilter[key].query
                                });
                                break;
                            case 'actStatus':
                                result = Object.assign(result, {
                                    actStatusStr: this.config_tableFilter[key].query.map((item) => {
                                        return item.value;
                                    }).join(',')
                                });
                                break;
                            case 'createUser':
                                result = Object.assign(result, {
                                    createUserIDs: this.config_tableFilter[key].query.map((item) => {
                                        return item.value;
                                    }).join(',')
                                });
                                break;
                            case 'createTime':
                                result = Object.assign(result, {
                                    startTime: this.config_tableFilter[key].query[0]
                                        ? this.dateFormat(
                                            'yyyy-MM-dd',
                                            this.config_tableFilter[key].query[0]
                                        ) : '',
                                    endTime: this.config_tableFilter[key].query[1]
                                        ? this.dateFormat(
                                            'yyyy-MM-dd',
                                            this.config_tableFilter[key].query[1]
                                        ) : ''
                                });
                                break;
                        }
                    }
                }
                switch (this.sort) {
                    case 'actName':
                        Object.assign(result, {
                            orderColumn: 'act_name',
                            orderType: this.sortType
                        });
                        break;
                    case 'actStatus':
                        Object.assign(result, {
                            orderColumn: 'act_status',
                            orderType: this.sortType
                        });
                        break;
                    case 'createUser':
                        Object.assign(result, {
                            orderColumn: 'create_user',
                            orderType: this.sortType
                        });
                        break;
                    case 'createTime':
                        Object.assign(result, {
                            orderColumn: 'create_time',
                            orderType: this.sortType
                        });
                        break;
                    default:
                        break;
                }
                return result;
            },
            getCreatedUser() {
                util.ajaxJson({
                    url: '/new-privilege/user/getCrmUserByleaderUserId',
                    method: 'get',
                    params: {
                        orgId: this.orgId,
                        userId: this.userId
                    }
                }).then(({ data }) => {
                    if (data.code === '1') {
                        delete this.config_tableFilter.createUser.allList;
                        this.$set(this.config_tableFilter.createUser, 'allList', data.data.map(item => {
                            return { label: item.fullname, value: item.id };
                        }));
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                    }
                });
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
        watch: {},
        beforeDestroy() {
            this.$store.commit('set_mail_edm_config', { ...this.config_tableFilter });
            this.$store.commit('set_mail_edm_sort', this.sort);
            this.$store.commit('set_mail_edm_sortType', this.sortType);
        }
    };
</script>
<style lang="less">
    @import url('tableList.less');
</style>
<style lang="less" scoped>

</style>
