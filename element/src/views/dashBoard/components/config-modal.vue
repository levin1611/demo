<template>
    <Modal :visible="visible"
           width="886px"
           :append-to-body="true"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           @close="handleModalClose" >
        <div slot="title">
            <h3>{{$t('dashBoardV2.Modal.title')}}</h3>
        </div>
        <Container class="container">
            <div class="menu_aside">
                <ul class="active_list">
                    <li v-for="item in componentsList"
                        class="active_list_item"
                        :class="{'is_active': item.i === kind}"
                        v-if="isShowComponent(item)">
                        <Checkbox :label="item.name"
                                  :checked="item.isShow"
                                  style="margin-right: 4px"
                                  @change="checked => handleStatusChange(checked,item)"></Checkbox>
                        <Tooltip :content="item.name" placement="right-start" v-if="item.i === 'WAWT'">
                            <span @click="changeView(item)" class="hoverBtn active_list_name">{{item.name}}</span>
                        </Tooltip>
                        <span @click="changeView(item)" class="hoverBtn active_list_name" v-else>{{item.name}}</span>
                    </li>
                </ul>
            </div>
            <Container>
                <div class="main_component">
                    <Component :is="view"
                        :kind="kind"
                        class="main_component_item"
                        v-if="refreshFlag"
                        :department_list="department_list"
                        :user_list="user_list"
                        :currentCurrency="currentCurrency"
                        :style="{height: componentHeight, width: componentWidth}">
                    </Component>
                </div>
            </Container>
        </Container>
        <div slot="footer">
            <Button @click="changeLayout(0)">{{$t('dashBoardV2.config.cancel')}}</Button>
            <Button type="primary" @click="changeLayout(1)" class="piwik_change_config" :disabled="!isAllUnchecked">{{$t('dashBoardV2.config.confirm')}}</Button>
        </div>

    </Modal>
</template>

<script>
    import { mapState } from 'vuex';
    import tableCard from './card-tables/index';
    import nameCard from './card-name';
    import taskCard from './card-task-list';
    import WAWT from './card-combined';
    // import epidemic from './card-epidemic';
    // import exchangeRate from './exchange-rate';
    import crmTasks from './card-placeholder/card-crmTasks-placeholder';
    import indexCanvas from './card-placeholder/card-canvas-placeholder';
    import defaultConfig from './card-tables/dashBoardConfig';
    import cardFollowUp from './card-follow-up';
    import clueStatistics from './card-clue-statistics';
    import salesclueInquiry from './card-sales-clueInquiry';
    import salesInquiryStatistics from './card-sales-inquiryStatistics';
    import touchPoint from './touchPoint';
    import dataOverview from './new-tables/dataOverview';
    import tableIndex from './new-tables/tableIndex';
    import tableCompletion from './new-tables/tableCompletion';
    import _ from 'lodash';

    export default {
        name: 'config-modal',
        props: [
            'visible',
            'isSales',
            'currentCurrency',
            'department_list',
            'user_list'
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
            dataOverview,
            tableIndex,
            tableCompletion
        },
        computed: {
            ...mapState({
                orgId: state => state.enterpriseId,
                userId: state => state.userId,
                config: state => state.dashboard.config,
                is_marketing_station: state => state.app.is_marketing_station
            }),
            configList() {
                // const tmp = this.$store.state.dashboard.config;
                // return this.isSales ? tmp : tmp.filter(item => item.component !== 'tableCard');
                // 如果是营销站，则只显示今日任务、名片、日历、客服在线时长四个组件
                return this.$store.state.dashboard.config;
            },
            isAllUnchecked() {
                let temp = this.isSales ? this.componentsList : this.componentsList.filter(item => item.component !== 'tableCard');
                return temp.some(item => item.isShow);
            }
        },
        data: () => {
            return  {
                view: 'nameCard',
                kind: 'nameCard',
                componentHeight: '356px',
                componentWidth: '583px',
                refreshFlag: true,
                componentsList: [],
                checkList: [],
                minimalCheck: 1, // 仪表盘最少有一个表在
            }
        },
        methods: {
            handleModalClose() {
                this.$emit('update:visible', false);
            },
            changeView(item) {
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
                })
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
                if (status === 1) {
                    const temp = this.componentsList.filter(item => item.isShow);
                    this.$emit('changeLayout', temp);
                } else {
                    this.$emit('changeLayout', this.config);
                }
                this.handleModalClose();
            },
            isShowComponent(item) {
                return ['tableCard', 'cardFollowUp', 'clueStatistics', 'salesclueInquiry', 'salesInquiryStatistics'].includes(item.component) ? this.isSales : true;
            },
            handleStatusChange(val, item) {
                const [...arr] = this.componentsList;
                arr.forEach(v => {
                    if (v.i === item.i) {
                        this.$set(v, 'isShow', val);
                    }
                });
                this.componentsList = arr;
                // this.componentsList.forEach(v => {
                //     if (item.i === v.i) {
                //         this.$set(v, 'isShow', val);
                //         console.log('======>', this.componentsList);
                //     }
                // })
                // 通过watch componentsList 监听其中isShow的数量 当只剩下一个isShow为true 提示
            }

        },
        mounted() {
            // this.init();
        },
        created() {
            let arr = [];
            let temp = [];
            defaultConfig.forEach(item => {
                // 如果是营销站，则只显示今日任务、名片、日历、客服在线时长四个组件
                if (this.is_marketing_station) {
                    const marketingStationArr = ['taskCard', 'nameCard', 'crmTasks', 'indexCanvas'];
                    if (marketingStationArr.includes(item.component)) {
                        temp.push(this.$deepClone(item));
                    }
                } else {
                    temp.push(this.$deepClone(item));
                }
            })
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
        }
    };
</script>

<style scoped lang="less">
    .container {
        width: 825px;
        height: 442px;
        display: flex;
        border: 1px solid #EAEAEA;
        .menu_aside {
            width: 200px;
            min-width: 200px;
            max-width: 200px;
            flex-basis: 200px;
            overflow: auto;
        }
        .main_component {
            background: #F5F6F9;
            width: 100%;
            height: 100%;
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
        padding-top: 8px;
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
