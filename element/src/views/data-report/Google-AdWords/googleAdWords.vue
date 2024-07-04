<template>
    <div class="xpy-google-ads">
        <!-- loading -->
        <Spin v-if="loading"
              fix></Spin>

        <!-- 报告 -->
<!--        <div v-if="isGoogleBind"-->
        <div v-if="currAdsAccountId"
             class="xpy-google-ads-container">
            <!-- 切换 ads 账户 -->
            <div class="xpy-google-ads-account-select">
                <Dropdown trigger="click"
                          placement="bottom-start"
                          @command="toggleAdsAccount">
                    <div class="xpy-google-ads-currAccount">
                        {{ currAdsAccountName }}
                        <Icon custom="custom custom-menu-arrow"
                              color="#7B98B6"
                              size="10"></Icon>
                    </div>
                    <DropdownMenu slot="dropdown">
                        <DropdownItem v-for="item in adsAccountList"
                                      :key="item.clientCustomerId"
                                      :command="item.clientCustomerId"
                                      :class="{'xpy-google-ads-account-item-active': item.clientCustomerId === currAdsAccountId}"
                                      class="xpy-google-ads-account-item">
                            <TooltipAuto :content="`${item.adsCustomerName}-${item.clientCustomerId}`"></TooltipAuto>
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>

