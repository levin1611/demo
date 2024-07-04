<template>
    <div v-if="showDetail"
         v-loading="loading"
         class="company-detail">
        <div v-if="from !== 'xhl-chat'"
             @click="handleCloseDetail"
             class="detail-close">
            <Icon custom="custom-drawer-detail-close"></Icon>
        </div>
        <div class="detail-header">
            <div class="detail-header-title">{{ company_short_info.companyName }}</div>
            <div class="detail-header-body">
                <div v-for="item in company_short_info_items"
                     :key="item"
                     class="header-body-item">
                    <div class="header-body-item-left">{{ $t(`crm.newDetail.col_${item}`) }}</div>
                    <div class="header-body-item-right">{{ company_short_info[item] }}</div>
                </div>
            </div>
        </div>
        <div class="detail-body">
            <Tabs v-model="current_compo">
                <TabPane v-for="item in compo_list"
                         :key="item"
                         :name="item"
                         :label=" $t(`crm.newDetail.module_${item}`) "></TabPane>
            </Tabs>
            <keep-alive>
                <!-- 组件传递参数说明: -->
                <!-- type: 公司/询盘/联系人  -->
                <!-- id: 以上三类 id -->
                <!-- columns_authorized: 以上三类的权限字段 -->
                <!-- visitorId: 用于请求访问型跟进记录 -->
                <!-- button_ids: 用于控制组件页面和按钮权限 -->
                <!-- flag_update_contact: 新增/更新联系人时, 需刷新联系人列表 -->
                <!-- flag_update_detail: 更新当前正在查看的 公司/询盘/联系人 时, 需刷新详情列表 -->
                <!-- flag_update_inquiry: 新增/更新/转移 询盘后, 需刷新询盘列表 -->
                <component :is="current_compo"
                           :type="'customer'"
                           :id="companyId"
                           :visitorId="''"
                           :columns_authorized="corp_columns_authorized"
                           :flag_update_contact.sync="flag_update_contact"
                           :flag_update_detail.sync="flag_update_detail"
                           :flag_update_inquiry.sync="flag_update_inquiry"
                           v-on="$listeners"
                           class="detail-body-container">
                </component>
            </keep-alive>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    import FollowUp from '@/views/main-components/timeline/index.vue';
    import DetailInfo from './components/detailInfo';
    import ContactList from './components/contactList';
    import InquiryList from './components/inquiryList';

    export default {
        name: 'CompanyDetail',
        props: {
            companyId: {
                type: Number,
                default: 0
            },
            from: {
                type: String,
                default: ''
            }
        },
        components: {
            DetailInfo,
            FollowUp,
            ContactList,
            InquiryList
        },
        data() {
            return {
                loading: false,
                company_short_info: {}, // 公司简略信息
                company_short_info_items: [
                    'clientId',
                    'clientType',
                    'homePage',
                    'contactAddress',
                    'companyManagers'
                ], // 公司简略信息条目
                /* 动态组件部分 */
                flag_update_contact: false,
                flag_update_detail: false,
                flag_update_inquiry: false,
                compo_list: [
                    'FollowUp',
                    'DetailInfo',
                    'ContactList',
                    'InquiryList'
                ],
                current_compo: 'FollowUp',
                /* 对接权限系统 */
                corp_columns_authorized: {}, // 公司所有字段
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
                showDetail: true
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                window_height: state => state.window_height
            }),
            bodyHeight() {
                const temp = this.window_height ? this.window_height - 120 : document.body.clientHeight - 120;
                return temp > 200 ? temp : 200;
            }
        },
        methods: {
            // 查客户简略信息
            getSimpleCompany() {
                this.loading = true;
                util.ajax({
                    url: '/crm/company/getSimpleCompany',
                    method: 'post',
                    data: {
                        companyId: this.companyId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.company_short_info = response.data.data;
                        this.company_short_info.clientId = response.data.data.id;
                    }
                    this.loading = false;
                });
            },
            get_corp_columns_authorized() {
                util.ajax({
                    url: '/crm/columnConfig/getFields',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        parentId: 1
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.corp_columns_authorized = response.data.data;
                        if (this.corp_columns_authorized.default) {
                            this.corp_columns_authorized.default.forEach(item => {
                                if (this.lang_company.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_company[item.storageName];
                                }
                            });
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                    }
                    this.loading = false;
                });
            },
            handleCloseDetail() {
                this.showDetail = false;
                this.$emit('changeShowDetail', false);
            }
        },

        created() {
            this.loading = true;
            this.get_corp_columns_authorized();
            this.getSimpleCompany();
        },
        watch: {
            companyId() {
                this.getSimpleCompany();
            }
        }
    };
</script>

<style lang="less">
    .company-detail {
        .detail-header {
            padding: 20px;

            .detail-header-title {
                font-weight: 700;
                margin-bottom: 6px;
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
                        width: 72%;
                    }
                }
            }
        }

        .detail-body {
            border-top: 1px solid #E8E8E8;

            .el-tabs__header {
                margin-bottom: 16px;
            }

            .el-tabs__nav-wrap:after {
                height: 1px;
            }

            .el-tabs__nav {
                .el-tabs__item {
                    padding: 0 15px;
                }
            }

            .detail-body-container {
                padding: 20px 6px;
                height: calc(~"100vh - 332px");
                overflow-y: auto;
                overflow-x: hidden;

                &.detail-info {
                    margin-bottom: 0;
                }

                &::-webkit-scrollbar {
                    width: 4px;
                }
            }
        }

        .detail-close {
            float: right;
            color: rgb(73, 80, 96);
            font-size: 26px;
            opacity: 0.5;
            border-radius: 20%;
        }
    }

</style>
