<template>
    <div class="portal-set" style="min-height:100%;">
        <div class="content">
            <div class="item">
                <span class="item-tip">
                    {{ $t('portal_set.service_func') }}
                    <!-- 系统 tip -->
                    <HelpTip :title="$t('helpTip.service_func_serviceOnline')"></HelpTip>
                </span>
                <el-switch v-model="service"/>
            </div>
            <!-- 默认状态 -->
            <div class="item">
                <span class="item-tip">{{$t('portal_set.default_status')}} </span>
                <RadioGroup v-model="defaultStatus">
                    <Radio size="large" label="1">
                        <span>{{$t('portal_set.chat_box')}}</span>
                    </Radio>
                    <Radio size="large" label="2">
                        <span>{{$t('portal_set.mini_box')}}</span>
                    </Radio>
                </RadioGroup>
            </div>
            <!-- 聊天窗位置 -->
            <div class="item">
                <span class="item-tip">{{$t('portal_set.box_position')}} </span>
                <RadioGroup v-model="chatPosition">
                    <Radio size="large" label="2">
                        <span>{{$t('portal_set.left')}}</span>
                    </Radio>
                    <Radio size="large" label="1">
                        <span>{{$t('portal_set.right')}}</span>
                    </Radio>
                </RadioGroup>
            </div>
            <!-- 选择对话框 -->
            <RadioGroup :value="view"
                        :key="toView"
                        type="button"
                        @input="handleChangeView">
                <RadioButton label="DialogBox">{{$t('portal_set.chat_box')}}</RadioButton>
                <RadioButton label="MiniBox">{{$t('portal_set.mini_box')}}</RadioButton>
                <RadioButton label="InvitingBox">{{$t('portal_set.invite_box')}}</RadioButton>
            </RadioGroup>
<!--            <keep-alive>-->
            <component :is="view"
                       :currView.sync="view"
                       :toView.sync="toView"
                       :onlineData.sync="onlineData"
                       :service="service"
                       :defaultStatus="defaultStatus"
                       :chatPosition="chatPosition"
                       :currDomain="currDomain"
                       @proForm="proForm"></component>
<!--            </keep-alive>-->
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import DialogBox from './dialogBox';
    import MiniBox from './miniBox';
    import InvitingBox from './invitingBox';

    export default {
        components: { DialogBox, MiniBox, InvitingBox },
        props: {
            currTab: String,
            toTab: String,
            currDomain: {
                type: String
            }
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId'
            })
        },
        data() {
            return {
                service: true, /* 客服功能是否启用 */
                defaultStatus: '1', /* 默认状态 */
                chatPosition: '1', /* 聊天窗位置 */
                view: 'DialogBox',
                // 要跳转到的 view
                toView: '',
                colorSet: '',
                onlineData: {} /* 客服在线各种数据状态 */
            };
        },
        created() {
            this.getChatSet();
        },
        methods: {
            handleChangeView(view) {
                this.toView = view;
            },
            proForm(params) {

            },
            getChatSet() {
                util.ajaxInternational({
                    url: '/visitor-chat/online/getByOrgId',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        operationType: 1,
                        website: this.currDomain
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.onlineData = res.data.data;
                        this.refreshData();
                    }
                });
            },
            refreshData() {
                this.defaultStatus = `${this.onlineData.displayStatus}`;
                this.chatPosition = `${this.onlineData.windowPosition}`;
                this.service = this.onlineData.enable === 1;
            }
        },
        watch: {
            // 当外部 Tab 切换时, 把内部的 toView 也改了, 触发"确认是否需要弹出离开确认框"逻辑
            toTab: {
                handler(val) {
                    this.toView = val;
                }
            },
            // "离开确认框"点确定要跳转了, 则触发外部 Tab 确认跳转
            view: {
                handler(val) {
                    if (val === 'ServiceOffline') {
                        this.$emit('update:currTab', 'ServiceOffline');
                        this.$emit('update:toTab', '');
                    }
                }
            },
            // "离开确认框"选择取消跳转, 清空外部 toTab
            toView: {
                handler(val) {
                    if (!val) {
                        this.$emit('update:toTab', '');
                    }
                }
            },
            onlineData: {
                handler() {
                    this.refreshData();
                },
                deep: true
            }
        }
    };
</script>

<style lang="scss">
    @import '~@/styles/moduleScss/portal-set/common';
</style>
