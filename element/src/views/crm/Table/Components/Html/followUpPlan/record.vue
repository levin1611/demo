<template>
    <div class="followUpPlan-component" v-loading="isLoading">
        <Timeline v-show="lineList.length"
                  v-infinite-scroll="loadMore"
                  :infinite-scroll-immediate="false"
                  :infinite-scroll-disabled="noMore"
                  :infinite-scroll-distance="10"
                  class="completeTimeLine__timeline">
                <TimelineItem v-for="(item) in lineList" :key="item.id">
                    <div slot="dot" class="timeline-dot">
                        <img src="@/styles/customFont/svg/followUp.svg" />
                    </div>
                    <recordItem :item="item"
                        :disabled="disabled"
                        type="followUpPlan"
                        originalType="followUpPlan"
                        :belongId="item.targetId"
                        :reply="reply"
                        v-on="$listeners"></recordItem>
                </TimelineItem>
                <!-- 提示: 没有更多 -->
            <p v-if="noMore"
               class="timeline-no-more-tip">{{ $t('noticeWindow.noMore') }}</p>
        </Timeline>
        <div class="noDataList" v-if="!isLoading && lineList.length === 0">
            <img :src="require('@/assets/images/nodata.png')" alt="">
            <p>{{$t('crm.Table.noData')}}</p>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import Utils from '@/utils/index';
    import recordItem from './component/recordItem';
    import { crmFollowupPlan } from '@/api/crm/index';

    export default {
        name: 'record',
        components: {
            recordItem
        },
        props: [
            'planId',
            'change_flag_new_followUp'
        ],
        computed: {
            ...mapState({
                orgId: 'enterpriseId',
                userId: 'userId',
                followupTypes: state => state.crm.followUpType,
                allUsers: state => state.crm.allUsers // 全部用户
            })
        },
        data() {
            return {
                noMore: false,
                isLoading: true,
                lineList: [],
                reply: {},
                pageNo: 1
            };
        },
        methods: {
            // 滚动加载更多
            loadMore() {
                // 正在加载中就先不请求接口了
                if (!this.isLoading) {
                    this.pageNo++;
                    this.getFollowupRecord();
                }
            },
            // 获取跟进记录
            getFollowupRecord() {
                this.isLoading = true;
                crmFollowupPlan.planDetailRecord({
                    orgId: this.orgId,
                    createUserId: this.userId,
                    id: this.planId,
                    pageSize: 10,
                    pageNo: this.pageNo
                }).then(res => {
                    if (res.code === '1' && res.data) {
                        const list = res.data.list || [];
                        const totlePage = Math.ceil(res.data.count / 10);
                        if (this.pageNo === totlePage) {
                            this.noMore = true;
                        }
                        list.forEach((item, index) => {
                            // 跟进记录可上传文件，做相应拆分
                            let pictures = [];
                            const resData = [];
                            if (item.pictures) {
                                pictures = JSON.parse(item.pictures);
                                if (pictures && pictures.length) {
                                    pictures.forEach(items => {
                                        let obj = {};
                                        if (items.indexOf('?') > 0) {
                                            obj = {
                                                url: items.substring(0, items.indexOf('?')),
                                                name: Utils.getQueryVariable(items, 'name'),
                                                size: Utils.getQueryVariable(items, 'size'),
                                                type: Utils.getQueryVariable(items, 'type')
                                            };
                                        } else {
                                            obj = {
                                                url: items.substring(0, items.indexOf('?')),
                                                size: 0,
                                                name: this.$t('messageReport.unknown'),
                                                type: 'image'
                                            };
                                        }
                                        resData.push(obj);
                                    });
                                }
                            }
                            item.pictures = resData;
                            item.attachment = item.attachment ? JSON.parse(item.attachment) : [];
                            item.eventCustomVar = item.eventCustomVar ? JSON.parse(item.eventCustomVar) : {};
                            item.fullname = this.getFullName(item.createUserId);
                            item.followupType_formatted = this.format_followupType(item.followupType);
                            this.$set(this.reply, item.id, {
                                // 查看已存在的评论和评论对话框
                                visible: false,
                                // input 内容
                                content: '',
                                // 存放要回复的评论的 id , 为 0 时表示回复跟进记录
                                parentId: 0,
                                // 存放要回复的评论的人的 fullName
                                parent_commentatorName: undefined,
                                // 存放要回复的评论的人的 id , 初始值为跟进记录填写者的 id (跟 parentId 初始值为 0 同理)
                                parent_commentatorId: item.createUserId,
                                // 保存中 loading
                                loading_saving: false,
                                // 已存在的评论
                                comments: [],
                                // 已存在的评论数
                                count_comments: item.postCount || 0,
                                // 请求中 loading
                                loading_requesting: false,
                                // 定义最后光标对象
                                lastEditRange: undefined,

                                // 跟进记录部分内容
                                postType: 1,
                                postId: item.id,
                                postContent: item.followupContent,
                                postCreatorId: item.createUserId,
                                postCreatorName: item.fullname
                            });
                        });
                        this.lineList = this.lineList.concat(list);
                    } else {
                        this.lineList = [];
                    }
                    this.isLoading = false;
                });
            },
            // 获取跟进记录 createUserId 对应的 fullname
            getFullName(userId) {
                const arr = this.allUsers.filter(item => {
                    return userId == item.id;
                });
                if (arr.length > 0) {
                    return arr[0].fullname;
                } else {
                    return '';
                }
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
        created() {
            this.getFollowupRecord();
        },
        mounted() {
        },
        beforeDestroy() {
        },
        watch: {
            change_flag_new_followUp: {
                handler(val) {
                    this.noMore = false;
                    this.lineList = [];
                    this.pageNo = 1;
                    this.getFollowupRecord();
                }
            }
        }
    };
</script>

<style>

</style>
