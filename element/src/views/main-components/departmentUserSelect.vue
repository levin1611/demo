<template>
    <div style="width: 100%">
        <Poptip :width="width"
            placement="bottom-start"
            :disabled="disabled"
            popper-class="departmentSelectPoptip"
            ref="departmentSelectPoptip"
            @show="show">
            <Select slot="reference"
                :value="value_show"
                :disabled="disabled"
                :size="size"
                :placeholder="placeholder || $t('systemNotice.addRule.tip_selectDepartment')"
                :multiple="multiple"
                :collapse-tags="collapseTags"
                popper-class="no-display"
                ref="select"
                @remove-tag="removeTag"
                style="font-size: 12px;"
                :style="{width: `${width ? width.indexOf('%') > 0 ? width : width + 'px' : '100%'}`}"
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
                        :data="treeData"
                        :props="defaultProps"
                        :show-checkbox="multiple"
                        default-expand-all
                        node-key="id"
                        :render-content="renderContent"
                        :filter-node-method="filterNode"
                        :expand-on-click-node="multiple"
                        @node-click="nodeClick"
                        ref="treeData"
                        style="margin-top: 15px"
                    ></Tree>
                </div>
                <div class="departmentSelectFooter" v-if="multiple">
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
    export default {
        name: 'departmentUserSelect',
        props: [
            'treeData',
            'checkdDepartments',
            'disabled',
            'size',
            'multiple',
            'collapseTags',
            'width',
            'from',
            'placeholder'
        ],
        computed: {},
        data() {
            return {
                defaultProps: {
                    children: 'list',
                    label: 'name'
                },
                value_show: [],
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
                //     const valueShow = this.checkdDepartments.map((item) => item.value);
                //     if (!this.multiple) {
                //         this.value_show = valueShow[0];
                //     } else {
                //         this.value_show = valueShow;
                //         this.$nextTick(() => {
                //             this.$refs.treeData.setCheckedKeys(this.value_show);
                //         });
                //     }
                // } else {
                //     this.selectedDepartments = [];
                //     this.value_show = [];
                //     this.$nextTick(() => {
                //         this.$refs.treeData.setCheckedKeys(this.value_show);
                //     });
                // }
            },
            // 关闭 poptip 框
            doClose() {
                this.$refs.departmentSelectPoptip.doClose();
            },
            handleSave() {
                const allChecked = this.$refs.treeData.getCheckedNodes();
                this.selectedDepartments = allChecked.filter(item => item.infoType === 1).map((item) => {
                    return {
                        value: item.id,
                        label: item.name,
                        userId: item.id,
                        serviceName: item.name,
                        serviceEnglishName: item.enName
                    };
                });
                this.value_show = this.selectedDepartments.map((item) => item.value);
                this.$emit('saveServiceList', this.selectedDepartments);
                this.$refs.departmentSelectPoptip.doClose();
            },
            handleCancel() {
                this.keywords = '';
                this.$refs.departmentSelectPoptip.doClose();
            },
            removeTag(code) {
                const index = this.selectedDepartments.findIndex(item => item.value === code);
                this.$emit('removeService', this.selectedDepartments[index]);
                this.selectedDepartments.splice(index, 1);
                this.value_show = this.selectedDepartments.map((item) => item.value);
                this.$refs.treeData.setCheckedKeys(this.value_show);
                if (this.from) {
                    this.$emit('saveServiceList', this.selectedDepartments);
                }
            },
            renderContent(h, { data }) {
                const iconSpan = data.infoType !== 1 ? (data.count === 0 ? h('Icon', {
                    props: {
                        custom: 'custom custom-shujiegou-wuziji'
                    },
                    style: {
                        marginRight: '8px',
                        fontSize: '16px'
                    }
                }) : h('svg', {
                    attrs: {
                        'aira-hidden': 'true'
                    },
                    style: {
                        width: '18px',
                        height: '18px',
                        marginRight: '5px',
                        marginLeft: '5px',
                        position: 'relative'
                    },
                    class: 'svg-icon'
                }, [
                    h('use', {
                        attrs: {
                            'xlink:href': '#custom-fp-paper-file'
                        }
                    })
                ])) : '';
                return h('span', [
                    iconSpan,
                    h(
                        'span',
                        {
                            attrs: {
                                title: data.name
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
                        data.name
                    )
                ]);
            },
            generate_departments_data(keywords) {
                this.$refs.treeData.filter(keywords);
            },
            filterNode(value, data) {
                if (!value) return true;
                return data.name.indexOf(value) !== -1;
            },
            nodeClick(data, node) {
                if (!this.multiple) {
                    this.selectedDepartments = [{
                        value: data.id,
                        label: data.name,
                        userId: data.id,
                        serviceName: data.name,
                        serviceEnglishName: data.enName
                    }];
                    this.value_show = data.id;
                    this.$emit('saveServiceList', this.selectedDepartments);
                    this.doClose();
                }
            }
        },
        watch: {
            checkdDepartments: {
                handler(val) {
                    if (val && val.length) {
                        this.selectedDepartments = this.$deepClone(val);
                        const valueShow = val.map((item) => item.value);
                        if (!this.multiple) {
                            this.value_show = valueShow[0];
                        } else {
                            this.value_show = valueShow;
                            this.$nextTick(() => {
                                this.$refs.treeData.setCheckedKeys(this.value_show);
                            });
                        }
                    } else {
                        this.selectedDepartments = [];
                        this.value_show = [];
                        this.$nextTick(() => {
                            this.$refs.treeData.setCheckedKeys(this.value_show);
                        });
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
