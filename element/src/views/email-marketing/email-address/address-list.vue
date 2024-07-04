<template>
  <div class="marketing-activities">
    <!-- 营销活动头部操作 --- 筛选、新建-->
    <div class="marketing-header">
      <div>
        <!-- 我的营销活动 or 全部营销活动 -->
        <Dropdown
          trigger="click"
          @command="changeMyOrAll"
          style="line-height: 40px; margin-bottom: 8px; margin-left: 8px"
        >
          <h1 class="switch-title">
            {{ marketing_title }}
            <Icon
              custom="custom custom-menu-arrow"
              color="#7B98B6"
              size="10"
            ></Icon>
          </h1>
          <DropdownMenu slot="dropdown">
            <DropdownItem command="1">{{ $t('mailMarketing.emailAddress.allAddressBook') }} </DropdownItem>
            <DropdownItem command="0">{{ $t('mailMarketing.emailAddress.myAddressBook') }} </DropdownItem>
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
          @emptySort="empty_sort"
          @removeCon="remove_filter_tag"
        ></FilterTags>
      </div>
      <div v-if="showBtns.newBtn">
        <Button type="primary" @click.stop="newAddress">{{
          $t("mailMarketing.emailAddress.btns.new")
        }}</Button>
      </div>
    </div>
    <!-- 我的地址列表 -->
    <div>
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
          :resizable="item.resizable !== false"
        >
        <template slot-scope="props">
          <div v-if="item.key == 'createType'">
            <span v-if="props.row[item.key] === 1">{{props.row[item.key] === '' || props.row[item.key] === null ? '—' :  $t("mailMarketing.emailAddress.templateImport")}}</span>
            <span v-if="props.row[item.key] === 0">{{props.row[item.key] === '' || props.row[item.key] === null ? '—' :  $t("mailMarketing.emailAddress.addManully")}}</span>
          </div>
          <div v-else-if="item.key == 'updateTime'">
            <span>{{props.row[item.key] === '' || props.row[item.key] === null ? '—' : props.row[item.key]|timeFormat("DateTime")}}</span>
          </div>
          <span v-else>{{props.row[item.key] === '' || props.row[item.key] === null ? '—' :  props.row[item.key]}}</span>
        </template>
        </TableColumn>
        <TableColumn :label="$t('mailMarketing.emailAddress.operate')">
          <template slot-scope="props">
            <!-- 发信 -->
            <Button type="text" class="mail-preview" @click.stop="sendEmail(props.row)">{{
              $t("mailMarketing.emailAddress.btns.send")
            }}</Button>
            <!-- 查看 -->
            <Button
              class="mail-preview"
              type="text"
              @click.stop="checkAddress(props.row)"
              >{{ $t("mailMarketing.emailAddress.btns.lookOver") }}</Button
            >
            <Dropdown
              trigger="click"
              @command="changeBtn($event, props.row)"
              v-if="showBtns.editBtn || showBtns.exportData || showBtns.delBtn"
            >
              <h1 class="switch-title">
                <Icon
                  custom="custom custom-address-more"
                  color="#3B78DE"
                  size="10"
                ></Icon>
              </h1>
              <DropdownMenu slot="dropdown">
                <!-- 编辑 -->
                <DropdownItem command="1"
                  ><Button
                    class="mail-preview"
                    type="text"
                    v-if="showBtns.editBtn"
                    >{{ $t("mailMarketing.emailAddress.btns.edit") }}</Button
                  ></DropdownItem
                >
                <!-- 导出 -->
                <DropdownItem command="2">
                  <Button
                    class="mail-preview"
                    type="text"
                    v-if="showBtns.exportBtn"
                    >{{ $t("mailMarketing.emailAddress.btns.export") }}</Button
                  ></DropdownItem
                >
                <!-- 删除 -->
                <DropdownItem command="3"
                  ><Button
                    class="mail-preview"
                    type="text"
                    v-if="showBtns.delBtn"
                    >{{ $t("mailMarketing.emailAddress.btns.delete") }}</Button
                  ></DropdownItem
                >
              </DropdownMenu>
            </Dropdown>
            <!-- <Button class="mail-preview" type="text" @click.stop="exportData">{{
              "导出"
            }}</Button>
            <Button class="mail-preview" type="text" @click.stop="edit">{{
              "编辑"
            }}</Button>
            <Button
              class="mail-preview"
              type="text"
              @click.stop="deleteModal = true"
              >{{ "删除" }}</Button
            > -->
          </template>
        </TableColumn>
        <div slot="empty">{{tableList != null ? "暂无数据" : ""}}</div>
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
                transfer>
            </Page>
        </footer>

        <Modal
            :visible.sync="deleteModal"
            append-to-body
            width="520px"
            :title="$t('mailMarketing.emailAddress.prompt')"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
        >
            <div v-if="deleteModal">
                <span>{{$t("mailMarketing.emailAddress.delPrompt")}}【{{delRow.addrName}}】</span>
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
        <Modal
            :visible.sync="tipsModal"
            append-to-body
            width="520px"
            :title="$t('mailMarketing.emailAddress.prompt')"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
        >
            <div v-if="tipsModal">
                <span>{{ $t("mailMarketing.emailAddress.delError") }}</span>
            </div>
            <div slot="footer">
                <Button @click="tipsModal = false">{{ $t("mailMarketing.emailAddress.btns.cancel") }}</Button>
            </div>
        </Modal>
      <!-- 添加数据 -->
        <add-address
            v-if="show_edit_data"
            :visible.sync="show_edit_data"
            @refreshData="refreshData"
            ref="addAddress"
            :isEditModel="isEditModel">
        </add-address>
    </div>
  </div>
