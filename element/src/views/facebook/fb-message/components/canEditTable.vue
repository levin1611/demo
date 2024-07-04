<style lang="less">
    @import 'editable-table.less';
</style>

<template>
    <div>
        <Table
                :loading="loading"
                highlight-row
                v-on:on-row-click="getCurrentId"
                ref="table"
                :columns="columnsList"
                :height="screenHeight"
                :data="thisTableData"
                :tooltip="tooltip"></Table>
    </div>
</template>

<script>
    const editButton = (vm, h, currentRow, index) => {
        return h('Button', {
            props: {
                type: currentRow.editting ? 'success' : 'primary',
                loading: currentRow.saving
            },
            style: {
                margin: '0 5px'
            },
            on: {
                click: () => {
                    if (!currentRow.editting) {
                        if (currentRow.edittingCell) {
                            for (const name in currentRow.edittingCell) {
                                currentRow.edittingCell[name] = false;
                                vm.edittingStore[index].edittingCell[name] = false;
                            }
                        }
                        vm.edittingStore[index].editting = true;
                        vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
                    } else {
                        vm.edittingStore[index].saving = true;
                        vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
                        const edittingRow = vm.edittingStore[index];
                        edittingRow.editting = false;
                        edittingRow.saving = false;
                        vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
                        vm.$emit('input', vm.handleBackdata(vm.thisTableData));
                        vm.$emit('on-change', vm.handleBackdata(vm.thisTableData), index);
                    }
                }
            }
        }, currentRow.editting ? '保存' : '编辑');
    };
    const deleteButton = (vm, h, currentRow, index) => {
        return h('Poptip', {
            props: {
                confirm: true,
                title: '您确定要删除这条数据吗?',
                transfer: true
            },
            on: {
                'on-ok': () => {
                    vm.thisTableData.splice(index, 1);
                    vm.$emit('input', vm.handleBackdata(vm.thisTableData));
                    vm.$emit('on-delete', vm.handleBackdata(vm.thisTableData), index);
                }
            }
        }, [
            h('Button', {
                style: {
                    margin: '0 5px'
                },
                props: {
                    type: 'error',
                    placement: 'top'
                }
            }, '删除')
        ]);
    };
    const incellEditBtn = (vm, h, param) => {
        if (vm.hoverShow) {
            return h('div', {
                class: {
                    'show-edit-btn': vm.hoverShow
                }
            }, [
                h('Button', {
                    props: {
                        type: 'text',
                        icon: 'edit'
                    },
                    on: {
                        click: (event) => {
                            vm.edittingStore[param.index].edittingCell[param.column.key] = true;
                            vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
                            vm.remarkableFlag = false;
                        }
                    }
                })
            ]);
        } else {
            return h('Button', {
                props: {
                    type: 'text',
                    icon: 'edit'
                },
                on: {
                    click: (event) => {
                        vm.edittingStore[param.index].edittingCell[param.column.key] = true;
                        vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
                        vm.remarkableFlag = false;
                    }
                }
            });
        }
    };
    const saveIncellEditBtn = (vm, h, param) => {
        return h('Button', {
            props: {
                type: 'text',
                icon: 'checkmark'
            },
            on: {
                click: (event) => {
                    vm.edittingStore[param.index].edittingCell[param.column.key] = false;
                    vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
                    vm.$emit('input', vm.handleBackdata(vm.thisTableData));
                    vm.$emit('on-cell-change', vm.handleBackdata(vm.thisTableData), param.index, param.column.key);
                    vm.remarkableFlag = vm.remarkable;
                }
            }
        });
    };
    const cellInput = (vm, h, param, item) => {
        return h('Input', {
            props: {
                type: 'text',
                value: vm.edittingStore[param.index][item.key]
            },
            on: {
                'on-change'(event) {
                    const key = item.key;
                    vm.edittingStore[param.index][key] = event.target.value;
                }
            }
        });
    };
    export default {
        name: 'canEditTable',
        props: {
            loading: Boolean,
            refs: String,
            screenHeight: Number,
            columnsList: Array,
            value: Array,
            url: String,
            editIncell: {
                type: Boolean,
                default: false
            },
            hoverShow: {
                type: Boolean,
                default: true
            },
            remarkable: {
                type: Boolean,
                default: false
            },
            tooltip: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                columns: [],
                thisTableData: [],
                edittingStore: [],
                remarkableFlag: true
            };
        },
        created() {
            this.init();
        },
        methods: {
            /* 下载文件 */
            exportData1(name) {
                const columns = this.columnsList.filter((col, index) =>
                    col.title !== '操作');
                this.$refs.table.exportCsv({
                    filename: name,
                    columns: columns.map(item => {
                        item.title = `\t${item.title}`;
                        return item;
                    }),
                    data: this.thisTableData.map(item => {
                        Object.keys(item).forEach(key => item[key] = `\t${item[key]}`);
                        return item;
                    }),
                    quoted: true
                });
            },
            init() {
                const vm = this;
                // 筛选可编辑的列
                const editableCell = this.columnsList.filter(item => {
                    if (item.editable) {
                        if (item.editable === true) {
                            return item;
                        }
                    }
                });
                const cloneData = JSON.parse(JSON.stringify(this.value));

                let res = [];
                res = cloneData.map((item, index) => {
                    let isEditting = false;
                    if (this.thisTableData[index]) {
                        if (this.thisTableData[index].editting) {
                            isEditting = true;
                        } else {
                            for (const cell in this.thisTableData[index].edittingCell) {
                                if (this.thisTableData[index].edittingCell[cell] === true) {
                                    isEditting = true;
                                }
                            }
                        }
                    }
                    if (isEditting) {
                        return this.thisTableData[index];
                    } else {
                        this.$set(item, 'editting', false);
                        const edittingCell = {};
                        editableCell.forEach(item => {
                            edittingCell[item.key] = false;
                        });
                        this.$set(item, 'edittingCell', edittingCell);
                        return item;
                    }
                });
                this.thisTableData = res;
                this.edittingStore = JSON.parse(JSON.stringify(this.thisTableData));
                this.columnsList.forEach(item => {
                    if (item.editable) {
                        item.render = (h, param) => {
                            const currentRow = this.thisTableData[param.index];
                            if (!currentRow.editting) {
                                // modal框
                                if (this.remarkableFlag) {
                                    if (currentRow[item.key] && currentRow[item.key].length > 6) {
                                        console.log('备注很长');
                                        return h('Tooltip', {
                                            class: 'com_name',
                                            props: {
                                                placement: 'bottom-start',
                                                content: currentRow[item.key]
                                            }
                                        }, [h('Row', {
                                            props: {
                                                type: 'flex',
                                                align: 'middle',
                                                justify: 'center'
                                            }
                                        }, [
                                            h('Col', {
                                                style: {
                                                    textOverflow: 'ellipsis',
                                                    whitSpace: 'nowrap'
                                                },

                                                props: {
                                                    span: '21'
                                                }
                                            }, [
                                                h('span', currentRow[item.key] ? `${currentRow[item.key].toString().slice(0, 5)}...` : '')
                                            ]), h('Col', {
                                                props: {
                                                    span: '3'
                                                }
                                            }, [
                                                incellEditBtn(this, h, param, item)
                                            ])])]);
                                    } else {
                                        console.log('备注不长');
                                        return h('Row', {
                                            props: {
                                                type: 'flex',
                                                align: 'middle',
                                                justify: 'center'
                                            }
                                        }, [h('Col', {
                                                style: {
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whitSpace: 'nowrap'
                                                },
                                                props: {
                                                    span: '21'
                                                }
                                            }, [
                                                h('span', currentRow[item.key])
                                            ]),
                                            h('Col', {
                                                props: {
                                                    span: '3'
                                                }
                                            }, [
                                                incellEditBtn(this, h, param, item)
                                            ])
                                        ]);
                                    }
                                } else if (this.editIncell) {
                                    return h('Row', {
                                        props: {
                                            type: 'flex',
                                            align: 'middle',
                                            justify: 'center'
                                        }
                                    }, [
                                        h('Col', {
                                            props: {
                                                span: '22'
                                            }
                                        }, [
                                            !currentRow.edittingCell[param.column.key] ? h('span', currentRow[item.key]) : cellInput(this, h, param, item)
                                        ]),
                                        h('Col', {
                                            props: {
                                                span: '2'
                                            }
                                        }, [
                                            currentRow.edittingCell[param.column.key] ? saveIncellEditBtn(this, h, param) : incellEditBtn(this, h, param)
                                        ])
                                    ]);
                                } else {
                                    return h('span', currentRow[item.key]);
                                }
                            } else {
                                return h('Input', {
                                    props: {
                                        type: 'text',
                                        value: currentRow[item.key]
                                    },
                                    on: {
                                        'on-change'(event) {
                                            const key = param.column.key;
                                            vm.edittingStore[param.index][key] = event.target.value;
                                        }
                                    }
                                });
                            }
                        };
                    }
                    if (item.handle) {
                        item.render = (h, param) => {
                            const currentRowData = this.thisTableData[param.index];
                            const children = [];
                            item.handle.forEach(item => {
                                if (item === 'edit') {
                                    children.push(editButton(this, h, currentRowData, param.index));
                                } else if (item === 'delete') {
                                    children.push(deleteButton(this, h, currentRowData, param.index));
                                }
                            });
                            return h('div', children);
                        };
                    }
                });
            },
            getCurrentId(data, index) {
                this.$emit('getIdFromChild', data.visitorId);
                this.$emit('on-row-click', data, index);
            },
            handleBackdata(data) {
                const clonedData = JSON.parse(JSON.stringify(data));
                clonedData.forEach(item => {
                    delete item.editting;
                    delete item.edittingCell;
                    delete item.saving;
                });
                return clonedData;
            }

        },
        watch: {
            value() {
                this.init();
            },
            columnsList() {
                this.init();
            },
            remarkable() {
                this.remarkableFlag = this.remarkable;
            }
        }
    };
</script>
