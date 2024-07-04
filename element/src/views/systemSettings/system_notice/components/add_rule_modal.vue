<template>
    <Modal :visible="addModalShow"
           :title="$t('systemNotice.addRule.name')"
           :show-close="false"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           :append-to-body="true"
           :modal-append-to-body="false"
           width="630px"
           v-loading="getLoading"
           class="ruleModal">
        <div style="position: relative;overflow-x: visible;overflow-y:auto;max-height:58vh;min-height: 250px">
            <!-- 名称 -->
            <div class="modal-item">
                <Row>
                    <Col :span="5"
                         style="line-height:30px;color:#495060">{{ $t('systemNotice.ruleName') }}：</Col>
                    <Col :span="19">
                        <Input v-model="name"></Input>
                    </Col>
                </Row>
            </div>
            <!-- 关联对象 -->
            <div class="modal-item">
                <Row>
                    <Col :span="5"
                         style="line-height:30px;color:#495060">{{ $t('systemNotice.relationObj') }}：</Col>
                    <Col :span="19">
                        <Select v-model="currentAssociationId"
                                @change="handleAssociationChange">
                            <Option v-for="item in associationList"
                                    :key="item.id"
                                    :value="item.id"
                                    :label="item.fullname"></Option>
                        </Select>
                    </Col>
                </Row>
            </div>
            <!-- 对象类型 -->
            <div class="modal-item">
                <Row>
                    <Col :span="5"
                         style="line-height:30px;color:#495060">
                        {{ $t('systemNotice.addRule.objType') }}：
                    </Col>
                    <Col :span="19">
                        <Select v-model="objTypeId"
                                @change="handleobjTypeChange">
                            <Option v-for="item in objTypeList"
                                    :key="item.id"
                                    :value="item.id"
                                    :label="item.cname"></Option>
                        </Select>
                    </Col>
                </Row>
            </div>
            <!-- 生效机制 -->
            <div class="modal-item">
                <Row>
                    <Col :span="5"
                         style="line-height:30px;color:#495060">{{ $t('systemNotice.effectAction') }}：</Col>
                    <Col :span="19">
                        <Select v-model="currentTriggerRuleId"
                                @change="handleTriggerRuleChange">
                            <Option v-for="item in triggerRuleList"
                                    :key="item.id"
                                    :value="item.id"
                                    :label="item.fullname"></Option>
                        </Select>
                    </Col>
                </Row>
            </div>
            <!-- 自动化规则 - 开关 -->
            <div class="modal-item">
                <Row>
                    <Col :span="5"
                         style="line-height:30px;color:#495060">{{ $t('systemNotice.addRule.setDetailRule') }}：</Col>
                    <Col :span="19">
                        <el-switch v-model="isDetailedRules"
                                   :disabled="disableDetailedRule"></el-switch>
                    </Col>
                </Row>
            </div>
            <!-- 自动化规则 - 规则框 -->
            <div v-if="isDetailedRules"
                 class="modal-item">
                <div v-for="(item, index) in detailedRules"
                     :key="index"
                     class="ruleContent">
                    <Dropdown @command="handleChangeCondition(index, $event)"
                              class="relationshipIcon">
                        <span>
                            {{ item.ruleList.relationship === 'and' ? $t('and') : $t('or') }}
                            <Icon type="arrow-down-b"></Icon>
                        </span>
                        <DropdownMenu slot="dropdown">
                            <DropdownItem command="and">{{ $t('and') }}</DropdownItem>
                            <DropdownItem command="or">{{ $t('or') }}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <div v-for="(i, j) in item.ruleList.conditionList"
                         :key="j"
                         style="margin-bottom:10px">
                        <Row :gutter="8">
                            <Col :span="22">
                                <component :is="searchView"
                                           :conditionObj="i"
                                           :dateformat="dateformat"
                                           :objTypeId="objTypeId"
                                           @searchChange="handleSearchChange(index,j,$event)"></component>
                            </Col>
                            <Col :span="2">
                                <Icon v-if="!(index === 0 && j === 0)"
                                      type="minus-circled"
                                      color="#FA8241"
                                      size="17"
                                      @click.native="handleRemove(index,j)"
                                      style="cursor:pointer;padding:6px 0"></Icon>
                            </Col>
                        </Row>
                    </div>
                    <Button type="dashed"
                            icon="ivu-icon ivu-icon-plus-round"
                            @click="handleAddCondition(index)">{{ $t('systemNotice.addRule.addCondition') }}</Button>
                    <div v-show="detailedRules[index + 1]"
                         class="rulesRelationship">
                        <Dropdown @command="handleChangeRule(index, $event)"
                                  class="relationshipIcon">
                            <span>
                                {{ item.relationship === "and" ? $t('and') : $t('or') }}
                                <Icon type="arrow-down-b"></Icon>
                            </span>
                            <DropdownMenu slot="dropdown">
                                <DropdownItem command="and">{{ $t('and') }}</DropdownItem>
                                <DropdownItem command="or">{{ $t('or') }}</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
                <div style="margin:10px 0">
                    <Button type="dashed"
                            icon="ivu-icon ivu-icon-plus-round"
                            @click="handleAddRule">{{ $t('systemNotice.addRule.addRule') }}</Button>
                </div>
            </div>
            <!-- 规则说明 -->
            <div class="modal-item">
                <Row>
                    <Col :span="5"
                         style="line-height:30px;color:#495060">{{ $t('systemNotice.addRule.description') }}：</Col>
                    <Col :span="19">
                        <Input v-model="description"
                               type="textarea"
                               :autosize="{minRows: 2, maxRows: 5}"></Input>
                    </Col>
                </Row>
            </div>
            <!-- 通知类型 - 选择 -->
            <div class="modal-item">
                <Row>
                    <Col :span="5"
                         style="line-height:30px;color:#495060">{{ $t('systemNotice.addRule.actionType') }}：</Col>
                    <Col :span="19">
                        <Select v-model="remindTypeId"
                                @change="handleRemindTypeChange">
                            <Option v-for="item in remindTypeList"
                                    :key="item.id"
                                    :value="item.id"
                                    :label="item.fullname"></Option>
                        </Select>
                    </Col>
                </Row>
            </div>
            <!-- 通知类型: 系统通知 -->
            <template v-if="remindTypeId === 1">
                <!-- 接收人 -->
                <div class="modal-item">
                    <Row>
                        <Col :span="5"
                             style="line-height:30px;color:#495060">{{ $t('systemNotice.addRule.recipient') }}：</Col>
                        <Col :span="5">
                            <Select v-model="category"
                                    @change="handleCategoryChange">
                                <Option v-for="item in categoryList"
                                        :key="item.type"
                                        :value="item.type"
                                        :label="item.name"></Option>
                            </Select>
                        </Col>
                        <Col :span="13"
                             :offset="1">
                            <Select v-model="recipients"
                                    multiple
                                    filterable>
                                <Option v-for="item in recipientList"
                                        :key="item.id"
                                        :value="item.id"
                                        :label="item.fullname"></Option>
                            </Select>
                        </Col>
                    </Row>
                </div>
                <!-- 提醒内容 -->
                <div class="modal-item">
                    <Row>
                        <Col :span="5"
                             style="line-height:30px;color:#495060">
                            {{ $t('systemNotice.addRule.remindContent') }}：
                        </Col>
                        <Col :span="19">
                            <Input v-model="remindContent"
                                   type="textarea"
                                   :autosize="{minRows: 2, maxRows: 5}"
                                   id="remindInput"></Input>
                            <Dropdown trigger="click"
                                      placement="bottom-start"
                                      @command="insertCharacter">
                                <Button style="margin-top:10px">{{ $t('systemNotice.addRule.insertFields') }}</Button>
                                <DropdownMenu slot="dropdown">
                                    <DropdownItem v-for="(item, index) in insertFieldsList"
                                                    :key="index"
                                                  :command="item.name">{{ item.fullname }}</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </Col>
                    </Row>
                </div>
            </template>
            <!-- 通知类型: 发邮件 -->
            <template v-else-if="remindTypeId === 2">
                <!-- 发件人邮箱 -->
                <div class="modal-item">
                    <Row>
                        <Col :span="5"
                             style="line-height:30px;color:#495060">{{ $t('systemNotice.addRule.sender') }}：</Col>
                        <Col :span="19">
                            <Select v-model="mailAddressId"
                                    filterable
                                    @change="handleMailAddressChange">
                                <Option v-for="item in mailAddressList"
                                        :key="item.id"
                                        :value="item.id"
                                        :label="item.bindingAddress"></Option>
                            </Select>
                        </Col>
                    </Row>
                </div>
                <!-- 邮件模板 -->
                <div class="modal-item">
                    <Row>
                        <Col :span="5"
                             style="line-height:30px;color:#495060">{{ $t('systemNotice.addRule.mailTemplate') }}：</Col>
                        <Col :span="19">
                            <Select v-model="mailTemplet">
                                <Option v-for="item in MailTempletList"
                                        :key="item.mailTempletId"
                                        :value="item.mailTempletId"
                                        :label="item.mailTempletTitle"></Option>
                            </Select>
                        </Col>
                    </Row>
                </div>
                <!-- 表单同步到发件人 -->
                <div class="modal-item">
                    <Row>
                        <Col :span="5"
                             style="line-height:30px;color:#495060">{{ $t('systemNotice.addRule.isSynchronize') }}：</Col>
                        <Col :span="19"
                             style="line-height:30px;">
                            <RadioGroup v-model="isSynchronize">
                                <Radio :label="$t('yes')"></Radio>
                                <Radio :label="$t('no')"></Radio>
                            </RadioGroup>
                        </Col>
                    </Row>
                </div>
            </template>
        </div>

        <div slot="footer">
            <Button @click="$emit('modalState',false)">{{ $t('cancel') }}</Button>
            <Button type="primary"
                    :loading="saveLoading"
                    @click="handleSave">{{ $t('confirm') }}</Button>
        </div>
    </Modal>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import inquirySearch from './inquiry_search';
    import clueSearch from './clue_search';
    import customerSearch from './customer_search';
    import followUpSearch from './follow_up_search';
    import websiteMsgSearch from './website_msg_search';
    import fbMessageSearch from './fb_message_search';

    export default {
        name: 'add_rule_modal',
        props: {
            addModalShow: {
                type: Boolean,
                default: false
            },
            ruleId: {
                type: Number,
                default: null
            },
            tableData: Array
        },
        components: {
            inquirySearch,
            clueSearch,
            customerSearch,
            followUpSearch,
            websiteMsgSearch,
            fbMessageSearch
        },
        data() {
            return {
                ruleShow: false, // 判断是显示规则还是编辑规则,true-显示  false-编辑
                getLoading: false, // 加载规则loading
                saveLoading: false, // 保存规则时loading
                name: '',
                associationList: [], // 关联对象列表
                currentAssociation: null, // 当前关联对象
                currentAssociationId: null, // 当前关联对象id
                objTypeIndex: null, // 当前对象类型索引
                objTypeId: '', // 当前对象id
                objTypeList: [], // 对象类型列表
                formTempList: [],
                triggerRuleList: [], // 生效机制列表
                currentTriggerRule: null, // 当前生效机制
                currentTriggerRuleId: null, // 当前生效机制id
                category: null,
                categoryList: [], // 接收人类别；列表
                recipients: [],
                recipientList: [], // 接收人列表
                remindContent: '',
                insertFieldsList: [], // 插入字段列表
                contentList: [], // 选中的插入字段列表
                description: null, // 规则说明
                isDetailedRules: false, // 是否设置细分规则
                disableDetailedRule: true, // 是否禁用规则
                detailedRules: [ // 细分规则区域
                    {
                        relationship: 'or',
                        ruleList: {
                            relationship: 'and',
                            conditionList: [
                                {
                                    condition1: null,
                                    condition2: null,
                                    condition3: null
                                }
                            ]
                        }
                    }
                ],
                allUserList: [], // 企业所有人员列表
                searchView: '', // 细分规则组件
                conditionsList: [], // 细分规则内容
                conditionsJson: null, // 拼接细分规则
                canRuleSave: true, // 规则完整度校验
                canSave: true,
                ruleDetail: {}, // 规则详情
                remindTypeList: [], // 通知类型列表
                remindTypeId: '', // 当前通知类型id
                remindType: '', // 当前通知类型
                mailAddressList: [], // 发件人列表
                mailAddressId: null, // 选中发件人邮箱id
                mailAddress: '', // 选中发件人邮箱
                mailUserId: '', // 选中发件人userid
                MailTempletList: [], // 邮件模板列表
                mailTemplet: '', // 选中邮件模板
                isSynchronize: this.$t('no') // 是否同步
            };
        },
        computed: {
            allRulesName() {
                return this.tableData.map(v => (v.ruleName || '').trim());
            },
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                fullName: state => state.fullName,
                allUsers: state => state.crm.allUsers // 全部用户
            }) // 从 vuex 中获取属性
        },
        methods: {
            /* 格式化日期 */
            dateformat() {
                Date.prototype.format = function(fmt) {
                    const o = {
                        'M+': this.getMonth() + 1, // 月份
                        'd+': this.getDate(), // 日
                        'h+': this.getHours(), // 小时
                        'm+': this.getMinutes(), // 分
                        's+': this.getSeconds(), // 秒
                        'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
                        S: this.getMilliseconds() // 毫秒
                    };
                    if (/(y+)/.test(fmt)) {
                        fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()
                        }`).substr(4 -
                            RegExp.$1.length));
                    }
                    for (const k in o) {
                        if (new RegExp(`(${k})`).test(fmt)) {
                            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
                                ? (o[k])
                                : ((`00${o[k]}`).substr((`${o[k]}`).length)));
                        }
                    }
                    return fmt;
                };
            },
            /** 获取规则详情 */
            getRuleById() {
                this.getLoading = true;
                util.ajax({
                    url: '/rule/message/getRuleById',
                    method: 'GET',
                    params: {
                        ruleId: this.ruleId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.ruleDetail = response.data.data;
                        const rule = response.data.data;
                        this.name = rule.ruleName;
                        this.currentAssociationId = rule.relationObjType;
                        this.handleAssociationChange(rule.relationObjType);
                        this.currentAssociation = rule.relationObj;
                        this.objTypeId = rule.objType;
                        this.handleobjTypeChange(rule.objType);
                        this.currentTriggerRuleId = rule.effectActionType;
                        this.handleTriggerRuleChange(rule.effectActionType);
                        this.currentTriggerRule = rule.effectAction;
                        if (rule.conditionsList) {
                            this.isDetailedRules = true;
                            this.disableDetailedRule = false;
                            this.detailedRules = JSON.parse(rule.conditionsList);
                        }
                        this.description = rule.instruction;
                        this.remindTypeId = rule.remindType;
                        this.remindType = rule.remindName;
                        if (rule.remindType === 1) {
                            this.category = rule.recipient;
                            this.handleCategoryChange(rule.recipient);
                            this.recipients = JSON.parse(rule.recipientList);
                            this.remindContent = rule.remindContent;
                            this.contentList = JSON.parse(rule.contentList);
                        } else if (rule.remindType === 2) {
                            this.handleRemindTypeChange(rule.remindType);
                            this.mailUserId = rule.senderUserId;
                            this.mailAddress = rule.senderMailbox;
                            this.mailAddressId = rule.senderMailboxId;
                            this.mailTemplet = rule.emailTemplate;
                            this.isSynchronize = rule.isSynchronize === 1 ? this.$t('yes') : this.$t('no');
                        }
                        setTimeout(() => {
                            this.getLoading = false;
                        }, 500);
                    } else {
                        this.$Message.error(this.$t('systemNotice.addRule.getRuleFail'));
                    }
                });
            },
            /** 获取关联对象 */
            getAssociatedObjList() {
                return new Promise((resolve) => {
                    util.ajax({
                        url: '/rule/message/getAssociatedObjList',
                        method: 'GET'
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.associationList = response.data.data;
                        }
                        resolve(true);
                    });
                });
            },
            /** 切换关联对象 */
            handleAssociationChange(id) {
                this.currentAssociationId = id;
                for (const item of this.associationList) {
                    if (item.id === id) {
                        this.currentAssociation = item.fullname;
                    }
                }
                if (!this.ruleShow) {
                    this.disableDetailedRule = true;
                    this.isDetailedRules = false;
                    this.currentTriggerRuleId = null;
                    this.category = null;
                    this.recipients = [];
                    this.remindContent = '';
                    this.contentList = [];
                    this.detailedRules = [
                        {
                            relationship: 'or',
                            ruleList: {
                                relationship: 'and',
                                conditionList: [
                                    {
                                        condition1Key: null,
                                        condition1: null,
                                        condition2: null,
                                        condition3: null
                                    }
                                ]
                            }
                        }
                    ];
                }
                switch (id) {
                    case 1: // 线索
                        this.objTypeList = [{
                            id: '1',
                            cname: '线索'
                        }];
                        this.handleobjTypeChange('1');
                        break;
                    case 2: // 询盘
                        this.objTypeList = [{
                            id: '2',
                            cname: '询盘'
                        }];
                        this.handleobjTypeChange('2');
                        break;
                    case 3: // 客户
                        this.objTypeList = [{
                            id: '3',
                            cname: '客户'
                        }];
                        this.handleobjTypeChange('3');
                        break;
                    case 4: // 跟进记录
                        this.objTypeList = [{
                            id: '4',
                            cname: '跟进记录'
                        }];
                        this.handleobjTypeChange('4');
                        break;
                    case 5: // 表单
                        this.objTypeList = this.formTempList;
                        this.objTypeId = '';
                        break;
                    default:
                        this.objTypeList = [];
                }
                this.geActionList();
                this.getInsertFieldsList();
                this.getRemindTypeList();
            },
            /** 获取表单列表 */
            getFormTempList() {
                return new Promise((resolve) => {
                    util.ajax({
                        url: '/form-cust/template/getFormTemplateSortedList',
                        method: 'POST',
                        data: {
                            billType: 1,
                            status: -1,
                            orgId: this.enterpriseId
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.formTempList = response.data.data;
                            // 可能会比规则详情请求时间长，导致表单列表不能回填,所以请求成功之后再赋值一下
                            if (this.currentAssociationId === 5) {
                                this.handleAssociationChange(this.currentAssociationId);
                            }
                        }
                        resolve(true);
                    });
                });
            },
            /** 切换对象类型 */
            handleobjTypeChange(id) {
                if (id) {
                    this.objTypeId = id;
                    this.disableDetailedRule = false;
                    switch (this.currentAssociationId) {
                        case 1: // 线索
                            this.searchView = 'clueSearch';
                            // this.isDetailedRules=false
                            break;
                        case 2: // 询盘
                            this.searchView = 'inquirySearch';
                            // this.isDetailedRules=false
                            break;
                        case 3: // 客户
                            this.searchView = 'customerSearch';
                            // this.isDetailedRules=false
                            break;
                        case 4: // 跟进记录
                            this.searchView = 'followUpSearch';
                            break;
                        case 5: // 表单
                            for (const item of this.objTypeList) {
                                if (item.id === id) {
                                    if (typeof (item.cateType) !== 'undefined') { // 是fb表单
                                        this.searchView = 'fbMessageSearch';
                                    } else { // 普通表单
                                        this.searchView = 'websiteMsgSearch';
                                    }
                                }
                            }
                            break;
                        default:
                            this.searchView = '';
                    }
                    if (!this.ruleShow) {
                        this.disableDetailedRule = false;
                        this.isDetailedRules = false;
                        this.currentTriggerRuleId = null;
                        this.category = null;
                        this.recipients = [];
                        this.remindContent = '';
                        this.detailedRules = [
                            {
                                relationship: 'or',
                                ruleList: {
                                    relationship: 'and',
                                    conditionList: [
                                        {
                                            condition1Key: null,
                                            condition1: null,
                                            condition2: null,
                                            condition3: null
                                        }
                                    ]
                                }
                            }
                        ];
                    }
                }
            },
            /** 查询生效机制 */
            geActionList() {
                util.ajax({
                    url: '/rule/message/geActionList',
                    method: 'GET',
                    params: {
                        objId: this.currentAssociationId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.triggerRuleList = response.data.data;
                    }
                });
            },
            /** 切换生效机制 */
            handleTriggerRuleChange(id) {
                this.currentTriggerRuleId = id;
                for (const item of this.triggerRuleList) {
                    if (item.id === id) {
                        this.currentTriggerRule = item.fullname;
                    }
                }
                if (!this.ruleShow) {
                    this.category = '';
                    this.recipients = [];
                }
                this.categoryList = [
                    {
                        type: '2',
                        name: this.$t('systemNotice.addRule.specifiedUser')
                    },
                    {
                        type: '1',
                        name: this.$t('systemNotice.addRule.relatedUser')
                    }
                ];
                this.ruleShow = false;
            },
            /** 切换接收人类别 */
            handleCategoryChange(type) {
                if (!this.ruleShow) {
                    this.recipients = [];
                    this.recipientList = [];
                }
                // this.ruleShow=false
                if (type === '2') {
                    // 获取全部用户
                    this.$store.dispatch('getAllUsers');
                } else if (type === '1') {
                    this.getRelatedUserList();
                }
            },
            /** 查询相关人员 */
            getRelatedUserList() {
                util.ajax({
                    url: '/rule/message/getRelatedUserList',
                    method: 'GET',
                    params: {
                        objId: this.currentAssociationId,
                        typeId: this.currentTriggerRuleId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.recipientList = response.data.data;
                    }
                });
            },
            /** 查询插入字段 */
            getInsertFieldsList() {
                util.ajax({
                    url: '/rule/message/getInsertFieldsList',
                    method: 'GET',
                    params: {
                        objId: this.currentAssociationId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.insertFieldsList = response.data.data;
                    }
                });
            },
            /** 在光标位置插入内容 */
            insertCharacter(str) {
                const character = `{"${str}"}`;
                this.contentList.push(str);
                const tc = document.getElementById('remindInput');
                const tclen = tc.value.length;
                tc.focus();
                if (typeof document.selection !== 'undefined') {
                    document.selection.createRange().text = character;
                } else {
                    tc.value = tc.value.substr(0, tc.selectionStart) + character + tc.value.substring(tc.selectionStart, tclen);
                }
                this.remindContent = tc.value;
            },
            /** 获取企业所有人员列表 */
            setAllUsers() {
                this.recipientList = this.$deepClone(this.allUsers);
            },
            /** 查询通知类型列表 */
            getRemindTypeList() {
                util.ajax({
                    url: '/rule/message/getRemindTypeList',
                    method: 'get',
                    params: {
                        objId: this.currentAssociationId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.remindTypeList = response.data.data;
                        this.remindTypeId = this.remindTypeList[0].id || '';
                        this.handleRemindTypeChange(this.remindTypeId);
                    }
                });
            },
            /** 切换通知类型 */
            handleRemindTypeChange(id) {
                this.remindTypeId = id;
                for (const item of this.remindTypeList) {
                    if (item.id === id) {
                        this.remindType = item.fullname;
                    }
                }
                if (id === 1) { // 系统通知
                    // this.ruleShow=false
                } else if (id === 2) { // 发邮件
                    this.getBindAddress();
                    this.getMailTemplets();
                }
            },
            /** 查询企业所有绑定邮箱列表 */
            getBindAddress() {
                util.ajaxMail({
                    url: `/mail/mailBoxs/bindAddress/${this.enterpriseId}`,
                    method: 'get'
                }).then(response => {
                    if (response.data.code === 1) {
                        this.mailAddressList = response.data.data;
                    }
                });
            },
            /** 切换邮箱 */
            handleMailAddressChange(id) {
                for (const item of this.mailAddressList) {
                    if (item.id === id) {
                        this.mailAddress = item.bindingAddress;
                        this.mailUserId = item.addressUserId;
                    }
                }
            },
            /** 获取邮件模板列表 */
            getMailTemplets() {
                util.ajaxMail({
                    url: `/mail/mailTemplets/${this.enterpriseId}`,
                    method: 'get'
                }).then(response => {
                    if (response.data.code === 1) {
                        this.MailTempletList = response.data.data;
                    }
                });
            },
            /** 新增条件 */
            handleAddCondition(index) {
                // this.index++;
                this.detailedRules[index].ruleList.conditionList.push({
                    value: ''
                    // index: this.index,
                });
            },
            /** 删除条件 */
            handleRemove(i, j) {
                this.detailedRules[i].ruleList.conditionList.splice(j, 1);
                if (this.detailedRules[i].ruleList.conditionList.length === 0) {
                    this.detailedRules.splice(i, 1);
                }
            },
            /** 新增规则 */
            handleAddRule() {
                this.detailedRules.push({
                    relationship: 'or',
                    ruleList: {
                        relationship: 'and',
                        conditionList: [
                            {
                                condition1Key: null,
                                condition1: null,
                                condition2: null,
                                condition3: null
                            }
                        ]
                    }
                });
            },
            /** 变更条件逻辑关系 */
            handleChangeCondition(index, name) {
                this.detailedRules[index].ruleList.relationship = name;
            },
            /** 变更规则逻辑关系 */
            handleChangeRule(index, name) {
                this.detailedRules[index].relationship = name;
            },
            /** 规则发生变化 */
            handleSearchChange(i, j, data) {
                this.detailedRules[i].ruleList.conditionList[j] = data;
            },
            /** 保存规则 */
            handleSave() {
                if (!this.name.trim()) {
                    this.$Message.error(`【${this.$t('systemNotice.ruleName')}】${this.$t('crm.Modal.error_canNotBeEmpty')}`);
                    return;
                }
                if (this.name.length > 100) {
                    this.$Message.error(`【${this.$t('systemNotice.ruleName')}】 ${this.$t('authority.userManagement.maxLengthLimit')}100`);
                    return;
                }
                if (this.allRulesName.some(v => {
                    return v === this.name.trim();
                }) && !this.ruleId) {
                    this.$Message.error(`${this.$t('crm.Modal.error_ruleNameRepeated')}`);
                    return;
                }
                this.canSave = true;
                this.canRuleSave = true;
                let data = {
                    orgId: this.enterpriseId,
                    ruleName: this.name,
                    relationObj: this.currentAssociation,
                    relationObjType: this.currentAssociationId,
                    objType: this.objTypeId,
                    effectAction: this.currentTriggerRule,
                    effectActionType: this.currentTriggerRuleId,
                    instruction: this.description,
                    createUser: this.fullName,
                    remindType: this.remindTypeId,
                    remindName: this.remindType
                };
                if (this.remindTypeId === 1) { // 系统通知
                    data = {
                        ...data,
                        recipient: this.category,
                        recipientList: this.recipients,
                        remindContent: this.remindContent,
                        contentList: this.contentList
                    };
                } else if (this.remindTypeId === 2) { // 发邮件
                    data = {
                        ...data,
                        senderMailbox: this.mailAddress,
                        senderMailboxId: this.mailAddressId,
                        senderUserId: this.mailUserId,
                        emailTemplate: this.mailTemplet,
                        isSynchronize: this.isSynchronize === this.$t('yes') ? 1 : 2
                    };
                }
                if (this.ruleId) {
                    data.id = this.ruleId;
                }
                if (this.isDetailedRules) { // 选择了细分规则
                    const conditionData = {};
                    const $and = [];
                    const $or = [];
                    if (Array.isArray(this.detailedRules) && this.detailedRules.length) {
                        for (const item of this.detailedRules) {
                            /** @新增校验规则提示 */
                            if (Array.isArray(item.ruleList.conditionList) && item.ruleList.conditionList.some(v => {
                                for (const i in v) {
                                    if (!v[i]) return true;
                                    return false;
                                }
                            })) {
                                this.canRuleSave = false;
                                this.$Message.warning(`【${this.$t('systemNotice.addRule.setDetailRule')}】${this.$t('crm.Modal.error_canNotBeEmpty')}`);
                                break;
                            }
                            /** end */
                            const rela = [];
                            for (const val of item.ruleList.conditionList) {
                                // 规则完整度校验
                                if (val.condition2 === this.$t('systemNotice.addRule.con_periodOfTime')) {
                                    const reg = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
                                    const regExp = new RegExp(reg);
                                    // 暂时用正则过滤日期传过来的NaN-aN-aN
                                    if (!regExp.test(val.condition3[0]) || !regExp.test(val.condition3[1])) {
                                        this.canRuleSave = false;
                                    }
                                } else {
                                    for (const label in val) {
                                        if (typeof val[label] === 'number' && isNaN(val[label])) val[label] = 0;
                                        if (!(typeof val[label] === 'number') && (!val[label] || val[label].length === 0)) {
                                            this.canRuleSave = false;
                                        }
                                    }
                                }

                                const searchCon = val.condition1Key;
                                if (Array.isArray(val.condition3)) { // 数组类型
                                    const relaOr = [];
                                    const relaAnd = [];
                                    switch (val.condition2) {
                                        case this.$t('systemNotice.addRule.con_include'):
                                            for (const con of val.condition3) {
                                                const tempObj = {}; // 暂存对象
                                                tempObj[searchCon] = {};
                                                tempObj[searchCon].$ma = con;
                                                relaOr.push(tempObj);
                                            }
                                            rela.push({
                                                $or: relaOr
                                            });
                                            break;
                                        case this.$t('systemNotice.addRule.con_exclude'):
                                            for (const con of val.condition3) {
                                                const tempObj = {}; // 暂存对象
                                                tempObj[searchCon] = {};
                                                tempObj[searchCon].$nm = con;
                                                relaAnd.push(tempObj);
                                            }
                                            rela.push({
                                                $and: relaAnd
                                            });
                                            break;
                                        case this.$t('systemNotice.addRule.con_equal'):
                                            for (const con of val.condition3) {
                                                const tempObj = {}; // 暂存对象
                                                tempObj[searchCon] = {};
                                                tempObj[searchCon].$cons = con;
                                                relaOr.push(tempObj);
                                            }
                                            rela.push({
                                                $or: relaOr
                                            });
                                            break;
                                        case this.$t('systemNotice.addRule.con_unequal'):
                                            for (const con of val.condition3) {
                                                const tempObj = {}; // 暂存对象
                                                tempObj[searchCon] = {};
                                                tempObj[searchCon].$ne = con;
                                                relaAnd.push(tempObj);
                                            }
                                            rela.push({
                                                $and: relaAnd
                                            });
                                            break;
                                        case this.$t('systemNotice.addRule.con_lessThan'):
                                            for (const con of val.condition3) {
                                                const tempObj = {}; // 暂存对象
                                                tempObj[searchCon] = {};
                                                tempObj[searchCon].$lt = con;
                                                relaOr.push(tempObj);
                                            }
                                            rela.push({
                                                $or: relaOr
                                            });
                                            break;
                                        case this.$t('systemNotice.addRule.con_lessOrEqual'):
                                            for (const con of val.condition3) {
                                                const tempObj = {}; // 暂存对象
                                                tempObj[searchCon] = {};
                                                tempObj[searchCon].$lte = con;
                                                relaOr.push(tempObj);
                                            }
                                            rela.push({
                                                $or: relaOr
                                            });
                                            break;
                                        case this.$t('systemNotice.addRule.con_greaterThan'):
                                            for (const con of val.condition3) {
                                                const tempObj = {}; // 暂存对象
                                                tempObj[searchCon] = {};
                                                tempObj[searchCon].$gt = con;
                                                relaOr.push(tempObj);
                                            }
                                            rela.push({
                                                $or: relaOr
                                            });
                                            break;
                                        case this.$t('systemNotice.addRule.con_greaterOrEqual'):
                                            for (const con of val.condition3) {
                                                const tempObj = {}; // 暂存对象
                                                tempObj[searchCon] = {};
                                                tempObj[searchCon].$gte = con;
                                                relaOr.push(tempObj);
                                            }
                                            rela.push({
                                                $or: relaOr
                                            });
                                            break;
                                        case this.$t('systemNotice.addRule.con_periodOfTime'):
                                            const tempObj = {}; // 暂存对象
                                            const tempObj1 = {};
                                            tempObj[searchCon] = {};
                                            tempObj[searchCon].$gte = val.condition3[0];
                                            relaAnd.push(tempObj);
                                            tempObj1[searchCon] = {};
                                            tempObj1[searchCon].$lte = val.condition3[1];
                                            relaAnd.push(tempObj1);
                                            rela.push({
                                                $and: relaAnd
                                            });
                                            break;
                                    }
                                } else { // 如果是其他类型
                                    const tempObj = {}; // 暂存对象
                                    tempObj[searchCon] = {};
                                    switch (val.condition2) {
                                        case this.$t('systemNotice.addRule.con_include'):
                                            tempObj[searchCon].$ma = val.condition3;
                                            break;
                                        case this.$t('systemNotice.addRule.con_exclude'):
                                            tempObj[searchCon].$nm = val.condition3;
                                            break;
                                        case this.$t('systemNotice.addRule.con_equal'):
                                            tempObj[searchCon].$eq = val.condition3;
                                            break;
                                        case this.$t('systemNotice.addRule.con_unequal'):
                                            tempObj[searchCon].$ne = val.condition3;
                                            break;
                                        case this.$t('systemNotice.addRule.con_lessThan'):
                                            tempObj[searchCon].$lt = val.condition3;
                                            break;
                                        case this.$t('systemNotice.addRule.con_lessOrEqual'):
                                            tempObj[searchCon].$lte = val.condition3;
                                            break;
                                        case this.$t('systemNotice.addRule.con_greaterThan'):
                                            tempObj[searchCon].$gt = val.condition3;
                                            break;
                                        case this.$t('systemNotice.addRule.con_greaterOrEqual'):
                                            tempObj[searchCon].$gte = val.condition3;
                                            break;
                                    }
                                    rela.push(tempObj);
                                }
                            }
                            if (item.relationship === 'and') {
                                if (item.ruleList.relationship === 'and') {
                                    $and.push({
                                        $and: rela
                                    });
                                } else {
                                    $and.push({
                                        $or: rela
                                    });
                                }
                                conditionData.$and = $and;
                            } else {
                                if (item.ruleList.relationship === 'and') {
                                    $or.push({
                                        $and: rela
                                    });
                                } else {
                                    $or.push({
                                        $or: rela
                                    });
                                }
                                conditionData.$or = $or;
                            }
                        }
                        this.conditionsJson = conditionData;
                        data.conditionsJson = JSON.stringify(conditionData);
                        data.conditionsList = JSON.stringify(this.detailedRules);
                    } else {
                        this.canRuleSave = false;
                    }
                } else { // 没有选择细分规则

                }
                // 保存数据校验
                const errorMsgMap = {
                    ruleName: this.$t('systemNotice.ruleName'),
                    relationObj: this.$t('systemNotice.relationObj'),
                    relationObjType: this.$t('systemNotice.relationObj'),
                    objType: this.$t('systemNotice.addRule.objType'),
                    effectAction: this.$t('systemNotice.effectAction'),
                    effectActionType: this.$t('systemNotice.effectAction'),
                    instruction: this.$t('systemNotice.addRule.description'),
                    remindType: this.$t('systemNotice.addRule.actionType'),
                    remindName: this.$t('systemNotice.addRule.actionType'),
                    recipient: this.$t('systemNotice.addRule.recipient'),
                    recipientList: this.$t('systemNotice.addRule.recipient'),
                    remindContent: this.$t('systemNotice.addRule.remindContent'),
                    contentList: this.contentList,
                    senderMailbox: this.$t('systemNotice.addRule.sender'),
                    senderMailboxId: this.$t('systemNotice.addRule.sender'),
                    emailTemplate: this.$t('systemNotice.addRule.mailTemplate'),
                    isSynchronize: this.$t('systemNotice.addRule.isSynchronize')
                };
                for (const label in data) {
                    if (label !== 'instruction' && label !== 'contentList' && label !== 'emailTemplate') { // 过滤非必填内容
                        if (!data[label] || data[label].length === 0) {
                            this.canSave = false;
                            this.$Message.warning(`【${errorMsgMap[label]}】${this.$t('crm.Modal.error_canNotBeEmpty')}`);
                            break;
                        }
                    }
                }
                if (this.canRuleSave && this.canSave) {
                    data.recipientList = JSON.stringify(this.recipients);
                    data.contentList = JSON.stringify(this.contentList);
                    this.saveLoading = true;
                    util.ajaxJson({
                        url: '/rule/message/saveMsgRule',
                        method: 'POST',
                        data: data
                    }).then(response => {
                        this.saveLoading = false;
                        if (response.data.code === '1') {
                            this.$Message.success(this.$t('saveSuccess'));
                            this.$emit('modalState', false);
                            this.$emit('isRefreshTable', true);
                        } else {
                            this.$Message.error(response.data.message);
                        }
                    });
                }
                // else {
                //     this.$Message.warning(this.$t('systemNotice.addRule.isCompleteTip'));
                // }
            }
        },
        created() {
            if (this.ruleId) {
                this.getLoading = true;
            }
            util.axios.all([this.getAssociatedObjList(), this.getFormTempList()]).then(util.axios.spread(() => {
                if (this.ruleId) {
                    this.ruleShow = true;
                    this.getRuleById();
                }
            }));
        },
        watch: {
            name: {
                handler(val) {
                    if (val.length > 100) {
                        this.$Message.error(`【${this.$t('systemNotice.ruleName')}】 ${this.$t('authority.userManagement.maxLengthLimit')}100`);
                    }
                },
                immediate: true
            },
            mailAddressList: {
                handler: function(arr) {
                    if (!arr.some(v => v.id === this.mailAddressId)) {
                        this.mailAddressId = null;
                        this.mailAddress = '';
                    }
                },
                deep: true
            },
            MailTempletList: {
                handler: function(arr) {
                    if (!arr.some(v => this.mailTemplet === v.mailTempletId)) {
                        this.mailTemplet = '';
                    }
                },
                deep: true
            },
            objTypeList: {
                handler: function(arr) {
                    if (!arr.some(v => this.objTypeId === v.id)) {
                        this.objTypeId = '';
                    }
                },
                deep: true
            },
            allUsers: {
                handler(val) {
                    if (val) {
                        // 设置全部人员列表以供筛选
                        this.setAllUsers();
                    }
                }
            }
        }
    };
</script>

<style lang="less">
    .ruleModal {
        .el-dialog {
            .el-dialog__body {
                max-height: calc(~"100vh - 210px");
                overflow-y: auto;
                padding: 10px 20px;

                .el-col {
                    > div {
                        width: 100%;
                    }
                }

                .modal-item {
                    margin: 10px;

                    .ruleContent {
                        border: 1px dashed #FA8241;
                        position: relative;
                        margin-top: 40px;
                        padding: 10px 0 10px 30px;
                        margin-left: 4px;
                        box-sizing: border-box;
                        .relationshipIcon {
                            height: 30px;
                            width: 30px;
                            border-radius: 30px;
                            background: #FA8241;
                            color: #fff;
                            text-align: center;
                            line-height: 30px;
                            position: absolute;
                            top: 50%;
                            left: -15px;
                            margin-top: -15px;
                            cursor: pointer;

                            .el-dropdown-menu {
                                min-width: 20px;

                                .el-dropdown-menu__item {
                                    padding: 4px;
                                }
                            }
                        }

                        .rulesRelationship {
                            position: absolute;
                            border: 1px dashed #FA8241;
                            height: 40px;
                            width: 1px;
                            left: 50%;
                            bottom: 0;
                            margin-bottom: -40px;
                        }
                    }
                }
            }
        }
    }
</style>
