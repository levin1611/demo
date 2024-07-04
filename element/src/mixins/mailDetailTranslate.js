import util from '@/libs/util';
import Cookies from 'js-cookie'; // 引入cookie
import translateLang from '@/mixins/translateLang';

// 该文件为邮件详情翻译
export default {
    mixins: [translateLang],
    data() {
        return {
            showOriginal: true, // 显示 '显示原文' 四个字
            targetTranslate: '中文', // 翻译框一
            showTranslateContent: false, // 显示邮箱翻译行的阈值
            content: '', // 文本字段
            targetLang: 'zh_CN' // 目标语言
        };
    },
    methods: {
        /** 显示原文 */
        handleRevert() {
            // 关闭 显示翻译 按钮
            this.showOriginal = false;
            this.content = this.mailDetailData ? this.mailDetailData.content : this.mailDetail.content;
            // 调用组件中处理邮件的共通方法
            this.renderCodeToIframe(this.content);
            // this.renderMailHTML(this.mailFrameName, this.content, this.handleIframeHashChange);
        },
        /** 选择目标语言 */
        selectTargetLanguage(item) {
            // 更新显示的内容
            this.targetTranslate = item.label;
            // 更新目标语言
            this.targetLang = item.value;
            // 调用翻译函数
            this.handleTranslate();
        },
        /** 关闭翻译行 */
        closeTranslate() {
            // 关闭邮箱翻译行
            this.showTranslateContent = false;
            this.content = this.mailDetailData.content;
            // 调用组件中处理邮件的共通方法
            this.renderCodeToIframe(this.content);
        },
        /** 显示翻译行 */
        handleTranslateContent() {
            // 如果当前已打开翻译功能,则进行提示
            if (this.showTranslateContent) {
                this.$Message({
                    message: this.$t('mail.writeTranslate.translationTurnedOn'),
                    duration: 1000,
                    type: 'warning'
                });
                return;
            } else {
                this.languageList.forEach(item => {
                    // 先判断是否有缓存,如果有则用缓存中的目标语言,如果没有缓存,则用系统默认的语言作为目标语言
                    // 获取存入cookie中的数据
                    if (Cookies.get('targetLang')) {
                        // 有缓存时,将目标语言改为缓存中的目标语言
                        if (item.value === Cookies.get('targetLang')) {
                            this.targetLang = Cookies.get('targetLang');
                            this.targetTranslate = item.label;
                        };
                        this.targetLang = Cookies.get('targetLang');
                    } else if (item.value === this.targetLang) {
                        // 初始化时目标语言与设置中默认语言一致
                        this.targetLang = item.value;
                        this.targetTranslate = item.label;
                    };
                });
                // 显示翻译行
                this.showTranslateContent = true;
                // 调用翻译功能
                this.handleTranslate();
            };
        },
        /** 翻译 */
        handleTranslate() {
            util.ajaxInternational({
                url: '/translation/translationWithSource',
                method: 'post',
                data: {
                    textType: 'html', // 要翻译的文本
                    requestText: this.content, // 要翻译的文本
                    targetLang: this.targetLang // 目标语言
                }
            }).then(response => {
                // 获取翻译文本 是个字符串
                const content = response.data.data.translations[0].translatedText;
                // 调用组件中处理邮件的共通方法
                this.renderCodeToIframe(content);
                // 在本地cookie中存上次翻译的语言
                Cookies.set('targetLang', this.targetLang);
                // 打开 显示原文 按钮
                this.showOriginal = true;
            });
        }
    }
};
