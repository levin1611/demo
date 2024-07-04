<!-- 通用的 人员/角色/部门 选择控件 -->
<!-- 思路: 在可设置项方面, 参考国家地区选择组件; 在树结构方面, 参考用户型表头筛选; 外部输入框, 采用 select , 将其 option 隐藏 -->
<template>
    <Poptip v-model="visible"
            placement="bottom-end"
            :disabled="disabled"
            :visible-arrow="false"
            :width="selectWidth"
            popper-class="commonUserSelect"
            ref="poptip"
            @after-enter="focus_searchInput"
            @hide="handleCancel">
        <!-- trigger 显示最终结果的输入框 -->
        <Select slot="reference"
                :value="value_show"
                :disabled="disabled"
                :size="size"
                :placeholder="placeholder_select"
                :multiple="multiple"
                :collapse-tags="collapseTags"
                popper-class="no-display"
                ref="select"
                @change="handleSelectValueChange"
                @remove-tag="removeTag"
                :style="computedSelectStyle"
                style="font-size: 12px;"
                class="commonUserSelect-select">
            <Option v-for="item in selectOptions"
                    :key="`${item.type}-${item.value}`"
                    :value="`${item.type}-${item.value}`"
                    :label="item.label">
            </Option>
        </Select>

        <!-- content 搜索 + 树结构 + 确定/取消 -->
        <div v-if="!disabled"
             @click.stop>
            <!-- 搜索词输入框 -->
            <div style="padding: 8px 8px 0;">
                <Input v-model="value_search"
                       :size="size"
                       :placeholder="$t('tableFilter.tip_inputKeyWords')"
                       autofocus
                       suffix-icon="el-icon-search"
                       ref="search"
                       class="commonUserSelect-searchInput">
                </Input>
            </div>

            <!-- tab 选择 部门/角色/人员 -->
            <Tabs v-model="currType"
                  @tab-click="handleClick"
                  class="commonUserSelect-tabs">
                <TabPane v-for="item in typeList"
                         :key="item.value"
                         :name="item.value"
                         :label="item.label"></TabPane>
            </Tabs>

            <!-- 人员/角色/部门 树结构 -->
            <div class="commonUserSelect-tree">
                <keep-alive>
                    <Component :is="currType"
                               :checkedList="selectOptions"
                               :searchWord="value_search"
                               :multiple="multiple"
                               :departmentSelectAll="departmentSelectAll"
                               :companyName="companyName"
                               :departmentList="departmentList"
                               :departmentListUsedByUser="departmentListUsedByUser"
                               :roleList="roleList"
                               :userList="userList"
                               @updateCheckedList="updateCheckedList"></Component>
                </keep-alive>
            </div>

            <!-- footer 确定/取消 -->
            <div class="commonUserSelect-footer">
                <Button type="minor"
                        size="small"
                        @click="handleCancel">{{ $t('cancel') }}</Button>
                <Button type="success"
                        size="small"
                        @click="handleSave">{{ $t('confirm') }}</Button>
            </div>
        </div>
    </Poptip>
</template>

