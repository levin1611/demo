<template>
    <el-dialog 
        :width="1080"
        :close-on-click-modal="false"
        append-to-body
        v-model="dialogVisible"
        top="5vh"
        @close="closeDialog" 
        :title="$t(title)">
        <main class="fieldFormMain">
            <div class="fieldBox">
                <p class="title">{{$t('fieldSet.leftTitle')}}</p>
                <el-scrollbar max-height="calc(100vh - 300px)">
                    <p v-for="(item, index) in fieldList"
                       @click="changeFieldType(item)"
                       :key="index"
                       class="fieldItem" 
                       :class="{'active': fieldType === item.type, 'editStatus' : id !== ''}">
                        {{$t(item.label)}}
                    </p>
                </el-scrollbar>
            </div>
            <div class="formBox">
                <p class="title padding-left-20">{{$t('fieldSet.rightTitle')}}</p>
                <el-scrollbar max-height="calc(100vh - 300px)" ref="scrollbarRef">
                    <el-form :model="ruleForm"
                             :label-width="145"
                             label-position="left"
                             ref="ruleFormRef"
                             :rules="rules"
                             style="padding: 0 40px 0 30px">
                        <!-- 字段名称 -->
                        <el-form-item :label="$t('fieldSet.formName1')" prop="displayName">
                            <el-input v-model="ruleForm.displayName"  @blur="ruleForm.displayName = ruleForm.displayName.trim()" show-word-limit :maxlength="50"/>
                        </el-form-item>
                        <!-- 程序识别名称 -->
                        <el-form-item :label="$t('fieldSet.formName2')" prop="apiKey">
                            <el-input v-model="ruleForm.apiKey" show-word-limit :maxlength="100" :disabled="id !== ''" @input="inputApiKey"/>
                        </el-form-item>
                        <template v-if="['text','textarea','tel','email','url'].includes(fieldType)">
                            <!-- 最大长度 文本、文本域、电话、email-->
                            <el-form-item
                                :label="$t('fieldSet.formName3')"
                                prop="maxTextLength">
                                <el-input
                                    v-model="ruleForm.maxTextLength"
                                    @input="inputNumber('maxTextLength')"
                                    @change="inputNumber('maxTextLength')"/> 
                            </el-form-item>
                            <!-- 最小长度 -->
                            <el-form-item
                                :label="$t('fieldSet.formName4')"
                                prop="minTextLength">
                                <el-input
                                    v-model="ruleForm.minTextLength"
                                    @input="inputNumber('minTextLength')"
                                    @change="inputNumber('minTextLength')" />
                            </el-form-item>
                        </template>
                        <!-- 整数 最大长度 和 整数长度 -->
                        <el-form-item
                            :label="fieldType === 'integer' ? $t('fieldSet.formName3') : $t('fieldSet.formName10')"
                            prop="digitLeft" 
                            v-if="['integer','real','currency','percentage'].includes(fieldType)">
                            <el-select
                                v-model="ruleForm.digitLeft"
                                filterable
                                :placeholder="$t('selectPlaceholder')"
                            >
                                <el-option
                                    v-for="n in 15"
                                    :key="n"
                                    :label="n"
                                    :value="n"
                                />
                            </el-select>
                        </el-form-item>
                        <!-- 小数位数 -->
                        <el-form-item
                            :label="$t('fieldSet.formName11')"
                            prop="digitScale"
                            v-if="['real','currency','percentage','position'].includes(fieldType)">
                            <el-select
                                v-model="ruleForm.digitScale"
                                filterable
                                :disabled="['position'].includes(fieldType)"
                                :placeholder="$t('selectPlaceholder')"
                            >
                                <el-option
                                    v-for="n in 16"
                                    :key="n"
                                    :label="n-1"
                                    :value="n-1"
                                />
                            </el-select>
                        </el-form-item>
                        <!-- 文本 单行文本 多行文本 -->
                        <el-form-item :label="$t('fieldSet.formName5')" v-if="fieldType === 'text'">
                            <el-radio-group v-model="ruleForm.textLineNum">
                                <el-radio :label="1">{{$t('fieldSet.radioLabel1')}}</el-radio>
                                <el-radio :label="2">{{$t('fieldSet.radioLabel2')}}</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <!-- 币种 本币种 多币种 -->
                        <el-form-item :label="$t('fieldSet.formName12')" v-if="fieldType === 'currency'">
                            <el-radio-group v-model="ruleForm.dataType" @change="handleChangeDataType" :disabled="id !== ''">
                                <el-radio :label="8">{{$t('fieldSet.radioLabel6')}}</el-radio>
                                <el-radio :label="9">{{$t('fieldSet.radioLabel7')}}</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <!-- 日期时间 -->
                        <el-form-item :label="$t('fieldSet.formName13')" v-if="fieldType === 'datetime'">
                            <el-radio-group v-model="ruleForm.dataType" @change="handleChangeDataType" :disabled="id !== ''">

                                <el-radio v-for="item in dataTypeList" :key="item.value" :label="item.value" >{{$t(`${item.label}`)}}</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <template v-if="fieldType === 'auto'">
                            <!-- 编号预览 -->
                            <el-form-item :label="$t('fieldSet.formName14')" >
                                <span>{{serialNumFormatShow}}</span>
                            </el-form-item>
                            <!-- 显示格式 -->
                            <el-form-item :label="$t('fieldSet.formName16')" prop="serialNumFormat">
                                <el-input
                                    ref="serialNumFormatDom"
                                    v-model="ruleForm.serialNumFormat"
                                    type="textarea"
                                    show-word-limit
                                    :autosize="false"
                                    resize="none"
                                    :rows="3"
                                    @blur="serialNumFormatBlur"
                                    @input="serialNumFormatInput"
                                    maxlength="1000"/>
                                <div class="margin-top-12">
                                    <el-dropdown class="margin-right-12" max-height="380"> 
                                        <el-button class="useBrandColor">{{$t('fieldSet.btnText1')}}</el-button>
                                        <template #dropdown> 
                                            <el-dropdown-menu>
                                                <el-dropdown-item v-for="(item, index) in serialNumFormatFeildList" :key="index" @click="handleSerialNumFormat(item)">
                                                    {{item.displayName}}
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </template>
                                    </el-dropdown>
                                    <el-dropdown class="margin-right-12"> 
                                        <el-button class="useBrandColor">{{$t('fieldSet.btnText2')}}</el-button>
                                        <template #dropdown>
                                            <el-dropdown-menu>
                                                <el-dropdown-item v-for="(item, index) in serialNumFormatList" :key="index" @click="handleSerialNumFormat(item)">
                                                    {{$t(item.label)}}{{item.value}}
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </template>
                                    </el-dropdown>
                                    <!-- <el-button class="useBrandColor">{{$t('fieldSet.btnText3')}}</el-button> -->
                                </div>
                            </el-form-item>
                            <!-- 开始编号 -->
                            <el-form-item :label="$t('fieldSet.formName15')" prop="serialNumStart">
                                <el-input v-model="ruleForm.serialNumStart" :disabled="id !== ''" />
                                <el-checkbox v-model="ruleForm.isIncludeExistData" :disabled="id !== ''">{{$t('fieldSet.checkBoxLabel4')}}</el-checkbox>
                            </el-form-item>
                        </template>
                        <!-- 唯一属性 -->
                        <el-form-item
                            :label="$t('fieldSet.formName6')"
                            v-if="['text','tel','email','integer'].includes(fieldType)">
                            <el-checkbox v-model="ruleForm.uniqueFlag" size="large"/>
                        </el-form-item>
                        <template v-if="['association', 'relation'].includes(fieldType)">
                            <!-- 关联业务对象 -->
                            <el-form-item :label="$t('fieldSet.formName17')" prop="referenceObjectId" v-if="ruleForm.apiKey !== 'objectType'">
                                <el-select
                                    @change="changeReferenceObjectId"
                                    :disabled="id !== ''"
                                    v-model="ruleForm.referenceObjectId"
                                    :placeholder="$t('selectPlaceholder')"
                                >
                                    <el-option
                                        v-for="item in relatedToObjectList"
                                        :key="item.id"
                                        :label="item.displayName"
                                        :value="item.id"
                                    />
                                    
                                </el-select>
                            </el-form-item>
                            <!-- 相关列表名称 --> 
                            <el-form-item :label="$t('fieldSet.formName18')" prop="relationshipListDisplayName">
                                <el-input v-model="ruleForm.relationshipListDisplayName" maxlength="50" show-word-limit />
                            </el-form-item>
                            <!-- 一般关联 级联删除 -->
                            <template v-if="feildShowFlag.referenceObject.show">
                                <el-form-item :label="$t('fieldSet.formName19')" v-if="fieldType === 'association'">
                                    <el-select
                                        :disabled="feildShowFlag.referenceObject.disabled"
                                        v-model="ruleForm.cascadeDeleteType"
                                        :placeholder="$t('selectPlaceholder')"
                                    >
                                        <el-option
                                            v-for="item in cascadeDeleteTypeList"
                                            :key="item.value"
                                            :label="$t(item.label)"
                                            :value="item.value"
                                        />
                                        
                                    </el-select>
                                </el-form-item>
                                <!-- 主子 级联删除 -->
                                <el-form-item :label="$t('fieldSet.formName19')" v-if="fieldType === 'relation'">
                                    <el-select
                                        v-model="ruleForm.cascadeDeleteType"
                                        :placeholder="$t('selectPlaceholder')"
                                    >
                                        <el-option
                                            v-for="item in cascadeDeleteTypeList1"
                                            :key="item.value"
                                            :label="$t(item.label)"
                                            :value="item.value"
                                        />
                                        
                                    </el-select>
                                </el-form-item>
                            </template>
                            <!-- 访问控制规则 -->
                            <el-form-item :label="$t('fieldSet.formName20')">
                                <span>{{fieldType === 'association' ? $t('fieldSet.text1') : $t('fieldSet.text2')}}</span> 
                            </el-form-item>
                            <template v-if="feildShowFlag.filterRuleDetail.show">
                                <!-- 查找范围 -->
                                <div class="useSetBox formUseSetBox">
                                    <p class="useSetBox-title">{{$t('fieldSet.useSetTitle4')}}</p>
                                    <div class="optionsBox">
                                        <p class="useSetBox-tips">{{$t('fieldSet.useSetTips')}}</p>
                                        <allPurposeFilter
                                            ref="allPurposeFilterDom"
                                            from="fieldModal"
                                            :disabled="feildShowFlag.filterRuleDetail.disabled"
                                            :objectId="`${currentSettingRow.id}`"
                                            :fieldsSource="calculationFieldsSource"
                                            :dataSource="calculationDataSource"
                                            @changeObject="calculationChangeObject"
                                            :maxLevel="4"
                                            :filterType="filterType"
                                            :filterData="conditions"
                                            :expression="expression"></allPurposeFilter>
                                        <el-checkbox :disabled="feildShowFlag.filterRuleDetail.disabled" v-model="ruleForm.relationshipFilterRange">{{$t('fieldSet.checkBoxLabel6')}}</el-checkbox>
                                    </div>
                                </div>
                            </template>
                        </template>
                        <!-- 跟进记录 -->
                        <template v-if="fieldType === 'followup'">
                            <!-- 支持对象范围 -->
                            <el-form-item :label="$t('fieldSet.formName35')">
                                <el-select
                                    disabled
                                    multiple
                                    v-model="ruleForm.polymorphicObjectIds"
                                    :placeholder="$t('selectPlaceholder')"
                                >
                                    <el-option
                                        v-for="item in relatedToObjectList"
                                        :key="item.id"
                                        :label="item.displayName"
                                        :value="item.id"
                                    />
                                    
                                </el-select>
                            </el-form-item>
                            <!-- 级联删除 -->
                            <el-form-item :label="$t('fieldSet.formName19')">
                                <el-select
                                    v-model="ruleForm.cascadeDeleteType"
                                    :placeholder="$t('selectPlaceholder')"
                                >
                                    <el-option
                                        v-for="item in [].concat(cascadeDeleteTypeList1, cascadeDeleteTypeList)"
                                        :key="item.value"
                                        :label="$t(item.label)"
                                        :value="item.value"
                                    />
                                    
                                </el-select>
                            </el-form-item>
                            <!-- 访问控制规则 -->
                            <el-form-item :label="$t('fieldSet.formName20')">
                                <el-select
                                    v-model="ruleForm.accessRuleType"
                                    :placeholder="$t('selectPlaceholder')"
                                >
                                    <el-option :label="$t('fieldSet.text1')" :value="1" />
                                    <el-option :label="$t('fieldSet.text2')" :value="2" />
                                </el-select>
                            </el-form-item>
                        </template>
                        <template v-if="['reference'].includes(fieldType)">
                            <!-- 业务关联关系 -->
                            <el-form-item :label="$t('fieldSet.formName21')" prop="relationshipFieldId">
                                <el-select
                                    :disabled="id !== ''"
                                    @change="getRelationObjFieldList"
                                    v-model="ruleForm.relationshipFieldId"
                                    :placeholder="$t('selectPlaceholder')"
                                >
                                    <el-option
                                        v-for="item in relationshipFieldList"
                                        :key="item.id"
                                        :label="item.displayName"
                                        :value="item.id"
                                    />
                                    
                                </el-select>
                            </el-form-item>
                            <!-- 引用字段 -->
                            <el-form-item :label="$t('fieldSet.formName22')" prop="referenceFieldId">
                                <el-select
                                    :disabled="id !== ''"
                                    @change="changereferenceFieldId"
                                    v-model="ruleForm.referenceFieldId"
                                    :placeholder="$t('selectPlaceholder')"
                                >
                                    <el-option
                                        v-for="item in relationshipDisplayFieldList"
                                        :key="item.id"
                                        :label="item.displayName"
                                        :value="item.id"
                                    />
                                </el-select>
                            </el-form-item>
                            <!-- 引用字段类型 -->
                            <el-form-item :label="$t('fieldSet.formName23')">
                                <!-- <el-input v-model="$t(relationshipDisplayFieldType)" disabled/> -->
                                {{$t(relationshipDisplayFieldType)}}
                            </el-form-item>
                        </template>
                        <template v-if="fieldType==='compute'">
                            <!-- 计算类型 -->
                            <el-form-item :label="$t('fieldSet.formName24')" prop="calculationType">
                                <el-select
                                    :disabled="id !== ''"
                                    @change="handleChangeDataType"
                                    v-model="ruleForm.calculationType"
                                    :placeholder="$t('selectPlaceholder')"
                                >
                                    <el-option
                                        v-for="item in calculationTypeList"
                                        :key="item.value"
                                        :label="$t(item.label)"
                                        :value="item.value"
                                    />
                                </el-select>
                            </el-form-item>
                            <!--  计算公式 -->
                            <el-form-item :label="$t('fieldSet.formName25')" v-if="ruleForm.calculationType !== 17">
                                <el-input
                                    :disabled="id !== ''"
                                    ref="calculationLogicDom"
                                    v-model="ruleForm.calculationLogic"
                                    @blur="calculationLogicBlur"
                                    type="textarea"
                                    show-word-limit
                                    :autosize="false"
                                    resize="none"
                                    :rows="3"
                                    maxlength="5000"/>
                                <representation
                                    v-if="!id"
                                    :objectId="`${currentSettingRow.id}`"
                                    :fieldsSource="calculationLogicFieldsSource"
                                    :usageType="3"
                                    :maxLevel="4"
                                    :dataType="`${dataType}`"
                                    :grammarString="ruleForm.calculationLogic"
                                    @handle-click="changeCalculationLogic"></representation>
                            </el-form-item>
                            <!--  参与计算的字段值为空时 -->
                            <template v-if="[16, 19, 18].includes(ruleForm.calculationType)">
                                <el-form-item :label="$t('fieldSet.formName25')">
                                    <template #label>
                                        <span class="specialLabel">{{$t('fieldSet.calculationTips1')}}</span>
                                    </template>
                                    <el-radio-group v-model="ruleForm.calculationEmptyFieldConfig" :disabled="id !== ''">
                                        <el-radio :label="1">{{$t('fieldSet.radioLabel10')}}</el-radio>
                                        <el-radio :label="2">{{$t('fieldSet.radioLabel11')}}</el-radio>
                                    </el-radio-group>
                                </el-form-item>
                                <!--  小数点位数 -->
                                <el-form-item :label="$t('fieldSet.calculationTips2')">
                                    <el-select
                                        v-model="ruleForm.calculationResultScale"
                                        :placeholder="$t('selectPlaceholder')"
                                    >
                                        <el-option
                                            v-for="n in 16"
                                            :key="n"
                                            :label="n-1"
                                            :value="n-1"
                                        />
                                    </el-select>
                                </el-form-item>
                            </template>
                            <template v-if="ruleForm.calculationType ===17">
                                <!-- 主业务对象 -->
                                <el-form-item :label="$t('fieldSet.formName30')">
                                    <span>{{currentSettingRow.displayName}}</span>
                                </el-form-item>
                                <!-- 已关联业务对象 -->
                                <el-form-item :label="$t('fieldSet.formName31')" prop="relationshipFieldId">
                                    <el-select
                                        @change="getQueryStatisticFields(ruleForm.relationshipFieldId, 'calculationObjectId')"
                                        :disabled="id !== ''"
                                        v-model="ruleForm.relationshipFieldId"
                                        :placeholder="$t('selectPlaceholder')"
                                    >
                                        <el-option
                                            v-for="item in calculationObjectList"
                                            :key="item.id"
                                            :label="item.displayName"
                                            :value="item.id"
                                        />
                                    </el-select>
                                </el-form-item>
                                <!--  累计类型 -->
                                <el-form-item :label="$t('fieldSet.formName32')">
                                    <el-radio-group v-model="ruleForm.statisticsType" style="display: block" :disabled="id !== ''" @change="getQueryStatisticFields">
                                        <el-radio :label="1">{{$t('fieldSet.radioLabel14')}}</el-radio><br/>
                                        <el-radio :label="2">{{$t('fieldSet.radioLabel15')}}</el-radio><br/>
                                        <el-radio :label="3">{{$t('fieldSet.radioLabel16')}}</el-radio><br/>
                                        <el-radio :label="4">{{$t('fieldSet.radioLabel17')}}</el-radio><br/>
                                    </el-radio-group>
                                </el-form-item>
                                <!-- 汇总字段 -->
                                <el-form-item :label="$t('fieldSet.formName33')">
                                    <el-select
                                        v-model="ruleForm.calculationFieldId"
                                        @change="changeCalculationFieldId"
                                        :disabled="ruleForm.statisticsType === 1 || id !== ''"
                                        :placeholder="$t('selectPlaceholder')"
                                    >
                                        <el-option
                                            v-for="item in calculationObjectFieldList"
                                            :key="item.id"
                                            :label="item.displayName"
                                            :value="item.id"
                                        />
                                    </el-select>
                                </el-form-item>
                                <!--  过滤条件 -->
                                <template v-if="feildShowFlag.filterRuleDetail.show">
                                    <el-form-item :label="$t('fieldSet.formName34')">
                                        <el-radio-group v-model="filterRuleType" :disabled="feildShowFlag.filterRuleDetail.disabled || id !== ''">
                                            <el-radio label="1">{{$t('fieldSet.radioLabel18')}}</el-radio><br/>
                                            <el-radio label="2">{{$t('fieldSet.radioLabel19')}}</el-radio>
                                        </el-radio-group>
                                        <allPurposeFilter
                                            v-if="filterRuleType === '2' && changeReferenceObjectIdStatus"
                                            :disabled="feildShowFlag.filterRuleDetail.disabled || id !== ''"
                                            ref="allPurposeFilterDom"
                                            :fieldsSource="filterRuleTypeSource"
                                            :objectId="`${currentSettingRow.id}`"
                                            :levelFields="false"
                                            :radioType="[1,2,3]"
                                            :conditionType="['fields','matchType','value']"
                                            :filterType="filterType" :filterData="conditions" :expression="expression"></allPurposeFilter>
                                    </el-form-item>
                                </template>
                                <!--  小数点位数 -->
                                <el-form-item :label="$t('fieldSet.calculationTips2')">
                                    <el-select
                                        v-model="ruleForm.calculationResultScale"
                                        :placeholder="$t('selectPlaceholder')"
                                    >
                                        <el-option
                                            v-for="n in 16"
                                            :key="n"
                                            :label="n-1"
                                            :value="n-1"
                                        />
                                    </el-select>
                                </el-form-item>
                            </template>
                        </template>
                        <!-- 图片数量 --> 
                        <el-form-item
                            :label="fieldType==='pic' ? $t('fieldSet.formName26') : $t('fieldSet.formName29')"
                            v-if="['pic','file'].includes(fieldType)">
                            <el-select
                                v-model="ruleForm.fileUploadTotal"
                                :placeholder="$t('selectPlaceholder')"
                            >
                                <el-option
                                    v-for="n in 9"
                                    :key="n"
                                    :label="n"
                                    :value="n"
                                />
                            </el-select>
                        </el-form-item>
                        <!-- 定位类型 -->
                        <el-form-item :label="$t('fieldSet.formName28')" v-if="fieldType==='position'">
                            <el-radio-group v-model="ruleForm.locationType">
                                <el-radio :label="1">{{$t('fieldSet.radioLabel12')}}</el-radio>
                                <el-radio :label="2">{{$t('fieldSet.radioLabel13')}}</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <!-- 帮助文本 --> 
                        <el-form-item :label="$t('fieldSet.formName7')">
                            <el-input
                                v-model="ruleForm.helpInformation"
                                :maxlength="200"
                                show-word-limit
                                :autosize="false" 
                                resize="none"
                                rows="3"
                                type="textarea" />
                        </el-form-item>
                        <!-- 描述 -->
                        <el-form-item :label="$t('fieldSet.formName8')">
                            <el-input
                                v-model="ruleForm.description"
                                maxlength="1000"
                                show-word-limit
                                :autosize="false"
                                resize="none"
                                rows="3"
                                type="textarea" />
                        </el-form-item>
                        <!-- 默认值 -->
                        <template v-if="feildShowFlag.defaultValue.show">
                            <!-- 'relation', 'association', -->
                            <el-form-item :label="$t('fieldSet.formName9')" v-if="['text','textarea','tel','email','url', 'integer', 'real', 'real', 'currency', 'datetime', 'percentage', 'followup'].includes(fieldType)">
                                <div class="defaultValue">
                                    <el-input
                                        ref="defaultValueDom"
                                        :disabled="feildShowFlag.defaultValue.disabled"
                                        v-model="ruleForm.defaultValue"
                                        maxlength="5000"
                                        type="textarea"
                                        show-word-limit 
                                        :autosize="false" 
                                        resize="none" 
                                        :rows="3"
                                        @blur="defaultValueBlur" />
                                    <template v-if="feildShowFlag.defaultValue.showRepresentation">
                                        <representation
                                            v-if="changeReferenceObjectIdStatus"
                                            @handle-click="changeDefaultValue"
                                            :objectId="`${currentSettingRow.id}`"
                                            :usageType="0"
                                            :dataType="dataType"
                                            :types="representationType"
                                            :fieldsSource="defaultFieldsSource"
                                            :grammarString="ruleForm.defaultValue"
                                            :maxLevel="1"></representation>
                                    </template>
                                    <el-tooltip
                                        placement="top-end"
                                        popper-class="max-w-310"
                                        trigger="hover"
                                        raw-content
                                        :content="$t('fieldSet.tips')">
                                        <i class="custom custom-tip"></i>
                                    </el-tooltip>
                                </div>
                            </el-form-item>
                        </template>
                        <!-- 布尔型 默认值 --> 
                        <template v-if="feildShowFlag.boolDefaultValue.show">
                            <el-form-item :label="$t('fieldSet.formName9')" v-if="fieldType==='boolean'">
                                <el-select
                                    :disabled="feildShowFlag.boolDefaultValue.disabled"
                                    v-model="ruleForm.boolDefaultValue"
                                    :placeholder="$t('selectPlaceholder')"
                                >
                                    <el-option :label="$t('fieldSet.boolDefaultValue2')" :value="0"/>
                                    <el-option :label="$t('fieldSet.boolDefaultValue1')" :value="1"/>
                                </el-select>
                            </el-form-item>
                        </template>
                    </el-form>
                    <!-- 多选、单选选项设置 -->
                    <div class="useSetBox padding-left-20" v-if="['select', 'multiple'].includes(fieldType)">
                        <p class="useSetBox-title">{{$t('fieldSet.useSetTitle')}}</p>
                        <div>
                            <el-radio-group :disabled="id !== ''" v-model="ruleForm.optionSourceType" @change="optionSourceTypeChange">
                                <el-radio :label="1">{{$t('fieldSet.radioLabel3')}}</el-radio>
                                <el-radio :label="2">{{$t('fieldSet.radioLabel4')}}</el-radio>
                            </el-radio-group>
                        </div>
                        <div class="optionsBox" v-if="ruleForm.optionSourceType === 1"> 
                            <el-table
                                class="optionTable"
                                :data="optionsData"
                                :max-height="500"
                                :row-class-name="rowClassName"
                                :tooltip-options="{showAfter: 500}"
                            >
                                <el-table-column
                                    v-for="column in optionsColumns"
                                    :key="column.prop"
                                    :prop="column.prop"
                                    :label="$t(column.label)"
                                    :width="column.width"
                                    :show-overflow-tooltip="['displayName','apiKey'].includes(column.prop)"
                                >
                                    <template #default="{ row, $index }">
                                        <template v-if="column.prop === 'displayName'">
                                            <template v-if="row.editStaus">
                                                <el-input v-model="row.displayName" @mouseenter="handleFocus" @mouseleave="bandleBlur" maxlength="50"/>
                                            </template>
                                            <template v-else>{{ row.displayName }}</template>
                                        </template>
                                        <template v-else-if="column.prop === 'apiKey'">
                                            <template v-if="row.editStaus">
                                                <el-input v-model="row.apiKey" @mouseenter="handleFocus" @mouseleave="bandleBlur" maxlength="100" @input="inputOptionsApiKey(row)"/>
                                            </template>
                                            <template v-else>{{ row.apiKey }}</template>
                                        </template>
                                        <template v-else-if="column.prop === 'setDefault'">
                                            <template v-if="fieldType === 'select'">
                                                <el-checkbox v-model="row.defaultFlag" @change="changeDefault(row.defaultFlag, row, $index)">{{$t('fieldSet.radioLabel5')}}</el-checkbox>
                                            </template>
                                            <template v-if="fieldType === 'multiple'">
                                                <el-checkbox v-model="row.defaultFlag">{{$t('fieldSet.radioLabel5')}}</el-checkbox>
                                            </template>
                                        </template>
                                        <template v-else-if="column.prop === 'enableFlag'">
                                            <el-switch
                                                v-model="row.enableFlag"
                                                width="50"
                                                inline-prompt 
                                                :active-text="$t('enabled')"
                                                :inactive-text="$t('bizObject.disable')"
                                            />
                                        </template>
                                        <template v-else-if="column.prop === 'operate'">
                                            <template v-if="$index === (optionsData.length-1) && feildShowFlag.option.show">
                                                <!-- 添加 -->
                                                <el-link
                                                    v-if="optionsData.length <= 1000"
                                                    type="primary"
                                                    @click="addOptions(row, $index)"
                                                >
                                                    {{ $t('add') }}
                                                </el-link>
                                                <!-- 批量添加 -->
                                                <el-link
                                                    v-if="optionsData.length <= 1000"
                                                    type="primary"
                                                    @click="batchAddOptions"
                                                >
                                                    {{ $t('batchAdd') }}
                                                </el-link>
                                            </template>
                                            <template v-else>
                                                <template v-if="row.editStaus">
                                                    <!-- 保存 -->
                                                    <el-link
                                                        type="primary"
                                                        @click="saveOptions(row, $index)"
                                                    >
                                                        {{ $t('save') }}
                                                    </el-link>
                                                    <!-- 取消编辑 -->
                                                    <el-link
                                                        type="primary"
                                                        @click="cancelOptions(row)"
                                                    >
                                                        {{ $t('cancel') }}
                                                    </el-link>
                                                </template>
                                                <template v-else>
                                                    <!-- 编辑 -->
                                                    <el-link
                                                        v-if="row.editConfigFlag !== 0"
                                                        type="primary"
                                                        @click="handleEditOptions(row, $index)"
                                                    >
                                                        {{ $t('edit') }}
                                                    </el-link>
                                                    <!-- 删除 -->
                                                    <el-link
                                                        v-if="row.deleteConfigFlag !== 0"
                                                        type="primary"
                                                        @click="handleDelOptions(row, $index)"
                                                    >
                                                        {{ $t('delete') }}
                                                    </el-link>
                                                </template>
                                            </template>
                                        </template> 
                                    </template>
                                </el-table-column>
                            </el-table>
                            <el-checkbox v-model="ruleForm.optionOrderType">{{$t('fieldSet.checkBoxLabel5')}}</el-checkbox>
                        </div>
                        <div class="optionsBox" v-if="ruleForm.optionSourceType === 2">
                            <el-select
                                v-model="ruleForm.commonOptionId"
                                :disabled="id !== ''"
                                @change="handleChangeCommonOption"
                                :placeholder="$t('selectPlaceholder')"
                                style="width: 240px;">
                                <el-option
                                    v-for="item in comOptionsList"
                                    :key="item.id"
                                    :label="item.displayName"
                                    :value="item.id"
                                /> 
                            </el-select>
                            <vxe-table
                                border="inner"
                                class="commonOptionTable"
                                :max-height="500"
                                :row-config="{height: 45.22}"
                                :scroll-y="{enabled: true, gt: 10}"
                                :data="comOptionsTableData"
                                :tooltip-options="{showAfter: 500}"
                                show-overflow
                            >
                                <vxe-column
                                    v-for="column in comOptionsColumns"
                                    :key="column.prop"
                                    :field="column.prop"
                                    :title="$t(column.label)"
                                    :width="column.width"
                                    :show-overflow="['displayName','apiKey'].includes(column.prop)"
                                >
                                    <template #default="{ row, rowIndex }">
                                        <template v-if="column.prop === 'setDefault'">
                                            <template v-if="fieldType === 'select'">
                                                <el-checkbox v-model="row.defaultFlag" @change="changeDefault(row.defaultFlag, row, rowIndex)">{{$t('fieldSet.radioLabel5')}}</el-checkbox>
                                            </template>
                                            <template v-if="fieldType === 'multiple'">
                                                <el-checkbox v-model="row.defaultFlag">{{$t('fieldSet.radioLabel5')}}</el-checkbox>
                                            </template>
                                        </template>
                                        <template v-else-if="column.prop === 'enableFlag'">
                                            <el-switch
                                                disabled
                                                v-model="row.enableFlag"
                                                width="50"
                                                inline-prompt
                                                :active-text="$t('enabled')"
                                                :inactive-text="$t('bizObject.disable')"
                                            />
                                        </template>
                                        <template v-else>{{row[column.prop]}}</template>
                                    </template>
                                </vxe-column>
                            </vxe-table>
                        </div>
                    </div>
                    <!-- 权限、显示设置 -->
                    <div class="useSetBox padding-left-20">
                        <template v-if="!predefinedFlag">
                            <!-- 业务对象类型中使用 -->
                            <p class="useSetBox-title">{{$t('fieldSet.useSetTitle1')}}</p>
                            <div class="useSetBox-list">
                                <label class="labelName">{{$t('fieldSet.useLabel1')}}</label>
                                <el-checkbox v-model="allTypeUse" @change="handleChange($event, 'TypeUse')" :label="$t('fieldSet.checkBoxLabel1')" size="large" />
                                <el-checkbox v-model="allTypeWrite" :disabled="['reference', 'compute'].includes(fieldType)" @change="handleChange($event, 'TypeWrite')" :label="$t('fieldSet.checkBoxLabel2')" size="large" />
                            </div>
                            <div class="useSetBox-list" v-for="(item, index) in objectTypeList" :key="item.objectTypeId">
                                <label class="labelNameW">
                                    <el-tooltip
                                        placement="top-start"
                                        popper-class="max-w-310"
                                        :content="item.name">
                                        {{item.name}}
                                    </el-tooltip>
                                    
                                </label>
                                <el-checkbox v-model="item.useFlag" @change="handleChange($event, 'TypeUseList', index)" :label="$t('fieldSet.checkBoxLabel1')" size="large" />
                                <el-checkbox v-model="item.requiredFlag" :disabled="['reference', 'compute'].includes(fieldType)" @change="handleChange($event, 'TypeWriteList', index)" :label="$t('fieldSet.checkBoxLabel2')" size="large" />
                            </div>
                            <!-- 布局中使用 -->
                            <p class="useSetBox-title">{{$t('fieldSet.useSetTitle2')}}</p>
                            <div class="useSetBox-list">
                                <label class="labelName">{{$t('fieldSet.useLabel2')}}</label>
                                <el-checkbox v-model="allLyoutUse" @change="handleChange($event, 'LyoutUse')" :label="$t('fieldSet.checkBoxLabel1')" size="large" />
                                <el-checkbox v-model="allLyoutCom" :disabled="['compute'].includes(fieldType)" @change="handleChange($event, 'LyoutCom')" :label="$t('fieldSet.checkBoxLabel3')" size="large" />
                            </div>
                            <div class="useSetBox-list" v-for="(item, index) in layoutList" :key="item.layoutId">
                                <label class="labelNameW">
                                    <el-tooltip
                                        placement="top-start"
                                        popper-class="max-w-310"
                                        :content="item.layoutName">
                                        {{item.layoutName}}
                                    </el-tooltip>
                                </label>
                                <el-checkbox v-model="item.useFlag" @change="handleChange($event, 'LyoutUseList', index)" :label="$t('fieldSet.checkBoxLabel1')" size="large" />
                                <el-checkbox v-model="item.commonUseFlag" :disabled="['compute'].includes(fieldType)" @change="handleChange($event, 'LyoutComList', index)" v-if="item.layoutType === 1" :label="$t('fieldSet.checkBoxLabel3')" size="large" />
                            </div>
                        </template>
                        <!-- 字段权限 -->
                        <p class="useSetBox-title">{{$t('fieldSet.useSetTitle3')}}</p>
                        <div class="useSetBox-list">
                            <label class="labelName">{{$t('fieldSet.useLabel3')}}</label>
                            <template v-if="feildShowFlag.rolePerList.fieldReadShow">
                                <el-checkbox v-model="allPerUse" :disabled="feildShowFlag.rolePerList.fieldReadDisabled" @change="handleChange($event, 'PerUse')" :label="$t('fieldSet.checkBoxLabel7')" size="large" />
                            </template>
                            <template v-if="feildShowFlag.rolePerList.fieldWriteShow">
                                <el-checkbox v-model="allPerWrite" :disabled="['reference', 'compute', 'auto'].includes(fieldType) || feildShowFlag.rolePerList.fieldWriteDisabled" @change="handleChange($event, 'PerWrite')" :label="$t('fieldSet.checkBoxLabel8')" size="large" />
                            </template>
                            <el-checkbox v-model="allPerExport" @change="handleChange($event, 'PerExport')" :label="$t('fieldSet.checkBoxLabel9')" size="large" />
                        </div>
                        <div class="useSetBox-list" v-for="(item, index) in rolePerList" :key="item.id">
                            <label class="labelNameW">
                                <el-tooltip
                                    placement="top-start"
                                    popper-class="max-w-310"
                                    :content="item.name">
                                    {{item.name}}
                                </el-tooltip>
                            </label>
                            <template v-if="feildShowFlag.rolePerList.fieldReadShow">
                                <el-checkbox v-model="item.fieldRead" :disabled="item.fieldReadDisabledFlag" @change="handleChange($event, 'PerUseList', index)" :label="$t('fieldSet.checkBoxLabel7')" size="large" />
                            </template>
                            <template v-if="feildShowFlag.rolePerList.fieldWriteShow">
                                <el-checkbox v-model="item.fieldWrite" :disabled="['reference', 'compute', 'auto'].includes(fieldType) || item.fieldWriteDisabledFlag" @change="handleChange($event, 'PerWriteList', index)" :label="$t('fieldSet.checkBoxLabel8')" size="large" />
                            </template>
                            <el-checkbox v-model="item.fieldExport" :disabled="item.fieldExportDisabledFlag" @change="handleChange($event, 'PerExportList', index)" :label="$t('fieldSet.checkBoxLabel9')" size="large" />
                        </div>
                    </div>
                </el-scrollbar>
            </div>
            
            
        </main>
        <template #footer>
            <span class="dialog-footer">
                <el-button class="useBrandColor" @click="closeDialog">{{$t('cancel')}}</el-button>
                <el-button type="primary" @click="submitForm(ruleFormRef)">
                    {{id ? $t('save') : $t('confirm')}}
                </el-button>
            </span>
        </template>
    </el-dialog>
    <el-dialog
        :width="660"
        append-to-body
        v-model="batchAddVisible"
        :title="$t('batchAdd')"
        @close="closeModal">
        <main class="add_form_main">
            <el-input
                v-model="batchAddValue"
                :placeholder="$t('fieldSet.pleaseEnter1')"
                type="textarea"
                :autosize="false"
                resize="none"
                class="batchAddValue"/>
        </main>
        <template #footer>
            <span class="dialog-footer">
                <el-button class="useBrandColor" @click="batchAddVisible = false">{{$t('cancel')}}</el-button>
                <el-button :loading="batchSaveLoading" type="primary" @click="batchSave">{{$t('save')}}</el-button>
            </span>
        </template>
    </el-dialog>
    <el-dialog
        :width="660"
        append-to-body
        v-model="deleteReplaceVisible"
        :title="$t('fieldSet.replaceTitle')"
        @close="closeReplaceModal">
        <main class="add_form_main">
            <p>{{$t('fieldSet.replaceTip')}}</p>
            <el-radio-group v-model="replaceType" style="display: block">
                <div class="flex">
                    <el-radio value="1">
                        {{$t('fieldSet.radioLabel20')}}
                    </el-radio>
                    <el-select
                        v-model="replaceVal"
                        :placeholder="$t('selectPlaceholder')"
                        style="width: 200px"
                    >
                        <el-option
                            v-for="item in replaceList"
                            :key="item.apiKey"
                            :label="item.displayName"
                            :value="item.apiKey"/>
                    </el-select>
                </div>
                <div><el-radio value="2">{{$t('fieldSet.radioLabel21')}}</el-radio></div>
            </el-radio-group>
        </main>
        <template #footer>
            <span class="dialog-footer">
                <el-button class="useBrandColor" @click="deleteReplaceVisible = false">{{$t('cancel')}}</el-button>
                <el-button :loading="batchSaveLoading" type="primary" @click="deleteReplaceSave">{{$t('save')}}</el-button>
            </span>
        </template>
    </el-dialog>
    <confirmDialog
        v-model:visible="deleteVisible"
        :title="$t('deleteConfirm')"
        :tip-content="$t('fieldSet.deleteTip')"
        @confirm="handleDelete"></confirmDialog>
