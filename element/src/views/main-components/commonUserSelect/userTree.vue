<template>
    <Tree :data="treeData"
          :render-content="renderContent"
          :default-expand-all="true"
          :filter-node-method="filterNode"
          ref="tree"></Tree>
</template>

<script>
    export default {
        name: 'userTree',
        props: {
            checkedList: {
                type: Array,
                default() {
                    return [];
                }
            },
            searchWord: {
                type: String,
                default() {
                    return '';
                }
            },
            multiple: {
                type: Boolean,
                default() {
                    return true;
                }
            },
            companyName: {
                type: String,
                default() {
                    return '';
                }
            },
            departmentListUsedByUser: {
                type: Array,
                default() {
                    return [];
                }
            },
            userList: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        computed: {
            // 被选中的 id
            checkedIds() {
                return this.checkedList.filter(item => item.type === 'user').map(item => item.value);
            },
            // 部门数据 + 用户数据, 没有实际意义, 给 watch 用
            dataListStr() {
                return JSON.stringify({
                    departmentListUsedByUser: this.departmentListUsedByUser,
                    userList: this.userList
                });
            }
        },
        data() {
            return {
                treeData: []
            };
        },
        methods: {
            // 更新树
            refreshTree() {
                // this.treeData = [{
                //     name: this.companyName,
                //     id: 0,
                //     children: this.handleTreeData(this.departmentListUsedByUser, this.userList)
                // }];
                this.treeData = this.handleTreeData(this.departmentListUsedByUser, this.userList);
            },
            // 处理得到树结构数据
            handleTreeData(departmentData, userData) {
                // 深copy数据,防止数据渲染出错
                const temp_departmentData = departmentData.concat();
                const temp_userData = userData.concat();

                temp_departmentData.forEach(item => {
                    if (!item.children) {
                        item.children = [];
                    }

                    // 查找该部门是否有用户, 若有, 说明此部门是末端部门, 无需往下查找是否有子部门
                    const children_user = temp_userData.filter(child => {
                        if (child.departmentId === item.id && !child.isLock && !child.isDelete) {
                            child.type = 'user';
                            return true;
                        }
                    });
                    if (children_user.length) {
                        // 最下级部门没有children属性,给它加一个,不然不会显示部门成员
                        // if (!item.children) {
                        //     item.children = [];
                        // }
                        item.children.push(...children_user.slice());
                        // return;
                    }

                    // 此部门下没有用户, 查找此部门是否有子部门
                    const children_depart = temp_departmentData.filter(child => child.parentId === item.id);
                    if (children_depart.length) {
                        item.children.push(...children_depart.sort((a, b) => a.sortNo - b.sortNo));
                    }

                    // 去重
                    const childrenCopy = new Set();
                    item.children = item.children.filter(item => {
                        if (!childrenCopy.has(item.id)) {
                            childrenCopy.add(item.id);
                            return true;
                        }
                    });
                });

                return temp_departmentData.filter(item => item.parentId === 0).sort((a, b) => a.sortNo - b.sortNo);
            },
            // 部门树渲染函数
            renderContent(h, { node, data }) {
                // 最顶层 node , 公司
                if (node.level === 1) {
                    return h('span', [
                        h('Icon', {
                            props: {
                                size: '16',
                                custom: 'custom custom-fp-paper-file'
                            },
                            style: {
                                color: 'rgb(250, 130, 65)',
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
                        }, data.name)
                    ]);
                }

                // 如果是部门结点, 直接返回部门名称
                if (data.type !== 'user') {
                    return h('span', data.name);
                }

                // 否则是用户结点, 根据是否单选决定如何显示选择框
                if (this.multiple) {
                    return h('span', [
                        h('Checkbox', {
                            props: {
                                value: this.checkedIds.includes(data.id)
                            },
                            on: {
                                change: (boo) => {
                                    this.toggleCheck(boo, data);
                                }
                            },
                            nativeOn: {
                                click: e => {
                                    e.stopPropagation();
                                }
                            }
                        }, data.fullname)
                    ]);
                } else {
                    return h('span', [
                        h('Radio', {
                            props: {
                                label: true,
                                value: this.checkedIds.includes(data.id)
                            },
                            on: {
                                input: (boo) => {
                                    this.toggleCheck(boo, data);
                                }
                            },
                            nativeOn: {
                                click: e => {
                                    e.stopPropagation();
                                }
                            }
                        }, data.fullname)
                    ]);
                }
            },
            // 选中/取消选中树节点
            toggleCheck(boo, data) {
                this.$emit('updateCheckedList', {
                    type: 'user',
                    nodeData: {
                        value: data.id,
                        label: data.fullname
                    },
                    boo
                });
            },
            // 关键词过滤
            filterNode(value, data) {
                if (!value) {
                    return true;
                }
                if (data.type !== 'user') {
                    return data.name.indexOf(value) !== -1;
                } else {
                    // 关键词搜索时,搜索到的部门也要包含部门下的人员(这里使用departmentName)(之前用的fullname)
                    return (data.departmentName && data.departmentName.indexOf(value) !== -1) || data.fullname.indexOf(value) !== -1;
                }
            }
        },
        watch: {
            dataListStr: {
                handler() {
                    this.refreshTree();
                },
                immediate: true
            },
            searchWord: {
                handler(val) {
                    this.$refs.tree.filter(val);
                }
            }
        }
    };
</script>
