<template>
    <div>
        <Modal :title="$t('crm.Modal.title_uniqEmail_fixed')"
               :visible="visible"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :append-to-body="true"
               width="570px"
               @opened="handleOpen"
               class="modal">
            <div class="checkcompany">
                <!-- color: #FA8241; (${(email ? email.trim() : '')})-->
                <div class="companysearch" style="margin-left:-4px">
                    <div v-text="`${$t('crm.Modal.legend_uniqEmailTable')}`"
                         style="width:520px;text-align: left;"
                         class="each"></div>
                </div>
                <Table :data="emailRelatedData"
                       v-loading="emailRelatedLoading"
                       :empty-text="$t('crm.Modal.tip_noRepeat')"
                       @cell-click="copy_content">
                    <TableColumn v-for="item in emailRelatedColumns"
                                 :key="item.key"
                                 :prop="item.key"
                                 :label="item.title"
                                 :formatter="item.formatter"
                                 :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <template v-if="item.key === 'companyName'">
                                <a @click.stop="viewCompany(scope.row.companyId)"
                                   class="hover-link">{{ scope.row[item.key] }}</a>
                            </template>
                            <template v-else-if="item.formatter">
                                {{ (item.formatter)(scope.row) }}
                            </template>
                            <template v-else>
                                {{ scope.row[item.key] }}
                            </template>
                        </template>
                    </TableColumn>
                </Table>
            </div>

            <!-- 隐藏元素, 用来复制内容 -->
            <textarea ref="copy_element" style="width: 0;height: 0;opacity: 0;"></textarea>

            <div slot="footer">
                <!--<Button type="primary" style="width:130px" @click="ok"-->
                <!--v-show="emailRelatedData.length && allowMerge === '1'">{{ $t('crm.Modal.modal_merge') }}-->
                <!--</Button>-->
                <Button @click="cancel">{{ $t('crm.Modal.modal_close') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'uniqMail',
        props: [
            'transfer',
            'visible',
            'merged',
            'mergedId',
            'email'
        ],
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                allowMerge: state => state.crm.allowMerge
            }),
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ])
        },
        data() {
            return {
                tempMergedId: '',
                emailRelatedLoading: true,
                emailRelatedColumns: [
                    {
                        title: this.$t('crm.Modal.corp_companyName'),
                        key: 'companyName'
                    },
                    {
                        title: this.$t('crm.Modal.inq_productCategory'),
                        key: 'productCategory',
                        formatter: row => {
                            const temp = this.$options.filters.parseArray(row.productCategory);
                            return temp.length ? temp.join(', ') : row.productCategory;
                        }
                    },
                    {
                        title: this.$t('crm.Modal.managers'),
                        key: 'owner',
                        formatter: row => {
                            return row.owner || this.$t('crm.Modal.highseasInquiry');
                        }
                    },
                    {
                        title: this.$t('crm.Modal.createTime'),
                        key: 'createTime',
                        formatter: row => {
                            return `${this.$options.filters.timeFormat(row.createTime)}\n${this.$options.filters.timeFormat(row.createTime, 'Time')}`;
                        }
                    }
                ],
                emailRelatedData: [],

                tableFirstShow: true
            };
        },
        methods: {
            handleOpen() {
                this.tempMergedId = '';
                this.emailRelatedData = [];
                if (this.email) {
                    this.getEmailRelated();
                }

                if (this.tableFirstShow) {
                    this.tableFirstShow = false;
                    this.$Message.info({
                        message: this.$t('crm.Modal.tip_canCopy'),
                        duration: 3000
                    });
                }
            },
            getEmailRelated() {
                util.ajax({
                    url: '/crm/inquiry/getInquiryUserListByEmail',
                    method: 'post',
                    data: {
                        email: this.email.trim(),
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        if (response.data.data.length) {
                            this.tempMergedId = response.data.data[0].contactsId;
                            response.data.data.map(i => {
                                this.emailRelatedData.push({
                                    companyId: i.companyId,
                                    companyName: i.companyName,
                                    productCategory: i.productCategory,
                                    owner: i.userName,
                                    createTime: i.createTime
                                });
                            });
                        }
                        this.emailRelatedLoading = false;
                    } else {
                        this.$emit('update:visible', false);
                        this.$Message.error(this.$t('crm.Modal.error_getEmailRelated'));
                    }
                });
            },
            ok() {
                if (this.allowMerge === '1') {
                    this.$emit('update:merged', true);
                    this.$emit('update:mergedId', this.tempMergedId);
                    this.$emit('update:visible', false);
                    this.$Message.info(this.$t('crm.Modal.info_emailMergedTip'));
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_notAllowMerge'));
                }
            },
            cancel() {
                this.$emit('update:visible', false);
            },
            copy_content(row, column, cell) {
                const content = cell.innerText;
                if (content) {
                    this.$refs.copy_element.value = content;
                    this.$refs.copy_element.select();
                    if (document.execCommand('Copy')) {
                        this.$Message.success(this.$t('crm.Modal.success_copy'));
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_copy'));
                    }
                }
            },
            // 跳转到客户详情页
            async viewCompany(companyId) {
                // 判断是否有"我的客户"页面权限
                if (!this.isContainsMenu('myCustomer')) {
                    // 没有"我的客户"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                    return;
                }

                // 查询该公司 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Customer',
                    id: companyId
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 公海客户, 检查是否有"公海客户"页面权限
                if (authorized === 'highseas') {
                    // 判断是否有"公海客户"页面权限
                    if (!this.isContainsMenu('highseasCustomer')) {
                        // 没有"公海客户"页面权限, 弹出提示
                        this.$Message.warning(this.$t('crm.Modal.error_haveNoPermissionHighseasCustomer'));
                        return false;
                    }
                }

                // 否则直接新窗口打开新客户详情页
                this.$viewCustomer(companyId);
            }
        }
    };
</script>
