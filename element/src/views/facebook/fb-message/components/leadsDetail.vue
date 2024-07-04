<template>
    <div class="fb-timeline" style="padding:25px;">
        <div class="header">
            <h3 class="title">{{ 'LeadsID: ' + rowData.leadsId }}</h3>
            <div>
                <crmArchiveStatus @showDetail="showDetail" class="conversation-status" :status="status"></crmArchiveStatus>
            </div>
        </div>

        <FBLine :rowData="rowData" :columns="columns" :fbAdInformation.sync="fbAdInformation"></FBLine>

        <!-- <ClueModal
                v-model="visible_enter_clue"
                :type="'facebook'"
                :title="$t('website.Tooltip1')"
                :createCustomer.sync="createCustomer"
                class="modal companydata"
                :delLoading="false"
                :json_data="json_data"
                :hide="enterpriseId + '' !== '1000' && enterpriseId + '' !== '1002'"
                :saveClueClass="'leadsManage_clueSubmit'"
                :saveClueAndInquiryClass="'leadsManage_clueAndInquirySubmit'"
                :okEnterInquiryClass="'leadsManage_inquirySubmit'"
                @on_cancle_clue="on_cancle_clue"
                @open_close="open_close"
                @returnLeadsId="updateStatus"
        ></ClueModal> -->
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import FBLine from '@/views/facebook/fb-message/components/FBLine';
    import crmArchiveStatus from '@/views/main-components/crmArchiveStatus';
    // import ClueModal from '@/views/main-components/enter-clue/enter-clue';

    export default {
        name: 'leadsDetail',
        components: {
            FBLine,
            crmArchiveStatus
            // ClueModal
        },
        props: [
            'visible',
            'rowData',
            'templateId',
            'formModel',
            'columns'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                button_list: state => state.app.button_list,
                fbLeadsUnentry: state => state.facebook.fbLeadsUnentry
            }),
            // authorized_button() {
            //     const buttonIds = BUTTON_IDS.Facebook.leads;
            //     return {
            //         enterClue: !HANDLE_BUTTON(buttonIds.enterClue, this.button_list),
            //         enterCustomer: !HANDLE_BUTTON(buttonIds.enterCustomer, this.button_list)
            //     };
            // },
