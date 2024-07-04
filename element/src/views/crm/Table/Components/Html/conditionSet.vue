<template>
    <div>
        <!-- 筛选条件 -->
        <div v-for="(add, index) in addCondition" class="conditionmain" style="margin-bottom: 10px;position: relative;">
            <Select v-model="add.condition1"
                    transfer
                    style="width:120px;margin-right:15px;float:left;"
                    filterable
                    :disabled="isInherit"
                    @change="computed_addChangeCon1(index)">
                <Option v-for="item in add.conditionList1" :value="item.value" :label="item.label"></Option>
            </Select>

            <Select v-model="add.condition2"
                    @change="computed_addChangeCon2(index)"
                    transfer
                    style="width:90px;margin-right:15px;float:left;"
                    :disabled="isInherit">
                <Option v-for="item in add.conditionList2" :value="item.value" :label="item.label"></Option>
            </Select>

            <div style="width: 175px;">
                <template v-if="add.inputType === 'string'">
                    <Input v-model="add.condition3"
                           :placeholder="$t('crm.Table.tip_addKeywords')"
                           :disabled="isInherit"
                           style="width:100%;margin-right:5px;"></Input>
                </template>
                <template v-else-if="add.inputType === 'number'">
                    <InputNumber :min="0" :max="add.condition1 === 'starLevel' ? 5 : Infinity" v-model="add.condition3"
                                 :placeholder="$t('crm.Table.tip_inputNumber')"
                                 :disabled="isInherit"
                                 style="width:100%;margin-right:5px;">
                    </InputNumber>
                </template>
                <template v-else-if="add.inputType === 'boolean'">
                    <Select v-model="add.condition3" transfer
                            :disabled="isInherit"
                            style="width:100%;margin-right:5px;">
                        <template v-if="add.condition1 === 'gender'">
                            <Option v-for="n in 2" :value="n">{{ n === 1 ? $t('crm.Modal.male') : n === 2 ?
                                $t('crm.Modal.female') : '' }}
                            </Option>
                        </template>
                        <template v-else>
                            <Option v-for="n in 2" :value="n">{{ n === 1 ? $t('crm.Table.con_is') : n === 2 ?
                                $t('crm.Table.con_not') : '' }}
                            </Option>
                        </template>
                    </Select>
                </template>
                <template v-else-if="add.inputType === 'dateRange'">
                    <DatePicker v-model="add.condition3"
                                transfer
                                type="daterange" placement="bottom-end"
                                :placeholder="$t('crm.Table.tip_selectTime')"
                                :disabled="isInherit"
                                ref="dateRange"
                                @on-open-change="bind_onclick_for_pickerPanel('dateRange', index)"
                                style="width: 100%;margin-right:5px;">
                    </DatePicker>
                </template>
                <template v-else-if="add.inputType === 'date'">
                    <DatePicker v-model="add.condition3"
                                transfer
                                type="date" placement="bottom-end"
                                :placeholder="$t('crm.Table.tip_selectTime')"
                                :disabled="isInherit"
                                ref="date"
                                @on-open-change="bind_onclick_for_pickerPanel('date', index)"
                                style="width: 100%;margin-right:5px;">
                    </DatePicker>
                </template>
                <template v-else-if="add.inputType === 'select'">
                    <Select v-model="add.condition3" filterable @change="change_con3_type_select($event, index)"
                            transfer
                            :disabled="isInherit"
                            class="multiple-select"
                            style="width: 100%;">
                        <!-- 适时显示'全部'选项 -->
                        <Option v-if="add.conditionList3.length && (storageName_all_checked === '' || add.is_selected_all)"
                                value="全部全部AllTousAlleTodosCompleto" :label="$t('all')"></Option>
                        <Option v-for="item in add.conditionList3"
                                :value="item.value"
                                :label="item.label"
                                :key="item.label + index_set + index"></Option>
                    </Select>
                </template>
                <template v-else-if="add.inputType === 'array'">
                    <Select v-model="add.condition3" multiple
                            filterable
                            transfer
                            :disabled="isInherit"
                            class="multiple-select"
                            style="width: 100%;">
                        <Option v-for="item in add.conditionList3"
                                :value="item.value"
                                :label="item.label"
                                :key="item.label + index_set + index"></Option>
                    </Select>
                </template>
                <template v-else-if="add.inputType === 'countryArea'">
                    <CountryAreaSelect style="width: 100%;margin-right: 5px;"
                                       :disabled="isInherit"
                                       :countryArea.sync="add.condition3"></CountryAreaSelect>
                </template>
            </div>

            <!-- 右侧删除按钮 -->
            <template v-if="!isInherit">
                <span @click="removeClick(index)">
                    <Icon custom="custom-minus-red" size="15" color="red"
                          class="remove-icon"></Icon>
                </span>
            </template>
        </div>

        <!-- 清除浮动 -->
        <div style="clear: both;height: 0;"></div>

        <!-- 新增筛选条件 -->
        <span v-if="!isInherit" class="add-condition"
              @click="addClick">{{ $t('systemNotice.addRule.addCondition')}}</span>
    </div>
