<template>
    <div v-loading="loading"
         class="createGenArtTask">
        <!-- header -->
        <div class="createGenArtTask-header">
            <!-- 标题 -->
            <p class="createGenArtTask-title">{{ $t('autoGenArticle.newAutoGenArtTask') }}</p>

            <!-- 剩余文章数 -->
            <div class="createGenArtTask-balanceArtNum">
                <span>{{ $t('autoGenArticle.balanceArtNum') }}： <i>{{ balanceArtNum }}</i> </span>
            </div>
        </div>

        <!-- 表单 -->
        <Form :model="infoForm"
              :rules="rules"
              ref="infoForm"
              label-position="left"
              label-width="120px"
              class="createGenArtTask-form">
            <!-- 基础信息 -->
            <div class="createGenArtTask-baseInfo">
                <!-- 标题 -->
                <div class="createGenArtTask-baseInfo-title">
                    <p>{{ $t('autoGenArticle.baseInfo') }}</p>
                </div>

                <!-- 任务名称 -->
                <FormItem prop="taskName"
                          :label="$t('autoGenArticle.taskName')"
                          required
                          class="createGenArtTask-formItem-taskName">
                    <Input v-model.trim="infoForm.taskName"
                           maxlength="100"
                           show-word-limit
                           :placeholder="$t('autoGenArticle.placeholder_taskName')"></Input>
                </FormItem>

                <!-- 高级设置 -->
                <div @click="toggleShowAdvanceSet"
                    class="createGenArtTask-advanceSet">
                    <span>{{ $t('autoGenArticle.advanceSet') }}</span>
                    <Icon custom="custom custom-menu-arrow"
                          color="#7B98B6"
                          :class="{ 'createGenArtTask-advanceSet-icon': true, 'createGenArtTask-advanceSet-icon__fold': showAdvanceSet }"></Icon>
                </div>

                <!-- 模型 -->
                <FormItem v-show="showAdvanceSet"
                          prop="model"
                          :label="$t('autoGenArticle.model')"
                          required>
                    <Select v-model="infoForm.model"
                            :placeholder="$t('autoGenArticle.model')"
                            style="width: 290px;">
                        <Option v-for="item in modelOptions"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label">{{ item.label }}</Option>
                    </Select>
                </FormItem>

                <!-- 文章字符上限 -->
                <FormItem v-show="showAdvanceSet"
                          prop="maxContentLength"
                          :label="$t('autoGenArticle.maxContentLength')"
                          required>
                    <Slider v-model="infoForm.maxContentLength"
                            :min="0"
                            :max="2048"
                            show-input
                            ref="lengthSlider"
                            class="createGenArtTask-slider"></Slider>

                    <!-- 提示 -->
                    <div class="createGenArtTask-formItem-tip"
                         style="margin-top: 1px;">
                        <Icon custom="custom custom-exclamation"></Icon>{{ $t('autoGenArticle.tip_maxContentLength') }}
                    </div>
                </FormItem>

                <!-- 内容随机性 -->
                <FormItem v-show="showAdvanceSet"
                          prop="contentRandomness"
                          :label="$t('autoGenArticle.contentRandomness')"
                          required>
                    <Slider v-model="infoForm.contentRandomness"
                            :min="0"
                            :max="1"
                            :step="0.01"
                            show-input
                            ref="randomnessSlider"
                            class="createGenArtTask-slider"></Slider>

                    <!-- 提示 -->
                    <div class="createGenArtTask-formItem-tip"
                         style="margin-top: 1px;">
                        <Icon custom="custom custom-exclamation"></Icon>{{ $t('autoGenArticle.tip_contentRandomness') }}
                    </div>
                </FormItem>
            </div>

            <!-- 文章生成条件信息 -->
            <div class="createGenArtTask-genArtConInfo">
                <!-- 标题 -->
                <div class="createGenArtTask-genArtConInfo-title">
                    <p>{{ $t('autoGenArticle.genArtConInfo') }}</p>
                </div>

                <!-- 网站 -->
                <FormItem prop="siteId"
                          :label="$t('autoGenArticle.website')"
                          required>
                    <Select v-model="infoForm.siteId"
                            filterable
                            :placeholder="$t('seo.detailSelect.pleaseText')">
                        <Option v-for="item in siteList"
                                :key="`${item.site_id}-${item.site_type}`"
                                :label="`[${$t(`seo.detailSelect.siteType_${item.site_type}`)}]${item.site_url}`"
                                :value="`${item.site_id}-${item.site_type}`"></Option>
                    </Select>

                    <!-- 提示 -->
                    <div class="createGenArtTask-formItem-tip">{{ $t('autoGenArticle.tip_website') }}</div>
                </FormItem>

                <!-- 文章类型 -->
                <FormItem prop="artType"
                          :label="$t('autoGenArticle.artType')"
                          required>
                    <Select v-model="infoForm.artType"
                            filterable>
                        <Option v-for="item in artTypeOptions"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label">{{ item.label }}</Option>
                    </Select>
                </FormItem>

                <!-- 语言 -->
                <FormItem prop="language"
                          :label="$t('autoGenArticle.language')"
                          required>
                    <Select v-model="infoForm.language"
                            :placeholder="$t('crm.Modal.tip_select')"
                            filterable
                            style="width: 290px;">
                        <Option v-for="item in languageOptions"
                                :key="item._id"
                                :label="$lang === 'zh-CN' ? item.cn : item.slug"
                                :value="item.cn"></Option>
                    </Select>
                </FormItem>

                <!-- 语气 -->
                <FormItem prop="tones"
                          :label="$t('autoGenArticle.tones')"
                          required>
                    <Select v-model="infoForm.tones"
                            :placeholder="$t('crm.Modal.tip_select')"
                            filterable
                            style="width: 290px;">
                        <Option v-for="item in tonesOptions"
                                :key="item._id"
                                :label="$lang === 'zh-CN' ? item.cn : item.slug"
                                :value="item.cn"></Option>
                    </Select>
                </FormItem>

                <!-- 关键词 -->
                <FormItem prop="keyword"
                          :label="$t('autoGenArticle.keyword')"
                          required>
                    <!-- 按钮 -->
                    <div class="createGenArtTask-keyword-btns">
                        <!-- 批量删除重复关键词 -->
                        <span @click="handleUniqKeyword"
                              class="createGenArtTask-keyword-btn">{{ $t('autoGenArticle.batchUniqKeyword') }}</span>

                        <!-- 模板导入 -->
                        <span @click="handleTemplateImport"
                              class="createGenArtTask-keyword-btn">{{ $t('autoGenArticle.templateImport') }}</span>

                        <!-- 添加主题词 -->
                        <Poptip placement="bottom-start"
                                trigger="click"
                                popper-class="topic-popper"
                                ref="popdom">
                            <span slot="reference"
                                  ref="addKeybtn"
                                  class="createGenArtTask-keyword-btn">{{ $t('autoGenArticle.addSubjectWord') }}</span>

                            <div class="topic-popper-content">
                                <Input v-model="topicFilterVal"
                                       :placeholder="$t('tableFilter.tip_inputKeyWords')"
                                       :clearable="true"
                                       @input="filterTopicTree(topicFilterVal)"
                                       class="topic-popper-input">
                                </Input>

                                <Tree show-checkbox
                                      node-key='id'
                                      :props="defaultProps"
                                      :lazy="true"
                                      :default-expand-all="true"
                                      :load="loadNode"
                                      ref="tree"
                                      :render-content="renderContent"
                                      :filter-node-method="filterNode"
                                      class="topic-popper-tree">
                                    <span slot-scope="{ data }">{{ data.name }}</span>
                                </Tree>
                            </div>
                            <div class="text-right">
                                <Button type="minor" size="small" @click="closePop">{{ $t('cancel') }}</Button>
                                <Button type="success" size="small" @click="handleAddSubjectWord">{{ $t('confirm') }}</Button>
                            </div>
                        </Poptip>
                    </div>

                    <!-- 文本框 -->
                    <Input v-model="infoForm.keyword"
                           type="textarea"
                           :rows="5"
                           :placeholder="$t('autoGenArticle.placeholder_keyword')"
                           maxlength="2000"
                           show-word-limit
                           @paste.native.capture.prevent="handlePasteKeywords"></Input>

                    <!-- 去重提示 -->
                </FormItem>

                <!-- 生成文章数量 -->
                <FormItem prop="genArtNum"
                          :label="$t('autoGenArticle.genArtNum')"
                          required>
                    <div style="margin-top: -4px;">{{ $t('autoGenArticle.showGenArtNum1') }}&nbsp;&nbsp;
                        <InputNumber v-model="infoForm.genArtNum"
                                    controls-position="right"
                                    :min="1"
                                    :max="5"
                                    :step-strictly="true"
                                    style="width: 80px;"></InputNumber>&nbsp;&nbsp;{{ $t('autoGenArticle.showGenArtNum2') }}
                    </div>
                </FormItem>
            </div>
        </Form>

        <!-- 底部按钮 -->
        <div class="createGenArtTask-footer">
            <!-- 取消 -->
            <Button @click="handleCancel"
                    class="btn-ghost">{{ $t('cancel') }}</Button>

            <!-- 存草稿 -->
            <Button :loading="loading"
                    @click="handleSaveDraft"
                    class="btn-ghost">{{ $t('autoGenArticle.saveDraft') }}</Button>

            <!-- 确定 -->
            <Button type="primary"
                    :loading="loading"
                    @click="handleConfirm">{{ $t('confirm') }}</Button>
        </div>

        <ImportKeywords v-show="visible_templateImport"
                        :visible.sync="visible_templateImport"
                        @importSuccess="handleImportSuccess"></ImportKeywords>
    </div>
