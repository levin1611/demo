<template>
    <Card class="card-box">
        <div class="card-box-title">
            <span class="title">{{tableTilte}} <HelpTip :title="helpTipTitle" :iconSize="14"></HelpTip></span>
            <div class="card-box-filter">

                <!-- 表格添加"日期"维度, 客服工作情况表专用 -->
                <div v-if="kind === 'serviceWorkStatus'"
                     style="font-size: 12px;"
                     class="marginLeft8">
                    <el-switch :value="filterParameters.secondDimension === (filterParameters.firstDimension === 'csId' ? 'date' : 'csId')"
                               :label="true"
                               @change="val => handleclick('secondDimension', val ? (filterParameters.firstDimension === 'csId' ? 'date' : 'csId') : false)"
                               style="position: relative; top: -2px;"></el-switch>
                    {{ $t('dashBoardV2.Table.showSecondDimension').replace('$dimension', filterParameters.firstDimension === 'csId' ? $t('dashBoardV2.Table.date') : $t('dashBoardV2.Table.customerService')) }}
                </div>
                <!-- 时间筛选 -->
                <CardFilter class="marginLeft8"
                    :cardType="kind"
                    filterType="date"
                    filterKey="dateRange"
                    :filterValue="filterParameters.dateRange"
                    @handleFilter="handleFilter"></CardFilter>
                 <!-- google营销转化报表不显示 -->
                 <template v-if="kind !== 'googleMarketing'">
                    <!-- 部门与员工切换 -->
                    <ButtonGroup v-if="filterParameters.levelType !== null"
                                class="marginLeft8">
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
                    <departmentFilter class="marginLeft8"
                        v-if="filterParameters.levelType === 'department'"
                        :cardType="kind"
                        :department_list="department_list"
                        :filterValue="filterParameters.departmentId"
                        @handleFilter="handleclick"></departmentFilter>
                    <!-- 员工筛选 -->
                    <personFilter class="marginLeft8"
                        v-if="filterParameters.levelType === 'person'"
                        :cardType="kind"
                        :department_list="department_list"
                        :user_list="user_list"
                        :filterValue="filterParameters.userIdList"
                        @handleFilter="handleclick"></personFilter>
                    <!-- 网站筛选 -->
                    <SiteFilter v-if="filterParameters.siteId !== undefined"
                                :cardType="kind"
                                :site_list="site_list"
                                filterKey="siteId"
                                :filterValue="filterParameters.siteId"
                                @handleFilter="handleclick"
                                class="marginLeft8"></SiteFilter>
                    <!-- 网站筛选 -->
                    <FormFilter v-if="filterParameters.formId !== undefined"
                                :cardType="kind"
                                :form_list="form_list"
                                filterKey="formId"
                                :filterValue="filterParameters.formId"
                                @handleFilter="handleclick"
                                class="marginLeft8"></FormFilter>
                    <!-- 客服与日期切换 -->
                    <ButtonGroup v-if="filterParameters.firstDimension"
                                class="marginLeft8">
                        <Button type="minor"
                                :class="filterParameters.firstDimension === 'csId' ? 'active' : ''"
                                @click="handleclick('firstDimension', 'csId') || (filterParameters.secondDimension === 'csId' ? handleclick('secondDimension', false) : undefined)">{{ $t('dashBoardV2.Table.customerService') }}</Button>
                        <Button type="minor"
                                :class="filterParameters.firstDimension === 'date' ? 'active' : ''"
                                @click="handleclick('firstDimension', 'date') || (filterParameters.secondDimension === 'date' ? handleclick('secondDimension', false) : undefined)">{{ $t('dashBoardV2.Table.date') }}</Button>
                    </ButtonGroup>
                    <!-- 客服筛选 -->
                    <ServiceFilter v-if="filterParameters.serviceId !== undefined"
                                :cardType="kind"
                                :service_list="service_list"
                                filterKey="serviceId"
                                :filterValue="filterParameters.serviceId"
                                @handleFilter="handleclick"
                                class="marginLeft8"></ServiceFilter>
                    <!-- 数据维度切换 -->
                    <Select style="width:100px;"
                        v-model="filterParameters.typeId"
                        size="small"
                        class="marginLeft8 typeId-select"
                        @change="handleTypeChange"
                        v-if="haveSelectTypeIdModul.includes(kind)">
                        <Option v-for="item in typeAggregate[kind]"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"></Option>
                    </Select>
                </template>
                <campaignFilter
                    v-if="kind === 'googleMarketing'"
                    class="marginRight16 marginLeft8"
                    :cardType="kind"
                    :filterValue="filterParameters.campaignId"
                    @handleFilter="handleclick"></campaignFilter>
                <!-- <Cascader class="marginRight16 marginRight20 googleMarketingTable"
                        v-if="kind === 'googleMarketing'"
                        :props="props"
                        :options="googleStateList"
                        @change="googleStateChange"
                        popper-class="googleMarketingTableModal"
                        collapse-tags clearable></Cascader> -->
                <!-- <Select style="width:100px;margin-left:-4px" v-model="filterParameters.typeId" size="small" class="marginRight16 marginRight20" @change="handleTypeChange" v-if="kind ==='inquiryDistribution'">
                    <Option v-for="item in inquirySelectTypeOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"></Option>
                </Select> -->

                <slot></slot>
            </div>
        </div>

        <div class="card-box-body dashbord-table">
            <tableView
                :from="from"
                :currentCurrency="currentCurrency"
                :filterParameters="filterParameters"
                :typeAggregate="typeAggregate"
                :kind="kind"
                @updateTableFilterConObj="updateTableFilterConObj">
            </tableView>
        </div>

        <!-- 统计截止时间 -->
        <div v-if="['visitorAnalysis', 'visitTrafficAnalysis'].includes(kind) && syncTime[1]"
             class="statistics-time">{{ $t('dashBoardV2.dataOverview.statisticsTime') }}: {{ syncTime[1] }}</div>
        <div v-else-if="['msgStatusStatistics', 'msgPageStatus'].includes(kind) && syncTime[2]"
             class="statistics-time">{{ $t('dashBoardV2.dataOverview.statisticsTime') }}: {{ syncTime[2] }}</div>
        <div v-else-if="['serviceWorkStatus'].includes(kind) && syncTime[3]"
             class="statistics-time">{{ $t('dashBoardV2.dataOverview.statisticsTime') }}: {{ syncTime[3] }}</div>

        <deleteIcon @removeFromDashBoard="removeFromDashBoard" style="position: absolute;bottom: 0px; right: 0px"/>
   </Card>
