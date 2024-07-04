<template>
    <div>
        <Drawer :visible="visible"
                size="75%"
                :modal="false"
                :append-to-body="true"
                :with-header="false"
                ref="topDrawer"
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
                <template v-if="type === 'customer' || type === 'others'">
                    <CustomerDetail
                            ref="crmDetail"
                            :type="type"
                            :originalType="originalType"
                            :colSpan="colSpan"
                            :topId="id"
                            :companyId="id"
                            @viewInquiry="viewInquiry"
                            @viewContact="viewContact"
                            :companyName.sync="companyName"
                            @viewCustomsData="viewCustomsData"
                            @refreshCheck="refreshCheck"
                            @closeAllDrawer="closeAllDrawer"
                            :disabled="disabled"
                            :flag_refresh_contact.sync="flag_refresh_contact"
                            :flag_new_followUp="flag_new_followUp"
                            @change_flag_new_followUp="change_flag_new_followUp"

                            :corp_columns_authorized="corp_columns_authorized"
                            :contact_columns_authorized="contact_columns_authorized"
                            :inquiry_columns_authorized="inquiry_columns_authorized"
                            >
                    </CustomerDetail>
                </template>
                <template v-else-if="type === 'inquiry'">
                    <InquiryDetail
                            ref="crmDetail"
                            :type="type"
                            :originalType="originalType"
                            :colSpan="colSpan"
                            :topId="id"
                            :inquiryId="id"
                            @viewCompany="viewCompany"
                            @viewContact="viewContact"
                            @refreshCheck="refreshCheck"
                            @closeAllDrawer="closeAllDrawer"
                            :disabled="disabled"
                            :flag_refresh_contact.sync="flag_refresh_contact"
                            :flag_new_followUp="flag_new_followUp"
                            @change_flag_new_followUp="change_flag_new_followUp"

                            :contact_columns_authorized="contact_columns_authorized"
                            :inquiry_columns_authorized="inquiry_columns_authorized"
                            >
                    </InquiryDetail>
                </template>
                <template v-else-if="type === 'contact'">
                    <ContactDetail
                            ref="crmDetail"
                            :type="type"
                            :originalType="originalType"
                            :colSpan="colSpan"
                            :topId="id"
                            :contactId="id"
                            @viewInquiry="viewInquiry"
                            @viewCompany="viewCompany"
                            @refreshCheck="refreshCheck"
                            @closeAllDrawer="closeAllDrawer"
                            :disabled="disabled"
                            :flag_refresh_contact.sync="flag_refresh_contact"
                            :flag_new_followUp="flag_new_followUp"
                            @change_flag_new_followUp="change_flag_new_followUp"
                            :contact_columns_authorized="contact_columns_authorized"
                            :inquiry_columns_authorized="inquiry_columns_authorized">
                    </ContactDetail>
                </template>
                <template v-else-if="type === 'highseasCustomer'">
                    <HighSeasCustomerDetail
                            ref="crmDetail"
                            :type="type"
                            :originalType="originalType"
                            :colSpan="colSpan"
                            :topId="id"
                            :companyId="id"
                            @viewInquiry="viewInquiry"
                            @viewContact="viewContact"
                            :companyName.sync="companyName"
                            @viewCustomsData="viewCustomsData"
                            @refreshCheck="refreshCheck"
                            @closeAllDrawer="closeAllDrawer"
                            :disabled="disabled"
                            :flag_refresh_contact.sync="flag_refresh_contact"
                            :flag_new_followUp="flag_new_followUp"
                            @change_flag_new_followUp="change_flag_new_followUp"

                            :corp_columns_authorized="corp_columns_authorized"
                            :contact_columns_authorized="contact_columns_authorized"
                            :inquiry_columns_authorized="inquiry_columns_authorized"
                            >
                    </HighSeasCustomerDetail>
                </template>
            </div>
        </Drawer>

        <Drawer v-for="(item, index) in drawer_list"
                :visible.sync="item.visible"
                size="75%"
                :modal="false"
                :append-to-body="true"
                :with-header="false"
                @close="toggle_drawer(false, index)"
                @scroll.native.capture="close_popper"
                class="drawer-show-main-header drawer-close-button-moveUp">
            <!-- 自定义关闭按钮 -->
            <a @click="toggle_drawer(false, index)"
               class="drawer-close-button">
                <Icon custom="custom-drawer-detail-close"></Icon>
            </a>
            <!-- 嵌套 Drawer -->
            <div style="height: 100%; overflow-y: auto;">
                <!-- 客户/公海客户 -->
                <template v-if="['CustomerDetail', 'HighSeasCustomerDetail'].includes(item.type)">
                    <component :is="item.type"
                               :disabled="disabled"
                               :type="type"
                               :originalType="originalType"
                                :colSpan="colSpan"
                               :topId="id"
                               :companyId="item.id"
                               :companyName.sync="companyName"
                               :corp_columns_authorized="corp_columns_authorized"
                               :inquiry_columns_authorized="inquiry_columns_authorized"
                               :contact_columns_authorized="contact_columns_authorized"
                               :flag_refresh_contact.sync="flag_refresh_contact"
                               :flag_new_followUp="flag_new_followUp"
                               ref="crmDetail"
                               @viewInquiry="viewInquiry"
                               @viewContact="viewContact"
                               @viewCustomsData="viewCustomsData"
                               @refreshCheck="refreshCheck"
                               @closeAllDrawer="closeAllDrawer"
                               @change_flag_new_followUp="change_flag_new_followUp"></component>
                </template>
                <!-- 询盘/公海询盘 -->
                <template v-else-if="['InquiryDetail', 'HighSeasInquiryDetail'].includes(item.type)">
                    <component :is="item.type"
                               :disabled="disabled"
                               :type="type"
                               :originalType="originalType"
                                :colSpan="colSpan"
                               :topId="id"
                               :inquiryId="item.id"
                               :inquiry_columns_authorized="inquiry_columns_authorized"
                               :contact_columns_authorized="contact_columns_authorized"
                               :flag_refresh_contact.sync="flag_refresh_contact"
                               :flag_new_followUp="flag_new_followUp"
                               ref="crmDetail"
                               @viewCompany="viewCompany"
                               @viewContact="viewContact"
                               @refreshCheck="refreshCheck"
                               @closeAllDrawer="closeAllDrawer"
                               @change_flag_new_followUp="change_flag_new_followUp"></component>
                </template>
                <!-- 联系人/公海联系人 -->
                <template v-else-if="['ContactDetail', 'HighSeasContactDetail'].includes(item.type)">
                    <component :is="item.type"
                               :disabled="disabled"
                               :type="type"
                               :originalType="originalType"
                                :colSpan="colSpan"
                               :topId="id"
                               :contactId="item.id"
                               :contact_columns_authorized="contact_columns_authorized"
                               :inquiry_columns_authorized="inquiry_columns_authorized"
                               :flag_refresh_contact.sync="flag_refresh_contact"
                               :flag_new_followUp="flag_new_followUp"
                               ref="crmDetail"
                               @viewCompany="viewCompany"
                               @viewInquiry="viewInquiry"
                               @refreshCheck="refreshCheck"
                               @closeAllDrawer="closeAllDrawer"
                               @change_flag_new_followUp="change_flag_new_followUp"></component>
                </template>
            </div>
        </Drawer>
    </div>
