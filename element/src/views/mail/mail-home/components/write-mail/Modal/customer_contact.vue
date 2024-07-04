<template>
    <div class="contacts_content_conatiner">
        <Form label-width="128px" class="customer-contact">
            <Row :gutter="40" style="margin: 0;">
                <!-- start 当前筛选字段所属模块 -->
                <Col :span="24" style="padding:0;">
                    <FormItem :label="$t('mail.writeLetter.addContactModal.currentFilterFieldBelongs')">
                        <Select v-model="filterFieldsModule"
                                size="small"
                                @change="filterFieldsChange"
                                style="width:184px;">
                            <Option :key="index" v-for="(item, index) in filterFieldsModuleOptions"
                                    :value="item.id"
                                    :label="item.labelName">
                            </Option>
                        </Select>
                    </FormItem>
                </Col>
                <!-- end 当前筛选字段所属模块 -->
            </Row>
        </Form>
        <Form label-width="80px" :model="contactsFormForShow" class="customer-contact">
            <Row :gutter="40" style="margin: 0;">
                <Col :span="(index+1) % 2 === 1 ? 13 : 11" style="padding:0;" v-for="(item, index) in filterFieldList" :key="index">
                    <FormItem :label="item.label || item.fieldName">
                        <!-- 输入框 -->
                        <Input :disabled="filtering"
                                v-if="item.fieldType === 'input'"
                                v-model="contactsFormForShow[(filterFieldsModule === 1 ? 'cp' : 'iq') + $dym.firstUpperCase(item.field)]"
                                :placeholder="item.field == 'keyword' ? $t('mail.writeLetter.addContactModal.customerSearchKey') : $t('mail.writeLetter.addContactModal.enterKeywordTip')">
                        </Input>
                        <!-- 国家地区单独处理 -->
                        <template v-else-if="item.field === 'countryArea'">
                            <CountryAreaSelect
                                    :disabled="filtering"
                                    :countryArea.sync="contactsFormForShow[(filterFieldsModule === 1 ? 'cp' : 'iq') + $dym.firstUpperCase(item.field)]"
                                    :placeholder="$t('mail.writeLetter.addContactModal.select')">
                            </CountryAreaSelect>
                        </template>
                        <!-- 单选 -->
                        <Select v-model="contactsFormForShow[(filterFieldsModule === 1 ? 'cp' : 'iq') + $dym.firstUpperCase(item.field)]"
                                v-else-if="item.fieldType === 'select' && item.field !== 'countryArea'"
                                :disabled="filtering"
                                clearable
                                filterable
                                size="small">
                            <Option v-for="(item, index) in item.optionValue" :value="item.key" :label="item.value" :key="index">
                            </Option>
                        </Select>
                        <!-- 多选 重点标记 -->
                        <CheckboxGroup
                                v-else-if="item.fieldType === 'selectMultiple' && item.field === 'marker'"
                                v-model="contactsFormForShow[(filterFieldsModule === 1 ? 'cp' : 'iq') + $dym.firstUpperCase(item.field)]">
                            <Checkbox v-for="(item, index) in item.optionValue"
                                        :label="item.key"
                                        :disabled="filtering"
                                        :key="index">
                                        <span>{{item.value}}</span>
                            </Checkbox>
                        </CheckboxGroup>
                        <!-- 多选 主联系人 -->
                        <CheckboxGroup
                                v-else-if="item.fieldType === 'selectMultiple' && item.field === 'linkman'"
                                v-model="contactsFormForShow[(filterFieldsModule === 1 ? 'cp' : 'iq') + $dym.firstUpperCase(item.field)]">
                            <Checkbox v-for="(item, index) in item.optionValue"
                                        :label="item.key"
                                        :disabled="filtering"
                                        :key="index">
                                        <span>{{item.value}}</span>
                            </Checkbox>
                        </CheckboxGroup>
                        <!-- 多选 负责人  -->
                        <Select v-model="contactsFormForShow[item.field]"
                                v-else-if="item.fieldType === 'selectMultiple' && item.field === 'subUserIds'"
                                multiple
                                filterable
                                :disabled="filtering"
                                clearable
                                size="small">
                            <Option v-for="(item, index) in item.optionValue" :value="item.key" :label="item.value" :key="index">
                            </Option>
                        </Select>
                        <!-- 多选 非负责人、非重点标记、非主联系人 -->
                        <Select v-model="contactsFormForShow[(filterFieldsModule === 1 ? 'cp' : 'iq') + $dym.firstUpperCase(item.field)]"
                                v-else-if="item.fieldType === 'selectMultiple' && item.field !== 'subUserIds' && item.field !== 'marker' && item.field !== 'linkman'"
                                multiple
                                filterable
                                :disabled="filtering"
                                clearable
                                size="small">
                            <Option v-for="(item, index) in item.optionValue" :value="item.key" :label="item.value" :key="index">
                            </Option>
                        </Select>
                        <!-- 日期 -->
                        <DatePicker
                            :disabled="filtering"
                            v-else-if="item.fieldType === 'date'"
                            :picker-options="date_limit"
                            type="daterange"
                            split-panels
                            style="width:232px;"
                            v-model="contactsFormForShow[(filterFieldsModule === 1 ? 'cp' : 'iq') + $dym.firstUpperCase(item.field)]"
                            placement="bottom-end"
                            transfer
                            :placeholder="$t('mail.writeLetter.addContactModal.selectDate')">
                        </DatePicker>
                        <!-- 时间 date+titme -->
                        <DatePicker
                            :disabled="filtering"
                            v-else-if="item.fieldType === 'date+time'"
                            type="datetime"
                            split-panels
                            style="width:232px;"
                            v-model="contactsFormForShow[(filterFieldsModule === 1 ? 'cp' : 'iq') + $dym.firstUpperCase(item.field)]"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            :placeholder="$t('mail.writeLetter.addContactModal.selectDate')">
                        </DatePicker>
                        <!-- 未跟进天数范围 -->
                        <template v v-else-if="item.fieldType === 'inputRange' && contactsFormForShow[(filterFieldsModule === 1 ? 'cp' : 'iq') + $dym.firstUpperCase(item.field)]">
                            <Input
                                    style="display: inline-block;width: 102px;"
                                    :disabled="filtering"
                                    v-model="contactsFormForShow[(filterFieldsModule === 1 ? 'cp' : 'iq') + $dym.firstUpperCase(item.field)].lowerLimit"
                                    :placeholder="$t('mail.writeLetter.addContactModal.lowerLimit')"
                                    maxlength="6"
                                    @input="handleInputValidate">
                            </Input>
                            <span style="margin:0 7px;">{{$t('mail.writeLetter.addContactModal.to')}}</span>
                            <Input
                                    style="display: inline-block;width: 102px;"
                                    :disabled="filtering"
                                    v-model="contactsFormForShow[(filterFieldsModule === 1 ? 'cp' : 'iq') + $dym.firstUpperCase(item.field)].upperLimit"
                                    :placeholder="$t('mail.writeLetter.addContactModal.upperLimit')"
                                    maxlength="6"
                                    @input="handleInputValidate">
                            </Input>
                            <div v-if="notFollowedDaysError" style="color: red;text-align: center;">{{$t('mail.writeLetter.addContactModal.difference')}}</div>
                        </template>
                    </FormItem>
                </Col>
            </Row>
            <FormItem>
                <Button @click="searchContact" type="success" :loading="searchLoading" :class="`${filterFieldsModule === 1 ? 'piwik_customer_contact_search_btn' : 'piwik_inquiry_contact_search_btn'}`">{{$t('mail.writeLetter.addContactModal.filter')}}</Button>
                <Button @click="handleClearFilter" type="minor">{{$t('filter_box.empty')}}</Button>
                <Tooltip placement="top"
                        :content="$t('mail.writeLetter.addContactModal.setFilterFields')"
                        style="float: right;"
                        transfer>
                    <i class="custom custom-table-edit-columns" style="font-size: 18px;line-height:33px;margin-right: 10px;" @click="$emit('update:visible_edit_columns', true);"></i>
                </Tooltip>
            </FormItem>
        </Form>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import addressBookUtils from '@/api/mail/writeMail/addressBook';
    export default {
        name: 'customer_contact',
        props: {
            currentPage: {
                type: Number,
                default: 1
            },
            isReset: {
                type: Boolean,
                default: false
            },
            isShowContactName: {
                type: Boolean,
                default: true
            },
            isShowCompanyName: {
                type: Boolean,
                default: true
            },
            hasMailAuthority: {
                type: Boolean,
                default: true
            },
            changePageOperate: {
                type: Boolean,
                default: false
            },
            visible_edit_columns: {
                type: Boolean,
                default: false
            }
        },
        components: {
        },
        data() {
            return {
                filtering: false,
                contactsFormForShow: {},
                contactsFormForSearch: {},
                contactList: [],
                searchLoading: false,
                notFollowedDaysError: false, // 未跟进天数校验结果
                isClosePoptip: true, // 是否需要关闭搜索弹窗
                filterFieldsModule: 1, // 当前筛选字段所属模块
                filterFieldList: [], // 配置好的筛选字段列表数据
                filterFieldsModuleOptions: [
                    { labelName: this.$t('mail.writeLetter.addContactModal.customers'), id: 1 },
                    { labelName: this.$t('mail.writeLetter.addContactModal.inquiries'), id: 2 }
                ], // 当前筛选字段所属模块下拉选项
                date_limit: { // 日期插件的快捷键
                    shortcuts: [
                        {
                            text: this.$t('crm.WorkBench.today'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.WorkBench.yesterday'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24);
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.WorkBench.recent7days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 6);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.WorkBench.recent14days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 13);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.WorkBench.recent30days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 29);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.WorkBench.thisWeek'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                let dayNo = start.getDay();
                                dayNo = dayNo ? dayNo - 1 : 6;
                                start.setTime(start.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.WorkBench.lastWeek'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                let dayNo = start.getDay();
                                dayNo = dayNo || 7;
                                end.setTime(end.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                start.setTime(end.getTime() - 6 * 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.WorkBench.thisMonth'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(new Date(start.getFullYear(), start.getMonth(), 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('crm.WorkBench.lastMonth'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() - 24 * 60 * 60 * 1000);
                                start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        }
                    ],
                    disabledDate(date) {
                        return date.getTime() > Date.now() || date.getTime() < (new Date('2017-12-31')).getTime();
                    }
                },
                lang_clue: {
                    /* 线索 */
                    keyword: this.$t('mail.writeLetter.addContactModal.keyword'),
                    scale: this.$t('crm.Table.col_scale'),
                    notFollowedDays: this.$t('crm.Table.col_notFollowedDays'),
                    updateTime: this.$t('crm.Table.col_updateTime'),
                    createTime: this.$t('crm.Table.col_createTime'),
                    createUserId: this.$t('crm.WorkBench.col_followUpCreateUser'),
                    countryArea: this.$t('crm.Modal.corp_countryArea'),
                    clientType: this.$t('crm.Table.col_clientType'),
                    starLevel: this.$t('crm.Modal.corp_starLevel'),
                    // 询盘
                    grouping: this.$t('crm.Modal.inq_grouping'),
                    inquiryScore: this.$t('crm.Modal.inq_inquiryScore'),
                    sourceWay: this.$t('crm.Modal.inq_sourceWay'),
                    demandProducts: this.$t('crm.Modal.inq_demandProducts'),
                    label: this.$t('crm.Modal.inq_label'),
                    productCategory: this.$t('crm.Modal.inq_productCategory'),
                    followUpId: this.$t('crm.Table.col_followUp'),
                    subUserIds: this.$t('clue.sales'),
                    sourceChannel: this.$t('crm.Modal.inq_sourceChannel'),
                    linkman: this.$t('mail.writeLetter.addContactModal.primaryContact')
                }
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId
            })
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
            // 根据公司 ID 获取联系人,格式化后填入联系人列表
            searchContact() {
                /* 关于未跟进天数的校验逻辑 */
                this.contactsFormForSearch = this.$deepClone(this.contactsFormForShow);
                if (this.contactsFormForSearch.notFollowedDays) {
                    if (String(this.contactsFormForSearch.notFollowedDays.lowerLimit)) {
                        /* 下限值存在时，校验上限值 */
                        if (!String(this.contactsFormForSearch.notFollowedDays.upperLimit)) {
                            /* 上限值不存在 */
                            this.$Message.warning(this.$t('mail.writeLetter.addContactModal.enterUpperLimit'));
                            return false;
                        } else if (this.notFollowedDaysError) {
                            /* 上限值存在但校验不通过 */
                            this.$Message.warning(this.$t('mail.writeLetter.addContactModal.difference'));
                            return false;
                        }
                    }
                }
                this.$emit('isFiltering', true);
                this.filtering = true;
                this.searchLoading = true;
                if (this.isClosePoptip) {
                    this.filtering = true;
                    this.searchLoading = true;
                }
                if (this.currentPage === 1) {
                    this.getContactsEmailCompanyNameList();
                } else {
                    this.$emit('isSearch', true);
                }
            },
            // 参数过滤
            setDataFormat(obj) {
                const result = { $and: [] };
                this.filterFieldList.forEach((item) => {
                    const itemField = this.contactsFormForShow[(this.filterFieldsModule === 1 ? 'cp' : 'iq') + this.$dym.firstUpperCase(item.field)];
                    const fildName = (this.filterFieldsModule === 1 ? 'cp' : 'iq') + this.$dym.firstUpperCase(item.field);
                    // 关键字、多选需要$or,其他字段均需要push到$and数据即可, 排除负责人 subUserIds 字段 和 主联系人linkman字段，不走字符串拼接 query 字段查询
                    if (item.field !== 'subUserIds' && item.field !== 'linkman') {
                        if (item.fieldType === 'selectMultiple' && item.field !== 'inquiryScore') {
                            let symbolName;
                            if (item.field === 'clientType' || item.field === 'scale' || item.field === 'followUpId') {
                                symbolName = '$eq';
                            } else {
                                symbolName = '$regex';
                            }
                            if (itemField.length) {
                                const selectMultipleField = itemField.map(self => {
                                    return {
                                        [fildName]: {
                                            [symbolName]: self
                                        }
                                    };
                                });
                                result.$and.push({ $or: selectMultipleField });
                            }
                        } else if (item.fieldType === 'selectMultiple' && item.field === 'inquiryScore') {
                            if (itemField.length) {
                                const selectMultipleField = itemField.map(self => {
                                    const arr = self.split('-');
                                    return {
                                        $and: [
                                            {
                                                [fildName]: {
                                                    $gte: arr[0]
                                                }
                                            },
                                            {
                                                [fildName]: {
                                                    $lte: arr[1]
                                                }
                                            }
                                        ]
                                    };
                                });
                                result.$and.push({ $or: selectMultipleField });
                            }
                        } else if (item.fieldType === 'inputRange') {
                            const inputRangeField = [];
                            itemField.lowerLimit && inputRangeField.push({ [fildName]: { $gte: Number(itemField.lowerLimit) } });
                            itemField.upperLimit && inputRangeField.push({ [fildName]: { $lte: Number(itemField.upperLimit) } });
                            inputRangeField.length && result.$and.push({ $and: inputRangeField });
                        } else if (item.fieldType === 'date') {
                            itemField && itemField.length && result.$and.push({
                                $and: [
                                    {
                                        [fildName]: {
                                            $gte: itemField[0].format('yyyy-MM-dd')
                                        }
                                    },
                                    {
                                        [fildName]: {
                                            $lte: `${itemField[1].format('yyyy-MM-dd')} 23:59:59.999`
                                        }
                                    }
                                ]
                            });
                        } else if (item.field === 'countryArea' && itemField) {
                            result.$and.push({ [fildName]: { $regex: itemField.replace('unknown', '') } });
                        } else if (item.field === 'keyword' && itemField) {
                            const keywordField = [
                                { cpCompanyName: { $regex: itemField } },
                                { ctNickName: { $regex: itemField } },
                                { ctEmail: { $regex: itemField } }
                            ];
                            result.$and.push({ $or: keywordField });
                        } else if (item.field !== 'keyword' && item.field !== 'countryArea') {
                            itemField && result.$and.push({ [fildName]: itemField });
                        }
                    }
                });
                console.log('filterFieldList ============  参数过滤：', this.filterFieldList);
                return result.$and.length ? result : [];
            },
            // 提交筛选条件，获取客户联系人列表数据
            getContactsEmailCompanyNameList(callBackType) {
                // 参数过滤，整合成后台需要的格式
                const query = this.setDataFormat(this.contactsFormForShow);
                const dataObj = {
                    orgId: this.$store.state.enterpriseId,
                    userId: this.$store.state.userId,
                    pageNo: this.currentPage,
                    pageSize: 20,
                    query: JSON.stringify(query),
                    subUserIds: this.contactsFormForShow.subUserIds && this.contactsFormForShow.subUserIds.join(',') // 负责人单独传
                };
                const linkman = this.contactsFormForShow[(this.filterFieldsModule === 1 ? 'cp' : 'iq') + this.$dym.firstUpperCase('linkman')];
                if (linkman && linkman.length && linkman.length === 1) {
                    dataObj.isMainContact = Number(linkman[0]);
                }
                this.$emit('update:changePageOperate', false);
                util.ajax({
                    url: '/crm/mailbox/getCompanyContactsNameList',
                    method: 'post',
                    data: dataObj
                }).then(response => {
                    this.searchLoading = false;
                    if (response.data.code === '1') {
                        if (response.data.data.list) {
                            const dataList = response.data.data.list;
                            this.contactList = dataList.map(item => {
                                const temp = item.email.substring(0, item.email.lastIndexOf('@'));
                                return {
                                    followUpId: item.contactsId,
                                    followUpType: 4,
                                    receiverName: this.isShowContactName ? item.nickName ? item.nickName : temp : temp,
                                    receiveMailAddress: item.email,
                                    enterpriseName: this.isShowCompanyName ? item.companyName ? item.companyName : '--' : '--',
                                    checked: false
                                };
                            });
                        } else {
                            this.contactList = [];
                        }
                    } else {
                        this.$Message.error(this.$t('mail.writeLetter.addContactModal.requestErrorTip'));
                    }
                    this.filtering = false;
                    this.$emit('isFiltering', false);
                    if (this.hasMailAuthority) {
                        this.$emit('getContactList', this.contactList);
                        this.$emit('getTotalCount', response.data.data.total);
                    } else {
                        this.$emit('getContactList', []);
                        this.$emit('getTotalCount', 0);
                    }
                    if (this.isClosePoptip) {
                        this.$emit('closeFilterPoptip', true);
                    }
                    this.isClosePoptip = true;
                });
            },
            /* 清空筛选条件 */
            handleClearFilter() {
                this.filterDataInfo();
                this.notFollowedDaysError = false;
                this.isClosePoptip = false;
                this.$emit('update:changePageOperate', false);
                if (this.currentPage !== 1) {
                    this.$emit('isSearch');
                } else {
                    this.searchContact();
                }
            },
            /* 未跟进天数校验 */
            handleInputValidate() {
                const temp = this.contactsFormForShow[(this.filterFieldsModule === 1 ? 'cp' : 'iq') + 'NotFollowedDays'];
                const regExp = /^\d+$/;
                for (const tempKey in temp) {
                    if (temp[tempKey]) {
                        let tempArr = String(temp[tempKey]).split('');
                        if (!regExp.test(temp[tempKey])) {
                            /* 校验值是否为纯数字。若非纯数字，仅截取前面的纯数字部分保留显示 */
                            const tempIndex = tempArr.findIndex(item => !regExp.test(item));
                            temp[tempKey] = tempArr.slice(0, tempIndex).join('');
                        }
                        tempArr = temp[tempKey].split('');
                        /* 校验值是否为0开头，若为0开头，则第二位禁止再输入0；若第二位不为0，则去除第一位的0，仅显示之后的数字部分 */
                        if (tempArr[0] === '0') {
                            if (tempArr[1] === '0') {
                                temp[tempKey] = 0;
                            } else if (tempArr[1]) {
                                tempArr.shift();
                                temp[tempKey] = tempArr.join('');
                            }
                        }
                    } else if (tempKey === 'lowerLimit') {
                        temp[tempKey] = 0;
                    }
                }
                if (temp.upperLimit) {
                    this.notFollowedDaysError = Number(temp.upperLimit) < Number(temp.lowerLimit);
                }
            },
            // 【当前筛选字段所属】字段切换 客户/询盘
            filterFieldsChange(listType) {
                addressBookUtils.updateFieldDefalt({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    type: 30,
                    listType
                }).then(res => {
                    // 获取当前筛选字段下的筛选条件
                    this.getFieldOrderListByWriteLetter();
                }, () => {
                    this.$Message.error('【当前筛选字段所属】字段切换失败');
                }).catch(() => {
                    this.$Message.error('【当前筛选字段所属】字段切换失败');
                });
            },
            // 获取默认当前筛选字段所属模块
            getCostomerOrInquireDefault() {
                addressBookUtils.getCostomerOrInquireDefault({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    type: 30
                }).then(res => {
                    this.filterFieldsModule = res.data;
                    this.getFieldOrderListByWriteLetter();
                }, () => {
                    this.$Message.error('获取当前筛选字段所属模块失败');
                }).catch(() => {
                    this.$Message.error('获取当前筛选字段所属模块失败');
                });
            },
            // 获取配置好的所有筛选字段
            getFieldOrderListByWriteLetter() {
                addressBookUtils.getFieldOrderListByWriteLetter({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    type: 30,
                    listType: this.filterFieldsModule
                }).then(res => {
                    this.filterFieldList = res.data;
                    console.log('filterFieldList ===================== filterFieldList:', this.filterFieldList);
                    // 初始数据
                    this.filterDataInfo();
                }, () => {
                    this.$Message.error('获取当前筛选字段失败');
                }).catch(() => {
                    this.$Message.error('获取当前筛选字段失败');
                });
            },
            // 筛选条件初始数据
            filterDataInfo() {
                this.contactsFormForShow = {};
                for (let i = 0; i < this.filterFieldList.length; i++) {
                    const item = this.filterFieldList[i];
                    item.label = this.lang_clue[item.field];
                    if (!item.field) {
                        continue;
                    }
                    if (item.fieldType === 'inputRange') {
                        this.$set(this.contactsFormForShow, [(this.filterFieldsModule === 1 ? 'cp' : 'iq') + this.$dym.firstUpperCase(item.field)], {
                            lowerLimit: '',
                            upperLimit: ''
                        });
                    } else if ((item.fieldType === 'selectMultiple' && item.field !== 'subUserIds') || item.fieldType === 'date') {
                        // 排除负责人 subUserIds 字段，不走字符串拼接 query 字段查询
                        this.$set(this.contactsFormForShow, [(this.filterFieldsModule === 1 ? 'cp' : 'iq') + this.$dym.firstUpperCase(item.field)], []);
                    } else if (item.field === 'subUserIds') {
                        // 负责人字段单独处理
                        this.$set(this.contactsFormForShow, item.field, []);
                    } else {
                        this.$set(this.contactsFormForShow, [(this.filterFieldsModule === 1 ? 'cp' : 'iq') + this.$dym.firstUpperCase(item.field)], '');
                    }
                }
                this.contactsFormForSearch = this.contactsFormForShow;
                
                console.log('filterFieldList ===================== 筛选条件初始化:', this.filterFieldList);
            }
        },
        created() {
            this.isClosePoptip = false;
            this.getCostomerOrInquireDefault();
        },
        watch: {
            currentPage: {
                handler(val) {
                    console.log('currentPage变化了-------', val, this.changePageOperate);
                    if (val === 1 && !this.changePageOperate) {
                        this.searchContact();
                    } else {
                        this.getContactsEmailCompanyNameList();
                    }
                }
            },
            isReset(val) {
                if (val === true) {
                    this.handleClearFilter();
                }
            },
            filterFieldsModule: {
                handler(val) {
                    this.$emit('getFilterFieldsModule', val);
                },
                immediate: true
            }
        }
    };
