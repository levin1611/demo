<template>
    <div class="main-body" id="form-setting" style="padding-top: 0px">
        <div v-if="showField==0">
            <div class="mapping-form-list-title">
                <span>{{$t('formSet.setTxt')}}</span>
                <div>
                    <Tooltip>
                        <div slot="content" style="white-space: normal;">
                            {{$t('formSet.setTxt1')}}
                        </div>
                        <Button type="primary" @click="toField(0)">{{$t('formSet.setBtn')}}</Button>
                    </Tooltip>
                    <!-- 创建 Facebook 表单 -->
                    <Tooltip v-if="showFbBtn"
                            style="margin-left:12px;">
                        <Button type="primary"
                                @click="toField(1)">{{ $t('formSet.setBtn1') }}</Button>
                        <div slot="content"
                            style="white-space: normal;">{{ $t('formSet.setTxt2') }}</div>
                    </Tooltip>
                    <!-- 创建 AMP 表单 -->
                    <Tooltip v-if="showAMPBtn"
                            style="margin-left:12px;">
                        <Button type="primary"
                                @click="toField(2)">{{ $t('formSet.AMPForm') }}</Button>
                        <div slot="content"
                            style="white-space: normal;">{{ $t('formSet.AMPFormTip') }}</div>
                    </Tooltip>
                    </div>
            </div>
            <Table :data="formList"
                   v-loading="loading"
                   :row-class-name="rowClassName"
                   fit
                   size="medium"
                   highlight-current-row
                   ref="table"
                   style="width: 100%"
                   class="noborder-table">
                <TableColumn :label="$t('formSet.name')">
                    <template slot-scope="scope">
                        <span @click="resetField(scope.row)"
                              class="cursor-pointer">{{ scope.row.name }}</span>
                    </template>
                </TableColumn>
                <TableColumn v-for="item in columns"
                             :key="item.key"
                             :prop="item.key"
                             :label="item.title"
                             :formatter="item.formatter"
                             :width="item.width"
                             :min-width="item.minWidth">
                </TableColumn>
                <TableColumn :label="$t('formSet.operate')"
                             :width="360">
                    <template slot-scope="scope">
                        <!-- FB 表单 -->
                        <template v-if="scope.row.type === 1">
                            <!-- 埋点代码, 此处不显示, 仅占位用 -->
                            <span class="margin-right-15 visibility-hidden">{{ $t('formSet.code') }}</span>
                            <!-- 表单样式, 此处不显示, 仅占位用 -->
                            <span class="margin-right-15 visibility-hidden">{{ $t('formSet.style') }}</span>
                            <!-- AMP 表单绑定, 此处不显示, 仅占位用 -->
                            <span v-if="haveAMPForm"
                                  class="margin-right-15 visibility-hidden">{{ $t('formSet.AMPBind') }}</span>
                            <!-- 编辑(进入详情) -->
                            <Icon custom="custom-field-edit"
                                  :size="12"
                                  @click="resetField(scope.row)"
                                  class="margin-left-20 cursor-pointer"></Icon>
                        </template>
                        <!-- AMP 表单 -->
                        <template v-else-if="scope.row.type === 2">
                            <!-- 埋点代码 -->
                            <span @click="getEnquiry(scope.row.id)"
                                  class="mouse-on">{{ $t('formSet.code') }}</span>
                            <!-- 表单样式 -->
                            <span @click="formStyle(scope.row.id)"
                                  class="mouse-on">{{ $t('formSet.style') }}</span>
                            <!-- AMP 表单绑定 -->
                            <span @click="bindAMP"
                                  class="mouse-on">{{ $t('formSet.AMPBind') }}</span>
                            <!-- 编辑(进入详情) -->
                            <Icon custom="custom-field-edit"
                                  :size="12"
                                  @click="resetField(scope.row)"
                                  class="margin-left-20 cursor-pointer"></Icon>
                        </template>
                        <!-- 其他(留言表单) -->
                        <template v-else>
                            <!-- 埋点代码 -->
                            <span @click="getEnquiry(scope.row.id)"
                                  class="mouse-on">{{ $t('formSet.code') }}</span>
                            <!-- 表单样式 -->
                            <span @click="formStyle(scope.row.id)"
                                  class="mouse-on">{{ $t('formSet.style') }}</span>
                            <!-- AMP 表单绑定, 此处不显示, 仅占位用 -->
                            <span v-if="haveAMPForm"
                                  class="margin-right-15 visibility-hidden">{{ $t('formSet.AMPBind') }}</span>
                            <!-- 编辑(进入详情) -->
                            <Icon custom="custom-field-edit"
                                  :size="12"
                                  @click="resetField(scope.row)"
                                  class="margin-left-20 cursor-pointer"></Icon>
                            <!-- 删除 -->
                            <Icon v-if="!scope.row.isInit"
                                  custom="custom-field-delete"
                                  :size="12"
                                  @click.native="remove(scope.$index, scope.row)"
                                  class="margin-left-20 cursor-pointer"></Icon>
                            <!-- 拖拽排序 -->
                            <Icon custom="custom-drag-and-drop"
                                  :size="12"
                                  class="margin-left-20 cursor-pointer"></Icon>
                        </template>
                    </template>
                </TableColumn>
            </Table>
            <Modal
                    :visible.sync="codeShow"
                    width="30%"
                    :modal-append-to-body="false"
                    :title="$t('formSet.modelTitle')">
                <div>
                    <textarea id="code" v-model="code"></textarea>
                </div>
                <span slot="footer" class="dialog-footer">
                    <Button @click="codeShow = false">{{ $t('formSet.modelCancelTxt') }}</Button>
                    <Button type="primary" @click="copy">{{ $t('formSet.modelOkTxt') }}</Button>
                </span>
            </Modal>
            <!-- 删除表单确认框 -->
            <Modal :visible.sync="isDeleteForm"
                   :title="$t('formSet.deletePrompt')"
                   :modal-append-to-body="false"
                   width="30%">
                <!-- 删除提示 -->
                <p>{{ $t('formSet.deleteTipTxt1')}}{{ deletedFormName }}{{ $t('formSet.deleteTipTxt2') }}</p>
                <br>
                <!-- 被删表单是客服离线表单提示 -->
                <div v-if="deleteTip"
                     v-html="deleteTip"></div>
                <!-- 底部按钮 -->
                <span slot="footer"
                      class="dialog-footer">
                    <Button @click="isDeleteForm = false">{{ $t('cancel') }}</Button>
                    <Button type="primary"
                            @click="deleteForm">{{ $t('confirm') }}</Button>
                </span>
            </Modal>
        </div>
        <FormField v-if="showField==1" :showField.sync="showField" @updateList="getTemplateList()"
                   :templateId="templateId" :formId="formID" :formType="formType"></FormField>
        <FormStyle v-if="showField==2" :showField.sync="showField" :templateId="templateId" :formId="formID"></FormStyle>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import Sortable from 'sortablejs';
    import FormField from './form-field';
    import FormStyle from './form-style';

    export default {
        name: 'form_setting',
        components: {
            FormField,
            FormStyle
        },
        computed: {
            ...mapState([
                'enterpriseId'
            ]),
            // 已有 AMP 表单
            haveAMPForm() {
                return this.formList.some(item => item.type === 2);
            },
            // 除被删除表单 + FB 表单外创建时间最早的表单
            earliestForm() {
                const sortedList = this.formList.filter(item => item.id !== this.deleteId && item.type !== 1).sort((a, b) => a.createTime - b.createTime);
                return sortedList[0] || {};
            },
            // 删除提示
            deleteTip() {
                // 解构取值
                const { externalFormCount, offlineFormDomains } = this.deleteCheckData;
                // 关联的离线表单的数量
                const offlineFormCount = Array.isArray(offlineFormDomains) ? offlineFormDomains.length : undefined;

                // 待删除表单无关联客服离线表单 + 无关联第三方表单, 不提示
                if (!offlineFormCount && !externalFormCount) {
                    return '';
                }

                // 无关联客服离线表单(+ 关联第三方表单), 则只提示第三方表单相关信息
                if (!offlineFormCount) {
                    return `<p>${this.$t('formSet.deleteTipTxt')}${this.$t('formSet.deleteTipTxt10')}</p>`;
                }

                // 有关联客服离线表单
                if (!externalFormCount) {
                    // 无关联第三方表单

                    // 如果只剩一个表单, 则直接告诉用户删除此表单后客服离线表单会被同步删除
                    if (this.formList.length === 1) {
                        return `<p>${this.$t('formSet.deleteTipTxt')}${this.$t('formSet.deleteTipTxt7').replace('$formList', offlineFormDomains.join('、'))}</p>`;
                    }

                    // 没有预制表单, 提示用户客服离线表单将替换为除被删表单外创建时间最早的表单
                    if (this.earliestForm.name) {
                        return `<p>${this.$t('formSet.deleteTipTxt')}${this.$t('formSet.deleteTipTxt5').replace('$formList', offlineFormDomains.join('、'))} ${this.earliestForm.name} ${this.$t('formSet.deleteTipTxt6')}</p>`;
                    }
                } else {
                    // 有关联第三方表单

                    // 如果只剩一个表单, 则直接告诉用户删除此表单后客服离线表单会被同步删除
                    if (this.formList.length === 1) {
                        return `<p>${this.$t('formSet.deleteTipTxt')}</p><p>1、${this.$t('formSet.deleteTipTxt7').replace('$formList', offlineFormDomains.join('、'))}</p><p>2、${this.$t('formSet.deleteTipTxt10')}</p>`;
                    }

                    // 没有预制表单, 提示用户客服离线表单将替换为除被删表单外创建时间最早的表单
                    if (this.earliestForm.name) {
                        return `<p>${this.$t('formSet.deleteTipTxt')}</p><p>1、${this.$t('formSet.deleteTipTxt5').replace('$formList', offlineFormDomains.join('、'))} ${this.earliestForm.name} ${this.$t('formSet.deleteTipTxt6')}</p><p>2、${this.$t('formSet.deleteTipTxt10')}</p>`;
                    }
                }


                return '';
            }
        },
        data() {
            return {
                templateId: '',
                isDeleteForm: false,
                deletedFormName: '',
                deleteId: '',
                deleteIndex: '',
                formID: '',
                formType: '',
                showField: 0,
                loading: false,
                columns: [
                    {
                        title: this.$t('formSet.type'),
                        key: 'type',
                        formatter: row => {
                            switch (row.type) {
                                case 1:
                                    return this.$t('formSet.formType');
                                case 2:
                                    return this.$t('formSet.formType2');
                                default:
                                    return this.$t('formSet.formType1');
                            }
                        }
                    },
                    {
                        title: this.$t('formSet.time'),
                        key: 'createTime',
                        formatter: (row, column, cellValue) => {
                            return this.$options.filters.timeFormat(cellValue, 'DateTime');
                        }
                    }
                ],
                formList: [],
                showFbBtn: false, // 显示创建 FB 表单按钮
                showAMPBtn: false, // 显示创建 AMP 表单按钮
                codeShow: false,
                code: '', // 埋点代码
                enquiryID: '',

                // 排序
                sortInstance: null, // 排序实例
                boundTop: -1, // 可排序区域的顶部边界, 小于 index 的表格行固定, 不参与排序

                // 当前要删除的表单关联的客服离线表单和第三方表单的数据
                deleteCheckData: {}
            };
        },
        methods: {
            toField(type, action = 'new') {
                if (this.loading) {
                    this.$Message.warning(this.$t('formSet.setTip'));
                    return;
                }
                // 新建表单
                if (action === 'new') {
                    // 置空 formID
                    this.formID = '';
                    // 判断 AMP 表单和 FB 表单是否可新建
                    if (type === 1 && this.checkFBList(1)) { /* 是facebook表单字段 且 有facebook类型的表单 */
                        this.$Message(this.$t('formSet.setTip1'));
                        return;
                    } else if (type === 2 && this.checkFBList(2)) {
                        this.$Message(this.$t('formSet.AMPFormTip1'));
                        return;
                    }
                }
                this.formType = type;
                this.showField = 1;
            },
            bindAMP() {
                this.$router.push({
                    name: 'AMP_bind'
                });
            },
            checkFBList(type) {
                return this.formList.some(item => item.type === type);
            },
            resetField({ id, type }) {
                this.formID = id;
                this.toField(type, 'edit');
            },
            formStyle(id) {
                this.formID = id;
                this.showField = 2;
            },
            remove(index, row) {
                // 删除前再检验一遍是否是预制表单, 是则退出删除
                if (row.isInit) {
                    this.$Message.error(this.$t('crm.Modal.errorOccurred'));
                    return;
                }
                this.deleteId = row.id;
                this.deletedFormName = row.name;
                this.deleteIndex = index;
                this.getRelatedSiteList(this.deleteId);
            },
            // 获取客服离线表单
            getRelatedSiteList(formId) {
                this.isDeleteForm = false;
                this.deleteCheckData = {};
                util.ajax({
                    url: '/form-cust/template/deleteTemplatecheckTips',
                    method: 'post',
                    data: {
                        id: formId
                    }
                }).then(res => {
                    if (res.data && `${res.data.code}` === '1' && res.data.data) {
                        this.deleteCheckData = res.data.data;
                        this.isDeleteForm = true;
                    } else {
                        this.$Message.error(this.$t('formSet.error_getOfflineForm'));
                    }
                }).catch(err => {
                    this.$Message.error(this.$t('formSet.error_getOfflineForm'));
                });
            },
            deleteForm() {
                util.ajax({
                    url: '/form-cust/template/deleteTemplate',
                    method: 'POST',
                    data: {
                        id: this.deleteId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.formList.splice(this.deleteIndex, 1);
                        this.isDeleteForm = false;
                        this.$Message.success(this.$t('deleteSuccess'));
                    } else {
                        this.$Message.error(this.$t('deleteFail'));
                    }
                });
            },
            /**
             **获取表单列表
             */
            getTemplateList() {
                this.loading = true;
                this.showFbBtn = false;
                this.showAMPBtn = false;
                this.formList = [];
                util.ajax({
                    url: '/form-cust/template/getFormTemplateSortedList',
                    method: 'POST',
                    data: {
                        billType: 1,
                        status: -1,
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    this.loading = false;
                    if (response.data.code === '1') {
                        this.formList = response.data.data.map(item => {
                            return {
                                name: item.cname,
                                createTime: item.createTime,
                                id: item.id,
                                type: item.cateType || 0,
                                isInit: item.isInit // 是否是预制表单, 值为 0 , 1
                            };
                        });
                        this.showFbBtn = !this.formList.some(item => item.type === 1);
                        this.showAMPBtn = [10170, 10171].includes(this.enterpriseId) && !this.haveAMPForm;
                        // 获取可拖动元素顶部边界, FB 表单和 AMP 表单分别位于第一位和第二位, 不参与排序
                        this.boundTop = this.formList.filter(item => [1, 2].includes(item.type)).length - 1;
                    }
                }).catch(() => {
                    this.loading = false;
                });
            },
            /**
             ** 获取询盘id，拼接埋点代码
             */
            getEnquiry(id) {
                this.code = `<div class="BURY_CODE_${id}"></div><script>(function (x, h, l, j, s) {x[j] = x[j] || function () {(x[j].a = x[j].a || []).push(arguments)};s = h.createElement(l);z = h.getElementsByTagName(l)[0];s.async = true;s.charset = "UTF-8";s.src = "${util.buriedUrl}/Front-Form/buryForm/xhlform_NEW.js";z.parentNode.insertBefore(s, z);})(window, document, "script", "_XHLF");_XHLF("${this.enterpriseId}","${this.templateId}","${id}","");<\/script>`;
                this.codeShow = true;
            },
            copy() {
                const Url = document.getElementById('code');
                Url.select(); // 选择对象
                document.execCommand('Copy');
                this.$Message.success(this.$t('formSet.setTip3'));
            },
            /**
             ** 获取线索模板id
             */
            getXSShow() {
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const data = response.data.data;
                        this.templateId = data.template.id;
                    }
                });
            },

            /* 排序相关 */
            // 表格行 class
            rowClassName({ row }) {
                // FB 表单和 AMP 表单分别位于第一位和第二位, 不参与排序
                return [1, 2].includes(row.type) ? 'unSortable' : 'sortable';
            },
            // 创建排序列表
            createSortableInstance() {
                if (this.sortInstance) {
                    this.sortInstance.destroy();
                }

                const vm = this;
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
                });
            },
            // 排序
            endFunc(e) {
                if (e.newIndex !== e.oldIndex) {
                    // 获取原有顺序
                    const sortedArr = this.sortInstance.toArray();
                    sortedArr.splice(e.oldIndex, 0, ...sortedArr.splice(e.newIndex, 1));
                    if (e.newIndex <= this.boundTop) {
                        // 不能移动到顶部 "FB表单" 之上
                        this.sortInstance.sort(sortedArr);
                        this.$Message.info(this.$t('formSet.tip_unSortForm'));
                    } else {
                        this.loading = true;

                        // 保证 formList 顺序和页面显示的选项顺序一致
                        this.formList.splice(e.newIndex, 0, ...this.formList.splice(e.oldIndex, 1));
                        // iview 3.4.2 升级到 viewUI 4.0.2 后, 上一句代码会导致排序成功但选项显示顺序错误
                        // 未找到原因, 这里先将选项置空再恢复, 能解决该 BUG
                        const temp = this.$deepClone(this.formList);
                        this.formList = [];
                        this.$nextTick(() => {
                            this.formList = temp;

                            // 发送排序请求
                            util.ajaxJson({
                                url: '/form-cust/form/updateTemplateSort',
                                method: 'post',
                                data: JSON.stringify(temp.filter(item => item.type !== 1).map((item, index) => {
                                    return {
                                        id: item.id,
                                        sort: index + 1
                                    };
                                }))
                            }).then(response => {
                                if (response.data.code !== '1') {
                                    // 同样由于新版本, 此处不需要 this.sortInstance.sort(sortedArr), 加了会出错
                                    this.formList.splice(e.oldIndex, 0, ...this.formList.splice(e.newIndex, 1));
                                    this.$Message.error(this.$t('formSet.error_sortForm'));
                                }
                                this.loading = false;
                            }).catch(error => {
                                this.formList.splice(e.oldIndex, 0, ...this.formList.splice(e.newIndex, 1));
                                this.$Message.error(this.$t('formSet.error_sortForm'));
                                this.loading = false;
                            });
                        });
                    }
                }
            }
        },
        mounted() {
            this.getTemplateList();
            this.getXSShow();

            // 创建可排序列表
            this.createSortableInstance();
        },
        watch: {
            showField(val) {
                if (val === 0) {
                    this.$emit('handleShowTabs', true);
                    setTimeout(() => {
                        // 创建可排序列表
                        this.createSortableInstance();
                    });
                } else {
                    this.$emit('handleShowTabs', false);
                }
            }
        }
    };
</script>

<style>
    #code {
        width: 100%;
        height: 220px;
        font-size: 14px;
    }

    .mouse-on {
        margin-right: 15px;
        color: #3b78de;
        cursor: pointer;
    }

    .mouse-on:hover {
        color: #2d63bc;
        text-decoration: underline;
    }

    #form-setting .ivu-checkbox {
        margin-right: 0;
    }
</style>
