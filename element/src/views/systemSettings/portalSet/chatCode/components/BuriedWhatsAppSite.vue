<template>
    <div>
        <div class="portal-set-block">
            <div>
                <div class="portal-set-block-tip">
                    {{ $t('portal_set.whatsAppTip') }}
                </div>
            </div>
            <div>
                <Button type="primary" @click="addRelevance">{{
                    $t('portal_set.addMessenger')
                }}</Button>
            </div>
        </div>
        <BuriedTable
            :tableData="waData"
            :tableTitle="waTitle"
            :tableProps="waProps"
            :editItem="editItem"
            :deleteItem="deleteItem"
        />
        <!-- 删除关联 -->
        <Modal
            :visible.sync="deleteConfirm"
            :modal-append-to-body="false"
            :title="$t('portal_set.blockUpConfirmTip')"
            :close-on-click-modal="false"
        >
            <p class="chat-code-txt">
                {{ deleteConfirmTips }}
            </p>
            <div slot="footer">
                <Button @click="deleteCancelFn">{{ $t('cancel') }}</Button>
                <Button type="primary" @click="deleteConfirmFn">{{
                    $t('confirm')
                }}</Button>
            </div>
        </Modal>
        <!-- 编辑、新增关联 -->
        <!-- TODO -->
        <Modal
            :visible.sync="relevanceModal"
            :title="relevanceTitle"
            width="500px"
            :append-to-body="true"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            class="modal companydata"
            :destroy-on-close="true"
            @close="closeReleaseModal"
        >
            <div>
                <!-- <Spin v-if="true" fix></Spin> -->
                <div class="modalTipsItem">
                    <div class="modalTips">
                        {{ $t('portal_set.leadsCloudAccount') }}
                    </div>
                    <Select
                        v-model="accountName"
                        :label-in-value="true"
                        @change="changeAccountName"
                        filterable
                    >
                        <Option
                            v-for="item in accountNameList"
                            :value="item.id"
                            :label="item.cnName"
                            :key="item.id"
                        >
                        </Option>
                    </Select>
                </div>
                <div class="modalTipsItem">
                    <div class="modalTips">
                        {{ $t('portal_set.whatsAppAccount') }}
                    </div>
                    <Select
                        v-model="waName"
                        :label-in-value="true"
                        @change="waChange"
                        :disabled="accountName === ''"
                    >
                        <Option
                            v-for="item in waNameList"
                            :key="item.whatsappAccount"
                            :value="item.whatsappAccount"
                            :label="item.whatsappAccount"
                        ></Option>
                    </Select>
                </div>
                <div class="modalTipsItem" v-if="!editStatus">
                    <div class="modalTips">{{ $t('portal_set.website') }}</div>
                    <Select
                        v-model="website"
                        :label-in-value="true"
                        filterable
                        @change="webChange"
                        :disabled="waName === ''"
                        multiple
                    >
                        <Option
                            v-for="item in websiteList"
                            :key="item.matomoSiteId"
                            :value="item.matomoSiteId"
                            :label="item.webSiteUrl"
                            >{{ item.webSiteUrl }}</Option
                        >
                    </Select>
                </div>
                <div class="modalTipsItem" v-else>
                    <div class="modalTips">{{ $t('portal_set.website') }}</div>
                    <Select
                        v-model="website"
                        :label-in-value="true"
                        filterable
                        @change="webChange"
                        :disabled="waName === ''"
                    >
                        <Option
                            v-for="item in websiteList"
                            :key="item.matomoSiteId"
                            :value="item.matomoSiteId"
                            :label="item.webSiteUrl"
                            >{{ item.webSiteUrl }}</Option
                        >
                    </Select>
                </div>
            </div>
            <div slot="footer">
                <Button @click="closeReleaseModal">{{ $t('cancel') }}</Button>
                <Button
                    type="primary"
                    @click="relevanceFn"
                    :class="{
                        'chatinterfacesettings-addmessengerburiedpoint': deleteId
                    }"
                    >{{ $t('confirm') }}</Button
                >
            </div>
        </Modal>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import util from '@/libs/util';
