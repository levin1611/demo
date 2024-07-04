<template>
    <div class="portal-box">
        <div class="portal-set-block">
            <div>
                <div class="portal-set-block-title">
                    {{ $t('portal_set.websiteSettingsTitle') }}
                </div>
                <div class="portal-set-block-tip">
                    {{ $t('portal_set.websiteSettingsTip') }}
                </div>
            </div>
            <div>
                <Button type="primary" @click="addWebModal">{{
                    $t('portal_set.addWebsite')
                }}</Button>
            </div>
        </div>
        <div class="portal-set-table table edittable-table-height-con">
            <Table
                class="tabmain noBoxShadow-right noborder-table"
                v-loading="webDataLoading"
                :data="webDataList"
                size="medium"
                highlight-current-row
                style="width: 100%"
            >
                <template>
                    <TableColumn
                        prop="websiteUrl"
                        :label="$t('portal_set.website')"
                        width="300"
                        show-overflow-tooltip
                    >
                    </TableColumn>
                    <TableColumn
                        prop="createUser"
                        :label="$t('portal_set.creator')"
                        width="180"
                        show-overflow-tooltip
                    >
                    </TableColumn>
                    <TableColumn
                        prop="createTime"
                        :label="$t('portal_set.creationTime')"
                        width="200"
                        show-overflow-tooltip
                    >
                        <template slot-scope="{ row }">
                            <span>{{
                                row.createTime | timeFormat('DateTime')
                            }}</span>
                        </template>
                    </TableColumn>
                    <TableColumn
                        prop="useStatus"
                        :label="$t('portal_set.status')"
                        width="100"
                    >
                        <template slot-scope="{ row }">
                            <el-switch
                                v-model="row.useStatus"
                                @change="changeWebStatus($event, row)"
                                :active-value="1"
                                :inactive-value="0"
                                active-color="#409EFF"
                                inactive-color="#DCDFE6"
                            ></el-switch>
                        </template>
                    </TableColumn>
                    <TableColumn
                        prop="configStatus"
                        :label="$t('portal_set.configurationStatus')"
                        width="100"
                        show-overflow-tooltip
                    >
                        <template slot-scope="{ row }">
                            <span>{{
                                row.configStatus === 1
                                    ? $t('portal_set.completedConfiguration')
                                    : $t('portal_set.inConfiguration')
                            }}</span>
                        </template>
                    </TableColumn>
                    <!-- 操作列 -->
                    <TableColumn
                        :label="$t('portal_set.operation')"
                        width="180"
                        show-overflow-tooltip
                    >
                        <template slot-scope="{ row }">
                            <!-- 埋点代码 -->
                            <span v-if="row.configStatus === 1"
                                  @click="codeShow = true"
                                  style="margin-right: 20px;"
                                  class="_link_push _font_size12">
                                {{ $t('portal_set.chatingCode') }}
                            </span>
                            <!-- 聊天窗设置 -->
                            <span @click="handleEditSettings(row)"
                                  class="_link_push _font_size12">
                                {{ $t('portal_set.chatDialogSettings') }}
                            </span>
                        </template>
                    </TableColumn>
                </template>
            </Table>
        </div>
        <Modal
            :visible.sync="changeTipsModal"
            :title="$t('portal_set.blockUpConfirmTip')"
            :show-close="false"
            :modal-append-to-body="false"
        >
            <p>{{ changeTips }}</p>
            <div slot="footer">
                <Button @click="closeChangeStatusModal">{{
                    $t('cancel')
                }}</Button>
                <Button type="primary" @click="changeStatus(0)">{{
                    $t('confirm')
                }}</Button>
            </div>
        </Modal>
        <Modal
            :visible.sync="codeShow"
            :title="$t('portal_set.js_code')"
            :modal-append-to-body="false"
            class="modal companydata transfer-modal"
        >
            <textarea class="js-code" v-model="jscode"></textarea>
            <div class="code-tip">{{ $t('portal_set.code_tip') }}</div>
            <div slot="footer">
                <Button @click="codeShow = false">{{ $t('cancel') }}</Button>
                <Button
                    type="primary"
                    v-clipboard:copy="jscode"
                    v-clipboard:success="onCopy"
                    v-clipboard:error="onError"
                    >{{ $t('portal_set.copy') }}
                </Button>
            </div>
        </Modal>
        <Modal
            :visible.sync="addWeb"
            :title="$t('portal_set.addWebsite')"
            width="500px"
            :append-to-body="true"
            :modal-append-to-body="false"
            class="modal companydata"
        >
            <div style="margin: 10px 0 15px">
                <span class="chat-code-txt" style="margin-right: 5px">{{
                    $t('portal_set.chatCodeTip')
                }}</span>
                <Tooltip
                    :content="$t('portal_set.chatCodeToolTip')"
                    max-width="200"
                    placement="top"
                >
                    <Icon custom="custom custom-tip" size="14"></Icon>
                </Tooltip>
            </div>
            <div style="height: 70px; display: flex">
                <div class="modalTips chat-code-txt">
                    {{ $t('portal_set.website') }}：
                </div>
                <Input v-model="webURL" />
            </div>
            <div slot="footer">
                <Button @click="cancelBtn">{{ $t('cancel') }}</Button>
                <Button
                    type="primary"
                    :loading="addWebLoading"
                    @click="addWebBtn"
                    class="chatinterfacesettings-adddomainname"
                    >{{ $t('confirm') }}</Button
                >
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'BuriedSite',
        props: {
            currDomain: {
                type: String
            }
        },
        data() {
            return {
                webDataList: [],
                webDataLoading: false,
                changeTipsModal: false,
                changeTips: '',
                statusId: '',
                webStatus: false,
                codeShow: false,
                jscode: 'loading...',
                addWeb: false,
                webURL: '',
                addWebLoading: false
            };
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
            this.getBuriedData();
            this.getCode();
        },
        methods: {
            // 新增网站
            addWebBtn() {
                /* 匹配域名，且不以‘www.’为开头 */
                const reg = new RegExp(/^(?=^.{3,255}$)(?!www\.)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/);
                if (this.webURL.length === 0) {
                    this.$Message.info(this.$t('portal_set.domainNameRequired'));
                    return false;
                }
                if (!reg.test(this.webURL)) {
                    this.$Message.info(this.$t('portal_set.domainNameError'));
                    return false;
                }
                if (this.webURL) {
                    this.addWebLoading = true;
                    util.ajaxInternationalJson({
                        url: '/piwik/websiteSettings/save',
                        method: 'post',
                        data: {
                            orgId: this.enterpriseId,
                            websiteUrl: this.webURL,
                            websiteUrlPrefix: this.webURLHeader,
                            createUserId: this.userId,
                            createUser: this.fullName
                        }
                    })
                        .then((res) => {
                            if (res.data.code === '1') {
                                this.$Message.success(this.$t('portal_set.addedWebsiteSuccess'));
                                this.addWeb = false;
                                this.getBuriedData();
                            } else {
                                switch (res.data.error_code) {
                                    case 24010005:
                                        this.$Message.error(this.$t('portal_set.domainNameExisted_thisOrgId'));
                                        break;
                                    case 24010006:
                                        this.$Message.error(this.$t('portal_set.domainNameExisted_otherOrgId'));
                                        break;
                                    default:
                                        this.$Message.error(this.$t('portal_set.addedWebsiteFail'));
                                }
                            }
                            this.addWebLoading = false;
                        })
                        .catch(() => {
                            this.$Message.error(this.$t('portal_set.addedWebsiteFail'));
                            this.addWebLoading = false;
                        });
                } else {
                    this.$Message.info(this.$t('portal_set.domainNameRequired'));
                }
            },
            cancelBtn() {
                this.addWeb = false;
            },
            addWebModal() {
                this.webURL = '';
                this.addWeb = true;
            },
            // 获取聊天代码
            getCode() {
                util.ajax({
                    url: '/form-cust/burypoint/getConfigByOrgId',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        let codeStr = res.data.data.chat.htmlContent;
                        codeStr = codeStr.replace('https://lib.leadscloud.com', util.buriedUrl);

                        this.jscode = codeStr;
                    } else {
                        this.jscode = this.$t('portal_set.get_code_failed');
                    }
                });
            },
            onCopy() {
                const jsCode = document.getElementsByClassName('js-code')[0];
                jsCode.select();
                this.$Message.success(this.$t('portal_set.copy_success'));
            },
            onError() {
                this.$Message.error(this.$t('portal_set.copy_failed'));
            },
            showCodeModal() {
                this.codeShow = true;
            },
            // 请求买点网站列表
            getBuriedData() {
                this.webDataLoading = true;
                this.webDataList = [];
                util.ajaxInternational({
                    url: '/piwik/websiteSettings/getList',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        this.webDataList = res.data.data;
                    }
                    this.webDataLoading = false;
                });
            },
            // 改变网站状态
            changeWebStatus(status, data) {
                // status 1: 配置状态开启 0：配置状态关闭
                this.statusId = data.id;
                this.webStatus = status === 1;
                if (status) {
                    this.changeStatus(status);
                } else {
                    // 状态关闭提示弹窗
                    this.changeTips = `${this.$t('portal_set.disableWebsiteConfirm')} ${data.websiteUrl} ？${this.$t('portal_set.disableWebsiteConfirmTip')}`;
                    this.changeTipsModal = true;
                }
            },
            changeStatus(status) {
                util.ajaxInternationalJson({
                    url: '/piwik/websiteSettings/updateStatus',
                    method: 'post',
                    data: {
                        id: this.statusId,
                        useStatus: this.webStatus ? 1 : 2,
                        configStatus: ''
                    }
                }).then((res) => {
                    if (res.data.code === '1') {
                        if (this.webStatus) {
                            this.$Message.success(this.$t('portal_set.websiteEnableSuccess'));
                        } else {
                            this.$Message.success(this.$t('portal_set.websiteDisabledSuccess'));
                        }
                    } else {
                        if (this.webStatus) {
                            this.$Message.error(this.$t('portal_set.websiteEnableFailed'));
                        } else {
                            this.$Message.error(this.$t('portal_set.websiteDisabledFailed'));
                        }
                    }
                    this.changeTipsModal = false;
                });
            },
            // 取消状态修改操作
            closeChangeStatusModal() {
                this.changeTipsModal = false;
                this.getBuriedData();
            },

            // 编辑网站设置
            handleEditSettings(rowData) {
                // 更新"当前编辑设置的网站"
                this.$emit('update:currDomain', rowData.websiteUrl);
                // 切换到聊天窗设置组件
                this.$emit('update:buriedName', 'ChatDialogSettings');
            }
        }
    };
