<!-- 客户旅程时间轴组件 -->
<template>
    <div class="customer-journey">
        <!-- 标题 + 筛选 -->
        <div class="customer-journey-title-container">
            <!-- 标题 -->
            <span class="customer-journey-title">{{ $t('crm.newDetail.customerJourney') }}</span>
        </div>
        <!-- 跟进记录框 -->
        <FollowUpBox v-if="!disabled"
                    :type="type"
                    :id="id"
                    :companyId="id"
                    :inquiryId="inquiryId"
                    :inquirySeqNumber="inquirySeqNumber"
                    :companyName="companyName"
                    :followUpId="followUpId"
                    :visible_full_panel.sync="visible_full_panel"
                    ref="followUpBox"
                    @change_flag_new_followUp="change_flag_new_followUp"
                    v-on="$listeners"
                    style="margin-top:10px"></FollowUpBox>

        <!-- 时间轴 -->
        <timeLine :disabled="disabled"
                   ref="customerJourneyTimeLine"
                   :id="id"
                   :visitorId="visitorId"
                   :type="type"
                   :originalType="originalType"
                   :flag="flag"
                   :visible_full_panel="visible_full_panel"
                   :isScroll="isScroll"
                   @viewInquiry="viewInquiry"
                   @editFollowup="editFollowup"
                   v-on="$listeners"></timeLine>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import timeLine from '@/views/main-components/timeline/index.vue';
    import FollowUpBox from '@/views/crm/Detail/Components/newDetail/followUpBox';
    export default {
        name: 'customerJourney',
        components: {
            FollowUpBox,
            timeLine
        },
        props: [
            'id',
            'type', // 从哪进入详情: inquiry：询盘；customer & highseasCustomer：客户；contact：联系人
            'fromType',
            'originalType', // 原始 type , 标识是从哪个模块进入时间轴的, 也有可能不会传值进来
            'disabled', // CRM 跟进记录传入, 表示是否显示跟进记录评论框
            'inquiryId',
            'inquirySeqNumber',
            'companyName',
            'visitorId',
            'followUpId',
            'flag_update_inquiry_list',
            'isScroll'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId'
            }),
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ])
        },
        data() {
            return {
                /* 全局 */
                // 时间轴刷新标识
                flag: false,
                /* 询盘跟进 */
                visible_full_panel: false
            };
        },
        methods: {
            // 跟进记录框触发刷新
            change_flag_new_followUp() {
                this.flag = false;
                this.$nextTick(() => {
                    this.flag = true;
                });
            },
            // 编辑跟进记录
            editFollowup(timelineData) {
                // 接收子组件传来的要编辑的 followUpData , 随后调用 followUpBox 的 editFollowup 方法编辑跟进记录
                if (this.$refs.followUpBox) {
                    this.$refs.followUpBox.editFollowup(timelineData);
                } else {
                    this.$Message.error(this.$t('crm.Html.errorOccurred'));
                }
            },
            // 弹出询盘详情 时间轴查看询盘会用到
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
                window.open(this.$router.resolve({
                    name: 'myInquiry'
                }).href, '_blank');
            }
        },
        created() {
        },
        watch: {
            // 新增询盘后, 刷新时间轴
            flag_update_inquiry_list() {
                this.flag = false;
                this.$nextTick(() => {
                    this.flag = true;
                });
            }
        }
    };
</script>

<style scoped lang="less">
    .customer-journey {
        display: flex;
        flex-direction: column;
        border-radius: 8px 8px 0px 0px;

        &-title-container {
            display: flex;
            align-items: center;
            height: 24px;
        }

        &-title {
            font-size: 16px;
            color: rgba(0,0,0,0.80);
            letter-spacing: 0;
            // line-height: 28px;
            font-weight: bold;
        }

        &-filter-area {
            flex: 1;
            text-align: right;
        }

        .timeLine-container {
            height: 100%;
            overflow: hidden;
        }
    }
</style>

<style scoped lang="less">
    .timeLine-container {
        position: relative;

        /deep/ .el-tabs__header {
            margin-bottom: 0;
            border-bottom: none;
        }

        /deep/ .el-tabs__nav-wrap {
            height: 32px;
            line-height: 32px;
            overflow: inherit;
        }

        /deep/ .el-tabs__nav .el-tabs__item {
            padding: 3px 15px 3px 5px;

            & + .el-tabs__item {
                padding: 3px 15px;
            }
        }

        /deep/ .el-tabs__nav .el-tabs__item {
            font-size: 13px;
            line-height: 40px;

            &:active {
                color: #4285F4 !important;
            }

            &:hover {
                color: #4285F4 !important;

                .custom-menu-arrow {
                    color: #4285F4 !important;
                }
            }

            &.is-active {
                color: #4285F4;

                i {
                    color: #4285F4 !important;
                }
            }
        }

        /deep/ .el-tabs__active-bar {
            display: none;
        }

        /deep/ .el-tabs__nav-wrap:after {
            display: none;
        }
    }

    .mail-radioGroup {
        padding: 2px;
        box-sizing: content-box;

        .el-radio {
            padding: 6px;
            margin: 0;
            line-height: inherit;
        }
    }

    .date-filter {
        &.el-input__inner {
            width: 20px;
            border: none;
            outline: none !important;
            box-shadow: none !important;
            border-color: #dcdfe6 !important;
            transition: width .4s linear;

            .el-icon-date {
                color: #A9B9C9;
            }

            .el-range-separator {
                display: none;
            }
        }

        &:hover.el-input__inner {
            width: 200px !important;
            border: 1px solid #dcdfe6;
            transition: width .4s linear;

            .el-range-separator {
                display: inline-block;
            }

            //transition-timing-function: linear
        }
    }

    .no-empty-date {
        width: 200px !important;
        border: 1px solid #dcdfe6 !important;

        .el-range-separator {
            display: inline-block !important;
        }
    }

    .timeline-search-input {
        .el-input__inner {
            width: 5px;
            height: 26px;
            line-height: 26px;
            outline: none !important;
            font-size: 13px;
            border-radius: 10px;
            border: none;
            padding: 0 28px 0 8px;
            transition: width .4s linear;
            box-shadow: none !important;
            border-color: #dcdfe6 !important;
            background-color: #fff;
            //display: none;

            &::-webkit-input-placeholder {
                color: #dcdfe6;
            }

            &::-moz-placeholder { /* Mozilla Firefox 4+ */
                color: #dcdfe6;
            }

            &:-ms-input-placeholder { /* Internet Explorer 10-11 */
                color: #dcdfe6;
            }

            &:focus {
                padding: 0 53px 0 8px;
            }
        }

        .el-input__suffix {
            .el-icon-search {
                color: #A9B9C9;
                margin-top: -3px !important;
                cursor: pointer;
            }

            .el-input__clear {
                margin-top: -3px !important;
                cursor: pointer;
            }
        }

        &:hover .el-input__inner {
            width: 200px !important;
            border: 1px solid #dcdfe6;
            transition: width .4s linear;
            //transition-timing-function: linear
        }
    }

    .no-empty-keyword {
        .el-input__inner {
            width: 200px !important;
            border: 1px solid #dcdfe6;
        }
    }

    .timeline__filter_publisher{
        margin-right:20px;
        display: inline-block;
    }
</style>
