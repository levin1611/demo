<template>
    <div class="_form_margin">
        <template v-for="(item) in items">
            <!-- 渲染默认字段 -->
            <template v-if="item.fieldType === 'default'">
                <!-- 特殊型 -->
                <template v-if="item.storageName === 'nickName'">
                    <FormItem :key="item.formMap" :required="item.mustInput === 1" :show-message="false" class="width-365px">
                        <template slot="label">
                            <Icon type="person" color="#fd8c2c" size="14"></Icon>
                            <span :title="item.cname">{{ item.cname }}</span>
                        </template>
                        <ElInputExtend
                                :ref="item.storageName"
                                v-model="data[item.storageName]"
                                :disabled="merged || item.isOnlyRead === 1"
                                :placeholder="item.colDefaultValue"
                                :showWordLimit="true"
                                :maxLen="`${item.maxLength}`"
                                :errorMessage="$t('enterClue.upperLimitTip')"
                                :showErrorMsg="true"
                        ></ElInputExtend>
                    </FormItem>
                </template>
                <template v-else-if="item.storageName === 'productCategory'">
                    <FormItem :key="item.formMap" :required="item.mustInput === 1" :show-message="false" class="width-365px">
                    <template slot="label">
                        <span :title="item.cname">{{ item.cname }}</span>
                    </template>
                        <Select
                                v-model="data[item.storageName]"
                                filterable
                                multiple
                                ref="productCategory"
                                :disabled="item.isOnlyRead === 1"
                                :placeholder="item.colDefaultValue || $t('crm.Modal.tip_select')"
                                @hook:updated="checkPlaceholder(data[item.storageName])"
                        >
                            <Option
                                    v-for="i in selectOptions[item.storageName]"
                                    :key="i.attrName"
                                    :value="i.attrName"
                                    :label="i.attrName"
                            ></Option>
                        </Select>
                    </FormItem>
                </template>
                <template v-else-if="item.colType === 'email'">
                    <FormItem :key="item.formMap" :required="item.mustInput === 1" :show-message="false" class="width-365px">
                        <template slot="label">
                            <span :title=" $t('crm.Modal.contact_email')">{{  $t('crm.Modal.contact_email') }}</span>
                        </template>
                        <!-- 当前的带去重按钮，对话框精确查重展现邮箱的其他所有人信息 -->
                        <!-- Boolean(computed_mailAddress) string转成boolean -->
                        <div class="inputUniq">
                            <ElInputExtend
                                    :ref="item.storageName"
                                    v-model="data.email"
                                    :disabled="merged || Boolean(computed_mailAddress) || item.isOnlyRead === 1 || (operateType === 'edit' && !email_editing) || email_saving"
                                    :placeholder="item.colDefaultValue"
                                    @blur="$set(data, 'email', data.email ? data.email.trim() : data.email)"
                                    :maxLen="`${item.maxLength}`"
                                    :errorMessage="$t('enterClue.upperLimitTip')"
                                    :showErrorMsg="true"
                                    class="emailUniq"
                            >
                                <div v-if="item.isOnlyRead !== 1 && operateType !== 'tableEdit'"
                                     slot="suffix">
                                    <Icon v-if="operateType === 'edit'"
                                          :custom="email_editing ? 'custom-custom-check' : 'custom-draft-box'"
                                          size="18"
                                          color="#8b8b8b"
                                          @click.native="$emit('editMail')"
                                          class="el-input__icon input-suffix-icon"></Icon>
                                    <Icon v-else
                                          :type="merged ? 'edit' : 'ios-search-strong'"
                                          size="18"
                                          @click.native="merged ? $emit('update:merged', false) : $emit('uniqMail', data.email)"
                                          class="el-input__icon input-suffix-icon"></Icon>
                                </div>
                            </ElInputExtend>
                        </div>
                    </FormItem>
                </template>
                <template v-else-if="item.storageName === 'whatsApp'">
                    <FormItem :key="item.formMap"
                              :required="item.mustInput === 1"
                              :show-message="false"
                              class="width-365px">
                        <template slot="label">
                            <span :title=" $t('crm.Modal.contact_whatsApp')">{{  $t('crm.Modal.contact_whatsApp') }}</span>
                        </template>
                        <div class="inputUniq">
                            <ElInputExtend
                                    :ref="item.storageName"
                                    v-model="data.whatsApp"
                                    :disabled="merged || Boolean(computed_WAAccount) || item.isOnlyRead === 1"
                                    :placeholder="item.colDefaultValue"
                                    :maxLen="`${item.maxLength}`"
                                    :errorMessage="$t('enterClue.upperLimitTip')"
                                    :showErrorMsg="true"
                                    class="emailUniq">
                                <div v-if="!merged && showUniq.whatsapp === '1'"
                                     slot="suffix">
                                    <Icon type="ios-search-strong"
                                          size="18"
                                          @click.native="$emit('uniqContact', { field: 'WhatsApp', value: data.whatsApp })"
                                          class="el-input__icon input-suffix-icon"></Icon>
                                </div>
                            </ElInputExtend>
                            <span class="_tailIcon">
                                <HelpTip :title="$t('helpTip.whatsApp')"></HelpTip>
                            </span>
                        </div>
                    </FormItem>
                </template>
                <template v-else-if="item.storageName === 'instagram'">
                    <FormItem :key="item.formMap"
                              :required="item.mustInput === 1"
                              :show-message="false"
                              class="width-365px">
                        <template slot="label">
                            <span :title=" $t('crm.Modal.contact_instagram')">{{  $t('crm.Modal.contact_instagram') }}</span>
                        </template>
                        <div class="inputUniq">
                            <ElInputExtend
                                    :ref="item.storageName"
                                    v-model="data.instagram"
                                    :disabled="item.isOnlyRead === 1 || merged"
                                    :placeholder="item.colDefaultValue"
                                    @blur="$set(data, 'instagram', data.instagram.trim())"
                                    :maxLen="`${item.maxLength}`"
                                    :errorMessage="$t('enterClue.upperLimitTip')"
                                    :showErrorMsg="true"
                                    class="emailUniq">
                                <div v-if="!merged && showUniq.instagram === '1'"
                                     slot="suffix">
                                    <Icon type="ios-search-strong"
                                          size="18"
                                          @click.native="$emit('uniqContact', { field: 'Instagram', value: data.instagram })"
                                          class="el-input__icon input-suffix-icon"></Icon>
                                </div>
                            </ElInputExtend>
                        </div>
                    </FormItem>
                </template>
                <template v-else-if="item.colType === 'phone'">
                    <FormItem v-for="(phoneItem, index) in data.phone" :required="item.mustInput === 1" :key="item.formMap+index" :show-message="false" class="width-365px">
                        <template slot="label">
                            <span style="margin-right: 5px;" :title="$t('crm.Modal.contact_phone')">{{ $t('crm.Modal.contact_phone') }}</span>
                        </template>
                        <div style="position:relative;">
                            <ElInputExtend
                                    :ref="item.storageName"
                                    v-model="phoneItem.phoneNumber"
                                    :disabled="item.isOnlyRead === 1 || merged"
                                    :placeholder="item.colDefaultValue"
                                    @input="$set(data.phone, index, {phoneNumber: phoneItem.phoneNumber.replace(/( )|(　)/g, '')})"
                                    @blur="$set(data.phone, index, {phoneNumber: phoneItem.phoneNumber.replace(/( )|(　)/g, '')})"
                                    :errorMessage="$t('enterClue.upperLimitTip')"
                                    :showErrorMsg="true"
                                    class="fl"
                                    :class="{'is-exceed': isPhoneErr}"
                            >
                                <div v-if="!merged && showUniq.phone==='1'" slot="suffix">
                                    <Icon
                                            type="ios-search-strong"
                                            size="18"
                                            @click.native="$emit('uniqPhoneNumber', phoneItem.phoneNumber)"
                                            class="el-input__icon input-suffix-icon"
                                    ></Icon>
                                </div>
                            </ElInputExtend>
                            <span v-if="item.isOnlyRead !== 1" @click="addPhone" class="_tailIcon">
                                <Icon class="custom custom-add-circle" size="15" style="cursor:pointer;"></Icon>
                            </span>
                            <span v-if="index > 0 && item.isOnlyRead !== 1" @click="deletePhone(index)" class="_tailIcon">
                                <Icon size="15" class="custom custom-reduce-circle" style="cursor:pointer;"></Icon>
                            </span>
                            <span v-if="index === 0" class="_tailIcon">
                                <HelpTip :title="$t('helpTip.contactPhone')"></HelpTip>
                            </span>
                            <div class="crm-validate-div" v-if="phoneLength(item.maxLength, index, data.phone.length)"><span class="crm-validate-input">{{$t('enterClue.phoneTip')}}{{item.maxLength}}</span></div>
                        </div>
                    </FormItem>
                </template>
                <template v-else-if="item.colType === 'socialNetworkingPlatform'">
                    <FormItem :key="item.formMap+index" :required="item.mustInput === 1" v-for="(platform, index) in data.socialNetworkingPlatform" :show-message="false" class="width-100 addSocialPlatform _vertical-align">
                        <template slot="label">
                            <span :title="$t('crm.Modal.contact_socialNetworkingPlatform')">{{ $t('crm.Modal.contact_socialNetworkingPlatform') }}</span>
                        </template>
                        <div class=" _f _a_c">
                            <Select
                                    v-model="platform.attrName"
                                    :disabled="item.isOnlyRead === 1 || merged"
                                    filterable
                                    clearable
                                    @clear="clearSelect(item, index)"
                                    @change="(val) => { valideClueEnter(val, item, index) }"
                                    :placeholder="item.colDefaultValue || $t('crm.Modal.tip_select')"
                            >
                                <Option
                                        v-for="i in selectOptions.socialNetworkingPlatform"
                                        :value="i.attrName"
                                        :label="i.attrName"
                                        :key="i.attrName+`${$dym.Rnum()}`"
                                ></Option>
                            </Select>
                            <ElInputExtend v-model="platform.attrValue"
                                   :showWordLimit="true"
                                    :errorMessage="$t('enterClue.upperLimitTip')"
                                    :showErrorMsg="true"
                                   :disabled="item.isOnlyRead === 1 || merged"
                                   :class="{'is-exceed': isPlatformErr}">
                                        <!-- <Icon v-if="data.socialNetworkingPlatform[index].isShow" style="font-size: 20px;cursor:pointer;" slot="suffix" type="search" @click="verifySocialPlatforms(platform)"></Icon> -->
                                        <div v-if="data.socialNetworkingPlatform[index].isShow"
                                            slot="suffix">
                                            <Icon type="ios-search-strong"
                                                size="18"
                                                @click.native="$emit('uniqSocialPlatforms', platform)"
                                                class="el-input__icon input-suffix-icon"></Icon>
                                        </div>
                            </ElInputExtend>
                            <span v-if="item.isOnlyRead !== 1" @click="addPlatform" :class="[index === 0 ? '_tailIconOnly' : '_tailIcon']">
                                <Icon size="15" class="custom custom-add-circle" style="cursor:pointer;"></Icon>
                            </span>
                            <span v-if="index > 0 && item.isOnlyRead !== 1" @click="deletePlatform(index)" class="_tailIcon">
                                <Icon size="15" class="custom custom-reduce-circle" style="cursor:pointer;"></Icon>
                            </span>
                        </div>
                    </FormItem>
                    <div class="crm-validate-div crm-validate-div-socialNetworkingPlatform" v-if="SNPLength(item.maxLength)"><span class="crm-validate-input">{{$t('enterClue.platformExtracTip')}} {{item.maxLength}}</span></div>
                    <div style="clear: both"></div>
                </template>
                <template v-else-if="item.colType === 'birthday'">
                    <FormItem :key="item.formMap" :required="item.mustInput === 1" :show-message="false" class="width-365px">
                        <template slot="label">
                            <span :title="$t('crm.Modal.contact_birthday')">{{ $t('crm.Modal.contact_birthday') }}</span>
                        </template>
                        <div>
                            <DatePicker
                                    v-model="data.birthday"
                                    type="date"
                                    size="small"
                                    :disabled="item.isOnlyRead === 1 || merged"
                                    value-format="yyyy-MM-dd"
                                    :picker-options="birthdayLimit"
                                    :editable="false"
                                    :placeholder="item.colDefaultValue || $t('crm.Modal.tip_selectDate')"
                            ></DatePicker>
                        </div>
                    </FormItem>
                </template>
                <template v-else-if="item.colType === 'gender'">
                    <FormItem :key="item.formMap" :required="item.mustInput === 1" :show-message="false" class="width-365px">
                        <template slot="label">
                            <span :title="$t('crm.Modal.contact_gender')">{{ $t('crm.Modal.contact_gender') }}</span>
                        </template>
                        <RadioGroup
                                v-model="data.gender"
                                size="mini"
                                :disabled="item.isOnlyRead === 1 || merged">
                            <Radio label="1" style="vertical-align: middle;">{{ $t('crm.Modal.male') }}</Radio>
                            <Radio label="2" style="vertical-align: middle;">{{ $t('crm.Modal.female') }}</Radio>
                        </RadioGroup>
                    </FormItem>
                </template>
                <template v-else-if="item.colType === 'followUp'">
                    <FormItem :key="item.formMap"
                              :required="item.mustInput === 1"
                              :show-message="false"
                              class="width-365px">
                        <template slot="label">
                            <span :title="item.cname">{{ item.cname }}</span>
                        </template>
                        <Select v-model="data.followUpId"
                                :disabled="['1', '2'].includes(`${data.sysCreateFlag}`) || data.followUpId === '-1' || item.isOnlyRead === 1"
                                filterable
                                :placeholder="item.colDefaultValue || $t('crm.Modal.tip_select')">
                            <Option
                                    v-if="data.followUpId === '-1'"
                                    value="-1"
                                    :label="$t('crm.UniSet.defaultFollowUpStatus_closeInquiry')"
                            ></Option>
                            <Option
                                    v-for="i in selectOptions.followUp"
                                    :value="i.attrId + ''"
                                    :label="i.attrName"
                                    :key="i.attrId + `${$dym.Rnum()}`"
                            ></Option>
                        </Select>
                    </FormItem>
                </template>
                <template v-else-if="item.colType === 'transactionTime'">
                    <FormItem :key="item.formMap"
                              :required="item.mustInput === 1"
                              :show-message="false"
                              class="width-365px">
                        <template slot="label">
                            <span :title="item.cname">{{ item.cname }}</span>
                        </template>
                        <DatePicker :value="transactionTime"
                                    :disabled="['1', '2'].includes(`${data.sysCreateFlag}`) || item.isOnlyRead === 1"
                                    type="datetime"
                                    size="small"
                                    :editable="false"
                                    :placeholder="item.colDefaultValue"
                                    @input="val => $emit('update:transactionTime', val)"></DatePicker>
                    </FormItem>
                </template>
                <template v-else-if="item.colType === 'transactionMoney'">
                    <FormItem :key="item.formMap"
                              :required="item.mustInput === 1"
                              :show-message="false"
                              class="width-365px">
                        <template slot="label">
                            <span :title="item.cname">{{ item.cname }}</span>
                        </template>
                        <div class="_f _r">
                            <ElInputExtend :value="transactionMoney"
                                           :disabled="['1', '2'].includes(`${data.sysCreateFlag}`) || item.isOnlyRead === 1"
                                           :maxLen="`${item.maxLength}`"
                                           :errorMessage="$t('enterClue.upperLimitTip')"
                                           :showErrorMsg="true"
                                           @input="handleMoneyInput"
                                           style="width: 110px; margin-right: 5px"
                                           class="currency_input" ></ElInputExtend>
                            <Select style="width: 70px; align-self: center" :value="transactionMoneyCurrency" class="currency_select" @change="handleCurrencyChange">
                                <Option v-for="item in options"
                                        :value="item.code"
                                        :label="item.symbol"
                                        :key="item.code">
                                    {{item.cn}}
                                </Option>
                            </Select>
                        </div>
                    </FormItem>
                </template>
                <template v-else-if="item.storageName === 'estimatedInquiryAmount'">
                    <FormItem :key="item.formMap"
                              :required="item.mustInput === 1"
                              :show-message="false"
                              class="width-365px">
                        <template slot="label">
                            <span :title="item.cname">{{ item.cname }}</span>
                        </template>
                        <div class="_f _r">
                            <ElInputExtend :value="estimatedInquiryAmount"
                                           :disabled="item.isOnlyRead === 1"
                                           :maxLen="`${item.maxLength}`"
                                           :errorMessage="$t('enterClue.upperLimitTip')"
                                           :showErrorMsg="true"
                                           @input="handleEstimatedMoneyInput"
                                           style="width: 110px; margin-right: 5px"
                                           class="currency_input" ></ElInputExtend>
                            <Select style="width: 70px; align-self: center" :value="estimatedInquiryAmountCurrency" class="currency_select" @change="handleEstimatedCurrencyChange">
                                <Option v-for="item in options"
                                        :value="item.code"
                                        :label="item.symbol"
                                        :key="item.code">
                                    {{item.cn}}
                                </Option>
                            </Select>
                        </div>
                    </FormItem>
                </template>
                <template v-else-if="item.colType === 'transactionInfo'">
                    <FormItem :key="item.formMap"
                              :required="item.mustInput === 1"
                              :show-message="false"
                              class="width-100 height_auto">
                        <template slot="label">
                            <span :title="item.cname">{{ item.cname }}</span>
                        </template>
                        <ElInputExtend :ref="item.storageName" :value="transactionInfo"
                                       :disabled="['1', '2'].includes(`${data.sysCreateFlag}`) || item.isOnlyRead === 1"
                                       type="textarea"
                                       :rows="3"
                                       :maxLen="`${item.maxLength}`"
                                       :showWordLimit="true"
                                       :placeholder="item.colDefaultValue"
                                       :errorMessage="$t('enterClue.upperLimitTip')"
                                       :showErrorMsg="true"
                                       @input="val => $emit('update:transactionInfo', val)"></ElInputExtend>
                    </FormItem>
                </template>
                <template v-else-if="item.colType === 'inquiryScore'">
                    <FormItem :key="item.formMap" :required="item.mustInput === 1" :show-message="false" class="width-365px">
                        <template slot="label">
                            <span :title="$t('crm.Modal.inq_inquiryScore')">{{ $t('crm.Modal.inq_inquiryScore') }}</span>
                        </template>
                        <div class="grade">
                            <span class="lowGrade">0</span>
                            <Slider v-model="data.inquiryScore" :disabled="item.isOnlyRead === 1"></Slider>
                            <span class="heightGrade">100</span>
                        </div>
                    </FormItem>
                </template>
                <template v-else-if="item.colType === 'label'">
                    <FormItem :key="item.formMap" :required="item.mustInput === 1" :show-message="false" class="width-365px">
                        <template slot="label">
                            <span :title="$t('crm.Modal.inq_label')">{{ $t('crm.Modal.inq_label') }}</span>
                        </template>
                        <Select
                                v-model="data.label"
                                :disabled="item.isOnlyRead === 1"
                                multiple
                                filterable
                                :placeholder="item.colDefaultValue || $t('crm.Modal.tip_select')"
                        >
                            <Option
                                    v-for="i in selectOptions.tag"
                                    :value="i.attrName"
                                    :label="i.attrName"
                                    :key="i.attrName+`${$dym.Rnum()}`"
                            ></Option>
                        </Select>
                    </FormItem>
                </template>
                <template v-else-if="item.colType === 'picture'">
                    <FormItem :key="item.formMap" :required="item.mustInput === 1" :show-message="false" class="width-365px">
                        <template slot="label">
                            <span :title="item.cname">{{ item.cname }}</span>
                        </template>
                        <UploadPicture
                                :pictures.sync="pictures"
                                :disabled="item.isOnlyRead === 1 || merged"
                                :fileCountLimit="5"
                        ></UploadPicture>
                    </FormItem>
                </template>
                <template v-else-if="item.storageName === 'countryArea'">
                    <FormItem :key="item.formMap" :required="item.mustInput === 1" :show-message="false" class="width-365px">
                        <template slot="label">
                            <span :title="item.cname">{{ item.cname }}</span>
                        </template>
                        <CountryAreaSelect
                                :isVisible="isVisible"
                                :countryArea.sync="data[item.storageName]"
                                :countryAreaName.sync="countryAreaName"
                                :disabled="item.isOnlyRead === 1 || merged"
                                :error_format.sync="error_countryArea_clone"
                                :placeholder="item.colDefaultValue"
                        ></CountryAreaSelect>

                        <!-- <div
                          v-if="item.isOnlyRead !== 1 && error_countryArea && (item.mustInput === 1 || data[item.storageName])"
                          class="countryArea-error-tip"
                        >{{ $t('crm.Modal.error_countryAreaFormat') }}</div> -->
                    </FormItem>
                </template>
                <template v-else-if="item.colType === 'starLevel'">
                    <FormItem :key="item.formMap" :required="item.mustInput === 1" :show-message="false" class="width-365px">
                        <template slot="label">
                            <span :title="$t('crm.Modal.corp_starLevel')">{{ $t('crm.Modal.corp_starLevel') }}</span>
                        </template>
                        <Rate v-model="data.starLevel"
                              :disabled="item.isOnlyRead === 1 || merged"
                              :icon-classes="['custom custom-star', 'custom custom-star', 'custom custom-star']"
                              void-icon-class="custom custom-star"
                              disabled-void-icon-class="custom custom-star"></Rate>
                    </FormItem>
                </template>
                <template v-else-if="item.colType === 'companyName'">
                    <FormItem :key="item.formMap" :required="item.mustInput === 1" :show-message="false" class="width-365px">
                        <template slot="label">
                            <span :title="$t('crm.Modal.corp_companyName')">{{ $t('crm.Modal.corp_companyName') }}</span>
                        </template>
                        <div class="inputUniq">
                            <AutoComplete v-if="business_state"
                                          v-model="data.companyName"
                                          :disabled="item.isOnlyRead === 1 || merged"
                                          :placeholder="item.colDefaultValue"
                                          :maxLen="`${item.maxLength}`"
                                          :errorMessage="$t('enterClue.upperLimitTip')"
                                          :showErrorMsg="true"
                                          :fetch-suggestions="searchBusinessCompanyData"
                                          inputCompoName="ElInputExtend"
                                          popperWidth="346px"
                                          popper-class="companyName_businessPopper"
                                          :ref="item.storageName"
                                          @blur="$set(data, 'companyName', data.companyName.trim())"
                                          @select="handleSelectCompany"
                                          class="companyUniq">
                                <div v-if="item.isOnlyRead !== 1" slot="suffix">
                                    <Icon
                                            :type="merged ? 'edit' : 'ios-search-strong'"
                                            size="18"
                                            @click.native="merged ? $emit('update:merged', false) : $emit('uniqCompany')"
                                            class="el-input__icon input-suffix-icon"
                                    ></Icon>
                                </div>
                                <template slot-scope="{ item }">
                                    <Tooltip trigger="hover" transfer :content="item.value" max-width="200">
                                        <div style="width: 100%;overflow:hidden; white-space: nowrap;text-overflow: ellipsis;">
                                                {{ item.value }}
                                        </div>
                                    </Tooltip>
                                </template>
                            </AutoComplete>
                            <ElInputExtend v-else
                                           v-model="data.companyName"
                                           :disabled="item.isOnlyRead === 1 || merged"
                                           :placeholder="item.colDefaultValue"
                                           :maxLen="`${item.maxLength}`"
                                           :errorMessage="$t('enterClue.upperLimitTip')"
                                           :showErrorMsg="true"
                                           :ref="item.storageName"
                                           @blur="$set(data, 'companyName', data.companyName.trim())"
                                           class="companyUniq">
                                <div v-if="item.isOnlyRead !== 1" slot="suffix">
                                    <Icon
                                            :type="merged ? 'edit' : 'ios-search-strong'"
                                            size="18"
                                            @click.native="merged ? $emit('update:merged', false) : $emit('uniqCompany')"
                                            class="el-input__icon input-suffix-icon"
                                    ></Icon>
                                </div>
                            </ElInputExtend>
                        </div>
                    </FormItem>
                </template>

                <!-- 通用型 -->
                <template v-else-if="item.colType === 'text'">
                    <FormItem :key="item.formMap" :required="item.mustInput === 1" :show-message="false" class="width-365px">
                        <template slot="label">
                            <span :title="item.cname">{{ item.cname }}</span>
                        </template>
                        <div>
                            <ElInputExtend
                                    :ref="item.storageName"
                                    v-model="data[item.storageName]"
                                    :disabled="item.isOnlyRead === 1 || merged"
                                    :placeholder="item.colDefaultValue"
                                    :maxLen="`${item.maxLength}`"
                                    :showWordLimit="true"
                                    :errorMessage="$t('enterClue.upperLimitTip')"
                                    :showErrorMsg="true"
                                    :class="item.storageName === 'contactAddress' ? 'iconWidth' : ''"
                            ></ElInputExtend>
                            <Icon
                                    v-if="item.storageName === 'contactAddress' && isShowLocation"
                                    style="margin-left:5px;"
                                    :size="16"
                                    @click="initMap"
                                    class="custom custom-icon_location"
                            ></Icon>
                        </div>
                    </FormItem>
                </template>
                <template v-else-if="item.colType === 'textarea'">
                    <FormItem :key="item.formMap+item.colType" :required="item.mustInput === 1" :show-message="false" class="width-100 height_auto">
                        <template slot="label">
                            <span :title="item.cname">{{ item.cname }}</span>
                        </template>
                        <ElInputExtend
                                :dataName="item.storageName"
                                :ref="item.storageName"
                                v-model="data[item.storageName]"
                                type="textarea"
                                :disabled="item.isOnlyRead === 1 || merged"
                                :rows="3"
                                :placeholder="item.colDefaultValue"
                                :maxLen="`${item.maxLength}`"
                                :showWordLimit="true"
                                :errorMessage="$t('enterClue.upperLimitTip')"
                                :showErrorMsg="true"
                        ></ElInputExtend>
                    </FormItem>
                </template>
                <template v-else-if="item.colType === 'select'">
                    <FormItem :key="item.formMap" :required="item.mustInput === 1" :show-message="false" class="width-365px">
                        <template slot="label">
                            <span :title="item.cname">{{ item.cname }}</span>
                        </template>
                        <Select
                                v-model="data[item.storageName]"
                                :disabled="item.isOnlyRead === 1 || merged"
                                filterable
                                :placeholder="item.colDefaultValue || $t('crm.Modal.tip_select')"
                        >
                            <Option
                                    v-for="i in selectOptions[item.storageName]"
                                    :value="i.attrName"
                                    :label="i.attrName"
                                    :key="i.attrName+`${$dym.Rnum()}`"
                            ></Option>
                        </Select>
                        <Icon
                                v-if="data[item.storageName] && !(item.isOnlyRead === 1 || merged)"
                                :size="14"
                                @click="data[item.storageName] = ''"
                                class="custom custom-shanchu1 remove-select-icon"
                        ></Icon>
                    </FormItem>
                </template>
                <template v-else-if="item.colType === 'selectMultiple'">
                    <FormItem :key="item.formMap" :required="item.mustInput === 1" :show-message="false" class="width-365px">
                        <template slot="label">
                            <span :title="item.cname">{{ item.cname }}</span>
                        </template>
                        <Select
                                v-model="data[item.storageName]"
                                :disabled="item.isOnlyRead === 1 || merged"
                                filterable
                                multiple
                                :placeholder="item.colDefaultValue || $t('crm.Modal.tip_select')"
                        >
                            <Option
                                    v-for="i in selectOptions[item.storageName]"
                                    :value="i.attrName"
                                    :label="i.attrName"
                                    :key="i.attrName+`${$dym.Rnum()}`"
                            ></Option>
                        </Select>
                    </FormItem>
                </template>
            </template>

            <!-- 渲染自定义字段 -->
            <template v-else-if="item.fieldType === 'custom'">
                <FormItem :key="item.formMap" :required="item.mustInput === 1" :show-message="false" class="width-365px height_auto" :class="[{'width-100': (item.colType === 'textarea')} ]">
                    <template slot="label">
                        <span :title="item.cname">{{ item.cname }}</span>
                    </template>
                    <template v-if="item.colType === 'text'">
                        <ElInputExtend
                                :ref="item.storageName"
                                v-model="data[item.storageName]"
                                :disabled="item.isOnlyRead === 1 || merged"
                                :placeholder="item.colDefaultValue"

                                :showWordLimit="true"
                                :maxLen="`${item.maxLength}`"
                                :errorMessage="$t('enterClue.upperLimitTip')"
                                :showErrorMsg="true"
                        ></ElInputExtend>
                    </template>
                    <template v-else-if="item.colType === 'textarea'">
                        <ElInputExtend
                                :dataName="item.storageName"
                                :ref="item.storageName"
                                v-model="data[item.storageName]"
                                type="textarea"
                                :disabled="item.isOnlyRead === 1 || merged"
                                :rows="3"
                                :placeholder="item.colDefaultValue"

                                :maxLen="`${item.maxLength}`"
                                :showWordLimit="true"
                                :errorMessage="$t('enterClue.upperLimitTip')"
                                :showErrorMsg="true"
                        ></ElInputExtend>
                    </template>
                    <template v-else-if="item.colType === 'select'">
                        <Select
                                v-model="data[item.storageName]"
                                :disabled="item.isOnlyRead === 1 || merged"
                                filterable
                                :placeholder="item.colDefaultValue || $t('crm.Modal.tip_select')"
                        >
                            <Option
                                    v-for="valueItem in item.option.split('?')"
                                    :value="valueItem"
                                    :label="valueItem"
                                    :key="valueItem+`${$dym.Rnum()}`"
                            ></Option>
                        </Select>
                        <!-- type="close-circled" -->
                        <Icon
                                v-if="data[item.storageName] && !(item.isOnlyRead === 1 || merged)"
                                :size="14"
                                @click="data[item.storageName] = ''"
                                class="custom custom-shanchu1 remove-select-icon"
                        ></Icon>
                    </template>
                    <template v-else-if="item.colType === 'selectMultiple'">
                        <Select
                                v-model="data[item.storageName]"
                                :disabled="item.isOnlyRead === 1 || merged"
                                filterable
                                multiple
                                :placeholder="item.colDefaultValue || $t('crm.Modal.tip_select')"
                        >
                            <Option
                                    v-for="valueItem in item.option.split('?')"
                                    :value="valueItem"
                                    :label="valueItem"
                                    :key="valueItem+`${$dym.Rnum()}`"
                            ></Option>
                        </Select>
                    </template>
                    <template v-else-if="item.colType === 'date+time'">
                        <DatePicker
                                v-model="data[item.storageName]"
                                size="small"
                                type="datetime"
                                :disabled="item.isOnlyRead === 1 || merged"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                :editable="false"
                                :placeholder="item.colDefaultValue"
                        ></DatePicker>
                    </template>
                    <template v-else-if="item.colType === 'date'">
                        <DatePicker
                                v-model="data[item.storageName]"
                                type="date"
                                size="small"
                                :disabled="item.isOnlyRead === 1 || merged"
                                value-format="yyyy-MM-dd"
                                :editable="false"
                                :placeholder="item.colDefaultValue"
                        ></DatePicker>
                    </template>
                </FormItem>
            </template>
        </template>
        <Modal
            width="700px"
            class="contact_address_modal"
            :close-on-click-modal="false"
            :visible.sync="contactAddressVisible"
            :append-to-body="true"
            @close="closeContactAddressModal">
            <div slot="title"
                @click.stop>
                <span class="title">选择地址</span>
                <span class="title_tip">（点击地图可选择您想要定位的地址）</span>
            </div>
            <div class="container"
                @click.stop>
                <div id="container_map" style="width:100%;height:100%;"></div>
                <div class="search_result">
                    <Input
                            v-model="search"
                            placeholder="搜索位置"
                            @keyup.enter.native="handleSearch"
                    >
                        <div slot="suffix">
                            <Icon
                                    type="ios-search-strong"
                                    size="18"
                                    @click.native="handleSearch"
                                    class="el-input__icon input-suffix-icon"
                            ></Icon>
                        </div>
                    </Input>
                    <ul class="search_result_list" v-if="showResultFlag">
                        <li class="search_result_list_item" v-for="(item, index) in searchResult" :key="index" @click="handleSelect(item)">
                            <div class="search_result_list_item_border">
                                <p class="title">{{ item.title }}</p>
                                <p class="content">{{ item.address }}</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div slot="footer"
                @click.stop>
                <p style="float: left;line-height: 16px;font-size: 12px;">{{ contactAddressName }}</p>
                <Button @click="closeContactAddressModal">{{ $t('cancel') }}</Button>
                <Button type="primary" @click="handleSubmit">{{ $t('confirm') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import Utils from '@/utils/index';
    import { mapState } from 'vuex';
    import UploadPicture from '@/views/crm/Detail/Components/Html/uploadPicture';
    // import { getBusinessSet, getBusinessDataByCompanyName } from 'xxxxxxxxxxxxxxxxxxxxxxxxxx';

    export default {
        name: 'CrmInputAreaFixed',
        components: {
            UploadPicture
        },
        props: [
            'type',
            'isVisible',
            'data',
            'pictures',
            'items',
            'merged',
            'selectOptions', // 这个需要传递，前面进行了isAvailable===1 的过滤
            'computed_mailAddress',
            'computed_WAAccount',
            'transactionTime',
            'transactionMoney',
            'transactionInfo',
            'transactionMoneyCurrency',
            'estimatedInquiryAmount',
            'estimatedInquiryAmountCurrency',
            'error_countryArea',
            'email_editing',
            'email_saving',
            'operateType',
            'contactAddressLatLng'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                fullName: 'fullName',
                userId: 'userId',
                showUniq: state => state.crm.showUniq,
                business_state: state => state.app.business_state,
                isShowLocation: state => state.app.isShowLocation,
                socialPlatformIds: state => state.crm.socialPlatformIds
            }),
            rnNum() {
                return this.$dym.Rnum();
            },
            phoneLength: function() {
                return function(maxLen, index, L) {
                    let l = 0;
                    const arr = this.data.phone || [];
                    arr.map(item => {
                        l += item.phoneNumber.length;
                    });
                    // 当字段输入超长所有电话输入框变红 但只在最后一个显示错误信息
                    l += (arr.length - 1); // 加上连接符
                    this.isPhoneErr = l > maxLen;
                    return (index === L - 1 && l > maxLen);
                };
            },
            SNPLength: function() {
                return function(maxLen) {
                    let L = 0;
                    const arr = this.data.socialNetworkingPlatform || [];
                    arr.map(item => {
                        if (item.attrName && item.attrValue) {
                            const str = `"attrId":${this.getPlatformId(item.attrName)},` + `"attrName":"${item.attrName}",` + `"attrValue":"${item.attrValue}"`;
                            L += (str.length + 2); // 2：表示大括号长度
                        }
                    });
                    // 当字段输入超长所有电话输入框变红 但只在最后一个显示错误信息
                    L += (arr.length + 1); // 加上连接符， arr.length - 1 表示元素与元素间的逗号长度，再加2：最外层中括号的长度
                    this.isPlatformErr = L > maxLen;
                    return L > maxLen;
                };
            }
        },
        mounted() {
            if (!window.BMapGL && this.isShowLocation) {
                const originalDocumentWrite = document.write;
                document.write = function(content) {
                    const div = document.createElement('div');
                    div.innerHTML = content;
                    const scripts = div.getElementsByTagName('script');
                    for (let i = 0; i < scripts.length; i++) {
                        const script = document.createElement('script');
                        if (scripts[i].src) {
                            script.src = scripts[i].src;
                        } else {
                            script.text = scripts[i].innerText;
                        }
                        document.body.appendChild(script);
                    }
                };
                const script = document.createElement('script');
                script.src = 'https://api.map.baidu.com/api?v=1.0&type=webgl&ak=evBIVnbzgKAbKO6ggnwwMguftdmsfjc2';
                script.onload = function() {
                    // 加载完 API 后恢复 document.write
                    document.write = originalDocumentWrite;
                };
                document.body.appendChild(script);
            }
            // 设置 autocomplete 避免 chrome 设置[保存并填写地址](chrome://settings/addresses)后, 部分 input 框自动显示候选项
            setTimeout(() => {
                const inputNodes = this.$el.querySelectorAll('input');
                for (let i = 0; i < inputNodes.length; i++) {
                    inputNodes[i].setAttribute('autocomplete', 'new-password');
                }
            }, 0);
        },
        data() {
            return {
                birthdayLimit: {
                    disabledDate(date) {
                        return date && date.valueOf() > Date.now() - 86400000;
                    }
                },
                error_countryArea_clone: false,
                countryAreaName: '', // 国家地区名
                isPhoneErr: false,
                isPlatformErr: false,
                options: Utils.currencySymbol,
                symbol: 'CNY',

                // 工商数据联想相关
                able_businessData: false,
                businessDataMappingRule: [],
                search: '',
                showResultFlag: false,
                searchResult: [],
                selectInfo: {},
                contactAddressName: '',
                contactAddressVisible: false, // 联系地址modal
                mapContainer: null
            };
        },
        methods: {
            // 获得选中属性的id
            getPlatformId(attrName) {
                let result = '';
                this.selectOptions.socialNetworkingPlatform.some(i => {
                    if (i.attrName === attrName) {
                        result = i.attrId;
                        return true;
                    }
                });
                return result;
            },
            addPhone() {
                if (!this.merged) {
                    this.data.phone.push({ phoneNumber: '' });
                }
            },
            deletePhone(index) {
                if (!this.merged) {
                    this.data.phone.splice(index, 1);
                }
            },
            addPlatform() {
                if (!this.merged) {
                    this.data.socialNetworkingPlatform.push({
                        attrName: '',
                        attrValue: '',
                        isShow: false
                    });
                }
            },
            deletePlatform(index) {
                if (!this.merged) {
                    this.data.socialNetworkingPlatform.splice(index, 1);
                }
            },
            // 社交平台清空
            clearSelect(column, platFormIndex) {
                if (column.colType === 'socialNetworkingPlatform') {
                    this.data.socialNetworkingPlatform[platFormIndex].isShow = false;
                }
            },
            valideClueEnter(val, column, platFormIndex) {
                if (column.colType === 'socialNetworkingPlatform') {
                    for (let i = 0; i < this.socialPlatformIds.length; i++) {
                        const item = this.socialPlatformIds[i];
                        if (item.attrName === val && item.socialValue === '1') {
                            this.data.socialNetworkingPlatform[platFormIndex].isShow = true;
                            break;
                        } else {
                            this.data.socialNetworkingPlatform[platFormIndex].isShow = false;
                        }
                    };
                }
            },
            checkPlaceholder(val) {
                // 解决 element ui 框架中, productCategory 回填默认值后 placeholder 仍然显示的问题
                if (Array.isArray(val) && val.length) {
                    if (this.$refs.productCategory && this.$refs.productCategory.length) {
                        this.$refs.productCategory.forEach(item => {
                            if (item.$refs.reference && item.$refs.reference.$refs.input) {
                                if (item.$refs.reference.$refs.input.getAttribute('placeholder')) {
                                    item.$refs.reference.$refs.input.setAttribute('placeholder', '');
                                }
                            }
                        });
                    }
                }
            },
            handleCurrencyChange(val) {
                this.$emit('update:transactionMoneyCurrency', val);
            },
            handleEstimatedCurrencyChange(val) {
                this.$emit('update:estimatedInquiryAmountCurrency', val);
            },
            handleMoneyInput(val) {
                this.transformMoney(1, val);
            },
            handleEstimatedMoneyInput(val) {
                this.transformMoney(2, val);
            },
            transformMoney(type, val) {
                // 去除数字和小数点外的其他字符
                val = val.replace(/[^\d.]/gi, '');

                if ((/[\d.]+/.test(val))) {
                    // 正则校验通过

                    // 以小数点分割传入值
                    const temp = val.split('.');

                    if (temp.length === 1) {
                        // 不包含小数点

                        // 数字有效位数校验
                        if (val.length > 16) {
                            // 有效位数超过 16 位

                            return false;
                        }
                        // 校验通过, 赋值
                        const result = Number(val).toLocaleString();
                        if (type === 1) {
                            this.$emit('update:transactionMoney', result);
                        } else if (type === 2) {
                            this.$emit('update:estimatedInquiryAmount', result);
                        }

                        // 停止向下执行
                        return false;
                    }

                    if (temp.length === 2) {
                        // 包含一个小数点

                        if (val[0] === '.') {
                            // 首字符为小数点

                            return false;
                        }

                        // 拆分整数位小数位
                        const [integer, decimal] = temp;

                        if (decimal.length > 2) {
                            // 小数位长度超过 2 位

                            return false;
                        }

                        if (integer.length + decimal.length > 16) {
                            // js 数字有效位数最多为 16 位

                            return false;
                        }

                        const result = `${Number(integer).toLocaleString()}.${decimal}`;
                        if (type === 1) {
                            this.$emit('update:transactionMoney', result);
                        } else if (type === 2) {
                            this.$emit('update:estimatedInquiryAmount', result);
                        }

                        // 停止向下执行
                        return false;
                    }

                    // 包含多个小数点
                    return false;
                } else {
                    // 未通过正则校验

                    if (type === 1) {
                        this.$emit('update:transactionMoney', null);
                    } else if (type === 2) {
                        this.$emit('update:estimatedInquiryAmount', null);
                    }
                }
            },
            comdify(n) {
                const num = n.toString();
                let decimals = '';
                // 判断是否有小数
                num.indexOf('.') > -1 ? decimals = num.split('.')[1] : decimals;
                const len = num.length;
                if (len <= 3) {
                    return num;
                } else {
                    let temp = '';
                    const remainder = len % 3;
                    decimals ? temp = `.${decimals}` : temp;
                    if (remainder > 0) { // 不是3的整数倍
                        return `${num.slice(0, remainder)},${num.slice(remainder, len).match(/\d{3}/g).join(',')}${temp}`;
                    } else { // 是3的整数倍
                        return num.slice(0, len).match(/\d{3}/g).join(',') + temp;
                    }
                }
            },
            parseMoney(val) {
                if (val) {
                    return val.replace(/,/gi, '');
                } else {
                    return val;
                }
            },
            // 搜索工商数据
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
                    this.data[item.crmField] = item.value;
                });
            },
            // 初始化
            initMap() {
                this.contactAddressVisible = true;
                this.$nextTick(() => { this.getMap(); });
            },
            // 获取初始化的地图定位标记信息
            getMap() {
                this.mapContainer = new window.BMapGL.Map('container_map');
                const point = new window.BMapGL.Point(116.404, 39.915); // 创建点坐标
                this.mapContainer.centerAndZoom(point, 15); // 初始化地图，设置中心点坐标和地图级别
                this.mapContainer.enableScrollWheelZoom(true);
                // 定位
                if (this.data.point) {
                    const point = this.data.point.split(',');
                    const mk = new window.BMapGL.Marker({ lng: point[0], lat: point[1] });
                    this.mapContainer.addOverlay(mk);
                    this.mapContainer.panTo({ lng: point[0], lat: point[1] });
                } else {
                    const myFun = (result) => {
                        const mk = new window.BMapGL.Marker(result.center);
                        this.mapContainer.addOverlay(mk);
                        this.mapContainer.panTo(result.center);
                    };
                    const myCity = new window.BMapGL.LocalCity();
                    myCity.get(myFun);
                }
                // 地图点击事件
                this.mapContainer.addEventListener('click', this.listenMapClick);
            },
            // 监听事件函数
            listenMapClick(e) {
                this.getLocation(e.latlng);
            },
            // 根据经纬度获取详细地址信息
            getLocation({ lng, lat }, isSearch) {
                const self = this;
                const point = new window.BMapGL.Point(lng, lat);
                const geoc = new window.BMapGL.Geocoder();
                geoc.getLocation(point, function(res) {
                    self.showResultFlag = false;
                    if (isSearch) self.search = res.address;
                    self.contactAddressName = res.address;
                    self.mapContainer.clearOverlays(); // 清除地图上的所有覆盖物
                    self.mapContainer.addOverlay(new window.BMapGL.Marker({ lng, lat }));
                    self.mapContainer.centerAndZoom(point, 15); // 初始化地图，设置中心点坐标和地图级别
                    self.selectInfo = {
                        lng,
                        lat,
                        addressStr: res.address,
                        province: res.addressComponents.province,
                        city: res.addressComponents.city,
                        district: res.addressComponents.district
                    };
                });
            },
            // 关键词搜索
            handleSearch() {
                this.searchResult = [];
                if (!this.search) {
                    this.showResultFlag = false;
                    return;
                }
                const self = this;
                const local = new window.BMapGL.LocalSearch(this.mapContainer, {
                    renderOptions: { map: this.mapContainer },
                    onSearchComplete(res) {
                        self.searchResult = res._pois;
                        self.showResultFlag = true;
                    }
                });
                local.search(this.search);
            },
            // 选择搜索结果
            handleSelect(item) {
                this.getLocation(item.marker.latLng, true);
            },
            // 保存
            handleSubmit() {
                this.contactAddressVisible = false;
                if (!this.search && !this.contactAddressName) {
                    return;
                }
                this.data.contactAddress = this.selectInfo.addressStr; // 回填联系地址内容
                this.$emit('update:contactAddressLatLng', this.selectInfo);
                this.closeContactAddressModal();
            },
            closeContactAddressModal() {
                this.contactAddressVisible = false;
                this.search = '';
                this.contactAddressName = '';
                this.showResultFlag = false;
                this.mapContainer.removeEventListener('click', this.listenMapClick);
                this.$nextTick(() => {
                    this.mapContainer = null;
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
            'data.whatsApp': {
                handler(val) {
                    if (val) {
                        this.$set(this.data, 'whatsApp', this.data.whatsApp.replace(/[^ `\-=[\];'\\,./~!@#$%^&*()_+{}:"|<>?！￥…（）—\d]/g, '').replace(/( )|(　)/g, ''));
                    }
                }
            },
            transactionMoney: {
                handler(val, oldVal) {
                    if (!oldVal && val) {
                        this.handleMoneyInput(`${val}`);
                    }
                }
            }
        }
    };
</script>

<style lang="less">
    .modalItem {
        .remove-select-icon {
            display: none;
        }

        &:hover .remove-select-icon {
            display: block;
        }

        .el-input__inner, .el-textarea__inner, .el-radio__label, .grade{
            font-size: 12px;
        }
    }
    ._form_margin{
        .el-form-item__label {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .el-input .el-input__count .el-input__count-inner{
            padding: 0;
        }
        .el-input__inner{
            padding-right: 50px;
        }
        .el-form-item__error{
            color: #EA4335;
        }
        .el-input.is-exceed .el-input__inner{
            border-color: #EA4335;
        }
        .el-form-item.is-error .el-input__inner{
            border-color: #EA4335;
        }
        .el-input.is-exceed .el-input__suffix .el-input__count{
            color: #EA4335;
        }
        .heightGrade, .lowGrade{
            bottom: -15px;
        }

        .el-input__inner, .el-textarea__inner, .el-radio__label, .grade{
            font-size: 12px;
        }

        .el-form-item__content {
            line-height: 38px;

            .el-rate {
                height: auto;
                line-height: inherit;
            }
        }
    }
    .crm-validate-div{
        position: relative;
        float: left;
        width: 100%;
    }
    .crm-validate-input{
        color: #EA4335;
        font-size: 12px;
        line-height: 1;
        position: absolute;
        top: 2px;
        left: 0;
    }
    .crm-validate-div-socialNetworkingPlatform{
        .crm-validate-input{
            padding-left: 116px;
        }
    }
    .table-edit-form{
        .crm-validate-div-socialNetworkingPlatform{
        .crm-validate-input{
            padding-left: 90px;
        }
    }
    }

    .companyName_businessPopper {
        .el-autocomplete-suggestion__list li {
            font-size: 12px;
        }
    }
</style>

<style scoped lang="scss">
    .input-suffix-icon {
        cursor: pointer;
    }

    .countryArea-error-tip {
        position: absolute;
        left: 135px;
        bottom: -12px;
        font-size: 12px;
        line-height: 12px;
        color: red;
        white-space: nowrap;
    }
    .currency_select {
        margin-top: 0 !important;
        /deep/ .el-input__inner {
            padding-right: 0 !important;
        }
    }
    .currency_input {
        /deep/ .el-input__inner {
            padding-right: 0 !important;
        }
    }

    .contact_address_modal{
        .title{
            font-weight: bold;
            font-size: 18px;
            color: rgba(0, 0, 0, 0.8);
            line-height: 18px;
        }

        .title_tip{
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
        }

        .container{
            width: 652px;
            height: 390px;
            border: 1px solid #eee;
            position: relative;

            .search_result{
                z-index: 9999;
                position: absolute;
                top: 8px;
                left: 8px;
                height: 34px;
                width: 240px;

                /deep/ .el-input__inner{
                    height: 34px;
                }

                /deep/ .el-input__inner{
                    box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.2);
                }
                /deep/ .el-input__inner{
                    border-color: #CBD6E2;
                }

                .search_result_list{
                    width: 240px;
                    max-height: 334px;
                    background: #fff;
                    border-radius: 6px;
                    overflow-y: auto;
                    margin-top: 6px;
                    padding-top: 4px;
                    box-shadow: 0 5px 5px 0 rgba(0, 0, 0, 0.2);

                    .search_result_list_item{
                        cursor: pointer;
                        padding: 0px 12px;

                        .search_result_list_item_border{
                            border-bottom: 1px solid #EFF0F4;
                            padding:  10px 0;
                        }

                        .title{
                            font-size: 14px;
                            line-height: 18px;
                            color: rgba(0, 0, 0, 0.8);
                            margin-bottom: 6px;
                        }

                        .content{
                            font-size: 12px;
                            line-height: 18px;
                            color: rgba(0, 0, 0, 0.6);
                        }

                        &:hover{
                            background: #F3F4F7;
                        }
                    }
                }
            }
        }

        /deep/ .el-dialog__header{
            padding: 20px 24px 14px 24px;
            .el-dialog__headerbtn{
                right: 24px;
            }
        }

        /deep/ .el-dialog__body{
            padding: 0 24px;
        }

        /deep/ .el-dialog__footer{
            padding: 24px;
        }
    }
</style>
