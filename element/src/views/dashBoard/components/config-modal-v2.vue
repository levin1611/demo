<template>
    <Modal :visible="visible"
           width="990px"
           style="margin-top: -9vh;"
           :append-to-body="true"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           v-dialog-drag
           @close="handleModalClose" >
        <div slot="title" style="margin-bottom:-10px;margin-left:4px">
            <h3 style="font-size: 18px;color:#333">{{$t('dashBoardV2.Modal.title')}} <span style="font-size: 12px;font-weight: 400;color:#333">{{$t('dashBoardV2.tabs.modalTips')}}</span></h3>
            <!-- <h4>在左侧组件区域选择要显示的组件，在右侧预览区域选中图标组件可拖动排序</h4> -->
        </div>
        <Container class="container">
            <div class="menu_aside">
                <!-- <div>
                    <p class="active_title_header">
                        <span class="active_title">首页</span>
                        <span class="active_title_checkoutAll" @click="checkoutAll()">{{!isCheckAll ? '取消全选' : '全选'}}</span>
                    </p>
                    <div class="active_list_box">
                        <ul class="active_list">
                            <template  v-for="(item, index) in home">
                                <li v-if="index%2 === 0" :key="'home' + index" class="active_list_item">
                                    <Checkbox :label="item.name" v-model="item.isShow"
                                                style="margin-right: 4px"></Checkbox>
                                    <span class="hoverBtn active_list_name">{{item.name}}</span>
                                </li>
                            </template>
                        </ul>
                        <ul class="active_list">
                            <template  v-for="(item, index) in home">
                                <li v-if="index%2 === 1" :key="'home' + index" class="active_list_item">
                                    <Checkbox :label="item.name" v-model="item.isShow"
                                                style="margin-right: 4px"></Checkbox>
                                    <span class="hoverBtn active_list_name">{{item.name}}</span>
                                </li>
                            </template>
                        </ul>
                    </div>                 
                </div>
                <div style="margin-top: 8px;">
                    <p class="active_title_header">
                        <span class="active_title">资源</span>
                    </p>
                    <div class="active_list_box">
                        <ul class="active_list">
                            <template  v-for="(item, index) in resource">
                                <li v-if="index%2 === 0" :key="'resource' + index" class="active_list_item">
                                    <Checkbox :label="item.name" v-model="item.isShow"
                                                style="margin-right: 4px"></Checkbox>
                                    <span class="hoverBtn active_list_name">{{item.name}}</span>
                                </li>
                            </template>
                        </ul>
                        <ul class="active_list">
                            <template  v-for="(item, index) in resource">
                                <li v-if="index%2 === 1" :key="'resource' + index" class="active_list_item">
                                    <Checkbox :label="item.name" v-model="item.isShow"
                                                style="margin-right: 4px"></Checkbox>
                                    <span class="hoverBtn active_list_name">{{item.name}}</span>
                                </li>
                            </template>
                        </ul>
                    </div>
                </div> -->
                <div :style="{marginTop: i === 0 ? '0px' : '8px'}" v-for="(v, i) in showTabsList" :key="v.id">
                    <p class="active_title_header">
                        <span class="active_title">{{v.name}}</span>
                        <span v-if="i === 0" class="active_title_checkoutAll" @click="checkoutAll()">{{!isCheckAll ? $t('dashBoardV2.tabs.deselectAll') : $t('dashBoardV2.tabs.selectAll')}}</span>
                    </p>
                    <div class="active_list_box">
                        <ul class="active_list">
                            <template v-for="(item, index) in v.list">
                                <li v-if="!item.hide"
                                    :key="v.i + index"
                                    class="active_list_item">
                                    <Checkbox :label="item.name" v-model="item.isShow"
                                                style="margin-right: 4px" @change="handleStatusChange(item, v)"></Checkbox>
                                    <span class="hoverBtn active_list_name">{{item.name}}</span>
                                </li>
                            </template>
                        </ul>
                    </div>
                </div>
            </div>
            <div>
                <p style="margin-bottom: 12px;">{{$t('dashBoardV2.tabs.preview')}}</p>
                <div class="main_component">
                    <ul class="configs-modal-tabs">
                        <li :class="{'active': item.id === activeTab.id }" v-for="(item, index) in showTabsList" :key="item.id" @click="checkoutTabs(item)">{{item.name}}</li>
                        <!-- <li>资源</li>
                        <li>过程报表</li> -->
                    </ul>
                    <div style="width: 100%;height:100%;overflow-y: scroll;">
                        <GridLayout
                            v-if="!loading"
                            :layout.sync="activeItem"
                            :col-num="2"
                            :row-height="1"
                            :is-draggable="true"
                            :is-resizable="false"
                            :margin="[10, 10]"
                            :use-css-transforms="false"
                            :vertical-compact="true"
                            style="margin-bottom: 20px;">
                            <template v-for="item in activeItem">
                                <GridItem v-if="item.isShow && !item.hide"
                                    :x="item.x"
                                    :y="item.y"
                                    :w="item.w"
                                    :h="item.h"
                                    :i="item.i"
                                    :key="item.i"
                                    drag-ignore-from="svg">
                                    <div :class="item.icon" class="chart-pic">
                                        <p>{{item.name}}</p>
                                        <img :class="item.i + 'cls'" :src="require(`@/assets/images/${item.icon}.png`)" alt="">
                                    </div>
                                </GridItem>
                            </template>
                        </GridLayout>
                    </div>
                    <!-- <Component :is="view"
                               :kind="kind"
                               class="main_component_item"
                               v-if="refreshFlag"
                               :style="{height: componentHeight, width: componentWidth}">
                    </Component> -->
                </div>
            </div>
        </Container>
        <div slot="footer" style="margin-right: 4px">
            <Button @click="handleModalClose">{{$t('dashBoardV2.config.cancel')}}</Button>
            <Button type="primary" @click="changeLayout(1)" class="piwik_change_config">{{$t('dashBoardV2.config.confirm')}}</Button>
        </div>

    </Modal>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import tableCard from './card-tables/index';
    import nameCard from './card-name';
    import taskCard from './card-task-list';
    import WAWT from './card-combined';
    // import epidemic from './card-epidemic';
    // import exchangeRate from './exchange-rate';
    import crmTasks from './card-placeholder/card-crmTasks-placeholder';
    import indexCanvas from './card-placeholder/card-canvas-placeholder';
    import defaultConfig from '../dashBoardConfig';
    import cardFollowUp from './card-follow-up';
    import clueStatistics from './card-clue-statistics';
    import salesclueInquiry from './card-sales-clueInquiry';
    import salesInquiryStatistics from './card-sales-inquiryStatistics';
    import VueGridLayout from 'vue-grid-layout';
    import touchPoint from './touchPoint';
    import { HANDLE_BUTTON } from '@/api/config';
    import { getDashboardModule, saveDashBoardConfig } from '@/api/dashBoard/dashBoardV2';
    import { env } from '@/../build/config';
    import _ from 'lodash';

    export default {
        name: 'config-modal',
        props: [
            'visible',
            'isSales'
        ],
        components: {
            tableCard,
            nameCard,
            taskCard,
            WAWT,
            // epidemic,
            // exchangeRate,
            crmTasks,
            indexCanvas,
            cardFollowUp,
            clueStatistics,
            salesclueInquiry,
            salesInquiryStatistics,
            touchPoint,
            GridLayout: VueGridLayout.GridLayout,
            GridItem: VueGridLayout.GridItem
        },
        computed: {
            ...mapState({
                orgId: state => state.enterpriseId,
                userId: state => state.userId,
                config: state => state.dashboard.config,
                is_marketing_station: state => state.app.is_marketing_station,
                googleMarketing_btn_list: state => state.dashboard.button_ids,
                button_list: state => state.app.button_list
            }),
            ...mapGetters(['isContainsMenu']),
            configList() {
                // const tmp = this.$store.state.dashboard.config;
                // return this.isSales ? tmp : tmp.filter(item => item.component !== 'tableCard');
                // 如果是营销站，则只显示今日任务、名片、日历、客服在线时长四个组件
                return this.$store.state.dashboard.config;
            },
            isAllUnchecked() {
                let temp = this.isSales ? this.componentsList : this.componentsList.filter(item => item.component !== 'tableCard');
                return temp.some(item => item.isShow);
            },
            googleMarketing_btn() {
                return !HANDLE_BUTTON(this.googleMarketing_btn_list.googleMarketing[env], this.button_list);
            },
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
            },
            // 可展示的 tabs 列表
            showTabsList() {
                return this.tabslist.filter(item => item.isShow !== false);
            }
        },
        data() {
            return {
                view: 'nameCard',
                kind: 'nameCard',
                componentHeight: '356px',
                componentWidth: '583px',
                refreshFlag: true,
                componentsList: [],
                checkList: [],
                minimalCheck: 1, // 仪表盘最少有一个表在
                isCheckAll: false,
                // activeItem: defaultConfig.home,

                // 右侧栅格系统显示的数据
                // 栅格系统会自动调整组件的部分坐标, 因此组件变动后需要更新此数据到 tab.list 中, 保存时也需要按最新数据保存
                activeItem: [
                    // 数据概览
                    { x: 0, y: 0, w: 12, h: 8, i: 'dataOverview', component: 'dataOverview', icon: 'dataOverview', status: 1, isShow: true, name: this.$t('dashBoardV2.Title.dataOverview') },
                    // 业绩完成情况
                    { x: 0, y: 8, w: 6, h: 16, i: 'completion', component: 'tableCompletion', icon: 'completion', status: 1, isShow: true, name: this.$t('dashBoardV2.Title.completion') },
                    // 年度业绩概览
                    { x: 6, y: 8, w: 6, h: 16, i: 'targetOverview', component: 'tableCard', icon: 'targetOverview', status: 1, isShow: true, name: this.$t('dashBoardV2.Title.targetOverview') },
                    // 今日任务
                    { x: 0, y: 24, w: 6, h: 16, i: 'taskCard', component: 'taskCard', icon: 'taskCard', status: 1, isShow: true, name: this.$t('dashBoardV2.Title.task') },
                    // 跟进任务
                    { x: 6, y: 24, w: 6, h: 16, i: 'cardFollowUp', component: 'cardFollowUp', icon: 'cardFollowUp', status: 1, isShow: true, name: this.$t('dashBoardV2.Title.followUpTask') },
                    // 员工待办事项
                    { x: 0, y: 40, w: 12, h: 16, i: 'todoList', component: 'tableCard', icon: 'todoList', status: 1, isShow: true, name: this.$t('dashBoardV2.Title.todoList') },
                    // 日历
                    { x: 0, y: 56, w: 12, h: 34, i: 'crmTasks', component: 'crmTasks', icon: 'crmTasks', status: 1, isShow: true, name: this.$t('dashBoardV2.Title.crmTasks') },
                    // 货币兑换 & WhatsApp 号码归属地查询
                    { x: 0, y: 90, w: 6, h: 16, i: 'WAWT', component: 'WAWT', icon: 'WAWT', isShow: true, status: 1, name: this.$t('dashBoardV2.Title.WAWT') },
                    // 我的名片
                    { x: 6, y: 90, w: 6, h: 16, i: 'nameCard', component: 'nameCard', icon: 'nameCard', status: 1, isShow: true, name: this.$t('dashBoardV2.Title.nameCard') },
                ],
                tabslist: [],
                // tabslist: [
                //     {
                //         id: 'home',
                //         name: '首页',
                //         list: [
                //             { id: 1, name: '数据概览', x: 0, y: 0, w: 12, h: 2.5, i: 0, icon: 'type-list-12', classname: 'dataOverview', isShow: true },
                //             // { id: 2, name: '倒计时', x: 6, y: 1, w: 6, h: 1, i: 1 },
                //             { id: 3, name: '今日任务', x: 6, y: 2, w: 6, h: 3, i: 2, icon: 'type-task', classname: 'taskToday', isShow: true },
                //             { id: 4, name: '日历', x: 0, y: 4, w: 12, h: 3, i: 3, icon: 'type-task-rili', classname: 'calendar', isShow: true },
                //             { id: 5, name: '业绩完成情况', x: 0, y: 1, w: 6, h: 3, i: 4, icon: 'type-col-line', classname: 'performance-completion', isShow: true },
                //             { id: 6, name: '名片', x: 6, y: 5, w: 6, h: 3, i: 5, icon: 'type-task', classname: 'calling-card', isShow: true },
                //             // { id: 7, name: '业绩完成情况', x: 0, y: 1, w: 6, h: 1, i: 6 },
                //             { id: 8, name: '年度业绩概览', x: 0, y: 2, w: 6, h: 3, i: 7, icon: 'time-line-1', classname: 'year-overview', isShow: true },
                //             { id: 9, name: '员工待办', x: 0, y: 3, w: 12, h: 3, i: 8, icon: 'type-list-12', classname: 'in-hand', isShow: true },
                //             { id: 10, name: '倒计时', x: 6, y: 1, w: 6, h: 3, i: 9, icon: 'type-timeout', classname: 'count-down', isShow: true },
                //             { id: 11, name: 'WhatsApp 归属地查询&货币兑换', x: 0, y: 5, w: 6, h: 3, i: 10, icon: 'type-task', classname: 'WhatsApp', isShow: true }
                //         ]
                //     },
                //     {
                //         id: 'resource',
                //         name: '资源',
                //         list: [
                //             { id: 1, name: '重点跟进询盘', x: 0, y: 0, w: 12, h: 2.5, i: 0, icon: 'type-list-12', classname: 'dataOverview', isShow: true },
                //             { id: 2, name: 'CRM 资源分布', x: 6, y: 1, w: 6, h: 3, i: 1, icon: 'type-task', classname: 'taskToday', isShow: true },
                //             { id: 3, name: 'CRM 资源处理情况', x: 0, y: 3, w: 12, h: 2.5, i: 2, icon: 'type-list-12', classname: 'dataOverview', isShow: true },
                //             { id: 4, name: '定制-线索统计', x: 0, y: 5, w: 12, h: 2.5, i: 3, icon: 'type-list-12', classname: 'dataOverview', isShow: true },
                //             { id: 5, name: '定制-销售不同跟进阶段的询盘统计', x: 6, y: 6, w: 6, h: 3, i: 4, icon: 'type-task', classname: 'taskToday', isShow: true },
                //             { id: 6, name: '重点跟进客户', x: 0, y: 1, w: 6, h: 3, i: 5, icon: 'type-task', classname: 'taskToday', isShow: true },
                //             { id: 7, name: '员工资源统计', x: 0, y: 2, w: 12, h: 2.5, i: 6, icon: 'type-list-12', classname: 'dataOverview', isShow: true },
                //             { id: 8, name: '渠道资源转化', x: 0, y: 4, w: 6, h: 3, i: 7, icon: 'type-task', classname: 'taskToday', isShow: true },
                //             { id: 9, name: '定制-销售负责的线索和询盘统计', x: 0, y: 6, w: 6, h: 3, i: 8, icon: 'type-task', classname: 'taskToday', isShow: true }
                //         ]
                //     },
                //     {
                //         id: 'course',
                //         name: '过程报表',
                //         list: [
                //             { id: 1, name: '工作量统计', x: 0, y: 0, w: 12, h: 2.5, i: 0, icon: 'type-list-12', classname: 'dataOverview', isShow: true },
                //             { id: 2, name: '未跟进客户概览', x: 0, y: 2, w: 6, h: 3, i: 1, icon: 'type-task', classname: 'taskToday', isShow: true },
                //             // { id: 3, name: '询盘失败原因' },
                //             { id: 4, name: '邮件收发情况', x: 0, y: 3, w: 12, h: 2.5, i: 2, icon: 'type-list-12', classname: 'dataOverview', isShow: true },
                //             { id: 5, name: '网站客服在线时长', x: 0, y: 5, w: 12, h: 2.5, i: 3, icon: 'type-list-12', classname: 'dataOverview', isShow: true },
                //             { id: 6, name: '跟进记录统计', x: 0, y: 1, w: 12, h: 2.5, i: 4, icon: 'type-list-12', classname: 'dataOverview', isShow: true },
                //             { id: 7, name: '邮件处理', x: 6, y: 2, w: 6, h: 3, i: 5, icon: 'type-task', classname: 'taskToday', isShow: true },
                //             { id: 8, name: 'WhatsApp 联系人', x: 0, y: 4, w: 12, h: 2.5, i: 6, icon: 'type-list-12', classname: 'dataOverview', isShow: true }
                //         ]
                //     }
                // ],

                // 当前显示的 tab
                activeTab: {},
                loading: false,
                home: defaultConfig[0],
                resource: defaultConfig[1],
                course: defaultConfig[2],
                marketing: defaultConfig[3],
                saleCompontent: ['tableCard', 'cardFollowUp', 'clueStatistics', 'salesclueInquiry', 'salesInquiryStatistics'],
                defaultConfig: []
            };
        },
        methods: {
            // 切换tab
            checkoutTabs(tabItem) {
                let arr = [];
                this.loading = true;
                // 切换时保存下来活动项
                this.activeTab.list.forEach(tabCompo => {
                    // 取右侧栅格系统的数据来更新左侧 tab.list , 不存在的数据则隐藏
                    const tmp = this.activeItem.find(item => tabCompo.i === item.i);
                    if (tmp) {
                        tabCompo = tmp;
                    } else {
                        tabCompo.isShow = false;
                    }
                });
                this.activeTab = tabItem;
                arr = this.activeTab.list;
                this.activeItem = arr.filter(v => v.isShow && !v.hide);
                this.loading = false;
            },
            // 选中取消组件
            handleStatusChange(checkoutNode, tabItem) {
                if (tabItem.id !== this.activeTab.id) return;

                const activeItem = this.deepCloneList(this.activeItem);
                const index = activeItem.findIndex(item => item.i === checkoutNode.i);
                // 根据y坐标轴排序，获取最后一个组件
                const sortItem = this.deepCloneList(this.activeItem);
                const sortArr = sortItem.sort((a, b) => {
                    return b.y - a.y;
                });


                // 如果活动页列表查询到此组件
                if (checkoutNode.isShow) {
                    const lastItem = sortArr[0];
                    // 最后一行如果是100%,则直接追加到最后
                    if (lastItem.w === 2 || checkoutNode.w === 2) {
                        checkoutNode.y = lastItem ? lastItem.y + lastItem.h : 0;
                    } else {
                        // 查询最后一行是1/2，则需要判断最后一行是否全部占满
                        const sameItem = activeItem.filter(v => v.y === lastItem.y);
                        // 如果存在两个y相同的选项，这说明最后一行已经占满，则需要在最后一行追加
                        if (sameItem.length > 1) {
                            // 另起一行，追加在第一位
                            checkoutNode.y = lastItem ? lastItem.y + lastItem.h : 0;
                            checkoutNode.x = 0;
                        } else {
                            // 否则追加在最后一行
                            checkoutNode.y = lastItem ? lastItem.y : 0;
                            // 最后一行，二分之一组件的位置，如果x为0，则表明第一列有组件追加到第二列
                            // 如果x为0，则表明第二列有组件追加到第一列
                            checkoutNode.x = lastItem.x === 0 ? 1 : 0;
                        }
                    }
                    activeItem.push(checkoutNode);
                } else {
                    activeItem.splice(index, 1);
                }
                this.activeItem = this.deepCloneList(activeItem);
                this.activeTab.list.forEach(tabCompo => {
                    const tmp = this.activeItem.find(item => tabCompo.i === item.i);
                    if (tmp) {
                        tabCompo = tmp;
                    } else {
                        tabCompo.isShow = false;
                    }
                });
            },
            // 全选组件
            checkoutAll() {
                this.isCheckAll = !this.isCheckAll;
                this.tabslist.forEach(i => {
                    i.list.map((item, index) => {
                        item.isShow = !this.isCheckAll;
                    });
                });
                if (this.isCheckAll) {
                    this.activeItem = [];
                } else {
                    this.activeItem = this.activeTab.list.filter(v => v.isShow && !v.hide);
                }
            },
            handleModalClose() {
                this.$emit('update:visible', false);
            },
            changeView(item) {
                console.log('you just clicked', item);
                switch (item.i) {
                    case 'nameCard':
                        this.componentWidth = '583px';
                        this.componentHeight = '356px';
                        break;
                    case 'taskCard':
                    case 'business':
                    case 'workload':
                    case 'keyAccount':
                    case 'mail':
                    case 'todoList':
                    case 'crmTasks':
                    case 'indexCanvas':
                    case 'target':
                    case 'targetOverview':
                    case 'touchPoint':
                        this.componentWidth = '584px';
                        this.componentHeight = '380px';
                        break;
                    // case 'epidemic':
                    //     this.componentWidth = '584px';
                    //     this.componentHeight = '335px';
                    //     break;
                    default:
                        this.componentWidth = 'auto';
                        this.componentHeight = 'auto';
                        break;
                }
                this.view = item.component;
                this.kind = item.i;
                this.refreshFlag = false;
                this.$nextTick(() => {
                    this.refreshFlag = true;
                });
            },
            init() {
                let temp = this.$store.state.dashboard.config;
                let arr = [];
                temp.forEach(item => {
                    let t = _.cloneDeep(item);
                    arr.push(t);
                });
                this.componentsList = temp;
            },
            changeLayout(status) {
                if (status === 0) {
                    this.$emit('changeLayout');
                    return;
                }

                // 数据暂存
                const configData = this.deepCloneList(this.tabslist);

                // 判断每个分组是否至少选择一个组件
                if (!configData.every(item => item.isShow === false || item.list.find(v => v.isShow && !v.hide))) {
                    this.$Message.error('每个分组需要至少选择一个组件');
                    return;
                }

                // 数据处理
                configData.forEach(item => {
                    // 组件去掉临时添加的属性
                    item.list.forEach(compo => {
                        // // 如果此时组件不显示, 则将勾选状态也置为 false
                        // if (compo.hide) {
                        //     compo.isShow = false;
                        // }

                        // 去掉根据当前页面权限加上的"hide"属性
                        delete compo.hide;
                    });
                });

                // 发送请求
                saveDashBoardConfig({
                    orgId: this.orgId,
                    userId: this.userId,
                    constConfig: configData
                }).then(res => {
                    console.log(res);
                    if (res.code === '1') {
                        this.$emit('changeLayout');
                        this.$Message.success(this.$t('dashBoardV2.tips.saveSuccess'));
                    } else {
                        this.$Message.error(this.$t('dashBoardV2.tips.saveFailed'));
                    }
                });
                // if (status === 1) {
                //     const temp = this.componentsList.filter(item => item.isShow);
                //     this.$emit('changeLayout', temp);
                // } else {
                //     this.$emit('changeLayout', this.config);
                // }
                // this.handleModalClose();
            },
            isShowComponent(item) {
                return ['tableCard', 'cardFollowUp', 'clueStatistics', 'salesclueInquiry', 'salesInquiryStatistics'].includes(item.component) ? this.isSales : true;
            },
            deepCloneList(arr) {
                const temp = [];
                if (Array.isArray(arr)) {
                    arr.forEach(v => {
                        temp.push(this.$deepClone(v));
                    });
                };
                return temp;
            }

        },
        mounted() {
            // this.init();
            getDashboardModule({
                userId: this.userId,
                orgId: this.orgId
            }).then(res => {
                // 以默认配置初始化 tabslist
                this.tabslist = this.$deepClone(defaultConfig);

                // 默认赋值了默认配置给 tabslist , 如果接口有返回数据, 则使用接口数据覆盖默认配置
                if (res.code === '1' && Array.isArray(res.data)) {
                    // 暂存结果
                    const resData = res.data;

                    // 遍历全部配置项
                    this.tabslist.forEach(tabItem => {
                        // 获取与当前遍历的配置项匹配的结果数据
                        const resTab = resData.find(item => item.id === tabItem.id);

                        // 如果有匹配 + 如果匹配数据组件列表不为空, 则使用接口返回的数据
                        if (resTab && Array.isArray(resTab.list) && resTab.list.length) {
                            tabItem.list = resTab.list;
                        }
                    });
                    this.tabslist.map((v, index) => {
                        console.log(this.googleMarketing_btn);
                        if (v.id === 'marketing' && !this.googleMarketing_btn) {
                            this.tabslist.splice(index, 1);
                        }
                    });
                    console.log('-----', this.tabslist);
                }

                // 无论接口是否请求成功(请求失败则还是按默认配置), 遍历全部配置项, 进行其他处理
                this.tabslist.forEach(tabItem => {
                    if (!this.isSales) {
                        tabItem.list = tabItem.list.filter(item => !this.saleCompontent.includes(item.component));
                    }

                    // "网站"Tab 单独处理, 根据页面权限来判断"网站"tab及其下属组件是否显示
                    // watch authorityWebCompoList 也有同样的处理
                    if (tabItem.id === 'website') {
                        // 无权限显示任何组件, 则隐藏"网站"tab
                        if (!this.authorityWebCompoList.length) {
                            tabItem.isShow = false;
                        }

                        // 有权限显示部分组件, 则隐藏未授权的组件
                        tabItem.list.forEach(item => {
                            item.hide = !this.authorityWebCompoList.includes(item.i);
                        });
                    }

                    // 如果有未选中组件, 则显示【全选】按钮
                    if (!this.isCheckAll && tabItem.list.find(v => !v.isShow)) {
                        this.isCheckAll = true;
                    }
                });

                if (this.tabslist[0]) {
                    this.activeTab = this.tabslist[0];
                    this.activeItem = this.isSales ? this.tabslist[0].list.filter(item => item.isShow && !item.hide) : this.tabslist[0].list.filter(item => item.isShow && !item.hide && !this.saleCompontent.includes(item.component));
                }
            });
        },
        created() {
            let arr = [];
            let temp = [];
            defaultConfig[0].list.forEach(item => {
                // 如果是营销站，则只显示今日任务、名片、日历、客服在线时长四个组件
                if (this.is_marketing_station) {
                    const marketingStationArr = ['taskCard', 'nameCard', 'crmTasks', 'indexCanvas'];
                    if (marketingStationArr.includes(item.component)) {
                        temp.push(this.$deepClone(item));
                    }
                } else {
                    temp.push(this.$deepClone(item));
                }
            });
            if (this.configList.length > 0) {
                // 存在configList
                this.configList.forEach(item => {
                    let t = _.cloneDeep(item);
                    arr.push(t.i);
                });
                for (let i = 0; i < temp.length; i++) {
                    temp[i].isShow = arr.includes(temp[i].i);
                }
                this.componentsList = temp;
            } else {
                // configList为空的时候
                this.componentsList = temp;
                this.componentsList.forEach(item => item.isShow = false);
            }
            this.componentsList.forEach(com => {
                this.configList.forEach(config => {
                    if (com.i === config.i) {
                        this.$set(com, 'w', config.w);
                        this.$set(com, 'x', config.x);
                        this.$set(com, 'y', config.y);
                    }
                });
            });
        },
        watch: {
            // 根据页面权限来判断"网站"tab及其下属组件是否显示
            authorityWebCompoList: {
                handler(val) {
                    // 如果没有"网站"tab, 则不处理
                    const webTab = this.tabslist.find(item => item.id === 'website');
                    if (!webTab) return;

                    if (!val.length) {
                        // 无权限显示任何组件, 则隐藏"网站"tab

                        webTab.isShow = false;
                    } else {
                        // 有权限显示部分组件, 则隐藏未授权的组件

                        // 显示"网站"tab
                        webTab.isShow = true;
                        // 遍历"网站"tab下的组件, 根据权限来判断是否显示
                        Array.isArray(webTab.list) && webTab.list.forEach(item => {
                            item.hide = !val.includes(item.i);
                        });
                        // 如果当前正在编辑"网站"Tab, 则还需要更新 activeItem
                        if (this.activeTab.id === 'website') {
                            // 先保存现有数据
                            this.activeTab.list.forEach(tabCompo => {
                                const tmp = this.activeItem.find(item => tabCompo.i === item.i);
                                if (tmp) {
                                    tabCompo = Object.assign({}, tmp, { hide: tabCompo.hide });
                                } else {
                                    tabCompo.isShow = false;
                                }
                            });

                            // 重新赋值 activeItem
                            this.activeItem = this.activeTab.list.filter(v => v.isShow && !v.hide);
                        }

                        // 组件列表可能有变动, 但我看原逻辑就没有根据组件勾选状态来动态判断是否显示"全选/取消全选"按钮, 所以这里我也不处理想逻辑了
                    }
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .container {
        height: 570px;
        display: flex;
        margin-left: 4px;
        .menu_aside {
            width: 421px;
            min-width: 421px;
            max-width: 421px;
            flex-basis: 200px;
            overflow: auto;
            .active_list_box{
                display: flex;
                ul{
                    flex: 1;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: start;
                }
            }
            .active_title_header {
                padding-right: 40px;
                padding-bottom: 10px;
                .active_title {
                    color: #333333;
                    font-size: 14px;
                    font-weight: 600;
                }
                .active_title_checkoutAll {
                    &:hover{
                        color: #2D63B3
                    }
                    color: #3B78DE;
                    float: right;
                    cursor: pointer;
                }
            }
        }
        .chart-pic {
            background: #fff;
            color: #333;
            img{
                margin:  0 auto;
                width: 100%;
                height: 100%;
            }
        }
        .dataOverview img{
            margin-top: 12px!important;
        }
        .completion img{
            height: 100px;
            margin-top: 10px!important;
        }
        .targetOverview img{
            height: 60px;
            width: 88px;
            margin-top: 25px!important;
        }
        .taskCard img {
            height: 100px;
            margin-top: 10px!important;
            &.WAWTcls{
                height: 80px; 
            }
        }
        .indexCanvascls{
            width: 60%!important;
            margin-top: 60px!important;
        }
        .cardFollowUp img{
            height: 100px;
            margin-top: 10px!important;
        }
        .todoList img {
            margin-top: 10px!important;
        }
        .WAWT img {
            height: 60px;
            width: 88px;
            margin-top: 25px!important;
        }
        .nameCard img{
            height: 90px;
            margin-top: 10px!important;
        }
        .count-down img{
            height: 50px;
        }
        .taskToday img{
            height: 67px;
        }
        .in-hand img{
            height: 50px;
        }
        .calendar img{
            height: 50px;
        }
        .WhatsApp img{
            height: 50px;
        }
        .calling-card img{
            height: 50px;
        }
        .year-overview img {
            height: 50px;
        }
        .vue-grid-item{
            background: #fff;
            box-sizing: border-box;
            padding: 10px;
            border-radius: 3px;
            img{
                margin: 0 auto;
                display: block;
            }
        }
        .configs-modal-tabs {
            display: flex;
            padding: 0 10px;
            li {
                margin-right: 32px;
                cursor: pointer;
                color: #333;
                &.active{
                    color: #FF752A;
                    border-bottom:2px solid #FF752A;
                }
            }
        }
        .active_list_item{
            padding-left: 0px;
            line-height: 18px;
            padding-bottom: 10px;
            .active_list_name{
                width: 131px;
                margin-left: 8px;
                white-space: break-spaces;
                text-overflow: initial;
                word-break: break-all;
            }
        }
        .main_component {
            padding: 5px 10px 10px;
            background: #F5F6F9;
            width: 519px;
            height: 545px;
            overflow: hidden;
            position: relative;
            &_item {
                position: absolute;
                width: 95% !important;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        }
    }
    .hoverBtn {
        cursor: pointer
    }
    .active_list {
        // padding-top: 8px;
        &_item {
            line-height: 36px;
            padding-left: 23px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            /deep/ .el-checkbox__label {
                display: none;
            }
            display: flex;
            width: 50%;
        }
        &_name {
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0,0,0,0.80);
            letter-spacing: 0;
            line-height: 18px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            display: block;
            align-self: center;
        }
    }
    .is_active {
        background: #F5F6F9;
    }

</style>
