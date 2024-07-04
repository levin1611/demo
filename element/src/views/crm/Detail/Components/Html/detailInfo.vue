template<template>
    <div class="detail-info" v-loading="loading" :style="['mail', 'mail_detail'].includes(from) ? 'height: calc(100vh - 344px);overflow-y: auto;margin-bottom:0;' : ''">
        <!-- 编辑公司 -->
        <div style="text-align: right;margin-bottom: 4px;">
            <Tooltip :content="$t('crm.newDetail.title_editCustomer')" placement="top">
                <Button v-if="canEditCompany"
                        type="text"
                        icon="custom custom-field-edit"
                        @click="$emit('editCompany')"
                        class="detail-info-operate"></Button>
            </Tooltip>
        </div>

        <Row type="flex" style="flex-direction: row;flex-wrap: wrap; margin-top: 16px;" class="detail-info-body from_malil_detail_info" v-if="['mail', 'mail_detail', 'whatsApp', 'companyInfo'].includes(from)">
            <!-- 是否是主要联系人 -->
            <!--<Col :span="singleCol ? 24 : 12" v-if="type === 'contact'">-->
            <!--    <p class="col_name">{{ $t('crm.Modal.mainContact') }}</p>-->
            <!--    <p class="col_value" v-text="detailInfo.isMainContact ? $t('yes') : $t('no')"></p>-->
            <!--</Col>-->
            <!-- 客户编号 -->
            <!-- <Col :span="singleCol ? 24 : 12">
                <p class="col_name">{{ $t('crm.Table.col_customerNumber') }}</p>
                <p class="col_value"> {{detailInfo.autoSeq}} </p>
            </Col> -->
            <!-- 详情字段 -->
            <Col v-for="(item, index) in columns_all" :span="24" :key="index">
                <span class="col_name">{{ item.cname }}：</span>
                <template v-if="item.storageName === 'whatsApp' && detailInfo[item.storageName]">
                    <!-- 点击打开 wa 回复框 -->
                    <span @click="openGlobalWaReplyModal(detailInfo[item.storageName], $event)"
                       v-text="detailInfo[item.storageName] || '-'"
                       class="col_value header-source"></span>
                </template>
                <template v-else-if="item.colType === 'picture' && detailInfo[item.storageName]">
                    <div class="demo-upload-list" :key="index"
                         v-for="(img,index) in detailInfo[item.storageName].split(';')">
                        <img :src="img" @click="imgPreview">
                    </div>
                </template>
                <template v-else-if="item.colType === 'textarea'">
                    <span class="col_value textAreaShow" v-text="detailInfo[item.storageName]?detailInfo[item.storageName]:'-'"></span>
                </template>
                <template v-else-if="item.colType === 'starLevel'">
                    <span class="col_value">
                        <Rate :value="detailInfo[item.storageName]"
                              disabled
                              :icon-classes="['custom custom-star', 'custom custom-star', 'custom custom-star']"
                              void-color="#CBD6E2"
                              disabled-void-color="#CBD6E2"
                              disabled-void-icon-class="custom custom-star"></Rate>
                    </span>
                </template>
                <template v-else-if="item.colType === 'label'">
                    <span class="col_value" v-if="detailInfo[item.storageName]">
                        <SoftTag v-for="labelItem in detailInfo[item.storageName]"
                                 :key="labelItem.attrId"
                                 :color="labelItem.attrValue || '#4285F4'"
                                 style="margin: 0 8px 8px 0;">{{ labelItem.attrName }}</SoftTag>
                    </span>
                    <span class="col_value" v-else> - </span>
                </template>
                <template v-else-if="item.colType === 'socialNetworkingPlatform'">
                    <div class="col_value"  v-if="$options.filters.parseArray(detailInfo[item.storageName]).length">
                        <span v-for="(platform, index) in $options.filters.parseArray(detailInfo[item.storageName])" :key="index">
                            {{ platform.attrName + ': ' + platform.attrValue }}
                        </span>
                    </div>
                    <span class="col_value" v-else> - </span>
                </template>
                <template v-else-if="item.colType === 'gender'">
                    <span class="col_value"
                       v-text="detailInfo[item.storageName] === '1' ? $t('crm.Modal.male') : detailInfo[item.storageName] === '2' ? $t('crm.Modal.female') : '-'"></span>
                </template>
                <template v-else-if="item.colType === 'date'">
                    <template v-if="item.storageName !== 'transactionTime'">
                        <span class="col_value" v-if="detailInfo[item.storageName]">{{ detailInfo[item.storageName] | timeFormat }}</span>
                        <span class="col_value" v-else> - </span>
                    </template>
                    <template v-else>
                        <span class="col_value" v-if="detailInfo[item.storageName]">{{ detailInfo[item.storageName] | timeFormat('DateTime') }}</span>
                        <span class="col_value" v-else> - </span>
                    </template>
                </template>
                <template v-else-if="item.colType === 'date+time'">
                    <span class="col_value" v-if="detailInfo[item.storageName]">{{ detailInfo[item.storageName] | timeFormat('DateTime') }}</span>
                    <span class="col_value" v-else> - </span>
                </template>
                <template v-else-if="item.colType === 'selectMultiple'">
                    <template v-if="item.fieldType === 'default'">
                        <span class="col_value"
                           v-text="$options.filters.parseArray(detailInfo[item.storageName]).length ? $options.filters.parseArray(detailInfo[item.storageName]).join(', ') : '-'"></span>
                    </template>
                    <template v-else>
                        <span class="col_value"
                           v-text="$options.filters.parseArray(detailInfo[item.storageName]).join(', ').length? $options.filters.parseArray(detailInfo[item.storageName]).join(', '):'-'"></span>
                    </template>
                </template>
                <template v-else-if="item.colType === 'email'">
                    <a href="javascript:void(0)" class="ct_email" @click.stop="quickSend(detailInfo)" v-text="detailInfo[item.storageName]?detailInfo[item.storageName]:'-'"></a>
                </template>
                <template v-else>
                    <span class="col_value" v-text="detailInfo[item.storageName]?detailInfo[item.storageName]:'-'"></span>
                </template>
                <span @click.stop @click="handleClickEdit(item, $event)" v-if="!notEditField.includes(item.storageName) && originalType === 'customer'" style="width:26px;">
                    <a href="javascript:void(0)" class="table-show-edit custom custom-remark-edit"></a>
                </span>
            </Col>

            <!-- 创建人 -->
            <Col :span="24">
                <span class="col_name">{{$t('crm.WorkBench.col_followUpCreateUser')}}：</span>
                <span class="col_value" v-text="detailInfo.createUser?detailInfo.createUser:'-'"></span>
            </Col>
            <template v-if="['customer', 'highseasCustomer'].includes(type)">
                <!-- 负责人部门 -->
                <Col :span="24" v-if="type === 'customer' && !this.isHighSeas">
                    <p class="col_name">{{$t('crm.Table.col_companyManagerDepartments')}}：</p>
                    <p class="col_value" v-text="detailInfo.companyManagerDepartments?detailInfo.companyManagerDepartments:'-'"></p>
                </Col>
                <!-- 最近获得时间 -->
                <Col :span="24" v-if="type === 'customer' && !this.isHighSeas">
                    <p class="col_name">{{$t('crm.Table.col_mostRecentlyObtainedTime')}}：</p>
                    <p class="col_value">
                        <span v-if="detailInfo.lastGetCompanyTime">{{ detailInfo.lastGetCompanyTime | timeFormat('DateTime') }}</span>
                        <span v-else> - </span>
                    </p>
                </Col>
                <!-- 最近成交时间 -->
                <Col :span="24">
                    <p class="col_name">{{$t('crm.Table.col_lastTransactionTime')}}：</p>
                    <p class="col_value">
                        <span v-if="detailInfo.lastTransactionTime">{{detailInfo.lastTransactionTime | timeFormat('DateTime')}}</span>
                        <span v-else> - </span>
                    </p>
                </Col>
                <!-- 预计流入公海日期 -->
                <Col :span="24" v-if="type === 'customer' && !this.isHighSeas">
                    <p class="col_name">{{$t('crm.Table.col_inflowintoTheOpenSea')}}：</p>
                    <p class="col_value">
                        <span v-if="detailInfo.predictGiveupTime">{{detailInfo.predictGiveupTime | timeFormat}}</span>
                        <span v-else> - </span>
                    </p>
                </Col>
                <!-- 成交询盘金额 -->
                <Col :span="24">
                    <p class="col_name">{{$t('crm.Table.col_transactionInquiryAmount')}}：</p>
                    <p class="col_value">
                        <span v-if="detailInfo.transactionMoneyRmb"> ￥{{detailInfo.transactionMoneyRmb}}</span>
                        <span v-else> - </span>
                    </p>
                </Col>
                <!-- 成交询盘数 -->
                <Col :span="24">
                    <p class="col_name">{{$t('crm.Table.col_transactionInquiryNO')}}：</p>
                    <p class="col_value" v-text="detailInfo.transactionInquiryCount ? detailInfo.transactionInquiryCount : '-'"></p>
                </Col>
            </template>
            <!-- 广告信息 -->
            <template v-if="detailInfo.visitorId && adInfo">
                <Col :span="24">
                    <span class="col_name">{{$t('visitor_history.visit_source')}}：</span>
                    <span class="col_value" v-text="adInfo.visitSource"></span>
                </Col>
                <Col :span="24">
                    <span class="col_name">{{$t('visitor_history.traffic_source')}}：</span>
                    <span class="col_value" v-text="adInfo.trafficSource"></span>
                </Col>
                <template
                        v-if="adInfo.trafficSource === 'Google广告' || adInfo.trafficSource === 'Facebook广告' || adInfo.trafficSource === '其他广告'">
                    <Col :span="24">
                        <span class="col_name">{{$t('visitor_history.ad_type')}}：</span>
                        <span class="col_value" v-text="adInfo.adType"></span>
                    </Col>
                    <Col :span="24">
                        <span class="col_name">{{$t('visitor_history.ad_campaign_name')}}：</span>
                        <span class="col_value" v-text="adInfo.adCampaignName"></span>
                    </Col>
                    <Col :span="24">
                        <span class="col_name">
                            {{$t('visitor_history.ad_group_name')}}：</span>
                        <span class="col_value" v-text="adInfo.adGroupName"></span>
                    </Col>
                    <Col :span="24">
                        <span class="col_name">{{$t('visitor_history.ad_name')}}：</span>
                        <span class="col_value" v-text="adInfo.adName"></span>
                    </Col>
                    <Col :span="24">
                        <span class="col_name">{{$t('visitor_history.ad_keyword')}}：</span>
                        <span class="col_value" v-text="adInfo.adKeyword"></span>
                    </Col>
                </template>
            </template>
        </Row>
        <Row :gutter="singleCol ? 0 : 32" type="flex" style="flex-direction: row;flex-wrap: wrap;" class="detail-info-body" v-else>
            <!-- 是否是主要联系人 -->
            <!--<Col :span="singleCol ? 24 : 12" v-if="type === 'contact'">-->
            <!--    <p class="col_name">{{ $t('crm.Modal.mainContact') }}</p>-->
            <!--    <p class="col_value" v-text="detailInfo.isMainContact ? $t('yes') : $t('no')"></p>-->
            <!--</Col>-->
            <!-- 客户编号 -->
            <!-- <Col :span="singleCol ? 24 : 12">
                <p class="col_name">{{ $t('crm.Table.col_customerNumber') }}</p>
                <p class="col_value"> {{detailInfo.autoSeq}} </p>
            </Col> -->
            <!-- 详情字段 -->
            <Col v-for="(item, index) in columns_all" :span="singleCol ? 24 : (item.span || 12)" :key="index">
                <p class="col_name">{{ item.cname }}</p>
                <template v-if="item.storageName === 'whatsApp' && detailInfo[item.storageName]">
                    <!-- 点击打开 wa 回复框 -->
                    <p @click="openGlobalWaReplyModal(detailInfo[item.storageName], $event)"
                       v-text="detailInfo[item.storageName] || '-'"
                       class="col_value header-source"></p>
                </template>
                <template v-else-if="item.colType === 'picture' && detailInfo[item.storageName]">
                    <div class="demo-upload-list" :key="index"
                         v-for="(img,index) in detailInfo[item.storageName].split(';')">
                        <img :src="img" @click="imgPreview">
                    </div>
                </template>
                <template v-else-if="item.colType === 'textarea'">
                    <p class="col_value textAreaShow" v-text="detailInfo[item.storageName]?detailInfo[item.storageName]:'-'"></p>
                </template>
                <template v-else-if="item.colType === 'starLevel'">
                    <p class="col_value">
                        <Rate :value="detailInfo[item.storageName]"
                              disabled
                              :icon-classes="['custom custom-star', 'custom custom-star', 'custom custom-star']"
                              void-color="#CBD6E2"
                              disabled-void-color="#CBD6E2"
                              disabled-void-icon-class="custom custom-star"></Rate>
                    </p>
                </template>
                <template v-else-if="item.colType === 'label'">
                    <p class="col_value" v-if="detailInfo[item.storageName]">
                        <SoftTag v-for="labelItem in detailInfo[item.storageName]"
                                 :key="labelItem.attrId"
                                 :color="labelItem.attrValue || '#4285F4'"
                                 style="margin: 0 8px 8px 0;">{{ labelItem.attrName }}</SoftTag>
                    </p>
                    <p class="col_value" v-else> - </p>
                </template>
                <template v-else-if="item.colType === 'socialNetworkingPlatform'">
                    <div class="col_value"  v-if="$options.filters.parseArray(detailInfo[item.storageName]).length">
                        <p v-for="(platform, index) in $options.filters.parseArray(detailInfo[item.storageName])" :key="index">
                            {{ platform.attrName + ': ' + platform.attrValue }}
                        </p>
                    </div>
                    <p class="col_value" v-else> - </p>
                </template>
                <template v-else-if="item.colType === 'gender'">
                    <p class="col_value"
                       v-text="detailInfo[item.storageName] === '1' ? $t('crm.Modal.male') : detailInfo[item.storageName] === '2' ? $t('crm.Modal.female') : '-'"></p>
                </template>
                <template v-else-if="item.colType === 'date'">
                    <template v-if="item.storageName !== 'transactionTime'">
                        <p class="col_value" v-if="detailInfo[item.storageName]">{{ detailInfo[item.storageName] | timeFormat }}</p>
                        <p class="col_value" v-else> - </p>
                    </template>
                    <template v-else>
                        <p class="col_value" v-if="detailInfo[item.storageName]">{{ detailInfo[item.storageName] | timeFormat('DateTime') }}</p>
                        <p class="col_value" v-else> - </p>
                    </template>
                </template>
                <template v-else-if="item.colType === 'date+time'">
                    <p class="col_value" v-if="detailInfo[item.storageName]">{{ detailInfo[item.storageName] | timeFormat('DateTime') }}</p>
                    <p class="col_value" v-else> - </p>
                </template>
                <template v-else-if="item.colType === 'selectMultiple'">
                    <template v-if="item.fieldType === 'default'">
                        <p class="col_value"
                           v-text="$options.filters.parseArray(detailInfo[item.storageName]).length ? $options.filters.parseArray(detailInfo[item.storageName]).join(', ') : '-'"></p>
                    </template>
                    <template v-else>
                        <p class="col_value"
                           v-text="$options.filters.parseArray(detailInfo[item.storageName]).join(', ').length? $options.filters.parseArray(detailInfo[item.storageName]).join(', '):'-'"></p>
                    </template>
                </template>
                <template v-else-if="item.colType === 'email'">
                    <a href="javascript:void(0)" class="ct_email" @click.stop="quickSend(detailInfo)" v-text="detailInfo[item.storageName]?detailInfo[item.storageName]:'-'"></a>
                </template>
                <template v-else>
                    <p class="col_value" v-text="detailInfo[item.storageName]?detailInfo[item.storageName]:'-'"></p>
                </template>

            </Col>

            <!-- 创建人 -->
            <Col :span="singleCol ? 24 : 12">
                <p class="col_name">{{ $t('crm.WorkBench.col_followUpCreateUser') }}</p>
                <p class="col_value" v-text="detailInfo.createUser?detailInfo.createUser:'-'"></p>
            </Col>
            <template v-if="type ==='customer'">
                <!-- 负责人部门 -->
                <Col :span="singleCol ? 24 : 12" v-if="originalType !== 'highseasCustomer'">
                    <p class="col_name">{{ $t('crm.Table.col_companyManagerDepartments') }}</p>
                    <p class="col_value" v-text="detailInfo.companyManagerDepartments?detailInfo.companyManagerDepartments:'-'"></p>
                </Col>
                <!-- 最近获得时间 -->
                <Col :span="singleCol ? 24 : 12" v-if="originalType !== 'highseasCustomer'">
                    <p class="col_name">{{ $t('crm.Table.col_mostRecentlyObtainedTime') }}</p>
                    <p class="col_value">
                        <span v-if="detailInfo.lastGetCompanyTime">{{ detailInfo.lastGetCompanyTime | timeFormat('DateTime') }}</span>
                        <span v-else> - </span>
                    </p>
                </Col>
                <!-- 最近成交时间 -->
                <Col :span="singleCol ? 24 : 12">
                    <p class="col_name">{{ $t('crm.Table.col_lastTransactionTime') }}</p>
                    <p class="col_value">
                        <span v-if="detailInfo.lastTransactionTime">{{detailInfo.lastTransactionTime | timeFormat('DateTime')}}</span>
                        <span v-else> - </span>
                    </p>
                </Col>
                <!-- 预计流入公海日期 -->
                <Col :span="singleCol ? 24 : 12" v-if="originalType !== 'highseasCustomer'">
                    <p class="col_name">{{ $t('crm.Table.col_inflowintoTheOpenSea') }}</p>
                    <p class="col_value">
                        <span v-if="detailInfo.predictGiveupTime">{{detailInfo.predictGiveupTime | timeFormat}}</span>
                        <span v-else> - </span>
                    </p>
                </Col>
                <!-- 成交询盘金额 -->
                <Col :span="singleCol ? 24 : 12">
                    <p class="col_name">{{ $t('crm.Table.col_transactionInquiryAmount') }}</p>
                    <p class="col_value">
                        <span v-if="detailInfo.transactionMoneyRmb"> ￥{{detailInfo.transactionMoneyRmb}}</span>
                        <span v-else> - </span>
                    </p>
                </Col>
                <!-- 成交询盘数 -->
                <Col :span="singleCol ? 24 : 12">
                    <p class="col_name">{{ $t('crm.Table.col_transactionInquiryNO') }}</p>
                    <p class="col_value" v-text="detailInfo.transactionInquiryCount ? detailInfo.transactionInquiryCount : '-'"></p>
                </Col>
            </template>
            <!-- 广告信息 -->
            <template v-if="detailInfo.visitorId && adInfo">
                <Col :span="singleCol ? 24 : 12">
                    <p class="col_name">{{$t('visitor_history.visit_source')}} </p>
                    <p class="col_value" v-text="adInfo.visitSource"></p>
                </Col>
                <Col :span="singleCol ? 24 : 12">
                    <p class="col_name">{{$t('visitor_history.traffic_source')}} </p>
                    <p class="col_value" v-text="adInfo.trafficSource"></p>
                </Col>
                <template
                        v-if="adInfo.trafficSource === 'Google广告' || adInfo.trafficSource === 'Facebook广告' || adInfo.trafficSource === '其他广告'">
                    <Col :span="singleCol ? 24 : 12">
                        <p class="col_name">{{$t('visitor_history.ad_type')}} </p>
                        <p class="col_value" v-text="adInfo.adType"></p>
                    </Col>
                    <Col :span="singleCol ? 24 : 12">
                        <p class="col_name">{{$t('visitor_history.ad_campaign_name')}} </p>
                        <p class="col_value" v-text="adInfo.adCampaignName"></p>
                    </Col>
                    <Col :span="singleCol ? 24 : 12">
                        <p class="col_name">
                            {{$t('visitor_history.ad_group_name')}} </p>
                        <p class="col_value" v-text="adInfo.adGroupName"></p>
                    </Col>
                    <Col :span="singleCol ? 24 : 12">
                        <p class="col_name">{{$t('visitor_history.ad_name')}} </p>
                        <p class="col_value" v-text="adInfo.adName"></p>
                    </Col>
                    <Col :span="singleCol ? 24 : 12">
                        <p class="col_name">{{$t('visitor_history.ad_keyword')}} </p>
                        <p class="col_value" v-text="adInfo.adKeyword"></p>
                    </Col>
                </template>
            </template>
        </Row>
        <Poptip ref="editPopover"
            :popper-class="['socialNetworkingPlatform'].includes(checkedColumn.key) ? 'table-edit-box-popper socialNetworkingPlatform' :'table-edit-box-popper'"
            v-model="visibleEdit"
            placement="top-end"
            :reference="prevTarget"
            :key="popperFlag"
            :width="checkedColumn.width"
            @hide="clearEditPopperComponent"
            :popper-options="popperOptions"
        >
            <div class="table-edit-box">
                <Form
                    class="table-edit-form"
                    inline
                    :validate-on-rule-change="false"
                    label-position="left"
                    label-width="90px"
                >
                    <CrmInputArea ref="crmInputArea"
                                :data.sync="tempDetail"
                                :items="corp_item_all"
                                :selectOptions="computed_selectOptions"
                                :pictures.sync="detailPictures"
                                :error_countryArea.sync="error_countryArea"
                                :contactAddressLatLng.sync="contactAddressLatLng"
                                :email_editing="email_editing"
                                :email_saving="email_saving"
                                @uniqCompany="uniqCompany"
                                :estimatedInquiryAmount.sync="estimatedInquiryAmount"
                                :estimatedInquiryAmountCurrency.sync="estimatedInquiryAmountCurrency"
                                :transactionInfo.sync="transactionInfo"
                                ></CrmInputArea>
                </Form>
                <div class="table-edit-box-buttons">
                    <Button @click="clearEditPopperComponent" type="text">{{ $t('crm.Modal.modal_cancel') }}</Button>
                    <Button type="text" @click="ok" class="table-edit-box-button-sure" :disabled="loading">{{ $t('crm.Modal.modal_ok') }}</Button>
                </div>
            </div>
        </Poptip>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import Utils from '@/utils/index';
    import globalWaReplyModal from '@/mixins/globalWaReplyModal';
    import CrmInputArea from '@/views/crm/Detail/Components/Modal/fixed-modal-form/crm-input-area';
    import { crmCommon, crmCompany } from '@/api/crm/index';
    import { mapState, mapGetters } from 'vuex';
    export default {
        name: 'detailInfo',
        mixins: [globalWaReplyModal],
        components: {
            CrmInputArea
        },
        props: [
            'type',
            'id',
            'columns_authorized',
            'flag_update_detail',
            'singleCol',
            'flag_refresh_contact',
            'canEditCompany',
            'isHighSeas',
            'companyId',
            'from',
            'originalType'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                fullName: 'fullName',
                userId: 'userId',
                lang: state => state.app.lang,
                selectOptions: state => state.crm.selectOptions
            }), // 从 vuex 中
            ...mapGetters([
                // 字段长度校验
                'check_length_default',
                'check_length_custom',
                'corp_items',
                'inquiry_items',
                'contact_items'
            ]),
            url_request_detail() {
                switch (this.type) {
                    case 'customer':
                    case 'highseasCustomer':
                        return '/crm/company/get';
                    case 'inquiry':
                        return '/crm/inquiry/get';
                    case 'contact':
                        return '/crm/contacts/get';
                    default:
                        return '';
                }
            },
            columns_all() {
                /* 存放顺序数组 */
                // 存放 colOrder 正常的字段名
                let arr_haveNoColOrder = [];
                // 存放 colOrder 正常的字段名
                let arr_sort = [];
                // 存放 colOrder 1000 或重复的 colOrder
                const arr_renew = [];

                /* 存放字段 */
                let arr_default = [];
                let arr_custom = [];
                /* 处理默认字段 */
                if (this.columns_authorized && Array.isArray(this.columns_authorized.default)) {
                    arr_default = this.columns_authorized.default.filter(item => !item.manually).map(item => {
                        if (item.colOrder) {
                            if (arr_sort[item.colOrder]) {
                                arr_renew.push(item.storageName);
                            } else {
                                arr_sort[item.colOrder] = item.storageName;
                            }
                        } else {
                            arr_haveNoColOrder.push(item.storageName);
                        }

                        if (item.colType === 'textarea') {
                            item.span = 24;
                        }

                        item.fieldType = 'default';

                        return item;
                    });
                }

                /* 延续字段设置的逻辑, 一旦发现有默认字段 colOrder 为空, 则默认字段不参与排序, 全部顺序展示 */
                if (arr_haveNoColOrder.length) {
                    arr_sort = [];
                    arr_haveNoColOrder = arr_default.map(item => item.storageName);

                    // 把授权默认字段按默认字段顺序排列
                    if (this.default_arr_order[this.type]) {
                        arr_haveNoColOrder = this.default_arr_order[this.type].filter(item => arr_haveNoColOrder.includes(item));
                    }
                }

                /* 处理自定义字段 */
                if (this.columns_authorized && Array.isArray(this.columns_authorized.custom)) {
                    arr_custom = this.columns_authorized.custom.filter(item => item.isShow === 1).map(item => {
                        if (`${item.colOrder}` === '1000' || !item.colOrder) {
                            arr_renew.push(item.storageName);
                        } else {
                            if (arr_sort[item.colOrder]) {
                                arr_renew.push(item.storageName);
                            } else {
                                arr_sort[item.colOrder] = item.storageName;
                            }
                        }

                        item.fieldType = 'custom';

                        return item;
                    });
                }

                /* 字段排序 */
                const arr_all = arr_default.concat(arr_custom);
                const result = arr_haveNoColOrder.concat(arr_sort.filter(item => !(!item || item === '')), arr_renew).map(item => arr_all.find(col => item === col.storageName)).filter(item => !(!item || item === ''));
                const tempIndex = result.findIndex(item => item.colType === 'followUp');
                if (tempIndex !== -1 && Array.isArray(this.selectOptions.followUp)) {
                    /**
                     * @Description: 成交状态之后的跟进状态都要显示‘成交时间’和‘成交金额’
                     * @author mayuanzhi
                     * @date 2020/6/1
                    */
                    let temp_followUp = {};
                    let temp = false;
                    this.selectOptions.followUp.map(item => {
                        if (item.transactionStatus === 1) {
                            temp = true;
                        }
                        item.transactionStatusTemp = temp;
                        if (`${item.attrId}` === `${this.detailInfo.followUpId}`) {
                            temp_followUp = item;
                        }
                    });
                    if (temp_followUp && temp_followUp.transactionStatusTemp) {
                        result.splice(tempIndex + 1, 0, {
                            cname: this.$t('crm.Modal.transactionTime'),
                            storageName: 'transactionTime',
                            colType: 'date'
                        }, {
                            cname: this.$t('crm.Modal.transactionMoney'),
                            storageName: 'transactionMoney'
                        }, {
                            cname: this.$t('crm.Modal.transactionInfo'),
                            storageName: 'transactionInfo',
                            span: 24
                        });
                    }
                }
                if (this.type === 'customer' || this.type === 'highseasCustomer') {
                    result.splice(1, 0, {
                        cname: this.$t('crm.Table.col_customerNumber'),
                        colDefaultValue: this.$t('crm.Table.col_customerNumber'),
                        colOrder: 2,
                        colType: 'autoSeq',
                        fieldType: 'default',
                        isHide: null,
                        isOnlyRead: 0,
                        isShow: 1,
                        maxLength: 200,
                        mustInput: 1,
                        option: null,
                        orgId: 10110,
                        parentId: 1,
                        roleId: null,
                        storageName: 'autoSeq',
                        type: 1
                    });
                }
                return result;
            },
            computed_selectOptions() {
                const result = {};
                Object.entries(this.$deepClone(this.selectOptions)).forEach(([key, value]) => {
                    result[key] = value.filter(item => item.isAvailable === 1);
                });
                return result;
            }
        },
        data() {
            return {
                detailInfo: {},
                adInfo: {},
                loading: true,

                // 所有自定义字段 colOrder 都为空时的字段顺序, 从字段设置组件中取得
                default_arr_order: {
                    customer: ['companyName', 'autoSeq', 'shortName', 'mainProduct', 'clientType', 'starLevel', 'countryArea', 'scale', 'homePage', 'fax', 'phone', 'contactAddress', 'relatedCompany', 'companyRemark', 'companyPicture'],
                    contact: ['nickName', 'email', 'jobGrade', 'jobTitle', 'phone', 'whatsApp', 'instagram', 'socialNetworkingPlatform', 'birthday', 'gender', 'remark', 'picture'],
                    inquiry: ['productCategory', 'demandProducts', 'label', 'inquiryScore', 'grouping', 'sourceChannel', 'sourceWay', 'followUp', 'remark']
                },
                visibleEdit: false,
                prevTarget: null,
                popperFlag: false,
                email_editing: false,
                email_saving: false,
                error_countryArea: false,
                estimatedInquiryAmount: null,
                estimatedInquiryAmountCurrency: 'CNY',
                transactionInfo: null,
                detailPictures: [],
                corp_item_all: [],
                tempDetail: {},
                checkedColumn: {
                    offset: [1, 1],
                    width: '',
                    key: ''
                },
                popperOptions: {
                    boundariesElement: 'body',
                    positionFixed: true,
                    adaptive: false
                },
                contactAddressLatLng: '',
                notEditField: ['companyPicture', 'autoSeq', 'companyManagers', 'companyManagerDepartments', 'createUser', 'marker', 'followUpCount', 'touchCount', 'notFollowedDays', 'dynamic', 'lastFollowUpTime', 'createTime', 'updateTime']
            };
        },
        methods: {
            // 点击编辑
            handleClickEdit(column, e) {
                const key = column.storageName;
                // 处理多选的数据格式
                if (column.colType === 'selectMultiple') {
                    this.tempDetail[key] = this.$options.filters.parseArray(this.tempDetail[key]);
                }
                const path = e.path || (e.composedPath && e.composedPath());
                const currentTarget = Array.isArray(path) ? path[0] : e.currentTarget; // 赋值当前点击的编辑
                this.parentFiled = column.parentId;
                this.$set(this.checkedColumn, 'key', key);
                this.$set(this.checkedColumn, 'width', column.width + 90);
                this.parentFiled = column.parentId;
                if (this.parentFiled === 1) {
                    this.corp_item_all = [column];
                } else {
                    this.$Message.warning(this.$t('crm.Table.system_fields_cannotEdit'));
                    return;
                }
                this.editKey = column.key;
                if (['countryArea', 'contactAddress'].includes(key)) {
                    crmCompany.getCompany({ id: this.id }).then(resCompany => {
                        if (resCompany.code === '1') {
                            if (key === 'countryArea') {
                                this.tempDetail[key] = resCompany.data.countryArea;
                            } else {
                                this.tempDetail[key] = resCompany.data.contactAddress;
                                this.tempDetail.point = resCompany.data.point;
                            }
                            // 判断是否需要切换
                            if (this.prevTarget === currentTarget) {
                                // 同一个元素重复点击
                                this.visibleEdit = !this.visibleEdit;
                            } else {
                                // 切换不同元素, 判断之前是否有点击其他编辑 prevTarget
                                if (this.prevTarget) {
                                    // 先清除之前的编辑框
                                    this.clearEditPopperComponent();
                                    // 然后生成新的编辑框
                                    this.$nextTick(() => {
                                        this.prevTarget = currentTarget;
                                        this.visibleEdit = true;
                                        this.$nextTick(() => {
                                            if (this.$refs.crmInputArea.$refs[key]) {
                                                this.$refs.crmInputArea.$refs[key][0].focus();
                                            }
                                        });
                                    });
                                } else {
                                    this.prevTarget = currentTarget;
                                    this.$nextTick(() => {
                                        this.visibleEdit = true;
                                    });
                                    setTimeout(() => {
                                        if (this.$refs.crmInputArea.$refs[key]) {
                                            this.$refs.crmInputArea.$refs[key][0].focus();
                                        }
                                    }, 100);
                                }
                            }
                        }
                    });
                } else {
                    // 判断是否需要切换
                    if (this.prevTarget === currentTarget) {
                        // 同一个元素重复点击
                        this.visibleEdit = !this.visibleEdit;
                    } else {
                        // 切换不同元素, 判断之前是否有点击其他编辑 prevTarget
                        if (this.prevTarget) {
                            // 先清除之前的编辑框
                            this.clearEditPopperComponent();
                            // 然后生成新的编辑框
                            this.$nextTick(() => {
                                this.prevTarget = currentTarget;
                                this.visibleEdit = true;
                                this.$nextTick(() => {
                                    if (this.$refs.crmInputArea.$refs[key]) {
                                        this.$refs.crmInputArea.$refs[key][0].focus();
                                    }
                                });
                            });
                        } else {
                            this.prevTarget = currentTarget;
                            this.$nextTick(() => {
                                this.visibleEdit = true;
                            });
                            setTimeout(() => {
                                if (this.$refs.crmInputArea.$refs[key]) {
                                    this.$refs.crmInputArea.$refs[key][0].focus();
                                }
                            }, 100);
                        }
                    }
                }
            },
            /* 公司去重 */
            uniqCompany() {
                if (this.tempDetail.companyName !== '') {
                    const data = {
                        orgId: this.enterpriseId,
                        companyName: String(this.tempDetail.companyName),
                        id: this.tempDetail.id
                    };
                    crmCompany.sameCompanyName(data).then(response => {
                        if (response.data && this.tempDetail.companyName !== this.columns_all.companyName) {
                            this.$Message.error(this.$t('crm.Modal.error_existedCompanyName'));
                        } else {
                            this.$Message.success(this.$t('crm.Modal.success_uniqCompanyName'));
                        }
                    });
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_emptyCompanyName'));
                }
            },
            async ok() {
                // 如果当前正在录入, 则退出录入
                if (this.loading) {
                    this.$Message.warning(this.$t('mail.customerBox.requestTip'));
                    return;
                }
                // 图片是否上传完成
                if (Array.isArray(this.detailPictures) && this.detailPictures.some(item => item.uploading)) {
                    this.$Message.warning(this.$t('crm.Modal.info_contactPictureUploading'));
                    return;
                }
                // 校验社交平台信息是否填完整
                if (this.tempDetail.socialNetworkingPlatform && this.tempDetail.socialNetworkingPlatform.length && (this.socialPlatformsFlag() === '1' || this.socialPlatformsFlag() === '2')) {
                    const str = this.socialPlatformsFlag() === '2' ? '社交平台分类不能为空' : '社交平台内容不能为空';
                    this.$Message.error(str);
                    return;
                }
                if (this.parentFiled === 1) {
                    // 各种合法性校验
                    // 公司名不能为空
                    if (this.tempDetail.companyName && !this.tempDetail.companyName.trim()) {
                        this.$Message.error(this.$t('crm.Modal.error_emptyCompanyName'));
                        return;
                    }
                    // 必填字段校验
                    let tempErrorField = '';
                    let countryAreaName = '';
                    if (this.corp_item_all.some(item => {
                        if (item.mustInput === 1) {
                            if (item.storageName === 'companyPicture') {
                                if (this.detailPictures.length === 0) {
                                    tempErrorField = item.cname;
                                    return true;
                                }
                            } else {
                                if (!this.tempDetail[item.storageName] || this.tempDetail[item.storageName].length === 0) {
                                    if (item.isOnlyRead !== 1) {
                                        tempErrorField = item.cname;
                                        return true;
                                    }
                                }
                            }
                        }
                    })) {
                        this.$Message.error(`${tempErrorField}${this.$t('crm.Modal.error_canNotBeEmpty')}`);
                        return;
                    }
                    // 正体
                    this.loading = true;
                    // 校验公司名
                    if (this.corp_item_all && this.corp_item_all.some(item => item.storageName === 'companyName') && this.tempDetail.companyName !== this.detailInfo.companyName) {
                        const res_uniqCompanyName = await crmCompany.sameCompanyName({
                            orgId: this.enterpriseId,
                            companyName: this.tempDetail.companyName,
                            id: this.tempDetail.id
                        });
                        if (res_uniqCompanyName.data && this.tempDetail.companyName !== this.detailInfo.companyName) {
                            this.$Message.error(this.$t('crm.Modal.error_existedCompanyName'));
                            this.loading = false;
                        }
                    }

                    // 校验国家地区, 非只读情况下
                    if (this.loading) {
                        const temp = this.corp_item_all.find(item => item.storageName === 'countryArea');
                        if (temp && this.tempDetail.countryArea) {
                            if (temp.isOnlyRead !== 1) {
                                const res_getCountryArea = await this.$commonApi.getDetailByCode({
                                    divCode: this.tempDetail.countryArea
                                });
                                if (!(Array.isArray(res_getCountryArea.data) && res_getCountryArea.data.length)) {
                                    this.$Message.error(this.$t('crm.Modal.error_countryAreaFormat'));
                                    this.error_countryArea = true;
                                    this.loading = false;
                                } else {
                                    countryAreaName = this.lang === 'zh-CN' ? `${res_getCountryArea.data[0].countryName}-${res_getCountryArea.data[0].divisionCnname}` : `${res_getCountryArea.data[0].countryEnname}-${res_getCountryArea.data[0].divisionEnname}`;
                                }
                            }
                        }
                    }

                    // 校验都通过
                    if (this.loading) {
                        const send_data = {
                            id: this.tempDetail.id,
                            orgId: this.enterpriseId,
                            companyName: this.detailInfo.companyName
                        };
                        this.corp_item_all.forEach(item => {
                            if (item.isOnlyRead !== 1) {
                                switch (item.storageName) {
                                    case 'companyPicture':
                                        this.tempDetail.companyPicture = this.detailPictures.map(pic => pic.url).join(';');
                                        send_data.companyPicture = this.detailPictures.map(pic => pic.url).join(';');
                                        break;
                                    case 'contactAddress':
                                        send_data[item.storageName] = this.tempDetail[item.storageName];
                                        send_data.point = this.tempDetail.point;
                                        break;
                                    default:
                                        switch (item.colType) {
                                            case 'selectMultiple':
                                                const temp = Array.isArray(this.tempDetail[item.storageName]) ? JSON.stringify(this.tempDetail[item.storageName]) : JSON.stringify([]);
                                                send_data[item.storageName] = temp;
                                                break;
                                            case 'select':
                                                send_data[item.storageName] = this.tempDetail[item.storageName] || '';
                                                break;
                                            default:
                                                send_data[item.storageName] = this.tempDetail[item.storageName];
                                        }
                                }
                            }
                        });
                        // /* 检验字段是否超长 */
                        if (this.check_length_default('corp_field_long_limit', send_data) || this.check_length_custom('corp_item_custom', this.corp_item_all, send_data)) {
                            this.loading = false;
                            return false;
                        }
                        const updateFieldData = {
                            userId: this.userId,
                            userName: this.fullName,
                            idStr: this.tempDetail.id,
                            orgId: this.enterpriseId,
                            tableType: 1,
                            fieldName: this.checkedColumn.key,
                            fieldValue: send_data[this.checkedColumn.key]
                        };
                        if (this.checkedColumn.key === 'contactAddress') {
                            if (this.contactAddressLatLng) {
                                updateFieldData.point = `${this.contactAddressLatLng.lng},${this.contactAddressLatLng.lat}`;
                            }
                        }
                        crmCommon.updateField(updateFieldData).then(response => {
                            this.loading = false;
                            if (response.code === '1') {
                                this.$saveLog({
                                    operateType: 2,
                                    operateModule: 1,
                                    companyId: this.detailInfo.id,
                                    targetId: this.detailInfo.id,
                                    enterpriseId: this.enterpriseId.toString(),
                                    userId: this.userId,
                                    fullName: this.fullName,
                                    prevObj: Object.assign({}, this.detailInfo),
                                    currentObj: Object.assign({}, this.tempDetail)
                                }, 'company');
                                this.$Message.success(this.$t('crm.Detail.success_editTable'));
                                if (this.checkedColumn.key === 'countryArea') {
                                    this.detailInfo[this.checkedColumn.key] = countryAreaName.replace(/-未知地区|-unknown area/g, '');
                                } else {
                                    this.detailInfo[this.checkedColumn.key] = send_data[this.checkedColumn.key];
                                }
                                this.contactAddressLatLng = '';
                                this.clearEditPopperComponent();
                            } else {
                                this.$Message.error(this.$t('crm.Detail.error_editTable'));
                            }
                        }, error => {
                            this.loading = false;
                        }).catch(error => {
                            this.loading = false;
                        });
                    }
                }
            },
            clearEditPopperComponent() {
                this.prevTarget = null;
                this.popperFlag = !this.popperFlag;
                this.visibleEdit = false;
            },
            getDetail() {
                // this.$store.dispatch('getAllUsers');
                this.adInfo = {};
                if (this.url_request_detail) {
                    util.ajax({
                        url: this.url_request_detail,
                        method: 'post',
                        data: {
                            lang: this.lang,
                            id: this.id
                        }
                    }).then(async response => {
                        /**
                         * @Description: 一飞说这个接口返回的label不准，需另外请求label
                         * @author mayuanzhi
                         * @date 2020/4/28
                        */
                        // @date 2021/11/08 与嘉璐沟通，后端取lable也是使用前端获取lable接口返回的数据一致，故不再多请求
                        if (response.data.code === '1') {
                            this.detailInfo = response.data.data;
                            this.tempDetail = this.$deepClone(this.detailInfo);
                            switch (this.type) {
                                case 'inquiry':
                                    // 处理成交信息
                                    this.detailInfo.transactionInfo = this.handleTransactionInfo(this.detailInfo.transactionInfo, this.detailInfo.sysCreateFlag);
                                    this.detailInfo.transactionMoney = (this.detailInfo.transactionMoneyCurrency && this.detailInfo.transactionMoney != null) ? (Utils.getCurrencySymbol(this.detailInfo.transactionMoneyCurrency).symbol + Utils.transformMoney(this.detailInfo.transactionMoney)) : '-';
                                    this.detailInfo.estimatedInquiryAmount = (this.detailInfo.estimatedInquiryAmountCurrency && this.detailInfo.estimatedInquiryAmount != null) ? (Utils.getCurrencySymbol(this.detailInfo.estimatedInquiryAmountCurrency).symbol + Utils.transformMoney(this.detailInfo.estimatedInquiryAmount)) : '-';

                                    // 标签
                                    this.detailInfo.label = this.detailInfo.label ? JSON.parse(this.detailInfo.label) : [];
                                    // 访客信息
                                    this.adInfo = this.detailInfo.adDetail;
                                    // 跟进状态
                                    let str = '';
                                    if (/\d+/.test(`${this.detailInfo.followUpId}`)) {
                                        if (`${this.detailInfo.followUpId}` === '-1') {
                                            str = this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry');
                                        }
                                        const temp = this.selectOptions.followUp ? this.selectOptions.followUp.find(item => `${item.attrId}` === `${this.detailInfo.followUpId}`) : undefined;
                                        str = temp ? temp.attrName : str;
                                    } else {
                                        str = this.detailInfo.followUp || '';
                                    }
                                    this.detailInfo.followUp = str;
                                    break;
                                case 'contact':
                                    // 主要联系人 页面中的使用被注释了，改判断可删除
                                    if (Array.isArray(this.detailInfo.inquiryList)) {
                                        this.detailInfo.isMainContact = this.detailInfo.inquiryList.some(item => item.isMainContact === 1);
                                    }
                                    break;
                                case 'customer':
                                case 'highseasCustomer':
                                    this.detailInfo.transactionMoneyRmb = this.detailInfo.transactionMoneyRmb ? Utils.transformMoney(this.detailInfo.transactionMoneyRmb) : '';
                                    break;
                            }
                        } else {
                            switch (this.type) {
                                case 'customer':
                                case 'highseasCustomer':
                                    this.$Message.error(this.$t('crm.Detail.error_getCompanyInfo'));
                                    break;
                                case 'inquiry':
                                    this.$Message.error(this.$t('crm.Detail.error_getInquiryInfo'));
                                    break;
                                case 'contact':
                                    this.$Message.error(this.$t('crm.Detail.error_getContactInfo'));
                                    break;
                            }
                        }
                        this.loading = false;
                    }, error => {
                        this.loading = false;
                    }).catch(error => {
                        this.loading = false;
                    });
                } else {
                    this.$Message.error(this.$t('crm.newDetail.error_urlRequest'));
                    this.loading = false;
                }
            },
            // 处理成交信息
            handleTransactionInfo(val, sysCreateFlag) {
                // 无成交信息, 直接退出流程
                if (!val) {
                    return;
                }

                let result = '';
                // 根据不同成交信息来源返回不同数据
                switch (`${sysCreateFlag}`) {
                    case '1':
                        // magento
                        result = JSON.parse(val);
                        result = `来自网站的订单信息
                        Order Number: ${result.orderId}
                        1. Order Summary:
                            Order Total: ${result.cart.subtotal}
                            ${result.cart.summary_count} item${(result.cart.summary_count > 1) ? 's' : ''} in Cart:
                        ${result.cart.items.map((item, index) => `        ${index + 1}. ${item.product_name}; Qty: ${item.qty}; Price: ${item.product_price}; ${item.options.map(option => `${option.label}: ${option.value}`).join('; ')}\n            商品链接: ${item.product_url};`).join('\n')}
                        2. Shipping Address:
                            ${result.shippingAddress.first_name || ''} ${result.shippingAddress.last_name || ''}
                            ${result.shippingAddress.street_address || ''}
                            ${result.shippingAddress.city_state_province_postal_code || ''}
                            ${result.shippingAddress.country || ''}
                            ${result.shippingAddress.phone || ''}
                        3. Billing Address:
                            ${result.billingAddress.first_name || ''} ${result.billingAddress.last_name || ''}
                            ${result.billingAddress.street_address || ''}
                            ${result.billingAddress.city_state_province_postal_code || ''}
                            ${result.billingAddress.country || ''}
                            ${result.billingAddress.phone || ''}
                        `;
                        result = result.replace(/\n(\n)*( )*(\n)*\n/g, '\n');
                        break;
                    case '2':
                        // shopify
                        result = JSON.parse(val);
                        result = `来自网站的订单信息
                        Order Number: ${result.order_number}
                        1. Order Summary:
                            total price: ${result.total_price} ${result.presentment_currency}; total line items price: ${result.total_line_items_price} ${result.presentment_currency}; total tax: ${result.total_tax} ${result.presentment_currency}; total tip_received: ${result.total_tip_received} ${result.presentment_currency};
                            ${result.line_items.length} Item${(result.line_items.length > 1) ? 's' : ''} in Cart:
                        ${result.line_items.map((item, index) => `        ${index + 1}. ${item.title}; Qty: ${item.quantity}; Price: ${item.price} ${result.presentment_currency};`).join('\n')}
                        2. Shipping Address:
                            ${result.shipping_address.name || ''}
                            ${result.shipping_address.company || ''}
                            ${result.shipping_address.address1 || ''} ${result.shipping_address.address2 || ''}
                            ${result.shipping_address.city || ''} ${result.shipping_address.province || ''} ${result.shipping_address.zip || ''}
                            ${result.shipping_address.country || ''}
                            ${result.shipping_address.phone || ''}
                        3. Billing Address:
                            ${result.billing_address.name || ''}
                            ${result.billing_address.company || ''}
                            ${result.billing_address.address1 || ''} ${result.billing_address.address2 || ''}
                            ${result.billing_address.city || ''} ${result.billing_address.province || ''} ${result.billing_address.zip || ''}
                            ${result.billing_address.country || ''}
                            ${result.billing_address.phone || ''}
                        `;
                        result = result.replace(/\n(\n)*( )*(\n)*\n/g, '\n');
                        break;
                    default:
                        // 默认手动创建
                        result = val;
                }

                return result;
            },

            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            },
            // 打开发信弹窗
            quickSend(data) {
                if (data.email) {
                    const emails = [{
                        receiverName: data.nickName || '',
                        receiveMailAddress: data.email,
                        followUpId: ['customer', 'contact'].includes(this.type) ? `${this.companyId}` : `${this.id}`,
                        followUpType: ['customer', 'contact'].includes(this.type) ? 3 : 2
                    }];
                    localStorage.setItem('leadsCloud-sendMail-contacts', JSON.stringify(emails));
                    // 打开写信弹窗之前先判断有没有已经打开的写信弹窗
                    const doc = document.getElementById('mail_detail_modal');
                    if (!doc) {
                        this.$store.commit('setQuickSendMailVisible', true);
                    }
                }
            }
        },
        created() {
            // this.loading = true;
            // this.getDetail();
        },
        watch: {
            flag_update_detail: {
                handler() {
                    this.loading = true;
                    this.getDetail();
                },
                immediate: true
            },
            flag_refresh_contact() {
                if (this.type === 'contact') {
                    this.loading = true;
                    this.getDetail();
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .col_name_small {
        margin-top: 10px;
        margin-bottom: 5px;
        font-size: 12px;
    }

    .detail-info {
        position: relative;
        min-height: 200px;
        margin-bottom: 16px;

        /*&-operate {*/
        /*    visibility: hidden;*/
        /*}*/

        /*&:hover {*/
        /*    .detail-info-operate {*/
        /*        visibility: visible;*/
        /*    }*/
        /*}*/
    }

    // .detail-info-body {
    //     margin-left: 0 !important;
    //     margin-right: 0 !important;
    //     // margin-top: 0 !important;
    // }

    // 邮件模块侧滑页详情显示布局
    .from_malil_detail_info{

        /deep/ .el-col-24{
            line-height: 18px;
            display: flex;

            .table-show-edit{
                display: none;
                width: 14px;
                height: 14px;
                font-size: 14px;
                color: #666;
                margin-left: 12px;
                &.custom-bianji-normal{
                    width: 22px;
                    height: 22px;
                    font-size: 22px;
                  }
            }

            &:hover{
                .table-show-edit{
                    display: inline-block;
                    &:hover{
                        color: #ff7f39;
                    }
                }
            }
        }

        .col_name_normal{
            display: inline-block;
            margin-bottom: 16px;
        }

        .col_value{
            display: inline-block;
            margin-bottom: 16px;
            flex: 1;
        }

        .col_name{
            margin-bottom: 16px;
            line-height: 16px;
            margin-top: 0;
        }
    }

    .table-edit-box{
        padding: 16px;
        left: 0 !important;

         .table-edit-form{
            margin-right: 0;;
         }

        .table-edit-box-buttons{
            position: relative;
            border-radius: 0;
            text-align: right;
            top: 0;
            width: auto;
            background: none;
            box-shadow: 0 0;
            line-height: 24px;
            margin-top: 12px;
        }
    }
</style>
