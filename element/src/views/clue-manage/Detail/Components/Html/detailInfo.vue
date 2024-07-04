<template>
    <div style="position: relative;min-height: 200px;margin-bottom:16px;margin-top:16px;"
        :style="fromType === 'FB_inbox'? 'padding: 0 20px;' : ['mail', 'mail_detail'].includes(from) ? 'height: calc(100vh - 344px);overflow-y: auto;margin-bottom:0;' : ''">
        <Spin v-if="loading" size="large" fix></Spin>
        <Row  v-if="['mail', 'mail_detail','whatsApp'].includes(from)" class="from_malil_detail_info">
            <!-- 线索编号和访客id -->
            <template v-for="item in info_items_id">
                <template v-if="item.storageName === 'inquiryId'">
                    <Col v-if="inquiryId" :span="24">
                        <span class="col_name_normal">{{ item.cname }}：</span>
                        <span class="col_value inquiry-number"
                           v-text="detailInfo.inquirySeqNumber ? detailInfo.inquirySeqNumber : '-'" @click="jumpToInquiry"></span>
                    </Col>
                </template>
                <template v-else>
                    <Col :span="24">
                        <span class="col_name_normal">{{ item.cname }}：</span>
                        <span class="col_value" v-text="detailInfo[item.storageName] ? detailInfo[item.storageName] : '-'"></span>
                    </Col>
                </template>
            </template>

            <!-- 访客信息 可编辑 -->
            <Col v-for="(item, index) in fieldsList" :span="24" :key="item.key + index">

                <span class="col_name_normal">{{ item.name }}：</span>

                <!-- whatsApp -->
                <template v-if="type !== 'highseasClue' && item.key === 'a10052' && detailInfo[item.key] && !is_marketing_station">
                    <!-- 点击打开 wa 回复框 -->
                    <span @click="openGlobalWaReplyModal(detailInfo[item.key], $event)"
                       v-text="detailInfo[item.key] || '-'"
                       class="col_value header-source"></span>
                </template>
                <!-- 社交平台 -->
                <template v-else-if="item.key === 'a10013'">
                    <template v-if="$options.filters.parseArray(detailInfo[item.key]).length">
                        <span class="col_value" v-for="(platform, index) in $options.filters.parseArray(detailInfo[item.key])" :key="platform.account + index">
                            <span v-if="platform.type">{{ platform.type + ': ' + platform.account }}</span>
                            <span v-else>{{ platform.attrName + ': ' + platform.attrValue }}</span>
                        </span>
                    </template>
                    <template v-else-if="detailInfo[item.key] === '[]'">
                        <span></span>
                    </template>
                    <template v-else>
                        <span class="col_value" v-text="detailInfo[item.key] ? detailInfo[item.key] : '-'"></span>
                    </template>
                </template>
                <!-- 标签 -->
                <template v-else-if="item.key === 'a10017'">
                    <div style="flex: 1;">
                        <!-- TODO: 已删除标签样式区分
                            :color="labelItem.isAvailable ? labelItem.attrValue : 'gray'"
                            :style="{
                                'text-decoration': labelItem.isAvailable ? '' : 'line-through'
                            }"
                        -->
                        <Tag :key="labelItem.attrId" v-for="labelItem in $options.filters.tagFilter(detailInfo[item.key])"
                            style="margin:0 10px 5px 0;color: #ffffff"
                            :color="labelItem.attrValue ? labelItem.attrValue : '#4285F4'"
                        >
                            {{ labelItem.attrName || labelItem || '-'}}
                        </Tag>
                    </div>
                </template>
                <template v-else-if="item.key === 'a10010'">
                    <a v-if="type !== 'highseasClue'" href="javascript:void(0)" class="ct_email" @click.stop="quickSend(detailInfo)">
                        {{ detailInfo[item.key] ? detailInfo[item.key] : '-' }}
                    </a>
                    <span v-else class="col_value textAreaShow">{{ detailInfo[item.key] ? detailInfo[item.key] : '-' }}</span>
                </template>
                <template v-else-if="item.type === 'textarea'">
                    <span class="col_value textAreaShow">{{ detailInfo[item.key] ? detailInfo[item.key] : '-' }}</span>
                </template>
                <template v-else-if="item.type === 'date'">
                    <span class="col_value">{{ detailInfo[item.key] | timeFormat }}</span>
                </template>
                <template v-else-if="item.type === 'date+time'">
                    <span class="col_value">{{ detailInfo[item.key] | timeFormat('DateTime') }}</span>
                </template>
                <template v-else-if="item.type === 'selectMultiple'">
                    <span class="col_value" v-text="(detailInfo[item.key] && detailInfo[item.key].indexOf('[') == -1 )? detailInfo[item.key]: ($options.filters.parseArray(detailInfo[item.key]).length > 0 ? $options.filters.parseArray(detailInfo[item.key]).join(', '): '-')"></span>
                    <!-- <p class="col_value" v-text="$options.filters.parseArray(detailInfo[item.key]).length? $options.filters.parseArray(detailInfo[item.key]).join(', '):detailInfo[item.key]"></p> -->
                </template>

                <template v-else>
                    <span class="col_value" v-text="detailInfo[item.key] ? detailInfo[item.key] : '-'"></span>
                </template>
                <span @click.stop @click="handleClickEdit(item, $event)" v-if="item.key !== 'a10010' && originalType === 'clue'" style="width:26px;">
                    <a href="javascript:void(0)" class="table-show-edit custom custom-remark-edit"></a>
                </span>
            </Col>

            <!-- 访客信息 不可编辑 -->
            <Col v-for="(item, index) in info_items_others" :span="24" :key="item.cname + index">
                <span class="col_name_normal">{{ item.cname }}：</span>
                <template v-if="item.storageName === 'createTime'">
                    <span class="col_value">{{ detailInfo.createTime | timeFormat('DateTime') }}</span>
                </template>
                <template v-else-if="item.storageName === 'source_type'">
                    <span class="col_value" v-text="source_type ? source_type : '-'"></span>
                </template>
                <template v-else-if="item.storageName === 'leadsSubmitTime'">
                    <span class="col_value">{{ detailInfo.leadsSubmitTime | leadsTimeFormat }}</span>
                </template>
                <template v-else>
                    <span class="col_value" v-text="detailInfo[item.storageName] ? detailInfo[item.storageName] : '-'"></span>
                </template>
            </Col>


            <!-- 广告信息 -->
            <template v-if="detailInfo.proj && adInfo">
                <Col :span="24">
                    <span class="col_name_normal">{{$t('visitor_history.visit_source')}}：</span>
                    <span class="col_value" v-text="adInfo.visitSource ? adInfo.visitSource : '-'"></span>
                </Col>
                <Col :span="24" >
                    <span class="col_name_normal" >{{$t('visitor_history.traffic_source')}}：</span>
                    <span class="col_value" v-text="adInfo.trafficSource ? adInfo.trafficSource : '-'"></span>
                </Col>
                <!--Google广告、Facebook广告、其他广告-->
                <template v-if="adInfo.trafficSource === 'Google广告' || adInfo.trafficSource === 'Facebook广告' || adInfo.trafficSource === '其他广告'">
                    <Col :span="24">
                        <span class="col_name_normal">{{$t('visitor_history.ad_type')}}：</span>
                        <span class="col_value" v-text="adInfo.adType ? adInfo.adType : '-'"></span>
                    </Col>
                    <Col :span="24">
                        <span class="col_name_normal">{{$t('visitor_history.ad_campaign_name')}}：</span>
                        <span class="col_value" v-text="adInfo.adCampaignName ? adInfo.adCampaignName : '-'"></span>
                    </Col>
                    <Col :span="24">
                        <span class="col_name_normal">{{$t('visitor_history.ad_group_name')}}：</span>
                        <span class="col_value" v-text="adInfo.adGroupName ? adInfo.adGroupName : '-'"></span>
                    </Col>
                    <Col :span="24">
                        <span class="col_name_normal">{{$t('visitor_history.ad_name')}}：</span>
                        <span class="col_value" v-text="adInfo.adName ? adInfo.adName : '-'"></span>
                    </Col>
                    <Col :span="24">
                        <span class="col_name_normal">{{$t('visitor_history.ad_keyword')}}：</span>
                        <span class="col_value" v-text="adInfo.adKeyword ? adInfo.adKeyword : '-'"></span>
                    </Col>
                </template>
            </template>
        </Row>
        <Row :gutter="32" style="flex-direction: row;flex-wrap: wrap;" type="flex" v-else>
            <!-- 线索编号和访客id -->
            <template v-for="item in info_items_id">
                <template v-if="item.storageName === 'inquiryId'">
                    <Col v-if="inquiryId" :span="singleCol ? 24 :item.span">
                        <p class="col_name_normal">{{ item.cname }}</p>
                        <p class="col_value inquiry-number"
                           v-text="detailInfo.inquirySeqNumber" @click="jumpToInquiry"></p>
                    </Col>
                </template>
                <template v-else>
                    <Col :span="singleCol ? 24 :item.span">
                        <p class="col_name_normal">{{ item.cname }}</p>
                        <p class="col_value" v-text="detailInfo[item.storageName]"></p>
                    </Col>
                </template>
            </template>

            <!-- 访客信息 可编辑 -->
            <Col v-for="(item, index) in fieldsList" :span="singleCol ? 24 :item.span" :key="item.key + index">

                <p class="col_name_normal">{{ item.name }}</p>

                <!-- whatsApp -->
                <template v-if="type !== 'highseasClue' && item.key === 'a10052' && detailInfo[item.key] && !is_marketing_station">
                    <!-- 点击打开 wa 回复框 -->
                    <p @click="openGlobalWaReplyModal(detailInfo[item.key], $event)"
                       v-text="detailInfo[item.key] || '-'"
                       class="col_value header-source"></p>
                </template>
                <!-- 社交平台 -->
                <template v-else-if="item.key === 'a10013'">
                    <template v-if="$options.filters.parseArray(detailInfo[item.key]).length">
                        <p class="col_value" v-for="(platform, index) in $options.filters.parseArray(detailInfo[item.key])" :key="platform.account + index">
                            <span v-if="platform.type">{{ platform.type + ': ' + platform.account }}</span>
                            <span v-else>{{ platform.attrName + ': ' + platform.attrValue }}</span>
                        </p>
                    </template>
                    <template v-else-if="detailInfo[item.key] === '[]'">
                        <span></span>
                    </template>
                    <template v-else>
                        <p class="col_value" v-text="detailInfo[item.key]"></p>
                    </template>
                </template>
                <!-- 标签 -->
                <template v-else-if="item.key === 'a10017'">
                    <!-- TODO: 已删除标签样式区分
                        :color="labelItem.isAvailable ? labelItem.attrValue : 'gray'"
                        :style="{
                            'text-decoration': labelItem.isAvailable ? '' : 'line-through'
                        }"
                    -->
                    <Tag :key="labelItem.attrId" v-for="labelItem in $options.filters.tagFilter(detailInfo[item.key])"
                         style="margin:0 10px 5px 0;color: #ffffff"
                         :color="labelItem.attrValue ? labelItem.attrValue : '#4285F4'"
                    >
                        {{ labelItem.attrName || labelItem }}
                    </Tag>
                </template>
                <template v-else-if="item.key === 'a10010'">
                    <a v-if="type !== 'highseasClue'" href="javascript:void(0)" class="ct_email" @click.stop="quickSend(detailInfo)">
                        {{ detailInfo[item.key] }}
                    </a>
                    <p v-else class="col_value textAreaShow">{{ detailInfo[item.key] }}</p>
                </template>
                <template v-else-if="item.type === 'textarea'">
                    <p class="col_value textAreaShow">{{ detailInfo[item.key] }}</p>
                </template>
                <template v-else-if="item.type === 'date'">
                    <p class="col_value">{{ detailInfo[item.key] | timeFormat }}</p>
                </template>
                <template v-else-if="item.type === 'date+time'">
                    <p class="col_value">{{ detailInfo[item.key] | timeFormat('DateTime') }}</p>
                </template>
                <template v-else-if="item.type === 'selectMultiple'">
                    <p class="col_value" v-text="(detailInfo[item.key] && detailInfo[item.key].indexOf('[') == -1 )? detailInfo[item.key]: ($options.filters.parseArray(detailInfo[item.key]).length > 0 ? $options.filters.parseArray(detailInfo[item.key]).join(', '): '')"></p>
                    <!-- <p class="col_value" v-text="$options.filters.parseArray(detailInfo[item.key]).length? $options.filters.parseArray(detailInfo[item.key]).join(', '):detailInfo[item.key]"></p> -->
                </template>

                <template v-else>
                    <p class="col_value" v-text="detailInfo[item.key]"></p>
                </template>
            </Col>

            <!-- 访客信息 不可编辑 -->
            <Col v-for="(item, index) in info_items_others" :span="singleCol ? 24 :item.span" :key="item.cname + index">
                <p class="col_name_normal">{{ item.cname }}</p>
                <template v-if="item.storageName === 'createTime'">
                    <p class="col_value">{{ detailInfo.createTime | timeFormat('DateTime') }}</p>
                </template>
                <template v-else-if="item.storageName === 'source_type'">
                    <p class="col_value" v-text="source_type"></p>
                </template>
                <template v-else-if="item.storageName === 'leadsSubmitTime'">
                    <p class="col_value">{{ detailInfo.leadsSubmitTime | leadsTimeFormat }}</p>
                </template>
                <template v-else>
                    <p class="col_value" v-text="detailInfo[item.storageName]"></p>
                </template>
            </Col>


            <!-- 广告信息 -->
            <template v-if="detailInfo.proj && adInfo">
                <Col :span="singleCol ? 24 :12">
                    <p class="col_name_normal">{{$t('visitor_history.visit_source')}}</p>
                    <p class="col_value" v-text="adInfo.visitSource"></p>
                </Col>
                <Col :span="singleCol ? 24 :12" >
                    <p class="col_name_normal" >{{$t('visitor_history.traffic_source')}} </p>
                    <p class="col_value" v-text="adInfo.trafficSource"></p>
                </Col>
                <!--Google广告、Facebook广告、其他广告-->
                <template v-if="adInfo.trafficSource === 'Google广告' || adInfo.trafficSource === 'Facebook广告' || adInfo.trafficSource === '其他广告'">
                    <Col :span="singleCol ? 24 :12">
                        <p class="col_name_normal">{{$t('visitor_history.ad_type')}} </p>
                        <p class="col_value" v-text="adInfo.adType"></p>
                    </Col>
                    <Col :span="singleCol ? 24 :12">
                        <p class="col_name_normal">{{$t('visitor_history.ad_campaign_name')}} </p>
                        <p class="col_value" v-text="adInfo.adCampaignName"></p>
                    </Col>
                    <Col :span="singleCol ? 24 :12">
                        <p class="col_name_normal">{{$t('visitor_history.ad_group_name')}} </p>
                        <p class="col_value" v-text="adInfo.adGroupName"></p>
                    </Col>
                    <Col :span="singleCol ? 24 :12">
                        <p class="col_name_normal">{{$t('visitor_history.ad_name')}} </p>
                        <p class="col_value" v-text="adInfo.adName"></p>
                    </Col>
                    <Col :span="singleCol ? 24 :12">
                        <p class="col_name_normal">{{$t('visitor_history.ad_keyword')}} </p>
                        <p class="col_value" v-text="adInfo.adKeyword"></p>
                    </Col>
                </template>
            </template>
        </Row>


        <Poptip ref="editPopover"
            :popper-class="['a10013'].includes(checkedColumn.key) ? 'table-edit-box-popper cule-table-edit-box-popper socialNetworkingPlatform' :'table-edit-box-popper cule-table-edit-box-popper'"
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
                    label-position="top"
                    label-width="90px"
                >
                    <clueInputArea ref="clueInputArea"
                        :detailInfo.sync="fieldEditDetailInfo"
                        :fieldsList.sync="corp_item_all"
                        :countryAreaName.sync="countryAreaName"
                        :socialNetworkingPlatform.sync="socialNetworkingPlatform"
                        from="myClue"
                        @verifyEmail="verifyEmail"
                        @verifyPhone="verifyPhone"
                        @verifyWA="verifyWA"
                        ></clueInputArea>
                </Form>
                <div class="table-edit-box-buttons">
                    <Button @click="clearEditPopperComponent" type="text">{{ $t('crm.Modal.modal_cancel') }}</Button>
                    <Button type="text" @click="ok" class="table-edit-box-button-sure" :disabled="tableEditLoading">{{ $t('crm.Modal.modal_ok') }}</Button>
                </div>
            </div>
        </Poptip>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import { crmClue } from '@/api/crm';
    import Utils from '@/utils/index';
    import clueInputArea from '@/views/clue-manage/Detail/Components/Modal/clue-input-area';
    import globalWaReplyModal from '@/mixins/globalWaReplyModal';
    import { getUpperLengthLimit } from '@/api/upperLengthLimit.js';

    let that;

    export default {
        name: 'detailInfo',
        mixins: [globalWaReplyModal],
        components: {
            clueInputArea
        },
        props: [
            'id',
            'singleCol',
            'inquiryId',
            'inquirySeqNumber',
            'flag_update_detail',
            'source_type',
            'fromType',
            'type',
            'from',
            'originalType'
        ],
        beforeCreate() {
            that = this;
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                is_marketing_station: state => state.app.is_marketing_station,
                $lang: state => state.app.lang
            }),
            ...mapGetters([
                'isHaveAuthority'
            ]),
            // 处理社交平台字段
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
            }
        },
        data() {
            return {
                adInfo: {},
                loading: true,
                popperFlag: false,
                prevTarget: null,
                visibleEdit: false,
                checkedColumn: {
                    width: '',
                    key: ''
                },
                popperOptions: {
                    boundariesElement: 'body',
                    positionFixed: true,
                    adaptive: false
                },
                repeatData: {
                    clueEmail: null,
                    contactEmail: null,
                    cluePhone: null,
                    contactPhone: null,
                    clueWA: null,
                    contactWA: null
                },
                corp_item_all: [],
                socialNetworkingPlatform: [], // 社交平台处理
                tableEditLoading: false,
                detailInfo: {},
                fieldEditDetailInfo: {},
                fieldsList: [], // 表单字段列表
                tagListMap: {},
                info_items_id: [
                    {
                        span: 12,
                        cname: this.$t('clue.visitor_id'),
                        storageName: 'proj'
                    },
                    {
                        span: 12,
                        cname: 'FB Lead ID',
                        storageName: 'leadsId'
                    },
                    {
                        span: 12,
                        cname: 'Ad ID',
                        storageName: 'adId'
                    },
                    {
                        span: 12,
                        cname: this.$t('clue.inquiry_num'),
                        storageName: 'inquiryId'
                    }
                ],
                info_items_others: [
                    {
                        span: 12,
                        cname: this.$t('clue.create_time'),
                        storageName: 'createTime'
                    },
                    {
                        span: 12,
                        cname: this.$t('clue.inputer'),
                        storageName: 'createUser'
                    },
                    {
                        span: 12,
                        cname: this.$t('clue.service'),
                        storageName: 'serviceName'
                    },
                    {
                        span: 12,
                        cname: this.$t('clue.sales'),
                        storageName: 'saleName'
                    },
                    {
                        span: 12,
                        cname: this.$t('clue.create_way'),
                        storageName: 'source_type'
                    },
                    {
                        span: 12,
                        cname: this.$t('clue.FB_name'),
                        storageName: 'partSys'
                    },
                    {
                        span: 12,
                        cname: this.$t('clue.leads_create_time'),
                        storageName: 'leadsSubmitTime'
                    },
                    {
                        span: 12,
                        cname: this.$t('clue.first_visit_url'),
                        storageName: 'sourceUrl'
                    }
                ],
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
                countryAreaName: ''
            };
        },
        methods: {
            clearEditPopperComponent() {
                this.prevTarget = null;
                this.popperFlag = !this.popperFlag;
                this.visibleEdit = false;
            },
            // 点击编辑
            async handleClickEdit(column, e) {
                const key = column.key;
                // 处理没有返回数据的key 初始值
                if (!this.fieldEditDetailInfo[key]) this.fieldEditDetailInfo[key] = '';
                // 处理多选的数据格式
                if (column.type === 'selectMultiple') {
                    let temp = [];
                    if (this.detailInfo[key]) {
                        if (this.detailInfo[key].indexOf('[') !== -1) {
                            temp = JSON.parse(this.detailInfo[key]);
                            if (!Array.isArray(temp)) {
                                temp = [];
                            }
                        } else {
                            temp = this.detailInfo[key];
                        }
                    } else {
                        temp = [];
                    }
                    this.fieldEditDetailInfo[key] = temp;
                }
                if (key === 'a1003') {
                    const resCompany = await crmClue.getColumnValue({
                        id: this.id,
                        userId: this.userId,
                        needAdDetail: 1,
                        isEdit: 1
                    });
                    if (resCompany.code === '1') {
                        this.fieldEditDetailInfo[key] = resCompany.data.a1003;
                    }
                }
                this.$set(this.checkedColumn, 'key', key);
                this.corp_item_all = this.fieldsList.filter(item => item.key === key);
                // 处理社交平台的数据格式
                if (this.detailInfo && key === 'a10013') {
                    // fix: 当社交平台数据为'[]'时,编辑线索时社交平台不显示输入框
                    if (!this.detailInfo.a10013 || this.detailInfo.a10013 === '[]') {
                        this.socialNetworkingPlatform = [{ type: '', account: '' }];
                    } else {
                        try {
                            const tempJson = JSON.parse(this.detailInfo.a10013);
                            if (this.detailInfo.a10013.indexOf('attrValue') !== -1) {
                                this.socialNetworkingPlatform = tempJson.map(item => {
                                    return {
                                        type: item.attrName,
                                        account: item.attrValue
                                    };
                                });
                            } else {
                                this.socialNetworkingPlatform = tempJson;
                            }
                        } catch (error) {
                            console.error('社交平台格式错误', error);
                        }
                    }
                }
                const path = e.path || (e.composedPath && e.composedPath());
                const currentTarget = Array.isArray(path) ? path[1] : e.currentTarget; // 赋值当前点击的编辑
                this.$set(this.checkedColumn, 'width', column.width + 90);
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
                                if (this.$refs.clueInputArea.$refs[key]) {
                                    this.$refs.clueInputArea.$refs[key][0].focus();
                                }
                            });
                        });
                    } else {
                        this.prevTarget = currentTarget;
                        this.visibleEdit = true;
                        setTimeout(() => {
                            if (this.$refs.clueInputArea.$refs[key]) {
                                this.$refs.clueInputArea.$refs[key][0].focus();
                            }
                        }, 100);
                    }
                }
            },
            // 验证邮箱
            verifyEmail(val, type) {
                /* type是是否有重复提示 */
                if (!val) {
                    return;
                }
                if (type) {
                    this.checkRepeatModalTitle = this.$t('crm.Modal.title_uniqEmail_fixed');
                    this.repeatData = {};
                }
                this.repeatData.clueEmail = null;
                this.repeatData.contactEmail = null;
                return new Promise((resolve, reject) => {
                    crmClue.getSameListByEmail({
                        orgId: this.enterpriseId,
                        email: String(val),
                        excludeId: this.detailInfo.id
                    }).then(response => {
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
                                    this.enterFlag = 'self-test';
                                    this.isEmailRepeat = true;
                                }
                                resolve(true);
                            }
                        } else {
                            resolve(false);
                        }
                    });
                });
            },
            // 电话查重
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

                const data = {
                    orgId: this.enterpriseId,
                    phone: value,
                    excludeId: this.detailInfo.id
                };
                return new Promise((resolve, reject) => {
                    crmClue.getSameListByPhone(data).then((res) => {
                        if (res.code === '1') {
                            const data = res.data;
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
                                    this.enterFlag = 'self-test';
                                    this.isEmailRepeat = true;
                                }
                                resolve(true);
                            }
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
                    this.repeatData = {};
                }
                this.repeatData.clueWA = null;
                this.repeatData.contactWA = null;
                return new Promise((resolve, reject) => {
                    crmClue.getSameListByWhatsapp({
                        orgId: this.enterpriseId,
                        whatsapp: value,
                        excludeId: this.detailInfo.id
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
                                    this.enterFlag = 'self-test';
                                    this.isEmailRepeat = true;
                                }
                                resolve(true);
                            }
                        } else {
                            resolve(false);
                        }
                    });
                });
            },
            async ok() {
                this.tableEditLoading = true;
                let phoneRepeat = ''; // 电话查重结果
                let WARepeat = '';// 电话查重结果
                // 遍历数据检测是否有未填写的必填选项
                this.fieldsList.forEach((item, index) => {
                    this.valideClueEnter(item, index);
                });
                const isEmptyArr = this.fieldsList.find(item => item.key === this.checkedColumn.key);
                if (isEmptyArr.isNeed === 1 && isEmptyArr.isEmpty) {
                    this.$Message.error(`[${isEmptyArr.name}] ${this.$t('enterClue.requireEmptyTip')}`);
                    this.tableEditLoading = false;
                    return false;
                }
                if (this.detailInfo[this.checkedColumn.key] && this.detailInfo[this.checkedColumn.key].length > isEmptyArr.upperLimitLength) {
                    this.tableEditLoading = false;
                    return false;
                }
                // 手机判重
                if (this.checkedColumn.key === 'a10012' && this.detailInfo[this.checkedColumn.key]) {
                    this.detailInfo[this.checkedColumn.key] = this.detailInfo[this.checkedColumn.key].trim();
                    if (this.detailInfo[this.checkedColumn.key] !== this.oldPhone) {
                        phoneRepeat = await this.verifyPhone(this.detailInfo[this.checkedColumn.key], false);
                    }
                }
                const whatsAppReg = Utils.regExp.whatsApp;
                if (this.checkedColumn.key === 'a10052' && this.detailInfo[this.checkedColumn.key]) {
                    this.detailInfo[this.checkedColumn.key] = this.detailInfo[this.checkedColumn.key].trim();
                    if (!whatsAppReg.test(this.detailInfo[this.checkedColumn.key].replace(/\s/g, ''))) {
                        this.$Message.error(this.$t('enterClue.whatsAppFormErro'));
                        this.tableEditLoading = false;
                        return false;
                    }
                    WARepeat = await this.verifyWA(this.detailInfo[this.checkedColumn.key], false);
                }

                // 校验国家地区, 非只读情况下
                const temp = this.corp_item_all.find(item => item.key === 'a1003');
                if (temp && this.fieldEditDetailInfo.a1003) {
                    if (temp.isOnlyRead !== 1) {
                        const res_getCountryArea = await this.$commonApi.getDetailByCode({
                            divCode: this.fieldEditDetailInfo.a1003
                        });
                        if (!(Array.isArray(res_getCountryArea.data) && res_getCountryArea.data.length)) {
                            this.$Message.error(this.$t('crm.Modal.error_countryAreaFormat'));
                            this.tableEditLoading = false;
                            return false;
                        }
                    }
                }
                if (this.checkedColumn.key === 'a10013') {
                    this.fieldEditDetailInfo[this.checkedColumn.key] = JSON.stringify(this.platFormFlag);
                }
                if (phoneRepeat || WARepeat) {
                    this.enterFlag = 'saveClue';
                    this.checkRepeatModalTitle = this.$t('clue.emailOrPhoneRepeat');
                    this.isEmailRepeat = true;
                    return false;
                }
                this.handleSaveClue();
            },
            handleSaveClue() {
                delete this.detailInfo.createTime;
                delete this.detailInfo.editTime;
                const jsonData = Object.assign(this.fieldEditDetailInfo, {
                    userId: this.userId,
                    userName: this.fullName
                });

                this.fieldsList.filter(item => item.type === 'selectMultiple').forEach(field => {
                    const temp = Array.isArray(jsonData[field.key]) ? JSON.stringify(jsonData[field.key]) : JSON.stringify([]);
                    jsonData[field.key] = temp;
                });
                const sendData = {
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    userName: this.fullName,
                    clueId: this.detailInfo.id,
                    fieldName: this.checkedColumn.key,
                    fieldValue: jsonData[this.checkedColumn.key]
                };
                crmClue.updateField(sendData).then(response => {
                    if (response.code === '1') {
                        if (this.checkedColumn.key === 'a10017') {
                            const lableTag = JSON.parse(jsonData[this.checkedColumn.key]);
                            this.detailInfo[this.checkedColumn.key] = lableTag;
                        } else if (this.checkedColumn.key === 'a10013') {
                            const socialNetworkingPlatform = jsonData[this.checkedColumn.key];
                            if (socialNetworkingPlatform.slice(0, 1) !== '[') {
                                return;
                            }
                            let str = '';
                            JSON.parse(socialNetworkingPlatform).forEach(platform => {
                                if (platform.type) {
                                    str += `${platform.type}:${platform.account}  `;
                                } else if (platform.attrName) {
                                    str += `${platform.attrName}:${platform.attrValue}  `;
                                }
                            });
                            this.detailInfo[this.checkedColumn.key] = str;
                        } else if (this.checkedColumn.key === 'a1003') {
                            if (this.countryAreaName.length > 0) {
                                this.detailInfo[this.checkedColumn.key] = this.countryAreaName;
                            }
                        } else {
                            this.detailInfo[this.checkedColumn.key] = jsonData[this.checkedColumn.key];
                        }
                        this.clearEditPopperComponent();
                        this.$Message.success(this.$t('clue.edit_success'));
                        // 分发提醒事件
                        this.invoking({
                            data: {
                                saleId: this.detailInfo.saleId,
                                createUserId: [this.detailInfo.createUserId],
                                serviceId: [this.detailInfo.serviceId]
                            },
                            id: this.detailInfo.id,
                            effectActionType: 2
                        });
                    } else {
                        this.$Message.error(this.$t('clue.edit_failed'));
                    }
                    this.cancelEnter();
                }).catch(() => {
                    this.cancelEnter();
                });
            },
            // 字段校验
            valideClueEnter(column, index, platFormKey, platFormIndex) {
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
                            if (!this.fieldEditDetailInfo[column.key] || !this.fieldEditDetailInfo[column.key].length) {
                                this.$set(this.fieldsList[index], 'isEmpty', true);
                                return true;
                            } else {
                                this.$set(this.fieldsList[index], 'isEmpty', false);
                                return false;
                            }
                        } else {
                            if (!this.fieldEditDetailInfo[column.key] || (this.fieldEditDetailInfo[column.key] && !this.fieldEditDetailInfo[column.key].trim())) {
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
            cancelEnter() {
                this.tableEditLoading = false;
                this.isEmailRepeat = false;
            },
            // 获取标签数据
            getTagList() {
                const data = {
                    typeId: 8,
                    orgId: this.enterpriseId
                };
                crmClue.attrGetList(data).then(res => {
                    if (res.code === '1') {
                        const tagListMap = {};
                        res.data.sort((a, b) => {
                            return a.sort - b.sort;
                        }).forEach(item => {
                            tagListMap[item.attrName] = item;
                        });
                        this.tagListMap = tagListMap;
                    } else {
                        this.$Message.error(res.message || this.$t('clue.error_getClueFields'));
                    }
                });
            },
            /* 获取线索详情 */
            get_detail() {
                this.adInfo = {};
                this.loading = true;
                this.get_fields();
                const data = {
                    id: this.id,
                    userId: this.userId,
                    needAdDetail: 1,
                    lang: this.$lang
                };
                crmClue.getColumnValue(data).then(async res => {
                    if (res.code === '1') {
                        this.detailInfo = res.data;
                        this.fieldEditDetailInfo = Object.assign({}, this.detailInfo);
                        // 获取国家地区的获取直接改成取详情接口的 a1003字段，原逻辑调接口单独查询查询已删除
                        // 通过访客id获取广告信息
                        if (this.detailInfo && this.detailInfo.proj) {
                            this.adInfo = this.detailInfo.adDetail || null;
                            this.adInfo && this.$set(this.adInfo, 'trafficSource', this.handleTrafficSourceVal(this.adInfo.trafficSourceId - 0));
                        }
                        this.loading = false;
                    } else {
                        this.$Message.error(this.$t('clue.error_getClueDetail'));
                        this.loading = false;
                    }
                });
            },
            handleTrafficSourceVal(key) {
                switch (key) {
                    case 1:
                        return this.$t('visitor_history.ad_google');
                    case 2:
                        return this.$t('visitor_history.ad_facebook');
                    case 3:
                        return this.$t('visitor_history.ad_other');
                    case 4:
                        return this.$t('visitor_history.email_marketing');
                    case 5:
                        return this.$t('visitor_history.search_engine');
                    case 6:
                        return this.$t('visitor_history.social_network');
                    case 7:
                        return this.$t('visitor_history.other_referrals');
                    case 8:
                        return this.$t('visitor_history.direct_access');
                    case 9:
                        return this.$t('visitor_history.ad_yandex');
                    case 10:
                        return this.$t('visitor_history.ad_cloudshare');
                    case 101:
                        return this.$t('visitor_history.ad_cloudshare_facebook');
                    case 102:
                        return this.$t('visitor_history.ad_cloudshare_messenger');
                    case 103:
                        return this.$t('visitor_history.ad_cloudshare_whatsApp');
                    case 104:
                        return this.$t('visitor_history.ad_cloudshare_email');
                    case 105:
                        return this.$t('visitor_history.ad_cloudshare_other');
                    default:
                        return key;
                }
            },
            get_fields() {
                const data = {
                    userId: this.userId,
                    orgId: this.enterpriseId
                };
                crmClue.getXSShow(data).then(async (res) => {
                    if (res.code === '1') {
                        // 获取到表头各字段的长度限制
                        const limitData = await getUpperLengthLimit({ serviceFlag: 'save_clue', orgId: this.enterpriseId });
                        this.fieldsList = Object.entries(res.data.show).map(item => {
                            const [key, value] = item;
                            const { name, type, isNeed, option, isOnlyRead } = value;
                            // 遍历表头数据给表头字段增加最大长度限制
                            if (limitData.code === '1') {
                                Object.keys(limitData.data).forEach(keys => {
                                    if (key === keys) {
                                        // 产品需求 客户、联系人、询盘 的 a10040字段长度为4000，线索统一为300
                                        item.upperLimitLength = limitData.data[keys].usableLength;
                                    }
                                });
                            }
                            return {
                                span: (type === 'textarea') ? 24 : 12,
                                name: this.lang_fixed_columns[key] || name,
                                key,
                                type,
                                isNeed,
                                isOnlyRead,
                                option: option.split('?'),
                                upperLimitLength: item.upperLimitLength
                            };
                        });
                    } else {
                        this.$Message.error(this.$t('clue.error_getClueFields'));
                    }
                });
            }, // 获取线索字段

            async jumpToInquiry() {
                // 校验是否有该条询盘管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Inquiry',
                    id: this.inquiryId
                });
                if (!authorized) return;
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpInquiryInHighseas'));
                    return;
                }

                // 校验通过, 新标签页打开询盘详情
                localStorage.setItem('leadsCloud-inquiryId', this.inquiryId);
                window.open(this.$rootRouter.resolve({
                    name: 'myInquiry'
                }).href, '_blank');
            },
            // 打开发信弹窗
            quickSend(data) {
                if (this.is_marketing_station) return;
                if (data.a10010) {
                    const emails = [{
                        receiverName: data.a1009 || '',
                        receiveMailAddress: data.a10010,
                        followUpId: `${data.id}`,
                        fromClue: 1
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
        filters: {
            leadsTimeFormat(value) {
                if (value) {
                    return value.substr(0, 19);
                } else {
                    return ['mail', 'mail_detail'].includes(that.from) ? '-' : '';
                }
            },
            tagFilter(value) {
                console.log(value);
                if (!value) return '';
                let temp = value;
                try {
                    temp = JSON.parse(value);
                } catch (e) {
                    console.error(e);
                }
                temp = Array.isArray(temp) ? temp : [temp];
                return temp.map(item => {
                    /**
                     * @Description: 如果item是object，则需要解析对应的值 例：[{"attrId":11934,"attrName":"oooooo","attrValue":"#7B66EE","orgId":10110,"typeId":8,"belongTable":3}]
                     * @author mayuanzhi
                     * @date 2020/5/25
                     */
                    if (typeof item === 'object') {
                        return that.tagListMap[item.attrName] || {
                            attrName: item.attrName,
                            attrValue: item.attrValue,
                            isAvailable: 0
                        };
                    } else {
                        return that.tagListMap[item] || {
                            attrName: item,
                            // attrValue: 'gray',
                            attrValue: '#4285F4',
                            isAvailable: 0
                        };
                    }
                });
            }
        },
        watch: {
            flag_update_detail: {
                handler() {
                    this.get_detail();
                    this.getTagList();
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less" scoped>
    .inquiry-number {
        color: #3b78de;
        cursor: pointer;
        &:hover {
            color: #2d63bc;
            text-decoration: underline;
        }
    }

    .col_name_normal {
        // margin-top: 32px;
        margin-bottom: 10px;
        font-size: 12px;
        line-height: 14px;
        color: rgba(0, 0, 0,0.6);
    }
    .col_value{
        margin-bottom: 16px;
        min-height: 16px;
    }
    .col_name_small {
        font-size: 12px;
        margin-top: 10px;
    }
    //   .el-tag {
    //     background-color: #ecf5ff;
    //     color: #409eff;
    //     border: 1px solid #d9ecff;
    //     margin-right:10px;
    //   }

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
                .table-show-contant{
                    width: calc(100% - 20px);
                }
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
        /deep/ .el-form--inline.el-form--label-top .el-form-item__content{
            display: inline-block;
        }
    }
</style>
