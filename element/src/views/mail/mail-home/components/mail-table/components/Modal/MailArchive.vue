<template>
    <Modal :visible="visible"
           :title="$t('mail.title_mailArchive')"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           :append-to-body="true"
           :modal-append-to-body="false"
           :destroy-on-close="true"
           width="70%"
           @close="cancel"
           class="vertical-center-modal modal-responsive-vertical">
        <template v-if="[1, 3].includes(archiveObjectType)">
            <!-- loading -->
            <Spin v-if="loading"
                  fix></Spin>

            <!-- 筛选 -->
            <div class="search-container">
                <!-- 筛选条件 -->
                <Row>
                    <!-- 公司名称 -->
                    <Col :xs="24"
                         :sm="24"
                         :md="10">
                        <div>{{ $t('crm.Table.col_companyName') }}</div>
                        <div>
                            <Input v-model="companyName"
                                   :placeholder="$t('tableFilter.tip_inputKeyWords')"/>
                        </div>
                    </Col>

                    <!-- 询盘编号 -->
                    <Col v-if="archiveObjectType === 3"
                         :xs="24"
                         :sm="24"
                         :md="{ span: 10, offset: 4 }">
                        <div>{{ $t('crm.Table.col_seqNumber') }}</div>
                        <div>
                            <Input v-model="seqNumber"
                                   :placeholder="$t('tableFilter.tip_inputKeyWords')"/>
                        </div>
                    </Col>

                    <!-- 负责人 -->
                    <Col :xs="24"
                         :sm="24"
                         :md="{ span: 10, offset: archiveObjectType === 3 ? 0 : 4 }">
                        <div>{{ $t('crm.Table.col_inquiryManagers') }}</div>
                        <Select v-model="subUserIds"
                                multiple
                                clearable
                                filterable
                                :placeholder="$t('crm.Modal.tip_select')"
                                size="small">
                            <Option v-for="item in managerList"
                                    :key="item.manageId"
                                    :value="item.manageId"
                                    :label="item.administrator"></Option>
                        </Select>
                    </Col>
                </Row>

                <!-- footer -->
                <div class="text-right">
                    <!-- 搜索 -->
                    <Button type="success"
                            @click="search">{{ $t('search') }}</Button>
                    <!-- 清空 -->
                    <Button type="minor"
                            @click="empty">{{ $t('filter_box.empty') }}</Button>
                </div>
            </div>

            <!-- 表格 -->
            <Table :data="tableData"
                   :height="table_height"
                   :empty-text="Object.keys(filterCon).length ? $t('mail.noMatchedData') : $t('crm.Table.noData')"
                   class="tabmain noBoxShadow-right noborder-table noborder-table-normal-border">
                <!-- 单选列 -->
                <TableColumn width="20"
                             align="center"
                             class-name="no-padding-cell">
                    <template slot-scope="{ row, $index }">
                        <Radio :value="row.id === selectedRow.id"
                               :label="true"
                               @change="selectRow($index)">{{ '' }}</Radio>
                    </template>
                </TableColumn>
                <!-- 正常表格列 -->
                <TableColumn v-for="item in tableColumns"
                             :key="item.key"
                             :prop="item.key"
                             :label="item.title"
                             align="left"
                             :min-width="item.width"
                             :formatter="item.formatter"
                             :show-overflow-tooltip="true">
                    <template slot-scope="{ row }">
                        <!-- 公司名称 -->
                        <template v-if="item.key === 'companyName'">
                            <a @click.stop="viewCompany(row.companyId)"
                               class="hover-link">{{ row[item.key] }}</a>
                        </template>
                        <!-- 询盘编号 -->
                        <template v-else-if="item.key === 'seqNumber'">
                            <a @click.stop="viewInquiry(row.inquiryId)"
                               class="hover-link">{{ row[item.key] }}</a>
                        </template>
                        <template v-else-if="item.formatter">
                            {{ (item.formatter)(row) }}
                        </template>
                        <template v-else>
                            {{ row[item.key] }}
                        </template>
                    </template>
                </TableColumn>
            </Table>
            <!-- 分页 -->
            <div style="margin-top: 10px;overflow: hidden">
                <Page :page-size="pageSize"
                      :page-sizes="pageSizeOpts"
                      :total="totalNum"
                      :current-page.sync="curPage"
                      layout="total, prev, pager, next, jumper"
                      @current-change="changePage"
                      class="pageWrap-right"></Page>
            </div>

            <!-- 底部按钮 -->
            <div slot="footer">
                <Button @click="cancel">{{ $t('cancel') }}</Button>
                <Button type="primary"
                        @click="ok"
                        :disabled="!(selectedRow && selectedRow.id)"
                        :class="piwik_mailArchive">{{ $t('confirm') }}</Button>
            </div>
        </template>
    </Modal>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'MailArchive',
        props: {
            visible: Boolean,
            archiveObjectType: Number,
            mailList: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        computed: {
            ...mapState({
                userId: 'userId',
                fullName: 'fullName',
                enterpriseId: 'enterpriseId',
                window_height: 'window_height',
                lang: state => state.app.lang
            }),
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            table_height() {
                let temp = this.window_height ? this.window_height - 408 : document.body.clientHeight - 408;
                if (temp < 200) {
                    temp = 200;
                }
                return temp;
            },
            // 归档确认按钮 piwik class
            piwik_mailArchive() {
                return {
                    'piwik-archiveToCustomer': this.archiveObjectType === 1,
                    'piwik-archiveToInquiry': this.archiveObjectType === 3
                };
            }
        },
        data() {
            return {
                /* 全局 */
                loading: false,

                /* 筛选 */
                companyName: '',
                seqNumber: '',
                subUserIds: [],
                managerList: [],
                // 点击搜索时计算得到的筛选条件
                filterCon: {},

                /* 表格 */
                tableData: [],
                // 全部表格列
                allColumns: [
                    {
                        title: this.$t('crm.Table.col_companyName'),
                        key: 'companyName',
                        width: 160
                    },
                    {
                        title: this.$t('crm.Table.col_seqNumber'),
                        key: 'seqNumber',
                        width: 120
                    },
                    {
                        title: this.$t('crm.Table.col_inquiryManagers'),
                        key: 'managers',
                        width: 180
                    },
                    {
                        title: this.$t('crm.Modal.createTime'),
                        key: 'createTime',
                        width: 100
                    }
                ],
                // 表格显示列
                tableColumns: [],
                // 表格数据请求 url
                tableDataReqUrl: '',
                // 被选中的公司/询盘
                selectedRow: {},

                /* 分页 */
                pageSize: 20,
                pageSizeOpts: [20],
                curPage: 1,
                totalNum: 0,
                maxPageNum: 0
            };
        },
        methods: {
            /* 筛选 */
            // 获取当前企业下负责人列表
            getManagerList() {
                util.ajax({
                    url: '/new-privilege/user/getAllUsersIncludeLock',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.managerList = Array.isArray(res.data.data) ? res.data.data : [];
                    }
                });
            },
            // 清空筛选条件
            empty() {
                this.loading = false;
                this.companyName = '';
                this.seqNumber = '';
                this.subUserIds = [];
                this.tableData = [];
                this.curPage = 1;
                this.totalNum = 0;
                this.maxPageNum = 0;
                this.selectedRow = {};
                this.filterCon = {};
            },
            // 搜索
            search() {
                // 筛选条件校验
                if (!this.companyName && !this.seqNumber && !this.subUserIds.length) {
                    this.$Message.error(this.$t('mail.writeLetter.addContactModal.searchErrorTip'));
                    return;
                }

                // 清空选中项
                this.selectedRow = {};
                // 重置页码
                this.curPage = 1;
                // 计算得到筛选条件
                this.filterCon = this.handleFilterCon();
                // 请求表格数据
                this.getTableData();
            },

            /* 表格 */
            // 获取数据
            getTableData() {
                // 格式化请求数据
                let postData = {
                    lang: this.lang,
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    listType: 3,
                    pageSize: this.pageSize,
                    pageNo: this.curPage,
                    orderColumn: this.archiveObjectType === 1 ? 'cpCreateTime' : 'create_time',
                    orderType: 'desc'
                };
                // 拼接筛选条件
                postData = Object.assign(postData, this.filterCon);

                // 显示 loading
                this.loading = true;
                // 请求表格数据
                util.ajax({
                    url: this.tableDataReqUrl,
                    method: 'post',
                    data: postData
                }).then(({ data }) => {
                    if (data.code === '1') {
                        this.tableData = this.handleData(data.data.list);
                        this.totalNum = data.data.total || 0;
                        this.maxPageNum = Math.ceil(this.totalNum / this.pageSize);

                        // 默认选中第一条数据
                        if (!Object.keys(this.selectedRow).length && this.tableData[0]) {
                            this.selectedRow = this.tableData[0];
                        }
                    } else {
                        this.selectedRow = {};
                        this.tableData = [];
                        this.$Message.error(this.$t('crm.WorkBench.error_getTableData'));
                    }
                    this.loading = false;
                }).catch(error => {
                    console.error(error);
                    this.selectedRow = {};
                    this.tableData = [];
                    this.$Message.error(this.$t('crm.WorkBench.error_getTableData'));
                    this.loading = false;
                });
            },
            // 处理表格数据
            handleData(data) {
                // 数据合法性校验
                if (!Array.isArray(data)) {
                    return [];
                }

                return data.map(item => {
                    return {
                        id: item.id || item.cpId, // 归并询盘时, 接口返回有 id , 归并客户时, 接口返回有 cpId
                        inquiryId: item.id, // id 代表询盘 id , 归并客户时, 表格不显示询盘列, 所以这么用也不影响
                        companyId: item.cpId || item.companyId, // 归并询盘时, 接口返回有 companyId , 归并客户时, 接口返回无 companyId 有 id
                        seqNumber: item.seqNumber,
                        companyName: item.cpCompanyName || item.companyName, // 归并询盘时，接口返回 companyName ，归并客户时，接口返回 cpCompanyName
                        managers: item.cpCompanyManagers || item.companyManagers, // 归并询盘时, 接口返回有 companyManagers , 归并客户时, 接口返回有 cpCompanyManagers
                        createTime: item.createTime ? this.$options.filters.timeFormat(new Date(item.createTime)) : this.$options.filters.timeFormat(new Date(item.cpCreateTime)) // 归并询盘时, 接口返回有 userNamesShow , 归并客户时, 接口返回有 cpCreateTime
                    };
                });
            },
            // 处理筛选条件
            handleFilterCon() {
                // 处理筛选条件
                const query = { $and: [] };
                if (this.companyName) {
                    if (this.archiveObjectType === 1) {
                        query.$and.push({ cpCompanyName: { $regex: this.companyName } });
                    } else {
                        query.$and.push({ companyName: { $regex: this.companyName } });
                    }
                }
                if (this.seqNumber) {
                    query.$and.push({ seq_number: { $regex: this.seqNumber } });
                }
                const subUserIds = this.subUserIds.join(',');

                // 返回结果
                const result = {};
                if (query.$and.length) {
                    result.query = JSON.stringify(query);
                }
                if (subUserIds.length) {
                    result.subUserIds = subUserIds;
                }
                return result;
            },
            // 调整分页
            changePage(page) {
                if (page <= this.maxPageNum) {
                    this.curPage = page;
                    this.getTableData();
                }
            },
            // radio 选中数据
            selectRow(index) {
                this.selectedRow = this.$deepClone(this.tableData[index]);
            },
            // 跳转到客户详情页
            async viewCompany(companyId) {
                // 判断是否有"我的客户"页面权限
                if (!this.isContainsMenu('myCustomer')) {
                    // 没有"我的客户"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                    return;
                }

                // 查询该公司 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Customer',
                    id: companyId
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 公海客户, 检查是否有"公海客户"页面权限
                if (authorized === 'highseas') {
                    // 判断是否有"公海客户"页面权限
                    if (!this.isContainsMenu('highseasCustomer')) {
                        // 没有"公海客户"页面权限, 弹出提示
                        this.$Message.warning(this.$t('crm.Modal.error_haveNoPermissionHighseasCustomer'));
                        return false;
                    }
                }

                // 否则直接新窗口打开新客户详情页
                this.$viewCustomer(companyId);
            },
            // 跳转到询盘详情页
            async viewInquiry(inquiryId) {
                // 判断是否有"我的询盘"页面权限
                if (!this.isContainsMenu('myInquiry')) {
                    // 没有"我的询盘"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyInquiry'));
                    return;
                }

                // 无 inquiryId , 退出流程
                if (!inquiryId) {
                    this.$Message.error(this.$t('crm.Modal.error_inquiryId'));
                    return;
                }

                // 查询该 inquiryId 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Inquiry',
                    id: inquiryId
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 如果是公海询盘
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpInquiryInHighseas'));
                    return;
                }

                // 新窗口跳转到询盘页面
                localStorage.setItem('leadsCloud-inquiryId', inquiryId);
                
                window.open(this.$router.resolve('/crm/myInquiry').href, '_blank');
            },

            /* footer */
            // 取消
            cancel() {
                // 关闭弹窗
                this.$emit('update:visible', false);
                // 清空数据
                this.empty();
            },
            // 确定
            ok() {
                let arr = [];
                 this.mailList.forEach(item => {
                    if (item.id) {
                        arr.push(item.id);
                    }
                });
                // 格式化请求数据
                const postData = {
                    orgId: this.enterpriseId,
                    createUserId: this.userId, // 操作人id
                    createUserName: this.fullName, // 操作人姓名
                    mailBoxIdList: arr, // 要归并的邮件id
                    archiveObjectType: this.archiveObjectType // 归并类型1客户 3询盘（与crm保持一致）
                };
                switch (this.archiveObjectType) {
                    case 1:
                        // 公司
                        postData.companyId = this.selectedRow.companyId;
                        postData.companyName = this.selectedRow.companyName;
                        break;
                    case 3:
                        // 询盘
                        postData.companyId = this.selectedRow.companyId;
                        postData.companyName = this.selectedRow.companyName;
                        postData.inquiryId = this.selectedRow.inquiryId;
                        postData.seqNumber = this.selectedRow.seqNumber;
                        break;
                }

                // 显示 loading
                this.loading = true;
                // 发送请求
                util.ajaxMailJson({
                    url: '/mail/mailArchiveManuallyRecord/archiveManually',
                    method: 'post',
                    data: postData
                }).then(({ data }) => {
                    if (data.code === 1 && data.data) {
                        this.loading = false;
                        if (Array.isArray(data.data.success) && data.data.success.length) {
                            // 如果有邮件归档成功
                            // 向上传递"归档完成"信号
                            this.$emit('archiveFinished');

                            // 弹出提醒
                            if (Array.isArray(data.data.fail) && data.data.fail.length) {
                                // 有归档失败邮件, 则提示用户部分邮件失败 (目前后端只对 草稿箱/已删除/垃圾箱 做判断)
                                this.$Message.success(this.$t('mail.tip_invalidBoxArchive'));
                            } else {
                                // 无归档失败邮件, 直接提示归档成功
                                this.$Message.success(this.$t('mail.success_mailArchive'));
                            }

                            // 关闭弹窗
                            this.cancel();
                        } else {
                            if (Array.isArray(data.data.fail) && data.data.fail.length) {
                                // 有归档失败邮件, 则提示用户全部邮件归档失败 (目前后端只对 草稿箱/已删除/垃圾箱 做判断)
                                this.$Message.error(this.$t('mail.tip_invalidBoxArchive'));
                            } else {
                                // 邮件成功/失败数据都没有, 提示归档失败
                                this.$Message.error(this.$t('mail.error_mailArchive'));
                            }
                        }
                    } else {
                        this.$Message.error(this.$t('mail.error_mailArchive'));
                        this.loading = false;
                    }
                }).catch(e => {
                    this.$Message.error(this.$t('mail.error_mailArchive'));
                    this.loading = false;
                });
            }
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        // 参数校验
                        if (![1, 3].includes(this.archiveObjectType)) {
                            return;
                        }

                        // 获取负责人筛选条件
                        this.getManagerList();

                        // 根据归档类型不行设置不同的配置(表格列, 表格接口)
                        switch (this.archiveObjectType) {
                            case 1:
                                // 公司
                                this.tableColumns = this.allColumns.filter(item => item.key !== 'seqNumber');
                                this.tableDataReqUrl = '/crm/mongo/companyRefactor/getFilterListDataAndTotal';
                                break;
                            case 3:
                                // 询盘
                                this.tableColumns = this.allColumns.slice();
                                this.tableDataReqUrl = '/crm/mongo/inquiryRefactor/getFilterListDataAndTotal';
                                break;
                            default:
                                this.tableColumns = [];
                                this.tableDataReqUrl = '';
                        }
                    }
                }
            }
        }
    };