</template>

<script>
    import Vue from 'vue';
    import { mapState } from 'vuex';
    import { getAllSiteList, saveGenArtTask, saveGenArtTaskDraft, SEOGenOptions, getGenArtTaskDetailData, getTopicData } from '@/api/seo';
    import ImportKeywords from '@/views/autoGenArticle/modal/importKeywords.vue';

    export default {
        name: 'newTask',
        components: {
            ImportKeywords
        },
        props: {
            currTaskData: {
                type: Object,
                default() {
                    return {};
                }
            },
            balance: {
                type: Number,
                default: 0
            },
            balanceArtNum: {
                type: Number,
                default: 0
            },
            allowCreateTask: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId'
            }),
            $lang() {
                return Vue.config.lang;
            },
            // 当前选中的网站
            selectedSite() {
                if (this.infoForm.siteId) {
                    return this.siteList.find(item => `${item.site_id}-${item.site_type}` === this.infoForm.siteId);
                }

                return null;
            }
        },
        data() {
            return {
                /* 全局 */
                loading: false,

                /* 基础信息 */
                infoForm: {
                    taskName: '',
                    model: 'GPT 3.5',
                    maxContentLength: 1024,
                    contentRandomness: 0.7,
                    siteId: '',
                    artType: '',
                    language: '英文',
                    tones: '令人信服',
                    keyword: '',
                    genArtNum: 1
                },
                rules: {
                    taskName: [
                        { required: true, message: this.$t('autoGenArticle.error_emptyTaskName'), trigger: ['blur', 'change'] }
                    ],
                    maxContentLength: [
                        { required: true, message: this.$t('autoGenArticle.error_emptyMaxContentLength'), trigger: ['blur', 'change'] }
                    ],
                    contentRandomness: [
                        { required: true, message: this.$t('autoGenArticle.error_emptyContentRandomness'), trigger: ['blur', 'change'] }
                    ],
                    siteId: [
                        { required: true, message: this.$t('autoGenArticle.error_emptyWebsite'), trigger: 'blur' }
                    ],
                    artType: [
                        { required: true, message: this.$t('autoGenArticle.error_emptyArtType'), trigger: 'blur' }
                    ],
                    keyword: [
                        { required: true, message: this.$t('autoGenArticle.error_emptyKeyword'), trigger: ['blur', 'change'] }
                    ],
                    genArtNum: [
                        { required: true, message: this.$t('autoGenArticle.error_emptyGenArtNum'), trigger: ['blur', 'change'] }
                    ]
                    // 其他的大部分是选项且不可取消勾选, 没必要写必填校验
                },
                showAdvanceSet: false,
                modelOptions: SEOGenOptions.model,
                languageOptions: SEOGenOptions.language.data,
                tonesOptions: SEOGenOptions.tones.data,
                artTypeOptions: [],

                /* 文章生成条件信息 */
                siteList: [],

                /* 模板导入 */
                visible_templateImport: false,

                /* 添加主题词 */
                defaultProps: {
                    children: 'children',
                    name: 'name',
                    isLeaf: (data, node) => {
                        return node.level > 1;
                    }
                },
                topicFilterVal: '',
                filterNodeIds: []
            };
        },
        methods: {
            /* 全局 */
            // 回填要编辑的任务数据
            backFillInfoData() {
                this.getTaskInfo();
                this.showAdvanceSet = true;
            },
            // 获取任务详情数据
            getTaskInfo() {
                this.loading = true;
                // 清空旧数据
                this.taskInfo = {};
                getGenArtTaskDetailData({
                    id: this.currTaskData.id
                }).then(res => {
                    if (res.code === '1' && res.data) {
                        this.taskInfo = this.handleTaskInfo(res.data);
                        this.infoForm = JSON.parse(JSON.stringify(this.taskInfo));
                    } else {
                        // 请求失败

                        this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    }
                    this.loading = false;
                }).catch(e => {
                    // 请求失败

                    console.error(e);
                    this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    this.loading = false;
                });
            },
            // 格式化任务数据
            handleTaskInfo(obj) {
                const {
                    id,
                    name: taskName,
                    site_type,
                    site_id,
                    post_num: genArtNum,
                    post_max_size: maxContentLength,
                    randomness: contentRandomness,
                    model,
                    tones,
                    language,
                    keyword
                } = obj;

                return {
                    id,
                    taskName,
                    // 选中 AMP 站, 返回"新闻", 营销站&第三方建站系统, 返回"文章"
                    artType: `${site_type}` === '1' ? '1' : '2',
                    siteId: `${site_id}-${site_type}`,
                    genArtNum,
                    maxContentLength,
                    contentRandomness,
                    model,
                    tones,
                    language,
                    keyword
                };
            },
            // 清空旧数据
            clearInfo() {
                this.infoForm = {
                    taskName: '',
                    model: 'GPT 3.5',
                    maxContentLength: 1024,
                    contentRandomness: 0.7,
                    siteId: '',
                    artType: '',
                    language: '英文',
                    tones: '令人信服',
                    keyword: '',
                    genArtNum: 1
                };
                this.$refs.infoForm.resetFields();
                this.loading = false;
                this.artTypeOptions = [];
                this.showAdvanceSet = false;
            },

            /* 基础信息 */
            // 切换"高级设置"显隐
            toggleShowAdvanceSet() {
                this.showAdvanceSet = !this.showAdvanceSet;
            },

            /* 文章生成条件信息 */
            getAllSites() {
                this.siteList = [];
                getAllSiteList({
                    page: 1,
                    page_size: 9999
                }).then(res => {
                    if (res.code === '1' && Array.isArray(res.data)) {
                        this.siteList = res.data;
                        if (!this.infoForm.id && this.siteList.length) {
                            this.infoForm.siteId = `${this.siteList[0].site_id}-${this.siteList[0].site_type}`;
                        }
                    } else {
                        this.$Message.warning(res.data.msg);
                    }
                }).catch(e => {
                    this.$Message.error(this.$t('seo.detailSelect.errorMsg'));
                });
            },
            // 批量删除重复关键词
            handleUniqKeyword() {
                this.infoForm.keyword = this.removeRepeatKeyword(this.infoForm.keyword).join(',');
            },
            // 一键去重
            removeRepeatKeyword(val, uniq = true) {
                // 先去掉所有换行符, 随后去掉逗号前后的空白(空格, 换行, 制表符等), 再以逗号分割字符串为数组
                const keywordArr = val.replace(/[\r\n]+/g, '').replace(/\s*,\s*/g, ',').split(',').filter(item => !(!item || item === ''));
                // 是否去重
                return uniq ? [...new Set(keywordArr)] : keywordArr;
            },
            // 模板导入
            handleTemplateImport() {
                this.visible_templateImport = true;
            },
            // 处理导入结果
            handleImportSuccess(keywordArr) {
                this.mergeKeyword(keywordArr);
            },
            // 合并关键词
            mergeKeyword(keywordArr) {
                const oldArr = this.removeRepeatKeyword(this.infoForm.keyword, false);
                this.infoForm.keyword = oldArr.concat(keywordArr).filter(item => !(!item || item === '')).join(',');
            },
            // 处理粘贴的关键词
            handlePasteKeywords(e) {
                // 获取要粘贴的文本
                let text;
                if (window.clipboardData && window.clipboardData.getData) {
                    // IE
                    text = window.clipboardData.getData('text');
                } else {
                    text = (e.originalEvent || e).clipboardData.getData('text/plain');
                }

                /* 文本处理 */
                // 将;；、，,统一替换为英文逗号
                text = text.replace(/[，；、;]/g, ',');
                // 替换换行符为英文逗号
                text = text.replace(/[\r\n]+/g, ',');
                // 去掉中间无意义的部分
                const textArr = text.split(',').filter(item => !(!item || item === ''));
                text = textArr.join(',');

                // 将处理后的文本插入到输入框中
                const input = e.target;
                const start = input.selectionStart;
                const end = input.selectionEnd;
                const value = input.value;
                let newValue = value.substring(0, start) + text + value.substring(end);
                // 超出字符限制提示语
                if (newValue.length > 2000) {
                    newValue = newValue.slice(0, 2000);
                    this.$Message({
                        message: this.$t('autoGenArticle.tip_keywordOverLength'),
                        type: 'warning',
                        duration: 3000
                    });
                }
                input.value = newValue;
                input.setSelectionRange(start + text.length, start + text.length);

                // 更新数据
                this.infoForm.keyword = newValue;
            },

            /* 添加主题词 */
            // 渲染结点
            renderContent(h, { data }) {
                return (
                    <div style="width:100%; overflow: hidden; padding-right:20px;">
                        <TooltipAuto placement="top"
                                     content={data.name}>
                        </TooltipAuto>
                    </div>
                );
            },
            // 过滤节点
            filterNode(value, data, node) {
                // 没有筛选文本, 直接显示全部
                if (!value) {
                    return true;
                }

                // 如果匹配文字成功, 显示节点
                if (data.name.indexOf(value) !== -1) {
                    this.filterNodeIds.push(data.id);
                    return true;
                }
                
                // 如果节点的祖先树里包括已匹配成功的节点, 则显示节点(但不纳入文字匹配成功统计数组中)
                if (node.parent && node.parent.data && this.filterNodeIds.includes(node.parent.data.id)) {
                    return true;
                }

                // 其他, 默认为 false
                return false;
            },
            // 执行过滤
            filterTopicTree(val) {
                this.filterNodeIds = [];
                this.$refs.tree.filter(val);
            },
            // tree 懒加载
            async loadNode(node, resolve) {
                if (node.level === 0) {
                    // 等于0就是初始化
                    const { data } = await this.getKeyWordsList();
                    return resolve(data);
                }
                if (node.level >= 1) {
                    const { data } = await this.getKeyWordsList(node.data.id);
                    return resolve(data);
                }
            },
            // 请求主题/子主题
            getKeyWordsList(id = -1) {
                return getTopicData({ parent_id: id });
            },
            // 关闭 Poptip
            closePop() {
                this.$refs.popdom.doClose();
                this.$refs.tree.setCheckedKeys([]);
            },
            // 添加主题词
            handleAddSubjectWord() {
                const arr = this.$refs.tree.getCheckedNodes(false, false).map(item => item.name);
                if (arr.length > 0) {
                    this.mergeKeyword(arr)
                    this.closePop();
                }
            },

            /* footer */
            // 取消
            handleCancel() {
                this.$emit('goBack');
            },
            // 存草稿
            handleSaveDraft() {
                this.$refs.infoForm.validate((valid) => {
                    if (valid) {
                        // 关键词去重
                        const keywordArr = this.removeRepeatKeyword(this.infoForm.keyword, false);
                        const uniqKeywordArr = [...new Set(keywordArr)];
                        if (keywordArr.length !== uniqKeywordArr.length) {
                            this.$Message.error(this.$t('autoGenArticle.error_repeatKeyword'));
                            return;
                        }
                        this.infoForm.keyword = uniqKeywordArr.join(',');

                        // 通过校验, 保存
                        this.saveDraft();
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.noEmptyWarning'));
                    }
                });
            },
            saveDraft() {
                this.loading = true;
                saveGenArtTaskDraft({
                    id: this.infoForm.id, // 任务ID （如果直接新建则不传id 如果从草稿点击编辑任务后确定则传任务id）
                    userId: this.userId,
                    orgId: this.enterpriseId,
                    name: this.infoForm.taskName, // 任务名称
                    siteType: this.selectedSite.site_type, // 网站类型 1amp 2营销站 3第三方
                    siteId: this.infoForm.siteId.split('-')[0], // 网站ID
                    siteUrl: this.selectedSite.site_url, // 网站地址
                    postNum: this.infoForm.genArtNum, // 文章数量 1~5
                    postMaxSize: this.infoForm.maxContentLength, // 文章最大字符数, 最大2048
                    randomness: this.infoForm.contentRandomness, // 内容随机性 0~1
                    model: this.infoForm.model, // 模型 GPT 3.5
                    tones: this.infoForm.tones, // 语气 默认 令人信服
                    language: this.infoForm.language, // 语言 默认 英语
                    keyword: this.infoForm.keyword // 关键词 用‘,’分割
                }).then(res => {
                    switch (res.code) {
                        case '1':
                            this.$emit('refreshTaskTable');
                            this.$emit('goBack');
                            this.$Message.success(this.$t('saveSuccess'));
                            break;
                        case '10004':
                            this.$Message.error(this.$t('autoGenArticle.error_othersOperatingTask'));
                            break;
                        default:
                            this.$Message.error(res.data.message || this.$t('saveFail'));
                    }
                    this.loading = false;
                }).catch(e => {
                    this.$Message.error(this.$t('saveFail'));
                    this.loading = false;
                });
            },
            // 确定
            handleConfirm() {
                this.$refs.infoForm.validate((valid) => {
                    if (valid) {
                        // 关键词去重
                        const keywordArr = this.removeRepeatKeyword(this.infoForm.keyword, false);
                        const uniqKeywordArr = [...new Set(keywordArr)];
                        if (keywordArr.length !== uniqKeywordArr.length) {
                            this.$Message.error(this.$t('autoGenArticle.error_repeatKeyword'));
                            return;
                        }
                        this.infoForm.keyword = uniqKeywordArr.join(',');

                        // 通过校验, 保存
                        this.saveTask();
                    } else {
                        this.$Message.error(this.$t('authority.userManagement.noEmptyWarning'));
                    }
                });
            },
            saveTask() {
                this.loading = true;
                saveGenArtTask({
                    id: this.infoForm.id, // 任务ID （如果直接新建则不传id 如果从草稿点击编辑任务后确定则传任务id）
                    userId: this.userId,
                    orgId: this.enterpriseId,
                    name: this.infoForm.taskName, // 任务名称
                    siteType: this.selectedSite.site_type, // 网站类型 1amp 2营销站 3第三方
                    siteId: this.infoForm.siteId.split('-')[0], // 网站ID
                    siteUrl: this.selectedSite.site_url, // 网站地址
                    postNum: this.infoForm.genArtNum, // 文章数量 1~5
                    postMaxSize: this.infoForm.maxContentLength, // 文章最大字符数, 最大2048
                    randomness: this.infoForm.contentRandomness, // 内容随机性 0~1
                    model: this.infoForm.model, // 模型 GPT 3.5
                    tones: this.infoForm.tones, // 语气 默认 令人信服
                    language: this.infoForm.language, // 语言 默认 英语
                    keyword: this.infoForm.keyword // 关键词 用‘,’分割
                }).then(res => {
                    switch (res.code) {
                        case '1':
                            this.$emit('refreshTaskTable');
                            this.$emit('goBack');
                            this.$Message.success(this.$t('saveSuccess'));
                            break;
                        case '10003':
                            // this.$Message.error(this.$t('autoGenArticle.error_noBalance'));
                            this.$Message.error(this.$t('autoGenArticle.error_noBalanceArtNum'));
                            break;
                        default:
                            this.$Message.error(res.data.message || this.$t('saveFail'));
                    }
                    this.loading = false;
                }).catch(e => {
                    this.$Message.error(this.$t('saveFail'));
                    this.loading = false;
                });
            }
        },
        mounted() {
            this.getAllSites();
            try {
                // 给 slider 的输入框开启 stepStrictly
                this.$refs.lengthSlider.$refs.input.$props.stepStrictly = true;
                this.$refs.randomnessSlider.$refs.input.$props.stepStrictly = true;
            } catch (e) {
            }
        },
        activated() {
            this.getAllSites();
        },
        deactivated() {
            this.clearInfo();
        },
        watch: {
            currTaskData: {
                handler(val) {
                    if (val && val.id) {
                        this.backFillInfoData();
                    }
                },
                immediate: true
            },
            'infoForm.siteId': {
                handler(val) {
                    if (val && val.split('-')[1]) {
                        const currSiteType = val.split('-')[1];
                        if (currSiteType === '1') {
                            // 选中 AMP 站, 返回"新闻"
                            this.infoForm.artType = '1';
                            this.artTypeOptions = [{
                                value: '1',
                                label: this.$t('autoGenArticle.news')
                            }];
                        } else {
                            // 营销站&第三方建站系统, 返回"文章"
                            this.infoForm.artType = '2';
                            this.artTypeOptions = [{
                                value: '2',
                                label: this.$t('autoGenArticle.article')
                            }];
                        }
                    }
                },
                immediate: true
            },
            'infoForm.keyword': {
                handler(val) {
                    if (val && val.length > 2000) {
                        this.infoForm.keyword = val.slice(0, 2000);
                    }
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .createGenArtTask {
        padding: 20px 30px 56px;

        &-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }

        &-title {
            color: rgba(0, 0, 0, 0.80);
            font-size: 16px;
            font-weight: 600;
            line-height: 24px;
        }

        &-balanceArtNum {
            span {
                margin-left:20px;
                font-size: 12px;
            }

            i {
                font-style: normal;
                color:#FF752A;
            }
        }

        &-baseInfo-title, &-genArtConInfo-title {
            color: rgba(0, 0, 0, 0.80);
            font-size: 14px;
            font-weight: 600;
            line-height: 24px;
            margin-bottom: 12px;
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
                max-width: 600px;
                color: rgba(0, 0, 0, 0.80);
                font-size: 14px;
                font-style: normal;
                font-weight: 400;
                line-height: 22px;
            }

            /deep/ .el-input, /deep/ .el-select {
                width: 100%;
            }

            /deep/ .createGenArtTask-formItem-taskName {
                .el-input__inner {
                    padding-right: 60px;
                }
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

        &-advanceSet {
            cursor: pointer;
            line-height: 24px;
            font-size: 14px;
            margin-bottom: 20px;

            > span {
                margin-right: 4px;
                color: #3B78DE;
            }
        }

        &-advanceSet-icon {
            transform-origin:center center;
            transition: transform 0.2s;
        }

        &-advanceSet-icon__fold {
            transform: rotate(180deg);
        }

        &-slider {
            width: 100%;
            margin-top: -7px;
        }

        &-keyword-btns {
            text-align: right;
        }

        &-keyword-btn {
            font-size: 14px;
            line-height: 24px;
            color: #3B78DE;
            cursor: pointer;

            &:hover {
                color: #2D63BC;
            }

            &:not(:last-child) {
                margin-right: 20px;
            }
        }

        &-footer {
            position: absolute;
            right: 60px;
            bottom: 20px;
        }
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
</style>

<style lang="less">
    .topic-popper {
        padding: 20px;

        &-input {
            margin-bottom: 10px;

            .el-input__validateIcon {
                display: none;
            }
        }

        &-tree {
            max-height: 300px;
            width: 400px;
            overflow-y: auto;
            margin: 10px 0;

            &::-webkit-scrollbar {
                display: none;
                /* Chrome Safari */
            }

            .el-tree-node__content {
                height: auto;
                align-items: baseline;
            }
        }
    }
</style>