//             json_data() {
//                 return Object.assign({}, this.rowData, {
//                     enterpriseId: this.enterpriseId,
//                     userId: this.userId,
//                     userName: this.userName,
//                     templateId: this.templateId,
//                     sourceName: this.formModel,
//                     a1008: this.rowData.a1008 ? `${this.rowData.a1008}
// ${this.fbAdInformation}` : this.fbAdInformation, // 广告信息回填到备注中
//                     ba1008: this.rowData.ba1008 ? `${this.rowData.ba1008}
// ${this.fbAdInformation}` : this.fbAdInformation // 广告信息回填到备注中
//                 });
//             },
            // statusLabel() {
            //     const statusObj = this.status_list.find(item => item.value === this.status);
            //     return statusObj ? statusObj.label : 'unknown';
            // }
        },
        data() {
            return {
                fbAdInformation: {},

                // 直接创建客户
                createCustomer: false,

                leadsType: '',
                /* 状态 */
                status: '',
                status_list: [
                    {
                        value: 1,
                        label: this.$t('website.noDispose'),
                        class: 'fb-leads-no-dispose'
                    },
                    {
                        value: 100,
                        label: this.$t('facebook.inbox.invalid'),
                        class: 'fb-leads-invalid'
                    },
                    {
                        value: 103,
                        label: this.$t('facebook.secondConsultation'),
                        class: 'fb-leads-second-consultation'
                    }
                ],

                /* 录入线索模态框 */
                visible_enter_clue: false
            };
        },
        created() {
            // 不同浏览器 hidden 名称
            const hiddenProperty =
                'hidden' in document
                    ? 'hidden'
                    : 'webkitHidden' in document
                        ? 'webkitHidden'
                        : 'mozHidden' in document
                            ? 'mozHidden'
                            : null;
            // 不同浏览器的事件名
            const visibilityChangeEvent = hiddenProperty.replace(
                /hidden/i,
                'visibilitychange'
            );
            // document.addEventListener(visibilityChangeEvent, this.onVisibilityChange);
        },
        beforeDestroy() {
            // 不同浏览器 hidden 名称
            const hiddenProperty =
                'hidden' in document
                    ? 'hidden'
                    : 'webkitHidden' in document
                        ? 'webkitHidden'
                        : 'mozHidden' in document
                            ? 'mozHidden'
                            : null;
            // 不同浏览器的事件名
            const visibilityChangeEvent = hiddenProperty.replace(
                /hidden/i,
                'visibilitychange'
            );
            document.removeEventListener(
                visibilityChangeEvent,
                this.onVisibilityChange
            );
        },
        methods: {
            // 录入成功后更新状态
            updateStatus(clueId, status) {
                // console.log(this.rowData);
                // console.log('录入成功改变状态', clueId, status);
                util
                    .ajax({
                        url: '/form-cust/form/updateColumnValueStatus',
                        method: 'post',
                        data: {
                            id: this.rowData.id,
                            status: status
                        }
                    });
                // this.getId();
            },
            // 录入线索或询盘后，根据接口判断，显示线索/询盘详情页
            getId() {
                util
                    .ajax({
                        url: '/crm/inquiry/getInquiryIdByLeadsId',
                        method: 'get',
                        params: {
                            orgId: this.enterpriseId,
                            leadsId: this.rowData.leadsId
                        }
                    })
                    .then(res => {
                        if (res.data.code === '1') {
                            this.leadsType = res.data.data.type;
                            // 询盘
                            if (res.data.data.type === 1) {
                                const inquiry_obj = {
                                    type: 'inquiry',
                                    id: res.data.data.id[0]
                                };
                                this.rowData.status = 102;
                                this.$emit('openDetail', inquiry_obj);
                            } else if (res.data.data.type === 2) {
                                const clue_obj = {
                                    type: 'clue',
                                    id: res.data.data.id[0]
                                };
                                this.rowData.status = 101;
                                this.$emit('openDetail', clue_obj);
                            }
                        }
                    });
            },
            on_cancle_clue(data) {
                this.visible_enter_clue = data.close;
                this.createCustomer = data.close;
            },
            // 录入框关闭时刷新列表状态
            open_close(data) {
                this.visible_enter_clue = data.close;
                this.createCustomer = data.close;
                this.$listeners.refreshData();
                util
                    .ajax({
                        url: '/crm/inquiry/getInquiryIdByLeadsId',
                        method: 'get',
                        params: {
                            orgId: this.enterpriseId,
                            leadsId: this.rowData.leadsId
                        }
                    })
                    .then(response => {
                        if (response.data.code === '1') {
                            if (response.data.data.type === 2) {
                                this.rowData.status = 101;
                            } else if (response.data.data.type === 1) {
                                this.rowData.status = 102;
                            }
                        }
                    });
            },
            // leads详情页右上角更新状态
            changeStatus(status) {
                if (this.status === status) {
                    return;
                }
                const statusObj = this.status_list.find(item => item.value === status);
                statusObj && this.$confirm(
                    `${this.$t('visitor_history.confirm_to')}leads${this.$t('visitor_history.set')}【${statusObj.label}】?`,
                    this.$t('visitor_history.confirm_change'),
                    {
                        showClose: true
                    }
                ).then(() => {
                    util.ajax({
                        url: '/form-cust/form/updateColumnValueStatus',
                        method: 'post',
                        data: {
                            id: this.rowData.id,
                            status: status
                        }
                    }).then(response => {
                        if (response.data.code === '1') {
                            this.status = status;
                            switch (status) {
                                case 1:
                                    /* 状态更改为未录入，右上角FB Leads图标的未录入数加1 */
                                    // this.$store.commit('setFbLeadsUnentry', this.fbLeadsUnentry + 1)
                                    // this.$Message.success(this.$t('facebook.editSuccess'));
                                    this.$Message.success(`facebook leads${this.$t('visitor_history.unfollowed_success')}`);
                                    break;
                                case 100:
                                    /* 状态更改为无关，右上角FB Leads图标的未录入数减1 */
                                    // this.$store.commit('setFbLeadsUnentry', this.fbLeadsUnentry - 1)
                                    // this.$Message.success(this.$t('facebook.editSuccess'));
                                    this.$Message.success(`facebook leads${this.$t('visitor_history.trash_success')}`);
                                    break;
                                case 103:
                                    /* 状态更改为二次咨询，右上角FB Leads图标的未录入数减1 */
                                    // this.$store.commit('setFbLeadsUnentry', this.fbLeadsUnentry - 1)
                                    // this.$Message.success(this.$t('facebook.editSuccess'));
                                    this.$Message.success(`facebook leads${this.$t('visitor_history.twiceAsk_succsee')}`);
                                    break;
                                case 101:
                                    this.$listeners.closeDrawer();
                            }
                            this.updateLeadsUnread();
                            this.$listeners.refreshData();
                        }
                    });
                });
            },
            updateLeadsUnread() {
                util
                    .ajax({
                        url: '/form-cust/form/getLastedTemplate',
                        method: 'get',
                        params: {
                            orgId: this.enterpriseId,
                            cateType: 1
                        }
                    })
                    .then(response => {
                        if (response.data.code === '1') {
                            if (response.data.data.id) {
                                util
                                    .ajax({
                                        url: '/form-cust/form/getUnTreatedLeads',
                                        method: 'get',
                                        params: {
                                            templateId: response.data.data.id,
                                            orgId: this.enterpriseId
                                        }
                                    })
                                    .then(response => {
                                        if (response.data.code === '1') {
                                            this.$store.commit('setFbLeadsUnentry', response.data.data);
                                        }
                                    });
                            }
                        }
                    });
            },
            handleShowDetail() {
                // 点击显示详情，需要先取消掉tooltip的focus状态，否则切换页面会出现tooltip的提示。
                this.$refs.showDetailBtn.$el.blur();
                this.getId();
            },
            showInquiry() {
            },
            showClue() {
            },
            showDetail() {
                localStorage.setItem('openSlideBarForWA', true);
                this.$emit('openDetail');
            },
            onVisibilityChange() {
                // 不同浏览器 hidden 名称
                const hiddenProperty =
                    'hidden' in document
                        ? 'hidden'
                        : 'webkitHidden' in document
                            ? 'webkitHidden'
                            : 'mozHidden' in document
                                ? 'mozHidden'
                                : null;

                if (!document[hiddenProperty]) {
                    this.$listeners.refreshData();
                }
            }
        },
        watch: {
            'rowData.status': {
                handler(val) {
                    this.status = Number(val);
                },
                deep: true,
                immediate: true
            }
        }
    };
</script>

<style lang="less" scoped>
    @import "./visitor-detail.less";

    .header-source {
        float: left;
        padding-left: 8px;
        color: @event-color;
        cursor: pointer;

        &:hover {
            color: #2d63bc;
            text-decoration: underline;
        }
    }

    /deep/ .ivu-tooltip {
        float: right;
    }

    // .header {
    //     margin-top: 8px;
    //     position: relative !important;

    //     .title {
    //         font-size: 18px;
    //         line-height: 26px;
    //         display: inline-block;
    //         margin-right: 16px;
    //     }

    //     .leads_select {
    //         float: right;
    //         /deep/ .ivu-select-item-focus {
    //             background-color: #ffffff;
    //         }
    //     }
    // }

    // .leads_enter {
    //     float: right;
    //     cursor: pointer;
    // }
</style>