</template>

<script>
    import CardFilter from '../card-tables/card-filter.vue';
    import departmentFilter from '../department-filter.vue';
    import personFilter from '../person-filter.vue';
    import campaignFilter from '../campaign-filter.vue';
    import tableView from './components/tableView.vue';
    import deleteIcon from '../deleteIcon';
    import { mapState } from 'vuex';
    import SiteFilter from '../site-filter.vue';
    import FormFilter from '../form-filter.vue';
    import ServiceFilter from '../service-filter.vue';
    export default {
        name: 'tableIndex',
        components: {
            CardFilter,
            departmentFilter,
            personFilter,
            SiteFilter,
            FormFilter,
            campaignFilter,
            ServiceFilter,
            tableView,
            deleteIcon
        },
        props: [
            'from',
            'kind',
            'currentCurrency',
            'department_list',
            'user_list',
            'site_list',
            'form_list',
            'service_list',
            'syncTime'
        ],
        data() {
            return {
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
                typeAggregate: {
                    inquiryDistribution: [
                        {
                            value: 7,
                            label: this.$t('dashBoardV2.Table.followUpStatus')
                        },
                        {
                            value: 5,
                            label: this.$t('dashBoardV2.Table.inquiryGrade')
                        },
                        {
                            value: 10,
                            label: this.$t('dashBoardV2.Table.sourceMode')
                        },
                        {
                            value: 6,
                            label: this.$t('dashBoardV2.Table.sourceChannel')
                        }
                    ],
                    companyDistribution: [
                        {
                            value: 2,
                            label: this.$t('dashBoardV2.Table.customerType')
                        },
                        {
                            value: 8,
                            label: this.$t('dashBoardV2.Table.starLevel')
                        }
                    ],
                    clueDistribution: [
                        {
                            value: 3,
                            label: this.$t('dashBoardV2.Table.leadsStatus')
                        },
                        {
                            value: 10,
                            label: this.$t('dashBoardV2.Table.sourceMode')
                        },
                        {
                            value: 6,
                            label: this.$t('dashBoardV2.Table.sourceChannel')
                        }
                    ],
                    visitorAnalysis: [
                        // 访问来源类别
                        {
                            value: 'trafficSourceMerge',
                            label: this.$t('dashBoardV2.Table.trafficSource')
                        },
                        // 国家
                        {
                            value: 'country',
                            label: this.$t('dashBoardV2.Table.country')
                        },
                        // 设备类型
                        {
                            value: 'deviceType',
                            label: this.$t('dashBoardV2.Table.deviceType')
                        },
                        // 浏览器
                        {
                            value: 'browser',
                            label: this.$t('dashBoardV2.Table.browser')
                        },
                        // 屏幕分辨率
                        {
                            value: 'screenResolution',
                            label: this.$t('dashBoardV2.Table.screenResolution')
                        }
                    ],
                    visitTrafficAnalysis: [
                        // 访问来源类别
                        {
                            value: 'trafficSourceMerge',
                            label: this.$t('dashBoardV2.Table.trafficSource')
                        },
                        // 国家
                        {
                            value: 'country',
                            label: this.$t('dashBoardV2.Table.country')
                        },
                        // 访问时段
                        {
                            value: 'hour',
                            label: this.$t('dashBoardV2.Table.visitPeriod')
                        },
                        // 着陆页
                        {
                            value: 'firstVisitUrl',
                            label: this.$t('dashBoardV2.Table.landPage')
                        },
                        // 浏览器语言
                        {
                            value: 'lang',
                            label: this.$t('dashBoardV2.Table.browserLanguage')
                        }
                    ]
                },
                haveSelectTypeIdModul: ['inquiryDistribution', 'clueDistribution', 'companyDistribution', 'visitorAnalysis', 'visitTrafficAnalysis'],
                filterParameters: {},
                props: {
                    value: 'campaignId',
                    label: 'customerName',
                    children: 'googleAdsCampaigns',
                    multiple: true
                },
                googleStateList: [],
                googleStateValue: []
            };
        },
        computed: {
            ...mapState({
                userId: state => state.userId,
                orgId: state => state.enterpriseId,
                userName: state => state.userName
            }),
            tableTilte() {
                return this.$t(`dashBoardV2.Title.${this.kind}`);
            },
            helpTipTitle() {
                return this.$t(`helpTip.${this.kind}`);
            }
        },
        methods: {
            handleFilter(data) {
                const { filterKey, filterValue } = data;
                this.handleclick(filterKey, filterValue);
            },
            handleclick(key, val) {
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
            },
            handleTypeChange(val) {
                console.log('typeId', val);
                localStorage.setItem(`dashBords_${this.kind}_select_type`, val);
                this.handleclick('typeId', val);
                // 如果是有子级筛选的表格, 需要同时清空子级筛选内容
                if (['visitorAnalysis', 'visitTrafficAnalysis'].includes(this.kind)) {
                    this.handleclick('childFilterVal', '');
                }
            },
            updateTableFilterConObj(val) {
                this.$emit('updateTableFilterConObj', val);
            }
        },
        created() {
            this.filterParameters = this.$store.state.dashboard.filterParameters[this.kind];
            const historyTypeId = localStorage.getItem(`dashBords_${this.kind}_select_type`);
            if (historyTypeId) {
                this.$set(this.filterParameters, 'typeId', /^\d+$/.test(historyTypeId) ? (historyTypeId / 1) : historyTypeId);
            }
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
    .googleMarketingTable {
        .el-cascader__tags .el-tag > span{
            max-width: 72px!important;
        }
    }
    .googleMarketingTableModal {
        width: 400px;
    }
</style>
<style lang="less" scoped>
    .card-box-body.dashbord-table {
        /deep/ .el-table {
            border-right: 1px solid #EBEEF5;
        }
    }

    .statistics-time {
        text-align: right;
        margin-top: 12px;
        font-size: 12px;
        line-height: 18px;
        color: #333;
    }
</style>
