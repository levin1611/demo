<template>
    <transition name="slide-fade">
        <div class="main-shortcuts" :style="{height:content_height,paddingTop:from == 'super_slidebar'?'20px':''}">
            <div class="main-shortcuts-top" v-if="!['super_slidebar'].includes(from)">
                <div style="display: inline-block; width: 95%">
                    <div style="display: inline-block"><span style="font-weight: bold;font-size: 16px;color: #333333;">{{$t('chat.verbal')}}</span>
                    </div>
                    <div style="display: inline-block">
                    </div>
                </div>
                <span style="position: absolute;right: 40px;cursor: pointer" class="piwik_ChatSplitToVerbal"
                      @click="toScriptSet">
                    <Tooltip :content="$t('portal_set.script_set')">
                        <Icon size="14" custom="custom custom-custom-script-set"></Icon>
                    </Tooltip>
                </span>
                <span  style="position: absolute;right: 15px;cursor: pointer" @click="closeVerbal"><Icon size="12"
                                                                                                        custom="custom custom-modal-close"></Icon></span>
            </div>
            <div class="short-cut-verbal-search">
                <Input class="verbal-search"
                       v-model="verbalSearch"
                       @input="controlTooltip"
                       @keyup.enter.native="searchVerbalList"
                       :placeholder="$t('chat.serchHolder')">
                       <i slot="suffix" class="el-input__icon el-icon-search fb-comment-search-verbal" @click="searchVerbalList"></i>
                       </Input>
                <span  v-if="['super_slidebar'].includes(from)" style="margin-left: 12px;" class="piwik_ChatSplitToVerbal"
                      @click="toScriptSet">
                    <Tooltip :content="$t('portal_set.script_set')">
                        <Icon size="14" custom="custom custom-custom-script-set"></Icon>
                    </Tooltip>
                </span>
            </div>
            <div class="main-shortcuts-block" :style="{top:from == 'super_slidebar'?'60px':'120px'}" v-loading="refreshVerbal">
                <div style="overflow:auto;">
                    <Tree :data="verbalTree" :render-content="renderContent" node-key="id" :default-expanded-keys="expandedIdList"></Tree>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'Shortcuts',
        props: {
            controVerbalIcon: {},
            content_height: {
                type: String,
                default: '100%'
            },
            from: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                refreshVerbal: false,
                verbalSort: 0, // 话术分类
                verbalSortListTemp: [],
                verbalSortList: [
                    {
                        id: 0,
                        name: '全部'
                    }
                ], // 话术分类列表
                currIndex: -1,
                verbalSearch: '', // 搜素话术
                isShowSearch: false,
                verbalList: [],
                verbalListTemp: [],
                verbalListTemp2: [],
                verbalTree: [],
                parentVerbal: [],
                childrenVerbal: [],
                expandedIdList: [] // 展开树节点的key的数组
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                viewingSubWA: state => state.whatsapp.viewingSubWA,
            }),
            ...mapGetters([
                'isContainsMenu'
            ])
        },
        methods: {
            controlTooltip(val) {
                if (this.verbalSearch === '') {
                    this.getVerbalClassify();
                }
            },
            closeVerbal() {
                this.$emit('letShortcutsShow', false);
            },
            switchView() {
                this.isShowSearch = true;
            },
            // 跳转到话术管理
            toScriptSet() {
                // 权限目录判断
                if (!this.isContainsMenu('script_set')) {
                    this.$Message.error(this.$t('portal_set.error_haveNoPermissionScriptSet'));
                    return false;
                }

                window.open(this.$rootRouter.resolve({
                    name: 'script_set'
                }).href, '_blank');
            },
            // 树渲染
            renderContent(h, { root, node, data }) {
                if (data.type) {
                    return h(
                        'span', {
                            style: {
                                flex: 1,
                                width: 0
                            },
                            on: {
                                click: () => {
                                    const sendVerbalMsg = {
                                        content: data,
                                        type: this.controVerbalIcon
                                    };
                                    // console.log(this.$parent,'sendVerbalMsg');
                                    // 如果是查看下属并且是侧边栏中调用 话术 则提示当前不允许发送话术
                                    if(this.viewingSubWA && this.$parent.$options._componentTag === "MoreConectmodel"){

                                        this.$Message.warning(this.$t('whatsapp_manage.onlyCanSendTemplate'));
                                    }
                                    this.$emit('verbalSelected', sendVerbalMsg);
                                }
                            }
                        },
                        [
                            h('Tooltip', {
                                style: {
                                    display: 'block',
                                    overflow: 'hidden',
                                    'text-overflow': 'ellipsis',
                                    'white-space': 'nowrap',
                                    color: '#333333'
                                },
                                props: {
                                    placement: 'right',
                                    content: data.verbalContent,
                                    transfer: true,
                                    popperClass: 'tootip-maxwidth tooltip-keepBrace'
                                }
                            }, [
                                h('span', {
                                    style: {
                                        height: '18px',
                                        lineHeight: '18px',
                                        display: 'inline-block'
                                    }
                                }, data.title)
                            ])
                        ]
                    );
                } else {
                    return h(
                        'div', {
                            style: {
                                flex: 1,
                                width: 0,
                                height: '18px',
                                lineHeight: '18px',
                                color: '#333333'
                            }
                        },
                        [
                            h('TooltipAuto', {
                                props: {
                                    transfer: true,
                                    placement: 'right',
                                    content: data.title,
                                    popperClass: 'tootip-maxwidth'
                                }
                            })
                        ]
                    );
                }
            },
            // 获取话术
            getVerbalClassify() {
                this.refreshVerbal = true;
                util.ajaxJson({
                    url: '/cuss-login/replyType/getReplyTypeList',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId
                    }
                }).then(res => {
                    this.parentVerbal = res.data.data.list;
                    util.ajaxJson({
                        url: '/cuss-login/reply/getReplyList',
                        method: 'get',
                        params: {
                            orgId: this.enterpriseId,
                            typeId: 0,
                            pageNo: 0,
                            pageSize: 0
                        }
                    }).then(res => {
                        this.childrenVerbal = res.data.data.list;
                        this.verbalTree = this.get_tree(this.parentVerbal, this.childrenVerbal);
                        this.refreshVerbal = false;
                    });
                });
            },
            // 话术树按照sortNo排序
            sort_tree(val) {
                for (let i = 0; i < val.length; i++) {
                    if (val[i].children) {
                        val[i].children = this.sort_tree(val[i].children);
                    }
                }
                val = val.sort((a, b) => {
                    if (a.sortNo === b.sortNo) {
                        if (a.name === '基本信息') {
                            return -1;
                        } else {
                            return 0;
                        }
                    } else {
                        if (a.sortNo > b.sortNo) {
                            return 1;
                        } else {
                            return -1;
                        }
                    }
                });
                return val;
            },
            // 按照键值排序
            sortBy(property, sortType = 'asc') {
                return function(a, b) {
                    const value1 = a[property];
                    const value2 = b[property];
                    return sortType === 'desc' ? value2 - value1 : value1 - value2;
                };
            },
            // 渲染树
            get_tree(param_arr, user_list, check_arr) {
                const userList = user_list.map(item => {
                    const obj = {};
                    obj.verbalContent = item.name;
                    obj.parentId = item.typeId;
                    obj.name = item.abbr;
                    obj.power = item.manageName;
                    obj.id = item.id;
                    obj.createUserId = item.createUserId;
                    obj.type = 'person';
                    return obj;
                });
                const arr = param_arr.map(item => {
                    const obj = {};
                    obj.parentId = item.parentId;
                    obj.name = item.name;
                    obj.id = item.id;
                    obj.verbalContent = '';
                    obj.level = item.type;
                    obj.sortNo = item.sortNo;
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
                    return arr.map(item => {
                        const obj = {};
                        obj.title = item.name;
                        obj.id = item.id;
                        obj.parentId = item.parentId;
                        obj.children = [];
                        obj.verbalContent = '';
                        obj.level = item.type;
                        obj.expand = true;
                        obj.sortNo = item.sortNo;
                        return obj;
                    });
                }

                parent_arr = structure_parent_arr(parent_arr);
                parent_arr = this.sort_tree(parent_arr);

                // 默认展开一级树
                this.expandedIdList = parent_arr.map(item => {
                    return item.id;
                });

                function build_child(parent_arr, arr) {
                    for (let j = 0; j < parent_arr.length; j++) {
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i].parentId === parent_arr[j].id) {
                                parent_arr[j].checked = false;
                                const obj = {};
                                obj.show_info = arr;
                                obj.title = arr[i].name;
                                obj.id = arr[i].id;
                                obj.createUserId = arr[i].createUserId;
                                obj.power = arr[i].power;
                                obj.parentId = arr[i].parentId;
                                obj.verbalContent = arr[i].verbalContent;
                                obj.grandpa_id = parent_arr[j].parentId;
                                obj.parent_name = parent_arr[j].title;
                                if (arr[i].category === 1) {
                                    obj.menu = 'department';
                                } else {
                                    obj.menu = 'person';
                                }
                                obj.type = arr[i].type;
                                obj.disabled = false;
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
            get_search_tree(param_arr, user_list, check_arr) {
                const _this = this;
                const userList = user_list.map(item => {
                    const obj = {};
                    obj.verbalContent = item.name;
                    obj.parentId = item.typeId;
                    obj.name = item.abbr;
                    obj.power = item.manageName;
                    obj.id = item.id;
                    obj.createUserId = item.createUserId;
                    obj.type = 'person';
                    return obj;
                });

                const arr = param_arr.map(item => {
                    const obj = {};
                    obj.parentId = item.parentId;
                    obj.name = item.name;
                    obj.id = item.id;
                    obj.verbalContent = '';
                    obj.level = item.type;
                    obj.sortNo = item.sortNo;
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
                    return arr.map(item => {
                        const obj = {};
                        obj.title = item.name;
                        obj.id = item.id;
                        obj.parentId = item.parentId;
                        obj.children = [];
                        obj.verbalContent = '';
                        obj.level = item.type;
                        obj.expand = true;
                        // 追加id
                        _this.expandedIdList.push(item.id);
                        obj.sortNo = item.sortNo;
                        return obj;
                    });
                }

                parent_arr = structure_parent_arr(parent_arr);

                function build_child(parent_arr, arr) {
                    for (let j = 0; j < parent_arr.length; j++) {
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i].parentId === parent_arr[j].id) {
                                parent_arr[j].checked = false;
                                const obj = {};
                                obj.show_info = arr;
                                obj.title = arr[i].name;
                                obj.id = arr[i].id;
                                obj.createUserId = arr[i].createUserId;
                                obj.power = arr[i].power;
                                obj.parentId = arr[i].parentId;
                                obj.verbalContent = arr[i].verbalContent;
                                obj.grandpa_id = parent_arr[j].parentId;
                                obj.parent_name = parent_arr[j].title;
                                if (arr[i].category === 1) {
                                    obj.menu = 'department';
                                } else {
                                    obj.menu = 'person';
                                }
                                obj.type = arr[i].type;
                                obj.disabled = false;
                                obj.expand = true;
                                // 追加id
                                _this.expandedIdList.push(arr[i].id);
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
            getVerbalTree() {
                this.verbalTree = this.get_tree(this.parentVerbal, this.childrenVerbal);
                console.log('--------', this.verbalTree)
            },
            // 话术搜索
            searchVerbalList() {
                // 当搜索内容为空时不执行后续代码
                if (this.verbalSearch === '') {
                    return;
                }
                const str_searched = this.verbalSearch || ''; // 要搜索的文字
                const temp_tree_data = this.get_search_tree(this.parentVerbal, this.childrenVerbal, []); // 全量 tree_data
                function search_title_recursively(nodes, str_searched) {
                    return nodes.map(node => {
                        if (node.title.includes(str_searched) || node.verbalContent.includes(str_searched)) {
                            return node;
                        } else if (node.children.length) {
                            node.children = search_title_recursively(node.children, str_searched);
                            if (node.children.length) {
                                return node;
                            } else {
                                return undefined;
                            }
                        } else {
                            return undefined;
                        }
                    }).filter(item => item);
                }

                const tree_data = search_title_recursively(temp_tree_data, str_searched);
                this.verbalTree = tree_data;
            }
        },
        created() {
            // 获取话术分类
            this.getVerbalClassify();
        }
    };
</script>

<style lang="less" scoped>
    .verbal-optimize-div {
        font-size: 12px;
        max-height: 48px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        word-wrap: break-word;
    }

    .piwik_ChatSplitToVerbal:hover {
        .custom-custom-script-set {
            color: #4285F4;
        }
    }

    .short-cut-verbal-search {
        padding: 0 20px;
        display: flex;
        .ivu-input-wrapper .ivu-input {
            border-radius: 16px;
        }
    }

    /* 可以设置不同的进入和离开动画 */
    /* 设置持续时间和动画函数 */
    /*.slide-fade-enter-active {*/
    /*transition: all .5s ease;*/
    /*}*/
    /*.slide-fade-leave-active {*/
    /*transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0);*/
    /*}*/
    /*.slide-fade-enter, .slide-fade-leave-to*/
    /*!* .slide-fade-leave-active for below version 2.1.8 *! {*/
    /*transform: translateX(10px);*/
    /*opacity: 0;*/
    /*}*/
    .main-shortcuts {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 99;
        background-color: #ffffff;

        &-top {
            height: 30px;
            line-height: 30px;
            margin: 20px;
        }

        &-block {
            position: absolute;
            top: 120px;
            left: 0;
            right: 0;
            bottom: 0;
            overflow-y: auto;
        }

        &-list {
            cursor: pointer;
            color: rgba(0, 0, 0, 0.80);
            padding: 10px 20px;
            box-shadow: inset 0 -1px 0 0 #F5F5F5;

            &:hover {
                color: #FA8241;
            }
        }

        &-list-active {
            color: #FA8241;
        }
    }

    .main-shortcuts-block {
        padding: 0 20px;
        font-family: PingFangSC-Regular;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.80);
    }
</style>
