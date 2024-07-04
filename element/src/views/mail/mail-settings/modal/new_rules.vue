<template>
    <div>
        <Modal
                class="add-contact"
                width="600px"
                :visible="letAddModalShow"
                :title="editRulesInfo.id ? $t('mailSetting.sendReceiveRules.editRules') : $t('mailSetting.sendReceiveRules.addRules')"
                :modal-append-to-body="false"
                :append-to-body="true"
                :close-on-click-modal="false"
                @close="handleCancel">
            <div class="new_rules">
                <Form ref="ruleName" :model="formValidate" :rules="ruleValidate" label-position="left" label-width='80px'
                    style="margin:0 10px;">
                    <FormItem :label="$t('mailSetting.sendReceiveRules.rulesName')" prop="ruleName">
                        <ElInputExtend v-model.trim="formValidate.ruleName"
                            :placeholder="$t('mailSetting.sendReceiveRules.enterRuleName')"
                            :disabled="editRulesInfo.type === 1 ? true : false"
                            :errorMessage="$t('mailSetting.sendReceiveRules.upperLimitTip')"
                            maxLen="100"
                            show-word-limit>
                        </ElInputExtend>
                    </FormItem>
                    <FormItem :label="$t('mailSetting.sendReceiveRules.triggerTiming')" required style="margin-bottom:0;">
                        <RadioGroup v-model="formValidate.effectActionType" class="effectActionTypeClass">
                            <Radio label="1" style="font-size:12px;">{{$t('mailSetting.sendReceiveRules.manually')}}</Radio>
                            <Radio label="2" style="font-size:12px;">{{$t('mailSetting.sendReceiveRules.automaticly')}}</Radio>
                        </RadioGroup>
                        <Select v-model="formValidate.effectActionMailType"
                                multiple
                                v-if="formValidate.effectActionType === '2'"
                                :placeholder="$t('mailSetting.sendReceiveRules.pleaseSelect')"
                                style="margin-left: 10px;width:252px;">
                            <Option
                                v-for="item in effectActionMailTypeOption"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"></Option>
                        </Select>
                        <div class="trigger_timing_tip">
                            <span v-if="trigger_timing_tip_show">{{trigger_timing_tip}}</span>
                        </div>
                    </FormItem>
                    <FormItem :label="$t('mailSetting.sendReceiveRules.triggeringConditions')" :class="`${this.lang === 'zh-CN' ? '' : 'english_size'}`" required style="margin-bottom:0;">
                        <div class="triggeringConditionsClass">
                            <div style="margin-bottom:6px;">
                                <span>{{$t('mailSetting.sendReceiveRules.triggeringConditions1')}}</span>
                                <Select v-model="formValidate.conditionsRelation"
                                    :disabled="editRulesInfo.type === 1 ? true : false"
                                    :placeholder="$t('mailSetting.sendReceiveRules.pleaseSelect')"
                                    style="margin:0 10px;width:80px;">
                                    <Option
                                        v-for="item in conditionsJsonTypeOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"></Option>
                                </Select>
                                <span>{{$t('mailSetting.sendReceiveRules.triggeringConditions2')}}</span>
                            </div>
                            <div v-for="(item, index) in triggeringConditions" :key="index">
                                <Select v-model="item.value"
                                        :placeholder="$t('mailSetting.sendReceiveRules.pleaseSelect')"
                                        :disabled="editRulesInfo.type === 1 ? true : false"
                                        @change="(val) => {changeOptions(val, index)}"
                                        style="margin-right: 8px;width:120px;">
                                    <Option
                                        v-for="item in item.options"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"></Option>
                                </Select>
                                <Select v-model="item.type"
                                        :placeholder="$t('mailSetting.sendReceiveRules.pleaseSelect')"
                                        :disabled="editRulesInfo.type === 1 ? true : false"
                                        style="margin-right: 8px;width:120px;">
                                    <Option
                                        v-for="item in symbolOptions"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"></Option>
                                </Select>
                                <ElInputExtend v-model.trim="item.label"
                                    maxLen="100"
                                    :placeholder="$t('mailSetting.sendReceiveRules.tip_inputKeyWords')"
                                    :disabled="editRulesInfo.type === 1 ? true : false"
                                    :errorMessage="$t('mailSetting.sendReceiveRules.upperLimitTip')"
                                    :showErrorMsg="false"
                                    show-word-limit
                                    style="margin-right: 8px;width:244px;">
                                </ElInputExtend>

                                <!-- 新增图标 -->
                                <span @click="addClick" v-if="index === 0 && (!editRulesInfo.id || editRulesInfo.type === 2)">
                                        <Icon  size="15" class="custom custom-add-circle"
                                        style='cursor:pointer;display:inline-block;'></Icon>
                                </span>
                                <!-- 删除图标 -->
                                <span @click="removeClick(index, item.value)" v-else-if="!editRulesInfo.id || editRulesInfo.type === 2">
                                        <Icon size="15" class="custom custom-reduce-circle"
                                    style='cursor:pointer;display:inline-block;'></Icon>
                                </span>
                            </div>
                        </div>
                        <div class="trigger_timing_tip" style="margin-left: -70px;">
                            <span v-if="triggering_conditions_tip_show">{{triggering_conditions_tip}}</span>
                        </div>
                    </FormItem>
                    <FormItem :label="$t('mailSetting.sendReceiveRules.performAction')" style="margin-borrom: 22px;" :class="`${this.lang === 'zh-CN' ? '' : 'english_size'}`" required>
                        <div style="display: block;position: relative;left: -70px;margin-right: -70px;margin-top: 40px;">
                            <Checkbox :disabled="editRulesInfo.type === 1 ? true : false" v-model="haveReadChecked" style="margin-right:70px;">{{$t('mailSetting.sendReceiveRules.markAsRead')}}</Checkbox>
                            <Checkbox :disabled="editRulesInfo.type === 1 ? true : false" v-model="starChecked" style="margin-right:70px;">{{$t('mailSetting.sendReceiveRules.markAsStar')}}</Checkbox>
                            <Checkbox :disabled="editRulesInfo.type === 1 ? true : false" v-model="pendingChecked" style="margin-right:70px;">{{$t('mailSetting.sendReceiveRules.markAsPending')}}</Checkbox><br/>
                            <Checkbox :disabled="editRulesInfo.type === 1 ? true : false" v-model="tagLabelChecked" :style="`${tagLabelChecked ? 'margin-right: 16px;' : 'margin-right:71px;'}`">{{$t('mailSetting.sendReceiveRules.tagLabel')}}</Checkbox>
                            <SelectTree :treeDatas="tagList"
                                    style="margin-right: 24px;width:167px;"
                                    name="labelName"
                                    :disabled="editRulesInfo.type === 1 ? true : false"
                                    :SynchronizeStatus="labelDefaultStatus"
                                    :defaultStatus="labelCheckedKeys"
                                    defaultStyle="padding:0;"
                                    v-if="tagLabelChecked"
                                    :showSearch="false"
                                    :multiple="true"
                                    :renderContent="(h, { node, data, store }) => renderContent(h, data, 'labelName', {maxWidth: '120px'})"
                                    :resMsg="updateTagList">
                                        <span @click="operateTag('addtag', 1)"
                                                style="border-top: 1px solid #EBEEF5;
                                                height:42px; line-height:42px; font-size: 14px;
                                                color: #FA8241; cursor: pointer; text-align:center;
                                                line-height: 42px; display: block;">+&nbsp;{{$t('mail.add_tags_mark')}}</span>
                            </SelectTree>
                            <Checkbox :disabled="editRulesInfo.type === 1 ? true : false" v-model="moveToChecked" style="margin-right: 16px;">{{$t('mailSetting.sendReceiveRules.moveTo')}}</Checkbox>
                            <Dropdown v-if="moveToChecked && (!editRulesInfo.id || editRulesInfo.type === 2)" trigger="click" ref="dropdown" @command="moveTo">
                                <Input v-model="formValidate.transferName"
                                        ref="input"
                                        style="width:167px;font-size:12px;"
                                        :placeholder="$t('mailSetting.sendReceiveRules.pleaseSelect')">
                                    <Icon style="cursor:pointer;" slot="suffix"
                                        custom="custom custom-floating-window-arrow" size="12">
                                    </Icon>
                                </Input>
                                <DropdownMenu slot="dropdown"
                                            class="move-to-folders"
                                            style="max-height: 400px; overflow: auto;min-width:170px;">
                                    <Tree
                                        :data="customFolders"
                                        :loading="customFolders && customFolders.length ? false : true"
                                        draggable
                                        :props="defaultProps"
                                        :render-content="foldersRenderContent"
                                        node-key="id"
                                        :default-expanded-keys="expandedIdList"
                                        @node-expand="tree_node_expand"
                                        @node-collapse="tree_node_collapse"
                                        >
                                    </Tree>
                                </DropdownMenu>
                            </Dropdown>
                            <Input v-model="formValidate.transferName"
                                    v-if="moveToChecked && editRulesInfo.id && editRulesInfo.type === 1"
                                    ref="input"
                                    style="width:167px;"
                                    :placeholder="$t('mailSetting.sendReceiveRules.pleaseSelect')"
                                    :disabled="true">
                                <Icon style="cursor:pointer;" slot="suffix"
                                    custom="custom custom-floating-window-arrow" size="12">
                                </Icon>
                            </Input>
                        </div>
                        <div class="trigger_timing_tip" style="margin-left: -70px;">
                            <span v-if="perform_action_tip_show">{{perform_action_tip}}</span>
                        </div>
                    </FormItem>
                    <FormItem :label="$t('mailSetting.sendReceiveRules.applyToMailboxRange')" class="form-special-width" required>
                        <SelectTree :treeDatas="senders"
                                    :defaultStatus="emailRangeDefaultStatus"
                                    style="width: 413px;"
                                    :loading="senders.length ? false : true"
                                    v-if="senders.length"
                                    name="emailAddress"
                                    :multiple="true"
                                    :renderContent="(h, { node, data, store }) => renderContent(h, data, 'emailAddress', {maxWidth: '240px'})"
                                    :resMsg="updateEmailRange"></SelectTree>
                        <div class="trigger_timing_tip" style="margin-left: -70px;">
                            <span v-if="email_range_tip_show">{{email_range_tip}}</span>
                        </div>
                    </FormItem>
                    <FormItem :label="$t('mailSetting.sendReceiveRules.appliedHistoricalData')" class="form-special-width isHistoryClass">
                        <RadioGroup v-model="formValidate.isHistory">
                            <Radio label="0">{{$t('mailSetting.sendReceiveRules.no')}}</Radio>
                            <Radio label="1">{{$t('mailSetting.sendReceiveRules.yes')}}</Radio>
                        </RadioGroup>
                        <SelectTree :treeDatas="folders"
                                    :defaultStatus="historyRangeDefaultStatus"
                                    style="margin-left: 10px;width:258px;"
                                    v-if="formValidate.isHistory === '1'"
                                    :loading="folders.length ? false : true"
                                    :checkStrictly="true"
                                    width="268px;"
                                    name="boxTypeName"
                                    :multiple="true"
                                    :defaultProps="defaultProps"
                                    :renderContent="(h, { node, data, store }) => renderContent(h, data, 'boxTypeName', {maxWidth: '120px'})"
                                    :resMsg="updateHistoryRange"></SelectTree>
                        <div class="trigger_timing_tip" style="margin-left: -70px;">
                            <span v-if="is_history_tip_show">{{is_history_tip}}</span>
                        </div>
                    </FormItem>
                </Form>
            </div>
            <div slot="footer">
                <Button style="color: #fc8c30;border: 1px solid #fc8c30;" @click="handleCancel">{{$t('cancel')}}</Button>
                <Button type="primary" @click="handleSave" :loading="saveLoading"
                        :class="fromModal ? 'piwik_from_mail_detail_new_rule_save_btn' : (editRulesInfo.id ? 'piwik_edit_rule_save_btn' : 'piwik_new_rule_save_btn')">{{$t('confirm')}}</Button>
            </div>
            <Modal
                    :visible.sync="addModal"
                    :modal-append-to-body="true"
                    :append-to-body="true"
                    :close-on-click-modal="false"
                    :title="$t('crm.UniSet.setting_label')"
                    width="458px"
                    class="add-tag">
                <div class="layermain">
                    <Form label-position="left" label-width="80px">
                        <FormItem :label="$t('mail.tagName')" style="position:relative;">
                            <Input v-model.trim="tagName" placeholder="请输入"
                                    style="margin-top:2px;">
                            </Input>
                            <p style="text-align:left;color:red;height: 18px;line-height: 18px;">{{ $t('mailSetting.MailTag.lengthLimit') }}</p>
                        </FormItem>
                    </Form>
                    <div class="label_color">
                        <span class="label_color_title">{{ '标签颜色' }}</span>
                        <Poptip v-model="visible"
                                style="flex: 1;display: flex;"
                                placement="bottom-end"
                                :visible-arrow="false"
                                :width="selectWidth"
                                popper-class="label_color_select"
                                ref="poptip">
                            <p class="label_color_item" slot="reference">
                                <i class="label_color_icon" :style="`background:${fontColorValue}`"></i>
                                {{ fontColorValue }}
                                <Icon :custom="`el-select__caret el-input__icon el-icon-arrow-up ${visible ? 'is-reverse' : ''}`" size="12" style="position:absolute;right:0;"></Icon>
                            </p>
                            <ColorPicker
                                popper-class="labelDefaultColorPicker"
                                class="mail-default-color"
                                ref="colorPicker"
                                :predefine="predefineColors"
                                v-model="fontColorValue"
                                @active-change="activeColorChange"
                                @change="colorChange"
                                />
                        </Poptip>
                    </div>
                </div>
                <div slot="footer">
                    <Button @click="addModal = false">{{$t('mailSetting.sendReceiveRules.cancel') }}</Button>
                    <Button @click="saveTag" type="primary">{{ $t('mailSetting.sendReceiveRules.confirm') }}</Button>
                </div>
            </Modal>
        </Modal>
    </div>
