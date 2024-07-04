<template>
    <div class="automation-rule">
        <p class="automation-rule-title">
            {{ $t('systemNotice.name') }}
            <Button type="primary"
                    icon="ivu-icon ivu-icon-plus"
                    @click="handleAdd"
                    style="float:right;">{{ $t('systemNotice.add') }}</Button>
        </p>

        <!-- 自定义分配规则 -->
        <Table :data="tableData"
               v-loading="loading"
               ref="table"
               class="noborder-table">
                         <!-- :align="item.align" -->
            <TableColumn v-for="item in columnsList"
                         :key="item.key"
                         :prop="item.key"
                         :label="item.title"
                         :width="item.width"
                         :min-width="item.width || 64"
                         :formatter="item.formatter"
                         :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <template v-if="item.key === 'instruction'">
                        <Tooltip :content="scope.row.instruction ? scope.row.instruction : '#'"
                                 placement="top">
                            <Icon custom="custom-rule-table-instructions"
                                  :size="16"></Icon>
                        </Tooltip>
                    </template>
                    <template v-else-if="item.key === 'enabled'">
                        <!-- 1是启用，0是关闭 -->
                        <el-switch :value="scope.row.enabled === 1"
                                   @change="updateRuleStatus(scope.row.id, scope.row.type, scope.row.enabled, scope.$index)"></el-switch>
                    </template>
                    <template v-else-if="item.key === 'operate'">
                        <!-- type=1是默认规则,2是自定义 -->
                        <div v-if="scope.row.type === 1">-</div>
                        <div v-else>
                            <Icon custom="custom-field-edit"
                                  :size="12"
                                  @click.native="handleEdit(scope.row.id)"
                                  style="cursor: pointer;"></Icon>
                            <Icon custom="custom-field-delete"
                                  :size="12"
                                  @click.native="$confirm(`${$t('systemNotice.deleteContent')}${scope.row.ruleName}？`, $t('systemNotice.deleteTitle'), {
                                                    showCancelButton: true,
                                                    confirmButtonText: $t('confirm'),
                                                    cancelButtonText: $t('cancel'),
                                                    beforeClose: (action, instance, done) => {
                                                        if (action === 'confirm') {
                                                            instance.confirmButtonLoading = true;
                                                            handleCancel(scope.row.id, instance, done)
                                                        } else {
                                                            done();
                                                        }
                                                    }
                                                })"
                                  style="cursor: pointer;margin-left: 18px;"></Icon>
                        </div>
                    </template>
                    <template v-else-if="item.formatter">{{ (item.formatter)(scope.row) }}</template>
                    <template v-else>{{ scope.row[item.key] }}</template>
                </template>
            </TableColumn>
        </Table>

        <!-- 这里使用"v-if"是为了复用modal时清空数据 -->
        <AddRuleModal v-if="addModalShow"
                      :tableData="tableData"
                      :ruleId="ruleId"
                      :addModalShow="addModalShow"
                      @isRefreshTable="isRefreshTable"
                      @modalState="state => addModalShow = state"></AddRuleModal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import AddRuleModal from './components/add_rule_modal.vue';
    import { noticeSetting } from '@/api/systemSettings/auto-settings/index'; // 引入统一接口文件
    const { getRuleListAllByOrgId, deleteRuleById, updateRuleStatus } = noticeSetting;

    export default {
        components: {
            AddRuleModal
        },
        name: 'notice_setting',
        data() {
            return {
                loading: true,
                addModalShow: false,
                currentIndex: '', // 点击删除时的序号
                currentId: '', // 点击删除时的id
                columnsList: [
                    {
                        title: this.$t('systemNotice.ruleName'),
                        key: 'ruleName',
                        align: 'left'
                    },
                    {
                        title: this.$t('systemNotice.relationObj'),
                        key: 'relationObj',
                        align: 'left'
                    },
                    {
                        title: this.$t('systemNotice.effectAction'),
                        key: 'effectAction',
                        align: 'left',
                        width: 150
                    },
                    {
                        title: this.$t('systemNotice.instruction'),
                        key: 'instruction',
                        align: 'left',
                        width: 100
                    },
                    {
                        title: this.$t('systemNotice.createUser'),
                        key: 'createUser',
                        align: 'left'
                    },
                    {
                        title: this.$t('systemNotice.createTime'),
                        key: 'createTime',
                        align: 'left',
                        width: 160,
                        formatter: row => {
                            return row.type === 1 ? '-' : row.createTime;
                        }
                    },
                    {
                        title: this.$t('systemNotice.enabled'),
                        key: 'enabled',
                        align: 'left'
                    },
                    {
                        title: this.$t('systemNotice.operate'),
                        key: 'operate',
                        align: 'left',
                        width: 140
                    }
                ],
                tableData: [], // 表格数据
                modalSwitch: true, // 提交规则时是否启用规则
                statusList: [], // 规则是否启用状态
                ruleId: null
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId
            }) // 从 vuex 中获取属性
        },
        methods: {
            /** 默认规则和自定义规则(合并为同一个接口了) */
            getRuleListAllByOrgId() {
                // 调用默认规则和自定义规则接口
                getRuleListAllByOrgId({
                    orgId: this.enterpriseId
                }).then(data => {
                    if (data.code === '1') {
                        // 存默认规则
                        const defaultList = data.data.default.map(item =>{
                            item.createUser = ['12200', '10110'].includes(this.enterpriseId) ? '星谷' : item.createUser;
                            return item;
                        });
                        // 存自定义规则
                        const customList = data.data.custom;
                        // 默认规则和自定义规则拼接
                        this.tableData = defaultList.concat(customList);
                        // 取消loading效果
                        this.loading = false;
                    }
                });
            },
            /** 更新规则启用状态 */
            updateRuleStatus(id, type, enabled, index) {
                let url = '';
                if (type === 1) { // 默认规则
                    url = '/rule/message/enableDefaultRuleById'; // 启用
                    if (enabled === 1) {
                        url = '/rule/message/disableDefaultRuleById'; // 停用
                    }
                } else { // 自定义规则
                    url = '/rule/message/enableRuleById'; // 启用
                    if (enabled === 1) {
                        url = '/rule/message/disableRuleById'; // 停用
                    }
                }
                // 调用更新规则启用状态接口
                updateRuleStatus({
                    url,
                    params: {
                        orgId: this.enterpriseId,
                        ruleId: id
                    }
                }).then(data => {
                    if (data.code === '1') {
                        if (enabled === 1) {
                            this.$Message.success(this.$t('systemNotice.disabledSucc'));
                            this.tableData[index].enabled = 0;
                        } else {
                            this.$Message.success(this.$t('systemNotice.enabledSucc'));
                            this.tableData[index].enabled = 1;
                        }
                    } else {
                        // 规则停用失败或启用失败时重新获取规则列表
                        if (enabled === 1) {
                            this.$Message.error(this.$t('systemNotice.disabledFail'));
                            this.getRuleListAllByOrgId();
                        } else {
                            this.$Message.error(this.$t('systemNotice.enabledFail'));
                            this.getRuleListAllByOrgId();
                        }
                    }
                });
            },
            /** 添加规则 */
            handleAdd() {
                this.ruleId = null;
                this.addModalShow = true;
            },
            /** 编辑规则 */
            handleEdit(id) {
                this.ruleId = id;
                this.addModalShow = true;
            },
            /** 删除规则 */
            handleCancel(id, instance, done) {
                // 调用删除规则接口
                deleteRuleById({
                    ruleId: id
                }).then(data => {
                    if (data.code === '1') {
                        done();
                        this.$Message.success(this.$t('deleteSuccess'));
                        // 重新获取自动化规则数据
                        this.getRuleListAllByOrgId();
                    } else {
                        this.$Message.error(this.$t('deleteFail'));
                    }
                    instance.confirmButtonLoading = false;
                });
            },
            /** 子组件传入是否刷新规则表格 */
            isRefreshTable(key) {
                if (key) {
                    // 添加规则组件保存成功后,重新获取数据
                    this.getRuleListAllByOrgId();
                }
            }
        },
        created() {
            // 获取全部自动化规则
            this.getRuleListAllByOrgId();
        }
    };
</script>

<style lang="less">
    .automation-rule {
        padding: 30px;

        .automation-rule-title {
            margin-bottom: 20px;
            font-size: 16px;
            // color: rgba(0,0,0,0.80);
            color: #2d2f2e;
            font-weight: 500;
        }
    }
</style>