<script>
    import { mapState } from 'vuex';
    import DepartmentTree from '@/views/main-components/commonUserSelect/departmentTree';
    import RoleTree from '@/views/main-components/commonUserSelect/roleTree';
    import UserTree from '@/views/main-components/commonUserSelect/userTree';

    export default {
        name: 'commonUserSelect',
        components: {
            department: DepartmentTree,
            role: RoleTree,
            user: UserTree
        },
        props: {
            // 外部传入的"当前选中值"数据, 与 dataFormat 配合使用
            // 后者为 Object 时, value 传值 { type: 'department' || 'role' || 'user', value, label } 或此类数据组成的数组(多选)
            // type-value 时, 传值 `${type}-${value}`(或此类数组)
            // value 时, 传值 value(或此类数组), type 为 defaultType
            value: [String, Array],
            // 要求返回数据的格式
            // 'Object', 'type-value', 'value'
            dataFormat: {
                type: String,
                default() {
                    return 'Object';
                }
            },
            // 禁用
            disabled: Boolean,
            // 多选
            multiple: {
                type: Boolean,
                default() {
                    return true;
                }
            },
            // 当前组件要筛选的数据类型, 数组形式
            types: {
                type: Array,
                default() {
                    return ['department', 'role', 'user'];
                }
            },
            // 展开弹框时的默认选中 tab
            defaultType: {
                type: String,
                default() {
                    return 'department';
                }
            },
            // 外层选择框的样式
            selectStyle: {
                type: Object,
                default() {
                    return {};
                }
            },
            size: String,
            // 部门 支持全选
            departmentSelectAll: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            collapseTags: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            // 外部传入树结构数据
            companyName: String,
            departmentListUsedByUser: Array,
            departmentList: Array,
            roleList: Array,
            userList: Array
        },
        computed: {
            ...mapState(['enterpriseId']),
            // 外部 select 显示的 placeholder
            placeholder_select() {
                switch (this.currType) {
                    case 'department':
                        return this.$t('systemNotice.addRule.tip_selectDepartment');
                    case 'role':
                        return this.$t('systemNotice.addRule.tip_selectRole');
                    case 'user':
                        return this.$t('systemNotice.addRule.tip_selectUser');
                    default:
                        return this.$t('crm.Modal.tip_select');
                }
            },
            // 外部 Select 的 value
            value_show() {
                if (this.multiple) {
                    return this.selectOptions.map(item => `${item.type}-${item.value}`);
                } else {
                    const item = this.selectOptions[0];
                    return item ? `${item.type}-${item.value}` : '';
                }
            },
            // 外部 Select 的 styleObj
            computedSelectStyle() {
                return Object.assign({
                    width: '300px'
                }, this.selectStyle);
            }
        },
        data() {
            return {
                // poptip 整体
                visible: false,

                selectWidth: undefined,
                // 将被选中项格式化为外部 select option 选项, 包含 type , value, label 属性
                selectOptions: [],

                // 搜索词输入框
                value_search: '',

                // 切换类型 tab
                currType: 'department',
                typeList: [],
                allTypeList: [
                    { value: 'department', label: this.$t('systemNotice.addRule.department') },
                    { value: 'role', label: this.$t('systemNotice.addRule.role') },
                    { value: 'user', label: this.$t('systemNotice.addRule.user') }
                ]
            };
        },
        methods: {
            // select组件 点击删除icon时,触发的方法
            removeTag(e) {
                // 人员选择组件点击 人员后面的删除图标 时,更新数据
                this.$emit('update:value', this.handleSelectedData(this.selectOptions));
            },
            // 每次切换tab时,置空上面搜索框的内容
            handleClick() {
                // 置空搜索框的内容
                this.value_search = '';
            },
            /* 全局 */
            // 外部传值的 value 变动时, 做相应的处理
            handleValueChange(val) {
                // 定义"value 中有不存在于树结构的数据"
                let flag_noMatchedLabel = false;

                // 格式化外部 value 为 select 所需的 'type-value' 格式
                this.selectOptions = [].concat(val).filter(item => item).map(item => {
                    // 按是否含有 '-' 处理 type 和 value
                    let type = '';
                    let value = '';
                    let label = '';
                    if (this.dataFormat === 'Object') {
                        type = item.type;
                        value = item.value;
                        label = item.label;
                    } else {
                        type = this.defaultType;
                        value = item;
                        label = value;
                        const tmpArr = item.split('-');
                        if (tmpArr.length >= 2) {
                            type = tmpArr[0];
                            value = tmpArr[1];
                        }
                    }

                    // 根据树结构相关数据中是否有对应的数据, 来赋值 label , 没找到则直接用 value 为 label 显示, 同时, 请求接口更新树结构数据, 更新完毕后如果有数据, 则更新 label
                    let typeData = [];
                    let key_value = '';
                    let key_label = '';
                    switch (type) {
                        case 'department':
                            typeData = this.departmentList;
                            key_value = 'id';
                            key_label = 'name';
                            break;
                        case 'role':
                            typeData = this.roleList;
                            key_value = 'id';
                            key_label = 'name';
                            break;
                        case 'user':
                            typeData = this.userList;
                            key_value = 'id';
                            key_label = 'fullname';
                            break;
                    }
                    const matchedData = typeData.find(item => `${item[key_value]}` === `${value}`);
                    if (matchedData) {
                        label = matchedData[key_label];
                    } else {
                        flag_noMatchedLabel = true;
                    }

                    return { type, value, label };
                });

                // 如果现有 list 不包括变动后的值, 则需要重新请求列表, 保证列表数据是最新的
                if (flag_noMatchedLabel) {
                    this.$emit('refreshTreeData', this.types);
                }
            },
            // 关闭 poptip 框
            doClose() {
                this.$refs.poptip.doClose();
            },
            // 聚焦到弹出框的搜索 Input
            focus_searchInput() {
                if (this.$refs.search) {
                    this.$refs.search.$el.querySelector('input').focus();
                }
            },

            /* 外部 Select */
            // select 触发 change 事件后, 调整下拉选项, 以更新视图显示
            // 因为 select 只作显示用, 所以此处理论上只有多选时 remove tag 才会触发此方法
            handleSelectValueChange(val) {
                if (!val.length) {
                    this.selectOptions = [];
                    return;
                }

                if (this.multiple) {
                    this.selectOptions = this.selectOptions.filter(item => val.includes(`${item.type}-${item.value}`));
                } else {
                    this.selectOptions = this.selectOptions.filter(item => val === `${item.type}-${item.value}`);
                }
            },

            /* 树结构 */
            // 获取各类树所需数据
            getDepartmentList() {
                this.$commonApi.getDepartmentTree({
                    orgId: this.enterpriseId
                }).then(response => {
                    if (response.code === '1') {
                        this.departmentList = JSON.parse(JSON.stringify(response.data.list));
                        this.departmentListUsedByUser = response.data.list;
                        this.companyName = response.data.orgName;
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.departmentErr'));
                    }
                }).catch(error => {
                    console.error(error);
                    this.$Message.error(this.$t('authority.userManagement.departmentErr'));
                });
            },
            getRoleList() {
                this.$commonApi.getRoleAllByPage({
                    category: 2,
                    orgId: this.enterpriseId
                }).then(response => {
                    if (response.code === '1') {
                        this.roleList = response.data.data;
                    } else {
                        this.$Message.error(response.message);
                    }
                });
            },
            getUserList() {
                this.$commonApi.getUserDataList({
                    departmentId: 0,
                    orgId: this.enterpriseId,
                    pageNo: 1,
                    pageSize: 10000
                }).then((data) => {
                    if (data.code === '1') {
                        this.userList = data.data.list;
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                    }
                }).catch(error => {
                    console.error(error);
                    this.$Message.error(this.$t('authority.userManagement.queryFailure'));
                });
            },
            // 选中/取消选中树叶子节点, 更新外层 Select 数据
            updateCheckedList({ type, nodeData, boo }) {
                // 人员选择弹窗，选择一级部门后，再取消以及部门再选择，二三级部门重复显示
                let value = false;
                this.selectOptions.forEach(item => {
                    if (item.value === nodeData.value && boo) {
                        value = true;
                        return;
                    };
                });

                if (value) {
                    return;
                }

                // 多选
                if (this.multiple) {
                    if (boo) {
                        this.selectOptions.push({
                            type,
                            value: nodeData.value,
                            label: nodeData.label
                        });
                    } else {
                        this.selectOptions = this.selectOptions.filter(item => !(item.type === type && `${item.value}` === `${nodeData.value}`));
                    }
                    return;
                }

                // 单选
                this.selectOptions = [{
                    type,
                    value: nodeData.value,
                    label: nodeData.label
                }];
            },

            /* footer */
            handleCancel() {
                this.visible = false;
                this.value_search = '';
                this.handleValueChange(this.value);
            },
            handleSave() {
                this.$emit('update:value', this.handleSelectedData(this.selectOptions));
                this.visible = false;
            },
            // 处理选中数据
            handleSelectedData(data) {
                // options 数组数据格式化
                let valArr = [];
                switch (this.dataFormat) {
                    case 'Object':
                        valArr = data.slice();
                        break;
                    case 'type-value':
                        valArr = data.map(item => `${item.type}-${item.value}`);
                        break;
                    case 'value':
                    default:
                        valArr = data.map(item => item.value);
                        break;
                }

                // 根据单选或多选, 返回值
                if (this.multiple) {
                    return valArr;
                } else {
                    return valArr.pop() || '';
                }
            }
        },
        created() {},
        watch: {
            value: {
                handler(val) {
                    this.handleValueChange(val);
                },
                immediate: true
            },
            visible: {
                handler(val) {
                    if (val) {
                        this.typeList = this.allTypeList.filter(item => this.types.includes(item.value));
                        this.currType = this.defaultType;
                    }
                }
            },
            // 监测 select 的值的变化, 以此判断是否需要调整 popper 样式
            value_show: {
                handler(val) {
                    // 多选 select 值变动时, 如果 popper 正在显示, 则需要调节 popper 位置, 避免因 select 高度变化导致样式问题
                    if (this.visible && this.multiple) {
                        setTimeout(() => {
                            if (this.visible && this.$refs.poptip && this.$refs.poptip.updatePopper) {
                                this.$refs.poptip.updatePopper();
                            }
                        }, 50);
                    }

                    // 获取 select 的宽度, 让 popper 宽度与其保持一致
                    // 如果此处代码还不够, 可以 setInterval 定时获取宽度, 或者 mutation observer , 或者看 element 源码中 select inputWidth 的更新逻辑自己实现监听
                    setTimeout(() => {
                        if (this.$refs.select) {
                            this.selectWidth = this.$refs.select.inputWidth;
                        }
                    }, 50);
                },
                immediate: true
            },
            // 树结构数据变动时, 更新 selectOptions 中选项的 label
            // 主要是避免 value 值不在当前树结构数据中, 这种情况下重新请求树结构数据, 然后此处尝试重新查找数据
            departmentList: {
                handler(val) {
                    this.selectOptions.filter(item => item.type === 'department').forEach(option => {
                        const matchedData = this.departmentList.find(item => `${item.id}` === `${option.value}`);
                        if (matchedData) {
                            option.label = matchedData.name;
                        }
                    });
                }
            },
            roleList: {
                handler(val) {
                    this.selectOptions.filter(item => item.type === 'role').forEach(option => {
                        const matchedData = this.roleList.find(item => `${item.id}` === `${option.value}`);
                        if (matchedData) {
                            option.label = matchedData.name;
                        }
                    });
                }
            },
            userList: {
                handler(val) {
                    this.selectOptions.filter(item => item.type === 'user').forEach(option => {
                        const matchedData = this.userList.find(item => `${item.id}` === `${option.value}`);
                        if (matchedData) {
                            option.label = matchedData.fullname;
                        }
                    });
                }
            }
        }
    };
</script>

<style lang="less">
    .commonUserSelect {
        &.el-popper {
            margin-top: 0;
            padding: 0;
        }

        &-searchInput {
            width: 100%;
        }

        &-tree {
            height: 300px;
            overflow: auto;
        }

        &-footer {
            margin: 15px 15px 20px;
            text-align: right;
        }

        &-tabs {
            .el-tabs__nav {
                width: 100%;
            }

            .el-tabs__item {
                width: 33%;
                padding: 0;
                text-align: center;
            }

            .el-tabs__nav-wrap::after {
                height: 1px;
            }
        }
    }
</style>
<style scoped lang="less">
    // el-input__inner 是 select选择框
    /deep/ .commonUserSelect-select .el-input .el-input__inner{
        max-height: 150px !important; // 不加important会失效
        border-radius: 5px;
    }
    // el-select__tags 是 '显示的选择的数据'
    /deep/ .commonUserSelect-select .el-select__tags {
        max-height: 140px; // 高度要比input的高度低一点,不然会顶到input边上,显得样式很难看
        overflow: auto; // 设置出现滚动条
    }
</style>
