<template>
    <Card class="card-box">
        <div class="card-box-title" style="margin-bottom:10px">
            <span class="title">{{tableTilte}} <HelpTip :title="helpTipTitle" :iconSize="14"></HelpTip></span>
            <div class="card-box-filter">
                <ButtonGroup>
                    <Tooltip :content="$t('dashBoardV2.Table.chartView')" effect="dark" placement="top">
                        <Button type="minor"
                            style="padding: 6px 7px"
                            :class="filterParameters.viewType === echartView[kind] ? 'active' : ''"
                            @click="handleclick('viewType', echartView[kind])">
                            <Icon custom="custom-icon_yibiaopan_tubiaoshitu" size="16"/>
                        </Button>
                    </Tooltip>
                    <Tooltip :content="$t('dashBoardV2.Table.tableView')" effect="dark" placement="top">
                        <Button type="minor"
                            style="padding: 6px 7px"
                            :class="filterParameters.viewType === 'tableView' ? 'active' : ''"
                            @click="handleclick('viewType', 'tableView')">
                            <Icon custom="custom-icon_yibiaopan_biaogeshitu" size="16"/>
                        </Button>
                    </Tooltip>
                </ButtonGroup>
                <slot></slot>
            </div>
        </div>
        <div class="card-box-title" style="margin-bottom:20px">
            <div>
                <CardFilter :cardType="kind"
                    filterType="dateMothe"
                    filterKey="dateRange"
                    :filterValue="filterParameters.dateRange"
                    @handleFilter="handleFilter"></CardFilter>
            </div>
            <div class="card-box-filter">
            <!-- 部门与员工切换 -->
                <ButtonGroup class="marginRight8">
                    <Button type="minor"
                        :class="filterParameters.levelType === 'person' ? 'active' : ''"
                        @click="handleclick('levelType', 'person')">
                        {{$t('dashBoardV2.Table.person')}}
                    </Button>
                    <Button type="minor"
                        :class="filterParameters.levelType === 'department' ? 'active' : ''"
                        @click="handleclick('levelType', 'department')">
                        {{$t('dashBoardV2.Select.department')}}
                    </Button>
                </ButtonGroup>
                <!-- 部门筛选 -->
                <departmentFilter class="marginRight8"
                    v-if="filterParameters.levelType === 'department'"
                    :cardType="kind"
                    :filterValue="filterParameters.departmentId"
                    :department_list="department_list"
                    @handleFilter="handleclick"></departmentFilter>
                <!-- 员工筛选 -->
                <personFilter class="marginRight8"
                    v-if="filterParameters.levelType === 'person'"
                    :cardType="kind"
                    :department_list="department_list"
                    :user_list="user_list"
                    :filterValue="filterParameters.userIdList"
                    @handleFilter="handleclick"></personFilter>
                <!-- 业绩完成情况Select-->
                <Select v-model="filterParameters.targetType"
                    style="width: 104px; font-size:12px">
                    <Option
                        v-for="item in selectOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></Option>
                </Select>
            </div>
        </div>
        <div class="card-box-body">
            <Component
                ref="viewType"
                :from="from"
                :is="filterParameters.viewType"
                :filterParameters="filterParameters"
                :currentCurrency="currentCurrency"
                :kind="kind">
            </Component>
        </div>
        <deleteIcon @removeFromDashBoard="removeFromDashBoard" style="position: absolute;bottom: 0px; right: 0px"/>
   </Card>
</template>

<script>
    import CardFilter from '../card-tables/card-filter';
    import departmentFilter from '../department-filter';
    import personFilter from '../person-filter';
    import progressView from './components/progressView';
    import echart from './components/echart';
    import tableView from './components/tableView';
    import deleteIcon from '../deleteIcon';
    export default {
        name: 'tableCompletion',
        components: {
            CardFilter,
            departmentFilter,
            personFilter,
            progressView,
            echart,
            tableView,
            deleteIcon
        },
        props: [
            'from',
            'kind',
            'currentCurrency',
            'department_list',
            'user_list'
        ],
        data() {
            return {
                visible: false,
                selectOptions: [
                    {
                        value: 1,
                        label: this.$t('dashBoardV2.Settings.dealtAmount')
                    },
                    {
                        value: 2,
                        label: this.$t('dashBoardV2.Settings.dealtInquiry')
                    }
                ],
                filterParameters: {},
                echartView: {
                    completion: 'progressView',
                    googleMarketing: 'echart'
                }
            };
        },
        computed: {
            tableTilte() {
                // let title = '';
                // if (this.kind === 'completion') {
                //     title = this.$t('dashBoardV2.Title.completion');
                // }
                return this.$t(`dashBoardV2.Title.${this.kind}`);
                // return title;
            },
            helpTipTitle() {
                let title = '';
                if (this.kind === 'completion') {
                    title = this.$t('helpTip.completion');
                }
                return title;
            }
        },
        methods: {
            handleFilter(data) {
                const { filterKey, filterValue } = data;
                this.handleclick(filterKey, filterValue);
            },
            handleclick(key, val) {
                // if (key === 'viewType' && val === 'progressView' && this.filterParameters.levelType === 'person') {
                //     return;
                // }
                // if (key === 'levelType' && val === 'person' && this.filterParameters.viewType === 'progressView') {
                //     this.$set(this.filterParameters, 'viewType', 'tableView');
                // }
                this.$set(this.filterParameters, [key], val);
                const filterParameters = this.$store.state.dashboard.filterParameters;
                filterParameters[this.kind] = this.filterParameters;
                this.$store.commit('setFilterParameters', filterParameters);
            },
            watchCurrentCurrency(val) {
                this.filterParameters = this.$store.state.dashboard.filterParameters[this.kind];
                this.handleclick('currentCurrency', val);
            },
            removeFromDashBoard() {
                this.$emit('removeFromDashBoard', this.kind);
            }
        },
        created() {
            this.filterParameters = this.$store.state.dashboard.filterParameters[this.kind];
        },
        mounted() {
        },
        watch: {
            // currentCurrency: {
            //     handler(val) {
            //         if (this.filterParameters && this.filterParameters.levelType) {
            //             this.handleclick('currentCurrency', val);
            //         } else {
            //             this.watchCurrentCurrency(val);
            //         }
            //     },
            //     immediate: true
            // }
        }
    };
</script>
<style lang="less">
    @import './common.less';
</style>
