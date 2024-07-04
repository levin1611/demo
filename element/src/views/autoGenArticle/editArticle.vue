<template>
    <div class="editArticle">
        <Spin v-if="loading"
              fix></Spin>

        <!-- 顶部提示语 -->
        <div class="editArticle-header">
            <!-- 提示语 -->
            <span class="editArticle-title">{{ $t('autoGenArticle.editArticle') }}</span>
        </div>

        <!-- 绑定步骤条 -->
        <Steps :active="currentStep"
               align-center
               finish-status="success"
               class="editArticle-steps">
            <Step :title="$t('autoGenArticle.editContent')"></Step>
            <Step :title="$t('autoGenArticle.publishArticle')"></Step>
        </Steps>

        <!-- 绑定步骤视图 -->
        <component :is="stepView"
                   :ref="stepView"
                   :artInfo="artInfo"
                   @stepNext="currentStep+=1"
                   @stepPrev="currentStep-=1"
                   style="margin: 20px auto 50px;"></component>

        <!-- 底部取消绑定按钮 -->
        <div class="editArticle-footer">
            <!-- 关闭 -->
            <Button @click="handleClose">{{ $t('close') }}</Button>

            <!-- 存草稿 -->
            <Button type="primary"
                    @click="handleSaveDraft">{{ $t('save') }}</Button>

            <!-- 保存并编辑下一篇 -->
            <!-- 发布并编辑下一篇 -->
            <!-- 暂略 -->

            <!-- 营销站 & AMP 站 -->
            <template v-if="currentStep === 1">
                <template v-if="['1', '2'].includes(artInfo.siteType)">
                    <!-- 发布 -->
                    <Button type="primary"
                            @click="handlePublish">{{ $t('autoGenArticle.publish') }}</Button>
                </template>
            </template>

            <!-- 下一步 -->
            <Button v-if="currentStep < 1"
                    type="primary"
                    @click="handleNext">{{ $t('facebook.adAccountBinding.nextStep') }}</Button>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { getArtDetail, saveArtDraft, publishArt, publishArtAMP } from '@/api/seo';
    import EditArtContent from '@/views/autoGenArticle/editArtContent.vue';
    import PublishArt from '@/views/autoGenArticle/publishArt.vue';

    export default {
        name: 'editArticle',
        props: {
            currArtData: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        components: {
            EditArtContent,
            PublishArt
        },
        data() {
            return {
                /* 全局 */
                loading: false,
                artInfo: {},

                /* steps */
                currentStep: -1,
                stepView: '',

                /* 编辑文章内容 */
                editArtContentData: {},

                /* 编辑文章发布信息 */
                editArtPublishData: {}
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId'
            })
        },
        methods: {
            // 获取文章详情
            getDetail() {
                // 清空旧数据
                this.artInfo = {};
                getArtDetail({
                    id: this.currArtData.id
                }).then(res => {
                    if (res.code === '1' && res.data) {
                        this.artInfo = this.handleArtInfo(res.data);

                        // 跳转到指定步骤
                        this.currentStep = 0;
                    } else {
                        // 请求失败

                        this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    }
                }).catch(e => {
                    // 请求失败

                    console.error(e);
                    this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                });
            },
            handleArtInfo(data) {
                const {
                    id,
                    index,
                    task_id,
                    site_type: siteType,
                    site_id: siteId,
                    site_url: siteUrl,
                    title,
                    context: content,
                    status,
                    post_type: artType,
                    category,
                    category_id: categoryId,
                    page_url: pageUrl,
                    seo_title,
                    seo_keyword,
                    seo_description,
                    parent_topic: topic_id,
                    topic: sub_topic_id,
                    tokens,
                    amount,
                    allow_inclusion: isAllowIndex,
                    is_index: isIndexed,
                    operator_user_id,
                    operator_user_name,
                    release_time: publishTime,
                    create_time,
                    update_time
                } = data;

                return {
                    id,
                    index,
                    task_id,
                    siteType: `${siteType}`,
                    siteId,
                    siteUrl,
                    title,
                    content,
                    status: `${status}`,
                    artType: `${artType}`,
                    category,
                    categoryId,
                    pageUrl,
                    seo_title,
                    seo_keyword,
                    seo_description,
                    topic_id,
                    sub_topic_id,
                    tokens,
                    amount,
                    isAllowIndex: isAllowIndex === 1,
                    isIndexed,
                    operator_user_id,
                    operator_user_name,
                    publishTime,
                    create_time,
                    update_time
                };
            },

            // steps
            // 点击下一步
            handleNext() {
                // 未通过校验, 不允许继续执行
                if (!this.$refs.EditArtContent.validateData()) {
                    return;
                }

                // 取组件编辑后的内容
                try {
                    this.editArtContentData = this.$refs.EditArtContent.getContent();
                } catch (e) {
                    console.error(e);
                }

                // step + 1, 进入下一步
                this.$nextTick(() => {
                    this.currentStep += 1;
                });
            },

            // 关闭
            handleClose() {
                this.$emit('goBack');
            },
            // 存草稿
            async handleSaveDraft() {
                const allData = await this.mergeArtData();
                if (!allData) {
                    return;
                }

                this.loading = true;
                saveArtDraft(allData).then(res => {
                    switch (res.code) {
                        case '1':
                            this.$emit('refreshArtTable');
                            this.$emit('goBack');
                            this.$Message.success(this.$t('saveSuccess'));
                            break;
                        case '10001':
                            this.$Message.error(this.$t('autoGenArticle.error_topicRelated'));
                            break;
                        case '10002':
                            this.$Message.error(this.$t('autoGenArticle.error_URLExisted'));
                            break;
                        case '10006':
                            this.$Message.error(this.$t('autoGenArticle.error_othersOperatingArticle'));
                            break;
                        default:
                            this.$Message.error(this.$t('saveFail'));
                    }
                    this.loading = false;
                }).catch(e => {
                    console.error(e);
                    this.loading = false;
                    this.$Message.error(this.$t('saveFail'));
                });
            },
            // 发布
            // 点击发布按钮
            async handlePublish() {
                const allData = await this.mergeArtData();
                if (!allData) {
                    return;
                }

                this.loading = true;
                let req_publish;
                if (this.artInfo.siteType === '1') {
                    // AMP 站
                    req_publish = publishArtAMP(Object.assign({}, allData, { siteId: this.artInfo.siteId }));
                } else {
                    // 营销站
                    req_publish = publishArt(allData);
                }
                req_publish.then(res => {
                    switch (res.code) {
                        case '1':
                            this.$emit('refreshArtTable');
                            this.$emit('goBack');
                            this.$Message.success(this.$t('releaseSuccess'));
                            break;
                        case '10001':
                            this.$Message.error(this.$t('autoGenArticle.error_topicRelated'));
                            break;
                        case '10002':
                            this.$Message.error(this.$t('autoGenArticle.error_URLExisted'));
                            break;
                        default:
                            this.$Message.error(this.$t('releaseFailure'));
                    }
                    this.loading = false;
                }).catch(e => {
                    console.error(e);
                    this.loading = false;
                    this.$Message.error(this.$t('releaseFailure'));
                });
            },
            // 合并编辑数据
            async mergeArtData() {
                // 校验 + 取当前所在组件的最新编辑数据
                try {
                    if (this.stepView === 'EditArtContent') {
                        if (!await this.$refs.EditArtContent.validateData()) {
                            return null;
                        }
                        this.editArtContentData = this.$refs.EditArtContent.getContent();
                    } else if (this.stepView === 'PublishArt') {
                        if (!await this.$refs.PublishArt.validateData()) {
                            return null;
                        }
                        this.editArtPublishData = this.$refs.PublishArt.getContent();
                    }
                } catch (e) {
                    console.error(e);
                }

                // 合并各组件数据到原始数据
                const mergeData = Object.assign({}, this.artInfo, this.editArtContentData, this.editArtPublishData);

                // 数据处理
                const {
                    id, // 文章ID 两部的文章编辑都传这个字段
                    title, // 文章标题
                    content: context, // 文章内容
                    seoTitle, // seo标题
                    seoKeyword, // seo关键字
                    seoDesc: seoDescription, // seo描述
                    topic_id: parentTopic, // 父关键词
                    sub_topic_id: topic,
                    status, // 状态
                    category, // 分类
                    categoryId, // 分类 Id
                    isAllowIndex: allowInclusion, // 是否允许收录 0否 1是
                    pageUrl, // pageUrl
                    publishTime: releaseTime
                } = mergeData;

                // 返回结果
                return {
                    id,
                    title,
                    context,
                    seoTitle,
                    seoKeyword,
                    seoDescription,
                    parentTopic: parentTopic || -1,
                    topic: topic || -1,
                    status: status === '5' ? '5' : '1',
                    category,
                    categoryId,
                    allowInclusion: allowInclusion ? 1 : 0, // 是否允许收录 0否 1是
                    pageUrl,
                    releaseTime
                };
            }
        },
        watch: {
            currentStep(val) {
                switch (val) {
                    case 0:
                        this.stepView = 'EditArtContent';
                        break;
                    case 1:
                        this.stepView = 'PublishArt';
                        break;
                    default:
                        this.stepView = '';
                }
            },
            currArtData: {
                handler(val) {
                    this.currentStep = -1;
                    if (val && val.id) {
                        this.getDetail();
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less">
    .editArticle {
        padding: 20px 30px 20px;

        &-steps {
            width: 50%;
            max-width: 500px;
            margin: 20px auto 0;
        }

        .el-steps {
            .el-step {
                &:first-child {
                    .el-step__line {
                        background-color: #FF5F2A;
                    }
                }

                .el-step__head {
                    &.is-process {
                        color: #FF752A;
                        border-color: #FF752A;

                        .el-step__icon {
                            &.is-text {
                                background-color: #FF752A;

                                .el-step__icon-inner {
                                    color: #FFF;
                                }
                            }
                        }
                    }

                    &.is-success {
                        color: #FF752A;
                        border-color: #FF752A;

                        .el-step__line {
                            background-color: #FF752A;
                        }
                    }
                }

                .el-step__title {
                    &.is-success, &.is-process {
                        color: #FF5F2A;
                    }
                }

                .el-step__line {
                    margin: 0 20% !important;
                }
            }
        }

        &-title {
            line-height: 28px;
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }

        &-footer {
            position: absolute;
            right: 30px;
            bottom: 0;
            padding-bottom: 20px;
            width: 100%;
            text-align: right;
            background: #FFF;
        }

        &-cancelBtn {
            font-size: 14px;
            color: #EA4335;

            &:hover {
                color: #EA4335;
            }
        }

        .editArticle-steps-footer {
            position: absolute;
            right: 100px;
            bottom: 30px;
        }

        .btn-ghost {
            color: #FA8241;
            border-color: #FA8241;
            &:hover {
                color: #FA8241;
                border-color: #FA8241;
                background-color: #fff4ea;
            }
        }
    }
</style>
