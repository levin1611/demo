<template>
    <div :class="{'drawer__followUp' : originalType !== 'highseasCustomer'}">
        <template v-if="originalType !== 'highseasCustomer'">
            <followUpBox
                v-if="!disabled"
                :type="type"
                :id="id"
                :companyId="companyId"
                :inquiryId="inquiryId"
                :inquirySeqNumber="inquirySeqNumber"
                :companyName="companyName"
                :followUpId="followUpId"
                :visible_full_panel.sync="visible_full_panel"
                ref="followUpBox"
                @change_flag_new_followUp="change_flag_new_followUp"
                v-on="$listeners"></followUpBox>
        </template>
        <!-- 时间轴 -->
        <time-line :disabled="disabled"
                   ref="crmDetailTimeLine"
                   :id="id"
                   :from="from"
                   :visitorId="visitorId"
                   :type="type"
                   :originalType="originalType"
                   :flag="flag"
                   :visible_full_panel="visible_full_panel"
                   @editFollowup="editFollowup"
                   v-on="$listeners"></time-line>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import timeLine from '@/views/main-components/timeline/index.vue';
    import followUpBox from '@/views/crm/Detail/Components/newDetail/followUpBox';

    export default {
        name: 'followUp',
        components: {
            timeLine,
            followUpBox
        },
        props: [
            'type',
            'originalType',
            'disabled',
            'id',
            'companyId',
            'inquiryId',
            'inquirySeqNumber',
            'inquiryManagerList',
            'companyName',
            'visitorId',
            'followUpId',
            'flag_new_followUp',
            'flag_update_inquiry',
            'flag_update_task',
            'from'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                button_list: state => state.app.button_list
            }) // 从 vuex 中获取属性
        },
        data() {
            return {
                flag: false, // 是否刷新时间轴
                /* 询盘跟进 */
                visible_full_panel: false
            };
        },
        created() {
        },
        activated() {
        },
        deactivated() {
        },
        methods: {
            // 跟进记录框触发刷新
            change_flag_new_followUp() {
                this.flag = false;
                this.$nextTick(() => {
                    this.flag = true;
                });
            },

            /* 编辑跟进记录 */
            editFollowup(timelineData) {
                // 接收子组件传来的要编辑的 followUpData , 随后调用 followUpBox 的 editFollowup 方法编辑跟进记录
                if (this.$refs.followUpBox) {
                    this.$refs.followUpBox.editFollowup(timelineData);
                } else {
                    this.$Message.error(this.$t('crm.Html.errorOccurred'));
                }
            }
        },
        watch: {
            flag_update_inquiry() {
                this.flag = false;
                this.$nextTick(() => {
                    this.flag = true;
                });
            }
        }
    };
</script>

<style lang="less">
    .drawer__followUp {
        margin-top: 16px;
    }
</style>

