<template>
    <div class="genArtTaskDetail">
        <div class="genArtTaskDetail-topCard">
            <!-- header -->
            <div class="genArtTaskDetail-header">
                <!-- 左侧标题 + 信息 -->
                <div class="genArtTaskDetail-header-left">
                    <!-- 返回按钮 -->
                    <span @click="goBack"
                          class="genArtTaskDetail-goBack">
                        <Tooltip placement="top"
                                 transfer
                                 :content="$t('back')">
                            <Icon custom="custom custom-back"/>
                        </Tooltip>
                    </span>

                    <!-- 任务名称 -->
                    <TooltipAuto placement="bottom-start"
                                 :content="taskInfo.taskName">
                        <span class="genArtTaskDetail-taskName">{{ taskInfo.taskName || '' }}</span>
                    </TooltipAuto>

                    <!-- 状态 -->
                    <TooltipAuto placement="bottom-start"
                                 :content="taskInfo.statusLang || ''">
                        <span :class="statusClassObj">{{ taskInfo.statusLang || '' }}</span>
                    </TooltipAuto>
                </div>

                <!-- 右侧操作 + 信息 -->
                <div class="genArtTaskDetail-header-right">
                    <!-- 网站 -->
                    <TooltipAuto placement="bottom-start"
                                 :content="taskInfo.website">
                        <span class="genArtTaskDetail-website">{{ $t('autoGenArticle.website') }}: {{ taskInfo.website || '' }}</span>
                    </TooltipAuto>

                    <!-- 文章类型 -->
                    <TooltipAuto v-if="taskInfo.artType"
                                 placement="bottom-start"
                                 :content="$t(`autoGenArticle.${taskInfo.artType}`)">
                        <span class="genArtTaskDetail-artType">{{ $t('autoGenArticle.artType') }}: {{ $t(`autoGenArticle.${taskInfo.artType}`) }}</span>
                    </TooltipAuto>

                    <!-- 编辑 -->
                    <!-- 草稿, 待开始 -->
                    <Button v-if="['1', '3'].includes(taskInfo.status)"
                            size="small"
                            @click="handleEditTask"
                            class="genArtTaskDetail-operateBtn"> {{ $t('edit') }}</Button>

                    <!-- 删除 -->
                    <!-- 草稿, 待开始 -->
                    <Button v-if="['1', '3'].includes(taskInfo.status)"
                            size="small"
                            @click="handleDelete"
                            class="genArtTaskDetail-operateBtn"> {{ $t('delete') }}</Button>

                    <!-- 日期筛选 -->
                    <div class="genArtTaskDetail-dateRange">
                        <span class="genArtTaskDetail-dateRange-label">{{ $t('autoGenArticle.indicatorFilter') }}</span>
                        <CardFilter cardType="dataOverview"
                                    filterType="date"
                                    filterKey="eventDate"
                                    :filterValue="filterDate"
                                    @handleFilter="handleFilter_date"></CardFilter>
                    </div>
                </div>
            </div>

            <!-- 指标展示 -->
            <div class="genArtTaskDetail-indicator">
                <!-- 展示数据 -->
                <div v-for="item in indicatorList"
                    :key="item.key"
                    :class="{ 'genArtTaskDetail-indicator-item': true, 'genArtTaskDetail-indicator-item__divider': item.isDivider }">
                    <!-- 数值 -->
                    <TooltipAuto :content="statData[item.key]"
                                 v-loading="!`${statData[item.key]}`"
                                 class="genArtTaskDetail-indicator-item-value">{{ statData[item.key] | formatNum($lang) }}</TooltipAuto>

                    <!-- 标题 -->
                    <TooltipAuto :content="item.title"
                                 class="genArtTaskDetail-indicator-item-title">{{ item.title }}</TooltipAuto>

                    <!-- 百分比 -->
                    <div v-show="`${statData[item.key]}` && statData[`${item.key}Percentage`]"
                         class="genArtTaskDetail-indicator-item-percentage">{{ statData[`${item.key}Percentage`] | formatNum($lang) }}</div>
                </div>

                <!-- 占位 div -->
                <div style="flex-grow: 1;"></div>

                <!-- 箭头 -->
                <div @click="handleToggleIndicator"
                     :style="expandIndicator ? 'bottom: 0;' : 'top: 0;'"
                     class="genArtTaskDetail-indicator-arrow">
                    <Icon :custom="expandIndicator ? 'custom-filter-tag-move-left' : 'custom-filter-tag-move-right'"></Icon>
                </div>
            </div>
        </div>

        <div class="genArtTaskDetail-body">
            <!-- Tabs -->
            <Tabs v-model="currTab"
                  class="genArtTaskDetail-compo-tabs">
                <TabPane v-for="item in tabList"
                         :key="item.name"
                         :name="item.name"
                         :label="item.label"></TabPane>
            </Tabs>

            <!-- 文章 -->
            <div v-show="currTab === 'article'"
                 class="genArtTaskDetail-table-container">
                <!-- 表格 tabs + 文件导出按钮 -->
                <div class="genArtTaskDetail-table-tabs">
                    <Tabs v-model="currArtType">
                        <TabPane v-for="item in artTypeList"
                                 :key="item.name"
                                 :name="item.name">
                            <div slot="label">
                                <span>{{ item.label }} ({{ tabCountObj[item.name] || 0 }})</span>
                            </div>
                        </TabPane>
                    </Tabs>

                    <!-- 文件导出 -->
                    <Tooltip v-if="false"
                             :content="$t('crm.Table.exportData')"
                             effect="dark"
                             placement="bottom">
                        <Button type="text"
                                icon="custom custom-file-download"
                                @click="exportData"
                                class="genArtTaskDetail-exportBtn"></Button>
                    </Tooltip>
                </div>

                <!-- 表格 -->
                <div class="genArtTaskDetail-table">
                    <keep-alive>
                        <component :is="`${currArtType}ArticleTable`"
                                   :currTaskData="currTaskData"
                                   :currArtType="currArtType"
                                   :filterDate="filterDate"
                                   :filterCon.sync="filterConObj"
                                   :flag_refreshArtTable="flag_refreshArtTable"
                                   @updateTabCount="handleUpdateTabCount"
                                   v-on="$listeners"></component>
                    </keep-alive>
                </div>
            </div>

            <!-- 详细信息 -->
            <div v-show="currTab === 'detailInfo'">
                <TaskDetailInfo :taskInfo="taskInfo"></TaskDetailInfo>
            </div>

            <!-- 删除任务二次确认 -->
            <Modal :visible.sync="deleteConfirm"
                :title="$t('autoGenArticle.deleteConfirm')"
                :modal-append-to-body="false"
                :close-on-click-modal="false"
                width="487px"
                v-loading="loading_delete">
                <p>{{ (taskInfo.status === '4') ? $t('autoGenArticle.tip_deleteProgressingTask') : $t('autoGenArticle.tip_deleteTask') }}</p>

                <div slot="footer">
                    <Button @click="deleteConfirm = false">{{ $t('cancel') }}</Button>
                    <Button type="primary"
                            @click="deleteTask">{{$t('confirm') }}</Button>
                </div>
            </Modal>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue';
    import { mapState } from 'vuex';
    import { getGenArtTaskDetailData, getGenArtTaskDetailStatData, deleteGenArtTask } from '@/api/seo';
    import ArticleTable from '@/views/autoGenArticle/table/articleTable.vue';
    import TaskDetailInfo from '@/views/autoGenArticle/taskDetailInfo.vue';
    import CardFilter from '@/views/dashBoard/components/card-tables/card-filter.vue';

    export default {
        name: 'taskDetail',
        inheritAttrs: false,
        components: {
            allArticleTable: ArticleTable,
            pendingGenerateArticleTable: ArticleTable,
            generatingArticleTable: ArticleTable,
            generatedArticleTable: ArticleTable,
            draftArticleTable: ArticleTable,
            reviewedArticleTable: ArticleTable,
            pendingPublishArticleTable: ArticleTable,
            publishedArticleTable: ArticleTable,
            trashArticleTable: ArticleTable,
            TaskDetailInfo,
            CardFilter
        },
        props: {
            currTaskData: Object,
            // 外部组件传入参数, 控制数据刷新用
            flag_refreshArtTable: {
                type: Number
            }
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId'
            }),
            $lang() {
                return Vue.config.lang;
            },
            statusClassObj() {
                const result = ['genArtTaskDetail-status'];
                switch (this.taskInfo.status) {
                    case '1':
                        result.push('genArtTaskDetail-status__draft');
                        break;
                    case '2':
                        result.push('genArtTaskDetail-status__completed');
                        break;
                    case '3':
                        result.push('genArtTaskDetail-status__unstarted');
                        break;
                    case '4':
                        result.push('genArtTaskDetail-status__progressing');
                        break;
                }

                return result;
            }
        },
        data() {
            return {
                /* 全局 */
                taskInfo: {},
                // 任务状态 0回收站 1草稿 2已完成 3待开始 4生成中 5已取消
                statusLangObj: {
                    0: this.$t('autoGenArticle.deleted'),
                    1: this.$t('autoGenArticle.draft'),
                    2: this.$t('autoGenArticle.completed'),
                    3: this.$t('autoGenArticle.unstarted'),
                    4: this.$t('autoGenArticle.progressing'),
                    5: this.$t('autoGenArticle.canceled')
                },

                /* 统计数据 */
                statData: {},
                allIndicatorList: [
                    { key: 'allArtCount', title: this.$t('autoGenArticle.allArtCount') },
                    { key: 'generatedArtCount', title: this.$t('autoGenArticle.generated') },
                    { key: 'draftArtCount', title: this.$t('autoGenArticle.draft') },
                    { key: 'pendingPublishArtCount', title: this.$t('autoGenArticle.pendingPublish') },
                    { key: 'publishedArtCount', title: this.$t('autoGenArticle.published') },
                    { key: 'deletedArtCount', title: this.$t('autoGenArticle.deleted') },
                    { key: 'includedArtCount', title: this.$t('autoGenArticle.indexed') },
                    { key: 'impressions', title: this.$t('autoGenArticle.impressions') },
                    { key: 'clicks', title: this.$t('autoGenArticle.clicks') },
                    { key: 'averageRank', title: this.$t('autoGenArticle.averageRank') },
                    { key: 'visitorCount', title: this.$t('autoGenArticle.visitorCount') },
                    { key: 'visitorHaveChatCount', title: this.$t('autoGenArticle.visitorHaveChatCount') },
                    { key: 'visitorHaveMsgCount', title: this.$t('autoGenArticle.visitorHaveMsgCount') },
                    // { key: 'leadsCount', title: this.$t('autoGenArticle.leadsCount') },
                    // { key: 'inquiryCount', title: this.$t('autoGenArticle.inquiryCount') },
                    // { key: 'tokens', title: 'Tokens' },
                    // { key: 'totalCost', title: this.$t('autoGenArticle.totalCost') },
                    // { key: 'artPrice', title: this.$t('autoGenArticle.artPrice') },
                    // { key: 'turnover', title: this.$t('autoGenArticle.turnover') },
                    // { key: 'inquiryPrice', title: this.$t('autoGenArticle.inquiryPrice') },
                    // { key: 'roi', title: 'ROI' }
                ],
                expandIndicator: false,
                indicatorList: [],

                /* 顶部筛选 */
                // 时间
                filterDate: [(new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)).getTime(), (new Date()).getTime()],
                // 暂存表头筛选条件
                filterConObj: {},

                /* tabs */
                currTab: 'article',
                tabList: [
                    {
                        name: 'article',
                        label: this.$t('autoGenArticle.article')
                    },
                    {
                        name: 'detailInfo',
                        label: this.$t('autoGenArticle.detailInfo')
                    }
                ],

                /* 文章 tabs */
                currArtType: 'all',
                artTypeList: [
                    {
                        name: 'all',
                        label: this.$t('autoGenArticle.all')
                    },
                    {
                        name: 'pendingGenerate',
                        label: this.$t('autoGenArticle.pendingGenerate')
                    },
                    {
                        name: 'generating',
                        label: this.$t('autoGenArticle.generating')
                    },
                    {
                        name: 'generated',
                        label: this.$t('autoGenArticle.generated')
                    },
                    {
                        name: 'draft',
                        label: this.$t('autoGenArticle.draft')
                    },
                    {
                        name: 'reviewed',
                        label: this.$t('autoGenArticle.reviewed')
                    },
                    {
                        name: 'pendingPublish',
                        label: this.$t('autoGenArticle.pendingPublish')
                    },
                    {
                        name: 'published',
                        label: this.$t('autoGenArticle.published')
                    },
                    {
                        name: 'trash',
                        label: this.$t('autoGenArticle.trash')
                    }
                ],
                tabCountObj: {
                    all: 0,
                    pendingGenerate: 0,
                    generating: 0,
                    generated: 0,
                    draft: 0,
                    reviewed: 0,
                    pendingPublish: 0,
                    published: 0,
                    trash: 0
                },

                /* 删除确认弹框 */
                deleteConfirm: false,
                loading_delete: false
            };
        },
        filters: {
            formatNum(val, lang) {
                // 将纯数字字符串的小数点向左移动 n 位, 并保留 1 位小数 (有货币单位的是保留 2 位)
                function moveDotLeft(str, n) {
                    let newStr;
                    if (n) {
                        const splitDotArr = str.split('.');
                        splitDotArr[0] = splitDotArr[0].slice(0, -n) + '.' + splitDotArr[0].slice(-n);
                        newStr = splitDotArr.join('');
                    } else {
                        newStr = str;
                    }
                    newStr = Number(newStr).toFixed(currency ? 2 : 1).replace(/\.0+$/, '');

                    return newStr;
                }
                // 给纯数字字符串添加 ,
                function addCommas(str) {
                    const parts = str.split('.');
                    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    return parts.join('.');
                }

                // 去掉空数据
                let str = `${val}`;
                if (!str || ['null', 'undefined'].includes(str)) {
                    return '-';
                }

                // 暂时去掉货币符号
                let currency = '';
                if (str.endsWith(' ¥')) {
                    str = str.slice(0, -2);
                    currency = ' ¥';
                }

                let result = '';
                if (/^\d+(\.\d+)?$/.test(str)) {
                    // 中文换算
                    if (lang === 'zh-CN') {
                        // 亿
                        const val = Number(str);
                        if (val >= 100000000) {
                            result = `${addCommas(moveDotLeft(str, 8))}亿`;
                        } else if (val >= 10000) {
                            result = `${addCommas(moveDotLeft(str, 4))}万`;
                        } else {
                            result = `${addCommas(moveDotLeft(str, 0))}`;
                        }
                    } else {
                        // 英文换算
                        const val = Number(str);
                        if (val >= 1000000000000) {
                            result = `${addCommas(moveDotLeft(str, 12))}T`;
                        } else if (val >= 1000000000) {
                            result = `${addCommas(moveDotLeft(str, 9))}B`;
                        } else if (val >= 1000000) {
                            result = `${addCommas(moveDotLeft(str, 6))}M`;
                        } else if (val >= 1000) {
                            result = `${addCommas(moveDotLeft(str, 3))}K`;
                        } else {
                            result = `${addCommas(moveDotLeft(str, 0))}`;
                        }
                    }
                } else {
                    result = str;
                }
                result += currency;

                return result;
            }
        },
        methods: {
            /* 全局 */
            goBack() {
                this.$emit('goBack');
            },
            // 获取任务详情数据
            getTaskInfo() {
                // 清空旧数据
                getGenArtTaskDetailData({
                    id: this.currTaskData.id
                }).then(res => {
                    if (res.code === '1' && res.data) {
                        this.taskInfo = this.handleTaskInfo(res.data);
                        this.getStatData();
                    } else {
                        // 请求失败

                        this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    }
                }).catch(e => {
                    // 请求失败

                    console.error(e);
                    this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                });
            },
            // 格式化任务数据
            handleTaskInfo(obj) {
                const {
                    id,
                    name: taskName,
                    site_type,
                    site_id: siteId,
                    site_url: website,
                    status,
                    post_num: genArtNum,
                    post_max_size: maxContentLength,
                    randomness: contentRandomness,
                    model,
                    tones,
                    language,
                    keyword,
                    create_user_name: creator,
                    operator_user_id,
                    create_time: createTime,
                    update_time
                } = obj;

                return {
                    id,
                    taskName,
                    site_type,
                    // 选中 AMP 站, 返回"新闻", 营销站&第三方建站系统, 返回"文章"
                    artType: `${site_type}` === '1' ? 'news' : 'article',
                    siteId,
                    website,
                    status: `${status}`,
                    statusLang: this.statusLangObj[status] || status,
                    genArtNum,
                    maxContentLength,
                    contentRandomness,
                    model,
                    tones,
                    language,
                    keyword,
                    creator,
                    operator_user_id,
                    createTime,
                    update_time
                };
            },

            /* 操作任务 */
            // 编辑任务
            handleEditTask() {
                this.$emit('editTask', this.taskInfo.id ? this.taskInfo : this.currTaskData);
            },
            // 删除
            handleDelete() {
                this.loading_delete = false;
                this.deleteConfirm = true;
            },
            // 删除任务
            deleteTask() {
                this.loading_delete = true;
                deleteGenArtTask({
                    id: this.currTaskData.id
                }).then(res => {
                    switch (res.code) {
                        case '1':
                            this.$emit('refreshTaskTable');
                            this.$emit('goBack');
                            this.$Message.success(this.$t('deleteSuccess'));
                            this.deleteConfirm = false;
                            break;
                        case '10004':
                            this.$Message.error(this.$t('autoGenArticle.error_othersOperatingTask'));
                            break;
                        default:
                            this.$Message.error(this.$t('deleteFail'));
                    }
                    this.loading_delete = false;
                }).catch(e => {
                    console.error(e);
                    this.loading_delete = false;
                    this.$Message.error(this.$t('deleteFail'));
                });
            },

            /* 筛选 */
            handleFilter_date(filterCon) {
                const { filterValue } = filterCon;
                this.filterDate = Array.isArray(filterValue) ? filterValue : [];
                this.refreshData();
            },

            /* 统计数据 */
            getStatData() {
                // 清空旧数据
                this.statData = {};
                getGenArtTaskDetailStatData({
                    taskId: this.taskInfo.id,
                    createTimeStart: this.filterDate[0] ? `${this.$options.filters.timeFormat(this.filterDate[0])} 00:00:00` : undefined,
                    createTimeEnd: this.filterDate[1] ? `${this.$options.filters.timeFormat(this.filterDate[1])} 23:59:59.999` : undefined,
                }).then(res => {
                    if (res.code === '1' && res.data) {
                        this.statData = this.handleStatData(res.data);
                    } else {
                        // 请求失败

                        this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    }
                }).catch(e => {
                    // 请求失败

                    console.error(e);
                    this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                });
            },
            handleStatData(data) {
                const {
                    post_count: allArtCount,
                    generated_post_count: generatedArtCount,
                    generated_post_percentage: generatedArtCountPercentage,
                    draft_post_count: draftArtCount,
                    draft_post_percentage: draftArtCountPercentage,
                    pending_publish_post_count: pendingPublishArtCount,
                    pending_publish_post_percentage: pendingPublishArtCountPercentage,
                    published_post_count: publishedArtCount,
                    published_post_percentage: publishedArtCountPercentage,
                    deleted_post_count: deletedArtCount,
                    deleted_post_percentage: deletedArtCountPercentage,
                    hits_percentage: clicksPercentage,
                    chat_visitors_percentage: visitorHaveChatCountPercentage,
                    message_visitors_percentage: visitorHaveMsgCountPercentage,
                    leads_percentage: leadsCountPercentage,
                    inquiries_percentage: inquiryCountPercentage,
                    included_post_count: includedArtCount,
                    included_post_percentage: includedArtCountPercentage,
                    tokens,
                    impressions,
                    hits: clicks,
                    average_rank: averageRank,
                    visitors: visitorCount,
                    chat_visitors: visitorHaveChatCount,
                    message_visitors: visitorHaveMsgCount,
                    leads: leadsCount,
                    inquiries: inquiryCount,
                    total_cost: totalCost,
                    article_unit_price: artPrice,
                    turnover,
                    inquiry_unit_price: inquiryPrice,
                    roi
                } = data;

                return {
                    allArtCount,
                    generatedArtCount,
                    generatedArtCountPercentage,
                    draftArtCount,
                    draftArtCountPercentage,
                    pendingPublishArtCount,
                    pendingPublishArtCountPercentage,
                    publishedArtCount,
                    publishedArtCountPercentage,
                    deletedArtCount,
                    deletedArtCountPercentage,
                    includedArtCount,
                    includedArtCountPercentage,
                    tokens,
                    impressions,
                    clicks,
                    clicksPercentage,
                    averageRank,
                    visitorCount,
                    visitorHaveChatCount,
                    visitorHaveChatCountPercentage,
                    visitorHaveMsgCount,
                    visitorHaveMsgCountPercentage,
                    leadsCount,
                    leadsCountPercentage,
                    inquiryCount,
                    inquiryCountPercentage,
                    totalCost,
                    artPrice,
                    turnover,
                    inquiryPrice,
                    roi
                };
            },
            // 点击切换展示指标
            handleToggleIndicator() {
                this.expandIndicator = !this.expandIndicator;
                if (this.expandIndicator) {
                    this.indicatorList = this.allIndicatorList;
                } else {
                    this.indicatorList = this.allIndicatorList.slice(0, 10);
                }
            },

            // 刷新数据
            refreshData() {
                this.getStatData();
            },

            /* 文章表格 */
            // 文件下载
            exportData() {
                window.open(`${this.$util.internationalUrl}?query=${encodeURIComponent(JSON.stringify({
                    startDate: this.filterDate[0],
                    endDate: this.filterDate[1]
                }))}`, '_blank');
            },

            // 接收表格数据接口返回的各 Tab 总条数信息, 更新到 Tab 上
            handleUpdateTabCount(data = {}) {
                const {
                    post_count_tab: all,
                    pending_generate_tab: pendingGenerate,
                    generating_tab: generating,
                    generated_post_count_tab: generated,
                    draft_post_count_tab: draft,
                    audit_complete_tab: reviewed,
                    pending_publish_post_count_tab: pendingPublish,
                    published_post_count_tab: published,
                    deleted_post_count_tab: trash
                } = data;

                this.tabCountObj = {
                    all,
                    pendingGenerate,
                    generating,
                    generated,
                    draft,
                    reviewed,
                    pendingPublish,
                    published,
                    trash
                };
            }
        },
        watch: {
            currTaskData: {
                handler(val) {
                    this.taskInfo = {};
                    this.statData = {};
                    this.currTab = 'article';
                    this.currArtType = 'all';
                    if (val && val.id) {
                        this.getTaskInfo();
                    }
                },
                immediate: true
            },
            flag_refreshArtTable: {
                handler(val) {
                    this.getTaskInfo();
                }
            }
        },
        mounted() {
            this.expandIndicator = false;
            this.indicatorList = this.allIndicatorList.slice(0, 10);
        }
    };
