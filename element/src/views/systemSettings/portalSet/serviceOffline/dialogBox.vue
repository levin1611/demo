<template>
    <div class="container serviceOffline">
        <div style="margin-top:18px;">
            <div class="item">
                <span class="item-tip">{{$t('portal_set.color_set')}}</span>
                <!-- 颜色选择 -->
                <div class="item-color-pick">
                    <span v-for="(color,index) in colors" :key="index" @click="colorSet=color"
                          class="color-circle-out middle " :class="colorSet==color?'boxshadow': '' ">
                        <!-- <span class="color-circle-in" :class=" 'color'+(index+1) "></span> -->
                        <span class="color-circle-in" :style="'backgroundColor:'+color"></span>
                    </span>
                    <ColorPicker class="color-pick-plug-in" v-model="colorSet" :colors="colors"/>
                </div>
            </div>
            <div class="item">
                <span class="item-tip">{{$t('portal_set.window_size')}} </span>
                <RadioGroup v-model="windowSize">
                    <Radio size="large" label="1">
                        <span>{{$t('portal_set.big')}}</span>
                    </Radio>
                    <Radio size="large" label="2">
                        <span>{{$t('portal_set.middle')}}</span>
                    </Radio>
                    <Radio size="large" label="3">
                        <span>{{$t('portal_set.small')}}</span>
                    </Radio>
                </RadioGroup>
            </div>
            <div class="item">
                <span class="item-tip">{{$t('portal_set.btn_color')}} </span>
                <!-- 颜色选择 -->
                <div class="item-color-pick">
                  <span v-for="(color,index) in colors" :key="index" @click="buttonColor=color"
                        class="color-circle-out middle " :class="buttonColor==color?'boxshadow': '' ">
                    <!-- <span class="color-circle-in" :class=" 'color'+(index+1) "></span> -->
                    <span class="color-circle-in" :style="'backgroundColor:'+color"></span>
                  </span>
                  <ColorPicker class="color-pick-plug-in" v-model="buttonColor" :colors="colors"/>
                </div>
            </div>
            <div class="item">
                <div>{{$t('portal_set.window_tip')}} </div>
                <Input v-model="topText" :disabled="topTextEdit? false:true " maxlength="40" style="max-width:420px;">
                    <Button slot="append" @click="topTextEdit = true" icon="custom custom-edit"></Button>
                </Input>
            </div>
            <div class="item">
                <div>{{$t('portal_set.text')}} </div>
                <Input v-model="promptWords" :disabled="promptWordsEdit? false:true " style="max-width:420px;">
                    <Button slot="append" @click="promptWordsEdit = true" icon="custom custom-edit"></Button>
                </Input>
            </div>
            <div class="item">
                <div>{{$t('portal_set.select_form')}}</div>
                <Select @change="changeForm" v-model="form" clearable style="max-width:420px;">
                    <Option v-for="(item,index) in forms" v-if="!item.cateType" :value="item.id" :key="index" :label="item.cname">
                        {{ item.cname }}
                    </Option>
                </Select>
            </div>
            <div class="item">
                <div>{{$t('portal_set.btn_words')}} </div>
                <Input v-model="buttonText" :disabled=" btnTextEdit ? false:true " maxlength="30"
                       style="max-width:420px;">
                    <Button slot="append" @click=" btnTextEdit  = true" icon="custom custom-edit"></Button>
                </Input>
            </div>
            <div class="item" style="margin-bottom: 20px">
                <div>{{$t('portal_set.conclusionText')}} </div>
                <Input v-model="conclusionText" :disabled=" conclusionEdit ? false:true " style="max-width:420px;">
                    <Button slot="append" @click=" conclusionEdit  = true" icon="custom custom-edit"></Button>
                </Input>
            </div>
            <Button type="primary" @click="updateData()">{{$t('save')}}</Button>
        </div>
        <div class="chat-window"  style="right:390px;">
            <div class="box-header" :style="'text-align:left;backgroundColor:'+colorSet">
                <Tooltip :content="topText" placement="top">
                    <span class="tooLangTip">{{topText}}</span>
                </Tooltip>
                <span class="arrow">
                    <Icon type="chevron-down"></Icon>
                </span>
            </div>
            <div class="chat-content">
                <div class="prompt-msg">
                    {{promptWords}}
                </div>
                <div v-for="(column,index) in formFields" :key="index" style="margin-top:20px;">
                    <div class="clue-item " style="display:inline-block">
                        <Select v-if="column.type=='SELECT'" style="width:275px;text-align: left"
                                :placeholder="column.name">
                            <Option v-for="(item,i) in column.option" :value="item" :key="i">{{ item }}</Option>
                        </Select>
                        <Input v-else-if="column.type=='TEXTAREA'" :placeholder="column.name" type="textarea"
                               style="width:275px;"></Input>
                        <Input v-else :placeholder="column.name" style="width:275px;display:inline-block;"></Input>
                    </div>
                    <span v-if="column.isNeed==1" style="color:red;">*</span>
                </div>
            </div>
            <Button v-if="form" :style="'backgroundColor:'+buttonColor+';border-color:'+buttonColor" type="primary">
                <Tooltip :content="topText" placement="top">
                    <span class="tooLangTip">{{buttonText}}</span>
                </Tooltip>
            </Button>
        </div>
        <div class="chat-window" style="right:20px;">
            <div class="box-header" :style="'text-align:left;backgroundColor:'+colorSet">
                <Tooltip :content="topText" placement="top">
                    <span class="tooLangTip">{{topText}}</span>
                </Tooltip>
                <span class="arrow">
                    <Icon type="chevron-down"></Icon>
                </span>
            </div>
            <div class="chat-content">
                <div class="prompt-msg">{{conclusionText}}</div>
            </div>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        created() {
            this.parentTempateId = window.localStorage.getItem('VIEWFORM');
            this.getXSShow();
            this.getTemplateList();
            this.refreshData();
        },
        props: [
            'currView',
            'toView',
            'offlineData',
            'service',
            'defaultStatus',
            'chatPosition',
            'currDomain'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId'
            })
        },
        data() {
            return {
                colorSet: '#45619D', /* 选中的颜色 */
                colors: ['#45619D', '#4285F4', '#15C5D4', '#00CC99', '#7B66EE', '#FA8241', '#FBBC04'], /* 显示的颜色列表 */
                buttonColor: '#45619D',
                windowSize: '2', /* 聊天窗大小 */
                topText: 'Leave info for details', /* 聊天窗顶部文字 */
                topTextEdit: false, /* 聊天窗顶部文字是否可编辑 */
                promptWords: 'Please leave your message here! We will send detailed technical info and quotation to you!',
                promptWordsEdit: false, /* 文字 */
                buttonText: 'Contact Us',
                btnTextEdit: false,
                conclusionText: 'Thanks, we will get back to you as soon as we can',
                conclusionEdit: false,
                forms: [/* 选择表单列表 */],
                form: '', /* 选中的表单 */
                formFields: [],
                parentTempateId: ''

            };
        },
        methods: {
            /* 获取表单列表 */
            getTemplateList() {
                util.ajax({
                    url: `/form-cust/template/getFormTemplateSortedList?billType=1&status=-1&orgId=${this.enterpriseId}`,
                    method: 'get'
                }).then(res => {
                    if (res.data.code === '1') {
                        this.forms = res.data.data.filter((item) => {
                            return item.cateType !== 1;
                        });
                    }
                });
            },
            getFormFields() {
                const parentTempateId = window.localStorage.getItem('VIEWFORM');
                if (this.form === '') {
                    this.formFields = [];
                    return;
                }
                util.ajax({
                    url: `form-cust/form/getColumnsShow?parentTempateId=${parentTempateId}&templateId=${this.form}`,
                    method: 'get'
                }).then(res => {
                    if (res.data.code === '1') {
                        const data = res.data.data.show;
                        this.formFields = [];
                        for (const key in data) {
                            this.formFields.push({
                                key,
                                isNeed: data[key].isNeed,
                                name: data[key].name,
                                option: this.filterOption(data[key].option),
                                type: data[key].type.toUpperCase()
                            });
                        }
                    }
                });
            },
            refreshData() {
                if (this.offlineData.topText) {
                    this.colorSet = this.offlineData.windowColor ? this.offlineData.windowColor.toUpperCase() : this.colorSet;
                    this.windowSize = this.offlineData.windowSize ? `${this.offlineData.windowSize}` : this.windowSize;
                    this.buttonColor = this.offlineData.buttonColor ? this.offlineData.buttonColor.toUpperCase() : this.buttonColor;
                    this.topText = this.offlineData.topText ? this.offlineData.topText : this.topText;
                    this.promptWords = this.offlineData.displayText ? this.offlineData.displayText : this.promptWords;
                    this.form = this.offlineData.offlineLink ? this.offlineData.offlineLink.split(';')[0] : '';
                    this.buttonText = this.offlineData.buttonText ? this.offlineData.buttonText : this.buttonText;
                    this.conclusionText = this.offlineData.conclusions ? this.offlineData.conclusions : this.conclusionText;
                    this.changeForm(this.form);
                }
            },
            changeForm(id) {
                window.localStorage.setItem('VIEWFORMID', id);
                this.getFormFields();
            },
            filterOption(str) {
                let arr = [];
                arr = str.split('?');
                return arr;
            },
            updateData() { /* 保存 */
                let offLink = '';
                if (window.localStorage.getItem('VIEWFORMID')) {
                    offLink = `${window.localStorage.getItem('VIEWFORMID')};${window.localStorage.getItem('VIEWFORM')}`;
                }
                const postData = {
                    orgId: this.enterpriseId,
                    enable: this.service ? 1 : 2,
                    displayStatus: this.defaultStatus,
                    windowPosition: this.chatPosition,
                    windowColor: this.colorSet,
                    windowSize: this.windowSize,
                    buttonColor: this.buttonColor,
                    offlineLink: offLink,
                    displayText: this.promptWords,
                    buttonText: this.buttonText,
                    conclusions: this.conclusionText,
                    topText: this.topText,
                    id: this.offlineData.id,
                    operationType: 1,
                    website: this.currDomain
                };
                if (postData.id) {
                    util.ajaxInternational({
                        url: '/visitor-chat/offline/update',
                        method: 'post',
                        data: postData
                    }).then(res => {
                        if (res.data.code === '1') {
                            this.$emit('update:offlineData', Object.assign({}, this.offlineData, res.data.data));
                            this.$Message.success(this.$t('filter_box.save_success'));
                            this.saveTranslate();
                        } else {
                            this.$Message.error(this.$t('filter_box.save_failed'));
                        }
                    });
                } else {
                    util.ajaxInternational({
                        url: '/visitor-chat/offline/save',
                        method: 'post',
                        data: postData
                    }).then(res => {
                        if (res.data.code === '1') {
                            this.$emit('update:offlineData', res.data.data);
                            // this.offlineData = res.data.data
                            this.$Message.success(this.$t('filter_box.save_success'));
                            this.saveTranslate();
                        } else {
                            this.$Message.error(this.$t('filter_box.save_failed'));
                        }
                    });
                }
            },
            saveTranslate() {
                const postData = {
                    orgId: this.enterpriseId,
                    textList: [this.topText, this.promptWords, this.buttonText, this.conclusionText],
                    dest: 'zh_cn'
                };
                util.ajaxJson({
                    url: '/cuss-login/translate/save',
                    method: 'post',
                    data: JSON.stringify(postData)
                }).then(res => {

                });
            },
            getXSShow() {
                util.ajax({
                    url: '/form-cust/form/getXSShow',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        window.localStorage.setItem('VIEWFORM', res.data.data.template.id);
                    }
                });
            },

            // 检查数据较原始数据是否变更
            checkIsChanged() {
                // 当前编辑信息
                const currObj = {
                    colorSet: this.colorSet,
                    windowSize: this.windowSize,
                    buttonColor: this.buttonColor,
                    topText: this.topText,
                    promptWords: this.promptWords,
                    form: this.form,
                    buttonText: this.buttonText,
                    conclusionText: this.conclusionText
                };
                // 原始信息
                const oldObj = {
                    colorSet: this.offlineData.windowColor ? this.offlineData.windowColor.toUpperCase() : '#45619D',
                    windowSize: `${this.offlineData.windowSize || '2'}`,
                    buttonColor: this.offlineData.buttonColor ? this.offlineData.buttonColor.toUpperCase() : '#45619D',
                    topText: this.offlineData.topText || 'Leave info for details',
                    promptWords: this.offlineData.displayText || 'Please leave your message here! We will send detailed technical info and quotation to you!',
                    form: this.offlineData.offlineLink ? this.offlineData.offlineLink.split(';')[0] : '',
                    buttonText: this.offlineData.buttonText || 'Contact Us',
                    conclusionText: this.offlineData.conclusions || 'Thanks, we will get back to you as soon as we can'
                };

                // 如果当前比外部 Tab 切换还要高一级, 是"客服在线/离线"切换, 则需要把外部设置页纳入比较范围
                if (this.toView === 'ServiceOnline') {
                    currObj.defaultStatus = this.defaultStatus;
                    currObj.chatPosition = this.chatPosition;
                    currObj.service = this.service;

                    oldObj.defaultStatus = `${this.offlineData.displayStatus}`;
                    oldObj.chatPosition = `${this.offlineData.windowPosition}`;
                    oldObj.service = this.offlineData.enable === 1;
                }

                // 返回 Boolean
                return JSON.stringify(currObj) !== JSON.stringify(oldObj);
            },
            // 显示离开前确认框
            showLeaveConfirm(func_confirm, func_cancel) {
                // 打开离开确认框
                this.$confirm(this.$t('portal_set.tip_cancelEditSetting'), this.$t('portal_set.title_cancelEditSetting'), {
                    customClass: 'leaveConfirmMsgBox'
                }).then(func_confirm).catch(func_cancel);
            }
        },

        watch: {
            offlineData: {
                handler() {
                    this.refreshData();
                },
                deep: true
            },
            // 监听外部传入的"要跳转到的其他组件"
            toView: {
                handler(val) {
                    // 定义当前 view name
                    const ownViewName = 'DialogBox';
                    // 如果当前 view 就是自身, 且要跳转到的 view 不是, 说明切换了 tab
                    if (this.currView === ownViewName && val && val !== ownViewName) {
                        // 检查数据是否发生编辑过
                        const isChanged = this.checkIsChanged();

                        if (!isChanged) {
                            // 数据未变化

                            // 直接更新
                            this.$emit('update:currView', val);
                        } else {
                            // 数据有变化

                            // 弹出确认跳转提示框
                            this.showLeaveConfirm(() => {
                                // 确定

                                // 更新视图
                                this.$emit('update:currView', val);
                            }, () => {
                                // 取消

                                // 清空 toView -- 同时, 外部以 toView 为 Radio 按钮组的 Key, key 变化后样式会刷新, 避免点取消后按钮组样式不对问题
                                this.$emit('update:toView', '');
                            });
                        }
                    }
                }
            }
        }
    };
