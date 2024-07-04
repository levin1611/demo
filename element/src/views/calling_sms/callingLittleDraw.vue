<template>
    <div class="" style="position: relative;">
         <littleDrawer
         :styleDrawer="{
            height: table_height+'px',
            top: '60px'
         }"
        :visible="showApp"
        :id="wrapId"
        :currAccountInfo="selectedChatInfo"
        :corp_columns_authorized="corp_columns_authorized"
        :inquiry_columns_authorized="inquiry_columns_authorized"
        :contact_columns_authorized="contact_columns_authorized"
        :type="wrapType"
        :from="'global_sms_calling'"
        @handleClick="handleClicklittleDrawer"
        @littleDrawerHidden="littleDrawerHidden"
        @updateStatus="updateStatus"
        @updateInquiryStatus="updateInquiryStatus"
        @updateWAAccountCrmStatus="updateInquiryStatus"
        @updateCommentClueStatus="updateInquiryStatus"
        @updateInquiryStatusWaEmbedded="$emit('updateInquiryStatusWaEmbedded', 1)"
        @chownSuccess="reinitLittle"
        @refreshData="reinitLittle">
    </littleDrawer>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import util from '@/libs/util';
    import littleDrawer from '@/views/main-components/little-drawer/little-drawer.vue';
    // import state from '../../store/state';


    export default {
        name: 'waLittleDrawer',
        computed: {
            ...mapState({
                orgId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                WAUnreadCount: state => state.whatsapp.WAUnreadCount,
                websocketMsgWA: state => state.whatsapp.websocketMsgWA,
                viewingSubWA: state => state.whatsapp.viewingSubWA,
                WAIsMd: state => state.whatsapp.WAIsMd,
                button_list: state => state.app.button_list,
                WA_btn_list: state => state.whatsapp.WA_btn_list,
                window_height: state => state.window_height
            }),
            table_height() {
                const temp = this.window_height ? this.window_height - 50 : document.body.clientHeight - 50;
                return temp;
            }
        },
        props: ['selectedChatInfo', 'littleDrawerVisible', 'waRelatedCRMInfo'],
        components: {
            littleDrawer
        },
        data() {
            return {
                corp_columns_authorized: {},
                contact_columns_authorized: {},
                inquiry_columns_authorized: {},
                showApp: false,
                // crm 侧滑组件
                lang_inquiry: {
                    productCategory: this.$t('crm.Modal.inq_productCategory'),
                    demandProducts: this.$t('crm.Modal.inq_demandProducts'),
                    inquiryScore: this.$t('crm.Modal.inq_inquiryScore'),
                    label: this.$t('crm.Modal.inq_label'),
                    sourceChannel: this.$t('crm.Modal.inq_sourceChannel'),
                    sourceWay: this.$t('crm.Modal.inq_sourceWay'),
                    grouping: this.$t('crm.Modal.inq_grouping'),
                    followUp: this.$t('crm.Modal.inq_followUp'),
                    remark: this.$t('crm.Modal.inq_remark')
                },
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
                wrapType: 'customer',
                wrapId: '1',

                // 定时轮询检查侧滑页宽度是否正常
                interval_checkWidth: null
            };
        },
        methods: {
            /* 全局  获取询盘简略信息 */
            get_inquiry_short_info() {
                util.ajax({
                    url: '/crm/inquiry/getInquiryAndCompany',
                    method: 'post',
                    data: {
                        id: this.waRelatedCRMInfo.inquiryId
                    }
                }).then(res => {
                    const data = res.data.data;
                    // console.log(data,'data');
                    if (data.userIdsShow == '-1') {
                        this.wrapType = 'highseasCustomer';
                    } else {
                        this.wrapType = 'customer';
                    }
                    this.wrapId = data.companyId || data.id;
                    // console.log(this.wrapId);
                    this.$nextTick(() => {
                        this.showApp = true;
                    });
                });
            },
            // 获取线索简略信息
            get_clue_short_info() {
                util.ajax({
                    url: '/form-cust/form/getSimpleColumnValue',
                    method: 'post',
                    data: {
                        id: this.waRelatedCRMInfo.clueId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        const data = res.data.data;
                        if (data.saleId == '-1') {
                            this.wrapType = 'highseasClue';
                        } else {
                            this.wrapType = 'clue';
                        }
                        this.wrapId = data.companyId || data.id;
                        this.$nextTick(() => {
                            this.showApp = true;
                        });
                    } else {
                        this.$Message.error('获取线索简略信息出错');
                    }
                });
            },
            // 获取crm授权字段
            get_columns_authorized() {
                util.ajax({
                    url: '/crm/columnConfig/getFields',
                    method: 'get',
                    params: {
                        orgId: this.orgId,
                        userId: this.userId,
                        parentId: 0
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        // 暂存所有默认字段和自定义字段
                        const defaultFields = response.data.data && Array.isArray(response.data.data.default) ? response.data.data.default : [];
                        const customFields = response.data.data && Array.isArray(response.data.data.custom) ? response.data.data.custom : [];
                        // 筛选得到公司/询盘/联系人授权字段
                        this.$set(this.corp_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 1));
                        this.$set(this.corp_columns_authorized, 'custom', customFields.filter(col => col.parentId === 1));
                        this.$set(this.contact_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 2));
                        this.$set(this.contact_columns_authorized, 'custom', customFields.filter(col => col.parentId === 2));
                        this.$set(this.inquiry_columns_authorized, 'default', defaultFields.filter(col => col.parentId === 3));
                        this.$set(this.inquiry_columns_authorized, 'custom', customFields.filter(col => col.parentId === 3));
                        if (this.corp_columns_authorized.default) {
                            this.corp_columns_authorized.default.forEach(item => {
                                if (this.lang_company.hasOwnProperty(item.storageName)) {
                                    item.cname = this.lang_company[item.storageName];
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
                }).catch(erro => {
                    this.$Message.error(this.$t('crm.Table.error_getTableColumns'));
                });
            },
            handleClicklittleDrawer(val) {
                console.log(val);
            },
            littleDrawerHidden(val) {
                this.$emit('littleDrawerHidden', val);
            },
            updateInquiryStatus(clueId, status) {
                this.$emit('updateInquiryStatus', clueId, status);
            },
            updateStatus(clueId, status) {
                this.$emit('updateStatus', clueId, status);
            },
            reinitLittle(obj) {
                this.$emit('chownSuccess', obj);
            },
          
        },
        async created() {
            // this.getMailTitleDisplayInformationValue();
            // this.init();
            // 获取 下拉选项数据 子组件有用到 更新下
            this.$store.dispatch('getSelectOptions');
            // 获取全部销售人员 线索弹窗录询盘用
            this.$store.dispatch('getSalesList');
        },
        mounted() {
            this.get_columns_authorized();
        },
        beforeDestroy() {
            // 清除轮询
            if (this.interval_checkWidth) {
                clearInterval(this.interval_checkWidth);
                this.interval_checkWidth = null;
            }
        },
        watch: {
            littleDrawerVisible: {
                handler(n) {
                    if (this.waRelatedCRMInfo.inquiryId) {
                        // 询盘详情
                        this.get_inquiry_short_info();
                    } else if (this.waRelatedCRMInfo.clueId) {
                        // 线索详情
                        this.get_clue_short_info();
                    }
                },
                immediate: true
            }
        }
    };
</script>
<style lang="less" scoped>
.whatsapp_microenterprise .el-drawer .rtl {
    top: 170px;
}
</style>
