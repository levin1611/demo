<template>
    <div v-if="showDetail"
         v-loading="loading"
         class="inquiry-detail">
        <div v-if="from !== 'xhl-chat'"
             @click="handleCloseDetail"
             class="detail-close">
            <Icon custom="custom-drawer-detail-close"></Icon>
        </div>
        <div class="detail-header">
            <div v-if="inquiry_short_info"
                 class="detail-header-title">
                <span @click="jumpToTheInquiryDetail('seqNumber')"
                      class="header-source">{{ inquiry_short_info.seqNumber }}</span>
            </div>
            <div class="detail-header-body">
                <div v-for="item in inquiry_short_info_items"
                     :key="item"
                     class="header-body-item">
                    <div class="header-body-item-left">{{ $t(`crm.newDetail.col_${item}`) }}</div>
                    <div @click="jumpToTheCompanyDetail(item, 'seqNumber')"
                         :class="{ 'header-source': item === 'companyName', 'header-body-item-right': true }">{{ inquiry_short_info[item] }}
                    </div>
                </div>
            </div>
        </div>
        <div class="detail-body component-wrap">
            <Tabs v-model="current_compo">
                <TabPane v-for="item in compo_list"
                         :key="item"
                         :name="item"
                         :label=" $t(`crm.newDetail.module_${item}`) "></TabPane>
            </Tabs>
            <keep-alive v-if="!loading">
                <!-- 组件传递参数说明: -->
                <!-- type: 客户/公海管理/询盘/联系人  -->
                <!-- id: 以上 type 的 id -->
                <!-- columns_authorized: 以上 type 的权限字段 -->
                <!-- visitorId: 用于请求访问型跟进记录 -->
                <!-- flag_update_contact: 新增/更新联系人时, 需刷新联系人列表 -->
                <!-- flag_update_detail: 更新当前正在查看的 公司/询盘/联系人 时, 需刷新详情列表 -->
                <!-- flag_update_inquiry: 新增/更新/转移 询盘后, 需刷新询盘列表 -->
                <component :is="current_compo"
                        :type="'inquiry'"
                        :originalType="originalType"
                        :colSpan="colSpan"
                        :disabled="true"
                        fromType="inquiry"
                        :id="inquiryId"
                        :inquiryId="inquiryId"
                        :inquirySeqNumber="inquiry_short_info.seqNumber"
                        :inquiryManagers="inquiry_short_info.userIdsShow"
                        :inquiryManagerNames="inquiry_short_info.userNamesShow"
                        :followUpId="inquiry_short_info.followUpId"
                        :companyId="inquiry_short_info.companyId"
                        :companyName="inquiry_short_info.companyName"
                        :columns_authorized="inquiry_columns_authorized"
                        :contact_columns_authorized="contact_columns_authorized"
                        smallSize="true"
                        @viewInquiry="viewInquiry"
                        @viewContact="viewContact"
                        :class="`detail-body-container tinyInqCompo-${current_compo}`">
                </component>
            </keep-alive>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';

    import FollowUp from '@/views/main-components/timeline/index.vue';
    import DetailInfo from '@/views/crm/Detail/Components/Html/detailInfo';
    // import ContactList from '@/views/main-components/tiny-detail/company-detail/components/contactList';
    import ContactList from '@/views/crm/Detail/Components/Html/contactList';
    import Documents from '@/views/crm/Detail/Components/Html/relatedDocuments';
    import Task from '@/views/main-components/tiny-detail/Inquiry-detail/components/taskList';

    export default {
        name: 'InquiryDetail',
        props: [
            'clueId',
            'from',
            'inquiryId',
            'companyId',
            'originalType',
            'colSpan'
        ],
        components: {
            DetailInfo,
            FollowUp,
            ContactList,
            Task,
            Documents
        },
        data() {
            return {
                loading: false,

                /* 全局 */
                inquiry_short_info: {}, // 询盘详情

                inquiry_short_info_items: [
                    'companyName',
                    'productCategory',
                    'grouping',
                    'inquiryScore',
                    'inquiryManagers'
                ], // 线索简略信息条目
                /* 动态组件部分 */
                compo_list: [
                    'FollowUp',
                    'DetailInfo',
                    'ContactList',
                    'Task',
                    'Documents'
                ],
                current_compo: 'FollowUp',
                /* 对接权限系统 */
                inquiry_columns_authorized: {}, // 询盘所有字段
                contact_columns_authorized: {}, // 联系人所有字段

                lang_company: {
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
                    companyRemark: this.$t('crm.Modal.corp_companyRemark')
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
                /* 右上角显示询盘或操作 */
                showDetail: true // 显示线索详情页
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                window_height: state => state.window_height
            }),
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ])
        },
        methods: {
            async viewInquiry(inquiryId) {
                // 无 inquiryId , 退出流程
                if (!inquiryId) {
                    this.$Message.error(this.$t('crm.Modal.error_inquiryId'));
                    return;
                }

                // 校验是否有该条询盘管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Inquiry',
                    id: inquiryId
                });
                if (!authorized) return;
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpInquiryInHighseas'));
                    return;
                }

                // 校验通过, 新标签页打开询盘详情
                localStorage.setItem('leadsCloud-inquiryId', inquiryId);
                window.open(this.$rootRouter.resolve({
                    name: 'myInquiry'
                }).href, '_blank');
            },
            viewContact(data) {
                localStorage.setItem('leadsCloud-contactId', data);
                window.open(this.$rootRouter.resolve({
                    name: 'myContact'
                }).href, '_blank');
            },
            /* 全局  获取询盘简略信息 */
            get_inquiry_short_info() {
                this.loading = true;
                util.ajax({
                    url: '/crm/inquiry/getInquiryAndCompany',
                    method: 'post',
                    data: {
                        id: this.inquiryId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.inquiry_short_info = response.data.data;
                        const productCategory = this.inquiry_short_info.productCategory;
                        if (productCategory) {
                            this.inquiry_short_info.productCategory = this.$options.filters.parseArray(productCategory).length ? this.$options.filters.parseArray(productCategory).join(', ') : productCategory;
                        }
                        this.inquiry_short_info.inquiryManagers = response.data.data.userNamesShow;
                    } else {
                        this.$Message.error(this.$t('crm.newDetail.error_getInquiryBriefInfo'));
                    }
                    this.loading = false;
                });
            },
            // 获取crm授权字段
            get_columns_authorized() {
                util.ajax({
                    url: '/crm/columnConfig/getFields',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        parentId: 0
                    }
                })
                    .then(response => {
                        if (response.data.code === '1') {
                            // 暂存所有默认字段和自定义字段
                            const defaultFields = response.data.data && Array.isArray(response.data.data.default) ? response.data.data.default : [];
                            const customFields = response.data.data && Array.isArray(response.data.data.custom) ? response.data.data.custom : [];
                            // 筛选得到公司/询盘/联系人授权字段
                            this.$set(this.inquiry_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 3));
                            this.$set(this.inquiry_columns_authorized, 'custom', customFields.filter(col => col.parentId === 3));
                            this.$set(this.contact_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 2));
                            this.$set(this.contact_columns_authorized, 'custom', customFields.filter(col => col.parentId === 2));
                            if (this.inquiry_columns_authorized.default) {
                                this.inquiry_columns_authorized.default.forEach(item => {
                                    if (this.lang_inquiry.hasOwnProperty(item.storageName)) {
                                        item.cname = this.lang_inquiry[item.storageName];
                                    }
                                });
                            }
                            if (this.contact_columns_authorized.default) {
                                this.contact_columns_authorized.default.forEach(item => {
                                    if (this.lang_contact.hasOwnProperty(item.storageName)) {
                                        item.cname = this.lang_contact[item.storageName];
                                    }
                                });
                            }
                        } else {
                            this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                        }
                    })
                    .catch(erro => {
                        this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                    });
            },
            handleCloseDetail() {
                this.showDetail = false;
                this.$emit('changeShowDetail', false);
            },

            async jumpToTheInquiryDetail(item) {
                // 校验是否有询盘目录权限
                if (!this.isContainsMenu('myInquiry')) {
                    this.$Message.warning(this.$t('crm.newDetail.error_noMenuAuthority'));
                    return;
                }

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

                // 校验通过
                if (item === 'seqNumber') {
                    localStorage.setItem('leadsCloud-inquiryId', this.inquiryId);
                    window.open(this.$rootRouter.resolve({
                        name: 'myInquiry'
                    }).href, '_blank');
                }
            },
            jumpToTheCompanyDetail(item, seqNum) {
                if (!this.isContainsMenu('myCustomer')) {
                    this.$Message.warning(this.$t('crm.newDetail.error_noMenuAuthority'));
                    return;
                }
                if (item === 'companyName' && seqNum === 'seqNumber') {
                    console.log('跳转');
                    this.$viewCustomer(this.inquiry_short_info.companyId);
                }
            }
        },

        created() {
            this.loading = true;
            this.get_columns_authorized();
            // 获取 下拉选项数据 子组件有用到，在此调用下
            this.$store.dispatch('getSelectOptions');
            // this.get_inquiry_short_info()

            // whatsApp 界面, 新增'客户类型'显示
            if (this.originalType === 'whatsApp') {
                this.inquiry_short_info_items.splice(1, 0, 'clientType');
            }
        },
        watch: {
            inquiryId: {
                handler(val) {
                    if (val) {
                        this.get_inquiry_short_info();
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less" scoped>
    .inquiry-detail {
        .detail-header {
            padding: 20px;

            .detail-header-title {
                font-weight: 700;
                margin-bottom: 6px;
            }

            .header-source {
                float: none;
                padding-left: 0;
                //border-left: 1px solid #d5d8dd;
                color: #4285F4;
                cursor: pointer;

                &:hover {
                    color: #2d63bc;
                    text-decoration: underline;
                }
            }

            .detail-header-body {
                font-size: 12px;

                .header-body-item {
                    padding: 3px 0;

                    .header-body-item-left {
                        display: inline-block;
                        width: 28%;
                    }

                    .header-body-item-right {
                        display: inline-block;
                        // width: 72%;
                    }

                    .header-source {
                        /*float: left;
                        padding-left: 8px;*/
                        //border-left: 1px solid #d5d8dd;
                        color: #4285F4;
                        cursor: pointer;

                        &:hover {
                            color: #2d63bc;
                            text-decoration: underline;
                        }
                    }
                }
            }
        }

        .detail-body {
            border-top: 1px solid #E8E8E8;

            /deep/ .el-tabs__header {
                margin-bottom: 0;
            }

            /deep/ .el-tabs__nav-wrap:after {
                height: 1px;
            }
            .detail-body-container {
                overflow-y: auto;
                overflow-x: hidden;

                &.detail-info {
                    margin-bottom: 0;
                }

                &::-webkit-scrollbar {
                    width: 4px;
                }
            }
            .tinyInqCompo-DetailInfo {
                height: calc(100vh - 370px);
            }
        }

        .detail-close {
            float: right;
            color: rgb(73, 80, 96);
            font-size: 26px;
            opacity: 0.5;
            border-radius: 20%;
            cursor: pointer;
        }
    }

</style>
