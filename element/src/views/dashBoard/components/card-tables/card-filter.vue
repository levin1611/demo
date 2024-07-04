<!-- 仪表盘 tableCard 组件通用的筛选组件 -->
<template>
    <Poptip :width="width_popper"
            placement="bottom-end"
            popper-class="card-filter"
            ref="poptip"
            @hide="cancel">
        <!-- 按钮, Poptip 触发器 -->
        <div slot="reference"
             class="card-filter__trigger">
            <!-- 标题 -->
            <span class="card-filter__title">{{ title }}</span>
            <!-- 下拉按钮 -->
            <template v-if="filterType === 'users'">
                <span class="el-select" v-if="filterType === 'users' && !myselfAuthority">
                    <span class="el-input">
                        <i class="el-select__caret el-input__icon el-icon-arrow-up"></i>
                    </span>
                </span>
            </template>
            <template v-if="filterType !== 'users'">
                <span class="el-select">
                    <span class="el-input">
                        <i class="el-select__caret el-input__icon el-icon-arrow-up"></i>
                    </span>
                </span>
            </template>
        </div>

        <!-- Poptip 内容 -->
        <div class="card-filter__popper">
            <!-- 日期时间型 -->
            <template v-if="filterType === 'date'">
                <div class="small-date-panel-container">
                    <DatePicker v-model="dates"
                                type="daterange"
                                :picker-options="dateOptions"
                                value-format="timestamp"
                                :inline="true"
                                ref="datePicker"
                                @click.native.capture="handleDatePickerClick"
                                class="small-date-panel"></DatePicker>
                </div>
            </template>
             <!-- 日期时间型 -->
             <template v-if="filterType === 'dateMothe'">
                <div class="small-date-panel-container">
                    <DatePicker v-model="datesMonth"
                                type="monthrange"
                                :picker-options="dateMotheOptions"
                                value-format="timestamp"
                                :inline="true"
                                ref="datePicker"
                                size="mini"
                                @click.native.capture="handleDatePickerClick"
                                class="small-date-panel dateMothe"></DatePicker>
                </div>
            </template>
            <!-- 用户型 -->
            <div class="filter-content" v-else-if="filterType === 'users' && !myselfAuthority">
                <div class="title">
                    <Icon custom="custom-table-filter"></Icon>
                    <span>{{ $t("tableFilter.contentFilter") }}</span>
                    <!--<span v-if="filtering" @click="clear_filter" class="clear-filter">{{-->
                      <!--$t("tableFilter.clearFilter")-->
                    <!--}}</span>-->
                </div>
                <template>
                    <Input
                            v-model="keywords"
                            :placeholder="$t('tableFilter.tip_inputKeyWords')"
                            @input="generate_child_tree(keywords)"
                    >
                    <Icon
                            slot="suffix"
                            type="ios-search"
                            :size="16"
                            @click.native="generate_child_tree(keywords)"
                            style="line-height: 32px; cursor: pointer"
                    ></Icon>
                    </Input>
                    <div
                            class="filter-items filter-tree"
                            :style="{ 'max-height': '289px' }"
                    >
                        <!--<Tree-->
                                <!--v-model="selected_userId"-->
                                <!--:data="tree_data"-->
                                <!--&lt;!&ndash;show-checkbox&ndash;&gt;-->
                                <!--default-expand-all-->
                                <!--node-key="id"-->
                                <!--:render-content="renderContent"-->
                                <!--ref="update_tree"-->
                                <!--style="margin-top: 15px"-->
                                <!--@check-change="change_selected_userIds"-->
                        <!--&gt;</Tree>-->
                        <Tree :data="tree_data" :render-content="renderContent" :default-expand-all="true">
                        </Tree>
                    </div>
                </template>
            </div>

            <!-- 底部按钮 -->
            <div v-if="filterType !== 'users'"
                 class="card-filter-btns">
                <Button @click="cancel"
                        type="minor"
                        size="small">{{ $t('cancel') }}</Button>
                <Button type="success"
                        size="small"
                        @click="confirm"
                        :class="filterDateClass">{{ $t('confirm') }}</Button>
            </div>
        </div>
    </Poptip>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    export default {
        name: 'card-filter',
        props: [
            // 所属 card 类型
            'cardType',
            // 筛选类型
            'filterType',
            // 筛选 key
            'filterKey',
            // 筛选值
            'filterValue'
        ],
        computed: {
            ...mapState({
                userId: state => state.userId,
                fullName: state => state.fullName,
                userName: state => state.userName,
                orgId: state => state.enterpriseId
            }),
            // 弹出浮层宽度
            width_popper() {
                // 根据不同的筛选类型, 显示不同宽度的浮层
                switch (this.filterType) {
                    case 'date':
                        // 日期型
                        return 650;
                    case 'dateMothe':
                        // 日期型
                        return 650;
                    case 'users':
                        // 用户型
                        return 320;
                    default:
                        return 230;
                }
            },
            // 筛选框确认按钮 piwik class
            filterDateClass() {
                return `piwik_${this.cardType}_filterDate`;
            }
        },
        data() {
            return {
                /* 全局 */
                // 筛选标题
                title: '',

                /* 日期型筛选 */
                // 日期筛选值
                dates: [],
                datesMonth: [],
                // 日期选择方式, 'shortCut' 代表快捷选项选择, ''为其他
                dateChangeType: '',
                // 日期筛选快捷选项
                dateOptions: {
                    shortcuts: [
                        {
                            range: 'today', // 非标准属性, 本页面用来匹配手动选择的日期和快捷选项用
                            text: this.$t('crm.Table.today'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            range: 'yesterday',
                            text: this.$t('crm.Table.yesterday'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(start.getTime() - 3600 * 1000 * 24);
                                end.setTime(end.getTime() - 3600 * 1000 * 24);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            range: 'thisWeek',
                            text: this.$t('crm.Table.thisWeek'),
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
                            range: 'lastWeek',
                            text: this.$t('crm.Table.lastWeek'),
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
                            range: 'thisMonth',
                            text: this.$t('crm.Table.thisMonth'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                start.setTime(new Date(start.getFullYear(), start.getMonth(), 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            range: 'lastMonth',
                            text: this.$t('crm.Table.lastMonth'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() - 24 * 60 * 60 * 1000);
                                start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            range: 'thisSeason',
                            text: this.$t('crm.Table.thisSeason'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                const monthNo = start.getMonth();
                                const season = Math.floor(monthNo / 3);

                                start.setTime(new Date(start.getFullYear(), season * 3, 1).getTime());
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            range: 'lastSeason',
                            text: this.$t('crm.Table.lastSeason'),
                            onClick(picker) {
                                const end = new Date();
                                const start = new Date();
                                const monthNo = start.getMonth();
                                const season = Math.floor(monthNo / 3);
                                const year = start.getFullYear();

                                start.setTime(new Date(year - (season > 0 ? 0 : 1), (season - 1) * 3, 1).getTime());
                                end.setTime(new Date(year - (season > 0 ? 0 : 1), season * 3, 1).getTime() - 24 * 60 * 60 * 1000);
                                picker.$emit('pick', [start, end]);
                            }
                        },
                        {
                            range: 'all',
                            text: this.$t('all'),
                            onClick(picker) {
                                picker.$emit('pick', []);
                            }
                        }
                    ]
                },
                dateMotheOptions: {
                    shortcuts: [{
                        text: this.$t('dashBoardV2.Select.thisMonth'),
                        range: 'thisMonth',
                        onClick(picker) {
                            const year = new Date().getFullYear();
                            const month = new Date().getMonth() + 1;
                            picker.$emit('pick', [new Date(`${year}-${month}-01`), new Date(year, month, 0)]);
                        }
                    }, {
                        text: this.$t('dashBoardV2.Select.lastMonth'),
                        range: 'lastMonth',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() - 24 * 60 * 60 * 1000);
                            start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: this.$t('dashBoardV2.Select.currentPeriod'),
                        range: 'thisPeriod',
                        onClick(picker) {
                            const myDate = new Date();
                            const myMonth = myDate.getMonth() + 1;
                            const curPeriod = Math.floor((myMonth % 3 === 0 ? (myMonth / 3) : (myMonth / 3 + 1)));
                            const myYear = myDate.getFullYear();
                            let timeRange = [];
                            switch (curPeriod) {
                                case 1:
                                    timeRange = [new Date(`${myYear}-01-01`), new Date(`${myYear}-03-31`)];
                                    break;
                                case 2:
                                    timeRange = [new Date(`${myYear}-04-01`), new Date(`${myYear}-06-30`)];
                                    break;
                                case 3:
                                    timeRange = [new Date(`${myYear}-07-01`), new Date(`${myYear}-09-30`)];
                                    break;
                                case 4:
                                    timeRange = [new Date(`${myYear}-10-01`), new Date(`${myYear}-12-31`)];
                                    break;
                            };
                            picker.$emit('pick', timeRange);
                        }
                    }, {
                        text: this.$t('dashBoardV2.Select.thisYearNew'),
                        range: 'allYear',
                        onClick(picker) {
                            const myYear = new Date().getFullYear();
                            picker.$emit('pick', [new Date(`${myYear}-01-01 00:00:00`).getTime(), new Date(`${myYear}-12-31 00:00:00`).getTime()]);
                        }
                    }]
                },
                selected_userId: {},
                tree_data: [],
                init_tree: [],
                user_list: [],
                keywords: '', // 搜索词，
                treeItemClass: '',
                myselfAuthority: false
            };
        },
        methods: {
            /* 全局 */
            // 触发筛选
            filter() {
                // 向上触发筛选
                let filterData;
                switch (this.filterType) {
                    case 'date':
                        filterData = {
                            filterKey: this.filterKey,
                            filterType: this.filterType,
                            filterValue: this.dates
                        };
                        break;
                    case 'dateMothe':
                        filterData = {
                            filterKey: this.filterKey,
                            filterType: this.filterType,
                            filterValue: this.datesMonth
                        };
                        break;
                    case 'users':
                        filterData = {
                            filterKey: this.filterKey,
                            filterType: this.filterType,
                            filterValue: this.filterValue,
                            userId: this.selected_userId.id,
                            userName: this.selected_userId.title
                        };
                        break;
                }
                this.$emit('handleFilter', filterData);
            },

            /* 日期型 */
            // 计算快捷选项的日期范围
            calcDateRange() {
                const tempDate = new Date();
                const today = tempDate.setHours(0, 0, 0, 0);
                const yesterday = today - 3600 * 1000 * 24;
                let dayNo = tempDate.getDay();
                dayNo = dayNo ? dayNo - 1 : 6;
                const weekStart = today - dayNo * 24 * 60 * 60 * 1000;
                dayNo = tempDate.getDay();
                dayNo = dayNo || 7;
                const lastWeekEnd = today - dayNo * 24 * 60 * 60 * 1000;
                const lastWeekStart = lastWeekEnd - 6 * 24 * 60 * 60 * 1000;
                const yearNo = tempDate.getFullYear();
                const monthNo = tempDate.getMonth();
                const monthStart = new Date(yearNo, monthNo, 1).getTime();
                const lastMonthEnd = monthStart - 24 * 60 * 60 * 1000;
                const lastMonthStart = (new Date(yearNo, monthNo - 1, 1)).getTime();
                const seasonNo = Math.floor(monthNo / 3);
                const seasonStart = (new Date(yearNo, seasonNo * 3, 1).getTime());
                const lastSeasonStart = new Date(yearNo - (seasonNo > 0 ? 0 : 1), (seasonNo - 1) * 3, 1).getTime();
                const lastSeasonEnd = new Date(yearNo - (seasonNo > 0 ? 0 : 1), seasonNo * 3, 1).getTime() - 24 * 60 * 60 * 1000;

                return {
                    today: [today, today],
                    yesterday: [yesterday, yesterday],
                    thisWeek: [weekStart, today],
                    lastWeek: [lastWeekStart, lastWeekEnd],
                    thisMonth: [monthStart, today],
                    lastMonth: [lastMonthStart, lastMonthEnd],
                    thisSeason: [seasonStart, today],
                    lastSeason: [lastSeasonStart, lastSeasonEnd],
                    all: []
                };
            },
            /* 日期型 */
            // 计算快捷选项的日期范围
            calcDateMonthRange() {
                const tempDate = new Date();
                const end = new Date();
                const start = new Date();
                end.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime() - 24 * 60 * 60 * 1000);
                start.setTime(new Date(start.getFullYear(), start.getMonth() - 1, 1).getTime());


                const myMonth = tempDate.getMonth() + 1;
                const curPeriod = Math.floor((myMonth % 3 === 0 ? (myMonth / 3) : (myMonth / 3 + 1)));
                const myYear = tempDate.getFullYear();
                let timeRange = [];
                switch (curPeriod) {
                    case 1:
                        timeRange = [new Date(`${myYear}-01-01 00:00:00`).getTime(), new Date(`${myYear}-03-31 00:00:00`).getTime()];
                        break;
                    case 2:
                        timeRange = [new Date(`${myYear}-04-01 00:00:00`).getTime(), new Date(`${myYear}-06-30 00:00:00`).getTime()];
                        break;
                    case 3:
                        timeRange = [new Date(`${myYear}-07-01 00:00:00`).getTime(), new Date(`${myYear}-09-30 00:00:00`).getTime()];
                        break;
                    case 4:
                        timeRange = [new Date(`${myYear}-10-01 00:00:00`).getTime(), new Date(`${myYear}-12-31 00:00:00`).getTime()];
                        break;
                };
                const year = new Date().getFullYear();
                const month = new Date().getMonth() + 1;
                return {
                    thisMonth: [new Date(`${year}-${month}-01`).getTime(), new Date(year, month, 0).getTime()],
                    lastMonth: [start.getTime(), end.getTime()],
                    thisPeriod: timeRange,
                    allYear: [new Date(`${myYear}-01-01 00:00:00`).getTime(), new Date(`${myYear}-12-31 00:00:00`).getTime()]
                };
            },
            // 监听日期选择器捕获型点击事件
            handleDatePickerClick(e) {
                if (e.target.classList.contains('el-picker-panel__shortcut')) {
                    // 如果点击了左侧快捷选项

                    // 记录"当前日期选择方式"为快捷选项
                    this.dateChangeType = 'shortCut';
                    // 标题改为快捷选项标题
                    this.title = e.target.innerText;
                    // 被点中的快捷选项增加 active class
                    Array.from(e.target.parentElement.querySelectorAll('.el-picker-panel__shortcut')).forEach(el => {
                        el.classList.remove('active-shortCut');

                        if (el === e.target) {
                            el.classList.add('active-shortCut');
                        }
                    });
                } else {
                    // 如果点击的不是左侧快捷选项, 说明下次日期变更是因为手动点选日期

                    // 重置"当前日期选择方式"
                    this.dateChangeType = '';
                }
            },
            /* 部门树渲染函数 */
            renderContent(h, { data }) {
                if (data.type) {
                    return h('span', {
                        style: { background: this.treeItemClass },
                        on: {
                            click: (bool) => {
                                this.recursiveTree(this.tree_data, data.id, data.checked);
                            }
                        }
                    }, [
                        h('Icon', {
                            props: {
                                size: '16',
                                custom: 'custom custom-person'
                            },
                            style: {
                                color: '#677f99',
                                marginRight: '5px',
                                marginLeft: '5px',
                                paddingBottom: '1px'
                            }
                        }),
                        h('span', { class: '' }, data.title)
                    ]);
                } else {
                    return h('span', {}, [
                        h('Icon', {
                            props: {
                                size: '16',
                                custom: 'custom custom-group'
                            },
                            style: {
                                color: '#677f99',
                                marginRight: '5px',
                                marginLeft: '5px',
                                paddingBottom: '1px'
                            }
                        }),
                        h('span', {
                            style: {
                                display: 'inline-block',
                                verticalAlign: 'middle'
                            }
                        }, data.title)

                    ]);
                }
            },
            recursiveTree(tree, id, checked) {
                tree.forEach(item => {
                    if (item.children.length) {
                        this.recursiveTree(item.children, id, checked);
                    } else {
                        if (id === item.id) {
                            this.treeItemClass = '#F5F7FA';
                            this.selected_userId = {
                                id: item.id,
                                title: item.title
                            };
                            this.filter();
                            this.closePoptip();
                        } else {
                            this.treeItemClass = '';
                        }
                    }
                });
            },
            /* 用户型 */
            get_update_tree() {
                util.ajax({
                    url: '/new-privilege/department/getCrmManageDepartments',
                    method: 'get',
                    params: {
                        orgId: this.orgId,
                        userId: this.userId
                    }
                }).then(({ data }) => {
                    if (data.code === '1') {
                        return new Promise((resolve) => {
                            this.init_tree = data.data;
                            if (Array.isArray(data.data) && data.data.length) {
                                resolve();
                            } else {
                                this.loading_tree = false;
                            }
                        });
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.departmentErr'));
                        this.loading_tree = false;
                    }
                }).then((data) => {
                    util
                        .ajaxJson({
                            url: '/new-privilege/user/getCrmUserByleaderUserId',
                            method: 'get',
                            params: {
                                orgId: this.orgId,
                                userId: this.userId
                            }
                        }).then(({ data }) => {
                            if (data.code === '1') {
                                this.user_list = data.data;
                                this.tree_data = this.get_tree(this.init_tree, this.user_list);
                                if (!this.blank) {
                                    this.tree_data = [...this.tree_data];
                                } else {
                                    this.tree_data = [...this.tree_data].concat([
                                        {
                                            checked: false,
                                            children: [],
                                            expand: true,
                                            id: -1,
                                            parentId: 0,
                                            type: 'person',
                                            title: this.$t('tableFilter.defaultOption_blank')
                                        }
                                    ]);
                                }
                            } else {
                                this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                            }
                            this.loading_tree = false;
                        });
                });
            },
            get_tree(param_arr, user_list, check_arr) {
                const userList = user_list.map((item) => {
                    const obj = {};
                    obj.parentId = item.departmentId;
                    obj.name = item.fullname;
                    obj.power = item.manageName;
                    obj.id = item.id;
                    obj.check = false;
                    obj.type = 'person';
                    if (item.canGetInquiry === 1 && !item.isDelete) {
                        return obj;
                    } else {
                        return false;
                    }
                });
                if (check_arr) {
                    for (const check_item of check_arr) {
                        for (const user_item of userList) {
                            if (check_item.userId === user_item.id) {
                                user_item.check = true;
                            }
                        }
                    }
                }
                const arr = param_arr.map((item) => {
                    const obj = {};
                    obj.parentId = item.parentId;
                    obj.name = item.name;
                    obj.id = item.id;
                    return obj;
                });
                let parent_arr = [];

                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].parentId === 0) {
                        parent_arr.push(arr[i]);
                        arr.splice(i, 1);
                        i = i - 1;
                    }
                }

                function structure_parent_arr(arr) {
                    return arr.map((item) => {
                        const obj = {};
                        obj.title = item.name;
                        obj.id = item.id;
                        obj.parentId = item.parentId;
                        obj.checked = item.check;
                        obj.expand = true;
                        obj.children = [];
                        return obj;
                    });
                }

                parent_arr = structure_parent_arr(parent_arr);

                function build_child(parent_arr, arr) {
                    /**
                     * @Description: 企业下人员列表和部门列表在后端存储的是两张表，存在人员id和部门id相同的情况
                     * 一旦出现这种情况，会导致本来应属于某一部门下的人员，出现在某一人员的子节点中，示例见bug[1002136]
                     * 解决方案为：
                     * 在获取人员列表时，每一项加上type='person'，部门列表每一项添加上type='department'，
                     * 遍历添加子节点时，加上filter，解决当传入的父节点数组中既有人员又有部门的情况，
                     * 保证只有type为department的父节点才会有children属性，才可以添加子节点
                     * @author 杨娣filter
                     * @date 2019/11/22
                     */
                    parent_arr = parent_arr.filter((item) => item.type !== 'person');
                    for (let j = 0; j < parent_arr.length; j++) {
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i].parentId === parent_arr[j].id) {
                                parent_arr[j].checked = false;
                                const obj = {};
                                obj.title = arr[i].name;
                                obj.id = arr[i].id;
                                obj.power = arr[i].power;
                                obj.parentId = arr[i].parentId;
                                obj.grandpa_id = parent_arr[j].parentId;
                                obj.parent_name = parent_arr[j].title;
                                if (arr[i].category === 1) {
                                    obj.menu = 'department';
                                } else {
                                    obj.menu = 'person';
                                }
                                obj.type = arr[i].type;
                                obj.expand = true;
                                obj.checked = arr[i].check;
                                obj.children = [];
                                parent_arr[j].children.push(obj);
                                arr.splice(i, 1);
                                i = i - 1;
                            }
                        }
                    }
                    if (arr.length) {
                        for (const child_item of parent_arr) {
                            if (child_item.children.length) {
                                build_child(child_item.children, arr);
                            }
                        }
                    }

                    return parent_arr;
                }

                const new_arr = arr.concat(userList);
                return build_child(parent_arr, new_arr);
            },
            generate_child_tree(title) {
                const str_searched = title || ''; // 要搜索的文字
                const temp_tree_data = this.get_tree(this.init_tree, this.user_list, []); // 全量 tree_data

                function search_title_recursively(nodes, str_searched) {
                    return nodes.map((node) => {
                        if (node.title.includes(str_searched)) {
                            return node;
                        } else if (node.children.length) {
                            node.children = search_title_recursively(
                                node.children,
                                str_searched
                            );
                            if (node.children.length) {
                                return node;
                            } else {
                                return undefined;
                            }
                        } else {
                            return undefined;
                        }
                    })
                        .filter((item) => item);
                }

                this.tree_data = search_title_recursively(temp_tree_data, str_searched);
            }, // 根据 id 在页面中定位常用检索, 返回值为"定位是否成功"
            /* 确定取消 */
            confirm() {
                switch (this.filterType) {
                    case 'date':
                        this.filter();
                        break;
                    case 'dateMothe':
                        if (new Date(this.datesMonth[0]).getFullYear() !== new Date(this.datesMonth[1]).getFullYear()) {
                            this.$Message.error(this.$t('dashBoardV2.tips.monthError'));
                            return;
                        }
                        // 业绩完成报表处理特殊情况，选取月份时，结束日期是本月的最后一天，因为之前业绩目标接口做了截取月份处理，但是业绩完成情况接口没处理，需要前端做兼容
                        if (this.cardType === 'completion') {
                            const endTime = new Date(this.datesMonth[1]);
                            const endYear = endTime.getFullYear();
                            const endMonth = endTime.getMonth() + 1;
                            this.datesMonth = [this.datesMonth[0], new Date(endYear, endMonth, 0).getTime()];
                        }
                        this.filter();
                        break;
                }
                this.closePoptip();
            },
            cancel() {
                // 恢复时间筛选初始值
                if (this.filterType === 'date') {
                    this.dateChangeType = '';
                    if (Array.isArray(this.filterValue) && this.filterValue.every(item => Number.isInteger(item)) && [0, 2].includes(this.filterValue.length)) {
                        this.dates = this.filterValue.slice();
                    } else {
                        this.dates = [];
                    }
                }
                if (this.filterType === 'dateMothe') {
                    this.dateChangeType = '';
                    if (Array.isArray(this.filterValue) && this.filterValue.every(item => Number.isInteger(item)) && [0, 2].includes(this.filterValue.length)) {
                        this.datesMonth = this.filterValue.slice();
                    } else {
                        this.datesMonth = [];
                    }
                }
                // 关闭弹窗
                this.closePoptip();
            },
            closePoptip() {
                this.$refs.poptip.doClose();
            },
            // 查询当前得用户得管理权限是否为本人
            getUserAuthority() {
                util.ajaxJson({
                    url: '/new-privilege/manage/getusers',
                    method: 'get',
                    params: {
                        orgId: this.orgId,
                        userId: this.userId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        if (res.data.data.length === 1) {
                            this.myselfAuthority = true;
                        }
                    }
                });
            }
        },
        mounted() {
            if (this.filterType === 'users') {
                this.getUserAuthority();
            }

            // 日期筛选, 为指定的 cardType 去掉"全部"快捷选项
            if (this.filterType === 'date') {
                switch (this.cardType) {
                    case 'webDataOverview':
                    case 'websiteTrafficStatus':
                    case 'visitorAnalysis':
                    case 'visitTrafficAnalysis':
                    case 'msgStatusStatistics':
                    case 'msgPageStatus':
                    case 'serviceWorkStatus':
                        this.dateOptions.shortcuts = this.dateOptions.shortcuts.filter(item => item.range !== 'all');
                        break;
                }
            }
        },
        watch: {
            filterValue: {
                handler(val) {
                    // 日期型筛选
                    if (this.filterType === 'date') {
                        if (Array.isArray(val) && val.every(item => Number.isInteger(item)) && [0, 2].includes(val.length)) {
                            this.dates = val.slice();
                        }
                    }
                    if (this.filterType === 'dateMothe') {
                        if (Array.isArray(val) && val.every(item => Number.isInteger(item)) && [0, 2].includes(val.length)) {
                            this.datesMonth = val.slice();
                        }
                    }
                },
                immediate: true
            },
            dates: {
                handler(val) {
                    if (this.filterType !== 'date') {
                        return;
                    }
                    // 匹配手动选择的日期和快捷选项
                    if (this.dateChangeType !== 'shortCut') {
                        // 当前是手动选择日期

                        // 计算得到所有快捷选项的日期范围, 格式为 range: [timeStamp, timeStamp]
                        const dateRangeObj = this.calcDateRange();
                        // 转换当前日期数组为当天 0 时时间戳数组
                        const stamps = val.map(item => {
                            const temp = new Date(item);
                            return temp.setHours(0, 0, 0, 0);
                        });

                        // 匹配当前时间戳数组和快捷选项
                        let range;
                        Object.entries(dateRangeObj).some(([key, value]) => {
                            if (JSON.stringify(value) === JSON.stringify(stamps)) {
                                range = key;
                                return true;
                            }
                        });

                        if (range) {
                            // 如果匹配到快捷选项
                            const shortCutIndex = this.dateOptions.shortcuts.findIndex(item => item.range === range);
                            if (shortCutIndex !== -1) {
                                // 设置 title 为快捷选项 text
                                this.title = this.dateOptions.shortcuts[shortCutIndex].text;

                                // 设置快捷选项 active class
                                setTimeout(() => {
                                    Array.from(this.$refs.datePicker.$el.querySelectorAll('.el-picker-panel__shortcut')).forEach((el, index) => {
                                        el.classList.remove('active-shortCut');

                                        if (shortCutIndex === index) {
                                            el.classList.add('active-shortCut');
                                        }
                                    });
                                });
                            }
                        } else if (stamps.length === 2) {
                            // 如果未匹配到快捷选项

                            // 设置 title 为日期范围
                            this.title = `${this.$options.filters.timeFormat(stamps[0])} - ${this.$options.filters.timeFormat(stamps[1])}`;

                            // 清除 shortCut active class
                            setTimeout(() => {
                                Array.from(this.$refs.datePicker.$el.querySelectorAll('.el-picker-panel__shortcut')).forEach(el => {
                                    el.classList.remove('active-shortCut');
                                });
                            });
                        }
                    }
                },
                immediate: true
            },
            datesMonth: {
                handler(val) {
                    if (this.filterType !== 'dateMothe') {
                        return;
                    }
                    if (new Date(val[0]).getFullYear() !== new Date(val[1]).getFullYear()) {
                        return;
                    }
                    if (val[0] === val[1]) {
                        const endTime = new Date(val[1]);
                        const endYear = endTime.getFullYear();
                        const endMonth = endTime.getMonth() + 1;
                        this.datesMonth = [val[0], new Date(endYear, endMonth, 0).getTime()];
                        return;
                    }
                    // 匹配手动选择的日期和快捷选项
                    if (this.dateChangeType !== 'shortCut') {
                        // 当前是手动选择日期

                        // 计算得到所有快捷选项的日期范围, 格式为 range: [timeStamp, timeStamp]
                        const dateRangeObj = this.calcDateMonthRange();
                        // 转换当前日期数组为当天 0 时时间戳数组
                        const stamps = val.map(item => {
                            const temp = new Date(item);
                            return temp.setHours(0, 0, 0, 0);
                        });

                        // 匹配当前时间戳数组和快捷选项
                        let range;
                        Object.entries(dateRangeObj).some(([key, value]) => {
                            if (JSON.stringify(value) === JSON.stringify(stamps)) {
                                range = key;
                                return true;
                            }
                        });
                        if (range) {
                            // 如果匹配到快捷选项
                            const shortCutIndex = this.dateMotheOptions.shortcuts.findIndex(item => item.range === range);
                            if (shortCutIndex !== -1) {
                                // 设置 title 为快捷选项 text
                                this.title = this.dateMotheOptions.shortcuts[shortCutIndex].text;

                                // 设置快捷选项 active class
                                setTimeout(() => {
                                    Array.from(this.$refs.datePicker.$el.querySelectorAll('.el-picker-panel__shortcut')).forEach((el, index) => {
                                        el.classList.remove('active-shortCut');

                                        if (shortCutIndex === index) {
                                            el.classList.add('active-shortCut');
                                        }
                                    });
                                });
                            }
                        } else if (stamps.length === 2) {
                            // 如果未匹配到快捷选项

                            // 设置 title 为日期范围
                            const endTime = new Date(stamps[1]);
                            const endYear = endTime.getFullYear();
                            const endMonth = endTime.getMonth() + 1;


                            this.title = `${this.$options.filters.timeFormat(stamps[0])} - ${this.$options.filters.timeFormat(new Date(endYear, endMonth, 0).getTime())}`;

                            // 清除 shortCut active class
                            setTimeout(() => {
                                Array.from(this.$refs.datePicker.$el.querySelectorAll('.el-picker-panel__shortcut')).forEach(el => {
                                    el.classList.remove('active-shortCut');
                                });
                            });
                        }
                    }
                },
                immediate: true
            },
            selected_userId: {
                handler(val) {
                    if (this.filterType !== 'users') {
                        return;
                    }

                    if (!this.tree_data.length) {
                        this.get_update_tree();
                    }
                    this.title = val.title || this.fullName;
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less">
   @import '../filter.less';
</style>
