<template>
    <div class="tag-input" @click="setFocus">
<!--        <div class="form-title-font form-label" style="line-height:24px;">{{title}}</div>-->
        <div slot="prefix" class="tag-list">
            <Tag :color="tagAttr[index].isEmail?'#f7f7f7':'#ed4014'" v-for="(tag,index) in tagList" :key="index">
<!--                <RecipientPoptip-->
<!--                        fromFlag="tagInput"-->
<!--                        v-if="fromFlag === 'writeMail'"-->
<!--                        :currentInquiryId="tag.tagStatus ? tag.tagStatus.inquiryId: ''"-->
<!--                        v-bind="$attrs"-->
<!--                        v-on="$listeners"-->
<!--                        :params="{row: tag.tagStatus}"-->
<!--                >-->
<!--                </RecipientPoptip>-->
                <span class="tag-content" v-show="!tagAttr[index].editting" :title="tag.tagName"  @dblclick="toggleEdit(index,true)">{{tag.tagName}}</span>
                <input :id="type+'input'+index" v-model="tagList[index].tagName" v-show="tagAttr[index].editting" @keyup.enter="editCompleted(index)" @blur.stop="editCompleted(index)"  class="input-inside" type="text">
                <Icon class="mail-deleteemailaddress" type="ios-close" @click="delTag(index)">
                </Icon>
            </Tag>
        </div>
        <input v-model.trim="inputValue" type="text" :id="type+'txt1'" class="input-inside" @keydown="keyDown($event)" @blur="addTag" :placeholder="placeholder" :readonly="readonly"   @focus="inputFocused">
    </div>
</template>
<script>
    const reg = /<?[a-z0-9]+([.]?[-_a-z0-9]+)*@([a-z0-9]+([.-][a-z0-9]+)*\.)[a-z0-9]+>?/i;
    export default {
        name: 'addressee-input',
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
            }
        },
        data() {
            return {
                inputValue: '',
                tagAttr: [],
                tagList: [] // 经过处理后的数组
            };
        },
        created() {
            this.getTagArr();
        },
        methods: {
            setFocus(e) {
                console.log('setFocus()------', e.target.getAttribute('id'));
                if (e.target.getAttribute('id') && !e.target.getAttribute('id').includes('input')) {
                    document.getElementById(`${this.type}txt1`).focus();
                    console.log('clicked on input');
                }
            },
            inputFocused() {
                this.$emit('inputFocused');
                this.$emit('changeFocuseToPerson');
                console.log('focused on input');
            },
            keyDown(event) {
                const keys = [13, 32, 186, 188];
                if (keys.includes(event.keyCode)) {
                    event.preventDefault();
                    this.addTag();
                }
            },
            addTag() {
                // const startIndex = -1;
                // const endIndex = -1;
                if (this.inputValue === '') {
                    return;
                }
                /**
                 * @Description: 邮箱收件人去重逻辑修改为只要邮箱地址部分重复，即判为同一个邮箱，默认保留第一个
                 *                 如客户a<xhl@163.com>， 客户b<xhl@163.com>，xhl@163.com为重复邮箱，保留邮箱--客户a<xhl@163.com>
                 * @author 杨娣
                 * @date 2019/10/15
                 */
                if (this.fromFlag === 'writeMail') {
                    const val = this.getStandardEmail(this.inputValue);
                    for (let item of this.taglist) {
                        item = this.getStandardEmail(item);
                        if (item === val) {
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
                 * @Description: 写信页面支持一键批量复制邮箱
                 * @author wanghongzhu
                 * @date 2020/4/21
                 */
                // 将;；、，,统一替换为,
                const inputStr1 = this.inputValue.replace(/，/g, ',').replace(/；/g, ',').replace(/、/g, ',').replace(/;/g, ',');
                // 将多个空格替换为一个,并分割为数组
                const inputArr = inputStr1.replace(/\s+/ig, ',').split(',');
                // 将数组去重并转为字符串
                let inputStr2 = String([...new Set(list.concat(inputArr))]);
                // 超出字符限制提示语
                if (inputStr2.length >= 3800) {
                    inputStr2 = inputStr2.slice(0, 3799);
                    this.$Message({
                        message: `当前${this.title}输入的信息超出字符限制，超出上限的部分则不保存`,
                        type: 'warning',
                        duration: 3000
                    });
                }
                list = inputStr2.replace(/\s+/ig, ',').split(',').filter(function(e) { return e; });
                // 先注释
                // list.push(this.inputValue);
                // --------------------cut-off---------------------
                this.$emit('update:taglist', list);
                this.$emit('addTag', this.inputValue);
                this.inputValue = '';
            },
            delTag(index) {
                const list = [...this.taglist];
                list.splice(index, 1);
                this.$emit('update:taglist', list);
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
                console.log('editted');
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
                console.log(newArr);
                for (let i = 0; i < newArr.length; i++) {
                    if (res.findIndex(item => item === newArr[i]) === -1) {
                        res.push(newArr[i]);
                    } else {
                        list.splice(i, 1);
                    }
                }
                console.log(list);
                this.$emit('update:taglist', list);
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
                    let isEmail;
                    // isEmail = reg.test(tag);
                    isEmail = Boolean(this.getStandardEmail(tag));
                    console.log('getTagArr()-------', isEmail);
                    return {
                        isEmail,
                        editting: false
                    };
                });
            },
            /* 获取标准格式的邮箱 */
            getStandardEmail(emailAdd) {
                console.log(emailAdd);
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
                    obj.tagStatus = this.row.find(rowData => rowData.email === email);
                    return obj;
                });
                this.tagList = res;
            },
            /* 获取标准格式的邮箱 */
            getStandardEmail(emailAdd) {
                if (emailAdd && emailAdd.lastIndexOf('<') !== -1) {
                    const startIndex = emailAdd.lastIndexOf('<');
                    return emailAdd.slice(startIndex + 1, emailAdd.length - 1);
                } else {
                    return emailAdd;
                }
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
        display: inline-block;
        width: 90%;
        .tag-list{
            margin-left: 12px;
            display: flex;
            flex-wrap: wrap;
            overflow: auto;
            max-height: 100px;
            /deep/ .el-tag {
                display: flex;
                align-items: center;
                cursor: pointer;
            }
            .tag-content{
                float: left;
                max-width: 290px;
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
                top: 1px;
            }
        }
        .ivu-tag-error{
            border: 1px solid #ed4014;
        }
        .input-inside{
            border: 1px solid transparent;
            width: 100%;
            // width: 400px;
        }
        .input-inside:focus{
            outline: 0;
        }
    }

</style>

