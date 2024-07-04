<template>
    <div class="aliCRX">
        <!-- 字段匹配 -->
        <!-- 标题 -->
        <Row class="ali-field-match">
            <Col :span="11">
                <div class="ali-field-icon">
                    <Icon custom="custom custom-alibaba-logo"
                            color="#FD7003"
                            size="40"></Icon>
                </div>
                <div class="ali-field-title">{{ $t('crm.aliImport.aliInquiryField') }}</div>
            </Col>
            <Col :span="11"
                    :offset="2">
                <div class="ali-field-icon">
                    <Icon custom="custom custom-main-logo"
                            color="#FD7003"
                            size="30"></Icon>
                </div>
                <div class="ali-field-title">{{ $t('crm.aliImport.leadscloudClueField') }}</div>
            </Col>
        </Row>
        <!-- 字段遍历 -->
        <div :style="{height: fieldContainerHeight + 'px', 'margin-bottom': '24px', overflowX: 'hidden', overflowY: 'auto'}">
            <Row v-for="(field, key) in aliFields"
                    :key="key"
                    class="ali-field-match">
                <Col :span="11">
                    <div>{{ aliFieldsLangObj[key] }}</div>
                </Col>
                <Col :span="2">
                    <Icon custom="custom custom-form-set-arrow"
                            color="#7B98B6"
                            size="15"></Icon>
                </Col>
                <Col :span="11">
                    <Select v-model="aliFields[key]"
                            :disabled="!authorized_button.changeMatchRel"
                            filterable
                            clearable
                            :placeholder="invalidFields.includes(key) ? $t('crm.aliImport.fieldInvalided') : $t('crm.Modal.tip_select')"
                            @clear="clearSelect(key)">
                        <!-- option disabled 情况说明 -->
                        <!-- 1. 阿里字段为图片字段, 且 option 对应的线索字段不是文本域型字段 -->
                        <!-- 2. 当前未选中该选项, 且 option 对应的线索字段不是文本域型字段, 且不是"电话字段", 且未被其他字段选中 -->
                        <Option v-for="(clueFieldObj, clueFieldKey) in clueFields"
                                :disabled="(aliImgFields.includes(key) && clueFieldObj.type.toUpperCase() !== 'TEXTAREA') || (aliFields[key] !== clueFieldKey && clueFieldObj.type.toUpperCase() !== 'TEXTAREA' && clueFieldKey !== 'a10012' && Object.values(aliFields).includes(clueFieldKey))"
                                :key="clueFieldKey"
                                :value="clueFieldKey"
                                :label="clueFieldsLangObj[clueFieldKey] || clueFieldObj.name">
                            <span>{{ clueFieldsLangObj[clueFieldKey] || clueFieldObj.name }}</span>
                            <!-- 必填标识 -->
                            <span v-if="clueFieldObj.isNeed === 1"
                                    class="required-flag">*</span>
                        </Option>
                    </Select>
                    <!-- 必填标识 -->
                    <span v-if="aliFields[key] && clueFields[aliFields[key]] && clueFields[aliFields[key]].isNeed === 1"
                            class="required-flag">*</span>
                </Col>
            </Row>
        </div>

        <!-- 保存按钮 -->
        <div class="text-center">
            <Button type="primary"
                    :disabled="!authorized_button.changeMatchRel"
                    @click="saveMatchRelation"
                    :class="{'piwik_save_ali_match_rel': authorized_button.changeMatchRel}">{{ $t('save') }}</Button>
        </div>
        <!-- 未保存字段映射关系就离开页面确认框 -->
        <Modal :visible.sync="visible_beforeLeave"
               :modal-append-to-body="false"
               :close-on-click-modal="false"
               @close="cancelLeave"
               width="360px">
            <p slot="title">
                <span style="font-size: 18px; color: rgba(0, 0, 0, .8)">{{ $t('crm.aliImport.leaveConfirm') }}</span>
            </p>
            <div>
                <p>{{ $t('crm.aliImport.leaveTip') }}</p>
            </div>
            <div slot="footer">
                <!-- 直接离开 -->
                <Button @click="leaveDirectly">{{ $t('crm.aliImport.leaveDirectly') }}</Button>
                <!-- 保存后离开 -->
                <Button type="primary"
                        @click="leaveAfterSave">{{ $t('crm.aliImport.leaveAfterSave') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';

    export default {
        name: 'aliCRX',
        props: [
            'fieldContainerHeight',
            'toRouterObj',
            'activeName'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height',
                button_list: state => state.app.button_list
            }),
            authorized_button() {
                return {
                    // 查看关联关系
                    viewMatchRel: !HANDLE_BUTTON(BUTTON_IDS.CRM.aliImportCRX.viewMatchRel, this.button_list),
                    // 保存关联关系
                    changeMatchRel: !HANDLE_BUTTON(BUTTON_IDS.CRM.aliImportCRX.changeMatchRel, this.button_list)
                };
            }
        },
        data() {
            return {
                /* 左侧字段匹配 */
                loading: true,
                // 阿里字段语言包
                aliFieldsLangObj: {
                    // /* 列表页 - 暂未获取 */
                    // createTime: '创建时间',
                    // updateTime: '更新时间',
                    /* 左侧询盘框 */
                    tradeId: this.$t('crm.aliImport.tradeId'),
                    productTitle: this.$t('crm.aliImport.productTitle'),
                    productImg: this.$t('crm.aliImport.productImg'),
                    /* 右侧客户 - 顶部 */
                    buyerName: this.$t('crm.aliImport.buyerName'),
                    potentialScore: this.$t('crm.aliImport.potentialScore'),
                    /* 右侧客户 - 详情 */
                    registerDate: this.$t('crm.aliImport.registerDate'),
                    country: this.$t('crm.aliImport.country'),
                    companyName: this.$t('crm.aliImport.companyName'),
                    companyWebsite: this.$t('crm.aliImport.companyWebsite'),
                    email: this.$t('crm.aliImport.email'),
                    mobileNumber: this.$t('crm.aliImport.mobileNumber'),
                    phoneNumber: this.$t('crm.aliImport.phoneNumber'),
                    /* 右侧客户 - 管理信息 */
                    importanceLevel: this.$t('crm.aliImport.importanceLevel'),
                    categorys: this.$t('crm.aliImport.categorys'),
                    annualProcurement: this.$t('crm.aliImport.annualProcurement'),
                    marketingGroups: this.$t('crm.aliImport.marketingGroups'),
                    pageNotes: this.$t('crm.aliImport.pageNotes'),
                    /* 右侧客户 - 客户营销 - 近90天站内行为 */
                    productViewCount: this.$t('crm.aliImport.productViewCount'),
                    validInquiryCount: this.$t('crm.aliImport.validInquiryCount'),
                    validRfqCount: this.$t('crm.aliImport.validRfqCount'),
                    loginDays: this.$t('crm.aliImport.loginDays'),
                    spamInquiryMarkedBySupplierCount: this.$t('crm.aliImport.spamInquiryMarkedBySupplierCount'),
                    addedToBlacklistCount: this.$t('crm.aliImport.addedToBlacklistCount'),
                    /* 右侧客户 - 客户营销 - 最常采购行业 */
                    preferredIndustries: this.$t('crm.aliImport.preferredIndustries'),
                    latestInquiryProducts: this.$t('crm.aliImport.latestInquiryProducts'),
                    totalOrderCount: this.$t('crm.aliImport.totalOrderCount'),
                    totalOrderVolume: this.$t('crm.aliImport.totalOrderVolume'),
                    tradeSupplierCount: this.$t('crm.aliImport.tradeSupplierCount')
                },
                // 线索字段语言包
                clueFieldsLangObj: {
                    a1001: this.$t('crm.InqSet.corp_companyName'),
                    a1002: this.$t('crm.InqSet.corp_mainProduct'),
                    a1003: this.$t('crm.InqSet.corp_countryArea'),
                    a1004: this.$t('crm.InqSet.corp_homePage'),
                    a1005: this.$t('crm.InqSet.corp_fax'),
                    a1006: this.$t('crm.InqSet.corp_phone'),
                    a1007: this.$t('crm.InqSet.corp_contactAddress'),
                    a1008: this.$t('crm.InqSet.corp_companyRemark'),
                    a1009: this.$t('crm.InqSet.contact_nickName'),
                    a10010: this.$t('crm.InqSet.contact_email'),
                    a10011: this.$t('crm.InqSet.contact_jobTitle'),
                    a10012: this.$t('crm.InqSet.contact_phone'),
                    a10013: this.$t('crm.InqSet.contact_socialNetworkingPlatform'),
                    a10014: this.$t('crm.InqSet.contact_gender'),
                    a10015: this.$t('crm.InqSet.contact_remark'),
                    a10016: this.$t('crm.InqSet.inq_demandProducts'),
                    a10017: this.$t('crm.InqSet.inq_label'),
                    a10018: this.$t('crm.InqSet.inq_productCategory'),
                    a10019: this.$t('crm.InqSet.inq_sourceChannel'),
                    a10020: this.$t('crm.InqSet.inq_sourceWay'),
                    a10021: this.$t('crm.InqSet.inq_remark'),
                    a10052: this.$t('crm.InqSet.contact_whatsApp'),
                    a10053: this.$t('crm.InqSet.contact_instagram')
                },
                // 字段匹配关系
                aliFields: {
                    // /* 列表页 - 暂未获取 */
                    // createTime: '创建时间',
                    // updateTime: '更新时间',
                    /* 左侧询盘框 */
                    tradeId: '',
                    productTitle: '',
                    productImg: '',
                    /* 右侧客户 - 顶部 */
                    buyerName: '',
                    potentialScore: '',
                    /* 右侧客户 - 详情 */
                    registerDate: '',
                    country: '',
                    companyName: '',
                    companyWebsite: '',
                    email: '',
                    mobileNumber: '',
                    phoneNumber: '',
                    /* 右侧客户 - 管理信息 */
                    importanceLevel: '',
                    categorys: '',
                    annualProcurement: '',
                    marketingGroups: '',
                    pageNotes: '',
                    /* 右侧客户 - 客户营销 - 近90天站内行为 */
                    productViewCount: '',
                    validInquiryCount: '',
                    validRfqCount: '',
                    loginDays: '',
                    spamInquiryMarkedBySupplierCount: '',
                    addedToBlacklistCount: '',
                    /* 右侧客户 - 客户营销 - 最常采购行业 */
                    preferredIndustries: '',
                    latestInquiryProducts: '',
                    totalOrderCount: '',
                    totalOrderVolume: '',
                    tradeSupplierCount: ''
                },
                // 阿里字段中的图片字段
                aliImgFields: ['productImg', 'latestInquiryProducts'],
                // 初始请求得到的字段匹配关系
                originalRelations: {},
                // 当前线索模板字段
                clueFields: {},
                // 保存前校验阿里字段匹配的线索字段是否已失效(别人编辑了线索模板导致字段实际上被删除/类型有变更, 因而保存时出错/无法保存), 有则清空原下拉框数据
                invalidFields: [],

                /* 离开前确认弹窗 */
                visible_beforeLeave: false
            };
        },
        methods: {
            /* 左侧字段匹配 */
            // 获取线索字段
            getXSShow() {
                return util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                });
            },
            // 获取字段匹配关系
            getMatchRelation() {
                return util.ajax({
                    url: '/form-cust/clueAliRelation/getByOrgId',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                });
            },
            // 展示字段匹配关系
            showMatchRelation() {
                this.loading = true;
                util.axios.all([this.getXSShow(), this.getMatchRelation()]).then(util.axios.spread((res_field, res_rel) => {
                    if (res_field.data.code === '1' && res_rel.data.code === '1') {
                        // 处理得到线索字段
                        this.clueFields = res_field.data.data.show;

                        // 处理字段对应关系
                        this.originalRelations = (res_rel.data.data && res_rel.data.data.relations) ? JSON.parse(res_rel.data.data.relations) : {};
                        Object.entries(this.originalRelations).map(item => {
                            const [aliKey, clueFieldKey] = item;
                            // 有匹配的线索字段
                            if (this.aliFields.hasOwnProperty(aliKey) && clueFieldKey) {
                                if (this.clueFields[clueFieldKey]) {
                                    // 字段存在, 赋值到 aliFields
                                    this.aliFields[aliKey] = clueFieldKey;
                                }
                            }
                        });

                        // 校验字段是否已失效
                        this.validateRelation();
                    } else {
                        this.$Message.error(this.$t('clue.error_getClueFields'));
                    }
                    this.loading = false;
                })).catch(e => {
                    console.error(e);
                    this.$Message.error(this.$t('clue.error_getClueFields'));
                    this.loading = false;
                });
            },
            // 字段匹配关系保存前校验
            validateRelation() {
                // 存放已失效字段
                const invalidFields = [];
                // 存放"是否校验通过"结果
                let result = true;

                // 判断是否有字段已不存在
                Object.entries(this.aliFields).forEach(([key, value]) => {
                    if (value && !this.clueFields[value]) {
                        // 标识该阿里字段匹配的线索字段已失效
                        invalidFields.push(key);
                        // 标识未通过
                        result = false;
                    }
                });

                // 阿里字段中的 图片字段 只能匹配到多选字段, 否则报错
                this.aliImgFields.forEach(item => {
                    if (this.aliFields[item]) {
                        const clueFieldObj = this.clueFields[this.aliFields[item]];
                        if (!clueFieldObj || clueFieldObj.type.toUpperCase() !== 'TEXTAREA') {
                            // 标识该阿里字段匹配的线索字段已失效
                            invalidFields.push(item);
                            // 标识未通过
                            result = false;
                        }
                    }
                });

                // 判断重复字段是否符合条件 --- 只能有两种字段可重复: 文本域类型 || 电话字段
                // 获取所有已被匹配的线索字段
                const clueFields = Object.values(this.aliFields).filter(item => !(!item || item === ''));
                // 筛选出被重复选择的线索字段
                const repeatClueFields = clueFields.filter(item => clueFields.indexOf(item) !== clueFields.lastIndexOf(item));
                // 遍历重复字段, 检查是否有不符合要求的字段
                repeatClueFields.forEach(item => {
                    // 如果是电话字段, 直接通过校验
                    if (item === 'a10012') {
                        // continue
                        return;
                    }

                    // 否则检查字段是否是文本域字段
                    const clueFieldObj = this.clueFields[item];
                    if (!clueFieldObj || clueFieldObj.type.toUpperCase() !== 'TEXTAREA') {
                        // 标识该阿里字段匹配的线索字段已失效
                        invalidFields.push(...Object.keys(this.aliFields).filter(key => this.aliFields[key] === item));
                        // 标识未通过
                        result = false;
                    }
                });

                // 校验未通过
                if (!result) {
                    // 提示
                    this.$Message.error(this.$t('crm.aliImport.error_validateRelation'));
                    // 赋值已失效字段数组
                    this.invalidFields = [...new Set(invalidFields)];
                    // 清空失效字段对应的 select
                    this.invalidFields.forEach(item => {
                        this.aliFields[item] = '';
                    });
                }

                // 返回最终结果
                return result;
            },
            // 保存字段匹配关系
            async saveMatchRelation() {
                this.loading = true;
                // 请求下最新的线索模板, 避免编辑期间有其他人更新线索模板导致出错
                const res_field = await this.getXSShow();
                if (res_field.data.code === '1') {
                    // 处理得到线索字段
                    this.clueFields = res_field.data.data.show;
                }

                // 保存前校验, 未通过则停止保存
                if (!this.validateRelation()) {
                    this.loading = false;
                    return;
                }

                // 发送请求
                util.ajax({
                    url: '/form-cust/clueAliRelation/save',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        relations: JSON.stringify(this.aliFields)
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.$Message.success(this.$t('crm.Table.success_save'));
                        // 如果之前有被中断的跳转动作, 继续跳转
                        if (this.toRouterObj) {
                            this.$router.push(this.toRouterObj);
                            return;
                        }
                        if (this.visible_beforeLeave) {
                            this.leaveDirectly();
                        }
                        // 否则刷新数据
                        this.resetData();
                        this.showMatchRelation();
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_save'));
                        this.loading = false;
                    }
                }).catch(e => {
                    console.error(e);
                    this.$Message.error(this.$t('crm.Table.error_save'));
                    this.loading = false;
                });
            },
            // 清空旧数据
            resetData() {
                this.aliFields = {
                    // /* 列表页 - 暂未获取 */
                    // createTime: '创建时间',
                    // updateTime: '更新时间',
                    /* 左侧询盘框 */
                    tradeId: '',
                    productTitle: '',
                    productImg: '',
                    /* 右侧客户 - 顶部 */
                    buyerName: '',
                    potentialScore: '',
                    /* 右侧客户 - 详情 */
                    registerDate: '',
                    country: '',
                    companyName: '',
                    companyWebsite: '',
                    email: '',
                    mobileNumber: '',
                    phoneNumber: '',
                    /* 右侧客户 - 管理信息 */
                    importanceLevel: '',
                    categorys: '',
                    annualProcurement: '',
                    marketingGroups: '',
                    pageNotes: '',
                    /* 右侧客户 - 客户营销 - 近90天站内行为 */
                    productViewCount: '',
                    validInquiryCount: '',
                    validRfqCount: '',
                    loginDays: '',
                    spamInquiryMarkedBySupplierCount: '',
                    addedToBlacklistCount: '',
                    /* 右侧客户 - 客户营销 - 最常采购行业 */
                    preferredIndustries: '',
                    latestInquiryProducts: '',
                    totalOrderCount: '',
                    totalOrderVolume: '',
                    tradeSupplierCount: ''
                };
                this.clueFields = {};
                this.originalRelations = {};
            },
            // 清空单选
            clearSelect(key) {
                // 用户点击删除单选时, 把"字段已失效" placeholder 去掉
                this.invalidFields = this.invalidFields.filter(item => item !== key);
            },

            /* 离开前确认弹窗 */
            // 检查字段匹配关系是否有变更, return true 代表有变更
            validateChanged() {
                // 如果没有修改权限, 不需要判断是否变更, 直接返回 false
                if (!this.authorized_button.changeMatchRel) {
                    return false;
                }

                // 否则判断新数据和历史数据是否有不一致之处
                return Object.keys(this.aliFields).some(key => (this.aliFields[key] || '') !== (this.originalRelations[key] || ''));
            },
            // 放弃离开
            cancelLeave() {
                this.visible_beforeLeave = false;
            },
            // 直接离开
            leaveDirectly() {
                console.log('beforeLeave');
                this.$emit('beforeLeave', this.activeName, 'aliCRX', true);
            },
            // 保存后离开
            leaveAfterSave() {
                this.saveMatchRelation();
                // this.saveMatchRelation();
            }
        },
        mounted() {
            // 请求字段匹配关系
            this.showMatchRelation();

            // 页面关闭/刷新前提示
            // const _this = this;
            // window.onbeforeunload = e => {
            //     if (_this.validateChanged()) {
            //         e = e || window.event;

            //         // 兼容IE8和Firefox 4之前的版本
            //         if (e) {
            //             e.returnValue = '关闭提示';
            //         }

            //         // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
            //         return '关闭提示';
            //     } else {
            //         window.onbeforeunload = null;
            //     }
            // };
        },
        beforeDestroy() {
            console.log('beforeDestroy');
        }
    };
