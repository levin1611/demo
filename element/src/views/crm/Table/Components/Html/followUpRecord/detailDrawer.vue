<template>
    <Drawer :visible="visible"
            size="75%"
            :modal="false"
            :append-to-body="true"
            :with-header="false"
            class="drawer-show-main-header drawer-close-button-moveUp">
        <!-- 自定义关闭按钮 -->
        <a @click="visibleChange(false)"
           class="drawer-close-button">
            <Icon custom="custom-drawer-detail-close"></Icon>
        </a>
        <div style="padding:20px 24px; overflow-y: auto;" v-if="detail">
            <div class="follow_detail">
                <div class="follow_detail_header">
                        <!-- 图标 -->
                    <Icon custom="custom custom-icon_follow fl"
                        size="36"
                        color="#3D9BF6"></Icon>
                    <span class="title fl">{{$t('timeLine.followUpRecords')}}</span>
                    <span class="block-line"></span>
                    <span class="followup_type">{{format_followupType(detail.followup_type)}}</span>
                    <div class="followup_time">{{$t('crm.Html.followUpTime')}}：{{detail.followup_time | timeFormat('DateTime')}}</div>
                </div>
                <p class="create_time">{{detail.create_user}} {{detail.create_time | timeFormat('DateTime')}}</p>
                <div class="followup_content">{{detail.followup_content}}</div>
                <div v-if="Array.isArray(detail.attachment) && detail.attachment.length" class="time-line-followUp-pictures">
                    <template v-for="(img, i) in detail.attachment">
                        <div :key="i"
                            v-if="img"
                            :data-img="img"
                            class="demo-upload-list">
                            <img :src="img" @click="imgPreview">
                        </div>
                    </template>
                </div>
                <div v-if="Array.isArray(detail.pictures) && detail.pictures.length" class="time-line-followUp-pictures">
                    <template v-for="(img, i) in detail.pictures">
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
                <div class="followup_address" v-if="detail.site">
                   <Icon custom="custom custom-icon_location"
                        size="12"
                        color="#A9B9C9"></Icon>
                        {{$t('crm.followUpRecord.address')}}：
                        {{detail.site}}
                </div>
                <div class="followup_handle">
                    <div v-if="detail.status"
                        style="margin-left: 12px;float: right"
                        class="followup-edit">
                        <a @click="$emit('editFollowup', detail)"
                        style="color: #4285f4; font-size:12px">{{ $t('edit') }}</a>
                    </div>
                    <span style="clear: both;"></span>
                    <template v-if="reply">
                        <FollowupReply :replyObj="reply"
                            :open="true"
                            :belongId="detail.target_id"
                            :type="'customer'"
                            :postType="1"
                            :originalType="'customer'"
                            @update_reply="update_reply"></FollowupReply>
                    </template>
                </div>
            </div>
        </div>
    </Drawer>
</template>

