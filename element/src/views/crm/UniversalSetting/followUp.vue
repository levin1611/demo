<template>
    <div>
        <div style="padding: 0 30px;">
            <!-- 新增类型 Button -->
            <div style="margin: 30px 0 12px 0;text-align: right;color: #fb8b2f;">
                <!-- 设置成交阶段 -->
                <span @click="set_stage"
                      class="set_succ_stage">{{ $t('crm.UniSet.setsuccStage') }}</span>
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
                                 :label="$t('crm.UniSet.followUp')"
                                 :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <div>
                                <span>{{ scope.row.attrName }}</span>
                                <!-- 默认值标签 -->
                                <Icon v-if="`${scope.row.transactionStatus}` === '1'"
                                      custom="custom-transaction"
                                      size="12"
                                      color="#FA8241"
                                      style="cursor: pointer; margin-left: 5px;"></Icon>
                            </div>
                        </template>
                    </TableColumn>
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
                                      @click.native="change_available(scope.row, 1)"
                                      style="cursor: pointer;margin-right: 20px;"></Icon>
                            </template>
                            <template v-else>
                                <template v-if="related_followUp_status_ids.includes(`${scope.row.attrId}`)">
                                    <span style="margin-right: 20px;">
                                        <img :src="`${publicPath}image/isFromGoogle.png`"
                                             alt="google"
                                             style="width: 14px;vertical-align: middle;">
                                    </span>
                                </template>
                                <template v-if="scope.row.ifCommon !== 1">
                                    <!-- 编辑 -->
                                    <Icon custom="custom-field-edit"
                                          :size="12"
                                          @click.native="edit(scope.row.attrName, scope.row.attrId)"
                                          style="cursor: pointer;margin-right: 20px;"></Icon>
                                    <!-- 删除 -->
                                    <Tooltip content="删除" effect="dark" placement="bottom">
                                        <Icon custom="custom-field-delete"
                                            :size="12"
                                            @click.native="change_available(scope.row, 2)"
                                            style="cursor: pointer;margin-right: 20px;"></Icon>
                                    </Tooltip>
                                    <!-- 拖拽排序 -->
                                    <Icon custom="custom-drag-and-drop"
                                          :size="12"
                                          style="cursor: pointer;"></Icon>
                                </template>
                            </template>
                        </div>
                    </TableColumn>
                </Table>
            </div>
        </div>

        <!-- 新增类型 Modal -->
        <Modal :visible.sync="visible"
               :title="$t('crm.UniSet.followUp')"
               :append-to-body="true"
               width="488px"
               class="modal uniSet-modal">
            <p style="text-align: right;">
                <span style="float: left;line-height: 32px;">{{ type_operate }}:</span>
                <Input v-model="currentName"
                       style="width: 380px;"></Input>
            </p>

            <template v-if="type_operate === $t('crm.UniSet.edit')">
                <br>
                <p style="text-align: center;">
                    <span style="color: #f00;">{{ $t('crm.UniSet.notice') }}:</span> {{ $t('crm.UniSet.tip_editFollowUpStatus') }}
                </p>
            </template>

            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.UniSet.modal_cancel') }}</Button>
                <Button type="primary"
                        @click="ok">{{ $t('crm.UniSet.modal_ok') }}</Button>
            </div>
        </Modal>

        <!-- 设置成交阶段 -->
        <Modal :visible.sync="isShow"
               :title="$t('crm.UniSet.setsuccStage')"
               :append-to-body="true"
               width="520px">
            <div>
                <span class="select_stage">{{ $t('crm.UniSet.choosesuccStage') }}</span>
                <!-- <Input type="checkbox" style="width: 300px;margin-top:2px;"></Input> -->
                <Select v-model="stageInfo"
                        class="select_succ_stage"
                        size="small">
                    <Option v-for="item in option_nodelete"
                            :key="item.attrId"
                            :value="item.attrId"
                            :label="item.attrName"></Option>
                </Select>
            </div>

            <br>

            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.UniSet.modal_cancel') }}</Button>
                <Button type="primary"
                        @click="submit"
                        class="set_stage_succ">{{ $t('crm.UniSet.modal_ok') }}</Button>
                <div style="color: #fc8c30;font-size: 12px;margin-top: 20px;text-align: left;">成交阶段在原基础上后推或提前可能会导致自动落入公海询盘数量的增加或减少（如您未启用自动流入公海规则，请忽略此提示）</div>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import Sortable from 'sortablejs';

    export default {
        name: 'followUp',
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                associated_followUpStatus_list: state => state.app.associated_followUpStatus_list
            }),
            related_followUp_status_ids() {
                if (this.associated_followUpStatus_list && this.associated_followUpStatus_list.length) {
                    return this.associated_followUpStatus_list.map(item => `${item.followupId}`);
                }
                return [];
            }
        },
        data() {
            return {
                publicPath: process.env.BASE_URL,

                typeId: 7,
                currentId: '',
                currentName: '',
                type_operate: '',


                /* 表格 */
                loading: true, // 加载图标
                list_options: [], // 表格数据
                sortInstance: null, // 排序实例
                boundEnd: 0, // 可排序区域的底部边界, 大于 index 的表格行固定, 不参与排序

                /* 模态框 */
                visible: false,
                isShow: false,
                option_nodelete: '',
                stageInfo: ''
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
                        option_using.unshift({
                            attrName: this.$t('crm.UniSet.defaultFollowUpStatus_inquiry')
                        });
                        option_using.push({
                            attrName: this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry')
                        });
                        this.boundEnd = option_using.length;
                        this.list_options = option_using.concat(option_fixed);
                        this.option_nodelete = temp.filter(item => item.isAvailable === 1).sort((a, b) => a.sort - b.sort);

                        // 同步更改选项到线索模板和多语言
                        temp = this.list_options.filter(item => item.isAvailable === 1).map(item => item.attrName);
                        // this.$emit('updateFormOption', temp, this.typeId);
                    } else {
                        this.list_options = [];
                        this.boundEnd = 0;
                        this.$Message.error(this.$t('crm.UniSet.error_getFollowUpStatusList'));
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
                    if (e.newIndex === 0) {
                        // 不能移动到顶部 "询盘" 之上
                        this.sortInstance.sort(sortedArr);
                        this.$Message.info(this.$t('crm.UniSet.tip_unSortOption'));
                    } else if (e.newIndex >= this.boundEnd - 1) {
                        // 不能移动到底部 "关闭询盘"和"已停用跟进状态" 之下
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

                            const strId = temp.map(item => item.attrId).filter((item, index) => index < this.boundEnd).filter(item => !(!item || item === '')).join(',');
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
            /* 设置成交阶段 */
            set_stage() {
                this.isShow = true;
                this.stageInfo = '';
            },
            submit() {
                if (this.stageInfo == '') {
                    this.$Message.error(this.$t('followupReply.contentEmptyWarning'));
                    return false;
                }
                const postData = {
                    orgId: this.enterpriseId,
                    attrId: this.stageInfo
                };
                util.ajax({
                    url: '/crm/attr/updateTransactionStatus',
                    method: 'post',
                    data: postData
                }).then(response => {
                    if (response.data.code === '1') {
                        this.refreshData();
                        this.isShow = false;
                        this.$Message.success(this.$t('crm.UniSet.success_set_closingStage'));
                        const temp = this.list_options.filter(item => item.isAvailable === 1).map(item => item.attrName);
                        this.$emit('updateFormOption', temp, this.typeId);
                    } else if (response.data.code === '3') {
                        this.$Message.info('您操作有些频繁，等等再试');
                    } else {
                        this.$Message.error(this.$t('crm.UniSet.error_set_closingStage'));
                    }
                });
            },
            cancel() {
                this.visible = false;
                this.isShow = false;
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
            dealChangeAvailable(data, val) {
                const id = data.attrId;
                if (this.related_followUp_status_ids.includes(`${id}`) && (val === 0)) {
                    this.$Message.info(this.$t('crm.UniSet.info_deleteBeforeUnbind'));
                } else {
                    util.ajax({
                        url: '/crm/attr/updateIsAvailable',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            attrId: id,
                            isAvailable: val
                        }
                    }).then(async response => {
                        if (response.data.code === '1') {
                            if (val === 2) {
                                this.$Message.success(this.$t('crm.UniSet.success_delete'));
                            } else {
                                this.$Message.success(this.$t('crm.UniSet.success_editStatus'));
                            }
                            if (val === 1) {
                                await (async () => {
                                    this.loading = true;

                                    const temp = this.list_options.slice();

                                    const strId = temp.filter((item, index) => index < this.boundEnd).concat([data]).sort((a, b) => a.sort - b.sort).map(item => item.attrId).filter(item => !(!item || item === '')).join(',');
                                    await util.ajax({
                                        url: '/crm/attr/updateSortNo',
                                        method: 'post',
                                        data: {
                                            orgId: this.enterpriseId,
                                            typeId: this.typeId,
                                            ids: strId
                                        }
                                    });
                                })();
                            }
                            this.refreshData();
                            // 同步更改选项到线索模板和多语言
                            const temp = this.list_options.filter(item => item.isAvailable === 1).map(item => item.attrName);
                            this.$emit('updateFormOption', temp, this.typeId);
                        } else {
                            this.$Message.error(this.$t('crm.UniSet.error_editStatus'));
                        }
                    });
                }
            },
            change_available(data, val) {
                if (val === 2) {
                    // 未做英文处理
                    this.$confirm('删除后，该状态下询盘将自动回退到“询盘”状态，确认要删除吗?', '删除确认', {
                        confirmButtonText: this.$t('confirm'),
                        cancelButtonText: this.$t('cancel'),
                        cancelButtonClass: 'button_font_size',
                        confirmButtonClass: 'button_font_size'
                    }).then(async (res) => {
                        this.dealChangeAvailable(data, val);
                    }).catch(({ data }) => {
                        this.$Message.warning(data.message || 'fail');
                    });
                } else {
                    this.dealChangeAvailable(data, val);
                }
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

            // 获取最新的跟进状态关联的 google 转化
            this.$store.commit('get_associated_followUpStatus_list', this.enterpriseId);

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
    .set_succ_stage{
        font-size: 12px;
        margin-right: 20px;
        color: #3B78DE;
        cursor: pointer;

        &:hover{
            text-decoration:underline;
            color: #3B78DE;
        }
    }

    .select_stage{
        color: #000;
        margin-left: 40px;
    }

    .select_succ_stage{
        width:200px;
        margin-left: 30px;
    }
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
