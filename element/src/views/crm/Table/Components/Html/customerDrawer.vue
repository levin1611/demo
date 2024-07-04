<template>
    <Drawer :visible="visible"
            size="50%"
            :modal="false"
            :append-to-body="true"
            :with-header="false"
            @open="visibleChange(true)"
            @close="visibleChange(false)"
            @scroll.native.capture="close_popper"
            class="drawer-show-main-header drawer-close-button-moveUp">
        <!-- 自定义关闭按钮 -->
        <a @click="visibleChange(false)"
           class="drawer-close-button">
            <Icon custom="custom-drawer-detail-close"></Icon>
        </a>
        <!-- 第一层 Drawer -->
        <div style="height: 100%; overflow-y: auto;">
            <CustomerDrawerDetail
                    ref="crmDetail"
                    :type="type"
                    :originalType="originalType"
                    :colSpan="colSpan"
                    :topId="id"
                    :companyId="id"
                    @viewInquiry="viewInquiry"
                    @viewContact="viewContact"
                    @refreshCheck="refreshCheck"
                    @closeAllDrawer="closeAllDrawer"
                    :disabled="disabled"
                    :flag_refresh_contact.sync="flag_refresh_contact"
                    :flag_new_followUp="flag_new_followUp"
                    @change_flag_new_followUp="change_flag_new_followUp"
                    :corp_columns_authorized="corp_columns_authorized"
                    :contact_columns_authorized="contact_columns_authorized"
                    :inquiry_columns_authorized="inquiry_columns_authorized"
                    v-on="$listeners">
            </CustomerDrawerDetail>
        </div>
    </Drawer>
</template>

<script>
    import CustomerDrawerDetail from '@/views/crm/Table/Components/Html/customerDrawerDetail';
    import { mapGetters } from 'vuex';
    export default {
        name: 'customerDrawer',
        components: {
            CustomerDrawerDetail
        },
        props: [
            'visible',
            'id',
            'type',
            'originalType',
            'from',
            'corp_columns_authorized',
            'contact_columns_authorized',
            'inquiry_columns_authorized',
            'disabled',
            'colSpan'
        ],
        computed: {
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ])
        },
        data() {
            return {
                /* 各种 flag , 控制详情页刷新 */
                flag_new_followUp: true, // 控制新增跟进记录后刷新所有详情页 drawer 时间轴数据
                flag_refresh_contact: true, // 新建编辑联系人后, 公司/询盘详情页联系人列表刷新
                close_popper: this.$debounce(e => {
                    if (e && e.target && e.target.parentElement && e.target.parentElement.classList.contains('el-drawer__body')) {
                        const selectEl = this.$refs.crmDetail;
                        if (selectEl) {
                            const selectEl2 = selectEl.$refs.followUp;
                            if (selectEl2) {
                                const selectEl3 = selectEl2.$refs.crmDetailTimeLine;
                                const finalEl = selectEl3.$el.querySelector('.click-close-popper');
                                if (finalEl) {
                                    finalEl.click();
                                }
                            }
                        }
                    }
                }, 200, true)
            };
        },
        methods: {
            // claimSuccess() {
            //     this.$emit('claimSuccess');
            // },
            /* 查看详情 */
            async viewCompany(companyId) {
                // 判断是否有"我的客户"页面权限
                if (!this.isContainsMenu('myCustomer')) {
                    // 没有"我的客户"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                    return;
                }

                // 查询该公司 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Customer',
                    id: companyId
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 否则直接新窗口打开新客户详情页
                this.$viewCustomer(companyId);
            },
            async viewInquiry(inquiryId) {
                // 无 inquiryId , 退出流程
                if (!inquiryId) {
                    this.$Message.error(this.$t('crm.Modal.error_inquiryId'));
                    return;
                }

                // 判断是否有"我的询盘"页面权限
                if (!this.isContainsMenu('myInquiry')) {
                    // 没有"我的询盘"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyInquiry'));
                    return;
                }

                // 查询该询盘 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Inquiry',
                    id: inquiryId
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 如果是公海询盘
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpInquiryInHighseas'));
                    return;

                    // if (this.isContainsMenu('highseasCustomer')) {
                    //     // 如果有公海目录权限
                    //     this.$viewHighSeasCustomer(this.id);
                    // } else {
                    //     // 没有"公海客户"页面权限, 弹出提示
                    //     this.$Message.warning(this.$t('globalSearch.haveNoPermissionHighseasCustomer'));
                    // }
                    // return;
                }

                // 新窗口打开询盘详情页
                localStorage.setItem('leadsCloud-inquiryId', inquiryId);
                window.open(this.$router.resolve({
                    name: 'myInquiry'
                }).href, '_blank');
            },
            viewContact(contactId) {},
            refreshCheck(obj) {
                this.$emit('refreshCheck', obj);
            },
            closeAllDrawer() {
                this.$emit('update:id', 0);
            },
            change_flag_new_followUp() {
                this.flag_new_followUp = !this.flag_new_followUp;
            },
            visibleChange(val) {
                this.$emit('update:visible', val);
            },

            // 绑定给当前所处的 DOM (single-page) 的点击事件, 点击表格条目以外的操作将关闭最上一层 drawer
            click_blank(e) {
                if (this.visible) {
                    let boo = true;
                    let temp_el = e.target;
                    while (temp_el && !temp_el.classList.contains('single-page')) {
                        if (temp_el.classList.contains('vxe-body--row')) {
                            boo = false;
                            break;
                        } else {
                            temp_el = temp_el.parentElement;
                        }
                    }
                    if (boo) {
                        this.$emit('update:visible', false);
                    }
                }
            }
        },
        mounted() {
            const parentView = document.getElementsByClassName('single-page')[0];
            if (parentView) {
                parentView.addEventListener('click', this.click_blank);
            }
        },
        beforeDestroy() {
            const parentView = document.getElementsByClassName('single-page')[0];
            if (parentView) {
                parentView.removeEventListener('click', this.click_blank);
            }
        },
        watch: {
            id(val) {
                if (!val) {
                    this.$emit('update:visible', false);
                }
            }
        }
    };
</script>

<style lang="less">
    @import "~@/styles/common.less";
    @import "../../../Detail/Components/less/modal.less";
    @import "../less/tablePage.less";
    @import "../../../Detail/Components/less/detailPage.less";
</style>