<!--        <Container v-if="currAdsAccountId">-->
<!--            <Menu :default-active="activeIndex"-->
<!--                  mode="horizontal"-->
<!--                  @select="handleChange"-->
<!--                  style="height:100%">-->
<!--                <MenuItem v-for="item in compoList"-->
<!--                          :key="item"-->
<!--                          :index="item">{{ $t(`GA.report_${item}`) }}</MenuItem>-->
<!--            </Menu>-->

            <!-- 报告类型切换 tabs -->
            <Tabs v-model="activeIndex"
                  @change="handleChange"
                  class="xpy-google-ads-tabs">
                <TabPane v-for="item in compoList"
                         :key="item"
                         :name="item"
                         :label="$t(`GA.report_${item}`)"></TabPane>
            </Tabs>

            <!-- 报告内容区域 -->
            <div class="xpy-google-ads-content">
                <!--<transition name="main-route">-->
                <!--<router-view :authorized_export="authorized_button.google"></router-view>-->
                <!--</transition>-->
                <keep-alive :exclude="excludeArr">
                    <component :is="activeIndex"
                               :authorized_export="authorized_button.google"
                               :adsAccountId="currAdsAccountId"
                               @refreshCompo="refreshCompo"
                               @jumpTo="handleChange"></component>
                </keep-alive>
            </div>
        </div>

        <!-- 未绑定状态, 不显示报告 -->
        <div v-else
             class="xpy-google-ads-goBind">
            <span @click="jumpToBind" v-html="$t('GA.googleUnbind')"></span>
        </div>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import account from './Account/account';
    import adSeries from './AdSeries/adSeries';
    import adGroup from './AdGroup/adGroup';
    import keywords from './Keywords/keywords';
    import ad from './Ad/ad';
    import searchTerms from './SearchTerms/searchTerms';
    import territory from './territory/territory';
    import util from '@/libs/util';
    import { adsReport } from '@/api/google/index';
    const { getAdsAccountListSimpleInfo, rememberCurrAdsAccount } = adsReport;

    export default {
        name: 'google_ad_words',
        components: {
            account,
            adSeries,
            adGroup,
            keywords,
            ad,
            searchTerms,
            territory
        },
        created() {
            Date.prototype.format = function(fmt) {
                const o = {
                    'M+': this.getMonth() + 1, // 月份
                    'd+': this.getDate(), // 日
                    'h+': this.getHours(), // 小时
                    'm+': this.getMinutes(), // 分
                    's+': this.getSeconds(), // 秒
                    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
                    S: this.getMilliseconds() // 毫秒
                };
                if (/(y+)/.test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()}`).substr(4 - RegExp.$1.length));
                }
                for (const k in o) {
                    if (new RegExp(`(${k})`).test(fmt)) {
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k])
                            : ((`00${o[k]}`).substr((`${o[k]}`).length)));
                    }
                }
                return fmt;
            };
            // this.hasBindGoogle();
            this.getAccountList();
        },
        computed: {
            ...mapState({
                button_list: state => state.app.button_list,
                userId: state => state.userId,
                enterpriseId: state => state.enterpriseId
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            authorized_button() {
                return {
                    google: !HANDLE_BUTTON(BUTTON_IDS.dataReport.google, this.button_list)
                };
            },
            currAdsAccountName() {
                if (!this.currAdsAccountId) {
                    return '';
                }

                const item = this.adsAccountList.find(item => item.clientCustomerId === this.currAdsAccountId);
                if (item) {
                    return `${item.adsCustomerName}-${item.clientCustomerId}`;
                } else {
                    return this.currAdsAccountId;
                }
            }
        },
        data() {
            return {
                // 全局 loading
                loading: true,

                isGoogleBind: false,
                activeIndex: 'account',
                compoList: [
                    'account',
                    'adSeries',
                    'adGroup',
                    'keywords',
                    'ad',
                    'searchTerms',
                    'territory'
                ],
                // 不在 keep-alive 范围的组件, 目前仅用于刷新
                excludeArr: [],

                // 切换查看不同 ads 账户的数据
                adsAccountList: [],
                currAdsAccountId: ''
            };
        },
        methods: {
            // 判断是否绑定谷歌账号
            hasBindGoogle() {
                util.ajaxInternational({
                    url: '/oversea/adsCustomer/hasBindGoogle',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        userId: this.userId
                    }
                }).then(response => {
                    // 更新 Vuex "Google 账号绑定是否已失效"状态值
                    this.$store.commit('setIsGoogleInvalid', response.data.code === '0');
                    this.isGoogleBind = response.data.code === '1';
                });
            },
            handleChange(name) {
                // 更新组件
                this.activeIndex = name;

                // 如果之前触发了"刷新组件数据"动作, arr 中可能有要跳转的组件, 跳转后应该把此组件从 arr 中去掉(因为已经刷新了)
                if (this.excludeArr.length) {
                    this.excludeArr = this.excludeArr.filter(item => item !== name);
                }
            },
            // 刷新当前组件
            refreshCompo(refreshAll = false) {
                // 暂存当前组件 name
                const currCompoName = this.activeIndex;

                // 根据是"刷新全部组件数据“还是"刷新当前组件数据", 更新 arr
                if (refreshAll) {
                    this.excludeArr = this.compoList.slice();
                } else {
                    this.excludeArr.push(currCompoName);
                }

                // 隐藏组件, 随后在视图更新后显示回之前的组件, 完成刷新当前组件操作
                this.activeIndex = '';
                setTimeout(() => {
                    this.handleChange(currCompoName);
                }, 0);
            },
            jumpToBind() {
                if (this.isContainsMenu('google_ads_binding')) {
                    // 如果当前权限目录中有 google 绑定, 则跳转到 Google 绑定
                    this.$router.push({
                        name: 'google_ads_binding'
                    });
                } else {
                    // 否则弹出无权限提示
                    this.$Message.warning(this.$t('noAuthorityPath1') + this.$t('menu.google_ads_binding') + this.$t('noAuthorityPath2'));
                }
            },

            // 获取所有账号列表
            getAccountList() {
                this.loading = true;

                getAdsAccountListSimpleInfo({
                    orgId: this.enterpriseId
                }).then(res => {
                    this.loading = false;
                    if (res && res.code === '1') {
                        this.adsAccountList = Array.isArray(res.data) ? res.data : [];
                        if (this.adsAccountList.length) {
                            this.currAdsAccountId = res.message || this.adsAccountList[0].clientCustomerId;
                        }
                    } else {
                        this.$Message.error(this.$t('GA.error_getAdsAccountList'));
                    }
                });
            },
            // 切换 Ads 账户时调用接口, 记录当前选中的账户 id
            toggleAdsAccount(adsAccountId) {
                this.currAdsAccountId = adsAccountId;
                this.refreshCompo(true);
                rememberCurrAdsAccount({
                    orgId: this.enterpriseId,
                    clientCustomerId: adsAccountId
                });
            }
        }
    };
</script>

<style scoped lang="less">
    .el-menu-item.is-active {
        background-color: #fff8f0;
        &:not(.el-menu-submenu):before {
            background: #fa8241;
            bottom: 0;
            content: "";
            display: block;
            left: 0;
            position: absolute;
            top: 0;
            width: 3px;
        }
    }
    * /deep/ .title {
        font-size: 18px;
        color: rgba(0, 0, 0, 0.8);
        line-height: 60px;
    }

    * /deep/ ::-webkit-scrollbar {
        width: 4px;
        height: 10px;
        background-color: #c9c9c9;
    }

    * /deep/ ::-webkit-scrollbar-track {
        -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
        border-radius: 2px;
        background-color: #c9c9c9;
    }

    * /deep/ ::-webkit-scrollbar-thumb {
        border-radius: 5px;
        -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
        background-color: #fc8b2f;
    }

    .xpy-google-ads {
        height: 100%;
        padding: 20px 20px 0;

        &-container {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        &-account-select {
            padding: 0 10px;
            margin-bottom: 10px;
        }

        &-tabs {
            padding: 0 10px;

            /deep/ .el-tabs__header {
                margin-bottom: 0;
                border-bottom: none;
            }

            /deep/ .el-tabs__nav-wrap:after {
                height: 1px;
            }
        }

        &-content {
            padding: 10px;
            flex: 1;
            overflow-y: auto;
        }

        &-goBind {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            height: 100%;
        }

        &-currAccount {
            font-size: 16px;
            color: #2d2f2e;
            cursor: pointer;
            font-weight: 500;
        }

        &-account-item:not(.is-disabled):hover, &-account-item-active {
            background-color: #F3F4F7;
            color: #3B78DE;
            max-width: 600px;
        }
    }
</style>