</template>

<script>
    import CustomerDetail from '@/views/crm/Detail/customerDetail';
    import InquiryDetail from '@/views/crm/Detail/inquiryDetail';
    import ContactDetail from '@/views/crm/Detail/contactDetail';
    import HighSeasCustomerDetail from '@/views/crm/Detail/highSeasCustomerDetail';
    import HighSeasInquiryDetail from '@/views/crm/Detail/highSeasInquiryDetail';
    import HighSeasContactDetail from '@/views/crm/Detail/highSeasContactDetail';
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'CRMDrawerList',
        components: {
            CustomerDetail,
            InquiryDetail,
            ContactDetail,
            HighSeasCustomerDetail,
            HighSeasInquiryDetail,
            HighSeasContactDetail
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
            ...mapState({
                userId: 'userId',
                enterpriseId: 'enterpriseId',
                button_list: state => state.app.button_list
            }), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ])
        },
        data() {
            return {
                /* 海关数据, 公司名称 */
                companyName: '',

                /* 叠加 drawer */
                drawer_list: [],

                /* 各种 flag , 控制详情页刷新 */
                flag_new_followUp: true, // 控制新增跟进记录后刷新所有详情页 drawer 时间轴数据
                flag_refresh_contact: true, // 新建编辑联系人后, 公司/询盘详情页联系人列表刷新
                close_popper: this.$debounce(e => {
                    if (e && e.target && e.target.parentElement && e.target.parentElement.classList.contains('el-drawer__body')) {
                        const selectEl = this.$refs.crmDetail[(this.$refs.crmDetail.length - 1)] || this.$refs.crmDetail;
                        if (selectEl && selectEl.$refs.followUp) {
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

                // 判断是打开询盘详情页还是公海询盘详情页
                let type = 'InquiryDetail';
                if (authorized === 'highseas') {
                    if (!this.isContainsMenu('highseasCustomer')) {
                        // 没有"公海客户"页面权限, 弹出提示
                        this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionHighseasCustomer'));
                        return false;
                    }
                    // 如果有"公海客户"页面权限, 正常弹出侧滑页
                    type = 'HighSeasInquiryDetail';
                }
                // 打开询盘详情页
                const tempObj = {
                    type,
                    visible: false,
                    id: inquiryId
                };
                this.drawer_list.push(tempObj);
                this.$nextTick(() => {
                    tempObj.visible = true;
                });
            },
            async viewContact(contactId) {
                // 判断是否有"我的联系人"页面权限
                if (!this.isContainsMenu('myContact')) {
                    // 没有"我的联系人"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyContact'));
                    return;
                }

                // 查询该联系人 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Contact',
                    id: contactId
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 判断是打开联系人详情页还是公海联系人详情页
                let type = 'ContactDetail';
                if (authorized === 'highseas') {
                    if (!this.isContainsMenu('highseasCustomer')) {
                        // 没有"公海客户"页面权限, 弹出提示
                        this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionHighseasCustomer'));
                        return false;
                    }
                    // 如果有"公海客户"页面权限, 正常弹出侧滑页
                    type = 'HighSeasContactDetail';
                }
                // 打开联系人详情页
                const tempObj = {
                    type,
                    visible: false,
                    id: contactId
                };
                this.drawer_list.push(tempObj);
                this.$nextTick(() => {
                    tempObj.visible = true;
                });
            },
            // 海关数据, 已废弃
            viewCustomsData() {
                const tempObj = {
                    type: 'customsData',
                    visible: false
                };
                this.drawer_list.push(tempObj);
                this.$nextTick(() => {
                    tempObj.visible = true;
                });
            },
            refreshData() {
                // this.$emit('refreshData');
            },
            refreshCheck(obj) {
                this.$emit('refreshCheck', obj);
            },
            closeAllDrawer(refresh) {
                this.$emit('update:id', 0);
                if (refresh) {
                    this.refreshData();
                }
            },
            change_flag_new_followUp() {
                this.flag_new_followUp = !this.flag_new_followUp;
            },
            // 切换 drawer 可视状态, 如果直接更改数组, 会导致关闭所有 drawer 后数组为空但仍存在不可点击的 drawer 的 DOM , 所以先调整 DOM 可视状态为 false , 再在 setTimeout 中更改数组, 时间间隔自己调, 以 console 不报错为准
            toggle_drawer(val, index) {
                if (this.type !== 'others') {
                    if (index === 'main') {
                        if (this.drawer_list.length) {
                            this.drawer_list.forEach(item => {
                                item.visible = false;
                            });
                            setTimeout(() => {
                                this.drawer_list = [];
                            }, 400);
                        }
                        if (!val) {
                            this.$emit('update:visible', false);
                            // this.from === 'fbMessage' ? this.$emit('update:visible_inquiry', false) : this.$emit('update:visible', false);
                        }
                        // 会导致Drawer弹出时闪烁
                        // this.bus.$emit('shrinkMenu', val);
                    } else {
                        if (!val) {
                            this.drawer_list[index].visible = false;
                            setTimeout(() => {
                                this.drawer_list.splice(index, 1);
                            }, 400);
                        }
                    }
                }
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
                        if (this.drawer_list.length && this.drawer_list.some(item => item.visible)) {
                            const temp = this.drawer_list.slice().reverse();
                            const index = this.drawer_list.length - 1 - temp.findIndex(item => item.visible);
                            this.drawer_list[index].visible = false;
                            setTimeout(() => {
                                this.drawer_list.splice(index, 1);
                            }, 400);
                        } else {
                            this.$emit('update:visible', false);
                            // this.from === 'fbMessage' ? this.$emit('update:visible_inquiry', false) : this.$emit('update:visible', false);
                        }
                    }
                }
            },
            visibleChange(val) {
                this.$store.commit('set_crm_drawer_show', val);
                this.toggle_drawer(val, 'main');
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
                if (this.drawer_list.length) {
                    this.drawer_list.forEach(item => {
                        item.visible = false;
                    });
                    setTimeout(() => {
                        this.drawer_list = [];
                    }, 400);
                }
            },
            flag_refresh_contact: {
                handler(val) {
                    if (this.originalType === 'inquiry') {
                        this.refreshData();
                    }
                }
            },
            /**
             * @Description: 客户侧滑页改为新窗口打开客户详情页
             * 此处监控 visible 是以为对邮件系统不太了解, 逐个注释 CRMDrawerList 相关代码比较麻烦, 于是在组建内部关闭侧滑页新窗口打开客户详情
             * @author 汤一飞
             * @date 2021/1/5
             */
            visible: {
                handler(val) {
                    if (val) {
                        if (['customer', 'highseasCustomer'].includes(this.type)) {
                            this.$emit('update:visible', false);
                            this.$viewCustomer(this.id);
                        }
                    }
                }
            }
        }
    };
</script>

<style lang="less">
    @import "~@/styles/common.less";
    @import "../Detail/Components/less/modal.less";
    @import "../Table/Components/less/tablePage.less";
    @import "../Detail/Components/less/detailPage.less";
</style>
