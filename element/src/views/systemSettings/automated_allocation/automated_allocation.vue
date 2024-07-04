<template>
    <div class="automated_allocation">
        <div class="automated_allocation_header">
            <div style="display: flex;line-height: 28px;">
                <h3>
                    {{ $t('automatedAllocation.name') }}
                </h3>
                <span>{{$t('automatedAllocation.nameTip')}}</span>
            </div>
            <div class="header_select" v-if="multipleSelection.length === 0">
                <Select filterable
                        @change="triggerObjectChange"
                        :placeholder="$t('crm.Modal.tip_select')"
                        v-model="value"
                        size="medium"
                        style="width:200px;">
                    <Option v-for="item in objectList"
                            :value="item.value"
                            :key="item.value"
                            :label="item.label"></Option>
                </Select>
                <Button type="primary" @click="() => addRulesBox()">{{ $t('automatedAllocation.add') }}</Button>
            </div>
            <div class="header_multiple_select" v-else>
                <p v-html="selectedHtml"></p>
                <template v-if="value === 'mail'">
                    <Button @click="() => handleManualExecution()">{{ $t('automatedAllocation.manualExecutionRule') }}</Button>
                    <Tooltip
                            trigger="hover"
                            transfer
                            placement="right"
                            :content="$t('automatedAllocation.manualExecutionTip')"
                    >

                        <Icon
                                custom="custom custom-tip"
                                size="14"
                                style="color:#A9B9C9;cursor: pointer;"
                        ></Icon>
                    </Tooltip>
                </template>
            </div>
        </div>
        <!-- 表格中的内容 -->
        <Table
                class="noborder_table"
                :empty-text="$t('automatedAllocation.emptyText')"
                v-loading="loading"
                :row-class-name="getRowClassName"
                @selection-change="handleSelectionChange"
                ref="tableList"
                :data="list"
                :max-height="tableHeight">
            <TableColumn type="selection" width="65"></TableColumn>
            <TableColumn v-for="(item, index) in tableColumns"
                            :key="index"
                            :prop="item.key"
                            :min-width="item.width || 64"
                            :label="item.title"
                            show-overflow-tooltip>
                    <template slot-scope="{ row, $index }">
                        <div v-if="item.key === 'priority'" class="row_mailbox">
                            <Icon custom="custom custom-icon_move" class="priority_icon" style="cursor:move;color: rgba(0, 0, 0, 0.28);margin-right: 6px;"></Icon>
                            {{ $index + 1 }}
                        </div>
                        <div v-else-if="item.key === 'enabled'" class="row_mailbox">
                            <el-switch v-model="row.enabled" @change="(val) => enableRuleById(val, row)" active-color="#5384EA"></el-switch>
                        </div>
                        <div v-else class="row_mailbox">{{ row[item.key] || '--' }}</div>
                    </template>
            </TableColumn>
            <TableColumn :key="-1"
                            prop="operate"
                            :width="260"
                            :label="$t('automatedAllocation.operate')">
                    <template slot-scope="{ row, $index }">
                        <div class="table_operate">
                            <span @click="() => editRulesBox(row)" v-if="row.type === 2">{{ $t('automatedAllocation.edit') }}</span>
                            <span @click="() => handleCopy(row)">{{ $t('automatedAllocation.copy') }}</span>
                            <span @click='handleDelete(row, $index)' v-if="row.type === 2">{{ $t('automatedAllocation.delete') }}</span>
                            <template v-if="value === 'mail'">
                                <span @click='handleManualExecution(row)' :style="!row.enabled && 'cursor:no-drop'">{{ $t('automatedAllocation.manualExecution') }}</span>
                                <Tooltip
                                        trigger="hover"
                                        transfer
                                        placement="top"
                                        :content="$t('automatedAllocation.manualExecutionTip')"
                                >

                                    <Icon
                                            custom="custom custom-tip"
                                            size="14"
                                            style="color:#A9B9C9;cursor: pointer;"
                                    ></Icon>
                                </Tooltip>
                            </template>
                        </div>
                    </template>
            </TableColumn>
        </Table>

        <!-- 删除确认 -->
        <Modal
            :visible.sync="deleteVisible"
            :title="$t('automatedAllocation.deleteConfirmation')"
            width="500px"
            :append-to-body="true"
            :modal-append-to-body="false"
        >
        <div style="margin-bottom: 20px;color:#333;">
            {{ $t('automatedAllocation.deleteConfirmationTip') }}
        </div>
        <div slot="footer">
            <Button @click="deleteVisible=false">{{ $t("cancel") }}</Button>
            <Button type="primary" @click="deleteConfirm">{{ $t("confirm") }}</Button>
        </div>
        </Modal>

        <!-- 手动执行 确认 -->
        <Modal
            :visible.sync="manualExecutionVisible"
            :title="$t('automatedAllocation.ruleExecutionConfirmation')"
            width="500px"
            :append-to-body="true"
            :modal-append-to-body="false"
        >
        <div style="margin-bottom: 20px;color:#333;">
            <p style="margin-bottom:12px;">{{ $t('automatedAllocation.ruleExecutionConfirmationTip1') }}</p>
            <p>{{ $t('automatedAllocation.ruleExecutionConfirmationTip2') }}</p>
        </div>
        <div slot="footer">
            <Button @click="manualExecutionVisible=false">{{ $t("cancel") }}</Button>
            <Button type="primary" @click="enforceRulesConfirm">{{ $t("confirm") }}</Button>
        </div>
        </Modal>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import Sortable from 'sortablejs';
    export default {
        name: 'automated_allocation',
        components: {
        },
        props: ['triggerObjectValue'],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                window_height: 'window_height'
            }),
            tableHeight() {
                return this.window_height - 180;
            }
        },
        data() {
            return {
                loading: false,
                deleteVisible: false, // 删除确认
                manualExecutionVisible: false, // 手动确认
                objectList: [],
                value: '',
                tableColumns: [ // 表格 列数据
                    {
                        title: this.$t('automatedAllocation.priority'),
                        key: 'priority',
                        width: 80
                    },
                    {
                        title: this.$t('automatedAllocation.ruleName'),
                        key: 'ruleName',
                        width: 130
                    },
                    {
                        title: this.$t('automatedAllocation.triggerObject'),
                        key: 'triggerObjectName',
                        width: 80
                    },
                    {
                        title: this.$t('automatedAllocation.triggeringConditions'),
                        key: 'triggerConditionName',
                        width: 100
                    },
                    {
                        title: this.$t('automatedAllocation.targetRange'),
                        key: 'dataRange',
                        width: 130
                    },
                    {
                        title: this.$t('automatedAllocation.lastUpdated'),
                        key: 'updateTime',
                        width: 150
                    },
                    {
                        title: this.$t('automatedAllocation.operator'),
                        key: 'updateUser',
                        width: 100
                    },
                    {
                        title: this.$t('automatedAllocation.state'),
                        key: 'enabled',
                        width: 80
                    }
                ],
                list: [], // 列表
                boundEnd: 0,
                multipleSelection: [], // 列表勾选项
                deleteItem: null,
                deleteIndex: null,
                selectIds: [], // 选择执行规则ids
                selectedHtml: ''
            };
        },
        methods: {
            // 获取列表数据
            getPageList() {
                this.loading = true;
                util.ajaxJson({
                    url: '/rule/distribution/list',
                    method: 'POST',
                    data: {
                        userId: this.userId,
                        orgId: this.enterpriseId,
                        triggerObjectValue: this.value
                    }
                }).then(response => {
                    this.loading = false;
                    if (response.data.code === '1') {
                        this.list = response.data.data.map(item => {
                            item.enabled = Boolean(item.enabled);
                            return item;
                        });
                    }
                });
            },
            // 指定表格行 class name
            getRowClassName({ row, rowIndex }) {
                row.index = rowIndex;
                if (rowIndex % 2 === 0) {
                    return 'one_row_background';
                } else if (rowIndex % 2 === 1) {
                    return 'pair_row_background';
                }
                return '';
            },
            // 状态开关
            enableRuleById(val, row) {
                util.ajaxJson({
                    url: '/rule/distribution/updateEnable',
                    method: 'POST',
                    data: {
                        triggerObjectValue: this.value,
                        orgId: this.enterpriseId,
                        operateUserId: this.userId,
                        operateUserName: this.fullName,
                        id: row.id,
                        enabled: row.enabled ? 1 : 0
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$Message.success(this.$t('automatedAllocation.successfulOperation'));
                    } else if (response.data.code === '2') {
                        this.$Message.error(this.$t('automatedAllocation.ruleImplementing'));
                        row.enabled = !row.enabled;
                    } else {
                        this.$Message.error(this.$t('automatedAllocation.operationFailed'));
                        row.enabled = !row.enabled;
                    }
                }).catch(() => {
                    this.$Message.error(this.$t('automatedAllocation.requestFailedAgain'));
                    row.enabled = !row.enabled;
                });
            },
            // 切换触发对象
            triggerObjectChange() {
                this.getPageList();
            },
            // 新建规则
            addRulesBox() {
                this.updateCheck(1);
            },
            // 编辑规则
            editRulesBox(row) {
                this.updateCheck(2, row.id);
            },
            // 复制
            handleCopy(row) {
                util.ajaxJson({
                    url: '/rule/distribution/copy',
                    method: 'POST',
                    data: {
                        triggerObjectValue: this.value,
                        orgId: this.enterpriseId,
                        operateUserId: this.userId,
                        operateUserName: this.fullName,
                        id: row.id
                    }
                }).then(response => {
                    if (response.data.code === '10') {
                        this.$Message.success(this.$t('automatedAllocation.copySuccessfully'));
                        this.getPageList();
                    } else if (response.data.code === '2') {
                        this.$Message.error(this.$t('automatedAllocation.ruleImplementing'));
                    } else {
                        this.$Message.error(this.$t('automatedAllocation.copyFailed'));
                    }
                }).catch(() => {
                    this.loading = false;
                    this.$Message.error(this.$t('automatedAllocation.requestFailedAgain'));
                });
            },
            // 删除
            handleDelete(row, index) {
                this.deleteVisible = true;
                this.deleteItem = row;
                this.deleteIndex = index;
            },
            // 删除确认
            deleteConfirm() {
                util.ajaxJson({
                    url: '/rule/distribution/delete',
                    method: 'POST',
                    data: {
                        triggerObjectValue: this.value,
                        orgId: this.enterpriseId,
                        operateUserId: this.userId,
                        operateUserName: this.fullName,
                        id: this.deleteItem.id
                    }
                }).then(response => {
                    if (response.data.code === '8') {
                        this.list.splice(this.deleteIndex, 1);
                        this.$Message.success(this.$t('automatedAllocation.successfullyDeleted'));
                    } else if (response.data.code === '2') {
                        this.$Message.error(this.$t('automatedAllocation.ruleImplementing'));
                    } else {
                        this.$Message.error(this.$t('automatedAllocation.deleteFailed'));
                    }
                    this.deleteVisible = false;
                }).catch(() => {
                    this.loading = false;
                    this.$Message.error(this.$t('automatedAllocation.requestFailedAgain'));
                });
            },
            // 手动执行
            handleManualExecution(row) {
                if (row && !row.enabled) {
                    return;
                }
                this.selectIds = row ? [row.id] : this.multipleSelection.map(item => item.id);
                this.manualExecutionVisible = true;
            },
            // 执行规则确认
            enforceRulesConfirm() {
                util.ajaxJson({
                    url: '/rule/distribution/handExecute',
                    method: 'POST',
                    data: {
                        triggerObjectValue: this.value,
                        orgId: this.enterpriseId,
                        operateUserId: this.userId,
                        operateUserName: this.fullName,
                        ids: this.selectIds
                    }
                }).then(response => {
                    this.manualExecutionVisible = false;
                    if (response.data.code === '5') {
                        this.$Message.success(this.$t('automatedAllocation.setRulesTip'));
                    } else {
                        this.$Message.error(this.$t('automatedAllocation.existingRulesEnforced'));
                    }
                }).catch(() => {
                    this.loading = false;
                    this.$Message.error(this.$t('automatedAllocation.requestFailedAgain'));
                });
            },
            // 执行规则 接口调用
            enforceRules(ids) {
            },
            // 排序
            endFunc(e) {
                if (e.newIndex !== e.oldIndex) {
                    // 记录滚动条位置
                    const scrollTop = this.$refs.tableList.bodyWrapper.scrollTop;
                    // 获取原有顺序
                    const sortedArr = this.sortInstance.toArray();
                    sortedArr.splice(e.oldIndex, 0, ...sortedArr.splice(e.newIndex, 1));

                    this.loading = true;

                    // 保证 list_options 顺序和页面显示的选项顺序一致
                    this.list.splice(e.newIndex, 0, ...this.list.splice(e.oldIndex, 1));
                    // iview 3.4.2 升级到 viewUI 4.0.2 后, 上一句代码会导致排序成功但选项显示顺序错误
                    // 未找到原因, 这里先将选项置空再恢复, 能解决该 BUG
                    const temp = this.$deepClone(this.list);
                    this.list = [];
                    this.$nextTick(() => {
                        this.list = temp;
                        const strId = temp.map(item => item.id);
                        util.ajaxJson({
                            url: '/rule/distribution/updateOrder',
                            method: 'POST',
                            data: {
                                triggerObjectValue: this.value,
                                orgId: this.enterpriseId,
                                operateUserId: this.userId,
                                operateUserName: this.fullName,
                                ids: strId
                            }
                        }).then(response => {
                            if (response.data.code === '1') {
                                this.$Message.success(this.$t('automatedAllocation.successfulOperation'));
                                // 滚动条位置 保持上一次记录
                                this.$refs.tableList.bodyWrapper.scrollTop = scrollTop;
                            } else if (response.data.code === '12') {
                                this.$Message.error(this.$t('automatedAllocation.listDataChange'));
                                this.list.splice(e.oldIndex, 0, ...this.list.splice(e.newIndex, 1));
                            } else if (response.data.code === '2') {
                                this.$Message.error(this.$t('automatedAllocation.ruleImplementing'));
                                this.list.splice(e.oldIndex, 0, ...this.list.splice(e.newIndex, 1));
                            } else {
                                // 同样由于新版本, 此处不需要 this.sortInstance.sort(sortedArr), 加了会出错
                                this.list.splice(e.oldIndex, 0, ...this.list.splice(e.newIndex, 1));
                                this.$Message.error(this.$t('crm.UniSet.error_sortOption'));
                            }
                            this.loading = false;
                        }).catch(() => {
                            this.list.splice(e.oldIndex, 0, ...this.list.splice(e.newIndex, 1));
                            this.$Message.error(this.$t('crm.UniSet.error_sortOption'));
                            this.loading = false;
                        });
                    });
                }
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            // 获取列表上方触发对象
            getTriggerObjectList() {
                util.ajax({
                    url: '/rule/getTriggerObjectList',
                    method: 'GET',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.objectList = response.data.data.map((item) => {
                            // 翻译补充
                            return {
                                label: this.$te(`automatedAllocation.distributionRules.${item.value}`) ? this.$t(`automatedAllocation.distributionRules.${item.value}`) : item.label,
                                value: item.value
                            };
                        });
                        this.value = this.triggerObjectValue ? this.triggerObjectValue : 'mail';
                        this.getPageList();
                    }
                });
            },
            // 校验规则
            updateCheck(operType, ruleId) {
                util.ajax({
                    url: '/rule/distribution/updateCheck',
                    method: 'GET',
                    params: {
                        id: ruleId,
                        orgId: this.enterpriseId,
                        triggerObjectValue: this.value,
                        operType
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        // 新建、编辑 跳转
                        if (operType === 1) {
                            this.$emit('handleView', 'automaticAllocationRules', this.value);
                        } else {
                            this.$emit('handleView', 'automaticAllocationRules', this.value, ruleId);
                        }
                    } else if (response.data.code === '2') {
                        this.$Message.error(this.$t('automatedAllocation.ruleImplementing'));
                    } else if (response.data.code === '7') {
                        this.$Message.error(this.$t('automatedAllocation.ruleLimit100'));
                    } else {
                        this.$Message.error(this.$t('automatedAllocation.requestFailedAgain'));
                    }
                });
            }
        },
        created() {
            this.getTriggerObjectList();
        },
        mounted() {
            // 创建可排序列表
            const vm = this;
            this.sortInstance = Sortable.create(this.$refs.tableList.$el.querySelector('.el-table__body>tbody'), {
                group: {
                    name: 'list',
                    pull: true
                },
                handle: '.priority_icon',
                filter: '.unSortable',
                animation: 120,
                onEnd: vm.endFunc
            });
        },
        watch: {
            multipleSelection(val) {
                let v = this.$t('automatedAllocation.selected');
                v = v.replace('$field', `<span style="color: #FA8241;"> ${this.multipleSelection.length} </span>`);
                this.selectedHtml = v;
            }
        }
    };
