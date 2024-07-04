<template>
    <div v-loading="loading" :element-loading-text="$t('crm.Html.loading')" :style="is_marketing_station ? 'margin-top: 16px' : ''">
        <!-- 文本框 + 上传图片 + 底部按钮 -->
        <template>
            <template v-if="!is_marketing_station">
                <div class="input-panel" v-if="!inquiryId && !disabled && authorized_button['add_remark']" style="margin-top: 16px">
                    <!-- 右上角关闭按钮 -->
                    <div class="editArea-close" v-show="visible_full_panel" @click="close_input_panel">
                        <Icon custom="custom custom-follow-edit-area-close"></Icon>
                    </div>
                    <!-- 文本框 -->
                    <textarea
                        v-model="newRemark"
                        ref="remarkTextarea"
                        :rows="visible_full_panel ? 4 : 1"
                        class="input-panel-textarea"
                        :placeholder="$t('clue.fillClueRemark')"
                        style="line-height: 18px; font-size: 12px;"
                        maxlength="2000"
                        @focus="visible_full_panel = true">
                    </textarea>
                    <!-- 上传图片 -->
                    <div v-show="visible_full_panel">
                        <uploadPicture :fileCountLimit="9" :pictures="pictureList" class="followup_upload_picture" :isHidddenBtn="true"
                                    ref="uploadPictureCompo"></uploadPicture>
                    </div>
                    <!-- 上传附件 -->
                    <div v-show="visible_full_panel" style="padding: 8px 0;">
                        <uploadFiles :fileCountLimit="9" :filesList="pictures" class="followup_upload_picture" :isHidddenBtn="true"
                               ref="uploadImgCompo"></uploadFiles>
                    </div>
                    <!-- 底部按钮 -->
                    <div v-show="visible_full_panel" class="input-panel-bottom">
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
                        <div style="float: right">
                            <Button
                                type="primary"
                                :class="type==='clue'?'clue-add-remark':'high-seas-add-remark'"
                                :loading="addRemarkLoading"
                                @click="addRemark">
                                    {{ $t('crm.Html.submit') }}
                            </Button>
                        </div>
                    </div>
                </div>
            </template>
            <!-- 时间轴 -->
            <time-line
                    v-if="haveGetCompanyId"
                    v-on="$listeners"
                    :from="from"
                    :id="companyId!==''?companyId:id"
                    :flag="flag"
                    :type="companyId!==''? 'customer':'clue'"
                    :originalType="originalType"
                    :visible_full_panel="visible_full_panel"
                    @viewInquiry="viewInquiry"
                    :visitorId="visitorId">
            </time-line>
        </template>
    </div>
</template>

