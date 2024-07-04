<template>
  <div class="marketing-activities">
    <!-- 邮箱列表 -->
    <div class="email-header">
      <h1 class="subject">
        <Tooltip placement="top" transfer :content="$t('back')">
          <Icon
            custom="custom custom-back"
            style="color: rgba(0, 0, 0, 0.6); margin-right: 20px;cursor: pointer;"
            @click="pageReturn"
          />
        </Tooltip>
        <span>{{ query.addrName }}</span>
      </h1>
    </div>
    <!-- 筛选之后的标签显示 -->
    <div class="handle-action-bar">
        <FilterTags
            style="top: 2px; left: 8px; height:34px"
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
        <div class="handle-btns">
            <Tooltip placement="top" transfer :content="$t('mailMarketing.emailAddress.revalidatePop')">
                <Button type="text"
                    :loading="revalidateLoading"
                    icon="custom custom-refresh"
                    class="piwik_revalidate_mail"
                    @click="revalidateMail">{{$t("mailMarketing.emailAddress.revalidate")}}</Button>
            </Tooltip>
            <Button type="text"
                icon="custom custom-file-download"
                style="margin-left:15px"
                @click="exportData">{{$t("crm.Table.exportData")}}</Button>
        </div>
    </div>
      <Table :data="tableList" :height="tableHeight" v-loading="tableLoading">
        <TableColumn
            v-for="(item, index) in tableColumns"
            :width="item.width"
            :min-width="item.minWidth || 64"
            :key="index"
            :prop="item.key"
            :label="item.label"
            :render-header="item.renderHeader"
            :show-overflow-tooltip="true"
        >
          <template slot-scope="props">
            <template v-if="item.key == 'updateTime'">
              <span>{{!props.row[item.key] ? "-" : props.row[item.key] | timeFormat("DateTime")}}</span>
            </template>
            <template v-else-if="item.key === 'checkResult'">
                {{checkResultFilter(props.row[item.key])}}
            </template>
            <template v-else>{{!props.row[item.key] ? "-" : props.row[item.key]}}</template>
          </template>
        </TableColumn>
        <TableColumn label="操作">
          <template slot-scope="props">
            <template v-if="props.row.createType !== 2">
              <Button
                class="mail-preview"
                type="text"
                @click.stop="edit(props.row)"
                >{{ $t("mailMarketing.emailAddress.btns.edit") }}</Button
              >
              <Button
                class="mail-preview"
                type="text"
                @click.stop="del(props.row)"
                >{{ $t("mailMarketing.emailAddress.btns.delete") }}</Button
              >
            </template>
            <template v-else>
              <span>-</span>
            </template>
          </template>
        </TableColumn>
        <div slot="empty">{{ tableList != null ? "暂无数据" : "" }}</div>
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

      <Modal
        :visible.sync="deleteModal"
        append-to-body
        width="520px"
        title="提示"
        :modal-append-to-body="false"
        :close-on-click-modal="false"
      >
        <div v-if="deleteModal">
          <span>{{$t("mailMarketing.emailAddress.delPrompt")}}【{{ delRow.mailNo }}】？</span>
        </div>
        <div slot="footer">
          <Button @click="deleteModal = false">{{
            $t("mailMarketing.emailAddress.btns.cancel")
          }}</Button>
          <Button
            @click="deleteConfirm"
            :loading="deleteLoading"
            type="primary"
            >{{ $t("mailMarketing.emailAddress.btns.confirm") }}</Button
          >
        </div>
      </Modal>
      <!-- 编辑邮箱 -->
      <Modal
        :visible="show_import_data"
        :title="$t('mailMarketing.emailAddress.edit')"
        width="650px"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :modal-append-to-body="false"
        class="modal"
      >
        <Form
          :model="update_form"
          :rules="update_form_rule"
          label-width="90px"
          ref="update_form"
          v-if="show_import_data"
          style="margin-top: 20px; width: 500px"
        >
          <FormItem :label="$t('mailMarketing.emailAddress.email')" prop="mailNo">
            <Input v-model="update_form.mailNo" placeholder="请输入"></Input>
          </FormItem>
          <FormItem :label="$t('mailMarketing.emailAddress.name')" prop="username">
            <Input
              v-model="update_form.username"
              maxlength="50"
              placeholder="请输入"
            ></Input>
          </FormItem>
          <FormItem :label="$t('mailMarketing.emailAddress.phone')" prop="phone">
            <Input
              v-model="update_form.phone"
              maxlength="50"
              placeholder="请输入"
            ></Input>
          </FormItem>
        </Form>

        <div slot="footer">
          <Button @click="cancle">{{ $t('mailMarketing.emailAddress.btns.cancel') }}</Button>
          <Button
            type="primary"
            @click="ok"
            :disabled="okBtnLoading"
            v-loading="okBtnLoading"
            >{{ $t('mailMarketing.emailAddress.btns.confirm') }}
          </Button>
        </div>
      </Modal>
      <!-- <xhlDialog
      :deleteModal.sync="deleteModal"
      text="确定删除地址簿"
      ></xhlDialog> -->
  </div>
