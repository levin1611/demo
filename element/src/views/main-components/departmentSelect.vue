<template>
    <div>
        <Poptip width="320"
            placement="bottom-end"
            :disabled="disabled"
            popper-class="departmentSelectPoptip"
            ref="departmentSelectPoptip"
            @show="show">
            <Select slot="reference"
                :value="value_show"
                :disabled="disabled"
                :size="size"
                :placeholder="$t('systemNotice.addRule.tip_selectDepartment')"
                :multiple="multiple"
                :collapse-tags="collapseTags"
                popper-class="no-display"
                ref="select"
                @remove-tag="removeTag"
                style="font-size: 12px;"
                class="commonUserSelect-select">
                <Option v-for="item in selectedDepartments"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label">
                </Option>
            </Select>
            <!-- Poptip 内容 -->
            <div class="card-filter__popper">
                <Input
                    v-model="keywords"
                    :placeholder="$t('tableFilter.tip_inputKeyWords')"
                    @input="generate_departments_data(keywords)"
                    >
                    <Icon
                        slot="suffix"
                        type="ios-search"
                        :size="16"
                        @click.native="generate_departments_data(keywords)"
                        style="line-height: 32px; cursor: pointer"
                    ></Icon>
                </Input>
                <div style="max-height: 289px; overflow-y: auto;" >
                    <Tree
                        :data="departmentsTree"
                        show-checkbox
                        default-expand-all
                        check-strictly
                        node-key="id"
                        :render-content="renderContent"
                        :filter-node-method="filterNode"
                        ref="departmentTree"
                        style="margin-top: 15px"
                    ></Tree>
                </div>
                <div class="departmentSelectFooter">
                    <Button type="minor"
                            size="small"
                            @click="handleCancel">{{ $t('cancel') }}</Button>
                    <Button type="success"
                            size="small"
                            @click="handleSave">{{ $t('confirm') }}</Button>
                </div>
            </div>
        </Poptip>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    export default {
        name: 'departmentSelect',
        props: [
            'departmentsData',
            'checkdDepartments',
            'disabled',
            'size',
            'multiple',
            'collapseTags'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName'
            })
        },
        data() {
            return {
                value_show: [],
                departmentProps: {
                    children: 'children',
                    label: 'title'
                },
                departmentsTree: [],
                selectedDepartments: [],
                keywords: '' // 搜索词
            };
        },
        created() {
            // this.getDepartmentsData();
        },
        mounted() {},
        methods: {
            show() {
                // if (this.checkdDepartments && this.checkdDepartments.length) {
                //     this.selectedDepartments = this.$deepClone(this.checkdDepartments);
                //     this.value_show = this.selectedDepartments.map((item) => item.value);
                //     this.$refs.departmentTree.setCheckedKeys(this.value_show);
                // }
            },
            // 关闭 poptip 框
            doClose() {
                this.$refs.departmentSelectPoptip.doClose();
            },
            handleSave() {
                const allChecked = this.$refs.departmentTree.getCheckedNodes();
                this.selectedDepartments = allChecked.map((item) => {
                    return {
                        value: item.id,
                        label: item.title
                    };
                });
                this.value_show = this.selectedDepartments.map((item) => item.value);
                this.$emit('update:checkdDepartments', this.selectedDepartments);
                this.$refs.departmentSelectPoptip.doClose();
            },
            handleCancel() {
                this.keywords = '';
                this.$refs.departmentSelectPoptip.doClose();
            },
            removeTag(code) {
                const index = this.selectedDepartments.findIndex(item => item.value === code);
                this.selectedDepartments.splice(index, 1);
                this.value_show = this.selectedDepartments.map((item) => item.value);
                this.$refs.departmentTree.setCheckedKeys(this.value_show);
                this.$emit('update:checkdDepartments', this.selectedDepartments);
            },
            // // 部门筛选相关
            // getDepartmentsData() {
            //     this.$commonApi.getCrmManageDepartments({
            //         orgId: this.enterpriseId,
            //         userId: this.userId
            //     }).then(data => {
            //         if (data.code === '1') {
            //             this.departmentsData = data.data;
            //             this.departmentsTree = this.get_departments_tree(data.data);
            //         } else {
            //             this.$Message.error(this.$t('authority.userManagement.departmentErr'));
            //             this.loading_tree = false;
            //         }
            //     });
            // },
            renderContent(h, { data }) {
                function get_icon(str) {
                    return str === 'person'
                        ? 'custom custom-person'
                        : 'custom custom-group';
                }

                return h('span', [
                    h('Icon', {
                        props: {
                            custom: get_icon(data.type)
                        },
                        style: {
                            marginRight: '8px',
                            fontSize: '16px'
                        }
                    }),
                    h(
                        'span',
                        {
                            attrs: {
                                title: data.title
                            },
                            style: {
                                display: 'inline-block',
                                maxWidth: '100px',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                verticalAlign: 'bottom'
                            }
                        },
                        data.title
                    )
                ]);
            },
            get_departments_tree(param_arr) {
                const arr = param_arr.map((item) => {
                    const obj = {};
                    obj.parentId = item.parentId;
                    obj.name = item.name;
                    obj.id = item.id;
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
                    return arr.map((item) => {
                        const obj = {};
                        obj.title = item.name;
                        obj.id = item.id;
                        obj.sortNo = item.sortNo;
                        obj.parentId = item.parentId;
                        obj.children = [];
                        return obj;
                    });
                }
                parent_arr = structure_parent_arr(parent_arr);
                function build_child(parent_arr, arr) {
                    for (let j = 0; j < parent_arr.length; j++) {
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i].parentId === parent_arr[j].id) {
                                const obj = {};
                                obj.title = arr[i].name;
                                obj.id = arr[i].id;
                                obj.parentId = arr[i].parentId;
                                obj.grandpa_id = parent_arr[j].parentId;
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
                return build_child(parent_arr, arr);
            },
            generate_departments_data(keywords) {
                this.$refs.departmentTree.filter(keywords);
            },
            filterNode(value, data) {
                if (!value) return true;
                return data.title.indexOf(value) !== -1;
            }
        },
        watch: {
            checkdDepartments: {
                handler(val) {
                    if (val && val.length) {
                        this.selectedDepartments = this.$deepClone(val);
                        this.value_show = val.map((item) => item.value);
                        this.$refs.departmentTree.setCheckedKeys(this.value_show);
                    } else {
                        this.selectedDepartments = [];
                        this.value_show = [];
                        this.$nextTick(() => {
                            this.$refs.departmentTree.setCheckedKeys(this.value_show);
                        });
                    }
                },
                immediate: true
            },
            departmentsData: {
                handler(val) {
                    if (val && val.length) {
                        this.departmentsTree = this.get_departments_tree(val).sort((a, b) => a.sortNo - b.sortNo);
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style>
    .departmentSelectFooter {
        text-align: right;
    }
</style>
