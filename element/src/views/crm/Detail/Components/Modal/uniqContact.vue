<template>
    <Modal :title="langObj.modalTitle"
           :visible="visible"
           :show-close="true"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           :append-to-body="true"
           width="900px"
           @close="cancel"
           @opened="handleOpen"
           @closed="handleClose"
           class="modal uniqModal vertical-center-modal">
        <div>
            <div v-text="langObj.tableLegend"
                 class="tableLegend"></div>

            <!-- 重复数据表格 -->
            <Table :data="tableData"
                   :empty-text="$t('crm.Modal.tip_noRelatedInquiry')"
                   :max-height="tableMaxHeight"
                   v-loading="loading"
                   @cell-click="copy_content">
                <TableColumn v-for="item in tableColumns"
                             :key="item.key"
                             :prop="item.key"
                             :label="item.title"
                             :align="item.align"
                             :formatter="item.formatter"
                             :show-overflow-tooltip="true">
                    <template slot-scope="scope">
                        <template v-if="item.key === 'linkConfirm'">
                            <Radio :value="scope.row.contactsId === selectedContact.contactsId"
                                   :label="true"
                                   @click.native.stop="selectContact(scope.row)">{{ '' }}</Radio>
                        </template>
                        <template v-else-if="item.key === 'companyName'">
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
        <textarea ref="copy_element"
                  style="width: 0;height: 0;opacity: 0;"></textarea>

        <!-- 底部区域 -->
        <div slot="footer">
            <!-- 关闭弹窗 -->
            <Button @click="cancel">{{ $t('crm.Modal.modal_close') }}</Button>
            <!-- 关联已有联系人 -->
            <Button v-if="able_linkContact"
                    type="primary"
                    @click="linkContact"
                    :class="`piwik-linkContact-${uniqField}`">{{ $t('crm.Modal.linkExistedContact') }}</Button>
        </div>
    </Modal>
</template>

