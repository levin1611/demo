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
                 :class="fileListClasses">
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
    import { mapState } from 'vuex';
    import DragFileItem from '@/views/main-components/drag-file-item';
    import DataBaseModal from '@/views/crm/Briefcase/Components/dataBaseComponents/dataBaseModal.vue';

    const prefixCls = 'ivu-upload';

    export default {
        name: 'drag-file-postByFile',
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
            maxFileLength: {
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
            specialFileLimit: {
                type: Array, // 关于附件上传的一些特殊限制，例如某类文件的某个格式，有特殊的大小限制，诸如此类，由父组件另外传入；格式为：specialFileLimit: [{type: 'xxx', sizeLimit: xxx}];sizeLimit单位为M
                default() {
                    return [];
                }
            },
            fromModule: {
                type: String, // 引用当前组件的父组件模块名
                default: ''
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
                visible_database: false,
                cancelSaveTokenList: {}
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
            },
            fileListClasses() {
                /* piwik开头的class，为产品要求添加的GTM追踪标识 */
                const tempClass = `piwik-${this.fromModule}-drag-file-list`;
                return [
                    'drag-file-list',
                    `${this.fileList.length ? tempClass : ''}`
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
                if (files.length + this.fileList.length > this.maxFileLength) {
                    this.$Message.warning(`已达到单次可发送${this.maxFileLength}个文件数量`);
                }
                const length = this.maxFileLength - this.fileList.length;
                const tempArr = Array.from(files).slice(0, length);
                this.uploadFiles(Array.prototype.slice.call(tempArr));
                e.target.value = null;
            },
            // 文件上传
            upload(file, isDataBase) {
                if (!this.beforeUpload) {
                    isDataBase ? this.fileList.push(file) : this.post(file);
                    return;
                }

                const before = this.beforeUpload(file);
                if (before && before.then) {
                    before.then(processedFile => {
                        if (Object.prototype.toString.call(processedFile) === '[object File]') {
                            isDataBase ? this.fileList.push(processedFile) : this.post(processedFile);
                        } else {
                            isDataBase ? this.fileList.push(file) : this.post(file);
                        }
                    }, () => {
                        // this.$emit('cancel', file);
                    });
                } else if (before !== false) {
                    isDataBase ? this.fileList.push(file) : this.post(file);
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

                // 逐个上传文件
                postFiles.forEach((file, index) => {
                    file.uid = `${this.userId}${index}${Date.now()}`;
                    this.upload(file);
                });
            },
            // 发送文件
            post(file) {
                // 初始化文件到文件列表
                this.handleStart(file);
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
                        const checked = this.specialFileLimit.every(item => {
                            if (item.type === _file_format) {
                                return item.sizeLimit * 1024 * 1024 > file.size;
                            } else {
                                return true;
                            }
                        });
                        if (!checked) {
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
                    })
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
            // 单个文件上传
            handleStart(file) {
                const _file = {
                    originalFile: file,
                    isSending: false,
                    status: 'finished',
                    name: file.name,
                    size: file.size,
                    percentage: 100,
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
                let type = 'document';
                const fileName = file.name;
                if (/\.(png|jpg|jpeg|bmp|ico|gif|psd|webp)$/i.test(fileName)) {
                    type = 'image';
                } else if (/\.(3gp|flv|m3u8|mkv|mpg|avi|mp4|rm|rnvb|swf|wmv|webm)$/i.test(fileName)) {
                    type = 'video';
                } else if (/\.(mp3|aac|flac|ogg|wav)$/i.test(fileName)) {
                    type = 'audio';
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
            // 移除文件
            handleRemove(file) {
                const fileList = this.fileList;

                // 如果还未上传完成, 取消上传
                // 七牛上传部分 (目前此文件中实际不存在此类场景)
                if (this.subscriptions[file.uid]) {
                    this.subscriptions[file.uid].unsubscribe();
                    delete this.subscriptions[file.uid];
                }
                // 资料库文件转存部分
                if (file.dataBaseUid && this.cancelSaveTokenList[file.dataBaseUid]) {
                    // 检查文件列表中是否还有其他文件与被删除文件有相同源文件(资料库文件)
                    const sameDbFileList = fileList.filter(item => {
                        return (item.dataBaseUid === file.dataBaseUid) && (item.uid !== file.uid);
                    });

                    // 如果有相同源文件, 则说明其他源文件还需要继续上传, 不能取消此请求, 否则取消请求
                    if (!sameDbFileList.length) {
                        this.cancelSaveTokenList[file.dataBaseUid].cancel('主动取消上传');
                    }
                }

                // 从 fileList 中删除此文件
                const index = fileList.indexOf(file);
                if (index !== -1) {
                    fileList.splice(index, 1);
                }

                // 触发回调
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
                // 开发前, 梳理逻辑
                // 1. 格式化 files , 校验去除不可上传部分
                // 2. 资料库不会直接返回文件 url , 需要以选中文件数据请求接口获取文件对应 url , 赋值到 files 中
                // 3. wa 不支持 url 上传, 只支持 file 文件上传, 需要下载 url 转换为 file , 赋值到 files 中
                // 4. 进度条相关处理, 比如下载 url 进度条和真正的上传进度条之类的
                // 5. 用户手动取消上传时, 停止下载
                // 6. 其他优化: 重复上传资料库文件时直接复用, 取消上传时看下有没有等待复用本次上传内容的文件之类的

                let postFiles = Array.prototype.slice.call(files);
                if (!this.multiple) postFiles = postFiles.slice(0, 1);

                // 资料库文件格式化为 checkFiles 所需格式文件
                // 顺便把部分其他参数也加上去
                postFiles = postFiles.map(file => {
                    // 获取文件类型
                    let type = 'document';
                    const fileName = file.name;
                    if (/\.(png|jpg|jpeg|bmp|ico|gif|psd|webp)$/i.test(fileName)) {
                        type = 'image';
                    } else if (/\.(3gp|flv|m3u8|mkv|mpg|avi|mp4|rm|rnvb|swf|wmv|webm)$/i.test(fileName)) {
                        type = 'video';
                    } else if (/\.(mp3|aac|flac|ogg|wav)$/i.test(fileName)) {
                        type = 'audio';
                    }

                    return {
                        originalFile: '',
                        isSending: false,
                        status: 'reading',
                        name: file.filename,
                        size: parseInt(file.size),
                        percentage: 0,
                        uid: `${this.userId}-db-${file.id}-${Date.now()}.${file.suffix}`,
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

                // 校验通过的文件, 逐个添加到列表, 并开始转存文件
                postFiles.forEach(file => {
                    this.upload(file, true);
                    this.transferUrlToFile(file);
                });
            },
            // 转换文件 url 为 file 对象
            transferUrlToFile(file) {
                // 查找文件列表中与当前文件的源文件(资料库文件)相同的文件
                const sameDbFileList = this.fileList.filter(item => {
                    return (item.dataBaseUid === file.dataBaseUid) && (item.uid !== file.uid);
                });
                // 如果现有文件列表中已经有相同资料库文件上传完毕, 则不用重复上传, 直接拿来用就是
                sameDbFileList.some(item => {
                    if (item.originalFile) {
                        // 直接复用 originalFile 等信息
                        file.originalFile = new File([item.originalFile.slice()], file.name);
                        file.status = 'finished';
                        file.percentage = 100;
                        return true;
                    }
                });
                // 不管之前数据能否复用, 只要存在相同源文件, 都不继续往下执行文件下载
                // 如果已复用, 当然不用往下, 如果未复用, 说明之前的文件正在下载, 等它下载完后同步进度到本文件即可
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
                    this.fileList.filter(item => item.dataBaseUid === file.dataBaseUid).forEach(item => {
                        const tmpBlob = new Blob([res.data]);
                        item.originalFile = new File([tmpBlob], item.name);
                        item.status = 'finished';
                        item.percentage = 100;
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
