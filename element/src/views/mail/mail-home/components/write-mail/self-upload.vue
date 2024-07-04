<template>
    <div :class="[prefixCls]">
        <div
            :class="classes"
            style="border:none;"
            @click="handleClick"
            @drop.prevent="onDrop"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false">
            <input
                    style="display: none;"
                    ref="input"
                    type="file"
                    :class="[prefixCls + '-input']"
                    @change="handleChange"
                    :multiple="multiple"
                    :accept="accept">
            <slot></slot>
        </div>
        <slot name="tip"></slot>
        <upload-list
                v-if="showUploadList"
                v-show="fileList.length"
                :files.sync="fileList"
                :ul_width="ul_width"
                :sortableClass="sortableClass"
                @on-file-remove="handleRemove"
                @on-file-preview="handlePreview">
        </upload-list>
        <!-- 选择文件弹窗-->
        <dataBaseModal
                v-if="dataBaseUpload"
                :visible.sync="dataBaseUpload"
                :onlyDownload="onlyDownload"
                :addLibraryFile.sync="addLibraryFile"
                @changeOnlyDownload="changeOnlyDownload"
                @handleAddDataBaseFile="handleAddDataBaseFile"
                @getDataBaseFile="getDataBaseFile"
                @activeTab="handleSelectTab"></dataBaseModal>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import * as qiniu from 'qiniu-js';
    import UploadList from './self-upload-list';
    import dataBaseModal from '@/views/crm/Briefcase/Components/dataBaseComponents/dataBaseModal.vue';
    import Emitter from '../../../../../../node_modules/element-ui/src/mixins/emitter';
    import { updateFileCharset } from '@/api/reusableApi/common';
    import { mapState } from 'vuex';
    const prefixCls = 'ivu-upload';

    export default {
        name: 'self_upload',
        mixins: [Emitter],
        components: { UploadList, dataBaseModal },
        props: {
            // 选择处理中文件生成的智能物料无法进行文件预览，仅支持下载文件。
            onlyDownload: {
                type: String
            },
            // write-mail组件传过来的方法:邮件添加智能物料
            handleDataBaseFile: {
                type: Function
            },
            ul_width: {
                type: Number
            },
            // headers: {
            //     type: Object,
            //     default() {
            //         return {};
            //     }
            // },
            multiple: {
                type: Boolean,
                default: false
            },
            // data: {
            //     type: Object
            // },
            // name: {
            //     type: String,
            //     default: 'file'
            // },
            // withCredentials: {
            //     type: Boolean,
            //     default: false
            // },
            showUploadList: {
                type: Boolean,
                default: true
            },
            // operateType: {
            //     type: String,
            //     validator(value) {
            //         return ['select', 'drag'].findIndex(item => item === value) !== -1;
            //     // return oneOf(value, ['select', 'drag']);
            //     },
            //     default: 'select'
            // },
            format: {
                type: Array,
                default() {
                    return [];
                }
            },
            accept: {
                type: String
            },
            maxSize: {
                type: Number
            },
            beforeUpload: Function,
            onProgress: {
                type: Function,
                default() {
                    return {};
                }
            },
            onSuccess: {
                type: Function,
                default() {
                    return {};
                }
            },
            onError: {
                type: Function,
                default() {
                    return {};
                }
            },
            // onRemove: {
            //     type: Function,
            //     default() {
            //         return {};
            //     }
            // },
            onPreview: {
                type: Function,
                default() {
                    return {};
                }
            },
            onExceededSize: {
                type: Function,
                default() {
                    return {};
                }
            },
            onFormatError: {
                type: Function,
                default() {
                    return {};
                }
            },
            defaultFileList: {
                type: Array,
                default() {
                    return [];
                }
            },
            userType: {
                type: Number,
                default: 1
            },
            type: {
                type: String
            },
            sortableClass: String
        },
        data() {
            return {
                addLibraryFile: '', // 存个参数,用来表示 '添加资料库文件'
                prefixCls: prefixCls,
                dragOver: false,
                fileList: [],
                tempIndex: 1,
                uptoken: null,
                subscription_list: [],
                num: 0,
                is_first: true,
                defaultFileList_ext: [], // defaultFileList的变形
                dataBaseUpload: false, // 是否开启资料库文件列表的弹窗
                activeTab: '10', // 询盘云资料库当前显示的文件类型
                dataBaseUids: [], // 选中的资料库文件的uid集合，每一项分别包含资料库文件原始uid，和复制至邮箱的新uid
                dataBaseTimer: null // 模拟资料库文件上传的进度定时器
            };
        },
        computed: {
            classes() {
                return [
                    `${prefixCls}`,
                    {
                        [`${prefixCls}-select`]: this.type === 'select',
                        [`${prefixCls}-drag`]: this.type === 'drag',
                        [`${prefixCls}-dragOver`]: this.type === 'drag' && this.dragOver
                    }
                ];
            },
            ...mapState({
                user_id: state => state.userId,
                enterpriseId: state => state.enterpriseId
            }),
            fileSize() {
                let result = 0;
                this.fileList.forEach(item => {
                    result += this.getSizeNumber(item.size);
                });
                return result;
            }
        },
        methods: {
            changeOnlyDownload(value) {
                this.$emit('update:onlyDownload', value);
            },
            // changeAddLibraryFile(val) {
            //     this.addLibraryFile = val;
            // },
            // 调用父组件的方法
            handleAddDataBaseFile(dataBileList, activeTab) {
                // 调用: write-mail组件传过来的方法:邮件添加智能物料
                this.$emit('handleDataBaseFile', dataBileList, activeTab);
            },
            handleClick(uploadMethod) {
                if (this.userType !== 4) {
                    if (this.userType === 1) {
                        if (uploadMethod === 'normal') {
                            this.$refs.input.click();
                        } else if (uploadMethod === 'dataBase') {
                            this.dataBaseUpload = true;
                        } else if (uploadMethod === 'showDataBaseModel') {
                            this.addLibraryFile = 'showDataBaseModel';
                            this.dataBaseUpload = true;
                        };
                    } else {
                        this.$refs.input.click();
                    }
                }
            },
            handleChange(e) {
                const files = [...e.target.files];

                if (!files) {
                    return;
                }
                this.uploadFiles(files);
                this.$refs.input.value = null;
            },
            onDrop(e) {
                this.dragOver = false;
                this.uploadFiles(e.dataTransfer.files);
            },
            async uploadFiles(files) {
                const token = await this.initQiniu().catch(err => {
                    this.$Message.warning(this.$t('error_getUploadToken'));
                });
                let postFiles = Array.prototype.slice.call(files);
                if (!this.multiple) postFiles = postFiles.slice(0, 1);
                if (postFiles.length === 0) return;
                let totalSize = 0;
                postFiles.forEach((file, index) => {
                    totalSize += file.size;
                });
                // 如果是fb界面，则不需要加上this.fileSize
                if (this.userType === 3) {
                    if (totalSize >= 25 * 1024 * 1024) {
                        this.$Message.warning('上传的文件总大小不能超过25M');
                        return;
                    }
                } else {
                    if (this.fileSize + totalSize >= this.maxSize * 1024) {
                        this.$Message.warning(`上传的文件总大小不能超过${this.maxSize / 1024}M`);
                        return;
                    }
                }
                postFiles.forEach((file, index) => {
                    this.upload(file, index);
                });
            },
            upload(file, index) {
                if (!this.beforeUpload) {
                    return this.post(file, index);
                }

                const before = this.beforeUpload(file);
                if (before && before.then) {
                    before.then(processedFile => {
                        if (Object.prototype.toString.call(processedFile) === '[object File]') {
                            this.post(processedFile);
                        } else {
                            this.post(file, index);
                        }
                    }, () => {
                    // this.$emit('cancel', file);
                    });
                } else if (before !== false) {
                    this.post(file, index);
                } else {
                // this.$emit('cancel', file);
                }
            },
            post(file, index) {
                // check format
                const self = this;
                if (this.format.length) {
                    const _file_format = file.name.split('.').pop().toLocaleLowerCase();
                    const checked = this.format.some(item => item.toLocaleLowerCase() === _file_format);
                    if (!checked) {
                        this.onFormatError(file, this.fileList);
                        return false;
                    }
                }
                // 在fb模块的话，需要判断只能上传图片，而不能上传文档或者表格
                // check maxSize
                if (this.maxSize) {
                    // 看到目前facebook引入的是这个组件，user-type传3时代表facebook，所以在此添加逻辑
                    if (this.userType === 3) {
                        const typeArr = ['.png', 'jpeg', '.gif', '.jpg', '.JPG', '.GIF', 'JPEG', '.PNG'];
                        const imgType = file.name.slice(-4);
                        if (typeArr.findIndex(item => item === imgType) !== -1) {
                            if (file.size / 1024 / 1024 > this.maxSize) {
                                console.log(file.size / 1024 / 1024);
                                this.$Message.error(this.$t('facebook.inbox.fbComment.overTwoSize'));
                                return false;
                            }
                        } else {
                            this.$Message.error(this.$t('facebook.inbox.fbComment.imgTypeError'));
                            return false;
                        }
                    } else {
                        if (file.size > this.maxSize * 1024) {
                            this.onExceededSize(file, this.fileList);
                            return false;
                        }
                    }
                }
                this.handleStart(file, index);
                const formData = new FormData();
                formData.append(self.name, file);
                const observer = {
                    next(res) {
                        // console.log('next监听',res.total.percent,file.name,file.uid);
                        self.handleProgress(res.total, file);
                    },
                    error(err) {
                        // console.log(err);
                        self.handleError(err, err, file);
                    },
                    complete(res) {
                        self.handleSuccess(res, file);
                        if (res.key.indexOf('.txt') !== -1) {
                            updateFileCharset({
                                key: res.key
                            }).then(data => {
                                if (data.code === 1) {
                                    // this.$Message.success(`${response.key}: 编码处理成功`);
                                    console.log(`${res.key}: 编码处理成功`);
                                } else {
                                    this.$Message.warning(`${res.key}: ${data.msg}`);
                                }
                            });
                        }
                    }
                };
                const putExtra = {
                    fname: '',
                    params: {}
                };
                const config = {
                    useCdnDomain: true,
                    region: qiniu.region.z0
                };
                let linkName = '';
                const fileName = file.name.replace(/\s/g, '-');
                /**
                 * @Description: 为解决文件上传到七牛后，点击预览，使用免费的office在线文档功能查看时，会提示File not found的问题
                 *               此处为上传到七牛的文件，在key值后面增加文件后缀名；当上传的文件无后缀时，不增加后缀名。
                 * @author 杨娣
                 * @date 2020/5/25
                */
                const tempIndex = file.name.lastIndexOf('.');
                let fileType = '';
                if (tempIndex !== -1) {
                    fileType = file.name.substring(tempIndex, file.name.length);
                }
                switch (this.userType) {
                    // 1-邮件，2-产品，3-facebook
                    case 1:
                        linkName = `${file.uid}_mail${fileType}`;
                        break;
                    case 2:
                        linkName = `${file.uid}_product`;
                        break;
                    case 3:
                        linkName = `${file.uid}_facebook/${fileName}`;
                        break;
                    case 4:
                        linkName = `${this.enterpriseId}/social/${file.uid}/${fileName}`;
                        break;
                }
                const observable = qiniu.upload(file, linkName, self.uptoken, putExtra, config);
                //   let observable = qiniu.upload(file, `pp${file.uid}`, self.uptoken, putExtra, config)
                const subscription = observable.subscribe(observer); // 上传开始
                subscription.file = file;
                this.subscription_list.push(subscription);
            },
            handleStart(file, index, from) {
                //  file.uid = Date.now() + this.tempIndex++;
                file.uid = parseInt(`${this.user_id}${index}${Date.now()}.${file.suffix}`);
                const _file = {
                    status: 'uploading',
                    name: from === 'fromDataBase' ? file.filename : file.name,
                    size: Number(file.size),
                    percentage: 0,
                    uid: from === 'fromDataBase' ? file.mailUid : file.uid, // 从资料库选取的文件，uid需要与调用接口file-sys/fileOperate/copyFile时，所传的uid一致，因此选用携带的参数，而非新生成uid
                    showProgress: true,
                    isDataBaseFile: from === 'fromDataBase',
                    dataBaseUid: from === 'fromDataBase' ? file.placeKey : ''
                };
                this.fileList.push(_file);
                if (from === 'fromDataBase') {
                    this.mockFileUploadProgress(_file);
                }
            },
            getFile(file) {
                const fileList = this.fileList;
                let target;
                fileList.every(item => {
                    target = file.uid === item.uid ? item : null;
                    return !target;
                });
                return target;
            },
            handleProgress(e, file) {
                const _file = this.getFile(file);
                // 这里获取的_file和e已经不配套了
                if (_file) {
                    this.onProgress(e, _file, this.fileList);
                    _file.percentage = e.percent || 0;
                }
            },
            handleSuccess(res, file) {
                const _file = this.getFile(file);

                if (_file) {
                    _file.status = 'finished';
                    _file.response = res;

                    this.dispatch('FormItem', 'on-form-change', _file);
                    this.onSuccess(res, _file, this.fileList);

                    setTimeout(() => {
                        _file.showProgress = false;
                    }, 1000);
                }
            },
            handleError(err, response, file) {
                const _file = this.getFile(file);
                const fileList = this.fileList;

                _file.status = 'fail';

                fileList.splice(fileList.indexOf(_file), 1);

                this.onError(err, response, file);
            },
            handleRemove(file) {
                const fileList = this.fileList;
                // const index = this.defaultFileList_ext.indexOf(file);
                if (!file.isDataBaseFile) {
                    // if (index !== -1) {
                    //     fileList.splice(fileList.indexOf(file), 1);
                    //     // this.onRemove(file, fileList);
                    //     this.defaultFileList_ext.splice(index, 1);
                    // } else {
                    // const defaultLength = this.defaultFileList_ext.length;
                    // this.subscription_list[fileList.indexOf(file) - defaultLength].unsubscribe();
                    // this.subscription_list.splice(fileList.indexOf(file) - defaultLength, 1);
                    const subscriptionList = this.subscription_list;
                    const fileListIndex = fileList.indexOf(file);
                    const subscriptionIndex = subscriptionList.findIndex(item => item.file.uid === file.uid && item.file.name === file.name);
                    if (subscriptionIndex !== -1) {
                        this.subscription_list[subscriptionIndex].unsubscribe();
                        this.subscription_list.splice(subscriptionIndex, 1);
                    }
                    fileList.splice(fileListIndex, 1);
                    // this.onRemove(file, fileList);
                    // }
                } else {
                    const tempIndex = this.fileList.findIndex(item => item.dataBaseUid === file.dataBaseUid);
                    const subscriptionIndex = this.subscription_list.findIndex(item => item.uid === file.uid);
                    this.fileList.splice(tempIndex, 1);
                    this.subscription_list.splice(subscriptionIndex, 1);
                }
            },
            /** 获取文件大小 数字 */
            getSizeNumber(size) {
                if (typeof (size) === 'string') {
                    const number = parseFloat(size);
                    /* unit数字带单位，字母换成小写了还是有数字 */
                    const unit = size.toLowerCase();
                    if (unit.includes('byte')) {
                        return number;
                    } else if (unit.includes('kb')) {
                        return number * 1024;
                    } else if (unit.includes('mb')) {
                        return number * 1024 * 1024;
                    } else if (unit.includes('gb')) {
                        return number * 1024 * 1024 * 1024;
                    }
                } else if (typeof (size) === 'number') {
                    return size;
                } else {
                    return 0;
                }
            },
            handlePreview(file) {
                if (file.status === 'finished') {
                    this.onPreview(file);
                }
            },
            clearFiles() {
                this.fileList = [];
            },
            /* 初始化七牛，获取图片上传token */
            initQiniu() {
                return new Promise((resolve, reject) => {
                    util
                        .oldAjax({
                            url: '/file-sys/api/uptoken',
                            method: 'post'
                        })
                        .then(response => {
                            this.uptoken = response.data.uptoken;
                            resolve(response.data.uptoken);
                        }).catch(err => {
                            reject('err');
                        });
                });
            },
            /* 询盘云资料库上传文件相关 */
            getDataBaseFile(data) {
                /* 首先判断附件列表大小是否超限 */
                const dataSize = data.reduce((prev, next) => {
                    return prev + Number(next.size);
                }, 0);
                if ((this.fileSize + dataSize) > this.maxSize * 1024) {
                    this.$Message.warning(`上传的文件总大小不能超过${this.maxSize / 1024}M`);
                    return false;
                }
                /* 从七牛将该文件复制至邮件附件 */
                const obj = {};
                const tempArr = [];
                data.forEach((item, index) => {
                    item.mailUid = `${parseInt(`${this.user_id}${index}${Date.now()}`)}_mail.${item.suffix}`;
                    obj.dataBaseUid = item.placeKey;
                    obj.mailUid = item.mailUid;
                    this.dataBaseUids.push(obj);
                    tempArr.push({
                        fromFileKey: item.placeKey,
                        toFileKey: item.mailUid
                    });
                    this.handleStart(item, 0, 'fromDataBase');
                });
                this.copyFileToMail(tempArr);
            },
            handleSelectTab(type) {
                switch (type) {
                    case 'person':
                        this.activeTab = '10';
                        break;
                    case 'company':
                        this.activeTab = '11';
                        break;
                    case 'share':
                        this.activeTab = '12';
                        break;
                    default:
                        this.activeTab = '10';
                        break;
                }
            },
            copyFileToMail(fileDatas) {
                util.oldAjaxJson({
                    url: '/file-sys/fileOperate/copyFile',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.user_id,
                        type: 1,
                        qiNiuFileKeyConditionList: fileDatas
                    }
                }).then(res => {
                    // clearInterval(this.dataBaseTimer);
                    if (res.data.code === '1') {
                        const temp = res.data.data;
                        temp.forEach(item => {
                            const index = this.fileList.findIndex(subItem => subItem.uid === item.toFileKey);
                            if (item.code === 200) {
                                this.fileList[index].percentage = 100;
                                this.fileList[index].showProgress = false;
                                this.fileList[index].status = 'finished';
                                this.subscription_list.push({
                                    desc1: '从资料库选取的文件，不需要有subscription',
                                    desc2: '但是为了正常上传的文件删除时不报错，此处加一个占位的对象',
                                    uid: this.fileList[index].uid
                                });
                            } else {
                                this.fileList.splice(index, 1);
                            }
                        });
                        if (temp.some(item => item.code !== 200)) {
                            this.$Message.error(this.$t('whatsapp_manage.fail_copy_dataBaseFile'));
                        }
                    }
                }).catch(err => {
                    // clearInterval(this.dataBaseTimer);
                    console.log('copyFileToMail()---err', err);
                    fileDatas.forEach(item => {
                        const index = this.fileList.findIndex(subItem => subItem.uid === item.toFileKey);
                        this.fileList.splice(index, 1);
                    });
                    this.$Message.error(this.$t('whatsapp_manage.fail_copy_dataBaseFile'));
                });
            },
            mockFileUploadProgress(fileData) {
                let progress = 0;
                const _this = this;
                this.dataBaseTimer = setInterval(function() {
                    progress += Math.floor(Math.random() * 10);
                    if (progress >= 99) {
                        progress = 99;
                        clearInterval(_this.dataBaseTimer);
                    }
                    _this.fileList.forEach(item => {
                        if (item.uid === fileData.uid) {
                            item.percentage = progress;
                        }
                        return item;
                    });
                }, 100);
            }
        },
        created() {
        // this.initQiniu()
        },
        watch: {
            defaultFileList: {
                immediate: true,
                handler(fileList) {
                    if (fileList && fileList.length) {
                        this.fileList = fileList;
                        // this.defaultFileList_ext = this.fileList.concat();
                    }
                }
            },
            fileList: {
                handler(val) {
                    if (val.every(item => item.status === 'finished' && !item.showProgress)) {
                        this.$emit('getUploadFilesList', val);
                    }
                },
                deep: true
            },
            dataBaseUpload: {
                handler(val) {
                    if (!val) {
                        this.$store.commit('setParentId', 0);
                    }
                }
            }
        }
    };
</script>
