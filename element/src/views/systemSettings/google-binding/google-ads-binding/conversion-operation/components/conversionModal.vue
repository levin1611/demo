<template>
    <Modal :visible.sync="modalShow"
           :title="title"
           :loading="loading"
           width="500px"
           :append-to-body="true"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           :destroy-on-close="true"
           @close="cancel">
        <!-- 提示语 -->
        <div class="conversionModal-tip">{{ $t('googleAdsBinding.conversionList.tip_relationModal') }}</div>

        <!-- 数据表单 -->
        <Form :model="formData"
              :rules="formRules"
              label-position="left"
              label-width="150px">
            <!-- 跟进状态 -->
            <FormItem :label="$t('googleAdsBinding.conversionList.followupStatus')">
                <Select v-model="formData.followupId"
                        :disabled="type !== 'new'"
                        label-in-value
                        :placeholder="$t('googleAdsBinding.conversionList.tip_selectFollowupStatus')"
                        popper-class="followupSelect-popper"
                        filterable
                        @change="changeFollowup"
                        style="width: 100%">
                    <Option v-for="item in followupStatusList"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label">
                        <TooltipAuto :content="item.label"></TooltipAuto>
                    </Option>
                </Select>
            </FormItem>

            <!-- 转化操作 -->
            <FormItem>
                <!-- 标签 -->
                <div slot="label">
                    <span>{{ $t('googleAdsBinding.conversionList.conversionAction') }}</span>{{ '\xa0' }}
                    <HelpTip :title="$t('helpTip.conversionModalTip')"></HelpTip>
                </div>

                <!-- 级联选择 -->
                <Cascader v-show="conversionCasData.length"
                          v-model="formData.conversion"
                          :options="conversionCasData"
                          :filterable="true"
                          :show-all-levels="false"
                          :placeholder="$t('googleAdsBinding.conversionList.tip_selectConversion')"
                          popper-class="conversionCas-popper"
                          ref="conversionCas"
                          @change="casChange"
                          style="width: 100%">
                    <template slot-scope="{ node, data }">
                        <TooltipAuto :content="data.label"></TooltipAuto>
                    </template>
                </Cascader>

                <!-- 级联下拉选项为空时, select 下拉显示自定义的无数据提醒(级联不支持自定义) -->
                <Select v-show="!conversionCasData.length"
                        value=""
                        :disabled="!formData.followupId || loading_casData"
                        :placeholder="$t(`googleAdsBinding.conversionList.${!formData.followupId ? 'tip_emptyFollowupIdBeforeConversionReq' : 'tip_selectConversion'}`)"
                        :no-data-text="$t('googleAdsBinding.conversionList.noConversionOptions')"
                        v-loading="loading_casData"
                        style="width: 100%"></Select>
            </FormItem>
        </Form>

        <div slot="footer">
            <Button @click="cancel">{{ $t('cancel') }}</Button>
            <Button type="primary"
                    ghost
                    @click="saveRelation">{{ $t('confirm') }}</Button>
        </div>
    </Modal>
</template>

