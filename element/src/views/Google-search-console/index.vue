<template>
    <div class="GoogleSearchConsole">
        <!-- loading -->
        <Spin v-if="loading"
              fix></Spin>

        <div v-if="!siteList.length"
             :style="{ height: `${noDataHeight}px` }"
             class="GoogleSearchConsole-noData">
            <!-- 无数据图片 -->
            <img src="@/svg/no-data.svg"
                 :alt="$t('crm.Table.noData')">
            <p>{{ $t('googleSearchConsole.tip_noValidSite1') }}
                <a @click="toBind"
                   class="GoogleSearchConsole-toBind">Google Search Console</a>
                {{ $t('googleSearchConsole.tip_noValidSite2') }}</p>
        </div>
        <template v-else>
            <!-- 顶部站点切换筛选 -->
            <div class="GoogleSearchConsole-header">
                <!-- 站点选择 -->
                <div class="GoogleSearchConsole-site">
                    {{ $t('googleSearchConsole.siteProperty') }}
                    <Select v-model="currSiteId">
                        <Option v-for="item in siteList"
                                :key="item.id"
                                :value="item.id"
                                :label="item.siteUrl"></Option>
                    </Select>
                </div>

                <!-- 日期筛选 -->
                <div v-if="currCompo !== 'Sitemaps'"
                     class="GoogleSearchConsole-dateRange">
                    {{ $t('googleSearchConsole.dateRange') }}
                    <DatePicker v-model="filterDate"
                                type="daterange"
                                range-separator="-"
                                :picker-options="dateOptions"
                                value-format="yyyy-MM-dd"
                                format="yyyy-MM-dd"
                                size="small"
                                :clearable="false"
                                :start-placeholder="$t('startDate')"
                                :end-placeholder="$t('endDate')"
                                placement="bottom-end"></DatePicker>
                </div>
            </div>

            <!-- Tab -->
            <div class="GoogleSearchConsole-tabs">
                <Tabs v-model="currCompo">
                    <TabPane v-for="item in compoList"
                             :key="item.name"
                             :name="item.name"
                             :label="item.label"></TabPane>
                </Tabs>
            </div>

            <!-- 功能组件 -->
            <div v-if="currSiteId"
                 class="GoogleSearchConsole-compo">
                <keep-alive>
                    <component :is="currCompo"
                               :currSite="currSite"
                               :filterDate="filterDate"></component>
                </keep-alive>
            </div>
        </template>
    </div>
</template>

