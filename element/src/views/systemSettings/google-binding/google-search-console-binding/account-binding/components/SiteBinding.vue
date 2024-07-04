<template>
    <div class="siteBinding">
        <div class="step-title">{{ $t('googleAdsBinding.searchConsoleBinding.selectSiteToBind') }}</div>
        <div style="font-size:12px;">
            <template v-if="!siteList.length"
                 style="min-height: 50px;">
                <!-- loading -->
                <Spin v-if="loading_getSiteList"
                      fix></Spin>

                <!-- 无数据提示 -->
                <span v-else
                      style="line-height: 50px; text-align: center;">{{ $t('crm.Table.noData') }}</span>
            </template>
            <template v-else>
                <div class="site-checkbox-list">
                    <!-- 全选 -->
                    <Checkbox :indeterminate="indeterminate"
                              :value="checkAll"
                              @click.prevent.native="handleCheckAll"
                              class="site-checkbox">{{ $t('GA.selectAll') }}</Checkbox>
                    <!-- 已绑定站点, 显示勾选, 禁止编辑 -->
                    <Checkbox v-for="item in existSiteList"
                              :key="item.id"
                              :value="true"
                              :disabled="true"
                              class="site-checkbox">
                        <TooltipAuto :content="item.siteUrl"></TooltipAuto>
                    </Checkbox>
                    <!-- 可选站点 -->
                    <CheckboxGroup v-model="selected_siteList"
                                   @change="changeSite">
                        <Checkbox v-for="item in ableSiteList"
                                  :key="item.id"
                                  :label="item.siteUrl"
                                  class="site-checkbox">
                            <TooltipAuto :content="item.siteUrl"></TooltipAuto>
                        </Checkbox>
                    </CheckboxGroup>
                </div>
            </template>

            <!-- 底部按钮 -->
            <div class="searchConsoleBinding-steps-footer">
                <!-- 使用其他 Google 账号绑定 -->
                <Button @click="handlePrev">{{$t('googleAdsBinding.accountBinding.prevStep')}}</Button>
                <!-- 下一步 -->
                <Button type="primary"
                        :disabled="!selected_siteList.length"
                        :loading="loading_save"
                        @click="save"
                        style="margin-left:10px">{{ $t('confirm') }}</Button>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { searchConsoleBinding } from '@/api/google/index';

    export default {
        name: 'SiteBinding',
        props: {
            // 当前选中的 Google 账号
            currGoogleAccount: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                siteList: [],
                indeterminate: false,
                checkAll: false,
                selected_siteList: [],
                loading_getSiteList: false,
                loading_save: false
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName'
            }),
            // 已绑定的站点
            existSiteList() {
                return this.siteList.filter(item => item.exist);
            },
            // 未绑定的站点
            ableSiteList() {
                return this.siteList.filter(item => !item.exist);
            }
        },
        methods: {
            // 获取站点资源
            getSiteList() {
                this.loading_getSiteList = true;
                this.siteList = [];
                searchConsoleBinding.getSiteList({
                    configId: this.currGoogleAccount.id
                }).then(res => {
                    if (res.code === '1') {
                        this.siteList = res.data;
                    }
                    this.loading_getSiteList = false;
                }).catch(err => {
                    console.error(err);
                    this.loading_getSiteList = false;
                });
            },
            // 单选
            changeSite(cols) {
                if (cols.length === this.ableSiteList.length) {
                    this.indeterminate = false;
                    this.checkAll = true;
                } else if (cols.length > 0) {
                    this.indeterminate = true;
                    this.checkAll = false;
                } else {
                    this.indeterminate = false;
                    this.checkAll = false;
                }
            },
            // 全选
            handleCheckAll() {
                if (this.indeterminate) {
                    this.checkAll = false;
                } else {
                    this.checkAll = !this.checkAll;
                }
                this.indeterminate = false;

                if (this.checkAll) {
                    this.selected_siteList = this.ableSiteList.map(i => i.siteUrl);
                } else {
                    this.selected_siteList = [];
                }
            },

            handlePrev() {
                this.$emit('stepPrev', true);
            },
            // 完成绑定
            save() {
                const siteList = this.siteList.filter(item => this.selected_siteList.includes(item.siteUrl));
                if (siteList.length) {
                    this.loading_save = true;
                    searchConsoleBinding.saveSite({
                        orgId: this.enterpriseId,
                        configId: this.currGoogleAccount.id,
                        siteList,
                        autoSubmitSitemaps: 2, // 是否自动提交网站地图 1是 2 否
                        bindingStatus: 1, // 绑定状态 1是 2 否
                        operatorId: this.userId,
                        operatorName: this.fullName
                    }).then(res => {
                        if (res.code === '1') {
                            // 暂存"绑定成功"Flag
                            let saveSuccessFlag = true;
                            // 暂存绑定失败的站点
                            const failList = [];

                            if (res.data) {
                                // 处理得到绑定失败站点
                                Object.entries(res.data).forEach(([key, value]) => {
                                    if (!value) {
                                        failList.push(key);
                                    }
                                });

                                if (failList.length === siteList.length) {
                                    // 全部保存失败
                                    saveSuccessFlag = false;
                                    this.$Message.error(this.$t('googleAdsBinding.searchConsoleBinding.error_saveSiteCauseAllBound'));
                                } else if (failList.length) {
                                    // 部分保存失败
                                    this.$Message.warning(this.$t('googleAdsBinding.searchConsoleBinding.error_saveSiteCauseSomeBound').replace('$siteList', failList.join(',')));
                                }
                            }

                            // 全部保存成功, 弹出成功提示
                            if (!failList.length) {
                                this.$Message.success(this.$t('googleAdsBinding.searchConsoleBinding.success_saveSite'));
                            }

                            if (saveSuccessFlag) {
                                // 只要不是全部保存失败, 都跳转到表格页
                                this.$emit('saveSite', siteList);
                            } else {
                                // 否则刷新列表
                                this.getSiteList();
                            }
                        } else {
                            this.$Message.error(this.$t('googleAdsBinding.searchConsoleBinding.error_saveSite'));
                        }
                        this.loading_save = false;
                    }).catch(err => {
                        console.error(err);
                        this.$Message.error(this.$t('googleAdsBinding.searchConsoleBinding.error_saveSite'));
                        this.loading_save = false;
                    });
                } else {
                    this.$Message.warning(this.$t('googleAdsBinding.searchConsoleBinding.tip_selectSiteToBind'));
                }
            }
        },
        created() {
            // 获取站点资源
            this.getSiteList();
        }
    };
</script>

<style lang="less">
    .siteBinding {
        text-align: center;

        .step-title {
            text-align: center;
            font-weight: 500;
            margin-bottom: 30px;
            font-size: 16px;
            line-height: 18px;
            color: #333;
        }

        .site-checkbox-list {
            position: relative;
            margin: 0 auto;
            width: 400px;
            max-height: 370px;
            overflow-y: auto;

            .site-checkbox {
                padding: 10px 15px;
                font-size: 14px;
                line-height: 22px;
                cursor: pointer;
                display: block;
                margin: 0;
                text-align: left;

                &:hover {
                    background: #EBEEF5;
                    color: #3B78DE;
                }

                .el-checkbox__label {
                    max-width: 100%;
                    vertical-align: middle;
                    font-size: 14px;
                }
            }
        }
    }
</style>

