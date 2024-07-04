<template>
    <div>
        <Modal :title="$t('crm.Modal.title_sendMail')"
               :visible="modalShow"
               width="600px"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :modal-append-to-body="false"
               class="modal">
            <!-- loading -->
            <Spin v-if="loading"
                  fix></Spin>

            <div class="container" v-if="contactList.length">
                <div class="contacts-header">
                    <Row :gutter="16">
                        <Col :span="2">
                        <Checkbox :disabled="!contactList.length"
                                  :value="checkAll"
                                  @change="handleCheckAll"></Checkbox>
                        </Col>
                        <Col :span="13">{{ $t('crm.Modal.title_contact') }}</Col>
                        <Col :span="9">{{ $t('crm.Modal.corp_companyName') }}</Col>
                    </Row>
                </div>
                <div class="contacts-content">
                    <Row v-for="contact in contactList"
                         :key="contact.id"
                         :gutter="16">
                        <Col :span="2">
                        <Checkbox v-model="contact.checked"></Checkbox>
                        </Col>
                        <Col :span="13">
                        <TooltipAuto :content="`${ contact.nickName }<${ contact.email }>`"></TooltipAuto>
                        </Col>
                        <Col :span="9">
                        <TooltipAuto :content="companyName"></TooltipAuto>
                        </Col>
                    </Row>
                </div>
            </div>
            <div class="container" style="text-align:center" v-else>
                {{ $t('crm.Table.noData')}}
            </div>
            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
                <Button type="primary"
                        @click="ok"
                        class="piwik_send_mail">
                    {{ $t('crm.Modal.modal_save') }}
                </Button>
            </div>
        </Modal>
        <!--打开发送邮件页面-->
        <replyMailModal
                :visible.sync="replyMailVisible"
                ref="replyMailModal"
        ></replyMailModal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import replyMailModal from '@/views/main-components/timeline/Components/replyMailModal';

    export default {
        name: 'sendMail',
        props: [
            'visible',
            'id',
            'type',
            'companyName'
        ],
        components: { replyMailModal },
        data() {
            return {
                loading: false,
                modalShow: false,

                // 联系人列表
                contactList: [],
                replyMailVisible: false
            };
        },
        computed: {
            ...mapState([
                'enterpriseId'
            ]),
            checkAll() {
                if (this.contactList.length) {
                    return this.contactList.every(item => {
                        return item.checked === true;
                    });
                }
                return false;
            }
        },
        methods: {
            ok() {
                if (this.contactList.length && this.contactList.some(item => item.checked === true)) {
                    // 获取所有已勾选邮件
                    const emails = this.contactList.filter(item => item.checked === true).map(item => {
                        return {
                            receiverName: item.nickName || '',
                            receiveMailAddress: item.email,
                            followUpId: `${this.id}`,
                            followUpType: this.type === 'customer' ? 3 : 2
                        };
                    });

                    // 关闭弹窗
                    this.cancel();

                    // 只有一个联系人时, 点击外部发送邮件按钮直接跳转询盘
                    if (this.contactList.length === 1) {
                        localStorage.setItem('leadsCloud-sendMail-contacts', JSON.stringify(emails));
                        // 打开写信弹窗之前先判断有没有已经打开的写信弹窗
                        const doc = document.getElementById('mail_detail_modal');
                        if (!doc) {
                            this.replyMailVisible = true;
                        }
                        return;
                    }

                    // 跳转到发件页面
                    setTimeout(() => {
                        localStorage.setItem('leadsCloud-sendMail-contacts', JSON.stringify(emails));
                        this.replyMailVisible = true;
                    }, 1500);
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_beforeJumpToMail'));
                }
            },
            cancel() {
                this.$emit('update:visible', false);
            },
            getContacts() {
                // 清空原有联系人数据
                this.contactList = [];

                // 根据进入方式的不同请求不同的接口
                let url = '';
                const data = {
                    orgId: this.enterpriseId
                };
                switch (this.type) {
                    case 'inquiry':
                        url = '/crm/contacts/getListByInquiry';
                        data.inquiryId = this.id;
                        break;
                    case 'customer':
                        url = '/crm/contacts/getContactsNameListByCompany';
                        data.companyId = this.id;
                }
                if (!url) {
                    this.$Message.error(this.$t('crm.Html.errorOccurred'));
                    return;
                }

                // 发送请求
                util.ajax({
                    url,
                    method: 'post',
                    data
                }).then(response => {
                    if (response.data.code === '1') {
                        // 不同请求接口返回数据结构不一致, 处理数据
                        let arr = [];
                        if (Array.isArray(response.data.data)) {
                            arr = response.data.data.filter(item => item.email);
                        } else if (Array.isArray(response.data.data.list)) {
                            arr = response.data.data.list.filter(item => item.email);
                        }
                        this.contactList = arr.map(item => {
                            const { nickName, email } = item;
                            const checked = false;
                            return { nickName, email, checked };
                        });

                        // 只有一个邮箱时自动选中并跳转到发件页面
                        if (this.contactList.length === 1) {
                            this.handleCheckAll(true);
                            this.ok();
                        }
                    } else {
                        // 弹出错误提示
                        this.$Message.error(this.$t('crm.Modal.error_getContactList'));
                    }

                    this.modalShow = true;
                    this.loading = false;
                }, error => {
                    this.modalShow = true;
                    this.loading = false;
                }).catch(error => {
                    this.modalShow = true;
                    this.loading = false;
                });
            },
            handleCheckAll(val) {
                this.contactList.forEach(item => {
                    item.checked = val;
                });
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    this.loading = true;
                    this.getContacts();
                } else {
                    this.modalShow = false;
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .container {
        padding: 40px 20px;
        font-size: 14px;
    }

    .contacts-header {
        font-weight: bolder;
        margin-bottom: 20px;
    }

    .contacts-content {
        & > div {
            line-height: 45px;
            border-bottom: 1px solid gainsboro;
        }
    }
</style>