</template> 
<script setup>
import { ref, inject, provide, reactive, toRef, computed, onMounted, nextTick, onBeforeUnmount, watch } from 'vue';
import { useUserStore } from '@/pinia/modules/user.js';
import confirmDialog from '@/components/confirmDialog.vue';
import { fieldsNamesMap } from '@/utils/filterConfig';
import Sortable from 'sortablejs';
import { createApiKey, objFieldInfo, addObjField, editObjField, getCommonOptionList, listOptionsSet, getCustomFieldCount, queryRelationObjList, queryRelationFieldList, queryRelationObjFieldList, queryStatisticFields, addObjFieldSetInfo, enableDelOptionTag } from '@/api/fieldModal.js'; // api请求
import { childBizObjList } from '@/api/association.js'; // api请求
import { fields4meta, findRelFilterFields, findRelFilterFieldsRange, findCountFieldFilterFields } from '@/api/common.js'; // api请求
import representation from '@/components/representation.vue';
import allPurposeFilter from '@/components/allPurposeFilter.vue';
const store = useUserStore();
const dialogVisible = defineModel('dialogVisible');
const props = defineProps({
    id: {
        type: String,
        default: ''
    },
    editType: {
        type: String,
        default: ''
    }
});

const currentSettingRow = inject('currentSettingRow');
const emit = defineEmits(['updataList']);
const objectTypeList = ref([]);
const layoutList = ref([]);
const rolePerList = ref([]);
const title = computed(() => props.id ? 'fieldSet.editTitle' : 'fieldSet.addTitle');
const fieldList = ref([
    { label: 'fieldSet.fieldType1', type: 'text', dataType: 1 }, // 文本
    { label: 'fieldSet.fieldType2', type: 'textarea', dataType: 2 }, // 文本域
    { label: 'fieldSet.fieldType3', type: 'select', dataType: 25 }, // 单选
    { label: 'fieldSet.fieldType4', type: 'multiple', dataType: 26 }, // 多选
    { label: 'fieldSet.fieldType5', type: 'tel', dataType: 3 }, // 电话
    { label: 'fieldSet.fieldType6', type: 'email', dataType: 4 }, // 邮箱
    { label: 'fieldSet.fieldType7', type: 'url', dataType: 5 }, // 网址
    { label: 'fieldSet.fieldType8', type: 'integer', dataType: 11 }, // 整数
    { label: 'fieldSet.fieldType9', type: 'real', dataType: 13 }, // 实数
    { label: 'fieldSet.fieldType10', type: 'currency', dataType: 8 }, // 货币
    { label: 'fieldSet.fieldType11', type: 'datetime', dataType: 23 }, // 日期
    { label: 'fieldSet.fieldType12', type: 'auto', dataType: 12 }, // 自动编号
    { label: 'fieldSet.fieldType13', type: 'association', dataType: 28 }, // 关联关系
    // { label: 'fieldSet.fieldType14', type: 'relation', dataType: 29 }, // 主子明细
    { label: 'fieldSet.fieldType15', type: 'reference', dataType: 30 }, // 引用数据
    { label: 'fieldSet.fieldType16', type: 'compute', dataType: 16 }, // 计算类型
    { label: 'fieldSet.fieldType17', type: 'pic', dataType: 7 }, // 图片
    { label: 'fieldSet.fieldType18', type: 'file', dataType: 6 }, // 文件
    { label: 'fieldSet.fieldType19', type: 'percentage', dataType: 14 }, // 百分比
    { label: 'fieldSet.fieldType20', type: 'boolean', dataType: 10 }, // 布尔型
    { label: 'fieldSet.fieldType21', type: 'position', dataType: 27 } // 定位
]);
const scrollbarRef = ref(null);
const maxTextLength = ref(300);
// const minTextLength = ref(0);
const validApiKey = (rule, value, callback) => {
    const firstChar = value.charAt(0);
    if (/\d/.test(firstChar)) {
        callback(new Error('程序识别名称不能以数字开头'));
    } else {
        callback();
    }
};
const validMaxTextLength = (rule, value, callback) => {
    if (Number(value) < 0) {
        callback(new Error('最大文本长度不能小于0'));
    } else {
        if (Number(value) > maxTextLength.value) {
            callback(new Error(`最大长度不能大于${maxTextLength.value}`));
        } else {
            callback();
        }
    }
};
const validMinTextLength = (rule, value, callback) => {
    if (Number(value) < 0) {
        callback(new Error('最大文本长度不能小于0'));
    } else {
        if (Number(value) > Number(ruleForm.maxTextLength)) {
            callback(new Error('最小长度不能大于最大长度'));
        } else {
            callback();
        }
    }
};
const fieldType = ref('');
const dataType = ref(null);

