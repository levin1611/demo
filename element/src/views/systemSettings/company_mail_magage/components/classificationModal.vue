<template>
    <div>
        <Modal
            :visible.sync="visible"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            width="800px"
            @close="handleSaveDraftCancel"
            class="classification_set_modal"
            :title="$t('mailSetting.emailTemplate.classificationSet')">
            <div class="content">
                <template v-if="tableData.length || addStatus">
                    <div class="classification-list">
                        <div class="classification-move"></div>
                        <div class="classification-name">{{$t('mailSetting.emailTemplate.categoryName')}}</div>
                        <div class="classification-handle">{{$t('mailSetting.addressBook.operate')}}</div>
                    </div>
                    <div class="classification-list" v-if="addStatus">
                        <div class="classification-move"></div>
                        <div class="classification-name">
                            <ElInputExtend v-model="classificationName"
                                class="category_table_input"
                                :placeholder="$t('mailSetting.emailTemplate.categoryPlaceholder')"
                                maxlength="20"
                                show-word-limit>
                            </ElInputExtend>
                        </div>
                        <div class="classification-handle">
                            <!-- 保存 -->
                            <Icon class="cursor-pointer" custom="custom-confirm"
                                color="#4285F4"
                                @click.stop="handleAdd_confirm()"></Icon>

                            <!-- 取消 -->
                            <Icon class="cursor-pointer" custom="custom-follow-edit-area-close"
                                @click.stop="handleAdd_cancel()"></Icon>
                        </div>
                    </div>
                    <div class="classification-list-box" ref="sortable">
                        <div class="classification-list" v-for="(item, index) in tableData" :key="item.id">
                            <div class="classification-move">
                                <Icon custom="custom custom-icon_move" class="priority_icon" style="cursor:move;color: rgba(0, 0, 0, 0.28);margin-right: 6px;"></Icon>
                            </div>
                            <div class="classification-name">
                                <template v-if="item.editing">
                                    <ElInputExtend v-model="item.classificationName"
                                        class="category_table_input"
                                        :placeholder="$t('mailSetting.emailTemplate.categoryPlaceholder')"
                                        maxlength="20"
                                        show-word-limit>
                                    </ElInputExtend>
                                </template>
                                <!-- 非编辑状态 -->
                                <template v-else>
                                    <!-- 正常显示文字 -->
                                    <p class="category-table-text">{{ item.classificationName }}</p>
                                </template>
                            </div>
                            <div class="classification-handle">
                                <!-- 编辑状态 -->
                                <template v-if="item.editing">
                                    <!-- 保存 -->
                                    <Icon class="cursor-pointer" custom="custom-confirm"
                                        @click.stop="handleAdd_confirm(item,index)"></Icon>

                                    <!-- 取消 -->
                                    <Icon class="cursor-pointer" custom="custom-follow-edit-area-close"
                                        @click.stop="handleAdd_cancel(item,index)"></Icon>
                                </template>

                                <!-- 非编辑状态 -->
                                <template v-else>
                                    <!-- 编辑 -->
                                    <Icon class="cursor-pointer" custom="custom-field-edit"
                                        @click.stop="handleEdit(item)"></Icon>

                                    <!-- 删除 -->
                                    <Icon class="cursor-pointer" custom="custom-field-delete"
                                        @click.stop="handleDelete(item)"></Icon>
                                </template>
                            </div>
                        </div>
                    </div>
                </template>

                <div class="no_data" v-else>
                    <img src="@/svg/no-data.svg" alt="">
                    <p>{{$t('mailSetting.emailTemplate.addCategoryTip')}} <span @click="handleAddClassification">{{$t('mailSetting.emailTemplate.addCategory')}}</span></p>
                </div>
            </div>
            <div slot="footer" class="footer" :style="`${!tableData.length ? 'justify-content: flex-end;' : ''}`">
                <Tooltip :disabled="tableData.length < 100" placement="top-start" :content="tableData.length >=100 ? $t('mailSetting.emailTemplate.categoryNumTip') : ''">
                    <Button type="text" @click="handleAddClassification" :disabled="tableData.length>=100 || addStatus || editStatus" class="new_btn" v-show="tableData.length">
                        <Icon custom="custom-kuaisuchuangjian" color="#3B78DE" style="margin-right: 8px"></Icon>{{ $t('mailSetting.emailTemplate.addCategory') }}
                    </Button>
                </Tooltip>
                <Button @click="handleSaveDraftCancel">{{ $t('close') }}</Button>
            </div>
        </Modal>
        <!-- 删除分类 -->
        <Modal
            :visible.sync="classificationVisible"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            width="487px"
            @close="classificationClose"
            class="copy_template_modal"
            :title="$t('mailSetting.emailTemplate.delTemplate')">
            <p>{{ $t('mailSetting.emailTemplate.deleteCategoryTip') }}</p>
            <div slot="footer" class="footer">
                <Button @click="() => classificationVisible = false">{{ $t('close') }}</Button>
                <Button type="primary" @click="delClassificationBtn">{{ $t('mailSetting.emailTemplate.confirm') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import Sortable from 'sortablejs';
    import { updateOrder, deleteById, addOrupdate } from '@/api/mail/mailSet.js';
    export default {
        name: 'classificationModal',
        props: ['visible', 'tableData', 'type'],
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                fullName: 'fullName',
                window_height: 'window_height'
            })
        },
        data() {
            return {
                sortInstance: null,
                delItem: {},
                addStatus: false,
                editStatus: false,
                classificationVisible: false,
                classificationName: ''
            };
        },
        methods: {
            // 新增
            handleAddClassification() {
                if (this.addStatus) return;
                this.addStatus = true;
            },
            // 新增分类
            handleAdd_confirm(row, index) {
                let dataJson = {};
                if (row) {
                    if (!row.classificationName.trim() || !row.classificationName.length) {
                        this.$Message.error(this.$t('mailSetting.emailTemplate.errorTip1'));
                        return;
                    }
                    dataJson = {
                        orgId: this.enterpriseId,
                        createUserId: row.createUserId,
                        classificationName: row.classificationName,
                        type: this.type,
                        id: row.id,
                        updateUserId: this.userId,
                        updateUserName: this.fullName
                    };
                } else {
                    if (!this.classificationName.trim() || !this.classificationName.length) {
                        this.$Message.error(this.$t('mailSetting.emailTemplate.errorTip1'));
                        return;
                    }
                    dataJson = {
                        orgId: this.enterpriseId,
                        createUserId: this.userId,
                        classificationName: this.classificationName,
                        createUserName: this.fullName,
                        type: this.type
                    };
                }
                addOrupdate(dataJson).then(res => {
                    if (res.code === 1) {
                        this.$Message.success(this.$t('bind.success_save'));
                        if (row) {
                            this.editStatus = false;
                            this.$set(this.tableData[index], 'editing', false);
                            this.refreshData();
                        } else {
                            this.addStatus = false;
                            this.classificationName = '';
                            this.refreshData();
                        }
                    } else {
                        if (res.message === '分类名称不能重复') {
                            this.$Message.error(this.$t('mailSetting.emailTemplate.errorTip2'));
                        } else {
                            this.$Message.error(this.$t('bind.error_save'));
                        }
                    }
                }, () => {
                    this.$Message.error(this.$t('bind.error_save'));
                });
            },
            // 取消
            handleAdd_cancel(row, index) {
                if (row) {
                    this.editStatus = false;
                    this.$set(this.tableData[index], 'editing', false);
                    this.refreshData();
                } else {
                    this.addStatus = false;
                    this.classificationName = '';
                }
            },
            handleSaveDraftCancel() {
                this.$emit('update:visible', false);
            },
            // 编辑
            handleEdit(row) {
                if (this.addStatus || this.editStatus) return;
                this.editStatus = true;
                row.editing = true;
            },
            // 删除
            handleDelete(row) {
                this.classificationVisible = true;
                this.delItem = row;
            },
            // 删除模板分类
            delClassificationBtn() {
                deleteById({
                    updateUserId: this.userId,
                    updateUserName: this.fullName,
                    id: this.delItem.id
                }).then(res => {
                    if (res.code === 1) {
                        this.refreshData(`${this.delItem.id}`);
                        this.classificationVisible = false;
                        this.$Message.success(this.$t('mail.deleteSuccTip'));
                    } else {
                        this.$Message.success(this.$t('mail.deleteErrorTip'));
                    }
                }, () => {
                    this.$Message.success(this.$t('mail.deleteErrorTip'));
                });
            },
            classificationClose() {
                this.classificationVisible = false;
            },
            // 排序
            endFunc(e) {
                if (e.newIndex !== e.oldIndex) {
                    // 记录滚动条位置
                    // const scrollTop = this.$refs.table.bodyWrapper.scrollTop;
                    // 获取原有顺序
                    const sortedArr = this.sortInstance.toArray();
                    sortedArr.splice(e.oldIndex, 0, ...sortedArr.splice(e.newIndex, 1));

                    // 保证 list_options 顺序和页面显示的选项顺序一致
                    this.tableData.splice(e.newIndex, 0, ...this.tableData.splice(e.oldIndex, 1));
                    // iview 3.4.2 升级到 viewUI 4.0.2 后, 上一句代码会导致排序成功但选项显示顺序错误
                    // 未找到原因, 这里先将选项置空再恢复, 能解决该 BUG
                    const temp = this.$deepClone(this.tableData);
                    // this.tableData = [];
                    this.$nextTick(() => {
                        this.tableData = temp;
                        const strId = temp.map(item => item.id);
                        updateOrder({
                            ids: strId,
                            updateUserId: this.userId,
                            updateUserName: this.fullName,
                            type: this.type,
                            orgId: this.enterpriseId
                        }).then(response => {
                            if (response.code === 1) {
                                this.$Message.success(this.$t('mailSetting.emailTemplate.categorySortSuccess'));
                                this.refreshData('sort');
                                // // 滚动条位置 保持上一次记录
                                // this.$refs.table.bodyWrapper.scrollTop = scrollTop;
                            } else {
                                // 同样由于新版本, 此处不需要 this.sortInstance.sort(sortedArr), 加了会出错
                                this.tableData.splice(e.oldIndex, 0, ...this.tableData.splice(e.newIndex, 1));
                                this.$Message.error(this.$t('mailSetting.emailTemplate.categorySortFail'));
                            }
                        }).catch(() => {
                            this.tableData.splice(e.oldIndex, 0, ...this.tableData.splice(e.newIndex, 1));
                            this.$Message.error(this.$t('mailSetting.emailTemplate.categorySortFail'));
                        });
                    });
                }
            },
            refreshData(id = null) {
                this.$emit('refreshData', id);
            }
            /* --- 新建模板分类 end --------------------------------------------- */
        },
        mounted() {},
        beforeDestroy() {
            if (this.sortInstance) {
                this.sortInstance.destroy();
            }
        },
        watch: {
            visible: {
                handler(val) {
                    if (val && this.tableData.length) {
                        this.$nextTick(() => {
                            if (this.sortInstance) {
                                this.sortInstance.destroy();
                            }
                            this.$nextTick(() => {
                                this.sortInstance = Sortable.create(this.$refs.sortable, {
                                    animation: 150,
                                    handle: '.priority_icon',
                                    onEnd: this.endFunc
                                });
                            });
                        });
                    } else {
                        this.addStatus = false;
                        this.classificationName = '';
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style scoped lang="less">
    @import url(../less/new_template.less);
    .classification-list-box {
        height: 450px;
        overflow-y: auto;
        .priority_icon {
            visibility: hidden;
        }
        .classification-list:hover {
            background: #F5F7FA;
            .priority_icon {
                visibility: visible;
            }
        }
    }
    .classification-list {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        text-align: left;
        border-bottom: #E1E7EE solid 1px;
        color: rgba(0, 0, 0, 0.80);
        font-size: 14px;
        div {
            padding: 5px 10px 5px 0;
        }
        .classification-move {
            width: 20px;
        }
        .classification-name{
            width: 520px;
            .category-table-text {
                line-height: 1;
                padding: 11px 0;
            }
        }
        .category_table_input {
            padding: 5px 0;
            margin-right: 10px;
        }
        .custom-confirm {
            margin-right: 20px;
            color: rgb(66, 133, 244);
        }
        .custom-field-edit {
            margin-right: 20px;
        }
    }
</style>
