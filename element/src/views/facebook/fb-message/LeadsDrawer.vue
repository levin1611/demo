<template>
    <div>
        <template>
            <!-- leads详情页组件嵌套的太深了，不利于开发，其实没有必要 -->
            <LeadsDrawerList
                :rowData="rowData"
                :visible.sync="visible_leads_drawer"
                :clue_show.sync="visible_clue_drawer"
                :inquiry_show.sync="visible_inquiry_drawer"
                v-on="$listeners"
                v-bind="$attrs"
                @show_detail='show_detail'>
            </LeadsDrawerList>
        </template>
        <littleDrawer
            :visible="littleDrawerVisible"
            :currAccountInfo="currAccountInfo"
            wrapWith="75%"
            from="FBLeads"
            @handleClick="handleClick"
            @littleDrawerHidden="littleDrawerHidden"
            @emitFreshLeadsCLoudsStatus="emitFreshLeadsCLoudsStatus"
        ></littleDrawer>
        <!-- <ClueDrawerList
                :showClueStatus="true"
                :visible.sync="visible_clue_drawer"
                type="clue"
                originalType="FBLeads"
                from="fbMessage"
                :disabled="true"
                :clueId.sync="clue_id"
                :listType="2"
                :corp_columns_authorized="corp_columns_authorized"
                :contact_columns_authorized="contact_columns_authorized"
                :inquiry_columns_authorized="inquiry_columns_authorized"
                @refreshData="$emit('refreshData')">
        </ClueDrawerList>
        <CRMDrawerList
                :visible.sync="visible_inquiry_drawer"
                :id.sync="inquiry_id"
                type="inquiry"
                originalType="FBLeads"
                from="fbMessage"
                :colSpan="12"
                :disabled="true"
                :corp_columns_authorized="corp_columns_authorized"
                :contact_columns_authorized="contact_columns_authorized"
                :inquiry_columns_authorized="inquiry_columns_authorized">
        </CRMDrawerList> -->
    </div>
</template>

<script>
    // import util from '@/libs/util';
    import { mapState } from 'vuex';
    // import CRMDrawerList from '@/views/crm/Detail/CRMDrawerList';
    // import ClueDrawerList from '@/views/clue-manage/Detail/ClueDrawerList';
    import LeadsDrawerList from '@/views/facebook/fb-message/components/LeadsDrawerList';
    import littleDrawer from '@/views/main-components/little-drawer/little-drawer.vue';

    export default {
        name: 'LeadsDrawer',
        inheritAttrs: false,
        components: {
            // CRMDrawerList,
            // ClueDrawerList,
            LeadsDrawerList,
            littleDrawer
        },
        props: [
            'type',
            'id',
            'inquiryId',
            'visible_leads',
            'visible_clue',
            'visible_inquiry',
            'rowData',
            'corp_columns_authorized',
            'contact_columns_authorized',
            'inquiry_columns_authorized'
        ],
        data() {
            return {
                visible_leads_drawer: false,
                littleDrawerVisible: false,
                // visible_inquiry_drawer: false,
                currAccountInfo: null

            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId
            })
        },
        methods: {
            show_detail() {
                this.littleDrawerVisible = false;
                this.currAccountInfo = this.rowData.contactProfileInfoDto;
                localStorage.setItem('openSlideBarForWA', true);
                this.$nextTick(() => {
                    this.littleDrawerVisible = true;
                });
                // if (data.type === 'inquiry') {
                //     this.inquiry_id = data.id;
                //     this.visible_inquiry_drawer = false;
                //     this.visible_clue_drawer = false;
                //     this.$nextTick(() => {
                //         this.visible_inquiry_drawer = true;
                //     });
                // } else if (data.type === 'clue') {
                //     this.clue_id = data.id;
                //     this.visible_inquiry_drawer = false;
                //     this.visible_clue_drawer = false;
                //     this.$nextTick(() => {
                //         this.visible_clue_drawer = true;
                //     });
                // }
            },
            // 关闭弹窗
            littleDrawerHidden(val) {
                localStorage.removeItem('openSlideBarForWA');
                this.littleDrawerVisible = val;
            },
            emitFreshLeadsCLoudsStatus(data) {
                this.$set(this.rowData, 'contactProfileInfoDto', data);
                this.$set(this.rowData, 'status', data.status);
            }
            // getId() {
            //     util.ajax({
            //         url: '/crm/inquiry/getInquiryIdByLeadsId',
            //         method: 'get',
            //         params: {
            //             orgId: this.enterpriseId,
            //             leadsId: this.rowData.leadsId
            //         }
            //     }).then(res => {
            //         console.log('getId', res);
            //         if (res.data.code === '1') {
            //             // 询盘
            //             if (res.data.data.type === 1) {
            //                 this.visible_inquiry_drawer = false;
            //                 this.visible_clue_drawer = false;
            //                 this.$nextTick(() => {
            //                     this.visible_inquiry_drawer = true;
            //                 });
            //             } else if (res.data.data.type === 2) {
            //                 this.visible_inquiry_drawer = false;
            //                 this.visible_clue_drawer = false;
            //                 this.$nextTick(() => {
            //                     this.visible_clue_drawer = true;
            //                 });
            //             }
            //         }
            //     });
            // }
        },
        watch: {
            visible_leads: {
                handler(val) {
                    this.visible_leads_drawer = val;
                    if (val) {
                        if (localStorage.getItem('openSlideBarForWA')) {
                            this.show_detail();
                        }
                    }
                },
                immediate: true
            },
            visible_leads_drawer: {
                handler(val) {
                    this.$emit('update:visible_leads', val);
                    if (!val) {
                        this.littleDrawerVisible = val;
                    }
                }
            },
            // visible_clue_drawer: {
            //     handler(val) {
            //         this.$emit('update:visible_clue', val);
            //     }
            // },
            // visible_inquiry_drawer: {
            //     handler(val) {
            //         this.$emit('update:visible_inquiry', val);
            //     }
            // },
            rowData: {
                handler(val) {
                    if (localStorage.getItem('openSlideBarForWA')) {
                        this.show_detail();
                    }
                    // this.visible_clue_drawer = false;
                    // this.visible_inquiry_drawer = false;
                    // this.getId();
                }
            },
            // id: {
            //     handler(val) {
            //         // // 线索
            //         // if (this.rowData.status === 101) {
            //         //     this.clue_id = val;
            //         //     // 询盘
            //         // } else if (this.rowData.status === 102) {
            //         //     this.inquiry_id = val;
            //         // }
            //     },
            //     immediate: true
            // }
        }
    };
</script>

<style scoped>

</style>
