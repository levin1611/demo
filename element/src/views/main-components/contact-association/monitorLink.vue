<!-- 监测链接弹窗 -->
<!-- 注意: -->
<!-- 1. 链接地址正则校验是否需要改动? -->
<!-- 2. 新增成功后, 后台接口是否会返回新增数据的 id , 来让我替换新增行数据的 id 为正确数据 -->
<!-- 3. 字段上限替换, 提示语替换, 接口, 参数名...替换 -->
<!-- 4. 去掉 mock 数据逻辑 -->
<!-- 5. 保存失败时, 各种不同的错误原因情况处理 -->
<template>
    <Modal :visible="visible"
           :title="$t('monitorLink.title')"
           width="800px"
           :show-close="false"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           :modal-append-to-body="false"
           :append-to-body="true"
           class="monitorLink">
        <!-- 标题 -->
        <div slot="title">
            <span class="monitorLink-title">{{ $t('monitorLink.title') }}</span>
            <!--<HelpTip :title="$t('helpTip.monitorLinkTip')"></HelpTip>-->
        </div>

        <!-- loading -->
        <Spin v-if="loading"
              fix></Spin>

        <!-- 表格 Legend + 新增按钮 -->
        <div class="monitorLink-top">
            <!-- legend 提示 -->
            <!--<div class="monitorLink-legend">{{ $t('monitorLink.legend') }}</div>-->

            <!-- 新增按钮 -->
            <Button type="primary"
                    :disabled="!able_add"
                    @click="handleAdd"
                    class="monitorLink-new">{{ $t('crm.Modal.operate_add') }}</Button>
        </div>

        <!-- 表格 -->
        <Table :data="tableData"
               :empty-text="$t('crm.Table.noData')"
               :max-height="tableMaxHeight"
               ref="table"
               @row-click="clickRow"
               class="monitorLink-table">
            <TableColumn v-for="item in tableColumns"
                         :key="item.key"
                         :prop="item.key"
                         :label="item.title"
                         :width="item.width"
                         :class-name="item.className"
                         :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <!-- 单选列 -->
                    <template v-if="item.key === 'selectLink'">
                        <Radio :value="scope.row.id === selectedRow.id"
                               :label="true">{{ '' }}</Radio>
                    </template>

                    <!-- 操作列 -->
                    <div v-else-if="item.key === 'operate'"
                         class="monitorLink-table-operateBtns">
                        <!-- 编辑状态 -->
                        <template v-if="scope.row.editing">
                            <!-- 保存 -->
                            <Icon custom="custom custom-confirm"
                                  color="#4285F4"
                                  @click.stop="handleAdd_confirm(scope)"></Icon>

                            <!-- 取消 -->
                            <Icon custom="custom custom-follow-edit-area-close"
                                  @click.stop="handleAdd_cancel(scope)"></Icon>
                        </template>

                        <!-- 非编辑状态 -->
                        <template v-else>
                            <!-- 复制 -->
                            <Icon custom="custom custom-copy-new"
                                  @click.stop="handleCopy(scope)"></Icon>

                            <!-- 编辑 -->
                            <Icon custom="custom custom-field-edit"
                                  @click.stop="handleEdit(scope)"></Icon>

                            <!-- 删除 -->
                            <Icon custom="custom custom-field-delete"
                                  @click.stop="handleDelete(scope)"></Icon>
                        </template>
                    </div>

                    <!-- 其他可编辑列 -->
                    <template v-else>
                        <!-- 编辑状态 -->
                        <template v-if="scope.row.editing">
                            <Input v-model.trim="scope.row[item.key]"
                                   :placeholder="item.placeholder"
                                   @click.native.stop
                                   class="monitorLink-table-input" />
                        </template>

                        <!-- 非编辑状态 -->
                        <template v-else>
                            <!-- 正常显示文字 -->
                            <span class="monitorLink-table-text">{{ scope.row[item.key] }}</span>
                        </template>
                    </template>
                </template>
            </TableColumn>
        </Table>

        <!-- 分页 -->
        <Page :page-size="pageSize"
              :page-sizes="[20, 50, 100]"
              :total="total"
              :current-page="pageNo"
              layout="total, prev, pager, next, sizes, jumper"
              @current-change="changePage"
              class="monitorLink-table-pager"></Page>

        <!-- 底部 -->
        <div slot="footer">
            <!-- 取消 -->
            <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
            <!-- 插入 -->
            <Button type="primary"
                    :disabled="!able_insert"
                    @click="insert">{{ $t('monitorLink.insert') }}</Button>
        </div>
    </Modal>
