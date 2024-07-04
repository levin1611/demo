<template>
  <div ref="container" class="container-searchCommon">
    <!-- 默认筛选 -->
    <!-- 全部 -->
    <template v-if="type !== 'highseasCustomer' && type !== 'myClue'">
      <div
        v-if="name_filter_all"
        @click="searchDefault('all')"
        :class="{
          'active-filter-btn': id_selected_commonSearch === 'all',
          'commonSearch-item': true,
          'general-commonSearch-item': true,
        }"
      >
        <Icon custom="custom-filter" color="#A9B9C9"></Icon>
        <span style="position: relative">&nbsp;{{ name_filter_all }}</span>
      </div>

      <!-- 我的 -->
      <div
        v-if="name_filter_mine"
        @click="searchDefault('mine')"
        :class="{
          'active-filter-btn': id_selected_commonSearch === 'mine',
          'commonSearch-item': true,
          'general-commonSearch-item': true,
        }"
      >
        <Icon custom="custom-filter" color="#A9B9C9"></Icon>
        <span style="position: relative">&nbsp;{{ name_filter_mine }}</span>
      </div>
    </template>
    <template v-else>
      <div
        v-if="name_filter_all"
        @click="searchDefault('all')"
        :class="{
          'active-filter-btn': id_selected_commonSearch === 'all',
          'commonSearch-item': true,
          'general-commonSearch-item': true,
        }"
      >
        <Icon custom="custom-filter" color="#A9B9C9"></Icon>
        <span style="position: relative">&nbsp;{{ name_filter_all }}</span>
      </div>
    </template>
    <!-- 公海分组检索列表 -->
    <template v-if="type === 'highseasCustomer'">
      <div
        v-for="item in highSeasGroupList"
        :key="item.id"
        @click="searchHighSeasGroup(item.id, item.seasGroupName)"
        :class="{
          'active-filter-btn': id_selected_commonSearch === item.id,
          'commonSearch-item': true,
          'general-commonSearch-item': true,
        }"
      >
        <Icon custom="custom-filter" color="#A9B9C9"></Icon>
        <span style="position: relative">&nbsp;{{item.seasGroupName}}</span>
      </div>
    </template>
    <!-- 线索检索列表 -->
    <template v-if="type === 'myClue'">
      <template v-for="item in myClueGroupList">
        <div
            :key="item.id"
            v-if="(item.id === 'myCharge' && myCharge)
            || (item.id === 'myCreate' && myCreate)
            || (item.id === 'myChargeTran' && myChargeTran)
            || (item.id === 'myCreateTran' && myCreateTran)"
            @click="searchMyClueGroup(item.id, item.seasGroupName)"
            :class="{
              'active-filter-btn': id_selected_commonSearch === item.id,
              'commonSearch-item': true,
              'general-commonSearch-item': true,
            }"
          >
            <Icon custom="custom-filter" color="#A9B9C9"></Icon>
            <span style="position: relative">&nbsp;{{item.seasGroupName}}</span>
        </div>
      </template>
    </template>
    <!-- 线索检索列表 -->
    <template v-if="type === 'followUpPlan'">
        <div @click="searchDefault('subordinatePlan')" :class="{'active-filter-btn': id_selected_commonSearch === 'subordinatePlan'}" class="commonSearch-item general-commonSearch-item">
            <Icon custom="custom-filter" color="#A9B9C9"></Icon>
            <span style="position: relative">&nbsp;{{$t('crm.Table.subordinateFollowUpPlan')}}</span>
        </div>
        <div @click="searchDefault('myCreatePlan')" :class="{'active-filter-btn': id_selected_commonSearch === 'myCreatePlan'}" class="commonSearch-item general-commonSearch-item">
            <Icon custom="custom-filter" color="#A9B9C9"></Icon>
            <span style="position: relative">&nbsp;{{$t('crm.Table.myCreateFollowUpPlan')}}</span>
        </div>
    </template>
    <!-- 常用检索树 -->
    <div style="position: relative">
      <!-- loading -->
      <Spin fix v-if="loading"></Spin>

      <!-- tree -->
      <!-- 使用 render 后居然就不触发 on-select-change 了... -->
      <Tree
        :data="treeData"
        :render-content="render_tree_node"
        empty-text=""
        node-key="id"
        :default-expanded-keys="defaultExpandedKeys"
        draggable
        :allow-drop="allowDrop"
        @node-drop="nodeDrop"
        class="commonSearch-tree id_commonSearch_0"
      ></Tree>
    </div>
  </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import { highSeasGroup } from '@/api/systemSettings/high-seas-grouping/index';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { env } from '@/../build/config';
    const { publicSeasGroup } = highSeasGroup;


    export default {
        name: 'searchCommon',
        props: [
            /* topFilter 相关 */
            'type_search', // 当前筛选面板类型, 和 flag 一起触发筛选
            'list_commonSearch', // 当前常用检索列表
            'id_selected_commonSearch', // 正在筛选的常用检索的 ID

            /* 表格页相关 */
            'flag_topFilter', // flag , 表格页触发筛选
            'columnType', // 表格页类型 1客户2联系人3询盘4公海客户5线索6公海线索7fbleads8权限部门用户管理9功能权限管理10访客历史11网站留言12whatsapp
            'filtering', // 表格页"筛选类型"变量, 在合并顶部筛选条件和表头筛选条件时用
            'common_conditions', // 表格页"常用检索数据对象"变量, 合并时用
            'sql_manager', // 当前表格页"负责人"对应的 sql 条件(其实不一定是 sql 条件, 准确来说是 getSearchCon 里"负责人"对应的字符串), 用来筛选"我的"

            /* 自定义检索 */
            'newId', // 新增常用检索的 id
            'parentSearchData', // 要创建子级检索的常用检索数据
            'editSearchData', // 要编辑的检索数据
            'type',
            'KeepFilter' // 保持whatsapp筛选阈值
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                button_list: state => state.app.button_list,
                isDashboardjumping: state => state.crm.isDashboardjumping
            }), // 从 vuex 中获取属性
            name_filter_all() {
                switch (`${this.columnType}`) {
                    case '1': // 客户
                        return this.$t('crm.Table.allCustomer');
                    case '2': // 联系人
                        return this.$t('crm.Table.allContact');
                    case '3': // 询盘
                        return this.$t('crm.Table.allInquiry');
                    case '4': // 公海管理
                        return this.$t('crm.Table.highseasCustomer');
                    case '5': // 线索
                        return this.$t('clue.all_clue');
                    case '6': // 线索
                        return this.$t('clue.public_clue');
                    case '12': // 线索
                        return '全部联系人';
                    case '18': // 跟进计划
                        return this.$t('crm.Table.allfollowUpPlan');
                    default:
                        // 默认显示 "全部"
                        return this.$t('all');
                }
            }, // 文字 - "全部xx"
            name_filter_mine() {
                switch (`${this.columnType}`) {
                    case '1': // 客户
                        return this.$t('crm.Table.myCustomer');
                    case '2': // 联系人
                        return this.$t('crm.Table.myContact');
                    case '3': // 询盘
                        return this.$t('crm.Table.myInquiry');
                    case '4': // 公海管理
                        return this.$t('crm.Table.highseasCustomer'); // 空则不显示
                    case '5': // 线索
                        return this.$t('clue.my_clue');
                    case '18': // 跟进计划
                        return this.$t('crm.Table.myFollowUpPlan');
                    default:
                        // 默认不显示
                        return '';
                }
            }, // 文字 - "我的xx"
            treeData() {
                /* 定义变量 */
                const vm = this; // 暂存 this
                const sortObj = {}; // 存放 { parentId: 子级筛选顺序数组 }
                const root = {
                    id: 0, // 自身 Id , 与所有一级筛选的 parentId 相同
                    level: 0, // 层级
                    children: [] // 子节点数组, 最终返回的 treeData
                }; // 假定一个根结点

                /* 定义递归函数 */
                // 递归函数, 构造树结构并排序   arr: 常用检索数组, parent: 父级结点数据
                function recursion(arr, parent) {
                    if (arr.length) {
                        // 筛出同一层结点(父级结点为 parent)数据并排序
                        let temp = arr
                            .filter((item) => item.parentId === parent.id)
                            .sort((a, b) => a.colOrder - b.colOrder);
                        // 从数组中去掉之前筛出的数据
                        arr = arr.filter((item) => item.parentId !== parent.id);

                        if (temp.length) {
                            // 存入排序数组
                            sortObj[parent.id] = temp.map((item) => item.id);

                            // 格式化结点数据
                            temp = temp.map((node) => {
                                node.title = node.searchName;
                                node.selected = `${node.id}` === `${vm.id_selected_commonSearch}`;
                                node.level = parent.level + 1;
                                node.count_siblings = temp.length;

                                return node;
                            });

                            // 递归处理
                            temp.forEach((item) => {
                                recursion(arr, item);
                            });

                            // 赋值
                            parent.children = temp;
                        }
                    }
                }

                /* 执行递归 */
                recursion(vm.list_commonSearch, root);

                // 更新顺序对象
                vm.sortObj = sortObj;

                return root.children;
            }, // 格式化常用检索列表为树结构数据
            myCharge() {
                return !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.myCharge, this.button_list);
            },
            myCreate() {
                return !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.myCreate, this.button_list);
            },
            myChargeTran() {
                return !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.myChargeTran, this.button_list);
            },
            myCreateTran() {
                return !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.myCreateTran, this.button_list);
            }
        },
        data() {
            return {
                /* 全局 */
                loading: false, // 请求检索列表时的"加载中"
                env,
                myClueGroupList: [
                    {
                        id: 'myCharge', // 2
                        seasGroupName: '我负责的'
                    },
                    {
                        id: 'myCreate', // 5
                        seasGroupName: '我创建的'
                    },
                    {
                        id: 'myChargeTran', // 4
                        seasGroupName: '我负责待转化的'
                    },
                    {
                        id: 'myCreateTran', // 6
                        seasGroupName: '我创建待转化的'
                    }
                ],
                vm: this,

                /* 树 */
                sortObj: {}, // parentId: 排序数组[id, id, ...]
                defaultExpandedKeys: [], // 默认展开的结点, node-key 为 id
                highSeasGroupList: [] // 公海分组列表数据
            };
        },
        methods: {
            // 获取公海分组列表
            getPublicSeasGroup() {
                publicSeasGroup().then(res => {
                    if (res.code === '1') {
                        this.highSeasGroupList = res.data.map(item => {
                            const obj = {
                                id: item.id,
                                seasGroupName: item.seasGroupName
                            };

                            return obj;
                        });
                    };
                }).catch(error => {
                    console.error(error);
                });
            },
            /* 全局 */
            get_local_search() {
                const localSearchId = localStorage.getItem(`leadsCloud-topFilter-id-type-${this.columnType}`);
                if (localSearchId && !this.isDashboardjumping) {
                    this.get_commonSearch(localSearchId, true); // 请求常用检索列表, 并传入 id 进行校验, 校验成功后按 id 筛选
                    localStorage.removeItem(`leadsCloud-topFilter-id-type-${this.columnType}`);
                } else {
                    this.get_commonSearch(null, true);
                } // 请求常用检索, 内在逻辑:
            }, // 尝试从本地存储中取常用检索 id , 如果有 id 且定位到树/默认检索了, 则按缓存的数据进行检索
            get_commonSearch(id, refresh, closePopper = false) {
                const ajaxType = this.columnType === '12' ? 'ajaxWAJson' : 'ajaxJson';
                const url = this.columnType === '12' ? '/minor/commonSearch/getCommonSearchList' : '/crm/commonSearch/getCommonSearchList';

                this.loading = true;
                this.sortObj = {};
                this.$emit('update:list_commonSearch', []);
                this.defaultExpandedKeys = [];
                util[ajaxType]({
                    url,
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        type: this.columnType,
                        userId: this.userId
                    }
                })
                    .then(
                        (res) => {
                            if (res.data.code === '1') {
                                this.$nextTick(() => {
                                    this.$emit(
                                        'update:list_commonSearch',
                                        res.data.data.map((item) => {
                                            item.searchContent = this.handleSearchContent(item.searchContent);
                                            item.expand = false;
                                            return item;
                                        })
                                    );
                                    if (id) {
                                        this.defaultExpandedKeys = [id];
                                    }
                                    this.$nextTick(() => {
                                        if (id && this.locate_node(id)) {
                                            if (refresh) {
                                                switch (id) {
                                                    case 'all':
                                                        this.searchDefault('all', closePopper);
                                                        break;
                                                    case 'mine':
                                                        this.searchDefault('mine', closePopper);
                                                        break;
                                                    case 'myCreate': // 我创建的
                                                        if (this.myCreate) {
                                                            this.searchMyClueGroup('myCreate', '我创建的', closePopper);
                                                        } else {
                                                            this.searchDefault('all', closePopper);
                                                        }
                                                        break;
                                                    case 'myCreateTran': // 我创建待转化的
                                                        if (this.myCreateTran) {
                                                            this.searchMyClueGroup('myCreateTran', '我创建待转化的', closePopper);
                                                        } else {
                                                            this.searchDefault('all', closePopper);
                                                        }
                                                        break;
                                                    case 'myChargeTran': // 我负责待转化的
                                                        if (this.myChargeTran) {
                                                            this.searchMyClueGroup('myChargeTran', '我负责待转化的', closePopper);
                                                        } else {
                                                            this.searchDefault('all', closePopper);
                                                        }
                                                        break;
                                                    case 'myCharge': // 我负责的
                                                        if (this.myCharge) {
                                                            this.searchMyClueGroup('myCharge', '我负责的', closePopper);
                                                        } else {
                                                            this.searchDefault('all', closePopper);
                                                        }
                                                        break;
                                                    case 'subordinatePlan': // 跟进计划-下属执行的
                                                        this.searchDefault('subordinatePlan', closePopper);
                                                        break;
                                                    case 'myCreatePlan': // 跟进计划-我创建的
                                                        this.searchDefault('myCreatePlan', closePopper);
                                                        break;
                                                    default:
                                                        this.searchCommon(id, closePopper);
                                                }
                                            } else {
                                                if (this.id_selected_commonSearch) {
                                                    const temp = this.list_commonSearch.find((item) =>
                                                        `${item.id}` === `${this.id_selected_commonSearch}`);
                                                    if (temp) {
                                                        this.$emit('change_title', temp.searchName);
                                                    }

                                                    // 编辑常用检索成功后, 如果被编辑的是父系节点, 当前正在筛选子结点. 则需要刷新
                                                    if (
                                                        !['all', 'mine'].includes(this.id_selected_commonSearch) &&
                                                        id
                                                    ) {
                                                        let parentId = this.id_selected_commonSearch;
                                                        while (`${parentId}` !== '0') {
                                                            const node = this.list_commonSearch.find((item) => `${item.id}` === `${parentId}`);
                                                            if (!node) {
                                                                break;
                                                            } else if (`${node.id}` === `${id}`) {
                                                                this.searchCommon(
                                                                    this.id_selected_commonSearch,
                                                                    true
                                                                );
                                                                this.locate_node(this.id_selected_commonSearch);
                                                                break;
                                                            } else {
                                                                parentId = node.parentId;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        } else {
                                            if (refresh) {
                                                this.searchDefault('all', closePopper);
                                            } else {
                                                if (this.id_selected_commonSearch) {
                                                    const temp = this.list_commonSearch.find((item) =>
                                                        `${item.id}` === `${this.id_selected_commonSearch}`);
                                                    if (temp) {
                                                        this.$emit('change_title', temp.searchName);
                                                    }
                                                }
                                            }
                                        }
                                    });
                                });
                            } else {
                                this.$Message.error(this.$t('crm.Table.error_getCommonSearchList'));
                            }
                            this.loading = false;
                        },
                        (reject) => {
                            this.loading = false;
                        }
                    )
                    .catch((err) => {
                        this.loading = false;
                    });
            }, // 获取常用检索列表, id: 检索id , refresh: 定位到检索后是否进以该 id 进行检索

            /* 树相关 */
            // 树本身
            render_tree_node(h, { data }) {
                const create = this.$createElement; // 直接用 h 渲染的话, 结点的 ref 属性不起作用
                /* 左侧 div */
                // 筛选图标
                const filterIcon = create('Icon', {
                    props: {
                        custom: 'custom-filter',
                        color: '#A9B9C9',
                        size: 12
                    }
                });
                // 常用检索名
                const title = create(
                    'span',
                    {
                        class: 'filter-name'
                    },
                    [
                        create('TooltipAuto', {
                            props: {
                                content: data.title
                            }
                        })
                    ]
                );
                // 左侧 div
                const leftDiv = create(
                    'div',
                    {
                        style: {
                            'padding-right': '66px'
                        },
                        class: {
                            'commonSearch-item': true,
                            'active-filter-btn': data.selected
                        }
                    },
                    [filterIcon, title]
                );

                /* 右侧 div */
                // 操作栏
                const operatePop = create(
                    'Poptip',
                    {
                        props: {
                            transfer: true,
                            trigger: 'hover',
                            placement: 'bottom-end',
                            padding: '8px 0',
                            'popper-class': 'moreOperateGroup'
                        },
                        on: {
                            show: () => {
                                // 弹窗显示时, 加上 class 保证右侧操作栏不隐藏
                                const parentEl = operatePop.componentInstance.$el.parentElement;
                                parentEl.classList.add('operate-area-show');
                                this.$emit('prevent_close_popper');
                            },
                            hide: () => {
                                // 弹窗不显示时, 去掉 class
                                const parentEl = operatePop.componentInstance.$el.parentElement;
                                parentEl.classList.remove('operate-area-show');
                                operatePop.componentInstance.$refs.popper.style.display = 'none';
                            }
                        }
                    },
                    [
                        create('Icon', {
                            slot: 'reference',
                            props: {
                                type: 'md-more',
                                color: '#7B98B6',
                                size: 18
                            },
                            style: {
                                padding: '0 8px'
                            }
                        }),
                        create('div', [
                            create(
                                'ul',
                                [
                                    data.level < 3
                                        ? create(
                                            'li',
                                            {
                                                on: {
                                                    click: () => {
                                                        this.add_child_commonSearch(data);
                                                    }
                                                }
                                            },
                                            this.$t('crm.Html.add_child_search')
                                        )
                                        : undefined, // 层级小于三时才显示添加子级筛选条件按钮
                                    create(
                                        'li',
                                        {
                                            on: {
                                                click: () => {
                                                    if (
                                                        Array.isArray(data.children) &&
                                                        data.children.length
                                                    ) {
                                                        this.$emit('prevent_close_popper', false);
                                                        this.$confirm(
                                                            this.$t('crm.Html.confirm_edit_search_recursively'),
                                                            this.$t('b2b.production.edit'),
                                                            {
                                                                confirmButtonText: this.$t('confirm'),
                                                                cancelButtonText: this.$t('cancel'),
                                                                type: 'warning'
                                                            }
                                                        )
                                                            .then(() => {
                                                                this.edit_commonSearch(data);
                                                            })
                                                            .catch(() => {
                                                                this.$emit('toggle_popper', true);
                                                            });
                                                    } else {
                                                        this.edit_commonSearch(data);
                                                    }
                                                }
                                            }
                                        },
                                        this.$t('edit')
                                    ),
                                    create(
                                        'li',
                                        {
                                            on: {
                                                click: () => {
                                                    let tipContent = this.$t('b2b.production.delete');
                                                    if (
                                                        Array.isArray(data.children) &&
                                                        data.children.length
                                                    ) {
                                                        tipContent = this.$t('crm.Html.confirm_delete_search_recursively');
                                                    }
                                                    this.$emit('prevent_close_popper', false);
                                                    this.$confirm(tipContent, this.$t('mail.deleteTitle'), {
                                                        confirmButtonText: this.$t('confirm'),
                                                        cancelButtonText: this.$t('cancel'),
                                                        type: 'warning'
                                                    })
                                                        .then(() => {
                                                            this.delete_commonSearch(data.id);
                                                        })
                                                        .catch(() => {
                                                            this.$emit('toggle_popper', true);
                                                        });
                                                }
                                            }
                                        },
                                        this.$t('delete')
                                    )
                                ].filter((item) => item)
                            )
                        ])
                    ]
                );
                // 拖动排序按钮
                const dragIcon = create('Icon', {
                    class: `parentId_commonSearch_${data.parentId}`,
                    style: {
                        cursor: 'pointer'
                    },
                    props: {
                        custom: 'custom-drag-and-drop',
                        color: '#7B98B6',
                        size: 12
                    }
                });
                // 右侧 div
                const rightDiv = create(
                    'div',
                    {
                        class: 'operate-area',
                        on: {
                            click: (e) => {
                                e.stopPropagation();
                            }
                        }
                    },
                    [
                        operatePop,
                        data.count_siblings > 1 ? dragIcon : undefined // 同层级有多个结点时才显示拖拽按钮
                    ].filter((item) => item)
                );

                /* 返回根 div */
                return create(
                    'div',
                    {
                        class: `id_commonSearch_${data.id}`,
                        style: {
                            position: 'relative',
                            display: 'inline-block',
                            width: 'calc(100% - 14px)'
                        },
                        on: {
                            click: () => {
                                this.click_node(data);
                            }
                        }
                    },
                    [leftDiv, rightDiv]
                );
            }, // 渲染结点
            // 解析 node.searchContent 字符串为数组 + 处理客户表格页历史筛选数据
            handleSearchContent(str) {
                let searchContent = str;
                // 处理历史数据 --- 客户表格页之前保存的常用检索, 前面没有模块前缀的, 加上前缀 'cp'
                if ([1, 4].includes(this.columnType)) {
                    searchContent = str.replace(
                        /{"(.*?)":/g,
                        (match, p1, offset, string) => {
                            if (
                                !p1.startsWith('$') &&
                                !['cp', 'iq', 'ct'].some((prefix) => p1.startsWith(prefix))
                            ) {
                                switch (p1) {
                                    case 'companyManagersBefore':
                                    case 'value':
                                    case 'eventDate':
                                        return `{"${p1}":`;
                                    default:
                                        return `{"cp${this.handleKey(p1)}":`;
                                }
                            }
                            return match;
                        }
                    );
                }
                // 返回结果
                return this.$options.filters.parseArray(searchContent) || [];
            },
            // 首字母大写 + '_小写字母'转化为'大写字母'
            handleKey(key) {
                return key
                    .split('_')
                    .map((str) => `${str[0].toUpperCase()}${str.slice(1)}`)
                    .join('');
            },
            click_node(node) {
                // 重新置空公海分组id
                this.$store.commit('setHighSeasGroupId', '');
                if (`${this.id_selected_commonSearch}` !== `${node.id}`) {
                    this.searchCommon(node.id);
                }
            }, // 点击结点
            // 结点操作
            add_child_commonSearch(data) {
                this.$emit('change_search_type', 'customSearch');
                this.$emit('update:parentSearchData', data);
            }, // 增加子级检索
            edit_commonSearch(data) {
                this.$emit('change_search_type', 'customSearch');
                this.$emit('update:editSearchData', data);
                this.$emit('toggle_popper', true);
            }, // 编辑检索
            delete_commonSearch(id) {
                this.$emit('toggle_popper', true);
                this.loading = true;
                const ajaxType = this.columnType === '12' ? 'ajaxWAJson' : 'ajaxJson';
                const url = this.columnType === '12' ? '/minor/commonSearch/deleteCommonSearch' : '/crm/commonSearch/deleteCommonSearch';
                util[ajaxType]({
                    url,
                    method: 'get',
                    params: {
                        id
                    }
                })
                    .then((res) => {
                        if (res.data.code === '1') {
                            this.get_commonSearch(this.id_selected_commonSearch, true, true);
                        } else {
                            this.$Message.error(this.$t('crm.UniSet.error_delete'));
                            this.loading = false;
                        }
                    });
            }, // 删除常用检索
            // 排序
            locate_node(id) {
                switch (id) {
                    case 'all': // 结点为 "全部"
                        this.$refs.container.parentElement.scrollTop = 0; // 定位滚动条到顶部
                        return true;
                    case 'mine': // 结点为 "我的"
                        if (this.name_filter_mine) {
                            // 定位滚动条到顶部
                            this.$refs.container.parentElement.scrollTop = 0;
                            return true;
                        }
                        break;
                    case 'myCharge': // 我负责的
                        this.$refs.container.parentElement.scrollTop = 0; // 定位滚动条到顶部
                        return true;
                    case 'myCreate': // 我创建的
                        this.$refs.container.parentElement.scrollTop = 0; // 定位滚动条到顶部
                        return true;
                    case 'myChargeTran': // 我负责待转换
                        this.$refs.container.parentElement.scrollTop = 0; // 定位滚动条到顶部
                        return true;
                    case 'myCreateTran': // 我创建待转换
                        this.$refs.container.parentElement.scrollTop = 0; // 定位滚动条到顶部
                        return true;
                    case 'subordinatePlan': // 跟进计划-下属执行的
                        this.$refs.container.parentElement.scrollTop = 0; // 定位滚动条到顶部
                        return true;
                    case 'myCreatePlan': // 跟进计划-我创建的
                        this.$refs.container.parentElement.scrollTop = 0; // 定位滚动条到顶部
                        return true;
                    default:
                        // 定位树结点
                        let node = this.list_commonSearch.find((item) => `${item.id}` === `${id}`); // 在常用检索中搜寻 id 对应的常用检索
                        const index_parents = []; // 递归性地存放父级在常用检索列表中的 index
                        if (node) {
                            while (node.parentId !== 0) {
                                index_parents.push(this.list_commonSearch.findIndex((item) => `${item.id}` === `${node.parentId}`));
                                node = this.list_commonSearch.find((item) => `${item.id}` === `${node.parentId}`);
                            } // 存放

                            if (index_parents.every((item) => item !== -1)) {
                                // 逐级展开树结点到 node
                                const temp = this.$deepClone(this.list_commonSearch);
                                index_parents.forEach((index) => (temp[index].expand = true));
                                this.$emit('update:list_commonSearch', temp);

                                this.$nextTick(() => {
                                    // 如果 node 不在面板视口, 则调整面板垂直滚动条位置
                                    const dom = this.$refs.container.querySelector(`.id_commonSearch_${id}`); // 当前 node 的 dom
                                    const dom_container = this.$refs.container; // 外层滚动 div
                                    if (dom && dom_container) {
                                        // 获取 node 在面板中的位置
                                        const rect_dom = dom.getBoundingClientRect();
                                        const rect_container = dom_container.getBoundingClientRect();
                                        const scrollTop_container = dom_container.scrollTop; // container 当前的滚动条位置
                                        const dom_toTop = rect_dom.y - rect_container.y; // dom 距离 container 顶部的距离
                                        const dom_height = rect_dom.height; // dom 的高度
                                        const container_height = rect_dom.height; // container 的高度
                                        // dom 不在可视区域则调整 container 滚动条
                                        if (
                                            scrollTop_container > dom_toTop ||
                                            scrollTop_container + container_height <
                                            dom_toTop + dom_height
                                        ) {
                                            dom_container.scrollTop =
                                                dom_toTop + dom_height - container_height;
                                        }

                                        // 背景色淡入淡出显示定位到的树结点
                                        dom.classList.add('fadeIn-commonSearch');
                                        setTimeout(() => {
                                            dom.classList.remove('fadeIn-commonSearch');
                                            dom.classList.add('fadeOut-commonSearch');
                                            setTimeout(() => {
                                                dom.classList.remove('fadeOut-commonSearch');
                                            }, 1500);
                                        }, 1500);
                                    }
                                });
                                return true;
                            } // 中间没有断层
                        }
                }
                return false;
            }, // 根据 id 在页面中定位常用检索, 返回值为"定位是否成功"

            // 拖拽相关
            allowDrop(draggingNode, dropNode, type) {
                if (draggingNode.level === dropNode.level) {
                    if (draggingNode.data.parentId === dropNode.data.parentId) {
                        return type === 'prev';
                    }
                } else {
                    // 不同级进行处理
                }
            }, // 同级拖拽
            nodeDrop(draggingNode, dropNode, type) {
                const parentId = draggingNode.data.parentId; // 当前所在层级
                const arr_sortId = this.sortObj[parentId]; // 排序前的 id 顺序数组
                const oldIndex = arr_sortId.findIndex((item) => item === draggingNode.data.id); // node 移动前位置
                let newIndex = arr_sortId.findIndex((item) => item === dropNode.data.id); // node 移动后位置(还需计算)

                if (
                    arr_sortId.length &&
                    newIndex !== oldIndex &&
                    newIndex !== -1 &&
                    oldIndex !== -1
                ) {
                    // 计算实际 newIndex
                    if (type === 'before') {
                        // 向下移动, 且在 dropNode 前面, 则新位置在 dropNode 前一位, newIndex 减一
                        if (newIndex > oldIndex) {
                            newIndex--;
                        }
                        // 否则向下移动, 则新位置就是 dropNode 的原位置
                    } else if (type === 'after') {
                        // 向上移动, 且在 dropNode 后面, 则新位置在 dropNode 后一位, newIndex 加一
                        if (newIndex < oldIndex) {
                            newIndex++;
                        }
                        // 否则向上移动, 则新位置就是 dropNode 的原位置
                    }
                    // 计算新顺序
                    arr_sortId.splice(newIndex, 0, ...arr_sortId.splice(oldIndex, 1));

                    // 接下来就是发送请求, 成功后设置 sortObj , loading , 失败则提示
                    this.loading = true;
                    const ajaxType = this.columnType === '12' ? 'ajaxWAJson' : 'ajaxJson';
                    const url = this.columnType === '12' ? '/minor/commonSearch/orderCommonSearch' : '/crm/commonSearch/orderCommonSearch';
                    util[ajaxType]({
                        url,
                        method: 'post',
                        params: {
                            ids: arr_sortId.join(',')
                        }
                    })
                        .then(
                            (response) => {
                                if (response.data.code === '1') {
                                    this.$set(this.sortObj, parentId, arr_sortId);
                                } else {
                                    this.$Message.error(this.$t('crm.Html.error_sort_search'));
                                }
                                this.loading = false;
                            },
                            (reject) => {
                                this.$Message.error(this.$t('crm.Html.error_sort_search'));
                                this.loading = false;
                            }
                        )
                        .catch((err) => {
                            this.$Message.error(this.$t('crm.Html.error_sort_search'));
                            this.loading = false;
                        });
                } else {
                    this.$Message.error(this.$t('crm.Table.errorOccurred'));
                }
            },

            /* 公海分组检索 */
            searchHighSeasGroup(id, name, closePopper = false) {
                this.$emit('update:common_conditions', []); // 表格页去掉常用检索条件数组
                this.$store.commit('setHighSeasGroupId', id); // 存公海分组id
                this.$emit('update:filtering', 'searchCommon'); // 更改筛选类型, 表格页 merge_query_list 时用
                this.$emit('change_title', name); // 修改显示的名字
                this.$emit('update:id_selected_commonSearch', id); // 更新"当前正筛选的 id"
                this.$listeners.refreshData(); // 检索
                localStorage.setItem(
                    `leadsCloud-topFilter-id-type-${this.columnType}`,
                    id
                );
                this.$emit('toggle_popper', closePopper); // 关闭 topFilter 弹窗
            },
            // 获取线索预设检索
            searchMyClueGroup(type, name, closePopper = false) {
                this.$emit('change_title', name); // 更改 topFilter 标题
                this.$emit('update:common_conditions', []); // 表格页去掉常用检索条件数组
                this.$emit('update:filtering', 'searchCommon'); // 更改筛选类型, 表格页 merge_query_list 时用
                this.$emit('update:id_selected_commonSearch', type); // 更新"当前正筛选的 id"
                this.$listeners.refreshData(type); // 检索
                localStorage.setItem(
                    `leadsCloud-topFilter-id-type-${this.columnType}`,
                    type
                );
                this.$emit('toggle_popper', closePopper); // 关闭 topFilter 弹窗
            },
            searchDefault(type, closePopper = false) {
                const status = [];
                // 重新置空公海分组id
                this.$store.commit('setHighSeasGroupId', '');

                switch (type) {
                    case 'all':
                        this.$emit('change_title', this.name_filter_all); // 更改 topFilter 标题
                        this.$emit('update:common_conditions', []); // 表格页去掉常用检索条件数组
                        if (this.myCharge) {
                            status.push(2);
                        }
                        if (this.myCreate) {
                            status.push(5);
                        }
                        if (this.myChargeTran) {
                            status.push(4);
                        }
                        if (this.myCreateTran) {
                            status.push(6);
                        }
                        break;
                    case 'mine':
                        this.$emit('change_title', this.name_filter_mine);
                        // 照着表格页 computed_addCondition 中格式化"负责人"字段筛选条件的方式进行处理
                        const temp = {};
                        temp[this.sql_manager] = {};
                        temp[this.sql_manager].$regex = [Number(this.userId)];
                        this.$emit('update:common_conditions', [temp]); // 表格页更新常用检索条件数组, 仅保留"负责人为'我'"这一条件
                        break;
                    // 跟进计划中的 下属执行的 与 我创建的
                    case 'subordinatePlan':
                    case 'myCreatePlan':
                        this.$emit('change_title', type === 'subordinatePlan' ? this.$t('crm.Table.subordinateFollowUpPlan') : this.$t('crm.Table.myCreateFollowUpPlan'));
                        break;
                }
                this.$emit('update:filtering', 'searchCommon'); // 更改筛选类型, 表格页 merge_query_list 时用
                this.$emit('update:id_selected_commonSearch', type); // 更新"当前正筛选的 id"
                this.$listeners.refreshData(type, status.join(',')); // 检索
                if (!this.isDashboardjumping) {
                    localStorage.setItem(
                        `leadsCloud-topFilter-id-type-${this.columnType}`,
                        type
                    );
                } else {
                    // 与记住用户上次筛选的操作冲突 加此参数判断
                    this.$store.commit('setDashboardjumping', false);
                };
                this.$emit('toggle_popper', closePopper); // 关闭 topFilter 弹窗
            }, // 检索默认
            searchCommon(id, closePopper = false) {
                const node = this.list_commonSearch.find((item) => `${item.id}` === `${id}`);

                // 上溯父结点, 合并筛选条件后筛选
                if (node) {
                    let searchContent = node.searchContent;
                    let temp = this.$deepClone(node);
                    while (`${temp.parentId}` !== '0') {
                        const parentNode = this.list_commonSearch.find((item) => `${item.id}` === `${temp.parentId}`);
                        if (parentNode) {
                            const parentContent = parentNode.searchContent;
                            searchContent = parentContent.concat(searchContent);
                            temp = parentNode;
                        } else {
                            searchContent = [];
                            this.$Message.error(this.$t('crm.Table.error_getCommonSearchItem'));
                            break;
                        }
                    }

                    if (searchContent.length) {
                        const status = [];
                        this.$emit('update:KeepFilter', true);
                        this.$emit('change_title', node.searchName);
                        this.$emit('update:filtering', 'searchCommon');
                        this.$emit('update:id_selected_commonSearch', node.id);
                        this.$emit('update:common_conditions', searchContent);
                        localStorage.setItem(
                            `leadsCloud-topFilter-id-type-${this.columnType}`,
                            id
                        );
                        if (this.myCharge) {
                            status.push(2);
                        }
                        if (this.myCreate) {
                            status.push(5);
                        }
                        if (this.myChargeTran) {
                            status.push(4);
                        }
                        if (this.myCreateTran) {
                            status.push(6);
                        }
                        this.$listeners.refreshData('all', status.join(','));
                        this.$emit('toggle_popper', closePopper);
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getCommonSearchItem'));
                    }
                } else {
                    this.$Message.error(this.$t('crm.Table.error_getCommonSearchItem'));
                }
            } // 检索保存的常用检索
        },
        created() {
            // localStorage.setItem(
            //     `leadsCloud-topFilter-id-type-${this.columnType}`,
            //     'all'
            // );
            // this.get_commonSearch();
            // 只有公海管理才需要 公海分组的数据
            this.type === 'highseasCustomer' && this.getPublicSeasGroup();
        },
        activated() {
            if (this.columnType === '12') {
                this.get_commonSearch();
            }
        },
        watch: {
            flag_topFilter() {
                if (!this.filtering && this.type_search === 'searchCommon') {
                    this.get_local_search();
                }
            }, // 表格页要求检索且指定了检索类型为"常用检索"后, 进行检索
            newId(val) {
                if (val) {
                    this.get_commonSearch(val);
                    this.$emit('update:newId', null);
                }
            } // 新增子筛选条件成功后, 重新请求数据刷新树结构并定位到新增结点
        }
    };
</script>

<style lang="less" scoped>
.active-filter-btn {
  color: #4285f4;
}

.commonSearch-item {
  cursor: pointer;
  position: relative;
  line-height: 18px;
  padding: 5px 16px 5px 24px;
}

.operate-area {
  display: none;
  width: 66px;
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px 0;
}

.operate-area-show {
  display: inline-block;
}

.commonSearch-tree {
  line-height: 18px;

  /deep/ ul {
    li {
      margin: 0;
    }
  }

  /deep/ .el-icon-caret-right {
    position: relative;
    z-index: 1;
  }

  /deep/ .el-tree-node {
    position: relative;
  }

  /deep/ .commonSearch-item {
    .commonSearch-item;
    padding: 5px 0;
  }
}

.moreOperateGroup /deep/ {
  li {
    height: 30px;
    line-height: 30px;
    padding: 0 16px;
    cursor: pointer;

    &:hover {
      background-color: #f3f4f7;
    }
  }
}

.fadeIn-commonSearch {
  background-color: rgb(230, 239, 255);
  transition: background-color 1500ms;
}

.fadeOut-commonSearch {
  background-color: #fff;
  transition: background-color 1500ms;
}

.container-searchCommon {
  max-height: 450px;
  padding: 18px 0;
  font-size: 12px;
  overflow-x: hidden;
  overflow-y: auto;
}

.general-commonSearch-item {
  &:hover {
    &::before {
      display: block;
      content: "";
      width: 480px;
      height: 100%;
      position: absolute;
      top: 0;
      left: -60px;
      background: #f7f7f8;
    }
  }
}
</style>

<style lang="less">
div[class^="id_commonSearch_"] {
  &:hover {
    .operate-area {
      display: inline-block;
    }

    &::before {
      display: block;
      content: "";
      width: 480px;
      height: 100%;
      position: absolute;
      top: 0;
      left: -60px;
      background: #f7f7f8;
    }
  }
}

.filter-name {
  display: inline-block;
  width: 290px;
  padding-left: 4px;
  vertical-align: middle;
}
</style>