const ruleFormRef = ref(null);
const computeRepresentation = ref(null);
const ruleForm = reactive({
    displayName: '',
    apiKey: '',
    maxTextLength: '',
    minTextLength: '',
    textLineNum: 1,
    uniqueFlag: false,
    enableFlag: 1,
    helpInformation: '',
    description: '',
    defaultValue: '',
    optionSourceType: 1,
    dataType: 8,
    digitLeft: 15,
    digitScale: 0,
    isIncludeExistData: false,
    referenceObjectId: '',
    relationshipFieldId: '',
    referenceFieldId: '',
    relationshipListDisplayName: '',
    cascadeDeleteType: 1,
    relationshipFilterRange: false,
    calculationType: '',
    calculationEmptyFieldConfig: 1,
    calculationResultScale: 0,
    fileUploadTotal: 9,
    boolDefaultValue: 0,
    locationType: 1,
    calculationObjectId: '',
    statisticsType: 1,
    calculationFieldId: '',
    optionOrderType: false,
    serialNumFormat: '',
    calculationLogic: '',
    commonOptionId: '',
    serialNumStart: '1',
    accessRuleType: 1,
    realFieldName: '',
    polymorphicObjectIds: []
});
const rules = reactive({
    displayName: [
        { required: true, message: '请输入字段名称', trigger: 'blur' }
    ],
    apiKey: [
        { required: true, message: '请输入程序识别名称', trigger: 'blur'},
        { validator: validApiKey, trigger: 'blur'}
    ],
    maxTextLength: [
        { required: true, message: '请输入最大长度', trigger: 'blur'},
        { validator: validMaxTextLength, trigger: 'blur'}
    ],
    minTextLength: [
        { validator: validMinTextLength, trigger: 'blur'}
    ],
    serialNumFormat: [
        { required: true, message: '请设置显示格式', trigger: 'blur'}
    ],
    serialNumStart: [
        { required: true, message: '请输入开始编号', trigger: 'blur'}
    ],
    referenceObjectId: [ 
        { required: true, message: '请选择关联业务对象', trigger: 'blur'}
    ],
    relationshipListDisplayName: [
        { required: true, message: '请输入相关列表名称', trigger: 'blur'}
    ],
    relationshipFieldId: [ 
        { required: true, message: '请选择业务关联关系', trigger: 'blur'}
    ],
    referenceFieldId: [ 
        { required: true, message: '请选择引用字段', trigger: 'blur'}
    ],
    calculationType: [
        { required: true, message: '', trigger: 'blur'}
    ],
    calculationObjectId: [ 
        { required: true, message: '请选择业务关联关系', trigger: 'blur'}
    ]
});
const filterType = ref(0);
const conditions = ref([]);
const expression = ref('');
const allTypeUse = ref(true);
const allTypeWrite = ref(false);
const allLyoutUse = ref(true);
const allLyoutCom = ref(false);
const allPerUse = ref(true);
const allPerWrite = ref(true);
const allPerExport = ref(true);
const optionsColumns = ref([
    { label: 'fieldSet.columns1', prop: 'displayName', width: ''},
    { label: 'fieldSet.columns2', prop: 'apiKey', width: ''},
    { label: 'fieldSet.columns3', prop: 'setDefault', width: '100'},
    { label: 'fieldSet.columns4', prop: 'enableFlag', width: '100'},
    { label: 'fieldSet.columns5', prop: 'operate', width: '150'}
]);
const comOptionsColumns = ref([
    { label: 'fieldSet.columns1', prop: 'displayName', width: ''},
    { label: 'fieldSet.columns2', prop: 'apiKey', width: ''},
    { label: 'fieldSet.columns3', prop: 'setDefault', width: '150'},
    { label: 'fieldSet.columns4', prop: 'enableFlag', width: '150'}
]);
const optionsData = ref([
    { displayName: '', apiKey: '', defaultFlag: false, enableFlag: true, editStaus: true}
]);
const optionsDataLength = computed(() => optionsData.value.length - 1);
const comOptionsList = ref([]);
const comOptionsTableData = ref([]);
const comOptionsTableDataLength = computed(() => comOptionsTableData.value.length - 1);
const relatedToObjectList = ref([]); // 关联业务对象
const relationshipFieldList = ref([]); // 业务关联关系
const cascadeDeleteTypeList = ref([
    {label: 'fieldSet.cascadeDeleteType1', value: 1},
    {label: 'fieldSet.cascadeDeleteType2', value: 2}
]);
const cascadeDeleteTypeList1 = ref([
    {label: 'fieldSet.cascadeDeleteType3', value: 3}
]);
const relationshipDisplayFieldList = ref([]); // 引用字段
const relationshipDisplayFieldType = ref(''); // 引用字段类型
const representationType = ref([1, 2, 3]);
// 日期类型
const dataTypeList = ref([
    {label: 'fieldSet.radioLabel8', value: 23}, // 日期
    {label: 'fieldSet.radioLabel9', value: 24} // 日期时间
]); 
// 计算类型选项
const calculationTypeList = ref([
    {label: 'fieldSet.calculationType1', value: 16}, // 数字
    {label: 'fieldSet.calculationType2', value: 21}, // 日期
    {label: 'fieldSet.calculationType3', value: 22}, // 日期时间
    {label: 'fieldSet.calculationType4', value: 15}, // 文本
    {label: 'fieldSet.calculationType5', value: 19}, // 货币
    {label: 'fieldSet.calculationType6', value: 20}, // 布尔
    {label: 'fieldSet.calculationType7', value: 18}, // 百分比
    {label: 'fieldSet.calculationType8', value: 17} // 汇总累计
]); 
const calculationObjectList = ref([]); // 已关联业务对象
const calculationObjectFieldList = ref([]); // 已关联业务对象 下的汇总字段
const editOptionsStatus = ref(false);
const batchAddValue = ref('');
const batchSaveLoading = ref(false);
const batchAddVisible = ref(false);
const filterRuleType = ref('1');
// 自动编号 显示格式 插入变量值 
const serialNumFormatList = ref([
    {label: 'fieldSet.serialNumFormat1', value: '{0}'},
    {label: 'fieldSet.serialNumFormat2', value: '{YY}'},
    {label: 'fieldSet.serialNumFormat2', value: '{YYYY}'},
    {label: 'fieldSet.serialNumFormat3', value: '{MM}'},
    {label: 'fieldSet.serialNumFormat4', value: '{DD}'}
]);
const serialNumFormatFeildList = ref([]);
const allPurposeFilterDom = ref(null);
const fieldStandardConfig = ref(null);
// 自定义字段权限判断
const feildShowFlag = computed(() => {
    return {
        defaultValue: {
            show: !fieldStandardConfig.value || fieldStandardConfig.value.defaultValueFlag > 0,
            disabled: fieldStandardConfig.value && fieldStandardConfig.value.defaultValueFlag === 2,
            showRepresentation: !fieldStandardConfig.value || fieldStandardConfig.value.defaultValueFlag === 1
        },
        boolDefaultValue: {
            show: !fieldStandardConfig.value || fieldStandardConfig.value.boolDefaultValueFlag === 1,
            disabled: fieldStandardConfig.value && fieldStandardConfig.value.boolDefaultValueFlag === 2
        },
        option: {
            show: !fieldStandardConfig.value || fieldStandardConfig.value.optionFlag === 1,
            disabled: fieldStandardConfig.value && fieldStandardConfig.value.optionFlag === 2
        },
        filterRuleDetail: {
            show: !fieldStandardConfig.value || fieldStandardConfig.value.filterFlag > 0,
            disabled: fieldStandardConfig.value && fieldStandardConfig.value.filterFlag === 2
        },
        referenceObject: {
            show: !fieldStandardConfig.value || fieldStandardConfig.value.cascadeDeleteFlag > 0,
            disabled: fieldStandardConfig.value && fieldStandardConfig.value.cascadeDeleteFlag === 2
        },
        rolePerList: {
            fieldReadShow: !fieldStandardConfig.value || fieldStandardConfig.value.viewFlag > 0,
            fieldReadDisabled: fieldStandardConfig.value && fieldStandardConfig.value.viewFlag === 2,
            fieldWriteShow: !fieldStandardConfig.value || fieldStandardConfig.value.writeFlag > 0,
            fieldWriteDisabled: fieldStandardConfig.value && fieldStandardConfig.value.writeFlag === 2
        }
        
    };
});
const predefinedFlag = ref(false);
// 查找范围 传个allPurposeFilter的参数 左侧字段列表
const calculationFieldsSource = ref({
    methods: findRelFilterFields,
    methodsName: 'findRelFilterFields',
    data: {
        objectId: currentSettingRow.value.id,
        prefix: '',
        layer: 0
    }
});
// 查找范围 传个allPurposeFilter的参数 右侧字段列表
const calculationDataSource = ref({
    methods: findRelFilterFieldsRange,
    methodsName: 'findRelFilterFieldsRange',
    data: {
        objectId: currentSettingRow.value.id,
        prefix: '',
        layer: 0
    }
});
// 计算公式 传个representation的参数
const calculationLogicFieldsSource = computed(() => {
    return {
        methods: fields4meta,
        methodsName: 'fields4meta',
        data: {
            objectId: currentSettingRow.value.id,
            prefix: '',
            dataType: dataType.value,
            usageType: 3,
            layer: 0
        }
    };
});
// 默认值字段 传个representation的参数
const defaultFieldsSource = computed(() => {
    return {
        methods: fields4meta,
        methodsName: 'fields4meta',
        data: {
            objectId: currentSettingRow.value.id,
            prefix: '',
            dataType: dataType.value,
            referenceObjectId: ruleForm.referenceObjectId,
            usageType: 0,
            layer: 0
        }
    };
});
// 过滤条件 传个allPurposeFilter的参数 左侧字段列表
const filterRuleTypeSource = computed(() => {
    return {
        methods: findCountFieldFilterFields,
        data: {
            objectId: calculationObjectId.value
        }
    };
});
// 关联关系 查找范围组件内操作 重新赋值
const calculationChangeObject = (data) => {
    calculationFieldsSource.value.data.objectId = data.id;
    calculationFieldsSource.value.data.prefix = data.apiKey;
};
// 权限、显示设置 checkbox框操作
const handleChange = (val, type, index) => {
    if (type === 'TypeUse') {
        objectTypeList.value.forEach(item => {
            item.useFlag = val;
            if (!val) {
                item.requiredFlag = val;
            }
        });
        if (!val) {
            allTypeWrite.value = val;
        }
    } else if (type === 'TypeUseList') {
        const arr = objectTypeList.value.filter(item => item.useFlag);
        if (arr.length === objectTypeList.value.length) {
            allTypeUse.value = true;
        } else {
            allTypeUse.value = false;
        }
        if (!val) {
            objectTypeList.value[index].requiredFlag = val;
            handleChange(val, 'TypeWriteList', index);
        }
    } else if (type === 'TypeWrite') {
        objectTypeList.value.forEach(item => {
            item.requiredFlag = val;
            if (val) {
                item.useFlag = val;
            }
        });
        if (val) {
            allTypeUse.value = val;
        }
    } else if (type === 'TypeWriteList') {
        const arr = objectTypeList.value.filter(item => item.requiredFlag);
        if (arr.length === objectTypeList.value.length) {
            allTypeWrite.value = true;
        } else {
            allTypeWrite.value = false;
        }
        if (val) {
            objectTypeList.value[index].useFlag = val;
            handleChange(val, 'TypeUseList', index);
        }
    } else if (type === 'LyoutUse') {
        layoutList.value.forEach(item => {
            item.useFlag = val;
            if (!val) {
                item.commonUseFlag = val;
            }
        });
        if (!val) {
            allLyoutCom.value = val;
        }
    } else if (type === 'LyoutUseList') {
        const arr = layoutList.value.filter(item => item.useFlag);
        if (arr.length === layoutList.value.length) {
            allLyoutUse.value = true;
        } else {
            allLyoutUse.value = false;
        }
        if (!val) {
            layoutList.value[index].commonUseFlag = val;
            handleChange(val, 'LyoutComList', index);
        }
    } else if (type === 'LyoutCom') {
        layoutList.value.forEach(item => {
            item.commonUseFlag = val;
            if (val) {
                item.useFlag = val;
            }
        });
        if (val) {
            allLyoutUse.value = val;
        }
    } else if (type === 'LyoutComList') {
        const arr = layoutList.value.filter(item => item.commonUseFlag);
        if (arr.length === layoutList.value.length) {
            allLyoutCom.value = true;
        } else {
            allLyoutCom.value = false;
        }
        if (val) {
            layoutList.value[index].useFlag = val;
            handleChange(val, 'LyoutUseList', index);
        }
    } else if (type === 'PerUse') {
        rolePerList.value.forEach(item => {
            item.fieldRead = val;
            if (!val) {
                item.fieldWrite = val;
                item.fieldExport = val;
            }
        });
        if (!val) {
            allPerWrite.value = val;
            allPerExport.value = val;
        }
    } else if (type === 'PerUseList') {
        const arr = rolePerList.value.filter(item => item.fieldRead);
        if (arr.length === rolePerList.value.length) {
            allPerUse.value = true;
        } else {
            allPerUse.value = false;
        }
        if (!val) {
            rolePerList.value[index].fieldWrite = val;
            rolePerList.value[index].fieldExport = val;
            handleChange(val, 'PerWriteList', index);
            handleChange(val, 'PerExportList', index);
        }
    } else if (type === 'PerWrite') {
        rolePerList.value.forEach(item => {
            item.fieldWrite = val;
            if (val) {
                item.fieldRead = val;
            }
        });
        if (val) {
            allPerUse.value = val;
        }
    } else if (type === 'PerWriteList') {
        const arr = rolePerList.value.filter(item => item.fieldWrite);
        if (arr.length === rolePerList.value.length) {
            allPerWrite.value = true;
        } else {
            allPerWrite.value = false;
        }
        if (val) {
            rolePerList.value[index].fieldRead = val;
            handleChange(val, 'PerUseList', index);
        }
    } else if (type === 'PerExport') {
        rolePerList.value.forEach(item => {
            item.fieldExport = val;
            if (val) {
                item.fieldRead = val;
            }
        });
        if (val) {
            allPerUse.value = val;
        }
    } else if (type === 'PerExportList') {
        const arr = rolePerList.value.filter(item => item.fieldExport);
        if (arr.length === rolePerList.value.length) {
            allPerExport.value = true;
        } else {
            allPerExport.value = false;
        }
        if (val) {
            rolePerList.value[index].fieldRead = val;
            handleChange(val, 'PerUseList', index);
        }
    }
};
// 获取剩余字段数量
const getFieldCount = () => {
    getCustomFieldCount({
        objectId: currentSettingRow.value.id
    }).then(res => {
        if (res.code === 10000) {
            if (res.data.string128Avail === 0) {
                fieldList.value = fieldList.value.filter(item => item.type !== 'tel');
            }
            if (res.data.string320Avail === 0) {
                fieldList.value = fieldList.value.filter(item => !['text', 'email', 'auto'].includes(item.type));
                calculationTypeList.value = calculationTypeList.value.filter(item => item.value !== 15);
            }
            if (res.data.doubleAvail === 0) {
                fieldList.value = fieldList.value.filter(item => !['percentage', 'real'].includes(item.type));
                calculationTypeList.value = calculationTypeList.value.filter(item => ![16, 17, 18].includes(item.value));
            }
            if (res.data.jsonbAvail === 0) {
                fieldList.value = fieldList.value.filter(item => !['currency'].includes(item.type));
                calculationTypeList.value = calculationTypeList.value.filter(item => ![19].includes(item.value));
            }
            if (res.data.bigintAvail === 0) {
                fieldList.value = fieldList.value.filter(item => !['select', 'association', 'relation', 'reference', 'integer'].includes(item.type));
            }
            if (res.data.bigintArrayAvail === 0) {
                fieldList.value = fieldList.value.filter(item => !['multiple', 'pic', 'file'].includes(item.type));
            }
            if (res.data.string3000Avail === 0) {
                fieldList.value = fieldList.value.filter(item => !['url'].includes(item.type));
            }
            if (res.data.textAvail === 0) {
                fieldList.value = fieldList.value.filter(item => !['textarea'].includes(item.type));
            }
            if (res.data.dateAvail === 0) {
                dataTypeList.value = dataTypeList.value.filter(item => ![23].includes(item.value));
                calculationTypeList.value = calculationTypeList.value.filter(item => ![21].includes(item.value));
            }
            if (res.data.datetimeAvail === 0) {
                dataTypeList.value = dataTypeList.value.filter(item => ![24].includes(item.value));
                calculationTypeList.value = calculationTypeList.value.filter(item => ![22].includes(item.value));
            }
            if (res.data.smallintAvail === 0) {
                fieldList.value = fieldList.value.filter(item => !['boolean'].includes(item.type));
                calculationTypeList.value = calculationTypeList.value.filter(item => ![20].includes(item.value));
            }
            if (res.data.pointAvail === 0) {
                fieldList.value = fieldList.value.filter(item => !['position'].includes(item.type));
            }
            if (dataTypeList.value.length === 0) {
                fieldList.value = fieldList.value.filter(item => !['datetime'].includes(item.type));
            }
            if (calculationTypeList.value.length === 0) {
                fieldList.value = fieldList.value.filter(item => !['compute'].includes(item.type));
            }
            if (fieldList.value.length === 0) {
                ElMessage.error('该对象的自定义字段已达上限！');
                closeDialog();
                return;
            }
            changeFieldType(fieldList.value[0]);
        }
    });
};
// 获取在业务对象类型中使用、在布局中使用、字段权限
const getObjFieldSetInfo = () => {
    addObjFieldSetInfo({
        objectId: currentSettingRow.value.id
    }).then(res => {
        if (res.code === 10000) {
            objectTypeList.value = res.data.objType || [];
            layoutList.value = res.data.layout || [];
            rolePerList.value = res.data.rolePermission || [];
            objectTypeList.value.forEach((item) => {
                item.requiredFlag = false;
                item.useFlag = true;
            });
            layoutList.value.forEach((item) => {
                item.commonUseFlag = false;
                item.useFlag = true;
            });
            rolePerList.value.forEach((item) => {
                item.fieldRead = true;
                item.fieldWrite = true;
                item.fieldExport = true;
            });
        } else {
            objectTypeList.value = [];
            layoutList.value = [];
            rolePerList.value = [];
        }
    });
};
// 创建自定义字段时apiKey的生成
const getKey = () => {
    createApiKey({
        objectId: currentSettingRow.value.id,
        type: '3',
        apiKey: currentSettingRow.value.apiKey
    }).then(res => {
        if (res.code == 10000) {
            ruleForm.apiKey = res.data;
        }
    });
};
// 根据字段ID获取字段信息
const getFieldInfo = () => {
    const booleanOptions = ['uniqueFlag', 'isIncludeExistData', 'relationshipFilterRange', 'optionOrderType'];
    objFieldInfo({
        fieldId: Number(props.id),
        objectId: currentSettingRow.value.id
    }).then(async (res) => {
        if (res.code == 10000) {
            const fieldInfo = res.data.fieldInfo;
            fieldStandardConfig.value = res.data.fieldStandardConfig;
            predefinedFlag.value = fieldInfo.predefinedFlag === 1;
            if (fieldInfo.dataType === 30) {
                await getRelationObjFieldList(fieldInfo.relationshipFieldId);
                changereferenceFieldId(fieldInfo.referenceFieldId);
            }
            dataType.value = fieldInfo.dataType;
            // 31 32 是累计汇总 汇总字段里 日期和日期时间 字段 的处理
            if (fieldInfo.dataType === 17 || fieldInfo.dataType === 31 || fieldInfo.dataType === 32) {
                // const arr = calculationObjectList.value.filter(item => item.id === ruleForm.calculationObjectId);
                calculationObjectId.value = fieldInfo.calculationObjectId;
                await queryStatisticFields({
                    objId: fieldInfo.calculationObjectId,
                    statisticsType: fieldInfo.statisticsType
                }).then(res => {
                    if (res.code === 10000) {
                        calculationObjectFieldList.value = res.data;
                    } else {
                        calculationObjectFieldList.value = [];
                    }
                });
                fieldInfo.dataType = 17;
            }
            for (let key in ruleForm) {
                if (booleanOptions.includes(key)) {
                    ruleForm[key] = fieldInfo[key] === 1 ? true : false;
                } else {
                    ruleForm[key] = fieldInfo[key];
                }
            }
            ruleForm.calculationType = fieldInfo.dataType;
            ruleForm.defaultValue = fieldInfo.defaultValue || '';
            ruleForm.defaultValue = fieldInfo.defaultValue || '';
            const arr = fieldList.value.filter(item => item.dataType === fieldInfo.dataType);
            if (arr.length > 0) {
                fieldType.value = arr[0].type;
            } else {
                switch (`${fieldInfo.dataType}`) {
                    case '9':
                        fieldType.value = 'currency';
                        break;
                    case '15':
                    case '16':
                    case '17':
                    case '18':
                    case '19':
                    case '20':
                    case '21':
                    case '22':
                        fieldType.value = 'compute';
                        break;
                    case '24':
                        fieldType.value = 'datetime';
                        break;
                    case '33':
                        fieldType.value = 'followup';
                        break;
                    default:
                        break;
                }
            }
            if (fieldType.value === 'text') {
                maxTextLength.value = 300;
            } else if (fieldType.value === 'textarea') {
                maxTextLength.value = 65535;
            } else if (fieldType.value === 'tel') {
                maxTextLength.value = 100;
            } else if (fieldType.value === 'email') {
                maxTextLength.value = 320;
            } else if (fieldType.value === 'url') {
                maxTextLength.value = 3000;
            } else if (fieldType.value === 'relation' || fieldType.value === 'association') {
                representationType.value = [1];
                changeReferenceObjectId(fieldInfo.referenceObjectId);
            }
            if (fieldInfo.filterRuleDetail) {
                const filterRuleDetail = fieldInfo.filterRuleDetail;
                filterType.value = filterRuleDetail.filterType;
                conditions.value = filterRuleDetail.conditions;
                expression.value = filterRuleDetail.expression;
                filterRuleType.value = filterRuleDetail.filterType === 0 ? '1' : '2';
            }
            if (fieldInfo.optionInfos && fieldInfo.optionInfos.length) {
                if (fieldInfo.optionSourceType === 1) {
                    optionsData.value = fieldInfo.optionInfos.map(item => {
                        item.enableFlag = item.enableFlag === 1 ? true : false;
                        item.defaultFlag = item.defaultFlag === 1 ? true : false;
                        return item;
                    });
                    if (feildShowFlag.value.option.show) {
                        optionsData.value.push({ displayName: '', apiKey: '', defaultFlag: false, enableFlag: true, editStaus: true});
                    }
                    nextTick(() => {
                        setSortable('optionTable');
                    });
                } else {
                    comOptionsTableData.value = fieldInfo.optionInfos.map(item => {
                        item.enableFlag = item.enableFlag === 1 ? true : false;
                        item.defaultFlag = item.defaultFlag === 1 ? true : false;
                        return item;
                    });
                }
            }
            if (fieldInfo.serialNumFormat) {
                serialNumFormatInput(fieldInfo.serialNumFormat);
            }
            let requiredLength = 0;
            let useFlag = 0;
            objectTypeList.value = res.data.objType.map(item => {
                if (item.requiredFlag === 1) {
                    requiredLength++;
                    item.requiredFlag = true;
                } else {
                    item.requiredFlag = false;
                }
                if (item.useFlag === 1) {
                    useFlag++;
                    item.useFlag = true;
                } else {
                    item.useFlag = false;
                }
                return item;
            });
            if (requiredLength === objectTypeList.value.length) {
                allTypeWrite.value = true;
            } else {
                allTypeWrite.value = false;
            }
            if (useFlag === objectTypeList.value.length) {
                allTypeUse.value = true;
            } else {
                allTypeUse.value = false;
            }
            let commonUseFlagLength = 0;
            let useFlag1 = 0;
            layoutList.value = res.data.layout.map(item => {
                if (item.commonUseFlag === 1) {
                    commonUseFlagLength++;
                    item.commonUseFlag = true;
                } else {
                    item.commonUseFlag = false;
                }
                if (item.useFlag === 1) {
                    useFlag1++;
                    item.useFlag = true;
                } else {
                    item.useFlag = false;
                }
                return item;
            });
            if (commonUseFlagLength === layoutList.value.length) {
                allLyoutCom.value = true;
            } else {
                allLyoutCom.value = false;
            }
            if (useFlag1 === layoutList.value.length) {
                allLyoutUse.value = true;
            } else {
                allLyoutUse.value = false;
            }
            if (res.data.businessFieldRole) {
                let fieldReadLength = 0;
                let fieldWriteLength = 0;
                let fieldExportLength = 0;
                rolePerList.value = res.data.businessFieldRole.map(item => {
                    if (item.fieldRead === 1) {
                        fieldReadLength++;
                        item.fieldRead = true;
                    } else {
                        item.fieldRead = false;
                    }
                    if (item.fieldWrite === 1) {
                        fieldWriteLength++;
                        item.fieldWrite = true;
                    } else {
                        item.fieldWrite = false;
                    }
                    if (item.fieldExport === 1) {
                        fieldExportLength++;
                        item.fieldExport = true;
                    } else {
                        item.fieldExport = false;
                    }
                    return item;
                });
                if (rolePerList.value.length === 0) {
                    allPerUse.value = false;
                    allPerWrite.value = false;
                    allPerExport.value = false;
                } else {
                    if (fieldReadLength === rolePerList.value.length) {
                        allPerUse.value = true;
                    } else {
                        allPerUse.value = false;
                    }
                    if (fieldWriteLength === rolePerList.value.length) {
                        allPerWrite.value = true;
                    } else {
                        allPerWrite.value = false;
                    }
                    if (fieldExportLength === rolePerList.value.length) {
                        allPerExport.value = true;
                    } else {
                        allPerExport.value = false;
                    }
                }
                
            } else {
                allPerUse.value = false;
                allPerWrite.value = false;
                allPerExport.value = false;
            }
        } else {
            ElMessage.error(res.messageShow);
            closeDialog();
        }
    });
};
// 多选、单选 通用选项数据
const getComOptionList = () => {
    getCommonOptionList().then(res => {
        if (res.code === 10000) {
            comOptionsList.value = res.data;
        } else {
            ElMessage.error(res.messageShow);
        }
    });
};

