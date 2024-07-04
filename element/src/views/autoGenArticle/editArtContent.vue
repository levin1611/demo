<template>
    <div class="editArtContent">
        <div class="artContent-container">
            <!-- 左侧内容区 -->
            <div class="artContent-container-left">
                <!-- 文章标题 -->
                <div class="artContent-title">
                    <!-- label -->
                    <div class="editArtContent-label editArtContent-label__required">{{ $t('autoGenArticle.artTitle') }}</div>

                    <!-- input -->
                    <Input v-model="artData.title"
                           :placeholder="$t('autoGenArticle.placeholder_title')"
                           ref="artTitle">
                        <!-- 复制 -->
                        <Tooltip slot="suffix"
                                 :content="$t('chat.copy')"
                                 placement="top">
                            <Icon size="16"
                                  custom="custom-copy-new"
                                  @click="copyText(artData.title)"
                                  class="copyIcon"></Icon>
                        </Tooltip>
                    </Input>
                </div>

                <!-- 文章内容 -->
                <div class="artContent-extend">
                    <!-- label -->
                    <div class="editArtContent-label editArtContent-label__required">{{ $t('autoGenArticle.artContent') }}</div>

                    <!-- 富文本编辑器 -->
                    <Editor :action="action"
                            :currEditor.sync="currEditor"
                            :initHeight="600"
                            ref="editorModule"></Editor>

                    <!-- 复制 -->
                    <Tooltip :content="$t('chat.copy')"
                             placement="top">
                        <Icon custom="custom-copy-new"
                              @click="copyTinymceContent"
                              class="copyIcon appendCopyIcon"></Icon>
                    </Tooltip>
                </div>

                <!-- SEO 信息设置 -->
                <div class="artContent-SEOInfo">
                    <!-- title -->
                    <div class="editArtContent-title">{{ $t('autoGenArticle.seoInfoSet') }}</div>

                    <!-- 标题 -->
                    <div class="artContent-SEOInfo-item">
                        <!-- label -->
                        <div class="editArtContent-label">{{ $t('autoGenArticle.title') }}</div>

                        <!-- input -->
                        <Input v-model="artData.seoTitle"
                               :placeholder="$t('autoGenArticle.placeholder_seoTitle')"
                               ref="seoTitle">
                            <!-- 复制 -->
                            <Tooltip slot="suffix"
                                     :content="$t('chat.copy')"
                                     placement="top">
                                <Icon size="16"
                                      custom="custom-copy-new"
                                      @click="copyText(artData.seoTitle)"
                                      class="copyIcon"></Icon>
                            </Tooltip>
                        </Input>

                        <!-- tip -->
                        <div class="editArtContent-tip">{{ $t('autoGenArticle.tip_seoTitle') }}</div>
                    </div>

                    <!-- 关键词 -->
                    <div class="artContent-SEOInfo-item">
                        <!-- label -->
                        <div class="editArtContent-label">{{ $t('autoGenArticle.keyword') }}</div>

                        <!-- input -->
                        <Input v-model="artData.seoKeyword"
                               :placeholder="$t('autoGenArticle.placeholder_seoKeyword')">
                            <!-- 复制 -->
                            <Tooltip slot="suffix"
                                     :content="$t('chat.copy')"
                                     placement="top">
                                <Icon size="16"
                                      custom="custom-copy-new"
                                      @click="copyText(artData.seoKeyword)"
                                      class="copyIcon"></Icon>
                            </Tooltip>
                        </Input>

                        <!-- tip -->
                        <div class="editArtContent-tip">{{ $t('autoGenArticle.tip_seoKeyword') }}</div>
                    </div>

                    <!-- 描述 -->
                    <div class="artContent-SEOInfo-item">
                        <!-- label -->
                        <div class="editArtContent-label">{{ $t('autoGenArticle.description') }}</div>

                        <!-- input -->
                        <Input v-model="artData.seoDesc"
                               type="textarea"
                               :rows="5"
                               :placeholder="$t('autoGenArticle.placeholder_seoDesc')"
                               ref="seoDesc"></Input>

                        <!-- 复制 -->
                        <Tooltip :content="$t('chat.copy')"
                                 placement="top">
                            <Icon custom="custom-copy-new"
                                  @click="copyText(artData.seoDesc)"
                                  class="copyIcon appendCopyIcon"></Icon>
                        </Tooltip>

                        <!-- tip -->
                        <div style="position: absolute;"
                             class="editArtContent-tip">{{ $t('autoGenArticle.tip_seoDesc') }}</div>
                    </div>
                </div>
            </div>

            <!-- 侧边栏 -->
            <div class="artContent-container-right">
                <!-- 主题展示区域 -->
                <SEOTopic :topic="artData.topic || ''"
                          :sub_topic_id="artData.sub_topic_id || ''"
                          :sub_topic="artData.sub_topic || ''"
                          :topic_id="artData.topic_id || null"
                          ref="seoTopic"
                          class="seo-topic"></SEOTopic>

                <!-- 智能生成内容组件 -->
                <SEOGenContent @insertText="insertText"></SEOGenContent>
            </div>
        </div>
    </div>