</template>
<script>
    import { mapState } from 'vuex';
    import FilterTags from '@/views/main-components/filter-tags';
    import addAddress from './add-address/index.vue';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    export default {
        props: [],
        data() {
            return {
                type: 1,
                marketing_title: this.$t('mailMarketing.emailAddress.allAddressBook'),
                total: 0, // 列表数据总条数
                currentPageNum: 1, // 当前页码
                pageSize: 20, // 当前页显示条数
                deleteModal: false,
                deleteLoading: false,
                tableLoading: false,
                show_edit_data: false,
                isEditModel: false,
                delRow: {},
                tableList: null,
                show_filter_content: false,
                config_tableFilter: {
                    addrName: {
                        sort: false, // 是否允许排序
                        filter: true, // 是否允许筛选
                        filterType: 'string', // 筛选类型,              string / date / select / countryArea
                        query: '', // 筛选值, 对应上述类型:       '' / [] / [] / ''
                        allList: null
                    }
                },
                sortType: 'desc', // 排序方式
                sort: '',
                filterComponentWidth: 220, // 筛选组件的宽度
                lang_mail: {
                    addrName: this.$t('mailMarketing.emailAddress.name'),
                    contactCount: this.$t('mailMarketing.emailAddress.numberOfContacts'),
                    createType: this.$t('mailMarketing.emailAddress.addMethod'),
                    updateTime: this.$t('mailMarketing.emailAddress.lastUpdateTime'),
                    updateUserName: this.$t('mailMarketing.emailAddress.updater'),
                    remark: this.$t('mailMarketing.emailAddress.note')
                },
                // 无下拉的列表项
                expandTemp: [
                    'contactCount',
                    'createType',
                    'updateTime',
                    'updateUserName',
                    'remark'
                ],
                tableColumns: [
                    {
                        title: this.$t('mailMarketing.emailAddress.name'),
                        label: this.$t('mailMarketing.emailAddress.name'),
                        key: 'addrName',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.emailAddress.numberOfContacts'),
                        label: this.$t('mailMarketing.emailAddress.numberOfContacts'),
                        key: 'contactCount',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.emailAddress.addMethod'),
                        label: this.$t('mailMarketing.emailAddress.addMethod'),
                        key: 'createType',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.emailAddress.lastUpdateTime'),
                        label: this.$t('mailMarketing.emailAddress.lastUpdateTime'),
                        key: 'updateTime',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.emailAddress.updater'),
                        label: this.$t('mailMarketing.emailAddress.updater'),
                        key: 'updateUserName',
                        resizable: false
                    },
                    {
                        title: this.$t('mailMarketing.emailAddress.note'),
                        label: this.$t('mailMarketing.emailAddress.note'),
                        key: 'remark',
                        resizable: false
                    }
                ],
                tableData: [],
                tipsModal: false
            };
        },
        components: { FilterTags, addAddress },
        computed: {
            ...mapState({
                orgId: (state) => state.enterpriseId,
                userId: (state) => state.userId,
                fullName: (state) => state.fullName,
                userName: (state) => state.userName,
                window_height: (state) => state.window_height,
                button_list: (state) => state.app.button_list
            }),
            // 我的地址簿 or 全部地址簿
            // marketing_title() {
            //   switch (this.type) {
            //     case 1:
            //       return "我的地址簿";
            //       break;
            //     case 2:
            //       return "全部地址簿";
            //       break;
            //     default:
            //       return "";
            //       break;
            //   }
            // },
            tableHeight() {
                return this.window_height - 161;
            },
            showBtns() {
                const ids = BUTTON_IDS.emailMarketing.addressBook;
                return {
                    delBtn: !HANDLE_BUTTON(ids.del, this.button_list),
                    newBtn: !HANDLE_BUTTON(ids.new, this.button_list),
                    exportBtn: !HANDLE_BUTTON(ids.export, this.button_list),
                    editBtn: !HANDLE_BUTTON(ids.edit, this.button_list)
                };
            }
        },
        created() {
            this.init();
        },
        mounted() {
            this.getData();
        },
        methods: {
            changeBtn(value, row) {
                console.log(value, row);
                switch (value) {
                    case '1':
                        this.edit(row);
                        break;
                    case '2':
                        this.exportData(row);
                        break;
                    case '3':
                        this.delAddress(row);
                        break;
                    default:
                        return '';
                        break;
                }
            },
            getData(params) {
                this.tableLoading = true;
                const data = {
                    orgId: this.orgId,
                    createUserId: this.userId,
                    type: this.type,
                    pageNo: this.currentPageNum,
                    pageSize: this.pageSize
                };
                this.$util
                    .ajaxEmailMarketingJson({
                        url: '/business/address/book/findAddressListByPage',
                        method: 'POST',
                        data: Object.assign(data, params)
                    })
                    .then((response) => {
                        this.tableLoading = false;
                        console.log(response);
                        if (response.data.code === 1) {
                            this.tableList = response.data.data.list;
                            this.total = response.data.data.totalSize;
                        } else {
                            console.log('请求失败');
                        }
                    })
                    .catch(() => {
                        this.tableLoading = false;
                        console.log('请求异常');
                    });
            },
            refreshData() {
                if (!this.isEditModel) {
                    this.currentPageNum = 1;
                }
                this.getData();
            },
            /**
             * 导出数据
             */
            exportData(row) {
                window.open(`${this.$util.EmailMarketingUrl}/template/data/export?orgId=${this.orgId}&createUserId=${this.userId}&id=${row.id}`);
                // this.$util
                //   .ajaxEmailMarketingJson({
                //     url: "/template/data/export",
                //     method: "GET",
                //     params: {
                //       createUserId: this.userId,
                //       orgId: this.orgId,
                //       id: row.id
                //     },
                //   })
                //   .then((res) => {
                //     if (res) {
                //       this.$util.exportExcel( row.addrName, res.response)
                //       this.$Message.success("导出成功");
                //     } else {
                //       this.$Message.error(res.data.msg);
                //     }
                //   });
            },
            newAddress() {
                this.show_edit_data = true;
                this.isEditModel = false;
                this.$store.commit('setEditAddressRow', {});
            },
            edit(row) {
                // this.show_edit_data = true;
                // this.isEditModel = true
                // this.$store.commit('setEditAddressRow', row);
                this.$util
                    .ajaxEmailMarketingJson({
                        url: '/business/address/book/findById',
                        method: 'POST',
                        params: {
                            id: row.id
                        }
                    })
                    .then((res) => {
                        if (res.data.code === 1) {
                            this.show_edit_data = true;
                            this.isEditModel = true;
                            this.$store.commit('setEditAddressRow', res.data.data);
                        }
                    });
            },
            delAddress(row) {
                this.deleteModal = true;
                this.delRow = row;
            },
            deleteConfirm() {
                this.$util
                    .ajaxEmailMarketingJson({
                        url: '/business/address/book/delete',
                        method: 'POST',
                        params: {
                            id: this.delRow.id,
                            userId: this.userId
                        }
                    })
                    .then((res) => {
                        this.deleteModal = false;
                        if (res.data.code === 1) {
                            if (this.tableList.length == 1) {
                                this.currentPageNum = this.currentPageNum - 1;
                            }
                            this.getData();
                            this.$Message.success('删除成功');
                        } else if (res.data.code == 2) {
                            this.tipsModal = true;
                        } else {
                            this.$Message.error(res.data.msg);
                        }
                    }).catch(res => {
                        this.deleteModal = false;
                        this.$Message.error(res.data.msg);
                    });
            },
            // 跳转查看地址簿页面
            checkAddress({ id, addrName }) {
                this.$emit('handleView', {
                    com: 'emailList',
                    query: {
                        parentId: id,
                        addrName
                    }
                });
            },
            sendEmail(row) {
                this.$router.push({ name: 'marketing_activities', params: { view: 'newMarketing', data: { id: row.id, addrName: row.addrName, contacts: row.contacts } } });
            },
            // 切换我的营销活动或全部营销活动
            changeMyOrAll(command) {
                this.type = Number(command);
                // this.marketing_title =
                switch (this.type) {
                    case 1:
                        this.marketing_title = this.$t('mailMarketing.emailAddress.allAddressBook');
                        break;
                    case 0:
                        this.marketing_title = this.$t('mailMarketing.emailAddress.myAddressBook');
                        break;
                    default:
                        return '';
                        break;
                }
                this.currentPageNum = 1;
                this.getData();
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
                                                : '50px',
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
                                    updateList: () => {
                                        this.currentPageNum = 1;
                                        this.getData({
                                            addrName: this.config_tableFilter[column.key].query
                                        });
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
                // this.$store.commit("setCurrentPage", 1);
                this.currentPageNum = 1;
                this.getData({
                    addrName: ''
                });
                this.mailTableData = this.mockmailTableData(this.currentPersonId);
            },
            mockmailTableData() {}
        },
        watch: {}
    };
</script>
<style lang="less" scoped>
@import url("./index.less");
.mail-preview {
  color: #3b78de;
}
.custom-address-more {
  margin-left: 10px;
}
</style>