</template>

<script>
    import util from '@/libs/util';
    import Utils from '@/utils/index';
    import { mapState } from 'vuex';

    export default {
        name: 'monitorLink',
        props: [
            'visible'
        ],
        computed: {
            // 从 vuex 中获取属性
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                window_height: 'window_height'
            }),
            // 是否允许点击"新增"
            able_add() {
                // 请求中, 不允许点击
                if (this.loading) {
                    return false;
                }

                // 有编辑中的表格数据, 不允许点击
                if (this.tableData.length && this.tableData.some(item => item.editing)) {
                    return false;
                }

                // 校验通过, 允许点击
                return true;
            },
            // 是否允许点击"插入"
            able_insert() {
                // 请求中, 不允许点击
                if (this.loading) {
                    return false;
                }

                // 有编辑中的表格数据, 不允许点击
                if (this.tableData.length && this.tableData.some(item => item.editing)) {
                    return false;
                }

                // 没有选中链接
                if (!(this.selectedRow && this.selectedRow.linkUrl)) {
                    return false;
                }

                // 校验通过, 允许点击
                return true;
            },
            // 表格最大高度
            tableMaxHeight() {
                const temp = this.window_height ? this.window_height - 385 : document.body.clientHeight - 385;
                return temp > 159 ? temp : 159;
            }
        },
        data() {
            return {
                loading: false,

                // 表格数据
                tableData: [],
                // 表格列配置
                tableColumns: [
                    {
                        title: ' ',
                        key: 'selectLink',
                        width: 25
                    },
                    {
                        title: this.$t('monitorLink.linkName'),
                        key: 'linkName',
                        placeholder: this.$t('monitorLink.placeholder_linkName'),
                        maxLength: 20,
                        className: 'monitorLink-editableCell',
                        width: 150
                    },
                    {
                        title: this.$t('monitorLink.linkUrl'),
                        key: 'linkUrl',
                        placeholder: this.$t('monitorLink.placeholder_linkUrl'),
                        maxLength: 500,
                        className: 'monitorLink-editableCell',
                        width: 480
                    },
                    {
                        title: this.$t('crm.Table.operate'),
                        key: 'operate',
                        width: 100
                    }
                ],
                pageSize: 20,
                pageNo: 1,
                total: 0,

                // 选中链接数据
                selectedRow: {}
            };
        },
        methods: {
            // 获取表格数据
            refreshData() {
                // 显示 loading
                this.loading = true;
                // 请求表格数据
                util.ajax({
                    url: '/mail/monitoringlink/getList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        pageSize: this.pageSize,
                        pageNo: this.pageNo
                    }
                }).then(({ data }) => {
                    if (data.code === '1' && data.data) {
                        this.tableData = this.handleData(data.data.list);
                        this.total = data.data.total || 0;
                    } else {
                        this.$Message.error(this.$t('crm.WorkBench.error_getTableData'));
                    }
                    this.loading = false;
                }).catch(error => {
                    console.error(error);
                    this.$Message.error(this.$t('crm.WorkBench.error_getTableData'));
                    this.loading = false;
                });
            },
            // 处理得到表格数据
            handleData(data) {
                // 如果传入非数组, 直接返回空数组
                if (!Array.isArray(data)) {
                    return [];
                }

                // 格式化数据
                return data.map(item => {
                    return {
                        editing: false,
                        ...item
                    };
                });

                // 过滤已存在数据
                // tmp = tmp.filter(item => !this.tableData.find(i => i.id === item.id));

                // 拼合原有数据
                // return tmp;
            },
            // 改变页码
            changePage(page) {
                this.tableData = [];
                this.pageNo = page;
                this.refreshData();
            },

            // 点击表格某一行
            clickRow(data, column, event) {
                // 选中该行
                this.selectedRow = data;
            },

            // 新增
            handleAdd() {
                // 表格滚动到顶部
                if (this.$refs.table) {
                    this.$refs.table.$el.querySelector('.el-table__body-wrapper').scrollTop = 0;
                }

                // 添加一行新数据
                const newRowData = {
                    editing: true,
                    id: 'new',
                    linkName: '',
                    linkUrl: ''
                };
                this.tableData.unshift(newRowData);

                // 自动选中该数据
                this.selectedRow = newRowData;
            },
            // 新增/编辑 - 保存
            async handleAdd_confirm({ row }) {
                if (['linkName', 'linkUrl'].some(item => {
                    const val = row[item] ? row[item].trim() : '';
                    const fieldName = this.$t(`monitorLink.${item}`);
                    const column = this.tableColumns.find(col => col.key === item);
                    // 空数据校验
                    if (!val) {
                        this.$Message.error(`[${fieldName}] ${this.$t('crm.Modal.error_canNotBeEmpty')}`);
                        return true;
                    }

                    // 数据长度校验
                    if (column && column.maxLength && val.length > column.maxLength) {
                        this.$Message.error(this.$t('monitorLink.monitorLinkToolong').replace('$fieldName', `[${fieldName}] `).replace('$maxLength', ` [${column.maxLength}] `));
                        return true;
                    }
                })) {
                    return;
                }

                // 前端校验链接格式
                const reg = Utils.regExp.link;
                if (!reg.test(row.linkUrl.trim())) {
                    this.$Message.error(this.$t('monitorLink.error_linkUrlFormat'));

                    return;
                }

                this.loading = true;

                // 后端校验连接有效性
                const res_validate = await this.validateLinkUrl(row.linkUrl.trim());
                if (res_validate && res_validate.data) {
                    if (res_validate.data.code !== '1') {
                        this.$Message.error(this.$t('monitorLink.error_linkUrlValidation'));
                        this.loading = false;

                        return;
                    }
                } else {
                    this.$Message.error(this.$t('monitorLink.error_validateLinkUrl'));
                    this.loading = false;

                    return;
                }

                // 通过 id 是否为 new 开头判断是新增还是编辑
                let operateType = 'edit';
                if (`${row.id}`.startsWith('new')) {
                    operateType = 'new';
                }

                // 根据类型不同, 设置不同的请求参数
                let postUrl, postData;
                switch (operateType) {
                    case 'new':
                        postUrl = '/mail/monitoringlink/save';
                        postData = {
                            orgId: this.enterpriseId,
                            createUser: this.fullName,
                            createUserId: this.userId,
                            linkName: row.linkName.trim(),
                            linkUrl: row.linkUrl.trim()
                        };
                        break;
                    case 'edit':
                        postUrl = '/mail/monitoringlink/update';
                        postData = {
                            id: row.id,
                            orgId: this.enterpriseId,
                            updateUser: this.fullName,
                            updateUserId: this.userId,
                            linkName: row.linkName.trim(),
                            linkUrl: row.linkUrl.trim()
                        };
                        break;
                }

                // 发送请求
                util.ajaxJson({
                    url: postUrl,
                    method: 'post',
                    data: postData
                }).then(({ data }) => {
                    if (data.code === '1') {
                        this.$Message.success(this.$t('crm.Table.success_save'));
                        row.editing = false;
                        if (operateType === 'new') {
                            // row.id = data.data.id;
                            // this.total++;
                            this.refreshData();
                        }
                    } else {
                        // 应该还有具体的错误原因
                        this.$Message.error(this.$t('crm.Table.error_save'));
                    }
                    this.loading = false;
                }).catch(e => {
                    console.error(e);
                    this.$Message.error(this.$t('crm.Table.error_save'));
                    this.loading = false;
                });
            },
            // 新增/编辑 - 取消
            handleAdd_cancel({ row, $index }) {
                // 通过 id 是否为 new 开头判断是新增还是编辑
                let operateType = 'edit';
                if (`${row.id}`.startsWith('new')) {
                    operateType = 'new';
                }

                switch (operateType) {
                    case 'new':
                        // 去除新增行
                        this.tableData.splice($index, 1);

                        // 清除选中
                        this.selectedRow = {};
                        break;
                    case 'edit':
                        // 退出编辑状态
                        row.editing = false;

                        // 回复编辑前数据
                        row.linkName = row.rawLinkName;
                        row.linkUrl = row.rawLinkUrl;
                        break;
                }
            },
            // 校验链接
            validateLinkUrl(url) {
                return util.ajax({
                    url: '/mail/monitoringlink/domainValid',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        linkUrl: url
                    }
                });
            },
            // 复制
            handleCopy({ row }) {
                const copyEl = document.createElement('textarea');
                copyEl.value = row.linkUrl;
                document.body.appendChild(copyEl);
                copyEl.select();
                if (document.execCommand('Copy')) {
                    this.$Message.success(this.$t('crm.Modal.success_copy'));
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_copy'));
                }
                document.body.removeChild(copyEl);
            },
            // 编辑
            handleEdit({ row }) {
                row.editing = true;
                row.rawLinkName = row.linkName;
                row.rawLinkUrl = row.linkUrl;
            },
            // 删除
            handleDelete({ row, $index }) {
                this.loading = true;

                // 发送请求
                util.ajax({
                    url: '/mail/monitoringlink/delete',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        id: row.id
                    }
                }).then(({ data }) => {
                    if (data.code === '1') {
                        this.$Message.success(this.$t('crm.UniSet.success_delete'));

                        // 从表格中去掉该数据
                        this.tableData.splice($index, 1);

                        // 表格数据总条数 - 1
                        this.total--;
                    } else {
                        this.$Message.error(this.$t('crm.UniSet.error_delete'));
                    }
                    this.loading = false;
                }).catch(e => {
                    console.error(e);
                    this.$Message.error(this.$t('crm.Table.error_delete'));
                    this.loading = false;
                });
            },

            // 点击插入
            async insert() {
                // 选中数据校验
                if (!(this.selectedRow && this.selectedRow.linkUrl && !this.selectedRow.editing)) {
                    return;
                }

                // 传链接地址给父组件
                this.$emit('insertUrl', this.selectedRow);

                // 关闭弹窗
                this.cancel();
            },
            // 点击取消
            cancel() {
                this.loading = false;
                this.tableData = [];
                this.pageNo = 1;
                this.total = 0;
                this.selectedRow = {};
                this.$emit('update:visible', false); // 改变父组件的 控制本组件显示 属性
            }
        },
        watch: {
            visible: {
                handler(val) {
                    // 弹窗显示时, 请求表格数据
                    if (val) {
                        this.changePage(1);
                    }
                }
            }
        }
    };
