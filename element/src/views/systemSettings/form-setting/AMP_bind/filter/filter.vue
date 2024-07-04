<template>
    <div>
        <Poptip width="420" placement="bottom-end" trigger="click">
            <Button type="text" icon="funnel" :style="filtering?'color:#4285f4':''">{{$t('filter_box.filter_field')}}
            </Button>
            <div slot="content">
                <div class="filter-top">
                    <ul>
                        <li class="filter-top-li" :style="filtering=='search'?'color:#fda359':''"
                            :class="{'filter-checked':isChecked}" @click.stop="toggleFilter(true)">
                            {{$t('filter_box.filter')}}<span></span></li>
                        <li class="filter-top-li" :style="filtering=='commonsearch'?'color:#fda359':''"
                            :class="{'filter-checked':!isChecked}" @click.stop="toggleFilter(false)">
                            {{$t('filter_box.tip_customSearch')}}<span></span></li>
                    </ul>
                </div>
                <div>
                    <!-- 检索 -->
                    <div v-show="filterTerm">
                        <div style="margin-bottom: 15px">
                            <div class="filter-tips">{{$t('filter_box.filter_name')}}</div>
                            <Input v-model="filterName" :placeholder="$t('filter_box.tip_customSearch')"
                                   style="width: 385px"></Input>
                        </div>
                        <div>
                            <div class="filter-tips">{{$t('filter_box.filter_con')}}</div>
                            <div v-for="(item,index) in conditions" :key="index" class="conditionmain">
                                <Select v-model="item.condition1" style="width:100px;margin-right:15px;float:left;"
                                        size="small" @on-change="changecon1()">
                                    <Option v-for="element in item.conditionList1" :value="element.value"
                                            :key="element.value">{{ element.label }}
                                    </Option>
                                </Select>
                                <Select v-model="item.condition2" style="width:90px;margin-right:15px;float:left;"
                                        size="small">
                                    <Option v-for="element in item.conditionList2" :value="element.value"
                                            :key="element.value">{{ element.label }}
                                    </Option>
                                </Select>
                                <div style="margin-bottom:10px;">
                                    <DatePicker v-model="item.condition3" :picker-options="options2" v-if="item.type==='date'"
                                                format="yyyy-MM-dd"
                                                type="daterange" placement="bottom-end"
                                                :placeholder="$t('filter_box.select_time')"
                                                size="small" style="width: 135px;margin-right:5px;">
                                    </DatePicker>
                                    <Select v-model="item.condition3" size="small" clearable
                                            v-else-if="item.type==='select'"
                                            style="width:135px;margin-right:5px;height:22px">
                                        <Option v-for="(element,index) in item.conditionList3" :value="element.id"
                                                :key="index">{{ element.name }}
                                        </Option>
                                    </Select>
                                    <Input v-model="item.condition3" v-else size="small"
                                           :placeholder="$t('filter_box.add_keywords')"
                                           style="width:135px;margin-right:5px;"></Input>
                                    <span @click.stop="addclick()">
                                            <!-- <Icon type="plus-circled" size="15" color="#FA8241"
                                                    style='cursor:pointer;display:inline-block;'></Icon> -->
                                            <Icon  size="15" class="custom custom-add-circle"
                                                    style='cursor:pointer;display:inline-block;'></Icon>
                                    </span>
                                </div>
                            </div>
                            <!-- <div class="conditionwrap">
                                    <div v-for="(add,index) in addcondition" class="conditionmain" :key="index">
                                            <Select v-model="add.condition1"
                                                            style="width:100px;margin-right:15px;float:left;" size="small"
                                                            @on-change="addchangecon1(index)">
                                                    <Option v-for="item in add.conditionlist1" :value="item.value"
                                                                    :key="item.value">{{ item.label }}
                                                    </Option>
                                            </Select>
                                            <Select v-model="add.condition2"
                                                            style="width:90px;margin-right:15px;float:left;" size="small">
                                                    <Option v-for="item in add.conditionlist2" :value="item.value"
                                                                    :key="item.value">{{ item.label }}
                                                    </Option>
                                            </Select>
                                            <div style="margin-bottom:10px;">
                                                    <DatePicker v-model="add.condition3" :picker-options="options2" v-if="add.isInput==='date'"  format="yyyy-MM-dd"
                                                                            type="daterange" placement="bottom-end" :placeholder="$t('filter_box.select_time')"
                                                                            size="small" style="width: 135px;margin-right:5px;">
                                                    </DatePicker>
                                                    <Select v-model="add.condition3" size="small" clearable v-else-if="add.isInput==='select'" :filterable="add.condition1==$t('visitor_history.service_name')?true:false"  style="width:135px;margin-right:5px;height:22px">
                                                            <Option v-for="(element,index) in add.conditionlist3" :value="element.id" :key="index">{{ element.name }}</Option>
                                                    </Select>
                                                    <Input v-model="add.condition3" size="small" v-else :placeholder="$t('filter_box.add_keywords')"
                                                            style="width:135px;margin-right:5px;"></Input>
                                                    <span @click.stop="removeclick(index)">
                                                            <Icon type="minus-circled" size="15" color="#FA8241"
                                                                    style='cursor:pointer;display:inline-block;'></Icon>
                                                    </span>
                                            </div>
                                    </div>
                            </div> -->
                        </div>
                        <div class="btn" style="margin-top: 10px">
                            <Button type="primary" ghost size="small" @click.stop="empty()"
                                    style="float:right;width:50px;">{{$t('filter_box.empty')}}
                            </Button>
                            <Button type="primary" size="small" @click.stop="searchdata()"
                                    style="margin-right:5px;float:right;width:50px;">{{$t('filter_box.filter')}}
                            </Button>
                            <Button type="primary" size="small" style="margin-right:5px;float:right;"
                                    @click.stop="savesearch()">{{$t('filter_box.save_common')}}
                            </Button>
                        </div>
                    </div>
                    <!-- 自定义检索 -->
                    <div v-show="!filterTerm">
                        <!-- <p>常用检索</p> -->
                        <div class="filter-tips">{{$t('filter_box.common_filter')}}</div>
                        <ul v-for="(name,index) in historySearch" :key="index">
                            <li class="search-item" :style="isSearching==index?'color:#fda359':''"
                                @click.stop="searchHistory(index)">
                                <span> {{name}} </span>
                                <span class="delete-search" @click.stop="deleteHistory(index)"><Icon
                                        type="trash-a"></Icon></span>
                                <!-- <span class="edit-search"><Icon type="compose"></Icon></span> -->
                            </li>
                        </ul>
                        <Button type="primary" ghost size="small" @click.stop="empty()" style="float:right;width:50px;">
                            {{$t('filter_box.empty')}}
                        </Button>
                    </div>
                </div>
            </div>
        </Poptip>
    </div>
