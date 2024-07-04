import { debounce } from 'lodash';

export default {
    watch: {
        filterText(val) {
            this.debounceSearch(val);
        }
    },
    methods: {
        debounceSearch: debounce(function(val) {
            this.$refs[this.treeRef].filter(val);
        }, 200),
        getTree({ forbiddenUserList, checkedList }) {
            // 构建树 father to tree 过滤掉没有人员的部门
            this.treeDatas = this.$dym.removeNodeByLevelChildrenLength(this.$dym.buldTreeStruct(
                this.storeDeparmentOriginList,
                this.storeUserOriginList,
                forbiddenUserList
            ));
            // this.treeDatas = this.$dym.buldTreeStruct(
            //     this.storeDeparmentOriginList,
            //     this.storeUserOriginList,
            //     forbiddenUserList
            // );
            // console.clear();
            // console.info(this.$dym.getTreeTargetKeyToList(this.treeDatas).length);
            this.setTreeChecked(checkedList);
        },
        setTreeChecked(checkedList = []) {
            this.$nextTick(function name(params) {
                this.$refs[this.treeRef].setCheckedKeys(checkedList.map(v => `${v}-person`));
            });
        },
        filterNode(value, data, node) {
            // 如果什么都没填就直接返回  搜索
            if (!value) return true;
            // 如果传入的value和data中的label相同说明是匹配到了
            if (data.name.indexOf(value) !== -1) {
                return true;
            }
            // 否则要去判断它是不是选中节点的子节点
            return this.checkBelongToChooseNode(value, data, node);
        },
        // 判断传入的节点是不是选中节点的子节点
        checkBelongToChooseNode(value, data, node) {
            const level = node.level;
            // 如果传入的节点本身就是一级节点就不用校验了
            if (level === 1) {
                return false;
            }
            // 先取当前节点的父节点
            let parentData = node.parent;
            // 遍历当前节点的父节点
            let index = 0;
            while (index < level - 1) {
                // 如果匹配到直接返回
                if (parentData.data.name.indexOf(value) !== -1) {
                    return true;
                }
                // 否则的话再往上一层做匹配
                parentData = parentData.parent;
                index++;
            }
            // 没匹配到返回false
            return false;
        },
        renderContent(h, { node, data, store }) {
            // 渲染节点
            function getIcon(str) {
                return str === 'person'
                    ? 'custom custom-person'
                    : 'custom custom-group';
            }
            const type = data.nodeIdentifier.split('-')[1];
            return h(
                'span',
                {
                    style: {
                        maxWidth: '120px',
                        display: 'inline-block',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden'
                    },
                    attrs: {
                        title: data.name
                    }
                },
                [
                    h('span', [
                        h('Icon', {
                            props: {
                                custom: getIcon(type)
                            },
                            style: {
                                marginRight: '8px',
                                fontSize: '16px'
                            }
                        }),
                        h('span', data.name)
                    ])
                ]
            );
        }
    }
};
