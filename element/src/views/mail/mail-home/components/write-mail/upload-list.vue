<template>
  <ul :class="[prefixCls + '-list']">
    <li v-for="file in files" :class="fileCls(file)">
      <Icon :type="format(file)"></Icon> {{ file.name }}
    </li>
  </ul>
</template>
<script>
    const prefixCls = 'ivu-upload';
    export default {
        name: 'UploadList',
        props: {
            files: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                prefixCls: prefixCls
            };
        },
        methods: {
            fileCls(file) {
                return [
                    `${prefixCls}-list-file`,
                    {
                        [`${prefixCls}-list-file-finish`]: file.status === 'finished'
                    }
                ];
            },
            format(file) {
                const format =
                    file.name
                        .split('.')
                        .pop()
                        .toLocaleLowerCase() || '';
                let type = 'document';

                if (['gif', 'jpg', 'jpeg', 'png', 'bmp', 'webp'].indexOf(format) > -1) {
                    type = 'image';
                }
                if (
                    ['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv'].indexOf(format) > -1
                ) {
                    type = 'ios-film';
                }
                if (['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'].indexOf(format) > -1) {
                    type = 'ios-musical-notes';
                }
                if (['doc', 'txt', 'docx', 'pages', 'epub', 'pdf', 'keynote', 'ppt', 'pptx'].indexOf(format) > -1) {
                    type = 'document-text';
                }
                if (['numbers', 'csv', 'xls', 'xlsx'].indexOf(format) > -1) {
                    type = 'stats-bars';
                }
                // if (['keynote', 'ppt', 'pptx'].indexOf(format) > -1) {
                //   type = 'ios-videocam'
                // }
                return type;
            },
            parsePercentage(val) {
                return parseInt(val, 10);
            }
        }
    };
</script>
