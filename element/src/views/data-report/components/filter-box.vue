<template>
    <div class="filter-component">
        <Poptip ref="poptip" popper-class="filter-popper"
                @hide="hide" @show="show" trigger="click" transfer placement="bottom">
            <Icon class="down-icon" custom="custom custom-table-head-filter" slot="reference"/>
            <div style="font-weight:400">
                <ul v-if="sort" class="filter-seq">
                    <li @click="sortBy(0)">
                        <Icon custom="custom custom-ascending"></Icon>
                        <span>{{$t('data_report.filter_box.ascending')}}</span>
                    </li>
                    <li @click="sortBy(1)">
                        <Icon custom="custom custom-descending"></Icon>
                        <span>{{$t('data_report.filter_box.descending')}}</span>
                    </li>
                    <Tooltip v-if="columnValue===1" ref="tooltip" placement="right-start" theme="light">
                        <li @click="showTooltip" class="statistical-period">
                            <Icon custom="custom custom-statistical-period"></Icon>
                            <span>{{$t('data_report.filter_box.statisticalPeriod')}}</span>
                        </li>
                        <ul slot="content" class="period-list">
                            <li v-for="(period,index) in periodList"
                                @click="changePeriod(period.value,period.key,period.label)" :key="index">
                                {{period.label}}
                            </li>
                        </ul>
                    </Tooltip>
                </ul>
                <div v-if="filter" class="filter-content">
                    <div class="line" v-if="sort"></div>
                    <div class="title">
                        <Icon type="ios-funnel"></Icon>
                        <span>{{$t('data_report.filter_box.contentFilter')}}</span>
                    </div>
                    <Input v-model="keywords" :placeholder="$t('data_report.filter_box.inputKeyWord')"
                           @input="getCheckList">
                    </Input>
                    <div class="filter-items">
                        <Checkbox style="margin-bottom:8px;" @click.prevent.native="checkAll"
                                  :indeterminate="indeterminate" :value="allCheck">
                            {{$t('data_report.filter_box.checkAll')}}
                        </Checkbox>
                        <CheckboxGroup ref="checkGroup" v-model="checkGroup" @change="handleCheck">
                            <Checkbox v-for="(item,index) in checkList" :key="index" :label="item"></Checkbox>
                        </CheckboxGroup>
                    </div>
                    <div class="filter-btn clearfloat">
                        <Button class="float-right" type="minor" size="small"  @click="cancel">{{$t('cancel')}}</Button>
                        <Button class="float-right" type="success" size="small" @click="confirm">{{$t('confirm')}}</Button>
                        <!-- <Button class="float-right" size="small" type="success" @click="confirm">{{$t('confirm')}}</Button>
                        <Button class="float-right" size="small" type="success" plain @click="cancel">{{$t('cancel')}}</Button> -->
                    </div>
                </div>
            </div>
        </Poptip>
    </div>
</template>
<script>
    export default {
        name: 'filter_box',
        props: {
            filter: Boolean,
            sort: Boolean,
            columnType: Number,
            columnValue: Number,
            orderBy: Number,
            isDesc: Number,
            period: String,
            query: Array, /* 内容筛选条件 */
            allList: Array, /* 当前维度所有项  */
            periodList: Array
        },
        computed: {},
        data() {
            return {
                tipShow: false,
                // periodList:[
                // 	{value:'1',label:'日期',key:'date'},
                // 	{value:'2',label:'周次',key:'weekIndex'},
                // 	{value:'3',label:'月份',key:'monthIndex'},
                // 	{value:'4',label:'季度',key:'quarterIndex'},
                // 	{value:'5',label:'年度',key:'yearIndex'},
                // ],
                checkList: [], /* 多选框的所有选项 */
                checkGroup: [], /* 多选框选中的所有选项 */
                indeterminate: true, /* 设置全选  是非全选状态0 */
                allCheck: false,
                keywords: '' /* 搜索词 */
            };
        },
        methods: {
            /* 搜索框内容改变 更新多选框项
                当前搜索规则是 同时包含所有关键字的内容 关键字以空格隔开
            */
            getCheckList(data) {
                // console.log(data,'搜索框内容改变');
                const keywordsArr = this.keywords.split(' ');
                const checkArr = [];
                this.allList.forEach(item => {
                    let flag = true;
                    keywordsArr.forEach(keyword => {
                        if (!item) {
                            flag = false;
                        } else if (item.indexOf(keyword) === -1) {
                            flag = false;
                        }
                    });
                    if (flag) {
                        checkArr.push(item);
                    }
                });
                this.checkList = checkArr;
                /* 不加nexttick后面的操作会在之前checkgroup的基础上做操作，出现偏差 */
                this.$nextTick(() => {
                    this.getChecked();
                });
            },
            confirm() {
                this.$emit('changeQuery', this.checkGroup);
                this.$emit('updateList');
                this.closePoptip();
            },
            emptyQuery() {
                this.$emit('changeQuery', []);
                this.$emit('updateList');
                this.closePoptip();
            },
            handleCheck(data) {
                if (data.length === this.checkList.length) {
                    this.indeterminate = false;
                    this.allCheck = true;
                } else if (data.length > 0) {
                    this.indeterminate = true;
                    this.allCheck = false;
                } else {
                    this.indeterminate = false;
                    this.allCheck = false;
                }
            },
            show() {
                this.checkList = [...this.allList];
                this.$nextTick(() => {
                    this.getChecked();
                });
            },
            /* 获取多选框选中项
                query 有内容 query和checkList的交集
                      无内容 checkGroup=checkList
            */
            getChecked() {
                if (this.query.length > 0) {
                    const arr = [];
                    this.checkList.forEach(item => {
                        if (this.query.includes(item)) {
                            arr.push(item);
                        }
                    });
                    this.checkGroup = arr;
                } else {
                    this.checkGroup = [...this.checkList];
                }
                this.handleCheck(this.checkGroup);
                console.log(this.$refs.checkGroup, 'checkGroup');
            },
            /* 点击全选 */
            checkAll() {
                if (this.indeterminate) {
                    this.allCheck = false;
                } else {
                    this.allCheck = !this.allCheck;
                }
                this.indeterminate = false;
                if (this.allCheck) {
                    this.checkGroup = [...this.checkList];
                } else {
                    this.checkGroup = [];
                }
            },
            /* 改变统计周期 */
            changePeriod(value, key, label) {
                this.$emit('changeQuery', []);
                this.$emit('update:period', value);
                this.$emit('changeColumn', { key, title: label });
                this.$emit('updateList');
                this.closeTooltip();
                this.closePoptip();
            },
            /* 排序 */
            sortBy(type) {
                this.$emit('update:orderBy', this.columnType);
                this.$emit('update:isDesc', type);
                this.$emit('updateList');
                this.closePoptip();
            },
            showTooltip() {
                this.tipShow = !this.tipShow;
                if (this.tipShow) {
                    console.log('显示', this.$refs.tooltip);
                    this.$refs.tooltip.handleShowPopper();
                } else {
                    this.$refs.tooltip.handleClosePopper();
                }
            },
            cancel() {
                this.closePoptip();
            },
            hide() {
                this.keywords = '';
            },
            closePoptip() {
                this.$refs.poptip.doClose();
                // this.$refs.poptip.handleClose();
            },
            closeTooltip() {
                this.tipShow = false;
                this.$refs.tooltip.handleClosePopper();
            }
        }
    };
</script>
<style lang="less">
    @import url('./filter-box.less');

    .statistic-report {
        .filter-component {
            // margin-left: 10px;
        }
    }
</style>
