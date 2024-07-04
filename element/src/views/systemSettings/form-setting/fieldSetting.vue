<template>
    <div v-loading="loading"
         class="form-field-setting">
        <!-- 添加/编辑 字段模态框 -->
        <Modal :visible.sync="modalShow"
               :title="modalOption === 'update' ? $t('crm.InqSet.editField') : $t('crm.InqSet.addField')"
               width="600px"
               :append-to-body="true"
               :modal-append-to-body="false"
               @close="cancel"
               class="field-modal">
            <p class="editTips" v-if="modalOption === 'update'">字段编辑后，表单模板中的字段不会同步修改，如需修改请前往表单模板重选字段</p>
            <Form label-width="80px"
                  label-position="left"
                  style="margin:0 14px;">
                <Row>
                    <Col v-for="(item, index) in modalItems"
                         :key="index"
                         :span="24">
                        <!-- 如果表单项的 show 属性为 0 ，那么显示该表单项 -->
                        <template v-if="item.show === '0'">
                            <FormItem v-if="item.type === 'text'" :label="item.name" required>
                                <Input v-model="item.value" :maxlength="item.maxLength" show-word-limit></Input>
                            </FormItem>
                            <FormItem v-else-if="item.type === 'select'"
                                      :label="item.name">
                                <Select v-if="modalShow"
                                        :disabled="selectTypeDisabled"
                                        v-model="item.value"
                                        @change="item.onchange">
                                    <Option v-for="(optionValue, index) in item.options"
                                            :key="index"
                                             :value="optionValue"
                                            :label="optionValue"></Option>
                                </Select>
                            </FormItem>
                            <FormItem v-else-if="item.type === 'switch'"
                                      style="margin: 0;"
                                      :label="item.name">
                                <Checkbox v-model="item.value">&nbsp;</Checkbox>
                            </FormItem>
                        </template>
                        <!-- 如果不为 0 ，且该表单项的 show 属性等于实例的 modalType 属性，显示该表单项  -->
                        <template v-else-if="item.show === modalType">
                            <FormItem v-if="item.type === 'text'" :label="item.name">
                                <Input v-model="item.value" :maxlength="item.maxLength" show-word-limit></Input>
                            </FormItem>
                            <FormItem v-else-if="item.type === 'textarea'"
                                      :label="item.name">
                                <Input v-model="item.value"
                                       type="textarea"
                                       show-word-limit
                                       :autosize="{minRows: 2,maxRows: 5}" :maxlength="item.maxLength"></Input>
                            </FormItem>
                            <FormItem v-else-if="item.type === 'listItem'"
                                      ref="listItemDrop"
                                      :label="item.name">
                                <div v-if="isShowFieldList" class="isShowFieldList">
                                    <Row v-for="(listItem, itemIndex) in item.value"
                                        :key="itemIndex"
                                        :style="`${itemIndex === (item.value.length - 1) ? 'margin-bottom:0;' : 'margin-bottom:12px;'}`">
                                        <Col :span="20">
                                            <Input type="text" v-model="item.value[itemIndex]" maxlength="100" show-word-limit></Input>
                                        </Col>
                                        <Col
                                            v-if="itemIndex === 0"
                                            :span="2"
                                            style="text-align:right;">
                                            <Icon
                                                size=18
                                                class="custom custom-add-circle"
                                                @click.native="modalAddListItem(itemIndex)"
                                                style="cursor: pointer;"></Icon>
                                        </Col>
                                        <Col v-if="itemIndex > 0"
                                            :span="2"
                                            style="text-align:right;">
                                            <Icon
                                                size=18
                                                class="custom custom-reduce-circle"
                                                @click.native="modalDeleteListItem(itemIndex)"
                                                style="cursor: pointer;"></Icon>
                                        </Col>
                                        <Col :span="2"
                                            style="text-align:right;">
                                            <!-- 拖拽排序 -->
                                            <Icon custom="custom-drag-and-drop"
                                                :size="16"
                                                style="cursor: pointer;color: #AFBBC9;"></Icon>
                                        </Col>
                                    </Row>
                                </div>
                            </FormItem>
                            <FormItem v-else-if="item.type === 'select'"
                                      :label="item.name">
                                <Select v-model="item.value"
                                        @change="item.onchange"
                                        ref="selectDayType">
                                    <Option v-for="(optionValue, index) in item.options"
                                            :key="index"
                                            :value="optionValue"
                                            :label="optionValue"></Option>
                                </Select>
                            </FormItem>
                        </template>
                    </Col>
                </Row>
            </Form>
            <div slot="footer">
                <Button size="large"
                        @click="cancel">{{ $t('crm.InqSet.modal_cancel') }}</Button>
                <Button type="primary"
                        size="large"
                        :loading="saveLoading"
                        @click="ok(modalOption)">{{ modalOption === 'update' ? $t('save') : $t('crm.InqSet.modal_ok') }}</Button>
            </div>
        </Modal>
        <!-- 新增按钮 -->
        <div class="_f _j_e" style="padding: 0 30px;">
            <Button type="primary"
                    size="large"
                    @click="addField(3)"
                    class="addField">{{ $t('crm.InqSet.addCustomField') }}</Button>
        </div>
        <Form label-width="130px">
            <Row type="flex"
                 ref="sort-type">
                <template v-for="item in defaultFieldList">
                    <Col class="default-field" :xs="24" :sm="24" :md="12" :key="item.key">
                        <FormItem :label="`${item.name} :`" :key="item.key">
                            <!-- 文本框型 -->
                            <template v-if="item.type === 'input'">
                                <Input :value="item.value"
                                        readonly
                                        :placeholder="item.colDefaultValue"
                                        :maxlength="item.maxLength"
                                        show-word-limit></Input>
                            </template>
                            <!-- 单选型 -->
                            <template v-else-if="item.type === 'select' || item.type === 'selectMultiple'">
                                <template v-if="item.key === 'a10014'">
                                    <RadioGroup>
                                        <Radio v-for="(radioItem, index) in item.option.split('?')"
                                                :key="index"
                                                disabled
                                                :label="radioItem">{{ radioItem }}</Radio>
                                    </RadioGroup>
                                </template>
                                <template v-else>
                                    <Select disabled
                                            :value="''"
                                            :placeholder="item.colDefaultValue || $t('crm.Modal.tip_select')">
                                        <template v-for="(valueItem, index) in item.option.split('?')">
                                            <Option :key="index"
                                                    :value="valueItem"
                                                    :label="valueItem"></Option>
                                        </template>
                                    </Select>
                                </template>
                            </template>
                            <!-- 文本域型 -->
                            <template v-else-if="item.type === 'textarea'">
                                <Input type="textarea"
                                        :value="item.value"
                                        readonly
                                        :rows="4"
                                        :placeholder="item.colDefaultValue"
                                        :maxlength="item.maxLength"
                                        show-word-limit
                                        class="fieldSet-textArea"></Input>
                            </template>
                            <!-- 星级型 -->
                            <template v-else-if="item.type === 'rate'">
                                <Rate :value="5"
                                        disabled
                                        :icon-classes="['custom custom-star', 'custom custom-star', 'custom custom-star']"
                                        disabled-void-icon-class="custom custom-star"
                                        style="height: 40px;line-height: 40px;"></Rate>
                            </template>
                            <!-- 级联型 国家地区 -->
                            <template v-else-if="item.type === 'cascader'">
                                <Cascader :options="item.value"
                                            disabled></Cascader>
                            </template>
                            <!-- radio 型 -->
                            <template v-else-if="item.type === 'radio'">
                                <RadioGroup>
                                    <Radio v-for="(radioItem, index) in item.value"
                                            :key="index"
                                            disabled
                                            :label="radioItem">{{ radioItem }}</Radio>
                                </RadioGroup>
                            </template>
                            <!-- 文件型 -->
                            <template v-else-if="item.type === 'file'">
                                <Button disabled
                                        icon="ivu-icon ivu-icon-plus-round"
                                        class="uploadCorpPic"></Button>
                            </template>
                            <!-- 操作按钮 -->
                            <div class="icon-wrap">
                                <!-- 编辑按钮 -->
                                <Icon v-if="lang_type_editAllowed.hasOwnProperty(item.type) && item.key !=='a10014' "
                                        custom="custom-field-edit"
                                        size="12"
                                        @click.native="editField(item)"></Icon>
                                <Icon v-if="!['a10014','a1009'].includes(item.key)" custom="custom-field-delete"
                                          size="12"
                                          @click.native="deleteField(item)"></Icon>
                            </div>
                        </FormItem>
                    </Col>
                </template>
            </Row>
        </Form>

        <!-- 删除确认 -->
        <Modal :visible.sync="showDeleteModal"
               :title="$t('crm.InqSet.deleteTile')"
               width="540px"
               :append-to-body="true"
               :modal-append-to-body="false"
               class="field-modal">
            <div v-html="deleteTip"></div>
            <div slot="footer">
                <Button size="large"
                        @click="showDeleteModal = false">{{ $t('crm.InqSet.modal_cancel') }}</Button>
                <Button type="primary"
                        size="large"
                        @click="deleteFieldAnyhow">{{ $t('crm.InqSet.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import Sortable from 'sortablejs';
    import { mapState } from 'vuex';
    // import { fieldSetting } from '@/api/systemSettings/inquirySetting/index';
    // const { orderColumnAll } = fieldSetting;
    export default {
        name: 'FieldSetting',
        props: {},
        data() {
            return {
                loading: true,
                showDeleteModal: false,
                templateId: '',
                /* 模态框 */
                // 添加字段模态框 是否显示
                modalShow: false,
                // 添加字段模态框提交按钮触发的是添加还是更新，其值为 update / save
                modalOption: '',
                // 更新自定义字段时的暂存自定义字段属性对象
                tempField: {},
                // 保证当前保存/更新操作未完成之前不允许再次触发保存/更新，防止字段顺序错误
                saveLoading: false,
                // 添加字段模态框的 字段类型选择
                selectType: '',
                // 添加字段模态框的 字段类型选择 是否禁用
                selectTypeDisabled: false,
                // 添加字段模态框的 日期类型选择
                selectDayType: '',
                // 添加字段模态框 内部表单 的表单项
                modalItems: {
                    fieldType: {
                        show: '0',
                        type: 'select',
                        name: this.$t('crm.InqSet.fieldType'),
                        options: [
                            this.$t('crm.InqSet.textInput'),
                            this.$t('crm.InqSet.textArea'),
                            this.$t('crm.InqSet.selectSingle'),
                            this.$t('crm.InqSet.selectMultiple'),
                            // this.$t('crm.InqSet.date'),
                            this.$t('crm.InqSet.longTextArea')
                        ],
                        value: this.$t('crm.InqSet.textInput'),
                        onchange: () => {
                            this.selectType = this.modalItems.fieldType.value;
                        }
                    },
                    fieldName: {
                        show: '0',
                        type: 'text',
                        maxLength: 100,
                        name: this.$t('crm.InqSet.fieldName'),
                        value: ''
                    },
                    fieldTextDefault: {
                        show: '1',
                        type: 'text',
                        maxLength: 100,
                        name: this.$t('crm.InqSet.defaultValue'),
                        value: ''
                    },
                    fieldTextareaDefault: {
                        show: '2',
                        type: 'textarea',
                        maxLength: 300,
                        name: this.$t('crm.InqSet.defaultValue'),
                        value: ''
                    },
                    fieldSelectDefault: {
                        show: '3',
                        type: 'text',
                        name: this.$t('crm.InqSet.defaultValue'),
                        value: ''
                    },
                    fieldListItems: {
                        show: '3',
                        type: 'listItem',
                        name: this.$t('crm.InqSet.selectItemsContent'),
                        value: ['']
                    },
                    fieldDayType: {
                        show: '4',
                        type: 'select',
                        name: this.$t('crm.InqSet.dateType'),
                        options: [`${this.$t('crm.InqSet.date')} + ${this.$t('crm.InqSet.time')}`, this.$t('crm.InqSet.date')],
                        value: `${this.$t('crm.InqSet.date')} + ${this.$t('crm.InqSet.time')}`,
                        onchange: () => {
                            this.selectDayType = this.$refs.selectDayType[0].model;
                        }
                    },
                    fieldTimeDefault: {
                        show: '4',
                        type: 'text',
                        name: this.$t('crm.InqSet.defaultValue'),
                        value: ''
                    }
                },
                field_long_limit: {
                    cname: {
                        lang: this.$t('crm.fieldLimit.cname'),
                        limit: 100
                    },
                    option: {
                        lang: this.$t('crm.fieldLimit.option'),
                        limit: 5000
                    },
                    colDefaultValue: {
                        lang: this.$t('crm.fieldLimit.colDefaultValue'),
                        limit: 500
                    }
                },

                // 允许编辑的默认字段的 type 的中英文
                lang_type_editAllowed: {
                    input: this.$t('crm.InqSet.textInput'),
                    textarea: this.$t('crm.InqSet.textArea'),
                    select: this.$t('crm.InqSet.selectSingle'),
                    selectMultiple: this.$t('crm.InqSet.selectMultiple'),
                    // date: this.$t('crm.InqSet.date'),
                    // 'date+time': this.$t('crm.InqSet.date')
                },
                /* 表单 */
                // 企业信息表单的 表单项
                defaultFieldList: [],
                deleteTip: '',
                deleteFieldObj: null,
                isShowFieldList: true,
                optionsStaus: true,
                addModalSortable: null
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId'
            }),
            // 根据添加字段模态框的 字段类型 和 日期类型 ， 为模态框显示不同的表单项
            // 格式为最多2位的数字字符串
            // 第一位， 0 表示始终显示， 1-4 表示 文本框，文本域，单选，日期
            // 第二位， 0 表示始终显示， 1-2 表示 日期+时间，日期
            modalType() {
                switch (this.selectType) {
                    case '':
                    case this.$t('crm.InqSet.textInput'):
                        return '1';
                    case this.$t('crm.InqSet.textArea'):
                    case this.$t('crm.InqSet.longTextArea'):
                        return '2';
                    case this.$t('crm.InqSet.selectSingle'):
                    case this.$t('crm.InqSet.selectMultiple'):
                        return '3';
                    case this.$t('crm.InqSet.date'):
                        return '4';
                    default:
                        return undefined;
                }
            }
        },
        methods: {
            // 获取自定义字段
            getDefaultAndColumnsFields() {
                this.$commonApi.getXSShow({
                    orgId: this.enterpriseId
                }).then(response => {
                    if (response.code === '1') {
                        const data = response.data;
                        const defaultFieldList = [];
                        Object.entries(data.show).forEach(([key, value]) => {
                            const obj = value;
                            obj.key = key;
                            defaultFieldList.push(obj);
                        });
                        this.defaultFieldList = [].concat(defaultFieldList);
                        this.templateId = data.template.id;
                    } else {
                        this.$Message.error(response.message);
                    }
                    this.loading = false;
                });
            },
            // 点击添加字段模态框
            addField() {
                if (this.defaultFieldList.length >= 30) {
                    this.$Message.warning('自定义字段数量上限是30');
                    return;
                }
                // 初始化
                this.selectType = '';
                this.selectDayType = '';
                this.selectTypeDisabled = false;

                this.modalOption = 'save';
                this.modalShow = true;

                this.modalItems = {
                    fieldType: {
                        show: '0',
                        type: 'select',
                        name: this.$t('crm.InqSet.fieldType'),
                        options: [
                            this.$t('crm.InqSet.textInput'),
                            this.$t('crm.InqSet.textArea'),
                            this.$t('crm.InqSet.selectSingle'),
                            this.$t('crm.InqSet.selectMultiple')
                        ],
                        value: this.$t('crm.InqSet.textInput'),
                        onchange: () => {
                            this.selectType = this.modalItems.fieldType.value;
                            if (this.selectType === this.$t('crm.InqSet.selectSingle') || this.selectType === this.$t('crm.InqSet.selectMultiple')) {
                                this.$nextTick(() => {
                                    // 创建可排序列表
                                    this.creatSortable();
                                });
                            }
                        }
                    },
                    fieldName: {
                        show: '0',
                        type: 'text',
                        maxLength: 100,
                        name: this.$t('crm.InqSet.fieldName'),
                        value: ''
                    },
                    fieldTextDefault: {
                        show: '1',
                        type: 'text',
                        maxLength: 100,
                        name: this.$t('crm.InqSet.defaultValue'),
                        value: ''
                    },
                    fieldTextareaDefault: {
                        show: '2',
                        type: 'textarea',
                        maxLength: 300,
                        name: this.$t('crm.InqSet.defaultValue'),
                        value: ''
                    },
                    fieldSelectDefault: {
                        show: '3',
                        type: 'text',
                        name: this.$t('crm.InqSet.defaultValue'),
                        value: ''
                    },
                    fieldListItems: {
                        show: '3',
                        type: 'listItem',
                        name: this.$t('crm.InqSet.selectItemsContent'),
                        value: ['']
                    },
                    fieldDayType: {
                        show: '4',
                        type: 'select',
                        name: this.$t('crm.InqSet.dateType'),
                        options: [`${this.$t('crm.InqSet.date')} + ${this.$t('crm.InqSet.time')}`, this.$t('crm.InqSet.date')],
                        value: `${this.$t('crm.InqSet.date')} + ${this.$t('crm.InqSet.time')}`,
                        onchange: () => {
                            this.selectDayType = this.$refs.selectDayType[0].model;
                        }
                    },
                    fieldTimeDefault: {
                        show: '4',
                        type: 'text',
                        name: this.$t('crm.InqSet.defaultValue'),
                        value: ''
                    }
                };
                this.modalItems.fieldType.onchange();
                // 如果选择字段类型被禁用则恢复其为可选
            },
            // 点击修改自定义字段图标
            editField(temp) {
                this.tempField = Object.assign({}, temp);
                // 根据自定义字段类型分情况回填数据
                this.modalItems.fieldName.value = this.tempField.name;
                // this.modalItems.fieldRequired.value = Number(this.tempField.mustInput) === 1;
                switch (this.tempField.type) {
                    case 'input':
                        this.modalItems.fieldType.value = this.$t('crm.InqSet.textInput');
                        this.modalItems.fieldTextDefault.value = this.tempField.colDefaultValue;
                        break;
                    case 'textarea':
                        this.modalItems.fieldType.value = this.$t('crm.InqSet.textArea');
                        this.modalItems.fieldTextareaDefault.value = this.tempField.colDefaultValue;
                        break;
                    case 'select':
                        this.modalItems.fieldType.value = this.$t('crm.InqSet.selectSingle');
                        this.modalItems.fieldListItems.value = this.tempField.option.split('?');
                        this.modalItems.fieldSelectDefault.value = this.tempField.colDefaultValue;
                        break;
                    case 'selectMultiple':
                        this.modalItems.fieldType.value = this.$t('crm.InqSet.selectMultiple');
                        this.modalItems.fieldListItems.value = this.tempField.option.split('?');
                        this.modalItems.fieldSelectDefault.value = this.tempField.colDefaultValue;
                        break;
                    case 'date':
                        this.modalItems.fieldType.value = this.$t('crm.InqSet.date');
                        this.modalItems.fieldDayType.value = this.$t('crm.InqSet.date');
                        this.modalItems.fieldTimeDefault.value = this.tempField.colDefaultValue;
                        break;
                    case 'date+time':
                        this.modalItems.fieldType.value = this.$t('crm.InqSet.date');
                        this.modalItems.fieldDayType.value = `${this.$t('crm.InqSet.date')} + ${this.$t('crm.InqSet.time')}`;
                        this.modalItems.fieldTimeDefault.value = this.tempField.colDefaultValue;
                }
                this.selectType = this.modalItems.fieldType.value;
                this.selectTypeDisabled = true; // 如果选择字段类型可选则将其禁用
                this.modalOption = 'update';
                this.modalShow = true;
                if (this.selectType === this.$t('crm.InqSet.selectSingle') || this.selectType === this.$t('crm.InqSet.selectMultiple')) {
                    this.$nextTick(() => {
                        // 创建可排序列表
                        this.creatSortable();
                    });
                }
            },
            // 点击删除自定义字段图标
            deleteField(item) {
                this.deleteFieldObj = item;
                // 获得该字段正在被哪些表单使用，给出提示
                this.$util.ajax({
                    url: '/form-cust/column/deleteFiledForClue',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        storageName: item.key,
                        templateId: this.templateId,
                        type: 1 // type: 1 查询, 2 操作
                    }
                }).then(response => {
                    // 根据返回结果的不同, 显示不同的删除确认提示信息
                    switch (response.data.code) {
                        case '1':
                            // 被删除字段没有被留言表单使用
                            // 提示用户: 删除后无法在线索模块查看字段信息
                            this.deleteTip = `${this.$t('clue.field')}${item.name}${this.$t('clue.clueSetDelTip1')}`;
                            break;
                        case '-100':
                            // 字段已被其他用户删除
                            // 提示字段已被其他用户删除并刷新
                            this.$Message.info(`${this.$t('clue.field')}${item.name}${this.$t('clue.clueSetDelTip7')}`);
                            // 刷新数据
                            this.getDefaultAndColumnsFields();
                            break;
                        default:
                            // 被删除字段有被留言表单使用
                            if (response.data.data) {
                                // 整理得到的数据得到提示语
                                // 获取'正在使用该字段的表单数组'
                                const usedArr = Object.values(response.data.data.templateNames);
                                // 获取'只含有该字段的表单数组'
                                const onlyArr = response.data.data.lastFields;

                                // 拼接得到要放到提示语中的"正在使用"表单字符串, 格式为: 中文: 【A】、【B】和【C】, 英文: [A],[B] and [C]
                                let usedStr = usedArr.slice(0, usedArr.length - 1).map(formName => `${this.$t('openBracket')}${formName}${this.$t('closedBracket')}`).join(this.lang === 'zh-CN' ? '、' : ', ');
                                if (usedArr.length > 1) {
                                    usedStr += this.lang === 'zh-CN' ? '和' : ' and ';
                                }
                                usedStr += `${this.$t('openBracket')}${usedArr[usedArr.length - 1]}${this.$t('closedBracket')}`;

                                // 有表单只包含这一个字段
                                if (onlyArr.length) {
                                    // 拼接得到要放到提示语中的"唯一字段"表单字符串, 格式为: 中文: 【A】、【B】和【C】, 英文: [A],[B] and [C]
                                    let onlyStr = onlyArr.slice(0, onlyArr.length - 1).map(formName => `${this.$t('openBracket')}${formName}${this.$t('closedBracket')}`).join(this.lang === 'zh-CN' ? '、' : ', ');
                                    if (onlyArr.length > 1) {
                                        onlyStr += this.lang === 'zh-CN' ? '和' : ' and ';
                                    }
                                    onlyStr += `${this.$t('openBracket')}${onlyArr[onlyArr.length - 1]}${this.$t('closedBracket')}`;

                                    // 提示用户, 因为有表单只包含这一个字段, 所以无法删除;
                                    this.deleteTip = `${this.$t('clue.field')}${item.name}${this.$t('clue.clueSetDelTip2')}${usedStr}${this.$t('clue.clueSetDelTip4')}${onlyStr}${this.$t('clue.clueSetDelTip5')}${item.name}${this.$t('clue.clueSetDelTip6')}`;
                                    // 标记为不可删除
                                    this.canDelete = false;
                                } else {
                                    // 提示用户, 有表单模板使用了此字段, 删除字段后将同步删除这些模板字段
                                    this.deleteTip = `${this.$t('clue.field')}${item.name}${this.$t('clue.clueSetDelTip2')}${usedStr}${this.$t('clue.clueSetDelTip3')}`;
                                    // 标记为可删除
                                    this.canDelete = true;
                                }
                            } else {
                                // 查询失败
                                // 报错
                                this.$Message.error(this.$t('crm.Html.errorOccurred'));
                            }
                    }
                    // 去掉页面 loading
                    this.loading = false;
                    // 显示删除确认框
                    if (this.deleteTip) {
                        this.showDeleteModal = true;
                    }
                });
            },
            deleteFieldAnyhow() {
                // 发送删除字段（此处删除方式为隐藏）请求
                this.$util.ajax({
                    url: '/form-cust/column/deleteFiledForClue',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        storageName: this.deleteFieldObj.key,
                        templateId: this.templateId,
                        type: 2 // type: 1 查询, 2 操作
                    }
                }).then(response => {
                    switch (response.data.code) {
                        case '1':
                        case '-100':
                            // 关闭弹框
                            this.showDeleteModal = false;
                            // 提示删除成功
                            this.$Message.success(`${this.$t('clue.field')}${this.deleteFieldObj.name}${this.$t('clue.clueSetDelSuccess')}`);
                            // 刷新数据
                            this.getDefaultAndColumnsFields();
                            break;
                        default:
                            // 提示删除失败
                            this.$Message.error(`${this.$t('clue.clueSetDelFailed1')}${this.deleteFieldObj.name}${this.$t('clue.clueSetDelFailed2')}`);
                    }
                });
            },
            // 改变字段的顺序 暂时不用
            // endFunc(e) {
            //     if (e.newIndex !== e.oldIndex) {
            //         // 交换变换的序号数值
            //         const temp = this.defaultFieldList;
            //         temp.splice(e.newIndex, 0, ...temp.splice(e.oldIndex, 1));
            //         this.defaultFieldList = temp.slice();
            //         // 排序接口
            //         orderColumnAll({
            //             orgId: this.enterpriseId,
            //             parentId: this.fieldBelong,
            //             storageNames: temp.join(',')
            //         }).then(response => {
            //         });
            //     }
            // },
            endFunc2(e) {
                if (e.newIndex !== e.oldIndex) {
                    // 交换变换的序号数值
                    const temp = this.modalItems.fieldListItems.value;
                    temp.splice(e.newIndex, 0, ...temp.splice(e.oldIndex, 1));
                    this.isShowFieldList = false;
                    this.$nextTick(() => {
                        this.isShowFieldList = true;
                        this.$nextTick(() => {
                            this.creatSortable();
                        });
                    });
                }
            },
            // 添加字段模态框的 提交方法， 参数为 modalOption , 即 save / update
            ok(str) {
                // 获取数据，准备发送
                const obj = this.getModalItemsValue();
                const cname = obj.fieldName.trim();
                // 定义其余要发送的数据
                let type = '';
                let option = '';
                let colDefaultValue = '';
                if (cname.length > 0) {
                    switch (obj.fieldType) {
                        case this.$t('crm.InqSet.textInput'):
                            type = 'input';
                            colDefaultValue = obj.fieldTextDefault;
                            break;
                        case this.$t('crm.InqSet.textArea'):
                        case this.$t('crm.InqSet.longTextArea'):
                            type = 'textarea';
                            colDefaultValue = obj.fieldTextareaDefault;
                            break;
                        case this.$t('crm.InqSet.selectSingle'):
                        case this.$t('crm.InqSet.selectMultiple'):
                            type = 'select';
                            if (obj.fieldType === this.$t('crm.InqSet.selectMultiple')) {
                                type = 'selectMultiple';
                            }
                            colDefaultValue = obj.fieldSelectDefault;
                            option = obj.fieldListItems.filter(item => item);
                            break;
                        case this.$t('crm.InqSet.date'):
                            if (obj.fieldDayType === this.$t('crm.InqSet.date')) {
                                type = 'date';
                            } else if (obj.fieldDayType === `${this.$t('crm.InqSet.date')} + ${this.$t('crm.InqSet.time')}`) {
                                type = 'date+time';
                            }
                            colDefaultValue = obj.fieldTimeDefault;
                    }
                    option = Array.isArray(option) ? option.join('?') : '';
                    if (['select', 'selectMultiple'].includes(type) && !option) {
                        this.$Message.error('选项内容不能为空');
                        return;
                    }
                    this.saveLoading = true;
                    // 发送 保存当前自定义字段 请求
                    this.$util.ajaxJson({
                        url: '/form-cust/newtenant/column/saveFieldForClue',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            templateId: this.templateId,
                            addOrUpdate: str === 'save' ? 1 : 2,
                            fcolumn: {
                                cname,
                                colDefaultValue,
                                spare1: type,
                                spare2: option,
                                storageName: str === 'save' ? '' : this.tempField.key
                            }
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            // 刷新数据
                            this.getDefaultAndColumnsFields();
                            this.cancel();
                            // 成功
                            // 提示成功
                            this.$Message.success(this.$t('clue.clueSetAddSuccess3'));
                        } else {
                            // 其他错误
                            // 报错
                            this.$Message.error(`${this.$t('clue.clueSetAddFailed1')}${cname}${this.$t('clue.clueSetAddFailed2')}`);
                        }
                    });
                } else {
                    this.$Message.error(this.$t('crm.InqSet.error_fieldName'));
                }
            },
            // 添加字段模态框的 取消提交方法
            cancel() {
                this.modalShow = false;
                this.saveLoading = false;
                this.clearSortable();
            },
            // 请求模态框上已输入的信息
            getModalItemsValue() {
                // 临时存放表单项的值
                const obj = {};

                // 根据此时的字段类型，选取相应的表单项的值，填入请求数据，发送给后台
                Object.entries(this.modalItems).forEach(([key, item]) => {
                    if (item.show === '0' || item.show === this.modalType) {
                        obj[key] = item.value;
                    }
                });

                return obj;
            },
            // 添加字段模态框的类型为下拉框时
            // 列表内容 新增列表项方法
            modalAddListItem(index) {
                const temp = this.modalItems.fieldListItems.value.slice();
                if (temp.length >= 100) {
                    this.$Message.warning('选项数量上限是100');
                    return;
                }
                temp.splice(0, 0, '');
                this.$set(this.modalItems.fieldListItems, 'value', temp);
            },
            // 列表内容 删除列表项方法
            modalDeleteListItem(index) {
                const temp = this.modalItems.fieldListItems.value.slice();
                temp.splice(index, 1);
                this.$set(this.modalItems.fieldListItems, 'value', temp);
            },
            // 初始拖拽
            creatSortable() {
                this.clearSortable();
                this.addModalSortable = Sortable.create(this.$refs.listItemDrop[0].$el.querySelector('.isShowFieldList'), {
                    group: {
                        name: 'list',
                        pull: false,
                        put: false
                    },
                    animation: 120,
                    ghostClass: 'placeholder-style',
                    fallbackClass: 'iview-admin-cloned-item',
                    onEnd: this.endFunc2
                });
            },
            clearSortable() {
                if (this.addModalSortable) {
                    this.addModalSortable.destroy();
                    this.addModalSortable = null;
                }
            }
        },
        created() {
            // 获取三个表单的自定义字段项并填入 data 中的相应属性
            // 方法为获取默认字段和自定字段的总接口
            this.getDefaultAndColumnsFields();
        },
        mounted() {
            document.body.ondrop = function(event) {
                event.preventDefault();
                event.stopPropagation();
            };
            // const vm = this;
            // const field_sort = this.$refs['sort-type'].$el;
            // Sortable.create(field_sort, {
            //     group: {
            //         name: this.fieldBelong, // 标识拖拽范围, 这里使用 this.fieldBelong , 避免询盘设置页面三种不同 fieldBelong 的字段设置组件内部字段可相互拖动
            //         pull: false, // 内部拖拽元素不可拖出 dom
            //         put: false // 外部拖拽元素不可拖进 dom
            //     },
            //     animation: 120,
            //     ghostClass: 'placeholder-style',
            //     fallbackClass: 'iview-admin-cloned-item',
            //     onEnd: vm.endFunc
            // });
        },
        watch: {
            // inputLimit: {
            //     handler(val) {
            //         this.getDefaultAndColumnsFields();
            //     },
            //     deep: true
            // }
        }
    };
