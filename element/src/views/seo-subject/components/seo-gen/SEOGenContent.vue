<!-- SEO 智能生成内容 组件 -->
<template>
    <div class="seo-gen-content">
        <div class="nav_title">{{ $t('seo.genContent.autoGenContent') }}</div>
        <Row :gutter="10">
            <Col :span="num">
                <div class="form_item">
                    <div class="title">{{ $t('seo.genContent.language') }}</div>
                    <Select v-model="params.language"
                            :placeholder="$t('crm.Modal.tip_select')"
                            filterable>
                        <Option v-for="item in language"
                                :key="item._id"
                                :label="$lang === 'zh-CN' ? item.cn : item.slug"
                                :value="item._id"></Option>
                    </Select>
                </div>
            </Col>
            <Col :span="num">
                <div class="form_item">
                    <div class="title">{{ $t('seo.genContent.tones') }}</div>
                    <Select v-model="params.tones"
                            :placeholder="$t('crm.Modal.tip_select')"
                            filterable>
                        <Option v-for="item in tones"
                                :key="item._id"
                                :label="$lang === 'zh-CN' ? item.cn : item.slug"
                                :value="item._id"></Option>
                    </Select>
                </div>
            </Col>
        </Row>
        <div class="form_item _w100">
            <div class="title">{{ $t('seo.genContent.sence') }}</div>
            <Select v-model="params.sence"
                    :placeholder="$t('crm.Modal.tip_select')"
                    filterable>
                <Option v-for="item in sence"
                        :key="item._id"
                        :label="$lang === 'zh-CN' ? item.cn : item.slug"
                        :value="item._id"></Option>
            </Select>
        </div>

        <div v-for="ele in contextInputs" :key="ele._id">
            <div class="form_item" v-if="ele.inputType == 'textarea'">
                <div style="display: flex;width:100%;justify-content: space-between;">
                    <div class="title">{{ ele.label }}</div>
                    <Poptip placement="bottom-start" ref="popdom" trigger="click">
                        <div class="tree-container">
                            <Tree show-checkbox
                                  node-key='id'
                                  :props="defaultProps"
                                  :lazy="true"
                                  :default-expand-all="true"
                                  :load="loadNode"
                                  ref="tree"
                                  :render-content="renderContent"
                                  @check-change="checkedChange">
                                <span slot-scope="{ node,data }">
                                    {{ data.name }}
                                </span>
                            </Tree>
                        </div>
                        <div class="text-right">
                            <Button type="minor" size="small" @click="closePop">{{ $t('cancel') }}</Button>
                            <Button type="success" size="small" @click="getKey">{{ $t('confirm') }}</Button>
                        </div>
                        <div slot="reference" ref="addKeybtn" style="color:#4285f2;cursor: pointer;">{{ $t('seo.genContent.addExistedKeywords') }}</div>
                    </Poptip>
                </div>
                <Input :class="{'is-exceed':getValdate(ele)}" type="textarea" @blur="isEmpty(ele.keyLabel)"
                       @input="isEmpty(ele.keyLabel)" :id="ele.keyLabel+'input'"
                       :placeholder="$t('seo.genContent.placeholder_content')"
                       v-model="inputMap[ele.keyLabel]" :maxlength="ele.inputMaximumCharacters"
                       show-word-limit></Input>
                <p style="color:#F56C6C;" v-show='getValdate(ele)'>{{ $t('seo.genContent.tip_contentOverLength') }}</p>
                <p :id="ele.keyLabel" style="color:#F56C6C;display: none;">{{ $t('seo.genContent.tip_contentEmpty') }}</p>
            </div>

            <div class="form_item" v-if="ele.inputType == 'text'">
                <div class="title">{{ ele.label }}</div>
                <Input :class="{'is-exceed':getValdate(ele)}" @blur="isEmpty(ele.keyLabel)"
                       @input="isEmpty(ele.keyLabel)" type="text" :id="ele.keyLabel+'input'"
                       :placeholder="$t('seo.genContent.placeholder_content')"
                       v-model="inputMap[ele.keyLabel]" :maxlength="ele.inputMaximumCharacters"
                       show-word-limit></Input>
                <p style="color:#F56C6C;" v-show='getValdate(ele)'>{{ $t('seo.genContent.tip_contentOverLength') }}</p>
                <p :id="ele.keyLabel" style="color:#F56C6C;display: none">{{ $t('seo.genContent.tip_contentEmpty') }}</p>
            </div>
        </div>
        <Row :gutter="10">
            <Col :span="num">
                <div class="form_item">
                    <div class="title">{{ $t('seo.genContent.variantCount') }}</div>
                    <Select v-model="params.variants"
                            :placeholder="$t('crm.Modal.tip_select')"
                            filterable>
                        <Option v-for="item in variants"
                                :key="item"
                                :label="item + $t('seo.genContent.unit')"
                                :value="item"></Option>
                    </Select>
                </div>
            </Col>
            <Col :span="num">
                <div class="form_item">
                    <div class="title">{{ $t('seo.genContent.creativity') }}</div>
                    <Select v-model="params.creativity"
                            :placeholder="$t('crm.Modal.tip_select')"
                            filterable>
                        <Option v-for="item in creativity"
                                :key="item.value"
                                :label="$lang === 'zh-CN' ? item.cn : item.value"
                                :value="item.value"></Option>
                    </Select>
                </div>
            </Col>

            <Col :span="24">
                <div class="form_item">
                    <Button class="getcontent" :class="params.sence=='60a40cf5da9d76000ccc2828'?'piwik_wa_seoGetContent1':'piwik_wa_seoGetContent2'" :loading="isLoad" @click="setContent">{{ $t('seo.genContent.generateContent') }}</Button>
                </div>
            </Col>
            <Col :span="24">
                <div class="genContentTips">
                    <p class="genContentTips-title">{{ $t('seo.genContent.title_genContentTips') }}</p>
                    <p v-html="$t('seo.genContent.genContentTips')"
                       class="genContentTips-content"></p>
                    <!-- <p>{{ $t('seo.genContent.attention') }}</p>
                    <p>{{ $t('seo.genContent.generateContentTip1') }}</p>
                    <p>{{ $t('seo.genContent.generateContentTip2') }}</p>
                    <a href="http://leadscloud.helpdocsonline.com/seo-2" target="_blank">{{ $t('seo.genContent.tip_viewDetailWithHelpCenter') }}</a> -->
                </div>
            </Col>
        </Row>
    </div>
