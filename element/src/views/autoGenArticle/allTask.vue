<template>
    <div class="genArtTask">
        <div class="genArtTask-topCard">
            <!-- 顶部筛选 + 信息展示 -->
            <div class="genArtTask-header">
                <!-- 任务类型筛选 -->
                <div class="genArtTask-taskType">
                    <Poptip v-model="visible"
                            placement="bottom-start"
                            popper-class="no-padding genArtTask-taskType-popper"
                            ref="poptip"
                            style="line-height: 20px;">
                        <!-- trigger -->
                        <div slot="reference"
                            class="genArtTask-taskType-popper-trigger">
                            <!-- 标题 -->
                            <TooltipAuto placement="top-start"
                                         :content="currTaskType">
                                <span>{{ $t(`autoGenArticle.${currTaskType}`) }}</span>
                            </TooltipAuto>

                            <!-- 下拉按钮 -->
                            <Icon custom="custom-menu-arrow"
                                  color="#7B98B6"
                                  size="10"
                                  style="position: absolute;right: 0;top: 6px;cursor: pointer;"></Icon>
                        </div>

                        <!-- 内容 -->
                        <ul class="genArtTask-taskType-popper-content">
                            <li v-for="item in taskTypeList"
                                :key="item.value"
                                @click="handleCheckTaskType(item.value)">{{ item.label }}</li>
                        </ul>
                    </Poptip>
                </div>

                <!-- 创建人筛选 -->
                <div class="genArtTask-user">
                    <!-- 员工筛选 -->
                    <personFilter cardType="autoGenArtTask"
                                  :department_list="department_list"
                                  :user_list="user_list"
                                  :filterValue="userIdList"
                                  @handleFilter="handleFilter_user"></personFilter>
                </div>

                <!-- 网站筛选 -->
                <div class="genArtTask-site">
                    <Select v-model="selectedSiteList"
                            multiple
                            collapse-tags
                            filterable
                            ref="siteSel"
                            @visible-change="handleSiteSelTrigger"
                            :class="{ 'genArtTask-site__blured': siteSelectBlured }">
                        <Option v-for="item in siteList"
                                :key="`${item.site_id}-${item.site_type}`"
                                :label="`[${$t(`seo.detailSelect.siteType_${item.site_type}`)}]${item.site_url}`"
                                :value="`${item.site_id}-${item.site_type}`"></Option>
                    </Select>
                </div>

                <!-- 剩余金额展示 -->
                <!-- <div class="genArtTask-overage">{{ $t('autoGenArticle.balance') }}: {{ balance }}</div> -->
                <!-- 剩余文章数展示 -->
                <div class="genArtTask-overage">{{ $t('autoGenArticle.balanceArtNum') }}: {{ balanceArtNum }}</div>

                <!-- 日期筛选 -->
                <div class="genArtTask-dateRange">
                    <span class="genArtTask-dateRange-label">{{ $t('autoGenArticle.indicatorFilter') }}</span>
                    <CardFilter cardType="dataOverview"
                                filterType="date"
                                filterKey="eventDate"
                                :filterValue="filterDate"
                                @handleFilter="handleFilter_date"></CardFilter>
                </div>
            </div>

            <!-- 指标展示 -->
            <div class="genArtTask-indicator">
                <!-- 展示数据 -->
                <div v-for="item in indicatorList"
                    :key="item.key"
                    :class="{ 'genArtTask-indicator-item': true, 'genArtTask-indicator-item__divider': item.isDivider }">
                    <!-- 数值 -->
                    <TooltipAuto :content="statData[item.key]"
                                 v-loading="!`${statData[item.key]}`"
                                 class="genArtTask-indicator-item-value">{{ statData[item.key] | formatNum($lang) }}</TooltipAuto>

                    <!-- 标题 -->
                    <TooltipAuto :content="item.title"
                                 class="genArtTask-indicator-item-title">{{ item.title }}</TooltipAuto>

                    <!-- 百分比 -->
                    <div v-show="`${statData[item.key]}` && statData[`${item.key}Percentage`]"
                         class="genArtTask-indicator-item-percentage">{{ statData[`${item.key}Percentage`] | formatNum($lang) }}</div>
                </div>

                <!-- 占位 div -->
                <div style="flex-grow: 1;"></div>

                <!-- 箭头 -->
                <div @click="handleToggleIndicator"
                     :style="expandIndicator ? 'bottom: 0;' : 'top: 0;'"
                     class="genArtTask-indicator-arrow">
                    <Icon :custom="expandIndicator ? 'custom-filter-tag-move-left' : 'custom-filter-tag-move-right'"></Icon>
                </div>
            </div>
        </div>

        <!-- 表格部分 -->
        <div class="genArtTask-table-container">
            <!-- 表格 tabs + 新建按钮 -->
            <div class="genArtTask-table-tabs">
                <Tabs v-model="currTaskStatus">
                    <TabPane v-for="item in tabList"
                             :key="item.name"
                             :name="item.name"
                             :label="item.label">
                        <div slot="label">
                            <span>{{ item.label }} ({{ tabCountObj[item.name] || 0 }})</span>
                        </div>
                    </TabPane>
                </Tabs>

                <!-- 新建 -->
                <Tooltip :disabled="allowCreateTask"
                         :content="$t('autoGenArticle.noBalanceArtNumTip')">
                    <div class="genArtTask-createBtn">
                        <Button type="primary"
                                :loading="loading_setting"
                                :disabled="!allowCreateTask"
                                @click="handleCreate">{{ $t('autoGenArticle.create') }}</Button>
                    </div>
                </Tooltip>
            </div>

            <!-- 表格 -->
            <div class="genArtTask-table">
                <keep-alive>
                    <component :is="`${currTaskStatus}TaskTable`"
                               :currTaskStatus="currTaskStatus"
                               :currTaskType="currTaskType"
                               :userIdList="userIdList"
                               :selectedSiteList="selectedSiteList"
                               :filterDate="filterDate"
                               :filterCon.sync="filterConObj"
                               :flag_refreshTaskTable="flag_refreshTaskTable"
                               @updateTabCount="handleUpdateTabCount"
                               v-on="$listeners"></component>
                </keep-alive>
            </div>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue';
    import { mapState } from 'vuex';
    import { getAllSiteList, getGenArtTaskStatData } from '@/api/seo';
    import TaskTable from '@/views/autoGenArticle/table/taskTable.vue';
    import CardFilter from '@/views/dashBoard/components/card-tables/card-filter.vue';
    import PersonFilter from '@/views/dashBoard/components/person-filter';

    export default {
        name: 'allTask',
        inheritAttrs: false,
        components: {
            allTaskTable: TaskTable,
            completedTaskTable: TaskTable,
            undoneTaskTable: TaskTable,
            draftTaskTable: TaskTable,
            canceledTaskTable: TaskTable,
            trashTaskTable: TaskTable,
            CardFilter,
            PersonFilter
        },
        props: {
            // 全局设置数据: 管理权限, 剩余金额, 是否允许新建任务
            manageRole: {
                type: Boolean,
                default: false
            },
            balance: {
                type: Number,
                default: 0
            },
            balanceArtNum: {
                type: Number,
                default: 0
            },
            allowCreateTask: {
                type: Boolean,
                default: false
            },
            // 外部组件传入参数, 表明是否更新全局设置数据中
            loading_setting: {
                type: Boolean
            },
            // 外部组件传入参数, 控制数据刷新用
            flag_refreshTaskTable: {
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
            }
        },
        data() {
            return {
                /* 全局 */

                /* 顶部筛选 */
                // 任务类型
                taskTypeList: [
                    { value: 'allTask', label: this.$t('autoGenArticle.allTask') }
                ],
                currTaskType: 'allTask',
                // 创建人
                department_list: [],
                user_list: [],
                userIdList: [],
                // 网站
                selectedSiteList: [],
                siteList: [],
                siteSelectBlured: true,
                // 时间
                filterDate: [(new Date((new Date()).getFullYear(), (new Date()).getMonth(), 1)).getTime(), (new Date()).getTime()],
                // 暂存表头筛选条件
                filterConObj: {},

                // 新建任务
                flag_createTask: false,

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
                    // { key: 'totalCost', title: this.$t('autoGenArticle.totalCost') },
                    // { key: 'artPrice', title: this.$t('autoGenArticle.artPrice') },
                    // { key: 'turnover', title: this.$t('autoGenArticle.turnover') },
                    // { key: 'inquiryPrice', title: this.$t('autoGenArticle.inquiryPrice') },
                    // { key: 'roi', title: 'ROI' }
                ],
                expandIndicator: false,
                indicatorList: [],

                /* tabs */
                currTaskStatus: 'all',
                tabList: [
                    {
                        name: 'all',
                        label: this.$t('autoGenArticle.all')
                    },
                    {
                        name: 'completed',
                        label: this.$t('autoGenArticle.completed')
                    },
                    {
                        name: 'undone',
                        label: this.$t('autoGenArticle.undone')
                    },
                    {
                        name: 'draft',
                        label: this.$t('autoGenArticle.draft')
                    },
                    {
                        name: 'canceled',
                        label: this.$t('autoGenArticle.canceled')
                    },
                    {
                        name: 'trash',
                        label: this.$t('autoGenArticle.trash')
                    }
                ],
                tabCountObj: {
                    all: 0,
                    completed: 0,
                    undone: 0,
                    draft: 0,
                    canceled: 0,
                    trash: 0
                }
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

            /* 筛选 */
            handleCheckTaskType(val) {
                this.currTaskType = val;
            },
            convertTaskTypeToVal(str) {
                const obj = {
                    allTask: 1,
                    myTask: 2,
                    subTask: 3
                };

                return obj[str];
            },
            handleFilter_taskType() {
                this.refreshData();
            },
            // 获取用户下拉筛选所需数据
            get_update_tree() {
                this.$commonApi.getCrmManageDepartments({
                    orgId: this.enterpriseId,
                    userId: this.userId
                }).then(data => {
                    if (data.code === '1') {
                        return new Promise((resolve) => {
                            this.department_list = data.data;
                            if (Array.isArray(data.data) && data.data.length) {
                                resolve();
                            }
                        });
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.departmentErr'));
                    }
                }).then((data) => {
                    this.$commonApi.getCrmUserByleaderUserId({
                        orgId: this.enterpriseId,
                        userId: this.userId
                    }).then(data => {
                        if (data.code === '1') {
                            this.user_list = data.data;
                        } else {
                            this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                        }
                    });
                });
            },
            handleFilter_user(key, val) {
                this.userIdList = val;
                this.refreshData();
            },
            // 获取所有网站
            getAllSites() {
                this.siteList = [];
                getAllSiteList({
                    page: 1,
                    page_size: 9999
                }).then(res => {
                    if (res.code === '1' && Array.isArray(res.data)) {
                        this.siteList = res.data;
                    } else {
                        this.$Message.warning(res.data.msg);
                    }
                }).catch(e => {
                    this.$Message.error(this.$t('seo.detailSelect.errorMsg'));
                });
            },
            handleFilter_site() {
                this.refreshData();
            },
            // 监听站点多选框的下拉框展开收起, 以便在收起下拉框时可以通过 css 调整多选框高度(视觉上是去掉空白行)
            handleSiteSelTrigger(val) {
                // 变量控制 css class
                this.siteSelectBlured = !val;

                // 下拉框展开时, 自动聚焦(组件自带有, 但加上上述逻辑后没有了, 这里补上)
                if (val) {
                    setTimeout(() => {
                        this.$refs.siteSel.$refs.input.focus();
                    }, 0);
                }
            },
            handleFilter_date(filterCon) {
                const { filterValue } = filterCon;
                this.filterDate = Array.isArray(filterValue) ? filterValue : [];
                this.refreshData();
            },

            /* 统计数据 */
            getStatData() {
                // 清空旧数据
                this.statData = {};
                getGenArtTaskStatData({
                    orgId: Number(this.enterpriseId),
                    sitePairs: this.selectedSiteList.map(val => {
                        return {
                            siteId: Number(val.split('-')[0]),
                            siteType: Number(val.split('-')[1])
                        };
                    }),
                    createUserIds: this.userIdList,
                    statusList: [1, 2, 3, 4, 5],
                    createTimeStart: this.filterDate[0] ? `${this.$options.filters.timeFormat(this.filterDate[0])} 00:00:00` : undefined,
                    createTimeEnd: this.filterDate[1] ? `${this.$options.filters.timeFormat(this.filterDate[1])} 23:59:59.999` : undefined,
                    taskFilter: this.convertTaskTypeToVal(this.currTaskType)
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

            // 新建
            handleCreate() {
                if (this.flag_createTask) {
                    // 如果当前正在请求全局设置数据来新建任务, 则不允许重复点击
                    return;
                }

                // 先请求父组件更新全局设置数据
                this.$emit('updateSettingData');
                // 标识当前正在等待全局设置数据更新中
                this.flag_createTask = true;
            },

            // 接收表格数据接口返回的各 Tab 总条数信息, 更新到 Tab 上
            handleUpdateTabCount(data = {}) {
                const {
                    task_count_tab: all,
                    generated_task_count_tab: completed,
                    unfinished_task_count_tab: undone,
                    draft_task_count_tab: draft,
                    cancelled_task_count_tab: canceled,
                    deleted_task_count_tab: trash
                } = data;

                this.tabCountObj = {
                    all,
                    completed,
                    undone,
                    draft,
                    canceled,
                    trash
                };
            }
        },
        watch: {
            currTaskType: {
                handler(val) {
                    if (val) {
                        this.handleFilter_taskType();
                    }
                }
            },
            manageRole: {
                handler(val) {
                    if (val) {
                        this.taskTypeList = [
                            { value: 'allTask', label: this.$t('autoGenArticle.allTask') },
                            { value: 'myTask', label: this.$t('autoGenArticle.myTask') },
                            { value: 'subTask', label: this.$t('autoGenArticle.subTask') }
                        ];
                    } else {
                        this.taskTypeList = [
                            { value: 'allTask', label: this.$t('autoGenArticle.allTask') }
                        ];
                    }
                },
                immediate: true
            },
            selectedSiteList: {
                handler(val) {
                    if (val) {
                        // 刷新数据
                        this.handleFilter_site();

                        // 重置 tabs
                        this.currTaskStatus = 'all';
                    }
                }
            },
            flag_refreshTaskTable: {
                handler(val) {
                    this.refreshData();
                }
            },
            loading_setting: {
                handler(val) {
                    // 点击新建按钮后, 父组件更新全局设置信息完毕, 继续执行新建任务相关逻辑
                    if (!val && this.flag_createTask) {
                        // 取消标识
                        this.flag_createTask = false;

                        if (this.allowCreateTask) {
                            // 如果此时允许新建任务, 跳转到新建任务页面
                            this.$emit('createTask');
                        } else {
                            // 否则弹出提示, 余额不足
                            // this.$Message.warning(this.$t('autoGenArticle.noBalanceTip'));
                            // 否则弹出提示, 剩余文章数不足
                            this.$Message.warning(this.$t('autoGenArticle.noBalanceArtNumTip'));
                        }
                    }
                }
            }
        },
        mounted() {
            this.get_update_tree();
            this.getAllSites();
            this.refreshData();
            this.expandIndicator = false;
            this.indicatorList = this.allIndicatorList.slice(0, 10);
        },
        deactivated() {
            // 离开页面时, 取消新建任务标识
            this.flag_createTask = false;
        }
    };
</script>

<style lang="less" scoped>
    .genArtTask {
        background: #F5F6F9;
        padding: 12px 0 12px 12px;

        &-topCard {
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
            border-radius: 4px 0px 0px 4px;
            background: #FFF;
            margin-bottom: 12px;
        }

        &-header {
            padding: 12px 30px 12px 20px;
            color: #333;
            display: flex;

            /deep/ .card-filter__trigger {
                border-color: #DCDFE6;
            }

            /deep/ .el-input__inner {
                height: 34px;
                line-height: 34px;
                border-color: #DCDFE6;
            }
        }

        &-taskType, &-user, &-site {
            margin-right: 20px;
        }

        &-user, &-site {
            width: 200px;

            /deep/ .el-select {
                .el-select__tags {
                    > span {
                        display: flex;
                        max-width: 100%;
                        overflow: hidden;
                        text-overflow: ellipsis;

                        > .el-tag {
                            white-space: nowrap;
                            max-width: 100%;
                            overflow: hidden;
                            text-overflow: ellipsis;

                            &:last-child {
                                flex: 1 0 auto;
                            }

                            &:first-child {
                                position: relative;
                                padding-right: 15px;
                                flex: 0 1 auto;

                                .el-tag__close {
                                    position: absolute;
                                    right: 0;
                                    top: 4px;
                                }
                            }
                        }
                    }
                }
            }

            /deep/ .genArtTask-site__blured {
                .el-select__input {
                    display: none;
                }

                .el-input__inner {
                    height: 34px !important;
                }
            }
        }

        &-user {
            /deep/ .department-filter-title {
                flex: 1;
                max-width: 100%;
            }
        }

        &-site {
            /deep/ .el-select {
                width: 100%
            }
        }

        &-taskType {
        }

        &-overage {
            flex: 1;
            text-align: right;
            line-height: 34px;
        }

        &-dateRange {
            margin-left: 20px;

            &-label {
                margin-right: 10px;
            }

            > * {
                display: inline-block;
            }
        }

        &-table-container {
            background: #FFF;
            border-radius: 4px 0 0 4px;
            position: relative;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
        }

        &-table-tabs {
            border-bottom: 1px solid #EAEAEA;

            .el-tabs {
                padding-right: 100px;
            }

            /deep/ .el-tabs__header {
                padding: 0 120px 0 20px;
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

        &-createBtn {
            position: absolute;
            right: 30px;
            top: 8px;
        }
    }

    .genArtTask-indicator {
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

<style lang="less">
    .genArtTask-taskType-popper {
        li {
            height: 30px;
            line-height: 30px;
            padding: 0 16px;
            margin: 10px 0;
            cursor: pointer;

            &:hover {
                background-color: #f3f4f7;
            }
        }

        &-trigger {
            margin-top: 5px;
            max-width: 200px;
            padding: 0 20px 0 0;
            display: inline-block;
            position: relative;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            cursor: pointer;

            span {
                color: rgba(0, 0, 0, 0.80);
                font-size: 16px;
                font-weight: 500;
                line-height: 24px;
            }
        }

        &-content {
            padding: 8px 0;
        }
    }
</style>
