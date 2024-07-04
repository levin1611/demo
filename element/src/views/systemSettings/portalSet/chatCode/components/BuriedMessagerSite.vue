<template>
    <div>
        <div class="portal-set-block">
            <div>
                <div class="portal-set-block-tip">
                    {{ $t('portal_set.messengerTip') }}
                </div>
            </div>
            <div>
                <Button type="primary" @click="addNewRelevance">{{
                    $t('portal_set.addMessenger')
                }}</Button>
            </div>
        </div>
        <BuriedTable
            :tableData="fbData"
            :tableTitle="fbTitle"
            :tableProps="fbProps"
            :editItem="editItem"
            :deleteItem="deleteItem"
        />
        <!-- 编辑、新增关联 -->
        <Modal
            :visible.sync="newRelevance"
            :title="modalTitle"
            width="500px"
            :append-to-body="true"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            class="modal companydata"
        >
            <div>
                <Spin v-if="newRelevanceLoading" fix></Spin>
                <div class="modalTipsItem">
                    <div class="modalTips">
                        {{ $t('portal_set.facebookPersonalAccount') }}
                    </div>
                    <Select
                        v-model="accountName"
                        :label-in-value="true"
                        @change="changePageName"
                        filterable
                    >
                        <Option
                            v-for="item in accountNameList"
                            :key="`${item.accountId} ${item.userId}`"
                            :value="item.accountId + '+' + item.userId"
                            :label="item.accountName"
                        >
                            <span>{{ item.accountName }}</span>
                            <span v-if="item.reprtition"
                                >--{{ item.userName }}</span
                            >
                        </Option>
                    </Select>
                </div>
                <div class="modalTipsItem">
                    <div class="modalTips">
                        {{ $t('portal_set.facebookHomepage') }}
                    </div>
                    <Select
                        v-model="pageName"
                        :label-in-value="true"
                        @change="FBchangePage"
                    >
                        <Option
                            v-for="item in pageNameList"
                            :key="`${item.pageId} ${item.pageName}`"
                            :value="item.pageId"
                            :label="item.pageName"
                            >{{ item.pageName }}</Option
                        >
                    </Select>
                </div>
                <div class="modalTipsItem">
                    <div class="modalTips">{{ $t('portal_set.website') }}</div>
                    <Select
                        v-model="website"
                        filterable
                        :label-in-value="true"
                        @change="FBchangeWeb"
                    >
                        <Option
                            v-for="(item, index) in websiteList"
                            :key="`${item.matomoSiteId} ${index}`"
                            :value="item.matomoSiteId"
                            :label="item.websiteUrl"
                            >{{ item.websiteUrl }}</Option
                        >
                    </Select>
                </div>
            </div>
            <div slot="footer">
                <Button @click="newRelevance = false">{{
                    $t('cancel')
                }}</Button>
                <Button
                    type="primary"
                    :loading="relevanceLoading"
                    @click="newRelevanceBtn"
                    :class="{
                        'chatinterfacesettings-addmessengerburiedpoint': updateId
                    }"
                    >{{ $t('confirm') }}</Button
                >
            </div>
        </Modal>
        <!-- 删除关联 -->
        <Modal
            :visible.sync="deleteConfirm"
            :modal-append-to-body="false"
            :close-on-click-modal="false"
            :title="$t('portal_set.blockUpConfirmTip')"
        >
            <p class="chat-code-txt">
                {{
                    $t('portal_set.deleteConfirmTop', {
                        delFB: delFB,
                        delWeb: delWeb
                    })
                }}
            </p>
            <div slot="footer">
                <Button @click="delCancel">{{ $t('cancel') }}</Button>
                <Button
                    type="primary"
                    @click="delRelation"
                    :loading="delLoading"
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
    name: 'BuriedMessagerSite',
    data() {
        return {
            fbData: [],
            fbTitle: {
                accountName: this.$t('portal_set.facebookPersonalAccount'),
                relevanceName: this.$t('portal_set.facebookHomepage'),
                website: this.$t('portal_set.website'),
                createUserName: this.$t('portal_set.creator'),
                createTime: this.$t('portal_set.creationTime'),
                setting: this.$t('portal_set.operation')
            },
            fbProps: {
                accountName: 'accountName',
                relevanceName: 'pageName',
                website: 'website',
                createUserName: 'createUserName',
                createTime: 'createTime'
            },
            deleteConfirm: false,
            delLoading: false,
            newRelevance: false,
            newRelevanceLoading: true,
            modalTitle: '',
            accountName: '',
            accountNameList: [],
            pageName: '',
            pageNameList: [],
            website: '',
            websiteList: [],
            delFB: '',
            delWeb: '',
            delId: '',
            relevanceLoading: false,
            updateId: ''
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
        this.getFbWebsiteRelations();
    },
    methods: {
        // 删除回调
        deleteItem(data) {
            this.toDeletRelation(data);
        },
        // 编辑回调
        editItem(data) {
            this.editFBMessager(data);
        },
        //            关联修改个人主页
        changePageName(data) {
            // console.log('changePageNam= ', data);
            if (data) {
                const currAccountId = data.value;
                this.pageName = '';
                this.currPageName = '';
                this.currPageId = '';
                this.accountNameList.map((item) => {
                    const stringId = `${item.accountId}+${item.userId}`;
                    if (stringId === currAccountId) {
                        this.pageNameList = item.pageList;
                        if (item.pageList.length > 0) {
                            this.pageName = item.pageList[0].pageName;
                            this.currPageName = item.pageList[0].pageName;
                            this.currPageId = item.pageList[0].pageId;
                        }
                    }
                });
                this.currAccountName = data.label;
                this.currAccountId = data.value.split('+')[0];
                this.currWebCreateUserId = data.value.split('+')[1];
            }
        },
        FBchangePage(data) {
            if (data) {
                this.currPageName = data.label;
                this.currPageId = data.value;
            }
        },
        FBchangeWeb(data) {
            if (data) {
                this.currWebsite = data.label;
                this.currMatomoSiteId = data.value;
            }
        },
        //          获取messenger网址配置列表接口，根据orgId
        getFbWebsiteRelations() {
            util.ajaxInternational({
                url: '/social/messengerWebsitRelation/getFbWebsiteRelations',
                method: 'get',
                params: {
                    orgId: this.enterpriseId
                }
            }).then((res) => {
                if (res.data.code === '1') {
                    this.refreshTable = false;
                    this.fbData = res.data.data;
                    this.$nextTick(() => {
                        this.refreshTable = true;
                    });
                }
                this.FBloading = false;
            });
        },
        delCancel() {
            this.delFB = '';
            this.delWeb = '';
            this.delId = '';
            this.deleteConfirm = false;
        },
        toDeletRelation(data) {
            this.delFB = data.pageName;
            this.delWeb = data.website;
            this.delId = data.id;
            this.deleteConfirm = true;
        },
        //            3.删除messenger配置接口
        delRelation() {
            this.delLoading = true;
            util.ajaxInternational({
                url: '/social/messengerWebsitRelation/delete',
                method: 'get',
                params: {
                    id: this.delId
                }
            }).then((res) => {
                if (res.data.code === '1') {
                    this.$Message.success(
                        this.$t('portal_set.associationDeleteSuccess')
                    );
                    this.getFbWebsiteRelations();
                    this.deleteConfirm = false;
                } else {
                    this.$Message.error(
                        this.$t('portal_set.associationDeleteFailed')
                    );
                }
                this.delLoading = false;
            });
        },
        /*
         * FB个人账号查重
         * 先获取重复的对象的id，再根据id标记重复的对象 */
        duplicateChecking(arr) {
            const obj1 = {}; // id：index
            const obj2 = {}; // 已知为重复的id：index
            for (let i = 0; i < arr.length; i++) {
                const accountId = arr[i].accountId;
                if (obj2.hasOwnProperty(accountId)) {
                    arr[i].reprtition = true;
                } else {
                    if (obj1.hasOwnProperty(accountId)) {
                        obj2[accountId] = i;
                        arr[i].reprtition = true;
                        arr[obj1[accountId]].reprtition = true;
                    } else {
                        obj1[accountId] = i;
                    }
                }
            }
            return arr;
        },
        //            添加Messenger与网址关系
        newRelevanceBtn() {
            if (this.newRelevanceLoading) {
                return false;
            }
            if (!this.currAccountName) {
                this.$Message.info(
                    this.$t('portal_set.facebookPersonalAccountRequired')
                );
                return false;
            }
            if (!this.currPageName) {
                this.$Message.info(
                    this.$t('portal_set.facebookHomepageRequired')
                );
                return false;
            }
            if (!this.currWebsite) {
                this.$Message.info(this.$t('portal_set.websiteRequired'));
                return false;
            }
            // 有updateId的时候为更新，没有则为新增
            this.relevanceLoading = true;
            if (this.updateId) {
                util.ajaxInternationalJson({
                    url: '/social/messengerWebsitRelation/update',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        id: this.updateId,
                        pageId: this.currPageId,
                        pageName: this.currPageName,
                        website: this.currWebsite,
                        matomoSiteId: this.currMatomoSiteId,
                        updateUserId: this.userId,
                        updateUserName: this.fullName,
                        accountName: this.currAccountName,
                        accountId: this.currAccountId,
                        webCreateUserId: this.currWebCreateUserId
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        this.FBloading = true;
                        this.getFbWebsiteRelations();
                        this.$Message.success(
                            this.$t('portal_set.editAssociationSuccess')
                        );
                        this.newRelevance = false;
                    } else {
                        this.$Message.error(
                            this.$t('portal_set.editAssociationFailed')
                        );
                    }
                    this.relevanceLoading = false;
                });
            } else {
                util.ajaxInternationalJson({
                    url: '/social/messengerWebsitRelation/add',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        pageId: this.currPageId,
                        pageName: this.currPageName, // 主页
                        website: this.currWebsite,
                        matomoSiteId: this.currMatomoSiteId,
                        createUserId: this.userId,
                        createUserName: this.fullName,
                        accountName: this.currAccountName, // 个人账号
                        accountId: this.currAccountId,
                        webCreateUserId: this.currWebCreateUserId
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        this.FBloading = true;
                        this.getFbWebsiteRelations();
                        this.$Message.success(
                            this.$t('portal_set.addAssociationSuccess')
                        );
                        this.newRelevance = false;
                    } else {
                        this.$Message.error(
                            this.$t('portal_set.addAassociationFailed')
                        );
                    }
                    this.relevanceLoading = false;
                });
            }
        },
        //            根据orgId查询个人账号及每个个人账号下的主页信息
        addNewRelevance() {
            this.modalTitle = this.$t('portal_set.addAssociation');
            this.updateId = '';
            this.newRelevance = true;
            this.getConfigListByOnlyOrgId(2, {}, {});
        },
        //            编辑FB messager关联
        editFBMessager(data) {
            this.modalTitle = this.$t('portal_set.editAssociation');
            // console.log('editFBMessager', data);
            this.newRelevance = true;

            /*                this.pageName = data.pageId;
                    this.website = data.matomoSiteId; */
            // 编辑时的初始值,参数
            this.updateId = data.id;
            this.currPageId = data.pageId;
            this.currPageName = data.pageName;
            this.currWebsite = data.website;
            this.currMatomoSiteId = data.matomoSiteId;
            this.currAccountName = data.accountName;
            this.currAccountId = data.accountId;
            this.currWebCreateUserId = data.webCreateUserId;
            // 编辑的时候需要把原本的网站数据重新放到请求的数据中
            const obj = {
                matomoSiteId: data.matomoSiteId,
                websiteUrl: data.website
            };

            this.getConfigListByOnlyOrgId(1, obj, data);
        },
        getNotDeployList(obj, data) {
            util.ajaxInternational({
                url: '/piwik/websiteSettings/getNotDeployList',
                method: 'get',
                params: {
                    orgId: this.enterpriseId
                }
            }).then((res) => {
                if (res.data.code === '1') {
                    this.websiteList = res.data.data;
                    if (JSON.stringify(obj) !== '{}') {
                        this.websiteList.unshift(obj);
                        this.website = '';
                        this.websiteList.forEach((item) => {
                            if (item.matomoSiteId === data.matomoSiteId) {
                                this.website = data.matomoSiteId;
                            }
                        });
                    }
                }
            });
        },
        getConfigListByOnlyOrgId(accountId, obj, data) {
            this.newRelevanceLoading = true;
            this.getNotDeployList(obj, data);
            util.ajaxInternational({
                url: '/oversea/oauth/getConfigListByOnlyOrgId',
                method: 'post',
                data: {
                    orgId: this.enterpriseId
                }
            }).then((res) => {
                if (res.data.code === '1') {
                    if (res.data.data) {
                        this.accountNameList = this.duplicateChecking(
                            res.data.data.accounts
                        );
                        if (accountId === 1) {
                            // select v-model绑定的值，option value设为id了，所以命名看起来有点奇怪
                            this.accountName = '';
                            this.pageNameList = [];
                            const tempAccountName = `${data.accountId}+${data.webCreateUserId}`;
                            // console.log('this.accountName= ', this.accountName);
                            this.accountNameList.map((item) => {
                                const tempId = `${item.accountId}+${item.userId}`;
                                // console.log('tempId= ', tempId);
                                if (tempId === tempAccountName) {
                                    this.accountName = tempAccountName;
                                    this.pageNameList = item.pageList;
                                }
                            });
                            this.pageName = '';
                            this.pageNameList.forEach((item) => {
                                if (item.pageId === data.pageId) {
                                    this.pageName = data.pageId;
                                }
                            });
                            // console.log('this.pageName= ', this.pageName);
                        }
                    }
                }
                this.newRelevanceLoading = false;
            });
        }
    },
    watch: {
        newRelevance(val) {
            if (!val) {
                this.accountName = '';
                this.pageName = '';
                this.website = '';

                this.updateId = '';
                this.currPageId = '';
                this.currPageName = '';
                this.currWebsite = '';
                this.currMatomoSiteId = '';
                this.currAccountName = '';
                this.currAccountId = '';
            }
        }
    }
};
</script>

<style lang="less" scoped>
.modalTips{
    width: 120px;
}
</style>