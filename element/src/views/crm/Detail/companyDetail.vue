<template>
    <Row v-if="companyId"
         class="companyDetail">
        <!-- 公司信息 -->
        <Col :xs="6"
             :sm="6"
             :md="6"
             :lg="6"
             :xl="6"
             style="background-color: #F7FAFE;padding:20px">
            <CompanyInfo :companyId="companyId"
                    :isHighSeas="isHighSeas"
                    :company_short_info.sync="company_short_info"
                    :corp_columns_authorized="corp_columns_authorized"
                    :inquiry_columns_authorized="inquiry_columns_authorized"
                    :contact_columns_authorized="contact_columns_authorized"
                    :flag_update_inquiry_list.sync="flag_update_inquiry_list"
                    :flag_update_inquiry_detail.sync="flag_update_inquiry_detail"
                    :flag_update_contact_list.sync="flag_update_contact_list"
                    @claimSuccess="claimSuccess"></CompanyInfo>
        </Col>
        <!-- 主题 -->
        <Col :xs="18 - relatedInfoWidth"
             :sm="18 - relatedInfoWidth"
             :md="18 - relatedInfoWidth"
             :lg="18 - relatedInfoWidth"
             :xl="18 - relatedInfoWidth"
             class="companyDetail-center-col" style="position:relative;transition: .2s all;">
            <!-- 询盘信息 -->
            <img v-if="relatedInfoWidth === 0" :src="require('@/assets/images/open.png')" style="right: 0px;" alt="" @click.stop="toggleClickShow" class="toggle-relatedInfo" srcset="" width="10px" height="50px" />
            <!-- <div style="height: 100%;position: relative;"> -->
                <!-- <Icon v-if="relatedInfoWidth === 0" @click.stop="toggleClickShow" style="right: -33px;top: 48%;text-align: right;" custom="custom custom-shouqi1 toggle-relatedInfo"></Icon> -->
                <InquiryInfo id="InquiryInfo"
                            class="companyDetail-inquiry"
                            :class="{'isScroll':isScroll}"
                            :originalType="isHighSeas ? 'highseasCustomer' : 'customerDetail'"
                            :companyId="companyId"
                            :isHighSeas="isHighSeas"
                            :inquiryId.sync="inquiryId"
                            :inquiryDetail.sync="inquiryDetail"
                            :inquiry_columns_authorized="inquiry_columns_authorized"
                            :flag_update_inquiry_list="flag_update_inquiry_list"
                            :flag_update_inquiry_detail.sync="flag_update_inquiry_detail"
                            :flag_update_contact_list.sync="flag_update_contact_list"
                            ></InquiryInfo>
                <!-- 全触点旅程 -->
                <CustomerJourney :type="isHighSeas ? 'highseasCustomer' : 'customer'"
                                :originalType="isHighSeas ? 'highseasCustomer' : 'customerDetail'"
                                :disabled="isHighSeas"
                                :id="companyId"
                                :visitorId="''"
                                :columns_authorized="corp_columns_authorized"
                                :contact_columns_authorized="contact_columns_authorized"
                                :inquiry_columns_authorized="inquiry_columns_authorized"
                                :flag_update_inquiry_list="flag_update_inquiry_list"
                                :isScroll="isScroll"
                                @change_flag_update_task="change_flag_update_task"
                                @change_time_line="addEventListenerScroll"
                                class="companyDetail-journey"
                                ></CustomerJourney>
                                    <!-- :class="{'isScrollJourney': isScroll}" -->
                <div class="companyDetail-center-col-toTop" v-if="isScroll" @click="toTop">
                    <svg class="icon svg-icon" aria-hidden="true" style="width:100%;height:100%">
                        <use xlink:href="#custom-fanhuidingbu"></use>
                    </svg>
                </div>
            <!-- </div> -->
        </Col>
        <!-- 关联信息 -->
        <Col :xs="relatedInfoWidth"
             :sm="relatedInfoWidth"
             :md="relatedInfoWidth"
             :lg="relatedInfoWidth"
             :xl="relatedInfoWidth" style="position:relative;transition: .2s all;">
             <img v-if="relatedInfoWidth > 0" :src="require('@/assets/images/close.png')" style="left: -11px;" alt="" @click.stop="toggleClick" class="toggle-relatedInfo" srcset="" width="10px" height="50px" />
            <!-- <Icon v-if="relatedInfoWidth > 0" @click.stop="toggleClick" custom="custom custom-zhankai1 toggle-relatedInfo"></Icon> -->
            <RelatedInfo type="inquiry"
                        :id="inquiryId"
                        :companyId="companyId"
                        :isHighSeas="isHighSeas"
                        :companyName="company_short_info.companyName"
                        :inquirySeqNumber="inquiryDetail.seqNumber"
                        :flag_update_task="flag_update_task"></RelatedInfo>
        </Col>
    </Row>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import util from '@/libs/util';
    import CompanyInfo from '@/views/crm/Detail/Components/newDetail/companyInfo';
    import InquiryInfo from '@/views/crm/Detail/Components/newDetail/inquiryInfo';
    import RelatedInfo from '@/views/crm/Detail/Components/newDetail/relatedInfo';
    import CustomerJourney from '@/views/crm/Detail/Components/newDetail/customerJourney';

    export default {
        name: 'companyDetail',
        components: {
            CompanyInfo,
            InquiryInfo,
            RelatedInfo,
            CustomerJourney
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId'
            }),
            ...mapGetters([
                'isHaveAuthority'
            ])
        },
        data() {
            return {
                /* 多语言 */
                lang_contact: {
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
                },
                lang_inquiry: {
                    productCategory: this.$t('crm.Modal.inq_productCategory'),
                    demandProducts: this.$t('crm.Modal.inq_demandProducts'),
                    inquiryScore: this.$t('crm.Modal.inq_inquiryScore'),
                    label: this.$t('crm.Modal.inq_label'),
                    sourceChannel: this.$t('crm.Modal.inq_sourceChannel'),
                    sourceWay: this.$t('crm.Modal.inq_sourceWay'),
                    grouping: this.$t('crm.Modal.inq_grouping'),
                    followUp: this.$t('crm.Modal.inq_followUp'),
                    estimatedInquiryAmount: this.$t('crm.Detail.inq_estimatedInquiryAmount'),
                    remark: this.$t('crm.Modal.inq_remark')
                },
                lang_company: {
                    // 默认字段
                    companyName: this.$t('crm.Modal.corp_companyName'),
                    starLevel: this.$t('crm.Modal.corp_starLevel'),
                    shortName: this.$t('crm.Modal.corp_shortName'),
                    countryArea: this.$t('crm.Modal.corp_countryArea'),
                    mainProduct: this.$t('crm.Modal.corp_mainProduct'),
                    scale: this.$t('crm.Modal.corp_scale'),
                    clientType: this.$t('crm.Modal.corp_clientType'),
                    homePage: this.$t('crm.Modal.corp_homePage'),
                    phone: this.$t('crm.Modal.corp_phone'),
                    fax: this.$t('crm.Modal.corp_fax'),
                    contactAddress: this.$t('crm.Modal.corp_contactAddress'),
                    relatedCompany: this.$t('crm.Modal.corp_relatedCompany'),
                    companyPicture: this.$t('crm.Modal.corp_companyPicture'),
                    companyRemark: this.$t('crm.Modal.corp_companyRemark'),
                    companySourceWay: this.$t('crm.Table.col_customerSource'),

                    // 自定义字段 - 无

                    // 其他字段
                    companyManagers: this.$t('crm.Table.col_companyManagers'),
                    marker: this.$t('crm.Table.col_marker'),

                    createUser: this.$t('crm.WorkBench.col_followUpCreateUser'),
                    createTime: this.$t('crm.Table.col_createTime'),
                    updateTime: this.$t('crm.Table.col_updateTime')
                },

                /* 对接权限系统 */
                corp_columns_authorized: {}, // 公司所有字段
                inquiry_columns_authorized: {}, // 询盘所有字段
                contact_columns_authorized: {}, // 联系人所有字段

                // 公司信息
                companyId: null,
                isHighSeas: '',
                company_short_info: {},
                // 客户信息处新增询盘, 触发询盘刷新 flag
                flag_update_inquiry_list: false,
                flag_update_inquiry_detail: false,

                // 询盘信息
                inquiryId: null,
                inquiryDetail: {},
                // 询盘信息处新增联系人, 触发联系人刷新 flag
                flag_update_contact_list: false,

                // 全触点旅程
                // 客户旅程部分新增跟进记录, 创建快速任务后触发右侧任务部分刷新
                flag_update_task: false,
                timelineBox: null,
                isScroll: false,
                relatedInfoWidth: 5,
                oldScrollTop: 0
            };
        },
        methods: {
            // 根据跳转时附加参数的不同作出相应刷新操作
            async checkAuthority(companyId, callback) {
                if (companyId) {
                    // 查询该公司 id 管理权限
                    const authorized = await this.isHaveAuthority({
                        type: 'Customer',
                        id: companyId
                    });
                    // 无权限, 则不允许跳转, 停止向下执行
                    if (!authorized) {
                        return;
                    }

                    // 校验通过, 执行剩余代码
                    if (callback && typeof callback === 'function') {
                        callback();
                    }

                    // 标记当前客户是否为公海客户
                    this.isHighSeas = authorized === 'highseas';
                    // 赋值 companyId , 开始渲染页面
                    this.companyId = companyId;

                    // 调整顶部面包屑
                    util.setCurrentPath(this, this.isHighSeas ? 'highSeasCompanyDetail' : 'companyDetail');
                } else {
                    this.$Message.error(this.$t('crm.InqSet.error_params'));
                }
            },
            /* 获取 CRM 授权字段 */
            get_columns_authorized() {
                this.$commonApi.getFields({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    parentId: 0
                }).then(response => {
                    if (response.code === '1') {
                        // 暂存所有默认字段和自定义字段
                        const defaultFields = response.data && Array.isArray(response.data.default) ? response.data.default : [];
                        const customFields = response.data && Array.isArray(response.data.custom) ? response.data.custom : [];
                        // 筛选得到公司/询盘/联系人授权字段
                        this.$set(this.corp_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 1));
                        this.$set(this.corp_columns_authorized, 'custom', customFields.filter(col => col.parentId === 1));
                        this.$set(this.contact_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 2));
                        this.$set(this.contact_columns_authorized, 'custom', customFields.filter(col => col.parentId === 2));
                        this.$set(this.inquiry_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 3));
                        this.$set(this.inquiry_columns_authorized, 'custom', customFields.filter(col => col.parentId === 3));
                        // 公司系统默认字段 多语言配配置
                        if (this.corp_columns_authorized.default) {
                            this.corp_columns_authorized.default.forEach(item => {
                                if (this.lang_company.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_company[item.storageName];
                                }
                            });
                        }
                        // 联系人系统默认字段 多语言配配置
                        if (this.contact_columns_authorized.default) {
                            this.contact_columns_authorized.default.forEach(item => {
                                if (this.lang_contact.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_contact[item.storageName];
                                }
                            });
                        }
                        // 线索系统默认字段 多语言配配置
                        if (this.inquiry_columns_authorized.default) {
                            this.inquiry_columns_authorized.default.forEach(item => {
                                if (this.lang_inquiry.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_inquiry[item.storageName];
                                }
                            });
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                    }
                }).catch(() => {
                    this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                });
            },
            // 公司信息
            claimSuccess() {
                // 获取 companyId
                const companyId = this.companyId;
                // 置空 companyId , 刷新页面
                this.companyId = null;
                // 重新请求管理权限和是否公海
                this.checkAuthority(companyId, () => {
                    setTimeout(() => {
                        this.addEventListenerScroll();
                    })
                });
            },

            // 全触点旅程
            change_flag_update_task() {
                this.flag_update_task = !this.flag_update_task;
            },
            // 监听时间轴滚动
            addEventListenerScroll() {
                this.$nextTick(() => {
                    if (this.timelineBox) {
                        this.timelineBox.removeEventListener('scroll', function() {});
                        this.timelineBox = null;
                        this.isScroll = false;
                    }
                    const that = this;
                    const timelineBox = this.timelineBox = document.querySelector('#timelineBox');
              
                    this.timelineBox.addEventListener('scroll', function(e) {
                        if (timelineBox.scrollTop > 0) {
                            if (timelineBox.scrollHeight >= timelineBox.offsetHeight + 165) {
                                that.isScroll = true;
                            }
                        } else {
                            that.isScroll = false;
                        }
                    });
                });
            },
            // 回到顶部
            toTop() {
                this.timelineBox.scrollTop = 0;
                this.isScroll = false;
            },
            toggleClick() {
                this.relatedInfoWidth = 0;
                localStorage.setItem('relatedInfoWidth', 0);
            },
            toggleClickShow() {
                this.relatedInfoWidth = 5;
                localStorage.setItem('relatedInfoWidth', 5);
            }
        },
        created() {
        },
        mounted() {
            // 获取 companyId
            const companyId = this.$route.query.companyId;
            // 请求管理权限和是否公海
            this.checkAuthority(companyId, () => {
                // 左侧导航折叠
                this.bus.$emit('shrinkMenu', true);
                // 获取授权字段
                this.get_columns_authorized();
                // 获取 下拉选项数据
                this.$store.dispatch('getSelectOptions');
                // 监听时间轴滚动
                this.$nextTick(() => {
                    this.addEventListenerScroll();
                });
            });
            // 从全局搜索结果页跳转至公海询盘/联系人详情页时，之前是侧滑打开 CRMDrawerList , 现在改为新窗口打开公海客户详情
            const globalSearchViewType = localStorage.getItem('leadsCloud-globalSearchViewType');
            const inquiryId = localStorage.getItem('leadsCloud-inquiryId');
            switch (globalSearchViewType) {
                case 'highSeaContact':
                    // 产品(常新琪)说不用管跳公海联系人这种情况
                    localStorage.removeItem('leadsCloud-globalSearchViewType');
                    localStorage.removeItem('leadsCloud-contactId');
                    break;
                case 'highSeaInquiry':
                default:
                    // 默认传入跳转时带过来的询盘 id 给 InquiryInfo 组件, 同时组件内部请求公司下询盘列表后会判断列表中有没有传入的询盘 id
                    this.inquiryId = inquiryId;
                    localStorage.removeItem('leadsCloud-globalSearchViewType');
                    localStorage.removeItem('leadsCloud-inquiryId');
                    break;
            }
            if (localStorage.getItem('relatedInfoWidth') !== null) {
                this.relatedInfoWidth = localStorage.getItem('relatedInfoWidth') / 1;
            } else {
                this.relatedInfoWidth = 5;
            }
        },
        beforeDestroy() {
            this.timelineBox.removeEventListener('scroll', function() {});
        }
    };