</script>

<style lang="scss" scoped>
    @import '~@/styles/moduleScss/portal-set/common';
    .chat-code-txt {
        color: rgba(0, 0, 0, 0.8);
    }

    .portal-set-block {
        display: flex;
        justify-content: space-between;
        padding: 20px 30px 0;
        margin: 0;

        &-title {
            font-size: 16px;
            color: rgba(0, 0, 0, 0.8);
            line-height: 24px;
        }

        &-tip {
            font-size: 12px;
            color: rgba(0, 0, 0, 0.6);
            line-height: 18px;
            margin: 8px 0;
        }
    }

    .modalTipsItem {
        display: flex;
        margin-bottom: 15px;

        .el-select {
            width: 100%;
        }
    }

    .modalTips {
        color: rgba(0, 0, 0, 0.8);
        width: 90px;
        line-height: 32px;
        font-size: 12px;
    }

    .operateTip:hover {
        color: #2d63bc;
    }
    .code-tip {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        margin-top: 15px;
    }

    .js-code {
        display: inline-block;
        border: 1px solid #d9d9d9;
        width: 100%;
        height: 300px;
        vertical-align: top;
        overflow: auto;
    }

    .js-code::-webkit-scrollbar {
        width: 4px;
        height: 10px;
        background-color: #c9c9c9;
    }

    .js-code::-webkit-scrollbar-track {
        -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
        border-radius: 2px;
        background-color: #c9c9c9;
    }

    .js-code::-webkit-scrollbar-thumb {
        border-radius: 5px;
        -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
        background-color: #fc8b2f;
    }
    .portal-box {
        height: calc(100% - 84px);
        overflow-y: auto;
    }
</style>