<script>
    import { mapState } from 'vuex';
    import Utils from '@/utils/index';
    import FollowupReply from '@/views/main-components/timeline/Components/followupReply';
    import { crmFollowupRecord } from '@/api/crm/index';

    export default {
        name: 'detailDrawer',
        components: {
            FollowupReply
        },
        props: [
            'visible',
            'detailId',
            'change_flag_new_followUp'
        ],
        computed: {
            ...mapState({
                userId: 'userId',
                followupTypes: state => state.crm.followUpType
            })
        },
        data() {
            return {
                detail: null,
                reply: null,
                flag_new_followUp: true
            };
        },
        methods: {
            // 获取详情
            getDetail() {
                crmFollowupRecord.getFollowupById({ followupId: this.detailId }).then(res => {
                    if (res.code === '1') {
                        const data = res.data;
                        let pictures = [];
                        const resData = [];
                        if (data.pictures) {
                            pictures = JSON.parse(data.pictures);
                            if (pictures && pictures.length) {
                                pictures.forEach(item => {
                                    let obj = {};
                                    if (item.indexOf('?') > 0) {
                                        obj = {
                                            url: item.substring(0, item.indexOf('?')),
                                            name: Utils.getQueryVariable(item, 'name'),
                                            size: Utils.getQueryVariable(item, 'size'),
                                            type: Utils.getQueryVariable(item, 'type')
                                        };
                                    } else {
                                        obj = {
                                            url: item.substring(0, item.indexOf('?')),
                                            size: 0,
                                            name: this.$t('messageReport.unknown'),
                                            type: 'image'
                                        };
                                    }
                                    resData.push(obj);
                                });
                            }
                        }
                        data.pictures = resData;
                        data.attachment = data.attachment ? JSON.parse(data.attachment) : [];
                        this.detail = data;
                        this.reply = {
                            visible: false,
                            // input 内容
                            content: '',
                            // 存放要回复的评论的 id , 为 0 时表示回复跟进记录
                            parentId: 0,
                            // 存放要回复的评论的人的 fullName
                            parent_commentatorName: undefined,
                            // 存放要回复的评论的人的 id , 初始值为跟进记录填写者的 id (跟 parentId 初始值为 0 同理)
                            parent_commentatorId: data.create_user_id,
                            // 保存中 loading
                            loading_saving: false,
                            // 已存在的评论
                            comments: [],
                            // 已存在的评论数
                            count_comments: 0,
                            // 请求中 loading
                            loading_requesting: false,
                            // 定义最后光标对象
                            lastEditRange: undefined,

                            // 跟进记录部分内容
                            postType: 1,
                            postId: data.id,
                            postContent: data.followup_content,
                            postCreatorId: data.create_user_id,
                            postCreatorName: data.create_user
                        };
                    }
                });
            },
            visibleChange(val) {
                this.$emit('update:visible', val);
            },
            // 获取跟进记录类型对应的文字
            format_followupType(val) {
                const temp = this.followupTypes.find(item => Number(item.value) === Number(val));
                return temp ? temp.label : val;
            },
            // 更新 reply 对象
            update_reply(data) {
                this.reply = data;
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
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
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
        },
        mounted() {
        },
        beforeDestroy() {
        },
        watch: {
            detailId: {
                handler(val) {
                    this.detail = null;
                    if (val) {
                        this.getDetail();
                    } else {
                        this.$emit('update:visible', false);
                    }
                },
                immediate: true
            },
            change_flag_new_followUp: {
                handler(val) {
                    this.detail = null;
                    this.getDetail();
                }
            }

        }
    };
</script>
<style lang="less" scoped>
    .follow_detail_header{
        width: 100%;
        overflow: hidden;
        .title{
            padding: 0 8px 0 20px;
            font-size: 18px;
            line-height: 36px;
            color: rgba(0, 0, 0, 0.8);
        }
        .followup_type {
            padding: 0 8px;
            font-size: 16px;
            line-height: 36px;
            color: rgba(0, 0, 0, 0.8);
        }
        .block-line{
            margin-top: 12px;
        }
        .fl{
            float: left;
        }
        .followup_time{
            font-size: 12px;
            line-height: 36px;
            color: rgba(0, 0, 0, 0.6);
            float: right;
        }
    }
    .create_time{
        margin: 16px 0 8px;
        font-size: 12px;
        line-height: 18px;
        color: rgba(0, 0, 0, 0.6);
    }
    .followup_content{
        margin-bottom: 10px;
        font-size: 14px;
        line-height: 22px;
        color: rgba(0, 0, 0, 0.8);
        white-space: break-spaces;
    }
    .followup_address{
        font-size: 12px;
        line-height: 18px;
        color: rgba(0, 0, 0, 0.6);
    }
    .time-line-followUp-pictures {
        margin: 15px 0 0;
        width: 100%;
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
        .file-list-box {
            width: 100%;
            display: flex;
            flex-wrap: nowrap;
            justify-content: flex-start;
            flex-shrink: 0;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            width: 170px;
            padding: 0 10px;
            height: 40px;
            text-align: center;
            vertical-align: middle;
            border: 1px solid transparent;
            border-radius: 4px;
            //overflow: hidden;
            background: #F5F6F9;
            position: relative;
            // box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
            margin-right: 8px;
            margin-bottom: 8px;
            .file-box {
                width: calc(100% - 32px);
                font-size: 12px;
            }
            i {
                margin-right: 8px;
            }
            p {
                text-align: left;
                line-height: 16px;
            }
            .file-com{
                display: flex;
                justify-content: flex-start;
                .file-name {
                    display: block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .file-type {
                    white-space: nowrap;
                }
            }
        }
    }
    .followup_handle {
        font-size: 12px;
    }
</style>