</template>

<script>
    import Vue from 'vue';
    import { mapState } from 'vuex';
    import { getTopicData, getContentBySeo, SEOGenOptions } from '@/api/seo';

    export default {
        props: {
            // 当前是否正在请求seo内容
            isGettingSeo: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                num: 12,
                isLoad: false,
                params: {
                    language: '607adac76f8fe5000c1e636d',
                    tones: '60572a639bdd4272b8fe358b',
                    sence: '60a40cf5da9d76000ccc2828',
                    variants: '1',
                    creativity: 'default'
                },
                inputMap: {},
                language: SEOGenOptions.language.data,
                tones: SEOGenOptions.tones.data,
                sence: SEOGenOptions.sence,
                variants: SEOGenOptions.variants,
                creativity: SEOGenOptions.creativity,
                contextInputs: SEOGenOptions.sence[0].contextInputs,
                defaultProps: {
                    children: 'children',
                    name: 'name',
                    isLeaf: (data, node) => {
                        return node.level > 1;
                    }
                // disabled: (data, node) => {
                //     console.log(node);
                //     return node.level == 1 && node.childNodes.length==0;
                // }
                }
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId'
            }),
            $lang() {
                return Vue.config.lang;
            }
        },
        methods: {
            // 渲染结点
            renderContent(h, { data }) {
                return (
                    <div style="width:100%; overflow: hidden; padding-right:20px;">
                        <TooltipAuto placement="top"
                                     content={data.name}>
                        </TooltipAuto>
                        { data.longTailStr
                            ? <TooltipAuto
                                     placement="top"
                                     content={data.longTailStr}
                                     style="margin-left: 15px;">
                            </TooltipAuto>
                            : '' }
                    </div>
                );
            },
            async checkedChange(data, checked) {
            // const node = this.$refs.tree[0].getNode(data);
            // if (checked) {
            //     node.expand();
            // }
            },
            getKey() {
                // eslint-disable-next-line prefer-const
                let value = this.$refs.tree[0].getCheckedNodes(false, false).map((ele) => ele.name + (ele.longTailStr ? `，${ele.longTailStr}` : ''));
                // console.log(value);
                if (value.length > 0) {
                    this.contextInputs.forEach(ele => {
                        // eslint-disable-next-line eqeqeq
                        if (ele.inputType == 'textarea') {
                            // console.log(this.inputMap);
                            if (this.inputMap[ele.keyLabel].length > 0) {
                                // eslint-disable-next-line prefer-template
                                // 判断当前内容结尾有没有，
                                const currentValue = this.inputMap[ele.keyLabel];
                                let str = '';
                                if (currentValue.charAt(currentValue.length - 1) === ',' || currentValue.charAt(currentValue.length - 1) === '，') {
                                    console.log('有逗号');
                                    str = this.inputMap[ele.keyLabel] + value.join(',');
                                } else {
                                    console.log('没有逗号');
                                    str = `${this.inputMap[ele.keyLabel]},${value.join(',')}`;
                                }
                                this.inputMap[ele.keyLabel] = str;
                            } else {
                                this.inputMap[ele.keyLabel] = value.join(',');
                            }
                            this.isEmpty(ele.keyLabel);
                        }
                    });
                    this.closePop();
                }
            },
            closePop() {
                this.$refs.popdom[0].doClose();
                this.$refs.tree[0].setCheckedKeys([]);
            },
            getKeyWordsList(id = -1) {
                return getTopicData({ parent_id: id });
            },
            async loadNode(node, resolve) {
                // console.log(node,'ss');
                if (node.level === 0) {
                    // 等于0就是初始化
                    const { data } = await this.getKeyWordsList();
                    return resolve(data);
                }
                if (node.level >= 1) {
                    const { data } = await this.getKeyWordsList(node.data.id);

                    // 长尾关键词处理
                    if (Array.isArray(data) && data.length) {
                        data.forEach(item => {
                            if (item.long_tail) {
                                try {
                                    const longTailArr = JSON.parse(item.long_tail);
                                    if (Array.isArray(longTailArr) && longTailArr.length) {
                                        item.longTailStr = longTailArr.join(',');
                                    }
                                } catch (e) {
                                }
                            }
                        });
                    }

                    return resolve(data);
                }
            },
            initKeyLable() {
                const res = this.sence;
                //    console.log(res);
                this.contextInputs = res[0].contextInputs;
                const obj = {};
                res[0].contextInputs.forEach(ele => {
                    obj[ele.keyLabel] = '';
                });
                this.inputMap = obj;
            //    console.log(this.inputMap);
            },
            setContent() {
                //  生成内容接口
                this.isLoad = true;
                // eslint-disable-next-line prefer-const
                let valdiares = this.contextInputs.filter(ele => {
                    if (!this.inputMap[ele.keyLabel]) {
                        return ele;
                    } else if (this.inputMap[ele.keyLabel].length > ele.inputMaximumCharacters) {
                        return ele;
                    }
                });
                if (valdiares.length > 0) {
                    this.isLoad = false;
                    if (!this.inputMap[valdiares[0].keyLabel]) {
                        this.$Message.error(`[${valdiares[0].label}] ${this.$t('crm.Modal.error_canNotBeEmpty')}`);
                        this.isEmpty(valdiares[0].keyLabel);
                        return false;
                    }
                    if (this.inputMap[valdiares[0].keyLabel].length > valdiares[0].inputMaximumCharacters) {
                        this.$Message.error(`[${valdiares[0].label}] ${this.$t('seo.genContent.error_overLength')}`);
                        return false;
                    }
                }
                // 正在请求seo内容
                this.$emit('update:isGettingSeo', true);
                const data = {
                    languageId: this.params.language,
                    orgId: this.enterpriseId,
                    toneId: this.params.tones,
                    useCaseId: this.params.sence,
                    inputContexts: this.inputMap,
                    userId: this.userId,
                    format: 'text',
                    creativityLevel: this.params.creativity,
                    variations: this.params.variants
                };
                const tempSence = this.sence.find(item => item._id === data.useCaseId);
                if (['博客标题和大纲', '博客章节精写'].includes(tempSence.cn)) {
                    data.format = 'html';
                }
                getContentBySeo(data).then(res => {
                    // console.log(res, 'res');
                    // eslint-disable-next-line eqeqeq
                    if (res.code == 1) {
                        if (Array.isArray(res.data) && res.data.length) {
                            res.data.forEach((item, index) => {
                                if (data.format === 'html' && index === 0 && Object.keys(this.inputMap).length === 1) {
                                    // 过滤掉返回的tip内容等
                                    if (typeof item == 'object') {
                                        const tipContent = item.text.indexOf('<p style=\'color: grey\'>');
                                        item.text = item.text.replace(item.text.substring(tipContent), '');
                                    } else if (typeof item == 'string') {
                                        const tipContent = item.indexOf('<p style=\'color: grey\'>');
                                        item = item.replace(item.substring(tipContent), '');
                                    }
                                }
                                if (typeof item == 'object') {
                                    this.$emit('insertText', `${item.text}\n`, tempSence.cn); // \n:换行操作
                                } else if (typeof item == 'string') {
                                    this.$emit('insertText', `${item}\n`, tempSence.cn); // \n:换行操作
                                }
                            });
                        }
                        // seo内容请求结束
                        this.$emit('update:isGettingSeo', false);
                    } else {
                        this.$Message.error(this.$t('seo.genContent.error_genContent'));
                    }
                    this.isLoad = false;
                }).catch(e => {
                    this.$Message.error(this.$t('seo.genContent.error_genContent'));
                    this.isLoad = false;
                    // seo内容请求结束
                    this.$emit('update:isGettingSeo', false);
                });
            },
            getValdate(ele) {
                if (this.inputMap[ele.keyLabel]) {
                    return this.inputMap[ele.keyLabel].length > ele.inputMaximumCharacters;
                }
            },
            isEmpty(id) {
                if (this.inputMap[id].length === 0) {
                    document.getElementById(id).style.display = 'block';
                    document.getElementById(`${id}input`).classList.add('is-error');
                } else {
                    document.getElementById(id).style.display = 'none';
                    document.getElementById(`${id}input`).classList.remove('is-error');
                }
            }
        },
        mounted() {
            console.log(this.$route);
            this.initKeyLable();
        },
        watch: {
            'params.sence'(v) {
                console.log(v);
                // eslint-disable-next-line eqeqeq
                const res = this.sence.filter(ele => ele._id == v);
                this.contextInputs = res[0].contextInputs;
                // eslint-disable-next-line prefer-const
                let obj = {};
                this.inputMap = {};
                res[0].contextInputs.forEach(ele => {
                    obj[ele.keyLabel] = '';
                });
                this.params.variants = res[0].variants;
                this.inputMap = obj;
            }
        }
    };