<script>
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import { getContactRepeatData } from '@/api/reusableApi/common';

    export default {
        name: 'uniqContact',
        props: [
            'visible',
            'uniqField',
            'uniqVal',
            'clueId',
            'type',
            'json_data',
            'conversationId',
            'commentId'
        ],
        computed: {
            ...mapState([
                'enterpriseId',
                'window_height'
            ]), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            tableMaxHeight() {
                const temp = this.window_height ? this.window_height - 341 : document.body.clientHeight - 341;
                return temp > 159 ? temp : 159;
            },
            // 根据去重字段的不同返回不同的多语言
            langObj() {
                let result = {};

                switch (this.uniqField) {
                    case 'email':
                        result = {
                            modalTitle: this.$t('crm.Modal.title_uniqEmail_fixed'),
                            tableLegend: this.able_linkContact ? this.$t('crm.Modal.legend_uniqEmailLinkTable') : this.$t('crm.Modal.legend_uniqEmailTable'),
                            errorGetDataTip: this.$t('crm.Modal.error_getEmailRelated'),
                            emptyParamTip: this.$t('crm.Modal.error_noEmailToUniq')
                        };
                        break;
                    case 'phone':
                        result = {
                            modalTitle: this.$t('crm.Modal.title_uniqPhone_fixed'),
                            tableLegend: this.able_linkContact ? this.$t('crm.Modal.legend_uniqPhoneLinkTable') : this.$t('crm.Modal.legend_uniqPhoneTable'),
                            errorGetDataTip: this.$t('crm.Modal.error_getPhoneRelated'),
                            emptyParamTip: this.$t('crm.Modal.error_noPhoneToUniq')
                        };
                        break;
                    case 'Instagram':
                        result = {
                            modalTitle: this.$t('crm.Modal.title_uniqInstagram_fixed'),
                            tableLegend: this.able_linkContact ? this.$t('crm.Modal.legend_uniqInsLinkTable') : this.$t('crm.Modal.legend_uniqInsTable'),
                            errorGetDataTip: this.$t('crm.Modal.error_getInstagramRelated'),
                            emptyParamTip: this.$t('crm.Modal.error_noInstagramToUniq')
                        };
                        break;
                    case 'WhatsApp':
                        result = {
                            modalTitle: this.$t('crm.Modal.title_uniqWhatsApp_fixed'),
                            tableLegend: this.able_linkContact ? this.$t('crm.Modal.legend_uniqWALinkTable') : this.$t('crm.Modal.legend_uniqWATable'),
                            errorGetDataTip: this.$t('crm.Modal.error_getWhatsAppRelated'),
                            emptyParamTip: this.$t('crm.Modal.error_noWhatsAppToUniq')
                        };
                }

                return result;
            },
            // 根据去重字段的不同返回不同的表格数据列
            tableColumns() {
                const fields = [
                    'companyName',
                    'mainContactsName',
                    'userName',
                    'createTime'
                ];
                fields.push(this.uniqField);

                // 是否显示关联已有联系人列
                if (this.able_linkContact) {
                    fields.unshift('linkConfirm');
                }

                return this.allColumns.filter(item => fields.includes(item.key));
            },
            // 是否显示"关联已有联系人"操作
            able_linkContact() {
                // 有接口请求所需数据
                return this.clueId && this.targetType && this.targetId;
            },
            // 线索来源类型
            targetType() {
                let result;

                switch (this.type) {
                    case 'xhl_chat':
                    case 'visitorHistory':
                    case 'webMsg':
                        // 聊天框/小屏聊天框
                        // 访客历史详情页
                        // 网站留言详情页
                        result = 1;
                        break;
                    case 'facebook':
                    case 'fb_leads':
                        // facebook leads 详情页
                        // fb_message.vue 中有 'fb_leads', 疑似已废弃
                        result = 11;
                        break;
                    case 'google':
                        // 闭环优化管理相关, 产品说可忽略
                        break;
                    case 'fb_comment':
                        // FB 评论
                        result = 12;
                        break;
                    case 'fb_chat':
                    case 'floating_fb':
                        // FB 私信
                        // FB 私信小屏
                        result = 2;
                        break;
                    default:
                        // 默认'手动创建线索', 视作直接新建线索并保存询盘
                        result = 3;
                        break;
                }

                return result;
            },
            // 线索来源的数据 id
            targetId() {
                let result;

                switch (this.type) {
                    case 'xhl_chat':
                    case 'visitorHistory':
                    case 'webMsg':
                        // 聊天框/小屏聊天框
                        // 访客历史详情页
                        // 网站留言详情页
                        result = this.json_data ? this.json_data.proj : '';
                        break;
                    case 'facebook':
                    case 'fb_leads':
                        // facebook leads 详情页
                        // fb_message.vue 中有 'fb_leads', 疑似已废弃
                        result = this.json_data ? this.json_data.leadsId : '';
                        break;
                    case 'google':
                        // 闭环优化管理相关, 产品说可忽略
                        result = '';
                        break;
                    case 'fb_comment':
                        // FB 评论
                        result = this.commentId;
                        break;
                    case 'fb_chat':
                    case 'floating_fb':
                        // FB 私信
                        // FB 私信小屏
                        result = this.conversationId;
                        break;
                    default:
                        // 默认'手动创建线索', 视作直接新建线索并保存询盘
                        result = this.clueId;
                        break;
                }

                return result;
            }
        },
        data() {
            return {
                loading: true,
                tableFirstShow: true,

                // 表格
                tableData: [],
                allColumns: [
                    {
                        title: this.$t('crm.Modal.corp_companyName'),
                        key: 'companyName',
                        width: 160
                    },
                    {
                        title: this.$t('crm.Modal.contact_nickName'),
                        key: 'mainContactsName',
                        width: 120
                    },
                    {
                        title: this.$t('crm.Modal.contact_email'),
                        key: 'email',
                        width: 200
                    },
                    {
                        title: this.$t('crm.Modal.contact_phone'),
                        key: 'phone',
                        width: 200
                    },
                    {
                        title: this.$t('crm.Modal.contact_instagram'),
                        key: 'Instagram',
                        width: 200
                    },
                    {
                        title: this.$t('crm.Modal.contact_whatsApp'),
                        key: 'WhatsApp',
                        width: 200
                    },
                    {
                        title: this.$t('crm.Modal.managers'),
                        key: 'userName',
                        width: 100,
                        formatter: row => {
                            return row.userName || this.$t('crm.Modal.highseasInquiry');
                        }
                    },
                    {
                        title: this.$t('crm.Modal.createTime'),
                        key: 'createTime',
                        width: 180,
                        formatter: row => {
                            return `${this.$options.filters.timeFormat(row.createTime)}\n${this.$options.filters.timeFormat(row.createTime, 'Time')}`;
                        }
                    },
                    {
                        title: this.$t('crm.Modal.linkConfirm'),
                        key: 'linkConfirm',
                        width: 90
                    }
                ],

                // 被关联的联系人
                selectedContact: {}
            };
        },
        methods: {
            // 弹框打开回调
            handleOpen() {
                // 请求表格数据
                this.getTableData(this.uniqVal);

                // 初次显示此页面时弹出表格内容可复制提示
                if (this.tableFirstShow) {
                    this.tableFirstShow = false;
                    this.$Message.info({
                        message: this.$t('crm.Modal.tip_canCopy'),
                        duration: 3000
                    });
                }
            },
            // 弹框关闭回调
            handleClose() {
                this.loading = true;
                this.tableData = [];
                this.selectedContact = {};
            },

            // 复制表格内容
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
            async getTableData(value) {
                if (value.trim()) {
                    // 清空数据, 显示 loading
                    this.loading = true;
                    this.tableData = [];

                    // 组装发送数据
                    const params = {
                        orgId: this.enterpriseId
                    };
                    switch (this.uniqField) {
                        case 'email':
                            params.email = value.trim();
                            break;
                        case 'phone':
                            params.phone = value.trim();
                            break;
                        case 'WhatsApp':
                            params.whatsApp = value.trim();
                            break;
                        case 'Instagram':
                            params.instagram = value.trim();
                            break;
                    }

                    // 发送请求
                    const data = await getContactRepeatData(params);

                    if (data.code === '1') {
                        if (Array.isArray(data.data) && data.data.length) {
                            this.tableData = data.data.map(item => {
                                return Object.assign(item, {
                                    WhatsApp: item.whatsapp,
                                    Instagram: item.instagram
                                });
                            });

                            // 选中第一项
                            if (this.able_linkContact && this.tableData[0]) {
                                this.selectContact(this.tableData[0]);
                            }
                        }
                    } else {
                        this.$Message.error(this.langObj.errorGetDataTip);
                    }
                    this.loading = false;
                } else {
                    this.$Message.error(this.langObj.emptyParamTip);
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
            },
            // 选中联系人
            selectContact(row) {
                this.selectedContact = Object.assign({}, row);
            },

            /* 底部 */
            // 关闭弹窗
            cancel() {
                this.$emit('update:visible', false);
            },
            // 关联已有联系人
            linkContact() {
                // 检查是否有选中联系人, 无则报错并退出流程
                if (!this.selectedContact.contactsId) {
                    this.$Message.error(this.$t('crm.Modal.error_selectExistedContacts'));
                    return;
                }

                // 发送请求
                this.loading = true;
                util.ajaxJson({
                    url: '/crm/contactsAssociate/related',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        companyId: this.selectedContact.companyId,
                        inquiryId: this.selectedContact.inquiryId,
                        contactsId: this.selectedContact.contactsId,
                        email: this.selectedContact.email,
                        clueId: this.clueId,
                        targetType: this.targetType,
                        targetId: this.targetId,
                        formId: this.type === 'webMsg' ? this.json_data.id : ''
                    }
                }).then(({ data }) => {
                    if (data.code === '1') {
                        this.cancel();
                        this.$Message.success(this.$t('crm.Modal.success_linkContact'));
                        this.$emit('linkContactSuccess', this.selectedContact);
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_linkContact'));
                        this.loading = false;
                    }
                }).catch(error => {
                    console.error(error);
                    this.$Message.error(this.$t('crm.Modal.error_linkContact'));
                });
            }
        }
    };
</script>