// 获取选中 通用选项集下的选项数据
const handleChangeCommonOption = (val) => {
    listOptionsSet({id: val}).then(res => {
        if (res.code === 10000) {
            comOptionsTableData.value = res.data.map(item => {
                item.enableFlag = item.enabledFlag === 1;
                item.isDefault = false;
                return item;
            });
        } else {
            ElMessage.error(res.messageShow);
        }
    });
};
// 自动编号 获取插入字段数据
const getFields4meta = () => {
    fields4meta({
        objectId: currentSettingRow.value.id,
        usageType: 1,
        layer: 0
    }).then(res => {
        if (res.code === 10000) {
            serialNumFormatFeildList.value = res.data.map(item => {
                return {
                    displayName: item.displayName,
                    value: `{${item.apiKeyValue}}`
                };
            });
        } else {
            ElMessage.error(res.messageShow);
        }
    });
};
// 关联关系（一般关系，主子明细） 关联业务对象列表的接口
const getRelationObjList = (editFlag = null) => {
    queryRelationObjList({editFlag}).then(res => {
        if (res.code === 10000) {
            relatedToObjectList.value = res.data;
        } else {
            ElMessage.error(res.messageShow);
        }
    });
};
const changeReferenceObjectIdStatus = ref(true);
const changeReferenceObjectId = (val) => {
    changeReferenceObjectIdStatus.value = false;
    nextTick(() => {
        calculationFieldsSource.value.data.objectId = val;
        changeReferenceObjectIdStatus.value = true;
    });
};
// 引用数据 业务关联关系
const getRelationFieldList = () => {
    queryRelationFieldList({
        objectId: currentSettingRow.value.id
    }).then(res => {
        if (res.code === 10000) {
            relationshipFieldList.value = res.data;
        } else {
            relationshipFieldList.value = [];
            ElMessage.error(res.messageShow);
        }
    });
};
// 引用数据 业务关联关系下的字段
const getRelationObjFieldList = (id) => {
    return new Promise((resolve, reject) => {
        const arr = relationshipFieldList.value.filter(item => item.id === id);
        queryRelationObjFieldList({
            objectId: arr[0].referenceObjectId
        }).then(res => {
            if (res.code === 10000) {
                relationshipDisplayFieldList.value = res.data;
            } else {
                relationshipDisplayFieldList.value = [];
            }
            resolve();
        });
    });
    
};
// 切换引用数据 业务关联关系
const changereferenceFieldId = (id) => {
    const curList = relationshipDisplayFieldList.value.find(item => item.id === id);
    relationshipDisplayFieldType.value = fieldsNamesMap[curList.dataType];
    // const arr = fieldList.value.filter(item => item.dataType === curList[0].dataType);
    // if (arr.length > 0) {
    //     relationshipDisplayFieldType.value = arr[0].label;
    // } else {
    //     switch (`${curList[0].dataType}`) {
    //         case '9':
    //             relationshipDisplayFieldType.value = 'fieldSet.fieldType10';
    //             break;
    //         case '16':
    //         case '17':
    //         case '18':
    //         case '19':
    //         case '20':
    //         case '21':
    //         case '22':
    //             relationshipDisplayFieldType.value = 'fieldSet.fieldType16';
    //             break;
    //         case '24':
    //             relationshipDisplayFieldType.value = 'fieldSet.fieldType11';
    //             break;
    //         default:
    //             break;
    //     }
    // }
};
// 计算类型 汇总累计 已关联业务对象
const getChildBizObjList = () => {
    // childBizObjList({
    //     parentObjectId: currentSettingRow.value.id
    // }).then(res => {
    //     if (res.code === 10000) {
    //         calculationObjectList.value = res.data;
    //     } else {
    //         calculationObjectList.value = [];
    //     }
    // });
    return new Promise((resolve, reject) => {
        queryRelationFieldList({
            objectId: currentSettingRow.value.id,
            relationType: 1
        }).then(res => {
            if (res.code === 10000) {
                calculationObjectList.value = res.data;
            } else {
                calculationObjectList.value = [];
            }
            resolve();
        });
    });
};
// 获取汇总字段
const calculationObjectId = ref('');
const getQueryStatisticFields = (val, type) => {
    if (ruleForm.relationshipFieldId) {
        if (type) {
            changeReferenceObjectIdStatus.value = false;
            nextTick(() => {
                changeReferenceObjectIdStatus.value = true;
            });
        }
        const arr = calculationObjectList.value.filter(item => item.id === ruleForm.relationshipFieldId);
        calculationObjectId.value = arr[0].objectId;
        queryStatisticFields({
            objId: calculationObjectId.value,
            statisticsType: ruleForm.statisticsType
        }).then(res => {
            if (res.code === 10000) {
                calculationObjectFieldList.value = res.data;
            } else {
                calculationObjectFieldList.value = [];
            }
        });
    } else {
        calculationObjectId.value = '';
        calculationObjectFieldList.value = [];
    }
    
};
// 切换汇总字段时给dataType 要多两个值
const changeCalculationFieldId = (val) => {
    const current = calculationObjectFieldList.value.find(item => item.id === val);
    if (current.dataType === 23) {
        dataType.value = 31;
    } else if (current.dataType === 24) {
        dataType.value = 32;
    } else {
        dataType.value = 17;
    }
};
onMounted(async () => {
    // 新建编辑
    if (props.id) {
        objectTypeList.value = [];
        layoutList.value = [];
        rolePerList.value = [];
        if (['28', '29', '33'].includes(props.editType)) {
            if (props.editType === '33') {
                fieldList.value.splice(13, 0, {
                    label: 'fieldSet.fieldType14', type: 'followup', dataType: 33 
                });
            }
            getRelationObjList(1);
        } else if (props.editType === '30') {
            getRelationFieldList();
        } else if (['17', '31', '32'].includes(props.editType)) {
            await getChildBizObjList();
        } else if (['25', '26'].includes(props.editType)) {
            getComOptionList();
        } else if (props.editType === '12') {
            getFields4meta();
        }
        getFieldInfo();
    } else {
        getFieldCount();
        getObjFieldSetInfo();
        getKey();
    }
});