<script>
    import { env } from '../../../../../../build/config';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import timeLine from '@/views/main-components/timeline/index.vue';
    import uploadPicture from '@/views/crm/Detail/Components/Html/uploadPicture';
    import uploadFiles from '@/views/crm/Detail/Components/Html/uploadFiles';
    import { crmClue } from '@/api/crm';
    import { mapState, mapGetters } from 'vuex';
    import { triggerGtag } from '@/utils/base';

    export default {
        name: 'followUp',
        components: {
            timeLine,
            uploadPicture,
            uploadFiles
        },
        props: [
            'listType',
            'inquiryId',
            'visitorId',
            'id',
            'flag_inquiry_id_requested',
            'type',
            'originalType',
            'disabled',
            'from'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                qiniuHttp: 'qiniuHttp',
                button_list: state => state.app.button_list,
                is_marketing_station: state => state.app.is_marketing_station
            }), // 从 vuex 中获取属性
            ...mapGetters([
                'isHaveAuthority'
            ]),
            authorized_button() {
                return {
                    add_remark: !HANDLE_BUTTON(this.type === 'highseasClue' ? BUTTON_IDS.CRM.highseasClue.add_remark : BUTTON_IDS.CRM.clue.add_remark, this.button_list)
                };
            }
        },
        data() {
            return {
                addRemarkLoading: false,
                haveGetCompanyId: false,
                flag: false, // 是否刷新时间轴
                loading: true, // 加载中

                /* 询盘跟进 */
                visible_full_panel: false,
                newRemark: '', // 跟进记录
                /* 附件 */
                pictures: [], // 已上传附件列表
                /* 图片 */
                pictureList: [],
                companyId: '',
                /* 组件 */
                flag_update_remarks: false,
                // 控制新增跟进记录后刷新所有详情页 drawer 时间轴数据
                flag_new_followUp: true
            };
        },
        mounted() {
            document.addEventListener('paste', this.onPaste);
            document.addEventListener('dragover', this.onDragOver);
            document.addEventListener('drop', this.onDrop);
        },
        beforeDestroy() {
            document.removeEventListener('paste', this.onPaste);
            document.removeEventListener('dragover', this.onDragOver);
            document.removeEventListener('drop', this.onDrop);
        },
        methods: {
            HANDLE_BUTTON,
            async viewInquiry(inquiryId) {
                // 校验是否有该条询盘管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Inquiry',
                    id: inquiryId
                });
                if (!authorized) return;
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpInquiryInHighseas'));
                    return;
                }

                // 校验通过, 新标签页打开询盘详情
                localStorage.setItem('leadsCloud-inquiryId', inquiryId);
                window.open(this.$rootRouter.resolve({
                    name: 'myInquiry'
                }).href, '_blank');
            },
            /* 获取询盘跟进记录 */
            getCompanyId() {
                this.loading = true;
                crmClue.getCompanyIdByClueId({
                    orgId: this.enterpriseId,
                    clueId: this.id
                }).then(ret => {
                    if (ret.code === '1') {
                        if (ret.data.companyId) {
                            this.companyId = ret.data.companyId;
                        }
                    }
                    this.haveGetCompanyId = true;
                    this.loading = false;
                });
            },
            close_input_panel() {
                this.visible_full_panel = false;
                this.newRemark = '';
                this.pictures = [];
                this.pictureList = [];
            },
            /* 上传图片 */
            handleUploadFile() {
                this.$refs.uploadImgCompo.uploadTrigger();
            },
            pasteImg(file) {
                if (this.pictures.length === 9) {
                    this.$Message.error(this.$t('crm.Modal.file_uploadLengthLimit9'));
                } else {
                    this.$refs.uploadImgCompo.handleUpload({
                        target: {
                            files: [file]
                        }
                    });
                }
            },
            onPaste(e) {
                if (document.activeElement === this.$refs.remarkTextarea) {
                    if (e.clipboardData || e.originalEvent) {
                        const cbd = e.clipboardData || e.originalEvent.clipboardData;
                        const ua = window.navigator.userAgent;

                        // 如果是 Safari 直接 return
                        if (!(e.clipboardData && e.clipboardData.items)) {
                            return;
                        }

                        // Mac平台下Chrome49版本以下 复制Finder中的文件的Bug Hack掉
                        if (cbd.items && cbd.items.length === 2 && cbd.items[0].kind === 'string' && cbd.items[1].kind === 'file' &&
                            cbd.types && cbd.types.length === 2 && cbd.types[0] === 'text/plain' && cbd.types[1] === 'Files' &&
                            ua.match(/Macintosh/i) && Number(ua.match(/Chrome\/(\d{2})/i)[1]) < 49) {
                            return;
                        }

                        for (let i = 0; i < cbd.items.length; i++) {
                            const item = cbd.items[i];
                            if (item.kind === 'file') {
                                const blob = item.getAsFile();
                                if (blob.size === 0) {
                                    break;
                                }
                                this.pasteImg(blob);
                                return;
                            }
                        }
                    }
                }
            },
            onDragOver(e) {
                e.preventDefault();
            },
            onDrop(e) {
                if (!this.visible_full_panel) return;
                e.preventDefault();
                const eTargetClass = e.target.className;
                if (eTargetClass.indexOf('input-panel') >= 0 ||
                    eTargetClass.indexOf('file-com') >= 0 ||
                    eTargetClass.indexOf('upload-btn') >= 0 ||
                    eTargetClass.indexOf('file-name') >= 0 ||
                    eTargetClass.indexOf('file-size') >= 0 ||
                    eTargetClass.indexOf('followup-content-edit-text') >= 0 ||
                    eTargetClass.indexOf('upload-btn-icon') >= 0 ||
                    eTargetClass.indexOf('file-list-box') >= 0) {
                    if (e.dataTransfer) {
                        const data = e.dataTransfer;

                        const files = [];
                        for (let i = 0; i < data.items.length; i++) {
                            const item = data.items[i];
                            if (item.kind === 'file') {
                                const blob = item.getAsFile();
                                if (blob.size === 0) {
                                    break;
                                }
                                files.push(blob);
                            }
                        }
                        this.dropImg(files);
                    }
                }
            },
            dropImg(files) {
                if (files.length) {
                    if (this.pictures.length === 9) {
                        this.$Message.error(this.$t('crm.Modal.file_uploadLengthLimit9'));
                    } else {
                        this.$refs.uploadImgCompo.handleUpload({
                            target: {
                                files: files
                            }
                        });
                    }
                }
            },
            handleUploadPicture() {
                this.$refs.uploadPictureCompo.uploadTrigger();
            },
            /* 添加线索备注 */
            addRemark() {
                // 附件是否上传完成
                if (Array.isArray(this.pictures) && this.pictures.some(item => item.uploading)) {
                    this.$Message.warning(this.$t('crm.Modal.fileUoloading'));
                    return;
                }
                // 图片是否上传完成
                if (Array.isArray(this.pictureList) && this.pictureList.some(item => item.uploading)) {
                    this.$Message.warning(this.$t('crm.Modal.fileUoloading'));
                    return;
                }
                if (this.newRemark.trim() === '') {
                    this.$Message.warning(this.$t('clue.error_emptyRemark'));
                    return;
                }
                /**
                 * @Date: 2020-06-28 17:30:22
                 * @LastEditors: niumkiki
                 * @description: 后端要求：增加两个参数 orgId, userId
                 * @param :
                 * @return:
                 */
                const imageType = ['jpg', 'jpeg', 'png', 'gif'];
                const files = this.pictures.map(item => `${item.url}?name=${item.name}&type=${item.type}&size=${item.size}&fileType=${imageType.includes(item.type) ? 'image' : 'file'}`);
                // 图片
                const pictures = this.pictureList.map(item => item.url);
                this.addRemarkLoading = true;
                const jsonData = {
                    recordId: this.id,
                    recordType: 1,
                    content: this.newRemark,
                    createPerson: this.fullName,
                    pictures: files.join(','),
                    attachment: pictures.join(','),
                    orgId: this.enterpriseId,
                    userId: this.userId
                };
                triggerGtag('CRM', '线索跟进记录');
                crmClue.remarkSave(jsonData).then(res => {
                    if (res.code === '1') {
                        // 新增一个添加到时间线的接口---将eventId返回给后台
                        const data = {
                            enterpriseId: this.enterpriseId,
                            followupType: 1,
                            clueId: this.id,
                            eventId: res.data
                        };
                        crmClue.saveClueEventAction(data).then(res => {
                            this.$Message.success(this.$t('clue.add_success'));
                            this.flag_update_remarks = !this.flag_update_remarks;
                            this.pictures = [];
                            this.pictureList = [];
                            this.newRemark = '';
                            // 监听父组件有没有change_flag_new_followUp,如果有, 则调用 change_flag_new_followUp 改变 flag_new_followUp , 触发所有详情页 drawer 重新请求时间轴数据操作\
                            /** change_flag_new_followUp 方法是改变 flag_new_followUp,并且 flag_new_followUp 是此页面使用和触发改变的，所以不需要在从上层组件定义在传过来
                             * 解决方法：去掉 ClueDrawerList.vue 组件的定义以及传参，直接在此页面定义和触发改变
                             * */
                            this.flag_new_followUp = !this.flag_new_followUp;
                            this.$emit('updateClueStatusByFollowupOrEmail');
                        });
                    } else {
                        this.$Message.error(this.$t('saveFail'));
                    }
                    this.addRemarkLoading = false;
                });
            }
        },
        watch: {
            flag_inquiry_id_requested: {
                handler(val) {
                    if (val) {
                        if (this.inquiryId) {
                            this.getCompanyId();
                        } else {
                            this.haveGetCompanyId = true;
                            this.loading = false;
                        }
                    }
                },
                immediate: true
            },
            flag_new_followUp() {
                this.flag = false;
                this.$nextTick(() => {
                    this.flag = true;
                });
            }
        }
    };
