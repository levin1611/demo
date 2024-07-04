<template>
    <div class="cloud-push-add" style="position:relative;">
        <div class="cloud-push-add-head">
            <div class="btn__step__base">
                <div class="cloud-push-head-text _f _a_c">{{title}} <span @click.stop="tourDefaultStart" class="base__icon_config custom custom-tip piwik_steps_help_Briefcase_add" style="margin-left:7px;font-size:14px"></span> </div>
                <div v-if="forbiddenAllBehaviers" id="v-step-b-all" class="forbidden__modal_circle1  __position1"></div>
            </div>
            <Button class="cloud-push-head-return add_goback" @click="goBack">{{$t('material.New.return')}}</Button>
        </div>
        <div>
            <Form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="80px">
                <FormItem :label="$t('material.New.shareFiles')"  required>
                    <Button size="mini" class="image-select add_file" @click="handleFileSelected">{{$t('material.New.selectFile')}}</Button>
                    <div class="cloud-push-file" v-if="fileInfo.filename">
                        <!-- <svg class="svg-icon custom" aria-hidden="true" v-if="fileInfo.suffix === 'pdf'" style="display: inline-block;font-size:30px;">
                            <use xlink:href="#custom-PDF"></use>
                        </svg>
                        <svg class="svg-icon custom" aria-hidden="true" v-else-if="fileInfo.suffix === 'ppt' || fileInfo.suffix === 'pptx'" style="display: inline-block;font-size:30px;">
                            <use xlink:href="#custom-PPT"></use>
                        </svg>
                        <svg class="svg-icon custom" aria-hidden="true" v-else-if="fileInfo.suffix === 'xlsx' || fileInfo.suffix === 'xls'" style="display: inline-block;font-size:30px;">
                            <use xlink:href="#custom-Excel"></use>
                        </svg>
                        <svg class="svg-icon custom" aria-hidden="true" v-else-if="fileInfo.suffix === 'doc' || fileInfo.suffix === 'docx'" style="display: inline-block;font-size:30px;">
                            <use xlink:href="#custom-Word"></use>
                        </svg>
                        <svg class="svg-icon custom" aria-hidden="true" v-else-if="fileInfo.suffix === 'csv'" style="display: inline-block;font-size:30px;">
                            <use xlink:href="#custom-CSV"></use>
                        </svg>
                        <svg class="svg-icon custom" aria-hidden="true" v-else-if="fileInfo.suffix === 'jpg'" style="display: inline-block;font-size:30px;">
                            <use xlink:href="#custom-JPG"></use>
                        </svg>
                        <svg class="svg-icon custom" aria-hidden="true" v-else-if="fileInfo.suffix === 'png'" style="display: inline-block;font-size:30px;">
                            <use xlink:href="#custom-PNG"></use>
                        </svg>
                        <svg class="svg-icon custom" aria-hidden="true" v-else-if="fileInfo.suffix === 'gif'" style="display: inline-block;font-size:30px;">
                            <use xlink:href="#custom-GIF"></use>
                        </svg>
                        <svg class="svg-icon custom" aria-hidden="true" v-else style="display: inline-block;font-size:30px;">
                            <use xlink:href="#custom-rect"></use>
                        </svg> -->
                        <fileNameIcon :iconName="fileInfo.suffix" :styles="{fontSize:'30px'}"></fileNameIcon>
                        <div class="cloud-push-file-text">
                            <span class="cloud-push-file-name">{{fileInfo.filename }}</span>
                            <div class="cloud-push-file-num">
                                <span class="cloud-push-file-time">{{fileInfo.updateTime}}</span>
                                <span>{{fileInfo.size | sizeConversion}}</span>
                            </div>
                        </div>
                        <Icon custom="custom custom-delete1" size="10" @click="deleteFiles"></Icon>
                    </div>
                </FormItem>
                <FormItem :label="$t('material.cloudPush.title')" prop="title">
                    <Input placeholder="请输入标题" v-model="ruleForm.title" style="width: 500px;"></Input>
                </FormItem>
                <FormItem :label="$t('material.cloudPush.description')" prop="des">
                    <div style="display:flex;flex-direction: column;">
                        <div style="display: flex;align-items: center;">
                            <el-switch v-model="ruleForm.isEditStyle "  style="margin-bottom: 10px;">
                            </el-switch>
                            <span style="margin-left: 7px;">增加富文本描述，仅显示于智能物料页面内</span>
                            <Tooltip content="支持智能物料内添加丰富样式的描述信息" placement="top">
                                <span  class="base__icon_config custom custom-tip " style="margin-left:7px;font-size:14px"></span> 
                            </Tooltip>
                        </div>
                  
                    <Input type="textarea" :rows="2" placeholder="请输入描述" v-model="ruleForm.des" style="width: 500px;"></Input>
                    </div>
                </FormItem>
                <FormItem class="cloudPushAdd_editor">
                        <div id="vModalEditor" placeholder="请输入智能物料页面所显示的描述"></div>
                </FormItem>
                <FormItem :label="$t('material.cloudPush.image')"  required>
                    <div class="cloud-push-image-wrapper">
                        <div class="cloud-push-image-left">
                            <div class="image-upload">
                                <img v-if="ruleForm.portrait" class="cloud-push-image" :src="ruleForm.portrait">
                                <img v-else class="cloud-push-image" src="./images/report.png" alt="">
                                <input
                                        type="file"
                                        multiple
                                        accept="image/png,image/jpeg,image/gif"
                                        style="display: none"
                                        ref="uploadEl"
                                        class="cloud-push-image"
                                        @change="previewImage">
                                <Button size="mini" class="image-change add_changeimage" @click="uploadTrigger">{{$t('material.cloudPush.changeImg')}}</Button>
                            </div>
                            <div class="cloud-push-size">*{{$t('material.tips.imgTip')}}</div>
                        </div>
                        <div class="cloud-push-right">
                            <span class="cloud-push-sketch">{{$t('material.cloudPush.sharingDiagram')}}</span>
                            <div class="cloud-push-map">
                                <img class="cloud-push-report" src="./images/report.png">
                                <span class="cloud-push-com">example.com</span>
                                <span class="cloud-push-title-one">{{$t('material.New.shareTitle')}}</span>
                                <span class="cloud-push-text-one">分享内容描述第一行</span>
                            </div>
                        </div>
                    </div>
                </FormItem>
                <div>
                    <Checkbox class="piwik_Facebook_authorization" v-model="checked">{{$t('material.tips.fbTip')}}</Checkbox>
                </div>
                <div class="cloud-push-button _f _r">
                    <div class="btn__step__base">
                        <Button type="primary" @click="share('ruleForm')" :loading="shareLoading" :disabled="addLoading ? true : false" class="add_share">{{$t('material.Btn.oneClickShare')}}</Button>
                        <div v-if="forbiddenAllBehaviers" id="v-step-b-shared" class="forbidden__modal_circle __position2"></div>
                    </div>
                    <div class="btn__step__base">
                        <Button type="primary" @click="preserve('ruleForm')" :loading="addLoading" :disabled="shareLoading ? true : false" class="add_preserve">{{$t('material.Btn.save')}}</Button>
                        <div v-if="forbiddenAllBehaviers" id="v-step-b-save" class="forbidden__modal_circle __position1"></div>
                    </div>
                    <div class="btn__step__base">
                        <Button class="add_previwe" @click="preview">{{$t('material.Btn.preview')}}</Button>
                        <div v-if="forbiddenAllBehaviers" id="v-step-b-preview" class="forbidden__modal_circle __position1"></div>
                    </div>
                    <Button class="add_cancel" style="margin-left:10px"  @click="goBack">{{$t('material.Btn.cancel')}}</Button>
                </div>
            </Form>
        </div>
        <!-- 选择文件弹窗       -->
        <dataBaseModal :visible.sync="selectFileModal" @getFile="getFile" @activeTab="activeTab"></dataBaseModal>
        <!--  预览弹窗      -->
        <CloudPushPreview ref="childPreview" :images="ruleForm.portrait" :prviewVisible.sync="previewModel" @changePreviewModel="getMsg"></CloudPushPreview>
        <!--  一键分享   -->
        <OnekyeShare ref="child" :dialogVisible.sync="dialogVisible" @changeShareModel="getMsgShare" @toHomePage="getShareBack"></OnekyeShare>
        <!-- <OnekyeShare ref="child" :dialogVisible.sync="dialogVisible"></OnekyeShare>-->
        <stepVtourModal width="660px" :ref="tourRef" :callbacksTour="callbacksTourDefault" :steps="defaultTourSteps" :name="tourName"></stepVtourModal>
        <div v-if="forbiddenAllBehaviers" class="forbidden__modal" id="v-step-b-content"></div>
        <Upload
            ref="imageUpload"
            :on-success="insertImage"
            :action="action"
            accept=".png,.jpeg,.jpg,.gif,.bmp,.ico"
            style="display:none">
        </Upload>
    </div>
