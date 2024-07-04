<template>
    <div>
        <div style="padding: 0 30px;">
            <!-- 新增类型 Button -->
            <div style="margin: 30px 0 12px 0;text-align: right;color: #fb8b2f;">
                <Button type="text"
                        icon="custom custom-add"
                        @click="add_option"
                        style="color: #FFF;background-color: #FA8241;height: 38px;font-size: 14px;line-height: 20px;padding: 5px 20px 6px;">{{ $t('crm.UniSet.new') }}</Button>
            </div>

            <!-- 表格页 -->
            <div class="table">
                <Table :data="list_options"
                       v-loading="loading"
                       :row-class-name="rowClassName"
                       :span-method="arraySpanMethod"
                       highlight-row
                       ref="table"
                       class="tabmain noBoxShadow-right noborder-table">
                    <!-- 选项名 -->
                    <TableColumn prop="attrName"
                                 :label="$t('crm.UniSet.grouping')"
                                 :show-overflow-tooltip="true"></TableColumn>
                    <!-- 操作 -->
                    <TableColumn :label="$t('crm.Table.operate')">
                        <div slot-scope="scope">
                            <template v-if="!scope.row.hasOwnProperty('attrId')">
                                <!-- 不可改动 -->
                                <span>{{ $t('crm.UniSet.UnChangeable') }}</span>
                            </template>
                            <template v-else-if="scope.row.isAvailable !== 1">
                                <!-- 恢复 -->
                                <Icon type="ios-undo"
                                      :size="12"
                                      color="#5f768f"
                                      @click.native="change_available(scope.row.attrId, 1, scope.row.ifCommon)"
                                      style="cursor: pointer;margin-right: 20px;"></Icon>
                            </template>
                            <template v-else-if="scope.row.ifCommon !== 1">
                                <!-- 编辑 -->
                                <Icon custom="custom-field-edit"
                                      :size="12"
                                      @click.native="edit(scope.row.attrName, scope.row.attrId)"
                                      style="cursor: pointer;margin-right: 20px;"></Icon>
                                <!-- 弃用 -->
                                <Tooltip content="弃用" effect="dark" placement="bottom">
                                    <Icon type="ios-undo"
                                        :size="12"
                                        color="#5f768f"
                                        @click.native="change_available(scope.row.attrId, 0, scope.row.ifCommon)"
                                        style="cursor: pointer;margin-right: 20px;transform:rotateY(180deg);"></Icon>
                                </Tooltip>
                                <!-- 删除 -->
                                <Tooltip content="删除" effect="dark" placement="bottom">
                                    <Icon custom="custom-field-delete"
                                        :size="12"
                                        @click.native="change_available(scope.row.attrId, 2, scope.row.ifCommon)"
                                        style="cursor: pointer;margin-right: 20px;"></Icon>
                                </Tooltip>
                                <!-- 拖拽排序 -->
                                <Icon custom="custom-drag-and-drop"
                                      :size="12"
                                      style="cursor: pointer;"></Icon>
                            </template>
                            <template v-else>
                                <!-- 弃用 -->
                                <Tooltip content="弃用" effect="dark" placement="bottom">
                                    <Icon type="ios-undo"
                                        :size="12"
                                        color="#5f768f"
                                        @click.native="change_available(scope.row.attrId, 0, scope.row.ifCommon)"
                                        style="cursor: pointer;margin-right: 20px;transform:rotateY(180deg);"></Icon>
                                </Tooltip>
                            </template>
                        </div>
                    </TableColumn>
                </Table>
            </div>
        </div>

        <!-- 新增类型 Modal -->
        <Modal :visible.sync="visible"
               :title="$t('crm.UniSet.grouping')"
               :append-to-body="true"
               width="488px"
               class="modal uniSet-modal">
            <p style="text-align: right;">
                <span style="float: left;line-height: 32px;">{{ type_operate }}:</span>
                <Input v-model="currentName"
                       style="width: 380px;"></Input>
            </p>
            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.UniSet.modal_cancel') }}</Button>
                <Button type="primary"
                        @click="ok">{{ $t('crm.UniSet.modal_ok') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import Sortable from 'sortablejs';

    export default {
        name: 'grouping',
        computed: {
            ...mapState([
                'enterpriseId',
                'userId'
            ])
        },
        data() {
            return {
                typeId: 5,
                currentId: '',
                currentName: '',
                type_operate: '',


                /* 表格 */
                loading: true, // 加载图标
                list_options: [], // 表格数据
                sortInstance: null, // 排序实例
                boundEnd: 0, // 可排序区域的底部边界, 大于 index 的表格行固定, 不参与排序

                /* 模态框 */
                visible: false
            };
        },
        methods: {
            /* 全局 */
            // 表格行 class
            rowClassName({ row }) {
                return row.isAvailable === 1 ? 'sortable' : row.attrId === '-1' ? 'unSortable unSortableTitle' : 'unSortable';
            },
            // 刷新表格页
            refreshData() {
                this.loading = true;
                util.ajax({
                    url: '/crm/attr/getList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        typeId: this.typeId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const option_fixed = response.data.data.filter(item => item.ifCommon === 1).sort((a, b) => a.sort - b.sort);
                        let temp = response.data.data.filter(item => item.ifCommon !== 1);
                        const option_using = temp.filter(item => item.isAvailable === 1).sort((a, b) => a.sort - b.sort);
                        const option_disabled = temp.filter(item => item.isAvailable !== 1);
                        this.boundEnd = option_using.length;
                        const option_fixed_aa = option_fixed.filter((item) => item.isAvailable === 1);
                        const option_fixed_bb = option_fixed.filter((item) => item.isAvailable !== 1);
                        (option_fixed_bb.length || option_disabled.length) && option_fixed_bb.unshift({
                            attrName: '弃用选项',
                            attrId: '-1'
                        });
                        this.list_options = option_using.concat(option_fixed_aa, option_fixed_bb, option_disabled);

                        // 同步更改选项到线索模板和多语言
                        temp = this.list_options.filter(item => item.isAvailable === 1).map(item => item.attrName);
                        this.$emit('updateFormOption', temp, this.typeId);
                    } else {
                        this.list_options = [];
                        this.boundEnd = 0;
                        this.$Message.error(this.$t('crm.UniSet.error_getOptionList'));
                    }
                    this.loading = false;
                });
            },
            // 排序
            endFunc(e) {
                if (e.newIndex !== e.oldIndex) {
                    // 获取原有顺序
                    const sortedArr = this.sortInstance.toArray();
                    sortedArr.splice(e.oldIndex, 0, ...sortedArr.splice(e.newIndex, 1));
                    if (e.newIndex >= this.boundEnd) {
                        // 不能移动到底部 "已停用选项" 之下
                        this.sortInstance.sort(sortedArr);
                        this.$Message.info(this.$t('crm.UniSet.tip_unSortOption'));
                    } else {
                        this.loading = true;

                        // 保证 list_options 顺序和页面显示的选项顺序一致
                        this.list_options.splice(e.newIndex, 0, ...this.list_options.splice(e.oldIndex, 1));
                        // iview 3.4.2 升级到 viewUI 4.0.2 后, 上一句代码会导致排序成功但选项显示顺序错误
                        // 未找到原因, 这里先将选项置空再恢复, 能解决该 BUG
                        const temp = this.$deepClone(this.list_options);
                        this.list_options = [];
                        this.$nextTick(() => {
                            this.list_options = temp;

                            const strId = temp.map(item => item.attrId).filter((item, index) => index < this.boundEnd).join(',');
                            util.ajax({
                                url: '/crm/attr/updateSortNo',
                                method: 'post',
                                data: {
                                    orgId: this.enterpriseId,
                                    typeId: this.typeId,
                                    ids: strId
                                }
                            }).then(response => {
                                if (response.data.code !== '1') {
                                    // 同样由于新版本, 此处不需要 this.sortInstance.sort(sortedArr), 加了会出错
                                    this.list_options.splice(e.oldIndex, 0, ...this.list_options.splice(e.newIndex, 1));
                                    this.$Message.error(this.$t('crm.UniSet.error_sortOption'));
                                } else {
                                    const temp = this.list_options.filter(item => item.isAvailable === 1).map(item => item.attrName);
                                    this.$emit('updateFormOption', temp, this.typeId);
                                }
                                this.loading = false;
                            }).catch(error => {
                                this.list_options.splice(e.oldIndex, 0, ...this.list_options.splice(e.newIndex, 1));
                                this.$Message.error(this.$t('crm.UniSet.error_sortOption'));
                                this.loading = false;
                            });
                        });
                    }
                }
            },

            /* 新增列表项 */
            add_option() {
                this.visible = true;
                this.currentName = '';
                this.currentId = '';
                this.type_operate = this.$t('crm.UniSet.new');
            },

            /* 模态框 */
            ok() {
                // 选项内容不能为空
                if (!this.currentName.trim()) {
                    this.$Message.error(this.$t('followupReply.contentEmptyWarning'));
                    return false;
                }

                // 选项不能重复
                if (this.list_options.find(item => item.attrName === this.currentName && item.attrId !== this.currentId)) {
                    this.$Message.error(this.$t('crm.UniSet.error_contentRepeat'));
                    return false;
                }

                let postData, str;
                if (this.currentId === '') {
                    postData = {
                        orgId: this.enterpriseId,
                        typeId: this.typeId,
                        attrName: this.currentName
                    };
                    str = 'add';
                } else {
                    postData = {
                        orgId: this.enterpriseId,
                        typeId: this.typeId,
                        attrName: this.currentName,
                        attrId: this.currentId
                    };
                    str = 'edit';
                }

                util.ajax({
                    url: '/crm/attr/save',
                    method: 'post',
                    data: postData
                }).then(response => {
                    if (response.data.code === '1') {
                        // 同步更改选项到线索模板和多语言
                        const temp_options = this.list_options.filter(item => item.isAvailable === 1);
                        const temp = temp_options.map(item => item.attrName);
                        if (postData.attrId) {
                            temp.splice(temp_options.findIndex(item => item.attrId === postData.attrId), 1, postData.attrName);
                        } else {
                            const sortIndex = temp_options.findIndex(item => item.sort > 0);
                            if (sortIndex === -1) {
                                temp.push(postData.attrName);
                            } else {
                                temp.splice(sortIndex, 0, postData.attrName);
                            }
                        }
                        this.$emit('updateFormOption', temp, this.typeId);

                        this.visible = false;
                        this.$Message.success(this.$t(`crm.UniSet.success_${str}`));
                        this.refreshData();
                    } else {
                        this.$Message.error(this.$t(`crm.UniSet.error_${str}`));
                    }
                });
            },
            cancel() {
                this.visible = false;
            },

            /* 操作列表项 */
            deleteAttr(attrId) {
                const postData = {
                    orgId: this.enterpriseId,
                    typeId: this.typeId,
                    id: attrId
                };

                util.ajax({
                    url: '/crm/attr/delete',
                    method: 'post',
                    data: postData
                }).then(response => {
                    if (response.data.code === '1') {
                        // 同步更改选项到线索模板和多语言
                        const temp = this.list_options.filter(item => item.isAvailable === 1 && item.attrId !== postData.id).map(item => item.attrName);
                        this.$emit('updateFormOption', temp, this.typeId);

                        this.$Message.success(this.$t('crm.UniSet.success_delete'));
                        this.refreshData();
                    } else {
                        this.$Message.error(this.$t('crm.UniSet.error_delete'));
                    }
                });
            },
            edit(name, id) {
                this.visible = true;
                this.type_operate = this.$t('crm.UniSet.edit');
                this.currentName = name;
                this.currentId = id;
            },
            // 删除或复用
            change_available(id, val, ifCommon) {
                if (val === 2) {
                    this.$confirm('删除后,将无法筛选该选项的旧数据,确认要删除吗？', '删除确认', {
                        confirmButtonText: this.$t('confirm'),
                        cancelButtonText: this.$t('cancel'),
                        cancelButtonClass: 'button_font_size',
                        confirmButtonClass: 'button_font_size'
                    }).then(async (res) => {
                        this.change_available_fn(id, val, ifCommon);
                    });
                } else {
                    this.change_available_fn(id, val, ifCommon);
                }
            },
            change_available_fn(id, val, ifCommon) {
                util.ajax({
                    url: '/crm/attr/updateIsAvailable',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        attrId: id,
                        isAvailable: val,
                        userId: this.userId,
                        ifCommon
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        // 刷新列表
                        this.refreshData();
                        if (val === 2) {
                            this.$Message.success(this.$t('crm.UniSet.success_delete'));
                        } else {
                            this.$Message.success(this.$t('crm.UniSet.success_editStatus'));
                        }
                    } else {
                        this.$Message.error(this.$t('crm.UniSet.error_editStatus'));
                    }
                });
            },
            arraySpanMethod({ row, column, rowIndex, columnIndex }) {
                if (row.attrId === '-1') {
                    if (columnIndex === 0) {
                        return [1, 2];
                    } else if (columnIndex === 1) {
                        return [0, 0];
                    }
                }
            }
        },
        mounted() {
            this.refreshData();

            document.body.ondrop = function(event) {
                event.preventDefault();
                event.stopPropagation();
            };
            const vm = this;

            // 创建可排序列表
            this.sortInstance = Sortable.create(this.$refs.table.$el.querySelector('.el-table__body>tbody'), {
                group: {
                    name: 'list',
                    pull: true
                },
                handle: '.custom-drag-and-drop',
                filter: '.unSortable',
                animation: 120,
                // ghostClass: 'placeholder-style',
                fallbackClass: 'iview-admin-cloned-item',
                onEnd: vm.endFunc
                // onRemove(event) {
                // }
            });
        }
    };
</script>
<style lang="less" scoped>
    .table {
        /deep/.unSortableTitle{
        font-size: 14px;
        color: #333;
        font-weight: 600;
        }
    }
</style>
<style>
    .button_font_size{
        font-size: 14px;
        height: 36px;
    }
</style>
