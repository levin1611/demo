<template>
    <div class="crm-detail-page" :style="['mail', 'mail_detail', 'whatsApp', 'microenterprise','global_sms_calling','Sms'].includes(from) && 'min-width: 0;'">
        <Spin v-if="loading" size="large" fix></Spin>
        <template>
            <div class="companyWrap" style="padding:20px 20px 20px 16px;">
                <div class="company">
                    <div class="com_top">
                        <div class="com_name">
                            <Icon custom="custom custom-highseas-clue"
                                  size="36"
                                  style="float: left;margin-right: 10px"></Icon>
                            <Tooltip placement="bottom-start" :content="clue_short_info.a1009">
                                <span class="com_name_short" :style="['mail', 'mail_detail', 'microenterprise'].includes(from) && 'max-width: 170px;margin-right:0;overflow: hidden;text-overflow:ellipsis;white-space: nowrap;'">{{ clue_short_info.a1009 || '' }}</span>
                            </Tooltip>
                        </div>
                        <div class="com_operate" v-if="!disabled">
                            <Button
                                v-if="authorized_button['claim']"
                                type="text"
                                icon="custom custom-crm-claim"
                                @click="visible_claim_clue = true">
                                    {{$t('clue.claim_leads')}}
                            </Button>
                            <Button
                                type="text"
                                @click="visibleClueLog = true">
                                    {{$t('clue.clueLog')}}
                            </Button>
                        </div>
                    </div>
                </div>
                <!-- 邮件模块 侧滑页数据布局 -->
                <Row class="com_main" style="margin-top: 12px;" v-if="['mail', 'mail_detail','whatsApp', 'microenterprise','global_sms_calling','Sms'].includes(from)">
                    <Col v-for="(value, key) in clue_short_info_items" :key="key" :span="12">
                        <span class="col_name" :class="value">{{ $t(`clue.${value}`) }}：</span>
                        <span class="col_value">
                            <template v-if="key === 'source'">
                                {{ source_type }}
                            </template>
                            <template v-else-if="$route.path.indexOf('/common_sea_customer') < 0  && key === 'seqNumber' && ['mail', 'mail_detail'].includes(from)">
                                <a style="color:#4285f4" @click.stop="jumpToTheClueDetail(clue_short_info[key])">{{
                                    clue_short_info[key] }}</a>
                            </template>
                            <template v-else-if="key === 'saleName'">
                                {{ clue_short_info[key] === '公海' || clue_short_info[key] === 'Public leads' ? $t('clue.public_sea') : clue_short_info[key] }}
                            </template>
                            <template v-else>
                                {{ clue_short_info[key] }}
                            </template>
                        </span>
                    </Col>
                </Row>

                <!-- crm模块 侧滑页数据布局 -->
                <Row type="flex" justify="space-between" v-else>
                    <Col v-for="(value, key) in clue_short_info_items" :key="key" :span="4">
                        <p class="col_name">{{ $t(`clue.${value}`) }}</p>
                        <p class="col_value">
                            <template v-if="key === 'source'">{{ source_type }}</template>
                            <template v-else-if="key === 'saleName'">{{ clue_short_info[key] === '公海' || clue_short_info[key] === 'Public leads' ? $t('clue.public_sea') : clue_short_info[key] }}</template>
                            <template v-else>{{ clue_short_info[key] }}</template>
                        </p>
                    </Col>
                </Row>

                <!-- whatsApp聊天主页面增加标签详情 组件通信使用provide 来源是WhatsApp主页面index.vue-->
                <main class="tagWrap" v-if="['whatsApp'].includes(from)">
                    <waLableTagVue></waLableTagVue>
                </main>
            </div>
            <div class="hr-block"></div>
            <div class="component-wrap">
                <Tabs v-model="current_compo">
                    <TabPane v-for="item in compo_list"
                             :label="(item === 'FollowUp' && inquiryId) ? $t(`clue.module_RelatedFollowUp`) : $t(`clue.module_${item}`)"
                             :name="item" :key="item"></TabPane>
                </Tabs>
                <keep-alive v-if="!loading">
                    <!-- 组件传递参数说明: -->
                    <component :is="current_compo"
                               :id="clueId"
                               :type="'highseasClue'"
                               :from="from"
                               :originalType="originalType"
                               :disabled="disabled"
                               :source="clue_short_info.source"
                               :visitorId="clue_short_info.proj"
                               :sourceId="clue_short_info.sourceId"
                               :source_type="source_type"
                               :flag_inquiry_id_requested="true"
                               :currAccountInfo="currAccountInfo"
                               v-on="$listeners">
                    </component>
                </keep-alive>
            </div>

            <!-- 认领线索 -->
            <ClaimClue
                :visible.sync="visible_claim_clue"
                :clueId="clueId"
                @chownSuccess="chownSuccess">
            </ClaimClue>

            <!-- 线索日志 -->
            <ClueLog
                :visible.sync="visibleClueLog"
                :clueId="clueId">
            </ClueLog>
        </template>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex';
    import { env } from '../../../../build/config';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import ClaimClue from '@/views/clue-manage/Detail/Components/Modal/claimClue';
    import FollowUp from '@/views/clue-manage/Detail/Components/Html/followUp';
    import DetailInfo from '@/views/clue-manage/Detail/Components/Html/detailInfo';
    import ClueLog from '@/views/clue-manage/Detail/Components/Modal/clueLog';
    import inOutGoingMail from '@/views/main-components/little-drawer/components/inOutGoingMail.vue';
    import { crmClue } from '@/api/crm';
    import waLableTagVue from '@/views/whatsapp-manage/components/waLableTag.vue';

    export default {
        name: 'highseasClueDetail',
        components: {
            ClaimClue,
            FollowUp,
            DetailInfo,
            ClueLog,
            inOutGoingMail,
            waLableTagVue
        },
        props: [
            'clueId',
            'originalType',
            'disabled',
            'from',
            'currAccountInfo'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                fieldIndex: state => state.clue.fieldIndex,
                button_list: state => state.app.button_list
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            authorized_button() {
                return {
                    claim: !HANDLE_BUTTON(BUTTON_IDS.CRM.highseasClue.claim, this.button_list)
                };
            }, // 按钮权限集合
            source_type() {
                switch (this.clue_short_info.source) {
                    case 1:
                        return this.$t('clue.history');
                    case 2:
                        return this.$t('clue.web_msg');
                    case 3:
                        return this.$t('clue.direct_create');
                    case 4:
                        return this.$t('clue.web_conversation');
                    case 5:
                        return 'Facebook Leads';
                    case 6:
                        return this.$t('clue.fb_msg');
                    case 7:
                        return this.$t('clue.fb_comment');
                    case 9:
                        return this.$t('clue.data_import');
                    case 10:
                        return this.$t('clue.website_order');
                    default:
                        break;
                }
            }, // 返回创建方式 label
            status_type() {
                switch (this.clue_short_info.status) {
                    case 1:
                        return this.$t('clue.unfollowed');
                    case 2:
                        return this.$t('clue.trash');
                    case 3:
                        return this.$t('clue.inquiry');
                    case 4:
                        return this.$t('clue.following');
                    case 5:
                        return this.$t('clue.done');
                    default:
                        break;
                }
            } // 返回线索状态 label
        },
        data() {
            return {
                visibleClueLog: false,
                env,
                loading: true,

                /* 全局 */
                clue_short_info: {}, // 询盘详情
                clue_short_info_items: {
                    seqNumber: 'clue_id',
                    source: 'create_way',
                    createUser: 'inputer',
                    serviceName: 'service',
                    // a1001: 'corp_companyName',
                    // a1003: 'corp_countryArea',
                    // a10055: 'corp_clientType',
                    saleName: 'manager'
                }, // 格式 -> 数据的 key: 多语言的 key

                /* 右上角显示询盘或操作 */
                inquiryId: undefined,
                inquirySeqNumber: undefined,

                /* 动态组件部分 */
                compo_list: [
                    'FollowUp',
                    'DetailInfo'
                ],
                current_compo: 'FollowUp',

                /* 模态框部分 */
                visible_claim_clue: false
            };
        },
        methods: {
            /* 获取数据 */
            // 获取线索简略信息
            getClueShortInfo() {
                this.loading = true;
                crmClue.getSimpleColumnValue({
                    id: this.clueId
                }).then(response => {
                    if (response.code === '1') {
                        this.clue_short_info = response.data;
                        this.$store.commit('set_clue_short_info', this.clue_short_info);
                    } else {
                        this.$Message.error('获取线索简略信息出错');
                    }
                    this.loading = false;
                }).catch(error => {
                    console.log(error);
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error('获取线索简略信息出错');
                    }
                });
            },

            /* 判断按钮权限 */
            HANDLE_BUTTON,

            /* 各类 button 操作 */
            // 认领成功后的回调
            chownSuccess() {
                this.$emit('closeDetail');
                this.$emit('refreshData');
                //  如果是whatsApp頁面過來的就emit用來更新聊天頁面按鈕狀態
                if (['whatsApp'].includes(this.from)) {
                    this.$emit('chownSuccess');
                }
            },
            // 跳转到相对应的公海线索
            async jumpToTheClueDetail() {
                if (this.isContainsMenu('common_sea_customer')) {
                    // 校验通过, 新标签页打开线索详情
                    localStorage.setItem('leadsCloud-clueId', this.clueId);
                    window.open(this.$rootRouter.resolve({
                        name: 'common_sea_customer'
                    }).href, '_blank');
                } else {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpClueInHighseas1'));
                }
            }
        },
        watch: {
            clueId: {
                handler(val) {
                    if (val) {
                        if (['mail', 'mail_detail'].includes(this.from)) {
                            this.compo_list.unshift('inOutGoingMail');
                        }
                        this.getClueShortInfo();
                        this.current_compo = this.compo_list[0];
                    }
                },
                immediate: true
            },
            flag_update_detail: {
                handler() {
                    this.$emit('refreshData');
                }
            }
        }
    };
</script>
<style scoped lang="less">
    // 邮件模块侧滑页详情显示布局
    .com_main{

        /deep/ .el-col-12{
            line-height: 18px;
            display: flex;
            margin-top: 8px;
        }

        span.col_name{
            display: inline-block;
            line-height: 18px;
            margin-bottom: 0;
            margin-top: 0;
            vertical-align: middle;
        }

        span.col_value{
            display: inline-block;
            margin-bottom: 0;
            margin-top: 0;
            line-height: 18px;
            max-width: 100px;
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
            vertical-align: middle;
            &.create_way{
                max-width: 72px;
            }
        }
    }
    .com_operate{
        /deep/ .el-button--text{
            margin-left: 0;
            padding: 0 7px;
            span{
                margin-left: 2px;
            }
        }
    }
</style>
<style lang="scss" scoped>
    @import '~@/styles/recoverCommon.scss';
</style>