</script>

<style scoped lang="less">
    .seo-gen-content {
        background: #fff;
        /* width: 438px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between; */
        padding: 30px 15px 0;
        color: rgba(0, 0, 0, 0.8);

        .nav_title {
            line-height: 22px;
            font-size: 14px;
            margin-bottom: 20px;
            font-weight: 700;
        }
    }

    .form_item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        margin-bottom: 20px;

        .title,
        /deep/ .el-popover__reference {
            font-size: 12px;
            line-height: 18px;
            margin-bottom: 10px;
        }

        p, a {
            line-height: 18px;
            font-size: 12px;
            margin: 0;
            padding: 0;
        }

        a {
            color: #4285f2;
            margin-top: 10px;
        }
    }

    ._w100,
    .el-select {
        width: 100%;
    }

    /deep/ .el-input__inner {
        height: 34px;
        line-height: 34px;
    }

    /deep/ .el-input__icon {
        line-height: 34px;
    }

    /deep/ .el-textarea__inner {
        height: 68px;
        padding: 10px;
        box-sizing: border-box;
    }

    .getcontent {
        height: 32px;
        background: #7b98b6;
        border: none;
        color: #fff;
        font-size: 12px;
        padding: 10px;

        &:hover, &:active, &:focus {
            border-color: unset;
        }
    }

    @media screen and (max-width: 1366px) {
        .el-col-12 {
            width: 100%;
        }
    }


    .form_item /deep/ .is-error {
        border-color: #F56C6C;
    }

    /deep/ .el-checkbox__input.is-checked .el-checkbox__inner, /deep/ .el-checkbox__input.is-indeterminate .el-checkbox__inner {
        background-color: #4285f4;

    }

    /deep/ .el-checkbox__inner::after, /deep/ .el-checkbox__input.is-indeterminate .el-checkbox__inner::before {
        border-color: #fff;
    }

    /deep/ .el-checkbox__input.is-indeterminate .el-checkbox__inner::before {
        background-color: #fff;
    }

    .genContentTips {
        white-space: pre-wrap;
        
        &-title {
            color: rgba(0, 0, 0, 0.80);
            font-size: 12px;
            font-weight: 600;
            line-height: 18px;
            margin-bottom: 8px;
        }

        &-content {
            color: rgba(0, 0, 0, 0.60);
            font-size: 12px;
            font-weight: 400;
            line-height: 18px;

            /deep/ a {
                color: #3B78DE;

                &:hover {
                    color: #2D63BC;
                }
            }
        }
    }
</style>

<style lang="less">
    .tree-container {
        height: 300px;
        width: 400px;
        overflow-y: auto;

        &::-webkit-scrollbar {
            display: none;
            /* Chrome Safari */
        }

        .el-tree-node__content {
            height: auto;
            align-items: baseline;
        }
    }
</style>