<script>
    import { mapGetters, mapState } from 'vuex';
    import { searchConsole } from '@/api/google/index';
    import PageIndexing from '@/views/Google-search-console/pageIndexing.vue';
    import SearchPerformance from '@/views/Google-search-console/searchPerformance.vue';
    import Sitemaps from '@/views/Google-search-console/sitemaps.vue';

    export default {
        name: 'GoogleSearchConsole',
        components: {
            PageIndexing,
            SearchPerformance,
            Sitemaps
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height'
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            // 当前选中站点的详细数据
            currSite() {
                return this.siteList.find(item => item.id === this.currSiteId) || {};
            },
            noDataHeight() {
                const temp = this.window_height ? this.window_height - 60 : document.documentElement.clientHeight - 60;
                return temp > 200 ? temp : 200;
            }
        },
        data() {
            return {
                /* 全局 */
                loading: true,

                /* 顶部筛选 */
                currSiteId: '',
                siteList: [],
                filterDate: [this.$options.filters.timeFormat(Date.now() - 3600 * 1000 * 24 * 90), this.$options.filters.timeFormat(Date.now())],
                dateOptions: {
                    shortcuts: [
                        {
                            text: this.$t('datepicker.today'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.yesterday'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24);
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.tswk'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                let dayNo = start.getDay();
                                dayNo = dayNo ? dayNo - 1 : 6;
                                start.setTime(start.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.ltwk'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                let dayNo = start.getDay();
                                dayNo = dayNo || 7;
                                end.setTime(end.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                start.setTime(end.getTime() - 6 * 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.tsmt'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(new Date(start.getFullYear(), start.getMonth(), 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.ltmt'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() - 24 * 60 * 60 * 1000);
                                start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.tsyr'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(new Date(start.getFullYear(), 0, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.ltyr'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(new Date(end.getFullYear(), 0, 1).getTime() - 24 * 60 * 60 * 1000);
                                start.setTime(new Date(start.getFullYear() - 1, 0, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.last7Days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.last14Days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 14);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.last30Days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.last90Days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.last150Days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 150);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.last365Days'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
                                picker.$emit('pick', [start, end]);
                            }
                        }
                    ]
                },

                /* 组件切换 */
                currCompo: 'PageIndexing',
                compoList: [
                    { name: 'PageIndexing', label: this.$t('googleSearchConsole.PageIndexing') },
                    { name: 'SearchPerformance', label: this.$t('googleSearchConsole.SearchPerformance') },
                    { name: 'Sitemaps', label: this.$t('googleSearchConsole.Sitemaps') }
                ]
            };
        },
        methods: {
            // 获取站点列表
            getSiteList() {
                this.loading = true;
                this.siteList = [];
                this.currSiteId = '';
                searchConsole.getSiteList({
                    orgId: this.enterpriseId
                }).then(res => {
                    if (res.code === '1') {
                        // 保存不加任何筛选条件时, 数据总条数, 用以判断是否显示"无数据"页面
                        this.siteList = res.data;
                        this.total = this.siteList.length || 0;

                        // 自动选中第一个站点
                        if (this.siteList[0]) {
                            this.currSiteId = this.siteList[0].id;
                        } else {
                            this.$Message.error(this.$t('googleSearchConsole.error_noSite'));
                        }
                    } else {
                        this.$Message.error(this.$t('googleSearchConsole.error_getSiteList'));
                    }
                    this.loading = false;
                }).catch(e => {
                    this.$Message.error(this.$t('googleSearchConsole.error_getSiteList'));
                    this.loading = false;
                });
            },

            // 点击跳转到 Google Search Console 绑定界面
            toBind() {
                if (this.isContainsMenu('google_search_console_bind')) {
                    // 校验通过, 新标签页打开线索详情
                    window.open(this.$router.resolve({
                        name: 'google_search_console_bind'
                    }).href, '_blank');
                } else {
                    this.$Message.error(this.$t('googleSearchConsole.error_haveNoPermissionSearchConsoleBinding'));
                }
            }
        },
        mounted() {
            this.getSiteList();
        }
    };
</script>

<style lang="less" scoped>
    .GoogleSearchConsole {
        &-noData {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            p {
                margin-top: 13px;
                white-space: pre-wrap;
                text-align: center;

                a {
                    color: #3B78DE;
                    cursor: pointer;
                }
            }
        }

        &-header {
            margin: 20px 30px 10px;
            color: #333;

            .el-select {
                width: 200px;
                margin-left: 20px;
            }

            .el-date-editor {
                width: 286px;
                margin-left: 20px;
            }
        }

        &-site, &-dateRange {
            display: inline-block;
        }

        &-dateRange {
            margin-left: 30px;
        }

        &-tabs {
            margin: 0 30px;

            /deep/ .el-tabs__header {
                margin: 0;
            }

            /deep/ .el-tabs__nav-wrap::after {
                height: 1px;
            }
        }

        /deep/ &-compo {
            background: #F5F6F9;
            padding: 12px;

            > div {
                border-radius: 8px;
            }
        }
    }
</style>

<style lang="less">
    .googleSearchConsole-exportData.el-button--text {
        margin: 0 8px 0 20px;
        height: 30px;
        padding: 0 8px;
        border: 1px solid #ABBFD5;
        border-radius: 4px;

        &:hover {
            border: 1px solid #ABBFD5;
        }
    }
</style>