</script>

<style lang="less">
    .editArea-close {
        display: inline-block;
        position: absolute;
        right: 10px;
        top: 10px;
        cursor: pointer;
    }
</style>
<style lang="less" scoped>

    .input-panel {
        width: 100%;
        position: relative;
        background: #FFFFFF;
        border: 1px solid #E6E6E6;
        border-radius: 2px;
        line-height: 0;
        font-size: 12px;
        line-height: 0;
        > * {
            line-height: normal;
        }

        textarea {
            border-radius: 4px;
        }
    }

    .input-panel-textarea {
        border: 0;
        outline: 0px;
        resize: none;
        width: 100%;
        padding: 7px 12px;
    }

    .input-panel-bottom {
        height: 50px;
        line-height: 50px;
        vertical-align: middle;
        background: #f8f8f9;
        color: #656565;
        padding: 0 10px;
        font-size: 12px;
    }
    .followup_upload_picture {
        display: flex;
        flex-wrap: nowrap;
        flex-direction: row;
        margin-left: 10px;
        .upload-btn {
             padding: 0;
            margin-right: 12px;
            border:1px dashed #c9c9c9;
            flex-shrink: 0;
        }
        /deep/ .picture-item {
            margin-bottom: 0;
        }
    }
    // .file-list-box {
    //     width: calc(100% - 64px);
    //     display: flex;
    //     flex-wrap: nowrap;
    //     justify-content: start;
    //     align-items: center;
    //     overflow-x: auto;
    //     overflow-y: hidden;
    // }
    // .files-item {
    //     display: flex;
    //     flex-wrap: nowrap;
    //     justify-content: start;
    //     flex-shrink: 0;
    //     display: flex;
    //     justify-content: start;
    //     align-items: center;
    //     width: 170px;
    //     padding: 0 10px;
    //     height: 40px;
    //     text-align: center;
    //     vertical-align: middle;
    //     border: 1px solid transparent;
    //     border-radius: 4px;
    //     //overflow: hidden;
    //     background: #F5F6F9;
    //     position: relative;
    //     margin-right: 8px;
    //     font-size: 12px;
    //     .file-box {
    //         width: calc(100% - 32px);
    //     }
    //     i {
    //         margin-right: 8px;
    //     }
    //     p {
    //         text-align: left;
    //         line-height: 16px;
    //     }
    //     .file-com{
    //         display: flex;
    //         justify-content: start;
    //         .file-name {
    //             display: block;
    //             overflow: hidden;
    //             text-overflow: ellipsis;
    //             white-space: nowrap;
    //         }
    //         .file-type {
    //             white-space: nowrap;
    //         }
    //     }
    //     &:hover {
    //         .img-remove-icon {
    //             display: block;
    //         }
    //     }
    // }
    // .img-remove-icon {
    //     display: none;
    //     line-height: 1;
    //     position: absolute;
    //     top: 0px;
    //     right: -10px;

    //     i {
    //         color: #EA4335;
    //         font-size: 14px;
    //         cursor: pointer;
    //     }
    // }
    // .uploading-cover {
    //     position: absolute;
    //     top: -1px;
    //     bottom: -1px;
    //     left: -1px;
    //     right: -1px;
    //     border-radius: 4px;
    //     line-height: 38px;
    //     background: rgba(0, 0, 0, .4);
    //     /deep/.el-progress__text{
    //         color: #fff;
    //     }
    // }
    .annex-file-icon{
        width: 14px;
        height: 16px;
        margin-right: 8px;
        vertical-align: middle;
        fill: currentColor;
        overflow: hidden;
    }
</style>