</template>

<script>
    import Editor from '@/views/email-marketing/marketing-activities/components/new-marketing/editor.vue';
    import SEOTopic from '@/views/seo-subject/components/seo-gen/SEOTopic.vue';
    import SEOGenContent from '@/views/seo-subject/components/seo-gen/SEOGenContent.vue';
    import util from '@/libs/util';

    export default {
        name: 'editArtContent',
        props: {
            artInfo: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        components: {
            Editor,
            SEOTopic,
            SEOGenContent
        },
        data() {
            return {
                artData: {
                    title: '',
                    content: '',
                    seoTitle: '',
                    seoKeyword: '',
                    seoDesc: '',
                    topic_id: '',
                    sub_topic_id: ''
                },
                action: '',
                currEditor: null
            };
        },
        methods: {
            /* 初始化七牛，获取图片上传token */
            initQiniu() {
                util.oldAjax({
                    url: '/file-sys/api/uptoken',
                    method: 'post'
                }).then(response => {
                    this.action = `//upload.qiniup.com?token=${response.data.uptoken}`;
                });
            },

            /** 插入生成内容到页面 */
            insertText(content, sence) {
                // 根据场景的不同, 回填生成内容到不同的输入框
                switch (sence) {
                    case 'SEO元标题':
                        this.insertContentToInput(content, this.$refs.seoTitle.$refs.input, 'seoTitle');
                        break;
                    case 'SEO元描述':
                        this.insertContentToInput(content, this.$refs.seoDesc.$refs.textarea, 'seoDesc');
                        break;
                    case '博客标题和大纲':
                    case '博客章节精写':
                    default:
                        this.insertContentInTinymce(content);
                        break;
                }
            },
            /** 插入生成内容到相应输入框光标处 */
            insertContentToInput(content, inputEl, attrName) {
                // 获取要插入文本的input元素
                const ethemeInput = inputEl;
                // 获取input元素的值
                const subjectText = this.artData[attrName] || '';
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
                this.artData[attrName] = subjectText.substring(0, startPos) + content + subjectText.substring(endPos);

                // 将光标移至文本末尾
                ethemeInput.focus();
                // 调整选区开始和结束的位置
                ethemeInput.selectionStart = startPos;
                ethemeInput.selectionEnd = startPos;
            },
            /** 将生成的seo插入到富文本 */
            insertContentInTinymce(val) {
                if (this.currEditor && this.currEditor.insertContent) {
                    this.currEditor.insertContent(val);
                }
            },
            // 复制文本
            copyText(text) {
                const copyEl = document.createElement('textarea');
                copyEl.value = text || '';
                document.body.appendChild(copyEl);
                copyEl.select();
                if (document.execCommand('Copy')) {
                    this.$Message.success(this.$t('crm.Modal.success_copy'));
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_copy'));
                }
                document.body.removeChild(copyEl);
            },
            // 复制富文本编辑器内容
            copyTinymceContent() {
                if (this.currEditor && this.currEditor.contentDocument && this.currEditor.contentWindow) {
                    const t_window = this.currEditor.contentWindow;
                    const t_document = this.currEditor.contentDocument;
                    const range = t_document.createRange();
                    t_window.getSelection().removeAllRanges();
                    range.selectNode(t_document.body);
                    t_window.getSelection().addRange(range);
                    if (t_document.execCommand('Copy')) {
                        this.$Message.success(this.$t('crm.Modal.success_copy'));
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_copy'));
                    }
                    t_window.getSelection().removeAllRanges();
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_copy'));
                }
            },

            // 从已有的数据回填到页面
            backFillData(data) {
                // 回填数据
                this.artData.title = data.title;
                this.artData.content = data.content;
                this.artData.seoTitle = data.seo_title;
                this.artData.seoKeyword = data.seo_keyword;
                this.artData.seoDesc = data.seo_description;
                // 状态为 待发布/已发布 时, 关联的主题/子主题, 需要回填显示
                if (['3', '4'].includes(data.status)) {
                    if (`${data.topic_id}` !== '-1') {
                        this.artData.topic_id = Number(data.topic_id);
                        if (`${data.sub_topic_id}` !== '-1') {
                            this.artData.sub_topic_id = Number(data.sub_topic_id);
                        }
                    }
                }
            },

            // 一键去重
            removeRepeatKeyword(val) {
                // 先去掉逗号前后的空白(空格, 换行, 制表符等), 再以逗号分割字符串为数组
                const keywordArr = val.replace(/\s*,\s*/g, ',').split(',');
                return [...new Set(keywordArr)];
            },
            // 校验数据 --- 给外部组件调用
            validateData() {
                // 获取富文本编辑器内容
                this.artData.content = this.currEditor.getContent();
                // 校验必填项
                // 文章标题不能为空
                if (!this.artData.title || !this.artData.title.trim()) {
                    this.$Message.error(this.$t('autoGenArticle.error_emptyArtTitle'));
                    return false;
                }
                // 文章内容不能为空
                if (!this.artData.content || !this.artData.content.trim()) {
                    this.$Message.error(this.$t('autoGenArticle.error_emptyArtContent'));
                    return false;
                }

                return true;
            },
            // 提取所有数据 --- 给外部组件调用
            getContent() {
                // 获取富文本编辑器内容
                this.artData.content = this.currEditor.getContent();
                this.artData.seoKeyword = this.removeRepeatKeyword(this.artData.seoKeyword).join(',');
                // 获取 seo 主题选择内容
                if (this.$refs.seoTopic) {
                    this.artData.topic_id = this.$refs.seoTopic.topicId;
                    this.artData.sub_topic_id = this.$refs.seoTopic.topicChildVal;
                }

                // 回传结果数据
                return this.artData;
            }
        },
        mounted() {
            this.initQiniu();
        },
        watch: {
            artInfo: {
                handler(val) {
                    if (val && val.id) {
                        this.backFillData(this.artInfo);
                    }
                },
                immediate: true
            },
            currEditor: {
                handler(val, oldVal) {
                    if (val && !oldVal) {
                        // 回填内容到富文本编辑器
                        if (this.artData.content) {
                            // 使用 setContent 方法, 避免因使用 insertContent 导致光标位置, 滚动条, 显示到末尾
                            this.currEditor.setContent(this.artData.content);

                            // 回填内容后, 调整光标位置到末尾, 避免智能物料生成内容插入到光标顶部(setContent 缘故)
                            setTimeout(() => {
                                this.currEditor.selection.select(this.currEditor.getBody(), true);
                                this.currEditor.selection.collapse(false);
                            }, 0);
                        }
                    }
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .editArtContent {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.8);
        letter-spacing: 0;
        line-height: 18px;
        padding-top: 2px;

        &-title {
            color: #333;
            font-size: 14px;
            font-weight: 600;
            line-height: 22px;
            margin-bottom: 12px;
        }

        &-label {
            font-size: 14px;
            color: rgba(0, 0, 0, 0.8);
            margin-bottom: 12px;
        }

        &-label__required {
            &::before {
                content: '*';
                color: #F56C6C;
                margin-right: 4px;
            }
        }

        &-tip {
            color: #666;
            font-size: 12px;
            font-weight: 400;
            line-height: 18px;
            margin-top: 8px;
        }
    }

    .artContent-container {
        display: flex;
        padding-bottom: 60px;

        &-right {
            flex: 1;
            margin: 0 20px;

            /deep/ .suggest-box {
                border: none;

                .topic-item:first-child {
                    .topic-item-title {
                        margin-top: 0;
                    }
                }
            }
        }
    }

    .artContent-title {
        width: 840px;
        margin-bottom: 20px;
    }

    .artContent-extend {
        position: relative;
        width: 840px;
        margin-bottom: 20px;

        /deep/ .el-textarea .el-textarea__inner {
            height: 130px;
            resize: none;
        }

        .appendCopyIcon {
            position: absolute;
            right: 18px;
            bottom: 12px;
            height: 32px;
            font-size: 16px;
        }
    }

    .artContent-SEOInfo-item {
        position: relative;
        margin-bottom: 20px;
    }

    .seo-topic {
        margin-bottom: 20px;
    }

    .copyIcon {
        cursor: pointer;
        color: #A9B9C9;
        line-height: 32px;
    }

    .appendCopyIcon {
        position: absolute;
        right: 10px;
        bottom: 0;
        height: 32px;
        font-size: 16px;
    }
</style>
