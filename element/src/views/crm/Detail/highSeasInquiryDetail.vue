<template>
    <div class="crm-detail-page">
        <div v-loading="loading">
            <!-- 询盘详情 -->
            <div class="companyWrap" style="padding:20px 20px 16px;">
                <div class="company">
                    <div class="com_top">
                        <div class="com_name">
                            <Icon custom="custom-inquiry" size="36"
                                  style="float: left;margin-right: 10px"></Icon>
                            <Tooltip placement="bottom-start" :content="inquiry_short_info.seqNumber">
                                <span class="com_name_short">{{ inquiry_short_info.seqNumber || '' }}</span>
                            </Tooltip>
                        </div>
                        <div v-if="!disabled"
                             class="com_operate">
                            <!-- 查看询盘日志 -->
                            <Button type="text"
                                    icon="custom custom-crm-log"
                                    @click="viewInquiryLog"> {{ $t('crm.Detail.viewInquiryLog') }}</Button>
                        </div>
                    </div>
                </div>
                <Row type="flex" justify="space-between">
                    <Col v-for="item in authorized_short_info_items" :key="item" :span="4">
                        <p class="col_name">{{ $t(`crm.newDetail.col_${item}`) }}</p>
                        <template v-if="item === 'companyName'">
                            <p class="col_value company-name"
                                @click="inquiry_short_info.companyId ? $listeners.viewCompany(inquiry_short_info.companyId) : $Message($t('crm.Table.error_companyId'))"
                            >{{ inquiry_short_info[item] }}</p>
                        </template>
                        <template v-else-if="item === 'productCategory'">
                            <p class="col_value">{{ $options.filters.parseArray(inquiry_short_info[item]).length ?
                                $options.filters.parseArray(inquiry_short_info[item]).join(', ') :
                                inquiry_short_info[item] }}</p>
                        </template>
                        <template v-else>
                            <p class="col_value">{{ inquiry_short_info[item] }}</p>
                        </template>
                    </Col>
                </Row>
                <FollowUpStatus
                        v-if="show_edit_followup_status"
                        :flag_update_detail.sync="flag_update_detail"
                        :inquiry_detail.sync="inquiry_short_info"
                        :disabled="true"
                        @refreshCheck="refreshCheck"></FollowUpStatus>
            </div>
            <div class="hr-block"></div>
            <div class="component-wrap">
                <Tabs v-model="current_compo">
                    <TabPane v-for="item in compo_list"
                             :key="item" :name="item">
                        <div slot="label" v-if="item === 'FollowUp'">
                            <span style="margin-right: 5px;">{{$t(`crm.newDetail.module_${item}`)}}</span>
                            <HelpTip :title="$t('helpTip.followUp')"></HelpTip>
                        </div>
                        <div slot="label" v-else>
                            <span>{{$t(`crm.newDetail.module_${item}`)}}</span>
                        </div>
                    </TabPane>
                </Tabs>
                <!-- <keep-alive v-if="!loading"> -->
                    <!-- 组件传递参数说明: -->
                    <!-- type: 客户/公海管理/询盘/联系人  -->
                    <!-- id: 以上 type 的 id -->
                    <!-- columns_authorized: 以上 type 的权限字段 -->
                    <!-- visitorId: 用于请求访问型跟进记录 -->
                    <!-- flag_update_contact: 新增/更新联系人时, 需刷新联系人列表 -->
                    <!-- flag_update_detail: 更新当前正在查看的 公司/询盘/联系人 时, 需刷新详情列表 -->
                    <!-- flag_update_inquiry: 新增/更新/转移 询盘后, 需刷新询盘列表 -->
                    <component :is="current_compo"
                               :ref="current_compo === 'FollowUp' ? 'followUp' : ''"
                               :type="'inquiry'"
                               :originalType="originalType"
                               :disabled="true"
                               :id="inquiryId"
                               :inquiryId="inquiryId"
                               :inquirySeqNumber="inquiry_short_info.seqNumber"
                               :companyId="inquiry_short_info.companyId"
                               :companyName="inquiry_short_info.companyName"
                               :inquiryManagers="inquiry_short_info.userIdsShow"
                               :inquiryManagerNames="inquiry_short_info.userNamesShow"
                               :followUpId="inquiry_short_info.followUpId"
                               :columns_authorized="inquiry_columns_authorized"
                               :contact_columns_authorized="contact_columns_authorized"
                               :inquiry_columns_authorized="inquiry_columns_authorized"
                               :visitorId="inquiry_short_info.visitorId"
                               :flag_update_contact.sync="flag_update_contact"
                               :flag_update_detail.sync="flag_update_detail"
                               :flag_update_task.sync="flag_update_task"
                               :flag_new_followUp="flag_new_followUp"
                               :flag_refresh_contact="flag_refresh_contact"
                               @refreshContact="$emit('update:flag_refresh_contact', !flag_refresh_contact)"
                               v-on="$listeners"
                               @refreshCheck="refreshCheck">
                    </component>
                <!-- </keep-alive> -->
            </div>

            <!-- 模态框部分 -->
            <!-- 查看询盘操作日志 -->
            <ViewInquiryLog :visible.sync="visible_view_inquiry_log"
                            :inquiryId="inquiryId"></ViewInquiryLog>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import ViewInquiryLog from '@/views/crm/Detail/Components/Modal/viewInquiryLog';
    import FollowUpStatus from '@/views/crm/Detail/Components/Html/followUpStatus';
    import Documents from '@/views/crm/Detail/Components/Html/relatedDocuments';
    import Task from '@/views/crm/Detail/Components/Html/schedule';
    import FollowUp from '@/views/crm/Detail/Components/Html/followUp';
    import DetailInfo from '@/views/crm/Detail/Components/Html/detailInfo';
    import ContactList from '@/views/crm/Detail/Components/Html/contactList';
    import { crmInquiry } from '@/api/crm/index';

    export default {
        name: 'highSeasInquiryDetail',
        components: {
            ViewInquiryLog,
            FollowUpStatus,
            Documents,
            Task,
            FollowUp,
            DetailInfo,
            ContactList
        },
        props: [
            'type',
            'originalType',
            'inquiryId',
            'contact_columns_authorized',
            'inquiry_columns_authorized',
            'disabled',
            'flag_new_followUp',
            'flag_refresh_contact'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                button_list: state => state.app.button_list
            }), // 从 vuex 中获取属性
            show_edit_followup_status() {
                return Array.isArray(this.inquiry_columns_authorized.default) && this.inquiry_columns_authorized.default.find(item => item.storageName === 'followUp');
            },
            /* 联系人自定义字段 */
            contact_custom_field() {
                if (this.contact_columns_authorized.custom) {
                    return this.contact_columns_authorized.custom.filter((item, i) => {
                        return item.isShow === 1;
                    });
                }
                return [];
            },
            /* 询盘自定义字段 */
            inquiry_custom_field() {
                if (this.inquiry_columns_authorized.custom) {
                    return this.inquiry_columns_authorized.custom.filter((item, i) => {
                        return item.isShow === 1;
                    });
                }
                return [];
            },
            authorized_short_info_items() {
                const default_cols = ['companyName', 'inquiryManagers'];
                const authorized_cols = Array.isArray(this.inquiry_columns_authorized.default) ? this.inquiry_columns_authorized.default.filter(item => !item.manually).map(item => item.storageName).concat(default_cols) : default_cols;
                return this.short_info_items.filter(item => authorized_cols.includes(item));
            }
        },
        data() {
            return {
                loading: true,

                /* 全局 */
                inquiry_short_info: {}, // 询盘详情
                short_info_items: [
                    'companyName',
                    'productCategory',
                    'grouping',
                    'inquiryScore',
                    'inquiryManagers'
                ],

                /* 询盘列表动态组件部分 */
                flag_update_contact: false,
                flag_update_detail: false,
                flag_update_task: false,
                compo_list: [
                    'FollowUp',
                    'DetailInfo',
                    'ContactList',
                    'Task',
                    'Documents'
                    // 'InquiryProduct'
                ],
                current_compo: '',

                /* 模态框部分 */
                visible_view_inquiry_log: false
            };
        },
        methods: {
            /* 全局 */
            get_inquiry_short_info() {
                this.loading = true;
                const data = {
                    id: this.inquiryId
                };
                crmInquiry.getSimpleInquiry(data).then(response => {
                    if (response.code === '1') {
                        this.inquiry_short_info = response.data;
                        this.inquiry_short_info.inquiryManagers = response.data.userNamesShow;
                    } else {
                        this.$Message.error(this.$t('crm.newDetail.error_getInquiryBriefInfo'));
                    }
                    this.loading = false;
                });
            }, // 获取询盘简略信息

            /* 模态框部分 */
            // 查看询盘日志
            viewInquiryLog() {
                this.visible_view_inquiry_log = true;
            },
            refreshCheck() {
                this.$emit('refreshCheck', { inquiryId: this.inquiryId });
            }
        },
        watch: {
            inquiryId: {
                handler(val) {
                    if (val) {
                        this.get_inquiry_short_info();
                        this.current_compo = this.compo_list[0];
                    }
                },
                immediate: true
            },
            flag_update_detail() {
                this.get_inquiry_short_info();
                this.refreshCheck();
            }
        }
    };
</script>

<style lang="less">
    .fb-Modal .el-dialog__footer {
        padding: 0;
    }

    .company-name {
        color: #3b78de !important;
        cursor: pointer;

        &:hover {
            color: #2d63bc;
            text-decoration: underline;
        }
    }
</style>
