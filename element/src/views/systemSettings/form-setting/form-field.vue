<template>
    <div>
        <!-- 顶部提示语及右侧按钮 -->
        <div style="margin-bottom: 10px;display: flex;">
            <!-- 提示语 -->
            <span style="line-height: 30px;font-size: 12px;flex: 1;">{{ $t('formSet.formFieldTip') }}</span>
            <!-- 返回 -->
            <Button
                    @click="goBack"
                    style="margin-right: 12px">{{ $t('formSet.backBtn') }}</Button>
            <!-- 保存 -->
            <Button type="primary"
                    @click="saveClueForm">{{ $t('formSet.saveBtn') }}</Button>
        </div>

        <!-- </Row> -->
        <div style="position: relative">
            <!-- loading -->
            <Spin v-if="spinShow"
                  fix>
                <Icon type="ios-loading"
                      size=20
                      class="demo-spin-icon-load"></Icon>
            </Spin>
            <!-- 顶部提示 -->
            <Row>
                <Col :span="12">
                    <p style="margin-bottom: 5px; font-size: 12px;">{{ $t('formSet.fieldTxt') }}</p>
                </Col>
                <Col :span="12"
                     class="padding-left-10">
                    <p style="margin-bottom: 5px;font-size: 12px;">{{ $t('formSet.fieldTxt1') }}</p>
                </Col>
            </Row>
            <!-- 字段列表 -->
            <Row>
                <Col :span="12">
                    <Card dis-hover>
                        <div slot="header">
                            <Input v-model="formName"
                                   :placeholder="$t('formSet.fieldHolder')"
                                   @focus="tempFormName = formName.trim()"
                                   @blur="showFormNameTip"
                                   style="width: 300px"></Input>
                        </div>
                        <div ref="todoList"
                             :style="{height: clipHeight + 'px', overflowX: 'hidden', overflowY: 'auto'}">
                            <div class="field-block" v-for="(column, index) in clueListTemp" :key="index">
                                <div class="field-name">{{ column.name }}</div>
                                <div class="field-frame">
                                    <Select v-if="column.type.toLowerCase()==='select'"
                                            v-model="column.value"
                                            :placeholder="column.colDefaultValue" style="width: 162px">
                                        <Option v-for="(item, index) in filterOption(column.option)" :key="index" :value="item" :label="item"></Option>
                                    </Select>
                                    <Select v-else-if="column.type=='selectMultiple'"
                                            v-model="column.value"
                                            :placeholder="column.colDefaultValue||undefined"
                                            style="width: 162px" multiple>
                                        <Option v-for="(item, index) in filterOption(column.option)"
                                                :key="index"
                                                :value="item" :label="item"></Option>
                                    </Select>
                                    <Input
                                        v-else-if="column.type.toLowerCase()==='textarea'"
                                        show-word-limit
                                        :maxlength="column.upperLimitLength"
                                        :placeholder="column.colDefaultValue"
                                        type="textarea"
                                        style="width: 162px"></Input>
                                    <Input
                                        v-else
                                        show-word-limit
                                        :maxlength="column.upperLimitLength"
                                        :placeholder="column.colDefaultValue"
                                        style="width: 162px"></Input>
                                </div>
                                <Checkbox style="margin-left: 15px;margin-right: 0" class="checkbox-type"
                                          :value="column.isNeed | filterCheckbox"
                                          @change="changCheck()"></Checkbox>
                                <Button class="checkbox-type" style="margin-left: 5px" type="text" icon="custom custom-field-delete" size="large" @click="deleteCol()"></Button>
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col :span="12"
                     class="padding-left-10">
                    <Card dis-hover>
                        <div ref="doList1"
                             :style="{height: clipHeight1 + 'px', overflowX: 'hidden', overflowY: 'auto'}"
                             class="doListOne">
                            <div v-for="(column, index) in enquiryList"
                                :key="index"
                                 class="field-block">
                                <div class="field-name">{{ column.name }}</div>
                                <div class="field-frame">
                                    <Select v-if="column.type==='select'"
                                            v-model="column.value"
                                            :placeholder="column.colDefaultValue"
                                            style="width: 162px">
                                        <Option v-for="(item, index) in  filterOption(column.option)"
                                                :key="index"
                                                :value="item" :label="item"></Option>
                                    </Select>
                                    <Select v-else-if="column.type=='selectMultiple'"
                                            v-model="column.value"
                                            :placeholder="column.colDefaultValue||undefined"
                                            style="width: 162px" multiple>
                                        <Option v-for="(item, index) in filterOption(column.option)"
                                                :key="index"
                                                :value="item" :label="item"></Option>
                                    </Select>
                                    <Input
                                        show-word-limit
                                        :maxlength="column.upperLimitLength"
                                        v-else-if="column.type==='textarea'"
                                        :placeholder="column.colDefaultValue"
                                        type="textarea"
                                        style="width: 162px"></Input>
                                    <Input
                                        v-else
                                        show-word-limit
                                        :maxlength="column.upperLimitLength"
                                        :placeholder="column.colDefaultValue"
                                        style="width: 162px"></Input>
                                </div>
                                <Checkbox style="margin-left: 15px;margin-right: 0"
                                          class="checkbox-type"
                                          @change="changCheck()"></Checkbox>
                                <Button class="checkbox-type" type="text"
                                        style="margin-left: 5px"
                                        icon="custom custom-field-delete"
                                        size="large" @click="deleteCol()"></Button>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>

        <!-- 删除字段确认框 -->
        <Modal :visible.sync="isDeleteField"
               :title="$t('formSet.deletePrompt')"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               width="540px">
            <!-- 删除提示 -->
            <p v-if="deleteTip">{{ deleteTip }}</p>
            <br>
            <p v-if="clueList.length > 1">{{ $t('formSet.deleteFieldTip') }}</p>
            <!-- 底部按钮 -->
            <span slot="footer"
                  class="dialog-footer">
                <!-- 取消 -->
                <Button v-if="clueList.length > 1"
                        @click="isDeleteField = false">{{ $t('cancel') }}</Button>
                <!-- 确定 -->
                <Button type="primary"
                        @click="deleteField">{{ $t('confirm') }}</Button>
            </span>
        </Modal>
    </div>
