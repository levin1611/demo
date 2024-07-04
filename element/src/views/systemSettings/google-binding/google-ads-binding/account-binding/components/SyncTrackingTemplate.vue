<template>
    <div class="sync-tracking-template">
        <div v-if="isBinding"
             class="step-title">{{$t('googleAdsBinding.accountBinding.startTrackTemplate')}}</div>
        <Row :gutter="40">
            <Col :span="12">
                <div style="margin-bottom: 10px;font-size:12px;">
                    {{$t('googleAdsBinding.accountBinding.clickToPassBack')}}
                </div>
<!--                <Row>-->
<!--                    <Col :span="3">{{$t('googleAdsBinding.accountBinding.trackTemplate')}}</Col>-->
<!--                    <Col :span="21">-->
                <Input v-model="trackingUrlTemplate"
                       type="textarea"
                       :rows="6"/>
<!--                    </Col>-->
<!--                </Row>-->
            </Col>
            <Col :span="12">
                <div style="margin-bottom: 10px;font-size:12px;">
                    {{$t('googleAdsBinding.accountBinding.createTrackTemplate')}}
                </div>
                <Table  ref="multipleTable"
                        :data="tableData"
                        :height="table_height"
                        highlight-current-row
                        :show-overflow-tooltip="true"
                        :row-key="getRowKey"
                        size="medium"
                        @select="handleSelect"
                        @select-all="handleSelectAll">
                    <TableColumn
                            width="50"
                            align="center"
                            fixed
                            :reserve-selection="true"
                            type="selection">
                    </TableColumn>
                    <TableColumn v-for="item in tableColumns"
                                 :key="item.key"
                                 :prop="item.key"
                                 :align="item.align"
                                 :label="item.title"
                                 :width="item.width"
                                 :min-width="item.width || 64"
                                 :show-overflow-tooltip="true">
                        <template slot-scope="scope">
                            <template>
                                {{scope.row[item.key]}}
                            </template>
                        </template>
                    </TableColumn>
                </Table>
            </Col>
        </Row>
        <div class="GABinding-steps-footer">
