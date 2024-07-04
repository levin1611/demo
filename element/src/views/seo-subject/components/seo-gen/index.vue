<template>
    <div class="add_page">
        <div class="mainWrap">
            <!-- 左侧内容区 -->
            <div>
                <!-- 标题 -->
                <Row>
                    <div class="add_page_title">
                        <Card class="box-card">
                            <div class="add_page-title">{{ $t('seo.genContent.title') }}</div>
                            <Input v-model="productData.title"
                                   id="add_page_title"
                                   :placeholder="$t('seo.genContent.placeholder_content')"
                                   ref="title"
                                   @mouseup.native="onIputSelect('title', 'add_page_title', $event)"
                                   >
                                <!-- 复制 -->
                                <Tooltip slot="suffix"
                                         :content="$t('chat.copy')"
                                         placement="top">
                                    <Icon size="16"
                                          class="el-input__icon custom custom-copy-new copyIcon"
                                          @click="copyContent('add_page_title')"></Icon>
                                </Tooltip>
                            </Input>
                        </Card>
                    </div>
                </Row>

                <!-- 内容简介 -->
                <Row class="add_page_function">
                    <Card class="box-card">
                        <div class="add_page-title">{{ $t('seo.genContent.description') }}</div>
                        <Input v-model="productData.description"
                               type="textarea"
                               :rows="2"
                               :placeholder="$t('seo.genContent.placeholder_desc')"
                               id="add_page_content"
                               ref="description"
                               @mouseup.native="onIputSelect('description', 'add_page_content', $event)"></Input>
                        <!-- 复制 -->
                        <Tooltip :content="$t('chat.copy')"
                                 placement="top">
                            <Icon class="el-input__icon custom custom-copy-new copyIcon appendCopyIcon"
                                  @click="copyContent('add_page_content')"></Icon>
                        </Tooltip>
                    </Card>
                </Row>
                <!-- 富文本 -->
                <Row class="add_page_extend">
                    <Card class="box-card">
                        <!-- label -->
                        <div slot="header"
                             class="clearfix form_card_header">
                            <span>{{ $t('seo.genContent.content') }}</span>
                        </div>

                        <!-- 富文本编辑器 -->
                        <Editor :action="action"
                                :currEditor.sync="currEditor"
                                ref="editorModule"></Editor>

                        <!-- 复制 -->
                        <Tooltip :content="$t('chat.copy')"
                                 placement="top">
                            <Icon class="el-input__icon custom custom-copy-new copyIcon appendCopyIcon"
                                  @click="copyContent('tinymce')"></Icon>
                        </Tooltip>
                    </Card>
                </Row>
            </div>

            <!-- 侧边栏 -->
            <div id="mainslide" style="margin-top: 30px;margin-left:20px;margin-right:20px">
                <!-- 主题展示区域 -->
                <SEOTopic :topic="productData.topic || ''"
                          :sub_topic_id="productData.sub_topic_id || ''"
                          :sub_topic="productData.sub_topic || ''"
                          :topic_id="productData.topic_id || null"
                          class="seo-topic"></SEOTopic>

                <!-- 智能生成内容组件 -->
                <SEOGenContent @insertText="insertText"></SEOGenContent>
            </div>
        </div>

        <!-- footer -->
        <div class="footer">
            <Button plain
                    @click="handleCancel"
                    class="button-ghost el-button-ghost">{{ $t('exit') }}</Button>
        </div>
    </div>
</template>

