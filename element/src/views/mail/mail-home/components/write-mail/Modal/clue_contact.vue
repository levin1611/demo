<template>
    <Form label-width="80px" :model="contactsFormForShow" class="clue-contact contacts_content_conatiner">
        <Row :gutter="40" style="margin: 0;">
            <Col :span="(index+1) % 2 === 1 ? 13 : 11" style="padding:0;" v-for="(item, index) in filterFieldList" :key="index">
                <FormItem :label="item.label || item.fieldName">
                    <!-- 输入框 非国家地区 a1003 -->
                    <Input :disabled="filtering"
                            v-if="item.fieldType === 'input'"
                            v-model="contactsFormForShow[item.field]"
                           :placeholder="item.field == 'keyword' ? $t('mail.writeLetter.addContactModal.clueSearchKey') : $t('mail.writeLetter.addContactModal.enterKeywordTip')">
                    </Input>
                    <!-- 单选 -->
                    <Select v-model="contactsFormForShow[item.field]"
                            v-else-if="item.fieldType === 'select'"
                            :disabled="filtering"
                            clearable
                            filterable
                            size="small">
                        <Option v-for="(item, index) in item.optionValue" :value="item.key" :label="item.value" :key="index">
                        </Option>
                    </Select>
                    <!-- 多选 -->
                    <Select v-model="contactsFormForShow[item.field]"
                            v-else-if="item.fieldType === 'selectMultiple'"
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
                        v-model="contactsFormForShow[item.field]"
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
                        v-model="contactsFormForShow[item.field]"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        :placeholder="$t('mail.writeLetter.addContactModal.selectDate')">
                    </DatePicker>
                </FormItem>
            </Col>
        </Row>
        <FormItem>
            <Button @click="searchContact" type="success" :loading="searchLoading" class="piwik_lead_contact_search_btn">{{$t('mail.writeLetter.addContactModal.filter')}}</Button>
            <Button @click="handleClearFilter" type="minor">{{$t('filter_box.empty')}}</Button>
            <Tooltip placement="top"
                     :content="$t('mail.writeLetter.addContactModal.setFilterFields')"
                     style="float: right;"
                     transfer>
                <i class="custom custom-table-edit-columns" style="font-size: 18px;line-height:33px;margin-right: 10px;" @click="$emit('update:visible_edit_columns', true);"></i>
            </Tooltip>
        </FormItem>
    </Form>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import addressBookUtils from '@/api/mail/writeMail/addressBook';
    import { crmClue } from '@/api/crm';
    export default {
        name: 'clue_contact',
        props: {
            currentPage: {
                type: Number,
                default: 1
            },
            isReset: {
                type: Boolean,
                default: false
            },
            templateId: {
                type: String,
                default: ''
            },
            hasMail: {
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
            changePageOperate: {
                type: Boolean,
                default: false
            },
            visible_edit_columns: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                filtering: false,
                searchLoading: false,
                contactsFormForShow: {},
                contactsFormForSearch: {},
                contactList: [],
                searchData: {},
                isClosePoptip: true, // 是否需要关闭搜索弹窗
                filterFieldList: [], // 配置好的筛选字段列表数据
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
                    /* 固定指标 */
                    keyword: this.$t('mail.writeLetter.addContactModal.keyword'),
                    source: this.$t('clue.create_way'),
                    create_time: this.$t('crm.Table.col_createTime'),
                    update_time: this.$t('clue.edit_time'),
                    create_user: this.$t('clue.inputer'),
                    sale_id: this.$t('clue.sales'),
                    status: this.$t('clue.status'),

                    /* 固定字段 */
                    a1003: this.$t('crm.Modal.corp_countryArea'),
                    a10013: this.$t('crm.Modal.contact_socialNetworkingPlatform'),
                    a10014: this.$t('crm.Modal.contact_gender'),
                    a10017: this.$t('crm.Modal.inq_label'),
                    a10018: this.$t('crm.Modal.inq_productCategory'),
                    a10019: this.$t('crm.Modal.inq_sourceChannel'),
                    a10020: this.$t('crm.Modal.inq_sourceWay')
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
            /** 搜索 */
            async searchContact() {
                this.searchData = {};
                const result = { $and: [] };
                // 筛选条件不包含跟进状态，需要把跟进状态的全量数据传过去
                if (this.filterFieldList.every((item) => item.field !== 'status')) {
                    const status = [1, 2, 4, 5].map(item => {
                        return {
                            status: {
                                $eq: item
                            }
                        };
                    });
                    result.$and.push({
                        $or: status
                    });
                }
                console.log('this.filterFieldList', this.filterFieldList);
                this.filterFieldList.forEach((item) => {
                    const itemField = this.contactsFormForShow[item.field];
                    console.log('itemField', item.field, itemField);
                    const fildName = item.field === 'saleName' ? 'manager' : item.field;
                    if (item.fieldType === 'selectMultiple' && itemField && itemField.length) {
                        if (itemField && itemField.length) {
                            const selectMultipleField = itemField.map(self => {
                                return {
                                    [fildName]: {
                                        $regex: self
                                    }
                                };
                            });
                            itemField.length && result.$and.push({ $or: selectMultipleField });
                        }
                    } else if (item.fieldType === 'inputRange') {
                        const inputRangeField = [];
                        itemField.lowerLimit && inputRangeField.push({ [fildName]: { $gt: itemField.lowerLimit } });
                        itemField.upperLimit && inputRangeField.push({ [fildName]: { $gt: itemField.upperLimit } });
                        inputRangeField.length && result.$and.push({ $or: inputRangeField });
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
                    } else if (item.field === 'a10013' && itemField) {
                        // 社交平台单独处理
                        result.$and.push({
                            [fildName]: {
                                $regex: itemField
                            }
                        });
                    } else if (item.field === 'keyword' && itemField) {
                        // 关键字单独处理
                        const keywordField = [
                            { a1009: { $regex: itemField } },
                            { a10010: { $regex: itemField } }
                        ];
                        result.$and.push({ $or: keywordField });
                    } else if ((item.fieldType === 'select' || item.fieldType === 'input') && item.field !== 'keyword' && item.field !== 'a1003' && item.field !== 'a10013' && itemField) {
                        itemField && result.$and.push({ [fildName]: itemField });
                    } else if (item.field === 'status' && !itemField.length) {
                        /**
                         * @Description: 由于线索联系人查询的数据范围变更为是线索但不是询盘，查询接口调用/form-cust/form/getColumnValueList接口，即线索管理表头筛选的查询接口，
                         *              所以需要增加默认筛选条件，实现过滤状态变更为询盘的线索数据。
                         *              因此在用户未选中跟进状态的情况下，默认搜索是线索(status为1/2/4/5)但不为询盘(status为3)的数据
                         * @author 杨娣
                         * @date 2020/7/15
                        */
                        const status = item.optionValue.map(item => {
                            return {
                                [fildName]: {
                                    $eq: item.key
                                }
                            };
                        });
                        result.$and.push({
                            $or: status
                        });
                    }
                });
                // 默认参数 notnull  过滤邮箱为空的数据
                result.$and.push({
                    a10010: {
                        $notnull: -1
                    }
                });
                // 国家地区单独处理
                console.log('this.filterFieldList', this.filterFieldList);
                console.log('this.contactsFormForShow', this.contactsFormForShow);
                if (this.contactsFormForShow.a1003) {
                    let tempContryName = '';
                    if (this.contactsFormForShow.a1003 === '中国') {
                        tempContryName = 'CN';
                    } else {
                        tempContryName = await this.getCountryCodeByName(this.contactsFormForShow.a1003);
                    }
                    result.$and.push({
                        $or: [
                            {
                                a1003: {
                                    $regex: this.contactsFormForShow.a1003
                                }
                            },
                            {
                                a1003: {
                                    $regex: tempContryName
                                }
                            }
                        ]
                    });
                }
                this.searchData = result.$and.length ? result : [];
                this.$emit('isFiltering', true);
                this.filtering = true;
                this.searchLoading = true;
                console.log('this.filtering', this.filtering);
                if (this.isClosePoptip) {
                    this.filtering = true;
                    this.searchLoading = true;
                }
                if (this.currentPage === 1) {
                    this.getColumnValueList();
                } else {
                    this.$emit('isSearch', true);
                }
            },
            /** 获取列表 */
            /**
             * @Description: 接口的listType改为2，即查询的是当前用户下的线索
             * @author 杨娣
             * @date 2019/9/20
             */
            getColumnValueList(callBackType) {
                this.contactList = [];
                /**
                 * @Description: 线索联系人筛选的数据范围变更为当前登录用户本人，及其拥有管理权限的人员。
                 *               经确认，/form-cust/form/getColumnValueList已与管理权限集成，此处仅将listType由2(我的线索)更改为3(全部线索)即可
                 * @author 杨娣
                 * @date 2020/7/15
                */
                const sendData = {
                    orgId: this.enterpriseId,
                    templateId: this.templateId,
                    userId: this.userId,
                    query: JSON.stringify(this.searchData),
                    pageSize: 20,
                    pageNo: this.currentPage,
                    listType: 3
                };
                this.$emit('update:changePageOperate', false);
                util.ajax({
                    url: '/form-cust/form/getColumnValueList',
                    method: 'post',
                    data: sendData
                }).then(response => {
                    this.filtering = false;
                    this.$emit('isFiltering', false);
                    this.searchLoading = false;
                    /**
                     * @Description: 与产品确认，当接口返回code不为1(即接口响应异常)，页面做未查询到数据的处理。所以此处不对code做1/0的判断
                     * @author 杨娣
                     * @date 2020/7/17
                    */
                    if (response.data.code) {
                        if (response.data.data && response.data.data.list) {
                            const dataList = response.data.data.list;
                            for (const item of dataList) {
                                if (item.a10010) { // 邮箱
                                    const temp = item.a10010.substring(0, item.a10010.lastIndexOf('@'));
                                    this.contactList.push({
                                        followUpId: item.id,
                                        followUpType: 1,
                                        receiverName: this.isShowContactName ? item.a1009 ? item.a1009 : temp : temp, // 姓名
                                        receiveMailAddress: item.a10010,
                                        enterpriseName: this.isShowCompanyName ? item.a1001 ? item.a1001 : '--' : '--', // 公司名称
                                        checked: false
                                    });
                                }
                            }
                        } else {
                            this.contactList = [];
                        }
                        if (response.data.data && this.hasMail) {
                            this.$emit('getTotalCount', response.data.data.total);
                        } else {
                            this.contactList = [];
                            this.$emit('getTotalCount', 0);
                        }
                        this.$emit('getContactList', this.contactList);
                        if (this.isClosePoptip) {
                            this.$emit('closeFilterPoptip', true);
                        }
                        this.isClosePoptip = true;
                    }
                });
            },
            /* 清空筛选条件 */
            handleClearFilter() {
                this.filterDataInfo();
                this.$emit('update:changePageOperate', false);
                this.isClosePoptip = false;
                if (this.currentPage !== 1) {
                    this.$emit('isSearch');
                } else {
                    this.searchContact();
                }
            },
            // 获取设置所有字段
            getFieldOrderListByWriteLetter() {
                addressBookUtils.getFieldOrderListByWriteLetter({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    type: 32
                }).then(res => {
                    this.filterFieldList = res.data;
                    // 初始数据
                    this.filterDataInfo();
                }, () => {
                    this.$Message.error('获取筛选字段失败');
                }).catch(() => {
                    this.$Message.error('获取筛选字段失败');
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
                    if (item.field === 'a10014') {
                        item.optionValue = [
                            {
                                key: 1,
                                value: this.$t('crm.Modal.male')
                            },
                            {
                                key: 2,
                                value: this.$t('crm.Modal.female')
                            }
                        ];
                    }
                    if (item.fieldType === 'inputRange') {
                        this.$set(this.contactsFormForShow, [item.field], {
                            lowerLimit: '',
                            upperLimit: ''
                        });
                    } else if (item.fieldType === 'selectMultiple' || item.fieldType === 'date') {
                        this.$set(this.contactsFormForShow, [item.field], []);
                    } else {
                        this.$set(this.contactsFormForShow, [item.field], '');
                    }
                }
                this.contactsFormForSearch = this.contactsFormForShow;
            },
            // ============================================接口
            /**
             * @Date: 2020-05-19 17:50:20
             * @LastEditors: niumkiki
             * @description: 增加一个接口,根据国家地区获取它的编码名称
             * @param :
             * @return:
             */
            getCountryCodeByName(countryName) {
                return crmClue.getCountryCodeByName({ countryName }).then(res => {
                    if (res.code === '1') {
                        return res.data;
                    } else {
                        return null;
                    }
                });
            }
        },
        created() {
            console.log(this.isReset);
            this.$emit('getTemplateId');
            this.getFieldOrderListByWriteLetter();
        },
        watch: {
            /**
             * @Description: 当templateId变化时，改为调用searchContact方法，即实现初始化显示的数据是有邮件地址的
             * @author 杨娣
             * @date 2019/9/20
             */
            /* templateId:'getColumnValueList', */
            templateId: {
                handler(val) {
                    console.log('templateId变化了--------', val);
                    this.isClosePoptip = false;
                }
            },
            currentPage: {
                handler(val) {
                    console.log('currentPage变化了-------', val, this.changePageOperate);
                    if (val === 1 && !this.changePageOperate) {
                        this.searchContact();
                    } else {
                        this.getColumnValueList();
                    }
                }
            },
            isReset(val) {
                if (val === true) {
                    this.handleClearFilter();
                }
            }
        }
    };
</script>
<style lang="less" scoped>
    .clue-contact {
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

