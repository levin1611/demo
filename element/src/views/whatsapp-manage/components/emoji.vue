<template>
    <Tabs class="emoji-tab twemoji-convert">
        <TabPane v-for="(value, key) in emojiObj"
                 :key="key"
                 :lazy="true">
            <!-- TabPane 标题 icon -->
            <span slot="label">
                <!-- 图标 -->
                <span v-html="emojiCateTitle[key].emoji"
                      class="emoji-cate-icon"></span>
            </span>

            <!-- 标题 -->
            <div class="emoji-cate-title">{{ emojiCateTitle[key].title }}</div>

            <!-- 表情 -->
            <div @click="handleClickEmoji"
                 class="emoji-container">
                <div v-for="(emoji, index) in value"
                     :key="index"
                     v-html="emoji"
                     class="emoji-item"></div>
            </div>
        </TabPane>
    </Tabs>
</template>

<script>
    import AllEmojiObj from './wa-emoji.js';

    export default {
        name: 'emoji',
        data() {
            return {
                emojiObj: {},
                emojiCateTitle: {
                    SmileysAndPeople: {
                        title: this.$t('emoji.SmileysAndPeople'),
                        emoji: '😃'
                    },
                    AnimalsAndNature: {
                        title: this.$t('emoji.AnimalsAndNature'),
                        emoji: '🐻'
                    },
                    FoodAndDrink: {
                        title: this.$t('emoji.FoodAndDrink'),
                        emoji: '🍔'
                    },
                    Activity: {
                        title: this.$t('emoji.Activity'),
                        emoji: '⚽'
                    },
                    TravelAndPlaces: {
                        title: this.$t('emoji.TravelAndPlaces'),
                        emoji: '🌇'
                    },
                    Objects: {
                        title: this.$t('emoji.Objects'),
                        emoji: '💡'
                    },
                    Symbols: {
                        title: this.$t('emoji.Symbols'),
                        emoji: '🔣'
                    },
                    Flags: {
                        title: this.$t('emoji.Flags'),
                        emoji: '🏁'
                    }
                }
            };
        },
        methods: {
            // 点击选中 emoji
            handleClickEmoji(e) {
                // 取选中的 emoji DOM 标签
                let emojiImg;
                if (e.target.classList.contains('emoji-item')) {
                    emojiImg = e.target.querySelector('img.emoji');
                } else if (e.target.classList.contains('emoji')) {
                    emojiImg = e.target;
                }

                // 取标签上的 alt (实体字符)传给外部
                if (emojiImg) {
                    this.$emit('checkEmoji', emojiImg.getAttribute('alt'));
                }
            }
        },
        mounted() {
            this.emojiObj = Object.assign({}, AllEmojiObj);
        }
    };
</script>

<style scoped lang="less">
    .emoji-tab {
        /deep/ .el-tabs__header {
            margin-bottom: 0;
        }

        /deep/ .el-tabs__item {
            padding: 0 12px;
        }
    }

    .emoji-cate-icon {
        /*font-size: 18px;*/
        /deep/ img.emoji {
            height: 22px;
            width: 22px;
        }
    }

    .emoji-cate-title {
        margin-top: 10px;
        line-height: 24px;
    }

    .emoji-container {
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        height: 250px;
        overflow-y: auto;

        .emoji-item {
            width: 40px;
            font-size: 18px;
            margin: 10px;
            text-align: center;
            cursor: pointer;
        }
    }
</style>
