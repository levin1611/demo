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

        <!-- 资料库弹框 -->
        <DataBaseModal v-if="visible_database"
                       :visible.sync="visible_database"
                       @getDataBaseFile="getDataBaseFile"></DataBaseModal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapActions, mapState } from 'vuex';
    import DragFileItem from '@/views/main-components/drag-file-item';
    import DataBaseModal from '@/views/crm/Briefcase/Components/dataBaseComponents/dataBaseModal.vue';

    const prefixCls = 'ivu-upload';

    export default {
        name: 'drag-file-YX',
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
            accId: {
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
            visitorId: {
                type: String
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
                YXUploads: {}, // 存放云信文件预览 upload , upload.aborts 中断文件上传

                // 资料库弹框显隐
                visible_database: false,
                // 下载资料库文件 url 为 File 对象的 axios cancelToken 集合
                cancelSaveTokenList: {}
            };
        },
        computed: {
            ...mapState([
                'nim',
                'enterpriseId',
                'userId',
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
            ...mapActions([
                'getVisitorReception' // 获取访客最近接待客服是否在线, 当前是否正在聊天
            ]),
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
            upload(file, isDataBase) {
                if (!this.beforeUpload) {
                    return this.post(file, isDataBase);
                }

                const before = this.beforeUpload(file);
                if (before && before.then) {
                    before.then(processedFile => {
                        if (Object.prototype.toString.call(processedFile) === '[object File]') {
                            this.post(processedFile, isDataBase);
                        } else {
                            this.post(file, isDataBase);
                        }
                    }, () => {
                        // this.$emit('cancel', file);
                    });
                } else if (before !== false) {
                    this.post(file, isDataBase);
                } else {
                    // this.$emit('cancel', file);
                }
            },
            // 批量文件上传
            async uploadFiles(files) {
                // 判断当前 visitorId 是否可以或正在被当前客服接待, 是则可以各种操作访客数据或发消息
                const res = await this.getVisitorReception(this.visitorId);
                if (!res) {
                    return;
                }

                let postFiles = Array.prototype.slice.call(files);
                if (!this.multiple) postFiles = postFiles.slice(0, 1);

                // 校验去除不可上传的文件
                postFiles = this.checkFiles(postFiles);

                // 校验完成后如果没有可发送文件, 则退出上传流程
                if (postFiles.length === 0) {
                    return;
                }

                // 逐个上传文件
                postFiles.forEach((file, index) => {
                    file.uid = `${this.userId}${index}${Date.now()}`;
                    this.upload(file);
                });
            },
            // 发送文件消息
            post(file, isDataBase) {
                // 如果未指定显示文件列表, 则直接发送消息出去
                if (!this.showUploadList) {
                    this.$store.dispatch('sendFileMsg', {
                        scene: 'p2p',
                        to: this.accId,
                        content: file
                    });
                    return;
                }
                // 否则需要显示 FileList
                // 上传云信
                this.previewFile(file, isDataBase);
            },
            // 云信文件预览方法, 返回的数据可以发送出去
            async previewFile(file, isDataBase) {
                // 判断是否建立连接, 不能建立连接则中断流程
                if (!await this.$store.dispatch('serverStartChat', this.accId)) {
                    return false;
                }
                const that = this;

                // 获取文件类型
                let type = 'file';
                const fileName = file.name;
                if (/\.(png|jpg|bmp|jpeg|gif)$/i.test(fileName)) {
                    type = 'image';
                } else if (/\.(mov|mp4|ogg|webm)$/i.test(fileName)) {
                    type = 'video';
                }

                // 预览文件
                this.nim.previewFile({
                    scene: 'p2p',
                    to: this.accId,
                    type,
                    blob: file,
                    beginupload: function(upload) {
                        that.handleStart(upload, file, type, isDataBase);
                    },
                    uploadprogress: function(response) {
                        that.handleProgress(response, file, isDataBase);
                    },
                    done: function(error, response) {
                        if (error) {
                            that.handleError(error, file, isDataBase);
                            return;
                        }
                        that.handleSuccess(response, file, isDataBase);
                    }
                });
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
            handleStart(response, file, type, isDataBase) {
                const _file = {
                    status: 'uploading',
                    name: file.name,
                    size: file.size,
                    percentage: 0,
                    uid: file.uid,
                    showProgress: true,
                    YXFile: null,
                    url: '',
                    type: type || 'file'
                };

                // 获取文件后缀
                const name = file.name;
                let suffix = '';
                if (name.indexOf('.') !== -1) {
                    suffix = name.split('.').slice(-1)[0].toLowerCase();
                }
                _file.suffix = suffix;

                if (isDataBase === 'dataBase') {
                    // 是数据库文件上传

                    // 统一将当前文件列表中与此文件 dataBaseUid 相同的文件替换为 _file
                    this.fileList.forEach((item, index) => {
                        if (item.dataBaseUid === file.dataBaseUid) {
                            this.fileList.splice(index, 1, Object.assign({}, _file, {
                                name: item.name,
                                dataBaseUid: item.dataBaseUid,
                                originalFile: item.originalFile
                            }));
                        }
                    });

                    this.YXUploads[file.dataBaseUid] = response;
                } else {
                    // 非数据库文件上传

                    this.fileList.push(_file);
                    this.YXUploads[file.uid] = response;
                }
            },
            // 更新文件的上传进度
            handleProgress(response, file, isDataBase) {
                // 资料库文件处理
                if (isDataBase === 'dataBase') {
                    // 查找文件列表中与当前文件的源文件(资料库文件)相同的文件
                    const sameDbFileList = this.fileList.filter(item => item.dataBaseUid === file.dataBaseUid);

                    // 如果未找到文件, 取消上传
                    if (!sameDbFileList.length) {
                        if (this.YXUploads[file.dataBaseUid]) {
                            this.YXUploads[file.dataBaseUid].abort();
                            delete this.YXUploads[file.dataBaseUid];
                        }
                        return;
                    }

                    // 所有同源文件同步更新进度条
                    sameDbFileList.forEach(file => {
                        this.onProgress(response, file, this.fileList);
                        file.percentage = response.percentage || 0;
                    });

                    return;
                }

                const _file = this.getFile(file);
                if (!_file) {
                    // 如果未找到文件, 取消上传
                    if (this.YXUploads[file.uid]) {
                        this.YXUploads[file.uid].abort();
                        delete this.YXUploads[file.uid];
                    }
                    return;
                }
                this.onProgress(response, _file, this.fileList);
                _file.percentage = response.percentage || 0;
            },
            // 文件上传完成
            handleSuccess(response, file, isDataBase) {
                // 资料库文件处理
                if (isDataBase === 'dataBase') {
                    // 查找文件列表中与当前文件的源文件(资料库文件)相同的文件
                    const sameDbFileList = this.fileList.filter(item => item.dataBaseUid === file.dataBaseUid);

                    // 如果未找到文件, 取消上传
                    if (!sameDbFileList.length) {
                        if (this.YXUploads[file.dataBaseUid]) {
                            this.YXUploads[file.dataBaseUid].abort();
                            delete this.YXUploads[file.dataBaseUid];
                        }
                        return;
                    }

                    // 所有同源文件同步更新数据
                    sameDbFileList.forEach(file => {
                        file.status = 'finished';
                        file.percentage = 100;
                        file.YXFile = this.$deepClone(response);
                        file.url = response.url;

                        if (this.YXUploads[file.dataBaseUid]) {
                            delete this.YXUploads[file.dataBaseUid];
                        }
                        this.onSuccess(response, file, this.fileList);

                        // 隐藏进度条
                        setTimeout(() => {
                            file.showProgress = false;
                        }, 1000);
                    });

                    return;
                }

                const _file = this.getFile(file);

                if (_file) {
                    _file.status = 'finished';
                    _file.YXFile = response;
                    _file.url = response.url;

                    // 删除对应 subscription
                    if (this.YXUploads[file.uid]) {
                        delete this.YXUploads[file.uid];
                    }

                    this.onSuccess(response, _file, this.fileList);

                    setTimeout(() => {
                        _file.showProgress = false;
                    }, 1000);
                } else {
                    // 如果未找到文件, 取消上传
                    if (this.YXUploads[file.uid]) {
                        this.YXUploads[file.uid].abort();
                        delete this.YXUploads[file.uid];
                    }
                }
            },
            // 文件上传失败
            handleError(response, file, isDataBase) {
                // 资料库文件处理
                if (isDataBase === 'dataBase') {
                    // 查找文件列表中与当前文件的源文件(资料库文件)相同的文件
                    const sameDbFileList = this.fileList.filter(item => item.dataBaseUid === file.dataBaseUid);

                    // 如果未找到文件, 取消上传
                    if (!sameDbFileList.length) {
                        if (this.YXUploads[file.dataBaseUid]) {
                            this.YXUploads[file.dataBaseUid].abort();
                            delete this.YXUploads[file.dataBaseUid];
                        }
                        return;
                    }

                    // 所有同源文件同步删除
                    sameDbFileList.forEach(file => {
                        file.status = 'fail';

                        // 删除对应 subscription
                        if (this.YXUploads[file.dataBaseUid]) {
                            delete this.YXUploads[file.dataBaseUid];
                        }
                        const index = this.fileList.indexOf(file);
                        if (index !== -1) {
                            this.fileList.splice(index, 1);
                        }

                        this.onError(response, file);
                    });

                    return;
                }

                const _file = this.getFile(file);
                if (!_file) {
                    // 如果未找到文件, 取消上传
                    if (this.YXUploads[file.uid]) {
                        this.YXUploads[file.uid].abort();
                        delete this.YXUploads[file.uid];
                    }
                    return;
                }

                const fileList = this.fileList;

                _file.status = 'fail';

                // 删除对应 subscription
                if (this.YXUploads[file.uid]) {
                    delete this.YXUploads[file.uid];
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
                if (this.YXUploads[file.uid]) {
                    this.YXUploads[file.uid].abort();
                    delete this.YXUploads[file.uid];
                }

                // 资料库文件处理
                if (file.dataBaseUid) {
                    // 检查文件列表中是否还有其他文件与被删除文件有相同源文件(资料库文件)
                    const sameDbFileList = fileList.filter(item => {
                        return (item.dataBaseUid === file.dataBaseUid) && (item.uid !== file.uid);
                    });

                    // 如果有相同源文件, 则说明其他源文件还需要继续下载, 不能取消此请求, 否则取消请求
                    if (!sameDbFileList.length) {
                        // 取消下载请求
                        if (this.cancelSaveTokenList[file.dataBaseUid]) {
                            this.cancelSaveTokenList[file.dataBaseUid].cancel('主动取消上传');
                        }
                        // 取消云信上传
                        if (this.YXUploads[file.dataBaseUid]) {
                            // 如果有相同源文件, 则说明其他源文件还需要继续上传, 不能取消此请求, 否则取消请求
                            this.YXUploads[file.dataBaseUid].abort();
                            delete this.YXUploads[file.dataBaseUid];
                        }
                    }
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
                this.YXUploads = {};
                this.cancelSaveTokenList = {};
            },

            /* 资料库文件 */
            // 获取选中的资料库文件
            async getDataBaseFile(files) {
                // 判断当前 visitorId 是否可以或正在被当前客服接待, 是则可以各种操作访客数据或发消息
                const res = await this.getVisitorReception(this.visitorId);
                if (!res) {
                    return;
                }

                let postFiles = Array.prototype.slice.call(files);
                if (!this.multiple) postFiles = postFiles.slice(0, 1);

                // 资料库文件格式化为 checkFiles 所需格式文件
                // 顺便把部分其他参数也加上去, 准备在下载文件到缓存阶段就加入文件到列表
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
                        status: 'reading',
                        name: file.filename,
                        size: parseInt(file.size),
                        percentage: 0,
                        uid: `${this.userId}-db-${file.id}-${Date.now()}.${file.suffix}`,
                        dataBaseUid: file.placeKey,
                        showProgress: true,
                        originalFile: '',
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

                // 校验通过的文件, 逐个添加到列表, 并开始转存文件
                postFiles.forEach(file => {
                    // 先把 reading 状态的文件显示出来, 让用户看到文件正在读取(下载)
                    this.fileList.push(file);

                    // 下载文件并更新进度, 下载完了参照本地文件上传, 走云信 preview 流程
                    this.transferUrlToFile(file);
                });
            },
            // 转换文件 url 为 file 对象
            transferUrlToFile(file) {
                // 查找文件列表中与当前文件的源文件(资料库文件)相同的文件
                const sameDbFileList = this.fileList.filter(item => {
                    return (item.dataBaseUid === file.dataBaseUid) && (item.uid !== file.uid);
                });
                // 是否已经读取完毕, 是则复用已读取完毕的文件的各项数据
                sameDbFileList.some(item => {
                    if (item.status !== 'reading') {
                        if (item.originalFile) {
                            file.originalFile = new File([item.originalFile.slice()], file.name);
                        }
                        file.status = item.status;
                        file.percentage = item.status;
                        if (item.YXFile) {
                            file.YXFile = this.$deepClone(item.YXFile);
                            file.url = item.url;
                        }
                        return true;
                    }
                });
                // 不管之前数据能否复用, 只要存在相同源文件, 都不继续往下执行文件下载
                // 如果已复用, 当然不用往下, 如果未复用, 说明之前的文件正在下载到缓存/上传云信, 等它下载完后同步进度到本文件即可
                // (handleRemove 中, 取消某个文件请求时, 还要判断不存在其他文件与其源文件相同才能取消, 也是出于这个考虑, 某个文件被删除后, 可能仍然在上传, 以便让其他同源文件复用其下载的数据)
                if (sameDbFileList.length) {
                    return;
                }

                // 初始化取消令牌
                this.$set(this.cancelSaveTokenList, file.dataBaseUid, util.axios.CancelToken.source());

                // 发送下载请求
                util.ajaxDownloadFile({
                    url: file.url.replace(/^https?:\/\//i, '//'),
                    onDownloadProgress: evt => {
                        // 所有同 dataBaseUid 文件一起更新进度
                        this.fileList.filter(item => item.dataBaseUid === file.dataBaseUid).forEach(item => {
                            item.percentage = Math.floor(100 * evt.loaded / evt.total);
                        });
                    },
                    cancelToken: this.cancelSaveTokenList[file.dataBaseUid].token
                }).then(res => {
                    // 可以检查其他文件是否 dataBaseUid 一致, 是的话其他文件不用请求, 统一使用 originalFile 数据
                    this.fileList.filter(item => item.dataBaseUid === file.dataBaseUid).forEach((item, index) => {
                        // 获取到 file 对象
                        const tmpBlob = new Blob([res.data]);
                        item.originalFile = new File([tmpBlob], item.name);
                        item.originalFile.uid = item.uid;
                        item.originalFile.dataBaseUid = item.dataBaseUid;

                        // 结束文件读取, 进入云信上传阶段
                        item.status = 'uploading';
                        item.percentage = 0;

                        // 首个文件开始上传云信(之后它同步进度给其他文件)
                        if (index === 0) {
                            this.upload(item.originalFile, 'dataBase');
                        }
                    });

                    // 删除取消请求令牌
                    this.$set(this.cancelSaveTokenList, file.dataBaseUid, null);
                }).catch(err => {
                    console.error(err);

                    // 删除取消请求令牌
                    this.$set(this.cancelSaveTokenList, file.dataBaseUid, null);

                    // 上传失败, 直接删掉所有同 dataBaseUid 文件
                    this.fileList.filter(item => item.dataBaseUid === file.dataBaseUid).forEach(item => {
                        this.handleRemove(item);
                    });

                    // 非主动取消上传情况下, 弹出提示语
                    if (!(err && err.message && err.message === '主动取消上传')) {
                        this.$Message.error(this.$t('whatsapp_manage.fail_read_dataBaseFile'));
                    }
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
