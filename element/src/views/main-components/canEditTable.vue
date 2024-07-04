<style lang="less">
    @import 'editable-table.less';
</style>
<template>
    <div>
        <!-- <Button class="download" type="text" icon="arrow-down-c" @click="exportData1()">文件下载</Button> -->
        <Table class="noborder-table"
               :loading="loading"
               :border="isBorder"
               @on-selection-change="getSelection"
               highlight-row
               @row-click="getCurrentId"
               ref="table"
               :height="screenHeight"
               :data="thisTableData"
               :tooltip="tooltip">
            <TableColumn v-for="item in columnsList"
                         :key="item.key"
                         :prop="item.key"
                         :label="item.title"
                         :width="item.width"
                         :min-width="item.width || 64"
                         :formatter="item.formatter"
                         :render-header="item.renderHeader"
                         :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    <template v-if="item.formatter">
                        {{(item.formatter)(scope.row) }}
                    </template>
                    <template v-else>
                        {{ scope.row[item.key] }}
                    </template>
                </template>
            </TableColumn>
        </Table>
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
                'click': (event) => {
                    if (!currentRow.editting) {
                        if (currentRow.edittingCell) {
                            for (let name in currentRow.edittingCell) {
                                currentRow.edittingCell[name] = false;
                                vm.edittingStore[index].edittingCell[name] = false;
                            }
                        }
                        vm.edittingStore[index].editting = true;
                        vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
                    } else {
                        vm.edittingStore[index].saving = true;
                        vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
                        let edittingRow = vm.edittingStore[index];
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
    const incellEditBtn = (vm, h, param, item) => {
        if (vm.hoverShow) {
            return h('div', {
                'class': {
                    'show-edit-btn': vm.hoverShow
                },
                style: {
                    textAlign: 'center'
                }
            }, [
                h('Button', {
                    props: {
                        type: 'text',
                        icon: 'edit'
                    },
                    on: {
                        click: (event) => {
                            event.stopPropagation();
                            vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
                            if (!vm.remarkble) {
                                vm.edittingStore[param.index].edittingCell[param.column.key] = true;
                            }
                            if (vm.remarkble) {
                                //   vm.isShowEditModal = true
                                vm.showEditModal(vm, param, item);
                            }
                        }
                    }
                })
                // [editModal(vm, h, param, item)]
            ]);
        } else {
            return h('Button', {
                props: {
                    type: 'text',
                    icon: 'edit'
                },
                on: {
                    click: (event) => {
                        event.stopPropagation();
                        vm.edittingStore[param.index].edittingCell[param.column.key] = true;
                        vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
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
                    event.stopPropagation();
                    vm.edittingStore[param.index].edittingCell[param.column.key] = false;
                    vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
                    vm.$emit('input', vm.handleBackdata(vm.thisTableData));
                    vm.$emit('on-cell-change', vm.handleBackdata(vm.thisTableData), param.index, param.column.key);
                }
            }
        });
    };
    const cellInput = (vm, h, param, item) => {
        return h('Input', {
            props: {
                type: 'text',
                value: vm.edittingStore[param.index][item.key],
                autofocus: true
            },
            on: {
                'on-change'(event) {
                    event.stopPropagation();
                    let key = item.key;
                    vm.edittingStore[param.index][key] = event.target.value;
                },
                'on-focus'() {
                    vm.isInputFocus = true;
                },
                'on-blur'() {
                    vm.isInputFocus = false;
                }
            }
        });
    };

    // const editModal = (vm, h, param, item) => {
    //     return h('Modal',{
    //         props:{
    //             value:vm.isShowEditModal,
    //             title:'修改备注'
    //         },
    //         on: {
    //            onOk: () => {
    //                 console.log('人生啊，你到底哪里出问题了',vm.edittingStore,vm.thisTableData)
    //                 vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
    //                 // vm.thisTableData = vm.edittingStore;
    //                 console.log('我也不知道呀',vm.edittingStore, vm.thisTableData)
    //                 this.$emit('on-edit-sure',vm.handleBackdata(vm.thisTableData), param.index, param.column.key)
    //             },
    //             onCancel: () => {
    //                 this.$emit('on-edit-cancel')
    //             },
    //         },

    //         // render: (h) => {
    //         //     return h('div', [
    //         //         h('h3',{
    //         //             style:{
    //         //                 padding: '10px 0'
    //         //             }
    //         //         },'修改备注'),
    //         //         h('Textarea', {
    //         //             style: {
    //         //                 width:'260px',
    //         //                 height:'60px',
    //         //             },
    //         //             props: {
    //         //                 autofocus: true,
    //         //                 value: vm.edittingStore[param.index][item.key],
    //         //             },
    //         //             on: {
    //         //                 input: (e) => {
    //         //                 vm.edittingStore[param.index][item.key] = e.target.value;
    //         //                 },
    //         //             }
    //         //         },vm.edittingStore[param.index][item.key])
    //         //     ])
    //         // }
    //     })
    // }
    export default {
        name: 'canEditTable',
        props: {
            tooltip: {
                type: Boolean,
                default: false
            },
            loading: Boolean,
            refs: String,
            columnsList: Array,
            value: Array,
            url: String,
            screenHeight: Number,
            tableWidth: Number,
            editIncell: {
                type: Boolean,
                default: false
            },
            hoverShow: {
                type: Boolean,
                default: true
            },
            isBorder: {
                type: Boolean,
                default: false
            },
            remarkble: {
                type: Boolean,
                default: false
            },
            showLength: {
                default: 1000,
                type: Number
            }
        },
        data() {
            return {
                isInputFocus: false,
                columns: [],
                thisTableData: [],
                edittingStore: [],
                remarkValue: '',
                isShowEditModal: false
            };
        },
        created() {
            this.init();
        },
        methods: {
            getSelection(selection) {
                this.$emit('onSelection', selection);
            },
            // 文件下载
            exportData1(name) {
                let columns = this.columnsList.filter((col, index) =>
                    col.title != '操作');
                console.log(this.thisTableData);
                console.log(columns);
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
                let vm = this;
                // 筛选可编辑的列
                let editableCell = this.columnsList.filter(item => {
                    if (item.editable) {
                        if (item.editable === true) {
                            return item;
                        }
                    }
                });
                // 所有表格数据
                let cloneData = JSON.parse(JSON.stringify(this.value));
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
                        let edittingCell = {};
                        editableCell.forEach(item => {
                            edittingCell[item.key] = false;
                        });
                        this.$set(item, 'edittingCell', edittingCell);
                        return item;
                    }
                });
                console.log('res====> ', cloneData, res);
                if (this.remarkble) {
                    this.thisTableData = cloneData;
                } else {
                    this.thisTableData = res;
                }
                this.edittingStore = JSON.parse(JSON.stringify(this.thisTableData));
                this.columnsList.forEach(item => {
                    if (item.editable) {
                        item.render = (h, param) => {
                            let currentRow = this.thisTableData[param.index];
                            if (!currentRow.editting) {
                                // modal框
                                if (this.remarkble) {
                                    if (currentRow[item.key] && currentRow[item.key].length > 6) {
                                        // currentRow 当前行的信息
                                        return h('Tooltip', {
                                            'class': 'com_name',
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
                                                    // overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whitSpace: 'nowrap'
                                                },
                                                props: {
                                                    span: '21'
                                                }
                                            }, [
                                                h('span', currentRow[item.key] ? `${currentRow[item.key].toString().slice(0, 6)}...` : '')
                                                //    h('span',currentRow[item.key])
                                            ]), h('Col', {
                                                props: {
                                                    span: '3'
                                                }
                                            }, [
                                                incellEditBtn(this, h, param, item)
                                        ])])]);
                                    } else {
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
                                    if (item.short) {
                                        if (currentRow[item.key] && currentRow[item.key].length > 8) {
                                            return h('Tooltip', {
                                                'class': 'com_name',
                                                props: {
                                                    placement: 'bottom-start',
                                                    content: currentRow[item.key]
                                                }
                                            }, [
                                                h('Row', {
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
                                                        !currentRow.edittingCell[param.column.key] ? h('span', `${currentRow[item.key].slice(0, 7)}...`) : cellInput(this, h, param, item)
                                                    ]),
                                                    h('Col', {
                                                        props: {
                                                            span: '2'
                                                        }
                                                    }, [
                                                        currentRow.edittingCell[param.column.key] ? saveIncellEditBtn(this, h, param) : incellEditBtn(this, h, param)
                                                    ])
                                                ])
                                            ]);
                                        } else {
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
                                        }
                                    } else {
                                        if (currentRow[item.key] && currentRow[item.key].length > this.showLength) {
                                            return h('Tooltip', {
                                                'class': 'com_name',
                                                props: {
                                                    placement: 'bottom-start',
                                                    content: currentRow[item.key]
                                                }
                                            }, [
                                                h('Row', {
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
                                                        !currentRow.edittingCell[param.column.key] ? h('span', `${currentRow[item.key].slice(0, this.showLength - 1)}...`) : cellInput(this, h, param, item)
                                                    ]),
                                                    h('Col', {
                                                        props: {
                                                            span: '2'
                                                        }
                                                    }, [
                                                        currentRow.edittingCell[param.column.key] ? saveIncellEditBtn(this, h, param) : incellEditBtn(this, h, param)
                                                    ])
                                                ])
                                            ]);
                                        } else {
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
                                        }
                                    }
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
                                            let key = param.column.key;
                                            vm.edittingStore[param.index][key] = event.target.value;
                                        }
                                    }
                                });
                            }
                        };
                    }
                    if (item.handle) {
                        item.render = (h, param) => {
                            let currentRowData = this.thisTableData[param.index];
                            let children = [];
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
                // 初始化的时候重置scrollTop
                if (this.$refs.table) {
                    //todo here 找element
                    this.$refs.table.$el.querySelector('.el-table__body').scrollTop = 0;
                }
            },
            getCurrentId(data, index) {
                this.$emit('getIdFromChild', {
                    data,
                    index,
                    isInputFocus: this.isInputFocus
                });
            },
            handleBackdata(data) {
                let clonedData = JSON.parse(JSON.stringify(data));
                clonedData.forEach(item => {
                    delete item.editting;
                    delete item.edittingCell;
                    delete item.saving;
                });
                return clonedData;
            },


            // 点击显示模态框
            showEditModal(vm, param, item) {
                const originalRemark = param.row.remark;
                let inputVal;
                console.log('666', vm, param, item, originalRemark);
                vm.$Modal.confirm({
                    class: {
                        'vertical-center-modal': true
                    },
                    // title: '备注',
                    width: '320',
                    height: '100',
                    onOk: () => {
                        vm.edittingStore[param.index][item.key] = inputVal;
                        vm.thisTableData = JSON.parse(JSON.stringify(vm.edittingStore));
                        // vm.thisTableData = vm.edittingStore;
                        console.log('点击显示模态框', vm.edittingStore, vm.thisTableData);
                        this.$emit('on-edit-sure', vm.handleBackdata(vm.thisTableData), param.index, param.column.key);
                    },
                    onCancel: () => {
                        this.$emit('on-edit-cancel', originalRemark, param.index);
                    },
                    render: (h) => {
                        return h('div', [
                            h('h3', {
                                style: {
                                    padding: '10px 0'
                                }
                            }, '备注'),
                            h('Textarea', {
                                style: {
                                    width: '260px',
                                    height: '60px'
                                },
                                props: {
                                    autofocus: true,
                                    value: vm.edittingStore[param.index][item.key]
                                },
                                on: {
                                    input: (e) => {
                                        inputVal = e.target.value;
                                        // vm.edittingStore[param.index][item.key] = e.target.value;
                                    }
                                }
                            }, vm.edittingStore[param.index][item.key])
                        ]);
                    }
                });
            }
        },
        watch: {
            value(data) {
                this.init();
            },
            columnsList() {
                this.init();
            }
        }
    };


</script>