import BuriedTable from './BuriedTable';

export default {
    name: 'BuriedWhatsAppSite',
    data() {
        return {
            waData: [],
            waTitle: {
                accountName: this.$t('portal_set.leadsCloudAccount'),
                relevanceName: this.$t('portal_set.whatsAppAccount'),
                website: this.$t('portal_set.website'),
                createUserName: this.$t('portal_set.creator'),
                createTime: this.$t('portal_set.creationTime'),
                setting: this.$t('portal_set.operation')
            },
            waProps: {
                accountName: 'accountName',
                relevanceName: 'chatAccount',
                website: 'website',
                createUserName: 'createUserName',
                createTime: 'createTime'
            },
            deleteId: '',
            deleteConfirmTips: '',
            deleteConfirm: false,
            relevanceModal: false,
            relevanceTitle: '',
            accountNameList: [],
            accountName: '',
            waNameList: [],
            waName: '',
            websiteList: [],
            website: '',
            waRelevanceData: {},
            editStatus: false
        };
    },
    components: {
        BuriedTable
    },
    computed: {
        ...mapState({
            enterpriseId: (state) => state.enterpriseId,
            userId: (state) => state.userId,
            fullName: (state) => state.fullName,
            userName: (state) => state.userName
        })
    },
    created() {
        this.getWhatsAppList();
    },
    methods: {
        // 获取whatsapp关联列表
        getWhatsAppList() {
            util.ajaxHkJson({
                url: '/social/websiteChatRelation/getFbWebsiteRelations',
                method: 'get',
                params: {
                    orgId: this.enterpriseId,
                    type: 1
                }
            })
                .then((res) => {
                    this.waData = res.data.data;
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        // 新增whatsapp关联
        addRelevance() {
            this.getWebList();
            this.relevanceTitle = this.$t('portal_set.addAssociation');
            this.getAccountList();
            this.editStatus = false;
            this.accountName = '';
            this.waName = '';
            this.website = '';
            this.relevanceModal = true;
        },
        // 表格编辑回调
        editItem(data) {
            this.editStatus = true;
            this.getWebList();
            this.updateId = data.id;
            this.accountName = data.accountName;
            this.waName = data.chatAccount;
            this.website = data.website;
            this.relevanceModal = true;
            this.relevanceTitle = this.$t('portal_set.editAssociation');
            this.getAccountList();
            this.getWhatsAppDataList(data.accountId);
            this.waRelevanceData = {
                // websites: [
                //     { matomoSiteId: data.matomoSiteId, webURL: data.website }
                // ],
                website: data.website,
                matomoSiteId: data.matomoSiteId,
                accountId: data.accountId,
                accountName: data.accountName,
                chatAccount: data.chatAccount
            };
        },
        // 关闭删除提示
        deleteCancelFn() {
            this.deleteConfirm = false;
        },
        // 表格删除回调
        deleteItem(data) {
            this.deleteConfirmTips = this.$t('portal_set.deleteConfirmWA', {
                delTypeName: data.chatAccount,
                delWebName: data.website
            });
            this.deleteId = data.id;
            this.deleteConfirm = true;
        },
        // 删除关联
        deleteConfirmFn() {
            util.ajaxHkJson({
                url: '/social/websiteChatRelation/delete',
                method: 'get',
                params: {
                    id: this.deleteId
                }
            })
                .then((res) => {
                    if (res.data.code === '1') {
                        this.$Message.success(
                            this.$t('portal_set.associationDeleteSuccess')
                        );
                        this.getWhatsAppList();
                    } else {
                        this.$Message.error(
                            this.$t('portal_set.associationDeleteFailed')
                        );
                    }
                    this.deleteCancelFn();
                    this.deleteId = '';
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        // 关闭关联
        closeReleaseModal() {
            this.relevanceModal = false;
            this.editStatus = false;
            this.accountName = '';
            this.waName = '';
            this.website = '';
        },
        // 获取询盘云账号列表
        getAccountList() {
            util.ajaxLeadscloud({
                url: '/v2-privilege/polymerization/getValidUserIdByOrgId',
                method: 'get',
                params: {
                    orgId: this.enterpriseId,
                    bindWa: true
                }
            })
                .then((res) => {
                    this.accountNameList = res.data.data;
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        // 切换询盘云账号
        changeAccountName(val) {
            this.getWhatsAppDataList(val.value);
            this.waRelevanceData.accountId = val.value;
            this.waRelevanceData.accountName = val.label;
        },
        // 获取WhatsApp账号
        getWhatsAppDataList(userId) {
            util.ajaxWAJson({
                url: '/whatsapp/waUserBind/getWaUserBind',
                method: 'get',
                params: {
                    orgId: this.enterpriseId,
                    userId: userId
                }
            })
                .then((res) => {
                    this.waNameList = res.data.data;
                    this.waName = res.data.data[0].whatsappAccount;
                    this.waRelevanceData.chatAccount =
                        res.data.data[0].whatsappAccount;
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        // 改变wa账号
        waChange(val) {
            this.waRelevanceData.chatAccount = val.value;
        },
        // 获取买点网站列表
        getWebList() {
            util.ajaxHkJson({
                url: '/social/websiteChatRelation/notUseWebsite/list',
                method: 'get',
                params: {
                    orgId: this.enterpriseId,
                    type: 1
                }
            })
                .then((res) => {
                    this.websiteList = res.data.data;
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        // 选择网站
        webChange(val) {
            if (this.editStatus) {
                this.waRelevanceData.website = val.label;
                this.waRelevanceData.matomoSiteId = val.value;
            } else {
                const websites = val.map((item) => {
                    const result = this.websiteList.filter(
                        (cItem) => cItem.matomoSiteId === item
                    );
                    return {
                        matomoSiteId: result[0].matomoSiteId,
                        webURL: result[0].webSiteUrl
                    };
                });
                this.waRelevanceData.websites = websites;
            }
        },
        relevanceFn() {
            if (!this.accountName === '') {
                this.$Message.info(this.$t('portal_set.accountRequired'));
                return false;
            }
            if (!this.waName === '') {
                this.$Message.info(
                    this.$t('portal_set.whatsappAccountRequired')
                );
                return false;
            }
            if (!this.website === '') {
                this.$Message.info(this.$t('portal_set.websiteRequired'));
                return false;
            }
            this.relevanceTitle === this.$t('portal_set.addAssociation')
                ? this.addRelevanceFn()
                : this.updateRelevanceFn();
        },
        // 新增关联
        addRelevanceFn() {
            this.waRelevanceData.orgId = this.enterpriseId;
            this.waRelevanceData.type = 1;
            util.ajaxHkJson({
                url: '/social/websiteChatRelation/add',
                method: 'post',
                data: this.waRelevanceData
            })
                .then((res) => {
                    if (res.data.code === '1') {
                        this.closeReleaseModal();
                        this.getWhatsAppList();
                        this.$Message.success(
                            this.$t('portal_set.addAssociationSuccess')
                        );
                    } else {
                        this.$Message.error(
                            this.$t('portal_set.addAassociationFailed')
                        );
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        // 更新关联
        updateRelevanceFn() {
            this.waRelevanceData.orgId = this.enterpriseId;
            this.waRelevanceData.type = 1;
            this.waRelevanceData.id = this.updateId;
            // this.waRelevanceData.website = this.waRelevanceData.websites[0].webURL;
            // this.waRelevanceData.matomoSiteId = this.waRelevanceData.websites[0].matomoSiteId;
            delete this.waRelevanceData.websites
            util.ajaxHkJson({
                url: '/social/websiteChatRelation/update',
                method: 'post',
                data: this.waRelevanceData
            }).then((res) => {
                if (res.data.code === '1') {
                    this.closeReleaseModal();
                    this.getWhatsAppList();
                    this.$Message.success(
                        this.$t('portal_set.editAssociationSuccess')
                    );
                } else {
                    this.$Message.error(
                        this.$t('portal_set.editAssociationFailed')
                    );
                }
            });
        }
    }
};
</script>

<style lang="less" scoped>
.modalTips{
    width: 120px;
}
</style>
