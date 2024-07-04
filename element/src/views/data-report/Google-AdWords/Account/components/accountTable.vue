<template>
    <div>
        <div class="account-body-col-panel-content">
            <div class="account-body-col-panel-head clearfix">
                <div class="account-body-col-panel-head-title">
                    {{ tableType.label }}
                </div>
                <Dropdown v-for="(item, index) in defaultOptions" trigger="click" class="drop-down-main" @command="dropDownonclick($event, index+1)">
                    <a href="javascript:void(0)">
                        {{item}}
                        <Icon type="arrow-down-b"></Icon>
                    </a>
                    <DropdownMenu slot="dropdown">
                        <p class="drop-down-menu-category">{{ $t('GA.sort') }}</p>
                        <DropdownItem command="down">{{ $t('GA.asc') }}</DropdownItem>
                        <DropdownItem command="up">{{ $t('GA.desc') }}</DropdownItem>
                        <p class="drop-down-menu-category">{{ $t('GA.indicator') }}</p>
                        <DropdownItem v-for="option in ChartSeriesList" :key="option.value" :command="option.value">
                            {{option.name}}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
            <!-- <Table border :columns="columns" :data="filterData" :show-header="false"></Table> -->
            <Table
                border
                :show-header="false"
                :data="filterData">
                    <TableColumn
                        v-for="item in columns"
                        :key="item.key"
                        sortable
                        :prop="item.key"
                        show-overflow-tooltip
                        :label="item.title">
                    </TableColumn>
            </Table>
            <div style="margin-top: 10px;">
                <div @click="$emit('jumpTo', tableType.link)" style="display: inline-block;cursor: pointer;">
                    <!--<span style="color:#FC8B2F;margin-right: 5px">所有{{ tableType.label }}</span>-->
                    <span style="color:#FC8B2F;margin-right: 5px">{{ $t('GA.all') }}</span>
                    <Icon type="chevron-right" color="#FC8B2F"></Icon>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import _ from 'lodash';

    export default {
        name: 'accountTable',
        props: {
            value: Array,
            tableType: {
                label: '',
                link: '',
                key: ''
            }
        },
        component: {
            'my-component': {}
        },
        data() {
            return {
                defaultOptions: [
                    this.$t('GA.cost'),
                    this.$t('GA.impressions'),
                    this.$t('GA.clicks'),
                    this.$t('GA.conversions')
                ],
                ChartSeriesList: [
                    {
                        value: 'impressions',
                        name: this.$t('GA.impressions')
                    },
                    {
                        value: 'averagePosition',
                        name: this.$t('GA.averagePosition')
                    },
                    {
                        value: 'averageCpc',
                        name: this.$t('GA.averageCpc')
                    },
                    {
                        value: 'clicks',
                        name: this.$t('GA.clicks')
                    },
                    {
                        value: 'costPerConversion',
                        name: this.$t('GA.costPerConversion')
                    },
                    {
                        value: 'conversions',
                        name: this.$t('GA.conversions')
                    },
                    {
                        value: 'cost',
                        name: this.$t('GA.cost')
                    },
                    {
                        value: 'ctr',
                        name: this.$t('GA.ctr')
                    },
                    {
                        value: 'conversionRate',
                        name: this.$t('GA.conversionRate')
                    }
                ],
                seriesTransfer: {
                    date: this.$t('GA.date'),
                    device: this.$t('GA.device'),
                    adNetworkType1: this.$t('GA.displayNetwork'),
                    campaignId: this.$t('GA.campaignId'),
                    campaignName: this.$t('GA.campaignName'),
                    adGroupId: this.$t('GA.adGroupId'),
                    adGroupName: this.$t('GA.adGroupName'),
                    adGroupStatus: this.$t('GA.adGroupStatus'),
                    criteria: this.$t('GA.criteria'),
                    id: this.$t('GA.id'),
                    shortHeadline: this.$t('GA.shortHeadline'),
                    countryCriteriaId: this.$t('GA.countryCriteriaId'),
                    cost: this.$t('GA.cost'),
                    impressions: this.$t('GA.impressions'),
                    clicks: this.$t('GA.clicks'),
                    conversions: this.$t('GA.conversions'),
                    ctr: this.$t('GA.ctr'),
                    averageCpc: this.$t('GA.averageCpc'),
                    costPerConversion: this.$t('GA.costPerConversion'),
                    conversionRate: this.$t('GA.conversionRate'),
                    averagePosition: this.$t('GA.averagePosition'),
                    query: this.$t('GA.searchTerms')
                },
                columns: [
                    {
                        key: this.tableType.key,
                        title: `<h1>${this.tableType.label}</h1>`
                    },
                    {
                        key: 'cost',
                        title: this.$t('GA.cost')
                    },
                    {
                        key: 'impressions',
                        title: this.$t('GA.impressions')
                    },
                    {
                        key: 'clicks',
                        title: this.$t('GA.clicks')
                    },
                    {
                        key: 'conversions',
                        title: this.$t('GA.conversions')
                    }
                ],
                filterData: [],
                tempFilterData: []
            };
        },
        methods: {
            init() {
                this.filterData = _.orderBy(this.tempFilterData, ['cost'], ['desc']).slice(0, 5);
            },
            dropDownonclick(name, index) {
                console.log('dropDownonclick', name, index);
                if (name === 'down') {
                    this.filterData = _.orderBy(this.tempFilterData, this.columns[index].key, 'desc').slice(0, 5);
                } else if (name === 'up') {
                    this.filterData = _.orderBy(this.tempFilterData, this.columns[index].key, 'asc').slice(0, 5);
                } else {
                    this.columns[index].key = name;
                    this.columns[index].title = this.seriesTransfer[name];
                    this.defaultOptions[index - 1] = this.seriesTransfer[name];
                    this.filterData = _.orderBy(this.tempFilterData, name, 'desc').slice(0, 5);
                }
            }
        },
        watch: {
            value(data) {
                this.tempFilterData = data;
                this.init();
            }
        }
    };
</script>

<style scoped lang="less">
    .drop-down-menu-category {
        color: #7c7c7c;
        font-size: 10px;
        padding: 5px 16px;
    }

    .account-body-col-panel {
        height: 400px;
        margin: 14px;
    }

    .xpy-shadow {
        background-color: #fff;
        -webkit-box-shadow: 0 0 4px rgba(0, 0, 0, 0.13);
        -moz-box-shadow: 0 0 4px rgba(0, 0, 0, 0.13);
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.13);
    }

    .account-body-col-panel-content {
        padding: 25px;
        height: 100%;
    }

    .account-body-col-panel-head-title {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 18px;
        float: left;
        width: 20%;
    }

    .drop-down-main {
        width: 20%;
        float: left;
        font-size: 14px;
        & /deep/ .ivu-dropdown-rel {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            & > a {
              color: rgba(0, 0, 0, 0.8);
            }
        }
        & /deep/ .ivu-select-dropdown {
            width: auto;
        }
    }
</style>
