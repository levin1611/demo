<template>
    <div class="app">
        <div v-if="!isWAPersonalEdition && !is_marketing_station"
             @click="toggleConfig(true)"
             class="top_buttons">
            <div v-if="!isConfiguring" class="hoverBtn btn_list">
                <Select style="max-width: 80px; align-self: center; margin-right: 20px;"
                    @change="handleCurrencyChange"
                    v-model="currentCurrency">
                    <Option v-for="item in currencySymbol"
                            :value="item.code"
                            :label="item.symbol"
                            :key="item.code">
                        {{item.cn}}
                    </Option>
                </Select>
                <Icon custom="custom-web-set" size="14" style="color: #677f99;margin-right: 6px"></Icon>
                <span class="configure">{{$t('dashBoardV2.config.title')}}</span>
            </div>
            <div v-else class="btn_list">
                <Poptip placement="bottom-end"
                        width="278px"
                        v-model="isShowResetPop"
                        popper-class="resetPopper">
                    <span class="config_reset hoverBtn" slot="reference">{{$t('dashBoardV2.config.reset')}}</span>
                    <p class="reset-pop-tip">
                        <svg class="custom" style="width: 16px; height: 16px;display: inline-block;margin-right: 8px">
                            <use xlink:href="#custom-warning"></use>
                        </svg>
                        {{$t('dashBoardV2.tips.resetConfirm')}}
                    </p>
                    <div style="text-align: right">
                        <Button @click="isShowResetPop=false" class="pop_btn"><span>{{ $t('crm.Modal.modal_cancel') }}</span></Button>
                        <Button type="primary" @click="resetDashBoard" class="piwik_reset_config pop_btn"><span>{{ $t('crm.Modal.modal_ok') }}</span></Button>
                    </div>
                </Poptip>
                <Poptip placement="bottom-end"
                        width="378px"
                        v-model="isShowExitPop">
                    <p class="reset-pop-tip">
                        <svg class="custom" style="width: 16px; height: 16px;display: inline-block;margin-right: 8px">
                            <use xlink:href="#custom-warning"></use>
                        </svg>{{$t('dashBoardV2.tips.quitConfirm')}}</p>
                    <div style="text-align: right">
                        <Button @click="cancelConfig;isShowExitPop=false" class="pop_btn"><span>{{ $t('crm.Modal.modal_cancel') }}</span></Button>
                        <Button type="primary" @click="handleExitConfirm" class="pop_btn"><span>{{ $t('crm.Modal.modal_ok') }}</span></Button>
                    </div>
                    <Button class="_l_m_12" slot="reference" @click.stop>{{$t('dashBoardV2.config.exit')}}</Button>
                </Poptip>
                <Button class="_l_m_12" @click="showConfigModal">{{$t('dashBoardV2.config.add')}}</Button>
                <!-- <Button type="primary" class="_l_m_12 piwik_save_config" @click="saveConfig">{{$t('dashBoardV2.config.save')}}</Button> -->
            </div>
        </div>
        <div>
            <transition name="fade">
                <card-loading v-if="loading"></card-loading>
            </transition>
        </div>
        <div class="tabs-box" v-if="!isWAPersonalEdition && !is_marketing_station">
            <ul>
                <template v-for="(item, index) in compo_list">
                    <li v-if="!(item.name === 'marketing' && !googleMarketing_btn)" @click="checkType(item.id, item.name, index)" :class="{'active': tabIndex === index}" :key="index">{{item.title}}</li>
                </template>
            </ul>
        </div>
        <div class="tabs-box" v-else>
            <ul>
                <template v-for="(item, index) in compo_list_marketing">
                    <li v-if="item.isShow" @click="checkType(item.id, item.name, index)" :class="{'active': tabIndex === index}" :key="index">{{item.title}}</li>
                </template>
            </ul>
        </div>
        <div class="drag">
            <!-- <cardFollowUp></cardFollowUp> -->
            <GridLayout :layout.sync="layout"
                        :col-num="2"
                        :row-height="1"
                        :is-draggable="false"
                        :is-resizable="false"
                        :margin="[24, 24]"
                        :use-css-transforms="false"
                        :vertical-compact="true"
                        @layout-created="handleLayoutCreated"
                        @layout-updated="handleLayoutUpdated"
                        @layout-ready="handleLayoutReady">
                <GridItem v-for="item in layout"
                          :x="item.x"
                          :y="item.y"
                          :w="item.w"
                          :h="item.h"
                          :i="item.i"
                          :key="item.i"
                          drag-ignore-from="svg">
                    <Component v-if="!(item.i === 'googleMarketing' && !googleMarketing_btn)"
                               :is="item.component"
                               :kind="item.i"
                               :ref="item.i"
                               :department_list="department_list"
                               :user_list="user_list"
                               :site_list="site_list"
                               :form_list="form_list"
                               :service_list="service_list"
                               :syncTime="syncTime"
                               @removeFromDashBoard="removeFromDashBoard"
                               @updateTaskList="updateTaskList"
                               @refreshCalender="refreshCalender"
                               @updateTableFilterConObj="updateTableFilterConObj($event, item.i)"
                               :currentCurrency="currentCurrency"
                               style="height: 100%;"
                               fromModule="dashBoard"
                               class="_b_r" >
                               <span>
                                    <!-- 导出 -->
                                    <Tooltip v-if="item.i !== 'msgStatusStatistics'"
                                             :content="$t('dashBoardV2.Table.export')" effect="dark" placement="top">
                                        <Icon class="cursor-pointer"
                                              :class="!hideEnlargeBtn.includes(item.i) ? `marginLeft16 piwik-${item.i}-exportBtn` : `marginLeft16 piwik-${item.i}-exportBtn`"
                                              color="#677F99"
                                              custom="custom-icon_xiazai"
                                              size="20"
                                              @click="downloadReport(item)"></Icon>
                                    </Tooltip>

                                    <!-- 放大 -->
                                    <Tooltip :content="$t('BriefCase.filePreview.enlarge')" effect="dark" placement="top" v-if="!hideEnlargeBtn.includes(item.i)">
                                        <Icon class="cursor-pointer marginLeft16" :class="`piwik-${item.i}-enlargeBtn`" color="#677F99" custom="custom-fangda2" size="16" @click="showEnlargeModal(item)"></Icon>
                                    </Tooltip>
                                </span>
                    </Component>
                </GridItem>
            </GridLayout>
        </div>

        <configModalV2 :visible.sync="visible_config_modal"
                     v-if="visible_config_modal"
                     @changeLayout="changeLayout"
                     :isSales="isSales">
        </configModalV2>

        <!-- <configModal :visible.sync="visible_config_modal"
                    v-if="visible_config_modal"
                    @changeLayout="changeLayout"
                    :department_list="department_list"
                    :user_list="user_list"
                    :currentCurrency="currentCurrency"
                    :isSales="isSales">
        </configModal> -->
        <!-- 放大组件 -->
        <Modal :visible.sync="visibleEnlargeModal"
            custom-class="enlargeModal"
            width="886px"
            :show-close="false"
            :append-to-body="true"
            :close-on-click-modal="false"
            :close-on-press-escape="false">
            <div style="min-height: 450px">
                <Component :is="currentComponent.component"
                    v-if="visibleEnlargeModal"
                    from="Modal"
                    :kind="currentComponent.i"
                    :currentCurrency="currentCurrency"
                    :department_list="department_list"
                    :user_list="user_list"
                    :site_list="site_list"
                    :form_list="form_list"
                    :service_list="service_list"
                    :syncTime="syncTime"
                    @updateTableFilterConObj="updateTableFilterConObj($event, item.i)">
                    <span>
                        <Tooltip :content="$t('dashBoardV2.Table.export')" effect="dark" placement="top">
                            <Icon class="cursor-pointer marginLeft16" color="#677F99" custom="custom-icon_xiazai" size="20"  @click="downloadReport(currentComponent)"></Icon>
                        </Tooltip>
                        <Tooltip :content="$t('dashBoardV2.Table.reduction')" effect="dark" placement="top">
                            <Icon class="cursor-pointer marginLeft16" color="#677F99" custom="custom-suoxiao1" size="16" @click="visibleEnlargeModal = false"></Icon>
                        </Tooltip>
                    </span>
                </Component>
            </div>
        </Modal>
    </div>
