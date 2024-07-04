<template>
    <div :class="[prefixCls]" class="border-hover el-upload--text">
        <div
                :class="classes"
                @drop.prevent="onDrop"
                @dragover.prevent="dragOver = true"
                @dragleave.prevent="dragOver = false">
            <input
                    ref="input"
                    type="file"
                    :class="[prefixCls + '__input']"
                    @change="handleChange"
                    :multiple="multiple"
                    :accept="accept">
            <div class="data-movement-upload-tips-wrapper">
                    <span class="data-movement-upload-tips">
                        {{$t('data_movement.dragFile')}}<Button plain type="primary" style="color:#FA8241;" @click="handleClick">{{$t('data_movement.viewFile')}}</Button>{{$t('data_movement.supportTitle')}}
                    </span>
            </div>
            <slot></slot>
        </div>
        <slot name="tip"></slot>
        <DMUploadList
                v-if="showUploadList"
                :files="fileList"
                :ul_width="ul_width"
                @on-file-remove="handleRemove"
                @on-file-preview="handlePreview">
        </DMUploadList>
    </div>
</template>
<script>
    import util from '@/libs/util';
    import DMUploadList from './DMUploadList';
    // import util from '@/libs/util';
    // import Emitter from 'view-design/src/mixins/emitter';
    import {mapState, mapGetters} from 'vuex';
    import XLSX from 'xlsx';

    const prefixCls = 'el-upload';

    export default {
        name: 'DMUpload',
        // mixins: [Emitter],
        components: { DMUploadList },
        props: {
            action: {
                type: String,
                required: true
            },
            ul_width: {
                type: Number
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
            isUploadFiles: {
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
                validator(value) {
                    return util.oneOf(value, ['select', 'drag']);
                },
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
            userType: {
                type: Number,
                default: 1
            }
        },
        data() {
            return {
                prefixCls: prefixCls,
                dragOver: false,
                fileList: [],
                filesUploaded: [],
                tempIndex: 1,
                uptoken: null,
                subscription_list: [],
                num: 0,
                is_first: true,
                defaultFileList_ext: [], // defaultFileList的变形
                excelData: {
                    header: null,
                    results: null
                }
            };
        },
        computed: {
            classes() {
                return [
                    `${prefixCls}`,
                    {
                        [`${prefixCls}--text`]: this.type === 'select',
                        [`${prefixCls}-dragger`]: this.type === 'drag',
                        [`${prefixCls}-dragger is-dragover`]: this.type === 'drag' && this.dragOver
                    }
                ];
            },
            ...mapState({
                user_id: state => state.userId,
                enterpriseId: state => state.enterpriseId,
                files: state => state.crm.files,
            }),
            ...mapGetters(['getIsClear']),
            fileSize() {
                let result = 0;
                this.fileList.forEach(item => {
                    result += this.getSizeNumber(item.size);
                });
                return result;
            }
        },
        methods: {
            handleClick() {
                if (this.disabled) return;
                this.$refs.input.click();
            },
            init() {
                // 判断用户刷新行为，如果刷新了，就把localStorage里的内容重新放到fileList中
                // 根据fileList是否为空来进行判断
                // localStorage中fileFlag： ‘1’---用户刷新前已经上传过文件；‘0’----用户上传过但全部删除了或根本没有上传
                let flag = localStorage.getItem('fileFlag');
                if (this.fileList.length === 0 && flag === '1') {
                    for (let i = 0; i < localStorage.length; i++) {
                        let key = localStorage.key(i);
                        if (key.substring(key.length - 4) === 'xlsx' || key.substring(key.length - 4) === '.xls') {
                            if (localStorage.getItem(key) !== 'null' || localStorage.getItem(key) !== null) {
                                this.fileList.push(JSON.parse(localStorage.getItem(key)));
                            }
                        }
                    }
                    this.$store.state.crm.files = this.fileList;
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
            /** 展示excel文件 */
            readerData(rawFile) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = e => {
                        try {
                            let name = rawFile.name;
                            const data = e.target.result;
                            const workbook = XLSX.read(data, { type: 'array' });
                            /**
                             * @description: 支持询盘云导入模板 由于第一页是 描述信息 所以读不到数据
                             * @author: yiming cai
                             * */
                            let sheetNames = workbook.SheetNames;
                            if (sheetNames.length === 2 && sheetNames[0] === '描述信息') {
                                // 处理多页excel的逻辑
                                if (this.files.length) {
                                    this.files.forEach(item => {
                                        if (item.name === name) {
                                            this.$set(item, 'sheets', 1);
                                        }
                                    });
                                }
                                let firstSheetName = workbook.SheetNames[1];
                                const worksheet = workbook.Sheets[firstSheetName];
                                const header = this.getHeaderRow(worksheet);
                                // this.dataMock = header;
                                const results = XLSX.utils.sheet_to_json(worksheet);
                                this.generateData({ header, results });
                                // this.loading = false
                                resolve();
                            } else {
                                // 处理单页的逻辑
                                if (this.files.length) {
                                    this.files.forEach(item => {
                                        if (item.name === name) {
                                            this.$set(item, 'sheets', 0);
                                        }
                                    });
                                }
                                let firstSheetName = workbook.SheetNames[0];
                                // const firstSheetName = workbook.SheetNames[0];
                                const worksheet = workbook.Sheets[firstSheetName];
                                const header = this.getHeaderRow(worksheet);
                                // this.dataMock = header;
                                const results = XLSX.utils.sheet_to_json(worksheet);
                                this.generateData({ header, results });
                                // this.loading = false
                                resolve();
                            }
                            // const firstSheetName = workbook.SheetNames[0];
                            // console.log('the sheetname is', firstSheetName)
                            // const worksheet = workbook.Sheets[firstSheetName];
                            // const header = this.getHeaderRow(worksheet);
                            // // this.dataMock = header;
                            // const results = XLSX.utils.sheet_to_json(worksheet);
                            // this.generateData({header, results});
                            // // this.loading = false
                            // resolve();
                        } catch (e) {
                            console.log('excel文件读取失败',e);
                            reject();
                        }
                        // const data = e.target.result;
                        // console.log('the data is ', data)
                        // const workbook = XLSX.read(data, {type: 'array'});
                        // console.log('the workbook is', workbook)
                        // const firstSheetName = workbook.SheetNames[0];
                        // console.log('the sheetname is', firstSheetName)
                        // const worksheet = workbook.Sheets[firstSheetName];
                        // const header = this.getHeaderRow(worksheet);
                        // // this.dataMock = header;
                        // const results = XLSX.utils.sheet_to_json(worksheet);
                        // this.generateData({header, results});
                        // // this.loading = false
                        // resolve();
                    };

                    reader.readAsArrayBuffer(rawFile);
                });
            },
            getHeaderRow(sheet) {
                const headers = [];
                const range = XLSX.utils.decode_range(sheet['!ref']);
                let C;
                const R = range.s.r;
                /* start in the first row */
                for (C = range.s.c; C <= range.e.c; ++C) { /* walk every column in the range */
                    const cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })];
                    if (cell && cell.t && cell.v.trim()) {
                        const hdr = XLSX.utils.format_cell(cell);
                        headers.push(hdr);
                    } else {
                        return headers;
                    }
                    /* find the cell in the first row */
                    // let hdr = `UNKNOWN ${C}`; // <-- replace with your desired default
                    // if (cell && cell.t && cell.v.trim()) hdr = XLSX.utils.format_cell(cell);
                    // console.log(hdr)
                    // headers.push(hdr);
                }
                return headers;
            },
            /** 保存文件信息 */
            async saveFileData(file) {
                await this.readerData(file);
                let content = JSON.stringify(this.excelData.header);
                localStorage.setItem(`${file.name}header`, content);
                localStorage.setItem('fileFlag', '1');
            },
            generateData({header, results}) {
                this.excelData.header = header;
                this.excelData.results = results;
            },
            async uploadFiles(files) {
                let postFiles = Array.prototype.slice.call(files);
                if (!this.multiple) postFiles = postFiles.slice(0, 1);
                if (postFiles.length === 0) return;
                let totalSize = 0;
                postFiles.forEach((file, index) => {
                    totalSize += file.size;
                });

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
            /** 文件上传 */
            post(file, index) {
                // check format
                let fileNameLen = file.name.length;
                if (fileNameLen > 100) {
                    this.$resetMessage.warning('上传的文件名称超出100字符数，请重命名后再上传');
                    return;
                }
                let self = this;
                if (this.format.length) {
                    const _file_format = file.name.split('.').pop().toLocaleLowerCase();
                    const checked = this.format.some(item => item.toLocaleLowerCase() === _file_format);
                    if (!checked) {
                        this.onFormatError(file, this.fileList);
                        return false;
                    }
                }
                // check maxSize
                if (this.maxSize) {
                    if (file.size > this.maxSize * 1024) {
                        this.onExceededSize(file, this.fileList);
                        return false;
                    }
                }

                this.handleStart(file, index);

                let formData = new FormData();

                formData.append('file', file);
                let orgId = this.enterpriseId;
                let userId = this.user_id;
                this.$emit('excelUploaded', this.defaultFileList);
                let config = {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                };
                // util.axios.post(`${util.ajaxUrl}/crm/inquiryImportLog/uploadFile?orgId=${orgId}&userId=${userId}`, formData, config)
                //     .then(response => {
                //         if (response.data.code === '0') {
                //             self.handleSuccess(file);
                //         } else {
                //             this.$Message.warning(response.data.message);
                //             this.handleError(file);
                //         }
                //     }).catch(err => {
                //         console.log(err);
                //         this.$Message.error('文件上传失败，请重试');
                //         this.handleError(file);
                //     });
                util.axios.post(`${util.ajaxUrl}/crm-transfer/data/uploadFile?orgId=${orgId}&userId=${userId}`, formData, config).then(response =>{
                    if (response.data.code === '0') {
                        let cname = response.data.data;
                        self.handleSuccess(file, cname);
                    } else {
                        this.$Message.warning(response.data.message);
                        this.handleError(file);
                    }
                })
            },
            handleStart(file, index) {
                /** 判重：根据文件名称判断 */
                let flag = this.fileList.some(item => {
                    return Object.values(item).indexOf(file.name) !== -1;
                });
                if (flag) {
                    this.$resetMessage.error('文件已存在');
                    return;
                }
                file.uid = parseInt(`${this.user_id}${index}${Date.now()}`);
                const _file = {
                    status: 'uploading',
                    name: file.name,
                    size: file.size,
                    percentage: Math.random() * 99,
                    uid: file.uid,
                    flag: 0,
                    showProgress: true
                };
                this.fileList.push(_file);
                localStorage.setItem(`${file.name}`, JSON.stringify(_file));
                this.filesUploaded.push(_file);
                this.$store.state.crm.files = this.fileList;
                // this.$store.state.crm.files = this.filesUploaded.length === 0 ? this.fileList : this.filesUploaded;
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
            handleSuccess(file, cname) {
                const _file = this.getFile(file);

                if (_file) {
                    _file.status = 'finished';
                    _file.flag = 1;
                    _file.cname = cname;
                    // _file.response = res;
                    _file.percentage = 100;
                    // this.dispatch('FormItem', 'on-form-change', _file);
                    this.onSuccess(_file, this.fileList);
                    // debugger
                    this.saveFileData(file);
                    setTimeout(() => {
                        _file.showProgress = false;
                    }, 1000);
                }
                localStorage.setItem(`${file.name}`, JSON.stringify(_file));
                // this.$store.state.crm.files = this.filesUploaded.length === 0 ? this.fileList : this.filesUploaded;
                let temp = this.$deepClone(this.$store.state.crm.files);
                if (temp) {
                    temp.forEach(item => {
                        if (item.name === file.name) {
                            this.$set(item, 'cname', cname);
                        }
                    });
                }
                this.$store.state.crm.files = temp;
                this.fileList = temp;
                // this.filesUploaded = temp
            },
            handleError(file) {
                const _file = this.getFile(file);
                const fileList = this.fileList;

                _file.status = 'fail';

                fileList.splice(fileList.indexOf(_file), 1);
                this.filesUploaded.splice(this.filesUploaded.indexOf(_file), 1);
                this.fileList.splice(this.fileList.indexOf(_file), 1);

                // this.onError(err, response, file);
            },
            handleRemove(file) {
                // let config = {
                //     headers: {'Content-Type': 'multipart/form-data'},
                // };
                let orgId = this.enterpriseId;
                let userId = this.user_id;
                let formDataRemove = new FormData();
                let fileName = file.name;
                let tempObj = JSON.parse(JSON.stringify(this.$store.state.crm.files));
                let tempFile = this.fileList.find(item =>item.name === fileName);
                let tempIndex = this.fileList.findIndex(item => item.name === fileName)
                let fileCName = tempFile.cname
                formDataRemove.append('fileName', file.cname);
                util.axios.post(`${util.ajaxUrl}/crm/data/deleteFile?fileName=${fileCName}`)
                    .then(response => {
                        if (response.data.code === '0') {
                            // debugger
                            // const fileList = this.$deepClone(this.fileList);
                            // const filesUploaded = this.$deepClone(this.filesUploaded);
                            // const index = this.defaultFileList_ext.indexOf(file);
                            this.fileList.splice(tempIndex, 1);
                            // this.filesUploaded.splice(tempIndex, 1);
                            localStorage.removeItem(`${file.name}`);
                            localStorage.removeItem(`${file.name}header`);
                            // this.$store.state.crm.files = this.filesUploaded.length === 0 ? this.fileList : this.filesUploaded;
                            this.$store.state.crm.files = this.fileList;
                            // this.onRemove(file, this.fileList);
                            // this.onRemove(file, this.filesUploaded);
                            // this.defaultFileList_ext.splice(index, 1);
                            // if (index === -1) {
                            //     this.fileList.splice(this.fileList.indexOf(file), 1);
                            //     this.filesUploaded.splice(this.filesUploaded.indexOf(file), 1);
                            //     localStorage.removeItem(`${file.name}`);
                            //     localStorage.removeItem(`${file.name}header`);
                            //     this.$store.state.crm.files = this.filesUploaded.length === 0 ? this.fileList : this.filesUploaded;
                            //     this.onRemove(file, fileList);
                            //     this.onRemove(file, filesUploaded);
                            //     this.defaultFileList_ext.splice(index, 1);
                            // }
                        } else if (response.data.code === '1') {
                            this.$Message.warning(response.data.message);
                        }
                    }).catch(err => {
                        console.log(err);
                        this.$Message.error('文件删除失败，请重试');
                    });
            },
            /** 获取文件大小 数字 */
            getSizeNumber(size) {
                if (typeof (size) === 'string') {
                    let number = parseFloat(size);
                    /* unit数字带单位，字母换成小写了还是有数字 */
                    let unit = size.toLowerCase();
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
            }
        },
        created() {
            this.init();
        },
        watch: {
            defaultFileList: {
                immediate: true,
                handler(fileList) {
                    this.fileList = fileList.map(item => {
                        item.status = 'finished';
                        item.percentage = 100;
                        item.uid = Date.now() + this.tempIndex++;
                        return item;
                    });
                    this.defaultFileList_ext = this.fileList.concat();
                }
            },
            fileList: {
                handler(val) {
                    if (val.every(item => item.status === 'finished')) {
                        this.$emit('getUploadFilesList', val);
                    }
                    let len = this.fileList.length;
                    if (len === 0) {
                        localStorage.setItem('fileFlag', '0');
                        this.$emit('noFilesFlag', false);
                    }
                    let maxNum = 6;
                    if (len > maxNum) {
                        this.fileList.splice(-1, len - maxNum);
                        this.filesUploaded.splice(-1, len - maxNum);
                        // debugger
                        this.$store.state.crm.files = this.fileList;
                        /** todo here localstorage存进去了 */
                        if (this.fileList.length === maxNum) {
                            this.$resetMessage.error(this.$t('data_movement.upload_max_size_error'));
                        }
                    }
                },
                deep: true
            },
            getIsClear(state) {
                if (state) {
                    this.fileList = [];
                    this.filesUploaded = [];
                    this.$store.state.crm.isClear = false;
                }
            }
        }
    };
</script>
<style scoped lang="less">
    .el-upload {
        width: 100%;
        /*border: 1px dashed #cbd2e6;*/
        .el-upload-dragger {
            /*border: none !important;*/
            border: 1px dashed #cbd2e6;
            height: auto;
        }
        .is-dragover{
            border: 1px dashed #4285f2 !important;
        }
    }

    .data-movement-upload-tips-wrapper {
        margin-top: 4.4%;
        margin-bottom: 2.4%;

        .data-movement-upload-tips {
            /*margin-left: 28.3%;*/
            /*margin-right: 28.3%;*/
            font-size: 14px;
            color: rgba(0, 0, 0, .4);
            display: inline;
        }
    }
</style>
