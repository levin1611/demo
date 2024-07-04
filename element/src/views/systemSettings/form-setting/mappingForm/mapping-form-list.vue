<template>
    <div>
        <div class="mapping-form-list-title">
            <div>
                <div style="font-size: 14px;color: #333;font-weight: bold;">{{ $t('formSet.title_mappingFormList') }}</div>
                <span>{{ $t('formSet.setTxt4') }}</span>,
                <a href="https://www.yuque.com/help.leadscloud/faq_guide/rq2ymm6tfzqxkar8"
                   target="_blank"
                   class="mouse-on">{{ $t('formSet.crawlFormConditionTip') }}</a>
            </div>
            <Button type="primary" @click="createMapping">{{ $t('formSet.setMappingFormTitle') }}</Button>
        </div>

        <!-- 映射规则表格 -->
        <Table :data="formList"
               v-loading="loading"
               :height="363"
               size="medium"
               highlight-current-row
               ref="table"
               style="width: 100%"
               class="noborder-table">
            <TableColumn :label="$t('formSet.tableTitle')"
                         :width="300"
                         prop="relationName"></TableColumn>
            <TableColumn :label="$t('formSet.tableTitle1')"
                         prop="sysTemplateName"></TableColumn>
            <TableColumn :label="$t('formSet.tableTitle2')"
                         prop="updateTime"
                         :width="150"
                         sortable>
                <template slot-scope="scope">
                    <span>{{ scope.row.updateTime | timeFormat('DateTime') }}</span>
                </template>
            </TableColumn>
            <TableColumn :label="$t('formSet.tableTitle3')"
                         prop="isValidate"
                         :width="80">
                <template slot-scope="scope">
                    <span>{{ scope.row.isValidate | isValidate }}</span>
                </template>
            </TableColumn>
            <TableColumn :label="$t('formSet.operate')"
                         :width="180">
                <template slot-scope="scope">
                    <!-- 追踪代码 -->
                    <span @click="getEnquiry(scope.row)"
                          class="mouse-on">{{ $t('formSet.tableSet1') }}</span>
                    <!-- 编辑 -->
                    <Icon custom="custom-field-edit"
                          :size="12"
                          @click="resetField(scope.row)"
                          class="margin-left-20 cursor-pointer"></Icon>
                    <!-- 删除 -->
                    <Icon custom="custom-field-delete"
                          :size="12"
                          @click="remove(scope.$index, scope.row)"
                          class="margin-left-20 cursor-pointer"></Icon>
                </template>
            </TableColumn>
        </Table>

        <!-- 生效规则表格 -->
        <MappingRuleList :view="view"></MappingRuleList>

        <Modal
            :visible.sync="codeShow"
            width="40%"
            :modal-append-to-body="false"
            :title="$t('formSet.modelTitle')">
            <div>
                <p>{{ $t('formSet.modelTitle1Tip') }}</p>
                <textarea id="code" v-model="code"></textarea>
            </div>
            <span slot="footer" class="dialog-footer">
                <Button @click="codeShow = false">{{ $t('formSet.modelCancelTxt') }}</Button>
                <Button type="primary" @click="copy" class="piwik_copy_third_code">{{ $t('formSet.modelOkTxt') }}</Button>
            </span>
        </Modal>

        <!-- 删除表单确认框 -->
        <Modal :visible.sync="isDeleteForm"
               :title="$t('formSet.deletePrompt')"
               :modal-append-to-body="false"
               width="30%">
            <!-- 删除提示 -->
            <p>{{ $t('formSet.deleteTipTxt8') }}{{ deletedRow.relationName }}{{ $t('formSet.deleteTipTxt9') }}</p>
            <br>

            <!-- 底部按钮 -->
            <span slot="footer"
                  class="dialog-footer">
                    <Button @click="isDeleteForm = false">{{ $t('cancel') }}</Button>
                    <Button type="primary"
                            @click="deleteForm">{{ $t('confirm') }}</Button>
                </span>
        </Modal>
    </div>
</template>

<script>
    import { formSetting } from '@/api/systemSettings/form-setting';
    import { mapState } from 'vuex';
    import MappingRuleList from '@/views/systemSettings/form-setting/mappingForm/mapping-rule-list';
    import util from '@/libs/util';

    export default {
        name: 'mapping-form-list',
        components: {
            MappingRuleList
        },
        props: [
            'view'
        ],
        computed: {
            ...mapState([
                'enterpriseId'
            ])
        },
        data() {
            return {
                isDeleteForm: false,
                deletedRow: {},
                deleteIndex: '',
                loading: false,
                formList: [],
                codeShow: false,
                code: '' // 埋点代码
            };
        },
        methods: {
            createMapping() {
                this.$emit('update:checkForm', null);
                this.$emit('changeView', 'mappingFormSet');
            },
            resetField(row) {
                this.$emit('update:checkForm', row);
                this.$emit('changeView', 'mappingFormSet');
            },
            remove(index, row) {
                // 删除前再检验一遍是否是预制表单, 是则退出删除
                this.deletedRow = row;
                this.deleteIndex = index;
                this.isDeleteForm = true;
            },
            deleteForm() {
                formSetting.deleteExternalRelation({ id: this.deletedRow.id }).then(response => {
                    if (response.code === '1') {
                        this.formList.splice(this.deleteIndex, 1);
                        this.isDeleteForm = false;
                        this.$Message.success(this.$t('deleteSuccess'));
                    } else {
                        this.$Message.error(this.$t('deleteFail'));
                    }
                });
            },
            /**
             **获取映射关系列表
             */
            getExternalRelationList() {
                this.loading = true;
                this.formList = [];
                formSetting.getExternalRelationList({
                    orgId: this.enterpriseId
                }).then(response => {
                    this.loading = false;
                    if (response.code === '1') {
                        this.formList = response.data;
                    }
                }).catch(() => {
                    this.loading = false;
                });
            },
            /**
             ** 获取询盘id，拼接埋点代码
             */
            getEnquiry(row) {
                this.code = `<script>(function(x,h,l,j,s){x[j]=x[j]||function(){(x[j].a=x[j].a||[]).push(arguments)};s=h.createElement(l);z=h.getElementsByTagName(l)[0];s.async=true;s.charset="UTF-8";s.src="${util.buriedUrl}/Front-Form/buryForm/crawlWebSubmit_entry.js";z.parentNode.insertBefore(s,z)})(window,document,"script","_XHLCF");_XHLCF("${this.enterpriseId}","${row.relationUuid}");<\/script>`;
                this.codeShow = true;
            },
            copy() {
                const Url = document.getElementById('code');
                Url.select(); // 选择对象
                document.execCommand('Copy');
                this.$Message.success(this.$t('formSet.setTip3'));
            }
        },
        watch: {
            view: {
                handler(val) {
                    if (val === 'mappingFormList') {
                        this.getExternalRelationList();
                    }
                },
                immediate: true
            }
        },
        filters: {
            isValidate(val) {
                if (val === 1) {
                    return '有效';
                } else {
                    return '失效';
                }
            }
        }
    };
</script>

<style lang="less">
    .mapping-form-list-title {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 10px;
        margin-bottom: 10px;
        // height: 59px;

        span, a {
            font-size: 12px
        }
    }
</style>