</template>

<script>

    export default {
        name: 'conditionSet',
        props: [
            'isInherit', // 当前筛选条件集合是否继承自父级结点
            'isNoEmpty', // 当前条件集合是否没有空项,
            'index_set', // 当前 set 的 index
            'conditions', // 当前 set 的 ruleList.conditionList
            'sql_conditions', // 当前 set 的 ruleList.conditionList 转化成要发送的查询 sql 语句
            'storageName_all_checked', // 勾选'全部'时的 storageName
            'list_all_checked', // 勾选的'全部'选项

            'conditionList1', // 表格页, 第一栏下拉选项
            'conditionList2', // 表格页, 第二栏下拉选项
            'addChangeCon1', // 表格页, 第一项 Select 的 on-change
            'addChangeCon2', // 表格页, 第二项 Select 的 on-change
            'getSearchCon', // 表格页, 根据 storageName 获取 sql 字符串
            'allUsers', // 表格页, 所有用户
            'allColumns', // 表格页, 所有表格列
            'selectOptions', // 表格页, 所有下拉选项
            'separate_fields' // 所有单独发送字段的 storageName , 目前只做了 CRM , 所以只有 status 这一个, 之后复用到其他模块应该也会有其他单独发送字段
        ],
        components: {
        },
        computed: {
            computed_addCondition() {
                return this.addCondition.filter(item => item.condition1 && item.condition2 && ((item.condition3 && item.condition3.length) || item.condition3 instanceof Date || (typeof item.condition3 === 'number' && !isNaN(item.condition3)))).map(item => {
                    let temp = {};
                    let con = this.getSearchCon(item.condition1);
                    // let type = this.getSearchType(item.condition2);
                    let type = item.condition2;
                    switch (item.inputType) {
                        case 'string':
                        case 'number':
                        case 'boolean':
                        case 'select':
                            temp[con] = {};
                            temp[con][type] = item.condition3;
                            return temp;
                        case 'countryArea':
                            temp[con] = {};
                            temp[con][type === '$ne' ? '$nregex' : '$regex'] = item.condition3;
                            return temp;
                        case 'date':
                            temp[con] = {};
                            temp[con][type] = this.$options.filters.timeFormat(item.condition3);
                            if (type === '$gt') {
                                temp[con][type] = `${temp[con][type]} 23:59:59.999`;
                            }
                            return temp;
                        case 'dateRange':
                            if (item.condition3[0] && item.condition3[1]) {
                                temp['$and'] = [];

                                let start = {};
                                start[con] = {};
                                start[con]['$gte'] = this.$options.filters.timeFormat(item.condition3[0]);
                                temp['$and'].push(start);

                                let end = {};
                                end[con] = {};
                                end[con]['$lte'] = `${this.$options.filters.timeFormat(item.condition3[1])} 23:59:59.999`;
                                temp['$and'].push(end);
                                return temp;
                            }
                            break;
                        case 'array':
                            temp['$or'] = item.condition3.map(val => {
                                let temp = {};
                                temp[con] = {};
                                temp[con][type] = val;
                                return temp;
                            });
                            return temp;
                    }
                }).filter(item => !(!item || item === ''));
            }, // 计算 sql 语句
            computed_addChangeCon1() {
                return (...params) => {
                    this.check_changed_all_checked(params); // 检查改变之前是否是勾选"全部"
                    this.addChangeCon1.apply(this, params);
                };
            },
            computed_addChangeCon2() {
                return this.addChangeCon2.bind(this);
            },
            computed_conditionList1() {
                return this.conditionList1.filter(item => !this.separate_fields.includes(item.value));
            } // 去掉"单独发送字段"后的 conditionList1
        },
        data() {
            return {
                addCondition: [] // 检索条件集合
            };
        },
        methods: {
            /* 筛选 */
            // 添加检索条件
            addClick() {
                this.addCondition.push({
                    condition1: '',
                    conditionList1: [...new Set(this.computed_conditionList1)],
                    condition2: '',
                    conditionList2: this.$deepClone(this.conditionList2),
                    condition3: '',
                    inputType: 'string'
                });
            },
            // 删除检索条件
            removeClick(index) {
                let temp = this.addCondition.splice(index, 1);
                if (temp[0] && temp[0].is_selected_all) {
                    this.$emit('update:storageName_all_checked', '');
                    this.$emit('update:list_all_checked', []);
                }
                if (this.addCondition.length === 0) {
                    this.$emit('removeConSet', this.index_set);
                }
            },
            // 避免 datePicker 点击选择时关闭顶部筛选 Poptip
            bind_onclick_for_pickerPanel(refName, index) {
                if (this.$refs[refName] && this.$refs[refName][index]) {
                    this.$refs[refName][index].$refs.pickerPanel.$el.onclick = () => {
                        this.$emit('prevent_close_popper');
                    };
                }
            },

            // 回填数据
            backFill_addCondition(data) {
                this.addCondition = [];
                this.$nextTick(() => {
                    data.forEach(item => {
                        if (item.condition1) {
                            this.addClick();
                            let index = this.addCondition.length - 1;
                            this.addCondition[index].condition1 = item.condition1;
                            this.computed_addChangeCon1(index);
                            this.$nextTick(() => {
                                this.addCondition[index].condition2 = item.condition2;
                                this.computed_addChangeCon2(index);
                                this.$nextTick(() => {
                                    switch (this.addCondition[index].inputType) {
                                        case 'string':
                                        case 'number':
                                        case 'boolean':
                                        case 'countryArea':
                                        case 'select':
                                        case 'array':
                                            this.addCondition[index].condition3 = item.condition3;
                                            break;
                                        case 'date':
                                            this.addCondition[index].condition3 = new Date(item.condition3);
                                            break;
                                        case 'dateRange':
                                            if (item.condition3[0] && item.condition3[1]) {
                                                this.addCondition[index].condition3 = item.condition3.map(timeStr => new Date(timeStr));
                                            } else {
                                                this.addCondition[index].condition3 = [];
                                            }
                                            break;
                                    }
                                });
                            });
                        }
                    }); // 逐项回填
                    if (!this.addCondition.length) {
                        this.addClick();
                    }
                });
            },

            /* 勾选全部 */
            change_con3_type_select(val, index) {
                let add = this.addCondition[index];
                if (add) {
                    if (val === '全部全部AllTousAlleTodosCompleto') {
                        add.is_selected_all = true;
                        this.$emit('update:storageName_all_checked', add.condition1);
                        this.$emit('update:list_all_checked', add.conditionList3);
                    } else if (add.is_selected_all) {
                        add.is_selected_all = false;
                        this.$emit('update:storageName_all_checked', '');
                        this.$emit('update:list_all_checked', []);
                    }
                }
            }, // 检查是否选择了''
            check_changed_all_checked(index) {
                if (this.addCondition[index] && this.addCondition[index].is_selected_all) {
                    this.addCondition[index].is_selected_all = false;
                    this.$emit('update:storageName_all_checked', '');
                    this.$emit('update:list_all_checked', []);
                }
            } // 检查当前变更 condition1 的 condition 变更之前是否是"勾选全部"
        },
        created() {
            if (Array.isArray(this.conditions) && this.conditions.length && this.conditions[0].condition1) {
                this.backFill_addCondition(this.conditions);
            } else {
                this.addClick();
            }
        },
        watch: {
            addCondition: {
                handler(val) {
                    if (Array.isArray(val) && val.length) {
                        // 检测是否 addCondition 所有属性都不为空
                        let flag = val.every(item => item.condition1 && item.condition2 && ((item.condition3 && item.condition3.length) || item.condition3 instanceof Date || (typeof item.condition3 === 'number' && !isNaN(item.condition3))));
                        this.$emit('update:isNoEmpty', flag);
                        this.$emit('update:conditions', val);
                    } else {
                        this.$emit('update:isNoEmpty', true);
                    }
                },
                deep: true,
                immediate: true
            },
            computed_addCondition: {
                handler(val) {
                    this.$emit('update:sql_conditions', val);
                },
                deep: true,
                immediate: true
            }
        }
    };
</script>

<style scoped lang="less">
    .remove-icon {
        cursor: pointer;
        display: inline-block;
        position: absolute;
        right: -25px;
        margin-top: 8px;
    }

    .multiple-select {
        white-space: normal;

        /deep/ .ivu-tag.ivu-tag-checked {
            height: auto;
        }

        /deep/ .ivu-select-input {
            height: 30px;
            line-height: 1;
        }

        /deep/ .ivu-select-item {
            white-space: normal;
        }
    }
</style>