</script>
<style lang="less" scoped>
    .automated_allocation{
        padding: 20px 30px 20px 0;

        .automated_allocation_header{
            margin-bottom: 12px;
            margin-left: 30px;

            h3{
                font-size: 16px;
                color: #333;
                margin-bottom: 0;
            }

            span{
                display: inline-block;
                font-size: 12px;
                color: #999;
                margin-left: 8px;
                font-weight: 400;
            }

            .header_select{
                display: flex;
                justify-content: space-between;
                margin-top: 12px;
            }

            .header_multiple_select{
                margin-top: 12px;
                color: #333;
                height: 36px;
                line-height: 36px;

                p{
                    display: inline-block;
                }

                /deep/ .el-button{
                    margin-right: 12px;
                    margin-left: 16px;
                    border: 1px solid #ABBFD5;
                    color: #333;

                    &:hover{
                        background: #fff;
                    }

                    &:focus{
                        background: #fff;
                    }
                }
            }
        }
        .noborder_table{
            color: #333;
            font-size: 14px;

            .row_mailbox{
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            /deep/.pair_row_background{
                background: #fff;
                height: 44px;
            }

            /deep/.one_row_background{
                background: #F7F8F9;
                height: 44px;
            }

            .table_operate{
                margin-left: -10px;
                span{
                    padding: 0 10px;
                    color: #3B78DE;
                    cursor: pointer;

                    &:hover{
                        color: #2D63BC;
                    }
                }
            }

            /deep/ tr{
                color: rgba(0, 0, 0, 0.8);;
            }

            /deep/ th:first-child{
                .cell {
                    padding-left: 30px;
                }
            }
            /deep/ td:first-child{
                .cell {
                    padding-left: 30px;
                }
            }

            /deep/ table.el-table__body tr.hover-row > td{
                background-color: #F3F4F5;
            }
        }
    }

</style>