<script>
    import { mapState } from 'vuex';
    import { googleAdsBind } from '@/api/google/index';
    const { getFollowupStatusListForGoogleAdsBind, getConversionOptionForFollowUp, saveGoogleConversion } = googleAdsBind;

    export default {
        name: 'conversionModal',
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            type: String,
            data: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId'
            }),
            // 标题
            title() {
                if (this.type === 'new') {
                    return this.$t('googleAdsBinding.conversionList.createRelation');
                } else {
                    return this.$t('googleAdsBinding.conversionList.editRelation');
                }
            }
        },
        data() {
            return {
                loading: false,
                modalShow: this.visible,
                formData: {},
                formRules: {
                    name: [
                        {
                            required: true,
                            message: this.$t('googleAdsBinding.conversionList.empty_followupId'),
                            trigger: 'blur'
                        }
                    ],
                    conversion: [
                        {
                            required: true,
                            message: this.$t('googleAdsBinding.conversionList.empty_conversionId'),
                            trigger: 'blur'
                        }
                    ]
                },
                followupStatusList: [],
                conversionCasData: [],
                loading_casData: false
            };
        },
        methods: {
            // 获取企业下所有跟进状态, 供下拉选择
            getStatusList() {
                getFollowupStatusListForGoogleAdsBind({
                    orgId: this.orgId
                }).then(res => {
                    if (res.code === '1') {
                        this.followupStatusList = res.data.map(item => {
                            return {
                                value: item.attrId,
                                label: item.attrName
                            };
                        });
                    } else {
                        this.$Message.error(this.$t('googleAdsBinding.conversionOperation.getFollowupListFail'));
                    }
                });
            },
            // 获取企业下所有可选的转换操作
            getConversionCasData() {
                // 清除数据
                // 直接清空数据会报错, 而且 element Cascader 组件的 clearCheckedNodes 方法无效, 看源码后增加下面的语句, 修改导致报错相关内容
                try {
                    this.$refs.conversionCas.handleClear();
                    this.$refs.conversionCas.$refs.panel.activePath = [];
                } catch (err) {
                    console.error(err);
                }
                this.conversionCasData = [];

                this.loading_casData = true;
                getConversionOptionForFollowUp({
                    orgId: this.orgId,
                    followupId: this.formData.followupId,
                    customerId: this.formData.adsAccountId
                }).then(res => {
                    if (res.code === '1') {
                        const data = res.data || {};

                        // 编辑关联关系, 需要把当前的转化操作回填进去
                        // 编辑关联关系, 需要把当前的转化操作回填进去
                        if (this.type === 'edit') {
                            // 无 adsAccountId(广告账户数据) 的数据不回填
                            // 外部调用此组件的表格页做了限制, 理论上不会有 adsAccountId 为空的数据
                            if (this.formData.adsAccountId) {
                                // 处理二级选项"转化操作"数据
                                const currConversionData = {
                                    name: this.formData.conversionName,
                                    customerId: this.formData.adsAccountId,
                                    adsCustomerName: this.formData.adsAccountName || this.formData.adsAccountId,
                                    id: this.formData.conversionId
                                };

                                // 处理一级选项"ads 账户"数据
                                if (!this.formData.adsAccountName) {
                                    // 如果没有 ads 账户名称, 直接用 ads 账户 id 当名称
                                    data[this.formData.adsAccountId] = [currConversionData];
                                } else {
                                    const currAdsAccountData = data[this.formData.adsAccountName];

                                    if (currAdsAccountData) {
                                        // 如果该 ads 账户下已有值, 则判断是否需要插入此数据

                                        if (!currAdsAccountData.find(item => `${item.id}` === `${currConversionData.id}`)) {
                                            currAdsAccountData.unshift(currConversionData);
                                        }
                                    } else {
                                        // 之前无值, 直接填入此数据

                                        data[this.formData.adsAccountName] = [currConversionData];
                                    }
                                }
                            }
                        }

                        this.conversionCasData = this.handleCasData(data);
                    }
                    this.loading_casData = false;
                });
            },
            handleCasData(data) {
                const result = [];
                Object.entries(data).forEach(([adsAccountName, conversionList]) => {
                    if (Array.isArray(conversionList) && conversionList.length) {
                        const temp = {
                            value: `${conversionList[0].customerId}`,
                            label: adsAccountName,
                            children: conversionList.map(item => {
                                return {
                                    value: `${item.id}`,
                                    label: item.name,
                                    rawData: item
                                };
                            })
                        };
                        result.push(temp);
                    }
                });
                return result;
            },

            // 跟进状态选择
            changeFollowup({ label, value } = {}) {
                // 更新跟进状态名称
                this.formData.followup = label;

                // 清空转化操作数据
                this.formData.conversion = [];
                this.formData.conversionId = '';
                this.formData.conversionName = '';
                this.formData.adsAccountId = '';
                this.formData.adsAccountName = '';

                // 获取转化操作选线数据
                this.getConversionCasData();
            },
            // 转化操作选择
            casChange() {
                const checkedNodes = this.$refs.conversionCas.getCheckedNodes();
                if (checkedNodes.length) {
                    // 更新转化操作关联的其他数据
                    const nodeData = checkedNodes[0].data.rawData;
                    this.formData.conversionId = nodeData.id;
                    this.formData.conversionName = nodeData.name;
                    this.formData.adsAccountId = nodeData.customerId;
                    this.formData.adsAccountName = nodeData.adsCustomerName;
                } else {
                    // 选中项为空, 清除相关数据
                    this.formData.conversion = [];
                    this.formData.conversionId = '';
                    this.formData.conversionName = '';
                    this.formData.adsAccountId = '';
                    this.formData.adsAccountName = '';
                }
            },

            // 保存关联关系
            saveRelation() {
                // 数据校验
                // 跟进状态为空
                if (!this.formData.followupId) {
                    this.$Message.warning(this.$t('googleAdsBinding.conversionList.empty_followupId'));
                    return;
                }
                // 转化操作为空
                if (!this.formData.conversionId) {
                    this.$Message.warning(this.$t('googleAdsBinding.conversionList.empty_conversionId'));
                    return;
                }
                // 编辑前后转化操作不变
                if (`${this.formData.conversionId}` === `${this.data.conversionId}`) {
                    this.$Message.warning(this.$t('googleAdsBinding.conversionList.repeat_conversionId'));
                    return;
                }

                // 数据处理
                const jsonData = {
                    orgId: this.orgId,
                    followup: this.formData.followup,
                    followupId: this.formData.followupId,
                    conversionId: this.formData.conversionId,
                    conversionName: this.formData.conversionName,
                    updateUser: this.userId,
                    customerId: this.formData.adsAccountId,
                    adsCustomerName: this.formData.adsAccountName
                };
                if (this.type === 'edit') {
                    jsonData.id = this.formData.id;
                }

                this.loading = true;
                saveGoogleConversion(jsonData).then(res => {
                    if (res.code === '1') {
                        this.$Message.success(this.$t('googleAdsBinding.conversionList.saveOperationSuccess'));
                        this.cancel();
                        this.$emit('saveSuccess');
                    } else {
                        this.$Message.error(this.$t('googleAdsBinding.conversionList.error_save'));
                    }
                    this.loading = false;
                });
            },
            // 关闭弹框相关
            cancel() {
                this.$emit('update:visible', false);
            }
        },
        watch: {
            visible(val) {
                this.modalShow = val;
                if (val) {
                    if (this.type === 'new') {
                        this.formData = {
                            followupId: '',
                            conversionId: []
                        };
                    } else {
                        this.formData = Object.assign({
                            id: '',
                            followupId: '',
                            conversion: this.data.conversionId && this.data.adsAccountId ? [`${this.data.adsAccountId}`, `${this.data.conversionId}`] : []
                        }, this.data);
                        this.getConversionCasData();
                    }
                    this.getStatusList();
                } else {
                    this.formData = {};
                    // 直接清空数据会报错, 而且 element Cascader 组件的 clearCheckedNodes 方法无效, 看源码后增加下面的语句, 修改导致报错相关内容
                    try {
                        this.$refs.conversionCas.handleClear();
                        this.$refs.conversionCas.$refs.panel.activePath = [];
                    } catch (err) {
                        console.error(err);
                    }
                    this.conversionCasData = [];
                    this.loading = false;
                    this.loading_casData = false;
                }
            }

        }
    };
</script>

<style lang="less" scoped>
    .conversionModal-tip {
        font-size: 12px;
        line-height: 18px;
        color: #333;
        margin-bottom: 20px;
    }
</style>

<style lang="less">
    .followupSelect-popper {
        width: 330px;
    }

    .conversionCas-popper {
        .el-cascader-menu__list {
            width: 300px;
        }
    }
</style>
