import util from '@/libs/util';
import Cookies from 'js-cookie'; // 引入cookie
import translateLang from '@/mixins/translateLang';

// 该文件为邮件详情翻译
export default {
    mixins: [translateLang],
    data() {
        return {
            translateLoading: false, // 翻译的loading阈值
            insertTxt: '', // 控制文本插入到光标处的阈值
            requestTextTooLong: '', // 提示信息
            requestText: '', // 需要翻译的文本
            targetText: '', // 翻译后的文本
            targetLang: 'en', // 目标语言的框
            translateModel: false, // 右侧翻译功能
            targetTranslate: '英语',
            lang: 'zh-CN',
            addTemplateVisible: false // 添加模板弹窗
        };
    },
    methods: {
        /** 主题input聚焦时触发 */
        subjectFocus() {
            // 这个是之前的代码
            this.cursorType = 'subject';
            // 将阈值变为subject,表示光标在主题处
            this.insertTxt = 'subject';
        },
        /** 将文本插入到光标处 */
        insertText() {
            // 获取当前的 this.insertTxt
            const type = this.insertTxt;
            // 根据type的不同,执行不同的方法
            switch (type) {
                case 'subject':
                    // 调用文本插入到 主题input 方法
                    this.insertSubject();
                    break;
                case 'tinymce':
                    // 调用文本插入到 富文本 方法
                    this.insertMainText();
                    break;
                default:
                    // 如果主题input和富文本没有聚焦,则进行提示信息
                    this.$Message.warning({
                        message: this.$t('mail.writeTranslate.onlyAddQuickText'),
                        duration: 1500
                    });
                    break;
            }
        },
        /** 根据光标位置将文本插入到主题input */
        insertSubject() {
            // 获取主题input元素
            const ethemeInput = this.$refs.subject.$refs.input;
            if (this.emailForm) {
                // 获取主题input元素的值
                const subjectText = this.emailForm.subject;
                // 做插入前做长度校验（如果有这个需要的话）
                // if (subjectText.length + value.length > 64) {
                //     return;
                // }
                // 获取选区开始位置
                const startPos = ethemeInput.selectionStart;
                // 获取选区结束位置
                const endPos = ethemeInput.selectionEnd;
                if (startPos === undefined || endPos === undefined) return;
                // 将文本插入光标位置
                this.emailForm.subject = subjectText.substring(0, startPos) + this.targetText + subjectText.substring(endPos);
                // 将光标移至文本末尾
                ethemeInput.focus();
                // 调整选区开始和结束的位置
                ethemeInput.selectionStart = startPos;
                ethemeInput.selectionEnd = startPos;
            }
            if (this.templateForm) {
                // 获取主题input元素的值
                const subjectText = this.templateForm.templateTitle;
                // 做插入前做长度校验（如果有这个需要的话）
                // if (subjectText.length + value.length > 64) {
                //     return;
                // }
                // 获取选区开始位置
                const startPos = ethemeInput.selectionStart;
                // 获取选区结束位置
                const endPos = ethemeInput.selectionEnd;
                if (startPos === undefined || endPos === undefined) return;
                // 将文本插入光标位置
                this.templateForm.templateTitle = subjectText.substring(0, startPos) + this.targetText + subjectText.substring(endPos);
                this.templateForm.templateTitle = this.templateForm.templateTitle.substring(0, 500);
                // 将光标移至文本末尾
                ethemeInput.focus();
                // 调整选区开始和结束的位置
                ethemeInput.selectionStart = startPos;
                ethemeInput.selectionEnd = startPos;
            }
        },
        /** 根据光标位置将文本插入到富文本 */
        insertMainText() {
            // 先将译文中的空格转为&nbsp;的空格 再将译文中的换行改为br换行
            let targetText = this.targetText.replace(/ /g, '&nbsp;').split(/\n/);
            const MainTextArr = [];
            for (let i = 0; i < targetText.length; i++) {
                MainTextArr.push(`<div>${targetText[i]}</div>`);
            };
            // 将新数组转为带有换行符的字符传并 给译文textarea赋值
            targetText = MainTextArr.join('\n');
            // 在光标处插入到富文本
            tinymce.activeEditor.execCommand('mceInsertContent', false, targetText);
            // 清空控制焦点的阈值   暂时保留这个注释   因为清空时会导致光标在富文本  但是无法插入文本的问题
            // this.insertTxt = '';
        },
        /** 清空原文和译文的翻译input框 */
        clearRequestText() {
            // 清空原文
            this.requestText = '';
            // 清空译文
            this.targetText = '';
            // 清除字符数为5000时的警告信息
            const textDom = document.getElementById('requestInput');
            textDom.style.borderColor = '#4285F2';
            textDom.style.boxShadow = '0 3px 0 0 #4285F2';
            this.requestTextTooLong = '';
        },
        /** 选择目标语言 */
        selectTargetLanguage(item) {
            // 更新显示的内容
            this.targetTranslate = item.label;
            // 更新目标语言
            this.targetLang = item.value;
            if (this.requestText.trim()) {
                // 选择语言时进行翻译功能
                this.handleTranslate();
            }
        },
        // 翻译功能
        handleTranslate() {
            // 如果输入框中为空,则不翻译
            if (!this.requestText.trim()) {
                // 清空译文框
                this.targetText = '';
                return;
            };
            const requestText = this.requestText.replace(/(\r\n|\r|\n)/g, '<br1>').replace(/\s/g, '&nbsp;');
            const requestTextList = requestText.split('<br1>');
            // 翻译按钮添加loading
            this.translateLoading = true;
            // 翻译接口
            util.ajaxInternational({
                url: '/translation/translationWithSource',
                method: 'post',
                data: {
                    requestTextList: requestTextList,
                    targetLang: this.targetLang
                }
            }).then(response => {
                const translations = response.data.data.translations;
                let targetText = '';
                translations.forEach(item => {
                    targetText += `${item.translatedText}<br>`;
                });
                this.targetText = targetText.replace(/<br>/g, '\n').replace(/'&nbsp;'/g, ' ');
                // 在本地cookie中存上次翻译的语种
                Cookies.set('writeTargetLang', this.targetLang);
                // 翻译按钮取消loading
                this.translateLoading = false;
            }).catch((err) => {
                console.log(err);
                // 翻译按钮取消loading
                this.translateLoading = false;
            });
        },
        /* ---- 插入模板 start ------------------------------------------ */
        handleTemplate(data) {
            if (data.handleType === 'append') {
                // 邮件模板主题追加
                if (this.templateForm) {
                    this.templateForm.templateTitle = (this.templateForm.templateTitle + data.templateTitle).substring(0, 500);
                }
                // 写信邮件主题 写信弹窗邮件主题追加
                if (this.emailForm) {
                    this.emailForm.subject = this.emailForm.subject + data.templateTitle;
                }
                // 营销活动主题追加
                if (this.marketingForm) {
                    this.marketingForm.subject = this.marketingForm.subject + data.templateTitle;
                }
                if (this.$refs.filesUpload.fileSize >= this.max_size * 1024) {
                    this.$Message.warning(`${this.$t('mail.uploadFilesOversizeTip')}${this.max_size / 1024}M`);
                } else {
                    if (data.attachmentList && data.attachmentList.length) {
                        let fileSize = this.$refs.filesUpload.fileSize;
                        for (let i = 0; i < data.attachmentList.length; i++) {
                            fileSize += data.attachmentList[i].size;
                            if (fileSize >= this.max_size * 1024) {
                                const message = this.$t('mailSetting.emailTemplate.uploadFilesOversizeTip').replace('$filter', `${this.max_size / 1024}M`);
                                this.$Message.warning(message);
                                break;
                            } else {
                                const fileList = [
                                    {
                                        name: data.attachmentList[i].fileName,
                                        url: data.attachmentList[i].filePath,
                                        size: data.attachmentList[i].fileSize,
                                        isDataBaseFile: false,
                                        status: 'finished',
                                        response: data.attachmentList[i].response
                                    }
                                ];
                                this.$refs.filesUpload.fileList = this.$refs.filesUpload.fileList.concat(fileList);
                            }
                        }
                    }
                }
                tinymce.execCommand('mceInsertContent', false, data.contentHtml);
            } else {
                // 邮件模板主题覆盖
                if (this.templateForm) {
                    this.templateForm.templateTitle = data.templateTitle;
                }
                // 写信邮件主题 写信弹窗邮件主题覆盖
                if (this.emailForm) {
                    this.emailForm.subject = data.templateTitle;
                }
                // 营销活动主题覆盖 及附件覆盖（营销活动的附件最大限制为6M所以单独处理了下）
                if (this.marketingForm) {
                    this.marketingForm.subject = data.templateTitle;
                    if (data.attachmentList && data.attachmentList.length) {
                        let fileSize = 0;
                        for (let i = 0; i < data.attachmentList.length; i++) {
                            fileSize += data.attachmentList[i].size;
                            if (fileSize >= this.max_size * 1024) {
                                const message = this.$t('mailSetting.emailTemplate.uploadFilesOversizeTip').replace('$filter', `${this.max_size / 1024}M`);
                                this.$Message.warning(message);
                                break;
                            } else {
                                const fileList = [
                                    {
                                        name: data.attachmentList[i].fileName,
                                        url: data.attachmentList[i].filePath,
                                        size: data.attachmentList[i].fileSize,
                                        isDataBaseFile: false,
                                        status: 'finished',
                                        response: data.attachmentList[i].response
                                    }
                                ];
                                this.$refs.filesUpload.fileList = this.$refs.filesUpload.fileList.concat(fileList);
                            }
                        }
                    } else {
                        this.$refs.filesUpload.fileList = [];
                    }
                } else {
                    if (data.attachmentList && data.attachmentList.length) {
                        this.$refs.filesUpload.fileList = data.attachmentList.map(item => {
                            return {
                                name: item.fileName,
                                url: item.filePath,
                                size: item.fileSize,
                                isDataBaseFile: false,
                                status: 'finished',
                                response: item.response
                            };
                        });
                    } else {
                        this.$refs.filesUpload.fileList = [];
                    }
                }
                tinymce.activeEditor.setContent(data.contentHtml);
            }
        }
        /* ---- 插入模板 end ------------------------------------------ */
    },
    computed: {
        translateDisabled() {
            if (this.targetTranslate === this.$t('mail.writeTranslate.chooseLanguage')) {
                return true;
            } else if (!this.requestText.trim()) {
                return true;
            }
        }
    },
    watch: {
        requestText(val) {
            // 获取原文最大字数
            const maxlength = val.length;
            if (maxlength > 4999) {
                this.requestTextTooLong = this.$t('mail.writeTranslate.maxCharacterLength');
                const textDom = document.getElementById('requestInput');
                textDom.style.borderColor = '#f56c6c';
                textDom.style.boxShadow = 'none';
            } else {
                this.requestTextTooLong = '';
                const textDom = document.getElementById('requestInput');
                textDom.style.borderColor = '#4285F2';
                textDom.style.boxShadow = '0 3px 0 0 #4285F2';
            };
        }
    }
};