// 切换字段类型
const changeFieldType = (row) => {
    if (props.id) return;
    const val = row.type;
    if (val === fieldType.value) return;
    fieldType.value = val;
    dataType.value = row.dataType;
    ruleFormRef.value.clearValidate();
    optionsData.value = [{ displayName: '', apiKey: '', defaultFlag: false, enableFlag: true, editStaus: true}];
    representationType.value = [1, 2, 3];
    objectTypeList.value.forEach((item) => {
        item.requiredFlag = false;
        item.useFlag = true;
    });
    allTypeUse.value = true;
    allTypeWrite.value = false;
    layoutList.value.forEach((item) => {
        item.commonUseFlag = false;
        item.useFlag = true;
    });
    allLyoutUse.value = true;
    allLyoutCom.value = false;
    rolePerList.value.forEach((item) => {
        item.fieldRead = true;
        item.fieldWrite = ['auto', 'reference', 'compute'].includes(val) ? false : true;
        item.fieldExport = true;
    });
    allPerUse.value = true;
    allPerWrite.value = ['auto', 'reference', 'compute'].includes(val) ? false : true;
    allPerExport.value = true;
    ruleForm.commonOptionId = '';
    comOptionsTableData.value = [];
    ruleForm.digitLeft = 15;
    if (val === 'text') {
        ruleForm.maxTextLength = 300;
        maxTextLength.value = 300;
    } else if (val === 'textarea') {
        ruleForm.maxTextLength = 65535;
        maxTextLength.value = 65535;
    } else if (val === 'tel') {
        ruleForm.maxTextLength = 100;
        maxTextLength.value = 100;
    } else if (val === 'email') {
        ruleForm.maxTextLength = 320;
        maxTextLength.value = 320;
    } else if (val === 'url') {
        maxTextLength.value = 3000;
        ruleForm.maxTextLength = 300;
    } else if (val === 'datetime') {
        ruleForm.dataType = dataTypeList.value[0].value;
        dataType.value = dataTypeList.value[0].value;
    } else if (val === 'currency') {
        ruleForm.dataType = 8;
    } else if (val === 'relation' || val === 'association') {
        if (relatedToObjectList.value.length === 0) {
            getRelationObjList();
        }
        calculationFieldsSource.value.data.objectId = currentSettingRow.value.id;
        representationType.value = [1];
        if (val === 'association') {
            ruleForm.cascadeDeleteType = 1;
        } else {
            ruleForm.cascadeDeleteType = 3;
        }
    } else if (val === 'reference' || val === 'compute' || val === 'auto') {
        if (val === 'reference' && relationshipFieldList.value.length === 0) {
            getRelationFieldList();
        }
        if (val === 'auto' && serialNumFormatFeildList.value.length === 0) {
            getFields4meta();
            handleSerialNumFormat(serialNumFormatList.value[0]);
        }
        if (val === 'compute') {
            ruleForm.calculationType = calculationTypeList.value[0].value;
            dataType.value = calculationTypeList.value[0].value;
        }
    } else if (val === 'select' || val === 'multiple') {
        if (comOptionsList.value.length === 0) {
            getComOptionList();
        }
        ruleForm.optionSourceType = 1;
        nextTick(() => {
            setSortable('optionTable');
        });
    } else if (val === 'percentage') {
        ruleForm.digitLeft = 10;
    } else if (val === 'position') {
        ruleForm.digitScale = 15;
    }
    scrollbarRef.value.setScrollTop(0);
};
// dataType 切换
const handleChangeDataType = (val) => {
    dataType.value = val;
    if (val === 17) {
        filterType.value = 1;
        if (calculationObjectList.value.length === 0) {
            getChildBizObjList();
        }
    }
};
// 单选、多选 添加自定义选项
const addOptions = (row, rowIndex) => {
    if (optionsData.value.length > 1000) return;
    if (row.displayName.trim()) {
        const flag = optionsData.value.some((item, index) => (item.displayName === row.displayName.trim() || item.apiKey === row.apiKey) && index !== rowIndex);
        if (flag) {
            ElMessage.error('选项名称/程序识别名称重复');
            return;
        }
        row.displayName = row.displayName.trim();
        if (!row.apiKey) {
            let rowKey = 1;
            const arr = optionsData.value.map((item) => Number(item.apiKey)).filter((item) => !isNaN(item));
            optionsData.value.forEach((item, index) => {
                if (item.apiKey && !isNaN(Number(item.apiKey)) && arr.includes(rowKey)) {
                    // console.log(item.apiKey);
                    rowKey++;
                }
            });
            row.apiKey = rowKey.toString();
        }
        row.editStaus = false;
        optionsData.value.push({ displayName: '', apiKey: '', defaultFlag: false, enableFlag: true, editStaus: true});
    } else {
        if (!row.displayName.trim()) {
            ElMessage.error('请填写选项名称');
        }
    }
};
// 单选、多选 编辑自定义选项
const oldOptionsRow = ref(null); // 记住之前的自定义选项，取消时要还原
const handleEditOptions = (row, index) => {
    if (optionsData.value.length > 1000) return;
    if (editOptionsStatus.value) {
        ElMessage.warning('请先保存当前编辑项');
        return;
    }
    if (replaceOptions.value.length) {
        const index = replaceOptions.value.findIndex((item) => item.newApiKey === deleteRow.value.apiKey);
        if (index !== -1) {
            ElMessage.error('替换值已被引用,不能编辑');
            return;
        }
    }
    editOptionsStatus.value = true;
    oldOptionsRow.value = JSON.parse(JSON.stringify(row));
    row.editStaus = true;
};
const handleFocus = () => {
    optionTableSortable.value && optionTableSortable.value.option('disabled', true);
};
const bandleBlur = () => {
    optionTableSortable.value && optionTableSortable.value.option('disabled', false);
};
// 单选、多选 保存编辑的自定义选项
const saveOptions = (row, rowIndex) => {
    if (row.displayName.trim() && row.apiKey) {
        const flag = optionsData.value.some((item, index) => ((item.displayName.trim() === row.displayName.trim() || item.apiKey === row.apiKey) && index !== rowIndex));
        if (flag) {
            ElMessage.error('选项名称/程序识别名称重复');
            return;
        }
        row.editStaus = false;
        editOptionsStatus.value = false;
    } else {
        ElMessage.error('请填写选项名称/程序识别名称');
    }
};
// 单选、多选 取消编辑自定义选项
const cancelOptions = (row, index) => {
    row.displayName = oldOptionsRow.value.displayName;
    row.apiKey = oldOptionsRow.value.apiKey;
    row.editStaus = false;
    editOptionsStatus.value = false;
};
const deleteVisible = ref(false);
const deleteReplaceVisible = ref(false);
const deleteRow = ref(null);
const deleteRowIndex = ref(0);
const replaceOptions = ref([]);
const replaceType = ref('1');
const replaceVal = ref(null);
const replaceList = computed(() => {
    return optionsData.value.filter((item) => item.apiKey !== deleteRow.value.apiKey).filter((item) => item.apiKey && item.displayName);
});
// 单选、多选 删除自定义选项
const handleDelOptions = (row, index) => {
    deleteRow.value = row;
    deleteRowIndex.value = index;
    if (props.id) {
        if (replaceOptions.value.length) {
            const index = replaceOptions.value.findIndex((item) => item.newApiKey === deleteRow.value.apiKey);
            if (index !== -1) {
                ElMessage.error('删除失败，替换值已被引用');
                return;
            }
        }
        if (row.id) {
            enableDelOptionTag({
                optionId: row.id,
                fieldId: Number(props.id),
                objectId: currentSettingRow.value.id
            }).then((res) => {
                if (res.code === 10000) {
                    if (res.data) {
                        deleteVisible.value = true;
                    } else {
                        deleteReplaceVisible.value = true;
                    }
                }
            });
        } else {
            optionsData.value.splice(deleteRowIndex.value, 1);
        }
    } else {
        optionsData.value.splice(deleteRowIndex.value, 1);
    }
};
// 删除确认弹窗后的操作
const handleDelete = () => {
    optionsData.value.splice(deleteRowIndex.value, 1);
    deleteVisible.value = false;
};
// 替换弹窗确认后的操作
const deleteReplaceSave = () => {
    if (replaceType.value === '1') {
        if (!replaceVal.value) {
            ElMessage.error('请选择替换记录的值');
            return;
        }
        const current = replaceList.value.find((item) => item.apiKey === replaceVal.value);
        replaceOptions.value.push({
            oldOptionId: deleteRow.value.id,
            newOptionId: current.id,
            newApiKey: current.apiKey
        });
    } else {
        replaceOptions.value.push({
            oldOptionId: deleteRow.value.id,
            newOptionId: -1,
            newApiKey: null
        });
    }
    optionsData.value.splice(deleteRowIndex.value, 1);
    closeReplaceModal();
};
// 关闭替换弹窗
const closeReplaceModal = () => {
    replaceType.value = '1';
    replaceVal.value = null;
    deleteReplaceVisible.value = false;
};
// 单选、多选 批量添加自定义选项
const batchSave = async () => {
    if (batchSaveLoading.value) {
        ElMessage.error('处理中，请稍后...');
        return;
    }
    batchSaveLoading.value = true;
    const batchValues = batchAddValue.value.split('\n');
    for (let i = 0; i < batchValues.length; i++) {
        if (optionsData.value.length > 1000) {
            closeModal();
            return;
        }
        const flag = optionsData.value.some((item, index) => item.displayName === batchValues[i].trim());
        if (!flag) {
            let len = optionsData.value.length - 1;
            let rowKey = 1;
            const arr = optionsData.value.map((item) => Number(item.apiKey)).filter((item) => !isNaN(item));
            optionsData.value.forEach((item, index) => {
                if (item.apiKey && !isNaN(Number(item.apiKey)) && arr.includes(rowKey)) {
                    rowKey++;
                }
            });
            optionsData.value[len] = {
                displayName: batchValues[i].trim(),
                apiKey: `${rowKey}`,
                defaultFlag: false,
                enableFlag: true,
                editStaus: false
            };
            optionsData.value.push({ displayName: '', apiKey: '', defaultFlag: false, enableFlag: true, editStaus: true});
        }
        
    }
    closeModal();
    
};
// 单选、多选 打开批量添加自定义弹窗
const batchAddOptions = () => {
    if (optionsData.value.length > 1000) return;
    batchAddValue.value = '';
    batchAddVisible.value = true;
};
// 单选、多选关闭批量添加自定义弹窗
const closeModal = () => {
    batchAddVisible.value = false;
    nextTick(() => {
        batchSaveLoading.value = false;
    });
};
// 单选、多选 自定义选项table
const rowClassName = ({ row, rowIndex }) => {
    if (rowIndex === (optionsDataLength.value)) {
        return 'table-disable';
    } else {
        return 'cursor-move';
    }
};
// 单选、多选 通用选项table
// const comOptionsRowClassName = ({ row, rowIndex }) => {
//     return 'cursor-move';
// };
const optionSourceTypeChange = (val) => {
    if (val === 1) {
        setSortable('optionTable');
    }
};
const changeDefault = (val, row, index) => {
    if (val) {
        if (ruleForm.optionSourceType === 1) {
            optionsData.value.forEach((item, i) => {
                if (index !== i) {
                    item.defaultFlag = false;
                }
            });
        } else {
            comOptionsTableData.value.forEach((item, i) => {
                if (index !== i) {
                    item.defaultFlag = false;
                }
            });
        }
       
    }
};
// 单选、多选 拖拽排序
const optionTableSortable = ref(null);
// const commonOptionTableSortable = ref(null);
// 清除拖拽排序
const clearSortable = () => {
    if (optionTableSortable.value) {
        optionTableSortable.value.destroy();
        optionTableSortable.value = null;
    }
    // if (commonOptionTableSortable.value) {
    //     commonOptionTableSortable.value.destroy();
    //     commonOptionTableSortable.value = null;
    // }
};
// 拖拽排序
const setSortable = (name) => {
    clearSortable();
    if (name === 'optionTable') {
        const sortTable = document.querySelector('.optionTable .xhl-el-table__body-wrapper tbody');
        optionTableSortable.value = Sortable.create(sortTable, {
            group: {
                // name: 'id',
                pull: false,
                put: false
            },
            handle: '.xhl-el-table__row',
            filter: '.table-disable',
            animation: 120,
            onEnd: onSortEnd
        });
    }
    // if (name === 'commonOptionTable') {
    //     const sortTable = document.querySelector('.commonOptionTable .xhl-el-table__body-wrapper tbody');
    //     commonOptionTableSortable.value = Sortable.create(sortTable, {
    //         group: {
    //             name: 'id',
    //             pull: false,
    //             put: false
    //         },
    //         handle: '.xhl-el-table__row',
    //         filter: '.table-disable',
    //         animation: 120,
    //         onEnd: onSortEndCom
    //     });
    // }
};
// 自定义选项排序结束
const onSortEnd = ({ newIndex, oldIndex }) => {
    if (newIndex === oldIndex) return;
    if (newIndex === optionsDataLength.value) {
        newIndex = optionsDataLength.value - 1;
    }
    // 拖拽后重新排序
    const newData = [...optionsData.value];
    const currRow = newData.splice(oldIndex, 1)[0];
    newData.splice(newIndex, 0, currRow);
    optionsData.value = [];
    nextTick(() => {
        optionsData.value = newData;
    });
};
// 通用选项排序结束
// const onSortEndCom = ({ newIndex, oldIndex }) => {
//     if (newIndex === oldIndex) return;
//     // 拖拽后重新排序
//     const newData = [...comOptionsTableData.value];
//     const currRow = newData.splice(oldIndex, 1)[0];
//     newData.splice(newIndex, 0, currRow);
//     comOptionsTableData.value = [];
//     nextTick(() => {
//         comOptionsTableData.value = newData;
//         console.log(comOptionsTableData.value);
//     });
// };
// 最大长度、最小长度输入限制 只能输入数字
const inputNumber = (key) => {
    ruleForm[key] = ruleForm[key].replace(/[^\d]/g, '');
    
};
const inputApiKey = () => {
    ruleForm.apiKey = ruleForm.apiKey.replace(/[^a-zA-Z0-9_]/g, '');
};
const inputOptionsApiKey = (row) => {
    row.apiKey = row.apiKey.replace(/[^a-zA-Z0-9_]/g, '');
};
// 字段默认值设置相关
const defaultValueDom = ref(null);
const defaultValueSelectionStart = ref(null);
const defaultValueSelectionEnd = ref(null);
// 默认值 focus 时记住光标位置
const defaultValueBlur = (val) => {
    const textareaDom = val.target;
    defaultValueSelectionStart.value = textareaDom.selectionStart;
    defaultValueSelectionEnd.value = textareaDom.selectionEnd;
};
// 设置默认值
const changeDefaultValue = (data) => {
    if (defaultValueSelectionEnd.value > defaultValueSelectionStart.value) {
        ruleForm.defaultValue = (ruleForm.defaultValue.slice(0, defaultValueSelectionStart.value) + data.valueString + ruleForm.defaultValue.slice(defaultValueSelectionEnd.value)).slice(0, 1000);
    } else {
        ruleForm.defaultValue = ruleForm.defaultValue.slice(0, defaultValueSelectionStart.value) + data.valueString + ruleForm.defaultValue.slice(defaultValueSelectionStart.value).slice(0, 1000);
    }
    // 使用nextTick不能够设置focus，所以使用setTimeout了
    setTimeout(() => {
        defaultValueDom.value.focus();
        const start = defaultValueSelectionStart.value + data.valueString.length;
        defaultValueDom.value.textarea.setSelectionRange(start, start);
    }, 200);
    
};
// 自动编号 显示格式
const serialNumFormatDom = ref(null);
const serialNumSelectionStart = ref(null);
const serialNumSelectionEnd = ref(null);
const serialNumFormatShow = ref('');
// 显示格式 focus 时记住光标位置
const serialNumFormatBlur = (val) => {
    const textareaDom = val.target;
    serialNumSelectionStart.value = textareaDom.selectionStart;
    serialNumSelectionEnd.value = textareaDom.selectionEnd;
};
// 设置 显示格式
const handleSerialNumFormat = (data) => {
    if (serialNumSelectionEnd.value > serialNumSelectionStart.value) {
        ruleForm.serialNumFormat = (ruleForm.serialNumFormat.slice(0, serialNumSelectionStart.value) + data.value + ruleForm.serialNumFormat.slice(serialNumSelectionEnd.value)).slice(0, 1000);
    } else {
        ruleForm.serialNumFormat = ruleForm.serialNumFormat.slice(0, serialNumSelectionStart.value) + data.value + ruleForm.serialNumFormat.slice(serialNumSelectionStart.value).slice(0, 1000);
    }
    serialNumFormatInput(ruleForm.serialNumFormat);
    // 使用nextTick不能够设置focus，所以使用setTimeout了
    setTimeout(() => {
        serialNumFormatDom.value.focus();
        const start = serialNumSelectionStart.value + data.value.length;
        serialNumFormatDom.value.textarea.setSelectionRange(start, start);
    }, 200);
};