</script>

<style lang="less" scoped>
    .monitorLink {
        /* 标题 */
        .monitorLink-title {
            font-size: 18px;
            color: rgba(0,0,0,0.80);
            letter-spacing: 0;
            line-height: 26px;
            font-weight: 700;
            display: inline-block;
            margin-right: 8px;
        }

        /* 顶部 legend + 新增按钮 */
        .monitorLink-top {
            /*display: flex;*/

            /*.monitorLink-legend {*/
            /*    flex: 1;*/
            /*}*/

            text-align: right;

            .monitorLink-new {
            }
        }

        /* 表格 */
        .monitorLink-table {
            /deep/ table {
                width: 100% !important;
            }

            /* 控制表格 input 和文字左对齐(UI 要求) */
            /deep/ th.monitorLink-editableCell {
                padding: 10px;
            }
            /deep/ td.monitorLink-editableCell {
                padding: 0 10px;

                .cell {
                    padding: 0;
                }
            }
            .monitorLink-table-input {
                width: calc(~'100% - 20px');
                height: 100%;

                /deep/ input {
                    padding: 8px 9px;
                    font-size: 12px;
                }
            }
            .monitorLink-table-text {
                display: inline-block;
                padding: 10px 10px;
            }

            .monitorLink-table-operateBtns {
                .custom {
                    cursor: pointer;
                    font-size: 12px;

                    &:not(:first-child) {
                        margin-left: 20px;
                    }
                }
            }
        }

        /* 底部 pager */
        .monitorLink-table-pager {
            text-align: right;
            margin: 20px 0 0;
            padding: 0;
        }
    }
</style>
