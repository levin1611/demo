<template>
    <div class="companyInfo" id="companyInfo-left"  v-resize="resize">
        <!-- 公司简略信息 -->
        <div class="company-info-container">
            <div class="customer-columns-left-col-lists">
                <div class="customer-columns-left-col-lists-head">
                    <div class="customer-columns-left-col-lists-head-title">
                        <TooltipAuto :content="computed_short_info.companyName"
                         class="company-info-item-companyName" style="width: 90%;display: inline-block;"></TooltipAuto>
                         <!-- 标记客户 -->
                         <Tooltip :content="$t('crm.newDetail.title_signCustomer')" placement="top">
                            <Button type="text"
                                    :disabled="isHighSeas"
                                    @click.stop="remarkFun"
                                    class="piwik_mark_customer company-info-custom-crm-mark">
                                    <Icon custom="custom-crm-mark"
                                        size="14"
                                        :color="active ? '#FBBC04' : '#8188a6'"></Icon>
                            </Button>
                        </Tooltip>
                    </div>
                </div>
                <div class="customer-columns-left-col-lists-body">
                    <div class="customer-columns-left-col-lists-body-content">
                        <span class="customer-columns-left-col-lists-body-content-title" :title="$t('crm.Modal.corp_shortName')">{{$t('crm.Modal.corp_shortName')}}：</span>
                        <span class="customer-columns-left-col-lists-body-content-text" :title="computed_short_info.shortName">{{ computed_short_info.shortName ? computed_short_info.shortName : '-'}}</span>
                    </div>
                    <div class="customer-columns-left-col-lists-body-content">
                        <span class="customer-columns-left-col-lists-body-content-title" :title="$t('crm.Modal.corp_clientType')">{{$t('crm.Modal.corp_clientType')}}：</span>
                        <span class="customer-columns-left-col-lists-body-content-cpClientType" v-if="computed_short_info.clientType" :title="computed_short_info.clientType">
                            {{ computed_short_info.clientType}}
                        </span>
                        <span class="customer-columns-left-col-lists-body-content-text" v-else>-</span>
                    </div>
                    <div class="customer-columns-left-col-lists-body-content">
                        <span class="customer-columns-left-col-lists-body-content-title" :title="$t('crm.Modal.corp_countryArea')">{{$t('crm.Modal.corp_countryArea')}}：</span>
                        <span class="customer-columns-left-col-lists-body-content-text" :title="computed_short_info.countryArea">{{ computed_short_info.countryArea ? computed_short_info.countryArea : '-'}}</span>
                    </div>
                    <!-- 负责人 -->
                    <div class="customer-columns-left-col-lists-body-content">
                        <span class="customer-columns-left-col-lists-body-content-title" :title="$t('crm.Table.col_companyManagers')">{{$t('crm.Table.col_companyManagers')}}：</span>
                        <span class="customer-columns-left-col-lists-body-content-text" :title="computed_short_info.companyManagers">{{ isHighSeas ? $t('clue.public_sea') : computed_short_info.companyManagers ? computed_short_info.companyManagers : '-'}}</span>
                    </div>
                </div>
                <div class="customer-columns-left-col-lists-head-btns">
                    <template v-if="isHighSeas">
                        <!-- 认领客户 -->
                        <Button v-if="authorized_button['claimCustomer']"
                                type="success"
                                size="small"
                                :loading="loading_claim"
                                @click.stop="getIsClaimInquiry(item)"
                                class="highSeas-claim-customer">{{$t('crm.Modal.title_claimCustomer')}}</Button>
                    </template>
                    <!-- 发送邮件 custom-customer-send-mail-->
                    <Button v-if="authorized_button['sendMail']"
                            :title="$t('crm.Modal.title_sendMail')"
                            type="success"
                            size="small"
                            @click.stop="sendMail"
                            class="piwik_companyDetail_sendMail">{{$t('crm.Detail.writeMail')}}</Button>
                    <!-- 新增询盘 custom-new-inquiry-->
                    <Button v-if="authorized_button['newInquiry']"
                            type="minor"
                            size="small"
                            @click.stop="visible_new_inquiry = true">{{$t('crm.Detail.addInquiryNew')}}</Button>
                    <!-- 转移客户custom-transfer-customer -->
                    <Button v-if="authorized_button['transferCompany'] && transferCompanyHide"
                            :title="$t('crm.Modal.title_transferCompany')"
                            size="small"
                            type="minor"
                            @click.stop="transferCompany">{{$t('crm.Modal.title_transferCompany')}}</Button>
                    <Poptip trigger="hover"
                            placement="bottom-end"
                            popper-class="moreOperateGroup companyInfo-more-operate-pop" style="margin-left:10px">
                           <!-- custom-more -->
                            <Button slot="reference" size="small" type="minor">{{$t('crm.Modal.more')}}</Button>
                        <div>
                            <ul class="_font_size12">
                                 <!-- 转移客户 -->
                                 <li v-if="authorized_button['transferCompany'] && !transferCompanyHide"
                                    @click.stop="transferCompany">{{$t('crm.Modal.title_transferCompany')}}</li>
                                <template v-if="!isHighSeas">
                                    <!-- 分享客户 -->
                                    <li v-if="authorized_button['shareCompany']"
                                        @click.stop="shareCompany">{{ $t('crm.Detail.shareCompany') }}</li>
                                    <!-- 扔入公海 -->
                                    <li v-if="authorized_button['throwCompany']"
                                        @click.stop="throwCompany">{{ $t('crm.Detail.throwCompany') }}</li>
                                    <!-- 取消跟进 -->
                                    <li v-if="isCurrentPerson" @click.stop="visible_cancel_follow=true">{{ $t('crm.Detail.unfollow') }}</li>
                                    <li v-else style="cursor:default;background-color:#ffffff;color:#B7B7B7;">{{ $t('crm.Detail.unfollow') }}</li>
                                </template>
                                <!-- 查看日志 -->
                                <li @click.stop="seeViewCompanyLog">{{ $t('crm.Detail.viewCompanyLog') }}</li>
                            </ul>
                        </div>
                    </Poptip>
                </div>
            </div>
              <!-- 名称 -->
        </div>

        <!-- 资料 Tab -->
        <div class="company-tab-container">
            <!-- Tab -->
            <Tabs v-model="current_compo">
                <TabPane v-for="item in compo_list"
                         :key="item.compo"
                         :name="item.compo">
                    <div slot="label">
                        <span>{{ item.lang }}</span>
                    </div>
                </TabPane>
            </Tabs>
            <!-- 组件 -->
            <keep-alive v-if="!loading">
                <component :is="computed_current_compo"
                           type="customer"
                           :id="companyId"
                           from="companyInfo"
                           :companyId="companyId"
                           :isHighSeas="isHighSeas"
                           :columns_authorized="corp_columns_authorized"
                           :contact_columns_authorized="contact_columns_authorized"
                           :singleCol="true"
                           :flag_update_contact_list="flag_update_contact_list"
                           :canEditCompany="authorized_button['editCompany']"
                           @editCompany="visible_edit_company = true"
                           class="companyInfo-compo"></component>
            </keep-alive>
            <!-- 公司资料 -->
            <!-- 联系人资料 -->
        </div>

        <!-- 模态框部分 -->
        <!-- 新增询盘 -->
        <NewInquiry :visible.sync="visible_new_inquiry"
                    :companyId="companyId"
                    :contact_columns_authorized="contact_columns_authorized"
                    :inquiry_columns_authorized="inquiry_columns_authorized"
                    :flag_update_inquiry.sync="flag_update_inquiry"
                    @refreshContact="refreshContactList"></NewInquiry>

        <!-- 编辑公司信息 -->
        <EditCompany :visible.sync="visible_edit_company"
                     :companyId="companyId"
                     :flag_update_detail.sync="flag_update_detail"
                     :corp_columns_authorized="corp_columns_authorized"
                     ></EditCompany>

        <!-- 分享客户 -->
        <ShareCompany :visible.sync="visible_share_company"
                      :id="companyId"
                      :managerIds="computed_short_info.companyManagerIds"
                      :managerNames="computed_short_info.companyManagers"
                      :flag_update_detail.sync="flag_update_detail"></ShareCompany>

        <!-- 转移客户 -->
        <TransferCompany :visible.sync="visible_transfer_company"
                         :id="companyId"
                         :managerIds="computed_short_info.companyManagerIds"
                         :managerNames="computed_short_info.companyManagers"
                         :flag_update_detail.sync="flag_update_detail"
                         @closeAllDrawer="jumpToCustomer"></TransferCompany>

        <!-- 退入公海 -->
        <ThrowCompany :visible.sync="visible_throw_company"
                      :id="companyId"
                      @closeAllDrawer="jumpToCustomer"></ThrowCompany>

        <!-- 发送邮件 -->
        <SendMail :visible.sync="visible_send_mail"
                  type="customer"
                  :id="companyId"
                  :companyName="computed_short_info.companyName"></SendMail>

        <!-- 取消跟进 -->
        <Modal
            :visible.sync="visible_cancel_follow"
            :title="$t('crm.Modal.title_unfollow')"
            :append-to-body="true"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            width="656px"
        >
            <div style="text-align:center">
                <div>
                    <p>{{ $t('crm.Modal.areyYouSureToCancelFollowUpOfselected') }} 1 {{ $t('crm.Modal.customers') }}</p>
                </div>
            </div>
            <div slot="footer">
                <Button @click="visible_cancel_follow = false">{{ $t('cancel') }}</Button>
                <Button type="primary" :disabled="unFollowBtn" @click="unFollow">{{ $t('confirm') }}</Button>
            </div>
        </Modal>

        <!-- 查看公司操作日志 -->
        <ViewCompanyLog :visible.sync="visible_view_company_log"
                        type="customer"
                        :companyId="companyId"></ViewCompanyLog>

        <!-- 认领客户 -->
        <ClaimCustomer :visible.sync="visible_claim_customer"
                       :id="companyId"
                       @claimSuccess="claimSuccess"></ClaimCustomer>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import DetailInfo from '@/views/crm/Detail/Components/Html/detailInfo';
    import ContactList from '@/views/crm/Detail/Components/newDetail/contactList';
    import EditCompany from '@/views/crm/Detail/Components/Modal/editCompany';
    import NewInquiry from '@/views/crm/Detail/Components/Modal/newInquiry';
    import ShareCompany from '@/views/crm/Detail/Components/Modal/shareCompany';
    import TransferCompany from '@/views/crm/Detail/Components/Modal/transferCompany';
    import ThrowCompany from '@/views/crm/Detail/Components/Modal/throwCompany';
    import SendMail from '@/views/crm/Detail/Components/Modal/sendMail';
    import ViewCompanyLog from '@/views/crm/Detail/Components/Modal/viewCompanyLog';
    import ClaimCustomer from '@/views/crm/Detail/Components/Modal/claimCustomer';
    import { crmCompany } from '@/api/crm/index';

    export default {
        name: 'companyInfo',
        components: {
            DetailInfo,
            ContactList,
            EditCompany,
            NewInquiry,
            ShareCompany,
            TransferCompany,
            ThrowCompany,
            SendMail,
            ViewCompanyLog,
            ClaimCustomer
        },
        props: [
            'companyId',
            'isHighSeas',
            'company_short_info',
            'corp_columns_authorized',
            'inquiry_columns_authorized',
            'contact_columns_authorized',
            'flag_update_inquiry_list',
            'flag_update_inquiry_detail',
            'flag_update_contact_list'
        ],
        computed: {
            ...mapState({
                userId: 'userId',
                enterpriseId: 'enterpriseId',
                fullName: 'fullName',
                button_list: state => state.app.button_list,
                lang: state => state.app.lang,
                window_width: state => state.window_width
            }),
            // 判断当前的负责人是否为登陆的账号
            isCurrentPerson() {
                // 先判断this.shortInfo中是否有companyManagerIds字段
                return this.shortInfo.companyManagerIds ? this.shortInfo.companyManagerIds.includes(this.userId) : false;
            },
            authorized_button() {
                // 先判断是否是公海页面
                if (this.isHighSeas) {
                    const ids = BUTTON_IDS.CRM.highSeas;
                    return {
                        claimCustomer: !HANDLE_BUTTON(ids.edit.claimCustomer, this.button_list)
                    };
                }

                const ids = BUTTON_IDS.CRM.customer;
                return {
                    editCompany: !HANDLE_BUTTON(ids.edit.editCustomer, this.button_list),
                    newInquiry: !HANDLE_BUTTON(ids.edit.newInquiry, this.button_list),
                    sendMail: !HANDLE_BUTTON(ids.edit.sendMail, this.button_list),
                    shareCompany: !HANDLE_BUTTON(ids.edit.share, this.button_list),
                    transferCompany: !HANDLE_BUTTON(ids.edit.transfer, this.button_list),
                    throwCompany: !HANDLE_BUTTON(ids.edit.throw, this.button_list)
                };
            },

            computed_current_compo() {
                let result = '';
                switch (this.current_compo) {
                    case 'companyDetail':
                        result = 'DetailInfo';
                        break;
                    case 'contactDetail':
                        result = 'ContactList';
                        break;
                }
                return result;
            },
            computed_short_info() {
                const result = this.$deepClone(this.shortInfo);
                // 屏蔽未授权字段
                if (this.corp_columns_authorized && Array.isArray(this.corp_columns_authorized.default)) {
                    const defaultFields = this.corp_columns_authorized.default;

                    // 无"公司名称"字段, 屏蔽公司名为 ****
                    const temp = defaultFields.find(item => item.storageName === 'companyName');
                    if (!temp || temp.manually) {
                        result.companyName = '****';
                    }
                    // 无"客户类型"字段, 删除客户类型属性
                    if (!defaultFields.find(item => item.storageName === 'clientType')) {
                        delete result.clientType;
                    }
                } else {
                    result.companyName = '****';
                    delete result.clientType;
                }

                // 更新外部数据
                this.$emit('update:company_short_info', result);

                return result;
            }
        },
        // directives: { // 使用局部注册指令的方式
        //     resize: { // 指令的名称
        //         bind(el, binding) { // el为绑定的元素，binding为绑定给指令的对象
        //             // el为绑定的元素，binding为绑定给指令的对象
        //             console.log(el, '绑定', binding);
        //             let width = ''; let height = '';

        //             function isReize() {
        //                 const style = document.defaultView.getComputedStyle(el);
        //                 if (width !== style.width || height !== style.height) {
        //                     // 关键(这传入的是函数,所以执行此函数)
        //                     binding.value({ width: style.width, height: style.height });
        //                 }
        //                 width = style.width;
        //                 height = style.height;
        //             }

        //             el.__vueSetInterval__ = setInterval(isReize, 300);
        //         },
        //         unbind(el) {
        //             clearInterval(el.__vueSetInterval__);
        //         }
        //     }
        // },
        data() {
            return {
                // loading
                loading: true,
                loading_claim: false,
                /* 公司信息 */
                shortInfo: {},
                active: false, // 标识当前公司是否被标记
                /* 资料 Tabs */
                compo_list: [
                    {
                        compo: 'companyDetail',
                        lang: this.$t('crm.Modal.title_company')
                    },
                    {
                        compo: 'contactDetail',
                        lang: this.$t('crm.Modal.title_contact')
                    }
                ],
                current_compo: '',

                /* 模态框部分 */
                visible_view_company_log: false,
                visible_new_inquiry: false,
                visible_edit_company: false,
                visible_share_company: false,
                visible_transfer_company: false,
                visible_throw_company: false,
                visible_cancel_follow: false, // 取消跟进
                visible_send_mail: false,
                visible_claim_customer: false,

                // 模态框触发 flag 状态变更, 须作出相应刷新操作
                flag_update_detail: false,
                flag_update_inquiry: false,

                // 当前的操作人姓名
                // userNameCh: '',
                // 请求数据时禁止'取消跟进'的确定按钮可以一直点
                unFollowBtn: false,
                transferCompanyHide: false
            };
        },
        methods: {
            // 取消跟进
            async unFollow() {
                this.unFollowBtn = true;
                // 请求当前的操作人姓名
                // await this.$commonApi.checkUserInfoExists({
                //     orgId: this.enterpriseId,
                //     userId: this.userId
                // }).then(response => {
                //     if (response.code === '1') {
                //         // 保存当前操作人的姓名
                //         this.userNameCh = response.data.userNameCh;
                //     }
                // });
                // 1 向后端发送请求;2 提示信息;3 重新请求数据;
                crmCompany.batchCancelFollowup({
                    companyIds: this.companyId,
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    userName: this.fullName
                }).then(response => {
                    // 取消modal的显示
                    this.visible_cancel_follow = false;
                    // 禁用按钮恢复
                    this.unFollowBtn = false;

                    if (response.code === '1') {
                        // 提示信息
                        this.$Message.success(`${this.$t('crm.Modal.successfullyUnfollow')} 1 ${this.$t('crm.Modal.customer')}`);
                        // 重新请求管理权限和是否公海
                        this.$emit('claimSuccess');
                    } else {
                        this.$Message.error(response.message);
                    };
                }).catch(error => {
                    console.error(error);
                    this.unFollowBtn = false;
                });
            },
            // 获取客户简略信息
            get_short_info() {
                this.loading = true;
                crmCompany.getSimpleCompany({
                    companyId: this.companyId,
                    lang: this.lang
                }).then(response => {
                    if (response.code === '1') {
                        this.shortInfo = response.data;
                        this.shortInfo.clientId = response.data.id;
                        this.active = response.data.marker === 1;
                    } else {
                        this.$Message.error(this.$t('crm.newDetail.error_getCompanyBriefInfo'));
                    }
                    this.loading = false;
                }).catch(error => {
                    this.$Message.error(this.$t('crm.newDetail.error_getCompanyBriefInfo'));
                    this.loading = false;
                });
            },
            /* 按钮操作 */
            // 标记
            remarkFun() {
                let flag = 1;
                if (this.active) {
                    flag = 2;
                }
                crmCompany.addMarker({
                    id: this.companyId,
                    marker: flag
                }).then(response => {
                    if (response.code === '1') {
                        this.active = !this.active;
                        if (this.active) {
                            this.$Message.success(this.$t('crm.Detail.success_addMarker'));
                        } else {
                            this.$Message.success(this.$t('crm.Detail.success_removeMarker'));
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Detail.error_addMarker'));
                    }
                });
            },
            // 分享
            shareCompany() {
                this.visible_share_company = true;
            },
            // 转移
            transferCompany() {
                this.visible_transfer_company = true;
            },
            // 退入公海
            throwCompany() {
                this.visible_throw_company = true;
            },
            // 发送邮件
            sendMail() {
                this.visible_send_mail = true;
            },
            // 点击认领, 先获取当前用户是否有可接询盘权限, 再决定是否弹出认领确认框
            getIsClaimInquiry() {
                this.loading_claim = true;
                this.$commonApi.getUserPrivilege({
                    id: this.userId
                }).then(response => {
                    this.loading_claim = false;
                    if (response.code === '1') {
                        if (response.data && response.data.canGetInquiry === 1) {
                            this.visible_claim_customer = true;
                        } else {
                            this.$Message.warning(this.$t('crm.newDetail.haveNoAuthorityClaim'));
                        }
                    }
                }).catch(e => {
                    this.loading_claim = false;
                    this.$Message.warning(this.$t('crm.newDetail.haveNoAuthorityClaim'));
                });
            },
            // 认领成功, 触发外部页面重新请求当前详情页
            claimSuccess() {
                this.$emit('claimSuccess');
            },

            /* 模态框触发相关操作 */
            // 跳回到客户表格页
            jumpToCustomer() {
                this.$router.replace({ name: 'myCustomer' });
            },
            // 刷新联系人资料
            refreshContactList() {
                this.$emit('update:flag_update_contact_list', !this.flag_update_contact_list);
            },
            seeViewCompanyLog() {
                this.visible_view_company_log = true;
            },
            resize({ width, height }) {
                console.log('handleResize');
                if (document.getElementById('companyInfo-left') && document.getElementById('companyInfo-left').offsetWidth >= 275) {
                    this.transferCompanyHide = true;
                } else {
                    this.transferCompanyHide = false;
                }
            }
        },
        watch: {
            companyId: {
                handler(val) {
                    if (val) {
                        this.get_short_info();
                        // this.getCompanyById();
                        this.current_compo = this.compo_list[0].compo;
                    }
                },
                immediate: true
            },
            flag_update_inquiry: {
                handler(val) {
                    this.$emit('update:flag_update_inquiry_list', val);
                }
            },
            flag_update_detail: {
                handler(val) {
                    this.get_short_info();
                    this.$emit('update:flag_update_inquiry_detail', val);
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .companyInfo {
        height: 100%;
        display: flex;
        flex-direction: column;
        border-radius: 8px 8px 0px 0px;
    }

    .company-info-custom-crm-mark {
        float: right;
        top:6px;
        position: relative;
    }

    .company-info {
        &-container {
        }

        &-operate {
            text-align: right;
            line-height: 20px;
            flex: 1;
            white-space: nowrap;

            /deep/ .el-button {
                margin-left: 10px;
                vertical-align: text-bottom;
            }
        }

        &-operate-btns {
            margin: 16px 0 18px;

            /deep/ .el-button {
                border: none;
                background: #E6EDF5;
                height: auto;
                padding: 8px;
                color: #7B98B6;
                vertical-align: text-top;
                i {
                    font-size: 14px;
                }
            }
        }

        &-item {
            &-clientType {
                border: .5px solid #FF6A00;
                border-radius: 10px;
                color: #ff6a00;
                height: 20px;
                line-height: 20px;
                background-color: transparent;

                padding: 0 10px;
                font-size: 12px;
                box-sizing: border-box;
                white-space: nowrap;
            }

            &-companyName {
                font-size: 18px;
                color: rgba(0,0,0,0.80);
                // line-height: 30px;
                // margin: 24px 0 8px;
                font-weight: 500;
            }

            &-managers {
                font-size: 12px;
                line-height: 18px;
                color: rgba(0,0,0,0.80);
            }
        }
    }

    .company-tab {
        &-container {
            flex: 1;
            overflow: hidden;

            /deep/ .el-tabs__nav-wrap:after {
                display: none;
            }
            /deep/ .el-tabs__header {
                margin-bottom: 0;
            }
            /deep/ .el-tabs__item {
                padding: 0 10px;
                font-size: 15px;
            }

            .companyInfo-compo {
                max-height: calc(100% - 55px);
                overflow: auto;

                &::-webkit-scrollbar {
                    display: none;
                }
            }
        }
    }
     //列表样式
        .customer-columns-left-col-lists{
            // padding: 12px 5px 12px 30px;
            padding-bottom: 12px;
            white-space: nowrap;
            .customer-columns-left-col-lists-head{
                display: flex;
                flex-direction:row;
                flex-wrap:nowrap;
                align-items: center;
                line-height: 24px;
                font-size: 14px;
                color: rgba(0,0,0,0.80);
                padding-bottom: 8px;
                .customer-columns-left-col-lists-head-checkbox{
                   margin-right: 8px;
                }
                .customer-columns-left-col-lists-head-title{
                    width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
            }
            .customer-columns-left-col-lists-head-btns{
                margin-top: 16px;
                button{
                    color: #333;
                    // border: 1px solid #677F99;
                    padding: 0px 10px;
                    font-size: 12px;
                    line-height: 22px;
                    height: 28px;
                    /deep/ .custom{
                        font-size: 14px;
                    }
                    /deep/ &.el-button--success{
                        color: #fff
                    }
                    &:hover{
                        // color: #fff;
                        // background: #7B98B6;
                        // border: 1px solid #7B98B6;
                    }
                }
            }
            .customer-columns-left-col-lists-body{
                width: 100%;
                overflow: hidden;
                .customer-columns-left-col-lists-body-content{
                    float: left;
                    width: 50%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    font-size: 12px;
                    line-height: 18px;
                    margin-bottom: 4px;
                    span{
                        display: inline-block;
                        max-width: 50%;
                        vertical-align: middle;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .customer-columns-left-col-lists-body-content-title{
                        color: rgba(0,0,0,.6);
                    }
                    .customer-columns-left-col-lists-body-content-text{
                        color: rgba(0,0,0,.8);
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        font-size: 14px;
                    }
                    .customer-columns-left-col-lists-body-content-cpClientType{
                        padding:0 8px;
                        border: #FFC6A7 solid 1px;
                        font-size:11px;
                        font-style: normal;
                        width: 50%;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        border-radius: 10px;
                        color: #ff752a;
                        text-align: center;
                    }
                }
            }
        }
</style>

<style lang="less">
    .companyInfo-more-operate-pop {
        min-width: 120px;
    }
</style>
