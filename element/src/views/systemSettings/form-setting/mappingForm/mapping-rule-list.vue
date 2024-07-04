<template>
    <div class="mapping-rule-list">
        <!-- 标题 -->
        <div class="mapping-rule-list-title">
            <div>
                <div style="font-size: 14px;color: #333;font-weight: bold;">{{ $t('formSet.title_mappingRuleList') }}</div>
                <span>{{ $t('formSet.tip_mappingRuleList') }}</span>
            </div>
            <Button type="primary"
                    @click="addRule">{{ $t('formSet.createMappingRule') }}</Button>
        </div>

        <!-- 规则列表 -->
        <Table :data="ruleList"
               v-loading="loading_table"
               size="medium"
               highlight-current-row
               ref="table"
               style="width: 100%"
               class="noborder-table">
            <!-- 正常列 -->
            <TableColumn v-for="item in tableColumns"
                         :key="item.key"
                         :prop="item.key"
                         :label="item.title"
                         :align="item.align"
                         :width="item.width"
                         :min-width="item.minWidth"
                         :show-overflow-tooltip="item.key !== 'conditionsShow'">
                <template slot-scope="scope">
                    <template v-if="item.key === 'conditionsShow'">
                        <div class="rule-conditionsShow">{{ scope.row[item.key] }}</div>
                    </template>
                    <template v-else-if="item.formatter">{{ (item.formatter)(scope.row) }}</template>
                    <template v-else>{{ scope.row[item.key] }}</template>
                </template>
            </TableColumn>

            <!-- 操作 -->
            <TableColumn :label="$t('formSet.operate')"
                         :width="80"
                         align="left"
                         :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <!-- 编辑 -->
                    <Icon custom="custom-field-edit"
                          :size="12"
                          @click="editRule(scope.row)"
                          class="cursor-pointer"></Icon>
                    <!-- 删除 -->
                    <Icon custom="custom-field-delete"
                          :size="12"
                          @click="remove(scope.$index, scope.row)"
                          class="margin-left-20 cursor-pointer"></Icon>
                </template>
            </TableColumn>
        </Table>

        <!-- 新增/编辑规则弹框 -->
        <Modal :visible.sync="visible_ruleModal"
               :title="$t(`formSet.${operateType}MappingRule`)"
               :append-to-body="true"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               width="800px"
               class="modal mappingRuleModal">
            <!-- title -->
            <div slot="title">
                <span style="line-height: 24px;font-size: 18px;color: #303133;">{{ $t(`formSet.${operateType}MappingRule`) }}</span>
                <span style="float: right; margin-right: -5px;">
                    <Icon type="md-close"
                          size="27"
                          @click.native="cancel_saveRule"
                          style="cursor: pointer;color: #677F99;"></Icon>
                </span>
            </div>

            <!-- 内容 -->
            <div>
                <!-- loading -->
                <Spin v-if="loading_saveRule"
                      fix></Spin>

                <!-- tip -->
                <div>{{ $t('formSet.tip_saveRule') }}</div>

                <!-- 规则名称 -->
                <div class="mappingRuleModal-name">
                    <span class="mappingRuleModal-label">{{ $t('formSet.label_ruleName') }}</span>
                    <Input v-model="ruleObj.ruleName"
                           size="small"
                           :maxlength="100"
                           show-word-limit></Input>
                </div>

                <!-- 设置条件 -->
                <div class="mappingRuleModal-conditionSet">
                    <span class="mappingRuleModal-label">{{ $t('formSet.label_condition') }}</span>
                    <div>
                        <!-- 条件逻辑连接词 -->
                        <div>{{ $t('formSet.tip_logicJoiner_1') }}
                            <Select v-model="ruleObj.logicJoiner">
                                <Option v-for="item in ['$or', '$and']"
                                        :key="item"
                                        :value="item"
                                        :label="$t(`formSet.logicJoiner_${item}`)"></Option>
                            </Select>
                            {{ $t('formSet.tip_logicJoiner_2') }}
                        </div>

                        <!-- 各个条件 -->
                        <div v-for="(condition, index) in ruleObj.conditionList"
                             :key="index"
                             class="mappingRuleModal-condition">
                            <!-- 条件类型 -->
                            <Select v-model="condition.type"
                                    @change="handleChangeCon_type(index)">
                                <Option v-for="item in conditionTypeList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"></Option>
                            </Select>

                            <!-- 条件运算符 -->
                            <Select v-model="condition.operator">
                                <Option v-for="item in conditionOperatorList.filter(operator => !((condition.type === 'formClassList') ^ ['$cons', '$ncons'].includes(operator.value)))"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"></Option>
                            </Select>

                            <!-- 条件内容 -->
                            <Input v-model="condition.content"
                                   size="small"
                                   :placeholder="condition.type ? $t(`formSet.placeholder_ruleCon_${condition.type}`) : ''"
                                   :maxlength="100"
                                   show-word-limit></Input>

                            <!-- 新增/删除规则 -->
                            <span v-if="index === 0"
                                  @click="addCondition">
                                <Icon class="custom custom-add-circle cursor-pointer"
                                      size="15"></Icon>
                            </span>
                            <span v-else
                                  @click="removeCondition(index)">
                                <Icon class="custom custom-reduce-circle cursor-pointer"
                                      size="15"></Icon>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- footer -->
            <div slot="footer">
                <Button @click="cancel_saveRule">{{ $t('crm.UniSet.modal_cancel') }}</Button>
                <Button type="primary"
                        :disabled="disable_saveRule"
                        @click="ok_saveRule"
                        class="piwik_mapping-rule-conditionRule-save">{{ $t('crm.UniSet.modal_ok') }}</Button>
            </div>
        </Modal>

        <!-- 删除规则确认框 -->
        <Modal :visible.sync="visible_deleteRule"
               :title="$t('formSet.deletePrompt')"
               :modal-append-to-body="false"
               width="30%">
            <!-- loading -->
            <Spin v-if="loading_deleteRule"
                  fix></Spin>

            <!-- 删除提示 -->
            <p v-if="related_mappingRules.length">{{ $t('formSet.tip_deleteRule').replace('$rules', str_relatedMappingRules) }}</p>
            <p v-else>{{ $t('formSet.tip_deleteRuleNoRelated') }}</p>

            <!-- 底部按钮 -->
            <span slot="footer"
                  class="dialog-footer">
                <Button @click="visible_deleteRule = false">{{ $t('cancel') }}</Button>
                <Button type="primary"
                        @click="deleteForm"
                        class="piwik_mapping-rule-conditionRule-delete">{{ $t('confirm') }}</Button>
            </span>
        </Modal>
    </div>
