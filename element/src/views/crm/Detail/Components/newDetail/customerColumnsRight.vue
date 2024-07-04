<template>
    <div class="relatedInfo customer-columns-right">
        <!--&lt;!&ndash; loading &ndash;&gt;-->
        <!--<Spin fix v-if="loading"></Spin>-->

        <!-- 相关信息 -->
        <!--<div class="related-info-container">-->
        <!--    &lt;!&ndash; 负责人 &ndash;&gt;-->
        <!--    <div class="related-info-managers">-->
        <!--        <div class="related-info-managers-title">{{ $t('crm.Modal.managers') }}</div>-->
        <!--        <div class="related-info-managers-content">{{ managerNames }}</div>-->
        <!--    </div>-->
        <!--</div>-->

        <!-- 资料 Tab -->
        <div class="customer-tab-container">
            <Tabs v-model="current_compo"
                  class="customer-tab-tabs">
                <TabPane v-for="item in compo_list"
                         :key="item"
                         :name="item">
                    <div slot="label">
                        <span>{{ $t(`crm.Table.module_${item}`) }}</span>
                    </div>
                </TabPane>
            </Tabs>
            <div class="customer-columns-right-box">
                <!--<keep-alive v-if="!loading">-->
                <component :is="computed_current_compo"
                            v-if="!loading && type ==='customer'"
                            :type="type"
                            :id="companyId"
                            :companyId="companyId"
                            :isHighSeas="isHighSeas"
                            :columns_authorized="columns_authorized"
                            :contact_columns_authorized="contact_columns_authorized"
                            :singleCol="true"
                            :flag_update_contact_list="flag_update_contact_list"
                            :canEditCompany="authorized_button['editCompany']"
                            @editCompany="visible_edit_company = true"
                            class="companyInfo-compo"></component>
                <component v-if="type ==='inquiry'"
                            :is="current_compo"
                            :id="id"
                            :isHighSeas="isHighSeas"
                            :type="type"
                            :inquirySeqNumber="inquirySeqNumber"
                            :companyId="companyId"
                            :companyName="companyName"
                            class="related-tab-compo"></component>
                <!-- </keep-alive> -->
            </div>
        </div>
        <!-- 模态框部分 -->
        <!-- 编辑公司信息 -->
        <EditCompany :visible.sync="visible_edit_company"
                     :companyId="companyId"
                     :flag_update_detail.sync="flag_update_detail"
                     :corp_columns_authorized="columns_authorized"
                    ></EditCompany>


    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import DetailInfo from '@/views/crm/Detail/Components/Html/detailInfo';
    import ContactList from '@/views/crm/Detail/Components/newDetail/contactList';
    import EditCompany from '@/views/crm/Detail/Components/Modal/editCompany';
    import Task from './taskList';
    import Documents from './documentList';

    export default {
        name: 'customerColumnsRight',
        inheritAttrs: false,
        components: {
            DetailInfo,
            ContactList,
            Task,
            Documents,
            EditCompany
        },
        props: [
            'id',
            'isHighSeas',
            'inquirySeqNumber',
            'companyId',
            'companyName',
            'company_short_info',
            'columns_authorized',
            'inquiry_columns_authorized',
            'contact_columns_authorized',
            'flag_update_contact_list'
        ],
        computed: {
            // managerNames() {
            //     return Object.values(this.managerList).join(', ');
            // }
            ...mapState({
                userId: 'userId',
                button_list: state => state.app.button_list
            }),
            authorized_button() {
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
            type() {
                if (['Task', 'Documents'].indexOf(this.current_compo) > -1) {
                    return 'inquiry';
                } else {
                    return 'customer';
                }
            },
            computed_current_compo() {
                return this.current_compo;
            }
        },
        data() {
            return {
                /* 全局 */
                loading: false,
                /* 底部 Tabs */
                compo_list: [
                    'DetailInfo',
                    'ContactList',
                    'Task',
                    'Documents'
                ],
                current_compo: 'Task',
                /* 模态框部分 */
                visible_edit_company: false,
                // 模态框触发 flag 状态变更, 须作出相应刷新操作
                flag_update_detail: false
            };
        },
        methods: {
            // 刷新联系人资料
            refreshContactList() {
                this.$emit('update:flag_update_contact_list', !this.flag_update_contact_list);
            }
        },
        watch: {
            id: {
                handler(val) {
                    if (val) {
                        this.current_compo = this.compo_list[0];
                    }
                },
                immediate: true
            },
            companyId: {
                handler(val) {
                    if (val) {
                        this.loading = true;
                        this.$nextTick(() => {
                            this.loading = false;
                        });
                    }
                },
                immediate: true
            },
            flag_update_detail: {
                handler() {
                    this.loading = true;
                    this.$nextTick(() => {
                        this.loading = false;
                    });
                }
            }
        }
    };
</script>

<style lang="less">
    .relatedInfo {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .customer-columns-right{
        .customer-tab {

            &-container {
                padding-bottom: 16px;
                flex: 1;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                .customer-columns-right-box{
                    padding: 0 30px 0 24px;
                    overflow: auto;
                    overflow: overlay;
                }
            }

            &-tabs {
                margin:0;
                padding: 10px 30px 0 24px;
                .el-tabs__nav-wrap:after {
                    display: none;
                }

                .el-tabs__item {
                    padding: 0 10px;
                }
            }

            &-compo {
                flex: 1;
                overflow: auto;
            }
        }
    }

    .related-info {
        &-container {
            position: relative;

            .el-tabs__header{
                margin: 0;
            }
        }

        &-managers {
            &-title {
                font-size: 16px;
            }
        }
    }


</style>
<style scoped lang="less">
    .customer-columns-right-box{
        height: 100%;
        /deep/ .documentList{
            margin: 0 -30px 0 -24px;
        }
    }
</style>
