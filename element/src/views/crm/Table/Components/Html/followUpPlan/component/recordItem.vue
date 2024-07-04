<template>
    <!-- 时间轴条目 -->
    <div class="timeline-item">
        <div class="item-header clearfloat">
            <div class="item-title">{{ $t('timeLine.followUpRecords') }}</div>
            <div class="block-line"></div>
            <div style="margin: 0 8px;display: inline-block;float: left;">{{ item.followupType_formatted }}</div>
            <div class="item-time">
                <span>
                    {{ $t('timeLine.followUpOnTime') }}{{ item.followupTime | timeFormat('DateTime') }}
                </span>
            </div>
        </div>
        <div v-if="item" style="color: rgba(0, 0, 0, 0.6);">
            <span>
                {{ $t('crm.followUpRecord.associatedCustomers') }} {{ item.companyName }}
            </span>
        </div>
        <div v-if="item" style="color: rgba(0, 0, 0, 0.6);">
            <span>
                {{ item.createUser }}
                {{ item.createTime | timeFormat('DateTime') }}
            </span>
        </div>
        <div class="item-body">
            <span style="white-space: pre-wrap">{{ item.followupContent }}</span>
            <div v-if="Array.isArray(item.attachment) && item.attachment.length"
                 style="margin: 15px 0 0;">
                <template v-for="(img, i) in item.attachment">
                    <div :key="i"
                        v-if="img"
                        :data-img="img"
                        class="demo-upload-list">
                        <img :src="img" @click="imgPreview">
                    </div>
                </template>
            </div>
            <div v-if="Array.isArray(item.pictures) && item.pictures.length > 0" class="time-line-followUp-pictures">
                <template v-for="(img, i) in item.pictures">
                    <div :key="i"
                        v-if="img"
                        class="file-list-box"
                        @click="showFilePreview(img)">
                        <Icon :class="format(img.type)" size="24" style="color: #677f99;"></Icon>
                        <div class="file-box">
                            <Tooltip :content="img.name ? img.name : $t('material.cloudPush.image')"
                                placement="top">
                                <p class="file-com">
                                    <span class="file-name">{{img.name ? img.name.substring(0,img.name.lastIndexOf('.')) : $t('material.cloudPush.image')}}</span>
                                    <span class="file-type" v-if="img.name">.{{img.type}}</span>
                                </p>
                            </Tooltip>
                            <p>{{sizeFilter(img.size)}}</p>
                        </div>
                    </div>
                </template>
            </div>
            <div class="followup_address" v-if="item.site">
                <Icon custom="custom custom-icon_location"
                    size="12"
                    color="#A9B9C9"></Icon>
                    {{$t('crm.followUpRecord.address')}}：
                    {{item.site}}
            </div>
            <div>
                <!-- <div v-if="item.followup.status && !disabled && !['clue', 'highseasClue'].includes(originalType) && item.followup.create_user_id + '' === userId + ''" -->
                <div v-if="item.status"
                    style="display: inline-block; margin-left: 12px;float: right"
                     class="followup-edit">
                    <a @click="$emit('editFollowup', item)" style="color: #4285f4;">{{ $t('edit') }}</a>
                </div>
                <span style="clear: both;"></span>
                <!-- 此处 v-if 是为了防止某个跟进记录请求失败, 这种情况下 reply[item.id] 为 undefined -->
                <!-- 评论 :公海管理进入不能回复评论 -->
                <template v-if="reply[item.id]">
                    <FollowupReply :replyObj="reply[item.id]"
                                   :belongId="belongId"
                                   :disabled="disabled"
                                   :type="type"
                                   :postType="1"
                                   :originalType="originalType"
                                   @update_reply="update_reply"></FollowupReply>
                </template>
                <span style="clear: both;"></span>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import i18n from '@/locale';
    import FollowupReply from '@/views/main-components/timeline/Components/followupReply';

    export default {
        name: 'recordItem',
        components: {
            FollowupReply
        },
        props: {
            item: {
                type: Object,
                default() {
                    return {};
                }
            },
            disabled: {
                type: Boolean,
                default: false
            },
            type: {
                type: String,
                default: ''
            },
            originalType: {
                type: String,
                default: ''
            },
            belongId: {
                type: [String, Number]
            },
            reply: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        filters: {
            filterName(value) {
                return value || i18n.t('timeLine.unknown');
            }
        },
        computed: {
            ...mapState({
                userId: 'userId'
            })
        },
        methods: {
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            },
            // 更新 reply 对象
            update_reply(data) {
                this.$set(this.reply, this.item.id, data);
            },
            // 使用filePreview组件预览文件
            showFilePreview(data) {
                // 预览组件
                this.$store.commit('showFilePreview', true);
                // 将文件列表存到vuex
                this.$store.commit('firstFileId', null);
                // 将parentId到vuex
                this.$store.commit('setFollowUpFile', data);
            },
            // 按照不同文件类型显示不同图标
            format(format) {
                let type = 'document';

                if (['jpg', 'jpeg', 'png', 'bmp', 'webp', 'gif', 'ico', 'psd'].indexOf(format) > -1) {
                    type = 'custom custom-image';
                } else if (['mp4', 'm3u8', 'rmvb', 'avi', 'swf', '3gp', 'mkv', 'flv', 'mpg', 'mov', 'wmv', 'rm'].indexOf(format) > -1) {
                    type = 'custom custom-video';
                } else if (['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'].indexOf(format) > -1) {
                    type = 'custom custom-audio';
                } else if (['doc', 'docx'].indexOf(format) > -1) {
                    type = 'custom custom-word';
                } else if (['txt'].indexOf(format) > -1) {
                    type = 'custom custom-txt';
                } else if (['pdf'].indexOf(format) > -1) {
                    type = 'custom custom-pdf';
                } else if (['xls', 'xlsx'].indexOf(format) > -1) {
                    type = 'custom custom-excel';
                } else if (['ppt', 'pptx'].indexOf(format) > -1) {
                    type = 'custom custom-ppt';
                } else if (['epub', 'zip', 'rar'].indexOf(format) > -1) {
                    type = 'custom custom-zip';
                } else {
                    type = 'custom custom-unknown-file-format';
                }
                return type;
            },
            // 文件大小过滤器，filters 中的this不能指向vue,只能写了个方法，或者本域内定义that = this;
            sizeFilter(bytes) {
                if (Number(bytes) === -1) return this.$t('messageReport.unknown');
                const byte = parseInt(bytes);
                if (byte === 0) {
                    return '0 B';
                }
                const k = 1024;
                const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
                const i = Math.floor(Math.log(byte) / Math.log(k));
                return `${(byte / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
            }
        }
    };
</script>
