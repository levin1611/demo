<template>
  <div class="portal-set" style="min-height:100%;">
    <div class="content">
      <div class="item">
        <span class="item-tip">
          {{ $t('portal_set.service_func') }}
          <!-- 系统 tip -->
          <HelpTip :title="$t('helpTip.service_func_serviceOffline')"></HelpTip>
        </span>
        <el-switch v-model="service"></el-switch>
      </div>
      <div class="item">
        <span class="item-tip">{{$t('portal_set.default_status')}}</span>
        <RadioGroup v-model="defaultStatus">
          <Radio size="large" label="1">
            <span>{{$t('portal_set.chat_box')}}</span>
          </Radio>
          <Radio size="large" label="2">
            <span>{{$t('portal_set.mini_box')}}</span>
          </Radio>
        </RadioGroup>
      </div>
      <div class="item">
        <span class="item-tip">{{$t('portal_set.box_position')}}</span>
        <RadioGroup v-model="chatPosition">
          <Radio size="large" label="2">
            <span>{{$t('portal_set.left')}}</span>
          </Radio>
          <Radio size="large" label="1">
            <span>{{$t('portal_set.right')}}</span>
          </Radio>
        </RadioGroup>
      </div>
      <RadioGroup :value="view"
                  :key="toView"
                  type="button"
                  @input="handleChangeView">
        <RadioButton label="DialogBox">{{$t('portal_set.chat_box')}}</RadioButton>
        <RadioButton label="MiniBox">{{$t('portal_set.mini_box')}}</RadioButton>
      </RadioGroup>
<!--      <keep-alive>-->
      <component :is="view"
                 :currView.sync="view"
                 :toView.sync="toView"
                 :offlineData.sync="offlineData"
                 :service="service"
                 :defaultStatus="defaultStatus"
                 :chatPosition="chatPosition"
                 :currDomain="currDomain"
                 @proForm="proForm"></component>
<!--      </keep-alive>-->
    </div>
  </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import DialogBox from './dialogBox';
    import MiniBox from './miniBox';

    export default {
        components: { DialogBox, MiniBox },
        created() {
            this.offlineChat();
        },
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
                view: 'DialogBox',
                // 要跳转到的 view
                toView: '',
                offlineData: {},
                service: true, /* 客服功能是否启用 */
                defaultStatus: '1', /* 默认状态 */
                chatPosition: '2' /* 聊天窗位置 */
            };
        },
        methods: {
            handleChangeView(view) {
                this.toView = view;
            },
            proForm(params) {
                // this.view = params[0];
                // this.productionEditing = params[1];
                // this.productionEditingId = params[2];
            },
            offlineChat() {
                util.ajaxInternational({
                    url: '/visitor-chat/offline/getByOrgId',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        operationType: 1,
                        website: this.currDomain
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.offlineData = res.data.data;
                        this.refreshData();
                    }
                });
            },
            refreshData() {
                this.defaultStatus = `${this.offlineData.displayStatus}`;
                this.chatPosition = `${this.offlineData.windowPosition}`;
                this.service = this.offlineData.enable === 1;
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
                    if (val === 'ServiceOnline') {
                        this.$emit('update:currTab', 'ServiceOnline');
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
            offlineData: {
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
