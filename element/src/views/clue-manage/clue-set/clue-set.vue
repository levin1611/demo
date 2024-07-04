<style lang="less">
    @import '../../../styles/common.less';
    @import '../../main-components/draggable-list.less';
</style>

<template>
    <div class="main-body" style="position: relative;">
        <!-- 页面 loading -->
        <Spin v-if="loading"
              size="large"
              fix></Spin>
        <!-- 顶部文字 + 按钮 -->
        <div style="margin-bottom: 10px;position: relative;height: 38px">
            <!-- 顶部提示 -->
            <div style="margin-right: 100px;display: inline-block;font-size: 12px;color: rgba(0, 0, 0, 0.6);">{{ $t('clue.set_tip1') }}</div>
        </div>
        <!-- 左右面板 -->
        <Row :key="flag_refreshSort">
            <Col ::span="24">
                <Row>
                    <Col :span="12">
                        <p style="margin-bottom: 5px;font-size: 12px;">{{$t('clue.leads_list')}}</p>
                        <div ref="clueColSet">
                            <Card class="clue-col-set" dis-hover>
                                <p slot="header">
                                    {{$t('clue.template')}}
                                </p>
                                <div id="todoList" :style="{height: clipHeight1 + 'px'}">
                                    <div v-for="column in clueListTemp"
                                         :key="column.key"
                                         class="field-block">
                                        <Row>
                                            <div class="field-name">{{ column.name }}</div>
                                            <div class="field-frame">
                                                <Select v-if="column.type=='select'"
                                                        v-model="column.value"
                                                        :placeholder="column.colDefaultValue" style="width: 162px">
                                                    <Option v-for="item in filterOption(column.option)" :value="item">
                                                        {{item}}
                                                    </Option>
                                                </Select>
                                                <Select v-else-if="column.type=='selectMultiple'"
                                                        v-model="column.value"
                                                        :placeholder="column.colDefaultValue||undefined"
                                                        style="width: 162px"
                                                        multiple>
                                                    <Option v-for="item in filterOption(column.option)" :value="item">
                                                        {{ item }}
                                                    </Option>
                                                </Select>
                                                <template v-else-if="column.type === 'date+time'">
                                                    <DatePicker
                                                        v-model="column.value"
                                                        type="datetime"
                                                        style="width:162px;"
                                                        value-format="yyyy-MM-dd HH:mm:ss"
                                                        :placeholder="column.colDefaultValue">
                                                    </DatePicker>
                                                </template>
                                                <template v-else-if="column.type === 'date'">
                                                    <DatePicker
                                                        v-model="column.value"
                                                        type="date"
                                                        style="width:162px;"
                                                        value-format="yyyy-MM-dd"
                                                        :placeholder="column.colDefaultValue">
                                                    </DatePicker>
                                                </template>
                                                <Input
                                                    show-word-limit
                                                    :maxlength="column.upperLimitLength"
                                                    v-else-if="column.type=='textarea'"
                                                    :placeholder="column.colDefaultValue"
                                                    type="textarea"
                                                    style="width: 162px;font-size: 12px;"></Input>
                                                <Input
                                                    show-word-limit
                                                    :maxlength="column.upperLimitLength"
                                                    :placeholder="column.colDefaultValue"
                                                    style="width: 162px;font-size: 12px;"
                                                    v-else></Input>
                                            </div>
                                            <label v-if="column.key==='a1009'">
                                                <Checkbox style="margin-left: 15px;margin-right: 0"
                                                          class="checkbox-type checkbox"
                                                          :value="true"
                                                          disabled
                                                ></Checkbox>
                                            </label>
                                            <Checkbox v-else style="margin-left: 15px;margin-right: 0"
                                                      class="checkbox-type checkbox"
                                                      :value="column.isNeed | filterCheckbox"
                                                      @change="changeCheck"></Checkbox>
                                            <Button v-if="!column.isDefault" class="checkbox-type" type="text"
                                                    size="large"
                                                    style="margin-left: 5px"
                                                    @click="deleteCol()">
                                                <Icon color="#677F99" custom="custom custom-delete"></Icon>
                                            </Button>
                                            <Button v-if="column.isEdit" class="checkbox-type" type="text"
                                                    size="large"
                                                    style="margin-left: 5px"
                                                    @click="editCol(column)">
                                                <Icon color="#677F99" custom="custom custom-field-edit"></Icon>
                                            </Button>
                                        </Row>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </Col>
                    <Col :span="12" class="padding-left-10">
                        <p style="margin-bottom: 5px;font-size: 12px;">{{$t('clue.set_tip2')}}</p>
                        <Card class="clue-col-set1" dis-hover>
                            <div class="demo-tabs-style1">
                                <Tabs value="name1">
                                    <TabPane :label="$t('clue.inquiry_info')" name="name1">
                                        <div id="doList1" :style="{height: clipHeight + 'px', marginLeft: '16px'}">
                                            <div v-for="column in enquiryList"
                                                 :key="`${column.sourceType}_${column.sourceKey}`"
                                                 class="field-block">
                                                <Row>
                                                    <div class="field-name">{{ column.name }}</div>
                                                    <div class="field-frame">
                                                        <Select v-if="column.type=='select'"
                                                                v-model="column.value"
                                                                :placeholder="column.colDefaultValue"
                                                                style="width: 162px">
                                                            <Option v-for="item in  filterOption(column.option)"
                                                                    :value="item">{{ item }}
                                                            </Option>
                                                        </Select>
                                                        <Select v-else-if="column.type=='selectMultiple'"
                                                                v-model="column.value"
                                                                :placeholder="column.colDefaultValue||undefined"
                                                                style="width: 162px" multiple>
                                                            <Option v-for="item in filterOption(column.option)"
                                                                    :value="item">{{ item }}
                                                            </Option>
                                                        </Select>
                                                        <template v-else-if="column.type === 'date+time'">
                                                            <DatePicker
                                                                v-model="column.value"
                                                                type="datetime"
                                                                style="width:162px;"
                                                                value-format="yyyy-MM-dd HH:mm:ss"
                                                                :placeholder="column.colDefaultValue">
                                                            </DatePicker>
                                                        </template>
                                                        <template v-else-if="column.type === 'date'">
                                                            <DatePicker
                                                                v-model="column.value"
                                                                type="date"
                                                                style="width:162px;"
                                                                value-format="yyyy-MM-dd"
                                                                :placeholder="column.colDefaultValue">
                                                            </DatePicker>
                                                        </template>
                                                        <Input
                                                            show-word-limit
                                                            :maxlength="column.upperLimitLength"
                                                            v-else-if="column.type=='textarea'"
                                                            :placeholder="column.colDefaultValue"
                                                            type="textarea"
                                                            style="width: 162px">
                                                        </Input>
                                                        <Input
                                                            show-word-limit
                                                            :maxlength="column.upperLimitLength"
                                                            :placeholder="column.colDefaultValue"
                                                            style="width: 162px"
                                                            v-else>
                                                        </Input>
                                                    </div>
                                                    <Checkbox style="margin-left: 15px;margin-right: 0"
                                                              class="checkbox-type checkbox"
                                                              @change="changeCheck"></Checkbox>
                                                    <Button class="checkbox-type" type="text" size="large"
                                                            style="margin-left: 5px"
                                                            @click="deleteCol()">
                                                        <Icon color="#677F99" custom="custom custom-delete"></Icon>
                                                    </Button>
                                                </Row>
                                            </div>
                                        </div>
                                    </TabPane>
                                    <TabPane :label="$t('clue.contact')" name="name2">
                                        <div id="doList2" :style="{height: clipHeight + 'px',marginLeft: '16px'}">
                                            <div v-for="column in contactList"
                                                 :key="`${column.sourceType}_${column.sourceKey}`"
                                                 class="field-block">
                                                <Row>
                                                    <div class="field-name">{{ column.name }}</div>
                                                    <div class="field-frame">
                                                        <Select v-if="column.type=='select'"
                                                                v-model="column.value"
                                                                :placeholder="column.colDefaultValue"
                                                                style="width: 162px">
                                                            <Option v-for="item in filterOption(column.option)"
                                                                    :value="item">{{ item }}
                                                            </Option>
                                                        </Select>
                                                        <Select v-else-if="column.type=='selectMultiple'"
                                                                v-model="column.value"
                                                                :placeholder="column.colDefaultValue||undefined"
                                                                style="width: 162px" multiple>
                                                            <Option v-for="item in filterOption(column.option)"
                                                                    :value="item">{{ item }}
                                                            </Option>
                                                        </Select>
                                                       <template v-else-if="column.type === 'date+time'">
                                                            <DatePicker
                                                                v-model="column.value"
                                                                type="datetime"
                                                                style="width:162px;"
                                                                value-format="yyyy-MM-dd HH:mm:ss"
                                                                :placeholder="column.colDefaultValue">
                                                            </DatePicker>
                                                        </template>
                                                        <template v-else-if="column.type === 'date'">
                                                            <DatePicker
                                                                v-model="column.value"
                                                                type="date"
                                                                style="width:162px;"
                                                                value-format="yyyy-MM-dd"
                                                                :placeholder="column.colDefaultValue">
                                                            </DatePicker>
                                                        </template>
                                                        <Input
                                                            v-else-if="column.type=='textarea'"
                                                            show-word-limit
                                                            :maxlength="column.upperLimitLength"
                                                            :placeholder="column.colDefaultValue"
                                                            type="textarea"
                                                            style="width: 162px"></Input>
                                                        <Input
                                                            :placeholder="column.colDefaultValue"
                                                            show-word-limit
                                                            :maxlength="column.upperLimitLength"
                                                            style="width: 162px"
                                                            v-else></Input>
                                                    </div>
                                                    <Checkbox style="margin-left: 15px;margin-right: 0"
                                                              class="checkbox-type checkbox"
                                                              @change="changeCheck"></Checkbox>
                                                    <Button class="checkbox-type" type="text"
                                                            size="large" @click="deleteCol()">
                                                        <Icon color="#677F99" custom="custom custom-delete"></Icon>
                                                    </Button>
                                                </Row>
                                            </div>
                                        </div>
                                    </TabPane>
                                    <TabPane :label="$t('clue.company')" name="name3">
                                        <div id="doList3" :style="{height: clipHeight + 'px', marginLeft: '16px'}">
                                            <div v-for="column in companyList"
                                                 :key="`${column.sourceType}_${column.sourceKey}`"
                                                 class="field-block">
                                                <Row>
                                                    <div class="field-name">{{ column.name }}</div>
                                                    <div class="field-frame">
                                                        <Select v-if="column.type=='select'"
                                                                v-model="column.value"
                                                                :placeholder="column.colDefaultValue"
                                                                style="width: 162px">
                                                            <Option v-for="item in filterOption(column.option)"
                                                                    :value="item">{{ item }}
                                                            </Option>
                                                        </Select>
                                                        <Select v-else-if="column.type=='selectMultiple'"
                                                                v-model="column.value"
                                                                :placeholder="column.colDefaultValue||undefined"
                                                                style="width: 162px" multiple>
                                                            <Option v-for="item in filterOption(column.option)"
                                                                    :value="item">{{ item }}
                                                            </Option>
                                                        </Select>
                                                       <template v-else-if="column.type === 'date+time'">
                                                            <DatePicker
                                                                v-model="column.value"
                                                                type="datetime"
                                                                style="width:162px;"
                                                                value-format="yyyy-MM-dd HH:mm:ss"
                                                                :placeholder="column.colDefaultValue">
                                                            </DatePicker>
                                                        </template>
                                                        <template v-else-if="column.type === 'date'">
                                                            <DatePicker
                                                                v-model="column.value"
                                                                type="date"
                                                                style="width:162px;"
                                                                value-format="yyyy-MM-dd"
                                                                :placeholder="column.colDefaultValue">
                                                            </DatePicker>
                                                        </template>
                                                        <Input
                                                            show-word-limit
                                                            :maxlength="column.upperLimitLength"
                                                            v-else-if="column.type=='textarea'"
                                                            :placeholder="column.colDefaultValue"
                                                            type="textarea"
                                                            style="width: 162px"></Input>
                                                        <Input
                                                            show-word-limit
                                                            :maxlength="column.upperLimitLength"
                                                            :placeholder="column.colDefaultValue"
                                                            style="width: 162px"
                                                            v-else></Input>
                                                    </div>
                                                    <Checkbox style="margin-left: 15px;margin-right: 0"
                                                              class="checkbox-type checkbox"
                                                              @change="changeCheck"></Checkbox>
                                                    <Button class="checkbox-type" type="text"
                                                            size="large" @click="deleteCol()">
                                                        <Icon color="#677F99" custom="custom custom-delete"></Icon>
                                                    </Button>
                                                </Row>
                                            </div>
                                        </div>
                                    </TabPane>
                                </Tabs>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Col>
        </Row>

        <!-- 删除字段确认框 -->
        <Modal :visible.sync="showDelModal"
               :title="$t('formSet.deletePrompt')"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               width="540px">
            <!-- 删除确认框 loading -->
            <Spin v-if="loading_delField"
                  fix></Spin>
            <!-- 删除提示 -->
            <p v-if="deleteTip">{{ deleteTip }}</p>
            <br>
            <p v-if="canDelete">{{ $t('formSet.deleteFieldTip') }}</p>
            <!-- 底部按钮 -->
            <span slot="footer">
                <!-- 取消 -->
                <Button v-if="canDelete"
                        @click="cancelDel">{{ $t('cancel') }}</Button>
                <!-- 确定 -->
                <Button type="primary"
                        @click="confirmDel">{{ $t('confirm') }}</Button>
            </span>
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
                <!-- 内容列表 -->
                <FormItem ref="listItemDrop"
                            :label="`${$t('crm.InqSet.selectItemsContent')}`">
                    <div v-if="isShowFieldList" class="isShowFieldList">
                        <Row v-for="(listItem, itemIndex) in tempDefaultField.optionValue"
                            :key="itemIndex"
                            :style="`${itemIndex === (tempDefaultField.optionValue.length - 1) ? 'margin-bottom:0;' : 'margin-bottom:12px;'}`">
                            <Col :span="20">
                                <Input type="text"
                                    show-word-limit
                                    :maxlength="tempDefaultField.upperLimitLength"
                                    v-model="tempDefaultField.optionValue[itemIndex]">{{tempDefaultField.optionValue[itemIndex]}}</Input>
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
                <!-- 必填 -->
                <FormItem :label="`${$t('crm.InqSet.mustInput')}`">
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
    </div>
