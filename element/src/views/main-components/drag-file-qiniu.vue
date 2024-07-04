<template>
    <div :class="[prefixCls]">
        <div @paste="handlePaste"
             @drop.prevent="onDrop"
             @dragover.prevent="dragOver = true"
             @dragleave.prevent="dragOver = false"
             style="position: relative;line-height: 23px;"
             :class="classes">
            <!-- 上传文件 input -->
            <input type="file"
                   :multiple="multiple"
                   :accept="accept"
                   ref="input"
                   @change="handleChange"
                   style="display: none;"
                   :class="[prefixCls + '-input']">

            <!-- fileList -->
            <div v-if="showUploadList"
                 class="drag-file-list">
                <DragFileItem v-for="file in fileList"
                              :key="file.uid"
                              :file="file"
                              @handleRemove="handleRemove"></DragFileItem>
            </div>

            <!-- slot -->
            <slot></slot>

            <!-- 遮罩提示层 -->
            <div v-if="type === 'drag' && dragOver"
                 class="dragOver-mask">
                <p>{{ $t('dragFileTip') }}</p>
            </div>
        </div>

        <!-- slot -->
        <slot name="tip"></slot>

        <!-- 资料库弹框 -->
        <DataBaseModal v-if="visible_database"
                       :visible.sync="visible_database"
                       @getDataBaseFile="getDataBaseFile"></DataBaseModal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import * as qiniu from 'qiniu-js';
    import { mapState } from 'vuex';
    import DragFileItem from '@/views/main-components/drag-file-item';
    import DataBaseModal from '@/views/crm/Briefcase/Components/dataBaseComponents/dataBaseModal.vue';
    import { updateFileCharset } from '@/api/reusableApi/common';

    const prefixCls = 'ivu-upload';

    export default {
        name: 'drag-file-qiniu',
        components: {
            DragFileItem,
            DataBaseModal
        },
        props: {
            isSeparate: {
                type: Number,
                default: 0
            },
            action: {
                type: String
            },
            headers: {
                type: Object,
                default() {
                    return {};
                }
            },
            multiple: {
                type: Boolean,
                default: false
            },
            data: {
                type: Object
            },
            name: {
                type: String,
                default: 'file'
            },
            withCredentials: {
                type: Boolean,
                default: false
            },
            showUploadList: {
                type: Boolean,
                default: true
            },
            type: {
                type: String,
                default: 'select'
            },
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
            specialFileLimit: {
                type: Array, // 关于附件上传的一些特殊限制，例如某类文件的某个格式，有特殊的大小限制，诸如此类，由父组件另外传入；格式为：specialFileLimit: [{type: 'xxx', sizeLimit: xxx}];sizeLimit单位为M
                default() {
                    return [];
                }
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
            onRemove: {
                type: Function,
                default() {
                    return {};
                }
            },
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
            paste: {
                type: Boolean,
                default: false
            },
            disabled: {
                type: Boolean,
                default: false
            },
            uploadMethod: {
                type: String,
                default: 'normal'
            }
        },
        data() {
            return {
                prefixCls: prefixCls,
                dragOver: false,
                fileList: [],
                subscriptions: {}, // 七牛上传 subscription

                // 资料库弹框显隐
                visible_database: false
            };
        },
        computed: {
            ...mapState([
                'userId',
                'enterpriseId',
                'qiniuHttp'
            ]),
            classes() {
                return [
                    `${prefixCls}`,
                    {
                        [`${prefixCls}-select`]: this.type === 'select',
                        [`${prefixCls}-drag`]: this.type === 'drag',
                        [`${prefixCls}-dragOver`]: this.type === 'drag' && this.dragOver
                    }
                ];
            }
        },
        methods: {
            /* 文件上传相关 */
            // 点击
            handleClick() {
                if (this.uploadMethod === 'normal') {
                    this.$refs.input.click();
                } else if (this.uploadMethod === 'dataBase') {
                    this.visible_database = true;
                }
            },
            // 拖拽
            onDrop(e) {
                this.dragOver = false;
                if (this.disabled) return;
                this.uploadFiles(e.dataTransfer.files);
            },
            // 粘贴
            handlePaste(e) {
                if (this.disabled) return;
                if (this.paste) {
                    this.uploadFiles(e.clipboardData.files);
                }
            },
            // input 触发文件上传
            handleChange(e) {
                const files = e.target.files;

                if (!files) {
                    return;
                }
                this.uploadFiles(Array.prototype.slice.call(files));
                e.target.value = null;
            },
            // 文件上传
            upload(file, token, isDataBase) {
                if (!this.beforeUpload) {
                    isDataBase ? this.fileList.push(file) : this.post(file, token);
                    return;
                }

                const before = this.beforeUpload(file);
                if (before && before.then) {
                    before.then(processedFile => {
                        if (Object.prototype.toString.call(processedFile) === '[object File]') {
                            isDataBase ? this.fileList.push(processedFile) : this.post(processedFile, token);
                        } else {
                            isDataBase ? this.fileList.push(file) : this.post(file, token);
                        }
                    }, () => {
                        // this.$emit('cancel', file);
                    });
                } else if (before !== false) {
                    isDataBase ? this.fileList.push(file) : this.post(file, token);
                } else {
                    // this.$emit('cancel', file);
                }
            },
            // 批量文件上传
            async uploadFiles(files) {
                let postFiles = Array.prototype.slice.call(files);
                if (!this.multiple) postFiles = postFiles.slice(0, 1);

                // 校验去除不可上传的文件
                postFiles = this.checkFiles(postFiles);

                // 校验完成后如果没有可发送文件, 则退出上传流程
                if (postFiles.length === 0) {
                    return;
                }

                // 如果要显示文件列表而不是直接发送, 则需要请求七牛 token 先发送文件到七牛
                let token = false;
                if (this.showUploadList) {
                    token = await this.getQiniuToken();
                }
                if (!token) {
                    return;
                }

                // 逐个上传文件
                postFiles.forEach((file, index) => {
                    file.uid = `${this.userId}${index}${Date.now()}`;
                    this.upload(file, token);
                });
            },
            // 发送文件
            post(file, token) {
                // 初始化文件到文件列表
                this.handleStart(file);
                // 上传七牛
                this.uploadQiniu(file, token);
            },
            // 获取七牛文件上传 token
            getQiniuToken(event) {
                return util.oldAjax({
                    url: '/file-sys/api/uptoken',
                    method: 'post'
                }).then(response => {
                    if (response.data) {
                        return Promise.resolve(response.data.uptoken);
                    } else {
                        this.$Message.warning(this.$t('error_getUploadToken'));
                        return Promise.resolve(false);
                    }
                }).catch(error => {
                    console.error(error);
                    this.$Message.error(this.$t('crm.Modal.error_uploadImage'));
                    return Promise.resolve(false);
                });
            },
            // 七牛文件上传
            async uploadQiniu(file, token) {
                const config = {
                    useCdnDomain: true,
                    region: qiniu.region.z0
                };
                const putExtra = {
                    fname: '',
                    params: {}
                };
                // 这里是参照杨娣在 relatedDocument.vue 中写的 keyName

                const fileName = file.name.replace(/\s/g, '-');
                const linkName = `${file.uid}_facebook/${fileName}`;

                const next = response => {
                    this.handleProgress(response, file);
                };
                const error = response => {
                    this.handleError(response, file);
                };
                const complete = response => {
                    this.handleSuccess(response, file);
                };
                // 调用sdk上传接口获得相应的observable，控制上传和暂停
                const observable = await this.$qiniuUpload(file, linkName, putExtra, config, token);

                // 开始上传
                this.subscriptions[file.uid] = observable.subscribe(next, error, complete);
            },
            // 文件校验
            checkFiles(files) {
                let postFiles = Array.prototype.slice.call(files);
                // 避免 message 提示重叠在一起, 在 setTimeout 触发提示, 每次提示后增加 delay
                let delay = 0;

                // 单次上传文件个数不能超过 10 个, 超出则弹出提示
                if (postFiles.length > 10) {
                    this.$Message.warning(this.$t('chat.fileCountError'));
                    // 全部不上传
                    return [];
                    // 取前 10 个
                    // delay += 10;
                    // postFiles = postFiles.slice(0, 10);
                }

                // 文件格式和大小校验
                const files_errorFormat = [];
                const files_errorSize = [];
                const files_special_errorSize = [];
                postFiles = postFiles.filter(file => {
                    // 文件格式校验
                    if (this.format.length) {
                        const _file_format = file.name.split('.').pop().toLocaleLowerCase();
                        const checked = this.format.some(item => item.toLocaleLowerCase() === _file_format);
                        if (!checked) {
                            files_errorFormat.push(file.name);
                            this.onFormatError(file, this.fileList);
                            return false;
                        }
                    }

                    // 文件大小校验
                    if (this.maxSize) {
                        if (file.size > this.maxSize * Math.pow(1024, 2)) {
                            files_errorSize.push(file.name);
                            this.onExceededSize(file, this.fileList);
                            return false;
                        }
                    }
                    /* 某种格式的文件大小限制，做单独特殊处理 */
                    if (this.specialFileLimit.length) {
                        const _file_format = file.name.split('.').pop().toLocaleLowerCase();
                        const exceeded = this.specialFileLimit.some(item => {
                            return (item.type === _file_format) && (file.size > item.sizeLimit * Math.pow(1024, 2));
                        });
                        if (exceeded) {
                            files_special_errorSize.push({ name: file.name, type: _file_format });
                            this.onExceededSize(file, this.fileList);
                            return false;
                        }
                    }

                    return true;
                });

                // 错误提示
                if (files_errorFormat.length) {
                    // 根据单复数提示不同的中英文
                    const tip = `${this.$t('chat.fileFormatError1')}${files_errorFormat.join(', ')}${this.$t(files_errorFormat.length > 1 ? 'chat.filesFormatError2' : 'chat.fileFormatError2')}`;
                    setTimeout(() => {
                        this.$Message.warning(tip);
                    }, delay);
                    delay += 10;
                }
                if (files_errorSize.length) {
                    // 根据单复数提示不同的中英文
                    const tip = `${files_errorSize.join(', ')}${this.$t(files_errorSize.length > 1 ? 'chat.filesOverSize1' : 'chat.fileOverSize1')}${this.maxSize}M${this.$t('chat.fileOverSize2')}`;
                    setTimeout(() => {
                        this.$Message.warning(tip);
                    }, delay);
                    delay += 10;
                }
                if (files_special_errorSize.length) {
                    // 根据单复数提示不同的中英文
                    const tips = [];
                    files_special_errorSize.map(item => {
                        let tip = '';
                        const temp = this.specialFileLimit.find(subItem => subItem.type === item.type);
                        if (temp && temp.sizeLimit) {
                            tip = `${item.name}${this.$t('chat.fileOverSize1')}${temp.sizeLimit}M${this.$t('chat.fileOverSize2')}`;
                            tips.push(tip);
                        }
                    });
                    if (tips.length) {
                        for (let i = 0; i < tips.length; i++) {
                            setTimeout(() => {
                                this.$Message.warning(tips[i]);
                            }, delay);
                            delay += 10;
                        }
                    }
                }

                // 返回符合条件的 files
                return postFiles;
            },

            /* 文件列表相关 */
            // 从 fileList 中取到传入文件
            getFile(file) {
                const fileList = this.fileList;
                let target;
                fileList.every(item => {
                    target = file.uid === item.uid ? item : null;
                    return !target;
                });
                return target;
            },
            // 单个文件开始上传
            handleStart(file) {
                const _file = {
                    status: 'uploading',
                    name: file.name,
                    size: file.size,
                    percentage: 0,
                    uid: file.uid,
                    showProgress: true,
                    url: ''
                };

                // 获取文件后缀
                const name = file.name;
                let suffix = '';
                if (name.indexOf('.') !== -1) {
                    suffix = name.split('.').slice(-1)[0].toLowerCase();
                }
                _file.suffix = suffix;

                // 获取文件类型
                let type = 'file';
                const fileName = file.name;
                if (/\.(png|jpg|bmp|jpeg|gif)$/i.test(fileName)) {
                    type = 'image';
                } else if (/\.(mov|mp4|ogg|webm)$/i.test(fileName)) {
                    type = 'video';
                }
                _file.type = type;

                this.fileList.push(_file);
            },
            // 更新文件的上传进度
            handleProgress(response, file) {
                const _file = this.getFile(file);
                if (!_file) {
                    // 如果未找到文件, 取消上传
                    if (this.subscriptions[file.uid]) {
                        this.subscriptions[file.uid].unsubscribe();
                        delete this.subscriptions[file.uid];
                    }
                    return;
                }
                this.onProgress(response, _file, this.fileList);
                _file.percentage = response.total.percent || 0;
            },
            // 文件上传完成
            handleSuccess(response, file) {
                const _file = this.getFile(file);

                if (_file) {
                    _file.status = 'finished';
                    /**
                     * @Description: 编码文件名, 避免 url 错误
                     * 1. 之前遇到的错误: _`!@##$$%^&()+{}tianshi.jpeg
                     * 2. encodeURIComponent 会把 / 转义为 %2F , 造成 FB 发送文件时文件名显示错误(切换一下界面又好了), 因此保留 /
                     * @author 汤一飞
                     * @date 2020/7/7
                    */
                    _file.url = `${this.qiniuHttp}${encodeURIComponent(response.key).replace(/%2F/g, '/')}`;

                    // 删除对应 subscription
                    if (this.subscriptions[file.uid]) {
                        delete this.subscriptions[file.uid];
                    }

                    // 对 txt 进行文件转码, 解决 txt 有时预览失败的问题
                    if (response.key.indexOf('.txt') !== -1) {
                        updateFileCharset({
                            key: response.key
                        }).then(data => {
                            if (data.code === 1) {
                                // this.$Message.success(`${response.key}: 编码处理成功`);
                                console.log(`${response.key}: 编码处理成功`);
                            } else {
                                this.$Message.warning(`${response.key}: ${data.msg}`);
                            }
                        });
                    }

                    this.onSuccess(response, _file, this.fileList);

                    setTimeout(() => {
                        _file.showProgress = false;
                    }, 1000);
                } else {
                    // 如果未找到文件, 取消上传
                    if (this.subscriptions[file.uid]) {
                        this.subscriptions[file.uid].unsubscribe();
                        delete this.subscriptions[file.uid];
                    }
                }
            },
            // 文件上传失败
            handleError(response, file) {
                const _file = this.getFile(file);
                if (!_file) {
                    // 如果未找到文件, 取消上传
                    if (this.subscriptions[file.uid]) {
                        this.subscriptions[file.uid].unsubscribe();
                        delete this.subscriptions[file.uid];
                    }
                    return;
                }
                const fileList = this.fileList;

                _file.status = 'fail';

                // 删除对应 subscription
                if (this.subscriptions[file.uid]) {
                    delete this.subscriptions[file.uid];
                }
                const index = fileList.indexOf(_file);
                if (index !== -1) {
                    fileList.splice(index, 1);
                }

                this.onError(response, file);
            },
            // 移除文件
            handleRemove(file) {
                const fileList = this.fileList;
                // 如果还未上传完成, 取消上传
                if (this.subscriptions[file.uid]) {
                    this.subscriptions[file.uid].unsubscribe();
                    delete this.subscriptions[file.uid];
                }
                const index = fileList.indexOf(file);
                if (index !== -1) {
                    fileList.splice(index, 1);
                }
                this.onRemove(file, fileList);
            },
            // 预览文件
            handlePreview(file) {
                if (file.status === 'finished') {
                    this.onPreview(file);
                }
            },
            // 清空文件列表
            clearFiles() {
                this.fileList = [];
                this.subscriptions = {};
            },

            /* 资料库文件 */
            // 获取选中的资料库文件
            async getDataBaseFile(files) {
                let postFiles = Array.prototype.slice.call(files);
                if (!this.multiple) postFiles = postFiles.slice(0, 1);

                // 资料库文件格式化为 checkFiles 所需格式文件
                // 顺便把部分其他参数也加上去
                postFiles = postFiles.map(file => {
                    // 获取文件类型
                    let type = 'file';
                    const fileName = file.name;
                    if (/\.(png|jpg|bmp|jpeg|gif)$/i.test(fileName)) {
                        type = 'image';
                    } else if (/\.(mov|mp4|ogg|webm)$/i.test(fileName)) {
                        type = 'video';
                    }

                    return {
                        status: 'finished',
                        name: file.filename,
                        size: parseInt(file.size),
                        percentage: 100,
                        uid: `${this.userId}-db-${file.id}-${Date.now()}_facebook/${file.filename.replace(/\s/g, '-')}`,
                        dataBaseUid: file.placeKey,
                        showProgress: true,
                        url: '',
                        suffix: file.suffix,
                        type
                    };
                });

                // 校验去除不可上传的文件
                postFiles = this.checkFiles(postFiles);

                // 校验完成后如果没有可发送文件, 则退出上传流程
                if (postFiles.length === 0) {
                    return;
                }

                // 获取资料库文件的 url , 追加到 postFiles 中
                const res_copyFile = await this.$commonApi.copyFile({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    type: 1,
                    qiNiuFileKeyConditionList: postFiles.map(file => {
                        return {
                            fromFileKey: file.dataBaseUid,
                            toFileKey: file.uid
                        };
                    })
                });
                if (res_copyFile.code && res_copyFile.code === '1') {
                    const temp = res_copyFile.data;

                    temp.forEach(item => {
                        if (item.code === 200) {
                            // 统一更新所有同 dataBaseUid 的文件的 url
                            const tmpFiles = postFiles.filter(file => file.uid === item.toFileKey);
                            tmpFiles.forEach(file => {
                                file.url = `${this.qiniuHttp}${file.uid}`;
                            });
                        } else {
                            // 转存文件失败, 删除所有同 dataBaseUid 的文件
                            postFiles = postFiles.filter(file => file.uid !== item.toFileKey);
                        }
                    });

                    if (temp.some(item => item.code !== 200)) {
                        this.$Message.error(this.$t('whatsapp_manage.fail_copy_dataBaseFile'));
                        return;
                    }
                } else {
                    this.$Message.error(this.$t('whatsapp_manage.fail_copy_dataBaseFile'));
                    return;
                }

                // 校验完成后如果没有可发送文件, 则退出上传流程
                if (postFiles.length === 0) {
                    return;
                }

                // 校验通过的文件, 逐个添加到列表
                postFiles.forEach(file => {
                    this.upload(file, null, true);
                });
            }
        },
        watch: {
            defaultFileList: {
                immediate: true,
                handler(fileList) {
                    this.fileList = fileList.map((item, index) => {
                        item.status = 'finished';
                        item.percentage = 100;
                        item.uid = `${this.userId}${index}${Date.now()}`;
                        return item;
                    });
                }
            },
            fileList: {
                handler(val) {
                    this.$emit('updateFileList', val);
                }
            },
            // 资料库文件弹框 tab 恢复初始状态
            visible_database: {
                handler(val) {
                    if (!val) {
                        this.$store.commit('setParentId', 0);
                    }
                }
            }
        }
    };
</script>

<style lang="less">
    @import "upload.less";
</style>

<style scoped lang="less">
    .drag-file-list {
        max-height: 188px;
        overflow: auto;
        text-align: left;
        cursor: default;
        background: #FFF;
    }

    .dragOver-mask {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(234,238,243,0.10);
        border: 3px dashed #B6C1CF;
        display: flex;
        align-items: center;
        pointer-events: none;

        p {
            flex: 1;
            text-align: center;
            font-size: 20px;
            color: #B6C1CF;
        }
    }
</style>
