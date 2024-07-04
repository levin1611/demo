<template>
   <div class="aliCRX" v-loading="loading">
        <!-- 字段匹配 -->
        <!-- 标题 -->
        <Row class="ali-field-match">
            <Col :span="11">
                <div class="ali-field-icon">
                    <Icon custom="custom custom-alibaba-logo"
                            color="#FD7003"
                            size="40"></Icon>
                </div>
                <div class="ali-field-title">{{ $t('crm.aliImport.aliCustomerField') }}</div>
            </Col>
            <Col :span="11"
                    :offset="2">
                <div class="ali-field-icon">
                    <Icon custom="custom custom-main-logo"
                            color="#FD7003"
                            size="30"></Icon>
                </div>
                <div class="ali-field-title">{{ $t('crm.aliImport.leadsCloudCrm') }}</div>
            </Col>
        </Row>
        <!-- 字段遍历 -->
        <div :style="{height: fieldContainerHeight + 'px', 'margin-bottom': '24px', overflowX: 'hidden', overflowY: 'auto'}">
            <div class="aliCustomer-list-title">{{$t('crm.aliImport.aliCustomerT1')}}</div>
            <Row v-for="field in aliCustomerFields.companyInfo"
                :key="field.aliKey"
                class="ali-field-match">
                <Col :span="11">
                    <div>{{ field.aliLabel }}</div>
                </Col>
                <Col :span="2">
                    <Icon custom="custom custom-form-set-arrow"
                            color="#7B98B6"
                            size="15"></Icon>
                </Col>
                <Col :span="11">
                    <crmFieldSelect
                        :allChecked="allChecked"
                        :fieldListInCustomer="fieldListInCustomer"
                        :fieldListInContact="fieldListInContact"
                        :fieldListInInquiry="fieldListInInquiry"
                        :disabled="field.disabled"
                        :selectedFiled.sync="field.selectedFiled" >
                    </crmFieldSelect>
                </Col>
            </Row>
            <div class="aliCustomer-list-title" style="margin-top:30px">{{$t('crm.aliImport.aliCustomerT2')}}</div>
            <Row v-for="field in aliCustomerFields.manageInfo"
                :key="field.aliKey"
                class="ali-field-match">
                <Col :span="11">
                    <div>{{ field.aliLabel }}</div>
                </Col>
                <Col :span="2">
                    <Icon custom="custom custom-form-set-arrow"
                            color="#7B98B6"
                            size="15"></Icon>
                </Col>
                <Col :span="11">
                    <crmFieldSelect
                        :allChecked="allChecked"
                        :fieldListInCustomer="fieldListInCustomer"
                        :fieldListInContact="fieldListInContact"
                        :fieldListInInquiry="fieldListInInquiry"
                        :disabled="field.disabled"
                        :selectedFiled.sync="field.selectedFiled" >
                    </crmFieldSelect>
                </Col>
            </Row>
            <div class="aliCustomer-list-title" style="margin-top:30px">{{$t('crm.aliImport.aliCustomerT3')}}</div>
            <Row v-for="field in aliCustomerFields.contactInfo"
                :key="field.aliKey"
                class="ali-field-match">
                <Col :span="11">
                    <div>{{ field.aliLabel }}</div>
                </Col>
                <Col :span="2">
                    <Icon custom="custom custom-form-set-arrow"
                            color="#7B98B6"
                            size="15"></Icon>
                </Col>
                <Col :span="11">
                    <crmFieldSelect
                        :allChecked="allChecked"
                        :fieldListInCustomer="fieldListInCustomer"
                        :fieldListInContact="fieldListInContact"
                        :fieldListInInquiry="fieldListInInquiry"
                        :disabled="field.disabled"
                        :selectedFiled.sync="field.selectedFiled" >
                    </crmFieldSelect>
                </Col>
            </Row>
        </div>

        <!-- 保存按钮 -->
        <div class="text-center">
            <Button type="primary" :disabled="!authorized_button.changeMatchRel" @click="saveMatchRelation()" :loading="loading">{{ $t('save') }}</Button>
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
    import crmFieldSelect from './Components/crmFieldSelect';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import { aliImport } from '@/api/crm/index';
    import { mapState } from 'vuex';
    export default {
        name: 'aliCustomer',
        components: {
            crmFieldSelect
        },
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
                    // 保存关联关系
                    changeMatchRel: !HANDLE_BUTTON(BUTTON_IDS.CRM.aliImportCRX.changeMatchRel, this.button_list)
                };
            },
            allChecked() {
                const companyInfo = this.aliCustomerFields.companyInfo.map(item => item.selectedFiled).filter(item => item);
                const manageInfo = this.aliCustomerFields.manageInfo.map(item => item.selectedFiled).filter(item => item);
                const contactInfo = this.aliCustomerFields.contactInfo.map(item => item.selectedFiled).filter(item => item);
                return [].concat(companyInfo, manageInfo, contactInfo);
            },
            allCompanyInfoKey() {
                return this.aliCustomerFields.companyInfo.map(item => item.aliKey);
            },
            allManageInfoKey() {
                return this.aliCustomerFields.manageInfo.map(item => item.aliKey);
            },
            allContactInfoKey() {
                return this.aliCustomerFields.contactInfo.map(item => item.aliKey);
            }
        },
        data() {
            return {
                /* 左侧字段匹配 */
                loading: true,
                // 客户、询盘、联系人字段
                fieldListInCustomer: [],
                fieldListInContact: [],
                fieldListInInquiry: [],
                /* 多语言 */
                lang_company: {
                    companyName: this.$t('crm.Modal.corp_companyName'),
                    starLevel: this.$t('crm.Modal.corp_starLevel'),
                    shortName: this.$t('crm.Modal.corp_shortName'),
                    countryArea: this.$t('crm.Modal.corp_countryArea'),
                    mainProduct: this.$t('crm.Modal.corp_mainProduct'),
                    scale: this.$t('crm.Modal.corp_scale'),
                    clientType: this.$t('crm.Modal.corp_clientType'),
                    homePage: this.$t('crm.Modal.corp_homePage'),
                    phone: this.$t('crm.Modal.corp_phone'),
                    fax: this.$t('crm.Modal.corp_fax'),
                    contactAddress: this.$t('crm.Modal.corp_contactAddress'),
                    relatedCompany: this.$t('crm.Modal.corp_relatedCompany'),
                    companyPicture: this.$t('crm.Modal.corp_companyPicture'),
                    companyRemark: this.$t('crm.Modal.corp_companyRemark')
                },
                lang_contact: {
                    nickName: this.$t('crm.Modal.contact_nickName'),
                    jobTitle: this.$t('crm.Modal.contact_jobTitle'),
                    email: this.$t('crm.Modal.contact_email'),
                    phone: this.$t('crm.Modal.contact_phone'),
                    whatsApp: 'WhatsApp',
                    instagram: 'Instagram',
                    jobGrade: this.$t('crm.Modal.contact_jobGrade'),
                    socialNetworkingPlatform: this.$t('crm.Modal.contact_socialNetworkingPlatform'),
                    birthday: this.$t('crm.Modal.contact_birthday'),
                    gender: this.$t('crm.Modal.contact_gender'),
                    picture: this.$t('crm.Modal.contact_picture'),
                    remark: this.$t('crm.Modal.contact_remark')
                },
                lang_inquiry: {
                    productCategory: this.$t('crm.Modal.inq_productCategory'),
                    demandProducts: this.$t('crm.Modal.inq_demandProducts'),
                    inquiryScore: this.$t('crm.Modal.inq_inquiryScore'),
                    label: this.$t('crm.Modal.inq_label'),
                    sourceChannel: this.$t('crm.Modal.inq_sourceChannel'),
                    sourceWay: this.$t('crm.Modal.inq_sourceWay'),
                    grouping: this.$t('crm.Modal.inq_grouping'),
                    followUp: this.$t('crm.Modal.inq_followUp'),
                    estimatedInquiryAmount: this.$t('crm.Modal.inq_estimatedInquiryAmount'),
                    remark: this.$t('crm.Modal.inq_remark')
                },
                aliCustomerFields: {
                    companyInfo: [
                        { aliKey: 'companyName', aliLabel: this.$t('crm.aliImport.companyInfo1'), selectedFiled: '', disabled: true },
                        { aliKey: 'country', aliLabel: this.$t('crm.aliImport.companyInfo2'), selectedFiled: '', disabled: true },
                        { aliKey: 'website', aliLabel: this.$t('crm.aliImport.companyInfo3'), selectedFiled: '', disabled: false },
                        { aliKey: 'fax', aliLabel: this.$t('crm.aliImport.companyInfo4'), selectedFiled: '', disabled: false },
                        { aliKey: 'address', aliLabel: this.$t('crm.aliImport.companyInfo5'), selectedFiled: '', disabled: false }
                    ],
                    manageInfo: [
                        { aliKey: 'customerGroup', aliLabel: this.$t('crm.aliImport.manageInfo1'), selectedFiled: '', disabled: false },
                        { aliKey: 'listCustomerGroup', aliLabel: this.$t('crm.aliImport.manageInfo2'), selectedFiled: '', disabled: false },
                        { aliKey: 'importanceLevel', aliLabel: this.$t('crm.aliImport.manageInfo3'), selectedFiled: '', disabled: false },
                        { aliKey: 'purchaseCategoryList', aliLabel: this.$t('crm.aliImport.manageInfo4'), selectedFiled: '', disabled: false },
                        { aliKey: 'sourceList', aliLabel: this.$t('crm.aliImport.manageInfo5'), selectedFiled: '', disabled: false },
                        { aliKey: 'businessType', aliLabel: this.$t('crm.aliImport.manageInfo6'), selectedFiled: '', disabled: false },
                        { aliKey: 'annualProcurement', aliLabel: this.$t('crm.aliImport.manageInfo7'), selectedFiled: '', disabled: false },
                        { aliKey: 'registerDate', aliLabel: this.$t('crm.aliImport.manageInfo8'), selectedFiled: '', disabled: false },
                        { aliKey: 'gmtCreate', aliLabel: this.$t('crm.aliImport.manageInfo9'), selectedFiled: '', disabled: false },
                        { aliKey: 'manageInfoMemo', aliLabel: this.$t('crm.aliImport.manageInfo10'), selectedFiled: '', disabled: false }
                    ],
                    contactInfo: [
                        { aliKey: 'contactsName', aliLabel: this.$t('crm.aliImport.contactInfo1'), selectedFiled: '', disabled: true },
                        { aliKey: 'email', aliLabel: this.$t('crm.aliImport.contactInfo2'), selectedFiled: '', disabled: true },
                        { aliKey: 'highQualityLevelTag', aliLabel: this.$t('crm.aliImport.contactInfo3'), selectedFiled: '', disabled: false },
                        { aliKey: 'mobiles', aliLabel: this.$t('crm.aliImport.contactInfo4'), selectedFiled: '', disabled: false },
                        { aliKey: 'phoneNumbers', aliLabel: this.$t('crm.aliImport.contactInfo5'), selectedFiled: '', disabled: false },
                        { aliKey: 'ims-Linkedin', aliLabel: this.$t('crm.aliImport.contactInfo6'), selectedFiled: '', disabled: false },
                        { aliKey: 'ims-Facebook', aliLabel: this.$t('crm.aliImport.contactInfo7'), selectedFiled: '', disabled: false },
                        { aliKey: 'ims-Skype', aliLabel: this.$t('crm.aliImport.contactInfo8'), selectedFiled: '', disabled: false },
                        { aliKey: 'ims-WhatApp', aliLabel: this.$t('crm.aliImport.contactInfo9'), selectedFiled: '', disabled: false },
                        { aliKey: 'ims-WeChat', aliLabel: this.$t('crm.aliImport.contactInfo10'), selectedFiled: '', disabled: false },
                        { aliKey: 'position', aliLabel: this.$t('crm.aliImport.contactInfo11'), selectedFiled: '', disabled: false },
                        { aliKey: 'gender', aliLabel: this.$t('crm.aliImport.contactInfo12'), selectedFiled: '', disabled: false },
                        { aliKey: 'contactInfoMemo', aliLabel: this.$t('crm.aliImport.contactInfo13'), selectedFiled: '', disabled: false }
                    ]
                },
                // 初始请求得到的字段匹配关系
                originalRelations: '[]',
                // 当前线索模板字段
                crmFields: {},
                /* 离开前确认弹窗 */
                visible_beforeLeave: false
            };
        },
        methods: {
            //  获取crm数据
            getAllColumns() {
                this.fieldListInCustomer = [];
                this.fieldListInContact = [];
                this.fieldListInInquiry = [];
                this.$commonApi.getAllColumns({
                    orgId: this.enterpriseId,
                    parentId: 0,
                    moduleType: 1
                }).then(data => {
                    if (data.code === '1') {
                        const { customColumn, defaultColumn } = data.data;
                        defaultColumn.forEach(item => {
                            item.matchId = `${item.parentId}_${item.storageName}`;
                            switch (`${item.parentId}`) {
                                case '1':
                                    // 字段显示为多语言
                                    if (Object.prototype.hasOwnProperty.call(this.lang_company, item.storageName)) {
                                        item.cname = this.lang_company[item.storageName];
                                    }
                                    if (['companyName', 'countryArea'].includes(item.storageName)) {
                                        item.disabled = true;
                                    }
                                    this.fieldListInCustomer.push(item);
                                    break;
                                case '2':
                                    // 过滤社交平台，要单独处理
                                    if (item.storageName !== 'socialNetworkingPlatform') {
                                        // 字段显示为多语言
                                        if (Object.prototype.hasOwnProperty.call(this.lang_contact, item.storageName)) {
                                            item.cname = this.lang_contact[item.storageName];
                                        }
                                        if (['nickName', 'email'].includes(item.storageName)) {
                                            item.disabled = true;
                                        }
                                        this.fieldListInContact.push(item);
                                    }
                                    break;
                                case '3':
                                    // 字段显示为多语言
                                    if (Object.prototype.hasOwnProperty.call(this.lang_inquiry, item.storageName)) {
                                        item.cname = this.lang_inquiry[item.storageName];
                                    }
                                    this.fieldListInInquiry.push(item);
                                    break;
                            }
                        });
                        customColumn.show.forEach(field => {
                            field.colType = field.type;
                            field.matchId = `${field.parentId}_${field.storageName}`;
                            switch (`${field.parentId}`) {
                                case '1':
                                    this.fieldListInCustomer.push(field);
                                    break;
                                case '2':
                                    this.fieldListInContact.push(field);
                                    break;
                                case '3':
                                    this.fieldListInInquiry.push(field);
                                    break;
                            }
                        });
                        this.$commonApi.getFollowUpList({
                            orgId: this.enterpriseId,
                            typeId: 3
                        }).then(res => {
                            if (res.code === '1' && res.data.length) {
                                res.data.forEach(item => {
                                    item.cname = `${this.$t('crm.aliImport.social')}-${item.attrName}`;
                                    item.matchId = `2_socialNetworkingPlatform_${item.attrId}`;
                                    this.fieldListInContact.push(item);
                                });
                            }
                            this.getDataByOrgId();
                        });
                    }
                });
            },
            // 查询映射关系接口 参数  orgId   userId   type（1:客户字段映射 2：负责人字段映射）
            getDataByOrgId() {
                aliImport.getDataByOrgId({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    type: 1
                }).then((res) => {
                    this.loading = false;
                    if (res.code === '1' && res.data.relations) {
                        this.originalRelations = res.data.relations;
                        const relations = JSON.parse(res.data.relations);
                        relations.forEach(item => {
                            const aliKey = item.aliKey;
                            if (this.allCompanyInfoKey.includes(aliKey)) {
                                const index = this.aliCustomerFields.companyInfo.findIndex(info => info.aliKey === aliKey);
                                this.$set(this.aliCustomerFields.companyInfo[index], 'selectedFiled', item.selectedFiled);
                            } else if (this.allManageInfoKey.includes(aliKey)) {
                                const index = this.aliCustomerFields.manageInfo.findIndex(info => info.aliKey === aliKey);
                                this.$set(this.aliCustomerFields.manageInfo[index], 'selectedFiled', item.selectedFiled);
                            } else if (this.allContactInfoKey.includes(aliKey)) {
                                const index = this.aliCustomerFields.contactInfo.findIndex(info => info.aliKey === aliKey);
                                this.$set(this.aliCustomerFields.contactInfo[index], 'selectedFiled', item.selectedFiled);
                            }
                        });
                    } else {
                        this.$set(this.aliCustomerFields.companyInfo[0], 'selectedFiled', '1_companyName');
                        this.$set(this.aliCustomerFields.companyInfo[1], 'selectedFiled', '1_countryArea');
                        this.$set(this.aliCustomerFields.contactInfo[0], 'selectedFiled', '2_nickName');
                        this.$set(this.aliCustomerFields.contactInfo[1], 'selectedFiled', '2_email');
                        this.saveMatchRelation('init');
                    }
                });
            },
            // 保存映射关系 orgId   userId  relations（映射数据json字符串） type（1:客户字段映射 2：负责人字段映射）
            saveMatchRelation(type) {
                if (this.loading) return;
                this.loading = true;
                const companyInfo = this.aliCustomerFields.companyInfo.filter(item => item.selectedFiled);
                const manageInfo = this.aliCustomerFields.manageInfo.filter(item => item.selectedFiled);
                const contactInfo = this.aliCustomerFields.contactInfo.filter(item => item.selectedFiled);
                const relations = JSON.stringify(companyInfo.concat(manageInfo, contactInfo));
                aliImport.saveData({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    relations: relations,
                    type: 1
                }).then((res) => {
                    if (res.code === '1') {
                        if (!type) {
                            this.$Message.success(this.$t('crm.Table.success_save'));
                        }
                        // 如果之前有被中断的跳转动作, 继续跳转
                        if (this.toRouterObj) {
                            this.$router.push(this.toRouterObj);
                            return;
                        }
                        if (this.visible_beforeLeave) {
                            this.leaveDirectly();
                            return;
                        }
                        this.getDataByOrgId();
                    } else {
                        if (!type) {
                            this.$Message.error(this.$t('crm.Table.error_save'));
                        }
                    }
                    this.loading = false;
                });
            },
            /* 离开前确认弹窗 */
            // 检查字段匹配关系是否有变更, return true 代表有变更
            validateChanged() {
                // 如果没有修改权限, 不需要判断是否变更, 直接返回 false
                if (!this.authorized_button.changeMatchRel) {
                    return false;
                }
                const companyInfo = this.aliCustomerFields.companyInfo.filter(item => item.selectedFiled);
                const manageInfo = this.aliCustomerFields.manageInfo.filter(item => item.selectedFiled);
                const contactInfo = this.aliCustomerFields.contactInfo.filter(item => item.selectedFiled);
                const relations = JSON.stringify(companyInfo.concat(manageInfo, contactInfo));
                // 否则判断新数据和历史数据是否有不一致之处
                return relations !== this.originalRelations;
                // return false;
            },
            // 放弃离开
            cancelLeave() {
                this.visible_beforeLeave = false;
            },
            // 直接离开
            leaveDirectly() {
                this.$emit('beforeLeave', this.activeName, 'aliCustomer', true);
            },
            // 保存后离开
            leaveAfterSave() {
                this.saveMatchRelation();
            }
        },
        created() {
            this.getAllColumns();
        }
    };
</script>

<style lang="less" scoped>
    .aliCustomer-list-title {
        margin:0 10px 20px 0;
        padding-left: 10px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.28);;
        line-height: 30px;
        background: #F7F8FA;
    }
</style>>