</template>
<script>
    import Vue from 'vue';
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import SelectTree from './select_tree.vue';

    export default {
        name: 'newRules',
        props: {
            letAddModalShow: {
                type: Boolean
            },
            editRulesInfo: {
                type: Object,
                default: () => ({})
            },
            getPageList: Function,
            mailAddress: String,
            fromModal: String
        },
        components: { SelectTree },
        data() {
            return {
                modalShow: false,
                triggeringConditions: [
                    {
                        label: '',
                        type: '$ma',
                        value: 'mailFrom',
                        options: []
                    }
                ],
                history_range: '',
                formValidate: {
                    ruleName: '',
                    effectActionType: '2', // 触发时机
                    conditionsRelation: 1,
                    tagLabelId: '', // 标签id
                    transferName: '', // 转移至名
                    transferId: '', // 转移至id
                    conditionsJson: {}, // 触发条件
                    effectActionMailType: ['1'], // 触发时机 -- 自动执行
                    performOperationsType: {}, // 执行操作
                    emailRange: '', // 邮箱范围
                    isHistory: '0', // 1、是   0、否
                    historyRange: '' // 历史数据范围
                },
                conditionsJsonTypeOption: [
                    { value: 1, label: this.$t('mail.accountPlh') },
                    { value: 2, label: this.$t('mailSetting.sendReceiveRules.any') }
                ],
                haveReadChecked: false,
                pendingChecked: false,
                starChecked: false,
                tagLabelChecked: false,
                moveToChecked: false,
                ruleValidate: {
                    ruleName: [
                        { required: true, message: this.$t('mailSetting.sendReceiveRules.rulesName') + this.$t('mailSetting.sendReceiveRules.cannotBeEmpty'), trigger: 'blur' }
                    ]
                },
                saveLoading: false,
                effectActionMailTypeOption: [
                    {
                        value: '1',
                        label: this.$t('mailSetting.sendReceiveRules.receiveEmail')
                    },
                    {
                        value: '2',
                        label: this.$t('mailSetting.sendReceiveRules.sendEmail')
                    }
                ],
                tagList: [], // 标签列表
                options: [
                    {
                        value: 'mailFrom',
                        label: this.$t('mailSetting.sendReceiveRules.sender'),
                        disabled: false
                    },
                    {
                        value: 'mailTo',
                        label: this.$t('mailSetting.sendReceiveRules.recipients'),
                        disabled: false
                    },
                    {
                        value: 'recipientsCc',
                        label: this.$t('mailSetting.sendReceiveRules.cc'),
                        disabled: false
                    },
                    {
                        value: 'recipientsBcc',
                        label: this.$t('mailSetting.sendReceiveRules.bcc'),
                        disabled: false
                    },
                    {
                        value: 'mailSubject',
                        label: this.$t('mailSetting.sendReceiveRules.subject'),
                        disabled: false
                    },
                    {
                        value: 'attachmentName',
                        label: this.$t('mailSetting.sendReceiveRules.attachmentName'),
                        disabled: false
                    }
                ],
                symbolOptions: [
                    {
                        value: '$ma',
                        label: this.$t('mailSetting.sendReceiveRules.include')
                    },
                    {
                        value: '$nm',
                        label: this.$t('mailSetting.sendReceiveRules.notInclude')
                    },
                    {
                        value: '$eq',
                        label: this.$t('mailSetting.sendReceiveRules.equalTo')
                    },
                    {
                        value: '$ne',
                        label: this.$t('mailSetting.sendReceiveRules.notEqualTo')
                    }
                ],
                addModal: false,
                tagName: '',
                // poptip 整体
                visible: false,
                selectWidth: '166',
                fontColorValue: '#71A3F5',
                predefineColors: [ '#71A3F5', '#40D9B3', '#50D4DF', '#9C8CF2', '#FF985F', '#FFCD43', '#40CEFE', '#7388B6', '#5BBA7E', '#EF7267'],
                selectOptions: [],
                trigger_timing_tip: this.$t('mailSetting.sendReceiveRules.pleaseSelect') + this.$t('mailSetting.sendReceiveRules.triggerTiming'),
                trigger_timing_tip_show: false, // 触发时机的tip显隐状态
                triggering_conditions_tip: this.$t('mailSetting.sendReceiveRules.triggeringConditions') + this.$t('mailSetting.sendReceiveRules.cannotBeEmpty'),
                triggering_conditions_tip_show: false, // 触发条件tip显隐状态
                perform_action_tip: this.$t('mailSetting.sendReceiveRules.pleaseSelect') + this.$t('mailSetting.sendReceiveRules.performAction'),
                perform_action_tip_show: false, // 执行操作tip显隐状态
                email_range_tip: this.$t('mailSetting.sendReceiveRules.pleaseSelect') + this.$t('mailSetting.sendReceiveRules.applyToMailboxRange'),
                email_range_tip_show: false, // 执行操作tip显隐状态
                is_history_tip: this.$t('mailSetting.sendReceiveRules.pleaseSelect') + this.$t('mailSetting.sendReceiveRules.box'),
                is_history_tip_show: false, // 应用于历史数据
                customFolders: [
                    {
                        boxTypeName: this.$t('mailSetting.sendReceiveRules.deletedMail'),
                        id: '3'
                    },
                    {
                        boxTypeName: this.$t('mailSetting.sendReceiveRules.junkMail'),
                        id: '2'
                    }
                ],
                defaultProps: {
                    children: 'list'
                },
                expandedIdList: [],
                foldersIds: [],
                folders: [
                    {
                        boxTypeName: this.$t('mailSetting.sendReceiveRules.allCabinets'),
                        id: -1
                    },
                    {
                        boxTypeName: this.$t('mailSetting.sendReceiveRules.inbox'),
                        id: 0
                    },
                    {
                        boxTypeName: this.$t('mailSetting.sendReceiveRules.sent'),
                        id: 4
                    },
                    {
                        boxTypeName: this.$t('mail.groupBox'),
                        id: 7
                    },
                    {
                        boxTypeName: this.$t('mailSetting.sendReceiveRules.deletedMail'),
                        id: 3
                    },
                    {
                        boxTypeName: this.$t('mailSetting.sendReceiveRules.junkMail'),
                        id: 2
                    }
                    
                ],
                senders: [
                    {
                        emailAddress: this.$t('mailSetting.sendReceiveRules.allEmail'),
                        id: -1
                    }
                ], // 绑定邮件列表
                labelDefaultStatus: {}, // 标记标签的回填数据
                labelCheckedKeys: [], // 标记标签的默认选中
                emailRangeDefaultStatus: [], // 应用于邮箱范围回填数据
                historyRangeDefaultStatus: [] // 箱体数据回填数据
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.fullName,
                lang: state => state.app.lang
            })
        },
        mounted() {
        },
        created() {
            this.triggeringConditions[0].options = [...this.options];
        },
        methods: {
            colorRGBtoHex(color) {
                var rgb = color.split(',');
                var r = parseInt(rgb[0].split('(')[1]);
                var g = parseInt(rgb[1]);
                var b = parseInt(rgb[2].split(')')[0]); 
                var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                return hex;
            },
            activeColorChange(val) {
                this.fontColorValue = this.colorRGBtoHex(val);
            },
            colorChange(val) {
                this.visible = false;
            },
            // 树形图的渲染结构
            renderContent(h, data, name, style) {
                return h(
                    'span',
                    {
                        style: {
                            ...style,
                            display: 'inline-block',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden'
                        },
                        attrs: {
                            title: data[name]
                        }
                    },
                    [
                        name === 'labelName' && h('span', {
                            class: 'tag-color',
                            style: {
                                backgroundColor: `${data.labelColor}`,
                                marginBottom: '2px'
                            }
                        }),
                        h('span', [
                            h('Icon', {
                                style: {
                                    marginRight: '8px',
                                    fontSize: '16px'
                                }
                            }),
                            h('span', data[name])
                        ])
                    ]
                );
            },
            // 更新箱体 id 集合
            updateHistoryRange({ ids, idNames }) {
                if (ids.includes(-1)) {
                    const index = ids.indexOf(-1);
                    ids.splice(index, 1, 'all');
                }
                this.formValidate.historyRange = ids.join(',');
            },
            // 更新邮箱范围的 id 集合
            updateEmailRange({ ids, idNames }) {
                if (ids.includes(-1)) {
                    const index = ids.indexOf(-1);
                    ids.splice(index, 1, 'all');
                }
                this.formValidate.emailRange = ids.join(',');
            },
            // 更新标签 id 集合
            updateTagList({ ids, idNames }) {
                this.formValidate.tagLabelId = ids.join(',');
            },
            // 获取自定义文件夹
            getCustomFolders() {
                this.historyRangeDefaultStatus = [];
                util.ajaxMail({
                    url: `/mail/mailBoxTypes/${this.userId}`,
                    method: 'GET'
                }).then(response => {
                    if (response.data.code === 1) {
                        // 执行操作转移至自定义文件夹用数据结构
                        if (response.data.data && response.data.data.length) {
                            // 历史邮箱范围用数据结构
                            this.folders.splice(4, 0, ...response.data.data);
                            this.foldersIds = this.folders.map((item) => {
                                return item.id;
                            });
                            if (this.historyRange) {
                                const historyRangeFilter = (arr) => {
                                    for (let i = 0; i < arr.length; i++) {
                                        if (this.historyRange.some((item) => item == arr[i].id)) {
                                            this.historyRangeDefaultStatus.push(arr[i]);
                                        }
                                        if (this.historyRange.some((item) => item === 'all') && arr[i].id == -1) {
                                            this.historyRangeDefaultStatus.push(arr[i]);
                                        }
                                        if (arr[i].list && arr[i].list.length > 0) {
                                            historyRangeFilter(arr[i].list);
                                        }
                                    }
                                };
                                historyRangeFilter(this.folders);
                            }

                            // 预置规则的执行草所 --- 移动到 需要手动加上“收件箱”
                            if (this.editRulesInfo.type === 1) {
                                this.customFolders.unshift({
                                    boxTypeName: '收件箱',
                                    id: '0'
                                });
                            }
                            this.customFolders.unshift(...response.data.data);
                        }
                        this.moveTo(this.formValidate.transferId);
                    } else {
                        this.$Message.error('获取自定义文件夹列表失败');
                    }
                }).catch((err) => {
                    // this.$Message.error('获取自定义文件夹列表失败');
                });
            },
            // 处理字段校验以及整合参数结构
            getVerifyResult() {
                if (this.formValidate.ruleName.length > 100) {
                    return false;
                }
                // 触发时机校验处理
                if (!this.formValidate.effectActionType.length) {
                    this.trigger_timing_tip_show = true;
                    this.trigger_timing_tip = this.$t('mailSetting.sendReceiveRules.pleaseSelect') + this.$t('mailSetting.sendReceiveRules.triggerTiming');
                    return false;
                } else if (this.formValidate.effectActionType === '2' && !this.formValidate.effectActionMailType.length) {
                    this.trigger_timing_tip_show = true;
                    this.trigger_timing_tip = this.$t('mailSetting.sendReceiveRules.pleaseSelect') + this.$t('mailSetting.sendReceiveRules.automaticExecutionPlan');
                    return false;
                } else {
                    this.trigger_timing_tip_show = false;
                }
                // 触发条件校验处理
                if (this.triggeringConditions.some((item) => !item.label) || this.triggeringConditions.some((item) => !item.value) || this.triggeringConditions.some((item) => !item.type)) {
                    this.triggering_conditions_tip_show = true;
                    this.triggering_conditions_tip = this.$t('mailSetting.sendReceiveRules.triggeringConditions') + this.$t('mailSetting.sendReceiveRules.cannotBeEmpty');
                    return false;
                } else {
                    this.triggering_conditions_tip_show = false;
                }
                if (this.triggeringConditions.some((item) => item.label.length > 100)) {
                    this.triggering_conditions_tip_show = true;
                    this.triggering_conditions_tip = `${this.$t('mailSetting.sendReceiveRules.upperLimitTip')} 100`;
                    return false;
                } else {
                    this.triggering_conditions_tip_show = false;
                }
                // 执行操作校验处理
                if (!this.haveReadChecked && !this.pendingChecked && !this.starChecked && !this.tagLabelChecked && !this.moveToChecked) {
                    this.perform_action_tip_show = true;
                    this.perform_action_tip = this.$t('mailSetting.sendReceiveRules.pleaseSelect') + this.$t('mailSetting.sendReceiveRules.performAction');
                    return false;
                } else if (this.tagLabelChecked && (!this.formValidate.tagLabelId || !this.formValidate.tagLabelId.length)) {
                    this.perform_action_tip_show = true;
                    this.perform_action_tip = this.$t('mailSetting.sendReceiveRules.pleaseSelect') + this.$t('mailSetting.sendReceiveRules.label');
                    return false;
                } else if (this.moveToChecked && !this.formValidate.transferName.length) {
                    this.perform_action_tip_show = true;
                    this.perform_action_tip = this.$t('mailSetting.sendReceiveRules.pleaseSelect') + this.$t('mailSetting.sendReceiveRules.box');
                    return false;
                } else {
                    this.perform_action_tip_show = false;
                }
                // 应用于邮箱范围校验处理
                if (!this.formValidate.emailRange.length) {
                    this.email_range_tip_show = true;
                    return false;
                } else {
                    this.email_range_tip_show = false;
                }
                // 应用于历史数据校验处理
                if (this.formValidate.isHistory === '1' && !this.formValidate.historyRange.length) {
                    this.is_history_tip_show = true;
                    return false;
                } else {
                    this.is_history_tip_show = false;
                }

                const data = Object.assign({}, this.formValidate);

                // 执行操作数据处理
                if (this.haveReadChecked) {
                    data.performOperationsType['1'] = '0';
                } else {
                    delete data.performOperationsType['1'];
                }
                if (this.starChecked) {
                    data.performOperationsType['2'] = '0';
                } else {
                    delete data.performOperationsType['2'];
                }
                if (this.pendingChecked) {
                    data.performOperationsType['3'] = '0';
                } else {
                    delete data.performOperationsType['3'];
                }
                if (this.tagLabelChecked) {
                    data.performOperationsType['4'] = this.formValidate.tagLabelId;
                } else {
                    delete data.performOperationsType['4'];
                }
                if (this.moveToChecked) {
                    data.performOperationsType['5'] = this.formValidate.transferId;
                } else {
                    delete data.performOperationsType['5'];
                }
                data.performOperationsType = JSON.stringify(data.performOperationsType);

                // 触发条件数据处理
                const arr = [];
                this.triggeringConditions.forEach((item) => {
                    arr.push({
                        [item.value]: { [item.type]: item.label }
                    });
                });
                data.conditionsJson = JSON.stringify({ $or: [{ [`${data.conditionsRelation ===1 ? '$and' : '$or'}`]: arr }] });

                // 触发时机 -- 自动执行选项数据处理
                if (data.effectActionType === '1') {
                    data.effectActionMailType = null;
                } else {
                    if (data.effectActionMailType.length === 2) {
                        data.effectActionMailType = 3;
                    } else {
                        data.effectActionMailType = data.effectActionMailType.length && Number(data.effectActionMailType.join(','));
                    }
                }
                // 历史数据数据处理
                if (this.formValidate.isHistory === '0') {
                    this.formValidate.historyRange = '';
                }
                return data;
            },
            /** 添加联规则保存 */
            handleSave() {
                const data = this.getVerifyResult();
                if (!data) {
                    return;
                }
                this.$refs.ruleName.validate((valid) => {
                    if (this.saveLoading) return;
                    if (valid) {
                        this.saveLoading = true;
                        const dataJson = {
                            ...data,
                            orgId: this.enterpriseId,
                            userId: this.userId
                        };
                        if (this.editRulesInfo.id) {
                            dataJson.id = this.editRulesInfo.id;
                            dataJson.updateUser = this.userName;
                        } else {
                            dataJson.createUser = this.userName;
                        }
                        if (!dataJson.isHistory) {
                            delete dataJson.isHistory;
                            delete dataJson.historyRange;
                        }
                        util.ajaxMailJson({
                            url: '/mail/mailReceiveSendRule/saveRule',
                            method: 'post',
                            data: dataJson
                        }).then(response => {
                            this.saveLoading = false;
                            if (response.data.code === 1) {
                                this.rulesDataList = response.data.data;
                                this.boundEnd = this.rulesDataList.length;
                                this.handleCancel();
                                this.getPageList && this.getPageList(dataJson.id ? 'edit' : 'add');
                                if (this.editRulesInfo.id) {
                                    this.$Message.success(this.$t('mailSetting.sendReceiveRules.editRulesSuccess'));
                                } else {
                                    this.$Message.success(this.$t('mailSetting.sendReceiveRules.createdRuleSuccess'));
                                }
                            } else {
                                if (this.editRulesInfo.id) {
                                    this.$Message.error(this.$t('mailSetting.sendReceiveRules.editRulesFaile'));
                                } else {
                                    this.$Message.success(this.$t('mailSetting.sendReceiveRules.createdRuleError'));
                                }
                            }
                        }).catch(() => {
                            this.saveLoading = false;
                            this.$Message.error('保存收发信规则失败');
                        });
                    }
                });
            },
            // 关闭新建规则
            handleCancel() {
                this.$emit('update:letAddModalShow', false);
            },
            // 增加触发条件
            addClick() {
                const lastItem = this.triggeringConditions[this.triggeringConditions.length - 1];
                this.triggeringConditions.push({
                    label: '',
                    type: lastItem.type,
                    value: lastItem.value,
                    options: [...this.options]
                });
                this.$nextTick(() => {
                    this.getOptions();
                });
            },
            // 删除触发条件
            removeClick(index, val) {
                this.triggeringConditions.splice(index, 1);
                this.selectOptions.forEach((item, index) => {
                    if (item.value === val) {
                        this.selectOptions.splice(index, 1);
                    }
                });
                this.$nextTick(() => {
                    this.getOptions();
                });
            },
            changeOptions(val, index) {
                this.getOptions(val, index);
            },
            // 整合触发条件下拉框的数据
            getOptions(val = null, index) {
                if (index >= 0) {
                    if (this.selectOptions.some((item) => (item.value === 'mailFrom' || item.value === 'mailSubject')) && val !== 'mailFrom' && val !== 'mailSubject') {
                        this.selectOptions.splice(index, 1);
                    }
                    if (val === 'mailFrom' || val === 'mailSubject') {
                        if (this.selectOptions.some((item) => index === item.index)) {
                            const item = this.selectOptions.find((item) => index === item.index);
                            item.value = val;
                        } else {
                            this.selectOptions.push({
                                index: index,
                                value: val
                            });
                        }
                    }
                }
                // for (let i = 0; i < this.triggeringConditions.length; i++) {
                //     const item = this.triggeringConditions[i];
                //     for (let j = 0; j < item.options.length; j++) {
                //         const self = item.options[j];
                //         if (this.selectOptions.some((v) => item.value !== v.value) && this.selectOptions.some((v) => self.value === v.value)) {
                //             self.disabled = true;
                //         } else {
                //             self.disabled = false;
                //         }
                //     }
                // }
            },
            /** 获取邮件标签 */
            getTags() {
                this.labelCheckedKeys = [];
                util.ajaxMail({
                    url: '/mail/maillabel/all',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        createUserId: this.userId
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        this.tagList = res.data.data;
                        // 标记标签的默认选中
                        if (this.formValidate.id && this.formValidate.tagLabelId) {
                            for (let i = 0; i < this.tagList.length; i++) {
                                for (let j = 0; j < this.formValidate.tagLabelId.length; j++) {
                                    if (this.formValidate.tagLabelId[j] == this.tagList[i].id) {
                                        this.labelCheckedKeys.push(this.tagList[i]);
                                    }
                                }
                            }
                        }
                        // 过滤掉已经删除的标签
                        if (this.formValidate.tagLabelId) {
                            for (let i = 0; i < this.formValidate.tagLabelId.length; i++) {
                                const item = this.formValidate.tagLabelId[i];
                                if (!this.tagList.some((slef) => slef.id === item)) {
                                    this.formValidate.tagLabelId.splice(i, 1);
                                    i--;
                                }
                            }
                        }
                    } else {
                        this.$Message.error('获取邮件标签列表失败');
                    }
                }, () => {
                    this.$Message.error('获取邮件标签列表失败');
                });
            },
            /* 新建并更新 */
            updateTag(id) {
                util.ajaxMail({
                    url: '/mail/maillabel/all',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        createUserId: this.userId
                    }
                }).then(res => {
                    if (res.data.code === 1) {
                        this.tagList = res.data.data;
                        this.operateTag(id, 1);
                    }
                });
            },
            /** 新建保存标签 */
            saveTag() {
                if (!this.tagName) {
                    this.$Message.warning(this.$t('mailSetting.MailTag.tagNameEmptyTip'));
                    return;
                } else if (this.tagName.realLength() > 20) {
                    this.$Message.warning(this.$t('mail.overLengthWarning'));
                    return;
                }
                const sameTagIndex = this.tagList.findIndex(item => item.labelName === this.tagName);
                if (sameTagIndex !== -1) {
                    this.$Message.warning(this.$t('mail.repeatedTagName'));
                    return;
                }
                if (!this.fontColorValue || !this.fontColorValue.length) {
                    this.$Message.warning('标签颜色不能为空');
                    return;
                }
                if (this.tagList.includes(this.tagName)) {
                    const tag = this.tagList.filter(item => {
                        return item.labelName === this.tagName;
                    });
                    this.addModal = false;
                    this.tagName = '';
                    this.operateTag(tag[0].id, 1);
                    return;
                }
                const jsonData = {
                    createUserId: this.userId,
                    createUserName: this.userName,
                    labelColor: this.fontColorValue,
                    labelName: this.tagName,
                    orgId: this.enterpriseId
                };
                util.ajaxMailJson({
                    url: '/mail/maillabel/add',
                    method: 'post',
                    data: jsonData
                }).then(res => {
                    if (res.data.code === 1) {
                        this.tagName = '';
                        this.addModal = false;
                        this.$Message.success(this.$t('mail.addTagsSuccess'));
                        this.updateTag(res.data.data.id, 1);
                    } else {
                        this.$Message.error(res.data.msg);
                    }
                });
            },
            /** 给邮件增加删除标签 ,参数1增加/删除的标签id;参数2增加1删除0 */
            operateTag(label, type) {
                if (label === 'addtag') {
                    this.addModal = true;
                    return;
                }
                const temp = this.tagList.find(item => item.id === label);
                const tagLabelId = this.formValidate.tagLabelId.length ? this.formValidate.tagLabelId.split(',') : [];
                const flag = tagLabelId.some(item => item.id === label);
                if (!flag) {
                    let arr = [];
                    if (this.formValidate.tagLabelId.length) {
                        arr = this.formValidate.tagLabelId.split(',');
                        arr.push(temp.id);
                        arr.join(',');
                    } else {
                        arr.push(temp.id);
                        arr.join(',');
                    }
                    this.formValidate.tagLabelId = arr.join(',');
                    this.labelDefaultStatus = temp;
                    this.$Message.success(this.$t('mail.setMailLabelSuccess'));
                }
            },
            /**
             * 移动到自定义文件夹
             */
            moveTo(val) {
                if (val === -1) {
                    return false;
                }
                let tempName = '';
                const getTemp = (arr) => {
                    for (let i = 0; i < arr.length; i++) {
                        const item = arr[i];
                        if (item.id === val) {
                            tempName = item.boxTypeName;
                            continue;
                        }
                        if (item.list && item.list.length > 0) {
                            getTemp(item.list);
                        }
                    }
                };
                getTemp(this.customFolders);
                this.formValidate.transferId = val;
                this.formValidate.transferName = tempName;
            },
            // 自定义文件夹 tree 渲染结构
            foldersRenderContent(h, { root, data, store }) {
                if (data.list && data.list.length) {
                    return (
                        <div style="width:100%; padding-right:20px" on-click={() => { event.stopPropagation(); }}>
                            <Tooltip placement="top"
                                    content={data.boxTypeName}
                                    transfer>
                                <span on-click={() => { event.stopPropagation(); this.$refs.dropdown.handleClick(); this.moveTo(data.id); }}
                                      style="width:100%;display:block;font-size:14px;">{this.$dym.characterOmitStr(data.boxTypeName, 20)}</span>
                            </Tooltip>
                        </div>
                    );
                } else {
                    return (
                        <Tooltip placement="top"
                                content={data.boxTypeName}
                                transfer>
                            <DropdownItem
                                key={data.id}
                                command={data.id}
                                class="mail-movetofolder">
                                { this.$dym.characterOmitStr(data.boxTypeName, 20) }
                            </DropdownItem>
                        </Tooltip>
                    );
                }
            },
            // 树节点展开，记录展开节点 id，控制默认展开项
            tree_node_expand(val) {
                this.expandedIdList.push(val.id);
            },
            // 树节点收起，清空收起节点 id，控制默认展开项
            tree_node_collapse(val) {
                // 使用递归获取该节点及其子节点id数组
                const allChildrenIdArr = [];
                function getAllChildrenId(node) {
                    allChildrenIdArr.push(node.id);
                    if (node.list != null) {
                        node.list.forEach(item => {
                            getAllChildrenId(item);
                        });
                    }
                }
                getAllChildrenId(val);

                // 收起时要去掉该节点及其子节点
                const expandedIdArr = [];
                this.expandedIdList.forEach(item => {
                    if (allChildrenIdArr.indexOf(item) === -1) {
                        expandedIdArr.push(item);
                    }
                });
                this.expandedIdList = expandedIdArr;
            },
            /* 通过用户ID获取发件人邮箱列表 */
            getAccountsByUserId() {
                util.ajaxMailJson({
                    url: `/mail/mailAccounts/user/${this.enterpriseId}/${this.userId}`,
                    method: 'get',
                    params: {
                        userId: this.userId // 登陆人的userid
                    }
                }).then(response => {
                    if (response.data.code === 1) {
                        const arr = response.data.data.accountList.map((item) => {
                            return {
                                id: item.emailAddress,
                                emailAddress: item.emailAddress
                            };
                        });
                        this.senders.push(...arr);
                        if (this.formValidate.id) {
                            for (let i = 0; i < this.senders.length; i++) {
                                for (let j = 0; j < this.formValidate.emailRange.length; j++) {
                                    if (this.formValidate.emailRange[j] == this.senders[i].id) {
                                        this.emailRangeDefaultStatus.push(this.senders[i]);
                                    }
                                    if (this.formValidate.emailRange[j] === 'all' && this.senders[i].id === -1) {
                                        this.emailRangeDefaultStatus.push(this.senders[i]);
                                    }
                                }
                            }
                        } else {
                            this.emailRangeDefaultStatus.push(this.senders[0]);
                        }
                    } else {
                        this.$Message.error('getAccountsByUserId失败!');
                    }
                });
            }
        },
        watch: {
            // 监听 poptip 状态开启颜色选择框
            visible(val) {
                val && this.$refs.colorPicker.handleTrigger();
            },
            letAddModalShow: {
                handler(val) {
                    if (val) {
                        this.getCustomFolders();
                        this.getAccountsByUserId();
                        this.getTags();
                        this.getOptions('mailFrom', 0);
                        if (this.mailAddress) {
                            this.triggeringConditions[0].label = this.mailAddress;
                        }
                    }
                },
                immediate: true
            },
            editRulesInfo: {
                handler(val) {
                    if (val.id) {
                        const performOperationsTypeData = {};
                        const performOperationsType = JSON.parse(val.performOperationsType);
                        for (const k in performOperationsType) {
                            // 执行操作回填数据处理
                            switch (k) {
                                case '1':
                                    performOperationsTypeData.haveReadChecked = true;
                                    break;
                                case '2':
                                    performOperationsTypeData.starChecked = true;
                                    break;
                                case '3':
                                    performOperationsTypeData.pendingChecked = true;
                                    break;
                                case '4':
                                    performOperationsTypeData.tagLabelChecked = true;
                                    performOperationsTypeData.tagLabelId = performOperationsType[k] ? String(performOperationsType[k]).split(',') : [];
                                    break;
                                case '5':
                                    performOperationsTypeData.moveToChecked = true;
                                    performOperationsTypeData.transferId = performOperationsType[k];
                                    break;
                            }
                        }
                        // 触发条件数据处理
                        const triggeringConditions = [];
                        const conditionsJson = JSON.parse(val.conditionsJson);
                        let isIn;
                        const conditionsRelationType = val.conditionsRelation === 1 ? '$and' : '$or'
                        conditionsJson.$or[0][conditionsRelationType].forEach((item, index) => {
                            let label = '';
                            // 预置规则的触发条件关键词字段存在数组格式，需要转成字符串
                            if (Array.isArray(Object.values(item[Object.keys(item)[0]])[0])) {
                                label = Object.values(item[Object.keys(item)[0]])[0].join(',');
                            } else {
                                label = Object.values(item[Object.keys(item)[0]])[0];
                            }
                            triggeringConditions.push({
                                value: Object.keys(item)[0],
                                type: Object.keys(item[Object.keys(item)[0]])[0],
                                label: label,
                                options: [...this.options]
                            });
                            this.getOptions(Object.keys(item)[0], index);
                            if (Object.keys(item[Object.keys(item)[0]])[0] === '$in') {
                                isIn = true;
                            }
                        });
                        // 回填预置规则有 $in 需要拼接回显字段
                        if (isIn) {
                            this.symbolOptions.push({
                                value: '$in', label: this.$t('mailSetting.sendReceiveRules.belong')
                            });
                        }
                        let effectActionMailType = [];
                        switch (val.effectActionMailType) {
                            case 1:
                                effectActionMailType = ['1'];
                                break;
                            case 2:
                                effectActionMailType = ['2'];
                                break;
                            case 3:
                                effectActionMailType = ['1', '2'];
                                break;
                        }
                        this.formValidate = {
                            ...this.formValidate,
                            id: val.id,
                            ruleName: val.ruleName, // 规则名称
                            effectActionType: String(val.effectActionType), // 触发时机
                            conditionsRelation: val.conditionsRelation ? val.conditionsRelation : 1,
                            effectActionMailType, // 自动触发的箱体选择
                            isHistory: val.isHistory >= 0 ? String(val.isHistory) : '', // 是否应用历史数据
                            emailRange: val.emailRange.split(','), // 应用于邮箱范围
                            performOperationsType: performOperationsType,
                            tagLabelId: performOperationsTypeData.tagLabelId, // 执行操作 --- 标记
                            transferId: performOperationsTypeData.transferId
                        };
                        this.haveReadChecked = Boolean(performOperationsTypeData.haveReadChecked);
                        this.pendingChecked = Boolean(performOperationsTypeData.pendingChecked);
                        this.starChecked = Boolean(performOperationsTypeData.starChecked);
                        this.tagLabelChecked = Boolean(performOperationsTypeData.tagLabelChecked);
                        this.moveToChecked = Boolean(performOperationsTypeData.moveToChecked);
                        this.triggeringConditions = triggeringConditions; // 触发条件
                        this.historyRange = val.historyRange ? val.historyRange.split(',') : [];
                    }
                },
                immediate: true,
                deep: true
            }
        }
    };
