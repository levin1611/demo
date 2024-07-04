<template>
    <div>
        <Modal :visible="visible"
               :title="$t('crm.Modal.module_followUp')"
               :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :append-to-body="true"
               width="56%"
               v-loading="loading"
               class="modal">
            <div class="timeline-item">
                <div class="item-header clearfloat">
                    <div class="item-title">{{ $t('timeLine.followUpRecords') }}</div>
                    <div class="block-line"></div>
                    <!-- "eventAction": "1"( 1公司 2联系人3询盘)  -->
                    <template v-if="data.followup_belong_id">
                        <div class="header-source" @click="jumpToOrigin">
                            <template v-if="followupData.target_type === 1">{{ $t('followupReply.fromCustomer') }} {{followupData.seq_number}}</template>
                            <template v-else-if="followupData.target_type === 2">{{ $t('followupReply.fromContacts') }} {{followupData.seq_number}}</template>
                            <template v-else-if="followupData.target_type === 3">{{ $t('followupReply.fromInquiry') }} {{followupData.seq_number}}</template>
                        </div>
                    </template>
                    <div class="item-time">
                        {{ followupData.fullname }}
                        {{ $t('crm.Html.followUpTime') }}：{{ followupData.followup_time | timeFormat('DateTime') }}
                        {{ $t('crm.Html.createTime') }}：{{ followupData.create_time | timeFormat('DateTime') }}
                    </div>
                </div>
                <div class="item-body">
                    <pre>{{ followupData.followup_content }}</pre>
                    <div v-if="followupData.attachment && followupData.attachment.length" class="time-line-followUp-pictures">
                        <template v-for="(img,i) in followupData.attachment">
                             <div v-if="img" class="demo-upload-list"
                                :key="i">
                                <img :src="img" @click="imgPreview">
                             </div>
                        </template>
                    </div>
                    <div v-if="followupData.pictures && followupData.pictures.length" class="time-line-followUp-pictures">
                        <template v-for="(img,i) in followupData.pictures">
                             <div v-if="img"
                                :key="i"
                                @click="showFilePreview(img)"
                                class="file-list-box">
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
                    <FollowupReply v-if="show_comments"
                                   :replyObj="replyObj"
                                   :disabled="followupData.unclaimed_status === 1"
                                   :currentId="data.id"
                                   :belongId="data.followup_belong_id"
                                   :followup_belong_type="data.followup_belong_type"
                                   :postType="1"
                                   :originalType="data.originalType"
                                   :open="show_comments"
                                   @update_reply="updateReply"></FollowupReply>
                </div>
            </div>

            <div slot="footer">
                <Button @click="cancel">{{ $t('crm.Modal.modal_close') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util.js';
    import Utils from '@/utils/index';
    import { mapState, mapGetters } from 'vuex';
    import FollowupReply from '@/views/main-components/timeline/Components/followupReply';

    export default {
        name: 'followupModal',
        components: {
            FollowupReply
        },
        props: [
            'visible',
            'data'
        ],
        data() {
            return {
                loading: true,

                followupData: {},
                replyObj: {},
                show_comments: false
            };
        },
        computed: {
            // 从 vuex 中获取属性
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                allUsers: state => state.crm.allUsers // 全部用户
            }),
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ])
        },
        methods: {
            // 请求跟进记录内容
            getFollowupDetail() {
                this.loading = true;
                this.followupData = {};
                util.ajax({
                    url: '/crm/followup/getFollowupById',
                    method: 'get',
                    params: {
                        followupId: this.data.postId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        // 格式化请求到的跟进记录详情数据
                        let pictures = [];
                        const resData = [];
                        if (res.data.data && res.data.data.pictures) {
                            try {
                                pictures = JSON.parse(res.data.data.pictures);
                            } catch (e) {
                                pictures = res.data.data.pictures.split(',');
                            }
                        }
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
                        res.data.data.pictures = resData;
                        res.data.data.attachment = res.data.data.attachment ? JSON.parse(res.data.data.attachment) : [];
                        res.data.data.fullname = this.getFullName(res.data.data.create_user_id);
                        this.followupData = res.data.data;

                        this.replyObj = {
                            // 查看已存在的评论和评论对话框
                            visible: false,
                            // input 内容
                            content: '',
                            // 存放要回复的评论的 id , 为 0 时表示回复跟进记录
                            parentId: 0,
                            // 存放要回复的评论的人的 fullName
                            parent_commentatorName: undefined,
                            // 存放要回复的评论的人的 id , 初始值为跟进记录填写者的 id (跟 parentId 初始值为 0 同理)
                            parent_commentatorId: this.followupData.create_user_id,
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
                            postId: this.followupData.id,
                            postContent: this.followupData.followup_content,
                            postCreatorId: this.followupData.create_user_id,
                            postCreatorName: this.followupData.fullname
                        };
                        this.$nextTick(() => {
                            this.show_comments = true;
                        });
                    } else {
                        this.$Message.error(this.$t('message.error_getFollowUpDetail'));
                    }
                    this.loading = false;
                });
            },
            // 获取用户名称
            getFullName(userId) {
                const arr = this.allUsers.filter(item => {
                    return userId == item.id;
                });
                return arr.length > 0 ? arr[0].fullname : '';
            },
            // 更新 replyObj
            updateReply(data) {
                this.replyObj = Object.assign({}, data);
            },
            // 查看图片
            imgPreview(e) {
                this.$store.dispatch('showFullscreenImg', {
                    src: e
                });
            },

            cancel() {
                this.$emit('update:visible', false);
            },

            // 跳转到跟进记录所属对象
            jumpToOrigin() {
                if (this.data && this.data.followup_belong_type) {
                    switch (`${this.data.followup_belong_type}`) {
                        case '1':
                            if (this.data.followup_belong_id) {
                                this.viewCompany(this.data.followup_belong_id);
                            } else {
                                this.$Message.error(this.$t('message.error_getFollowUpBelongCompanyId'));
                            }
                            break;
                        case '2':
                            if (this.data.followup_belong_id) {
                                this.viewContact(this.data.followup_belong_id);
                            } else {
                                this.$Message.error(this.$t('message.error_getFollowUpBelongContactId'));
                            }
                            break;
                        case '3':
                            if (this.data.followup_belong_id) {
                                this.viewInquiry(this.data.followup_belong_id);
                            } else {
                                this.$Message.error(this.$t('message.error_getFollowUpBelongInquiryId'));
                            }
                            break;
                        default:
                            this.$Message.error(this.$t('message.error_getFollowUpBelongType'));
                    }
                } else {
                    this.$Message.error(this.$t('message.error_getFollowUpBelongType'));
                }
            },
            // 跳到公司
            viewCompany(id) {
                if (!this.isContainsMenu('myCustomer')) {
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                } else {
                    if (id) {
                        this.$viewCustomer(id);
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_companyId'));
                    }
                }
            },
            // 跳到询盘
            async viewInquiry(id) {
                if (!this.isContainsMenu('myInquiry')) {
                    this.$Message.error(this.$t('crm.WorkBench.error_haveNoPermissionMyInquiry'));
                    return;
                }
                /**
                 * @Description: 点击预提醒通知时需要先请求接口判断该询盘当前的状态是否是公海，是跳转到公海管理，否跳转到询盘管理
                 * @author mayuanzhi
                 * @date 2020/6/13
                */
                const data = await this.$store.dispatch('judgmentInquiry', id);
                if (data.code === '1') {
                    localStorage.setItem('leadsCloud-inquiryId', id);
                    if (data.data && data.data.unclaimedStatus === 1) {
                        if (this.followupData.company_id) {
                            this.$viewHighSeasCustomer(this.followupData.company_id);
                        } else {
                            this.$Message.error(this.$t('crm.WorkBench.error_companyId'));
                        }
                    } else {
                        window.open(this.$router.resolve({
                            name: 'myInquiry'
                        }).href, '_blank');
                    }
                }
            },
            // 新窗口跳转到联系人
            async viewContact(id) {
                // 无"我的联系人"页面权限, 退出流程
                if (!this.isContainsMenu('myContact')) {
                    this.$Message.warning(this.$t('crm.newDetail.error_noContactsMenuAuthority'));
                    return;
                }

                // 无 contactsId , 退出流程
                if (!id) {
                    this.$Message.warning(this.$t('crm.Modal.error_noneUserInfo'));
                    return false;
                }

                // 查询该联系人 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Contact',
                    id
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 如果是公海联系人
                if (authorized === 'highseas') {
                    if (this.isContainsMenu('highseasCustomer')) {
                        // 如果有公海目录权限
                        this.$viewHighSeasCustomer(this.followupData.company_id);
                        return;
                    } else {
                        // 没有"公海客户"页面权限, 弹出提示
                        this.$Message.warning(this.$t('globalSearch.haveNoPermissionHighseasCustomer'));
                        return;
                    }
                }

                // 新窗口打开联系人详情页
                localStorage.setItem('leadsCloud-contactId', id);
                window.open(this.$router.resolve({
                    name: 'myContact'
                }).href, '_blank');
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
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        this.getFollowupDetail();
                    }
                },
                immediate: true
            }
        }
    };
</script>

