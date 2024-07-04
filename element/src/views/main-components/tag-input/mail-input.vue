<template>
    <div :class="`mail_input_container mail_input_container_${type}`" :style="`${ tagList.length && 'padding-top: 8px;'}`" @mouseup="tagMouseup">
        
        <span
            :class="`tag_list${tag.selectedFlag ? ' tag_list_selected' : ''}`"
            :style="`background:${tagAttr[index].isEmail?'':'#ed4014'}`"
            v-for="(tag, index) in tagList"
            :key="tag.emailAddress"
            @click.stop="selectedTag(index)"
            @mouseover="tagMouseover(index)"
            @mouseleave="tagMouseleave">
            <RecipientPoptip
                fromFlag="tagInput"
                :selectedFlag="tag.selectedFlag"
                :currentPage="fromFlag"
                v-if="fromFlag === 'writeMail' || fromFlag === 'writeMailFloatWindow'"
                :currentInquiryId="tag.tagStatus ? tag.tagStatus.inquiryId: ''"
                v-bind="$attrs"
                v-on="$listeners"
                :params="{row: tag.tagStatus}"
            >
            </RecipientPoptip>
            <input :id="type+'input'+index" @click.stop v-model="tagList[index].tagName" v-show="tagAttr[index].editting" @keyup.enter="editCompleted(index)" @blur.stop="editCompleted(index)"  class="input-inside" type="text">
            <span :title="tag.tagName" v-show="!tagAttr[index].editting" :class="`tag_content tag_content_${type}`" :style="`color:${tag.selectedFlag ? '#fff' : '#333'}`" @dblclick.stop="toggleEdit(index,true)">{{tag.tagName}}</span>
            <Icon class="mail-deleteemailaddres" type="ios-close" @click="delTag(index)" :style="`${tag.selectedFlag && 'color:#fff;'}`"></Icon>
        </span>
        <div class="compose_mailAddress_inputWrapper new">
            <input 
                autocomplete="off"
                v-model.trim="inputValue"
                type="text"
                :id="type+'txt1'"
                @mousedown="tagMousedown"
                @keydown.stop="(event) => keyDown(event)"
                :placeholder="placeholder"
                :readonly="readonly"
                class="compose_mailAddress_input"
                :style="`${tagList.length && 'position: relative;top: -4px;'}`"
                @focus="inputFocused"
                @blur="addTag"
                @input="getRelevantAddress"
                @paste="handlePaste" />
        </div>
        <ul class="select-dropdown" :style="`top:${slectTop}px`" v-show="relevantAddress.length && inputValue">
            <li
                    v-for="(item, index) in relevantAddress"
                    :key="index"
                    :class="index === activeIndex ? `relevant-address-item active-item piwik_relevantAdd_${fromFlag}` : `relevant-address-item piwik_relevantAdd_${fromFlag}`"
                    @click="handleSelectAddress(item, index)"
                    @mousedown="handleMouseDown">
                    <span :title="item" class="ellipsis relevant-address-content">
                        <span v-html="handleHighLight(item)"></span>
                    </span>
            </li>
        </ul>
    </div>
