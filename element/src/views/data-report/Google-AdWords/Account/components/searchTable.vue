<template>
    <div>
        <div class="account-body-col-panel-content">
            <div class="account-body-col-panel-head clearfix">
                <div class="account-body-col-panel-head-title">
                    搜索词
                </div>
                <Dropdown trigger="click" class="drop-down-main"  @on-click="dropDownonclick($event,1)">
                    <a href="javascript:void(0)">
                        {{column1}}
                        <Icon type="arrow-down-b"></Icon>
                    </a>
                    <DropdownMenu slot="list">
                        <p class="drop-down-menu-category">排序</p>
                        <DropdownItem name='down'>降序</DropdownItem>
                        <DropdownItem name='up'>升序</DropdownItem>
                        <p class="drop-down-menu-category">指标</p>
                        <DropdownItem :name="item.value" v-for="item in ChartSeriesList">
                            {{item.name}}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Dropdown trigger="click" style="width: 20%;"  class="drop-down-main" @on-click="dropDownonclick($event,2)">
                    <a href="javascript:void(0)">
                        {{column2}}
                        <Icon type="arrow-down-b"></Icon>
                    </a>
                    <DropdownMenu slot="list">
                        <DropdownItem name='down'>降序</DropdownItem>
                        <DropdownItem name='up'>升序</DropdownItem>
                        <DropdownItem :name="item.value" v-for="item in ChartSeriesList">
                            {{item.name}}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Dropdown trigger="click" style="width: 20%;" class="drop-down-main" @on-click="dropDownonclick($event,3)">
                    <a href="javascript:void(0)">
                        {{column3}}
                        <Icon type="arrow-down-b"></Icon>
                    </a>
                    <DropdownMenu slot="list">
                        <DropdownItem name='down'>降序</DropdownItem>
                        <DropdownItem name='up'>升序</DropdownItem>
                        <DropdownItem :name="item.value" v-for="item in ChartSeriesList">
                            {{item.name}}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Dropdown trigger="click" class="drop-down-main"  @on-click="dropDownonclick($event,4)">
                    <a href="javascript:void(0)">
                        {{column4}}
                        <Icon type="arrow-down-b"></Icon>
                    </a>
                    <DropdownMenu slot="list">
                        <DropdownItem name='down'>降序</DropdownItem>
                        <DropdownItem name='up'>升序</DropdownItem>
                        <DropdownItem :name="item.value" v-for="item in ChartSeriesList">
                            {{item.name}}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
            <Table border :columns="columns8" :data="filterSearch" :show-header="false"></Table>
            <div style="margin-top: 10px;">
                <router-link to="searchterms"><span style="color:#FC8B2F;margin-right: 5px">所有搜索词</span><Icon type="chevron-right" color="#FC8B2F"></Icon></router-link>
            </div>
        </div>
    </div>
</template>
<script>
    import _ from 'lodash'

    export default {
        name:'searcTable',
        props:{
            value:Array
        },
        component: {
            'my-component': {}
        },
        data () {
            return {
                column1: '费用',
                column2: '展示次数',
                column3: '点击次数',
                column4: '转化次数',

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
                data7: [],
                fourAjaxData: {},
                columns8: [
                    {
                        key: 'query',
                        title: '<h1>搜索词</h1>'
                    },
                    {
                        key: 'cost',
                        title: '费用',
//            sortable: true
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
                filterSearch: [],
                tempFilterSearch: []
        }
        },
        methods: {
            init(){
                this.filterSearch= _.orderBy(this.tempFilterSearch,['cost'],['desc']).slice(0, 5)
            },
//      反查key
            dropDownonclick (name, index) {
                console.log(name);
                console.log(index);
                console.log(this.columns8[index].key)
                if (name == 'down') {
                    this.filterDatas = _.orderBy(this.tempFilterSearch,this.columns8[index].key,'desc').slice(0, 5)
                } else if (name == 'up') {
                    this.filterDatas = _.orderBy(this.tempFilterSearch,this.columns8[index].key,'asc').slice(0, 5)
                } else {
                    this.columns8[index].key = name
                    this.columns8[index].title = this.seriesTransfer[name]
                    this['column' + index] = this.seriesTransfer[name]
                    this.filterDatas = _.orderBy(this.tempFilterSearch,name,'desc').slice(0, 5)
                }
            },
            show (index) {
                this.$Modal.info({
                    title: 'User Info',
                    content: `Name：${this.data6[index].name}<br>Age：${this.data6[index].age}<br>Address：${this.data6[index].address}`
                })
            },
            remove (index) {
                this.data6.splice(index, 1)
            }
        },
        watch:{
            value(data){
                this.tempFilterSearch=data
                this.init()
            }
        }
    }
</script>
<style scoped lang="less">
    @import "./common.less";
</style>