</template>

<script>
    import util from '../../../libs/util';
    import Sortable from 'sortablejs';
    import Vue from 'vue';
    import { mapState } from 'vuex';
    import { getUpperLengthLimit } from '@/api/upperLengthLimit.js';
    import { saveTranslate } from '@/api/reusableApi/common';

    export default {
        name: 'form-field',
        props: [
            'showField',
            'formId',
            'formType',
            'templateId'
        ],
        data() {
            return {
                selectV: '',
                mSelectV: [],
                spinShow: true,
                formIdTemp: '', /* 保存成功后的表单id */
                tempFormName: '',
                formName: '表单名',
                flag: false, /* 避免一个表单提交多次 */
                affordList: [],
                clueListTemp: [],
                clueList: [], // 线索列表
                index: -1, // 线索表中当前选中的项的序号
                enquiryList: [],
                enquiryListTemp: [],
                enquiryId: '', // 线索表id
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
                isDeleteField: false // 删除字段前确认 modal 的 visible
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
                enterpriseId: 'enterpriseId',
                userName: 'userName',
                userId: 'userId',
                window_height: 'window_height',
                lang: state => state.app.lang
            }),
            clipHeight() {
                return this.window_height - 290;
            },
            clipHeight1() {
                return this.window_height - 290 + 69;
            },
            deleteTip() {
                // 获取字段
                const item = this.clueList[this.index] || {};

                // 判断是否仅剩一个字段, 是则无法删除
                if (this.clueList.length === 1) {
                    return this.$t('formSet.deleteOnlyLeft1') + item.name + this.$t('formSet.deleteOnlyLeft2');
                }

                // 根据表单类型的不同返回不同提示语
                if (this.formType === 1) {
                    // FB 表单
                    return this.$t('formSet.deleteFieldTip1') + item.name + this.$t('formSet.deleteFieldTip3');
                } else {
                    // 其他(网站留言表单, AMP 表单)
                    return this.$t('formSet.deleteFieldTip1') + item.name + this.$t('formSet.deleteFieldTip2');
                }
            }
        },
        mounted() {
            document.body.ondrop = function(event) {
                event.preventDefault();
                event.stopPropagation();
            };

            const vm = this;
            const todoList = this.$refs.todoList;
            Sortable.create(todoList, {
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
                    // 提示表单新增字段
                    const item = vm.enquiryListTemp[event.oldIndex];
                    vm.$Message.success(`${vm.$t('formSet.addField1')}${item.name}${vm.$t('formSet.addField2')}`);
                },
                onUpdate(event) {
                    const item = vm.clueList.splice(event.oldIndex, 1);
                    vm.clueList.splice(event.newIndex, 0, item[0]);
                },
                onRemove(event) {
                    vm.doArray.splice(event.newIndex, 0, vm.todoArray[event.item.getAttribute('data-index')]);
                }
            });
            const doList1 = this.$refs.doList1;
            Sortable.create(doList1, {
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
                    const item = vm.enquiryListTemp.splice(event.oldIndex, 1);
                    vm.clueList.splice(event.newIndex, 0, item[0]);
                }
            });
        },
        created() {
            this.formIdTemp = this.formId || '';
            // this.getCol()
            this.getXSShow();
        },
        methods: {
            // 返回表格页
            goBack() {
                this.$emit('updateList');
                this.$emit('update:showField', 0);
            },
            /* 把字段option转成数组 */
            filterOption(str) {
                let arr = [];
                arr = str.split('?');
                return arr;
            },
            /* 将字段拼装成新对象 */
            makeUpArr(arr) {
                const tempArr = [];
                for (const item in arr) {
                    // 遍历给字段增加最大长度限制
                    // if (limitLength.code === '1') {
                    //     Object.keys(limitLength.data).forEach(keys => {
                    //         if (item === keys) {
                    //             // arr[item].upperLimitLength = limitLength.data[keys].usableLength;
                    //             if (limitLength.data[keys].typeLength) {
                    //                 let temp = '';
                    //                 if (arr[item].type === 'input' || arr[item].type === 'text') {
                    //                     temp = JSON.parse(limitLength.data[keys].typeLength).text;
                    //                 } else if (arr[item].type === 'textarea') {
                    //                     temp = JSON.parse(limitLength.data[keys].typeLength).textarea;
                    //                 }
                    //                 arr[item].upperLimitLength = temp;
                    //             } else {
                    //                 arr[item].upperLimitLength = limitLength.data[keys].usableLength;
                    //             }
                    //         }
                    //     });
                    // }
                    // 去掉日期时间型字段
                    if (['date', 'date+time'].includes(arr[item].type)) {
                        continue;
                    }

                    const obj = {
                        name: this.lang_fixed_columns[item] || arr[item].name,
                        colDefaultValue: arr[item].colDefaultValue,
                        sourceKey: item,
                        option: arr[item].option,
                        type: arr[item].type,
                        isNeed: 0,
                        verify: '',
                        key: item,
                        upperLimitLength: arr[item].type === 'textarea' ? 300 : 100,
                        value: arr[item].type === 'selectMultiple' ? [] : ''
                    };
                    tempArr.push(obj);
                }
                return tempArr;
            },
            // 表单名变更提示
            showFormNameTip() {
                // 表单名为空提示
                if (this.formName.trim() == '') {
                    this.$Message.warning(this.$t('formSet.fieldTip'));
                    return false;
                }
                // 表单名上限提示
                if (this.formName.trim().length > 30) {
                    this.$Message.warning(this.$t('formSet.error_formNameOverLength'));
                    return false;
                }
                // 提示变更表单名成功
                if (this.tempFormName !== this.formName.trim()) {
                    this.$Message.success(this.$t('formSet.success_changeFormName'));
                }
            },
            /* 保存表单模板 */
            saveClueForm() {
                if (this.formName.trim() == '') {
                    this.$Message.warning(this.$t('formSet.fieldTip'));
                    return false;
                }
                // 表单名上限校验
                if (this.formName.trim().length > 30) {
                    this.$Message.warning(this.$t('formSet.error_formNameOverLength'));
                    return false;
                }
                // 字段数量校验
                if (this.clueList.length === 0) {
                    this.$Message.warning(this.$t('formSet.fieldTip5'));
                    return false;
                }
                // 是否正在保存
                if (this.flag) {
                    this.$Message.warning(this.$t('formSet.fieldTip4'));
                    return;
                }
                // 若选中了时间日期型字段, 无法保存
                if (this.clueList.find(item => ['date', 'date+time'].includes(item.type))) {
                    this.$Message.warning(this.$t('formSet.fieldTip6'));
                    return;
                }

                // 标记当前正在保存
                this.flag = true;
                // 存放要发送的翻译内容
                let translateArr = [];
                // 要发送的数据 { template: {}, fColumns: [] }
                const jsonData = {
                    template: {
                        orgId: this.enterpriseId,
                        id: this.formIdTemp,
                        cname: this.formName.trim(),
                        billType: 1,
                        createUser: this.userName,
                        createUserId: this.userId,
                        cateType: this.formType
                    },
                    fColumns: this.clueList.map((item, index) => {
                        translateArr.push(item.name);
                        translateArr.push(item.colDefaultValue);
                        if (item.option && item.option.length) {
                            translateArr = translateArr.concat(item.option.split('?'));
                        }
                        return {
                            cname: item.name,
                            storageName: item.key,
                            colOrder: index + 1,
                            colDefaultValue: item.colDefaultValue,
                            mustInput: item.isNeed,
                            spare1: item.type,
                            spare2: item.option
                        };
                    })
                };
                // 翻译内容去重
                translateArr = [...new Set(translateArr)].filter(item => item);

                util.ajaxJson({
                    url: '/form-cust/column/saveTemplateForForm',
                    method: 'post',
                    data: jsonData
                }).then(response => {
                    switch (response.data.code) {
                        case '1':
                            // 保存成功
                            this.formIdTemp = response.data.data.id;
                            this.$Message.success(`${this.$t('formSet.success_saveForm1')}${this.formName}${this.$t('formSet.success_saveForm2')}`);

                            // 保存多语言
                            saveTranslate(JSON.stringify({
                                orgId: this.enterpriseId,
                                textList: translateArr,
                                dest: 'zh_cn'
                            }));

                            break;
                        case '-100':
                            // 表单名重复, 保存失败
                            this.$Message.error(this.$t('formSet.fieldExisting'));
                            break;
                        case '-101':
                            // 有字段已被删除, 保存失败
                            // 整理得到的数据得到提示语
                            if (response.data.data && response.data.data.lastFields) {
                                // 获取'已被线索模板表删除的字段数组' (值为 storageName)
                                let removedArr = response.data.data.lastFields;
                                // 根据 storageName 获取 cname
                                removedArr = removedArr.map(storageName => {
                                    const field = this.clueList.find(item => item.key === storageName);
                                    return field && field.name;
                                });

                                // 拼接得到要放到提示语中的"已被删除字段"字符串, 格式为: 中文: 【A】、【B】和【C】, 英文: [A],[B] and [C]
                                let removedStr = removedArr.slice(0, removedArr.length - 1).map(formName => `${this.$t('openBracket')}${formName}${this.$t('closedBracket')}`).join(this.lang === 'zh-CN' ? '、' : ', ');
                                if (removedArr.length > 1) {
                                    removedStr += this.lang === 'zh-CN' ? '和' : ' and ';
                                }
                                removedStr += `${this.$t('openBracket')}${removedArr[removedArr.length - 1]}${this.$t('closedBracket')}`;

                                // 提示用户, 要保存的字段中有字段已被线索设置删除
                                this.$Message.error(`${this.$t('formSet.error_saveForm3')}${removedStr}${this.$t('formSet.error_saveForm4')}`);
                            }
                            break;
                        default:
                            // 其他原因保存失败
                            this.$Message.error(`${this.$t('formSet.error_saveForm1')}${this.formName}${this.$t('formSet.error_saveForm2')}`);
                    }
                    this.flag = false;
                }).catch(e => {
                    // 保存失败
                    this.$Message.error(`${this.$t('formSet.error_saveForm1')}${this.formName}${this.$t('formSet.error_saveForm2')}`);
                    this.flag = false;
                    console.error(e);
                });
            },
            /* 线索删除字段 */
            deleteCol() {
                // 弹出删除前提示框
                this.isDeleteField = true;
            },
            deleteField() {
                // 关闭删除确认弹窗
                this.isDeleteField = false;

                // 判断是否是表单唯一字段, 是则退出删除流程
                if (this.clueList.length === 1) {
                    return;
                }

                const item = this.clueList[this.index];
                // 如果被删除的表单字段不为日期时间型字段, 则放回到线索字段中
                if (!['date', 'date+time'].includes(item.type)) {
                    this.enquiryList.push(item);
                    this.enquiryListTemp.push(item);
                }
                this.$refs.todoList.childNodes[this.index].remove();
                this.clueList.splice(this.index, 1);
            },
            changCheck() {
                const item = this.clueList[this.index];
                const flag = item.isNeed === 0 ? 1 : 0;
                Vue.set(this.clueList[this.index], 'isNeed', flag);
                // 必填状态更改提示
                this.$Message.success(`${this.$t('formSet.changeFieldRequired1')}${item.name}${flag === 1 ? this.$t('formSet.changeFieldRequired2') : this.$t('formSet.changeFieldRequired3')}`);
            },
            /* 获得表单字段 */
            getCol(parentId) {
                util.ajax({
                    url: '/form-cust/form/getColumnsShow',
                    method: 'post',
                    data: {
                        parentTempateId: parentId,
                        templateId: this.formId
                    }
                }).then(async response => {
                    if (response.data.code === '1') {
                        const data = response.data.data;
                        // const clueData = await getUpperLengthLimit({ serviceFlag: 'save_form', orgId: this.enterpriseId });
                        this.formName = data.template.cname;
                        this.enquiryId = data.template.id;

                        for (const item in data.show) {
                            const obj = data.show[item];
                            // if (clueData.code === '1') {
                            //     Object.keys(clueData.data).forEach(key => {
                            //         if (item === key) {
                            //             // obj.upperLimitLength = clueData.data[key].usableLength;
                            //             if (clueData.data[key].typeLength) {
                            //                 let temp = '';
                            //                 if (obj.type === 'input' || obj.type === 'text') {
                            //                     temp = JSON.parse(clueData.data[key].typeLength).text;
                            //                 } else if (obj.type === 'textarea') {
                            //                     temp = JSON.parse(clueData.data[key].typeLength).textarea;
                            //                 }
                            //                 obj.upperLimitLength = temp;
                            //             } else {
                            //                 obj.upperLimitLength = clueData.data[key].usableLength;
                            //             }
                            //         }
                            //     });
                            // }
                            obj.upperLimitLength = item.type === 'textarea' ? 300 : 100;
                            obj.sourceType = this.getColType(item);
                            obj.key = item;
                            obj.value = item.type === 'selectMultiple' ? [] : '';
                            this.clueListTemp.push(obj);
                            this.clueList.push(obj);
                        }
                        this.enquiryListTemp = [];
                        this.enquiryList = this.compareArr(this.enquiryList);
                        this.enquiryListTemp = this.enquiryList.concat();
                    } else {
                        this.$Message.error(this.$t('formSet.error_getFormFields'));
                    }
                    this.spinShow = false;
                }).catch(() => {
                    this.$Message.error(this.$t('formSet.error_getFormFields'));
                    this.spinShow = false;
                });
            },
            /* 获得线索字段 */
            getXSShow() {
                this.spinShow = true;
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(async response => {
                    let tempList = [];
                    if (response.data.code === '1') {
                        const colList = response.data.data.show;
                        // 删除表单不支持的字段 线索等级（clueClass）
                        delete colList.clueClass;
                        // const resData = await getUpperLengthLimit({ serviceFlag: 'save_clue', orgId: this.enterpriseId });

                        tempList = this.makeUpArr(colList);
                        this.enquiryList = tempList;
                        this.enquiryListTemp = tempList.concat();
                        const id = response.data.data.template.id;
                        if (this.formId) {
                            this.getCol(id);
                        } else {
                            this.spinShow = false;
                        }
                    } else {
                        this.$Message.error(this.$t('formSet.error_getClueFields'));
                        this.spinShow = false;
                    }
                }).catch(() => {
                    this.$Message.error(this.$t('formSet.error_getClueFields'));
                    this.spinShow = false;
                });
            },
            /* 比较列表字段，隐藏已经在线索的CRM字段 */
            compareArr(arr) {
                for (let i = 0; i < this.clueList.length; i++) {
                    for (let j = 0; j < arr.length; j++) {
                        if (this.clueList[i].key == arr[j].key) {
                            arr.splice(j, 1);
                            continue;
                        }
                    }
                }
                return arr;
            },
            /* 获取字段来源 1：公司、2：联系人、3：询盘 */
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
            }
        }
    };
</script>

<style lang="less">
    @import '../../../styles/common.less';
    @import '../../main-components/draggable-list.less';

    #doList1, #todoList {
        overflow-y: auto;
    }

    .field-block {
        cursor: pointer;
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

    #todoList .checkbox-type {

    }

    .doListOne .checkbox-type {
        display: none;
    }
</style>
