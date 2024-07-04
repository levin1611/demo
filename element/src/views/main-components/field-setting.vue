<template>
    <div v-loading="loading"
         class="product-field-setting">
        <!-- 添加/编辑 字段模态框 -->
        <Modal :visible.sync="modalShow"
               :title="modalOption === 'update' ? $t('crm.InqSet.editField') : $t('crm.InqSet.addField')"
               width="540px"
               :append-to-body="true"
               :modal-append-to-body="false"
               v-loading="!modalFlag"
               class="field-modal">
            <Form label-width="80px"
                  label-position="left"
                  style="margin:0 14px;">
                <Row>
                    <Col v-for="(item, index) in modalItems"
                         :key="index"
                         :span="24">
                        <!-- 如果表单项的 show 属性为 0 ，那么显示该表单项 -->
                        <template v-if="item.show === '0'">
                            <FormItem v-if="item.type === 'text'"
                                      :label="item.name">
                                <Input v-model="item.value"></Input>
                            </FormItem>
                            <FormItem v-else-if="item.type === 'select'"
                                      :label="item.name">
                                <Select v-if="modalShow"
                                        :disabled="selectTypeDisabled"
                                        v-model="item.value"
                                        @change="item.onchange">
                                    <Option v-for="(optionValue, index) in item.options"
                                            :key="index"
                                             :disabled="(optionValue === $t('crm.InqSet.textArea') && disabled_textarea) || (optionValue === $t('crm.InqSet.longTextArea') && disabled_longtextarea)"
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
                            <FormItem v-if="item.type === 'text'"
                                      :label="item.name">
                                <Input v-model="item.value"></Input>
                            </FormItem>
                            <FormItem v-else-if="item.type === 'textarea'"
                                      :label="item.name">
                                <Input v-model="item.value"
                                       type="textarea"
                                       :autosize="{minRows: 2,maxRows: 5}"></Input>
                            </FormItem>
                            <FormItem v-else-if="item.type === 'listItem'"
                                      ref="listItemDrop"
                                      :label="item.name">
                                <div v-if="isShowFieldList" class="isShowFieldList">
                                    <Row v-for="(listItem, itemIndex) in item.value"
                                        :key="itemIndex"
                                        :style="`${itemIndex === (item.value.length - 1) ? 'margin-bottom:0;' : 'margin-bottom:12px;'}`">
                                        <Col :span="20">
                                            <Input type="text"
                                                v-model="item.value[itemIndex]">{{item.value[itemIndex]}}</Input>
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
                        @click="ok(modalOption)">{{ $t('crm.InqSet.modal_ok') }}</Button>
            </div>
        </Modal>

        <!-- 编辑默认字段模态框 -->
        <Modal :visible.sync="show_edit_default_field"
               :title="$t('crm.InqSet.editField')"
               width="540px"
               :append-to-body="true"
               :modal-append-to-body="false"
               v-loading="loading_edit_default_field"
               class="field-modal">
            <Form label-width="80px"
                  label-position="left"
                  style="margin:0 14px;">
                <!-- 类型 -->
                <FormItem :label="`${$t('crm.InqSet.fieldType')}`">
                    <Select :value="tempDefaultField.typeValue"
                            disabled>
                        <Option v-for="(type, index) in Object.keys(lang_type_editAllowed)"
                                :key="index"
                                :value="type">{{ lang_type_editAllowed[type] }}</Option>
                    </Select>
                </FormItem>
                <!-- 名称 -->
                <FormItem :label="`${$t('crm.InqSet.fieldName')}`">
                    <Input :value="tempDefaultField.name"
                           disabled></Input>
                </FormItem>
                <!-- 提示语 -->
                <FormItem :label="`${$t('crm.InqSet.defaultValue')}`">
                    <Input v-model="tempDefaultField.colDefaultValue"></Input>
                </FormItem>
                <!-- 必填 -->
                <FormItem v-if="tempDefaultField.can_check_mustInput"
                          :label="`${$t('crm.InqSet.mustInput')}`">
                    <Checkbox v-model="tempDefaultField.mustInput">&nbsp;</Checkbox>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button size="large"
                        @click="show_edit_default_field = false">{{ $t('crm.InqSet.modal_cancel') }}</Button>
                <Button type="primary"
                        size="large"
                        @click="ok_edit_default_field">{{ $t('crm.InqSet.modal_ok') }}</Button>
            </div>
        </Modal>

        <!-- 字段信息表单 -->
        <Row class="formHeader">
            <Col :span="18">
            {{ title_type }}({{ $t('crm.InqSet.draggable') }})
            <p v-if="fieldBelong === 2 && !excludeCompany.includes(enterpriseId)">{{ $t('crm.InqSet.changeRequiredTip')}}</p>
            </Col>
            <Col :span="6">
                <Button type="primary"
                        size="large"
                        @click="addField(3)"
                        class="addField">{{ $t('crm.InqSet.addCustomField') }}</Button>
            </Col>
        </Row>
        <Form label-width="130px">
            <Row type="flex"
                 ref="sort-type">
                <template v-for="item in computed_sort_series">
                    <!-- 默认字段 -->
                    <template v-if="get_default_field_index_by_storageName(item) > -1">
                        <Col class="default-field"
                             :xs="24"
                             :sm="24"
                             :md="12">
                            <FormItem :label="defaultFieldList[get_default_field_index_by_storageName(item)].name + '  :'">
                                <!-- 文本框型 -->
                                <template v-if="defaultFieldList[get_default_field_index_by_storageName(item)].type === 'text'">
                                    <div v-if="item === 'estimatedInquiryAmount'">
                                        <div>
                                            <Input style="width:75%;margin-right:5%"
                                                :value="defaultFieldList[get_default_field_index_by_storageName(item)].value"
                                                disabled
                                                :placeholder="defaultFieldList[get_default_field_index_by_storageName(item)].colDefaultValue"></Input>
                                            <Select disabled style="width:20%"
                                                :value="''"
                                                :placeholder="$t('crm.InqSet.currency_symbol')">
                                                <template v-for="(valueItem, index) in defaultFieldList[get_default_field_index_by_storageName(item)].value">
                                                    <Option :key="index"
                                                            :value="valueItem"
                                                            :label="valueItem"></Option>
                                                </template>
                                            </Select>
                                        </div>
                                    </div>
                                    <Input v-else-if="defaultFieldList[get_default_field_index_by_storageName(item)].storageName === 'inquiryScore' || defaultFieldList[get_default_field_index_by_storageName(item)].storageName === 'birthday'"
                                           :value="defaultFieldList[get_default_field_index_by_storageName(item)].value"
                                           disabled
                                           :placeholder="defaultFieldList[get_default_field_index_by_storageName(item)].colDefaultValue"></Input>
                                    <Input v-else
                                           :value="defaultFieldList[get_default_field_index_by_storageName(item)].value"
                                           disabled
                                           :placeholder="defaultFieldList[get_default_field_index_by_storageName(item)].colDefaultValue"
                                           :maxlength="defaultFieldList[get_default_field_index_by_storageName(item)].maxLength"
                                           show-word-limit></Input>
                                </template>
                                <!-- 单选型 -->
                                <template v-else-if="defaultFieldList[get_default_field_index_by_storageName(item)].type === 'select' || defaultFieldList[get_default_field_index_by_storageName(item)].type === 'selectMultiple'">
                                    <Select disabled
                                            :value="''"
                                            :placeholder="defaultFieldList[get_default_field_index_by_storageName(item)].colDefaultValue || $t('crm.Modal.tip_select')">
                                        <template v-for="(valueItem, index) in defaultFieldList[get_default_field_index_by_storageName(item)].value">
                                            <Option :key="index"
                                                    :value="valueItem"
                                                    :label="valueItem"></Option>
                                        </template>
                                    </Select>
                                </template>
                                <!-- 文本域型 -->
                                <template v-else-if="defaultFieldList[get_default_field_index_by_storageName(item)].type === 'textarea'">
                                    <Input type="textarea"
                                           :value="defaultFieldList[get_default_field_index_by_storageName(item)].value"
                                           disabled
                                           :rows="1"
                                           :placeholder="defaultFieldList[get_default_field_index_by_storageName(item)].colDefaultValue"
                                           :maxlength="defaultFieldList[get_default_field_index_by_storageName(item)].maxLength"
                                           show-word-limit
                                           class="fieldSet-textArea"></Input>
                                </template>
                                <!-- 星级型 -->
                                <template v-else-if="defaultFieldList[get_default_field_index_by_storageName(item)].type === 'rate'">
                                    <Rate :value="5"
                                          disabled
                                          :icon-classes="['custom custom-star', 'custom custom-star', 'custom custom-star']"
                                          disabled-void-icon-class="custom custom-star"
                                          style="height: 40px;line-height: 40px;"></Rate>
                                </template>
                                <!-- 级联型 国家地区 -->
                                <template v-else-if="defaultFieldList[get_default_field_index_by_storageName(item)].type === 'cascader'">
                                    <Cascader :options="defaultFieldList[get_default_field_index_by_storageName(item)].value"
                                              disabled></Cascader>
                                </template>
                                <!-- radio 型 -->
                                <template v-else-if="defaultFieldList[get_default_field_index_by_storageName(item)].type === 'radio'">
                                    <RadioGroup>
                                        <Radio v-for="(radioItem, index) in defaultFieldList[get_default_field_index_by_storageName(item)].value"
                                               :key="index"
                                               disabled
                                               :label="radioItem">{{ radioItem }}</Radio>
                                    </RadioGroup>
                                </template>
                                <!-- 文件型 -->
                                <template v-else-if="defaultFieldList[get_default_field_index_by_storageName(item)].type === 'file'">
                                    <Button disabled
                                            icon="ivu-icon ivu-icon-plus-round"
                                            class="uploadCorpPic"></Button>
                                </template>
                                <!-- 操作按钮 -->
                                <div class="icon-wrap">
                                    <!-- 必填选框 -->
                                    <template v-if="defaultFieldList[get_default_field_index_by_storageName(item)].can_check_mustInput">
                                        <Checkbox :value="defaultFieldList[get_default_field_index_by_storageName(item)].mustInput"
                                                  :title="$t('crm.InqSet.mustInput')"
                                                  @change="check_mustInput(get_default_field_index_by_storageName(item) ,$event)"
                                                  class="check-must-input"></Checkbox>
                                    </template>
                                    <template v-else>
                                        <Checkbox :value="true"
                                                  :title="$t('crm.InqSet.mustInput')"
                                                  disabled
                                                  class="check-must-input"
                                                  style="visibility: hidden;"></Checkbox>
                                    </template>

                                    <!-- 编辑按钮 -->
                                    <Icon v-if="lang_type_editAllowed.hasOwnProperty(defaultFieldList[get_default_field_index_by_storageName(item)].type)"
                                          custom="custom-field-edit"
                                          size="12"
                                          @click.native="editDefaultField(item)"></Icon>
                                </div>
                            </FormItem>
                        </Col>
                    </template>
                    <!-- 自定义字段 -->
                    <template v-else-if="item.startsWith('a100')">
                        <Col class="customField"
                             :key="item"
                             :xs="24"
                             :sm="24"
                             :md="12">
                            <FormItem :label="customFieldList[item].cname + ' :'">
                                <template v-if="customFieldList[item].type === 'text'">
                                    <Input disabled
                                           :placeholder="customFieldList[item].colDefaultValue"
                                           :maxlength="customFieldList[item].maxLength"
                                           show-word-limit></Input>
                                </template>
                                <template v-else-if="customFieldList[item].type === 'textarea'">
                                    <Input type="textarea"
                                           disabled
                                           :rows="1"
                                           :placeholder="customFieldList[item].colDefaultValue"
                                           :maxlength="customFieldList[item].maxLength"
                                           show-word-limit
                                           class="fieldSet-textArea"></Input>
                                </template>
                                <template v-else-if="customFieldList[item].type === 'select' || customFieldList[item].type === 'selectMultiple'">
                                    <Select disabled
                                            :value="''"
                                            :placeholder="customFieldList[item].colDefaultValue || $t('crm.Modal.tip_select')">
                                        <Option v-for="(valueItem, index) in customFieldList[item].option.split('?')"
                                                :key="index"
                                                :value="valueItem"
                                                :label="valueItem"></Option>
                                    </Select>
                                </template>
                                <template v-else-if="customFieldList[item].type === 'date+time'">
                                    <DatePicker type="datetime"
                                                disabled
                                                :placeholder="customFieldList[item].colDefaultValue"></DatePicker>
                                </template>
                                <template v-else-if="customFieldList[item].type === 'date'">
                                    <DatePicker type="date"
                                                disabled
                                                :placeholder="customFieldList[item].colDefaultValue"></DatePicker>
                                </template>
                                <!-- 为每个自定义字段添加相应的按钮 -->
                                <div class="icon-wrap">
                                    <Checkbox :value="customFieldList[item].mustInput"
                                              :title="$t('crm.InqSet.mustInput')"
                                              @change="check_mustInput_custom(item, $event)"
                                              class="check-must-input"></Checkbox>
                                    <Icon custom="custom-field-edit"
                                          size="12"
                                          @click.native="editField(item)"></Icon>
                                    <Icon custom="custom-field-delete"
                                          size="12"
                                          @click.native="deleteField(customFieldList[item])"></Icon>
                                </div>
                            </FormItem>
                        </Col>
                    </template>
                </template>
            </Row>
            <!-- 弃用字段 -->
            <div v-if="deprecatedFieldList.length"
                 class="formHeader">{{$t('productSetting.fieldSetting.deprecatedFieldList')}}</div>
            <Row type="flex">
                <Col v-for="(item, index) in deprecatedFieldList"
                     :key="index"
                     :xs="24"
                     :sm="24"
                     :md="12"
                     class="customField">
                    <FormItem :label="item.cname + ' :'">
                        <template v-if="item.type === 'text'">
                            <Input disabled
                                   :placeholder="item.colDefaultValue"
                                   :maxlength= "item.maxLength"
                                   show-word-limit></Input>
                        </template>
                        <template v-else-if="item.type === 'textarea'">
                            <Input type="textarea"
                                   disabled
                                   :rows="1"
                                   :placeholder="item.colDefaultValue"
                                   class="fieldSet-textArea"
                                   :maxlength= "item.maxLength"
                                   show-word-limit></Input>
                        </template>
                        <template v-else-if="item.type === 'select' || item.type === 'selectMultiple'">
                            <Select disabled
                                    :value="''"
                                    :placeholder="item.colDefaultValue || $t('crm.Modal.tip_select')">
                                <Option v-for="(valueItem, index) in item.option.split('?')"
                                        :key="index"
                                        :value="valueItem"
                                        :label="valueItem"></Option>
                            </Select>
                        </template>
                        <template v-else-if="item.type === 'date+time'">
                            <DatePicker type="datetime"
                                        disabled
                                        :placeholder="item.colDefaultValue"></DatePicker>
                        </template>
                        <template v-else-if="item.type === 'date'">
                            <DatePicker type="date"
                                        disabled
                                        :placeholder="item.colDefaultValue"></DatePicker>
                        </template>
                        <!-- 为每个自定义字段添加相应的按钮 -->
                        <div class="icon-wrap">
                            <Icon custom="custom custom-field-recover"
                                  size="12"
                                  @click.native="renewField(item)"></Icon>
                        </div>
                    </FormItem>
                </Col>
            </Row>
        </Form>

        <!-- 删除确认 -->
        <Modal :visible.sync="showDeleteModal"
               :title="$t('crm.InqSet.deleteTile')"
               width="540px"
               :append-to-body="true"
               :modal-append-to-body="false"
               class="field-modal">
            <div v-html="deleteTips"></div>
            <div slot="footer">
                <Button v-if="isAllowToDelete" size="large"
                        @click="showDeleteModal = false">{{ $t('crm.InqSet.modal_cancel') }}</Button>
                <Button v-if="isAllowToDelete" type="primary"
                        size="large"
                        @click="deleteFieldAnyhow">{{ $t('crm.InqSet.modal_ok') }}</Button>
                <Button v-if="!isAllowToDelete" type="primary"
                        size="large"
                        @click="showDeleteModal = false">{{ $t('crm.InqSet.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import Sortable from 'sortablejs';
    import { mapState } from 'vuex';
    import _ from 'lodash';
    import { fieldSetting } from '@/api/systemSettings/inquirySetting/index';
    const { updateMustInput, updateMustInputColumn, columnInquiry, hideColumn, orderColumnAll, saveColumn, getColumnStorage, fieldIsHide, updateFormColumnOption, updateColDefaultValueByCrmStorageName, saveOrUpdateColDefault } = fieldSetting;
    export default {
        name: 'FieldSetting',
        props: {
            fieldBelong: {
                type: Number,
                required: true
            }
        },
        data() {
            return {
                // 排查联系人必填都企业
                excludeCompany: ['10380', '10979', '10171'],
                showDeleteModal: false,
                showVerifyModal: false,
                /* 模态框 */
                // 添加字段模态框 是否显示
                modalShow: false,
                // 添加字段模态框提交按钮触发的是添加还是更新，其值为 update / save
                modalOption: '',
                // 更新自定义字段时的暂存自定义字段属性对象
                tempField: {},
                // 保证当前保存/更新操作未完成之前不允许再次触发保存/更新，防止字段顺序错误
                modalFlag: true,
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
                            this.$t('crm.InqSet.date'),
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
                        name: this.$t('crm.InqSet.fieldName'),
                        value: ''
                    },
                    fieldTextDefault: {
                        show: '1',
                        type: 'text',
                        name: this.$t('crm.InqSet.defaultValue'),
                        value: ''
                    },
                    fieldTextareaDefault: {
                        show: '2',
                        type: 'textarea',
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
                    },
                    fieldRequired: {
                        show: '0',
                        type: 'switch',
                        name: this.$t('crm.InqSet.mustInput'),
                        value: false
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
                    text: this.$t('crm.InqSet.textInput'),
                    textarea: this.$t('crm.InqSet.textArea'),
                    select: this.$t('crm.InqSet.selectSingle'),
                    selectMultiple: this.$t('crm.InqSet.selectMultiple'),
                    date: this.$t('crm.InqSet.date'),
                    'date+time': this.$t('crm.InqSet.date')
                },
                // 更新默认字段时的暂存自定义字段属性对象
                tempDefaultField: {},
                // 编辑默认字段模态框的 v-model
                show_edit_default_field: false,
                // "默认字段编辑中"loading
                loading_edit_default_field: false,

                /* 表单 */
                // 企业信息表单的 表单项
                corpInfoItems: [
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.corp_companyName'),
                        storageName: 'companyName',
                        tip: this.$t('crm.InqSet.tip_noTip'),
                        value: '',
                        mustInput: true,
                        can_check_mustInput: false,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.corp_shortName'),
                        storageName: 'shortName',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.corp_mainProduct'),
                        storageName: 'mainProduct',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'select',
                        id: '',
                        typeValue: this.$t('crm.InqSet.selectSingle'),
                        name: this.$t('crm.InqSet.corp_clientType'),
                        storageName: 'clientType',
                        tip: '',
                        value: ['', ''],
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'rate',
                        id: '',
                        name: this.$t('crm.InqSet.corp_starLevel'),
                        storageName: 'starLevel',
                        tip: '',
                        value: 5,
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.corp_countryArea'),
                        storageName: 'countryArea',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'select',
                        id: '',
                        typeValue: this.$t('crm.InqSet.selectSingle'),
                        name: this.$t('crm.InqSet.corp_scale'),
                        storageName: 'scale',
                        tip: '',
                        value: ['', ''],
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.corp_homePage'),
                        storageName: 'homePage',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.corp_fax'),
                        storageName: 'fax',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.corp_phone'),
                        storageName: 'phone',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.corp_contactAddress'),
                        storageName: 'contactAddress',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.corp_relatedCompany'),
                        storageName: 'relatedCompany',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'textarea',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textArea'),
                        name: this.$t('crm.InqSet.corp_companyRemark'),
                        storageName: 'companyRemark',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'file',
                        id: '',
                        name: this.$t('crm.InqSet.corp_companyPicture'),
                        storageName: 'companyPicture',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'select',
                        id: '',
                        typeValue: this.$t('crm.InqSet.selectSingle'),
                        name: this.$t('crm.Table.col_customerSource'),
                        storageName: 'companySourceWay',
                        tip: '',
                        value: ['', ''],
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    }
                ],
                // 联系人信息表单的 表单项
                contactInfoItems: [
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.contact_nickName'),
                        storageName: 'nickName',
                        tip: this.$t('crm.InqSet.tip_noTip'),
                        value: '',
                        mustInput: false,
                        can_check_mustInput: false,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.contact_email'),
                        storageName: 'email',
                        tip: '',
                        value: '',
                        mustInput: true,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.contact_jobGrade'),
                        storageName: 'jobGrade',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.contact_jobTitle'),
                        storageName: 'jobTitle',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.contact_phone'),
                        storageName: 'phone',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: 'WhatsApp',
                        storageName: 'whatsApp',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: 'Instagram',
                        storageName: 'instagram',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'select',
                        id: '',
                        typeValue: this.$t('crm.InqSet.selectSingle'),
                        name: this.$t('crm.InqSet.contact_socialNetworkingPlatform'),
                        storageName: 'socialNetworkingPlatform',
                        tip: '',
                        value: ['', ''],
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.contact_birthday'),
                        storageName: 'birthday',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'radio',
                        id: '',
                        name: this.$t('crm.InqSet.contact_gender'),
                        storageName: 'gender',
                        tip: '',
                        value: [this.$t('crm.InqSet.male'), this.$t('crm.InqSet.female')],
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.contact_remark'),
                        storageName: 'remark',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'file',
                        id: '',
                        name: this.$t('crm.InqSet.contact_picture'),
                        storageName: 'picture',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    }
                ],
                // 询盘信息表单的 表单项
                inquiryInfoItems: [
                    {
                        type: 'selectMultiple',
                        id: '',
                        typeValue: this.$t('crm.InqSet.selectMultiple'),
                        name: this.$t('crm.InqSet.inq_productCategory'),
                        storageName: 'productCategory',
                        tip: '',
                        value: ['', ''],
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.inq_demandProducts'),
                        storageName: 'demandProducts',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'select',
                        id: '',
                        typeValue: this.$t('crm.InqSet.selectSingle'),
                        name: this.$t('crm.InqSet.inq_label'),
                        storageName: 'label',
                        tip: '',
                        value: ['', ''],
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.InqSet.inq_inquiryScore'),
                        storageName: 'inquiryScore',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'select',
                        id: '',
                        typeValue: this.$t('crm.InqSet.selectSingle'),
                        name: this.$t('crm.InqSet.inq_grouping'),
                        storageName: 'grouping',
                        tip: '',
                        value: ['', ''],
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'select',
                        id: '',
                        typeValue: this.$t('crm.InqSet.selectSingle'),
                        name: this.$t('crm.InqSet.inq_sourceChannel'),
                        storageName: 'sourceChannel',
                        tip: '',
                        value: ['', ''],
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'select',
                        id: '',
                        typeValue: this.$t('crm.InqSet.selectSingle'),
                        name: this.$t('crm.InqSet.inq_sourceWay'),
                        storageName: 'sourceWay',
                        tip: '',
                        value: ['', ''],
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'select',
                        id: '',
                        typeValue: this.$t('crm.InqSet.selectSingle'),
                        name: this.$t('crm.InqSet.inq_followUp'),
                        storageName: 'followUp',
                        tip: '',
                        value: ['', ''],
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'textarea',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textArea'),
                        name: this.$t('crm.InqSet.inq_remark'),
                        storageName: 'remark',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('crm.Detail.inq_estimatedInquiryAmount'),
                        storageName: 'estimatedInquiryAmount',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: 1
                    }
                ],
                // 产品相关
                productInfoItems: [
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('product.productName'),
                        storageName: 'productName',
                        tip: '',
                        value: '',
                        mustInput: true,
                        can_check_mustInput: false,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'select',
                        id: '',
                        typeValue: this.$t('crm.InqSet.selectSingle'),
                        name: this.$t('product.productType'),
                        storageName: 'productType',
                        tip: '',
                        value: ['', ''],
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('product.productModel'),
                        storageName: 'productModel',
                        tip: '',
                        value: '',
                        mustInput: true,
                        can_check_mustInput: false,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'select',
                        id: '',
                        typeValue: this.$t('crm.InqSet.selectSingle'),
                        name: this.$t('product.productCategory'),
                        storageName: 'productCategory',
                        tip: '',
                        value: ['', ''],
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('product.productPrice'),
                        storageName: 'productPrice',
                        tip: '',
                        value: '',
                        mustInput: true,
                        can_check_mustInput: false,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'text',
                        id: '',
                        typeValue: this.$t('crm.InqSet.textInput'),
                        name: this.$t('product.productDesc'),
                        storageName: 'productDesc',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    },
                    {
                        type: 'file',
                        id: '',
                        name: this.$t('product.productPicture'),
                        storageName: 'productPicture',
                        tip: '',
                        value: '',
                        mustInput: false,
                        can_check_mustInput: true,
                        checking: false,
                        colOrder: null
                    }
                ],

                /* 表单数据请求 */
                existedInfoField: {
                    hide: {},
                    show: {}
                },
                requested_custom_field: false,
                requested_default_field: false,
                // 存放自定义字段的字段顺序
                // sort_series: []

                /* 排序 */
                temp_sort_series: [],
                deleteTips: '',
                isAllowToDelete: true,
                isShowFieldList: true
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fieldLimit: state => state.crm.fieldLimit
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
            },
            // 固定字段, (拼上 mustInput 等参数)
            defaultFieldList() {
                switch (this.fieldBelong) {
                    case 1:
                        return this.corpInfoItems;
                    case 2:
                        return this.contactInfoItems;
                    case 3:
                        return this.inquiryInfoItems;
                    case 4:
                        return this.productInfoItems;
                    default:
                        return undefined;
                }
            },
            // 使用中的自定义字段, (拼上 mustInput 等参数)
            customFieldList() {
                const temp = {};
                if (this.existedInfoField.show) {
                    Object.values(this.existedInfoField.show).forEach(item => {
                        temp[item.storageName] = Object.assign({
                            checking: false
                        }, item, {
                            mustInput: item.mustInput === 1
                        });
                    });
                }
                return temp;
            },
            get_default_field_index_by_storageName() {
                return (storageName) => {
                    return this.defaultFieldList.findIndex(item => item.storageName === storageName);
                };
            },
            // 弃用字段
            deprecatedFieldList() {
                return Object.values(this.existedInfoField.hide);
            },
            // 初始字段排序
            computed_sort_series() {
                let arr_sort = [];
                const arr_renew = [];
                // 新增字段
                const newly = [];
                // 自定义字段请求完成
                if (this.requested_custom_field) {
                    Object.values(this.existedInfoField.show).forEach(item => {
                        if (`${item.colOrder}` === '1000') {
                            // 1000 表示被恢复的自定义字段
                            arr_renew.push(item.storageName);
                        } else {
                            // 因为后端不是在恢复时把被恢复的字段的 colOrder 置为 1000 , 而是在删除的时候
                            // 发现时已经有用户恢复字段了, 被恢复字段是在字段整体排序之前就已经删除了的, 所以恢复时 colOrder 不是 1000 , 这就可能同时出现多个具有相同 colOrder 的字段
                            // 按原来的逻辑很有可能这些被恢复字段永远无法在设置页显示, 只能改排序逻辑了, 暂且弄成这样吧, 其他表格页详情页模态框也要改, 哎
                            if (arr_sort[item.colOrder]) {
                                arr_renew.push(item.storageName);
                            } else {
                                arr_sort[item.colOrder] = item.storageName;
                            }
                        }
                    });
                }
                // 固定字段必填和 colOrder 请求完成
                if (this.requested_default_field) {
                    /**
                     * @Description: 新增默认字段，之前判断默认字段是否排过序的逻辑需要修改
                     * 如果默认字段中有字段已经排过序，则将有序的字段放到相应的位置，无序的字段放到最后
                     * @author mayuanzhi
                     * @date 2020/7/9
                    */
                    if (this.defaultFieldList.some(item => item.colOrder)) {
                        this.defaultFieldList.forEach(item => {
                            // 同上面的自定义字段的处理原因
                            if (item.colOrder) {
                                if (arr_sort[item.colOrder]) {
                                    arr_renew.push(item.storageName);
                                } else {
                                    arr_sort[item.colOrder] = item.storageName;
                                }
                            } else {
                                newly.push(item.storageName);
                            }
                        });
                    } else {
                        arr_sort = this.defaultFieldList.map(item => item.storageName).concat(arr_sort);
                    }
                }
                return arr_sort.filter(item => !(!item || item === '')).concat(arr_renew, newly);
            },
            // loading
            loading() {
                return !(this.requested_default_field && this.requested_custom_field);
            },
            // 标题展示
            title_type() {
                switch (this.fieldBelong) {
                    case 1:
                        return this.$t('crm.InqSet.title_company');
                    case 2:
                        return this.$t('crm.InqSet.title_contact');
                    case 3:
                        return this.$t('crm.InqSet.title_inquiry');
                    case 4:
                        return this.$t('productSetting.fieldSetting.productFieldList');
                    default:
                        return undefined;
                }
            },
            // 是否允许选择文本域
            disabled_textarea() {
                if (this.existedInfoField.show && this.existedInfoField.hide) {
                    const allKeys = Object.keys(Object.assign({}, this.existedInfoField.show, this.existedInfoField.hide));
                    for (let i = 41; i <= 50; i++) {
                        if (!allKeys.includes(`a100${i}`)) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            },
            disabled_longtextarea() {
                if (this.existedInfoField.show && this.existedInfoField.hide) {
                    const allKeys = Object.keys(Object.assign({}, this.existedInfoField.show, this.existedInfoField.hide));
                    if (allKeys.includes('a10040')) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return false;
            },
            inputLimit() {
                switch (this.fieldBelong) {
                    case 1:
                        return this.fieldLimit.crmCompany;
                    case 2:
                        return this.fieldLimit.crmContacts;
                    case 3:
                        return this.fieldLimit.crmInquiry;
                    default:
                        return {};
                }
            }
        },
        methods: {
            // 获取默认字段和自定义字段
            getDefaultAndColumnsFields() {
                // 置空排序数组
                this.temp_sort_series = [];
                // 显示loading效果
                this.requested_default_field = false;
                this.requested_custom_field = false;
                this.$commonApi.getAllColumns({
                    orgId: this.enterpriseId,
                    parentId: this.fieldBelong
                }).then(data => {
                    if (data.code === '1') {
                        /**
                         * @Description: 加上输入上限
                         * 如果字段有上限则加上，否则无
                         * @author mayuanzhi
                         * @date 2020/7/24
                         */
                        const fieldLimit = this.inputLimit;
                        // 获取默认字段
                        const defaultColumn = data.data.defaultColumn;
                        // 获取自定义字段
                        const customColumn = data.data.customColumn;
                        // 处理自定义字段并显示到页面
                        defaultColumn.filter(item => `${item.parentId}` === `${this.fieldBelong}`).forEach(item => {
                            const index = this.defaultFieldList.findIndex(infoItem => infoItem.storageName === item.storageName);
                            if (index !== -1) {
                                if (this.defaultFieldList[index].can_check_mustInput) {
                                    this.defaultFieldList[index].mustInput = (item.mustInput === 1);
                                }
                                this.defaultFieldList[index].id = item.id;
                                this.defaultFieldList[index].colDefaultValue = item.colDefaultValue;
                                this.defaultFieldList[index].colOrder = item.colOrder;

                                if (fieldLimit[item.storageName] && fieldLimit[item.storageName].usableLength) {
                                    this.defaultFieldList[index].maxLength = fieldLimit[item.storageName].usableLength;
                                }
                            }
                        });
                        // 自定义字段显示的内容
                        const arrShow = customColumn.show;
                        // 自定义字段隐藏的内容
                        const arrHide = customColumn.hide;
                        const obj = {
                            hide: {},
                            show: {}
                        };
                        arrShow.forEach(item => {
                            if (fieldLimit[item.storageName] && parseInt(item.parentId) === this.fieldBelong) {
                                // 自定义字段优先使用typeLength
                                if (fieldLimit[item.storageName].typeLength) {
                                    const obj = JSON.parse(fieldLimit[item.storageName].typeLength);
                                    item.maxLength = item.type === 'text' ? obj.text : obj.textarea;
                                } else {
                                    item.maxLength = fieldLimit[item.storageName].usableLength;
                                }
                                obj.show[item.storageName] = item;
                            }
                        });
                        arrHide.forEach(item => {
                            // 判断字段的 parentId 是否与当前的 fieldBelong 相等(显示对应关系的字段)
                            if (fieldLimit[item.storageName] && parseInt(item.parentId) === this.fieldBelong) {
                                // 自定义字段优先使用typeLength
                                if (fieldLimit[item.storageName].typeLength) {
                                    const obj = JSON.parse(fieldLimit[item.storageName].typeLength);
                                    item.maxLength = item.type === 'text' ? obj.text : obj.textarea;
                                } else {
                                    item.maxLength = fieldLimit[item.storageName].usableLength;
                                }
                                obj.hide[item.storageName] = item;
                            }
                        });
                        this.$set(this.existedInfoField, 'hide', obj.hide);
                        this.$set(this.existedInfoField, 'show', obj.show);
                        // this.existedInfoField = obj;
                    } else {
                        this.defaultFieldList.forEach(item => {
                            item.can_check_mustInput = false;
                        });
                        this.existedInfoField = {
                            hide: {},
                            show: {}
                        };
                    }
                    // 取消loading效果
                    this.requested_default_field = true;
                    this.requested_custom_field = true;
                });
            },
            // 获取自定义字段
            getColumnsShow() {
                this.temp_sort_series = [];

                this.requested_custom_field = false;
                this.$commonApi.getColumnsShow({
                    orgId: this.enterpriseId,
                    parentId: this.fieldBelong,
                    isShow: 1
                }).then(response => {
                    if (response.code === '1') {
                        /**
                         * @Description: 加上输入上限
                         * 如果字段有上限则加上，否则无
                         * @author mayuanzhi
                         * @date 2020/7/24
                        */
                        const fieldLimit = this.inputLimit;
                        const arrShow = response.data.show;
                        const arrHide = response.data.hide;
                        const obj = {
                            hide: {},
                            show: {}
                        };
                        for (const key in arrShow) {
                            if (fieldLimit[key]) {
                                // 自定义字段优先使用typeLength
                                if (fieldLimit[key].typeLength) {
                                    const obj = JSON.parse(fieldLimit[key].typeLength);
                                    arrShow[key].maxLength = arrShow[key].type === 'text' ? obj.text : obj.textarea;
                                } else {
                                    arrShow[key].maxLength = fieldLimit[key].usableLength;
                                }
                            }
                            obj.show[key] = arrShow[key];
                        }
                        for (const key in arrHide) {
                            if (fieldLimit[key]) {
                                // 自定义字段优先使用typeLength
                                if (fieldLimit[key].typeLength) {
                                    const obj = JSON.parse(fieldLimit[key].typeLength);
                                    arrHide[key].maxLength = arrHide[key].type === 'text' ? obj.text : obj.textarea;
                                } else {
                                    arrHide[key].maxLength = fieldLimit[key].usableLength;
                                }
                            }
                            obj.hide[key] = arrHide[key];
                        }
                        this.existedInfoField = obj;
                    } else {
                        this.existedInfoField = {
                            hide: {},
                            show: {}
                        };
                    }
                    this.requested_custom_field = true;
                });
            },
            /* 三部分右上角新增按钮 */

            // 点击添加字段模态框
            addField() {
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
                            this.$t('crm.InqSet.selectMultiple'),
                            this.$t('crm.InqSet.date'),
                            this.$t('crm.InqSet.longTextArea')
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
                        name: this.$t('crm.InqSet.fieldName'),
                        value: ''
                    },
                    fieldTextDefault: {
                        show: '1',
                        type: 'text',
                        name: this.$t('crm.InqSet.defaultValue'),
                        value: ''
                    },
                    fieldTextareaDefault: {
                        show: '2',
                        type: 'textarea',
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
                    },
                    fieldRequired: {
                        show: '0',
                        type: 'switch',
                        name: this.$t('crm.InqSet.mustInput'),
                        value: false
                    }
                };
                this.modalItems.fieldType.onchange();
                // 如果选择字段类型被禁用则恢复其为可选
            },

            /* 字段右边操作按钮 */
            // 检测'email', 'phone', 'instagram', 'whatsApp', 'socialNetworkingPlatform'是否含有必填项
            checkContactMustInput() {
                const allowCheck = this.defaultFieldList.filter(item => ['email', 'phone', 'instagram', 'whatsApp', 'socialNetworkingPlatform'].includes(item.storageName) && item.mustInput);
                return allowCheck.length;
            },
            // 勾选/取消必填项 做防抖处理
            check_mustInput: _.debounce(function(key, checked) {
                if (this.defaultFieldList[key].checking) {
                    this.$Message.info(this.$t('crm.InqSet.info_waitForChange'));
                } else {
                    if (this.defaultFieldList[key].can_check_mustInput) {
                        if (this.fieldBelong) {
                            this.defaultFieldList[key].checking = true;
                            // 操作的是联系人时，要判断邮箱、电话、instagram、WhatsApp、社交平台中的一项为必填
                            // 排查部分企业
                            if (this.fieldBelong === 2 && !this.excludeCompany.includes(this.enterpriseId) && ['email', 'phone', 'instagram', 'whatsApp', 'socialNetworkingPlatform'].includes(this.defaultFieldList[key].storageName) && !checked && this.checkContactMustInput() === 1) {
                                this.defaultFieldList[key].mustInput = checked;
                                this.defaultFieldList[key].checking = false;
                                this.$nextTick(() => {
                                    this.defaultFieldList[key].mustInput = !checked;
                                });
                                this.$Message.warning(this.$t('crm.InqSet.changeRequired'));
                                return;
                            }
                            if (this.defaultFieldList[key].id) {
                                // 发送必选框保存接口请求
                                updateMustInput({
                                    id: this.defaultFieldList[key].id,
                                    mustInput: checked ? 1 : 2
                                }).then(res => {
                                    if (res.code === '1') {
                                        this.defaultFieldList[key].mustInput = checked;
                                        this.$Message.success(`${this.defaultFieldList[key].name} ${this.$t('crm.InqSet.success_changeMustInput')}`);
                                    } else {
                                        this.defaultFieldList[key].mustInput = !checked;
                                        this.$Message.error(`${this.defaultFieldList[key].name} ${this.$t('crm.InqSet.error_changeMustInput')}`);
                                    }
                                    this.defaultFieldList[key].checking = false;
                                });
                            } else {
                                saveOrUpdateColDefault({
                                    url: '/crm/columnConfig/save',
                                    data: {
                                        orgId: this.enterpriseId,
                                        parentId: this.fieldBelong,
                                        storageName: this.defaultFieldList[key].storageName,
                                        mustInput: this.defaultFieldList[key].mustInput ? 1 : 2
                                    }
                                }).then(res => {
                                    if (res.code === '1') {
                                        this.$Message.success(`${this.defaultFieldList[key].name} ${this.$t('crm.InqSet.success_changeMustInput')}`);
                                        this.defaultFieldList[key].id = JSON.parse(res.data).id;
                                    } else {
                                        this.$Message.error(`${this.defaultFieldList[key].name} ${this.$t('crm.InqSet.error_changeMustInput')}`);
                                        this.defaultFieldList[key].mustInput = !this.defaultFieldList[key].mustInput;
                                    }
                                    this.defaultFieldList[key].checking = false;
                                });
                            }
                        } else {
                            this.$Message.error(this.$t('crm.InqSet.error_params'));
                        }
                    } else {
                        this.$Message.error(`${this.defaultFieldList[key].name}  ${this.$t('crm.InqSet.error_canNotChangeMustInput')}`);
                    }
                }
            }, 500),
            // 防抖处理
            check_mustInput_custom: _.debounce(function(key, checked) {
                if (this.customFieldList[key].checking) {
                    this.$Message.info(this.$t('crm.InqSet.info_waitForChange'));
                } else {
                    this.customFieldList[key].checking = true;

                    const temp = Object.assign({}, this.customFieldList[key]);
                    // 发送自定义必选框保存接口请求
                    updateMustInputColumn({
                        orgId: this.enterpriseId,
                        parentId: this.fieldBelong,
                        isShow: 1,
                        storageName: temp.storageName,
                        cname: temp.cname,
                        type: temp.type,
                        option: temp.option,
                        colDefaultValue: temp.colDefaultValue,
                        mustInput: checked ? 1 : 2
                    }).then(response => {
                        if (response.code === '1') {
                            this.customFieldList[key].mustInput = checked;
                            this.update_column_info(temp.cname, temp.storageName, 0);
                            this.$Message.success(`${temp.cname} ${this.$t('crm.InqSet.success_changeMustInput')}`);
                        } else {
                            this.customFieldList[key].mustInput = !checked;
                            this.$Message.error(`${this.defaultFieldList[key].name} ${this.$t('crm.InqSet.error_changeMustInput')}`);
                        }
                        this.customFieldList[key].checking = false;
                        this.$forceUpdate();
                    });
                }
            }, 500),
            // 点击修改默认字段图标
            editDefaultField(key) {
                this.tempDefaultField = {};

                const temp = this.defaultFieldList.find(item => item.storageName === key);
                if (temp) {
                    this.tempDefaultField = Object.assign({}, temp);

                    this.show_edit_default_field = true;
                } else {
                    this.$Message.error(this.$t('crm.Modal.errorOccurred'));
                }
            },
            // 点击修改自定义字段图标
            editField(key) {
                this.tempField = {};
                this.tempField = Object.assign({}, this.customFieldList[key]);

                // 根据自定义字段类型分情况回填数据
                this.modalItems.fieldName.value = this.tempField.cname;
                this.modalItems.fieldRequired.value = Number(this.tempField.mustInput) === 1;
                switch (this.tempField.type) {
                    case 'text':
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
                if (this.tempField.storageName === 'a10040') {
                    this.tempField.type = 'textarea';
                    this.modalItems.fieldType.value = this.$t('crm.InqSet.longTextArea');
                    this.modalItems.fieldTextareaDefault.value = this.tempField.colDefaultValue;
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
                // 暂存操作字段
                this.tempField = {};
                this.tempField = Object.assign({}, item);
                columnInquiry({
                    column: item.storageName,
                    orgId: this.enterpriseId,
                    type: 1,
                    crmType: item.parentId
                }).then(response => {
                    this.showDeleteModal = true;
                    this.isAllowToDelete = true;
                    if (response.code === '1') {
                        const dataObj = response.data;
                        let str1 = '';
                        let str2 = '';
                        switch (dataObj.flag) {
                            case 0:
                                break;
                            case 1:
                                // 该字段没有被其他模板使用
                                this.deleteTips = this.$t('crm.InqSet.deleteTip');
                                break;
                            case 2:
                                // 该字段被线索模板使用
                                this.deleteTips = `${this.$t('clue.field')}${item.cname}${this.$t('crm.InqSet.deleteTip1')}`;
                                break;
                            case 3:
                            case 4:
                                // 3该字段被表单模板使用
                                // 4该字段被线索和表单模板使用，且每一个表单模板中除了该字段外还有其他字段
                                dataObj.formNameList.map(item => {
                                    str1 += `【${item}】`;
                                });
                                this.deleteTips = `${this.$t('clue.field')}${item.cname}${this.$t('crm.InqSet.deleteTip2')}${str1}${this.$t('crm.InqSet.deleteTip3')}`;
                                break;
                            case 5:
                                // 该字段被线索和表单模板使用，且至少有一个表单模板中只包含这一个字段，除了该字段外没有其他字段
                                dataObj.formNameList.map(item => {
                                    str1 += `【${item}】`;
                                });
                                dataObj.uniqueFormNameList.map(item => {
                                    str2 += `【${item}】`;
                                });
                                this.isAllowToDelete = false;
                                this.deleteTips = `${this.$t('clue.field')}${item.cname}${this.$t('crm.InqSet.deleteTip2')}${str1}${this.$t('crm.InqSet.deleteTip4')}${str2}${this.$t('crm.InqSet.deleteTip5')}【${item.cname}】${this.$t('crm.InqSet.deleteTip6')}`;
                                break;
                            default:
                                break;
                        }
                    } else {
                        this.deleteTips = this.$t('crm.InqSet.deleteTip');
                    }
                });
            },
            deleteFieldAnyhow() {
                // 发送删除字段（此处删除方式为隐藏）请求
                hideColumn({
                    id: this.tempField.id
                }).then(response => {
                    if (response.code === '1') {
                        this.getDefaultAndColumnsFields();
                        this.update_column_info(this.tempField.cname, this.tempField.storageName, 1);
                        this.showDeleteModal = false;
                        this.$Message.success(this.$t('crm.InqSet.success_deleteField'));
                    } else {
                        this.$Message.error(this.$t('crm.InqSet.error_deleteField'));
                    }
                });
            },
            // 点击恢复已删除的自定义字段图标
            renewField(temp) {
                // 发送更新字段（此处还原方式为更新自定义字段的 isShow 属性）请求
                updateMustInputColumn({
                    orgId: this.enterpriseId,
                    parentId: this.fieldBelong,
                    isShow: 1,
                    storageName: temp.storageName,
                    cname: temp.cname,
                    type: temp.type,
                    option: temp.option,
                    colDefaultValue: temp.colDefaultValue,
                    mustInput: temp.mustInput
                }).then(response => {
                    if (response.code === '1') {
                        this.getDefaultAndColumnsFields();
                        this.update_column_info(temp.cname, temp.storageName, 0);
                        this.$Message.success(this.$t('crm.InqSet.success_restoreField'));
                    } else {
                        this.$Message.error(this.$t('crm.InqSet.error_restoreField'));
                    }
                });
            },

            /* 改变字段顺序 */

            // 改变自定义字段的顺序
            endFunc(e) {
                if (e.newIndex !== e.oldIndex) {
                    // 交换变换的序号数值
                    const temp = this.temp_sort_series.length ? this.temp_sort_series.slice() : this.computed_sort_series.slice();
                    temp.splice(e.newIndex, 0, ...temp.splice(e.oldIndex, 1));
                    this.temp_sort_series = temp.slice();
                    // 排序接口
                    orderColumnAll({
                        orgId: this.enterpriseId,
                        parentId: this.fieldBelong,
                        storageNames: temp.join(',')
                    }).then(response => {
                    });
                }
            },
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

            /* 添加/编辑模态框 */

            // 检测是否突破字段限制
            check_length(obj) {
                return Object.entries(obj).some(([key, value]) => {
                    if (this.field_long_limit[key] && value.length > this.field_long_limit[key].limit) {
                        this.$Message.error(`【${this.field_long_limit[key].lang}】  ${this.$t('crm.fieldLimit.error_overLength')}`);
                        return true;
                    }
                });
            },
            // 添加字段模态框的 提交方法， 参数为 modalOption , 即 save / update
            ok(str) {
                // 获取数据，准备发送
                const obj = this.getModalItemsValue();

                // 定义其余要发送的数据
                let type = '';
                let cname = obj.fieldName;
                let option = '';
                let colDefaultValue = '';
                let mustInput = obj.fieldRequired === true ? 1 : 2;
                if (cname.trim().length > 0) {
                    if (this.modalFlag) {
                        if (str === 'save') {
                            // 防止短时间内重复调用此方法发送请求
                            // 快速保存可能导致 orderColumn 和 get 操作乱序
                            // 现在还有显示加载图标的作用
                            this.modalFlag = false;


                            // 发送 获取当前已存在的自定义字段的序号数组 请求
                            getColumnStorage({
                                orgId: this.enterpriseId,
                                parentId: this.fieldBelong,
                                isShow: 0
                            }).then(response => {
                                // 存放返回的序号数组
                                if (response.code === '1') {
                                    let order_arr = response.data;
                                    // 存放新增表单项的 storageName
                                    let storageName = '';

                                    // 如果返回数组为空
                                    if (Array.isArray(order_arr) && !order_arr.length) {
                                        if (obj.fieldType === this.$t('crm.InqSet.longTextArea')) {
                                            storageName = 'a10040';
                                        } else if (obj.fieldType === this.$t('crm.InqSet.textArea')) {
                                            storageName = 'a10041';
                                        } else {
                                            storageName = 'a1001';
                                        }
                                    } else if (order_arr.length === 50) {
                                        this.$Message.error(this.$t('crm.InqSet.error_fieldCountLimit'));
                                        this.modalShow = false;
                                        this.modalFlag = true;
                                    } else if (obj.fieldType === this.$t('crm.InqSet.textArea') && this.disabled_textarea) {
                                        this.modalFlag = true;
                                        this.$Message.error(this.$t('crm.InqSet.error_overTypes'));
                                    } else {
                                        if (obj.fieldType === this.$t('crm.InqSet.longTextArea')) {
                                            storageName = 'a10040';
                                        } else if (obj.fieldType === this.$t('crm.InqSet.textArea')) {
                                            for (let i = 41; i <= 50; i++) {
                                                if (!order_arr.includes(`a100${i}`)) {
                                                    storageName = `a100${i}`;
                                                }
                                            }
                                            if (!storageName) {
                                                this.modalFlag = true;
                                                this.$Message.error(this.$t('crm.InqSet.error_overTypes'));
                                            }
                                        } else {
                                            let i = 1;
                                            while (i <= 50) {
                                                if (order_arr.indexOf(`a100${i}`) === -1) {
                                                    storageName = `a100${i}`;
                                                    break;
                                                }
                                                i++;
                                            }
                                            if (!storageName) {
                                                this.modalFlag = true;
                                                this.$Message.error(this.$t('crm.Html.errorOccurred'));
                                            }
                                        }
                                    }

                                    // 如果 storageName 可以添加，则允许发送请求 添加自定义字段请求
                                    if (storageName) {
                                        order_arr = this.temp_sort_series.length ? this.temp_sort_series.concat([storageName]) : this.computed_sort_series.concat([storageName]);
                                        cname = obj.fieldName;
                                        mustInput = obj.fieldRequired === true ? 1 : 2;
                                        switch (obj.fieldType) {
                                            case this.$t('crm.InqSet.textInput'):
                                                type = 'text';
                                                colDefaultValue = obj.fieldTextDefault;
                                                break;
                                            case this.$t('crm.InqSet.textArea'):
                                            case this.$t('crm.InqSet.longTextArea'):
                                                type = 'textarea';
                                                colDefaultValue = obj.fieldTextareaDefault;
                                                break;
                                            case this.$t('crm.InqSet.selectSingle'):
                                                type = 'select';
                                                colDefaultValue = obj.fieldSelectDefault;
                                                option = obj.fieldListItems;
                                                break;
                                            case this.$t('crm.InqSet.selectMultiple'):
                                                type = 'selectMultiple';
                                                colDefaultValue = obj.fieldSelectDefault;
                                                option = obj.fieldListItems;
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

                                        if (this.check_length({
                                            cname,
                                            option,
                                            colDefaultValue
                                        })) {
                                            this.modalFlag = true;
                                            return false;
                                        }
                                        // 发送 保存当前自定义字段 请求
                                        saveColumn({
                                            orgId: this.enterpriseId,
                                            parentId: this.fieldBelong,
                                            isShow: 1,
                                            storageName,
                                            cname,
                                            type,
                                            option,
                                            colDefaultValue,
                                            mustInput
                                        }).then(response => {
                                            if (response.code === '1') {
                                                if (option) {
                                                    this.saveTranslate(option.split('?').concat([cname, colDefaultValue]));
                                                } else {
                                                    this.saveTranslate([cname, colDefaultValue]);
                                                }
                                                // 排序接口
                                                orderColumnAll({
                                                    orgId: this.enterpriseId,
                                                    parentId: this.fieldBelong,
                                                    storageNames: order_arr.join(',')
                                                }).then(response => {
                                                    // 恢复可正常触发方法状态
                                                    this.modalShow = false;

                                                    this.getDefaultAndColumnsFields();
                                                });
                                                this.$Message.success(this.$t('crm.InqSet.success_addField'));
                                                this.modalShow = false;
                                            } else {
                                                this.$Message.error(this.$t('crm.InqSet.error_addField'));
                                            }
                                            this.modalFlag = true;
                                        });
                                    }
                                } else {
                                    this.$Message.error(this.$t('crm.Table.errorOccurred'));
                                }
                            });
                        } else if (str === 'update') {
                            this.modalFlag = false;
                            const updateFormOptionObj = {
                                storageName: this.tempField.storageName
                            };

                            // 根据字段类型不同获取值
                            switch (obj.fieldType) {
                                case this.$t('crm.InqSet.textInput'):
                                    colDefaultValue = obj.fieldTextDefault;
                                    break;
                                case this.$t('crm.InqSet.textArea'):
                                case this.$t('crm.InqSet.longTextArea'):
                                    colDefaultValue = obj.fieldTextareaDefault;
                                    break;
                                case this.$t('crm.InqSet.selectSingle'):
                                case this.$t('crm.InqSet.selectMultiple'):
                                    option = obj.fieldListItems;
                                    updateFormOptionObj.options = obj.fieldListItems.join('?');
                                    colDefaultValue = obj.fieldSelectDefault;
                                    break;
                                case this.$t('crm.InqSet.date'):
                                    colDefaultValue = obj.fieldTimeDefault;
                            }
                            option = Array.isArray(option) ? option.join('?') : '';

                            if (this.check_length({
                                cname,
                                option,
                                colDefaultValue
                            })) {
                                this.modalFlag = true;
                                return false;
                            }
                            // 发送 更新当前自定义字段 请求
                            updateMustInputColumn({
                                orgId: this.enterpriseId,
                                parentId: this.fieldBelong,
                                isShow: 1,
                                storageName: this.tempField.storageName,
                                cname,
                                type: this.tempField.type,
                                option,
                                colDefaultValue,
                                mustInput
                            }).then(response => {
                                if (response.code === '1') {
                                    // 更新选项文字, 以便同步到线索
                                    if (updateFormOptionObj.hasOwnProperty('options')) {
                                        this.updateFormOption(updateFormOptionObj);
                                    }

                                    // 保存多语种
                                    if (option) {
                                        this.saveTranslate(option.split('?').concat([cname, colDefaultValue]));
                                    } else {
                                        this.saveTranslate([cname, colDefaultValue]);
                                    }
                                    this.getDefaultAndColumnsFields();

                                    this.update_column_info(cname, this.tempField.storageName, 0);
                                    this.$Message.success(this.$t('crm.InqSet.success_editField'));
                                    this.modalShow = false;
                                } else {
                                    this.$Message.error(this.$t('crm.InqSet.error_editField'));
                                }
                                this.modalFlag = true;
                            });
                        }
                    }
                } else {
                    this.$Message.error(this.$t('crm.InqSet.error_fieldName'));
                }
            },
            // 添加字段模态框的 取消提交方法
            cancel() {
                this.modalShow = false;
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
                temp.splice(index + 1, 0, '');
                this.$set(this.modalItems.fieldListItems, 'value', temp);
            },
            // 列表内容 删除列表项方法
            modalDeleteListItem(index) {
                const temp = this.modalItems.fieldListItems.value.slice();
                temp.splice(index, 1);
                this.$set(this.modalItems.fieldListItems, 'value', temp);
            },

            /* 编辑默认字段模态框 */
            ok_edit_default_field() {
                // 被编辑字段
                const prevField = this.defaultFieldList.find(item => item.storageName === this.tempDefaultField.storageName);
                // 操作的是联系人时，要判断邮箱、电话、instagram、WhatsApp、社交平台中的一项为必填
                if (this.fieldBelong === 2 && !this.excludeCompany.includes(this.enterpriseId) && ['email', 'phone', 'instagram', 'whatsApp', 'socialNetworkingPlatform'].includes(prevField.storageName) && !this.tempDefaultField.mustInput && this.checkContactMustInput() === 1) {
                    this.$nextTick(() => {
                        this.tempDefaultField.mustInput = true;
                    });
                    this.$Message.warning(this.$t('crm.InqSet.changeRequired'));
                    return;
                }

                if (prevField) {
                    const sendData = {}; // 定义发送的请求数据对象
                    let flag = false; // 定义是否可发送请求

                    // 检查必填是否变动
                    if (this.tempDefaultField.can_check_mustInput) {
                        if (this.tempDefaultField.mustInput !== prevField.mustInput) {
                            sendData.mustInput = this.tempDefaultField.mustInput ? 1 : 2;
                            flag = true;
                        }
                    }

                    // 检查提示语是否变动
                    if (this.tempDefaultField.colDefaultValue !== prevField.colDefaultValue) {
                        sendData.colDefaultValue = this.tempDefaultField.colDefaultValue;
                        flag = true;
                    }

                    if (flag) {
                        const tempField = this.$deepClone(this.tempDefaultField);

                        // 根据被编辑字段是否有 id , 来发送不同的请求(保存/更新)
                        let url = '';
                        if (this.tempDefaultField.id) {
                            url = 'crm/columnConfig/updateColDefaultValueAndMustInput';
                            sendData.id = this.tempDefaultField.id;
                        } else {
                            url = '/crm/columnConfig/save';
                            sendData.orgId = this.enterpriseId;
                            sendData.parentId = this.fieldBelong;
                            sendData.storageName = this.tempDefaultField.storageName;
                        }

                        this.loading_edit_default_field = true;
                        saveOrUpdateColDefault({
                            url,
                            data: sendData
                        }).then(res => {
                            if (res.code === '1') {
                                // 如果有 colDefaultValue 变更
                                if (sendData.hasOwnProperty('colDefaultValue')) {
                                    // 变更后不为空, 则保存多语言
                                    if (sendData.colDefaultValue) {
                                        this.saveTranslate([sendData.colDefaultValue]);
                                    }
                                    // 同步提示语到线索模板和表单
                                    this.updateDefaultField({
                                        storageName: prevField.storageName,
                                        colDefaultValue: sendData.colDefaultValue
                                    });
                                }


                                const index = this.get_default_field_index_by_storageName(prevField.storageName);
                                if (!tempField.id) {
                                    tempField.id = res.data.id;
                                }
                                this.tempDefaultField = {};
                                this.$set(this.defaultFieldList, index, tempField);
                                this.$Message.success(this.$t('crm.UniSet.success_edit'));
                                this.show_edit_default_field = false;
                            } else {
                                this.$Message.error(this.$t('crm.UniSet.error_edit'));
                            }
                            this.loading_edit_default_field = false;
                        });
                    } else {
                        this.$Message.error('您没有编辑任何信息!');
                    }
                } else {
                    this.$Message.error(this.$t('crm.Modal.errorOccurred'));
                }
            },

            /* 其他 */

            // 更新字段信息, 在 编辑/删除/恢复 时调用
            update_column_info(cname, storageName, isHide) {
                fieldIsHide({
                    cname: cname,
                    storageName: storageName,
                    orgId: this.enterpriseId,
                    parentId: this.fieldBelong,
                    isHide: isHide
                }).then();
            },
            /**
             * @Description: 去掉对此接口的调用
             * 原因: 此时只传了 storageName , 后端实际无法得知这个字段是哪个字段(公司字段/询盘字段/联系人字段), 根本就无法找到线索设置和表单设置中的此字段进行更新
             * 向后端确认逻辑, 后端说此接口只是根据 storageName 是否满足"是 线索字段中与 CRM 字段有固定对应关系的前 20 多个线索字段中的选项型字段 的 storageName"条件来更新数据
             * 这就说明此处调用不但不能同步选项到线索/表单, 还可能造成错误, 将自定义字段的选项同步到其他线索字段选项中去(如: 将 a10014 自定义字段选项更新到线索 a10014 字段选项去)
             * 实际 BUG :
             * 【ID1013040】字段设置-多选项字段, 选项更新后, 未同步到线索和表单, 且有可能造成错误
             * https://www.tapd.cn/51663361/bugtrace/bugs/view?bug_id=1151663361001013040
             * 【ID1013050】getXSShow接口返回线索字段值有误
             * https://www.tapd.cn/51663361/bugtrace/bugs/view?bug_id=1151663361001013050
             * 在解决后者时, 后端说暂时没空把同步逻辑补上, 让前端先把此处去掉, 先解决错位问题, 问过测试, 也确认可以先这么改
             * @author 汤一飞
             * @date 2022/4/15
             */
            // 改动单选类型的自定义字段的下拉选项时, 同步更新到线索表单
            updateFormOption(obj) {
                // updateFormColumnOption({
                //     orgId: this.enterpriseId,
                //     storageName: obj.storageName,
                //     options: obj.options
                // });
            },
            // 默认字段提示语变化时, 更新到线索模板和表单字段
            updateDefaultField(obj) {
                // 线索的 sourceKey 和询盘设置的 storageName 并不完全匹配, 这里更新的时候把不匹配的 storageName 转换成线索的 sourceKey
                let sourceKey = obj.storageName;
                switch (obj.storageName) {
                    case 'phone':
                        if (`${this.fieldBelong}` === '1') {
                            sourceKey = 'phone';
                        }
                        if (`${this.fieldBelong}` === '2') {
                            sourceKey = 'phone_2';
                        }
                        break;
                    case 'remark':
                        if (`${this.fieldBelong}` === '2') {
                            sourceKey = 'remark_2';
                        }
                        if (`${this.fieldBelong}` === '3') {
                            sourceKey = 'remark_3';
                        }
                }
                updateColDefaultValueByCrmStorageName({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    parentId: this.fieldBelong,
                    storageName: sourceKey,
                    colDefaultValue: obj.colDefaultValue
                });
            },
            // 更改选项时, 保存多语种
            saveTranslate(arr) {
                const postData = {
                    orgId: this.enterpriseId,
                    textList: arr,
                    dest: 'zh_cn'
                };
                this.$commonApi.saveTranslate(postData);
            },
            // 初始拖拽
            creatSortable() {
                const vm = this;
                Sortable.create(this.$refs.listItemDrop[0].$el.querySelector('.isShowFieldList'), {
                    group: {
                        name: 'list',
                        pull: false,
                        put: false
                    },
                    animation: 120,
                    ghostClass: 'placeholder-style',
                    fallbackClass: 'iview-admin-cloned-item',
                    onEnd: vm.endFunc2
                });
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
            const vm = this;
            const field_sort = this.$refs['sort-type'].$el;
            Sortable.create(field_sort, {
                group: {
                    name: this.fieldBelong, // 标识拖拽范围, 这里使用 this.fieldBelong , 避免询盘设置页面三种不同 fieldBelong 的字段设置组件内部字段可相互拖动
                    pull: false, // 内部拖拽元素不可拖出 dom
                    put: false // 外部拖拽元素不可拖进 dom
                },
                animation: 120,
                ghostClass: 'placeholder-style',
                fallbackClass: 'iview-admin-cloned-item',
                onEnd: vm.endFunc
            });
        },
        watch: {
            computed_sort_series(val) {
                this.temp_sort_series = [];
            },
            inputLimit: {
                handler(val) {
                    this.getDefaultAndColumnsFields();
                },
                deep: true
            }
        }
    };
</script>

<style lang="less">
    .product-field-setting {
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

        .formHeader {
            font-size: 15px;
            color: rgba(0, 0, 0, 0.80);
            font-weight: bold;
            p {
                font-weight: normal;
                font-size: 12px;
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
                // width: 96px;
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
                width: calc(~"100% - 96px");
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
    }

    * /deep/ .el-form-item__label {
        word-wrap: break-word;
        word-break: break-all;
    }

    .field-modal {
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
