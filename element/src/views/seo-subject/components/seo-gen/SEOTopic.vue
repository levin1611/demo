<template>
    <div>
        <div class="suggest-box">
            <div class="suggest-topic">
                <!-- 主题 -->
                <div class="topic-item">
                    <p class="topic-item-title">{{ $t('seo.genContent.tip_editingTopic') }}</p>
                    <Select
                        :value="topicParentVal"
                        filterable
                        @change="topicParentChange"
                        :placeholder="$t('seo.genContent.tip_selectTopic')"
                        class="suggest-select"
                    >
                        <OptionGroup
                            v-for="(group, index) in topicParentList"
                            :key="index"
                            :label="group.label"
                        >
                            <Option v-for="item in group.options"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                    class="select-page">
<!--                                <span v-if="item.value === 'link'"-->
<!--                                      @click="gotoSEO"-->
<!--                                      style="margin-left: 8px"-->
<!--                                      class="topic-span">{{ item.label }}</span>-->
<!--                                <span v-else-->
                                <span style="margin-left: 8px"
                                      class="topic-span">{{ item.label }}</span>
                            </Option>
                        </OptionGroup>
                    </Select>
                </div>
                <!-- 子主题 -->
                <div class="topic-item">
                    <p class="topic-item-title">{{ $t('seo.genContent.childTopicKeywords') }}</p>
                    <Select
                        :value="topicChildVal"
                        filterable
                        @change="topicChildChange"
                        :placeholder="$t('seo.genContent.tip_selectChildTopic')"
                        class="suggest-select"
                    >
                        <OptionGroup
                            v-for="(group, index) in topicChildList"
                            :key="index"
                            :label="group.label"
                        >
                            <Option
                                v-for="item in group.options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                class="select-page"
                                :disabled="item.disabled"
                            >
                                <span
                                    class="topic-span"
                                    style="margin-left: 8px"
                                    v-if="item.value === 'popup'"
                                    @click="addTopicChild"
                                >{{ item.label }}</span
                                >
                                <span class="topic-span" v-else style="margin-left: 8px">{{
                                        item.label
                                    }}</span>
                            </Option>
                        </OptionGroup>
                    </Select>
                </div>
            </div>
        </div>

        <!-- 添加子主题关键字 -->
        <Modal
            :before-close="closeTopicChild"
            :close-on-click-modal="false"
            :destroy-on-close="true"
            :modal-append-to-body="false"
            :visible.sync="childTopicStatus"
            :title="$t('seo.genContent.addTopicKeyWords')"
            width="578px"
        >
            <div class="child-topic-cont">
                <p class="topic-info">{{ $t('seo.genContent.tip_topicKeyWords') }}</p>
                <Input
                    :placeholder="$t('seo.genContent.tip_topicKeyWords')"
                    class="topic-input"
                    type="text"
                    maxlength="60"
                    show-word-limit
                    v-model="topicValue"
                />
            </div>
            <div slot="footer">
                <Button @click="closeTopicChild" class="el-button-ghost">{{ $t('cancel') }}</Button>
                <Button
                    class="setting-realm-name-confirm"
                    @click="btnAddTopicChild"
                    type="primary">{{ $t('confirm') }}</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import { getTopicData, addTopicChild } from '@/api/seo';

    export default {
        name: 'Suggest',
        props: [
            'topic',
            'sub_topic',
            'topic_id',
            'sub_topic_id'
        ],
        data() {
            return {
                topicParentList: [
                    {
                        label: '',
                        options: [
                            // {
                            //     value: 'link',
                            //     label: '编辑主题'
                            // }
                        ]
                    }
                ],
                topicChildList: [],
                topicParentVal: '',
                topicChildVal: '',
                childTopicStatus: false,
                topicValue: '',
                topicId: this.topic_id,
                showAltAll: false,
                showSubTopicListAll: false
            };
        },
        watch: {
            topic_id: {
                handler(val) {
                    if (val !== null) {
                        this.getTopicData(val, 'child');
                        this.topicParentVal = val;
                        this.topicId = val;
                    }
                },
                immediate: true
            },
            sub_topic_id: {
                handler(val) {
                    if (val !== null) {
                        this.topicChildVal = val;
                    }
                },
                immediate: true
            }
        },
        created() {
            this.getTopicData({ parent_id: -1 });
        },
        methods: {
            // 添加子主题
            async btnAddTopicChild() {
                try {
                    const data = {
                        name: this.topicValue,
                        parent_id: this.topicId,
                        type: 1
                    };
                    const res = await addTopicChild({
                        name: data.name,
                        parent_id: data.parent_id,
                        type: data.type,
                        object: data.object
                    });
                    console.log('sdfasd', res);
                    if (res.code === 0) {
                        this.closeTopicChild();
                        this.$Message.success(this.$t('seo.genContent.success_addChildTopic'));
                        this.getTopicData(this.topicId, 'child');
                    } else {
                        this.closeTopicChild();
                        this.$Message.error(res.msg);
                    }
                } catch (error) {
                    console.error(error);
                }
            },
            // 关闭添加子主题弹窗
            closeTopicChild() {
                this.childTopicStatus = false;
                this.topicValue = '';
            },
            // 添加子主题
            addTopicChild() {
                this.childTopicStatus = true;
            },
            // 跳转到SEO
            // gotoSEO() {
            //     window.open('//admin.leadscloud.com/Front-Vue/#/seo/index');
            // },
            // 获取主题列表
            async getTopicData(id, status) {
                try {
                    const res = await getTopicData({ parent_id: id });
                    if (res.data) {
                        switch (status) {
                            case 'parent':
                                this.topicParentList = res.data.length > 0 ? [
                                    {
                                        label: '',
                                        options: res.data.map((item) => ({
                                            value: item.id,
                                            label: item.name
                                        }))
                                    },
                                    {
                                        label: '',
                                        options: [
                                            // {
                                            //     value: 'link',
                                            //     label: '编辑主题'
                                            // }
                                        ]
                                    }
                                ] : [
                                    {
                                        label: '',
                                        options: [
                                            // {
                                            //     value: 'link',
                                            //     label: '编辑主题'
                                            // }
                                        ]
                                    }
                                ];
                                break;
                            case 'child':
                                this.topicChildList =
                                    res.data.length > 0
                                        ? [
                                            {
                                                label: '',
                                                options: res.data.map((item) => ({
                                                    value: item.id,
                                                    label: item.name,
                                                    // eslint-disable-next-line
                                                disabled: item.url === '' || item.url === null ? false : true
                                                }))
                                            },
                                            {
                                                label: '',
                                                options: [
                                                    {
                                                        value: 'popup',
                                                        label: this.$t('seo.genContent.addChildTopicKeyWords')
                                                    }
                                                ]
                                            }
                                        ]
                                        : [
                                            {
                                                label: '',
                                                options: [
                                                    {
                                                        value: 'popup',
                                                        label: this.$t('seo.genContent.addChildTopicKeyWords')
                                                    }
                                                ]
                                            }
                                        ];
                                break;
                            default:
                                this.topicParentList = res.data.length > 0 ? [
                                    {
                                        label: '',
                                        options: res.data.map((item) => ({
                                            value: item.id,
                                            label: item.name
                                        }))
                                    },
                                    {
                                        label: '',
                                        options: [
                                            // {
                                            //     value: 'link',
                                            //     label: '编辑主题'
                                            // }
                                        ]
                                    }
                                ] : [
                                    {
                                        label: '',
                                        options: [
                                            // {
                                            //     value: 'link',
                                            //     label: '编辑主题'
                                            // }
                                        ]
                                    }
                                ];
                                break;
                        }
                    } else {
                        return false;
                    }
                } catch (error) {
                    console.error(error);
                }
            },
            // 主题切换
            topicParentChange(val) {
                if (val === 'link') {
                    return false;
                }
                this.topicChildList = [];
                this.topicChildVal = '';
                this.topicParentVal = val;
                this.topicId = val;
                this.getTopicData(val, 'child');
            },
            // 子主题切换
            topicChildChange(val) {
                if (val === 'popup') {
                    return false;
                } else {
                    this.topicChildVal = val;
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .suggest-box {
        background-color: #fff;
        border-right: #eaeaea 1px solid;
        padding: 0 20px 20px;
        overflow-y: auto;
    }

    .suggest-topic {
        .topic-item {
            .topic-item-title {
                font-size: 12px;
                color: rgba(0, 0, 0, 0.8);
                margin: 14px 0 8px 0;
            }
        }
    }

    .suggest-select {
        width: 100%;
    }

    .child-topic-cont {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .topic-info {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.8);
    }

    .topic-input {
        width: 338px;

        /deep/ .el-input__inner {
            padding-right: 50px !important;
        }
    }

    .topic-span {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
