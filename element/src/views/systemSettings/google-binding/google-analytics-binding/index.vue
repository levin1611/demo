<template>
    <div class="account-binding">
        <div class="account-binding-title">Google Analytics 绑定</div>
        <template v-if="!boundAccounts.length">
            <Steps :active="currentStep">
                <Step :title="$t('googleAdsBinding.accountBinding.googleAccountBinding')"></Step>
                <Step title="选择 Google Analytics 账号"></Step>
                <Step title="选择媒体资源"></Step>
            </Steps>
            <component
                    :is="stepView"
                    :is-google-bind="isGoogleBind"
                    :has-bind-google="hasBindGoogle"
                    :mediaResources="currentGAAccountInfo ? currentGAAccountInfo.webProperties : []"
                    :googleAnalyticsAccounts="googleAnalyticsAccounts"
                    @stepNext="currentStep+=1"
                    @stepPrev="currentStep-=1"
                    @handleBindGoogle="handleBindGoogle"
                    @updateSelectGAAccount="updateSelectGAAccount"
                    @updateSelectMediaResource="updateSelectMediaResource"
                    @handleSave="handleSaveGAConfig"
                    style="margin: 60px auto;">
            </component>
        </template>
        <template v-else>
            <Table  ref="bindedAccountsTable"
                    :data="boundAccounts"
                    highlight-current-row
                    :show-overflow-tooltip="true"
                    :row-key="getRowKey">
                <TableColumn v-for="item in tableColumns"
                             :key="item.key"
                             :prop="item.key"
                             :align="item.align"
                             :label="item.title"
                             :width="item.width"
                             :min-width="item.width || 64"
                             :show-overflow-tooltip="true">
                    <template slot-scope="{ row }">
                        <div v-if="item.key === 'GoogleAccount'">
                            {{row.googleAccount}}
                        </div>
                        <div v-else-if="item.key === 'GoogleAnalyticsAccount'">
                            {{`${row.gaAccountName}(${row.gaAccountId})`}}
                        </div>
                        <div v-else-if="item.key === 'MediaResource'">
                            {{`${row.webPropertyName}(${row.webPropertyId})`}}
                        </div>
                        <div v-else-if="item.key === 'BoundTime'">
                            {{dateFormat('yyyy-MM-dd hh:mm:ss', row.createTime)}}
                        </div>
                        <div v-else-if="item.key === 'operate'">
                            <Button type="primary" @click="showUnbundlingModel(row)">解绑</Button>
                        </div>
                    </template>
                </TableColumn>
            </Table>
            <Modal :visible="showUnbundling"
                   :title="$t('googleAnalyticsBinding.unbundlingConfirm')"
                   :modal="false"
                   @close="handleUnbundling(false)">
                <p style="margin:20px 0;font-size:14px;text-align:center;">
                    {{$t('googleAnalyticsBinding.unbundlingTip')}}
                </p>
                <div slot="footer">
                    <Button @click="handleUnbundling(false)">{{ $t('cancel') }}</Button>
                    <Button type="primary" @click="handleUnbundling(true)">{{ $t('confirm') }}</Button>
                </div>
            </Modal>
        </template>
        <Spin fix v-if="boundAccountsLoading"></Spin>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import GoogleAccountBinding from './components/GoogleAccountBinding';
    import GAAccountSelect from './components/GAAccountSelect';
    import MediaResourceSelect from './components/MediaResourceSelect';

    export default {
        name: 'AccountBinding',
        components: {
            GoogleAccountBinding,
            GAAccountSelect,
            MediaResourceSelect
        },
        data() {
            return {
                isGoogleBind: null,
                currentStep: 0,
                stepView: 'google-account-binding',
                googleAnalyticsAccounts: [], // 当前Google账号下授权的GA账号集合
                currentGAAccountInfo: {}, // 当前选中的GA账号信息
                currentMediaResource: {}, // 当前GA账号下选中的媒体资源信息
                boundAccountsLoading: false, // 正在获取已绑定的GA账号列表
                boundAccounts: [], // 已绑定的GA账号列表
                tableColumns: [
                    {
                        title: this.$t('googleAnalyticsBinding.googleAccount'),
                        key: 'GoogleAccount',
                        tooltip: true
                    },
                    {
                        title: this.$t('googleAnalyticsBinding.googleAnalyticsAccount'),
                        key: 'GoogleAnalyticsAccount',
                        tooltip: true
                    },
                    {
                        title: this.$t('googleAnalyticsBinding.mediaResource'),
                        key: 'MediaResource',
                        tooltip: true
                    },
                    {
                        title: this.$t('googleAnalyticsBinding.bindingTime'),
                        key: 'BoundTime',
                        tooltip: true
                    },
                    {
                        title: '',
                        key: 'operate',
                        width: 150
                    }
                ],
                showUnbundling: false, // 解绑的提示框
                unbundlingGAData: {} // 要解绑的GA信息
            };
        },
        computed: {
            ...mapState([
                'enterpriseId',
                'userId'
            ]),
            googleDisabled() {
                return this.disabledModules.some(item => item.appSign === 'google');
            }
        },
        methods: {
            // 判断是否绑定谷歌账号
            hasBindGoogle() {
                util.ajaxInternational({
                    url: '/oversea/adsCustomer/hasBindGoogle',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    // 更新 Vuex "Google 账号绑定是否已失效"状态值
                    this.$store.commit('setIsGoogleInvalid', response.data.code === '0');
                    this.isGoogleBind = response.data.code === '1';
                    this.handleBindGoogle(response.data.code === '1');
                });
            },
            /* Google账号绑定成功后，获取该Google账号下授权的所有Google Analytics 账号 */
            handleBindGoogle(isBindSuccess) {
                this.isGoogleBind = isBindSuccess;
                if (isBindSuccess) {
                    util.ajaxInternational({
                        url: '/oversea/analytics/getAccounts',
                        method: 'get',
                        params: {
                            orgId: this.enterpriseId
                        }
                    }).then(res => {
                        if (res.data.code === '1') {
                            this.googleAnalyticsAccounts = res.data.data;
                        } else {
                            this.googleAnalyticsAccounts = [];
                        }
                    }).catch(err => {
                        console.log('getGaBindInfo()----err', err);
                        this.googleAnalyticsAccounts = [];
                    });
                }
            },
            /* 选中GA账号 */
            updateSelectGAAccount(account) {
                this.currentGAAccountInfo = this.googleAnalyticsAccounts.find(item => `${item.gaAccountName}(${item.gaAccountId})` === account);
            },
            /* 选中媒体资源 */
            updateSelectMediaResource(webPropertyId) {
                if (this.currentGAAccountInfo && this.currentGAAccountInfo.webProperties && this.currentGAAccountInfo.webProperties.length) {
                    this.currentMediaResource = this.currentGAAccountInfo.webProperties.find(item => `${item.webPropertyName}(${item.webPropertyId})` === webPropertyId);
                }
            },
            /* 保存选中的ga账号及其下选中的媒体资源信息 */
            handleSaveGAConfig() {
                util.ajaxInternationalJson({
                    url: '/oversea/analytics/saveGaConfig',
                    method: 'POST',
                    data: {
                        orgId: this.enterpriseId,
                        gaAccountId: this.currentGAAccountInfo.gaAccountId,
                        gaAccountName: this.currentGAAccountInfo.gaAccountName,
                        webPropertyId: this.currentMediaResource.webPropertyId,
                        webPropertyName: this.currentMediaResource.webPropertyName,
                        websiteUrl: this.currentMediaResource.websiteUrl,
                        googleAccount: this.currentGAAccountInfo.googleAccount,
                        createUserId: this.userId
                    }
                }).then(res => {
                    console.log('handleSaveGAConfig()---res', res);
                    if (res.data.code === '1') {
                        this.boundAccountsLoading = true;
                        this.currentStep = 0;
                        this.getBoundGAAccounts();
                    }
                }).catch(err => {
                    console.log('handleSaveGAConfig()---err', err);
                });
            },
            /* 绑定成功后获取绑定的ga账号列表信息 */
            getBoundGAAccounts() {
                this.boundAccountsLoading = true;
                this.boundAccounts = [];
                util.ajaxInternational({
                    url: '/oversea/analytics/getGaConfig',
                    method: 'GET',
                    params: {
                        orgId: this.enterpriseId
                    }
                }).then(res => {
                    console.log('getBoundGAAccounts()---res', res);
                    this.boundAccountsLoading = false;
                    if (res.data.code === '1' && res.data.data.length) {
                        this.boundAccounts = res.data.data;
                    } else if (!res.data.data.length) {
                        this.hasBindGoogle();
                    }
                }).catch(err => {
                    this.boundAccountsLoading = false;
                    this.hasBindGoogle();
                    console.log('getBoundGAAccounts()---err', err);
                });
            },
            getRowKey(row) {
                return row.id;
            },
            /* 解绑GA账号 */
            showUnbundlingModel(row) {
                this.showUnbundling = true;
                this.unbundlingGAData = row;
            },
            handleUnbundling(flag) {
                if (flag) {
                    util.ajaxInternationalJson({
                        url: '/oversea/analytics/deleteGaConfig',
                        method: 'GET',
                        params: {
                            orgId: this.enterpriseId,
                            userId: this.userId,
                            gaAccountId: this.unbundlingGAData.gaAccountId,
                            webPropertyId: this.unbundlingGAData.webPropertyId
                        }
                    }).then(res => {
                        console.log('handleUnbundling()---res', res);
                        this.showUnbundling = false;
                        if (res.data.code === '1') {
                            this.getBoundGAAccounts();
                            this.$Message.success(this.$t('googleAnalyticsBinding.unbundlingSuccess'));
                        }
                    }).catch(err => {
                        console.log('handleUnbundling()---err', err);
                        this.$Message.success(this.$t('googleAnalyticsBinding.unbundlingError'));
                    });
                } else {
                    this.showUnbundling = false;
                    this.unbundlingGAData = {};
                }
            },
            /** 日期格式化 */
            dateFormat(fmt, timeStramp) {
                const date = new Date(timeStramp);
                const o = {
                    'M+': date.getMonth() + 1, // 月份
                    'd+': date.getDate(), // 日
                    'h+': date.getHours(), // 小时
                    'm+': date.getMinutes(), // 分
                    's+': date.getSeconds(), // 秒
                    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
                    S: date.getMilliseconds() // 毫秒
                };
                if (/(y+)/.test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (`${date.getFullYear()}`).substr(4 - RegExp.$1.length));
                }
                for (const k in o) {
                    if (new RegExp(`(${k})`).test(fmt)) {
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)));
                    }
                }
                return fmt;
            }
        },
        created() {
            this.getBoundGAAccounts();
        },
        watch: {
            currentStep(val) {
                console.log(val);
                switch (val) {
                    case 0:
                        this.stepView = 'google-account-binding';
                        break;
                    case 1:
                        this.stepView = 'GAAccountSelect';
                        break;
                    case 2:
                        this.stepView = 'MediaResourceSelect';
                        break;
                }
            },
            isGoogleBind(val) {
                this.$store.commit('setIsGoogleBind', val);
            }
        }
    };
</script>
<style lang="less">
    .account-binding {
        padding: 10px 20px 0;
        .el-steps {
            width: 60%;
            margin-left: 25%;
            margin-top: 60px;
            .el-step {
                flex-basis: 34% !important;
                .el-step__head {
                    width: 130px !important;
                }
                .el-step__line {
                    left: 60px !important;
                    right: -60px !important;
                }
            }
        }
        .account-binding-title {
            font-size: 16px;
            color: #000;
            opacity: 0.8;
            text-align: left;
        }
    }
</style>