<!--            <Button v-if="isBinding"-->
<!--                    @click="handlePrev">{{$t('googleAdsBinding.accountBinding.prevStep')}}</Button>-->
            <Button type="primary"
                    :loading="saveLoading"
                    @click="handleSave"
                    style="margin-left:10px"
                    class="piwik_bind_google_account">
                {{$t('googleAdsBinding.accountBinding.saveAndSync')}}
            </Button>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        name: 'SyncTrackingTemplate',
        props: {
            customerId: {
                type: [String, Array]
            },
            // 是否处于 Google 多账号绑定状态
            // 加这个是因为, google ads 账户列表侧滑页, 也在用这个组件
            isBinding: {
                type: Boolean,
                default() {
                    return true;
                }
            }
        },
        data() {
            return {
                tableColumns: [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: this.$t('googleAdsBinding.accountBinding.parameter'),
                        key: 'key',
                        width: 160
                    },
                    {
                        title: this.$t('googleAdsBinding.accountBinding.name'),
                        key: 'name',
                        tooltip: true
                    }
                ],
                tableData: [
                    {
                        name: this.$t('googleAdsBinding.accountBinding.campaignID'),
                        param: 'utm_campaignid',
                        key: '{campaignid}',
                        id: 1
                    },
                    {
                        name: this.$t('googleAdsBinding.accountBinding.adgroupID'),
                        param: 'utm_adgroupid',
                        key: '{adgroupid}',
                        id: 2
                    },
                    {
                        name: this.$t('googleAdsBinding.accountBinding.creative'),
                        param: 'utm_creative',
                        key: '{creative}',
                        id: 3
                    },
                    {
                        name: this.$t('googleAdsBinding.accountBinding.network'),
                        param: 'utm_network',
                        key: '{network}',
                        id: 4
                    },
                    {
                        name: this.$t('googleAdsBinding.accountBinding.matchType'),
                        param: 'utm_matchtype',
                        key: '{matchtype}',
                        id: 5
                    },
                    {
                        name: this.$t('googleAdsBinding.accountBinding.device'),
                        param: 'utm_device',
                        key: '{device}',
                        id: 6
                    },
                    {
                        name: this.$t('googleAdsBinding.accountBinding.deviceModel'),
                        param: 'utm_devicemodel',
                        key: '{devicemodel}',
                        id: 7
                    },
                    {
                        name: this.$t('googleAdsBinding.accountBinding.keyword'),
                        param: 'utm_term',
                        key: '{keyword}',
                        id: 8
                    },
                    {
                        name: this.$t('googleAdsBinding.accountBinding.adposition'),
                        param: 'utm_adposition',
                        key: '{adposition}',
                        id: 9
                    },
                    {
                        name: this.$t('googleAdsBinding.accountBinding.placement'),
                        param: 'utm_placement',
                        key: '{placement}',
                        id: 10
                    },
                    {
                        name: this.$t('googleAdsBinding.accountBinding.feedItemID'),
                        param: 'utm_feeditemid',
                        key: '{feeditemid}',
                        id: 11
                    },
                    {
                        name: this.$t('googleAdsBinding.accountBinding.targetID'),
                        param: 'utm_targetid',
                        key: '{targetid}',
                        id: 12
                    }
                ],
                trackingUrlTemplate: '',
                saveLoading: false
            };
        },
        computed: {
            ...mapState({
                enterpriseId: state => state.enterpriseId,
                window_height: 'window_height'
            }),
            table_height() {
                let temp = this.window_height ? this.window_height - 400 : document.documentElement.clientHeight - 400;

                if (!this.isBinding) {
                    temp += 100;
                }

                return temp > 200 ? temp : 200;
            }
        },
        methods: {
            getRowKey(row) {
                return row.id;
            },
            // 获得跟踪模板
            getTrackingUrlTemplate() {
                util.ajaxInternational({
                    url: '/oversea/adsCustomer/getCustomer',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        customerId: [].concat(this.customerId).join(',')
                    }
                }).then(response => {
                    if (response.data.code === '1' && response.data.data) {
                        this.trackingUrlTemplate = response.data.data.trackingUrlTemplate;
                        if (this.trackingUrlTemplate) {
                            const template = this.trackingUrlTemplate.split('?');
                            const tempList1 = template[1].split('&');
                            let tempList2;
                            for (const item of tempList1) {
                                tempList2 = item.split('=');
                                for (let i = 0; i < this.tableData.length; i++) {
                                    if (this.tableData[i].key === tempList2[1]) {
                                        this.initCheck(this.tableData[i]);
                                    }
                                }
                            }
                        }
                    }
                });
            },
            initCheck(row) {
                this.$nextTick(() => {
                    // rows.forEach(row => {
                    this.$refs.multipleTable.toggleRowSelection(row, true);
                    // });
                });
            },
            handlePrev() {
                this.$emit('stepPrev', true);
            },
            // 单选
            handleSelect(selection, row) {
                this.jointStr(selection);
            },
            jointStr(selection) {
                let temp = '{lpurl}?';
                selection.forEach(item => {
                    temp += `&${item.param}=${item.key}`;
                });
                this.trackingUrlTemplate = temp;
            },
            // 全选
            handleSelectAll(selection) {
                this.jointStr(selection);
            },
            handleSave() {
                this.saveLoading = true;
                util.ajaxInternational({
                    url: '/oversea/adsCustomer/updateTrackingTemplateUrl',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        trackingUrlTemplate: this.trackingUrlTemplate,
                        customerId: [].concat(this.customerId).join(',')
                    }
                }).then(response => {
                    this.saveLoading = false;
                    if (response.data.code === '1') {
                        this.$Message.success(this.$t('saveSuccess'));
                        this.$emit('handleEdit', false);
                        this.$store.commit('setIsGoogleBind', true);
                    } else {
                        this.$Message.error(this.$t('saveFail'));
                    }
                });
            }
        },
        created() {
            this.getTrackingUrlTemplate();
        }
    };
</script>

<style lang="less">
    .sync-tracking-template {
        width: 90%;
        font-size: 12px;

        .step-title {
            text-align: center;
            font-weight: 700;
            margin-bottom: 20px;
            font-size: 16px;
        }
    }
</style>
