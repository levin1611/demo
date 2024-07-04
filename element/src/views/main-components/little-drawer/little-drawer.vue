<template>
    <div>
        <Drawer :visible="visible"
                :size="(wrapWith ||'500px')"
                :modal="false"
                :append-to-body="!['whatsApp', 'microenterprise', 'Sms'].includes(from)"
                :with-header="false"
                :direction="direction"
                ref="topDrawer"
                :style="styleDrawer"
                class="drawer-show-main-header drawer-close-button-moveUp"
                :class="{
                'whatsLittleDrew':['whatsApp', 'Sms'].includes(from),
                'microenterpriseLittleDrew': from=='microenterprise',
                'globale_sms_callingDrawer': from=='global_sms_calling'
                }">
            <!-- 自定义头部内容 -->
            <div class="drawer_header">
                <!-- 钉住 -->
                <span v-if="['mail', 'mail_detail', ].includes(from)">
                    <Icon custom="custom custom-float-window" class="mail_pin_up" v-if="!isCrmDetailFixed" @click.native="handleFixed(true)" size="16" />
                    <Icon custom="custom custom-fixed-window" class="mail_pin_up" v-else @click.native="handleFixed(false)" size="16" />
                </span>

                <svg v-if="(from=='global_sms_calling')" class="svg-icon custom menu-switch" @click.stop="visibleChange(false)" aria-hidden="true">
                                                        <use xlink:href="#custom-shouqi"></use>
                    </svg>
                <!-- 自定义关闭按钮 -->
                <a v-if="!['whatsApp'].includes(from)" @click="visibleChange(false)"
                    class="drawer-close-button">
                    <Icon custom="custom-drawer-detail-close"></Icon>
                </a>
            </div>
            <!-- 第一层 Drawer -->
            <div style="height: calc(100% - 30px); overflow-y: auto; margin-top: 30px;">
                <detailWrap :selectedChatInfo="selectedChatInfo" :from="from" @emitFreshLeadsCLoudsStatus="emitFreshLeadsCLoudsStatus"></detailWrap>
                <!-- <template v-if="type === 'customer'">
                    <CustomerDetail
                        ref="crmDetail"
                        :type="type"
                        :from="from"
                        :originalType="type"
                        :topId="id"
                        :companyId="id"
                        @viewInquiry="viewInquiry"
                        @viewContact="viewContact"
                        :companyName.sync="companyName"
                        :currAccountInfo="currAccountInfo"
                        @refreshCheck="refreshCheck"
                        @closeAllDrawer="closeAllDrawer"
                        :disabled="disabled"
                        :flag_refresh_contact.sync="flag_refresh_contact"
                        :flag_new_followUp="flag_new_followUp"
                        @change_flag_new_followUp="change_flag_new_followUp"
                        :corp_columns_authorized="corp_columns_authorized"
                        :contact_columns_authorized="contact_columns_authorized"
                        :inquiry_columns_authorized="inquiry_columns_authorized">
                    </CustomerDetail>
                </template>
                <template v-else-if="type === 'journeyDetail'">
                    <journeyDetail
                            ref="journeyDetail"
                            :from="from"
                            :type="type"
                            :originalType="'journeyDetail'"
                            :uniqueId="id"
                            :currAccountInfo="currAccountInfo"
                            :fbCommentDetail="fbCommentDetail"
                            @viewCompany="viewCompany"
                            @viewContact="viewContact"
                            @refreshCheck="refreshCheck"
                            @closeAllDrawer="closeAllDrawer"
                            @handleClick="handleClick"
                            :disabled="disabled"
                            :flag_refresh_contact.sync="flag_refresh_contact"
                            :flag_new_followUp="flag_new_followUp"
                            @change_flag_new_followUp="change_flag_new_followUp"
                            :contact_columns_authorized="contact_columns_authorized"
                            :inquiry_columns_authorized="inquiry_columns_authorized"
                            @updateStatus="updateStatus"
                        >
                    </journeyDetail>
                </template>
                <template v-else-if="type === 'highseasCustomer'">
                    <HighSeasCustomerDetail
                            ref="crmDetail"
                            :type="type"
                            :from="from"
                            :originalType="type"
                            :topId="id"
                            :companyId="id"
                            :currAccountInfo="currAccountInfo"
                            @viewInquiry="viewInquiry"
                            @viewContact="viewContact"
                            :companyName.sync="companyName"
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
                <template  v-else-if="type === 'clue'">
                    <ClueDetail
                        :showClueStatus="''"
                        :clueId="id"
                        listType="3"
                        :from="from"
                        :originalType="type"
                        :disabled="disabled"
                        :currAccountInfo="currAccountInfo"
                        @updateInquiryStatusWaEmbedded="$emit('updateInquiryStatusWaEmbedded', 1)"
                        @closeDetail="$emit('update:visible', false)"
                        @refreshData="$emit('refreshData')"
                        @chownSuccess="$emit('chownSuccess')">
                    </ClueDetail>
                </template>
                <template v-else-if="type === 'highseasClue'">
                    <HighseasClueDetail
                        :clueId="id"
                        :from="from"
                        :originalType="type"
                        :disabled="disabled"
                        :currAccountInfo="currAccountInfo"
                        @closeDetail="$emit('update:visible', false)"
                        @refreshData="$emit('refreshData')"
                        @chownSuccess="$emit('chownSuccess')">
                    </HighseasClueDetail>
                </template> -->
            </div>
        </Drawer>
    </div>
