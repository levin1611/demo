<template>
    <Tree :data="treeData"
          :render-content="renderContent"
          :default-expand-all="true"
          :filter-node-method="filterNode"
          ref="tree"></Tree>
</template>

<script>
    export default {
        name: 'departmentTree',
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
            departmentList: {
                type: Array,
                default() {
                    return [];
                }
            },
            // 部门 支持全选
            departmentSelectAll: {
                type: Boolean,
                default() {
                    return false;
                }
            }
        },
        computed: {
            // 被选中的 id
            checkedIds() {
                return this.checkedList.filter(item => item.type === 'department').map(item => item.value);
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
                // if (this.searchWord) {
                //     this.treeData = this.handleTreeData(this.departmentList.filter(item => item.name.includes(this.searchWord)));
                // } else {
                // this.treeData = [{
                //     name: this.companyName,
                //     id: 0,
                //     children: this.handleTreeData(this.departmentList)
                // }];
                this.treeData = this.handleTreeData(this.departmentList);
                // }
            },
            // 处理得到树结构数据
            handleTreeData(data) {
                // 深copy数据,防止数据渲染出错
                const tempData = data.concat();
                tempData.forEach(item => {
                    const children = tempData.filter(child => child.parentId === item.id);
                    if (children.length) {
                        item.children = children.sort((a, b) => a.sortNo - b.sortNo);
                    }
                });

                return tempData.filter(item => item.parentId === 0).sort((a, b) => a.sortNo - b.sortNo);
            },
            // 部门树渲染函数
            renderContent(h, { node, data }) {
                // 最顶层 node , 公司
                if (node.level === 1 && !this.departmentSelectAll) {
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

                // 普通部门
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
                        }, data.name)
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
                        }, data.name)
                    ]);
                }
            },
            // 选中/取消选中树节点
            toggleCheck(boo, data) {
                this.$emit('updateCheckedList', {
                    type: 'department',
                    nodeData: {
                        value: data.id,
                        label: data.name
                    },
                    boo
                });

                const _this = this;
                // 如果当前选中的部门还有下级部门,则选中所有下级部门
                function child(data) {
                    if (Array.isArray(data) && !data.roleId) {
                        data.forEach(item => {
                            if (item.hasOwnProperty('roleId')) {
                                // console.error(item);
                                return;
                            }
                            _this.$emit('updateCheckedList', {
                                type: 'department',
                                nodeData: {
                                    value: item.id,
                                    label: item.name
                                },
                                boo
                            });

                            if (item.children) {
                                child(item.children);
                            }
                        });
                    }
                };

                if (data.children) {
                    child(data.children);
                }
            },
            // 关键词过滤
            filterNode(value, data) {
                if (!value) {
                    return true;
                }
                return data.name.indexOf(value) !== -1;
            }
        },
        watch: {
            // 树结构源数据变动时, 重新计算数据, 更新视图
            departmentList: {
                handler(val, oldVal) {
                    if (JSON.stringify(val) !== JSON.stringify(oldVal)) {
                        this.refreshTree();
                    }
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
