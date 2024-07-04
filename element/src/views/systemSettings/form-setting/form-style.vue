<template>
    <div class="formStyle">
        <!-- 顶部提示语及右侧按钮 -->
        <div style="margin-bottom: 10px;display: flex;">
            <!-- 提示语 -->
            <span style="line-height: 30px;font-size: 12px;flex: 1;">{{ $t('formSet.formStyleTip') }}</span>
            <!-- 返回 -->
            <Button
                    @click="goBack"
                    style="margin-right: 12px">{{ $t('formSet.backBtn') }}</Button>
            <!-- 保存 -->
            <Button type="primary"
                    @click="saveStyle">{{ $t('formSet.saveBtn') }}</Button>
        </div>

        <!-- 正体: 预览表单 + 右侧配置项 -->
        <Row>
            <!-- 预览表单 -->
            <Col :span="16">
                <Card shadow="never">
                    <!-- 表单名 -->
                    <div slot="header"
                         style="color: rgba(0, 0, 0, 0.8)">{{ formName }}</div>
                    <!-- 表单正体 -->
                    <div class="form-style-block"
                         :style="{ height: `${clipHeight}px` }">
                        <div ref="todoList"
                             style="position:relative;"
                             :style="{ width: `${value1}px`, fontFamily: `${value11}` }">
                            <!-- 表单项 -->
                            <div>
                                <div v-for="column in clueListTemp"
                                     :class="{ from_active: isActive, 'field-block': true }">
                                    <!-- label -->
                                    <div :style="{color: color1 }"
                                         class="field-name">{{ column.name }}</div>
                                    <!-- 输入框 -->
                                    <div class="field-frame">
                                        <!-- 单选框 -->
                                        <Select v-if="column.type == 'select'"
                                                v-model="column.value"
                                                :style="{ width: `${value3}px`, height: `${value31}px`, borderRadius: `${value32}px`, border: `1px solid ${color12}`, overflow: 'hidden'}"
                                                class="field-select">
                                            <Option v-for="item in filterOption(column.option)"
                                                    :value="item"
                                                    :label="item"></Option>
                                        </Select>
                                        <!-- 多选框 -->
                                        <Select v-else-if="column.type == 'selectMultiple'"
                                                v-model="column.value"
                                                multiple
                                                :placeholder="column.colDefaultValue || undefined"
                                                :style="{ width: `${value3}px`, minHeight: `${value31}px`, borderRadius: `${value32}px`, border: `1px solid ${color12}`, overflow: 'hidden' }"
                                                class="field-select">
                                            <Option v-for="item in filterOption(column.option)"
                                                    :value="item"
                                                    :label="item"></Option>
                                        </Select>
                                        <!-- 多行文本框 -->
                                        <textarea v-else-if="column.type == 'textarea'"
                                                  :style="{ width: `${value4}px`, height: `${value41}px`, borderRadius: `${value42}px`, border: `1px solid ${color12}` }"></textarea>
                                        <!-- 文本框 -->
                                        <input v-else
                                               :style="{ width: `${value2}px`, height: `${value21}px`, borderRadius: `${value22}px`, border: `1px solid ${color12}` }"/>
                                    </div>
                                    <!-- 是否必填 -->
                                    <span v-show="column.isNeed == 1"
                                          style="color: red">*</span>
                                </div>
                                <div style="clear: both"></div>
                            </div>

                            <!-- 底部提交按钮 -->
                            <div style="text-align: center;margin-top: 10px">
                                <Button @click="showSuccessTip"
                                        :style="{width: `${value5}px`, height: `${value51}px`, borderRadius: `${value52}px`,backgroundColor: color51, border: 'none', color: color5, padding: '0 20px' }"
                                        class="form-bottom">{{ value53 }}</Button>
                            </div>

                            <!-- 保存成功提示语 -->
                            <div v-if="successMsgShow"
                                 :style="{ 'backgroundColor': color71, 'borderColor': color72, 'color': color73, fontFamily: `${value11}` }"
                                 class="formStyle-msgTip">{{ value71 }}</div>

                            <!-- 保存成功确认框 -->
                            <div v-if="successConfirmShow"
                                 class="formStyle-confirmTip">
                                <div :style="{ 'backgroundColor': color74, 'borderColor': color75, fontFamily: `${value11}` }"
                                     class="formStyle-confirmTip-box">
                                    <p :style="{ 'color': color76, 'textAlign': value72 }"
                                       class="formStyle-confirmTip-text">{{ value73 }}</p>

                                    <div @click="successConfirmShow = false"
                                         :style="{ 'width': `${value74}px`, 'height': `${value75}px`, 'lineHeight': `${value75}px`, 'borderRadius': `${value76}px`, 'color': color77, 'border': `1px solid ${color78}`, 'backgroundColor': color79 }"
                                         class="formStyle-confirmTip-btn form-bottom">{{ value77 }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </Col>

            <!-- 配置项 -->
            <Col :span="8"
                 class="padding-left-10">
                <div>
                    <div :style="{ height: `${clipHeight1}px` }"
                         class="form-style-block">
                        <!-- 整体参数 -->
                        <!-- trigger -->
                        <div @click="item1 = !item1"
                             class="style-block">{{ $t('formSet.item1') }}
                            <Icon v-if="item1"
                                  type="arrow-up-b"
                                  class="icon-style"></Icon>
                            <Icon v-else
                                  type="arrow-down-b"
                                  class="icon-style"></Icon>
                        </div>
                        <!-- 配置面板 -->
                        <div v-show="item1"
                             class="block-div">
                            <Row>
                                <!-- 整体布局 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item11') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Select v-model="model1"
                                                @change="optionSel">
                                            <Option value="1"
                                                    :label="$t('formSet.option1')"></Option>
                                            <Option value="2"
                                                    :label="$t('formSet.option2')"></Option>
                                        </Select>
                                    </Col>
                                </Col>
                                <!-- 表单宽度 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item12') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Input v-model="value1"
                                               placeholder="default size"
                                               class="ipt-style"></Input>
                                        <span class="ipt-tips">px</span>
                                    </Col>
                                </Col>
                                <!-- 字体颜色 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item13') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <ColorPicker v-model="color1"
                                                     @active-change="colorChange"/>
                                    </Col>
                                </Col>
                                <!-- 边框颜色 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item14') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <ColorPicker v-model="color12"
                                                     @active-change="colorChange1"/>
                                    </Col>
                                </Col>
                                <!-- 字体 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item15') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Select v-model="value11">
                                            <Option v-for="item in fontFamilyOptions"
                                                    :key="item.value"
                                                    :value="item.value"
                                                    :label="item.label"
                                                    :style="!['Wingdings', 'Webdings'].includes(item.label) ? `font-family: ${item.value}` : ''"
                                                    class="mail-default-family"></Option>
                                        </Select>
                                    </Col>
                                </Col>
                            </Row>
                        </div>

                        <!-- input 样式 -->
                        <!-- trigger -->
                        <div @click="item2 = !item2"
                             class="style-block">{{ $t('formSet.item2') }}
                            <Icon v-if="item2"
                                  type="arrow-up-b"
                                  class="icon-style"></Icon>
                            <Icon v-else
                                  type="arrow-down-b"
                                  class="icon-style"></Icon>
                        </div>
                        <!-- 配置面板 -->
                        <div v-show="item2"
                             class="block-div">
                            <Row>
                                <Col :span="12"
                                     class="block-item">
                                    <!-- 宽 -->
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item21') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Input v-model="value2"
                                               placeholder="default size"
                                               class="ipt-style"></Input>
                                        <span class="ipt-tips">px</span>
                                    </Col>
                                </Col>
                                <!-- 高 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item22') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Input v-model="value21"
                                               placeholder="default size"
                                               class="ipt-style"></Input>
                                        <span class="ipt-tips">px</span>
                                    </Col>
                                </Col>
                                <!-- 圆角 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item23') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Input v-model="value22"
                                               placeholder="default size"
                                               class="ipt-style"></Input>
                                        <span class="ipt-tips">px</span>
                                    </Col>
                                </Col>
                            </Row>
                        </div>

                        <!-- select 样式 -->
                        <!-- trigger -->
                        <div @click="item3 = !item3"
                             class="style-block">{{ $t('formSet.item3') }}
                            <Icon v-if="item3"
                                  type="arrow-up-b"
                                  class="icon-style"></Icon>
                            <Icon v-else
                                  type="arrow-down-b"
                                  class="icon-style"></Icon>
                        </div>
                        <!-- 配置面板 -->
                        <div v-show="item3"
                             class="block-div">
                            <Row>
                                <!-- 宽 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item21') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Input v-model="value3"
                                               placeholder="default size"
                                               class="ipt-style"></Input>
                                        <span class="ipt-tips">px</span>
                                    </Col>
                                </Col>
                                <!-- 高 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item22') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Input v-model="value31"
                                               placeholder="default size"
                                               class="ipt-style"></Input>
                                        <span class="ipt-tips">px</span>
                                    </Col>
                                </Col>
                                <!-- 圆角 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item23') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Input v-model="value32"
                                               placeholder="default size"
                                               class="ipt-style"></Input>
                                        <span class="ipt-tips">px</span>
                                    </Col>
                                </Col>
                            </Row>
                        </div>

                        <!-- textarea 样式 -->
                        <!-- trigger -->
                        <div @click="item4 = !item4"
                             class="style-block">{{ $t('formSet.item4') }}
                            <Icon v-if="item4"
                                  type="arrow-up-b"
                                  class="icon-style"></Icon>
                            <Icon v-else
                                  type="arrow-down-b"
                                  class="icon-style"></Icon>
                        </div>
                        <!-- 配置面板 -->
                        <div v-show="item4"
                             class="block-div">
                            <Row>
                                <Col :span="12"
                                     class="block-item">
                                    <!-- 宽 -->
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item21') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Input v-model="value4"
                                               placeholder="default size"
                                               class="ipt-style"></Input>
                                        <span class="ipt-tips">px</span>
                                    </Col>
                                </Col>
                                <!-- 高 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item22') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Input v-model="value41"
                                               placeholder="default size"
                                               class="ipt-style"></Input>
                                        <span class="ipt-tips">px</span>
                                    </Col>
                                </Col>
                                <!-- 圆角 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item23') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Input v-model="value42"
                                               placeholder="default size"
                                               class="ipt-style"></Input>
                                        <span class="ipt-tips">px</span>
                                    </Col>
                                </Col>
                            </Row>
                        </div>

                        <!-- 提交按钮 -->
                        <!-- trigger -->
                        <div class="style-block"
                             @click="item5 = !item5">{{ $t('formSet.item5') }}
                            <Icon v-if="item5"
                                  type="arrow-up-b"
                                  class="icon-style"></Icon>
                            <Icon v-else
                                  type="arrow-down-b"
                                  class="icon-style"></Icon>
                        </div>
                        <!-- 配置面板 -->
                        <div v-show="item5"
                             class="block-div">
                            <Row>
                                <!-- 宽 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item21') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Input v-model="value5"
                                               placeholder="default size"
                                               class="ipt-style"></Input>
                                        <span class="ipt-tips">px</span>
                                    </Col>
                                </Col>
                                <!-- 字体颜色 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item13') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <ColorPicker v-model="color5"
                                                     @active-change="colorChange5"/>
                                    </Col>
                                </Col>
                                <!-- 高 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item22') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Input class="ipt-style"
                                               v-model="value51"
                                               placeholder="default size"></Input>
                                        <span class="ipt-tips">px</span>
                                    </Col>
                                </Col>
                                <!-- 背景颜色 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item73') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <ColorPicker v-model="color51"
                                                     @active-change="colorChange51"/>
                                    </Col>
                                </Col>
                                <!-- 圆角 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item23') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Input v-model="value52"
                                               placeholder="default size"
                                               class="ipt-style"></Input>
                                        <span class="ipt-tips">px</span>
                                    </Col>
                                </Col>
                                <!-- 按钮文本 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item56') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Input v-model="value53"
                                               placeholder="default size"></Input>
                                    </Col>
                                </Col>
                                <!--<Col span="12">-->
                                <!--<Col span="12" class="item-left"><span style="margin-right: 10px">附加代码:</span></Col>-->
                                <!--<Col span="12" class="style-item">-->
                                <!--<Input v-model="value54" placeholder="default size"></Input>-->
                                <!--</Col>-->
                                <!--</Col>-->
                            </Row>
                        </div>

                        <!-- 提交后提示语样式 -->
                        <!-- trigger -->
                        <div class="style-block"
                             @click="item7 = !item7">{{ $t('formSet.item7') }}
                            <!-- 系统 tip -->
                            <HelpTip :title="$t('helpTip.formStyleSuccessTip')"></HelpTip>

                            <Icon v-if="item7"
                                  type="arrow-up-b"
                                  class="icon-style"></Icon>
                            <Icon v-else
                                  type="arrow-down-b"
                                  class="icon-style"></Icon>
                        </div>
                        <!-- 配置面板 -->
                        <div v-show="item7"
                             class="block-div">
                            <!-- 文本提示/弹窗提示 选择 -->
                            <ButtonGroup class="formStyle-successTipType">
                                <!-- 文本提示 -->
                                <Button type="plain"
                                        @click="value7 = 'msg'"
                                        :class="{ 'formStyle-successTipType__active': value7 === 'msg' }">{{ $t('formSet.item71') }}</Button>
                                <!-- 弹窗提示 -->
                                <Button type="plain"
                                        @click="value7 = 'confirm'"
                                        :class="{ 'formStyle-successTipType__active': value7 === 'confirm' }">{{ $t('formSet.item72') }}</Button>
                            </ButtonGroup>
<!--                            <Row>-->
<!--                                &lt;!&ndash; 文本框 &ndash;&gt;-->
<!--                                <Col :span="12"-->
<!--                                     class="block-item">-->
<!--                                    <Col :span="24"-->
<!--                                         class="style-item">-->
<!--                                        <Radio v-model="value7"-->
<!--                                               label="msg">-->
<!--                                            <span>{{ $t('formSet.item71') }}</span>-->
<!--                                        </Radio>-->
<!--                                    </Col>-->
<!--                                </Col>-->
<!--                                &lt;!&ndash; 下拉框 &ndash;&gt;-->
<!--                                <Col :span="12"-->
<!--                                     class="block-item">-->
<!--                                    <Col :span="24"-->
<!--                                         class="style-item">-->
<!--                                        <Radio v-model="value7"-->
<!--                                               label="confirm">-->
<!--                                            <span>{{ $t('formSet.item72') }}</span>-->
<!--                                        </Radio>-->
<!--                                    </Col>-->
<!--                                </Col>-->
<!--                            </Row>-->

                            <!-- 选择后的参数设置 -->
                            <!-- 文本提示 -->
                            <Row v-if="value7 === 'msg'">
                                <!-- 背景颜色 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item73') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <ColorPicker v-model="color71"
                                                     @active-change="colorChange7($event, 'color71')"/>
                                    </Col>
                                </Col>
                                <!-- 边框颜色 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item74') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <ColorPicker v-model="color72"
                                                     @active-change="colorChange7($event, 'color72')"/>
                                    </Col>
                                </Col>
                                <!-- 字体颜色 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item75') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <ColorPicker v-model="color73"
                                                     @active-change="colorChange7($event, 'color73')"/>
                                    </Col>
                                </Col>
                                <!-- 提示文本 -->
                                <Col :span="24"
                                     style="padding-right: 60px;"
                                     class="block-item">
                                    <Col :span="6"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item76') }}</span>
                                    </Col>
                                    <Col :span="15"
                                         class="style-item">
                                        <ElInputExtend v-model="value71"
                                                       maxLen="50"
                                                       :errorMessage="$t('enterClue.upperLimitTip')"
                                                       :showErrorMsg="true"></ElInputExtend>
                                    </Col>
                                </Col>
                            </Row>

                            <!-- 弹窗提示 -->
                            <Row v-if="value7 === 'confirm'">
                                <!-- 弹窗样式 -->
                                <Col :span="24">
                                    <p style="margin: 20px; color: rgba(0, 0, 0, 0.8); font-weight: 700; font-size: 14px; line-height: 18px;">{{ $t('formSet.item77') }}</p>
                                </Col>
                                <!-- 背景颜色 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item73') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <ColorPicker v-model="color74"
                                                     @active-change="colorChange7($event, 'color74')"/>
                                    </Col>
                                </Col>
                                <!-- 边框颜色 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item74') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <ColorPicker v-model="color75"
                                                     @active-change="colorChange7($event, 'color75')"/>
                                    </Col>
                                </Col>
                                <!-- 字体颜色 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item75') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <ColorPicker v-model="color76"
                                                     @active-change="colorChange7($event, 'color76')"/>
                                    </Col>
                                </Col>
                                <!-- 对齐方式 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item79') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <div class="formStyle-alignButtonGroup">
                                            <!-- 左对齐 -->
                                            <Button type="text"
                                                    @click="value72 = 'left'"
                                                    :class="{'formStyle-alignButton__active': value72 === 'left'}">
                                                <svg width="24" height="24" focusable="false"><path d="M5 5h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 110-2zm0 4h8c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 110-2zm0 8h8c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 010-2zm0-4h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 010-2z" fill-rule="evenodd"></path></svg>
                                            </Button>
                                            <!-- 居中 -->
                                            <Button type="text"
                                                    @click="value72 = 'center'"
                                                    :class="{'formStyle-alignButton__active': value72 === 'center'}">
                                                <svg width="24" height="24" focusable="false"><path d="M5 5h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 110-2zm3 4h8c.6 0 1 .4 1 1s-.4 1-1 1H8a1 1 0 110-2zm0 8h8c.6 0 1 .4 1 1s-.4 1-1 1H8a1 1 0 010-2zm-3-4h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 010-2z" fill-rule="evenodd"></path></svg>
                                            </Button>
                                            <!-- 右对齐 -->
                                            <Button type="text"
                                                    @click="value72 = 'right'"
                                                    :class="{'formStyle-alignButton__active': value72 === 'right'}">
                                                <svg width="24" height="24" focusable="false"><path d="M5 5h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 110-2zm6 4h8c.6 0 1 .4 1 1s-.4 1-1 1h-8a1 1 0 010-2zm0 8h8c.6 0 1 .4 1 1s-.4 1-1 1h-8a1 1 0 010-2zm-6-4h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 010-2z" fill-rule="evenodd"></path></svg>
                                            </Button>
                                            <!-- 两端对齐 -->
                                            <Button type="text"
                                                    @click="value72 = 'justify'"
                                                    :class="{'formStyle-alignButton__active': value72 === 'justify'}">
                                                <svg width="24" height="24" focusable="false"><path d="M5 5h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 110-2zm0 4h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 110-2zm0 4h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 010-2zm0 4h14c.6 0 1 .4 1 1s-.4 1-1 1H5a1 1 0 010-2z" fill-rule="evenodd"></path></svg>
                                            </Button>
                                        </div>
                                    </Col>
                                </Col>
                                <!-- 提示文本 -->
                                <Col :span="24"
                                     style="padding-right: 60px;"
                                     class="block-item">
                                    <Col :span="6"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item76') }}</span>
                                    </Col>
                                    <Col :span="15"
                                         class="style-item">
                                        <ElInputExtend v-model="value73"
                                                       maxLen="50"
                                                       :errorMessage="$t('enterClue.upperLimitTip')"
                                                       :showErrorMsg="true"></ElInputExtend>
                                    </Col>
                                </Col>

                                <!-- 按钮样式 -->
                                <Col :span="24">
                                    <p style="margin: 20px; color: rgba(0, 0, 0, 0.8); font-weight: 700; font-size: 14px; line-height: 18px;">{{ $t('formSet.item78') }}</p>
                                </Col>
                                <!-- 宽 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item21') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Input v-model="value74"
                                               placeholder="default size"
                                               class="ipt-style"></Input>
                                        <span class="ipt-tips">px</span>
                                    </Col>
                                </Col>
                                <!-- 字体颜色 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item75') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <ColorPicker v-model="color77"
                                                     @active-change="colorChange7($event, 'color77')"/>
                                    </Col>
                                </Col>
                                <!-- 高 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item22') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Input class="ipt-style"
                                               v-model="value75"
                                               placeholder="default size"></Input>
                                        <span class="ipt-tips">px</span>
                                    </Col>
                                </Col>
                                <!-- 边框颜色 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item74') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <ColorPicker v-model="color78"
                                                     @active-change="colorChange7($event, 'color78')"/>
                                    </Col>
                                </Col>
                                <!-- 圆角 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item23') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <Input v-model="value76"
                                               placeholder="default size"
                                               class="ipt-style"></Input>
                                        <span class="ipt-tips">px</span>
                                    </Col>
                                </Col>
                                <!-- 背景颜色 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="12"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item73') }}</span>
                                    </Col>
                                    <Col :span="12"
                                         class="style-item">
                                        <ColorPicker v-model="color79"
                                                     @active-change="colorChange7($event, 'color79')"/>
                                    </Col>
                                </Col>
                                <!-- 按钮文本 -->
                                <Col :span="24"
                                     style="padding-right: 60px;"
                                     class="block-item">
                                    <Col :span="6"
                                         class="item-left">
                                        <span style="margin-right: 10px">{{ $t('formSet.item56') }}</span>
                                    </Col>
                                    <Col :span="15"
                                         class="style-item">
                                        <ElInputExtend v-model="value77"
                                                       maxLen="50"
                                                       :errorMessage="$t('enterClue.upperLimitTip')"
                                                       :showErrorMsg="true"></ElInputExtend>
                                    </Col>
                                </Col>
                            </Row>
                        </div>

                        <!-- 国家地区字段样式 -->
                        <!-- trigger -->
                        <div v-if="hasCountryAreaField"
                             @click="item6 = !item6"
                             class="style-block">{{ $t('formSet.item6') }}
                            <Icon v-if="item6"
                                  type="arrow-up-b"
                                  class="icon-style"></Icon>
                            <Icon v-else
                                  type="arrow-down-b"
                                  class="icon-style"></Icon>
                        </div>
                        <!-- 配置面板 -->
                        <div v-show="item6"
                             class="block-div">
                            <Row>
                                <!-- 文本框 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="24"
                                         class="style-item">
                                        <Radio v-model="value6"
                                               label="input">
                                            <span>{{ $t('formSet.item61') }}</span>
                                        </Radio>
                                    </Col>
                                </Col>
                                <!-- 下拉框 -->
                                <Col :span="12"
                                     class="block-item">
                                    <Col :span="24"
                                         class="style-item">
                                        <Radio v-model="value6"
                                               label="select">
                                            <span>{{ $t('formSet.item62') }}</span>
                                        </Radio>
                                    </Col>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </Col>
        </Row>
    </div>
</template>

<script>
    import Vue from 'vue';
    import { mapState } from 'vuex';
    import util from '@/libs/util';
    import Sortable from 'sortablejs';

    export default {
        name: 'form-style',
        props: [
            'showField',
            'formId',
            'templateId'
        ],
        computed: {
            ...mapState([
                'window_height'
            ]),
            clipHeight() {
                return this.window_height - 250;
            },
            clipHeight1() {
                return this.window_height - 145;
            },
            // 是否存在"国家地区"字段
            hasCountryAreaField() {
                return this.clueListTemp.findIndex(item => item.key === 'a1003') !== -1;
            }
        },
        data() {
            return {
                selectV: '',
                mSelectV: [],
                isActive: false,
                item1: false,
                item2: false,
                item3: false,
                item4: false,
                item5: false,
                item6: false,
                item7: false,
                color12: '#cccccc',
                color1: '#000000',
                value1: '420',
                value11: 'arial,helvetica,sans-serif',
                model1: '1',
                value2: 230,
                value21: '30',
                value22: '3',
                value3: '230',
                value31: '30',
                value32: '3',
                value4: '230',
                value41: '80',
                value42: '3',
                value5: '70',
                value51: '30',
                value52: '3',
                value53: '提交',
                value54: '',
                color5: '#ffffff',
                color51: '#51b7a3',
                value6: 'input',
                value7: 'msg',
                color71: '#DFF0D8',
                color72: '#DFF0D8',
                color73: '#60915F',
                color74: '#FFF',
                color75: '#FFF',
                color76: '#000',
                color77: '#51B7A3',
                color78: '#FFF',
                color79: '#FFF',
                value71: '提交成功',
                value72: 'left',
                value73: '提交成功',
                value74: '70',
                value75: '30',
                value76: '3',
                value77: '关闭',
                formName: '表单名',
                clueListTemp: [],
                clueList: [], // 线索列表
                index: -1, // 线索表中当前选中的项的序号
                enquiryId: '', // 线索表id
                enterpriseId: 100, // 企业id
                userName: 'yuanzhi', // 当前登录账户名
                userId: '8', // 当前登录账户id
                lang_fixed_columns: {
                    a1001: this.$t('crm.InqSet.corp_companyName'),
                    a1002: this.$t('crm.InqSet.corp_mainProduct'),
                    a1003: this.$t('crm.InqSet.corp_countryArea'),
                    a1004: this.$t('crm.InqSet.corp_homePage'),
                    a1005: this.$t('crm.InqSet.corp_fax'),
                    a1006: this.$t('crm.InqSet.corp_phone'),
                    a1007: this.$t('crm.InqSet.corp_contactAddress'),
                    a1008: this.$t('crm.InqSet.corp_companyRemark'),
                    a1009: this.$t('crm.InqSet.contact_nickName'),
                    a10010: this.$t('crm.InqSet.contact_email'),
                    a10011: this.$t('crm.InqSet.contact_jobTitle'),
                    a10012: this.$t('crm.InqSet.contact_phone'),
                    a10013: this.$t('crm.InqSet.contact_socialNetworkingPlatform'),
                    a10014: this.$t('crm.InqSet.contact_gender'),
                    a10015: this.$t('crm.InqSet.contact_remark'),
                    a10016: this.$t('crm.InqSet.inq_demandProducts'),
                    a10017: this.$t('crm.InqSet.inq_label'),
                    a10018: this.$t('crm.InqSet.inq_productCategory'),
                    a10019: this.$t('crm.InqSet.inq_sourceChannel'),
                    a10020: this.$t('crm.InqSet.inq_sourceWay'),
                    a10021: this.$t('crm.InqSet.inq_remark'),
                    a10052: this.$t('crm.InqSet.contact_whatsApp'),
                    a10053: this.$t('crm.InqSet.contact_instagram')
                },
                fontFamilyOptions: [
                    {
                        value: '黑体',
                        label: '黑体'
                    },
                    {
                        value: '宋体',
                        label: '宋体'
                    },
                    {
                        value: '微软雅黑',
                        label: '微软雅黑'
                    },
                    {
                        value: '楷体',
                        label: '楷体'
                    },
                    {
                        value: 'andale mono,times',
                        label: 'Andale Mono'
                    },
                    {
                        value: 'arial,helvetica,sans-serif',
                        label: 'Arial'
                    },
                    {
                        value: 'arial black,avant garde',
                        label: 'Arial Black'
                    },
                    {
                        value: 'book antiqua,palatino',
                        label: 'Book Antiqua'
                    },
                    {
                        value: 'calibri',
                        label: 'Calibri'
                    },
                    {
                        value: 'comic sans ms,sans-serif',
                        label: 'Comic Sans MS'
                    },
                    {
                        value: 'courier new,courier',
                        label: 'Courier New'
                    },
                    {
                        value: 'georgia,palatino',
                        label: 'Georgia'
                    },
                    {
                        value: 'helvetica',
                        label: 'Helvetica'
                    },
                    {
                        value: 'impact,chicago',
                        label: 'Impact'
                    },
                    {
                        value: 'symbol',
                        label: 'Symbol'
                    },
                    {
                        value: 'tahoma,arial,helvetica,sans-serif',
                        label: 'Tahoma'
                    },
                    {
                        value: 'terminal,monaco',
                        label: 'Terminal'
                    },
                    {
                        value: 'times new roman,times',
                        label: 'Times New Roman'
                    },
                    {
                        value: 'trebuchet ms,geneva',
                        label: 'Trebuchet MS'
                    },
                    {
                        value: 'verdana,geneva',
                        label: 'Verdana'
                    },
                    {
                        value: 'webdings',
                        label: 'Webdings'
                    },
                    {
                        value: 'wingdings,zapf dingbats',
                        label: 'Wingdings'
                    }
                ],

                // 保存成功提示语相关
                successMsgShow: false,
                successConfirmShow: false
            };
        },
        methods: {
            colorChange(val) {
                this.color1 = val;
            },
            colorChange1(val) {
                this.color12 = val;
            },
            colorChange5(val) {
                this.color5 = val;
            },
            colorChange51(val) {
                this.color51 = val;
            },
            colorChange7(val, key) {
                this[key] = val;
            },
            saveStyle() {
                // 数据校验
                // 数据超长
                // 提交后提示语样式 - 文本提示, 文字超长校验
                if (this.value7 === 'msg') {
                    if (this.value71.length > 50) {
                        // 提交后提示语样式 - 文本提示 - 提示文本, 字段超出上限, 弹出提示并退出保存流程

                        this.$Message.error(this.$t('monitorLink.monitorLinkToolong').replace('$fieldName', `[${this.$t('formSet.item7')} - ${this.$t('formSet.item71')} - ${this.$t('formSet.item76')}] `).replace('$maxLength', ' 50 '));
                        return;
                    } else {
                        // 未超出上限, 检查"提交后提示语样式 - 弹窗提示"相关字段是否超出上限, 是则截断, 继续保存

                        if (this.value73.length > 50) {
                            this.value73 = this.value73.slice(0, 50);
                        }
                        if (this.value77.length > 50) {
                            this.value77 = this.value77.slice(0, 50);
                        }
                    }
                }
                // 提交后提示语样式 - 弹窗提示, 文字超长校验
                if (this.value7 === 'confirm') {
                    if (this.value73.length > 50) {
                        // 提交后提示语样式 - 弹窗提示 - 提示文本, 字段超出上限, 弹出提示并退出保存流程

                        this.$Message.error(this.$t('monitorLink.monitorLinkToolong').replace('$fieldName', `[${this.$t('formSet.item7')} - ${this.$t('formSet.item72')} - ${this.$t('formSet.item76')}] `).replace('$maxLength', ' 50 '));
                        return;
                    } else if (this.value77.length > 50) {
                        // 提交后提示语样式 - 弹窗提示 - 按钮文本, 字段超出上限, 弹出提示并退出保存流程

                        this.$Message.error(this.$t('monitorLink.monitorLinkToolong').replace('$fieldName', `[${this.$t('formSet.item7')} - ${this.$t('formSet.item72')} - ${this.$t('formSet.item56')}] `).replace('$maxLength', ' 50 '));
                        return;
                    } else {
                        // 未超出上限, 检查"提交后提示语样式 - 文本提示"相关字段是否超出上限, 是则截断, 继续保存

                        if (this.value71.length > 50) {
                            this.value71 = this.value71.slice(0, 50);
                        }
                    }
                }

                // 数据处理
                const content = {
                    column: this.model1,
                    form_w: this.value1,
                    font_c: this.color1,
                    border_c: this.color12,
                    font: this.value11
                };
                content.INPUT = {
                    width: this.value2,
                    height: this.value21,
                    radius: this.value22
                };
                content.SELECT = {
                    width: this.value3,
                    height: this.value31,
                    radius: this.value32
                };
                content.TEXTAREA = {
                    width: this.value4,
                    height: this.value41,
                    radius: this.value42
                };
                content.BUTTON = {
                    width: this.value5,
                    height: this.value51,
                    radius: this.value52,
                    font_c: this.color5,
                    border_c: this.color51,
                    btn_txt: this.value53
                };
                content.SUCCESSTIP = {
                    type: this.value7,
                    msg: {
                        bg_c: this.color71,
                        border_c: this.color72,
                        font_c: this.color73,
                        txt: this.value71
                    },
                    confirm: {
                        box: {
                            bg_c: this.color74,
                            border_c: this.color75,
                            font_c: this.color76,
                            txt_align: this.value72,
                            txt: this.value73
                        },
                        btn: {
                            width: this.value74,
                            height: this.value75,
                            radius: this.value76,
                            font_c: this.color77,
                            border_c: this.color78,
                            bg_c: this.color79,
                            txt: this.value77
                        }
                    }
                };
                if (this.hasCountryAreaField) {
                    content.COUNTRYAREA = {
                        type: this.value6
                    };
                }
                const postData = {
                    id: this.formId,
                    content: JSON.stringify(content)
                };

                // 保存翻译数据处理
                const translateList = [...new Set([this.value53, this.value71, this.value73, this.value77])].filter(item => item);

                // 发送请求
                util.ajax({
                    url: '/form-cust/form/updateTemplateConfig',
                    method: 'post',
                    data: postData
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$Message.success(this.$t('formSet.fieldTip3'));

                        // 多语种翻译
                        if (translateList.length) {
                            this.saveTranslate(translateList);
                        }
                    }
                });
            },
            saveTranslate(list) {
                const postData = {
                    orgId: this.enterpriseId,
                    textList: list,
                    dest: 'zh_cn'
                };
                util.ajaxJson({
                    url: '/cuss-login/translate/save',
                    method: 'post',
                    data: JSON.stringify(postData)
                }).then(response => {
                    if (response.data.code === '1') {
                        console.log('翻译保存成功!');
                    }
                });
            },
            optionSel(value) {
                if (value == 1) {
                    this.value1 = '420';
                    this.value2 = '230';
                    this.value3 = '230';
                    this.value4 = '230';
                    this.isActive = false;
                } else {
                    this.value1 = '700';
                    this.value2 = '200';
                    this.value3 = '200';
                    this.value4 = '200';
                    this.isActive = true;
                }
            },
            // 返回表格页
            goBack() {
                this.$emit('update:showField', 0);
            },
            /* 把字段option转成数组 */
            filterOption(str) {
                console.log(str);
                let arr = [];
                arr = str.split('?');
                return arr;
            },
            /* 线索表单与crm字段对应关系 */
            getList() {
                util.ajax({
                    url: '/form-cust/formcrm/getList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(response => {
                });
            },
            /* 将字段拼装成新对象 */
            makeUpArr(arr) {
                const tempArr = [];
                for (const item in arr) {
                    const obj = {
                        name: arr[item].name,
                        sourceKey: item,
                        option: arr[item].option,
                        type: arr[item].type,
                        isNeed: 0,
                        verify: '',
                        key: item
                    };
                    tempArr.push(obj);
                }
                return tempArr;
            },
            /* 保存线索模板 */
            saveClueForm() {
                if (this.formName.trim() == '') {
                    this.$Message.warning(this.$t('formSet.fieldTip'));
                    return false;
                }
                const jsonData = {
                    //                    id:this.enquiryId,
                    cname: this.formName,
                    orgId: this.enterpriseId,
                    updateType: 'all',
                    billType: 1,
                    create_user: this.userName,
                    createUserId: this.userId
                };
                if (this.formId != '') {
                    jsonData.id = this.formId;
                }
                // console.log(this.clueList)
                for (let i = 0; i < this.clueList.length; i++) {
                    let obj = {};
                    obj = this.clueList[i];
                    obj.order = i + 1;
                    // console.log(obj.key)
                    jsonData[obj.key] = JSON.stringify(obj);
                }
                util.ajax({
                    url: '/form-cust/form/saveTemplate',
                    method: 'post',
                    data: jsonData
                }).then(response => {
                    if (response.data.code === '1') {
                        this.$Message.success(`${this.$t('formSet.fieldTip2')} ${this.formName} ${this.$t('formSet.fieldTip3')}`);
                    }
                });
            },
            changCheck() {
                const flag = this.clueList[this.index].isNeed === 0 ? 1 : 0;
                Vue.set(this.clueList[this.index], 'isNeed', flag);
                // console.log(flag)
                // console.log(this.clueList)
            },
            /* 获得表单字段 */
            getCol() {
                util.ajax({
                    url: '/form-cust/form/getColumnsShow',
                    method: 'post',
                    data: {
                        parentTempateId: this.templateId,
                        templateId: this.formId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const data = response.data.data;
                        this.formName = data.template.cname;
                        this.enquiryId = data.template.id;
                        for (const item in data.show) {
                            const obj = data.show[item];
                            // console.log(item)
                            //                            obj.sourceType=this.getColType(item)
                            obj.name = this.lang_fixed_columns[item] || obj.name;
                            obj.key = item;
                            obj.value = item.type === 'selectMultiple' ? [] : '';
                            // console.log(obj)
                            this.clueListTemp.push(obj);
                            this.clueList.push(obj);
                        }
                        // console.log(this.clueListTemp)
                        this.getConfig();
                    }
                });
            },
            getConfig() {
                util.ajax({
                    url: '/form-cust/form/getTemplateConfig',
                    method: 'get',
                    params: {
                        id: this.formId
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        const data = response.data.data;
                        const config = JSON.parse(data);
                        if (config.column) {
                            this.model1 = config.column;
                            this.optionSel(this.model1);
                        }
                        this.value1 = config.form_w;
                        this.color1 = config.font_c;
                        this.color12 = config.border_c;
                        this.value11 = config.font || this.value11;
                        this.value2 = config.INPUT.width;
                        this.value21 = config.INPUT.height;
                        this.value22 = config.INPUT.radius;
                        this.value3 = config.SELECT.width;
                        this.value31 = config.SELECT.height;
                        this.value32 = config.SELECT.radius;
                        this.value4 = config.TEXTAREA.width;
                        this.value41 = config.TEXTAREA.height;
                        this.value42 = config.TEXTAREA.radius;
                        this.value5 = config.BUTTON.width;
                        this.value51 = config.BUTTON.height;
                        this.value52 = config.BUTTON.radius;
                        this.value53 = config.BUTTON.btn_txt;
                        this.color5 = config.BUTTON.font_c;
                        this.color51 = config.BUTTON.border_c;
                        if (config.SUCCESSTIP) {
                            const { type, msg, confirm } = config.SUCCESSTIP;

                            this.value7 = type === 'confirm' ? 'confirm' : 'msg';

                            if (msg) {
                                const { bg_c, border_c, font_c, txt } = msg;
                                this.color71 = bg_c || this.color71;
                                this.color72 = border_c || this.color72;
                                this.color73 = font_c || this.color73;
                                this.value71 = txt || this.value71;
                            }

                            if (confirm) {
                                const { box, btn } = confirm;

                                if (box) {
                                    const { bg_c, border_c, font_c, txt_align, txt } = box;
                                    this.color74 = bg_c || this.color74;
                                    this.color75 = border_c || this.color75;
                                    this.color76 = font_c || this.color76;
                                    this.value72 = txt_align || this.value72;
                                    this.value73 = txt || this.value73;
                                }

                                if (btn) {
                                    const { width, height, radius, font_c, border_c, bg_c, txt } = btn;
                                    this.value74 = width || this.value74;
                                    this.value75 = height || this.value75;
                                    this.value76 = radius || this.value76;
                                    this.color77 = font_c || this.color77;
                                    this.color78 = border_c || this.color78;
                                    this.color79 = bg_c || this.color79;
                                    this.value77 = txt || this.value77;
                                }
                            }
                        }
                        this.value6 = (config.COUNTRYAREA && config.COUNTRYAREA.type === 'select') ? 'select' : 'input';
                        //                        this.value54=config.BUTTON.height
                    }
                });
            },
            /* 比较列表字段，隐藏已经在线索的CRM字段 */
            compareArr(arr) {
                for (let i = 0; i < this.clueList.length; i++) {
                    // console.log(this.clueList[i])
                    for (let j = 0; j < arr.length; j++) {
                        if (this.clueList[i].key == arr[j].key) {
                            arr.splice(j, 1);
                            continue;
                        }
                    }
                }
                return arr;
            },
            // 点击按钮显示提示语
            showSuccessTip() {
                if (this.value7 === 'msg') {
                    // 文本提示

                    this.successMsgShow = true;
                    setTimeout(() => {
                        this.successMsgShow = false;
                    }, 1500);
                } else {
                    // 弹出框提示

                    this.successConfirmShow = true;
                }
            }
        },
        mounted() {
            document.body.ondrop = function(event) {
                event.preventDefault();
                event.stopPropagation();
            };
            const vm = this;
            const todoList = this.$refs.todoList;
            Sortable.create(todoList, {
                group: {
                    name: 'div',
                    pull: true
                },
                animation: 120,
                ghostClass: 'placeholder-style',
                fallbackClass: 'iview-admin-cloned-item',
                onChoose(event) {
                    // console.log("todoList onChoose")
                    // console.log(event)
                    vm.index = event.oldIndex;
                },
                onAdd(event) {
                    // console.log("todoList onAdd")
                    // console.log(event)
                },
                onUpdate(event) {
                    // console.log("todoList onUpdate")
                    // console.log(event)
                    const item = vm.clueList.splice(event.oldIndex, 1);
                    vm.clueList.splice(event.newIndex, 0, item[0]);
                    // console.log(vm.clueList)
                },
                onRemove(event) {
                    // console.log("todoList onRemove")
                    // console.log(event)
                    vm.doArray.splice(event.newIndex, 0, vm.todoArray[event.item.getAttribute('data-index')]);
                }
            });
        },
        created() {
            this.enterpriseId = this.$store.state.enterpriseId;
            this.userId = this.$store.state.userId;
            this.userName = this.$store.state.userName;
            this.getCol();
            //            this.getList()
        }
    };