</template>

<script>
    // import CustomerDetail from '@/views/crm/Detail/customerDetail';
    // import journeyDetail from './components/journeyDetail';
    // import HighSeasCustomerDetail from '@/views/crm/Detail/highSeasCustomerDetail';
    // import ClueDetail from '@/views/clue-manage/Detail/clueDetail';
    // import HighseasClueDetail from '@/views/clue-manage/Detail/highseasClueDetail';
    import detailWrap from '@/views/main-components/detailWrap/index';
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'littleDrawer',
        components: {
            detailWrap
            // CustomerDetail,
            // journeyDetail,
            // HighSeasCustomerDetail,
            // ClueDetail,
            // HighseasClueDetail
        },
        props: [
            'visible',
            'currAccountInfo', // 传过来的选中当前人的对象，包含当前人的id和其它信息
            'id', // 选中当前人的id,通过uniqueId传递给子组件
            'type', // journeyDetail 使用 旅程组件
            'originalType', //
            'from', // 记录从哪个组件调用
            'corp_columns_authorized', // 客户表单数据
            'contact_columns_authorized', // 联系人表单数据
            'inquiry_columns_authorized', // 询盘表单数据
            'disabled',
            'fbCommentDetail', // fb 评论详情 录入线索后跟新状态用
            'wrapWith',
            'styleDrawer'
        ],
        computed: {
            ...mapState({
                userId: 'userId',
                enterpriseId: 'enterpriseId',
                button_list: state => state.app.button_list,
                isCrmDetailFixed: 'isCrmDetailFixed'
            }), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            direction() {
                if (this.from == 'global_sms_calling') {
                    return 'btt';
                }
                return 'rtl'
            }
        },
        data() {
            return {
                /* 海关数据, 公司名称 */
                companyName: '',
                selectedChatInfo: null,
                /* 各种 flag , 控制详情页刷新 */
                flag_new_followUp: true, // 控制新增跟进记录后刷新所有详情页 drawer 时间轴数据
                flag_refresh_contact: true // 新建编辑联系人后, 公司/询盘详情页联系人列表刷新
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
                }

                // 新窗口打开询盘详情页
                localStorage.setItem('leadsCloud-inquiryId', inquiryId);
                window.open(this.$rootRouter.resolve({
                    name: 'myInquiry'
                }).href, '_blank');
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
            refreshData() {
                // this.$emit('refreshData');
            },
            refreshCheck(obj) {
                this.$emit('refreshCheck', obj);
                //  如果是whatsApp頁面過來的就emit用來更新聊天頁面按鈕狀態
                if (['whatsApp', 'microenterprise', 'Sms'].includes(this.from)) {
                    this.$emit('chownSuccess', obj);
                }
            },
            closeAllDrawer(refresh) {
                this.$emit('update:id', 0);
                if (refresh) {
                    this.visibleChange(false);
                }
            },
            change_flag_new_followUp() {
                this.flag_new_followUp = !this.flag_new_followUp;
            },
            visibleChange(val) {
                this.$emit('littleDrawerHidden', val);
                this.$store.commit('setIsCrmDetailFixed', false);
            },
            updateStatus(clueId, status) {
                // Fb私信访客状态修改
                if (this.from === 'fb_chat') {
                    if (status === 1 || status === 2 || status === 102) {
                        this.$emit('updateConversationStatus', status);
                    } else {
                        this.$emit('updateConversationClueStatus', status);
                    }
                    if (clueId) {
                        this.$emit('updateClueId', clueId);
                    }
                } else if (this.from === 'fb_comment') { // Fb评论访客状态修改
                    if (status === 1 || status === 2 || status === 102) {
                        this.$emit('updateCommentStatus', status);
                    } else {
                        this.$emit('updateCommentClueStatus', status);
                    }
                    if (clueId) {
                        this.$emit('updateClueId', clueId);
                    }
                } else if (['mail', 'mail_detail'].includes(this.from)) { // 邮件访客状态修改
                    if ([4, 5, 6].includes(status)) {
                        this.$emit('updateStatus', clueId, status);
                    } else {
                        this.$emit('updateInquiryStatus', clueId, status);
                    }
                } else if (this.from === 'whatsApp') { // whatsApp访客状态修改
                    if (status === 1) {
                        this.$emit('updateWAAccountCrmStatus', clueId, 'createCompany');
                    } else {
                        this.$emit('updateCommentClueStatus', clueId, 'createClue');
                    }
                }
            },
            emitFreshLeadsCLoudsStatus(data) {
                this.$emit('emitFreshLeadsCLoudsStatus', data);
            },
            // 钉住
            handleFixed(flag) {
                localStorage.setItem('isCrmDetailFixed', flag);
                this.$store.commit('setIsCrmDetailFixed', flag);
            },
            // journeyDetail中新加的按钮操作写信、创建收发信规则
            handleClick(params) {
                this.$emit('handleClick', params);
            },
            mappingStatus(type) {
                switch (type) {
                    case 0:
                        return 1;
                    case 1:
                        return 8;
                    case 2:
                        return 7;
                    case 3:
                        return 9;
                    case 4:
                        return 3;
                    case 5:
                        return 2;
                    case 6:
                        return 4;
                    case 7:
                        return 1;
                    case 8:
                        return 1;
                    case 9:
                        return 5;
                    case 10:
                        return 6;
                    default:
                        return 1;
                }
            }
        },
        beforeDestroy() {
            this.$store.commit('setIsCrmDetailFixed', false);
        },
        watch: {
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
                        if (['mail', 'mail_detail'].includes(this.from)) {
                            this.currAccountInfo.status = this.mappingStatus(this.currAccountInfo.type);
                        }
                        this.selectedChatInfo = {
                            crmInfo: this.currAccountInfo
                        };
                        const flag = JSON.parse(localStorage.getItem('isCrmDetailFixed')) || false;
                        this.$store.commit('setIsCrmDetailFixed', flag);
                    }
                },
                immediate: true
            }
        }
    };
