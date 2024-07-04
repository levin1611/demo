<template>
  <div class="tag-input" @click="setFocus">
    <div class="form-title-font form-label" style="line-height:24px;">{{title}}</div>
    <div slot="prefix" class="tag-list">
        <Tag :color="tagAttr[index].isEmail?'#f7f7f7':'#ed4014'" v-for="(tag,index) in tagList" :key="tag.emailAddress">
            <RecipientPoptip
                fromFlag="tagInput"
                :currentPage="fromFlag"
                v-if="fromFlag === 'writeMail' || fromFlag === 'writeMailFloatWindow'"
                :currentInquiryId="tag.tagStatus ? tag.tagStatus.inquiryId: ''"
                v-bind="$attrs"
                v-on="$listeners"
                :params="{row: tag.tagStatus}"
            >
            </RecipientPoptip>
            <span class="tag-content" v-show="!tagAttr[index].editting" :title="tag.tagName"  @dblclick="toggleEdit(index,true)">{{tag.tagName}}</span>
            <input :id="type+'input'+index" v-model="tagList[index].tagName" v-show="tagAttr[index].editting" @keyup.enter="editCompleted(index)" @blur.stop="editCompleted(index)"  class="input-inside" type="text">
            <Icon class="mail-deleteemailaddress" type="ios-close" @click="delTag(index)">
            </Icon>
      </Tag>
    </div>
    <div>
        <input
                autocomplete="off"
                v-model.trim="inputValue"
                type="text"
                :id="type+'txt1'"
                class="input-inside"
                @keydown="keyDown($event)"
                :placeholder="placeholder"
                :readonly="readonly"
                :style="{'padding-left': $lang==='en-US'?'5px':'0px','font-size': $lang==='en-US'?'12px':'14px'}"
                @focus="inputFocused"
                @blur="addTag"
                @input="getRelevantAddress"
                @paste="handlePaste">
        <ul class="select-dropdown" v-show="relevantAddress.length && inputValue">
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
  </div>
</template>
<script>
    import Vue from 'vue';
    import { mapState } from 'vuex';
    import util from '@/libs/util';
    // const reg = /<?[a-z0-9]+([.]?[-_a-z0-9]+)*@([a-z0-9]+([.-][a-z0-9]+)*\.)[a-z0-9]+>?/i;
    const reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/i;

    export default {
        name: 'tag_input',
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
                isSelectAddress: false // 是否从联想处点击的
            };
        },
        created() {
            this.getTagArr();
        },
        methods: {
            setFocus(e) {
                if (e.target.getAttribute('id') && !e.target.getAttribute('id').includes('input')) {
                    document.getElementById(`${this.type}txt1`).focus();
                }
            },
            inputFocused() {
                this.$emit('inputFocused');
                this.$emit('changeFocuseToPerson');
            },
            keyDown(event) {
                const keys = [13, 32, 186, 188];
                if (keys.includes(event.keyCode)) {
                    event.preventDefault();
                    this.addTag();
                }
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
    };
</script>
<style lang="less" scoped>
.tag-input{
  border-bottom: 1px solid #EAEAEA;
  cursor: text;
  .tag-list{
      margin-left:12px;
    display: flex;
    flex-wrap: wrap;
    /deep/ .el-tag {
        display: flex;
        align-items: center;
        cursor: pointer;
        margin-right:8px;
      }
    .tag-content{
      float: left;
      max-width: 290px;
      color: rgba(0, 0, 0, .8);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0 5px;
    }
  }
  .el-tag{
    margin: 10px 4px 0 0;
    max-width: 100% !important;
    .ivu-icon-ios-close {
      font-size: 20px;
      top: 1px;
      color: #666;
      opacity: .66;
    }
  }
  .ivu-tag-error{
    border: 1px solid #ed4014;
  }
  .input-inside{
    border: 1px solid transparent;
    width: 390px;
  }
  .input-inside:focus{
    outline: 0;
  }
  .keyword {
        color: #4285F4;
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

</style>

