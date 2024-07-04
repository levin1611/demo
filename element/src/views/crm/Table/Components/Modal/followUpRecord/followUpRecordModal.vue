<template>
    <div>
        <Modal :visible="visible"
            :title="!detail ? $t('crm.followUpRecord.newFollowUpRecord') :  $t('crm.followUpRecord.editFollowUpRecord')"
            width="778px"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            :append-to-body="true"
            :show-close="true"
            @close="handleClose()"
            class="field-modal">
            <Form label-width="80px"
                :model="ruleForm"
                ref="ruleForm"
                label-position="left">
                <Row type="flex"
                    ref="sort-type">
                        <Col
                            :xs="24"
                            :sm="24"
                            :md="24">
                            <FormItem required :show-message="false">
                                <template slot="label">
                                    <span :title="$t('crm.followUpRecord.associatedCustomers')">{{ $t('crm.followUpRecord.associatedCustomers') }}</span>
                                </template>
                                <div style="position:relative">
                                    <Input
                                        v-model.trim="ruleForm.companyName"
                                        maxlength="100"
                                        readonly
                                        :disabled="Boolean(detail)"
                                        :placeholder="$t('crm.Modal.tip_select')"
                                    >
                                    </Input>
                                    <Button type="text" class="select_company" @click="select_company_modal=true" :disabled="selectCompanyBtn">{{$t('crm.followUpRecord.select')}}</Button>
                                </div>
                            </FormItem>
                        </Col>
                </Row>
                <Row type="flex"
                    ref="sort-type">
                    <Col
                        :xs="12"
                        :sm="24"
                        :md="12">
                        <FormItem required :show-message="false">
                            <template slot="label">
                                <span :title="$t('crm.Html.followUpTime')">{{ $t('crm.Html.followUpTime') }}</span>
                            </template>
                            <DatePicker v-model="ruleForm.followupTime"
                                type="datetime"
                                :picker-options="followOptions"
                                format="yyyy-MM-dd HH:mm:ss"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                :placeholder="$t('crm.Html.tip_selectDate')"
                                :editable="false"
                                placement="top-start"
                                ></DatePicker>
                            </FormItem>
                    </Col>
                    <Col
                        :xs="12"
                        :sm="24"
                        :md="12">
                        <FormItem required :show-message="false">
                            <template slot="label">
                                <span :title="$t('crm.followUpRecord.followUpStatus')">{{ $t('crm.followUpRecord.followUpStatus') }}</span>
                            </template>
                            <Select v-model="ruleForm.followupType" @change="handelFollowupType"
                                placement="top">
                                <Option v-for="(item,index) in followupTypes" :value="item.value" :label="item.label" :key="index" :disabled="item.disabled"></Option>
                            </Select>
                        </FormItem>
                    </Col>
                </Row>
                <Row type="flex"
                    ref="sort-type">
                    <Col
                        :xs="24"
                        :sm="24"
                        :md="24">
                        <!-- 文本框 + 上传图片 + 底部按钮 -->
                        <FormItem required :show-message="false" label-width="0">
                            <div class="input-panel">
                                <!-- 文本框 -->
                                <Input type="textarea"
                                    v-model="ruleForm.followupContent"
                                    ref="followUpTextArea"
                                    :rows="6"
                                    :placeholder="$t('crm.followUpRecord.followupContentPlaceholder')"
                                    maxlength="2000">
                                </Input>
                                <p class="followup-content-edit-text">
                                    {{$t('facebook.onekeyRelease.creatContent.entered')}}
                                    <span class="followup-content-edit-text-limit">
                                        <span :style="followupContentLimitcolor">{{ ruleForm.followupContent.length }}</span>
                                        <span>/</span>
                                        <span>2000</span>
                                    </span>
                                </p>
                                <!-- 上传图片 -->
                                <div>
                                    <uploadPicture :fileCountLimit="9" :pictures="pictureList" class="followup_upload_picture" :isHidddenBtn="true"
                                        ref="uploadPictureCompo"></uploadPicture>
                                </div>
                                <div style="padding: 8px 0;">
                                    <uploadFiles :fileCountLimit="9" :filesList="filesList" class="followup_upload_picture" :isHidddenBtn="true"
                                        ref="uploadImgCompo"></uploadFiles>
                                </div>
                                <!-- 底部按钮 -->
                                <div class="input-panel-bottom">
                                    <span class="cursor-pointer" @click="handleUploadPicture" style="margin-right: 20px;">
                                        <svg class="annex-file-icon" aria-hidden="true">
                                            <use xlink:href="#custom-tupian"></use>
                                        </svg>{{ $t('crm.UniSet.followUpModeFormLable5') }}
                                    </span>
                                    <span class="cursor-pointer" @click="handleUploadFile">
                                        <svg class="annex-file-icon" aria-hidden="true">
                                            <use xlink:href="#custom-fujian"></use>
                                        </svg>{{ $t('crm.Html.attachment') }}
                                    </span>
                                </div>
                            </div>
                        </FormItem>
                    </Col>
                </Row>
            </Form>
            <div slot="footer">
                <Button type="primary"
                    size="large"
                    :disabled="submitFollowDisabled"
                    @click="ok">{{ $t('crm.Html.submit') }}</Button>
            </div>
        </Modal>
        <selectCompany
            v-if="select_company_modal"
            :visible.sync="select_company_modal"
            @handleCompany="handleCompany"
            ></selectCompany>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { triggerGtag } from '@/utils/base';
    import uploadFiles from '@/views/crm/Detail/Components/Html/uploadFiles';
    import uploadPicture from '@/views/crm/Detail/Components/Html/uploadPicture';
    import selectCompany from '@/views/crm/Table/Components/Modal/followUpRecord/selectCompany';

    export default {
        name: 'followUpRecordModal',
        components: {
            uploadFiles,
            uploadPicture,
            selectCompany
        },
        props: [
            'visible',
            'detail',
            'defaultCustomer'
        ],
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId',
                fullName: 'fullName',
                followupType: state => state.crm.followUpType
            }),
            followupTypes() {
                if (this.detail) {
                    return this.followupType;
                } else {
                    return this.followupType.filter(item => !item.disabled);
                }
            },
            followupContentLimitcolor() {
                if (this.currentResource && this.currentResource.numberStatus && (this.ruleForm.followupContent.length < Number(this.currentResource.number))) {
                    return 'color:#EA4335';
                } else if (this.ruleForm.followupContent.length) {
                    return 'color:#4285F2';
                } else {
                    return '';
                }
            }
        },
        data() {
            return {
                ruleForm: {
                    companyName: '',
                    followupTime: this.$options.filters.timeFormat(new Date(), 'DateTime'),
                    followupType: '00',
                    followupContent: ''
                },
                checkedCompany: null,
                currentResource: null,
                filesList: [],
                pictureList: [],
                saveing: false,
                // 跟进日期限制
                followOptions: {
                    disabledDate(date) {
                        return date.getTime() < 0 || date.getTime() > Date.now();
                    }
                },
                select_company_modal: false,
                selectCompanyBtn: false,
                submitFollowDisabled: false
            };
        },
        methods: {
            handleClose() {
                this.submitFollowDisabled = false;
                this.currentResource = null;
                this.$emit('update:defaultCustomer', null);
                this.$emit('update:visible', false);
            },
            handleCompany(item) {
                this.checkedCompany = item;
                this.$set(this.ruleForm, 'companyName', item.companyName);
            },
            ok() {
                if (this.saveing) return;
                if (!this.ruleForm.companyName) {
                    this.$Message.error(this.$t('crm.followUpRecord.tips_selectCompany'));
                    return;
                }
                if (!this.ruleForm.followupTime) {
                    this.$Message.error(this.$t('crm.Html.error_emptyDateAndTime'));
                    return;
                }
                if (!this.ruleForm.followupContent || !this.ruleForm.followupContent.trim()) {
                    this.$Message.error(this.$t('crm.Html.error_emptyFollowUpContent'));
                    return;
                }
                if (this.currentResource.numberStatus && (this.ruleForm.followupContent.length < Number(this.currentResource.number))) {
                    this.$Message.error(this.$t('crm.Html.followUpBoxTip2') + this.currentResource.number + this.$t('crm.Html.followUpBoxTip3'));
                    return;
                }
                // 附件是否上传完成
                if (Array.isArray(this.filesList) && this.filesList.some(item => item.uploading)) {
                    this.$Message.warning(this.$t('crm.Modal.fileUoloading'));
                    return;
                }
                // 图片是否上传完成
                if (Array.isArray(this.pictureList) && this.pictureList.some(item => item.uploading)) {
                    this.$Message.warning(this.$t('crm.Modal.imageUploading'));
                    return;
                }
                if (this.currentResource.picturesStatus && !this.pictureList.length) {
                    this.$Message.error(this.$t('crm.Html.followUpBoxTip4'));
                    return;
                }
                if (this.currentResource.attachmentStatus && !this.filesList.length) {
                    this.$Message.error(this.$t('crm.Html.followUpBoxTip5'));
                    return;
                }
                this.saveing = true;
                let url = '';
                const imageType = ['jpg', 'jpeg', 'png', 'gif'];
                const files = this.filesList.map(item => `${item.url}?name=${item.name}&type=${item.type}&size=${item.size}&fileType=${imageType.includes(item.type) ? 'image' : 'file'}&id=${item.id}`);
                // 图片
                const pictures = this.pictureList.map(item => item.url);
                const sendData = {
                    followupContent: this.ruleForm.followupContent.trim(),
                    followupTime: new Date(this.ruleForm.followupTime).getTime(),
                    followupType: this.ruleForm.followupType,
                    pictures: JSON.stringify(files),
                    attachment: JSON.stringify(pictures),
                    isCreateTask: 0
                };
                if (this.detail) {
                    url = '/crm/followup/updateFollowupCommon';
                    sendData.followupId = this.detail.id;
                    sendData.eventActionId = this.detail.eventActionId; // timeLineId
                    sendData.targetType = this.detail.target_type;
                    sendData.targetId = this.detail.target_id;
                    sendData.updateUser = this.fullName;
                    sendData.updateUserId = this.userId;
                    sendData.orgId = this.orgId;
                    sendData.companyId = this.detail.company_id;
                } else {
                    url = '/crm/followup/saveFollowupCommon';
                    sendData.enterpriseId = this.orgId;
                    sendData.targetType = 1;
                    sendData.targetId = this.checkedCompany.companyId;
                    sendData.companyId = this.checkedCompany.companyId;
                }

                if (url === '/crm/followup/saveFollowupCommon') {
                    triggerGtag('CRM', '询盘跟进记录');
                }
                this.$util.ajax({
                    url,
                    method: 'post',
                    data: sendData
                }).then(response => {
                    this.saveing = false;
                    if (response.data.code === '1') {
                        // 弹出成功提示语
                        this.$Message.success(this.$t('crm.Html.success_saveFollowUp'));
                        this.$emit('changeFollowUp');
                        this.handleClose();
                    } else {
                        this.$Message.error(this.$t('crm.Html.error_saveFollowUp'));
                    }
                });
            },
            handelFollowupType(val) {
                this.submitFollowDisabled = false;
                this.currentResource = this.followupType.find(item => Number(item.value) === Number(val));
                if (this.currentResource.positionPunch) {
                    this.$alert(this.$t('crm.Html.followUpBoxTip'), '', {
                        confirmButtonText: this.$t('crm.Html.modal_ok'),
                        showCancelButton: false
                    }).then(() => {
                    });
                    this.submitFollowDisabled = true;
                    return;
                }
                if (!this.detail) {
                    if (this.currentResource.attrValue && this.ruleForm.followupContent.trim().length) {
                        this.$confirm(this.$t('crm.Html.followUpBoxTip1'), this.$t('crm.Html.followUpBoxTip1Title'), {
                            confirmButtonText: this.$t('crm.Html.followUpBoxTip1CancelButton'),
                            cancelButtonText: this.$t('crm.Html.followUpBoxTip1ConfirmButton')
                        }).then(() => {
                            this.ruleForm.followupContent = this.currentResource.attrValue;
                        }).catch(() => {
                        });
                    } else if (this.currentResource.attrValue) {
                        this.ruleForm.followupContent = this.currentResource.attrValue;
                    }
                }
                // this.ruleForm.followupContent = this.currentResource.attrValue ? this.currentResource.attrValue : '';
            },
            handleUploadFile() {
                this.$refs.uploadImgCompo.uploadTrigger();
            },
            handleUploadPicture() {
                this.$refs.uploadPictureCompo.uploadTrigger();
            }
        },
        mounted() {
            if (!this.detail) {
                // this.currentResource = this.followupType.find(item => Number(item.value) === Number(this.ruleForm.followupType));
                // this.ruleForm.followupContent = this.currentResource.attrValue;
                this.handelFollowupType(this.ruleForm.followupType);
            }
        },
        beforeDestroy() {
        },
        watch: {
            detail: {
                handler(val) {
                    if (val) {
                        this.currentResource = this.followupType.find(item => Number(item.value) === val.followup_type);
                        this.ruleForm = {
                            companyName: val.companyName,
                            followupTime: this.$options.filters.timeFormat(val.followup_time, 'yyyy-MM-dd hh:mm:ss'),
                            followupType: this.currentResource ? this.currentResource.value : '01',
                            followupContent: val.followup_content
                        };
                        this.filesList = JSON.parse(JSON.stringify(val.pictures));
                        this.pictureList = [];
                        const pictureList = JSON.parse(JSON.stringify(val.attachment));
                        if (pictureList && pictureList.length) {
                            pictureList.forEach(item => {
                                let obj = {};
                                obj = {
                                    url: item
                                };
                                this.pictureList.push(obj);
                            });
                        }
                        this.selectCompanyBtn = true;
                    } else {
                        this.selectCompanyBtn = false;
                    }
                },
                immediate: true
            },
            defaultCustomer: {
                handler(val) {
                    if (val) {
                        this.selectCompanyBtn = true;
                        this.checkedCompany = val;
                        this.$set(this.ruleForm, 'companyName', val.companyName);
                    }
                },
                immediate: true
            }
        }
    };