</template>

<script>
    import { formSetting } from '@/api/systemSettings/form-setting';
    import { mapState } from 'vuex';

    export default {
        name: 'mapping-rule-list',
        props: [
            'view'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                Lang: state => state.app.lang
            }),
            disable_saveRule() {
                if (this.ruleObj) {
                    // 名称为空校验
                    if (!this.ruleObj.ruleName.trim()) {
                        return true;
                    }
                    // 任一条件/所有条件 校验
                    if (!this.ruleObj.logicJoiner) {
                        return true;
                    }
                    // 条件列表内容为空校验
                    if (Array.isArray(this.ruleObj.conditionList)) {
                        if (!this.ruleObj.conditionList.length || !this.ruleObj.conditionList.every(item => item.type && item.operator && item.content)) {
                            return true;
                        }
                    } else {
                        return true;
                    }

                    // 通过校验, able 状态
                    return false;
                } else {
                    return true;
                }
            },
            // 删除生效规则弹框, 提示语中的"生效规则"部分
            str_relatedMappingRules() {
                let result = '';

                if (this.related_mappingRules.length) {
                    const tmpArr = this.related_mappingRules.slice();
                    const lastRule = tmpArr.pop();
                    let str_joiner = '，';
                    let str_and = '和';
                    let str_container = '【$item】';
                    if (this.Lang === 'en-US') {
                        str_joiner = ', ';
                        str_and = 'and';
                        str_container = '[$item]';
                    }

                    if (tmpArr.length) {
                        result = tmpArr.map(item => str_container.replace('$item', item)).join(str_joiner) + str_and + str_container.replace('$item', lastRule);
                    } else {
                        result = str_container.replace('$item', lastRule);
                    }
                }

                return result;
            }
        },
        data() {
            return {
                // 表格
                currRow: {},
                loading_table: false,
                ruleList: [],
                tableColumns: [
                    {
                        title: this.$t('formSet.ruleName'),
                        key: 'ruleName',
                        width: 300
                    },
                    {
                        title: this.$t('formSet.conditionsShow'),
                        key: 'conditionsShow'
                    },
                    {
                        title: this.$t('formSet.tableTitle2'),
                        key: 'updateTime',
                        width: 150,
                        formatter: row => {
                            return this.$options.filters.timeFormat(row.updateTime, 'DateTime');
                        }
                    }
                ],

                // 新增/编辑 规则弹框
                operateType: '',
                visible_ruleModal: false,
                loading_saveRule: false,
                conditionTypeList: [
                    {
                        label: this.$t('formSet.conditionType_page'),
                        value: 'page'
                    },
                    {
                        label: this.$t('formSet.conditionType_formId'),
                        value: 'formId'
                    },
                    {
                        label: this.$t('formSet.conditionType_formClassList'),
                        value: 'formClassList'
                    }
                ],
                conditionOperatorList: [
                    // $cons 是数组的'包含', $ma 是字符串的'包含'; $ncons 和 $nm 同上
                    {
                        label: this.$t('formSet.operator_$cons'),
                        value: '$cons'
                    },
                    {
                        label: this.$t('formSet.operator_$ncons'),
                        value: '$ncons'
                    },
                    {
                        label: this.$t('formSet.operator_$ma'),
                        value: '$ma'
                    },
                    {
                        label: this.$t('formSet.operator_$nm'),
                        value: '$nm'
                    },
                    {
                        label: this.$t('formSet.operator_$eq'),
                        value: '$eq'
                    },
                    {
                        label: this.$t('formSet.operator_$ne'),
                        value: '$ne'
                    }
                ],
                ruleObj: {
                    ruleName: '',
                    logicJoiner: '$or',
                    conditionList: [{
                        type: '',
                        operator: '',
                        content: '',
                        conditionList: []
                    }]
                },
                // 当前新增/编辑的规则的初始数据
                currRuleData: null,

                // 删除
                visible_deleteRule: false,
                loading_deleteRule: false,
                related_mappingRules: []
            };
        },
        methods: {
            // 获取表格数据
            refreshData() {
                this.loading_table = true;
                this.ruleList = [];
                formSetting.getMappingRuleList({
                    orgId: this.enterpriseId
                }).then(res => {
                    this.loading_table = false;
                    if (res.code === '1') {
                        this.ruleList = res.data;
                    }
                }).catch(() => {
                    this.loading_table = false;
                });
            },
            handleRowData(rowData) {
                const result = {
                    id: rowData.id,
                    ruleName: rowData.ruleName || '',
                    logicJoiner: '$or',
                    conditionList: [{
                        type: '',
                        operator: '',
                        content: ''
                    }]
                };

                const { conditionsJson } = rowData;
                try {
                    const conditionObj = JSON.parse(conditionsJson);
                    result.logicJoiner = Object.keys(conditionObj)[0];

                    const conditionList = Object.values(conditionObj)[0];
                    result.conditionList = conditionList.map(item => {
                        const tmp = {
                            type: '',
                            operator: '',
                            content: ''
                        };

                        Object.entries(item).some(([key, value]) => {
                            tmp.type = key;
                            tmp.operator = Object.keys(value)[0];
                            tmp.content = value[tmp.operator];

                            return true;
                        });

                        return tmp;
                    });
                } catch (e) {
                    console.error(e);
                }

                return result;
            },

            // 新增/编辑规则弹框
            handleChangeCon_type(index) {
                if (this.ruleObj.conditionList[index].type === 'formClassList') {
                    this.ruleObj.conditionList[index].operator = '$cons';
                } else {
                    this.ruleObj.conditionList[index].operator = '$ma';
                }
                this.ruleObj.conditionList[index].content = '';
            },
            addRule() {
                this.operateType = 'add';
                this.ruleObj = {
                    ruleName: '',
                    logicJoiner: '$or',
                    conditionList: [{
                        type: '',
                        operator: '',
                        content: ''
                    }]
                };
                this.currRuleData = this.$deepClone(this.ruleObj);
                this.visible_ruleModal = true;
            },
            editRule(row) {
                this.operateType = 'edit';
                this.ruleObj = this.handleRowData(row);
                this.currRuleData = this.$deepClone(this.ruleObj);
                this.visible_ruleModal = true;
            },
            addCondition() {
                // 最多允许包括 20 个条件, 达到上限则不允许继续添加
                if (this.ruleObj.conditionList.length >= 20) {
                    this.$Message.warning(this.$t('formSet.warn_ruleConditionLength'));
                    return;
                }

                // 正常添加条件
                this.ruleObj.conditionList.push({
                    type: '',
                    operator: '',
                    content: ''
                });
            },
            removeCondition(index) {
                this.ruleObj.conditionList.splice(index, 1);
            },
            ok_saveRule() {
                // 数据校验
                // 名称为空校验
                if (!this.ruleObj.ruleName.trim()) {
                    this.$Message.error(this.$t('formSet.error_emptyRuleName'));
                    return;
                }
                // 任一条件/所有条件 校验
                if (!this.ruleObj.logicJoiner) {
                    this.$Message.error(this.$t('formSet.error_emptyCondition'));
                    return;
                }
                // 条件列表内容为空校验
                if (this.ruleObj.conditionList.length && !this.ruleObj.conditionList.every(item => item.type && item.operator && item.content)) {
                    this.$Message.error(this.$t('formSet.error_emptyCondition'));
                    return;
                }

                // 数据格式化
                const tmpConditionObj = {};
                let conditionsShow = this.ruleObj.logicJoiner === '$and' ? this.$t('formSet.satisfyAllConditions') : this.$t('formSet.satisfyOneConditions');
                const showList = [];
                tmpConditionObj[this.ruleObj.logicJoiner] = this.ruleObj.conditionList.map(item => {
                    const tmp = {};
                    tmp[item.type] = {};
                    tmp[item.type][item.operator] = item.content;

                    showList.push(`${this.$t(`formSet.conditionType_${item.type}`)} ${this.$t(`formSet.operator_${item.operator}`)} ${item.content}`);

                    return tmp;
                });
                conditionsShow += `: ${showList.join('; ')}`;
                const postData = {
                    orgId: this.enterpriseId,
                    id: this.ruleObj.id,
                    ruleName: this.ruleObj.ruleName.trim(),
                    ruleOperator: this.ruleObj.logicJoiner === '$and' ? 1 : 2,
                    conditionsJson: JSON.stringify(tmpConditionObj),
                    conditionsShow,
                    createUser: `${this.userId}-${this.userName}`
                };

                // 发送请求
                this.loading_saveRule = true;
                formSetting.saveMappingRule(postData).then(res => {
                    switch (res.code) {
                        case '1':
                            // 成功
                            this.refreshData();
                            this.visible_ruleModal = false;
                            this.$Message.success(this.$t('formSet.success_saveRule'));
                            break;
                        case '-1':
                            // 名称重复
                            this.$Message.error(this.$t('formSet.error_saveRuleForRepeatName'));
                            break;
                        default:
                            // 失败
                            this.$Message.error(this.$t('formSet.error_saveRule'));
                    }
                    this.loading_saveRule = false;
                });
            },
            // 关闭弹框前, 判断是否需要弹出离开确认框
            cancel_saveRule() {
                // 如果当前数据与初始数据相同, 直接关闭, 退出流程
                if (JSON.stringify(this.ruleObj) === JSON.stringify(this.currRuleData)) {
                    this.confirm_cancelSave();
                    return;
                }

                // 打开离开确认框
                this.$confirm(this.$t('formSet.tip_cancelSaveRule'), this.$t('formSet.title_cancelSaveRule'), {
                    customClass: 'leaveConfirmMsgBox'
                }).then(() => {
                    this.confirm_cancelSave();
                }).catch(() => {});
            },
            // 关闭弹框
            confirm_cancelSave() {
                this.loading_saveRule = false;
                this.visible_ruleModal = false;
            },

            // 删除规则弹框
            remove(index, row) {
                this.currRow = row;
                this.loading_deleteRule = true;
                this.visible_deleteRule = true;
                this.getRelatedRules();
            },
            // 获取被删除规则关联的映射规则(目前只取映射规则 name 用于删除弹框提示)
            getRelatedRules() {
                this.related_mappingRules = [];
                this.loading_deleteRule = true;
                formSetting.getDeleteRelatedRule({
                    orgId: this.enterpriseId,
                    ruleId: this.currRow.id
                }).then(res => {
                    if (res.code === '1' && Array.isArray(res.data)) {
                        this.related_mappingRules = res.data.map(item => item.relationName);
                    }
                    this.loading_deleteRule = false;
                });
            },
            deleteForm() {
                this.loading_deleteRule = true;
                formSetting.deleteMappingRule({
                    orgId: this.enterpriseId,
                    ruleId: this.currRow.id
                }).then(res => {
                    if (res.code === '1') {
                        this.refreshData();
                        this.visible_deleteRule = false;
                        this.$Message.success(this.$t('deleteSuccess'));
                    } else {
                        this.$Message.error(this.$t('deleteFail'));
                    }
                    this.loading_deleteRule = false;
                });
            }
        },
        watch: {
            view: {
                handler(val) {
                    if (val === 'mappingFormList') {
                        this.refreshData();
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less" scoped>
    .mapping-rule-list {
        margin: 20px 0;

        &-title {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 10px;
            margin-bottom: 10px;
            height: 59px;

            /deep/ span {
                font-size: 12px
            }
        }
    }
</style>

<style lang="less">
    .rule-conditionsShow {
        white-space: break-spaces;
        max-height: 100px;
        overflow: auto;
    }

    .mappingRuleModal {
        .el-dialog__body {
            max-height: 470px;
        }

        &-name, &-conditionSet {
            display: flex;
            margin: 20px 0;

            > div {
                flex: 1;
            }
        }

        &-label {
            width: 110px;
        }

        &-condition {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 15px 0;

            > div {
                &:nth-child(1) {
                    flex-basis: 30%;
                }

                &:nth-child(2) {
                    flex-basis: 15%;
                }

                &:nth-child(3) {
                    flex-basis: 45%;
                }
            }
        }
    }

    .leaveConfirmMsgBox {
        padding: 5px 5px 20px;
    }
</style>
