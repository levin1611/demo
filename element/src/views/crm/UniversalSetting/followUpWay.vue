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
                                 :label="$t('crm.UniSet.followUpMode')"
                                 :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <div>
                                <span>{{ scope.row.attrName }}</span>
                            </div>
                        </template>
                    </TableColumn>
                    <!-- 操作 -->
                    <TableColumn :label="$t('crm.Table.operate')">
                        <div slot-scope="scope">
                            <template v-if="scope.row.isAvailable !== 1">
                                <!-- 恢复 -->
                                <Icon type="ios-undo"
                                      :size="12"
                                      color="#5f768f"
                                      @click.native="change_available(scope.row, 1)"
                                      style="cursor: pointer;margin-right: 20px;"></Icon>
                            </template>
                            <template v-else>
                                <!-- 编辑 -->
                                <Icon custom="custom-field-edit"
                                        :size="12"
                                        @click.native="edit(scope.row)"
                                        style="cursor: pointer;margin-right: 20px;"></Icon>
                                <!-- 弃用 -->
                                <Tooltip content="弃用" effect="dark" placement="bottom"
                                        v-if="scope.row.attrTypeValue !== 0">
                                    <Icon type="ios-undo"
                                        :size="12"
                                        color="#5f768f"
                                        @click.native="change_available(scope.row, 0)"
                                        style="cursor: pointer;margin-right: 20px;transform:rotateY(180deg);"></Icon>
                                </Tooltip>
                                <!-- 删除 -->
                                <Tooltip content="删除" effect="dark" placement="bottom"
                                    v-if="scope.row.attrTypeValue !== 0">
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
                        </div>
                    </TableColumn>
                </Table>
            </div>
        </div>

        <!-- 新增类型 Modal -->
        <Modal :visible.sync="visible"
               :title="$t('crm.UniSet.addFollowUpMode')"
               :append-to-body="true"
               width="530px"
               class="modal followUpMode-modal">

            <Form ref="form" label-position="left" :model="formValidate" label-width="106px">
                <FormItem :label="$t('crm.UniSet.followUpMode')">
                    <Input v-model.trim="formValidate.currentName"
                          :disabled="currentId && attrTypeValue === 0 ? true : false"
                           :placeholder="`${$t('crm.UniSet.pleaseEnter')}${$t('crm.UniSet.keyWords')}`"
                           :show-word-limit="currentId && attrTypeValue === 0 ? false : true"
                           maxlength="20">
                    </Input>
                </FormItem>
                <FormItem :label="$t('crm.UniSet.contentTemplate')" style="margin-bottom: 8px;">
                    <Input v-model="formValidate.attrValue"
                           :placeholder="`${$t('crm.UniSet.pleaseEnter')}${$t('crm.UniSet.contentTemplate')}`"
                           type="textarea"
                           show-word-limit
                           rows="5"
                           maxlength="2000">
                    </Input>
                </FormItem>
                <FormItem label="" style="margin-bottom: 0px;">
                        <Checkbox v-model="formValidate.numberStatus"></Checkbox>
                        <span class="el-checkbox__label">
                        {{$t('crm.UniSet.followUpModeFormLable1')}}
                        <Input v-model="formValidate.number"
                            placeholder="1-2000"
                            style="width:100px; margin: 0 10px"
                            @input="codeInput('number')"
                            @change="codeInput('number')">
                            <!-- @blur="checkInput('number')" -->
                        </Input>
                        {{$t('crm.UniSet.followUpModeFormLable2')}}
                        </span>
                </FormItem>
                <FormItem :label="$t('crm.UniSet.locationPunch')" style="margin-bottom: 0px;">
                        <Checkbox v-model="formValidate.positionPunch">{{$t('crm.UniSet.required')}}</Checkbox>
                </FormItem>
                <FormItem label="" style="margin-bottom: 0px;">
                        <Checkbox v-model="formValidate.siteScopeStatus"></Checkbox>
                        <span class="el-checkbox__label">
                            {{$t('crm.UniSet.followUpModeFormLable3')}}
                            <Input v-model="formValidate.siteScope"
                                placeholder="50-1000"
                                style="width:100px; margin: 0 10px"
                                @input="codeInput('siteScope')"
                                @change="codeInput('siteScope')">
                                <!-- @blur="checkInput('siteScope')" -->
                            </Input>
                            {{$t('crm.UniSet.followUpModeFormLable4')}}
                        </span>
                </FormItem>
                <FormItem :label="$t('crm.UniSet.followUpModeFormLable5')" style="margin-bottom: 0px;">
                        <Checkbox v-model="formValidate.picturesStatus">{{$t('crm.UniSet.required')}}</Checkbox>
                </FormItem>
                <FormItem :label="$t('crm.UniSet.followUpModeFormLable6')" style="margin-bottom: 0px;">
                        <Checkbox v-model="formValidate.attachmentStatus">{{$t('crm.UniSet.required')}}</Checkbox>
                </FormItem>
            </Form>

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
        name: 'followUpWay',
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                associated_followUpStatus_list: state => state.app.associated_followUpStatus_list
            }),
            related_followUp_status_ids() {
                if (this.associated_followUpStatus_list) {
                    return this.associated_followUpStatus_list.map(item => `${item.followupId}`);
                }
                return [];
            }
        },
        data() {
            return {
                publicPath: process.env.BASE_URL,

                typeId: 14,
                currentId: '',
                attrTypeValue: '',
                formValidate: {
                    currentName: '',
                    attrValue: '',
                    positionPunch: false,
                    numberStatus: false, // 是否开启内容模板字数限制
                    number: '', // 内容模板字数
                    siteScopeStatus: false, // 是否开启打卡范围
                    siteScope: '', // 打卡范围
                    picturesStatus: false, // 图片是否必填
                    attachmentStatus: false // 附件必填
                },

                /* 表格 */
                loading: true, // 加载图标
                list_options: [], // 表格数据
                sortInstance: null, // 排序实例
                boundEnd: 0, // 可排序区域的底部边界, 大于 index 的表格行固定, 不参与排序

                /* 模态框 */
                visible: false,
                option_nodelete: ''
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
                        const efficientList = response.data.data.filter(item => item.isAvailable === 1).sort((a, b) => a.sort - b.sort);
                        const invalidList = response.data.data.filter(item => item.isAvailable !== 1).sort((a, b) => a.sort - b.sort);
                        this.boundEnd = efficientList.length;
                        invalidList.length && invalidList.unshift({
                            attrName: '弃用选项',
                            attrId: '-1'
                        });
                        this.list_options = efficientList.concat(invalidList);
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
                this.formValidate = {
                    currentName: '',
                    attrValue: '',
                    positionPunch: false,
                    numberStatus: false, // 是否开启内容模板字数限制
                    number: '', // 内容模板字数
                    siteScopeStatus: false, // 是否开启打卡范围
                    siteScope: '', // 打卡范围
                    picturesStatus: false, // 图片是否必填
                    attachmentStatus: false // 附件必填
                };
                this.currentId = '';
            },
            codeInput(type) {
                this.formValidate[type] = this.formValidate[type].replace(/[^\d]/g, '');
            },
            checkInput(type) {
                if (type === 'number') {
                    if (!this.formValidate.number) {
                        this.$Message.error(this.$t('crm.UniSet.followUpModeFormLable1Tip'));
                        return false;
                    }
                    if (Number(this.formValidate.number) > 2000 || Number(this.formValidate.number) < 1) {
                        this.$Message.error(this.$t('crm.UniSet.followUpModeFormLable1Tip'));
                        return false;
                    }
                }
                if (type === 'siteScope') {
                    if (!this.formValidate.siteScope) {
                        this.$Message.error(this.$t('crm.UniSet.followUpModeFormLable3Tip'));
                        return false;
                    }
                    if (Number(this.formValidate.siteScope) > 1000 || Number(this.formValidate.siteScope) < 50) {
                        this.$Message.error(this.$t('crm.UniSet.followUpModeFormLable3Tip'));
                        return false;
                    }
                }
                return true;
            },
            /* 模态框 */
            ok() {
                // 选项内容不能为空
                if (!this.formValidate.currentName.trim()) {
                    this.$Message.error(`${this.$t('crm.UniSet.pleaseEnter')}${this.$t('crm.UniSet.followUpMode')}`);
                    return false;
                }

                // 选项不能重复
                if (this.list_options.find(item => item.attrName === this.formValidate.currentName && item.attrId !== this.currentId)) {
                    this.$Message.error(this.$t('crm.UniSet.error_contentRepeat'));
                    return false;
                }
                if ((this.formValidate.numberStatus || this.formValidate.number) && !this.checkInput('number')) return;
                if ((this.formValidate.siteScopeStatus || this.formValidate.siteScope) && !this.checkInput('siteScope')) return;
                let postData, str;
                if (this.currentId === '') {
                    postData = {
                        orgId: this.enterpriseId,
                        typeId: this.typeId,
                        attrName: this.formValidate.currentName,
                        attrValue: this.formValidate.attrValue,
                        positionPunch: this.formValidate.positionPunch ? 1 : 0,
                        numberStatus: this.formValidate.numberStatus ? 1 : 0, // 是否开启内容模板字数限制
                        number: this.formValidate.number, // 内容模板字数
                        siteScopeStatus: this.formValidate.siteScopeStatus ? 1 : 0, // 是否开启打卡范围
                        siteScope: this.formValidate.siteScope, // 打卡范围
                        picturesStatus: this.formValidate.picturesStatus ? 1 : 0, // 图片是否必填
                        attachmentStatus: this.formValidate.attachmentStatus ? 1 : 0 // 附件必填
                    };
                    str = 'add';
                } else {
                    postData = {
                        orgId: this.enterpriseId,
                        attrId: this.currentId,
                        typeId: this.typeId,
                        attrName: this.formValidate.currentName,
                        attrValue: this.formValidate.attrValue,
                        positionPunch: this.formValidate.positionPunch ? 1 : 0,
                        numberStatus: this.formValidate.numberStatus ? 1 : 0, // 是否开启内容模板字数限制
                        number: this.formValidate.number, // 内容模板字数
                        siteScopeStatus: this.formValidate.siteScopeStatus ? 1 : 0, // 是否开启打卡范围
                        siteScope: this.formValidate.siteScope, // 打卡范围
                        picturesStatus: this.formValidate.picturesStatus ? 1 : 0, // 图片是否必填
                        attachmentStatus: this.formValidate.attachmentStatus ? 1 : 0 // 附件必填
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
            edit(item) {
                this.visible = true;
                this.formValidate.currentName = item.attrName;
                this.formValidate.attrValue = item.attrValue;
                this.formValidate.positionPunch = Boolean(item.positionPunch);
                this.formValidate.numberStatus = Boolean(item.numberStatus); // 是否开启内容模板字数限制
                this.formValidate.number = item.number; // 内容模板字数
                this.formValidate.siteScopeStatus = Boolean(item.siteScopeStatus); // 是否开启打卡范围
                this.formValidate.siteScope = item.siteScope; // 打卡范围
                this.formValidate.picturesStatus = Boolean(item.picturesStatus); // 图片是否必填
                this.formValidate.attachmentStatus = Boolean(item.attachmentStatus);// 附件必填
                this.attrTypeValue = item.attrTypeValue;
                this.currentId = item.attrId;
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

                                    const strId = temp.concat([data]).sort((a, b) => a.sort - b.sort).map(item => item.attrId).filter(item => !(!item || item === '')).join(',');
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
                // if (val === 0) {
                //     // 未做英文处理
                //     this.$confirm(`${this.$t('facebook.accountBinding.deleteContent')} ?`, '', {
                //         confirmButtonText: this.$t('confirm'),
                //         cancelButtonText: this.$t('cancel'),
                //         type: 'warning'
                //     }).then(async (res) => {
                //         this.dealChangeAvailable(data, val);
                //     }).catch(({ data }) => {
                //         this.$Message.warning(data.message || 'fail');
                //     });
                // } else
                if (val === 2) {
                    // 未做英文处理
                    this.$confirm('删除后,将无法筛选该选项的旧数据,确认要删除吗？', '删除确认', {
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
        },
        watch: {
            associated_followUpStatus_list: {
                handler(val) {
                    if (!val) {
                        this.$store.commit('get_associated_followUpStatus_list', this.enterpriseId);
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less" scoped>

    .select_stage{
        color: #000;
        margin-left: 40px;
    }

    .select_succ_stage{
        width:200px;
        margin-left: 30px;
    }
    .followUpMode-modal{
        &/deep/ .el-input__inner {
            font-size: 12px;
        }
        &/deep/ .el-textarea__inner {
            font-size: 12px;
        }
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
