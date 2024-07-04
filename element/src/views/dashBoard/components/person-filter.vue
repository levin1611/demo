<!-- 仪表盘 tableCard 组件通用的筛选组件 -->
<template>
    <Poptip width="320"
            placement="bottom-end"
            popper-class="card-filter"
            ref="poptip">
        <!-- 按钮, Poptip 触发器 -->
        <div slot="reference" class="card-filter__trigger">
            <!-- 标题 -->
            <Tooltip :content="title" effect="dark" placement="top">
                <span class="card-filter__title department-filter-title">{{ title }}</span>
            </Tooltip>
            <!-- 下拉按钮 -->
            <template >
                <span class="el-select">
                    <span class="el-input">
                        <i class="el-select__caret el-input__icon el-icon-arrow-up"></i>
                    </span>
                </span>
                <!-- <Icon custom="custom custom-menu-arrow"
                      color="#7B98B6"
                      size="10"></Icon> -->
            </template>
        </div>

        <!-- Poptip 内容 -->
        <div class="card-filter__popper">
            <!-- 用户型 -->
            <div class="filter-content">
                <div class="title">
                    <Icon custom="custom-table-filter"></Icon>
                    <span>{{ $t("tableFilter.contentFilter") }}</span>
                </div>
                <template>
                    <Input v-model="keywords"
                        :placeholder="$t('tableFilter.tip_inputKeyWords')"
                        @input="generate_child_tree(keywords)">
                        <Icon
                            slot="suffix"
                            type="ios-search"
                            :size="16"
                            @click.native="generate_child_tree(keywords)"
                            style="line-height: 32px; cursor: pointer"
                        ></Icon>
                    </Input>
                    <div class="filter-items filter-tree"
                        style="max-height: 280px;height: 280px">
                        <Tree ref="personTree"
                            node-key="id"
                            :props="props"
                            :data="tree_data"
                            show-checkbox
                            :filter-node-method="filterNode"
                            :default-expand-all="true">
                        </Tree>
                    </div>
                </template>
            </div>
            <!-- 底部按钮 -->
            <div class="card-filter-btns">
                <Button @click="cancel"
                        type="minor"
                        size="small">{{ $t('cancel') }}</Button>
                <Button type="success"
                        size="small"
                        @click="confirm"
                        :class="`piwik-${cardType}-person-filter`">{{ $t('confirm') }}</Button>
            </div>
        </div>
    </Poptip>
</template>

<script>
    import { mapState } from 'vuex';
    export default {
        name: 'person-filter',
        props: [
            // 所属 card 类型
            'cardType',
            // 筛选值
            'filterValue',
            'department_list',
            'user_list'
        ],
        computed: {
            ...mapState({
                userId: state => state.userId,
                fullName: state => state.fullName,
                userName: state => state.userName,
                orgId: state => state.enterpriseId
            })
        },
        data() {
            return {
                /* 全局 */
                // 筛选标题,
                title: this.$t('allDepartment'),
                props: {
                    label: 'title',
                    children: 'children',
                    multiple: true,
                    value: 'id'
                },
                tree_data: [],
                keywords: '', // 搜索词，
                treeItemClass: ''
            };
        },
        methods: {
            /* 全局 */
            confirm() {
                const allChecked = this.$refs.personTree.getCheckedNodes();
                const selectedUserIds = [];
                if (allChecked.length) {
                    allChecked.forEach(item => {
                        if (item.type && item.type === 'person') {
                            selectedUserIds.push(item.id);
                        }
                    });
                } else {
                    this.title = this.$t('allDepartment');
                }
                this.$emit('handleFilter', 'userIdList', selectedUserIds);
                this.closePoptip();
            },
            cancel() {
                if (this.filterValue) {
                    this.$refs.personTree.setCheckedKeys(this.filterValue);
                } else {
                    this.$refs.personTree.setCheckedKeys([]);
                }
                // 关闭弹窗
                this.closePoptip();
            },
            get_tree(param_arr, user_list) {
                const userList = user_list.map((item) => {
                    const obj = {};
                    obj.parentId = item.departmentId;
                    obj.name = item.fullname;
                    obj.power = item.manageName;
                    obj.id = item.id;
                    obj.check = false;
                    obj.type = 'person';
                    return obj;
                });
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
                                // if (arr[i].type !== 'person') {
                                obj.children = [];
                                // }
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
            filterNode(value, data) {
                if (!value) return true;
                return data.title.indexOf(value) !== -1;
            },
            generate_child_tree(title) {
                this.$refs.personTree.filter(title);
                // const str_searched = title || ''; // 要搜索的文字
                // const temp_tree_data = this.get_tree(this.department_list, this.user_list, []); // 全量 tree_data
                // console.log(temp_tree_data);
                // function search_title_recursively(nodes, str_searched) {
                //     return nodes.map((node) => {
                //         if (node.title.includes(str_searched)) {
                //             return node;
                //         } else if (node.children && node.children.length) {
                //             node.children = search_title_recursively(
                //                 node.children,
                //                 str_searched
                //             );
                //             if (node.children && node.children.length) {
                //                 return node;
                //             } else {
                //                 return undefined;
                //             }
                //         } else {
                //             return undefined;
                //         }
                //     }).filter((item) => item);
                // }

                // const treeData = search_title_recursively(temp_tree_data, str_searched);
                // if (this.user_list.length === 1) {
                //     this.title = this.fullName;
                //     this.tree_data = treeData;
                // } else {
                //     this.title = this.$t('allDepartment');
                //     this.tree_data = [
                //         {
                //             title: this.$t('allDepartment'),
                //             id: 0,
                //             parentId: -1,
                //             checked: false,
                //             expand: true,
                //             children: treeData
                //         }
                //     ];
                // }
                // console.log('getCheckedKeys', this.$refs.personTree.getCheckedKeys())
            }, // 根据 id 在页面中定位常用检索, 返回值为"定位是否成功"
            closePoptip() {
                this.$refs.poptip.doClose();
            }
        },
        created() {
        },
        mounted() {
        },
        watch: {
            user_list: {
                handler(val) {
                    const treeData = this.get_tree(this.department_list, this.user_list);
                    if (this.user_list.length === 1) {
                        this.title = this.fullName;
                        this.tree_data = treeData;
                    } else {
                        this.title = this.$t('allDepartment');
                        this.tree_data = [
                            {
                                title: this.$t('allDepartment'),
                                id: 0,
                                parentId: -1,
                                checked: true,
                                expand: true,
                                children: treeData
                            }
                        ];
                    }
                },
                immediate: true
            },
            filterValue: {
                handler(val) {
                    if (val) {
                        if (val && val.length) {
                            this.$nextTick(() => {
                                this.$refs.personTree.setCheckedKeys(val);
                                const title = [];
                                this.user_list.forEach(item => {
                                    if (val.includes(item.id)) {
                                        title.push(item.fullname);
                                    }
                                });
                                this.title = title.join(',');
                            });
                        }
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less">
   @import './filter.less';
</style>
