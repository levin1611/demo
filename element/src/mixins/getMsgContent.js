export default {
    methods: {
        // 对不同类型的消息类型做处理
        getMessageContent(msgType, msgContent) {
            if (msgType) {
                let msg = null;
                switch (Number(msgType)) {
                    case 1:
                        // 文本

                        return msgContent;
                    case 2:
                        // 图片

                        return this.$t('whatsapp_manage.imageType') + (msgContent ? ` ${msgContent}` : '');
                    case 3:
                        // 文件

                        return msgContent
                            ? (
                                (
                                    msgContent.indexOf('.') !== -1
                                        ? `[.${msgContent.split('.').slice(-1)[0].toLowerCase()}]`
                                        : this.$t('whatsapp_manage.fileType')
                                ) +
                                (
                                    msgContent
                                        ? ` ${msgContent}`
                                        : ''
                                )
                            )
                            : this.$t('whatsapp_manage.fileType');
                    case 4:
                        // 视频

                        return this.$t('whatsapp_manage.videoType') + (msgContent ? ` ${msgContent}` : '');
                    case 5:
                        // 音频

                        return this.$t('whatsapp_manage.audioType') + (msgContent ? ` ${msgContent}` : '');
                    case 6:
                        return  this.$t('whatsapp_manage.cardType');
                    case 9:
                        // 模板消息
                        JSON.parse(msgContent).components.forEach(item => {
                            if (item.type === 'BODY') {
                                msg = item.text;
                            }
                        });

                        return msg;
                    default:
                        // 默认, "不支持的类型"

                        return this.$t('whatsapp_manage.unSupportedType');
                }
            } else {
                return '';
            }
        },
        // 将视频秒数转换为时长
        formatDuration(second) {
            let result = '';
            if (second && Number.isInteger(second)) {
                const hour = Math.floor(second / 3600);
                const elseMinAndSec = Math.floor(second % 3600);
                const min = Math.floor(elseMinAndSec / 60);
                const sec = Math.floor(elseMinAndSec % 60);
                result = `${min > 9 ? min : `0${min}`}:${sec > 9 ? sec : `0${sec}`}`;
                if (hour) {
                    result = `${hour}:${result}`;
                }
            }
            return result;
        }
    }
};

