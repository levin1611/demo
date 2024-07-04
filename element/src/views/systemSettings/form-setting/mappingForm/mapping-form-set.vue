<template>
    <div class="mapping-form-set">
         <!-- loading -->
        <Spin v-if="spinShow"
                fix>
            <Icon type="ios-loading"
                    size=20
                    class="demo-spin-icon-load"></Icon>
        </Spin>
        <!-- 标题 -->
        <div class="binding-title">{{ $t('formSet.setMappingFormTitle') }}</div>
        <!-- 右侧按钮 -->
        <div class="right-btn">
            <!-- 返回 -->
            <Button
                    @click="goBack"
                    style="margin-right: 2px">{{ $t('formSet.backBtn') }}</Button>
            <!-- 保存 -->
            <Button type="primary" :loading="flag" class="piwik_save_third_code"
                    @click="saveClueForm">{{ $t('formSet.saveBtn') }}</Button>

        </div>

        <!-- </Row> -->

        <div class="form-tip">
            <div v-for="(item, index) in 6" :key="item">
                <p v-if="index === 2">
                    {{ $t(`formSet.formTip${index}`) }}
                    <span v-for="items in 2" :key="items">
                        {{$t(`formSet.formTip${index}_${items}`)}}
                    </span>
                </p>
                <p v-else>
                    {{ $t(`formSet.formTip${index}`) }}
                </p>
            </div>
        </div>
        <!-- 字段列表 -->
        <div class="form-name">
            <label class="form-lable">{{$t('formSet.formLable1')}}：</label>
            <Input v-model="formName" maxlength="60"
                :placeholder="$t('formSet.formPlaceholder')"
                @blur="formNameBlur"
                style="width: 300px"></Input>
        </div>
        <div class="form-body">
            <label class="form-lable">{{$t('formSet.formLable2')}}：</label>
            <div class="form-body-container">
                <!-- 字段匹配 -->
                <!-- 标题 -->
                <Row>
                    <Col :span="14">
                        <div class="form-icon-box">
                            <Icon custom="custom custom-icon_form"
                                color="#5177FB"
                                size="40"></Icon>
                        </div>
                        <div class="form-icon-text">{{ $t('formSet.setTip4') }}</div>
                    </Col>
                    <Col :span="6"
                         :offset="2">
                        <div class="form-icon-box">
                            <Icon custom="custom custom-main-logo"
                                color="#FD7003"
                                size="40"></Icon>
                        </div>
                        <div>
                            <Select v-model="selectwebFromId" @change="changWebFromId" :placeholder="$t('formSet.setPlaceholderTxt')" class="select-web-from">
                                <!-- option disabled 情况说明 -->
                                <!-- 1. 阿里字段为图片字段, 且 option 对应的线索字段不是文本域型字段 -->
                                <!-- 2. 当前未选中该选项, 且 option 对应的线索字段不是文本域型字段, 且不是"电话字段", 且未被其他字段选中 -->
                                <Option v-for="(item, index) in webFormList" :key="index" :value="item.id" :label="item.cname"></Option>
                            </Select></div>
                    </Col>
                </Row>
                <!-- 字段遍历 -->
                <div class="form-fields-container" :style="{maxHeight: cardHeight + 'px'}">
                    <!-- 标题 -->
                    <Row style="margin-bottom: 10px;">
                        <!-- 第三方表单字段 -->
                        <Col :span="14"
                             style="padding-right: 50px;display: flex; justify-content: space-around;">
                            <span>label</span>
                            <span>id(value)</span>
                        </Col>
                        <!-- 询盘云表单字段 -->
                        <Col :span="6"
                             :offset="2">
                            <span>{{ $t('formSet.formField') }}</span>
                        </Col>
                        <!-- 是否必填 -->
                        <Col :span="2">
                            <span>{{ $t('formSet.isRequired') }}</span>
                        </Col>
                    </Row>
                    <!-- 字段遍历 -->
                    <Row v-for="(item, index) in formList"
                        :key="index"
                        class="form-fields"
                        :class="{'error-tip' : errorList.includes(index)}">
                        <!-- 第三方表单字段 -->
                        <Col :span="14">
                            <Input v-model="item.label"
                                placeholder="label"
                                @input="handleInput('label',index)"
                                @blur="handleBlur('label',index)"
                            ></Input>
                            <Input v-model="item.value"
                                placeholder="id(value)"
                                @input="handleInput('value',index)"
                                @blur="handleBlur('value',index)"
                            ></Input>
                            <Icon size="15" class="custom custom-add-circle" @click="addFormListItem"></Icon>
                            <Icon custom="custom custom-reduce-circle" v-if="index > 0"
                                @click="removeFormListItem(index)"
                                size="15"></Icon>
                        </Col>
                        <!-- 中间按钮 -->
                        <Col :span="2" class="form-feild-icon">
                            <Icon custom="custom custom-form-set-arrow"
                                    color="#7B98B6"
                                    size="15"></Icon>
                        </Col>
                        <!-- 询盘云表单字段 -->
                        <Col :span="6">
                            <Select v-model="item.relation"
                                @change="handleFormFeild"
                                :disabled="!selectwebFromId"
                                filterable
                                clearable
                            >
                                <!-- option 被选中后不能再次选中-->
                                <Option v-for="(item, childIndex) in formFeildList"
                                    :key="childIndex"
                                    :value="item.key"
                                    :label="item.name"
                                ></Option>
                            </Select>
                        </Col>
                        <!-- 是否必填 -->
                        <Col :span="2">
                            <Checkbox v-model="item.required"
                                      style="line-height: 32px;"></Checkbox>
                        </Col>
                    </Row>
                </div>

            </div>
        </div>

        <!-- 选择生效规则 -->
        <div class="form-lable">{{ $t('formSet.title_selectRule') }}</div>
        <div style="white-space: break-spaces; font-size: 12px; color: rgba(0, 0, 0, .6)">{{ $t('formSet.tip_selectRule') }}</div>
        <Select v-model="ruleId"
                :clearable="true"
                :filterable="true"
                @change="getRuleDetail"
                style="margin: 20px 0;">
            <Option v-for="item in ruleList"
                    :key="item.ruleId"
                    :value="`${item.ruleId}`"
                    :label="item.ruleName"></Option>
        </Select>
        <!-- 生效规则详细内容 -->
        <div v-if="ruleObj.ruleName"
             class="margin-bottom-20">
            <!-- 名称 -->
            <div class="form-rule-disc">
                <span class="form-lable">{{ $t('formSet.label_ruleName') }}</span>
                <div>{{ ruleObj.ruleName }}</div>
            </div>
            <!-- 规则 -->
            <div class="form-rule-disc">
                <span class="form-lable">{{ $t('formSet.label_ruleLogicJoiner') }}</span>
                <div>{{ ruleObj.ruleOperator === 1 ? $t('formSet.satisfyAllConditions') : $t('formSet.satisfyOneConditions') }}</div>
            </div>
            <!-- 条件 -->
            <div class="form-rule-disc">
                <span class="form-lable">{{ $t('formSet.label_ruleCondition') }}</span>
                <div style="white-space: break-spaces;">{{ ruleObj.conditionShowList.join('\n') }}</div>
            </div>
        </div>
    </div>