</template>
<script>
    export default {
        props: {
            // 保存到本地的名称
            historyName: {
                type: String,
                default: 'historySearch'
            },
            // 筛选项
            conditionList1: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                options2: {
                    shortcuts: [
                        {
                            text: this.$t('datepicker.today'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.yesterday'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24);
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.tswk'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                let dayNo = start.getDay();
                                dayNo = dayNo ? dayNo - 1 : 6;
                                start.setTime(start.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.ltwk'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                let dayNo = start.getDay();
                                dayNo = dayNo || 7;
                                end.setTime(end.getTime() - dayNo * 24 * 60 * 60 * 1000);
                                start.setTime(end.getTime() - 6 * 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.tsmt'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(new Date(start.getFullYear(), start.getMonth(), 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            text: this.$t('datepicker.ltmt'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() - 24 * 60 * 60 * 1000);
                                start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        }
                    ],
                    disabledDate(date) {
                        return date.valueOf() > Date.now();
                    }
                },
                filtering: '', // 是否正在筛选 ''未筛选 search普通筛选 commonsearch常用筛选
                isChecked: true,
                filterTerm: true,
                historySearch: [], // 历史,常用检索列表
                filterName: '', // 检索名称
                conditions: [
                    {
                        condition1: '',
                        conditionList1: [],
                        condition2: '',
                        conditionList2: [],
                        condition3: '',
                        conditionList3: [],
                        type: 'string'// condition3什么形式输入string,select,date,
                    }
                ]
            };
        },
        methods: {
            toggleFilter(type) {
                this.isChecked = type;
                this.filterTerm = type;
                if (!type) {
                    this.getHistory();
                }
            },
            // 获取本地存储中的历史查询信息
            getHistory() {
                this.historySearch = [];
                if (localStorage[this.historyName]) {
                    for (let i = 0; i < JSON.parse(localStorage[this.historyName]).length; i++) {
                        this.historySearch.push(JSON.parse(localStorage[this.historyName])[i].name);
                    }
                }
            },
            addclick() {
                this.conditions.push({
                    condition1: '',
                    conditionList1: [],
                    condition2: '',
                    conditionList2: [],
                    condition3: '',
                    conditionList3: [],
                    type: 'string'// condition3什么形式输入string,select,date,
                });
            }
        }
    };
</script>
<style lang="less" scoped>

</style>