</script>
<style lang="less" scoped>
    .customer-contact {
        padding: 0 20px;
        /deep/ .el-form-item__content {
            font-size: 12px;
            .el-input {
                font-size: 12px;
                width: 232px;
            }
            .el-select {
                font-size: 12px;
                width: 232px;
                .el-input {
                    width: 100%;
                }
                .el-select__tags {
                    .el-tag{
                        line-height: 22px;
                    }
                }
            }
        }
        /deep/ .el-form-item__label {
            font-size: 12px;
            line-height: 25px;
            margin-top: 7px;
            padding-right: 0;
            text-align: left;
        }
        /deep/ .el-button--success {
            float: right;
            font-size: 12px;
            height: 33px;
            line-height: 30px;
            padding-bottom: 0;
            padding-top: 0;
            color: #fff;
            background-color: #7b98b6;
            border-color: #7b98b6;
            &:hover {
                background-color: #95adc5;
                border-color: #95adc5;
            }
        }
        /deep/ .el-button--minor {
            float: right;
            font-size: 12px;
            height: 33px;
            line-height: 30px;
            padding-bottom: 0;
            padding-top: 0;
            margin-right: 10px;
        }
        .long-label-text {
            /deep/ .el-form-item__label {
                padding-right: 0;
            }
        }
        /deep/ .el-select__tags {
            max-height: 200px;
            overflow: auto;
        }
    }
</style>