</script>
<style lang="less" scoped>
    .new_rules{
        max-height: 55vh;
        overflow-y: auto;
        margin: 0 -20px;
        padding: 0 18px 0 20px;
    }

    .add-contact {
        & /deep/ .el-dialog__title {
            font-weight: bold;
        }
        & /deep/ .el-form-item {
            font-size: 12px;
            margin-bottom: 11px;
        }
    }
    .form-special-width{
        & /deep/ .el-form-item__label{
            width: 120px !important;
        }
    }
    .isHistoryClass{
        & /deep/ .el-form-item__label{
            margin-left: 10px;
        }
    }
    .trigger_timing_tip{
        color: #F56C6C;
        font-size: 12px;
        height: 12px;
        line-height: 12px;
    }
    .effectActionTypeClass{
        & /deep/ .el-radio__label{
            font-size: 12px;
        }
    }
    .triggeringConditionsClass{
        display: block;
        position: relative;
        left: -70px;
        margin-right: -70px;
        margin-top: 40px;
        font-size: 12px;
        & /deep/ .el-input__inner{
            font-size: 12px;
        }
    }
    .write_mail_tag_modal .color > ul > li {
        width: 16px;
        height: 16px;
        color: #fff;
        float: left;
        cursor: pointer;
        margin-right: 25px;
        text-align: center;
        line-height: 16px;
    }
    .english_size{
        & /deep/ .el-form-item__label{
            width: 150px!important;
        }
    }
    
    .layermain {

        .label_color{
            display: flex;
            height: 42px;
            align-items: center;
            
            .label_color_title{
                display: inline-block;
                font-size: 14px;
                width: 80px;
                text-align: left;
                color: #333;
            }

            /deep/ .label_color_item{
                border-radius: 4px;
                border: 1px solid #DCDFE6;
                color: #606266;
                display: inline-block;
                font-size: 12px;
                height: 32px;
                line-height: 32px;
                padding: 0 15px;
                flex: 1;
                text-align: left;
                cursor: pointer;
                position: relative;

                i.label_color_icon{
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    background: #4285F2;
                    border-radius: 3px;
                    position: relative;
                    top: 3px;
                }

                &:hover{
                    border-color: #4285F2;
                    box-shadow: 0 3px 0 0 #4285F2;
                }

                .el-select__caret{
                    color: #C0C4CC;
                    font-size: 14px;
                    transition: transform .3s;
                    transform: rotateZ(180deg);
                    cursor: pointer;
                    &.is-reverse{
                        transform: rotateZ(0deg);
                    }
                }
            }
        }
    }

    .mail-default-color{
        height: 0px;
        width: 0px;

        /deep/ .el-color-picker__trigger{
            height: 0px;
        }
    }

    .add-tag{
        /deep/ .el-dialog__body{
            padding: 18px 24px;
            .el-form-item{
                margin-bottom: 16px;
                .el-form-item__label{
                    color: #333;
                    font-size: 14px;
                }
            }
        }
        /deep/ .el-dialog__footer{
            padding-top: 20px;
        }
    }
</style>
<style lang="less">

    .labelDefaultColorPicker{
        .el-color-dropdown__btns{
            .el-color-dropdown__btn{
                height: 28px;
                width: 52px;
                padding: 0 10px;
            }
        }
        .el-color-predefine{
            width: 100%;
        }
        .el-color-predefine__colors{
            .el-color-predefine__color-selector{
                border-radius: 6px;
                margin-left: 13px;
                &:nth-child(1){
                    margin-left: 0;
                }
            }
        }
    }
</style>