</script>

<style lang="less" scoped>
    .search-container {
        .el-row {
            /deep/ .el-col {
                padding: 9px 0;
                display: flex;
                align-items: center;
                justify-content: space-between;

                > div {
                    display: inline-block;

                    &:first-child {
                        flex: 0 0 115px;
                        text-align: left;
                        font-size: 12px;
                        color: rgba(0,0,0,0.80);
                        line-height: 18px;
                        font-weight: 400;
                    }

                    &:nth-child(2) {
                        flex: 1 1 240px;

                        > div {
                            width: 100%;
                        }
                    }
                }
            }
        }

        /deep/ .el-button--success {
            float: right;
            font-size: 12px;
            height: 33px;
            line-height: 30px;
            padding-bottom: 0;
            padding-top: 0;
            color: #fff;
            background-color: #7b98b6;
            border-color: #7b98b6;
            &:hover {
                background-color: #95adc5;
                border-color: #95adc5;
            }
        }
        /deep/ .el-button--minor {
            float: right;
            font-size: 12px;
            height: 33px;
            line-height: 30px;
            padding-bottom: 0;
            padding-top: 0;
            margin-right: 10px;
        }
    }

    .modal-responsive-vertical {
        /deep/ .el-dialog__body {
            max-height: calc(~"100vh - 150px");
            padding: 6px 30px;
            overflow-x: hidden;
            overflow-y: auto;
        }

        /deep/ .el-table th {
            text-overflow: initial;
        }
    }
</style>
