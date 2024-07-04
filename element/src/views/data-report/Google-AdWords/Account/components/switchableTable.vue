<template>
    <div>
        <div class="account-body-col-panel-content">
            <div class="account-body-col-panel-head clearfix">
                <div class="account-body-col-panel-head-title">
                    关键词
                </div>
                <Dropdown v-for="(item, index) in defaultOptions" trigger="click" class="drop-down-main" @on-click="dropDownonclick($event, index+1)">
                    <a href="javascript:void(0)">
                        {{item}}
                        <Icon type="arrow-down-b"></Icon>
                    </a>
                    <DropdownMenu slot="list">
                        <p class="drop-down-menu-category">排序</p>
                        <DropdownItem name='down'>降序</DropdownItem>
                        <DropdownItem name='up'>升序</DropdownItem>
                        <p class="drop-down-menu-category">指标</p>
                        <DropdownItem :name="option.value" v-for="option in ChartSeriesList">
                            {{option.name}}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
            <Table border :columns="columns8" :data="filterDatas" :show-header="false"></Table>
            <div style="margin-top: 10px;">
                <router-link to="keywords">
                    <span style="color:#FC8B2F;margin-right: 5px">所有关键词</span>
                    <Icon type="chevron-right" color="#FC8B2F"></Icon>
                </router-link>
            </div>
        </div>
    </div>
</template>
<script>
    import _ from 'lodash'

    export default {
        name: 'switchableTable',
        props: {
            value: Array
        },
        component: {
            'my-component': {}
        },
        data() {
            return {
                defaultOptions: [
                    '费用',
                    '展示次数',
                    '点击次数',
                    '转化次数'
                ],
                ChartSeriesList: [
                    {
                        value: 'impressions',
                        name: '展示次数'
                    },
                    {
                        value: 'averagePosition',
                        name: '平均排名'
                    },
                    {
                        value: 'averageCpc',
                        name: '平均每次点击费用'
                    },
                    {
                        value: 'clicks',
                        name: '点击次数'
                    },
                    {
                        value: 'costPerConversion',
                        name: '平均每次转化费用'
                    },
                    {
                        value: 'conversions',
                        name: '转化次数'
                    },
                    {
                        value: 'cost',
                        name: '费用'
                    },
                    {
                        value: 'ctr',
                        name: '点击率'
                    },
                    {
                        value: 'conversionRate',
                        name: '转化率'
                    }
                ],
                seriesTransfer: {
                    date: '日期',
                    device: '设备',
                    adNetworkType1: '投放网络',
                    campaignId: '广告系列ID',
                    campaignName: '广告系列名称',
                    adGroupId: '广告组ID',
                    adGroupName: '广告组名称',
                    adGroupStatus: '广告组状态',
                    criteria: '关键词',
                    id: '广告ID',
                    shortHeadline: '广告标题',
                    countryCriteriaId: '地域',
                    cost: '费用',
                    impressions: '展示次数',
                    clicks: '点击次数',
                    conversions: '转化次数',
                    ctr: '点击率',
                    averageCpc: '平均每次点击费用',
                    costPerConversion: '平均每次转化费用',
                    conversionRate: '转化率',
                    averagePosition: '平均排名',
                    query: '搜索词'
                },
                columns8: [
                    {
                        key: 'criteria',
                        title: '<h1>搜索词</h1>'
                    },
                    {
                        key: 'cost',
                        title: '费用',
                    },
                    {
                        key: 'impressions',
                        title: '展示次数'
                    },
                    {
                        key: 'clicks',
                        title: '点击次数'
                    },
                    {
                        key: 'conversions',
                        title: '转化次数'
                    }
                ],
                data6: [
                    {
                        name: 'John Brown',
                        age: 18,
                        address: 'New York No. 1 Lake Park'
                    },
                    {
                        name: 'Jim Green',
                        age: 24,
                        address: 'London No. 1 Lake Park'
                    },
                    {
                        name: 'Joe Black',
                        age: 30,
                        address: 'Sydney No. 1 Lake Park'
                    },
                    {
                        name: 'Jon Snow',
                        age: 26,
                        address: 'Ottawa No. 2 Lake Park'
                    }
                ],
                filterDatas: [],
                tempFilterDatas: []
            }
        },
        methods: {
            init() {
                this.filterDatas = _.orderBy(this.tempFilterDatas, ['cost'], ['desc']).slice(0, 5)
            },
            dropDownonclick(name, index) {
                if (name === 'down') {
                    this.filterDatas = _.orderBy(this.tempFilterDatas, this.columns8[index].key, 'desc').slice(0, 5)
                } else if (name === 'up') {
                    this.filterDatas = _.orderBy(this.tempFilterDatas, this.columns8[index].key, 'asc').slice(0, 5)
                } else {
                    this.columns8[index].key = name;
                    this.columns8[index].title = this.seriesTransfer[name];
                    // this['column' + index] = this.seriesTransfer[name];
                    this.defaultOptions[index - 1] = this.seriesTransfer[name];
                    this.filterDatas = _.orderBy(this.tempFilterDatas, name, 'desc').slice(0, 5);
                }
            },
            show(index) {
                this.$Modal.info({
                    title: 'User Info',
                    content: `Name：${this.data6[index].name}<br>Age：${this.data6[index].age}<br>Address：${this.data6[index].address}`
                })
            },
            remove(index) {
                this.data6.splice(index, 1)
            }
        },
        watch: {
            value(data) {
                this.tempFilterDatas = data;
                this.init();
            }
        }
    }
</script>

<style scoped lang="less">
    @import "./common.less";
</style>