</script>

<style scoped lang="less">
    .field-frame /deep/ .el-select {
        &  .el-input {
            border: none;
            background-color: unset;
            box-shadow: none;

            & input {
                height: auto;
            }
        }
    }

    .field-select /deep/ .el-input__inner {
        border: none;
    }

    .formStyle {
        &-successTipType {
            margin: 0 0 20px 20px;

            /deep/ .el-button {
                &:hover, &.formStyle-successTipType__active {
                    color: #4285F4;
                    border-color: #4285F4;
                    background-color: #FFF;
                }
            }
        }

        &-alignButtonGroup {
            /deep/ .el-button {
                padding: 0;
                margin: 0 3px;

                &.formStyle-alignButton__active {
                    color: #4285F2;

                    svg {
                        fill: #4285F2;
                    }
                }
            }
        }

        &-msgTip {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 200px;
            transform: translate(-50%, -50%);
            z-index: 99999;
            padding: 5px 5px;
            border: 1px solid transparent;
            border-radius: 4px;
            text-align: center;
        }

        &-confirmTip {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background: rgba(0, 0, 0, 0.4);
            z-index: 99999;

            display: flex;
            align-items: center;
            justify-content: center;

            &-box {
                border: 1px solid transparent;
                border-radius: 4px;
                padding: 20px;
            }

            &-text {
                width: 290px;
                margin: 20px 0;
            }

            &-btn {
                display: inline-block;
                text-align: center;
                float: right;
                cursor: pointer;
            }
        }
    }
