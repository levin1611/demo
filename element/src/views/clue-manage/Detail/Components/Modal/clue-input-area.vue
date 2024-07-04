<template>
    <div class="_form_margin" :class="{'clue-model-input': from !== 'myClue'}">
       <template v-for="(column, index) in fieldsList">
            <!-- 公司名称 -->
            <template v-if="column.key=='a1001'">
                <FormItem
                    :key="column.key"
                    :label="lang_clue[column.key]?lang_clue[column.key]:column.name"
                    :required="column.isNeed === 1">
                    <AutoComplete v-if="business_state"
                        :ref="column.key"
                        v-model.trim="detailInfo[column.key]"
                        :type="detailInfo['b'+column.key]?'password':'text'"
                        :placeholder="column.colDefaultValue"
                        @blur="valideClueEnter(column, index)"
                        @input="valideClueEnter(column, index)"
                        :showWordLimit="true"
                        :showErrorMsg="true"
                        :errorMessage="$t('enterClue.upperLimitTip')"
                        :maxLen="String(column.upperLimitLength)"
                        :fetch-suggestions="searchBusinessCompanyData"
                        @select="handleSelectCompany"
                    >
                        <template slot-scope="{ item }">
                            <Tooltip trigger="hover" transfer :content="item.value" max-width="200">
                                <div style="width: 100%;overflow:hidden; white-space: nowrap;text-overflow: ellipsis;">
                                        {{ item.value }}
                                </div>
                            </Tooltip>
                        </template>
                    </AutoComplete>
                    <ElInputExtend
                        :ref="column.key"
                        v-model="detailInfo[column.key]"
                        v-if="!business_state"
                        :type="detailInfo['b'+column.key]?'password':'text'"
                        :placeholder="column.colDefaultValue"
                        @blur="valideClueEnter(column, index)"
                        @input="valideClueEnter(column, index)"
                        :showWordLimit="true"
                        :showErrorMsg="true"
                        :errorMessage="$t('enterClue.upperLimitTip')"
                        :maxLen="String(column.upperLimitLength)">
                    </ElInputExtend>
                    <span v-if="column.isEmpty" class="validate-input">{{column.name}}{{$t('enterClue.emptyTip')}}</span>
                </FormItem>
            </template>
            <template v-else-if="column.key=='a10012'">
                <FormItem
                    :key="column.key"
                    :required="column.isNeed === 1">
                    <template slot="label">
                        <span :title="lang_clue[column.key]?lang_clue[column.key]:column.name">{{ lang_clue[column.key]?lang_clue[column.key]:column.name }}</span>
                    </template>
                        <ElInputExtend
                            :ref="column.key"
                            type="text"
                            v-model.trim="detailInfo[column.key]"
                            :showErrorMsg="false"
                            :errorMessage="$t('enterClue.upperLimitTip')"
                            :placeholder="column.colDefaultValue"
                            :maxLen="String(column.upperLimitLength)"
                            @blur="valideClueEnter(column, index)"
                            @input="valideClueEnter(column, index)">
                                <Icon v-if="showUniq.phone ==='1'" style="font-size: 20px;" slot="suffix" type="search" @click="$emit('verifyPhone',detailInfo[column.key] , true)"></Icon>
                        </ElInputExtend>
                        <span v-if="column.isEmpty" class="validate-input">{{column.name}}{{$t('enterClue.emptyTip')}}</span>
                </FormItem>
            </template>
            <template v-else-if="column.key=='a10010'">
                <FormItem
                    :key="column.key"
                    :required="column.isNeed === 1">
                     <template slot="label">
                        <span :title="lang_clue[column.key]?lang_clue[column.key]:column.name">{{ lang_clue[column.key]?lang_clue[column.key]:column.name }}</span>
                    </template>
                        <ElInputExtend
                            :ref="column.key"
                            type="text"
                            v-model.trim="detailInfo[column.key]"
                            :showErrorMsg="false"
                            :errorMessage="$t('enterClue.upperLimitTip')"
                            :placeholder="column.colDefaultValue"
                            :maxLen="String(column.upperLimitLength)"
                            @blur="valideClueEnter(column, index)"
                            @input="valideClueEnter(column, index)">
                                <Icon style="font-size: 20px;" slot="suffix" type="search" @click="$emit('verifyEmail',detailInfo[column.key] , true)"></Icon>
                        </ElInputExtend>
                </FormItem>
            </template>
            <template v-else-if="column.key=='a10052'">
                <FormItem
                    :key="column.key"
                    :required="column.isNeed === 1">
                     <template slot="label">
                        <span :title="lang_clue[column.key]?lang_clue[column.key]:column.name">{{ lang_clue[column.key]?lang_clue[column.key]:column.name }}</span>
                    </template>
                        <ElInputExtend
                            :ref="column.key"
                            type="text"
                            v-model.trim="detailInfo[column.key]"
                            :showErrorMsg="false"
                            :errorMessage="$t('enterClue.upperLimitTip')"
                            :placeholder="column.colDefaultValue"
                            :maxLen="String(column.upperLimitLength)"
                            @blur="valideClueEnter(column, index)"
                            @input="valideClueEnter(column, index)">
                                <Icon style="font-size: 20px;" slot="suffix" type="search" @click="$emit('verifyWA',detailInfo[column.key] , true)"></Icon>
                        </ElInputExtend>
                        <!-- <span class="_tailIcon">
                            <HelpTip :title="$t('helpTip.whatsApp')"></HelpTip>
                        </span> -->
                </FormItem>
            </template>
            <template v-else-if="column.key=='a1003'">
                <FormItem
                    :key="column.key"
                    :required="column.isNeed === 1">
                    <template slot="label">
                        <span :title="lang_clue[column.key]?lang_clue[column.key]:column.name">{{ lang_clue[column.key]?lang_clue[column.key]:column.name }}</span>
                    </template>
                    <CountryAreaSelect
                                :countryArea.sync="detailInfo[column.key]"
                                :error_format.sync="error_countryArea_clone"
                                :countryAreaName.sync="countryAreaName"
                                :isVisible="isVisible"
                                :placeholder="column.colDefaultValue"
                                :inputStyle="from !== 'myClue' ? 'width: 230px' : ''"
                        ></CountryAreaSelect>
                </FormItem>
            </template>
            <template v-else-if="column.key == 'a10013'" class="plat-form-element">
                <FormItem
                    :key="column.key"
                    :required="column.isNeed === 1">
                    <template slot="label">
                        <span :title="lang_clue[column.key]?lang_clue[column.key]:column.name">{{ lang_clue[column.key]?lang_clue[column.key]:column.name }}</span>
                    </template>
                        <span
                            class="plat-form-select"
                            :key="i"
                            v-for="(platform, i) in socialNetworkingPlatform">
                                <Select
                                    v-model.trim="platform.type"
                                    v-if="column.type=='select' || column.type=='input'"
                                    filterable
                                    @change="valideClueEnter(column,index, 'type', i)"
                                    @blur="valideClueEnter(column,index, 'type', i)">
                                        <Option :label="item"
                                                v-for="(item) in column.option"
                                                :key="item"
                                                :value="item">{{item}}</Option>
                                </Select>
                                <Input
                                    :placeholder="column.colDefaultValue"
                                    v-model="platform.account"
                                    @blur="valideClueEnter(column, index, 'account', i)"
                                    @input="valideClueEnter(column, index, 'account', i)">
                                </Input>
                                <span
                                    v-if="i==0"
                                    :class="[i === 0 ? 'tailIconOnly' : 'tailIcon']"
                                    style="float:none;margin:0 0 0 15px"
                                    @click="addPlatform">
                                        <Icon class="custom custom-add-circle" size="15"
                                        style="cursor:pointer;"></Icon>
                                </span>
                                <span v-else-if="i > 0 "
                                    class="tailIcon"
                                    style="float:none;margin:0 0 0 15px"
                                    @click="deletePlatform(i)">
                                            <Icon class="custom custom-reduce-circle" size="15"
                                            style="cursor:pointer;"></Icon>
                                </span>
                                    <span v-if="platform.platFormFlagEmptyTip && (i < socialNetworkingPlatform.length-1)" class="validate-input">{{column.name}}{{platform.platFormFlagEmptyTip}}</span>
                                <span v-else-if="platform.platFormFlagEmptyTip && (i == socialNetworkingPlatform.length-1) && !column.isExtraLong" class="validate-input">{{column.name}}{{platform.platFormFlagEmptyTip}}</span>
                        </span>
                </FormItem>
            </template>

            <!-- 跟进状态 -->
            <template v-else-if="column.key == 'status'">
                <FormItem
                    :key="column.key"
                    :required="column.isNeed === 1">
                    <template slot="label">
                        <span :title="lang_clue[column.key]?lang_clue[column.key]:column.name">{{ lang_clue[column.key]?lang_clue[column.key]:column.name }}</span>
                    </template>
                        <Select
                        v-model="detailInfo[column.key]"
                        filterable
                        @remove-tag="removeTag(column, index, $event)"
                        @visible-change="visibleChange(column, index, $event)">
                            <Option v-for="(item,index) in column.option" :value="item.value" :key="index"
                                    :label="item.label"></Option>
                        </Select>
                </FormItem>
            </template>
            <!-- 下拉选框字段 -->
            <template v-else-if="column.type ==='select'">
                <FormItem
                    :key="column.key"
                    :required="column.isNeed === 1">
                    <template slot="label">
                        <span :title="lang_clue[column.key]?lang_clue[column.key]:column.name">{{ lang_clue[column.key]?lang_clue[column.key]:column.name }}</span>
                    </template>
                    <Select
                    v-model.trim="detailInfo[column.key]"
                    filterable
                    @visible-change="visibleChange(column, index, $event)">
                        <Option
                            v-for="(item,index) in column.option"
                            :value="item"
                            :key="index"
                            :label="item">
                        </Option>
                    </Select>
                </FormItem>
            </template>

            <!-- 下拉多选框字段 -->
            <template v-else-if="column.type ==='selectMultiple'">
                <FormItem
                    :key="column.key"
                    :required="column.isNeed === 1">
                    <template slot="label">
                        <span :title="lang_clue[column.key]?lang_clue[column.key]:column.name">{{ lang_clue[column.key]?lang_clue[column.key]:column.name }}</span>
                    </template>
                        <Select
                        v-model="detailInfo[column.key]"
                        filterable
                        multiple
                        @remove-tag="removeTag(column, index, $event)"
                        @visible-change="visibleChange(column, index, $event)">
                            <Option v-for="(item,index) in column.option" :value="item" :key="index"
                                    :label="item"></Option>
                        </Select>
                </FormItem>
            </template>
            <template v-else-if="column.type === 'date+time'">
                <FormItem
                    :key="column.key"
                    :required="column.isNeed === 1">
                    <template slot="label">
                        <span :title="lang_clue[column.key]?lang_clue[column.key]:column.name">{{ lang_clue[column.key]?lang_clue[column.key]:column.name }}</span>
                    </template>
                        <DatePicker
                            v-model="detailInfo[column.key]"
                            type="datetime"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            :placeholder="column.colDefaultValue"
                            @blur="valideClueEnter(column, index)">
                        </DatePicker>
                        <span v-if="column.isEmpty" class="validate-input">{{column.name}}{{$t('enterClue.emptyTip')}}</span>
                </FormItem>
            </template>
            <template v-else-if="column.type === 'date'">
                <FormItem
                    :key="column.key"
                    :required="column.isNeed === 1">
                    <template slot="label">
                        <span :title="lang_clue[column.key]?lang_clue[column.key]:column.name">{{ lang_clue[column.key]?lang_clue[column.key]:column.name }}</span>
                    </template>
                        <DatePicker
                            v-model="detailInfo[column.key]"
                            type="date"
                            value-format="yyyy-MM-dd"
                            :editable="false"
                            :placeholder="column.colDefaultValue"
                            @blur="valideClueEnter(column, index)">
                        </DatePicker>
                </FormItem>
            </template>

            <!-- 文本框字段 -->
            <template v-else-if="column.type ==='textarea'">
                <FormItem
                    :label="lang_clue[column.key]?lang_clue[column.key]:column.name"
                    :key="column.key"
                    :required="column.isNeed === 1">
                    <ElInputExtend
                        type="textarea"
                        :ref="column.key"
                        v-model="detailInfo[column.key]"
                        :placeholder="column.colDefaultValue"
                        @blur="valideClueEnter(column, index)"
                        @input="valideClueEnter(column, index)"
                        :showWordLimit="true"
                        :errorMessage="$t('enterClue.upperLimitTip')"
                        :maxLen="String(column.upperLimitLength)">
                    </ElInputExtend>
                </FormItem>
            </template>
            <!-- 其他字段 -->
            <template v-else>
                <FormItem
                    :key="column.key"
                    :required="column.isNeed === 1">
                    <template slot="label">
                        <span :title="lang_clue[column.key]?lang_clue[column.key]:column.name">{{ lang_clue[column.key]?lang_clue[column.key]:column.name }}</span>
                    </template>
                    <ElInputExtend
                        :ref="column.key"
                        v-model="detailInfo[column.key]"
                        :type="detailInfo['b'+column.key]?'password':'text'"
                        :placeholder="column.colDefaultValue"
                        @blur="valideClueEnter(column, index)"
                        @input="valideClueEnter(column, index)"
                        :showWordLimit="true"
                        :errorMessage="$t('enterClue.upperLimitTip')"
                        :maxLen="String(column.upperLimitLength)"
                    >
                    </ElInputExtend>
                </FormItem>
            </template>
        </template>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'clueInputArea',
        props: {
            socialNetworkingPlatform: {
                type: Array
            },
            fieldsList: {
                type: Array
            },
            detailInfo: {
                type: Object
            },
            from: {
                type: String
            },
            isVisible: {
                type: Boolean
            }
        },
        components: {
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                fullName: 'fullName',
                userId: 'userId',
                business_state: state => state.app.business_state,
                showUniq: state => state.crm.showUniq
            })
        },
        data() {
            return {
                piwikData: {
                    a1003: ''
                },
                showRemind: 1, // 是否显示国家地区的提示 1显示 2不显示
                // CRM 字段多语言
                lang_clue: {
                    /* 固定指标 */
                    seqNumber: this.$t('clue.clue_id'),
                    proj: this.$t('clue.visitor_id'),
                    partSys: this.$t('clue.FB_name'),
                    leadsSubmitTime: this.$t('clue.leads_create_time'),
                    leadsId: 'FB Lead ID',
                    adId: 'Ad ID',
                    sourceUrl: this.$t('clue.first_visit_url'),
                    source: this.$t('clue.create_way'),
                    createTime: this.$t('clue.create_time'),
                    editTime: this.$t('clue.edit_time'),
                    createUser: this.$t('clue.inputer'),
                    serviceName: this.$t('clue.service'),
                    saleName: this.$t('clue.sales'),
                    status: this.$t('clue.status'),

                    /* 固定字段 */
                    a1001: this.$t('crm.Modal.corp_companyName'),
                    a1002: this.$t('crm.Modal.corp_mainProduct'),
                    a1003: this.$t('crm.Modal.corp_countryArea'),
                    a1004: this.$t('crm.Modal.corp_homePage'),
                    a1005: this.$t('crm.Modal.corp_fax'),
                    a1006: this.$t('crm.Modal.corp_phone'),
                    a1007: this.$t('crm.Modal.corp_contactAddress'),
                    a1008: this.$t('crm.Modal.corp_companyRemark'),
                    a1009: this.$t('crm.Modal.contact_nickName'),
                    a10010: this.$t('crm.Modal.contact_email'),
                    a10011: this.$t('crm.Modal.contact_jobTitle'),
                    a10012: this.$t('crm.Modal.contact_phone'),
                    a10013: this.$t('crm.Modal.contact_socialNetworkingPlatform'),
                    a10014: this.$t('crm.Modal.contact_gender'),
                    a10015: this.$t('crm.Modal.contact_remark'),
                    a10016: this.$t('crm.Modal.inq_demandProducts'),
                    a10017: this.$t('crm.Modal.inq_label'),
                    a10018: this.$t('crm.Modal.inq_productCategory'),
                    a10019: this.$t('crm.Modal.inq_sourceChannel'),
                    a10020: this.$t('crm.Modal.inq_sourceWay'),
                    a10021: this.$t('crm.Modal.inq_remark'),
                    a10052: this.$t('crm.InqSet.contact_whatsApp'),
                    a10053: this.$t('crm.InqSet.contact_instagram'),
                    a10055: this.$t('crm.InqSet.corp_clientType'),
                    clueClass: this.$t('crm.InqSet.corp_leadLevel')
                },
                error_countryArea_clone: false, // 国家地区的格式校验
                countryAreaName: '' // 国家地区名
            };
        },
        methods: {
            validePlatform(column, index) {
                const str = JSON.stringify(this.socialNetworkingPlatform);
                if (str.length > column.upperLimitLength) {
                    this.$set(this.fieldsList[index], 'isExtraLong', true);
                    return true;
                } else {
                    this.$set(this.fieldsList[index], 'isExtraLong', false);
                    return false;
                }
            },
            /**
             * @Date: 2020-06-30 11:11:39
             * @LastEditors: niumkiki
             * @description: 验证必填项是否为空
             * @param :
             * @return:
             */
            visibleChange(column, index, e) {
                if (!e) {
                    this.valideClueEnter(column, index);
                    this.$set(this.fieldsList[index], 'isExpand', false);
                } else {
                    this.$set(this.fieldsList[index], 'isEmpty', false);
                    this.$set(this.fieldsList[index], 'isExpand', true);
                }
            },
            removeTag(column, index, e) {
                // 只有在下拉框收起时再判断是否为空
                if (!column.isExpand) {
                    this.valideClueEnter(column, index);
                }
            },
            valideClueEnter(column, index, platFormKey, platFormIndex) {
                this.$forceUpdate();
                if (column.key === 'a10052' && this.detailInfo[column.key]) {
                    this.$set(this.detailInfo, column.key, this.detailInfo[column.key].replace(/[^ `\-=[\];'\\,./~!@#$%^&*()_+{}:"|<>?！￥…（）—\d]/g, '').replace(/( )|(　)/g, ''));
                }
                if (column.key === 'a10012' && this.detailInfo[column.key]) {
                    this.$set(this.detailInfo, column.key, this.detailInfo[column.key].replace(/( )|(　)/g, ''));
                }
                if (column.isNeed) {
                    // 社交平台处理
                    if (column.key === 'a10013') {
                        // 判断字段是否超长
                        this.validePlatform(column, index);
                        if (platFormKey === 'account' && this.socialNetworkingPlatform[platFormIndex].account) {
                            this.socialNetworkingPlatform[platFormIndex].account = this.socialNetworkingPlatform[platFormIndex].account.trim();
                        }
                        // 如果是社交平台分类没有填写
                        if (platFormKey === 'type' && !this.socialNetworkingPlatform[platFormIndex].type) {
                            this.$set(this.fieldsList[index], 'isEmpty', true);
                            this.$set(this.socialNetworkingPlatform[platFormIndex], 'platFormFlagEmptyTip', this.$t('enterClue.platFormFlagTypeEmptyTip'));
                            return true;
                        } else if (platFormKey === 'account' && !this.socialNetworkingPlatform[platFormIndex].account) {
                            // 如果是社交平台内容没有填写
                            this.$set(this.fieldsList[index], 'isEmpty', true);
                            this.$set(this.socialNetworkingPlatform[platFormIndex], 'platFormFlagEmptyTip', this.$t('enterClue.platFormFlagAccountEmptyTip'));
                            return true;
                        } else {
                            // 判断是否含有platFormIndex
                            if (platFormIndex === undefined) {
                                // 如果是undefined， 代表是点击确认时，去验证规则的
                                const emptyArr = this.socialNetworkingPlatform.some((item, i) => {
                                    if (item.account) {
                                        item.account = item.account.trim();
                                    }
                                    if (!item.type && !item.account) {
                                        this.$set(this.socialNetworkingPlatform[i], 'platFormFlagEmptyTip', this.$t('enterClue.emptyTip'));
                                        return true;
                                    } else if (!item.type) {
                                        this.$set(this.socialNetworkingPlatform[i], 'platFormFlagEmptyTip', this.$t('enterClue.platFormFlagTypeEmptyTip'));
                                        return true;
                                    } else if (!item.account) {
                                        this.$set(this.socialNetworkingPlatform[i], 'platFormFlagEmptyTip', this.$t('enterClue.platFormFlagAccountEmptyTip'));
                                        return true;
                                    } else {
                                        this.$set(this.socialNetworkingPlatform[i], 'platFormFlagEmptyTip', '');
                                        return false;
                                    }
                                });
                                if (emptyArr) {
                                    this.$set(this.fieldsList[index], 'isEmpty', true);
                                }
                                return emptyArr;
                            } else {
                                console.log('单个点击的');
                                this.$set(this.fieldsList[index], 'isEmpty', false);
                                this.$set(this.socialNetworkingPlatform[platFormIndex], 'platFormFlagEmptyTip', '');
                                // 判断社交平台是否超长
                                const isExtra = this.validePlatform(column, index);
                                if (isExtra) {
                                    const plateformEmpty = this.socialNetworkingPlatform.some((item, i) => {
                                        if (item.account) {
                                            item.account = item.account.trim();
                                        }
                                        return !item.type || !item.account;
                                    });
                                    if (plateformEmpty) {
                                        this.$set(this.fieldsList[index], 'isEmpty', true);
                                    }
                                }
                                return false;
                            }
                        }
                    } else if (column.key !== 'a10013') {
                        if (column.type === 'selectMultiple' || column.type === 'select') {
                            if (!this.detailInfo[column.key] || !this.detailInfo[column.key].length) {
                                this.$set(this.fieldsList[index], 'isEmpty', true);
                                return true;
                            } else {
                                this.$set(this.fieldsList[index], 'isEmpty', false);
                                return false;
                            }
                        } else {
                            if (!this.detailInfo[column.key] || (this.detailInfo[column.key] && !this.detailInfo[column.key].trim())) {
                                this.$set(this.fieldsList[index], 'isEmpty', true);
                                return true;
                            } else {
                                this.$set(this.fieldsList[index], 'isEmpty', false);
                                return false;
                            }
                        }
                    }
                }
            },

            /* 社交平台相关 */
            // 添加社交平台单项
            addPlatform() {
                this.socialNetworkingPlatform.push({
                    type: '',
                    account: ''
                });
            },
            // 删除社交平台单项
            deletePlatform(index) {
                this.socialNetworkingPlatform.splice(index, 1);
            },
            // 获取工商联想数据
            searchBusinessCompanyData(queryString, cb) {
                // 搜索词为空, 不需要显示工商数据弹框
                if (!queryString) {
                    cb([]);
                    return;
                }
                util.ajaxMail({
                    url: '/crm/business/getBusinessRelationDataList',
                    method: 'POST',
                    params: {
                        orgId: Number(this.enterpriseId),
                        keyword: queryString
                    }
                }).then(({ data }) => {
                    if (data.code === '1') {
                        const result = this.handleBusinessData(data.data);
                        cb(result);
                    }
                });
            },
            // 格式化搜索得到的工商数据
            handleBusinessData(dataList) {
                if (!Array.isArray(dataList)) {
                    return [];
                }

                return dataList.map(item => {
                    return {
                        value: item.companyName,
                        data: JSON.parse(JSON.stringify(item))
                    };
                });
            },
            // 选中联想数据
            handleSelectCompany(item) {
                util.ajaxJson({
                    url: '/crm/business/getCrmFieldBusinessDataList',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        userName: this.fullName,
                        type: 1,
                        businessCompanyId: item.data.id,
                        businessCompany: item.data.companyName
                    }
                }).then(({ data }) => {
                    if (data.code === '1') {
                        this.backFillBusinessData(data.data);
                    }
                });
            },
            // 根据联想规则设置回填联想数据
            backFillBusinessData(businessData) {
                if (!Array.isArray(businessData)) {
                    return;
                }
                businessData.forEach((item) => {
                    this.detailInfo[item.crmField] = item.value;
                });
                this.$nextTick(() => {
                    this.$forceUpdate();
                });
            }
        },
        watch: {
            error_countryArea_clone(val) {
                this.$emit('update:error_countryArea', val);
            },
            countryAreaName(val) {
                this.$emit('update:countryAreaName', val);
            },
            // 监视visible的显示与隐藏，调接口获取数据
            detailInfo: {
                handler(val) {
                    this.$emit('update:detailInfo', val);
                },
                deep: true
            }
        }
    };
</script>
<style lang="less" scoped>
    .plat-form-select {
        display: flex !important;
        .el-input {
            padding-left: 15px;
        }
    }
    .validate-input {
        display: block;
        color: #EA4335;
        font-size: 12px;
        position: relative;
        line-height: 20px;
        height: 0px;
        top: 0;
    }
    .validate-plateform {
        word-break: break-all;
        width: 240px;
        display: block;
        color: #EA4335;
        font-size: 12px;
        position: relative;
        line-height: 20px;
        height: 19px;
        top: 0;
    }
    .clue-model-input .el-input, .clue-model-input .el-select{
        width:230px;
        display:inline-block;
    }
    .clue-model-input .el-textarea{
        width:230px;
    }
    .clue-model-input .plat-form-select {
        .el-select {
            width:110px;
            text-align:left;
        }
        .el-input {
            width:120px;
        }
    }
</style>
