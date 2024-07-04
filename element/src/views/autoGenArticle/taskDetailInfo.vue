<template>
    <div class="taskDetailInfo">
        <div v-for="item in infoItems"
             :key="item.key"
             class="taskDetailInfo-item">
            <div class="taskDetailInfo-item-label">{{ item.label }}: </div>
            <div class="taskDetailInfo-item-content">
                <!-- 特殊处理: 网站 -->
                <template v-if="item.key === 'website'">
                {{ '【' }}{{ $t(`seo.detailSelect.siteType_${taskInfo.site_type}`) }}{{ '】' }}{{ taskInfo[item.key] }}</template>
                <!-- 文章类型 -->
                <template v-else-if="item.key === 'artType'">{{ $t(`autoGenArticle.${taskInfo.artType}`) }}</template>
                <!-- 关键词 -->
                <template v-else-if="item.key === 'keyword'">{{ taskInfo[item.key] | handleKeyword }}</template>
                <!-- 生成文章数量 -->
                <template v-else-if="item.key === 'genArtNum'">{{ $t('autoGenArticle.showGenArtNum1') }} {{ taskInfo[item.key] }} {{ $t('autoGenArticle.showGenArtNum2') }}</template>
                <!-- 创建时间 -->
                <template v-else-if="item.key === 'createTime'">{{ taskInfo[item.key] | timeFormat('DateTime') }}</template>
                <!-- 其他正常显示 -->
                <template v-else>{{ taskInfo[item.key] }}</template>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'taskDetailInfo',
        props: {
            taskInfo: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        computed: {
            // 格式化任务详情的关键词为数组
            keywordArr() {
                if (this.taskInfo.keyword) {
                    try {
                        return this.taskInfo.keyword.split(',');
                    } catch (e) {
                        console.error(e);
                        console.error(this.taskInfo.keyword);
                        return [];
                    }
                } else {
                    return [];
                }
            }
        },
        filters: {
            // 使用 '、' 连接关键词
            handleKeyword(str) {
                if (!str) {
                    return '';
                }

                return str.split(',').join('、');
            }
        },
        data() {
            return {
                infoItems: [
                    { key: 'taskName', label: this.$t('autoGenArticle.taskName') },
                    { key: 'model', label: this.$t('autoGenArticle.model') },
                    { key: 'maxContentLength', label: this.$t('autoGenArticle.maxContentLength') },
                    { key: 'contentRandomness', label: this.$t('autoGenArticle.contentRandomness') },
                    { key: 'website', label: this.$t('autoGenArticle.website') },
                    { key: 'artType', label: this.$t('autoGenArticle.artType') },
                    { key: 'language', label: this.$t('autoGenArticle.language') },
                    { key: 'tones', label: this.$t('autoGenArticle.tones') },
                    { key: 'keyword', label: this.$t('autoGenArticle.keyword') },
                    { key: 'genArtNum', label: this.$t('autoGenArticle.genArtNum') },
                    { key: 'creator', label: this.$t('autoGenArticle.creator') },
                    { key: 'createTime', label: this.$t('autoGenArticle.createTime') },
                ]
            };
        }
    };
</script>

<style scoped lang="less">
    .taskDetailInfo {
        padding: 20px;

        &-item {
            display: flex;
            margin-bottom: 16px;
        }

        &-item-label {
            color: rgba(0, 0, 0, 0.60);
            font-size: 12px;
            line-height: 12px;
            margin: 1.45px 4px 0 0;
        }

        &-item-content {
            color: #1A1A1A;
            font-size: 14px;
            line-height: 14px;
        }
    }
</style>