</template>

<script>
    import tinymce from 'tinymce/tinymce';
    import 'tinymce/themes/silver';
    /** 解决tinymce Firefox浏览器兼容问题 */
    import 'tinymce/plugins/paste';
    import 'tinymce/plugins/image';
    import 'tinymce/plugins/link';
    import 'tinymce/plugins/autolink';
    import 'tinymce/plugins/lists';
    import 'tinymce/plugins/hr';
    import 'tinymce/plugins/nonbreaking';
    import 'tinymce/plugins/charmap';
    import 'tinymce/plugins/print';
    import 'tinymce/plugins/anchor';
    import 'tinymce/plugins/imagetools';
    import 'tinymce/plugins/media';
    import 'tinymce/plugins/save';
    import 'tinymce/plugins/directionality';
    import 'tinymce/plugins/textcolor';
    import 'tinymce/plugins/colorpicker';
    import 'tinymce/plugins/textpattern';
    import 'tinymce/plugins/fullscreen';
    import 'tinymce/plugins/table';
    import 'tinymce/plugins/code';
    import 'tinymce/plugins/emoticons';
    import 'tinymce/icons/default';
    import '@/utils/tinymcplaceholder'
    import CloudPushPreview from './cloudPushPreview';
    import dataBaseModal from './dataBaseComponents/dataBaseModal';
    import util from '@/libs/util';
    import * as qiniu from 'qiniu-js';
    import { mapState } from 'vuex';
    import OnekyeShare from './onekyeShare';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import tourStep from '@/steps/tour-modules/briefcase-mixins';
    import { getIsReadMode } from '@/api/reusableApi/match-store-api';
    /** 判断长度 */
    String.prototype.realLength = function() {
        return this.replace(/[^\x00-\xff]/g, '**').length; // [^\x00-\xff] - 匹配非双字节的字符
    };
    export default {
        name: 'cloundPushAdd',
        mixins: [tourStep],
        components: {
            CloudPushPreview,
            dataBaseModal,
            OnekyeShare
        },
        props: [
            'editFIle',
            'showField',
            'id',
            'hasChatAuthority'
        ],
        watch: {
            'ruleForm.isEditStyle': {
                handler(v) {
                    // console.log(v, 'ruleForm.isEditStyle');
                    this.change_add_switch(v);
                }
            }
        },
        data() {
            return {
                title: '新建',
                ruleForm: {
                    title: '',
                    des: '',
                    portrait: '',
                    isEditStyle: false
                },
                rules: {
                    title: [
                        { required: true, message: '分享标题不能为空', trigger: 'blur' }
                    ],
                    des: [
                        { required: true, message: '分享描述不能为空', trigger: 'blur' }
                    ]
                },
                previewModel: false,
                selectFileModal: false,
                checked: false,
                dialogVisible: false,
                data: {},
                fileInfo: {},
                isIndeterminate: true,
                activetab: '',
                url: '',
                shareFlag: false, // 一键分享标志
                addLoading: false,
                shareLoading: false,
                disabled: false,
                defaultMailSetting: {
                    fontFamilyValue: 'arial', // 默认写信字体
                    fontSizeValue: '16px', // 默认写信字号
                    fontColorValue: '#000' // 默认写信颜色
                },
                currEditor: null, // 当前页面的富文本编辑器
                action: '', // 上传图片url
                mailContent: ''
            };
        },
        created() {
            // 分享id
            if (this.id !== 0) {
                this.title = '编辑';
                this.init();
            } else {
                this.title = '新建';
                this.ruleForm = {};
                this.fileInfo = {};
                this.checked = true;
            }
            this.$store.commit('setParentId', 0);
        },
        mounted() {
            getIsReadMode('cloundPushAddSteps', this.tourDefaultStart);
            this.initQiniu();
            if (Object.keys(this.editFIle)) {
                this.getFile(this.editFIle, 'quickCreate');
            }
        },
        computed: {
            ...mapState({
                qiniuHttp: state => state.qiniuHttp,
                orgId: state => state.enterpriseId,
                userId: state => state.userId,
                $lang: state => state.app.lang,
                parentId: state => state.crm.parentId,
                button_list: state => state.app.button_list,
                menuList: state => state.app.menu_list
            }),
            authorized_button() {
                const buttonIds = BUTTON_IDS.CRM.database;
                return {
                    person: {
                        disk: !HANDLE_BUTTON(buttonIds.person_disk.id, this.menuList)
                    },
                    company: {
                        disk: !HANDLE_BUTTON(buttonIds.company_disk.id, this.menuList)
                    },
                    share: {
                        disk: !HANDLE_BUTTON(buttonIds.share_disk.id, this.menuList)
                    }
                };
            }
        },
        methods: {
            init() {
                const data = {
                    id: this.id
                };
                // 编辑 -- 获取智能物料详情
                util.ajax233({
                    url: '/push/getPush',
                    method: 'post',
                    data: data
                }).then(res => {
                    if (res.data.code === '1') {
                        this.data = res.data.data;
                        console.log(this.data);
                        // 分享信息回填
                        this.ruleForm.title = this.data.title;
                        this.ruleForm.des = this.data.description;
                        this.ruleForm.portrait = this.data.image;
                        // 文件回填
                        this.fileInfo.filename = this.data.filename;
                        this.fileInfo.fileId = this.data.fileId;
                        this.fileInfo.fileType = this.data.fileType;
                        this.fileInfo.updateTime = (new Date(this.data.updateTime)).format('yyyy-MM-dd');
                        this.fileInfo.suffix = this.data.suffix;
                        this.fileInfo.feileDelete = this.data.feileDelete;
                        this.fileInfo.size = this.data.size;
                        // Facebook访问选项回填
                        this.checked = Number(this.data.isPublic) === 1;
                        this.ruleForm.isEditStyle = Boolean(this.data.isEditStyle);
                        this.mailContent = this.data.editStyle;
                    } else {
                        this.$Message.error(res.data.message);
                    }
                });
            },
            goBack() {
                this.$emit('update:showField', 0);
            },
            getMsg(data) {
                this.previewModel = data;
            },
            getMsgShare(data) {
                this.dialogVisible = data;
            },
            getShareBack(data) {
                this.$emit('update:showField', data);
            },
            share(formName) {
                /**
                 * @Description: 点击一键分享flag；点击一键分享时;先保存，保存成功后弹分享方式弹窗
                 * @author 翟敏
                 * @date 2020/6/3
                */
                this.shareFlag = true;
                this.shareLoading = true;
                // this.handleUpload();

                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if (this.ruleForm.title.trim() === '') {
                            this.shareLoading = false;
                            this.$Message.error('标题不能为空!');
                        } else if (this.ruleForm.des.trim() === '') {
                            this.shareLoading = false;
                            this.$Message.error('描述不能为空!');
                        } else if (!this.fileInfo.filename) {
                            this.shareLoading = false;
                            this.$Message.error('请选择要分享的文件!');
                        } else {
                            this.handleUpload();
                        }
                    } else {
                        this.shareLoading = false;
                        return false;
                    }
                });
            },
            preserve(formName) {
                this.shareFlag = false;
                this.addLoading = true;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if (this.ruleForm.title.trim() === '') {
                            this.addLoading = false;
                            this.$Message.error('标题不能为空!');
                        } else if (this.ruleForm.des.trim() === '') {
                            this.addLoading = false;
                            this.$Message.error('描述不能为空!');
                        } else if (!this.fileInfo.filename) {
                            this.addLoading = false;
                            this.$Message.error('请选择要分享的文件!');
                        } else {
                            this.handleUpload();
                        }
                    } else {
                        this.addLoading = false;
                        return false;
                    }
                });
            },
            // 新建
            createShare(url = 'https://content.leadscloud.com/FjIk9U8rVHGGRAWZHXRHkIxbiYIY') {
                // 上传图片
                console.log('!!!!');
                console.log(this.fileInfo);
                if (!this.ruleForm.title || !this.ruleForm.des) {
                    this.addLoading = false;
                    this.shareLoading = false;
                    return;
                } else if (this.ruleForm.title.realLength() > 300) {
                    this.$Message.error('标题长度最大支持 300 字符');
                    this.addLoading = false;
                    this.shareLoading = false;
                    return;
                } else if (this.ruleForm.des.realLength() > 1000) {
                    this.$Message.error('描述长度最大支持 1000 字符');
                    this.addLoading = false;
                    this.shareLoading = false;
                    return;
                }
                const data = {
                    title: this.ruleForm.title,
                    description: this.ruleForm.des,
                    // 分享文件id
                    fileId: this.fileInfo.id,
                    // 分享文件类型
                    fileType: this.activetab || this.fileInfo.fileType,
                    image: url,
                    isPublic: this.checked ? '1' : '0',
                    isEditStyle: this.ruleForm.isEditStyle ? 1 : 0
                };
                if (this.ruleForm.isEditStyle) {
                    if (!this.currEditor.getContent()) {
                        this.$Message.error('富文本描述不能为空');
                        this.addLoading = false;
                        this.shareLoading = false;
                        return;
                    }
                    data.editStyle = this.currEditor.getContent().replace(/<a/g, '<a target="_blank" ')
                }
                util.ajax233({
                    url: '/push/create',
                    method: 'post',
                    data: data
                }).then(res => {
                    if (res.data.code === '1') {
                        this.data = res.data.data;
                        console.log(this.data);
                        /* 点击保存，成功后，返回列表页；
                        点击一键分享，保存成功后，弹分享弹窗；
                         */
                        if (this.shareFlag) {
                            this.dialogVisible = true;
                            this.$refs.child.getshareMsg(this.data.id, this.hasChatAuthority);
                        } else {
                            this.$Message.success('保存成功');
                            // 返回列表页
                            this.goBack();
                        }
                    } else if (res.data.code === '-30055') {
                        this.$confirm('当前已选文件系统转换分享预览PDF文件时失败，将无法创建分享。', '系统提示', {
                            confirmButtonText: '确定',
                            type: 'warning'
                        }).then(() => {
                        }).catch(() => {
                        });
                    } else if (res.data.code === '-30008') {
                        if (this.shareFlag) {
                            this.$confirm('当前分享文件已删除，不能完成分享。', '系统提示', {
                                confirmButtonText: '确定',
                                showCancelButton: false,
                                type: 'warning'
                            }).then(() => {
                            }).catch(() => {
                            });
                        } else {
                            this.$confirm('当前分享文件已删除，不能完成保存。', '系统提示', {
                                confirmButtonText: '确定',
                                showCancelButton: false,
                                type: 'warning'
                            }).then(() => {
                            }).catch(() => {
                            });
                        }
                    } else if (res.data.code === '-30001') {
                        this.$Message.error('标题不能为空!');
                    } else if (res.data.code === '-30003') {
                        this.$Message.error('描述不能为空!');
                    } else {
                        this.$Message.error('保存失败!');
                    }
                    this.addLoading = false;
                    this.shareLoading = false;
                });
            },
            // 编辑
            editShare(url) {
                console.log(this.checked);
                if (!this.ruleForm.title || !this.ruleForm.des) {
                    this.addLoading = false;
                    this.shareLoading = false;
                    return;
                } else if (this.ruleForm.title.realLength() > 300) {
                    this.$Message.warning('标题长度最大支持 300 字符');
                    this.addLoading = false;
                    this.shareLoading = false;
                    return;
                } else if (this.ruleForm.des.realLength() > 1000) {
                    this.$Message.warning('描述长度最大支持 1000 字符');
                    this.addLoading = false;
                    this.shareLoading = false;
                    return;
                }
                const data = {
                    title: this.ruleForm.title,
                    description: this.ruleForm.des,
                    fileId: this.fileInfo.id || this.fileInfo.fileId,
                    // 分享文件类型
                    fileType: this.activetab || this.fileInfo.fileType,
                    id: this.id,
                    image: url || this.ruleForm.portrait,
                    isPublic: this.checked ? '1' : '0',
                    isEditStyle: this.ruleForm.isEditStyle ? 1 : 0
                };
                
                if (this.ruleForm.isEditStyle) {
                    if (!this.currEditor.getContent()) {
                        this.$Message.error('富文本描述不能为空');
                        this.addLoading = false;
                        this.shareLoading = false;
                        return;
                    }
                    data.editStyle = this.currEditor.getContent().replace(/<a/g, '<a target="_blank" ')
                }
                util.ajax233({
                    url: '/push/edit',
                    method: 'post',
                    data: data
                }).then(res => {
                    if (res.data.code === '1') {
                        this.data = res.data.data;
                        /**
                         * @Description: 点击保存，成功后，返回列表页；点击一键分享，保存成功后，弹分享弹窗
                         * @author 翟敏
                         * @date 2020/6/3
                        */
                        if (this.shareFlag) {
                            this.dialogVisible = true;
                            this.$refs.child.getshareMsg(this.id, this.hasChatAuthority);
                        } else {
                            this.$Message.success('保存成功');
                            // 返回列表页
                            this.goBack();
                        }
                    } else if (res.data.code === '-30055') {
                        this.$confirm('当前已选文件系统转换分享预览PDF文件时失败，将无法创建分享。', '系统提示', {
                            confirmButtonText: '确定',
                            type: 'warning'
                        }).then(() => {
                        }).catch(() => {
                        });
                        // this.$Message.error('当前已选文件系统转换分享预览PDF文件时失败，将无法创建分享。');
                    } else if (res.data.code === '-30008') {
                        if (this.shareFlag) {
                            this.$confirm('当前分享文件已删除，不能完成分享。', '系统提示', {
                                confirmButtonText: '确定',
                                showCancelButton: false,
                                type: 'warning'
                            }).then(() => {
                            }).catch(() => {
                            });
                        } else {
                            this.$confirm('当前分享文件已删除，不能完成保存。', '系统提示', {
                                confirmButtonText: '确定',
                                showCancelButton: false,
                                type: 'warning'
                            }).then(() => {
                            }).catch(() => {
                            });
                        }
                    } else {
                        this.$Message.error('保存失败!');
                    }
                    this.addLoading = false;
                    this.shareLoading = false;
                });
            },
            preview() {
                this.previewModel = true;
                this.$refs.childPreview.getPrviewMsg(Object.assign({}, { editStyle: this.currEditor.getContent().replace(/<a/g, '<a target="_blank" ') }, this.ruleForm), this.fileInfo);
            },
            uploadTrigger() {
                this.$refs.uploadEl.value = '';
                this.$refs.uploadEl.click();
            },
            previewImage(event) {
                console.log('files', event);
                const files = event.target.files;
                this.files = event.target.files;
                if (files && files.length) {
                    if (files.length > 1) {
                        this.$Message.error({
                            message: `${this.$t('crm.Modal.info_canOnlyUpload')}1${this.$t('crm.Modal.info_NumberOfPicture')}`,
                            duration: 5000,
                            closable: true
                        });
                        return;
                    } else if (Number(files[0].size) > 5 * 1024 * 1024) {
                        this.$Message.error({
                            message: '选择图片过大(不大于5MB)!',
                            duration: 5000,
                            closable: true
                        });
                        return;
                    }
                    const preUrl = window.URL.createObjectURL(files[0]);
                    // 获取图片宽高
                    const img = new Image();
                    img.src = preUrl;
                    img.onload = () => {
                        // 获取到图片的宽度和高度 img.width 、img.height
                        console.log(img.width, img.height);
                        if (img.width >= 600 && img.height >= 315) {
                            this.$set(this.ruleForm, 'portrait', img.src);
                            this.$forceUpdate();
                        } else {
                            this.$Message.error('图片至少600*315像素!');
                        }
                    };
                }
            },
            handleUpload(even) {
                if (this.ruleForm.portrait && this.ruleForm.portrait.startsWith('http')) {
                    this.title === '新建' ? this.createShare(this.ruleForm.portrait) : this.editShare(this.ruleForm.portrait);
                    return false;
                }
                console.log('~~~~~~~~~');
                console.log(even);
                console.log(this.files);
                const files = this.files;
                // 更改图片
                if (files && files.length) {
                    // 获取 token 后批量发送上传请求
                    if (files.length) {
                        util.oldAjax({
                            url: '/file-sys/api/uptoken',
                            method: 'post'
                        }).then(response => {
                            console.log('response', response);
                            if (response.data) {
                                const token = response.data.uptoken;
                                for (let i = 0; i < files.length; i++) {
                                    this.upload(files[i], token);
                                }
                            } else {
                                this.$Message.warning(this.$t('error_getUploadToken'));
                            }
                        }).catch(error => {
                            console.error(error);
                            this.$Message.error(this.$t('crm.Modal.error_uploadImage'));
                        });
                    }
                    // 未更改图片
                } else {
                    if (this.title === '新建') {
                        this.createShare();
                    } else if (this.title === '编辑') {
                        this.editShare();
                    }
                }
            },
            async upload(file, token) {
                if (file) {
                    const config = {
                        useCdnDomain: true,
                        region: qiniu.region.z0
                    };
                    const putExtra = {
                        fname: '',
                        params: {},
                        mimeType: ['image/png', 'image/jpeg', 'image/gif']
                    };
                    const next = (response) => {

                    };
                    const error = (response) => {
                        console.error(response);
                        if (response.message === 'file type doesn\'t match with what you specify') {
                            this.$Message.error(this.$t('crm.Modal.error_formatUploadImage'));
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_uploadImage'));
                        }
                    };
                    const complete = (response) => {
                        const url = `${this.qiniuHttp}${response.key}`;
                        // this.url = url;
                        if (this.title === '新建') {
                            this.createShare(url);
                        } else if (this.title === '编辑') {
                            this.editShare(url);
                        }
                    };

                    // 调用sdk上传接口获得相应的observable，控制上传和暂停
                    const observable = await this.$qiniuUpload(file, null, putExtra, config, token);

                    // 开始上传
                    observable.subscribe(next, error, complete);
                }
            },
            handleFileSelected() {
                if (this.authorized_button.person.disk || this.authorized_button.company.disk || this.authorized_button.share.disk) {
                    this.selectFileModal = true;
                } else {
                    this.$Message.warning('没有资料库访问权限！');
                }
            },
            getFile(data, quickCreate) {
                this.fileInfo = data;
                const suffix = data.suffix;
                const file = data.filename;
                if (!file || !suffix) return false;
                this.$set(this.ruleForm, 'title', file);
                // 如果是快速新建智能物料,则需要用data中的description
                if (quickCreate) {
                    this.$set(this.ruleForm, 'des', data.description);
                    // 不允许选中fb授权
                    this.checked = false;
                } else {
                    this.$set(this.ruleForm, 'des', file.replace(eval(`/\.${suffix}$/ig`), ''));
                }
                this.$set(this.ruleForm, 'portrait', data.fileThumbnail || '');
                // 清空editFIle
                this.$emit('update:editFIle', {});
            },
            activeTab(data) {
                if (data === 'person') {
                    this.activetab = '10';
                } else if (data === 'company') {
                    this.activetab = '11';
                } else if (data === 'share') {
                    this.activetab = '12';
                }
            },
            deleteFiles() {
                this.fileInfo = {};
                this.$store.state.crm.isDeleteFlag = true;
            },
            /* 初始化编辑器 */
            initEditor() {
                const vm = this;
                tinymce.init({
                    selector: '#vModalEditor',
                    theme: 'silver',
                    language_url: `${process.env.BASE_URL}tinymce/langs/zh_CN.js`,
                    skin_url: `${process.env.BASE_URL}tinymce/skins/ui/oxide`,
                    skin: 'oxide',
                    browser_spellcheck: true, // 拼写检查
                    branding: false, // 去水印
                    valid_children: '+div[style]', // 保留style标签不被编辑器过滤
                    elementpath: false, // 禁用编辑器底部的状态栏
                    // statusbar: false,  //隐藏编辑器底部的状态栏
                    paste_data_images: true, // 允许粘贴图像
                    paste_enable_default_filters: false, // paste插件 禁用TinyMCE的默认粘贴过滤器。
                    paste_webkit_styles: 'all', // 指定在WebKit中粘贴时要保留的样式
                    height: 400,
                    width: 600,
                    language: vm.$t('mail.editor_lauguage'),
                    plugins: 'undo redo fullscreen autolink lists link image charmap print hr anchor imagetools media nonbreaking directionality paste textpattern formatpainter table hr code emoticons placeholder',
                    // 添加扩展插件
                    external_plugins: {
                        formatpainter: `${process.env.BASE_URL}tinymce/formatpainter/plugin.min.js`
                    },
                    nonbreaking_force_tab: true, // 编辑器插入制表符
                    contextmenu: false, // 禁用编辑器上下文菜单
                    menubar: false,
                    table_default_styles: {
                        'border-collapse': 'collapse',
                        width: '100%'
                    },
                    table_advtab: false,
                    table_cell_advtab: false,
                    toolbar: [
                        'undo redo formatpainter | fontselect fontsizeselect | forecolor backcolor bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent lineheight | insertImageBtn link table emoticons hr | fullscreen code removeformat'
                    ],
                    toolbar_mode: 'floating',
                    emoticons_database_url: 'emojis.js',
                    font_formats: '黑体="黑体";宋体="宋体";微软雅黑="微软雅黑";楷体="楷体";Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Calibri=calibri;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats',
                    fontsize_formats: '12px 14px 16px 18px 24px 36px 48px', // 字号选项
                    autosave_interval: '20s',
                    /**
                     * @Description: 此样式会以 style 标签插入到 head 中, 而发送邮件时用的是 body 内容, 不包括此内容, 因此可能导致邮件详情页邮件内容显示错位
                     * 例: 图片右对齐时, 相邻文字被富文本编辑器产生的空行挤到下方, 但是如果没有 line-height: 1.5 , 空行行高不够, 图片和文字错位
                     * 解决: 将影响布局的样式存入 vuex tinymce_contentStyle , 发邮件之前先把这条样式加上去, 历史数据也尽量做下处理
                     * 因此要注意!!!!!!!!!!!!!!!!!!!!!!!如果以后修改了这条样式, 一定要同步修改 tinymce_contentStyle , 以及注意历史数据
                     * @author 汤一飞
                     * @date 2021/6/2
                     */
                    content_style: `
                        div { line-height:1.5; margin: 0;word-break: break-word!important;}
                    `,
                    forced_root_block: 'div', /* 参数 将非块元素或文本节点都包含在设置的元素中 回车 其他邮件中用的大部分是div包裹元素 */
                    visual: false,
                    images_upload_handler: function(blobInfo, success, failure) {
                        console.log('开始请求');
                        const config = {
                            useCdnDomain: true,
                            region: qiniu.region.z0
                        };
                        const observer = {
                            error(err) {
                                console.log(err);
                            },
                            complete(res) {
                                console.log(res,'请求完成');
                                success(vm.qiniuHttp + res.key);
                            }
                        };
                        const putExtra = {
                            fname: '',
                            params: {}
                        };
                        const uid = Date.now() + blobInfo.name();
                        util
                            .oldAjax({
                                url: '/file-sys/api/uptoken',
                                method: 'post'
                            })
                            .then(response => {
                                vm.uptoken = response.data.uptoken;
                                vm.action =
                                    `//upload.qiniup.com?token=${response.data.uptoken}`;

                                const observable = qiniu.upload(blobInfo.blob(), uid, vm.uptoken, putExtra, config);
                                const subscription = observable.subscribe(observer);
                            });
                    },
                    setup: function(editor) {
                        editor.on('init', function(e) {
                            console.log(e);
                            /**
                             * @Description: 更改富文本编辑器默认字体/字号/颜色
                             * @author wanghongzhuf
                             * @date 2020/4/27
                             */
                            this.getBody().style.fontSize = vm.defaultMailSetting.fontSizeValue;
                            this.getBody().style.color = vm.defaultMailSetting.fontColorValue;
                            this.getBody().style.fontFamily = vm.defaultMailSetting.fontFamilyValue;

                            vm.initPage();

                            // vm.mailContent = '<div>123123🙂<img src="https://content.leadscloud.com/FohQ9D4kUglZBfK8qgZl2CsFfABb" /></div>'.replace(/<style(([\s\S])*?)<\/style>/g, '');
                            if (vm.mailContent) {
                                vm.currEditor.resetContent(vm.mailContent);
                            }
                        });
                        editor.on('focus', function(e) {
                            // 富文本获取焦点时,更改阈值为tinymce
                        });
                        editor.on('input', function(e) {
                           
                        });
                        editor.on('keyup', function(e) {
                           
                        });
                        editor.on('change', function(e) {
                           
                        });
                        editor.on('paste', function(event) {
                            const items = (event.clipboardData || window.clipboardData).items;
                            if (items && items.length) {
                                const files = (event.clipboardData || window.clipboardData).files;
                                // 先按附件上传
                                if (files.length) {
                                    const filesUnImage = [];
                                    for (const item in files) {
                                        if (files[item].type && files[item].type.indexOf('image') === -1) {
                                            filesUnImage.push(files[item]);
                                        }
                                    }
                                    if (filesUnImage.length) {
                                        vm.$refs.filesUpload.uploadFiles(filesUnImage);
                                    }
                                }
                                // 搜索剪切板items
                                if (items[items.length - 1].type === 'application/whatsapp') {
                                /**
                                 * @Description: 客户报错: whatsapp 消息粘贴不了
                                 * @author 汤一飞
                                 * @date 2021/5/31
                                 */
                                } else if (items[items.length - 1].type === 'text/plain') {
                                /**
                                 * @Description: 客户报错: 粘贴 Google 翻译内容时, 没有保留换行和空格
                                 * 之前改为在 editor.insertContent 时, 粘贴处理后的字符串(替换换行和空格为 HTML 换行符和空格转义字符)
                                 * 后来发现富文本编辑器官网粘贴文本就能保留换行和空格, 所以直接注释下面的纯文本处理逻辑, 按富文本编辑器默认行为走
                                 * @author 汤一飞
                                 * @date 2021/5/20
                                 */
                                } else if (items[items.length - 1].type.indexOf('image') === -1) {
                                    for (let i = 0; i < items.length; i++) {
                                        if (items[i].type.indexOf('text/html') !== -1) {
                                            items[i].getAsString(function(str) {
                                                // str 是获取到的字符串
                                                str = str.replace(/id="signature"/ig, '');
                                                editor.insertContent(str);
                                            });
                                        }
                                    }
                                    event.preventDefault();
                                    event.stopPropagation();
                                }
                            }
                            // vm.writeMail();
                        });
                        editor.ui.registry.addButton('insertImageBtn', {
                            tooltip: 'Insert Image',
                            icon: 'image',
                            onAction: function(_) {
                                const upload = vm.$refs.imageUpload;
                                vm.$nextTick(() => {
                                    upload.$refs['upload-inner'].handleClick();
                                });
                            }
                        });
                    }
                });
            },
            initPage() {
                // const vm = this;
                this.currEditor = tinymce.editors.find(item => item.id === 'vModalEditor');
            },
            /* 插入图片至编辑器 */
            insertImage(res) {
                console.log(res,'sss');
                const src = this.qiniuHttp + res.key;
                tinymce.execCommand('mceInsertContent', false, `<img src=${src}>`);
            },
            /* 初始化七牛，获取图片上传token */
            initQiniu() {
                util.oldAjax({
                    url: '/file-sys/api/uptoken',
                    method: 'post'
                }).then(response => {
                    this.action =
                        `//upload.qiniup.com?token=${response.data.uptoken}`;
                });
            },
            change_add_switch(e) {
                if (e === true) {
                    this.initEditor();
                } else {
                    tinymce.execCommand('mceRemoveEditor', true, 'vModalEditor');
                    tinymce.remove('vModalEditor');
                    document.querySelector('#vModalEditor').innerHTML = '';
                }
            }
        },
        filters: {
            sizeConversion(size) {
                const result = Number(size);
                if (isNaN(result)) {
                    return size;
                } else {
                    const kiloByte = (result / 1024).toFixed(2);
                    if (kiloByte < 1) {
                        return `${result}B`;
                    }
                    const megaByte = (kiloByte / 1024).toFixed(2);
                    if (megaByte < 1) {
                        return `${kiloByte}KB`;
                    }
                    const gigaByte = (megaByte / 1024).toFixed(2);
                    if (gigaByte < 1) {
                        return `${megaByte}MB`;
                    }
                    const teraByte = (gigaByte / 1024).toFixed(2);
                    if (teraByte < 1) {
                        return `${gigaByte}GB`;
                    }
                }
            }
        },
        beforeDestroy() {
            tinymce.execCommand('mceRemoveEditor', true, 'vModalEditor');
            tinymce.remove('vModalEditor');
        }
    };
