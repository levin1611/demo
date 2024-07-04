<template>
    <div class="sitemaps">
        <!-- 已提交的站点地图 -->
        <template v-if="currCompo === 'SubmittedSitemaps'">
            <div class="sitemaps-title">{{ $t('googleSearchConsole.addNewSitemap') }}</div>
            <div class="addNewSitemap">
                {{ currSite.siteUrl }}
                <Input v-model="sitemapUrl"
                       :placeholder="$t('googleSearchConsole.placeholder_addNewSitemap')">
                </Input>
                <Button type="primary"
                        size="small"
                        :disabled="!sitemapUrl"
                        :loading="loading_addNewSitemap"
                        @click="addNewSitemap">{{ $t('crm.Html.submit') }}</Button>
            </div>
        </template>
        <!-- 站点地图详情 -->
        <template v-else-if="currCompo === 'SitemapDetail'">
            <!-- 返回表格页按钮 -->
            <div class="sitemaps-backBtn">
                <div @click="goBack">
                    <Icon type="ios-arrow-back"
                          size="20"/>
                    {{ $t('back') }}
                </div>
            </div>

            <!-- 简略信息 -->
            <div class="sitemaps-desc">
                <div class="sitemaps-desc-item">
                    <div>{{ $t('googleSearchConsole.lastReadTime') }}</div>
                    <div>{{ sitemapDetailData.lastReadTime }}</div>
                </div>
                <div class="sitemaps-desc-item">
                    <div>{{ $t('googleSearchConsole.discoveredPagesCount') }}</div>
                    <div>{{ sitemapDetailData.discoveredPages }}</div>
                </div>
                <div class="sitemaps-desc-item">
                    <div>{{ $t('googleSearchConsole.discoveredVideosCount') }}</div>
                    <div>{{ sitemapDetailData.discoveredVideos }}</div>
                </div>
                <div class="sitemaps-desc-item">
                    <div>{{ $t('googleSearchConsole.sitemapProcessingStatus') }}</div>
                    <div>{{ sitemapDetailData.status }}</div>
                </div>
            </div>
        </template>

        <!-- 切换组件 -->
        <component :is="currCompo"
                   :currSite="currSite"
                   :sitemapDetailData="sitemapDetailData"
                   :refreshFlag="refreshFlag"
                   @showDetail="showDetail"></component>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { searchConsole } from '@/api/google/index';
    import SubmittedSitemaps from '@/views/Google-search-console/table/submittedSitemaps.vue';
    import SitemapDetail from '@/views/Google-search-console/table/sitemapDetail.vue';

    export default {
        name: 'sitemaps',
        components: {
            SubmittedSitemaps,
            SitemapDetail
        },
        props: {
            currSite: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId'
            })
        },
        data() {
            return {
                sitemapUrl: '',
                loading_addNewSitemap: false,

                currCompo: 'SubmittedSitemaps',
                sitemapDetailData: {},
                // 控制子组件表格数据刷新
                refreshFlag: false
            };
        },
        methods: {
            // 添加新的站点地图
            addNewSitemap() {
                if (this.loading_addNewSitemap) {
                    return;
                }

                this.loading_addNewSitemap = true;
                searchConsole.submitSitemap({
                    orgId: this.enterpriseId,
                    configId: this.currSite.configId,
                    siteUrl: this.currSite.siteUrl,
                    feedpath: `${this.currSite.siteUrl}${this.sitemapUrl}`
                }).then(res => {
                    if (res.code === '1') {
                        this.$Message.success(this.$t('googleSearchConsole.success_submitSitemap'));
                        this.refreshFlag = !this.refreshFlag;
                        this.sitemapUrl = '';
                    } else {
                        this.$Message.error(this.$t('googleSearchConsole.error_submitSitemap'));
                    }
                    this.loading_addNewSitemap = false;
                }).catch(e => {
                    this.$Message.error(this.$t('googleSearchConsole.error_submitSitemap'));
                    this.loading_addNewSitemap = false;
                });
            },

            // 已提交站点地图, 点击展开详情页
            showDetail(rowData) {
                this.sitemapDetailData = rowData;
                this.currCompo = 'SitemapDetail';
            },
            goBack() {
                this.currCompo = 'SubmittedSitemaps';
                this.sitemapDetailData = {};
            }
        },
        watch: {
            'currSite.id': {
                handler(val) {
                    if (val) {
                        this.currCompo = '';
                        this.$nextTick(() => {
                            this.goBack();
                        });
                    }
                }
            }
        }
    };
</script>

<style lang="less" scoped>
    .sitemaps {
        background: #FFF;
        padding: 20px 20px 0;

        &-title {
            display: inline-block;
            font-weight: 500;
            font-size: 16px;
            color: #2d2f2e;
        }

        &-backBtn {
            height: 30px;
            line-height: 30px;
            margin-left: 20px;
            color: #FA8241;
            cursor: pointer
        }

        &-desc {
            display: flex;
            justify-content: space-between;
            margin: 25px 0;

            &-item {
                text-align: center;
                width: 25%;
                div:first-child {
                    height: 20px;
                    line-height: 20px;
                    font-size: 14px;
                }

                div:last-child {
                    height: 30px;
                    line-height: 30px;
                    font-size: 18px;
                }
            }
        }
    }

    .addNewSitemap {
        display: flex;
        align-items: center;
        margin-top: 12px;
        color: #333;

        .el-input {
            max-width: 560px;
            margin-left: 12px;
        }

        .el-button {
            margin-left: 20px;
        }
    }
</style>