<script>
    import Editor from '@/views/email-marketing/marketing-activities/components/new-marketing/editor.vue';
    import SEOTopic from '@/views/seo-subject/components/seo-gen/SEOTopic.vue';
    import SEOGenContent from '@/views/seo-subject/components/seo-gen/SEOGenContent.vue';
    import util from '@/libs/util';

    // ai tool bar
    import { getInputSelectedText, coverText, insertText as aiInsertText } from '@/views/ai-toolbar/utils/tools'

    export default {
        name: 'seoGenIndex',
        components: {
            Editor,
            SEOTopic,
            SEOGenContent
        },
        data() {
            return {
                productData: {
                    title: '',
                    description: ''
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
                        this.insertContentToInput(content, this.$refs.title.$refs.input, 'title');
                        break;
                    case 'SEO元描述':
                        this.insertContentToInput(content, this.$refs.description.$refs.textarea, 'description');
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
                const subjectText = this.productData[attrName];
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
                this.productData[attrName] = subjectText.substring(0, startPos) + content + subjectText.substring(endPos);

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
            // 一键复制
            copyContent(contentType) {
                // 根据type的不同,执行不同的方法
                switch (contentType) {
                    case 'add_page_title':
                        // 调用文本插入到 标题 方法
                        this.copyInputText(document.getElementById('add_page_title'));
                        break;
                    case 'add_page_content':
                        // 调用文本插入到 内容简介 方法
                        this.copyInputText(document.getElementById('add_page_content'));
                        break;
                    case 'tinymce':
                        // 调用文本插入到 富文本 方法
                        this.copyTinymceContent();
                        break;
                }
            },
            // 复制 input 输入框内容
            copyInputText(dom) {
                if (dom) {
                    dom.select(); // 选择对象
                    if (document.execCommand('Copy')) {
                        this.$Message.success(this.$t('crm.Modal.success_copy'));
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_copy'));
                    }
                } else {
                    this.$Message.error(this.$t('crm.Modal.error_copy'));
                }
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

            /* 点击取消则返回对应列表 */
            handleCancel() {
                this.$emit('close');
            },

            // ai tool bar
            onIputSelect(name, id, e) {
                const result = getInputSelectedText()
                if (result.text) {
                    const _this = this
                    const insert = (newText, insertStart, insertEnd) => {
                        this.$set(this.productData, name, newText)
                        const subInput = document.getElementById(id)
                        subInput.focus()
                        this.$nextTick(() => {
                            subInput.setSelectionRange(insertStart, insertEnd)
                        })
                        this.$aiToolBar.destroy();
                    }

                    this.$aiToolBar.init({
                        type: 'inputBoxSelect',
                        value: result.text,
                        mouseX: e.clientX,
                        mouseY: e.clientY,
                        onCover: (v) => {
                            const newText = coverText(this.productData[name], v, result)
                            insert(newText, result.start, result.start + v.length)
                        },
                        onInsert: (v) => {
                            const newText = aiInsertText(this.productData[name], v, result)
                            insert(newText, result.end, result.end + v.length)
                        }
                    })
                } else {
                    this.$aiToolBar.destroy()
                }
            },
            // ai tool bar
            initAiToolBar(name, val, id) {
                if (val.toLowerCase() === '/ai') {
                    this.$aiToolBar.init({
                        type: 'inputBoxSlash',
                        onConfirm: v => {
                            this.$aiToolBar.destroy()
                            this.$set(this.productData, name, v)

                            const subInput = document.getElementById(id)
                            subInput.focus()
                            this.$nextTick(() => {
                                subInput.setSelectionRange(0, v.length)
                            })
                        },
                        onAbort: () => {
                            this.$set(this.productData, name, '')
                        }
                    })
                }else {
                    this.$aiToolBar.destroy()
                }
            }
        },
        watch: {
            // ai tool bar 
            'productData.title': {
                handler(val) {
                    this.initAiToolBar('title', val, 'add_page_title')
                },
            },
            'productData.description': {
                handler(val) {
                    this.initAiToolBar('description', val, 'add_page_content')
                },
            },
        },
        mounted() {
            this.initQiniu();
        }
    };
</script>

<style lang="less">
    .add_page {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.8);
        letter-spacing: 0;
        line-height: 18px;
        background-color: #f5f6fa;
        padding-top: 2px;

        &-title {
            font-size: 14px;
            color: rgba(0, 0, 0, 0.8);
            font-weight: bold;
            margin-bottom: 12px;
        }
        .box-card {
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05) !important;

            & /deep/ .el-textarea .el-textarea__inner {
                height: 130px;
                resize: none;
            }
        }

        .el-card__body {
            position: relative;
            overflow: auto !important;
        }
    }
</style>

<style scoped lang="less">
    .mainWrap {
        display: flex;
        padding-bottom: 60px;

        #mainslide {
            flex: 1;
            margin: 30px 20px 0 20px;
        }
    }

    .footer {
        position: fixed;
        bottom: 0;
        z-index: 999;
        height: 56px;
        width: 100%;
        padding: 9px 30px;
        background: #ffffff;
        box-shadow: 0 -1px 4px 0 #eceff4;

        & /deep/ .el-button {
            margin-right: 14px;
        }

        .button-ghost {
            border-color: #abbfd5;
            color: rgba(0, 0, 0, 0.8);

            &:hover {
                background: #ebf0f7;
            }
        }
    }

    .add_page_title {
        margin-left: 30px;
        margin-top: 30px;
        width: 840px;
        // height: 162px;
    }

    .add_page_extend {
        width: 840px;
        margin-left: 30px;
        margin-top: 20px;
    }

    .add_page_function {
        width: 840px;
        // height: 210px;
        margin-left: 30px;
        margin-top: 20px;
    }

    .form_card_header {
        font-weight: bold;
        font-size: 14px;
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
        right: 24px;
        bottom: 20px;
        height: 32px;
        font-size: 16px;
    }
</style>