</template>
<script>
    import Vue from 'vue';
    import { mapState } from 'vuex';
    import util from '@/libs/util';
    const reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/i;
    export default {
          name: 'mail_input',
        props: {
            taglist: {
                type: Array,
                default() {
                    return [];
                }
            },
            type: {
                type: String,
                default: ''
            },
            title: {
                type: String,
                default: '收件人'
            },
            placeholder: {
                type: String,
                default: ''
            },
            readonly: {
                type: Boolean,
                default: false
            },
            fromFlag: {
                type: String,
                default: ''
            },
            row: {
                type: Array,
                default() {
                    return [];
                }
            },
            isSeparate: {
                type: Number,
                default: 0
            }
        },
        computed: {
            ...mapState({
                orgId: state => state.enterpriseId,
                userId: state => state.userId
            }),
            $lang() {
                return Vue.config.lang;
            }
        },
        data() {
            return {
                inputValue: '',
                tagAttr: [],
                tagList: [], // 经过处理后的数组
                activeIndex: -1, // 选中项的索引
                cancelFunc: null, // 取消上一次请求
                relevantAddress: [], // 与用户当前输入的关键词相关的地址
                inputIsPaste: false, // 输入框内容是否是粘贴而来的
                isSelectAddress: false, // 是否从联想处点击的
                dragOver: false, // 移动范围
                tagDownAndMoveFlag: false, // 按下并移动的状态
                isCtrlCode: false, // 键盘是否按下了 ctrl 按键
                lastClickType: '', // 最后点击的 type
                timerProvinceClick: 0, // 连续点击的记录，区分单击和双击，双击不会触发单击的方法
                selectTop: '' // 邮箱地址下拉选择框位置
            };
        },
        created() {
            this.getTagArr();
            this.$nextTick(() => {
                document.addEventListener('keydown', this.containerKeydown);
                document.addEventListener('keyup', this.containerKeyup);
                // 监听全局的鼠标抬起事件
                document.addEventListener('mouseup', this.containerMouseup);
                
            });
        },
        beforeDestroy() {
            document.removeEventListener('keydown', this.containerKeydown);
            document.removeEventListener('keyup', this.containerKeyup);
            // 取消监听全局的鼠标抬起事件
            document.removeEventListener('mouseup', this.containerMouseup);
        },
        methods: {
            // 鼠标按下事件 添加监听鼠标移动事件
            tagMousedown(event) {
                document.addEventListener('mousemove', this.movementRange);

            },
            // 鼠标抬起事件 取消鼠标移动事件的监听
            tagMouseup(event) {
                document.removeEventListener('mousemove', this.movementRange);
                this.dragOver = false;
            },
            // 鼠标移动的范围
            movementRange(event) {
                // 记录鼠标按下并移动  用于区分是选择还是点击
                this.tagDownAndMoveFlag = true;
                this.dragOver = event.target.className === 'tag_list' ||
                            event.target.className === 'tag_list tag_list_selected' ||
                            event.target.className === 'tag_content' ||
                            event.target.className === 'avatar-poptip' ||
                            event.target.className === 'mail-deleteemailaddres ivu-icon ivu-icon-ios-close' ||
                            event.target.className === 'avatar-icon';
            },
            tagMouseover(index) {
                if (this.dragOver) {
                    for (let i = 0; i < this.tagList.length; i++) {
                        if (i >= index) {
                            this.$set(this.tagList[i], 'selectedFlag', true);
                            document.getElementById(`${this.type}txt1`).blur();
                        } else {
                            this.$set(this.tagList[i], 'selectedFlag', false);
                        }
                    }
                }
            },
            // 移除所有的taglist 数据
            tagMouseleave() {
                this.dragOver = false;
            },
            selectedTag(index) {
                this.timerProvinceClick++;
                setTimeout(() => {
                    if (this.timerProvinceClick > 1) {
                        return;
                    }
                    this.timerProvinceClick = 0;
                    if (this.isCtrlCode) {
                        this.$set(this.tagList[index], 'selectedFlag', true);
                    } else {
                        for (let i = 0; i < this.tagList.length; i++) {
                            if (index === i) {
                                this.$set(this.tagList[i], 'selectedFlag', true);
                            } else {
                                this.$set(this.tagList[i], 'selectedFlag', false);
                            }
                        }
                    }
                }, 300);
            },
            containerKeydown(event) {
                event.stopPropagation();
                // 键盘按下删除按键
                if (event.keyCode === 8) {
                    let delTags = [];
                    this.tagList.forEach(item => {
                        if (item.selectedFlag) {
                            delTags.push(item.tagName)
                        }
                    })
                    if (delTags.length > 0 && this.lastClickType === this.type) {
                        this.batchDelTag(delTags);
                        this.$nextTick(() => {
                            document.getElementById(`${this.type}txt1`).focus();
                        });
                    }
                }

                // 获取当前电脑系统  mac处理command键；window处理ctrl键
                const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
                // 键盘按下 mac处理command键；window处理ctrl键
                if ((!isMac && event.keyCode === 17) || (isMac && event.keyCode === 91 || event.keyCode === 93)) {
                    this.isCtrlCode = true;
                }
            },
            // 监听键盘抬起事件
            containerKeyup(event) {
                // 获取当前电脑系统  mac处理command键；window处理ctrl键
                const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
                // 键盘抬起 mac处理command键；window处理ctrl键
                if ((!isMac && event.keyCode === 17) || (isMac && event.keyCode === 91 || event.keyCode === 93)) {
                    this.isCtrlCode = false;
                }
            },
            // 全局的鼠标抬起事件
            containerMouseup(event) {
                if ((typeof (event.target.className) === 'string') && event.target.className.indexOf('tag_content') != -1) {
                    this.lastClickType = event.target.className.split(' ')[1].split('_')[2];
                }
                // 取消全局鼠标移动事件的监听
                document.removeEventListener('mousemove', this.movementRange);
                if (this.tagList.length && !this.tagDownAndMoveFlag && !this.isCtrlCode) {
                    for (let i = 0; i < this.tagList.length; i++) {
                        let item = this.tagList[i];
                        item.selectedFlag = false
                    }
                }
                this.dragOver = false;
                this.tagDownAndMoveFlag = false;
            },
            setFocus(e) {
                if (e.target.getAttribute('id') && !e.target.getAttribute('id').includes('input')) {
                    document.getElementById(`${this.type}txt1`).focus();
                }
            },
            inputFocused() {
                this.getContainerHeight();

                for (let i = 0; i < this.tagList.length; i++) {
                    this.$set(this.tagList[i], 'selectedFlag', false);
                }
                this.$emit('inputFocused');
                this.$emit('changeFocuseToPerson');
            },
            keyDown(event) {
                const keys = [13, 32, 186, 188];
                if (keys.includes(event.keyCode)) {
                    event.preventDefault();
                    this.addTag();
                }
                if (event.keyCode === 8 && !this.inputValue) {
                    let delTags = [];
                    this.tagList.forEach(item => {
                        if (item.selectedFlag) {
                            delTags.push(item)
                        }
                    })
                    if (delTags.length === 0) {
                        this.lastClickType = this.type;
                        this.$set(this.tagList[this.tagList.length - 1], 'selectedFlag', true);
                        document.getElementById(`${this.type}txt1`).blur();
                    } else {
                        this.batchDelTag(delTags);
                        this.$nextTick(() => {
                            document.getElementById(`${this.type}txt1`).focus();
                        });
                    }
                }
            },
            getContainerHeight() {
                this.slectTop = document.querySelector(`.mail_input_container_${this.type}`).clientHeight;
            },
            addTag() {
                if (this.inputValue === '') {
                    return;
                }
                /**
                 * @Description: 邮箱收件人去重逻辑修改为只要邮箱地址部分重复，即判为同一个邮箱，默认保留第一个
                 *                 如客户a<xhl@163.com>， 客户b<xhl@163.com>，xhl@163.com为重复邮箱，保留邮箱--客户a<xhl@163.com>
                 * @author 杨娣
                 * @date 2019/10/15
                 */
                if (this.fromFlag === 'writeMail' || this.fromFlag === 'writeMailFloatWindow') {
                    const val = this.getStandardEmail(this.inputValue);
                    for (let item of this.taglist) {
                        item = this.getStandardEmail(item);
                        if (item.toLowerCase() === val.toLowerCase()) {
                            this.inputValue = '';
                            return;
                        }
                    }
                } else if (this.taglist.includes(this.inputValue)) {
                    this.inputValue = '';
                    return;
                }
                let list = [...this.taglist];
                /**
                 * @Description: 当输入框内容为粘贴时，才需要对inputValue进行分割，否则直接添加进tagList
                 * @author 杨娣
                 * @date 2020/9/23
                */
                if (this.inputIsPaste && !this.isSelectAddress) {
                    /**
                     * @Description: 写信页面支持一键批量复制邮箱
                     * @author wanghongzhu
                     * @date 2020/4/21
                     */
                    // 将;；、，,统一替换为英文逗号
                    const inputStr1 = this.inputValue.replace(/，/g, ',').replace(/；/g, ',').replace(/、/g, ',').replace(/;/g, ',');
                    // 将多个空格替换为一个英文逗号, 并分割为数组并去除值为空的元素
                    const inputArr = inputStr1.replace(/\s+/ig, ',').split(',').filter(function(e) { return e; });
                    // 追加数组并去重
                    list = [...new Set(list.concat(inputArr))];
                    // 将数组去重并转为字符串
                    let inputStr2 = String(list);
                    // 超出字符限制提示语
                    if (inputStr2.length >= 3800) {
                        inputStr2 = inputStr2.slice(0, 3799);
                        this.$Message({
                            message: `当前${this.title}输入的信息超出字符限制，超出上限的部分则不保存`,
                            type: 'warning',
                            duration: 3000
                        });
                    }
                } else {
                    list.push(this.inputValue);
                }
                // if (this.isSeparate === 1) {
                //     list = list.slice(0, 31);
                // }
                this.$emit('update:taglist', list);
                // this.$emit('addTag', this.inputValue);
                // this.$emit('addTag');
                this.inputValue = '';
                this.inputIsPaste = false;
                this.isSelectAddress = false;
            },
            delTag(index) {
                const list = [...this.taglist];
                const email = list[index];
                list.splice(index, 1);
                this.$emit('update:taglist', list);
                // this.$emit('addTag');
                this.$emit('handleUpdateRecipients', email);
            },
            // 批量删除
            batchDelTag(delEmails) {
                const list = [...this.taglist];
                for (let i = 0; i < list.length; i++) {
                    let item = list[i];
                    if (delEmails.includes(item)) {
                        list.splice(i, 1);
                        i--;
                    }
                }
                this.$emit('update:taglist', list);
                this.$emit('handleUpdateRecipients', delEmails);
                
            },
            toggleEdit(index, state) {
                this.tagAttr[index].editting = state;
                // this.$nextTick(function () {

                // })
                setTimeout(() => {
                    if (state) {
                        const currentInput = document.getElementById(`${this.type}input${index}`);
                        currentInput.focus();
                    }
                }, 0);
                setTimeout(() => {
                    this.timerProvinceClick = 0;
                }, 500);
            },
            /** 编辑完成 */
            editCompleted(index) {
                let startIndex = -1;
                let endIndex = -1;
                const newArr = [];
                const res = [];
                this.tagAttr[index].editting = false;
                const taglist = this.tagList.map(item => {
                    return item.tagName;
                });
                const list = Array.from(new Set(taglist));
                for (let i = 0; i < list.length; i++) {
                    startIndex = list[i].indexOf('<');
                    endIndex = list[i].indexOf('>');
                    if (startIndex !== -1 && endIndex !== -1) {
                        newArr.push(list[i].substring(startIndex + 1, endIndex));
                    } else {
                        newArr.push(list[i]);
                    }
                }
                for (let i = 0; i < newArr.length; i++) {
                    if (res.findIndex(item => item === newArr[i]) === -1) {
                        res.push(newArr[i]);
                    } else {
                        list.splice(i, 1);
                    }
                }
                this.$emit('update:taglist', list);
                // this.$emit('addTag');
                /* if(list.length!==this.taglist.length){
        this.$emit('update:taglist',list)
      } */
                this.getTagArr();
            },
            getTagArr() {
                const flag = this.tagAttr.filter(item => {
                    return item.editting;
                });
                if (flag.length > 0) {
                    return;
                }
                this.tagAttr = this.taglist.map(tag => {
                    let isEmail = false;
                    isEmail = reg.test(tag);
                    // isEmail = Boolean(this.getStandardEmail(tag));
                    return {
                        isEmail,
                        editting: false
                    };
                });
            },
            /* 获取标准格式的邮箱 */
            getStandardEmail(emailAdd) {
                if (emailAdd && emailAdd.lastIndexOf('<') !== -1) {
                    const startIndex = emailAdd.lastIndexOf('<');
                    return emailAdd.slice(startIndex + 1, emailAdd.length - 1);
                } else {
                    return emailAdd;
                }
            },
            /* 获取邮箱对应的状态信息 */
            getMailStatus() {
                const res = this.taglist.map(item => {
                    const email = this.getStandardEmail(item);
                    const obj = {};
                    obj.tagName = item;
                    obj.emailAddress = email;
                    obj.tagStatus = this.row.find(rowData => rowData.email === email);
                    obj.selectedFlag = false;
                    return obj;
                });
                this.tagList = res;
            },
            /* 获取地址联想的搜索结果 */
            getRelevantAddress() {
                /* 取消上一次请求，避免频繁请求接口时因接口响应速度快慢导致数据错乱 */
                if (typeof this.cancelFunc === 'function') {
                    this.cancelFunc();
                }
                const vm = this;
                if (this.inputValue) {
                    util.ajaxJson({
                        url: '/mail/queryEmailAddress',
                        method: 'POST',
                        data: {
                            createUserId: this.userId,
                            emailAddress: this.inputValue,
                            orgId: this.orgId
                        },
                        cancelToken: new util.axios.CancelToken(function executor(c) {
                            // An executor function receives a cancel function as a parameter
                            vm.cancelFunc = c;
                        })
                    }).then(res => {
                        if (res.data.code === 1) {
                            this.relevantAddress = res.data.data.map(item => {
                                if (!item.nickName) {
                                    const temp = item.emailAddress.substring(0, item.emailAddress.lastIndexOf('@'));
                                    item.nickName = temp;
                                }
                                return `${item.nickName}<${item.emailAddress}>`;
                            });
                        } else {
                            this.relevantAddress = [];
                        }
                    }).catch(err => {
                        console.log('邮件联想地址获取失败', err);
                        this.relevantAddress = [];
                    });
                }
            },
            handleHighLight(mailAddress) {
                return this.$dym.highLightKeyWordsInArray(mailAddress, this.inputValue);
            },
            handleSelectAddress(item, index) {
                this.activeIndex = index;
                this.inputValue = item;
                this.isSelectAddress = true;
                document.getElementById(`${this.type}txt1`).blur();
                this.$nextTick(() => {
                    document.getElementById(`${this.type}txt1`).focus();
                });
                // this.addTag();
            },
            handleMouseDown(e) {
                e.preventDefault();
            },
            handlePaste(e) {
                this.inputIsPaste = true;
            }
        },
        watch: {
            taglist: {
                handler(val) {
                    this.getTagArr();
                    this.getMailStatus();
                }
            },
            row: {
                handler() {
                    if (this.row.length) {
                        this.getMailStatus();
                    }
                }
            }
        }
    }