</template>

<script>
    import tableCard from './components/card-tables/index';
    import canvasPlaceholder from './components/card-tables/canvas-placeholder';
    import piePlaceholder from './components/card-tables/pie-placeholder';
    import nameCard from './components/card-name';
    import taskCard from './components/card-task-list';
    import WAWT from './components/card-combined';
    // import epidemic from './components/card-epidemic';
    // import exchangeRate from './components/exchange-rate';
    import crmTasks from '../crm/WorkBench/crm-tasks/crm-tasks';
    import indexCanvas from './components/canvas';
    import configModal from './components/config-modal';
    import configModalV2 from './components/config-modal-v2';
    import { mapState, mapGetters } from 'vuex';
    import { getSalesList, getDashBoardConfig, saveDashBoardConfig, exportExcel, getAllMatomoSites, getAllMsgForm, getAllCustomerService, getWebDataSyncTime } from '@/api/dashBoard/dashBoardV2';
    import VueGridLayout from 'vue-grid-layout';
    import defaultConfig from './dashBoardConfig';
    import cardLoading from './components/card-loading';
    import cardFollowUp from './components/card-follow-up';
    import behaviorView from './components/behavior-view';
    import clueStatistics from './components/card-clue-statistics';
    import salesclueInquiry from './components/card-sales-clueInquiry';
    import salesInquiryStatistics from './components/card-sales-inquiryStatistics';
    import touchPoint from './components/touchPoint';
    import dataOverview from './components/new-tables/dataOverview';
    import tableIndex from './components/new-tables/tableIndex';
    import tableCompletion from './components/new-tables/tableCompletion';
    import dashBoardChart from './components/dashBoardChart';
    import { HANDLE_BUTTON } from '@/api/config';
    import Utils from '@/utils/index';
    import { env } from '@/../build/config';

    export default {
        name: 'testIndex.vue',
        components: {
            tableCard,
            canvasPlaceholder,
            piePlaceholder,
            nameCard,
            taskCard,
            WAWT,
            // epidemic,
            // exchangeRate,
            crmTasks,
            indexCanvas,
            configModal,
            configModalV2,
            cardLoading,
            GridLayout: VueGridLayout.GridLayout,
            GridItem: VueGridLayout.GridItem,
            cardFollowUp,
            behaviorView,
            // tableIndex,
            clueStatistics,
            salesclueInquiry,
            salesInquiryStatistics,
            touchPoint,
            dataOverview,
            tableIndex,
            tableCompletion,
            dashBoardChart
        },
        data() {
            return {
                layout: [],
                configLayout: [],
                isDraggable: false,
                visible_config_modal: false,
                isConfiguring: false, // 用来控制是否处于仪表盘配置状态
                isShowExitPop: false,
                isShowResetPop: false,
                isSales: false,
                loading: true,
                defaultConfigList: [],
                env,
                compo_list: [{
                    id: 1,
                    title: this.$t('dashBoardV2.tabs.frontPage'),
                    isShow: true,
                    name: 'home'
                }, {
                    id: 2,
                    title: this.$t('dashBoardV2.tabs.Resource'),
                    isShow: true,
                    name: 'resource'
                }, {
                    id: 3,
                    title: this.$t('dashBoardV2.tabs.processReport'),
                    isShow: true,
                    name: 'course'
                }],
                compo_list_marketing: [{
                    id: 1,
                    title: this.$t('dashBoardV2.tabs.frontPage'),
                    isShow: true,
                    name: 'home'
                }, {
                    id: 2,
                    title: this.$t('dashBoardV2.tabs.Resource'),
                    isShow: false,
                    name: 'resource'
                }, {
                    id: 3,
                    title: this.$t('dashBoardV2.tabs.processReport'),
                    isShow: true,
                    name: 'course'
                }],
                current_compo: 'tab1',
                bigComponent: {},
                showBigComponent: false,
                tabId: 1,
                tabIndex: 0,
                tabName: 'home',
                visibleEnlargeModal: false,
                currentComponent: {},
                currencySymbol: Utils.currencySymbol,
                currentCurrency: 'CNY',
                department_list: [],
                user_list: [],
                site_list: [],
                form_list: [],
                service_list: [],
                syncTime: {},
                downLoading: false,
                allDefaultConfig: [],
                layoutDefault: [],
                // 不显示放大按钮的组件
                hideEnlargeBtn: ['inquiryDistribution', 'todoList', 'focusedInquiry', 'employeeResources', 'companyDistribution', 'clueDistribution', 'websiteTrafficStatus', 'msgStatusStatistics', 'msgPageStatus', 'serviceWorkStatus', 'googleMarketing', 'behaviorView'],

                // 组件的数据接口请求参数, 以 kind 为 key , 以参数对象为 value
                tableFilterConObj: {}
            };
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                orgId: state => state.enterpriseId,
                is_marketing_station: state => state.app.is_marketing_station,
                filterParameters: state => state.dashboard.filterParameters,
                googleMarketing_btn_list: state => state.dashboard.button_ids,
                button_list: state => state.app.button_list
            }),
            ...mapGetters([
                'isWAPersonalEdition',
                'isContainsMenu'
            ]),
            googleMarketing_btn() {
                return !HANDLE_BUTTON(this.googleMarketing_btn_list.googleMarketing[env], this.button_list); 
            },
            // 判断是否显示"网站"tab(有<访客历史>、<我的聊天>、<网站留言>任意一个页面的权限)
            isHaveMarketingTabAuthority() {
                // 先禁用掉其他企业的"网站交互"Tab
                if (['10110'].includes(`${this.orgId}`)) {
                    return true;
                } else {
                    return false;
                }
            },
            // 判断是否显示"网站"tab(有<访客历史>、<我的聊天>、<网站留言>任意一个页面的权限)
            isHaveWebTabAuthority() {
                // // 先禁用掉其他企业的"网站交互"Tab
                // if (!['10110', '1001', '10304', '10171'].includes(`${this.orgId}`)) {
                //     return false;
                // }

                return this.isContainsMenu('visitor_history') || this.isContainsMenu('xhl_chat') || this.isContainsMenu('website_message');
            },
            // isConfig() {
            //     return this.$store.state.dashboard.isConfiguring;
            // },
            // configList() {
            //     return this.$store.state.dashboard.config;
            // }
            // 有权限显示的网站组件列表
            authorityWebCompoList() {
                const result = [];
                if (this.isContainsMenu('visitor_history')) {
                    result.push(...['webDataOverview', 'websiteTrafficStatus', 'visitorAnalysis', 'visitTrafficAnalysis']);
                }
                if (this.isContainsMenu('website_message')) {
                    result.push(...['msgStatusStatistics', 'msgPageStatus']);
                }
                if (this.isContainsMenu('xhl_chat')) {
                    result.push('serviceWorkStatus');
                }

                return result;
            }
        },
        created() {
            this.get_update_tree();
            this.allDefaultConfig = this.deepCloneList(defaultConfig);
            defaultConfig[this.tabIndex].list.forEach(item => {
                this.defaultConfigList.push(this.$deepClone(item));
            });
            if (localStorage.getItem('workBenchCurrency') && JSON.parse(localStorage.getItem('workBenchCurrency'))[this.userId]) {
                this.currentCurrency = JSON.parse(localStorage.getItem('workBenchCurrency'))[this.userId];
            }
            this.init();
        },
        methods: {
            showBig(item) {
                this.bigComponent = item;
                this.showBigComponent = true;
            },
            async checkType(id, name, index) {
                this.tabIndex = index;
                this.tabName = name;
                this.tabId = id;
                // this.defaultConfigList = defaultConfig[name];
                this.layout = [];
                this.configLayout = [];
                await this.getDashBoardConfig();
                this.getSales();
            },
            handleLayoutCreated() {
                /**
                 * 调用后台查询接口并根据是否是销售对tableCard组件进行控制显隐
                 * if success
                 *      this.layout = res.config
                 * else
                 *      this.layout = defaultConfig
                 * update vuex layout config
                 *      */
            },
            handleLayoutReady() {
                setTimeout(() => {
                    this.loading = false;
                }, 1000);
            },
            handleLayoutUpdated() {
                // 调用后台更新接口
            },
            configDashBoard() {
                this.isDraggable = true;
            },
            async cancelConfig() {
                await this.getDashBoardConfig();
                this.isDraggable = false;
                this.$store.commit('toggleConfigure', false);
            },
            showConfigModal() {
                this.visible_config_modal = true;
            },
            async init() {
                // 获取dashboardConfig
                await this.getDashBoardConfig();
                this.getSales();
            },
            async getDashBoardConfig() {
                // wa 个人版, 只显示默认数据
                if (this.isWAPersonalEdition) {
                    // const data = [{
                    //     component: 'WAWT',
                    //     w: 6,
                    //     moved: false,
                    //     x: 0,
                    //     h: 16,
                    //     name: '货币兑换 & WhatsApp 号码归属地查询',
                    //     y: 0,
                    //     i: 'WAWT',
                    //     isShow: true
                    // }, {
                    //     component: 'touchPoint',
                    //     w: 12,
                    //     moved: false,
                    //     x: 0,
                    //     h: 16,
                    //     name: 'WhatsApp',
                    //     y: 16,
                    //     i: 'touchPoint',
                    //     isShow: true
                    // }];
                    const data = [
                        {
                            id: 'home',
                            name: '首页',
                            list: [
                                // 货币兑换 & WhatsApp 号码归属地查询
                                { x: 0, y: 90, w: 1, h: 16, i: 'WAWT', component: 'WAWT', icon: 'WAWT', status: 1, isShow: true, name: this.$t('dashBoardV2.Title.WAWT') },
                            ]
                        },
                        {
                            id: 'resource',
                            name: '资源',
                            list: []
                        },
                        {
                            id: 'course',
                            name: '过程报表',
                            list: [
                                // WhatsApp
                                { x: 0, y: 64, w: 2, h: 16, i: 'touchPoint', component: 'touchPoint', icon: 'todoList', status: 3, isShow: true, name: this.$t('dashBoardV2.Title.touchPoint') },
                            ]
                        }
                    ];
                    this.layout = data[this.tabIndex].list;
                    this.layoutDefault = data[this.tabIndex].list;
                    this.$store.commit('setConfig', this.layoutDefault);
                    return;
                }

                const data = await getDashBoardConfig({
                    orgId: this.orgId,
                    userId: this.userId,
                    status: this.tabId
                });
                if (data.code === '1') {
                    const temp = data.data;
                    if (Array.isArray(temp) && temp.length) {
                        this.layoutDefault = temp.filter(v => v.isShow);
                        this.configLayout = temp.filter(v => v.isShow);
                    } else {
                        this.layoutDefault = this.deepCloneList(defaultConfig[this.tabIndex].list);
                        this.configLayout = defaultConfig[this.tabIndex].list;
                    }
                } else {
                    this.layoutDefault = this.deepCloneList(defaultConfig[this.tabIndex].list);
                    this.configLayout = defaultConfig[this.tabIndex].list;
                }
                // 如果是营销站，则只显示今日任务、名片、日历、客服在线时长四个组件
                if (this.is_marketing_station) {
                    const data = [
                        {
                            id: 'home',
                            name: '首页',
                            list: [
                                // 我的名片
                                { x: 1, y: 0, w: 1, h: 16, i: 'nameCard', component: 'nameCard', icon: 'nameCard', status: 1, isShow: true, name: this.$t('dashBoardV2.Title.nameCard') },
                                // 今日任务
                                { x: 0, y: 16, w: 1, h: 16, i: 'taskCard', component: 'taskCard', icon: 'taskCard', status: 1, isShow: true, name: this.$t('dashBoardV2.Title.task') },
                                // 日历
                                { x: 0, y: 56, w: 2, h: 34, i: 'crmTasks', component: 'crmTasks', icon: 'crmTasks', status: 1, isShow: true, name: this.$t('dashBoardV2.Title.crmTasks') },
                            ]
                        },
                        {
                            id: 'resource',
                            name: '资源',
                            list: []
                        },
                        {
                            id: 'course',
                            name: '过程报表',
                            list: [
                                // 客服在线时长
                                { x: 0, y: 80, w: 2, h: 23, i: 'indexCanvas', component: 'indexCanvas', icon: 'todoList', status: 3, isShow: true, name: this.$t('dashBoardV2.Title.indexCanvas') },
                            ]
                        }
                    ];
                    this.layout = data[this.tabIndex].list;
                    this.layoutDefault = data[this.tabIndex].list;
                }

                // 如果是"网站"Tab, 根据权限再做一次过滤处理
                if (`${this.tabId}` === '5') {
                    this.layout = this.layout.filter(item => this.authorityWebCompoList.includes(item.i));
                }

                // 这里更新的 vuex 好像没哪儿块儿用? 其他地方更新的逻辑好像也有问题, 它到底是更新 layout 还是更新 layoutDefault ?
                this.$store.commit('setConfig', this.layoutDefault);
            },
            // 非销售人员不显示以下组件：年度业绩概览、员工待办事项、业绩详情、重点跟进客户、工作量统计、客户跟进情况概览、未跟进客户概览、邮件处理、跟进任务、未跟进客户概览、线索统计、销售负责的线索和询盘统计、销售不同跟进阶段的询盘统计
            async getSales() {
                const data = await getSalesList({
                    orgId: this.orgId
                });
                if (data.data && Array.isArray(data.data)) {
                    this.isSales = data.data.some(person => person.id === Number(this.userId));
                    // this.layout.forEach(item => {
                    //     if (item.component === 'tableCard') {
                    //         item.h = this.isSales ? 16 : 0;
                    //     }
                    // });
                    this.layout = this.isSales ? this.layoutDefault : this.layoutDefault.filter(item => !['tableCard', 'cardFollowUp', 'clueStatistics', 'salesclueInquiry', 'salesInquiryStatistics'].includes(item.component));
                };

                // 如果是"网站"Tab, 根据权限再做一次过滤处理
                if (`${this.tabId}` === '5') {
                    this.layout = this.layout.filter(item => this.authorityWebCompoList.includes(item.i));
                }
            },
            async saveConfig() {
                if (this.layout.length === 0) {
                    this.$Message.error(this.$t('dashBoardV2.tips.OneReportWarning'));
                    return;
                }
                saveDashBoardConfig({
                    orgId: this.orgId,
                    userId: this.userId,
                    constConfig: this.allDefaultConfig
                }).then(res => {
                    console.log(res);
                    if (res.code === '1') {
                        this.$Message.success(this.$t('dashBoardV2.tips.saveSuccess'));
                        this.layout = [];
                        this.configLayout = [];
                        this.init();
                        this.toggleConfig(false);
                    } else {
                        this.$Message.error(this.$t('dashBoardV2.tips.saveFailed'));
                    }
                });
                // console.log(this.layout)
                // const temp = await saveDashBoardConfig({
                //     orgId: this.orgId,
                //     userId: this.userId,
                //     constConfig: this.layout
                // });
                // if (temp.code === '1') {
                //     this.$Message.success(this.$t('dashBoardV2.tips.saveSuccess'));
                //     this.toggleConfig(false);
                // } else {
                //     this.$Message.error(this.$t('dashBoardV2.tips.saveFailed'));
                // }
                // this.$store.commit('setConfig', this.layout);
            },
            toggleConfig(val) {
                this.isShowExitPop = false;
                this.isConfiguring = val;
                this.$store.commit('toggleConfigure', val);
            },
            removeFromDashBoard(val) {
                // todo here 完善只剩下一个的逻辑
                // 子应用跳转过来 直接对this.layout操作 视图不更新 bug:https://www.tapd.cn/51663361/bugtrace/bugs/view?bug_id=1151663361001017654&from=letter
                const layout = this.deepCloneList(this.layout);
                const index = layout.findIndex(item => item.i === val);
                layout.splice(index, 1);
                this.layout = this.deepCloneList(layout);
                this.layoutDefault = this.layoutDefault.filter(item => item.i !== val);
                this.$store.commit('setConfig', this.layout);
            },
            async resetDashBoard() {
                // this.layout = this.isSales ? this.deepCloneList(this.defaultConfigList) : this.deepCloneList(defaultConfig[this.tabIndex].list.filter(item => !['tableCard', 'cardFollowUp', 'clueStatistics', 'salesclueInquiry', 'salesInquiryStatistics'].includes(item.component)));
                // 如果是营销站，则只显示今日任务、名片、日历、客服在线时长四个组件
                // if (this.is_marketing_station) {
                //     const marketingStationArr = ['taskCard', 'nameCard', 'crmTasks', 'indexCanvas'];
                //     this.layout = this.layout.filter((item, index) => marketingStationArr.includes(item.i));
                // }
                // this.configLayout = this.defaultConfigList;
                this.isShowResetPop = false;
                this.isDraggable = false;
                this.$store.commit('toggleConfigure', false);
                await this.saveConfig();
            },
            showResetPop() {
                this.isShowResetPop = true;
            },
            async changeLayout(val) {
                this.init();
                this.isConfiguring = false;
                this.visible_config_modal = false;
                // this.layout = this.isSales ? val : val.filter(item => !['tableCard', 'cardFollowUp', 'clueStatistics', 'salesclueInquiry', 'salesInquiryStatistics'].includes(item.component));
                this.$store.commit('setConfig', this.layout);
                // await this.saveConfig();
                // const temp = await saveDashBoardConfig({
                //     orgId: this.orgId,
                //     userId: this.userId,
                //     constConfig: this.layout
                // });
            },
            updateTaskList() {
                if (this.$refs.taskCard && this.$refs.taskCard[0]) {
                    this.$refs.taskCard[0].getTaskList();
                }
            },
            refreshCalender() {
                if (this.$refs.crmTasks && this.$refs.crmTasks[0]) {
                    const calendarCompo = this.$refs.crmTasks[0];
                    calendarCompo.letCalendarRefresh = true;
                    calendarCompo.getWorkendTaskList();
                }
            },
            async handleExitConfirm() {
                /**
                 * 重新请求getConfig接口
                 * 退出配置状态
                 * */
                await this.getDashBoardConfig();
                this.getSales();
                this.toggleConfig(false);
            },
            deepCloneList(arr) {
                const temp = [];
                if (Array.isArray(arr)) {
                    arr.forEach(v => {
                        temp.push(this.$deepClone(v));
                    });
                };
                return temp;
            },
            handleCurrencyChange(val) {
                let obj = {};
                if (localStorage.getItem('workBenchCurrency')) {
                    obj = JSON.parse(localStorage.getItem('workBenchCurrency'));
                }
                obj[this.userId] = val;
                localStorage.setItem('workBenchCurrency', JSON.stringify(obj));
            },
            get_update_tree() {
                this.$commonApi.getCrmManageDepartments({
                    orgId: this.orgId,
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
                        orgId: this.orgId,
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
            // 获取所有 matomo 站点
            getAllSites() {
                this.site_list = [];
                getAllMatomoSites({
                    orgId: this.orgId
                }).then(res => {
                    if (res.code === '1' && Array.isArray(res.data)) {
                        this.site_list = res.data;
                    } else {
                        this.$Message.warning(res.data.msg);
                    }
                }).catch(e => {
                    this.$Message.error(this.$t('seo.detailSelect.errorMsg'));
                });
            },
            // 获取所有留言表单
            getAllForms() {
                this.form_list = [];
                getAllMsgForm({
                    orgId: this.orgId
                }).then(res => {
                    if (res.code === '1' && Array.isArray(res.data)) {
                        this.form_list = res.data;
                    } else {
                        this.$Message.warning(res.data.msg);
                    }
                }).catch(e => {
                    this.$Message.error(this.$t('seo.detailSelect.errorMsg'));
                });
            },
            // 获取所有客服
            getAllCustomerService() {
                this.service_list = [];
                getAllCustomerService({
                    orgId: this.orgId
                }).then(res => {
                    if (res.code === '1' && Array.isArray(res.data)) {
                        this.service_list = res.data;
                    } else {
                        this.$Message.warning(res.data.msg);
                    }
                }).catch(e => {
                    this.$Message.error(this.$t('seo.detailSelect.errorMsg'));
                });
            },
            // 获取网站交互数据统计截止时间
            getWebDataSyncTime() {
                getWebDataSyncTime({
                    orgId: this.orgId
                }).then(res => {
                    if (res.code === '1') {
                        this.syncTime = res.data;
                    } else {
                        this.syncTime = {};
                    }
                });
            },
            showEnlargeModal(data) {
                this.currentComponent = data;
                this.visibleEnlargeModal = true;
            },

            /* 导出 */
            downloadReport(data) {
                switch (data.i) {
                    case 'completion':
                    case 'googleMarketing':
                    case 'focusedInquiry':
                    case 'employeeResources':
                    case 'todoList': // 员工待办事项
                    case 'inquiryDistribution': // 询盘分布
                    case 'companyDistribution': // 客户分布
                    case 'clueDistribution': // 线索分布
                        this.commonExportExcel(data);
                        break;
                    case 'behaviorView':
                        this.exportBehaviorView(data);
                        break;
                    case 'websiteTrafficStatus':
                        this.exportWebsiteTrafficStatus(data);
                        break;
                    case 'visitorAnalysis':
                    case 'visitTrafficAnalysis':
                        this.exportVisitTrafficAnalysis(data);
                        break;
                    case 'msgPageStatus':
                        this.exportMsgPageStatus(data);
                        break;
                    case 'serviceWorkStatus':
                        this.exportServiceWork(data);
                        break;
                }
            },
            // 多个组件通用的导出方法
            commonExportExcel(data) {
                // 导出中 提示
                if (this.downLoading) {
                    this.$Message.error(this.$t('dashBoardV2.tips.downLoading'));
                    return;
                };

                // 开始导出 提示
                this.downLoading = true;
                this.$Message({
                    showClose: true,
                    message: this.$t('dashBoardV2.tips.downLoadTip'),
                    type: 'success',
                    duration: 2000
                });

                let reportType = '';
                switch (data.i) {
                    case 'completion':
                        reportType = 1;
                        break;
                    case 'focusedInquiry':
                        reportType = 2;
                        break;
                    case 'employeeResources':
                        reportType = 3;
                        break;
                    case 'todoList': // 员工待办事项
                        reportType = 7;
                        break;
                    case 'inquiryDistribution': // 询盘分布
                        reportType = 8;
                        break;
                    case 'companyDistribution': // 客户分布
                        reportType = 9;
                        break;
                    case 'clueDistribution': // 线索分布
                        reportType = 10;
                        break;
                    case 'googleMarketing':
                        reportType = 11;
                        break;
                }

                const filterParameters = this.filterParameters[data.i];
                exportExcel({
                    reportType,
                    orgId: this.orgId,
                    userId: this.userId,
                    currency: this.currentCurrency,
                    dimensionType: filterParameters.levelType === 'department' ? 1 : 2,
                    startDate: this.$dym.timeFormat(filterParameters.dateRange[0]),
                    endDate: this.$dym.timeFormat(filterParameters.dateRange[1]),
                    year: new Date(filterParameters.dateRange[0]).getFullYear(),
                    targetType: filterParameters.targetType,
                    userIdList: filterParameters.userIdList.length ? JSON.stringify(filterParameters.userIdList) : '',
                    departmentId: filterParameters.departmentId,
                    typeId: filterParameters.typeId,
                    campaignId: filterParameters.campaignId
                }).then(res => {
                    if (res.code === '1') {
                        window.open(res.data);
                    } else {
                        this.$Message.error(res.message);
                    }
                    this.downLoading = false;
                }).catch(() => {
                    this.downLoading = false;
                });
            },
            // 导出跟进记录
            exportBehaviorView(data) {
                const filterCon = this.tableFilterConObj[data.i];
                window.open(`${this.$util.ajaxUrl}/crm/funnelview/getBehaviorView/download?query=${encodeURIComponent(JSON.stringify(filterCon))}`);
            },
            // 导出网站流量数据
            exportWebsiteTrafficStatus(data) {
                const filterCon = this.tableFilterConObj[data.i];
                // const postData = {
                //     query: JSON.stringify(filterCon)
                // };
                // downloadWebsiteTrafficStatusData(postData).then(res => {
                //     if (res.code === '1') {
                //         window.open(res.data);
                //     } else {
                //         this.$Message.error(res.message);
                //     }
                //     this.downLoading = false;
                // }).catch(() => {
                //     this.downLoading = false;
                // });
                window.open(`${this.$util.internationalUrl}/piwik/visit/traffic/download?query=${encodeURIComponent(JSON.stringify(filterCon))}`);
            },
            // 导出访客相关数据
            exportVisitTrafficAnalysis(data) {
                const tableFilterCon = this.tableFilterConObj[data.i];
                // const postData = {
                //     query: JSON.stringify(tableFilterCon)
                // };
                // downloadVisitTrafficAnalysisData(postData).then(res => {
                //     if (res.code === '1') {
                //         window.open(res.data);
                //     } else {
                //         this.$Message.error(res.message);
                //     }
                //     this.downLoading = false;
                // }).catch(() => {
                //     this.downLoading = false;
                // });
                window.open(`${this.$util.internationalUrl}/piwik/visitor/analysis/download?query=${encodeURIComponent(JSON.stringify(tableFilterCon))}`);
            },
            // 导出留言页面情况数据
            exportMsgPageStatus(data) {
                const tableFilterCon = this.tableFilterConObj[data.i];
                // const postData = {
                //     query: JSON.stringify(tableFilterCon)
                // };
                // downloadMsgPageStatusData(postData).then(res => {
                //     if (res.code === '1') {
                //         window.open(res.data);
                //     } else {
                //         this.$Message.error(res.message);
                //     }
                //     this.downLoading = false;
                // }).catch(() => {
                //     this.downLoading = false;
                // });
                window.open(`${this.$util.internationalUrl}/piwik/form/search/download?query=${encodeURIComponent(JSON.stringify(tableFilterCon))}`);
            },
            // 导出客服工作状态相关数据
            exportServiceWork(data) {
                const tableFilterCon = this.tableFilterConObj[data.i];
                // const postData = {
                //     query: JSON.stringify(tableFilterCon)
                // };
                // downloadServiceWorkData(postData).then(res => {
                //     if (res.code === '1') {
                //         window.open(res.data);
                //     } else {
                //         this.$Message.error(res.message);
                //     }
                //     this.downLoading = false;
                // }).catch(() => {
                //     this.downLoading = false;
                // });

                window.open(`${this.$util.internationalUrl}/piwik/customer/service/download?query=${encodeURIComponent(JSON.stringify(tableFilterCon))}`);
            },

            // 更新组件的数据接口请求参数
            updateTableFilterConObj(obj, kind) {
                this.tableFilterConObj[kind] = obj;
            }
        },
        watch: {
            visible_config_modal: {
                handler(val) {
                    this.$store.commit('toggleShowAddModal', val);
                }
            },
            isHaveMarketingTabAuthority: {
                handler(val) {
                    // 如果需要显示"网站 Tab", 则追加 tab 并请求相关筛选条件
                    if (val && !this.compo_list.find(item => item.name === 'marketing')) {
                        this.compo_list.push({
                            id: 4,
                            title: this.$t('dashBoardV2.tabs.marketing'),
                            isShow: true,
                            name: 'marketing'
                        });
                    }
                },
                immediate: true
            },
            isHaveWebTabAuthority: {
                handler(val) {
                    // 如果需要显示"网站 Tab", 则追加 tab 并请求相关筛选条件
                    if (val && !this.compo_list.find(item => item.name === 'website')) {
                        this.getAllSites();
                        this.getAllForms();
                        this.getAllCustomerService();
                        this.getWebDataSyncTime();
                        this.compo_list.push({
                            id: 5,
                            title: this.$t('dashBoardV2.tabs.website'),
                            isShow: true,
                            name: 'website'
                        });
                    }
                },
                immediate: true
            },
            authorityWebCompoList: {
                handler(val) {
                    // 如果是"网站"Tab, 根据权限再做一次过滤处理
                    if (`${this.tabId}` === '5') {
                        this.layout = this.layoutDefault.filter(item => this.authorityWebCompoList.includes(item.i));

                        // 看其他地方 setConfig 更新 vuex 时机混乱 + 没用上 vuex 数据, 这里更新 layout 时干脆也不更新 vuex 了
                    }
                }
            }
        },
        beforeRouteLeave(to, from, next) {
            this.$store.commit('toggleConfigure', false);
            next();
        }
    };
</script>

<style scoped lang="less">
    .app {
        height: 100%;
        width: 100%;
        overflow: hidden;
        position: relative;
        background: #F5F6F9;
        .drag {
            margin-left: 6px;
            margin-top: 10px;
            margin-right: 6px;
            overflow: auto;
            height: 100%;
        }
        .top_buttons {
            position: absolute;
            right: 38px;
            display: flex;
            height: 48px;
            .btn_list {
                align-self: center;
            }
            .config_reset {
                font-family: PingFangSC-Regular;
                font-size: 12px;
                color: rgba(0,0,0,0.60);
                letter-spacing: 0;
                line-height: 18px;
            }
            .configure {
                font-size: 12px;
                color: rgba(0,0,0,0.80);
                letter-spacing: 0;
                line-height: 18px;
            }
        }
        .tabs-box{
            margin-left: 30px;
            ul {
                display: flex;
                padding-top: 14px;
                li{
                    margin-right: 28px;
                    cursor: pointer;
                    color: #333;
                    font-size: 16px;
                    &.active{
                        color: #FF752A;
                        position: relative;
                        border-bottom: 2px solid #FF752A;
                    }
                }
            }
        }
    }
    ._l_m_12 {
        margin-left: 12px;
    }
    .hoverBtn {
        &:hover {
            cursor: pointer;
            color: #3b78de !important;
        }
    }
    .b-r {
        border-radius: 8px;
    }
    .placeholder_image_container {
        width: 100%;
        height: 378px;
        position: relative;
        z-index: 1;
        /*opacity: 0.58;*/
        /*filter: alpha(opacity=58);*/
        .img_cover {
            width: 100%;
            position: absolute;
            z-index: 2;
            top: 0;
            left: 0;
            text-align: center;
            bottom: 0;
            opacity: .33;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            h2 {
                opacity: 1;
                z-index: 999;
            }
        }
    }
    .reset-pop-tip {
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: rgba(0,0,0,0.80);
        letter-spacing: 0;
        line-height: 18px;
        margin: 30px;
    }
    .resetPopper {
        height: 147px;
    }
    .pop_btn {
        width: 50px;
        height: 28px;
        font-size: 12px;
        position: relative;
        span {
            display: block;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }
    .vue-grid-layout {
        top: -24px;
        margin-bottom: 48px;
    }
</style>
<style lang="less">
    .enlargeModal{
        .el-dialog__header {
            display: none;
        }
        .el-dialog__body {
            padding: 0;
        }
    }
    .app {
        .el-table {
            color: #333;
        }
        .el-table thead{
            color: #333;
        }
    }
</style>
