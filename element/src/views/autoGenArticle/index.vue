<template>
    <div class="AutoGenArticle">
        <!-- loading -->
        <Spin v-if="loading"
              fix
              style="background-color: #FFF;"></Spin>

        <!-- 未使用过此功能(未充值过金额), 显示宣传页 -->
        <div v-if="!haveUsed"
             :style="{ height: `${noDataHeight}px` }"
             class="AutoGenArticle-noData">
             <!-- 标题 -->
             <div class="AutoGenArticle-noData-title">{{ $t('menu.autoGenArticle') }}</div>

             <!-- slogan 宣传语 -->
             <div class="AutoGenArticle-noData-content">
                <div class="AutoGenArticle-noData-sloganItem">
                    <!-- slogan 标题 -->
                    <div class="AutoGenArticle-noData-sloganItem-title">{{ $t('autoGenArticle.sloganTitle1') }}</div>
                    <!-- slogan 描述 -->
                    <div class="AutoGenArticle-noData-sloganItem-desc">{{ $t('autoGenArticle.sloganDesc1') }}</div>
                    <!-- slogan 图片 -->
                    <div class="AutoGenArticle-noData-sloganItem-img">
                        <img :src="`${publicPath}image/autoGenArtSlogan1.png`">
                    </div>
                </div>

                <div class="AutoGenArticle-noData-sloganItem">
                    <!-- slogan 标题 -->
                    <div class="AutoGenArticle-noData-sloganItem-title">{{ $t('autoGenArticle.sloganTitle2') }}</div>
                    <!-- slogan 描述 -->
                    <div class="AutoGenArticle-noData-sloganItem-desc">{{ $t('autoGenArticle.sloganDesc2') }}</div>
                    <!-- slogan 图片 -->
                    <div class="AutoGenArticle-noData-sloganItem-img">
                        <img :src="`${publicPath}image/autoGenArtSlogan2.png`">
                    </div>
                </div>

                <div class="AutoGenArticle-noData-sloganItem">
                    <!-- slogan 标题 -->
                    <div class="AutoGenArticle-noData-sloganItem-title">{{ $t('autoGenArticle.sloganTitle3') }}</div>
                    <!-- slogan 描述 -->
                    <div class="AutoGenArticle-noData-sloganItem-desc">{{ $t('autoGenArticle.sloganDesc3') }}</div>
                    <!-- slogan 图片 -->
                    <div class="AutoGenArticle-noData-sloganItem-img">
                        <img :src="`${publicPath}image/autoGenArtSlogan3.png`">
                    </div>
                </div>
             </div>

            <!-- 联系方式 -->
            <div class="AutoGenArticle-noData-contact">
                <Icon custom="custom-dianhua4"
                      color="#FF752A"
                      size="18"></Icon>{{ $t('autoGenArticle.contactToBuy') }}
            </div>
        </div>
        <!-- 否则, 正常使用 -->
        <template v-else>
            <!-- 功能组件 -->
            <keep-alive :exclude="excludeCompos">
                <component :is="currCompo"
                           :manageRole="manageRole"
                           :balance.sync="balance"
                           :balanceArtNum.sync="balanceArtNum"
                           :allowCreateTask.sync="allowCreateTask"
                           :currTaskData="currTaskData"
                           :currArtData="currArtData"
                           :flag_refreshTaskTable="flag_refreshTaskTable"
                           :flag_refreshArtTable="flag_refreshArtTable"
                           :loading_setting="loading"
                           @updateSettingData="getSettingData"
                           @createTask="handleCreateTask"
                           @editTask="handleEditTask"
                           @showTaskDetail="handleShowTaskDetail"
                           @goBack="goBack"
                           @refreshTaskTable="handleRefreshTaskTable"
                           @editArticle="handleEditArt"
                           @refreshArtTable="handleRefreshArtTable"></component>
            </keep-alive>
        </template>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { getAutoGenArtSetting } from '@/api/seo';
    import AllTask from '@/views/autoGenArticle/allTask.vue';
    import NewTask from '@/views/autoGenArticle/newTask.vue';
    import TaskDetail from '@/views/autoGenArticle/taskDetail.vue';
    import EditArticle from '@/views/autoGenArticle/editArticle.vue';

    export default {
        name: 'AutoGenArticle',
        components: {
            AllTask,
            NewTask,
            TaskDetail,
            EditArticle
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height'
            }),
            noDataHeight() {
                const temp = this.window_height ? this.window_height - 65 : document.documentElement.clientHeight - 65;
                return temp > 200 ? temp : 200;
            }
        },
        data() {
            return {
                /* 全局 */
                publicPath: process.env.BASE_URL,
                loading: true,
                // 是否使用过此功能(充值过金额)
                haveUsed: false,
                // 是否具有管理权限
                manageRole: false,
                // 剩余金额
                balance: 0,
                // 剩余文章数
                balanceArtNum: 0,
                // 是否允许新建任务
                allowCreateTask: false,

                /* 组件切换 */
                // 不 keep-alive 的组件
                excludeCompos: ['newTask', 'editArticle', 'taskDetail'],
                // 当前显示组件
                currCompo: 'TaskDetail',
                // 记录组件的层级次序
                compoPath: [],
                // 组件间传值: 当前正在操作的任务数据
                currTaskData: {},
                // 组件间传值: 要求刷新任务列表数据
                flag_refreshTaskTable: 0,
                // 组件间传值: 当前正在操作的文章数据
                currArtData: {},
                // 组件间传值: 要求刷新文章列表数据
                flag_refreshArtTable: 0
            };
        },
        methods: {
            // 获取配置/权限等信息
            getSettingData() {
                this.loading = true;
                getAutoGenArtSetting({
                    orgId: this.enterpriseId,
                    userId: this.userId
                }).then(res => {
                    if (res.code === '1') {
                        // 是否使用过此功能(充值过金额)
                        this.haveUsed = !res.data.is_first_recharge;
                        // 是否具有管理权限
                        this.manageRole = res.data.is_have_subordinates;
                        // // 剩余金额
                        // this.balance = res.data.balance_amount;
                        // 剩余文章数
                        this.balanceArtNum = res.data.remaining_post_count;
                        // 是否允许新建任务
                        this.allowCreateTask = res.data.allow_create_task;
                    } else {
                        this.$Message.error(this.$t('autoGenArticle.error_getSettingData'));
                    }
                    this.loading = false;
                }).catch(e => {
                    this.$Message.error(this.$t('autoGenArticle.error_getSettingData'));
                    this.loading = false;
                });
            },

            // 新建任务
            handleCreateTask() {
                // 清空"当前任务"数据
                this.currTaskData = {};
                this.currCompo = 'NewTask';
                this.$nextTick(() => {
                    this.currTaskData = {};
                });
            },
            // 编辑任务
            handleEditTask(taskData) {
                this.currTaskData = {};
                this.currCompo = 'NewTask';
                this.$nextTick(() => {
                    this.currTaskData = taskData;
                });
            },
            // 展示任务详情
            handleShowTaskDetail(taskData) {
                this.currTaskData = {};
                this.currCompo = 'TaskDetail';
                this.$nextTick(() => {
                    this.currTaskData = taskData;
                });
            },
            // 返回上一组件
            goBack() {
                // 切换组件
                this.currCompo = this.compoPath[this.compoPath.length - 2] || 'AllTask';
            },
            // 组件要求刷新任务列表页
            handleRefreshTaskTable() {
                this.flag_refreshTaskTable++;
            },
            // 编辑文章
            handleEditArt(artData) {
                this.currArtData = {};
                this.currCompo = 'EditArticle';
                this.$nextTick(() => {
                    this.currArtData = artData;
                });
            },
            // 组件要求刷新文章列表页
            handleRefreshArtTable() {
                this.flag_refreshArtTable++;
            }
        },
        watch: {
            currCompo(val) {
                // 记录组件层级
                if (this.compoPath[this.compoPath.length - 2] === val) {
                    // 如果是回到上一组件, 直接从 path 数组去掉最新一个组件
                    this.compoPath.pop();
                } else {
                    // 否则, 是跳转到新组件, 则记录新组件到 path 数组
                    this.compoPath.push(val);
                }
            }
        },
        mounted() {
            this.currCompo = 'AllTask';
            this.getSettingData();
        }
    };
