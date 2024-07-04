<template>
    <div class="enter-clue">
        <Modal
            custom-class="clue-modal"
            id="enter-clue-nochange"
            :visible.sync="visible"
            :append-to-body="true"
            :modal="false"
            width="540px"
            v-dialog-drag
            @close="close"
            ref="currentModal"
            @scroll.native.capture="close_popper"
            class="draggable-dialog">
            <div slot="title">
                <span style="font-size:18px;font-weight:700;margin-right:10px;color: #303133;">{{$t('visitor_history.add_clue')}}</span>
                <Tooltip
                    style="float:none;cursor:pointer;"
                    v-if="type == 'facebook'"
                    max-width="200"
                    content="选项型字段的信息与既有选项不符时将不会回填信息">
                        <Icon custom="custom-tip"></Icon>
                        <!-- <i class="custom-tip"></i> -->
                </Tooltip>
            </div>
            <div style="height:46vh;overflow:auto">
                <Spin size="large" fix v-if="spinShow"></Spin>
                <div v-if="templateList.length">
                    <div class="demo-spin-container" v-if="delLoading">
                        <Spin fix></Spin>
                    </div>
                    <div class="appoint-sale">
                        {{$t('clue.select_sales')}}
                        <Select v-model="saleId" filterable style="width:230px;margin-left: 20px">
                            <Option v-for="(item,index) in saleList" :value="item.id" :key="index" :label="item.fullname">
                            </Option>
                        </Select>
                    </div>
                    <Form
                        ref="enterClue"
                        :inline="true"
                        class='enter-clue-form'
                        label-width="133px"
                        style="margin-top:12px;padding: 0 16px"
                        label-position="right">
                        <template
                            v-for="(column, index) in templateList">
                            <!-- 公司名称 -->
                            <template v-if="column.key=='a1001'">
                                <FormItem
                                    :key="column.key"
                                    :label="lang_clue[column.key]?lang_clue[column.key]:column.name"
                                    :required="column.isNeed === 1">
                                    <AutoComplete v-if="business_state"
                                        v-model.trim="colObj[column.key]"
                                        :type="hide==true&&colObj['b'+column.key]?'password':'text'"
                                        :readonly="hide==true&&colObj['b'+column.key]?true:false"
                                        style="width:230px;display:inline-block;"
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
                                        v-model="colObj[column.key]"
                                        v-if="!business_state"
                                        :type="hide==true&&colObj['b'+column.key]?'password':'text'"
                                        :readonly="hide==true&&colObj['b'+column.key]?true:false"
                                        style="width:230px;display:inline-block;"
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
                            <!-- 电话 -->
                            <template v-else-if="column.key=='a10012'">
                                <FormItem
                                    :label="lang_clue[column.key]?lang_clue[column.key]:column.name"
                                    :key="column.key"
                                    :required="column.isNeed === 1">
                                    <ElInputExtend
                                        :readonly="hide==true&&colObj['b'+column.key]?true:false"
                                        :type="hide==true&&colObj['b'+column.key]?'password':'text'"
                                        v-model.trim="colObj[column.key]"
                                        style="width:230px;display:inline-block;"
                                        :showErrorMsg="true"
                                        :errorMessage="$t('enterClue.upperLimitTip')"
                                        :placeholder="column.colDefaultValue"
                                        :maxLen="String(column.upperLimitLength)"
                                        @blur="valideClueEnter(column, index)"
                                        @input="valideClueEnter(column, index)">
                                        <Icon v-if="showUniq.phone==='1'" style="font-size: 20px;" slot="suffix" type="search" @click="verifyPhone(colObj[column.key],true)"></Icon>
                                    </ElInputExtend>
                                    <span v-if="column.isEmpty" class="validate-input">{{column.name}}{{$t('enterClue.emptyTip')}}</span>
                                </FormItem>
                            </template>
                            <!-- 邮箱 -->
                            <template v-else-if="column.key=='a10010'">
                                <FormItem
                                    :label="lang_clue[column.key]?lang_clue[column.key]:column.name"
                                    :key="column.key"
                                    :required="column.isNeed === 1">
                                    <ElInputExtend
                                        :readonly="(hide==true&&colObj['b'+column.key]?true:false) && emailValidation"
                                        :type="hide==true&&colObj['b'+column.key]?'password':'text'"
                                        v-model.trim="colObj[column.key]"
                                        :placeholder="column.colDefaultValue"
                                        :showErrorMsg="true"
                                        :errorMessage="$t('enterClue.upperLimitTip')"
                                        :maxLen="String(column.upperLimitLength)"
                                        style="width:230px;display:inline-block;"
                                        @blur="valideClueEnter(column, index)"
                                        @input="valideClueEnter(column, index)">
                                            <Icon style="font-size: 20px;" slot="suffix" type="search" @click="verifyEmail(colObj[column.key],true)"></Icon>
                                    </ElInputExtend>
                                    <span v-if="column.isEmpty" class="validate-input">{{column.name}}{{$t('enterClue.emptyTip')}}</span>
                                </FormItem>
                            </template>
                            <!-- whatsApp -->
                            <template v-else-if="column.key=='a10052'">
                                <FormItem
                                        :label="lang_clue[column.key]?lang_clue[column.key]:column.name"
                                        :key="column.key"
                                        :required="column.isNeed === 1">
                                    <ElInputExtend
                                            v-model="colObj[column.key]"
                                            :type="hide==true&&colObj['b'+column.key]?'password':'text'"
                                            :disabled="type === 'whatsApp' && Boolean(colObj[column.key])"
                                            :readonly="(hide==true&&colObj['b'+column.key]?true:false) && whatsAppValidation"
                                            style="width:230px;display:inline-block;"
                                            :placeholder="column.colDefaultValue"
                                            @blur="valideClueEnter(column, index)"
                                            @input="valideClueEnter(column, index)"
                                            :showWordLimit="false"
                                            :showErrorMsg="true"
                                            :errorMessage="$t('enterClue.upperLimitTip')"
                                            :maxLen="String(column.upperLimitLength)">
                                            <Icon style="font-size: 20px;" slot="suffix" type="search" @click="verifyWA(colObj[column.key],true)"></Icon>
                                    </ElInputExtend>
                                    <span class="_tailIcon">
                                        <HelpTip :title="$t('helpTip.whatsApp')"></HelpTip>
                                    </span>
                                    <span v-if="column.isEmpty" class="validate-input">{{column.name}}{{$t('enterClue.emptyTip')}}</span>
                                </FormItem>
                            </template>
                            <!-- 社交平台 -->
                            <template v-else-if="column.key == 'a10013'" class="plat-form-element">
                                <FormItem
                                    :label="lang_clue[column.key]?lang_clue[column.key]:column.name"
                                    :key="column.key"
                                    :required="column.isNeed === 1">
                                    <span class="plat-form-select" v-for="(platform, i) in socialNetworkingPlatform"
                                            :key="i">
                                        <Select
                                            v-model.trim="platform.type"
                                            v-if="column.type=='select'"
                                            filterable
                                            clearable
                                            style="width:110px;text-align:left;"
                                            :placeholder="column.colDefaultValue"
                                            @visible-change="visibleChange(column, index, $event, 'type', i)">
                                            <Option :label="item"
                                                    v-for="(item,index) in filterOption(column.option)" :key="index"
                                                    :value="item">{{item}}</Option>
                                        </Select>
                                        <Input
                                            v-model="platform.account"
                                            :placeholder="column.colDefaultValue"
                                            :class="column.isExtraLong? 'extra-long-form': ''"
                                            style="width:120px;padding-left:15px;"
                                            @blur="valideClueEnter(column, index, 'account', i)"
                                            @input="valideClueEnter(column, index, 'account', i)">
                                        </Input>
                                        <span
                                                v-if="i==0"
                                                :class="[i === 0 ? 'tailIconOnly' : 'tailIcon']"
                                                style="padding-top:7px;float:none;margin:1px 0 0 15px"
                                                @click="addPlatform(column, index)">
                                                <Icon size="15" class="custom custom-add-circle"
                                                        style="cursor:pointer;"></Icon>
                                        </span>
                                        <span v-else-if="i > 0 "
                                                class="tailIcon"
                                                style="padding-top:7px;float:none;margin:1px 0 0 15px"
                                                @click="deletePlatform(i, column, index)">
                                                <Icon  size="15" class="custom custom-reduce-circle"
                                                        style="cursor:pointer;"></Icon>
                                        </span>
                                        <!-- 最后一项的话直接显示下方提示语 -->
                                        <span v-if="platform.platFormFlagEmptyTip && (i < socialNetworkingPlatform.length-1)" class="validate-input">{{column.name}}{{platform.platFormFlagEmptyTip}}</span>
                                        <span v-else-if="platform.platFormFlagEmptyTip && (i == socialNetworkingPlatform.length-1) && !column.isExtraLong" class="validate-input">{{column.name}}{{platform.platFormFlagEmptyTip}}</span>
                                    </span>
                                    <span v-if="column.isExtraLong && !column.isEmpty" class="validate-input">{{$t('enterClue.platformExtracTip')}}{{column.upperLimitLength}}</span>
                                    <span v-else-if="column.isExtraLong && column.isEmpty" class="validate-input validate-plateform">{{$t('enterClue.platformExtracAndEmptyTip')}}{{column.upperLimitLength}}</span>
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
                                                :countryArea.sync="colObj[column.key]"
                                                :placeholder="column.colDefaultValue"
                                                inputStyle="width: 230px"
                                        ></CountryAreaSelect>
                                </FormItem>
                            </template>
                            <!-- 单选型 -->
                            <template v-else-if="column.type=='select'">
                                <FormItem
                                    :label="lang_clue[column.key]?lang_clue[column.key]:column.name"
                                    :key="column.key"
                                    :required="column.isNeed === 1">
                                    <Select
                                        v-model.trim="colObj[column.key]"
                                        filterable
                                        style="width:230px;text-align:left;"
                                        :placeholder="column.colDefaultValue"
                                        @visible-change="visibleChange(column, index, $event)">
                                        <Option :label="item"
                                                v-for="(item,index) in filterOption(column.option,column.name)" :key="index"
                                                :value="item">{{item}}
                                        </Option>
                                    </Select>
                                    <span v-if="column.isEmpty" class="validate-input">{{column.name}}{{$t('enterClue.emptyTip')}}</span>
                                </FormItem>
                            </template>
                            <!-- 多选型 -->
                            <template v-else-if="column.type=='selectMultiple'">
                                <FormItem
                                    :label="lang_clue[column.key]?lang_clue[column.key]:column.name"
                                    :key="column.key"
                                    :required="column.isNeed === 1">
                                    <Select
                                            filterable
                                            size="default"
                                            multiple
                                            v-model="colObj[column.key]"
                                            style="width:230px;"
                                            :placeholder="column.colDefaultValue?column.colDefaultValue:$t('crm.Modal.tip_select')"
                                            @remove-tag="removeTag(column, index, $event)"
                                            @visible-change="visibleChange(column, index, $event)">
                                        <Option v-for="(item,index) in filterOption(column.option,column.name)"
                                                :label="item" :key="index" :value="item">
                                            {{item}}
                                        </Option>
                                    </Select>
                                    <span v-if="column.isEmpty" class="validate-input">{{column.name}}{{$t('enterClue.emptyTip')}}</span>
                                </FormItem>
                            </template>
                            <!-- 日期时间型 -->
                            <template v-else-if="column.type === 'date+time'">
                                <FormItem
                                    :label="lang_clue[column.key]?lang_clue[column.key]:column.name"
                                    :key="column.key"
                                    :required="column.isNeed === 1">
                                    <DatePicker
                                        v-model="colObj[column.key]"
                                        type="datetime"
                                        style="width:230px;"
                                        value-format="yyyy-MM-dd HH:mm:ss"
                                        :placeholder="column.colDefaultValue"
                                        @blur="valideClueEnter(column, index)">
                                    </DatePicker>
                                    <span v-if="column.isEmpty" class="validate-input">{{column.name}}{{$t('enterClue.emptyTip')}}</span>
                                </FormItem>
                            </template>
                            <!-- 日期型 -->
                            <template v-else-if="column.type === 'date'">
                                <FormItem
                                    :label="lang_clue[column.key]?lang_clue[column.key]:column.name"
                                    :key="column.key"
                                    :required="column.isNeed === 1">
                                        <DatePicker
                                            v-model="colObj[column.key]"
                                            type="date"
                                            style="width:230px;"
                                            value-format="yyyy-MM-dd"
                                            :editable="false"
                                            :placeholder="column.colDefaultValue"
                                            @blur="valideClueEnter(column, index)">
                                        </DatePicker>
                                        <span v-if="column.isEmpty" class="validate-input">{{column.name}}{{$t('enterClue.emptyTip')}}</span>
                                </FormItem>
                            </template>
                            <!-- 文本域 -->
                            <template v-else-if="column.type=='textarea'">
                                <FormItem
                                    :label="lang_clue[column.key]?lang_clue[column.key]:column.name"
                                    :key="column.key"
                                    :required="column.isNeed === 1">
                                    <ElInputExtend
                                        type="textarea"
                                        v-model="colObj[column.key]"
                                        style="width:230px;"
                                        @blur="valideClueEnter(column, index)"
                                        @input="valideClueEnter(column, index)"
                                        :placeholder="column.colDefaultValue"
                                        :showWordLimit="true"
                                        :showErrorMsg="true"
                                        :errorMessage="$t('enterClue.upperLimitTip')"
                                        :maxLen="String(column.upperLimitLength)">
                                    </ElInputExtend>
                                    <span v-if="column.isEmpty" class="validate-input">{{column.name}}{{$t('enterClue.emptyTip')}}</span>
                                </FormItem>
                            </template>
                            <!-- 其他 -->
                            <template v-else>
                                <FormItem
                                    :label="lang_clue[column.key]?lang_clue[column.key]:column.name"
                                    :key="column.key"
                                    :required="column.isNeed === 1">
                                    <ElInputExtend
                                        v-model="colObj[column.key]"
                                        :type="hide==true&&colObj['b'+column.key]?'password':'text'"
                                        :readonly="hide==true&&colObj['b'+column.key]?true:false"
                                        style="width:230px;display:inline-block;"
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
                        </template>
                    </Form>
                </div>
            </div>
            <div slot="footer">
                <div>
                    <Button @click="cancelClue">{{$t('cancel')}}</Button>
                    <Button type="primary" @click="saveClue" :class="saveClueClass" :disabled="spinShow">{{$t('confirm')}}</Button>
                    <Button type="primary" v-if="!from && !is_marketing_station" @click="save_clue_and_inquiry" :class="saveClueAndInquiryClass" :disabled="spinShow">
                        {{$t('enterClue.saveClueAndInquiry')}}
                    </Button>
                </div>
            </div>
        </Modal>
        <!-- 是否要回传线索 -->
        <Modal
            :visible="visible_confirm_google"
            :modal-append-to-body='false'
            :show-close="false"
            width="550px"
            append-to-body
            :title="$t('enterClue.backClues')">
                <p style="text-align: center;">{{$t('enterClue.backCluesTip')}}</p>
                <div slot="footer">
                    <Button @click="cancel_confirm_google">{{$t('cancel')}}</Button>
                    <Button type="primary" @click="ok_confirm_google">{{$t('confirm')}}</Button>
                </div>
        </Modal>
        <!-- 输入自定义线索价值 -->
        <Modal
            :visible="visible_input_clueValue"
            :modal-append-to-body='false'
            :show-close="false"
            append-to-body
            :title="$t('enterClue.backCluesTip1')">
                <Form label-position="right" :label-width="150">
                    <!-- 转化操作 -->
                    <FormItem :label="$t('enterClue.clueValue')">
                        <Input v-model="clueValue" :placeholder="$t('enterClue.backCluesTip1')"
                            style="width: 230px;"></Input>
                    </FormItem>
                </Form>
                <div slot="footer">
                    <Button @click="visible_input_clueValue = false">{{$t('cancel')}}</Button>
                    <Button type="primary" @click="ok_input_clueValue">{{$t('confirm')}}</Button>
                </div>
        </Modal>
        <!-- 录入询盘 -->
        <NewCompany
            ref="newCompany"
            :visible.sync="visible_new_company"
            :directCreateCustomer.sync="directCreateCustomer"
            :clueId="clueId"
            :saleList="saleList"
            :transfer="true"
            :okEnterInquiryClass="okEnterInquiryClass"
            :type="type"
            :json_data="json_data"
            :conversationId="conversationId"
            :commentId="commentId"
            @returnUpdateStatus="returnUpdateStatus"
            @updateInquiryStatus="updateInquiryStatus">
        </NewCompany>
        <!-- 邮箱重复模态框 -->
        <!-- <Modal
            :title="$t('clue.emailOrPhoneRepeat')"
            width="550px"
            :visible="isEmailRepeat"
            :modal-append-to-body='false'
            append-to-body
            class-name="vertical-center-modal">
                <p v-html="repeatMessage"></p><br/>
                <p>{{$t('clue.continue')}}</p>
                <div slot="footer">
                    <Button @click="cancelEnter">{{$t('clue.cancel')}}</Button>
                    <Button type="primary"  @click="okEnter">{{$t('clue.confirm')}}</Button>
                </div>
        </Modal> -->
        <!-- 重复模态框 -->
        <checkRepeatModal
            v-if="isEmailRepeat"
            :title="checkRepeatModalTitle"
            :repeatData="repeatData"
            :flag="enterFlag"
            :visible.sync="isEmailRepeat"
            @okEnter="okEnter"
            @cancelEnter="cancelEnter"
        ></checkRepeatModal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import Utils from '@/utils/index';
    import NewCompany from '@/views/clue-manage/Detail/Components/Modal/newCompany';
    import checkRepeatModal from '@/views/main-components/enter-clue/Components/check-repeat-modal';
    import { mapState, mapGetters, mapActions } from 'vuex';
    import { getUpperLengthLimit } from '@/api/upperLengthLimit.js';
    import { crmClue } from '@/api/crm/index';
    import { triggerGtag } from '@/utils/base';

    export default {
        name: 'ClueModal',
        components: {
            NewCompany,
            checkRepeatModal
        },
        props: {
            createCustomer: {
                type: Boolean,
                default: false
            },
            saveClueClass: String,
            saveClueAndInquiryClass: String,
            okEnterInquiryClass: String,
            type: String,
            value: {
                type: Boolean,
                default: false
            },
            title: {
                type: String
            },
            delLoading: {
                type: Boolean,
                default: false
            },
            json_data: {
                type: Object,
                required: true,
                default() {
                    return {};
                }
            },
            feedback: { /* 是否回传 */
                type: String,
                default: ''
            },
            hide: { /* 是否隐藏联系方式 */
                type: Boolean,
                default: false
            },
            // Fb私信 传递的当前选中人的id
            conversationId: {
                type: [Number, String]
            },
            // Fb评论 传递的当前选中人的id
            commentId: {
                type: [Number, String]
            },
            // 未建档小弹窗 进来的 不显示 保存并录入询盘按钮
            from: String,
            modaltype: {
                type: String,
                default: 'default'
            }
        },
        data() {
            return {
                // 直接创建客户
                directCreateCustomer: false,

                // 原div 改为 form表单
                // enterClueForm: {},
                isEmailRepeat: false,
                tempClueField: {},
                checkRepeatModalTitle: this.$t('clue.emailOrPhoneRepeat'),
                repeatData: {
                    clueEmail: null,
                    contactEmail: null,
                    cluePhone: null,
                    contactPhone: null,
                    clueWA: null,
                    contactWA: null
                },
                enterFlag: '', // 保存标识
                emailValidation: true,
                whatsAppValidation: true,
                // 社交平台
                socialNetworkingPlatform: [
                    {
                        type: '',
                        account: ''
                    }
                ],
                wrapShow: false,
                showHead: true,
                visible: this.value,
                // 从这里开始添加录入线索的变量
                colObj: {},
                saleId: null,
                autoH: document.body.clientHeight - 300,

                savingClue: false,
                templateList: [],
                spinShow: false,

                /* 输入价值 */
                visible_confirm_google: false,
                confirm_google: false,
                clueValue: null,
                visible_input_clueValue: false,
                saveXSObj: {},
                saleList: [],


                /* 保存并新建询盘相关 */

                visible_new_company: false,
                clueId: '',
                close_popper: this.$throttle(e => {
                    if (e && e.target && e.target.parentElement.classList.contains('el-dialog__body')) {
                        // 关闭 select 下拉选框
                        const selectEl = this.$refs.currentModal.$el.querySelector('.is-focus');
                        if (selectEl) {
                            selectEl.click();
                        }
                    }
                }, 500, 500),
                customerNameList: [] // 客户类型下拉选项
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                fullName: 'fullName',
                userName: 'userName',
                userId: 'userId',
                business_state: state => state.app.business_state,
                associated_followUpStatus_list: state => state.app.associated_followUpStatus_list,
                fbLeadsUnentry: state => state.facebook.fbLeadsUnentry,
                salesList: state => state.crm.salesList,
                selectOptions: state => state.crm.selectOptions,
                showUniq: state => state.crm.showUniq,
                email_duplicate_check: (state) => state.crm.email_duplicate_check,
                is_marketing_station: state => state.app.is_marketing_station // 是否网站营销
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            // 与当前跟进状态对应的转化, 数组
            // 之前转化和跟进状态是一对一的, 但现在做了多 ads 账号绑定功能, ads 账户的转化操作跟跟进状态还是一对一, 但是不同 ads 账号可以对一个跟进状态重复创建转化操作
            related_google_conversion_list() {
                if (!this.associated_followUpStatus_list || !this.associated_followUpStatus_list.length) {
                    return [];
                }

                return this.associated_followUpStatus_list.filter(item => `${item.followupId}` === '-25');
            },
            platFormFlag() {
                return this.socialNetworkingPlatform.filter(item => {
                    item.account = item.account.trim();
                    if (item.type !== '' && item.account !== '') {
                        return {
                            type: item.type,
                            account: item.account
                        };
                    }
                });
            },
            // 线索来源类型
            targetType() {
                let result;

                switch (this.type) {
                    case 'xhl_chat':
                    case 'visitorHistory':
                    case 'webMsg':
                        // 聊天框/小屏聊天框
                        // 访客历史详情页
                        // 网站留言详情页
                        result = 1;
                        break;
                    case 'facebook':
                    case 'fb_leads':
                        // facebook leads 详情页
                        // fb_message.vue 中有 'fb_leads', 疑似已废弃
                        result = 11;
                        break;
                    case 'google':
                        // 闭环优化管理相关, 产品说可忽略
                        break;
                    case 'fb_comment':
                        // FB 评论
                        result = 12;
                        break;
                    case 'fb_chat':
                    case 'floating_fb':
                        // FB 私信
                        // FB 私信小屏
                        result = 2;
                        break;
                    default:
                        // 默认'手动创建线索', 视作直接新建线索并保存询盘
                        result = 3;
                        break;
                }

                return result;
            },
            // 线索来源的数据 id
            targetId() {
                let result;

                switch (this.type) {
                    case 'xhl_chat':
                    case 'visitorHistory':
                    case 'webMsg':
                        // 聊天框/小屏聊天框
                        // 访客历史详情页
                        // 网站留言详情页
                        result = this.json_data ? this.json_data.proj : '';
                        break;
                    case 'facebook':
                    case 'fb_leads':
                        // facebook leads 详情页
                        // fb_message.vue 中有 'fb_leads', 疑似已废弃
                        result = this.json_data ? this.json_data.leadsId : '';
                        break;
                    case 'google':
                        // 闭环优化管理相关, 产品说可忽略
                        result = '';
                        break;
                    case 'fb_comment':
                        // FB 评论
                        result = this.commentId;
                        break;
                    case 'fb_chat':
                    case 'floating_fb':
                        // FB 私信
                        // FB 私信小屏
                        result = this.conversationId;
                        break;
                    default:
                        // 默认'手动创建线索', 视作直接新建线索并保存询盘
                        result = this.clueId;
                        break;
                }

                return result;
            },
            // CRM 字段多语言
            lang_clue() {
                return {
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
                    a10056: this.$t('crm.Table.col_customerSource'),
                    clueClass: this.$t('crm.InqSet.corp_leadLevel')
                };
            },
            lang_contact() {
                return {
                    nickName: this.$t('crm.Modal.contact_nickName'),
                    jobTitle: this.$t('crm.Modal.contact_jobTitle'),
                    email: this.$t('crm.Modal.contact_email'),
                    phone: this.$t('crm.Modal.contact_phone'),
                    jobGrade: this.$t('crm.Modal.contact_jobGrade'),
                    socialNetworkingPlatform: this.$t('crm.Modal.contact_socialNetworkingPlatform'),
                    birthday: this.$t('crm.Modal.contact_birthday'),
                    gender: this.$t('crm.Modal.contact_gender'),
                    picture: this.$t('crm.Modal.contact_picture'),
                    remark: this.$t('crm.Modal.contact_remark')
                };
            },
            lang_inquiry() {
                return {
                    productCategory: this.$t('crm.Modal.inq_productCategory'),
                    demandProducts: this.$t('crm.Modal.inq_demandProducts'),
                    inquiryScore: this.$t('crm.Modal.inq_inquiryScore'),
                    label: this.$t('crm.Modal.inq_label'),
                    sourceChannel: this.$t('crm.Modal.inq_sourceChannel'),
                    sourceWay: this.$t('crm.Modal.inq_sourceWay'),
                    grouping: this.$t('crm.Modal.inq_grouping'),
                    followUp: this.$t('crm.Modal.inq_followUp'),
                    remark: this.$t('crm.Modal.inq_remark')
                };
            }
        },
        created() {},
        methods: {
            ...mapActions([
                'getVisitorReception' // 获取访客最近接待客服是否在线, 当前是否正在聊天
            ]),
            validePlatform(column, index) {
                const str = JSON.stringify(this.socialNetworkingPlatform);
                if (str.length > column.upperLimitLength) {
                    this.$set(this.templateList[index], 'isExtraLong', true);
                    return true;
                } else {
                    this.$set(this.templateList[index], 'isExtraLong', false);
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
            visibleChange(column, index, e, platFormKey, platFormIndex) {
                if (!e) {
                    this.valideClueEnter(column, index, platFormKey, platFormIndex);
                    this.$set(this.templateList[index], 'isExpand', false);
                } else {
                    this.$set(this.templateList[index], 'isEmpty', false);
                    this.$set(this.templateList[index], 'isExpand', true);
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
                if (column.key === 'a10052' && this.colObj[column.key]) {
                    this.$set(this.colObj, column.key, this.colObj[column.key].replace(/[^ `\-=[\];'\\,./~!@#$%^&*()_+{}:"|<>?！￥…（）—\d]/g, '').replace(/( )|(　)/g, ''));
                }
                if (column.key === 'a10012' && this.colObj[column.key]) {
                    // console.log(this.colObj[column.key]);
                    this.$set(this.colObj, column.key, this.colObj[column.key].replace(/( )|(　)/g, ''));
                }
                if (column.isNeed) {
                    // 社交平台处理
                    if (column.key === 'a10013') {
                        // 判断字段是否超长
                        this.validePlatform(column, index);
                        // 判断社交平台是否为空
                        if (platFormKey === 'account' && this.socialNetworkingPlatform[platFormIndex].account) {
                            this.socialNetworkingPlatform[platFormIndex].account = this.socialNetworkingPlatform[platFormIndex].account.trim();
                        }
                        // 如果是社交平台分类没有填写
                        if (platFormKey === 'type' && !this.socialNetworkingPlatform[platFormIndex].type) {
                            this.$set(this.templateList[index], 'isEmpty', true);
                            this.$set(this.socialNetworkingPlatform[platFormIndex], 'platFormFlagEmptyTip', this.$t('enterClue.platFormFlagTypeEmptyTip'));
                            return true;
                        } else if (platFormKey === 'account' && !this.socialNetworkingPlatform[platFormIndex].account) {
                            // 如果是社交平台内容没有填写
                            this.$set(this.templateList[index], 'isEmpty', true);
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
                                    this.$set(this.templateList[index], 'isEmpty', true);
                                }
                                return emptyArr;
                            } else {
                                this.$set(this.templateList[index], 'isEmpty', false);
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
                                        this.$set(this.templateList[index], 'isEmpty', true);
                                    }
                                }
                                return false;
                            }
                        }
                    } else if (column.key !== 'a10013') {
                        if (column.type === 'selectMultiple' || column.type === 'select') {
                            if (!this.colObj[column.key] || !this.colObj[column.key].length) {
                                this.$set(this.templateList[index], 'isEmpty', true);
                                return true;
                            } else {
                                this.$set(this.templateList[index], 'isEmpty', false);
                                return false;
                            }
                        } else {
                            if (!this.colObj[column.key] || (this.colObj[column.key] && !this.colObj[column.key].trim())) {
                                this.$set(this.templateList[index], 'isEmpty', true);
                                return true;
                            } else {
                                this.$set(this.templateList[index], 'isEmpty', false);
                                return false;
                            }
                        }
                    }
                } else {
                    if (column.key === 'a10013') {
                        this.validePlatform(column, index);
                    }
                }
            },

            updateInquiryStatus(clueId, status) {
                this.$emit('updateInquiryStatus', clueId, status, (this.type === 'whatsApp' || this.type === 'enterpriseWeChat' || this.type === 'smsChat') ? this.json_data.id : undefined);
                util.ajaxInternationalJson({
                    url: '/piwik/visitorInfo/updateVisitorStatus',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        originalVisitorStatus: this.json_data.crmStatus || '',
                        visitorStatus: status,
                        visitorClueId: clueId,
                        updateUserId: this.userId,
                        visitorId: this.json_data.proj
                    }
                }).then(res => res.data);
            },
            // 邮箱或手机重复模态框--确认录入
            okEnter() {
                this.isEmailRepeat = false;
                if (this.enterFlag === 'saveClue') {
                    this.handleSaveClue();
                } else if (this.enterFlag === 'save_clue_and_inquiry') {
                    this.handle_save_clue_and_inquiry();
                }
            },
            // 邮箱或手机重复模态框--取消录入
            cancelEnter() {
                this.isEmailRepeat = false;
                this.savingClue = false;
                this.spinShow = false;
            },
            // 添加社交平台单项
            addPlatform(column, index) {
                this.socialNetworkingPlatform.push({
                    type: '',
                    account: ''
                });
                if (this.templateList[index].isExtraLong) {
                    this.valideClueEnter(column, index);
                }
            },
            // 删除社交平台单项
            deletePlatform(i, column, index) {
                this.socialNetworkingPlatform.splice(i, 1);
                if (this.templateList[index].isExtraLong) {
                    this.valideClueEnter(column, index);
                }
            },

            // 自定义功能函数区域
            /** 验证邮箱 */
            verifyEmail(val, type) { /* type是是否有重复提示 */
                if (!val) {
                    return;
                }
                if (type) {
                    this.checkRepeatModalTitle = this.$t('crm.Modal.title_uniqEmail_fixed');
                    this.repeatData = {};
                }
                this.repeatData.clueEmail = null;
                this.repeatData.contactEmail = null;
                const postData = {
                    orgId: this.enterpriseId,
                    email: String(val)
                };
                return new Promise((resolve, reject) => {
                    crmClue.getSameListByEmail(postData).then(response => {
                        if (response.code === '1') {
                            const data = response.data;
                            if (!data || (!data.clue && (!data.inquiry || !data.inquiry.length))) {
                                if (type) {
                                    this.$Message.success(this.$t('enterClue.backCluesTip2'));
                                }
                                resolve(false);
                            } else {
                                if (data.clue && data.clue.length) {
                                    this.repeatData.clueEmail = data.clue;
                                }
                                if (data.inquiry && data.inquiry.length) {
                                    this.repeatData.contactEmail = data.inquiry;
                                }
                                if (type) {
                                    this.isEmailRepeat = true;
                                    this.enterFlag = 'self-test';
                                }
                                resolve(true);
                            }
                        } else {
                            resolve(false);
                        }
                    });
                });
            },

            /** 电话查重  */
            verifyPhone(value, type) {
                if (!value) {
                    return;
                }
                if (type) {
                    this.checkRepeatModalTitle = this.$t('crm.Modal.title_uniqPhone_fixed');
                    this.repeatData = {};
                }
                this.repeatData.cluePhone = null;
                this.repeatData.contactPhone = null;
                return new Promise((resolve, reject) => {
                    crmClue.getSameListByPhone({
                        orgId: this.enterpriseId,
                        phone: value
                    }).then((res) => {
                        if (res.code === '1') {
                            const data = res.data;
                            // 如果没有list的话，说明没有重复电话
                            if (!data || (!data.clue && !data.inquiry)) {
                                if (type) {
                                    this.$Message.success(this.$t('clue.no_repeat'));
                                }
                                resolve(false);
                            } else {
                                if (data.clue && data.clue.length) {
                                    this.repeatData.cluePhone = data.clue;
                                }
                                if (data.inquiry && data.inquiry.length) {
                                    this.repeatData.contactPhone = data.inquiry;
                                }
                                if (type) {
                                    this.isEmailRepeat = true;
                                    this.enterFlag = 'self-test';
                                }
                                resolve(true);
                            }
                        } else {
                            resolve(false);
                        }
                    });
                });
            },
            /** WhatsApp查重  */
            verifyWA(value, type) {
                if (!value) {
                    return;
                }
                if (type) {
                    this.checkRepeatModalTitle = this.$t('crm.Modal.title_uniqWhatsApp_fixed');
                    this.repeatData = {};
                }
                this.repeatData.clueWA = null;
                this.repeatData.contactWA = null;
                return new Promise((resolve, reject) => {
                    crmClue.getSameListByWhatsapp({
                        orgId: this.enterpriseId,
                        whatsapp: value
                    }).then((res) => {
                        if (res.code === '1') {
                            const data = res.data;
                            // 如果没有list的话，说明没有重复电话
                            if (!data || (!data.clue && !data.inquiry)) {
                                if (type) {
                                    this.$Message.success(this.$t('clue.no_repeat'));
                                }
                                resolve(false);
                            } else {
                                if (data.clue && data.clue.length) {
                                    this.repeatData.clueWA = data.clue;
                                }
                                if (data.inquiry && data.inquiry.length) {
                                    this.repeatData.contactWA = data.inquiry;
                                }
                                if (type) {
                                    this.isEmailRepeat = true;
                                    this.enterFlag = 'self-test';
                                }
                                resolve(true);
                            }
                        } else {
                            resolve(false);
                        }
                    });
                });
            },
            /** 获取线索字段 */
            getTemplateList() {
                this.templateList = [];
                this.spinShow = true;
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        type: 1,
                        userId: this.userId
                    }
                }).then(async res => {
                    if (res.data.code === '1') {
                        const showList = res.data.data.show;
                        // 调接口获取输入框长度上限
                        const resData = await getUpperLengthLimit({ serviceFlag: 'save_clue', orgId: this.enterpriseId });
                        for (const key in showList) {
                            const obj = showList[key];
                            obj.key = key;
                            // 遍历给字段增加最大长度限制
                            if (resData.code === '1') {
                                Object.keys(resData.data).forEach(keys => {
                                    if (obj.key === keys) {
                                        // 新增线索时 先按 upperLimitLength 字段 设置最大长度
                                        // if (resData.data[keys].typeLength) {
                                        //     let temp = '';
                                        //     if (obj.type === 'textarea') {
                                        //         temp = JSON.parse(resData.data[keys].typeLength).textarea;
                                        //     } else {
                                        //         temp = JSON.parse(resData.data[keys].typeLength).text;
                                        //     }
                                        //     obj.upperLimitLength = temp;
                                        // } else {
                                        // 产品需求 客户、联系人、询盘 的 a10040字段长度为4000，线索统一为300
                                        if (resData.data[keys].parentField && resData.data[keys].parentField === 'a10040') {
                                            obj.upperLimitLength = 300;
                                        } else {
                                            obj.upperLimitLength = resData.data[keys].usableLength;
                                        }
                                        // }
                                    }
                                });
                            }
                            obj.isNeed = showList[key].isNeed;
                            this.templateList.push(obj);
                            // columnList.push({
                            //     title : showList[key].name,
                            //     key : key,
                            //     minWidth:120
                            // })
                        }
                        this.handleMultiple();
                    }
                });
            },
            // 处理多选字段
            handleMultiple() {
                const multipleArr = this.templateList.filter(item => {
                    return item.type === 'selectMultiple';
                });
                multipleArr.forEach(element => {
                    if (typeof (this.colObj[element.key]) === 'string') {
                        // this.colObj.$set(element.key, this.colObj[element.key].split(','));
                        this.$set(this.colObj, element.key, this.colObj[element.key] ? this.colObj[element.key].split(',') : []);
                    } else {
                        if (element.type === 'selectMultiple') {
                            // this.colObj.$set(element.key, []);
                            this.$set(this.colObj, element.key, []);
                        }
                    }
                    // this.colObj[element.key] = this.colObj[element.key] && typeof (this.colObj[element.key]) === 'string' ? this.colObj[element.key].split(',') : [];
                });
                this.spinShow = false;
            },
            setSaleList() {
                this.saleList = this.$deepClone(this.salesList);
                this.saleList.push({
                    id: -1,
                    fullname: this.$t('chat.highSeas')
                });
                const result = this.saleList.some((item) => {
                    return item.id == this.userId;
                });
                if (result) {
                    this.saleId = Number(this.userId);
                }
                if (this.modaltype === 'hightseas') {
                    this.saleId = -1;
                }
            },
            /** 通过source获取来源方式对应值 */
            getSourceWay(source) {
                switch (source) {
                    case 2:
                        // return this.$t('website.title');
                        return '网站留言';
                    case 4:
                        // return this.$t('clue.web_conversation');
                        return '网站对话';
                    case 5:
                        return 'Facebook Leads';
                    case 6:
                        // return this.$t('clue.fb_msg');
                        return 'Facebook 私信';
                    case 7:
                        // return this.$t('clue.fb_comment');
                        return 'Facebook 评论';
                    case 9:
                        // return this.$t('clue.data_import');
                        return '数据导入';
                    // case 11:
                    //     return '企微创建';
                    case 3:
                    default:
                        // return this.$t('clue.direct_create');
                        return '直接创建';
                }
            },

            /* 保存线索并新建询盘 */
            async save_clue_and_inquiry() {
                // "保存中", 退出流程
                if (this.savingClue === true) {
                    return;
                }

                // "保存中" flag 置为 true
                this.savingClue = true;

                // 未选中销售人员, 退出流程
                if (!this.saleId) {
                    this.$Message.error(this.$t('clue.select_sales'));
                    this.savingClue = false;
                    return false;
                }

                // 遍历数据检测是否有未填写的必填选项
                if (this.templateList.some((item, index) => this.valideClueEnter(item, index))) {
                    this.$Message.error(this.$t('enterClue.requireEmptyTip'));
                    this.savingClue = false;
                    return false;
                }

                // 遍历数据检测是否有超长数据
                const overLengthField = this.templateList.find(item => {
                    const { key, upperLimitLength } = item;
                    if (key === 'a10013') {
                        if (JSON.stringify(this.socialNetworkingPlatform).length > upperLimitLength) {
                            return item;
                        }
                    } else if (this.colObj[key] && this.colObj[key].length > upperLimitLength) {
                        return item;
                    }
                });
                if (overLengthField) {
                    if (overLengthField.name) {
                        this.$Message.error(`${overLengthField.name} ${this.$t('crm.fieldLimit.error_overLength')}`);
                    } else {
                        this.$Message.error(`${overLengthField.name} ${this.$t('enterClue.isExtraLongTip')}`);
                    }
                    this.savingClue = false;
                    return false;
                }

                // 正则校验邮箱格式
                const emailReg = Utils.regExp.fullEmail;
                if (this.colObj.a10010 && !emailReg.test(this.colObj.a10010.trim())) {
                    this.$Message.error(this.$t('portal_set.format_wrong'));
                    this.emailValidation = false;
                    this.$delete(this.colObj, 'ba10010');
                    this.savingClue = false;
                    return false;
                }
                // 正则校验 WhatsApp 格式
                const whatsAppReg = Utils.regExp.whatsApp;
                if (this.colObj.a10052 && !whatsAppReg.test(this.colObj.a10052.replace(/\s/g, ''))) {
                    this.$Message.error(this.$t('enterClue.whatsAppFormErro'));
                    this.whatsAppValidation = false;
                    this.$delete(this.colObj, 'ba10052');
                    this.savingClue = false;
                    return false;
                }

                // 邮箱/电话查重 + 处理录入数据
                let retEmail = ''; /* 邮箱查重结果 */
                let retPhone = ''; /* 电话查重结果 */
                let retWa = ''; /* WA查重结果 */
                this.repeatData = {};
                const temp = {}; // 暂存已录入的线索字段
                // 涉及到接口请求了, loading 置为 true
                this.spinShow = true;
                for (const item of this.templateList) {
                    this.checkRepeatModalTitle = this.$t('clue.emailOrPhoneRepeat');
                    // 邮箱查重校验
                    if (item.key === 'a10010' && this.colObj[item.key]) {
                        this.colObj[item.key] = this.colObj[item.key].trim();
                        // 校验该企业是否需要邮箱查重
                        if (this.email_duplicate_check) {
                            retEmail = await this.verifyEmail(this.colObj[item.key], false);
                        }
                    }

                    // 电话查重校验 & 处理电话中间的空格
                    if (item.key === 'a10012' && this.colObj[item.key]) {
                        retPhone = await this.verifyPhone(this.colObj[item.key], false);
                    }
                    // Wa查重校验 & 处理WhatsApp中间的空格
                    if (item.key === 'a10052' && this.colObj[item.key]) {
                        if (this.showUniq.whatsapp === '1') {
                            retWa = await this.verifyWA(this.colObj[item.key], false);
                        }
                    }
                    // 数据格式化后加入到 temp
                    if (item.key === 'a10013') {
                        // 社交平台 JSON 格式化
                        temp[item.key] = JSON.stringify(this.platFormFlag);
                    } else if (item.type === 'selectMultiple') {
                        // 多选字段 JSON 格式化
                        temp[item.key] = JSON.stringify(this.colObj[item.key]);
                    } else {
                        // 其它字段去前后空格
                        temp[item.key] = this.colObj[item.key] ? this.colObj[item.key].trim() : this.colObj[item.key];
                    }
                }

                // 暂存录入数据
                this.tempClueField = temp;

                if (retEmail || retPhone || retWa) {
                    this.checkRepeatModalTitle = this.$t('clue.emailOrPhoneRepeat');
                    // 有重复, 弹出提示框提醒用户
                    this.isEmailRepeat = true;
                    this.enterFlag = 'save_clue_and_inquiry';
                } else {
                    // 无重复, 进入下一步流程
                    this.handle_save_clue_and_inquiry();
                }
            },
            // 在用户输入的数据基础上, 处理数据并附加其他接口需要的数据
            async handle_save_clue_and_inquiry() {
                // 取之前录入流程中处理后的用户输入数据
                const temp = this.tempClueField;

                // 获取选中销售名称, 保存接口要用
                let saleName = '';
                if (this.saleId == -1) {
                    saleName = this.$t('clue.public_sea');
                } else {
                    this.saleList.some(item => {
                        if (item.id == this.saleId) {
                            saleName = item.fullname;
                            return true;
                        }
                    });
                }

                // 合成用户输入的数据对象和接口所需的其他数据
                const jsonData = Object.assign({
                    templateId: this.json_data.templateId,
                    orgId: this.json_data.enterpriseId,
                    partSys: this.json_data.partSys,
                    createUserId: this.userId,
                    createUser: this.fullName,
                    sourceUrl: this.json_data.sourceUrl,
                    proj: this.json_data.proj ? this.json_data.proj : this.json_data.seqNumber,
                    sourceId: this.json_data.id,
                    sourceName: this.json_data.sourceName,
                    serviceName: this.json_data.serviceName,
                    serviceId: this.json_data.serviceId,
                    source: this.json_data.source,
                    leadsId: this.json_data.leadsId,
                    adId: this.json_data.adId,
                    leadsSubmitTime: this.json_data.leadsSubmitTime,
                    saleId: this.saleId,
                    saleName: saleName,
                    visitorId: this.json_data.visitorId,
                    visitId: this.json_data.idvisit
                }, temp);

                // 请求 gclid 相关数据
                let gclid = '';
                let gclidCreateTime = '';
                if (this.json_data.proj) {
                    const res_gclid = await util.ajaxInternational({
                        url: '/visitortrace/getGoogleAdsInfo',
                        method: 'get',
                        params: {
                            visitorId: this.json_data.proj
                        }
                    });
                    if (res_gclid.data.data) {
                        gclid = res_gclid.data.data.gclid;
                        gclidCreateTime = this.$options.filters.timeFormat(new Date(res_gclid.data.data.create_time), 'yyyy-MM-dd hh:mm:ss');
                    }
                }

                // 相较于直接保存线索, 这里去掉了 Google 回传的相关部分
                // 暂存要发送的保存线索接口数据
                this.saveXSObj = {
                    jsonData, gclid, gclidCreateTime
                };

                // 新增客户弹窗的数据 都由新增组件请求加载，无需再次调用
                // 所有新建询盘需要请求的东西都请求成功了, 再保存线索并跳转到新建询盘 Modal
                // await util.axios.all([this.get_corp_columns_authorized(), this.get_inquiry_columns_authorized(), this.get_contact_columns_authorized(), this.getSelectOptions()]).then(util.axios.spread((...responses) => {
                //     if (responses.some(item => !item)) {
                //         this.savingClue = false;
                //         this.spinShow = false;
                //     } else {
                this.saveXS_inq();
                //     }
                // }));
            },
            /* 保存线索 */
            async saveClue() {
                // "保存中", 退出流程
                if (this.savingClue === true) {
                    return;
                }

                // "保存中" flag 置为 true
                this.savingClue = true;

                // 未选中销售人员, 退出流程
                if (!this.saleId) {
                    this.$Message.error(this.$t('clue.select_sales'));
                    this.savingClue = false;
                    return false;
                }

                // 遍历数据检测是否有未填写的必填选项
                if (this.templateList.some((item, index) => this.valideClueEnter(item, index))) {
                    this.$Message.error(this.$t('enterClue.requireEmptyTip'));
                    this.savingClue = false;
                    return false;
                }

                // 遍历数据检测是否有超长数据
                const overLengthField = this.templateList.find(item => {
                    const { key, upperLimitLength } = item;
                    if (key === 'a10013') {
                        if (JSON.stringify(this.socialNetworkingPlatform).length > upperLimitLength) {
                            return item;
                        }
                    } else if (this.colObj[key] && this.colObj[key].length > upperLimitLength) {
                        return item;
                    }
                });
                if (overLengthField) {
                    if (overLengthField.name) {
                        this.$Message.error(`${overLengthField.name} ${this.$t('crm.fieldLimit.error_overLength')}`);
                    } else {
                        this.$Message.error(`${overLengthField.name} ${this.$t('enterClue.isExtraLongTip')}`);
                    }
                    this.savingClue = false;
                    return false;
                }

                // 正则校验邮箱格式
                const emailReg = Utils.regExp.fullEmail;
                if (this.colObj.a10010 && !emailReg.test(this.colObj.a10010.trim())) {
                    this.$Message.error(this.$t('portal_set.format_wrong'));
                    this.emailValidation = false;
                    this.$delete(this.colObj, 'ba10010');
                    this.savingClue = false;
                    return false;
                }
                // 正则校验 WhatsApp 格式
                const whatsAppReg = Utils.regExp.whatsApp;
                if (this.colObj.a10052 && !whatsAppReg.test(this.colObj.a10052.replace(/\s/g, ''))) {
                    this.$Message.error(this.$t('enterClue.whatsAppFormErro'));
                    this.whatsAppValidation = false;
                    this.$delete(this.colObj, 'ba10052');
                    this.savingClue = false;
                    return false;
                }

                // 邮箱/电话查重 + 处理录入数据
                let retEmail = ''; /* 邮箱查重结果 */
                let retPhone = ''; /* 电话查重结果 */
                let retWa = ''; /* WA查重结果 */
                this.repeatData = {};
                const temp = {}; // 暂存已录入的线索字段
                // 涉及到接口请求了, loading 置为 true
                this.spinShow = true;
                for (const item of this.templateList) {
                    // 邮箱查重校验
                    if (item.key === 'a10010' && this.colObj[item.key]) {
                        this.colObj[item.key] = this.colObj[item.key].trim();
                        // 校验该企业是否需要邮箱查重
                        if (this.email_duplicate_check) {
                            retEmail = await this.verifyEmail(this.colObj[item.key], false);
                        }
                    }

                    // 电话查重校验
                    if (item.key === 'a10012' && this.colObj[item.key]) {
                        retPhone = await this.verifyPhone(this.colObj[item.key], false);
                    }

                    // wa查重校验
                    if (item.key === 'a10052' && this.colObj[item.key]) {
                        // if (this.showUniq.whatsapp === '1') {
                        retWa = await this.verifyWA(this.colObj[item.key], false);
                        // }
                    }

                    // 数据格式化后加入到 temp
                    if (item.key === 'a10013') {
                        // 社交平台 JSON 格式化
                        temp[item.key] = JSON.stringify(this.platFormFlag);
                    } else if (item.type === 'selectMultiple') {
                        // 多选字段 JSON 格式化
                        temp[item.key] = JSON.stringify(this.colObj[item.key]);
                    } else {
                        // 其它字段去前后空格
                        temp[item.key] = this.colObj[item.key] ? this.colObj[item.key].trim() : this.colObj[item.key];
                    }
                }

                // 暂存录入数据
                this.tempClueField = temp;

                if (retEmail || retPhone || retWa) {
                    this.checkRepeatModalTitle = this.$t('clue.emailOrPhoneRepeat');
                    // 有重复, 弹出提示框提醒用户
                    this.isEmailRepeat = true;
                    this.enterFlag = 'saveClue';
                } else {
                    // 无重复, 进入下一步流程
                    this.handleSaveClue();
                }
            },
            // 在用户输入的数据基础上, 处理数据并附加其他接口需要的数据
            async handleSaveClue() {
                // 取之前录入流程中处理后的用户输入数据
                const temp = this.tempClueField;

                // 获取选中销售名称, 保存接口要用
                let saleName = '';
                if (this.saleId == -1) {
                    saleName = this.$t('clue.public_sea');
                } else {
                    this.saleList.some(item => {
                        if (item.id == this.saleId) {
                            saleName = item.fullname;
                            return true;
                        }
                    });
                }

                // 合成用户输入的数据对象和接口所需的其他数据
                const jsonData = Object.assign({
                    templateId: this.json_data.templateId,
                    orgId: this.json_data.enterpriseId,
                    partSys: this.json_data.partSys,
                    createUserId: this.userId,
                    createUser: this.fullName,
                    sourceUrl: this.json_data.sourceUrl,
                    proj: this.json_data.proj ? this.json_data.proj : this.json_data.seqNumber,
                    sourceId: this.json_data.id,
                    sourceName: this.json_data.sourceName,
                    serviceName: this.json_data.serviceName,
                    serviceId: this.json_data.serviceId,
                    source: this.json_data.source,
                    leadsId: this.json_data.leadsId,
                    adId: this.json_data.adId,
                    leadsSubmitTime: this.json_data.leadsSubmitTime,
                    saleId: this.saleId,
                    saleName: saleName,
                    visitorId: this.json_data.visitorId,
                    visitId: this.json_data.idvisit
                }, temp);

                // 请求 gclid 相关数据
                let gclid = '';
                let gclidCreateTime = '';
                if (this.json_data.proj) {
                    const res_gclid = await util.ajaxInternational({
                        url: '/visitortrace/getGoogleAdsInfo',
                        method: 'get',
                        params: {
                            visitorId: this.json_data.proj
                        }
                    });
                    if (res_gclid.data.data) {
                        gclid = res_gclid.data.data.gclid;
                        gclidCreateTime = this.$options.filters.timeFormat(new Date(res_gclid.data.data.create_time), 'yyyy-MM-dd hh:mm:ss');
                    }
                }

                // 如果有 gclid 且有与跟进状态相关的转化, 退出流程并打开确认回传提醒框
                if (gclid && this.related_google_conversion_list.length) {
                    this.savingClue = false;
                    this.spinShow = false;
                    this.visible_confirm_google = true;
                }

                // 暂存要发送的保存线索接口数据
                this.saveXSObj = {
                    jsonData, gclid, gclidCreateTime
                };

                // 如果没有弹出确认提示框, 说明可以直接保存线索
                if (!this.visible_confirm_google) {
                    this.saveXS();
                }
            },

            // 确认要回传, 则关闭确认回传提醒框, 并判断是否需要弹出手动输入价值框, 不需要则保存线索
            ok_confirm_google() {
                this.visible_confirm_google = false;
                this.confirm_google = true;

                // 暂存"第一个需要输入价值的转化操作"的默认价值
                let defaultValue = null;
                if (this.related_google_conversion_list.length && this.related_google_conversion_list.some(item => {
                    if (`${item.useRevenueValue}` === '2') {
                        defaultValue = item.defaultRevenueValue;
                        return true;
                    }
                })) {
                    this.visible_input_clueValue = true;
                    this.clueValue = defaultValue;
                } else {
                    this.saveXS();
                }
            },
            // 确定不回传, 关闭提醒框, 保存线索
            cancel_confirm_google() {
                this.visible_confirm_google = false;
                this.confirm_google = false;
                this.$Message.success(this.$t('googleOptimize.clueSubmitManualBack'));
                this.saveXS();
            },
            // 手动输入线索价值完成, 判断输入是否为合法正数, 不是则弹出提醒, 是则关闭弹框并保存线索
            ok_input_clueValue() {
                if (/^(\d+)(\.\d+)?$/.test(this.clueValue)) {
                    this.visible_input_clueValue = false;
                    this.saveXS();
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_valueFormatError'));
                }
            },
            async saveXS() {
                /**
                 * @Description: 从聊天录入时, 发送请求前判断当前访客是否能被当前用户更改信息
                 * @author 汤一飞
                 * @date 2020/5/12
                */
                if (this.type === 'xhl_chat') {
                    if (!await this.getVisitorReception(this.json_data.proj)) {
                        this.savingClue = false;
                        this.spinShow = false;
                        return;
                    }
                }

                // 为防止中途有弹窗中断过保存线索流程, 先置 savingClue 为 true
                this.savingClue = true;
                // 从暂存对象中取出数据
                const { jsonData, gclid, gclidCreateTime } = this.saveXSObj;
                // 暂存线索价值, 之后重置线索价值为 null
                const clueValue = this.clueValue;
                this.clueValue = null;

                // 原发送请求部分
                triggerGtag('CRM', '线索');
                util.ajax({
                    url: '/form-cust/clue/save',
                    method: 'post',
                    data: jsonData
                }).then(async response => {
                    if (response.data.code === '1') {
                        // 手动关联
                        this.linkClue(response.data.data);

                        if (jsonData.a10010) {
                            this.updateCrmFlag(jsonData.a10010);
                        }
                        if (gclid) {
                            if (this.related_google_conversion_list.length) {
                                this.update_google_status({
                                    clueId: response.data.data,
                                    gclid,
                                    gclidCreateTime,
                                    visitorId: jsonData.proj,
                                    clueValue
                                });
                            } else {
                                this.update_google_status_manually({
                                    clueId: response.data.data,
                                    gclid,
                                    gclidCreateTime,
                                    visitorId: jsonData.proj
                                });
                            }
                        }
                        // 如果有 gclid 且有与当前跟进状态对应的转化, 则触发回传操作
                        if (['webMsg', 'facebook', 'fb_chat', 'fb_comment', 'floating_fb'].includes(this.type)) {
                            this.$emit('returnLeadsId', response.data.data, 101);
                        } else if (['mail', 'mail_detail'].includes(this.type)) {
                            this.$emit('returnLeadsId', response.data.data, 5);
                        } else if (this.type === 'whatsApp' || this.type === 'enterpriseWeChat' || this.type === 'smsChat') {
                            this.$emit('returnLeadsId', response.data.data, 2, this.json_data.id);
                            // 更新cinnox昵称
                            if (this.type === 'smsChat') {
                                console.error('jsonData', jsonData);
                                this.$store.commit('setSmsNickName', { nickName: jsonData.a1009 });
                            }
                        } else if (this.type === 'visitorHistory' || this.type === 'xhl_chat') {
                            this.$emit('returnLeadsId', response.data.data, 2);
                        }

                        if (this.json_data.proj) {
                            this.changeVHStatus(jsonData.proj, '2', response.data.data);
                        }
                        this.$Message.success(this.$t('clue.add_leads_success'));
                        this.saleId = '';
                        // 清空社交平台
                        this.socialNetworkingPlatform = [{ type: '', account: '' }];

                        this.invoking(jsonData, response.data.data);
                        this.colObj = {};
                        /* 判断录入的来源是FB Leads，则录入成功后将未录入数减1 */
                        if (jsonData.source === 5) {
                            this.$store.commit('setFbLeadsUnentry', this.fbLeadsUnentry - 1);
                        }
                        /* 判断录入的来源是网站留言，则录入成功后将未录入数减1 */
                        if (jsonData.source === 2) {
                            if (this.isContainsMenu('website_message')) {
                                // 只在有网站留言目录时才需要更新 formList 给 Main.vue 用
                                this.$store.dispatch('website_msg/getFormList');
                            }
                        }
                        this.$emit('open_close', {
                            close: false,
                            Status: 101,
                            clueId: response.data.data
                        });
                    } else if (response.data.code === '0' && response.data.data === -7) {
                        // 该邮箱为企业同事邮箱，不可录入
                        this.$Message.error(this.$t('crm.Modal.error_enterpriseColleagueMail'));
                    } else {
                        this.$Message.error(this.$t('clue.add_leads_failed'));
                    }
                    this.isEmailRepeat = false;
                    this.emailValidation = true;
                    this.savingClue = false;
                    this.spinShow = false;
                });
            },
            async saveXS_inq() {
                /**
                 * @Description: 从聊天录入时, 发送请求前判断当前访客是否能被当前用户更改信息
                 * @author 汤一飞
                 * @date 2020/5/12
                 */
                if (this.type === 'xhl_chat') {
                    if (!await this.getVisitorReception(this.json_data.proj)) {
                        this.savingClue = false;
                        this.spinShow = false;
                        return;
                    }
                }

                // 为防止中途有弹窗中断过保存线索流程, 先置 savingClue 为 true
                this.savingClue = true;
                // 从暂存对象中取出数据
                const { jsonData, gclid, gclidCreateTime } = this.saveXSObj;

                // 原发送请求部分
                triggerGtag('CRM', '线索');
                util.ajax({
                    url: '/form-cust/clue/save',
                    method: 'post',
                    data: jsonData
                }).then(async response => {
                    if (response.data.code === '1') {
                        // 手动关联
                        this.linkClue(response.data.data);

                        if (jsonData.a10010) {
                            this.updateCrmFlag(jsonData.a10010);
                        }
                        if (gclid) {
                            this.update_google_status_manually({
                                clueId: response.data.data,
                                gclid,
                                gclidCreateTime,
                                visitorId: jsonData.proj
                            });
                        }

                        if (['webMsg', 'facebook', 'fb_chat', 'fb_comment', 'floating_fb'].includes(this.type)) {
                            this.$emit('returnLeadsId', response.data.data, 101);
                        } else if (['mail', 'mail_detail'].includes(this.type)) {
                            this.$emit('returnLeadsId', response.data.data, 5);
                        } else if (this.type === 'whatsApp' || this.type === 'enterpriseWeChat' || this.type === 'smsChat') {
                            this.$emit('returnLeadsId', response.data.data, 2, this.json_data.id);
                        } else if (this.type === 'visitorHistory' || this.type === 'xhl_chat') {
                            this.$emit('returnLeadsId', response.data.data, 2);
                        }

                        if (this.json_data.proj) {
                            this.changeVHStatus(jsonData.proj, '2', response.data.data);
                        }
                        this.$Message.success(this.$t('clue.add_leads_success'));
                        this.invoking(jsonData, response.data.data);
                        this.colObj = {};

                        /* 保存询盘部分 */
                        this.clueId = response.data.data;
                        this.visible_new_company = true;
                        /* 判断录入的来源是FB Leads，则录入成功后将未录入数减1 */
                        if (jsonData.source === 5) {
                            this.$store.commit('setFbLeadsUnentry', this.fbLeadsUnentry - 1);
                        }
                        /* 判断录入的来源是网站留言，则录入成功后将未录入数减1 */
                        if (jsonData.source === 2) {
                            if (this.isContainsMenu('website_message')) {
                                // 只在有网站留言目录时才需要更新 formList 给 Main.vue 用
                                this.$store.dispatch('website_msg/getFormList');
                            }
                        }
                    } else if (response.data.code === '0' && response.data.data === -7) {
                        // 该邮箱为企业同事邮箱，不可录入
                        this.$Message.error(this.$t('crm.Modal.error_enterpriseColleagueMail'));
                    } else {
                        this.$Message.error(this.$t('clue.add_leads_failed'));
                    }
                    this.isEmailRepeat = false;
                    this.emailValidation = true;
                    this.savingClue = false;
                    this.spinShow = false;
                });
            },
            // 录入线索时手动关联
            linkClue(clueId) {
                if (clueId && this.targetType && this.targetId && this.targetType !== 3) {
                    util.ajaxJson({
                        url: '/crm/contactsAssociate/related',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            clueId,
                            targetType: this.targetType,
                            targetId: this.targetId,
                            formId: this.type === 'webMsg' ? this.json_data.id : ''
                        }
                    });
                }
            },
            /* 更新邮件里小人头状态 */
            updateCrmFlag(email) {
                if (email) {
                    util.ajaxMail({
                        url: '/mail/mailBoxs/updateCrmFlagNew',
                        method: 'post',
                        timeout: 360000,
                        data: {
                            address: email,
                            createUserId: this.userId,
                            orgId: this.enterpriseId
                        }
                    });
                }
            },
            /* 系统通知 relationObjType;关联对象类型：1线索，2询盘，3客户，4跟进状态 */
            // effectActionType;生效机制：1创建，2编辑，3转移，4分享
            invoking(data, id) {
                const orgId = Number(data.orgId);
                const jsonData = {
                    orgId,
                    fullname: this.fullName,
                    relationObjType: 1,
                    effectActionType: 1,
                    fcolumnValue: { id }
                };
                util.ajaxJson({
                    url: '/rule/message/invoking',
                    method: 'post',
                    data: jsonData
                }).then(res => {
                    if (res.data.code == 1) {
                        const remindList = res.data.data;
                        remindList.map(async item => {
                            let userIds = [];
                            if (item.recipientType == 1) {
                                item.recipientList.map(element => {
                                    switch (element) {
                                        case '1':
                                            if (data.saleId) {
                                                userIds.push(`${data.saleId}`);
                                            }
                                            break;
                                        // case '2':
                                        //     if(data.serviceId){
                                        //         let id = await this.getuserId(data.serviceId)
                                        //         if(id.data.code){
                                        //             userIds.push(id.data.data+'')
                                        //             console.log(userIds)
                                        //         }
                                        //     }
                                        //     break
                                        case '3':
                                            if (data.createUserId) {
                                                userIds.push(`${data.createUserId}`);
                                            }
                                            break;
                                    }
                                });
                                if (item.recipientList.indexOf('2') != -1) {
                                    if (data.serviceId) {
                                        const id = await this.getuserId(data.serviceId);
                                        if (id.data.code) {
                                            userIds.push(`${id.data.data}`);
                                        }
                                    }
                                }
                            } else {
                                userIds = item.recipientList;
                            }
                            if (userIds.length > 0) {
                                this.saveRemind(userIds, item.remindContent, jsonData);
                            }
                        });
                    }
                });
            },
            getuserId(accId) {
                return util.ajax({
                    url: 'new-privilege/user/getUserIdByAccId',
                    method: 'get',
                    params: {
                        accId
                    }
                });
            },
            sendMessage(userIds, text, jsonData) {
                userIds = [...new Set(userIds)];
                const postData = Object.assign({
                    userIds,
                    text,
                    messageType: 'systemNotice'
                }, jsonData);

                this.$store.dispatch('sendWSMsg', postData);
            },
            saveRemind(userIdList, remindContent, jsonData) {
                userIdList = [...new Set(userIdList)];
                userIdList = userIdList.filter(item => {
                    return item != this.userId;
                });
                const postData = {
                    userIdList,
                    orgId: this.enterpriseId,
                    remindContent,
                    relationObjType: 1,
                    seqId: jsonData.fcolumnValue.id
                };
                util.ajaxJson({
                    url: '/new-privilege/msgRemind/save',
                    method: 'post',
                    data: postData
                }).then(res => {
                    if (res.data.code == 1) {
                        this.sendMessage(userIdList, remindContent, jsonData);
                    }
                });
            },
            /* 访客历史改变状态 */
            changeVHStatus(visitorId, crmStatus, crmTargetId) {
                // if(this.json_data.piwikFlag) {
                util.ajaxInternationalJson({
                    url: '/piwik/visitorInfo/updateVisitorStatus',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        originalVisitorStatus: this.json_data.crmStatus || '',
                        visitorStatus: crmStatus,
                        visitorClueId: crmTargetId,
                        updateUserId: this.userId,
                        visitorId
                    }
                }).then(res => res.data);
                // } else {
                // util.ajaxInternational({
                //     url:'/server/updateVisitorCrmInfo',
                //     method:'post',
                //     data:{
                //         visitorId,
                //         crmStatus,
                //         crmTargetId,
                //         sourceCrmStatus:this.json_data.crmStatus || ""
                //     }
                // }).then(res=>{
                //     if(res.data.code==1){
                //     }
                // })
                // }
            },
            // 保存线索录入询盘后 又更新了一次访客状态
            returnUpdateStatus(clueId, status) {
                this.$emit('returnLeadsId', clueId, status);
                if (this.json_data.proj) {
                    util.ajaxInternationalJson({
                        url: '/piwik/visitorInfo/updateVisitorStatus',
                        method: 'POST',
                        data: {
                            orgId: this.enterpriseId,
                            originalVisitorStatus: this.json_data.crmStatus || '',
                            visitorStatus: status,
                            visitorClueId: clueId,
                            updateUserId: this.userId,
                            visitorId: this.json_data.proj
                        }
                    }).then(res => res.data);
                }
            },
            /** 关闭模态框之后 重新恢复初值 */
            emptyData() {
                this.savingClue = false;
                this.spinShow = false;
                this.saleId = '';
                this.colObj = {};
                this.socialNetworkingPlatform = [
                    {
                        type: '',
                        account: ''
                    }
                ];
            },
            close() {
                this.$emit('on_cancle_clue', {
                    close: false
                });
            },
            cancelClue() {
                this.$emit('on_cancle_clue', {
                    close: false
                });
                // 清空社交平台
                this.socialNetworkingPlatform = [{ type: '', account: '' }];
                this.savingClue = false;
                this.spinShow = false;
                this.saleId = '';
                this.colObj = {};
            },
            filterOption(option, name) {
                let arr = [];
                arr = option.split('?');
                for (const key in this.selectOptions) {
                    const name_inquiry = this.lang_inquiry[key];
                    const name_contact = this.lang_contact[key];
                    if (name != undefined && (name_inquiry != undefined && name_inquiry == name) || (name_contact != undefined && name_contact == name)) {
                        this.selectOptions[key].forEach(options => {
                            if (options.isAvailable == 0) {
                                const delIndex = arr.findIndex(item => {
                                    return item == String(options.attrName);
                                });
                                if (delIndex != -1) {
                                    arr.splice(delIndex, 1);
                                }
                            }
                        });
                    }
                }
                return arr;
            },

            // 回传 google
            update_google_status(obj) {
                // 如果当前跟进状态有对应的转化
                if (this.related_google_conversion_list.length) {
                    // 数据处理
                    const dataList = this.related_google_conversion_list.map(item => {
                        // 定义线索价值
                        let value = 0;
                        // 如果转化要求使用自定义价值, 则把填入之前输入的线索价值
                        if (`${item.useRevenueValue}` === '2') {
                            value = obj.clueValue;
                            // 如果转化要求使用默认价值, 则把填入转化定义时的默认价值
                        } else if (`${item.useRevenueValue}` === '1') {
                            value = item.defaultRevenueValue;
                        }

                        return {
                            orgId: this.enterpriseId, //
                            clueId: obj.clueId, // 线索id，必传
                            visitorId: obj.visitorId, // 访客id
                            gclid: obj.gclid, // gclid
                            gclidCreateDate: obj.gclidCreateTime, // gclid创建日期
                            presentSumbitPerson: this.fullName, // 当前提交人名称
                            presentSumbitPersonId: this.userId, // 当前提交人，即userId
                            presentFollowupId: -25, // 当前跟进状态id，接口1中可获取
                            presentFollowup: '线索', // 当前跟进状态，接口1中可获取
                            presentNeedAudit: this.confirm_google ? 1 : 2, // 是否需要提交审核，1需要2不需要
                            conversionId: item.conversionId, // 关联转化列表的id
                            useRevenueValue: this.confirm_google ? item.useRevenueValue : null, // 使用价值类型(1,"每次使用默认值",2,"每次使用不同的值",3,"不使用价值")(presentNeedAudit为2不提交审核时不用传)
                            value: this.confirm_google ? value : 0,
                            customerId: item.customerId, // 关联转化的 ads 账户 id
                            adsCustomerName: item.adsCustomerName // 关联转化的 ads 账户 name
                        };
                    });

                    // 发送请求
                    crmClue.conversionSaveAudit(dataList).then(res => {
                        if (res.code === '1') {
                            if (this.confirm_google) {
                                this.$Message.success(this.$t('googleOptimize.clueSubmitAuditSuccess'));
                            }
                        } else {
                            this.$Message.error(this.$t('googleOptimize.submitAuditFail') + this.$t('crm.Modal.cluesuccess_manualBack'));
                        }
                    });
                }
            },
            // 手动回传 google
            update_google_status_manually(obj) {
                // 要发送的 data
                const data = {
                    orgId: this.enterpriseId, //
                    clueId: obj.clueId, // 线索id，必传
                    visitorId: obj.visitorId, // 访客id
                    gclid: obj.gclid, // gclid
                    gclidCreateDate: obj.gclidCreateTime, // gclid创建日期
                    presentSumbitPerson: this.fullName, // 当前提交人名称
                    presentSumbitPersonId: this.userId, // 当前提交人，即userId
                    presentFollowupId: -25, // 当前跟进状态id，接口1中可获取
                    presentFollowup: '线索', // 当前跟进状态，接口1中可获取
                    presentNeedAudit: 2, // 是否需要提交审核，1需要2不需要
                    value: 0
                };

                // 判断是否需要传 conversionId
                if (this.related_google_conversion_list.length) {
                    const dataList = this.related_google_conversion_list.map(item => {
                        return Object.assign({
                            conversionId: item.conversionId,
                            customerId: item.customerId,
                            adsCustomerName: item.adsCustomerName
                        }, data);
                    });

                    crmClue.conversionSaveAudit(dataList);
                } else {
                    crmClue.conversionSaveAudit([data]);
                }
            },

            // 回填 json_data 数据到 colObj
            backFill() {
                // 置空 colObj
                this.colObj = {};
                for (const item in this.json_data) {
                    if (item.indexOf('a10') === 0) {
                        // 如果有加密后的数据, 也加入到 colObj
                        if (this.json_data[`b${item}`] && this.json_data[item] != this.json_data[`b${item}`]) {
                            this.$set(this.colObj, `b${item}`, this.json_data[`b${item}`]);
                        }
                        // 回填数据到 colObj
                        this.$set(this.colObj, item, this.json_data[item]);
                    }
                    if (this.type === 'enterpriseWeChat' && item === 'a10013') {
                        this.socialNetworkingPlatform = this.json_data[item];
                    }
                }
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
                    this.colObj[item.crmField] = item.value;
                });
                this.$nextTick(() => {
                    this.$forceUpdate();
                });
            }

        },
        mounted() {
            if (this.visible) {
                this.wrapShow = true;
            }
            let showHead = true;
            if (this.$slots.header === undefined && !this.title) {
                showHead = false;
            }
            this.showHead = showHead;
        },
        watch: {
            json_data: {
                handler(val) {
                    this.backFill();
                    /* 此行代码错误，未给属性增加getter/setter，所以后续读取不到该项的属性值，引以为戒 */
                    /* this.json_data.a10020 = this.getSourceWay(this.json_data.source) */
                    this.$set(this.json_data, 'a10020', this.getSourceWay(this.json_data.source));
                    this.$set(this.json_data, 'a10056', this.getSourceWay(this.json_data.source));
                },
                immediate: true
            },
            value(val) {
                this.visible = val;
                if (val) {
                    // 获取全部销售人员
                    this.$store.dispatch('getSalesList');
                    // 获取 下拉选项数据
                    this.$store.dispatch('getSelectOptions');
                    this.getTemplateList();
                    this.backFill();
                } else {
                    this.emptyData();
                }
            },
            visible(val) {
                // 直接录客户
                if (this.createCustomer) {
                    this.visible_new_company = true;
                    this.directCreateCustomer = true; // 传递给newCompany组件的参数,表示直接新建客户
                    this.cancelClue();
                } else {
                    if (val === false) {
                        this.timer = setTimeout(() => {
                            this.wrapShow = false;
                        }, 300);
                    } else {
                        if (this.timer) clearTimeout(this.timer);
                        this.wrapShow = true;

                        // 获取最新的跟进状态关联的 google 转化
                        this.$store.commit('get_associated_followUpStatus_list', this.enterpriseId);
                    }
                }
                this.$emit('on-visible-change', val);
            },
            title(val) {
                if (this.$slots.header === undefined) {
                    this.showHead = Boolean(val);
                }
            },
            visible_new_company(val) {
                if (!val) {
                    // 如果有 gclid 且有与当前跟进状态对应的转化, 则触发回传操作
                    // this.$emit('returnLeadsId', this.clueId);
                    this.$emit('open_close', {
                        close: false
                    });
                    this.savingClue = false;
                    this.spinShow = false;
                    this.clueId = '';
                    this.saleId = '';
                    this.colObj = {};
                }

                // 问题:whatsapp内嵌版直接录入客户后,再点击录入线索,此时由于modal的 visibility = true,导致录入询盘modal不显示的问题
                if (this.createCustomer) return;

                /* 录入线索成功，自动弹出录入询盘弹窗时，需将录入线索的弹窗CSS设置hidden；当录入询盘弹窗关闭时，需将录入线索的弹窗设置visible
                *  否则会导致录入完成后，再次点击未录入，弹窗visibility值为hidden，不会显示
                *  */
                const hiddenNode = document.getElementById('enter-clue-nochange');
                if (hiddenNode) {
                    hiddenNode.style.visibility = val ? 'hidden' : 'visible';
                }
            },
            salesList: {
                handler(val) {
                    if (val) {
                        this.setSaleList();
                    }
                }
            }
        }
    };
</script>

<style lang="less">
    .extra-long-form {
        .el-input__inner {
            box-shadow:none;
            border-color:#f56c6c;
        }
    }
    .el-dialog__body {
        padding: 10px 20px
    }

    .enter-clue-form {
        .el-form-item {
            margin-bottom:17px;
        }
        .el-form-item__label {
            padding: 0 25px 0 0 !important;
        }
    }
    .move {
        cursor: move;
    }

    .appoint-sale {
        height: 68px;
        background-color: #f0f0f0;
        line-height: 68px;
        padding-left: 52px;
    }

    .clue-label {
        width: 120px;
        display: inline-block;
        margin-right: 20px;
        margin-top: 6px;
        text-align: right;
        vertical-align: top;
    }

    .clue-item {
        display: inline-block;
    }

    .checkrepeatbtn {
        line-height: 34px;
        cursor: pointer;
        position: absolute;
        color: #b5b5b5;
        top: -9px;
        right: 10px;
        font-size: 20px;
    }

    .cancel-btn:hover {
        background: #909090;
    }

    .clue-modal {
        // display: flex;
        // align-items: center;
        // justify-content: center;
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
    }
    .plat-form-select {
        display: block;
        // margin-top: 0px;
    }

    .el-form-item__content .plat-form-select:first-child {
        display: block;
        margin-top: 0;
    }
</style>
