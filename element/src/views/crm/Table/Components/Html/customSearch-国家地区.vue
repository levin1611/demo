<template>
    <div style="padding: 0 10px 10px 10px;max-height: 300px;">
        <!-- 检索名称 -->
        <div style="margin: 10px 0 15px">
            <div class="filter-tips">{{ $t('crm.Table.searchName') }}</div>
            <Input v-model="custom_search_name" @change="change_search_name"
                   :placeholder="$t('crm.Table.tip_customSearch')"
                   style="width: 438px"></Input>
        </div>

        <!-- 检索条件 -->
        <div class="filter-tips">{{ $t('crm.Table.searchCondition') }}</div>
        <template v-if="columnType === '12'">
            <div style="width: 100%" class="_conditionmainLimitHeight">
                <div v-for="(add, index) in addCondition" class="conditionmain" :key="index">
                    <!-- <Select v-model="add.condition1"
                            style="width:120px;margin-right:15px;float:left;"
                            size="mini"
                            filterable
                            :disabled="add.disabled"
                            @change="computed_addChangeCon1(index)">
                            wqeqwerwq
                        <OptionGroup  v-for="item in add.conditionList1" :key="item.label" :label="item.label">
                            <Option v-for="selectItem in item.conditionList1"
                                    :value="selectItem.value"
                                    :label="selectItem.label"
                                    :disabled="selectItem.value === 'eventDate'"></Option>
                        </OptionGroup>
                    </Select> -->
                    <Select v-model="add.condition1" style="width:120px;margin-right:15px;float:left;"
                            size="mini"
                            filterable
                            :disabled="add.disabled"
                            popper-class="whatsapp-select"
                            @change="computed_addChangeCon1(index)">
                        <Tabs v-model="fieldBelong" class="custom-tabs-class">
                            <TabPane label="会话" name="1">
                                <Option v-for="(item, index) in add.conditionList1.whatsappField" :value="item.value" :label="item.label"
                                        :key="`${columnType}customer${index}`">{{item.label}}
                                </Option>
                            </TabPane>
                            <TabPane label="客户" name="2">
                                <Option v-for="(item, index) in add.conditionList1.customerField" :value="item.value" :label="item.label"
                                        :key="`${columnType}customer${index}`">{{item.label}}
                                </Option>
                            </TabPane>
                            <TabPane label="询盘" name="3" style="padding-right: 20px;">
                                <Option v-for="(item2, index2) in add.conditionList1.inquiryField" :value="item2.value" :label="item2.label"
                                        :key="`${columnType}customer${index2}`">{{item2.label}}
                                </Option>
                            </TabPane>
                            <TabPane label="联系人" name="4">
                                <Option v-for="(item1, index1) in add.conditionList1.contactField" :value="item1.value" :label="item1.label"
                                        :key="`${columnType}customer${index1}`">{{item1.label}}
                                </Option>
                            </TabPane>

                        </Tabs>
                    </Select>

                    <Select v-model="add.condition2"
                            @change="computed_addChangeCon2(index)"
                            style="width:90px;margin-right:15px;float:left;"
                            size="mini"
                            :ref="add.condition1+index"
                            :disabled="add.disabled">
                        <Option v-for="item in add.conditionList2" :key="item.label" :value="item.value" :label="item.label"></Option>
                    </Select>

                    <div style="margin-bottom:10px;width: 208px;">
                        <template v-if="add.inputType === 'string'">
                            <Input v-model="add.condition3"
                                size="mini"
                                :placeholder="$t('crm.Table.tip_addKeywords')"
                                :disabled="add.disabled"
                                style="width:200px;margin-right:5px;"></Input>
                        </template>
                        <template v-else-if="add.inputType === 'number'">
                            <InputNumber :min="0" :max="['starLevel', 'cpStarLevel'].includes(add.condition1) ? 5 : Infinity" v-model="add.condition3"
                                        size="mini"
                                        :placeholder="$t('crm.Table.tip_inputNumber')"
                                        :disabled="add.disabled"
                                        style="width:200px;margin-right:5px;">
                            </InputNumber>
                        </template>
                        <template v-else-if="add.inputType === 'boolean'">
                            <Select v-model="add.condition3"
                                    :disabled="add.disabled"
                                    size="mini" style="width:200px;margin-right:5px;">
                                <template v-if="['gender', 'ctGender'].includes(add.condition1)">
                                    <Option v-for="n in 2" :value="n"
                                            :label="n === 1 ? $t('crm.Modal.male') : n === 2 ? $t('crm.Modal.female') : ''"></Option>
                                </template>
                                <template v-else>
                                    <Option v-for="n in 2" :value="n" :label="n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : ''">
        <!--                                {{ n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : '' }}-->
                                    </Option>
                                </template>
                            </Select>
                        </template>
                        <!-- 使用v-show避免日期选择框定位问题 -->
                        <span v-show="add.inputType === 'dateRange'">
                            <DatePicker v-model="add.condition3"
                                        type="daterange"
                                        :disabled="add.disabled"
                                        size="mini"
                                        placement="bottom-end"
                                        :placeholder="$t('crm.Table.tip_selectTime')"
                                        ref="dateRange"
                                        style="width: 200px;margin-right:5px;"></DatePicker>
                        </span>
                        <!-- 使用v-show避免日期选择框定位问题 -->
                        <span v-show="add.inputType === 'date'">
                            <DatePicker v-model="add.condition3"
                                        type="date"
                                        :disabled="add.disabled"
                                        size="mini"
                                        placement="bottom-end"
                                        :placeholder="$t('crm.Table.tip_selectTime')"
                                        ref="date"
                                        style="width: 200px;margin-right:5px;"></DatePicker>
                        </span>
                        <template v-if="add.inputType === 'select'">
                            <Select v-model="add.condition3" filterable
                                    size="mini"
                                    :disabled="add.disabled"
                                    class="manager-select"
                                    style="width:200px;"
                                    @change="change_con3_type_select($event, index)">
                                <Option v-if="columnType !== '12' && Array.isArray(add.conditionList3) && (storageName_all_checked === '' || add.is_selected_all)"
                                        value="全部全部AllTousAlleTodosCompleto" :label="$t('all')"></Option>
                                <Option v-for="item in add.conditionList3"
                                        :value="item.value"
                                        :label="item.label"
                                        ></Option>
                            </Select>
                        </template>
                        <template v-else-if="add.inputType === 'array'">
                            <Select v-model="add.condition3" multiple
                                    filterable
                                    size="mini"
                                    style="width:200px;"
                                    :disabled="add.disabled"
                                    class="manager-select">
                                <Option v-for="item in add.conditionList3"
                                    :value="item.value"
                                    :label="item.label"
                                ></Option>
                            </Select>
                        </template>
                        <template v-else-if="add.inputType === 'countryArea'">
                            <CountryAreaSelect :countryArea.sync="add.condition3"
                                            :disabled="add.disabled"
                                            size="mini"
                                            ref="countryArea"
                                            style="width: 200px;margin-right: 5px;"></CountryAreaSelect>
                        </template>
                    </div>

                    <!-- 右侧新增/删除按钮 -->
                    <template v-if="index === 0">
                        <span @click="addClick">
                            <!-- <Icon type="plus-circled" size="15" color="#FA8241"
                                style='cursor:pointer;display:inline-block;'></Icon> -->
                                <Icon  size="15" class="custom custom-add-circle"
                                style='cursor:pointer;display:inline-block;'></Icon>
                        </span>
                    </template>
                    <template v-else-if="!add.disabled">
                        <span @click="removeClick(index)">
                            <!-- <Icon type="minus-circled" size="15" color="#FA8241"
                                style='cursor:pointer;display:inline-block;'></Icon> -->
                                <Icon size="15" class="custom custom-reduce-circle"
                                style='cursor:pointer;display:inline-block;'></Icon>
                        </span>
                    </template>
                </div>
            </div>
        </template>
        <div v-else style="width: 100%" class="_conditionmainLimitHeight">
            <!-- 符合任意 符合全部 -->
            <!-- <div class="addConditionType" style="margin-bottom: 10px">
                <span style="margin-right:15px;">{{$t('crm.Table.customSearchTip1')}}</span>
                <Select v-model="addConditionType"
                        style="width:120px;margin-right:15px;"
                        size="mini"
                        filterable>
                    <Option value="$and" :label="$t('crm.Table.all')"></Option>
                    <Option value="$or" :label="$t('crm.Table.anyone')"></Option>
                </Select>
                <span>{{$t('crm.Table.customSearchTip2')}}</span>
            </div> -->
            <div v-for="(add, index) in addCondition" class="conditionmain" :key="index">
                <Select v-model="add.condition1"
                        style="width:120px;margin-right:15px;float:left;"
                        size="mini"
                        filterable
                        :disabled="add.disabled"
                        @change="computed_addChangeCon1(index)">
                    <Option v-for="item in add.conditionList1"
                            :value="item.value"
                            :label="item.label"
                            :disabled="item.value === 'eventDate'"></Option>
                </Select>

                <Select v-model="add.condition2"
                        @change="computed_addChangeCon2(index)"
                        style="width:90px;margin-right:15px;float:left;"
                        size="mini"
                        :disabled="add.disabled">
                    <Option v-for="item in add.conditionList2" :value="item.value" :label="item.label"></Option>
                </Select>

                <div style="width: 208px;">
                    <template v-if="add.inputType === 'string'">
                        <Input v-model="add.condition3"
                            size="mini"
                            :placeholder="$t('crm.Table.tip_addKeywords')"
                            :disabled="add.disabled"
                            style="width:200px;margin-right:5px;"></Input>
                    </template>
                    <template v-else-if="add.inputType === 'number'">
                        <InputNumber :min="0" :max="['starLevel', 'cpStarLevel'].includes(add.condition1) ? 5 : Infinity" v-model="add.condition3"
                                    size="mini"
                                    :placeholder="$t('crm.Table.tip_inputNumber')"
                                    :disabled="add.disabled"
                                    style="width:200px;margin-right:5px;">
                        </InputNumber>
                    </template>
                    <template v-else-if="add.inputType === 'null' || add.inputType === 'nnull'">
                        <Input v-model="add.condition3"
                            size="mini"
                            :disabled="add.disabled"
                            style="width:200px;margin-right:5px;display:none"></Input>
                    </template>
                    <template v-else-if="add.inputType === 'numberRange'">
                        <numberRange :condition1="add.condition1" :condition3="add.condition3" :disabled="add.disabled" v-model="add.condition3"></numberRange>
                    </template>
                    <template v-else-if="add.inputType === 'boolean'">
                        <Select v-model="add.condition3"
                                :disabled="add.disabled"
                                size="mini" style="width:200px;margin-right:5px;">
                            <template v-if="['gender', 'ctGender'].includes(add.condition1)">
                                <Option v-for="n in 2" :value="n"
                                        :label="n === 1 ? $t('crm.Modal.male') : n === 2 ? $t('crm.Modal.female') : ''"></Option>
                            </template>
                            <template v-else>
                                <Option v-for="n in 2" :value="n" :label="n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : ''">
    <!--                                {{ n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : '' }}-->
                                </Option>
                            </template>
                        </Select>
                    </template>
                    <template v-else-if="add.inputType === 'booleanSelect'">
                        <Select v-model="add.condition3"
                                :disabled="add.disabled"
                                size="mini" style="width:200px;margin-right:5px;">
                            <template v-if="['gender', 'ctGender'].includes(add.condition1)">
                                <Option v-for="n in 2" :value="n"
                                        :label="n === 1 ? $t('crm.Modal.male') : n === 2 ? $t('crm.Modal.female') : ''"></Option>
                            </template>
                            <template v-else>
                                <Option v-for="n in 2" :value="n" :label="n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : ''">
    <!--                                {{ n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : '' }}-->
                                </Option>
                            </template>
                        </Select>
                    </template>
                    <template v-else-if="add.inputType === 'booleanMultSelect'">
                        <Select v-model="add.condition3"
                                :disabled="add.disabled"
                                multiple
                                size="mini" style="width:200px;margin-right:5px;">
                            <template v-if="['gender', 'ctGender'].includes(add.condition1)">
                                <Option v-for="n in 2" :value="n"
                                        :label="n === 1 ? $t('crm.Modal.male') : n === 2 ? $t('crm.Modal.female') : ''"></Option>
                            </template>
                            <template v-else>
                                <Option v-for="n in 2" :value="n" :label="n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : ''">
    <!--                                {{ n === 1 ? $t('crm.Table.con_is') : n === 2 ? $t('crm.Table.con_not') : '' }}-->
                                </Option>
                            </template>
                        </Select>
                    </template>
                    <!-- 使用v-show避免日期选择框定位问题 -->
                    <span v-show="add.inputType === 'dateRange'">
                        <DatePicker v-model="add.condition3"
                                    type="daterange"
                                    :disabled="add.disabled"
                                    size="mini"
                                    placement="bottom-end"
                                    :placeholder="$t('crm.Table.tip_selectTime')"
                                    ref="dateRange"
                                    style="width: 200px;margin-right:5px;"></DatePicker>
                    </span>
                    <!-- 使用v-show避免日期选择框定位问题 -->
                    <span v-show="add.inputType === 'date'">
                        <DatePicker v-model="add.condition3"
                                    type="date"
                                    :disabled="add.disabled"
                                    size="mini"
                                    placement="bottom-end"
                                    :placeholder="$t('crm.Table.tip_selectTime')"
                                    ref="date"
                                    style="width: 200px;margin-right:5px;"></DatePicker>
                    </span>
                    <template v-if="add.inputType === 'select'">
                        <Select v-model="add.condition3" filterable
                                size="mini"
                                :disabled="add.disabled"
                                class="manager-select"
                                style="width:200px;"
                                @change="change_con3_type_select($event, index)">
                            <Option v-if="Array.isArray(add.conditionList3) && (storageName_all_checked === '' || add.is_selected_all)"
                                    value="全部全部AllTousAlleTodosCompleto" :label="$t('all')"></Option>
                            <Option v-for="item in add.conditionList3"
                                    :value="item.value"
                                    :label="item.label"
                                    ></Option>
                        </Select>
                    </template>
                    <template v-else-if="add.inputType === 'array'">
                        <Select v-model="add.condition3" multiple
                                filterable
                                size="mini"
                                style="width:200px;"
                                :disabled="add.disabled"
                                class="manager-select">
                            <Option v-for="item in add.conditionList3"
                                :value="item.value"
                                :label="item.label"
                            ></Option>
                        </Select>
                    </template>
                    <template v-else-if="add.inputType === 'countryArea'">
                        <topFilterCountrySelect :country.sync="add.condition3"
                            :multiple="['$in', '$nin'].includes(add.condition2)"
                            @updateCountry="selectCountry(arguments, index)"
                            size="mini"
                            ref="topFilterCountrySelect"
                            style="width: 200px;margin-right: 5px;"></topFilterCountrySelect>
                    </template>
                </div>

                <!-- 右侧新增/删除按钮 -->
                <template v-if="index === 0">
                    <span @click="addClick">
                        <!-- <Icon type="plus-circled" size="15" color="#FA8241"
                            style='cursor:pointer;display:inline-block;'></Icon> -->
                            <Icon  size="15" class="custom custom-add-circle"
                            style='cursor:pointer;display:inline-block;'></Icon>
                    </span>
                </template>
                <template v-else-if="!add.disabled">
                    <span @click="removeClick(index)">
                        <!-- <Icon type="minus-circled" size="15" color="#FA8241"
                            style='cursor:pointer;display:inline-block;'></Icon> -->
                            <Icon size="15" class="custom custom-reduce-circle"
                            style='cursor:pointer;display:inline-block;'></Icon>
                    </span>
                </template>
            </div>
        </div>

        <!-- 底部按钮 -->
        <div class="searchBtnGroup" style="display: inline-block;">
            <Button size="mini" @click="empty">{{ $t('crm.Table.clear') }}</Button>
            <Button type="primary" size="mini" @click="saveSearch"
                    :class="`piwik_save_commonSearch_${columnType}`">{{ $t('crm.Table.saveSearch') }}</Button>
            <template v-if="storageName_all_checked">
                <Tooltip :content="$t('crm.Html.tip_cannot_filter_when_check_all')">
                    <Button type="primary" size="mini" disabled>{{ $t('crm.Table.search') }}
                    </Button>
                </Tooltip>
            </template>
            <template v-else>
                <Button type="primary" size="mini" :class="class_customsearch" @click="searchData">{{ $t('crm.Table.search') }}
                </Button>
            </template>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import { HANDLE_BUTTON } from '@/api/config';
    import { env } from '@/../build/config';
    import numberRange from './numberRange';
    import topFilterCountrySelect from '@/views/crm/Table/Components/Html/topFilterCountrySelect';

    export default {
        name: 'customSearch',
        props: [
            /* topFilter 相关 */
            'type_search', // 当前筛选面板类型, 和 flag 一起触发筛选
            'topVisible', // 外部 topFilter 是否已关闭
            'list_commonSearch', // 当前常用检索列表
            'id_selected_commonSearch', // 正在筛选的常用检索的 ID
            /** whatsapp筛选相关 */
            'KeepFilter', // 保持筛选状态
            'backAddCondition', // whatsapp筛选后,要保留上一次的筛选条件

            /* 表格页相关 */
            'flag_topFilter', // flag , 表格页触发筛选
            'columnType', // 表格页类型 1客户2联系人3询盘4公海客户5线索6公海线索7fbleads8权限部门用户管理9功能权限管理10访客历史11网站留言12whatsapp
            'filtering', // 表格页"筛选类型"变量, 在合并顶部筛选条件和表头筛选条件时用
            'custom_conditions', // 表格页"自定义检索数据对象"变量, 合并时用
            'conditionList1', // 表格页, 第一栏下拉选项
            'conditionList2', // 表格页, 第二栏下拉选项
            'getSearchCon', // 表格页, 根据 storageName 获取 sql 字符串
            'addChangeCon1', // 表格页, 第一项 Select 的 on-change
            'addChangeCon2', // 表格页, 第二项 Select 的 on-change
            'allUsers', // 表格页, 所有用户
            'allColumns', // 表格页, 所有表格列
            'config_tableFilter', // 表格页, 所有表格列
            'selectOptions', // 表格页, 所有下拉选项
            'sql_manager', // 当前表格页"负责人"对应的 sql 条件(其实不一定是 sql 条件, 准确来说是 getSearchCon 里"负责人"对应的字符串), 用来在回填筛选条件时替换负责人筛选的 $regex (因为负责人是单独处理的, 不管 condition2 选的啥, 负责人都返回 $regex , 所以回填时要对它单独处理)
            'allUsersList', // 所有用户
            /* 自定义检索 */
            'newId', // 新增常用检索的 id
            'parentSearchData', // 要创建子级检索的常用检索数据
            'editSearchData' // 要编辑的检索数据
        ],
        components: {
            numberRange,
            topFilterCountrySelect
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                clue_btn_list: state => state.clue.clue_btn_list,
                button_list: state => state.app.button_list
            }), // 从 vuex 中获取属性
            computed_addCondition() {
                return this.addCondition.filter(item => item.condition1 && item.condition2 && ((item.condition3 && item.condition3.length) || item.condition3 instanceof Date || (typeof item.condition3 === 'number' && !isNaN(item.condition3)))).map(item => {
                    const temp = {};
                    const con = this.getSearchCon(item.condition1);
                    // let type = this.getSearchType(item.condition2);
                    const type = item.condition2;
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
                            temp[con][type === '$ne' ? '$nregex' : '$regex'] = item.condition3.replace('unknown', '');
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
                                temp.$and = [];

                                const start = {};
                                start[con] = {};
                                start[con].$gte = this.$options.filters.timeFormat(item.condition3[0]);
                                temp.$and.push(start);

                                const end = {};
                                end[con] = {};
                                end[con].$lte = `${this.$options.filters.timeFormat(item.condition3[1])} 23:59:59.999`;
                                temp.$and.push(end);
                                return temp;
                            }
                            break;
                        case 'array':
                            if (con === this.sql_manager) {
                                temp[con] = {};
                                temp[con].$regex = item.condition3;
                            } else {
                                if (['$andregex', '$andnregex'].includes(type)) {
                                    temp.$and = item.condition3.map(val => {
                                        const temp = {};
                                        temp[con] = {};
                                        if (type === '$andregex') {
                                            temp[con].$regex = val;
                                        } else {
                                            temp[con].$nregex = val;
                                        }
                                        return temp;
                                    });
                                } else {
                                    temp.$or = item.condition3.map(val => {
                                        const temp = {};
                                        temp[con] = {};
                                        temp[con][type] = val;
                                        return temp;
                                    });
                                }
                            }
                            return temp;
                    }
                }).filter(item => !(!item || item === ''));
            },
            computed_addChangeCon1() {
                return (...params) => {
                    this.check_changed_all_checked(params); // 检查改变之前是否是勾选"全部"
                    this.addChangeCon1.apply(this, params);
                };
            },
            computed_addChangeCon2() {
                return this.addChangeCon2.bind(this);
            },
            class_customsearch() {
                switch (`${this.columnType}`) {
                    case '1':
                        return 'customer-customsearch';
                    case '2':
                        return 'contact-customsearch';
                    case '3':
                        return 'inquiry-customsearch';
                    case '4':
                        return 'highseasCustomer-customsearch';
                    default:
                        return '';
                }
            },
            myCharge() {
                return !HANDLE_BUTTON(this.clue_btn_list[0].myCharge[env], this.button_list);
            },
            myCreate() {
                return !HANDLE_BUTTON(this.clue_btn_list[0].myCreate[env], this.button_list);
            },
            myChargeTran() {
                return !HANDLE_BUTTON(this.clue_btn_list[0].myChargeTran[env], this.button_list);
            },
            myCreateTran() {
                return !HANDLE_BUTTON(this.clue_btn_list[0].myCreateTran[env], this.button_list);
            }
        },
        data() {
            return {
                fieldBelong: '1', // 当前显示的 Tab
                addConditionType: '$and',
                custom_search_name: '', // 自定义检索名称
                parent_search_name: '', // 父级检索名称
                edit_search_name: '', // 编辑常用检索时备份的检索名称
                is_search_name_changed: false, // 自定义检索名称是否手动改过

                addCondition: [], // 检索条件集合

                id_parent_search: 0, // 子级常用检索的父 Id
                id_edit_search: '', // 被编辑的常用检索的 Id

                // 勾选全部
                list_all_checked: [], // 勾选全部时的全部选项,
                storageName_all_checked: '' // 勾选全部时的 storageName
            };
        },
        methods: {
            selectCountry(arg, index) {
                console.error(arg[0]);
                this.addCondition[index].condition3 = arg[0];
            },
            change_search_name() {
                if (!this.is_search_name_changed) {
                    this.is_search_name_changed = true;
                }
            }, // 判断"勾选全部"时是否改动过检索名称
            searchData() {
                // 检测是否 addCondition 所有属性都不为空
                const flag = this.addCondition.every(item => item.condition1 && item.condition2 && ((item.condition3 && item.condition3.length) || item.condition3 instanceof Date || (typeof item.condition3 === 'number' && !isNaN(item.condition3))));

                // 可筛选
                if (flag) {
                    const status = [];
                    if (this.myCharge) {
                        status.push(2);
                    }
                    if (this.myCreate) {
                        status.push(5);
                    }
                    if (this.myChargeTran) {
                        status.push(4);
                    }
                    if (this.myCreateTran) {
                        status.push(6);
                    }
                    this.$emit('update:filtering', 'search');
                    this.$emit('change_title', this.$t('crm.Table.tip_customSearch'));
                    this.$emit('update:custom_conditions', this.addCondition);
                    this.$emit('update:id_selected_commonSearch', null, 'all');
                    this.$emit('update:KeepFilter', true);
                    this.$listeners.refreshData('all', status.join(','));
                    this.$emit('toggle_popper');
                } else {
                    this.$Message.info(this.$t('crm.Table.info_searchEmptyConditions'));
                }
            }, // 检索
            calc_saved_addCondition(addCondition) {
                return addCondition.filter(item => item.condition1 && item.condition2 && ((item.condition3 && item.condition3.length) || item.condition3 instanceof Date || (typeof item.condition3 === 'number' && !isNaN(item.condition3)))).filter(item => !item.isInherit).map(item => {
                    const temp = {};
                    const con = this.getSearchCon(item.condition1);
                    // let type = this.getSearchType(item.condition2);
                    const type = item.condition2;
                    switch (item.inputType) {
                        case 'string':
                        case 'number':
                        case 'boolean':
                        case 'booleanSelect':
                        case 'null':
                        case 'nnull':
                        case 'select':
                            temp[con] = {};
                            temp[con][type] = item.condition3;
                            return temp;
                        case 'countryArea':
                            temp[con] = {};
                            temp[con][type === '$ne' ? '$nregex' : '$regex'] = item.condition3.replace('unknown', '');
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
                                temp.$and = [];

                                const start = {};
                                start[con] = {};
                                start[con].$gte = this.$options.filters.timeFormat(item.condition3[0]);
                                temp.$and.push(start);

                                const end = {};
                                end[con] = {};
                                end[con].$lte = `${this.$options.filters.timeFormat(item.condition3[1])} 23:59:59.999`;
                                temp.$and.push(end);
                                return temp;
                            }
                            break;
                        case 'numberRange':
                            if (item.condition3[0] && item.condition3[1]) {
                                temp.$and = [];

                                const start = {};
                                start[con] = {};
                                start[con].$gte = item.condition3[0];
                                temp.$and.push(start);

                                const end = {};
                                end[con] = {};
                                end[con].$lte = item.condition3[1];
                                temp.$and.push(end);

                                return temp;
                            }
                            break;
                        case 'booleanMultSelect':
                        case 'array':
                            if (con === this.sql_manager) {
                                temp[con] = {};
                                temp[con].$regex = item.condition3;
                            } else {
                                if (['$andregex', '$andnregex'].includes(type)) {
                                    temp.$and = item.condition3.map(val => {
                                        const temp = {};
                                        temp[con] = {};
                                        if (type === '$andregex') {
                                            temp[con].$regex = val;
                                        } else {
                                            temp[con].$nregex = val;
                                        }
                                        return temp;
                                    });
                                } else {
                                    temp.$or = item.condition3.map(val => {
                                        const temp = {};
                                        temp[con] = {};
                                        temp[con][type] = val;
                                        return temp;
                                    });
                                }
                            }
                            return temp;
                    }
                }).filter(item => !(!item || item === ''));
            }, // addCondition 去掉继承的检索条件, 保存时使用这个, 即只保存自身的检索条件
            saveSearch() {
                // 检索名称不能为空
                if (!this.custom_search_name.length) {
                    this.$Message.info(this.$t('crm.Table.error_emptySearchName'));
                    return undefined;
                } else if (this.custom_search_name.length > 50) {
                    this.$Message.info(this.$t('crm.Table.error_searchNameLength'));
                    return undefined;
                } else if (!this.storageName_all_checked && this.list_commonSearch.find(item => item.searchName === this.custom_search_name && `${this.id_edit_search}` !== `${item.id}`)) {
                    this.$Message.info(this.$t('crm.Table.error_sameCommonSearchName'));
                    return undefined;
                }

                // 检测是否 addCondition 所有属性都不为空
                const flag = this.addCondition.every(item => item.condition1 && item.condition2 && ((item.condition3 && item.condition3.length) || item.condition3 instanceof Date || (typeof item.condition3 === 'number' && !isNaN(item.condition3))));
                // 都不为空则可保存
                if (flag) {
                    const saved_addCondition = this.calc_saved_addCondition(this.addCondition);
                    if (saved_addCondition.length) {
                        // 是否勾选'全部', 需要分开处理发送请求
                        if (this.storageName_all_checked) {
                            this.saveSearch_batch();
                        } else {
                            const send_obj = {
                                orgId: this.enterpriseId,
                                type: this.columnType,
                                userId: this.userId,
                                searchContent: JSON.stringify(saved_addCondition),
                                searchName: this.custom_search_name
                            };
                            if (this.id_edit_search) {
                                send_obj.id = this.id_edit_search;
                            } else {
                                send_obj.parentId = this.id_parent_search;
                            }
                            let url = null;
                            let ajaxType = null;
                            if (this.columnType === '12') {
                                ajaxType = 'ajaxWAJson';
                                if (send_obj.id) {
                                    url = '/minor/commonSearch/updateCommonSearch';
                                } else {
                                    url = '/minor/commonSearch/saveCommonSearch';
                                }
                            } else {
                                ajaxType = 'ajaxJson';
                                if (send_obj.id) {
                                    url = '/crm/commonSearch/updateCommonSearch';
                                } else {
                                    url = '/crm/commonSearch/saveCommonSearch';
                                }
                            }
                            util[ajaxType]({
                                url,
                                method: 'post',
                                data: send_obj
                            }).then(res => {
                                if (res.data.code === '1') {
                                    this.$emit('change_search_type', 'searchCommon');
                                    this.$emit('update:newId', res.data.data);
                                    this.$Message.success(this.$t('crm.Table.success_save'));
                                    this.empty();
                                } else {
                                    this.$Message.error(this.$t('crm.Table.error_save'));
                                }
                            }); // 正常保存
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_reSearchTip'));
                    } // 否则，如果检索条件 List 不为空，则存入 localstorage ，不然报错
                } else {
                    this.$Message.info(this.$t('crm.Table.info_saveEmptyConditions'));
                }
            },
            saveSearch_batch() {
                let arr_send_obj = []; // 批量生成的 send_obj

                // 定位'全部'筛选条件在 addCondition 中的位置
                let index_con = -1;
                index_con = this.addCondition.findIndex(con => this.storageName_all_checked === con.condition1 && con.is_selected_all);
                // 定位到后继续
                if (index_con !== -1) {
                    // 制造生成 send_obj 的模板
                    const template_send_obj = {
                        orgId: this.enterpriseId,
                        type: this.columnType,
                        userId: this.userId,
                        searchContent: ''
                    };

                    // 批量生成 send_obj
                    let id_edit_search = this.id_edit_search;
                    this.list_all_checked.forEach((option, index) => {
                        // 把'全部'替换为选项
                        const conditionList = this.$deepClone(this.addCondition);
                        conditionList[index_con].condition3 = option.value;

                        // 拼合 sql 语句
                        const searchContent = this.calc_saved_addCondition(conditionList);

                        // 拼合检索名称
                        let searchName = '';
                        if (this.is_search_name_changed) {
                            searchName = `${this.custom_search_name}-${index + 1}`;
                        } else {
                            const prev_con = this.conditionList1.find(item => item.value === this.storageName_all_checked) || '';
                            const prev_str = `${prev_con.label}(${this.$t('all')})`;

                            if (prev_con && prev_con.label && this.custom_search_name.endsWith(prev_str)) {
                                searchName = this.custom_search_name.slice(0, -prev_str.length) + option.label;
                            } else {
                                searchName = this.custom_search_name.split('-');
                                searchName.pop();
                                searchName.push(option.label);
                                searchName = searchName.join('-');
                            }
                        }

                        // 存入保存通用数据
                        const send_obj = Object.assign({}, template_send_obj, {
                            searchContent: JSON.stringify(searchContent),
                            searchName
                        });

                        // 判断当前保存类型: 编辑 or 新建
                        if (id_edit_search) {
                            send_obj.id = id_edit_search;
                            id_edit_search = '';
                        } else {
                            send_obj.parentId = this.id_parent_search;
                        }

                        // 放入待发送队列
                        arr_send_obj.push(send_obj);
                    });
                    this.id_parent_search = 0;

                    // 去除名称重复的筛选条件
                    const temp_length = arr_send_obj.length;
                    const existed_searchName = [];
                    arr_send_obj = arr_send_obj.filter(sendObj => {
                        const temp = this.list_commonSearch.find(item => item.searchName === sendObj.searchName && (`${sendObj.id}` !== `${item.id}`));
                        if (temp) {
                            existed_searchName.push(sendObj.searchName);
                        }
                        return !temp;
                    });

                    // 名称去重后视情况弹出提示和决定是否保存
                    if (!arr_send_obj.length) {
                        if (temp_length) {
                            this.$Message.error({
                                message: this.$t('crm.Html.error_save_existed_search'),
                                duration: 10000,
                                closable: true
                            });
                        } else {
                            this.$Message.error(this.$t('crm.Table.error_save'));
                        }
                    } else {
                        if (existed_searchName.length) {
                            this.$Message.warning({
                                message: existed_searchName.join(', ') + this.$t('crm.Html.cannot_save_existed'),
                                duration: 10000,
                                closable: true
                            });
                        }

                        // console.log(arr_send_obj);

                        // 发送请求
                        util.axios.all(arr_send_obj.map(send_obj => {
                            let url = null;
                            let ajaxType = null;
                            if (this.columnType === '12') {
                                ajaxType = 'ajaxWAJson';
                                if (send_obj.id) {
                                    url = '/minor/commonSearch/updateCommonSearch';
                                } else {
                                    url = '/minor/commonSearch/saveCommonSearch';
                                }
                            } else {
                                ajaxType = 'ajaxJson';
                                if (send_obj.id) {
                                    url = '/crm/commonSearch/updateCommonSearch';
                                } else {
                                    url = '/crm/commonSearch/saveCommonSearch';
                                }
                            }
                            return util[ajaxType]({
                                url,
                                method: 'post',
                                data: send_obj
                            });
                        })).then(util.axios.spread((...responses) => {
                            if (responses.every(item => item.data.code !== '1')) {
                                this.$Message.error(this.$t('crm.Table.error_save'));
                            } else {
                                this.$emit('change_search_type', 'searchCommon');
                                this.$emit('update:newId', responses.find(item => item.data.code === '1').data.data);
                                this.empty();
                                if (responses.every(item => item.data.code === '1')) {
                                    this.$Message.success(this.$t('crm.Table.success_save'));
                                } else {
                                    this.$Message.info(this.$t('crm.Table.info_save_partially'));
                                }
                            }
                        }));
                    }
                } else {
                    console.error(index_con);
                    console.error('勾选全部出现错误');
                    this.$Message.error(this.$t('crm.Table.error_save'));
                }
            }, // 保存检索-'全部'
            // 添加检索条件
            addClick() {
                this.addCondition.push({
                    condition1: '',
                    conditionList1: this.$deepClone(this.conditionList1),
                    condition2: '',
                    conditionList2: this.$deepClone(this.conditionList2),
                    condition3: '',
                    inputType: 'string'
                });
            },
            // 删除检索条件
            removeClick(index) {
                const temp = this.addCondition.splice(index, 1);
                if (temp[0] && temp[0].is_selected_all) {
                    this.storageName_all_checked = '';
                    this.list_all_checked = [];
                }
            },
            // 清空检索条件(不包括表头筛选条件)
            empty() {
                this.custom_search_name = '';
                // 清空父级检索名称
                this.parent_search_name = '';
                this.edit_search_name = '';
                this.is_search_name_changed = false;
                this.list_all_checked = [];
                this.storageName_all_checked = '';
                this.id_parent_search = 0;
                this.id_edit_search = '';
                this.addCondition = [
                    {
                        condition1: '',
                        conditionList1: this.$deepClone(this.conditionList1),
                        condition2: '',
                        conditionList2: this.$deepClone(this.conditionList2),
                        condition3: '',
                        inputType: 'string'
                    }
                ];
                this.$emit('update:custom_conditions', this.addCondition);
                this.$emit('update:backAddCondition', []);
                this.$emit('update:KeepFilter', false);
            },

            // 回填数据
            backFill_searchData(data, isInherit = false) {
                data.forEach(item => {
                    this.addClick(); // 添加 addCondition 项
                    const index = this.addCondition.length - 1;

                    let con1 = '';

                    if (item.hasOwnProperty('$and')) {
                        const arr = item.$and; // 获取条件数组
                        if (arr.length) {
                            if (this.columnType === '12') {
                                const conditionList1Back = Object.values(this.conditionList1).filter((x) => Array.isArray(x)).flat();
                                conditionList1Back.some(con => {
                                    if (arr[0].hasOwnProperty(this.getSearchCon(con.value))) {
                                        con1 = con.value;
                                        return true;
                                    }
                                }); // 获取 condition1
                            } else {
                                this.conditionList1.some(con => {
                                    if (arr[0].hasOwnProperty(this.getSearchCon(con.value))) {
                                        con1 = con.value;
                                        return true;
                                    }
                                }); // 获取 condition1
                            }

                            if (con1) {
                                // 有对应的筛选条件, 回填数据
                                this.addCondition[index].disabled = isInherit;
                                this.addCondition[index].isInherit = isInherit;

                                this.addCondition[index].condition1 = con1;
                                this.addChangeCon1(index);
                                this.$nextTick(() => {
                                    if (this.columnType === '12') {
                                        this.addCondition[index].condition2 = 'dateRange';
                                    } else {
                                        this.addCondition[index].condition2 = '$range';
                                    }
                                    this.addChangeCon2(index);
                                    this.$nextTick(() => {
                                        if(this.addCondition[index].inputType === 'numberRange') {
                                            const number = arr.map(con => Object.values(Object.values(con)[0])[0]).sort();
                                            this.addCondition[index].condition3 = number;
                                        } else {
                                            const dates = arr.map(con => Date.parse(Object.values(Object.values(con)[0])[0])).sort();
                                            this.addCondition[index].condition3 = [new Date(dates[0]), new Date(dates[1])];
                                        }
                                        
                                    });
                                });
                            } else {
                                // 没有对应的筛选条件, 筛选条件数组去除当前这条数据
                                this.addCondition.splice(index, 1);
                            }
                        }
                        return;
                    } // dateRange 型
                    if (item.hasOwnProperty('$or')) {
                        const arr = item.$or; // 获取条件数组
                        if (arr.length) {
                            if (this.columnType === '12') {
                                const conditionList1Back = Object.values(this.conditionList1).filter((x) => Array.isArray(x)).flat();
                                conditionList1Back.some(con => {
                                    if (arr[0].hasOwnProperty(this.getSearchCon(con.value))) {
                                        con1 = con.value;
                                        return true;
                                    }
                                }); // 获取 condition1
                            } else {
                                this.conditionList1.some(con => {
                                    if (arr[0].hasOwnProperty(this.getSearchCon(con.value))) {
                                        con1 = con.value;
                                        return true;
                                    }
                                }); // 获取 condition1
                            }

                            if (con1) {
                                // 有对应的筛选条件, 回填数据
                                this.addCondition[index].disabled = isInherit;
                                this.addCondition[index].isInherit = isInherit;

                                const valObj = Object.values(arr[0])[0];

                                this.addCondition[index].condition1 = con1;
                                this.addChangeCon1(index);
                                this.$nextTick(() => {
                                    this.addCondition[index].condition2 = Object.keys(valObj)[0];
                                    this.addChangeCon2(index);
                                    this.$nextTick(() => {
                                        this.addCondition[index].condition3 = arr.map(con => Object.values(Object.values(con)[0])[0]);
                                    });
                                });
                            } else {
                                // 没有对应的筛选条件, 筛选条件数组去除当前这条数据
                                this.addCondition.splice(index, 1);
                            }
                        }
                        return;
                    } // 多选型

                    // else 型
                    if (this.columnType === '12') {
                        const conditionList1Back = Object.values(this.conditionList1).filter((x) => Array.isArray(x)).flat();
                        conditionList1Back.some(con => {
                            if (item.hasOwnProperty(this.getSearchCon(con.value))) {
                                con1 = con.value;
                                return true;
                            }
                        }); // 获取 condition1
                    } else {
                        this.conditionList1.some(con => {
                            if (item.hasOwnProperty(this.getSearchCon(con.value))) {
                                con1 = con.value;
                                return true;
                            }
                        }); // 获取 condition1
                    }

                    if (con1) {
                        // 有对应的筛选条件, 回填数据
                        this.addCondition[index].disabled = isInherit;
                        this.addCondition[index].isInherit = isInherit;

                        const valObj = Object.values(item)[0];

                        this.addCondition[index].condition1 = con1;
                        this.addChangeCon1(index);
                        this.$nextTick(() => {
                            let temp_con2 = con1 === this.sql_manager ? '$eq' : Object.keys(valObj)[0];
                            if (['countryArea', 'cpCountryArea'].includes(con1)) {
                                temp_con2 = (['$nregex', '$ne'].includes(temp_con2)) ? '$ne' : '$eq';
                            }
                            this.addCondition[index].condition2 = temp_con2;
                            this.addChangeCon2(index);
                            this.$nextTick(() => {
                                this.addCondition[index].condition3 = Object.values(valObj)[0];
                            });
                        });
                    } else {
                        // 没有对应的筛选条件, 筛选条件数组去除当前这条数据
                        this.addCondition.splice(index, 1);
                    } // 逐级回传
                }); // 逐项回填
            },
            backFill_searchData_recursively(searchData, type) {
                // 获取所有父级筛选数据
                const parents = [this.$deepClone(searchData)];
                while (`${searchData.parentId}` !== '0') {
                    const grandPa = this.list_commonSearch.find(item => `${item.id}` === `${searchData.parentId}`);
                    if (grandPa) {
                        parents.unshift(this.$deepClone(grandPa));
                        searchData = grandPa;
                    } else {
                        this.$Message.error(this.$t('crm.Html.errorOccurred'));
                        return '上溯父级结点出错';
                    }
                }

                // 回填 addCondition
                this.addCondition = [];
                if (type === 'add') {
                    parents.forEach(data => this.backFill_searchData(data.searchContent, true));

                    this.$nextTick(() => {
                        this.addCondition = this.addCondition.map(item => item.condition1 ? item : undefined).filter(item => item);
                        this.addClick();
                    });
                } else if (type === 'edit') {
                    parents.forEach((data, index) => this.backFill_searchData(data.searchContent, index !== parents.length - 1));

                    this.$nextTick(() => {
                        this.addCondition = this.addCondition.map(item => item.condition1 ? item : undefined).filter(item => item);

                        // 检查 addCondition 是否为空(全部回填失败), 为空则显示一项筛选条件
                        if (this.addCondition.length === 0) {
                            this.addClick();
                        }
                    });
                }
            },

            /* 勾选全部 */
            change_con3_type_select(val, index) {
                const add = this.addCondition[index];
                if (add) {
                    if (val === '全部全部AllTousAlleTodosCompleto') {
                        add.is_selected_all = true;
                        this.storageName_all_checked = add.condition1;
                        this.list_all_checked = add.conditionList3;
                    } else if (add.is_selected_all) {
                        add.is_selected_all = false;
                        this.storageName_all_checked = '';
                        this.list_all_checked = [];
                    }
                }
            }, // 检查是否勾选全部
            check_changed_all_checked(index) {
                if (this.addCondition[index] && this.addCondition[index].is_selected_all) {
                    this.addCondition[index].is_selected_all = false;
                    this.storageName_all_checked = '';
                    this.list_all_checked = [];
                }
            } // 检查当前变更 condition1 的 condition 变更之前是否是"勾选全部"
        },
        activated() {
            if (!this.addCondition.length) {
                this.addClick();
            }
            // whatsapp高级筛选并且是非编辑状态下
            if (this.columnType === '12' && !this.editSearchData) {
                if (this.backAddCondition.length) {
                    this.addCondition = this.backAddCondition;
                } else if (!this.backAddCondition.length) {
                    this.addCondition = [
                        {
                            condition1: '',
                            conditionList1: this.$deepClone(this.conditionList1),
                            condition2: '',
                            conditionList2: this.$deepClone(this.conditionList2),
                            condition3: '',
                            inputType: 'string'
                        }
                    ];
                }
            }
        },
        watch: {
            flag_topFilter() {
                if (!this.filtering && this.type_search === 'customSearch') {
                    if (Array.isArray(this.custom_conditions) && this.custom_conditions.length) {
                        this.addCondition = this.$deepClone(this.custom_conditions);
                        this.$nextTick(() => {
                            this.searchData();

                            if (this.computed_addCondition.length) {
                                const temp = this.$deepClone(this.computed_addCondition);
                                this.addCondition = []; // 清空
                                this.backFill_searchData(temp);
                            } else {
                                this.empty();
                            }
                        });
                    } else {
                        this.empty();
                        this.$listeners.refreshData();
                    }
                }
            }, // 表格页要求检索且指定了检索类型为"自定义检索"后, 进行检索
            parentSearchData: {
                handler(val) {
                    if (val) {
                        this.id_parent_search = val.id;
                        this.id_edit_search = '';
                        this.is_search_name_changed = false;
                        this.custom_search_name = `${val.searchName}-`;
                        this.parent_search_name = val.searchName;
                        this.edit_search_name = '';
                        this.list_all_checked = [];
                        this.storageName_all_checked = '';
                        this.backFill_searchData_recursively(val, 'add');
                        this.$nextTick(() => {
                            this.$emit('update:parentSearchData', null);
                        });
                    }
                },
                immediate: true,
                deep: true
            },
            editSearchData: {
                handler(val) {
                    if (val) {
                        console.log('editSearchData', val)
                        this.id_parent_search = val.parentId;
                        this.id_edit_search = val.id;
                        this.is_search_name_changed = false;
                        this.custom_search_name = val.searchName;
                        // 赋值父级检索名称
                        this.parent_search_name = val.searchName;
                        this.edit_search_name = val.searchName;
                        this.list_all_checked = [];
                        this.storageName_all_checked = '';
                        this.backFill_searchData_recursively(val, 'edit');
                        this.$nextTick(() => {
                            this.$emit('update:editSearchData', null);
                        });
                    }
                },
                immediate: true,
                deep: true
            },
            storageName_all_checked: {
                handler(val, oldVal) {
                    if (!this.is_search_name_changed) {
                        if (val) {
                            const con = this.conditionList1.find(item => item.value === val);
                            const prev_con = oldVal ? this.conditionList1.find(item => item.value === oldVal) : '';
                            if (con) {
                                const str = `${con.label}(${this.$t('all')})`;
                                const prev_str = `${prev_con.label}(${this.$t('all')})`;
                                let temp_search_name = this.custom_search_name;

                                if (prev_con && prev_con.label && temp_search_name.endsWith(prev_str)) {
                                    const prev_str = `${prev_con.label}(${this.$t('all')})`;
                                    temp_search_name = temp_search_name.slice(0, -prev_str.length) + str;
                                } else {
                                    if (this.id_edit_search) {
                                        temp_search_name = `${temp_search_name}-`;
                                    }
                                    const temp = temp_search_name.split('-');
                                    temp.pop();
                                    temp.push(str);
                                    this.custom_search_name = temp.join('-');
                                }
                            }
                        } else {
                            if (oldVal) {
                                const prev_con = this.conditionList1.find(item => item.value === oldVal) || '';
                                const prev_str = `${prev_con.label}(${this.$t('all')})`;

                                if (prev_con && prev_con.label && this.custom_search_name.endsWith(prev_str)) {
                                    this.custom_search_name = this.custom_search_name.slice(0, -prev_str.length);
                                } else {
                                    this.custom_search_name = this.custom_search_name.split('-').slice(0, -1).join('-');
                                }
                            }
                        }
                    }
                }
            }, // 在"勾选全部"的筛选项变动后, 视情况生成默认检索名称
            addCondition: {
                handler(val) {
                    this.$nextTick(() => {
                        if (!this.storageName_all_checked && !this.is_search_name_changed) {
                            const temp = val.find(item => !item.isInherit && item.inputType === 'select' && ((item.condition3 && item.condition3.length) || (typeof item.condition3 === 'number' && !isNaN(item.condition3))));
                            if (temp) {
                                const option = Array.isArray(temp.conditionList3) && temp.conditionList3.find(item => `${item.value}` === `${temp.condition3}`);
                                if (option) {
                                    if (!this.edit_search_name) {
                                        const str = option.label || '';
                                        this.custom_search_name = this.parent_search_name ? [this.parent_search_name, str].join('-') : str;
                                    }
                                }
                            } else {
                                this.custom_search_name = this.parent_search_name || '';
                            }
                        }
                    });
                },
                deep: true
            },
            topVisible: {
                handler(val) {
                    if (!val) {
                        // 关闭 countryArea 浮层
                        if (this.$refs.countryArea) {
                            this.$refs.countryArea.forEach(item => item.doClose());
                        }
                        // 关闭 date 和 dateRange 型的 datepicker 浮层
                        if (this.$refs.date) {
                            this.$refs.date.forEach(item => item.handleClose());
                        }
                        if (this.$refs.dateRange) {
                            this.$refs.dateRange.forEach(item => item.handleClose());
                        }
                    }
                }
            }
        }
    };
</script>
<style lang="less">
    .custom-tabs-class {
        .el-tabs__nav {
            .el-tabs__item{
                padding-right: 20px !important;
                padding-left: 20px !important;
            }
        }
    }
    .whatsapp-select {
        .el-scrollbar {
            // max-height: 40vh;
            .el-select-dropdown__wrap {
                max-height: 40vh;
                .el-tabs__content {
                    max-height: calc(40vh - 80px);
                    overflow-y: scroll;
                }
            }
        }
    }
    .conditionmain {
        margin-bottom: 10px;
        &:after{
            content: ' ';
            display: table;
            clear: left;
        }
    }
</style>
<style scoped lang="less">
    /deep/ .el-tabs__nav-wrap::after {
        height: 1px !important;
    }
    .custom-tabs-class {
        /deep/ .el-tabs__active-bar {
            display: none !important;
        }
    }
</style>
