<template>
    <div class="openApi-set" v-loading="loading">
        <h3 class="header">{{$t('openApi.title')}}</h3>
        <div class="openApi-set-box">
            <p>{{$t('openApi.illustrate1')}}</p>
            <p>{{$t('openApi.illustrate2')}}<a target="_blank" href="https://www.yuque.com/help.leadscloud/faq_guide/cp589xdhfs0qzodp">{{$t('openApi.illustrate2Href')}}</a></p>
        </div>
        <h3 class="header">{{$t('openApi.title2')}}</h3>
        <div class="openApi-set-box">
            <div v-if="openStatus">
                <Form :inline="true" ref="openForm" label-position="left">
                    <FormItem label="AppID">
                        <Input v-model="openForm.appID" disabled style="width: 200px; margin-right:60px" ></Input>
                    </FormItem>
                    <FormItem label="AppSecret">
                        <Input v-model="openForm.appSecret" disabled style="width: 200px; margin-right:30px"></Input>
                    </FormItem>
                    <FormItem style="float: right">
                        <Button @click="reset" type="minor" size="small">{{$t("openApi.reset")}}</Button>
                    </FormItem>
                </Form>
            </div>
            <p v-else>{{$t('openApi.openAptip1')}}</p>
        </div>
        <div class="openApi-set-box">
            <h3 class="header">
                <span>{{$t('openApi.title3')}}</span>
                <Icon v-if="openStatus" @click="editIp"
                    size="16"
                    color="#677F99"
                    class="cursor-pointer"
                    custom="custom-edit-2"></Icon>
            </h3>
            <div v-if="openStatus">
                <p style="margin-bottom: 12px">{{$t('openApi.openAptip2')}}</p>
                <div v-if="editIpStatus">
                    <Input type="textarea"
                        :rows="10"
                        v-model="ipAddress"
                        :placeholder="$t('openApi.placeholder')">
                    </Input>
                    <div style="margin-top: 20px;">
                        <Button type="primary" @click="handleSave">{{$t('save')}}</Button>
                        <Button style="margin-left: 20px" @click="handleCancel">{{$t('cancel')}}</Button>
                    </div>
                </div>
                <Table v-else :data="ipList"
                    height="400"
                    stripe
                    v-loading="tableLoading">
                    <TableColumn width="80"
                        prop="index"
                        :label="$t('openApi.tableColumn1')">
                    </TableColumn>
                    <TableColumn
                        prop="ipAddress"
                        :label="$t('openApi.tableColumn2')">
                    </TableColumn>
                </Table>
            </div>
            <p v-else>{{$t('openApi.openAptip1')}}</p>
        </div>
    </div>
</template>
<script>
    import { mapState } from 'vuex';
    import Utils from '@/utils/index';
    import openapiApi from '@/api/systemSettings/openApi/index';
    export default {
        name: 'openApi',
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId'
            })
        },
        data() {
            return {
                loading: false,
                openStatus: false,
                openForm: {
                    appID: '',
                    appSecret: ''
                },
                ipList: [],
                editIpStatus: false,
                ipAddress: ''
            };
        },
        created() {
            this.getSetData();
        },
        methods: {
            getSetData(type) {
                openapiApi.getOpenApiData({ orgId: this.orgId }).then(res => {
                    if (res.code === '1' && res.data) {
                        this.openStatus = true;
                        if (!type || type === 'resetSecret') {
                            this.openForm.appID = res.data.appId;
                            this.openForm.appSecret = res.data.signToken;
                        }
                        if (!type || type === 'updateWhiteIps') {
                            const ipAddress = res.data.whiteIpList || [];
                            this.ipList = ipAddress.map((item, index) => {
                                const obj = {
                                    index: index + 1,
                                    ipAddress: item
                                };
                                return obj;
                            });
                        }
                    } else {
                        this.openStatus = false;
                        this.openForm = {
                            appID: '',
                            appSecret: ''
                        };
                        this.ipList = [];
                    }
                });
            },
            reset() {
                this.$confirm(this.$t('openApi.resetTip'), this.$t('openApi.resetTitle'), {
                    confirmButtonText: this.$t('confirm'),
                    cancelButtonText: this.$t('cancel')
                }).then(() => {
                    openapiApi.resetSecret({ orgId: this.orgId }).then(res => {
                        if (res.code === '1') {
                            this.$Message.success(this.$t('production.resetSuccess'));
                            this.getSetData('resetSecret');
                        } else {
                            this.$Message.error(res.message);
                        }
                    });
                }).catch(() => {
                });
            },
            editIp() {
                this.ipAddress = this.ipList.length ? this.ipList.map(item => item.ipAddress).join('\n') : '';
                this.editIpStatus = true;
            },
            handleSave() {
                const ipAddress = this.ipAddress.split('\n').filter(item => item);
                const ipReg = Utils.regExp.fullIp;
                const Ipv6 = Utils.regExp.Ipv6;
                for (let i = 0; i < ipAddress.length; i++) {
                    if (!ipReg.test(ipAddress[i]) && !Ipv6.test(ipAddress[i])) {
                        this.$Message.error(this.$t('openApi.errorTip'));
                        return;
                    }
                }
                openapiApi.updateWhiteIps({
                    orgId: this.orgId,
                    whiteIps: ipAddress.join(',')
                }).then(res => {
                    if (res.code === '1') {
                        this.$Message.success(this.$t('highSeasSetting.saveSuccess'));
                        this.getSetData('updateWhiteIps');
                        this.editIpStatus = false;
                    } else {
                        this.$Message.error(res.message);
                    }
                });
            },
            handleCancel() {
                this.editIpStatus = false;
            },
            showLeavrTip(to) {
                this.$confirm(this.$t('openApi.leaveTip'), this.$t('crm.aliImport.leaveConfirm'), {
                    customClass: 'openApi-messageBox',
                    confirmButtonText: this.$t('confirm'),
                    cancelButtonText: this.$t('cancel')
                }).then(() => {
                    this.editIpStatus = false;
                    this.$router.push(to);
                }).catch(() => {
                });
            }
        },
        beforeRouteLeave(to, from, next) {
            if (this.editIpStatus) {
                this.showLeavrTip(to);
                return;
            }
            next();
        }
    };
</script>
<style lang="less">
    .openApi-set {
        padding: 30px;
        height: 100%;
        color: rgba(0, 0, 0, 0.8);
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            font-size: 16px;
            line-height: 26px;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.8);
        }
        .openApi-set-box {
            width: 750px;
            margin-bottom: 30px;
            p {
                font-size: 14px;
                line-height: 22px;
                color: rgba(0, 0, 0, 0.80);
            }
            .el-form-item {
                margin-bottom: 0px;
                margin-right: 0px;
                .el-form-item__label {
                    padding: 0 30px 0 0;
                    font-size: 14px;
                    color: rgba(0, 0, 0, 0.80);
                }
            }
            .el-table {
                font-size: 14px;
                color: #333;
                &::before{
                    display: none;
                }
                thead {
                    color: #333;
                }
                tr {
                    background: #F6F6F6;
                }
                tr.el-table__row--striped td {
                    background: #fff;
                }
                .el-table__empty-block {
                    display: none;
                }
            }
            .el-textarea__inner {
                color: rgba(0, 0, 0, 0.80);
            }
        }
    }
</style>

