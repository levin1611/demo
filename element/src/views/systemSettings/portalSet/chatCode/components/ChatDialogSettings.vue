<template>
    <div class="chatDialogSettings">
        <!-- header -->
        <div class="chatDialogSettings-header">
            <!-- title + tip -->
            <div>
                <div class="chatDialogSettings-title">
                    {{ $t('portal_set.chatDialogSettings') }}
                </div>
                <Tooltip :content="$t('portal_set.tip_chatDialogSettings')">
                    <span class="chatDialogSettings-tip">
                        <Icon custom="custom-tip" />
                    </span>
                </Tooltip>

                <!-- 当前显示网站 -->
                <div class="chatDialogSettings-domain">{{ $t('portal_set.domainTip_chatDialogSettings').replace('$domain', currDomain) }}</div>
            </div>

            <!-- 返回按钮 -->
            <div>
                <Button type="primary"
                        @click="goBack">{{ $t('back') }}</Button>
            </div>
        </div>

        <!-- tab 切换 -->
        <Tabs :value="currTab"
              :key="toTab"
              @input="handleChangeTab"
              class="chatDialogSettings-tab">
            <TabPane
                v-for="item in tabList"
                :key="item.key"
                :name="item.key"
                :label="item.value"
            >
            </TabPane>
        </Tabs>
        <component :is="currTab"
                   :currTab.sync="currTab"
                   :toTab.sync="toTab"
                   :currDomain="currDomain"></component>
    </div>
</template>

<script>
    import ServiceOnline from '@/views/systemSettings/portalSet/serviceOnline/serviceOnline';
    import ServiceOffline from '@/views/systemSettings/portalSet/serviceOffline/serviceOffline';

    export default {
        name: 'ChatDialogSettings',
        components: {
            ServiceOnline,
            ServiceOffline
        },
        props: {
            buriedName: {
                type: String
            },
            currDomain: {
                type: String
            }
        },
        data() {
            return {
                tabList: [
                    {
                        key: 'ServiceOnline',
                        value: this.$t('portal_set.service_online')
                    },
                    {
                        key: 'ServiceOffline',
                        value: this.$t('portal_set.service_offline')
                    }
                ],
                // 当前展示的 tab
                currTab: 'ServiceOnline',
                // 要跳转到的 tab
                toTab: ''
            };
        },
        methods: {
            goBack() {
                // 切换到聊天窗设置组件
                this.$emit('update:buriedName', 'siteSetting');
            },
            handleChangeTab(tabName) {
                if (tabName !== this.currTab) {
                    this.toTab = tabName;
                }
            }
        },
        deactivated() {
            this.currTab = 'ServiceOnline';
        }
    };
</script>

<style lang="less" scoped>
    .chatDialogSettings-tab {
        padding: 8px 30px 10px;
    }

    .chatDialogSettings-header {
        display: flex;
        justify-content: space-between;
        padding: 20px 30px 0;
        margin: 0;
    }

    .chatDialogSettings-title {
        display: inline-block;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.8);
        line-height: 24px;
    }

    .chatDialogSettings-tip {
        display: inline-block;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        line-height: 18px;
        margin: 0 8px;

        /deep/ i {
            top: -2px;
        }
    }

    .chatDialogSettings-domain {
        display: inline-block;
        padding: 0 2px;
        font-size: 12px;
        line-height: 18px;
        color: #333;
    }
</style>

<style>
    .leaveConfirmMsgBox {
        padding: 5px 5px 20px;
    }
</style>
