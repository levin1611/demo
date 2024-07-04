import { debounce } from 'lodash';
export default {
    methods: {
        selectChange(ev) {
            // select to tree
            this.statusValue = this.statusValue.filter(v => v.label !== ev);
            this.setTreeChecked(this.statusValue.map(v => v.value));
            if (this.validResMsg()) {
                // to father
                this.resMsg(this.reArguments());
            }
        },
        changeSelectedUserIds: debounce(async function(curNode, { checkedKeys, checkedNodes }) {
            const sbpm = checkedNodes.filter(v => v.nodeIdentifier.indexOf('person') !== -1 && !v.disabled).map(v => {
                return {
                    value: Number(v.id),
                    label: v.name
                };
            });
            // 删除
            const cnm = this.statusValue.filter(v => sbpm.some(m => m.value === v.value)); // 取 statusValue 交集
            const cnmpm = cnm.length ? sbpm.filter(v => !cnm.some(m => m.value === v.value)) : sbpm; // 取 sbpm 补集
            const csbpm = cnm.concat(cnmpm);
            // if (!csbpm.length) {
            //     this.$emit('update:showSelect', true);
            //     setTimeout(() => {
            //         this.$emit('update:showSelect', true);
            //     }, 300);
            // }
            this.statusValue = csbpm;
            this.status = csbpm.map(v => v.label);
            if (this.validResMsg()) {
                // to your mother
                this.resMsg(this.reArguments());
            }
        }, 200),
        // changeSelectedUserIds(node) {
        //     // tree to select || save your mather order, super SB PM
        //     const checkBoxsTreeList = this.$refs[this.treeRef].getCheckedNodes(true, false)
        //         .filter(v => v.nodeIdentifier.indexOf('person') !== -1 && !v.disabled);
        //     this.statusValue = checkBoxsTreeList.map(v => {
        //         return {
        //             value: Number(v.id),
        //             label: v.name
        //         };
        //     });
        //     this.status = checkBoxsTreeList.map(v => v.name);
        //     if (this.validResMsg()) {
        //         // to your mother
        //         this.resMsg(this.reArguments());
        //     }
        // },
        revertSelected(checkedList = [], storeUserOriginList = []) {
            // 树已选中状态 恢复select 值~~~~ 初始化selected选中数组值恢复 father to select
            checkedList.forEach(v => {
                const item = storeUserOriginList.find(m => m.id === v);
                if (item) {
                    this.statusValue.push({
                        label: item.fullname,
                        value: Number(item.id)
                    });
                    this.status.push(item.fullname);
                }
            });
            if (this.validResMsg()) {
                // to father
                this.resMsg(this.reArguments());
            }
        },
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
        }
    }
};
