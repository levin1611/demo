<template>
  <Select
    ref="select"
    v-model="status"
    v-loading="loading"
    :placeholder="placeholder"
    :openAnimation="false"
    :style="{width:width}"
    class="_overY"
    :multiple="multiple"
    @visible-change="visibleChange"
    @remove-tag="selectChange"
  >
    <Option
      :value="statusValue"
      disabled
      :style="`height: auto;background-color:#ffffff;cursor: default;${defaultStyle}`"
    >
        <Input v-if="showSearch"
                icon="ios-search-strong"
                style="margin-bottom: 10px"
                search
                v-model="filterText"
                :placeholder="$t('tableFilter.tip_inputKeyWords')" >
            <i slot="suffix" class="el-input__icon el-icon-search"></i>
        </Input>
      <Tree
        :data="treeDatas"
        :style="`overflow-y:auto;max-height: 200px; ${treeStyle}`"
        show-checkbox
        :ref="treeRef"
        :check-strictly="checkStrictly"
        :multiple="multiple"
        :filter-node-method="filterNode"
        default-expand-all
        :props="defaultProps"
        :render-content="renderContent"
        :node-key="nodeKey || 'id'"
        @check="changeSelectedUserIds"
      ></Tree>
      <slot></slot>
    </Option>
  </Select>
</template>
<script>
    import { debounce } from 'lodash';
    export default ({
        name: 'customizedTreeSelector',
        props: {
            width: String,
            treeDatas: Array,
            resMsg: Function,
            renderContent: Function,
            multiple: {
                type: Boolean,
                default: false
            },
            defaultProps: Object,
            checkedDataList: Array,
            name: String,
            showSearch: {
                type: Boolean,
                default: true
            },
            SynchronizeStatus: Object,
            placeholder: {
                type: String,
                default: '请选择'
            },
            defaultStatus: {
                type: Array,
                default: () => ([])
            },
            checkStrictly: {
                type: Boolean,
                default: false
            },
            defaultStyle: {
                type: String
            },
            treeStyle: {
                type: String
            },
            nodeKey: {
                type: String
            },
            onVisibleChange: {
                type: Function, // slect 失去焦点执行函数
                default: null
            }
        },
        data() {
            return {
                loading: false,
                filterText: '',
                storeUserOriginList: [],
                storeDeparmentOriginList: [],
                statusValue: [],
                status: [],
                checkBoxsTreeList: [],
                treeRef: `treeRefs${this.$dym.Rnum()}`
            };
        },
        methods: {
            filterNode(value, data, node) {
                // 如果什么都没填就直接返回  搜索
                if (!value) return true;
                // 如果传入的value和data中的label相同说明是匹配到了
                if (data[this.name].indexOf(value) !== -1) {
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
                    if (parentData.data[this.name].indexOf(value) !== -1) {
                        return true;
                    }
                    // 否则的话再往上一层做匹配
                    parentData = parentData.parent;
                    index++;
                }
                // 没匹配到返回false
                return false;
            },
            selectChange(ev) {
                // select to tree
                this.statusValue = this.statusValue.filter(v => v.label !== ev);
                this.setTreeChecked(this.statusValue.map(v => v.value));
                if (this.validResMsg()) {
                    // to father
                    this.resMsg(this.reArguments());
                }
            },
            setTreeChecked(checkedList = []) {
                this.$nextTick(function name(params) {
                    this.$refs[this.treeRef].setCheckedKeys(checkedList);
                });
            },
            changeSelectedUserIds: debounce(async function(curNode, { checkedKeys, checkedNodes }) {
                const sbpm = checkedNodes.map(v => {
                    return {
                        value: v[this.nodeKey] || v.id,
                        label: v[this.name]
                    };
                });
                // 删除
                const cnm = this.statusValue.filter(v => sbpm.some(m => m.value === v.value)); // 取 statusValue 交集
                const cnmpm = cnm.length ? sbpm.filter(v => !cnm.some(m => m.value === v.value)) : sbpm; // 取 sbpm 补集
                const csbpm = cnm.concat(cnmpm);
                this.statusValue = csbpm;
                this.status = csbpm.map(v => v.label);
                if (this.validResMsg()) {
                    this.resMsg(this.reArguments());
                }
            }, 200),
            validResMsg() {
                return this.resMsg && typeof this.resMsg === 'function';
            },
            reArguments() {
                return {
                    ids: this.statusValue.map(v => v.value),
                    idNames: this.statusValue.map(v => {
                        const o = {};
                        o[v.value] = v.label;
                        return o;
                    })
                };
            },
            debounceSearch: debounce(function(val) {
                this.$refs[this.treeRef].filter(val);
            }, 200),
            visibleChange(flag) {
                this.onVisibleChange && this.onVisibleChange(flag);
            }
        },
        watch: {
            filterText(val) {
                this.debounceSearch(val);
            },
            SynchronizeStatus(val) {
                this.status.push(val[this.name]);
                this.statusValue.push({
                    label: val[this.name],
                    value: val[this.nodeKey] || val.id
                });
                // 获取当前的选中项结合
                const ids = this.$refs[this.treeRef].getCheckedKeys();
                this.$refs[this.treeRef].setCheckedKeys([...ids, val[this.nodeKey] || val.id]);
            },
            defaultStatus: {
                handler(val) {
                    if (val.length) {
                        this.statusValue = [];
                        this.status = [];
                        for (let i = 0; i < val.length; i++) {
                            const item = val[i];
                            this.status.push(item[this.name]);
                            this.statusValue.push({
                                label: item[this.name],
                                value: item[this.nodeKey] || item.id
                            });
                        }
                    } else {
                        this.status = [];
                        this.statusValue = [];
                    }
                    this.$nextTick(() => {
                        const ids = val.map((item) => item[this.nodeKey] || item.id);
                        this.$refs[this.treeRef].setCheckedKeys([...ids]);
                        if (this.validResMsg()) {
                            this.resMsg(this.reArguments());
                        }
                    });
                },
                deep: true
            }
        }
    });
</script>
<style scoped>

</style>