</style>

<style lang="less">
    @import '../../../styles/common.less';
    @import '../../main-components/draggable-list.less';

    .form-bottom {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .block-item {
        padding: 0 20px;
    }

    .form-style-block {
        overflow-x: hidden;
        overflow-y: auto;
    }

    .from_active {
        width: 50%;
        float: left;
    }

    .block-div {
        padding-bottom: 10px;
    }

    .ipt-style {
        input {
            text-align: right;
            padding-right: 30px;
        }
    }

    .ipt-tips {
        position: absolute;
        right: 10px;
        top: 5px;
    }

    .item-left {
        /*text-align: right;*/
        /*width: 90px;*/
        /*position: fixed;*/
        line-height: 32px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.8);
    }

    .item-right {
        margin-left: 100px;
        position: relative;
    }

    .icon-style {
        float: right;
        margin-top: 15px;
    }

    .style-item {
        position: relative;
        /*width: 49%;*/
        /*display: inline-block;*/
        margin-bottom: 10px;
    }

    .style-block {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.8);
        cursor: pointer;
        background-color: #F5F6F9;
        height: 40px;
        line-height: 40px;
        padding: 0 20px;
        margin-bottom: 20px;
        border: 1px solid #CBD6E2;
        border-radius: 4px;
    }

    .field-block {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
    }

    .field-name {
        width: 100px;
        line-height: 30px;
        display: inline-block;
        word-wrap: break-word;
        word-break: break-all;
        vertical-align: top;
    }

    .field-frame {
        display: inline-block;

    }

    #doList1, #doList2, #doList3 {
        & .checkbox-type {
            display: none;
        }
    }
</style>