</script>

<style scoped>
    .container {
        position: relative;
    }

    .chat-window { /*聊天框 右边*/
        width: 350px;
        height: 428px;
        border-radius: 8px;
        position: absolute;
        /* border: 1px solid lightblue; */
        box-shadow: 0px 0px 8px #bbb;
        top: 20px;
        right: 60px;
        text-align: center;
    }

    .box-header {
        height: 50px;
        line-height: 50px;
        border-radius: 8px 8px 0 0;
        padding-left: 25px;
        color: #fff;
        font-weight: 700;
    }

    .tooLangTip {
        display: inline-block;
        max-width: 270px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .box-content {
        overflow: auto;
    }

    .box-footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 20px 10px 10px 10px;
    }

    .chat-box {
        margin: 0 10px 10px 10px;
        padding: 10px;
        line-height: 18px;
        font-size: 12px;
        background-color: #ecefef;
        border-radius: 5px;
        position: absolute;
        bottom: 80px;
        width: 288px;
    }

    .arrow {
        display: inline-block;
        line-height: 50px;
        height: 50px;
        width: 60px;
        position: absolute;
        font-size: 16px;
        right: 0;
        cursor: pointer;
    }

    .arrow i {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%)
    }

    .arrow:hover {
        top: 2px;
    }
</style>

<style lang="less">
    .serviceOffline {
        .chat-content {
            overflow: auto;
            height: 330px;
            padding: 10px 12px 0 12px;
        }

        .prompt-msg {
            padding: 20px 16px;
            background-color: #eee;
            border-radius: 5px;
            font-size: 12px;
            line-height: 18px;
            color: #666;
        }

        /* 聊天框 */
        .box-footer .ivu-input-type input {
            height: 46px;
            padding-left: 32px;
            background-color: #f1f4f4;
        }

        .box-footer .ivu-input-type .ivu-icon {
            left: 0;
            margin-top: 7px;
        }

        /* 右边表单字段 */
        .clue-item input {
            border: 2px solid #dddee1;
        }
    }
    
</style>