</template>
<script>
    import { mapState } from 'vuex';
    import FilterTags from '@/views/main-components/filter-tags';
    import Utils from '@/utils';
    import { mixinsRequest } from './mixinsRequest';
    // import { findBookDetailListByPageRequest } from "@/api/reusableApi/email-marketing"
    export default {
        mixins: [mixinsRequest], // 混入了findBookDetailListByPageRequest这个查询数据的接口调用方法
        props: ['query'],
        data() {
            return {
                emailTitle: '',
                type: 1,
                total: 0, // 列表数据总条数
                currentPageNum: 1, // 当前页码
                pageSize: 20, // 当前页显示条数
                deleteModal: false,
                deleteLoading: false,
                tableLoading: false,
                show_import_data: false,
                revalidateLoading: false,
                tableList: null,
                show_filter_content: false,
                config_tableFilter: {
                    mailNo: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型,              string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: null
                    },
                    checkResult: {
                        sort: true, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'select', // 筛选类型,              string / date / select / countryArea
                        query: [], // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: [
                            { value: 'valid', label: this.$t('mailMarketing.emailAddress.verifyStatus1') },
                            { value: 'invalid', label: this.$t('mailMarketing.emailAddress.verifyStatus2') },
                            { value: 'notverified', label: this.$t('mailMarketing.emailAddress.verifyStatus3') },
                            { value: 'catch-all', label: this.$t('mailMarketing.emailAddress.verifyStatus4') },
                            { value: 'dea', label: this.$t('mailMarketing.emailAddress.verifyStatus5') },
                            { value: 'format_err', label: this.$t('mailMarketing.emailAddress.verifyStatus6') }
                        ]
                    }
                },
                sortType: '', // 排序方式
                sort: '',
                filterComponentWidth: 220, // 筛选组件的宽度
                lang_mail: {
                    mailNo: this.$t('mailMarketing.emailAddress.email'),
                    checkResult: this.$t('mailMarketing.emailAddress.verifyStatus'),
                    username: this.$t('mailMarketing.emailAddress.userName'),
                    phone: this.$t('mailMarketing.emailAddress.phone'),
                    updateTime: this.$t('mailMarketing.emailAddress.lastUpdateTime')
                },
                // 无下拉的列表项
                expandTemp: ['username', 'phone', 'updateTime'],
                tableColumns: [
                    {
                        title: this.$t('mailMarketing.emailAddress.email'),
                        label: this.$t('mailMarketing.emailAddress.email'),
                        key: 'mailNo',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.emailAddress.verifyStatus'),
                        label: this.$t('mailMarketing.emailAddress.verifyStatus'),
                        key: 'checkResult',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.emailAddress.userName'),
                        label: this.$t('mailMarketing.emailAddress.userName'),
                        key: 'username',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.emailAddress.phone'),
                        label: this.$t('mailMarketing.emailAddress.phone'),
                        key: 'phone',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.emailAddress.lastUpdateTime'),
                        label: this.$t('mailMarketing.emailAddress.lastUpdateTime'),
                        key: 'updateTime',
                        resizable: false
                    }
                ],
                tableData: [],
                update_form: {
                    pId: '',
                    mailNo: '',
                    username: '',
                    phone: ''
                },
                update_form_rule: {
                    mailNo: [
                        {
                            required: true,
                            message: this.$t('mailMarketing.emailAddress.inputEmail'),
                            trigger: 'blur'
                        },
                        {
                            pattern: Utils.regExp.fullEmail,
                            message: this.$t('mailMarketing.emailAddress.formatError'),
                            trigger: 'blur'
                        }
                    ]
                },
                delRow: {},
                okBtnLoading: false
            };
        },
        components: { FilterTags },
        computed: {
            ...mapState({
                orgId: (state) => state.enterpriseId,
                userId: (state) => state.userId,
                fullName: (state) => state.fullName,
                userName: (state) => state.userName,
                window_height: (state) => state.window_height
            }),
            tableHeight() {
                return this.window_height - 180;
            }
        },
        created() {
            this.init();
        },
        mounted() {
            // this.getData();
        },
        methods: {
            refreshData() {
                this.config_tableFilter.mailNo.query = '';
                this.config_tableFilter.checkResult.query = [];
                this.currentPageNum = 1;
                this.getData();
            },
            getData() {
                this.tableLoading = true;
                const data = this.query;
                const params = this.handleQuerys();
                params.pageSize = this.pageSize;
                params.pageNo = this.currentPageNum;
                this.tableList = [];
                // this.total = 0;
                this.findBookDetailListByPageRequest(Object.assign({}, data, params), (response) => {
                    this.tableLoading = false;
                    if (response.data) {
                        this.tableList = response.data.list || [];
                        this.total = response.data.totalSize;
                    }
                }, error => {
                    this.tableLoading = false;
                });
            },
            handleQuerys() {
                let result = {};
                for (const key in this.config_tableFilter) {
                    if (this.config_tableFilter[key].query && this.config_tableFilter[key].query.length) {
                        switch (key) {
                            case 'mailNo':
                                result = Object.assign(result, {
                                    [key]: this.config_tableFilter[key].query
                                });
                                break;
                            case 'checkResult':
                                result = Object.assign(result, {
                                    [key]: this.config_tableFilter[key].query.map((item) => {
                                        return item.value;
                                    }).join(',')
                                });
                                break;
                        }
                    }
                }
                switch (this.sort) {
                    case 'checkResult':
                        Object.assign(result, {
                            orderColumn: 'check_result',
                            orderType: this.sortType
                        });
                        break;
                    default:
                        break;
                }
                return result;
            },
            pageReturn() {
                this.$emit('handleView', {
                    com: 'addressList'
                });
            },
            cancle() {
                this.show_import_data = false;
            },
            edit(row) {
                this.update_form = this.$deepClone(row);
                this.show_import_data = true;
            },
            ok() {
                this.okBtnLoading = true;
                this.$refs.update_form.validate((valid) => {
                    if (valid) {
                        this.$util
                            .ajaxEmailMarketingJson({
                                url: '/business/address/book/detail/update',
                                method: 'POST',
                                data: { ...this.update_form }
                            })
                            .then((res) => {
                                this.okBtnLoading = false;
                                if (res.data.code === 1) {
                                    this.update_form = {};
                                    this.show_import_data = false;
                                    this.getData();
                                }
                            })
                            .catch((res) => {
                                this.okBtnLoading = false;
                            });
                    } else {
                        this.okBtnLoading = false;
                    }
                });
            },
            del(row) {
                this.deleteModal = true;
                this.delRow = row;
            },
            deleteConfirm() {
                this.deleteAddressBook({
                    parentId: this.delRow.pid,
                    id: this.delRow.id
                }).then((res) => {
                    if (res.code === 1) {
                        if (this.tableList.length === 1) {
                            this.currentPageNum = this.currentPageNum - 1;
                        }
                        this.deleteModal = false;
                        this.getData();
                    } else {
                        this.$Message.error(res.data.msg);
                    }
                }).catch((res) => {});
            },
            init() {
                const expandTemp = this.expandTemp;
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
                                    left:
                                        column.key === 'name'
                                            ? '90px'
                                            : column.key === 'creationTime'
                                                ? '70px'
                                                : 'auto',
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
                                        if (
                                            this.$refs.departmentTree &&
                                            this.$refs.departmentTree.showDropdown
                                        ) {
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
            // 翻页
            pageChange(num) {
                this.currentPageNum = num;
                this.getData();
            },
            /** 改变表格每页展示数据量 */
            pageSizeChange(size) {
                this.pageSize = size;
                this.currentPageNum = 1;
                this.getData();
            },
            /** 删掉 sort tag */
            empty_sort() {
                // 清空
                this.sort = '';
                this.sortType = '';
                this.currentPageNum = 1;
                this.getData();
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

                // 设置表格 filtering 为 false , 并从表头筛选条件对象中去掉对应筛选项
                const index = this.tableColumns.findIndex((item) => item.key === key);
                if (index !== -1) {
                    const col = this.tableColumns[index];
                    col.filtering = false;
                    this.$set(this.tableColumns, index, col);
                }
                // 刷新
                this.currentPageNum = 1;
                this.getData();
            },
            checkResultFilter(val) {
                if (!val) return '-';
                const checkResult = this.config_tableFilter.checkResult.allList.filter(item => item.value === val);
                if (checkResult.length) {
                    return checkResult[0].label;
                } else {
                    return '-';
                }
            },
            // 重新验证
            revalidateMail() {
                this.revalidateLoading = true;
                this.reValid({
                    id: this.query.parentId,
                    orgId: this.orgId,
                    userId: this.userId
                }).then(res => {
                    if (res.code === 1) {
                        this.getData();
                        this.$Message({
                            type: 'success',
                            message: res.msg,
                            showClose: true
                        });
                    } else {
                        this.$Message({
                            type: 'warning',
                            message: res.msg,
                            showClose: true
                        });
                    }
                    this.revalidateLoading = false;
                }, error => {
                    console.log(error);
                    this.revalidateLoading = false;
                });
            },
            // 文件下载
            exportData() {
                const data = this.query;
                const params = this.handleQuerys();
                const obj = Object.assign({}, data, params);
                const urlParams = Object.keys(obj).map(item => {
                    return `${item}=${encodeURIComponent(obj[item])}`;
                });
                window.open(`${this.$util.EmailMarketingUrl}/business/address/book/detail/bookDetailDownload?${urlParams.join('&')}`, '_blank');
            }
        },
        watch: {}
    };
</script>
<style lang="less" scoped>
    @import url("./index.less");
    .mail-preview {
        color: #3b78de;
    }
    /deep/ .el-loading-spinner {
        margin-top: -12px;
        .circular {
            width: 21px;
            height: 21px;
        }
    }
    .list-title {
        margin-left: 10px;
    }
    .email-header {
        .subject {
            display: flex;
            align-items: center;
            font-size: 16px;
            color: #2d2f2e;
            font-weight: 500;
        }
    }
    .handle-action-bar {
        width: 100%;
        line-height: 34px;
        overflow: hidden;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .handle-btns {
        .el-button--text {
            color: #6C7E97;
            &:hover{
                color: #4285F4;
                /deep/.custom {
                    color: #4285F4;
                }
            }
        }
    }
</style>

