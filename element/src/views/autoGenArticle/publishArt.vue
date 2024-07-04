<template>
    <div class="publishArt">
        <!-- 标题 -->
        <div class="publishArt-title">
            <p>{{ $t('autoGenArticle.publishInfoSet') }}</p>
        </div>

        <!-- 非第三方站表单 -->
        <Form v-if="!isThirdParty"
              :model="infoForm"
              :rules="rules"
              ref="infoForm"
              label-position="left"
              label-width="180px"
              class="publishArt-form">
            <!-- 网站 -->
            <FormItem prop="siteId"
                      :label="$t('autoGenArticle.website')"
                      required>
                <Select v-model="infoForm.siteId"
                        disabled>
                    <Option v-for="item in siteList"
                            :key="`${item.site_id}-${item.site_type}`"
                            :label="`[${$t(`seo.detailSelect.siteType_${item.site_type}`)}]${item.site_url}`"
                            :value="`${item.site_id}-${item.site_type}`"></Option>
                </Select>

                <!-- 提示 -->
                <div class="publishArt-formItem-tip">
                    <Icon custom="custom custom-exclamation"></Icon>
                    <template v-if="!isThirdParty">{{$t('autoGenArticle.tip_website') }}</template>
                    <template v-else>{{ $t('autoGenArticle.tip_thirdPartyWebsite') }}</template>
                </div>
            </FormItem>

            <!-- 文章类型 -->
            <FormItem prop="artType"
                      :label="$t('autoGenArticle.artType')"
                      required>
                <Select v-model="infoForm.artType"
                        disabled
                        filterable>
                    <Option v-for="item in artTypeOptions"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label">{{ item.label }}</Option>
                </Select>
            </FormItem>

            <!-- 分类 -->
            <FormItem prop="categoryId"
                      :label="$t('autoGenArticle.category')">
                <Cascader v-model="infoForm.categoryId"
                          :options="siteCategoryData"
                          :props="casProps"
                          :show-all-levels="false"
                          filterable
                          clearable
                          :placeholder="$t('crm.Modal.tip_select')"
                          ref="categoryCas"
                          @change="casChange"></Cascader>
            </FormItem>

            <!-- page URL -->
            <FormItem prop="pageUrl"
                      :label="$t('autoGenArticle.pageURL')"
                      required>
                <Input v-model="infoForm.pageUrl"></Input>

                <!-- 是否允许收录 -->
                <div v-if="!isThirdParty">
                    <Checkbox v-model="infoForm.isAllowIndex">{{ $t('autoGenArticle.allowBrowserIndex') }}</Checkbox>
                </div>
                <!-- 提示 -->
                <div v-else
                     class="publishArt-formItem-tip">{{ $t('autoGenArticle.tip_thirdPartyURL') }}
                </div>
            </FormItem>

            <!-- 状态 -->
            <FormItem prop="status"
                      :label="$t('autoGenArticle.status')">
                <Select v-model="infoForm.status"
                        :placeholder="$t('crm.Modal.tip_select')"
                        filterable>
                    <Option v-for="item in statusList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"></Option>
                </Select>
            </FormItem>

            <!-- 发布时间 -->
            <FormItem prop="publishTime"
                      :label="$t('autoGenArticle.publishTime')">
                <DatePicker v-model="infoForm.publishTime"
                            type="datetime"
                            :picker-options="(artInfo.siteType === '1') ? dateOptions : undefined"
                            placement="bottom-end"
                            value-format="timestamp"
                            size="small"
                            style="width: 200px;"></DatePicker>
            </FormItem>
        </Form>

        <!-- 第三方站表单 -->
        <Form v-else
              :model="infoForm"
              :rules="rules"
              ref="infoForm"
              label-position="left"
              label-width="180px"
              class="publishArt-form">
            <!-- 网站 -->
            <FormItem prop="website"
                      :label="$t('autoGenArticle.website')"
                      required>
                <Input :value="`[${$t('seo.detailSelect.siteType_3')}]${infoForm.website}`"
                       disabled></Input>

                <!-- 提示 -->
                <div class="publishArt-formItem-tip">
                    <Icon custom="custom custom-exclamation"></Icon>
                    <template v-if="!isThirdParty">{{$t('autoGenArticle.tip_website') }}</template>
                    <template v-else>{{ $t('autoGenArticle.tip_thirdPartyWebsite') }}</template>
                </div>
            </FormItem>

            <!-- page URL -->
            <FormItem prop="pageUrl"
                      :label="$t('autoGenArticle.pageURL')"
                      required>
                <Input v-model="infoForm.pageUrl"></Input>

                <!-- 是否允许收录 -->
                <div v-if="!isThirdParty">
                    <Checkbox v-model="infoForm.isAllowIndex">{{ $t('autoGenArticle.allowBrowserIndex') }}</Checkbox>
                </div>
                <!-- 提示 -->
                <div v-else
                     class="publishArt-formItem-tip">{{ $t('autoGenArticle.tip_thirdPartyURL') }}
                </div>
            </FormItem>
        </Form>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { getAmpNewsCategoryData, getMarketingArtCategoryData } from '@/api/seo';

    export default {
        name: 'publishArt',
        props: {
            artInfo: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId'
            }),
            // 是否是第三方网站
            isThirdParty() {
                return !['1', '2'].includes(this.artInfo.siteType);
            }
        },
        data() {
            return {
                infoForm: {},
                rules: {
                    siteId: [
                        { required: true, message: this.$t('autoGenArticle.error_emptyWebsite'), trigger: 'blur' }
                    ],
                    artType: [
                        { required: true, message: this.$t('autoGenArticle.error_emptyArtType'), trigger: 'blur' }
                    ],
                    pageUrl: [
                        { required: true, message: this.$t('autoGenArticle.error_emptyPageUrl'), trigger: ['blur', 'change'] }
                    ]
                    // 其他的大部分是选项且不可取消勾选, 没必要写必填校验
                },
                siteList: [],
                siteCategoryData: [],
                casProps: {
                    value: 'id',
                    label: 'title',
                    expandTrigger: 'hover'
                },
                artTypeOptions: [],
                // 文章状态 0回收站 1草稿 2已生成 3待发布 4已发布 5审核完毕 6生成中 7待生成
                statusList: [
                    {
                        value: '1',
                        label: this.$t('autoGenArticle.draft')
                    },
                    {
                        value: '5',
                        label: this.$t('autoGenArticle.reviewed')
                    }
                ],
                dateOptions: {
                    disabledDate(date) {
                        return date && date.valueOf() > Date.now();
                    }
                }
            };
        },
        methods: {
            // 处理详情数据
            handleArtInfo(data) {
                let result = {};
                if (!this.isThirdParty) {
                    result = {
                        siteId: `${data.siteId}-${data.siteType}`,
                        artType: data.artType,
                        category: data.category,
                        categoryId: data.categoryId,
                        pageUrl: data.pageUrl,
                        isAllowIndex: data.isAllowIndex,
                        status: '1', // 状态默认为"草稿
                        publishTime: data.publishTime || new Date()
                    };

                    // 赋值文章类型下拉数据
                    if (data.siteType === '1') {
                        // 选中 AMP 站, 返回"新闻"
                        this.artTypeOptions = [{
                            value: '1',
                            label: this.$t('autoGenArticle.news')
                        }];
                    } else {
                        // 营销站&第三方建站系统, 返回"文章"
                        this.artTypeOptions = [{
                            value: '2',
                            label: this.$t('autoGenArticle.article')
                        }];
                    }
                } else {
                    result = {
                        website: data.siteUrl,
                        pageUrl: data.pageUrl
                    };
                }

                return result;
            },

            /* 网站相关 */
            // 获取 新闻/文章 分类列表
            getSiteCategoryData(siteId, siteType, siteUrl) {
                this.siteCategoryData = [];
                if (`${siteType}` === '1') {
                    // AMP 站, 新闻
                    this.getAMPCategory(siteId);
                } else if (`${siteType}` === '2') {
                    // 营销站, 文章
                    this.getMarketingCategory(siteUrl);
                }
            },
            // 获取 AMP 站页面列表
            getAMPCategory(siteId) {
                getAmpNewsCategoryData({
                    kind_id: 2,
                    site_id: siteId
                }).then(res => {
                    if (res.code === 0) {
                        this.siteCategoryData = res.data;
                    }
                });
            },
            // 获取营销站页面列表
            getMarketingCategory(siteUrl) {
                getMarketingArtCategoryData({
                    siteUrl
                }).then(res => {
                    if (res.code === '1') {
                        this.siteCategoryData = res.data;
                    }
                });
            },

            // 选中分类
            casChange() {
                const checkedNodes = this.$refs.categoryCas.getCheckedNodes();
                if (checkedNodes[0]) {
                    const nodeData = checkedNodes[0];
                    this.infoForm.category = nodeData.label;
                    this.infoForm.categoryId = nodeData.value;
                } else {
                    this.infoForm.category = '';
                    this.infoForm.categoryId = '';
                }
            },
            // 校验数据 --- 给外部组件调用
            validateData() {
                return this.$refs.infoForm.validate().catch(e => e);
            },
            // 提取所有数据 --- 给外部组件调用
            getContent() {
                return this.infoForm;
            }
        },
        mounted() {
            // 获取分类数据
            this.getSiteCategoryData(this.artInfo.siteId, this.artInfo.siteType, this.artInfo.siteUrl);
            // 回填网站下拉数据
            this.siteList = [{
                site_id: this.artInfo.siteId,
                site_type: this.artInfo.siteType,
                site_url: this.artInfo.siteUrl
            }];
            // 回填数据
            this.infoForm = Object.assign({}, this.handleArtInfo(this.artInfo));
        }
    };
</script>

<style scoped lang="less">
    .publishArt {
        padding: 20px 30px 56px;

        &-title {
            color: rgba(0, 0, 0, 0.80);
            font-size: 16px;
            font-weight: 600;
            line-height: 24px;
            margin-bottom: 20px;
        }

        &-form {
            /deep/ .el-form-item {
                margin-bottom: 20px;
            }

            /deep/ .el-form-item__label {
                color: #333;
                font-size: 14px;
                font-weight: 400;
                line-height: 24px;
            }

            /deep/ .el-form-item__content {
                max-width: 820px;
                color: rgba(0, 0, 0, 0.80);
                font-size: 14px;
                font-style: normal;
                font-weight: 400;
                line-height: 22px;
            }

            /deep/ .el-input, /deep/ .el-select {
                width: 100%;
            }
        }

        /deep/ &-formItem-tip {
            color: #666;
            font-size: 12px;
            line-height: 18px;
            margin-top: 8px;

            i {
                margin-right: 7px;
                font-size: 16px;
                vertical-align: text-bottom;
            }
        }
    }
</style>
