<template>
    <Tree :data="treeData"
          :render-content="renderContent"
          :default-expand-all="true"
          :filter-node-method="filterNode"
          ref="tree"></Tree>
</template>

<script>
    export default {
        name: 'roleTree',
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
            roleList: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        computed: {
            // 被选中的 id
            checkedIds() {
                return this.checkedList.filter(item => item.type === 'role').map(item => item.value);
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
                this.treeData = this.handleTreeData(this.roleList);
            },
            // 处理得到树结构数据
            handleTreeData(data) {
                return data.slice();
            },
            // 部门树渲染函数
            renderContent(h, { data }) {
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
                            }
                        }, data.name)
                    ]);
                }
            },
            // 选中/取消选中树节点
            toggleCheck(boo, data) {
                this.$emit('updateCheckedList', {
                    type: 'role',
                    nodeData: {
                        value: data.id,
                        label: data.name
                    },
                    boo
                });
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
            roleList: {
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