</script>

<style lang="less">
    .form-field-setting {
        position: relative;
        .el-input .el-input__count .el-input__count-inner{
            background-color: transparent;
        }
        .el-textarea .el-input__count{
            background-color: transparent;
            bottom: -2px;
        }
        .el-form {
            .el-row, .el-row--flex {
                flex-direction: row;
                flex-wrap: wrap;

                @media screen {
                    @media (min-width: 1200px) {
                        margin-right: 180px;
                    }
                    @media (max-width: 992px) {
                        margin: 0 100px 0 80px;
                    }
                    @media (max-width: 768px) {
                        margin: 0 60px 0 0;
                    }
                    @media (max-width: 544px) {
                        margin: 0 0 0 -40px;
                    }
                }

                .el-col {
                    @media screen {
                        @media (min-width: 992px) {
                            padding: 0 40px;
                        }
                    }
                }
            }
        }

        .el-select-dropdown__item {
            line-height: 25px;
            padding-left: 10px;
        }

        .el-row {
            margin-bottom: 10px;

            &:last-child {
                margin-bottom: 0;
            }
        }

        .addField {
            float: right;
        }

        .customField, .default-field {
            position: relative;

            .icon-wrap {
                position: absolute;
                right: 0;
                top: 0;
                height: 32px;
                width: 140px;
                vertical-align: middle;

                > * {
                    cursor: pointer;
                    padding-left: 15px;
                }

                .custom-field-recover {
                    padding-left: 45px;
                }

                .check-must-input {
                    margin: 0;
                }
            }

            .el-form-item__content > div:first-child {
                width: calc(~"100% - 150px");
            }
        }

        .customField {
            .el-input__inner[disabled] {
                background-color: white;
            }
        }
        .el-input__inner, .el-textarea__inner {
            padding-right: 50px;
        }
    }
</style>

<style lang="less" scoped>
    * /deep/ .el-form-item {
        margin: 15px 0;
        // .isShowFieldList, .options {
        //     max-height: 400px;
        //     overflow-y: auto;
        // }
    }

    * /deep/ .el-form-item__label {
        color: #303133;
        word-wrap: break-word;
        word-break: break-all;
    }

    .field-modal {
        .editTips {
            padding-left: 12px;
            line-height: 40PX;
            background: #FFF2E9;
            font-size: 14px;
            color: #303133;
        }
        /deep/ .el-select {
            width: 100%;
        }

        /deep/ .el-form-item {
            margin: 10px 0;
        }
    }

    .ok, .cancel {
        font-size: 15px;
        width: 130px;
        height: 40px;
        background: #ff9900;
        border: none;
    }

    .cancel {
        background: #909090;
    }

    .fieldSet-textArea /deep/ textarea {
        font-size: 12px;
        line-height: 22px;
    }
</style>