</script>

<style scoped lang="less">
    .cloud-push-add{
        .btn__step__base {
            margin-left:10px;
            position:relative;
        }
        .forbidden__modal {
            position: absolute;
            top:30px;
            left:-5px;
            width: 300px;
            height: 460px;
            border-radius: 10px;
        }
        .forbidden__modal_circle {
            position: absolute;
            border-radius: 50%;
            width: 104px;
            height: 104px;
            top: -32px;
        }
        .forbidden__modal_circle1 {
            position: absolute;
            border-radius: 50%;
            width: 80px;
            height: 80px;
            top: -32px;
        }
        .__position1 {
            left: -18px;
        }
        .__position2 {
            left: -3px
        }
        .cloud-push-add-head{
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            margin: 10px 0 20px 0;
            align-items: center;
        }
        .cloud-push-head-text{
            color: #000000;
            font-size: 16px;
            line-height: 24px;
        }
        .image-upload{
            position: relative;
            width: 200px;
            .cloud-push-image{
                width: 200px;
            }
            .image-change{
                position: absolute;
                right: 0;
                bottom: 16px;
                padding: 10px 5px;
                background: #7B98B6;
                font-size: 12px;
                color: #FFFFFF;
                border-color: #7B98B6;
            }
        }
        .cloud-push-size{
            width: 200px;
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0,0,0,0.60);
            letter-spacing: 0;
            line-height: 18px;
        }
        .cloud-push-image-wrapper{
            display: flex;
            flex-direction: row;
            .cloud-push-image-left{
                margin-right: 30px;
            }
            .cloud-push-right{
                height: 221px;
                border-left: 1px solid #EAEAEA;
                display: flex;
                flex-direction: column;
                .cloud-push-sketch{
                    font-family: PingFangSC-Regular;
                    font-size: 12px;
                    color: rgba(0,0,0,0.80);
                    letter-spacing: 0;
                    line-height: 18px;
                    margin-left: 30px;
                    text-align: center;
                    padding-bottom: 4px;
                }
                .cloud-push-map{
                    border: 1px dashed #EAEAEA;
                    display: flex;
                    flex-direction: column;
                    padding: 10px;
                    margin-left: 30px;
                    .cloud-push-report{
                        width: 200px;
                        height: 106px;
                    }
                    .cloud-push-com{
                        font-family: PingFangSC-Regular;
                        font-size: 12px;
                        color: rgba(0,0,0,0.60);
                        letter-spacing: 0;
                        line-height: 18px;
                        text-align: left;
                        padding-top: 10px;
                    }
                    .cloud-push-title-one{
                        font-family: PingFangSC-Semibold;
                        font-weight: 700;
                        font-size: 14px;
                        line-height: 20px;
                        color: rgba(0,0,0,0.80);
                        letter-spacing: 0;
                        text-align: left;
                        padding: 4px 0;
                    }
                    .cloud-push-text-one{
                        font-family: PingFangSC-Regular;
                        font-size: 12px;
                        line-height: 17px;
                        color: rgba(0,0,0,0.80);
                        letter-spacing: 0;
                        text-align: left;
                    }
                }
            }
        }
        .image-select{
            padding: 8px 20px;
            background: #7B98B6;
            font-size: 12px;
            line-height: 18px;
            color: #FFFFFF;
            border-color: #7B98B6;
        }
        .cloud-push-file{
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-top: 16px;
            padding: 6px 0;
            width: 500px;
            box-shadow: 0 1px 0 0 #EAEAEA;
            .cloud-push-file-text{
                display: flex;
                flex-direction: column;
                margin-left: 8px;
                width: 452px;
                .cloud-push-file-name{
                    font-family: PingFangSC-Regular;
                    font-size: 12px;
                    color: rgba(0,0,0,0.80);
                    letter-spacing: 0;
                    line-height: 18px;
                }
                .cloud-push-file-num{
                    display: flex;
                    flex-direction: row;
                    font-family: PingFangSC-Regular;
                    font-size: 12px;
                    color: rgba(0,0,0,0.60);
                    letter-spacing: 0;
                    line-height: 18px;
                    .cloud-push-file-time{
                        margin-right: 16px;
                    }
                }
            }
        }
        .cloud-push-button{
            margin-top: 49px;
        }
        .is-plain{
            color: #fc8c30;
            background: #fff4ea;
            border-color: #fed1ac;
            background-color: white;
        }
        .cloud-modal-wrapper{
            padding: 0 20px 50px;
        }
        .cloud-modal-icon{
            /*padding: 30px 147px;*/
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            .cloud-modal-circle{
                width: 32px;
                height: 32px;
                padding: 7px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
            }
            .cloud-modal-facebook{
                border:1px solid #3D5A96;
            }
            .cloud-modal-fbmessenger{
                border:1px solid #0080FF;
            }
            .cloud-modal-whatsapp{
                border:1px solid #39C34C;
            }
            .cloud-modal-email{
                border:1px solid #677F99;
            }
            .svg-icon{
                width: 18px;
                height:18px;
                vertical-align: middle;
            }
        }
        .cloud-modal-text{
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: rgba(0,0,0,0.60);
            letter-spacing: 0;
            line-height: 18px;
            margin-top: 16px;
            text-align: center;
        }
        .cloud-modal-map{
            border: 1px dashed #EAEAEA;
            display: flex;
            flex-direction: column;
            padding: 10px;
            width: 320px;
            .cloud-modal-report{
                width: 300px;
            }
            .cloud-modal-com{
                padding-top: 10px;
                font-family: PingFangSC-Regular;
                font-weight: 700;
                font-size: 12px;
                color: rgba(0,0,0,0.60);
                letter-spacing: 0;
                line-height: 18px;
            }
            .cloud-modal-title-one{
                font-family: PingFangSC-Semibold;
                font-weight: 700;
                font-size: 14px;
                line-height: 20px;
                color: rgba(0,0,0,0.80);
                letter-spacing: 0;
                text-align: left;
                padding: 4px 0;
            }
            .cloud-modal-text-one{
                font-family: PingFangSC-Regular;
                font-size: 12px;
                line-height: 17px;
                color: rgba(0,0,0,0.80);
                letter-spacing: 0;
                text-align: left;
            }
        }
        .dialog-footer{

        }
        .cloud-push-whatsapp-wrapper{
            display: flex;
            flex-direction: row;
            .cloud-whatsapp-head{
                width: 220px;
                padding-right: 4px;
                border-right:1px solid #EAEAEA;
            }
            .cloud-push-contacts{
                display: flex;
                flex-direction: row;
                align-items: center;
                /deep/ .el-checkbox{
                    display: flex;
                    flex-direction: row-reverse;
                    align-items: center;
                    .el-checkbox__label{
                        font-family: PingFangSC-Regular;
                        font-size: 12px;
                        color: rgba(0,0,0,0.80);
                        letter-spacing: 0;
                        line-height: 18px;
                        padding-right: 8px;
                    }
                    /*.el-checkbox__inner{*/
                    /*    width: 18px;*/
                    /*    height: 18px;*/
                    /*}*/
                    /*.el-checkbox__inner:after{*/
                    /*    left: 6px;*/
                    /*    top:2px;*/
                    /*}*/
                }
                .cloud-push-text{
                    font-family: PingFangSC-Semibold;
                    font-weight: 700;
                    font-size: 14px;
                    color: rgba(0,0,0,0.80);
                    letter-spacing: 0;
                }
            }
            .cloud-push-list{
                height: 500px;
                overflow-y: scroll;
                .avatar-small{
                    width: 36px;
                    height: 36px;
                    border-radius: 18px;
                }
                /deep/ .el-checkbox-group{
                    display: flex;
                    flex-direction: column;
                    .el-checkbox{
                        display: flex;
                        flex-direction: row-reverse;
                        align-items: center;
                        margin:20px 0 0 0;
                        justify-content: space-between;
                        .el-checkbox__label{
                            padding-left: 0;
                            .avatar-large{
                                vertical-align: middle;
                            }
                        }
                        .el-checkbox__input{
                            margin-right: 8px;
                        }
                    }
                }
                .chat-svg-avatar{
                    margin-right: 12px;
                }
                .cloud-contact-name{
                }
            }
        }
        .cloud-push-whatsapp-preview{
            padding: 0 20px;
            .cloud-push-whatsapp-preview-title{
                font-family: PingFangSC-Semibold;
                font-weight: 700;
                font-size: 14px;
                color: rgba(0,0,0,0.80);
                letter-spacing: 0;
                margin-bottom: 20px;
            }
        }
        /deep/ .el-form-item__label{
            text-align: left;
            font-size: 12px;
        }
        /deep/ .el-checkbox__inner{
            border-radius: 50%;
        }
    }

</style>
<style scoped lang="less">
.cloudPushAdd_editor{
    margin-bottom: 22px;
    /deep/.tox-tinymce{
    border: 1px solid #DCDFE6;
}
}
</style>