</script>

<style lang="less">
    .ali-import {
        padding: 30px;

        .el-card__body {
            padding: 20px 30px;
        }

        .ali-import-title {
            font-size: 16px;
            line-height: 28px;
            font-weight: 700;
            margin-bottom: 20px;
        }

        .ali-import-download-tip {
            line-height: 24px;
            padding-top: 8px;
        }

        .ali-import-download-guide {
            line-height: 22px;
            margin: 8px 0;

            a {
                &:hover {
                    text-decoration: underline;
                }
            }

            img {
                width: 100%;
                margin: 20px 0;
            }
        }

        .ali-import-download-remark {
            color: rgba(0,0,0,0.60);
            line-height: 24px;
        }

        .ali-field-match {
            text-align: center;
            margin-bottom: 15px;
            padding-right: 10px;

            .el-col {
                position: relative;
            }

            .el-select {
                width: 100%;
            }
        }

        .ali-field-icon {
            /*width: 40px;*/
            height: 40px;
            line-height: 40px;
            margin-bottom: 4px;
        }

        .ali-field-title {
            font-size: 14px;
            line-height: 22px;
            font-weight: 700;
            margin-bottom: 20px;
        }
    }

    .required-flag {
        color: red;
        position: absolute;
        left: 6px;
        top: 6px;
        display: inline-block;
        line-height: 28px;
    }
</style>