</script>

<style lang="less" scoped>
    .AutoGenArticle-noData {
        text-align: center;

        &-title {
            background: linear-gradient(275deg, rgba(255, 255, 255, 0.00) 0%, #FFF4ED 56.02%, rgba(255, 255, 255, 0.00) 100%);
            color: #FF752A;
            text-align: center;
            font-size: 20px;
            font-weight: 600;
            line-height: normal;
            margin-top: 15px;
            padding: 15px 380px;
        }

        &-content {
            margin: 95px 0 85px;
        }

        &-sloganItem {
            display: inline-block;
            width: 33.33%;

            &-title {
                color: #FF752A;
                text-align: center;
                font-size: 18px;
                font-weight: 600;
                line-height: 30px;
            }

            &-desc {
                color: #333;
                font-size: 14px;
                line-height: 30px;
            }

            &-img {
                margin-top: 30px;

                img {
                    width: 236px;
                    height: 180px;
                }
            }
        }

        &-contact {
            color: #333;
            font-size: 14px;
            line-height: 22px;

            i {
                display: inline-block;
                vertical-align: baseline;
                margin-right: 12px;
            }
        }
    }
</style>

<style lang="less">
    .AutoGenArticle {
        .el-tabs__item.is-active, .el-tabs__item:hover, .el-tabs__active-bar {
            color: #FF752A;
        }
    }
</style>