</template>

<script>
    import util from '@/libs/util';
    import Sortable from 'sortablejs';
    import { mapState } from 'vuex';
    import { getUpperLengthLimit } from '@/api/upperLengthLimit.js';
    import resetInitComponents from '@/mixins/resetComponentViewData';

    export default {
        name: 'set_clue',
        mixins: [resetInitComponents],
        data() {
            return {
                /* 全局 */
                // loading
                loading: true,
                // sortable 实例
                clueSortList: null,
                inquirySortList: null,
                contactSortList: null,
                companySortList: null,

                /* CRM 固定字段多语言 */
                lang_fixed_columns: {
                    a1001: this.$t('crm.InqSet.corp_companyName'),
                    a1002: this.$t('crm.InqSet.corp_mainProduct'),
                    a1003: this.$t('crm.InqSet.corp_countryArea'),
                    a1004: this.$t('crm.InqSet.corp_homePage'),
                    a1005: this.$t('crm.InqSet.corp_fax'),
                    a1006: this.$t('crm.InqSet.corp_phone'),
                    a1007: this.$t('crm.InqSet.corp_contactAddress'),
                    a1008: this.$t('crm.InqSet.corp_companyRemark'),
                    a1009: this.$t('crm.InqSet.contact_nickName'),
                    a10010: this.$t('crm.InqSet.contact_email'),
                    a10011: this.$t('crm.InqSet.contact_jobTitle'),
                    a10012: this.$t('crm.InqSet.contact_phone'),
                    a10013: this.$t('crm.InqSet.contact_socialNetworkingPlatform'),
                    a10014: this.$t('crm.InqSet.contact_gender'),
                    a10015: this.$t('crm.InqSet.contact_remark'),
                    a10016: this.$t('crm.InqSet.inq_demandProducts'),
                    a10017: this.$t('crm.InqSet.inq_label'),
                    a10018: this.$t('crm.InqSet.inq_productCategory'),
                    a10019: this.$t('crm.InqSet.inq_sourceChannel'),
                    a10020: this.$t('crm.InqSet.inq_sourceWay'),
                    a10021: this.$t('crm.InqSet.inq_remark'),
                    a10052: this.$t('crm.InqSet.contact_whatsApp'),
                    a10053: this.$t('crm.InqSet.contact_instagram'),
                    a10055: this.$t('crm.InqSet.corp_clientType'),
                    a10056: this.$t('crm.Table.col_customerSource'),
                    clueClass: this.$t('crm.InqSet.corp_leadLevel')
                },

                /* CRM 固定字段 sourceKey */
                sourceKey_fixed_columns: {
                    a1001: 'companyName',
                    a1002: 'mainProduct',
                    a1003: 'countryArea',
                    a1004: 'homePage',
                    a1005: 'fax',
                    a1006: 'phone',
                    a1007: 'contactAddress',
                    a1008: 'companyRemark',
                    a1009: 'nickName',
                    a10010: 'email',
                    a10011: 'jobTitle',
                    a10012: 'phone_2',
                    a10013: 'socialNetworkingPlatform',
                    a10014: 'gender',
                    a10015: 'remark_2',
                    a10016: 'demandProducts',
                    a10017: 'label',
                    a10018: 'productCategory',
                    a10019: 'sourceChannel',
                    a10020: 'sourceWay',
                    a10021: 'remark_3',
                    a10052: 'whatsApp',
                    a10053: 'instagram',
                    a10055: 'clientType',
                    a10056: 'companySourceWay'
                },
                clueListTemp: [], // 线索表模板渲染到页面中的数据
                clueList: [], // 线索列表
                index: -1, // 线索表中当前选中的项的序号
                companyList: [], // 公司列表
                companyListTemp: [],
                companyTempList: [
                    {
                        name: this.$t('crm.InqSet.corp_companyName'),
                        sourceKey: 'companyName',
                        type: 'input',
                        isNeed: 0,
                        sourceType: 1,
                        verify: '',
                        key: 'a1001'
                    },
                    {
                        name: this.$t('crm.InqSet.corp_mainProduct'),
                        sourceKey: 'mainProduct',
                        type: 'input',
                        isNeed: 0,
                        sourceType: 1,
                        verify: '',
                        key: 'a1002'
                    },
                    {
                        name: this.$t('crm.InqSet.corp_countryArea'), // 国家地区
                        sourceKey: 'countryArea',
                        type: 'input',
                        isNeed: 0,
                        sourceType: 1,
                        verify: '',
                        key: 'a1003'
                    },
                    {
                        name: this.$t('crm.InqSet.corp_homePage'),
                        sourceKey: 'homePage',
                        type: 'input',
                        isNeed: 0,
                        sourceType: 1,
                        verify: 'url',
                        key: 'a1004'
                    },
                    {
                        name: this.$t('crm.InqSet.corp_fax'),
                        sourceKey: 'fax',
                        type: 'input',
                        isNeed: 0,
                        sourceType: 1,
                        verify: 'fax',
                        key: 'a1005'
                    },
                    {
                        name: this.$t('crm.InqSet.corp_phone'),
                        sourceKey: 'phone',
                        type: 'input',
                        isNeed: 0,
                        sourceType: 1,
                        verify: 'phone',
                        key: 'a1006'
                    },
                    {
                        name: this.$t('crm.InqSet.corp_contactAddress'),
                        sourceKey: 'contactAddress',
                        type: 'input',
                        isNeed: 0,
                        sourceType: 1,
                        key: 'a1007'
                    },
                    {
                        name: this.$t('crm.InqSet.corp_companyRemark'),
                        sourceKey: 'companyRemark',
                        type: 'input',
                        isNeed: 0,
                        sourceType: 1,
                        key: 'a1008'
                    },
                    {
                        name: this.$t('crm.InqSet.corp_clientType'),
                        sourceKey: 'clientType',
                        type: 'select',
                        option: '',
                        isNeed: 0,
                        sourceType: 1,
                        verify: '',
                        key: 'a10055'
                    },
                    {
                        name: this.$t('crm.Table.col_customerSource'),
                        sourceKey: 'companySourceWay',
                        type: 'select',
                        option: '',
                        isNeed: 0,
                        sourceType: 1,
                        key: 'a10056'
                    }

                ], // 公司字段列表
                contactList: [], // 联系人列表
                contactListTemp: [],
                contactTempList: [
                    // 增加一个whatsApp字段
                    {
                        name: this.$t('crm.InqSet.contact_whatsApp'),
                        sourceKey: 'whatsApp',
                        type: 'input',
                        isNeed: 0,
                        sourceType: 2,
                        verify: '',
                        key: 'a10052'
                    },
                    {
                        name: this.$t('crm.InqSet.contact_instagram'),
                        sourceKey: 'instagram',
                        type: 'input',
                        isNeed: 0,
                        sourceType: 2,
                        verify: '',
                        key: 'a10053'
                    },
                    {
                        name: this.$t('crm.InqSet.contact_nickName'), // 姓名
                        sourceKey: 'nickName',
                        type: 'input',
                        isNeed: 0,
                        sourceType: 2,
                        verify: '',
                        key: 'a1009'
                    },
                    {
                        name: this.$t('crm.InqSet.contact_email'),
                        sourceKey: 'email',
                        type: 'input',
                        isNeed: 0,
                        sourceType: 2,
                        verify: '',
                        key: 'a10010'
                    },
                    {
                        name: this.$t('crm.InqSet.contact_jobTitle'),
                        sourceKey: 'jobTitle',
                        type: 'input',
                        isNeed: 0,
                        sourceType: 2,
                        verify: '',
                        key: 'a10011'
                    },
                    {
                        name: this.$t('crm.InqSet.contact_phone'),
                        sourceKey: 'phone_2',
                        type: 'input',
                        isNeed: 0,
                        sourceType: 2,
                        verify: 'telephone',
                        key: 'a10012'
                    },
                    {
                        name: this.$t('crm.InqSet.contact_socialNetworkingPlatform'),
                        sourceKey: 'socialNetworkingPlatform',
                        type: 'select',
                        option: '',
                        isNeed: 0,
                        sourceType: 2,
                        verify: '',
                        key: 'a10013'
                    },
                    {
                        name: this.$t('crm.InqSet.contact_gender'),
                        sourceKey: 'gender',
                        type: 'select',
                        isNeed: 0,
                        sourceType: 2,
                        option: `${this.$t('crm.InqSet.male')}?${this.$t('crm.InqSet.female')}`,
                        verify: '',
                        key: 'a10014'
                    },
                    {
                        name: this.$t('crm.InqSet.contact_remark'),
                        sourceKey: 'remark_2',
                        type: 'input',
                        isNeed: 0,
                        sourceType: 2,
                        verify: '',
                        key: 'a10015'
                    }
                ], // 联系人字段列表
                enquiryList: [], // 询盘列表
                enquiryListTemp: [],
                enquiryTempList: [
                    {
                        name: this.$t('crm.InqSet.inq_demandProducts'),
                        sourceKey: 'demandProducts',
                        type: 'input',
                        isNeed: 0,
                        sourceType: 3,
                        verify: '',
                        key: 'a10016'
                    },
                    {
                        name: this.$t('crm.InqSet.inq_label'),
                        sourceKey: 'label',
                        type: 'selectMultiple',
                        option: '',
                        isNeed: 0,
                        sourceType: 3,
                        verify: '',
                        key: 'a10017'
                    },
                    {
                        name: this.$t('crm.InqSet.inq_productCategory'),
                        sourceKey: 'productCategory',
                        type: 'selectMultiple',
                        option: '',
                        isNeed: 0,
                        sourceType: 3,
                        verify: '',
                        key: 'a10018'
                    },
                    {
                        name: this.$t('crm.InqSet.inq_sourceChannel'), // 来源渠道
                        sourceKey: 'sourceChannel',
                        type: 'select',
                        option: '',
                        isNeed: 0,
                        sourceType: 3,
                        verify: '',
                        key: 'a10019'
                    },
                    {
                        name: this.$t('crm.InqSet.inq_sourceWay'), // 来源方式
                        sourceKey: 'sourceWay',
                        type: 'select',
                        option: '',
                        isNeed: 0,
                        sourceType: 3,
                        verify: '',
                        key: 'a10020'
                    },
                    {
                        name: this.$t('crm.InqSet.inq_remark'),
                        sourceKey: 'remark_3',
                        type: 'textarea',
                        isNeed: 0,
                        sourceType: 3,
                        key: 'a10021'
                    }
                ], // 询盘字段列表
                templateId: '', // 线索表id

                // 默认字段
                defaultList: [
                    {
                        name: this.$t('crm.InqSet.contact_nickName'), // 姓名
                        sourceKey: 'nickName',
                        type: 'input',
                        isNeed: 1,
                        sourceType: 2,
                        verify: '',
                        key: 'a1009',
                        isDefault: true,
                        value: ''
                    },
                    {
                        name: this.$t('crm.InqSet.inq_sourceChannel'), // 来源渠道
                        sourceKey: 'sourceChannel',
                        type: 'select',
                        option: '',
                        isNeed: 0,
                        sourceType: 3,
                        verify: '',
                        key: 'a10019',
                        isDefault: true,
                        value: ''
                    },
                    {
                        name: this.$t('crm.InqSet.inq_sourceWay'), // 来源方式
                        sourceKey: 'sourceWay',
                        type: 'select',
                        option: '',
                        isNeed: 0,
                        sourceType: 3,
                        verify: '',
                        key: 'a10020',
                        isDefault: true,
                        value: ''
                    }
                ],

                customCol_relation: [], // 线索字段与询盘自定义字段对应关系

                /* 对接权限系统 */
                corp_custom_field: {}, // 公司所有字段
                contact_custom_field: {}, // 联系人所有字段,
                inquiry_custom_field: {}, // 询盘所有字段

                /* 删除 Modal */
                showDelModal: false,
                loading_delField: false,
                deleteTip: '',
                canDelete: false,

                // 控制页面刷新, 避免已存在的 sortable 实例影响 vue 渲染, 导致 refreshData 后, 拖动有误的字段仍然按之前的错误结果显示
                flag_refreshSort: 0,
                tempDefaultField: {
                    typeValue: this.$t('crm.InqSet.selectSingle')
                },
                loading_edit_default_field: false,

                // 允许编辑的默认字段的 type 的中英文
                lang_type_editAllowed: {
                    select: this.$t('crm.InqSet.selectSingle')
                },
                show_edit_default_field: false, // 编辑字段配置
                isShowFieldList: true
            };
        },
        filters: {
            filterCheckbox: function(val) {
                if (val === 1) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        computed: {
            ...mapState({
                userId: 'userId',
                userName: 'userName',
                enterpriseId: 'enterpriseId',
                window_height: 'window_height',
                lang: state => state.app.lang
            }),
            clipHeight1() {
                return this.window_height - 249;
            },
            clipHeight() {
                return this.window_height - 245;
            },
            // 合并隐藏的和显示的自定义字段, 代表着所有自定义字段
            all_corp_custom_field() {
                let temp = {};
                if (this.corp_custom_field.show) {
                    temp = Object.assign({}, this.corp_custom_field.show, this.corp_custom_field.hide);
                }
                return temp;
            },
            all_contact_custom_field() {
                let temp = {};
                if (this.contact_custom_field.show) {
                    temp = Object.assign({}, this.contact_custom_field.show, this.contact_custom_field.hide);
                }
                return temp;
            },
            all_inquiry_custom_field() {
                let temp = {};
                if (this.inquiry_custom_field.show) {
                    temp = Object.assign({}, this.inquiry_custom_field.show, this.inquiry_custom_field.hide);
                }
                return temp;
            },

            // 根据请求到的线索字段对应关系, 匹配 CRM 自定义字段以取得其 sourceType 和 name
            computed_customCol_relation() {
                const temp = {};
                this.customCol_relation.forEach(({ column, crmColumn, crmType }) => {
                    temp[column] = {
                        sourceType: crmType,
                        sourceKey: crmColumn
                    };
                    let tempField = {};
                    switch (crmType) {
                        case 1:
                            tempField = this.all_corp_custom_field[crmColumn] || {};
                            break;
                        case 2:
                            tempField = this.all_contact_custom_field[crmColumn] || {};
                            break;
                        case 3:
                            tempField = this.all_inquiry_custom_field[crmColumn] || {};
                    }
                    temp[column].name = tempField.cname;
                });
                return temp;
            },

            // 已被分配的线索 key 数组(从小到大排列)
            sorted_clue_key_numbers() {
                return this.clueList.filter(item => item.key.startsWith('a100')).map(item => Number(item.key.slice(4))).sort((a, b) => a - b);
            }
        },
        mounted() {
            document.body.ondrop = function(event) {
                event.preventDefault();
                event.stopPropagation();
            };
            this.refreshData();
        },
        methods: {
            /* 全局(获取数据, 数据处理, 创建排序实例) */
            // 刷新数据
            refreshData() {
                // 更新页面, 避免渲染错误
                this.flag_refreshSort++;

                // 更新线索字段
                this.getXSShow();

                // 在页面更新完毕后再创建 sortable 实例, 避免和 vue 渲染页面发生冲突, 创建实例失败
                setTimeout(() => {
                    this.createSortableInstance();
                }, 0);
            },
            // 获得线索字段
            getXSShow() {
                this.loading = true;
                this.$commonApi.getXSShow({
                    orgId: this.enterpriseId
                }).then(response => {
                    if (response.code === '1') {
                        const data = response.data;
                        // 保存模板id
                        this.templateId = data.template.id;
                        (async data => {
                            // 请求默认字段, 回填默认字段提示语
                            await this.$commonApi.columnConfigGetList({
                                orgId: this.enterpriseId
                            }).then(res => {
                                if (res.code === '1') {
                                    // 处理 companyTempList 等三个 tempList
                                    res.data.forEach(item => {
                                        switch (String(item.parentId)) {
                                            case '1':
                                                if (item.colDefaultValue) {
                                                    const index = this.companyTempList.findIndex(field => field.sourceKey === item.storageName);
                                                    if (index !== -1) {
                                                        // 在具体位置更新数据
                                                        this.$set(this.companyTempList, index, Object.assign({}, this.companyTempList[index], { colDefaultValue: item.colDefaultValue }));
                                                    }
                                                }
                                                break;
                                            case '2':
                                                if (item.colDefaultValue) {
                                                    let index = -1;
                                                    switch (item.storageName) {
                                                        case 'phone':
                                                            index = this.contactTempList.findIndex(field => field.sourceKey === 'phone_2');
                                                            break;
                                                        case 'remark':
                                                            index = this.contactTempList.findIndex(field => field.sourceKey === 'remark_2');
                                                            break;
                                                        default:
                                                            index = this.contactTempList.findIndex(field => field.sourceKey === item.storageName);
                                                    }
                                                    if (index !== -1) {
                                                        this.$set(this.contactTempList, index, Object.assign({}, this.contactTempList[index], { colDefaultValue: item.colDefaultValue }));
                                                    }
                                                }
                                                break;
                                            case '3':
                                                if (item.colDefaultValue) {
                                                    let index = -1;
                                                    switch (item.storageName) {
                                                        case 'remark':
                                                            index = this.enquiryTempList.findIndex(field => field.sourceKey === 'remark_3');
                                                            break;
                                                        default:
                                                            index = this.enquiryTempList.findIndex(field => field.sourceKey === item.storageName);
                                                    }
                                                    if (index !== -1) {
                                                        this.$set(this.enquiryTempList, index, Object.assign({}, this.enquiryTempList[index], { colDefaultValue: item.colDefaultValue }));
                                                    }
                                                }
                                        }
                                    });
                                    // 处理 defaultList
                                    this.defaultList.forEach((field, index) => {
                                        const temp = res.data.find(item => field.sourceKey === item.storageName);
                                        if (temp && temp.colDefaultValue) {
                                            // 默认字段重新赋值
                                            this.$set(this.defaultList, index, Object.assign({}, field, { colDefaultValue: temp.colDefaultValue }));
                                        }
                                    });
                                }
                            });

                            // 获取下拉选项, 回填到字段(主要是因为可能有需要保存的默认字段)
                            await this.getOption();

                            // 处理默认字段, 若有线索默认字段漏掉未保存, 则保存并退出流程
                            if (this.handleDefaultList(data.show)) {
                                return;
                            }

                            // 先请求完所有自定义字段, 但不做处理
                            const arr_get_custom_field = await util.axios.all([1, 2, 3].map(id => util.ajax({
                                url: '/crm/custom/getColumnsShow',
                                method: 'post',
                                data: {
                                    orgId: this.enterpriseId,
                                    parentId: id
                                }
                            })));

                            // 虽然不作处理, 但是先把要用到的请求回来的数据提取出来
                            ['corp_custom_field', 'contact_custom_field', 'inquiry_custom_field'].forEach((item, index) => {
                                if (arr_get_custom_field[index].data.code === '1') {
                                    this[item] = arr_get_custom_field[index].data.data;
                                }
                            });
                            // 如果有自定义字段, 则请求字段对应关系, 请求完成后再往下执行
                            if (Object.keys(data.show).some(key => key.startsWith('a100') && Number(key.slice(4)) > 21)) {
                                const res_col_relation = await util.ajax({
                                    url: '/form-cust/formcrm/columnRelation/selectListByOrgId',
                                    method: 'get',
                                    params: {
                                        orgId: this.enterpriseId
                                    }
                                });

                                // 请求字段对应关系完成
                                if (res_col_relation.data.code === '1') {
                                    // 从字段对应关系中筛选出自定义字段对应关系
                                    this.customCol_relation = Array.isArray(res_col_relation.data.data) ? res_col_relation.data.data.filter(item => item.column.startsWith('a100') && Number(item.column.slice(4)) > 21) : [];
                                    // 如果字段对应关系数组为空, 且线索模板表不为空, 说明现在还是老版本(CRM 自定义字段长度每类 8 个), 将老版本数据按新版的格式重新构造, 这样保存线索模板时, 自定义字段就是按新版的来了.
                                    const allCol_relation = Array.isArray(res_col_relation.data.data) ? res_col_relation.data.data : [];
                                    if (Object.keys(data.show).length !== 0 && !allCol_relation.length) {
                                        // 构造新版字段对应关系
                                        this.customCol_relation = Object.keys(data.show).filter(key => key.startsWith('a100') && Number(key.slice(4)) > 21).map(key => {
                                            return {
                                                column: key,
                                                crmColumn: key,
                                                orgId: this.enterpriseId,
                                                userId: this.userId,
                                                templateId: this.templateId,
                                                crmType: this.getColType(key)
                                            };
                                        });
                                    }
                                } else {
                                    this.$Message.error(this.$t('clue.error_getClueRelations'));
                                    this.loading = false;
                                }
                            }
                            // 获取线索字段最大长度
                            const resData = await getUpperLengthLimit({ serviceFlag: 'save_clue', orgId: this.enterpriseId });
                            // 格式化线索字段列表
                            this.clueListTemp = [];
                            this.clueList = [];
                            Object.entries(data.show).forEach(([key, value]) => {
                                const obj = value;
                                /** 因为select组件一定要绑定值，所以多加一个value属性 */
                                obj.value = obj.type === 'selectMultiple' ? [] : '';
                                obj.key = key;
                                const numberKey = Number(key.slice(4));

                                // 遍历给字段增加最大长度限制
                                if (resData.code === '1') {
                                    Object.keys(resData.data).forEach(keys => {
                                        if (obj.key === keys) {
                                            if (resData.data[keys].typeLength) {
                                                let temp = '';
                                                if (obj.type === 'input' || obj.type === 'text') {
                                                    temp = JSON.parse(resData.data[keys].typeLength).text;
                                                } else if (obj.type === 'textarea') {
                                                    temp = JSON.parse(resData.data[keys].typeLength).textarea;
                                                }
                                                obj.upperLimitLength = temp;
                                            } else {
                                                obj.upperLimitLength = resData.data[keys].usableLength;
                                                if (keys === 'clueClass') {
                                                    this.tempDefaultField.upperLimitLength = resData.data[keys].usableLength;
                                                }
                                            }
                                        }
                                    });
                                }

                                if ((key.startsWith('a100') && numberKey >= 1 && numberKey <= 21) || ['a10052', 'a10053', 'a10055', 'a10056'].includes(key)) {
                                    if (numberKey === 9 || numberKey === 19 || numberKey === 20) {
                                        obj.isDefault = true;
                                    }
                                    if (numberKey === 9) {
                                        obj.isNeed = 1;
                                    }
                                    // 1 - 21 为默认字段, 不管字段对应关系, 直接按默认的来
                                    obj.name = this.lang_fixed_columns[key];
                                    obj.sourceType = this.getColType(key);
                                    obj.sourceKey = this.sourceKey_fixed_columns[key];
                                } else if (key.startsWith('a100') && numberKey > 21 && numberKey <= 50) {
                                    // 后面的按自定义字段关系匹配而得的计算属性来, 当值为空时, 按老版本来
                                    obj.name = (this.computed_customCol_relation[key] && this.computed_customCol_relation[key].name) ? this.computed_customCol_relation[key].name : obj.name;
                                    obj.sourceType = (this.computed_customCol_relation[key] && this.computed_customCol_relation[key].sourceType) ? this.computed_customCol_relation[key].sourceType : this.getColType(key);
                                    obj.sourceKey = (this.computed_customCol_relation[key] && this.computed_customCol_relation[key].sourceKey) ? this.computed_customCol_relation[key].sourceKey : key;
                                } else if (key === 'clueClass') {
                                    obj.name = this.lang_fixed_columns[key];
                                    obj.isEdit = true;
                                    obj.isDefault = true;
                                } else {
                                    return false;
                                }
                                this.clueListTemp.push(obj);
                                this.clueList.push(obj);
                            });
                            // 获取线索字段最大长度
                            const resDataCrm = await getUpperLengthLimit({ serviceFlag: 'save_inquiry', orgId: this.enterpriseId });
                            const crmLimitArr = [];
                            if (resDataCrm.code === '1') {
                                const { crm_company: crmCompanyLimit, crm_contacts: crmContactsLimit, crm_inquiry: crmInquiryLimit } = resDataCrm.data;
                                crmLimitArr.push(crmCompanyLimit, crmContactsLimit, crmInquiryLimit);
                            }
                            // 此时才处理之前的请求自定义字段结果, 因为用到的方法中有需要 clueList 的
                            arr_get_custom_field.forEach((response, index) => {
                                let tempList = [];
                                if (response.data.code === '1') {
                                    const colList = response.data.data.show;
                                    tempList = this.makeUpArr(index + 1, colList);
                                }

                                let dataList = [];
                                switch (index + 1) {
                                    case 1:
                                        dataList = this.companyTempList.concat(tempList);
                                        const arr1 = this.compareArr(1, dataList);
                                        this.companyList = arr1;
                                        this.companyListTemp = arr1.concat();
                                        this.companyListTemp.forEach(company => {
                                            Object.keys(crmLimitArr[0]).forEach(keys => {
                                                if (company.sourceKey === keys) {
                                                    if (crmLimitArr[0][keys].typeLength) {
                                                        let temp = '';
                                                        if (company.type === 'input' || company.type === 'text') {
                                                            temp = JSON.parse(crmLimitArr[0][keys].typeLength).text;
                                                        } else if (company.type === 'textarea') {
                                                            temp = JSON.parse(crmLimitArr[0][keys].typeLength).textarea;
                                                        }
                                                        company.upperLimitLength = temp;
                                                    } else {
                                                        company.upperLimitLength = crmLimitArr[0][keys].usableLength;
                                                    }
                                                }
                                            });
                                        });
                                        break;
                                    case 2:
                                        dataList = this.contactTempList.concat(tempList);
                                        const arr2 = this.compareArr(2, dataList);
                                        this.contactList = arr2;
                                        this.contactListTemp = arr2.concat();
                                        this.contactListTemp.forEach(contact => {
                                            Object.keys(crmLimitArr[1]).forEach(keys => {
                                                if (contact.sourceKey === keys) {
                                                    if (crmLimitArr[1][keys].typeLength) {
                                                        let temp = '';
                                                        if (contact.type === 'input' || contact.type === 'text') {
                                                            temp = JSON.parse(crmLimitArr[1][keys].typeLength).text;
                                                        } else if (contact.type === 'textarea') {
                                                            temp = JSON.parse(crmLimitArr[1][keys].typeLength).textarea;
                                                        }
                                                        contact.upperLimitLength = temp;
                                                    } else {
                                                        contact.upperLimitLength = crmLimitArr[1][keys].usableLength;
                                                    }
                                                }
                                            });
                                        });
                                        break;
                                    case 3:
                                        dataList = this.enquiryTempList.concat(tempList);
                                        const arr3 = this.compareArr(3, dataList);
                                        this.enquiryList = arr3;
                                        this.enquiryListTemp = arr3.concat();
                                        this.enquiryListTemp.forEach(inquiry => {
                                            Object.keys(crmLimitArr[2]).forEach(keys => {
                                                if (inquiry.sourceKey === keys) {
                                                    if (crmLimitArr[2][keys].typeLength) {
                                                        let temp = '';
                                                        if (inquiry.type === 'input' || inquiry.type === 'text') {
                                                            temp = JSON.parse(crmLimitArr[2][keys].typeLength).text;
                                                        } else if (inquiry.type === 'textarea') {
                                                            temp = JSON.parse(crmLimitArr[2][keys].typeLength).textarea;
                                                        }
                                                        inquiry.upperLimitLength = temp;
                                                    } else {
                                                        inquiry.upperLimitLength = crmLimitArr[2][keys].usableLength;
                                                    }
                                                }
                                            });
                                        });
                                        break;
                                }
                            });
                            this.loading = false;
                        })(data);
                    } else {
                        this.$Message.error(this.$t('clue.error_getClueFields'));
                        this.loading = false;
                    }
                });
            },
            // 创建排序列表
            createSortableInstance() {
                // 清除旧实例
                [this.clueSortList, this.inquirySortList, this.contactSortList, this.companySortList].forEach(item => {
                    if (item) {
                        item.destroy();
                    }
                });

                // 创建新实例
                // 暂存 this
                const vm = this;
                // 线索字段排序列表
                const todoList = document.getElementById('todoList');
                this.clueSortList = Sortable.create(todoList, {
                    group: {
                        name: 'div',
                        pull: true
                    },
                    animation: 120,
                    ghostClass: 'placeholder-style',
                    fallbackClass: 'iview-admin-cloned-item',
                    onChoose(event) {
                        vm.index = event.oldIndex;
                    },
                    onAdd(event) {
                    },
                    onUpdate(event) {
                        const item = vm.clueList.splice(event.oldIndex, 1);
                        vm.clueList.splice(event.newIndex, 0, item[0]);
                        vm.changeSort(item[0]);
                    }
                });
                // 询盘字段排序列表
                const doList1 = document.getElementById('doList1');
                this.inquirySortList = Sortable.create(doList1, {
                    group: {
                        name: 'div',
                        pull: true,
                        put: false
                    },
                    sort: false,
                    filter: '.iview-admin-draggable-delete',
                    animation: 120,
                    fallbackClass: 'iview-admin-cloned-item',
                    onChoose(event) {},
                    onStart(event) {},
                    onRemove(event) {
                        // 获取字段
                        const item = vm.enquiryListTemp.splice(event.oldIndex, 1)[0];
                        // 新增线索字段
                        vm.addClueField(item, event.newIndex);
                    }
                });
                // 联系人字段排序列表
                const doList2 = document.getElementById('doList2');
                this.contactSortList = Sortable.create(doList2, {
                    group: {
                        name: 'div',
                        pull: true,
                        put: false
                    },
                    sort: false,
                    filter: '.iview-admin-draggable-delete',
                    animation: 120,
                    fallbackClass: 'iview-admin-cloned-item',
                    onRemove(event) {
                        // 获取字段
                        const item = vm.contactListTemp.splice(event.oldIndex, 1)[0];
                        // 新增线索字段
                        vm.addClueField(item, event.newIndex);
                    }
                });
                // 公司字段排序列表
                const doList3 = document.getElementById('doList3');
                this.companySortList = Sortable.create(doList3, {
                    group: {
                        name: 'div',
                        pull: true,
                        put: false
                    },
                    sort: false,
                    filter: '.iview-admin-draggable-delete',
                    animation: 120,
                    fallbackClass: 'iview-admin-cloned-item',
                    onRemove(event) {
                        // 获取字段
                        const item = vm.companyListTemp.splice(event.oldIndex, 1)[0];
                        // 新增线索字段
                        vm.addClueField(item, event.newIndex);
                    }
                });
            },
            // 获取 CRM 自定义字段下拉选项
            getOption() {
                return this.$commonApi.getField({
                    orgId: this.enterpriseId
                }).then(response => {
                    if (response.code === '1') {
                        this.companyTempList.forEach((item) => {
                            if (item.sourceKey === 'socialNetworkingPlatform') {
                                item.option = this.makeUpOption(response.data.socialNetworkingPlatform);
                            }
                            if (item.sourceKey === 'clientType') {
                                item.option = this.makeUpOption(response.data.clientType);
                            }
                            if (item.sourceKey === 'companySourceWay') {
                                item.option = this.makeUpOption(response.data.sourceWay);
                            }
                        });
                        this.enquiryTempList.forEach(item => {
                            if (item.sourceKey === 'label') {
                                item.option = this.makeUpOption(response.data.tag);
                            }

                            if (item.sourceKey === 'productCategory') {
                                item.option = this.makeUpOption(response.data.productCategory);
                            }

                            if (item.sourceKey === 'sourceChannel') {
                                item.option = this.makeUpOption(response.data.sourceChannel);
                            }

                            if (item.sourceKey === 'sourceWay') {
                                item.option = this.makeUpOption(response.data.sourceWay);
                            }
                        });

                        this.defaultList.forEach(item => {
                            if (item.sourceKey === 'sourceChannel') {
                                item.option = this.makeUpOption(response.data.sourceChannel);
                            }
                            if (item.sourceKey === 'sourceWay') {
                                item.option = this.makeUpOption(response.data.sourceWay);
                            }
                        });
                        return true;
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getSelectOptions'));
                    }
                });
            },
            // 把字段option转成数组
            filterOption(str) {
                if (str) {
                    let arr = [];
                    arr = str.split('?');
                    return arr;
                }
            },
            // 组合下拉选项
            makeUpOption(arr) {
                if (arr) {
                    const temp = [];
                    const arrTemp = arr.sort((a, b) => a.sort - b.sort);
                    for (let i = 0; i < arrTemp.length; i++) {
                        if (arrTemp[i].isAvailable === 1) {
                            temp.push(arrTemp[i].attrName);
                        }
                    }
                    return temp.join('?');
                }
            },
            // 将字段拼装成新对象
            makeUpArr(type, arr) {
                const tempArr = [];
                for (const item in arr) {
                    const obj = {
                        name: arr[item].cname,
                        sourceKey: item,
                        option: arr[item].option,
                        colDefaultValue: arr[item].colDefaultValue,
                        type: arr[item].type,
                        isNeed: 0,
                        sourceType: type,
                        verify: '',
                        key: item,
                        value: arr[item].type === 'selectMultiple' ? [] : ''
                    };
                    tempArr.push(obj);
                }
                return tempArr;
            },
            // 比较列表字段，隐藏已经在线索的CRM字段
            compareArr(flag, arr) {
                this.clueList.filter(clueField => clueField.sourceType === flag).forEach(clueField => {
                    if (clueField.key.startsWith('a100')) {
                        const numberKey = Number(clueField.key.slice(4));

                        if ((numberKey >= 1 && numberKey <= 21) || ['a10052', 'a10053', 'a10055', 'a10056'].includes(clueField.key)) {
                            // 前 21 个都是默认字段, sourceKey 不是 a100 开头, 但是 key 是 a100 开头, 这样 filter 就能区分出一个 key a100 到底是默认字段还是自定义字段
                            arr = arr.filter(item => !(item.key === clueField.key && !item.sourceKey.startsWith('a100')));
                        } else if (numberKey > 21 && numberKey <= 50) {
                            // 后面的全部是自定义字段
                            arr = arr.filter(item => !(clueField.sourceKey === item.key && item.sourceKey.startsWith('a100')));
                        }
                    }
                });
                return arr;
            },
            // 获取字段来源 1：公司、2：联系人、3：询盘
            getColType(col) {
                switch (col) {
                    case 'a1001':
                    case 'a1002':
                    case 'a1003':
                    case 'a1004':
                    case 'a1005':
                    case 'a1006':
                    case 'a1007':
                    case 'a1008':
                    case 'a10026':
                    case 'a10027':
                    case 'a10028':
                    case 'a10029':
                    case 'a10030':
                    case 'a10031':
                    case 'a10032':
                    case 'a10033':
                    case 'a10055':
                    case 'a10056':
                        return 1;
                    case 'a1009':
                    case 'a10010':
                    case 'a10011':
                    case 'a10012':
                    case 'a10013':
                    case 'a10014':
                    case 'a10015':
                    case 'a10034':
                    case 'a10035':
                    case 'a10036':
                    case 'a10037':
                    case 'a10038':
                    case 'a10039':
                    case 'a10040':
                    case 'a10041':
                    case 'a10052':
                    case 'a10053':
                        return 2;
                    case 'a10016':
                    case 'a10017':
                    case 'a10018':
                    case 'a10019':
                    case 'a10020':
                    case 'a10021':
                    case 'a10042':
                    case 'a10043':
                    case 'a10044':
                    case 'a10045':
                    case 'a10046':
                    case 'a10047':
                    case 'a10048':
                    case 'a10049':
                        return 3;
                    case 'a10022':
                    case 'a10023':
                    case 'a10024':
                    case 'a10025':
                    case 'a10050':
                        break;
                }
            },
            // 处理默认字段, 默认字段提示语/下拉选项信息回填完成后调用
            // 判断是否需要保存漏掉未保存的线索默认字段, 是则返回 true , 并令调用它的 getXSShow 中断, 保存完成后, 再调用 getXSShow 重新获取线索字段(刷新数据)
            handleDefaultList(clueFields) {
                // 获取所有线索字段 storageName
                const clueKeyList = Object.keys(clueFields);
                // 判断线索模板表中漏掉的默认字段存为 unsavedDefaultFields
                const unsavedDefaultFields = this.defaultList.filter(item => !clueKeyList.includes(item.key));
                // 判断是否需要保存
                if (unsavedDefaultFields.length) {
                    // 批量保存线索默认字段
                    util.axios.all(this.saveDefaultFields(clueKeyList, unsavedDefaultFields)).then(() => {
                        this.getXSShow();
                    }).catch(() => {
                        this.getXSShow();
                    });

                    // 退出流程, 等待上述请求完成后 getXSShow 刷新页面
                    return true;
                }
            },
            // 保存之前未保存的线索默认字段 (getXSShow 里未返回)
            saveDefaultFields(clueKeyList, defaultFields) {
                // 获取要发送的数据
                const sendData = defaultFields.map((item, index) => {
                    return {
                        orgId: this.enterpriseId,
                        templateId: this.templateId,
                        fcolumn: {
                            cname: item.name,
                            storageName: item.key,
                            colOrder: clueKeyList.length + index,
                            colDefaultValue: item.colDefaultValue,
                            mustInput: 0,
                            spare1: item.type,
                            spare2: item.option
                        },
                        clueInquiryRelation: {
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            templateId: this.templateId,
                            column: item.key,
                            crmColumn: item.sourceKey,
                            crmType: item.sourceType
                        }
                    };
                });
                // 返回请求数组
                return sendData.map(item => {
                    return util.ajaxJson({
                        url: '/form-cust/column/addFiledForClue',
                        method: 'post',
                        data: item
                    });
                });
            },
            // 线索新增字段
            addClueField(item, newIndex) {
                // 数据校验
                if (!item) {
                    return;
                }

                // 超长文本域字段不支持拖入线索表模板
                if (item.key === 'a10040') {
                    this.$Message.error(this.$t('clue.clueSetError'));
                    this.clearFilterConditionByInitView('customRootRoomMainView');
                    this.refreshData();
                    return;
                }

                // 字段数量上限校验
                if (this.clueList.length >= 50) {
                    this.$Message.error(this.$t('clue.error_overFieldsLength'));
                    this.refreshData();
                    return;
                }

                // 给自定义字段分配线索 key
                if (item.sourceKey.startsWith('a100')) {
                    // 暂存"分配成功"变量
                    let flag = false;

                    // 遍历可分配给自定义字段的线索 key 数组, 查看是否还有可分配的 key
                    for (let i = 22; i <= 50; i++) {
                        if (this.sorted_clue_key_numbers.indexOf(i) === -1) {
                            // 给自定义 CRM 字段分配线索 key 成功

                            item.key = `a100${i}`;
                            flag = true;
                            break;
                        }
                    }

                    // 没有可分配给自定义字段的线索 key
                    if (!flag) {
                        this.$Message.error(this.$t('clue.error_overCustomFieldsLength'));
                        this.refreshData();
                        return;
                    }
                }

                // 计算得到 colOrder
                let colOrder = 0;
                const field = this.clueList[newIndex - 1];
                if (field && field.order) {
                    colOrder = field.order;
                }
                colOrder += 1;

                // 页面 loading
                this.loading = true;
                // 发送保存请求
                util.ajaxJson({
                    url: '/form-cust/column/addFiledForClue',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        templateId: this.templateId,
                        fcolumn: {
                            cname: item.name,
                            storageName: item.key,
                            colOrder,
                            colDefaultValue: item.colDefaultValue,
                            mustInput: 0,
                            spare1: item.type,
                            spare2: item.option
                        },
                        clueInquiryRelation: {
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            templateId: this.templateId,
                            column: item.key,
                            crmColumn: item.sourceKey,
                            crmType: item.sourceType
                        }
                    }
                }).then(response => {
                    switch (response.data.code) {
                        case '1':
                            // 成功
                            // 提示成功
                            this.$Message.success(`${this.$t('clue.clueSetAddSuccess1')}${item.name}${this.$t('clue.clueSetAddSuccess2')}`);
                            // 保存翻译
                            this.saveTranslate([item.name]);
                            break;
                        case '-100':
                            // 失败 - 该右侧字段已被删除
                            // 报错
                            this.$Message.error(`${this.$t('clue.clueSetAddFailed3')}${item.name}${this.$t('clue.clueSetAddFailed4')}`);
                            break;
                        case '-101':
                            // 失败 - 该字段已被添加
                            // 报错
                            this.$Message.error(`${this.$t('clue.clueSetAddFailed3')}${item.name}${this.$t('clue.clueSetAddFailed5')}`);
                            break;
                        default:
                            // 其他错误
                            // 报错
                            this.$Message.error(`${this.$t('clue.clueSetAddFailed1')}${item.name}${this.$t('clue.clueSetAddFailed2')}`);
                    }

                    // 刷新数据
                    this.refreshData();
                }).catch(error => {
                    // 报错
                    this.$Message.error(`${this.$t('clue.clueSetAddFailed1')}${item.name}${this.$t('clue.clueSetAddFailed2')}`);

                    // 刷新数据
                    this.refreshData();
                });
            },
            // 线索删除字段
            deleteCol() {
                // 若 index 错误, 退出流程
                if (this.index === -1) {
                    this.$Message.error(this.$t('crm.Html.errorOccurred'));
                    return;
                }
                // 获取字段信息
                const item = this.clueList[this.index];
                // 线索设置页整个 loading , 请求完成后再取消 loading 并显示删除确认弹窗
                this.loading = true;
                // 初始化数据
                this.showDelModal = false;
                this.loading_delField = false;
                this.deleteTip = '';
                this.canDelete = false;
                // 获得该字段正在被哪些表单使用，给出提示
                util.ajax({
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
                            // 标记为可以删除
                            this.canDelete = true;
                            break;
                        case '-100':
                            // 字段已被其他用户删除
                            // 提示字段已被其他用户删除并刷新
                            this.$Message.info(`${this.$t('clue.field')}${item.name}${this.$t('clue.clueSetDelTip7')}`);
                            // 刷新数据
                            this.refreshData();
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
                        this.showDelModal = true;
                    }
                }).catch(error => {
                    // 去掉页面 loading
                    this.loading = false;
                    // 报错
                    this.$Message.error(this.$t('crm.Html.errorOccurred'));
                });
            },
            // 线索更改必填状态
            changeCheck() {
                // 若 index 错误, 退出流程
                if (this.index === -1) {
                    this.$Message.error(this.$t('crm.Html.errorOccurred'));
                    return;
                }
                // 获取字段信息
                const item = this.clueList[this.index];
                // 获取要更改到的状态值
                const flag = item.isNeed === 0 ? 1 : 0;
                // 页面 loading
                this.loading = true;
                // 发送请求
                util.ajax({
                    url: '/form-cust/column/setNeedFiledForClue',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        storageName: item.key,
                        templateId: this.templateId,
                        isMust: flag
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$Message.success(`${this.$t('formSet.changeFieldRequired1')}${item.name}${flag === 1 ? this.$t('formSet.changeFieldRequired2') : this.$t('formSet.changeFieldRequired3')}`);
                        // 刷新数据
                        this.refreshData();
                    } else {
                        // 去掉页面 loading
                        this.loading = false;
                        this.$Message.error(this.$t('crm.InqSet.error_changeMustInput'));
                    }
                }).catch(error => {
                    // 去掉页面 loading
                    this.loading = false;
                    // 报错
                    this.$Message.error(this.$t('crm.InqSet.error_changeMustInput'));
                });
            },
            // 线索调整顺序
            changeSort(item) {
                // 页面 loading
                this.loading = true;
                // 发送请求
                util.ajaxJson({
                    url: '/form-cust/column/sortFiledForClue',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        templateId: this.templateId,
                        fColumns: this.clueList.map((item, index) => {
                            return {
                                storageName: item.key,
                                colOrder: index + 1
                            };
                        })
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        // 刷新数据
                        this.refreshData();
                    } else {
                        // 去掉页面 loading
                        this.loading = false;
                        this.$Message.error(`${this.$t('clue.clueSetSortFailed1')}${item.name}${this.$t('clue.clueSetSortFailed2')}`);
                    }
                }).catch(error => {
                    // 去掉页面 loading
                    this.loading = false;
                    // 报错
                    this.$Message.error(`${this.$t('clue.clueSetSortFailed1')}${item.name}${this.$t('clue.clueSetSortFailed2')}`);
                });
            },
            // 新增线索字段时保存线索字段名称的翻译
            saveTranslate(arr) {
                const postData = {
                    orgId: this.enterpriseId,
                    textList: arr,
                    dest: 'zh_cn'
                };
                util.ajaxJson({
                    url: '/cuss-login/translate/save',
                    method: 'post',
                    data: JSON.stringify(postData)
                }).then(res => {

                });
            },

            /* 删除字段模态框 */
            // 关闭删除确认框
            cancelDel() {
                // 关闭弹窗
                this.showDelModal = false;
                // 取消 loading
                this.loading_delField = false;
            },
            // 删除字段确认
            confirmDel() {
                // 若不可删除, 直接退出流程
                if (!this.canDelete) {
                    this.cancelDel();
                    return;
                }
                // 若 index 错误, 退出流程
                if (this.index === -1) {
                    this.$Message.error(this.$t('crm.Html.errorOccurred'));
                    return;
                }
                // 否则请求接口删除
                const item = this.clueList[this.index];
                this.loading_delField = true;
                /* 获得该字段正在被哪些表单使用，给出提示 */
                util.ajax({
                    url: '/form-cust/column/deleteFiledForClue',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        storageName: item.key,
                        templateId: this.templateId,
                        type: 2 // type: 1 查询, 2 操作
                    }
                }).then(response => {
                    switch (response.data.code) {
                        case '1':
                        case '-100':
                            // 关闭弹框
                            this.cancelDel();
                            // 提示删除成功
                            this.$Message.success(`${this.$t('clue.field')}${item.name}${this.$t('clue.clueSetDelSuccess')}`);
                            // 刷新数据
                            this.refreshData();
                            break;
                        default:
                            // 提示删除失败
                            this.$Message.error(`${this.$t('clue.clueSetDelFailed1')}${item.name}${this.$t('clue.clueSetDelFailed2')}`);
                            // 取消 loading
                            this.loading_delField = false;
                    }
                }).catch(error => {
                    // 提示删除失败
                    this.$Message.error(`${this.$t('clue.clueSetDelFailed1')}${item.name}${this.$t('clue.clueSetDelFailed2')}`);
                    // 取消 loading
                    this.loading_delField = false;
                });
            },
            // 编辑线索等级字段
            editCol(item) {
                this.show_edit_default_field = true;
                this.tempDefaultField = Object.assign({}, this.tempDefaultField, { name: item.name, mustInput: Boolean(item.isNeed), optionValue: item.option.split('?'), colDefaultValue: item.colDefaultValue });
                console.log('this.tempDefaultField ', this.tempDefaultField);
                this.$nextTick(() => {
                    this.creatSortable();
                });
            },
            endFunc(e) {
                if (e.newIndex !== e.oldIndex) {
                    // 交换变换的序号数值
                    const temp = this.tempDefaultField.optionValue;
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
            // 初始拖拽
            creatSortable() {
                const vm = this;
                Sortable.create(this.$refs.listItemDrop.$el.querySelector('.isShowFieldList'), {
                    group: {
                        name: 'list',
                        pull: false,
                        put: false
                    },
                    animation: 120,
                    ghostClass: 'placeholder-style',
                    fallbackClass: 'iview-admin-cloned-item',
                    onEnd: vm.endFunc
                });
            },
            // 添加字段模态框的类型为下拉框时
            // 列表内容 新增列表项方法
            modalAddListItem(index) {
                const temp = this.tempDefaultField.optionValue.slice();
                temp.splice(index + 1, 0, '');
                this.$set(this.tempDefaultField, 'optionValue', temp);
            },
            // 列表内容 删除列表项方法
            modalDeleteListItem(index) {
                const temp = this.tempDefaultField.optionValue.slice();
                temp.splice(index, 1);
                this.$set(this.tempDefaultField, 'optionValue', temp);
            },
            ok_edit_default_field() {
                const data = {
                    orgId: this.enterpriseId,
                    mustInput: this.tempDefaultField.mustInput ? 1 : 0,
                    optionValue: this.tempDefaultField.optionValue.join('?'),
                    typeValue: this.tempDefaultField.typeValue,
                    colDefaultValue: this.tempDefaultField.colDefaultValue,
                    storageName: 'clueClass'
                };
                util.ajaxJson({
                    url: '/form-cust/form/compileClueClass',
                    method: 'post',
                    data
                }).then(response => {
                    if (response.data.code === '1') {
                        this.show_edit_default_field = false;
                        this.getXSShow();
                    } else {
                        this.$Message.error('编辑失败');
                    }
                }).catch(() => {
                    this.$Message.error('编辑失败');
                });
            }
        }
    };
</script>

<style lang="less" scoped>

    .field-modal {
        /deep/ .el-select {
            width: 100%;
        }

        /deep/ .el-form-item {
            margin: 10px 0;
        }
    }
</style>

<style>
    #todoList, #doList1, #doList2, #doList3 {
        overflow-y: auto;
    }

    #doList1, #doList2, #doList3 {
        padding: 0 20px;
    }

    .field-block {
        margin-bottom: 10px;
    }

    .field-name {
        width: 100px;
        line-height: 30px;
        display: inline-block;
        word-wrap: break-word;
        word-break: break-all;
        vertical-align: top;
    }

    .field-frame {
        display: inline-block;
    }

    #doList1 .checkbox-type, #doList2 .checkbox-type, #doList3 .checkbox-type {
        display: none;
    }

</style>