</script>

<style lang="less" scoped>
    .genArtTaskDetail {
        background: #F5F6F9;
        padding: 12px 0 12px 12px;
        min-height: calc(~"100vh - 56px");
        display: flex;
        flex-direction: column;

        &-topCard {
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
            border-radius: 4px 0px 0px 4px;
            background: #FFF;
            margin-bottom: 12px;
        }

        &-header {
            padding: 8px 0 12px 20px;
            color: #333;
            display: flex;
            flex-wrap: wrap;
        }

        &-goBack {
            font-size: 16px;
            color: rgba(0, 0, 0, .6);
            margin-right: 14px;
            cursor: pointer;
        }

        &-taskName {
            color: rgba(0, 0, 0, 0.80);
            font-size: 16px;
            font-weight: 600;
            line-height: 33px;
            margin-right: 12px;
        }

        &-status {
            font-size: 12px;
            font-weight: 500;
            line-height: 18px;

            &&__draft {
                color: #EA4335;
            }

            &&__completed {
                color: #00CC99;
            }

            &&__unstarted {
                color: #999;
            }

            &&__progressing {
                color: #FF752A;
            }
        }

        &-header-left {
            flex: 1;
            display: flex;
            line-height: 30px;
        }

        &-header-right {
            display: flex;
        }

        &-website, &-artType {
            display: inline-block;
            margin-top: 5px;
            margin-right: 30px;
            color: #333;
            font-size: 14px;
            line-height: 22px;
        }

        &-operateBtn {
            &:not(:last-child) {
                margin-right: 10px;
            }
        }

        &-dateRange {
            margin-right: 30px;

            &-label {
                color: #333;
                font-size: 14px;
                margin-right: 10px;
            }

            > * {
                display: inline-block;
            }
        }

        &-body {
            background: #FFF;
            border-radius: 4px 0 0 4px;
            flex: 1;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
        }

        &-compo-tabs {
            border-bottom: 1px solid #EAEAEA;

            /deep/ .el-tabs__header {
                padding: 0 20px;
                margin-bottom: 0;
            }

            /deep/ .el-tabs__item {
                height: 52px;
                line-height: 52px;
            }

            /deep/ .el-tabs__nav-wrap::after {
                height: 0;
            }
        }

        &-table-container {
            position: relative;
        }

        &-table-tabs {
            margin-top: 5px;

            .el-tabs {
                padding-right: 100px;
            }

            /deep/ .el-tabs__active-bar {
                display: none;
            }

            /deep/ .el-tabs__header {
                padding: 0 0 0 20px;
                margin-bottom: 0;
            }

            /deep/ .el-tabs__item {
                height: 48px;
                line-height: 48px;
                padding: 0 15px;

                &:hover, &.is-active {
                    color: #3B78DE;
                }
            }

            /deep/ .el-tabs__nav-wrap::after {
                height: 0;
            }
        }

        &-exportBtn {
            position: absolute;
            right: 30px;
            top: 8px;

            margin: 0 8px 0 20px;
            height: 30px;
            padding: 0 8px;
            border: 1px solid #ABBFD5;
            border-radius: 4px;

            &:hover {
                border: 1px solid #ABBFD5;
            }
        }
    }

    .genArtTaskDetail-indicator {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: space-around;
        flex-wrap: wrap;
        color: #333;
        text-align: center;
        min-height: 96px;
        padding-right: 20px;

        &-item {
            flex: 0 0 10%;
            margin-bottom: 20px;
            overflow: hidden;
        }

        &-item__divider {
            position: relative;
            &::after {
                content: " ";
                position: absolute;
                top: 0;
                right: 0;
                width: 1px;
                height: 58px;
                background: #EAEAEA;
            }
        }

        &-item-value {
            font-weight: 600;
            font-size: 26px;
            line-height: 28px;
            padding: 0 10px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            letter-spacing: 1px;
            margin-bottom: 12px;
        }

        &-item-title {
            font-size: 14px;
            line-height: 18px;
        }

        &-item-percentage {
            color: #4285F2;
            font-size: 13px;
            font-weight: 500;
            line-height: 18px;
            margin-top: 4px;
        }

        &-arrow {
            position: absolute;
            right: 15px;
            width: 35px;
            line-height: 58px;
            text-align: center;
            cursor: pointer;

            /deep/ i {
                font-size: 16px;
                color: #666;
                &:hover {
                    color: #4285F2;
                }
            }
        }
    }
</style>