</script>

<style lang="less">
    .companyDetail {
        height: 100%;
        .card-box-relatedInfo{
            background: #fff;
            border-radius: 8px 8px 0px 0;
            height: 100%;
            position: relative;
        }
        .card-box{
            transition: width 0.2s linear;
            .CustomerJourney {
                border-radius: 8px;
                .el-card__body {
                    padding-top: 14px;
                }
            }
        }
        .toggle-relatedInfo {
            position: absolute;
            top: 48%;
            font-size: 40px;
            cursor: pointer;
        }
        > .el-col {
            height: 100%;
        }

        &-center-col {
            position: relative;
            border: 1px solid #E1E8EF;
            border-top:none;
            border-bottom:none;
            display: flex;
            flex-direction: column;
            &-toTop{
                position: absolute;
                width: 40px;
                height: 40px;
                border-radius:5px ;
                right: 25px;
                bottom: 16px;
                cursor: pointer;
            }
        }
        &-inquiry{
            height: 165px;
            padding: 20px 25px 10px;
            border-bottom: 1px solid #E1E8EF;
            overflow: hidden;
            margin-top: 0px;
            transition: all .6s linear;

        }
        .isScroll{
            margin-top: -165px;
        }
        &-journey {
            padding:20px 25px 12px;
            flex: 1;
            overflow: hidden;
        }
        .card-box-relatedInfo .el-card__body {
            padding: 0;
            background: #fff;
        }
    }
</style>