const yyyy = new Date().getFullYear();
const yy = yyyy.toString().slice(2);
const month = new Date().getMonth() + 1 < 10 ? `0${new Date().getMonth() + 1}` : new Date().getMonth() + 1;
const day = new Date().getDate() < 10 ? `0${new Date().getDate()}` : new Date().getDate();
// 编号预览
const serialNumFormatInput = (val) => {
    serialNumFormatShow.value = val;
    if (serialNumFormatFeildList.value.length) {
        let n = 0;
        for (let i = 0; i < serialNumFormatFeildList.value.length; i++) {
            let str = serialNumFormatFeildList.value[i].value;
            if (val.indexOf(str) !== -1) {
                if (n > 4) {
                    serialNumFormatShow.value = '最多使用5个字段';
                    return;
                }
                
                serialNumFormatShow.value = serialNumFormatShow.value .replace(str, serialNumFormatFeildList.value[i].displayName);
                n++;
            }
            if (serialNumFormatShow.value.indexOf(str) !== -1) {
                serialNumFormatShow.value = '不能使用重复字段';
                return;
            }
        }
    }
    serialNumFormatShow.value = serialNumFormatShow.value.replace(/\{[y]{2}}/gi, yy).replace(/\{[y]{4}}/gi, yyyy).replace(/\{[m]{2}}/gi, month).replace(/\{[d]{2}}/gi, day).slice(0, 1000);
    let strs = serialNumFormatShow.value.match(/{0+}/g);
    // 处理{0}
    if (strs != null && strs.length > 0) {
        for (let i = 0;i < strs.length;i++) {
            let str = strs[i];
            let ii = '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001';
            if (str.length > 2) {
                serialNumFormatShow.value = serialNumFormatShow.value.replace(str, ii.substring(ii.length - (str.length - 2) ));
            }
        }
    }
};
// 计算公式
const calculationLogicDom = ref(null);
const calculationLogicSelectionStart = ref(null);
const calculationLogicSelectionEnd = ref(null);
// 计算公式 focus 时记住光标位置
const calculationLogicBlur = (e) => {
    const textareaDom = e.target;
    calculationLogicSelectionStart.value = textareaDom.selectionStart;
    calculationLogicSelectionEnd.value = textareaDom.selectionEnd;
};
// 设置 计算公式
const changeCalculationLogic = (data) => {
    if (calculationLogicSelectionEnd.value > calculationLogicSelectionStart.value) {
        ruleForm.calculationLogic = (ruleForm.calculationLogic.slice(0, calculationLogicSelectionStart.value) + data.valueString + ruleForm.calculationLogic.slice(calculationLogicSelectionEnd.value)).slice(0, 1000);
    } else {
        ruleForm.calculationLogic = ruleForm.calculationLogic.slice(0, calculationLogicSelectionStart.value) + data.valueString + ruleForm.calculationLogic.slice(calculationLogicSelectionStart.value).slice(0, 1000);
    }
    // 使用nextTick不能够设置focus，所以使用setTimeout了
    setTimeout(() => {
        calculationLogicDom.value.focus();
        const start = calculationLogicSelectionStart.value + data.valueString.length;
        calculationLogicDom.value.textarea.setSelectionRange(start, start);
    }, 200);
};
// 保存字段
const submitForm = async (formEl) => {
    if (!formEl) return;
    await formEl.validate((valid) => {
        if (valid) {
            if (fieldType.value === 'auto') {
                if (['最多使用5个字段', '不能使用重复字段'].includes(serialNumFormatShow.value)) return;
                let strs = ruleForm.serialNumFormat.match(/{0+}/g);
                if (strs === null || strs.length === 0) {
                    ElMessage.error('显示格式中的序列编号{0}为必填项');
                    return;
                }
            } 
            const data = Object.assign({}, ruleForm);
            Object.keys(data).forEach((key) => {
                if (typeof(data[key]) === 'boolean') {
                    data[key] = data[key] ? 1 : 0;
                }
            });
            data.displayName = data.displayName.trim();
            data.apiKey = data.apiKey.replace(/\s+/g, '');
            if (['association', 'relation'].includes(fieldType.value)) {
                const filterRuleDetail = {};
                if (feildShowFlag.value.filterRuleDetail.show) {
                    const resData = allPurposeFilterDom.value.getOriginalData();
                    console.log(resData);
                    filterRuleDetail.filterType = resData.filterType;
                    if (resData.filterType > 0) {
                        let isComplete = false;
                        filterRuleDetail.conditions = resData.condition.map((item) => {
                            if (item.searchRange && item.condMode !== undefined) {
                                item.searchRange.condMode = item.condMode;
                                item.searchRange.values = item.condMode === 0 ? null : item.values;
                            }
                            if (!item.searchField || !item.searchField.id) {
                                isComplete = true;
                            }
                            if (![12, 13].includes(item.matchType)) {
                                if (item.condMode === 0 && (!item.searchRange || !item.searchRange.id)) {
                                    isComplete = true;
                                }
                                if (item.condMode === 1) {
                                    if (item.matchType === 11) {
                                        if ((!item.values[0] && typeof(item.values[0]) !== 'number') || (!item.values[1] && typeof(item.values[1]) !== 'number')) {
                                            isComplete = true;
                                        }
                                    } else {
                                        if (!item.values[0] && typeof(item.values[0]) !== 'number') {
                                            isComplete = true;
                                        }
                                    }
                                }
                            }
                            return {
                                searchField: item.searchField,
                                matchType: item.matchType,
                                searchRange: item.searchRange ? [item.searchRange] : null
                            };
                        });
                        if (isComplete) {
                            ElMessage.error('查找范围条件不完整，请补充完整');
                            return;
                        }
                        filterRuleDetail.expression = resData.expression;
                    } else {
                        filterRuleDetail.conditions = null;
                        filterRuleDetail.expression = '';
                    }
                } else {
                    filterRuleDetail.filterType = 0;
                    filterRuleDetail.conditions = null;
                    filterRuleDetail.expression = '';
                }
                
                data.filterRuleDetail = filterRuleDetail;
            }
            if (fieldType.value === 'compute' && ruleForm.calculationType === 17) {
                if (filterRuleType.value === '1') {
                    data.filterRuleDetail = {
                        filterType: 0,
                        conditions: null,
                        expression: ''
                    };
                } else {
                    const filterRuleDetail = {};
                    const resData = allPurposeFilterDom.value.getOriginalData();
                    console.log(resData);
                    filterRuleDetail.filterType = resData.filterType;
                    let isComplete = false;
                    filterRuleDetail.conditions = resData.condition.map((item) => {
                        if (!item.searchField || !item.searchField.id) {
                            isComplete = true;
                        }
                        if (![12, 13].includes(item.matchType)) {
                            if (item.matchType === 11) {
                                if (!item.values[0] || !item.values[1]) {
                                    isComplete = true;
                                }
                            } else {
                                if (item.searchField && [10].includes(item.searchField.dataType)) {
                                    console.log(isComplete);
                                } else {
                                    if (!item.values[0] && typeof(item.values[0]) !== 'number') {
                                        isComplete = true;
                                    }
                                }
                            }
                        }
                        return {
                            searchField: item.searchField,
                            matchType: item.matchType,
                            searchRange: [{
                                condMode: item.condMode,
                                values: item.values,
                                displayName: item.searchRange.displayName
                            }]
                        };
                    });
                    if (isComplete) {
                        ElMessage.error('过滤条件不完整，请补充完整');
                        return;
                    }
                    filterRuleDetail.expression = resData.expression;
                    data.filterRuleDetail = filterRuleDetail;
                }
                data.calculationObjectId = calculationObjectId.value;
            }
            if (['select', 'multiple'].includes(fieldType.value)) {
                if (data.optionSourceType === 1) {
                    data.optionInfos = []; // JSON.parse(JSON.stringify(optionsData.value)).filter(item => item.displayName && item.apiKey);
                    for (let i = 0; i < optionsData.value.length; i++) {
                        if (optionsData.value[i].displayName && optionsData.value[i].apiKey) {
                            const optionInfo = JSON.parse(JSON.stringify(optionsData.value[i]));
                            const flag = optionsData.value.some((item, index) => i !== index && (item.displayName === optionInfo.displayName || item.apiKey === optionInfo.apiKey));
                            if (flag) {
                                ElMessage.error('选项名称/程序识别名称重复');
                                return;
                            }
                            optionInfo.enableFlag = optionInfo.enableFlag ? 1 : 0;
                            optionInfo.defaultFlag = optionInfo.defaultFlag ? 1 : 0;
                            data.optionInfos.push(optionInfo);
                        }
                    }
                } else {
                    data.optionInfos = JSON.parse(JSON.stringify(comOptionsTableData.value));
                    data.optionInfos.forEach(item => {
                        item.enableFlag = item.enableFlag ? 1 : 0;
                        item.defaultFlag = item.defaultFlag ? 1 : 0;
                    });
                }
                data.replaceOptions = replaceOptions.value.length ? replaceOptions.value : null;
            }
            if (fieldType.value === 'reference') {
                const arr = relationshipFieldList.value.filter(item => item.id === data.relationshipFieldId);
                data.referenceObjectId = arr[0].referenceObjectId;
            }
            data.objectId = currentSettingRow.value.id;
            data.objApiKey = currentSettingRow.value.apiKey;
            data.objDisplayName = currentSettingRow.value.displayName;
            data.dataType = dataType.value;
            const objType = JSON.parse(JSON.stringify(objectTypeList.value));
            const layout = JSON.parse(JSON.stringify(layoutList.value));
            const fieldRoles = JSON.parse(JSON.stringify(rolePerList.value));
            data.objectType = objType.map(item => {
                item.requiredFlag = item.requiredFlag ? 1 : 0;
                item.useFlag = item.useFlag ? 1 : 0;
                return item;
            });
            data.layout = layout.map(item => {
                item.commonUseFlag = item.commonUseFlag ? 1 : 0;
                item.useFlag = item.useFlag ? 1 : 0;
                return item;
            });
            data.fieldRoles = fieldRoles.map(item => {
                item.fieldExport = item.fieldExport ? 1 : 0;
                item.fieldRead = item.fieldRead ? 1 : 0;
                item.fieldWrite = item.fieldWrite ? 1 : 0;
                return item;
            });
            if (props.id) {
                data.id = Number(props.id);
            }
            addObjField(data).then(res => {
                if (res.code === 10000) {
                    ElMessage.success(res.messageShow);
                    emit('updataList');
                    closeDialog();
                } else {
                    ElMessage.error(res.messageShow);
                }
            });
        }
    });
};
// 关闭新建、编辑自定义字段弹窗
const closeDialog = () => {
    dialogVisible.value = false;
};
onBeforeUnmount(() => {
    clearSortable();
});
</script>
<style lang="scss" scoped>
.fieldFormMain {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    border-top: #E4E7ED solid 1px;
    border-bottom: #E4E7ED solid 1px;
    color: #303033;
    .title {
        margin: 0;
        font-size: 15px;
        line-height: 50px;
        font-weight: 600;
    }
    .fieldBox {
        width: 120px;
        border-right: #E4E7ED solid 1px;
        .fieldItem {
            padding-left: 12px;
            font-size: 14px;
            line-height: 36px;
            cursor: pointer;
        }
        .editStatus {
            cursor: not-allowed;
            color: $disableBtnTextColor;
        }
        .active {
            background: #F5F7FA;
            color: $secondaryColor;
            font-weight: 600;
        }
    }
    .formBox {
        width: calc(100% - 130px);
        .useSetBox {
            border-top: #E4E7ED solid 1px;
            &-title {
                padding-top: 12px;
                font-size: 15px;
                line-height: 26px;
                color: #303033;
                font-weight: 600;
            }
            &-list {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                padding-left: 12px;
                .labelName {
                    // width: 145px;
                    margin-right: 60px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
                .labelNameW {
                    width: 128px;
                    margin-right: 12px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
            }
        }
        .formUseSetBox {
            margin: 0 -40px 12px -30px;
            padding-bottom: 20px;
            border-bottom: #E4E7ED solid 1px;
            .useSetBox-title {
                padding-left: 20px;
            }
            .optionsBox {
                padding-left: 32px;
            }
        }
        .labelName {
            line-height: 36px;
        }
        .defaultValue {
            position: relative; 
            width: 100%;
            .custom {
                position: absolute;
                top: 30px;
                right: -26px;
                width: 14px;
                height: 14px;
                font-size: 14px;
                background: #F5F7FA;
            }
        }
    }
}
.specialLabel {
    white-space: break-spaces;
    line-height: 22px;
}
.batchAddValue {
    width: 100%;
    height: 500px;
    :deep {
        .#{$elnamespace}-textarea__inner {
            height: 100%;
        }
    }
}
.commonOptionTable {
    width: calc(100% - 10px);
}
:deep {
    .vxe-table--render-default .vxe-table--header-wrapper {
        background: none;
    }
    .vxe-table--render-default.border--default .vxe-body--column, .vxe-table--render-default.border--default .vxe-footer--column, .vxe-table--render-default.border--default .vxe-header--column, .vxe-table--render-default.border--inner .vxe-body--column, .vxe-table--render-default.border--inner .vxe-footer--column, .vxe-table--render-default.border--inner .vxe-header--column {
        background: none;
        border-bottom: #EBEEF5 solid 1px;
    }
}
</style>