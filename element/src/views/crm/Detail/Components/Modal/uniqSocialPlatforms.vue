<template>
    <div>
        <Modal :title="socialPlatformsTitle"
               :visible="visible"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :append-to-body="true"
               width="570px"
               @opened="handleOpen"
               class="modal">
            <div class="checkcompany">
                <div class="companysearch" style="margin-left:-4px">
                    <div class="each" style="width:520px;text-align: left;" v-text="socialPlatformsTip"></div>
                </div>
                <Table :data="tableData"
                       :empty-text="$t('crm.Modal.tip_noRelatedInquiry')"
                       v-loading="loading"
                       @cell-click="copy_content">
                    <TableColumn v-for="item in phoneNumberRelatedColumns"
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
                <Button @click="cancel">{{ $t('crm.Modal.modal_close') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { mapGetters, mapState } from 'vuex';
    import { getContactRepeatData } from '@/api/reusableApi/common';

    export default {
        name: 'uniqSocialPlatforms',
        props: [
            'visible',
            'uniqSocialPlatformVal',
            'uniqSocialPlatformName'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId'
            }), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            socialPlatformsTip() {
                return this.$t('crm.Modal.legend_uniqSocialPlatformTable').replace(/\$socialPlatform/g, this.uniqSocialPlatformName);
            },
            socialPlatformsTitle() {
                return this.$t('crm.Modal.title_uniqSocialPlatform_fixed').replace(/\$socialPlatform/g, this.uniqSocialPlatformName);
            }
        },
        data() {
            return {
                phoneNumberRelatedColumns: [
                    {
                        title: this.$t('crm.Modal.corp_companyName'),
                        key: 'companyName'
                    },
                    {
                        title: this.$t('crm.Modal.contact_nickName'),
                        key: 'mainContactsName'
                    },
                    {
                        title: this.uniqSocialPlatformName,
                        key: 'attrValue'
                    },
                    {
                        title: this.$t('crm.Modal.managers'),
                        key: 'owner',
                        formatter: row => {
                            return row.userName || this.$t('crm.Modal.highseasInquiry');
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
                tableData: [],
                tableFirstShow: true,
                loading: false
            };
        },
        methods: {
            // 打开时弹出复制的提示
            handleOpen() {
                // 请求表格数据
                this.getTableData();

                // 初次显示此页面时弹出表格内容可复制提示
                if (this.tableFirstShow) {
                    console.log('tip_canCopy', this.tip_canCopy);
                    this.tableFirstShow = false;
                    this.$Message.info({
                        message: this.$t('crm.Modal.tip_canCopy'),
                        duration: 3000
                    });
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
            // 获取重复数据
            async getTableData() {
                if (this.uniqSocialPlatformName && this.uniqSocialPlatformVal) {
                    // 清空数据, 显示 loading
                    this.loading = true;
                    this.tableData = [];

                    // 组装发送数据
                    const params = {
                        orgId: this.enterpriseId,
                        attrName: this.uniqSocialPlatformName,
                        attrValue: this.uniqSocialPlatformVal.trim()
                    };

                    // 发送请求
                    const data = await getContactRepeatData(params);
                    if (data.code === '1') {
                        if (Array.isArray(data.data) && data.data.length) {
                            this.tableData = data.data;
                            this.phoneNumberRelatedColumns[2].title = data.data[0].attrName;
                        }
                    } else {
                        this.$Message.error('获取 社交平台 关联数据失败');
                    }
                    this.loading = false;
                } else {
                    this.$Message.error('请先输入社交平台');
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