</script>
<style lang="less" scoped>
    .mail_input_container{
        width: 100%;
        cursor: text;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        flex-direction: row;

        /deep/ input{
            border: 0;
        }

        .tag_list{
            display: inline-block;
            height: 24px;
            line-height: 22px;
            padding: 0 8px;
            border: 1px solid #f4f5f8;
            border-radius: 11px;
            background: #f7f7f7;
            font-size: 12px;
            vertical-align: middle;
            white-space: normal;
            opacity: 1;
            overflow: hidden;
            margin-right: 8px;
            margin-bottom: 8px;
            display: flex;

            .tag_content{
                display: inline-block;
                max-width: 290px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin: 0 5px;
            }

            .input-inside{
                height: 24px;
            }

            /deep/ .ivu-icon-ios-close{
                font-size: 20px;
                top: 1px;
                line-height: 22px;
                color: #666;
                opacity: 0.66;
            }

            &:hover{
                opacity: 0.85;
                background-color: #e6efff
            }

            &.tag_list_selected{
                background-color: #4285f2;
            }
        }
        
        .select-dropdown {
            max-width: 350px;
            max-height: 190px;
            overflow: auto;
            margin: 5px 0;
            padding: 5px 0;
            background-color: #fff;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
            border-radius: 4px;
            -webkit-box-shadow: 0 1px 6px rgba(0,0,0,.2);
            box-shadow: 0 1px 6px rgba(0,0,0,.2);
            position: absolute;
            top: 37px;
            z-index: 900;
            .relevant-address-item {
                font-size: 12px;
                height: 30px;
                line-height: 30px;
                padding: 0 12px;
                box-sizing: border-box;
                &:hover {
                    background-color: #F3F4F7;
                    cursor: pointer;
                }
                .relevant-address-content {
                    display: inline-block;
                    width: 100%;
                    height: 100%;
                }
            }
            .active-item {
                background-color: #F3F4F7;
            }
        }
    }

    .compose_mailAddress_inputWrapper{
        flex: 1;

        /deep/ .compose_mailAddress_input{
            font-size: 14px;
            height: 22px;
            line-height: 22px;
            outline: none;
            padding: 2px 2px 0;
            width: 100%;
        }
    }


</style>