</script>


<style lang="less" scoped>
    .el-input{
        font-size: 12px;
    }
    .el-select {
        width: 100%;
        font-size: 12px;
        /deep/.el-input{
            font-size: 12px;
        }
    }
    .select_company {
        position: absolute;
        right: 12px;
        font-size: 12px;
        height: 40px;
        color:#3B78DE;
        cursor: pointer;
    }
    .select_company.is-disabled {
        color: #C0C4CC;
    }
    .input-panel {
        width: 100%;
        position: relative;
        background: #FFFFFF;
        border: 1px solid #E6E6E6;
        border-radius: 4px;
        font-size: 12px;
        line-height: 0;
        > * {
            line-height: normal;
        }
    }
    /deep/.el-textarea__inner {
        border: none;
        outline: 0;
        resize: none;
        border-radius: 4px;
        line-height: 16px;
        font-size: 12px;
        &:focus, &:hover{
            box-shadow: none;
        }
    }
    .input-panel-bottom {
        height: 50px;
        line-height: 50px;
        vertical-align: middle;
        background: #f8f8f9;
        color: #656565;
        padding: 0 10px;
    }

    .followup_upload_picture {
        display: flex;
        flex-wrap: nowrap;
        flex-direction: row;
        margin-left: 10px;

        /deep/ .picture-item {
            margin-bottom: 0;
        }
    }

    .followup-content-edit-text {
        text-align: right;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.40);
        margin: 0 10px;
    }

    .followup-content-edit-text-limit {
        color: #FA8241;
    }
    .annex-file-icon{
        width: 14px;
        height: 16px;
        margin-right: 8px;
        vertical-align: middle;
        fill: currentColor;
        overflow: hidden;
    }
    /deep/.el-form-item__label{
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