</script>
<style lang="less" scoped>
    .drawer_header{
        height: 30px;
        // background: #fff;
        position: absolute;
        top: 0;
        width: 100%;
        z-index: 9;
    }
    .mail_pin_up{
        position: absolute;
        top: 8px;
        right: 46px;
    }
    .model-btns{
        height: 34px;
    }
    .menu-switch{
        font-size: 40px;
        transform:rotateZ(270deg) translateX(16px) translateY(-50%);
        position: absolute;
        left: 50%;
        cursor: pointer;
    }
</style>
<style lang="less">
.whatsLittleDrew{
    position: absolute !important;
        animation: none;
    .el-drawer__open .el-drawer.rtl{
        animation: none;
        top: 0;
        height: 100%;
    }
    .el-drawer{
        box-shadow: none;
    }
}
.microenterpriseLittleDrew {
        animation: none;
    .el-drawer__open .el-drawer.rtl {
        animation: none;
        top: 170px;
        height: calc(100% - 170px);
    }
    .el-drawer {
        box-shadow: none;
    }
}
.globale_sms_callingDrawer{
    // width: 410px;
    // top: 0px;
    // left: unset;
    // right: 0;
    .el-drawer.btt{
        width: 410px;
        height: 100% !important;
        top: 0px;
    left: unset;
    right: 0;
    }
}
</style>