</template>

<script>
    import { formSetting } from '@/api/systemSettings/form-setting';
    import { mapState } from 'vuex';

    export default {
        name: 'mapping-form-set',
        props: [
            'checkForm'
        ],
        data() {
            return {
                spinShow: true,
                formName: this.$t('formSet.formPlaceholder'),
                flag: false, /* 避免一个表单提交多次 */
                formList: [
                    {
                        label: '',
                        value: '',
                        relation: '',
                        required: false
                    }
                ],
                webFormList: [], // 网站埋点所有表单
                selectwebFromId: '', // 选中的网站埋点表单
                formFeildList: [], // 选中的网站埋点表单的字段
                isDeleteField: false, // 删除字段前确认 modal 的 visible
                errorList: [],
                hasSameRelationName: false, //  规则名是否重复

                // 生效规则相关
                ruleId: '',
                ruleList: [],
                ruleObj: {}
            };
        },
        filters: {
            filterCheckbox: function(val) {
                if (val === 1) {
                    return true;
                } else {
                    return false;
                }
            }
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userName: 'userName',
                userId: 'userId',
                window_height: 'window_height',
                lang: state => state.app.lang
            }),
            cardHeight() {
                return this.window_height - 464;
            }
        },
        mounted() {
        },
        created() {
        },
        methods: {
            // 返回表格页
            goBack() {
                this.$emit('update:checkForm', null);
                this.$emit('changeView', 'mappingFormList');
            },
            // 获取询盘云表单
            getWebFormList() {
                this.webFormList = [];
                formSetting.getFormTemplateSortedList({
                    billType: 1,
                    status: -1,
                    orgId: this.enterpriseId
                }).then(response => {
                    this.spinShow = false;
                    if (response.code === '1') {
                        this.webFormList = response.data.filter(item => item.cateType !== 1);
                        // prop 来的checkForm若有值则是编辑
                        if (this.checkForm && this.checkForm.sysTemplateId) {
                            this.formName = this.checkForm.relationName;
                            if (this.checkForm.isValidate) {
                                this.selectwebFromId = this.checkForm.sysTemplateId;
                            }
                            this.getFields(this.checkForm.sysTemplateId);
                        }
                    }
                });
            },
            // 获取对应网站表单的字段
            getFields(templateId, type) {
                this.formFeildList = [];
                this.$commonApi.getColumns({
                    orgId: this.enterpriseId,
                    templateId,
                    isShow: 1
                }).then(res => {
                    if (res.code === '1') {
                        const data = res.data;
                        const resultData = [];
                        for (const key in data) {
                            const obj = data[key];
                            obj.key = key;
                            obj.disabled = false;
                            resultData.push(obj);
                        }
                        this.formFeildList = resultData;
                        // getExternalRelation接口请求时间先于getFields，会导致filterformFeildList时formFeildList的length为0，因此在此调用
                    }
                    if (this.checkForm && !type) {
                        this.getExternalRelation();
                    }
                });
            },
            // 获取对应关系
            getExternalRelation() {
                this.formList = [];
                this.ruleId = '';
                formSetting.getExternalRelation({
                    id: this.checkForm.id
                }).then(response => {
                    if (response.code === '1') {
                        // 生效规则相关
                        this.ruleId = `${response.data.ruleId || ''}`;
                        if (this.ruleId) {
                            this.getRuleDetail();
                        }

                        // 关联关系相关
                        const list = response.data.list;
                        if (list.length) {
                            this.formList = list;
                            this.filterformFeildList();
                        }
                    }
                });
            },
            resetFormList() {
                if (this.formList.length) {
                    this.formList.forEach(item => {
                        item.relation = '';
                        item.required = false;
                    });
                }
            },
            // 增加表单字段
            addFormListItem() {
                this.formList.push({
                    label: '',
                    value: '',
                    relation: '',
                    required: false
                });
            },
            // 移除表单字段
            removeFormListItem(index) {
                this.formList.splice(index, 1);
                this.handleFormFeild();
            },
            // 切换网站表单
            changWebFromId(val) {
                this.resetFormList();
                this.getFields(val, 'change');
            },
            // 选中对应字段
            handleFormFeild() {
                // 限制多个字段对应询盘云一个字段，多选除外
                const formList = Array.from(new Set(this.formList.map(item => item.relation)));
                this.formFeildList.forEach(item => {
                    if (formList.includes(item.key)) {
                        item.disabled = true;
                    } else {
                        item.disabled = false;
                    }
                });
            },
            // 编辑时数据操作，判断之前的询盘云对应字段是否还存在，表单字段不可点击操作等
            filterformFeildList() {
                if (this.formFeildList.length) {
                    const formList = this.formList.map(item => item.relation);
                    const formFeildList = this.formFeildList.map(item => item.key);
                    this.formFeildList.forEach(item => {
                        if (formList.includes(item.key)) {
                            item.disabled = true;
                        } else {
                            item.disabled = false;
                        }
                    });
                    this.formList.forEach(item => {
                        if (!formFeildList.includes(item.relation)) {
                            item.relation = '';
                            item.required = false;
                        }
                    });
                } else {
                    this.formList.forEach(item => {
                        item.relation = '';
                        item.required = false;
                    });
                }
            },
            handleInput(key, index) {
                // this.formList[index][key] = this.formList[index][key].replace(/[^[\]\w_-]/g, '');
            },
            handleBlur(key, index) {

            },
            // 表单名变更提示
            formNameBlur() {
                // 表单名为空提示
                if (this.formName === '') {
                    this.$Message.warning(this.$t('formSet.fieldTip'));
                    return false;
                }
                const data = {
                    relationName: this.formName,
                    orgId: this.enterpriseId
                };
                if (this.checkForm) {
                    data.id = this.checkForm.id;
                }
                formSetting.hasSameRelationName(data).then(response => {
                    if (response.code !== '1') {
                        this.hasSameRelationName = true;
                        this.$Message.warning(`${this.$t('formSet.tableTitleRepeat1')}${this.formName}${this.$t('formSet.tableTitleRepeat2')}`);
                    } else {
                        this.hasSameRelationName = false;
                    }
                });
            },
            /* 保存映射关系 */
            saveClueForm() {
                // 规则名必填
                if (this.formName === '') {
                    this.$Message.warning(this.$t('formSet.fieldTip'));
                    return false;
                }
                // 规则名若重复拦截下
                if (this.hasSameRelationName) {
                    this.$Message.warning(`${this.$t('formSet.tableTitleRepeat1')}${this.formName}${this.$t('formSet.tableTitleRepeat2')}`);
                    return false;
                }
                // 保证每条的字段都有值
                const formList = this.formList;
                this.errorList = [];
                for (let i = 0; i < formList.length; i++) {
                    const item = formList[i];
                    if (!item.label || !item.label.trim() || !item.value || !item.value.trim() || !item.relation) {
                        this.errorList.push(i);
                    }
                    item.sort = i + 1;
                }
                if (this.errorList.length) {
                    this.$Message.warning(this.$t('formSet.errorTip'));
                    return false;
                }

                this.flag = true;
                const data = {
                    relationName: this.formName,
                    updateUserId: this.userId,
                    sysTemplateId: this.selectwebFromId,
                    list: this.formList,
                    orgId: this.enterpriseId,
                    ruleId: this.ruleId
                };
                if (this.checkForm) {
                    data.id = this.checkForm.id;
                    formSetting.updateExternalRelation(data).then(response => {
                        this.flag = false;
                        if (response.code === '1') {
                            this.$emit('update:checkForm', response.data);
                            this.$Message.success(this.$t('formSet.success_saveMappingForm'));
                        } else {
                            if (response.data === -5) {
                                this.$Message.warning(`${this.$t('formSet.tableTitleRepeat1')}${this.formName}${this.$t('formSet.tableTitleRepeat2')}`);
                            } else {
                                this.$Message.error(this.$t('formSet.error_saveMappingForm'));
                            }
                        }
                    });
                } else {
                    formSetting.saveExternalRelation(data).then(response => {
                        this.flag = false;
                        if (response.code === '1') {
                            this.$emit('update:checkForm', response.data);
                            this.$Message.success(this.$t('formSet.success_saveMappingForm'));
                        } else {
                            if (response.data === -5) {
                                this.$Message.warning(`${this.$t('formSet.tableTitleRepeat1')}${this.formName}${this.$t('formSet.tableTitleRepeat2')}`);
                            } else {
                                this.$Message.error(this.$t('formSet.error_saveMappingForm'));
                            }
                        }
                    });
                }
            },

            // 生效规则
            getRuleList() {
                formSetting.getRuleNameList({
                    orgId: this.enterpriseId
                }).then(res => {
                    if (res.code === '1') {
                        this.ruleList = Array.isArray(res.data) ? res.data : [];
                    }
                });
            },
            getRuleDetail() {
                const ruleId = this.ruleId;

                // 数据清空
                this.ruleObj = {};

                // 判断是否取消选中
                if (!ruleId) {
                    return;
                }

                // 更改选中项, 请求获取新数据
                formSetting.getRuleDetail({
                    orgId: this.enterpriseId,
                    ruleId
                }).then(res => {
                    if (res.code === '1') {
                        const result = res.data;

                        // 数据处理
                        // 生成规则文字内容
                        const showList = [];
                        try {
                            const conditionObj = JSON.parse(result.conditionsJson);
                            Object.values(conditionObj)[0].forEach(con => {
                                Object.entries(con).some(([key, value]) => {
                                    const operator = Object.keys(value)[0];
                                    showList.push(`${this.$t(`formSet.conditionType_${key}`)} ${this.$t(`formSet.operator_${operator}`)} ${value[operator]}`);

                                    return true;
                                });
                            });
                        } catch (e) {
                            console.error(e);
                        }
                        result.conditionShowList = showList;

                        this.ruleObj = result;
                    }
                });
            }
        },
        watch: {
            checkForm: {
                handler(val) {
                    this.spinShow = true;
                    this.getWebFormList();
                    this.getRuleList();
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less">
    .mapping-form-set {
        position: relative;
        margin-top: 20px;

        .binding-title {
            font-weight: 500;
            font-size: 16px;
            color: #2d2f2e;
        }
        .right-btn {
            position: absolute;
            top: 0;
            right: 0;
        }
        .form-tip {
            margin: 8px 0 30px;
            p {
                font-size: 12px;
                line-height: 18px;
                span {
                    display: block;
                    text-indent: 30px;
                    position: relative;
                    &::before{
                        content: ' ';
                        position: absolute;
                        width: 4px;
                        height: 4px;
                        background: rgba(0,0,0,.6);
                        border-radius: 50%;
                        left: 25px;
                        top: 50%;
                        transform: translate(0, -50%);
                    }
                }
            }
        }
        .form-name {
            margin-bottom: 12px;
            font-size: 16px;
            color: #2d2f2e;
        }
        .select-web-from {
            .el-input__inner {
                width: 180px;
                font-size: 14px;
                color: rgba(0,0,0,.8);
                font-weight: bold;
                box-shadow: none;
                border: none;
                text-align: center;
                box-shadow: none !important;
            }
            .el-input__inner::placeholder {
                font-size: 14px;
                color: rgba(0,0,0,.8);
                font-weight: bold;
            }
            .el-input .el-select__caret {
                color: rgba(0,0,0,.8);
                font-weight: bold;
            }
        }
        .form-fields {
            margin-bottom: 16px;
            .el-col-14 {
                text-align: left;
            }
            .el-input {
                width: 180px;
                margin-right: 8px;
            }
            .custom {
                margin-right: 8px;
                cursor:pointer;
            }
        }
        .error-tip {
            .el-input__inner, .el-input__inner .el-input__inner, .el-input.is-disabled .el-input__inner {
                border: red solid 1px;

            }
        }
        .form-lable {
            font-size: 14px;
            color: #333;
            font-weight: bold;
        }
        .form-body-container {
            margin: 30px auto 0;

            width: 725px;
            text-align: center;
            .form-icon-box {
                margin-bottom: 10px;
            }
            .form-icon-text {
                font-size: 14px;
                color: rgba(0,0,0,.8);
                font-weight: bold;
            }
            .form-feild-icon {
                line-height: 32px;
            }
            .form-fields-container {
                margin: 16px 0 0;
                overflow-x: hidden;
                overflow-y: auto;
                position: relative;
            }
        }

        .form-rule-disc {
            display: flex;

            > span {
                min-width: 100px;
                font-size: 12px;
            }

            > div {
                flex: 1;
                font-size: 12px;
                color: rgba(0, 0, 0, .8)
            }
        }
    }
</style>
