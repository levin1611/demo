<!-- 通用选择器组件
    type: default 默认样式 , range 查询范围样式
    radioType: 显示的拼接条件，[1:不限，2：and，3：or，4：高级公式]
    conditionType： 显示的条件类型[fields: 字段选择器， matchType 选择匹配类型，condition: 条件选择器, value: 值选择器]
    levelFields: 是否显示层级字段筛选器

 -->
 <template>
    <div class="all-purpose-filter" v-if="type === 'default'">
        <div style="margin-bottom: 10px">
            <el-radio-group v-model="filterType" class="ml-4" :disabled="disabled">
                <template v-for="(v, i) in radioItems" :key="i">
                    <el-radio v-if="props.radioType.includes(v.value / 1)" :label="v.value">{{v.label}}</el-radio>
                </template>
            </el-radio-group>
        </div>
        <div v-show="filterType > 0">
            <el-scrollbar max-height="320px">
                <el-row v-for="(filterItem, index) in filterItems" :key="index"  class="select-box">
                    <span style="margin-right: 10px;padding-top: 4px;">{{index + 1}}</span>
                    <!-- 字段 -->
                    <template v-if="props.conditionType.includes('fields')">
                        <template v-if="levelFields">
                            <el-input
                                ref="textRefs"
                                v-model="filterItem.displayName"
                                :disabled="disabled"
                                @click="handleClickFields(index, textRefs, 'first')"
                                class="fliter-item"
                                readonly
                                style="width: 120px">
                            </el-input>
                            <input
                                v-model="filterItem.fields"
                                readonly
                                hidden />
                        </template>

                        <el-select
                            v-else
                            v-model="filterItem.fields"
                            :disabled="disabled"
                            class="fliter-item"
                            filterable
                            @change="handleFieldsChange(filterItem.fields, filterItem)"
                            style="width: 150px">
                            <el-option
                                v-for="item in fieldsList"
                                :key="item.id"
                                :label="item.displayName"
                                :value="item.id"
                            />
                        </el-select>
                    </template>
                    
                    <!-- <el-select
                        v-model="filterItem.fields"
                        class="fliter-item"
                        style="width: 120px">
                        <el-option
                            v-for="item in fieldsOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        /> -->
                    <!-- </el-select> -->
                    <!-- 类型 -->
                    <template v-if="props.conditionType.includes('matchType')">
                        <el-select
                            v-model="filterItem.matchType"
                            class="fliter-item"
                            :disabled="disabled"
                            @change="handleValueTypeChange(filterItem.matchType, filterItem)"
                            style="width: 150px">
                            <el-option
                                v-for="item in filterItem.config.matchTypeOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                    <!-- 条件 -->
                    <template v-if="props.conditionType.includes('condMode')">
                        <el-select
                            v-if="filterItem.config.conditionOptions.length > 0"
                            v-model="filterItem.condMode"
                            @change="handleConditionChange(filterItem)"
                            :disabled="disabled"
                            class="fliter-item"
                            style="width: 90px">
                            <el-option
                                v-for="item in filterItem.config.conditionOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                    <!-- 值 -->
                    <template v-if="props.conditionType.includes('value') && filterItem.config.conditionOptions.length">
                        <template v-if="filterItem.type==='fieldsSelector'">
                            <!-- 选择字段 -->
                            <template v-if="levelFields">
                                <!-- 新增字段场景 -->
                                <template v-if="props.from === 'fieldModal'">
                                    <el-select
                                        v-model="filterItem.value"
                                        :disabled="disabled"
                                        class="fliter-item"
                                        @change="handleUserInfoChange(filterItem.value, filterItem)"
                                        filterable
                                        style="width: 150px">
                                        <el-option
                                            v-for="item in userInfoList"
                                            :key="item.id"
                                            :label="item.displayName"
                                            :value="item.id"
                                        />
                                    </el-select>
                                </template>
                                <!-- 其他场景-暂时没用上 -->
                                <template v-else>
                                    <el-input
                                        ref="lastTextRefs"
                                        v-model="filterItem.valueDisplayName"
                                        @click="handleClickFields(index, lastTextRefs, 'end')"
                                        class="fliter-item"
                                        readonly
                                        style="width: 120px">
                                    </el-input>
                                    <input
                                        v-model="filterItem.value"
                                        readonly
                                        hidden /> 
                                </template>
                            </template>
                            <template v-else>
                                <div v-if="props.fieldsSelectorType === 'selectUserInfo'" class="fliter-item">
                                    <el-select
                                        v-model="filterItem.value"
                                        class="fliter-item"
                                        @focus="getUserInfoOptions(filterItem)"
                                        @change="handleUserInfoChange(filterItem.value, filterItem)"
                                        :disabled="disabled"
                                        filterable
                                        style="width: 150px">
                                        <el-option
                                            v-for="item in userInfoList"
                                            :key="item.id"
                                            :label="item.displayName"
                                            :value="item.id"
                                        />
                                    </el-select>
                                </div>
                                <el-select
                                    v-else
                                    v-model="filterItem.value"
                                    :disabled="disabled"
                                    class="fliter-item"
                                    filterable
                                    style="width: 150px">
                                    <el-option
                                        v-for="item in fieldsList"
                                        :key="item.id"
                                        :label="item.displayName"
                                        :value="item.id"
                                    />
                                </el-select>
                            </template>
                        </template>
                        <el-input
                            v-model="filterItem.value"
                            :disabled="disabled"
                            class="fliter-item"
                            v-if="filterItem.type==='text'"
                            style="width: 175px"></el-input>
                            <!-- 选项单选 -->
                        <el-select
                            v-model="filterItem.value"
                            :disabled="disabled"
                            class="fliter-item"
                            v-if="filterItem.type==='select'"
                            @focus="getOptions(filterItem)"
                            style="width: 175px">
                            <el-option
                                v-for="item in filterItem.fieldsOptions"
                                :key="item.id"
                                :label="item.displayName"
                                :value="item.id"
                            />
                        </el-select>
                        <template v-if="filterItem.type==='searchselect'">
                            <div style="margin-right: 12px;position: relative;">
                                <div v-if="filterItem.fieldsData.referenceObjectApiKey === 'department'" style="width: 175px">
                                    <cetselect
                                        v-model:dataValue="filterItem.value"
                                        :treeData="SourceWidthOutMembers"
                                        placeholder="请选择"
                                    />
                                </div>
                                
                                <div v-else-if="filterItem.fieldsData.referenceObjectApiKey === 'staff'" style="width: 175px">
                                    <cetselect
                                        v-model:dataValue="filterItem.value"
                                        :treeData="SourceWidthMembers"
                                        placeholder="请选择"
                                        
                                    />
                                </div>
                                <div v-else-if="filterItem.fieldsData.referenceObjectApiKey === 'objectType'" style="width: 175px">
                                    <el-select
                                        v-model="filterItem.value"
                                        :disabled="disabled"
                                        class="fliter-item"
                                        @focus="getOptions(filterItem)"
                                        style="width: 175px">
                                        <el-option
                                            v-for="item in filterItem.fieldsOptions"
                                            :key="item.id"
                                            :label="item.name"
                                            :value="item.id"
                                        />
                                    </el-select>
                                </div>
                                <div v-else>
                                    <commonRelate
                                        :item="{
                                            value: filterItem.searchRange[0]?.displayName,
                                            valueId: filterItem.value,
                                            displayName: filterItem.fieldsData.displayName,
                                            fieldId: filterItem.fieldsData.id,
                                            reObjIdApikey: filterItem.fieldsData.referenceObjectApiKey,
                                            referenceObjectId: filterItem.fieldsData.referenceObjectId,
                                            apiKey: '0'
                                        }"
                                        :key="filterItem.fieldsData.id"
                                        @selectData="handleSelectData($event, filterItem)"
                                        @clearData="handleClearData(filterItem)"></commonRelate>
                                </div>
                                
                            </div>
                        </template>
                        <!-- 选项多选 -->
                        <el-select
                            v-model="filterItem.value"
                            :disabled="disabled"
                            class="fliter-item"
                            multiple
                            collapse-tags
                            @focus="getOptions(filterItem)"
                            v-if="filterItem.type==='multSelect'"
                            style="width: 175px">
                            <el-option
                                v-for="item in filterItem.fieldsOptions"
                                :key="item.id"
                                :label="item.displayName"
                                :value="item.id"
                            />
                        </el-select>
                        <!-- 整数 -->
                        <el-input-number 
                            v-model="filterItem.value" 
                            v-if="filterItem.type==='number'"
                            :disabled="disabled"
                            class="fliter-item" 
                            step-strictly
                            :maxLength="15"
                            step="1"
                            style="width: 175px" />
                            <!-- 整数范围 -->
                        <div v-if="filterItem.type==='numberRange'" class="fliter-item" >
                            <el-input-number
                                v-model="filterItem.fieldsStart" 
                                :disabled="disabled"
                                step-strictly
                                step="1"
                                :class="{'error-input': filterItem.fieldsStart > filterItem.fieldsEnd}"
                                placeholder="最小值"
                                :clearable="false"
                                @blur="rangeStartRegx($event, filterItem)"
                                style="width: 120px" />
                            <span> - </span>
                            <el-input-number
                                v-model="filterItem.fieldsEnd" 
                                step-strictly
                                placeholder="最大值"
                                :clearable="false"
                                :disabled="disabled"
                                style="width: 120px" />
                        </div>
                        <!-- 实数 -->
                        <div v-if="filterItem.type==='numberStep'" style="width: 175px">
                            <commonInput
                                :item="ref({
                                    dataType: 14,
                                    value: filterItem.value,
                                    displayName: filterItem.fieldsData.displayName,
                                    readonlyFlag: disabled
                                })"
                                :show-word-limit="true"
                                :filterItem="filterItem"
                                :placeholder="false"
                                @blurInput="blurInputCheck"
                            >
                            </commonInput>
                        </div>
                        
                        <!-- 实数范围 -->
                        <div v-if="filterItem.type==='numberStepRange'" 
                            class="fliter-item" 
                            style="display: flex;">
                            <div style="width: 120px;margin-right: 10px;">
                                <commonInput
                                    :item="ref({
                                        dataType: 14,
                                        value: filterItem.fieldsStart,
                                        displayName: filterItem.fieldsData.displayName,
                                        readonlyFlag: disabled
                                    })"
                                    :show-word-limit="true"
                                    :filterItem="filterItem"
                                    :placeholder="false"
                                    @blurInput="blurInputCheckStart"
                                >
                                </commonInput>
                            </div>
                            
                            <span> - </span>
                            <div style="width: 120px;margin-left: 10px;">
                                <commonInput
                                    :item="ref({
                                        dataType: 14,
                                        value: filterItem.fieldsEnd,
                                        displayName: filterItem.fieldsData.displayName,
                                        readonlyFlag: disabled
                                    })"
                                    :show-word-limit="true"
                                    :filterItem="filterItem"
                                    :placeholder="false"
                                    @blurInput="blurInputCheckEnd"
                                >
                                </commonInput>
                            </div>
                        </div>
                        <!-- 日期 -->
                        <el-date-picker
                            v-if="filterItem.type==='date'"
                            v-model="filterItem.value"
                            :disabled="disabled"
                            type="date"
                            :clearable="false"
                            placeholder="请选择"
                            value-format="YYYY-MM-DD"
                            class="fliter-item"
                            style="width: 175px;margin-right: 12px; "
                        />
                        <!-- 日期范围 -->
                        <div v-if="filterItem.type==='dateRange'" class="fliter-item">
                            <el-date-picker
                                v-model="filterItem.value" 
                                :disabled="disabled"
                                type="daterange"
                                range-separator="-"
                                value-format="YYYY-MM-DD"
                                start-placeholder="开始时间"
                                end-placeholder="结束时间"
                                style="width: 240px"
                            />
                        </div>
                        <!-- 日期时间选择器 -->
                        <el-date-picker
                            v-if="filterItem.type==='datetime'"
                            v-model="filterItem.value" 
                            :disabled="disabled"
                            type="datetime"
                            :clearable="false"
                            class="fliter-item"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            style="width: 175px;margin-right: 12px; "
                            placeholder="请选择"
                        />
                        <div v-if="filterItem.type==='datetimerange'" class="fliter-item">
                            <el-date-picker
                                v-model="filterItem.value"
                                :disabled="disabled"
                                type="datetimerange"
                                clearable
                                range-separator="-"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                :default-time=" [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)] "
                                start-placeholder="开始时间"
                                end-placeholder="结束时间"
                                style="width: 240px"
                            />
                        </div>
                        <el-select
                            v-model="filterItem.value"
                            :disabled="disabled"
                            class="fliter-item"
                            v-if="filterItem.type==='boolean'"
                            style="width: 175px">
                            <el-option label="否" :value="0"/>
                            <el-option label="是" :value="1"/>
                        </el-select>
                        
                    </template>
                    <span class="custom custom-minus-cirlce" v-if="!disabled" @click="minusItem(index)"></span>

                    <!-- <el-button ref="textRefs" @click="onClickOutside(i)">Click me</el-button> -->
                </el-row>
            </el-scrollbar>
            <div class="add-filter-item" v-if="!disabled">
                <span class="custom custom-add1"></span>
                <span @click="addItem">添加条件</span>
            </div>
            <div style="margin-top:16px;display: flex;align-items: center;">
                <el-input
                    v-model="customInput"
                    v-if="filterType === 3"
                    @blur="validerSenior"
                    :disabled="disabled"
                    class="senior-condition"
                    :clearable="false"
                    style="width: 590px;margin-right: 18px">
                    <template #append>
                        <span style="font-size: 12px;"  @click="customInput = ''">重置条件</span>
                    </template>
                </el-input>
                <el-popover
                    placement="bottom"
                    trigger="hover"
                    width="250px"
                    effect="dark"
                    popper-class="customSelectPop"
                >
                    <div style="padding: 10px">
                        请按照如下规则编辑条件组合：<br />
                        <!-- <span style="color:#24A353;">(1 and 2) or (3 and 4)<i style="float: right" class="custom custom-queren"></i></span><br /> -->
                        <!-- 1.有 and 和 or，必须要有括号<br /> -->
                        <!-- <span style="color:red;">1 and 2 or 3 and 4　<i style="float: right" class="custom custom-shanchu"></i></span><br /> -->
                        <!-- 2.一个括号不能同时出现 and 和 or<br /> -->
                        <!-- <span style="color:red;">(1 and 2 or 3) and 4　<i style="float: right" class="custom custom-shanchu"></i></span><br /> -->
                        1.不允许出现不存在的编号<br />
                        <span style="color:red;">1 and 2 and 3 and 4 and 5　<i style="float: right" class="custom custom-shanchu"></i></span><br />
                        <!-- 4.括号都是成对出现的<br /> -->
                        <!-- <span style="color:red;">(1 and 2 or 3 and 4<i style="float: right" class="custom custom-shanchu"></i></span><br /> -->
                        2.括号都是成对出现的<br />
                        <span style="color:red;">(1 and 2 or 3 and 4 <i style="float: right" class="custom custom-shanchu"></i></span><br />
                        3.不允许出现中文输入字符<br />
                        <span style="color:red;">。？！，、；：“” ‘’　　<i style="float: right" class="custom custom-shanchu"></i></span>
                        <span style="color:red;">（）《》〈〉【】『』「」<i style="float: right" class="custom custom-shanchu"></i></span>
                        <span style="color:red;">﹄﹃〔〕…－～﹏￥　 <i style="float: right" class="custom custom-shanchu"></i></span>
                    </div>
                    <template #reference>
                        <span v-if="filterType === 3" class="custom custom-Tips"></span>
                    </template>
                </el-popover>
            </div>
        </div>
    </div>
    <div class="all-purpose-filter" v-if="type === 'range'">
        <div style="margin-bottom: 10px">
            <el-radio-group v-model="filterType" class="ml-4" :disabled="disabled">
                <template v-for="(v, i) in rangeItems" :key="i">
                    <el-radio v-if="props.rangeRadioType.includes(v.value / 1)" :label="v.value">{{v.label}}</el-radio>
                </template>
            </el-radio-group>
        </div>
        <div v-show="filterType > 0">
            <el-scrollbar max-height="320px">
            <el-row v-for="(filterItem, index) in rangeFilterItems" :key="index"  class="select-box">
                <span style="margin-right: 10px;padding-top: 4px;">{{index + 1}}</span>
                <!-- 字段 -->
                <template v-if="levelFields">
                    <el-input
                        ref="textRefs"
                        v-model="filterItem.displayName"
                        :disabled="disabled"
                        @click="handleClickFields(index, textRefs, 'first')"
                        class="fliter-item"
                        style="width: 120px">
                    </el-input>
                </template>
                <el-select
                    v-else
                    v-model="filterItem.fields"
                    :disabled="disabled"
                    class="fliter-item"
                    filterable
                    @change="handleRangeFieldsChange(filterItem.fields, filterItem)"
                    style="width: 150px">
                    <el-option
                        v-for="item in fieldsList"
                        :key="item.id"
                        :label="item.displayName"
                        :value="item.id"
                    />
                </el-select>
                
                
                <input
                    v-model="filterItem.fields"
                    readonly
                    hidden />
                <div style="width: 260px;height: 36px;margin-right: 20px">
                    <!-- {{filterItem.defaultData}}-----{{filterItem.dataType}} -->
                    <queryScope
                        @setQueryData="setRangeData"
                        :defaultData="filterItem.defaultData"
                        ref="queryScopeCom"
                        :objectId="props.objectId"
                        :indexCurrent="index"
                        :disabled="disabled"
                        :dataType='filterItem.dataType' />
                </div>
                
                <el-select
                    v-model="filterItem.value"
                    :disabled="disabled"
                    class="fliter-item"
                    style="width: 175px">
                    <el-option
                        v-for="item in filterItem.rangeFieldsTypeList"
                        :key="item.id"
                        :label="item.label"
                        :value="item.id"
                    />
                </el-select>

                <span class="custom custom-minus-cirlce" v-if="!disabled" @click="minusItem(index)"></span>
            </el-row>
            </el-scrollbar>
            <div class="add-filter-item" v-if="!disabled">
                <span class="custom custom-add1"></span>
                <span @click="addItem">添加条件</span>
            </div>
            <div class="senior-condition-box">
                <el-input
                    v-model="customInput"
                    :disabled="disabled"
                    v-if="filterType === 3"
                    @blur="validerSenior"
                    :clearable="false"
                    class="senior-condition"
                    style="width: 590px;margin-right: 18px">
                    <template #append>
                        <span style="font-size: 12px;" @click="customInput = ''">重置条件</span>
                    </template>
                </el-input>
                <el-popover
                    placement="bottom"
                    trigger="hover"
                    width="250px"
                    effect="dark"
                    popper-class="customSelectPop"
                >
                    <div style="padding: 10px">
                        请按照如下规则编辑条件组合：<br />
                        <!-- <span style="color:#24A353;">(1 and 2) or (3 and 4)<i style="float: right" class="custom custom-queren"></i></span><br /> -->
                        <!-- 1.有 and 和 or，必须要有括号<br /> -->
                        <!-- <span style="color:red;">1 and 2 or 3 and 4　<i style="float: right" class="custom custom-shanchu"></i></span><br /> -->
                        <!-- 2.一个括号不能同时出现 and 和 or<br /> -->
                        <!-- <span style="color:red;">(1 and 2 or 3) and 4　<i style="float: right" class="custom custom-shanchu"></i></span><br /> -->
                        1.不允许出现不存在的编号<br />
                        <span style="color:red;">1 and 2 and 3 and 4 and 5　<i style="float: right" class="custom custom-shanchu"></i></span><br />
                        <!-- 4.括号都是成对出现的<br /> -->
                        <!-- <span style="color:red;">(1 and 2 or 3 and 4<i style="float: right" class="custom custom-shanchu"></i></span><br /> -->
                        2.括号都是成对出现的<br />
                        <span style="color:red;">(1 and 2 or 3 and 4 <i style="float: right" class="custom custom-shanchu"></i></span><br />
                        3.不允许出现中文输入字符<br />
                        <span style="color:red;">。？！，、；：“” ‘’　　<i style="float: right" class="custom custom-shanchu"></i></span>
                        <span style="color:red;">（）《》〈〉【】『』「」<i style="float: right" class="custom custom-shanchu"></i></span>
                        <span style="color:red;">﹄﹃〔〕…－～﹏￥　 <i style="float: right" class="custom custom-shanchu"></i></span>
                    </div>
                    <template #reference>
                        <span v-if="filterType === 3" class="custom custom-Tips"></span>
                    </template>
                </el-popover>
            </div>
        </div>
    </div>
    <el-popover
        ref="popoverRef"
        :virtual-ref="textRef"
        :visible="hidePopover"
        trigger="click"
        placement="bottom"
        :width="popoverWidth"
        :height="390"
        popper-class="all-purpose-filter-popover"
        virtual-triggering>
        <div>
            <div class="custom-Cascader">
                <div class="custom-Cascader-box">
                    <!-- <div style="height:390px">
                        <el-scrollbar height="340px">
                            <ul class="custom-Cascader-ul">
                                <li v-for="(v, i) in objectItem" :key="i" :class="{active: i === activeSelectItem}" @click="changeObject(i, v)">
                                    <span>{{v.displayName}}</span>
                                    <span class="custom custom-a-Property1arrow-rightProperty2linear"></span>
                                </li>
                            </ul>
                        </el-scrollbar>
                    </div> -->
                    <!-- <custom-cascader 
                        :maxLevel="props.maxLevel - 1"
                        :activeItem="activeItem"
                        @change-level="changeLevel"
                        :dataType="props.dataType"
                        :fieldsUrl="props.fieldsUrl"
                        :dataUrl="props.dataUrl"
                        :fieldsCurrent="fieldsCurrent"
                        :dataSource="props.dataSource"
                        :fieldsSource="props.fieldsSource"
                        ref="selectCustomCascaderRef"
                        @handle-click="changeOption">
                    </custom-cascader> -->
                    <custom-cascader
                        :maxLevel="props.maxLevel"
                        @change-level="changeLevel" 
                        :dataType="props.dataType"
                        :objectId="props.objectId"
                        :fieldsSource="props.fieldsSource"
                        :dataSource="props.dataSource"
                        ref="selectCustomCascaderRef"
                        @handle-click="changeOption">
                </custom-cascader>
                </div>
            </div>
        </div>
    </el-popover>
</template>
<script setup>
import { ref, reactive, onMounted, nextTick, computed, unref, watch, inject } from 'vue';
import { onClickOutside } from '@vueuse/core';
import customCascader from './customCascader.vue';
// import { SyntaxParser, LexicalParser} from '@/utils/LexicalParser';
import { useLexicalParser, useSyntaxParser } from '@/hooks/lexicalParser';
import queryScope from '@/components/applicableMember/queryScope.vue';
import commonRelate from '@/components/commonArea/commonRelate.vue';
import commonInput from '@/components/commonArea/commonInput.vue';

import { queryObjList } from '@/api/fieldsSetting.js';
import { queryOptionByFieldIds, listOptionsSet } from '@/api/common.js';
import { queryObjTypeList } from '@/api/clue.js';


// 获取输入框配置文件
import { config, valueInputType, rangeFieldsType } from '@/utils/filterConfig';

// 获取部门树
import { cetselect, cetselectmuliple } from 'xhl_lib';
import { useDepartmentTree } from '@/pinia/modules/departmentTree.js'; // 引入部门树相关的数据
const treeDataStore = useDepartmentTree();
// await treeDataStore.apiForGetData(); // 首次查询部门树数据
const SourceWidthOutMembers = computed(() => treeDataStore.SourceWidthOutMembers); // 没有部门成员的树数据
const SourceWidthMembers = computed(() => treeDataStore.SourceWidthMembers); // 有部门成员的树数据



const lexicalParser = useLexicalParser()
const syntaxParser = useSyntaxParser()

const activeSelectItem = ref(0);
const queryScopeCom = ref();
const props = defineProps({
    filterType: {
        type: Number,
        default: 0
    },
    filterData: {
        type: Array,
        default: []
    },
    // 是否是携带层级的字段选择器
    levelFields: {
        type: Boolean,
        default: true
    },
    maxLevel: {
        type: Number,
        default: 5
    },
    expression: String,
    type: {
        type: String,
        default: 'default'
    },
    dataType: String, // 场景中对应的数据类型，仅使用场景0,3时需要该参数	
    objectId: String, // 对象id，第一层请传当前对象ID
    radioType: {
        type: Array,
        default: [0, 1, 2, 3]
    },
    rangeRadioType: {
        type: Array,
        default: [1, 2, 3]
    },
    conditionType: {
        type: Array,
        default: ['fields', 'matchType', 'condMode', 'value']
    },
    // 最后一个字段筛选器类型，selectUserInfo:选择当前用户信息下拉列表
    fieldsSelectorType: {
        type: String,
        default: 'default'
    },
    fieldsSource: Object,
    dataSource: Object,
    // 引用的模块
    from: {
        type: String,
        default: ''
    },
    maxLength: {
        type: Number,
        default: 20
    },
    disabled: {
        type: Boolean,
        default: false
    }
});
const emit = defineEmits(['handleClick', 'changeObject']); 
onMounted(() => {
    // 如果不使用多级字段筛选器，需要在此组件中请求数据
   if(!props.levelFields || props.from === 'fieldModal') {
        props.fieldsSource.methods(props.fieldsSource.data).then(res => {
            if(res.code === 10000) {
                fieldsList.value = res.data
            }
        })
   }
})
const filterType = ref(0);
//字段选择数据源
// const objectItem = ref([
//     { displayName: "部门", id: '497', apiKey: 'department' },
//     { displayName: "线索", id: '498', apiKey: 'lead' },
//     { displayName: "联系人", id: '499', apiKey: 'contact' },
//     { displayName: "成员", id: '496', apiKey: 'staff' }
// ]);

const fieldsList = ref([]);
const filterItems = ref([]);
const rangeFilterItems = ref([]);
const customInput = ref(''); // 高级条件
const activeItem = ref(0); // 当前第一层激活的选项

// 虚拟popover
const textRef = ref();
const popoverRef = ref();
const textRefs = ref([]);
const lastTextRefs = ref([]);
const hidePopover = ref(false);
const popoverWidth = ref(150);
const fieldsCurrent = ref('first'); // 是第一个字段筛选还是最后一个字段筛选框

const selectCustomCascaderRef = ref(); // 字段选择框组件

const radioItems = reactive([
    {value: 0, label: '不限'},
    {value: 1, label: '满足所有条件（AND）'},
    {value: 2, label: '满足任意条件（OR）'},
    {value: 3, label: '高级公式'}
]);
// 查询范围组件单选按钮
const rangeItems = reactive([
    {value: 1, label: '满足所有条件（AND）'},
    {value: 2, label: '满足任意条件（OR）'},
    {value: 3, label: '高级公式'}
]);
const fieldsOptions = ref([]);

const userInfoList = ref([
    {id: 1, label: '当前用户'},
    {id: 2, label: '当前用户：部门'}
])

const cascaderOptions = ref([
    {
        "id": 2976,
        "objectId": 366,
        "apiKey": "followRecord",
        "displayName": "最近跟进记录",
        "dataType": 28,
        "referenceObjectId": null,
        "apiKeyValue": "lead.followRecord",
        children: [
            {
                "id": 2994,
                "objectId": 366,
                "apiKey": "apiKey1",
                "displayName": "单选select",
                "dataType": 25,
                "referenceObjectId": null,
                "apiKeyValue": "lead.apiKey1"
            }
        ]
    }
])

const addItem = (fieldsData, modelType) => {
    if(fieldsList.value.length > 0) {
        if(props.type === 'default') {
            // 如果是编辑
            if(modelType === 'edit') {
                let matchTypeOptions = [];
                if(props.from === 'fieldModal' && (fieldsData.dataType === 28 || fieldsData.dataType === 29)) {
                    matchTypeOptions = [ 
                        { value: 1, label: '等于', childrenType: [
                            {value: 0, label: '值'},
                            {value: 1, label: '字段'}
                        ]}
                    ];
                } else {
                    matchTypeOptions = getValueTypeOptions(fieldsData.id, fieldsData);
                }
                // 如果根据id匹配不到，则赋值空数据
                if(matchTypeOptions?.length) {
                    filterItems.value.push({fields: fieldsData.id, fieldsData, displayName: fieldsData.displayName,searchRange: [], matchType: '', condMode: '', value: '', type: '',fieldsStart:'', fieldsEnd:'', config: {
                        matchTypeOptions: matchTypeOptions,
                        conditionOptions: []
                    }});
                    // 处理字段变化
                    // handleFieldsChange(fieldsData.id, filterItems.value[filterItems.value.length - 1], fieldsData);
                } else {
                    filterItems.value.push({fields: fieldsData.id, fieldsData,  displayName: fieldsData.displayName,searchRange: [], matchType: '', condMode: '', value: '', type: '', config: {
                        matchTypeOptions: [],
                        conditionOptions: []
                    }});   
                }
            } else {
                if(filterItems.value.length >= props.maxLength) {
                    ElMessage.error('最多添加' + props.maxLength + '个条件');
                    return
                }
                filterItems.value.push({fields: '请选择', fieldsData:{}, displayName: '请选择', matchType: '', condMode: 1,searchRange: [], value: '', type: 'text', config: {
                    matchTypeOptions: [],
                    conditionOptions: [
                        {value: 1, label: '值'},
                        {value: 0, label: '字段'}
                    ]
                }});
            }
        } else {
            if(modelType === 'edit') {
                rangeFilterItems.value.push({fields: fieldsData.id, displayName: fieldsData.displayName, dataType: -1, searchRange: [], value: '', defaultData: [], rangeFieldsTypeList: []});
            } else {
                if(rangeFilterItems.value.length >= props.maxLength) {
                    ElMessage.error('最多添加' + props.maxLength + '个条件');
                    return
                }
                rangeFilterItems.value.push({fields: '请选择', displayName: '请选择', dataType: -1, searchRange: [], value: '', defaultData: [], rangeFieldsTypeList: []});
            }
        }
    } else {
        if(props.type === 'default') {
            filterItems.value.push({fields: '请选择', displayName: '请选择', matchType: '', condMode: 1,searchRange: [], value: '', type: 'text', config: {
                matchTypeOptions: [],
                conditionOptions: []
            }});
        } else {
            rangeFilterItems.value.push({fields: '请选择', displayName: '请选择', dataType: -1, searchRange: [], value: '', defaultData: [], rangeFieldsTypeList: []});
        }
        
    }
}
const minusItem = (index) => {
    if(props.type === 'default') {
        filterItems.value.splice(index, 1);
    } else {
        rangeFilterItems.value.splice(index, 1);
    }
};

// 校验高级公式方法
const validerSenior = (value, i) => {
    console.log(customInput.value);
    try{
        const target = [];
        filterItems.value.forEach((item, index) => {
            target.push(index + 1)
        })
        lexicalParser.setValidOperands(target);
        console.log(lexicalParser.parse(customInput.value)); 
        const lexicals = lexicalParser.parse(customInput.value.toLowerCase());
        const real = [];
        if (lexicals) {
            lexicals.slice(1, -1).map(function (o) {
                if (o.type == 'operand') {
                    real.push(o.value);
                }
                return o.value
            });
            console.log(syntaxParser.parse(lexicals), syntaxParser.getString());
        }
        const uniqueTarget = function (arr) {
            let result = [];
            let hash = {};
            for (let i = 0, elem; (elem = arr[i]) != null; i++) {
                if (!hash[elem]) {
                    result.push(elem);
                    hash[elem] = true;
                }
            }
            return result;
        };
        if (target.sort().join(",") != uniqueTarget(real).sort().join(",")) {
            throw new Error('存在没有被公式引用的条件！');
        }
    } catch(e) {
        console.log(e.message)
    }
}

// 点击选择字段选择框
const handleClickFields = (index, refs, cur) => {
    console.log('点击数据', index, refs[0]);
    fieldsCurrent.value = cur;
    nextTick(() => {
        textRef.value = refs[index]
    })

    // 显示选择框，复原相关参数----start
    hidePopover.value = true;
    selectCustomCascaderRef.value.clear();
    selectCustomCascaderRef.value.getData();
    // emit('changeObject', {
    //      id: props.objectId
    // });
    // 显示选择框，复原相关参数----end

    activeItem.value = index;
    activeSelectItem.value = 0;
    console.log(index);
}
onClickOutside(
    popoverRef,
    (e) => {
        nextTick(() => {
            popoverWidth.value = 150;
            hidePopover.value = false;
        })
       
    },
    {
        ignore: ['.all-purpose-filter-popover']
    }
);
// 更改对象
const changeObject = (index, item) => {
    // 点击第一级，给第二级赋值，并更改popover宽度
    activeSelectItem.value = index;
    emit('changeObject', item);
}

// const onClickOutside  = (index) => {
//     hidePopover.value = false;
// }

// 是值时，获取最右侧下拉项
const getOptions = async (filterItem) => {
    //获取下拉项 
    const seleteOptionsRes = await queryOptionByFieldIds({
        objectId: filterItem.fieldsData.objectId,
        fieldIds: [filterItem.fieldsData.id]
    });
    fieldsOptions.value = seleteOptionsRes.data;
}

// 是字段时，获取最右侧下拉信息
const getUserInfoOptions = async (filterItem) => {
    // let dataType = fieldsList.value.find(v => v.id === filterItem.fields);
    const dataList = await props.dataSource.methods({
        objectId: props.dataSource.data.objectId,
        dataType: filterItem.fieldsData.dataType,
        fieldId: filterItem.fieldsData.id
    });
    userInfoList.value = dataList.data || [];
}
// 切换层级及初始化字段筛选器数据
const changeLevel = (n, list) => {
    popoverWidth.value = 150 * n;
    fieldsList.value = list.length ? list[list.length - 1] : [];
    console.log('切换', list.length);
}
// 点击选中项
const changeOption = (item, valueString) => {
    console.log('选中项', item, valueString);
    if(props.type === 'default') {
        if(fieldsCurrent.value === 'first') {
            // 最后一个选中项
            const lastChild = item.value[item.value.length - 1];
            // filterItems.value[activeItem.value].fields = lastChild.id;
            // 如果是有层级的筛选，则取拼接好的字段显示
            // filterItems.value[activeItem.value].displayName = props.levelFields ? lastChild.fullDisplayName : lastChild.displayName;
            // 手动切换字段, 多层级筛选，需要拿最后一个选中的
            handleFieldsChange(lastChild.id, filterItems.value[activeItem.value], lastChild)
        } else {
            // 最后一个选中项
            const lastChild = item.value[item.value.length - 1];
            filterItems.value[activeItem.value].value = lastChild.id;
            filterItems.value[activeItem.value].valueDisplayName = props.levelFields ? lastChild.fullDisplayName : lastChild.displayName;
        }
    } else {
        rangeFilterItems.value[activeItem.value].fields = item.value[item.value.length - 1].id;
        rangeFilterItems.value[activeItem.value].displayName = item.value[item.value.length - 1].displayName;
        rangeFilterItems.value[activeItem.value].dataType = item.value[item.value.length - 1].dataType;
    }
    nextTick(() => {
        popoverWidth.value = 150;
        // onClickOutside();
        hidePopover.value = false;
    })
    // emit('handleClick', {
    //     item,
    //     valueString
    // })
}

// 切换字段
/**
 * @fieldsId 字段id
 * @filterItem 当前编辑的条件
 * @fieldsObj 选中的字段
*/
const handleFieldsChange = (fieldsId, filterItem, fieldsObj, type = 'new') => { 
    // 保存下来选择的字段
    if(fieldsObj) {
        filterItem.fieldsData = fieldsObj;
    } else {
        filterItem.fieldsData = fieldsList.value.find(v => v.id === fieldsId);
    }
    filterItem.fields = filterItem.fieldsData.id;
    // filterItem.displayName = filterItem.fieldsData.displayName;
    if(type === 'new') {
        filterItem.displayName = props.levelFields ? filterItem.fieldsData.fullDisplayName : filterItem.fieldsData.displayName;
    }
    filterItem.value = '';
    filterItem.fieldsStart = undefined;
    filterItem.fieldsEnd = undefined;
    // 赋值条件下拉option,注意只有新建字段时，新建关联关系及主子明细时只有等于这一个条件
    // if(props.from === 'fieldModal' && (filterItem.fieldsData.dataType === 28 || filterItem.fieldsData.dataType === 29)) {
    //     filterItem.config.matchTypeOptions = [ 
    //         { value: 1, label: '等于', childrenType: [
    //             {value: 0, label: '值'},
    //             {value: 1, label: '字段'}
    //         ]}
    //     ];
    //     // 赋值条件下拉
    //     filterItem.matchType = 1;
    // } else {
    //     // console.log('fieldsId, fieldsObj', fieldsId, fieldsObj)
    //     // 根据字段类型获取条件列表，如果有传入，传入的优先级高于查找到的优先级，涉及回显及多级筛选
    //     const matchTypeOptions = getValueTypeOptions(fieldsId, filterItem.fieldsData);
    //     filterItem.config.matchTypeOptions = matchTypeOptions;
    //     // 赋值条件下拉
    //     try{
    //         if(type === 'new') {
    //             filterItem.matchType = matchTypeOptions[0].value;
    //         }
    //     }catch(e) {
    //         console.log('matchTypeOptions is null')
    //     }
    // }
     // console.log('fieldsId, fieldsObj', fieldsId, fieldsObj)
    // 根据字段类型获取条件列表，如果有传入，传入的优先级高于查找到的优先级，涉及回显及多级筛选
    const matchTypeOptions = getValueTypeOptions(fieldsId, filterItem.fieldsData);
    filterItem.config.matchTypeOptions = matchTypeOptions;
    // 赋值条件下拉
    try{
        if(type === 'new') {
            filterItem.matchType = matchTypeOptions[0].value;
        }
    }catch(e) {
        console.log('matchTypeOptions is null')
    }
    // 给选择【字段】或者【值】下拉框赋值
    handleValueTypeChange(filterItem.matchType, filterItem);
}

// 切换类型
/**
 * @matchType 匹配类型
 * @filterItem 当前编辑的条件
*/
const handleValueTypeChange = (matchType, filterItem, type) => {
    console.log('handleValueTypeChange');
    // 赋值【字段】或者【值】下拉option
    filterItem.config.conditionOptions = getConditionOptions(matchType, filterItem.config.matchTypeOptions);
    // 给选择【字段】或者【值】下拉框赋值
     // 如果显示选择字段或者值的下拉框，则赋值第一个值，否则默认显示为【值】
     if(!props.conditionType.includes('condMode')) {
        filterItem.condMode = 1
    } else {
        filterItem.condMode = filterItem.config.conditionOptions[0]?.value;
    }
    if(props.conditionType.includes('value') && filterItem.config.conditionOptions.length && !type) {
        // 给最后一个下拉框赋值
       handleConditionChange(filterItem);
    }
}

// 切换条件（新建字段及视图列表最后一个下拉为普通下拉）
const handleConditionChange = async (filterItem) => {
    // 如果是值的时候，赋值option
    //  && ([25, 26, 28, 29, 20].includes(filterItem.fieldsData.dataType))
    // console.log('filterItem', filterItem);
    if(filterItem.condMode === 1) {
        console.log(filterItem)
        //获取下拉项 
        let seleteOptionsRes = [];
        if(!filterItem.fieldsData.commonOptionId) {
            // 如果是对象类型，则需要使用类型接口获取类型列表
            if(filterItem.fieldsData?.referenceObjectApiKey === 'objectType') {
                seleteOptionsRes = await queryObjTypeList({
                    objectId: filterItem.fieldsData.objectId
                });
            } else {
                seleteOptionsRes = await queryOptionByFieldIds({
                    objectId: filterItem.fieldsData.objectId,
                    fieldIds: [filterItem.fieldsData.id]
                })
            }
            
        } else {
            seleteOptionsRes = await listOptionsSet({
                // objectId: filterItem.fieldsData.objectId,
                enableFlag: 1,
                id: filterItem.fieldsData.commonOptionId
            }) 
        }
       
        console.log('下拉项的数据：', seleteOptionsRes);
        // fieldsOptions.value = seleteOptionsRes.data;
        filterItem.fieldsOptions = seleteOptionsRes.data;
    } else {
        // 如果是字段，则获取对象下的字段
        if(props.fieldsSelectorType === 'selectUserInfo' || props.from === 'fieldModal') {
            // let dataType = fieldsList.value.find(v => v.id === filterItem.fields);
            const dataList = await props.dataSource.methods({
                objectId: props.dataSource.data.objectId,
                dataType: filterItem.fieldsData.dataType,
                fieldId: filterItem.fieldsData.id
            });
            
            userInfoList.value = dataList.data || [];
            console.log('用户信息列表：', userInfoList.value, filterItem);
        }
    }
    filterItem.type = getValueInputType(filterItem);
    filterItem.value = '';
};

// 选择用户信息事件
const handleUserInfoChange = (id, filterItem) => {
    console.log('handleUserInfoChange', id, filterItem, userInfoList.value)
    filterItem.userInfo = userInfoList.value.find(v => v.id === id);
}


// 根据字段类型获取匹配类型
/**
 * @fieldsId 字段id
 * @fieldsObj 字段对象, 选中的字段
*/
const getValueTypeOptions = (fieldsId, fieldsObj = {}) => {
    let matchTypeOptions = []
    Object.keys(config).forEach(key => {
        let keyArr = key.split('&');
        if(keyArr.includes(String(fieldsObj.dataType))){
            matchTypeOptions = config[key];
        }
    });
    return matchTypeOptions;
}

// 根据匹配类型获取条件类型
const getConditionOptions = (value, matchTypeOptions) => {
    let conditionOptions = []
    if(matchTypeOptions.length) {
        matchTypeOptions.forEach((key, index) => {
            if(key.value === value) {
                conditionOptions = key.childrenType;
            }
        })
    }
    return conditionOptions;
}

// 根据条件类型获取最后一个输入框类型
/**
 * @fieldsId 字段id
 * @filterItem 当前编辑的条件
 * @condMode  条件类型
*/
const getValueInputType = ({fields, matchType, condMode, fieldsData}) => {
    let inputType = ''
   // 没有层级的字段筛选
//    let dataType = fieldsList.value.find(v => v.id === fields);
    Object.keys(valueInputType).forEach(key => {
        let keyArr = key.split('&');
        if(keyArr.includes(String(fieldsData.dataType))){
            // console.log('-----：', valueInputType, key, matchType, condMode);
            if(matchType !== 13 && matchType !== 12) {
                inputType = valueInputType[key][matchType][condMode];
            } else {
                inputType = '';
            }
        }
    });
    return inputType;
}

const setRangeData = (data, index) => {
    nextTick(() => {
        if(rangeFilterItems.value.length > 0) {
            rangeFilterItems.value[index].searchRange = data;
        }
        console.log(rangeFilterItems.value, data, index);
    })
}

// 获取原始数据
const getOriginalData = () => {
    let condition = [];
    // 选择范围组件
    if(props.type === 'range') {
        rangeFilterItems.value.forEach(item => {
            let field = fieldsList.value.find(v => v.id === item.fields);
            // 如果是字段
            let value = '';
            condition.push({
                searchField: field,
                searchRange: item.searchRange,
                value: item.value // 最后一个输入框的值
            })
        })
    } else {
        filterItems.value.forEach(item => {
            console.log(item);
            let field = item.fieldsData;
            // 如果是有层级的，需要存fullDisplayName
            field.displayName = item.displayName;
            // 如果是字段
            let searchRange = {};
            let values = '';
            // 如果范围类型是【字段】
            if(item.condMode === 0) {
                if(item.matchType === 13 || item.matchType === 12) {
                    searchRange = {}
                } else {
                    if(props.fieldsSelectorType === 'default') {
                        if (props.from === 'fieldModal') {
                            searchRange = item.userInfo;
                        } else {
                            searchRange = fieldsList.value.find(v => v.id === item.value);
                        }
                    } else if (props.fieldsSelectorType === 'selectUserInfo') {
                        searchRange = item.userInfo;
                    } else {
                        searchRange = {}
                    }
                }
            } else {
                if (['numberRange', 'numberStepRange'].includes(item.type)) {
                    values = [item.fieldsStart, item.fieldsEnd];
                } else if (['searchselect'].includes(item.type)) {
                    if(!['department', 'staff', 'objectType'].includes(field.apiKey)) {
                        searchRange = item.searchRange[0];
                    } 
                    values = Array.isArray(item.value) ? item.value : [item.value];
                } else {
                    values = Array.isArray(item.value) ? item.value : [item.value];
                }
            }
            condition.push({
                searchField: field,
                matchType: item.matchType, // 匹配类型,
                condMode: item.condMode, // 条件类型：0：字段，1：值 
                searchRange: searchRange,
                range: [item.fieldsStart, item.fieldsEnd], // 范围
                values // 最后一个输入框的值
            })
        })
    }
    return {
        filterType: filterType.value, // 取集合方式
        expression: customInput.value, // 高级公式
        condition: condition
    }
}

// 查询范围字段切换
const handleRangeFieldsChange = (fieldsId, filterItem) => {
    let field = fieldsList.value.find(v => v.id === fieldsId);
    filterItem.dataType = field.dataType;
    filterItem.defaultData = [{...field, disabled: true }];
    filterItem.value = '';
    Object.keys(rangeFieldsType).forEach(key => {
        let keyArr = key.split('&');
        if(keyArr.includes(String(filterItem.dataType))){
            filterItem.rangeFieldsTypeList = rangeFieldsType[key];
        }
    });
};

// 查询关联关系字段关联的数据
const handleSelectData = (event, filterItem) => {
    filterItem.value = event.id;
    filterItem.searchRange[0] = {
        displayName: event.value
    };
}
// 清空选择关联关系输入框
const handleClearData = (filterItem) => {
    filterItem.value = '';
    filterItem.searchRange[0] = {
        displayName: ''
    };
}
// 校验范围选项值
const rangeStartRegx = (event, filterItem) => {
    if(filterItem.fieldsEnd !== '' && (event.target.value > filterItem.fieldsEnd)) {
        ElMessage.error('值的范围填写须由最小值到最大值');
    }
}

const hideClearable = (event) => {
    console.log(event)
}


watch(
    () => props.filterData,
    (val) => {
        if(val) {
            nextTick(() => {
                console.log('回显条件', val)
                // 获取字段列表
                props.fieldsSource.methods(props.fieldsSource.data).then(res => {
                    if(res.code === 10000) {
                        val.forEach(async (item, index) => {
                            fieldsList.value = res.data
                            addItem(item.searchField, 'edit');
                            if(props.type === 'default') {
                                filterItems.value[index].matchType = item.matchType;
                                // 为空、不为空特殊处理
                                if(item.matchType === 12 || item.matchType === 13) {
                                    // let dataType = fieldsList.value.find(v => v.id === item.searchField.id);
                                    handleFieldsChange(item.searchField.id, filterItems.value[index], item.searchField, 'edit');
                                    filterItems.value[index].config.conditionOptions = [];
                                    return; // 为空及不为空不显示后边的范围选择
                                }
                                handleValueTypeChange(item.matchType, filterItems.value[index], 'edit');
                                filterItems.value[index].condMode = item.searchRange ? item.searchRange[0].condMode : 1;
                                await handleConditionChange(filterItems.value[index]);
                                console.log(filterItems.value[index].type)
                                if(filterItems.value[index].type === 'fieldsSelector') {
                                    // 如果最后一个选择是用户信息选择框
                                    if(props.fieldsSelectorType === 'selectUserInfo' || props.from === 'fieldModal') {
                                        filterItems.value[index].userInfo = item.searchRange ? item.searchRange[0] : [];
                                    } else {
                                        filterItems.value[index].searchRange = item.searchRange ? item.searchRange[0] : [];
                                    }
                                    filterItems.value[index].valueDisplayName = item.searchRange ? item.searchRange[0].displayName : '请选择';
                                    filterItems.value[index].value = item.searchRange ? item.searchRange[0].id : '请选择';
                                } else {
                                    if (['dateRange', 'datetimerange', 'multSelect'].includes(filterItems.value[index].type)) {
                                        filterItems.value[index].value = item.searchRange[0].values;
                                    } else if (['numberRange', 'numberStepRange'].includes(filterItems.value[index].type)) {
                                        filterItems.value[index].fieldsStart = item.searchRange[0].values[0];
                                        filterItems.value[index].fieldsEnd = item.searchRange[0].values[1];
                                    } else if (['searchselect'].includes(filterItems.value[index].type)) {
                                        if(!['department', 'staff', 'objectType'].includes(item.searchField.referenceObjectApiKey)) {
                                            filterItems.value[index].searchRange = item.searchRange;
                                        } 
                                        filterItems.value[index].value = item.searchRange && item.searchRange[0].values ? item.searchRange[0].values[0] : '';
                                    }  else {
                                        filterItems.value[index].value = item.searchRange && item.searchRange[0].values ? item.searchRange[0].values[0] : '';
                                    }
                                }
                            } else {
                                handleRangeFieldsChange(item.searchField.id, rangeFilterItems.value[index]);
                                rangeFilterItems.value[index].fields = item.searchField.id;
                                rangeFilterItems.value[index].value = item.matchType; // 选择范围的时候，最后一个选项是匹配类型
                                rangeFilterItems.value[index].defaultData = item.searchRange.map(v => ({
                                    ...v,
                                    disabled: true
                                }));
                            }
                        })
                        console.log('2344444', filterItems.value);
                    }
                })
                filterType.value = props.filterType ? props.filterType : 0;
                customInput.value = props.filterType === 3 ? props.expression : '';
            })
        }
    },
    {
        immediate: true
    }
);

const clear = () => {
    filterItems.value = [];
    selectCustomCascaderRef.value.clear();
    filterType.value = props.filterType ? props.filterType : 0;
}

const blurInputCheck = (item, filterItem) => {
    filterItem.value = item.value
    console.log('输入实数：', item, filterItem)   
}
const blurInputCheckStart = (item, filterItem) => {
    console.log('输入实数：', item, filterItem)
    filterItem.fieldsStart = item.value;  
}
const blurInputCheckEnd = (item, filterItem) => {
    filterItem.fieldsEnd = item.value;  
}

watch(
    () => props.fieldsSource.data.objectId,
    (val) => {
        if (val) {
            filterItems.value = [];
            rangeFilterItems.value = [];

        }
    },
    {
        immediate: true
    }
);
watch(
    () => props.filterType,
    (val) => {
        filterType.value = val ? val : 0;
        customInput.value = val === 3 ? props.expression : '';
    },
    {
        immediate: true
    }
);
watch(
    () => filterType.value,
    (val) => {
        console.log(val);
        if (val === 0) {
            filterItems.value = [];
            rangeFilterItems.value = [];
        }
    },
    {
        immediate: true
    }
);


defineExpose({
    validerSenior,
    getOriginalData,
    clear
});
</script>
<style lang="scss" scoped>
.select-box {
    margin-bottom: 12px;
    .fliter-item {
       margin-right: 12px; 
    }
    .#{$elnamespace}-date-editor.#{$elnamespace}-input, .#{$elnamespace}-date-editor.#{$elnamespace}-input__wrapper{
        width: 175px;
    }
    .custom-minus-cirlce {
        font-size: 24px;
        color: $dangerColor;
        padding-top: 6px;
        cursor: pointer;
    }
    .error-input {
        border:1px solid red ;
        border-radius: 6px;
    }
    
}
.senior-condition-box {
    margin-top:16px;
    display: flex;
    align-items: center;
    :deep {
        .right-color {
            color: #24A353;
            i{
                float: right;
            }
        }
        .error-color {
            color: red;
            i{
                float: right;
            }
        }
    }
}
.add-filter-item {
    cursor: pointer;
    span{
        color: $textlinkColor;
        font-size: 14px;
    }
    .custom-add1{
        font-size: 20px;
    }
    
}
.custom-Cascader {
    font-size: 14px;
    &-box{
        background: #fff;
        display: flex;
        box-shadow: 0 1px 4px 0 #EAEAEA;
    }
    &-ul{
        width: 149px;
        border-right: 1px solid #E5E7ED;
        padding: 8px 0px;
        height: 390px;
        li{
            padding: 4px 12px;
            display: flex;
            align-items: center;
            cursor: pointer;
            &:hover{
                background-color: var(--xhl-el-dropdown-menuItem-hover-fill);
                color: var(--xhl-el-dropdown-menuItem-hover-color)
            }
            &.active{
                background: #F4F8FB;
                span {
                    color: #4285F2;
                }
            }
            display: flex;
            justify-content: space-between;
            .custom {
                color: #A8ABB2;
            }
        }
    }
}
</style>
<style lang="scss">
.all-purpose-filter {
    .#{$elnamespace}-date-editor.#{$elnamespace}-input, .#{$elnamespace}-date-editor.#{$elnamespace}-input__wrapper{
        width: 175px;
    }
    .#{$elnamespace}-input-number .#{$elnamespace}-input__suffix{
        display:none!important;
    }
}
.senior-condition .#{$elnamespace}-input__wrapper {
    box-shadow: 0 0 0 0px var(--xhl-el-input-border-color,var(--xhl-el-border-color)) inset;
    border: 1px solid #DCDFE6;
    border-right: 0px;
}
.senior-condition .#{$elnamespace}-input-group__append, .senior-condition .#{$elnamespace}-input-group__prepend {
    background-color: #fff;
}
.senior-condition {
    span {
        cursor: pointer;
    }
}
.#{$elnamespace}-popper.all-purpose-filter-popover {
    padding-left: 0px;
    padding-right: 0px;   
}
</style>